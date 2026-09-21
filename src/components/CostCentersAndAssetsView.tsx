import React, { useState } from "react";
import {
  PieChart as PieChartIcon,
  Layers,
  Plus,
  Search,
  Calculator,
  TrendingDown,
  Building,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  CostCenter,
  CurrencyCode,
  CurrencyInfo,
  FixedAsset,
  AssetMaintenanceRecord,
} from "../types/erp";
import { formatMoney, formatNumberOnly } from "../services/erpStorage";
import { FixedAssetsModule } from "./FixedAssetsModule";

interface CostCentersAndAssetsViewProps {
  costCenters: CostCenter[];
  fixedAssets: FixedAsset[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  onAddCostCenter: (cc: CostCenter) => void;
  onAddFixedAsset: (asset: FixedAsset) => void;
  onUpdateFixedAsset?: (asset: FixedAsset) => void;
  onDeleteFixedAsset?: (assetId: string) => void;
  onRunDepreciation: (period?: "MONTHLY" | "QUARTERLY" | "ANNUAL", customDate?: string) => void;
  onTransferAsset?: (
    assetId: string,
    toCostCenterId: string,
    toCostCenterName: string,
    reason: string
  ) => void;
  onAddMaintenance?: (assetId: string, record: AssetMaintenanceRecord) => void;
  onDisposeAsset?: (
    assetId: string,
    saleAmount: number,
    disposalDate: string,
    notes: string
  ) => void;
}

export const CostCentersAndAssetsView: React.FC<CostCentersAndAssetsViewProps> = ({
  costCenters,
  fixedAssets,
  currencies,
  displayCurrency,
  onAddCostCenter,
  onAddFixedAsset,
  onUpdateFixedAsset,
  onDeleteFixedAsset,
  onRunDepreciation,
  onTransferAsset,
  onAddMaintenance,
  onDisposeAsset,
}) => {
  const [activeTab, setActiveTab] = useState<"COST_CENTERS" | "FIXED_ASSETS">("COST_CENTERS");
  const [showAddCcModal, setShowAddCcModal] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);

  // New Cost Center Form
  const [ccNameAr, setCcNameAr] = useState("");
  const [ccManager, setCcManager] = useState("");
  const [ccBudget, setCcBudget] = useState<number>(5000000);

