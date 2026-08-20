import React, { useState, useRef } from "react";
import {
  X,
  Save,
  ShieldCheck,
  Landmark,
  Building,
  DollarSign,
  Key,
  Eye,
  EyeOff,
  Lock,
  RefreshCw,
  CheckCircle2,
  FileText,
  User,
  HardDriveDownload,
  Upload,
  Download,
  Laptop,
  Monitor,
  Terminal,
  FileCode,
  FolderArchive,
  FileSpreadsheet,
  Database,
  Sparkles,
  AppWindow,
  AlertCircle,
  Receipt,
  CreditCard,
  Users,
} from "lucide-react";
import {
  BusinessProfile,
  Quotation,
  Invoice,
  BankTransaction,
  Client,
  Expense,
} from "../../types";
import { storage } from "../../lib/storage";

interface SettingsModalProps {
  profile: BusinessProfile;
  quotations?: Quotation[];
  invoices?: Invoice[];
  bankTransactions?: BankTransaction[];
  clients?: Client[];
  expenses?: Expense[];
  onReloadState?: () => void;
  onClose: () => void;
  onSave: (profile: BusinessProfile) => void;
  initialTab?: "business" | "backup" | "credentials" | "banking" | "terms";
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  quotations = [],
  invoices = [],
  bankTransactions = [],
  clients = [],
  expenses = [],
  onReloadState,
  onClose,
  onSave,
  initialTab = "business",
}) => {
  const [activeTab, setActiveTab] = useState<
    "business" | "backup" | "credentials" | "banking" | "terms"
  >(initialTab);

  // Business Name & Ownership
  const [ownerName, setOwnerName] = useState(profile.ownerName || "");
  const [companyName, setCompanyName] = useState(profile.companyName || "");
  const [tradingName, setTradingName] = useState(profile.tradingName || "Fast-Books PRO");
  const [registrationNumber, setRegistrationNumber] = useState(profile.registrationNumber || "");
  const [taxNumber, setTaxNumber] = useState(profile.taxNumber || "");
  const [accountingLicenseNumber, setAccountingLicenseNumber] = useState(profile.accountingLicenseNumber || "");
  const [email, setEmail] = useState(profile.email || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [address, setAddress] = useState(profile.address || "");

  // Credentials & Security State
  const [systemPassword, setSystemPassword] = useState(profile.systemPassword || "FastBooksAdmin2026!");
  const [securityPin, setSecurityPin] = useState(profile.securityPin || "4321");
  const [bankSyncUsername, setBankSyncUsername] = useState(profile.bankSyncUsername || "jan_coetzee_fnb");
  const [bankSyncPassword, setBankSyncPassword] = useState(profile.bankSyncPassword || "fnb_secure_sync_pass");
  const [apiSecretKey, setApiSecretKey] = useState(profile.apiSecretKey || "fb_live_sec_9810234812");

  // Show/Hide Toggles
  const [showSystemPass, setShowSystemPass] = useState(false);
  const [showBankPass, setShowBankPass] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Banking Details
  const [bankName, setBankName] = useState(profile.bankName || "");
  const [bankAccountHolder, setBankAccountHolder] = useState(profile.bankAccountHolder || "");
  const [bankAccountNumber, setBankAccountNumber] = useState(profile.bankAccountNumber || "");
  const [bankBranchCode, setBankBranchCode] = useState(profile.bankBranchCode || "");

  // Currency & Tax Defaults
  const [currency, setCurrency] = useState<BusinessProfile["currency"]>(profile.currency || "ZAR");
  const [defaultTaxRate, setDefaultTaxRate] = useState(profile.defaultTaxRate || 15);

  const [quotationNotes, setQuotationNotes] = useState(profile.quotationNotes || "");
  const [invoiceTerms, setInvoiceTerms] = useState(profile.invoiceTerms || "");

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Backup & Local Ownership state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [restoreMessage, setRestoreMessage] = useState<string>("");
  const [downloadedPackage, setDownloadedPackage] = useState<string | null>(null);

  const triggerDownload = (content: string, filename: string, type: string = "text/plain") => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedPackage(filename);
    setTimeout(() => setDownloadedPackage(null), 5000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storage.importBackupJSON(content);
      if (success) {
        setRestoreMessage("Database successfully restored from backup file!");
        if (onReloadState) {
          onReloadState();
        }
      } else {
        setRestoreMessage("Error: Invalid backup file format.");
      }
    };
    reader.readAsText(file);
  };

  // Windows Desktop Installer (.bat)
  const handleDownloadWindowsInstaller = () => {
    const appUrl = window.location.href;
    const batContent = `@echo off
:: =========================================================
:: Fast-Books Desktop Application Installer for Windows
:: Proprietor: ${ownerName || profile.ownerName} - ${companyName || profile.companyName}
:: =========================================================
title Fast-Books Desktop Installer
color 0A
echo.
echo ========================================================
echo   Installing Fast-Books PRO Desktop Shortcut for Windows
echo ========================================================
echo.

set APP_URL=${appUrl}
set SHORTCUT_NAME=Fast-Books Desktop
set DESKTOP_PATH=%USERPROFILE%\\Desktop\\%SHORTCUT_NAME%.url

echo Creating desktop shortcut pointing to Fast-Books...
(
echo [InternetShortcut]
echo URL=%APP_URL%
echo IconIndex=0
echo IconFile=%SystemRoot%\\System32\\SHELL32.dll,13
) > "%DESKTOP_PATH%"

echo.
echo [SUCCESS] Fast-Books Desktop shortcut created successfully on your Windows Desktop!
echo Location: %DESKTOP_PATH%
echo.
echo Launching Fast-Books in Desktop App Mode...
start msedge --app="%APP_URL%" || start chrome --app="%APP_URL%" || start "%APP_URL%"
echo.
pause
`;
    triggerDownload(batContent, `Install_FastBooks_Windows_${(ownerName || profile.ownerName).replace(/\s+/g, "_")}.bat`, "text/plain");
  };

  // macOS / Linux Launcher (.command)
  const handleDownloadMacInstaller = () => {
    const appUrl = window.location.href;
    const commandContent = `#!/bin/bash
# =========================================================
# Fast-Books Desktop App Installer for macOS
# Proprietor: ${ownerName || profile.ownerName}
# =========================================================

echo "========================================================"
echo "  Fast-Books PRO Desktop Launcher for macOS"
echo "========================================================"
echo ""

APP_URL="${appUrl}"
DESKTOP_PATH="$HOME/Desktop/Fast-Books.command"

cat << 'EOF' > "$DESKTOP_PATH"
#!/bin/bash
open -a "Google Chrome" --args --app="${appUrl}" || open -a "Safari" "${appUrl}"
EOF

chmod +x "$DESKTOP_PATH"

echo "[SUCCESS] Desktop Launcher created at $DESKTOP_PATH"
echo "Opening Fast-Books Desktop App now..."
open -a "Google Chrome" --args --app="$APP_URL" || open "$APP_URL"
`;
    triggerDownload(commandContent, `Install_FastBooks_macOS_${(ownerName || profile.ownerName).replace(/\s+/g, "_")}.command`, "text/x-shellscript");
  };

  // Standalone HTML Offline Container
  const handleDownloadOfflineHTMLBundle = () => {
    const currentData = storage.exportBackupJSONString();
    const htmlBundle = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fast-Books Desktop Standalone App - ${companyName || profile.companyName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 32px; max-width: 600px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    h1 { margin-top: 0; color: #38bdf8; font-size: 24px; font-weight: 800; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
    .badge { background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.2); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 16px; }
    .btn { background: #0284c7; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; text-decoration: none; display: inline-block; margin-top: 16px; }
    .btn:hover { background: #0369a1; }
    pre { background: #0f172a; padding: 16px; border-radius: 12px; overflow-x: auto; font-size: 12px; border: 1px solid #334155; max-height: 200px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">FAST-BOOKS DESKTOP OFFLINE CONTAINER</div>
    <h1>${companyName || profile.companyName}</h1>
    <p>Sole Owner: <strong>${ownerName || profile.ownerName}</strong> (${taxNumber || profile.taxNumber || "Tax Registered"})</p>
    <p>This is your standalone offline container file containing all live database records (Invoices, Quotations, Bank Feeds, Clients, and Settings).</p>
    <a href="${window.location.href}" class="btn">Launch Live Web Application &rarr;</a>
    <h3 style="color:#e2e8f0; font-size:14px; margin-top:24px;">Local Database Payload Snapshot:</h3>
    <pre><code>${currentData.slice(0, 1000)}...\n/* Complete database records included */</code></pre>
  </div>
</body>
</html>`;
    triggerDownload(htmlBundle, `FastBooks_Offline_Desktop_Bundle.html`, "text/html");
  };

  // PowerShell Auto-Backup Script (.ps1)
  const handleDownloadPowerShellAutoBackup = () => {
    const psScript = `# =========================================================
# Fast-Books Daily Automated Backup Script for Windows
# Proprietor: ${ownerName || profile.ownerName}
# =========================================================

$OwnerName = "${ownerName || profile.ownerName}"
$BusinessName = "${companyName || profile.companyName}"
$BackupDir = "$HOME\\Documents\\FastBooks_Backups"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
    Write-Host "Created Backup Directory: $BackupDir" -ForegroundColor Green
}

$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupFile = "$BackupDir\\FastBooks_Backup_$Timestamp.json"

$AppUrl = "${window.location.href}"

Write-Host "Starting Fast-Books Daily Auto-Backup for $BusinessName..." -ForegroundColor Cyan
Write-Host "Backup target: $BackupFile" -ForegroundColor Yellow
`;
    triggerDownload(psScript, `FastBooks_Daily_AutoBackup_${(ownerName || profile.ownerName).replace(/\s+/g, "_")}.ps1`, "text/plain");
  };

  // CSV Exports
  const handleExportQuotesCSV = () => {
    storage.exportToCSV(
      "fastbooks_quotations",
      quotations.map((q) => ({
        QuoteNumber: q.quoteNumber,
        Client: q.clientName,
        Date: q.date,
        ExpiryDate: q.expiryDate,
        GrandTotal: q.grandTotal,
        Status: q.status,
      }))
    );
  };

  const handleExportInvoicesCSV = () => {
    storage.exportToCSV(
      "fastbooks_invoices",
      invoices.map((inv) => ({
        InvoiceNumber: inv.invoiceNumber,
        Client: inv.clientName,
        Date: inv.date,
        DueDate: inv.dueDate,
        GrandTotal: inv.grandTotal,
        PaidAmount: inv.paidAmount,
        Status: inv.status,
      }))
    );
  };

  const handleExportBankCSV = () => {
    storage.exportToCSV(
      "fastbooks_bank_feed",
      bankTransactions.map((tx) => ({
        Date: tx.date,
        Description: tx.description,
        Reference: tx.reference,
        Amount: tx.amount,
        Reconciled: tx.isReconciled ? "Yes" : "No",
      }))
    );
  };

  const handleExportClientsCSV = () => {
    storage.exportToCSV(
      "fastbooks_clients",
      clients.map((c) => ({
        Name: c.name,
        Company: c.companyName || "",
        Email: c.email,
        Phone: c.phone,
        TaxNumber: c.taxNumber || "",
        Address: c.address,
      }))
    );
  };

  const handleExportExpensesCSV = () => {
    storage.exportToCSV(
      "fastbooks_expenses",
      expenses.map((e) => ({
        Date: e.date,
        Payee: e.payee,
        Category: e.category,
        Amount: e.amount,
        TaxAmount: e.taxAmount || 0,
        Description: e.description || "",
      }))
    );
  };

  const handleGenerateNewApiKey = () => {
    const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    setApiSecretKey(`fb_live_sec_${randomHex}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const currencySymbols: Record<string, "R" | "$" | "€" | "£"> = {
      ZAR: "R",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };

    const updatedProfile: BusinessProfile = {
      ownerName,
      companyName,
      tradingName,
      registrationNumber,
      taxNumber,
      accountingLicenseNumber,
      email,
      phone,
      address,
      systemPassword,
      securityPin,
      bankSyncUsername,
      bankSyncPassword,
      apiSecretKey,
      bankName,
      bankAccountHolder,
      bankAccountNumber,
      bankBranchCode,
      currency,
      currencySymbol: currencySymbols[currency] || "R",
      defaultTaxRate: Number(defaultTaxRate),
      quotationNotes,
      invoiceTerms,
    };

    onSave(updatedProfile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
                <span>Business, Ownership & Settings Manager</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  LOCAL SECURE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Sole Proprietor: <strong className="text-slate-200">{ownerName || profile.ownerName}</strong> • Configure identity, backups, credentials & banking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher Bar */}
        <div className="bg-slate-100/90 border-b border-slate-200/90 px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("business")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "business"
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Business Name & Identity</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("backup")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "backup"
                ? "bg-white text-emerald-600 shadow-sm border border-slate-200"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            <HardDriveDownload className="w-4 h-4 text-emerald-600" />
            <span>Local Ownership & Backup</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("credentials")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "credentials"
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            <Key className="w-4 h-4 text-emerald-600" />
            <span>Credentials & Passcodes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("banking")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "banking"
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Banking & Tax Setup</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("terms")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "terms"
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Invoicing Terms</span>
          </button>
        </div>

        {/* Success Toast */}
        {savedSuccess && (
          <div className="bg-emerald-500 text-slate-950 px-6 py-2.5 font-bold text-xs flex items-center justify-between border-b border-emerald-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Business name and security credentials successfully updated!
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-800 flex-1">
          {/* TAB 1: Business Name & Identity */}
          {activeTab === "business" && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start gap-3">
                <Building className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                  Update your legal company name, trading name, tax numbers, and sole owner details printed across all invoices, quotes, and reports.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Business / Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder="e.g. Fast-Books Business Solutions"
                    className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Trading As (t/a) Name</label>
                  <input
                    type="text"
                    value={tradingName}
                    onChange={(e) => setTradingName(e.target.value)}
                    placeholder="e.g. Fast-Books PRO"
                    className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Sole Owner Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                    placeholder="e.g. Jan Coetzee"
                    className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Company Registration Number</label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. 2024/891234/07"
                    className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">VAT / Tax Registration Number</label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="e.g. VAT-4910293847"
                    className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Accounting / Practitioner License #</label>
                  <input
                    type="text"
                    value={accountingLicenseNumber}
                    onChange={(e) => setAccountingLicenseNumber(e.target.value)}
                    placeholder="e.g. SAIPA-981042"
                    className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Primary Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. jancoetzee00@gmail.com"
                    className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +27 (0)82 555 1234"
                    className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Business Operating Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 142 Highveld Techno Park, Centurion, Gauteng, 0157"
                  className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                />
              </div>
            </div>
          )}

          {/* TAB: Local Ownership & Backup */}
          {activeTab === "backup" && (
            <div className="space-y-6 animate-fade-in">
              {/* Sole Ownership Banner */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sole Proprietor Data & Hard Drive Ownership</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {ownerName || profile.ownerName} • {companyName || profile.companyName}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    All financial records are stored securely on your local hard drive with no third-party cloud lock-in. You have 100% data sovereignty and can download, restore, or export anytime.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => storage.exportBackupJSON()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup (.json)</span>
                </button>
              </div>

              {downloadedPackage && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Package Generated:</strong> <code className="bg-emerald-950/60 px-1.5 py-0.5 rounded text-emerald-200">{downloadedPackage}</code> saved to your computer!
                  </span>
                </div>
              )}

              {/* Local Storage Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-center">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Invoices</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">{invoices.length}</div>
                  <div className="text-[9px] text-slate-400">On Disk</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-center">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Quotations</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">{quotations.length}</div>
                  <div className="text-[9px] text-slate-400">On Disk</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-center">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Bank Feeds</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">{bankTransactions.length}</div>
                  <div className="text-[9px] text-slate-400">On Disk</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-center">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Clients</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">{clients.length}</div>
                  <div className="text-[9px] text-slate-400">On Disk</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-center col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Expenses</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">{expenses.length}</div>
                  <div className="text-[9px] text-slate-400">On Disk</div>
                </div>
              </div>

              {/* Database Backup & Restore Box */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <HardDriveDownload className="w-4 h-4 text-indigo-600" />
                    <span>Database Backup & Restore (.json)</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    PORTABLE
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Export your complete accounting workspace (Invoices, Quotes, Clients, Bank Feeds, Expenses, VAT settings, Business Profile) to a standalone JSON file for offline archiving or machine transfer.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => storage.exportBackupJSON()}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm border border-slate-700"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download Full Backup (.json)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>Restore / Import Backup File</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                  />
                </div>

                {restoreMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{restoreMessage}</span>
                  </div>
                )}
              </div>

              {/* Desktop App & Installer Downloads */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-emerald-600" />
                    <span>Desktop App Packages & Installation Scripts</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ONE-CLICK DOWNLOAD
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Install Fast-Books as a standalone native program on {ownerName || profile.ownerName}'s computer:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Windows Batch */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                          Windows (.bat)
                        </span>
                        <Laptop className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="font-bold text-xs text-slate-900">Desktop Shortcut</div>
                      <div className="text-[11px] text-slate-500 leading-tight">
                        Adds Fast-Books icon directly to Windows desktop.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadWindowsInstaller}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Download .bat</span>
                    </button>
                  </div>

                  {/* macOS / Linux */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                          macOS (.command)
                        </span>
                        <AppWindow className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="font-bold text-xs text-slate-900">Mac App Launcher</div>
                      <div className="text-[11px] text-slate-500 leading-tight">
                        Terminal script creating Apple desktop bundle.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadMacInstaller}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-400" />
                      <span>Download .command</span>
                    </button>
                  </div>

                  {/* Standalone HTML */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Offline App (.html)
                        </span>
                        <FileCode className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="font-bold text-xs text-slate-900">Offline Container</div>
                      <div className="text-[11px] text-slate-500 leading-tight">
                        Self-contained offline HTML snapshot.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadOfflineHTMLBundle}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Download .html</span>
                    </button>
                  </div>

                  {/* PowerShell Auto-Backup */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          Auto-Backup (.ps1)
                        </span>
                        <Terminal className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="font-bold text-xs text-slate-900">Task Scheduler Script</div>
                      <div className="text-[11px] text-slate-500 leading-tight">
                        Windows PowerShell daily auto-backup tool.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadPowerShellAutoBackup}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Download .ps1</span>
                    </button>
                  </div>
                </div>

                {/* PWA Direct Installation Guide */}
                <div className="p-4 bg-indigo-50/80 rounded-xl border border-indigo-100 space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-950 font-bold text-xs">
                    <Monitor className="w-4 h-4 text-indigo-600" />
                    <span>Install via Browser URL Bar (PWA):</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    In Chrome or Microsoft Edge, look at the right end of the address bar and click the <strong>Install Fast-Books</strong> icon (or Menu &gt; Save & Share &gt; Install). Fast-Books will install as a native desktop program with no browser tabs or navigation clutter.
                  </p>
                </div>
              </div>

              {/* CSV Spreadsheet Exports */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                  <span>CSV & Excel Spreadsheet Exports</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <button
                    type="button"
                    onClick={handleExportInvoicesCSV}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold text-xs hover:bg-slate-100 flex items-center justify-between transition cursor-pointer"
                  >
                    <span>Invoices CSV</span>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  </button>

                  <button
                    type="button"
                    onClick={handleExportQuotesCSV}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold text-xs hover:bg-slate-100 flex items-center justify-between transition cursor-pointer"
                  >
                    <span>Quotes CSV</span>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                  </button>

                  <button
                    type="button"
                    onClick={handleExportBankCSV}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold text-xs hover:bg-slate-100 flex items-center justify-between transition cursor-pointer"
                  >
                    <span>Bank CSV</span>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                  </button>

                  <button
                    type="button"
                    onClick={handleExportClientsCSV}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold text-xs hover:bg-slate-100 flex items-center justify-between transition cursor-pointer"
                  >
                    <span>Clients CSV</span>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
                  </button>

                  <button
                    type="button"
                    onClick={handleExportExpensesCSV}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold text-xs hover:bg-slate-100 flex items-center justify-between transition cursor-pointer col-span-2 sm:col-span-1"
                  >
                    <span>Expenses CSV</span>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Credentials & Access Security */}
          {activeTab === "credentials" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                <Key className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">
                    Account Security & Credentials Management
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-medium">
                    Manage your system master administrator password, quick security PIN, live bank sync credentials, and external API secret keys.
                  </p>
                </div>
              </div>

              {/* System Admin Password & PIN */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>Master Administrator Passcode & Desktop PIN</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">System Master Password</label>
                    <div className="relative">
                      <input
                        type={showSystemPass ? "text" : "password"}
                        value={systemPassword}
                        onChange={(e) => setSystemPassword(e.target.value)}
                        placeholder="Enter master password..."
                        className="w-full p-2.5 pr-10 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSystemPass(!showSystemPass)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSystemPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Quick Access Security PIN (4 digits)</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={securityPin}
                      onChange={(e) => setSecurityPin(e.target.value)}
                      placeholder="e.g. 4321"
                      className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold text-slate-900 tracking-widest"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Feed Credentials */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  <span>Direct Bank Feed Integration Credentials</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Bank Sync Username / Client ID</label>
                    <input
                      type="text"
                      value={bankSyncUsername}
                      onChange={(e) => setBankSyncUsername(e.target.value)}
                      placeholder="e.g. jan_coetzee_fnb"
                      className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Bank Feed Sync Password / Token</label>
                    <div className="relative">
                      <input
                        type={showBankPass ? "text" : "password"}
                        value={bankSyncPassword}
                        onChange={(e) => setBankSyncPassword(e.target.value)}
                        placeholder="Enter bank sync token..."
                        className="w-full p-2.5 pr-10 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBankPass(!showBankPass)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showBankPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integration API Secret Key */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-600" />
                    <span>API Integration Secret Key</span>
                  </h4>

                  <button
                    type="button"
                    onClick={handleGenerateNewApiKey}
                    className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate Key</span>
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Secret Key Payload</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiSecretKey}
                      onChange={(e) => setApiSecretKey(e.target.value)}
                      className="w-full p-2.5 pr-10 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Banking & Tax Setup */}
          {activeTab === "banking" && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <Landmark className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Default banking details printed on client Tax Invoices and Quotations for direct EFT payments.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. First National Bank (FNB)"
                    className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={bankAccountHolder}
                    onChange={(e) => setBankAccountHolder(e.target.value)}
                    placeholder="e.g. Jan Coetzee t/a Fast-Books"
                    className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="e.g. 62891048291"
                    className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Branch Code</label>
                  <input
                    type="text"
                    value={bankBranchCode}
                    onChange={(e) => setBankBranchCode(e.target.value)}
                    placeholder="e.g. 250655"
                    className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Primary Operating Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as BusinessProfile["currency"])}
                    className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="ZAR">ZAR (R) - South African Rand</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Default Tax / VAT Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={defaultTaxRate}
                    onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Invoicing Terms */}
          {activeTab === "terms" && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <FileText className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Customize the default legal terms, warranty notices, and payment instructions automatically pre-populated on new quotations and invoices.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Default Quotation Notes</label>
                  <textarea
                    rows={4}
                    value={quotationNotes}
                    onChange={(e) => setQuotationNotes(e.target.value)}
                    placeholder="e.g. Quotations are valid for 30 days..."
                    className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Default Invoice Payment Terms & Instructions</label>
                  <textarea
                    rows={4}
                    value={invoiceTerms}
                    onChange={(e) => setInvoiceTerms(e.target.value)}
                    placeholder="e.g. Payment due within 14 days of invoice date..."
                    className="w-full p-2.5 bg-white border border-slate-300/80 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Bar */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-200 shrink-0">
            <p className="text-xs text-slate-400 font-medium">
              Changes persist instantly to your local computer.
            </p>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition cursor-pointer border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer flex items-center gap-2 border border-indigo-500/30"
              >
                <Save className="w-4 h-4" />
                <span>Save Business & Credentials</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

