export const PLATFORM_CONFIG: Record<string, { label: string; icon: string; color: string; metrics: string[] }> = {
  facebook: {
    label: "Facebook",
    icon: "📘",
    color: "#1877F2",
    metrics: ["followers", "reach", "impressions", "engagements", "posts", "stories"],
  },
  instagram: {
    label: "Instagram",
    icon: "📸",
    color: "#E1306C",
    metrics: ["followers", "reach", "impressions", "engagements", "posts", "stories", "profile_visits"],
  },
  youtube: {
    label: "YouTube",
    icon: "▶️",
    color: "#FF0000",
    metrics: ["followers", "video_views", "watch_time", "impressions", "engagements", "posts"],
  },
  twitter: {
    label: "X / Twitter",
    icon: "𝕏",
    color: "#000000",
    metrics: ["followers", "impressions", "engagements", "posts", "profile_visits"],
  },
  linkedin: {
    label: "LinkedIn",
    icon: "💼",
    color: "#0A66C2",
    metrics: ["followers", "reach", "impressions", "engagements", "posts", "profile_visits"],
  },
};
