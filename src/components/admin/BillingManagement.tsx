import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ClipboardList, Receipt, FileCheck } from "lucide-react";
import QuotationsManagement from "./QuotationsManagement";
import WorkOrdersManagement from "./WorkOrdersManagement";
import InvoicesManagement from "./InvoicesManagement";

const BillingManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage quotations, work orders, invoices & receipts</p>
      </div>

      <Tabs defaultValue="quotations" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-grid">
          <TabsTrigger value="quotations" className="gap-2">
            <FileCheck className="h-4 w-4 hidden md:block" />
            Quotations
          </TabsTrigger>
          <TabsTrigger value="work-orders" className="gap-2">
            <ClipboardList className="h-4 w-4 hidden md:block" />
            Work Orders
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="h-4 w-4 hidden md:block" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="receipts" className="gap-2">
            <Receipt className="h-4 w-4 hidden md:block" />
            Receipts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quotations" className="mt-6">
          <QuotationsManagement />
        </TabsContent>

        <TabsContent value="work-orders" className="mt-6">
          <WorkOrdersManagement />
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <InvoicesManagement />
        </TabsContent>

        <TabsContent value="receipts" className="mt-6">
          <InvoicesManagement receiptMode />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingManagement;
