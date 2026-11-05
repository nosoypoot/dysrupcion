export interface Registration {
  nombre: string;
  email: string;
  whatsapp: string;
  linkedin: string;
  motivacion: string;
  github?: string;
  origen?: string;
  expertise?: string;
  referred_by?: string;
  contrato: boolean;
  directorio?: boolean;
}

type Validation = { ok: true; data: Registration } | { ok: false; error: string };

/** Shared by the real Cloudflare registration and the isolated review endpoint. */
export function validateRegistration(input: unknown): Validation {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "La solicitud debe ser un objeto JSON" };
  }
  const values = { ...input } as Record<string, unknown>;
  const limits: Record<string, number> = {
    nombre: 160, email: 254, whatsapp: 30, linkedin: 500, github: 500,
    origen: 30, expertise: 200, referred_by: 160, motivacion: 3000,
  };
  for (const [field, max] of Object.entries(limits)) {
    if (values[field] === undefined) continue;
    if (typeof values[field] !== "string" || values[field].length > max) {
      return { ok: false, error: `Revisa el campo ${field} (máximo ${max} caracteres)` };
    }
    values[field] = values[field].trim();
  }
  const required = ["nombre", "email", "whatsapp", "linkedin", "motivacion"];
  const missing = required.filter(field => !values[field]);
  if (missing.length) {
    return { ok: false, error: `Faltan campos requeridos: ${missing.join(", ")}` };
  }
  const body = values as unknown as Registration;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return { ok: false, error: "Escribe un correo electrónico válido" };
  }
  body.email = body.email.toLowerCase();
  if (!/^[+\d() .-]{7,30}$/.test(body.whatsapp) || body.whatsapp.replace(/\D/g, "").length < 7) {
    return { ok: false, error: "Escribe un número de WhatsApp válido, con código de país" };
  }
  for (const field of ["linkedin", "github"] as const) {
    if (!body[field]) continue;
    try {
      const url = new URL(body[field]);
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Invalid protocol");
    } catch {
      return { ok: false, error: `Escribe una URL válida en ${field}` };
    }
  }
  if (body.origen && !["local", "nacional", "extranjero"].includes(body.origen)) {
    return { ok: false, error: "Selecciona una opción de origen válida" };
  }
  if (body.directorio !== undefined && typeof body.directorio !== "boolean") {
    return { ok: false, error: "La autorización del directorio debe ser explícita" };
  }
  if (body.contrato !== true) {
    return { ok: false, error: "Debes aceptar el código de conducta para continuar" };
  }
  return { ok: true, data: body };
}
