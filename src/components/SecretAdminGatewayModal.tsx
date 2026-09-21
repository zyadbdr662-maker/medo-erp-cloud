import React, { useState, useEffect, useCallback, useTransition, useMemo } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  Laptop,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Clock,
  ArrowRight,
  Sparkles,
  Shield,
  HelpCircle,
  PlusCircle,
  RefreshCw,
  X,
  Mail,
  Search,
  Building2,
  Filter,
  Copy,
  ExternalLink,
  Check,
  Key,
  Globe,
  Users,
  Layers,
  ChevronDown,
  Building,
} from "lucide-react";
import {
  AdminPortalSecurityService,
  AuthorizedDevice,
  DEFAULT_MASTER_PASSWORD_PLAIN,
  MASTER_DEVICE_ENROLL_PIN,
  MASTER_ADMIN_EMAIL,
} from "../services/adminPortalSecurityService";
import { getStored200Tenants, PreGeneratedTenant } from "../data/preGeneratedTenants";
import { soundService } from "../services/notificationSoundService";
import { SaaSRegistrationPortal } from "./SaaSRegistrationPortal";
import { SapUniversalSearchModal } from "./SapUniversalSearchModal";

// Seeded pseudo-random monthly activity generator for elegant Sparkline charts
function getTenantSparklineData(tenantId: string): number[] {
  let hash = 0;
  for (let i = 0; i < tenantId.length; i++) {
    hash = tenantId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const points: number[] = [];
  for (let m = 0; m < 6; m++) {
    const seed = Math.sin(hash + m) * 10000;
    const value = 20 + Math.floor((seed - Math.floor(seed)) * 60); // value between 20 and 80
    points.push(value);
  }
  return points;
}

interface SecretAdminGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessUnlock: () => void;
}

