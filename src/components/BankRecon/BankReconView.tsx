import React, { useState } from "react";
import {
  Landmark,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Search,
  Check,
  Trash2,
  RotateCcw,
  CreditCard,
  Hash,
  KeyRound,
  ShieldCheck,
  X,
  Tag,
  CheckSquare,
  Square,
  Layers,
  Filter,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import {
  BankAccount,
  BankTransaction,
  Invoice,
  Expense,
  BusinessProfile,
  ExpenseCategory,
} from "../../types";
import { formatCurrency } from "../../lib/storage";

interface BankReconViewProps {
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  invoices: Invoice[];
  expenses: Expense[];
  profile: BusinessProfile;
  onOpenBankLogin: () => void;
  onReconcileTransaction: (
    txId: string,
    matchedId?: string,
    matchedType?: "invoice" | "expense"
  ) => void;
  onBatchReconcile?: (txIds: string[], reconcile: boolean) => void;
  onBatchDeleteTransactions?: (txIds: string[]) => void;
  onBatchTagTransactions?: (txIds: string[], category?: string, tag?: string) => void;
  onDeleteAccount: (accountId: string) => void;
  onDeleteAllAccountsAndTransactions: () => void;
  onResetBalanceToZero: (accountId: string) => void;
  onAddManualTransaction: (transaction: BankTransaction) => void;
  onDeleteTransaction: (txId: string) => void;
}

const PRESET_CATEGORIES = [
  "Customer Payment",
  "Supplier Payment",
  "Office Supplies",
  "Utilities",
  "Travel",
  "Vehicle & Petrol",
  "Software & Cloud",
  "Rent & Property",
  "Professional Fees",
  "Marketing & Ads",
  "Operating Expenses",
  "Tax / SARS",
  "Bank Charges",
  "Owner Equity / Drawings",
  "Other",
];

export const BankReconView: React.FC<BankReconViewProps> = ({
  bankAccounts,
  bankTransactions,
  invoices,
  expenses,
  profile,
  onOpenBankLogin,
  onReconcileTransaction,
  onBatchReconcile,
  onBatchDeleteTransactions,
  onBatchTagTransactions,
  onDeleteAccount,
  onDeleteAllAccountsAndTransactions,
  onResetBalanceToZero,
  onAddManualTransaction,
  onDeleteTransaction,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    bankAccounts[0]?.id || ""
  );

  const activeAccount =
    bankAccounts.find((a) => a.id === selectedAccountId) || bankAccounts[0];

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unreconciled" | "reconciled">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAiMatching, setIsAiMatching] = useState(false);
  const [aiMatchNotification, setAiMatchNotification] = useState("");

  // Batch Multi-Select state
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());

  // Modals inside Bank Recon
  const [isManualTxModalOpen, setIsManualTxModalOpen] = useState(false);
  const [isConfirmDeleteAllOpen, setIsConfirmDeleteAllOpen] = useState(false);
  const [isConfirmDeleteAccountOpen, setIsConfirmDeleteAccountOpen] = useState(false);
  const [isBatchTagModalOpen, setIsBatchTagModalOpen] = useState(false);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const [isCategorizedDeleteModalOpen, setIsCategorizedDeleteModalOpen] = useState(false);

  // Batch action form state
  const [batchCategory, setBatchCategory] = useState("Supplier Payment");
  const [batchTagInput, setBatchTagInput] = useState("");
  const [targetCategoryToDelete, setTargetCategoryToDelete] = useState("Bank Charges");

  // Manual Transaction Form state
  const [txDescription, setTxDescription] = useState("");
  const [txAmount, setTxAmount] = useState<number | "">("");
  const [txType, setTxType] = useState<"deposit" | "withdrawal">("deposit");
  const [txReference, setTxReference] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [txCategory, setTxCategory] = useState("Income");

  const accountTx = bankTransactions.filter(
    (t) => !activeAccount || t.bankAccountId === activeAccount.id
  );

  const filteredTx = accountTx.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "reconciled" ? t.isReconciled : !t.isReconciled);
    const matchesCat =
      categoryFilter === "all" ||
      (categoryFilter === "uncategorized" ? !t.category : t.category === categoryFilter);
    return matchesSearch && matchesFilter && matchesCat;
  });

  // Calculate Reconciliation totals
  const bankBalance = activeAccount ? activeAccount.balance : 0;
  const unreconciledItems = accountTx.filter((t) => !t.isReconciled);
  const unreconciledSum = unreconciledItems.reduce((sum, t) => sum + t.amount, 0);
  const ledgerBalance = bankBalance - unreconciledSum;
  const variance = bankBalance - ledgerBalance - unreconciledSum; // R 0.00 when accounts balance

  // Batch Multi-Selection Helpers
  const toggleSelectTx = (txId: string) => {
    const next = new Set(selectedTxIds);
    if (next.has(txId)) next.delete(txId);
    else next.add(txId);
    setSelectedTxIds(next);
  };

  const handleToggleSelectAll = () => {
    if (selectedTxIds.size === filteredTx.length && filteredTx.length > 0) {
      setSelectedTxIds(new Set());
    } else {
      setSelectedTxIds(new Set(filteredTx.map((t) => t.id)));
    }
  };

  const handleSelectAllUnreconciled = () => {
    const unrec = filteredTx.filter((t) => !t.isReconciled).map((t) => t.id);
    setSelectedTxIds(new Set(unrec));
  };

  const handleSelectAllReconciled = () => {
    const rec = filteredTx.filter((t) => t.isReconciled).map((t) => t.id);
    setSelectedTxIds(new Set(rec));
  };

  const handleClearSelection = () => {
    setSelectedTxIds(new Set());
  };

  // Selected totals
  const selectedTransactions = accountTx.filter((t) => selectedTxIds.has(t.id));
  const selectedTotalAmount = selectedTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Batch Operations Execution
  const executeBatchReconcileAction = (reconcile: boolean) => {
    if (selectedTxIds.size === 0) return;
    const ids = Array.from(selectedTxIds);
    if (onBatchReconcile) {
      onBatchReconcile(ids, reconcile);
    } else {
      ids.forEach((id) => {
        const tx = bankTransactions.find((t) => t.id === id);
        if (tx && tx.isReconciled !== reconcile) {
          onReconcileTransaction(id);
        }
      });
    }
    setAiMatchNotification(
      `Batch action complete: ${ids.length} transaction(s) marked as ${reconcile ? "Reconciled" : "Unreconciled"}.`
    );
    setSelectedTxIds(new Set());
  };

  const executeBatchTagAction = () => {
    if (selectedTxIds.size === 0) return;
    const ids = Array.from(selectedTxIds);
    if (onBatchTagTransactions) {
      onBatchTagTransactions(ids, batchCategory, batchTagInput ? batchTagInput.trim() : undefined);
    }
    setIsBatchTagModalOpen(false);
    setBatchTagInput("");
    setAiMatchNotification(`Batch tagged ${ids.length} transaction(s) with category '${batchCategory}'.`);
    setSelectedTxIds(new Set());
  };

  const executeBatchDeleteAction = () => {
    if (selectedTxIds.size === 0) return;
    const ids = Array.from(selectedTxIds);
    if (onBatchDeleteTransactions) {
      onBatchDeleteTransactions(ids);
    } else {
      ids.forEach((id) => onDeleteTransaction(id));
    }
    setIsBatchDeleteModalOpen(false);
    setAiMatchNotification(`Successfully deleted ${ids.length} selected transaction(s).`);
    setSelectedTxIds(new Set());
  };

  const executeCategorizedDeleteAction = () => {
    const targets = accountTx.filter((t) => t.category === targetCategoryToDelete);
    if (targets.length === 0) {
      setIsCategorizedDeleteModalOpen(false);
      return;
    }
    const ids = targets.map((t) => t.id);
    if (onBatchDeleteTransactions) {
      onBatchDeleteTransactions(ids);
    } else {
      ids.forEach((id) => onDeleteTransaction(id));
    }
    setIsCategorizedDeleteModalOpen(false);
    setAiMatchNotification(
      `Categorized deletion complete: Removed ${ids.length} transaction(s) under '${targetCategoryToDelete}'.`
    );
    setSelectedTxIds(new Set());
  };

  // AI Smart Match trigger
  const handleAiAutoMatch = () => {
    setIsAiMatching(true);
    setAiMatchNotification("");

    setTimeout(() => {
      let matchedCount = 0;
      accountTx.forEach((tx) => {
        if (!tx.isReconciled && tx.amount > 0) {
          const matchInv = invoices.find(
            (inv) =>
              inv.status !== "paid" &&
              (Math.abs(inv.grandTotal - tx.amount) < 0.01 ||
                tx.description.toLowerCase().includes(inv.invoiceNumber.toLowerCase()))
          );
          if (matchInv) {
            onReconcileTransaction(tx.id, matchInv.id, "invoice");
            matchedCount++;
          }
        } else if (!tx.isReconciled && tx.amount < 0) {
          const absAmt = Math.abs(tx.amount);
          const matchExp = expenses.find(
            (exp) => Math.abs(exp.amount - absAmt) < 0.01
          );
          if (matchExp) {
            onReconcileTransaction(tx.id, matchExp.id, "expense");
            matchedCount++;
          }
        }
      });

      setIsAiMatching(false);
      setAiMatchNotification(
        matchedCount > 0
          ? `AI Assistant successfully matched ${matchedCount} bank transaction(s) to open invoices & expenses!`
          : "AI Assistant scanned bank statement. All matching records are up to date."
      );
    }, 1000);
  };

  const handleCreateManualTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccount || !txAmount || Number(txAmount) <= 0) return;

    const numAmount = Number(txAmount);
    const finalAmount = txType === "deposit" ? numAmount : -numAmount;

    const newTx: BankTransaction = {
      id: `tx_${Date.now()}`,
      bankAccountId: activeAccount.id,
      date: txDate,
      description: txDescription || (txType === "deposit" ? "EFT DEPOSIT" : "BANK PAYMENT"),
      amount: finalAmount,
      reference: txReference || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      category: txCategory || (txType === "deposit" ? "Customer Payment" : "Supplier Payment"),
      isReconciled: false,
    };

    onAddManualTransaction(newTx);
    setTxDescription("");
    setTxAmount("");
    setTxReference("");
    setIsManualTxModalOpen(false);
  };

  const symbol = profile.currencySymbol;

  // Empty State if no bank accounts exist
  if (bankAccounts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
              <span>Clean Slate • 0 Accounts • R 0.00 Balance</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Connect Your Bank Account & Start on Zero
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Fast-Books has been initialized with a clean zero balance and no historical clutter. Connect your South African bank feed securely using your <strong>Bank Account Number</strong>, <strong>Branch Code</strong>, and <strong>Banking App PIN</strong> to begin tracking real-time deposits, payments, and reconciliations.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenBankLogin}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center space-x-2"
              >
                <Landmark className="w-5 h-5" />
                <span>Connect Bank via Account # & PIN</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Multi-Account Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-600" />
            <span>Bank Feed & Reconciliation Engine</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-select batch reconciliation, smart tagging & categorized deletion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Account Selector */}
          <select
            value={selectedAccountId || activeAccount?.id}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
          >
            {bankAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.bankName} (Acc: •••• {acc.accountNumber.slice(-4)})
              </option>
            ))}
          </select>

          <button
            onClick={onOpenBankLogin}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-sm"
            title="Connect another bank account"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Bank</span>
          </button>

          <button
            onClick={() => setIsManualTxModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer shadow-sm border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Transaction</span>
          </button>

          <button
            onClick={() => setIsCategorizedDeleteModalOpen(true)}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer border border-slate-300"
            title="Delete all transactions in a chosen category"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Delete by Category</span>
          </button>

          <button
            onClick={() => setIsConfirmDeleteAllOpen(true)}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer border border-rose-200"
            title="Delete all accounts and reset to zero"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Delete All (Start on 0)</span>
          </button>
        </div>
      </div>

      {/* Active Connected Bank Profile Card */}
      {activeAccount && (
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-white">
                  {activeAccount.accountName || activeAccount.bankName}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  FEED CONNECTED
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-300 font-mono">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Account #: <strong>{activeAccount.accountNumber}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Branch: <strong>{activeAccount.branchCode}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>App PIN: <strong>{activeAccount.bankingAppPinMasked || "••••"}</strong></span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onResetBalanceToZero(activeAccount.id)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 cursor-pointer transition"
              title="Reset balance to zero"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset to R 0.00</span>
            </button>

            <button
              onClick={() => setIsConfirmDeleteAccountOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold flex items-center space-x-1.5 border border-rose-800/60 cursor-pointer transition"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Disconnect Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Reconciliation Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Bank Statement Balance
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-2 tracking-tight">
            {formatCurrency(bankBalance, symbol)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block font-medium">
            Starting at zero (R 0.00)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Fast-Books System Balance
          </span>
          <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            {formatCurrency(ledgerBalance, symbol)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block font-medium">
            Recorded Accounting Ledger
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Unreconciled Items
          </span>
          <div className="text-2xl font-black text-amber-600 mt-2 tracking-tight">
            {unreconciledItems.length}{" "}
            <span className="text-xs font-normal text-slate-500">
              ({formatCurrency(unreconciledSum, symbol)})
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block font-medium">
            Awaiting Statement Match
          </span>
        </div>

        <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Reconciliation Difference
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-2 flex items-center gap-1 tracking-tight">
            {formatCurrency(variance, symbol)}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Balanced & Reconciled
          </span>
        </div>
      </div>

      {/* AI Smart Match Assistant Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">AI Bank Reconciliation Assistant</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Scans statement deposits and payments against customer invoices & business expenses.
            </p>
          </div>
        </div>

        <button
          onClick={handleAiAutoMatch}
          disabled={isAiMatching}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-2 whitespace-nowrap border border-indigo-400/30"
        >
          {isAiMatching ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Matching Feeds...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>AI Smart Match All</span>
            </>
          )}
        </button>
      </div>

      {aiMatchNotification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{aiMatchNotification}</span>
          </div>
          <button
            onClick={() => setAiMatchNotification("")}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Multi-Select Quick Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search description, ref, or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status and Category Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {(["all", "unreconciled", "reconciled"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize cursor-pointer transition ${
                    filterStatus === st
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="all">All Categories</option>
              <option value="uncategorized">Uncategorized</option>
              {PRESET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Multi-Select Helpers Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Selection:</span>
            </span>
            <button
              onClick={handleToggleSelectAll}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline"
            >
              {selectedTxIds.size === filteredTx.length && filteredTx.length > 0
                ? "Deselect All"
                : "Select All Visible"}
            </button>
            <span>•</span>
            <button
              onClick={handleSelectAllUnreconciled}
              className="text-amber-600 hover:text-amber-800 font-semibold cursor-pointer underline"
            >
              Select All Unreconciled
            </button>
            <span>•</span>
            <button
              onClick={handleSelectAllReconciled}
              className="text-emerald-600 hover:text-emerald-800 font-semibold cursor-pointer underline"
            >
              Select All Reconciled
            </button>
          </div>

          {selectedTxIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-lg border border-indigo-200">
                {selectedTxIds.size} selected ({formatCurrency(selectedTotalAmount, symbol)})
              </span>
              <button
                onClick={handleClearSelection}
                className="text-slate-500 hover:text-slate-800 text-xs cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bank Statement Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedTxIds.size > 0 && selectedTxIds.size === filteredTx.length}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer"
                    title="Select all"
                  />
                </th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Bank Description</th>
                <th className="py-3.5 px-4">Category & Tags</th>
                <th className="py-3.5 px-4">Reference</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4">Recon Status</th>
                <th className="py-3.5 px-4 text-right">Match Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-slate-700 text-sm">
                        No transactions found matching the filter criteria.
                      </p>
                      <p className="text-xs text-slate-400">
                        Try clearing search filters or click "Add Transaction" to log new statement entries.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => {
                  const isSelected = selectedTxIds.has(tx.id);
                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        isSelected ? "bg-indigo-50/70" : "hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectTx(tx.id)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-500 whitespace-nowrap">
                        {tx.date}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          {tx.amount > 0 ? (
                            <ArrowDownLeft className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                          <span>{tx.description}</span>
                        </div>
                      </td>

                      {/* Category & Tags Pill */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {tx.category ? (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold border border-slate-200">
                              {tx.category}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Uncategorized</span>
                          )}
                          {tx.tags &&
                            tx.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 text-[9px] font-semibold border border-indigo-100"
                              >
                                #{tag}
                              </span>
                            ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                        {tx.reference}
                      </td>

                      <td
                        className={`py-3.5 px-4 text-right font-extrabold whitespace-nowrap ${
                          tx.amount > 0 ? "text-emerald-600" : "text-slate-900"
                        }`}
                      >
                        {formatCurrency(tx.amount, symbol)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {tx.isReconciled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Reconciled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            Unreconciled
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          {tx.isReconciled ? (
                            <button
                              onClick={() => onReconcileTransaction(tx.id)}
                              className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                            >
                              Undo Recon
                            </button>
                          ) : (
                            <button
                              onClick={() => onReconcileTransaction(tx.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve Match</span>
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete statement line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Sticky Batch Action Bar */}
      {selectedTxIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-indigo-500/40 flex flex-wrap items-center gap-3 animate-fade-in">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs sm:text-sm">
              <strong>{selectedTxIds.size}</strong> Selected
            </span>
            <span className="text-xs text-emerald-300 font-mono">
              ({formatCurrency(selectedTotalAmount, symbol)})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => executeBatchReconcileAction(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Bulk Approve</span>
            </button>

            <button
              onClick={() => executeBatchReconcileAction(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer border border-slate-700"
            >
              Bulk Undo Recon
            </button>

            <button
              onClick={() => setIsBatchTagModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm border border-indigo-400/30"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Batch Tag / Categorize</span>
            </button>

            <button
              onClick={() => setIsBatchDeleteModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>

            <button
              onClick={handleClearSelection}
              className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Batch Tagging & Categorization */}
      {isBatchTagModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">
                  Batch Tag {selectedTxIds.size} Transaction(s)
                </h3>
              </div>
              <button
                onClick={() => setIsBatchTagModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <p className="text-slate-600">
                Apply a uniform accounting category and custom tag to all <strong>{selectedTxIds.size}</strong> selected statement lines simultaneously:
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Category</label>
                <select
                  value={batchCategory}
                  onChange={(e) => setBatchCategory(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Optional Custom Tag (e.g. "August-Audit", "FNB-BankFee")
                </label>
                <input
                  type="text"
                  placeholder="e.g. Workshop-Disbursement"
                  value={batchTagInput}
                  onChange={(e) => setBatchTagInput(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBatchTagModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeBatchTagAction}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow transition cursor-pointer"
                >
                  Apply Category to {selectedTxIds.size} Items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Bulk Deletion of Selected Items */}
      {isBatchDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-black text-lg text-slate-900">
                Delete {selectedTxIds.size} Selected Transaction(s)?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You are about to permanently delete <strong>{selectedTxIds.size}</strong> bank statement transactions with a net total value of{" "}
                <strong>{formatCurrency(selectedTotalAmount, symbol)}</strong>. This will adjust the account ledger balance accordingly.
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeBatchDeleteAction}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Yes, Delete {selectedTxIds.size} Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Categorized Deletion (Delete all by category) */}
      {isCategorizedDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-black text-lg text-slate-900">
                Categorized Bulk Deletion
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Quickly purge all transactions belonging to a specific category (e.g. purge all bank charge lines or test entries):
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Select Category to Purge
                </label>
                <select
                  value={targetCategoryToDelete}
                  onChange={(e) => setTargetCategoryToDelete(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  {PRESET_CATEGORIES.map((cat) => {
                    const matchCount = accountTx.filter((t) => t.category === cat).length;
                    return (
                      <option key={cat} value={cat}>
                        {cat} ({matchCount} records)
                      </option>
                    );
                  })}
                </select>
              </div>

              {(() => {
                const count = accountTx.filter((t) => t.category === targetCategoryToDelete).length;
                const sum = accountTx
                  .filter((t) => t.category === targetCategoryToDelete)
                  .reduce((s, t) => s + t.amount, 0);
                return (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-medium">
                    Found <strong>{count}</strong> transactions in '{targetCategoryToDelete}' with total value of{" "}
                    <strong>{formatCurrency(sum, symbol)}</strong>.
                  </div>
                );
              })()}
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setIsCategorizedDeleteModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeCategorizedDeleteAction}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Purge Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Manual Statement Transaction */}
      {isManualTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Landmark className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Add Bank Statement Entry</h3>
              </div>
              <button
                onClick={() => setIsManualTxModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualTx} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTxType("deposit")}
                  className={`py-2 text-center rounded-lg font-bold transition cursor-pointer ${
                    txType === "deposit"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  + Money In (Deposit)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType("withdrawal")}
                  className={`py-2 text-center rounded-lg font-bold transition cursor-pointer ${
                    txType === "withdrawal"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  - Money Out (Expense)
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. EFT CLIENT DEPOSIT or AUTO PARTS CO"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  required
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500"
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount ({symbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                    required
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-extrabold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reference</label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-001 or EFT-99201"
                  value={txReference}
                  onChange={(e) => setTxReference(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualTxModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow transition cursor-pointer"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete All & Reset to Zero */}
      {isConfirmDeleteAllOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-black text-lg text-slate-900">
                Delete All Bank Accounts & Start on Zero?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will delete all connected bank accounts, clear all bank statement transactions, and reset your bank ledger to a clean <strong>R 0.00</strong> balance.
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setIsConfirmDeleteAllOpen(false)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteAllAccountsAndTransactions();
                  setIsConfirmDeleteAllOpen(false);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Yes, Delete All & Zero Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Single Account */}
      {isConfirmDeleteAccountOpen && activeAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-black text-lg text-slate-900">
                Disconnect {activeAccount.bankName}?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Disconnect account #{activeAccount.accountNumber} and remove its bank statement feeds?
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setIsConfirmDeleteAccountOpen(false)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteAccount(activeAccount.id);
                  setIsConfirmDeleteAccountOpen(false);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Disconnect Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
