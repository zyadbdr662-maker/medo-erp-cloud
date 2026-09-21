import React, { useState } from "react";
import {
  FileText,
  Printer,
  FileSpreadsheet,
  Send,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Building,
} from "lucide-react";
import {
  Partner,
  PartnerContribution,
  ProfitDistribution,
  PartnerWithdrawal,
  CurrencyCode,
} from "../../types/erp";
import { formatMoney } from "../../services/erpStorage";

interface PartnerStatementTabProps {
  partners: Partner[];
  contributions: PartnerContribution[];
  profitDistributions: ProfitDistribution[];
  withdrawals: PartnerWithdrawal[];
  displayCurrency: CurrencyCode;
  selectedPartnerId?: string;
}

interface StatementEntry {
  id: string;
  date: string;
  type: "INITIAL" | "CONTRIBUTION" | "PROFIT" | "WITHDRAWAL";
  description: string;
  debit: number; // مدين (سحب)
  credit: number; // دائن (مساهمة أو ربح)
  balance: number;
}

export const PartnerStatementTab: React.FC<PartnerStatementTabProps> = ({
  partners,
  contributions,
  profitDistributions,
  withdrawals,
  displayCurrency,
  selectedPartnerId: initialSelectedId,
}) => {
  const [partnerId, setPartnerId] = useState(initialSelectedId || partners[0]?.id || "");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const selectedPartner = partners.find((p) => p.id === partnerId);

  // Build ledger movements
  const entries: StatementEntry[] = [];

  if (selectedPartner) {
    // 1. Initial Paid Capital (if not in contributions or as base)
    // Add base contributions
    const partnerContribs = contributions.filter((c) => c.partnerId === selectedPartner.id);
    partnerContribs.forEach((c) => {
      entries.push({
        id: c.id,
        date: c.date,
        type: "CONTRIBUTION",
        description: c.description || "مساهمة في رأس المال",
        debit: 0,
        credit: c.amount,
        balance: 0,
      });
    });

    // 2. Profit distributions
    profitDistributions.forEach((dist) => {
      const share = dist.shares.find((s) => s.partnerId === selectedPartner.id);
      if (share) {
        entries.push({
          id: `share-${dist.id}`,
          date: dist.distributionDate,
          type: "PROFIT",
          description: `حصة الأرباح السنوية المعتمدة - سنة ${dist.fiscalYear}`,
          debit: 0,
          credit: share.profitAmount,
          balance: 0,
        });
      }
    });

    // 3. Withdrawals
    const partnerWithdrawals = withdrawals.filter((w) => w.partnerId === selectedPartner.id);
    partnerWithdrawals.forEach((w) => {
      entries.push({
        id: w.id,
        date: w.date,
        type: "WITHDRAWAL",
        description: w.description || "مسحوبات شخصية نقدية على ذمة الأرباح",
        debit: w.amount,
        credit: 0,
        balance: 0,
      });
    });

    // Sort chronologically
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let runningBalance = 0;
    entries.forEach((e) => {
      runningBalance += e.credit - e.debit;
      e.balance = runningBalance;
    });
  }

  // Filter by date
  const filteredEntries = entries.filter((e) => e.date >= startDate && e.date <= endDate);

  const totalDebits = filteredEntries.reduce((s, e) => s + e.debit, 0);
  const totalCredits = filteredEntries.reduce((s, e) => s + e.credit, 0);
  const finalBalance = filteredEntries.length > 0 ? filteredEntries[filteredEntries.length - 1].balance : 0;

  const handleExportCSV = () => {
    if (!selectedPartner) return;
    const headers = "التاريخ,البيان,مدين (مسحوبات),دائن (مساهمات وأرباح),الرصيد التراكمي\n";
    const rows = filteredEntries
      .map((e) => `"${e.date}","${e.description}","${e.debit}","${e.credit}","${e.balance}"`)
      .join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `كشف_حساب_الشريك_${selectedPartner.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendWhatsApp = () => {
    if (!selectedPartner) return;
    const phone = selectedPartner.phone?.replace(/[^0-9]/g, "");
    if (!phone) {
      alert("لا يوجد رقم هاتف مسجل لهذا الشريك");
      return;
    }
    const msg = encodeURIComponent(
      `الأستاذ الشريك المحترم / ${selectedPartner.name}\nالسلام عليكم ورحمة الله وبركاته،\n\nنرفق لكم ملخص كشف الحساب الجاري لدى مجموعة بن زياد:\n- إجمالي الدائن (المساهمات والأرباح): ${totalCredits.toLocaleString()} ريال\n- إجمالي المدين (المسحوبات الشخصية): ${totalDebits.toLocaleString()} ريال\n- الرصيد الصافي المستحق: ${finalBalance.toLocaleString()} ريال يمني\n\nمع التحية،\nالإدارة المالية المركزية`
    );
    window.open(`https://wa.me/${phone.startsWith("967") ? phone : "967" + phone}?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Partner Picker */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              اختيار الشريك:
            </label>
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none min-w-[200px]"
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sharePercentage}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">من تاريخ:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">إلى تاريخ:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"
            />
          </div>
        </div>

        {/* Export & Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel / CSV</span>
          </button>
          <button
            onClick={handleSendWhatsApp}
            className="px-3 py-2 rounded-xl text-xs font-medium text-teal-300 hover:text-teal-200 bg-teal-950/60 border border-teal-700/50 transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>واتساب</span>
          </button>
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة كشف الحساب</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {selectedPartner && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">الشريك والحصة</span>
            <span className="text-base font-bold text-slate-100 block">{selectedPartner.name}</span>
            <span className="text-xs text-emerald-400 font-mono font-bold mt-1 block">
              نسبة الملكية: {selectedPartner.sharePercentage}%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">إجمالي الحركات الدائنة (مساهمات وأرباح)</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              {formatMoney(totalCredits, displayCurrency)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">حساب رأس المال + الأرباح</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">إجمالي الحركات المدينة (مسحوبات شخصية)</span>
            <span className="text-lg font-black text-amber-400 font-mono">
              {formatMoney(totalDebits, displayCurrency)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">مسحوبات نقدية وبنكية</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">الرصيد الصافي المستحق للشريك</span>
            <span className={`text-lg font-black font-mono ${finalBalance >= 0 ? "text-teal-400" : "text-rose-400"}`}>
              {formatMoney(finalBalance, displayCurrency)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              {finalBalance >= 0 ? "رصيد دائن لصالح الشريك" : "رصيد مدين على الشريك"}
            </span>
          </div>
        </div>
      )}

      {/* Statement Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="p-3.5">#</th>
              <th className="p-3.5">التاريخ</th>
              <th className="p-3.5">البيان والتفاصيل</th>
              <th className="p-3.5">مدين (مسحوبات)</th>
              <th className="p-3.5">دائن (مساهمات / أرباح)</th>
              <th className="p-3.5">الرصيد التراكمي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  لا توجد حركات مالية مسجلة لهذا الشريك خلال الفترة المحددة
                </td>
              </tr>
            ) : (
              filteredEntries.map((e, idx) => (
                <tr key={e.id} className="hover:bg-slate-800/30">
                  <td className="p-3.5 text-slate-500 font-mono">{idx + 1}</td>
                  <td className="p-3.5 font-mono text-slate-400">{e.date}</td>
                  <td className="p-3.5">
                    <span className="font-medium text-slate-200">{e.description}</span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-amber-400">
                    {e.debit > 0 ? formatMoney(e.debit, displayCurrency) : "-"}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                    {e.credit > 0 ? formatMoney(e.credit, displayCurrency) : "-"}
                  </td>
                  <td className={`p-3.5 font-mono font-black ${e.balance >= 0 ? "text-teal-400" : "text-rose-400"}`}>
                    {formatMoney(e.balance, displayCurrency)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-slate-950 border-t border-slate-800 font-bold text-xs">
            <tr>
              <td colSpan={3} className="p-3.5 text-slate-300">
                إجمالي حركات الفترة المحددة
              </td>
              <td className="p-3.5 text-amber-400 font-mono">{formatMoney(totalDebits, displayCurrency)}</td>
              <td className="p-3.5 text-emerald-400 font-mono">{formatMoney(totalCredits, displayCurrency)}</td>
              <td className="p-3.5 text-teal-400 font-mono">{formatMoney(finalBalance, displayCurrency)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Official Print Modal */}
      {isPrintModalOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl p-8 overflow-y-auto max-h-[92vh] shadow-2xl relative font-sans">
            {/* Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <h1 className="text-xl font-black">مجموعة بن زياد التجارية - ميدو تك</h1>
              <p className="text-xs text-slate-600 mt-0.5">الإدارة العامة والسيادية • الشؤون المالية والحسابات</p>
              <h2 className="text-base font-black text-emerald-800 mt-2">كشف حساب الشريك الجاري</h2>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mt-2 px-4">
                <span>اسم الشريك: {selectedPartner.name}</span>
                <span>الحصة: {selectedPartner.sharePercentage}%</span>
                <span>الفترة: من {startDate} إلى {endDate}</span>
              </div>
            </div>

            {/* Table */}
            <table className="w-full border-collapse border border-slate-300 text-center text-xs">
              <thead className="bg-slate-200 font-bold">
                <tr>
                  <th className="border border-slate-300 p-2">#</th>
                  <th className="border border-slate-300 p-2">التاريخ</th>
                  <th className="border border-slate-300 p-2 text-right pr-2">البيان</th>
                  <th className="border border-slate-300 p-2">مدين (سحب)</th>
                  <th className="border border-slate-300 p-2">دائن (مساهمة/ربح)</th>
                  <th className="border border-slate-300 p-2">الرصيد</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((e, idx) => (
                  <tr key={e.id}>
                    <td className="border border-slate-300 p-2 font-mono">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-mono">{e.date}</td>
                    <td className="border border-slate-300 p-2 text-right pr-2">{e.description}</td>
                    <td className="border border-slate-300 p-2 font-mono font-bold text-amber-700">
                      {e.debit > 0 ? e.debit.toLocaleString() : "-"}
                    </td>
                    <td className="border border-slate-300 p-2 font-mono font-bold text-emerald-800">
                      {e.credit > 0 ? e.credit.toLocaleString() : "-"}
                    </td>
                    <td className="border border-slate-300 p-2 font-mono font-bold">
                      {e.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold">
                <tr>
                  <td colSpan={3} className="border border-slate-300 p-2 text-right pr-2">
                    الإجمالي النهائي
                  </td>
                  <td className="border border-slate-300 p-2 font-mono">{totalDebits.toLocaleString()}</td>
                  <td className="border border-slate-300 p-2 font-mono">{totalCredits.toLocaleString()}</td>
                  <td className="border border-slate-300 p-2 font-mono text-emerald-800">
                    {finalBalance.toLocaleString()} ريال
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Signature Area */}
            <div className="pt-10 flex justify-between items-center text-center font-bold text-xs">
              <div>
                <p className="text-slate-600 mb-8">إعداد المحاسب القانوني</p>
                <p className="border-t border-slate-400 pt-1">................................</p>
              </div>
              <div>
                <p className="text-slate-600 mb-8">اعتماد المدير المالي</p>
                <p className="border-t border-slate-400 pt-1">................................</p>
              </div>
              <div>
                <p className="text-slate-600 mb-8">توقيع ومصادقة الشريك</p>
                <p className="border-t border-slate-400 pt-1">{selectedPartner.name}</p>
              </div>
            </div>

            {/* Print Modal Buttons */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-end gap-3 print:hidden">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300"
              >
                إغلاق
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الكشف</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
