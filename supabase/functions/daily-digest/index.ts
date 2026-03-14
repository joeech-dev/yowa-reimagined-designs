import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRAND_COLOR = "#f97316";
const BASE_URL = "https://yowaa.lovable.app/admin";

function wrapEmail(previewText: string, body: string): string {
  const today = new Date().toLocaleDateString("en-UG", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Africa/Kampala",
  });
  return `
    <div style="font-family:sans-serif;max-width:620px;margin:0 auto;padding:0;">
      <div style="background:${BRAND_COLOR};padding:20px 28px;border-radius:8px 8px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:18px;font-weight:700;">☀️ Daily Digest</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:12px;">Yowa Innovations — ${today}</p>
      </div>
      <div style="background:#fff;padding:24px 28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
        ${body}
        <div style="margin-top:24px;text-align:center;">
          <a href="${BASE_URL}" style="background:${BRAND_COLOR};color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;">
            Open Dashboard →
          </a>
        </div>
        <p style="color:#9ca3af;font-size:10px;margin-top:20px;border-top:1px solid #f3f4f6;padding-top:12px;text-align:center;">
          Daily digest from Yowa Innovations · Sent every morning at 8:00 AM EAT
        </p>
      </div>
    </div>
  `;
}

function section(title: string, icon: string, rows: string[], emptyMsg?: string): string {
  const content = rows.length > 0 ? rows.join("") : `<p style="color:#9ca3af;font-size:12px;margin:4px 0 12px;">${emptyMsg ?? "Nothing here today."}</p>`;
  return `
    <div style="margin-bottom:24px;">
      <h3 style="font-size:13px;font-weight:700;color:#111;margin:0 0 8px;display:flex;align-items:center;gap:6px;">
        ${icon} ${title}
      </h3>
      ${content}
    </div>
  `;
}

function pill(text: string, color: string): string {
  return `<span style="display:inline-block;background:${color}20;color:${color};font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;">${text}</span>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!resendKey) {
      return new Response(JSON.stringify({ skipped: true, reason: "RESEND_API_KEY not set" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch all active users with their emails and roles
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const users = authUsers?.users ?? [];

    // Fetch data needed for digest
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const [requisitionsRes, tasksRes, invoicesRes] = await Promise.all([
      supabase.from("expense_requisitions")
        .select("id, title, amount, status, requester_name, urgency, created_at")
        .in("status", ["pending", "finance_approved"])
        .order("urgency", { ascending: false }),
      supabase.from("tasks")
        .select("id, title, priority, due_date, status, task_owner")
        .lte("due_date", tomorrowStr)
        .not("status", "in", '("done","completed","cancelled")')
        .order("due_date", { ascending: true }),
      supabase.from("invoices")
        .select("id, invoice_number, client_name, total, status, due_date")
        .eq("status", "sent")
        .lte("due_date", tomorrowStr)
        .order("due_date", { ascending: true }),
    ]);

    const pendingReqs = requisitionsRes.data ?? [];
    const dueTasks = tasksRes.data ?? [];
    const overdueInvoices = invoicesRes.data ?? [];

    const totalItems = pendingReqs.length + dueTasks.length + overdueInvoices.length;

    // Build digest email body
    const urgencyColor: Record<string, string> = {
      critical: "#ef4444",
      high: "#f97316",
      normal: "#3b82f6",
      low: "#9ca3af",
    };
    const priorityColor: Record<string, string> = {
      critical: "#ef4444",
      high: "#f97316",
      medium: "#3b82f6",
      low: "#9ca3af",
    };

    const reqRows = pendingReqs.slice(0, 8).map(r => `
      <div style="padding:8px 0;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:start;">
        <div>
          <p style="margin:0;font-size:13px;font-weight:600;color:#111;">${escapeHtml(r.title)}</p>
          <p style="margin:2px 0 0;font-size:11px;color:#6b7280;">${escapeHtml(r.requester_name ?? "Unknown")} · UGX ${Number(r.amount).toLocaleString("en-UG")}</p>
        </div>
        ${pill((r.urgency ?? "normal").toUpperCase(), urgencyColor[r.urgency ?? "normal"] ?? "#3b82f6")}
      </div>
    `);

    const taskRows = dueTasks.slice(0, 8).map(t => `
      <div style="padding:8px 0;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:start;">
        <div>
          <p style="margin:0;font-size:13px;font-weight:600;color:#111;">${escapeHtml(t.title)}</p>
          <p style="margin:2px 0 0;font-size:11px;color:#6b7280;">Due: ${t.due_date ?? "—"}</p>
        </div>
        ${pill((t.priority ?? "medium").toUpperCase(), priorityColor[t.priority ?? "medium"] ?? "#3b82f6")}
      </div>
    `);

    const invRows = overdueInvoices.slice(0, 6).map(i => `
      <div style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
        <p style="margin:0;font-size:13px;font-weight:600;color:#111;">${escapeHtml(i.invoice_number)} — ${escapeHtml(i.client_name)}</p>
        <p style="margin:2px 0 0;font-size:11px;color:#6b7280;">UGX ${Number(i.total).toLocaleString("en-UG")} · Due: ${i.due_date ?? "—"}</p>
      </div>
    `);

    const summaryBanner = `
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 18px;margin-bottom:24px;display:flex;gap:20px;flex-wrap:wrap;">
        <div style="text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:800;color:${BRAND_COLOR};">${pendingReqs.length}</p>
          <p style="margin:2px 0 0;font-size:11px;color:#6b7280;">Pending Requisitions</p>
        </div>
        <div style="text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:800;color:#3b82f6;">${dueTasks.length}</p>
          <p style="margin:2px 0 0;font-size:11px;color:#6b7280;">Tasks Due Today/Tomorrow</p>
        </div>
        <div style="text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:800;color:#ef4444;">${overdueInvoices.length}</p>
          <p style="margin:2px 0 0;font-size:11px;color:#6b7280;">Invoices Due/Overdue</p>
        </div>
      </div>
    `;

    const body = summaryBanner
      + section("Expense Requisitions Awaiting Approval", "📋", reqRows, "No pending requisitions — great work!")
      + section("Tasks Due Today or Tomorrow", "📌", taskRows, "No tasks due — all clear!")
      + section("Invoices Due or Overdue", "💰", invRows, "No overdue invoices — excellent!");

    // Send digest to info@yowa.us (the main team inbox)
    // For per-user digests in the future, iterate over users
    const subject = totalItems > 0
      ? `☀️ Daily Digest — ${totalItems} item${totalItems === 1 ? "" : "s"} need your attention`
      : "☀️ Daily Digest — All clear today! 🎉";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "Yowa Innovations <notifications@yowa.us>",
        to: ["info@yowa.us", "lubangakene@yowa.us", "joel@yowa.us"],
        subject,
        html: wrapEmail(subject, body),
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

    return new Response(JSON.stringify({ sent: true, subject }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("daily-digest error:", err);
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
