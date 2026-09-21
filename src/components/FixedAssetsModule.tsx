import React, { useState, useMemo } from "react";
import {
  Building2,
  Layers,
  Plus,
  Search,
  Calculator,
  TrendingDown,
  Clock,
  ArrowRightLeft,
  Wrench,
  FileSpreadsheet,
  QrCode,
  ShieldCheck,
  Filter,
  Trash2,
  Printer,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  History,
  Sparkles,
  Calendar,
  DollarSign,
  ChevronRight,
  X,
  Eye,
  Sliders,
  Building,
  UserCheck,
  Check,
} from "lucide-react";
import {
  FixedAsset,
  CostCenter,
  CurrencyCode,
  CurrencyInfo,
  AssetMaintenanceRecord,
  AssetTransferRecord,
} from "../types/erp";
import { formatMoney, formatNumberOnly } from "../services/erpStorage";
import { AssetUsefulLifeTimeline } from "./AssetUsefulLifeTimeline";

interface FixedAssetsModuleProps {
  fixedAssets: FixedAsset[];
  costCenters: CostCenter[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
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
  onOpenCostCenters?: () => void;
}

type TabType =
  | "REGISTER"
  | "LIFECYCLE"
  | "DEPRECIATION_ENGINE"
  | "COST_CENTERS_ALLOCATION"
  | "MAINTENANCE_DISPOSAL";

export const FixedAssetsModule: React.FC<FixedAssetsModuleProps> = ({
  fixedAssets,
  costCenters,
  currencies,
  displayCurrency,
  onAddFixedAsset,
  onUpdateFixedAsset,
  onDeleteFixedAsset,
  onRunDepreciation,
  onTransferAsset,
  onAddMaintenance,
  onDisposeAsset,
  onOpenCostCenters,
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>("REGISTER");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedCostCenter, setSelectedCostCenter] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("TABLE");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDepreciationModal, setShowDepreciationModal] = useState(false);
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState<FixedAsset | null>(null);
  const [selectedAssetForTransfer, setSelectedAssetForTransfer] = useState<FixedAsset | null>(null);
  const [selectedAssetForMaintenance, setSelectedAssetForMaintenance] = useState<FixedAsset | null>(null);
  const [selectedAssetForDisposal, setSelectedAssetForDisposal] = useState<FixedAsset | null>(null);
  const [showPrintRegisterModal, setShowPrintRegisterModal] = useState(false);

