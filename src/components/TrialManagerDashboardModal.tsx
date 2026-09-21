import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  Clock,
  Send,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  FileText,
  Lock,
  Mail,
  Users,
  Activity,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import {
  trialOperationsService,
  ClientTrackingRecord,
  TRIAL_OPERATION_LIMIT,
} from "../services/trialOperationsService";
import { TenantIsolationService } from "../services/tenantIsolationService";

interface TrialManagerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToClient?: (clientId: string) => void;
}

export const TrialManagerDashboardModal: React.FC<TrialManagerDashboardModalProps> = ({
  isOpen,
  onClose,
  onSwitchToClient,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "CLIENTS" | "TEMPLATES" | "CHECKLIST" | "REPORT" | "ALERTS"
  >("CLIENTS");
  const [clients, setClients] = useState<ClientTrackingRecord[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedClientForTemplates, setSelectedClientForTemplates] = useState<string>("client-1");
  const [testNotificationStatus, setTestNotificationStatus] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const refreshData = () => {
    setClients(trialOperationsService.getAllClientsTracking());
    setAlerts(trialOperationsService.getAlertsHistory());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      const interval = setInterval(refreshData, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleResetClient = (clientId: string) => {
    if (confirm(`هل أنت متأكد من تصفير عداد العمليات للعميل (${clientId}) لأغراض الاختبار؟`)) {
      trialOperationsService.resetOperations(clientId);
      refreshData();
    }
  };

  const handleSendTestNotification = async () => {
    setIsSendingTest(true);
    setTestNotificationStatus("جاري إرسال إشعار تجريبي عبر البريد والواتساب...");
    try {
      await trialOperationsService.dispatchMilestoneAlert(
        "FIRST_ACCESS",
        "client-test",
        1
      );
      setTestNotificationStatus("✅ تم إرسال إشعار التجربة بنجاح إلى zyadbdr925@gmail.com والواتساب!");
    } catch (e: any) {
      setTestNotificationStatus("❌ تعذر إرسال الإشعار: " + e.message);
    } finally {
      setIsSendingTest(false);
      refreshData();
      setTimeout(() => setTestNotificationStatus(null), 6000);
    }
  };

  const fiveDayReport = trialOperationsService.generateFiveDayEvaluationReport();
  const templates = trialOperationsService.getWhatsAppTemplates(selectedClientForTemplates);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-right text-slate-100"
        dir="rtl"
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  لوحة رقابة ومتابعة النسخ التجريبية (3 عملاء)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  إشراف: بدر عائض محمد (مجموعة بن زياد)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تتبع نشاط العملاء، إرسال روابط الدخول، رقابة سقف الـ 200 عملية، وقوالب التواصل اللحظية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendTestNotification}
              disabled={isSendingTest}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 text-xs font-bold transition cursor-pointer"
              title="إرسال إشعار تجريبي لاختبار قناة البريد والواتساب"
            >
              <Send className="w-3.5 h-3.5" />
              <span>اختبار الإشعارات 🔔</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-950/60 border-b border-slate-800/80 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>العملاء المحتملين:</span>
            </div>
            <div className="text-base font-black text-white mt-1">3 منشآت تجارية</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>سقف العمليات:</span>
            </div>
            <div className="text-base font-black text-amber-400 mt-1">200 عملية / قفل تام</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>فترة التجربة:</span>
            </div>
            <div className="text-base font-black text-emerald-400 mt-1">48 ساعة بدقة</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              <span>الإشعار اللحظي:</span>
            </div>
            <div className="text-xs font-bold text-purple-300 mt-1 truncate">
              zyadbdr925@gmail.com
            </div>
          </div>
        </div>

        {testNotificationStatus && (
          <div className="px-4 py-2 bg-blue-950/80 border-b border-blue-800 text-blue-200 text-xs text-center font-bold animate-pulse">
            {testNotificationStatus}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-3 bg-slate-950 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("CLIENTS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeSubTab === "CLIENTS"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            👥 العملاء الثلاثة والتتبع المباشر
          </button>
          <button
            onClick={() => setActiveSubTab("TEMPLATES")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeSubTab === "TEMPLATES"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            💬 قوالب رسائل الواتساب والمتابعة
          </button>
          <button
            onClick={() => setActiveSubTab("CHECKLIST")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeSubTab === "CHECKLIST"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            📱 قائمة الفحص الداخلي (الأجهزة والمتصفحات)
          </button>
          <button
            onClick={() => setActiveSubTab("REPORT")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeSubTab === "REPORT"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            📊 تقرير التقييم والمتابعة (5 أيام)
          </button>
          <button
            onClick={() => setActiveSubTab("ALERTS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeSubTab === "ALERTS"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            🔔 سجل الإشعارات اللحظية ({alerts.length})
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ================= TAB 1: CLIENTS & REAL-TIME TRACKING ================= */}
          {activeSubTab === "CLIENTS" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    بطاقات العملاء المحتملين الثلاثة (عزل بيانات كامل 100%)
                  </h3>
                  <p className="text-xs text-slate-400">
                    كل رابط مخصص لعميل محدد ويعمل على بيئة تجريبية معزولة تماماً برصيد 200 عملية
                  </p>
                </div>
                <button
                  onClick={refreshData}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>تحديث النشاط</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {clients.map((client) => {
                  const ops = client.operationsCount;
                  const pct = Math.min(100, Math.round((ops / TRIAL_OPERATION_LIMIT) * 100));
                  const isLocked = ops >= TRIAL_OPERATION_LIMIT;
                  const link = trialOperationsService.getClientUniqueLink(client.clientId);

                  return (
                    <div
                      key={client.clientId}
                      className={`p-5 rounded-2xl border transition-all ${
                        isLocked
                          ? "bg-rose-950/20 border-rose-500/40"
                          : ops >= 180
                          ? "bg-amber-950/20 border-amber-500/40"
                          : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow ${
                              isLocked
                                ? "bg-rose-600 text-white"
                                : ops >= 100
                                ? "bg-amber-500 text-slate-950"
                                : "bg-blue-600 text-white"
                            }`}
                          >
                            {client.clientId === "client-1" ? "1" : client.clientId === "client-2" ? "2" : "3"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-white">{client.clientName}</h4>
                              <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-mono text-[10px]">
                                {client.clientId}
                              </span>
                              {isLocked ? (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                                  🔒 مقفل (استنفد 200 عملية)
                                </span>
                              ) : ops >= 180 ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                                  ⚡ قارب على القفل ({200 - ops} متبقية)
                                </span>
                              ) : ops >= 100 ? (
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold">
                                  📊 نصف المدة (100 عملية)
                                </span>
                              ) : ops > 0 ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                                  🟢 نشط حالياً
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                                  ⚪ لم يبدأ بعد
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-3">
                              <span>أول دخول: {client.firstAccessAt === "لم يدخل بعد" ? "لم يدخل بعد" : new Date(client.firstAccessAt).toLocaleString("ar-YE")}</span>
                              <span>آخر نشاط: {client.lastAccessAt === "لم يدخل بعد" ? "لا يوجد" : new Date(client.lastAccessAt).toLocaleString("ar-YE")}</span>
                              <span>الوقت المستغرق: {Math.floor(client.totalSecondsSpent / 60)} دقيقة</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Controls */}
                        <div className="flex items-center gap-2">
                          {onSwitchToClient && (
                            <button
                              onClick={() => onSwitchToClient(client.clientId)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              title="معاينة بيئة العميل وتجربتها مباشرة"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                              <span>دخول كعميل</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedClientForTemplates(client.clientId);
                              setActiveSubTab("TEMPLATES");
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>مراسلة واتساب</span>
                          </button>
                          <button
                            onClick={() => handleResetClient(client.clientId)}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                            title="تصفير عداد العمليات لإعادة الاختبار"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Unique Link Bar */}
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 text-xs font-mono">
                        <div className="truncate text-blue-300 font-medium">
                          {link}
                        </div>
                        <button
                          onClick={() => handleCopy(link, client.clientId)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                            copiedId === client.clientId
                              ? "bg-emerald-600 text-white"
                              : "bg-blue-600 text-white hover:bg-blue-500"
                          }`}
                        >
                          {copiedId === client.clientId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === client.clientId ? "تم النسخ!" : "نسخ الرابط"}</span>
                        </button>
                      </div>

                      {/* Progress Operations Bar */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300">
                            العمليات المنجزة: <span className="text-white font-mono">{ops}</span> من{" "}
                            <span className="text-slate-400 font-mono">200</span> عملية
                          </span>
                          <span
                            className={`font-bold font-mono ${
                              isLocked ? "text-rose-400" : ops >= 180 ? "text-amber-400" : "text-emerald-400"
                            }`}
                          >
                            {pct}% استهلاك
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isLocked
                                ? "bg-rose-500"
                                : ops >= 180
                                ? "bg-amber-500"
                                : ops >= 100
                                ? "bg-blue-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Features Visited & Survey Feedback */}
                      <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 text-[11px] block mb-1">الوحدات التي تمت تجربتها:</span>
                          <div className="flex flex-wrap gap-1">
                            {client.featuresUsed && client.featuresUsed.length > 0 ? (
                              client.featuresUsed.map((f) => (
                                <span
                                  key={f}
                                  className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px]"
                                >
                                  {f}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 text-[10px]">لم يتم تنفيذ عمليات حتى الآن</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[11px] block mb-1">تقييم العميل من شاشة القفل:</span>
                          {client.feedbackSubmitted ? (
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold">
                                {client.rating === "LIKE" ? "👍 راضٍ جداً عن النظام" : "👎 لديه مقترحات وملاحظات"}
                              </span>
                              {client.chosenFeatures && client.chosenFeatures.length > 0 && (
                                <span className="text-[10px] text-slate-400">
                                  ({client.chosenFeatures.join("، ")})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[10px]">بانتظار استنفاد الـ 200 عملية وظهور الاستبيان</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 2: WHATSAPP TEMPLATES & FOLLOW-UP ================= */}
          {activeSubTab === "TEMPLATES" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    قوالب المراسلة عبر الواتساب وخطة المتابعة الزمنية
                  </h3>
                  <p className="text-xs text-slate-400">
                    قوالب مصاغة باحترافية لتسليم الروابط ومتابعة العملاء عند المراحل الزمنية والعملياتية
                  </p>
                </div>

                {/* Client Selector for Templates */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">تخصيص للعميل:</span>
                  <select
                    value={selectedClientForTemplates}
                    onChange={(e) => setSelectedClientForTemplates(e.target.value)}
                    className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="client-1">شركة الأمل للتجارة (العميل 1)</option>
                    <option value="client-2">مؤسسة النور للمعدات والزراعة (العميل 2)</option>
                    <option value="client-3">شركة القمة للإلكترونيات (العميل 3)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-emerald-400">{tpl.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                          {tpl.timing}
                        </span>
                      </div>
                      <div className="mt-2 p-3 bg-slate-900 rounded-xl text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line max-h-48 overflow-y-auto border border-slate-800/80">
                        {tpl.text}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleCopy(tpl.text, tpl.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          copiedId === tpl.id
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                        }`}
                      >
                        {copiedId === tpl.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === tpl.id ? "تم النسخ!" : "نسخ النص"}</span>
                      </button>

                      <a
                        href={tpl.waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>فتح واتساب 📲</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: INTERNAL TESTING CHECKLIST ================= */}
          {activeSubTab === "CHECKLIST" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  قائمة التحقق والاختبار الداخلي (Point 1.1)
                </h3>
                <p className="text-xs text-slate-400">
                  فحص جاهزية النظام على مختلف الأجهزة والمتصفحات والتأكد من سرعة الفتح وعدم ظهور شاشات بيضاء
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                    <Smartphone className="w-4 h-4" />
                    <span>1. اختبار الهواتف الذكية (Mobile Browsers)</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-200">جوال Android (Chrome / Samsung)</div>
                        <div className="text-[11px] text-slate-400">دعم اللمس، القوائم المنسدلة، وضوح الخط وسرعة التحميل</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                        جاهز ومطابق ✅
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-200">جوال iPhone (Safari / Chrome iOS)</div>
                        <div className="text-[11px] text-slate-400">ملاءمة الأزرار، عدم التداخل مع النوتش، وتجاوب لوحة المفاتيح</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                        جاهز ومطابق ✅
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                    <Laptop className="w-4 h-4" />
                    <span>2. اختبار أجهزة الكمبيوتر والمتصفحات (Desktop)</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-200">Google Chrome (Windows / Mac)</div>
                        <div className="text-[11px] text-slate-400">سرعة العرض، طباعة الفواتير، التخزين المحلي واستجابة الحسابات</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                        جاهز ومطابق ✅
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-200">Microsoft Edge</div>
                        <div className="text-[11px] text-slate-400">دعم عالي وأداء ممتاز مع محرك Chromium</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                        جاهز ومطابق ✅
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Isolation Verification Card */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Shield className="w-4 h-4" />
                  <span>تأكيد عزل البيانات التام (Data Isolation 100%) - الشرط الحاسم</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  تم التحقق بأن كل عميل من العملاء الثلاثة يمتلك مفاتيح تخزين معزولة كلياً:
                  <code className="text-emerald-300 font-mono text-[11px] mx-1">medo_tenant_client_1_*</code>،
                  <code className="text-emerald-300 font-mono text-[11px] mx-1">medo_tenant_client_2_*</code>،
                  <code className="text-emerald-300 font-mono text-[11px] mx-1">medo_tenant_client_3_*</code>.
                  لا يمكن لأي عميل الاطلاع على بيانات العميل الآخر، كما أن البيانات الأولية حيادية بالكامل وتخلو من أي معلومات حقيقية أو سرية لمجموعة بن زياد.
                </p>
              </div>
            </div>
          )}

          {/* ================= TAB 4: FIVE-DAY PROGRESS & EVALUATION REPORT ================= */}
          {activeSubTab === "REPORT" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    تقرير المتابعة والتقييم الشامل (5 أيام) - Point 9
                  </h3>
                  <p className="text-xs text-slate-400">
                    ملخص تحليلي لنشاط العملاء الثلاثة، احتمالات التحويل التجاري، والإجراءات المقترحة
                  </p>
                </div>
                <button
                  onClick={() => {
                    const text =
                      `تقرير تقييم النسخ التجريبية لمنظومة MeDo ERP\n` +
                      `التاريخ: ${new Date(fiveDayReport.generatedAt).toLocaleString("ar-YE")}\n` +
                      `المسؤول: بدر عائض محمد (مجموعة بن زياد)\n\n` +
                      `الخلاصة:\n${fiveDayReport.executiveSummary}\n\n` +
                      `احتمالية التحويل وإغلاق الصفقات: ${fiveDayReport.overallConversionProbability}\n\n` +
                      fiveDayReport.clients
                        .map(
                          (c) =>
                            `• العميل: ${c.name}\n` +
                            `  - العمليات: ${c.operations}/200 (${c.percentageUsed}%)\n` +
                            `  - الوقت المستغرق: ${c.durationFormatted}\n` +
                            `  - التقييم: ${c.feedback}\n` +
                            `  - التوجيه المقترح: ${c.suggestedAction}\n`
                        )
                        .join("\n");
                    handleCopy(text, "full-report");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === "full-report" ? "تم نسخ التقرير!" : "نسخ التقرير بالكامل"}</span>
                </button>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 text-xs">احتمالية التحويل التجاري وإغلاق المبيعات:</span>
                  <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white font-black text-xs">
                    {fiveDayReport.overallConversionProbability}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {fiveDayReport.executiveSummary}
                </p>
              </div>

              {/* Table of Clients in Report */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
                    <tr>
                      <th className="p-3">المنشأة</th>
                      <th className="p-3">العمليات</th>
                      <th className="p-3">نسبة الاستهلاك</th>
                      <th className="p-3">الوقت الإجمالي</th>
                      <th className="p-3">التقييم</th>
                      <th className="p-3">الإجراء التنفيذي المقترح</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                    {fiveDayReport.clients.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-850">
                        <td className="p-3 font-bold text-white">{c.name}</td>
                        <td className="p-3 font-mono text-blue-300 font-bold">{c.operations} / 200</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              c.percentageUsed >= 100
                                ? "bg-rose-500/20 text-rose-300"
                                : c.percentageUsed >= 50
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-blue-500/20 text-blue-300"
                            }`}
                          >
                            {c.percentageUsed}%
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{c.durationFormatted}</td>
                        <td className="p-3 text-slate-300">{c.feedback}</td>
                        <td className="p-3 text-amber-300 font-semibold">{c.suggestedAction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 5: ALERTS HISTORY ================= */}
          {activeSubTab === "ALERTS" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    سجل الإشعارات اللحظية المرسلة للإدارة
                  </h3>
                  <p className="text-xs text-slate-400">
                    توثيق لكافة الإشعارات الفورية المرسلة عند دخول العملاء وتجاوزهم لمحطات الـ 100 والـ 180 والـ 200 عملية
                  </p>
                </div>
              </div>

              {alerts.length > 0 ? (
                <div className="space-y-2">
                  {alerts.map((al, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            al.milestone === "MILESTONE_200_LOCK" || al.milestone === "MILESTONE_50_LOCK"
                              ? "bg-rose-600 text-white"
                              : al.milestone === "MILESTONE_180" || al.milestone === "MILESTONE_45"
                              ? "bg-amber-500 text-slate-950"
                              : al.milestone === "MILESTONE_100" || al.milestone === "MILESTONE_25"
                              ? "bg-blue-600 text-white"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          🔔
                        </div>
                        <div>
                          <div className="font-bold text-slate-200">
                            {al.clientName} ({al.clientId})
                          </div>
                          <div className="text-[11px] text-slate-400">
                            الحدث: {al.milestone} • العمليات: {al.operationsCount}/200 • الجهاز: {al.deviceType}
                          </div>
                        </div>
                      </div>

                      <div className="text-left font-mono text-[11px] text-slate-500">
                        {al.timestamp ? new Date(al.timestamp).toLocaleTimeString("ar-YE") : "-"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-800">
                  لم تسجل إشعارات بعد. يمكنك النقر على زر "اختبار الإشعارات 🔔" بالأعلى للتحقق.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            المنظومة: <strong className="text-white">MeDo ERP Cloud Sovereign</strong> • المسؤول المباشر:{" "}
            <strong className="text-amber-300">بدر عائض محمد</strong> (هاتف: 0967773586047)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
            >
              إغلاق اللوحة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
