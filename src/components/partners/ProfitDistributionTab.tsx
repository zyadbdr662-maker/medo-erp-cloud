import React, { useState } from "react";
import {
  Coins,
  Percent,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  FileSpreadsheet,
  Send,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";
import {
  Partner,
  ProfitDistribution,
  CurrencyCode,
  JournalEntry,
} from "../../types/erp";
import { formatMoney } from "../../services/erpStorage";
import { soundService } from "../../services/notificationSoundService";

interface ProfitDistributionTabProps {
  partners: Partner[];
  distributions: ProfitDistribution[];
  displayCurrency: CurrencyCode;
  onSaveDistribution: (newDist: ProfitDistribution, autoPostJournal: boolean) => void;
  onMarkSharePaid: (distId: string, partnerId: string) => void;
}

export const ProfitDistributionTab: React.FC<ProfitDistributionTabProps> = ({
  partners,
  distributions,
  displayCurrency,
  onSaveDistribution,
  onMarkSharePaid,
}) => {
  const [fiscalYear, setFiscalYear] = useState<number>(2026);
  const [totalProfit, setTotalProfit] = useState<number>(10000000);
  const [reservedPercentage, setReservedPercentage] = useState<number>(20);
  const [notes, setNotes] = useState("توزيع الأرباح السنوية المعتمدة بقرار مجلس الإدارة والجمعية العمومية");
  const [showNewDistForm, setShowNewDistForm] = useState(false);
  const [selectedDistForPrint, setSelectedDistForPrint] = useState<ProfitDistribution | null>(null);

  // Math
  const reservedAmount = (totalProfit * reservedPercentage) / 100;
  const distributableAmount = Math.max(0, totalProfit - reservedAmount);

  // Active partners calculation
  const activePartners = partners.filter((p) => p.isActive);
  const totalShares = activePartners.reduce((s, p) => s + p.sharePercentage, 0);

  const handleApproveAndPost = () => {
    if (distributableAmount <= 0) {
      alert("يرجى إدخال مبلغ أرباح صحيح قابل للتوزيع");
      return;
    }

    const shares = activePartners.map((p) => {
      // Calculate share relative to active partners percentage
      const normalizedPercent = totalShares > 0 ? (p.sharePercentage / totalShares) * 100 : p.sharePercentage;
      const profitShare = Math.round((distributableAmount * p.sharePercentage) / 100);
      return {
        partnerId: p.id,
        partnerName: p.name,
        sharePercentage: p.sharePercentage,
        profitAmount: profitShare,
        status: "PENDING" as const,
        notes: `حصة الأرباح السنوية لسنة ${fiscalYear}`,
      };
    });

    const newDist: ProfitDistribution = {
      id: `pdist-${fiscalYear}-${Date.now().toString().slice(-4)}`,
      fiscalYear,
      totalProfit,
      reservedPercentage,
      reservedAmount,
      distributableAmount,
      distributionDate: new Date().toISOString().split("T")[0],
      status: "APPROVED",
      createdBy: "الأستاذ بدر عايض محمد",
      notes: notes.trim(),
      shares,
    };

    onSaveDistribution(newDist, true);
    soundService.playSound("ROYAL_BANK_CHIME");
    setShowNewDistForm(false);
  };

  const handleExportCSV = (dist: ProfitDistribution) => {
    const headers = "اسم الشريك,نسبة الحصة,المبلغ المستحق (ريال),الحالة,ملاحظات\n";
    const rows = dist.shares
      .map(
        (s) =>
          `"${s.partnerName}","${s.sharePercentage}%","${s.profitAmount}","${s.status === "PAID" ? "مدفوع" : "معتمد"}","${s.notes || ""}"`
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `توزيع_أرباح_سنة_${dist.fiscalYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendWhatsApp = (partner: Partner, amount: number, year: number) => {
    const phone = partner.phone?.replace(/[^0-9]/g, "");
    if (!phone) {
      alert("لا يوجد رقم هاتف مسجل لهذا الشريك");
      return;
    }
    const msg = encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته،\nالأستاذ الشريك المحترم / ${partner.name}\n\nنود إحاطتكم بأنه تم اعتماد توزيع أرباح السنة المالية ${year} بنجاح لدى مجموعة بن زياد / ميدو تك.\nحصتكم المقررة من الأرباح: ${amount.toLocaleString()} ريال يمني (نسبة ${partner.sharePercentage}%).\n\nمع خالص التقدير،\nالإدارة المالية المركزية`
    );
    window.open(`https://wa.me/${phone.startsWith("967") ? phone : "967" + phone}?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and New Distribution Toggle */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              الوحدة الذكية لتوزيع الأرباح
            </span>
            <span className="text-xs text-slate-400">سنة مالية مستقلة ومعتمدة</span>
          </div>
          <h2 className="text-lg font-black text-slate-100">
            توزيع الأرباح وحصص الشركاء السنوية
          </h2>
          <p className="text-xs text-slate-400">
            حساب حصص الشركاء آلياً وفق نسب رأس المال المعتمدة مع الترحيل التلقائي للقيود المحاسبية
          </p>
        </div>

        <button
          onClick={() => setShowNewDistForm(!showNewDistForm)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{showNewDistForm ? "إخفاء نموذج الإعداد" : "إعداد وتوزيع أرباح جديدة"}</span>
        </button>
      </div>

      {/* New Distribution Wizard Form */}
      {showNewDistForm && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-600/40 shadow-xl space-y-6 animate-in slide-in-from-top-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Coins className="w-4 h-4" />
              <span>إعداد قرار توزيع الأرباح الجديد</span>
            </h3>
            <span className="text-xs text-slate-400">
              مجموع حصص الشركاء النشطين: {totalShares}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                السنة المالية *
              </label>
              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none"
              >
                <option value={2027}>السنة المالية 2027</option>
                <option value={2026}>السنة المالية 2026</option>
                <option value={2025}>السنة المالية 2025</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                إجمالي صافي الأرباح السنوية (ريال) *
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                value={totalProfit}
                onChange={(e) => setTotalProfit(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                نسبة الأرباح المحتجزة / الاحتياطي (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={reservedPercentage}
                  onChange={(e) => setReservedPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100"
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">%</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-center">
              <span className="text-[11px] text-slate-400">الأرباح القابلة للتوزيع</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {formatMoney(distributableAmount, displayCurrency)}
              </span>
              <span className="text-[10px] text-slate-500">
                المحتجز: {formatMoney(reservedAmount, displayCurrency)}
              </span>
            </div>
          </div>

          {/* Shares Calculation Preview Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-2">
              جدول الحصص المحسوبة تلقائياً للشركاء:
            </h4>
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">اسم الشريك</th>
                    <th className="p-3">النوع</th>
                    <th className="p-3">نسبة الحصة</th>
                    <th className="p-3">حصة الشريك من الأرباح</th>
                    <th className="p-3">الحالة الأولية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {activePartners.map((p, idx) => {
                    const share = Math.round((distributableAmount * p.sharePercentage) / 100);
                    return (
                      <tr key={p.id}>
                        <td className="p-3 text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-100">{p.name}</td>
                        <td className="p-3 text-slate-400">{p.partnerType}</td>
                        <td className="p-3 font-bold text-emerald-400">{p.sharePercentage}%</td>
                        <td className="p-3 font-bold font-mono text-emerald-400">
                          {formatMoney(share, displayCurrency)}
                        </td>
                        <td className="p-3">
                          <span className="text-amber-400 font-medium">معتمد وقيد الصرف ⏳</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-900/80 border-t border-slate-800 font-bold">
                  <tr>
                    <td colSpan={3} className="p-3 text-slate-300">الإجمالي القابل للتوزيع</td>
                    <td className="p-3 text-emerald-400">{totalShares}%</td>
                    <td className="p-3 text-emerald-400 font-mono">{formatMoney(distributableAmount, displayCurrency)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              ملاحظات قرار مجلس الإدارة
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-slate-100"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>سيتم توليد قيد يومية محاسبي تلقائياً وترحيله للأرباح المبقاة والمستحقة</span>
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowNewDistForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleApproveAndPost}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>اعتماد التوزيع وترحيل القيد المحاسبي</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historical Distributions List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200">سجل قرارات توزيع الأرباح المعتمدة</h3>

        {distributions.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            لا توجد توزيعات أرباح مسجلة بعد. استخدم زر "إعداد وتوزيع أرباح جديدة" بالأعلى للبدء.
          </div>
        ) : (
          distributions.map((dist) => (
            <div
              key={dist.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    {dist.fiscalYear}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">
                        توزيع أرباح السنة المالية {dist.fiscalYear}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {dist.status === "PAID" ? "تم الصرف بالكامل ✅" : "معتمد وقيد الصرف ⏳"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      تاريخ الاعتماد: {dist.distributionDate} • المعتمد: {dist.createdBy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportCSV(dist)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>تصدير Excel</span>
                  </button>
                  <button
                    onClick={() => setSelectedDistForPrint(dist)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة القرار</span>
                  </button>
                </div>
              </div>

              {/* Financial Summary Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-950/20 text-xs border-b border-slate-800/80">
                <div>
                  <span className="text-slate-500 block">إجمالي صافي الأرباح:</span>
                  <span className="font-bold font-mono text-slate-200">
                    {formatMoney(dist.totalProfit, displayCurrency)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">المحتجز / الاحتياطي ({dist.reservedPercentage}%):</span>
                  <span className="font-bold font-mono text-slate-400">
                    {formatMoney(dist.reservedAmount, displayCurrency)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">المبلغ الموزع على الشركاء:</span>
                  <span className="font-bold font-mono text-emerald-400">
                    {formatMoney(dist.distributableAmount, displayCurrency)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">عدد الشركاء المستفيدين:</span>
                  <span className="font-bold text-slate-200">{dist.shares.length} شركاء</span>
                </div>
              </div>

              {/* Shares Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950/40 text-slate-400 border-b border-slate-800/60">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">الشريك</th>
                      <th className="p-3">النسبة</th>
                      <th className="p-3">الحصة المقررة من الأرباح</th>
                      <th className="p-3">الحالة</th>
                      <th className="p-3">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {dist.shares.map((share, idx) => {
                      const partnerObj = partners.find((p) => p.id === share.partnerId);
                      return (
                        <tr key={share.partnerId} className="hover:bg-slate-800/30">
                          <td className="p-3 text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-100">{share.partnerName}</td>
                          <td className="p-3 font-mono text-emerald-400 font-bold">{share.sharePercentage}%</td>
                          <td className="p-3 font-mono font-bold text-slate-100 text-sm">
                            {formatMoney(share.profitAmount, displayCurrency)}
                          </td>
                          <td className="p-3">
                            {share.status === "PAID" ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                مدفوع بالكامل ✅
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                معتمد وقيد الصرف ⏳
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {share.status !== "PAID" && (
                                <button
                                  onClick={() => onMarkSharePaid(dist.id, share.partnerId)}
                                  className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-[11px] font-bold transition-colors"
                                >
                                  صرف الحصة 💰
                                </button>
                              )}
                              {partnerObj && (
                                <button
                                  onClick={() => handleSendWhatsApp(partnerObj, share.profitAmount, dist.fiscalYear)}
                                  className="p-1 rounded bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors"
                                  title="إرسال إشعار عبر الواتساب"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Printable Modal Decision Document */}
      {selectedDistForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl p-8 overflow-y-auto max-h-[92vh] shadow-2xl relative font-sans">
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <h1 className="text-xl font-black">مجموعة بن زياد التجارية - ميدو تك</h1>
              <p className="text-xs text-slate-600 mt-1">الجمهورية اليمنية • الإدارة العامة والسيادية</p>
              <h2 className="text-base font-bold text-emerald-800 mt-3">
                قرار مجلس الإدارة رقم ({selectedDistForPrint.fiscalYear}/01)
              </h2>
              <p className="text-xs font-semibold text-slate-700">
                بشأن اعتماد توزيع الأرباح السنوية للسنة المالية {selectedDistForPrint.fiscalYear}م
              </p>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <p>
                بناءً على النتائج المالية الختامية للسنة المالية المنتهية في {selectedDistForPrint.fiscalYear}م،
                وبموافقة الشركاء المؤسسين والجمعية العمومية، تقرر ما يلي:
              </p>

              <div className="bg-slate-100 p-3 rounded-lg border border-slate-300">
                <p><strong>أولاً:</strong> اعتماد صافي أرباح بمبلغ قدره: <strong>{selectedDistForPrint.totalProfit.toLocaleString()} ريال يمني</strong>.</p>
                <p><strong>ثانياً:</strong> تجنيب نسبة ({selectedDistForPrint.reservedPercentage}%) كأرباح محتجزة واحتياطي قانوني بمبلغ: <strong>{selectedDistForPrint.reservedAmount.toLocaleString()} ريال يمني</strong>.</p>
                <p><strong>ثالثاً:</strong> توزيع المبلغ القابل للتوزيع وقدره: <strong>{selectedDistForPrint.distributableAmount.toLocaleString()} ريال يمني</strong> على الشركاء وفقاً للجدول التالي:</p>
              </div>

              <table className="w-full border-collapse border border-slate-300 text-center text-xs mt-3">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="border border-slate-300 p-2">اسم الشريك</th>
                    <th className="border border-slate-300 p-2">نسبة الحصة</th>
                    <th className="border border-slate-300 p-2">المبلغ المستحق (ريال)</th>
                    <th className="border border-slate-300 p-2">حالة الصرف</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDistForPrint.shares.map((s) => (
                    <tr key={s.partnerId}>
                      <td className="border border-slate-300 p-2 font-bold text-right pr-3">{s.partnerName}</td>
                      <td className="border border-slate-300 p-2">{s.sharePercentage}%</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold">{s.profitAmount.toLocaleString()}</td>
                      <td className="border border-slate-300 p-2">{s.status === "PAID" ? "تم الصرف" : "معتمد"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-8 flex justify-between items-center text-center font-bold">
                <div>
                  <p className="text-slate-600 mb-8">المدير المالي</p>
                  <p className="border-t border-slate-400 pt-1">................................</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-8">رئيس مجلس الإدارة</p>
                  <p className="border-t border-slate-400 pt-1">الأستاذ بدر عايض محمد</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-end gap-3 print:hidden">
              <button
                onClick={() => setSelectedDistForPrint(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300"
              >
                إغلاق
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة المستند</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
