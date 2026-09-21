import React, { useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Percent,
  Coins,
  Shield,
  FileText,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Printer,
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

interface PartnerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner | null;
  contributions: PartnerContribution[];
  profitDistributions: ProfitDistribution[];
  withdrawals: PartnerWithdrawal[];
  displayCurrency: CurrencyCode;
  onOpenAddContribution: (partnerId: string) => void;
  onOpenAddWithdrawal: (partnerId: string) => void;
  onOpenStatement: (partnerId: string) => void;
  onEditPartner: (partner: Partner) => void;
}

export const PartnerDetailsModal: React.FC<PartnerDetailsModalProps> = ({
  isOpen,
  onClose,
  partner,
  contributions,
  profitDistributions,
  withdrawals,
  displayCurrency,
  onOpenAddContribution,
  onOpenAddWithdrawal,
  onOpenStatement,
  onEditPartner,
}) => {
  if (!isOpen || !partner) return null;

  const [activeTab, setActiveTab] = useState<"SUMMARY" | "CONTRIBUTIONS" | "PROFITS" | "WITHDRAWALS">("SUMMARY");

  const partnerContribs = contributions.filter((c) => c.partnerId === partner.id);
  const partnerWithdrawals = withdrawals.filter((w) => w.partnerId === partner.id);

  // Extract profit shares for this partner
  const partnerProfits: {
    distributionId: string;
    fiscalYear: number;
    distributionDate: string;
    profitAmount: number;
    status: string;
    paidDate?: string;
  }[] = [];

  profitDistributions.forEach((dist) => {
    const share = dist.shares.find((s) => s.partnerId === partner.id);
    if (share) {
      partnerProfits.push({
        distributionId: dist.id,
        fiscalYear: dist.fiscalYear,
        distributionDate: dist.distributionDate,
        profitAmount: share.profitAmount,
        status: share.status,
        paidDate: share.paidDate,
      });
    }
  });

  const totalContributions = partnerContribs.reduce((sum, c) => sum + c.amount, 0);
  const totalProfits = partnerProfits.reduce((sum, p) => sum + p.profitAmount, 0);
  const totalWithdrawals = partnerWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const currentNetBalance = partner.paidCapital + totalProfits - totalWithdrawals;

  const getPartnerTypeBadge = (type: string) => {
    switch (type) {
      case "MAIN":
        return <span className="px-2.5 py-1 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">شريك رئيسي ومؤسس</span>;
      case "GENERAL":
        return <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">شريك متضامن / عادي</span>;
      case "LIMITED":
        return <span className="px-2.5 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold">شريك موصي (مسؤولية محدودة)</span>;
      case "WORKING":
        return <span className="px-2.5 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">شريك عامل</span>;
      case "SILENT":
        return <span className="px-2.5 py-1 text-xs rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/40 font-bold">شريك صامت (مستثمر)</span>;
      default:
        return <span className="px-2.5 py-1 text-xs rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold">مساهم</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xl shadow-inner">
              {partner.name.substring(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-slate-100">{partner.name}</h2>
                {getPartnerTypeBadge(partner.partnerType)}
                {partner.isActive ? (
                  <span className="px-2 py-0.5 text-[11px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    نشط ✅
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[11px] rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    معلق ⏸️
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>{partner.nameEn || "Partner"}</span>
                <span>•</span>
                <span>تاريخ الانضمام: {partner.joinDate}</span>
                <span>•</span>
                <span className="font-bold text-emerald-400">الحصة: {partner.sharePercentage}%</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditPartner(partner)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              تعديل البيانات
            </button>
            <button
              onClick={() => onOpenStatement(partner.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-md flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>كشف الحساب</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab("SUMMARY")}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "SUMMARY"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-4 h-4" />
            <span>نظرة عامة والبيانات المالية</span>
          </button>
          <button
            onClick={() => setActiveTab("CONTRIBUTIONS")}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "CONTRIBUTIONS"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>المساهمات ورأس المال ({partnerContribs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("PROFITS")}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "PROFITS"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>الأرباح الموزعة ({partnerProfits.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("WITHDRAWALS")}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "WITHDRAWALS"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>المسحوبات الجارية ({partnerWithdrawals.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "SUMMARY" && (
            <div className="space-y-6">
              {/* Top Financial Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">نسبة الملكية في الشركة</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {partner.sharePercentage}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">من إجمالي رأس المال</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">رأس المال المكتتب</span>
                  <span className="text-lg font-black text-slate-100 font-mono">
                    {formatMoney(partner.capitalAmount, displayCurrency)}
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-1">
                    مدفوع: {formatMoney(partner.paidCapital, displayCurrency)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">إجمالي الأرباح الموزعة</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {formatMoney(totalProfits, displayCurrency)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    مستحقات معتمدة ومسددة
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">رصيد الحساب الجاري الحالي</span>
                  <span className={`text-lg font-black font-mono ${currentNetBalance >= 0 ? "text-teal-400" : "text-rose-400"}`}>
                    {formatMoney(currentNetBalance, displayCurrency)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    شامل رأس المال والأرباح والمسحوبات
                  </span>
                </div>
              </div>

              {/* Personal & Legal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3">
                  <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>البيانات الشخصية وجهات الاتصال</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-y-3 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-0.5">رقم الهوية:</span>
                      <span className="text-slate-200 font-mono">{partner.idNumber || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">رقم الجوال:</span>
                      <span className="text-slate-200 font-mono" dir="ltr">{partner.phone || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">البريد الإلكتروني:</span>
                      <span className="text-slate-200 font-mono" dir="ltr">{partner.email || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">العنوان:</span>
                      <span className="text-slate-200">{partner.address || "غير محدد"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3">
                  <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>الشروط والمسؤولية القانونية</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {partner.notes || "لا توجد شروط خاصة إضافية مسجلة لهذا الشريك."}
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => onOpenAddContribution(partner.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-300 hover:text-emerald-200 bg-emerald-950/50 border border-emerald-700/50 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة مساهمة جديدة</span>
                    </button>
                    <button
                      onClick={() => onOpenAddWithdrawal(partner.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-950/50 border border-amber-700/50 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>تسجيل مسحوبات</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "CONTRIBUTIONS" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">سجل مساهمات الشريك وحصص رأس المال</h3>
                  <p className="text-xs text-slate-400">إجمالي المساهمات المسجلة: {formatMoney(totalContributions, displayCurrency)}</p>
                </div>
                <button
                  onClick={() => onOpenAddContribution(partner.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center gap-2 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة مساهمة</span>
                </button>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-3">التاريخ</th>
                      <th className="p-3">نوع المساهمة</th>
                      <th className="p-3">المبلغ</th>
                      <th className="p-3">الحساب المستلم</th>
                      <th className="p-3">البيان</th>
                      <th className="p-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {partnerContribs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500">
                          لا توجد مساهمات مسجلة بعد لهذا الشريك
                        </td>
                      </tr>
                    ) : (
                      partnerContribs.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-900/40">
                          <td className="p-3 font-mono text-slate-400">{c.date}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                              {c.contributionType === "CASH" ? "نقدية" : c.contributionType === "IN_KIND" ? "عينية/أصول" : "أخرى"}
                            </span>
                          </td>
                          <td className="p-3 font-bold font-mono text-emerald-400">
                            {formatMoney(c.amount, displayCurrency)}
                          </td>
                          <td className="p-3 font-mono text-slate-400">{c.referenceAccount || "110101"}</td>
                          <td className="p-3 text-slate-200">{c.description}</td>
                          <td className="p-3">
                            <span className="text-emerald-400 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>مسددة</span>
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "PROFITS" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200">الأرباح الموزعة والمستحقة للشريك</h3>
                <p className="text-xs text-slate-400">إجمالي الأرباح المقررة: {formatMoney(totalProfits, displayCurrency)}</p>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-3">السنة المالية</th>
                      <th className="p-3">تاريخ الاعتماد</th>
                      <th className="p-3">حصة الشريك من الأرباح</th>
                      <th className="p-3">الحالة</th>
                      <th className="p-3">تاريخ الصرف الفعلي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {partnerProfits.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500">
                          لا توجد توزيعات أرباح مسجلة لهذا الشريك
                        </td>
                      </tr>
                    ) : (
                      partnerProfits.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="p-3 font-bold text-slate-100">سنة {p.fiscalYear}</td>
                          <td className="p-3 font-mono text-slate-400">{p.distributionDate}</td>
                          <td className="p-3 font-bold font-mono text-emerald-400 text-sm">
                            {formatMoney(p.profitAmount, displayCurrency)}
                          </td>
                          <td className="p-3">
                            {p.status === "PAID" ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                                تم الصرف بالكامل ✅
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                                معتمد وقيد الصرف ⏳
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-slate-400">{p.paidDate || "قيد التسوية"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "WITHDRAWALS" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">سجل المسحوبات الشخصية للشريك (الجاري المدين)</h3>
                  <p className="text-xs text-slate-400">إجمالي المسحوبات: {formatMoney(totalWithdrawals, displayCurrency)}</p>
                </div>
                <button
                  onClick={() => onOpenAddWithdrawal(partner.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center gap-2 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>تسجيل سحب</span>
                </button>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-3">التاريخ</th>
                      <th className="p-3">طريقة الصرف</th>
                      <th className="p-3">المبلغ المسحوب</th>
                      <th className="p-3">البيان والسبب</th>
                      <th className="p-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {partnerWithdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500">
                          لا توجد مسحوبات جارية مسجلة لهذا الشريك
                        </td>
                      </tr>
                    ) : (
                      partnerWithdrawals.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-900/40">
                          <td className="p-3 font-mono text-slate-400">{w.date}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
                              {w.paymentMethod === "CASH" ? "نقداً" : w.paymentMethod === "BANK" ? "تحويل بنكي" : "شيك"}
                            </span>
                          </td>
                          <td className="p-3 font-bold font-mono text-amber-400">
                            {formatMoney(w.amount, displayCurrency)}
                          </td>
                          <td className="p-3 text-slate-200">{w.description}</td>
                          <td className="p-3">
                            <span className="text-emerald-400 font-bold">مصروف ومرحل ✅</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
