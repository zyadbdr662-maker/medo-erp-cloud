import React, { useState, useEffect } from "react";
import {
  Lock,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Mail,
  CheckCircle2,
  FileText,
  Fingerprint,
  Clock,
  ShieldCheck,
  Smartphone,
  Copy,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Building2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { LegalPolicyType } from "./LegalPoliciesModal";
import { trialService, TwoFactorState } from "../services/trialService";
import { ERPUser } from "../types/erp";
import { soundService } from "../services/notificationSoundService";

interface TrialLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: ERPUser | null;
  currentCompany?: string;
  onActivateWithLicenseKey?: (key: string) => void;
  onOpenLegalPolicy?: (policy: LegalPolicyType) => void;
}

type ModalStep = "TRIAL_EXPIRED" | "TWO_FACTOR_AUTH" | "ORIGINAL_LINK";

export const TrialLockModal: React.FC<TrialLockModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentCompany = "شركة البدر للأدوية والمستلزمات الطبية",
  onActivateWithLicenseKey,
  onOpenLegalPolicy,
}) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>("TRIAL_EXPIRED");
  const [liked, setLiked] = useState<boolean | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [licenseInput, setLicenseInput] = useState("");
  const [activated, setActivated] = useState(false);

  // 2FA state
  const [twoFactorMethod, setTwoFactorMethod] = useState<"SMS" | "WHATSAPP" | "EMAIL" | "AUTHENTICATOR">("SMS");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [twoFactorError, setTwoFactorError] = useState("");
  const [twoFactorSuccess, setTwoFactorSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(45);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const clientName = currentUser?.name || "عميل النسخة التجريبية";
  const companyName = currentCompany || "المنشأة التجريبية";
  const clientEmail = currentUser?.email || "trial-user@medo-trial.com";
  const clientPhone = currentUser?.phone || "+967 773 586 047";

  const trialState = trialService.getTrialState();
  const fingerprint = trialService.generateBrowserFingerprint();
  const originalDetails = trialService.getOriginalVersionLink(companyName);

  useEffect(() => {
    if (isOpen) {
      const existing2FA = trialService.get2FAState();
      if (existing2FA.isVerified) {
        setCurrentStep("ORIGINAL_LINK");
      } else {
        setCurrentStep("TRIAL_EXPIRED");
      }
      setCopiedLink(false);
      setCopiedKey(false);
      setTwoFactorError("");
      setLicenseInput(originalDetails.licenseKey);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any;
    if (currentStep === "TWO_FACTOR_AUTH" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, resendTimer]);

  if (!isOpen) return null;

  const handleToggleFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) {
      const copy = [...otpDigits];
      copy[index] = "";
      setOtpDigits(copy);
      return;
    }

    if (cleaned.length === 6) {
      // Pasted full 6-digit code
      const splitted = cleaned.split("").slice(0, 6);
      setOtpDigits(splitted);
      return;
    }

    const copy = [...otpDigits];
    copy[index] = cleaned[cleaned.length - 1];
    setOtpDigits(copy);

    // Auto-advance to next input
    if (index < 5 && cleaned) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-digit-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleFillDemoOtp = () => {
    const demoCode = "852963";
    setOtpDigits(demoCode.split(""));
    setTwoFactorError("");
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError("");
    const code = otpDigits.join("");

    if (code.length < 6) {
      setTwoFactorError("يرجى إدخال رمز التحقق كاملاً المكون من 6 أرقام.");
      return;
    }

    const res = trialService.verifyTwoFactorCode(code, clientName, companyName, twoFactorMethod);
    if (res.success) {
      setTwoFactorSuccess(true);
      soundService.playSound("SUCCESS_CHIME");
      setTimeout(() => {
        setTwoFactorSuccess(false);
        setCurrentStep("ORIGINAL_LINK");
      }, 1000);
    } else {
      setTwoFactorError(res.message);
      soundService.playSound("RADAR_SECURITY");
    }
  };

  const handleActivateLicenseDirect = (keyToActivate?: string) => {
    const key = (keyToActivate || licenseInput || originalDetails.licenseKey).trim();
    if (key.length >= 6) {
      trialService.activateLicense(key);
      setActivated(true);
      soundService.playSound("SUCCESS_CHIME");
      if (onActivateWithLicenseKey) {
        onActivateWithLicenseKey(key);
      }
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      alert("يرجى إدخال رقم تسلسلي صحيح (مثال: MEDO-PRO-2026-BADR-PHARMA-L1)");
    }
  };

  const handleCopyOriginalLink = () => {
    navigator.clipboard.writeText(originalDetails.url);
    setCopiedLink(true);
    soundService.playSound("ENTERPRISE_BELL");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyLicenseKey = () => {
    navigator.clipboard.writeText(originalDetails.licenseKey);
    setCopiedKey(true);
    soundService.playSound("ENTERPRISE_BELL");
    setTimeout(() => setCopiedKey(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-['Alexandria','Cairo',sans-serif]">
      <div
        className="bg-gradient-to-b from-[#091628] via-[#081220] to-[#040a14] border-2 border-blue-500/40 rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)] animate-scaleUp text-right"
        dir="rtl"
      >
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3 text-right">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-blue-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">منظومة MeDo ERP السحابية</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-600/50">
                  فترة تجريبية 48 ساعة
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{companyName}</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-300 font-bold">{clientName}</span>
              </p>
            </div>
          </div>

          {/* Stepper indicator */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setCurrentStep("TRIAL_EXPIRED")}
              className={`px-2.5 py-1 rounded-lg transition ${
                currentStep === "TRIAL_EXPIRED"
                  ? "bg-amber-500 text-slate-950 font-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              1. انقضاء التجربة
            </button>
            <span className="text-slate-600">←</span>
            <button
              type="button"
              onClick={() => setCurrentStep("TWO_FACTOR_AUTH")}
              className={`px-2.5 py-1 rounded-lg transition ${
                currentStep === "TWO_FACTOR_AUTH"
                  ? "bg-blue-600 text-white font-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              2. المصادقة 2FA
            </button>
            <span className="text-slate-600">←</span>
            <button
              type="button"
              onClick={() => {
                if (trialService.get2FAState().isVerified) setCurrentStep("ORIGINAL_LINK");
              }}
              className={`px-2.5 py-1 rounded-lg transition ${
                currentStep === "ORIGINAL_LINK"
                  ? "bg-emerald-500 text-slate-950 font-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              3. الرابط الأصلي
            </button>
          </div>
        </div>

        {/* ================= STEP 1: TRIAL EXPIRED NOTICE ================= */}
        {currentStep === "TRIAL_EXPIRED" && !activated && (
          <div className="space-y-5">
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3">
              <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm">
                <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>إشعار استنفاد فترة التجربة المجانية (48 ساعة - يومان بالدقة)</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                مرحباً عميلنا العزيز <strong className="text-amber-300">{clientName}</strong> (<span className="text-white font-medium">{companyName}</span>)،
                لقد انتهت فترة التجربة المجانية البالغة 48 ساعة لمنظومة MeDo ERP السحابية.
                للحفاظ على سرية وحماية حسابات منشأتكم وسجلات الأدوية والفوترة الإلكترونية، يتطلب تسليم
                <strong className="text-emerald-400"> رابط النسخة الأصلية الخاص بكم</strong> إتمام بروتوكول
                <strong className="text-blue-400"> المصادقة الثنائية (2FA)</strong> للتحقق من هوية المفوض الإداري والمالي.
              </p>

              {/* Hardware / Fingerprint Badge */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-blue-400" />
                  <span>معرّف الجهاز المسجل (Device Fingerprint):</span>
                </div>
                <span className="text-blue-300 font-bold">{fingerprint.fingerprintHash.slice(0, 18)}</span>
              </div>
            </div>

            {/* Client Survey */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-slate-200 block">تقييمكم لتجربة نظام MeDo ERP خلال الـ 48 ساعة:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLiked(true)}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition cursor-pointer ${
                    liked === true
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                      : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" /> نعم، نظام متكامل وسريع جداً
                </button>
                <button
                  type="button"
                  onClick={() => setLiked(false)}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition cursor-pointer ${
                    liked === false
                      ? "bg-rose-600 text-white border-rose-500 shadow-md"
                      : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" /> لدي مقترحات لتطوير النظام
                </button>
              </div>

              {/* Feature checkboxes */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="font-bold text-slate-300 text-[11px] block">ما الذي أعجبك أكثر في منظومة MeDo ERP؟</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "سهولة الاستخدام وبساطة الواجهات",
                    "دقة التقارير والامتثال المالي",
                    "سرعة وكفاءة النظام (Offline/Cloud)",
                    "الدعم الفني والمتابعة الفورية",
                  ].map((feat) => {
                    const isChecked = selectedFeatures.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => handleToggleFeature(feat)}
                        className={`p-2 rounded-xl text-right text-[11px] font-medium border flex items-center justify-between transition cursor-pointer ${
                          isChecked
                            ? "bg-blue-600/30 border-blue-400 text-blue-200 font-bold"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        <span>{feat}</span>
                        <div
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                            isChecked ? "bg-blue-600 border-blue-400 text-white" : "border-slate-700"
                          }`}
                        >
                          {isChecked && "✓"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Direct WhatsApp Feedback Button */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <a
                  href={`https://wa.me/967773586047?text=${encodeURIComponent(
                    `مرحباً، تقييم تجربة MeDo ERP لمنشأة ${companyName}:\nالتقييم: ${liked === true ? '👍 ممتاز' : liked === false ? '👎 مقترحات' : 'لم يحدد'}\nالمزايا المفضلة: ${selectedFeatures.join('، ') || 'كافة المزايا'}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 bg-emerald-700/40 hover:bg-emerald-600/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>إرسال التقييم والتواصل عبر واتساب (+0967773586047)</span>
                </a>
              </div>
            </div>

            {/* Primary Action to Proceed to 2FA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep("TWO_FACTOR_AUTH")}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
              >
                <span>الانتقال للمصادقة الثنائية (2FA) واستلام الرابط الأصلي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onOpenLegalPolicy && onOpenLegalPolicy("TRIAL_TERMS")}
                className="text-[11px] text-slate-400 hover:text-white underline inline-flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>اتفاقية الفترة التجريبية 48 ساعة</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: TWO-FACTOR AUTHENTICATION (2FA) ================= */}
        {currentStep === "TWO_FACTOR_AUTH" && !activated && (
          <form onSubmit={handleVerify2FA} className="space-y-5">
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-600/50 space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-black text-sm">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <span>بروتوكول المصادقة الثنائية الإلزامية (Two-Factor Authentication)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                لحماية حساب منشأة <strong className="text-white">{companyName}</strong>، تم توليد رمز مصادقة أمني خاص بـ{" "}
                <strong className="text-amber-300">{clientName}</strong>. يرجى اختيار القناة المناسبة وإدخال رمز التحقق (OTP) المكون من 6 أرقام.
              </p>
            </div>

            {/* Verification Channel Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">قناة استلام رمز التحقق (Verification Channel):</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: "SMS" as const,
                    title: "رسالة SMS / واتساب",
                    sub: clientPhone,
                    icon: Smartphone,
                  },
                  {
                    id: "EMAIL" as const,
                    title: "البريد الإلكتروني",
                    sub: clientEmail,
                    icon: Mail,
                  },
                  {
                    id: "AUTHENTICATOR" as const,
                    title: "تطبيق Authenticator",
                    sub: "Google / Microsoft TOTP",
                    icon: KeyRound,
                  },
                ].map((channel) => {
                  const Icon = channel.icon;
                  const isSelected = twoFactorMethod === channel.id;
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => setTwoFactorMethod(channel.id)}
                      className={`p-3 rounded-xl border text-right transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-blue-600/25 border-blue-400 shadow-md"
                          : "bg-slate-900/90 border-slate-800 hover:bg-slate-800 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-blue-400" : "text-slate-500"}`} />
                        <span className={`text-[10px] font-bold ${isSelected ? "text-blue-300" : "text-slate-500"}`}>
                          {isSelected ? "محدد" : ""}
                        </span>
                      </div>
                      <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-300"}`}>
                        {channel.title}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">{channel.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test Helper Demo OTP Box */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-blue-950/70 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5 text-center sm:text-right">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5 justify-center sm:justify-start">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>رمز المصادقة الثنائية التجريبي (Demo OTP Code):</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  رمز الاعتماد المباشر للتجربة والاختبار: <strong className="font-mono text-amber-300 text-sm tracking-widest bg-slate-950 px-2 py-0.5 rounded border border-slate-700">852963</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFillDemoOtp}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>⚡ إدراج الرمز تلقائياً (852963)</span>
              </button>
            </div>

            {/* 6-Digit OTP Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block text-center">
                أدخل رمز التحقق (OTP) المكون من 6 أرقام:
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-3" dir="ltr">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-digit-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 bg-slate-950 border-2 border-slate-700 focus:border-blue-500 rounded-xl text-center text-lg sm:text-xl font-mono font-bold text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition"
                  />
                ))}
              </div>

              {twoFactorError && (
                <p className="text-xs font-bold text-rose-400 text-center flex items-center justify-center gap-1 pt-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{twoFactorError}</span>
                </p>
              )}
              {twoFactorSuccess && (
                <p className="text-xs font-bold text-emerald-400 text-center flex items-center justify-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تم تأكيد الرمز بنجاح! جاري تحضير الرابط الخاص بالنسخة الأصلية...</span>
                </p>
              )}
            </div>

            {/* Resend & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setResendTimer(60);
                  alert(`تم إرسال رمز تحقق جديد إلى ${clientPhone}`);
                }}
                disabled={resendTimer > 0}
                className="text-[11px] text-slate-400 hover:text-white disabled:opacity-50 flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendTimer > 0 ? "animate-spin" : ""}`} />
                <span>{resendTimer > 0 ? `إعادة إرسال الرمز خلال (${resendTimer} ثانية)` : "إعادة إرسال رمز جديد"}</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setCurrentStep("TRIAL_EXPIRED")}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition"
                >
                  رجوع
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>تأكيد الرمز واعتماد الهوية</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================= STEP 3: ORIGINAL VERSION LINK & ACTIVATION ================= */}
        {currentStep === "ORIGINAL_LINK" && !activated && (
          <div className="space-y-5">
            {/* 2FA Verified Badge */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>تم إتمام المصادقة الثنائية (2FA) بنجاح وتوثيق هوية المفوض: {clientName}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-900 text-emerald-200 border border-emerald-500/50">
                2FA VERIFIED
              </span>
            </div>

            {/* Dedicated Original Version Link Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-blue-950/50 to-slate-950/90 border-2 border-blue-500/60 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-white">
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                  <span>الرابط الخاص المعتمد للنسخة الأصلية (Dedicated Original Version Link):</span>
                </div>
                <span className="text-[10px] font-bold text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded-md border border-blue-500/30">
                  رابط مخصص لمنشأتكم
                </span>
              </div>

              <div className="flex items-center gap-2" dir="ltr">
                <input
                  type="text"
                  readOnly
                  value={originalDetails.url}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-blue-200 focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyOriginalLink}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                    copiedLink
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-md"
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? "تم النسخ!" : "نسخ الرابط"}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                هذا الرابط الآمن خاص بـ <strong className="text-white">{companyName}</strong> ويتضمن توقيع المصادقة الثنائية الرقمي.
                يمكن مشاركته مع الإدارة المالية أو حفظه لتسجيل الدخول إلى النسخة الأصلية بكامل الصلاحيات.
              </p>
            </div>

            {/* Direct License Key Activation */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>مفتاح الترخيص الدائم للنسخة الأصلية (License Key):</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyLicenseKey}
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey ? "تم نسخ المفتاح!" : "نسخ المفتاح"}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={licenseInput}
                  onChange={(e) => setLicenseInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-amber-300 text-center tracking-widest focus:outline-none focus:border-amber-500"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => handleActivateLicenseDirect(licenseInput)}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/30 transition transform hover:scale-102 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>تفعيل النسخة الأصلية فوراً في هذا المتصفح</span>
                </button>
              </div>
            </div>

            {/* Direct WhatsApp Contact */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 text-center sm:text-right">
                <div className="text-xs font-bold text-emerald-300">للتنسيق المالي واستلام العقود الرسمية:</div>
                <div className="text-[11px] text-slate-400 font-mono dir-ltr">+967 773 586 047 (مجموعة بن زياد وميدو تك)</div>
              </div>
              <a
                href={`https://wa.me/967773586047?text=${encodeURIComponent(
                  `مرحباً، أنا عبدالملك بدر من شركة البدر للأدوية والمستلزمات الطبية. أتممت المصادقة الثنائية 2FA وأرغب بتسجيل ترخيص النسخة الأصلية لمنظومة MeDo ERP.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>مراسلة واتساب مباشرة</span>
              </a>
            </div>
          </div>
        )}

        {/* ================= ACTIVATED SUCCESS STATE ================= */}
        {activated && (
          <div className="p-8 text-center space-y-4 bg-gradient-to-b from-emerald-950/90 to-slate-950/90 rounded-2xl border-2 border-emerald-500 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-emerald-300">تم تفعيل النسخة الأصلية بنجاح!</h3>
              <p className="text-xs text-slate-200">
                تهانينا لـ <strong className="text-white">{clientName}</strong> - منشأة <strong className="text-white">{companyName}</strong>
              </p>
              <p className="text-[11px] text-emerald-400/90 pt-2 font-medium">
                تم فك قفل كافة الوحدات واللوحات السحابية بصلاحيات دائمة غير مقيدة.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
