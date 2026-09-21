import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  TrendingDown,
  Calculator,
  Filter,
  Search,
  Printer,
  Download,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Info,
  Sliders,
  DollarSign,
  BarChart3,
  CalendarDays,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  X,
  Flame,
} from "lucide-react";
import { FixedAsset, CostCenter, CurrencyCode, CurrencyInfo } from "../types/erp";
import { formatMoney, formatNumberOnly } from "../services/erpStorage";

interface AssetUsefulLifeTimelineProps {
  fixedAssets: FixedAsset[];
  costCenters: CostCenter[];
  currencies: CurrencyInfo[];
  displayCurrency?: CurrencyCode;
  onSelectAssetForDetails?: (asset: FixedAsset) => void;
}

export interface DetailedAssetLife {
  asset: FixedAsset;
  assetCost: number;
  salvageValue: number;
  depreciableCost: number;
  usefulLifeYears: number;
  usefulLifeMonths: number;
  usefulLifeDays: number;
  annualDepRatePct: number;
  monthlyDepRatePct: number;
  annualDepAmount: number;
  monthlyDepAmount: number;
  dailyDepAmount: number;
  purchaseDate: Date;
  purchaseDateStr: string;
  purchaseYear: number;
  endUsefulLifeDate: Date;
  endUsefulLifeStr: string;
  endYear: number;
  elapsedDays: number;
  totalDays: number;
  remainingDays: number;
  elapsedMonths: number;
  remainingMonths: number;
  elapsedYears: number;
  remainingYears: number;
  progressPct: number;
  financialDepPct: number;
  accumulatedDep: number;
  currentBookValue: number;
  remainingDepreciableValue: number;
  phase: "EXPIRED" | "CRITICAL" | "MATURE" | "MID_LIFE" | "NEW";
  phaseLabel: string;
  phaseColor: string;
  isNearExpiry: boolean;
  isFullyDepreciated: boolean;
  yearlySchedule: Array<{
    year: number;
    openingBookValue: number;
    depRatePct: number;
    depAmount: number;
    accumulatedDep: number;
    closingBookValue: number;
    status: "PAST" | "CURRENT" | "FUTURE";
  }>;
}

