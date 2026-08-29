import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialisation of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Fast-Books", owner: "Jan Coetzee" });
});

// Google AI Ecosystem Bridge Status
app.get("/api/google-ai/status", (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: "connected",
    ecosystem: "Google AI Studio",
    model: "gemini-3.7-flash",
    hasApiKey: hasKey,
    protocolVersion: "2.5.0",
    endpoints: {
      ingest: "/api/google-ai/ingest",
      sync: "/api/google-ai/sync",
      query: "/api/google-ai/query",
      schema: "/api/google-ai/schema",
    },
    capabilities: [
      "Natural Language Invoice Generation",
      "Quotation Auto-Drafting",
      "Receipt & Expense OCR Extraction",
      "Cross-App Webhook Ingestion",
      "Bank Transaction Intelligent Reconciliation",
      "Financial Query Answering",
    ],
    timestamp: new Date().toISOString(),
  });
});

// Google AI Universal Ingestion Endpoint (translates raw unstructured text/data from other AI apps into Fast-Books records)
app.post("/api/google-ai/ingest", async (req, res) => {
  try {
    const { rawContent, sourceApp, targetType, context } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured.",
        fallback: true,
      });
    }

    const systemInstruction = `You are the Google AI Ecosystem Accounting Bridge for Fast-Books PRO (Owner: Jan Coetzee).
Your task is to parse unstructured text, billable work summaries, receipts, customer chats, or JSON from other Google AI apps and output structured accounting entities.

You MUST return a clean JSON object with this structure:
{
  "entityType": "invoice" | "quotation" | "expense" | "client" | "batch",
  "confidence": 0.95,
  "summary": "Brief description of what was parsed",
  "data": {
    // If invoice or quotation:
    "clientName": "...",
    "clientEmail": "...",
    "date": "YYYY-MM-DD",
    "dueDate": "YYYY-MM-DD",
    "items": [
      {
        "description": "Item/Service name",
        "quantity": 1,
        "unitPrice": 1000,
        "taxRate": 15,
        "discount": 0,
        "total": 1150
      }
    ],
    "notes": "...",
    "terms": "...",
    // If expense:
    "title": "...",
    "category": "Operating Expenses" | "Rent & Property" | "Utilities" | "Vehicle & Petrol" | "Software & Cloud" | "Office Supplies" | "Professional Fees" | "Marketing & Ads" | "Other",
    "vendor": "...",
    "amount": 1000,
    "taxAmount": 130.43,
    "date": "YYYY-MM-DD",
    "paymentMethod": "EFT" | "Credit Card" | "Debit Order" | "Cash",
    // If client:
    "name": "...",
    "companyName": "...",
    "email": "...",
    "phone": "...",
    "address": "..."
  }
}
Always default tax rate to 15% (VAT) unless specified otherwise. Calculate line totals correctly ((quantity * unitPrice * (1 - discount/100)) * (1 + taxRate/100)).
Respond ONLY with the JSON object. Do not include markdown ticks if possible, or wrap in valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Parse this accounting input from external app [${sourceApp || "Google AI App"}]:
Raw Content:
${rawContent || JSON.stringify(req.body)}

Business Context:
${JSON.stringify(context || {})}
Preferred Target: ${targetType || "auto"}`,
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });

    let rawText = response.text || "";
    // Clean potential markdown blocks
    rawText = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    try {
      const parsed = JSON.parse(rawText);
      res.json({
        success: true,
        sourceApp: sourceApp || "Google AI App",
        parsed,
      });
    } catch (parseErr) {
      res.json({
        success: true,
        sourceApp: sourceApp || "Google AI App",
        rawText,
        fallback: true,
      });
    }
  } catch (error: any) {
    console.error("Error in /api/google-ai/ingest:", error);
    res.status(500).json({ error: error.message || "Google AI Ingestion Error" });
  }
});

// Google AI Direct Webhook / Sync endpoint for other Google AI Studio apps
app.post("/api/google-ai/sync", (req, res) => {
  try {
    const { sourceApp, action, payload } = req.body;
    const apiKeyHeader = req.headers["x-api-key"] || req.headers["authorization"];

    if (!payload && !req.body) {
      return res.status(400).json({ error: "Missing sync payload" });
    }

    const eventId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    res.json({
      success: true,
      eventId,
      status: "received",
      sourceApp: sourceApp || "Google AI Ecosystem App",
      action: action || "auto_sync",
      receivedAt: new Date().toISOString(),
      message: "Sync event accepted into Fast-Books live pipeline",
      echoPayload: payload || req.body,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Sync processing error" });
  }
});

// Dedicated ZA Auto Parts Ecosystem: Status endpoint
app.get("/api/integrations/parts-ecosystem/status", (_req, res) => {
  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    platforms: [
      {
        key: "partssource-za",
        name: "PartsSource ZA",
        category: "Auto Parts Sourcing & Supplier Invoices",
        status: "connected",
        endpoint: "/api/integrations/partssource-za/sync",
        capabilities: ["Supplier PO Import", "Parts Bill Reconciliation", "Catalog Pricing"],
      },
      {
        key: "parts-drive-za",
        name: "Parts-Drive ZA",
        category: "Workshop Logistics & Delivery Dispatch",
        status: "connected",
        endpoint: "/api/integrations/parts-drive-za/sync",
        capabilities: ["Delivery Note Invoicing", "Courier Tracking Fee Sync", "Workshop Dispatch Billing"],
      },
      {
        key: "part-smart-za",
        name: "Part-Smart ZA",
        category: "Smart Parts Catalog & VIN Quotation Engine",
        status: "connected",
        endpoint: "/api/integrations/part-smart-za/sync",
        capabilities: ["VIN Quotation Generation", "Intelligent Margin Calculation", "Live Part Numbers"],
      },
    ],
  });
});

