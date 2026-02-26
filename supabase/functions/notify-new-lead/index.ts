import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadPayload {
  name: string;
  email: string;
  phone: string;
  industry_type?: string | null;
  geographic_location?: string | null;
  is_recruitment?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const lead: LeadPayload = await req.json();

    // Send notification email via Resend free tier (no cost for up to 3,000 emails/month)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not set – skipping notification email");
      return new Response(JSON.stringify({ skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subject = lead.is_recruitment
      ? `🧑‍💼 New Job Application: ${lead.name}`
      : `🎯 New Lead: ${lead.name}`;

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="color:#f97316;">${subject}</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#666;width:140px;">Name</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(lead.name)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></td></tr>
          <tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;">${escapeHtml(lead.phone)}</td></tr>
          ${lead.industry_type ? `<tr><td style="padding:8px 0;color:#666;">Service / Interest</td><td style="padding:8px 0;">${escapeHtml(lead.industry_type)}</td></tr>` : ""}
          ${lead.geographic_location ? `<tr><td style="padding:8px 0;color:#666;">Location</td><td style="padding:8px 0;">${escapeHtml(lead.geographic_location)}</td></tr>` : ""}
          <tr><td style="padding:8px 0;color:#666;">Type</td><td style="padding:8px 0;">${lead.is_recruitment ? "Job Application" : "Service Enquiry"}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Received</td><td style="padding:8px 0;">${new Date().toLocaleString("en-UG", { timeZone: "Africa/Kampala" })} (EAT)</td></tr>
        </table>
        <p style="margin-top:24px;">
          <a href="https://yowaa.lovable.app/admin" style="background:#f97316;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">View in Dashboard</a>
        </p>
        <p style="color:#999;font-size:12px;margin-top:32px;">This is an automated notification from your Yowa Innovations website.</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Yowa Innovations <notifications@yowa.us>",
        to: ["info@yowa.us"],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ sent: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-new-lead error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
