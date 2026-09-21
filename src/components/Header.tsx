import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Search,
  Bell,
  RefreshCw,
  Download,
  Upload,
  Calendar,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  User,
  HelpCircle,
  Contrast,
  Palette,
  Sun,
  Moon,
  LogOut,
  GitBranch,
  ShieldCheck,
  Wifi,
  WifiOff,
  Mic,
  Boxes,
  Network,
  Lock,
  BookMarked,
  Cloud,
  Building2,
  DatabaseBackup,
  Rocket,
  Zap,
} from "lucide-react";
import { CurrencyCode, CurrencyInfo, ERPUser, CalendarType } from "../types/erp";
import { LocalSyncEngine } from "../services/localSyncEngine";
import { IS_ADMIN_ENV } from "../config/env";
import { SecurityAuditService, SystemAlert } from "../services/securityAuditService";
import { useCalendar } from "../utils/calendarUtils";
import { PWAInstallButton } from "./PWAInstallButton";
import { SyncStatusIndicator } from "./SyncStatusIndicator";
import { NavTab } from "./Sidebar";
import { TenantIsolationService } from "../services/tenantIsolationService";
import { AnalogClock } from "./AnalogClock";

interface HeaderProps {
  currencies: CurrencyInfo[];
  selectedCurrency: CurrencyCode;
  setSelectedCurrency: (c: CurrencyCode) => void;
  currentUser: ERPUser;
  setCurrentUser: (u: ERPUser) => void;
  onOpenAi: () => void;
  onOpenVoiceSearch?: () => void;
  onOpenGlobalSearch?: (initialQ?: string) => void;
  onOpenQuickAction: (actionType: "JOURNAL" | "RECEIPT" | "PAYMENT" | "INVOICE") => void;
  onExportData: () => void;
  onImportData: () => void;
  onResetData: () => void;
  setActiveTab: (tab: NavTab) => void;
  unbalancedJournalsCount: number;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onLogout?: () => void;
  onOpenOnboarding?: () => void;
  onOpenSystemUpdate?: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  isAdminUnlocked?: boolean;
  onOpenAdminGateway?: () => void;
  onLockAdmin?: () => void;
  onOpenTrialManager?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currencies,
  selectedCurrency,
  setSelectedCurrency,
  currentUser,
  onOpenAi,
  onOpenVoiceSearch,
  onOpenGlobalSearch,
  onOpenQuickAction,
  onExportData,
  onImportData,
  onResetData,
  setActiveTab,
  unbalancedJournalsCount,
  highContrast,
  onToggleHighContrast,
  isDarkMode = true,
  onToggleDarkMode,
  onLogout,
  onOpenOnboarding,
  onOpenSystemUpdate,
  onRefreshData,
  isRefreshing,
  isAdminUnlocked,
  onOpenAdminGateway,
  onLockAdmin,
  onOpenTrialManager,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync Engine status for header
  const [syncStatus, setSyncStatus] = useState(() => {
    const engine = LocalSyncEngine.getInstance();
    return {
      networkMode: engine.getNetworkMode(),
      pendingCount: engine.getPendingCount(),
    };
  });

  // Security Alerts state
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>(() =>
    SecurityAuditService.getInstance().getSystemAlerts()
  );
  const [activeBannerAlert, setActiveBannerAlert] = useState<SystemAlert | null>(null);

