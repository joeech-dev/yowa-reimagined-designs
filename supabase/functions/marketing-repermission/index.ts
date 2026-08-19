// Sends a one-off re-permission ("do you still want to hear from us?") email to
// contacts collected before consent tracking existed. Nobody is added to a Resend
// audience here — only a confirmed click records consent.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { corsHeaders, sendEmail } from "../_shared/resend.ts";
import { signOptIn } from "../_shared/optin-token.ts";

const SITE_URL = "https://yowa.us";
const FUNCTIONS_URL = `${Deno.env.get("SUPABASE_URL") ?? ""}/functions/v1`;

const BodySchema = z.object({
  dry_run: z.boolean().default(false),
  limit: z.number().int().min(1).max(500).default(200),
  resend_after_days: z.number().int().min(1).max(365).default(30),
});

function emailHtml(name: string | null, confirmUrl: string) {
  const greeting = name ? `Hi ${name.split(/\s+/)[0]},` : "Hello,";
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;line-height:1.6">
    <h2 style="color:#007e5d;margin-bottom:16px">Do you still want to hear from us?</h2>
    <p>${greeting}</p>
    <p>You previously got in touch with <strong>Yowa Innovations</strong>. We're tidying up our
    mailing list and we only want to email people who have clearly said yes.</p>
    <p>If you'd like occasional updates on our work, insights and opportunities, confirm below:</p>
    <p style="margin:28px 0">
      <a href="${confirmUrl}" style="background:#007e5d;color:#ffffff;text-decoration:none;padding:14px 26px;border-radius:6px;font-weight:bold;display:inline-block">
        Yes, keep me updated
      </a>
    </p>
    <p style="font-size:13px;color:#6b7280">If you do nothing, you won't receive any marketing emails from us —
    no further action is needed. We'll still reply to you directly about any enquiry you send us.</p>
    <p style="font-size:13px;color:#6b7280">Yowa Innovations &middot; <a href="${SITE_URL}" style="color:#007e5d">yowa.us</a>
    &middot; <a href="${SITE_URL}/privacy-policy" style="color:#007e5d">Privacy Policy</a></p>
  </div>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: userData, error: userError } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userData.user.id);
    const allowed = (roles ?? []).some((r: { role: string }) =>
      ["admin", "super_admin", "sales_marketing"].includes(r.role)
    );
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = BodySchema.safeParse(req.method === "POST" ? await req.json().catch(() => ({})) : {});
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { dry_run, limit, resend_after_days } = parsed.data;

    const cutoff = new Date(Date.now() - resend_after_days * 86400000).toISOString();

    const { data: leads, error } = await admin
      .from("leads")
      .select("id, name, email, marketing_opt_in, email_status, repermission_sent_at")
      .eq("marketing_opt_in", false)
      .not("email_status", "in", '("bounced","complained")')
      .order("created_at", { ascending: true })
      .limit(limit);
    if (error) throw new Error(error.message);

    // De-duplicate by address and skip anyone mailed recently.
    const seen = new Set<string>();
    const targets = (leads ?? []).filter((l) => {
      const email = (l.email ?? "").toLowerCase();
      if (!email || seen.has(email)) return false;
      if (l.repermission_sent_at && l.repermission_sent_at > cutoff) return false;
      seen.add(email);
      return true;
    });

    if (dry_run) {
      return new Response(JSON.stringify({ dry_run: true, eligible: targets.length }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    const failures: string[] = [];

    for (const lead of targets) {
      const token = await signOptIn(lead.id, lead.email);
      const confirmUrl = `${FUNCTIONS_URL}/marketing-optin-confirm?lead=${lead.id}&t=${token}`;
      const result = await sendEmail({
        to: lead.email,
        subject: "Do you still want to hear from Yowa Innovations?",
        html: emailHtml(lead.name, confirmUrl),
      });

      if (result.ok) {
        sent++;
        await admin.from("leads").update({ repermission_sent_at: new Date().toISOString() }).eq("id", lead.id);
        await admin.from("outreach_log").insert({
          lead_id: lead.id,
          channel: "email",
          subject: "Re-permission request",
          message_content: "Consent re-permission campaign",
          status: "sent",
          sent_at: new Date().toISOString(),
          provider_message_id: result.id,
        });
      } else {
        failures.push(lead.id);
      }
    }

    return new Response(JSON.stringify({ eligible: targets.length, sent, failed: failures.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("marketing-repermission error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
