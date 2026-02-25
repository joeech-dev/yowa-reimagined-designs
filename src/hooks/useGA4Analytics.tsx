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

interface GA4SourceRow {
  source: string;
  medium: string;
  sessions: number;
  users: number;
}

export interface GA4PageRow {
  pagePath: string;
  pageViews: number;
  users: number;
  avgSessionDuration: number;
  bounceRate: number;
  engagedSessions: number;
}

export interface GA4Data {
  overview: GA4Overview;
  trafficByCountry: GA4DimensionRow[];
  trafficByDevice: GA4DimensionRow[];
  trafficByBrowser: GA4DimensionRow[];
  dailyPageViews: GA4DailyRow[];
  trafficBySource: GA4SourceRow[];
  topPages: GA4PageRow[];
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

function parseSourceRows(report: any): GA4SourceRow[] {
  return (report?.rows || []).map((row: any) => ({
    source: row.dimensionValues?.[0]?.value || "Unknown",
    medium: row.dimensionValues?.[1]?.value || "Unknown",
    sessions: parseInt(row.metricValues?.[0]?.value || "0"),
    users: parseInt(row.metricValues?.[1]?.value || "0"),
  }));
}

function parsePageRows(report: any): GA4PageRow[] {
  return (report?.rows || []).map((row: any) => ({
    pagePath: row.dimensionValues?.[0]?.value || "/",
    pageViews: parseInt(row.metricValues?.[0]?.value || "0"),
    users: parseInt(row.metricValues?.[1]?.value || "0"),
    avgSessionDuration: parseFloat(row.metricValues?.[2]?.value || "0"),
    bounceRate: parseFloat(row.metricValues?.[3]?.value || "0"),
    engagedSessions: parseInt(row.metricValues?.[4]?.value || "0"),
  }));
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
        trafficBySource: parseSourceRows(data.trafficBySource),
        topPages: parsePageRows(data.topPages),
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}
