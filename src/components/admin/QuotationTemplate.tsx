import { forwardRef } from "react";
import { format } from "date-fns";
import logo from "@/assets/Yowa_Logo_1.png";
import signature from "@/assets/joel-signature.png";
import stamp from "@/assets/yowa-stamp-new.png";
import type { InvoiceItem } from "./InvoiceTemplate";
import { formatCurrency, type Currency } from "@/lib/currency";

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
  currency?: Currency;
}

interface QuotationTemplateProps {
  data: QuotationData;
}

const QuotationTemplate = forwardRef<HTMLDivElement, QuotationTemplateProps>(
  ({ data }, ref) => {
    const cur = data.currency || "UGX";
    return (
      <div ref={ref} className="bg-white text-black px-8 pt-6 pb-4 max-w-[210mm] mx-auto font-sans text-sm print:p-6 print:shadow-none" style={{ minHeight: "297mm" }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <img src={logo} alt="Yowa Innovations" className="h-12 mb-2" />
            <p className="font-bold text-sm">Yowa Innovations Ltd</p>
            <p className="text-gray-600 text-xs leading-relaxed">
              Plot 3161, Bukasa Close Muyenga<br />
              Kampala, Uganda<br />
              +256779180984 | +256786155557<br />
              E-mail: info@yowa.us
            </p>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold tracking-wide" style={{ color: "hsl(220,80%,45%)" }}>QUOTATION</h1>
          </div>
        </div>

        {/* Client & Quotation Info */}
        <div className="flex justify-between mb-4 border-t border-b border-gray-200 py-3">
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Prepared for:</p>
            <p className="font-bold text-sm">{data.client_name}</p>
            {data.client_address && <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{data.client_address}</p>}
            {data.client_phone && <p className="text-xs text-gray-600">{data.client_phone}</p>}
            {data.client_email && <p className="text-xs text-gray-600">{data.client_email}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Quotation No: <span className="font-bold text-black">{data.quotation_number}</span></p>
            <p className="text-xs text-gray-500">Date: <span className="font-bold text-black">{format(new Date(data.quotation_date), "dd / MM / yyyy")}</span></p>
            <p className="text-xs text-gray-500">Currency: <span className="font-bold text-black">{cur}</span></p>
          </div>
        </div>

        {/* Title */}
        {data.title && (
          <h2 className="text-center font-bold text-sm mb-3" style={{ color: "hsl(220,80%,45%)" }}>{data.title}</h2>
        )}

        {/* Items Table */}
        <table className="w-full mb-4 border-collapse">
          <thead>
            <tr style={{ backgroundColor: "hsl(220,80%,45%)" }} className="text-white">
              <th className="text-left p-2 text-xs font-semibold w-10">No</th>
              <th className="text-left p-2 text-xs font-semibold">Description</th>
              <th className="text-left p-2 text-xs font-semibold w-20">Qty</th>
              <th className="text-right p-2 text-xs font-semibold w-24">Unit Cost</th>
              <th className="text-right p-2 text-xs font-semibold w-24">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="p-2 text-xs">{index + 1}</td>
                <td className="p-2 text-xs">{item.description}</td>
                <td className="p-2 text-xs">{item.quantity}</td>
                <td className="p-2 text-xs text-right">{formatCurrency(item.unit_cost, cur)}</td>
                <td className="p-2 text-xs text-right">{formatCurrency(item.total, cur)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-4">
          <div className="w-56">
            <div className="flex justify-between py-1.5 border-b border-gray-200">
              <span className="text-xs font-medium">Subtotal:</span>
              <span className="text-xs font-bold">{formatCurrency(data.subtotal, cur)}</span>
            </div>
            {data.tax_rate > 0 && (
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-xs font-medium">Tax ({data.tax_rate}%):</span>
                <span className="text-xs font-bold">{formatCurrency(data.tax_amount, cur)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 text-white px-3 rounded-b" style={{ backgroundColor: "hsl(220,80%,45%)" }}>
              <span className="text-sm font-bold">Total:</span>
              <span className="text-sm font-bold">{formatCurrency(data.total, cur)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="bg-gray-50 p-3 rounded mb-4">
            <h3 className="font-bold text-xs mb-1" style={{ color: "hsl(220,80%,45%)" }}>Notes</h3>
            <p className="text-xs text-gray-700 whitespace-pre-line">{data.notes}</p>
          </div>
        )}

        {/* Requested By / Provided By with Signature + Stamp */}
        <div className="flex justify-between items-end mb-4 mt-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Requested By:</p>
            <p className="text-xs font-medium mb-6">{data.requested_by || ""}</p>
            <div className="w-40 border-t border-gray-400" />
            <p className="text-xs text-gray-500 mt-1">Signature / Date</p>
          </div>
          <div>
            <img src={stamp} alt="Official Stamp" style={{ width: "160px", height: "auto", objectFit: "contain", opacity: 0.9 }} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Provided By:</p>
            <p className="text-xs font-medium mb-1">{data.provided_by || "Yowa Innovations Ltd"}</p>
            <img src={signature} alt="Authorized Signature" className="h-10 w-auto -mb-1" style={{ maxWidth: "140px" }} />
            <div className="w-40 border-t border-gray-400" />
            <p className="text-xs text-gray-500 mt-1">Signature / Date</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-gray-200 pt-3">
          <p className="text-xs text-gray-500 font-medium">Thank you for considering Yowa Innovations!</p>
          <p className="text-xs text-gray-400 mt-0.5">yowa.us | +256779180984 | +256786155557 | info@yowa.us</p>
        </div>
      </div>
    );
  }
);

QuotationTemplate.displayName = "QuotationTemplate";

export default QuotationTemplate;
