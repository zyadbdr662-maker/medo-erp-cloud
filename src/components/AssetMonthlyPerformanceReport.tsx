import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Building2,
  Calendar,
  DollarSign,
  Download,
  Filter,
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  BarChart3,
  Layers,
} from "lucide-react";
import { FixedAsset, CostCenter, CurrencyCode, CurrencyInfo, JournalEntry } from "../types/erp";
import { formatMoney } from "../services/erpStorage";

interface AssetMonthlyPerformanceReportProps {
  fixedAssets: FixedAsset[];
  costCenters: CostCenter[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  journalEntries?: JournalEntry[];
  onRunDepreciation?: (period?: "MONTHLY" | "QUARTERLY" | "ANNUAL", customDate?: string) => void;
  onViewAssetDetails?: (asset: FixedAsset) => void;
}

export const AssetMonthlyPerformanceReport: React.FC<AssetMonthlyPerformanceReportProps> = ({
  fixedAssets,
  costCenters,
  currencies,
  displayCurrency,
  journalEntries = [],
  onRunDepreciation,
  onViewAssetDetails,
}) => {
  const [selectedCostCenter, setSelectedCostCenter] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    fixedAssets.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [fixedAssets]);

  const filteredAssets = useMemo(() => {
    return fixedAssets.filter((asset) => {
      if (selectedCostCenter !== "ALL" && asset.costCenterId !== selectedCostCenter) return false;
      if (selectedCategory !== "ALL" && asset.category !== selectedCategory) return false;
      return true;
    });
  }, [fixedAssets, selectedCostCenter, selectedCategory]);

  const totals = useMemo(() => {
    let totalPurchaseValue = 0;
    let totalAccumulatedDep = 0;
    let totalBookValue = 0;
    let totalMonthlyDep = 0;

    filteredAssets.forEach((a) => {
      const cost = a.purchaseCost || a.cost || 0;
      const acc = a.accumulatedDepreciation || 0;
      const book = a.bookValue ?? (cost - acc);
      const monthly = a.annualDepreciation ? a.annualDepreciation / 12 : ((cost - (a.salvageValue || 0)) / ((a.usefulLifeYears || 5) * 12));

      totalPurchaseValue += cost;
      totalAccumulatedDep += acc;
      totalBookValue += book;
      totalMonthlyDep += monthly;
    });

    return {
      totalPurchaseValue,
      totalAccumulatedDep,
      totalBookValue,
      totalMonthlyDep,
      assetsCount: filteredAssets.length,
    };
  }, [filteredAssets]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-indigo-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                تقرير الأداء الشهري والإهلاك الدوري للأصول الثابتة
              </h2>
              <p className="text-xs text-slate-400">
                تحليل القيمة الدفترية، معدلات الإهلاك المحققة، ومطابقة مراكز التكلفة للفترة المالية
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onRunDepreciation && (
            <button
              onClick={() => onRunDepreciation("MONTHLY")}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>تشغيل إهلاك الشهر الحالي ⚡</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 font-bold block mb-1">إجمالي تكلفة الشراء التاريخية</span>
          <span className="text-xl font-black font-mono text-white">
            {formatMoney(totals.totalPurchaseValue, displayCurrency, currencies)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">عدد الأصول: {totals.assetsCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 font-bold block mb-1">مجمع الإهلاك التراكمي</span>
          <span className="text-xl font-black font-mono text-amber-400">
            {formatMoney(totals.totalAccumulatedDep, displayCurrency, currencies)}
          </span>
          <span className="text-[11px] text-amber-500/70 block mt-1">
            نسبة الاستهلاك: {totals.totalPurchaseValue > 0 ? ((totals.totalAccumulatedDep / totals.totalPurchaseValue) * 100).toFixed(1) : 0}%
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 font-bold block mb-1">صافي القيمة الدفترية الحالية</span>
          <span className="text-xl font-black font-mono text-emerald-400">
            {formatMoney(totals.totalBookValue, displayCurrency, currencies)}
          </span>
          <span className="text-[11px] text-emerald-500/70 block mt-1">القيمة المحاسبية الصافية</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 font-bold block mb-1">قسط الإهلاك الشهري المقدر</span>
          <span className="text-xl font-black font-mono text-indigo-400">
            {formatMoney(totals.totalMonthlyDep, displayCurrency, currencies)}
          </span>
          <span className="text-[11px] text-indigo-400/70 block mt-1">عبء الإهلاك للشهر</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">مركز التكلفة:</span>
            <select
              value={selectedCostCenter}
              onChange={(e) => setSelectedCostCenter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">جميع مراكز التكلفة</option>
              {costCenters.map((cc) => (
                <option key={cc.id} value={cc.id}>
                  {cc.code} - {cc.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">التصنيف:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">جميع التصنيفات</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-slate-400 text-xs font-bold">
          عدد الأصول المعروضة: <span className="text-white font-mono">{filteredAssets.length}</span>
        </div>
      </div>

      {/* Assets Performance Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <th className="p-3.5 font-semibold">رمز الأصل / الاسم</th>
                <th className="p-3.5 font-semibold">التصنيف</th>
                <th className="p-3.5 font-semibold">مركز التكلفة</th>
                <th className="p-3.5 font-semibold text-left">تكلفة الشراء</th>
                <th className="p-3.5 font-semibold text-left">مجمع الإهلاك</th>
                <th className="p-3.5 font-semibold text-left">صافي القيمة الدفترية</th>
                <th className="p-3.5 font-semibold text-left">الإهلاك الشهري</th>
                <th className="p-3.5 font-semibold text-center">الحالة</th>
                <th className="p-3.5 font-semibold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    لا توجد أصول مطابقة لمعايير التصفية الحالية
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const cc = costCenters.find((c) => c.id === asset.costCenterId);
                  const cost = asset.purchaseCost || asset.cost || 0;
                  const accDep = asset.accumulatedDepreciation || 0;
                  const bookVal = asset.bookValue ?? (cost - accDep);
                  const mDep = asset.annualDepreciation ? asset.annualDepreciation / 12 : ((cost - (asset.salvageValue || 0)) / ((asset.usefulLifeYears || 5) * 12));

                  return (
                    <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{asset.nameAr || asset.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{asset.code || asset.assetCode}</div>
                      </td>
                      <td className="p-3.5 text-slate-300">{asset.category || "عام"}</td>
                      <td className="p-3.5 text-slate-300">{cc?.nameAr || asset.costCenterName || "المركز العام"}</td>
                      <td className="p-3.5 text-left font-mono font-bold text-white">
                        {formatMoney(cost, displayCurrency, currencies)}
                      </td>
                      <td className="p-3.5 text-left font-mono font-bold text-amber-400">
                        {formatMoney(accDep, displayCurrency, currencies)}
                      </td>
                      <td className="p-3.5 text-left font-mono font-bold text-emerald-400">
                        {formatMoney(bookVal, displayCurrency, currencies)}
                      </td>
                      <td className="p-3.5 text-left font-mono font-bold text-indigo-300">
                        {formatMoney(mDep, displayCurrency, currencies)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          asset.status === "ACTIVE"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}>
                          {asset.status === "ACTIVE" ? "نشط" : "متقاعد"}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {onViewAssetDetails && (
                          <button
                            onClick={() => onViewAssetDetails(asset)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition cursor-pointer"
                          >
                            عرض
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