// Dedicated endpoint: PartsSource ZA (partssource-za)
app.post("/api/integrations/partssource-za/sync", (req, res) => {
  try {
    const { orderNumber, supplier, items, totalAmount, invoiceDate, notes } = req.body;
    const eventId = `psz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    // Structure as Expense or Bill
    const amount = Number(totalAmount) || (items ? items.reduce((sum: number, it: any) => sum + (it.unitPrice * it.quantity), 0) : 0);
    const taxAmount = amount * (15 / 115); // Standard 15% SA VAT included calculation

    res.json({
      success: true,
      eventId,
      platform: "partssource-za",
      recordType: "expense",
      structuredRecord: {
        id: `exp_psz_${Date.now()}`,
        title: `PartsSource ZA Order #${orderNumber || "PO-" + Math.floor(1000 + Math.random() * 9000)}`,
        vendor: supplier || "PartsSource ZA National Hub",
        category: "Operating Expenses",
        amount,
        taxAmount,
        date: invoiceDate || new Date().toISOString().split("T")[0],
        paymentMethod: "EFT",
        notes: notes || `Direct parts supplier import from PartsSource ZA (${items ? items.length : 0} line items)`,
        items: items || [],
      },
      message: "PartsSource ZA payload processed and structured for Fast-Books.",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to process PartsSource ZA sync" });
  }
});

// Dedicated endpoint: Parts-Drive ZA (parts-drive-za)
app.post("/api/integrations/parts-drive-za/sync", (req, res) => {
  try {
    const { waybillNumber, recipientName, recipientEmail, deliveryAddress, deliveryFee, partsDelivered, status } = req.body;
    const eventId = `pdz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Structure as customer invoice or dispatch bill
    const items = (partsDelivered || []).map((p: any, idx: number) => ({
      id: `li_pdz_${Date.now()}_${idx}`,
      description: p.partDescription || p.description || "Auto Part Delivery",
      quantity: Number(p.quantity) || 1,
      unitPrice: Number(p.unitPrice) || 0,
      taxRate: 15,
      discount: 0,
      total: (Number(p.unitPrice) || 0) * (Number(p.quantity) || 1) * 1.15,
    }));

    if (deliveryFee && Number(deliveryFee) > 0) {
      items.push({
        id: `li_pdz_fee_${Date.now()}`,
        description: `Parts-Drive ZA Express Delivery Fee (Waybill: ${waybillNumber || "WB-8821"})`,
        quantity: 1,
        unitPrice: Number(deliveryFee),
        taxRate: 15,
        discount: 0,
        total: Number(deliveryFee) * 1.15,
      });
    }

    const subtotal = items.reduce((sum: number, it: any) => sum + it.quantity * it.unitPrice, 0);
    const taxTotal = subtotal * 0.15;
    const grandTotal = subtotal + taxTotal;

    res.json({
      success: true,
      eventId,
      platform: "parts-drive-za",
      recordType: "invoice",
      structuredRecord: {
        id: `inv_pdz_${Date.now()}`,
        invoiceNumber: `INV-PDZ-${Math.floor(100 + Math.random() * 900)}`,
        clientName: recipientName || "Workshop Client via Parts-Drive ZA",
        clientEmail: recipientEmail || "",
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        items,
        subtotal,
        taxTotal,
        grandTotal,
        notes: `Parts-Drive ZA Delivery Waybill #${waybillNumber || "WB-8821"} - Delivered to: ${deliveryAddress || "Client Workshop"}`,
      },
      message: "Parts-Drive ZA dispatch sync received and prepared as Invoice.",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to process Parts-Drive ZA sync" });
  }
});

