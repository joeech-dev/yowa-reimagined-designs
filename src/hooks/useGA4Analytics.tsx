import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GA4Overview {
  sessions: number;
  sessionsPrev: number;
  users: number;
  usersPrev: number;
  pageViews: number;
  pageViewsPrev: number;
  bounceRate: number;
  bounceRatePrev: number;
  avgSessionDuration: number;
}

interface GA4DimensionRow {
  dimension: string;
  sessions: number;
  users?: number;
}

interface GA4DailyRow {
  date: string;
  pageViews: number;
  users: number;
}

export interface GA4Data {
  overview: GA4Overview;
  trafficByCountry: GA4DimensionRow[];
  trafficByDevice: GA4DimensionRow[];
  trafficByBrowser: GA4DimensionRow[];
  dailyPageViews: GA4DailyRow[];
}

function parseOverview(report: any): GA4Overview {
  const rows = report?.rows || [];
  const current = rows[0]?.metricValues || [];
  const prev = rows[1]?.metricValues || [];

  return {
    sessions: parseInt(current[0]?.value || "0"),
    sessionsPrev: parseInt(prev[0]?.value || "0"),
    users: parseInt(current[1]?.value || "0"),
    usersPrev: parseInt(prev[1]?.value || "0"),
    pageViews: parseInt(current[2]?.value || "0"),
    pageViewsPrev: parseInt(prev[2]?.value || "0"),
    bounceRate: parseFloat(current[3]?.value || "0"),
    bounceRatePrev: parseFloat(prev[3]?.value || "0"),
    avgSessionDuration: parseFloat(current[4]?.value || "0"),
  };
}

function parseDimensionRows(report: any): GA4DimensionRow[] {
  return (report?.rows || []).map((row: any) => ({
    dimension: row.dimensionValues?.[0]?.value || "Unknown",
    sessions: parseInt(row.metricValues?.[0]?.value || "0"),
    users: row.metricValues?.[1] ? parseInt(row.metricValues[1].value || "0") : undefined,
  }));
}

function parseDailyRows(report: any): GA4DailyRow[] {
  return (report?.rows || []).map((row: any) => {
    const dateStr = row.dimensionValues?.[0]?.value || "";
    const formatted = dateStr.length === 8
      ? `${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`
      : dateStr;
    return {
      date: formatted,
      pageViews: parseInt(row.metricValues?.[0]?.value || "0"),
      users: parseInt(row.metricValues?.[1]?.value || "0"),
    };
  });
}

export function useGA4Analytics() {
  return useQuery<GA4Data>({
    queryKey: ["ga4-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("ga4-analytics");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return {
        overview: parseOverview(data.overview),
        trafficByCountry: parseDimensionRows(data.trafficByCountry),
        trafficByDevice: parseDimensionRows(data.trafficByDevice),
        trafficByBrowser: parseDimensionRows(data.trafficByBrowser),
        dailyPageViews: parseDailyRows(data.pageViews),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
}
