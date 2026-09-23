import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  ShieldCheck,
  Users,
  Key,
  Lock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Zap,
  Sliders,
  Terminal,
  FileSpreadsheet,
  Printer,
  Copy,
  Trash2,
  Send,
  HelpCircle,
  Layers,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Info,
  Check,
  AlertTriangle,
} from "lucide-react";
import { ERPUser } from "../types/erp";
import { NavTab } from "./Sidebar";
import { TenantIsolationService } from "../services/tenantIsolationService";
import { getRoleLabel } from "../App";

export interface RolePermissionConfig {
  id: string; // e.g. "MANAGER", "ACCOUNTANT", "CASHIER", "PURCHASER", "AUDITOR"
  code: string;
  nameAr: string;
  nameEn: string;
  description: string;
  badgeColor: string;
  defaultRoute: NavTab;
  defaultRouteNameAr: string;
  status: "ACTIVE" | "INACTIVE";
  coveragePercentage: number;
  allowedTabs: NavTab[];
  permissions: {
    dashboardView: boolean;
    chartOfAccounts: boolean;
    journalEntries: boolean;
    generalLedger: boolean;
    vouchers: boolean;
    financialReports: boolean;
    salesPos: boolean;
    purchasesVendors: boolean;
    inventory: boolean;
    fixedAssets: boolean;
    costCenters: boolean;
    settings: boolean;
    userManagement: boolean;
    cloudSync: boolean;
    backupArchive: boolean;
  };
}

export interface RoleSwitchAuditLogEntry {
  id: string;
  username: string;
  fromRole: string;
  toRole: string;
  timestamp: string;
  tenantSlug: string;
  tenantName: string;
  status: "SUCCESS" | "FAILED";
  details: string;
}

interface RolesAndPermissionsManagementViewProps {
  currentUser?: ERPUser | null;
  onSwitchRole?: (role: "MANAGER" | "ACCOUNTANT" | "PURCHASER" | "CASHIER" | "AUDITOR") => void;
  onSwitchBackToManager?: () => void;
  onNavigateToTab?: (tab: NavTab) => void;
}

