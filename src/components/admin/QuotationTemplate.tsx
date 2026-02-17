import { forwardRef } from "react";
import { format } from "date-fns";
import logo from "@/assets/Yowa_Logo_1.png";
import type { InvoiceItem } from "./InvoiceTemplate";

export interface QuotationData {
  quotation_number: string;
  quotation_date: string;
  client_name: string;
  client_address?: string;
  client_phone?: string;
  client_email?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes?: string;
  title?: string;
  requested_by?: string;
  provided_by?: string;
}

interface QuotationTemplateProps {
  data: QuotationData;
}

const QuotationTemplate = forwardRef<HTMLDivElement, QuotationTemplateProps>(
  ({ data }, ref) => {
    return (
      <div ref={ref} className="bg-white text-black p-8 max-w-[210mm] mx-auto font-sans text-sm print:p-0 print:shadow-none" style={{ minHeight: "297mm" }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <img src={logo} alt="Yowa Innovations" className="h-16 mb-3" />
            <p className="font-bold text-base">Yowa Innovations Ltd</p>
            <p className="text-gray-600 text-xs leading-relaxed">
              Plot 3161, Bukasa Close Muyenga<br />
              Kampala, Uganda<br />
              +256779180984 | +256786155557<br />
              E-mail: info@yowa.us
            </p>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-[hsl(220,80%,45%)] tracking-wide">QUOTATION</h1>
          </div>
        </div>

        {/* Client & Quotation Info */}
        <div className="flex justify-between mb-8 border-t border-b border-gray-200 py-4">
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Quotation for:</p>
            <p className="font-bold">{data.client_name}</p>
            {data.client_address && (
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{data.client_address}</p>
            )}
            {data.client_phone && <p className="text-xs text-gray-600">{data.client_phone}</p>}
            {data.client_email && <p className="text-xs text-gray-600">{data.client_email}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Quotation No: <span className="font-bold text-black">{data.quotation_number}</span></p>
            <p className="text-xs text-gray-500">Date: <span className="font-bold text-black">{format(new Date(data.quotation_date), "dd / MM / yyyy")}</span></p>
          </div>
        </div>

        {/* Title */}
        {data.title && (
          <h2 className="text-center font-bold text-base mb-4 text-[hsl(220,80%,45%)]">{data.title}</h2>
        )}

        {/* Items Table */}
        <table className="w-full mb-6 border-collapse">
          <thead>
            <tr className="bg-[hsl(220,80%,45%)] text-white">
              <th className="text-left p-3 text-xs font-semibold w-12">No</th>
              <th className="text-left p-3 text-xs font-semibold">Service / Item</th>
              <th className="text-left p-3 text-xs font-semibold w-24">Qty</th>
              <th className="text-right p-3 text-xs font-semibold w-28">Unit Cost</th>
              <th className="text-right p-3 text-xs font-semibold w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="p-3 text-xs">{index + 1}</td>
                <td className="p-3 text-xs">{item.description}</td>
                <td className="p-3 text-xs">{item.quantity}</td>
                <td className="p-3 text-xs text-right">{Number(item.unit_cost).toLocaleString()}/=</td>
                <td className="p-3 text-xs text-right">{Number(item.total).toLocaleString()}/=</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-xs font-medium">Subtotal:</span>
              <span className="text-xs font-bold">{Number(data.subtotal).toLocaleString()}/=</span>
            </div>
            {data.tax_rate > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-xs font-medium">Tax ({data.tax_rate}%):</span>
                <span className="text-xs font-bold">{Number(data.tax_amount).toLocaleString()}/=</span>
              </div>
            )}
            <div className="flex justify-between py-3 bg-[hsl(220,80%,45%)] text-white px-3 rounded-b">
              <span className="text-sm font-bold">Total:</span>
              <span className="text-sm font-bold">{Number(data.total).toLocaleString()}/=</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="bg-gray-50 p-4 rounded mb-8">
            <h3 className="font-bold text-sm mb-2 text-[hsl(220,80%,45%)]">Notes</h3>
            <p className="text-xs text-gray-700 whitespace-pre-line">{data.notes}</p>
          </div>
        )}

        {/* Requested By / Provided By */}
        <div className="flex justify-between mb-8 mt-12">
          <div>
            <p className="text-xs text-gray-500 mb-1">Requested By:</p>
            <p className="text-sm font-medium mb-8">{data.requested_by || ""}</p>
            <div className="w-48 border-t border-gray-400" />
            <p className="text-xs text-gray-500 mt-1">Signature / Date</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Provided By:</p>
            <p className="text-sm font-medium mb-8">{data.provided_by || "Yowa Innovations Ltd"}</p>
            <div className="w-48 border-t border-gray-400" />
            <p className="text-xs text-gray-500 mt-1">Signature / Date</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500 font-medium">Thank you for considering Yowa Innovations!</p>
          <p className="text-xs text-gray-400 mt-1">yowa.us | +256779180984 | +256786155557 | info@yowa.us</p>
        </div>
      </div>
    );
  }
);

QuotationTemplate.displayName = "QuotationTemplate";

export default QuotationTemplate;
