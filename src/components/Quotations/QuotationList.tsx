import React, { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  ArrowRightLeft,
  Printer,
  Trash2,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { Quotation, BusinessProfile, Client } from "../../types";
import { formatCurrency } from "../../lib/storage";

interface QuotationListProps {
  quotations: Quotation[];
  clients: Client[];
  profile: BusinessProfile;
  onNewQuotation: () => void;
  onEditQuotation: (q: Quotation) => void;
  onDeleteQuotation: (id: string) => void;
  onConvertToInvoice: (q: Quotation) => void;
  onPrintQuotation: (q: Quotation) => void;
  onStatusChange: (id: string, status: Quotation["status"]) => void;
}

export const QuotationList: React.FC<QuotationListProps> = ({
  quotations,
  profile,
  onNewQuotation,
  onEditQuotation,
  onDeleteQuotation,
  onConvertToInvoice,
  onPrintQuotation,
  onStatusChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const symbol = profile.currencySymbol;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Quotations & Estimates
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create professional quotations for clients and convert them to invoices in one click.
          </p>
        </div>

        <button
          onClick={onNewQuotation}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition cursor-pointer border border-indigo-500/30"
        >
          <Plus className="w-4 h-4" />
          <span>Create Quotation</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search quotes or clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {["all", "draft", "sent", "accepted", "converted"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap cursor-pointer transition ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Quote #</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Expiry</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No quotations found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {q.quoteNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {q.clientName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{q.date}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{q.expiryDate}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(q.grandTotal, symbol)}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={q.status}
                        onChange={(e) =>
                          onStatusChange(q.id, e.target.value as Quotation["status"])
                        }
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border focus:outline-none cursor-pointer ${
                          q.status === "converted"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : q.status === "accepted"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : q.status === "sent"
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : q.status === "declined"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="accepted">Accepted</option>
                        <option value="declined">Declined</option>
                        <option value="converted">Converted</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Convert to Invoice Button */}
                        {q.status !== "converted" && (
                          <button
                            onClick={() => onConvertToInvoice(q)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 flex items-center gap-1 transition cursor-pointer"
                            title="Convert this quote directly to an Invoice"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Convert to Invoice</span>
                          </button>
                        )}

                        {/* Print/Download PDF Button */}
                        <button
                          onClick={() => onPrintQuotation(q)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          title="Print or View PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => onEditQuotation(q)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition cursor-pointer border border-slate-200"
                        >
                          Edit
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => onDeleteQuotation(q.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete quote"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
