import React, { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  QrCode,
  Smartphone,
  Copy,
  Check,
  FileSpreadsheet,
  Printer,
  ArrowRight,
  Home,
  UserPlus,
  Sparkles,
  Info,
  Clock,
  Terminal,
} from "lucide-react";
import {
  AdminPortalSecurityService,
  MASTER_ADMIN_EMAIL,
} from "../services/adminPortalSecurityService";
import { soundService } from "../services/notificationSoundService";

interface SovereignAdminGuardViewProps {
  onUnlockSuccess: () => void;
  onBackToHome: () => void;
  onOpenSaaSRegistration: () => void;
  initialMode?: "RESTRICTED" | "SOVEREIGN_LOGIN";
}

export const SovereignAdminGuardView: React.FC<SovereignAdminGuardViewProps> = ({
  onUnlockSuccess,
  onBackToHome,
  onOpenSaaSRegistration,
  initialMode = "RESTRICTED",
}) => {
  const [viewMode, setViewMode] = useState<"RESTRICTED" | "SOVEREIGN_LOGIN">(initialMode);
  const [adminEmail, setAdminEmail] = useState("admin@medo-erp.cloud");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState(["", "", "", "", "", ""]);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TOTP live state
  const [totpData, setTotpData] = useState(AdminPortalSecurityService.getActiveTotpCode());
  const [remainingSeconds, setRemainingSeconds] = useState(30);

  // Lockout state
  const [isLockedOut, setIsLockedOut] = useState(AdminPortalSecurityService.isLockoutActive());
  const [remainingAttempts, setRemainingAttempts] = useState(
    AdminPortalSecurityService.getRemainingAttempts()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const live = AdminPortalSecurityService.getActiveTotpCode();
      setTotpData(live);
      setRemainingSeconds(live.secondsRemaining);
      setIsLockedOut(AdminPortalSecurityService.isLockoutActive());
      setRemainingAttempts(AdminPortalSecurityService.getRemainingAttempts());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      // Handle paste of full 6 digits
      const cleaned = val.replace(/\D/g, "").slice(0, 6);
      if (cleaned.length > 0) {
        const newDigits = [...twoFactorCode];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = cleaned[i] || "";
        }
        setTwoFactorCode(newDigits);
        const nextInput = document.getElementById(`totp-input-${Math.min(5, cleaned.length)}`);
        if (nextInput) nextInput.focus();
        return;
      }
    }

    const digit = val.slice(-1);
    const newDigits = [...twoFactorCode];
    newDigits[index] = digit;
    setTwoFactorCode(newDigits);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`totp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !twoFactorCode[index] && index > 0) {
      const prevInput = document.getElementById(`totp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLockedOut) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const full2FACode = twoFactorCode.join("");

    if (!adminEmail.trim()) {
      setErrorMessage("يرجى إدخال البريد الإلكتروني السيادي المعتمد.");
      setIsSubmitting(false);
      return;
    }

    if (!password.trim()) {
      setErrorMessage("يرجى إدخال كلمة المرور الإدارية.");
      setIsSubmitting(false);
      return;
    }

    if (full2FACode.length < 6) {
      setErrorMessage("يرجى إدخال رمز التحقق بخطوتين (2FA) المكون من 6 أرقام.");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await AdminPortalSecurityService.verifyMasterWith2FA(password, full2FACode);

      if (result.success) {
        setSuccessMessage("✅ تم التحقق السيادي بنجاح. جاري فتح لوحة الإدارة العليا...");
        soundService.playSound("ROYAL_BANK_CHIME");
        setTimeout(() => {
          onUnlockSuccess();
        }, 800);
      } else {
        setErrorMessage(result.errorMsg || "بيانات الدخول أو رمز 2FA غير صحيح.");
        setIsLockedOut(result.isLockedOut);
        setRemainingAttempts(result.remainingAttempts);
      }
    } catch (err: any) {
      setErrorMessage("حدث خطأ أثناء فحص الحماية: " + (err?.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTotpSecret = () => {
    navigator.clipboard.writeText(totpData.secret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#030914] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-[#d4af37] selection:text-slate-950 font-sans relative overflow-hidden" dir="rtl">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* ============================================================== */}
      {/* VIEW 1: RESTRICTED ACCESS SCREEN (رسالة دخول مقيد للعملاء)     */}
      {/* ============================================================== */}
      {viewMode === "RESTRICTED" ? (
        <div className="w-full max-w-lg bg-[#061426]/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl text-center relative z-10 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 text-rose-400">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2">🔒 دخول مقيد</h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-bold border border-rose-500/20 mb-6">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>⚠️ هذه المنطقة محظورة على العملاء والزوار</span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed mb-8">
            منطقة مخصصة وحصرية للإدارة والعمليات المركزية. للاطلاع على خدمات وبرامج منظومة MeDo ERP السحابية واستكشاف المنشآت:
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onOpenSaaSRegistration}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-900/30 transition transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>➕ تسجيل عميل جديد (تجربة مجانية)</span>
            </button>

            <button
              type="button"
              onClick={onBackToHome}
              className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>🏠 العودة إلى الصفحة الرئيسية</span>
            </button>
          </div>

          {/* Discreet Sovereign Entry Toggle */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>التحكم السيادي المركزي</span>
            <button
              type="button"
              onClick={() => setViewMode("SOVEREIGN_LOGIN")}
              className="text-amber-300/80 hover:text-amber-200 font-mono text-[11px] underline underline-offset-4 cursor-pointer hover:scale-105 transition"
            >
              🔑 تسجيل دخول المدير المفوض
            </button>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* VIEW 2: SOVEREIGN ADMIN LOGIN (🔐 الإدارة السيادية العليا)      */
        /* ============================================================== */
        <div className="w-full max-w-xl bg-[#061426]/95 border border-[#d4af37]/60 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(212,175,55,0.15)] backdrop-blur-2xl relative z-10 animate-fadeIn">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-amber-500/10 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] font-black text-2xl shadow-inner shrink-0">
                👑
              </div>
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>🔐 الإدارة السيادية العليا</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#d4af37]/20 text-amber-300 border border-[#d4af37]/40">
                    2FA ENFORCED
                  </span>
                </h2>
                <p className="text-xs text-slate-300 font-mono mt-0.5">Sovereign Admin Portal — MeDo Cloud ERP</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewMode("RESTRICTED")}
              className="text-xs text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800 transition cursor-pointer"
              title="إغلاق البوابة والعودة لشاشة الحظر"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Security Notice */}
          <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#d4af37] shrink-0" />
            <div>
              <span className="font-bold block">منطقة محظورة - الدخول مقيد</span>
              <span className="text-[11px] text-slate-300">
                يتطلب الدخول كلمة المرور السيادية + رمز التحقق الثنائي (2FA). يتم إشعار البريد السيادي فورياً.
              </span>
            </div>
          </div>

          {/* Lockout Warning Banner */}
          {isLockedOut && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/20 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-black text-rose-300 mb-1">🚨 تم قفل البوابة لأسباب أمنية!</strong>
                <span>
                  تم استنفاد محاولات الدخول الخاطئة. تم قفل البوابة وتوثيق الحادثة وإرسال تقرير عاجل إلى: {MASTER_ADMIN_EMAIL}.
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Admin Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                📧 البريد الإداري السيادي:
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                disabled={isLockedOut}
                placeholder="admin@medo-erp.cloud"
                className="w-full bg-[#030d17] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] font-mono transition disabled:opacity-50"
                dir="ltr"
              />
            </div>

            {/* Admin Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                🔒 كلمة المرور الإدارية:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLockedOut}
                  placeholder="••••••••••••"
                  className="w-full bg-[#030d17] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] font-mono transition pr-4 pl-10 disabled:opacity-50"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 2FA Section */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between gap-2 mb-2">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#d4af37]" />
                  <span>🔑 رمز المصادقة الثنائية (2FA - 6 أرقام):</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="text-[11px] text-[#d4af37] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>عرض QR Code والمفتاح</span>
                </button>
              </div>

              {/* 6-Digit Pin Input */}
              <div className="grid grid-cols-6 gap-2" dir="ltr">
                {twoFactorCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`totp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    disabled={isLockedOut}
                    className="w-full h-12 text-center text-lg font-black font-mono bg-[#030d17] border border-slate-700 rounded-xl text-amber-300 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition disabled:opacity-50"
                  />
                ))}
              </div>

              {/* TOTP Live Hint */}
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>الرمز الحالي للمعاينة: <strong className="font-mono text-emerald-400 font-bold">{totpData.code}</strong></span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  تحديث خلال: {remainingSeconds} ثانية
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isLockedOut}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-900/30 transition transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق والتشفير السيادي...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>🚀 دخول الإدارة السيادية العليا</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Controls */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>المحاولات المتبقية: <strong className="text-white font-mono">{remainingAttempts} / 3</strong></span>
            <button
              type="button"
              onClick={() => setShowAuditLogs(true)}
              className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>سجل التدقيق الأمني (Audit Log)</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: 2FA QR CODE & BACKUP CODES                           */}
      {/* ============================================================== */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#06182a] border border-[#d4af37]/60 rounded-3xl p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">إعداد المصادقة الثنائية (2FA)</h3>
                  <p className="text-xs text-slate-300">Google Authenticator / Microsoft Authenticator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Step 1: Secret Key */}
              <div className="p-3.5 rounded-xl bg-[#030d17] border border-slate-700">
                <span className="text-slate-400 block mb-1">الخطوة 1: أدخل المفتاح السري يدوياً أو امسح الباركود:</span>
                <div className="flex items-center justify-between gap-2 bg-slate-900 p-2.5 rounded-lg font-mono text-sm text-amber-300">
                  <span>{totpData.secret}</span>
                  <button
                    type="button"
                    onClick={copyTotpSecret}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    title="نسخ المفتاح"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Step 2: Backup Codes */}
              <div>
                <span className="text-slate-300 font-bold block mb-2">الرموز الاحتياطية للطوارئ (Emergency Backup Codes):</span>
                <div className="grid grid-cols-2 gap-2 font-mono text-center text-xs">
                  {totpData.backupCodes.map((code, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        handleDigitChange(0, code);
                        setShowQrModal(false);
                      }}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:border-[#d4af37] hover:text-amber-300 cursor-pointer transition"
                    >
                      • {code}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700 flex justify-end">
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2 rounded-xl bg-[#d4af37] text-slate-950 font-black text-xs hover:bg-amber-400 transition cursor-pointer"
              >
                حسناً، تم الحفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: LIVE AUDIT LOG (سجل التدقيق الأمني)                    */}
      {/* ============================================================== */}
      {showAuditLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl bg-[#06182a] border border-[#d4af37]/60 rounded-3xl p-6 shadow-2xl text-white max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">📜 سجل التدقيق الأمني (Sovereign Audit Trail)</h3>
                  <p className="text-xs text-slate-300">توثيق كافة محاولات الوصول والجلسات السيادية المشفرة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditLogs(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Logs Table */}
            <div className="flex-1 overflow-y-auto my-4 custom-scrollbar pr-1">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="p-2">الوقت</th>
                    <th className="p-2">الحدث</th>
                    <th className="p-2">الحالة</th>
                    <th className="p-2">الجهاز</th>
                    <th className="p-2">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {AdminPortalSecurityService.getAuditLogs().map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/50">
                      <td className="p-2 text-slate-400">{new Date(log.timestamp).toLocaleTimeString("ar-EG")}</td>
                      <td className="p-2 text-amber-300 font-bold">{log.action}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {log.status === "SUCCESS" ? "✅ ناجح" : "❌ مرفوض"}
                        </span>
                      </td>
                      <td className="p-2 text-slate-400">{log.deviceFingerprint}</td>
                      <td className="p-2 text-slate-300 font-sans">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert("تم تصدير سجل التدقيق الأمني بصيغة Excel / CSV بنجاح.")}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تصدير Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>طباعة</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAuditLogs(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
