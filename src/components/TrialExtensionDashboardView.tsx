import React, { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Building2,
  User,
  Phone,
  Mail,
  Fingerprint,
  History,
  Send,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import {
  trialService,
  EnterpriseTrialTenant,
  TrialExtensionRecord,
} from "../services/trialService";
import { soundService } from "../services/notificationSoundService";
import { cloudSecurityService } from "../services/cloudSecurityService";

interface TrialExtensionDashboardViewProps {
  currentUserName?: string;
}

export const TrialExtensionDashboardView: React.FC<TrialExtensionDashboardViewProps> = ({
  currentUserName = "مدير النظام الأعلى",
}) => {
  const [tenants, setTenants] = useState<EnterpriseTrialTenant[]>(() =>
    trialService.getEnterpriseTenants()
  );
  const [history, setHistory] = useState<TrialExtensionRecord[]>(() =>
    trialService.getExtensionsHistory()
  );
  const [expiringSoonTenants, setExpiringSoonTenants] = useState<EnterpriseTrialTenant[]>(() =>
    trialService.getExpiringSoonTenants(6)
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "EXPIRING_SOON" | "ACTIVE" | "EXPIRED">("ALL");

  // Extension Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetTenant, setTargetTenant] = useState<EnterpriseTrialTenant | null>(null);
  const [hoursToAdd, setHoursToAdd] = useState<number>(24);
  const [extensionReason, setExtensionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Auto-refresh countdown every 5 seconds
  useEffect(() => {
    const unsub = trialService.subscribe(() => {
      setTenants(trialService.getEnterpriseTenants());
      setHistory(trialService.getExtensionsHistory());
      setExpiringSoonTenants(trialService.getExpiringSoonTenants(6));
    });

    const interval = setInterval(() => {
      setTenants(trialService.getEnterpriseTenants());
      setExpiringSoonTenants(trialService.getExpiringSoonTenants(6));
    }, 5000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const handleOpenExtensionModal = (tenant: EnterpriseTrialTenant, defaultHours: number = 24) => {
    setTargetTenant(tenant);
    setHoursToAdd(defaultHours);
    setExtensionReason(`تمديد استثنائي لمدة ${defaultHours} ساعة لمتابعة تجربة واختبار النظام.`);
    setIsModalOpen(true);
  };

  const handleExecuteExtension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTenant) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const res = trialService.extendTrial(
        targetTenant.id,
        hoursToAdd,
        extensionReason,
        currentUserName
      );

      setIsSubmitting(false);
      setIsModalOpen(false);

      if (res.success && res.tenant) {
        soundService.playSound("SUCCESS_CHIME");
        cloudSecurityService.recordImmutableAudit({
          category: "SECURITY",
          actionType: "TRIAL_PERIOD_EXTENDED",
          actorName: currentUserName,
          actorRole: "SYSTEM_ADMIN",
          details: `تم تمديد الفترة التجريبية لمنشأة "${res.tenant.companyName}" بمقدار (${hoursToAdd} ساعة). السبب: ${extensionReason}`,
        });

        setFeedbackMsg(`✓ تم تمديد الفترة التجريبية لـ (${res.tenant.companyName}) بنجاح بمقدار +${hoursToAdd} ساعة.`);
        setTimeout(() => setFeedbackMsg(null), 6000);
      }
    }, 600);
  };

  const handleQuickExtend = (tenant: EnterpriseTrialTenant, hours: number) => {
    const reason = `تمديد سريع بضغطة زر (+${hours} ساعة) لتفادي انقطاع الخدمة التجريبية.`;
    const res = trialService.extendTrial(tenant.id, hours, reason, currentUserName);
    if (res.success && res.tenant) {
      soundService.playSound("SUCCESS_CHIME");
      cloudSecurityService.recordImmutableAudit({
        category: "SECURITY",
        actionType: "TRIAL_QUICK_EXTENDED",
        actorName: currentUserName,
        actorRole: "SYSTEM_ADMIN",
        details: `تمديد سريع (+${hours} ساعة) للمنشأة: ${res.tenant.companyName}.`,
      });
      setFeedbackMsg(`✓ تم تمديد (${res.tenant.companyName}) بمقدار +${hours} ساعة فوراً.`);
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === "ALL") return true;
    if (selectedFilter === "EXPIRING_SOON") return t.status === "EXPIRING_SOON" || (t.status === "ACTIVE" && t.remainingHours <= 6);
    if (selectedFilter === "ACTIVE") return t.status === "ACTIVE" && t.remainingHours > 6;
    if (selectedFilter === "EXPIRED") return t.status === "EXPIRED";
    return true;
  });

  return (
    <div className="space-y-6 font-['Alexandria','Cairo',sans-serif] text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-blue-500/30 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>لوحة مراقبة وتمديد الفترة التجريبية (Trial Extension Dashboard)</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                إدارة مركزية ⏱️
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              مراقبة صلاحية اشتراكات الـ 48 ساعة التجريبية للمنشآت، التمديد اليدوي بضغطة زر، وتنبيه المدير قبل الانتهاء بـ 6 ساعات مع سجل التمديدات.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTenants(trialService.getEnterpriseTenants());
              setExpiringSoonTenants(trialService.getExpiringSoonTenants(6));
              soundService.playSound("ENTERPRISE_BELL");
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500 text-emerald-200 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 6-Hour Pre-Expiry Urgent Alert Banner */}
      {expiringSoonTenants.length > 0 && (
        <div className="p-5 bg-gradient-to-r from-amber-950/90 via-slate-900 to-red-950/90 border-2 border-amber-500/60 rounded-3xl space-y-3 shadow-2xl animate-pulseSlow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/30 border border-amber-400 flex items-center justify-center text-amber-300 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <span>تنبيه عاجل لمدير النظام: منشآت توشك فترتها التجريبية على الانتهاء خلال 6 ساعات!</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-red-500 text-white">
                    {expiringSoonTenants.length} منشأة ⏳
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  يتطلب اتخاذ قرار سريع بتمديد المهلة أو إرسال رسالة تذكير للمالك عبر واتساب لتفادي إغلاق النظام التجريبي.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {expiringSoonTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="p-3.5 bg-slate-950/90 rounded-2xl border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
              >
                <div className="space-y-1">
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>{tenant.companyName}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center gap-2">
                    <span>المالك: {tenant.ownerName}</span>
                    <span>•</span>
                    <span className="font-mono text-amber-400 font-bold">
                      متبقي: {tenant.remainingHours} س و {tenant.remainingMinutes} د
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleQuickExtend(tenant, 24)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black transition cursor-pointer shadow"
                  >
                    +24 ساعة ⚡
                  </button>
                  <button
                    onClick={() => handleOpenExtensionModal(tenant)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition cursor-pointer shadow"
                  >
                    تخصيص التمديد
                  </button>
                  <a
                    href={`https://wa.me/${tenant.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `مرحباً ${tenant.ownerName}، نود إبلاغكم بأن الفترة التجريبية لمنشأتكم (${tenant.companyName}) في منظومة MeDo ERP توشك على الانتهاء خلال ${tenant.remainingHours} ساعات. هل ترغبون بتمديد الفترة؟`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center"
                    title="مراسلة المالك عبر واتساب"
                  >
                    <Send className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-blue-500/20 shadow-lg space-y-1">
          <div className="text-xs text-slate-400 font-bold flex items-center justify-between">
            <span>إجمالي المنشآت التجريبية</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-mono font-black text-white">{tenants.length}</div>
          <div className="text-[11px] text-slate-400">منظومة SaaS متعددة المستأجرين</div>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-emerald-500/20 shadow-lg space-y-1">
          <div className="text-xs text-slate-400 font-bold flex items-center justify-between">
            <span>الاشتراكات النشطة حالياً</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-black text-emerald-400">
            {tenants.filter((t) => t.status === "ACTIVE").length}
          </div>
          <div className="text-[11px] text-emerald-400/80">ضمن مهلة الـ 48 ساعة السارية</div>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-amber-500/20 shadow-lg space-y-1">
          <div className="text-xs text-slate-400 font-bold flex items-center justify-between">
            <span>أقل من 6 ساعات (تنبيه مسبق)</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-black text-amber-400">
            {expiringSoonTenants.length}
          </div>
          <div className="text-[11px] text-amber-400/80">تتطلب تمديداً أو ترقية فورية</div>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-purple-500/20 shadow-lg space-y-1">
          <div className="text-xs text-slate-400 font-bold flex items-center justify-between">
            <span>إجمالي حركات التمديد</span>
            <History className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-mono font-black text-purple-300">{history.length}</div>
          <div className="text-[11px] text-slate-400">مسجلة في سجل تاريخ التمديدات</div>
        </div>
      </div>

      {/* Tenants Table Section */}
      <div className="bg-slate-900/90 border border-blue-500/30 p-5 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-black text-white">سجل المنشآت التجريبية وصلاحيات التشغيل</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="بحث عن منشأة، مالك، هاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 pr-8 text-xs text-white focus:outline-none focus:border-blue-500 w-48 sm:w-60"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setSelectedFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  selectedFilter === "ALL" ? "bg-indigo-600 text-white" : "text-slate-400"
                }`}
              >
                الكل ({tenants.length})
              </button>
              <button
                onClick={() => setSelectedFilter("EXPIRING_SOON")}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  selectedFilter === "EXPIRING_SOON" ? "bg-amber-600 text-white" : "text-slate-400"
                }`}
              >
                أقل من 6 ساعات ({expiringSoonTenants.length})
              </button>
              <button
                onClick={() => setSelectedFilter("ACTIVE")}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  selectedFilter === "ACTIVE" ? "bg-emerald-600 text-white" : "text-slate-400"
                }`}
              >
                نشط
              </button>
              <button
                onClick={() => setSelectedFilter("EXPIRED")}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  selectedFilter === "EXPIRED" ? "bg-red-600 text-white" : "text-slate-400"
                }`}
              >
                منتهي
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">المنشأة والنشاط</th>
                <th className="p-3.5">المالك والاتصال</th>
                <th className="p-3.5">بصمة الجهاز (Fingerprint)</th>
                <th className="p-3.5">الوقت المتبقي</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5">التمديدات</th>
                <th className="p-3.5 text-center">إجراءات التمديد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    لا توجد منشآت تطابق البحث المحدد
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-black text-white text-xs">{t.companyName}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {t.businessType} • {t.city}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-200">{t.ownerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>{t.phone}</span>
                        <span>•</span>
                        <span>{t.userEmail}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <Fingerprint className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="font-mono text-[10px] text-slate-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {t.fingerprint.fingerprintHash.slice(0, 14)}...
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {t.fingerprint.screenResolution}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-1 min-w-[130px]">
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                          <span
                            className={
                              t.status === "EXPIRED"
                                ? "text-red-400"
                                : t.remainingHours <= 6
                                ? "text-amber-400 animate-pulse"
                                : "text-emerald-400"
                            }
                          >
                            {t.status === "EXPIRED"
                              ? "انتهت الصلاحية"
                              : `${t.remainingHours} س و ${t.remainingMinutes} د`}
                          </span>
                          <span className="text-slate-500 text-[10px]">{t.progressPercent}%</span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              t.status === "EXPIRED"
                                ? "bg-red-500"
                                : t.remainingHours <= 6
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${t.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                          t.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : t.status === "EXPIRING_SOON"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                            : "bg-red-500/20 text-red-300 border border-red-500/40"
                        }`}
                      >
                        {t.status === "ACTIVE" && "نشط (ساري)"}
                        {t.status === "EXPIRING_SOON" && "يوشك على الانتهاء ⚠️"}
                        {t.status === "EXPIRED" && "منتهي 🛑"}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="text-xs font-mono font-bold text-slate-300">
                        {t.extensionsCount} مرات
                      </div>
                      {t.lastExtendedBy && (
                        <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                          بواسطة: {t.lastExtendedBy}
                        </div>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleQuickExtend(t, 24)}
                          className="px-2.5 py-1 bg-amber-600/80 hover:bg-amber-500 text-white rounded-lg text-[11px] font-bold transition cursor-pointer shadow"
                          title="تمديد سريع 24 ساعة"
                        >
                          +24 س
                        </button>
                        <button
                          onClick={() => handleQuickExtend(t, 48)}
                          className="px-2.5 py-1 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold transition cursor-pointer shadow"
                          title="تمديد سريع 48 ساعة"
                        >
                          +48 س
                        </button>
                        <button
                          onClick={() => handleOpenExtensionModal(t)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          تمديد يدوي
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History of Extensions Table */}
      <div className="bg-slate-900/90 border border-purple-500/30 p-5 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-black text-white">سجل تاريخ تمديدات الفترة التجريبية (History of Extensions)</h3>
          </div>
          <span className="text-xs font-mono text-purple-300 bg-purple-950 px-3 py-1 rounded-xl border border-purple-800">
            {history.length} حركات مسجلة
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">معرف التمديد</th>
                <th className="p-3">المنشأة</th>
                <th className="p-3">الساعات المضافة</th>
                <th className="p-3">تاريخ الانتهاء الجديد</th>
                <th className="p-3">المسؤول عن التمديد</th>
                <th className="p-3">مبرر وسبب التمديد</th>
                <th className="p-3">التوقيت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    لا يوجد حركات تمديد سابقة حتى الآن
                  </td>
                </tr>
              ) : (
                history.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 text-indigo-300 font-bold">{rec.id}</td>
                    <td className="p-3 text-white font-['Alexandria'] font-bold">{rec.companyName}</td>
                    <td className="p-3 text-amber-400 font-bold">+{rec.addedHours} ساعة</td>
                    <td className="p-3 text-emerald-400 font-bold">
                      {new Date(rec.newExpiresAt).toLocaleString("ar-SA")}
                    </td>
                    <td className="p-3 text-slate-300 font-['Alexandria']">{rec.extendedBy}</td>
                    <td className="p-3 text-slate-400 font-['Alexandria'] text-[11px] max-w-xs truncate" title={rec.reason}>
                      {rec.reason}
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {new Date(rec.timestamp).toLocaleString("ar-SA")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Extension Modal */}
      {isModalOpen && targetTenant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-right" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>تمديد الفترة التجريبية لمنشأة: {targetTenant.companyName}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteExtension} className="space-y-4">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>المالك:</span>
                  <span className="text-white font-bold">{targetTenant.ownerName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>تاريخ الانتهاء الحالي:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {new Date(targetTenant.trialExpiresAt).toLocaleString("ar-SA")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>الوقت المتبقي:</span>
                  <span className="font-mono text-indigo-300 font-bold">
                    {targetTenant.remainingHours} ساعة و {targetTenant.remainingMinutes} دقيقة
                  </span>
                </div>
              </div>

              {/* Quick Hours Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  حدد مدة التمديد الإضافية (بالساعات):
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[12, 24, 48, 72, 168, 720].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => {
                        setHoursToAdd(h);
                        setExtensionReason(`تمديد إضافي لمدة ${h >= 24 ? h / 24 + " يوم" : h + " ساعة"} بطلب من إدارة المنشأة.`);
                      }}
                      className={`py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                        hoursToAdd === h
                          ? "bg-indigo-600 text-white border-indigo-400 shadow-md"
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {h < 24 ? `+${h} س` : h === 168 ? `+أسبوع` : h === 720 ? `+شهر` : `+${h / 24} يوم`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Hours Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  أو أدخل عدد الساعات المخصصة:
                </label>
                <input
                  type="number"
                  min={1}
                  max={8760}
                  value={hoursToAdd}
                  onChange={(e) => setHoursToAdd(Number(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                  required
                />
              </div>

              {/* Extension Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  مبرر / سبب التمديد (للتوثيق في سجل التدقيق):
                </label>
                <textarea
                  rows={3}
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="مثال: طلب مهلة لاستكمال رفع دليل الحسابات وتدريب الكادر المحاسبي..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? "جارٍ التمديد والتسجيل..." : `تأكيد تمديد (+${hoursToAdd} ساعة)`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
