interface ApplicationData {
  id: number;
  nombre: string;
  email: string;
  whatsapp: string;
  linkedin: string;
  github?: string | null;
  origen?: string | null;
  expertise?: string | null;
  motivacion: string;
  referred_by?: string | null;
}

interface InitiativeData {
  id: number;
  title: string;
  tagline: string;
  description: string;
  track: string;
  proposer_name: string;
  proposer_email: string;
  website_url?: string | null;
  looking_for?: string | null;
  public_contact?: string | null;
  launched_at?: string | null;
}

interface RenderedEmail {
  subject: string;
  text: string;
}

const SIGNATURE = "— Comité de Dysrupción";

function line(label: string, value: string | null | undefined): string {
  if (!value) return "";
  return `${label}: ${value}\n`;
}

export function adminNewApplication(siteUrl: string, app: ApplicationData): RenderedEmail {
  return {
    subject: `Nueva solicitud de ingreso — ${app.nombre}`,
    text:
`Llegó una solicitud nueva para entrar a Dysrupción.

${line("Nombre", app.nombre)}${line("Email", app.email)}${line("WhatsApp", app.whatsapp)}${line("LinkedIn", app.linkedin)}${line("GitHub", app.github)}${line("Origen", app.origen)}${line("Rol", app.expertise)}${line("Referido por", app.referred_by)}
Motivación:
${app.motivacion}

Revísala en el panel:
${siteUrl}/admin/

${SIGNATURE}
`,
  };
}

export function adminNewInitiative(siteUrl: string, ini: InitiativeData): RenderedEmail {
  return {
    subject: `Nueva iniciativa propuesta — ${ini.title}`,
    text:
`${ini.proposer_name} propuso una iniciativa nueva para publicar.

${line("Título", ini.title)}${line("Tagline", ini.tagline)}${line("Track", ini.track)}${line("Website", ini.website_url)}${line("Contacto", ini.proposer_email)}${line("Buscan", ini.looking_for)}${line("Contacto público", ini.public_contact)}${line("Lanzamiento", ini.launched_at)}
Descripción:
${ini.description}

Revísala en el panel:
${siteUrl}/admin/

${SIGNATURE}
`,
  };
}

export function applicationApproved(siteUrl: string, app: ApplicationData): RenderedEmail {
  return {
    subject: "Bienvenidx a Dysrupción",
    text:
`Hola ${app.nombre},

Tu solicitud de ingreso a Dysrupción fue aprobada.

El comité te va a contactar pronto con los detalles para sumarte al chat y a las iniciativas en curso.

Estamos construyendo un espacio donde participar no es opcional: se construye, se propone, se actúa. Te esperamos ahí.

Mientras tanto, dale una vuelta al protocolo y al directorio de iniciativas:
${siteUrl}/playbook
${siteUrl}/iniciativas

${SIGNATURE}
`,
  };
}

export function applicationRejected(_siteUrl: string, app: ApplicationData): RenderedEmail {
  return {
    subject: "Sobre tu solicitud a Dysrupción",
    text:
`Hola ${app.nombre},

Gracias por tu interés en Dysrupción. Después de revisar tu solicitud, decidimos no avanzar con ella en este momento.

Esto no es definitivo. La comunidad cambia, y los criterios también. Si más adelante sientes que el contexto es distinto, puedes volver a aplicar.

${SIGNATURE}
`,
  };
}

export function initiativeApproved(siteUrl: string, ini: InitiativeData): RenderedEmail {
  return {
    subject: `Tu iniciativa "${ini.title}" ya está publicada`,
    text:
`Hola ${ini.proposer_name},

Aprobamos la iniciativa "${ini.title}" y ya está publicada en el directorio:
${siteUrl}/iniciativas

Si necesitas editar algo o actualizar el contacto público, responde este correo y lo arreglamos.

${SIGNATURE}
`,
  };
}

export function initiativeRejected(_siteUrl: string, ini: InitiativeData): RenderedEmail {
  return {
    subject: `Sobre tu iniciativa "${ini.title}"`,
    text:
`Hola ${ini.proposer_name},

Recibimos tu propuesta de "${ini.title}" y decidimos no publicarla en el directorio en este momento.

Si quieres conversar sobre los motivos, o hacer ajustes y volver a enviar, responde este correo.

${SIGNATURE}
`,
  };
}