  // Add Asset Form States
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<string>("MACHINERY");
  const [formCostCenterId, setFormCostCenterId] = useState<string>(costCenters[0]?.id || "CC-100");
  const [formPurchaseDate, setFormPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [formPurchaseCost, setFormPurchaseCost] = useState<number>(10000000);
  const [formSalvageValue, setFormSalvageValue] = useState<number>(1000000);
  const [formUsefulLifeYears, setFormUsefulLifeYears] = useState<number>(5);
  const [formCurrency, setFormCurrency] = useState<CurrencyCode>("YER_SANAA");
  const [formDepMethod, setFormDepMethod] = useState<"STRAIGHT_LINE" | "DECLINING_BALANCE">("STRAIGHT_LINE");
  const [formLocation, setFormLocation] = useState("المركز الرئيسي - مجموعة بن زياد");
  const [formCustodian, setFormCustodian] = useState("أ. فيصل القدسي");
  const [formDepartment, setFormDepartment] = useState("إدارة العمليات واللوجستيات");
  const [formSerial, setFormSerial] = useState("");

  // Depreciation Run Controls
  const [depPeriodType, setDepPeriodType] = useState<"MONTHLY" | "QUARTERLY" | "ANNUAL">("MONTHLY");
  const [depDate, setDepDate] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // Transfer Form States
  const [transferTargetCostCenter, setTransferTargetCostCenter] = useState<string>(costCenters[0]?.id || "");
  const [transferReason, setTransferReason] = useState("إعادة توزيع الأصول التشغيلية بمجموعة بن زياد");

  // Maintenance Form States
  const [maintDesc, setMaintDesc] = useState("");
  const [maintCost, setMaintCost] = useState<number>(150000);
  const [maintProvider, setMaintProvider] = useState("شركة الصيانة الفنية المعتمدة");

  // Disposal Form States
  const [disposalProceeds, setDisposalProceeds] = useState<number>(0);
  const [disposalDate, setDisposalDate] = useState(new Date().toISOString().slice(0, 10));
  const [disposalNotes, setDisposalNotes] = useState("استبعاد الأصل بعد استنفاد كفاءته الإنتاجية");

  // Helper to resolve asset fields safely
  const getAssetCost = (a: FixedAsset) => a.purchaseCost ?? a.cost ?? 0;
  const getAssetName = (a: FixedAsset) => a.nameAr || a.name || "أصل ثابت";
  const getAssetCode = (a: FixedAsset) => a.code || a.assetCode || "FA-000";

  // Category Translation Helper
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
        return "الأثاث والتجهيزات المكتبية";
      default:
        return category;
    }
  };

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return fixedAssets.filter((asset) => {
      const name = getAssetName(asset).toLowerCase();
      const code = getAssetCode(asset).toLowerCase();
      const serial = (asset.serialNumber || "").toLowerCase();
      const custodian = (asset.custodianName || "").toLowerCase();
      const location = (asset.location || "").toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        code.includes(query) ||
        serial.includes(query) ||
        custodian.includes(query) ||
        location.includes(query);

      const matchesCategory = selectedCategory === "ALL" || asset.category === selectedCategory;
      const matchesCostCenter = selectedCostCenter === "ALL" || asset.costCenterId === selectedCostCenter;
      const matchesStatus = selectedStatus === "ALL" || asset.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesCostCenter && matchesStatus;
    });
  }, [fixedAssets, searchQuery, selectedCategory, selectedCostCenter, selectedStatus]);

  // Overall KPIs calculation
  const totalCost = useMemo(() => {
    return fixedAssets.reduce((sum, a) => sum + getAssetCost(a), 0);
  }, [fixedAssets]);

  const totalAccumulatedDep = useMemo(() => {
    return fixedAssets.reduce((sum, a) => sum + (a.accumulatedDepreciation || 0), 0);
  }, [fixedAssets]);

  const totalBookValue = useMemo(() => {
    return fixedAssets.reduce((sum, a) => sum + (a.bookValue || (getAssetCost(a) - (a.accumulatedDepreciation || 0))), 0);
  }, [fixedAssets]);

  const totalMonthlyDep = useMemo(() => {
    return fixedAssets.reduce((sum, a) => {
      if (a.status === "DISPOSED") return sum;
      return sum + (a.annualDepreciation || 0) / 12;
    }, 0);
  }, [fixedAssets]);

  const activeAssetsCount = useMemo(() => {
    return fixedAssets.filter((a) => a.status === "ACTIVE").length;
  }, [fixedAssets]);

  // Calculate Useful Life details for an asset
  const calculateLifeDetails = (asset: FixedAsset) => {
    const pDate = new Date(asset.purchaseDate);
    const now = new Date();
    const elapsedMonths = Math.max(
      0,
      (now.getFullYear() - pDate.getFullYear()) * 12 + (now.getMonth() - pDate.getMonth())
    );
    const totalMonths = (asset.usefulLifeYears || 5) * 12;
    const remainingMonths = Math.max(0, totalMonths - elapsedMonths);
    const elapsedYears = (elapsedMonths / 12).toFixed(1);
    const remainingYears = (remainingMonths / 12).toFixed(1);
    const progressPct = Math.min(100, Math.round((elapsedMonths / totalMonths) * 100));

    const cost = getAssetCost(asset);
    const dep = asset.accumulatedDepreciation || 0;
    const depPct = cost > 0 ? Math.min(100, Math.round((dep / cost) * 100)) : 0;

    return {
      elapsedMonths,
      totalMonths,
      remainingMonths,
      elapsedYears,
      remainingYears,
      progressPct,
      depPct,
      isNearExpiry: remainingMonths <= 12 && remainingMonths > 0,
      isFullyDepreciated: remainingMonths === 0 || asset.bookValue <= (asset.salvageValue || 0),
    };
  };

  // Group assets by Bin Ziyad Cost Centers
  const costCenterBreakdown = useMemo(() => {
    return costCenters.map((cc) => {
      const ccAssets = fixedAssets.filter((a) => a.costCenterId === cc.id);
      const ccCost = ccAssets.reduce((sum, a) => sum + getAssetCost(a), 0);
      const ccAccumDep = ccAssets.reduce((sum, a) => sum + (a.accumulatedDepreciation || 0), 0);
      const ccBookValue = ccAssets.reduce((sum, a) => sum + (a.bookValue || (getAssetCost(a) - (a.accumulatedDepreciation || 0))), 0);
      const ccMonthlyDep = ccAssets.reduce((sum, a) => sum + (a.annualDepreciation || 0) / 12, 0);

      return {
        costCenter: cc,
        assets: ccAssets,
        totalCost: ccCost,
        accumulatedDep: ccAccumDep,
        bookValue: ccBookValue,
        monthlyDep: ccMonthlyDep,
        assetCount: ccAssets.length,
      };
    });
  }, [costCenters, fixedAssets]);

  // Handle Add Asset Submission
  const handleSubmitAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || formPurchaseCost <= 0) return;

    const targetCC = costCenters.find((c) => c.id === formCostCenterId);
    const nextCode = `FA-${formCategory.slice(0, 3).toUpperCase()}-${(fixedAssets.length + 1).toString().padStart(3, "0")}`;
    const annualDep =
      (formPurchaseCost - formSalvageValue) / (formUsefulLifeYears > 0 ? formUsefulLifeYears : 1);

    const newAsset: FixedAsset = {
      id: `fa-${Date.now()}`,
      code: nextCode,
      assetCode: nextCode,
      name: formName,
      nameAr: formName,
      category: formCategory as any,
      purchaseDate: formPurchaseDate,
      purchaseCost: formPurchaseCost,
      cost: formPurchaseCost,
      currency: formCurrency,
      salvageValue: formSalvageValue,
      usefulLifeYears: formUsefulLifeYears,
      depreciationMethod: formDepMethod,
      annualDepreciation: annualDep,
      accumulatedDepreciation: 0,
      bookValue: formPurchaseCost,
      location: formLocation,
      assignedDepartment: formDepartment,
      costCenterId: formCostCenterId,
      costCenterName: targetCC ? targetCC.nameAr : "مجموعة بن زياد",
      custodianName: formCustodian,
      serialNumber: formSerial || `BZG-${Date.now().toString().slice(-6)}`,
      barcode: `629100${Date.now().toString().slice(-6)}`,
      assetGlAccount: formCategory === "BUILDINGS" ? "1201" : formCategory === "MACHINERY" ? "1202" : formCategory === "VEHICLES" ? "1203" : "1204",
      accumulatedDepGlAccount: "1209",
      depExpenseGlAccount: "5204",
      status: "ACTIVE",
      lastDepreciationDate: formPurchaseDate,
      maintenanceRecords: [],
      transferRecords: [],
    };

    onAddFixedAsset(newAsset);
    setShowAddModal(false);
    // Reset Form
    setFormName("");
    setFormPurchaseCost(10000000);
    setFormSalvageValue(1000000);
    setFormSerial("");
  };

  // Handle Run Depreciation Click
  const handleExecuteDepreciation = () => {
    onRunDepreciation(depPeriodType, depDate);
    setShowDepreciationModal(false);
  };

  // Handle Transfer
  const handleExecuteTransfer = () => {
    if (!selectedAssetForTransfer || !transferTargetCostCenter) return;
    const targetCC = costCenters.find((c) => c.id === transferTargetCostCenter);
    if (!targetCC) return;

    if (onTransferAsset) {
      onTransferAsset(
        selectedAssetForTransfer.id,
        targetCC.id,
        targetCC.nameAr,
        transferReason
      );
    } else if (onUpdateFixedAsset) {
      const transferEntry: AssetTransferRecord = {
        id: `tr-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        fromCostCenterId: selectedAssetForTransfer.costCenterId || "",
        fromCostCenterName: selectedAssetForTransfer.costCenterName || "المركز السابق",
        toCostCenterId: targetCC.id,
        toCostCenterName: targetCC.nameAr,
        transferredBy: "د. طارق المنصوري",
        reason: transferReason,
      };

      const updated: FixedAsset = {
        ...selectedAssetForTransfer,
        costCenterId: targetCC.id,
        costCenterName: targetCC.nameAr,
        transferRecords: [
          ...(selectedAssetForTransfer.transferRecords || []),
          transferEntry,
        ],
      };
      onUpdateFixedAsset(updated);
    }

    setSelectedAssetForTransfer(null);
  };

  // Handle Maintenance Add
  const handleExecuteMaintenance = () => {
    if (!selectedAssetForMaintenance || !maintDesc) return;

    const newRecord: AssetMaintenanceRecord = {
      id: `maint-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      description: maintDesc,
      cost: maintCost,
      currency: selectedAssetForMaintenance.currency,
      serviceProvider: maintProvider,
      performedBy: "م. إبراهيم باوزير",
      notes: "تم الفحص الفني واعتماد سلامة التشغيل",
    };

    if (onAddMaintenance) {
      onAddMaintenance(selectedAssetForMaintenance.id, newRecord);
    } else if (onUpdateFixedAsset) {
      const updated: FixedAsset = {
        ...selectedAssetForMaintenance,
        maintenanceRecords: [
          ...(selectedAssetForMaintenance.maintenanceRecords || []),
          newRecord,
        ],
      };
      onUpdateFixedAsset(updated);
    }

    setSelectedAssetForMaintenance(null);
    setMaintDesc("");
  };

  // Handle Disposal
  const handleExecuteDisposal = () => {
    if (!selectedAssetForDisposal) return;

    if (onDisposeAsset) {
      onDisposeAsset(
        selectedAssetForDisposal.id,
        disposalProceeds,
        disposalDate,
        disposalNotes
      );
    } else if (onUpdateFixedAsset) {
      const updated: FixedAsset = {
        ...selectedAssetForDisposal,
        status: "DISPOSED",
        bookValue: 0,
      };
      onUpdateFixedAsset(updated);
    }

    setSelectedAssetForDisposal(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12" id="fixed-assets-module-root">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white tracking-wide">
                    إدارة الأصول الثابتة والإهلاك الدوري (Asset Accounting - AA)
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800/60">
                    مجموعة بن زياد
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                    معيار IAS 16
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  تتبع الأعمار الإنتاجية، حساب مجمعات الإهلاك الآلية، الربط بمراكز التكلفة، وإصدار قيود اليومية العامة
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-print-assets-register"
              onClick={() => setShowPrintRegisterModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:text-white"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>طباعة السجل</span>
            </button>

            <button
              id="btn-run-depreciation-modal"
              onClick={() => setShowDepreciationModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-900/30 active:scale-95 transition-all"
            >
              <Calculator className="w-4 h-4" />
              <span>تشغيل إهلاك الفترة آلياً</span>
            </button>

            <button
              id="btn-add-new-fixed-asset"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-950/40 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة أصل جديد</span>
            </button>
          </div>
        </div>

        {/* 2. Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>إجمالي تكلفة الاقتناء التاريخية</span>
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-lg font-black font-mono text-white">
              {formatMoney(totalCost, "YER_SANAA", currencies)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-bold">{fixedAssets.length}</span>
              <span>أصل مقيد في السجل</span>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>مجمع الإهلاك المتراكم</span>
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-lg font-black font-mono text-rose-400">
              {formatMoney(totalAccumulatedDep, "YER_SANAA", currencies)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              نسبة استهلاك الأصول:{" "}
              <span className="text-rose-300 font-bold">
                {totalCost > 0 ? ((totalAccumulatedDep / totalCost) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>صافي القيمة الدفترية الحالية</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-black font-mono text-emerald-400">
              {formatMoney(totalBookValue, "YER_SANAA", currencies)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              تدرج في بند الأصول غير المتداولة
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>قسط الإهلاك الدوري المقدر</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg font-black font-mono text-amber-300">
              {formatMoney(totalMonthlyDep, "YER_SANAA", currencies)}
              <span className="text-xs font-normal text-slate-400 mr-1">/ شهر</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              يحمّل على مراكز تكلفة بن زياد شهرياً
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          onClick={() => setActiveTab("REGISTER")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "REGISTER"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>سجل الأصول الثابتة ({fixedAssets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("LIFECYCLE")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "LIFECYCLE"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>الجدول الزمني ومصفوفة الأعمار الإنتاجية المتبقية</span>
        </button>

        <button
          onClick={() => setActiveTab("DEPRECIATION_ENGINE")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "DEPRECIATION_ENGINE"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>محرك حساب مجمعات الإهلاك (IAS 16)</span>
        </button>

        <button
          onClick={() => setActiveTab("COST_CENTERS_ALLOCATION")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "COST_CENTERS_ALLOCATION"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>توزيع مراكز التكلفة - مجموعة بن زياد</span>
        </button>

        <button
          onClick={() => setActiveTab("MAINTENANCE_DISPOSAL")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "MAINTENANCE_DISPOSAL"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>الصيانة والاستبعاد والتكهين</span>
        </button>
      </div>

      {/* 4. TAB CONTENT: REGISTER */}
      {activeTab === "REGISTER" && (
        <div className="space-y-4">
          {/* Controls Bar: Search and Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full md:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث باسم الأصل، الكود، السيريال، أمين العهدة، أو الموقع..."
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
                <option value="ALL">مراكز تكلفة بن زياد (الكل)</option>
                {costCenters.map((cc) => (
                  <option key={cc.id} value={cc.id}>
                    {cc.code} - {cc.nameAr}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="ACTIVE">نشط ويعمل</option>
                <option value="UNDER_MAINTENANCE">قيد الصيانة</option>
                <option value="DISPOSED">مستبعد / مكهن</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 self-end md:self-auto">
              <button
                onClick={() => setViewMode("TABLE")}
                className={`p-2 rounded-lg border ${
                  viewMode === "TABLE"
                    ? "bg-slate-800 text-amber-400 border-amber-500/40"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                }`}
                title="عرض جدول مفصل"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("GRID")}
                className={`p-2 rounded-lg border ${
                  viewMode === "GRID"
                    ? "bg-slate-800 text-amber-400 border-amber-500/40"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                }`}
                title="عرض بطاقات مرئية"
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Asset List Content */}
          {filteredAssets.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <AlertTriangle className="w-10 h-10 text-amber-400/60 mx-auto mb-3" />
              <div className="text-sm font-bold text-slate-200">لا توجد أصول مطابقة للبحث أو الفلتر</div>
              <div className="text-xs text-slate-500 mt-1">
                جرب تغيير خيارات التصفية أو أضف أصلاً جديداً لمجموعة بن زياد
              </div>
            </div>
          ) : viewMode === "TABLE" ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 bg-slate-950/80">
                      <th className="py-3 px-4 font-semibold">رمز الأصل والباركود</th>
                      <th className="py-3 px-4 font-semibold">اسم الأصل والمواصفات</th>
                      <th className="py-3 px-4 font-semibold">مركز التكلفة (بن زياد)</th>
                      <th className="py-3 px-4 font-semibold text-left">تكلفة الاقتناء</th>
                      <th className="py-3 px-4 font-semibold text-left">مجمع الإهلاك</th>
                      <th className="py-3 px-4 font-semibold text-left">صافي الدفترية</th>
                      <th className="py-3 px-4 font-semibold">العمر الإنتاجي</th>
                      <th className="py-3 px-4 font-semibold">العهدة والموقع</th>
                      <th className="py-3 px-4 font-semibold text-center">الحالة</th>
                      <th className="py-3 px-4 font-semibold text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {filteredAssets.map((asset) => {
                      const life = calculateLifeDetails(asset);
                      const cost = getAssetCost(asset);
                      const accumDep = asset.accumulatedDepreciation || 0;
                      const bookVal = asset.bookValue || cost - accumDep;
                      const linkedCC = costCenters.find((c) => c.id === asset.costCenterId);

                      return (
                        <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors">
                          {/* Code & Barcode */}
                          <td className="py-3.5 px-4 font-mono">
                            <div className="font-bold text-amber-400">{getAssetCode(asset)}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <QrCode className="w-3 h-3" />
                              <span>{asset.barcode || "629100..."}</span>
                            </div>
                          </td>

                          {/* Name & Category */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-100">{getAssetName(asset)}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                                {getCategoryLabel(asset.category)}
                              </span>
                              {asset.serialNumber && (
                                <span className="font-mono text-slate-500">S/N: {asset.serialNumber}</span>
                              )}
                            </div>
                          </td>

                          {/* Cost Center */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-blue-300">
                              {linkedCC?.nameAr || asset.costCenterName || "مجموعة بن زياد"}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              كود: {linkedCC?.code || asset.costCenterId || "CC-100"}
                            </div>
                          </td>

                          {/* Cost */}
                          <td className="py-3.5 px-4 text-left font-mono font-bold text-slate-200">
                            {formatMoney(cost, asset.currency, currencies)}
                          </td>

                          {/* Accumulated Dep */}
                          <td className="py-3.5 px-4 text-left font-mono font-bold text-rose-400">
                            {formatMoney(accumDep, asset.currency, currencies)}
                          </td>

                          {/* Book Value */}
                          <td className="py-3.5 px-4 text-left font-mono font-black text-emerald-400 text-sm">
                            {formatMoney(bookVal, asset.currency, currencies)}
                          </td>

                          {/* Useful Life Progress */}
                          <td className="py-3.5 px-4 min-w-[130px]">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <span>
                                {life.elapsedYears} / {asset.usefulLifeYears} سنة
                              </span>
                              <span
                                className={`font-bold ${
                                  life.isNearExpiry
                                    ? "text-rose-400"
                                    : life.progressPct > 60
                                    ? "text-amber-400"
                                    : "text-emerald-400"
                                }`}
                              >
                                {life.progressPct}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  life.isNearExpiry
                                    ? "bg-rose-500"
                                    : life.progressPct > 60
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${life.progressPct}%` }}
                              />
                            </div>
                            <div className="text-[9px] text-slate-500 mt-1">
                              متبقي: {life.remainingYears} سنة
                            </div>
                          </td>

                          {/* Custodian & Location */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-200 text-[11px]">
                              {asset.custodianName || "الإدارة المركزية"}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                              {asset.location}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            {asset.status === "ACTIVE" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                                <CheckCircle2 className="w-3 h-3" />
                                نشط قيد العمل
                              </span>
                            ) : asset.status === "UNDER_MAINTENANCE" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                                <Wrench className="w-3 h-3" />
                                قيد الصيانة
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                                مستبعد ومكهن
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedAssetForDetails(asset)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                                title="عرض بطاقة الأصل الشاملة"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-400" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAssetForTransfer(asset);
                                  setTransferTargetCostCenter(costCenters[0]?.id || "");
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                                title="مناقلة الأصل لمركز تكلفة آخر"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5 text-purple-400" />
                              </button>
                              <button
                                onClick={() => setSelectedAssetForMaintenance(asset)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                                title="تسجيل صيانة للأصل"
                              >
                                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                              </button>
                              {asset.status !== "DISPOSED" && (
                                <button
                                  onClick={() => setSelectedAssetForDisposal(asset)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                                  title="استبعاد أو بيع الأصل (Disposal)"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => {
                const life = calculateLifeDetails(asset);
                const cost = getAssetCost(asset);
                const accumDep = asset.accumulatedDepreciation || 0;
                const bookVal = asset.bookValue || cost - accumDep;
                const linkedCC = costCenters.find((c) => c.id === asset.costCenterId);

                return (
                  <div
                    key={asset.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-400">
                              {getAssetCode(asset)}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-semibold">
                              {getCategoryLabel(asset.category)}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-100 text-sm mt-1">
                            {getAssetName(asset)}
                          </h3>
                        </div>

                        {asset.status === "ACTIVE" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                            نشط
                          </span>
                        ) : asset.status === "UNDER_MAINTENANCE" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                            صيانة
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-950 text-rose-400 border border-rose-800 font-bold">
                            مستبعد
                          </span>
                        )}
                      </div>

                      {/* Cost Center badge */}
                      <div className="bg-slate-950/60 rounded-xl p-2.5 mb-3 border border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">مركز التكلفة:</span>
                        <span className="font-bold text-blue-300 truncate max-w-[170px]">
                          {linkedCC?.nameAr || asset.costCenterName || "مجموعة بن زياد"}
                        </span>
                      </div>

                      {/* Financial Metrics */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                        <div className="bg-slate-950/40 rounded-xl p-2 border border-slate-800">
                          <div className="text-[10px] text-slate-400">تكلفة الشراء</div>
                          <div className="font-mono font-bold text-slate-200 mt-0.5 text-[11px]">
                            {formatNumberOnly(cost)}
                          </div>
                        </div>
                        <div className="bg-slate-950/40 rounded-xl p-2 border border-slate-800">
                          <div className="text-[10px] text-slate-400">مجمع الإهلاك</div>
                          <div className="font-mono font-bold text-rose-400 mt-0.5 text-[11px]">
                            {formatNumberOnly(accumDep)}
                          </div>
                        </div>
                        <div className="bg-slate-950/40 rounded-xl p-2 border border-slate-800">
                          <div className="text-[10px] text-slate-400">صافي الدفترية</div>
                          <div className="font-mono font-bold text-emerald-400 mt-0.5 text-[11px]">
                            {formatNumberOnly(bookVal)}
                          </div>
                        </div>
                      </div>

                      {/* Useful Life Progress */}
                      <div className="space-y-1.5 mb-3 bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/60">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">
                            العمر: {life.elapsedYears} من {asset.usefulLifeYears} سنة
                          </span>
                          <span className="font-bold text-amber-400">{life.progressPct}% منقضي</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              life.isNearExpiry
                                ? "bg-rose-500"
                                : life.progressPct > 60
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${life.progressPct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-500">
                          <span>الشراء: {asset.purchaseDate}</span>
                          <span>متبقي: {life.remainingYears} سنة</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                        عهدة: {asset.custodianName || "المركز الرئيسي"}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedAssetForDetails(asset)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>تفاصيل</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAssetForTransfer(asset);
                            setTransferTargetCostCenter(costCenters[0]?.id || "");
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 text-xs transition-colors"
                          title="نقل المركز"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB CONTENT: LIFECYCLE TRACKER & TIMELINE SCHEDULE */}
      {activeTab === "LIFECYCLE" && (
        <AssetUsefulLifeTimeline
          fixedAssets={fixedAssets}
          costCenters={costCenters}
          currencies={currencies}
          displayCurrency={displayCurrency}
          onSelectAssetForDetails={(asset) => setSelectedAssetForDetails(asset)}
        />
      )}

      {/* 6. TAB CONTENT: DEPRECIATION ENGINE */}
      {activeTab === "DEPRECIATION_ENGINE" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-white text-base">
                    محرك احتساب وترحيل إهلاك الفترة آلياً (IAS 16 Periodic Depreciation Engine)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  يقوم النظام بحساب استهلاك الأصول لكل مركز تكلفة وتوليد القيد المحاسبي المزدوج آلياً
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                  <button
                    onClick={() => setDepPeriodType("MONTHLY")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      depPeriodType === "MONTHLY"
                        ? "bg-cyan-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    شهري
                  </button>
                  <button
                    onClick={() => setDepPeriodType("QUARTERLY")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      depPeriodType === "QUARTERLY"
                        ? "bg-cyan-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    ربع سنوي
                  </button>
                  <button
                    onClick={() => setDepPeriodType("ANNUAL")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      depPeriodType === "ANNUAL"
                        ? "bg-cyan-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    سنوي
                  </button>
                </div>

                <button
                  id="btn-execute-depreciation-now"
                  onClick={() => setShowDepreciationModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-cyan-900/40 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>معاينة وترحيل قيد الإهلاك</span>
                </button>
              </div>
            </div>

            {/* Simulated Live Depreciation Preview Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>جدول استحقاق إهلاك الفترة الحالية للأصول الثابتة:</span>
                <span className="text-cyan-400 font-mono">
                  إجمالي قسط الفترة المقدر:{" "}
                  {formatMoney(
                    depPeriodType === "MONTHLY"
                      ? totalMonthlyDep
                      : depPeriodType === "QUARTERLY"
                      ? totalMonthlyDep * 3
                      : totalMonthlyDep * 12,
                    "YER_SANAA",
                    currencies
                  )}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 bg-slate-950/70">
                      <th className="py-2.5 px-3">رمز الأصل واسمه</th>
                      <th className="py-2.5 px-3">مركز التكلفة (بن زياد)</th>
                      <th className="py-2.5 px-3 text-left">التكلفة التاريخية</th>
                      <th className="py-2.5 px-3 text-left">مجمع الإهلاك السابق</th>
                      <th className="py-2.5 px-3 text-left text-cyan-400 font-bold">
                        قسط إهلاك الفترة ({depPeriodType === "MONTHLY" ? "شهر" : depPeriodType === "QUARTERLY" ? "3 أشهر" : "سنة"})
                      </th>
                      <th className="py-2.5 px-3 text-left">المجمع الجديد بعد القيد</th>
                      <th className="py-2.5 px-3 text-left text-emerald-400 font-bold">
                        صافي الدفترية الجديد
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {fixedAssets.map((asset) => {
                      const cost = getAssetCost(asset);
                      const accum = asset.accumulatedDepreciation || 0;
                      const multiplier =
                        depPeriodType === "MONTHLY" ? 1 : depPeriodType === "QUARTERLY" ? 3 : 12;
                      const periodDep = ((asset.annualDepreciation || 0) / 12) * multiplier;
                      const newAccum = accum + periodDep;
                      const newBookVal = Math.max(
                        asset.salvageValue || 0,
                        (asset.bookValue || cost - accum) - periodDep
                      );
                      const linkedCC = costCenters.find((c) => c.id === asset.costCenterId);

                      return (
                        <tr key={asset.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-200">{getAssetName(asset)}</span>
                            <span className="font-mono text-[10px] text-amber-400 block">
                              {getAssetCode(asset)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-blue-300">
                            {linkedCC?.nameAr || asset.costCenterName || "مجموعة بن زياد"}
                          </td>
                          <td className="py-2.5 px-3 text-left font-mono text-slate-300">
                            {formatNumberOnly(cost)}
                          </td>
                          <td className="py-2.5 px-3 text-left font-mono text-rose-400">
                            {formatNumberOnly(accum)}
                          </td>
                          <td className="py-2.5 px-3 text-left font-mono font-bold text-cyan-300 bg-cyan-950/20">
                            +{formatNumberOnly(periodDep)}
                          </td>
                          <td className="py-2.5 px-3 text-left font-mono text-rose-300">
                            {formatNumberOnly(newAccum)}
                          </td>
                          <td className="py-2.5 px-3 text-left font-mono font-bold text-emerald-400">
                            {formatNumberOnly(newBookVal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Standard Journal Entry Preview Box */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-cyan-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>هيكل قيد اليومية العامة الآلي المولد (Standard Auto JV Preview):</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">نوع القيد: DEPRECIATION | معتمد</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-emerald-400 font-bold mb-1">[الطرف المدين - Debit]</div>
                  <div className="text-slate-200 font-semibold">حـ/ 5204 - مصروف إهلاك الأصول الثابتة</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    يُوزع تحليلياً على مراكز تكلفة مجموعة بن زياد حسب أصول كل مركز
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-rose-400 font-bold mb-1">[الطرف الدائن - Credit]</div>
                  <div className="text-slate-200 font-semibold">حـ/ 1209 - مجمع إهلاك الأصول الثابتة المتراكم</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    حساب أصول عكسي (Contra-Asset) يُخفض صافي القيمة الدفترية في الميزانية العمومية
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB CONTENT: COST CENTERS ALLOCATION */}
      {activeTab === "COST_CENTERS_ALLOCATION" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-400" />
                <span>ربط وتوزيع أصول مراكز التكلفة - مجموعة بن زياد</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                توزيع وتقييم أصول المجموعة وتحديد نصيب كل مركز تكلفة من مصاريف الإهلاك الشهرية
              </p>
            </div>

            {onOpenCostCenters && (
              <button
                onClick={onOpenCostCenters}
                className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all"
              >
                إدارة مراكز التكلفة المتقدمة
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {costCenterBreakdown.map((item) => (
              <div
                key={item.costCenter.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-400">
                        {item.costCenter.code}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                        {item.costCenter.type}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-100 text-sm mt-1">
                      {item.costCenter.nameAr}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-purple-950 text-purple-300 border border-purple-800/60 text-xs font-mono font-bold">
                    {item.assetCount} أصل
                  </span>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">القيمة الدفترية للأصول</div>
                    <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                      {formatNumberOnly(item.bookValue)}
                    </div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">قسط الإهلاك الشهري</div>
                    <div className="font-mono font-bold text-amber-300 text-sm mt-0.5">
                      {formatNumberOnly(item.monthlyDep)}
                    </div>
                  </div>
                </div>

                {/* Assets in this Cost Center */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400">الأصول المرتبطة:</div>
                  {item.assets.length === 0 ? (
                    <div className="text-[11px] text-slate-500 italic py-1">
                      لا توجد أصول مرتبطة بهذا المركز حالياً
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {item.assets.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between text-[11px] bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800/80"
                        >
                          <span className="font-medium text-slate-200 truncate max-w-[150px]">
                            {getAssetName(a)}
                          </span>
                          <span className="font-mono font-bold text-slate-400">
                            {formatNumberOnly(a.bookValue || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Responsible manager */}
                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span>المسؤول: {item.costCenter.manager}</span>
                  <button
                    onClick={() => {
                      setSelectedCostCenter(item.costCenter.id);
                      setActiveTab("REGISTER");
                    }}
                    className="text-amber-400 hover:underline font-bold"
                  >
                    عرض الأصول ←
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB CONTENT: MAINTENANCE & DISPOSAL */}
      {activeTab === "MAINTENANCE_DISPOSAL" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Maintenance Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">
                    سجلات صيانة أصول مجموعة بن زياد
                  </h3>
                </div>
                <span className="text-xs text-slate-400">الدورية والطارئة</span>
              </div>

              <div className="space-y-3">
                {fixedAssets
                  .filter((a) => a.maintenanceRecords && a.maintenanceRecords.length > 0)
                  .map((asset) => (
                    <div
                      key={asset.id}
                      className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{getAssetName(asset)}</span>
                        <span className="font-mono text-amber-400">{getAssetCode(asset)}</span>
                      </div>
                      {asset.maintenanceRecords?.map((m) => (
                        <div
                          key={m.id}
                          className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between"
                        >
                          <div>
                            <div className="text-slate-200 font-semibold">{m.description}</div>
                            <div className="text-[10px] text-slate-400">
                              بواسطة: {m.serviceProvider} | التاريخ: {m.date}
                            </div>
                          </div>
                          <div className="font-mono font-bold text-amber-300">
                            {formatMoney(m.cost, m.currency, currencies)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                {fixedAssets.every((a) => !a.maintenanceRecords || a.maintenanceRecords.length === 0) && (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    لا توجد سجلات صيانة مسجلة حتى الآن. يمكنك تسجيل صيانة من شاشة سجل الأصول.
                  </div>
                )}
              </div>
            </div>

            {/* Disposals Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                  <h3 className="font-bold text-white text-sm">
                    الأصول المستبعدة والمكهنة (Disposed Assets)
                  </h3>
                </div>
                <span className="text-xs text-slate-400">أرباح وخسائر الاستبعاد</span>
              </div>

              <div className="space-y-3">
                {fixedAssets
                  .filter((a) => a.status === "DISPOSED")
                  .map((asset) => (
                    <div
                      key={asset.id}
                      className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-200">{getAssetName(asset)}</div>
                          <div className="text-[10px] text-rose-400">تم استبعاد الأصل وإقفال مجمعه</div>
                        </div>
                        <span className="font-mono font-bold text-slate-400">{getAssetCode(asset)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                        <div>التكلفة: {formatNumberOnly(getAssetCost(asset))}</div>
                        <div>المجمع المقفل: {formatNumberOnly(asset.accumulatedDepreciation)}</div>
                      </div>
                    </div>
                  ))}

                {fixedAssets.every((a) => a.status !== "DISPOSED") && (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    جميع أصول مجموعة بن زياد نشطة وتعمل بكفاءة حالياً دون استبعادات.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* MODAL 1: ADD NEW FIXED ASSET */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  إضافة أصل ثابت جديد - مجموعة بن زياد
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAddAsset} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">اسم وتوصيف الأصل الثابت *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مولد طاقة كهربائي كاتم للصوت كتربلر 500KVA"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">تصنيف الأصل *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="BUILDINGS">المباني والعقارات</option>
                    <option value="MACHINERY">الآلات ومعدات المصانع</option>
                    <option value="VEHICLES">أسطول السيارات والنقل</option>
                    <option value="IT_EQUIPMENT">تكنولوجيا المعلومات والخوادم</option>
                    <option value="FURNITURE">الأثاث والتجهيزات المكتبية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    مركز التكلفة التابع له (مجموعة بن زياد) *
                  </label>
                  <select
                    value={formCostCenterId}
                    onChange={(e) => setFormCostCenterId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {costCenters.map((cc) => (
                      <option key={cc.id} value={cc.id}>
                        {cc.code} - {cc.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">تكلفة الاقتناء والشراء *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formPurchaseCost}
                    onChange={(e) => setFormPurchaseCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-left focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">العملة</label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value as CurrencyCode)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="YER_SANAA">ريال يمني (صنعاء)</option>
                    <option value="YER_ADEN">ريال يمني (عدن)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">قيمة الخردة المقدرة</label>
                  <input
                    type="number"
                    value={formSalvageValue}
                    onChange={(e) => setFormSalvageValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-left focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">العمر الإنتاجي (بالسنوات) *</label>
                  <input
                    type="number"
                    min="1"
                    value={formUsefulLifeYears}
                    onChange={(e) => setFormUsefulLifeYears(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-left focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">طريقة احتساب الإهلاك</label>
                  <select
                    value={formDepMethod}
                    onChange={(e) => setFormDepMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="STRAIGHT_LINE">القسط الثابت (Straight Line - IAS 16)</option>
                    <option value="DECLINING_BALANCE">القسط المتناقص المضاعف</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">تاريخ الشراء والتشغيل</label>
                  <input
                    type="date"
                    value={formPurchaseDate}
                    onChange={(e) => setFormPurchaseDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">أمين العهدة / المستلم</label>
                  <input
                    type="text"
                    value={formCustodian}
                    onChange={(e) => setFormCustodian(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">الموقع الجغرافي / المبنى</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">الرقم التسلسلي (S/N)</label>
                  <input
                    type="text"
                    placeholder="رقم الشاصي أو السيريال"
                    value={formSerial}
                    onChange={(e) => setFormSerial(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Live Preview of Calculated Depreciation */}
              <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-3 text-[11px] text-amber-300 flex items-center justify-between">
                <span>
                  قسط الإهلاك السنوي المقدر:{" "}
                  <strong>
                    {formatNumberOnly((formPurchaseCost - formSalvageValue) / (formUsefulLifeYears || 1))}
                  </strong>
                </span>
                <span>
                  قسط الإهلاك الشهري المقدر:{" "}
                  <strong>
                    {formatNumberOnly(
                      (formPurchaseCost - formSalvageValue) / (formUsefulLifeYears || 1) / 12
                    )}
                  </strong>
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-950/50"
                >
                  حفظ وتسجيل الأصل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EXECUTE DEPRECIATION CONFIRMATION */}
      {showDepreciationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">
                  تأكيد تشغيل وترحيل إهلاك الفترة آلياً
                </h3>
              </div>
              <button
                onClick={() => setShowDepreciationModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                سيتم الآن احتساب استهلاك كافة الأصول الثابتة النشطة التابعة لمجموعة بن زياد وتوليد قيد إهلاك
                آلي في دفتر اليومية العامة (GL) وفق معيار المحاسبة الدولي IAS 16.
              </p>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">نوع دورة الإهلاك:</span>
                  <span className="font-bold text-cyan-400">
                    {depPeriodType === "MONTHLY" ? "شهري" : depPeriodType === "QUARTERLY" ? "ربع سنوي" : "سنوي"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">عدد الأصول المشمولة:</span>
                  <span className="font-mono font-bold text-white">{activeAssetsCount} أصل</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">إجمالي مبلغ القيد المحاسبي:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">
                    {formatMoney(
                      depPeriodType === "MONTHLY"
                        ? totalMonthlyDep
                        : depPeriodType === "QUARTERLY"
                        ? totalMonthlyDep * 3
                        : totalMonthlyDep * 12,
                      "YER_SANAA",
                      currencies
                    )}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-cyan-950/30 p-2.5 rounded-xl border border-cyan-800/40">
                ملاحظة: سيتم تحديث رصيد مجمع الإهلاك المتراكم وصافي القيمة الدفترية لكل أصل فور تأكيد الترحيل.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowDepreciationModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                تراجع
              </button>
              <button
                onClick={handleExecuteDepreciation}
                className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black shadow-lg shadow-cyan-900/50"
              >
                تأكيد وترحيل القيد الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ASSET DETAILS / PASSPORT */}
      {selectedAssetForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-400 text-xs">
                    {getAssetCode(selectedAssetForDetails)}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {getCategoryLabel(selectedAssetForDetails.category)}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base mt-1">
                  {getAssetName(selectedAssetForDetails)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssetForDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial & Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">تكلفة الاقتناء</span>
                <div className="font-mono font-bold text-slate-100 mt-1">
                  {formatMoney(
                    getAssetCost(selectedAssetForDetails),
                    selectedAssetForDetails.currency,
                    currencies
                  )}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">مجمع الإهلاك</span>
                <div className="font-mono font-bold text-rose-400 mt-1">
                  {formatMoney(
                    selectedAssetForDetails.accumulatedDepreciation || 0,
                    selectedAssetForDetails.currency,
                    currencies
                  )}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">صافي الدفترية</span>
                <div className="font-mono font-bold text-emerald-400 mt-1">
                  {formatMoney(
                    selectedAssetForDetails.bookValue || 0,
                    selectedAssetForDetails.currency,
                    currencies
                  )}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">قيمة الخردة</span>
                <div className="font-mono font-bold text-slate-300 mt-1">
                  {formatMoney(
                    selectedAssetForDetails.salvageValue || 0,
                    selectedAssetForDetails.currency,
                    currencies
                  )}
                </div>
              </div>
            </div>

            {/* General Specs */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">مركز التكلفة التابع له (بن زياد):</span>
                <span className="font-bold text-blue-300">
                  {costCenters.find((c) => c.id === selectedAssetForDetails.costCenterId)?.nameAr ||
                    selectedAssetForDetails.costCenterName ||
                    "مجموعة بن زياد"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">المسؤول / أمين العهدة:</span>
                <span className="font-medium text-slate-200">
                  {selectedAssetForDetails.custodianName || "المركز الرئيسي"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">الموقع الجغرافي:</span>
                <span className="font-medium text-slate-200">{selectedAssetForDetails.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">الرقم التسلسلي (Serial):</span>
                <span className="font-mono text-slate-300">
                  {selectedAssetForDetails.serialNumber || "لا يوجد"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">تاريخ الشراء:</span>
                <span className="font-mono text-slate-300">
                  {selectedAssetForDetails.purchaseDate}
                </span>
              </div>
            </div>

            {/* Transfer History if any */}
            {selectedAssetForDetails.transferRecords &&
              selectedAssetForDetails.transferRecords.length > 0 && (
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-slate-300">سجل مناقلات مراكز التكلفة:</h4>
                  {selectedAssetForDetails.transferRecords.map((t) => (
                    <div
                      key={t.id}
                      className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] flex items-center justify-between"
                    >
                      <div>
                        <span>
                          من: {t.fromCostCenterName} ← إلى: {t.toCostCenterName}
                        </span>
                        <div className="text-[9px] text-slate-500">
                          السبب: {t.reason} | المسؤول: {t.transferredBy}
                        </div>
                      </div>
                      <span className="font-mono text-slate-400">{t.date}</span>
                    </div>
                  ))}
                </div>
              )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedAssetForDetails(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: TRANSFER ASSET TO ANOTHER COST CENTER */}
      {selectedAssetForTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">
                  مناقلة أصل لمركز تكلفة آخر
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssetForTransfer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-slate-400">الأصل المختار:</span>
              <div className="font-bold text-slate-100 text-sm mt-0.5">
                {getAssetName(selectedAssetForTransfer)} ({getAssetCode(selectedAssetForTransfer)})
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                نقل إلى مركز تكلفة (مجموعة بن زياد) *
              </label>
              <select
                value={transferTargetCostCenter}
                onChange={(e) => setTransferTargetCostCenter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {costCenters.map((cc) => (
                  <option key={cc.id} value={cc.id}>
                    {cc.code} - {cc.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">سبب المناقلة والملاحظات</label>
              <textarea
                rows={2}
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedAssetForTransfer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleExecuteTransfer}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
              >
                تأكيد المناقلة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: MAINTENANCE FORM */}
      {selectedAssetForMaintenance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  تسجيل صيانة للأصل الثابت
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssetForMaintenance(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-slate-400">الأصل:</span>
              <div className="font-bold text-slate-100 mt-0.5">
                {getAssetName(selectedAssetForMaintenance)}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">بيان وتفاصيل أعمال الصيانة *</label>
              <input
                type="text"
                required
                placeholder="مثال: استبدال فلاتر الزيوت وعمرة دورية"
                value={maintDesc}
                onChange={(e) => setMaintDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">تكلفة الصيانة</label>
                <input
                  type="number"
                  value={maintCost}
                  onChange={(e) => setMaintCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-left focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">الجهة المنفذة</label>
                <input
                  type="text"
                  value={maintProvider}
                  onChange={(e) => setMaintProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedAssetForMaintenance(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleExecuteMaintenance}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
              >
                حفظ الصيانة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: DISPOSAL FORM */}
      {selectedAssetForDisposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-base">
                  استبعاد أو تخريد الأصل الثابت (Asset Disposal)
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssetForDisposal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="font-bold text-slate-100">{getAssetName(selectedAssetForDisposal)}</div>
              <div className="text-[11px] text-slate-400">
                القيمة الدفترية الحالية: {formatNumberOnly(selectedAssetForDisposal.bookValue || 0)} ر.ي
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">متحصلات البيع أو التخريد (إن وجدت)</label>
              <input
                type="number"
                value={disposalProceeds}
                onChange={(e) => setDisposalProceeds(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-left focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-[11px]">
              {disposalProceeds >= (selectedAssetForDisposal.bookValue || 0) ? (
                <span className="text-emerald-400 font-bold">
                  أرباح استبعاد مقدرة: +
                  {formatNumberOnly(disposalProceeds - (selectedAssetForDisposal.bookValue || 0))} ر.ي
                </span>
              ) : (
                <span className="text-rose-400 font-bold">
                  خسائر استبعاد مقدرة: -
                  {formatNumberOnly((selectedAssetForDisposal.bookValue || 0) - disposalProceeds)} ر.ي
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedAssetForDisposal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleExecuteDisposal}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                تأكيد الاستبعاد وإقفال الأصل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: PRINTABLE ASSET REGISTER REPORT */}
      {showPrintRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  سجل الأصول الثابتة الرسمي - مجموعة بن زياد
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة المستند</span>
                </button>
                <button
                  onClick={() => setShowPrintRegisterModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-white text-slate-900 p-8 rounded-2xl shadow font-sans text-xs space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">مجموعة بن زياد للاستثمار والتجارة</h2>
                  <p className="text-xs text-slate-600">الإدارة العامة للشؤون المالية والمحاسبية | سجل الأصول الثابتة</p>
                </div>
                <div className="text-left font-mono text-[11px] text-slate-700">
                  <div>تاريخ التقرير: {new Date().toISOString().slice(0, 10)}</div>
                  <div>المعيار المحاسبي: IAS 16</div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 text-center bg-slate-100 p-3 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-500">إجمالي تكلفة الشراء التاريخية</div>
                  <div className="font-mono font-bold text-sm text-slate-900">{formatNumberOnly(totalCost)} ر.ي</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">إجمالي مجمع الإهلاك المتراكم</div>
                  <div className="font-mono font-bold text-sm text-rose-700">{formatNumberOnly(totalAccumulatedDep)} ر.ي</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">صافي القيمة الدفترية للأصول</div>
                  <div className="font-mono font-black text-sm text-emerald-700">{formatNumberOnly(totalBookValue)} ر.ي</div>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-right border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-400 font-bold text-slate-800">
                    <th className="py-2 px-2">الكود</th>
                    <th className="py-2 px-2">اسم الأصل</th>
                    <th className="py-2 px-2">مركز التكلفة</th>
                    <th className="py-2 px-2">تاريخ الشراء</th>
                    <th className="py-2 px-2 text-left">التكلفة</th>
                    <th className="py-2 px-2 text-left">مجمع الإهلاك</th>
                    <th className="py-2 px-2 text-left">صافي الدفترية</th>
                    <th className="py-2 px-2 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {fixedAssets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="py-2 px-2 font-mono font-bold">{getAssetCode(asset)}</td>
                      <td className="py-2 px-2 font-semibold">{getAssetName(asset)}</td>
                      <td className="py-2 px-2 text-slate-700">
                        {costCenters.find((c) => c.id === asset.costCenterId)?.nameAr || asset.costCenterName || "بن زياد"}
                      </td>
                      <td className="py-2 px-2 font-mono">{asset.purchaseDate}</td>
                      <td className="py-2 px-2 text-left font-mono">{formatNumberOnly(getAssetCost(asset))}</td>
                      <td className="py-2 px-2 text-left font-mono text-rose-700">
                        {formatNumberOnly(asset.accumulatedDepreciation)}
                      </td>
                      <td className="py-2 px-2 text-left font-mono font-bold text-emerald-700">
                        {formatNumberOnly(asset.bookValue)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {asset.status === "ACTIVE" ? "نشط" : asset.status === "UNDER_MAINTENANCE" ? "صيانة" : "مستبعد"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-3 gap-4 text-center font-bold text-xs border-t border-slate-300">
                <div>
                  <p>أمين العهدة والمستودعات</p>
                  <p className="mt-8 font-normal text-slate-600">أ. فيصل القدسي</p>
                </div>
                <div>
                  <p>رئيس الحسابات والتدقيق</p>
                  <p className="mt-8 font-normal text-slate-600">أ. محمد عبد الرقيب</p>
                </div>
                <div>
                  <p>المدير المالي والتنفيذي</p>
                  <p className="mt-8 font-normal text-slate-600">د. طارق المنصوري</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FixedAssetsModule;
