import type { Env } from "../index";

interface RegisterBody {
  nombre: string;
  email: string;
  whatsapp: string;
  linkedin: string;
  motivacion: string;
  github?: string;
  origen?: string;
  expertise?: string;
  referred_by?: string;
  contrato?: boolean;
  directorio?: boolean;
}

const REQUIRED_FIELDS: (keyof RegisterBody)[] = [
  "nombre",
  "email",
  "whatsapp",
  "linkedin",
  "motivacion",
];

export async function handleRegister(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
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

  if (!body.contrato) {
    return Response.json(
      { error: "Debes aceptar el contrato social para continuar" },
      { status: 400 },
    );
  }

  try {
    const result = await env.DB.prepare(
      `INSERT INTO member_applications
        (nombre, email, whatsapp, linkedin, github, origen, expertise, referred_by, motivacion, acepta_contrato, directorio_publico)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        body.nombre,
        body.email,
        body.whatsapp,
        body.linkedin,
        body.github ?? null,
        body.origen ?? null,
        body.expertise ?? null,
        body.referred_by ?? null,
        body.motivacion,
        1,
        body.directorio ? 1 : 0,
      )
      .run();

    return Response.json(
      {
        ok: true,
        id: result.meta.last_row_id,
        message: "Solicitud recibida. Te contactaremos pronto.",
      },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    if (msg.includes("UNIQUE") && msg.toLowerCase().includes("email")) {
      return Response.json(
        { error: "Ya existe una solicitud con ese email" },
        { status: 409 },
      );
    }
    return Response.json(
      { error: "Error al guardar la solicitud" },
      { status: 500 },
    );
  }
}
