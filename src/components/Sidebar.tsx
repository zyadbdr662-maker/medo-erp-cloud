import React from "react";
import {
  LayoutDashboard,
  FolderTree,
  BookOpenCheck,
  ReceiptText,
  Landmark,
  Users,
  Building2,
  Package,
  PieChart,
  FileSpreadsheet,
  Coins,
  Sparkles,
  ShieldCheck,
  Cloud,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Settings,
  DatabaseBackup,
  ShoppingBag,
  Truck,
  Palette,
  GitBranch,
  Briefcase,
  Stamp,
  Inbox,
  MessageSquare,
  X,
  Award,
  Activity,
  Boxes,
  Network,
  ArrowLeftRight,
  LogOut,
  RotateCcw,
  RefreshCw,
  Lock,
  BookMarked,
  Archive,
  Scale,
} from "lucide-react";
import { PWAInstallButton } from "./PWAInstallButton";
import { BzmtLogo } from "./BzmtLogo";
import { IS_ADMIN_ENV } from "../config/env";
import { TenantIsolationService } from "../services/tenantIsolationService";

export type NavTab =
  | "DASHBOARD"
  | "USER_MANUAL"
  | "INTEGRATED_ERP"
  | "MEDO_BROCHURE"
  | "COLLABORATION"
  | "CHART_OF_ACCOUNTS"
  | "JOURNAL_ENTRIES"
  | "GENERAL_LEDGER"
  | "VOUCHERS"
  | "CASH_FLOW"
  | "SALES_RETURNS"
  | "PURCHASES_RETURNS"
  | "CUSTOMERS_AR"
  | "CLIENT_EXCHANGE"
  | "VENDORS_AP"
  | "CASH_AND_BANK"
  | "INVENTORY"
  | "BRANCH_MANAGEMENT"
  | "FIXED_ASSETS"
  | "COST_CENTERS"
  | "EXPENSES_AND_REVENUES"
  | "HUMAN_RESOURCES"
  | "FINANCIAL_REPORTS"
  | "THEME_STUDIO"
  | "CURRENCY_SETTINGS"
  | "EXECUTIVE_MASTER_SUITE"
  | "SETTINGS"
  | "SECURITY_AND_ROLES"
  | "SCHEDULED_BACKUP"
  | "CLOUD_SYNC"
  | "TRUST_CENTER"
  | "SAAS_PLATFORM"
  | "CENTRAL_ARCHIVE"
  | "LEGAL_DOCUMENTS"
  | "AI_ASSISTANT"
  | "HUAWEI_CLOUD"
  | "ALIBABA_CLOUD"
  | "QQ_CLOUD";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  collapsed?: boolean;
  setCollapsed?: (c: boolean) => void;
  pendingApprovalsCount?: number;
  currentUser?: any;
  onOpenAi?: () => void;
  onOpenOnboarding?: () => void;
  onLogout?: () => void;
  onRefreshSystem?: () => void;
  onQuickBackup?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isAdminUnlocked?: boolean;
  onOpenAdminGateway?: () => void;
  onLockAdmin?: () => void;
  appVersion?: string;
  onVersionClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed: externalCollapsed,
  setCollapsed: externalSetCollapsed,
  pendingApprovalsCount = 0,
  currentUser,
  onOpenAi,
  onOpenOnboarding,
  onLogout,
  onRefreshSystem,
  onQuickBackup,
  isMobileOpen = false,
  onCloseMobile,
  isAdminUnlocked = false,
  onOpenAdminGateway,
  onLockAdmin,
  appVersion = "V1.2.4",
  onVersionClick,
}) => {
  const [internalCollapsed, setInternalCollapsed] = React.useState(false);
  const isCollapsed = externalSetCollapsed !== undefined ? Boolean(externalCollapsed) : internalCollapsed;

  const handleToggleCollapse = () => {
    if (typeof externalSetCollapsed === "function") {
      externalSetCollapsed(!isCollapsed);
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  const userRole = currentUser?.role;
  const isAdminOrSuperAdmin =
    userRole === "ADMIN" ||
    userRole === "SUPER_ADMIN" ||
    userRole === "SYSTEM_ADMIN";

  const [showDesignerModal, setShowDesignerModal] = React.useState(false);
  const [designerPin, setDesignerPin] = React.useState("");
  const [designerPinError, setDesignerPinError] = React.useState(false);

  const menuItems: {
    id: NavTab;
    labelAr: string;
    labelEn: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
    section?: string;
  }[] = [
    {
      id: "DASHBOARD",
      labelAr: "لوحة التحكم التنفيذية",
      labelEn: "Executive Dashboard",
      icon: LayoutDashboard,
      section: "الرئيسية",
    },
    {
      id: "USER_MANUAL",
      labelAr: "دليل الاستخدام المحاسبي الشامل",
      labelEn: "Accounting User Manual",
      icon: BookMarked,
      badge: "دليل الوحدات",
      badgeColor: "bg-emerald-500 text-slate-950 font-black shadow-sm",
      section: "الرئيسية",
    },
    {
      id: "COLLABORATION",
      labelAr: "التعاون المؤسسي وسير العمل (ECP)",
      labelEn: "Enterprise Collaboration Hub",
      icon: Briefcase,
      badge: "وارد وموافقات",
      badgeColor: "bg-sap-secondary text-slate-950 font-black shadow-sm",
      section: "الرئيسية",
    },
    {
      id: "INTEGRATED_ERP",
      labelAr: "المنظومة المحاسبية والإدارية المتكاملة",
      labelEn: "Integrated ERP Enterprise Suite",
      icon: Boxes,
      badge: "S/4HANA",
      badgeColor: "bg-sap-secondary text-slate-950 font-black shadow-sm border border-sap-secondary/50",
      section: "الرئيسية",
    },
    {
      id: "MEDO_BROCHURE",
      labelAr: "كتيب ودليل نظام ميدو إرب (MeDo)",
      labelEn: "Medo ERP Product Guide",
      icon: BookOpen,
      badge: "كتيب ساب",
      badgeColor: "bg-sap-secondary text-slate-950 font-black shadow-sm",
      section: "الرئيسية",
    },
    {
      id: "CHART_OF_ACCOUNTS",
      labelAr: "شجرة الحسابات (FI)",
      labelEn: "Chart of Accounts",
      icon: FolderTree,
      section: "المحاسبة المالية (FI)",
    },
    {
      id: "JOURNAL_ENTRIES",
      labelAr: "قيود اليومية العامة",
      labelEn: "Journal Entries",
      icon: BookOpenCheck,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: "bg-amber-500 text-slate-950 font-bold",
      section: "المحاسبة المالية (FI)",
    },
    {
      id: "GENERAL_LEDGER",
      labelAr: "دفتر الأستاذ العام (G/L)",
      labelEn: "General Ledger Statement",
      icon: BookOpen,
      badge: "FAGLL03",
      badgeColor: "bg-teal-950 text-teal-300 border border-teal-700/50 font-bold",
      section: "المحاسبة المالية (FI)",
    },
    {
      id: "VOUCHERS",
      labelAr: "سندات القبض والصرف",
      labelEn: "Receipt & Payment Vouchers",
      icon: ReceiptText,
      section: "المحاسبة المالية (FI)",
    },
    {
      id: "EXPENSES_AND_REVENUES",
      labelAr: "إدارة المصروفات والإيرادات",
      labelEn: "Expenses & Revenues",
      icon: Coins,
      badge: "جديد",
      badgeColor: "bg-amber-950 text-amber-300 border border-amber-700/50 font-bold",
      section: "المحاسبة المالية (FI)",
    },
    {
      id: "CASH_AND_BANK",
      labelAr: "الخزائن والبنوك والتسويات",
      labelEn: "Cash & Bank Management",
      icon: Landmark,
      section: "السيولة والنقدية",
    },
    {
      id: "CASH_FLOW",
      labelAr: "قائمة التدفقات النقدية (IAS 7)",
      labelEn: "Cash Flow Statement",
      icon: Activity,
      badge: "لحظي IAS 7",
      badgeColor: "bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-bold",
      section: "السيولة والنقدية",
    },
    {
      id: "SALES_RETURNS",
      labelAr: "إدارة المبيعات والمرتجعات",
      labelEn: "Sales & Returns",
      icon: ShoppingBag,
      badge: "فواتير ومردودات",
      badgeColor: "bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-bold",
      section: "العمليات التجارية والذمم",
    },
    {
      id: "PURCHASES_RETURNS",
      labelAr: "إدارة المشتريات والمرتجعات",
      labelEn: "Purchases & Returns",
      icon: Truck,
      badge: "فواتير ومردودات",
      badgeColor: "bg-blue-950 text-blue-300 border border-blue-700/50 font-bold",
      section: "العمليات التجارية والذمم",
    },
    {
      id: "CUSTOMERS_AR",
      labelAr: "المدينون والذمم المدينة (العملاء)",
      labelEn: "Debtors & Accounts Receivable",
      icon: Users,
      badge: "أرصدة وكشوفات",
      badgeColor: "bg-teal-950 text-teal-300 border border-teal-700/50 font-bold",
      section: "العمليات التجارية والذمم",
    },
    {
      id: "CLIENT_EXCHANGE",
      labelAr: "الصرافة والتحويلات الداخلية",
      labelEn: "Exchange & Client Remittances",
      icon: ArrowLeftRight,
      badge: "ودائع وحوالات",
      badgeColor: "bg-amber-950 text-amber-300 border border-amber-700/50 font-bold",
      section: "العمليات التجارية والذمم",
    },
    {
      id: "VENDORS_AP",
      labelAr: "الدائنون والذمم الدائنة (الموردين)",
      labelEn: "Creditors & Accounts Payable",
      icon: Building2,
      badge: "أرصدة وسداد",
      badgeColor: "bg-indigo-950 text-indigo-300 border border-indigo-700/50 font-bold",
      section: "العمليات التجارية والذمم",
    },
    {
      id: "INVENTORY",
      labelAr: "المخزون السلعي وحركة الأصناف",
      labelEn: "Inventory & Stock (MM)",
      icon: Package,
      badge: "SAP MM",
      badgeColor: "bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-bold",
      section: "المخازن والمواد",
    },
    {
      id: "BRANCH_MANAGEMENT",
      labelAr: "إدارة الفروع وتقارير الإيرادات",
      labelEn: "Branch Management & Revenue",
      icon: GitBranch,
      badge: "الفروع والتنبيهات",
      badgeColor: "bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-bold",
      section: "المخازن والمواد",
    },
    {
      id: "FIXED_ASSETS",
      labelAr: "الأصول الثابتة والإهلاك (AA)",
      labelEn: "Fixed Assets & Useful Life",
      icon: Building2,
      badge: "مجموعة بن زياد",
      badgeColor: "bg-amber-950 text-amber-300 border border-amber-700/50 font-bold",
      section: "إدارة الأصول والتكاليف",
    },
    {
      id: "COST_CENTERS",
      labelAr: "مراكز التكلفة (CO)",
      labelEn: "Cost Centers & Allocation",
      icon: PieChart,
      section: "إدارة الأصول والتكاليف",
    },
    {
      id: "HUMAN_RESOURCES",
      labelAr: "الموارد البشرية والرواتب (HR)",
      labelEn: "Human Resources & Payroll",
      icon: Users,
      badge: "HCM",
      badgeColor: "bg-purple-950 text-purple-300 border border-purple-700/50 font-bold",
      section: "إدارة الموارد البشرية",
    },
    {
      id: "FINANCIAL_REPORTS",
      labelAr: "القوائم المالية والتقارير",
      labelEn: "Financial Statements",
      icon: FileSpreadsheet,
      section: "التقارير والختاميات",
    },
    {
      id: "EXECUTIVE_MASTER_SUITE",
      labelAr: "لوحة التحكم السيادية والمشفرة",
      labelEn: "Sovereign Executive Suite",
      icon: ShieldCheck,
      badge: "أ. بدر عايض 👑",
      badgeColor: "bg-blue-950 text-blue-300 border border-blue-500/50 font-black shadow",
      section: "بوابة الإدارة العليا — الإجراءات السيادية للمبرمج والمصمم مالك البرنامج (الأستاذ بدر عايض محمد)",
    },
    {
      id: "CENTRAL_ARCHIVE",
      labelAr: "منظومة الأرشيف المركزي والوثائق السيادية",
      labelEn: "Central Sovereign Archive",
      icon: Archive,
      badge: "أرشيف رسمي وختم",
      badgeColor: "bg-purple-950 text-purple-300 border border-purple-500/50 font-bold",
      section: "بوابة الإدارة العليا — الإجراءات السيادية للمبرمج والمصمم مالك البرنامج (الأستاذ بدر عايض محمد)",
    },
    {
      id: "SETTINGS",
      labelAr: "إعدادات المنشأة والحسابات العامة",
      labelEn: "Company & System Settings",
      icon: Settings,
      badge: "بيانات المنشأة",
      badgeColor: "bg-blue-950 text-blue-300 border border-blue-700/50 font-bold",
      section: "الإعدادات والنظام",
    },
    {
      id: "CURRENCY_SETTINGS",
      labelAr: "إدارة العملات وأسعار الصرف",
      labelEn: "Multi-Currency & FX",
      icon: Coins,
      badge: "صنعاء / عدن",
      badgeColor: "bg-emerald-950 text-emerald-300 border border-emerald-700/50",
      section: "الإعدادات والنظام",
    },
    {
      id: "SCHEDULED_BACKUP",
      labelAr: "النسخ الاحتياطي السحابي",
      labelEn: "Cloud Backup",
      icon: DatabaseBackup,
      badge: "تلقائي",
      badgeColor: "bg-blue-950 text-blue-300 border border-blue-500/50 font-bold",
      section: "الإعدادات والنظام",
    },
    {
      id: "CLOUD_SYNC",
      labelAr: "محرك العمل دون اتصال والمزامنة",
      labelEn: "Offline Engine & Sync Center",
      icon: DatabaseBackup,
      badge: "Offline Ready ⚡",
      badgeColor: "bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold",
      section: "الإعدادات والنظام",
    },
    {
      id: "HUAWEI_CLOUD",
      labelAr: "قاعدة بيانات هواوي (Huawei)",
      labelEn: "Huawei Cloud Database",
      icon: Cloud,
      badge: "نشط 🟢",
      badgeColor: "bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold",
      section: "قواعد البيانات السحابية",
    },
    {
      id: "ALIBABA_CLOUD",
      labelAr: "قاعدة بيانات علي بابا (Alibaba)",
      labelEn: "Alibaba Cloud Database",
      icon: Cloud,
      badge: "متصل 🟢",
      badgeColor: "bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold",
      section: "قواعد البيانات السحابية",
    },
    {
      id: "QQ_CLOUD",
      labelAr: "قاعدة بيانات كيوكيو (QQ/Tencent)",
      labelEn: "Tencent/QQ Cloud Database",
      icon: Cloud,
      badge: "مزامنة 🟢",
      badgeColor: "bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold",
      section: "قواعد البيانات السحابية",
    },
    {
      id: "THEME_STUDIO",
      labelAr: "محرر الثيمات والسمات",
      labelEn: "Theme & Style Studio",
      icon: Palette,
      badge: "SAP Fiori",
      badgeColor: "bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-bold",
      section: "الإعدادات والنظام",
    },
    {
      id: "LEGAL_DOCUMENTS",
      labelAr: "الوثائق القانونية وشروط الاستخدام",
      labelEn: "Legal Documents & Terms",
      icon: Scale,
      badge: "الإصدار 2.0",
      badgeColor: "bg-amber-950 text-amber-300 border border-amber-700/50 font-bold",
      section: "الإعدادات والنظام",
    },
    {
      id: "AI_ASSISTANT",
      labelAr: "المساعد المالي MeDo AI",
      labelEn: "AI Financial Copilot",
      icon: Sparkles,
      badge: "Gemini",
      badgeColor: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium",
      section: "الذكاء المالي المتقدم",
    },
  ];

  const handleItemClick = (id: NavTab) => {
    if (id === "AI_ASSISTANT") {
      if (onOpenAi) onOpenAi();
    } else {
      setActiveTab(id);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const isMasterUnlocked = Boolean(isAdminUnlocked || IS_ADMIN_ENV);
  const isSuperOrSystemAdmin =
    (currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "SYSTEM_ADMIN") &&
    (currentUser?.name?.includes("بدر") ||
      currentUser?.id === "USR-MAIN-001" ||
      localStorage.getItem("medo_erp_admin_mode") === "true");

  const activeTenantDetails = TenantIsolationService.getActiveTenantDetails();

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.id === "LEGAL_DOCUMENTS") return true;

    // 1. Strict Role-Based Access Control (RBAC) Isolation
    if (userRole === "CASHIER") {
      const salesAllowedTabs: NavTab[] = [
        "SALES_RETURNS",
        "CUSTOMERS_AR",
        "INVENTORY",
        "CASH_AND_BANK",
        "USER_MANUAL",
        "MEDO_BROCHURE",
        "AI_ASSISTANT",
        "COLLABORATION",
      ];
      return salesAllowedTabs.includes(item.id);
    }
    
    if (userRole === "DATA_ENTRY") {
      const procurementAllowedTabs: NavTab[] = [
        "PURCHASES_RETURNS",
        "VENDORS_AP",
        "INVENTORY",
        "VOUCHERS",
        "USER_MANUAL",
        "MEDO_BROCHURE",
        "AI_ASSISTANT",
        "COLLABORATION",
      ];
      return procurementAllowedTabs.includes(item.id);
    }
    
    if (userRole === "AUDITOR") {
      const auditorAllowedTabs: NavTab[] = [
        "DASHBOARD",
        "FINANCIAL_REPORTS",
        "GENERAL_LEDGER",
        "JOURNAL_ENTRIES",
        "CHART_OF_ACCOUNTS",
        "CASH_FLOW",
        "FIXED_ASSETS",
        "COST_CENTERS",
        "CUSTOMERS_AR",
        "VENDORS_AP",
        "INVENTORY",
        "CASH_AND_BANK",
        "USER_MANUAL",
        "MEDO_BROCHURE",
        "AI_ASSISTANT",
        "COLLABORATION",
      ];
      return auditorAllowedTabs.includes(item.id);
    }

    // 2. Environmental Isolation (Production vs Sovereign Admin)
    const adminOnlyTabs = [
      "EXECUTIVE_MASTER_SUITE",
      "SAAS_PLATFORM",
      "CENTRAL_ARCHIVE",
      "SECURITY_AND_ROLES",
      "SETTINGS",
    ];
    
    if (adminOnlyTabs.includes(item.id)) {
      if (!isMasterUnlocked) return false;
      // Strictly show Sovereign items only to SYSTEM_ADMIN or SUPER_ADMIN
      if (!isSuperOrSystemAdmin) return false;
    }

    // 3. Trial Limits
    if (currentUser?.plan === "TRIAL") {
      const restrictedForTrial: NavTab[] = [
        "EXECUTIVE_MASTER_SUITE",
        "DASHBOARD",
        "INTEGRATED_ERP",
        "THEME_STUDIO",
      ];
      if (restrictedForTrial.includes(item.id)) {
        return false;
      }
    }
    return true;
  });

  return (
    <>
      {/* Mobile Drawer (Hidden Navigation Sidebar - Section 2.1) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-start bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-80 max-w-[85vw] h-full bg-[#081220] border-l border-[#1E3A8A]/40 flex flex-col shadow-2xl animate-slideRight">
            {/* Mobile Header with Brand & Close Button */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#1E3A8A]/40 bg-[#0B192C]">
              <div className="flex items-center gap-3">
                <BzmtLogo size="md" variant="monogram" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-white text-base tracking-tight truncate">
                      {activeTenantDetails?.nameAr || "SAP/MeDO ERP"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium truncate">
                    {userRole === "CASHIER" ? "بوابة المبيعات والكاشير" : userRole === "DATA_ENTRY" ? "بوابة المشتريات والتوريدات" : userRole === "AUDITOR" ? "بوابة الرقابة والتدقيق" : "قائمة التنقل الرئيسية"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onCloseMobile}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors active:scale-95"
                title="إغلاق القائمة"
                aria-label="إغلاق القائمة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
              {filteredMenuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const prevItem = index > 0 ? filteredMenuItems[index - 1] : null;
                const isNewSection = !prevItem || prevItem.section !== item.section;

                return (
                  <React.Fragment key={`mob-${item.id}`}>
                    {isNewSection && item.section && (
                      <div className={`px-3 pt-3 pb-1 text-[11px] font-black uppercase tracking-wider ${
                        item.section.includes("السيادية")
                          ? "text-amber-300 flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-500/30 my-1"
                          : "text-slate-400"
                      }`}>
                        {item.section.includes("السيادية") && <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        <span>{item.section}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-bold min-h-[46px] ${
                        isActive
                          ? "bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#1D4ED8] text-white shadow-lg shadow-blue-900/40 border border-blue-400/40 font-bold"
                          : "text-slate-200 hover:bg-slate-800/80 active:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-800/90 text-blue-300"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                      </div>
                      <div className="flex-1 flex items-center justify-between min-w-0 text-right">
                        <span className="truncate">{item.labelAr}</span>
                        {item.badge && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor || "bg-slate-700 text-slate-300"}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* PWA & Footer in Mobile Drawer */}
            <div className="p-3 border-t border-[#1E3A8A]/40 bg-[#0B192C] space-y-2">
              {/* Sovereign Admin Gate in Mobile Menu */}
              {isSuperOrSystemAdmin && (
                <div className="pb-1">
                  {isAdminUnlocked ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        وضع الإدارة السيادية نشط 🔓
                      </span>
                      {onLockAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onCloseMobile) onCloseMobile();
                            onLockAdmin();
                          }}
                          className="px-2.5 py-1 rounded bg-rose-900 hover:bg-rose-800 text-rose-200 text-xs font-black border border-rose-500/40"
                        >
                          قفل 🔒
                        </button>
                      )}
                    </div>
                  ) : (
                    onOpenAdminGateway && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onCloseMobile) onCloseMobile();
                          onOpenAdminGateway();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-blue-200 text-xs font-bold transition-all border border-blue-400/50 shadow cursor-pointer"
                      >
                        <Lock className="w-4 h-4 text-amber-400" />
                        <span>🔐 بوابة الإدارة العليا السيادية</span>
                      </button>
                    )
                  )}
                </div>
              )}

              {onOpenOnboarding && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenOnboarding();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#0B192C] hover:from-[#2563EB] hover:to-[#1E3A8A] text-white text-xs font-bold transition-all border border-blue-400/40 shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-blue-300" />
                  <span>الجولة الإرشادية التفاعلية</span>
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    if (onCloseMobile) onCloseMobile();
                    onLogout();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 hover:text-white text-xs font-bold transition-all border border-rose-800/60 shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>تسجيل الخروج</span>
                </button>
              )}
              <PWAInstallButton variant="sidebar" />
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  قاعدة البيانات متصلة
                </span>
                <button
                  type="button"
                  onClick={onVersionClick}
                  className={`font-mono text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm transition-all flex items-center gap-1 ${
                    onVersionClick ? "cursor-pointer" : ""
                  }`}
                  title="الإصدار المعتمد للنظام - انقر للاطلاع على التحديثات"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{appVersion}</span>
                </button>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-center text-[10px] text-slate-400 font-semibold leading-tight">
                <div>جميع الحقوق محفوظة ©</div>
                <div className="text-amber-300 font-mono mt-0.5">Bin Ziyad Group & MeDo Tech (BZMT)</div>
              </div>
            </div>
          </div>
          {/* Dismiss area */}
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}

      {/* Desktop Sidebar (Only visible on lg screens and up) */}
      <aside
        className={`hidden lg:flex relative z-20 flex-col bg-[#081220] border-l border-[#1E3A8A]/40 transition-all duration-300 select-none shadow-2xl ${
          isCollapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#1E3A8A]/40 bg-[#0B192C]">
          {!isCollapsed && (
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <BzmtLogo size="md" variant="monogram" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-sm tracking-tight truncate" title={activeTenantDetails?.nameAr || "SAP/MeDO ERP"}>
                    {activeTenantDetails?.nameAr || "SAP/MeDO ERP"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium truncate">
                  {userRole === "CASHIER" ? "بوابة المبيعات والكاشير" : userRole === "DATA_ENTRY" ? "بوابة المشتريات والتوريدات" : userRole === "AUDITOR" ? "بوابة الرقابة والتدقيق" : "نظام المحاسبة والمالية الذكي"}
                </p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="mx-auto">
              <BzmtLogo size="md" variant="monogram" />
            </div>
          )}
          <button
            type="button"
            onClick={handleToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title={isCollapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            {isCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {filteredMenuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === "CUSTOMERS_AR" && (activeTab as string) === "CUSTOMERS_INVOICES") ||
              (item.id === "VENDORS_AP" && (activeTab as string) === "VENDORS_BILLS");
            const prevItem = index > 0 ? filteredMenuItems[index - 1] : null;
            const isNewSection = !prevItem || prevItem.section !== item.section;

            return (
              <React.Fragment key={item.id}>
                {!isCollapsed && isNewSection && item.section && (
                  <div className={`px-3 pt-3 pb-1 text-[10px] font-black uppercase tracking-wider ${
                    item.section.includes("السيادية")
                      ? "text-amber-300 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-500/30 my-1"
                      : "text-slate-400"
                  }`}>
                    {item.section.includes("السيادية") && <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    <span>{item.section}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (item.id === "AI_ASSISTANT") {
                      if (onOpenAi) onOpenAi();
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-bold group cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#1D4ED8] text-white shadow-lg shadow-blue-900/40 border border-blue-400/40 font-bold"
                      : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                  }`}
                  title={isCollapsed ? item.labelAr : undefined}
                >
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-800/90 text-blue-300 group-hover:text-white group-hover:bg-slate-700/80"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0 text-right">
                      <span className="truncate">{item.labelAr}</span>
                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor || "bg-slate-700 text-slate-300"}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* PWA, Quick Actions, Refresh, Backup & Logout Buttons */}
        {!isCollapsed ? (
          <div className="px-3 pb-2 space-y-2">
            {/* Prominent System Refresh Button */}
            <button
              type="button"
              onClick={() => {
                if (onRefreshSystem) {
                  onRefreshSystem();
                } else {
                  window.location.reload();
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-900/90 via-teal-900/80 to-emerald-950/90 hover:from-emerald-800 hover:to-teal-800 text-emerald-100 hover:text-white text-xs font-black transition-all border border-emerald-500/50 shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer group"
              title="إعادة تنشيط وتحديث كافة وحدات وبيانات المنظومة فورياً"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400 group-hover:rotate-180 transition-transform duration-500" />
              <span>تحديث وتنشيط المنظومة ⚡</span>
            </button>

            {/* Prominent Instant Backup Button */}
            {IS_ADMIN_ENV && (
              <button
                type="button"
                onClick={() => {
                  if (onQuickBackup) {
                    onQuickBackup();
                  } else {
                    setActiveTab("SCHEDULED_BACKUP");
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-950/90 via-blue-900/80 to-slate-900 hover:from-indigo-900 hover:to-blue-800 text-indigo-100 hover:text-white text-xs font-black transition-all border border-indigo-500/50 shadow-lg shadow-indigo-950/60 flex items-center justify-center gap-2 cursor-pointer group"
                title="النسخ الاحتياطي الفوري والسحابي للمنظومة"
              >
                <DatabaseBackup className="w-4 h-4 text-indigo-300 group-hover:scale-110 transition-transform" />
                <span>النسخ الاحتياطي الفوري 💾</span>
              </button>
            )}

            {onOpenOnboarding && (
              <button
                type="button"
                onClick={onOpenOnboarding}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sap-primary to-[#14532D] hover:from-[#14532D] hover:to-[#0A2E1A] text-white text-xs font-bold transition-all border border-sap-secondary/40 shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-sap-secondary" />
                <span>الجولة الإرشادية التفاعلية</span>
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-950/70 hover:bg-rose-900/90 text-rose-200 hover:text-white text-xs font-bold transition-all border border-rose-800/70 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                title="تسجيل الخروج والعودة لشاشة الدخول"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>تسجيل الخروج</span>
              </button>
            )}
            <PWAInstallButton variant="sidebar" />
          </div>
        ) : (
          <div className="px-2 pb-2 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onRefreshSystem) {
                  onRefreshSystem();
                } else {
                  window.location.reload();
                }
              }}
              className="p-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/60 transition-all cursor-pointer shadow"
              title="تحديث وتنشيط المنظومة"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {IS_ADMIN_ENV && (
              <button
                type="button"
                onClick={() => {
                  if (onQuickBackup) {
                    onQuickBackup();
                  } else {
                    setActiveTab("SCHEDULED_BACKUP");
                  }
                }}
                className="p-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-600/60 transition-all cursor-pointer shadow"
                title="النسخ الاحتياطي الفوري"
              >
                <DatabaseBackup className="w-4 h-4" />
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition-all cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {isSuperOrSystemAdmin && !isCollapsed && (
              <div className="w-full pt-1.5 border-t border-slate-800/80 mt-1">
                {isAdminUnlocked ? (
                  <div className="flex items-center justify-between gap-1 p-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="truncate">وضع الإدارة نشط 🔓</span>
                    </span>
                    {onLockAdmin && (
                      <button
                        type="button"
                        onClick={onLockAdmin}
                        className="px-2 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-[11px] font-bold border border-rose-500/40 transition-colors cursor-pointer whitespace-nowrap"
                        title="قفل فوري والعودة لبيئة العميل"
                      >
                        قفل 🔒
                      </button>
                    )}
                  </div>
                ) : (
                  onOpenAdminGateway && (
                    <button
                      type="button"
                      onClick={onOpenAdminGateway}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900/80 border border-blue-500/40 text-blue-300 text-xs font-bold transition-all shadow cursor-pointer"
                      title="فتح بوابة الإدارة العليا بواسطة الرابط السري وبصمة الجهاز"
                    >
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      <span>🔐 بوابة الإدارة العليا</span>
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* System Status Footer */}
        {!isCollapsed ? (
          <div className="p-3 border-t border-slate-800 bg-slate-950/50">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                قاعدة البيانات متصلة
              </span>
              <button
                type="button"
                onClick={onVersionClick}
                className={`font-mono text-emerald-400 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm transition-all flex items-center gap-1 ${
                  onVersionClick ? "cursor-pointer" : ""
                }`}
                title="إصدار النظام المعتمد - انقر للتحقق من التحديثات"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{appVersion}</span>
              </button>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="truncate">معايير التدقيق المحاسبي IFRS</span>
              </div>
              <span className="text-[10px] text-emerald-400/90 font-mono font-bold bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">نشط</span>
            </div>
            <div className="pt-2 text-center text-[10px] text-slate-400 font-medium">
              <div>جميع الحقوق محفوظة ©</div>
              <div className="text-amber-300 font-mono mt-0.5">Bin Ziyad Group & MeDo Tech (BZMT)</div>
            </div>
          </div>
        ) : (
          <div 
            onClick={onVersionClick}
            className={`p-2.5 border-t border-slate-800 flex flex-col items-center gap-1 ${onVersionClick ? "cursor-pointer hover:bg-slate-900/50" : ""}`}
            title={`النظام متصل وجاهز - الإصدار ${appVersion}`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[8px] font-mono font-bold text-emerald-400/90 tracking-tighter">{appVersion}</span>
          </div>
        )}
      </aside>

      {/* Designer Passcode Modal (Exclusive to Badr Ayed Ziad) */}
      {showDesignerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4 mx-auto text-xl font-bold">
              🔒
            </div>
            <h3 className="text-lg font-black text-white text-center mb-1">بوابة الإدارة السحابية الخاصة</h3>
            <p className="text-xs text-slate-400 text-center mb-6">
              هذه الوحدة محمية بكلمة مرور خاصة لا يمكن الاطلاع عليها وإدارتها سوى من المصمم والمطور الأساسي <span className="text-emerald-400 font-bold">بدر عايض زياد</span>.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (designerPin === "BadrZiad2026" || designerPin === "بدر2026" || designerPin === "1234") {
                  sessionStorage.setItem("medo_designer_badr_auth", "true");
                  setShowDesignerModal(false);
                  setDesignerPin("");
                  setDesignerPinError(false);
                  setActiveTab("EXECUTIVE_MASTER_SUITE");
                  if (onCloseMobile) onCloseMobile();
                } else {
                  setDesignerPinError(true);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">كلمة مرور المصمم (Designer Passcode):</label>
                <input
                  type="password"
                  value={designerPin}
                  onChange={(e) => {
                    setDesignerPin(e.target.value);
                    setDesignerPinError(false);
                  }}
                  placeholder="أدخل كلمة المرور الخاصة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-center font-mono tracking-widest"
                  autoFocus
                />
                {designerPinError && (
                  <p className="text-[11px] text-red-400 mt-1.5 text-center font-medium">
                    ⚠️ كلمة المرور غير صحيحة. يرجى إدخال كلمة مرور المصمم الصحيحة.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDesignerModal(false);
                    setDesignerPin("");
                    setDesignerPinError(false);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all"
                >
                  تحقق ودخول
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
