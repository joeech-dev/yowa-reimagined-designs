import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { AUDIENCES, corsHeaders, ensureAudience, splitName, upsertContact } from "../_shared/resend.ts";

const BodySchema = z.object({
  email: z.string().email().max(255),
  name: z.string().max(200).optional().nullable(),
  service: z.string().max(120).optional().nullable(),
  marketing_opt_in: z.boolean().default(false),
  is_recruitment: z.boolean().default(false),
  lead_id: z.string().uuid().optional().nullable(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { email, name, service, marketing_opt_in, is_recruitment, lead_id } = parsed.data;

    // Consent gate: without explicit marketing opt-in we never add the address to
    // a mailing audience. Transactional replies still go out as usual.
    if (!marketing_opt_in) {
      console.log("No marketing consent — skipping Resend audience sync");
      return new Response(JSON.stringify({ synced: false, reason: "no_consent" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { firstName, lastName } = splitName(name);

    const audienceNames = [is_recruitment ? AUDIENCES.applicants : AUDIENCES.allLeads];
    if (!is_recruitment && service) audienceNames.push(AUDIENCES.service(service));

    let primaryContactId: string | null = null;
    const results: Array<{ audience: string; ok: boolean }> = [];

    for (const audienceName of audienceNames) {
      const audienceId = await ensureAudience(audienceName);
      if (!audienceId) {
        results.push({ audience: audienceName, ok: false });
        continue;
      }
      const contactId = await upsertContact(audienceId, { email, firstName, lastName, unsubscribed: false });
      if (!primaryContactId) primaryContactId = contactId;
      results.push({ audience: audienceName, ok: Boolean(contactId) });
    }

    // Record consent + contact reference against the lead when we know which one it is.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const target = lead_id
      ? supabase.from("leads").update({
          marketing_opt_in: true,
          marketing_opt_in_at: new Date().toISOString(),
          resend_contact_id: primaryContactId,
        }).eq("id", lead_id)
      : supabase.from("leads").update({
          marketing_opt_in: true,
          marketing_opt_in_at: new Date().toISOString(),
          resend_contact_id: primaryContactId,
        }).eq("email", email);

    const { error: updateError } = await target;
    if (updateError) console.error("Failed to record consent on lead:", updateError.message);

    return new Response(JSON.stringify({ synced: true, audiences: results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("resend-sync-contact error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
