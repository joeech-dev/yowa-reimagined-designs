import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";

    switch (action) {
      case "generate_blog":
        systemPrompt = `You are Yowa's AI content assistant. Generate a professional blog post in markdown format. 
Include a compelling title, introduction, body with subheadings, and conclusion. 
Focus on topics related to urbanism, livelihood, technology, agriculture, environment, or education in Africa.
Keep the tone professional yet engaging. The post should be 500-800 words.`;
        break;
      case "analyze_lead":
        systemPrompt = `You are Yowa's AI business analyst. Analyze the lead data provided and give:
1. A lead quality score (1-10)
2. Recommended follow-up strategy
3. Potential project opportunities
4. Key talking points for the next meeting
Keep responses concise and actionable.`;
        break;
      case "project_to_blog":
        systemPrompt = `You are Yowa's AI content assistant. Convert the project details into a compelling blog post.
Write about the project's impact, process, and outcomes. Include:
- An engaging title
- Project background and objectives
- The creative process
- Impact and results
- Client testimonial placeholder
Format in markdown. Keep it 400-600 words.`;
        break;
      case "schedule_followup":
        systemPrompt = `You are Yowa's AI scheduling assistant. Based on the lead/client information, suggest:
1. Optimal follow-up timing
2. Communication channel (email, phone, meeting)
3. Key discussion points
4. A draft follow-up message
Keep responses professional and actionable.`;
        break;
      case "seo_analysis":
        systemPrompt = `You are Yowa's AI SEO strategist. You will receive Google Search Console data for yowa.us.
Analyze it and provide:

## SEO Recommendations
- Identify pages with high impressions but low CTR (optimization opportunities)
- Suggest title/meta description improvements for underperforming pages
- Highlight top-performing queries and how to double down on them

## Content Gap Analysis
- Identify search topics people look for but the site doesn't cover well
- Suggest new blog post ideas based on search demand
- Recommend internal linking opportunities

## Performance Summary
- Overall search visibility trends
- Top 5 queries driving traffic
- Pages that need attention

Use specific numbers from the data. Be actionable and concise. Format in markdown with clear sections.`;
        break;
      default:
        systemPrompt = `You are Yowa's AI business assistant. You help with content creation, lead analysis, 
project management insights, and business strategy. You are knowledgeable about media production, 
digital marketing, urbanism, and social impact in Africa. Keep responses helpful and concise.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
