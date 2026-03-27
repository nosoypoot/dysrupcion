// ── Types ──────────────────────────────────────────────────────────────────

export type Origin = "local" | "foraneo" | "extranjero";
export type Track = "Eventos" | "Educacion" | "Emprendimiento" | "Impacto Local" | "Puente";
export type MemberStatus = "active" | "inactive" | "pending";
export type InitiativeStatus = "draft" | "active" | "completed" | "paused";
export type EventPlatform = "lu.ma" | "meetup.com" | "partiful";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  expertise: string[];
  origin: Origin;
  track: Track;
  status: MemberStatus;
  joined_at: string;
  public_consent: boolean;
}

export interface Initiative {
  id: string;
  title: string;
  problem: string;
  beneficiary: string;
  co_lead_local: string;
  resources_needed: string[];
  track: Track;
  status: InitiativeStatus;
  proposer_name: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  source_url: string;
  source_platform: EventPlatform;
  track: Track;
  image_url: string;
}

export interface Metrics {
  total_members: number;
  members_by_origin: Record<Origin, number>;
  members_by_track: Record<Track, number>;
  active_initiatives: number;
  upcoming_events: number;
}

// ── Mock Members ───────────────────────────────────────────────────────────

export const members: Member[] = [
  {
    id: "m-001",
    name: "Maria Lopez",
    email: "maria@example.com",
    role: "Full-Stack Developer",
    expertise: ["React", "Node.js", "PostgreSQL"],
    origin: "local",
    track: "Educacion",
    status: "active",
    joined_at: "2025-08-15",
    public_consent: true,
  },
  {
    id: "m-002",
    name: "Carlos Balam",
    email: "carlos.balam@example.com",
    role: "Data Scientist",
    expertise: ["Python", "Machine Learning", "Data Visualization"],
    origin: "local",
    track: "Emprendimiento",
    status: "active",
    joined_at: "2025-09-01",
    public_consent: true,
  },
  {
    id: "m-003",
    name: "Juan Pech",
    email: "juan.pech@example.com",
    role: "DevOps Engineer",
    expertise: ["AWS", "Terraform", "Docker"],
    origin: "local",
    track: "Impacto Local",
    status: "active",
    joined_at: "2025-09-10",
    public_consent: false,
  },
  {
    id: "m-004",
    name: "Sofia Medina",
    email: "sofia.medina@example.com",
    role: "Product Designer",
    expertise: ["Figma", "User Research", "Design Systems"],
    origin: "foraneo",
    track: "Educacion",
    status: "active",
    joined_at: "2025-10-05",
    public_consent: true,
  },
  {
    id: "m-005",
    name: "Roberto Chan",
    email: "roberto.chan@example.com",
    role: "Startup Founder",
    expertise: ["SaaS", "Growth Strategy", "Fundraising"],
    origin: "local",
    track: "Emprendimiento",
    status: "active",
    joined_at: "2025-10-20",
    public_consent: true,
  },
  {
    id: "m-006",
    name: "Andrea Gutierrez",
    email: "andrea.g@example.com",
    role: "UX Researcher",
    expertise: ["Usability Testing", "Qualitative Research", "Accessibility"],
    origin: "foraneo",
    track: "Eventos",
    status: "active",
    joined_at: "2025-11-01",
    public_consent: true,
  },
  {
    id: "m-007",
    name: "James Richardson",
    email: "james.r@example.com",
    role: "Backend Engineer",
    expertise: ["Go", "Distributed Systems", "Kubernetes"],
    origin: "extranjero",
    track: "Puente",
    status: "active",
    joined_at: "2025-11-15",
    public_consent: true,
  },
  {
    id: "m-008",
    name: "Kenji Tanaka",
    email: "kenji.t@example.com",
    role: "AI/ML Engineer",
    expertise: ["PyTorch", "NLP", "Computer Vision"],
    origin: "extranjero",
    track: "Puente",
    status: "pending",
    joined_at: "2025-12-01",
    public_consent: false,
  },
  {
    id: "m-009",
    name: "Laura Canul",
    email: "laura.canul@example.com",
    role: "Community Manager",
    expertise: ["Event Planning", "Social Media", "Partnerships"],
    origin: "local",
    track: "Eventos",
    status: "active",
    joined_at: "2025-08-20",
    public_consent: true,
  },
  {
    id: "m-010",
    name: "Diego Herrera",
    email: "diego.h@example.com",
    role: "Mobile Developer",
    expertise: ["React Native", "Swift", "Firebase"],
    origin: "foraneo",
    track: "Impacto Local",
    status: "inactive",
    joined_at: "2025-09-25",
    public_consent: true,
  },
];

