import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { QuotationList } from "./components/Quotations/QuotationList";
import { QuotationEditorModal } from "./components/Quotations/QuotationEditorModal";
import { QuotationPrintModal } from "./components/Quotations/QuotationPrintModal";
import { InvoiceList } from "./components/Invoices/InvoiceList";
import { InvoiceEditorModal } from "./components/Invoices/InvoiceEditorModal";
import { InvoicePrintModal } from "./components/Invoices/InvoicePrintModal";
import { PaymentModal } from "./components/Invoices/PaymentModal";
import { BankReconView } from "./components/BankRecon/BankReconView";
import { BankLoginModal } from "./components/BankRecon/BankLoginModal";
import { ExpenseList } from "./components/Expenses/ExpenseList";
import { ClientList } from "./components/Clients/ClientList";
import { FinancialReports } from "./components/Reports/FinancialReports";
import { SettingsModal } from "./components/Settings/SettingsModal";
import { GoogleAIHub } from "./components/GoogleAI/GoogleAIHub";
import { SarsVatHub } from "./components/SarsVat/SarsVatHub";

import {
  BusinessProfile,
  Client,
  Quotation,
  Invoice,
  BankAccount,
  BankTransaction,
  Expense,
  PaymentRecord,
} from "./types";
import { storage } from "./lib/storage";

