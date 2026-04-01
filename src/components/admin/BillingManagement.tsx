import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ClipboardList, Receipt, FileCheck } from "lucide-react";
import QuotationsManagement from "./QuotationsManagement";
import WorkOrdersManagement from "./WorkOrdersManagement";
import InvoicesManagement from "./InvoicesManagement";
import type { InvoiceItem } from "./InvoiceTemplate";
import type { Currency } from "@/lib/currency";

export interface BillingPrefill {
  client_name: string;
  client_address?: string;
  client_phone?: string;
  client_email?: string;
  items: InvoiceItem[];
  tax_rate: number;
  notes?: string;
  project_id?: string;
  requested_by?: string;
  provided_by?: string;
  sourceRef?: string; // e.g. "QT-001" or "WO-001"
  currency?: Currency;
}

const BillingManagement = () => {
  const [activeTab, setActiveTab] = useState("quotations");
  const [workOrderPrefill, setWorkOrderPrefill] = useState<BillingPrefill | null>(null);
  const [invoicePrefill, setInvoicePrefill] = useState<BillingPrefill | null>(null);

  const handleMakeOrderForm = (prefill: BillingPrefill) => {
    setWorkOrderPrefill(prefill);
    setActiveTab("work-orders");
  };

  const handleMakeInvoice = (prefill: BillingPrefill) => {
    setInvoicePrefill(prefill);
    setActiveTab("invoices");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage quotations, work orders, invoices & receipts</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
          <QuotationsManagement onMakeOrderForm={handleMakeOrderForm} />
        </TabsContent>

        <TabsContent value="work-orders" className="mt-6">
          <WorkOrdersManagement
            prefill={workOrderPrefill}
            onPrefillConsumed={() => setWorkOrderPrefill(null)}
            onMakeInvoice={handleMakeInvoice}
          />
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <InvoicesManagement
            prefill={invoicePrefill}
            onPrefillConsumed={() => setInvoicePrefill(null)}
          />
        </TabsContent>

        <TabsContent value="receipts" className="mt-6">
          <InvoicesManagement receiptMode />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingManagement;
