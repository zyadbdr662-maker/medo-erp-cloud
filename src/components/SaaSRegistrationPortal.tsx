import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  KeyRound,
  FileText,
  Globe2,
  Send,
  MessageSquare,
  QrCode,
  Clock,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Layers,
  ChevronRight,
  Briefcase,
  MapPin,
  HelpCircle,
  X
} from "lucide-react";
import { executeRecaptchaV3 } from "../services/recaptcha";
import { SecurityAuditService } from "../services/securityAuditService";
import { soundService } from "../services/notificationSoundService";
import {
  registerSelfServiceTenant,
  PreGeneratedTenant,
  VERCEL_PRODUCTION_BASE,
  TENANTS_STORAGE_KEY,
  REGISTERED_TENANTS_KEY,
} from "../data/preGeneratedTenants";
import {
  instantNotificationService,
  MASTER_ADMIN_PRIMARY_EMAIL,
  MASTER_ADMIN_WHATSAPP,
} from "../services/notificationService";
import { emailService } from "../services/emailService";

interface SaaSRegistrationPortalProps {
  onCancel: () => void;
  onRegistrationSuccess?: (tenant: PreGeneratedTenant) => void;
  initialRole?: string;
}

export const SaaSRegistrationPortal: React.FC<SaaSRegistrationPortalProps> = ({
  onCancel,
  onRegistrationSuccess,
}) => {
  // Steps: 1 = Form, 2 = 7-digit OTP Email Verification, 3 = Provisioning Success & Links
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    crNumber: "",
    taxNumber: "",
    industry: "تجارة عامة واستيراد وتصدير",
    city: "صنعاء",
    address: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // 7-digit OTP verification state
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", "", ""]);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number>(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(600); // 10 minutes
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [isLockedOut, setIsLockedOut] = useState<boolean>(false);
  const [showSimulatedEmailModal, setShowSimulatedEmailModal] = useState<boolean>(false);
  const [emailDeliveryInfo, setEmailDeliveryInfo] = useState<{
    sent: boolean;
    provider?: string;
    note?: string;
    email?: string;
  } | null>(null);

  // Newly Provisioned Tenant & Notification Data
  const [provisionedTenant, setProvisionedTenant] = useState<PreGeneratedTenant | null>(null);
  const [notificationDispatched, setNotificationDispatched] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showNotificationDetailsModal, setShowNotificationDetailsModal] = useState<boolean>(false);

  // Quick industry presets
  const industryPresets = [
    "تجارة عامة واستيراد وتصدير",
    "صيدليات ومستلزمات طبية وأدوية",
    "صناعة ومصانع وتجميع",
    "مقاولات وإنشاءات واستثمار عقاري",
    "إلكترونيات وأجهزة ذكية وشبكات",
    "مواد غذائية وتموينات ومخابز",
    "صرافة وتحويلات وخدمات مالية",
    "خدمات لوجستية ونقل وتخليص",
  ];

  // [CRITICAL AUTO-LOGOUT ON MOUNT] Purge old sessions & cached credentials to ensure clean tenant isolation
  useEffect(() => {
    try {
      const savedReg = localStorage.getItem(REGISTERED_TENANTS_KEY);
      const saved200 = localStorage.getItem(TENANTS_STORAGE_KEY);

      // Full clear
      localStorage.clear();
      sessionStorage.clear();

      // Restore registered tenants registry
      if (savedReg) localStorage.setItem(REGISTERED_TENANTS_KEY, savedReg);
      if (saved200) localStorage.setItem(TENANTS_STORAGE_KEY, saved200);

      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.warn("Storage purge on registration mount:", e);
    }
  }, []);

  // Live timer for OTP expiration (10 minutes)
  useEffect(() => {
    let timer: any;
    if (step === 2 && timeLeftSeconds > 0 && !isLockedOut) {
      timer = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setErrorMessage("انتهت صلاحية رمز التحقق (10 دقائق). يرجى طلب رمز جديد.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeftSeconds, isLockedOut]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  // Generate 7-digit OTP
  const generate7DigitOtp = (): string => {
    const min = 1000000;
    const max = 9999999;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  };

  // Step 1: Submit form & Send 7-digit OTP
  const handleProceedToVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.nameAr.trim()) {
      setErrorMessage("يرجى إدخال اسم المنشأة باللغة العربية.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("يرجى إدخال بريد إلكتروني صحيح لاستقبال رمز التحقق.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage("يرجى إدخال رقم الجوال للتواصل وتأكيد الحساب.");
      return;
    }
    if (formData.password.length < 4) {
      setErrorMessage("كلمة المرور يجب أن لا تقل عن 4 خانات.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("كلمتا المرور غير متطابقتين. يرجى التأكد وإعادة الإدخال.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Google reCAPTCHA v3 check
      const recaptchaRes = await executeRecaptchaV3("register");
      if (!recaptchaRes.success || recaptchaRes.isBotRisk) {
        setErrorMessage("تم رصد نشاط آلي غير مصرح به. يرجى المحاولة لاحقاً.");
        setIsLoading(false);
        return;
      }

      // 2. Generate 7-digit OTP and set 10-minute expiry
      const newOtp = generate7DigitOtp();
      setGeneratedOtp(newOtp);
      setOtpDigits(["", "", "", "", "", "", ""]);
      setTimeLeftSeconds(600); // 10 minutes
      setOtpExpiresAt(Date.now() + 10 * 60 * 1000);
      setFailedAttempts(0);
      setIsLockedOut(false);

      // Play audio notification
      soundService.playSound("ROYAL_BANK_CHIME");

      // 3. Dispatch real OTP email to the registrant's email
      emailService
        .sendVerificationOtp({
          email: formData.email,
          code: newOtp,
          companyName: formData.nameAr,
        })
        .then((res) => {
          setEmailDeliveryInfo({
            sent: res.success,
            provider: res.provider,
            note: res.error,
            email: formData.email,
          });
        })
        .catch((err) => {
          console.warn("[SaaSRegistrationPortal] Email dispatch error:", err);
        });

      setIsLoading(false);
      setStep(2);
      setShowSimulatedEmailModal(true);
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء إعداد التحقق.");
      setIsLoading(false);
    }
  };

  // OTP Input Handling (7 digits)
  const handleOtpDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) {
      const copy = [...otpDigits];
      copy[index] = "";
      setOtpDigits(copy);
      return;
    }

    if (cleaned.length === 7) {
      // Pasted full 7-digit code
      const splitted = cleaned.split("").slice(0, 7);
      setOtpDigits(splitted);
      return;
    }

    const copy = [...otpDigits];
    copy[index] = cleaned[cleaned.length - 1];
    setOtpDigits(copy);

    // Advance to next input
    if (index < 6 && cleaned) {
      const nextElem = document.getElementById(`otp-reg-digit-${index + 1}`);
      if (nextElem) nextElem.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevElem = document.getElementById(`otp-reg-digit-${index - 1}`);
      if (prevElem) prevElem.focus();
    }
  };

  // Step 2: Verify 7-digit code and complete enterprise creation
  const handleVerifyOtpAndCreateTenant = async () => {
    const enteredCode = otpDigits.join("");
    if (enteredCode.length !== 7) {
      setErrorMessage("يرجى إدخال رمز التحقق المكون من 7 أرقام كاملاً.");
      return;
    }

    if (timeLeftSeconds <= 0) {
      setErrorMessage("انتهت صلاحية الرمز. يرجى النقر على 'إعادة إرسال الرمز'.");
      return;
    }

    if (isLockedOut) {
      setErrorMessage("الحساب مقفل مؤقتاً لتجاوز 3 محاولات خاطئة. يرجى الانتظار.");
      return;
    }

    if (enteredCode !== generatedOtp) {
      const newFails = failedAttempts + 1;
      setFailedAttempts(newFails);
      soundService.playSound("RADAR_SECURITY");

      if (newFails >= 3) {
        setIsLockedOut(true);
        setErrorMessage("⚠️ تم قفل الحساب مؤقتاً بعد 3 محاولات خاطئة لحماية المنشأة. يرجى إعادة طلب التسجيل بعد قليل.");
      } else {
        setErrorMessage(`⚠️ رمز التحقق غير صحيح! متبقي لديك ${3 - newFails} محاولات.`);
      }
      return;
    }

    // SUCCESS: Code is verified!
    setIsLoading(true);
    setErrorMessage(null);
    soundService.playSound("SUCCESS_CHIME");

    setTimeout(async () => {
      try {
        // 1. Register Self-Service Tenant
        const newTenant = registerSelfServiceTenant({
          nameAr: formData.nameAr,
          nameEn: formData.nameEn || `${formData.nameAr} (MeDo)`,
          crNumber: formData.crNumber,
          taxNumber: formData.taxNumber,
          industry: formData.industry,
          address: formData.address,
          city: formData.city,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });

        // 2. Establish fresh, isolated session specifically for this new tenant
        const newSession = {
          tenantId: newTenant.id,
          tenantName: newTenant.name,
          role: "MANAGER",
          token: newTenant.roles?.MANAGER?.token || `AUTH_MGR_${newTenant.id}`,
          createdAt: Date.now(),
        };

        const newManagerUser = {
          id: `EMP-MANAGER-${Date.now().toString().slice(-4)}`,
          name: `${formData.nameAr} (المدير العام)`,
          role: "SYSTEM_ADMIN",
          branch: "المركز الرئيسي",
          status: "ACTIVE",
          avatar: "MG",
          email: formData.email,
          tenantId: newTenant.id,
        };

        // Purge old company caches
        try {
          sessionStorage.clear();
          localStorage.removeItem("medo_erp_state_v1");
          localStorage.setItem("medo_active_tenant_slug", newTenant.id);
          localStorage.setItem("currentTenant", JSON.stringify(newTenant));
          localStorage.setItem("currentSession", JSON.stringify(newSession));
          localStorage.setItem("medo_erp_current_user_v1", JSON.stringify(newManagerUser));
          localStorage.setItem("medo_erp_admin_mode", "true");
          sessionStorage.setItem("medo_erp_auth", "true");
        } catch (e) {
          console.warn("Error setting new tenant session:", e);
        }

        setProvisionedTenant(newTenant);

        // Notify all views, Sovereign Admin, and tabs in real time
        try {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("tenant_registered", { detail: newTenant }));
            window.dispatchEvent(new Event("storage"));
          }
        } catch (e) {
          console.warn("Event dispatch notice:", e);
        }

        // 3. Dispatch Instant Notifications to Master Admin (Badr)
        const notificationResult = await instantNotificationService.dispatchNewRegistration({
          tenant: newTenant,
          deviceType: `${navigator.platform} - ${navigator.userAgent.substring(0, 35)}`,
          registeredAt: new Date().toLocaleString("ar-YE"),
        });

        setNotificationDispatched(true);
        setIsLoading(false);
        setStep(3);

        if (onRegistrationSuccess) {
          onRegistrationSuccess(newTenant);
        }
      } catch (err: any) {
        setErrorMessage(err.message || "حدث خطأ أثناء إنشاء وتخصيص المنشأة.");
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleResendOtp = () => {
    if (isLockedOut) return;
    const newOtp = generate7DigitOtp();
    setGeneratedOtp(newOtp);
    setOtpDigits(["", "", "", "", "", "", ""]);
    setTimeLeftSeconds(600);
    setErrorMessage(null);
    setShowSimulatedEmailModal(true);
    soundService.playSound("ROYAL_BANK_CHIME");

    emailService
      .sendVerificationOtp({
        email: formData.email,
        code: newOtp,
        companyName: formData.nameAr,
      })
      .then((res) => {
        setEmailDeliveryInfo({
          sent: res.success,
          provider: res.provider,
          note: res.error,
          email: formData.email,
        });
      })
      .catch((err) => {
        console.warn("[SaaSRegistrationPortal] Resend error:", err);
      });
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    soundService.playSound("ROYAL_BANK_CHIME");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#030712]/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto" dir="rtl">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-emerald-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-3xl bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl relative z-10 overflow-hidden my-auto animate-in fade-in duration-300">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-600 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wide">تسجيل منشأة جديدة في MeDo ERP</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Self-Service Provisioning
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                إنشاء بيئة سحابية معزولة تماماً مع روابط الوصول المباشرة للوظائف الخمس
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-700"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress line */}
        <div className="px-8 pt-5 pb-3 border-b border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center justify-between max-w-md mx-auto relative">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />
            <div
              className={`absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500 -z-0`}
              style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
            />

            {/* Step 1 indicator */}
            <div className="flex flex-col items-center gap-1 relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step >= 1
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-500/20"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                1
              </div>
              <span className={`text-[11px] font-bold ${step >= 1 ? "text-blue-400" : "text-slate-500"}`}>
                بيانات المنشأة
              </span>
            </div>

            {/* Step 2 indicator */}
            <div className="flex flex-col items-center gap-1 relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step >= 2
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-4 ring-indigo-500/20"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                2
              </div>
              <span className={`text-[11px] font-bold ${step >= 2 ? "text-indigo-400" : "text-slate-500"}`}>
                التحقق (7 أرقام)
              </span>
            </div>

            {/* Step 3 indicator */}
            <div className="flex flex-col items-center gap-1 relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step >= 3
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-4 ring-emerald-500/20"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                3
              </div>
              <span className={`text-[11px] font-bold ${step >= 3 ? "text-emerald-400" : "text-slate-500"}`}>
                الروابط والإشعارات
              </span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-center gap-3 text-red-200 text-xs animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span className="font-medium flex-1">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 1: Main Registration Form */}
        {step === 1 && (
          <form onSubmit={handleProceedToVerification} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* Name AR */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اسم المنشأة (باللغة العربية) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="nameAr"
                    required
                    value={formData.nameAr}
                    onChange={handleInputChange}
                    placeholder="مثال: شركة الرائد للتجارة والتوريدات"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Name EN */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اسم المنشأة (English)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="nameEn"
                    value={formData.nameEn}
                    onChange={handleInputChange}
                    placeholder="e.g. Al-Raid Trading & Supplies"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-left"
                    dir="ltr"
                  />
                  <Globe2 className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Commercial Register */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  السجل التجاري (CR)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="crNumber"
                    value={formData.crNumber}
                    onChange={handleInputChange}
                    placeholder="مثال: 1010874521"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                  <FileText className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Tax Number */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  الرقم الضريبي (VAT)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="taxNumber"
                    value={formData.taxNumber}
                    onChange={handleInputChange}
                    placeholder="مثال: 300984712300003"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Commercial Activity */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  النشاط التجاري <span className="text-red-400">*</span>
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {industryPresets.map((ind) => (
                    <option key={ind} value={ind} className="bg-slate-900 text-white">
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              {/* City & Address */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  المدينة والعنوان
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="مثال: صنعاء - شارع الستين / عدن - المعلا"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  البريد الإلكتروني للتحقق والإشعارات <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@company.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-left"
                    dir="ltr"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Phone / Mobile */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  رقم الجوال / واتساب <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+967 773 586 047"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-left font-mono"
                    dir="ltr"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  كلمة المرور <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-white absolute left-3.5 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  تأكيد كلمة المرور <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-500 hover:text-white absolute left-3.5 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
              >
                إلغاء والعودة
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    جاري فحص الأمان وإرسال الرمز...
                  </>
                ) : (
                  <>
                    متابعة وإرسال رمز التحقق (7 أرقام)
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: 7-Digit OTP Verification Screen */}
        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center max-w-md mx-auto space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-2 shadow-inner">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-white">التحقق من البريد الإلكتروني</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                تم إرسال رمز أمان وتحقق سري مكون من <span className="font-bold text-white">7 أرقام</span> من مرسل:{" "}
                <span className="font-bold text-emerald-400">MeDo ERP</span> إلى البريد:{" "}
                <span className="font-mono text-blue-300 font-bold" dir="ltr">{formData.email}</span>
              </p>

              {/* Real Email Dispatch Status Badge */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 max-w-md mx-auto flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {emailDeliveryInfo?.provider === "resend" || emailDeliveryInfo?.provider === "smtp"
                      ? "تم إرسال الرمز مباشرة إلى صندوق الوارد (Live Email Dispatch)"
                      : "تم إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح"}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {emailDeliveryInfo?.provider ? `[${emailDeliveryInfo.provider.toUpperCase()}]` : "[DELIVERED]"}
                </span>
              </div>
            </div>

            {/* 7-digit OTP Input Fields */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 max-w-lg mx-auto" dir="ltr">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-reg-digit-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  disabled={isLockedOut}
                  onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-10 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black font-mono rounded-xl bg-slate-950 border-2 transition-all ${
                    digit
                      ? "border-blue-500 text-emerald-400 bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      : "border-slate-700 text-white focus:border-indigo-500"
                  } focus:outline-none`}
                />
              ))}
            </div>

            {/* 10-minute Timer & Resend */}
            <div className="flex items-center justify-between max-w-md mx-auto text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>صلاحية الرمز (10 دقائق):</span>
                <span className={`font-mono font-bold ${timeLeftSeconds < 60 ? "text-red-400" : "text-emerald-400"}`}>
                  {formatTimer(timeLeftSeconds)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timeLeftSeconds > 540 || isLockedOut}
                className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                إعادة إرسال الرمز
              </button>
            </div>

            {/* Simulated Email Pop-up preview toggle */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowSimulatedEmailModal(true)}
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 underline font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                معاينة رسالة البريد الواردة (Inbox Preview) من MeDo ERP
              </button>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                تعديل البيانات
              </button>

              <button
                type="button"
                onClick={handleVerifyOtpAndCreateTenant}
                disabled={isLoading || isLockedOut || otpDigits.join("").length !== 7}
                className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    جاري التوثيق وتجهيز الروابط السحابية...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    تأكيد الرمز وإنشاء المنشأة فوراً
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Complete Provisioning & Master/Sub-Links View */}
        {step === 3 && provisionedTenant && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-black text-white">🎉 تم إنشاء المنشأة وتوليد الروابط بنجاح!</h3>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                تم تخصيص بيئة سحابية معزولة لـ <strong className="text-white">{provisionedTenant.name}</strong> وتم إشعار الإدارة السيادية والمدير بدر فوراً.
              </p>
            </div>

            {/* Instant Notification Confirmation Banner */}
            <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-blue-950/80 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-300">
                    ✓ تم إرسال الإشعار الفوري للمدير (بدر) بنجاح
                  </div>
                  <div className="text-[11px] text-slate-400">
                    البريد: <span className="font-mono text-slate-200">{MASTER_ADMIN_PRIMARY_EMAIL}</span> | واتساب: <span className="font-mono text-slate-200">{MASTER_ADMIN_WHATSAPP}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowNotificationDetailsModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  معاينة الإشعار
                </button>
                <a
                  href={`https://wa.me/967773586047?text=${encodeURIComponent(instantNotificationService.buildNotificationText({ tenant: provisionedTenant }))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  إرسال عبر واتساب
                </a>
              </div>
            </div>

            {/* Master Link Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                  <Globe2 className="w-4 h-4" />
                  الرابط الرئيسي الشامل للمنشأة (Master Link)
                </div>
                <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20">
                  All Roles Access
                </span>
              </div>

              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300">
                <span className="truncate flex-1 text-left" dir="ltr">
                  {provisionedTenant.masterDomain}
                </span>
                <button
                  onClick={() => copyToClipboard(provisionedTenant.masterDomain, "master")}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all shrink-0"
                  title="نسخ الرابط الرئيسي"
                >
                  {copiedKey === "master" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={provisionedTenant.masterDomain}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-blue-400 hover:text-blue-300 transition-all shrink-0"
                  title="فتح الرابط"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* 5 Sub-Role Links Table */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  الروابط الفرعية المعزولة بالصلاحيات (5 Sub-Links):
                </h4>
                <button
                  onClick={() => {
                    const allLinksText = `🏢 *روابط الوصول لمنشأة: ${provisionedTenant.name}*
الرابط الرئيسي: ${provisionedTenant.masterDomain}
-----------------------------
1. المدير (MANAGER): ${provisionedTenant.roles?.MANAGER?.subLink}
2. المحاسب (ACCOUNTANT): ${provisionedTenant.roles?.ACCOUNTANT?.subLink}
3. الكاشير/المبيعات (CASHIER): ${provisionedTenant.roles?.CASHIER?.subLink}
4. المشتريات (PURCHASER): ${provisionedTenant.roles?.PURCHASER?.subLink}
5. المراجع المالي (AUDITOR): ${provisionedTenant.roles?.AUDITOR?.subLink}`;
                    copyToClipboard(allLinksText, "all-links");
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  {copiedKey === "all-links" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  نسخ جميع الروابط
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { key: "MANAGER", title: "المدير العام (MANAGER)", cred: provisionedTenant.roles?.MANAGER, badge: "إدارة كاملة" },
                  { key: "ACCOUNTANT", title: "المحاسب المالي (ACCOUNTANT)", cred: provisionedTenant.roles?.ACCOUNTANT, badge: "قيود وسندات" },
                  { key: "CASHIER", title: "الكاشير والمبيعات (CASHIER)", cred: provisionedTenant.roles?.CASHIER, badge: "فواتير ونقاط بيع" },
                  { key: "PURCHASER", title: "مسؤول المشتريات (PURCHASER)", cred: provisionedTenant.roles?.PURCHASER, badge: "أوامر شراء ومخازن" },
                  { key: "AUDITOR", title: "المراجع الخارجي (AUDITOR)", cred: provisionedTenant.roles?.AUDITOR, badge: "تقارير وقوائم" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-bold text-white shrink-0">{item.title}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md shrink-0">
                        {item.badge}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px] truncate hidden md:inline" dir="ltr">
                        {item.cred?.subLink}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => copyToClipboard(item.cred?.subLink || "", item.key)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 transition-all"
                      >
                        {copiedKey === item.key ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        نسخ
                      </button>
                      <a
                        href={item.cred?.subLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/20 transition-all"
                        title="فتح الرابط"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
              >
                إغلاق الواجهة
              </button>

              <button
                onClick={() => {
                  let savedRegistered: string | null = null;
                  let savedTenants: string | null = null;
                  try {
                    savedRegistered = localStorage.getItem(REGISTERED_TENANTS_KEY);
                    savedTenants = localStorage.getItem(TENANTS_STORAGE_KEY);
                    // Clear all existing storage for full session isolation
                    localStorage.clear();
                    sessionStorage.clear();
                    // Restore registered tenants directory
                    if (savedRegistered) localStorage.setItem(REGISTERED_TENANTS_KEY, savedRegistered);
                    if (savedTenants) localStorage.setItem(TENANTS_STORAGE_KEY, savedTenants);
                  } catch (e) {}

                  const mgrToken =
                    provisionedTenant.roles?.MANAGER?.token || `AUTH_MGR_${provisionedTenant.id}`;
                  const newSession = {
                    tenantId: provisionedTenant.id,
                    tenantName: provisionedTenant.name,
                    role: "MANAGER",
                    token: mgrToken,
                    createdAt: Date.now(),
                  };
                  const newManagerUser = {
                    id: `EMP-MANAGER-${Date.now().toString().slice(-4)}`,
                    name: `${provisionedTenant.name} (المدير العام)`,
                    role: "SYSTEM_ADMIN",
                    branch: "المركز الرئيسي",
                    status: "ACTIVE",
                    avatar: "MG",
                    email:
                      provisionedTenant.assignedAdminEmail ||
                      provisionedTenant.roles?.MANAGER?.email,
                    tenantId: provisionedTenant.id,
                  };

                  try {
                    localStorage.setItem("medo_active_tenant_slug", provisionedTenant.id);
                    localStorage.setItem("currentTenant", JSON.stringify(provisionedTenant));
                    localStorage.setItem("currentSession", JSON.stringify(newSession));
                    localStorage.setItem("medo_erp_current_user_v1", JSON.stringify(newManagerUser));
                    localStorage.setItem("medo_erp_admin_mode", "true");
                    sessionStorage.setItem("medo_erp_auth", "true");
                  } catch (e) {}

                  const targetUrl =
                    provisionedTenant.roles?.MANAGER?.subLink ||
                    provisionedTenant.masterDomain ||
                    `/?tenant=${provisionedTenant.id}&role=MANAGER&token=${mgrToken}&path=/employee/manager`;
                  window.location.href = targetUrl;
                }}
                className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                دخول مساحة العمل كمدير للمنشأة الآن
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Simulated Email Pop-up Modal (MeDo ERP OTP Delivery) */}
      {showSimulatedEmailModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border-b border-indigo-900/50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">صندوق البريد الوارد (MeDo Inbox)</h4>
                  <p className="text-[11px] text-indigo-300">المرسل: MeDo ERP &lt;no-reply@medo-erp.cloud&gt;</p>
                </div>
              </div>
              <button onClick={() => setShowSimulatedEmailModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-center">
              <div className="text-xs text-slate-300">
                مرحباً بك في منظومة <strong className="text-white">MeDo ERP</strong>، استخدم الرمز السري أدناه لتأكيد بريدك الإلكتروني وإكمال إنشاء منشأتك:
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border-2 border-indigo-500/50 shadow-inner">
                <div className="text-[11px] text-slate-400 mb-1">رمز التحقق السري (7 أرقام):</div>
                <div className="text-3xl font-black font-mono tracking-widest text-emerald-400 select-all">
                  {generatedOtp}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">صالح لمدة 10 دقائق فقط (Sender: MeDo ERP)</div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const splitted = generatedOtp.split("");
                    setOtpDigits(splitted);
                    setShowSimulatedEmailModal(false);
                    soundService.playSound("ROYAL_BANK_CHIME");
                  }}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
                >
                  تعبئة الرمز تلقائياً للمتابعة
                </button>
                <button
                  onClick={() => setShowSimulatedEmailModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Preview Modal */}
      {showNotificationDetailsModal && provisionedTenant && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-black text-white">نص الإشعار الفوري المرسل للمدير (بدر)</h4>
              </div>
              <button onClick={() => setShowNotificationDetailsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="text-xs text-slate-400">
                المستلم: <strong className="text-white">{MASTER_ADMIN_PRIMARY_EMAIL}</strong> | واتساب: <strong className="text-white">{MASTER_ADMIN_WHATSAPP}</strong>
              </div>

              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed max-h-[350px] overflow-y-auto" dir="ltr">
                {instantNotificationService.buildNotificationText({ tenant: provisionedTenant })}
              </pre>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(instantNotificationService.buildNotificationText({ tenant: provisionedTenant }));
                    soundService.playSound("ROYAL_BANK_CHIME");
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  نسخ نص الإشعار
                </button>

                <button
                  onClick={() => setShowNotificationDetailsModal(false)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
                >
                  تم
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
