import { members, type Track } from "../lib/mock-data";

export async function handleMembers(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const url = new URL(request.url);
  const trackFilter = url.searchParams.get("track") as Track | null;

  let filtered = members;
  if (trackFilter) {
    filtered = members.filter((m) => m.track === trackFilter);
  }

  return Response.json({ members: filtered });
}
