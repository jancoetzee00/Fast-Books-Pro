import React, { useState } from "react";
import {
  Wrench,
  Truck,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Send,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Sliders,
  PlusCircle,
  ExternalLink,
  Code2,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  BusinessProfile,
  Client,
  Quotation,
  Invoice,
  Expense,
  GoogleAIAppConnection,
  GoogleAISyncEvent,
  ZAPartsIntegrationConfig,
} from "../../types";
import { storage, formatCurrency } from "../../lib/storage";

interface ZAPartsEcosystemProps {
  profile: BusinessProfile;
  clients: Client[];
  onAddInvoice: (invoice: Invoice) => void;
  onAddQuotation: (quotation: Quotation) => void;
  onAddExpense: (expense: Expense) => void;
  onAddClient: (client: Client) => void;
  onNavigateTab: (tab: string) => void;
  onLogSyncEvent: (source: string, action: any, summary: string, details?: any) => void;
}

export const ZAPartsEcosystem: React.FC<ZAPartsEcosystemProps> = ({
  profile,
  clients,
  onAddInvoice,
  onAddQuotation,
  onAddExpense,
  onAddClient,
  onNavigateTab,
  onLogSyncEvent,
}) => {
  const [config, setConfig] = useState<ZAPartsIntegrationConfig>(() => storage.getZAPartsConfig());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<"partssource" | "partsdrive" | "partsmart">("partssource");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Custom Simulator state
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [customPayload, setCustomPayload] = useState("");

  const originUrl = typeof window !== "undefined" ? window.location.origin : "https://ais-dev-x4r43f2p4v4tlxzqgiywh7-464680081273.europe-west3.run.app";

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveConfig = (updated: ZAPartsIntegrationConfig) => {
    setConfig(updated);
    storage.saveZAPartsConfig(updated);
  };

  // Pre-configured South African Auto Spares simulation datasets
  const partssourcePresets = [
    {
      title: "PO #8841: Toyota Hilux & Fortuner Brake & Filter Kit",
      supplier: "PartsSource ZA National Logistics Hub (Johannesburg)",
      orderNumber: "PO-PSZ-8841",
      notes: "Monthly workshop stock replenishment for commercial bakkies",
      items: [
        { description: "Brembo Front Brake Pads (Hilux GD-6)", quantity: 2, unitPrice: 1250 },
        { description: "GUD Z132 Spin-On Oil Filters", quantity: 6, unitPrice: 185 },
        { description: "GUD Fuel Filter Cartridges (Diesel)", quantity: 4, unitPrice: 320 },
        { description: "Castrol EDGE 5W-40 Synthetic 5L", quantity: 3, unitPrice: 780 },
      ],
    },
    {
      title: "PO #9102: Heavy Duty Suspension & Shocks",
      supplier: "PartsSource ZA Heavy Spares Hub (Pretoria)",
      orderNumber: "PO-PSZ-9102",
      notes: "Fleet maintenance suspension replacement batch",
      items: [
        { description: "Gabriel Gas-Rider Heavy Duty Front Struts", quantity: 2, unitPrice: 2150 },
        { description: "Gabriel Rear Gas Shock Absorbers", quantity: 2, unitPrice: 1450 },
        { description: "Polyurethane Bushing Kit (Complete)", quantity: 1, unitPrice: 1850 },
      ],
    },
  ];

  const partsdrivePresets = [
    {
      title: "Waybill #PDZ-7719: Urgent Garage Delivery to Pretoria North Auto",
      waybillNumber: "PDZ-7719",
      recipientName: "Pretoria North Auto Clinic",
      recipientEmail: "accounts@ptanorthauto.co.za",
      deliveryAddress: "Shop 4, Koedoespoort Industrial, Pretoria",
      deliveryFee: 350,
      partsDelivered: [
        { description: "Toyota Hilux 2.8 GD-6 HD Clutch Kit (Valeo)", quantity: 1, unitPrice: 4850 },
        { description: "Hydraulic Clutch Release Bearing", quantity: 1, unitPrice: 950 },
      ],
    },
    {
      title: "Waybill #PDZ-8304: Same-Day Dispatch to Randburg Fleet Services",
      waybillNumber: "PDZ-8304",
      recipientName: "Randburg Fleet Maintenance (Pty) Ltd",
      recipientEmail: "billing@randburgfleet.co.za",
      deliveryAddress: "12 Fabriek Street, Strydompark, Randburg",
      deliveryFee: 280,
      partsDelivered: [
        { description: "Bosch 120A Heavy Duty Alternator (Ford Ranger 3.2)", quantity: 2, unitPrice: 4200 },
        { description: "Serpentine Drive Belt & Tensioner Assembly", quantity: 2, unitPrice: 1350 },
      ],
    },
  ];

  const partsmartPresets = [
    {
      title: "Smart Quote: Ford Ranger 2.2 / 3.2 TDCi Major Overhaul Spares",
      quoteReference: "SMART-QTE-4401",
      clientName: "Highveld Freight & Transport Logistics",
      clientEmail: "maintenance@highveldfreight.co.za",
      vehicleDetails: "2021 Ford Ranger 3.2 TDCi 4x4 (VIN: AFAPXXMJ2P...)",
      markupPercentage: config.partsmart.defaultMarkupPercent || 25,
      partsList: [
        { partNumber: "TC-FOR-32", partName: "Timing Chain Master Kit with Guides", brand: "Dayco OEM", costPrice: 4200, quantity: 1 },
        { partNumber: "WP-FOR-88", partName: "High Flow Engine Water Pump", brand: "GMB", costPrice: 1650, quantity: 1 },
        { partNumber: "TR-FOR-02", partName: "Thermostat & Housing Assembly", brand: "Gates", costPrice: 850, quantity: 1 },
        { partNumber: "OF-GUD-41", partName: "Engine Service Filter Pack (Oil, Air, Fuel)", brand: "GUD", costPrice: 1100, quantity: 1 },
      ],
    },
    {
      title: "Smart Quote: VW Polo 1.4 TSI Turbo & Intercooler Assembly",
      quoteReference: "SMART-QTE-5520",
      clientName: "Centurion German Auto Specialists",
      clientEmail: "quotes@centurion-germanauto.co.za",
      vehicleDetails: "2019 VW Polo 1.4 TSI (VIN: WVWZZZ6RZK...)",
      markupPercentage: config.partsmart.defaultMarkupPercent || 25,
      partsList: [
        { partNumber: "TB-VAG-14", partName: "BorgWarner OEM Turbocharger Assembly", brand: "BorgWarner", costPrice: 9800, quantity: 1 },
        { partNumber: "IC-VAG-02", partName: "High-Efficiency Aluminum Intercooler", brand: "Nissens", costPrice: 3100, quantity: 1 },
        { partNumber: "GS-VAG-99", partName: "Complete Turbo Gasket & Fitting Kit", brand: "Elring", costPrice: 650, quantity: 1 },
      ],
    },
  ];

  // Simulator actions
  const handleSimulatePartsSource = async (preset: typeof partssourcePresets[0]) => {
    setIsProcessing(true);
    setSuccessToast(null);
    setErrorToast(null);

    try {
      const res = await fetch("/api/integrations/partssource-za/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preset),
      });
      const result = await res.json();

      if (result.structuredRecord) {
        const record = result.structuredRecord;
        const newExpense: Expense = {
          id: record.id || `exp_psz_${Date.now()}`,
          title: record.title,
          category: record.category || "Operating Expenses",
          vendor: record.vendor || "PartsSource ZA",
          date: record.date || new Date().toISOString().split("T")[0],
          amount: record.amount,
          taxAmount: record.taxAmount,
          isPaid: true,
          paymentMethod: "EFT",
          notes: record.notes,
        };

        onAddExpense(newExpense);
        onLogSyncEvent(
          "partssource-za",
          "parts_sync",
          `PartsSource ZA Order Ingested: ${newExpense.title} (${formatCurrency(newExpense.amount, profile.currencySymbol)})`,
          newExpense
        );

        setSuccessToast(`PartsSource ZA supplier PO #${preset.orderNumber} successfully ingested into Expenses! (${formatCurrency(newExpense.amount, profile.currencySymbol)})`);
      }
    } catch (err: any) {
      setErrorToast(`Failed to sync from PartsSource ZA: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePartsDrive = async (preset: typeof partsdrivePresets[0]) => {
    setIsProcessing(true);
    setSuccessToast(null);
    setErrorToast(null);

    try {
      const res = await fetch("/api/integrations/parts-drive-za/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preset),
      });
      const result = await res.json();

      if (result.structuredRecord) {
        const record = result.structuredRecord;
        const newInvoice: Invoice = {
          id: record.id || `inv_pdz_${Date.now()}`,
          invoiceNumber: record.invoiceNumber || `INV-PDZ-${Math.floor(100 + Math.random() * 900)}`,
          clientId: `cli_pdz_${Date.now()}`,
          clientName: record.clientName,
          clientEmail: record.clientEmail,
          date: record.date,
          dueDate: record.dueDate,
          items: record.items,
          subtotal: record.subtotal,
          taxTotal: record.taxTotal,
          grandTotal: record.grandTotal,
          paidAmount: 0,
          status: "issued",
          payments: [],
          notes: record.notes,
          terms: profile.invoiceTerms,
          createdAt: new Date().toISOString(),
        };

        onAddInvoice(newInvoice);
        onLogSyncEvent(
          "parts-drive-za",
          "parts_sync",
          `Parts-Drive ZA Delivery Invoice Generated: ${newInvoice.invoiceNumber} for ${newInvoice.clientName} (${formatCurrency(newInvoice.grandTotal, profile.currencySymbol)})`,
          newInvoice
        );

        setSuccessToast(`Parts-Drive ZA delivery note #${preset.waybillNumber} billed! Invoice ${newInvoice.invoiceNumber} created for ${newInvoice.clientName} (${formatCurrency(newInvoice.grandTotal, profile.currencySymbol)})`);
      }
    } catch (err: any) {
      setErrorToast(`Failed to sync from Parts-Drive ZA: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePartSmart = async (preset: typeof partsmartPresets[0]) => {
    setIsProcessing(true);
    setSuccessToast(null);
    setErrorToast(null);

    try {
      const res = await fetch("/api/integrations/part-smart-za/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preset),
      });
      const result = await res.json();

      if (result.structuredRecord) {
        const record = result.structuredRecord;
        const newQuote: Quotation = {
          id: record.id || `qte_psm_${Date.now()}`,
          quoteNumber: record.quoteNumber || `QTE-PSM-${Math.floor(100 + Math.random() * 900)}`,
          clientId: `cli_psm_${Date.now()}`,
          clientName: record.clientName,
          clientEmail: record.clientEmail,
          date: record.date,
          expiryDate: record.expiryDate,
          items: record.items,
          subtotal: record.subtotal,
          taxTotal: record.taxTotal,
          discountTotal: 0,
          grandTotal: record.grandTotal,
          status: "sent",
          notes: record.notes,
          terms: profile.quotationNotes,
          createdAt: new Date().toISOString(),
        };

        onAddQuotation(newQuote);
        onLogSyncEvent(
          "part-smart-za",
          "parts_sync",
          `Part-Smart ZA Smart Quote Generated: ${newQuote.quoteNumber} for ${newQuote.clientName} (${formatCurrency(newQuote.grandTotal, profile.currencySymbol)})`,
          newQuote
        );

        setSuccessToast(`Part-Smart ZA estimation completed! Quotation ${newQuote.quoteNumber} saved with ${preset.markupPercentage}% profit margin applied (${formatCurrency(newQuote.grandTotal, profile.currencySymbol)})`);
      }
    } catch (err: any) {
      setErrorToast(`Failed to sync from Part-Smart ZA: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Ecosystem Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
                <Wrench className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                South African Auto Parts Ecosystem Bridge
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  3 PLATFORMS CONNECTED
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Native accounting pipeline paired with <strong>partssource-za</strong> (auto parts supplier orders), <strong>parts-drive-za</strong> (workshop deliveries & dispatch billing), and <strong>part-smart-za</strong> (intelligent parts catalogue & quote estimation).
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-mono text-indigo-200">
            <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700">
              Tax: <strong>15% SA VAT</strong>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700">
              Currency: <strong>ZAR (R)</strong>
            </div>
          </div>
        </div>

        {/* 3 Platforms Quick Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: partssource-za */}
          <div
            onClick={() => setActivePlatform("partssource")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activePlatform === "partssource"
                ? "bg-indigo-900/50 border-indigo-400 shadow-md ring-1 ring-indigo-400/40"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SUPPLIER & PO RECON
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <h3 className="font-bold text-sm text-white mt-2">partssource-za</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Automated PO & spare parts supplier bills ingestion into Fast-Books Expenses.
            </p>
          </div>

          {/* Card 2: parts-drive-za */}
          <div
            onClick={() => setActivePlatform("partsdrive")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activePlatform === "partsdrive"
                ? "bg-indigo-900/50 border-indigo-400 shadow-md ring-1 ring-indigo-400/40"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                LOGISTICS & DISPATCH
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <h3 className="font-bold text-sm text-white mt-2">parts-drive-za</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Workshop courier dispatches, delivery fees & waybill customer billing.
            </p>
          </div>

          {/* Card 3: part-smart-za */}
          <div
            onClick={() => setActivePlatform("partsmart")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activePlatform === "partsmart"
                ? "bg-indigo-900/50 border-indigo-400 shadow-md ring-1 ring-indigo-400/40"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                CATALOG & VIN QUOTES
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <h3 className="font-bold text-sm text-white mt-2">part-smart-za</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              VIN decoded parts catalogue, live trade pricing & margin calculator.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => {
              if (activePlatform === "partssource") onNavigateTab("expenses");
              else if (activePlatform === "partsdrive") onNavigateTab("invoices");
              else onNavigateTab("quotations");
            }}
            className="text-xs underline text-emerald-950 font-bold ml-2 cursor-pointer whitespace-nowrap"
          >
            View Record &rarr;
          </button>
        </div>
      )}

      {errorToast && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* PLATFORM 1 DETAIL: partssource-za */}
      {activePlatform === "partssource" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Config & Connection Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">partssource-za Gateway</h3>
                    <span className="text-[11px] text-slate-500">Auto Parts Sourcing & Supplier Bills</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                  ACTIVE
                </span>
              </div>

              {/* Endpoint URL */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Live Webhook Endpoint:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={`${originUrl}/api/integrations/partssource-za/sync`}
                    className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                  />
                  <button
                    onClick={() => handleCopy(`${originUrl}/api/integrations/partssource-za/sync`, "psz_ep")}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    {copiedField === "psz_ep" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Token */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Integration API Key:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={config.partssource.apiKey}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        partssource: { ...config.partssource, apiKey: e.target.value },
                      };
                      handleSaveConfig(updated);
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                  />
                  <button
                    onClick={() => handleCopy(config.partssource.apiKey, "psz_key")}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    {copiedField === "psz_key" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Default Supplier */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Default Supplier Hub:</label>
                <input
                  type="text"
                  value={config.partssource.defaultSupplier}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      partssource: { ...config.partssource, defaultSupplier: e.target.value },
                    };
                    handleSaveConfig(updated);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              {/* Toggle Auto Import */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Auto-Convert POs to Expenses</span>
                  <span className="text-[11px] text-slate-500">Automatically post received orders into ledger</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.partssource.autoImportExpenses}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      partssource: { ...config.partssource, autoImportExpenses: e.target.checked },
                    };
                    handleSaveConfig(updated);
                  }}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Live Simulation & Ingest Panel */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Live Order Ingestion Simulator (partssource-za)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate incoming supplier purchase orders from PartsSource ZA to test live ledger entry.
                </p>
              </div>

              <div className="space-y-3">
                {partssourcePresets.map((preset, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <strong className="text-xs sm:text-sm font-bold text-slate-900 block">{preset.title}</strong>
                        <span className="text-[11px] text-slate-500">Supplier: {preset.supplier}</span>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-100 text-amber-900 rounded">
                        {preset.orderNumber}
                      </span>
                    </div>

                    <div className="bg-white rounded-lg p-2.5 border border-slate-200/80 space-y-1">
                      {preset.items.map((it, i) => (
                        <div key={i} className="flex justify-between text-[11px]">
                          <span className="text-slate-700">{it.quantity}x {it.description}</span>
                          <strong className="text-slate-900">{formatCurrency(it.unitPrice * it.quantity, profile.currencySymbol)}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-slate-700">
                        Total: {formatCurrency(preset.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0), profile.currencySymbol)}
                      </span>
                      <button
                        onClick={() => handleSimulatePartsSource(preset)}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                        <span>Ingest PO as Expense</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PLATFORM 2 DETAIL: parts-drive-za */}
      {activePlatform === "partsdrive" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Config Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-sky-50 text-sky-700">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">parts-drive-za Gateway</h3>
                    <span className="text-[11px] text-slate-500">Workshop Deliveries & Waybill Billing</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                  ACTIVE
                </span>
              </div>

              {/* Endpoint URL */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Live Webhook Endpoint:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={`${originUrl}/api/integrations/parts-drive-za/sync`}
                    className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                  />
                  <button
                    onClick={() => handleCopy(`${originUrl}/api/integrations/parts-drive-za/sync`, "pdz_ep")}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    {copiedField === "pdz_ep" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Token */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Integration API Key:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={config.partsdrive.apiKey}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        partsdrive: { ...config.partsdrive, apiKey: e.target.value },
                      };
                      handleSaveConfig(updated);
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                  />
                  <button
                    onClick={() => handleCopy(config.partsdrive.apiKey, "pdz_key")}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    {copiedField === "pdz_key" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Dispatch rate */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Standard Delivery Rate per Km (ZAR):</label>
                <input
                  type="number"
                  value={config.partsdrive.dispatchRatePerKm}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      partsdrive: { ...config.partsdrive, dispatchRatePerKm: Number(e.target.value) || 18.5 },
                    };
                    handleSaveConfig(updated);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              {/* Toggle Auto Invoicing */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Auto-Bill Dispatches as Invoices</span>
                  <span className="text-[11px] text-slate-500">Automatically create client invoices on delivery</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.partsdrive.autoCreateDeliveryInvoices}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      partsdrive: { ...config.partsdrive, autoCreateDeliveryInvoices: e.target.checked },
                    };
                    handleSaveConfig(updated);
                  }}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Live Simulation */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-600" />
                  Live Dispatch Ingestion Simulator (parts-drive-za)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate workshop delivery waybills received from Parts-Drive ZA to create customer invoices.
                </p>
              </div>

              <div className="space-y-3">
                {partsdrivePresets.map((preset, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <strong className="text-xs sm:text-sm font-bold text-slate-900 block">{preset.title}</strong>
                        <span className="text-[11px] text-slate-500">Recipient: {preset.recipientName} • {preset.deliveryAddress}</span>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-sky-100 text-sky-900 rounded">
                        {preset.waybillNumber}
                      </span>
                    </div>

                    <div className="bg-white rounded-lg p-2.5 border border-slate-200/80 space-y-1">
                      {preset.partsDelivered.map((it, i) => (
                        <div key={i} className="flex justify-between text-[11px]">
                          <span className="text-slate-700">{it.quantity}x {it.description}</span>
                          <strong className="text-slate-900">{formatCurrency(it.unitPrice * it.quantity, profile.currencySymbol)}</strong>
                        </div>
                      ))}
                      <div className="flex justify-between text-[11px] pt-1 border-t border-slate-100 text-sky-700">
                        <span>Courier Delivery & Logistics Fee:</span>
                        <strong>{formatCurrency(preset.deliveryFee, profile.currencySymbol)}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-slate-700">
                        Total (Excl VAT): {formatCurrency(preset.partsDelivered.reduce((s, it) => s + it.unitPrice * it.quantity, 0) + preset.deliveryFee, profile.currencySymbol)}
                      </span>
                      <button
                        onClick={() => handleSimulatePartsDrive(preset)}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                        <span>Create Client Invoice</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PLATFORM 3 DETAIL: part-smart-za */}
      {activePlatform === "partsmart" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Config Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">part-smart-za Gateway</h3>
                    <span className="text-[11px] text-slate-500">Smart Parts Catalog & VIN Quotations</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                  ACTIVE
                </span>
              </div>

              {/* Endpoint URL */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Live Webhook Endpoint:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={`${originUrl}/api/integrations/part-smart-za/sync`}
                    className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                  />
                  <button
                    onClick={() => handleCopy(`${originUrl}/api/integrations/part-smart-za/sync`, "psm_ep")}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    {copiedField === "psm_ep" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Token */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Integration API Key:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={config.partsmart.apiKey}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        partsmart: { ...config.partsmart, apiKey: e.target.value },
                      };
                      handleSaveConfig(updated);
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                  />
                  <button
                    onClick={() => handleCopy(config.partsmart.apiKey, "psm_key")}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    {copiedField === "psm_key" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Markup slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-semibold text-slate-600 uppercase">Default Profit Markup Margin:</label>
                  <strong className="text-xs text-indigo-700 font-bold">{config.partsmart.defaultMarkupPercent}%</strong>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={config.partsmart.defaultMarkupPercent}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      partsmart: { ...config.partsmart, defaultMarkupPercent: Number(e.target.value) },
                    };
                    handleSaveConfig(updated);
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Toggle Auto Quotation */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Auto-Sync Catalog Estimates</span>
                  <span className="text-[11px] text-slate-500">Instantly save smart estimations into Quotations</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.partsmart.autoSyncCatalogQuotes}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      partsmart: { ...config.partsmart, autoSyncCatalogQuotes: e.target.checked },
                    };
                    handleSaveConfig(updated);
                  }}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Live Simulation */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Smart Quotation Ingestion Simulator (part-smart-za)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate instant client quotes with automated margin calculation and VIN parts catalog lookups.
                </p>
              </div>

              <div className="space-y-3">
                {partsmartPresets.map((preset, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <strong className="text-xs sm:text-sm font-bold text-slate-900 block">{preset.title}</strong>
                        <span className="text-[11px] text-slate-500">Client: {preset.clientName} • {preset.vehicleDetails}</span>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 rounded">
                        +{config.partsmart.defaultMarkupPercent}% MARKUP
                      </span>
                    </div>

                    <div className="bg-white rounded-lg p-2.5 border border-slate-200/80 space-y-1">
                      {preset.partsList.map((it, i) => {
                        const priceWithMarkup = Math.round(it.costPrice * (1 + (config.partsmart.defaultMarkupPercent || 25) / 100));
                        return (
                          <div key={i} className="flex justify-between text-[11px]">
                            <span className="text-slate-700">
                              <span className="font-mono text-slate-500">[{it.partNumber}]</span> {it.quantity}x {it.partName} ({it.brand})
                            </span>
                            <strong className="text-slate-900">{formatCurrency(priceWithMarkup * it.quantity, profile.currencySymbol)}</strong>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-slate-700">
                        Est. Quote Total (Excl VAT):{" "}
                        {formatCurrency(
                          preset.partsList.reduce((s, it) => s + Math.round(it.costPrice * (1 + (config.partsmart.defaultMarkupPercent || 25) / 100)) * it.quantity, 0),
                          profile.currencySymbol
                        )}
                      </span>
                      <button
                        onClick={() => handleSimulatePartSmart(preset)}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                        <span>Generate & Save Quotation</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
