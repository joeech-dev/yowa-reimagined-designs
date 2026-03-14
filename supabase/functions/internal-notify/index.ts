import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type EventType =
  | "requisition_submitted"
  | "requisition_approved"
  | "requisition_rejected"
  | "task_assigned"
  | "invoice_paid";

interface NotifyPayload {
  event: EventType;
  data: Record<string, string | number | null | undefined>;
}

// ─── Email templates ──────────────────────────────────────────────────────────
const BRAND_COLOR = "#f97316";
const BASE_URL = "https://yowaa.lovable.app/admin";

function wrapEmail(title: string, body: string): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:0;">
      <div style="background:${BRAND_COLOR};padding:24px 32px;border-radius:8px 8px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">Yowa Innovations</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">Internal Notification</p>
      </div>
      <div style="background:#fff;padding:28px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
        <h2 style="color:#111;font-size:17px;margin:0 0 16px;">${title}</h2>
        ${body}
        <p style="margin-top:28px;">
          <a href="${BASE_URL}" style="background:${BRAND_COLOR};color:#fff;padding:10px 22px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
            Open Dashboard →
          </a>
        </p>
        <p style="color:#9ca3af;font-size:11px;margin-top:28px;border-top:1px solid #f3f4f6;padding-top:14px;">
          This is an automated internal notification from Yowa Innovations. Do not reply to this email.
        </p>
      </div>
    </div>
  `;
}

function tableRow(label: string, value: string | null | undefined): string {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:6px 0;color:#6b7280;font-size:13px;width:160px;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;font-size:13px;font-weight:600;color:#111;">${escapeHtml(String(value))}</td>
    </tr>
  `;
}

function buildEmail(event: EventType, data: Record<string, string | number | null | undefined>): { subject: string; html: string; to: string[] } | null {
  const fmt = (n: number | null | undefined) =>
    n != null ? `UGX ${Number(n).toLocaleString("en-UG")}` : "";

  switch (event) {
    case "requisition_submitted": {
      const subject = `📋 New Requisition: ${data.title ?? "Expense Request"}`;
      const body = `
        <p style="color:#374151;font-size:14px;margin:0 0 16px;">
          A new expense requisition has been submitted and is awaiting your review.
        </p>
        <table style="width:100%;border-collapse:collapse;">
          ${tableRow("Submitted by", String(data.requester_name ?? "Unknown"))}
          ${tableRow("Department", String(data.department ?? "—"))}
          ${tableRow("Title", String(data.title ?? ""))}
          ${tableRow("Amount", fmt(Number(data.amount)))}
          ${tableRow("Category", String(data.category ?? ""))}
          ${tableRow("Urgency", String(data.urgency ?? "normal").toUpperCase())}
          ${tableRow("Justification", String(data.justification ?? ""))}
        </table>
      `;
      // Notify Finance + Admin team via a known address
      return { subject, html: wrapEmail("New Expense Requisition Submitted", body), to: ["info@yowa.us"] };
    }

    case "requisition_approved": {
      const subject = `✅ Requisition Approved: ${data.title ?? "Your Request"}`;
      const body = `
        <p style="color:#374151;font-size:14px;margin:0 0 16px;">
          Good news! Your expense requisition has been approved.
        </p>
        <table style="width:100%;border-collapse:collapse;">
          ${tableRow("Requisition", String(data.title ?? ""))}
          ${tableRow("Amount", fmt(Number(data.amount)))}
          ${tableRow("Status", String(data.status ?? "approved").replace("_", " ").toUpperCase())}
          ${tableRow("Approved by", String(data.approved_by_name ?? "Finance / Admin"))}
        </table>
        <p style="color:#374151;font-size:13px;margin:14px 0 0;">
          ${data.status === "finance_approved"
            ? "Your request has been approved by Finance and is now pending Super Admin sign-off for the final step."
            : "Your request is fully approved. Finance will process the payment shortly."}
        </p>
      `;
      return { subject, html: wrapEmail("Your Requisition Has Been Approved", body), to: [String(data.requester_email ?? "info@yowa.us")] };
    }

    case "requisition_rejected": {
      const subject = `❌ Requisition Not Approved: ${data.title ?? "Your Request"}`;
      const body = `
        <p style="color:#374151;font-size:14px;margin:0 0 16px;">
          Unfortunately, your expense requisition could not be approved at this time.
        </p>
        <table style="width:100%;border-collapse:collapse;">
          ${tableRow("Requisition", String(data.title ?? ""))}
          ${tableRow("Amount", fmt(Number(data.amount)))}
          ${tableRow("Reason", String(data.rejection_reason ?? "No reason provided"))}
        </table>
        <p style="color:#374151;font-size:13px;margin:14px 0 0;">
          If you have questions, please reach out to your Finance team directly.
        </p>
      `;
      return { subject, html: wrapEmail("Your Requisition Was Not Approved", body), to: [String(data.requester_email ?? "info@yowa.us")] };
    }

    case "task_assigned": {
      const subject = `📌 New Task Assigned to You: ${data.task_title ?? "Task"}`;
      const body = `
        <p style="color:#374151;font-size:14px;margin:0 0 16px;">
          You have been assigned a new task. Please review the details below.
        </p>
        <table style="width:100%;border-collapse:collapse;">
          ${tableRow("Task", String(data.task_title ?? ""))}
          ${tableRow("Priority", String(data.priority ?? "medium").toUpperCase())}
          ${tableRow("Due Date", String(data.due_date ?? "Not set"))}
          ${tableRow("Assigned by", String(data.assigned_by_name ?? "Unknown"))}
          ${tableRow("Description", String(data.description ?? ""))}
        </table>
      `;
      return { subject, html: wrapEmail("A Task Has Been Assigned to You", body), to: [String(data.assignee_email ?? "info@yowa.us")] };
    }

    case "invoice_paid": {
      const subject = `💰 Payment Received: Invoice ${data.invoice_number ?? ""}`;
      const body = `
        <p style="color:#374151;font-size:14px;margin:0 0 16px;">
          An invoice has been marked as paid and the transaction has been recorded in Finance.
        </p>
        <table style="width:100%;border-collapse:collapse;">
          ${tableRow("Invoice #", String(data.invoice_number ?? ""))}
          ${tableRow("Client", String(data.client_name ?? ""))}
          ${tableRow("Amount", fmt(Number(data.amount)))}
          ${tableRow("Payment Method", String(data.payment_method ?? "—"))}
          ${tableRow("Date", String(data.payment_date ?? new Date().toLocaleDateString("en-UG")))}
        </table>
      `;
      return { subject, html: wrapEmail("Invoice Payment Received", body), to: ["info@yowa.us"] };
    }

    default:
      return null;
  }
}

// ─── Server ───────────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ skipped: true, reason: "RESEND_API_KEY not set" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: NotifyPayload = await req.json();
    const email = buildEmail(payload.event, payload.data);

    if (!email) {
      return new Response(JSON.stringify({ skipped: true, reason: "unknown event" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "Yowa Innovations <notifications@yowa.us>",
        to: email.to,
        subject: email.subject,
        html: email.html,
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

    return new Response(JSON.stringify({ sent: true, to: email.to, subject: email.subject }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("internal-notify error:", err);
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