  useEffect(() => {
    const engine = LocalSyncEngine.getInstance();
    const unsubscribeSync = engine.subscribe(() => {
      setSyncStatus({
        networkMode: engine.getNetworkMode(),
        pendingCount: engine.getPendingCount(),
      });
    });

    const auditService = SecurityAuditService.getInstance();
    const unsubscribeAudit = auditService.subscribe(() => {
      setSystemAlerts(auditService.getSystemAlerts());
    });

    const handleAlertEvent = (e: any) => {
      if (e.detail) {
        setActiveBannerAlert(e.detail);
        setSystemAlerts(auditService.getSystemAlerts());
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("medo_system_alert_triggered", handleAlertEvent);
    }

    return () => {
      unsubscribeSync();
      unsubscribeAudit();
      if (typeof window !== "undefined") {
        window.removeEventListener("medo_system_alert_triggered", handleAlertEvent);
      }
    };
  }, []);

  const { calendarType, setCalendarType, toggleCalendar, todayFormatted, todayGregorian, todayHijri } = useCalendar();

  const sanaaRate = currencies.find((c) => c.code === "YER_SANAA")?.exchangeRateToUSD || 530;
  const adenRate = currencies.find((c) => c.code === "YER_ADEN")?.exchangeRateToUSD || 1920;
  const sarRate = currencies.find((c) => c.code === "SAR")?.exchangeRateToUSD || 3.75;

  return (
    <>
      {/* Instant Floating Security Alert Banner */}
      {activeBannerAlert && (
        <div className="bg-rose-950 border-b border-rose-500/60 px-4 py-2 text-rose-200 text-xs font-bold flex items-center justify-between gap-3 shadow-xl animate-bounce">
          <div className="flex items-center gap-2">
            <span className="text-base">🚨</span>
            <div>
              <span className="font-extrabold text-white">{activeBannerAlert.title}: </span>
              <span className="text-rose-200 font-normal">{activeBannerAlert.message}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveBannerAlert(null);
                setActiveTab("SYSTEM_SETTINGS" as any);
              }}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition cursor-pointer"
            >
              عرض سجل الأمان
            </button>
            <button
              onClick={() => setActiveBannerAlert(null)}
              className="px-2 py-1 rounded bg-rose-900/60 text-rose-300 hover:text-white text-[11px] transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      <header className="hidden lg:block sticky top-0 z-30 bg-[#0B192C] backdrop-blur-md border-b border-[#1E3A8A]/50 px-4 py-2.5 shadow-md">
      <div className="flex items-center justify-between gap-4">
        {/* Left/Start side (in RTL: right side): Company Logo, Search & Multi-Currency Ticker */}
        <div className="flex items-center gap-3 flex-1 max-w-4xl">
          {/* Company Brand & Logo Badge */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-700/60 rtl:border-l rtl:border-r-0 rtl:pl-3 rtl:pr-0 shrink-0">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B192C] via-[#1E3A8A] to-[#0A192F] border border-blue-400/50 shadow-md shadow-blue-950/40 text-blue-200">
              <div className="flex flex-col items-center justify-center leading-none">
                <span className="text-[10px] font-black tracking-tighter text-white">SAP</span>
                <span className="text-[6.5px] font-bold text-amber-200/90 tracking-widest">MeDO</span>
              </div>
            </div>
            <div className="flex flex-col max-w-[220px] sm:max-w-xs md:max-w-sm truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-100 tracking-tight truncate" title={TenantIsolationService.getActiveTenantDetails()?.nameAr}>
                  {TenantIsolationService.getActiveTenantDetails()?.nameAr || "نظام SAP/MeDO ERP"}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30 shrink-0">
                  {currentUser?.role === "CASHIER" ? "مبيعات" : currentUser?.role === "DATA_ENTRY" ? "مشتريات" : currentUser?.role === "AUDITOR" ? "تدقيق" : "S/4HANA"}
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-300 truncate">منظومة الإدارة السحابية والفوترة الإلكترونية</span>
            </div>
          </div>

          {/* Quick Search & Voice Search */}
          <div className="flex items-center gap-2">
            <div 
              onClick={() => onOpenGlobalSearch?.(searchQuery)}
              className="relative w-72 hidden md:flex items-center cursor-pointer group"
            >
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="بحث ذكي شامل (فواتير، قيود، عملاء...)"
                value={searchQuery}
                onFocus={() => onOpenGlobalSearch?.(searchQuery)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onOpenGlobalSearch?.(e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-12 py-1.5 text-xs text-slate-200 placeholder-slate-400 group-hover:border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
              />
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 bg-slate-900 border border-slate-700/80 rounded group-hover:border-emerald-500/40 group-hover:text-emerald-300 transition-colors">
                  ⌘K
                </kbd>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenVoiceSearch}
              title="البحث الصوتي بالذكاء المالي المتقدم"
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span className="hidden xl:inline">بحث صوتي ذكي</span>
            </button>
          </div>

          {/* Live Currency Ticker (Yemen / GCC Rates) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>أسعار الصرف:</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 divide-x divide-slate-800 rtl:divide-x-reverse">
              <div className="flex items-center gap-1">
                <span className="text-slate-400">صنعاء:</span>
                <span className="font-mono text-emerald-300 font-bold">${(1).toFixed(0)} = {sanaaRate} ر.ي</span>
              </div>
              <div className="flex items-center gap-1 pr-3 rtl:pr-0 rtl:pl-3">
                <span className="text-slate-400">عدن:</span>
                <span className="font-mono text-amber-300 font-bold">${(1).toFixed(0)} = {adenRate} ر.ي</span>
              </div>
              <div className="flex items-center gap-1 pr-3 rtl:pr-0 rtl:pl-3">
                <span className="text-slate-400">سعودي/صنعاء:</span>
                <span className="font-mono text-cyan-300 font-bold">1 ر.س = {(sanaaRate / sarRate).toFixed(1)} ر.ي</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Actions: Currency View Switcher, Calendar Switcher & AI Button */}
        <div className="flex items-center gap-2.5">
          {/* Display Currency Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-400 px-2 font-medium hidden sm:inline">العملة:</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
              aria-label="عملة العرض"
              className="bg-slate-900 text-slate-200 text-xs rounded-lg px-2.5 py-1 font-semibold border-0 focus:ring-1 focus:ring-emerald-500 cursor-pointer outline-none"
            >
              <option value="YER_SANAA">ريال يمني (صنعاء)</option>
              <option value="YER_ADEN">ريال يمني (عدن)</option>
              <option value="SAR">ريال سعودي (SAR)</option>
              <option value="USD">دولار أمريكي (USD)</option>
              <option value="EUR">يورو (EUR)</option>
            </select>
          </div>

          {/* Calendar Type Switcher (تبديل التقويم: ميلادي / هجري / مزدوج) & Live Analog Clock */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 px-1.5 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={toggleCalendar}
              title={`اضغط للتبديل السريع | التاريخ اليوم: ${todayFormatted}`}
              className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-emerald-400 px-1.5 font-medium transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">التقويم:</span>
            </button>
            <select
              value={calendarType}
              onChange={(e) => setCalendarType(e.target.value as CalendarType)}
              aria-label="نوع التقويم المحاسبي"
              title={`التاريخ الحالي: ${todayFormatted}`}
              className="bg-slate-900 text-slate-200 text-xs rounded-lg px-2 py-1 font-semibold border-0 focus:ring-1 focus:ring-emerald-500 cursor-pointer outline-none"
            >
              <option value="GREGORIAN">☀️ ميلادي</option>
              <option value="HIJRI">🌙 هجري</option>
              <option value="DUAL">🌓 مزدوج (م/هـ)</option>
            </select>

            {/* Sovereign Enterprise Analog Clock */}
            <div className="border-r border-slate-800 pr-2 rtl:border-r-0 rtl:border-l rtl:pr-0 rtl:pl-2 flex items-center gap-1.5">
              <AnalogClock size={32} showSeconds={true} />
            </div>
          </div>

          {/* Universal Search Button (محرك البحث الشامل عن المنشآت والأسماء) */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open_universal_search"))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-950/40 border border-amber-300 active:scale-95 cursor-pointer"
            title="محرك البحث الشامل عن جميع المنشآت والشركات والموظفين والأسماء والمسؤولين (200+ منشأة ومستخدم)"
            aria-label="محرك البحث الشامل"
          >
            <Search className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden sm:inline">🔍 البحث الشامل (200+)</span>
          </button>

          {/* Golden Instant Deploy Button (🚀 نشر فوري) */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open_instant_deploy"))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-amber-400 to-[#d4af37] hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] border border-yellow-200 active:scale-95 cursor-pointer"
            title="نشر فوري: حفظ التعديلات، المزامنة مع GitHub، وإطلاق Auto-Deploy على Vercel لتحديث الرابط الرسمي"
            aria-label="نشر فوري"
          >
            <Rocket className="w-4 h-4 text-slate-950" />
            <span className="font-black tracking-wide">🚀 نشر فوري</span>
          </button>

          {/* Encrypted Cloud Security Direct Button (المنصة السحابية المشفرة) */}
          {IS_ADMIN_ENV && (
            <button
              type="button"
              onClick={() => setActiveTab("EXECUTIVE_MASTER_SUITE")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-950 via-[#0B192C] to-indigo-950 hover:from-blue-900 hover:to-indigo-900 text-blue-200 hover:text-white border border-blue-400/40 hover:border-blue-400 text-xs font-bold transition-all shadow-md shadow-blue-950/50 active:scale-95 group cursor-pointer"
              title="المنصة السحابية المشفرة ومركز الأمان السيادي (AES-256-GCM / Firewall / WebAuthn)"
              aria-label="المنصة السحابية المشفرة"
            >
              <div className="w-5 h-5 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-slate-950 transition-all flex-shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300 group-hover:text-slate-950" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight hidden sm:inline">المنصة السحابية المشفرة</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-200 border border-blue-400/40 font-mono tracking-tighter">
                  AES-256
                </span>
              </div>
            </button>
          )}

          {/* Sovereign Rejuvenation Button (⚡ إنعاش سيادي) */}
          {IS_ADMIN_ENV && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open_sovereign_rejuvenation"))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] border border-yellow-200 active:scale-95 cursor-pointer"
              title="إنعاش وتطهير سيادي سحابي فائق: تفريغ الذاكرة وتخفيف النظام ومزامنة السحابة (60 FPS)"
              aria-label="إنعاش سيادي فائق"
            >
              <Zap className="w-3.5 h-3.5 text-slate-950 fill-slate-950 animate-pulse" />
              <span className="font-black tracking-wide hidden md:inline">⚡ إنعاش سيادي</span>
            </button>
          )}

          {/* Self-Service Enterprise Registration Button (تسجيل منشأة جديدة) */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open_self_registration"))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/60 text-xs font-black transition-all shadow-md shadow-emerald-950/40 active:scale-95 cursor-pointer"
            title="تسجيل منشأة جديدة واستلام روابط الوصول المباشرة"
            aria-label="تسجيل منشأة جديدة"
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-200" />
            <span className="hidden md:inline">+ تسجيل منشأة جديدة</span>
          </button>

          {/* Cloud SaaS Platform & License Management (المنصة السحابية وإدارة التراخيص) */}
          <button
            type="button"
            onClick={() => setActiveTab("SAAS_PLATFORM")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-950 via-[#0C2A4A] to-blue-950 hover:from-sky-900 hover:to-blue-900 text-sky-200 hover:text-white border border-sky-400/50 hover:border-sky-300 text-xs font-bold transition-all shadow-md shadow-sky-950/50 active:scale-95 group cursor-pointer"
            title="المنصة السحابية وإدارة التراخيص والموزعين (Cloud SaaS & License Center)"
            aria-label="المنصة السحابية SaaS"
          >
            <div className="w-5 h-5 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all flex-shrink-0">
              <Cloud className="w-3.5 h-3.5 text-sky-300 group-hover:text-slate-950" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight hidden sm:inline">المنصة السحابية</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/30 text-sky-200 border border-sky-400/40 font-mono font-bold tracking-tighter">
                SaaS
              </span>
            </div>
          </button>

          {/* Direct & Permanent Access Button for Integrated ERP Suite (المنظومة المحاسبية والإدارية المتكاملة) */}
          <button
            type="button"
            onClick={() => setActiveTab("INTEGRATED_ERP")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0A2540] via-[#163863] to-[#0A2540] hover:from-[#163863] hover:to-[#20497E] text-amber-300 hover:text-amber-200 border border-sap-secondary/50 hover:border-sap-secondary text-xs font-bold transition-all shadow-md shadow-[#0A2540]/50 active:scale-95 group cursor-pointer"
            title="المنظومة المحاسبية والإدارية المتكاملة (S/4HANA Enterprise Suite) - الركائز الست، الدورة المستندية، ومختبر العمليات"
            aria-label="المنظومة المحاسبية والإدارية المتكاملة"
          >
            <div className="w-5 h-5 rounded-lg bg-sap-secondary/20 border border-sap-secondary/40 flex items-center justify-center text-sap-secondary group-hover:scale-110 group-hover:bg-sap-secondary group-hover:text-slate-950 transition-all flex-shrink-0">
              <Boxes className="w-3.5 h-3.5 text-sap-secondary group-hover:text-slate-950" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight hidden sm:inline">المنظومة المتكاملة</span>
              <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-sap-secondary text-slate-950 font-black tracking-tighter shadow-sm">
                ERP Suite
              </span>
            </div>
          </button>

          {/* SAP Onboarding Tour Button */}
          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sap-primary to-[#14532D] hover:from-[#14532D] hover:to-[#0A2E1A] text-white text-xs font-bold transition-all border border-sap-secondary/50 shadow-md shadow-emerald-950/20 active:scale-95 cursor-pointer"
              title="جولة تعريفية تفاعلية وسيناريوهات محاسبية جاهزة بنمط SAP"
            >
              <Sparkles className="w-3.5 h-3.5 text-sap-secondary" />
              <span className="hidden md:inline text-[11.5px]">جولة SAP</span>
            </button>
          )}

          {/* Global Refresh Button (زر تحديث ومزامنة الوحدات المحاسبية) */}
          {onRefreshData && (
            <button
              type="button"
              onClick={onRefreshData}
              disabled={isRefreshing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 hover:text-white border border-emerald-600/50 text-xs font-bold transition-all shadow-md shadow-emerald-950/50 active:scale-95 cursor-pointer ${
                isRefreshing ? "opacity-70 cursor-wait" : ""
              }`}
              title="تحديث ومزامنة كافة الوحدات المحاسبية، إعادة حساب الأرصدة، وحل أي تعليقات أو تباطؤ في النظام"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden xl:inline">{isRefreshing ? "جاري التحديث..." : "تحديث الوحدات"}</span>
            </button>
          )}

          {/* Quick Create Transaction Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <span className="text-base font-black leading-none">+</span>
              <span>معاملة جديدة</span>
            </button>

            {showQuickMenu && (
              <div
                className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 text-right"
                onClick={() => setShowQuickMenu(false)}
              >
                <button
                  onClick={() => onOpenQuickAction("JOURNAL")}
                  className="w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-200 font-medium flex items-center justify-between"
                >
                  <span>قيد يومية جديد</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">JV</span>
                </button>
                <button
                  onClick={() => onOpenQuickAction("RECEIPT")}
                  className="w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-200 font-medium flex items-center justify-between"
                >
                  <span>سند قبض نقد/بنك</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">RV</span>
                </button>
                <button
                  onClick={() => onOpenQuickAction("PAYMENT")}
                  className="w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-200 font-medium flex items-center justify-between"
                >
                  <span>سند صرف نقد/بنك</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">PV</span>
                </button>
                <button
                  onClick={() => onOpenQuickAction("INVOICE")}
                  className="w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-200 font-medium flex items-center justify-between"
                >
                  <span>فاتورة مبيعات جديدة</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">INV</span>
                </button>
              </div>
            )}
          </div>

          {/* High Contrast Toggle Button (زر التباين العالي) */}
          <button
            onClick={onToggleHighContrast}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
              highContrast
                ? "bg-yellow-400 text-black border-yellow-300 shadow-md shadow-yellow-400/30"
                : "bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white"
            }`}
            title={highContrast ? "تعطيل وضع التباين العالي" : "تفعيل وضع التباين العالي (High Contrast Mode)"}
            aria-label="تبديل وضع التباين العالي"
            aria-pressed={highContrast}
          >
            <Contrast className={`w-3.5 h-3.5 ${highContrast ? "text-black" : "text-amber-400"}`} />
            <span className="hidden md:inline">
              {highContrast ? "تباين عالي: مفعّل" : "التباين العالي"}
            </span>
          </button>

          {/* Light/Dark Mode Toggle Switch (مفتاح التحويل بين الوضع المضيء والمظلم) */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                isDarkMode
                  ? "bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white"
                  : "bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900 shadow-sm"
              }`}
              title={isDarkMode ? "التحويل للوضع المضيء (Light Mode)" : "التحويل للوضع المظلم (Dark Mode)"}
              aria-label="مفتاح تبديل الوضع المضيء/المظلم"
              aria-pressed={!isDarkMode}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="hidden md:inline">الوضع المضيء</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden md:inline">الوضع المظلم</span>
                </>
              )}
            </button>
          )}

          {/* Theme Studio Trigger */}
          <button
            onClick={() => setActiveTab("THEME_STUDIO")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all active:scale-95"
            title="فتح محرر الثيمات والسمات (Theme & Style Studio)"
          >
            <Palette className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">الثيمات والسمات</span>
          </button>

          {/* Automatic Cloud Sync & Offline Status Indicator */}
          <SyncStatusIndicator onNavigateToSync={() => setActiveTab("CLOUD_SYNC")} />

          {/* System Refresh Trigger (زر إنعاش النظام) */}
          {onRefreshData && (
            <button
              id="top-system-refresh-btn"
              type="button"
              onClick={onRefreshData}
              disabled={isRefreshing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer select-none ${
                isRefreshing
                  ? "bg-emerald-950/90 border-emerald-500/70 text-emerald-200 opacity-90 cursor-wait shadow-emerald-950/40"
                  : "bg-slate-950 hover:bg-emerald-950/60 border-slate-800 hover:border-emerald-600/50 text-slate-300 hover:text-emerald-300 shadow-slate-950/40"
              }`}
              title="إنعاش النظام: إعادة قراءة البيانات، احتساب القيود المحاسبية، وتحديث أرصدة الحسابات والمستودعات فورياً"
              aria-label="إنعاش النظام"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-emerald-400 ${
                  isRefreshing ? "animate-spin text-emerald-300" : ""
                }`}
              />
              <span className="text-[11.5px] font-bold">
                {isRefreshing ? "جاري الإنعاش..." : "إنعاش النظام"}
              </span>
            </button>
          )}

          {/* PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* System Update Trigger */}
          {onOpenSystemUpdate && (
            <button
              onClick={onOpenSystemUpdate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sap-primary/25 hover:bg-sap-primary/45 border border-sap-secondary/50 text-sap-secondary text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
              title="مركز تحديث وترقية النظام v2026.9.2 (SAP Update Hub)"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sap-secondary" />
              <span className="hidden lg:inline text-[11.5px]">تحديث النظام</span>
              <span className="px-1.5 py-0.2 rounded-full bg-sap-primary text-[10px] font-mono text-emerald-300 font-bold border border-sap-secondary/40">
                v2026.9
              </span>
            </button>
          )}

          {/* SAP Onboarding Guide Trigger */}
          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sap-primary/20 hover:bg-sap-primary/40 border border-sap-secondary/50 text-sap-secondary text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
              title="الجولة التعريفية ودليل الاستخدام SAP Business One"
            >
              <HelpCircle className="w-4 h-4 text-sap-secondary" />
              <span className="hidden xl:inline">الجولة التعريفية</span>
            </button>
          )}

          {/* Accounting User Manual Trigger */}
          <button
            onClick={() => setActiveTab("USER_MANUAL")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
            title="دليل الاستخدام والتشغيل المحاسبي الشامل"
          >
            <BookMarked className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline">دليل الاستخدام المحاسبي</span>
          </button>

          {/* AI Copilot Trigger */}
          <button
            onClick={onOpenAi}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 animate-pulse"
            title="فتح المستشار المالي والتدقيق الذكي"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span className="hidden sm:inline">MeDo AI</span>
          </button>

          {/* Notifications / Audit Alerts */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              title="التنبيهات والتدقيق المحاسبي"
            >
              <Bell className="w-4 h-4" />
              {unbalancedJournalsCount > 0 ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {unbalancedJournalsCount}
                </span>
              ) : (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>

            {showNotifications && (
              <div
                className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 text-right animate-in fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <span className="text-xs font-bold text-white">مركز التدقيق والتنبيهات</span>
                  <span className="text-[10px] text-emerald-400 font-mono">نظام المراقبة IFRS</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-emerald-300">ميزان المراجعة متوازن 100%</div>
                      <div className="text-[11px] text-emerald-400/80">إجمالي المدين يساوي إجمالي الدائن في كافة الحسابات.</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-amber-300">تنبيه فروق صرف ومخزون الفروع</div>
                      <div className="text-[11px] text-amber-400/80">يوجد تباين بين أسعار صرف صنعاء وعدن وتنبيهات بمخزون المستودعات بالفروع.</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setActiveTab("COLLABORATION");
                    }}
                    className="flex-1 py-1.5 text-center text-[11px] text-amber-400 hover:text-amber-300 bg-amber-950/50 rounded-lg border border-amber-800 transition-colors font-bold"
                  >
                    مركز الموافقات والوارد
                  </button>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setActiveTab("BRANCH_MANAGEMENT");
                    }}
                    className="flex-1 py-1.5 text-center text-[11px] text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 rounded-lg border border-emerald-800 transition-colors font-semibold"
                  >
                    تنبيهات الفروع
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Backup & Demo Controls */}
          <div className="hidden sm:flex items-center gap-1 border-r border-slate-800 pr-2 rtl:border-r-0 rtl:border-l rtl:pr-0 rtl:pl-2">
            {/* Top Bar Sovereign Admin Button */}
            {isAdminUnlocked ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-md animate-fadeIn">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="hidden xl:inline">الإدارة العليا نشطة</span>
                {onLockAdmin && (
                  <button
                    onClick={onLockAdmin}
                    className="px-2 py-0.5 rounded-lg bg-rose-900 hover:bg-rose-800 text-rose-200 text-[11px] font-bold border border-rose-500/40 transition-colors cursor-pointer"
                    title="قفل فوري لإخفاء الإدارة"
                  >
                    قفل 🔒
                  </button>
                )}
              </div>
            ) : (
              onOpenAdminGateway && (
                <button
                  onClick={onOpenAdminGateway}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-blue-200 border border-blue-400/50 shadow text-xs font-bold transition-all cursor-pointer"
                  title="فتح بوابة الإدارة العليا السيادية (بدر عايض زياد)"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xl:inline">بوابة الإدارة العليا 🔐</span>
                </button>
              )
            )}

            {onOpenTrialManager && (
              <button
                onClick={onOpenTrialManager}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/25 to-amber-500/15 hover:from-amber-600/40 hover:to-amber-500/30 text-amber-300 border border-amber-500/40 shadow text-xs font-bold transition-all cursor-pointer"
                title="لوحة رقابة ومتابعة النسخ التجريبية للعملاء الثلاثة"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="hidden md:inline">رقابة النسخ التجريبية 🎯</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 mr-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 hover:border-rose-500 transition-all font-bold text-xs"
                title="تسجيل الخروج والعودة لشاشة الدخول"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">تسجيل الخروج</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab("SCHEDULED_BACKUP")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 hover:border-blue-500 transition-all font-bold text-[11px]"
              title="إدارة النسخ الاحتياطي السحابي"
            >
              <DatabaseBackup className="w-4 h-4" />
              <span className="hidden lg:inline">النسخ الاحتياطي</span>
            </button>
            <button
              onClick={onExportData}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="تنزيل نسخة يدوية (JSON)"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onImportData}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="استيراد بيانات محاسبية"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={onResetData}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
              title="إعادة تعيين البيانات الافتراضية"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Mini Badge & Dropdown */}
          <div className="relative flex items-center gap-2.5 pr-2 rtl:pr-0 rtl:pl-2">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700 cursor-pointer"
              title="خيارات الحساب والمستخدم"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
                {currentUser?.avatar || "👤"}
              </div>
              <div className="hidden xl:block text-right">
                <div className="text-xs font-bold text-slate-200 leading-tight">{currentUser?.name || "المستخدم"}</div>
                <div className="text-[10px] text-emerald-400 font-medium">{currentUser?.branch || "الفرع الرئيسي"}</div>
              </div>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute left-0 rtl:left-auto rtl:right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 text-right">
                <div className="flex items-center gap-3 p-2 bg-slate-950 rounded-xl border border-slate-800/80 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 font-black text-sm shadow">
                    {currentUser?.avatar || "👤"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-100 truncate">{currentUser?.name || "المستخدم"}</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">{currentUser?.role || "مسؤول النظام"}</div>
                    <div className="text-[10px] text-slate-400 truncate">{currentUser?.email || "حساب معتمد"}</div>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setActiveTab("BRANCH_MANAGEMENT");
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <GitBranch className="w-4 h-4 text-emerald-400" />
                    <span>إدارة الفروع: {currentUser.branch}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setActiveTab("SECURITY_AND_ROLES");
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>الصلاحيات وأمان النظام</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setActiveTab("SAAS_PLATFORM");
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-sky-300 hover:text-white hover:bg-sky-950/60 border border-sky-500/20 transition-colors cursor-pointer font-bold"
                  >
                    <Cloud className="w-4 h-4 text-sky-400" />
                    <span>المنصة السحابية والتراخيص (SaaS)</span>
                  </button>
                  {onOpenSystemUpdate && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenSystemUpdate();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-300 hover:text-sap-secondary hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-sap-secondary" />
                      <span>تحديث وترقية النظام (v2026.9.2)</span>
                    </button>
                  )}
                  {onOpenOnboarding && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenOnboarding();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-300 hover:text-sap-secondary hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-sap-secondary" />
                      <span>الجولة التعريفية بالنظام (SAP Tour)</span>
                    </button>
                  )}

                  {/* Sovereign Admin Portal Trigger inside Menu */}
                  {isAdminUnlocked ? (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        الإدارة السيادية نشطة 🔓
                      </span>
                      {onLockAdmin && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onLockAdmin();
                          }}
                          className="px-2 py-0.5 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-[10px] font-black border border-rose-500/40"
                        >
                          قفل 🔒
                        </button>
                      )}
                    </div>
                  ) : (
                    onOpenAdminGateway && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenAdminGateway();
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl bg-blue-950/80 hover:bg-blue-900/90 text-blue-300 border border-blue-500/40 font-bold transition-colors cursor-pointer"
                      >
                        <Lock className="w-4 h-4 text-amber-400" />
                        <span>🔐 بوابة الإدارة العليا السيادية</span>
                      </button>
                    )
                  )}
                </div>

                {onLogout && (
                  <div className="pt-2 mt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors font-semibold text-xs cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>تسجيل الخروج (شاشة الدخول)</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
};
