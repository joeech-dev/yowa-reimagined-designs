import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SignJWT, importPKCS8 } from "npm:jose@5.9.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getAccessToken(serviceAccountJson: string): Promise<string> {
  let cleanJson = serviceAccountJson.trim();
  
  // Try to find the start of JSON object
  const jsonStart = cleanJson.indexOf('{');
  if (jsonStart > 0) {
    cleanJson = cleanJson.slice(jsonStart);
  }
  if (cleanJson.startsWith('"')) {
    cleanJson = JSON.parse(cleanJson);
  }
  const sa = JSON.parse(cleanJson);
  const privateKey = await importPKCS8(sa.private_key, "RS256");

  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({
    iss: sa.client_email,
    sub: sa.client_email,
    aud: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/analytics.readonly",
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

async function runReport(
  accessToken: string,
  propertyId: string,
  body: Record<string, unknown>
) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
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
    const propertyId = Deno.env.get("GA4_PROPERTY_ID");

    if (!serviceAccountJson || !propertyId) {
      throw new Error("GA4 credentials not configured");
    }

    const accessToken = await getAccessToken(serviceAccountJson);

    // Run multiple reports in parallel
    const [overviewReport, trafficByCountry, trafficByDevice, trafficByBrowser, pageViewsReport, trafficBySource] =
      await Promise.all([
        // Overview: sessions, users, pageviews, bounce rate (last 30 days)
        runReport(accessToken, propertyId, {
          dateRanges: [
            { startDate: "30daysAgo", endDate: "today" },
            { startDate: "60daysAgo", endDate: "31daysAgo" },
          ],
          metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "screenPageViews" },
            { name: "bounceRate" },
            { name: "averageSessionDuration" },
          ],
        }),

        // Traffic by country
        runReport(accessToken, propertyId, {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "country" }],
          metrics: [{ name: "sessions" }, { name: "totalUsers" }],
          limit: 10,
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        }),

        // Traffic by device category
        runReport(accessToken, propertyId, {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "deviceCategory" }],
          metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        }),

        // Traffic by browser
        runReport(accessToken, propertyId, {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "browser" }],
          metrics: [{ name: "sessions" }],
          limit: 5,
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        }),

        // Daily page views (last 30 days)
        runReport(accessToken, propertyId, {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "date" }],
          metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
          orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
        }),

        // Traffic by source/medium
        runReport(accessToken, propertyId, {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
          metrics: [{ name: "sessions" }, { name: "totalUsers" }],
          limit: 20,
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        }),
      ]);

    const data = {
      overview: overviewReport,
      trafficByCountry,
      trafficByDevice,
      trafficByBrowser,
      pageViews: pageViewsReport,
      trafficBySource,
    };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GA4 analytics error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
