import React, { useMemo, useCallback, useState, useTransition } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Package,
  BookOpenCheck,
  ReceiptText,
  Landmark,
  PieChart,
  FolderTree,
  Coins,
  Settings,
  ShieldCheck,
  Sparkles,
  DatabaseBackup,
  ChevronLeft,
  Users,
  Building2,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Boxes,
  BookOpen,
  Loader2,
} from "lucide-react";
import { NavTab } from "./Sidebar";
import { ERPState, CurrencyCode, CurrencyInfo } from "../types/erp";
import { formatMoney } from "../services/erpStorage";

interface ModuleConfig {
  id: NavTab;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  textColor: string;
  badge: string;
  badgeColor: string;
  counter: string;
}

interface MobileHomeHubProps {
  onSelectModule: (tab: NavTab) => void;
  erpState: ERPState;
  displayCurrency: CurrencyCode;
  currencies: CurrencyInfo[];
  onOpenQuickAction: (action: "INVOICE" | "JOURNAL" | "RECEIPT" | "PAYMENT" | "INVENTORY") => void;
  onOpenAi: () => void;
}

// Memoized single module card to prevent re-rendering all items and eliminate INP delays
const ModuleCard = React.memo<{
  module: ModuleConfig;
  isSelected: boolean;
  onSelect: (id: NavTab) => void;
}>(({ module, isSelected, onSelect }) => {
  const Icon = module.icon;

  const handleClick = useCallback(() => {
    onSelect(module.id);
  }, [onSelect, module.id]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-right bg-slate-900/90 hover:bg-slate-800/90 border ${
        isSelected ? "border-emerald-500/80 bg-slate-800/95" : "border-slate-800/90 hover:border-slate-700"
      } rounded-2xl p-4 transition-colors duration-150 shadow-md group cursor-pointer block touch-manipulation`}
      style={{ willChange: "auto" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-white shadow-md flex-shrink-0 group-hover:brightness-110 transition-opacity`}
          >
            {isSelected ? (
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            ) : (
              <Icon className="w-6 h-6" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-white truncate">
                {module.title}
              </h3>
              {module.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border bg-transparent text-slate-100 ${module.badgeColor.replace(/bg-.*?-500\/20/g, '')}`}
                >
                  {module.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-normal">
              {module.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 pt-1">
          {module.counter && (
            <span className="text-[11px] font-bold text-slate-400 font-mono hidden sm:inline">
              {module.counter}
            </span>
          )}
          <div className="w-7 h-7 rounded-lg bg-slate-800/80 group-hover:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </div>
        </div>
      </div>
    </button>
  );
});

ModuleCard.displayName = "ModuleCard";

export const MobileHomeHub: React.FC<MobileHomeHubProps> = ({
  onSelectModule,
  erpState,
  displayCurrency,
  currencies,
  onOpenQuickAction,
  onOpenAi,
}) => {
  const [hubSearch, setHubSearch] = useState("");
  const [pendingModuleId, setPendingModuleId] = useState<NavTab | null>(null);
  const [isPending, startTransition] = useTransition();

  // Optimized module click handler using async startTransition to avoid blocking UI frame updates
  const handleSelectModule = useCallback(
    (id: NavTab) => {
      setPendingModuleId(id);
      startTransition(() => {
        onSelectModule(id);
      });
    },
    [onSelectModule]
  );

  // Memoized quick stats calculation
  const stats = useMemo(() => {
    const totalSales =
      erpState.invoices
        ?.filter((i) => i.type === "SALES")
        ?.reduce((sum, i) => sum + (Number(i.grandTotal) || 0), 0) || 0;

    const totalPurchases =
      erpState.bills?.reduce((sum, b) => sum + (Number(b.grandTotal) || 0), 0) || 0;

    const activeInvoicesCount = erpState.invoices?.length || 0;
    const itemsCount = erpState.inventoryItems?.length || 0;
    const entriesCount = erpState.journalEntries?.length || 0;
    const vouchersCount = erpState.vouchers?.length || 0;

    return {
      totalSales,
      totalPurchases,
      activeInvoicesCount,
      itemsCount,
      entriesCount,
      vouchersCount,
    };
  }, [
    erpState.invoices,
    erpState.bills,
    erpState.inventoryItems,
    erpState.journalEntries,
    erpState.vouchers,
  ]);

  const formattedSales = useMemo(
    () => formatMoney(stats.totalSales, displayCurrency, currencies),
    [stats.totalSales, displayCurrency, currencies]
  );

  const formattedPurchases = useMemo(
    () => formatMoney(stats.totalPurchases, displayCurrency, currencies),
    [stats.totalPurchases, displayCurrency, currencies]
  );

  // Memoize modules array to avoid reallocating 15+ complex objects on each render
  const modules: ModuleConfig[] = useMemo(
    () => [
      {
        id: "DASHBOARD" as NavTab,
        title: "لوحة التحكم الرئيسية",
        shortTitle: "لوحة التحكم",
        description: "المؤشرات المالية، السيولة، التحليلات، وإحصائيات المركز المالي",
        icon: LayoutDashboard,
        color: "from-blue-600 to-indigo-700",
        textColor: "text-blue-400",
        badge: "نظرة عامة",
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        counter: "مباشر",
      },
      {
        id: "INTEGRATED_ERP" as NavTab,
        title: "المنظومة المحاسبية والإدارية المتكاملة",
        shortTitle: "المنظومة المتكاملة",
        description: "مختبر دورات الترحيل والتكامل، الدورة المستندية الكاملة، ومحاكي العمليات المباشر",
        icon: Boxes,
        color: "from-slate-900 via-[#163863] to-slate-950",
        textColor: "text-amber-400",
        badge: "S/4HANA Suite",
        badgeColor: "bg-sap-secondary/20 text-sap-secondary border border-sap-secondary/30",
        counter: "مختبر مالي",
      },
      {
        id: "MEDO_BROCHURE" as NavTab,
        title: "كتيب ودليل نظام ميدو إرب (MeDo)",
        shortTitle: "دليل وكتيب النظام",
        description: "كتيب مواصفات ومعايير النظام ومحاكاة الذكاء المالي المتقدم والمزامنة المستوحاة من SAP",
        icon: BookOpen,
        color: "from-amber-600 via-[#D4AF37] to-amber-800",
        textColor: "text-[#D4AF37]",
        badge: "كتيب ساب",
        badgeColor: "bg-sap-secondary/20 text-sap-secondary border border-sap-secondary/30",
        counter: "دليل فني",
      },
      {
        id: "SALES_RETURNS" as NavTab,
        title: "المبيعات ونقاط البيع",
        shortTitle: "المبيعات",
        description: "فواتير المبيعات، عروض الأسعار، مرتجعات المبيعات، وحسابات العملاء",
        icon: ShoppingBag,
        color: "from-emerald-600 to-teal-700",
        textColor: "text-emerald-400",
        badge: `${stats.activeInvoicesCount} فاتورة`,
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        counter: formattedSales,
      },
      {
        id: "PURCHASES_RETURNS" as NavTab,
        title: "المشتريات والموردين",
        shortTitle: "المشتريات",
        description: "أوامر الشراء، فواتير المشتريات، مردودات المشتريات، ومستحقات الموردين",
        icon: Truck,
        color: "from-amber-600 to-orange-700",
        textColor: "text-amber-400",
        badge: `${erpState.bills?.length || 0} فاتورة`,
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        counter: formattedPurchases,
      },
      {
        id: "CUSTOMERS_AR" as NavTab,
        title: "العملاء والذمم المدينة (AR)",
        shortTitle: "العملاء والذمم",
        description: "إدارة المدينين، حسابات العملاء، كشوفات الأرصدة، وأعمار الديون",
        icon: Users,
        color: "from-teal-600 to-cyan-700",
        textColor: "text-teal-400",
        badge: `${erpState.customers?.length || 0} عميل`,
        badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
        counter: "أرصدة وكشوفات",
      },
      {
        id: "VENDORS_AP" as NavTab,
        title: "الموردين والذمم الدائنة (AP)",
        shortTitle: "الموردين والذمم",
        description: "إدارة الدائنين، حسابات الموردين، مستحقات الدفع، وجدولة السداد",
        icon: Building2,
        color: "from-indigo-600 to-blue-700",
        textColor: "text-indigo-400",
        badge: `${erpState.vendors?.length || 0} مورد`,
        badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
        counter: "أرصدة وسداد",
      },
      {
        id: "INVENTORY" as NavTab,
        title: "إدارة المخزون والمستودعات",
        shortTitle: "المخزون",
        description: "دليل الأصناف، الجرد، التوريد والصرف المخزني، وإشعارات حد الطلب",
        icon: Package,
        color: "from-purple-600 to-indigo-800",
        textColor: "text-purple-400",
        badge: `${stats.itemsCount} صنف`,
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        counter: `${erpState.warehouses?.length || 1} مستودعات`,
      },
      {
        id: "GENERAL_LEDGER" as NavTab,
        title: "الأستاذ العام ودليل الحسابات",
        shortTitle: "الأستاذ العام",
        description: "كشوف الحسابات، ميزان المراجعة، شجرة الحسابات (COA) ومعايير IFRS",
        icon: BookOpenCheck,
        color: "from-cyan-600 to-blue-700",
        textColor: "text-cyan-400",
        badge: `${erpState.accounts?.length || 0} حساب`,
        badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
        counter: "دليل محاسبي",
      },
      {
        id: "JOURNAL_ENTRIES" as NavTab,
        title: "دفتر القيود اليومية",
        shortTitle: "القيود المحاسبية",
        description: "إنشاء واعتماد القيود، تدقيق التوازن الآلي، والتسويات المالية",
        icon: FileSpreadsheet,
        color: "from-teal-600 to-emerald-800",
        textColor: "text-teal-400",
        badge: `${stats.entriesCount} قيد`,
        badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
        counter: "متزن آلياً",
      },
      {
        id: "VOUCHERS" as NavTab,
        title: "سندات القبض والصرف",
        shortTitle: "السندات المالية",
        description: "سندات القبض للمبيعات، سندات الصرف للموردين والمصروفات، وطرق الدفع",
        icon: ReceiptText,
        color: "from-rose-600 to-pink-700",
        textColor: "text-rose-400",
        badge: `${stats.vouchersCount} سند`,
        badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        counter: "خزائن وبنوك",
      },
      {
        id: "FINANCIAL_REPORTS" as NavTab,
        title: "التقارير والقوائم المالية",
        shortTitle: "التقارير",
        description: "قائمة الدخل، الميزانية العمومية، التدفقات النقدية، والأرباح والخسائر",
        icon: PieChart,
        color: "from-violet-600 to-purple-800",
        textColor: "text-violet-400",
        badge: "IFRS / GAAP",
        badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
        counter: "قوائم ختامية",
      },
      {
        id: "COLLABORATION" as NavTab,
        title: "المراسلات والموافقات الإدارية",
        shortTitle: "المراسلات والموافقات",
        description: "الوارد والصادر، التوقيع والختم الإلكتروني، وسير الموافقات الإدارية",
        icon: Users,
        color: "from-sky-600 to-indigo-700",
        textColor: "text-sky-400",
        badge: `${erpState.correspondences?.length || 0} كتاب`,
        badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
        counter: "تعاون مؤسسي",
      },
      {
        id: "CLOUD_SYNC" as NavTab,
        title: "محرك العمل دون اتصال (Offline-First)",
        shortTitle: "المزامنة وقاعدة البيانات",
        description: "إدارة قاعدة البيانات المحلية المشفرة، صندوق الانتظار، والمزامنة السحابية",
        icon: DatabaseBackup,
        color: "from-emerald-700 to-slate-800",
        textColor: "text-emerald-300",
        badge: "Offline Ready",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        counter: "SQLite محلي",
      },
      {
        id: "EXECUTIVE_MASTER_SUITE" as NavTab,
        title: "المنصة السحابية المشفرة ومركز الأمان السيادي",
        shortTitle: "المنصة السحابية المشفرة",
        description: "جدار الحماية السحابي WAF، تشفير قواعد البيانات AES-256، التحقق البيومتري، ورادار الدخول الجغرافي",
        icon: ShieldCheck,
        color: "from-blue-900 via-[#0B192C] to-indigo-950",
        textColor: "text-blue-300",
        badge: "AES-256 GCM",
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        counter: "أمان سيادي",
      },
      {
        id: "SETTINGS" as NavTab,
        title: "إعدادات النظام والعملات والسمات",
        shortTitle: "الإعدادات",
        description: "تخصيص الفروع، أسعار صرف العملات، الصلاحيات، واستوديو السمات",
        icon: Settings,
        color: "from-slate-700 to-slate-900",
        textColor: "text-slate-300",
        badge: "النظام",
        badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/30",
        counter: "تكوين شامل",
      },
    ],
    [stats, erpState, formattedSales, formattedPurchases]
  );

  const filteredModules = useMemo(() => {
    const search = hubSearch.trim().toLowerCase();
    if (!search) return modules;
    return modules.filter(
      (m) =>
        m.title.toLowerCase().includes(search) ||
        m.shortTitle.toLowerCase().includes(search) ||
        m.description.toLowerCase().includes(search)
    );
  }, [modules, hubSearch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHubSearch(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setHubSearch("");
  }, []);

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Quick Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="ابحث عن وحدة أو إدارة في النظام..."
          value={hubSearch}
          onChange={handleSearchChange}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-inner"
        />
        {hubSearch && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
          >
            مسح
          </button>
        )}
      </div>

      {/* Quick Access Action Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => onOpenQuickAction("INVOICE")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold whitespace-nowrap transition-colors shadow-sm flex-shrink-0 cursor-pointer active:opacity-90"
        >
          <span>+ فاتورة بيع</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenQuickAction("JOURNAL")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold whitespace-nowrap transition-colors shadow-sm flex-shrink-0 cursor-pointer active:opacity-90"
        >
          <span>+ قيد يومية</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenQuickAction("PAYMENT")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold whitespace-nowrap transition-colors shadow-sm flex-shrink-0 cursor-pointer active:opacity-90"
        >
          <span>+ سند صرف</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenQuickAction("RECEIPT")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold whitespace-nowrap transition-colors shadow-sm flex-shrink-0 cursor-pointer active:opacity-90"
        >
          <span>+ سند قبض</span>
        </button>
        <button
          type="button"
          onClick={onOpenAi}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold whitespace-nowrap transition-colors shadow-sm flex-shrink-0 cursor-pointer active:opacity-90"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>المستشار المالي</span>
        </button>
      </div>

      {/* Modules Cards List - Optimized with React.memo */}
      <div className="space-y-3">
        {filteredModules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            isSelected={pendingModuleId === module.id && isPending}
            onSelect={handleSelectModule}
          />
        ))}
      </div>

      {/* Enterprise Compliance Notice Footer */}
      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right">
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-medium text-slate-300">جميع الحقوق محفوظة ©</span>
          <span className="text-amber-300 font-mono font-bold">Bin Ziyad Group & MeDo Tech (BZMT)</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">SAP/MeDO ERP Mobile Suite</span>
      </div>
    </div>
  );
};

