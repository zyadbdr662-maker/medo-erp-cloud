import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Laptop,
  Smartphone,
  Trash2,
  PlusCircle,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  History,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  UserCheck,
  ShieldX,
  Mail,
  SmartphoneNfc,
  Volume2,
  UserX,
  Sparkles,
} from "lucide-react";
import {
  AdminPortalSecurityService,
  AuthorizedDevice,
  AdminAccessAuditLog,
  MASTER_ADMIN_EMAIL,
  MASTER_DEVICE_ENROLL_PIN,
  DEFAULT_MASTER_PASSWORD_PLAIN,
} from "../services/adminPortalSecurityService";
import { SecurityAuditService, AccountLockRecord } from "../services/securityAuditService";
import { soundService } from "../services/soundService";
import { SystemPromptsHistoryDashboard } from "./SystemPromptsHistoryDashboard";

export const AdminDeviceManagerView: React.FC = () => {
  const [devices, setDevices] = useState<AuthorizedDevice[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAccessAuditLog[]>([]);
  const [lockedAccounts, setLockedAccounts] = useState<AccountLockRecord[]>([]);
  const [currentFp, setCurrentFp] = useState<string>("");

  // New Device Modal / Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceFp, setNewDeviceFp] = useState("");
  const [addMsg, setAddMsg] = useState<string | null>(null);

  // Change Master Password Form
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmNewPwd, setConfirmNewPwd] = useState("");
  const [showPwdFields, setShowPwdFields] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "SUCCESS" | "ERROR"; text: string } | null>(null);

  // Lockout State
  const [isLockedOut, setIsLockedOut] = useState(false);

  // Email Notifications Dispatches State
  const [emailDispatches, setEmailDispatches] = useState<any[]>([]);
  const [isSendingTestAlert, setIsSendingTestAlert] = useState(false);
  const [testAlertSuccess, setTestAlertSuccess] = useState<string | null>(null);
  const [testAlertError, setTestAlertError] = useState<string | null>(null);
  const [adminSectionTab, setAdminSectionTab] = useState<"DEVICES_SECURITY" | "PROMPTS_TIMELINE">("DEVICES_SECURITY");
  const [emailConfigStatus, setEmailConfigStatus] = useState<{
    configured: boolean;
    hasSmtpPassword: boolean;
    hasResendApiKey: boolean;
    host: string;
    user: string;
    transportType: string;
  } | null>(null);

  useEffect(() => {
    loadData();
    checkEmailConfig();
    const unsub = SecurityAuditService.getInstance().subscribe(() => {
      loadData();
    });
    return () => unsub();
  }, []);

  const checkEmailConfig = async () => {
    try {
      const res = await fetch("/api/security/email-status");
      if (res.ok) {
        const data = await res.json();
        setEmailConfigStatus(data);
      }
    } catch {}
  };

  const loadData = async () => {
    const list = AdminPortalSecurityService.getAuthorizedDevices();
    setDevices(list);

    const logs = AdminPortalSecurityService.getAuditLogs();
    setAuditLogs(logs);

    const fp = await AdminPortalSecurityService.getDeviceFingerprint();
    setCurrentFp(fp.fingerprint);

    setIsLockedOut(AdminPortalSecurityService.isLockoutActive());

    // Load Locked Accounts
    setLockedAccounts(SecurityAuditService.getInstance().getLockedAccounts());

    // Load Email Security Dispatches
    try {
      const rawDispatches = localStorage.getItem("medo_erp_security_email_dispatches_v1");
      setEmailDispatches(rawDispatches ? JSON.parse(rawDispatches) : []);
    } catch {}
  };

  const handleUnlockUserAccount = (email: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في إلغاء قفل الحساب للبريد (${email}) وتصفير عداد المحاولات الخاطئة؟`)) {
      SecurityAuditService.getInstance().unlockAccount(email, "مدير النظام الأعلى (بدر)");
      try {
        soundService.playSound("SUCCESS_CHIME");
      } catch {}
      loadData();
      alert(`✓ تم فك القفل بنجاح عن الحساب (${email}) وأصبح قادراً على تسجيل الدخول فوراً.`);
    }
  };

  const handleTestSoundAlert = (type: "RADAR_SECURITY" | "ENCRYPTION_VIOLATION_ALARM" | "ROYAL_BANK_CHIME") => {
    try {
      soundService.playSound(type);
    } catch (e) {
      console.warn("Sound play error:", e);
    }
  };

  const handleSendTestSecurityEmail = async () => {
    setIsSendingTestAlert(true);
    setTestAlertSuccess(null);
    setTestAlertError(null);
    try {
      const res = await fetch("/api/security/admin-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: MASTER_ADMIN_EMAIL,
          alertType: "MANUAL_SECURITY_TEST",
          title: "فحص واختبار إشعار الأمان للبوابة السيادية",
          message: "إشعار تجريبي فوري للتأكد من ربط البريد الإلكتروني ونظام الإنذار الأمني السيادي بنجاح.",
          severity: "HIGH",
          deviceFingerprint: currentFp || "ADMIN_FP_ACTIVE",
          ipAddress: "127.0.0.1",
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      
      const newLog = {
        id: data.alertId || `DISP-${Date.now().toString(36).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        toEmail: MASTER_ADMIN_EMAIL,
        title: "فحص واختبار أمان البوابة",
        message: data.note || "تم معالجة التنبيه وتوثيقه في سجل الرقابة المشفر.",
        severity: "HIGH",
        status: data.emailSent ? "SENT_TO_INBOX" : "LOGGED_AWAITING_SMTP",
        channel: data.transportMethod || `EMAIL (${MASTER_ADMIN_EMAIL})`,
      };
      
      const updated = [newLog, ...emailDispatches].slice(0, 50);
      setEmailDispatches(updated);
      localStorage.setItem("medo_erp_security_email_dispatches_v1", JSON.stringify(updated));
      
      if (data.emailSent) {
        setTestAlertSuccess(`✓ تم إرسال البريد الأمني بنجاح إلى صندوق الوارد: ${MASTER_ADMIN_EMAIL}`);
      } else {
        setTestAlertSuccess(`✓ تم توثيق التنبيه الأمني برقم (${data.alertId}). ${data.note || ''}`);
      }
      setTimeout(() => setTestAlertSuccess(null), 8000);
      checkEmailConfig();
    } catch (e: any) {
      setTestAlertError("فشل إرسال الإشعار: " + e.message);
      setTimeout(() => setTestAlertError(null), 8000);
    } finally {
      setIsSendingTestAlert(false);
    }
  };

  const handleRevokeDevice = (deviceId: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حظر وإلغاء تصريح هذا الجهاز؟")) {
      AdminPortalSecurityService.revokeDevice(deviceId);
      loadData();
    }
  };

  const handleDeleteDevice = (deviceId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الجهاز من قائمة الأجهزة نهائياً؟")) {
      AdminPortalSecurityService.deleteDevice(deviceId);
      loadData();
    }
  };

  const handleAuthorizePendingDevice = (device: AuthorizedDevice) => {
    const list = AdminPortalSecurityService.getAuthorizedDevices();
    const updated = list.map((d) => (d.id === device.id ? { ...d, status: "AUTHORIZED" as const } : d));
    AdminPortalSecurityService.saveAuthorizedDevices(updated);
    AdminPortalSecurityService.logAudit({
      action: "DEVICE_AUTHORIZED",
      deviceFingerprint: device.fingerprint,
      deviceName: device.name,
      ipAddress: device.ipAddress,
      userAgent: navigator.userAgent,
      details: `تم تفعيل وتفويض الجهاز يدوياً من لوحة التحكم: ${device.name}`,
      status: "SUCCESS",
      remainingAttempts: 3,
    });
    loadData();
  };

  const handleAddNewDeviceManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim() || !newDeviceFp.trim()) {
      setAddMsg("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    const list = AdminPortalSecurityService.getAuthorizedDevices();
    const newDev: AuthorizedDevice = {
      id: "DEV-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      name: newDeviceName.trim(),
      fingerprint: newDeviceFp.trim().toUpperCase(),
      deviceType: "DESKTOP",
      browserInfo: "مضاف يدوياً بواسطة المدير",
      osInfo: "Unknown OS",
      ipAddress: "127.0.0.1",
      registeredAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      status: "AUTHORIZED",
    };

    list.push(newDev);
    AdminPortalSecurityService.saveAuthorizedDevices(list);
    AdminPortalSecurityService.logAudit({
      action: "DEVICE_AUTHORIZED",
      deviceFingerprint: newDev.fingerprint,
      deviceName: newDev.name,
      ipAddress: "127.0.0.1",
      userAgent: navigator.userAgent,
      details: `تمت إضافة جهاز جديد مصرح به يدوياً: ${newDev.name}`,
      status: "SUCCESS",
      remainingAttempts: 3,
    });

    setNewDeviceName("");
    setNewDeviceFp("");
    setShowAddModal(false);
    loadData();
  };

  const handleChangeMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPwd !== confirmNewPwd) {
      setPwdMsg({ type: "ERROR", text: "كلمة المرور الجديدة وتأكيدها غير متطابقين." });
      return;
    }

    if (newPwd.length < 8) {
      setPwdMsg({ type: "ERROR", text: "يجب ألا تقل كلمة المرور عن 8 أحرف وأرقام ورموز." });
      return;
    }

    const res = await AdminPortalSecurityService.updateMasterPassword(currentPwd, newPwd);
    if (res.success) {
      setPwdMsg({ type: "SUCCESS", text: "✓ تم تحديث كلمة مرور المدير بنجاح!" });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmNewPwd("");
      setTimeout(() => setShowPwdModal(false), 2000);
    } else {
      setPwdMsg({ type: "ERROR", text: res.errorMsg || "فشل تحديث كلمة المرور." });
    }
  };

  const handleResetLockout = () => {
    AdminPortalSecurityService.resetFailedAttempts();
    setIsLockedOut(false);
    loadData();
    alert("✓ تم فك القفل الأمني وإعادة ضبط عداد المحاولات (3/3).");
  };

  return (
    <div className="space-y-8 font-['Alexandria','Cairo',sans-serif]" dir="rtl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#0F284E] to-[#081220] border border-blue-500/40 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-400/50 flex items-center justify-center text-blue-400 shadow-inner">
              <SmartphoneNfc className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  الأجهزة المصرح بها والحماية السيادية (Device Whitelist & Master Security)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/40">
                  طبقة الحماية الثالثة
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                تحكم كامل في قائمة الأجهزة الموثوقة المسموح لها بفتح لوحة الإدارة، مع سجل تدقيق لحظي لكافة محاولات الدخول والتنبيهات الأمنية.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowPwdModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold shadow transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>تغيير كلمة مرور المدير</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 border border-blue-400/40 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة جهاز مصرح جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lockout Status Banner (If Active) */}
      {isLockedOut && (
        <div className="bg-rose-950/60 border border-rose-600/80 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-rose-200 text-xs font-bold">
            <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0" />
            <span>⚠️ القفل الأمني نشط حالياً بسبب استنفاد محاولات الدخول الخاطئة.</span>
          </div>
          <button
            onClick={handleResetLockout}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow cursor-pointer whitespace-nowrap"
          >
            فك القفل الأمني الآن (إعادة ضبط 3 محاولات)
          </button>
        </div>
      )}

      {/* Navigation Subtabs: Security vs Prompts History */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#070e1b] border border-blue-500/30 rounded-2xl p-2 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminSectionTab("DEVICES_SECURITY")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminSectionTab === "DEVICES_SECURITY"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/40"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>الأجهزة المصرحة والرقابة الأمنية</span>
          </button>

          <button
            onClick={() => setAdminSectionTab("PROMPTS_TIMELINE")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminSectionTab === "PROMPTS_TIMELINE"
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <History className="w-4 h-4 text-amber-300" />
            <span>سجل المحادثات والطلبات والإجراءات</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black border border-amber-400/30">
              شامل
            </span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline px-3">
          لوحة الإدارة العليا السيادية • MeDo ERP Master Console
        </span>
      </div>

      {adminSectionTab === "PROMPTS_TIMELINE" ? (
        <SystemPromptsHistoryDashboard />
      ) : (
        <>
      {/* Quick Security Credentials Card for Master Admin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0B192C]/80 border border-blue-500/30 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>الرابط السري المعتمد (Secret URL):</span>
            <span className="text-emerald-400 font-mono">Layer 1</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-blue-300 break-all select-all">
            ?admin_key=x7k9_sovereign_ctrl
          </div>
          <p className="text-[11px] text-slate-400">
            أو إضافة المسار السري <span className="font-mono text-slate-300">/admin-control-x7k9</span>
          </p>
        </div>

        <div className="bg-[#0B192C]/80 border border-blue-500/30 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>بريد الإشعارات والتنبيهات:</span>
            <span className="text-blue-400 font-mono">Alerts</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 break-all select-all flex items-center justify-between">
            <span>{MASTER_ADMIN_EMAIL}</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">نشط ومرتبط</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-slate-400">
              تصل إليه إشعارات محاولات الدخول الخاطئة وقفل البوابة فورياً.
            </p>
            <button
              onClick={handleSendTestSecurityEmail}
              disabled={isSendingTestAlert}
              className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {isSendingTestAlert ? "جاري الإرسال..." : "إرسال إشعار فحص تجريبي"}
            </button>
          </div>
          {testAlertSuccess && (
            <p className="text-[11px] text-emerald-400 font-bold animate-fadeIn">{testAlertSuccess}</p>
          )}
        </div>

        <div className="bg-[#0B192C]/80 border border-blue-500/30 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>رمز تفويض الأجهزة السيادي (PIN):</span>
            <span className="text-amber-400 font-mono">Layer 3</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-amber-300 break-all select-all">
            {MASTER_DEVICE_ENROLL_PIN}
          </div>
          <p className="text-[11px] text-slate-400">
            يُستخدم لتسجيل أي جهاز جديد لبدر فورياً من نافذة الدخول.
          </p>
        </div>
      </div>

      {/* Authorized Devices Table */}
      <div className="bg-[#0B192C]/90 border border-blue-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Laptop className="w-5 h-5 text-blue-400" />
            <span>قائمة الأجهزة المصرح لها ({devices.length})</span>
          </h3>
          <button
            onClick={loadData}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="تحديث القائمة"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3">الجهاز</th>
                <th className="py-3 px-3">بصمة الجهاز (Fingerprint)</th>
                <th className="py-3 px-3">المتصفح والنظام</th>
                <th className="py-3 px-3">تاريخ التسجيل</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {devices.map((dev) => {
                const isCurrent = dev.fingerprint === currentFp;
                return (
                  <tr
                    key={dev.id}
                    className={`hover:bg-slate-900/50 transition-colors ${
                      isCurrent ? "bg-blue-950/20" : ""
                    }`}
                  >
                    <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-2">
                      {dev.deviceType === "MOBILE" ? (
                        <Smartphone className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Laptop className="w-4 h-4 text-blue-400" />
                      )}
                      <span>{dev.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-sans">
                          جهازك الحالي
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-blue-300">{dev.fingerprint}</td>
                    <td className="py-3 px-3 text-slate-300 font-sans">
                      {dev.osInfo} • {dev.browserInfo}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-sans">
                      {new Date(dev.registeredAt).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      {dev.status === "AUTHORIZED" ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                          ✓ مصرح به
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold">
                          ✕ محظور
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {dev.status === "BLOCKED" ? (
                          <button
                            onClick={() => handleAuthorizePendingDevice(dev)}
                            className="p-1.5 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-700/60 transition-colors"
                            title="إلغاء الحظر وتفويض الجهاز"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRevokeDevice(dev.id)}
                            className="p-1.5 rounded-lg bg-amber-950 text-amber-300 hover:bg-amber-900 border border-amber-700/60 transition-colors"
                            title="حظر هذا الجهاز"
                          >
                            <ShieldX className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteDevice(dev.id)}
                          className="p-1.5 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-700/60 transition-colors"
                          title="حذف نهائي"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Log */}
      <div className="bg-[#0B192C]/90 border border-blue-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <span>سجل تدقيق محاولات دخول الإدارة (Audit Logs)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {auditLogs.length} سجل مسجل
          </span>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-right text-xs">
            <thead className="sticky top-0 bg-[#0B192C] z-10">
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">التوقيت</th>
                <th className="py-2.5 px-3">الحدث</th>
                <th className="py-2.5 px-3">تفاصيل العملية</th>
                <th className="py-2.5 px-3">بصمة الجهاز</th>
                <th className="py-2.5 px-3">النتيجة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap font-sans text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString("ar-EG")} •{" "}
                    {new Date(log.timestamp).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="py-2.5 px-3 font-sans font-bold text-white">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans">{log.details}</td>
                  <td className="py-2.5 px-3 text-blue-300 text-[11px]">{log.deviceFingerprint}</td>
                  <td className="py-2.5 px-3 font-sans">
                    {log.status === "SUCCESS" ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        ✓ ناجحة
                      </span>
                    ) : log.status === "BLOCKED" ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        ⚠️ محظورة
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                        ✕ فاشلة
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Email & Incident Dispatches Log */}
      <div className="bg-[#0B192C]/90 border border-emerald-500/30 rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-400" />
              <span>منظومة إشعارات البريد الإلكتروني الفورية (Email Dispatch Center)</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              يتم إرسال إشعار فوري وتنبيه أمني مباشر إلى بريد الإدارة العليا عند رصد محاولات الدخول الخاطئة أو أي سلوك أمني مشبوه.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendTestSecurityEmail}
              disabled={isSendingTestAlert}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
            >
              {isSendingTestAlert ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Mail className="w-3.5 h-3.5" />
              )}
              <span>{isSendingTestAlert ? "جاري الإرسال والتحقق..." : "إرسال إشعار بريد تجريبي"}</span>
            </button>
          </div>
        </div>

        {/* Live SMTP Status & Quick Guide Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400">البريد المعتمد لاستلام التنبيهات:</span>
            <p className="font-mono text-sm text-emerald-400 font-bold">{MASTER_ADMIN_EMAIL}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400">حالة خادم البريد (SMTP / Provider):</span>
            <div className="flex items-center gap-2">
              {emailConfigStatus?.configured ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>متصل بنجاح ({emailConfigStatus.transportType})</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>في انتظار تعيين كلمة مرور التطبيقات (SMTP_PASS)</span>
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400">خادم الإرسال:</span>
            <p className="font-mono text-xs text-blue-300 font-bold">
              {emailConfigStatus?.host || "smtp.gmail.com"} (SSL 465)
            </p>
          </div>
        </div>

        {/* Guidance if SMTP credentials are required */}
        {(!emailConfigStatus?.configured) && (
          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40 text-xs text-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-300">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>توجيهات تفعيل إرسال البريد الفوري لصندوق الوارد (Gmail App Password):</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              لإرسال إشعارات الأمان الفعلية إلى بريدك (<strong className="text-white font-mono">{MASTER_ADMIN_EMAIL}</strong>)، افتح حساب Google الخاص بك &gt; <strong>الأمان (Security)</strong> &gt; <strong>التحقق بخطوتين</strong> &gt; <strong>كلمات مرور التطبيقات (App Passwords)</strong>، ثم أنشئ كلمة مرور مكونة من 16 حرفاً وضعها في متغير البيئة <code className="text-amber-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">SMTP_PASS</code>.
            </p>
          </div>
        )}

        {/* Test Alert Feedback Banners */}
        {testAlertSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{testAlertSuccess}</span>
          </div>
        )}

        {testAlertError && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{testAlertError}</span>
          </div>
        )}

        {/* Dispatches Table */}
        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          {emailDispatches.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-medium space-y-2">
              <Mail className="w-8 h-8 text-slate-600 mx-auto" />
              <p>لا توجد تنبيهات أمنية سابقة تم إرسالها للبريد.</p>
              <p className="text-[11px] text-slate-500">
                يتم تسجيل وإرسال الإشعار تلقائياً عند حدوث أي محاولة دخول خاطئة أو تجاوز محاولات كلمة المرور.
              </p>
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="sticky top-0 bg-[#0B192C] z-10">
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">معرّف الإرسال</th>
                  <th className="py-2.5 px-3">التوقيت</th>
                  <th className="py-2.5 px-3">العنوان / الحادثة</th>
                  <th className="py-2.5 px-3">الوجهة المستلمة</th>
                  <th className="py-2.5 px-3">قناة الإرسال</th>
                  <th className="py-2.5 px-3">حالة التسليم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {emailDispatches.map((disp, idx) => (
                  <tr key={disp.id || idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 text-emerald-300 text-[11px]">{disp.id}</td>
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap font-sans text-[11px]">
                      {new Date(disp.timestamp).toLocaleTimeString("ar-EG")} • {new Date(disp.timestamp).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 font-sans font-bold">{disp.title}</td>
                    <td className="py-2.5 px-3 text-slate-300">{disp.toEmail}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{disp.channel || "EMAIL"}</td>
                    <td className="py-2.5 px-3 font-sans">
                      {disp.status === "SENT_TO_INBOX" ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          ✓ تم الإرسال لصندوق الوارد
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                          ✓ مسجل في الرقابة المشفرة
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Locked Accounts & Sound Alert Controls */}
      <div className="bg-[#0B192C]/90 border border-rose-500/40 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <UserX className="w-5 h-5 text-rose-400" />
              <span>الحسابات المقفلة مؤقتاً وقفل الحماية الآلي ({lockedAccounts.length})</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              يتم قفل أي حساب تلقائياً وإطلاق إنذار صوتي فوري عبر <span className="font-mono text-amber-300">soundService</span> عند رصد أكثر من 3 محاولات دخول خاطئة متتالية.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTestSoundAlert("RADAR_SECURITY")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/50 text-xs font-bold transition-colors cursor-pointer"
              title="تجربة صوت إنذار الرادار الأمني"
            >
              <Volume2 className="w-4 h-4" />
              <span>فحص صفارة الإنذار</span>
            </button>
            <button
              onClick={loadData}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="تحديث"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          {lockedAccounts.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs font-medium space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-emerald-300 font-bold">لا توجد أي حسابات مقفلة حالياً. كافة الحسابات آمنة ونشطة.</p>
              <p className="text-[11px] text-slate-500">
                عند تسجيل أكثر من 3 محاولات دخول خاطئة لأي حساب مستخدم، سيظهر هنا فوراً مع زر الفك اليدوي ومؤقت المهلة التلقائية.
              </p>
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="sticky top-0 bg-[#0B192C] z-10">
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">البريد الإلكتروني / الحساب</th>
                  <th className="py-2.5 px-3">عدد المحاولات الفاشلة</th>
                  <th className="py-2.5 px-3">عنوان IP / الجهاز</th>
                  <th className="py-2.5 px-3">وقت القفل</th>
                  <th className="py-2.5 px-3">المهلة المتبقية</th>
                  <th className="py-2.5 px-3 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {lockedAccounts.map((lock) => {
                  const now = Date.now();
                  const remainingMinutes = Math.max(0, Math.ceil((lock.unlockTime - now) / 60000));
                  return (
                    <tr key={lock.email} className="hover:bg-slate-900/50 transition-colors bg-rose-950/20">
                      <td className="py-2.5 px-3 font-sans font-bold text-rose-300 flex items-center gap-2">
                        <UserX className="w-4 h-4 text-rose-400" />
                        <span>{lock.email}</span>
                      </td>
                      <td className="py-2.5 px-3 text-amber-300 font-bold">
                        {lock.failedAttempts} محاولات متتالية
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 text-[11px]">{lock.ip}</td>
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap font-sans text-[11px]">
                        {new Date(lock.lockedAt).toLocaleTimeString("ar-EG")}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                          مقفل ({remainingMinutes} دقيقة متبقية)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleUnlockUserAccount(lock.email)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-[11px] font-bold rounded-lg transition-all shadow cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>إلغاء القفل الآن</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
        </>
      )}

      {/* Change Password Modal */}
      {showPwdModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0B192C] border border-blue-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <span>تغيير كلمة مرور المدير (Master Password)</span>
            </h3>

            <form onSubmit={handleChangeMasterPassword} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">كلمة المرور الحالية:</label>
                <input
                  type={showPwdFields ? "text" : "password"}
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  placeholder="أدخل كلمة المرور الحالية..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">كلمة المرور الجديدة:</label>
                <input
                  type={showPwdFields ? "text" : "password"}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  placeholder="8 أحرف ورموز على الأقل..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">تأكيد كلمة المرور الجديدة:</label>
                <input
                  type={showPwdFields ? "text" : "password"}
                  value={confirmNewPwd}
                  onChange={(e) => setConfirmNewPwd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  placeholder="أعد إدخال الكلمة الجديدة..."
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setShowPwdFields(!showPwdFields)}
                  className="flex items-center gap-1 hover:text-white"
                >
                  {showPwdFields ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPwdFields ? "إخفاء الرموز" : "إظهار الرموز"}</span>
                </button>
              </div>

              {pwdMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    pwdMsg.type === "SUCCESS"
                      ? "bg-emerald-950/70 border border-emerald-600/70 text-emerald-200"
                      : "bg-rose-950/70 border border-rose-600/70 text-rose-200"
                  }`}
                >
                  {pwdMsg.text}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow"
                >
                  حفظ التعديل
                </button>
                <button
                  type="button"
                  onClick={() => setShowPwdModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0B192C] border border-blue-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-400" />
              <span>إضافة جهاز مصرح جديد يدوياً</span>
            </h3>

            <form onSubmit={handleAddNewDeviceManual} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">اسم الجهاز:</label>
                <input
                  type="text"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  placeholder="مثال: لابتوب بدر في المنزل"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">بصمة الجهاز (Fingerprint):</label>
                <input
                  type="text"
                  value={newDeviceFp}
                  onChange={(e) => setNewDeviceFp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  placeholder="مثال: DEV-FP-A7B8C9D0E1F2"
                  required
                />
              </div>

              {addMsg && <p className="text-xs text-rose-400 font-bold">{addMsg}</p>}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow"
                >
                  إضافة الجهاز
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
