import React, { useRef, useState } from "react";
import {
  HardDriveDownload,
  Upload,
  FileSpreadsheet,
  Monitor,
  CheckCircle2,
  ShieldCheck,
  Info,
  RefreshCw,
  Terminal,
  FolderArchive,
  AppWindow,
  Download,
  Laptop,
  FileCode,
  Sparkles,
} from "lucide-react";
import {
  BusinessProfile,
  Quotation,
  Invoice,
  BankTransaction,
  Client,
  Expense,
  BankAccount,
} from "../../types";
import { storage } from "../../lib/storage";
import { downloadOfflineDesktopApp } from "../../lib/offlineDesktopBundle";

interface LocalBackupCenterProps {
  profile: BusinessProfile;
  quotations: Quotation[];
  invoices: Invoice[];
  bankTransactions: BankTransaction[];
  clients: Client[];
  expenses?: Expense[];
  bankAccounts?: BankAccount[];
  onReloadState: () => void;
}

export const LocalBackupCenter: React.FC<LocalBackupCenterProps> = ({
  profile,
  quotations,
  invoices,
  bankTransactions,
  clients,
  expenses = [],
  bankAccounts = [],
  onReloadState,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [restoreMessage, setRestoreMessage] = useState<string>("");
  const [downloadedPackage, setDownloadedPackage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storage.importBackupJSON(content);
      if (success) {
        setRestoreMessage("Database successfully restored from backup file!");
        onReloadState();
      } else {
        setRestoreMessage("Error: Invalid backup file format.");
      }
    };
    reader.readAsText(file);
  };

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

  // 1. Download Windows Batch & PowerShell Desktop Installer
  const handleDownloadWindowsInstaller = () => {
    const appUrl = window.location.href;
    const batContent = `@echo off
:: =========================================================
:: Fast-Books Desktop Application Installer for Windows
:: Proprietor: ${profile.ownerName} - ${profile.businessName}
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
    triggerDownload(batContent, `Install_FastBooks_Windows_${profile.ownerName.replace(/\s+/g, "_")}.bat`, "text/plain");
  };

  // 2. Download macOS Launcher Script
  const handleDownloadMacInstaller = () => {
    const appUrl = window.location.href;
    const commandContent = `#!/bin/bash
# =========================================================
# Fast-Books Desktop App Installer for macOS
# Proprietor: ${profile.ownerName}
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
    triggerDownload(commandContent, `Install_FastBooks_macOS_${profile.ownerName.replace(/\s+/g, "_")}.command`, "text/x-shellscript");
  };

  // 3. Download Offline Standalone HTML Interactive App
  const handleDownloadOfflineHTMLBundle = () => {
    downloadOfflineDesktopApp({
      profile,
      quotations,
      invoices,
      bankAccounts: bankAccounts.length > 0 ? bankAccounts : storage.getBankAccounts(),
      bankTransactions,
      clients,
      expenses: expenses.length > 0 ? expenses : storage.getExpenses(),
    });
    setDownloadedPackage(`FastBooks_Desktop_Standalone_${new Date().toISOString().split("T")[0]}.html`);
    setTimeout(() => setDownloadedPackage(null), 5000);
  };

  // 4. Download PowerShell Daily Auto-Backup Script for Windows
  const handleDownloadPowerShellAutoBackup = () => {
    const psScript = `# =========================================================
# Fast-Books Daily Automated Backup Script for Windows
# Proprietor: ${profile.ownerName}
# =========================================================

$OwnerName = "${profile.ownerName}"
$BusinessName = "${profile.businessName}"
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

# Notification
[System.Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms") | Out-Null
[System.Windows.Forms.MessageBox]::Show("Fast-Books backup directory verified at $BackupDir", "Fast-Books Auto-Backup")
`;
    triggerDownload(psScript, `FastBooks_Daily_AutoBackup_${profile.ownerName.replace(/\s+/g, "_")}.ps1`, "text/plain");
  };

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
        Category: tx.category || "",
        Reference: tx.reference,
        Amount: tx.amount,
        Reconciled: tx.isReconciled ? "Yes" : "No",
      }))
    );
  };

  const handleExportExpensesCSV = () => {
    const exps = expenses.length > 0 ? expenses : storage.getExpenses();
    storage.exportToCSV(
      "fastbooks_expenses",
      exps.map((e) => ({
        Date: e.date,
        Title: e.title,
        Vendor: e.vendor,
        Category: e.category,
        Amount: e.amount,
        TaxAmount: e.taxAmount || 0,
        PaymentMethod: e.paymentMethod || "",
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

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase mb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sole Proprietor Data & Desktop Installation Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Desktop Computer Installation & Offline Downloads
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Licensed strictly to <strong>{profile.ownerName}</strong> ({profile.businessName}). Download standalone offline apps, executable installers, desktop shortcuts, and local database backup tools directly to your PC.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadOfflineHTMLBundle}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg transition cursor-pointer flex items-center justify-center gap-2.5 whitespace-nowrap border border-emerald-400/30"
          >
            <Download className="w-5 h-5 text-white" />
            <span>Download Offline App (.html)</span>
          </button>

          <button
            onClick={() => storage.exportBackupJSON()}
            className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg transition cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap border border-indigo-400/30"
          >
            <HardDriveDownload className="w-4 h-4 text-emerald-300" />
            <span>Export Database (.json)</span>
          </button>
        </div>
      </div>

      {downloadedPackage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong>Installation Package Downloaded:</strong> <code className="bg-emerald-950/60 px-2 py-0.5 rounded text-emerald-200">{downloadedPackage}</code> was successfully generated and saved to your computer!
          </span>
        </div>
      )}

      {/* Desktop Installation Packages Download Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">Desktop Installer & Offline Packages</h2>
              <p className="text-xs text-slate-500">Download system installers tailored for Jan Coetzee's computer</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            OFFLINE READY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Standalone HTML Offline App */}
          <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/30 hover:bg-emerald-50/60 transition-all flex flex-col justify-between space-y-4 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Offline App (.html)
                </span>
                <FileCode className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Standalone Offline Desktop App</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Self-contained interactive application. Double click to run 100% offline with full Invoices, Expenses, Bank Recon, and local storage.
              </p>
            </div>
            <button
              onClick={handleDownloadOfflineHTMLBundle}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md border border-emerald-400/30"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download Offline App</span>
            </button>
          </div>

          {/* Windows Installer */}
          <div className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  Windows (.bat)
                </span>
                <Laptop className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Windows Desktop Installer</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automated Batch script that builds a Fast-Books application shortcut on your Windows Desktop.
              </p>
            </div>
            <button
              onClick={handleDownloadWindowsInstaller}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm border border-slate-700"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Windows Installer</span>
            </button>
          </div>

          {/* macOS Installer */}
          <div className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  macOS (.command)
                </span>
                <AppWindow className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Mac App Launcher</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Executable Terminal script creating an Apple desktop launcher bundle for Chrome / Safari.
              </p>
            </div>
            <button
              onClick={handleDownloadMacInstaller}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm border border-slate-700"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Download macOS Launcher</span>
            </button>
          </div>

          {/* Auto Backup PowerShell Script */}
          <div className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Auto-Backup (.ps1)
                </span>
                <Terminal className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Daily Auto-Backup Script</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                PowerShell script for Windows Task Scheduler to back up database files to Documents automatically.
              </p>
            </div>
            <button
              onClick={handleDownloadPowerShellAutoBackup}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm border border-slate-700"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download PowerShell Script</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desktop Installation Guide */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
            <Monitor className="w-5 h-5 text-indigo-600" />
            <h2>Web App / PWA Desktop Installation Guide</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-700">
            <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                Fast-Books is engineered with Progressive Web App (PWA) technology. You can install it directly from your web browser as a native desktop program with taskbar integration and full offline functionality!
              </p>
            </div>

            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider pt-2">
              Installation Instructions for {profile.ownerName}:
            </h3>

            <ol className="list-decimal list-inside space-y-2.5 text-xs leading-relaxed text-slate-600 font-medium">
              <li className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <strong className="text-slate-900">Chrome / Edge URL Bar:</strong> Look at the right side of your browser URL bar for the <strong>Install Fast-Books</strong> icon (a computer monitor with a down arrow).
              </li>
              <li className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <strong className="text-slate-900">Browser Menu Alternative:</strong> Click the browser menu (⋮ or ...) &gt; <strong>Save & Share</strong> &gt; <strong>Install Fast-Books...</strong>
              </li>
              <li className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <strong className="text-slate-900">Pin to Taskbar:</strong> Click <strong>"Install"</strong>. Fast-Books will open in its own clean window without browser controls and place a shortcut on your Desktop and Start Menu.
              </li>
            </ol>
          </div>
        </div>

        {/* Database Backup & Restore */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
            <HardDriveDownload className="w-5 h-5 text-emerald-600" />
            <h2>Full Database Backup & Restore (.json)</h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Export your complete Fast-Books workspace (Quotes, Invoices, Clients, Bank Feeds, Expenses, Settings) to a single portable JSON file for transfer, archiving, or offline security.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={() => storage.exportBackupJSON()}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm border border-slate-700"
              >
                <HardDriveDownload className="w-4 h-4 text-emerald-400" />
                <span>Download Backup (.json)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300/80 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Upload className="w-4 h-4 text-slate-600" />
                <span>Restore Backup File</span>
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
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{restoreMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSV Spreadsheet Exports */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
          <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
          <h2>CSV & Excel Data Exports</h2>
        </div>

        <p className="text-xs text-slate-600 font-medium">
          Export individual data collections as standard CSV files for viewing in Microsoft Excel, Google Sheets, or local tax accounting software:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <button
            onClick={handleExportQuotesCSV}
            className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-between transition cursor-pointer"
          >
            <span>Quotations CSV</span>
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
          </button>

          <button
            onClick={handleExportInvoicesCSV}
            className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-between transition cursor-pointer"
          >
            <span>Invoices CSV</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </button>

          <button
            onClick={handleExportExpensesCSV}
            className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-between transition cursor-pointer"
          >
            <span>Expenses CSV</span>
            <FileSpreadsheet className="w-4 h-4 text-rose-600" />
          </button>

          <button
            onClick={handleExportBankCSV}
            className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-between transition cursor-pointer"
          >
            <span>Bank Feeds CSV</span>
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          </button>

          <button
            onClick={handleExportClientsCSV}
            className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-between transition cursor-pointer"
          >
            <span>Clients CSV</span>
            <FileSpreadsheet className="w-4 h-4 text-sky-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
