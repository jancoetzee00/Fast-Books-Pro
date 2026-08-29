import React, { useState } from "react";
import {
  X,
  Cloud,
  CloudCheck,
  CloudUpload,
  RefreshCw,
  LogIn,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  Smartphone,
  Laptop,
  Lock,
} from "lucide-react";
import { User } from "firebase/auth";
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
} from "../../types";
import {
  loginWithGoogle,
  logoutUser,
  uploadAllLocalDataToCloud,
} from "../../lib/firebase";
import { storage } from "../../lib/storage";

interface CloudSyncModalProps {
  user: User | null;
  profile: BusinessProfile;
  clients: Client[];
  quotations: Quotation[];
  invoices: Invoice[];
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  expenses: Expense[];
  onClose: () => void;
  onReloadState: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  user,
  profile,
  clients,
  quotations,
  invoices,
  bankAccounts,
  bankTransactions,
  expenses,
  onClose,
  onReloadState,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setSyncError(null);
      await loginWithGoogle();
      setSyncSuccess("Signed in successfully with Google!");
      setTimeout(() => setSyncSuccess(null), 4000);
    } catch (err: any) {
      console.error(err);
      setSyncError(err?.message || "Failed to sign in with Google.");
    }
  };

  const handleSignOut = async () => {
    try {
      setSyncError(null);
      await logoutUser();
      setSyncSuccess("Signed out of Firebase.");
      setTimeout(() => setSyncSuccess(null), 4000);
    } catch (err: any) {
      console.error(err);
      setSyncError(err?.message || "Failed to sign out.");
    }
  };

  const handleBulkUpload = async () => {
    if (!user) return;
    try {
      setIsSyncing(true);
      setSyncError(null);
      const sarsProfile = storage.getSarsProfile();
      const sarsFilings = storage.getSarsFilings();

      await uploadAllLocalDataToCloud(user.uid, {
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

      setSyncSuccess("All local data successfully synced to Firebase Cloud Firestore!");
      setTimeout(() => setSyncSuccess(null), 5000);
    } catch (err: any) {
      console.error(err);
      setSyncError(err?.message || "Failed to upload data to cloud.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
                <span>Firebase Cloud Database & Sync</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                  FIRESTORE LIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Google Cloud Firestore persistent multi-device storage & backup
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

        {/* Content */}
        <div className="p-6 space-y-6 text-xs sm:text-sm text-slate-700">
          {/* User Account Status */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-12 h-12 rounded-full ring-2 ring-indigo-500/30 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-lg shrink-0">
                  {user?.email ? user.email.charAt(0).toUpperCase() : "G"}
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {user ? user.displayName || user.email : "Not Signed In to Cloud"}
                  </span>
                  {user && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Connected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {user
                    ? `UID: ${user.uid.slice(0, 16)}... • ${user.email}`
                    : "Sign in with your Google account to enable live multi-device sync"}
                </p>
              </div>
            </div>

            {user ? (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-rose-600 font-bold text-xs border border-slate-300 transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 shrink-0 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>

          {/* Feedback messages */}
          {syncSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncSuccess}</span>
            </div>
          )}

          {syncError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{syncError}</span>
            </div>
          )}

          {/* Sync Stats & Bulk Action */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase">
                <Database className="w-4 h-4" />
                <span>Firestore Live Sync Summary</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                DATABASE ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-lg font-black text-white">{invoices.length}</div>
                <div className="text-[10px] text-slate-400 font-medium">Invoices</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-lg font-black text-white">{quotations.length}</div>
                <div className="text-[10px] text-slate-400 font-medium">Quotations</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-lg font-black text-white">{clients.length}</div>
                <div className="text-[10px] text-slate-400 font-medium">Clients</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-lg font-black text-white">{expenses.length}</div>
                <div className="text-[10px] text-slate-400 font-medium">Expenses</div>
              </div>
            </div>

            {user ? (
              <button
                onClick={handleBulkUpload}
                disabled={isSyncing}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-950/50 border border-emerald-400/40 active:scale-98"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Syncing Records to Firestore...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4 text-emerald-200" />
                    <span>Upload All Local Data to Firebase Cloud</span>
                  </>
                )}
              </button>
            ) : (
              <p className="text-xs text-slate-400 text-center">
                Sign in with Google above to sync all records to your personal cloud database.
              </p>
            )}
          </div>

          {/* Benefits Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-bold">Multi-Device Access</strong>
                <span className="text-slate-600">Access your invoices, quotes, and bank statements seamlessly from laptop, phone, or tablet.</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-bold">Zero-Loss Cloud Backup</strong>
                <span className="text-slate-600">Protected by hardened Firebase Firestore ABAC security rules and automatic server timestamps.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Project ID: <code className="text-slate-700 font-mono">gen-lang-client-0532976720</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