// Dedicated endpoint: Part-Smart ZA (part-smart-za)
app.post("/api/integrations/part-smart-za/sync", (req, res) => {
  try {
    const { quoteReference, clientName, clientEmail, vehicleDetails, partsList, markupPercentage } = req.body;
    const eventId = `psm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const markup = 1 + (Number(markupPercentage) || 25) / 100;

    const items = (partsList || []).map((part: any, idx: number) => {
      const basePrice = Number(part.costPrice || part.unitPrice) || 500;
      const finalPrice = Math.round(basePrice * markup);
      const qty = Number(part.quantity) || 1;
      const sub = qty * finalPrice;
      return {
        id: `li_psm_${Date.now()}_${idx}`,
        description: `${part.partNumber ? `[${part.partNumber}] ` : ""}${part.partName || part.description || "Spare Part"} ${part.brand ? `(${part.brand})` : ""}`,
        quantity: qty,
        unitPrice: finalPrice,
        taxRate: 15,
        discount: 0,
        total: sub * 1.15,
      };
    });

    const subtotal = items.reduce((sum: number, it: any) => sum + it.quantity * it.unitPrice, 0);
    const taxTotal = subtotal * 0.15;
    const grandTotal = subtotal + taxTotal;

    res.json({
      success: true,
      eventId,
      platform: "part-smart-za",
      recordType: "quotation",
      structuredRecord: {
        id: `qte_psm_${Date.now()}`,
        quoteNumber: `QTE-PSM-${Math.floor(100 + Math.random() * 900)}`,
        clientName: clientName || "Client via Part-Smart ZA",
        clientEmail: clientEmail || "",
        date: new Date().toISOString().split("T")[0],
        expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        vehicleDetails: vehicleDetails || "General Vehicle Spares",
        items,
        subtotal,
        taxTotal,
        grandTotal,
        notes: `Smart Quotation generated via Part-Smart ZA catalog. ${vehicleDetails ? `Vehicle: ${vehicleDetails}` : ""} Ref: ${quoteReference || "SMART-QUOTE"}`,
      },
      message: "Part-Smart ZA estimation processed and structured as Quotation.",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to process Part-Smart ZA sync" });
  }
});


// Google AI Natural Language Financial Assistant / Query Endpoint
app.post("/api/google-ai/query", async (req, res) => {
  try {
    const { query, financialContext } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured.",
        fallback: true,
      });
    }

    const systemInstruction = `You are Fast-Books PRO AI Financial Controller & Advisor for Jan Coetzee's business.
You provide clear, accurate, and actionable accounting advice, cashflow summaries, tax calculations (South African VAT 15% and corporate tax guidelines), and invoice status analysis based on the provided live financial ledger context.
Keep answers concise, professional, and formatted in clean markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Query from Jan Coetzee or connected Google AI App:
"${query}"

Live Financial Ledger Context:
${JSON.stringify(financialContext || {})}`,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    res.json({
      success: true,
      answer: response.text || "",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in /api/google-ai/query:", error);
    res.status(500).json({ error: error.message || "Financial query error" });
  }
});

// Google AI Agent Tool Specification / Schema Endpoint
app.get("/api/google-ai/schema", (_req, res) => {
  res.json({
    name: "FastBooksAccountingTools",
    description: "Tool definitions for Google AI Studio agents to interact with Fast-Books PRO",
    version: "2.0.0",
    tools: [
      {
        name: "create_invoice",
        description: "Creates and records a client invoice in Fast-Books",
        parameters: {
          type: "OBJECT",
          properties: {
            clientName: { type: "STRING", description: "Name of the client" },
            clientEmail: { type: "STRING", description: "Email of the client" },
            items: {
              type: "ARRAY",
              description: "Line items",
              items: {
                type: "OBJECT",
                properties: {
                  description: { type: "STRING" },
                  quantity: { type: "NUMBER" },
                  unitPrice: { type: "NUMBER" },
                  taxRate: { type: "NUMBER" },
                },
                required: ["description", "quantity", "unitPrice"],
              },
            },
            notes: { type: "STRING" },
          },
          required: ["clientName", "items"],
        },
      },
      {
        name: "record_expense",
        description: "Records a business expenditure in Fast-Books",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            vendor: { type: "STRING" },
            category: { type: "STRING" },
            amount: { type: "NUMBER" },
            date: { type: "STRING" },
          },
          required: ["title", "vendor", "amount"],
        },
      },
      {
        name: "get_financial_overview",
        description: "Retrieves current revenue, unpaid invoices, and expense totals",
        parameters: { type: "OBJECT", properties: {} },
      },
    ],
  });
});

// Gemini AI route for Smart Quotations & Smart Bank Matching
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { prompt, type, context } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured.",
        fallback: true,
      });
    }

    let systemInstruction = "You are Fast-Books AI Accounting Assistant for Jan Coetzee's business.";
    
    if (type === "quotation") {
      systemInstruction = `You are a professional business quotation generator. Return a JSON array of line items with format:
[
  { "description": "Item description", "quantity": 1, "unitPrice": 1500, "taxRate": 15 }
]
Only return valid JSON array without markdown formatting.`;
    } else if (type === "bank-match") {
      systemInstruction = `You are an expert bank reconciliation assistant. Compare bank transactions with unpaid invoices or expense categories and return JSON recommendations:
[
  { "transactionId": "...", "matchedType": "invoice"|"expense", "matchedId": "...", "confidence": 0.95, "reason": "Explanation" }
]
Only return valid JSON array without markdown formatting.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `${prompt}\nContext: ${JSON.stringify(context || {})}`,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const text = response.text || "";
    res.json({ text, result: text });
  } catch (error: any) {
    console.error("Error in /api/gemini/generate:", error);
    res.status(500).json({ error: error.message || "AI Service Error" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fast-Books server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
