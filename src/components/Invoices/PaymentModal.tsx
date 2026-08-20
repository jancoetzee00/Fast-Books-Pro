import React, { useState } from "react";
import { X, DollarSign, Check } from "lucide-react";
import { Invoice, PaymentRecord, BusinessProfile } from "../../types";
import { formatCurrency } from "../../lib/storage";

interface PaymentModalProps {
  invoice: Invoice;
  profile: BusinessProfile;
  onClose: () => void;
  onSavePayment: (payment: PaymentRecord) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  invoice,
  profile,
  onClose,
  onSavePayment,
}) => {
  const remainingBalance = invoice.grandTotal - invoice.paidAmount;

  const [amount, setAmount] = useState<number>(remainingBalance > 0 ? remainingBalance : 0);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState<PaymentRecord["method"]>("EFT");
  const [reference, setReference] = useState<string>(`EFT-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState<string>("Bank payment verified.");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const record: PaymentRecord = {
      id: `pay_${Date.now()}`,
      invoiceId: invoice.id,
      amount: Number(amount),
      date,
      method,
      reference,
      notes,
    };

    onSavePayment(record);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">Record Payment</h3>
            <p className="text-xs text-slate-400">
              Invoice {invoice.invoiceNumber} • {invoice.clientName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm text-slate-800">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-500 block">Total Invoice:</span>
              <span className="font-bold text-slate-900">{formatCurrency(invoice.grandTotal, profile.currencySymbol)}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Remaining Balance:</span>
              <span className="font-bold text-amber-600">{formatCurrency(remainingBalance, profile.currencySymbol)}</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Payment Amount ({profile.currencySymbol})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={remainingBalance * 1.5}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-base focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Payment Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentRecord["method"])}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            >
              <option value="EFT">EFT / Bank Transfer</option>
              <option value="Credit Card">Credit / Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Payment Reference / Bank ID</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. FNB-EFT-99210"
              required
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Payment Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
