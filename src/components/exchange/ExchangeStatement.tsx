import React, { useState, useMemo, useRef } from "react";
import {
  FileText,
  Printer,
  Calendar,
  Filter,
  Download,
  Share2,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  ArrowLeftRight,
  User,
  Building,
  Phone,
  MessageCircle,
  Clock,
  Search,
} from "lucide-react";
import {
  ExchangeAccount,
  ExchangeTransaction,
  CurrencyInfo,
  SystemSettings,
} from "../../types/erp";
import { formatMoney, formatNumberOnly } from "../../services/erpStorage";

interface ExchangeStatementProps {
  accounts: ExchangeAccount[];
  transactions: ExchangeTransaction[];
  currencies: CurrencyInfo[];
  settings: SystemSettings;
  preselectedAccountId?: string;
  onOpenNotification: (tx: ExchangeTransaction) => void;
}

export const ExchangeStatement: React.FC<ExchangeStatementProps> = ({
  accounts,
  transactions,
  currencies,
  settings,
  preselectedAccountId,
  onOpenNotification,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    preselectedAccountId || accounts[0]?.id || ""
  );

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const printRef = useRef<HTMLDivElement>(null);

  const activeAccount = useMemo(() => {
    return accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  }, [accounts, selectedAccountId]);

  // Filter transactions for this customer
  const filteredTransactions = useMemo(() => {
    if (!activeAccount) return [];

    return transactions
      .filter((t) => {
        const isRelated =
          t.accountId === activeAccount.id ||
          t.recipientAccountId === activeAccount.id;
        if (!isRelated) return false;

        if (startDate && t.date < startDate) return false;
        if (endDate && t.date > endDate) return false;
        if (filterType !== "ALL" && t.type !== filterType) return false;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchNum = t.transactionNumber.toLowerCase().includes(query);
          const matchNote = t.notes?.toLowerCase().includes(query);
          if (!matchNum && !matchNote) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, activeAccount, startDate, endDate, filterType, searchQuery]);

  // Financial calculations
  const { totalCredits, totalDebits, netBalance } = useMemo(() => {
    let credits = 0; // Deposited (+)
    let debits = 0; // Withdrawn, purchase, or sent transfer (-)

    filteredTransactions.forEach((tx) => {
      if (tx.type === "DEPOSIT" || (tx.type === "TRANSFER" && tx.recipientAccountId === activeAccount?.id)) {
        credits += tx.amount;
      } else {
        debits += tx.amount;
      }
    });

    return {
      totalCredits: credits,
      totalDebits: debits,
      netBalance: (activeAccount?.balance || 0),
    };
  }, [filteredTransactions, activeAccount]);

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action and Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 no-print">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Customer Selection */}
          <div className="flex-1 min-w-0 w-full">
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              اختر حساب العميل المطلوب إصدار كشف الحساب له:
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-2xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-amber-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountNumber} - {acc.customerNameAr} ({acc.city}) | رصيد:{" "}
                  {formatNumberOnly(acc.balance)} {acc.currency}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Print Button */}
          <div className="flex items-center gap-2 self-end">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors shadow"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>طباعة كشف الحساب الرسمي</span>
            </button>
          </div>
        </div>

        {/* Date & Type Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">من تاريخ:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">إلى تاريخ:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">نوع الحركة:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs"
            >
              <option value="ALL">جميع الحركات</option>
              <option value="DEPOSIT">إيداعات نقدية وبنكية (+)</option>
              <option value="WITHDRAW">مسحوبات نقدية (-)</option>
              <option value="PURCHASE">مشتريات مواد (-)</option>
              <option value="TRANSFER">حوالات داخلية</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">بحث برقم العملية أو البيان:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute top-2.5 right-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="رقم العملية / البيان..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pr-8 pl-2 py-1.5 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Printable Statement Document (Designed specifically for high-contrast official report) */}
      <div
        ref={printRef}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 print:bg-white print:text-black print:p-4 print:border-none print:shadow-none doc-canvas"
      >
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 print:border-black pb-5">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 print:text-black flex items-center gap-2">
              <Building className="w-6 h-6 text-amber-400 print:text-black" />
              <span>{settings.companyNameAr}</span>
            </h2>
            <p className="text-xs text-slate-400 print:text-gray-600 font-medium">
              إدارة الصرافة والحسابات الجارية للعملاء والتحويلات الداخلية
            </p>
            <p className="text-[11px] text-slate-400 print:text-gray-600">
              هاتف خدمة العملاء: {settings.phone} | المركز الرئيسي: {settings.address}
            </p>
          </div>

          <div className="text-left sm:text-right border sm:border-r-2 sm:border-slate-700 sm:pr-4 p-3 sm:p-0 rounded-xl sm:rounded-none bg-slate-950/50 sm:bg-transparent print:bg-transparent border-slate-800">
            <div className="text-xs font-bold text-amber-400 print:text-black">
              كشف حساب عميل (Statement of Account)
            </div>
            <div className="text-xs text-slate-300 print:text-black font-mono">
              تاريخ الطباعة: {new Date().toLocaleDateString("ar-YE")}
            </div>
            <div className="text-[11px] text-slate-400 print:text-gray-600">
              الفترة: {startDate || "البداية"} إلى {endDate || "تاريخه"}
            </div>
          </div>
        </div>

        {/* Customer Information Card */}
        {activeAccount && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 print:border-gray-300 print:bg-gray-50 text-xs">
            <div>
              <span className="text-slate-500 print:text-gray-500 block text-[10px]">اسم العميل:</span>
              <span className="font-bold text-slate-100 print:text-black text-sm">
                {activeAccount.customerNameAr}
              </span>
            </div>
            <div>
              <span className="text-slate-500 print:text-gray-500 block text-[10px]">رقم الحساب:</span>
              <span className="font-mono font-bold text-amber-400 print:text-black">
                {activeAccount.accountNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-500 print:text-gray-500 block text-[10px]">الهاتف / واتساب:</span>
              <span className="font-mono text-slate-200 print:text-black">
                {activeAccount.phone}
              </span>
            </div>
            <div>
              <span className="text-slate-500 print:text-gray-500 block text-[10px]">المدينة والفرع:</span>
              <span className="text-slate-200 print:text-black">
                {activeAccount.city}
              </span>
            </div>
          </div>
        )}

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 print:border-gray-300 print:bg-gray-50">
            <span className="text-[11px] text-emerald-400 print:text-gray-600 block mb-1">
              إجمالي الإيداعات (+):
            </span>
            <div className="text-xl font-bold font-mono text-emerald-300 print:text-black">
              +{formatNumberOnly(totalCredits)} {activeAccount?.currency}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 print:border-gray-300 print:bg-gray-50">
            <span className="text-[11px] text-rose-400 print:text-gray-600 block mb-1">
              إجمالي السحب والمشتريات (-):
            </span>
            <div className="text-xl font-bold font-mono text-rose-300 print:text-black">
              -{formatNumberOnly(totalDebits)} {activeAccount?.currency}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/50 print:border-gray-300 print:bg-gray-50">
            <span className="text-[11px] text-amber-400 print:text-gray-600 block mb-1">
              الرصيد النهائي المتاح:
            </span>
            <div className="text-2xl font-black font-mono text-amber-400 print:text-black">
              {formatMoney(netBalance, activeAccount?.currency || "YER_SANAA", currencies)}
            </div>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 print:border-black">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 print:bg-gray-200 text-slate-400 print:text-black border-b border-slate-800 print:border-black">
              <tr>
                <th className="p-3 font-bold">رقم العملية</th>
                <th className="p-3 font-bold">التاريخ</th>
                <th className="p-3 font-bold">نوع العملية</th>
                <th className="p-3 font-bold">البيان والتفاصيل</th>
                <th className="p-3 font-bold text-center">مدين (سحب) (-)</th>
                <th className="p-3 font-bold text-center">دائن (إيداع) (+)</th>
                <th className="p-3 font-bold text-center">الرصيد بعد الحركة</th>
                <th className="p-3 font-bold text-center no-print">إشعار</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-gray-300">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 print:text-gray-600">
                    لا توجد حركات تطابق معايير التصفية المحددة.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isCredit =
                    tx.type === "DEPOSIT" ||
                    (tx.type === "TRANSFER" && tx.recipientAccountId === activeAccount?.id);
                  const isDebit = !isCredit;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-950/40 print:hover:bg-transparent transition-colors"
                    >
                      <td className="p-3 font-mono font-medium text-slate-300 print:text-black">
                        {tx.transactionNumber}
                      </td>
                      <td className="p-3 font-mono text-slate-400 print:text-black whitespace-nowrap">
                        {tx.date} <span className="text-[10px] text-slate-500">{tx.time}</span>
                      </td>
                      <td className="p-3 font-semibold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            tx.type === "DEPOSIT"
                              ? "bg-emerald-950/80 text-emerald-400 print:text-black"
                              : tx.type === "WITHDRAW"
                              ? "bg-rose-950/80 text-rose-400 print:text-black"
                              : tx.type === "PURCHASE"
                              ? "bg-amber-950/80 text-amber-400 print:text-black"
                              : "bg-blue-950/80 text-blue-400 print:text-black"
                          }`}
                        >
                          {tx.type === "DEPOSIT"
                            ? "إيداع نقدي"
                            : tx.type === "WITHDRAW"
                            ? "سحب نقدي"
                            : tx.type === "PURCHASE"
                            ? "شراء مواد"
                            : "حوالة داخلية"}
                        </span>
                      </td>
                      <td className="p-3 text-slate-200 print:text-black max-w-xs">
                        <div>{tx.notes}</div>
                        {tx.purchasedItems && tx.purchasedItems.length > 0 && (
                          <div className="text-[10px] text-amber-400 print:text-gray-700 mt-0.5">
                            الأصناف: {tx.purchasedItems.map((i) => `${i.itemNameAr} (${i.quantity})`).join("، ")}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono font-semibold text-rose-400 print:text-black">
                        {isDebit ? formatNumberOnly(tx.amount) : "-"}
                      </td>
                      <td className="p-3 text-center font-mono font-semibold text-emerald-400 print:text-black">
                        {isCredit ? formatNumberOnly(tx.amount) : "-"}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-100 print:text-black">
                        {formatNumberOnly(tx.balanceAfter)}
                      </td>
                      <td className="p-3 text-center no-print">
                        <button
                          onClick={() => onOpenNotification(tx)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                          title="إرسال إشعار WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Signatures & Stamps */}
        <div className="pt-8 border-t border-slate-800 print:border-black grid grid-cols-3 gap-6 text-center text-xs text-slate-400 print:text-black">
          <div>
            <span className="block font-bold mb-8">إعداد / قسم الصرافة:</span>
            <div className="border-t border-dashed border-slate-700 print:border-black pt-2">
              التوقيع والختم
            </div>
          </div>
          <div>
            <span className="block font-bold mb-8">المدير المالي والاعتماد:</span>
            <div className="border-t border-dashed border-slate-700 print:border-black pt-2">
              التوقيع والاعتماد
            </div>
          </div>
          <div>
            <span className="block font-bold mb-8">توقيع العميل بالمصادقة:</span>
            <div className="border-t border-dashed border-slate-700 print:border-black pt-2">
              مصادقة الرصيد
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
