import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Calendar,
  Filter,
  Printer,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  FileText,
  Building2,
  Layers,
  ChevronDown,
  Sparkles,
  Eye,
} from "lucide-react";
import { Account, CurrencyCode, CurrencyInfo, JournalEntry } from "../types/erp";
import { formatMoney, formatNumberOnly } from "../services/erpStorage";
import { formatDate, formatDualDate } from "../utils/formatters";
import { ExportPdfButton } from "./ExportPdfButton";
import { ColumnCustomizer, useColumnVisibility, ColumnDef } from "./ColumnCustomizer";

interface GeneralLedgerViewProps {
  accounts: Account[];
  journalEntries: JournalEntry[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  initialAccountId?: string;
  onSelectAccount?: (acc: Account) => void;
}

export const GeneralLedgerView: React.FC<GeneralLedgerViewProps> = ({
  accounts,
  journalEntries,
  currencies,
  displayCurrency,
  initialAccountId,
}) => {
  const nonHeaders = accounts.filter((a) => !a.isHeader);
  const defaultAcc = nonHeaders.find((a) => a.id === initialAccountId) || nonHeaders[0] || accounts[0];

  const [selectedAccountId, setSelectedAccountId] = useState<string>(defaultAcc?.id || "");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "POSTED" | "DRAFT">("POSTED");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedEntryModal, setSelectedEntryModal] = useState<JournalEntry | null>(null);

  const GL_COLUMNS: ColumnDef[] = [
    { id: "entryNumber", label: "رقم القيد", locked: true },
    { id: "date", label: "التاريخ" },
    { id: "reference", label: "المرجع" },
    { id: "description", label: "البيان والشرح" },
    { id: "debit", label: "مدين (Debit)" },
    { id: "credit", label: "دائن (Credit)" },
    { id: "runningBalance", label: "الرصيد الجاري" },
    { id: "status", label: "الحالة" },
    { id: "actions", label: "إجراءات", locked: true },
  ];
  const { visibleColumns, updateVisibility, isVisible } = useColumnVisibility("general_ledger", GL_COLUMNS);

  const currentAccount = accounts.find((a) => a.id === selectedAccountId) || defaultAcc;

  // Ledger Movement calculation
  interface LedgerMovement {
    id: string;
    entryId: string;
    entryNumber: string;
    date: string;
    reference?: string;
    description: string;
    memo?: string;
    debit: number;
    credit: number;
    currency: CurrencyCode;
    runningBalance: number;
    status: string;
    entry: JournalEntry;
  }

  const sortedEntries = [...journalEntries]
    .filter((je) => statusFilter === "ALL" || je.status === statusFilter)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentRunning = 0;
  const allMovements: LedgerMovement[] = [];

  sortedEntries.forEach((je) => {
    je.lines.forEach((line) => {
      if (line.accountId === currentAccount?.id || line.accountCode === currentAccount?.code) {
        const debit = Number(line.debit) || 0;
        const credit = Number(line.credit) || 0;

        if (currentAccount?.nature === "DEBIT") {
          currentRunning += debit - credit;
        } else {
          currentRunning += credit - debit;
        }

        allMovements.push({
          id: `${je.id}-${line.id}`,
          entryId: je.id,
          entryNumber: je.entryNumber,
          date: je.date,
          reference: je.reference,
          description: line.memo || je.description,
          memo: line.memo,
          debit,
          credit,
          currency: line.currency || je.currency,
          runningBalance: currentRunning,
          status: je.status,
          entry: je,
        });
      }
    });
  });

