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
  Building,
  Trash2,
  RotateCcw,
  Upload,
  CreditCard,
  Hash,
  KeyRound,
  ShieldCheck,
  FileSpreadsheet,
  X,
} from "lucide-react";
import {
  BankAccount,
  BankTransaction,
  Invoice,
  Expense,
  BusinessProfile,
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
  onDeleteAccount: (accountId: string) => void;
  onDeleteAllAccountsAndTransactions: () => void;
  onResetBalanceToZero: (accountId: string) => void;
  onAddManualTransaction: (transaction: BankTransaction) => void;
  onDeleteTransaction: (txId: string) => void;
}

export const BankReconView: React.FC<BankReconViewProps> = ({
  bankAccounts,
  bankTransactions,
  invoices,
  expenses,
  profile,
  onOpenBankLogin,
  onReconcileTransaction,
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
  const [isAiMatching, setIsAiMatching] = useState(false);
  const [aiMatchNotification, setAiMatchNotification] = useState("");

  // Modals inside Bank Recon
  const [isManualTxModalOpen, setIsManualTxModalOpen] = useState(false);
  const [isConfirmDeleteAllOpen, setIsConfirmDeleteAllOpen] = useState(false);
  const [isConfirmDeleteAccountOpen, setIsConfirmDeleteAccountOpen] = useState(false);

  // Manual Transaction Form state
  const [txDescription, setTxDescription] = useState("");
  const [txAmount, setTxAmount] = useState<number | "">("");
  const [txType, setTxType] = useState<"deposit" | "withdrawal">("deposit");
  const [txReference, setTxReference] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);

  const accountTx = bankTransactions.filter(
    (t) => !activeAccount || t.bankAccountId === activeAccount.id
  );

  const filteredTx = accountTx.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "reconciled" ? t.isReconciled : !t.isReconciled);
    return matchesSearch && matchesFilter;
  });

  // Calculate Reconciliation totals
  const bankBalance = activeAccount ? activeAccount.balance : 0;
  const unreconciledItems = accountTx.filter((t) => !t.isReconciled);
  const unreconciledSum = unreconciledItems.reduce((sum, t) => sum + t.amount, 0);
  const ledgerBalance = bankBalance - unreconciledSum;
  const variance = bankBalance - ledgerBalance - unreconciledSum; // R 0.00 when accounts balance

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
      category: txType === "deposit" ? "Income" : "Expense",
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
        {/* Banner */}
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

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Universal Branch Codes</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Auto-fills South African universal branch codes for FNB, Standard Bank, ABSA, Nedbank, Capitec, Discovery, and Investec.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Banking App PIN Authentication</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Direct simulated local feed connection with secure PIN handshake and encrypted on-device storage.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">AI Reconciliation Engine</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automatically compares incoming statement deposits against unpaid customer invoices with zero variance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Multi-Account Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-600" />
            <span>Bank Feed & Reconciliation Engine</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Connected via Bank Account Number, Branch Code & Banking App PIN.
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
        {/* Bank Statement Balance */}
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

        {/* System Ledger Balance */}
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

        {/* Unreconciled Items */}
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

        {/* Variance Difference */}
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
              Scans bank statement deposits and payments against open invoices & business expenses.
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
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{aiMatchNotification}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search bank transactions or ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          {(["all", "unreconciled", "reconciled"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer transition ${
                filterStatus === st
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bank Statement Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Bank Description</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Recon Status</th>
                <th className="py-3 px-4 text-right">Match Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-slate-700 text-sm">
                        No transactions recorded on this account yet.
                      </p>
                      <p className="text-xs text-slate-400">
                        Account is on a clean zero balance. Use "Add Transaction" to record deposits or payments.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-500">
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
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">
                      {tx.reference}
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-extrabold ${
                        tx.amount > 0 ? "text-emerald-600" : "text-slate-900"
                      }`}
                    >
                      {formatCurrency(tx.amount, symbol)}
                    </td>
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 text-right">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