  // New Fixed Asset Form
  const [assetNameAr, setAssetNameAr] = useState("");
  const [assetCategory, setAssetCategory] = useState("أجهزة ومعدات تقنية");
  const [assetPurchaseDate, setAssetPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [assetCost, setAssetCost] = useState<number>(1000000);
  const [assetUsefulLife, setAssetUsefulLife] = useState<number>(5);
  const [assetSalvageValue, setAssetSalvageValue] = useState<number>(50000);
  const [assetCurrency, setAssetCurrency] = useState<CurrencyCode>("YER_SANAA");

  const handleSaveCc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ccNameAr) return;
    const nextCode = `CC-${(costCenters.length + 1).toString().padStart(3, "0")}`;
    onAddCostCenter({
      id: `cc-${Date.now()}`,
      code: nextCode,
      nameAr: ccNameAr,
      nameEn: ccNameAr,
      manager: ccManager || "مدير القسم",
      budgetAllocated: ccBudget,
      actualSpent: 0,
      budget: ccBudget,
      actualSpend: 0,
      currency: "YER_SANAA",
      type: "OPERATIONAL",
    });
    setShowAddCcModal(false);
    setCcNameAr("");
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetNameAr || assetCost <= 0) return;

    const nextCode = `FA-${(fixedAssets.length + 1).toString().padStart(4, "0")}`;
    const annualDep = (assetCost - assetSalvageValue) / (assetUsefulLife || 1);

    onAddFixedAsset({
      id: `fa-${Date.now()}`,
      code: nextCode,
      assetCode: nextCode,
      name: assetNameAr,
      nameAr: assetNameAr,
      category: assetCategory,
      purchaseDate: assetPurchaseDate,
      purchaseCost: assetCost,
      cost: assetCost,
      salvageValue: assetSalvageValue,
      usefulLifeYears: assetUsefulLife,
      accumulatedDepreciation: 0,
      bookValue: assetCost,
      annualDepreciation: annualDep,
      depreciationMethod: "STRAIGHT_LINE",
      currency: assetCurrency,
      costCenterId: costCenters[0]?.id || "cc-1",
      location: "المركز الرئيسي - صنعاء",
      assignedDepartment: "الإدارة العامة",
    });
    setShowAddAssetModal(false);
    setAssetNameAr("");
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">مراكز التكلفة والأصول الثابتة (CO & Fixed Assets - AA)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            المحاسبة الإدارية والرقابة على الموازنات التقديرية وسجل إهلاك الأصول وفق معيار IAS 16
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "COST_CENTERS" ? (
            <button
              onClick={() => setShowAddCcModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مركز تكلفة</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRunDepreciation()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-cyan-800/40 transition-colors"
                title="توليد قيد إهلاك شهري فوري"
              >
                <Calculator className="w-4 h-4 text-cyan-400" />
                <span>تشغيل إهلاك الفترة</span>
              </button>
              <button
                onClick={() => setShowAddAssetModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل أصل ثابت</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs w-fit">
        {[
          { id: "COST_CENTERS", label: "مراكز التكلفة والموازنات (Controlling - CO)" },
          { id: "FIXED_ASSETS", label: "سجل الأصول الثابتة والإهلاك (Asset Accounting)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              activeTab === tab.id
                ? "bg-purple-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Cost Centers View */}
      {activeTab === "COST_CENTERS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {costCenters.map((cc) => {
            const usagePercent = cc.budget > 0 ? (cc.actualSpend / cc.budget) * 100 : 0;
            const variance = cc.budget - cc.actualSpend;

            return (
              <div
                key={cc.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-purple-400 font-bold px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/60">
                      {cc.code}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">{cc.nameAr}</h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{cc.manager}</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>نسبة استهلاك الموازنة:</span>
                    <span className="font-mono font-bold text-slate-200">{usagePercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usagePercent > 90
                          ? "bg-rose-500"
                          : usagePercent > 70
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">الموازنة التقديرية:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {formatMoney(cc.budget, cc.currency, currencies)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">المصروف الفعلي:</span>
                    <span className="font-mono font-bold text-rose-400">
                      {formatMoney(cc.actualSpend, cc.currency, currencies)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Fixed Assets View */}
      {activeTab === "FIXED_ASSETS" && (
        <FixedAssetsModule
          fixedAssets={fixedAssets}
          costCenters={costCenters}
          currencies={currencies}
          displayCurrency={displayCurrency}
          onAddFixedAsset={onAddFixedAsset}
          onUpdateFixedAsset={onUpdateFixedAsset}
          onDeleteFixedAsset={onDeleteFixedAsset}
          onRunDepreciation={onRunDepreciation}
          onTransferAsset={onTransferAsset}
          onAddMaintenance={onAddMaintenance}
          onDisposeAsset={onDisposeAsset}
          onOpenCostCenters={() => setActiveTab("COST_CENTERS")}
        />
      )}

      {/* Add Cost Center Modal */}
      {showAddCcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-right animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-400" />
                <span>إضافة مركز تكلفة جديد (Cost Center)</span>
              </h3>
              <button onClick={() => setShowAddCcModal(false)} className="text-slate-400 text-xl font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCc} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم مركز التكلفة *</label>
                <input
                  type="text"
                  required
                  value={ccNameAr}
                  onChange={(e) => setCcNameAr(e.target.value)}
                  placeholder="مثال: فرع الحديدة"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">المسؤول / المدير المشرف</label>
                <input
                  type="text"
                  value={ccManager}
                  onChange={(e) => setCcManager(e.target.value)}
                  placeholder="اسم مدير الفرع أو القسم"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الموازنة التقديرية المخصصة (YER)</label>
                <input
                  type="number"
                  value={ccBudget}
                  onChange={(e) => setCcBudget(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-left focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCcModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  حفظ المركز
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-right animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>تسجيل أصل ثابت جديد في الدفاتر (Fixed Asset)</span>
              </h3>
              <button onClick={() => setShowAddAssetModal(false)} className="text-slate-400 text-xl font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم ووصف الأصل *</label>
                <input
                  type="text"
                  required
                  value={assetNameAr}
                  onChange={(e) => setAssetNameAr(e.target.value)}
                  placeholder="مثال: سيارة نقل بضائع تويوتا هايلوكس 2024"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">تصنيف الأصل</label>
                  <select
                    value={assetCategory}
                    onChange={(e) => setAssetCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="وسائط نقل وسيارات">وسائط نقل وسيارات</option>
                    <option value="أجهزة ومعدات تقنية">أجهزة ومعدات تقنية</option>
                    <option value="أثاث وتجهيزات مكتبية">أثاث وتجهيزات مكتبية</option>
                    <option value="عقارات ومباني">عقارات ومباني</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">تاريخ الاقتناء / الشراء</label>
                  <input
                    type="date"
                    value={assetPurchaseDate}
                    onChange={(e) => setAssetPurchaseDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">تكلفة الشراء *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={assetCost}
                    onChange={(e) => setAssetCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-left"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">العمر الإنتاجي (سنوات)</label>
                  <input
                    type="number"
                    min="1"
                    value={assetUsefulLife}
                    onChange={(e) => setAssetUsefulLife(parseInt(e.target.value) || 5)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-left"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">قيمة الخردة التقديرية</label>
                  <input
                    type="number"
                    value={assetSalvageValue}
                    onChange={(e) => setAssetSalvageValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-left"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  حفظ الأصل الثابت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
