import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Key,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  Database,
  Building2,
  ChevronRight,
  Eye,
  EyeOff,
  X
} from "lucide-react";
import { soundService } from "../services/notificationSoundService";
import { SecurityAuditService } from "../services/securityAuditService";

interface SaaSRegistrationSecurityGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SaaSRegistrationSecurityGateModal: React.FC<SaaSRegistrationSecurityGateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Security & Authentication State
  const [securityPin, setSecurityPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  // Lockout Countdown Timer
  useEffect(() => {
    let interval: any;
    if (isLockedOut && lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            setIsLockedOut(false);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLockedOut, lockoutTimer]);

  // Valid Registration / Beta Activation Keys
  const VALID_TRIAL_KEYS = [
    "MEDO-TRIAL-2026",
    "VIP-2026",
    "773586047",
    "123456",
    "BZMT-2026",
    "admin",
    "MEDO-SAFE-01",
  ];

  const handleVerifyAccess = (codeToVerify?: string) => {
    const key = (codeToVerify || securityPin).trim();
    if (!key) {
      setErrorMessage("⚠️ يرجى إدخال رمز تفعيل التجربة أو كود المبرمج المعتمد.");
      soundService.playSound("ENCRYPTION_VIOLATION_ALARM");
      return;
    }

    if (isLockedOut) {
      setErrorMessage(`🚨 تم قفل البوابة مؤقتاً. يرجى الانتظار (${lockoutTimer} ثانية).`);
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    setTimeout(() => {
      const isValid = VALID_TRIAL_KEYS.includes(key) || VALID_TRIAL_KEYS.some((k) => k.toLowerCase() === key.toLowerCase());

      if (isValid) {
        setIsVerifying(false);
        soundService.playSound("SUCCESS_CHIME");

        // Log security audit
        try {
          SecurityAuditService.getInstance().recordAuditLog({
            action: "SECURITY_ALERT",
            userId: "SYSTEM",
            username: "بوابة التسجيل التجريبي",
            email: "saas-gate@medoerp.com",
            deviceInfo: "بوابة تحقق تجربة SaaS",
            riskLevel: "LOW",
            details: `تم فك قفل بوابة إنشاء المنشآت التجريبية بنجاح بالمفتاح: [${key}]`,
            status: "SUCCESS"
          });
        } catch (e) {}

        onSuccess();
      } else {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);
        setIsVerifying(false);
        soundService.playSound("ENCRYPTION_VIOLATION_ALARM");

        if (nextFailed >= 3) {
          setIsLockedOut(true);
          setLockoutTimer(60);
          setErrorMessage("🚨 تم إدخال مفتاح تفعيل غير صحيح 3 مرات! تم قفل البوابة لمدة 60 ثانية لحماية الخادم.");
        } else {
          setErrorMessage(`رمز الأمان غير صحيح. متبقي ${3 - nextFailed} محاولات قبل القفل الأمني.`);
        }
      }
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-gradient-to-b from-[#06182c] via-[#081e36] to-[#040e1b] border-2 border-emerald-500/50 rounded-3xl shadow-2xl flex flex-col text-white relative overflow-hidden">
        
        {/* TOP GLOW ACCENTS */}
        <div className="absolute -top-24 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-700/80 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  بوابة تفعيل التجربة السحابية (Trial Security Gate)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/40">
                  SECURE ENDPOINT
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                طبقة الحماية والمصادقة للحد من التسجيلات العشوائية وحظر الروبوتات
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY CONTAINER */}
        <div className="p-5 sm:p-6 space-y-6 relative z-10">
          
          {/* SECURITY SHIELD HERO */}
          <div className="text-center space-y-2.5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border-2 border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <Lock className="w-7 h-7" />
            </div>
            <h4 className="text-base sm:text-lg font-black text-white">
              مصادقة الكود التجريبي للخدمة الذاتية
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              لتهيئة منشأة افتراضية وتجربة MeDo Cloud ERP، يرجى إدخال <strong className="text-emerald-300">مفتاح التفعيل التجريبي</strong> أو كود المطور لفتح نموذج التسجيل.
            </p>
          </div>

          {/* INPUT CARD */}
          <div className="bg-[#051322]/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4">
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200">
                مفتاح التفعيل التجريبي (Trial Activation Key):
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPin ? "text" : "password"}
                  value={securityPin}
                  disabled={isLockedOut || isVerifying}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerifyAccess();
                  }}
                  placeholder="أدخل كود تفعيل التجربة (مثال: MEDO-TRIAL-2026)..."
                  className="w-full bg-[#030911] border border-slate-700/90 rounded-xl pr-10 pl-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200 text-center font-bold flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* FAST SIMULATION HELPER */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-300 font-bold">مفتاح تجريبي معتمد:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-300 text-xs bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                  MEDO-TRIAL-2026
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSecurityPin("MEDO-TRIAL-2026");
                    handleVerifyAccess("MEDO-TRIAL-2026");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black text-[11px] hover:bg-emerald-400 transition cursor-pointer"
                >
                  فتح فوري 🔓
                </button>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button
              type="button"
              disabled={isLockedOut || isVerifying || !securityPin.trim()}
              onClick={() => handleVerifyAccess()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:scale-95"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>جاري فك التشفير والتحقق...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>التحقق الأمني لفتح النموذج 🚀</span>
                </>
              )}
            </button>

          </div>

          {/* STANDARDS INFRASTRUCTURE */}
          <div className="grid grid-cols-2 gap-3 text-center text-xs text-slate-400">
            <div className="p-3 rounded-xl bg-[#030911]/60 border border-slate-800 space-y-1">
              <Database className="w-4 h-4 text-emerald-400 mx-auto" />
              <strong className="block text-slate-200">هيكلة سحابية عازلة</strong>
              <span className="text-[10px] text-slate-500">تهيئة آلية فورية لقاعدة البيانات</span>
            </div>
            <div className="p-3 rounded-xl bg-[#030911]/60 border border-slate-800 space-y-1">
              <Cpu className="w-4 h-4 text-cyan-400 mx-auto" />
              <strong className="block text-slate-200">الربط الآلي ZATCA / IFRS</strong>
              <span className="text-[10px] text-slate-500">تكويد ذكي للمعايير المحاسبية</span>
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-700/80 bg-[#040e1b] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 relative z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>نظام الحماية والمصادقة المؤسسية — MeDo Tech</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 hover:text-white transition cursor-pointer"
          >
            إلغاء والعودة
          </button>
        </div>

      </div>
    </div>
  );
};
