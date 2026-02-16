import { forwardRef } from "react";
import { format } from "date-fns";
import logo from "@/assets/Yowa_Logo_1.png";
import type { InvoiceData } from "./InvoiceTemplate";

interface ReceiptTemplateProps {
  data: InvoiceData & {
    payment_date?: string;
    payment_method?: string;
    receipt_number?: string;
  };
}

const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
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
            <h1 className="text-3xl font-bold text-[hsl(46,93%,56%)] tracking-wide">RECEIPT</h1>
          </div>
        </div>

        {/* Payment Confirmation Banner */}
        <div className="bg-[hsl(164,100%,25%)] text-white text-center py-3 rounded mb-6">
          <p className="text-lg font-bold">PAYMENT RECEIVED</p>
        </div>

        {/* Client & Receipt Info */}
        <div className="flex justify-between mb-8 border-t border-b border-gray-200 py-4">
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Received from:</p>
            <p className="font-bold">{data.client_name}</p>
            {data.client_address && (
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{data.client_address}</p>
            )}
            {data.client_phone && <p className="text-xs text-gray-600">{data.client_phone}</p>}
            {data.client_email && <p className="text-xs text-gray-600">{data.client_email}</p>}
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs text-gray-500">Receipt No: <span className="font-bold text-black">{data.receipt_number || `RCT-${data.invoice_number}`}</span></p>
            <p className="text-xs text-gray-500">Invoice No: <span className="font-bold text-black">{data.invoice_number}</span></p>
            <p className="text-xs text-gray-500">Payment Date: <span className="font-bold text-black">{data.payment_date ? format(new Date(data.payment_date), "dd / MM / yyyy") : format(new Date(), "dd / MM / yyyy")}</span></p>
            {data.payment_method && (
              <p className="text-xs text-gray-500">Payment Method: <span className="font-bold text-black">{data.payment_method}</span></p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6 border-collapse">
          <thead>
            <tr className="bg-[hsl(46,93%,56%)] text-black">
              <th className="text-left p-3 text-xs font-semibold w-12">No</th>
              <th className="text-left p-3 text-xs font-semibold">Service</th>
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
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-xs font-medium">Tax ({data.tax_rate}%):</span>
              <span className="text-xs font-bold">{data.tax_amount > 0 ? "" : "-"}{Number(Math.abs(data.tax_amount)).toLocaleString()}/=</span>
            </div>
            <div className="flex justify-between py-3 bg-[hsl(46,93%,56%)] text-black px-3 rounded-b">
              <span className="text-sm font-bold">Amount Paid:</span>
              <span className="text-sm font-bold">{Number(data.total).toLocaleString()}/=</span>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="flex justify-between mb-8">
          <div>
            <p className="text-xs text-gray-500 mb-8">Received by (Authorized Signature)</p>
            <div className="w-48 border-t border-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-8">Client Signature</p>
            <div className="w-48 border-t border-gray-400" />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500 font-medium">Thank you for your business!</p>
          <p className="text-xs text-gray-400 mt-1">yowa.us | +256779180984 | +256786155557 | info@yowa.us</p>
        </div>
      </div>
    );
  }
);

ReceiptTemplate.displayName = "ReceiptTemplate";

export default ReceiptTemplate;
