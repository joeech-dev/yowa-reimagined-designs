import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type ContentType = "blog" | "project";

const sessionKey = (type: ContentType, id: string) => `viewed:${type}:${id}`;

/** Fetch view counts for a set of content ids (single query). */
export const useContentViewCounts = (type: ContentType, ids: string[]) => {
  const key = [...ids].sort().join(",");
  return useQuery<Record<string, number>>({
    queryKey: ["content-views", type, key],
    queryFn: async () => {
      if (!ids.length) return {};
      const { data, error } = await supabase
        .from("content_views")
        .select("content_id, view_count")
        .eq("content_type", type)
        .in("content_id", ids);

      if (error) {
        console.error("Failed to fetch view counts", error);
        return {};
      }
      const map: Record<string, number> = {};
      (data || []).forEach((row: { content_id: string; view_count: number }) => {
        map[row.content_id] = Number(row.view_count) || 0;
      });
      return map;
    },
    enabled: ids.length > 0,
    staleTime: 60_000,
  });
};

/** Registers one view per browser session and returns the live count. */
export const useTrackContentView = (type: ContentType, id: string | undefined) => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const run = async () => {
      const alreadyViewed = sessionStorage.getItem(sessionKey(type, id)) === "1";

      if (alreadyViewed) {
        const { data } = await supabase
          .from("content_views")
          .select("view_count")
          .eq("content_type", type)
          .eq("content_id", id)
          .maybeSingle();
        if (!cancelled) setCount(Number(data?.view_count ?? 0));
        return;
      }

      const { data, error } = await supabase.rpc("increment_content_view", {
        _content_type: type,
        _content_id: id,
      });
      if (error) {
        console.error("Failed to record view", error);
        return;
      }
      sessionStorage.setItem(sessionKey(type, id), "1");
      if (!cancelled) setCount(Number(data ?? 0));
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [type, id]);

  return count;
};

export const formatViews = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${n}`;
};
