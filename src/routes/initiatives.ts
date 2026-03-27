import { initiatives, type Initiative, type Track } from "../lib/mock-data";

interface CreateInitiativeBody {
  title: string;
  problem: string;
  beneficiary: string;
  co_lead_local: string;
  resources_needed: string[];
  track: Track;
  proposer_name: string;
}

export async function handleInitiatives(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "GET") {
    const trackFilter = url.searchParams.get("track") as Track | null;
    let filtered = initiatives;
    if (trackFilter) {
      filtered = initiatives.filter((i) => i.track === trackFilter);
    }
    return Response.json({ initiatives: filtered });
  }

  if (request.method === "POST") {
    let body: CreateInitiativeBody;
    try {
      body = await request.json() as CreateInitiativeBody;
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const initiative: Initiative = {
      id: `i-${Date.now()}`,
      title: body.title,
      problem: body.problem,
      beneficiary: body.beneficiary,
      co_lead_local: body.co_lead_local,
      resources_needed: body.resources_needed ?? [],
      track: body.track,
      status: "draft",
      proposer_name: body.proposer_name,
    };

    return Response.json({ ok: true, initiative }, { status: 201 });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
