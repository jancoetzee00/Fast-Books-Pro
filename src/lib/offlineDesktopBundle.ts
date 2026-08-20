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
} from "../types";

export interface OfflineBundlePayload {
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
 * Generates an interactive, zero-dependency, self-contained single-file HTML/JS/CSS application
 * that runs completely offline on any Windows, macOS, or Linux desktop without needing an internet connection.
 */
export function generateOfflineDesktopHTML(payload: OfflineBundlePayload): string {
  const sanitizedJSON = JSON.stringify(payload).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
  const businessName = payload.profile?.businessName || "Fast-Books PRO";
  const ownerName = payload.profile?.ownerName || "Jan Coetzee";
  const currencySymbol = payload.profile?.currencySymbol || "R";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fast-Books PRO - Offline Desktop Accounting Suite (${businessName})</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --card-border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #4f46e5;
      --primary-hover: #4338ca;
      --emerald: #10b981;
      --amber: #f59e0b;
      --rose: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: var(--bg); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; }
    header { background: #0b1120; border-bottom: 1px solid #1e293b; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .logo-badge { background: #4f46e5; color: white; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; }
    .nav-tabs { display: flex; gap: 8px; }
    .tab-btn { background: transparent; border: none; color: var(--text-muted); padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px; transition: all 0.2s; }
    .tab-btn:hover { color: white; background: rgba(255,255,255,0.05); }
    .tab-btn.active { color: white; background: #312e81; border: 1px solid #4338ca; }
    main { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: 24px; }
    .card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .kpi-card { background: #182234; border: 1px solid #334155; border-radius: 14px; padding: 20px; }
    .kpi-title { font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; }
    .kpi-value { font-size: 26px; font-weight: 800; margin-top: 6px; }
    .table-container { overflow-x: auto; margin-top: 16px; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
    th { background: #131d2e; color: #94a3b8; padding: 12px 16px; font-size: 11px; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #334155; }
    td { padding: 14px 16px; border-bottom: 1px solid #1e293b; }
    tr:hover td { background: rgba(255,255,255,0.02); }
    .btn { background: var(--primary); color: white; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; transition: background 0.2s; display: inline-flex; align-items: center; gap: 6px; }
    .btn:hover { background: var(--primary-hover); }
    .btn-secondary { background: #334155; color: white; }
    .btn-secondary:hover { background: #475569; }
    .btn-emerald { background: #059669; }
    .btn-emerald:hover { background: #047857; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
    .badge-paid { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-unpaid { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-cat { background: rgba(79, 70, 229, 0.2); color: #818cf8; border: 1px solid rgba(79, 70, 229, 0.3); }
    .banner { background: linear-gradient(135deg, #1e1b4b, #0f172a); border: 1px solid #3730a3; border-radius: 16px; padding: 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .status-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; box-shadow: 0 0 8px #10b981; }
    .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); align-items: center; justify-content: center; z-index: 999; }
    .modal-content { background: #1e293b; border: 1px solid #475569; border-radius: 16px; width: 100%; max-width: 500px; padding: 24px; }
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px; }
    .form-control { width: 100%; background: #0f172a; border: 1px solid #334155; color: white; padding: 10px 14px; border-radius: 8px; font-size: 13px; }
    .form-control:focus { outline: none; border-color: #6366f1; }
    .ai-pill { background: rgba(99, 102, 241, 0.15); border: 1px solid #6366f1; color: #a5b4fc; padding: 8px 12px; border-radius: 8px; font-size: 12px; margin-top: 8px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; }
    .batch-bar { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #182234; border: 1px solid #4f46e5; border-radius: 14px; padding: 12px 24px; display: none; align-items: center; gap: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 100; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="logo-badge">FB</div>
      <div>
        <h2 style="font-size: 16px; font-weight: 800;">Fast-Books PRO <span style="font-size: 10px; background: #064e3b; color: #34d399; padding: 2px 6px; border-radius: 4px; border: 1px solid #059669;">OFFLINE DESKTOP</span></h2>
        <p style="font-size: 11px; color: #94a3b8;">${businessName} • Proprietor: ${ownerName}</p>
      </div>
    </div>
    <div class="nav-tabs">
      <button class="tab-btn active" onclick="switchTab('dashboard')">Dashboard</button>
      <button class="tab-btn" onclick="switchTab('invoices')">Invoices</button>
      <button class="tab-btn" onclick="switchTab('expenses')">Expenses</button>
      <button class="tab-btn" onclick="switchTab('bank')">Bank Recon</button>
      <button class="tab-btn" onclick="switchTab('backup')">Local Sync</button>
    </div>
  </header>

  <main id="app-content">
    <!-- Rendered via Javascript from offline payload -->
  </main>

  <div id="batch-action-bar" class="batch-bar">
    <span id="batch-selected-count" style="font-weight: 700; font-size: 13px;">0 items selected</span>
    <button class="btn btn-emerald" onclick="executeBatchReconcile(true)">Approve Selected</button>
    <button class="btn btn-secondary" onclick="executeBatchReconcile(false)">Undo Recon</button>
    <button class="btn" style="background:#dc2626;" onclick="executeBatchDelete()">Delete Selected</button>
  </div>

  <!-- New Expense Modal -->
  <div id="modal-expense" class="modal">
    <div class="modal-content">
      <h3 style="font-size: 16px; margin-bottom: 16px; font-weight: 800;">Record New Business Expense</h3>
      <form onsubmit="handleSaveOfflineExpense(event)">
        <div class="form-group">
          <label>Expense Title / Description</label>
          <input type="text" id="exp-title" class="form-control" placeholder="e.g. Uber to client / Makro office stationery / Fibre internet" oninput="runOfflineExpenseClassifier()" required />
        </div>
        <div id="ai-suggestion-box" style="display:none;" class="ai-pill" onclick="applyOfflineCategorySuggestion()">
          <span>✨ AI Category Suggestion: <strong id="ai-suggested-label">Office Supplies</strong></span>
          <span style="font-size: 10px; background: #4f46e5; color: white; padding: 2px 6px; border-radius: 4px;">1-Click Apply</span>
        </div>
        <div class="form-group" style="margin-top: 10px;">
          <label>Category</label>
          <select id="exp-category" class="form-control">
            <option value="Office Supplies">Office Supplies</option>
            <option value="Utilities">Utilities & Connectivity</option>
            <option value="Travel">Travel & Transport</option>
            <option value="Vehicle & Petrol">Vehicle & Petrol</option>
            <option value="Software & Cloud">Software & Cloud</option>
            <option value="Rent & Property">Rent & Property</option>
            <option value="Professional Fees">Professional Fees</option>
            <option value="Marketing & Ads">Marketing & Advertising</option>
            <option value="Operating Expenses">Operating Expenses</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Vendor / Payee</label>
          <input type="text" id="exp-vendor" class="form-control" placeholder="e.g. Makro, Vodacom, Uber" />
        </div>
        <div class="form-group">
          <label>Amount (${currencySymbol})</label>
          <input type="number" step="0.01" id="exp-amount" class="form-control" placeholder="0.00" required />
        </div>
        <div class="form-group">
          <label>Date</label>
          <input type="date" id="exp-date" class="form-control" required />
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('modal-expense')">Cancel</button>
          <button type="submit" class="btn">Save Expense</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    // Embedded Live Database Payload
    const INITIAL_PAYLOAD = ${sanitizedJSON};
    const STORAGE_KEY = "fastbooks_offline_desktop_db_v1";

    function loadDatabase() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch(e) {}
      return INITIAL_PAYLOAD;
    }

    function saveDatabase(data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.db = data;
    }

    window.db = loadDatabase();
    let currentTab = "dashboard";
    let selectedTxIds = new Set();
    let pendingSuggestedCat = "Operating Expenses";

    function formatRands(amt) {
      return "${currencySymbol} " + Number(amt || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function switchTab(tab) {
      currentTab = tab;
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      event.target.classList.add("active");
      render();
    }

    function runOfflineExpenseClassifier() {
      const text = (document.getElementById("exp-title").value || "").toLowerCase();
      let cat = "Operating Expenses";
      let reason = "Standard business operation";

      if (/\\b(uber|bolt|flight|flysafair|hotel|airbnb|gautrain|avis|toll)\\b/.test(text)) {
        cat = "Travel";
      } else if (/\\b(eskom|electricity|water|fibre|wifi|broadband|vodacom|mtn|telkom|city of)\\b/.test(text)) {
        cat = "Utilities";
      } else if (/\\b(stationery|paper|ink|toner|pen|notebook|makro|waltons|office)\\b/.test(text)) {
        cat = "Office Supplies";
      } else if (/\\b(engen|shell|bp|caltex|sasol|petrol|diesel|fuel|tyre|service)\\b/.test(text)) {
        cat = "Vehicle & Petrol";
      } else if (/\\b(google|microsoft|aws|cloud|github|figma|adobe|zoom|chatgpt|domain)\\b/.test(text)) {
        cat = "Software & Cloud";
      }

      pendingSuggestedCat = cat;
      const box = document.getElementById("ai-suggestion-box");
      const label = document.getElementById("ai-suggested-label");
      if (text.length > 2) {
        box.style.display = "flex";
        label.innerText = cat;
      } else {
        box.style.display = "none";
      }
    }

    function applyOfflineCategorySuggestion() {
      document.getElementById("exp-category").value = pendingSuggestedCat;
      document.getElementById("ai-suggestion-box").style.display = "none";
    }

    function openNewExpenseModal() {
      document.getElementById("exp-title").value = "";
      document.getElementById("exp-vendor").value = "";
      document.getElementById("exp-amount").value = "";
      document.getElementById("exp-date").value = new Date().toISOString().split("T")[0];
      document.getElementById("ai-suggestion-box").style.display = "none";
      document.getElementById("modal-expense").style.display = "flex";
    }

    function closeModal(id) {
      document.getElementById(id).style.display = "none";
    }

    function handleSaveOfflineExpense(e) {
      e.preventDefault();
      const title = document.getElementById("exp-title").value;
      const category = document.getElementById("exp-category").value;
      const vendor = document.getElementById("exp-vendor").value || "General Vendor";
      const amount = parseFloat(document.getElementById("exp-amount").value);
      const date = document.getElementById("exp-date").value;

      const newExp = {
        id: "exp_off_" + Date.now(),
        title,
        category,
        vendor,
        amount,
        taxAmount: amount * (15 / 115),
        date,
        isPaid: true
      };

      window.db.expenses = [newExp, ...(window.db.expenses || [])];
      saveDatabase(window.db);
      closeModal("modal-expense");
      render();
    }

    function toggleTxSelection(txId) {
      if (selectedTxIds.has(txId)) selectedTxIds.delete(txId);
      else selectedTxIds.add(txId);
      updateBatchBar();
    }

    function toggleSelectAllTx() {
      const txs = window.db.bankTransactions || [];
      if (selectedTxIds.size === txs.length) selectedTxIds.clear();
      else txs.forEach(t => selectedTxIds.add(t.id));
      updateBatchBar();
      render();
    }

    function updateBatchBar() {
      const bar = document.getElementById("batch-action-bar");
      const countEl = document.getElementById("batch-selected-count");
      if (selectedTxIds.size > 0) {
        bar.style.display = "flex";
        countEl.innerText = selectedTxIds.size + " transaction(s) selected";
      } else {
        bar.style.display = "none";
      }
    }

    function executeBatchReconcile(reconciled) {
      window.db.bankTransactions = (window.db.bankTransactions || []).map(t => {
        if (selectedTxIds.has(t.id)) {
          return { ...t, isReconciled: reconciled };
        }
        return t;
      });
      selectedTxIds.clear();
      saveDatabase(window.db);
      updateBatchBar();
      render();
    }

    function executeBatchDelete() {
      if (!confirm("Delete " + selectedTxIds.size + " selected transaction(s)?")) return;
      window.db.bankTransactions = (window.db.bankTransactions || []).filter(t => !selectedTxIds.has(t.id));
      selectedTxIds.clear();
      saveDatabase(window.db);
      updateBatchBar();
      render();
    }

    function exportBackupJSONFile() {
      const str = JSON.stringify(window.db, null, 2);
      const blob = new Blob([str], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "FastBooks_Desktop_Backup_" + new Date().toISOString().split("T")[0] + ".json";
      a.click();
      URL.revokeObjectURL(url);
    }

    function render() {
      const container = document.getElementById("app-content");
      const invs = window.db.invoices || [];
      const exps = window.db.expenses || [];
      const txs = window.db.bankTransactions || [];

      const totalRevenue = invs.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
      const totalExpense = exps.reduce((sum, e) => sum + (e.amount || 0), 0);
      const netProfit = totalRevenue - totalExpense;
      const unreconciledCount = txs.filter(t => !t.isReconciled).length;

      if (currentTab === "dashboard") {
        container.innerHTML = \`
          <div class="banner">
            <div>
              <div style="display:flex; align-items:center; gap:8px; margin-bottom: 6px;">
                <span class="status-dot"></span>
                <span style="font-size:11px; font-weight:700; color:#34d399; text-transform:uppercase;">Local Desktop Storage Active</span>
              </div>
              <h1 style="font-size: 24px; font-weight: 800;">Fast-Books Standalone Desktop App</h1>
              <p style="color: #cbd5e1; font-size: 13px; margin-top: 4px;">All records saved securely in your browser's persistent desktop sandbox.</p>
            </div>
            <button class="btn btn-emerald" onclick="openNewExpenseModal()">+ Record Expense</button>
          </div>

          <div class="grid-4">
            <div class="kpi-card">
              <div class="kpi-title">Collected Revenue</div>
              <div class="kpi-value" style="color: #34d399;">\${formatRands(totalRevenue)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Total Business Expenses</div>
              <div class="kpi-value" style="color: #f87171;">\${formatRands(totalExpense)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Net Operating Profit</div>
              <div class="kpi-value" style="color: #818cf8;">\${formatRands(netProfit)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Unreconciled Bank Items</div>
              <div class="kpi-value" style="color: #fbbf24;">\${unreconciledCount}</div>
            </div>
          </div>

          <div class="card">
            <h3 style="font-size: 15px; font-weight: 800; margin-bottom: 12px;">Recent Business Expenses</h3>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Vendor</th>
                    <th>Category</th>
                    <th style="text-align:right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  \${exps.length === 0 ? '<tr><td colspan="5" style="text-align:center; color:#64748b;">No expenses recorded yet.</td></tr>' : exps.slice(0, 5).map(e => \`
                    <tr>
                      <td>\${e.date}</td>
                      <td style="font-weight:700;">\${e.title}</td>
                      <td>\${e.vendor}</td>
                      <td><span class="badge badge-cat">\${e.category}</span></td>
                      <td style="text-align:right; font-weight:800;">\${formatRands(e.amount)}</td>
                    </tr>
                  \`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        \`;
      } else if (currentTab === "expenses") {
        container.innerHTML = \`
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <h2 style="font-size: 20px; font-weight: 800;">Business Expenses & Supplier Invoices</h2>
            <button class="btn btn-emerald" onclick="openNewExpenseModal()">+ Record Expense</button>
          </div>
          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Vendor</th>
                    <th>Category</th>
                    <th style="text-align:right;">Amount</th>
                    <th style="text-align:right;">VAT (15%)</th>
                  </tr>
                </thead>
                <tbody>
                  \${exps.length === 0 ? '<tr><td colspan="6" style="text-align:center; color:#64748b;">No expenses recorded.</td></tr>' : exps.map(e => \`
                    <tr>
                      <td>\${e.date}</td>
                      <td style="font-weight:700;">\${e.title}</td>
                      <td>\${e.vendor}</td>
                      <td><span class="badge badge-cat">\${e.category}</span></td>
                      <td style="text-align:right; font-weight:800;">\${formatRands(e.amount)}</td>
                      <td style="text-align:right; color:#94a3b8;">\${formatRands(e.taxAmount)}</td>
                    </tr>
                  \`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        \`;
      } else if (currentTab === "bank") {
        container.innerHTML = \`
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <div>
              <h2 style="font-size: 20px; font-weight: 800;">Bank Statement Feeds & Reconciliation</h2>
              <p style="font-size:12px; color:#94a3b8;">Select multiple transactions below to batch reconcile, tag, or delete.</p>
            </div>
            <button class="btn btn-secondary" onclick="toggleSelectAllTx()">Select All / None</button>
          </div>
          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th style="width: 40px;"><input type="checkbox" onchange="toggleSelectAllTx()" \${selectedTxIds.size > 0 && selectedTxIds.size === txs.length ? 'checked' : ''} /></th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Reference</th>
                    <th style="text-align:right;">Amount</th>
                    <th>Status</th>
                    <th style="text-align:right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  \${txs.length === 0 ? '<tr><td colspan="7" style="text-align:center; color:#64748b;">No bank statement transactions.</td></tr>' : txs.map(t => \`
                    <tr style="\${selectedTxIds.has(t.id) ? 'background: rgba(79,70,229,0.1);' : ''}">
                      <td><input type="checkbox" \${selectedTxIds.has(t.id) ? 'checked' : ''} onchange="toggleTxSelection('\${t.id}')" /></td>
                      <td>\${t.date}</td>
                      <td style="font-weight:700;">\${t.description}</td>
                      <td style="font-family:monospace; color:#94a3b8;">\${t.reference}</td>
                      <td style="text-align:right; font-weight:800; color:\${t.amount > 0 ? '#34d399' : '#f87171'};">\${formatRands(t.amount)}</td>
                      <td><span class="badge \${t.isReconciled ? 'badge-paid' : 'badge-unpaid'}">\${t.isReconciled ? 'Reconciled' : 'Unreconciled'}</span></td>
                      <td style="text-align:right;">
                        <button class="btn btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="window.db.bankTransactions.find(x => x.id === '\${t.id}').isReconciled = !\${t.isReconciled}; saveDatabase(window.db); render();">
                          \${t.isReconciled ? 'Undo Recon' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  \`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        \`;
      } else if (currentTab === "invoices") {
        container.innerHTML = \`
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px;">Tax Invoices & Billing</h2>
          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Client</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th style="text-align:right;">Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  \${invs.length === 0 ? '<tr><td colspan="6" style="text-align:center; color:#64748b;">No invoices issued yet.</td></tr>' : invs.map(i => \`
                    <tr>
                      <td style="font-weight:800; font-family:monospace; color:#818cf8;">\${i.invoiceNumber}</td>
                      <td style="font-weight:700;">\${i.clientName}</td>
                      <td>\${i.date}</td>
                      <td>\${i.dueDate}</td>
                      <td style="text-align:right; font-weight:800;">\${formatRands(i.grandTotal)}</td>
                      <td><span class="badge \${i.status === 'paid' ? 'badge-paid' : 'badge-unpaid'}">\${i.status.toUpperCase()}</span></td>
                    </tr>
                  \`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        \`;
      } else if (currentTab === "backup") {
        container.innerHTML = \`
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px;">Local Database Synchronization</h2>
          <div class="card" style="max-width: 600px;">
            <p style="color:#cbd5e1; font-size:13px; line-height:1.6; margin-bottom:16px;">
              You are running the self-contained Fast-Books Standalone Desktop App. Export your updated database anytime to share or backup.
            </p>
            <button class="btn btn-emerald" onclick="exportBackupJSONFile()">Export Updated Backup (.json)</button>
          </div>
        \`;
      }
    }

    render();
  </script>
</body>
</html>`;
}

/**
 * Triggers the download of the standalone offline desktop app bundle
 */
export function downloadOfflineDesktopApp(payload: OfflineBundlePayload) {
  const htmlContent = generateOfflineDesktopHTML(payload);
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `FastBooks_Desktop_Standalone_${dateStr}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
