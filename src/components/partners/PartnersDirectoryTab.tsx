import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Coins,
  Percent,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  CreditCard,
  Eye,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";
import { TenantIsolationService } from "../../services/tenantIsolationService";
import {
  Partner,
  PartnerContribution,
  ProfitDistribution,
  PartnerWithdrawal,
  CurrencyCode,
} from "../../types/erp";
import { formatMoney } from "../../services/erpStorage";

interface PartnersDirectoryTabProps {
  partners: Partner[];
  contributions: PartnerContribution[];
  profitDistributions: ProfitDistribution[];
  withdrawals: PartnerWithdrawal[];
  displayCurrency: CurrencyCode;
  onOpenAddPartner: () => void;
  onSelectPartner: (partner: Partner) => void;
  onOpenStatement: (partnerId: string) => void;
  onOpenAddContribution: (partnerId: string) => void;
  onOpenAddWithdrawal: (partnerId: string) => void;
  onEditPartner: (partner: Partner) => void;
  onDeletePartner: (partnerId: string) => void;
  onGoToProfits: () => void;
}

export const PartnersDirectoryTab: React.FC<PartnersDirectoryTabProps> = ({
  partners,
  contributions,
  profitDistributions,
  withdrawals,
  displayCurrency,
  onOpenAddPartner,
  onSelectPartner,
  onOpenStatement,
  onOpenAddContribution,
  onOpenAddWithdrawal,
  onEditPartner,
  onDeletePartner,
  onGoToProfits,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Summary Metrics
  const totalCapital = partners.reduce((sum, p) => sum + p.capitalAmount, 0);
  const totalPaidCapital = partners.reduce((sum, p) => sum + p.paidCapital, 0);
  const totalShares = partners.reduce((sum, p) => sum + p.sharePercentage, 0);
  const totalProfitsDistributed = profitDistributions.reduce((sum, d) => sum + d.distributableAmount, 0);

  // Filter partners
  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.nameEn && p.nameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.phone && p.phone.includes(searchTerm)) ||
      (p.idNumber && p.idNumber.includes(searchTerm));

    const matchesType = typeFilter === "ALL" || p.partnerType === typeFilter;
    return matchesSearch && matchesType;
  });

  const getPartnerTypeBadge = (type: string) => {
    switch (type) {
      case "MAIN":
        return <span className="px-2 py-0.5 text-[11px] rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">شريك رئيسي</span>;
      case "GENERAL":
        return <span className="px-2 py-0.5 text-[11px] rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">شريك عادي / متضامن</span>;
      case "LIMITED":
        return <span className="px-2 py-0.5 text-[11px] rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">شريك موصي</span>;
      case "WORKING":
        return <span className="px-2 py-0.5 text-[11px] rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">شريك عامل</span>;
      case "SILENT":
        return <span className="px-2 py-0.5 text-[11px] rounded-md bg-slate-500/20 text-slate-300 border border-slate-500/30 font-bold">شريك صامت</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">مساهم</span>;
    }
  };

  const colors = [
    "bg-emerald-500",
    "bg-teal-500",
    "bg-sky-500",
    "bg-amber-500",
    "bg-indigo-500",
    "bg-rose-500",
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">إجمالي رأس المال</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-slate-100 font-mono">
            {formatMoney(totalCapital, displayCurrency)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span>المدفوع: {formatMoney(totalPaidCapital, displayCurrency)}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">عدد الشركاء المعتمدين</span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-black text-slate-100 font-mono">
            {partners.length} <span className="text-xs font-normal text-slate-400">شركاء</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {TenantIsolationService.getActiveTenantDetails()?.nameAr || "مجموعة بن زياد"}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">إجمالي الحصص المكتتبة</span>
            <Percent className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-black text-slate-100 font-mono">
            {totalShares}%
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            {totalShares === 100 ? "مكتملة بنسبة 100% ✅" : `متاح للاكتتاب: ${100 - totalShares}%`}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">إجمالي الأرباح الموزعة</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">
            {formatMoney(totalProfitsDistributed, displayCurrency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            وفق القرارات المعتمدة للجمعية
          </div>
        </div>
      </div>

      {/* Visual Ownership Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200">هيكل الملكية ورأس المال (Visual Equity Distribution):</span>
          <span className="font-mono text-emerald-400 font-bold">{totalShares}% مكتمل</span>
        </div>

        <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800 gap-0.5">
          {partners.map((p, idx) => (
            <div
              key={p.id}
              style={{ width: `${p.sharePercentage}%` }}
              title={`${p.name}: ${p.sharePercentage}%`}
              className={`h-full ${colors[idx % colors.length]} rounded-sm transition-all hover:opacity-90 cursor-pointer`}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          {partners.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`} />
              <span className="text-slate-300 font-medium">{p.name}</span>
              <span className="font-mono font-bold text-slate-400">({p.sharePercentage}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search, Filter, and Action Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالاسم، رقم الهاتف، أو الهوية..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
            >
              <option value="ALL">جميع أنواع الشركاء</option>
              <option value="MAIN">شريك رئيسي</option>
              <option value="GENERAL">شريك عادي / متضامن</option>
              <option value="LIMITED">شريك موصي</option>
              <option value="WORKING">شريك عامل</option>
              <option value="SILENT">شريك صامت</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onGoToProfits}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 border border-emerald-700/50 hover:bg-emerald-950/80 transition-colors flex items-center gap-1.5"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>توزيع أرباح</span>
          </button>

          <button
            onClick={onOpenAddPartner}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة شريك جديد</span>
          </button>
        </div>
      </div>

      {/* Partners Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="p-3.5">#</th>
              <th className="p-3.5">اسم الشريك</th>
              <th className="p-3.5">نوع الشريك</th>
              <th className="p-3.5">نسبة الحصة</th>
              <th className="p-3.5">رأس المال المكتتب</th>
              <th className="p-3.5">المدفوع فعلياً</th>
              <th className="p-3.5">الحالة</th>
              <th className="p-3.5 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredPartners.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  لا توجد نتائج مطابقة لخيارات البحث
                </td>
              </tr>
            ) : (
              filteredPartners.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-mono text-slate-500">{idx + 1}</td>
                  <td className="p-3.5">
                    <button
                      onClick={() => onSelectPartner(p)}
                      className="text-right hover:text-emerald-400 transition-colors group"
                    >
                      <div className="font-bold text-slate-100 group-hover:text-emerald-400">{p.name}</div>
                      {p.nameEn && <div className="text-[11px] text-slate-500 font-sans" dir="ltr">{p.nameEn}</div>}
                    </button>
                  </td>
                  <td className="p-3.5">{getPartnerTypeBadge(p.partnerType)}</td>
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-emerald-400 text-sm">{p.sharePercentage}%</span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-slate-100">
                    {formatMoney(p.capitalAmount, displayCurrency)}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                    {formatMoney(p.paidCapital, displayCurrency)}
                  </td>
                  <td className="p-3.5">
                    {p.isActive ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        نشط ✅
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        معلق ⏸️
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onSelectPartner(p)}
                        title="تفاصيل الشريك ومحفظته"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenStatement(p.id)}
                        title="كشف حساب الشريك"
                        className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenAddContribution(p.id)}
                        title="إضافة مساهمة رأس مال"
                        className="p-1.5 rounded-lg text-teal-400 hover:text-teal-300 hover:bg-teal-950/40 transition-colors"
                      >
                        <Coins className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenAddWithdrawal(p.id)}
                        title="تسجيل مسحوبات شخصية"
                        className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditPartner(p)}
                        title="تعديل الشريك"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeletePartner(p.id)}
                        title="حذف الشريك"
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-slate-950 border-t border-slate-800 font-bold text-xs">
            <tr>
              <td colSpan={3} className="p-3.5 text-slate-300">
                إجمالي الشركاء ورؤوس الأموال
              </td>
              <td className="p-3.5 font-mono text-emerald-400">{totalShares}%</td>
              <td className="p-3.5 font-mono text-slate-100">{formatMoney(totalCapital, displayCurrency)}</td>
              <td className="p-3.5 font-mono text-emerald-400">{formatMoney(totalPaidCapital, displayCurrency)}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
