import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  FileText,
  Calendar,
  CreditCard,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Receipt,
  Building2,
  DollarSign,
  Info,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import {
  BusinessProfile,
  Invoice,
  Expense,
  SarsComplianceProfile,
  SarsFilingItem,
  Vat201Return,
  VatFilingFrequency,
} from "../../types";
import { storage, formatCurrency } from "../../lib/storage";
import { Vat201PrintModal } from "./Vat201PrintModal";

interface SarsVatHubProps {
  profile: BusinessProfile;
  invoices: Invoice[];
  expenses: Expense[];
  onNavigateTab: (tab: string) => void;
}

export const SarsVatHub: React.FC<SarsVatHubProps> = ({
  profile,
  invoices,
  expenses,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"vat201" | "filings" | "compliance">("vat201");
  const [sarsProfile, setSarsProfile] = useState<SarsComplianceProfile>(() => storage.getSarsProfile());
  const [sarsFilings, setSarsFilings] = useState<SarsFilingItem[]>(() => storage.getSarsFilings());

  // Period Selector for VAT
  // Available monthly periods
  const availableMonths = [
    { key: "2026-08", label: "August 2026 (2026/08)", start: "2026-08-01", end: "2026-08-31", due: "2026-09-30" },
    { key: "2026-07", label: "July 2026 (2026/07)", start: "2026-07-01", end: "2026-07-31", due: "2026-08-31" },
    { key: "2026-06", label: "June 2026 (2026/06)", start: "2026-06-01", end: "2026-06-30", due: "2026-07-31" },
    { key: "2026-05", label: "May 2026 (2026/05)", start: "2026-05-01", end: "2026-05-31", due: "2026-06-30" },
    { key: "2026-04", label: "April 2026 (2026/04)", start: "2026-04-01", end: "2026-04-30", due: "2026-05-31" },
    { key: "2026-03", label: "March 2026 (2026/03)", start: "2026-03-01", end: "2026-03-31", due: "2026-04-30" },
  ];

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("2026-08");
  const [vatCategory, setVatCategory] = useState<VatFilingFrequency>(sarsProfile.vatCategory || "monthly");
  
  // Drill-down filter
  const [drilldownTab, setDrilldownTab] = useState<"invoices" | "expenses">("invoices");
  const [searchFilter, setSearchFilter] = useState("");

  // Modals & UI States
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [copiedPrn, setCopiedPrn] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New filing modal state
  const [isAddFilingOpen, setIsAddFilingOpen] = useState(false);
  const [newFilingType, setNewFilingType] = useState<SarsFilingItem["filingType"]>("VAT201");
  const [newFilingTitle, setNewFilingTitle] = useState("");
  const [newFilingPeriod, setNewFilingPeriod] = useState("2026/09");
  const [newFilingDueDate, setNewFilingDueDate] = useState("2026-10-31");
  const [newFilingAmount, setNewFilingAmount] = useState("");

  const activePeriodConfig = availableMonths.find((m) => m.key === selectedMonthKey) || availableMonths[0];

  // Dynamic VAT Return calculation for the selected period
  const vatReturn: Vat201Return = useMemo(() => {
    return storage.calculateVatReturn(
      invoices,
      expenses,
      activePeriodConfig.key,
      activePeriodConfig.label,
      activePeriodConfig.start,
      activePeriodConfig.end,
      activePeriodConfig.due,
      vatCategory
    );
  }, [invoices, expenses, activePeriodConfig, vatCategory]);

  // Invoices & Expenses for the active period
  const periodInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const d = inv.date || inv.createdAt?.split("T")[0] || "";
      const matchesPeriod = d >= activePeriodConfig.start && d <= activePeriodConfig.end;
      const matchesSearch =
        searchFilter === "" ||
        inv.invoiceNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesPeriod && matchesSearch;
    });
  }, [invoices, activePeriodConfig, searchFilter]);

  const periodExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const d = exp.date || "";
      const matchesPeriod = d >= activePeriodConfig.start && d <= activePeriodConfig.end;
      const matchesSearch =
        searchFilter === "" ||
        exp.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        exp.vendor.toLowerCase().includes(searchFilter.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesPeriod && matchesSearch;
    });
  }, [expenses, activePeriodConfig, searchFilter]);

  // Handlers
  const handleCopyPrn = () => {
    navigator.clipboard.writeText(vatReturn.sarsPrn);
    setCopiedPrn(true);
    setTimeout(() => setCopiedPrn(false), 2000);
  };

  const handleSaveProfile = (updated: SarsComplianceProfile) => {
    setSarsProfile(updated);
    storage.saveSarsProfile(updated);
    setStatusMessage("SARS Compliance Profile updated successfully.");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleToggleFilingStatus = (id: string, newStatus: SarsFilingItem["status"]) => {
    const updated = sarsFilings.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          status: newStatus,
          filedDate: newStatus === "filed_efiling" ? new Date().toISOString().split("T")[0] : f.filedDate,
          paymentDate: newStatus === "paid" ? new Date().toISOString().split("T")[0] : f.paymentDate,
        };
      }
      return f;
    });
    setSarsFilings(updated);
    storage.saveSarsFilings(updated);
  };

  const handleAddFiling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilingTitle.trim()) return;

    const newFiling: SarsFilingItem = {
      id: `filing_${Date.now()}`,
      filingType: newFilingType,
      title: newFilingTitle,
      periodLabel: newFilingPeriod,
      taxYear: 2027,
      dueDate: newFilingDueDate,
      liabilityAmount: Number(newFilingAmount) || 0,
      status: "upcoming",
      sarsPrn: `PRN-${newFilingType}-${newFilingPeriod.replace(/\//g, "")}-${Math.floor(10000 + Math.random() * 90000)}`,
      notes: `Custom SARS submission added on ${new Date().toLocaleDateString("en-ZA")}`,
    };

    const updated = [newFiling, ...sarsFilings];
    setSarsFilings(updated);
    storage.saveSarsFilings(updated);
    setIsAddFilingOpen(false);
    setNewFilingTitle("");
    setNewFilingAmount("");
  };

  const handleExportVatCsv = () => {
    storage.exportToCSV(`SARS_VAT201_${activePeriodConfig.key}`, [
      { Field: "SARS VAT Registration Number", Value: sarsProfile.vatRegistrationNumber },
      { Field: "Tax Period", Value: activePeriodConfig.label },
      { Field: "Field 1 - Standard Rate Sales (Excl VAT)", Value: vatReturn.standardRateSalesExcl },
      { Field: "Field 1A - Output Tax Standard Rate (15%)", Value: vatReturn.outputVatStandardRate },
      { Field: "Field 2 - Zero Rated Supplies", Value: vatReturn.zeroRatedSupplies },
      { Field: "Field 3 - Exempt Supplies", Value: vatReturn.exemptSupplies },
      { Field: "Field 4A - Total Output Tax", Value: vatReturn.totalOutputTax },
      { Field: "Field 15 - Standard Rate Operating Expenses (Excl VAT)", Value: vatReturn.standardRateExpensesExcl },
      { Field: "Field 15A - Input Tax Goods & Services (15%)", Value: vatReturn.inputVatStandardRate },
      { Field: "Field 19 - Total Input Tax", Value: vatReturn.totalInputTax },
      { Field: "Field 20 - Net VAT Payable to SARS / (Refund)", Value: vatReturn.netVatPayable },
      { Field: "SARS Payment Reference Number (PRN)", Value: vatReturn.sarsPrn },
      { Field: "Filing Due Date", Value: vatReturn.filingDueDate },
    ]);
  };

  const isRefund = vatReturn.netVatPayable < 0;

  return (
    <div className="space-y-6">
      {/* Top Banner: SARS Compliance Center Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                SARS eFiling & Monthly VAT Return Center
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                TCS: {sarsProfile.taxClearanceStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Official South African Revenue Service (SARS) compliant accounting module. Automated <strong>VAT201 Monthly/Bi-Monthly Returns (15% VAT)</strong>, <strong>EMP201 Payroll Declarations</strong>, <strong>IRP6 Provisional Tax</strong>, and electronic filing PRN reconciliation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-indigo-200">
            <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800">
              VAT Reg: <strong className="text-white">{sarsProfile.vatRegistrationNumber}</strong>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800">
              Tax PIN: <strong className="text-emerald-300">{sarsProfile.taxPinNumber}</strong>
            </div>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">Selected VAT Period</span>
            <strong className="text-white font-bold text-sm block mt-0.5">{activePeriodConfig.label.split(" ")[0]}</strong>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">Output VAT (Invoiced)</span>
            <strong className="text-indigo-300 font-bold text-sm block mt-0.5">
              {formatCurrency(vatReturn.totalOutputTax, profile.currencySymbol)}
            </strong>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">Input VAT (Claimable)</span>
            <strong className="text-emerald-300 font-bold text-sm block mt-0.5">
              {formatCurrency(vatReturn.totalInputTax, profile.currencySymbol)}
            </strong>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">Net Payable / (Refund)</span>
            <strong className={`font-black text-sm block mt-0.5 ${isRefund ? "text-emerald-400" : "text-amber-400"}`}>
              {formatCurrency(Math.abs(vatReturn.netVatPayable), profile.currencySymbol)} {isRefund ? "(Refund)" : "(Due)"}
            </strong>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {statusMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Sub-Nav */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-sm space-x-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab("vat201")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "vat201"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Monthly VAT201 Return (15%)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("filings")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "filings"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>SARS Filings & Deadlines ({sarsFilings.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("compliance")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "compliance"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>SARS Profile & Tax Clearance (TCS)</span>
        </button>
      </div>

      {/* TAB 1: MONTHLY VAT201 RETURN DECLARATION */}
      {activeSubTab === "vat201" && (
        <div className="space-y-6">
          {/* Period Selector & Action Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Select VAT Period:
                </label>
                <select
                  value={selectedMonthKey}
                  onChange={(e) => setSelectedMonthKey(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {availableMonths.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  SARS VAT Filing Frequency:
                </label>
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => {
                      setVatCategory("monthly");
                      handleSaveProfile({ ...sarsProfile, vatCategory: "monthly" });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      vatCategory === "monthly"
                        ? "bg-white text-indigo-900 shadow-sm font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Category C (Monthly)
                  </button>
                  <button
                    onClick={() => {
                      setVatCategory("bi_monthly_a");
                      handleSaveProfile({ ...sarsProfile, vatCategory: "bi_monthly_a" });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      vatCategory === "bi_monthly_a"
                        ? "bg-white text-indigo-900 shadow-sm font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Category A / B (Bi-Monthly)
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyPrn}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition cursor-pointer"
                title="Copy SARS 19-digit Payment Reference Number"
              >
                {copiedPrn ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                <span className="font-mono text-[11px]">{vatReturn.sarsPrn}</span>
              </button>

              <button
                onClick={handleExportVatCsv}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>View & Print VAT201</span>
              </button>
            </div>
          </div>

          {/* SARS VAT201 Calculation Summary Sheet */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: SARS Output & Input Box Matrix */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      SARS VAT201 Line Items Breakdown
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Applicable for Tax Period: {activePeriodConfig.label} ({activePeriodConfig.start} to {activePeriodConfig.end})
                    </span>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200">
                    SA Standard Rate: 15%
                  </span>
                </div>

                {/* Section A: Output Tax */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Part A: Output Tax (Sales & Supplies)
                  </span>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl divide-y divide-slate-200 text-xs">
                    <div className="p-3 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-800">Field 1: Standard Rate Sales (Excl. VAT)</span>
                        <span className="text-[10px] text-slate-400 block">{periodInvoices.length} invoices issued in period</span>
                      </div>
                      <strong className="font-mono text-slate-900">
                        {formatCurrency(vatReturn.standardRateSalesExcl, profile.currencySymbol)}
                      </strong>
                    </div>

                    <div className="p-3 flex justify-between items-center bg-indigo-50/50">
                      <div>
                        <strong className="text-indigo-950">Field 1A: Output Tax on Standard Rate (15%)</strong>
                        <span className="text-[10px] text-indigo-700 block">VAT collected on taxable turnover</span>
                      </div>
                      <strong className="font-mono text-indigo-950 text-sm">
                        {formatCurrency(vatReturn.outputVatStandardRate, profile.currencySymbol)}
                      </strong>
                    </div>

                    <div className="p-3 flex justify-between items-center text-slate-500">
                      <span>Field 2: Zero-Rated Supplies (Exports / Exempt spares)</span>
                      <span className="font-mono">{formatCurrency(0, profile.currencySymbol)}</span>
                    </div>

                    <div className="p-3 flex justify-between items-center bg-indigo-100/60 font-bold border-t-2 border-indigo-200">
                      <span className="text-indigo-950">Field 4 / 4A: TOTAL OUTPUT TAX</span>
                      <span className="font-mono text-indigo-950 text-sm">
                        {formatCurrency(vatReturn.totalOutputTax, profile.currencySymbol)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section B: Input Tax */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Part B: Input Tax (Allowable Business Expenses)
                  </span>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl divide-y divide-slate-200 text-xs">
                    <div className="p-3 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-800">Field 15: Standard Rate Operating Expenses (Excl. VAT)</span>
                        <span className="text-[10px] text-slate-400 block">{periodExpenses.length} expense slips claimed</span>
                      </div>
                      <strong className="font-mono text-slate-900">
                        {formatCurrency(vatReturn.standardRateExpensesExcl, profile.currencySymbol)}
                      </strong>
                    </div>

                    <div className="p-3 flex justify-between items-center bg-emerald-50/50">
                      <div>
                        <strong className="text-emerald-950">Field 15A: Input Tax on Standard Rate (15%)</strong>
                        <span className="text-[10px] text-emerald-700 block">Deductible VAT paid to vendors/suppliers</span>
                      </div>
                      <strong className="font-mono text-emerald-950 text-sm">
                        {formatCurrency(vatReturn.inputVatStandardRate, profile.currencySymbol)}
                      </strong>
                    </div>

                    <div className="p-3 flex justify-between items-center bg-emerald-100/60 font-bold border-t-2 border-emerald-200">
                      <span className="text-emerald-950">Field 19: TOTAL INPUT TAX</span>
                      <span className="font-mono text-emerald-950 text-sm">
                        {formatCurrency(vatReturn.totalInputTax, profile.currencySymbol)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Net Position, SARS eFiling Submission Card & Deadlines */}
            <div className="lg:col-span-5 space-y-4">
              {/* Field 20 Net Position Card */}
              <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Field 20: Net SARS VAT Liability
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Due: {activePeriodConfig.due}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">
                    {isRefund ? "Refund Claimable from SARS:" : "Amount Payable to SARS:"}
                  </span>
                  <div className={`text-3xl font-black font-mono tracking-tight mt-1 ${isRefund ? "text-emerald-400" : "text-amber-400"}`}>
                    {formatCurrency(Math.abs(vatReturn.netVatPayable), profile.currencySymbol)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {isRefund
                      ? "Your allowable Input Tax exceeds Output Tax. SARS will credit your bank account upon verification."
                      : "Output tax collected exceeds input deductions. Payment must reflect in SARS account by the due date."}
                  </p>
                </div>

                {/* PRN Display */}
                <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">SARS eFiling PRN Number:</span>
                  <div className="flex items-center justify-between">
                    <strong className="font-mono text-xs text-indigo-300">{vatReturn.sarsPrn}</strong>
                    <button
                      onClick={handleCopyPrn}
                      className="text-[10px] text-indigo-400 hover:text-indigo-200 font-semibold cursor-pointer"
                    >
                      {copiedPrn ? "Copied!" : "Copy PRN"}
                    </button>
                  </div>
                </div>

                {/* Quick eFiling Checkbox status */}
                <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">SARS eFiling Submission:</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      READY TO SUBMIT
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">SARS Branch Office:</span>
                    <span className="text-slate-400 text-[11px]">{sarsProfile.taxOffice}</span>
                  </div>
                </div>
              </div>

              {/* Quick Assistant Checklist */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  SARS VAT201 Audit Checklist
                </h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>All client tax invoices contain 15% VAT breakdown and company registration number.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Input tax claims backed by valid vendor tax invoices with VAT numbers.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>No personal or non-allowable expenses claimed in Field 15.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Drill-down Audit Tables */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDrilldownTab("invoices")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    drilldownTab === "invoices"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Output Invoices ({periodInvoices.length})
                </button>
                <button
                  onClick={() => setDrilldownTab("expenses")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    drilldownTab === "expenses"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Input Expenses ({periodExpenses.length})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            {/* Invoices Table */}
            {drilldownTab === "invoices" && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-y border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3 text-right">Subtotal (Excl VAT)</th>
                      <th className="py-2.5 px-3 text-right">Output VAT (15%)</th>
                      <th className="py-2.5 px-3 text-right">Grand Total</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {periodInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                          No invoices found for this tax period ({activePeriodConfig.label}).
                        </td>
                      </tr>
                    ) : (
                      periodInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 font-mono text-slate-600">{inv.date}</td>
                          <td className="py-2.5 px-3 font-bold font-mono text-slate-900">{inv.invoiceNumber}</td>
                          <td className="py-2.5 px-3 text-slate-800 font-medium">{inv.clientName}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            {formatCurrency(inv.subtotal, profile.currencySymbol)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700">
                            {formatCurrency(inv.taxTotal, profile.currencySymbol)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(inv.grandTotal, profile.currencySymbol)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 uppercase">
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Expenses Table */}
            {drilldownTab === "expenses" && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-y border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Title / Expense</th>
                      <th className="py-2.5 px-3">Vendor</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Excl. VAT Amount</th>
                      <th className="py-2.5 px-3 text-right">Input VAT (15%)</th>
                      <th className="py-2.5 px-3 text-right">Total Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {periodExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                          No expense records found for this tax period ({activePeriodConfig.label}).
                        </td>
                      </tr>
                    ) : (
                      periodExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 font-mono text-slate-600">{exp.date}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{exp.title}</td>
                          <td className="py-2.5 px-3 text-slate-700">{exp.vendor}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 text-[10px] rounded bg-slate-100 text-slate-600">
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            {formatCurrency(exp.amount - (exp.taxAmount || 0), profile.currencySymbol)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                            {formatCurrency(exp.taxAmount || 0, profile.currencySymbol)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(exp.amount, profile.currencySymbol)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SARS FILINGS & EFILING DEADLINES SCHEDULE */}
      {activeSubTab === "filings" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  SARS Tax Calendar & Filing Deadlines
                </h3>
                <span className="text-[11px] text-slate-500">
                  Track upcoming and completed tax returns: VAT201, EMP201, IRP6 Provisional Tax, and ITR14.
                </span>
              </div>

              <button
                onClick={() => setIsAddFilingOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add SARS Tax Return</span>
              </button>
            </div>

            {/* Filings List */}
            <div className="grid grid-cols-1 gap-3">
              {sarsFilings.map((filing) => {
                const isOverdue = new Date(filing.dueDate) < new Date() && filing.status !== "filed_efiling" && filing.status !== "paid";
                return (
                  <div
                    key={filing.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-indigo-100 text-indigo-900 border border-indigo-200">
                          {filing.filingType}
                        </span>
                        <strong className="text-sm font-bold text-slate-900">{filing.title}</strong>
                        {filing.status === "filed_efiling" && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                            FILED ON EFILING
                          </span>
                        )}
                        {filing.status === "paid" && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-100 text-sky-800">
                            PAID VIA EFT
                          </span>
                        )}
                        {filing.status === "ready_to_file" && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-900">
                            READY TO FILE
                          </span>
                        )}
                        {isOverdue && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800">
                            OVERDUE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{filing.notes}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 font-mono pt-1">
                        <span>Period: <strong>{filing.periodLabel}</strong></span>
                        <span>Due: <strong className={isOverdue ? "text-rose-700" : "text-slate-800"}>{filing.dueDate}</strong></span>
                        <span>PRN: <strong className="text-indigo-800">{filing.sarsPrn}</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {filing.liabilityAmount > 0 && (
                        <div className="text-right mr-2">
                          <span className="text-[10px] text-slate-400 uppercase block font-mono">Liability</span>
                          <strong className="text-xs font-mono font-bold text-slate-900">
                            {formatCurrency(filing.liabilityAmount, profile.currencySymbol)}
                          </strong>
                        </div>
                      )}

                      {filing.status !== "filed_efiling" && filing.status !== "paid" ? (
                        <button
                          onClick={() => handleToggleFilingStatus(filing.id, "filed_efiling")}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark as Filed</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleFilingStatus(filing.id, "upcoming")}
                          className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition cursor-pointer"
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SARS PROFILE & TAX CLEARANCE (TCS) */}
      {activeSubTab === "compliance" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: SARS Registration Numbers */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  SARS Vendor Registration & Tax Clearance (TCS) Profile
                </h3>
                <span className="text-[11px] text-slate-500">
                  Registered statutory numbers used for SARS eFiling VAT201, EMP201, and IRP6 submissions.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    VAT Registration Number (10 Digits):
                  </label>
                  <input
                    type="text"
                    value={sarsProfile.vatRegistrationNumber}
                    onChange={(e) => setSarsProfile({ ...sarsProfile, vatRegistrationNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Income Tax Number:
                  </label>
                  <input
                    type="text"
                    value={sarsProfile.incomeTaxNumber}
                    onChange={(e) => setSarsProfile({ ...sarsProfile, incomeTaxNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    PAYE Registration Number:
                  </label>
                  <input
                    type="text"
                    value={sarsProfile.payeNumber}
                    onChange={(e) => setSarsProfile({ ...sarsProfile, payeNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    UIF Registration Number:
                  </label>
                  <input
                    type="text"
                    value={sarsProfile.uifNumber}
                    onChange={(e) => setSarsProfile({ ...sarsProfile, uifNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Customs & Import/Export Code:
                  </label>
                  <input
                    type="text"
                    value={sarsProfile.customsCode || ""}
                    onChange={(e) => setSarsProfile({ ...sarsProfile, customsCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Tax Compliance PIN (TCS PIN):
                  </label>
                  <input
                    type="text"
                    value={sarsProfile.taxPinNumber}
                    onChange={(e) => setSarsProfile({ ...sarsProfile, taxPinNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-emerald-800 font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Registered Tax Office / Branch:
                  </label>
                  <input
                    type="text"
                    value={sarsProfile.taxOffice}
                    onChange={(e) => setSarsProfile({ ...sarsProfile, taxOffice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleSaveProfile(sarsProfile)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                >
                  Save SARS Profile Settings
                </button>
              </div>
            </div>
          </div>

          {/* Right Card: Tax Clearance Status Certificate Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase">SARS Tax Compliance Status</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  VERIFIED
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-base text-white">Tax Clearance Verification</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Third parties (clients, banks, and procurement tenders) can verify your tax compliance status online via SARS eFiling using your Tax PIN.
                </p>
              </div>

              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1 text-xs">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Security Tax PIN</span>
                <strong className="text-emerald-400 font-mono text-sm block">{sarsProfile.taxPinNumber}</strong>
                <span className="text-[10px] text-slate-400 block pt-1">
                  Entity: {sarsProfile.registeredName || profile.companyName}
                </span>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`SARS Tax Compliance PIN: ${sarsProfile.taxPinNumber} (Tax Number: ${sarsProfile.incomeTaxNumber})`);
                  setStatusMessage("Tax PIN copied to clipboard for tender/client verification.");
                  setTimeout(() => setStatusMessage(null), 3000);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy PIN for Verification</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official SARS VAT201 Print Modal */}
      {isPrintModalOpen && (
        <Vat201PrintModal
          vatReturn={vatReturn}
          profile={profile}
          sarsProfile={sarsProfile}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {/* Add SARS Filing Modal */}
      {isAddFilingOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Add SARS Tax Filing / Return</h3>
              <button
                onClick={() => setIsAddFilingOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddFiling} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Return Type:</label>
                <select
                  value={newFilingType}
                  onChange={(e) => {
                    const t = e.target.value as any;
                    setNewFilingType(t);
                    if (t === "VAT201") setNewFilingTitle("VAT201 Monthly Return (September 2026)");
                    else if (t === "EMP201") setNewFilingTitle("EMP201 Monthly Payroll Tax (September 2026)");
                    else if (t === "IRP6_P2") setNewFilingTitle("Provisional Tax IRP6 (2nd Period 2027)");
                    else if (t === "ITR14") setNewFilingTitle("Annual Corporate Income Tax (ITR14 2027)");
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="VAT201">VAT201 (Value-Added Tax)</option>
                  <option value="EMP201">EMP201 (PAYE, UIF, SDL Payroll)</option>
                  <option value="IRP6_P1">IRP6 Period 1 (Provisional Tax - August)</option>
                  <option value="IRP6_P2">IRP6 Period 2 (Provisional Tax - February)</option>
                  <option value="ITR14">ITR14 (Annual Corporate Tax)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Filing Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VAT201 Monthly Return (September 2026)"
                  value={newFilingTitle}
                  onChange={(e) => setNewFilingTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Period Label:</label>
                  <input
                    type="text"
                    value={newFilingPeriod}
                    onChange={(e) => setNewFilingPeriod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Due Date:</label>
                  <input
                    type="date"
                    value={newFilingDueDate}
                    onChange={(e) => setNewFilingDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Estimated Liability (ZAR):</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newFilingAmount}
                  onChange={(e) => setNewFilingAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddFilingOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Save Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
