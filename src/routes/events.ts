import { events, type CommunityEvent, type EventPlatform, type Track } from "../lib/mock-data";

interface CreateEventBody {
  title: string;
  date: string;
  location: string;
  source_url: string;
  source_platform: EventPlatform;
  track: Track;
  image_url?: string;
}

export async function handleEvents(request: Request): Promise<Response> {
  if (request.method === "GET") {
    const now = new Date().toISOString();
    const upcoming = events.filter((e) => e.date > now);
    return Response.json({ events: upcoming });
  }

  if (request.method === "POST") {
    let body: CreateEventBody;
    try {
      body = await request.json() as CreateEventBody;
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const event: CommunityEvent = {
      id: `e-${Date.now()}`,
      title: body.title,
      date: body.date,
      location: body.location,
      source_url: body.source_url,
      source_platform: body.source_platform,
      track: body.track,
      image_url: body.image_url ?? "",
    };

    return Response.json({ ok: true, event }, { status: 201 });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
