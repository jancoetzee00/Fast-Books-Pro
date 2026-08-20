import React from "react";
import {
  TrendingUp,
  Receipt,
  FileText,
  Landmark,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Download,
  Building,
  ShieldCheck,
  HardDriveDownload,
  Sparkles,
  Bot,
  Zap,
} from "lucide-react";
import {
  BusinessProfile,
  Quotation,
  Invoice,
  BankAccount,
  BankTransaction,
  Expense,
} from "../types";
import { formatCurrency } from "../lib/storage";

interface DashboardProps {
  profile: BusinessProfile;
  quotations: Quotation[];
  invoices: Invoice[];
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  expenses: Expense[];
  onNavigate: (tab: string) => void;
  onNewQuotation: () => void;
  onNewInvoice: () => void;
  onConnectBank: () => void;
  onDownloadBackup: () => void;
  onOpenSettingsBackup: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  quotations,
  invoices,
  bankAccounts,
  bankTransactions,
  expenses,
  onNavigate,
  onNewQuotation,
  onNewInvoice,
  onConnectBank,
  onDownloadBackup,
  onOpenSettingsBackup,
}) => {
  const symbol = profile.currencySymbol;

  // Financial Computations
  const totalPaidRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.grandTotal, 0);

  const outstandingReceivable = invoices
    .filter((i) => i.status === "issued" || i.status === "partially_paid" || i.status === "overdue")
    .reduce((sum, i) => sum + (i.grandTotal - i.paidAmount), 0);

  const totalBankCash = bankAccounts.reduce((sum, b) => sum + b.balance, 0);

  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const netProfit = totalPaidRevenue - totalExpensesAmount;

  const unreconciledTxCount = bankTransactions.filter((t) => !t.isReconciled).length;

  const pendingQuotesCount = quotations.filter((q) => q.status === "sent" || q.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Fast-Books Proprietor Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {profile.ownerName}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              All financial records, quotations, invoices, and bank feeds are running locally on your computer with full ownership.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onNewQuotation}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-medium text-xs sm:text-sm border border-slate-700/80 transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>New Quotation</span>
            </button>
            <button
              onClick={onNewInvoice}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition cursor-pointer border border-indigo-500/50"
            >
              <Plus className="w-4 h-4" />
              <span>New Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cash in Bank */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Bank Cash
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(totalBankCash, symbol)}
            </span>
          </div>
          <div className="mt-2.5 text-xs text-emerald-700 font-medium flex items-center gap-1.5 bg-emerald-50/80 px-2.5 py-1 rounded-lg w-fit border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{bankAccounts.length} Connected Accounts</span>
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Outstanding Invoices
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(outstandingReceivable, symbol)}
            </span>
          </div>
          <div className="mt-2.5 text-xs text-amber-700 font-medium flex items-center gap-1.5 bg-amber-50/80 px-2.5 py-1 rounded-lg w-fit border border-amber-100">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {invoices.filter((i) => i.status === "issued" || i.status === "partially_paid").length} Pending Invoices
            </span>
          </div>
        </div>

        {/* Paid Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Collected Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(totalPaidRevenue, symbol)}
            </span>
          </div>
          <div className="mt-2.5 text-xs text-slate-600 font-medium flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg w-fit border border-slate-200/80">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>Net Profit: <strong className="text-slate-900">{formatCurrency(netProfit, symbol)}</strong></span>
          </div>
        </div>

        {/* Unreconciled Bank Items */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Bank Recon Status
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {unreconciledTxCount}{" "}
              <span className="text-xs font-normal text-slate-500">Unreconciled</span>
            </span>
          </div>
          <button
            onClick={() => onNavigate("bank-recon")}
            className="mt-2.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Reconcile feeds now &rarr;</span>
          </button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col (2 cols): Quick Invoices & Quotations Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Invoices */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-slate-900 text-base">Recent Invoices</h2>
              </div>
              <button
                onClick={() => onNavigate("invoices")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
              >
                View All &rarr;
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {invoices.slice(0, 4).map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between text-xs sm:text-sm hover:bg-slate-50/60 px-2 rounded-lg transition-colors">
                  <div>
                    <div className="font-bold text-slate-900">{inv.invoiceNumber}</div>
                    <div className="text-slate-500 text-xs font-medium">{inv.clientName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">
                      {formatCurrency(inv.grandTotal, symbol)}
                    </div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold mt-0.5 border ${
                        inv.status === "paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : inv.status === "issued"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {inv.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quotation Pipeline */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h2 className="font-bold text-slate-900 text-base">Active Quotations</h2>
              </div>
              <button
                onClick={() => onNavigate("quotations")}
                className="text-xs font-semibold text-teal-600 hover:text-teal-800 cursor-pointer transition-colors"
              >
                Manage Quotes &rarr;
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {quotations.slice(0, 4).map((quote) => (
                <div key={quote.id} className="py-3 flex items-center justify-between text-xs sm:text-sm hover:bg-slate-50/60 px-2 rounded-lg transition-colors">
                  <div>
                    <div className="font-bold text-slate-900">{quote.quoteNumber}</div>
                    <div className="text-slate-500 text-xs font-medium">{quote.clientName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">
                      {formatCurrency(quote.grandTotal, symbol)}
                    </div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold mt-0.5 border ${
                        quote.status === "converted"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : quote.status === "sent"
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {quote.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Google AI Bridge, Bank Feeds & Local Ownership */}
        <div className="space-y-6">
          {/* SARS & Monthly VAT Compliance Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SARS eFiling & 15% VAT Center</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                TCS: COMPLIANT
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Automated <strong>SARS VAT201 Monthly & Bi-Monthly Returns</strong>, <strong>EMP201 Payroll</strong>, and <strong>IRP6 Provisional Tax</strong> with official SARS PRN payment references.
            </p>

            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 text-[11px]">VAT Reg: 4910293847</span>
              <span className="text-emerald-400 text-[11px]">Standard 15%</span>
            </div>

            <div className="pt-1">
              <button
                onClick={() => onNavigate("sars-vat")}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-md shadow-amber-500/20"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Open SARS Returns & Monthly VAT &rarr;</span>
              </button>
            </div>
          </div>

          {/* Google AI Studio Ecosystem Card */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-5 shadow-lg border border-indigo-500/30 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>Google AI Ecosystem Bridge</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                GEMINI 3.7 FLASH
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Cross-app accounting pipeline connected to <strong>partssource-za</strong>, <strong>parts-drive-za</strong>, and <strong>part-smart-za</strong> with automated PO reconciliation, delivery billing, and quote generation.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-indigo-900/60 border border-indigo-500/30 text-[10px] font-mono text-indigo-200">
                ⚡ partssource-za
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-900/60 border border-indigo-500/30 text-[10px] font-mono text-indigo-200">
                🚚 parts-drive-za
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-900/60 border border-indigo-500/30 text-[10px] font-mono text-indigo-200">
                💡 part-smart-za
              </span>
            </div>

            <div className="pt-1 flex flex-col gap-2">
              <button
                onClick={() => onNavigate("google-ai")}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white flex items-center justify-center space-x-2 transition cursor-pointer shadow-md shadow-indigo-600/25 border border-indigo-400/30"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-200" />
                <span>Open Google AI Hub & Parts Connectors</span>
              </button>
            </div>
          </div>

          {/* Connected Bank Feeds */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Landmark className="w-5 h-5 text-slate-800" />
                <h2 className="font-bold text-slate-900 text-base">Bank Accounts</h2>
              </div>
              <button
                onClick={onConnectBank}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
              >
                + Connect Bank
              </button>
            </div>

            <div className="space-y-3">
              {bankAccounts.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 text-center space-y-2">
                  <p className="text-xs text-slate-500 font-medium">
                    No bank accounts connected • Starting on zero
                  </p>
                  <button
                    onClick={onConnectBank}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                  >
                    Connect Bank (Account # & PIN)
                  </button>
                </div>
              ) : (
                bankAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{acc.bankName}</div>
                      <div className="text-xs text-slate-500 font-medium font-mono">
                        Acc: {acc.accountNumber} • Branch: {acc.branchCode}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {formatCurrency(acc.balance, symbol)}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        PIN Verified • {acc.lastSynced ? acc.lastSynced.split(" ")[0] : "Active"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Desktop App & Local Hard Drive Ownership */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <HardDriveDownload className="w-4 h-4" />
              <span>Local Ownership & Backup</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Fast-Books is configured for <strong>Jan Coetzee</strong> as sole owner. You can install this program as a standalone desktop app or download a local JSON backup file to your hard drive anytime.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={onDownloadBackup}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white flex items-center justify-center space-x-2 transition cursor-pointer shadow-sm border border-emerald-500/30"
              >
                <Download className="w-4 h-4" />
                <span>Download Database Backup (.json)</span>
              </button>
              <button
                onClick={onOpenSettingsBackup}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium text-xs text-slate-300 border border-slate-700 flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <span>Backup & Desktop Suite in Settings &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
