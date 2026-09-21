import React, { useState, useEffect, useRef } from "react";
import { TenantIsolationService } from "../services/tenantIsolationService";
import {
  Palette,
  Type,
  Maximize2,
  Minimize2,
  RotateCcw,
  Download,
  Upload,
  Save,
  Check,
  Eye,
  Sliders,
  Sparkles,
  Layers,
  Square,
  Circle,
  Copy,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Sun,
  Moon,
  Info,
  ShieldCheck,
  FileCode,
  Laptop,
  Smartphone,
  Tablet,
  LayoutGrid,
  Search,
  Filter,
} from "lucide-react";
import {
  ThemeConfig,
  PREDEFINED_THEMES,
  FontFamilyChoice,
  ThemeColorConfig,
} from "../types/theme";
import { ThemeManager } from "../services/themeManager";
import { ERPUser } from "../types/erp";

interface ThemeStudioViewProps {
  currentUser?: ERPUser;
  onThemeChanged?: (theme: ThemeConfig) => void;
  displayCurrency?: string;
}

export const ThemeStudioView: React.FC<ThemeStudioViewProps> = ({
  currentUser,
  onThemeChanged,
  displayCurrency = "YER_SANAA",
}) => {
  const [activeTab, setActiveTab] = useState<
    "PRESETS" | "COLORS" | "TYPOGRAPHY" | "SHAPES" | "SPACING" | "JSON"
  >("PRESETS");

  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(() =>
    ThemeManager.getActiveTheme()
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [customThemes, setCustomThemes] = useState<ThemeConfig[]>(() =>
    ThemeManager.getCustomThemes()
  );

  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [categoryFilter, setCategoryFilter] = useState<
    "ALL" | "EXECUTIVE_LIGHT" | "ELEGANT_DARK" | "LUXURY_METALLIC" | "SAP_OFFICIAL" | "ACCESSIBILITY"
  >("ALL");
  const [themeSearchTerm, setThemeSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState<"ALL" | "LIGHT" | "DARK">("ALL");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if current user is admin
  const isAdmin =
    currentUser?.role === "ADMIN" ||
    currentUser?.role === "FINANCIAL_MANAGER" ||
    !currentUser; // default to true if bypassed

  // Synchronize with active theme on mount
  useEffect(() => {
    const active = ThemeManager.getActiveTheme();
    setCurrentTheme(active);
    setJsonInput(JSON.stringify(active, null, 2));
  }, []);

  // Handler for live theme modification
  const handleUpdateTheme = (updated: ThemeConfig, applyLive = true) => {
    setCurrentTheme(updated);
    setJsonInput(JSON.stringify(updated, null, 2));
    if (applyLive) {
      ThemeManager.applyTheme(updated, false); // live preview without permanent persist until user clicks Save
      if (onThemeChanged) onThemeChanged(updated);
    }
  };

  // Color modification helper
  const handleColorChange = (key: keyof ThemeColorConfig, value: string) => {
    const updated: ThemeConfig = {
      ...currentTheme,
      colors: {
        ...currentTheme.colors,
        [key]: value,
      },
    };
    handleUpdateTheme(updated);
  };

  // Preset Selection
  const handleSelectPreset = (preset: ThemeConfig) => {
    const updated: ThemeConfig = {
      ...preset,
      zoomLevel: currentTheme.zoomLevel || 100,
    };
    handleUpdateTheme(updated, true);
  };

  // Zoom handlers
  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.min(Math.max(newZoom, 50), 200);
    const updated: ThemeConfig = {
      ...currentTheme,
      zoomLevel: clamped,
    };
    handleUpdateTheme(updated, true);
  };

  const handleZoomIn = () => handleZoomChange((currentTheme.zoomLevel || 100) + 10);
  const handleZoomOut = () => handleZoomChange((currentTheme.zoomLevel || 100) - 10);
  const handleResetZoom = () => handleZoomChange(100);

  // Save permanent
  const handleSaveAndApply = () => {
    ThemeManager.applyTheme(currentTheme, true);
    if (currentTheme.isCustom) {
      ThemeManager.saveCustomTheme(currentTheme);
      setCustomThemes(ThemeManager.getCustomThemes());
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Reset to default SAP Fiori
  const handleResetToDefault = () => {
    const defaultTheme = ThemeManager.resetToDefault();
    setCurrentTheme(defaultTheme);
    setJsonInput(JSON.stringify(defaultTheme, null, 2));
    if (onThemeChanged) onThemeChanged(defaultTheme);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Export JSON
  const handleExportJSON = () => {
    ThemeManager.exportThemeAsJSON(currentTheme);
  };

  // Import JSON via file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = ThemeManager.importThemeFromJSON(text);
        setCurrentTheme(imported);
        setJsonInput(JSON.stringify(imported, null, 2));
        setCustomThemes(ThemeManager.getCustomThemes());
        setJsonError(null);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } catch (err: any) {
        setJsonError(err.message || "فشل في قراءة ملف الثيم");
      }
    };
    reader.readAsText(file);
  };

  // Apply JSON from code editor
  const handleApplyJsonText = () => {
    try {
      const imported = ThemeManager.importThemeFromJSON(jsonInput);
      setCurrentTheme(imported);
      setCustomThemes(ThemeManager.getCustomThemes());
      setJsonError(null);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setJsonError(err.message || "الرمز المدخل لا يمثل ملف ثيم صالح");
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentTheme, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Banner / Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-transparent rounded-full -translate-x-32 -translate-y-32 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/30">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white tracking-tight">
                    محرر الثيمات والسمات (Theme & Style Studio)
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    SAP Fiori Engine
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  تحكم شامل وفوري في الألوان، الخطوط، شكل الجداول، أبعاد الأزرار والحدود مع نسبة التكبير ودعم الحفظ والتصدير.
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar (Save, Reset, Export, Import, Live Status) */}
          <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-end">
            {/* Zoom Controls Bar */}
            <div className="flex items-center bg-slate-950/90 border border-slate-800 rounded-xl p-1 gap-1 text-xs">
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="تصغير الواجهة (-10%)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-bold text-slate-200 text-[11px] min-w-[44px] text-center">
                {currentTheme.zoomLevel || 100}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="تكبير الواجهة (+10%)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                title="إعادة ضبط التكبير إلى 100%"
              >
                100%
              </button>
            </div>

            {/* Export JSON Button */}
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
              title="تصدير الثيم الحالي كملف JSON"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">تصدير JSON</span>
            </button>

            {/* Import JSON Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
              title="استيراد ثيم من ملف JSON"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">استيراد JSON</span>
            </button>

            {/* Reset to Default Button */}
            <button
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
              title="استعادة إعدادات الثيم الأصلية"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">إعادة الضبط</span>
            </button>

            {/* Save & Apply Button */}
            <button
              onClick={handleSaveAndApply}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>تم الحفظ والتطبيق!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ وتطبيق الثيم</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Access Role & Status notice */}
        <div className="mt-3.5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              صلاحية التخصيص:{" "}
              <strong className="text-emerald-300">
                {isAdmin ? "مدير النظام (Admin) - تحكم كامل" : "مستخدم مالي"}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>الثيم الفعّال:</span>
            <span className="text-amber-300 font-bold">{currentTheme.nameAr}</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300">
              {currentTheme.mode === "light" ? "فاتح (Light)" : "داكن (Dark)"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab("PRESETS")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "PRESETS"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>الثيمات الجاهزة المعتمدة</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-950/60 font-mono">
            {PREDEFINED_THEMES.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("COLORS")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "COLORS"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>الألوان والصبغات (Colors)</span>
        </button>

        <button
          onClick={() => setActiveTab("TYPOGRAPHY")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "TYPOGRAPHY"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Type className="w-4 h-4" />
          <span>الخطوط والطباعة (Typography)</span>
        </button>

        <button
          onClick={() => setActiveTab("SHAPES")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "SHAPES"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Square className="w-4 h-4" />
          <span>زوايا الجداول والحدود والظلال</span>
        </button>

        <button
          onClick={() => setActiveTab("SPACING")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "SPACING"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>الأحجام والتباعد (Sizes & Spacing)</span>
        </button>

        <button
          onClick={() => setActiveTab("JSON")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "JSON"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>محرر JSON والمكتبة</span>
        </button>
      </div>

      {/* Main Studio Body: Grid Layout (Controls Column + Live Interactive Preview Column) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Controls (7 Cols on XL) */}
        <div className="xl:col-span-7 space-y-6">
          {/* TAB 1: PREDEFINED THEMES */}
          {activeTab === "PRESETS" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>مجموعة السمات الحديثة والرسمية (Theme Library)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    اختر من بين {PREDEFINED_THEMES.length} سمة حديثة ورسمية وأنيقة فائقة الوضوح متوافقة مع معايير الحوكمة المالية وSAP Fiori.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                    {PREDEFINED_THEMES.length} سمات متاحة
                  </span>
                </div>
              </div>

              {/* Search & Category Filter Bar */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/90 space-y-2.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={themeSearchTerm}
                      onChange={(e) => setThemeSearchTerm(e.target.value)}
                      placeholder="ابحث بالاسم، اللون أو الطابع (مثال: بلاتينيوم، سويسري، كحلي، Horizon)..."
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    {themeSearchTerm && (
                      <button
                        onClick={() => setThemeSearchTerm("")}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Mode Quick Filter */}
                  <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 shrink-0">
                    <button
                      onClick={() => setModeFilter("ALL")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        modeFilter === "ALL"
                          ? "bg-slate-700 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      الكل
                    </button>
                    <button
                      onClick={() => setModeFilter("LIGHT")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                        modeFilter === "LIGHT"
                          ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Sun className="w-3 h-3" /> فاتح
                    </button>
                    <button
                      onClick={() => setModeFilter("DARK")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                        modeFilter === "DARK"
                          ? "bg-indigo-600 text-white font-bold shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Moon className="w-3 h-3" /> داكن
                    </button>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <button
                    onClick={() => setCategoryFilter("ALL")}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                      categoryFilter === "ALL"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    جميع الفئات
                  </button>
                  <button
                    onClick={() => setCategoryFilter("EXECUTIVE_LIGHT")}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                      categoryFilter === "EXECUTIVE_LIGHT"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    🏛️ تنفيذي ورسمي فاتح
                  </button>
                  <button
                    onClick={() => setCategoryFilter("ELEGANT_DARK")}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                      categoryFilter === "ELEGANT_DARK"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    🌌 داكن وأنيق
                  </button>
                  <button
                    onClick={() => setCategoryFilter("LUXURY_METALLIC")}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                      categoryFilter === "LUXURY_METALLIC"
                        ? "bg-amber-600 text-white shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    👑 فاخر ومعادن ملكية
                  </button>
                  <button
                    onClick={() => setCategoryFilter("SAP_OFFICIAL")}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                      categoryFilter === "SAP_OFFICIAL"
                        ? "bg-sky-600 text-white shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    💎 معايير SAP الرسمية
                  </button>
                  <button
                    onClick={() => setCategoryFilter("ACCESSIBILITY")}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                      categoryFilter === "ACCESSIBILITY"
                        ? "bg-teal-600 text-white shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    👁️ عالي التباين WCAG
                  </button>
                </div>
              </div>

              {/* Grid of Themes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {PREDEFINED_THEMES.filter((theme) => {
                  // Category match
                  if (categoryFilter !== "ALL" && theme.category !== categoryFilter) {
                    return false;
                  }
                  // Mode match
                  if (modeFilter === "LIGHT" && theme.mode !== "light") {
                    return false;
                  }
                  if (modeFilter === "DARK" && theme.mode !== "dark") {
                    return false;
                  }
                  // Search term match
                  if (themeSearchTerm.trim()) {
                    const q = themeSearchTerm.toLowerCase();
                    const matchNameAr = theme.nameAr.toLowerCase().includes(q);
                    const matchNameEn = theme.nameEn.toLowerCase().includes(q);
                    const matchDesc = theme.descriptionAr.toLowerCase().includes(q);
                    const matchBadge = theme.badgeAr?.toLowerCase().includes(q);
                    if (!matchNameAr && !matchNameEn && !matchDesc && !matchBadge) {
                      return false;
                    }
                  }
                  return true;
                }).map((theme) => {
                  const isSelected = currentTheme.id === theme.id;
                  const isLight = theme.mode === "light";
                  return (
                    <div
                      key={theme.id}
                      onClick={() => handleSelectPreset(theme)}
                      className={`relative p-4 rounded-xl border transition-all cursor-pointer text-right group ${
                        isSelected
                          ? "bg-slate-800/95 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/50"
                          : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950/90"
                      }`}
                    >
                      {/* Active Status Badge */}
                      {isSelected && (
                        <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" /> نشط حالياً
                        </span>
                      )}

                      {/* Header row: Badge + Mode indicator */}
                      <div className="flex items-center gap-2 mb-1.5 pr-0.5">
                        {theme.badgeAr && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isSelected
                              ? "bg-emerald-950/80 border-emerald-600 text-emerald-300"
                              : isLight
                              ? "bg-blue-950/60 border-blue-800/60 text-blue-300"
                              : "bg-indigo-950/60 border-indigo-800/60 text-indigo-300"
                          }`}>
                            {theme.badgeAr}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          {isLight ? (
                            <span className="text-amber-400 flex items-center gap-0.5"><Sun className="w-3 h-3" /> فاتح</span>
                          ) : (
                            <span className="text-indigo-400 flex items-center gap-0.5"><Moon className="w-3 h-3" /> داكن</span>
                          )}
                        </span>
                      </div>

                      {/* Theme Title */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                          {theme.nameAr}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3 line-clamp-2">
                        {theme.descriptionAr}
                      </p>

                      {/* Live Mini Preview Bar */}
                      <div className="mb-3 p-1.5 rounded-lg border border-slate-800/90 flex items-center justify-between" style={{ backgroundColor: theme.colors.backgroundColor }}>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="px-2 py-0.5 rounded text-[10px] font-bold shadow-sm"
                            style={{
                              backgroundColor: theme.colors.primaryColor,
                              color: theme.colors.primaryColorText,
                            }}
                          >
                            زر رئيسي
                          </div>
                          <div
                            className="px-1.5 py-0.5 rounded text-[10px] border"
                            style={{
                              backgroundColor: theme.colors.cardBackgroundColor,
                              color: theme.colors.textColor,
                              borderColor: theme.colors.borderColor,
                            }}
                          >
                            بطاقة
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: theme.colors.secondaryColor }}
                            title="ثانوي"
                          />
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: theme.colors.successColor }}
                            title="نجاح"
                          />
                        </div>
                      </div>

                      {/* Color Palette Chips & Font Info */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                            style={{ backgroundColor: theme.colors.primaryColor }}
                            title={`الرئيسي: ${theme.colors.primaryColor}`}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                            style={{ backgroundColor: theme.colors.secondaryColor }}
                            title={`الثانوي: ${theme.colors.secondaryColor}`}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                            style={{ backgroundColor: theme.colors.backgroundColor }}
                            title={`الخلفية: ${theme.colors.backgroundColor}`}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                            style={{ backgroundColor: theme.colors.cardBackgroundColor }}
                            title={`البطاقة: ${theme.colors.cardBackgroundColor}`}
                          />
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {theme.typography.fontFamily}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Saved Themes Section */}
              {customThemes.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-amber-300">السمات المخصصة المحفوظة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customThemes.map((ct) => (
                      <div
                        key={ct.id}
                        onClick={() => handleSelectPreset(ct)}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{ct.nameAr}</div>
                          <div className="text-[10px] text-slate-400">{ct.descriptionAr || "ثيم مخصص"}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            ThemeManager.deleteCustomTheme(ct.id);
                            setCustomThemes(ThemeManager.getCustomThemes());
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                          title="حذف الثيم"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COLOR CONTROLS */}
          {activeTab === "COLORS" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-emerald-400" />
                    <span>التحكم الدقيق بمنظومة الألوان (Color Palette Engine)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    اختر اللون المطلوب مباشرة أو أدخل كود HEX للتطبيق الفوري عبر CSS Variables.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">النمط العام:</span>
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() =>
                        handleUpdateTheme({
                          ...currentTheme,
                          mode: "dark",
                          colors: {
                            ...currentTheme.colors,
                            backgroundColor: "#020617",
                            cardBackgroundColor: "#0f172a",
                            textColor: "#f8fafc",
                            secondaryTextColor: "#94a3b8",
                            borderColor: "#1e293b",
                          },
                        })
                      }
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                        currentTheme.mode === "dark"
                          ? "bg-slate-800 text-amber-400 font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>داكن</span>
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateTheme({
                          ...currentTheme,
                          mode: "light",
                          colors: {
                            ...currentTheme.colors,
                            backgroundColor: "#f8fafc",
                            cardBackgroundColor: "#ffffff",
                            textColor: "#0f172a",
                            secondaryTextColor: "#64748b",
                            borderColor: "#e2e8f0",
                          },
                        })
                      }
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                        currentTheme.mode === "light"
                          ? "bg-slate-800 text-amber-400 font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>فاتح</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Color Pickers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Color */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      اللون الرئيسي (Primary Color)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentTheme.colors.primaryColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentTheme.colors.primaryColor}
                      onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={currentTheme.colors.primaryColor}
                      onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      اللون الثانوي (Secondary Color)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentTheme.colors.secondaryColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentTheme.colors.secondaryColor}
                      onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={currentTheme.colors.secondaryColor}
                      onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>

                {/* Page Background */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      لون خلفية الصفحة (Background)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentTheme.colors.backgroundColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentTheme.colors.backgroundColor}
                      onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={currentTheme.colors.backgroundColor}
                      onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>

                {/* Card / Surface Background */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      لون البطاقات والقوائم (Card Surface)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentTheme.colors.cardBackgroundColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentTheme.colors.cardBackgroundColor}
                      onChange={(e) => handleColorChange("cardBackgroundColor", e.target.value)}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={currentTheme.colors.cardBackgroundColor}
                      onChange={(e) => handleColorChange("cardBackgroundColor", e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>

                {/* Primary Text Color */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      لون النص الأساسي (Text Color)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentTheme.colors.textColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentTheme.colors.textColor}
                      onChange={(e) => handleColorChange("textColor", e.target.value)}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={currentTheme.colors.textColor}
                      onChange={(e) => handleColorChange("textColor", e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>

                {/* Secondary Text Color */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      لون النص الثانوي (Secondary Text)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentTheme.colors.secondaryTextColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentTheme.colors.secondaryTextColor}
                      onChange={(e) => handleColorChange("secondaryTextColor", e.target.value)}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={currentTheme.colors.secondaryTextColor}
                      onChange={(e) => handleColorChange("secondaryTextColor", e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>

                {/* Border Color */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      لون الحدود والفواصل (Border Color)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentTheme.colors.borderColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentTheme.colors.borderColor}
                      onChange={(e) => handleColorChange("borderColor", e.target.value)}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={currentTheme.colors.borderColor}
                      onChange={(e) => handleColorChange("borderColor", e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>

                {/* Link & Accent Color */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      لون الروابط والتأكيد (Link & Accent)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentTheme.colors.linkColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentTheme.colors.linkColor}
                      onChange={(e) => handleColorChange("linkColor", e.target.value)}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={currentTheme.colors.linkColor}
                      onChange={(e) => handleColorChange("linkColor", e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>

                {/* Warning Color */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      لون التحذيرات (Warning Color)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentTheme.colors.warningColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentTheme.colors.warningColor}
                      onChange={(e) => handleColorChange("warningColor", e.target.value)}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={currentTheme.colors.warningColor}
                      onChange={(e) => handleColorChange("warningColor", e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>

                {/* Error Color */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      لون الأخطاء والمديونيات (Error Color)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentTheme.colors.errorColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentTheme.colors.errorColor}
                      onChange={(e) => handleColorChange("errorColor", e.target.value)}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={currentTheme.colors.errorColor}
                      onChange={(e) => handleColorChange("errorColor", e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TYPOGRAPHY CONTROLS */}
          {activeTab === "TYPOGRAPHY" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              <div className="pb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Type className="w-4 h-4 text-emerald-400" />
                  <span>التحكم بالخطوط والطباعة العربية (Typography Settings)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  اختر الخط العربي المناسب لمؤسستك مع التحكم بحجم النصوص الأساسية ومقياس العناوين وتباعد الأسطر.
                </p>
              </div>

              {/* Font Family Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200">نوع الخط الأساسي (Font Family)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      { id: "IBM Plex Sans Arabic", name: "IBM Plex Arabic (المعتمد)" },
                      { id: "Cairo", name: "Cairo (القاهرة)" },
                      { id: "Tajawal", name: "Tajawal (تجوال)" },
                      { id: "Almarai", name: "Almarai (المراعي)" },
                      { id: "Readex Pro", name: "Readex Pro (ريدكس)" },
                      { id: "Alexandria", name: "Alexandria (الإسكندرية)" },
                      { id: "Amiri", name: "Amiri (الأميري التراثي)" },
                      { id: "Arial", name: "Arial (كلاسيكي)" },
                      { id: "system-ui", name: "خط النظام الافتراضي" },
                    ] as { id: FontFamilyChoice; name: string }[]
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() =>
                        handleUpdateTheme({
                          ...currentTheme,
                          typography: {
                            ...currentTheme.typography,
                            fontFamily: f.id,
                          },
                        })
                      }
                      style={{ fontFamily: `'${f.id}', sans-serif` }}
                      className={`p-3 rounded-xl border text-right transition-all ${
                        currentTheme.typography.fontFamily === f.id
                          ? "bg-emerald-950/70 border-emerald-500 text-emerald-300 font-bold"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-xs">{f.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">تجربة نصية 123</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders (Base Font Size, Heading Scale, Line Height) */}
              <div className="space-y-4 pt-2">
                {/* Base Font Size Slider */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">حجم الخط الأساسي (Base Font Size)</span>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      {currentTheme.typography.baseFontSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="22"
                    step="1"
                    value={currentTheme.typography.baseFontSize}
                    onChange={(e) =>
                      handleUpdateTheme({
                        ...currentTheme,
                        typography: {
                          ...currentTheme.typography,
                          baseFontSize: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>12px (مضغوط)</span>
                    <span>14px (افتراضي)</span>
                    <span>22px (كبير جداً)</span>
                  </div>
                </div>

                {/* Heading Scale Slider */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">مقياس حجم العناوين (Heading Scale)</span>
                    <span className="font-mono font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                      {currentTheme.typography.headingScale}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.1"
                    max="1.75"
                    step="0.05"
                    value={currentTheme.typography.headingScale}
                    onChange={(e) =>
                      handleUpdateTheme({
                        ...currentTheme,
                        typography: {
                          ...currentTheme.typography,
                          headingScale: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1.1x (متناسق)</span>
                    <span>1.25x (قياسي)</span>
                    <span>1.75x (عناوين بارزة)</span>
                  </div>
                </div>

                {/* Line Height Slider */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">تباعد الأسطر (Line Height)</span>
                    <span className="font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                      {currentTheme.typography.lineHeight}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.3"
                    max="2.0"
                    step="0.05"
                    value={currentTheme.typography.lineHeight}
                    onChange={(e) =>
                      handleUpdateTheme({
                        ...currentTheme,
                        typography: {
                          ...currentTheme.typography,
                          lineHeight: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1.3 (متقارب)</span>
                    <span>1.5 (متوازن)</span>
                    <span>2.0 (واسع)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SHAPES & BORDERS */}
          {activeTab === "SHAPES" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              <div className="pb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Square className="w-4 h-4 text-emerald-400" />
                  <span>التحكم بزوايا الجداول والبطاقات والأزرار (Shapes & Corners)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  حدد درجة استدارة الزوايا لعناصر النظام مع التحكم بسمك الحدود والظلال.
                </p>
              </div>

              {/* Table Corners */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200">
                  شكل زوايا الجداول (Table Corners)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "square", name: "مربعة (بدون زوايا)" },
                    { id: "rounded-sm", name: "دائرية بسيطة (6px)" },
                    { id: "rounded-md", name: "دائرية متوسطة (12px)" },
                    { id: "rounded-lg", name: "دائرية واسعة (18px)" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() =>
                        handleUpdateTheme({
                          ...currentTheme,
                          shapes: {
                            ...currentTheme.shapes,
                            tableCorners: c.id as any,
                          },
                        })
                      }
                      className={`p-3 rounded-xl border text-center text-xs transition-all ${
                        currentTheme.shapes.tableCorners === c.id
                          ? "bg-emerald-950/70 border-emerald-500 text-emerald-300 font-bold"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Corners */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200">
                  شكل زوايا الأزرار (Button Corners)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "square", name: "مربعة (0px)" },
                    { id: "rounded-sm", name: "دائرية بسيطة (6px)" },
                    { id: "rounded-md", name: "دائرية قياسية (12px)" },
                    { id: "pill", name: "كبسولة دائرية (Pill)" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() =>
                        handleUpdateTheme({
                          ...currentTheme,
                          shapes: {
                            ...currentTheme.shapes,
                            buttonCorners: c.id as any,
                          },
                        })
                      }
                      className={`p-3 rounded-xl border text-center text-xs transition-all ${
                        currentTheme.shapes.buttonCorners === c.id
                          ? "bg-emerald-950/70 border-emerald-500 text-emerald-300 font-bold"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Corners */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200">
                  شكل زوايا البطاقات والحاويات (Card Corners)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "square", name: "مربعة (0px)" },
                    { id: "rounded-sm", name: "بسيطة (8px)" },
                    { id: "rounded-md", name: "متوسطة (14px)" },
                    { id: "rounded-lg", name: "كبيرة فاخرة (20px)" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() =>
                        handleUpdateTheme({
                          ...currentTheme,
                          shapes: {
                            ...currentTheme.shapes,
                            cardCorners: c.id as any,
                          },
                        })
                      }
                      className={`p-3 rounded-xl border text-center text-xs transition-all ${
                        currentTheme.shapes.cardCorners === c.id
                          ? "bg-emerald-950/70 border-emerald-500 text-emerald-300 font-bold"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Width & Shadow Intensity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Border Width */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">سمك الحدود (Border Width)</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {currentTheme.shapes.borderWidth}px
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {[0, 1, 2, 3].map((bw) => (
                      <button
                        key={bw}
                        onClick={() =>
                          handleUpdateTheme({
                            ...currentTheme,
                            shapes: {
                              ...currentTheme.shapes,
                              borderWidth: bw,
                            },
                          })
                        }
                        className={`py-1.5 text-xs rounded-lg border font-mono ${
                          currentTheme.shapes.borderWidth === bw
                            ? "bg-emerald-600 text-white border-emerald-500 font-bold"
                            : "bg-slate-900 border-slate-800 text-slate-300"
                        }`}
                      >
                        {bw}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shadow Intensity */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">كثافة الظلال (Shadow Depth)</span>
                    <span className="font-mono font-bold text-sky-400">
                      {currentTheme.shapes.shadowIntensity}
                    </span>
                  </div>
                  <select
                    value={currentTheme.shapes.shadowIntensity}
                    onChange={(e) =>
                      handleUpdateTheme({
                        ...currentTheme,
                        shapes: {
                          ...currentTheme.shapes,
                          shadowIntensity: e.target.value as any,
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  >
                    <option value="none">بدون ظل (Flat None)</option>
                    <option value="subtle">ظل خفيف ناعم (Subtle)</option>
                    <option value="medium">ظل متوسط قياسي (Medium)</option>
                    <option value="intense">ظل عميق ثلاثي الأبعاد (Intense)</option>
                    <option value="neon">توهج نيون مستقبلي (Neon Glow)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SIZES & SPACING */}
          {activeTab === "SPACING" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              <div className="pb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>التحكم بأحجام العناصر والتباعد العام (Sizes & Density)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  خصص أحجام الأزرار، حقول الإدخال، وكثافة عرض البيانات لتناسب تفضيلات العمل اليومي.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Button Size */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-200">
                    حجم الأزرار الافتراضي (Button Size)
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: "compact", name: "صغير مضغوط (Compact 28px)" },
                      { id: "default", name: "متوسط قياسي (Standard 36px)" },
                      { id: "large", name: "كبير (Large 44px)" },
                      { id: "xlarge", name: "كبير جداً للمس (X-Large 52px)" },
                    ].map((bs) => (
                      <button
                        key={bs.id}
                        onClick={() =>
                          handleUpdateTheme({
                            ...currentTheme,
                            spacing: {
                              ...currentTheme.spacing,
                              buttonSize: bs.id as any,
                            },
                          })
                        }
                        className={`w-full p-2 text-right rounded-lg border text-xs transition-all ${
                          currentTheme.spacing.buttonSize === bs.id
                            ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        {bs.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Size */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-200">
                    حجم حقول الإدخال (Input Field Size)
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: "compact", name: "صغير مضغوط (Compact 30px)" },
                      { id: "default", name: "متوسط قياسي (Default 38px)" },
                      { id: "large", name: "كبير واسع (Large 46px)" },
                    ].map((is) => (
                      <button
                        key={is.id}
                        onClick={() =>
                          handleUpdateTheme({
                            ...currentTheme,
                            spacing: {
                              ...currentTheme.spacing,
                              inputSize: is.id as any,
                            },
                          })
                        }
                        className={`w-full p-2 text-right rounded-lg border text-xs transition-all ${
                          currentTheme.spacing.inputSize === is.id
                            ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        {is.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* General Spacing Density */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-200">
                  كثافة التباعد العام في الصفحات (Overall Page Spacing)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "compact", name: "مضغوط (لشاشات المحاسبين)" },
                    { id: "standard", name: "متوازن (قياسي SAP)" },
                    { id: "spacious", name: "رحب ومريح (Spacious)" },
                  ].map((sd) => (
                    <button
                      key={sd.id}
                      onClick={() =>
                        handleUpdateTheme({
                          ...currentTheme,
                          spacing: {
                            ...currentTheme.spacing,
                            spacingDensity: sd.id as any,
                          },
                        })
                      }
                      className={`p-3 text-center rounded-xl border text-xs transition-all ${
                        currentTheme.spacing.spacingDensity === sd.id
                          ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-300"
                      }`}
                    >
                      {sd.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: JSON & CODE EDITOR */}
          {activeTab === "JSON" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span>محرر كود JSON واستيراد الثيمات البرمجية</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    يمكنك تعديل كود الثيم يدوياً، نسخه، أو لصق ثيم خارجي وتطبيقه مباشرة.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ JSON</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleApplyJsonText}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    تطبيق الرمز
                  </button>
                </div>
              </div>

              {jsonError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <XCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{jsonError}</span>
                </div>
              )}

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                dir="ltr"
                rows={16}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 leading-relaxed resize-y"
                placeholder="{ ... Theme JSON ... }"
              />
            </div>
          )}
        </div>

        {/* Right Column: LIVE INTERACTIVE PREVIEW (5 Cols on XL) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="sticky top-20">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <h3 className="text-xs font-bold text-white">
                    المعاينة الحية الفورية (Live Interactive Preview)
                  </h3>
                </div>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-lg ${
                      previewDevice === "desktop"
                        ? "bg-slate-800 text-emerald-400"
                        : "text-slate-400"
                    }`}
                    title="معاينة شاشة المكتب"
                  >
                    <Laptop className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("tablet")}
                    className={`p-1.5 rounded-lg ${
                      previewDevice === "tablet"
                        ? "bg-slate-800 text-emerald-400"
                        : "text-slate-400"
                    }`}
                    title="معاينة الأجهزة اللوحية"
                  >
                    <Tablet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-lg ${
                      previewDevice === "mobile"
                        ? "bg-slate-800 text-emerald-400"
                        : "text-slate-400"
                    }`}
                    title="معاينة الهاتف"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic Live Container styled with active theme variables */}
              <div
                className={`space-y-4 p-4 rounded-xl border transition-all overflow-hidden ${
                  previewDevice === "mobile"
                    ? "max-w-xs mx-auto"
                    : previewDevice === "tablet"
                    ? "max-w-md mx-auto"
                    : "w-full"
                }`}
                style={{
                  backgroundColor: currentTheme.colors.backgroundColor,
                  color: currentTheme.colors.textColor,
                  borderColor: currentTheme.colors.borderColor,
                  fontFamily: `'${currentTheme.typography.fontFamily}', sans-serif`,
                  borderRadius: ThemeManager.getRadiusValue(currentTheme.shapes.cardCorners),
                  boxShadow: ThemeManager.getShadowValue(currentTheme.shapes.shadowIntensity),
                }}
              >
                {/* Mock Card Header */}
                <div
                  className="p-3.5 rounded-xl border flex items-center justify-between"
                  style={{
                    backgroundColor: currentTheme.colors.cardBackgroundColor,
                    borderColor: currentTheme.colors.borderColor,
                    borderRadius: ThemeManager.getRadiusValue(currentTheme.shapes.cardCorners),
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                      style={{
                        backgroundColor: currentTheme.colors.primaryColor,
                        color: currentTheme.colors.primaryColorText,
                        borderRadius: ThemeManager.getRadiusValue(currentTheme.shapes.buttonCorners),
                      }}
                    >
                      ERP
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: currentTheme.colors.textColor }}>
                        {TenantIsolationService.getActiveTenantDetails()?.nameAr || "المنشأة المعتمدة"}
                      </div>
                      <div className="text-[10px]" style={{ color: currentTheme.colors.secondaryTextColor }}>
                        نظام MeDo المحاسبي
                      </div>
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 text-[10px] font-bold rounded-full"
                    style={{
                      backgroundColor: `${currentTheme.colors.primaryColor}25`,
                      color: currentTheme.colors.primaryColor,
                      borderColor: currentTheme.colors.primaryColor,
                    }}
                  >
                    مباشر
                  </span>
                </div>

                {/* Mock KPI Stat Cards */}
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="p-3 rounded-xl border"
                    style={{
                      backgroundColor: currentTheme.colors.cardBackgroundColor,
                      borderColor: currentTheme.colors.borderColor,
                      borderRadius: ThemeManager.getRadiusValue(currentTheme.shapes.cardCorners),
                    }}
                  >
                    <div className="text-[10px]" style={{ color: currentTheme.colors.secondaryTextColor }}>
                      إجمالي الأصول (Assets)
                    </div>
                    <div
                      className="text-sm font-black font-mono mt-0.5"
                      style={{ color: currentTheme.colors.primaryColor }}
                    >
                      48,500,000 ر.ي
                    </div>
                  </div>

                  <div
                    className="p-3 rounded-xl border"
                    style={{
                      backgroundColor: currentTheme.colors.cardBackgroundColor,
                      borderColor: currentTheme.colors.borderColor,
                      borderRadius: ThemeManager.getRadiusValue(currentTheme.shapes.cardCorners),
                    }}
                  >
                    <div className="text-[10px]" style={{ color: currentTheme.colors.secondaryTextColor }}>
                      صافي الأرباح (Profit)
                    </div>
                    <div
                      className="text-sm font-black font-mono mt-0.5"
                      style={{ color: currentTheme.colors.secondaryColor }}
                    >
                      +12,450,000 ر.ي
                    </div>
                  </div>
                </div>

                {/* Mock Data Table */}
                <div
                  className="border overflow-hidden"
                  style={{
                    backgroundColor: currentTheme.colors.cardBackgroundColor,
                    borderColor: currentTheme.colors.borderColor,
                    borderRadius: ThemeManager.getRadiusValue(currentTheme.shapes.tableCorners),
                  }}
                >
                  <div
                    className="px-3 py-2 border-b text-[11px] font-bold flex items-center justify-between"
                    style={{
                      borderColor: currentTheme.colors.borderColor,
                      backgroundColor: `${currentTheme.colors.primaryColor}15`,
                    }}
                  >
                    <span>أحدث العمليات المحاسبية</span>
                    <span className="text-[10px] font-mono opacity-80">جدول ديناميكي</span>
                  </div>

                  <div className="divide-y text-[11px]" style={{ borderColor: currentTheme.colors.borderColor }}>
                    <div className="p-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold">فاتورة مبيعات #INV-2026-089</div>
                        <div className="text-[9px]" style={{ color: currentTheme.colors.secondaryTextColor }}>
                          العميل: شركة الأمل للتجارة
                        </div>
                      </div>
                      <div className="text-left font-mono font-bold" style={{ color: currentTheme.colors.primaryColor }}>
                        +850,000 ر.ي
                      </div>
                    </div>

                    <div className="p-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold">سند صرف #PV-2026-042</div>
                        <div className="text-[9px]" style={{ color: currentTheme.colors.secondaryTextColor }}>
                          المورد: مؤسسة البركة للاستيراد
                        </div>
                      </div>
                      <div className="text-left font-mono font-bold" style={{ color: currentTheme.colors.errorColor }}>
                        -320,000 ر.ي
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sample Buttons & Inputs */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="حقل إدخال نموذجي..."
                      readOnly
                      className="flex-1 px-3 py-1.5 text-xs border outline-none"
                      style={{
                        backgroundColor: currentTheme.colors.backgroundColor,
                        color: currentTheme.colors.textColor,
                        borderColor: currentTheme.colors.borderColor,
                        borderRadius: ThemeManager.getRadiusValue(currentTheme.shapes.buttonCorners),
                        borderWidth: `${currentTheme.shapes.borderWidth}px`,
                      }}
                    />
                    <button
                      className="px-3 py-1.5 text-xs font-bold transition-transform active:scale-95"
                      style={{
                        backgroundColor: currentTheme.colors.primaryColor,
                        color: currentTheme.colors.primaryColorText,
                        borderRadius: ThemeManager.getRadiusValue(currentTheme.shapes.buttonCorners),
                      }}
                    >
                      إضافة
                    </button>
                  </div>

                  {/* Button Palette Variety */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      className="px-2.5 py-1 text-[10px] font-bold"
                      style={{
                        backgroundColor: currentTheme.colors.secondaryColor,
                        color: "#000000",
                        borderRadius: ThemeManager.getRadiusValue(currentTheme.shapes.buttonCorners),
                      }}
                    >
                      زر ثانوي
                    </button>

                    <button
                      className="px-2.5 py-1 text-[10px] font-bold border"
                      style={{
                        borderColor: currentTheme.colors.borderColor,
                        color: currentTheme.colors.textColor,
                        borderRadius: ThemeManager.getRadiusValue(currentTheme.shapes.buttonCorners),
                      }}
                    >
                      زر شفاف
                    </button>

                    <button
                      className="px-2.5 py-1 text-[10px] font-bold"
                      style={{
                        backgroundColor: currentTheme.colors.warningColor,
                        color: "#000000",
                        borderRadius: ThemeManager.getRadiusValue(currentTheme.shapes.buttonCorners),
                      }}
                    >
                      تنبيه
                    </button>

                    <button
                      className="px-2.5 py-1 text-[10px] font-bold"
                      style={{
                        backgroundColor: currentTheme.colors.errorColor,
                        color: "#ffffff",
                        borderRadius: ThemeManager.getRadiusValue(currentTheme.shapes.buttonCorners),
                      }}
                    >
                      إلغاء / تراجع
                    </button>
                  </div>
                </div>

                {/* Sample Alert Notice */}
                <div
                  className="p-2.5 border text-[11px] flex items-center gap-2"
                  style={{
                    backgroundColor: `${currentTheme.colors.successColor}15`,
                    borderColor: `${currentTheme.colors.successColor}40`,
                    color: currentTheme.colors.successColor,
                    borderRadius: ThemeManager.getRadiusValue(currentTheme.shapes.cardCorners),
                  }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>تم تطبيق معايير السمة الحالية بنجاح عبر النظام بالكامل.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