export const SecretAdminGatewayModal: React.FC<SecretAdminGatewayModalProps> = ({
  isOpen,
  onClose,
  onSuccessUnlock,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutHours, setLockoutHours] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  // Navigation & Advanced Search State inside SecretAdminGatewayModal
  const [activeGatewayTab, setActiveGatewayTab] = useState<"AUTH" | "ADVANCED_SEARCH">("AUTH");
  const [tenantSearchQuery, setTenantSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "TRIAL" | "PAID">("ALL");
  const [storedTenants, setStoredTenants] = useState<PreGeneratedTenant[]>([]);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);
  const [expandedTenantRoles, setExpandedTenantRoles] = useState<string | null>(null);
  const [showSaaSOnboarding, setShowSaaSOnboarding] = useState(false);
  const [isUniversalSearchOpen, setIsUniversalSearchOpen] = useState(false);

  // Active TOTP state for live helper
  const [activeTotp, setActiveTotp] = useState(AdminPortalSecurityService.getActiveTotpCode());

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTotp(AdminPortalSecurityService.getActiveTotpCode());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Device Whitelist Check State
  const [deviceInfo, setDeviceInfo] = useState<{
    fingerprint: string;
    isAuthorized: boolean;
    device?: AuthorizedDevice;
    deviceType: string;
    browserInfo: string;
    osInfo: string;
  } | null>(null);

  // Device Enrollment Form State
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [enrollPin, setEnrollPin] = useState("");
  const [enrollDeviceName, setEnrollDeviceName] = useState("");
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const checkInitialSecurityState = useCallback(async () => {
    setIsLoading(true);
    try {
      await AdminPortalSecurityService.initializeMasterPassword();

      // Check lockout status
      const locked = AdminPortalSecurityService.isLockoutActive();
      setIsLockedOut(locked);
      if (locked) {
        const lockoutUntil = AdminPortalSecurityService.getLockoutUntil();
        const hours = Math.max(1, Math.ceil((lockoutUntil - Date.now()) / (1000 * 60 * 60)));
        setLockoutHours(hours);
      } else {
        setRemainingAttempts(AdminPortalSecurityService.getRemainingAttempts());
      }

      // Check Device Whitelist
      const fpDetails = await AdminPortalSecurityService.getDeviceFingerprint();
      const authResult = await AdminPortalSecurityService.isCurrentDeviceAuthorized();

      setDeviceInfo({
        fingerprint: fpDetails.fingerprint,
        isAuthorized: authResult.isAuthorized,
        device: authResult.device,
        deviceType: fpDetails.deviceType,
        browserInfo: fpDetails.browserInfo,
        osInfo: fpDetails.osInfo,
      });

      if (!enrollDeviceName) {
        setEnrollDeviceName(`جهاز بدر (${fpDetails.osInfo} - ${fpDetails.deviceType})`);
      }
    } catch (e) {
      console.error("Error checking portal security state:", e);
    } finally {
      setIsLoading(false);
    }
  }, [enrollDeviceName]);

  useEffect(() => {
    const handleRefresh = () => {
      setStoredTenants(getStored200Tenants());
    };

    if (isOpen) {
      checkInitialSecurityState();
      handleRefresh();
      soundService.playSound("ENTERPRISE_BELL");

      if (typeof window !== "undefined") {
        window.addEventListener("tenant_registered", handleRefresh);
        window.addEventListener("storage", handleRefresh);
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("tenant_registered", handleRefresh);
        window.removeEventListener("storage", handleRefresh);
      }
    };
  }, [isOpen, checkInitialSecurityState]);

  // Advanced Search Filter Logic for Tenants (Name, CR Number, Tenant ID, Admin details)
  const filteredTenants = useMemo(() => {
    let result = storedTenants;

    // Filter by Status (نشطة، تجريبية، مدفوعة)
    if (statusFilter !== "ALL") {
      if (statusFilter === "ACTIVE") {
        result = result.filter((t) => t.status === "ACTIVE");
      } else if (statusFilter === "TRIAL") {
        result = result.filter((t) => t.status === "TRIAL");
      } else if (statusFilter === "PAID") {
        result = result.filter(
          (t) => t.status === "PAID_ENTERPRISE" || (t.status as string) === "PAID"
        );
      }
    }

    // Filter by Advanced Search Query
    if (tenantSearchQuery.trim()) {
      const q = tenantSearchQuery.trim().toLowerCase();
      result = result.filter((t) => {
        const nameAr = (t.name || t.companyNameAr || "").toLowerCase();
        const nameEn = (t.nameEn || t.companyNameEn || "").toLowerCase();
        const cr = (t.crNumber || t.commercialReg || "").toLowerCase();
        const tenantId = (t.id || t.slug || "").toLowerCase();
        const email = (t.assignedAdminEmail || "").toLowerCase();
        const phone = (t.phone || t.assignedAdminPhone || "").toLowerCase();
        const city = (t.city || "").toLowerCase();

        return (
          nameAr.includes(q) ||
          nameEn.includes(q) ||
          cr.includes(q) ||
          tenantId.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          city.includes(q)
        );
      });
    }

    return result;
  }, [storedTenants, statusFilter, tenantSearchQuery]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    soundService.playSound("SUCCESS_CHIME");
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  const handleVerify = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!password.trim()) {
        setErrorMsg("يرجى إدخال كلمة مرور المدير للمتابعة.");
        return;
      }
      if (!twoFactorCode.trim() || twoFactorCode.trim().length < 6) {
        setErrorMsg("يرجى إدخال رمز التحقق الثنائي (2FA) المكون من 6 أرقام.");
        return;
      }

      if (deviceInfo && !deviceInfo.isAuthorized) {
        // Auto-authorize current device upon password verification attempt
        AdminPortalSecurityService.enrollDeviceWithPin(
          MASTER_DEVICE_ENROLL_PIN,
          `جهاز الإدارة (${deviceInfo.osInfo || "متصفح"})`
        );
      }

      setIsLoading(true);
      setErrorMsg(null);

      // Defer async hashing and security operations to avoid blocking UI frame
      setTimeout(async () => {
        try {
          const result = await AdminPortalSecurityService.verifyMasterWith2FA(
            password,
            twoFactorCode
          );

          startTransition(() => {
            if (result.success) {
              setSuccessMsg("✓ تم التحقق بنجاح من كلمة المرور ورمز 2FA! جاري فتح لوحة الإدارة...");
              setTimeout(() => {
                onSuccessUnlock();
                onClose();
              }, 1000);
            } else {
              setRemainingAttempts(result.remainingAttempts);
              setIsLockedOut(result.isLockedOut);
              setLockoutHours(result.lockoutDurationHours || null);
              setErrorMsg(result.errorMsg || "بيانات الدخول أو رمز 2FA غير صحيح.");
            }
          });
        } catch (err: any) {
          startTransition(() => {
            setErrorMsg(err.message || "حدث خطأ غير متوقع أثناء التحقق.");
          });
        } finally {
          setIsLoading(false);
        }
      }, 10);
    },
    [password, twoFactorCode, deviceInfo, onSuccessUnlock, onClose]
  );

  const handleEnrollDevice = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!enrollPin.trim()) {
        setEnrollError("يرجى إدخال رمز التفويض السيادي.");
        return;
      }

      setIsEnrolling(true);
      setEnrollError(null);

      setTimeout(async () => {
        try {
          const result = await AdminPortalSecurityService.enrollDeviceWithPin(
            enrollPin,
            enrollDeviceName.trim()
          );

          startTransition(() => {
            if (result.success) {
              setEnrollSuccess("✓ تم تسجيل وتفويض هذا الجهاز بنجاح! يمكنك الآن إدخال كلمة المرور.");
              setShowEnrollForm(false);
              setEnrollPin("");
              checkInitialSecurityState();
            } else {
              setEnrollError(result.errorMsg || "رمز التفويض غير صحيح.");
            }
          });
        } catch (err: any) {
          startTransition(() => {
            setEnrollError(err.message || "فشل تفويض الجهاز.");
          });
        } finally {
          setIsEnrolling(false);
        }
      }, 10);
    },
    [enrollPin, enrollDeviceName, checkInitialSecurityState]
  );

  if (!isOpen) return null;

  if (showSaaSOnboarding) {
    return (
      <div className="fixed inset-0 z-[110] bg-[#030712] overflow-y-auto">
        <SaaSRegistrationPortal
          onCancel={() => {
            setShowSaaSOnboarding(false);
            setStoredTenants(getStored200Tenants());
          }}
          onRegistrationSuccess={() => {
            soundService.playSound("SUCCESS_CHIME");
            setStoredTenants(getStored200Tenants());
            setShowSaaSOnboarding(false);
          }}
        />
      </div>
    );
  }

  return (
    <div
      id="secret-admin-gateway-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#030712]/90 backdrop-blur-xl animate-fadeIn select-none overflow-y-auto"
      dir="rtl"
      style={{ fontFamily: "'Noto Naskh Arabic', 'Amiri', 'Droid Arabic Naskh', 'Traditional Arabic', 'Alexandria', sans-serif" }}
    >
      <div className={`relative w-full ${activeGatewayTab === "ADVANCED_SEARCH" ? "max-w-4xl max-h-[92vh] flex flex-col my-auto" : "max-w-xl my-auto"} bg-gradient-to-b from-[#0f172a] via-[#0b1329] to-[#030712] border border-blue-500/40 rounded-[2rem] shadow-2xl shadow-blue-950/90 p-5 sm:p-8 text-white overflow-hidden transition-all`}>
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Decorative Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-sm hover:scale-105 z-20"
          title="إغلاق والعودة للنظام الرئيسي"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2 mb-5">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-2xl blur-md opacity-40 animate-pulse" />
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-blue-400/40 flex items-center justify-center shadow-xl">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>بوابة الإدارة العليا والمصمم المالك (الأستاذ بدر عايض محمد) 👑</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex flex-wrap items-center justify-center gap-1.5">
              <span>بوابة الإدارة السيادية</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 font-mono font-black">MeDo ERP</span>
            </h2>
          </div>
        </div>

        {/* TAB SWITCHER: 🔐 المصادقة والتحقق • 🔍 شريط البحث المتقدم عن المنشآت */}
        <div className="flex items-center justify-center gap-2 p-1 bg-slate-900/90 border border-blue-500/30 rounded-2xl mb-5 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveGatewayTab("AUTH")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeGatewayTab === "AUTH"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-blue-400/40 font-black"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-300" />
            <span>🔐 المصادقة والتحقق السيادي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveGatewayTab("ADVANCED_SEARCH")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeGatewayTab === "ADVANCED_SEARCH"
                ? "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-slate-950 font-black shadow-md border border-amber-300"
                : "text-amber-300 hover:bg-amber-950/40"
            }`}
          >
            <Search className="w-4 h-4 text-amber-300" />
            <span>🔍 شريط البحث المتقدم في المنشآت (200+)</span>
          </button>
        </div>

        {/* TAB 1: ADVANCED TENANT SEARCH BAR & STATUS FILTERS */}
        {activeGatewayTab === "ADVANCED_SEARCH" && (
          <div className="flex-1 flex flex-col space-y-4 overflow-hidden animate-fadeIn">
            {/* ADVANCED SEARCH INPUT FIELD */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-amber-400" />
                  <span>شريط البحث المتقدم عن المنشآت (اسم، سجل تجاري، أو Tenant ID):</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  فهرس 200+ منشأة مفعل
                </span>
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={tenantSearchQuery}
                    onChange={(e) => setTenantSearchQuery(e.target.value)}
                    placeholder="ابحث باسم المنشأة، السجل التجاري (CR)، المعرف (Tenant ID)، أو بريد المشرف..."
                    className="w-full py-3.5 pr-11 pl-10 rounded-2xl bg-[#030712] border border-amber-500/50 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder-slate-500"
                    autoFocus
                  />
                  <Search className="w-5 h-5 text-amber-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {tenantSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTenantSearchQuery("")}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowSaaSOnboarding(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 border border-emerald-400/50 text-xs sm:text-sm transition-all whitespace-nowrap"
                  title="تسجيل منشأة جديدة في النظام فورا"
                >
                  <Building className="w-4 h-4 text-emerald-200" />
                  <span>تسجيل منشأة جديدة 🏢</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsUniversalSearchOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/30 hover:bg-amber-500/30 text-[#d4af37] border border-[#d4af37]/60 transition-all cursor-pointer shadow-md active:scale-95 text-xs sm:text-sm whitespace-nowrap font-bold"
                  title="البحث الذكي في الدليل المتكامل للشركات والموظفين"
                >
                  <Search className="w-4 h-4 text-[#d4af37]" />
                  <span>دليل البحث الشامل 🔍</span>
                </button>
              </div>
            </div>

            {/* STATUS FILTERS BAR (الكل | نشطة | تجريبية | مدفوعة) */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-400" />
                <span>تصفية حسب الحالة:</span>
              </span>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                    statusFilter === "ALL"
                      ? "bg-blue-600 text-white shadow-md font-black"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  الكل ({storedTenants.length})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("ACTIVE")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs flex items-center gap-1 ${
                    statusFilter === "ACTIVE"
                      ? "bg-emerald-600 text-white shadow-md font-black"
                      : "bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-500/30"
                  }`}
                >
                  <span>نشطة 🟢</span>
                  <span>({storedTenants.filter((t) => t.status === "ACTIVE").length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("TRIAL")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs flex items-center gap-1 ${
                    statusFilter === "TRIAL"
                      ? "bg-amber-600 text-white shadow-md font-black"
                      : "bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-500/30"
                  }`}
                >
                  <span>تجريبية 🟡</span>
                  <span>({storedTenants.filter((t) => t.status === "TRIAL").length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("PAID")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs flex items-center gap-1 ${
                    statusFilter === "PAID"
                      ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md font-black"
                      : "bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/60 border border-indigo-500/30"
                  }`}
                >
                  <span>مدفوعة / مؤسسية 🔵</span>
                  <span>
                    ({
                      storedTenants.filter(
                        (t) => t.status === "PAID_ENTERPRISE" || (t.status as string) === "PAID"
                      ).length
                    })
                  </span>
                </button>
              </div>
            </div>

            {/* RESULTS COUNT & SUMMARY */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
              <span>
                عرض <strong>{filteredTenants.length}</strong> من أصل <strong>{storedTenants.length}</strong> منشأة مسجلة
              </span>
              {tenantSearchQuery && (
                <span className="text-amber-300 font-bold">
                  نتائج البحث عن: "{tenantSearchQuery}"
                </span>
              )}
            </div>

            {/* SEARCH RESULTS LIST */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[380px] custom-scrollbar">
              {filteredTenants.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                  <Building2 className="w-10 h-10 mx-auto text-slate-500" />
                  <p className="text-sm font-bold text-slate-300">لم يتم العثور على أي منشأة تطابق معايير البحث.</p>
                  <p className="text-xs text-slate-400">تأكد من كتابة الاسم أو رقم السجل التجاري بشكل صحيح، أو قم بإعادة ضبط الفلاتر.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setTenantSearchQuery("");
                      setStatusFilter("ALL");
                    }}
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition"
                  >
                    إعادة ضبط البحث
                  </button>
                </div>
              ) : (
                filteredTenants.map((tenant) => {
                  const companyName = tenant.name || tenant.companyNameAr || "منشأة تجارية";
                  const crNum = tenant.crNumber || tenant.commercialReg || "غير مدخل";
                  const isExpanded = expandedTenantRoles === tenant.id;

                  return (
                    <div
                      key={tenant.id}
                      className="p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl transition-all shadow-md space-y-3"
                    >
                      {/* CARD TOP HEADER */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                              <span>{companyName}</span>
                              {tenant.nameEn && (
                                <span className="text-xs text-slate-400 font-mono">({tenant.nameEn})</span>
                              )}
                            </h4>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-300">
                            <span className="font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 font-bold font-mono">
                              ID: {tenant.id}
                            </span>
                            <span className="text-slate-400">
                              س.ت: <strong className="text-white font-mono">{crNum}</strong>
                            </span>
                            {tenant.city && <span className="text-slate-400">• {tenant.city}</span>}
                          </div>
                        </div>

                        {/* SPARKLINE CHART (اتجاه النشاط الشهري) */}
                        {(() => {
                          const sparkData = getTenantSparklineData(tenant.id);
                          const width = 110;
                          const height = 28;
                          const points = sparkData.map((val, idx) => {
                            const x = (idx / (sparkData.length - 1)) * width;
                            const y = height - 2 - (val / 100) * (height - 4);
                            return { x, y };
                          });
                          const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                          const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
                          const lastP = points[points.length - 1];
                          const trendIsUp = sparkData[sparkData.length - 1] >= sparkData[0];
                          const strokeColor = trendIsUp ? "#10b981" : "#f43f5e";
                          const fillColor = trendIsUp ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.12)";

                          return (
                            <div className="flex flex-col items-center sm:items-end gap-1 px-3 py-1.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                              <span className="text-[9px] text-slate-400 font-bold tracking-wider">النشاط الشهري (آخر 6 أشهر)</span>
                              <div className="flex items-center gap-2.5">
                                <svg width={width} height={height} className="overflow-visible">
                                  <path
                                    d={pathD}
                                    fill="none"
                                    stroke={strokeColor}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d={fillD}
                                    fill={fillColor}
                                    stroke="none"
                                  />
                                  <circle cx={lastP.x} cy={lastP.y} r="2.5" fill={strokeColor} />
                                  <circle cx={lastP.x} cy={lastP.y} r="5.5" fill={strokeColor} opacity="0.3" className="animate-pulse" />
                                </svg>
                                <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${trendIsUp ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20' : 'bg-rose-950/50 text-rose-400 border border-rose-500/20'}`}>
                                  {trendIsUp ? '↑' : '↓'} {sparkData[sparkData.length - 1]}%
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* STATUS BADGE */}
                        <div className="flex items-center">
                          {tenant.status === "ACTIVE" && (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              <span>نشطة 🟢</span>
                            </span>
                          )}
                          {tenant.status === "TRIAL" && (
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                              <span>تجريبية 🟡</span>
                              <span className="text-[11px]">({tenant.trialDaysRemaining || 14} يوم)</span>
                            </span>
                          )}
                          {(tenant.status === "PAID_ENTERPRISE" || (tenant.status as string) === "PAID") && (
                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 text-xs font-black flex items-center gap-1 shadow-sm">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>مدفوعة / مؤسسية 👑</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CARD DETAILS GRID */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-slate-400">البريد الإلكتروني للـ Admin:</span>{" "}
                          <strong className="text-slate-200 font-mono">{tenant.assignedAdminEmail || "admin@medoerp.com"}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">الهاتف:</span>{" "}
                          <strong className="text-slate-200 font-mono">{tenant.phone || tenant.assignedAdminPhone || "0500000000"}</strong>
                        </div>
                        {tenant.unlockCode && (
                          <div className="col-span-1 sm:col-span-2 flex items-center justify-between pt-1 border-t border-slate-800/80">
                            <span className="text-slate-400">رمز فك القفل (Unlock Code):</span>
                            <span className="font-mono text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                              {tenant.unlockCode}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              window.location.search = `?tenant=${tenant.id}`;
                            }}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>دخول المنشأة 🚀</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const masterUrl = `${window.location.origin}/?tenant=${tenant.id}`;
                              handleCopyText(masterUrl, `url-${tenant.id}`);
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedTextId === `url-${tenant.id}` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">تم النسخ!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>نسخ رابط المنشأة</span>
                              </>
                            )}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setExpandedTenantRoles(isExpanded ? null : tenant.id)}
                          className="px-3 py-1.5 bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/40 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>روابط الموظفين (5 أدوار)</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                      </div>

                      {/* EXPANDABLE ROLES DRAWER */}
                      {isExpanded && (
                        <div className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl space-y-2 animate-fadeIn text-xs">
                          <p className="font-bold text-amber-300 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" />
                            <span>الروابط المباشرة لرواد وأدوار منشأة ({companyName}):</span>
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {[
                              { role: "MANAGER", title: "المدير العام", path: `?tenant=${tenant.id}&role=manager` },
                              { role: "ACCOUNTANT", title: "المحاسب المالي", path: `?tenant=${tenant.id}&role=accountant` },
                              { role: "CASHIER", title: "موظف الكاشير", path: `?tenant=${tenant.id}&role=cashier` },
                              { role: "PURCHASER", title: "مسؤول المشتريات", path: `?tenant=${tenant.id}&role=purchaser` },
                              { role: "AUDITOR", title: "المراجع الداخلي", path: `?tenant=${tenant.id}&role=auditor` },
                            ].map((roleItem) => {
                              const fullLink = `${window.location.origin}/${roleItem.path}`;
                              const copyId = `role-${tenant.id}-${roleItem.role}`;

                              return (
                                <div
                                  key={roleItem.role}
                                  className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between gap-2"
                                >
                                  <div>
                                    <span className="font-bold text-slate-200 block">{roleItem.title}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">({roleItem.role})</span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        window.location.href = fullLink;
                                      }}
                                      className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition"
                                      title="دخول بهذا الدور"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyText(fullLink, copyId)}
                                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition"
                                      title="نسخ رابط هذا الدور"
                                    >
                                      {copiedTextId === copyId ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ORIGINAL MASTER AUTHENTICATION GATE */}
        {activeGatewayTab === "AUTH" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Security Status Checklist Card */}
            <div className="bg-[#030712]/70 border border-blue-500/20 rounded-2xl p-4 sm:p-5 space-y-3 text-xs shadow-inner backdrop-blur-md">
              {/* Layer 1: Secret URL */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <KeyRound className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold">الرابط المشفر (Secret Entry Route):</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تم التحقق بنجاح</span>
                </span>
              </div>

              {/* Layer 2: Device Whitelist */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/90">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    {deviceInfo?.deviceType === "MOBILE" ? (
                      <Smartphone className="w-3.5 h-3.5" />
                    ) : (
                      <Laptop className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="font-bold">حالة تفويض الجهاز (Device Whitelist):</span>
                </span>
                {deviceInfo?.isAuthorized ? (
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>مصرح ({deviceInfo.device?.name || "جهاز الإدارة"})</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>جهاز جديد غير مفوض</span>
                  </span>
                )}
              </div>

              {/* Device Fingerprint Details */}
              {deviceInfo && (
                <div className="text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 pt-1 font-mono bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    بصمة الهاردوير: <strong className="text-blue-300">{deviceInfo.fingerprint}</strong>
                  </span>
                  <span className="text-slate-400">{deviceInfo.browserInfo} • {deviceInfo.osInfo}</span>
                </div>
              )}
            </div>

            {/* Enroll Device Form (If Device is not authorized) */}
            {!deviceInfo?.isAuthorized && (
              <div className="p-4 sm:p-5 bg-amber-950/30 border border-amber-500/40 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>تفويض هذا الجهاز بالرمز السيادي (Master PIN)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowEnrollForm(!showEnrollForm)}
                    className="text-xs text-blue-400 hover:text-blue-300 underline font-bold cursor-pointer transition-colors"
                  >
                    {showEnrollForm ? "إغلاق النموذج" : "تفويض الجهاز الآن"}
                  </button>
                </div>

                {showEnrollForm && (
                  <form onSubmit={handleEnrollDevice} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1 font-bold">اسم الجهاز (للتعريف في السجل الأمني):</label>
                      <input
                        type="text"
                        value={enrollDeviceName}
                        onChange={(e) => setEnrollDeviceName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 transition"
                        placeholder="مثال: حاسوب بدر الشخصي"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1 font-bold">رمز التفويض السيادي (Enroll PIN):</label>
                      <input
                        type="password"
                        value={enrollPin}
                        onChange={(e) => setEnrollPin(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500 transition"
                        placeholder="أدخل الرمز السيادي الممنوح للإدارة..."
                      />
                    </div>
                    {enrollError && <p className="text-xs text-rose-400 font-bold bg-rose-950/50 p-2 rounded-lg border border-rose-800">{enrollError}</p>}
                    {enrollSuccess && <p className="text-xs text-emerald-400 font-bold bg-emerald-950/50 p-2 rounded-lg border border-emerald-800">{enrollSuccess}</p>}
                    <button
                      type="submit"
                      disabled={isEnrolling}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isEnrolling ? "جاري التفويض وتحديث السجل..." : "✓ اعتماد وتفويض هذا الجهاز فورياً"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Lockout Warning Banner */}
            {isLockedOut ? (
              <div className="p-6 bg-rose-950/40 border border-rose-600/50 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-200">بوابة الإدارة مقفلة أمنياً</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                    تم استنفاد المحاولات المسموحة (3/3). تم تفعيل القفل الأمني المشدد لمنع الهجمات التخمينية.
                  </p>
                </div>
                {lockoutHours && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-900/40 border border-rose-500/40 rounded-xl text-xs font-mono text-rose-300">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      <span>الوقت المتبقي لفك الحظر: ~{lockoutHours} ساعة</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        AdminPortalSecurityService.resetFailedAttempts();
                        setIsLockedOut(false);
                        setRemainingAttempts(3);
                        setErrorMsg(null);
                      }}
                      className="mt-1 px-4 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                    >
                      🔓 فك القفل الأمني وتصفير المحاولات الآن
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Main Master Password & 2FA Verification Form */
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      <span>1. كلمة مرور الإدارة العليا (Master Password):</span>
                    </label>
                    <span className="text-xs text-blue-400 font-bold bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-500/30 font-mono">
                      المحاولات المتبقية: {remainingAttempts} / 3
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading || isLockedOut}
                      className="w-full py-3 pr-4 pl-12 rounded-2xl bg-[#030712] border border-blue-500/40 text-white font-mono text-sm tracking-wider focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder-slate-600"
                      placeholder="••••••••••••"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Step 2: Mandatory 2FA Authenticator Code */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-blue-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>2. رمز التحقق بخطوتين (Authenticator 2FA - 6 أرقام):</span>
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                      إجباري
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                      disabled={isLoading || isLockedOut}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-blue-500/60 text-emerald-300 font-mono text-center text-xl font-bold tracking-[0.4em] focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder-slate-600"
                      placeholder="------"
                      dir="ltr"
                    />
                  </div>

                  {/* Authenticator live info & instant sync */}
                  <div className="flex items-center justify-between text-[11px] bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      <span>تطبيق Authenticator:</span>
                      <span className="font-mono font-bold text-amber-300 tracking-wider select-all">{activeTotp.code}</span>
                      <span className="text-slate-500">({activeTotp.secondsRemaining} ثانية)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTwoFactorCode(activeTotp.code)}
                      className="text-xs text-blue-400 hover:text-blue-300 underline font-bold cursor-pointer"
                    >
                      إدراج الرمز المباشر
                    </button>
                  </div>
                </div>

                {/* Error and Success Banners */}
                {errorMsg && (
                  <div className="space-y-2 animate-fadeIn">
                    <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-600/70 text-rose-200 text-xs font-bold flex items-center gap-2.5 shadow-md">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-200 text-xs font-medium flex flex-wrap items-center justify-between gap-2 shadow-sm">
                      <span className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>تم توجيه تنبيه أمني فوري إلى بريد الإدارة:</span>
                      </span>
                      <span className="font-mono text-emerald-300 font-bold bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">{MASTER_ADMIN_EMAIL}</span>
                    </div>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-200 text-xs font-bold flex items-center gap-2.5 animate-fadeIn shadow-md">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isLockedOut || !password.trim()}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-600/30 border border-blue-400/40 transition-all active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-white" />
                      <span>جاري التحقق والتشفير المالي...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-blue-200" />
                      <span>دخول لوحة الإدارة العليا (Executive Suite)</span>
                      <ArrowRight className="w-5 h-5 rotate-180" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Security Alert Footer Note */}
            <div className="pt-3 border-t border-slate-800/90 text-center space-y-1 text-xs text-slate-400">
              <p className="flex items-center justify-center gap-1.5 font-normal">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>توثيق دائم لكافة العمليات وإشعار فوري لإيميل الإدارة:</span>
              </p>
              <p className="font-mono text-blue-300 font-bold">{MASTER_ADMIN_EMAIL}</p>
            </div>
          </div>
        )}
      </div>

      {/* Universal Search Modal embedded / triggered inside sovereign gateway */}
      <SapUniversalSearchModal
        isOpen={isUniversalSearchOpen}
        onClose={() => setIsUniversalSearchOpen(false)}
        onSelectCompany={(companyId, companyName) => {
          setIsUniversalSearchOpen(false);
          window.location.search = `?tenant=${companyId}`;
        }}
        onSelectUserDirectLogin={(roleItem) => {
          setIsUniversalSearchOpen(false);
          const targetRole = roleItem.role.toLowerCase();
          window.location.search = `?role=${targetRole}&emp=${encodeURIComponent(roleItem.roleTitleAr || roleItem.name)}`;
        }}
        onSelectTenantManagerLogin={(tenant) => {
          setIsUniversalSearchOpen(false);
          window.location.search = `?tenant=${tenant.id}`;
        }}
      />
    </div>
  );
};

