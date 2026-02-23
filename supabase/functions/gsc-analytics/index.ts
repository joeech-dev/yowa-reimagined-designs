import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SignJWT, importPKCS8 } from "npm:jose@5.9.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getAccessToken(serviceAccountJson: string): Promise<string> {
  let cleanJson = serviceAccountJson.trim();
  const jsonStart = cleanJson.indexOf("{");
  if (jsonStart > 0) cleanJson = cleanJson.slice(jsonStart);
  if (cleanJson.startsWith('"')) cleanJson = JSON.parse(cleanJson);
  const sa = JSON.parse(cleanJson);
  const privateKey = await importPKCS8(sa.private_key, "RS256");

  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({
    iss: sa.client_email,
    sub: sa.client_email,
    aud: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    iat: now,
    exp: now + 3600,
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .sign(privateKey);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    console.error("Token error:", tokenData);
    throw new Error("Failed to get access token");
  }
  return tokenData.access_token;
}

const SITE_URL = "https://yowa.us/";

async function querySearchAnalytics(
  accessToken: string,
  body: Record<string, unknown>
) {
  const encodedSite = encodeURIComponent(SITE_URL);
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  return res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceAccountJson = Deno.env.get("GA4_SERVICE_ACCOUNT_JSON");
    if (!serviceAccountJson) throw new Error("Service account not configured");

    const { report = "overview" } = await req.json().catch(() => ({}));
    const accessToken = await getAccessToken(serviceAccountJson);

    // Calculate date ranges
    const today = new Date();
    const daysAgo = (n: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - n);
      return d.toISOString().split("T")[0];
    };

    let data: Record<string, unknown>;

    if (report === "overview") {
      // Run multiple queries in parallel
      const [topQueries, topPages, queryTrends, deviceBreakdown] = await Promise.all([
        // Top search queries (last 28 days)
        querySearchAnalytics(accessToken, {
          startDate: daysAgo(28),
          endDate: daysAgo(1),
          dimensions: ["query"],
          rowLimit: 25,
          dataState: "final",
        }),
        // Top pages
        querySearchAnalytics(accessToken, {
          startDate: daysAgo(28),
          endDate: daysAgo(1),
          dimensions: ["page"],
          rowLimit: 25,
          dataState: "final",
        }),
        // Daily trends
        querySearchAnalytics(accessToken, {
          startDate: daysAgo(28),
          endDate: daysAgo(1),
          dimensions: ["date"],
          dataState: "final",
        }),
        // Device breakdown
        querySearchAnalytics(accessToken, {
          startDate: daysAgo(28),
          endDate: daysAgo(1),
          dimensions: ["device"],
          dataState: "final",
        }),
      ]);

      data = { topQueries, topPages, queryTrends, deviceBreakdown };
    } else if (report === "ai_analysis") {
      // Comprehensive data for AI analysis
      const [queries, pages, countries] = await Promise.all([
        querySearchAnalytics(accessToken, {
          startDate: daysAgo(28),
          endDate: daysAgo(1),
          dimensions: ["query"],
          rowLimit: 50,
          dataState: "final",
        }),
        querySearchAnalytics(accessToken, {
          startDate: daysAgo(28),
          endDate: daysAgo(1),
          dimensions: ["page"],
          rowLimit: 50,
          dataState: "final",
        }),
        querySearchAnalytics(accessToken, {
          startDate: daysAgo(28),
          endDate: daysAgo(1),
          dimensions: ["country"],
          rowLimit: 20,
          dataState: "final",
        }),
      ]);

      data = { queries, pages, countries };
    } else {
      throw new Error(`Unknown report type: ${report}`);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GSC analytics error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
