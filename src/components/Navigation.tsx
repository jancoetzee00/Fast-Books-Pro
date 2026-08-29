import React from "react";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Landmark,
  CreditCard,
  Users,
  BarChart3,
  HardDriveDownload,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  unreconciledCount: number;
  unpaidInvoicesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  unreconciledCount,
  unpaidInvoicesCount,
}) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      id: "google-ai",
      label: "Google AI Hub",
      icon: Sparkles,
      badge: "Bridge",
      badgeColor: "bg-emerald-500 text-slate-950 font-bold",
    },
    {
      id: "sars-vat",
      label: "SARS & Monthly VAT",
      icon: ShieldCheck,
      badge: "15% VAT",
      badgeColor: "bg-amber-400 text-slate-950 font-bold",
    },
    { id: "quotations", label: "Quotations", icon: FileText },
    {
      id: "invoices",
      label: "Invoices",
      icon: Receipt,
      badge: unpaidInvoicesCount > 0 ? String(unpaidInvoicesCount) : undefined,
      badgeColor: "bg-amber-500 text-slate-950",
    },
    {
      id: "bank-recon",
      label: "Bank Recon",
      icon: Landmark,
      badge: unreconciledCount > 0 ? String(unreconciledCount) : undefined,
      badgeColor: "bg-emerald-500 text-slate-950",
    },
    { id: "expenses", label: "Expenses", icon: CreditCard },
    { id: "clients", label: "Clients", icon: Users },
    { id: "reports", label: "Financial Reports", icon: BarChart3 },
    {
      id: "backup",
      label: "Desktop & Offline",
      icon: HardDriveDownload,
      badge: "Offline",
      badgeColor: "bg-emerald-400 text-slate-950 font-bold",
    },
  ];

  return (
    <nav className="bg-slate-900/95 border-b border-slate-800 text-slate-300 backdrop-blur-sm sticky top-16 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto scrollbar-none py-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white font-semibold shadow-sm ring-1 ring-indigo-400/30"
                    : "hover:bg-slate-800/80 text-slate-300 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                      isActive ? "bg-white text-indigo-900" : tab.badgeColor
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
