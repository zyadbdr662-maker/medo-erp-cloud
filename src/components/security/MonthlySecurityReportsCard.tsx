import React, { useState, useEffect } from "react";
import {
  FileText,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Key,
  Lock,
  Calendar,
  Send,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Database,
  Globe,
  UserX,
  Server,
  RefreshCw,
} from "lucide-react";
import {
  cloudSecurityService,
  MonthlySecurityReport,
  MonthlyReportEmailConfig,
} from "../../services/cloudSecurityService";

interface MonthlySecurityReportsCardProps {
  currentUserName?: string;
}

export const MonthlySecurityReportsCard: React.FC<MonthlySecurityReportsCardProps> = ({
  currentUserName = "مدير النظام",
}) => {
  const [reports, setReports] = useState<MonthlySecurityReport[]>(() =>
    cloudSecurityService.getMonthlyReports()
  );
  const [emailConfig, setEmailConfig] = useState<MonthlyReportEmailConfig>(() =>
    cloudSecurityService.getMonthlyReportEmailConfig()
  );
  const [selectedReport, setSelectedReport] = useState<MonthlySecurityReport | null>(() => {
    const list = cloudSecurityService.getMonthlyReports();
    return list.length > 0 ? list[0] : null;
  });

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Email config form state
  const [emailInput, setEmailInput] = useState(emailConfig.adminEmail);
  const [autoSendInput, setAutoSendInput] = useState(emailConfig.autoSendMonthly);
  const [scheduleDayInput, setScheduleDayInput] = useState(emailConfig.scheduleDayOfMonth);
  const [isConfigSavedNotice, setIsConfigSavedNotice] = useState(false);

  // Full report details modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    const unsub = cloudSecurityService.subscribe(() => {
      const updatedReports = cloudSecurityService.getMonthlyReports();
      setReports(updatedReports);
      const updatedConfig = cloudSecurityService.getMonthlyReportEmailConfig();
      setEmailConfig(updatedConfig);
      setEmailInput(updatedConfig.adminEmail);
      setAutoSendInput(updatedConfig.autoSendMonthly);
      setScheduleDayInput(updatedConfig.scheduleDayOfMonth);
    });
    return unsub;
  }, []);

  const handleSaveEmailConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = cloudSecurityService.updateMonthlyReportEmailConfig(
      {
        adminEmail: emailInput.trim(),
        autoSendMonthly: autoSendInput,
        scheduleDayOfMonth: Number(scheduleDayInput) || 1,
      },
      currentUserName
    );
    setEmailConfig(updated);
    setIsConfigSavedNotice(true);
    setTimeout(() => setIsConfigSavedNotice(false), 3500);
  };

  const handleGenerateReportNow = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newRep = cloudSecurityService.generateMonthlySecurityReport(
        "سبتمبر 2026",
        emailConfig.adminEmail,
        emailConfig.autoSendMonthly,
        currentUserName
      );
      setSelectedReport(newRep);
      setIsGenerating(false);
      setEmailFeedback({
        success: true,
        message: `تم توليد تقرير الأمان بنجاح بالرقم المرجعي (${newRep.reportNumber}) وإرسال إشعار للمدير.`,
      });
      setTimeout(() => setEmailFeedback(null), 5000);
    }, 600);
  };

  const handleSendTestEmail = async (reportId?: string) => {
    const targetId = reportId || selectedReport?.id;
    if (!targetId) return;

    setIsSendingEmail(true);
    setEmailFeedback(null);
    try {
      const result = await cloudSecurityService.sendMonthlySecurityReportEmail(
        targetId,
        emailInput || emailConfig.adminEmail,
        currentUserName
      );
      setEmailFeedback({
        success: true,
        message: `${result.message} - (معرّف الإرسال: ${result.messageId})`,
      });
    } catch (err: any) {
      setEmailFeedback({
        success: false,
        message: err?.message || "حدث خطأ أثناء إرسال البريد الإلكتروني.",
      });
    } finally {
      setIsSendingEmail(false);
      setTimeout(() => setEmailFeedback(null), 6000);
    }
  };

  const activeReport = selectedReport || reports[0];

  return (
    <div className="space-y-6 text-right font-['Alexandria','Cairo',sans-serif]" dir="rtl">
      {/* 1. Top Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-indigo-400 shrink-0 shadow-lg">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white">
                  تقارير الأمان السحابية الشهرية الآلية
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>توليد وإرسال بريدي آلي</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  AES-256 CERTIFIED
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                توليد دوري وتلخيص شامل لتهديدات جدار الحماية (Firewall) المحظورة، وحالات فشل الدخول وقوة الهجمات، وسجل دوران مفاتيح التشفير (KMS)، مع أتمتة الإرسال عبر البريد الإلكتروني للمدير.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="btn-generate-monthly-report"
              type="button"
              onClick={handleGenerateReportNow}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-900/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "جارٍ توليد التقرير..." : "توليد تقرير الشهر الحالي الآن"}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {emailFeedback && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              emailFeedback.success
                ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-200"
                : "bg-rose-950/70 border-rose-500/50 text-rose-200"
            }`}
          >
            {emailFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{emailFeedback.message}</span>
          </div>
        )}
      </div>

      {/* 2. Top Summary Metric Cards */}
      {activeReport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Blocked Firewall Threats */}
          <div className="bg-slate-900/80 border border-rose-500/30 rounded-xl p-4 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                تهديدات الجدار الناري المحظورة
              </span>
              <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {activeReport.firewallThreatsSummary.totalBlocked.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-rose-400">تهديد محيّد</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
              <span>حقن SQL: {activeReport.firewallThreatsSummary.sqlInjection}</span>
              <span>حظر جغرافي: {activeReport.firewallThreatsSummary.geoFencing}</span>
            </div>
          </div>

          {/* Card 2: Failed Logins & Brute Force */}
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                فشل الدخول والهجمات الغاشمة
              </span>
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                <UserX className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {activeReport.failedLoginsSummary.failedAttempts}
              </span>
              <span className="text-[11px] font-semibold text-amber-400">
                / {activeReport.failedLoginsSummary.totalAttempts.toLocaleString()} محاولة
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
              <span>هجمات غاشمة محظورة: {activeReport.failedLoginsSummary.bruteForceBlocked}</span>
              <span>نسبة الفشل: {activeReport.failedLoginsSummary.failureRate}%</span>
            </div>
          </div>

          {/* Card 3: Encryption KMS Key Rotations */}
          <div className="bg-slate-900/80 border border-indigo-500/30 rounded-xl p-4 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                دوران مفاتيح التشفير (KMS)
              </span>
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                <Key className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {activeReport.encryptionKeyRotationsSummary.totalRotations}
              </span>
              <span className="text-[11px] font-semibold text-indigo-300">دورة مفتاح مكتملة</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
              <span>قواعد محمية: {activeReport.encryptionKeyRotationsSummary.databasesSecuredCount}</span>
              <span className="text-emerald-400 font-bold">AES-256-GCM (100%)</span>
            </div>
          </div>

          {/* Card 4: Security Score & Posture */}
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-4 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                مؤشر الأمان المؤسسي الشامل
              </span>
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">
                {activeReport.securityScore}%
              </span>
              <span className="text-[11px] font-bold text-emerald-300">
                {activeReport.overallPosture === "OPTIMAL"
                  ? "حالة مثالية (OPTIMAL)"
                  : "آمن ومستقر"}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
              <span>الفترة: {activeReport.monthYear}</span>
              <span className="text-indigo-400 font-mono text-[10px]">{activeReport.reportNumber}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Automatic Email Dispatch Settings Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>إعدادات الإرسال الآلي للتقرير بالبريد الإلكتروني للمدير</span>
                {emailConfig.autoSendMonthly && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    مفعّل تلقائياً
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديد عنوان البريد الإلكتروني للمدير وجدولة الإرسال الشهري التلقائي مع تقرير PDF المشفر.
              </p>
            </div>
          </div>

          {isConfigSavedNotice && (
            <div className="text-xs text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم حفظ إعدادات البريد بنجاح في السجل التشفيري</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveEmailConfig} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              البريد الإلكتروني للمدير (Recipient Email):
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="zyadbdr925@gmail.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-left"
                dir="ltr"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              موعد الإرسال الآلي:
            </label>
            <select
              value={scheduleDayInput}
              onChange={(e) => setScheduleDayInput(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value={1}>اليوم 1 من كل شهر (موصى به)</option>
              <option value={5}>اليوم 5 من كل شهر</option>
              <option value={15}>اليوم 15 من كل شهر (منتصف الشهر)</option>
              <option value={28}>اليوم 28 من كل شهر</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center gap-2 pb-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSendInput}
                onChange={(e) => setAutoSendInput(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="mr-2 text-xs font-bold text-slate-300">
                إرسال آلي شهري
              </span>
            </label>
          </div>

          <div className="md:col-span-2 flex items-center gap-2">
            <button
              id="btn-save-email-config"
              type="submit"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition-all cursor-pointer text-center"
            >
              حفظ الإعدادات
            </button>
            <button
              id="btn-test-send-email"
              type="button"
              onClick={() => handleSendTestEmail()}
              disabled={isSendingEmail}
              title="إرسال تقرير تجريبي فوري للبريد"
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Send className={`w-4 h-4 ${isSendingEmail ? "animate-pulse" : ""}`} />
            </button>
          </div>
        </form>

        {/* Last email delivery info */}
        {emailConfig.lastEmailSentAt && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                آخر إرسال ناجح للبريد:{" "}
                <span className="text-slate-200 font-mono">
                  {new Date(emailConfig.lastEmailSentAt).toLocaleString("ar-SA")}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">حالة خادم الترحيل:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Enterprise SMTP Relay TLS-1.3</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Detailed Report View & Historical Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Historical Reports Selector */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>أرشيف التقارير الشهرية</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              ({reports.length}) تقرير متوفر
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {reports.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-right ${
                    isSelected
                      ? "bg-indigo-950/60 border-indigo-500/50 shadow-md"
                      : "bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        تقرير {rep.monthYear}
                      </span>
                      {rep.emailDelivery.status === "SENT" && (
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                          مُرسل ✉️
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-black text-emerald-400">
                      {rep.securityScore}%
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono text-[10px]">{rep.reportNumber}</span>
                    <span>{rep.firewallThreatsSummary.totalBlocked} تهديد محظور</span>
                  </div>

                  <div className="mt-1 text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>توليد: {new Date(rep.generatedAt).toLocaleDateString("ar-SA")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Report Detailed Analysis */}
        {activeReport && (
          <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
            {/* Header of Active Report */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white">
                    بيانات تقرير الأمان لشهر {activeReport.monthYear}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                    {activeReport.reportNumber}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  الفترة الزمنية: من {new Date(activeReport.periodStart).toLocaleDateString("ar-SA")} إلى {new Date(activeReport.periodEnd).toLocaleDateString("ar-SA")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSendTestEmail(activeReport.id)}
                  disabled={isSendingEmail}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال نسخة للبريد</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>عرض التقرير الموسع</span>
                </button>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span>الملخص التنفيذي للمنظومة (Executive Summary):</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeReport.executiveSummaryAr}
              </p>
            </div>

            {/* Section 2: Top Attacking IPs Blocked by Firewall */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h5 className="text-xs font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-rose-400" />
                  <span>أبرز عناوين IP والمصادر المهاجمة المحظورة بجدار الحماية:</span>
                </h5>
                <span className="text-[10px] text-slate-400">
                  WAF Threat Breakdown
                </span>
              </div>

              <div className="space-y-2">
                {activeReport.firewallThreatsSummary.topAttackingIps.map((atk, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-[10px]">
                        {i + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white font-bold" dir="ltr">
                            {atk.ip}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold">
                            {atk.country}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          السبب: {atk.reason}
                        </span>
                      </div>
                    </div>

                    <div className="text-left shrink-0" dir="ltr">
                      <span className="text-xs font-bold text-rose-400">
                        {atk.count.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block">محاولة محظورة</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Key Rotations & Database Encryption */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h5 className="text-xs font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-400" />
                  <span>سجل دوران مفاتيح التشفير (KMS) وحماية قواعد البيانات:</span>
                </h5>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  امتثال 100%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeReport.encryptionKeyRotationsSummary.recentRotations.map((rot, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 truncate max-w-[180px]">
                        {rot.databaseNameAr}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        {rot.algorithm}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono" dir="ltr">
                      <span>{rot.keyId}</span>
                      <span>{new Date(rot.rotatedAt).toLocaleDateString("ar-SA")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Recommendations */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5">
              <h5 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>التوصيات الأمنية المعتمدة للمرحلة القادمة:</span>
              </h5>
              <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                {activeReport.recommendationsAr.map((rec, rIdx) => (
                  <li key={rIdx} className="leading-relaxed">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 5. Full Modal View of the Monthly Security Report */}
      {isViewModalOpen && activeReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-3xl w-full p-6 text-right shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    وثيقة تقرير الأمان الشهري المعتمدة - {activeReport.monthYear}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    رقم الوثيقة: {activeReport.reportNumber}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>

            {/* Document Body */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">الشهر المعني</span>
                  <span className="text-white font-bold">{activeReport.monthYear}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">مؤشر الصمود الأمني</span>
                  <span className="text-emerald-400 font-bold">{activeReport.securityScore}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">إجمالي التهديدات</span>
                  <span className="text-rose-400 font-bold">{activeReport.firewallThreatsSummary.totalBlocked}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">حالة التسليم بالبريد</span>
                  <span className="text-indigo-300 font-bold">{activeReport.emailDelivery.status}</span>
                </div>
              </div>

              <div>
                <span className="text-indigo-400 font-bold block mb-1">الملخص التنفيذي:</span>
                <p className="text-slate-300 leading-relaxed">{activeReport.executiveSummaryAr}</p>
              </div>

              <div>
                <span className="text-indigo-400 font-bold block mb-1">تفاصيل تهديدات جدار الحماية المحظورة:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <div>حقن SQL: <strong className="text-rose-400">{activeReport.firewallThreatsSummary.sqlInjection}</strong></div>
                  <div>حظر جغرافي: <strong className="text-amber-400">{activeReport.firewallThreatsSummary.geoFencing}</strong></div>
                  <div>تجاوز معدل الطلبات: <strong className="text-yellow-400">{activeReport.firewallThreatsSummary.rateLimit}</strong></div>
                  <div>عناوين القوائم السوداء: <strong className="text-purple-400">{activeReport.firewallThreatsSummary.blacklistIps}</strong></div>
                  <div>هجمات XSS: <strong className="text-blue-400">{activeReport.firewallThreatsSummary.xssThreats}</strong></div>
                </div>
              </div>

              <div>
                <span className="text-indigo-400 font-bold block mb-1">فشل الدخول والأمان البيومتري:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <div>إجمالي محاولات الدخول: <strong className="text-white">{activeReport.failedLoginsSummary.totalAttempts}</strong></div>
                  <div>حالات فشل الدخول: <strong className="text-amber-400">{activeReport.failedLoginsSummary.failedAttempts}</strong></div>
                  <div>هجمات القوة الغاشمة المحظورة: <strong className="text-rose-400">{activeReport.failedLoginsSummary.bruteForceBlocked}</strong></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>توقيع التشفير السيادي: <strong className="font-mono text-indigo-300">SIG-ECC-SHA256-SOVEREIGN</strong></span>
                <span>المستلم البريدي: <strong className="font-mono text-white">{activeReport.emailDelivery.adminEmail}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الوثيقة الرسمية</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendTestEmail(activeReport.id)}
                disabled={isSendingEmail}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>إرسال فوري إلى البريد الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
