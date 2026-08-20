import React from "react";
import { X, Printer, Download, CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { Vat201Return, BusinessProfile, SarsComplianceProfile } from "../../types";
import { formatCurrency } from "../../lib/storage";

interface Vat201PrintModalProps {
  vatReturn: Vat201Return;
  profile: BusinessProfile;
  sarsProfile: SarsComplianceProfile;
  onClose: () => void;
}

export const Vat201PrintModal: React.FC<Vat201PrintModalProps> = ({
  vatReturn,
  profile,
  sarsProfile,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const isRefund = vatReturn.netVatPayable < 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Official SARS VAT201 Return Declaration</h2>
              <span className="text-[11px] text-slate-400">Period: {vatReturn.periodName} • VAT #{sarsProfile.vatRegistrationNumber}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print VAT201</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official SARS Form Content */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-slate-800 font-sans print:p-2 print:overflow-visible">
          {/* Official SARS Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-slate-900">SARS</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-bold border border-slate-300">
                  VAT201
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mt-0.5">
                South African Revenue Service • Value-Added Tax Return
              </p>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-[11px] font-mono block text-slate-500 uppercase">Payment Reference Number (PRN)</span>
              <strong className="text-xs font-mono text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200 inline-block mt-0.5">
                {vatReturn.sarsPrn}
              </strong>
            </div>
          </div>

          {/* Vendor Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Registered Vendor / Trading Entity:</span>
                <strong className="text-slate-900 text-sm">{sarsProfile.registeredName || profile.companyName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Trading Name:</span>
                <span className="text-slate-800">{sarsProfile.tradeName || profile.tradingName || profile.companyName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Physical Address:</span>
                <span className="text-slate-800">{profile.address}</span>
              </div>
            </div>

            <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">VAT Registration No:</span>
                  <strong className="font-mono text-slate-900 text-sm">{sarsProfile.vatRegistrationNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Income Tax No:</span>
                  <span className="font-mono text-slate-800">{sarsProfile.incomeTaxNumber}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">VAT Tax Period:</span>
                  <strong className="text-slate-900">{vatReturn.periodName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Filing Due Date:</span>
                  <strong className="text-rose-700">{vatReturn.filingDueDate}</strong>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Tax Period Dates:</span>
                <span className="text-slate-700 font-mono text-[11px]">{vatReturn.startDate} to {vatReturn.endDate}</span>
              </div>
            </div>
          </div>

          {/* PART A: CALCULATION OF OUTPUT TAX */}
          <div className="space-y-2">
            <div className="bg-slate-800 text-white px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span>Part A: Calculation of Output Tax (Supplies Made)</span>
              <span>Rate (15%)</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs divide-y divide-slate-200">
              <div className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                <div>
                  <strong className="font-bold text-slate-900 block">Field 1: Standard Rate Supplies (Excluding VAT)</strong>
                  <span className="text-[11px] text-slate-500">Taxable turnover from customer sales invoices</span>
                </div>
                <div className="font-mono text-slate-900 font-bold">
                  {formatCurrency(vatReturn.standardRateSalesExcl, profile.currencySymbol)}
                </div>
              </div>

              <div className="p-3 flex items-center justify-between bg-slate-50 font-semibold">
                <div>
                  <strong className="text-indigo-950 block">Field 1A: Output Tax on Standard Rate Supplies</strong>
                  <span className="text-[11px] text-slate-500">15% VAT charged to clients</span>
                </div>
                <div className="font-mono text-indigo-950 font-bold">
                  {formatCurrency(vatReturn.outputVatStandardRate, profile.currencySymbol)}
                </div>
              </div>

              <div className="p-3 flex items-center justify-between bg-white">
                <div>
                  <span className="text-slate-700 font-medium">Field 2: Zero-Rated Supplies</span>
                  <span className="text-[11px] text-slate-400 block">Exports & designated zero-rated supplies</span>
                </div>
                <div className="font-mono text-slate-500">
                  {formatCurrency(vatReturn.zeroRatedSupplies || 0, profile.currencySymbol)}
                </div>
              </div>

              <div className="p-3 flex items-center justify-between bg-white">
                <div>
                  <span className="text-slate-700 font-medium">Field 3: Exempt Supplies</span>
                  <span className="text-[11px] text-slate-400 block">Financial services, residential accommodation</span>
                </div>
                <div className="font-mono text-slate-500">
                  {formatCurrency(vatReturn.exemptSupplies || 0, profile.currencySymbol)}
                </div>
              </div>

              <div className="p-3 flex items-center justify-between bg-indigo-50/80 border-t-2 border-indigo-200 font-bold text-xs sm:text-sm">
                <div>
                  <strong className="text-indigo-950">Field 4 / 4A: TOTAL OUTPUT TAX</strong>
                </div>
                <div className="font-mono text-indigo-950 text-sm sm:text-base">
                  {formatCurrency(vatReturn.totalOutputTax, profile.currencySymbol)}
                </div>
              </div>
            </div>
          </div>

          {/* PART B: CALCULATION OF INPUT TAX */}
          <div className="space-y-2">
            <div className="bg-slate-800 text-white px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span>Part B: Calculation of Input Tax (Goods & Services Acquired)</span>
              <span>Claimable (15%)</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs divide-y divide-slate-200">
              <div className="p-3 flex items-center justify-between bg-white">
                <div>
                  <span className="text-slate-700 font-medium">Field 14 / 14A: Capital Goods & Services (Including VAT)</span>
                  <span className="text-[11px] text-slate-400 block">Plant, machinery, vehicles, office equipment</span>
                </div>
                <div className="font-mono text-slate-500">
                  {formatCurrency(vatReturn.capitalGoodsInputTax || 0, profile.currencySymbol)}
                </div>
              </div>

              <div className="p-3 flex items-center justify-between bg-white">
                <div>
                  <strong className="font-bold text-slate-900 block">Field 15: Standard Rate Operating Expenses (Excl. VAT)</strong>
                  <span className="text-[11px] text-slate-500">Purchases, stock, spares, utilities & software</span>
                </div>
                <div className="font-mono text-slate-900 font-bold">
                  {formatCurrency(vatReturn.standardRateExpensesExcl, profile.currencySymbol)}
                </div>
              </div>

              <div className="p-3 flex items-center justify-between bg-slate-50 font-semibold">
                <div>
                  <strong className="text-emerald-950 block">Field 15A: Input Tax on Standard Rate Goods & Services</strong>
                  <span className="text-[11px] text-slate-500">15% VAT paid on allowable business expenses</span>
                </div>
                <div className="font-mono text-emerald-950 font-bold">
                  {formatCurrency(vatReturn.inputVatStandardRate, profile.currencySymbol)}
                </div>
              </div>

              <div className="p-3 flex items-center justify-between bg-emerald-50/80 border-t-2 border-emerald-200 font-bold text-xs sm:text-sm">
                <div>
                  <strong className="text-emerald-950">Field 19: TOTAL INPUT TAX</strong>
                </div>
                <div className="font-mono text-emerald-950 text-sm sm:text-base">
                  {formatCurrency(vatReturn.totalInputTax, profile.currencySymbol)}
                </div>
              </div>
            </div>
          </div>

          {/* PART C: NET VAT CALCULATION */}
          <div className="p-4 rounded-xl border-2 border-slate-900 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                Field 20: Net VAT Calculation (Field 4A minus Field 19)
              </span>
              <h3 className="text-lg sm:text-xl font-black mt-0.5">
                {isRefund ? "NET VAT REFUND CLAIMABLE FROM SARS" : "NET VAT AMOUNT PAYABLE TO SARS"}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {isRefund
                  ? "Input tax exceeded output tax. SARS will process refund upon audit assessment."
                  : `Payable via SARS eFiling or EFT on or before ${vatReturn.paymentDueDate}.`}
              </p>
            </div>

            <div className="text-right bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Final Position</span>
              <strong className={`text-xl sm:text-2xl font-black font-mono ${isRefund ? "text-emerald-400" : "text-amber-400"}`}>
                {formatCurrency(Math.abs(vatReturn.netVatPayable), profile.currencySymbol)}
              </strong>
            </div>
          </div>

          {/* SARS Declaration & Sign-off Section */}
          <div className="border-t border-slate-300 pt-4 space-y-3 text-[11px] text-slate-600">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <strong className="text-slate-900 block font-bold">Taxpayer / Public Officer Declaration:</strong>
              <p>
                I declare that the information furnished in this return is true and correct and that the amounts reflected herein represent the total taxable supplies and allowable input deductions for the period specified in terms of the Value-Added Tax Act, 1991.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Authorised Signatory / Representative:</span>
                <span className="font-bold text-slate-900">{profile.ownerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Status on SARS eFiling:</span>
                <span className="font-bold text-slate-900 uppercase">{vatReturn.status.replace("_", " ")}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Generation Timestamp:</span>
                <span className="font-mono text-slate-800">{new Date().toLocaleString("en-ZA")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between print:hidden">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SARS Compliant 15% VAT Return Record</span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Form</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
