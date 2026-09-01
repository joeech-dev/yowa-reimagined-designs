import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRAND_COLOR = "#007e5d";
const LOGIN_URL = "https://yowa.us/auth";
const FROM = "Yowa Innovations <info@yowa.us>";
const CC = "info@yowa.us";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

/** Readable but random generic password. */
function generatePassword(): string {
  const words = ["Yowa", "Innovate", "Create", "Impact", "Story", "Studio"];
  const w = words[Math.floor(Math.random() * words.length)];
  const n = Math.floor(1000 + Math.random() * 9000);
  const sym = "!@#$%".charAt(Math.floor(Math.random() * 5));
  return `${w}${n}${sym}`;
}

function welcomeEmail(name: string, email: string, password: string) {
  return `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:${BRAND_COLOR};padding:24px 32px;border-radius:8px 8px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">Yowa Innovations</h1>
      <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">Welcome to the team</p>
    </div>
    <div style="background:#fff;padding:28px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
      <h2 style="color:#111;font-size:17px;margin:0 0 12px;">Hello ${escapeHtml(name || "there")},</h2>
      <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Congratulations — your application with Yowa Innovations has been qualified.
        We have created a workspace account for you so you can access your dashboard.
      </p>
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:6px;">
        <tr><td style="padding:10px 14px;color:#6b7280;font-size:13px;width:150px;">User ID (email)</td><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#111;">${escapeHtml(email)}</td></tr>
        <tr><td style="padding:10px 14px;color:#6b7280;font-size:13px;">Temporary password</td><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#111;">${escapeHtml(password)}</td></tr>
      </table>
      <p style="margin:24px 0;">
        <a href="${LOGIN_URL}" style="background:${BRAND_COLOR};color:#fff;padding:11px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Log in to your dashboard →</a>
      </p>
      <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:0;">
        Please sign in and change your password immediately, then complete your profile
        (full name, position and photo) so your account is fully activated.
      </p>
      <p style="color:#9ca3af;font-size:11px;margin-top:28px;border-top:1px solid #f3f4f6;padding-top:14px;">
        Sent automatically by Yowa Innovations. If you were not expecting this, reply to info@yowa.us.
      </p>
    </div>
  </div>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: "Unauthorized" }, 401);

    const { data: roleData } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "super_admin"])
      .maybeSingle();
    if (!roleData) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category = ["employee", "freelancer", "trainee"].includes(body.category)
      ? body.category
      : "freelancer";

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ error: "A valid email is required" }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Skip if this email already has an account
    const { data: existing } = await admin.auth.admin.listUsers();
    const already = existing?.users?.find((u) => u.email?.toLowerCase() === email);
    if (already) {
      return json({ success: true, created: false, reason: "account_exists", userId: already.id });
    }

    const password = generatePassword();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });
    if (createError) throw createError;

    const newId = created.user.id;

    // Baseline access — freelancers stay off the public website until promoted
    await admin.from("user_roles").insert({ user_id: newId, role: "project_team" });
    await admin
      .from("profiles")
      .update({ full_name: name || null, show_on_team_board: false })
      .eq("user_id", newId);
    await admin.from("team_members").insert({
      full_name: name || email,
      role: "Team Member",
      category,
      is_active: true,
    });

    // Welcome email with credentials + login link (info@yowa.us copied)
    let emailed = false;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: FROM,
          to: [email],
          cc: [CC],
          reply_to: "info@yowa.us",
          subject: "Your Yowa Innovations account details",
          html: welcomeEmail(name, email, password),
        }),
      });
      emailed = res.ok;
      if (!res.ok) console.error("Resend send failed:", await res.text());
    } else {
      console.error("RESEND_API_KEY not configured — welcome email skipped");
    }

    return json({ success: true, created: true, userId: newId, emailed });
  } catch (error) {
    console.error("onboard-recruit error:", error);
    return json({ error: (error as Error).message }, 500);
  }
});
