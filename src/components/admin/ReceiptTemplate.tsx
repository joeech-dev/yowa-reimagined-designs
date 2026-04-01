import { forwardRef } from "react";
import { format } from "date-fns";
import logo from "@/assets/Yowa_Logo_1.png";
import signature from "@/assets/joel-signature.png";
import stamp from "@/assets/yowa-stamp-new.png";
import type { InvoiceData } from "./InvoiceTemplate";
import { formatCurrency, type Currency } from "@/lib/currency";

interface ReceiptTemplateProps {
  data: InvoiceData & {
    payment_date?: string;
    payment_method?: string;
    receipt_number?: string;
    currency?: Currency;
  };
}

const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
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
            <h1 className="text-3xl font-bold tracking-wide" style={{ color: "hsl(46,93%,56%)" }}>RECEIPT</h1>
          </div>
        </div>

        {/* Payment Confirmation Banner */}
        <div className="text-white text-center py-2 rounded mb-4" style={{ backgroundColor: "hsl(164,100%,25%)" }}>
          <p className="text-sm font-bold">PAYMENT RECEIVED</p>
        </div>

        {/* Client & Receipt Info */}
        <div className="flex justify-between mb-4 border-t border-b border-gray-200 py-3">
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Received from:</p>
            <p className="font-bold text-sm">{data.client_name}</p>
            {data.client_address && <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{data.client_address}</p>}
            {data.client_phone && <p className="text-xs text-gray-600">{data.client_phone}</p>}
            {data.client_email && <p className="text-xs text-gray-600">{data.client_email}</p>}
          </div>
          <div className="text-right space-y-0.5">
            <p className="text-xs text-gray-500">Receipt No: <span className="font-bold text-black">{(data as any).receipt_number || `RCT-${data.invoice_number}`}</span></p>
            <p className="text-xs text-gray-500">Invoice No: <span className="font-bold text-black">{data.invoice_number}</span></p>
            <p className="text-xs text-gray-500">Payment Date: <span className="font-bold text-black">{(data as any).payment_date ? format(new Date((data as any).payment_date), "dd / MM / yyyy") : format(new Date(), "dd / MM / yyyy")}</span></p>
            {(data as any).payment_method && <p className="text-xs text-gray-500">Method: <span className="font-bold text-black">{(data as any).payment_method}</span></p>}
            <p className="text-xs text-gray-500">Currency: <span className="font-bold text-black">{cur}</span></p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-4 border-collapse">
          <thead>
            <tr style={{ backgroundColor: "hsl(46,93%,56%)" }} className="text-black">
              <th className="text-left p-2 text-xs font-semibold w-10">No</th>
              <th className="text-left p-2 text-xs font-semibold">Service</th>
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
            <div className="flex justify-between py-1.5 border-b border-gray-200">
              <span className="text-xs font-medium">Tax ({data.tax_rate}%):</span>
              <span className="text-xs font-bold">{data.tax_amount > 0 ? "" : "-"}{formatCurrency(Math.abs(data.tax_amount), cur)}</span>
            </div>
            <div className="flex justify-between py-2 text-black px-3 rounded-b" style={{ backgroundColor: "hsl(46,93%,56%)" }}>
              <span className="text-sm font-bold">Amount Paid:</span>
              <span className="text-sm font-bold">{formatCurrency(data.total, cur)}</span>
            </div>
          </div>
        </div>

        {/* Signature + Stamp */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Received by (Authorized Signature)</p>
            <img src={signature} alt="Authorized Signature" className="h-12 w-auto -mb-1" style={{ maxWidth: "160px" }} />
            <div className="w-40 border-t border-gray-400" />
          </div>
          <div>
            <img src={stamp} alt="Official Stamp" style={{ width: "160px", height: "auto", objectFit: "contain", opacity: 0.9 }} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-6">Client Signature</p>
            <div className="w-40 border-t border-gray-400" />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-gray-200 pt-3">
          <p className="text-xs text-gray-500 font-medium">Thank you for your business!</p>
          <p className="text-xs text-gray-400 mt-0.5">yowa.us | +256779180984 | +256786155557 | info@yowa.us</p>
        </div>
      </div>
    );
  }
);

ReceiptTemplate.displayName = "ReceiptTemplate";

export default ReceiptTemplate;
