import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Printer,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Building2,
  Landmark,
  Wallet,
  PieChart,
  Target,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  CreditCard,
  Tag,
  Coins,
} from "lucide-react";
import {
  Account,
  BankAccountItem,
  CashVaultItem,
  CostCenter,
  CurrencyCode,
  CurrencyInfo,
  Voucher,
  JournalEntry,
  Customer,
  Vendor,
} from "../types/erp";
import {
  QuickAddAccountModal,
  QuickAddCustomerModal,
  QuickAddVendorModal,
} from "./QuickAddModals";

export function convertCurrency(
  amount: number,
  fromCode: CurrencyCode,
  toCode: CurrencyCode,
  currencies: CurrencyInfo[]
): number {
  if (fromCode === toCode || !amount) return amount;
  const fromCurr = currencies.find((c) => c.code === fromCode);
  const toCurr = currencies.find((c) => c.code === toCode);
  if (!fromCurr || !toCurr) return amount;

  const amountInUSD = amount / fromCurr.exchangeRateToUSD;
  return amountInUSD * toCurr.exchangeRateToUSD;
}

interface ExpensesAndRevenuesViewProps {
  accounts: Account[];
  journalEntries: JournalEntry[];
  vouchers: Voucher[];
  cashVaults: CashVaultItem[];
  bankAccounts: BankAccountItem[];
  costCenters: CostCenter[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  customers?: Customer[];
  vendors?: Vendor[];
  onSaveVoucher: (voucher: Voucher) => void;
  onAddAccount?: (account: Account) => void;
  onAddCustomer?: (customer: Customer) => void;
  onAddVendor?: (vendor: Vendor) => void;
  onPrintDocument?: (docType: "RECEIPT" | "PAYMENT", data: any) => void;
}

// Initial Budget Limits for Expense Categories (in YER_SANAA)
interface CategoryBudget {
  accountId: string;
  accountCode: string;
  accountNameAr: string;
  allocatedBudget: number;
}

const DEFAULT_BUDGETS: CategoryBudget[] = [
  { accountId: "5201", accountCode: "5201", accountNameAr: "رواتب وأجور ومزايا العاملين", allocatedBudget: 30000000 },
  { accountId: "5202", accountCode: "5202", accountNameAr: "إيجارات ومصروفات المقرات والفروع", allocatedBudget: 10000000 },
  { accountId: "5203", accountCode: "5203", accountNameAr: "مصروفات الكهرباء والوقود والطاقة الشمسية", allocatedBudget: 6000000 },
  { accountId: "5204", accountCode: "5204", accountNameAr: "مصروفات إهلاك الأصول الثابتة", allocatedBudget: 5000000 },
  { accountId: "5205", accountCode: "5205", accountNameAr: "مصروفات الدعاية والإعلان والتسويق", allocatedBudget: 8000000 },
  { accountId: "5101", accountCode: "5101", accountNameAr: "تكلفة البضاعة المباعة (COGS)", allocatedBudget: 60000000 },
];

export const ExpensesAndRevenuesView: React.FC<ExpensesAndRevenuesViewProps> = ({
  accounts,
  vouchers,
  cashVaults,
  bankAccounts,
  costCenters,
  currencies,
  displayCurrency,
  customers = [],
  vendors = [],
  onSaveVoucher,
  onAddAccount,
  onAddCustomer,
  onAddVendor,
  onPrintDocument,
}) => {
  const [activeTab, setActiveTab] = useState<"EXPENSES" | "REVENUES" | "BUDGETS" | "ANALYTICS">("EXPENSES");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccountFilter, setSelectedAccountFilter] = useState("ALL");
  const [selectedVaultOrBankFilter, setSelectedVaultOrBankFilter] = useState("ALL");
  const [selectedCostCenterFilter, setSelectedCostCenterFilter] = useState("ALL");
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState("ALL");

