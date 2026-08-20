import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  Plus,
  Search,
  Trash2,
  Calendar,
  X,
  Sparkles,
  Check,
  Tag,
  HelpCircle,
  TrendingDown,
  Receipt,
  FileCheck2,
  RefreshCw,
  Building2,
} from "lucide-react";
import { Expense, BusinessProfile, ExpenseCategory } from "../../types";
import { formatCurrency } from "../../lib/storage";
import {
  classifyExpenseAI,
  classifyExpenseLocal,
  EXPENSE_CATEGORIES,
  ExpenseClassificationResult,
} from "../../lib/aiClassifier";

interface ExpenseListProps {
  expenses: Expense[];
  profile: BusinessProfile;
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  profile,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Expense form state
  const [title, setTitle] = useState("");
  const [vendor, setVendor] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Operating Expenses");
  const [amount, setAmount] = useState<number | "">("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("Bank EFT / Debit Card");
  const [notes, setNotes] = useState("");

  // AI Classification State
  const [aiSuggestion, setAiSuggestion] = useState<ExpenseClassificationResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced real-time classification as the user types
  useEffect(() => {
    if (!isModalOpen) {
      setAiSuggestion(null);
      return;
    }

    const query = `${title} ${vendor}`.trim();
    if (query.length < 3) {
      setAiSuggestion(null);
      return;
    }

    // Fast local heuristic immediately
    const instantLocal = classifyExpenseLocal(title, vendor, typeof amount === "number" ? amount : 0);
    setAiSuggestion(instantLocal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsClassifying(true);
      try {
        const result = await classifyExpenseAI(
          title,
          vendor,
          typeof amount === "number" ? amount : 0
        );
        setAiSuggestion(result);
      } catch {
        // Keeps local guess
      } finally {
        setIsClassifying(false);
      }
    }, 600);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [title, vendor, amount, isModalOpen]);

  // One-click manual trigger for AI Classification
  const handleManualClassify = async () => {
    if (!title && !vendor) return;
    setIsClassifying(true);
    try {
      const result = await classifyExpenseAI(
        title,
        vendor,
        typeof amount === "number" ? amount : 0
      );
      setAiSuggestion(result);
      setCategory(result.category);
      if (result.suggestedVendor && !vendor) {
        setVendor(result.suggestedVendor);
      }
    } finally {
      setIsClassifying(false);
    }
  };

  const handleApplyAiCategory = () => {
    if (!aiSuggestion) return;
    setCategory(aiSuggestion.category);
    if (aiSuggestion.suggestedVendor && !vendor) {
      setVendor(aiSuggestion.suggestedVendor);
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "all" || e.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalTaxAmount = filteredExpenses.reduce((sum, e) => sum + (e.taxAmount || 0), 0);

  const handleSubmitNewExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || Number(amount) <= 0) return;

    const numAmount = Number(amount);
    const taxRate = profile.defaultTaxRate || 15;
    const taxAmount = numAmount * (taxRate / (100 + taxRate));

    const newExp: Expense = {
      id: `exp_${Date.now()}`,
      title,
      vendor: vendor || "General Supplier",
      category,
      date,
      amount: numAmount,
      taxAmount: Math.round(taxAmount * 100) / 100,
      isPaid: true,
      paymentMethod,
      notes,
    };

    onAddExpense(newExp);
    setIsModalOpen(false);
    setTitle("");
    setVendor("");
    setAmount("");
    setNotes("");
    setAiSuggestion(null);
  };

  const symbol = profile.currencySymbol;

  // Find badge styling for a category
  const getCategoryMeta = (cat: ExpenseCategory) => {
    return (
      EXPENSE_CATEGORIES.find((c) => c.value === cat) || {
        badgeBg: "bg-slate-100 border-slate-200",
        badgeText: "text-slate-800",
        color: "bg-slate-500",
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase mb-1">
            <Receipt className="w-4 h-4" />
            <span>Operational Cost Management & Input Tax Claims</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <span>Business Expenses & Supplier Bills</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log expenditure with real-time AI category suggestion for SARS Section 11(a) deductions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setTitle("");
              setVendor("");
              setAmount("");
              setCategory("Operating Expenses");
              setAiSuggestion(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition cursor-pointer border border-indigo-500/30"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Filtered Total Expenses
          </span>
          <div className="text-2xl font-black text-white mt-1.5 tracking-tight">
            {formatCurrency(totalExpenseAmount, symbol)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {filteredExpenses.length} transaction entries
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Input VAT Claimable (15%)
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1.5 tracking-tight">
            {formatCurrency(totalTaxAmount, symbol)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Deductible against Output VAT on VAT201
          </span>
        </div>

        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-2xl border border-indigo-800/60 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-indigo-300 text-[11px] font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Classifier Engine</span>
            </div>
            <div className="text-lg font-black text-white mt-1">Smart Auto-Categorizer</div>
            <p className="text-[10px] text-slate-300 mt-0.5">
              Powered by Gemini 3.7 Flash & South African accounting heuristics
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search vendor, description or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredExpenses.length} of {expenses.length} records
          </span>
        </div>

        {/* Category Scroll Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer border ${
              selectedCategoryFilter === "all"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Categories ({expenses.length})
          </button>
          {EXPENSE_CATEGORIES.map((cat) => {
            const count = expenses.filter((e) => e.category === cat.value).length;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategoryFilter(cat.value)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer border flex items-center gap-1.5 ${
                  selectedCategoryFilter === cat.value
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      selectedCategoryFilter === cat.value
                        ? "bg-indigo-700 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Expense Title / Description</th>
                <th className="py-3.5 px-4">Vendor</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Tax (15%)</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-slate-700 text-sm">
                        No expenses recorded matching the criteria.
                      </p>
                      <p className="text-xs text-slate-400">
                        Click "Record Expense" to log business expenditure with automatic AI categorization.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const meta = getCategoryMeta(exp.category);
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-500 whitespace-nowrap">
                        {exp.date}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>
                          <span>{exp.title}</span>
                          {exp.notes && (
                            <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                              {exp.notes}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                        {exp.vendor}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[11px] border ${meta.badgeBg} ${meta.badgeText}`}
                        >
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-500 whitespace-nowrap">
                        {formatCurrency(exp.taxAmount || 0, symbol)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 whitespace-nowrap">
                        {formatCurrency(exp.amount, symbol)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal with AI Classification Helper */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Record Business Expense</h3>
                  <p className="text-[10px] text-slate-300">With Real-Time AI Category Classifier</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewExpense} className="p-6 space-y-4 text-xs sm:text-sm text-slate-800 overflow-y-auto">
              {/* Expense Title / Description Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Expense Title / Description <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleManualClassify}
                    disabled={isClassifying || (!title && !vendor)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition disabled:opacity-40"
                  >
                    {isClassifying ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Classifying...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>AI Suggest Category</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Uber trip to client meeting in Sandton / Makro printer paper & toner / Eskom electricity"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 font-semibold"
                />
              </div>

              {/* AI Real-Time Suggestion Pill */}
              {aiSuggestion && (
                <div
                  onClick={handleApplyAiCategory}
                  className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-400 transition flex items-start justify-between gap-3 shadow-xs group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="text-xs font-bold text-indigo-950">
                        AI Suggested Category:{" "}
                        <span className="text-indigo-600 underline font-black">
                          {aiSuggestion.category}
                        </span>
                      </span>
                      <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-indigo-100 text-indigo-700 rounded-md">
                        {Math.round(aiSuggestion.confidence * 100)}% match
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {aiSuggestion.reason}
                    </p>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-1 bg-indigo-600 text-white rounded-lg group-hover:bg-indigo-700 shrink-0 whitespace-nowrap shadow-xs">
                    {category === aiSuggestion.category ? "Applied ✓" : "Apply Category"}
                  </span>
                </div>
              )}

              {/* Vendor & Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vendor / Payee</label>
                  <input
                    type="text"
                    placeholder="e.g. Uber, Makro, Vodacom, Shell"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount & Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Amount ({symbol}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value === "" ? "" : parseFloat(e.target.value))
                    }
                    required
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-black text-slate-900 text-base focus:ring-2 focus:ring-indigo-500"
                  />
                  {typeof amount === "number" && amount > 0 && (
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Includes 15% VAT: {formatCurrency(amount * (15 / 115), symbol)}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Payment Method & Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                >
                  <option value="Bank EFT / Direct Transfer">Bank EFT / Direct Transfer</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Order">Monthly Debit Order</option>
                  <option value="Cash / Petty Cash">Cash / Petty Cash</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Business Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Travel for on-site client audit in Centurion"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md transition cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Expense</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
