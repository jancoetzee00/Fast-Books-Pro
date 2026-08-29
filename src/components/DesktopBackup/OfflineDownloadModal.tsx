import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  Monitor,
  HardDriveDownload,
  FileCode,
  Laptop,
  AppWindow,
  Terminal,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Layers,
  FileSpreadsheet,
  HelpCircle,
  Play,
  Share2,
  FolderArchive,
  Loader2,
  ArrowRight,
  Check,
} from "lucide-react";
import { BusinessProfile, Client, Quotation, Invoice, BankAccount, BankTransaction, Expense } from "../../types";
import { generateOfflineDesktopHTML } from "../../lib/offlineDesktopBundle";
import { generateOfflineInstallationZip } from "../../lib/offlineDesktopZip";
import { storage } from "../../lib/storage";

interface OfflineDownloadModalProps {
  profile: BusinessProfile;
  clients: Client[];
  quotations: Quotation[];
  invoices: Invoice[];
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  expenses: Expense[];
  onClose: () => void;
}

export const OfflineDownloadModal: React.FC<OfflineDownloadModalProps> = ({
  profile,
  clients,
  quotations,
  invoices,
  bankAccounts,
  bankTransactions,
  expenses,
  onClose,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [activeTab, setActiveTab] = useState<"zip" | "standalone" | "windows" | "mac" | "pwa" | "portable">("zip");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 6000);
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
      const zipBlob = await generateOfflineInstallationZip({
        profile,
        clients,
        quotations,
        invoices,
        bankAccounts,
        bankTransactions,
        expenses,
        sarsProfile,
        sarsFilings,
      });
      const filename = `FastBooks_Offline_Desktop_Suite_${profile.ownerName.replace(/\s+/g, "_")}.zip`;
      triggerBlobDownload(zipBlob, filename);
    } catch (err) {
      console.error("Failed to generate offline zip suite:", err);
      // Fallback to standalone HTML
      handleDownloadStandaloneHTML();
    } finally {
      setIsGeneratingZip(false);
    }
  };

  // 2. Standalone Single-File Offline HTML App
  const handleDownloadStandaloneHTML = () => {
    const sarsProfile = storage.getSarsProfile();
    const sarsFilings = storage.getSarsFilings();
    const htmlContent = generateOfflineDesktopHTML({
      profile,
      clients,
      quotations,
      invoices,
      bankAccounts,
      bankTransactions,
      expenses,
      sarsProfile,
      sarsFilings,
    });
    const filename = `FastBooks_Offline_App_${profile.ownerName.replace(/\s+/g, "_")}.html`;
    triggerDownload(htmlContent, filename, "text/html");
  };

  // 3. Windows Batch Desktop Shortcut Creator
  const handleDownloadWindowsInstaller = () => {
    const appUrl = window.location.href;
    const batContent = `@echo off
:: =========================================================================
:: Fast-Books PRO - Windows Desktop Application Launcher & Shortcut Creator
:: Proprietor: ${profile.ownerName} - ${profile.tradingName || profile.companyName}
:: =========================================================================
title Fast-Books Desktop Installer
color 0B
echo.
echo ========================================================================
echo   Installing Fast-Books PRO Desktop App for ${profile.ownerName}
echo ========================================================================
echo.

set APP_URL=${appUrl}
set SHORTCUT_NAME=Fast-Books Desktop
set DESKTOP_PATH=%USERPROFILE%\\Desktop\\%SHORTCUT_NAME%.url

echo [1/3] Creating Windows Desktop Shortcut...
(
echo [InternetShortcut]
echo URL=%APP_URL%
echo IconIndex=0
echo IconFile=%SystemRoot%\\System32\\SHELL32.dll,13
) > "%DESKTOP_PATH%"

echo.
echo [2/3] Verified Desktop shortcut location:
echo       %DESKTOP_PATH%
echo.
echo [3/3] Launching Fast-Books in Dedicated Desktop Window Mode...
echo.

start msedge --app="%APP_URL%" || start chrome --app="%APP_URL%" || start "%APP_URL%"

echo [SUCCESS] Fast-Books Desktop shortcut is ready on your Desktop!
echo You can now double-click "Fast-Books Desktop" on your Windows Desktop anytime.
echo.
pause
`;
    triggerDownload(batContent, `Install_FastBooks_Windows_${profile.ownerName.replace(/\s+/g, "_")}.bat`, "text/plain");
  };

  // 4. macOS Shell Launcher
  const handleDownloadMacLauncher = () => {
    const appUrl = window.location.href;
    const commandContent = `#!/bin/bash
# =========================================================================
# Fast-Books PRO - macOS Desktop App Launcher
# Proprietor: ${profile.ownerName} - ${profile.tradingName || profile.companyName}
# =========================================================================

echo "========================================================================"
echo "  Setting up Fast-Books Desktop App for macOS (${profile.ownerName})"
echo "========================================================================"
echo ""

APP_URL="${appUrl}"
DESKTOP_FILE="$HOME/Desktop/Fast-Books.command"

cat << 'EOF' > "$DESKTOP_FILE"
#!/bin/bash
open -a "Google Chrome" --args --app="${appUrl}" || open -a "Safari" "${appUrl}" || open "${appUrl}"
EOF

chmod +x "$DESKTOP_FILE"

echo "[SUCCESS] Created Desktop Launcher: $DESKTOP_FILE"
echo "Opening Fast-Books Desktop App now..."
open -a "Google Chrome" --args --app="$APP_URL" || open "$APP_URL"
`;
    triggerDownload(commandContent, `Install_FastBooks_macOS_${profile.ownerName.replace(/\s+/g, "_")}.command`, "text/x-shellscript");
  };

  // 5. Linux .desktop Launcher
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

  // 6. Portable Offline Node Server Quick Runner
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

  // PWA Prompt Trigger
  const handlePromptPWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } else {
      alert(
        "To install Fast-Books right now:\n\n1. In Chrome / Edge: Click the 'Install Fast-Books' icon (computer monitor) on the right side of the URL bar.\n2. Or click the 3 dots menu (⋮) > 'Save and share' > 'Install Fast-Books as app'."
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 border-b border-slate-800 text-white flex items-start justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 border border-indigo-400/40 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <HardDriveDownload className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Download Fast-Books for Offline Desktop Installation
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider">
                  Offline Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Installable on Windows, macOS, and Linux &bull; Proprietor: <strong>{profile.ownerName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification banner on download */}
        {downloadSuccess && (
          <div className="bg-emerald-950/80 border-b border-emerald-700/60 p-4 px-6 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>File Downloaded Successfully:</strong> <code>{downloadSuccess}</code> has been saved to your Downloads folder!
            </span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-6 py-2.5 flex space-x-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("zip")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "zip"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FolderArchive className="w-4 h-4 text-emerald-300" />
            <span>Complete ZIP Suite (All-In-One)</span>
          </button>

          <button
            onClick={() => setActiveTab("standalone")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "standalone"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>Standalone HTML App</span>
          </button>

          <button
            onClick={() => setActiveTab("windows")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "windows"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Laptop className="w-4 h-4 text-sky-400" />
            <span>Windows Desktop (.bat)</span>
          </button>

          <button
            onClick={() => setActiveTab("mac")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "mac"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <AppWindow className="w-4 h-4 text-purple-400" />
            <span>macOS & Linux</span>
          </button>

          <button
            onClick={() => setActiveTab("pwa")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "pwa"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Monitor className="w-4 h-4 text-emerald-400" />
            <span>Browser PWA App</span>
          </button>

          <button
            onClick={() => setActiveTab("portable")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "portable"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Database & Server</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm">
          {/* TAB 0: ALL-IN-ONE ZIP INSTALLATION SUITE */}
          {activeTab === "zip" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Complete 1-Click Desktop Installer Package</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Fast-Books Offline Desktop Installation Suite (.zip)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Downloads an all-in-one ZIP package containing the Standalone HTML Application, automated Windows installer scripts (.bat), macOS launcher (.command), Linux desktop entry, full database snapshot, and offline installation instructions.
                  </p>
                </div>

                <button
                  onClick={handleDownloadCompleteZipSuite}
                  disabled={isGeneratingZip}
                  className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/60 transition cursor-pointer flex items-center gap-3 shrink-0 active:scale-95 border border-emerald-400/50"
                >
                  {isGeneratingZip ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating ZIP Package...</span>
                    </>
                  ) : (
                    <>
                      <FolderArchive className="w-5 h-5 text-emerald-200" />
                      <span>Download Complete Suite (.zip)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  What is included in the ZIP download:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <FileCode className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">FastBooks_Offline_App.html</strong>
                      <span className="text-slate-400 text-[11px]">Standalone single-file app running 100% offline with full data.</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <Laptop className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Install_Windows.bat</strong>
                      <span className="text-slate-400 text-[11px]">1-click installer that places a desktop shortcut on Windows.</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <AppWindow className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Install_macOS.command</strong>
                      <span className="text-slate-400 text-[11px]">Terminal executable creating a Mac desktop app shortcut.</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <HardDriveDownload className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">FastBooks_Database_Backup.json</strong>
                      <span className="text-slate-400 text-[11px]">Complete portable database backup for easy restore.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: STANDALONE SINGLE-FILE HTML APP */}
          {activeTab === "standalone" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Single-File Standalone Executable Container</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    Fast-Books All-in-One Standalone HTML Application
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Double-click and run instantly in any web browser without needing internet, Node.js, or server installation. Contains the complete Fast-Books bookkeeping engine, quotations, 15% VAT invoicing, client database, and local persistence.
                  </p>
                </div>

                <button
                  onClick={handleDownloadStandaloneHTML}
                  className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-900/40 transition cursor-pointer flex items-center gap-3 shrink-0 active:scale-95 border border-emerald-400/40"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Standalone HTML App</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-emerald-400 font-bold text-xs mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> 100% Offline
                  </div>
                  <p className="text-xs text-slate-400">
                    Works with zero internet connection. Save to USB drives or local hard disks.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-indigo-400 font-bold text-xs mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Live State Bundled
                  </div>
                  <p className="text-xs text-slate-400">
                    Includes all {invoices.length} invoices, {quotations.length} quotes, and {clients.length} clients currently recorded.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-sky-400 font-bold text-xs mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Persistent LocalStorage
                  </div>
                  <p className="text-xs text-slate-400">
                    Creates and saves new quotes, invoices, and expenses continuously across sessions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WINDOWS DESKTOP INSTALLER */}
          {activeTab === "windows" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-950/60 to-slate-900 border border-sky-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                    <Laptop className="w-4 h-4" />
                    <span>Windows 10 & 11 Automated Installer</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    Windows Desktop Application Launcher (.bat)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Downloads an automated batch installer script that creates a native <strong>"Fast-Books Desktop"</strong> shortcut on your Windows desktop and launches it in dedicated app window mode (Microsoft Edge / Google Chrome).
                  </p>
                </div>

                <button
                  onClick={handleDownloadWindowsInstaller}
                  className="px-6 py-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm shadow-xl shadow-sky-900/40 transition cursor-pointer flex items-center gap-3 shrink-0 active:scale-95 border border-sky-400/40"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Windows Installer (.bat)</span>
                </button>
              </div>

              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  How to install on Windows:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-400">
                  <li>Click <strong>Download Windows Installer (.bat)</strong> above.</li>
                  <li>Go to your <strong>Downloads</strong> folder and double-click the <code>Install_FastBooks_Windows.bat</code> file.</li>
                  <li>A desktop shortcut named <strong>Fast-Books Desktop</strong> will be placed on your Windows Desktop automatically.</li>
                  <li>Double-click the desktop shortcut anytime to open Fast-Books as a full standalone window!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: macOS & LINUX */}
          {activeTab === "mac" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mac Launcher */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-700/50 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                      <AppWindow className="w-4 h-4" />
                      <span>macOS (Apple Silicon & Intel)</span>
                    </div>
                    <h3 className="text-base font-extrabold text-white">macOS Desktop Command (.command)</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Creates an executable terminal launcher on your Mac Desktop that opens Fast-Books in app mode with Google Chrome or Safari.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadMacLauncher}
                    className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 border border-purple-400/40"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download macOS Launcher</span>
                  </button>
                </div>

                {/* Linux Launcher */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-700/50 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <Terminal className="w-4 h-4" />
                      <span>Linux (Ubuntu, Debian, Fedora)</span>
                    </div>
                    <h3 className="text-base font-extrabold text-white">Linux Desktop Entry (.desktop)</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Standard Linux XDG desktop entry shortcut file that integrates Fast-Books into your application menu and dock.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadLinuxLauncher}
                    className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 border border-amber-400/40"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Linux Desktop Entry</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BROWSER PWA INSTALLATION */}
          {activeTab === "pwa" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Monitor className="w-4 h-4" />
                    <span>Native Progressive Web App (PWA)</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    Install Fast-Books Directly From Browser
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Fast-Books includes full PWA support with service-worker offline caching. You can install it directly into your OS with taskbar icon, push capabilities, and native performance.
                  </p>
                </div>

                <button
                  onClick={handlePromptPWAInstall}
                  className="px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-900/40 transition cursor-pointer flex items-center gap-3 shrink-0 active:scale-95 border border-indigo-400/40"
                >
                  <Monitor className="w-5 h-5" />
                  <span>Install App to Desktop</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Manual PWA Installation Steps:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <strong className="text-slate-200 block mb-1">Google Chrome / Edge:</strong>
                    Look for the <strong>"Install Fast-Books"</strong> icon on the right side of the address bar, or click Menu (⋮) &gt; "Save and share" &gt; "Install Fast-Books".
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <strong className="text-slate-200 block mb-1">Safari on Mac / iOS:</strong>
                    Click File &gt; "Add to Dock..." (on macOS Sonoma+) or Share &gt; "Add to Home Screen" on iPhone/iPad.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATABASE EXPORTS & SERVER RUNNER */}
          {activeTab === "portable" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Database Backup (.json) */}
                <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <HardDriveDownload className="w-4 h-4 text-emerald-400" />
                      <span>Full JSON Database Archive</span>
                    </div>
                    <h3 className="text-base font-extrabold text-white">Complete System Backup (.json)</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Download your complete database file containing all invoices, quotations, clients, bank transactions, expenses, and business profile settings.
                    </p>
                  </div>
                  <button
                    onClick={() => storage.exportBackupJSON()}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 border border-slate-600"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download Database (.json)</span>
                  </button>
                </div>

                {/* Local Node Server Runner */}
                <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <Terminal className="w-4 h-4" />
                      <span>Node.js Offline Desktop Server</span>
                    </div>
                    <h3 className="text-base font-extrabold text-white">Local Server Quick-Start (.bat)</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Batch script to boot the Fast-Books Express + Vite local development server on port 3000 on your local Windows PC.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadOfflineServerRunner}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 border border-slate-600"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Download Server Runner (.bat)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 sm:px-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Licensed to {profile.ownerName} &bull; Fast-Books Offline Architecture</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer border border-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