  // Modal States
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddRevenueModal, setShowAddRevenueModal] = useState(false);
  const [showBudgetEditModal, setShowBudgetEditModal] = useState(false);
  const [selectedVoucherForSlip, setSelectedVoucherForSlip] = useState<Voucher | null>(null);
  const [showQuickAddAccount, setShowQuickAddAccount] = useState<"EXPENSE" | "REVENUE" | null>(null);
  const [showQuickAddVendor, setShowQuickAddVendor] = useState(false);
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);

  // Custom Category Budgets State
  const [budgets, setBudgets] = useState<CategoryBudget[]>(DEFAULT_BUDGETS);
  const [editingBudget, setEditingBudget] = useState<{ accountId: string; amount: number }>({ accountId: "", amount: 0 });

  // Form State for Expense
  const [expenseForm, setExpenseForm] = useState({
    expenseAccountId: "5202", // Default rent
    sourceType: "VAULT" as "VAULT" | "BANK",
    sourceId: cashVaults[0]?.glAccountId || "110101",
    beneficiary: "",
    amount: 0,
    currency: "YER_SANAA" as CurrencyCode,
    costCenterId: costCenters[0]?.id || "",
    paymentMethod: "CASH" as "CASH" | "BANK_TRANSFER" | "CHECK",
    referenceNumber: "",
    taxPercent: 0,
    notes: "",
    date: new Date().toISOString().slice(0, 10),
  });

  // Form State for Revenue
  const [revenueForm, setRevenueForm] = useState({
    revenueAccountId: "4102", // Default Services
    destType: "BANK" as "VAULT" | "BANK",
    destId: bankAccounts[0]?.glAccountId || "110201",
    payer: "",
    amount: 0,
    currency: "YER_SANAA" as CurrencyCode,
    costCenterId: costCenters[0]?.id || "",
    paymentMethod: "BANK_TRANSFER" as "CASH" | "BANK_TRANSFER" | "CHECK",
    referenceNumber: "",
    notes: "",
    date: new Date().toISOString().slice(0, 10),
  });

  // Helper for currency formatting
  const fmt = (val: number, curr: CurrencyCode = displayCurrency) => {
    const converted = convertCurrency(val, "YER_SANAA", curr, currencies);
    return new Intl.NumberFormat("ar-YE", { maximumFractionDigits: 0 }).format(converted);
  };

  const getCurrencySymbol = (code: CurrencyCode) => {
    return currencies.find((c) => c.code === code)?.symbol || code;
  };

  // Accounts Lists
  const expenseAccounts = accounts.filter((a) => a.category === "EXPENSE" && !a.isHeader);
  const revenueAccounts = accounts.filter((a) => a.category === "REVENUE" && !a.isHeader);

  // Vouchers Separated
  const expenseVouchers = vouchers.filter((v) => {
    const isPayment = v.type === "PAYMENT";
    const destAcc = accounts.find((a) => a.id === v.destinationAccountId);
    return isPayment || destAcc?.category === "EXPENSE";
  });

  const revenueVouchers = vouchers.filter((v) => {
    const isReceipt = v.type === "RECEIPT";
    const destAcc = accounts.find((a) => a.id === v.destinationAccountId);
    return isReceipt || destAcc?.category === "REVENUE";
  });

  // Total Calculations (converted to display currency)
  const totalExpensesLocal = expenseVouchers.reduce((sum, v) => {
    const valInYer = convertCurrency(v.amount, v.currency, "YER_SANAA", currencies);
    return sum + valInYer;
  }, 0);

  const totalRevenuesLocal = revenueVouchers.reduce((sum, v) => {
    const valInYer = convertCurrency(v.amount, v.currency, "YER_SANAA", currencies);
    return sum + valInYer;
  }, 0);

  const netProfitLocal = totalRevenuesLocal - totalExpensesLocal;
  const profitMarginPercent = totalRevenuesLocal > 0 ? ((netProfitLocal / totalRevenuesLocal) * 100).toFixed(1) : "0.0";

  // Filtered Expense Vouchers
  const filteredExpenseVouchers = expenseVouchers.filter((v) => {
    const matchSearch =
      v.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.beneficiaryOrPayer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.notes.toLowerCase().includes(searchQuery.toLowerCase());

    const matchAccount = selectedAccountFilter === "ALL" || v.destinationAccountId === selectedAccountFilter;
    const matchSource = selectedVaultOrBankFilter === "ALL" || v.sourceAccountId === selectedVaultOrBankFilter;
    const matchCostCenter = selectedCostCenterFilter === "ALL" || v.costCenterId === selectedCostCenterFilter;
    const matchPeriod = selectedPeriodFilter === "ALL" || v.date.startsWith(selectedPeriodFilter);

    return matchSearch && matchAccount && matchSource && matchCostCenter && matchPeriod;
  });

  // Filtered Revenue Vouchers
  const filteredRevenueVouchers = revenueVouchers.filter((v) => {
    const matchSearch =
      v.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.beneficiaryOrPayer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.notes.toLowerCase().includes(searchQuery.toLowerCase());

    const matchAccount = selectedAccountFilter === "ALL" || v.destinationAccountId === selectedAccountFilter;
    const matchSource = selectedVaultOrBankFilter === "ALL" || v.sourceAccountId === selectedVaultOrBankFilter;
    const matchCostCenter = selectedCostCenterFilter === "ALL" || v.costCenterId === selectedCostCenterFilter;
    const matchPeriod = selectedPeriodFilter === "ALL" || v.date.startsWith(selectedPeriodFilter);

    return matchSearch && matchAccount && matchSource && matchCostCenter && matchPeriod;
  });

  // Combined Vault and Bank Options
  const vaultAndBankOptions = [
    ...cashVaults.map((v) => ({ id: v.glAccountId, name: `${v.name} (خزينة)`, type: "VAULT" })),
    ...bankAccounts.map((b) => ({ id: b.glAccountId, name: `${b.bankName} - ${b.accountNumber}`, type: "BANK" })),
  ];

  // Submit New Expense
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || expenseForm.amount <= 0) {
      alert("يرجى إدخال مبلغ المصروف بشكل صحيح");
      return;
    }

    const expAcc = accounts.find((a) => a.id === expenseForm.expenseAccountId);
    const currInfo = currencies.find((c) => c.code === expenseForm.currency) || currencies[0];
    const amountInLocal = convertCurrency(expenseForm.amount, expenseForm.currency, "YER_SANAA", currencies);

    const newVoucher: Voucher = {
      id: `vch-exp-${Date.now()}`,
      voucherNumber: `PV-EXP-${Date.now().toString().slice(-6)}`,
      type: "PAYMENT",
      date: expenseForm.date,
      beneficiaryOrPayer: expenseForm.beneficiary || "مصاريف إدارية وتشغيلية",
      amount: expenseForm.amount,
      currency: expenseForm.currency,
      exchangeRate: currInfo.exchangeRateToUSD,
      localAmount: amountInLocal,
      paymentMethod: expenseForm.paymentMethod,
      sourceAccountId: expenseForm.sourceId,
      destinationAccountId: expenseForm.expenseAccountId,
      costCenterId: expenseForm.costCenterId,
      referenceNumber: expenseForm.referenceNumber || `REF-${Date.now().toString().slice(-4)}`,
      notes: expenseForm.notes
        ? `[مصروف ${expAcc?.nameAr || ""}] - ${expenseForm.notes}`
        : `اثبات مصروفات (${expAcc?.nameAr || ""})`,
      status: "POSTED",
      createdByName: "أ. محمد عبد الرقيب",
    };

    onSaveVoucher(newVoucher);
    setShowAddExpenseModal(false);
    setExpenseForm({
      expenseAccountId: "5202",
      sourceType: "VAULT",
      sourceId: cashVaults[0]?.glAccountId || "110101",
      beneficiary: "",
      amount: 0,
      currency: "YER_SANAA",
      costCenterId: costCenters[0]?.id || "",
      paymentMethod: "CASH",
      referenceNumber: "",
      taxPercent: 0,
      notes: "",
      date: new Date().toISOString().slice(0, 10),
    });
  };

  // Submit New Revenue
  const handleCreateRevenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revenueForm.amount || revenueForm.amount <= 0) {
      alert("يرجى إدخال مبلغ الإيراد بشكل صحيح");
      return;
    }

    const revAcc = accounts.find((a) => a.id === revenueForm.revenueAccountId);
    const currInfo = currencies.find((c) => c.code === revenueForm.currency) || currencies[0];
    const amountInLocal = convertCurrency(revenueForm.amount, revenueForm.currency, "YER_SANAA", currencies);

    const newVoucher: Voucher = {
      id: `vch-rev-${Date.now()}`,
      voucherNumber: `RV-REV-${Date.now().toString().slice(-6)}`,
      type: "RECEIPT",
      date: revenueForm.date,
      beneficiaryOrPayer: revenueForm.payer || "عميل / جهة دافعة",
      amount: revenueForm.amount,
      currency: revenueForm.currency,
      exchangeRate: currInfo.exchangeRateToUSD,
      localAmount: amountInLocal,
      paymentMethod: revenueForm.paymentMethod,
      sourceAccountId: revenueForm.destId,
      destinationAccountId: revenueForm.revenueAccountId,
      costCenterId: revenueForm.costCenterId,
      referenceNumber: revenueForm.referenceNumber || `REC-${Date.now().toString().slice(-4)}`,
      notes: revenueForm.notes
        ? `[إيراد ${revAcc?.nameAr || ""}] - ${revenueForm.notes}`
        : `إثبات تحصيل إيرادات (${revAcc?.nameAr || ""})`,
      status: "POSTED",
      createdByName: "أ. محمد عبد الرقيب",
    };

    onSaveVoucher(newVoucher);
    setShowAddRevenueModal(false);
    setRevenueForm({
      revenueAccountId: "4102",
      destType: "BANK",
      destId: bankAccounts[0]?.glAccountId || "110201",
      payer: "",
      amount: 0,
      currency: "YER_SANAA",
      costCenterId: costCenters[0]?.id || "",
      paymentMethod: "BANK_TRANSFER",
      referenceNumber: "",
      notes: "",
      date: new Date().toISOString().slice(0, 10),
    });
  };

  // Update Category Budget
  const handleSaveCategoryBudget = () => {
    if (!editingBudget.accountId) return;
    setBudgets((prev) =>
      prev.map((b) => (b.accountId === editingBudget.accountId ? { ...b, allocatedBudget: editingBudget.amount } : b))
    );
    setShowBudgetEditModal(false);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans" dir="rtl">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute left-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 bottom-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                <Coins className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  إدارة المصروفات والإيرادات والموازنات
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  مركز التحكم المالي الموحد لتسجيل النفقات وإيرادات النشاط وضبط الأسقف التقديرية مع الترحيل التلقائي لدفتر اليومية
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-900/30 transition-all duration-200 text-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل مصروف جديد</span>
            </button>

            <button
              onClick={() => setShowAddRevenueModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all duration-200 text-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل إيراد جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenues */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">إجمالي الإيرادات المقيدة</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              {fmt(totalRevenuesLocal)} <span className="text-xs font-normal text-emerald-300">{getCurrencySymbol(displayCurrency)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400/80 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{revenueVouchers.length} سندات تحصيل وإيراد</span>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">إجمالي المصروفات والنفقات</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-400 tracking-tight">
              {fmt(totalExpensesLocal)} <span className="text-xs font-normal text-rose-300">{getCurrencySymbol(displayCurrency)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-rose-400/80 mt-1">
              <Receipt className="w-3.5 h-3.5" />
              <span>{expenseVouchers.length} سندات صرف ونفقة</span>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">صافي الأرباح التشغيلية</span>
            <div className={`p-2 rounded-lg border ${netProfitLocal >= 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black tracking-tight ${netProfitLocal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {fmt(netProfitLocal)} <span className="text-xs font-normal text-slate-300">{getCurrencySymbol(displayCurrency)}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${netProfitLocal >= 0 ? "bg-emerald-950 text-emerald-300 border border-emerald-700/50" : "bg-rose-950 text-rose-300 border border-rose-700/50"}`}>
                هامش ربح {profitMarginPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Coverage */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">تغطية الإيرادات للنفقات</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-blue-400 tracking-tight">
              {totalExpensesLocal > 0 ? ((totalRevenuesLocal / totalExpensesLocal) * 100).toFixed(0) : 100}%
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {totalRevenuesLocal >= totalExpensesLocal ? "مؤشر آمن: الإيرادات تغطي التكاليف" : "تنبيه: المصاريف تتجاوز الدخل"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("EXPENSES")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
              activeTab === "EXPENSES"
                ? "bg-rose-600 text-white shadow-md shadow-rose-900/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>سجل المصروفات ({expenseVouchers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("REVENUES")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
              activeTab === "REVENUES"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>سجل الإيرادات ({revenueVouchers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("BUDGETS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
              activeTab === "BUDGETS"
                ? "bg-amber-600 text-white shadow-md shadow-amber-900/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>الموازنات والأسقف</span>
          </button>

          <button
            onClick={() => setActiveTab("ANALYTICS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
              activeTab === "ANALYTICS"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>التحليلات والمقارنة</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        {(activeTab === "EXPENSES" || activeTab === "REVENUES") && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث بالسند أو البيان أو الجهة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-48 sm:w-60"
              />
            </div>

            <select
              value={selectedCostCenterFilter}
              onChange={(e) => setSelectedCostCenterFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">جميع مراكز التكلفة</option>
              {costCenters.map((cc) => (
                <option key={cc.id} value={cc.id}>
                  {cc.nameAr}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: EXPENSES LIST */}
      {activeTab === "EXPENSES" && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-slate-200 text-sm">جدول جميع سندات وفواتير المصروفات والنفقات</h3>
              </div>
              <span className="text-xs text-slate-400">
                عرض {filteredExpenseVouchers.length} من أصل {expenseVouchers.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm text-slate-200">
                <thead className="bg-slate-950 text-slate-100 font-bold border-b-2 border-slate-700 tracking-wide">
                  <tr>
                    <th className="p-4 font-extrabold text-white text-xs">رقم السند / التاريخ</th>
                    <th className="p-4 font-extrabold text-white text-xs">حساب المصروف</th>
                    <th className="p-4 font-extrabold text-white text-xs">الجهة المستفيدة / المورد</th>
                    <th className="p-4 font-extrabold text-white text-xs">مصدر الدفع (الخزينة/البنك)</th>
                    <th className="p-4 font-extrabold text-white text-xs">مركز التكلفة</th>
                    <th className="p-4 font-extrabold text-white text-xs">المبلغ والعملة</th>
                    <th className="p-4 text-center font-extrabold text-white text-xs">الحالة والطباعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/80">
                  {filteredExpenseVouchers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-400 font-medium">
                        لا توجد قيود أو سندات مصروفات تطابق خيارات البحث الحالية
                      </td>
                    </tr>
                  ) : (
                    filteredExpenseVouchers.map((v) => {
                      const expAcc = accounts.find((a) => a.id === v.destinationAccountId);
                      const srcAcc = accounts.find((a) => a.id === v.sourceAccountId);
                      const cc = costCenters.find((c) => c.id === v.costCenterId);

                      return (
                        <tr key={v.id} className="hover:bg-slate-800/60 transition-colors">
                          <td className="p-4">
                            <div className="font-mono font-bold text-slate-100 text-sm">{v.voucherNumber}</div>
                            <div className="text-xs text-slate-300 flex items-center gap-1 mt-1 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-amber-400" />
                              <span>{v.date}</span>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-rose-300 text-sm">{expAcc?.nameAr || "مصروفات عمومية"}</div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">رمز: {expAcc?.code || "5200"}</div>
                          </td>

                          <td className="p-4">
                            <div className="font-semibold text-slate-100 text-sm">{v.beneficiaryOrPayer || "مصاريف إدارية"}</div>
                            {v.notes && <div className="text-xs text-slate-300 line-clamp-1 mt-0.5">{v.notes}</div>}
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-2 text-slate-200 font-medium text-sm">
                              <Wallet className="w-4 h-4 text-amber-400" />
                              <span>{srcAcc?.nameAr || "خزينة المركز الرئيسي"}</span>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="px-3 py-1 bg-slate-800 text-slate-200 rounded-md border border-slate-600 text-xs font-semibold">
                              {cc?.nameAr || "الإدارة العامة"}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="font-black font-mono text-rose-400 text-base">
                              {new Intl.NumberFormat("ar-YE").format(v.amount)} {getCurrencySymbol(v.currency)}
                            </div>
                            {v.currency !== displayCurrency && (
                              <div className="text-xs text-slate-300 font-medium mt-0.5">
                                ≈ {fmt(v.amount, displayCurrency)} {getCurrencySymbol(displayCurrency)}
                              </div>
                            )}
                          </td>

                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-600 rounded-md text-xs font-bold">
                                مرحل دفترياً
                              </span>
                              <button
                                onClick={() => {
                                  if (onPrintDocument) {
                                    onPrintDocument("PAYMENT", v);
                                  } else {
                                    setSelectedVoucherForSlip(v);
                                  }
                                }}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors border border-slate-600 shadow-sm"
                                title="طباعة سند الصرف"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
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
      )}

      {/* TAB 2: REVENUES LIST */}
      {activeTab === "REVENUES" && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-200 text-sm">جدول جميع سندات وتحصيلات الإيرادات والدخل</h3>
              </div>
              <span className="text-xs text-slate-400">
                عرض {filteredRevenueVouchers.length} من أصل {revenueVouchers.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm text-slate-200">
                <thead className="bg-slate-950 text-slate-100 font-bold border-b-2 border-slate-700 tracking-wide">
                  <tr>
                    <th className="p-4 font-extrabold text-white text-xs">رقم السند / التاريخ</th>
                    <th className="p-4 font-extrabold text-white text-xs">حساب الإيراد</th>
                    <th className="p-4 font-extrabold text-white text-xs">الجهة الدافعة / العميل</th>
                    <th className="p-4 font-extrabold text-white text-xs">خزينة / بنك الإيداع</th>
                    <th className="p-4 font-extrabold text-white text-xs">مركز التكلفة</th>
                    <th className="p-4 font-extrabold text-white text-xs">المبلغ والعملة</th>
                    <th className="p-4 text-center font-extrabold text-white text-xs">الحالة والطباعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/80">
                  {filteredRevenueVouchers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-400 font-medium">
                        لا توجد قيود أو سندات إيرادات تطابق خيارات البحث الحالية
                      </td>
                    </tr>
                  ) : (
                    filteredRevenueVouchers.map((v) => {
                      const revAcc = accounts.find((a) => a.id === v.destinationAccountId);
                      const destVaultOrBank = accounts.find((a) => a.id === v.sourceAccountId);
                      const cc = costCenters.find((c) => c.id === v.costCenterId);

                      return (
                        <tr key={v.id} className="hover:bg-slate-800/60 transition-colors">
                          <td className="p-4">
                            <div className="font-mono font-bold text-slate-100 text-sm">{v.voucherNumber}</div>
                            <div className="text-xs text-slate-300 flex items-center gap-1 mt-1 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{v.date}</span>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-emerald-300 text-sm">{revAcc?.nameAr || "إيرادات خدمات ومبيعات"}</div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">رمز: {revAcc?.code || "4100"}</div>
                          </td>

                          <td className="p-4">
                            <div className="font-semibold text-slate-100 text-sm">{v.beneficiaryOrPayer || "عميل خارجي"}</div>
                            {v.notes && <div className="text-xs text-slate-300 line-clamp-1 mt-0.5">{v.notes}</div>}
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-2 text-slate-200 font-medium text-sm">
                              <Landmark className="w-4 h-4 text-emerald-400" />
                              <span>{destVaultOrBank?.nameAr || "بنك التضامن الإسلامي"}</span>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="px-3 py-1 bg-slate-800 text-slate-200 rounded-md border border-slate-600 text-xs font-semibold">
                              {cc?.nameAr || "المبيعات والتسويق"}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="font-black font-mono text-emerald-400 text-base">
                              {new Intl.NumberFormat("ar-YE").format(v.amount)} {getCurrencySymbol(v.currency)}
                            </div>
                            {v.currency !== displayCurrency && (
                              <div className="text-xs text-slate-300 font-medium mt-0.5">
                                ≈ {fmt(v.amount, displayCurrency)} {getCurrencySymbol(displayCurrency)}
                              </div>
                            )}
                          </td>

                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-600 rounded-md text-xs font-bold">
                                مرحل دفترياً
                              </span>
                              <button
                                onClick={() => {
                                  if (onPrintDocument) {
                                    onPrintDocument("RECEIPT", v);
                                  } else {
                                    setSelectedVoucherForSlip(v);
                                  }
                                }}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors border border-slate-600 shadow-sm"
                                title="طباعة سند القبض"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
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
      )}

      {/* TAB 3: OPERATING BUDGETS */}
      {activeTab === "BUDGETS" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  <span>ضبط الموازنات التقديرية والأسقف المالية للمصروفات</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  تحديد الحدود القصوى للمصاريف التشغيلية ومراقبة نسب الاستهلاك الفعلي لمنع تجاوز الموازنة المعتمدة
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((b) => {
                // Calculate actual spent for this expense category from vouchers
                const categoryVouchers = expenseVouchers.filter((v) => v.destinationAccountId === b.accountId);
                const actualSpentLocal = categoryVouchers.reduce((sum, v) => {
                  return sum + convertCurrency(v.amount, v.currency, "YER_SANAA", currencies);
                }, 0);

                const percentSpent = b.allocatedBudget > 0 ? (actualSpentLocal / b.allocatedBudget) * 100 : 0;
                const remaining = b.allocatedBudget - actualSpentLocal;

                let statusColor = "bg-emerald-500";
                let statusText = "ضمن الحدود الآمنة";
                let badgeStyle = "bg-emerald-950 text-emerald-300 border-emerald-700/50";

                if (percentSpent >= 80 && percentSpent < 100) {
                  statusColor = "bg-amber-500";
                  statusText = "اقتراب من سقف الموازنة";
                  badgeStyle = "bg-amber-950 text-amber-300 border-amber-700/50";
                } else if (percentSpent >= 100) {
                  statusColor = "bg-rose-500";
                  statusText = "تجاوز السقف التقديري!";
                  badgeStyle = "bg-rose-950 text-rose-300 border-rose-700/50";
                }

                return (
                  <div key={b.accountId} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-400">[{b.accountCode}]</span>
                          <span className="font-bold text-slate-200 text-sm">{b.accountNameAr}</span>
                        </div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badgeStyle}`}>
                          {statusText}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setEditingBudget({ accountId: b.accountId, amount: b.allocatedBudget });
                          setShowBudgetEditModal(true);
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 underline"
                      >
                        تعديل السقف
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>الاستهلاك الفعلي: {percentSpent.toFixed(1)}%</span>
                        <span>المتبقي: {fmt(remaining)} {getCurrencySymbol(displayCurrency)}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${statusColor}`}
                          style={{ width: `${Math.min(percentSpent, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">الموازنة المعتمدة</span>
                        <span className="font-bold text-slate-200 font-mono">{fmt(b.allocatedBudget)} {getCurrencySymbol(displayCurrency)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">المصروف الفعلي حتى الآن</span>
                        <span className="font-bold text-rose-400 font-mono">{fmt(actualSpentLocal)} {getCurrencySymbol(displayCurrency)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS */}
      {activeTab === "ANALYTICS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expenses Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-rose-400" />
              <span>تحليل هيكل وتوزيع المصروفات حسب البنود</span>
            </h3>

            <div className="space-y-3">
              {expenseAccounts.map((acc) => {
                const accVouchers = expenseVouchers.filter((v) => v.destinationAccountId === acc.id);
                const sumSpent = accVouchers.reduce((s, v) => s + convertCurrency(v.amount, v.currency, "YER_SANAA", currencies), 0);
                const percent = totalExpensesLocal > 0 ? (sumSpent / totalExpensesLocal) * 100 : 0;

                if (sumSpent === 0) return null;

                return (
                  <div key={acc.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{acc.nameAr}</span>
                      <span className="text-rose-400 font-bold font-mono">{fmt(sumSpent)} ({percent.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenues Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>تحليل مصادر وروافد الإيرادات</span>
            </h3>

            <div className="space-y-3">
              {revenueAccounts.map((acc) => {
                const accVouchers = revenueVouchers.filter((v) => v.destinationAccountId === acc.id);
                const sumEarned = accVouchers.reduce((s, v) => s + convertCurrency(v.amount, v.currency, "YER_SANAA", currencies), 0);
                const percent = totalRevenuesLocal > 0 ? (sumEarned / totalRevenuesLocal) * 100 : 0;

                if (sumEarned === 0) return null;

                return (
                  <div key={acc.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{acc.nameAr}</span>
                      <span className="text-emerald-400 font-bold font-mono">{fmt(sumEarned)} ({percent.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD EXPENSE */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <Receipt className="w-5 h-5" />
                <span>تسجيل قيد وسند مصروف جديد</span>
              </div>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Expense Account */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">بند المصروف (الحساب)*</label>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddAccount("EXPENSE")}
                      className="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-bold bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30 transition-all"
                      title="إضافة بند مصروف جديد في الدليل المحاسبي"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة بند مصروف</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={expenseForm.expenseAccountId}
                      onChange={(e) => setExpenseForm((p) => ({ ...p, expenseAccountId: e.target.value }))}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                      required
                    >
                      {expenseAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          [{a.code}] {a.nameAr}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddAccount("EXPENSE")}
                      className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center"
                      title="إضافة بند مصروف جديد (+)"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Vault or Bank Source */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">مصدر الدفع (الخزينة/البنك)*</label>
                  <select
                    value={expenseForm.sourceId}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, sourceId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                    required
                  >
                    {vaultAndBankOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">المبلغ*</label>
                  <input
                    type="number"
                    min="1"
                    value={expenseForm.amount || ""}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="مثال: 150000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-rose-500 font-mono font-bold"
                    required
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">العملة*</label>
                  <select
                    value={expenseForm.currency}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, currency: e.target.value as CurrencyCode }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Beneficiary */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">الجهة المستفيدة / المورد</label>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddVendor(true)}
                      className="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-bold bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30 transition-all"
                      title="إضافة مورد أو داين جديد"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة مورد</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="اسم المورد أو المستفيد..."
                      value={expenseForm.beneficiary}
                      onChange={(e) => setExpenseForm((p) => ({ ...p, beneficiary: e.target.value }))}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowQuickAddVendor(true)}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center border border-slate-700"
                      title="إضافة مورد أو داين جديد (+)"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cost Center */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">مركز التكلفة*</label>
                  <select
                    value={expenseForm.costCenterId}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, costCenterId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                  >
                    {costCenters.map((cc) => (
                      <option key={cc.id} value={cc.id}>
                        {cc.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ref Number */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">رقم الفاتورة/المستند المرجعي</label>
                  <input
                    type="text"
                    placeholder="رقم المستند المرجعي..."
                    value={expenseForm.referenceNumber}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, referenceNumber: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">تاريخ الصرف</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">البيان والتوضيح المحاسبي</label>
                <textarea
                  rows={2}
                  placeholder="سبب وتفاصيل الصرف..."
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-900/30"
                >
                  حفظ وترحيل المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD REVENUE */}
      {showAddRevenueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <TrendingUp className="w-5 h-5" />
                <span>تسجيل قيد وسند إيراد/تحصيل جديد</span>
              </div>
              <button onClick={() => setShowAddRevenueModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRevenue} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Revenue Account */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">بند الإيراد (الحساب)*</label>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddAccount("REVENUE")}
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 transition-all"
                      title="إضافة بند إيراد جديد في الدليل المحاسبي"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة بند إيراد</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={revenueForm.revenueAccountId}
                      onChange={(e) => setRevenueForm((p) => ({ ...p, revenueAccountId: e.target.value }))}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                      required
                    >
                      {revenueAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          [{a.code}] {a.nameAr}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddAccount("REVENUE")}
                      className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center"
                      title="إضافة بند إيراد جديد (+)"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Vault or Bank Destination */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">خزينة/بنك التحصيل*</label>
                  <select
                    value={revenueForm.destId}
                    onChange={(e) => setRevenueForm((p) => ({ ...p, destId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                    required
                  >
                    {vaultAndBankOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">المبلغ*</label>
                  <input
                    type="number"
                    min="1"
                    value={revenueForm.amount || ""}
                    onChange={(e) => setRevenueForm((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="مثال: 500000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    required
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">العملة*</label>
                  <select
                    value={revenueForm.currency}
                    onChange={(e) => setRevenueForm((p) => ({ ...p, currency: e.target.value as CurrencyCode }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payer */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">الجهة المسددة / العميل</label>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddCustomer(true)}
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 transition-all"
                      title="إضافة عميل جديد لم يكن مسجلاً"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة عميل</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="اسم العميل أو الجهة..."
                      value={revenueForm.payer}
                      onChange={(e) => setRevenueForm((p) => ({ ...p, payer: e.target.value }))}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowQuickAddCustomer(true)}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center border border-slate-700"
                      title="إضافة عميل جديد (+)"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cost Center */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">مركز التكلفة*</label>
                  <select
                    value={revenueForm.costCenterId}
                    onChange={(e) => setRevenueForm((p) => ({ ...p, costCenterId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {costCenters.map((cc) => (
                      <option key={cc.id} value={cc.id}>
                        {cc.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ref Number */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">رقم الإشعار/المستند المرجعي</label>
                  <input
                    type="text"
                    placeholder="رقم الإشعار أو الشيك..."
                    value={revenueForm.referenceNumber}
                    onChange={(e) => setRevenueForm((p) => ({ ...p, referenceNumber: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">تاريخ التحصيل</label>
                  <input
                    type="date"
                    value={revenueForm.date}
                    onChange={(e) => setRevenueForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">البيان والتوضيح المحاسبي</label>
                <textarea
                  rows={2}
                  placeholder="سبب وتفاصيل التحصيل..."
                  value={revenueForm.notes}
                  onChange={(e) => setRevenueForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRevenueModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/30"
                >
                  حفظ وترحيل الإيراد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT BUDGET */}
      {showBudgetEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5 space-y-4 text-xs">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span>تعديل سقف الموازنة التقديرية</span>
            </h3>

            <div>
              <label className="block text-slate-400 mb-1">مبلغ السقف المعتمد الجديد (بالريال اليمني)</label>
              <input
                type="number"
                value={editingBudget.amount || ""}
                onChange={(e) => setEditingBudget((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowBudgetEditModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveCategoryBudget}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow-lg shadow-amber-900/30"
              >
                حفظ التعديل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRINT SLIP PREVIEW */}
      {selectedVoucherForSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-8 space-y-6 text-xs">
            {/* Slip Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">مجموعة مـيـدو التجارية والمالية الذكية</h2>
                <p className="text-slate-600 text-xs">سند رسمـي مـعتـمد للـعـمـليـات المـالـية</p>
              </div>
              <div className="text-left font-mono">
                <div className="font-bold text-base text-slate-900">{selectedVoucherForSlip.voucherNumber}</div>
                <div className="text-slate-500 text-xs">{selectedVoucherForSlip.date}</div>
              </div>
            </div>

            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-center font-bold text-lg text-slate-900">
              {selectedVoucherForSlip.type === "PAYMENT" ? "سـنـد صــرف مـصـروفـات" : "سـنـد قــبــض إيــرادات"}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 block text-xs">الجهة/العميل:</span>
                <span className="font-bold text-slate-900">{selectedVoucherForSlip.beneficiaryOrPayer}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">المبلغ والعملة:</span>
                <span className="font-bold font-mono text-slate-900 text-base">
                  {new Intl.NumberFormat("ar-YE").format(selectedVoucherForSlip.amount)} {getCurrencySymbol(selectedVoucherForSlip.currency)}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-xs">البيان والملاحظات:</span>
              <p className="font-medium text-slate-800 mt-0.5">{selectedVoucherForSlip.notes}</p>
            </div>

            <div className="pt-8 border-t border-slate-300 grid grid-cols-3 text-center text-xs text-slate-700">
              <div>
                <p className="font-bold">المستلم / المستفيد</p>
                <div className="h-12 border-b border-dashed border-slate-400 mt-2" />
              </div>
              <div>
                <p className="font-bold">أمين الصندوق / المراجع</p>
                <div className="h-12 border-b border-dashed border-slate-400 mt-2" />
              </div>
              <div>
                <p className="font-bold">اعتماد المدير المالي</p>
                <div className="h-12 border-b border-dashed border-slate-400 mt-2" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setSelectedVoucherForSlip(null)}
                className="px-4 py-2 bg-slate-200 text-slate-800 font-bold rounded-xl"
              >
                إغلاق
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة السند</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Quick Add Account (Expense or Revenue) */}
      <QuickAddAccountModal
        isOpen={showQuickAddAccount !== null}
        onClose={() => setShowQuickAddAccount(null)}
        currencies={currencies}
        existingAccounts={accounts}
        defaultType={showQuickAddAccount || "EXPENSE"}
        title={
          showQuickAddAccount === "REVENUE"
            ? "إضافة بند إيراد / حساب جديد بالدليل"
            : "إضافة بند مصروف / حساب جديد بالدليل"
        }
        onAccountCreated={(newAcc) => {
          onAddAccount?.(newAcc);
          if (showQuickAddAccount === "EXPENSE") {
            setExpenseForm((p) => ({ ...p, expenseAccountId: newAcc.id }));
          } else {
            setRevenueForm((p) => ({ ...p, revenueAccountId: newAcc.id }));
          }
        }}
      />

      {/* Modal: Quick Add Vendor (Expense Beneficiary) */}
      <QuickAddVendorModal
        isOpen={showQuickAddVendor}
        onClose={() => setShowQuickAddVendor(false)}
        currencies={currencies}
        existingVendors={vendors}
        onVendorCreated={(newVend) => {
          onAddVendor?.(newVend);
          setExpenseForm((p) => ({ ...p, beneficiary: newVend.nameAr }));
        }}
      />

      {/* Modal: Quick Add Customer (Revenue Payer) */}
      <QuickAddCustomerModal
        isOpen={showQuickAddCustomer}
        onClose={() => setShowQuickAddCustomer(false)}
        currencies={currencies}
        existingCustomers={customers}
        onCustomerCreated={(newCust) => {
          onAddCustomer?.(newCust);
          setRevenueForm((p) => ({ ...p, payer: newCust.nameAr }));
        }}
      />
    </div>
  );
};
export default ExpensesAndRevenuesView;
