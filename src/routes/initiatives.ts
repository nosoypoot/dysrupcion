import type { Env } from "../index";
import { sendEmail } from "../lib/email";
import { adminNewInitiative } from "../lib/email-templates";

const TRACKS = [
  "Eventos",
  "Educacion",
  "Emprendimiento",
  "Impacto Local",
  "Puente",
] as const;
type Track = (typeof TRACKS)[number];

interface InitiativeRow {
  id: number;
  title: string;
  tagline: string;
  description: string;
  track: Track;
  proposer_name: string;
  website_url: string | null;
  logo_url: string | null;
  looking_for: string | null;
  public_contact: string | null;
  launched_at: string | null;
  published_at: string | null;
  status: "active" | "paused" | "completed";
}

interface CreateInitiativeBody {
  title: string;
  tagline: string;
  description: string;
  track: Track;
  proposer_name: string;
  proposer_email: string;
  website_url?: string;
  logo_url?: string;
  looking_for?: string;
  public_contact?: string;
  launched_at?: string;
}

const REQUIRED_FIELDS: (keyof CreateInitiativeBody)[] = [
  "title",
  "tagline",
  "description",
  "track",
  "proposer_name",
  "proposer_email",
];

export async function handleInitiatives(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "GET") {
    const trackFilter = url.searchParams.get("track");
    const baseQuery = `
      SELECT id, title, tagline, description, track, proposer_name,
             website_url, logo_url, looking_for, public_contact,
             launched_at, published_at, status
        FROM initiatives
       WHERE review_status = 'approved'
         AND status != 'completed'
    `;

    const stmt = trackFilter
      ? env.DB.prepare(baseQuery + " AND track = ? ORDER BY submitted_at DESC").bind(trackFilter)
      : env.DB.prepare(baseQuery + " ORDER BY submitted_at DESC");

    const { results } = await stmt.all<InitiativeRow>();
    return Response.json({ initiatives: results ?? [] });
  }

  if (request.method === "POST") {
    let body: CreateInitiativeBody;
    try {
      body = (await request.json()) as CreateInitiativeBody;
    } catch {
      return Response.json({ error: "JSON inválido" }, { status: 400 });
    }

    const missing = REQUIRED_FIELDS.filter((f) => !body[f]);
    if (missing.length > 0) {
      return Response.json(
        { error: `Faltan campos requeridos: ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    if (!TRACKS.includes(body.track)) {
      return Response.json(
        { error: `Track inválido. Opciones: ${TRACKS.join(", ")}` },
        { status: 400 },
      );
    }

    try {
      const result = await env.DB.prepare(
        `INSERT INTO initiatives
          (title, tagline, description, track, proposer_name, proposer_email,
           website_url, logo_url, looking_for, public_contact, launched_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          body.title,
          body.tagline,
          body.description,
          body.track,
          body.proposer_name,
          body.proposer_email,
          body.website_url ?? null,
          body.logo_url ?? null,
          body.looking_for ?? null,
          body.public_contact ?? null,
          body.launched_at ?? null,
        )
        .run();

      const newId = result.meta.last_row_id ?? 0;
      const email = adminNewInitiative(env.SITE_URL, {
        id: newId,
        title: body.title,
        tagline: body.tagline,
        description: body.description,
        track: body.track,
        proposer_name: body.proposer_name,
        proposer_email: body.proposer_email,
        website_url: body.website_url ?? null,
        looking_for: body.looking_for ?? null,
        public_contact: body.public_contact ?? null,
        launched_at: body.launched_at ?? null,
      });
      ctx.waitUntil(
        sendEmail(env, {
          to: env.ADMIN_EMAIL,
          subject: email.subject,
          text: email.text,
          replyTo: body.proposer_email,
        }).catch((err) => console.error("[email] admin notice (initiative) failed:", err)),
      );

      return Response.json(
        {
          ok: true,
          id: newId,
          message: "Iniciativa recibida. La revisaremos y te avisamos cuando se publique.",
        },
        { status: 201 },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      return Response.json(
        { error: "Error al guardar la iniciativa", detail: msg },
        { status: 500 },
      );
    }
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