  const filteredMovements = allMovements.filter((m) => {
    if (startDate && m.date < startDate) return false;
    if (endDate && m.date > endDate) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        m.entryNumber.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        (m.reference && m.reference.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalDebit = filteredMovements.reduce((sum, m) => sum + m.debit, 0);
  const totalCredit = filteredMovements.reduce((sum, m) => sum + m.credit, 0);
  const netMovement =
    currentAccount?.nature === "DEBIT" ? totalDebit - totalCredit : totalCredit - totalDebit;

  const handleExportCSV = () => {
    if (!currentAccount) return;
    const headers = ["رقم القيد", "التاريخ", "المرجع", "البيان والوصف", "مدين", "دائن", "الرصيد التراكمي"];
    const rows = filteredMovements.map((m) => [
      m.entryNumber,
      m.date,
      m.reference || "",
      `"${m.description.replace(/"/g, '""')}"`,
      m.debit,
      m.credit,
      m.runningBalance,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `دفتر_الأستاذ_${currentAccount.code}_${currentAccount.nameAr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">دفتر الأستاذ العام (General Ledger - SAP FAGLL03)</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                FI-GL Module
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              كشف حركة الحسابات التفصيلي وتتبع الأرصدة التراكمية المعتمدة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <ExportPdfButton
            targetId="general-ledger-table-container"
            reportTitle={`كشف حساب دفتر الأستاذ العام - ${currentAccount?.code || ''} ${currentAccount?.nameAr || ''}`}
            filename={`دفتر_الأستاذ_${currentAccount?.code || 'GL'}.pdf`}
            label="تصدير كشف الحساب PDF"
          />
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            تصدير Excel / CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            طباعة الكشف
          </button>
        </div>
      </div>

      {/* Account Selector & Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Account Picker Dropdown */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              اختر الحساب المحاسبي المراد عرض كشف حسابه:
            </label>
            <div className="relative">
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:border-emerald-500"
              >
                {nonHeaders.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    [{acc.code}] {acc.nameAr} - (الرصيد: {formatNumberOnly(acc.currentBalance)})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Quick Search inside movements */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              بحث بالوصف أو رقم القيد:
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="ابحث في الكشف..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl pr-9 pl-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Date Filters & Status Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
              <Calendar className="w-4 h-4 text-emerald-400" />
              الفترة من:
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            />
            <span className="text-slate-500 text-xs">إلى:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">حالة القيود:</span>
            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setStatusFilter("POSTED")}
                className={`px-3 py-1 rounded-md transition-all ${
                  statusFilter === "POSTED"
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                المرحلة فقط
              </button>
              <button
                onClick={() => setStatusFilter("DRAFT")}
                className={`px-3 py-1 rounded-md transition-all ${
                  statusFilter === "DRAFT"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                المسودات
              </button>
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1 rounded-md transition-all ${
                  statusFilter === "ALL"
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                الكل
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info Cards */}
      {currentAccount && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400">رمز وطبيعة الحساب</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-white">[{currentAccount.code}]</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  currentAccount.nature === "DEBIT"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                }`}
              >
                {currentAccount.nature === "DEBIT" ? "مدين (Debit)" : "دائن (Credit)"}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-300 mt-1 truncate">{currentAccount.nameAr}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              إجمالي الحركات المدينة (Period Debit)
            </span>
            <div className="text-lg font-black text-emerald-400 mt-1">
              {formatMoney(totalDebit, displayCurrency, currencies)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">عدد المقيدات المدينة</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400" />
              إجمالي الحركات الدائنة (Period Credit)
            </span>
            <div className="text-lg font-black text-rose-400 mt-1">
              {formatMoney(totalCredit, displayCurrency, currencies)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">عدد المقيدات الدائنة</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950">
            <span className="text-[11px] font-bold text-slate-400">الرصيد التراكمي النهائي</span>
            <div className="text-xl font-black text-cyan-400 mt-1">
              {formatMoney(currentAccount.currentBalance, displayCurrency, currencies)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">حسب العملة المحددة</span>
          </div>
        </div>
      )}

      {/* Movements Table */}
      <div id="general-ledger-table-container" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl doc-canvas">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">تفاصيل حركة الحساب (Ledger Entries)</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
              {filteredMovements.length} حركة
            </span>
          </div>
          <ColumnCustomizer
            tableKey="general_ledger"
            columns={GL_COLUMNS}
            visibleColumns={visibleColumns}
            onChange={updateVisibility}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                {isVisible("entryNumber") && <th className="py-3 px-4">رقم القيد</th>}
                {isVisible("date") && <th className="py-3 px-4">التاريخ</th>}
                {isVisible("reference") && <th className="py-3 px-4">المرجع</th>}
                {isVisible("description") && <th className="py-3 px-4">البيان والشرح</th>}
                {isVisible("debit") && <th className="py-3 px-4 text-left">مدين (Debit)</th>}
                {isVisible("credit") && <th className="py-3 px-4 text-left">دائن (Credit)</th>}
                {isVisible("runningBalance") && <th className="py-3 px-4 text-left">الرصيد الجاري</th>}
                {isVisible("status") && <th className="py-3 px-4 text-center">الحالة</th>}
                {isVisible("actions") && <th className="py-3 px-4 text-center">إجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={GL_COLUMNS.filter((c) => isVisible(c.id)).length} className="py-12 text-center text-slate-500">
                    لا توجد حركات محاسبية مسجلة لهذا الحساب خلال الفترة المحددة
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-800/40 transition-colors">
                    {isVisible("entryNumber") && (
                      <td className="py-3 px-4 font-black text-emerald-400 dir-ltr text-right">
                        {mov.entryNumber}
                      </td>
                    )}
                    {isVisible("date") && (
                      <td className="py-3 px-4 text-slate-300" title={formatDualDate(mov.date)}>
                        {formatDate(mov.date)}
                      </td>
                    )}
                    {isVisible("reference") && (
                      <td className="py-3 px-4 text-slate-400 font-mono">{mov.reference || "-"}</td>
                    )}
                    {isVisible("description") && (
                      <td className="py-3 px-4 text-slate-100 max-w-xs truncate" title={mov.description}>
                        {mov.description}
                      </td>
                    )}
                    {isVisible("debit") && (
                      <td className="py-3 px-4 text-left font-bold text-emerald-400 dir-ltr">
                        {mov.debit > 0 ? formatNumberOnly(mov.debit) : "-"}
                      </td>
                    )}
                    {isVisible("credit") && (
                      <td className="py-3 px-4 text-left font-bold text-rose-400 dir-ltr">
                        {mov.credit > 0 ? formatNumberOnly(mov.credit) : "-"}
                      </td>
                    )}
                    {isVisible("runningBalance") && (
                      <td className="py-3 px-4 text-left font-black text-cyan-300 dir-ltr">
                        {formatNumberOnly(mov.runningBalance)}
                      </td>
                    )}
                    {isVisible("status") && (
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            mov.status === "POSTED"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {mov.status === "POSTED" ? "مرحّل" : "مسودة"}
                        </span>
                      </td>
                    )}
                    {isVisible("actions") && (
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedEntryModal(mov.entry)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="عرض تفاصيل القيد"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
            {filteredMovements.length > 0 && (
              <tfoot className="bg-slate-950 font-black border-t-2 border-slate-700 text-slate-100">
                <tr>
                  <td colSpan={["entryNumber", "date", "reference", "description"].filter((c) => isVisible(c)).length} className="py-3.5 px-4 text-slate-300">
                    الإجمالي للفترة المحددة:
                  </td>
                  {isVisible("debit") && (
                    <td className="py-3.5 px-4 text-left text-emerald-400 dir-ltr">
                      {formatNumberOnly(totalDebit)}
                    </td>
                  )}
                  {isVisible("credit") && (
                    <td className="py-3.5 px-4 text-left text-rose-400 dir-ltr">
                      {formatNumberOnly(totalCredit)}
                    </td>
                  )}
                  {isVisible("runningBalance") && (
                    <td className="py-3.5 px-4 text-left text-cyan-400 dir-ltr">
                      صافي الحركة: {formatNumberOnly(netMovement)}
                    </td>
                  )}
                  {["status", "actions"].filter((c) => isVisible(c)).length > 0 && (
                    <td colSpan={["status", "actions"].filter((c) => isVisible(c)).length}></td>
                  )}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Entry Details Modal */}
      {selectedEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">
                  تفاصيل القيد المحاسبي: {selectedEntryModal.entryNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEntryModal(null)}
                className="text-slate-400 hover:text-white font-bold text-sm px-2 py-1 rounded-lg bg-slate-800"
              >
                إغلاق ✕
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 font-semibold">التاريخ: </span>
                  <span className="text-white font-bold">{selectedEntryModal.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">المرجع: </span>
                  <span className="text-white font-bold">{selectedEntryModal.reference || "بدون"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-semibold">البيان: </span>
                  <span className="text-white font-bold">{selectedEntryModal.description}</span>
                </div>
              </div>

              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
                  <tr>
                    <th className="py-2 px-3">رقم الحساب</th>
                    <th className="py-2 px-3">اسم الحساب</th>
                    <th className="py-2 px-3 text-left">مدين</th>
                    <th className="py-2 px-3 text-left">دائن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
                  {selectedEntryModal.lines.map((l, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">{l.accountCode}</td>
                      <td className="py-2.5 px-3">{l.accountNameAr}</td>
                      <td className="py-2.5 px-3 text-left font-bold text-emerald-400">
                        {l.debit > 0 ? formatNumberOnly(l.debit) : "-"}
                      </td>
                      <td className="py-2.5 px-3 text-left font-bold text-rose-400">
                        {l.credit > 0 ? formatNumberOnly(l.credit) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
