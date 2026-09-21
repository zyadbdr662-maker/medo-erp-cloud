import React, { useState, useMemo } from "react";
import {
  GitBranch,
  Building2,
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Bell,
  CheckCircle2,
  DollarSign,
  Plus,
  Edit2,
  Share2,
  Printer,
  ShieldCheck,
  Search,
  Filter,
  Phone,
  Mail,
  UserCheck,
  Package,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  RefreshCw,
  PieChart,
  BarChart3,
  Calendar,
  Clock,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  ArrowRightLeft,
  XCircle,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import {
  Branch,
  CurrencyCode,
  CurrencyInfo,
  Invoice,
  JournalEntry,
  Account,
  CostCenter,
  InventoryItem,
  Voucher,
  CashVaultItem,
  BankAccountItem,
  ERPUser,
} from "../types/erp";
import { convertCurrency, formatMoney, formatNumberOnly } from "../services/erpStorage";

interface BranchManagementViewProps {
  branches: Branch[];
  activeBranchId: string;
  onSetActiveBranchId: (branchId: string) => void;
  onSaveBranch: (branch: Branch) => void;
  onDeleteBranch?: (branchId: string) => void;
  invoices: Invoice[];
  bills: Invoice[];
  journalEntries: JournalEntry[];
  accounts: Account[];
  costCenters: CostCenter[];
  inventoryItems: InventoryItem[];
  vouchers: Voucher[];
  cashVaults: CashVaultItem[];
  bankAccounts: BankAccountItem[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  currentUser?: ERPUser;
  onOpenAi?: () => void;
  onShareReport?: (data: any) => void;
}

export type BranchTab = "DIRECTORY" | "REPORTS" | "REVENUE_DISTRIBUTION" | "ALERTS";

export const BranchManagementView: React.FC<BranchManagementViewProps> = ({
  branches,
  activeBranchId,
  onSetActiveBranchId,
  onSaveBranch,
  onDeleteBranch,
  invoices,
  bills,
  journalEntries,
  accounts,
  costCenters,
  inventoryItems,
  vouchers,
  cashVaults,
  bankAccounts,
  currencies,
  displayCurrency,
  currentUser,
  onOpenAi,
  onShareReport,
}) => {
  const [activeTab, setActiveTab] = useState<BranchTab>("DIRECTORY");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedBranchDetail, setSelectedBranchDetail] = useState<Branch | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Partial<Branch> | null>(null);

  // Filter branches
  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchSearch =
        b.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.city && b.city.includes(searchQuery)) ||
        (b.managerName && b.managerName.includes(searchQuery));
      const matchCity = filterCity === "ALL" || b.city === filterCity;
      const matchStatus = filterStatus === "ALL" || b.status === filterStatus;
      return matchSearch && matchCity && matchStatus;
    });
  }, [branches, searchQuery, filterCity, filterStatus]);

  // Unique cities for filter
  const uniqueCities = useMemo(() => {
    return Array.from(new Set(branches.map((b) => b.city).filter(Boolean)));
  }, [branches]);

  // Helper currency converter
  const toDisplay = (amount: number, fromCurr: CurrencyCode = "YER_SANAA"): number => {
    return convertCurrency(amount, fromCurr, displayCurrency, currencies);
  };

  // Branch Financial Aggregates
  const branchMetrics = useMemo(() => {
    return branches.map((branch) => {
      // Branch Sales (invoices with type SALES / SALES_RETURN)
      const branchInvoices = invoices.filter(
        (inv) => inv.branchId === branch.id || (!inv.branchId && branch.isMainBranch)
      );
      const branchBills = bills.filter(
        (b) => b.branchId === branch.id || (!b.branchId && branch.isMainBranch)
      );

      const totalSales = branchInvoices.reduce((sum, inv) => {
        const amt = toDisplay(inv.totalAmount, inv.currency);
        return inv.type === "SALES_RETURN" ? sum - amt : sum + amt;
      }, 0);

      const totalPurchases = branchBills.reduce((sum, b) => {
        const amt = toDisplay(b.totalAmount, b.currency);
        return b.type === "PURCHASE_RETURN" ? sum - amt : sum + amt;
      }, 0);

      // Branch Expenses from Vouchers or Journal Entries
      const branchVouchers = vouchers.filter(
        (v) => (v.branchId === branch.id || (!v.branchId && branch.isMainBranch)) && v.type === "PAYMENT"
      );
      const totalExpenses = branchVouchers.reduce((sum, v) => sum + toDisplay(v.amount, v.currency), 0);

      // Inventory in this branch
      const branchItems = inventoryItems.filter(
        (item) => item.branchId === branch.id || (!item.branchId && branch.isMainBranch)
      );
      const inventoryValuation = branchItems.reduce((sum, item) => {
        const itemVal = item.quantityOnHand * item.unitCost;
        return sum + toDisplay(itemVal, item.currency);
      }, 0);

      // Cash Vaults in this branch
      const branchVaults = cashVaults.filter(
        (vault) => vault.branchId === branch.id || (!vault.branchId && branch.isMainBranch)
      );
      const totalVaultCash = branchVaults.reduce((sum, vault) => sum + toDisplay(vault.currentBalance, vault.currency), 0);

      // Estimated Profit
      const estimatedGrossMargin = totalSales - totalPurchases;
      const estimatedNetMargin = totalSales - (totalPurchases * 0.7 + totalExpenses);

      return {
        branch,
        totalSales,
        totalPurchases,
        totalExpenses,
        inventoryValuation,
        totalVaultCash,
        itemsCount: branchItems.length,
        invoicesCount: branchInvoices.length,
        estimatedNetMargin,
      };
    });
  }, [branches, invoices, bills, vouchers, inventoryItems, cashVaults, displayCurrency, currencies]);

  // Total Company Sales & Revenue for Distribution
  const totalCompanySales = useMemo(() => {
    return branchMetrics.reduce((sum, m) => sum + Math.max(0, m.totalSales), 0);
  }, [branchMetrics]);

  // Branch Alerts Generator
  const branchAlerts = useMemo(() => {
    const alerts: {
      id: string;
      branchId: string;
      branchName: string;
      type: "STOCK_CRITICAL" | "BUDGET_EXCEEDED" | "CASH_LIMIT" | "OVERDUE_INVOICES" | "INACTIVE_STATUS";
      severity: "CRITICAL" | "WARNING" | "INFO";
      title: string;
      description: string;
      metricValue?: string;
      actionLabel?: string;
      timestamp: string;
    }[] = [];

    branches.forEach((b) => {
      // 1. Check low stock items in branch
      const branchItems = inventoryItems.filter((i) => i.branchId === b.id || (!i.branchId && b.isMainBranch));
      const criticalStock = branchItems.filter((i) => i.quantityOnHand <= (i.reorderPoint || 5));
      if (criticalStock.length > 0) {
        alerts.push({
          id: `STOCK-${b.id}`,
          branchId: b.id,
          branchName: b.nameAr,
          type: "STOCK_CRITICAL",
          severity: criticalStock.length >= 3 ? "CRITICAL" : "WARNING",
          title: `نقص حرج في المخزون (${criticalStock.length} أصناف)`,
          description: `وصل مخزون أصناف مثل (${criticalStock.slice(0, 2).map((x) => x.nameAr).join("، ")}) إلى حد إعادة الطلب الأدنى بمستودع الفرع.`,
          metricValue: `${criticalStock.length} صنف`,
          actionLabel: "طلب توريد / مناقلة",
          timestamp: "مستمر",
        });
      }

      // 2. Check Overdue Invoices
      const branchInvs = invoices.filter(
        (inv) => (inv.branchId === b.id || (!inv.branchId && b.isMainBranch)) && inv.status === "ISSUED"
      );
      const overdue = branchInvs.filter((inv) => {
        if (!inv.dueDate) return false;
        return new Date(inv.dueDate).getTime() < new Date().getTime();
      });
      if (overdue.length > 0) {
        const overdueTotal = overdue.reduce((s, x) => s + toDisplay(x.remainingAmount || x.totalAmount, x.currency), 0);
        alerts.push({
          id: `OVERDUE-${b.id}`,
          branchId: b.id,
          branchName: b.nameAr,
          type: "OVERDUE_INVOICES",
          severity: "WARNING",
          title: `مستحقات بيع متأخرة التحصيل (${overdue.length} فاتورة)`,
          description: `توجد فواتير مبيعات آجلة تجاوزت تاريخ الاستحقاق بمبلغ إجمالي ${formatMoney(overdueTotal, displayCurrency)}.`,
          metricValue: formatMoney(overdueTotal, displayCurrency),
          actionLabel: "متابعة التحصيل واتساب",
          timestamp: "اليوم",
        });
      }

      // 3. Vault Cash Balance Threshold (> 10M YER or < 100k YER)
      const bVaults = cashVaults.filter((v) => v.branchId === b.id || (!v.branchId && b.isMainBranch));
      const totalCash = bVaults.reduce((s, v) => s + toDisplay(v.currentBalance, v.currency), 0);
      if (totalCash < 200000 && bVaults.length > 0) {
        alerts.push({
          id: `CASH-LOW-${b.id}`,
          branchId: b.id,
          branchName: b.nameAr,
          type: "CASH_LIMIT",
          severity: "WARNING",
          title: "انخفاض رصيد السيولة النقدية بصندوق الفرع",
          description: `رصيد الصندوق النقدي للفرع منخفض (${formatMoney(totalCash, displayCurrency)})، قد يؤثر على دفع المصاريف النثرية.`,
          metricValue: formatMoney(totalCash, displayCurrency),
          actionLabel: "تغذية العهدة النقدية",
          timestamp: "لحظي",
        });
      }

      // 4. Branch Status Check
      if (b.status === "INACTIVE") {
        alerts.push({
          id: `STATUS-${b.id}`,
          branchId: b.id,
          branchName: b.nameAr,
          type: "INACTIVE_STATUS",
          severity: "INFO",
          title: "الفرع موقوف مؤقتاً عن العمليات",
          description: `تم تعطيل إصدار القيود والفواتير الجديدة على هذا الفرع لحين إعادة التفعيل.`,
          actionLabel: "تفعيل الفرع",
          timestamp: "إداري",
        });
      }
    });

    return alerts;
  }, [branches, inventoryItems, invoices, cashVaults, displayCurrency, currencies]);

  // Handle Save New or Edit Branch
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch || !editingBranch.nameAr || !editingBranch.code) return;

    const newBranch: Branch = {
      id: editingBranch.id || `BR-${Date.now().toString().slice(-4)}`,
      code: editingBranch.code || `BR-0${branches.length + 1}`,
      nameAr: editingBranch.nameAr,
      nameEn: editingBranch.nameEn || editingBranch.nameAr,
      city: editingBranch.city || "صنعاء",
      address: editingBranch.address || "",
      phone: editingBranch.phone || "",
      email: editingBranch.email || "",
      managerName: editingBranch.managerName || "",
      currency: editingBranch.currency || "YER_SANAA",
      isMainBranch: Boolean(editingBranch.isMainBranch),
      status: editingBranch.status || "ACTIVE",
      costCenterId: editingBranch.costCenterId || "",
      warehouseLocation: editingBranch.warehouseLocation || `مستودع فرع ${editingBranch.nameAr}`,
      createdAt: editingBranch.createdAt || new Date().toISOString().slice(0, 10),
    };

    onSaveBranch(newBranch);
    setIsEditModalOpen(false);
    setEditingBranch(null);
  };

  const openNewBranchModal = () => {
    setEditingBranch({
      code: `BR-0${branches.length + 1}`,
      nameAr: "",
      nameEn: "",
      city: "صنعاء",
      address: "",
      phone: "",
      email: "",
      managerName: "",
      currency: "YER_SANAA",
      isMainBranch: false,
      status: "ACTIVE",
      warehouseLocation: "",
    });
    setIsEditModalOpen(true);
  };

  const openEditBranchModal = (branch: Branch) => {
    setEditingBranch({ ...branch });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Top Header & Overview Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl backdrop-blur">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <GitBranch className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold text-slate-100">
                إدارة ومتابعة الفروع المتعددة
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                {branches.length} فروع نشطة
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              مراقبة مركزية شاملة لأداء الفروع، حركة المستودعات، توزيع الإيرادات، والتنبيهات التشغيلية اللحظية
            </p>
          </div>
        </div>

        {/* Global Branch Filter / Quick Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">الفرع المختار للعرض:</span>
            <select
              value={activeBranchId}
              onChange={(e) => onSetActiveBranchId(e.target.value)}
              className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">
                🏢 كافة الفروع مجمعة (Consolidated)
              </option>
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                  📍 {b.nameAr} ({b.city})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={openNewBranchModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة فرع جديد</span>
          </button>

          {onOpenAi && (
            <button
              onClick={onOpenAi}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>تحليل الذكاء المالي المتقدم</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Branches */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">إجمالي شبكة الفروع</p>
            <p className="text-2xl font-bold text-slate-100">{branches.length}</p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{branches.filter((b) => b.status === "ACTIVE").length} فرع يعمل بكفاءة</span>
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Consolidated Sales */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">مبيعات الفروع المجمعة</p>
            <p className="text-xl font-bold text-emerald-400">{formatMoney(totalCompanySales, displayCurrency)}</p>
            <p className="text-[11px] text-slate-400">من واقع الفواتير المعتمدة</p>
          </div>
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Inter-Branch Inventory Value */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">إجمالي مخزون المستودعات</p>
            <p className="text-xl font-bold text-cyan-400">
              {formatMoney(
                branchMetrics.reduce((sum, m) => sum + m.inventoryValuation, 0),
                displayCurrency
              )}
            </p>
            <p className="text-[11px] text-cyan-300">موزعة على كافة مستودعات الفروع</p>
          </div>
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">تنبيهات الفروع النشطة</p>
            <p className="text-2xl font-bold text-amber-400">{branchAlerts.length}</p>
            <p className="text-[11px] text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>
                {branchAlerts.filter((a) => a.severity === "CRITICAL").length} تنبيهات حرجة تستوجب المتابعة
              </span>
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Bell className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 p-1.5 rounded-xl gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("DIRECTORY")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "DIRECTORY"
              ? "bg-emerald-500 text-slate-950 shadow-md font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>دليل وسجل الفروع ({branches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("REPORTS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "REPORTS"
              ? "bg-emerald-500 text-slate-950 shadow-md font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>تقارير الأداء والمقارنة المالية</span>
        </button>

        <button
          onClick={() => setActiveTab("REVENUE_DISTRIBUTION")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "REVENUE_DISTRIBUTION"
              ? "bg-emerald-500 text-slate-950 shadow-md font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>توزيع الإيرادات والمساهمة الربحية</span>
        </button>

        <button
          onClick={() => setActiveTab("ALERTS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer relative ${
            activeTab === "ALERTS"
              ? "bg-emerald-500 text-slate-950 shadow-md font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>تنبيهات ومخاطر الفروع</span>
          {branchAlerts.length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full">
              {branchAlerts.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: DIRECTORY / BRANCHES LIST */}
      {activeTab === "DIRECTORY" && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="البحث باسم الفرع، الكود، المدينة، المدير..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-9 pl-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">جميع المدن</option>
                {uniqueCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="ACTIVE">نشط ويعمل</option>
                <option value="INACTIVE">موقوف مؤقتاً</option>
              </select>
            </div>
          </div>

          {/* Branch Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBranches.map((branch) => {
              const metric = branchMetrics.find((m) => m.branch.id === branch.id);
              const isSelected = activeBranchId === branch.id;

              return (
                <div
                  key={branch.id}
                  className={`bg-slate-900 border rounded-2xl p-5 transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Top Badges */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-emerald-400 font-bold px-2 py-0.5 bg-emerald-950/80 border border-emerald-800/60 rounded-md">
                            {branch.code}
                          </span>
                          {branch.isMainBranch && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800/60 rounded-md">
                              المركز الرئيسي
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              branch.status === "ACTIVE"
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800/60"
                                : "bg-red-950 text-red-300 border border-red-800/60"
                            }`}
                          >
                            {branch.status === "ACTIVE" ? "نشط" : "موقوف"}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-100 mt-2">{branch.nameAr}</h3>
                        <p className="text-xs text-slate-400 font-sans">{branch.nameEn}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditBranchModal(branch)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="تعديل بيانات الفرع"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata items */}
                    <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-3 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {branch.city} - {branch.address || "العنوان غير محدد"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>المدير: {branch.managerName || "غير محدد"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>العملة الافتراضية: </span>
                        <span className="font-semibold text-emerald-400">
                          {branch.currency === "YER_SANAA"
                            ? "ريال يمني (صنعاء)"
                            : branch.currency === "YER_ADEN"
                            ? "ريال يمني (عدن)"
                            : branch.currency}
                        </span>
                      </div>
                      {branch.warehouseLocation && (
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{branch.warehouseLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Snapshot inside Card */}
                  <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/60 mb-3 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">إجمالي المبيعات:</span>
                      <span className="font-bold text-emerald-400">
                        {formatMoney(metric?.totalSales || 0, displayCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">قيمة المخزون بالفرع:</span>
                      <span className="font-bold text-cyan-400">
                        {formatMoney(metric?.inventoryValuation || 0, displayCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">رصيد الصندوق النقدي:</span>
                      <span className="font-bold text-amber-400">
                        {formatMoney(metric?.totalVaultCash || 0, displayCurrency)}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => onSetActiveBranchId(branch.id)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isSelected ? "الفرع النشط حالياً" : "تحديد كفرع نشط للعمليات"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: BRANCH REPORTS & COMPARATIVE ANALYTICS */}
      {activeTab === "REPORTS" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base md:text-lg font-bold text-slate-100">
                  جدول المقارنة المالية والأداء التشغيلي للفروع
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  عرض تحليلي تفصيلي للأداء المالي، المبيعات، المشتريات، والمخزون لكل فرع محولاً لعملة العرض (
                  {displayCurrency})
                </p>
              </div>

              {onShareReport && (
                <button
                  onClick={() =>
                    onShareReport({
                      title: "تقرير الأداء المقارن للفروع - MeDo ERP",
                      description: `تقرير مالي تفصيلي لأداء ${branches.length} فروع لعام 2026`,
                      url: window.location.href,
                    })
                  }
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>مشاركة التقرير</span>
                </button>
              )}
            </div>

            {/* Comprehensive Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-300 border-b border-slate-800">
                    <th className="p-3 font-semibold">كود واسم الفرع</th>
                    <th className="p-3 font-semibold">المدينة</th>
                    <th className="p-3 font-semibold">العملة الأساسية</th>
                    <th className="p-3 font-semibold text-emerald-400">إجمالي المبيعات</th>
                    <th className="p-3 font-semibold text-blue-400">إجمالي المشتريات</th>
                    <th className="p-3 font-semibold text-amber-400">المصروفات التشغيلية</th>
                    <th className="p-3 font-semibold text-cyan-400">تقييم المخزون</th>
                    <th className="p-3 font-semibold text-purple-400">السيولة النقدية</th>
                    <th className="p-3 font-semibold">صافي الهامش التقديري</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {branchMetrics.map(({ branch, totalSales, totalPurchases, totalExpenses, inventoryValuation, totalVaultCash, estimatedNetMargin }) => (
                    <tr key={branch.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-100 flex items-center gap-2">
                          <span className="font-mono text-emerald-400">{branch.code}</span>
                          <span>{branch.nameAr}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{branch.nameEn}</div>
                      </td>
                      <td className="p-3 text-slate-300">{branch.city}</td>
                      <td className="p-3 font-mono text-slate-400">{branch.currency}</td>
                      <td className="p-3 font-bold text-emerald-400">{formatMoney(totalSales, displayCurrency)}</td>
                      <td className="p-3 font-bold text-blue-400">{formatMoney(totalPurchases, displayCurrency)}</td>
                      <td className="p-3 font-bold text-amber-400">{formatMoney(totalExpenses, displayCurrency)}</td>
                      <td className="p-3 font-bold text-cyan-400">{formatMoney(inventoryValuation, displayCurrency)}</td>
                      <td className="p-3 font-bold text-purple-400">{formatMoney(totalVaultCash, displayCurrency)}</td>
                      <td className="p-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded ${
                            estimatedNetMargin >= 0
                              ? "bg-emerald-950 text-emerald-300"
                              : "bg-rose-950 text-rose-300"
                          }`}
                        >
                          {formatMoney(estimatedNetMargin, displayCurrency)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-950 font-bold border-t-2 border-slate-800 text-slate-100">
                    <td colSpan={3} className="p-3 text-emerald-400">
                      الإجمالي العام لكافة الفروع (Consolidated):
                    </td>
                    <td className="p-3 text-emerald-400 font-bold">
                      {formatMoney(totalCompanySales, displayCurrency)}
                    </td>
                    <td className="p-3 text-blue-400 font-bold">
                      {formatMoney(
                        branchMetrics.reduce((s, m) => s + m.totalPurchases, 0),
                        displayCurrency
                      )}
                    </td>
                    <td className="p-3 text-amber-400 font-bold">
                      {formatMoney(
                        branchMetrics.reduce((s, m) => s + m.totalExpenses, 0),
                        displayCurrency
                      )}
                    </td>
                    <td className="p-3 text-cyan-400 font-bold">
                      {formatMoney(
                        branchMetrics.reduce((s, m) => s + m.inventoryValuation, 0),
                        displayCurrency
                      )}
                    </td>
                    <td className="p-3 text-purple-400 font-bold">
                      {formatMoney(
                        branchMetrics.reduce((s, m) => s + m.totalVaultCash, 0),
                        displayCurrency
                      )}
                    </td>
                    <td className="p-3 text-emerald-400 font-bold">
                      {formatMoney(
                        branchMetrics.reduce((s, m) => s + m.estimatedNetMargin, 0),
                        displayCurrency
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REVENUE DISTRIBUTION & CONTRIBUTION */}
      {activeTab === "REVENUE_DISTRIBUTION" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left/Main Column: Visual Progress Breakdown */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    نسبة مساهمة الفروع في الإيرادات الكلية
                  </h3>
                  <p className="text-xs text-slate-400">
                    حساب نسبة مبيعات كل فرع مقارنة بإجمالي مبيعات الشركة البالغة (
                    {formatMoney(totalCompanySales, displayCurrency)})
                  </p>
                </div>
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>

              {/* Progress bars list */}
              <div className="space-y-4">
                {branchMetrics.map(({ branch, totalSales }) => {
                  const percentage = totalCompanySales > 0 ? (totalSales / totalCompanySales) * 100 : 0;

                  return (
                    <div key={branch.id} className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-400 font-bold">{branch.code}</span>
                          <span className="font-bold text-slate-200">{branch.nameAr}</span>
                          <span className="text-slate-400">({branch.city})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400">
                            {formatMoney(totalSales, displayCurrency)}
                          </span>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800/50">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Visual Bar */}
                      <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(2, percentage))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Strategic Insights */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>رؤى الذكاء المالي المتقدم للإيرادات</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <p className="font-bold text-emerald-400">🏆 الفرع المتصدر للإيرادات</p>
                  <p className="text-slate-300">
                    {branchMetrics.sort((a, b) => b.totalSales - a.totalSales)[0]?.branch.nameAr || "الفرع الرئيسي"} يسهم بالنسبة الأكبر في التدفقات النقدية والمبيعات الشهرية.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <p className="font-bold text-cyan-400">📦 كفاءة دوران المخزون</p>
                  <p className="text-slate-300">
                    فرع عدن والميناء التجاري يمتلك أعلى معدل مناقلة مخزنية ومبيعات نقدية سريعة.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <p className="font-bold text-amber-400">💡 فرصة زيادة المبيعات</p>
                  <p className="text-slate-300">
                    يوصى بتغذية فرع تعز بأصناف المنتجات الأعلى طلباً لرفع حصته في مجمل الإيرادات.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BRANCH ALERTS & OPERATIONAL RISKS */}
      {activeTab === "ALERTS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100">
                شاشة الإنذار المبكر ومراقبة مخاطر الفروع
              </h3>
              <p className="text-xs text-slate-400">
                تنبيهات فورية لنقص المخزون، فواتير المبيعات المتأخرة، وتجاوز حدود السيولة النقدية
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-950 text-amber-300 border border-amber-800/80 rounded-xl text-xs font-bold">
              {branchAlerts.length} تنبيه مسجل
            </span>
          </div>

          {branchAlerts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-200">كافة الفروع تعمل بحالة ممتازة</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                لا توجد أي مخاطر حرجة في المخزون أو السيولة النقدية أو الذمم المتأخرة في الوقت الحالي.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branchAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`bg-slate-900 border rounded-2xl p-4.5 flex flex-col justify-between space-y-3 ${
                    alert.severity === "CRITICAL"
                      ? "border-rose-800/80 bg-rose-950/10"
                      : alert.severity === "WARNING"
                      ? "border-amber-800/80 bg-amber-950/10"
                      : "border-slate-800"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`p-1.5 rounded-lg ${
                            alert.severity === "CRITICAL"
                              ? "bg-rose-500/20 text-rose-400"
                              : alert.severity === "WARNING"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </span>
                        <span className="text-xs font-bold text-slate-200">{alert.branchName}</span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          alert.severity === "CRITICAL"
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : alert.severity === "WARNING"
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {alert.severity === "CRITICAL"
                          ? "حرج جداً"
                          : alert.severity === "WARNING"
                          ? "تحذير"
                          : "ملاحظة"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100">{alert.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                    {alert.metricValue && (
                      <span className="font-mono text-amber-400 font-bold">{alert.metricValue}</span>
                    )}
                    {alert.actionLabel && (
                      <button
                        onClick={() => {
                          if (onShareReport) {
                            onShareReport({
                              title: `تنبيه فرع: ${alert.title}`,
                              description: `${alert.description} - الفرع: ${alert.branchName}`,
                            });
                          }
                        }}
                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
                      >
                        <span>{alert.actionLabel}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Add or Edit Branch */}
      {isEditModalOpen && editingBranch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100">
                  {editingBranch.id ? "تعديل بيانات الفرع" : "إضافة فرع تجاري جديد"}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">كود الفرع *</label>
                  <input
                    type="text"
                    required
                    value={editingBranch.code || ""}
                    onChange={(e) => setEditingBranch({ ...editingBranch, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="BR-01"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">المدينة *</label>
                  <input
                    type="text"
                    required
                    value={editingBranch.city || ""}
                    onChange={(e) => setEditingBranch({ ...editingBranch, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                    placeholder="صنعاء / عدن / تعز / المكلا"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">اسم الفرع (بالعربي) *</label>
                  <input
                    type="text"
                    required
                    value={editingBranch.nameAr || ""}
                    onChange={(e) => setEditingBranch({ ...editingBranch, nameAr: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                    placeholder="مثال: فرع شارع حدة - صنعاء"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">اسم الفرع (بالإنجليزية)</label>
                  <input
                    type="text"
                    value={editingBranch.nameEn || ""}
                    onChange={(e) => setEditingBranch({ ...editingBranch, nameEn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                    placeholder="e.g. Hadda Street Branch - Sana'a"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">العملة الافتراضية للفرع</label>
                  <select
                    value={editingBranch.currency || "YER_SANAA"}
                    onChange={(e) => setEditingBranch({ ...editingBranch, currency: e.target.value as CurrencyCode })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="YER_SANAA">ريال يمني (طبعة صنعاء - YER)</option>
                    <option value="YER_ADEN">ريال يمني (طبعة عدن - YER)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">مدير الفرع المسئول</label>
                  <input
                    type="text"
                    value={editingBranch.managerName || ""}
                    onChange={(e) => setEditingBranch({ ...editingBranch, managerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                    placeholder="أ. محمد عبد الرقيب"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">رقم الهاتف للتواصل</label>
                  <input
                    type="text"
                    value={editingBranch.phone || ""}
                    onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="+967 1 400000"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">حالة الفرع</label>
                  <select
                    value={editingBranch.status || "ACTIVE"}
                    onChange={(e) => setEditingBranch({ ...editingBranch, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="ACTIVE">نشط ويعمل (Active)</option>
                    <option value="INACTIVE">موقوف مؤقتاً (Inactive)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">اسم مستودع البضائع للفرع</label>
                  <input
                    type="text"
                    value={editingBranch.warehouseLocation || ""}
                    onChange={(e) => setEditingBranch({ ...editingBranch, warehouseLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                    placeholder="مثال: المستودع المركزي - الدور الأرضي"
                  />
                </div>

                <div className="sm:col-span-2 border-t border-slate-800/80 pt-4 mt-2">
                  <h4 className="text-xs font-extrabold text-amber-400 flex items-center gap-2 mb-3">
                    <span>🖨️</span>
                    <span>تخصيص ترويسة وشعار طباعة مستندات الفرع (Dynamic Header & Footer)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">اسم المنشأة/الفرع في الهيدر (عربي)</label>
                      <input
                        type="text"
                        value={editingBranch.printConfig?.headerTitleAr || ""}
                        onChange={(e) =>
                          setEditingBranch({
                            ...editingBranch,
                            printConfig: {
                              ...editingBranch.printConfig,
                              headerTitleAr: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                        placeholder="مثال: شركة الأمل - فرع صنعاء"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">اسم المنشأة/الفرع (بالإنجليزية)</label>
                      <input
                        type="text"
                        value={editingBranch.printConfig?.headerTitleEn || ""}
                        onChange={(e) =>
                          setEditingBranch({
                            ...editingBranch,
                            printConfig: {
                              ...editingBranch.printConfig,
                              headerTitleEn: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500 text-xs font-sans"
                        placeholder="e.g. Al-Amal Trading - Sanaa Branch"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">الرقم الضريبي / السجل التجاري للفرع</label>
                      <input
                        type="text"
                        value={editingBranch.printConfig?.taxNumber || ""}
                        onChange={(e) =>
                          setEditingBranch({
                            ...editingBranch,
                            printConfig: {
                              ...editingBranch.printConfig,
                              taxNumber: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500 text-xs font-mono"
                        placeholder="س.ت: 7102030 | ضريبي: 300010020"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">صورة شعار الفرع (Logo Image Base64/URL)</label>
                      <input
                        type="text"
                        value={editingBranch.printConfig?.logoImage || ""}
                        onChange={(e) =>
                          setEditingBranch({
                            ...editingBranch,
                            printConfig: {
                              ...editingBranch.printConfig,
                              logoImage: e.target.value,
                              logoType: e.target.value ? "CUSTOM_IMAGE" : "DEFAULT_CREST",
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500 text-xs font-mono"
                        placeholder="https://... أو Base64"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">شروط وملاحظات الفوتر للفرع (Footer Notes/Terms)</label>
                      <input
                        type="text"
                        value={editingBranch.printConfig?.footerTextAr || ""}
                        onChange={(e) =>
                          setEditingBranch({
                            ...editingBranch,
                            printConfig: {
                              ...editingBranch.printConfig,
                              footerTextAr: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                        placeholder="مثال: البضاعة المباعة لا ترد ولا تستبدل إلا بالفاتورة الرسمية"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isMainBranchCheck"
                    checked={Boolean(editingBranch.isMainBranch)}
                    onChange={(e) => setEditingBranch({ ...editingBranch, isMainBranch: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <label htmlFor="isMainBranchCheck" className="text-slate-200 font-semibold cursor-pointer">
                    تعيين هذا الفرع كالفرع الرئيسي للشركة (Headquarters)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  حفظ وتطبيق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
