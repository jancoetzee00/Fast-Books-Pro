import {
  BusinessProfile,
  Client,
  Quotation,
  Invoice,
  BankAccount,
  BankTransaction,
  Expense,
  GoogleAIAppConnection,
  GoogleAISyncEvent,
  SarsComplianceProfile,
  SarsFilingItem,
  Vat201Return,
} from "../types";
import {
  initialBusinessProfile,
  initialClients,
  initialQuotations,
  initialInvoices,
  initialBankAccounts,
  initialBankTransactions,
  initialExpenses,
  initialSarsProfile,
  initialSarsFilings,
} from "../data/initialData";

const KEYS = {
  PROFILE: "fastbooks_profile_v2",
  CLIENTS: "fastbooks_clients_v2",
  QUOTATIONS: "fastbooks_quotations_v2",
  INVOICES: "fastbooks_invoices_v2",
  BANK_ACCOUNTS: "fastbooks_bank_accounts_v2",
  BANK_TRANSACTIONS: "fastbooks_bank_transactions_v2",
  EXPENSES: "fastbooks_expenses_v2",
  AI_CONNECTIONS: "fastbooks_ai_connections_v2",
  AI_SYNC_EVENTS: "fastbooks_ai_sync_events_v2",
  ZA_PARTS_CONFIG: "fastbooks_za_parts_config_v2",
  SARS_PROFILE: "fastbooks_sars_profile_v2",
  SARS_FILINGS: "fastbooks_sars_filings_v2",
  VAT_RETURNS: "fastbooks_vat_returns_v2",
};

const initialAIConnections: GoogleAIAppConnection[] = [
  {
    id: "conn_partssource_za",
    appName: "PartsSource ZA (partssource-za)",
    category: "Auto Parts & Logistics",
    status: "connected",
    lastPing: "Active Sync",
    tokenIdentifier: "psz-auth-live-892",
    platformKey: "partssource-za",
    permissions: ["record_expenses", "create_invoices", "sync_parts_catalog"],
    description: "South African auto parts supplier portal, PO ingestion & supplier bill reconciliation.",
    webhookUrl: "/api/integrations/partssource-za/sync",
  },
  {
    id: "conn_parts_drive_za",
    appName: "Parts-Drive ZA (parts-drive-za)",
    category: "Auto Parts & Logistics",
    status: "connected",
    lastPing: "Active Sync",
    tokenIdentifier: "pdz-auth-live-441",
    platformKey: "parts-drive-za",
    permissions: ["create_invoices", "sync_clients", "dispatch_billing"],
    description: "Workshop parts courier, garage delivery tracking, and delivery note billing.",
    webhookUrl: "/api/integrations/parts-drive-za/sync",
  },
  {
    id: "conn_part_smart_za",
    appName: "Part-Smart ZA (part-smart-za)",
    category: "Auto Parts & Logistics",
    status: "connected",
    lastPing: "Active Sync",
    tokenIdentifier: "psmart-auth-live-109",
    platformKey: "part-smart-za",
    permissions: ["create_quotes", "create_invoices", "pricing_lookup"],
    description: "Intelligent auto parts pricing matrix, VIN catalogue lookup, and instant quote generation.",
    webhookUrl: "/api/integrations/part-smart-za/sync",
  },
  {
    id: "conn_gemini_sales",
    appName: "Google AI Sales & Billing Bot",
    category: "CRM & Sales",
    status: "connected",
    lastPing: "Just now",
    tokenIdentifier: "g-ai-token-sales-098",
    permissions: ["create_invoices", "create_quotes", "read_invoices"],
  },
  {
    id: "conn_gemini_ocr",
    appName: "Google AI Receipt & Document Scanner",
    category: "Receipt Scanner",
    status: "connected",
    lastPing: "2 mins ago",
    tokenIdentifier: "g-ai-token-ocr-441",
    permissions: ["record_expenses", "read_invoices"],
  },
  {
    id: "conn_gemini_recon",
    appName: "Google AI Bank Reconciliation Agent",
    category: "Custom Gemini Agent",
    status: "connected",
    lastPing: "Live",
    tokenIdentifier: "g-ai-token-recon-772",
    permissions: ["bank_sync", "read_invoices"],
  },
];

export const initialZAPartsConfig = {
  partssource: {
    enabled: true,
    apiKey: "psz_live_za_key_884920",
    endpoint: "https://api.partssource.co.za/v1",
    autoImportExpenses: true,
    defaultSupplier: "PartsSource ZA National Hub",
  },
  partsdrive: {
    enabled: true,
    apiKey: "pdz_live_za_key_331092",
    endpoint: "https://api.partsdrive.co.za/v2",
    autoCreateDeliveryInvoices: true,
    dispatchRatePerKm: 18.5,
  },
  partsmart: {
    enabled: true,
    apiKey: "psm_live_za_key_992014",
    endpoint: "https://api.partsmart.co.za/v1",
    defaultMarkupPercent: 25,
    autoSyncCatalogQuotes: true,
  },
};


