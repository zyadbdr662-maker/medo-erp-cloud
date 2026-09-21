import React, { useState } from "react";
import {
  FileText,
  Printer,
  Calendar,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  CheckCircle2,
  DollarSign,
  Download,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { Account, CurrencyCode, CurrencyInfo, JournalEntry } from "../types/erp";
import { formatMoney, formatNumberOnly } from "../services/erpStorage";
import { formatDate, formatDualDate } from "../utils/formatters";
import { ExportPdfButton } from "./ExportPdfButton";
import { ColumnCustomizer, useColumnVisibility, ColumnDef } from "./ColumnCustomizer";

interface AccountLedgerModalProps {
  account: Account;
  accounts: Account[];
  journalEntries: JournalEntry[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  onClose: () => void;
  onSelectAccount: (acc: Account) => void;
}

export const AccountLedgerModal: React.FC<AccountLedgerModalProps> = ({
  account,
  accounts,
  journalEntries,
  currencies,
  displayCurrency,
  onClose,
  onSelectAccount,
}) => {
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [searchFilter, setSearchFilter] = useState("");

  const LEDGER_MODAL_COLUMNS: ColumnDef[] = [
    { id: "date", label: "التاريخ" },
    { id: "entryNumber", label: "رقم السند / القيد", locked: true },
    { id: "reference", label: "المرجع" },
    { id: "description", label: "البيان والشرح المحاسبي" },
    { id: "debit", label: "مدين (Debit)" },
    { id: "credit", label: "دائن (Credit)" },
    { id: "runningBalance", label: "الرصيد التراكمي" },
  ];
  const { visibleColumns, updateVisibility, isVisible } = useColumnVisibility("account_ledger_modal", LEDGER_MODAL_COLUMNS);

  const nonHeaders = accounts.filter((a) => !a.isHeader);

  // Extract all lines affecting this account from posted journal entries
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
  }

  // Sort entries chronologically
  const sortedEntries = [...journalEntries]
    .filter((je) => je.status === "POSTED")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentRunning = 0;
  const allMovements: LedgerMovement[] = [];

  sortedEntries.forEach((je) => {
    je.lines.forEach((line) => {
      if (line.accountId === account.id || line.accountCode === account.code) {
        const debit = Number(line.debit) || 0;
        const credit = Number(line.credit) || 0;

        if (account.nature === "DEBIT") {
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
        });
      }
    });
  });

  // Filter movements by date and search
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

  const totalPeriodDebit = filteredMovements.reduce((sum, m) => sum + m.debit, 0);
  const totalPeriodCredit = filteredMovements.reduce((sum, m) => sum + m.credit, 0);
  const netPeriodMovement =
    account.nature === "DEBIT"
      ? totalPeriodDebit - totalPeriodCredit
      : totalPeriodCredit - totalPeriodDebit;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
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
    link.setAttribute("download", `كشف_حساب_${account.code}_${account.nameAr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto print:bg-transparent print:p-0 print:static">
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl p-6 text-right animate-in zoom-in-95 my-8 space-y-5 print:bg-white print:text-black print:border-none print:shadow-none print:m-0 print:p-2 doc-canvas"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white print:text-black">
                  كشف حساب الأستاذ العام (General Ledger Statement)
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                  {account.code}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium print:text-slate-600">
                {account.nameAr} ({account.nameEn}) - طبيعة الحساب:{" "}
                <span className="text-emerald-400 font-bold">
                  {account.nature === "DEBIT" ? "مدين (Debit)" : "دائن (Credit)"}
                </span>{" "}
                | العملة: {account.currency}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            {/* Change Account Quick Select */}
            <select
              value={account.id}
              onChange={(e) => {
                const target = nonHeaders.find((a) => a.id === e.target.value);
                if (target) onSelectAccount(target);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {nonHeaders.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} - {a.nameAr}
                </option>
              ))}
            </select>

            <ExportPdfButton
              targetId="account-ledger-modal-table-container"
              reportTitle={`كشف حساب الأستاذ العام - [${account.code}] ${account.nameAr}`}
              filename={`كشف_حساب_${account.code}.pdf`}
              variant="badge"
              label="تصدير PDF"
            />

            <ColumnCustomizer
              tableKey="account_ledger_modal"
              columns={LEDGER_MODAL_COLUMNS}
              visibleColumns={visibleColumns}
              onChange={updateVisibility}
            />

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="تصدير إلى Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>تصدير CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="طباعة كشف الحساب"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl font-bold px-2"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 print:hidden">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex items-center gap-1 w-full">
              <span className="text-slate-400 whitespace-nowrap text-[11px]">من:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex items-center gap-1 w-full">
              <span className="text-slate-400 whitespace-nowrap text-[11px]">إلى:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث في قيود الحساب..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pr-8 pl-2.5 py-1 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Account Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[10px]">إجمالي الحركات المدينة (Debits)</div>
            <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
              {formatMoney(totalPeriodDebit, account.currency === "MULTI" ? displayCurrency : account.currency, currencies)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[10px]">إجمالي الحركات الدائنة (Credits)</div>
            <div className="text-sm font-bold font-mono text-blue-400 mt-1">
              {formatMoney(totalPeriodCredit, account.currency === "MULTI" ? displayCurrency : account.currency, currencies)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[10px]">صافي حركة الفترة (Net Movement)</div>
            <div className="text-sm font-bold font-mono text-slate-200 mt-1">
              {formatMoney(netPeriodMovement, account.currency === "MULTI" ? displayCurrency : account.currency, currencies)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
            <div className="text-emerald-300 text-[10px] font-semibold">الرصيد الختامي الحالي (Ending Balance)</div>
            <div className="text-base font-extrabold font-mono text-emerald-400 mt-0.5">
              {formatMoney(account.currentBalance, account.currency === "MULTI" ? displayCurrency : account.currency, currencies)}
            </div>
          </div>
        </div>

        {/* Movements Table */}
        <div id="account-ledger-modal-table-container" className="border border-slate-800 rounded-xl overflow-hidden shadow-inner">
          <div className="overflow-x-auto max-h-[380px]">
            <table className="w-full text-right text-xs">
              <thead className="sticky top-0 z-10 bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  {isVisible("date") && <th className="py-2.5 px-3 font-semibold">التاريخ</th>}
                  {isVisible("entryNumber") && <th className="py-2.5 px-3 font-semibold">رقم السند / القيد</th>}
                  {isVisible("reference") && <th className="py-2.5 px-3 font-semibold">المرجع</th>}
                  {isVisible("description") && <th className="py-2.5 px-3 font-semibold min-w-[240px]">البيان والشرح المحاسبي</th>}
                  {isVisible("debit") && <th className="py-2.5 px-3 font-semibold text-left">مدين (Debit)</th>}
                  {isVisible("credit") && <th className="py-2.5 px-3 font-semibold text-left">دائن (Credit)</th>}
                  {isVisible("runningBalance") && <th className="py-2.5 px-3 font-semibold text-left">الرصيد التراكمي</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={LEDGER_MODAL_COLUMNS.filter((c) => isVisible(c.id)).length} className="py-8 text-center text-slate-400">
                      لا توجد حركات محاسبية مسجلة لهذا الحساب خلال الفترة المحددة
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      {isVisible("date") && (
                        <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap font-mono" title={formatDualDate(m.date)}>
                          {formatDate(m.date)}
                        </td>
                      )}
                      {isVisible("entryNumber") && (
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 whitespace-nowrap">
                          {m.entryNumber}
                        </td>
                      )}
                      {isVisible("reference") && (
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {m.reference || "-"}
                        </td>
                      )}
                      {isVisible("description") && (
                        <td className="py-2.5 px-3 text-slate-200 font-medium">
                          <div>{m.description}</div>
                        </td>
                      )}
                      {isVisible("debit") && (
                        <td className="py-2.5 px-3 text-left font-mono font-bold text-emerald-400 whitespace-nowrap">
                          {m.debit > 0 ? formatNumberOnly(m.debit) : "-"}
                        </td>
                      )}
                      {isVisible("credit") && (
                        <td className="py-2.5 px-3 text-left font-mono font-bold text-blue-400 whitespace-nowrap">
                          {m.credit > 0 ? formatNumberOnly(m.credit) : "-"}
                        </td>
                      )}
                      {isVisible("runningBalance") && (
                        <td className="py-2.5 px-3 text-left font-mono font-bold text-slate-100 whitespace-nowrap">
                          {formatNumberOnly(m.runningBalance)}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-950 font-bold border-t border-slate-800">
                <tr>
                  <td colSpan={["date", "entryNumber", "reference", "description"].filter((c) => isVisible(c)).length} className="py-2.5 px-3 text-slate-300 text-left">
                    مجموع حركات الفترة:
                  </td>
                  {isVisible("debit") && (
                    <td className="py-2.5 px-3 text-left font-mono text-emerald-400">
                      {formatNumberOnly(totalPeriodDebit)}
                    </td>
                  )}
                  {isVisible("credit") && (
                    <td className="py-2.5 px-3 text-left font-mono text-blue-400">
                      {formatNumberOnly(totalPeriodCredit)}
                    </td>
                  )}
                  {isVisible("runningBalance") && (
                    <td className="py-2.5 px-3 text-left font-mono text-slate-100">
                      {formatNumberOnly(account.currentBalance)}
                    </td>
                  )}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 print:hidden">
          <div className="text-[11px] text-slate-400">
            تم استخراج كشف الحساب آلياً من القيود العامة المرحلة بنظام Remix MeDo ERP
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
