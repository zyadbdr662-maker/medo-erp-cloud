import React, { useState, useMemo } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  FileCheck,
  FileDown,
  FileSpreadsheet,
  Filter,
  Layers,
  PieChart,
  Printer,
  RefreshCw,
  Scale,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Vault,
  Wallet,
  X,
} from "lucide-react";
import {
  Account,
  BankAccountItem,
  CashVaultItem,
  CurrencyCode,
  CurrencyInfo,
  FixedAsset,
  Invoice,
  JournalEntry,
  Voucher,
} from "../types/erp";
import {
  CashFlowEngine,
  CashFlowFilterOptions,
  CashFlowStatementResult,
  CashMovementLine,
} from "../services/cashFlowEngine";
import { formatMoney, formatNumberOnly } from "../services/erpStorage";
import { TenantIsolationService } from "../services/tenantIsolationService";
import { formatCalendarDate, formatDualDate, getActiveCalendarType } from "../utils/calendarUtils";
import { exportElementToPdf, getTodayFormattedDate } from "../services/pdfExporter";

interface CashFlowStatementGeneratorProps {
  accounts: Account[];
  journalEntries: JournalEntry[];
  vouchers: Voucher[];
  cashVaults: CashVaultItem[];
  bankAccounts: BankAccountItem[];
  invoices?: Invoice[];
  fixedAssets?: FixedAsset[];
  branches?: { id: string; nameAr: string; code: string }[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  onOpenAi?: () => void;
  onShareReport?: (data: any) => void;
  initialFiscalYear?: string;
}

export const CashFlowStatementGenerator: React.FC<CashFlowStatementGeneratorProps> = ({
  accounts,
  journalEntries,
  vouchers,
  cashVaults,
  bankAccounts,
  invoices = [],
  fixedAssets = [],
  branches = [],
  currencies,
  displayCurrency: propDisplayCurrency,
  onOpenAi,
  onShareReport,
  initialFiscalYear = "2026",
}) => {
  const companyMeta = TenantIsolationService.getActiveTenantDetails();
  // Method State: Direct Method (الطريقة المباشرة) vs Indirect Method (الطريقة غير المباشرة)
  const [method, setMethod] = useState<"DIRECT" | "INDIRECT">("DIRECT");
  const [fiscalYear, setFiscalYear] = useState(initialFiscalYear);
  const [dateRangePreset, setDateRangePreset] = useState<"YEAR" | "Q1" | "Q2" | "Q3" | "Q4" | "MONTH" | "CUSTOM">("YEAR");
  const [customStartDate, setCustomStartDate] = useState(`${initialFiscalYear}-01-01`);
  const [customEndDate, setCustomEndDate] = useState(`${initialFiscalYear}-12-31`);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("ALL");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(propDisplayCurrency);
  const [activeDrillDownCategory, setActiveDrillDownCategory] = useState<{
    title: string;
    lines: CashMovementLine[];
  } | null>(null);
  const [drillDownSearchQuery, setDrillDownSearchQuery] = useState("");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    OPERATING: true,
    INVESTING: true,
    FINANCING: true,
    CASH_ACCOUNTS: false,
    RECONCILIATION: true,
  });

  // Calculate actual Date Range based on Preset
  const { startDate, endDate } = useMemo(() => {
    if (dateRangePreset === "YEAR") {
      return { startDate: `${fiscalYear}-01-01`, endDate: `${fiscalYear}-12-31` };
    }
    if (dateRangePreset === "Q1") {
      return { startDate: `${fiscalYear}-01-01`, endDate: `${fiscalYear}-03-31` };
    }
    if (dateRangePreset === "Q2") {
      return { startDate: `${fiscalYear}-04-01`, endDate: `${fiscalYear}-06-30` };
    }
    if (dateRangePreset === "Q3") {
      return { startDate: `${fiscalYear}-07-01`, endDate: `${fiscalYear}-09-30` };
    }
    if (dateRangePreset === "Q4") {
      return { startDate: `${fiscalYear}-10-01`, endDate: `${fiscalYear}-12-31` };
    }
    if (dateRangePreset === "MONTH") {
      const today = new Date().toISOString().slice(0, 7);
      return { startDate: `${today}-01`, endDate: `${today}-31` };
    }
    return { startDate: customStartDate, endDate: customEndDate };
  }, [dateRangePreset, fiscalYear, customStartDate, customEndDate]);

  // Execute Cash Flow Statement Engine Calculation
  const statement: CashFlowStatementResult = useMemo(() => {
    const filterOptions: CashFlowFilterOptions = {
      fiscalYear,
      startDate,
      endDate,
      branchId: selectedBranchId,
    };

    return CashFlowEngine.generateStatement(
      accounts,
      journalEntries,
      vouchers,
      cashVaults,
      bankAccounts,
      invoices,
      fixedAssets,
      currencies,
      selectedCurrency,
      filterOptions
    );
  }, [
    accounts,
    journalEntries,
    vouchers,
    cashVaults,
    bankAccounts,
    invoices,
    fixedAssets,
    currencies,
    selectedCurrency,
    fiscalYear,
    startDate,
    endDate,
    selectedBranchId,
  ]);

  const toggleSection = (sec: string) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    const filename = `قائمة_التدفقات_النقدية_${fiscalYear}_${startDate}_${endDate}.pdf`;
    await exportElementToPdf("cash-flow-statement-canvas", filename);
    setIsExportingPdf(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const rows = [
      ["البند المالي / النشاط", "نوع التدفق", "المبلغ بالعملة المعروضة", "العملة"],
      ["--- الأنشطة التشغيلية ---", "", "", ""],
      ...statement.operatingActivities.subCategories.map((sc) => [
        sc.labelAr,
        sc.net >= 0 ? "تدفق وارد (Inflow)" : "تدفق صادر (Outflow)",
        sc.net.toString(),
        selectedCurrency,
      ]),
      ["صافي التدفقات من الأنشطة التشغيلية", "", statement.netOperatingCash.toString(), selectedCurrency],
      ["--- الأنشطة الاستثمارية ---", "", "", ""],
      ...statement.investingActivities.subCategories.map((sc) => [
        sc.labelAr,
        sc.net >= 0 ? "تدفق وارد" : "تدفق صادر",
        sc.net.toString(),
        selectedCurrency,
      ]),
      ["صافي التدفقات من الأنشطة الاستثمارية", "", statement.netInvestingCash.toString(), selectedCurrency],
      ["--- الأنشطة التمويلية ---", "", "", ""],
      ...statement.financingActivities.subCategories.map((sc) => [
        sc.labelAr,
        sc.net >= 0 ? "تدفق وارد" : "تدفق صادر",
        sc.net.toString(),
        selectedCurrency,
      ]),
      ["صافي التدفقات من الأنشطة التمويلية", "", statement.netFinancingCash.toString(), selectedCurrency],
      ["--- مطابقة النقدية ---", "", "", ""],
      ["رصيد النقدية في بداية الفترة", "", statement.beginningCashBalance.toString(), selectedCurrency],
      ["صافي التغير في النقدية وما في حكمها", "", statement.netChangeInCash.toString(), selectedCurrency],
      ["رصيد النقدية في نهاية الفترة (الفعلي)", "", statement.actualEndingCashBalance.toString(), selectedCurrency],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.map((c) => `"${c}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `قائمة_التدفقات_النقدية_${fiscalYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Drill Down Lines
  const filteredDrillDownLines = useMemo(() => {
    if (!activeDrillDownCategory) return [];
    if (!drillDownSearchQuery.trim()) return activeDrillDownCategory.lines;
    const q = drillDownSearchQuery.toLowerCase();
    return activeDrillDownCategory.lines.filter(
      (l) =>
        l.documentNumber.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.payerOrBeneficiary.toLowerCase().includes(q) ||
        l.counterpartAccountName.toLowerCase().includes(q) ||
        l.cashAccountName.toLowerCase().includes(q)
    );
  }, [activeDrillDownCategory, drillDownSearchQuery]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* 1. Control Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  مولد قائمة التدفقات النقدية اللحظي (IAS 7 Real-time Cash Flow)
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  محرك معتمد IFRS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تصفية وتصنيف الحركات النقدية بين الخزائن والبنوك وحسابات النشاط التشغيلي والاستثماري والتمويلي
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {onShareReport && (
            <button
              onClick={() =>
                onShareReport({
                  type: "REPORT",
                  reportType: "CASH_FLOW",
                  fiscalYear,
                  reportSummary: {
                    netOperatingCash: statement.netOperatingCash,
                    netInvestingCash: statement.netInvestingCash,
                    netFinancingCash: statement.netFinancingCash,
                    netChangeInCash: statement.netChangeInCash,
                    endingCash: statement.actualEndingCashBalance,
                  },
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة واتساب</span>
            </button>
          )}

          {onOpenAi && (
            <button
              onClick={onOpenAi}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>تحليل السيولة AI</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            title="تصدير جدول التدفقات إلى ملف Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
            title="تصدير قائمة التدفقات النقدية إلى PDF رسمي معتمد"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? "جاري التصدير..." : "PDF رسمي"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة</span>
          </button>
        </div>
      </div>

      {/* 2. Advanced Interactive Filter Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Method Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setMethod("DIRECT")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                method === "DIRECT"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              1. الطريقة المباشرة (Direct - المقبوضات والمدفوعات)
            </button>
            <button
              onClick={() => setMethod("INDIRECT")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                method === "INDIRECT"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              2. الطريقة غير المباشرة (Indirect - من صافي الدخل)
            </button>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-medium">عملة العرض:</span>
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded-lg">
              {(["YER_SANAA", "SAR", "USD", "YER_ADEN"] as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCurrency(c)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                    selectedCurrency === c
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date Presets & Branch Filter */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 text-xs flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>الفترة الزمنية:</span>
            </span>
            {[
              { id: "YEAR", label: `كامل سنة ${fiscalYear}` },
              { id: "Q1", label: "الربع الأول (Q1)" },
              { id: "Q2", label: "الربع الثاني (Q2)" },
              { id: "Q3", label: "الربع الثالث (Q3)" },
              { id: "Q4", label: "الربع الرابع (Q4)" },
              { id: "MONTH", label: "الشهر الحالي" },
              { id: "CUSTOM", label: "تاريخ مخصص" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setDateRangePreset(p.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  dateRangePreset === p.id
                    ? "bg-slate-800 text-emerald-400 border border-emerald-500/40 font-bold"
                    : "text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs if CUSTOM selected */}
          {dateRangePreset === "CUSTOM" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono"
              />
              <span className="text-slate-500">إلى</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono"
              />
            </div>
          )}

          {/* Branch Filter */}
          {branches.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs"
              >
                <option value="ALL">جميع فروع المؤسسة</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nameAr} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 3. Executive KPI Flash Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Operating Cash */}
        <div
          onClick={() =>
            setActiveDrillDownCategory({
              title: "تفاصيل الأنشطة التشغيلية (Operating Activities)",
              lines: statement.operatingActivities.subCategories.flatMap((s) => s.lines),
            })
          }
          className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">صافي التدفق التشغيلي</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-extrabold font-mono text-emerald-400 group-hover:scale-105 transition-transform origin-right">
            {formatMoney(statement.netOperatingCash, selectedCurrency, currencies)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <span>مقبوضات: {formatNumberOnly(statement.operatingActivities.totalInflow)}</span>
            <span>مدفوعات: {formatNumberOnly(statement.operatingActivities.totalOutflow)}</span>
          </div>
        </div>

        {/* Investing Cash */}
        <div
          onClick={() =>
            setActiveDrillDownCategory({
              title: "تفاصيل الأنشطة الاستثمارية (Investing Activities)",
              lines: statement.investingActivities.subCategories.flatMap((s) => s.lines),
            })
          }
          className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-blue-500/30 hover:border-blue-500/60 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">صافي التدفق الاستثماري</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-extrabold font-mono text-blue-400 group-hover:scale-105 transition-transform origin-right">
            {formatMoney(statement.netInvestingCash, selectedCurrency, currencies)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <span>أصول ومعدات (CapEx)</span>
            <span className="text-slate-300 font-mono font-bold">
              {formatNumberOnly(statement.investingActivities.totalOutflow)}
            </span>
          </div>
        </div>

        {/* Financing Cash */}
        <div
          onClick={() =>
            setActiveDrillDownCategory({
              title: "تفاصيل الأنشطة التمويلية (Financing Activities)",
              lines: statement.financingActivities.subCategories.flatMap((s) => s.lines),
            })
          }
          className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">صافي التدفق التمويلي</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-extrabold font-mono text-purple-400 group-hover:scale-105 transition-transform origin-right">
            {formatMoney(statement.netFinancingCash, selectedCurrency, currencies)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <span>رأس المال والقروض</span>
            <span className="text-slate-300 font-mono font-bold">
              {formatNumberOnly(statement.financingActivities.netCash)}
            </span>
          </div>
        </div>

        {/* Net Change in Cash & Ending Cash */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/40 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">رصيد النقدية نهاية المدة</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Vault className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-extrabold font-mono text-amber-300">
            {formatMoney(statement.actualEndingCashBalance, selectedCurrency, currencies)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <span>صافي التغير:</span>
            <span
              className={`font-mono font-bold ${
                statement.netChangeInCash >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {statement.netChangeInCash >= 0 ? "+" : ""}
              {formatMoney(statement.netChangeInCash, selectedCurrency, currencies)}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Real-time Reconciliation Audit Status Banner */}
      <div
        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          statement.isReconciled
            ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-300"
            : "bg-amber-950/30 border-amber-800/40 text-amber-300"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <div>
            <div className="font-bold text-slate-100">
              {statement.isReconciled
                ? "مطابقة وتدقيق لحظي متزن 100% مع أرصدة الخزائن والبنوك (Reconciliation Matched)"
                : "تنبيه تسوية: يوجد فارق تسوية بين التغير المحسوب والرصيد الفعلي"}
            </div>
            <div className="text-[11px] text-slate-400">
              رصيد أول المدة ({formatNumberOnly(statement.beginningCashBalance)}) + صافي التدفق (
              {formatNumberOnly(statement.netChangeInCash)}) = رصيد نهاية المدة الفعلي (
              {formatNumberOnly(statement.actualEndingCashBalance)}) | الفارق: {statement.reconciliationVariance.toFixed(2)}
            </div>
          </div>
        </div>

        <button
          onClick={() => toggleSection("CASH_ACCOUNTS")}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-white transition-colors self-start sm:self-auto"
        >
          <Vault className="w-3.5 h-3.5 text-emerald-400" />
          <span>استعراض أرصدة {statement.cashAccountsSummary.length} خزينة وحساب بنكي</span>
        </button>
      </div>

      {/* 4.1 Expandable Cash Vaults & Bank Accounts Breakdown */}
      {expandedSections.CASH_ACCOUNTS && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>أرصدة حسابات النقدية وما في حكمها المعتمدة في الميزانية (Cash & Cash Equivalents)</span>
            </div>
            <span className="font-mono text-emerald-400">
              الإجمالي: {formatMoney(statement.actualEndingCashBalance, selectedCurrency, currencies)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {statement.cashAccountsSummary.map((ca) => (
              <div
                key={ca.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-200">{ca.nameAr}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {ca.code} • {ca.type === "VAULT" ? "خزينة نقدية" : ca.type === "BANK" ? "حساب بنكي" : "حساب وسيط"}
                  </div>
                </div>
                <div className="text-left font-mono">
                  <div className="font-bold text-slate-100">
                    {formatMoney(ca.balanceInDisplayCurrency, selectedCurrency, currencies)}
                  </div>
                  {ca.currency !== selectedCurrency && (
                    <div className="text-[10px] text-slate-400">
                      {formatNumberOnly(ca.balanceInOriginalCurrency)} {ca.currency}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. MAIN FORMAL STATEMENT CANVAS (Direct or Indirect Method) */}
      <div
        id="cash-flow-statement-canvas"
        className="doc-canvas doc-font-cairo bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 print:bg-white print:text-black print:border-none print:shadow-none print:p-0"
      >
        {/* Enterprise Formal Header */}
        <div className="border-b-2 border-sap-secondary pb-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="text-right space-y-1">
              <h1 className="doc-title text-base sm:text-lg font-extrabold text-white print:text-black">
                🏢 {companyMeta.nameAr}
              </h1>
              <div className="doc-date text-xs font-bold text-slate-300 print:text-slate-700">
                {companyMeta.industry} - العنوان: {companyMeta.address}
              </div>
              <div className="doc-meta text-xs text-slate-400 print:text-slate-600">
                للتواصل: {companyMeta.phone}
              </div>
            </div>
            <div className="w-14 h-14 rounded-xl bg-[#0A2540] border-2 border-sap-secondary text-sap-secondary font-black text-xs flex flex-col items-center justify-center flex-shrink-0 shadow-md">
              <span className="font-mono tracking-tighter">{companyMeta.logoText}</span>
              <span className="text-[8px] text-sap-secondary/90">MeDo ERP</span>
            </div>
            <div className="text-left space-y-1" dir="ltr">
              <h2 className="text-[13px] sm:text-[14px] font-extrabold text-white print:text-black">
                {companyMeta.nameEn}
              </h2>
              <div className="text-[11px] text-slate-300 print:text-slate-700 font-medium">
                {companyMeta.nameEn.split(" ").slice(0, 3).join(" ")} Support
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-600">
                Tel: {companyMeta.phone}
              </div>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 print:border-slate-300">
            <h2 className="text-base font-extrabold text-emerald-400 print:text-black flex items-center gap-2">
              <span>📄 قائمة التدفقات النقدية (Statement of Cash Flows - IAS 7)</span>
              <span className="text-xs text-slate-400 font-normal">
                ({method === "DIRECT" ? "الطريقة المباشرة Direct Method" : "الطريقة غير المباشرة Indirect Method"})
              </span>
            </h2>

            <div className="flex items-center gap-3 font-mono text-[12px]">
              <span className="text-slate-300 print:text-black">
                السنة المالية: <b className="text-white print:text-black">{fiscalYear}م</b>
              </span>
              <span className="text-emerald-400 print:text-slate-800 font-bold">
                تاريخ التصدير: {getTodayFormattedDate()}
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-400 print:text-slate-600 flex justify-between">
            <span>
              للفترة من <b>{formatCalendarDate(startDate)}</b> إلى <b>{formatCalendarDate(endDate)}</b>
            </span>
            <span className="font-mono">العملة المعروضة: {selectedCurrency}</span>
          </div>
        </div>

        {/* 5.1 DIRECT METHOD RENDERING */}
        {method === "DIRECT" && (
          <div className="space-y-6 text-xs">
            {/* 1. Operating Activities */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                onClick={() => toggleSection("OPERATING")}
                className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedSections.OPERATING ? (
                    <ChevronDown className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <h3 className="font-bold text-emerald-400 text-sm">
                    أولاً: التدفقات النقدية من الأنشطة التشغيلية (Operating Activities)
                  </h3>
                </div>
                <span className="font-mono font-extrabold text-emerald-400 text-sm">
                  {formatMoney(statement.netOperatingCash, selectedCurrency, currencies)}
                </span>
              </div>

              {expandedSections.OPERATING && (
                <div className="p-4 space-y-2 divide-y divide-slate-900">
                  {statement.operatingActivities.subCategories.map((sub) => (
                    <div
                      key={sub.key}
                      onClick={() =>
                        sub.lines.length > 0 &&
                        setActiveDrillDownCategory({
                          title: sub.labelAr,
                          lines: sub.lines,
                        })
                      }
                      className="pt-2 pb-2 flex items-center justify-between hover:bg-slate-900/50 px-2 rounded-lg cursor-pointer transition-colors group"
                      title={sub.lines.length > 0 ? "انقر لاستعراض السندات والقيود التفصيلية" : ""}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200 group-hover:text-emerald-300 font-medium">
                          {sub.labelAr}
                        </span>
                        {sub.lines.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono group-hover:bg-emerald-950 group-hover:text-emerald-300">
                            {sub.lines.length} حركة
                          </span>
                        )}
                      </div>
                      <div className="text-left font-mono font-bold">
                        <span
                          className={
                            sub.net > 0 ? "text-emerald-400" : sub.net < 0 ? "text-rose-400" : "text-slate-400"
                          }
                        >
                          {sub.net < 0 ? `(${formatNumberOnly(Math.abs(sub.net))})` : formatNumberOnly(sub.net)}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="pt-3 flex items-center justify-between font-bold text-sm text-slate-100 border-t-2 border-slate-800">
                    <span>صافي النقدية المتولدة من (المستخدمة في) الأنشطة التشغيلية:</span>
                    <span className="font-mono text-emerald-400">
                      {formatMoney(statement.netOperatingCash, selectedCurrency, currencies)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Investing Activities */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                onClick={() => toggleSection("INVESTING")}
                className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedSections.INVESTING ? (
                    <ChevronDown className="w-4 h-4 text-blue-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <h3 className="font-bold text-blue-400 text-sm">
                    ثانياً: التدفقات النقدية من الأنشطة الاستثمارية (Investing Activities)
                  </h3>
                </div>
                <span className="font-mono font-extrabold text-blue-400 text-sm">
                  {formatMoney(statement.netInvestingCash, selectedCurrency, currencies)}
                </span>
              </div>

              {expandedSections.INVESTING && (
                <div className="p-4 space-y-2 divide-y divide-slate-900">
                  {statement.investingActivities.subCategories.map((sub) => (
                    <div
                      key={sub.key}
                      onClick={() =>
                        sub.lines.length > 0 &&
                        setActiveDrillDownCategory({
                          title: sub.labelAr,
                          lines: sub.lines,
                        })
                      }
                      className="pt-2 pb-2 flex items-center justify-between hover:bg-slate-900/50 px-2 rounded-lg cursor-pointer transition-colors group"
                      title={sub.lines.length > 0 ? "انقر لاستعراض السندات والقيود التفصيلية" : ""}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200 group-hover:text-blue-300 font-medium">
                          {sub.labelAr}
                        </span>
                        {sub.lines.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                            {sub.lines.length} حركة
                          </span>
                        )}
                      </div>
                      <div className="text-left font-mono font-bold">
                        <span
                          className={
                            sub.net > 0 ? "text-emerald-400" : sub.net < 0 ? "text-rose-400" : "text-slate-400"
                          }
                        >
                          {sub.net < 0 ? `(${formatNumberOnly(Math.abs(sub.net))})` : formatNumberOnly(sub.net)}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="pt-3 flex items-center justify-between font-bold text-sm text-slate-100 border-t-2 border-slate-800">
                    <span>صافي النقدية المستخدمة في الأنشطة الاستثمارية:</span>
                    <span className="font-mono text-blue-400">
                      {formatMoney(statement.netInvestingCash, selectedCurrency, currencies)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Financing Activities */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                onClick={() => toggleSection("FINANCING")}
                className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedSections.FINANCING ? (
                    <ChevronDown className="w-4 h-4 text-purple-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <h3 className="font-bold text-purple-400 text-sm">
                    ثالثاً: التدفقات النقدية من الأنشطة التمويلية (Financing Activities)
                  </h3>
                </div>
                <span className="font-mono font-extrabold text-purple-400 text-sm">
                  {formatMoney(statement.netFinancingCash, selectedCurrency, currencies)}
                </span>
              </div>

              {expandedSections.FINANCING && (
                <div className="p-4 space-y-2 divide-y divide-slate-900">
                  {statement.financingActivities.subCategories.map((sub) => (
                    <div
                      key={sub.key}
                      onClick={() =>
                        sub.lines.length > 0 &&
                        setActiveDrillDownCategory({
                          title: sub.labelAr,
                          lines: sub.lines,
                        })
                      }
                      className="pt-2 pb-2 flex items-center justify-between hover:bg-slate-900/50 px-2 rounded-lg cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200 group-hover:text-purple-300 font-medium">
                          {sub.labelAr}
                        </span>
                        {sub.lines.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                            {sub.lines.length} حركة
                          </span>
                        )}
                      </div>
                      <div className="text-left font-mono font-bold">
                        <span
                          className={
                            sub.net > 0 ? "text-emerald-400" : sub.net < 0 ? "text-rose-400" : "text-slate-400"
                          }
                        >
                          {sub.net < 0 ? `(${formatNumberOnly(Math.abs(sub.net))})` : formatNumberOnly(sub.net)}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="pt-3 flex items-center justify-between font-bold text-sm text-slate-100 border-t-2 border-slate-800">
                    <span>صافي النقدية من الأنشطة التمويلية:</span>
                    <span className="font-mono text-purple-400">
                      {formatMoney(statement.netFinancingCash, selectedCurrency, currencies)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5.2 INDIRECT METHOD RENDERING */}
        {method === "INDIRECT" && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="font-bold text-blue-400 text-sm border-b border-slate-800 pb-2">
                1. تسوية صافي الدخل المحاسبي مع التدفق النقدي التشغيلي (Indirect Reconciliation)
              </h3>

              <div className="flex justify-between text-slate-200 py-1.5 border-b border-slate-900">
                <span className="font-semibold">صافي الربح / (الخسارة) المحاسبي للفترة:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatMoney(statement.indirectMethod.netIncome, selectedCurrency, currencies)}
                </span>
              </div>

              <div className="text-slate-400 font-semibold pt-1">
                + التعديلات للبنود غير النقدية (Non-Cash Adjustments):
              </div>
              <div className="flex justify-between text-slate-300 pr-4">
                <span>+ مصروف إهلاك الأصول الثابتة (Depreciation Expense):</span>
                <span className="font-mono font-bold text-slate-100">
                  {formatMoney(statement.indirectMethod.depreciationExpense, selectedCurrency, currencies)}
                </span>
              </div>

              <div className="flex justify-between text-slate-200 font-bold pt-2 border-t border-slate-900">
                <span>التدفق النقدي التشغيلي قبل التغير في رأس المال العامل:</span>
                <span className="font-mono text-emerald-400">
                  {formatMoney(
                    statement.indirectMethod.operatingCashFlowBeforeWorkingCapital,
                    selectedCurrency,
                    currencies
                  )}
                </span>
              </div>

              <div className="text-slate-400 font-semibold pt-2">
                +/- التغيرات في بنود رأس المال العامل (Changes in Working Capital):
              </div>
              {statement.indirectMethod.workingCapitalChanges.map((wc) => (
                <div key={wc.accountGroup} className="flex justify-between text-slate-300 pr-4">
                  <span>{wc.labelAr}:</span>
                  <span
                    className={`font-mono font-bold ${
                      wc.cashEffect >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {wc.cashEffect < 0
                      ? `(${formatNumberOnly(Math.abs(wc.cashEffect))})`
                      : `+${formatNumberOnly(wc.cashEffect)}`}
                  </span>
                </div>
              ))}

              <div className="pt-3 flex justify-between font-bold text-sm text-slate-100 border-t-2 border-slate-800">
                <span>صافي التدفقات النقدية التشغيلية (بالطريقة غير المباشرة):</span>
                <span className="font-mono text-emerald-400">
                  {formatMoney(
                    statement.indirectMethod.netOperatingCashFlowIndirect,
                    selectedCurrency,
                    currencies
                  )}
                </span>
              </div>
            </div>

            {/* Investing and Financing summaries for indirect method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="font-bold text-blue-400 mb-2">صافي التدفق الاستثماري:</div>
                <div className="font-mono font-bold text-base text-blue-300">
                  {formatMoney(statement.netInvestingCash, selectedCurrency, currencies)}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="font-bold text-purple-400 mb-2">صافي التدفق التمويلي:</div>
                <div className="font-mono font-bold text-base text-purple-300">
                  {formatMoney(statement.netFinancingCash, selectedCurrency, currencies)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5.3 FINAL CASH RECONCILIATION SUMMARY BLOCK */}
        <div className="rounded-xl bg-slate-950 border-2 border-emerald-800/40 p-5 space-y-3 text-xs">
          <div className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>مطابقة النقدية وما في حكمها للفترة (Cash & Cash Equivalents Reconciliation)</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>معتمد ومطابق مع الخزائن</span>
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>رصيد النقدية وما في حكمها في بداية الفترة (Beginning Cash):</span>
              <span className="font-mono font-bold text-slate-100">
                {formatMoney(statement.beginningCashBalance, selectedCurrency, currencies)}
              </span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span>صافي الزيادة / (النقص) في النقدية وما في حكمها خلال الفترة:</span>
              <span
                className={`font-mono font-bold ${
                  statement.netChangeInCash >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {statement.netChangeInCash >= 0 ? "+" : ""}
                {formatMoney(statement.netChangeInCash, selectedCurrency, currencies)}
              </span>
            </div>

            <div className="pt-2 border-t-2 border-slate-800 flex justify-between font-extrabold text-sm text-slate-100">
              <span className="text-emerald-300">رصيد النقدية وما في حكمها في نهاية الفترة (Ending Cash Balance):</span>
              <span className="font-mono text-emerald-400 text-base">
                {formatMoney(statement.actualEndingCashBalance, selectedCurrency, currencies)}
              </span>
            </div>
          </div>
        </div>

        {/* Official Signatures Section */}
        <div className="mt-8 pt-6 border-t-2 border-slate-800 print:border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-[14.5px]">
          <div>
            <div className="doc-signature font-bold text-slate-200 print:text-black">رئيس قسم الخزينة والمدفوعات</div>
            <div className="mt-6 border-b border-dashed border-slate-700 print:border-slate-400 pb-2 text-slate-400 print:text-slate-600">
              ___________________
            </div>
          </div>
          <div>
            <div className="doc-signature font-bold text-slate-200 print:text-black">المدير المالي والتنفيذي (CFO)</div>
            <div className="mt-6 border-b border-dashed border-slate-700 print:border-slate-400 pb-2 text-slate-400 print:text-slate-600">
              ___________________
            </div>
          </div>
          <div>
            <div className="doc-signature font-bold text-slate-200 print:text-black">الختم الرسمي للمؤسسة</div>
            <div className="mt-6 font-bold text-[13px] text-sap-secondary">
              {TenantIsolationService.getActiveTenantDetails()?.nameAr || "المنشأة المعتمدة"}
            </div>
          </div>
        </div>

        {/* Print Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 print:border-slate-300 text-center text-[11.5px] font-light text-slate-400 print:text-slate-600 space-y-0.5">
          <div>© 2026 ميدو تك وبن زياد المتحدة | MeDo ERP</div>
          <div>نظام المحاسبة والإدارة المالية المتكامل - تقرير التدفقات النقدية المعياري IAS 7</div>
        </div>
      </div>

      {/* 6. DRILL DOWN MODAL FOR INDIVIDUAL CASH MOVEMENT LINES */}
      {activeDrillDownCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>{activeDrillDownCategory.title}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  استعراض جميع السندات والفواتير والقيود المحاسبية المغذية لهذا البند ({filteredDrillDownLines.length} حركة)
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveDrillDownCategory(null);
                  setDrillDownSearchQuery("");
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث برقم السند، البيان، المستفيد، أو الحساب المقابل..."
                  value={drillDownSearchQuery}
                  onChange={(e) => setDrillDownSearchQuery(e.target.value)}
                  className="w-full pr-9 pl-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredDrillDownLines.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  لا توجد حركات نقدية مطابقة لشروط البحث
                </div>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <th className="py-2.5 px-3 font-semibold">التاريخ</th>
                      <th className="py-2.5 px-3 font-semibold">رقم المستند</th>
                      <th className="py-2.5 px-3 font-semibold">البيان / الملاحظات</th>
                      <th className="py-2.5 px-3 font-semibold">الطرف المقابل</th>
                      <th className="py-2.5 px-3 font-semibold">حساب النقدية</th>
                      <th className="py-2.5 px-3 font-semibold text-left">المبلغ ({selectedCurrency})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredDrillDownLines.map((line) => (
                      <tr key={line.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-300" title={formatDualDate(line.date)}>
                          {formatCalendarDate(line.date)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                          {line.documentNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-200 max-w-xs truncate" title={line.description}>
                          {line.description}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 font-medium">
                          {line.counterpartAccountName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {line.cashAccountName}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-left font-mono font-bold ${
                            line.flowType === "INFLOW" ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {line.flowType === "INFLOW" ? "+" : "-"}
                          {formatNumberOnly(line.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-950 font-bold border-t-2 border-slate-700 text-xs">
                      <td colSpan={5} className="py-3 px-3 text-white">
                        إجمالي الحركات المعروضة:
                      </td>
                      <td className="py-3 px-3 text-left font-mono text-emerald-400">
                        {formatMoney(
                          filteredDrillDownLines.reduce((sum, l) => sum + (l.flowType === "INFLOW" ? l.amount : -l.amount), 0),
                          selectedCurrency,
                          currencies
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setActiveDrillDownCategory(null);
                  setDrillDownSearchQuery("");
                }}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
