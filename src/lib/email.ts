import type { Env } from "../index";

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export async function sendEmail(env: Env, input: SendEmailInput): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not configured; skipping send to", input.to);
    return;
  }

  const payload: Record<string, unknown> = {
    from: env.FROM_EMAIL,
    to: input.to,
    subject: input.subject,
    text: input.text,
  };
  if (input.html) payload.html = input.html;
  if (input.replyTo) payload.reply_to = input.replyTo;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[email] Resend ${res.status}: ${body}`);
    throw new Error(`Resend ${res.status}: ${body}`);
  }
}
