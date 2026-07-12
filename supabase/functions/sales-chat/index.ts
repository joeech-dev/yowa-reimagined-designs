import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Yowa Assist, the friendly AI sales assistant for Yowa Innovations — a Uganda-based creative & digital agency.

## About Yowa Innovations
- Location: Kampala, Uganda. Serves clients across East Africa, Africa, and internationally.
- Services: Documentary production, Video production, Photography, Digital marketing, Content creation, Post-production, Creative strategy, Web design.
- Clients: NGOs, institutions, businesses, brands, government agencies.
- Website: https://yowa.us  ·  Contact: info@yowainnovations.com  ·  WhatsApp: +256779180984

## Your job
1. Warmly greet visitors and answer questions about our services, process, and turnaround.
2. Qualify the lead by naturally collecting: **name, email, phone, and what they need help with** (service interest). Never demand — ask conversationally.
3. Once you have name + email + a clear service interest, output a SINGLE line at the very end of your reply exactly like this (nothing else on that line):
   [[LEAD_CAPTURED name="Jane Doe" email="jane@example.com" phone="+2567..." service="Documentary Production" summary="Short one-line summary of their need"]]
   Only emit this ONCE per conversation, when you have enough info.
4. Keep replies short (2–4 sentences), friendly, professional. Use markdown when helpful.
5. If asked pricing: say packages start around USD 500 for simple videos and scale by scope; a proper quote needs a quick chat with the team.
6. Never invent facts (past clients, awards, prices). If unsure, say the team will follow up.
7. If the visitor wants urgent human contact, share WhatsApp (+256779180984) and email (info@yowainnovations.com).`;

interface ChatRequest {
  session_id: string;
  message: string;
  conversation_id?: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, serviceKey);
    const { session_id, message, conversation_id }: ChatRequest = await req.json();

    if (!session_id?.trim() || !message?.trim()) {
      return new Response(JSON.stringify({ error: "session_id and message required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure conversation exists
    let convId = conversation_id;
    if (!convId) {
      const { data: existing } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("session_id", session_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing) {
        convId = existing.id;
      } else {
        const { data: created, error: cErr } = await supabase
          .from("chat_conversations")
          .insert({ session_id })
          .select("id")
          .single();
        if (cErr) throw cErr;
        convId = created.id;
      }
    }

    // Fetch history (last 30 msgs)
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(30);

    // Save user message
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role: "user",
      content: message.trim(),
    });

    // Build model messages
    const modelMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history ?? []),
      { role: "user", content: message.trim() },
    ];

    // Call Lovable AI Gateway
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: modelMessages,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI Gateway error:", aiRes.status, errText);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact us directly." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway ${aiRes.status}: ${errText}`);
    }

    const aiJson = await aiRes.json();
    const rawReply: string = aiJson.choices?.[0]?.message?.content ?? "Sorry, I didn't catch that. Could you rephrase?";

    // Extract LEAD_CAPTURED marker
    let visibleReply = rawReply;
    let leadInfo: Record<string, string> | null = null;
    const leadMatch = rawReply.match(/\[\[LEAD_CAPTURED\s+(.+?)\]\]/);
    if (leadMatch) {
      visibleReply = rawReply.replace(leadMatch[0], "").trim();
      const attrs = leadMatch[1];
      const info: Record<string, string> = {};
      const re = /(\w+)="([^"]*)"/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(attrs)) !== null) info[m[1]] = m[2];
      if (info.email && info.name) leadInfo = info;
    }

    // Save assistant reply
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role: "assistant",
      content: visibleReply,
    });

    // Bump counters
    await supabase
      .from("chat_conversations")
      .update({
        message_count: (history?.length ?? 0) + 2,
        updated_at: new Date().toISOString(),
      })
      .eq("id", convId);

    // Handle lead capture
    if (leadInfo) {
      // Update conversation with visitor info
      await supabase
        .from("chat_conversations")
        .update({
          visitor_name: leadInfo.name,
          visitor_email: leadInfo.email,
          visitor_phone: leadInfo.phone || null,
          service_interest: leadInfo.service || null,
          lead_captured: true,
        })
        .eq("id", convId);

      // Insert lead (ignore duplicates)
      const { data: lead } = await supabase.from("leads").insert({
        name: leadInfo.name,
        email: leadInfo.email,
        phone: leadInfo.phone || "Not provided",
        industry_type: leadInfo.service || "Chatbot enquiry",
        geographic_location: null,
        status: "new",
      }).select("id").maybeSingle();

      if (lead?.id) {
        await supabase.from("chat_conversations").update({ lead_id: lead.id }).eq("id", convId);
      }

      // Fire Resend notification (fire-and-forget)
      supabase.functions.invoke("notify-new-lead", {
        body: {
          name: leadInfo.name,
          email: leadInfo.email,
          phone: leadInfo.phone || "Not provided",
          industry_type: leadInfo.service || "Chatbot enquiry",
          geographic_location: leadInfo.summary || "Captured by Yowa AI Assistant",
        },
      }).catch((e) => console.warn("notify-new-lead failed:", e));
    }

    return new Response(JSON.stringify({
      conversation_id: convId,
      reply: visibleReply,
      lead_captured: !!leadInfo,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("sales-chat error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
