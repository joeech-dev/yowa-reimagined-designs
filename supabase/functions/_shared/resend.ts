// Shared Resend helpers used by the email automation functions.
const RESEND_API = "https://api.resend.com";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

export function resendKey(): string {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return key;
}

async function resendFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${RESEND_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendKey()}`,
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    console.error(`Resend ${init.method ?? "GET"} ${path} failed [${res.status}]: ${text}`);
  }
  return { ok: res.ok, status: res.status, body: body as Record<string, unknown> | null, raw: text };
}

const audienceCache = new Map<string, string>();

/** Finds an audience by name, creating it when absent. Returns the audience id. */
export async function ensureAudience(name: string): Promise<string | null> {
  const cached = audienceCache.get(name);
  if (cached) return cached;

  const list = await resendFetch("/audiences");
  if (list.ok) {
    const items = (list.body?.data as Array<{ id: string; name: string }> | undefined) ?? [];
    const found = items.find((a) => a.name === name);
    if (found) {
      audienceCache.set(name, found.id);
      return found.id;
    }
  }

  const created = await resendFetch("/audiences", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  const id = created.body?.id as string | undefined;
  if (created.ok && id) {
    audienceCache.set(name, id);
    return id;
  }
  return null;
}

export interface ContactInput {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  unsubscribed?: boolean;
}

/** Upserts a contact into an audience. Returns the Resend contact id when known. */
export async function upsertContact(audienceId: string, contact: ContactInput): Promise<string | null> {
  const res = await resendFetch(`/audiences/${audienceId}/contacts`, {
    method: "POST",
    body: JSON.stringify({
      email: contact.email,
      first_name: contact.firstName ?? undefined,
      last_name: contact.lastName ?? undefined,
      unsubscribed: contact.unsubscribed ?? false,
    }),
  });
  return (res.body?.id as string | undefined) ?? null;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

/** Sends a single email. Returns the provider message id on success. */
export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; id: string | null; error: string | null }> {
  const res = await resendFetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      from: input.from ?? "Yowa Innovations <info@yowa.us>",
      to: [input.to],
      subject: input.subject,
      html: input.html,
      reply_to: input.replyTo ?? "info@yowa.us",
      headers: input.headers,
    }),
  });
  return {
    ok: res.ok,
    id: (res.body?.id as string | undefined) ?? null,
    error: res.ok ? null : res.raw,
  };
}

/** Splits a display name into first/last for Resend contact fields. */
export function splitName(name?: string | null): { firstName: string | null; lastName: string | null } {
  if (!name) return { firstName: null, lastName: null };
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? null,
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
}

/** Audience naming scheme — keeps segments readable inside Resend. */
export const AUDIENCES = {
  allLeads: "Yowa - Website Leads",
  applicants: "Yowa - Job Applicants",
  service: (slug: string) => `Yowa - Service: ${slug}`,
};
