import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/resend.ts";

// Resend delivers webhooks signed with the Svix scheme:
//   signature payload = `${svix-id}.${svix-timestamp}.${body}`
//   header format     = "v1,<base64 hmac>" (space separated list)
async function verifySignature(secret: string, req: Request, rawBody: string): Promise<boolean> {
  const id = req.headers.get("svix-id");
  const timestamp = req.headers.get("svix-timestamp");
  const signatureHeader = req.headers.get("svix-signature");
  if (!id || !timestamp || !signatureHeader) return false;

  // Reject replays older than 5 minutes.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const keyBytes = Uint8Array.from(atob(secret.replace(/^whsec_/, "")), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${timestamp}.${rawBody}`));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));

  return signatureHeader
    .split(" ")
    .some((part) => part.split(",")[1] === expected);
}

const TRACKED = new Set([
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.opened",
  "email.clicked",
  "email.bounced",
  "email.complained",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rawBody = await req.text();
  const secret = Deno.env.get("RESEND_WEBHOOK_SECRET");

  if (secret) {
    const valid = await verifySignature(secret, req, rawBody);
    if (!valid) {
      console.error("Rejected Resend webhook: invalid signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } else {
    console.warn("RESEND_WEBHOOK_SECRET not set — accepting webhook without signature verification");
  }

  try {
    const event = JSON.parse(rawBody) as {
      type?: string;
      created_at?: string;
      data?: {
        email_id?: string;
        to?: string[];
        subject?: string;
        click?: unknown;
        bounce?: unknown;
      };
    };

    const type = event.type ?? "unknown";
    if (!TRACKED.has(type)) {
      return new Response(JSON.stringify({ ignored: type }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const recipient = event.data?.to?.[0];
    if (!recipient) {
      return new Response(JSON.stringify({ ignored: "no recipient" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Correlate back to a lead by email address (case-insensitive).
    const { data: lead } = await supabase
      .from("leads")
      .select("id")
      .ilike("email", recipient)
      .maybeSingle();

    const messageId = event.data?.email_id ?? null;
    const occurredAt = event.created_at ?? new Date().toISOString();

    const { error: insertError } = await supabase.from("email_events").insert({
      provider_message_id: messageId,
      event_type: type.replace("email.", ""),
      recipient_email: recipient,
      subject: event.data?.subject ?? null,
      lead_id: lead?.id ?? null,
      metadata: { click: event.data?.click ?? null, bounce: event.data?.bounce ?? null },
      occurred_at: occurredAt,
    });
    // Duplicate deliveries are expected (webhooks retry) — the unique index absorbs them.
    if (insertError && insertError.code !== "23505") {
      console.error("Failed to store email event:", insertError.message);
    }

    // Reflect the latest state on the outreach entry that produced the email.
    if (messageId) {
      await supabase
        .from("outreach_log")
        .update({ status: type.replace("email.", "") })
        .eq("provider_message_id", messageId);
    }

    // Hard failures stop future marketing to that address.
    if (type === "email.bounced" || type === "email.complained") {
      const { error: suppressError } = await supabase
        .from("leads")
        .update({
          email_status: type === "email.bounced" ? "bounced" : "complained",
          marketing_opt_in: false,
        })
        .ilike("email", recipient);
      if (suppressError) console.error("Failed to suppress address:", suppressError.message);
      console.log(`Suppressed ${type} address`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("resend-webhook error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
