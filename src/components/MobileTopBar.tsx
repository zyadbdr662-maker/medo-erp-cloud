import React from "react";
import {
  Menu,
  ArrowRight,
  Bell,
  User,
  Search,
  Wifi,
  WifiOff,
  Radio,
  Sparkles,
  RefreshCw,
  Mic,
  Sun,
  Moon,
  Contrast,
  Calendar,
  Lock,
} from "lucide-react";
import { NavTab } from "./Sidebar";
import { CurrencyCode, CurrencyInfo, ERPUser, CalendarType } from "../types/erp";
import { LocalSyncEngine } from "../services/localSyncEngine";
import { useCalendar } from "../utils/calendarUtils";
import { SyncStatusIndicator } from "./SyncStatusIndicator";
import { AnalogClock } from "./AnalogClock";

interface MobileTopBarProps {
  activeTab: NavTab | "HOME_HUB";
  setActiveTab: (tab: NavTab | "HOME_HUB") => void;
  onOpenMobileMenu: () => void;
  onOpenNotifications: () => void;
  onOpenUserMenu: () => void;
  currentUser?: ERPUser;
  unreadAlertsCount?: number;
  selectedCurrency: CurrencyCode;
  setSelectedCurrency: (c: CurrencyCode) => void;
  currencies: CurrencyInfo[];
  onOpenAi?: () => void;
  onOpenVoiceSearch?: () => void;
  onOpenGlobalSearch?: (initialQ?: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  highContrast?: boolean;
  onToggleHighContrast?: () => void;
  onBack?: () => void;
  moduleTitle?: string;
  moduleSubtitle?: string;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  isAdminUnlocked?: boolean;
  onOpenAdminGateway?: () => void;
  onLockAdmin?: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  onOpenNotifications,
  onOpenUserMenu,
  currentUser,
  unreadAlertsCount = 0,
  selectedCurrency,
  setSelectedCurrency,
  currencies,
  onOpenAi,
  onOpenVoiceSearch,
  onOpenGlobalSearch,
  isDarkMode = true,
  onToggleDarkMode,
  highContrast = false,
  onToggleHighContrast,
  onBack,
  moduleTitle,
  moduleSubtitle,
  onRefreshData,
  isRefreshing,
  isAdminUnlocked,
  onOpenAdminGateway,
  onLockAdmin,
}) => {
  const [networkMode, setNetworkMode] = React.useState(() => {
    return LocalSyncEngine.getInstance().getNetworkMode();
  });
  const [pendingCount, setPendingCount] = React.useState(() => {
    return LocalSyncEngine.getInstance().getPendingCount();
  });
  const { calendarType, toggleCalendar, todayFormatted } = useCalendar();

  React.useEffect(() => {
    const engine = LocalSyncEngine.getInstance();
    const unsubscribe = engine.subscribe(() => {
      setNetworkMode(engine.getNetworkMode());
      setPendingCount(engine.getPendingCount());
    });
    return unsubscribe;
  }, []);

  const isHomeOrHub = activeTab === "HOME_HUB" || activeTab === "DASHBOARD";

  const getModuleDisplayInfo = () => {
    if (moduleTitle) return { title: moduleTitle, subtitle: moduleSubtitle };

    switch (activeTab) {
      case "HOME_HUB":
        return { title: "القائمة الرئيسية", subtitle: "بوابة نظام MeDo ERP" };
      case "DASHBOARD":
        return { title: "لوحة التحكم", subtitle: "المؤشرات والسيولة المالية" };
      case "SALES_RETURNS":
      case "CUSTOMERS_AR":
        return { title: "المبيعات والعملاء", subtitle: "الفواتير والمرتجعات والذمم" };
      case "PURCHASES_RETURNS":
      case "VENDORS_AP":
        return { title: "المشتريات والموردين", subtitle: "فواتير المشتريات والمردودات" };
      case "INVENTORY":
        return { title: "إدارة المخزون", subtitle: "الأصناف وحركات الجرد والمستودعات" };
      case "JOURNAL_ENTRIES":
        return { title: "دفتر القيود اليومية", subtitle: "القيود المحاسبية والتسويات" };
      case "GENERAL_LEDGER":
        return { title: "الأستاذ العام", subtitle: "حركات وكشوفات الحسابات" };
      case "CHART_OF_ACCOUNTS":
        return { title: "شجرة الحسابات", subtitle: "دليل الحسابات المحاسبي (COA)" };
      case "VOUCHERS":
        return { title: "سندات القبض والصرف", subtitle: "المدفوعات والمقبوضات النقدية" };
      case "CASH_AND_BANK":
        return { title: "الخزائن والبنوك", subtitle: "حركة السيولة والتحويلات" };
      case "FINANCIAL_REPORTS":
        return { title: "التقارير والقوائم المالية", subtitle: "الأرباح والخسائر والميزانية" };
      case "COLLABORATION":
        return { title: "المراسلات وسير الموافقات", subtitle: "التوقيع والوارد والصادر والدردشة" };
      case "CLOUD_SYNC":
        return { title: "المزامنة وقاعدة البيانات", subtitle: "محرك العمل دون اتصال (Offline-First)" };
      case "THEME_STUDIO":
        return { title: "استوديو السمات والثيمات", subtitle: "تخصيص ألوان وخطوط النظام" };
      case "SETTINGS":
      case "CURRENCY_SETTINGS":
        return { title: "الإعدادات العامة", subtitle: "إعدادات المنشأة والعملات" };
      default:
        return { title: "نظام MeDo ERP", subtitle: "إدارة الموارد المالية والمحاسبية" };
    }
  };

  const currentInfo = getModuleDisplayInfo();

  return (
    <div data-mobile-top-bar="true" className="mobile-top-bar xl:hidden sticky top-0 z-40 bg-[#0B192C] backdrop-blur-md border-b border-[#1E3A8A]/50 shadow-md">
      {/* Safe Area Top Padding for notch devices */}
      <div className="px-3.5 py-2.5 flex items-center justify-between gap-2.5">
        {/* Right Section in RTL: Back Button OR Menu Toggle + Logo */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {!isHomeOrHub ? (
            <button
              onClick={() => {
                if (onBack) {
                  onBack();
                } else {
                  setActiveTab("HOME_HUB");
                }
              }}
              className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-90 text-slate-200 hover:text-white border border-slate-700/60 flex items-center justify-center transition-all cursor-pointer shadow-sm flex-shrink-0"
              aria-label="الرجوع إلى القائمة الرئيسية"
              title="الرجوع"
            >
              <ArrowRight className="w-5 h-5 text-blue-400" />
            </button>
          ) : (
            <button
              onClick={onOpenMobileMenu}
              className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-90 text-slate-200 hover:text-white border border-slate-700/60 flex items-center justify-center transition-all cursor-pointer shadow-sm flex-shrink-0"
              aria-label="فتح القائمة الرئيسية"
              title="القائمة الرئيسية"
            >
              <Menu className="w-5 h-5 text-slate-200" />
            </button>
          )}

          {/* Brand Logo Emblem */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B192C] via-[#1E3A8A] to-[#0A192F] border border-blue-400/50 shadow-sm text-blue-200 shrink-0">
            <div className="flex flex-col items-center justify-center leading-none">
              <span className="text-[9px] font-black tracking-tighter text-white">MDO</span>
              <span className="text-[5.5px] font-bold text-amber-200/90 tracking-widest">بن زياد</span>
            </div>
          </div>

          {/* Module Title / App Brand */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-100 text-sm sm:text-base truncate tracking-tight">
                {isHomeOrHub ? "MeDo ERP" : currentInfo.title}
              </span>
              {isHomeOrHub ? (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  SAP FI
                </span>
              ) : (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono hidden sm:inline">
                  مستند
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {isHomeOrHub ? "نظام المحاسبة والمالية الذكي" : currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Left Section in RTL: Currency, Network, Alerts, Menu, Profile */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Quick Currency Selector */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg px-1 py-1">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
              aria-label="تغيير عملة العرض"
              className="bg-transparent text-[11px] font-bold text-emerald-400 focus:outline-none cursor-pointer"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-900 text-slate-200">
                  {c.code === "YER_SANAA"
                    ? "ر.ي (صنعاء)"
                    : c.code === "YER_ADEN"
                    ? "ر.ي (عدن)"
                    : c.code === "SAR"
                    ? "ر.س"
                    : c.code === "USD"
                    ? "$"
                    : "€"}
                </option>
              ))}
            </select>
          </div>

          {/* Live Sovereign Analog Clock on Mobile */}
          <div className="flex items-center justify-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
            <AnalogClock size={28} showSeconds={true} />
          </div>

          {/* Quick Calendar Switcher Button (تبديل التقويم هجري / ميلادي / مزدوج) */}
          <button
            type="button"
            onClick={toggleCalendar}
            className="w-8 h-8 rounded-lg flex items-center justify-center border bg-slate-950 border-slate-800 text-slate-300 hover:text-emerald-400 active:scale-95 transition-all text-[10px] font-bold"
            title={`نوع التقويم: ${
              calendarType === "HIJRI" ? "هجري 🌙" : calendarType === "DUAL" ? "مزدوج 🌓" : "ميلادي ☀️"
            } (اضغط للتبديل | اليوم: ${todayFormatted})`}
            aria-label="تبديل التقويم"
          >
            {calendarType === "HIJRI" ? (
              <span className="text-amber-400 font-black">هـ</span>
            ) : calendarType === "DUAL" ? (
              <span className="text-cyan-400 font-black text-[9px]">م/هـ</span>
            ) : (
              <span className="text-emerald-400 font-black">م</span>
            )}
          </button>

          {/* Network & Offline Sync Status Indicator */}
          <SyncStatusIndicator
            isCompact={true}
            onNavigateToSync={() => setActiveTab("CLOUD_SYNC")}
          />

          {/* Light/Dark Mode Toggle Switch */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className={`w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 border transition-all ${
                isDarkMode
                  ? "bg-slate-950 border-slate-800 text-amber-400 hover:bg-slate-800"
                  : "bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 shadow-sm"
              }`}
              title={isDarkMode ? "التحويل للوضع المضيء" : "التحويل للوضع المظلم"}
              aria-label="تبديل الوضع المضيء/المظلم"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 animate-pulse" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
            </button>
          )}

          {/* High Contrast Toggle Button */}
          {onToggleHighContrast && (
            <button
              onClick={onToggleHighContrast}
              className={`w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 border transition-all ${
                highContrast
                  ? "bg-yellow-400 border-yellow-300 text-black shadow-md shadow-yellow-400/30"
                  : "bg-slate-950 border-slate-800 text-amber-400 hover:bg-slate-800 hover:text-white"
              }`}
              title={highContrast ? "تعطيل وضع التباين العالي" : "تفعيل التباين العالي (High Contrast)"}
              aria-label="تبديل التباين العالي"
            >
              <Contrast className={`w-3.5 h-3.5 ${highContrast ? "text-black" : "text-amber-400"}`} />
            </button>
          )}

          {/* Global Refresh Button (زر إنعاش النظام للجوال) */}
          {onRefreshData && (
            <button
              id="mobile-system-refresh-btn"
              type="button"
              onClick={onRefreshData}
              disabled={isRefreshing}
              className={`w-8 h-8 rounded-lg bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/50 flex items-center justify-center active:scale-95 shadow-sm cursor-pointer ${
                isRefreshing ? "opacity-70 cursor-wait" : ""
              }`}
              title="إنعاش النظام: تحديث ومزامنة كافة الوحدات المحاسبية وحل أي تعليقات"
              aria-label="إنعاش النظام"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-200" : ""}`} />
            </button>
          )}

          {/* Global Smart Search Button */}
          {onOpenGlobalSearch && (
            <button
              onClick={() => onOpenGlobalSearch()}
              className="w-8 h-8 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center active:scale-95 shadow-sm"
              title="البحث الذكي الشامل (فواتير، قيود، عملاء، موردين)"
              aria-label="البحث الذكي الشامل"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}

          {/* AI Voice Search Button */}
          {onOpenVoiceSearch && (
            <button
              onClick={onOpenVoiceSearch}
              className="w-8 h-8 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center active:scale-95 shadow-sm"
              title="بحث صوتي ذكي بالذكاء المالي المتقدم"
              aria-label="بحث صوتي ذكي"
            >
              <Mic className="w-3.5 h-3.5 animate-pulse" />
            </button>
          )}

          {/* Sovereign Admin Trigger Button on Mobile */}
          {isAdminUnlocked ? (
            <button
              onClick={onLockAdmin}
              className="px-2 py-1 rounded-lg bg-rose-950 border border-rose-500/50 text-rose-300 text-[10px] font-black flex items-center gap-1 active:scale-95"
              title="قفل فوري لإخفاء الإدارة"
            >
              <span>قفل</span>
              <Lock className="w-3 h-3 text-rose-400" />
            </button>
          ) : (
            onOpenAdminGateway && (
              <button
                onClick={onOpenAdminGateway}
                className="w-8 h-8 rounded-lg bg-blue-950/90 border border-blue-400/50 text-amber-400 flex items-center justify-center active:scale-95 shadow-sm"
                title="🔐 بوابة الإدارة العليا"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            )
          )}

          {/* AI Advisor Button */}
          {onOpenAi && (
            <button
              onClick={onOpenAi}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 active:scale-95"
              title="المستشار المالي الذكي"
              aria-label="المستشار المالي الذكي"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="w-9 h-9 rounded-xl bg-slate-950 hover:bg-slate-800 active:scale-95 border border-slate-800 flex items-center justify-center relative text-slate-300 hover:text-white"
            aria-label="الإشعارات والتنبيهات"
            title="الإشعارات والتنبيهات"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                {unreadAlertsCount > 9 ? "9+" : unreadAlertsCount}
              </span>
            )}
          </button>

          {/* If inside a module, still allow quick access to main menu drawer */}
          {!isHomeOrHub && (
            <button
              onClick={onOpenMobileMenu}
              className="w-9 h-9 rounded-xl bg-slate-950 hover:bg-slate-800 active:scale-95 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
              aria-label="فتح القائمة الجانبية"
              title="القائمة الجانبية"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* User Profile Avatar */}
          <button
            onClick={onOpenUserMenu}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-sm active:scale-95"
            aria-label="الملف الشخصي"
            title={currentUser?.fullName || "المستخدم"}
          >
            {currentUser?.fullName?.charAt(0) || <User className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
