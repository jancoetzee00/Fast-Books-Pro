import {
  BusinessProfile,
  Client,
  Quotation,
  Invoice,
  BankAccount,
  BankTransaction,
  Expense,
  SarsComplianceProfile,
  SarsFilingItem,
} from "../types";

export const initialBusinessProfile: BusinessProfile = {
  ownerName: "Jan Coetzee",
  companyName: "Fast-Books Business Solutions",
  tradingName: "Fast-Books PRO",
  registrationNumber: "2024/891234/07",
  taxNumber: "VAT-4910293847",
  accountingLicenseNumber: "SAIPA-981042",
  email: "jancoetzee00@gmail.com",
  phone: "+27 (0)82 555 1234",
  address: "142 Highveld Techno Park, Centurion, Gauteng, 0157",
  systemPassword: "FastBooksAdmin2026!",
  securityPin: "4321",
  bankSyncUsername: "jan_coetzee_fnb",
  bankSyncPassword: "fnb_secure_sync_pass",
  apiSecretKey: "fb_live_sec_9810234812",
  bankName: "First National Bank (FNB)",
  bankAccountHolder: "Jan Coetzee t/a Fast-Books",
  bankAccountNumber: "62891048291",
  bankBranchCode: "250655",
  currency: "ZAR",
  currencySymbol: "R",
  defaultTaxRate: 15, // 15% VAT
  quotationNotes: "Thank you for considering Fast-Books. Quotations are valid for 30 days from issue date.",
  invoiceTerms: "Payment due within 14 days of invoice date. Please use Invoice Number as payment reference.",
};

export const initialClients: Client[] = [];

export const initialQuotations: Quotation[] = [];

export const initialInvoices: Invoice[] = [];

export const initialBankAccounts: BankAccount[] = [];

export const initialBankTransactions: BankTransaction[] = [];

export const initialExpenses: Expense[] = [];

export const initialSarsProfile: SarsComplianceProfile = {
  vatRegistrationNumber: "4910293847",
  incomeTaxNumber: "9012384756",
  payeNumber: "7123984712",
  uifNumber: "U123984712",
  customsCode: "ZA-8829104",
  registeredName: "Fast-Books Business Solutions (Pty) Ltd",
  tradeName: "Fast-Books PRO",
  vatCategory: "monthly",
  taxPinNumber: "99AA88BB77CC",
  taxClearanceStatus: "Compliant",
  taxOffice: "SARS Megawatt Park / Pretoria Branch",
};

export const initialSarsFilings: SarsFilingItem[] = [
  {
    id: "filing_vat_2026_08",
    filingType: "VAT201",
    title: "VAT201 Monthly Return (August 2026)",
    periodLabel: "2026/08",
    taxYear: 2027,
    dueDate: "2026-09-30",
    liabilityAmount: 0,
    status: "ready_to_file",
    sarsPrn: "PRN-VAT-202608-49102",
    notes: "Monthly Category C VAT return for August 2026. Standard 15% rate calculation.",
  },
  {
    id: "filing_emp_2026_08",
    filingType: "EMP201",
    title: "EMP201 Monthly Payroll Declaration (August 2026)",
    periodLabel: "2026/08",
    taxYear: 2027,
    dueDate: "2026-09-07",
    liabilityAmount: 4850,
    status: "upcoming",
    sarsPrn: "PRN-EMP-202608-71239",
    notes: "PAYE (R3,950) + UIF (R450) + SDL (R450) monthly employer filing.",
  },
  {
    id: "filing_irp6_p1_2027",
    filingType: "IRP6_P1",
    title: "Provisional Tax Return IRP6 (1st Period 2027)",
    periodLabel: "2027/01",
    taxYear: 2027,
    dueDate: "2026-08-31",
    liabilityAmount: 18500,
    status: "ready_to_file",
    sarsPrn: "PRN-IRP6-202701-90123",
    notes: "1st Period Provisional Tax estimate for 2027 tax year based on YTD earnings.",
  },
  {
    id: "filing_vat_2026_07",
    filingType: "VAT201",
    title: "VAT201 Monthly Return (July 2026)",
    periodLabel: "2026/07",
    taxYear: 2027,
    dueDate: "2026-08-31",
    liabilityAmount: 12450,
    status: "filed_efiling",
    sarsPrn: "PRN-VAT-202607-49102",
    filedDate: "2026-08-25",
    paymentDate: "2026-08-26",
    notes: "Filed on SARS eFiling via EFT Batch. Payment confirmation ref: EFT-SARS-88192.",
  },
  {
    id: "filing_itr14_2026",
    filingType: "ITR14",
    title: "Annual Corporate Income Tax (ITR14 2026)",
    periodLabel: "2026 Tax Year",
    taxYear: 2026,
    dueDate: "2027-02-28",
    liabilityAmount: 0,
    status: "upcoming",
    sarsPrn: "PRN-ITR14-2026-90123",
    notes: "Annual corporate income tax return with audited annual financial statements.",
  },
];

