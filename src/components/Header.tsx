import React from "react";
import {
  BookOpen,
  ShieldCheck,
  Download,
  Building2,
  Landmark,
  Settings,
  Sparkles,
  Monitor,
  HardDriveDownload,
} from "lucide-react";
import { BusinessProfile } from "../types";
import { storage } from "../lib/storage";

interface HeaderProps {
  profile: BusinessProfile;
  onOpenSettings: () => void;
  onNavigate: (tab: string) => void;
  onOpenOfflineModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenSettings,
  onNavigate,
  onOpenOfflineModal,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Application Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  {profile.tradingName || profile.companyName || "Fast-Books"}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
                <span className="text-slate-300 font-semibold">{profile.companyName}</span>
                <span className="text-slate-500">•</span>
                <span>Owner: <strong className="text-slate-200 font-semibold">{profile.ownerName}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Info & Action Bar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Offline Desktop Download Button */}
            <button
              onClick={onOpenOfflineModal ? onOpenOfflineModal : () => onNavigate("backup")}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer border border-emerald-400/40 animate-pulse-slow"
              title="Download Fast-Books for Offline Desktop Use (.html, .bat, .command, PWA)"
            >
              <HardDriveDownload className="w-3.5 h-3.5 text-emerald-200" />
              <span className="hidden sm:inline">Offline Desktop App</span>
              <span className="sm:hidden">Offline</span>
            </button>

            {/* Google AI Studio Bridge Status */}
            <button
              onClick={() => onNavigate("google-ai")}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-xs font-semibold text-indigo-300 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Google AI Studio Cross-App Accounting Hub"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Google AI Hub</span>
            </button>

            {/* Currency Indicator */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80 text-xs text-slate-300 shadow-inner">
              <span className="text-slate-400 font-medium">Currency:</span>
              <span className="font-bold text-emerald-400">
                {profile.currency} ({profile.currencySymbol})
              </span>
            </div>

            {/* Bank Sync Status */}
            <button
              onClick={() => onNavigate("bank-recon")}
              className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/70 text-xs font-medium text-emerald-300 hover:bg-emerald-900/60 transition-all cursor-pointer shadow-sm hover:border-emerald-700"
              title="Click to view bank feeds & reconciliation"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Landmark className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bank Feeds Active</span>
            </button>

            {/* Download Local Backup */}
            <button
              onClick={() => storage.exportBackupJSON()}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 font-medium text-xs shadow-sm hover:shadow transition-all cursor-pointer border border-slate-700"
              title="Export complete database JSON to local disk"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Backup JSON</span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer shadow-sm"
              title="Business & Ownership Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
