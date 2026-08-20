import React from "react";
import { X, Printer, Download, ShieldCheck } from "lucide-react";
import { Quotation, BusinessProfile } from "../../types";
import { formatCurrency } from "../../lib/storage";

interface QuotationPrintModalProps {
  quotation: Quotation;
  profile: BusinessProfile;
  onClose: () => void;
}

export const QuotationPrintModal: React.FC<QuotationPrintModalProps> = ({
  quotation,
  profile,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm">Quotation Preview & Print</span>
            <span className="text-xs px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-semibold">
              {quotation.quoteNumber}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow transition cursor-pointer flex items-center gap-1.5"
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

        {/* Printable Document Container */}
        <div className="p-8 sm:p-12 overflow-y-auto bg-white text-slate-900 font-sans space-y-8" id="printable-quote">
          {/* Header Section */}
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
              <div className="inline-block px-4 py-1.5 bg-teal-50 text-teal-800 rounded-lg font-black text-lg uppercase tracking-wider mb-2">
                QUOTATION
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p><strong>Quote #:</strong> {quotation.quoteNumber}</p>
                <p><strong>Date:</strong> {quotation.date}</p>
                <p><strong>Valid Until:</strong> {quotation.expiryDate}</p>
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Prepared For:
              </span>
              <p className="font-bold text-slate-900 text-sm">{quotation.clientName}</p>
              <p className="text-slate-600">{quotation.clientEmail}</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Status
              </span>
              <span className="inline-block px-2.5 py-1 rounded bg-slate-200 text-slate-800 font-bold uppercase text-[10px]">
                {quotation.status}
              </span>
            </div>
          </div>

          {/* Items Table */}
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
              {quotation.items.map((item, i) => (
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

          {/* Totals Section */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(quotation.subtotal, profile.currencySymbol)}</span>
              </div>
              {quotation.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(quotation.discountTotal, profile.currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>VAT / Tax Total:</span>
                <span>{formatCurrency(quotation.taxTotal, profile.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-800">
                <span>Grand Total:</span>
                <span>{formatCurrency(quotation.grandTotal, profile.currencySymbol)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Bank Payment Details */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
            <div>
              <h4 className="font-bold text-slate-900 mb-1 uppercase text-[10px] tracking-wider">
                Notes & Terms
              </h4>
              <p className="whitespace-pre-line leading-relaxed">{quotation.notes}</p>
              <p className="mt-2 text-slate-500 italic">{quotation.terms}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1.5 uppercase text-[10px] tracking-wider">
                Bank Deposit Information
              </h4>
              <div className="space-y-0.5 text-[11px]">
                <p><strong>Bank:</strong> {profile.bankName}</p>
                <p><strong>Account Holder:</strong> {profile.bankAccountHolder}</p>
                <p><strong>Account Number:</strong> {profile.bankAccountNumber}</p>
                <p><strong>Branch Code:</strong> {profile.bankBranchCode}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
