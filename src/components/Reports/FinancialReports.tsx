import React, { useState } from "react";
import { BarChart3, TrendingUp, PieChart, ShieldCheck, Printer, Download } from "lucide-react";
import { Invoice, Expense, BusinessProfile } from "../../types";
import { formatCurrency, storage } from "../../lib/storage";

interface FinancialReportsProps {
  invoices: Invoice[];
  expenses: Expense[];
  profile: BusinessProfile;
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  invoices,
  expenses,
  profile,
}) => {
  const [reportType, setReportType] = useState<"pnl" | "tax" | "aging">("pnl");

  const symbol = profile.currencySymbol;

  // P&L Calculations
  const grossRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.grandTotal, 0);

  const subtotalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.subtotal, 0);

  const outputVatCollected = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.taxTotal, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const inputVatPaid = expenses.reduce((sum, e) => sum + (e.taxAmount || 0), 0);

  const netOperatingIncome = subtotalRevenue - (totalExpenses - inputVatPaid);

  const netVatPayable = outputVatCollected - inputVatPaid;

  // Accounts Receivable Aging Calculations
  const outstandingInvoices = invoices.filter(
    (i) => i.status === "issued" || i.status === "partially_paid" || i.status === "overdue"
  );

  const totalAR = outstandingInvoices.reduce(
    (sum, i) => sum + (i.grandTotal - i.paidAmount),
    0
  );

  const handleExportCSVReport = () => {
    if (reportType === "pnl") {
      storage.exportToCSV("profit_and_loss_report", [
        { Metric: "Gross Revenue Collected", Amount: grossRevenue },
        { Metric: "Net Revenue (Excl VAT)", Amount: subtotalRevenue },
        { Metric: "Output VAT Collected", Amount: outputVatCollected },
        { Metric: "Total Operating Expenses", Amount: totalExpenses },
        { Metric: "Input VAT Claimable", Amount: inputVatPaid },
        { Metric: "Net Operating Income", Amount: netOperatingIncome },
      ]);
    } else if (reportType === "tax") {
      storage.exportToCSV("vat_tax_report", [
        { Description: "Output VAT Collected (Invoices)", Amount: outputVatCollected },
        { Description: "Input VAT Paid (Expenses)", Amount: inputVatPaid },
        { Description: "Net VAT Liability Payable", Amount: netVatPayable },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Financial Intelligence & Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready financial statements for Jan Coetzee: Profit & Loss, Tax Returns, Accounts Receivable.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSVReport}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition cursor-pointer border border-slate-200"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer border border-slate-700"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Switcher */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setReportType("pnl")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            reportType === "pnl"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Profit & Loss Statement
        </button>
        <button
          onClick={() => setReportType("tax")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            reportType === "tax"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          VAT / Sales Tax Summary
        </button>
        <button
          onClick={() => setReportType("aging")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            reportType === "aging"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Accounts Receivable Aging
        </button>
      </div>

      {/* Report Content */}
      {reportType === "pnl" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Income Statement (Profit & Loss)</h2>
            <p className="text-xs text-slate-500">
              For {profile.companyName} ({profile.ownerName}) • Standard Accounting Period
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            {/* Revenue Section */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
              <span className="font-bold uppercase text-[11px] text-slate-500 block">Revenue</span>
              <div className="flex justify-between font-medium">
                <span>Gross Collected Sales (Incl VAT)</span>
                <span>{formatCurrency(grossRevenue, symbol)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Less VAT Collected ({profile.defaultTaxRate}%)</span>
                <span>-{formatCurrency(outputVatCollected, symbol)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-sm">
                <span>Net Sales Revenue</span>
                <span>{formatCurrency(subtotalRevenue, symbol)}</span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
              <span className="font-bold uppercase text-[11px] text-slate-500 block">Operating Expenses</span>
              <div className="flex justify-between font-medium">
                <span>Total Business Expenses</span>
                <span>{formatCurrency(totalExpenses, symbol)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Less Claimable Input VAT</span>
                <span>-{formatCurrency(inputVatPaid, symbol)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-sm">
                <span>Net Operating Expenses (Excl VAT)</span>
                <span>{formatCurrency(totalExpenses - inputVatPaid, symbol)}</span>
              </div>
            </div>

            {/* Net Operating Profit */}
            <div className="bg-emerald-950 text-white p-5 rounded-2xl flex justify-between items-center shadow-lg">
              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">
                  Net Operating Profit
                </span>
                <p className="text-xs text-slate-300">Revenue minus operating expenses</p>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                {formatCurrency(netOperatingIncome, symbol)}
              </span>
            </div>
          </div>
        </div>
      )}

      {reportType === "tax" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold text-slate-900">VAT / Sales Tax Liability Return</h2>
            <p className="text-xs text-slate-500">Tax Reg #: {profile.taxNumber}</p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                  Output VAT Collected (Sales)
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {formatCurrency(outputVatCollected, symbol)}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                  Input VAT Paid (Purchases)
                </span>
                <span className="text-xl font-bold text-emerald-600">
                  {formatCurrency(inputVatPaid, symbol)}
                </span>
              </div>
            </div>

            <div className="p-5 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">
                  Net Tax Liability Payable
                </span>
                <p className="text-xs text-slate-400">Output VAT (15%) minus Input VAT claimable</p>
              </div>
              <span className="text-2xl font-black text-white">
                {formatCurrency(netVatPayable, symbol)}
              </span>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                <div className="text-xs">
                  <strong className="text-indigo-950 font-bold block">Looking for official SARS VAT201 line breakdown?</strong>
                  <span className="text-indigo-700">Use the dedicated SARS & Monthly VAT hub for Field 1 to 20 calculations and eFiling PRN generation.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === "aging" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Accounts Receivable Aging</h2>
              <p className="text-xs text-slate-500">Outstanding client invoices by age</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 block uppercase">Total Receivable</span>
              <span className="text-xl font-black text-amber-600">{formatCurrency(totalAR, symbol)}</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            {outstandingInvoices.length === 0 ? (
              <p className="py-6 text-center text-slate-400">No overdue or open invoices!</p>
            ) : (
              outstandingInvoices.map((inv) => {
                const balance = inv.grandTotal - inv.paidAmount;
                return (
                  <div key={inv.id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">{inv.invoiceNumber} • {inv.clientName}</div>
                      <div className="text-slate-500 text-xs">Due Date: {inv.dueDate}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-600">{formatCurrency(balance, symbol)}</div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">{inv.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
