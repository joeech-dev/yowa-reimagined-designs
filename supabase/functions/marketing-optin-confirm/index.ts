// Public landing endpoint for the re-permission email. A valid HMAC token records
// consent and syncs the contact into the correct Resend audience.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AUDIENCES, corsHeaders, ensureAudience, splitName, upsertContact } from "../_shared/resend.ts";
import { verifyOptIn } from "../_shared/optin-token.ts";

const SITE_URL = "https://yowa.us";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function page(title: string, message: string, ok: boolean) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
     <meta name="viewport" content="width=device-width,initial-scale=1">
     <meta name="robots" content="noindex">
     <title>${title} | Yowa Innovations</title></head>
     <body style="margin:0;font-family:Arial,Helvetica,sans-serif;background:#f7f7f5;display:flex;min-height:100vh;align-items:center;justify-content:center">
       <div style="background:#fff;max-width:480px;padding:40px;border-radius:12px;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.06)">
         <h1 style="color:${ok ? "#007e5d" : "#b91c1c"};font-size:22px;margin:0 0 12px">${title}</h1>
         <p style="color:#374151;line-height:1.6;margin:0 0 24px">${message}</p>
         <a href="${SITE_URL}" style="background:#007e5d;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold">Go to yowa.us</a>
       </div>
     </body></html>`,
    { status: ok ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } },
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const leadId = url.searchParams.get("lead") ?? "";
    const token = url.searchParams.get("t") ?? "";

    if (!UUID_RE.test(leadId) || !/^[0-9a-f]{64}$/i.test(token)) {
      return page("Invalid link", "This confirmation link is not valid. Please use the button in the email we sent you.", false);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: lead } = await admin
      .from("leads")
      .select("id, name, email, marketing_opt_in, is_recruitment, industry_type")
      .eq("id", leadId)
      .maybeSingle();

    if (!lead) {
      return page("Link expired", "We could not find your record. Please contact info@yowa.us if you'd like to subscribe.", false);
    }

    if (!(await verifyOptIn(lead.id, lead.email, token))) {
      return page("Invalid link", "This confirmation link is not valid or has been altered.", false);
    }

    if (lead.marketing_opt_in) {
      return page("You're already subscribed", "Thanks — your email preferences are already up to date.", true);
    }

    const { firstName, lastName } = splitName(lead.name);
    const audienceName = lead.is_recruitment ? AUDIENCES.applicants : AUDIENCES.allLeads;
    const audienceId = await ensureAudience(audienceName);
    const contactId = audienceId
      ? await upsertContact(audienceId, { email: lead.email, firstName, lastName, unsubscribed: false })
      : null;

    const { error: updateError } = await admin
      .from("leads")
      .update({
        marketing_opt_in: true,
        marketing_opt_in_at: new Date().toISOString(),
        resend_contact_id: contactId,
      })
      .eq("id", lead.id);
    if (updateError) console.error("Failed to record consent:", updateError.message);

    return page(
      "You're subscribed",
      "Thank you for confirming. You'll now receive occasional updates from Yowa Innovations, and you can unsubscribe from any email.",
      true,
    );
  } catch (error) {
    console.error("marketing-optin-confirm error:", error);
    return page("Something went wrong", "Please try again later or email info@yowa.us.", false);
  }
});
