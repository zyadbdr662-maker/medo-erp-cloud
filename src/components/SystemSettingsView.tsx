import React, { useState } from "react";
import {
  Settings,
  Building2,
  Coins,
  ShieldCheck,
  Users,
  Sparkles,
  Database,
  Save,
  CheckCircle2,
  RotateCcw,
  Download,
  Upload,
  UserPlus,
  Lock,
  Calendar,
  DollarSign,
  AlertTriangle,
  Info,
  Package,
  Palette,
  Sun,
  Moon,
  Check,
  Sliders,
  Eye,
  LogOut,
} from "lucide-react";
import {
  CurrencyCode,
  CurrencyInfo,
  ERPUser,
  SystemSettings,
  InventoryItem,
  StockMovement,
  UnavailableItemRequest,
  ERPRole,
  CalendarType,
} from "../types/erp";
import {
  formatGregorianDate,
  formatHijriDate,
  formatDualDate,
  formatCalendarDate,
  setActiveCalendarType,
  getActiveCalendarType,
} from "../utils/calendarUtils";
import { CurrencySettingsView } from "./CurrencySettingsView";
import { InventorySettingsSubView } from "./InventorySettingsSubView";
import { RoleAndPermissionsManager } from "./RoleAndPermissionsManager";
import { ScheduledBackupView } from "./ScheduledBackupView";
import {
  exportERPDataAsJSON,
  importERPDataFromJSON,
  resetERPData,
  ERPFullState,
} from "../services/erpStorage";
import { ThemeManager } from "../services/themeManager";
import { PREDEFINED_THEMES, ThemeConfig } from "../types/theme";
import { SecuritySessionsAndAuditView } from "./SecuritySessionsAndAuditView";

