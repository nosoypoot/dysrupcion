import type { Member, Origin, Track } from "../lib/mock-data";

interface RegisterBody {
  name: string;
  email: string;
  origin: Origin;
  track: Track;
  role?: string;
  expertise?: string[];
  public_consent?: boolean;
}

const REQUIRED_FIELDS: (keyof RegisterBody)[] = ["name", "email", "origin", "track"];

export async function handleRegister(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: RegisterBody;
  try {
    body = await request.json() as RegisterBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const missing = REQUIRED_FIELDS.filter((f) => !body[f]);
  if (missing.length > 0) {
    return Response.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  // Mock: return a fake created member
  const member: Member = {
    id: `m-${Date.now()}`,
    name: body.name,
    email: body.email,
    role: body.role ?? "Community Member",
    expertise: body.expertise ?? [],
    origin: body.origin,
    track: body.track,
    status: "pending",
    joined_at: new Date().toISOString().split("T")[0],
    public_consent: body.public_consent ?? false,
  };

  return Response.json({ ok: true, member }, { status: 201 });
}
