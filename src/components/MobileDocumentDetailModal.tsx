import React from "react";
import {
  ArrowRight,
  Printer,
  Share2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  Calendar,
  DollarSign,
  Building,
  CreditCard,
  Hash,
  Layers,
  X,
  Copy,
} from "lucide-react";
import { CurrencyCode, CurrencyInfo, Invoice, JournalEntry, Voucher } from "../types/erp";
import { formatMoney } from "../services/erpStorage";

export type DetailDocument =
  | { type: "INVOICE"; data: Invoice }
  | { type: "JOURNAL_ENTRY"; data: JournalEntry }
  | { type: "VOUCHER"; data: Voucher };

interface MobileDocumentDetailModalProps {
  document: DetailDocument | null;
  onClose: () => void;
  displayCurrency: CurrencyCode;
  currencies: CurrencyInfo[];
  onPrint?: (doc: DetailDocument) => void;
  onShare?: (doc: DetailDocument) => void;
  onApprove?: (doc: DetailDocument) => void;
}

export const MobileDocumentDetailModal: React.FC<MobileDocumentDetailModalProps> = ({
  document,
  onClose,
  displayCurrency,
  currencies,
  onPrint,
  onShare,
  onApprove,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!document) return null;

  const handleCopyNumber = (num: string) => {
    navigator.clipboard?.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. INVOICE DETAIL VIEW
  if (document.type === "INVOICE") {
    const inv = document.data;
    const isReturn = inv.type === "SALES_RETURN";

    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-fadeIn">
        {/* Top Bar matching Section 2.3 */}
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 flex items-center justify-center cursor-pointer transition-all border border-slate-700/60"
              aria-label="الرجوع"
              title="الرجوع"
            >
              <ArrowRight className="w-5 h-5 text-emerald-400" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-100 truncate">
                {isReturn ? "إشعار دائن / مرتجع مبيعات" : "فاتورة مبيعات معتمدة"}
              </h2>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <span>{inv.invoiceNumber}</span>
                <button
                  onClick={() => handleCopyNumber(inv.invoiceNumber)}
                  className="text-slate-500 hover:text-emerald-400"
                  title="نسخ رقم الفاتورة"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {copied && <span className="text-[10px] text-emerald-400 font-sans">تم النسخ</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                inv.status === "PAID"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : inv.status === "PARTIALLY_PAID"
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                  : "bg-amber-500/20 text-amber-400 border-amber-500/30"
              }`}
            >
              {inv.status === "PAID"
                ? "مسددة بالكامل"
                : inv.status === "PARTIALLY_PAID"
                ? "مسددة جزئياً"
                : "معلقة / قيد المراجعة"}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {/* Summary Hero Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-750 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">إجمالي قيمة الفاتورة</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {inv.currency || displayCurrency}
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              {formatMoney(inv.grandTotal, inv.currency || displayCurrency, currencies)}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">المدفوع نقداً/بنك:</span>
                <span className="font-mono font-bold text-cyan-300">
                  {formatMoney(inv.paidAmount || 0, inv.currency || displayCurrency, currencies)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">المتبقي (الذمة):</span>
                <span className="font-mono font-bold text-amber-400">
                  {formatMoney(inv.remainingAmount || 0, inv.currency || displayCurrency, currencies)}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                الطرف / العميل
              </span>
              <span className="font-bold text-slate-100">{inv.customerName || "عميل نقدي"}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                تاريخ الإصدار
              </span>
              <span className="font-mono text-slate-200">{inv.issueDate}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                طريقة السداد
              </span>
              <span className="font-medium text-slate-200">
                {inv.paymentMethod === "CASH"
                  ? "نقداً (الخزينة)"
                  : inv.paymentMethod === "CREDIT"
                  ? "آجل (ذمة مدينة)"
                  : inv.paymentMethod === "BANK_TRANSFER"
                  ? "تحويل مصرفي"
                  : "محفظة إلكترونية"}
              </span>
            </div>

            {inv.branchName && (
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  الفرع المصدر
                </span>
                <span className="font-medium text-slate-200">{inv.branchName}</span>
              </div>
            )}
          </div>

          {/* Line Items List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-300">
                بنود ومحتويات الفاتورة ({inv.items?.length || 0})
              </h3>
            </div>

            <div className="space-y-2">
              {inv.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>{item.itemName}</span>
                    <span className="font-mono text-emerald-400">
                      {formatMoney(item.total, inv.currency || displayCurrency, currencies)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>
                      {item.quantity} {item.unit || "قطعة"} × {item.unitPrice}
                    </span>
                    {Number(item.discount) > 0 && (
                      <span className="text-rose-400 font-sans">
                        خصم: {item.discount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes or Tax Breakdown if available */}
          {inv.notes && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 font-bold block text-[10px]">ملاحظات:</span>
              <p className="text-slate-300">{inv.notes}</p>
            </div>
          )}
        </div>

        {/* Sticky Action Buttons at the Bottom (Section 2.3) */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3.5 flex items-center gap-2">
          {onPrint && (
            <button
              onClick={() => onPrint(document)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs active:scale-95 transition-all shadow-md shadow-emerald-600/30 cursor-pointer min-h-[44px]"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة المستند</span>
            </button>
          )}

          {onShare && (
            <button
              onClick={() => onShare(document)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs active:scale-95 transition-all border border-slate-700 cursor-pointer min-h-[44px]"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>مشاركة</span>
            </button>
          )}

          {inv.status !== "PAID" && onApprove && (
            <button
              onClick={() => onApprove(document)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs active:scale-95 transition-all cursor-pointer min-h-[44px]"
              title="اعتماد وترحيل"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>اعتماد</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. JOURNAL ENTRY DETAIL VIEW
  if (document.type === "JOURNAL_ENTRY") {
    const entry = document.data;
    const isBalanced = Math.abs(Number(entry.totalDebit) - Number(entry.totalCredit)) < 0.01;

    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-fadeIn">
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 flex items-center justify-center cursor-pointer transition-all border border-slate-700/60"
            >
              <ArrowRight className="w-5 h-5 text-emerald-400" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-100 truncate">تفاصيل قيد اليومية</h2>
              <span className="text-[11px] text-slate-400 font-mono">{entry.entryNumber}</span>
            </div>
          </div>

          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              isBalanced
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/20 text-rose-400 border-rose-500/30"
            }`}
          >
            {isBalanced ? "✅ قيد متزن" : "⚠️ غير متزن"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">البيان / الشرح:</span>
              <span className="font-bold text-slate-100">{entry.description}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <span className="text-slate-400">تاريخ القيد:</span>
              <span className="font-mono text-slate-200">{entry.date}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <div>
                <span className="text-slate-400 text-[10px] block">إجمالي المدين:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatMoney(entry.totalDebit, entry.currency || displayCurrency, currencies)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">إجمالي الدائن:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {formatMoney(entry.totalCredit, entry.currency || displayCurrency, currencies)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300">أطراف وحسابات القيد ({entry.lines?.length || 0})</h3>
            <div className="space-y-2">
              {entry.lines?.map((line, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-200">{line.accountNameAr}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{line.accountCode}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                    <span className={Number(line.debit) > 0 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                      مدين: {line.debit || 0}
                    </span>
                    <span className={Number(line.credit) > 0 ? "text-cyan-400 font-bold" : "text-slate-500"}>
                      دائن: {line.credit || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3.5 flex items-center gap-2">
          {onPrint && (
            <button
              onClick={() => onPrint(document)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs min-h-[44px]"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة سند القيد</span>
            </button>
          )}
          {onShare && (
            <button
              onClick={() => onShare(document)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs min-h-[44px]"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>مشاركة</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. VOUCHER DETAIL VIEW
  if (document.type === "VOUCHER") {
    const voucher = document.data;
    const isPayment = voucher.type === "PAYMENT";

    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-fadeIn">
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 flex items-center justify-center cursor-pointer transition-all border border-slate-700/60"
            >
              <ArrowRight className="w-5 h-5 text-emerald-400" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-100 truncate">
                {isPayment ? "سند صرف نقد / بنك" : "سند قبض مالي"}
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">{voucher.voucherNumber}</span>
            </div>
          </div>

          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              isPayment
                ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            }`}
          >
            {isPayment ? "سند صرف" : "سند قبض"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs text-slate-400">مبلغ السند:</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {formatMoney(voucher.amount, voucher.currency || displayCurrency, currencies)}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">المستفيد / الدافع:</span>
              <span className="font-bold text-slate-100">{voucher.partyName || "جهة غير محددة"}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">التاريخ:</span>
              <span className="font-mono text-slate-200">{voucher.date}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">البيان:</span>
              <span className="font-medium text-slate-200">{voucher.description}</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3.5 flex items-center gap-2">
          {onPrint && (
            <button
              onClick={() => onPrint(document)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs min-h-[44px]"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة السند</span>
            </button>
          )}
          {onShare && (
            <button
              onClick={() => onShare(document)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs min-h-[44px]"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>مشاركة</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};