interface SystemSettingsViewProps {
  systemSettings: SystemSettings;
  onUpdateSystemSettings: (newSettings: SystemSettings) => void;
  currencies: CurrencyInfo[];
  onUpdateCurrencies: (currencies: CurrencyInfo[]) => void;
  currentUser: ERPUser;
  onSwitchUser: (user: ERPUser) => void;
  onResetAllData: () => void;
  fullState: ERPFullState;
  onLogout?: () => void;
  inventoryItems?: InventoryItem[];
  stockMovements?: StockMovement[];
  unavailableRequests?: UnavailableItemRequest[];
  displayCurrency?: CurrencyCode;
  onAddUnavailableRequest?: (req: UnavailableItemRequest) => void;
  onUpdateUnavailableRequest?: (req: UnavailableItemRequest) => void;
  onDeleteUnavailableRequest?: (id: string) => void;
  roles?: ERPRole[];
  usersList?: ERPUser[];
  onUpdateRoles?: (roles: ERPRole[]) => void;
  onUpdateUsersList?: (users: ERPUser[]) => void;
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({
  systemSettings,
  onUpdateSystemSettings,
  currencies,
  onUpdateCurrencies,
  currentUser,
  onSwitchUser,
  onResetAllData,
  fullState,
  onLogout,
  inventoryItems = [],
  stockMovements = [],
  unavailableRequests = [],
  displayCurrency = "YER_SANAA",
  onAddUnavailableRequest = () => {},
  onUpdateUnavailableRequest = () => {},
  onDeleteUnavailableRequest = () => {},
  roles = fullState.roles || [],
  usersList = fullState.usersList || [],
  onUpdateRoles = () => {},
  onUpdateUsersList = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<
    "COMPANY" | "CURRENCIES" | "POLICIES" | "USERS" | "AI" | "BACKUP" | "INVENTORY_SETTINGS" | "THEME_COLORS" | "SIGNATURE" | "SECURITY_AUDIT"
  >("COMPANY");

  const [formData, setFormData] = useState<SystemSettings>({ ...systemSettings });

  // Synchronize state when systemSettings prop changes
  React.useEffect(() => {
    setFormData({ ...systemSettings });
  }, [systemSettings]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importing, setImporting] = useState(false);
  const [adminMode, setAdminMode] = useState<boolean>(() => {
    return localStorage.getItem("medo_erp_admin_mode") === "true";
  });

  // SAP Theme and Color Palette Management State
  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(() => ThemeManager.getActiveTheme());
  const [themeColors, setThemeColors] = useState({
    primaryColor: activeTheme.colors.primaryColor,
    secondaryColor: activeTheme.colors.secondaryColor,
    backgroundColor: activeTheme.colors.backgroundColor,
    cardBackgroundColor: activeTheme.colors.cardBackgroundColor,
    textColor: activeTheme.colors.textColor,
    borderColor: activeTheme.colors.borderColor,
  });
  const [themeChangeSuccess, setThemeChangeSuccess] = useState(false);

  const handleSelectPredefinedTheme = (themeId: string) => {
    const selected = PREDEFINED_THEMES.find((t) => t.id === themeId);
    if (selected) {
      ThemeManager.applyTheme(selected, true);
      setActiveTheme(selected);
      setThemeColors({
        primaryColor: selected.colors.primaryColor,
        secondaryColor: selected.colors.secondaryColor,
        backgroundColor: selected.colors.backgroundColor,
        cardBackgroundColor: selected.colors.cardBackgroundColor,
        textColor: selected.colors.textColor,
        borderColor: selected.colors.borderColor,
      });
      setThemeChangeSuccess(true);
      setTimeout(() => setThemeChangeSuccess(false), 3000);
    }
  };

  const handleSaveCustomColors = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTheme: ThemeConfig = {
      ...activeTheme,
      id: `custom_${Date.now()}`,
      nameAr: "ثيم مخصص (لوحة الإعدادات)",
      isCustom: true,
      colors: {
        ...activeTheme.colors,
        primaryColor: themeColors.primaryColor,
        secondaryColor: themeColors.secondaryColor,
        backgroundColor: themeColors.backgroundColor,
        cardBackgroundColor: themeColors.cardBackgroundColor,
        textColor: themeColors.textColor,
        borderColor: themeColors.borderColor,
      },
      updatedAt: new Date().toISOString(),
    };
    ThemeManager.saveCustomTheme(updatedTheme);
    ThemeManager.applyTheme(updatedTheme, true);
    setActiveTheme(updatedTheme);
    setThemeChangeSuccess(true);
    setTimeout(() => setThemeChangeSuccess(false), 3000);
  };

  const handleResetToHorizon = () => {
    const horizon = PREDEFINED_THEMES[0];
    ThemeManager.applyTheme(horizon, true);
    setActiveTheme(horizon);
    setThemeColors({
      primaryColor: horizon.colors.primaryColor,
      secondaryColor: horizon.colors.secondaryColor,
      backgroundColor: horizon.colors.backgroundColor,
      cardBackgroundColor: horizon.colors.cardBackgroundColor,
      textColor: horizon.colors.textColor,
      borderColor: horizon.colors.borderColor,
    });
    setThemeChangeSuccess(true);
    setTimeout(() => setThemeChangeSuccess(false), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSystemSettings(formData);
    if (formData.calendarType) {
      setActiveCalendarType(formData.calendarType);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const importedState = await importERPDataFromJSON(file);
      if (importedState) {
        alert("تم استعادة النسخة الاحتياطية بنجاح! سيتم إعادة تحميل الصفحة.");
        window.location.reload();
      } else {
        alert("ملف غير صريح أو تالف.");
      }
    } catch (err) {
      alert("حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">إدارة إعدادات النظام الشاملة (System Administration)</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                SAP System Config
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              تهيئة بيانات المنشأة، السياسات المحاسبية، الصلاحيات، والنسخ الاحتياطي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-xl text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              تم حفظ الإعدادات بنجاح!
            </div>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          )}
        </div>
      </div>

      {/* Settings Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
        <button
          onClick={() => setActiveTab("COMPANY")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "COMPANY"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          بيانات الشركة والمنشأة
        </button>

        <button
          onClick={() => setActiveTab("CURRENCIES")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "CURRENCIES"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          <Coins className="w-4 h-4" />
          إدارة العملات والأسعار
        </button>

        <button
          onClick={() => setActiveTab("POLICIES")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "POLICIES"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          الضوابط والسياسات المحاسبية
        </button>

        <button
          onClick={() => setActiveTab("USERS")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "USERS"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          المستخدمين والصلاحيات
        </button>

        <button
          onClick={() => setActiveTab("AI")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "AI"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          إعدادات الذكاء المالي المتقدم
        </button>

        <button
          onClick={() => setActiveTab("BACKUP")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "BACKUP"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          <Database className="w-4 h-4 text-amber-400" />
          النسخ الاحتياطي والصيانة
        </button>

        <button
          onClick={() => setActiveTab("INVENTORY_SETTINGS")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "INVENTORY_SETTINGS"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          <Package className="w-4 h-4 text-purple-300" />
          إعدادات وتقارير المخزون
        </button>

        <button
          onClick={() => setActiveTab("THEME_COLORS")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "THEME_COLORS"
              ? "bg-[#0A2540] text-sap-secondary border border-sap-secondary/50 shadow-lg shadow-[#0A2540]/50"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          <Palette className="w-4 h-4 text-sap-secondary" />
          المظهر والألوان (SAP Fiori)
        </button>

        <button
          onClick={() => setActiveTab("SIGNATURE")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "SIGNATURE"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          <span className="text-sm">✍️</span>
          <span>إعدادات التوقيع الإلكتروني</span>
        </button>

        <button
          onClick={() => setActiveTab("SECURITY_AUDIT")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "SECURITY_AUDIT"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>مراقبة الجلسات وتدقيق الأمان</span>
        </button>
      </div>

      {/* TAB 1: Company Profile */}
      {activeTab === "COMPANY" && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                معلومات وبيانات المنشأة التجارية
              </h3>
              <p className="text-xs text-slate-400">تظهر هذه البيانات في ترويسات التقارير والسندات المطبوعة ورسائل النظام</p>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              حفظ التغييرات
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">اسم المنشأة باللغة العربية *</label>
              <input
                type="text"
                value={formData.companyNameAr}
                onChange={(e) => setFormData({ ...formData, companyNameAr: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">اسم المنشأة باللغة الإنجليزية (English Name)</label>
              <input
                type="text"
                value={formData.companyNameEn}
                onChange={(e) => setFormData({ ...formData, companyNameEn: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500 dir-ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">الرقم الضريبي (Tax ID)</label>
              <input
                type="text"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">رقم السجل التجاري (Commercial Register)</label>
              <input
                type="text"
                value={formData.commercialRegister}
                onChange={(e) => setFormData({ ...formData, commercialRegister: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">هاتف التواصل</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 dir-ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">البريد الإلكتروني الرسمي</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 dir-ltr"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">العنوان والفرع الرئيسي</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-5 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              إعدادات السنة المالية والعملة الأساسية
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">العملة الأساسية لإعداد التقرير</label>
                <select
                  value={formData.baseCurrency}
                  onChange={(e) => setFormData({ ...formData, baseCurrency: e.target.value as CurrencyCode })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-400 focus:outline-none focus:border-blue-500"
                >
                  <option value="YER_SANAA">ريال يمني - طبعة قديمة (صنعاء)</option>
                  <option value="YER_ADEN">ريال يمني - طبعة جديدة (عدن)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">بداية السنة المالية</label>
                <input
                  type="date"
                  value={formData.fiscalYearStart}
                  onChange={(e) => setFormData({ ...formData, fiscalYearStart: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">نهاية السنة المالية</label>
                <input
                  type="date"
                  value={formData.fiscalYearEnd}
                  onChange={(e) => setFormData({ ...formData, fiscalYearEnd: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Calendar System Settings & Hijri/Gregorian Toggle */}
            <div className="mt-6 pt-6 border-t border-slate-800 bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    نظام التقويم وعرض التواريخ (Calendar & Date Display System)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    اختر التقويم المعتمد لعرض التواريخ في كافة السندات، الفواتير، القيود اليومية والتقارير المالية
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                    اليوم: {formatCalendarDate(new Date(), formData.calendarType || "GREGORIAN")}
                  </span>
                </div>
              </div>

              {/* 3 Calendar Modes Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, calendarType: "GREGORIAN" })}
                  className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    (formData.calendarType || "GREGORIAN") === "GREGORIAN"
                      ? "bg-blue-950/50 border-blue-500 text-white shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/50"
                      : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-400" />
                      التقويم الميلادي (Gregorian)
                    </span>
                    {(formData.calendarType || "GREGORIAN") === "GREGORIAN" && (
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">
                    عرض جميع التواريخ بالتقويم الشمسي الميلادي القياسي (يناير - ديسمبر).
                  </p>
                  <div className="text-[11px] font-mono text-amber-300 bg-slate-950/70 px-2 py-1 rounded border border-slate-800/80">
                    {formatGregorianDate(new Date(), "full")}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, calendarType: "HIJRI" })}
                  className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    formData.calendarType === "HIJRI"
                      ? "bg-emerald-950/50 border-emerald-500 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50"
                      : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Moon className="w-4 h-4 text-emerald-400" />
                      التقويم الهجري - أم القرى (Hijri)
                    </span>
                    {formData.calendarType === "HIJRI" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">
                    تحويل وعرض تلقائي لجميع التواريخ بحسب تقويم أم القرى المعتمد.
                  </p>
                  <div className="text-[11px] font-mono text-emerald-300 bg-slate-950/70 px-2 py-1 rounded border border-slate-800/80">
                    {formatHijriDate(new Date(), "full")}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, calendarType: "DUAL" })}
                  className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    formData.calendarType === "DUAL"
                      ? "bg-cyan-950/50 border-cyan-500 text-white shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50"
                      : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span className="text-cyan-400 font-bold">🌓</span>
                      التقويم المزدوج (Dual Display)
                    </span>
                    {formData.calendarType === "DUAL" && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">
                    إظهار التاريخ الميلادي مصحوباً بالتاريخ الهجري المقابل له في آن واحد.
                  </p>
                  <div className="text-[11px] font-mono text-cyan-300 bg-slate-950/70 px-2 py-1 rounded border border-slate-800/80">
                    {formatDualDate(new Date(), "compact")}
                  </div>
                </button>
              </div>

              {/* Real-time Preview in Accounting Documents */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">معاينة التاريخ في ترويسة الفواتير والقيود:</span>
                  <span className="font-bold text-white bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 font-mono text-emerald-400">
                    {formatCalendarDate(new Date(), formData.calendarType || "GREGORIAN")}
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={formData.showHijriSecondary !== false}
                    onChange={(e) => setFormData({ ...formData, showHijriSecondary: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700 focus:ring-blue-500"
                  />
                  <span>إظهار تلميح التاريخ الهجري المقابل عند الوقوف بالمؤشر</span>
                </label>
              </div>
            </div>

            {/* SaaS Admin Mode Toggle for Production */}
            <div className="mt-6 pt-6 border-t border-slate-800 bg-slate-950/60 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  وضع إدارة المنصة السحابية (SaaS Admin Mode)
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  التحكم في إظهار أو إخفاء وحدة إدارة المنصة السحابية والتراخيص (SaaS) في القائمة الجانبية. (مخفية افتراضياً في النسخة الأصلية للعملاء).
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !adminMode;
                  setAdminMode(next);
                  localStorage.setItem("medo_erp_admin_mode", next ? "true" : "false");
                  alert(next ? "تم تفعيل وضع الإدارة السحابية بنجاح! ستظهر وحدة SaaS في القائمة الجانبية." : "تم إلغاء تفعيل وضع الإدارة السحابية. تم إخفاء وحدة SaaS عن العملاء.");
                  window.location.reload();
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg whitespace-nowrap ${
                  adminMode
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                {adminMode ? "✓ وضع الإدارة مفعل (مرئي)" : "○ وضع العملاء (مخفي)"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: Multi Currency Management */}
      {activeTab === "CURRENCIES" && (
        <CurrencySettingsView
          currencies={currencies}
          onUpdateExchangeRate={(code, newRate) => {
            const updated = currencies.map((c) =>
              c.code === code ? { ...c, exchangeRateToUSD: newRate } : c
            );
            onUpdateCurrencies(updated);
          }}
          onExecuteForexRevaluation={() => {}}
        />
      )}

      {/* TAB 3: Policies & Accounting Rules */}
      {activeTab === "POLICIES" && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                الضوابط والسياسات المحاسبية الصارمة (Financial Controls)
              </h3>
              <p className="text-xs text-slate-400">تطبيق معايير المراجعة الداخلية وقوانين الترحيل المغلقة</p>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              حفظ السياسات
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="preventUnbalancedJournals"
                checked={formData.preventUnbalancedJournals}
                onChange={(e) => setFormData({ ...formData, preventUnbalancedJournals: e.target.checked })}
                className="mt-1 w-4 h-4 accent-emerald-500 rounded"
              />
              <div>
                <label htmlFor="preventUnbalancedJournals" className="text-sm font-bold text-white cursor-pointer">
                  منع ترحيل القيود غير المتوازنة (Strict Double-Entry Balancing)
                </label>
                <p className="text-xs text-slate-400 mt-0.5">
                  يرفض النظام ترحيل أو اعتماد أي قيد يختلف فيه مجموع طرف المدين عن مجموع طرف الدائن.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="autoPostApprovedVouchers"
                checked={formData.autoPostApprovedVouchers}
                onChange={(e) => setFormData({ ...formData, autoPostApprovedVouchers: e.target.checked })}
                className="mt-1 w-4 h-4 accent-emerald-500 rounded"
              />
              <div>
                <label htmlFor="autoPostApprovedVouchers" className="text-sm font-bold text-white cursor-pointer">
                  الترحيل الآلي السريع للسندات والفواتير المعتمدة
                </label>
                <p className="text-xs text-slate-400 mt-0.5">
                  توليد قيد يومية آلي ومرحّل مباشرة عند حفظ سند قبض أو صرف أو فاتورة معتمدة.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="requireCostCenterForExpenses"
                checked={formData.requireCostCenterForExpenses}
                onChange={(e) => setFormData({ ...formData, requireCostCenterForExpenses: e.target.checked })}
                className="mt-1 w-4 h-4 accent-emerald-500 rounded"
              />
              <div>
                <label htmlFor="requireCostCenterForExpenses" className="text-sm font-bold text-white cursor-pointer">
                  ربط مراكز التكلفة إجبارياً بحسابات المصروفات (CO Integration)
                </label>
                <p className="text-xs text-slate-400 mt-0.5">
                  يلزم المستخدم باختيار مركز تكلفة عند إدخال أي سطر يحتوي على حساب من فئة المصروفات.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="allowNegativeCash"
                checked={formData.allowNegativeCash}
                onChange={(e) => setFormData({ ...formData, allowNegativeCash: e.target.checked })}
                className="mt-1 w-4 h-4 accent-emerald-500 rounded"
              />
              <div>
                <label htmlFor="allowNegativeCash" className="text-sm font-bold text-white cursor-pointer">
                  السماح بالسحب على المكشوف أو الأرصدة السالبة للصناديق
                </label>
                <p className="text-xs text-slate-400 mt-0.5">
                  عند إلغاء هذا التفعيل، يمنع النظام صرف أي مبلغ يتجاوز الرصيد المتوفر في الخزينة.
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                تاريخ القفل المحاسبي (Posting Cut-off Date):
              </label>
              <input
                type="date"
                value={formData.closingDate || ""}
                onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                className="w-full md:w-64 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-400">
                يتم تجميد ومنع تعديل أي قيود محاسبية أو سندات بتاريخ سابق لهذا التاريخ.
              </p>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: Users & Permissions */}
      {activeTab === "USERS" && (
        <RoleAndPermissionsManager
          roles={roles}
          usersList={usersList}
          currentUser={currentUser}
          onUpdateRoles={onUpdateRoles}
          onUpdateUsersList={onUpdateUsersList}
          onSwitchUser={onSwitchUser}
        />
      )}

      {/* TAB 5: AI Copilot Settings */}
      {activeTab === "AI" && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                إعدادات المحلل المالي الذكي (MeDo AI Copilot Engine)
              </h3>
              <p className="text-xs text-slate-400">ضبط نموذج Google Gemini والتوليد التلقائي للقيود المحاسبية</p>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              حفظ إعدادات الذكاء
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">نموذج الذكاء المالي المتقدم المعتمد</label>
                <select
                  value={formData.aiModel}
                  onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-cyan-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="gemini-3.7-flash">Gemini 3.7 Flash (فائق السرعة والدقة المالية)</option>
                  <option value="gemini-3.5-pro">Gemini 3.5 Pro (التحليل المالي المتعمق)</option>
                </select>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="aiAutoValidation"
                checked={formData.aiAutoValidation}
                onChange={(e) => setFormData({ ...formData, aiAutoValidation: e.target.checked })}
                className="mt-1 w-4 h-4 accent-cyan-500 rounded"
              />
              <div>
                <label htmlFor="aiAutoValidation" className="text-sm font-bold text-white cursor-pointer">
                  التصحيح التلقائي وتدقيق القيود بواسطة الذكاء المالي المتقدم
                </label>
                <p className="text-xs text-slate-400 mt-0.5">
                  توجيه المحاسب عند صياغة أي قيد باللغة الطبيعية لضبط أرصدة المدين والدائن فوراً.
                </p>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 6: Backup & Scheduled Encrypted Cloud Vault */}
      {activeTab === "BACKUP" && (
        <div className="space-y-6">
          <ScheduledBackupView
            systemSettings={systemSettings}
            onUpdateSystemSettings={onUpdateSystemSettings}
            fullState={fullState}
          />

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                تصدير واستعادة ملفات البيانات التقليدية وإعادة الضبط
              </h3>
              <p className="text-xs text-slate-400">تصدير يدوي سريع لملفات JSON أو إعادة تعيين النظام</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Export JSON */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Download className="w-4 h-4" />
                    تصدير ملف JSON غير مشفر
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    تنزيل ملف نصي شامل يحتوي على جميع القيود، شجرة الحسابات، السندات، والعملاء.
                  </p>
                </div>
                <button
                  onClick={() => exportERPDataAsJSON(fullState)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  تحميل ملف JSON يدوي
                </button>
              </div>

              {/* Import JSON */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <Upload className="w-4 h-4" />
                    استعادة من ملف JSON خارجي
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    رفع ملف JSON تم تصديره سابقاً لإستعادة كامل النظام بنفس الحالة.
                  </p>
                </div>
                <label className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  {importing ? "جاري الرفع..." : "اختيار ملف Backup"}
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {/* Reset System */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <RotateCcw className="w-4 h-4" />
                    إعادة ضبط المصنع (Factory Reset)
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    مسح الذاكرة المحلية وإعادة التعيين إلى البيانات الافتراضية الأولية للـ ERP.
                  </p>
                </div>
                <button
                  onClick={onResetAllData}
                  className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  إعادة ضبط النظام
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Inventory Settings & Audits */}
      {activeTab === "INVENTORY_SETTINGS" && (
        <InventorySettingsSubView
          inventoryItems={inventoryItems}
          stockMovements={stockMovements}
          unavailableRequests={unavailableRequests}
          currencies={currencies}
          displayCurrency={displayCurrency}
          onAddUnavailableRequest={onAddUnavailableRequest}
          onUpdateUnavailableRequest={onUpdateUnavailableRequest}
          onDeleteUnavailableRequest={onDeleteUnavailableRequest}
        />
      )}

      {/* TAB 8: SAP Fiori Themes & Core Color Customization */}
      {activeTab === "THEME_COLORS" && (
        <div className="space-y-6">
          {/* Notification Banner */}
          {themeChangeSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold">تم تطبيق وحفظ إعدادات الألوان والثيم بنجاح في كامل النظام!</span>
              </div>
            </div>
          )}

          {/* Section 1: Standard SAP Themes Selection */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-sap-secondary" />
                  الثيمات المعتمدة وفق معايير SAP Fiori
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  اختر بين الثيم الأساسي الأحدث (Horizon)، أو الوضع الليلي (Dark Mode)، أو الخيار الاحتياطي (Quartz Light)
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetToHorizon}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 self-start sm:self-auto"
                title="إعادة التعيين لثيم SAP Horizon الافتراضي"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                استعادة Horizon الافتراضي
              </button>
            </div>

            {/* SAP Theme Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PREDEFINED_THEMES.map((theme) => {
                const isSelected = activeTheme.id === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectPredefinedTheme(theme.id)}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? "bg-slate-950 border-sap-secondary ring-2 ring-sap-secondary/30 shadow-xl shadow-black/40"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          {theme.mode === "dark" ? (
                            <Moon className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <Sun className="w-4 h-4 text-amber-400" />
                          )}
                          {theme.nameAr}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sap-secondary/20 text-sap-secondary border border-sap-secondary/40 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            مفعل
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{theme.descriptionAr}</p>
                    </div>

                    {/* Color Swatch Preview */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-bold">لوحة ألوان الثيم:</div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-5 h-5 rounded-full border border-slate-700 shadow-sm"
                          style={{ backgroundColor: theme.colors.primaryColor }}
                          title={`اللون الأساسي: ${theme.colors.primaryColor}`}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-slate-700 shadow-sm"
                          style={{ backgroundColor: theme.colors.secondaryColor }}
                          title={`لمسة الهوية: ${theme.colors.secondaryColor}`}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-slate-700 shadow-sm"
                          style={{ backgroundColor: theme.colors.backgroundColor }}
                          title={`الخلفية المحايدة: ${theme.colors.backgroundColor}`}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-slate-700 shadow-sm"
                          style={{ backgroundColor: theme.colors.cardBackgroundColor }}
                          title={`بطاقات العرض: ${theme.colors.cardBackgroundColor}`}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-slate-700 shadow-sm"
                          style={{ backgroundColor: theme.colors.textColor }}
                          title={`النص الأساسي: ${theme.colors.textColor}`}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPredefinedTheme(theme.id);
                      }}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-[#0A2540] text-sap-secondary border border-sap-secondary/50"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                      }`}
                    >
                      {isSelected ? "الثيم مفعل حالياً" : "تطبيق هذا المظهر"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Core Colors Customization Form */}
          <form onSubmit={handleSaveCustomColors} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-400" />
                  تخصيص الألوان الأساسية والهوية
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  قم بتعديل تدرجات الألوان الأساسية (الرمادي المحايد، الكحلي الداكن، الذهبي) مع الحفاظ على معايير التباين العالي
                </p>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all self-start sm:self-auto"
              >
                <Save className="w-4 h-4" />
                حفظ وتطبيق الألوان
              </button>
            </div>

            {/* Form Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* 1. Primary Navy / Brand Color */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">اللون الأساسي (Primary Navy):</label>
                  <span
                    className="w-5 h-5 rounded-full border border-slate-600"
                    style={{ backgroundColor: themeColors.primaryColor }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColors.primaryColor}
                    onChange={(e) => setThemeColors((prev) => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-10 h-10 p-0.5 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={themeColors.primaryColor}
                    onChange={(e) => setThemeColors((prev) => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400">خيارات سريعة:</span>
                  {["#0A2540", "#1B365D", "#0854A0", "#1E3A8A", "#0F766E"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setThemeColors((prev) => ({ ...prev, primaryColor: c }))}
                      className="w-4 h-4 rounded-full border border-slate-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* 2. Secondary Gold / Identity Accent */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">لون الهوية واللمسات (Gold Accent):</label>
                  <span
                    className="w-5 h-5 rounded-full border border-slate-600"
                    style={{ backgroundColor: themeColors.secondaryColor }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColors.secondaryColor}
                    onChange={(e) => setThemeColors((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-10 h-10 p-0.5 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={themeColors.secondaryColor}
                    onChange={(e) => setThemeColors((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400">خيارات سريعة:</span>
                  {["#D4AF37", "#E5C06E", "#F59E0B", "#C5A059", "#10B981"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setThemeColors((prev) => ({ ...prev, secondaryColor: c }))}
                      className="w-4 h-4 rounded-full border border-slate-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* 3. Neutral Background */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">الخلفية العامة المحايدة (Neutral BG):</label>
                  <span
                    className="w-5 h-5 rounded-full border border-slate-600"
                    style={{ backgroundColor: themeColors.backgroundColor }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColors.backgroundColor}
                    onChange={(e) => setThemeColors((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-10 h-10 p-0.5 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={themeColors.backgroundColor}
                    onChange={(e) => setThemeColors((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400">خيارات سريعة:</span>
                  {["#F5F6F8", "#FFFFFF", "#EFF4F9", "#0B111A", "#020617"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setThemeColors((prev) => ({ ...prev, backgroundColor: c }))}
                      className="w-4 h-4 rounded-full border border-slate-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* 4. Card Background */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">خلفية البطاقات والنوافذ (Card BG):</label>
                  <span
                    className="w-5 h-5 rounded-full border border-slate-600"
                    style={{ backgroundColor: themeColors.cardBackgroundColor }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColors.cardBackgroundColor}
                    onChange={(e) => setThemeColors((prev) => ({ ...prev, cardBackgroundColor: e.target.value }))}
                    className="w-10 h-10 p-0.5 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={themeColors.cardBackgroundColor}
                    onChange={(e) => setThemeColors((prev) => ({ ...prev, cardBackgroundColor: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400">خيارات سريعة:</span>
                  {["#FFFFFF", "#F8FAFC", "#141D2B", "#0F172A"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setThemeColors((prev) => ({ ...prev, cardBackgroundColor: c }))}
                      className="w-4 h-4 rounded-full border border-slate-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* 5. Primary Text (High Contrast) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">لون النصوص الأساسية (High Contrast):</label>
                  <span
                    className="w-5 h-5 rounded-full border border-slate-600"
                    style={{ backgroundColor: themeColors.textColor }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColors.textColor}
                    onChange={(e) => setThemeColors((prev) => ({ ...prev, textColor: e.target.value }))}
                    className="w-10 h-10 p-0.5 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={themeColors.textColor}
                    onChange={(e) => setThemeColors((prev) => ({ ...prev, textColor: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400">خيارات سريعة:</span>
                  {["#111827", "#1E293B", "#FFFFFF", "#F8FAFC"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setThemeColors((prev) => ({ ...prev, textColor: c }))}
                      className="w-4 h-4 rounded-full border border-slate-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* 6. Border & Dividers */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">لون الحدود والفواصل (Border Color):</label>
                  <span
                    className="w-5 h-5 rounded-full border border-slate-600"
                    style={{ backgroundColor: themeColors.borderColor }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColors.borderColor}
                    onChange={(e) => setThemeColors((prev) => ({ ...prev, borderColor: e.target.value }))}
                    className="w-10 h-10 p-0.5 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={themeColors.borderColor}
                    onChange={(e) => setThemeColors((prev) => ({ ...prev, borderColor: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400">خيارات سريعة:</span>
                  {["#D1D5DB", "#E2E8F0", "#334155", "#243248"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setThemeColors((prev) => ({ ...prev, borderColor: c }))}
                      className="w-4 h-4 rounded-full border border-slate-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Live Visual Preview & Brand Emblem */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  معاينة حية لتناسق الألوان والهوية والخطوط (Cairo):
                </span>
                <span className="text-[11px] text-slate-400">خط Cairo للعربية | Bold للعناوين | Regular للنصوص | Light للتفاصيل</span>
              </div>

              {/* Sample Card */}
              <div
                className="p-5 rounded-xl border transition-all"
                style={{
                  backgroundColor: themeColors.cardBackgroundColor,
                  borderColor: themeColors.borderColor,
                  color: themeColors.textColor,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: themeColors.borderColor }}>
                  {/* Brand Header */}
                  <div className="flex items-center gap-3">
                    <div
                      className="relative flex items-center justify-center w-10 h-10 rounded-xl border shadow-sm shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${themeColors.primaryColor} 0%, #1B365D 100%)`,
                        borderColor: themeColors.secondaryColor,
                        color: themeColors.secondaryColor,
                      }}
                    >
                      <div className="flex flex-col items-center justify-center leading-none">
                        <span className="text-[11px] font-black tracking-tighter">MDO</span>
                        <span className="text-[7px] font-bold">بن زياد</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold tracking-tight" style={{ color: themeColors.textColor }}>
                        مجموعة بن زياد التجارية المتحدة
                      </h4>
                      <p className="text-xs font-light opacity-80">
                        نظام MeDo ERP للمحاسبة والمالية — معاينة هوية SAP Fiori
                      </p>
                    </div>
                  </div>

                  {/* Buttons with Primary and Secondary Gold */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all"
                      style={{ backgroundColor: themeColors.primaryColor }}
                    >
                      زر رئيسي كحلي
                    </button>
                    <span
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border"
                      style={{
                        backgroundColor: `${themeColors.secondaryColor}20`,
                        color: themeColors.secondaryColor,
                        borderColor: `${themeColors.secondaryColor}50`,
                      }}
                    >
                      شارة الهوية الذهبية
                    </span>
                  </div>
                </div>

                {/* Typography Hierarchy Verification */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5">
                    <div className="text-xs font-bold">العنوان (Bold 700)</div>
                    <div className="text-sm font-bold mt-1">سند صرف وقبض معتمد</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5">
                    <div className="text-xs font-bold">النص الأساسي (Regular 400 - 14px)</div>
                    <div className="text-sm font-normal mt-1">تسجيل القيود المحاسبية اليومية بدقة عالية</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5">
                    <div className="text-xs font-bold">التفاصيل (Light 300 - 12px)</div>
                    <div className="text-xs font-light mt-1">تاريخ المعاملة: 2026-09-05 | رقم المرجع: REF-00921</div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB: Signature Settings */}
      {activeTab === "SIGNATURE" && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>✍️</span>
                <span>إعدادات التوقيع الإلكتروني المعتمد للمستندات</span>
              </h3>
              <p className="text-xs text-slate-400">تخصيص التوقيع الافتراضي الذي يظهر تلقائياً على الفواتير، السندات، والتقارير المالية المطبوعة</p>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              حفظ إعدادات التوقيع
            </button>
          </div>

          {saveSuccess && (
            <div className="bg-emerald-950/40 border border-emerald-800/40 p-3.5 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تم حفظ وتعميم إعدادات التوقيع الإلكتروني بنجاح على قاعدة البيانات!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left/Middle section: form inputs */}
            <div className="md:col-span-2 space-y-5">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">نوع التوقيع التلقائي الافتراضي:</label>
                  <p className="text-[11px] text-slate-500">حدد كيف ترغب في إدراج توقيع المسؤول في أسفل المستند المطبوع أو المصدر كـ PDF</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, signatureType: "NONE" })}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all gap-1.5 ${
                        (formData.signatureType || "TEXT") === "NONE"
                          ? "bg-amber-600/10 border-amber-500 text-amber-400 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/50"
                      }`}
                    >
                      <span className="text-lg">✏️</span>
                      <span className="text-xs">توقيع يدوي ورقي</span>
                      <span className="text-[9px] opacity-70">يظهر سطر فارغ للكتابة يدوياً</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, signatureType: "TEXT" })}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all gap-1.5 ${
                        (formData.signatureType || "TEXT") === "TEXT"
                          ? "bg-blue-600/10 border-blue-500 text-blue-400 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/50"
                      }`}
                    >
                      <span className="text-lg">⌨️</span>
                      <span className="text-xs">توقيع نصي رقمي</span>
                      <span className="text-[9px] opacity-70">اسم المسؤول مع وسم أمان معتمد</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, signatureType: "IMAGE" })}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all gap-1.5 ${
                        (formData.signatureType || "TEXT") === "IMAGE"
                          ? "bg-cyan-600/10 border-cyan-500 text-cyan-400 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/50"
                      }`}
                    >
                      <span className="text-lg">🖼️</span>
                      <span className="text-xs">صورة توقيع حقيقية</span>
                      <span className="text-[9px] opacity-70">رفع صورة التوقيع الشخصي الرسمي</span>
                    </button>
                  </div>
                </div>

                {/* Subform: TEXT signature */}
                {(formData.signatureType || "TEXT") === "TEXT" && (
                  <div className="space-y-1.5 pt-3 border-t border-slate-800/60 animate-in fade-in duration-200">
                    <label className="block text-xs font-bold text-slate-300">الاسم والصفة الوظيفية للمسؤول المعتمد:</label>
                    <input
                      type="text"
                      value={formData.signatureText || ""}
                      onChange={(e) => setFormData({ ...formData, signatureText: e.target.value })}
                      placeholder="مثال: المدير العام: م. زياد بدر"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-semibold"
                    />
                    <p className="text-[10px] text-slate-500">سيتم كتابة هذا النص بخط رسمي متميز في حقل التوقيع الإلكتروني أسفل الفواتير والسندات المالية.</p>
                  </div>
                )}

                {/* Subform: IMAGE signature */}
                {(formData.signatureType || "TEXT") === "IMAGE" && (
                  <div className="space-y-3 pt-3 border-t border-slate-800/60 animate-in fade-in duration-200">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">رفع ملف صورة التوقيع:</label>
                      <p className="text-[10px] text-slate-500">يرجى رفع صورة التوقيع بدقة مناسبة. ينصح بشدة برفع صورة ذات خلفية شفافة (PNG) لمظهر رسمي غاية في الأناقة.</p>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({ ...formData, signatureImage: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-slate-300 hover:file:bg-slate-800"
                        />
                        {formData.signatureImage && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, signatureImage: "" })}
                            className="px-3 py-1.5 bg-red-950/40 border border-red-800/40 text-red-400 text-xs rounded-xl hover:bg-red-900/40 whitespace-nowrap active:scale-95 transition-all"
                          >
                            إزالة الصورة
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right section: live interactive preview card */}
            <div className="space-y-4">
              <span className="block text-xs font-bold text-slate-400">معاينة حية لشكل التوقيع في الفواتير:</span>
              
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 min-h-[220px]">
                <div className="text-xs font-bold text-slate-400 pb-2 border-b border-slate-800/60 w-full">
                  حيز التوقيع أسفل المستند المطبوع
                </div>

                <div className="text-[11px] font-bold text-slate-500">
                  توقيع العميل / المدير (إلكتروني)
                </div>

                {(formData.signatureType || "TEXT") === "NONE" && (
                  <div className="text-center font-mono text-slate-600 text-xs tracking-widest pt-4">
                    ___________________
                  </div>
                )}

                {(formData.signatureType || "TEXT") === "TEXT" && (
                  <div className="flex flex-col items-center justify-center space-y-1.5 pt-2">
                    <div className="px-4 py-1.5 rounded-xl bg-white text-slate-950 border border-slate-300 font-mono font-bold text-xs shadow-sm">
                      {formData.signatureText || "المدير العام: م. زياد بدر"}
                    </div>
                    <div className="text-[9px] text-emerald-500 font-bold flex items-center gap-1">
                      <span>🛡️</span>
                      <span>توقيع إلكتروني مؤمن ونشط</span>
                    </div>
                  </div>
                )}

                {(formData.signatureType || "TEXT") === "IMAGE" && (
                  <div className="flex flex-col items-center justify-center space-y-1.5 pt-2">
                    {formData.signatureImage ? (
                      <img
                        src={formData.signatureImage}
                        alt="توقيع المسؤول"
                        className="max-h-16 max-w-[160px] object-contain bg-white p-1 rounded-lg shadow border border-slate-200"
                      />
                    ) : (
                      <div className="px-4 py-3 rounded-xl border border-dashed border-amber-500/30 text-amber-500 font-mono text-[10px] font-bold">
                        لم يتم رفع صورة توقيع بعد
                      </div>
                    )}
                    {formData.signatureImage && (
                      <div className="text-[9px] text-emerald-500 font-bold flex items-center gap-1">
                        <span>🛡️</span>
                        <span>معتمد وموقع الكترونياً</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-bold text-slate-300">💡 نصيحة مهنية:</p>
                <p>يتم مزامنة هذه الإعدادات تلقائياً مع قاعدة البيانات الأساسية، لتظهر على فواتير المبيعات والمشتريات وتفاصيل الحسابات في شاشات الطباعة على الفور وبنفس الهيئة الموضحة أعلاه.</p>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB: Security Audit & Active Sessions */}
      {activeTab === "SECURITY_AUDIT" && (
        <SecuritySessionsAndAuditView currentUser={currentUser} />
      )}
    </div>
  );
};
