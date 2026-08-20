import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Layers,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Send,
  RefreshCw,
  Terminal,
  FileCode2,
  ShieldCheck,
  Activity,
  PlusCircle,
  HelpCircle,
  Receipt,
  FileText,
  CreditCard,
  Users,
  AlertCircle,
  Zap,
  ArrowUpRight,
  ExternalLink,
  Code2,
  Wrench,
  Truck,
} from "lucide-react";
import {
  BusinessProfile,
  Client,
  Quotation,
  Invoice,
  Expense,
  GoogleAIAppConnection,
  GoogleAISyncEvent,
} from "../../types";
import { storage, formatCurrency } from "../../lib/storage";
import { ZAPartsEcosystem } from "./ZAPartsEcosystem";

interface GoogleAIHubProps {
  profile: BusinessProfile;
  clients: Client[];
  quotations: Quotation[];
  invoices: Invoice[];
  expenses: Expense[];
  onAddInvoice: (invoice: Invoice) => void;
  onAddQuotation: (quotation: Quotation) => void;
  onAddExpense: (expense: Expense) => void;
  onAddClient: (client: Client) => void;
  onNavigateTab: (tab: string) => void;
}

export const GoogleAIHub: React.FC<GoogleAIHubProps> = ({
  profile,
  clients,
  quotations,
  invoices,
  expenses,
  onAddInvoice,
  onAddQuotation,
  onAddExpense,
  onAddClient,
  onNavigateTab,
}) => {
  // Tabs inside Hub
  const [activeSubTab, setActiveSubTab] = useState<"ingest" | "za-parts" | "endpoints" | "query" | "connections" | "activity">("za-parts");

  // Connection status state
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Ingest / Parser state
  const [ingestInput, setIngestInput] = useState("");
  const [sourceAppName, setSourceAppName] = useState("Google AI Studio Sales Agent");
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importedNotification, setImportedNotification] = useState<string | null>(null);

  // Financial Query state
  const [queryInput, setQueryInput] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryAnswer, setQueryAnswer] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState<{ q: string; a: string; time: string }[]>([]);

  // Webhook Tester state
  const [selectedPreset, setSelectedPreset] = useState<string>("partssource_po");
  const [testPayloadText, setTestPayloadText] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // Connections and events from storage
  const [connections, setConnections] = useState<GoogleAIAppConnection[]>(() => storage.getAIConnections());
  const [syncEvents, setSyncEvents] = useState<GoogleAISyncEvent[]>(() => storage.getAISyncEvents());

  // Ping backend status on load
  const pingStatus = async () => {
    setIsPinging(true);
    try {
      const res = await fetch("/api/google-ai/status");
      const data = await res.json();
      setServerStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    pingStatus();
  }, []);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Sample prompt chips for easy 1-click test
  const samplePrompts = [
    {
      label: "partssource-za: Supplier PO",
      text: `Supplier invoice received from PartsSource ZA Hub. Order PO-PSZ-9941. Items: 4x Brembo Front Brake Pads (Hilux GD-6) at R1,250 each, 6x GUD Oil Filters at R185 each. Total R6,110.00. Tax 15%. Paid via EFT. Category: Operating Expenses.`,
    },
    {
      label: "parts-drive-za: Courier Dispatch",
      text: `Dispatch Waybill #PDZ-4412 delivered to "Pretoria North Auto Clinic" (email: accounts@ptanorthauto.co.za). Billed 1x Toyota Hilux Clutch Kit at R4,850 and Delivery Express Fee R350. Tax 15%. Send invoice due in 14 days.`,
    },
    {
      label: "part-smart-za: Smart VIN Quote",
      text: `Smart Quote requested for client "Highveld Transport" (email: fleet@highveldfreight.co.za). Vehicle: 2021 Ford Ranger 3.2 TDCi. Items: 1x Timing Chain Master Kit at R5,250 and 1x Water Pump at R2,060. Total markup 25% applied. Tax 15%. Valid for 30 days.`,
    },
    {
      label: "Invoice from AI Sales Bot",
      text: `Client "Vanguard Security Solutions" approved 4x Gate Automation Controllers at R3,850 each and 8 hours on-site installation at R650/hr. Tax 15%. Send invoice to accounts@vanguardsecurity.co.za due in 14 days. Notes: Q3 security upgrade project.`,
    },
    {
      label: "Receipt from AI Document Scanner",
      text: `Receipt scanned from Makro Centurion. Vendor: Makro SA. Title: Office Supplies & HP Toner Cartridges. Date: 2026-08-14. Amount: R2,450.00. Tax Amount: R319.57. Payment method: Credit Card. Category: Office Supplies.`,
    },
    {
      label: "New Client Profile from AI CRM",
      text: `New client onboarded: Horizon Digital Studio (Pty) Ltd. Contact: Sarah Jenkins. Email: accounts@horizondigital.co.za. Phone: +27 11 889 0021. Address: 14 Melrose Boulevard, Rosebank, 2196. Tax Number: VAT-4920194821.`,
    },
  ];


  // Ingest handler
  const handleRunIngest = async () => {
    if (!ingestInput.trim()) return;
    setIsParsing(true);
    setParseError(null);
    setParseResult(null);
    setImportedNotification(null);

    try {
      const response = await fetch("/api/google-ai/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawContent: ingestInput,
          sourceApp: sourceAppName,
          context: {
            currency: profile.currency,
            defaultTaxRate: profile.defaultTaxRate,
            existingClients: clients.map((c) => c.name),
          },
        }),
      });

      const data = await response.json();
      if (data.error) {
        setParseError(data.error);
      } else {
        setParseResult(data.parsed || data);
      }
    } catch (err: any) {
      setParseError(err.message || "Failed to communicate with Google AI bridge");
    } finally {
      setIsParsing(false);
    }
  };

  // Convert parsed result into live app record
  const handleCommitParsedEntity = () => {
    if (!parseResult || !parseResult.data) return;

    const { entityType, data, summary } = parseResult;
    const now = new Date().toISOString().split("T")[0];

    if (entityType === "invoice") {
      const lineItems = (data.items || []).map((it: any, idx: number) => {
        const qty = Number(it.quantity) || 1;
        const price = Number(it.unitPrice) || 0;
        const tax = Number(it.taxRate) || profile.defaultTaxRate;
        const disc = Number(it.discount) || 0;
        const sub = qty * price * (1 - disc / 100);
        const tot = sub * (1 + tax / 100);
        return {
          id: `li_${Date.now()}_${idx}`,
          description: it.description || "Service item",
          quantity: qty,
          unitPrice: price,
          taxRate: tax,
          discount: disc,
          total: tot,
        };
      });

      const subtotal = lineItems.reduce((sum: number, it: any) => sum + it.quantity * it.unitPrice, 0);
      const taxTotal = lineItems.reduce((sum: number, it: any) => sum + (it.total - it.quantity * it.unitPrice), 0);
      const grandTotal = subtotal + taxTotal;

      const newInvoice: Invoice = {
        id: `inv_${Date.now()}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        clientId: `cli_ai_${Date.now()}`,
        clientName: data.clientName || "Client via Google AI",
        clientEmail: data.clientEmail || "",
        date: data.date || now,
        dueDate: data.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        items: lineItems.length > 0 ? lineItems : [
          {
            id: `li_${Date.now()}`,
            description: "Services rendered",
            quantity: 1,
            unitPrice: 1000,
            taxRate: 15,
            discount: 0,
            total: 1150,
          },
        ],
        subtotal,
        taxTotal,
        grandTotal,
        paidAmount: 0,
        status: "issued",
        payments: [],
        notes: data.notes || `Generated via Google AI Bridge (${sourceAppName})`,
        terms: profile.invoiceTerms,
        createdAt: new Date().toISOString(),
      };

      onAddInvoice(newInvoice);
      logSyncEvent("create_invoice", `Created Invoice ${newInvoice.invoiceNumber} for ${newInvoice.clientName} (${formatCurrency(newInvoice.grandTotal, profile.currencySymbol)})`, newInvoice);
      setImportedNotification(`Invoice ${newInvoice.invoiceNumber} created and saved successfully!`);
    } else if (entityType === "quotation") {
      const lineItems = (data.items || []).map((it: any, idx: number) => {
        const qty = Number(it.quantity) || 1;
        const price = Number(it.unitPrice) || 0;
        const tax = Number(it.taxRate) || profile.defaultTaxRate;
        const disc = Number(it.discount) || 0;
        const sub = qty * price * (1 - disc / 100);
        const tot = sub * (1 + tax / 100);
        return {
          id: `li_${Date.now()}_${idx}`,
          description: it.description || "Service item",
          quantity: qty,
          unitPrice: price,
          taxRate: tax,
          discount: disc,
          total: tot,
        };
      });

      const subtotal = lineItems.reduce((sum: number, it: any) => sum + it.quantity * it.unitPrice, 0);
      const taxTotal = lineItems.reduce((sum: number, it: any) => sum + (it.total - it.quantity * it.unitPrice), 0);
      const grandTotal = subtotal + taxTotal;

      const newQuote: Quotation = {
        id: `qte_${Date.now()}`,
        quoteNumber: `QTE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        clientId: `cli_ai_${Date.now()}`,
        clientName: data.clientName || "Client via Google AI",
        clientEmail: data.clientEmail || "",
        date: data.date || now,
        expiryDate: data.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        items: lineItems,
        subtotal,
        taxTotal,
        discountTotal: 0,
        grandTotal,
        status: "sent",
        notes: data.notes || `Generated via Google AI Bridge (${sourceAppName})`,
        terms: profile.quotationNotes,
        createdAt: new Date().toISOString(),
      };

      onAddQuotation(newQuote);
      logSyncEvent("create_quote", `Created Quotation ${newQuote.quoteNumber} for ${newQuote.clientName} (${formatCurrency(newQuote.grandTotal, profile.currencySymbol)})`, newQuote);
      setImportedNotification(`Quotation ${newQuote.quoteNumber} created and saved successfully!`);
    } else if (entityType === "expense") {
      const amount = Number(data.amount) || 0;
      const taxAmount = Number(data.taxAmount) || amount * 0.1304;
      const newExpense: Expense = {
        id: `exp_${Date.now()}`,
        title: data.title || "Business Expense via AI",
        category: data.category || "Operating Expenses",
        vendor: data.vendor || "Vendor",
        date: data.date || now,
        amount,
        taxAmount,
        isPaid: true,
        paymentMethod: data.paymentMethod || "EFT",
        notes: `Extracted via Google AI Bridge from ${sourceAppName}`,
      };

      onAddExpense(newExpense);
      logSyncEvent("record_expense", `Recorded Expense: ${newExpense.title} - ${formatCurrency(newExpense.amount, profile.currencySymbol)}`, newExpense);
      setImportedNotification(`Expense recorded: ${newExpense.title} for ${formatCurrency(newExpense.amount, profile.currencySymbol)}!`);
    } else if (entityType === "client") {
      const newClient: Client = {
        id: `cli_${Date.now()}`,
        name: data.name || data.companyName || "New Client",
        companyName: data.companyName || data.name,
        email: data.email || "",
        phone: data.phone || "",
        taxNumber: data.taxNumber || "",
        address: data.address || "",
        notes: `Imported via Google AI connection (${sourceAppName})`,
        createdAt: now,
      };

      onAddClient(newClient);
      logSyncEvent("sync_client", `Added Client: ${newClient.name} (${newClient.email})`, newClient);
      setImportedNotification(`Client ${newClient.name} added to your client book!`);
    }
  };

  const logSyncEvent = (action: any, summary: string, details?: any) => {
    const event: GoogleAISyncEvent = {
      id: `evt_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      sourceApp: sourceAppName,
      action,
      status: "success",
      summary,
      details,
    };
    const updated = storage.addAISyncEvent(event);
    setSyncEvents(updated);
  };

  // Financial Query handler
  const handleSendQuery = async () => {
    if (!queryInput.trim()) return;
    setIsQuerying(true);
    setQueryAnswer(null);

    const context = {
      owner: profile.ownerName,
      company: profile.companyName,
      currency: profile.currency,
      currencySymbol: profile.currencySymbol,
      totalInvoicesCount: invoices.length,
      totalInvoicedAmount: invoices.reduce((s, i) => s + i.grandTotal, 0),
      totalPaidAmount: invoices.reduce((s, i) => s + i.paidAmount, 0),
      unpaidInvoices: invoices
        .filter((i) => i.status !== "paid")
        .map((i) => ({ number: i.invoiceNumber, client: i.clientName, due: i.dueDate, balance: i.grandTotal - i.paidAmount })),
      totalExpensesAmount: expenses.reduce((s, e) => s + e.amount, 0),
      totalClients: clients.length,
    };

    try {
      const res = await fetch("/api/google-ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryInput,
          financialContext: context,
        }),
      });
      const data = await res.json();
      const answer = data.answer || "No response received.";
      setQueryAnswer(answer);
      setQueryHistory((prev) => [
        { q: queryInput, a: answer, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
        ...prev,
      ]);
      setQueryInput("");
    } catch (e: any) {
      setQueryAnswer(`Query error: ${e.message}`);
    } finally {
      setIsQuerying(false);
    }
  };

  // Webhook preset loader
  const presets: Record<string, any> = {
    partssource_po: {
      sourceApp: "partssource-za",
      action: "parts_sync",
      payload: {
        orderNumber: "PO-PSZ-8841",
        supplier: "PartsSource ZA National Hub",
        totalAmount: 6110,
        invoiceDate: new Date().toISOString().split("T")[0],
        notes: "Auto parts purchase order for workshop inventory",
        items: [
          { description: "Brembo Front Brake Pads (Hilux GD-6)", quantity: 2, unitPrice: 1250 },
          { description: "GUD Z132 Spin-On Oil Filters", quantity: 6, unitPrice: 185 },
          { description: "Castrol EDGE 5W-40 Synthetic 5L", quantity: 3, unitPrice: 780 },
        ],
      },
    },
    parts_drive_dispatch: {
      sourceApp: "parts-drive-za",
      action: "parts_sync",
      payload: {
        waybillNumber: "PDZ-7719",
        recipientName: "Pretoria North Auto Clinic",
        recipientEmail: "accounts@ptanorthauto.co.za",
        deliveryAddress: "Koedoespoort Industrial, Pretoria",
        deliveryFee: 350,
        partsDelivered: [
          { description: "Toyota Hilux 2.8 GD-6 HD Clutch Kit", quantity: 1, unitPrice: 4850 },
          { description: "Hydraulic Clutch Release Bearing", quantity: 1, unitPrice: 950 },
        ],
      },
    },
    part_smart_quote: {
      sourceApp: "part-smart-za",
      action: "parts_sync",
      payload: {
        quoteReference: "SMART-QTE-4401",
        clientName: "Highveld Freight & Transport",
        clientEmail: "fleet@highveldfreight.co.za",
        vehicleDetails: "2021 Ford Ranger 3.2 TDCi 4x4",
        markupPercentage: 25,
        partsList: [
          { partNumber: "TC-FOR-32", partName: "Timing Chain Master Kit with Guides", brand: "Dayco OEM", costPrice: 4200, quantity: 1 },
          { partNumber: "WP-FOR-88", partName: "High Flow Engine Water Pump", brand: "GMB", costPrice: 1650, quantity: 1 },
        ],
      },
    },
    invoice_crm: {
      sourceApp: "Google AI CRM Hub",
      action: "create_invoice",
      payload: {
        clientName: "Nexus Digital Works (Pty) Ltd",
        clientEmail: "billing@nexusdigital.co.za",
        items: [
          { description: "Full-Stack Cloud App Development (Sprint 1)", quantity: 1, unitPrice: 28000, taxRate: 15 },
          { description: "Gemini AI Automation Integration Service", quantity: 1, unitPrice: 9500, taxRate: 15 },
        ],
        notes: "Automated billing payload from Google AI Studio pipeline.",
      },
    },
    expense_ocr: {
      sourceApp: "Google AI Receipt Scanner",
      action: "record_expense",
      payload: {
        title: "Microsoft 365 Business Premium Yearly License",
        vendor: "Microsoft Cloud SA",
        category: "Software & Cloud",
        amount: 4800,
        taxAmount: 626.09,
        paymentMethod: "Credit Card",
        date: new Date().toISOString().split("T")[0],
      },
    },
  };

  useEffect(() => {
    if (presets[selectedPreset]) {
      setTestPayloadText(JSON.stringify(presets[selectedPreset], null, 2));
    }
  }, [selectedPreset]);

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setTestResult(null);
    try {
      const parsedPayload = JSON.parse(testPayloadText);
      const res = await fetch("/api/google-ai/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": profile.apiSecretKey || "fastbooks_live_key_992",
        },
        body: JSON.stringify(parsedPayload),
      });
      const data = await res.json();
      setTestResult(data);

      logSyncEvent(
        parsedPayload.action || "auto_sync",
        `Webhook Payload Received from ${parsedPayload.sourceApp || "External Google AI App"} (${parsedPayload.action})`,
        parsedPayload
      );
    } catch (e: any) {
      setTestResult({ error: e.message || "Failed to parse JSON payload" });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const originUrl = typeof window !== "undefined" ? window.location.origin : "https://ais-dev-x4r43f2p4v4tlxzqgiywh7-464680081273.europe-west3.run.app";

  return (
    <div className="space-y-6">
      {/* Top Banner / Google AI Platform Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300">
                <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Google AI Ecosystem Bridge
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  CONNECTED • GEMINI 3.7 FLASH
                </span>
              </h1>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Unified cross-app bridge connecting <strong>Fast-Books PRO</strong> with <strong>partssource-za</strong>, <strong>parts-drive-za</strong>, <strong>part-smart-za</strong>, and all your other Google AI Studio apps. Ingest invoices, sync expenses, reconcile bank feeds, and query live bookkeeping automatically.
            </p>
          </div>

          {/* Quick status pill & action */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={pingStatus}
              disabled={isPinging}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isPinging ? "animate-spin" : ""}`} />
              <span>{isPinging ? "Pinging..." : "Test Connection"}</span>
            </button>
            <div className="px-3.5 py-2 rounded-xl bg-indigo-900/40 border border-indigo-500/40 text-xs text-indigo-200 font-mono">
              Port: <strong>3000</strong> • Proxy: <strong>Active</strong>
            </div>
          </div>
        </div>

        {/* Live specs chips */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px] font-medium">ZA Auto Parts Ecosystem</span>
            <strong className="text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
              <Wrench className="w-3.5 h-3.5 text-amber-400" /> 3 Platforms Active
            </strong>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px] font-medium">AI Intelligence</span>
            <strong className="text-emerald-300 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Gemini 3.7 Flash
            </strong>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px] font-medium">Active Paired Apps</span>
            <strong className="text-white font-semibold flex items-center gap-1 mt-0.5">
              <Bot className="w-3.5 h-3.5 text-indigo-400" /> {connections.length} Integrations Paired
            </strong>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px] font-medium">Sync Events Stream</span>
            <strong className="text-white font-semibold flex items-center gap-1 mt-0.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" /> {syncEvents.length} Total Transferred
            </strong>
          </div>
        </div>
      </div>

      {/* Sub navigation bar */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-sm space-x-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab("za-parts")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "za-parts"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>ZA Auto Parts (partssource • parts-drive • part-smart)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("ingest")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "ingest"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>1-Click Universal AI Ingest</span>
        </button>

        <button
          onClick={() => setActiveSubTab("endpoints")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "endpoints"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Webhooks & API Endpoints</span>
        </button>

        <button
          onClick={() => setActiveSubTab("query")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "query"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Ask AI Accounting Advisor</span>
        </button>

        <button
          onClick={() => setActiveSubTab("connections")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "connections"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Paired Apps ({connections.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("activity")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "activity"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Sync Audit Log ({syncEvents.length})</span>
        </button>
      </div>

      {/* SUB-TAB 0: ZA Auto Parts Ecosystem */}
      {activeSubTab === "za-parts" && (
        <ZAPartsEcosystem
          profile={profile}
          clients={clients}
          onAddInvoice={onAddInvoice}
          onAddQuotation={onAddQuotation}
          onAddExpense={onAddExpense}
          onAddClient={onAddClient}
          onNavigateTab={onNavigateTab}
          onLogSyncEvent={(source, action, summary, details) => {
            logSyncEvent(action, summary, details);
          }}
        />
      )}


      {/* SUB-TAB 1: Universal AI Ingestion */}
      {activeSubTab === "ingest" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Universal AI Cross-App Parser
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Paste raw text, receipt OCR, WhatsApp notes, or chat logs from any Google AI app. Gemini will structure it into Fast-Books.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-medium text-slate-400">Source App:</span>
                  <input
                    type="text"
                    value={sourceAppName}
                    onChange={(e) => setSourceAppName(e.target.value)}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-100 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Sample Prompt Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Quick Load Test Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setIngestInput(p.text)}
                      className="px-2.5 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-lg font-medium transition-all text-left cursor-pointer"
                    >
                      + {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Area */}
              <div className="space-y-2">
                <textarea
                  rows={6}
                  value={ingestInput}
                  onChange={(e) => setIngestInput(e.target.value)}
                  placeholder="Paste any billing instructions, customer notes, receipt text, or email here..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-y placeholder:text-slate-400"
                />
              </div>

              {/* Parse action button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setIngestInput("")}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                >
                  Clear input
                </button>
                <button
                  onClick={handleRunIngest}
                  disabled={isParsing || !ingestInput.trim()}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isParsing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Parsing with Gemini 3.7 Flash...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                      <span>Parse & Structure with Google AI</span>
                    </>
                  )}
                </button>
              </div>

              {parseError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{parseError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Structured Output & 1-Click Commit Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  AI Structured Translation
                </h3>
                {parseResult && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 uppercase">
                    {parseResult.entityType || "RECORD"}
                  </span>
                )}
              </div>

              {importedNotification && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{importedNotification}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (parseResult?.entityType === "invoice") onNavigateTab("invoices");
                      else if (parseResult?.entityType === "quotation") onNavigateTab("quotations");
                      else if (parseResult?.entityType === "expense") onNavigateTab("expenses");
                      else onNavigateTab("clients");
                    }}
                    className="text-[11px] underline text-emerald-900 font-bold ml-2 cursor-pointer"
                  >
                    View in App →
                  </button>
                </div>
              )}

              {parseResult ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Identified Entity:</span>
                      <strong className="text-indigo-900 font-bold capitalize">
                        {parseResult.entityType}
                      </strong>
                    </div>

                    {parseResult.summary && (
                      <p className="text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
                        "{parseResult.summary}"
                      </p>
                    )}

                    {/* Dynamic previews based on entity type */}
                    {parseResult.data?.clientName && (
                      <div className="flex justify-between border-t border-slate-200/60 pt-2">
                        <span className="text-slate-500">Client / Contact:</span>
                        <strong className="text-slate-900">{parseResult.data.clientName}</strong>
                      </div>
                    )}

                    {parseResult.data?.items && parseResult.data.items.length > 0 && (
                      <div className="border-t border-slate-200/60 pt-2 space-y-1.5">
                        <span className="text-slate-500 font-semibold block">Line Items:</span>
                        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                          {parseResult.data.items.map((it: any, i: number) => (
                            <div key={i} className="flex justify-between text-[11px] bg-white p-1.5 rounded border border-slate-100">
                              <span className="truncate pr-2 text-slate-800">
                                {it.quantity}x {it.description}
                              </span>
                              <strong className="text-slate-900 whitespace-nowrap">
                                {formatCurrency(it.unitPrice * it.quantity, profile.currencySymbol)}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {parseResult.data?.amount !== undefined && (
                      <div className="flex justify-between border-t border-slate-200/60 pt-2">
                        <span className="text-slate-500">Expense Amount:</span>
                        <strong className="text-emerald-700 text-sm">
                          {formatCurrency(parseResult.data.amount, profile.currencySymbol)}
                        </strong>
                      </div>
                    )}

                    {parseResult.data?.vendor && (
                      <div className="flex justify-between border-t border-slate-200/60 pt-2">
                        <span className="text-slate-500">Vendor:</span>
                        <strong className="text-slate-900">{parseResult.data.vendor}</strong>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleCommitParsedEntity}
                      className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-200" />
                      <span>Accept & Save to Fast-Books</span>
                    </button>
                    <p className="text-center text-[11px] text-slate-400">
                      Saves instantly to persistent database and updates financial reports.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                  <Bot className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-xs font-semibold text-slate-600">No data parsed yet</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                    Select a preset on the left or paste your own unstructured notes to see the AI breakdown here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Webhooks & Endpoints */}
      {activeSubTab === "endpoints" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-600" />
                Live Connection Paths & API Endpoints
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure your external Google AI agents, bots, or Zapier/webhook pipelines to communicate directly with Fast-Books.
              </p>
            </div>

            {/* Endpoints Table */}
            <div className="space-y-3">
              {[
                {
                  method: "POST",
                  name: "Universal AI Ingest Endpoint",
                  path: "/api/google-ai/ingest",
                  desc: "Sends raw text or JSON for instant Gemini 3.7 Flash parsing into structured accounting entities.",
                },
                {
                  method: "POST",
                  name: "Direct Webhook & Sync Gateway",
                  path: "/api/google-ai/sync",
                  desc: "Direct ingestion endpoint for receiving invoices, quotes, receipts, or client records automatically.",
                },
                {
                  method: "POST",
                  name: "Financial Intelligence Query",
                  path: "/api/google-ai/query",
                  desc: "Allows Google AI bots to query live revenue, unpaid invoice balances, and tax liabilities.",
                },
                {
                  method: "GET",
                  name: "Google AI Tool & OpenAPI Schema",
                  path: "/api/google-ai/schema",
                  desc: "Returns Gemini function calling definitions for create_invoice, record_expense, and ledger queries.",
                },
              ].map((ep, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded ${ep.method === "POST" ? "bg-indigo-600 text-white" : "bg-emerald-600 text-white"}`}>
                        {ep.method}
                      </span>
                      <strong className="text-xs sm:text-sm font-mono text-slate-900">{ep.path}</strong>
                      <span className="text-xs text-slate-500 font-medium">({ep.name})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-0.5">{ep.desc}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(`${originUrl}${ep.path}`, ep.path)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    {copiedField === ep.path ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Full URL</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Secret API Key */}
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
                  Ecosystem Authorization Header (X-API-Key / Bearer Token)
                </span>
                <span className="font-mono text-xs text-slate-300 mt-1 block">
                  {profile.apiSecretKey || "fastbooks_live_key_992_coetzee"}
                </span>
              </div>
              <button
                onClick={() => handleCopy(profile.apiSecretKey || "fastbooks_live_key_992_coetzee", "api_key")}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all cursor-pointer active:scale-95"
              >
                {copiedField === "api_key" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-white" />
                    <span>Copy API Key</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Webhook Simulator */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  Live Webhook Payload Tester & Simulator
                </h3>
                <p className="text-xs text-slate-500">
                  Simulate incoming JSON requests from any external Google AI agent to verify the pipeline.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-medium">Load Template:</span>
                <select
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="invoice_crm">Invoice from AI CRM</option>
                  <option value="expense_ocr">Receipt from Scanner AI</option>
                  <option value="quote_agent">Quotation from Sales Bot</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Incoming JSON Payload:</label>
                <textarea
                  rows={9}
                  value={testPayloadText}
                  onChange={(e) => setTestPayloadText(e.target.value)}
                  className="w-full p-3 bg-slate-900 text-indigo-200 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isTestingWebhook ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting payload to /api/google-ai/sync...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Webhook Test Request</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Server Response & Ingestion Log:</label>
                <div className="p-3 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl h-[235px] overflow-y-auto border border-slate-800">
                  {testResult ? (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(testResult, null, 2)}</pre>
                  ) : (
                    <span className="text-slate-500 italic">Click "Send Webhook Test Request" to see server response...</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Ask Google AI Advisor */}
      {activeSubTab === "query" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              Ask Google AI Accounting Advisor (Powered by Gemini 3.7 Flash)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ask natural language questions about your business, cash flow, outstanding client invoices, or South African tax calculations.
            </p>
          </div>

          {/* Prompt input */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendQuery()}
                placeholder="e.g. How much VAT do I owe this quarter? Or which clients have overdue invoices?"
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <button
                onClick={handleSendQuery}
                disabled={isQuerying || !queryInput.trim()}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isQuerying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Ask Advisor</span>
              </button>
            </div>

            {/* Suggested query chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                "Summarize my revenue, expenses, and net profit",
                "List all unpaid invoices and who owes what",
                "What is my VAT output vs input liability?",
                "Give me 3 tax optimization tips for a sole owner in SA",
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQueryInput(suggestion);
                  }}
                  className="px-3 py-1 text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 rounded-lg transition-all cursor-pointer"
                >
                  💡 {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Current Answer */}
          {queryAnswer && (
            <div className="bg-indigo-50/50 border border-indigo-200/70 rounded-xl p-5 space-y-2 animate-fadeIn">
              <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Gemini 3.7 Flash Advisor Response:</span>
              </div>
              <div className="text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans bg-white p-4 rounded-lg border border-indigo-100 shadow-xs">
                {queryAnswer}
              </div>
            </div>
          )}

          {/* Query History */}
          {queryHistory.length > 1 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Inquiries:</h3>
              <div className="space-y-3">
                {queryHistory.slice(1).map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>Q: "{item.q}"</span>
                      <span className="text-[11px] text-slate-400 font-normal">{item.time}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-2 whitespace-pre-wrap">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: Paired Google AI Apps */}
      {activeSubTab === "connections" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Paired Google AI Studio Applications
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Authorized AI applications and agents communicating with Fast-Books PRO.
              </p>
            </div>
            <button
              onClick={() => {
                const newName = prompt("Enter Name for new Google AI App / Agent:", "Google AI Inventory Agent");
                if (newName) {
                  const newConn: GoogleAIAppConnection = {
                    id: `conn_${Date.now()}`,
                    appName: newName,
                    category: "Custom Gemini Agent",
                    status: "connected",
                    lastPing: "Just now",
                    tokenIdentifier: `g-ai-${Math.random().toString(36).substr(2, 6)}`,
                    permissions: ["create_invoices", "record_expenses", "read_invoices"],
                  };
                  const updated = [newConn, ...connections];
                  setConnections(updated);
                  storage.saveAIConnections(updated);
                }
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Pair New Google AI App</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {connections.map((conn) => (
              <div key={conn.id} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 relative hover:border-indigo-300 transition-all">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                    {conn.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{conn.appName}</h3>
                  <span className="text-[11px] text-slate-500">{conn.category}</span>
                </div>

                <div className="space-y-1 text-xs border-t border-slate-200/80 pt-2 text-slate-600">
                  <div className="flex justify-between text-[11px]">
                    <span>Token:</span>
                    <strong className="font-mono text-slate-800">{conn.tokenIdentifier}</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Last Sync:</span>
                    <span className="text-emerald-700 font-semibold">{conn.lastPing}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {conn.permissions.map((p, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-[10px] font-mono">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: Activity Audit Log */}
      {activeSubTab === "activity" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Cross-App Google AI Sync Audit Log
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time stream of all financial entities and webhooks received across the Google AI ecosystem.
              </p>
            </div>
            {syncEvents.length > 0 && (
              <button
                onClick={() => {
                  storage.saveAISyncEvents([]);
                  setSyncEvents([]);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
              >
                Clear log
              </button>
            )}
          </div>

          {syncEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No sync events yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Parse a test document or send a webhook payload to populate the live log.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {syncEvents.map((evt) => (
                <div key={evt.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-800 uppercase">
                        {evt.action.replace("_", " ")}
                      </span>
                      <strong className="text-xs font-semibold text-slate-900">{evt.summary}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Source: <strong>{evt.sourceApp}</strong></span>
                      <span>•</span>
                      <span>{evt.timestamp}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    SYNCD
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
