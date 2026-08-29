import React, { useRef, useState, useEffect } from "react";
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
  Zap,
  Loader2,
} from "lucide-react";
import { BusinessProfile, Quotation, Invoice, BankTransaction, Client, Expense } from "../../types";
import { storage } from "../../lib/storage";
import { generateOfflineDesktopHTML } from "../../lib/offlineDesktopBundle";
import { generateOfflineInstallationZip } from "../../lib/offlineDesktopZip";

interface LocalBackupCenterProps {
  profile: BusinessProfile;
  quotations: Quotation[];
  invoices: Invoice[];
  bankTransactions: BankTransaction[];
  clients: Client[];
  expenses?: Expense[];
  onReloadState: () => void;
}

export const LocalBackupCenter: React.FC<LocalBackupCenterProps> = ({
  profile,
  quotations,
  invoices,
  bankTransactions,
  clients,
  expenses = [],
  onReloadState,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [restoreMessage, setRestoreMessage] = useState<string>("");
  const [downloadedPackage, setDownloadedPackage] = useState<string | null>(null);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

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

  const triggerBlobDownload = (blob: Blob, filename: string) => {
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

  const triggerDownload = (content: string, filename: string, type: string = "text/plain") => {
    const blob = new Blob([content], { type });
    triggerBlobDownload(blob, filename);
  };

  // 1. Download Complete ZIP Installation Package
  const handleDownloadCompleteZipSuite = async () => {
    try {
      setIsGeneratingZip(true);
      const sarsProfile = storage.getSarsProfile();
      const sarsFilings = storage.getSarsFilings();
      const bankAccounts = storage.getBankAccounts();
      const currentExpenses = expenses.length ? expenses : storage.getExpenses();

      const zipBlob = await generateOfflineInstallationZip({
        profile,
        clients,
        quotations,
        invoices,
        bankAccounts,
        bankTransactions,
        expenses: currentExpenses,
        sarsProfile,
        sarsFilings,
      });
      const filename = `FastBooks_Offline_Desktop_Suite_${profile.ownerName.replace(/\s+/g, "_")}.zip`;
      triggerBlobDownload(zipBlob, filename);
    } catch (err) {
      console.error("Failed to generate zip:", err);
      handleDownloadOfflineHTMLBundle();
    } finally {
      setIsGeneratingZip(false);
    }
  };

  // 2. Download Windows Batch Desktop Installer
  const handleDownloadWindowsInstaller = () => {
    const appUrl = window.location.href;
    const batContent = `@echo off
:: =========================================================
:: Fast-Books Desktop Application Installer for Windows
:: Proprietor: ${profile.ownerName} - ${profile.tradingName || profile.companyName}
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

  // 3. Download macOS Launcher Script
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
open -a "Google Chrome" --args --app="${appUrl}" || open -a "Safari" "${appUrl}" || open "${appUrl}"
EOF

chmod +x "$DESKTOP_PATH"

echo "[SUCCESS] Desktop Launcher created at $DESKTOP_PATH"
echo "Opening Fast-Books Desktop App now..."
open -a "Google Chrome" --args --app="$APP_URL" || open "$APP_URL"
`;
    triggerDownload(commandContent, `Install_FastBooks_macOS_${profile.ownerName.replace(/\s+/g, "_")}.command`, "text/x-shellscript");
  };

  // 4. Download Offline Standalone HTML App (100% Offline Single-File Application)
  const handleDownloadOfflineHTMLBundle = () => {
    const sarsProfile = storage.getSarsProfile();
    const sarsFilings = storage.getSarsFilings();
    const bankAccounts = storage.getBankAccounts();
    const currentExpenses = expenses.length ? expenses : storage.getExpenses();

    const htmlBundle = generateOfflineDesktopHTML({
      profile,
      clients,
      quotations,
      invoices,
      bankAccounts,
      bankTransactions,
      expenses: currentExpenses,
      sarsProfile,
      sarsFilings,
    });
    triggerDownload(htmlBundle, `FastBooks_Offline_App_${profile.ownerName.replace(/\s+/g, "_")}.html`, "text/html");
  };

  // 5. Download Linux .desktop Launcher
  const handleDownloadLinuxLauncher = () => {
    const appUrl = window.location.href;
    const desktopContent = `[Desktop Entry]
Version=1.0
Type=Application
Name=Fast-Books PRO Desktop
Comment=South African Bookkeeping & Tax Invoicing for ${profile.ownerName}
Exec=xdg-open "${appUrl}"
Icon=accessories-calculator
Terminal=false
Categories=Office;Finance;Accounting;
StartupNotify=true
`;
    triggerDownload(desktopContent, "Fast-Books.desktop", "application/x-desktop");
  };

  // 6. Download Local Node Server Runner
  const handleDownloadOfflineServerRunner = () => {
    const runnerContent = `@echo off
:: =========================================================================
:: Fast-Books PRO - Local Offline Server Quick-Start Script
:: Runs Fast-Books completely offline on localhost:3000
:: =========================================================================
title Fast-Books Offline Server
color 0A
echo.
echo ========================================================================
echo   Starting Fast-Books Local Desktop Server on localhost:3000...
echo ========================================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in your PATH.
    echo Please install Node.js from https://nodejs.org or use the Standalone HTML package.
    echo.
    pause
    exit /b 1
)

echo Starting server...
start http://localhost:3000
npm run dev || node dist/server.cjs || npx vite

pause
`;
    triggerDownload(runnerContent, "Run_FastBooks_Local_Server.bat", "text/plain");
  };

  // 7. Direct PWA Prompt
  const handlePromptPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      alert(
        "To install Fast-Books right now in Chrome / Edge:\n\nClick the 'Install Fast-Books' icon (computer monitor with down arrow) on the right side of the address bar, or click browser menu (⋮) > 'Save and share' > 'Install Fast-Books as app'."
      );
    }
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

  return (
    <div className="space-y-6 animate-fade-in">
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
            Licensed to <strong>{profile.ownerName}</strong> ({profile.tradingName || profile.companyName}). Download standalone offline single-file apps, complete installation ZIP packages, desktop executable launchers, PWA packages, and local database backup files directly to your PC.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadCompleteZipSuite}
            disabled={isGeneratingZip}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-extrabold text-xs sm:text-sm shadow-lg transition cursor-pointer flex items-center justify-center gap-2.5 whitespace-nowrap border border-emerald-400/40 shrink-0 active:scale-95"
          >
            {isGeneratingZip ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Building ZIP...</span>
              </>
            ) : (
              <>
                <FolderArchive className="w-5 h-5 text-emerald-200" />
                <span>Download Desktop ZIP Suite</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadOfflineHTMLBundle}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg transition cursor-pointer flex items-center justify-center gap-2.5 whitespace-nowrap border border-indigo-400/30 shrink-0"
          >
            <FileCode className="w-5 h-5 text-emerald-300" />
            <span>Offline HTML App</span>
          </button>
        </div>
      </div>

      {downloadedPackage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong>Installation Package Downloaded:</strong> <code className="bg-emerald-950/60 px-2 py-0.5 rounded text-emerald-200">{downloadedPackage}</code> was successfully generated and saved to your Downloads folder!
          </span>
        </div>
      )}

      {/* Standalone HTML App Hero Highlight */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-md text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Recommended 100% Offline Method</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Fast-Books All-in-One Standalone Single-File Desktop App
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Downloads a complete, self-contained HTML file bundling the Fast-Books accounting engine and all {invoices.length} invoices, {quotations.length} quotations, and {clients.length} clients currently recorded. Double-click to run on any computer offline with zero installation or internet connection.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={handleDownloadCompleteZipSuite}
              disabled={isGeneratingZip}
              className="px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-950/60 transition cursor-pointer flex items-center justify-center gap-2.5 border border-emerald-400/40 active:scale-95"
            >
              <FolderArchive className="w-5 h-5 text-emerald-200" />
              <span>Download Full ZIP (.zip)</span>
            </button>
            <button
              onClick={handleDownloadOfflineHTMLBundle}
              className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs sm:text-sm shadow-lg transition cursor-pointer flex items-center justify-center gap-2.5 border border-slate-600 active:scale-95"
            >
              <FileCode className="w-5 h-5 text-emerald-400" />
              <span>Single File (.html)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Installation Packages Download Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">Desktop Installer & Launcher Packages</h2>
              <p className="text-xs text-slate-500">Download system installers and launcher scripts tailored for {profile.ownerName}'s computer</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            OFFLINE READY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Complete ZIP Package */}
          <div className="p-5 rounded-2xl border border-emerald-300/80 bg-emerald-50/40 hover:bg-emerald-50/80 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Complete Suite (.zip)
                </span>
                <FolderArchive className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Full Offline ZIP Suite</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Complete package containing HTML app, Windows & Mac installers, Linux entry, and database snapshot.
              </p>
            </div>
            <button
              onClick={handleDownloadCompleteZipSuite}
              disabled={isGeneratingZip}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm border border-emerald-500/40"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP Suite</span>
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
              <Download className="w-4 h-4 text-sky-400" />
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

          {/* Linux Launcher */}
          <div className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Linux (.desktop)
                </span>
                <Terminal className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Linux Desktop Entry</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Standard Linux XDG desktop shortcut for Ubuntu, Debian, Fedora, and Arch distributions.
              </p>
            </div>
            <button
              onClick={handleDownloadLinuxLauncher}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm border border-slate-700"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download Linux Entry</span>
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
            <h2>Progressive Web App (PWA) Direct Browser Installation</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-700">
            <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                  Fast-Books is an offline-ready Progressive Web App (PWA). You can install it directly from your web browser as a native desktop program with taskbar integration and full offline functionality!
                </p>
                <button
                  onClick={handlePromptPWA}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Click Here to Install Fast-Books to Desktop
                </button>
              </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
            <span>Clients Directory CSV</span>
            <FileSpreadsheet className="w-4 h-4 text-sky-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