// ── Mock Initiatives ───────────────────────────────────────────────────────

export const initiatives: Initiative[] = [
  {
    id: "i-001",
    title: "Merida Tech Meetups Mensuales",
    problem: "No hay eventos regulares de tecnologia en Merida para networking y aprendizaje",
    beneficiary: "Desarrolladores y disenadores locales",
    co_lead_local: "Laura Canul",
    resources_needed: ["Venue", "Proyector", "Snacks budget"],
    track: "Eventos",
    status: "active",
    proposer_name: "Andrea Gutierrez",
  },
  {
    id: "i-002",
    title: "Bootcamp de Desarrollo Web",
    problem: "Falta de capacitacion accesible en desarrollo web para jovenes yucatecos",
    beneficiary: "Estudiantes universitarios y recien egresados",
    co_lead_local: "Maria Lopez",
    resources_needed: ["Instructors", "Online platform", "Mentors"],
    track: "Educacion",
    status: "active",
    proposer_name: "Sofia Medina",
  },
  {
    id: "i-003",
    title: "Incubadora de Startups Yucatan",
    problem: "Emprendedores tech locales carecen de mentoría y acceso a capital",
    beneficiary: "Fundadores de startups en etapa temprana",
    co_lead_local: "Roberto Chan",
    resources_needed: ["Mentors", "Seed funding connections", "Co-working space"],
    track: "Emprendimiento",
    status: "active",
    proposer_name: "Carlos Balam",
  },
  {
    id: "i-004",
    title: "Digitalizacion de Negocios Locales",
    problem: "Pequenos negocios en Merida no tienen presencia digital",
    beneficiary: "Microempresas y negocios familiares",
    co_lead_local: "Juan Pech",
    resources_needed: ["Volunteers", "Website templates", "Training materials"],
    track: "Impacto Local",
    status: "draft",
    proposer_name: "Diego Herrera",
  },
  {
    id: "i-005",
    title: "Remote Work Bridge Program",
    problem: "Professionals relocating to Merida lack local community integration",
    beneficiary: "Remote workers and digital nomads in Yucatan",
    co_lead_local: "Carlos Balam",
    resources_needed: ["Welcome guide", "Buddy system", "Spanish classes partnership"],
    track: "Puente",
    status: "active",
    proposer_name: "James Richardson",
  },
];

// ── Mock Events ────────────────────────────────────────────────────────────

export const events: CommunityEvent[] = [
  {
    id: "e-001",
    title: "Merida.js - React Server Components Workshop",
    date: "2026-04-12T18:00:00-06:00",
    location: "Hackerspace Merida, Centro",
    source_url: "https://lu.ma/merida-js-april",
    source_platform: "lu.ma",
    track: "Educacion",
    image_url: "/images/events/merida-js.png",
  },
  {
    id: "e-002",
    title: "Startup Pitch Night Yucatan",
    date: "2026-04-19T19:00:00-06:00",
    location: "Impact Hub Merida",
    source_url: "https://meetup.com/merida-startups/events/pitch-night",
    source_platform: "meetup.com",
    track: "Emprendimiento",
    image_url: "/images/events/pitch-night.png",
  },
  {
    id: "e-003",
    title: "Dysrupcion Community Hangout",
    date: "2026-04-25T17:00:00-06:00",
    location: "Ki'Xocolatl, Paseo Montejo",
    source_url: "https://partiful.com/e/dysrupcion-hangout-april",
    source_platform: "partiful",
    track: "Eventos",
    image_url: "/images/events/hangout.png",
  },
  {
    id: "e-004",
    title: "Data Science for Social Impact",
    date: "2026-05-03T10:00:00-06:00",
    location: "UADY Facultad de Matematicas",
    source_url: "https://lu.ma/ds-social-impact",
    source_platform: "lu.ma",
    track: "Impacto Local",
    image_url: "/images/events/ds-impact.png",
  },
];

// ── Metrics Aggregation ────────────────────────────────────────────────────

export function getMetrics(): Metrics {
  const membersByOrigin: Record<Origin, number> = { local: 0, foraneo: 0, extranjero: 0 };
  const membersByTrack: Record<Track, number> = {
    Eventos: 0,
    Educacion: 0,
    Emprendimiento: 0,
    "Impacto Local": 0,
    Puente: 0,
  };

  for (const m of members) {
    membersByOrigin[m.origin]++;
    membersByTrack[m.track]++;
  }

  const now = new Date().toISOString();

  return {
    total_members: members.length,
    members_by_origin: membersByOrigin,
    members_by_track: membersByTrack,
    active_initiatives: initiatives.filter((i) => i.status === "active").length,
    upcoming_events: events.filter((e) => e.date > now).length,
  };
}