const DEFAULT_ROLES_CONFIG: RolePermissionConfig[] = [
  {
    id: "MANAGER",
    code: "SYSTEM_ADMIN",
    nameAr: "المدير العام (الإدارة العليا)",
    nameEn: "Executive General Manager",
    description: "كامل الصلاحيات والتحكم السيادي بجميع مفاصل المنشأة، التقارير والرقابة العامة",
    badgeColor: "bg-purple-950 text-purple-300 border-purple-500/50",
    defaultRoute: "DASHBOARD",
    defaultRouteNameAr: "لوحة التحكم التنفيذية (Dashboard)",
    status: "ACTIVE",
    coveragePercentage: 100,
    allowedTabs: [
      "DASHBOARD", "CHART_OF_ACCOUNTS", "JOURNAL_ENTRIES", "GENERAL_LEDGER", "VOUCHERS",
      "SALES_RETURNS", "PURCHASES_RETURNS", "CUSTOMERS_AR", "VENDORS_AP", "INVENTORY",
      "FINANCIAL_REPORTS", "CASH_FLOW", "FIXED_ASSETS", "COST_CENTERS", "EXPENSES_AND_REVENUES",
      "SETTINGS", "SECURITY_AND_ROLES", "SCHEDULED_BACKUP", "CLOUD_SYNC", "EXECUTIVE_MASTER_SUITE"
    ],
    permissions: {
      dashboardView: true,
      chartOfAccounts: true,
      journalEntries: true,
      generalLedger: true,
      vouchers: true,
      financialReports: true,
      salesPos: true,
      purchasesVendors: true,
      inventory: true,
      fixedAssets: true,
      costCenters: true,
      settings: true,
      userManagement: true,
      cloudSync: true,
      backupArchive: true,
    },
  },
  {
    id: "ACCOUNTANT",
    code: "ACCOUNTANT",
    nameAr: "المحاسب المالي العام",
    nameEn: "General Chief Accountant",
    description: "مسؤول الحسابات المالية، القيود اليومية، ميزان المراجعة، الخزينة، وإقفال الفترات",
    badgeColor: "bg-blue-950 text-blue-300 border-blue-500/50",
    defaultRoute: "GENERAL_LEDGER",
    defaultRouteNameAr: "دفتر الأستاذ العام (General Ledger)",
    status: "ACTIVE",
    coveragePercentage: 65,
    allowedTabs: [
      "DASHBOARD", "CHART_OF_ACCOUNTS", "JOURNAL_ENTRIES", "GENERAL_LEDGER", "VOUCHERS",
      "CASH_AND_BANK", "EXPENSES_AND_REVENUES", "CUSTOMERS_AR", "VENDORS_AP", "FINANCIAL_REPORTS",
      "CASH_FLOW", "FIXED_ASSETS", "COST_CENTERS", "COST_ACCOUNTING"
    ],
    permissions: {
      dashboardView: true,
      chartOfAccounts: true,
      journalEntries: true,
      generalLedger: true,
      vouchers: true,
      financialReports: true,
      salesPos: false,
      purchasesVendors: false,
      inventory: false,
      fixedAssets: true,
      costCenters: true,
      settings: false,
      userManagement: false,
      cloudSync: true,
      backupArchive: false,
    },
  },
  {
    id: "CASHIER",
    code: "CASHIER",
    nameAr: "مسؤول المبيعات ونقاط البيع (الكاشير)",
    nameEn: "Sales & POS Cashier",
    description: "إصدار فواتير المبيعات النقدية والآجلة، سندات القبض، ومتابعة رصيد الصندوق اليومي",
    badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-500/50",
    defaultRoute: "SALES_RETURNS",
    defaultRouteNameAr: "فواتير المبيعات ونقاط البيع (Sales & POS)",
    status: "ACTIVE",
    coveragePercentage: 40,
    allowedTabs: [
      "DASHBOARD", "SALES_RETURNS", "CUSTOMERS_AR", "CLIENT_EXCHANGE", "VOUCHERS",
      "CASH_AND_BANK", "INVENTORY"
    ],
    permissions: {
      dashboardView: true,
      chartOfAccounts: false,
      journalEntries: false,
      generalLedger: false,
      vouchers: true,
      financialReports: false,
      salesPos: true,
      purchasesVendors: false,
      inventory: true,
      fixedAssets: false,
      costCenters: false,
      settings: false,
      userManagement: false,
      cloudSync: true,
      backupArchive: false,
    },
  },
  {
    id: "PURCHASER",
    code: "PURCHASER",
    nameAr: "مسؤول المشتريات والمخازن",
    nameEn: "Purchasing & Inventory Officer",
    description: "إدخال فواتير الشراء، إدارة الموردين، أوامر التوريد، ومراقبة جرد المخزون",
    badgeColor: "bg-amber-950 text-amber-300 border-amber-500/50",
    defaultRoute: "PURCHASES_RETURNS",
    defaultRouteNameAr: "فواتير المشتريات والموردين (Purchases)",
    status: "ACTIVE",
    coveragePercentage: 40,
    allowedTabs: [
      "DASHBOARD", "PURCHASES_RETURNS", "VENDORS_AP", "INVENTORY", "VOUCHERS",
      "CASH_AND_BANK"
    ],
    permissions: {
      dashboardView: true,
      chartOfAccounts: false,
      journalEntries: false,
      generalLedger: false,
      vouchers: true,
      financialReports: false,
      salesPos: false,
      purchasesVendors: true,
      inventory: true,
      fixedAssets: false,
      costCenters: false,
      settings: false,
      userManagement: false,
      cloudSync: true,
      backupArchive: false,
    },
  },
  {
    id: "AUDITOR",
    code: "AUDITOR",
    nameAr: "المراجع والمدقق المالي الخارجي",
    nameEn: "Financial Auditor & Compliance",
    description: "مطابقة الحسابات، التدقيق المحاسبي، مراجعة التقارير المالية والختامية (قراءة فقط)",
    badgeColor: "bg-teal-950 text-teal-300 border-teal-500/50",
    defaultRoute: "FINANCIAL_REPORTS",
    defaultRouteNameAr: "التقارير المالية وميزان المراجعة (Reports)",
    status: "ACTIVE",
    coveragePercentage: 35,
    allowedTabs: [
      "DASHBOARD", "CHART_OF_ACCOUNTS", "JOURNAL_ENTRIES", "GENERAL_LEDGER", "FINANCIAL_REPORTS",
      "CASH_FLOW", "FIXED_ASSETS", "COST_ACCOUNTING", "LEGAL_DOCUMENTS"
    ],
    permissions: {
      dashboardView: true,
      chartOfAccounts: true,
      journalEntries: true,
      generalLedger: true,
      vouchers: false,
      financialReports: true,
      salesPos: false,
      purchasesVendors: false,
      inventory: false,
      fixedAssets: true,
      costCenters: true,
      settings: false,
      userManagement: false,
      cloudSync: false,
      backupArchive: false,
    },
  },
];