export default function App() {
  // Primary persistent state
  const [profile, setProfile] = useState<BusinessProfile>(() => storage.getProfile());
  const [clients, setClients] = useState<Client[]>(() => storage.getClients());
  const [quotations, setQuotations] = useState<Quotation[]>(() => storage.getQuotations());
  const [invoices, setInvoices] = useState<Invoice[]>(() => storage.getInvoices());
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => storage.getBankAccounts());
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(() => storage.getBankTransactions());
  const [expenses, setExpenses] = useState<Expense[]>(() => storage.getExpenses());

  // UI Navigation state
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"business" | "backup" | "credentials" | "banking" | "terms">("business");
  const [isBankLoginOpen, setIsBankLoginOpen] = useState(false);

  const handleOpenSettings = (tab: "business" | "backup" | "credentials" | "banking" | "terms" = "business") => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const [isQuotationEditorOpen, setIsQuotationEditorOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [printingQuotation, setPrintingQuotation] = useState<Quotation | null>(null);

  const [isInvoiceEditorOpen, setIsInvoiceEditorOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);
  const [recordingPaymentInvoice, setRecordingPaymentInvoice] = useState<Invoice | null>(null);

  // Sync state helpers
  const handleReloadState = () => {
    setProfile(storage.getProfile());
    setClients(storage.getClients());
    setQuotations(storage.getQuotations());
    setInvoices(storage.getInvoices());
    setBankAccounts(storage.getBankAccounts());
    setBankTransactions(storage.getBankTransactions());
    setExpenses(storage.getExpenses());
  };

  // Profile handlers
  const handleSaveProfile = (updated: BusinessProfile) => {
    setProfile(updated);
    storage.saveProfile(updated);
    setIsSettingsOpen(false);
  };

  // Client handlers
  const handleAddClient = (client: Client) => {
    const updated = [client, ...clients];
    setClients(updated);
    storage.saveClients(updated);
  };

  const handleDeleteClient = (id: string) => {
    const updated = clients.filter((c) => c.id !== id);
    setClients(updated);
    storage.saveClients(updated);
  };

  // Quotation handlers
  const handleSaveQuotation = (quotation: Quotation) => {
    let updated: Quotation[];
    const exists = quotations.some((q) => q.id === quotation.id);
    if (exists) {
      updated = quotations.map((q) => (q.id === quotation.id ? quotation : q));
    } else {
      updated = [quotation, ...quotations];
    }
    setQuotations(updated);
    storage.saveQuotations(updated);
    setIsQuotationEditorOpen(false);
    setEditingQuotation(null);
  };

  const handleDeleteQuotation = (id: string) => {
    const updated = quotations.filter((q) => q.id !== id);
    setQuotations(updated);
    storage.saveQuotations(updated);
  };

  const handleQuotationStatusChange = (id: string, status: Quotation["status"]) => {
    const updated = quotations.map((q) => (q.id === id ? { ...q, status } : q));
    setQuotations(updated);
    storage.saveQuotations(updated);
  };

  // One-click convert Quotation -> Invoice
  const handleConvertQuoteToInvoice = (quote: Quotation) => {
    const newInvoiceId = `inv_${Date.now()}`;
    const newInvoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newInvoice: Invoice = {
      id: newInvoiceId,
      invoiceNumber: newInvoiceNumber,
      quotationId: quote.id,
      clientId: quote.clientId,
      clientName: quote.clientName,
      clientEmail: quote.clientEmail,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      items: quote.items,
      subtotal: quote.subtotal,
      taxTotal: quote.taxTotal,
      grandTotal: quote.grandTotal,
      paidAmount: 0,
      status: "issued",
      payments: [],
      notes: `Converted from Quotation ${quote.quoteNumber}`,
      terms: profile.invoiceTerms,
      createdAt: new Date().toISOString(),
    };

    // Save invoice & mark quotation as converted
    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    storage.saveInvoices(updatedInvoices);

    const updatedQuotes = quotations.map((q) =>
      q.id === quote.id ? { ...q, status: "converted" as const, convertedToInvoiceId: newInvoiceId } : q
    );
    setQuotations(updatedQuotes);
    storage.saveQuotations(updatedQuotes);

    // Navigate to invoices tab & show the converted invoice
    setActiveTab("invoices");
    setPrintingInvoice(newInvoice);
  };

  // Invoice handlers
  const handleSaveInvoice = (invoice: Invoice) => {
    let updated: Invoice[];
    const exists = invoices.some((i) => i.id === invoice.id);
    if (exists) {
      updated = invoices.map((i) => (i.id === invoice.id ? invoice : i));
    } else {
      updated = [invoice, ...invoices];
    }
    setInvoices(updated);
    storage.saveInvoices(updated);
    setIsInvoiceEditorOpen(false);
    setEditingInvoice(null);
  };

  const handleDeleteInvoice = (id: string) => {
    const updated = invoices.filter((i) => i.id !== id);
    setInvoices(updated);
    storage.saveInvoices(updated);
  };

  const handleInvoiceStatusChange = (id: string, status: Invoice["status"]) => {
    const updated = invoices.map((i) => (i.id === id ? { ...i, status } : i));
    setInvoices(updated);
    storage.saveInvoices(updated);
  };

  const handleSavePaymentRecord = (payment: PaymentRecord) => {
    const invoice = invoices.find((i) => i.id === payment.invoiceId);
    if (!invoice) return;

    const newPaidAmount = invoice.paidAmount + payment.amount;
    const isFullyPaid = newPaidAmount >= invoice.grandTotal;

    const updatedInvoice: Invoice = {
      ...invoice,
      paidAmount: newPaidAmount,
      status: isFullyPaid ? "paid" : "partially_paid",
      payments: [...invoice.payments, payment],
    };

    const updatedInvoices = invoices.map((i) =>
      i.id === invoice.id ? updatedInvoice : i
    );
    setInvoices(updatedInvoices);
    storage.saveInvoices(updatedInvoices);

    // Auto-create matching bank transaction record if desired
    const newTx: BankTransaction = {
      id: `tx_${Date.now()}`,
      bankAccountId: bankAccounts[0]?.id || "bank_1",
      date: payment.date,
      description: `EFT DEP ${invoice.clientName} ${invoice.invoiceNumber}`,
      amount: payment.amount,
      reference: payment.reference,
      category: "Income",
      isReconciled: true,
      matchedType: "invoice",
      matchedId: invoice.id,
      matchedReference: invoice.invoiceNumber,
    };
    const updatedTx = [newTx, ...bankTransactions];
    setBankTransactions(updatedTx);
    storage.saveBankTransactions(updatedTx);

    setRecordingPaymentInvoice(null);
  };

  // Bank Reconciliation handlers
  const handleAddBankAccount = (account: BankAccount, transactions: BankTransaction[]) => {
    const updatedAccounts = [...bankAccounts, account];
    setBankAccounts(updatedAccounts);
    storage.saveBankAccounts(updatedAccounts);

    const updatedTx = [...transactions, ...bankTransactions];
    setBankTransactions(updatedTx);
    storage.saveBankTransactions(updatedTx);

    // Sync business profile bank details with newly connected account
    const updatedProfile = {
      ...profile,
      bankName: account.bankName,
      bankAccountNumber: account.accountNumber,
      bankBranchCode: account.branchCode,
    };
    setProfile(updatedProfile);
    storage.saveProfile(updatedProfile);

    setIsBankLoginOpen(false);
  };

  const handleDeleteBankAccount = (id: string) => {
    const updatedAccounts = bankAccounts.filter((a) => a.id !== id);
    const updatedTx = bankTransactions.filter((t) => t.bankAccountId !== id);
    setBankAccounts(updatedAccounts);
    setBankTransactions(updatedTx);
    storage.saveBankAccounts(updatedAccounts);
    storage.saveBankTransactions(updatedTx);
  };

  const handleDeleteAllBankAccountsAndTransactions = () => {
    setBankAccounts([]);
    setBankTransactions([]);
    storage.saveBankAccounts([]);
    storage.saveBankTransactions([]);
  };

  const handleResetBankBalanceToZero = (id: string) => {
    const updatedAccounts = bankAccounts.map((a) =>
      a.id === id ? { ...a, balance: 0 } : a
    );
    setBankAccounts(updatedAccounts);
    storage.saveBankAccounts(updatedAccounts);
  };

  const handleAddManualBankTransaction = (transaction: BankTransaction) => {
    const updatedTx = [transaction, ...bankTransactions];
    setBankTransactions(updatedTx);
    storage.saveBankTransactions(updatedTx);

    // Adjust account balance
    const updatedAccounts = bankAccounts.map((a) =>
      a.id === transaction.bankAccountId
        ? { ...a, balance: a.balance + transaction.amount }
        : a
    );
    setBankAccounts(updatedAccounts);
    storage.saveBankAccounts(updatedAccounts);
  };

  const handleDeleteBankTransaction = (id: string) => {
    const targetTx = bankTransactions.find((t) => t.id === id);
    const updatedTx = bankTransactions.filter((t) => t.id !== id);
    setBankTransactions(updatedTx);
    storage.saveBankTransactions(updatedTx);

    if (targetTx) {
      const updatedAccounts = bankAccounts.map((a) =>
        a.id === targetTx.bankAccountId
          ? { ...a, balance: a.balance - targetTx.amount }
          : a
      );
      setBankAccounts(updatedAccounts);
      storage.saveBankAccounts(updatedAccounts);
    }
  };

  const handleReconcileTransaction = (
    txId: string,
    matchedId?: string,
    matchedType?: "invoice" | "expense"
  ) => {
    const updatedTx = bankTransactions.map((tx) => {
      if (tx.id === txId) {
        return {
          ...tx,
          isReconciled: !tx.isReconciled,
          matchedId: matchedId || tx.matchedId,
          matchedType: matchedType || tx.matchedType,
        };
      }
      return tx;
    });
    setBankTransactions(updatedTx);
    storage.saveBankTransactions(updatedTx);
  };

  // Expense handlers
  const handleAddExpense = (expense: Expense) => {
    const updated = [expense, ...expenses];
    setExpenses(updated);
    storage.saveExpenses(updated);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    storage.saveExpenses(updated);
  };

  // Counts for badges
  const unreconciledTxCount = bankTransactions.filter((t) => !t.isReconciled).length;
  const unpaidInvoicesCount = invoices.filter(
    (i) => i.status === "issued" || i.status === "partially_paid" || i.status === "overdue"
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Header Bar */}
      <Header
        profile={profile}
        onOpenSettings={() => handleOpenSettings("business")}
        onNavigate={(tab) => {
          if (tab === "desktop-backup") {
            handleOpenSettings("backup");
          } else {
            setActiveTab(tab);
          }
        }}
      />

      {/* Navigation Sub-Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === "desktop-backup") {
            handleOpenSettings("backup");
          } else {
            setActiveTab(tab);
          }
        }}
        unreconciledCount={unreconciledTxCount}
        unpaidInvoicesCount={unpaidInvoicesCount}
      />

      {/* Main Container View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dashboard" && (
          <Dashboard
            profile={profile}
            quotations={quotations}
            invoices={invoices}
            bankAccounts={bankAccounts}
            bankTransactions={bankTransactions}
            expenses={expenses}
            onNavigate={(tab) => {
              if (tab === "desktop-backup") {
                handleOpenSettings("backup");
              } else {
                setActiveTab(tab);
              }
            }}
            onNewQuotation={() => {
              setEditingQuotation(null);
              setIsQuotationEditorOpen(true);
            }}
            onNewInvoice={() => {
              setEditingInvoice(null);
              setIsInvoiceEditorOpen(true);
            }}
            onConnectBank={() => setIsBankLoginOpen(true)}
            onDownloadBackup={() => storage.exportBackupJSON()}
            onOpenSettingsBackup={() => handleOpenSettings("backup")}
          />
        )}

        {activeTab === "google-ai" && (
          <GoogleAIHub
            profile={profile}
            clients={clients}
            quotations={quotations}
            invoices={invoices}
            expenses={expenses}
            onAddInvoice={handleSaveInvoice}
            onAddQuotation={handleSaveQuotation}
            onAddExpense={handleAddExpense}
            onAddClient={handleAddClient}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "sars-vat" && (
          <SarsVatHub
            profile={profile}
            invoices={invoices}
            expenses={expenses}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "quotations" && (
          <QuotationList
            quotations={quotations}
            clients={clients}
            profile={profile}
            onNewQuotation={() => {
              setEditingQuotation(null);
              setIsQuotationEditorOpen(true);
            }}
            onEditQuotation={(q) => {
              setEditingQuotation(q);
              setIsQuotationEditorOpen(true);
            }}
            onDeleteQuotation={handleDeleteQuotation}
            onConvertToInvoice={handleConvertQuoteToInvoice}
            onPrintQuotation={(q) => setPrintingQuotation(q)}
            onStatusChange={handleQuotationStatusChange}
          />
        )}

        {activeTab === "invoices" && (
          <InvoiceList
            invoices={invoices}
            clients={clients}
            profile={profile}
            onNewInvoice={() => {
              setEditingInvoice(null);
              setIsInvoiceEditorOpen(true);
            }}
            onEditInvoice={(inv) => {
              setEditingInvoice(inv);
              setIsInvoiceEditorOpen(true);
            }}
            onDeleteInvoice={handleDeleteInvoice}
            onRecordPayment={(inv) => setRecordingPaymentInvoice(inv)}
            onPrintInvoice={(inv) => setPrintingInvoice(inv)}
            onStatusChange={handleInvoiceStatusChange}
          />
        )}

        {activeTab === "bank-recon" && (
          <BankReconView
            bankAccounts={bankAccounts}
            bankTransactions={bankTransactions}
            invoices={invoices}
            expenses={expenses}
            profile={profile}
            onOpenBankLogin={() => setIsBankLoginOpen(true)}
            onReconcileTransaction={handleReconcileTransaction}
            onDeleteAccount={handleDeleteBankAccount}
            onDeleteAllAccountsAndTransactions={handleDeleteAllBankAccountsAndTransactions}
            onResetBalanceToZero={handleResetBankBalanceToZero}
            onAddManualTransaction={handleAddManualBankTransaction}
            onDeleteTransaction={handleDeleteBankTransaction}
          />
        )}

        {activeTab === "expenses" && (
          <ExpenseList
            expenses={expenses}
            profile={profile}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === "clients" && (
          <ClientList
            clients={clients}
            invoices={invoices}
            profile={profile}
            onAddClient={handleAddClient}
            onDeleteClient={handleDeleteClient}
          />
        )}

        {activeTab === "reports" && (
          <FinancialReports
            invoices={invoices}
            expenses={expenses}
            profile={profile}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-4 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Fast-Books Bookkeeping Engine • Sole Proprietor: <strong className="text-white">{profile.ownerName}</strong>
          </p>
          <p className="text-slate-500">
            Offline Hard Drive Persistence Active ({profile.currency} - {profile.currencySymbol})
          </p>
        </div>
      </footer>

      {/* Modals & Dialog Overlays */}
      {isSettingsOpen && (
        <SettingsModal
          profile={profile}
          quotations={quotations}
          invoices={invoices}
          bankTransactions={bankTransactions}
          clients={clients}
          expenses={expenses}
          onReloadState={handleReloadState}
          initialTab={settingsTab}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {isBankLoginOpen && (
        <BankLoginModal
          onClose={() => setIsBankLoginOpen(false)}
          onAddAccount={handleAddBankAccount}
          initialAccountNumber={profile.bankAccountNumber}
          initialBranchCode={profile.bankBranchCode}
        />
      )}

      {isQuotationEditorOpen && (
        <QuotationEditorModal
          initialQuotation={editingQuotation}
          clients={clients}
          profile={profile}
          onClose={() => {
            setIsQuotationEditorOpen(false);
            setEditingQuotation(null);
          }}
          onSave={handleSaveQuotation}
        />
      )}

      {printingQuotation && (
        <QuotationPrintModal
          quotation={printingQuotation}
          profile={profile}
          onClose={() => setPrintingQuotation(null)}
        />
      )}

      {isInvoiceEditorOpen && (
        <InvoiceEditorModal
          initialInvoice={editingInvoice}
          clients={clients}
          profile={profile}
          onClose={() => {
            setIsInvoiceEditorOpen(false);
            setEditingInvoice(null);
          }}
          onSave={handleSaveInvoice}
        />
      )}

      {printingInvoice && (
        <InvoicePrintModal
          invoice={printingInvoice}
          profile={profile}
          onClose={() => setPrintingInvoice(null)}
        />
      )}

      {recordingPaymentInvoice && (
        <PaymentModal
          invoice={recordingPaymentInvoice}
          profile={profile}
          onClose={() => setRecordingPaymentInvoice(null)}
          onSavePayment={handleSavePaymentRecord}
        />
      )}
    </div>
  );
}
