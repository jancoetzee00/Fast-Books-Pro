import React from "react";
import { X, Printer } from "lucide-react";
import { Invoice, BusinessProfile } from "../../types";
import { formatCurrency } from "../../lib/storage";

interface InvoicePrintModalProps {
  invoice: Invoice;
  profile: BusinessProfile;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  profile,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const balanceDue = invoice.grandTotal - invoice.paidAmount;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Top Control Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm">Tax Invoice Preview & Print</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
              {invoice.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 overflow-y-auto bg-white text-slate-900 font-sans space-y-8" id="printable-invoice">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-8">
            <div>
              <div className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                {profile.companyName}
              </div>
              <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                <p>Proprietor: {profile.ownerName}</p>
                <p>Reg No: {profile.registrationNumber}</p>
                <p>VAT/Tax No: {profile.taxNumber}</p>
                <p>{profile.address}</p>
                <p>Email: {profile.email} | Tel: {profile.phone}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg font-black text-lg uppercase tracking-wider mb-2">
                TAX INVOICE
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Date:</strong> {invoice.date}</p>
                <p><strong>Due Date:</strong> {invoice.dueDate}</p>
              </div>
            </div>
          </div>

          {/* Client & Payment Status */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Billed To:
              </span>
              <p className="font-bold text-slate-900 text-sm">{invoice.clientName}</p>
              <p className="text-slate-600">{invoice.clientEmail}</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Payment Status
              </span>
              <span
                className={`inline-block px-3 py-1 rounded font-bold uppercase text-[10px] ${
                  invoice.status === "paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800 text-slate-900 font-bold uppercase text-[11px]">
                <th className="py-2.5 px-2">Description</th>
                <th className="py-2.5 px-2 text-center w-16">Qty</th>
                <th className="py-2.5 px-2 text-right w-28">Unit Price</th>
                <th className="py-2.5 px-2 text-center w-16">VAT %</th>
                <th className="py-2.5 px-2 text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 px-2 font-medium text-slate-800">{item.description}</td>
                  <td className="py-3 px-2 text-center">{item.quantity}</td>
                  <td className="py-3 px-2 text-right">
                    {formatCurrency(item.unitPrice, profile.currencySymbol)}
                  </td>
                  <td className="py-3 px-2 text-center">{item.taxRate}%</td>
                  <td className="py-3 px-2 text-right font-bold text-slate-900">
                    {formatCurrency(item.total, profile.currencySymbol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Payments */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal, profile.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>VAT / Tax Total:</span>
                <span>{formatCurrency(invoice.taxTotal, profile.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-800">
                <span>Grand Total:</span>
                <span>{formatCurrency(invoice.grandTotal, profile.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-emerald-700">
                <span>Amount Paid:</span>
                <span>{formatCurrency(invoice.paidAmount, profile.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Balance Due:</span>
                <span className={balanceDue > 0 ? "text-amber-700" : "text-emerald-700"}>
                  {formatCurrency(balanceDue, profile.currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Instructions & Bank Details */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
            <div>
              <h4 className="font-bold text-slate-900 mb-1 uppercase text-[10px] tracking-wider">
                Payment Instructions
              </h4>
              <p className="whitespace-pre-line leading-relaxed">{invoice.terms}</p>
              <p className="mt-2 text-slate-500 italic">{invoice.notes}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1.5 uppercase text-[10px] tracking-wider">
                EFT Banking Details
              </h4>
              <div className="space-y-0.5 text-[11px]">
                <p><strong>Bank:</strong> {profile.bankName}</p>
                <p><strong>Account Name:</strong> {profile.bankAccountHolder}</p>
                <p><strong>Account #:</strong> {profile.bankAccountNumber}</p>
                <p><strong>Branch Code:</strong> {profile.bankBranchCode}</p>
                <p><strong>Payment Ref:</strong> <span className="font-bold text-slate-900">{invoice.invoiceNumber}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
