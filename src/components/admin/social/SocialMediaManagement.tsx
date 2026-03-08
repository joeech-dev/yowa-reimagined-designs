import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialClientsManager } from "./SocialClientsManager";
import { SocialReportEntry } from "./SocialReportEntry";
import { SocialReportDashboard } from "./SocialReportDashboard";
import { SocialReportPrint } from "./SocialReportPrint";
import { Users, BarChart3, PlusCircle, FileText } from "lucide-react";

export function SocialMediaManagement() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [printClientId, setPrintClientId] = useState<string | null>(null);

  if (printClientId) {
    return (
      <SocialReportPrint
        clientId={printClientId}
        onBack={() => setPrintClientId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Social Media Reports</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Track, analyse, and report social media performance for your clients
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2 text-xs">
            <BarChart3 className="h-3.5 w-3.5" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="entry" className="flex items-center gap-2 text-xs">
            <PlusCircle className="h-3.5 w-3.5" /> Enter Data
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2 text-xs">
            <Users className="h-3.5 w-3.5" /> Clients
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2 text-xs">
            <FileText className="h-3.5 w-3.5" /> Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <SocialReportDashboard
            onPrintReport={(clientId) => setPrintClientId(clientId)}
          />
        </TabsContent>

        <TabsContent value="entry">
          <SocialReportEntry
            selectedClientId={selectedClientId}
            onClientSelected={setSelectedClientId}
          />
        </TabsContent>

        <TabsContent value="clients">
          <SocialClientsManager />
        </TabsContent>

        <TabsContent value="reports">
          <SocialReportDashboard
            onPrintReport={(clientId) => setPrintClientId(clientId)}
            tableView
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
