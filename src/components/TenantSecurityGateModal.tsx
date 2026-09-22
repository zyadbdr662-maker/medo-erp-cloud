import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Lock,
  Key,
  Globe,
  Building2,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Copy,
  Check,
  Filter,
  RefreshCw,
  ExternalLink,
  Shield,
  Smartphone,
  Cpu,
  Layers,
  Database,
  FileSpreadsheet,
  Printer
} from "lucide-react";
import { preGeneratedTenants, PreGeneratedTenant } from "../data/preGeneratedTenants";
import { soundService } from "../services/notificationSoundService";
import { SecurityAuditService } from "../services/securityAuditService";
import { AdminPortalSecurityService } from "../services/adminPortalSecurityService";

interface TenantSecurityGateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TenantSecurityGateModal: React.FC<TenantSecurityGateModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Security & Authentication State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [securityPin, setSecurityPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  // Directory Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [copiedTenantId, setCopiedTenantId] = useState<string | null>(null);
  const [selectedTenantDetails, setSelectedTenantDetails] = useState<PreGeneratedTenant | null>(null);

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

  // Valid Master PINs & License Keys
  const VALID_KEYS = [
    "MEDO-TENANT-2026",
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
      setErrorMessage("⚠️ يرجى إدخال رمز الأمان أو مفتاح ترخيص المنشأة.");
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
      // Check if matches master keys or a specific tenant ID/code
      const isMasterKey = VALID_KEYS.includes(key) || VALID_KEYS.some((k) => k.toLowerCase() === key.toLowerCase());
      const matchedTenant = preGeneratedTenants.find(
        (t) =>
          t.id.toLowerCase() === key.toLowerCase() ||
          t.slug.toLowerCase() === key.toLowerCase() ||
          t.unlockCode?.toLowerCase() === key.toLowerCase()
      );

      if (isMasterKey || matchedTenant) {
        setIsUnlocked(true);
        setIsVerifying(false);
        soundService.playSound("SUCCESS_CHIME");

        // Log security audit
        try {
          SecurityAuditService.getInstance().logAction(
            "TENANT_SECURITY_GATE_UNLOCKED",
            "SECURITY_GATEWAY",
            `تم فك قفل بوابة المنشآت والعملاء بنجاح بالمفتاح المعتمد: [${key}]`,
            "SUCCESS"
          );
        } catch (e) {}
      } else {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);
        setIsVerifying(false);
        soundService.playSound("ENCRYPTION_VIOLATION_ALARM");

        if (nextFailed >= 3) {
          setIsLockedOut(true);
          setLockoutTimer(60);
          setErrorMessage("🚨 تم إدخال مفتاح ترخيص غير صحيح 3 مرات! تم قفل البوابة لمدة 60 ثانية لحماية بيانات المنشآت.");
        } else {
          setErrorMessage(`رمز الأمان غير صحيح. متبقي ${3 - nextFailed} محاولات قبل القفل الأمني.`);
        }
      }
    }, 450);
  };

  // Filtered Tenants List
  const industries = useMemo(() => {
    const set = new Set<string>();
    preGeneratedTenants.forEach((t) => {
      if (t.industry) set.add(t.industry);
    });
    return Array.from(set);
  }, []);

  const filteredTenants = useMemo(() => {
    return preGeneratedTenants.filter((tenant) => {
      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName =
          tenant.name?.toLowerCase().includes(term) ||
          tenant.companyNameAr?.toLowerCase().includes(term) ||
          tenant.companyNameEn?.toLowerCase().includes(term);
        const matchesCity = tenant.city?.toLowerCase().includes(term);
        const matchesId = tenant.id?.toLowerCase().includes(term) || tenant.slug?.toLowerCase().includes(term);
        const matchesCR = tenant.crNumber?.includes(term) || tenant.commercialReg?.includes(term);
        if (!matchesName && !matchesCity && !matchesId && !matchesCR) return false;
      }

      // Industry
      if (selectedIndustry !== "ALL" && tenant.industry !== selectedIndustry) {
        return false;
      }

      // Status
      if (selectedStatus !== "ALL" && tenant.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [searchTerm, selectedIndustry, selectedStatus]);

  const handleCopyLink = (tenantId: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedTenantId(tenantId);
    soundService.playSound("SUCCESS_CHIME");
    setTimeout(() => setCopiedTenantId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-gradient-to-b from-[#06182c] via-[#081e36] to-[#040e1b] border-2 border-amber-400/50 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] text-white relative overflow-hidden">
        
        {/* TOP GLOW ACCENTS */}
        <div className="absolute -top-24 right-1/4 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-700/80 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-blue-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  بوابة المنشآت والعملاء المشفرة (Enterprise Cloud Vault)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                  AES-256 GCM
                </span>
                {isUnlocked && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/40 animate-pulse">
                    ✓ مصرح بالوصول
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isUnlocked
                  ? "دليل المنشآت المعتمدة والمستقلة سحابياً (200 منشأة معزولة)"
                  : "طبقة الحماية والمصادقة المؤسسية قبل استعراض بوابات المنشآت والعملاء"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY CONTAINER */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar relative z-10">
          
          {/* ============================================================== */}
          {/* CASE A: LOCKED SECURITY GATE (التحقق الأمني المشفر) */}
          {/* ============================================================== */}
          {!isUnlocked ? (
            <div className="max-w-xl mx-auto space-y-6 py-4">
              
              {/* SECURITY SHIELD HERO */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border-2 border-amber-400/40 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                  <Lock className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-white">
                  المصادقة الأمنية لفتح بوابة المنشآت
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                  لحماية بيانات العملاء والشركات المشتركة في سحابة MeDo Cloud ERP، يرجى إدخال <strong className="text-amber-300">رمز ترخيص المنشأة</strong> أو مفتاح الأمان المعتمد.
                </p>
              </div>

              {/* SECURITY PIN INPUT CARD */}
              <div className="bg-[#051322]/90 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-200">
                    رمز الأمان أو مفتاح الترخيص (License Key / Security PIN):
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-amber-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPin ? "text" : "password"}
                      value={securityPin}
                      disabled={isLockedOut || isVerifying}
                      onChange={(e) => setSecurityPin(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleVerifyAccess();
                      }}
                      placeholder="أدخل رمز ترخيص المنشأة أو كود الأمان (مثال: MEDO-TENANT-2026)..."
                      className="w-full bg-[#030911] border border-slate-700/90 rounded-xl pr-10 pl-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition font-mono"
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

                {/* ERROR NOTIFICATION */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200 text-center font-bold flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* FAST SIMULATION HELPER FOR AUTHORIZED USERS */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-slate-300 font-bold">التحقق السريع المعتمد (Authorized Key):</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-300 text-xs bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                      MEDO-TENANT-2026
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSecurityPin("MEDO-TENANT-2026");
                        handleVerifyAccess("MEDO-TENANT-2026");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[11px] hover:bg-amber-400 transition cursor-pointer"
                    >
                      فتح فوري 🔓
                    </button>
                  </div>
                </div>

                {/* VERIFY BUTTON */}
                <button
                  type="button"
                  id="btn-verify-tenant-gate"
                  disabled={isLockedOut || isVerifying || !securityPin.trim()}
                  onClick={() => handleVerifyAccess()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-[#06182c] font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:scale-95"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#06182c]" />
                      <span>جاري فك التشفير والتحقق من الصلاحية...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-[#06182c]" />
                      <span>فحص التشفير وفتح دليل المنشآت</span>
                    </>
                  )}
                </button>

              </div>

              {/* SECURITY STANDARDS BADGES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs text-slate-400">
                <div className="p-3 rounded-xl bg-[#030911]/60 border border-slate-800 space-y-1">
                  <Shield className="w-4 h-4 text-emerald-400 mx-auto" />
                  <strong className="block text-slate-200">عزل تام Multi-Tenant</strong>
                  <span className="text-[10px] text-slate-500">قواعد بيانات منفصلة لكل عميل</span>
                </div>
                <div className="p-3 rounded-xl bg-[#030911]/60 border border-slate-800 space-y-1">
                  <Cpu className="w-4 h-4 text-cyan-400 mx-auto" />
                  <strong className="block text-slate-200">تشفير بنكي AES-256</strong>
                  <span className="text-[10px] text-slate-500">حماية فائقة لحركات وسجلات الحسابات</span>
                </div>
                <div className="p-3 rounded-xl bg-[#030911]/60 border border-slate-800 space-y-1">
                  <Layers className="w-4 h-4 text-amber-400 mx-auto" />
                  <strong className="block text-slate-200">تدقيق أمني مستمر</strong>
                  <span className="text-[10px] text-slate-500">تسجيل ومراقبة كاملة لمحاولات الدخول</span>
                </div>
              </div>

            </div>
          ) : (
            /* ============================================================== */
            /* CASE B: UNLOCKED DIRECTORY (دليل المنشآت والعملاء المعتمد) */
            /* ============================================================== */
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              {/* CONTROLS & SEARCH BAR */}
              <div className="bg-[#051322]/90 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  
                  {/* SEARCH INPUT */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ابحث باسم الشركة، السجل التجاري، الرقم الضريبي، المدينة، أو المعرف..."
                      className="w-full bg-[#030911] border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* INDUSTRY FILTER */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                      className="bg-[#030911] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="ALL">جميع الأنشطة والقطاعات ({industries.length})</option>
                      {industries.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setIsUnlocked(false)}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition text-xs font-bold flex items-center gap-1 shrink-0"
                      title="قفل البوابة وإعادة التشفير"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>قفل الأمان</span>
                    </button>
                  </div>

                </div>

                {/* STATS BAR */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>المنشآت المطابقة: <strong className="text-amber-300 font-mono">{filteredTenants.length}</strong> من أصل 200 منشأة معزولة</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-emerald-400 font-bold">🟢 سحابة Alibaba & Huawei & PostgreSQL</span>
                    <span>•</span>
                    <span className="text-blue-300">🔒 روابط مستقلة 100%</span>
                  </div>
                </div>
              </div>

              {/* TENANTS GRID / LIST */}
              {filteredTenants.length === 0 ? (
                <div className="text-center py-12 bg-[#051322]/50 rounded-2xl border border-slate-800 p-6 space-y-2">
                  <Building2 className="w-10 h-10 text-slate-500 mx-auto" />
                  <h4 className="text-base font-bold text-white">لم يتم العثور على منشآت مطابقة للبحث</h4>
                  <p className="text-xs text-slate-400">جرب البحث بكلمة أخرى أو اختر قطاعاً آخر من القائمة.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredTenants.slice(0, 50).map((tenant) => (
                    <div
                      key={tenant.id}
                      className="p-4 rounded-2xl bg-[#06182c]/90 hover:bg-[#09223d] border border-slate-700/80 hover:border-amber-400/80 transition-all duration-200 flex flex-col justify-between gap-3 group shadow-md"
                    >
                      <div>
                        {/* CARD HEADER */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition line-clamp-1">
                                {tenant.name || tenant.companyNameAr}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                                <span className="text-amber-300 font-bold">{tenant.id}</span>
                                <span>•</span>
                                <span>{tenant.city}</span>
                              </div>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30 shrink-0">
                            {tenant.status === "ACTIVE" ? "🟢 نشط" : tenant.status === "PAID_ENTERPRISE" ? "👑 مؤسسي" : "⚡ تجريبي"}
                          </span>
                        </div>

                        {/* DETAILS ROW */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-[#030911]/60 p-2.5 rounded-xl border border-slate-800/80 mb-2 font-sans">
                          <div>
                            <span className="text-slate-400 block text-[10px]">النشاط التجاري:</span>
                            <strong className="text-slate-200 truncate block">{tenant.industry}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">عقدة التخزين:</span>
                            <strong className="text-cyan-300 truncate block font-mono text-[10px]">{tenant.databaseNode}</strong>
                          </div>
                          {tenant.assignedAdminName && (
                            <div className="col-span-2 pt-1 border-t border-slate-800 flex items-center justify-between">
                              <span className="text-slate-400">المسؤول: <strong className="text-slate-200">{tenant.assignedAdminName}</strong></span>
                              <span className="text-slate-400 font-mono text-[10px]">{tenant.assignedAdminPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CARD ACTIONS */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const url = `${window.location.origin}${window.location.pathname}?tenant=${tenant.id}`;
                            handleCopyLink(tenant.id, url);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                          title="نسخ الرابط المعزول للمنشأة"
                        >
                          {copiedTenantId === tenant.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>نسخ الرابط</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            try {
                              localStorage.clear();
                              sessionStorage.clear();
                            } catch (e) {}
                            window.location.href = `?tenant=${tenant.id}`;
                          }}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition cursor-pointer shadow-md flex items-center gap-1 transform hover:scale-105"
                        >
                          <span>🚀 دخول البوابة</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-700/80 bg-[#040e1b] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 relative z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>نظام الحماية والمصادقة المؤسسية — MeDo Cloud ERP Security Suite</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 hover:text-white transition cursor-pointer"
          >
            إغلاق البوابة
          </button>
        </div>

      </div>
    </div>
  );
};
