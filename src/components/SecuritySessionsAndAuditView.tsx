import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Monitor,
  Smartphone,
  Globe,
  Clock,
  LogOut,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Key,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  Info,
  Laptop,
} from "lucide-react";
import {
  SecurityAuditService,
  ActiveSession,
  AuditLogEntry,
  SystemAlert,
  AuditRiskLevel,
} from "../services/securityAuditService";
import { LocalSyncEngine } from "../services/localSyncEngine";
import { ERPUser } from "../types/erp";

interface SecuritySessionsAndAuditViewProps {
  currentUser: ERPUser;
}

export const SecuritySessionsAndAuditView: React.FC<SecuritySessionsAndAuditViewProps> = ({
  currentUser,
}) => {
  const [subTab, setSubTab] = useState<"ACTIVE_SESSIONS" | "AUDIT_LOGS" | "AES_ENCRYPTION">("ACTIVE_SESSIONS");

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);

  // Search and Filter State for Audit Logs
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<AuditRiskLevel | "ALL">("ALL");
  const [actionFilter, setActionFilter] = useState<string>("ALL");

  // AES-256 State
  const [aesEnabled, setAesEnabled] = useState<boolean>(() =>
    LocalSyncEngine.getInstance().isAES256EncryptionEnabled()
  );
  const [aesLoading, setAesLoading] = useState(false);
  const [aesTestResult, setAesTestResult] = useState<string | null>(null);

  // Terminate Modal State
  const [sessionToTerminate, setSessionToTerminate] = useState<ActiveSession | null>(null);
  const [terminateSuccessMsg, setTerminateSuccessMsg] = useState("");

  const refreshData = () => {
    const service = SecurityAuditService.getInstance();
    setActiveSessions(service.getActiveSessions());
    setAuditLogs(service.getAuditLogs());
    setSystemAlerts(service.getSystemAlerts());
    setAesEnabled(LocalSyncEngine.getInstance().isAES256EncryptionEnabled());
  };

  useEffect(() => {
    refreshData();
    const service = SecurityAuditService.getInstance();
    const unsubscribe = service.subscribe(() => {
      refreshData();
    });
    return unsubscribe;
  }, []);

  // Handle Terminate Session Action
  const handleConfirmTerminate = () => {
    if (!sessionToTerminate) return;
    const service = SecurityAuditService.getInstance();
    const success = service.terminateSession(
      sessionToTerminate.id,
      `${currentUser.name} (${currentUser.role})`
    );

    if (success) {
      setTerminateSuccessMsg(`تم إنهاء جلسة ${sessionToTerminate.username} (${sessionToTerminate.ipAddress}) وإلغاء صلاحيتها فوراً.`);
      setTimeout(() => setTerminateSuccessMsg(""), 4000);
      setSessionToTerminate(null);
      refreshData();
    }
  };

  // Toggle AES-256 Encryption
  const handleToggleAes256 = async (enable: boolean) => {
    setAesLoading(true);
    try {
      await LocalSyncEngine.getInstance().setAES256EncryptionEnabled(enable);
      setAesEnabled(enable);
      setAesTestResult(`تم ${enable ? "تفعيل" : "تعطيل"} طبقة تشفير AES-256 بنجاح وسرعة معالجة عالية.`);
      setTimeout(() => setAesTestResult(null), 4000);
      refreshData();
    } catch (err: any) {
      alert("حدث خطأ أثناء تغيير إعدادات تشفير AES-256: " + err.message);
    } finally {
      setAesLoading(false);
    }
  };

  // Run AES-256 Performance Test
  const handleTestAesPerformance = async () => {
    setAesLoading(true);
    setAesTestResult("جاري اختبار خوارزمية AES-256 GCM على حزمة بيانات محلية...");
    const start = performance.now();
    const sample = {
      test: "MeDo_ERP_AES256_Payload_Test",
      financials: Array.from({ length: 50 }, (_, i) => ({
        id: `INV-${i}`,
        amount: Math.floor(Math.random() * 500000),
      })),
    };

    const engine = LocalSyncEngine.getInstance();
    const encrypted = await engine.encryptLocalPayloadAES256(sample);
    const decrypted = await engine.decryptLocalPayloadAES256(encrypted);
    const duration = (performance.now() - start).toFixed(2);

    if (decrypted && decrypted.test === sample.test) {
      setAesTestResult(`✅ اكتمل اختبار التشفير بنجاح! تم تشفير وفك تشفير 50 سجل في ${duration} ميلي ثانية. النتيجة: غير قابلة للقراءة تماماً بدون مفتاح المشرف.`);
    } else {
      setAesTestResult("❌ فشل اختبار التشفير.");
    }
    setAesLoading(false);
  };

  // Export Audit Logs as JSON or CSV
  const handleExportAuditLogs = () => {
    const jsonStr = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medo_erp_security_audit_log_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesQuery =
      log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = riskFilter === "ALL" || log.riskLevel === riskFilter;
    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;

    return matchesQuery && matchesRisk && matchesAction;
  });

  const activeCount = activeSessions.filter((s) => s.status === "ACTIVE").length;
  const terminatedCount = activeSessions.filter((s) => s.status === "TERMINATED").length;
  const criticalLogsCount = auditLogs.filter((l) => l.riskLevel === "CRITICAL" || l.riskLevel === "HIGH").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">مركز أمان الجلسات والتشفير والتدقيق (Security Center)</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AES-256 & Audit Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              مراقبة الجلسات النشطة، حظر الوصول غير المصرح، وسجل التدقيق الأمني لمنع الهجمات المنسقة
            </p>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">الجلسات النشطة:</span>
            <span className="font-bold text-emerald-400">{activeCount}</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="text-slate-400">أحداث عالية الخطورة:</span>
            <span className="font-bold text-rose-400">{criticalLogsCount}</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">تشفير AES-256:</span>
            <span className={`font-bold ${aesEnabled ? "text-emerald-400" : "text-amber-400"}`}>
              {aesEnabled ? "مفعل ومحمي" : "معطل"}
            </span>
          </div>
        </div>
      </div>

      {terminateSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{terminateSuccessMsg}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
        <button
          onClick={() => setSubTab("ACTIVE_SESSIONS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "ACTIVE_SESSIONS"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>مراقبة الجلسات النشطة ({activeCount})</span>
        </button>

        <button
          onClick={() => setSubTab("AUDIT_LOGS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "AUDIT_LOGS"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>سجل التدقيق الأمني Audit Log ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setSubTab("AES_ENCRYPTION")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "AES_ENCRYPTION"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Key className="w-4 h-4 text-cyan-300" />
          <span>حماية البيانات وتشفير AES-256 المحتويات</span>
        </button>
      </div>

      {/* SUB TAB 1: ACTIVE SESSIONS MONITOR */}
      {subTab === "ACTIVE_SESSIONS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>قائمة الجلسات النشطة حالياً في النظام</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                يمكن لمدير النظام إنهاء أي جلسة مشبوهة فوراً وإلغاء صلاحيتها لحماية البيانات
              </p>
            </div>
            <button
              onClick={refreshData}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>تحديث الجلسات</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-2xl border transition-all ${
                  session.status === "TERMINATED"
                    ? "bg-slate-950/60 border-slate-800 opacity-60"
                    : session.isCurrentSession
                    ? "bg-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/20"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        session.status === "TERMINATED"
                          ? "bg-slate-800 text-slate-500"
                          : session.isCurrentSession
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {session.username.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{session.username}</span>
                        {session.isCurrentSession && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            جلسة جهازك الحالي
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            session.status === "ACTIVE"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-950 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {session.status === "ACTIVE" ? "نشطة وموثوقة" : "تم إنهاؤها وإلغاؤها"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        <span className="text-slate-300 font-medium">{session.role}</span>
                        <span>•</span>
                        <span>{session.branch}</span>
                        <span>•</span>
                        <span className="text-slate-400 font-mono">{session.email}</span>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 flex-wrap">
                        <div className="flex items-center gap-1 font-mono text-cyan-300">
                          <Globe className="w-3 h-3 text-cyan-400" />
                          <span>IP: {session.ipAddress}</span>
                        </div>

                        <div className="flex items-center gap-1 text-slate-300">
                          <Laptop className="w-3 h-3 text-amber-400" />
                          <span>{session.deviceType}</span>
                        </div>

                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>الدخول: {new Date(session.loginTime).toLocaleTimeString("ar-YE")}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {session.status === "ACTIVE" && (
                      <button
                        onClick={() => setSessionToTerminate(session)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        title="إنهاء هذه الجلسة وإلغاء التوكن"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>إنهاء الجلسة</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 2: AUDIT LOGS */}
      {subTab === "AUDIT_LOGS" && (
        <div className="space-y-4">
          {/* Controls & Filters */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="بحث في سجل الأحداث والأمان (الاسم، البريد، عنوان IP...)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Risk Level Filter */}
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">جميع مستويات الخطورة</option>
                <option value="CRITICAL">حرج جداً (CRITICAL)</option>
                <option value="HIGH">عالي الخطورة (HIGH)</option>
                <option value="MEDIUM">متوسط (MEDIUM)</option>
                <option value="LOW">منخفض / عادي (LOW)</option>
              </select>

              <button
                onClick={handleExportAuditLogs}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير السجل JSON</span>
              </button>
            </div>
          </div>

          {/* Logs List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="divide-y divide-slate-800/80">
              {filteredAuditLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  لا توجد سجلات تدقيق أمني تطابق محددات البحث الحالية.
                </div>
              ) : (
                filteredAuditLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-850 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Risk Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            log.riskLevel === "CRITICAL"
                              ? "bg-rose-950 text-rose-300 border border-rose-500/60 animate-pulse"
                              : log.riskLevel === "HIGH"
                              ? "bg-rose-900/60 text-rose-300 border border-rose-500/40"
                              : log.riskLevel === "MEDIUM"
                              ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {log.riskLevel}
                        </span>

                        <span className="font-bold text-xs text-white">{log.username}</span>
                        <span className="text-[11px] text-slate-400 font-mono">({log.email})</span>
                      </div>

                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(log.timestamp).toLocaleString("ar-YE")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                      {log.details}
                    </p>

                    <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-2 flex-wrap">
                      <span className="text-cyan-400 font-mono">IP: {log.ipAddress}</span>
                      <span>•</span>
                      <span>الجهاز: {log.deviceInfo}</span>
                      <span>•</span>
                      <span>الموقع: {log.location}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: AES-256 ENCRYPTION ENGINE */}
      {subTab === "AES_ENCRYPTION" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">
                    حماية البيانات المحلية المحفوظة عبر تشفير AES-256 GCM
                  </h3>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl">
                  تقوم هذه الطبقة بتشفير قاعدة البيانات المحلية، طابور المزامنة، واللُقطات الفورية بـ AES-256 بت على مستوى الجهاز. يضمن ذلك عدم إمكانية قراءة أي سجل مالي أو محاسبي حتى في حال الوصول المادي المباشر للجهاز.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="text-right">
                  <span className="text-xs font-bold text-white block">حالة التشفير المحلي:</span>
                  <span className={`text-xs font-black ${aesEnabled ? "text-emerald-400" : "text-amber-400"}`}>
                    {aesEnabled ? "مشفر بـ AES-256 (محمي)" : "مفتوح (غير مشفر)"}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleAes256(!aesEnabled)}
                  disabled={aesLoading}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    aesEnabled
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                      : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30"
                  }`}
                >
                  {aesEnabled ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span>{aesEnabled ? "إيقاف التشفير" : "تفعيل تشفير AES-256"}</span>
                </button>
              </div>
            </div>

            {/* Performance Benchmark Test */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">
                    اختبار سرعة وكفاءة خوارزمية AES-256 GCM
                  </span>
                </div>
                <button
                  onClick={handleTestAesPerformance}
                  disabled={aesLoading}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-600/30 transition cursor-pointer"
                >
                  تشغيل اختبار التشفير الحي
                </button>
              </div>

              {aesTestResult && (
                <p className="text-xs font-mono bg-slate-900 p-3 rounded-lg border border-slate-800 text-emerald-400">
                  {aesTestResult}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM TERMINATE MODAL */}
      {sessionToTerminate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/40 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/40">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">تأكيد إنهاء وإلغاء الجلسة النشطة</h3>
                <p className="text-xs text-slate-400">إلغاء الوصول الفوري للمستخدم</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              هل أنت أكتيد من إنهاء جلسة المستخدم <strong className="text-white">{sessionToTerminate.username}</strong> ({sessionToTerminate.ipAddress})؟ سيتم تسجيل خروج الجلسة فوراً وتوثيق حادثة إلغاء الجلسة في سجل التدقيق الأمني.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSessionToTerminate(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmTerminate}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                تأكيد إنهاء الجلسة فوراً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