export const storage = {
  getProfile: (): BusinessProfile => {
    const data = localStorage.getItem(KEYS.PROFILE) || localStorage.getItem("fastbooks_profile_v1");
    return data ? JSON.parse(data) : initialBusinessProfile;
  },
  saveProfile: (profile: BusinessProfile) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  getClients: (): Client[] => {
    const data = localStorage.getItem(KEYS.CLIENTS);
    return data ? JSON.parse(data) : initialClients;
  },
  saveClients: (clients: Client[]) => {
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
  },

  getQuotations: (): Quotation[] => {
    const data = localStorage.getItem(KEYS.QUOTATIONS);
    return data ? JSON.parse(data) : initialQuotations;
  },
  saveQuotations: (quotations: Quotation[]) => {
    localStorage.setItem(KEYS.QUOTATIONS, JSON.stringify(quotations));
  },

  getInvoices: (): Invoice[] => {
    const data = localStorage.getItem(KEYS.INVOICES);
    return data ? JSON.parse(data) : initialInvoices;
  },
  saveInvoices: (invoices: Invoice[]) => {
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  },

  getBankAccounts: (): BankAccount[] => {
    const data = localStorage.getItem(KEYS.BANK_ACCOUNTS);
    return data ? JSON.parse(data) : initialBankAccounts;
  },
  saveBankAccounts: (accounts: BankAccount[]) => {
    localStorage.setItem(KEYS.BANK_ACCOUNTS, JSON.stringify(accounts));
  },

  getBankTransactions: (): BankTransaction[] => {
    const data = localStorage.getItem(KEYS.BANK_TRANSACTIONS);
    return data ? JSON.parse(data) : initialBankTransactions;
  },
  saveBankTransactions: (transactions: BankTransaction[]) => {
    localStorage.setItem(KEYS.BANK_TRANSACTIONS, JSON.stringify(transactions));
  },

  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(KEYS.EXPENSES);
    return data ? JSON.parse(data) : initialExpenses;
  },
  saveExpenses: (expenses: Expense[]) => {
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  },

  getAIConnections: (): GoogleAIAppConnection[] => {
    const data = localStorage.getItem(KEYS.AI_CONNECTIONS);
    if (!data) return initialAIConnections;
    try {
      const parsed: GoogleAIAppConnection[] = JSON.parse(data);
      // Ensure partssource-za, parts-drive-za, part-smart-za are present
      const requiredKeys = ["conn_partssource_za", "conn_parts_drive_za", "conn_part_smart_za"];
      const missing = initialAIConnections.filter(
        (init) => requiredKeys.includes(init.id) && !parsed.some((p) => p.id === init.id)
      );
      if (missing.length > 0) {
        const merged = [...missing, ...parsed];
        localStorage.setItem(KEYS.AI_CONNECTIONS, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      return initialAIConnections;
    }
  },
  saveAIConnections: (connections: GoogleAIAppConnection[]) => {
    localStorage.setItem(KEYS.AI_CONNECTIONS, JSON.stringify(connections));
  },

  getZAPartsConfig: () => {
    const data = localStorage.getItem(KEYS.ZA_PARTS_CONFIG);
    return data ? JSON.parse(data) : initialZAPartsConfig;
  },
  saveZAPartsConfig: (cfg: any) => {
    localStorage.setItem(KEYS.ZA_PARTS_CONFIG, JSON.stringify(cfg));
  },


  getAISyncEvents: (): GoogleAISyncEvent[] => {
    const data = localStorage.getItem(KEYS.AI_SYNC_EVENTS);
    return data ? JSON.parse(data) : [];
  },
  saveAISyncEvents: (events: GoogleAISyncEvent[]) => {
    localStorage.setItem(KEYS.AI_SYNC_EVENTS, JSON.stringify(events));
  },
  addAISyncEvent: (event: GoogleAISyncEvent) => {
    const current = storage.getAISyncEvents();
    const updated = [event, ...current].slice(0, 50); // keep last 50
    storage.saveAISyncEvents(updated);
    return updated;
  },

  // SARS Profile & Compliance
  getSarsProfile: (): SarsComplianceProfile => {
    const data = localStorage.getItem(KEYS.SARS_PROFILE);
    if (!data) return initialSarsProfile;
    try {
      return JSON.parse(data);
    } catch {
      return initialSarsProfile;
    }
  },
  saveSarsProfile: (prof: SarsComplianceProfile) => {
    localStorage.setItem(KEYS.SARS_PROFILE, JSON.stringify(prof));
  },

  // SARS Filings Tracker
  getSarsFilings: (): SarsFilingItem[] => {
    const data = localStorage.getItem(KEYS.SARS_FILINGS);
    if (!data) return initialSarsFilings;
    try {
      return JSON.parse(data);
    } catch {
      return initialSarsFilings;
    }
  },
  saveSarsFilings: (filings: SarsFilingItem[]) => {
    localStorage.setItem(KEYS.SARS_FILINGS, JSON.stringify(filings));
  },

  // Calculate monthly / bi-monthly VAT201 Return based on actual invoices and expenses in period
  calculateVatReturn: (
    invoices: Invoice[],
    expenses: Expense[],
    periodKey: string, // e.g. "2026-08"
    periodName: string = "August 2026",
    startDate: string = "2026-08-01",
    endDate: string = "2026-08-31",
    filingDueDate: string = "2026-09-30",
    frequency: "monthly" | "bi_monthly_a" | "bi_monthly_b" = "monthly"
  ): Vat201Return => {
    // Filter invoices in period
    const periodInvoices = invoices.filter((inv) => {
      const invDate = inv.date || inv.createdAt?.split("T")[0] || "";
      return invDate >= startDate && invDate <= endDate && inv.status !== "cancelled";
    });

    // Standard rate sales & Output Tax (15% in South Africa)
    const standardRateSalesExcl = periodInvoices.reduce((sum, inv) => sum + (inv.subtotal || 0), 0);
    const outputVatStandardRate = periodInvoices.reduce((sum, inv) => sum + (inv.taxTotal || 0), 0);
    const totalOutputTax = outputVatStandardRate;

    // Filter expenses in period
    const periodExpenses = expenses.filter((exp) => {
      const expDate = exp.date || "";
      return expDate >= startDate && expDate <= endDate;
    });

    // Standard rate expenses & Input Tax
    const standardRateExpensesExcl = periodExpenses.reduce((sum, exp) => sum + (exp.amount - (exp.taxAmount || 0)), 0);
    const inputVatStandardRate = periodExpenses.reduce((sum, exp) => sum + (exp.taxAmount || 0), 0);
    const totalInputTax = inputVatStandardRate;

    // Net VAT: positive = Payable to SARS, negative = Refund from SARS
    const netVatPayable = totalOutputTax - totalInputTax;

    const prnNumber = `PRN-VAT-${periodKey.replace(/-/g, "")}-49102`;

    return {
      id: `vat201_${periodKey}`,
      periodKey,
      periodName,
      startDate,
      endDate,
      filingDueDate,
      paymentDueDate: filingDueDate,
      frequency,
      status: "open",
      standardRateSalesExcl: Math.round(standardRateSalesExcl * 100) / 100,
      outputVatStandardRate: Math.round(outputVatStandardRate * 100) / 100,
      zeroRatedSupplies: 0,
      exemptSupplies: 0,
      totalOutputTax: Math.round(totalOutputTax * 100) / 100,
      capitalGoodsPurchases: 0,
      capitalGoodsInputTax: 0,
      standardRateExpensesExcl: Math.round(standardRateExpensesExcl * 100) / 100,
      inputVatStandardRate: Math.round(inputVatStandardRate * 100) / 100,
      totalInputTax: Math.round(totalInputTax * 100) / 100,
      netVatPayable: Math.round(netVatPayable * 100) / 100,
      sarsPrn: prnNumber,
      notes: `Standard monthly VAT201 declaration for ${periodName} with ${periodInvoices.length} invoices and ${periodExpenses.length} expense claims.`,
    };
  },

  // Export full app database to a downloadable JSON file for Jan Coetzee
  exportBackupJSONString: (): string => {
    const backup = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      owner: "Jan Coetzee",
      profile: storage.getProfile(),
      sarsProfile: storage.getSarsProfile(),
      sarsFilings: storage.getSarsFilings(),
      clients: storage.getClients(),
      quotations: storage.getQuotations(),
      invoices: storage.getInvoices(),
      bankAccounts: storage.getBankAccounts(),
      bankTransactions: storage.getBankTransactions(),
      expenses: storage.getExpenses(),
    };
    return JSON.stringify(backup, null, 2);
  },

  exportBackupJSON: () => {
    const jsonString = storage.exportBackupJSONString();
    const blob = new Blob([jsonString], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `fast-books-full-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Import JSON backup file
  importBackupJSON: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) storage.saveProfile(data.profile);
      if (Array.isArray(data.clients)) storage.saveClients(data.clients);
      if (Array.isArray(data.quotations)) storage.saveQuotations(data.quotations);
      if (Array.isArray(data.invoices)) storage.saveInvoices(data.invoices);
      if (Array.isArray(data.bankAccounts)) storage.saveBankAccounts(data.bankAccounts);
      if (Array.isArray(data.bankTransactions))
        storage.saveBankTransactions(data.bankTransactions);
      if (Array.isArray(data.expenses)) storage.saveExpenses(data.expenses);
      return true;
    } catch (e) {
      console.error("Failed to restore backup:", e);
      return false;
    }
  },

  // Helper to trigger CSV export
  exportToCSV: (filename: string, rows: Record<string, any>[]) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = row[h] ?? "";
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  resetAll: () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem("fastbooks_profile_v1");
    localStorage.removeItem("fastbooks_clients_v1");
    localStorage.removeItem("fastbooks_quotations_v1");
    localStorage.removeItem("fastbooks_invoices_v1");
    localStorage.removeItem("fastbooks_bank_accounts_v1");
    localStorage.removeItem("fastbooks_bank_transactions_v1");
    localStorage.removeItem("fastbooks_expenses_v1");
  },
};

export function formatCurrency(amount: number, symbol: string = "R"): string {
  const formatted = Math.abs(amount).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = amount < 0 ? "-" : "";
  return `${prefix}${symbol} ${formatted}`;
}
