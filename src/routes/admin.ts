import type { Env } from "../index";
import { sendEmail } from "../lib/email";
import {
  applicationApproved,
  applicationRejected,
  initiativeApproved,
  initiativeRejected,
} from "../lib/email-templates";

interface AdminUser {
  email: string;
}

// NOTE: Trust comes from Cloudflare Access stripping/replacing this header
// before the request hits the Worker. For this to be secure, /api/admin/*
// MUST be fronted by an Access application. As a follow-up, verify the
// Cf-Access-Jwt-Assertion JWT signature against the team's JWKS — that
// catches the case where someone hits the raw workers.dev URL.
function getAdminUser(request: Request): AdminUser | null {
  const email = request.headers.get("Cf-Access-Authenticated-User-Email");
  if (!email) return null;
  return { email };
}

function unauthorized(): Response {
  return Response.json(
    { error: "No autorizado. Esta ruta requiere login a través de Cloudflare Access." },
    { status: 401 },
  );
}

function notFound(): Response {
  return Response.json({ error: "Recurso no encontrado" }, { status: 404 });
}

const APPLICATION_REVIEW_RE = /^\/api\/admin\/applications\/(\d+)\/(approve|reject)$/;
const INITIATIVE_REVIEW_RE = /^\/api\/admin\/initiatives\/(\d+)\/(approve|reject)$/;

export async function handleAdmin(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const admin = getAdminUser(request);
  if (!admin) return unauthorized();

  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === "GET" && path === "/api/admin/me") {
    return Response.json({ email: admin.email });
  }

  if (method === "GET" && path === "/api/admin/applications") {
    return listApplications(env, url);
  }

  const appMatch = path.match(APPLICATION_REVIEW_RE);
  if (method === "POST" && appMatch) {
    return reviewApplication(
      env,
      ctx,
      Number(appMatch[1]),
      appMatch[2] as "approve" | "reject",
      admin,
    );
  }

  if (method === "GET" && path === "/api/admin/initiatives") {
    return listInitiatives(env, url);
  }

  const initMatch = path.match(INITIATIVE_REVIEW_RE);
  if (method === "POST" && initMatch) {
    return reviewInitiative(
      env,
      ctx,
      Number(initMatch[1]),
      initMatch[2] as "approve" | "reject",
      admin,
    );
  }

  return notFound();
}

async function listApplications(env: Env, url: URL): Promise<Response> {
  const statusFilter = url.searchParams.get("status") ?? "pending";
  const { results } = await env.DB.prepare(
    `SELECT id, nombre, email, whatsapp, linkedin, github, origen, expertise,
            motivacion, referred_by, directorio_publico, status, created_at,
            reviewed_at, reviewed_by
       FROM member_applications
      WHERE status = ?
      ORDER BY created_at DESC`,
  )
    .bind(statusFilter)
    .all();
  return Response.json({ applications: results ?? [] });
}

async function reviewApplication(
  env: Env,
  ctx: ExecutionContext,
  id: number,
  action: "approve" | "reject",
  admin: AdminUser,
): Promise<Response> {
  const newStatus = action === "approve" ? "approved" : "rejected";

  const row = await env.DB.prepare(
    `SELECT id, nombre, email, whatsapp, linkedin, github, origen, expertise,
            motivacion, referred_by, status
       FROM member_applications WHERE id = ?`,
  )
    .bind(id)
    .first<{
      id: number;
      nombre: string;
      email: string;
      whatsapp: string;
      linkedin: string;
      github: string | null;
      origen: string | null;
      expertise: string | null;
      motivacion: string;
      referred_by: string | null;
      status: string;
    }>();

  if (!row) {
    return Response.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }

  const result = await env.DB.prepare(
    `UPDATE member_applications
        SET status = ?, reviewed_at = datetime('now'), reviewed_by = ?
      WHERE id = ?`,
  )
    .bind(newStatus, admin.email, id)
    .run();

  if (!result.success) {
    return Response.json({ error: "No se pudo actualizar la solicitud" }, { status: 500 });
  }

  if (row.status !== newStatus) {
    const tmpl = action === "approve" ? applicationApproved : applicationRejected;
    const email = tmpl(env.SITE_URL, row);
    ctx.waitUntil(
      sendEmail(env, {
        to: row.email,
        subject: email.subject,
        text: email.text,
      }).catch((err) =>
        console.error(`[email] application ${action} notice failed:`, err),
      ),
    );
  }

  return Response.json({ ok: true, id, status: newStatus });
}

async function listInitiatives(env: Env, url: URL): Promise<Response> {
  const statusFilter = url.searchParams.get("review_status") ?? "pending";
  const { results } = await env.DB.prepare(
    `SELECT id, title, tagline, description, track, proposer_name, proposer_email,
            website_url, logo_url, looking_for, public_contact, launched_at,
            submitted_at, review_status, reviewed_at, reviewed_by, published_at, status
       FROM initiatives
      WHERE review_status = ?
      ORDER BY submitted_at DESC`,
  )
    .bind(statusFilter)
    .all();
  return Response.json({ initiatives: results ?? [] });
}

async function reviewInitiative(
  env: Env,
  ctx: ExecutionContext,
  id: number,
  action: "approve" | "reject",
  admin: AdminUser,
): Promise<Response> {
  const row = await env.DB.prepare(
    `SELECT id, title, tagline, description, track, proposer_name, proposer_email,
            website_url, looking_for, public_contact, launched_at, review_status
       FROM initiatives WHERE id = ?`,
  )
    .bind(id)
    .first<{
      id: number;
      title: string;
      tagline: string;
      description: string;
      track: string;
      proposer_name: string;
      proposer_email: string;
      website_url: string | null;
      looking_for: string | null;
      public_contact: string | null;
      launched_at: string | null;
      review_status: string;
    }>();

  if (!row) {
    return Response.json({ error: "Iniciativa no encontrada" }, { status: 404 });
  }

  const newReviewStatus = action === "approve" ? "approved" : "rejected";

  const update =
    action === "approve"
      ? env.DB.prepare(
          `UPDATE initiatives
              SET review_status = 'approved',
                  reviewed_at = datetime('now'),
                  reviewed_by = ?,
                  published_at = COALESCE(published_at, datetime('now'))
            WHERE id = ?`,
        ).bind(admin.email, id)
      : env.DB.prepare(
          `UPDATE initiatives
              SET review_status = 'rejected', reviewed_at = datetime('now'), reviewed_by = ?
            WHERE id = ?`,
        ).bind(admin.email, id);

  const result = await update.run();
  if (!result.success) {
    return Response.json({ error: "No se pudo actualizar la iniciativa" }, { status: 500 });
  }

  if (row.review_status !== newReviewStatus) {
    const tmpl = action === "approve" ? initiativeApproved : initiativeRejected;
    const email = tmpl(env.SITE_URL, row);
    ctx.waitUntil(
      sendEmail(env, {
        to: row.proposer_email,
        subject: email.subject,
        text: email.text,
      }).catch((err) =>
        console.error(`[email] initiative ${action} notice failed:`, err),
      ),
    );
  }

  return Response.json({ ok: true, id, review_status: newReviewStatus });
}
