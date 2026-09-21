import React, { useState, useMemo } from "react";
import {
  Calendar,
  Filter,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  ArrowLeftRight,
  Printer,
  Download,
  Receipt,
  MessageCircle,
  FileCheck,
  CheckCircle2,
  Building,
} from "lucide-react";
import {
  ExchangeAccount,
  ExchangeTransaction,
  CurrencyInfo,
} from "../../types/erp";
import { formatMoney, formatNumberOnly } from "../../services/erpStorage";

interface ExchangeJournalProps {
  transactions: ExchangeTransaction[];
  accounts: ExchangeAccount[];
  currencies: CurrencyInfo[];
  onOpenNotification: (tx: ExchangeTransaction) => void;
}

export const ExchangeJournal: React.FC<ExchangeJournalProps> = ({
  transactions,
  accounts,
  currencies,
  onOpenNotification,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedDate && tx.date !== selectedDate) return false;
      if (selectedType !== "ALL" && tx.type !== selectedType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchNum = tx.transactionNumber.toLowerCase().includes(q);
        const matchName = tx.customerNameAr.toLowerCase().includes(q);
        const matchNotes = tx.notes?.toLowerCase().includes(q);
        if (!matchNum && !matchName && !matchNotes) return false;
      }
      return true;
    });
  }, [transactions, selectedDate, selectedType, searchQuery]);

  // Aggregate stats
  const { totalDeposits, totalWithdrawals, totalPurchases, totalTransfers } =
    useMemo(() => {
      let dep = 0;
      let wit = 0;
      let pur = 0;
      let trf = 0;

      filtered.forEach((tx) => {
        if (tx.type === "DEPOSIT") dep += tx.amount;
        else if (tx.type === "WITHDRAW") wit += tx.amount;
        else if (tx.type === "PURCHASE") pur += tx.amount;
        else if (tx.type === "TRANSFER") trf += tx.amount;
      });

      return {
        totalDeposits: dep,
        totalWithdrawals: wit,
        totalPurchases: pur,
        totalTransfers: trf,
      };
    }, [filtered]);

  const handleExportCSV = () => {
    const headers = [
      "رقم العملية",
      "التاريخ",
      "الوقت",
      "العميل",
      "نوع العملية",
      "المبلغ",
      "العملة",
      "الرصيد بعد الحركة",
      "طريقة الدفع",
      "البيان",
    ];

    const rows = filtered.map((t) => [
      t.transactionNumber,
      t.date,
      t.time,
      `"${t.customerNameAr}"`,
      t.type,
      t.amount,
      t.currency,
      t.balanceAfter,
      `"${t.paymentSourceName || t.paymentMethod}"`,
      `"${t.notes || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `exchange_daily_journal_${selectedDate || "all"}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              تصفية حسب التاريخ:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              نوع العملية:
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">جميع العمليات</option>
              <option value="DEPOSIT">إيداعات (+)</option>
              <option value="WITHDRAW">مسحوبات (-)</option>
              <option value="PURCHASE">مشتريات مواد (-)</option>
              <option value="TRANSFER">تحويلات داخلية</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              بحث برقم الحركة، اسم العميل، أو البيان:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute top-2.5 right-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، رقم القيد، أو البيان..."
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400">
            إجمالي العمليات المعروضة:{" "}
            <span className="font-bold text-slate-100">{filtered.length}</span> حركة
          </span>
          <div className="flex gap-2">
            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                className="text-amber-400 hover:underline text-[11px]"
              >
                عرض كل الأيام
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors font-medium text-[11px]"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>تصدير CSV / Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40">
          <span className="text-[11px] text-emerald-400 block mb-1">إجمالي الإيداعات:</span>
          <span className="font-mono font-bold text-base text-emerald-300">
            +{formatNumberOnly(totalDeposits)}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40">
          <span className="text-[11px] text-rose-400 block mb-1">إجمالي المسحوبات:</span>
          <span className="font-mono font-bold text-base text-rose-300">
            -{formatNumberOnly(totalWithdrawals)}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40">
          <span className="text-[11px] text-amber-400 block mb-1">مشتريات المواد:</span>
          <span className="font-mono font-bold text-base text-amber-300">
            -{formatNumberOnly(totalPurchases)}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-800/40">
          <span className="text-[11px] text-blue-400 block mb-1">التحويلات الداخلية:</span>
          <span className="font-mono font-bold text-base text-blue-300">
            {formatNumberOnly(totalTransfers)}
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-bold">رقم العملية</th>
                <th className="p-3.5 font-bold">التاريخ والوقت</th>
                <th className="p-3.5 font-bold">العميل الحساب</th>
                <th className="p-3.5 font-bold">النوع</th>
                <th className="p-3.5 font-bold">المبلغ</th>
                <th className="p-3.5 font-bold">الرصيد بعد العملية</th>
                <th className="p-3.5 font-bold">طريقة التنفيذ</th>
                <th className="p-3.5 font-bold">الربط المحاسبي</th>
                <th className="p-3.5 font-bold text-center">إشعار</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    لا توجد حركات مسجلة تطابق التصفية.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isOut =
                    tx.type === "WITHDRAW" ||
                    tx.type === "PURCHASE" ||
                    tx.type === "TRANSFER";

                  return (
                    <tr key={tx.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-3.5 font-mono font-medium text-slate-200">
                        {tx.transactionNumber}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                        {tx.date}{" "}
                        <span className="text-[10px] text-slate-500">{tx.time}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-100">
                        <div>{tx.customerNameAr}</div>
                        {tx.customerPhone && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            {tx.customerPhone}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            tx.type === "DEPOSIT"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : tx.type === "WITHDRAW"
                              ? "bg-rose-950 text-rose-400 border border-rose-800"
                              : tx.type === "PURCHASE"
                              ? "bg-amber-950 text-amber-400 border border-amber-800"
                              : "bg-blue-950 text-blue-400 border border-blue-800"
                          }`}
                        >
                          {tx.type === "DEPOSIT"
                            ? "إيداع (+)"
                            : tx.type === "WITHDRAW"
                            ? "سحب (-)"
                            : tx.type === "PURCHASE"
                            ? "شراء مواد"
                            : "تحويل داخلي"}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold">
                        <span className={isOut ? "text-rose-400" : "text-emerald-400"}>
                          {isOut ? "-" : "+"}
                          {formatNumberOnly(tx.amount)} {tx.currency}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-medium text-slate-300">
                        {formatNumberOnly(tx.balanceAfter)}
                      </td>
                      <td className="p-3.5 text-slate-300 text-[11px]">
                        {tx.paymentSourceName || tx.paymentMethod}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          {tx.voucherId && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono" title="سند صرف/قبض مرتبط">
                              سند: {tx.voucherId}
                            </span>
                          )}
                          {tx.invoiceId && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800 font-mono" title="فاتورة مبيعات مرتبطة">
                              فاتورة: {tx.invoiceId}
                            </span>
                          )}
                          {!tx.voucherId && !tx.invoiceId && (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              قيد مباشر
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => onOpenNotification(tx)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                          title="معاينة إشعار WhatsApp و SMS"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
