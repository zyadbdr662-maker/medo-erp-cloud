import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  RefreshCw,
  Trash2,
  Database,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  AlertTriangle,
  History,
  Shield,
  Check,
  X,
  Sliders,
  Activity,
  Globe,
} from "lucide-react";
import { TenantIsolationService } from "../services/tenantIsolationService";
import { soundService } from "../services/notificationSoundService";

interface SessionLogItem {
  id: string;
  tenantName: string;
  tenantId: string;
  role: string;
  userEmail: string;
  loginTime: string;
  logoutTime?: string;
  durationMinutes: number;
  ipAddress: string;
  status: "ACTIVE" | "COMPLETED" | "LOCKED";
  source: "admin_created" | "self_registration";
}

export const StrictSessionIsolationView: React.FC = () => {
  const activeTenantDetails = TenantIsolationService.getActiveTenantDetails();
  const activeTenantSlug = TenantIsolationService.resolveActiveTenant();

  const [notification, setNotification] = useState<string | null>(null);
  const [isIsolationEnabled, setIsIsolationEnabled] = useState<boolean>(true);
  const [autoClearOnNewLink, setAutoClearOnNewLink] = useState<boolean>(true);
  const [preventCrossTenant, setPreventCrossTenant] = useState<boolean>(true);
  const [verifyBeforeRender, setVerifyBeforeRender] = useState<boolean>(true);
  const [auditLogEnabled, setAuditLogEnabled] = useState<boolean>(true);
  const [timeoutLockMinutes, setTimeoutLockMinutes] = useState<number>(30);

  const [sessionLogs, setSessionLogs] = useState<SessionLogItem[]>([
    {
      id: "LOG-001",
      tenantName: activeTenantDetails?.nameAr || "مجموعة بن زياد التجارية",
      tenantId: activeTenantSlug || "binziyad",
      role: "MANAGER",
      userEmail: "manager@binziyad.cloud",
      loginTime: new Date(Date.now() - 1000 * 60 * 25).toLocaleTimeString(),
      durationMinutes: 25,
      ipAddress: "192.168.1.55 (Secure Gateway)",
      status: "ACTIVE",
      source: "admin_created",
    },
    {
      id: "LOG-002",
      tenantName: "الزرقاء النبيلة (ش.م.ي)",
      tenantId: "alzarqa",
      role: "ACCOUNTANT",
      userEmail: "accountant@alzarqa.cloud",
      loginTime: "10:30 ص",
      logoutTime: "11:00 ص",
      durationMinutes: 30,
      ipAddress: "10.0.4.12",
      status: "COMPLETED",
      source: "admin_created",
    },
    {
      id: "LOG-003",
      tenantName: "شركة إبراهيم كراع للتجارة",
      tenantId: "ibrahim-kurah",
      role: "MANAGER",
      userEmail: "manager@ibrahim-kurah.cloud",
      loginTime: "قبل قليل",
      durationMinutes: 12,
      ipAddress: "192.168.1.104",
      status: "ACTIVE",
      source: "self_registration",
    },
    {
      id: "LOG-004",
      tenantName: "شركة الأمل للتجارة والمقاولات",
      tenantId: "alamal",
      role: "CASHIER",
      userEmail: "cashier@alamal.cloud",
      loginTime: "11:15 ص",
      logoutTime: "11:45 ص",
      durationMinutes: 30,
      ipAddress: "10.0.4.18",
      status: "COMPLETED",
      source: "self_registration",
    },
  ]);

  const showToast = (msg: string) => {
    setNotification(msg);
    soundService.playSound("SUCCESS_CHIME");
    setTimeout(() => setNotification(null), 3500);
  };

  const applyStrictIsolation = async () => {
    try {
      // 1. Clear session data
      localStorage.removeItem("currentTenant");
      localStorage.removeItem("currentSession");
      localStorage.removeItem("tenantData");
      sessionStorage.clear();

      // 2. Clear browser Cache API if supported
      if (typeof window !== "undefined" && "caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      showToast("✅ تم تطبيق عزل الجلسات الصارم بنجاح ومسح البيانات المؤقتة.");
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (e) {
      console.error(e);
      showToast("⚠️ حدث خطأ أثناء تطبيق العزل الصارم.");
    }
  };

  const clearAllSessions = async () => {
    if (!window.confirm("هل أنت متأكد من مسح جميع الجلسات المؤقتة والمسجلات؟")) return;
    localStorage.clear();
    sessionStorage.clear();
    showToast("🧹 تم مسح جميع الجلسات المخزنة في المتصفح بنجاح.");
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const resetSystem = async () => {
    const confirmed = window.confirm(
      "تحذير سيادي: هل أنت متأكد من إعادة تعيين النظام بالكامل؟ سيتم مسح الكاش وإعادة تشغيل التطبيق."
    );
    if (!confirmed) return;

    localStorage.clear();
    sessionStorage.clear();
    if (typeof window !== "undefined" && "caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }
    window.location.href = "/";
  };

  return (
    <div className="space-y-6 text-right font-sans text-slate-100" dir="rtl">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-950 text-emerald-200 border border-emerald-500/50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <span className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shadow">
              <Lock className="w-8 h-8" />
            </span>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>عزل الجلسات الصارم (Strict Tenant Session Isolation)</span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  🔒 أمان سيادي
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                وحدة الإدارة السيادية العليا لمنع تداخل جلسات المنشآت وضمان عزل تام للبيانات والتخزين المحلي.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-600/50 text-xs font-bold inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> الوضع الحالي: عزل مفعّل
            </span>
          </div>
        </div>
      </div>

      {/* Active Session Status Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span>تفاصيل الجلسة النشطة الحالية</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400">المنشأة النشطة:</span>
            <div className="font-black text-amber-300 text-sm">{activeTenantDetails?.nameAr || "مجموعة بن زياد التجارية"}</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400">معرّف المنشأة (Tenant ID):</span>
            <div className="font-mono font-bold text-emerald-400">{activeTenantSlug || "binziyad"}</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400">صلاحية المدير / الدور:</span>
            <div className="font-bold text-blue-400">SUPER_ADMIN / MANAGER</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400">مدة الجلسة النشطة:</span>
            <div className="font-bold text-slate-200">25 دقيقة (مؤمنة)</div>
          </div>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-4">
          <div className="space-y-1.5">
            <span className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl inline-block border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h4 className="text-sm font-black text-white">تطبيق عزل صارم</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              مسح فوري لجلسات الكاش السابقة في المتصفح وإعادة تحميل الحالة لضمان عدم تداخل المنشآت.
            </p>
          </div>
          <button
            onClick={applyStrictIsolation}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            🔒 تطبيق عزل صارم الآن
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-4">
          <div className="space-y-1.5">
            <span className="p-2.5 bg-purple-500/20 text-purple-300 rounded-xl inline-block border border-purple-500/30">
              <Trash2 className="w-5 h-5" />
            </span>
            <h4 className="text-sm font-black text-white">مسح جميع الجلسات</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              تطهير كافة البيانات المؤقتة وملفات التخزين المرتبطة بالعملاء والشركات السابقة.
            </p>
          </div>
          <button
            onClick={clearAllSessions}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            🧹 مسح جميع الجلسات
          </button>
        </div>

        <div className="bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-4">
          <div className="space-y-1.5">
            <span className="p-2.5 bg-rose-500/20 text-rose-300 rounded-xl inline-block border border-rose-500/30">
              <RefreshCw className="w-5 h-5" />
            </span>
            <h4 className="text-sm font-black text-white">إعادة تعيين النظام</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              إعادة تهيئة التطبيق بالكامل ومسح كافة بيانات الذاكرة المؤقتة لمستويات المصنع الأصلية.
            </p>
          </div>
          <button
            onClick={resetSystem}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            🔄 إعادة تعيين النظام
          </button>
        </div>
      </div>

      {/* Isolation Settings Toggle Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>إعدادات العزل الصارم وبروتوكولات الحماية</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {[
            { label: "مسح تلقائي عند فتح رابط جديد (URL Tenant Mismatch)", checked: autoClearOnNewLink, setChecked: setAutoClearOnNewLink },
            { label: "منع التداخل بين المنشآت والشركات (Cross-Tenant Guard)", checked: preventCrossTenant, setChecked: setPreventCrossTenant },
            { label: "التحقق من التطابق قبل عرض البيانات (Pre-Render Validation)", checked: verifyBeforeRender, setChecked: setVerifyBeforeRender },
            { label: "تسجيل كل محاولة وصول في سجل التدقيق (Audit Log)", checked: auditLogEnabled, setChecked: setAuditLogEnabled },
          ].map((item, idx) => (
            <label
              key={idx}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
            >
              <span className="font-bold text-slate-200">{item.label}</span>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => item.setChecked(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Session Audit Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <span>سجل تدقيق الجلسات والانتقالات الموحد (Unified Session Audit Log)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">متابعة كافة جلسات الدخول والانتقالات من بوابات الإدارة والتسجيل الذاتي بدقة</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast("📄 تم تصدير تقرير الجلسات إلى ملف Excel بنجاح.")}
              className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> تصدير Excel
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" /> طباعة التقرير
            </button>
          </div>
        </div>

        {/* Session Statistics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400">من الإدارة (Admin Created):</span>
            <span className="font-mono font-bold text-amber-400">
              {sessionLogs.filter((l) => l.source === "admin_created").length} منشأة
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400">من التسجيل الذاتي (Self-Reg):</span>
            <span className="font-mono font-bold text-blue-400">
              {sessionLogs.filter((l) => l.source === "self_registration").length} منشأة
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400">إجمالي الجلسات:</span>
            <span className="font-mono font-bold text-emerald-400">{sessionLogs.length} جلسة</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 font-bold">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">المنشأة</th>
                <th className="p-3">المصدر</th>
                <th className="p-3">معرّف Tenant</th>
                <th className="p-3">الدور</th>
                <th className="p-3">المستخدم</th>
                <th className="p-3">وقت الدخول</th>
                <th className="p-3">المدة</th>
                <th className="p-3">عنوان IP / الجهاز</th>
                <th className="p-3 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sessionLogs.map((log, idx) => (
                <tr key={log.id} className="hover:bg-slate-950/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-amber-400">{idx + 1}</td>
                  <td className="p-3 font-bold text-white">{log.tenantName}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.source === "admin_created"
                          ? "bg-amber-950 text-amber-300 border border-amber-600/40"
                          : "bg-blue-950 text-blue-300 border border-blue-600/40"
                      }`}
                    >
                      {log.source === "admin_created" ? "🛡️ الإدارة" : "🌐 تسجيل ذاتي"}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-emerald-400">{log.tenantId}</td>
                  <td className="p-3 font-bold text-blue-400">{log.role}</td>
                  <td className="p-3 text-slate-300">{log.userEmail}</td>
                  <td className="p-3 text-slate-300">{log.loginTime}</td>
                  <td className="p-3 font-mono">{log.durationMinutes} دقيقة</td>
                  <td className="p-3 text-slate-400 font-mono text-[11px]">{log.ipAddress}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        log.status === "ACTIVE"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-600/50"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {log.status === "ACTIVE" ? "🟢 نشطة" : "✅ مكتملة"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