export const AssetUsefulLifeTimeline: React.FC<AssetUsefulLifeTimelineProps> = ({
  fixedAssets,
  costCenters,
  currencies,
  displayCurrency = "YER_SANAA",
  onSelectAssetForDetails,
}) => {
  // View mode
  const [viewTab, setViewTab] = useState<"GANTT" | "MATRIX" | "CARDS">("GANTT");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedCostCenter, setSelectedCostCenter] = useState<string>("ALL");
  const [selectedPhase, setSelectedPhase] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"REMAINING_LIFE_ASC" | "REMAINING_LIFE_DESC" | "DEP_RATE_DESC" | "PURCHASE_DATE_DESC" | "COST_DESC">("REMAINING_LIFE_ASC");

  // State for expanded asset rows in schedule table
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);

  // State for Modal Drill-down of selected asset schedule
  const [drillDownAsset, setDrillDownAsset] = useState<DetailedAssetLife | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();

  // Helper to extract asset fields
  const getAssetCost = (a: FixedAsset) => a.purchaseCost ?? a.cost ?? 0;
  const getAssetName = (a: FixedAsset) => a.nameAr || a.name || "أصل ثابت";
  const getAssetCode = (a: FixedAsset) => a.code || a.assetCode || "FA-000";

  // Category translation
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "BUILDINGS":
        return "المباني والعقارات";
      case "MACHINERY":
        return "الآلات وخطوط الإنتاج";
      case "VEHICLES":
        return "أسطول السيارات والنقل";
      case "IT_EQUIPMENT":
        return "تقنية المعلومات والخوادم";
      case "FURNITURE":
        return "الأثاث والمفروشات";
      default:
        return category;
    }
  };

  // Comprehensive calculation of Useful Life & Depreciation Timeline for each asset
  const assetsWithLifeDetails = useMemo<DetailedAssetLife[]>(() => {
    return fixedAssets.map((asset) => {
      const cost = getAssetCost(asset);
      const salvage = asset.salvageValue || 0;
      const depreciable = Math.max(0, cost - salvage);
      const lifeYears = Math.max(1, asset.usefulLifeYears || 5);
      const lifeMonths = lifeYears * 12;
      
      // Calculate annual rate %
      const annualDepRatePct = (100 / lifeYears);
      const monthlyDepRatePct = annualDepRatePct / 12;

      const annualDepAmount = asset.annualDepreciation || (depreciable / lifeYears);
      const monthlyDepAmount = annualDepAmount / 12;
      const dailyDepAmount = annualDepAmount / 365;

      const pDate = new Date(asset.purchaseDate || "2023-01-01");
      const pYear = pDate.getFullYear();

      // Estimated end of useful life date
      const endLifeDate = new Date(pDate);
      endLifeDate.setFullYear(pDate.getFullYear() + lifeYears);
      const endYear = endLifeDate.getFullYear();

      // Millisecond differences
      const msPerDay = 1000 * 60 * 60 * 24;
      const totalDays = Math.max(1, Math.round((endLifeDate.getTime() - pDate.getTime()) / msPerDay));
      const elapsedDays = Math.max(0, Math.round((today.getTime() - pDate.getTime()) / msPerDay));
      const remainingDays = Math.max(0, Math.round((endLifeDate.getTime() - today.getTime()) / msPerDay));

      const elapsedMonths = Math.floor(elapsedDays / 30.4375);
      const remainingMonths = Math.floor(remainingDays / 30.4375);
      const elapsedYears = parseFloat((elapsedDays / 365.25).toFixed(1));
      const remainingYears = parseFloat((remainingDays / 365.25).toFixed(1));

      const progressPct = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
      
      const accumDep = asset.accumulatedDepreciation || 0;
      const currentBookValue = asset.bookValue ?? Math.max(salvage, cost - accumDep);
      const remainingDepreciableValue = Math.max(0, currentBookValue - salvage);

      const financialDepPct = depreciable > 0 ? Math.min(100, Math.round((accumDep / depreciable) * 100)) : 100;

      const isFullyDepreciated = remainingDays === 0 || currentBookValue <= salvage || progressPct >= 100;
      const isNearExpiry = !isFullyDepreciated && (remainingDays <= 365 || remainingMonths <= 12);

      let phase: DetailedAssetLife["phase"] = "MID_LIFE";
      let phaseLabel = "منتصف العمر التشغيلي (25% - 75%)";
      let phaseColor = "text-blue-400 bg-blue-500/10 border-blue-500/30";

      if (isFullyDepreciated) {
        phase = "EXPIRED";
        phaseLabel = "مستهلك بالكامل (خردة/تخريد)";
        phaseColor = "text-purple-400 bg-purple-500/10 border-purple-500/30";
      } else if (isNearExpiry) {
        phase = "CRITICAL";
        phaseLabel = "حرج - أقل من سنة متبقية";
        phaseColor = "text-rose-400 bg-rose-500/10 border-rose-500/30";
      } else if (progressPct > 75) {
        phase = "MATURE";
        phaseLabel = "مرحلة التقادم المتقدم (75% - 99%)";
        phaseColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
      } else if (progressPct < 25) {
        phase = "NEW";
        phaseLabel = "حديث الاقتناء (0% - 25%)";
        phaseColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      }

      // Generate Year-by-Year Amortization Schedule
      const yearlySchedule: DetailedAssetLife["yearlySchedule"] = [];
      let runningBookVal = cost;
      let runningAccum = 0;

      for (let y = pYear; y <= endYear; y++) {
        const opening = runningBookVal;
        const depThisYear = Math.min(runningBookVal - salvage, annualDepAmount);
        runningAccum += depThisYear;
        runningBookVal = Math.max(salvage, runningBookVal - depThisYear);

        let yStatus: "PAST" | "CURRENT" | "FUTURE" = "FUTURE";
        if (y < currentYear) {
          yStatus = "PAST";
        } else if (y === currentYear) {
          yStatus = "CURRENT";
        }

        yearlySchedule.push({
          year: y,
          openingBookValue: opening,
          depRatePct: annualDepRatePct,
          depAmount: depThisYear,
          accumulatedDep: runningAccum,
          closingBookValue: runningBookVal,
          status: yStatus,
        });
      }

      return {
        asset,
        assetCost: cost,
        salvageValue: salvage,
        depreciableCost: depreciable,
        usefulLifeYears: lifeYears,
        usefulLifeMonths: lifeMonths,
        usefulLifeDays: totalDays,
        annualDepRatePct,
        monthlyDepRatePct,
        annualDepAmount,
        monthlyDepAmount,
        dailyDepAmount,
        purchaseDate: pDate,
        purchaseDateStr: asset.purchaseDate || "2023-01-01",
        purchaseYear: pYear,
        endUsefulLifeDate: endLifeDate,
        endUsefulLifeStr: endLifeDate.toISOString().slice(0, 10),
        endYear,
        elapsedDays,
        totalDays,
        remainingDays,
        elapsedMonths,
        remainingMonths,
        elapsedYears,
        remainingYears,
        progressPct,
        financialDepPct,
        accumulatedDep: accumDep,
        currentBookValue,
        remainingDepreciableValue,
        phase,
        phaseLabel,
        phaseColor,
        isNearExpiry,
        isFullyDepreciated,
        yearlySchedule,
      };
    });
  }, [fixedAssets, today, currentYear]);

  // Filtered & Sorted Assets
  const filteredAssets = useMemo(() => {
    return assetsWithLifeDetails
      .filter((item) => {
        const name = getAssetName(item.asset).toLowerCase();
        const code = getAssetCode(item.asset).toLowerCase();
        const serial = (item.asset.serialNumber || "").toLowerCase();
        const custodian = (item.asset.custodianName || "").toLowerCase();
        const query = searchQuery.toLowerCase().trim();

        const matchesSearch =
          !query ||
          name.includes(query) ||
          code.includes(query) ||
          serial.includes(query) ||
          custodian.includes(query);

        const matchesCategory = selectedCategory === "ALL" || item.asset.category === selectedCategory;
        const matchesCostCenter = selectedCostCenter === "ALL" || item.asset.costCenterId === selectedCostCenter;
        const matchesPhase = selectedPhase === "ALL" || item.phase === selectedPhase;

        return matchesSearch && matchesCategory && matchesCostCenter && matchesPhase;
      })
      .sort((a, b) => {
        if (sortBy === "REMAINING_LIFE_ASC") return a.remainingDays - b.remainingDays;
        if (sortBy === "REMAINING_LIFE_DESC") return b.remainingDays - a.remainingDays;
        if (sortBy === "DEP_RATE_DESC") return b.annualDepRatePct - a.annualDepRatePct;
        if (sortBy === "PURCHASE_DATE_DESC") return b.purchaseDate.getTime() - a.purchaseDate.getTime();
        if (sortBy === "COST_DESC") return b.assetCost - a.assetCost;
        return 0;
      });
  }, [assetsWithLifeDetails, searchQuery, selectedCategory, selectedCostCenter, selectedPhase, sortBy]);

  // Overall Statistics for Key Performance Metrics
  const stats = useMemo(() => {
    const totalAssets = assetsWithLifeDetails.length;
    if (totalAssets === 0) {
      return {
        avgRemainingYears: 0,
        avgDepRatePct: 0,
        criticalAssetsCount: 0,
        criticalAssetsValue: 0,
        totalHistoricalCost: 0,
        totalRemainingBookVal: 0,
        totalMonthlyDepRate: 0,
      };
    }

    const sumRemainingYears = assetsWithLifeDetails.reduce((sum, a) => sum + a.remainingYears, 0);
    const sumDepRate = assetsWithLifeDetails.reduce((sum, a) => sum + a.annualDepRatePct, 0);
    const criticalAssets = assetsWithLifeDetails.filter((a) => a.isNearExpiry);
    const criticalAssetsValue = criticalAssets.reduce((sum, a) => sum + a.assetCost, 0);
    const totalHistoricalCost = assetsWithLifeDetails.reduce((sum, a) => sum + a.assetCost, 0);
    const totalRemainingBookVal = assetsWithLifeDetails.reduce((sum, a) => sum + a.currentBookValue, 0);
    const totalMonthlyDepRate = assetsWithLifeDetails.reduce((sum, a) => sum + a.monthlyDepAmount, 0);

    return {
      avgRemainingYears: (sumRemainingYears / totalAssets).toFixed(1),
      avgDepRatePct: (sumDepRate / totalAssets).toFixed(1),
      criticalAssetsCount: criticalAssets.length,
      criticalAssetsValue,
      totalHistoricalCost,
      totalRemainingBookVal,
      totalMonthlyDepRate,
    };
  }, [assetsWithLifeDetails]);

  // Timeline Scale Bounds for Gantt Chart (e.g., from min purchase year to max end year)
  const timelineScale = useMemo(() => {
    if (assetsWithLifeDetails.length === 0) {
      return { minYear: 2020, maxYear: 2035, years: [2020, 2025, 2030, 2035] };
    }
    const allP = assetsWithLifeDetails.map((a) => a.purchaseYear);
    const allE = assetsWithLifeDetails.map((a) => a.endYear);
    const minYear = Math.min(currentYear - 4, ...allP);
    const maxYear = Math.max(currentYear + 8, ...allE);

    const years: number[] = [];
    for (let y = minYear; y <= maxYear; y++) {
      years.push(y);
    }

    return { minYear, maxYear, years };
  }, [assetsWithLifeDetails, currentYear]);

  // Helper to calculate CSS left % and width % on the Gantt chart
  const getGanttBarPositions = (item: DetailedAssetLife) => {
    const totalSpanYears = timelineScale.maxYear - timelineScale.minYear + 1;
    const startYearFrac = item.purchaseDate.getFullYear() + item.purchaseDate.getMonth() / 12;
    const endYearFrac = item.endUsefulLifeDate.getFullYear() + item.endUsefulLifeDate.getMonth() / 12;
    const todayFrac = today.getFullYear() + today.getMonth() / 12;

    const leftPct = Math.max(0, Math.min(100, ((startYearFrac - timelineScale.minYear) / totalSpanYears) * 100));
    const fullWidthPct = Math.max(2, Math.min(100 - leftPct, ((endYearFrac - startYearFrac) / totalSpanYears) * 100));

    const elapsedWidthPct = Math.min(100, Math.max(0, ((Math.min(todayFrac, endYearFrac) - startYearFrac) / (endYearFrac - startYearFrac)) * 100));

    return {
      leftPct,
      fullWidthPct,
      elapsedWidthPct,
      todayLinePct: Math.max(0, Math.min(100, ((todayFrac - timelineScale.minYear) / totalSpanYears) * 100)),
    };
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* 1. Header & KPI Lifecycle Intelligence Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
              <Clock className="w-4 h-4" />
              <span>نظام تتبع الأعمار الإنتاجية وجداول الإهلاك الزمني (IAS 16 Useful Life Matrix)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <span>الجدول الزمني للعمر الإنتاجي المتبقي للأصول الثابتة</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono">
                {fixedAssets.length} أصل
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              احتساب العمر الزمني المنقضي والمتبقي، نسب الاستهلاك السنوي الدورية، وتاريخ انتهاء العمر الافتراضي لكل أصل بناءً على تاريخ الشراء ونسبة الإهلاك المعتمدة.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 shadow-sm"
              title="طباعة الجدول الزمني الكامل للأصول"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>طباعة الجدول الزمني</span>
            </button>
          </div>
        </div>

        {/* 4 Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>متوسط العمر المتبقي للمحفظة</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black font-mono text-amber-300">
              {stats.avgRemainingYears}{" "}
              <span className="text-xs font-normal text-slate-400">سنوات</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>محسوب بدقة للأصول المشغلة في مجموعة بن زياد</span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>متوسط نسبة الإهلاك السنوية</span>
              <TrendingDown className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black font-mono text-cyan-300">
              {stats.avgDepRatePct}%{" "}
              <span className="text-xs font-normal text-slate-400">/ سنوياً</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              إجمالي الاستهلاك الشهري:{" "}
              <span className="text-cyan-400 font-mono font-bold">
                {formatMoney(stats.totalMonthlyDepRate, "YER_SANAA", currencies)}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>أصول حرجة للإحلال (&lt; 1 سنة)</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black font-mono text-rose-400 flex items-center gap-2">
              <span>{stats.criticalAssetsCount}</span>
              <span className="text-xs font-normal text-slate-400">أصل حرج</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              تكلفة استثمارية:{" "}
              <span className="text-rose-300 font-mono font-bold">
                {formatMoney(stats.criticalAssetsValue, "YER_SANAA", currencies)}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>صافي القيمة الدفترية المتبقية</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-black font-mono text-emerald-400">
              {formatMoney(stats.totalRemainingBookVal, "YER_SANAA", currencies)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              من أصل تكلفة تاريخية:{" "}
              <span className="text-slate-300 font-mono">
                {formatMoney(stats.totalHistoricalCost, "YER_SANAA", currencies)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Control Bar: Search, Filters, View Modes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs">
        {/* Search & Select Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث بالاسم، الكود، أمين العهدة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">جميع التصنيفات</option>
            <option value="BUILDINGS">المباني والعقارات</option>
            <option value="MACHINERY">الآلات وخطوط الإنتاج</option>
            <option value="VEHICLES">أسطول السيارات والنقل</option>
            <option value="IT_EQUIPMENT">تقنية المعلومات والخوادم</option>
            <option value="FURNITURE">الأثاث والمفروشات</option>
          </select>

          <select
            value={selectedCostCenter}
            onChange={(e) => setSelectedCostCenter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">جميع مراكز التكلفة</option>
            {costCenters.map((cc) => (
              <option key={cc.id} value={cc.id}>
                {cc.code} - {cc.nameAr}
              </option>
            ))}
          </select>

          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">جميع مراحل العمر</option>
            <option value="NEW">حديث الاقتناء (0-25%)</option>
            <option value="MID_LIFE">منتصف العمر (25-75%)</option>
            <option value="MATURE">مرحلة متقدمة (75-99%)</option>
            <option value="CRITICAL">حرج (&lt; 1 سنة متبقية)</option>
            <option value="EXPIRED">مستهلك دفترياً (خردة)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="REMAINING_LIFE_ASC">الأقصر عمراً متبقياً (الأقرب انتهاءً)</option>
            <option value="REMAINING_LIFE_DESC">الأطول عمراً متبقياً</option>
            <option value="DEP_RATE_DESC">نسبة الإهلاك السنوية الأعلى %</option>
            <option value="PURCHASE_DATE_DESC">تاريخ الشراء (الأحدث أولاً)</option>
            <option value="COST_DESC">التكلفة التاريخية (الأعلى أولاً)</option>
          </select>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setViewTab("GANTT")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewTab === "GANTT"
                ? "bg-amber-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>المخطط الزمني البياني (Gantt)</span>
          </button>

          <button
            onClick={() => setViewTab("MATRIX")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewTab === "MATRIX"
                ? "bg-amber-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>جدول المصفوفة السنوية</span>
          </button>

          <button
            onClick={() => setViewTab("CARDS")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewTab === "CARDS"
                ? "bg-amber-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>بطاقات التحليل والتقادم</span>
          </button>
        </div>
      </div>

      {/* 3. VIEW TAB 1: VISUAL GANTT TIMELINE */}
      {viewTab === "GANTT" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>مخطط جانت الزمني للأعمار الإنتاجية ومسار الإهلاك (2020 - 2035+)</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> منقضي
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> متبقي
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-rose-500" /> اليوم ({currentYear})
              </span>
            </div>
          </div>

          {/* Timeline Table Container */}
          <div className="overflow-x-auto">
            <div className="min-w-[900px] space-y-3">
              {/* Year Headers Bar */}
              <div className="grid grid-cols-12 gap-1 text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-2 bg-slate-950/60 p-2 rounded-xl">
                <div className="col-span-4 font-bold text-slate-200">الأصل وبيانات الشراء والإهلاك</div>
                <div className="col-span-8 grid grid-flow-col auto-cols-fr text-center">
                  {timelineScale.years.map((y) => (
                    <div
                      key={y}
                      className={`font-mono text-[10px] ${
                        y === currentYear ? "text-amber-400 font-black underline" : "text-slate-400"
                      }`}
                    >
                      {y}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-2.5">
                {filteredAssets.map((item) => {
                  const { leftPct, fullWidthPct, elapsedWidthPct } = getGanttBarPositions(item);
                  const linkedCC = costCenters.find((c) => c.id === item.asset.costCenterId);

                  return (
                    <div
                      key={item.asset.id}
                      className="grid grid-cols-12 gap-1 items-center p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/40 border border-slate-800/80 transition-all"
                    >
                      {/* Left: Asset info */}
                      <div className="col-span-4 pr-2">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setDrillDownAsset(item)}
                            className="font-bold text-slate-100 hover:text-amber-400 text-xs text-right truncate max-w-[220px] transition-colors"
                          >
                            {getAssetName(item.asset)}
                          </button>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {getAssetCode(item.asset)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                          <span>الشراء: {item.purchaseDateStr}</span>
                          <span>•</span>
                          <span className="text-cyan-400 font-bold">
                            نسبة الإهلاك: {item.annualDepRatePct.toFixed(1)}% / سنة
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                          <span className="text-slate-300">
                            العمر الإجمالي: {item.usefulLifeYears} سنوات
                          </span>
                          <span className={`font-bold ${item.isNearExpiry ? "text-rose-400 font-mono" : "text-amber-300"}`}>
                            المتبقي: {item.remainingYears} سنة ({item.remainingMonths} شهر)
                          </span>
                        </div>
                      </div>

                      {/* Right: Gantt Bar */}
                      <div className="col-span-8 relative h-10 flex items-center bg-slate-900/60 rounded-xl px-2 border border-slate-800/50">
                        {/* The Asset's Full Useful Life Timeline Bar */}
                        <div
                          className="absolute h-6 rounded-lg overflow-hidden border border-slate-700/80 shadow-md group cursor-pointer transition-all hover:scale-[1.01]"
                          style={{
                            right: `${leftPct}%`,
                            width: `${fullWidthPct}%`,
                            minWidth: "40px",
                          }}
                          onClick={() => setDrillDownAsset(item)}
                          title={`الأصل: ${getAssetName(item.asset)}\nتاريخ الشراء: ${item.purchaseDateStr}\nتاريخ الانتهاء: ${item.endUsefulLifeStr}\nالمنقضي: ${item.elapsedYears} سنة (${item.progressPct}%)\nالمتبقي: ${item.remainingYears} سنة\nنسبة الإهلاك: ${item.annualDepRatePct.toFixed(1)}%`}
                        >
                          {/* Elapsed Portion (Progress) */}
                          <div
                            className={`h-full absolute right-0 top-0 transition-all ${
                              item.isNearExpiry
                                ? "bg-gradient-to-l from-rose-500 to-amber-500"
                                : item.isFullyDepreciated
                                ? "bg-gradient-to-l from-purple-600 to-purple-800"
                                : "bg-gradient-to-l from-emerald-500 to-teal-600"
                            }`}
                            style={{ width: `${item.progressPct}%` }}
                          />

                          {/* Remaining Portion (Dashed / Patterned Background) */}
                          <div
                            className="h-full w-full bg-slate-800/90 flex items-center justify-between px-2 text-[10px] font-mono font-bold text-white relative z-10"
                          >
                            <span className="truncate drop-shadow">{item.progressPct}% منقضي</span>
                            <span className="text-amber-300 drop-shadow truncate">
                              متبقي {item.remainingYears} س
                            </span>
                          </div>
                        </div>

                        {/* Start & End Date Tooltip/Badge */}
                        <div
                          className="absolute text-[9px] font-mono text-slate-500 top-0.5"
                          style={{ right: `${leftPct}%` }}
                        >
                          {item.purchaseYear}
                        </div>
                        <div
                          className="absolute text-[9px] font-mono text-slate-500 bottom-0.5"
                          style={{ right: `${leftPct + fullWidthPct - 4}%` }}
                        >
                          {item.endYear}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. VIEW TAB 2: ANNUAL AMORTIZATION MATRIX TABLE */}
      {viewTab === "MATRIX" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>مصفوفة الإهلاك السنوي وجدول استحقاق الأعمار الإنتاجية (Annual Amortization Matrix)</span>
            </div>
            <span className="text-xs text-slate-400">طريقة القسط الثابت المعتمدة (IAS 16)</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 bg-slate-950/80">
                  <th className="py-3 px-3">الأصل والرمز</th>
                  <th className="py-3 px-3">تاريخ الشراء</th>
                  <th className="py-3 px-3 text-left">التكلفة التاريخية</th>
                  <th className="py-3 px-3 text-left">القيمة التخريدية</th>
                  <th className="py-3 px-3 text-center text-cyan-400 font-bold">نسبة الإهلاك السنوية</th>
                  <th className="py-3 px-3 text-center">العمر الإجمالي</th>
                  <th className="py-3 px-3 text-center text-emerald-400">المنقضي</th>
                  <th className="py-3 px-3 text-center text-amber-400 font-bold">العمر المتبقي</th>
                  <th className="py-3 px-3 text-left font-bold text-emerald-300">الدفترية الحالية</th>
                  <th className="py-3 px-3">تاريخ الانتهاء المقدر</th>
                  <th className="py-3 px-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAssets.map((item) => {
                  const isExpanded = expandedAssetId === item.asset.id;

                  return (
                    <React.Fragment key={item.asset.id}>
                      <tr className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-100 block">{getAssetName(item.asset)}</span>
                          <span className="font-mono text-[10px] text-amber-400 block">{getAssetCode(item.asset)}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">{item.purchaseDateStr}</td>
                        <td className="py-3 px-3 text-left font-mono font-bold text-slate-200">
                          {formatNumberOnly(item.assetCost)}
                        </td>
                        <td className="py-3 px-3 text-left font-mono text-slate-400">
                          {formatNumberOnly(item.salvageValue)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-cyan-400 bg-cyan-950/20">
                          {item.annualDepRatePct.toFixed(1)}% / سنة
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-300">
                          {item.usefulLifeYears} سنوات
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-400 font-bold">
                          {item.elapsedYears} س ({item.elapsedMonths} شهر)
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-amber-300 font-black">
                          {item.remainingYears} س ({item.remainingMonths} شهر)
                        </td>
                        <td className="py-3 px-3 text-left font-mono font-bold text-emerald-400">
                          {formatNumberOnly(item.currentBookValue)}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {item.endUsefulLifeStr}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setExpandedAssetId(isExpanded ? null : item.asset.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold transition-all flex items-center gap-1"
                              title="عرض جدول الإهلاك السنوي من سنة الشراء حتى الاستبعاد"
                            >
                              <span>الجدول السنوي</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => setDrillDownAsset(item)}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                              title="تفاصيل الأصل"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Year-by-Year Schedule */}
                      {isExpanded && (
                        <tr className="bg-slate-950/90 border-y-2 border-amber-500/30">
                          <td colSpan={11} className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                                <Sparkles className="w-4 h-4" />
                                <span>
                                  جدول الإهلاك السنوي التاريخي والمستقبلي للأصل [{getAssetName(item.asset)}] بنسبة {item.annualDepRatePct.toFixed(1)}% سنوياً:
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono">
                                القسط السنوي: {formatMoney(item.annualDepAmount, "YER_SANAA", currencies)} / سنة
                              </span>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-slate-800">
                              <table className="w-full text-right text-xs">
                                <thead>
                                  <tr className="text-slate-400 bg-slate-900 border-b border-slate-800">
                                    <th className="py-2 px-3">السنة المالية</th>
                                    <th className="py-2 px-3 text-left">القيمة الدفترية أول المدة</th>
                                    <th className="py-2 px-3 text-center text-cyan-400">نسبة الإهلاك</th>
                                    <th className="py-2 px-3 text-left text-amber-400">قسط إهلاك السنة</th>
                                    <th className="py-2 px-3 text-left text-rose-400">مجمع الإهلاك التراكمي</th>
                                    <th className="py-2 px-3 text-left text-emerald-400">القيمة الدفترية نهاية المدة</th>
                                    <th className="py-2 px-3 text-center">حالة السنة</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                  {item.yearlySchedule.map((row) => (
                                    <tr
                                      key={row.year}
                                      className={`${
                                        row.status === "CURRENT"
                                          ? "bg-amber-500/10 font-bold text-amber-200"
                                          : row.status === "PAST"
                                          ? "opacity-75"
                                          : "text-slate-300"
                                      }`}
                                    >
                                      <td className="py-2 px-3 font-mono font-bold">
                                        {row.year} {row.status === "CURRENT" && "(السنة الحالية)"}
                                      </td>
                                      <td className="py-2 px-3 text-left font-mono">{formatNumberOnly(row.openingBookValue)}</td>
                                      <td className="py-2 px-3 text-center font-mono text-cyan-400">{row.depRatePct.toFixed(1)}%</td>
                                      <td className="py-2 px-3 text-left font-mono text-amber-300">-{formatNumberOnly(row.depAmount)}</td>
                                      <td className="py-2 px-3 text-left font-mono text-rose-400">{formatNumberOnly(row.accumulatedDep)}</td>
                                      <td className="py-2 px-3 text-left font-mono font-bold text-emerald-400">
                                        {formatNumberOnly(row.closingBookValue)}
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        {row.status === "PAST" && (
                                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">منقضية</span>
                                        )}
                                        {row.status === "CURRENT" && (
                                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-black">
                                            السنة الحالية الجارية
                                          </span>
                                        )}
                                        {row.status === "FUTURE" && (
                                          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                                            مستقبلية متوقعة
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. VIEW TAB 3: ASSET LIFECYCLE CARDS */}
      {viewTab === "CARDS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((item) => {
            const linkedCC = costCenters.find((c) => c.id === item.asset.costCenterId);

            return (
              <div
                key={item.asset.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {getAssetCode(item.asset)}
                      </span>
                      <h4 className="font-bold text-white text-sm mt-1">{getAssetName(item.asset)}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {getCategoryLabel(item.asset.category)} • {linkedCC?.nameAr || "مجموعة بن زياد"}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.phaseColor}`}>
                      {item.phaseLabel}
                    </span>
                  </div>

                  {/* Financial & Time Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-3">
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-slate-400">تاريخ الاقتناء</div>
                      <div className="font-mono font-bold text-slate-200 mt-0.5">{item.purchaseDateStr}</div>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-cyan-400 font-bold">نسبة الإهلاك السنوية</div>
                      <div className="font-mono font-black text-cyan-300 mt-0.5">{item.annualDepRatePct.toFixed(1)}% / سنة</div>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-slate-400">العمر الإنتاجي الإجمالي</div>
                      <div className="font-mono font-bold text-slate-200 mt-0.5">{item.usefulLifeYears} سنوات ({item.usefulLifeMonths} شهر)</div>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-amber-400 font-bold">العمر المتبقي الدقيق</div>
                      <div className="font-mono font-black text-amber-300 mt-0.5">{item.remainingYears} سنة ({item.remainingMonths} شهر)</div>
                    </div>
                  </div>

                  {/* Progress Gauge */}
                  <div className="space-y-1.5 pt-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">مؤشر استهلاك العمر التشغيلي:</span>
                      <span className="font-mono font-bold text-amber-400">{item.progressPct}% منقضي</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.isNearExpiry
                            ? "bg-rose-500"
                            : item.progressPct > 75
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${item.progressPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>منقضي: {item.elapsedYears} سنة</span>
                      <span>تاريخ الانتهاء: {item.endUsefulLifeStr}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400 font-mono">
                    الدفترية: <span className="text-emerald-400 font-bold">{formatMoney(item.currentBookValue, "YER_SANAA", currencies)}</span>
                  </div>
                  <button
                    onClick={() => setDrillDownAsset(item)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-white font-bold transition-all flex items-center gap-1 border border-slate-700"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>خطة الإهلاك</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. MODAL: FULL ASSET LIFECYCLE & AMORTIZATION DRILLDOWN */}
      {drillDownAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    بطاقة الجدول الزمني للأصل وخطة الإهلاك السنوية (IAS 16)
                  </h3>
                  <p className="text-xs text-slate-400">
                    [{getAssetCode(drillDownAsset.asset)}] {getAssetName(drillDownAsset.asset)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDrillDownAsset(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto text-xs">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">تاريخ الشراء</div>
                  <div className="font-mono font-bold text-slate-100 text-sm mt-0.5">
                    {drillDownAsset.purchaseDateStr}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-cyan-400 font-bold">نسبة الإهلاك السنوية</div>
                  <div className="font-mono font-black text-cyan-300 text-sm mt-0.5">
                    {drillDownAsset.annualDepRatePct.toFixed(2)}%
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">العمر الإنتاجي المقدر</div>
                  <div className="font-mono font-bold text-slate-100 text-sm mt-0.5">
                    {drillDownAsset.usefulLifeYears} سنوات
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-amber-400 font-bold">العمر المتبقي الدقيق</div>
                  <div className="font-mono font-black text-amber-300 text-sm mt-0.5">
                    {drillDownAsset.remainingYears} سنوات
                  </div>
                </div>
              </div>

              {/* Progress Bar & Milestone Status */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">مسار التقادم الزمني للأصل:</span>
                  <span className="font-mono text-amber-400 font-bold">{drillDownAsset.progressPct}% منقضي</span>
                </div>
                <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-l from-amber-500 to-emerald-500 rounded-full"
                    style={{ width: `${drillDownAsset.progressPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                  <span>تاريخ الشراء: {drillDownAsset.purchaseDateStr}</span>
                  <span>المنقضي: {drillDownAsset.elapsedYears} سنة ({drillDownAsset.elapsedDays} يوم)</span>
                  <span>تاريخ الانتهاء المقدر: {drillDownAsset.endUsefulLifeStr}</span>
                </div>
              </div>

              {/* Year by Year Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">
                    جدول استهلاك القيمة الدفترية والأقساط السنوية حتى انتهاء العمر الإنتاجي:
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    القسط الشهري المقدر: {formatMoney(drillDownAsset.monthlyDepAmount, "YER_SANAA", currencies)}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="text-slate-400 bg-slate-950 border-b border-slate-800">
                        <th className="py-2.5 px-3">السنة المالية</th>
                        <th className="py-2.5 px-3 text-left">الدفترية أول المدة</th>
                        <th className="py-2.5 px-3 text-center text-cyan-400">نسبة الإهلاك</th>
                        <th className="py-2.5 px-3 text-left text-amber-400">قسط السنة</th>
                        <th className="py-2.5 px-3 text-left text-rose-400">مجمع الإهلاك</th>
                        <th className="py-2.5 px-3 text-left text-emerald-400">الدفترية نهاية المدة</th>
                        <th className="py-2.5 px-3 text-center">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {drillDownAsset.yearlySchedule.map((r) => (
                        <tr
                          key={r.year}
                          className={`${
                            r.status === "CURRENT"
                              ? "bg-amber-500/10 font-bold text-amber-200"
                              : r.status === "PAST"
                              ? "opacity-80"
                              : "text-slate-300"
                          }`}
                        >
                          <td className="py-2 px-3 font-mono font-bold">{r.year}</td>
                          <td className="py-2 px-3 text-left font-mono">{formatNumberOnly(r.openingBookValue)}</td>
                          <td className="py-2 px-3 text-center font-mono text-cyan-400">{r.depRatePct.toFixed(1)}%</td>
                          <td className="py-2 px-3 text-left font-mono text-amber-300">-{formatNumberOnly(r.depAmount)}</td>
                          <td className="py-2 px-3 text-left font-mono text-rose-400">{formatNumberOnly(r.accumulatedDep)}</td>
                          <td className="py-2 px-3 text-left font-mono font-bold text-emerald-400">
                            {formatNumberOnly(r.closingBookValue)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {r.status === "PAST" && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">منقضية</span>
                            )}
                            {r.status === "CURRENT" && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-black">
                                السنة الحالية
                              </span>
                            )}
                            {r.status === "FUTURE" && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                                مستقبلية
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-950">
              <button
                onClick={() => setDrillDownAsset(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. PRINT TIMELINE MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Formal Header */}
            <div className="border-b-2 border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">مجموعة بن زياد للمقاولات والتجارة العامة</h2>
                <h3 className="text-base font-bold text-slate-700 mt-0.5">
                  تقرير الجدول الزمني للأعمار الإنتاجية المتبقية ومصفوفة إهلاك الأصول الثابتة
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  تاريخ استخراج التقرير: {new Date().toLocaleDateString("ar-YE")} | المعيار الدولي IAS 16
                </p>
              </div>
              <div className="text-left font-mono text-xs text-slate-600">
                <div>إجمالي الأصول: {fixedAssets.length}</div>
                <div>العملة: ريال يمني (YER)</div>
              </div>
            </div>

            {/* Printable Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                    <th className="p-2 border-l border-slate-300">م</th>
                    <th className="p-2 border-l border-slate-300">رمز الأصل واسمه</th>
                    <th className="p-2 border-l border-slate-300">تاريخ الشراء</th>
                    <th className="p-2 border-l border-slate-300 text-left">التكلفة التاريخية</th>
                    <th className="p-2 border-l border-slate-300 text-center">نسبة الإهلاك</th>
                    <th className="p-2 border-l border-slate-300 text-center">العمر الإجمالي</th>
                    <th className="p-2 border-l border-slate-300 text-center">المنقضي</th>
                    <th className="p-2 border-l border-slate-300 text-center">العمر المتبقي</th>
                    <th className="p-2 border-l border-slate-300 text-left">الدفترية الحالية</th>
                    <th className="p-2">تاريخ الانتهاء المقدر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {assetsWithLifeDetails.map((item, idx) => (
                    <tr key={item.asset.id} className="hover:bg-slate-50">
                      <td className="p-2 border-l border-slate-200 font-mono text-center">{idx + 1}</td>
                      <td className="p-2 border-l border-slate-200 font-bold">
                        {getAssetName(item.asset)}
                        <span className="block font-mono text-[10px] text-slate-500">{getAssetCode(item.asset)}</span>
                      </td>
                      <td className="p-2 border-l border-slate-200 font-mono">{item.purchaseDateStr}</td>
                      <td className="p-2 border-l border-slate-200 text-left font-mono">{formatNumberOnly(item.assetCost)}</td>
                      <td className="p-2 border-l border-slate-200 text-center font-mono font-bold text-cyan-700">
                        {item.annualDepRatePct.toFixed(1)}%
                      </td>
                      <td className="p-2 border-l border-slate-200 text-center font-mono">{item.usefulLifeYears} س</td>
                      <td className="p-2 border-l border-slate-200 text-center font-mono">{item.elapsedYears} س</td>
                      <td className="p-2 border-l border-slate-200 text-center font-mono font-bold text-amber-700">
                        {item.remainingYears} س ({item.remainingMonths} شهر)
                      </td>
                      <td className="p-2 border-l border-slate-200 text-left font-mono font-bold text-emerald-700">
                        {formatNumberOnly(item.currentBookValue)}
                      </td>
                      <td className="p-2 font-mono text-slate-700">{item.endUsefulLifeStr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Block */}
            <div className="pt-8 grid grid-cols-3 text-center text-xs font-bold text-slate-700 border-t border-slate-300">
              <div>
                <p>المحاسب المالي المسؤول</p>
                <div className="h-12 border-b border-dashed border-slate-400 mt-2" />
              </div>
              <div>
                <p>مدير الحسابات والمخازن</p>
                <div className="h-12 border-b border-dashed border-slate-400 mt-2" />
              </div>
              <div>
                <p>المدير المالي العام (CFO)</p>
                <div className="h-12 border-b border-dashed border-slate-400 mt-2" />
              </div>
            </div>

            {/* Print Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl font-bold"
              >
                إغلاق
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة فورية</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetUsefulLifeTimeline;
