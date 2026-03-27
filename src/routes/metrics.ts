import { getMetrics } from "../lib/mock-data";

export async function handleMetrics(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  return Response.json({ metrics: getMetrics() });
}
