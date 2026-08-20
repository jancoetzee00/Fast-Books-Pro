export type CurrencySymbol = "R" | "$" | "€" | "£";

export interface CurrencyConfig {
  code: string;
  symbol: CurrencySymbol;
  name: string;
}

export interface BusinessProfile {
  ownerName: string;
  companyName: string;
  tradingName?: string;
  registrationNumber: string;
  taxNumber: string;
  accountingLicenseNumber?: string;
  email: string;
  phone: string;
  address: string;
  
  // Security & System Credentials
  systemPassword?: string;
  securityPin?: string;
  bankSyncUsername?: string;
  bankSyncPassword?: string;
  apiSecretKey?: string;

  bankName: string;
  bankAccountHolder: string;
  bankAccountNumber: string;
  bankBranchCode: string;
  currency: "ZAR" | "USD" | "EUR" | "GBP";
  currencySymbol: CurrencySymbol;
  defaultTaxRate: number;
  logoUrl?: string;
  quotationNotes: string;
  invoiceTerms: string;
}

export interface Client {
  id: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  taxNumber?: string;
  address: string;
  notes?: string;
  createdAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g. 15 for 15% VAT
  discount: number; // e.g. 0 for 0%
  total: number;
}

export type QuotationStatus = "draft" | "sent" | "accepted" | "declined" | "converted";

export interface Quotation {
  id: string;
  quoteNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  date: string;
  expiryDate: string;
  items: LineItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  status: QuotationStatus;
  convertedToInvoiceId?: string;
  notes?: string;
  terms?: string;
  createdAt: string;
}

export type InvoiceStatus = "draft" | "issued" | "partially_paid" | "paid" | "overdue" | "cancelled";

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: "EFT" | "Credit Card" | "Cash" | "Bank Transfer" | "Cheque";
  reference: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quotationId?: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  date: string;
  dueDate: string;
  items: LineItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  status: InvoiceStatus;
  payments: PaymentRecord[];
  notes?: string;
  terms?: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string; // e.g. First National Bank (FNB), Standard Bank, ABSA, Capitec, Nedbank, Investec, Discovery Bank
  accountName: string;
  accountNumber: string;
  branchCode: string;
  accountType: "Cheque" | "Savings" | "Credit Card" | "Business" | "Current";
  balance: number;
  lastSynced: string;
  isConnected: boolean;
  loginUsername?: string;
  bankingAppPinMasked?: string;
  logoColor?: string;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  date: string;
  description: string;
  amount: number; // Positive = Deposit/Money In, Negative = Withdrawal/Money Out
  reference: string;
  category?: string;
  tags?: string[];
  isReconciled: boolean;
  matchedType?: "invoice" | "expense" | "transfer";
  matchedId?: string;
  matchedReference?: string;
  aiSuggestedMatchId?: string;
}

export type ExpenseCategory =
  | "Office Supplies"
  | "Utilities"
  | "Travel"
  | "Vehicle & Petrol"
  | "Software & Cloud"
  | "Rent & Property"
  | "Professional Fees"
  | "Marketing & Ads"
  | "Operating Expenses"
  | "Other";

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  vendor: string;
  date: string;
  amount: number;
  taxAmount: number;
  bankTransactionId?: string;
  isPaid: boolean;
  paymentMethod: string;
  notes?: string;
}

export interface ReconciliationSummary {
  bankBalance: number;
  ledgerBalance: number;
  unreconciledDeposits: number;
  unreconciledWithdrawals: number;
  variance: number;
  totalTransactionsCount: number;
  reconciledTransactionsCount: number;
}

export interface GoogleAIAppConnection {
  id: string;
  appName: string;
  category: "CRM & Sales" | "Receipt Scanner" | "E-Commerce / POS" | "Inventory" | "Tax & Compliance" | "Customer Support Bot" | "Custom Gemini Agent" | "Auto Parts & Logistics";
  status: "connected" | "standby" | "paired";
  lastPing?: string;
  tokenIdentifier: string;
  permissions: string[];
  platformKey?: "partssource-za" | "parts-drive-za" | "part-smart-za" | string;
  webhookUrl?: string;
  description?: string;
}