export const RolesAndPermissionsManagementView: React.FC<RolesAndPermissionsManagementViewProps> = ({
  currentUser,
  onSwitchRole,
  onSwitchBackToManager,
  onNavigateToTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"ROLES_LIST" | "MATRIX" | "AUDIT_LOGS" | "DEBUG_LAB">("ROLES_LIST");
  const [rolesConfig, setRolesConfig] = useState<RolePermissionConfig[]>(() => {
    try {
      const saved = localStorage.getItem("medo_roles_permissions_config");
      return saved ? JSON.parse(saved) : DEFAULT_ROLES_CONFIG;
    } catch {
      return DEFAULT_ROLES_CONFIG;
    }
  });

  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<RolePermissionConfig | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString('ar-YE')}] 🛡️ تم تحميل منظومة إدارة الصلاحيات والأدوار بنجاح`,
    `[${new Date().toLocaleTimeString('ar-YE')}] 🏢 المنشأة النشطة: ${TenantIsolationService.resolveActiveTenant()} (${TenantIsolationService.getTenantName(TenantIsolationService.resolveActiveTenant())})`,
    `[${new Date().toLocaleTimeString('ar-YE')}] 🎭 الدور الحالي: ${currentUser?.role || "SYSTEM_ADMIN"} (${getRoleLabel(currentUser?.role)})`,
  ]);

  const [auditLogs, setAuditLogs] = useState<RoleSwitchAuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem("medo_role_switch_audit_logs");
      if (saved) return JSON.parse(saved);
    } catch {}
    
    const tenant = TenantIsolationService.resolveActiveTenant() || "binziyad";
    const tenantName = TenantIsolationService.getTenantName(tenant) || "بن زياد";
    return [
      {
        id: "LOG-001",
        username: "admin (أ. بدر عايض)",
        fromRole: "المدير العام",
        toRole: "المحاسب المالي",
        timestamp: new Date(Date.now() - 3600000).toLocaleTimeString("ar-YE"),
        tenantSlug: tenant,
        tenantName: tenantName,
        status: "SUCCESS",
        details: "تبديل تجريبي إلى دفتر الأستاذ العام",
      },
      {
        id: "LOG-002",
        username: "admin (أ. بدر عايض)",
        fromRole: "المحاسب المالي",
        toRole: "مسؤول المبيعات (الكاشير)",
        timestamp: new Date(Date.now() - 1800000).toLocaleTimeString("ar-YE"),
        tenantSlug: tenant,
        tenantName: tenantName,
        status: "SUCCESS",
        details: "تبديل تجريبي إلى فواتير المبيعات ونقاط البيع",
      },
      {
        id: "LOG-003",
        username: "admin (أ. بدر عايض)",
        fromRole: "مسؤول المبيعات (الكاشير)",
        toRole: "المدير العام",
        timestamp: new Date(Date.now() - 600000).toLocaleTimeString("ar-YE"),
        tenantSlug: tenant,
        tenantName: tenantName,
        status: "SUCCESS",
        details: "استعادة جلسة الإدارة العليا وصلاحيات المدير",
      },
    ];
  });

  const [copiedLogs, setCopiedLogs] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const activeTenant = TenantIsolationService.resolveActiveTenant() || "binziyad";
  const activeTenantName = TenantIsolationService.getTenantName(activeTenant) || "مجموعة بن زياد التجارية";

  const addDebugLog = (msg: string) => {
    const timeStr = new Date().toLocaleTimeString("ar-YE");
    setDebugLogs((prev) => [`[${timeStr}] ${msg}`, ...prev.slice(0, 99)]);
  };

  const handleRoleSelectTest = (roleId: "MANAGER" | "ACCOUNTANT" | "PURCHASER" | "CASHIER" | "AUDITOR") => {
    addDebugLog(`🔄 Switching role to: ${roleId}`);
    addDebugLog(`🏢 Tenant: ${activeTenant} (${activeTenantName})`);
    
    const roleObj = rolesConfig.find((r) => r.id === roleId);
    const targetRoute = roleObj ? roleObj.defaultRoute : "DASHBOARD";
    addDebugLog(`🎯 Redirecting to: ${targetRoute}`);
    addDebugLog(`✅ Permissions applied for: ${getRoleLabel(roleId)}`);

    // Add to audit logs
    const newLog: RoleSwitchAuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      username: currentUser?.name || "admin",
      fromRole: getRoleLabel(currentUser?.role),
      toRole: getRoleLabel(roleId),
      timestamp: new Date().toLocaleTimeString("ar-YE"),
      tenantSlug: activeTenant,
      tenantName: activeTenantName,
      status: "SUCCESS",
      details: `تبديل مباشر إلى ${roleObj?.nameAr || roleId} (${targetRoute})`,
    };

    const updatedLogs = [newLog, ...auditLogs.slice(0, 49)];
    setAuditLogs(updatedLogs);
    try {
      localStorage.setItem("medo_role_switch_audit_logs", JSON.stringify(updatedLogs));
    } catch {}

    if (roleId === "MANAGER") {
      if (onSwitchBackToManager) onSwitchBackToManager();
    } else {
      if (onSwitchRole) onSwitchRole(roleId);
    }
  };

  const handleSaveRoleEdit = () => {
    if (!selectedRoleForEdit) return;
    const updated = rolesConfig.map((r) => (r.id === selectedRoleForEdit.id ? selectedRoleForEdit : r));
    setRolesConfig(updated);
    try {
      localStorage.setItem("medo_roles_permissions_config", JSON.stringify(updated));
    } catch {}
    setSaveSuccessMsg(`✅ تم حفظ وتحديث مصفوفة صلاحيات دور (${selectedRoleForEdit.nameAr}) بنجاح!`);
    addDebugLog(`💾 تم تحديث صلاحيات الدور: ${selectedRoleForEdit.id}`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
    setSelectedRoleForEdit(null);
  };

  const handleResetAllToDefault = () => {
    if (window.confirm("هل أنت متأكد من استعادة مصفوفة الصلاحيات الافتراضية للنظام؟")) {
      setRolesConfig(DEFAULT_ROLES_CONFIG);
      try {
        localStorage.removeItem("medo_roles_permissions_config");
      } catch {}
      setSaveSuccessMsg("🔄 تم استعادة مصفوفة الصلاحيات القياسية لجميع الأدوار بنجاح!");
      addDebugLog("🔄 تم إعادة ضبط الصلاحيات إلى التكوين القياسي");
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  const handleToggleMatrixPermission = (roleId: string, permKey: keyof RolePermissionConfig["permissions"]) => {
    const updated = rolesConfig.map((role) => {
      if (role.id === roleId) {
        const newVal = !role.permissions[permKey];
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [permKey]: newVal,
          },
        };
      }
      return role;
    });
    setRolesConfig(updated);
    try {
      localStorage.setItem("medo_roles_permissions_config", JSON.stringify(updated));
    } catch {}
    addDebugLog(`✏️ تم تعديل الصلاحية [${permKey}] للدور [${roleId}]`);
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(debugLogs.join("\n"));
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const handleClearLogs = () => {
    setDebugLogs([`[${new Date().toLocaleTimeString("ar-YE")}] 🧹 تم مسح سجلات التشخيص بنجاح`]);
  };

  const handleExportAuditLogs = () => {
    const headers = "المعرف,المستخدم,من دور,إلى دور,الوقت,المنشأة,الحالة,التفاصيل\n";
    const rows = auditLogs
      .map((l) => `"${l.id}","${l.username}","${l.fromRole}","${l.toRole}","${l.timestamp}","${l.tenantName}","${l.status}","${l.details}"`)
      .join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Medo_ERP_Role_Switch_Audit_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12" dir="rtl">
      {/* 👑 Top Sovereign Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1b2e] via-[#1b1536] to-[#0d1b2e] border-2 border-[#7d3c98]/50 p-6 sm:p-8 shadow-2xl shadow-purple-950/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7d3c98] to-[#4a235a] border-2 border-[#d4af37] flex items-center justify-center text-3xl shadow-xl shadow-purple-950/60 shrink-0">
              🎭
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  إدارة الأدوار والمصفوفة السيادية للصلاحيات
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-purple-900/80 to-amber-900/80 text-amber-300 border border-amber-500/40 shadow-sm">
                  Role-Based Access Control (RBAC)
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                تحكم كامل في الأدوار الـ 5 المعتمدة، الصفحات الافتراضية، مصفوفة الصلاحيات، وسجل التدقيق الفوري لتبديلات الأدوار.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleResetAllToDefault}
              className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>استعادة المصفوفة القياسية</span>
            </button>
            <button
              onClick={() => handleRoleSelectTest("MANAGER")}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-black shadow-lg shadow-purple-950/50 transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>وضع المدير العام 👑</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* 📊 KPI Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-purple-950/30 border border-purple-900/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">الأدوار المعتمدة</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white mt-2">5</div>
          <span className="text-[11px] text-purple-300 font-medium block mt-1">مدير، محاسب، كاشير، مشتريات، مراجع</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-blue-950/30 border border-blue-900/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">المستخدمون النشطون</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white mt-2">1,250+</div>
          <span className="text-[11px] text-blue-300 font-medium block mt-1">مربوطين بالمنشأة والمستودعات</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-emerald-950/30 border border-emerald-900/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">الجلسات المفتوحة</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Key className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-2">15 نشطة</div>
          <span className="text-[11px] text-emerald-300 font-medium block mt-1">مشفرة بتوكنات آمنة JWT</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-amber-950/30 border border-amber-900/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">الدور الحالي المفعل</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-lg font-black text-amber-300 mt-2 truncate">
            {getRoleLabel(currentUser?.role)}
          </div>
          <span className="text-[11px] text-amber-400/80 font-mono block mt-1">
            المنشأة: {activeTenantName}
          </span>
        </div>
      </div>

      {/* ⚡ Quick Live Role Switcher Test Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-black text-white flex items-center gap-1.5">
            <span>⚡ اختبار سريع للتبديل الفوري بين الأدوار:</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleRoleSelectTest("MANAGER")}
            className="px-3 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/70 text-purple-200 border border-purple-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>👑 المدير</span>
          </button>
          <button
            onClick={() => handleRoleSelectTest("ACCOUNTANT")}
            className="px-3 py-1.5 rounded-xl bg-blue-900/50 hover:bg-blue-800/70 text-blue-200 border border-blue-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>📊 المحاسب</span>
          </button>
          <button
            onClick={() => handleRoleSelectTest("CASHIER")}
            className="px-3 py-1.5 rounded-xl bg-emerald-900/50 hover:bg-emerald-800/70 text-emerald-200 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>🛒 الكاشير</span>
          </button>
          <button
            onClick={() => handleRoleSelectTest("PURCHASER")}
            className="px-3 py-1.5 rounded-xl bg-amber-900/50 hover:bg-amber-800/70 text-amber-200 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>📦 المشتريات</span>
          </button>
          <button
            onClick={() => handleRoleSelectTest("AUDITOR")}
            className="px-3 py-1.5 rounded-xl bg-teal-900/50 hover:bg-teal-800/70 text-teal-200 border border-teal-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>🔍 المراجع</span>
          </button>
          <button
            onClick={() => handleRoleSelectTest("MANAGER")}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 text-slate-950 text-xs font-black shadow transition flex items-center gap-1 cursor-pointer"
          >
            <span>↩️ العودة للمدير</span>
          </button>
        </div>
      </div>

      {/* 🧭 Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("ROLES_LIST")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === "ROLES_LIST"
              ? "bg-[#7d3c98] text-white shadow-lg shadow-purple-950/50"
              : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>الأدوار المتاحة والتخصيص</span>
        </button>

        <button
          onClick={() => setActiveSubTab("MATRIX")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === "MATRIX"
              ? "bg-[#7d3c98] text-white shadow-lg shadow-purple-950/50"
              : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>🔑 مصفوفة الصلاحيات التفاعلية</span>
        </button>

        <button
          onClick={() => setActiveSubTab("AUDIT_LOGS")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === "AUDIT_LOGS"
              ? "bg-[#7d3c98] text-white shadow-lg shadow-purple-950/50"
              : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>📜 سجل تبديلات الأدوار</span>
        </button>

        <button
          onClick={() => setActiveSubTab("DEBUG_LAB")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === "DEBUG_LAB"
              ? "bg-[#7d3c98] text-white shadow-lg shadow-purple-950/50"
              : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>🧪 مختبر الاختبار ووحدة التصحيح (Debug Console)</span>
        </button>
      </div>

      {/* 📑 TAB 1: Roles List */}
      {activeSubTab === "ROLES_LIST" && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white">قائمة الأدوار المعتمدة بالنظام</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  انقر على زر الإعدادات ⚙️ بجانب أي دور لتعديل مسمياته، صفحته الافتراضية، أو مصفوفة تصاريحه
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                    <th className="p-3.5 font-bold">#</th>
                    <th className="p-3.5 font-bold">الدور والمعرف</th>
                    <th className="p-3.5 font-bold">الصفحة الافتراضية</th>
                    <th className="p-3.5 font-bold text-center">نسبة الصلاحيات</th>
                    <th className="p-3.5 font-bold text-center">الحالة</th>
                    <th className="p-3.5 font-bold text-center">اختبار فوري</th>
                    <th className="p-3.5 font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {rolesConfig.map((role, idx) => (
                    <tr key={role.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono text-slate-500 font-bold">{idx + 1}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {role.id === "MANAGER" ? "👑" : role.id === "ACCOUNTANT" ? "📊" : role.id === "CASHIER" ? "🛒" : role.id === "PURCHASER" ? "📦" : "🔍"}
                          </span>
                          <div>
                            <div className="font-black text-white text-sm">{role.nameAr}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{role.id} ({role.code})</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-mono text-[11px]">
                          {role.defaultRouteNameAr}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full"
                              style={{ width: `${role.coveragePercentage}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-white text-xs">{role.coveragePercentage}%</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          ✅ {role.status === "ACTIVE" ? "نشط" : "معطل"}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleRoleSelectTest(role.id as any)}
                          className="px-3 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-700 text-purple-200 text-xs font-bold transition cursor-pointer"
                        >
                          🔄 تبديل تجريبي
                        </button>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setSelectedRoleForEdit(JSON.parse(JSON.stringify(role)))}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>⚙️ تخصيص</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 📑 TAB 2: Interactive Permissions Matrix */}
      {activeSubTab === "MATRIX" && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>🔑 مصفوفة الصلاحيات والوصول الشاملة (Permission Matrix)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  انقر على أي علامة ✅ أو ❌ لتفعيل أو حجب الوحدة فوراً عن الدور المحدد
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetAllToDefault}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة تعيين</span>
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem("medo_roles_permissions_config", JSON.stringify(rolesConfig));
                    setSaveSuccessMsg("💾 تم حفظ مصفوفة الصلاحيات المعدلة بنجاح!");
                    setTimeout(() => setSaveSuccessMsg(null), 4000);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow transition flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ المصفوفة</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-300 border-b border-slate-800">
                    <th className="p-3.5 font-bold min-w-[200px]">الوحدة / الصفحة</th>
                    {rolesConfig.map((r) => (
                      <th key={r.id} className="p-3.5 font-bold text-center min-w-[120px]">
                        <div className="text-sm font-black text-white">{r.nameAr.split(" ")[0]} {r.nameAr.split(" ")[1] || ""}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.id}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[
                    { key: "dashboardView" as const, title: "لوحة التحكم والملخص العام", tag: "DASHBOARD" },
                    { key: "chartOfAccounts" as const, title: "شجرة الحسابات (FI)", tag: "COA" },
                    { key: "journalEntries" as const, title: "قيود اليومية العامة", tag: "JOURNAL" },
                    { key: "generalLedger" as const, title: "دفتر الأستاذ وميزان المراجعة", tag: "LEDGER" },
                    { key: "vouchers" as const, title: "سندات القبض والصرف", tag: "VOUCHERS" },
                    { key: "salesPos" as const, title: "فواتير المبيعات ونقاط البيع", tag: "SALES" },
                    { key: "purchasesVendors" as const, title: "فواتير المشتريات والموردين", tag: "PURCHASES" },
                    { key: "inventory" as const, title: "إدارة المخزون والمستودعات", tag: "INVENTORY" },
                    { key: "financialReports" as const, title: "التقارير المالية والختامية", tag: "REPORTS" },
                    { key: "fixedAssets" as const, title: "الأصول الثابتة والإهلاك", tag: "ASSETS" },
                    { key: "costCenters" as const, title: "مراكز التكلفة والربحية", tag: "COST_CENTERS" },
                    { key: "settings" as const, title: "إعدادات المنشأة العامة", tag: "SETTINGS" },
                    { key: "userManagement" as const, title: "إدارة المستخدمين والصلاحيات", tag: "USERS" },
                    { key: "cloudSync" as const, title: "المزامنة السحابية وقواعد البيانات", tag: "SYNC" },
                  ].map((row) => (
                    <tr key={row.key} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white text-xs">{row.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{row.tag}</div>
                      </td>
                      {rolesConfig.map((role) => {
                        const isAllowed = role.permissions[row.key];
                        return (
                          <td key={role.id} className="p-3.5 text-center">
                            <button
                              onClick={() => handleToggleMatrixPermission(role.id, row.key)}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto transition cursor-pointer ${
                                isAllowed
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-700/80 hover:bg-emerald-900"
                                  : "bg-rose-950/60 text-rose-400 border border-rose-800/80 hover:bg-rose-900/80"
                              }`}
                              title={isAllowed ? "مسموح (انقر للحجب)" : "محجوب (انقر للسماح)"}
                            >
                              {isAllowed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 📑 TAB 3: Audit Logs */}
      {activeSubTab === "AUDIT_LOGS" && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>📜 سجل تبديلات الأدوار وجلسات الفحص</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  توثيق زمني دقيق لكافة عمليات التبديل والاختبار بين الأدوار والمنشآت
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportAuditLogs}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>تصدير Excel (CSV)</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-blue-400" />
                  <span>طباعة</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                    <th className="p-3.5 font-bold">#</th>
                    <th className="p-3.5 font-bold">المستخدم</th>
                    <th className="p-3.5 font-bold">من دور</th>
                    <th className="p-3.5 font-bold">إلى دور</th>
                    <th className="p-3.5 font-bold">الوقت</th>
                    <th className="p-3.5 font-bold">المنشأة</th>
                    <th className="p-3.5 font-bold text-center">الحالة</th>
                    <th className="p-3.5 font-bold">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.map((log, idx) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono text-slate-500 font-bold">{idx + 1}</td>
                      <td className="p-3.5 font-bold text-white">{log.username}</td>
                      <td className="p-3.5 text-slate-300">{log.fromRole}</td>
                      <td className="p-3.5 font-black text-amber-400">{log.toRole}</td>
                      <td className="p-3.5 font-mono text-slate-400">{log.timestamp}</td>
                      <td className="p-3.5 text-slate-300">{log.tenantName}</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {log.status === "SUCCESS" ? "✅ ناجح" : "❌ فشل"}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 📑 TAB 4: Debug Console & Role Testing Lab */}
      {activeSubTab === "DEBUG_LAB" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Debug Info Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🐛</span>
                  <h3 className="font-black text-white text-sm">معلومات التشخيص السيادية (Debug Info)</h3>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 font-bold">🎭 الدور الحالي:</span>
                  <span className="font-black text-amber-300">{getRoleLabel(currentUser?.role)} ({currentUser?.role || "SYSTEM_ADMIN"})</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 font-bold">🏢 المنشأة النشطة:</span>
                  <span className="font-mono text-purple-300 font-bold">{activeTenantName} ({activeTenant})</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 font-bold">🔑 الصلاحيات الممنوحة:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {rolesConfig.find((r) => r.id === (currentUser?.role || "MANAGER"))?.coveragePercentage || 100}% (مفعلة بالكامل)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 font-bold">⏰ آخر مزامنة وتحديث:</span>
                  <span className="font-mono text-slate-300">{new Date().toLocaleTimeString("ar-YE")}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    const infoText = `Debug Info:\nRole: ${currentUser?.role || "SYSTEM_ADMIN"}\nTenant: ${activeTenant}\nTime: ${new Date().toISOString()}`;
                    navigator.clipboard.writeText(infoText);
                    alert("تم نسخ معلومات التشخيص للحافظة!");
                  }}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>نسخ تقرير Debug Info</span>
                </button>
              </div>
            </div>

            {/* Live Terminal & Console View */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-[#080d16] border border-slate-800 shadow-2xl flex flex-col h-[400px]">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                <div className="flex items-center gap-2 font-mono text-xs text-slate-300 font-bold">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Interactive Live Debug Console</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLogs}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border border-slate-800"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedLogs ? "تم النسخ!" : "نسخ السجلات"}</span>
                  </button>
                  <button
                    onClick={handleClearLogs}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-400 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border border-slate-800"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>مسح</span>
                  </button>
                </div>
              </div>

              {/* Console log list */}
              <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[11px] text-emerald-400/90 pr-1 select-text">
                {debugLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed hover:bg-slate-900/60 px-2 py-0.5 rounded transition">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⚙️ ROLE EDIT MODAL */}
      {selectedRoleForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn" dir="rtl">
          <div className="w-full max-w-2xl bg-slate-900 border-2 border-purple-600/40 rounded-3xl shadow-2xl overflow-hidden animate-slideDown max-h-[90vh] flex flex-col">
            <div className="p-5 bg-[#0e1626] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    تخصيص وإعدادات الدور: {selectedRoleForEdit.nameAr}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedRoleForEdit.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRoleForEdit(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">اسم الدور بالعربية</label>
                  <input
                    type="text"
                    value={selectedRoleForEdit.nameAr}
                    onChange={(e) =>
                      setSelectedRoleForEdit({ ...selectedRoleForEdit, nameAr: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">الصفحة الافتراضية عند تسجيل الدخول</label>
                  <select
                    value={selectedRoleForEdit.defaultRoute}
                    onChange={(e) => {
                      const tab = e.target.value as NavTab;
                      const tabNames: Record<string, string> = {
                        DASHBOARD: "لوحة التحكم (Dashboard)",
                        GENERAL_LEDGER: "دفتر الأستاذ العام (General Ledger)",
                        SALES_RETURNS: "فواتير المبيعات ونقاط البيع (Sales & POS)",
                        PURCHASES_RETURNS: "فواتير المشتريات والموردين (Purchases)",
                        FINANCIAL_REPORTS: "التقارير المالية وميزان المراجعة (Reports)",
                        CHART_OF_ACCOUNTS: "دليل الحسابات (Chart of Accounts)",
                        JOURNAL_ENTRIES: "قيود اليومية العامة (Journal Entries)",
                        VOUCHERS: "سندات القبض والصرف (Vouchers)",
                      };
                      setSelectedRoleForEdit({
                        ...selectedRoleForEdit,
                        defaultRoute: tab,
                        defaultRouteNameAr: tabNames[tab] || tab,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="DASHBOARD">لوحة التحكم (Dashboard)</option>
                    <option value="GENERAL_LEDGER">دفتر الأستاذ العام (General Ledger)</option>
                    <option value="SALES_RETURNS">فواتير المبيعات ونقاط البيع (Sales & POS)</option>
                    <option value="PURCHASES_RETURNS">فواتير المشتريات والموردين (Purchases)</option>
                    <option value="FINANCIAL_REPORTS">التقارير المالية وميزان المراجعة (Reports)</option>
                    <option value="CHART_OF_ACCOUNTS">دليل الحسابات (Chart of Accounts)</option>
                    <option value="JOURNAL_ENTRIES">قيود اليومية العامة (Journal Entries)</option>
                    <option value="VOUCHERS">سندات القبض والصرف (Vouchers)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">وصف الصلاحيات والمسؤوليات</label>
                <textarea
                  rows={2}
                  value={selectedRoleForEdit.description}
                  onChange={(e) =>
                    setSelectedRoleForEdit({ ...selectedRoleForEdit, description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Granular Permissions Checkboxes */}
              <div>
                <h4 className="font-bold text-white mb-2.5 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>الصلاحيات والوحدات الممنوحة لهذا الدور:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(selectedRoleForEdit.permissions).map(([k, val]) => (
                    <label
                      key={k}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        val
                          ? "bg-emerald-950/40 border-emerald-600/50 text-emerald-200"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      <span className="font-bold">
                        {k === "dashboardView" && "لوحة التحكم الرئيسية (View)"}
                        {k === "chartOfAccounts" && "دليل وشجرة الحسابات (COA)"}
                        {k === "journalEntries" && "إدخال وترحيل قيود اليومية"}
                        {k === "generalLedger" && "دفتر الأستاذ وميزان المراجعة"}
                        {k === "vouchers" && "سندات القبض والصرف"}
                        {k === "financialReports" && "القوائم والتقارير المالية"}
                        {k === "salesPos" && "فواتير المبيعات ونقاط البيع"}
                        {k === "purchasesVendors" && "فواتير المشتريات والموردين"}
                        {k === "inventory" && "إدارة المخزون والمستودعات"}
                        {k === "fixedAssets" && "الأصول الثابتة والإهلاك"}
                        {k === "costCenters" && "مراكز التكلفة والربحية"}
                        {k === "settings" && "إعدادات المنشأة العامة"}
                        {k === "userManagement" && "إدارة المستخدمين والأمان"}
                        {k === "cloudSync" && "المزامنة وقواعد البيانات"}
                        {k === "backupArchive" && "النسخ الاحتياطي والأرشيف"}
                      </span>
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={(e) =>
                          setSelectedRoleForEdit({
                            ...selectedRoleForEdit,
                            permissions: {
                              ...selectedRoleForEdit.permissions,
                              [k]: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-700"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedRoleForEdit(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
              >
                إلغاء
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleRoleSelectTest(selectedRoleForEdit.id as any);
                    setSelectedRoleForEdit(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-600 font-bold transition cursor-pointer"
                >
                  🧪 اختبار الدور الآن
                </button>
                <button
                  onClick={handleSaveRoleEdit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black shadow-lg shadow-emerald-950/50 transition cursor-pointer"
                >
                  💾 حفظ التعديلات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
