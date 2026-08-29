import { BusinessProfile, Client, Quotation, Invoice, BankAccount, BankTransaction, Expense, SarsComplianceProfile, SarsFilingItem } from "../types";

export interface OfflineBundleData {
  profile: BusinessProfile;
  clients: Client[];
  quotations: Quotation[];
  invoices: Invoice[];
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  expenses: Expense[];
  sarsProfile?: SarsComplianceProfile;
  sarsFilings?: SarsFilingItem[];
}

/**
 * Generates a completely self-contained, standalone single-file HTML desktop application.
 * This runs 100% offline on any computer (Windows, macOS, Linux) by double clicking the .html file.
 */
export function generateOfflineDesktopHTML(data: OfflineBundleData): string {
  const jsonPayload = JSON.stringify(data).replace(/<\/script>/gi, "<\\/script>");
  const ownerName = data.profile.ownerName || "Jan Coetzee";
  const businessName = data.profile.tradingName || data.profile.companyName || "Fast-Books";
  const currencySymbol = data.profile.currencySymbol || "R";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} - Offline Desktop Bookkeeping Suite</title>
  <style>
    :root {
      --primary: #4f46e5;
      --primary-hover: #4338ca;
      --bg: #0f172a;
      --surface: #1e293b;
      --surface-light: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --border: #334155;
      --emerald: #10b981;
      --amber: #f59e0b;
      --rose: #f43f5e;
      --sky: #0284c7;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
    body { background-color: #0b1120; color: var(--text); min-height: 100vh; display: flex; flex-direction: column; }
    
    /* Top Header */
    header { background: #0f172a; border-bottom: 1px solid var(--border); padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 50; }
    .logo-box { display: flex; align-items: center; gap: 12px; }
    .logo-icon { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #4f46e5, #10b981); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 18px; color: white; }
    .logo-title { font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
    .logo-badge { font-size: 10px; font-weight: 800; background: rgba(79, 70, 229, 0.2); color: #818cf8; border: 1px solid rgba(79, 70, 229, 0.4); padding: 2px 8px; border-radius: 9999px; margin-left: 6px; }
    .logo-subtitle { font-size: 11px; color: var(--text-muted); }
    
    .status-badge { display: flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

    /* Nav Bar */
    nav { background: #1e293b; border-bottom: 1px solid var(--border); padding: 6px 24px; display: flex; gap: 6px; overflow-x: auto; }
    .nav-btn { background: transparent; border: none; color: var(--text-muted); padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.15s; white-space: nowrap; }
    .nav-btn:hover { background: rgba(255,255,255,0.05); color: white; }
    .nav-btn.active { background: var(--primary); color: white; }

    /* Main Container */
    main { flex: 1; max-width: 1280px; width: 100%; margin: 0 auto; padding: 24px; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }

    /* Cards & Stats */
    .card { background: #1e293b; border: 1px solid var(--border); border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #1e293b; border: 1px solid var(--border); border-radius: 14px; padding: 18px; }
    .stat-label { font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 6px; }
    .stat-value { font-size: 22px; font-weight: 800; color: #ffffff; }
    .stat-desc { font-size: 11px; margin-top: 4px; color: var(--text-muted); }

    /* Buttons */
    .btn { background: var(--primary); color: white; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; transition: 0.15s; }
    .btn:hover { background: var(--primary-hover); }
    .btn-emerald { background: #059669; }
    .btn-emerald:hover { background: #047857; }
    .btn-secondary { background: var(--surface-light); color: var(--text); }
    .btn-secondary:hover { background: #475569; }
    .btn-sm { padding: 6px 12px; font-size: 12px; border-radius: 8px; }

    /* Tables */
    .table-container { width: 100%; overflow-x: auto; background: #1e293b; border: 1px solid var(--border); border-radius: 14px; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
    th { background: #0f172a; padding: 12px 16px; color: var(--text-muted); font-weight: 700; border-bottom: 1px solid var(--border); }
    td { padding: 12px 16px; border-bottom: 1px solid rgba(51, 65, 85, 0.4); color: #e2e8f0; }
    tr:hover td { background: rgba(255,255,255,0.02); }

    /* Status Pills */
    .pill { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .pill-paid { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .pill-issued { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .pill-draft { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); }

    /* Forms & Modals */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: none; justify-content: center; align-items: center; z-index: 100; padding: 20px; }
    .modal-overlay.open { display: flex; }
    .modal-box { background: #1e293b; border: 1px solid var(--border); border-radius: 18px; max-width: 650px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; }
    .form-control { width: 100%; background: #0f172a; border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; color: white; font-size: 13px; outline: none; }
    .form-control:focus { border-color: var(--primary); }

    /* Print Preview */
    @media print {
      header, nav, .no-print { display: none !important; }
      body, main { background: white !important; color: black !important; padding: 0 !important; }
      .card { border: none !important; box-shadow: none !important; background: white !important; color: black !important; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <header>
    <div class="logo-box">
      <div class="logo-icon">FB</div>
      <div>
        <div style="display:flex; align-items:center;">
          <span class="logo-title">${businessName}</span>
          <span class="logo-badge">OFFLINE DESKTOP</span>
        </div>
        <div class="logo-subtitle">Sole Proprietor: <strong>${ownerName}</strong> &bull; Tax: ${data.profile.taxNumber || "Registered"}</div>
      </div>
    </div>

    <div style="display:flex; align-items:center; gap:12px;">
      <div class="status-badge">
        <div class="pulse-dot"></div>
        <span>100% Offline PC Mode Active</span>
      </div>
      <button class="btn btn-emerald btn-sm" onclick="exportCurrentDatabase()">💾 Save Backup JSON</button>
    </div>
  </header>

  <!-- Navigation -->
  <nav>
    <button class="nav-btn active" onclick="switchTab('dashboard')">📊 Dashboard</button>
    <button class="nav-btn" onclick="switchTab('invoices')">🧾 Invoices</button>
    <button class="nav-btn" onclick="switchTab('quotations')">📄 Quotations</button>
    <button class="nav-btn" onclick="switchTab('expenses')">💳 Expenses</button>
    <button class="nav-btn" onclick="switchTab('clients')">👥 Clients</button>
    <button class="nav-btn" onclick="switchTab('vat')">🏛️ SARS VAT (15%)</button>
    <button class="nav-btn" onclick="switchTab('backup')">⚙️ Offline Data Manager</button>
  </nav>

  <!-- Main Content Area -->
  <main>
    <!-- TAB: DASHBOARD -->
    <div id="tab-dashboard" class="tab-content active">
      <div class="card" style="background: linear-gradient(135deg, #1e1b4b, #0f172a); border-color:#3730a3;">
        <h2 style="font-size:22px; font-weight:800; margin-bottom:8px;">Fast-Books Standalone Desktop App</h2>
        <p style="color:#cbd5e1; font-size:13px; max-width:800px; line-height:1.6;">
          You are running the standalone, fully offline version of Fast-Books for <strong>${ownerName}</strong>. All quotations, tax invoices, client records, and VAT calculations are stored directly inside your browser storage on this computer. No internet connection is required.
        </p>
      </div>

      <div class="grid-4">
        <div class="stat-card">
          <div class="stat-label">Total Invoiced Revenue</div>
          <div class="stat-value" id="stat-revenue">${currencySymbol} 0.00</div>
          <div class="stat-desc">From client invoices</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Paid Received</div>
          <div class="stat-value" id="stat-paid" style="color:#34d399;">${currencySymbol} 0.00</div>
          <div class="stat-desc">Settled funds</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Expenses</div>
          <div class="stat-value" id="stat-expenses" style="color:#f87171;">${currencySymbol} 0.00</div>
          <div class="stat-desc">Operating expenditures</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Net Profit</div>
          <div class="stat-value" id="stat-profit" style="color:#38bdf8;">${currencySymbol} 0.00</div>
          <div class="stat-desc">Paid revenue - expenses</div>
        </div>
      </div>

      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 style="font-size:16px; font-weight:700;">Recent Client Invoices</h3>
          <button class="btn btn-sm" onclick="openNewInvoiceModal()">+ Create Invoice</button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Date</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="dashboard-invoices-tbody">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB: INVOICES -->
    <div id="tab-invoices" class="tab-content">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div>
          <h2 style="font-size:20px; font-weight:800;">Tax Invoices</h2>
          <p style="font-size:12px; color:var(--text-muted);">Standard South African VAT 15% Tax Invoices</p>
        </div>
        <button class="btn" onclick="openNewInvoiceModal()">+ New Tax Invoice</button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Subtotal</th>
              <th>VAT (15%)</th>
              <th>Grand Total</th>
              <th>Paid</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="invoices-tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- TAB: QUOTATIONS -->
    <div id="tab-quotations" class="tab-content">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div>
          <h2 style="font-size:20px; font-weight:800;">Quotations & Estimates</h2>
          <p style="font-size:12px; color:var(--text-muted);">Formal Price Quotes with 1-Click Invoice Conversion</p>
        </div>
        <button class="btn" onclick="openNewQuoteModal()">+ New Quotation</button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Quote #</th>
              <th>Client</th>
              <th>Date</th>
              <th>Expiry</th>
              <th>Subtotal</th>
              <th>VAT (15%)</th>
              <th>Grand Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="quotations-tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- TAB: EXPENSES -->
    <div id="tab-expenses" class="tab-content">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div>
          <h2 style="font-size:20px; font-weight:800;">Operating Expenses</h2>
          <p style="font-size:12px; color:var(--text-muted);">Track expenditures, vendor bills, and input VAT claims</p>
        </div>
        <button class="btn" onclick="openNewExpenseModal()">+ Record Expense</button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title / Description</th>
              <th>Category</th>
              <th>Vendor</th>
              <th>Amount</th>
              <th>Input VAT</th>
              <th>Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="expenses-tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- TAB: CLIENTS -->
    <div id="tab-clients" class="tab-content">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div>
          <h2 style="font-size:20px; font-weight:800;">Client Directory</h2>
          <p style="font-size:12px; color:var(--text-muted);">Manage client accounts, emails, and tax numbers</p>
        </div>
        <button class="btn" onclick="openNewClientModal()">+ Add Client</button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Tax / VAT #</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="clients-tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- TAB: SARS VAT -->
    <div id="tab-vat" class="tab-content">
      <div class="card" style="border-left: 4px solid var(--amber);">
        <h2 style="font-size:20px; font-weight:800; margin-bottom:6px;">South African SARS VAT201 Calculator</h2>
        <p style="font-size:13px; color:var(--text-muted);">
          Automated 15% VAT breakdown based on all recorded sales tax invoices (Output Tax) and business expenses (Input Tax).
        </p>
      </div>

      <div class="grid-4">
        <div class="stat-card">
          <div class="stat-label">Standard Sales (Excl VAT)</div>
          <div class="stat-value" id="vat-sales-excl">${currencySymbol} 0.00</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Output Tax (15% on Sales)</div>
          <div class="stat-value" id="vat-output" style="color:#fbbf24;">${currencySymbol} 0.00</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Input Tax (15% on Expenses)</div>
          <div class="stat-value" id="vat-input" style="color:#34d399;">${currencySymbol} 0.00</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Net VAT Payable to SARS</div>
          <div class="stat-value" id="vat-net" style="color:#38bdf8;">${currencySymbol} 0.00</div>
        </div>
      </div>
    </div>

    <!-- TAB: BACKUP & DATA -->
    <div id="tab-backup" class="tab-content">
      <div class="card">
        <h2 style="font-size:20px; font-weight:800; margin-bottom:8px;">Offline Data & Storage Manager</h2>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">
          Export your complete database to disk or import a JSON backup file to synchronize with the web version.
        </p>

        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <button class="btn btn-emerald" onclick="exportCurrentDatabase()">💾 Export Full Backup (.JSON)</button>
          <button class="btn btn-secondary" onclick="document.getElementById('importFileInput').click()">📂 Import Backup File</button>
          <input type="file" id="importFileInput" accept=".json" style="display:none;" onchange="importDatabaseFromFile(event)">
          <button class="btn btn-secondary" onclick="exportCSV('invoices')">📊 Export Invoices CSV</button>
          <button class="btn btn-secondary" onclick="exportCSV('quotations')">📊 Export Quotes CSV</button>
          <button class="btn btn-secondary" onclick="exportCSV('clients')">📊 Export Clients CSV</button>
        </div>
      </div>
    </div>
  </main>

  <!-- MODAL: NEW INVOICE -->
  <div id="invoiceModal" class="modal-overlay">
    <div class="modal-box">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">Create Client Tax Invoice</h3>
      <form id="invoiceForm" onsubmit="handleSaveInvoiceForm(event)">
        <div class="form-group">
          <label>Select Client</label>
          <select id="inv-client-select" class="form-control" required onchange="handleInvoiceClientChange()">
            <option value="">-- Select Client --</option>
          </select>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label>Invoice Date</label>
            <input type="date" id="inv-date" class="form-control" required>
          </div>
          <div class="form-group">
            <label>Due Date</label>
            <input type="date" id="inv-due-date" class="form-control" required>
          </div>
        </div>
        <div class="form-group">
          <label>Item Description</label>
          <input type="text" id="inv-item-desc" class="form-control" placeholder="e.g. Workshop Service / Auto Parts" required>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label>Quantity</label>
            <input type="number" id="inv-qty" class="form-control" value="1" min="1" required>
          </div>
          <div class="form-group">
            <label>Unit Price (${currencySymbol})</label>
            <input type="number" id="inv-price" class="form-control" value="1000" min="0" step="0.01" required>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('invoiceModal')">Cancel</button>
          <button type="submit" class="btn btn-emerald">Save Invoice</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: NEW QUOTATION -->
  <div id="quoteModal" class="modal-overlay">
    <div class="modal-box">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">Create Formal Quotation</h3>
      <form id="quoteForm" onsubmit="handleSaveQuoteForm(event)">
        <div class="form-group">
          <label>Select Client</label>
          <select id="quote-client-select" class="form-control" required>
            <option value="">-- Select Client --</option>
          </select>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label>Quote Date</label>
            <input type="date" id="quote-date" class="form-control" required>
          </div>
          <div class="form-group">
            <label>Expiry Date</label>
            <input type="date" id="quote-expiry" class="form-control" required>
          </div>
        </div>
        <div class="form-group">
          <label>Service / Parts Description</label>
          <input type="text" id="quote-item-desc" class="form-control" placeholder="e.g. Brake Replacement & Alignment" required>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label>Quantity</label>
            <input type="number" id="quote-qty" class="form-control" value="1" min="1" required>
          </div>
          <div class="form-group">
            <label>Unit Price (${currencySymbol})</label>
            <input type="number" id="quote-price" class="form-control" value="1500" min="0" step="0.01" required>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('quoteModal')">Cancel</button>
          <button type="submit" class="btn btn-emerald">Save Quotation</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: NEW EXPENSE -->
  <div id="expenseModal" class="modal-overlay">
    <div class="modal-box">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">Record Business Expense</h3>
      <form id="expenseForm" onsubmit="handleSaveExpenseForm(event)">
        <div class="form-group">
          <label>Expense Title</label>
          <input type="text" id="exp-title" class="form-control" placeholder="e.g. Fuel / Workshop Tools" required>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label>Category</label>
            <select id="exp-category" class="form-control">
              <option value="Operating Expenses">Operating Expenses</option>
              <option value="Vehicle & Petrol">Vehicle & Petrol</option>
              <option value="Rent & Property">Rent & Property</option>
              <option value="Utilities">Utilities</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Vendor</label>
            <input type="text" id="exp-vendor" class="form-control" placeholder="e.g. Shell / PartsSource" required>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label>Total Amount (${currencySymbol})</label>
            <input type="number" id="exp-amount" class="form-control" value="500" min="0" step="0.01" required>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="exp-date" class="form-control" required>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('expenseModal')">Cancel</button>
          <button type="submit" class="btn btn-emerald">Record Expense</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: NEW CLIENT -->
  <div id="clientModal" class="modal-overlay">
    <div class="modal-box">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">Add New Client</h3>
      <form id="clientForm" onsubmit="handleSaveClientForm(event)">
        <div class="form-group">
          <label>Client Full Name</label>
          <input type="text" id="cl-name" class="form-control" placeholder="e.g. Johan Venter" required>
        </div>
        <div class="form-group">
          <label>Company Name (Optional)</label>
          <input type="text" id="cl-company" class="form-control" placeholder="e.g. Venter Logistics Pty Ltd">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" id="cl-email" class="form-control" placeholder="client@example.co.za" required>
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="text" id="cl-phone" class="form-control" placeholder="082 123 4567">
          </div>
        </div>
        <div class="form-group">
          <label>VAT / Tax Number</label>
          <input type="text" id="cl-tax" class="form-control" placeholder="4910284729">
        </div>
        <div class="form-group">
          <label>Physical Address</label>
          <input type="text" id="cl-address" class="form-control" placeholder="12 Main Road, Cape Town">
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('clientModal')">Cancel</button>
          <button type="submit" class="btn btn-emerald">Save Client</button>
        </div>
      </form>
    </div>
  </div>

  <!-- EMBEDDED JAVASCRIPT LOGIC -->
  <script>
    // Initial data injected at bundle generation
    const INITIAL_PAYLOAD = ${jsonPayload};
    const STORAGE_KEY = "fastbooks_offline_standalone_db_v1";

    // Load or initialize state from local storage
    function loadState() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn("Failed to parse saved state, using initial payload", e);
        }
      }
      return INITIAL_PAYLOAD;
    }

    let state = loadState();

    function saveState() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      renderApp();
    }

    function formatCur(num) {
      return "${currencySymbol} " + Number(num || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function switchTab(tabId) {
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      
      const tabEl = document.getElementById("tab-" + tabId);
      if (tabEl) tabEl.classList.add("active");

      // Set active nav button
      const clickedBtn = Array.from(document.querySelectorAll(".nav-btn")).find(b => b.getAttribute("onclick")?.includes(tabId));
      if (clickedBtn) clickedBtn.classList.add("active");
    }

    function renderApp() {
      // 1. Calculations
      const invoices = state.invoices || [];
      const quotations = state.quotations || [];
      const expenses = state.expenses || [];
      const clients = state.clients || [];

      const totalRevenue = invoices.reduce((sum, i) => sum + (Number(i.grandTotal) || 0), 0);
      const totalPaid = invoices.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0);
      const totalExp = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const netProfit = totalPaid - totalExp;

      document.getElementById("stat-revenue").textContent = formatCur(totalRevenue);
      document.getElementById("stat-paid").textContent = formatCur(totalPaid);
      document.getElementById("stat-expenses").textContent = formatCur(totalExp);
      document.getElementById("stat-profit").textContent = formatCur(netProfit);

      // 2. Render Invoices Table
      const invTbody = document.getElementById("invoices-tbody");
      const dashInvTbody = document.getElementById("dashboard-invoices-tbody");
      invTbody.innerHTML = "";
      dashInvTbody.innerHTML = "";

      invoices.forEach(inv => {
        const tr = document.createElement("tr");
        const statusClass = inv.status === "paid" ? "pill-paid" : (inv.status === "issued" ? "pill-issued" : "pill-draft");
        tr.innerHTML = \`
          <td><strong>\${inv.invoiceNumber}</strong></td>
          <td>\${inv.clientName}</td>
          <td>\${inv.date}</td>
          <td>\${inv.dueDate || "-"}</td>
          <td>\${formatCur(inv.subtotal)}</td>
          <td>\${formatCur(inv.taxTotal)}</td>
          <td><strong>\${formatCur(inv.grandTotal)}</strong></td>
          <td style="color:#34d399;">\${formatCur(inv.paidAmount)}</td>
          <td><span class="pill \${statusClass}">\${inv.status}</span></td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="markInvoicePaid('\${inv.id}')">\${inv.status === 'paid' ? 'Paid ✓' : 'Mark Paid'}</button>
            <button class="btn btn-sm btn-secondary" onclick="deleteInvoice('\${inv.id}')">✕</button>
          </td>
        \`;
        invTbody.appendChild(tr);

        // Dashboard condensed row
        const dTr = document.createElement("tr");
        dTr.innerHTML = \`
          <td><strong>\${inv.invoiceNumber}</strong></td>
          <td>\${inv.clientName}</td>
          <td>\${inv.date}</td>
          <td><strong>\${formatCur(inv.grandTotal)}</strong></td>
          <td>\${formatCur(inv.paidAmount)}</td>
          <td><span class="pill \${statusClass}">\${inv.status}</span></td>
          <td><button class="btn btn-sm btn-secondary" onclick="markInvoicePaid('\${inv.id}')">Toggle Paid</button></td>
        \`;
        dashInvTbody.appendChild(dTr);
      });

      // 3. Render Quotations Table
      const quoteTbody = document.getElementById("quotations-tbody");
      quoteTbody.innerHTML = "";
      quotations.forEach(q => {
        const tr = document.createElement("tr");
        tr.innerHTML = \`
          <td><strong>\${q.quoteNumber}</strong></td>
          <td>\${q.clientName}</td>
          <td>\${q.date}</td>
          <td>\${q.expiryDate || "-"}</td>
          <td>\${formatCur(q.subtotal)}</td>
          <td>\${formatCur(q.taxTotal)}</td>
          <td><strong>\${formatCur(q.grandTotal)}</strong></td>
          <td><span class="pill pill-issued">\${q.status}</span></td>
          <td>
            <button class="btn btn-sm btn-emerald" onclick="convertQuoteToInvoice('\${q.id}')">Convert to Invoice &rarr;</button>
            <button class="btn btn-sm btn-secondary" onclick="deleteQuotation('\${q.id}')">✕</button>
          </td>
        \`;
        quoteTbody.appendChild(tr);
      });

      // 4. Render Expenses Table
      const expTbody = document.getElementById("expenses-tbody");
      expTbody.innerHTML = "";
      expenses.forEach(exp => {
        const tr = document.createElement("tr");
        tr.innerHTML = \`
          <td>\${exp.date}</td>
          <td><strong>\${exp.title}</strong></td>
          <td>\${exp.category}</td>
          <td>\${exp.vendor}</td>
          <td><strong>\${formatCur(exp.amount)}</strong></td>
          <td>\${formatCur(exp.taxAmount || exp.amount * 0.1304)}</td>
          <td>\${exp.paymentMethod || "EFT"}</td>
          <td><button class="btn btn-sm btn-secondary" onclick="deleteExpense('\${exp.id}')">✕</button></td>
        \`;
        expTbody.appendChild(tr);
      });

      // 5. Render Clients Table
      const clTbody = document.getElementById("clients-tbody");
      clTbody.innerHTML = "";
      clients.forEach(cl => {
        const tr = document.createElement("tr");
        tr.innerHTML = \`
          <td><strong>\${cl.name}</strong></td>
          <td>\${cl.companyName || "-"}</td>
          <td>\${cl.email}</td>
          <td>\${cl.phone || "-"}</td>
          <td>\${cl.taxNumber || "-"}</td>
          <td>\${cl.address || "-"}</td>
          <td><button class="btn btn-sm btn-secondary" onclick="deleteClient('\${cl.id}')">✕</button></td>
        \`;
        clTbody.appendChild(tr);
      });

      // 6. Populate Client Select Dropdowns
      const invSelect = document.getElementById("inv-client-select");
      const quoteSelect = document.getElementById("quote-client-select");
      invSelect.innerHTML = '<option value="">-- Select Client --</option>';
      quoteSelect.innerHTML = '<option value="">-- Select Client --</option>';
      clients.forEach(c => {
        const opt = \`<option value="\${c.id}">\${c.name} \${c.companyName ? '(' + c.companyName + ')' : ''}</option>\`;
        invSelect.innerHTML += opt;
        quoteSelect.innerHTML += opt;
      });

      // 7. SARS VAT Calculations
      const totalSalesExcl = invoices.reduce((sum, i) => sum + (Number(i.subtotal) || 0), 0);
      const outputTax = invoices.reduce((sum, i) => sum + (Number(i.taxTotal) || 0), 0);
      const inputTax = expenses.reduce((sum, e) => sum + (Number(e.taxAmount) || (Number(e.amount) * 0.1304)), 0);
      const netVat = outputTax - inputTax;

      document.getElementById("vat-sales-excl").textContent = formatCur(totalSalesExcl);
      document.getElementById("vat-output").textContent = formatCur(outputTax);
      document.getElementById("vat-input").textContent = formatCur(inputTax);
      document.getElementById("vat-net").textContent = formatCur(netVat);
    }

    // Modal helpers
    function openModal(id) { document.getElementById(id).classList.add("open"); }
    function closeModal(id) { document.getElementById(id).classList.remove("open"); }

    function openNewInvoiceModal() {
      const today = new Date().toISOString().split("T")[0];
      const due = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
      document.getElementById("inv-date").value = today;
      document.getElementById("inv-due-date").value = due;
      openModal("invoiceModal");
    }

    function openNewQuoteModal() {
      const today = new Date().toISOString().split("T")[0];
      const expiry = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
      document.getElementById("quote-date").value = today;
      document.getElementById("quote-expiry").value = expiry;
      openModal("quoteModal");
    }

    function openNewExpenseModal() {
      document.getElementById("exp-date").value = new Date().toISOString().split("T")[0];
      openModal("expenseModal");
    }

    function openNewClientModal() {
      openModal("clientModal");
    }

    // Form handlers
    function handleSaveInvoiceForm(e) {
      e.preventDefault();
      const clientId = document.getElementById("inv-client-select").value;
      const client = (state.clients || []).find(c => c.id === clientId);
      const date = document.getElementById("inv-date").value;
      const dueDate = document.getElementById("inv-due-date").value;
      const desc = document.getElementById("inv-item-desc").value;
      const qty = Number(document.getElementById("inv-qty").value) || 1;
      const unitPrice = Number(document.getElementById("inv-price").value) || 0;

      const subtotal = qty * unitPrice;
      const taxTotal = subtotal * 0.15;
      const grandTotal = subtotal + taxTotal;

      const newInv = {
        id: "inv_offline_" + Date.now(),
        invoiceNumber: "INV-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900),
        clientId: client ? client.id : "c1",
        clientName: client ? client.name : "Cash Client",
        clientEmail: client ? client.email : "",
        date,
        dueDate,
        items: [{ id: "li_" + Date.now(), description: desc, quantity: qty, unitPrice, taxRate: 15, total: grandTotal }],
        subtotal,
        taxTotal,
        grandTotal,
        paidAmount: 0,
        status: "issued",
        payments: [],
        notes: "Created in Fast-Books Standalone Desktop App"
      };

      state.invoices = [newInv, ...(state.invoices || [])];
      saveState();
      closeModal("invoiceModal");
      document.getElementById("invoiceForm").reset();
    }

    function handleSaveQuoteForm(e) {
      e.preventDefault();
      const clientId = document.getElementById("quote-client-select").value;
      const client = (state.clients || []).find(c => c.id === clientId);
      const date = document.getElementById("quote-date").value;
      const expiryDate = document.getElementById("quote-expiry").value;
      const desc = document.getElementById("quote-item-desc").value;
      const qty = Number(document.getElementById("quote-qty").value) || 1;
      const unitPrice = Number(document.getElementById("quote-price").value) || 0;

      const subtotal = qty * unitPrice;
      const taxTotal = subtotal * 0.15;
      const grandTotal = subtotal + taxTotal;

      const newQ = {
        id: "quote_offline_" + Date.now(),
        quoteNumber: "QTE-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900),
        clientId: client ? client.id : "c1",
        clientName: client ? client.name : "Client",
        clientEmail: client ? client.email : "",
        date,
        expiryDate,
        items: [{ id: "li_" + Date.now(), description: desc, quantity: qty, unitPrice, taxRate: 15, total: grandTotal }],
        subtotal,
        taxTotal,
        grandTotal,
        status: "sent"
      };

      state.quotations = [newQ, ...(state.quotations || [])];
      saveState();
      closeModal("quoteModal");
      document.getElementById("quoteForm").reset();
    }

    function handleSaveExpenseForm(e) {
      e.preventDefault();
      const title = document.getElementById("exp-title").value;
      const category = document.getElementById("exp-category").value;
      const vendor = document.getElementById("exp-vendor").value;
      const amount = Number(document.getElementById("exp-amount").value) || 0;
      const date = document.getElementById("exp-date").value;

      const newExp = {
        id: "exp_offline_" + Date.now(),
        title,
        category,
        vendor,
        amount,
        taxAmount: amount * (15 / 115),
        date,
        paymentMethod: "EFT"
      };

      state.expenses = [newExp, ...(state.expenses || [])];
      saveState();
      closeModal("expenseModal");
      document.getElementById("expenseForm").reset();
    }

    function handleSaveClientForm(e) {
      e.preventDefault();
      const name = document.getElementById("cl-name").value;
      const companyName = document.getElementById("cl-company").value;
      const email = document.getElementById("cl-email").value;
      const phone = document.getElementById("cl-phone").value;
      const taxNumber = document.getElementById("cl-tax").value;
      const address = document.getElementById("cl-address").value;

      const newCl = {
        id: "client_offline_" + Date.now(),
        name,
        companyName,
        email,
        phone,
        taxNumber,
        address
      };

      state.clients = [newCl, ...(state.clients || [])];
      saveState();
      closeModal("clientModal");
      document.getElementById("clientForm").reset();
    }

    function markInvoicePaid(id) {
      state.invoices = (state.invoices || []).map(inv => {
        if (inv.id === id) {
          const isPaid = inv.status === "paid";
          return {
            ...inv,
            status: isPaid ? "issued" : "paid",
            paidAmount: isPaid ? 0 : inv.grandTotal
          };
        }
        return inv;
      });
      saveState();
    }

    function convertQuoteToInvoice(quoteId) {
      const quote = (state.quotations || []).find(q => q.id === quoteId);
      if (!quote) return;

      const newInv = {
        id: "inv_from_quote_" + Date.now(),
        invoiceNumber: "INV-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900),
        quotationId: quote.id,
        clientId: quote.clientId,
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        items: quote.items,
        subtotal: quote.subtotal,
        taxTotal: quote.taxTotal,
        grandTotal: quote.grandTotal,
        paidAmount: 0,
        status: "issued"
      };

      state.invoices = [newInv, ...(state.invoices || [])];
      state.quotations = (state.quotations || []).map(q => q.id === quoteId ? { ...q, status: "converted" } : q);
      saveState();
      switchTab("invoices");
    }

    function deleteInvoice(id) {
      if (confirm("Delete this invoice?")) {
        state.invoices = (state.invoices || []).filter(i => i.id !== id);
        saveState();
      }
    }

    function deleteQuotation(id) {
      if (confirm("Delete this quotation?")) {
        state.quotations = (state.quotations || []).filter(q => q.id !== id);
        saveState();
      }
    }

    function deleteExpense(id) {
      if (confirm("Delete this expense?")) {
        state.expenses = (state.expenses || []).filter(e => e.id !== id);
        saveState();
      }
    }

    function deleteClient(id) {
      if (confirm("Delete this client?")) {
        state.clients = (state.clients || []).filter(c => c.id !== id);
        saveState();
      }
    }

    // Export & Import Database
    function exportCurrentDatabase() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "FastBooks_Desktop_Backup_" + new Date().toISOString().split("T")[0] + ".json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    function importDatabaseFromFile(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const imported = JSON.parse(e.target.result);
          state = { ...state, ...imported };
          saveState();
          alert("Database successfully imported and restored!");
        } catch (err) {
          alert("Error: Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    }

    function exportCSV(type) {
      let rows = [];
      let filename = "fastbooks_" + type;
      if (type === "invoices") {
        rows = (state.invoices || []).map(i => ({ Number: i.invoiceNumber, Client: i.clientName, Date: i.date, Total: i.grandTotal, Paid: i.paidAmount, Status: i.status }));
      } else if (type === "quotations") {
        rows = (state.quotations || []).map(q => ({ Number: q.quoteNumber, Client: q.clientName, Date: q.date, Total: q.grandTotal, Status: q.status }));
      } else if (type === "clients") {
        rows = (state.clients || []).map(c => ({ Name: c.name, Company: c.companyName, Email: c.email, Phone: c.phone, Tax: c.taxNumber }));
      }
      if (!rows.length) { alert("No records to export."); return; }
      
      const headers = Object.keys(rows[0]);
      const csv = [headers.join(","), ...rows.map(r => headers.map(h => '"' + (r[h] || '') + '"').join(","))].join("\\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename + ".csv";
      a.click();
      URL.revokeObjectURL(url);
    }

    // Initialize UI on load
    window.addEventListener("DOMContentLoaded", () => {
      renderApp();
    });
  </script>
</body>
</html>`;
}