export interface ZAPartsIntegrationConfig {
  partssource: {
    enabled: boolean;
    apiKey: string;
    endpoint: string;
    autoImportExpenses: boolean;
    defaultSupplier: string;
  };
  partsdrive: {
    enabled: boolean;
    apiKey: string;
    endpoint: string;
    autoCreateDeliveryInvoices: boolean;
    dispatchRatePerKm: number;
  };
  partsmart: {
    enabled: boolean;
    apiKey: string;
    endpoint: string;
    defaultMarkupPercent: number;
    autoSyncCatalogQuotes: boolean;
  };
}

export interface GoogleAISyncEvent {
  id: string;
  timestamp: string;
  sourceApp: string;
  action: "create_invoice" | "create_quote" | "record_expense" | "sync_client" | "reconcile_match" | "smart_query" | "parts_sync";
  status: "success" | "pending" | "reviewed";
  summary: string;
  details?: any;
}

export type VatFilingFrequency = "monthly" | "bi_monthly_a" | "bi_monthly_b";

export interface Vat201Return {
  id: string;
  periodKey: string; // e.g. "2026-08" or "2026-07-08"
  periodName: string; // e.g. "August 2026 (2026/08)"
  startDate: string;
  endDate: string;
  filingDueDate: string;
  paymentDueDate: string;
  frequency: VatFilingFrequency;
  status: "open" | "reconciled" | "filed_efiling" | "paid";
  
  // Field 1 & 1A: Standard rate sales (15%)
  standardRateSalesExcl: number;
  outputVatStandardRate: number; // 15%
  
  // Field 2: Zero rated supplies
  zeroRatedSupplies: number;
  
  // Field 3: Exempt supplies
  exemptSupplies: number;
  
  // Field 4 / 4A: Total Output Tax
  totalOutputTax: number;
  
  // Field 14 / 14A: Capital goods input tax
  capitalGoodsPurchases: number;
  capitalGoodsInputTax: number;
  
  // Field 15 / 15A: Standard rate other goods/services (Expenses)
  standardRateExpensesExcl: number;
  inputVatStandardRate: number;
  
  // Field 19: Total Input Tax
  totalInputTax: number;
  
  // Field 20: Net VAT Payable to SARS (positive) or Refundable (negative)
  netVatPayable: number;
  
  // SARS eFiling Meta
  sarsPrn: string; // 19-character SARS Payment Reference Number
  filedDate?: string;
  paymentDate?: string;
  paymentReference?: string;
  sarsNoticeNumber?: string;
  notes?: string;
}

export type SarsFilingType = "VAT201" | "EMP201" | "IRP6_P1" | "IRP6_P2" | "ITR14" | "ITR12";

export interface SarsFilingItem {
  id: string;
  filingType: SarsFilingType;
  title: string;
  periodLabel: string;
  taxYear: number;
  dueDate: string;
  liabilityAmount: number;
  status: "upcoming" | "ready_to_file" | "filed_efiling" | "paid" | "overdue";
  sarsPrn: string;
  filedDate?: string;
  paymentDate?: string;
  notes?: string;
}

export interface SarsComplianceProfile {
  vatRegistrationNumber: string;
  incomeTaxNumber: string;
  payeNumber: string;
  uifNumber: string;
  customsCode?: string;
  registeredName: string;
  tradeName: string;
  vatCategory: VatFilingFrequency; // Category C (Monthly), Category A (Bi-Monthly Odd), Category B (Bi-Monthly Even)
  taxPinNumber: string;
  taxClearanceStatus: "Compliant" | "Pending Review" | "Non-Compliant";
  taxOffice: string;
}


