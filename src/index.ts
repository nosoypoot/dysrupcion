import { handleRegister } from "./routes/register";
import { handleMembers } from "./routes/members";
import { handleInitiatives } from "./routes/initiatives";
import { handleEvents } from "./routes/events";
import { handleMetrics } from "./routes/metrics";
import { handleScrape } from "./routes/scrape";

export interface Env {
  ASSETS: Fetcher;
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function errorResponse(message: string, status: number = 500): Response {
  return Response.json({ error: message }, { status });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // API routes
    if (url.pathname.startsWith("/api/")) {
      try {
        let response: Response;

        switch (url.pathname) {
          case "/api/register":
            response = await handleRegister(request);
            break;
          case "/api/members":
            response = await handleMembers(request);
            break;
          case "/api/initiatives":
            response = await handleInitiatives(request);
            break;
          case "/api/events":
            response = await handleEvents(request);
            break;
          case "/api/events/scrape":
            response = await handleScrape(request);
            break;
          case "/api/metrics":
            response = await handleMetrics(request);
            break;
          default:
            response = errorResponse("Not found", 404);
        }

        return withCors(response);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Internal server error";
        return withCors(errorResponse(message, 500));
      }
    }

    // Static assets are served automatically by Cloudflare
    return env.ASSETS.fetch(request);
  },
};
