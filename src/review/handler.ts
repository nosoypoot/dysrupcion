import { validateRegistration } from "../lib/registration";
import { members, initiatives } from "../lib/mock-data";

const MODE = { review: true, stored: false };
const TRACKS = ["Eventos", "Educacion", "Emprendimiento", "Impacto Local", "Puente"];

function json(data: Record<string, unknown>, status = 200): Response {
  return Response.json({ ...data, ...MODE }, {
    status,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}

export function reviewEvents(now = new Date()) {
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  // Dates are illustrative and intentionally remain in the future for reviewers.
  return [
    { title: "Encuentro de comunidad · Ejemplo", offset: 7, track: "Eventos", location: "Mérida · Sede de ejemplo" },
    { title: "Taller de tecnología · Ejemplo", offset: 14, track: "Educacion", location: "En línea · Actividad de ejemplo" },
    { title: "Ideas con impacto local · Ejemplo", offset: 21, track: "Impacto Local", location: "Yucatán · Sede de ejemplo" },
  ].map((event, index) => ({
    id: `review-${index + 1}`, title: event.title, track: event.track,
    location: event.location, date: new Date(start + (event.offset + 1) * 86400000).toISOString(),
    source_url: "", source_platform: "demo", image_url: "",
  }));
}

/** Stateless review API. No persistence, production bindings, emails or outbound requests. */
export async function handleReview(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname === "/api/review"
    ? `/api/${(url.searchParams.get("reviewPath") || "review").replace(/^\/+|\/+$/g, "")}`
    : url.pathname.replace(/\/$/, "");

  if (path.startsWith("/api/admin")) return json({ error: "Administración no disponible en la revisión" }, 404);
  if (request.method !== "GET" && request.method !== "POST") {
    return json({ error: "Método no permitido" }, 405);
  }
  const sampleMembers = members.filter(member => member.public_consent).map(({ email, ...member }) => member);
  const sampleInitiatives = initiatives.filter(item => item.status === "active").map(item => ({
    ...item, title: `${item.title} · Ejemplo`, tagline: item.beneficiary,
    description: item.problem, looking_for: item.resources_needed.join(", "),
  }));

  if (request.method === "GET") {
    switch (path) {
      case "/api/review": return json({ mode: "review", message: "Revisión aislada; no se guardan datos ni se envían correos." });
      case "/api/events": return json({ events: reviewEvents() });
      case "/api/members": return json({ members: sampleMembers.filter(item => !url.searchParams.get("track") || item.track === url.searchParams.get("track")) });
      case "/api/initiatives": return json({ initiatives: sampleInitiatives.filter(item => !url.searchParams.get("track") || item.track === url.searchParams.get("track")) });
      case "/api/metrics": {
        const membersByOrigin = Object.fromEntries(["local", "foraneo", "extranjero"].map(origin => [origin, sampleMembers.filter(member => member.origin === origin).length]));
        const initiativesByTrack = Object.fromEntries(TRACKS.map(track => [track, sampleInitiatives.filter(item => item.track === track).length]));
        return json({ totalMembers: sampleMembers.length, activeInitiatives: sampleInitiatives.length,
          tracksWithCoordinator: 0, eventsThisMonth: reviewEvents().filter(event => event.date.slice(0, 7) === new Date().toISOString().slice(0, 7)).length,
          membersByOrigin, initiativesByTrack });
      }
      default: return json({ error: "Ruta no encontrada" }, 404);
    }
  }

  if (!["/api/register", "/api/initiatives", "/api/events", "/api/events/scrape"].includes(path)) {
    return json({ error: "Ruta no encontrada" }, 404);
  }
  if (path === "/api/events/scrape") {
    return json({ error: "En esta revisión, captura los datos del evento manualmente." }, 422);
  }
  let body: unknown;
  try { body = await request.json(); }
  catch { return json({ error: "JSON inválido" }, 400); }
  if (path === "/api/register") {
    const result = validateRegistration(body);
    if (!result.ok) return json({ error: result.error }, 400);
    return json({ ok: true, message: "Solicitud de prueba validada. No se guardaron datos ni se enviaron correos." });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ error: "Revisa los datos del formulario" }, 400);
  }
  const values = body as Record<string, unknown>;
  if (path === "/api/initiatives") {
    const required = ["title", "tagline", "description", "track", "proposer_name", "proposer_email"];
    if (required.some(field => typeof values[field] !== "string" || !values[field].trim()) || !TRACKS.includes(String(values.track))) {
      return json({ error: "Completa los campos requeridos y selecciona un track válido" }, 400);
    }
  } else {
    const title = values.title || values["título"];
    const date = values.date || values.fecha;
    if (typeof title !== "string" || !title.trim() || typeof date !== "string" || !Number.isFinite(Date.parse(date))) {
      return json({ error: "Escribe el título y una fecha válida" }, 400);
    }
  }
  return json({ ok: true, message: "Prueba completada. No se publicó ni se guardó información." });
}
