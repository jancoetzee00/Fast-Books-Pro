import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import { Invoice, Client, LineItem, BusinessProfile } from "../../types";
import { formatCurrency } from "../../lib/storage";

interface InvoiceEditorModalProps {
  initialInvoice?: Invoice | null;
  clients: Client[];
  profile: BusinessProfile;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
}

export const InvoiceEditorModal: React.FC<InvoiceEditorModalProps> = ({
  initialInvoice,
  clients,
  profile,
  onClose,
  onSave,
}) => {
  const isEditing = !!initialInvoice;

  const [clientId, setClientId] = useState<string>(
    initialInvoice?.clientId || (clients[0]?.id || "")
  );
  const selectedClient = clients.find((c) => c.id === clientId);

  const [clientName, setClientName] = useState(
    initialInvoice?.clientName || (selectedClient?.name || "")
  );
  const [clientEmail, setClientEmail] = useState(
    initialInvoice?.clientEmail || (selectedClient?.email || "")
  );

  const [invoiceNumber, setInvoiceNumber] = useState(
    initialInvoice?.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [date, setDate] = useState(
    initialInvoice?.date || new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(
    initialInvoice?.dueDate ||
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  const [items, setItems] = useState<LineItem[]>(
    initialInvoice?.items || [
      {
        id: "li_inv_1",
        description: "Services Rendered / Products Supplied",
        quantity: 1,
        unitPrice: 5000,
        taxRate: profile.defaultTaxRate,
        discount: 0,
        total: 5750,
      },
    ]
  );

  const [notes, setNotes] = useState(
    initialInvoice?.notes || "Thank you for your business."
  );
  const [terms, setTerms] = useState(
    initialInvoice?.terms || profile.invoiceTerms
  );

  const handleClientChange = (id: string) => {
    setClientId(id);
    const c = clients.find((item) => item.id === id);
    if (c) {
      setClientName(c.name);
      setClientEmail(c.email);
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof LineItem,
    value: any
  ) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const tax = Number(item.taxRate) || 0;
    const disc = Number(item.discount) || 0;

    const baseAmount = qty * price;
    const discountAmount = baseAmount * (disc / 100);
    const taxableAmount = baseAmount - discountAmount;
    const taxAmount = taxableAmount * (tax / 100);

    item.total = taxableAmount + taxAmount;
    updated[index] = item;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `li_${Date.now()}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: profile.defaultTaxRate,
        discount: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => {
    const base = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    const disc = base * ((Number(item.discount) || 0) / 100);
    return sum + (base - disc);
  }, 0);

  const taxTotal = items.reduce((sum, item) => {
    const base = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    const disc = base * ((Number(item.discount) || 0) / 100);
    const taxable = base - disc;
    return sum + taxable * ((Number(item.taxRate) || 0) / 100);
  }, 0);

  const grandTotal = subtotal + taxTotal;

  const handleSaveInvoice = () => {
    if (!clientName) return;

    const newInvoice: Invoice = {
      id: initialInvoice?.id || `inv_${Date.now()}`,
      invoiceNumber,
      quotationId: initialInvoice?.quotationId,
      clientId: clientId || "cli_custom",
      clientName,
      clientEmail,
      date,
      dueDate,
      items,
      subtotal,
      taxTotal,
      grandTotal,
      paidAmount: initialInvoice?.paidAmount || 0,
      status: initialInvoice?.status || "issued",
      payments: initialInvoice?.payments || [],
      notes,
      terms,
      createdAt: initialInvoice?.createdAt || new Date().toISOString(),
    };

    onSave(newInvoice);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold">
              {isEditing ? "Edit Tax Invoice" : "Create Tax Invoice"}
            </h2>
            <p className="text-xs text-slate-400">
              Fast-Books Invoice Management for {profile.ownerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Select Client
              </label>
              <select
                value={clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.companyName ? `(${c.companyName})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Client Contact Email
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Invoice Line Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200 flex items-center gap-1 hover:bg-emerald-100 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-[11px] font-bold uppercase">
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 w-20">Qty</th>
                    <th className="py-2 px-3 w-28">Unit Price ({profile.currencySymbol})</th>
                    <th className="py-2 px-3 w-24">Tax %</th>
                    <th className="py-2 px-3 w-24">Disc %</th>
                    <th className="py-2 px-3 w-28 text-right">Total</th>
                    <th className="py-2 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(index, "description", e.target.value)
                          }
                          className="w-full p-1.5 border border-slate-300 rounded text-xs"
                          placeholder="Item description..."
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          className="w-full p-1.5 border border-slate-300 rounded text-xs text-center"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(index, "unitPrice", e.target.value)
                          }
                          className="w-full p-1.5 border border-slate-300 rounded text-xs text-right"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.taxRate}
                          onChange={(e) =>
                            handleItemChange(index, "taxRate", e.target.value)
                          }
                          className="w-full p-1.5 border border-slate-300 rounded text-xs text-center"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) =>
                            handleItemChange(index, "discount", e.target.value)
                          }
                          className="w-full p-1.5 border border-slate-300 rounded text-xs text-center"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {formatCurrency(item.total, profile.currencySymbol)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-full sm:w-72 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal, profile.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>VAT / Tax Total ({profile.defaultTaxRate}%):</span>
                <span>{formatCurrency(taxTotal, profile.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-300">
                <span>Grand Total:</span>
                <span className="text-emerald-700">
                  {formatCurrency(grandTotal, profile.currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Invoice Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Payment Terms & Bank Reference
              </label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-medium text-xs hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveInvoice}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
