import { useSocialMediaClients, useSocialMediaReports } from "@/hooks/useSocialMediaReports";
import { PLATFORM_CONFIG } from "./platformConfig";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import YowaLogo from "@/assets/Yowa_Logo_1.png";

interface Props {
  clientId: string;
  onBack: () => void;
}

export function SocialReportPrint({ clientId, onBack }: Props) {
  const { data: clients } = useSocialMediaClients();
  const { data: reports } = useSocialMediaReports(clientId);
  const client = clients?.find((c) => c.id === clientId);

  const handlePrint = () => window.print();

  // Group reports by platform
  const byPlatform: Record<string, typeof reports> = {};
  (reports || []).forEach((r) => {
    if (!byPlatform[r.platform]) byPlatform[r.platform] = [];
    byPlatform[r.platform]!.push(r);
  });

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  // Totals per platform
  function platformTotals(platformReports: typeof reports = []) {
    return platformReports.reduce(
      (acc, r) => ({
        followers: Math.max(acc.followers, r.followers_count || 0),
        reach: acc.reach + (r.total_reach || 0),
        impressions: acc.impressions + (r.total_impressions || 0),
        engagements: acc.engagements + (r.total_engagements || 0),
        likes: acc.likes + (r.total_likes || 0),
        comments: acc.comments + (r.total_comments || 0),
        shares: acc.shares + (r.total_shares || 0),
        posts: acc.posts + (r.total_posts || 0),
        eng_rate: acc.eng_rate + (r.engagement_rate || 0),
        count: acc.count + 1,
      }),
      { followers: 0, reach: 0, impressions: 0, engagements: 0, likes: 0, comments: 0, shares: 0, posts: 0, eng_rate: 0, count: 0 }
    );
  }

  return (
    <div>
      {/* Screen controls — hidden when printing */}
      <div className="print:hidden flex gap-3 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" /> Print / Save PDF
        </Button>
      </div>

      {/* Printable report */}
      <div id="print-report" className="bg-white text-gray-900 p-8 max-w-4xl mx-auto print:p-0 print:max-w-full">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4 mb-6">
          <div>
            <img src={YowaLogo} alt="Yowa Innovations" className="h-10 mb-2 print:h-8" />
            <p className="text-xs text-gray-500">Social Media Performance Report</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Generated: {today}</p>
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h1 className="text-2xl font-bold text-gray-900">{client?.name}</h1>
          <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
            {client?.contact_person && <span>👤 {client.contact_person}</span>}
            {client?.contact_email && <span>✉️ {client.contact_email}</span>}
            {client?.industry && <span>🏢 {client.industry}</span>}
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {client?.platforms?.map((p) => (
              <span key={p} className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-0.5 text-xs font-medium">
                {PLATFORM_CONFIG[p]?.icon} {PLATFORM_CONFIG[p]?.label || p}
              </span>
            ))}
          </div>
        </div>

        {/* Platform Sections */}
        {Object.entries(byPlatform).map(([platform, reps]) => {
          const cfg = PLATFORM_CONFIG[platform];
          const totals = platformTotals(reps);
          const avgEngRate = totals.count ? (totals.eng_rate / totals.count).toFixed(2) : "0.00";

          return (
            <div key={platform} className="mb-8 print:break-inside-avoid">
              <div className="flex items-center gap-2 mb-3" style={{ borderLeft: `4px solid ${cfg?.color || "#333"}`, paddingLeft: 12 }}>
                <span className="text-xl">{cfg?.icon}</span>
                <h2 className="text-lg font-bold">{cfg?.label || platform}</h2>
                <span className="text-xs text-gray-500 ml-auto">{reps?.length} report period(s)</span>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Followers", value: totals.followers.toLocaleString() },
                  { label: "Total Reach", value: totals.reach.toLocaleString() },
                  { label: "Impressions", value: totals.impressions.toLocaleString() },
                  { label: "Engagements", value: totals.engagements.toLocaleString() },
                  { label: "Likes", value: totals.likes.toLocaleString() },
                  { label: "Comments", value: totals.comments.toLocaleString() },
                  { label: "Shares", value: totals.shares.toLocaleString() },
                  { label: "Avg Eng. Rate", value: `${avgEngRate}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded p-3 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                    <p className="font-bold text-base">{value}</p>
                  </div>
                ))}
              </div>

              {/* Period breakdown table */}
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2 border border-gray-200 text-xs">Period</th>
                    <th className="text-right p-2 border border-gray-200 text-xs">Followers</th>
                    <th className="text-right p-2 border border-gray-200 text-xs">Reach</th>
                    <th className="text-right p-2 border border-gray-200 text-xs">Impressions</th>
                    <th className="text-right p-2 border border-gray-200 text-xs">Engagements</th>
                    <th className="text-right p-2 border border-gray-200 text-xs">Posts</th>
                    <th className="text-right p-2 border border-gray-200 text-xs">Eng. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {reps?.map((r) => (
                    <tr key={r.id} className="even:bg-gray-50">
                      <td className="p-2 border border-gray-200 text-xs">{r.report_period_start} → {r.report_period_end}</td>
                      <td className="p-2 border border-gray-200 text-right text-xs">{r.followers_count?.toLocaleString()}</td>
                      <td className="p-2 border border-gray-200 text-right text-xs">{r.total_reach?.toLocaleString()}</td>
                      <td className="p-2 border border-gray-200 text-right text-xs">{r.total_impressions?.toLocaleString()}</td>
                      <td className="p-2 border border-gray-200 text-right text-xs">{r.total_engagements?.toLocaleString()}</td>
                      <td className="p-2 border border-gray-200 text-right text-xs">{r.total_posts}</td>
                      <td className="p-2 border border-gray-200 text-right text-xs">{r.engagement_rate?.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Notes */}
              {reps?.some((r) => r.notes) && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-gray-700">
                  <strong>Notes:</strong>
                  {reps?.filter((r) => r.notes).map((r, i) => (
                    <p key={i} className="mt-1">• {r.notes}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Footer */}
        <div className="border-t border-gray-300 pt-4 mt-8 flex justify-between text-xs text-gray-400">
          <span>Prepared by Yowa Innovations — yowainnovations.com</span>
          <span>Confidential</span>
        </div>
      </div>
    </div>
  );
}
