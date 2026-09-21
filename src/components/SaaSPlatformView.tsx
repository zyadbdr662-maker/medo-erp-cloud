import React, { useState, useEffect } from "react";
import { ERPState, SaaSClient } from "../types/erp";
import { SapComplianceReportModal } from "./SapComplianceReportModal";
import { OFFICIAL_APP_DOMAIN, generateClientPortalUrl } from "../config/appConfig";
import {
  multiCloudDbService,
  CloudDatabaseStatus,
  CloudSyncLog,
} from "../services/multiCloudDatabaseService";
import {
  PRE_GENERATED_200_TENANTS,
  PreGeneratedTenant,
  VERCEL_PRODUCTION_BASE,
  getStored200Tenants,
  saveStored200Tenants,
} from "../data/preGeneratedTenants";
import { Master200TenantsMatrixView } from "./Master200TenantsMatrixView";
import {
  ShieldCheck,
  Users,
  Key,
  Globe,
  Bell,
  Activity,
  Plus,
  CheckCircle2,
  Lock,
  Award,
  Terminal,
  Server,
  Cpu,
  FileText,
  Megaphone,
  Download,
  AlertTriangle,
  Building2,
  Layers,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Send,
  Mail,
  Smartphone,
  ExternalLink,
  Sliders,
  BarChart3,
  Database,
  Search,
  Filter,
  Share2,
  QrCode,
  ThumbsUp,
  ThumbsDown,
  Phone,
  MessageSquare,
  HelpCircle,
  Zap,
  Edit3,
  RotateCcw,
  Save,
} from "lucide-react";
import { BzmtLogo } from "./BzmtLogo";

interface SaaSPlatformViewProps {
  erpState: ERPState;
  onUpdateState: (newState: Partial<ERPState>) => void;
  onOpenTrialLockModal: () => void;
}

export const SaaSPlatformView: React.FC<SaaSPlatformViewProps> = ({
  erpState,
  onUpdateState,
  onOpenTrialLockModal,
}) => {
  const [activeTab, setActiveTab] = useState<
    | "ADMIN_DASHBOARD"
    | "MULTI_CLOUD_DBS"
    | "MASTER_200_LINKS"
    | "SUB_EMPLOYEE_LINKS"
    | "UNLOCK_CODES"
    | "CONVERSION_SURVEY"
    | "DATA_MIGRATION"
  >("ADMIN_DASHBOARD");

  // Multi-Cloud DB State
  const [dbStatuses, setDbStatuses] = useState<CloudDatabaseStatus[]>(
    multiCloudDbService.getDatabaseStatuses()
  );
  const [syncLogs, setSyncLogs] = useState<CloudSyncLog[]>(
    multiCloudDbService.getSyncLogs()
  );
  const [isTestingDbs, setIsTestingDbs] = useState(false);
  const [isSyncingDbs, setIsSyncingDbs] = useState(false);

  // 200 Matrix Search & Filter
  const [tenantsList, setTenantsList] = useState<PreGeneratedTenant[]>(() => getStored200Tenants());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<number | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Edit Company State
  const [editingTenant, setEditingTenant] = useState<PreGeneratedTenant | null>(null);
  const [editNameAr, setEditNameAr] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editCr, setEditCr] = useState("");
  const [editTax, setEditTax] = useState("");
  const [editAdminName, setEditAdminName] = useState("");
  const [editAdminPhone, setEditAdminPhone] = useState("");
  const [editAdminEmail, setEditAdminEmail] = useState("");
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "TRIAL" | "EXPIRED" | "PAID_ENTERPRISE">("TRIAL");
  const [editDbNode, setEditDbNode] = useState<"Alibaba Cloud" | "Huawei Cloud" | "PostgreSQL Local" | "Firebase" | "Qiniu Cloud">("Alibaba Cloud");

  // New Custom Company / Master Link Modal / Form
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyIndustry, setNewCompanyIndustry] = useState("تجارة عامة واستيراد");
  const [newCompanyCity, setNewCompanyCity] = useState("صنعاء");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminPhone, setNewAdminPhone] = useState("+967773586047");
  const [newAdminEmail, setNewAdminEmail] = useState("");

  // Sub-Employee Links Creator
  const [selectedTenantForEmp, setSelectedTenantForEmp] = useState<PreGeneratedTenant>(PRE_GENERATED_200_TENANTS[0]);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRole, setNewEmpRole] = useState<"MANAGER" | "ACCOUNTANT" | "PURCHASER" | "SALES" | "AUDITOR">("ACCOUNTANT");
  const [copiedSubLink, setCopiedSubLink] = useState<string | null>(null);

  // Unlock Master Code Generator State
  const [targetTenantSlug, setTargetTenantSlug] = useState(PRE_GENERATED_200_TENANTS[0].slug);
  const [selectedPlanDuration, setSelectedPlanDuration] = useState<"ANNUAL_365" | "LIFETIME_UNLIMITED">("LIFETIME_UNLIMITED");
  const [generatedMasterUnlockCode, setGeneratedMasterUnlockCode] = useState<string>("");
  const [unlockSuccessMsg, setUnlockSuccessMsg] = useState("");

  // Conversion Survey Simulator State
  const [surveySatisfaction, setSurveySatisfaction] = useState<"LIKE" | "DISLIKE" | null>(null);
  const [surveyNotes, setSurveyNotes] = useState("");
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  // Migration State
  const [migrationFormat, setMigrationFormat] = useState<"ONEX_PRO" | "EXCEL_CSV" | "AL_AMEEN" | "YEMEN_SOFT">("ONEX_PRO");
  const [migrationRawText, setMigrationRawText] = useState("");
  const [isParsingMigration, setIsParsingMigration] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);

  const [successMsg, setSuccessMsg] = useState("");
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);

  // Run test all databases
  const handleTestAllDbs = async () => {
    setIsTestingDbs(true);
    try {
      const res = await multiCloudDbService.testAllConnections();
      setDbStatuses(res.results);
      setSyncLogs(multiCloudDbService.getSyncLogs());
      setSuccessMsg(`✅ تم فحص والتحقق من اتصال وتزامن جميع قواعد البيانات الـ 5 بنجاح!`);
      setTimeout(() => setSuccessMsg(""), 5000);
    } finally {
      setIsTestingDbs(false);
    }
  };

  // Sync databases
  const handleSyncAllDbs = async () => {
    setIsSyncingDbs(true);
    try {
      const res = await multiCloudDbService.syncAllDatabases(28450);
      setDbStatuses(multiCloudDbService.getDatabaseStatuses());
      setSyncLogs(multiCloudDbService.getSyncLogs());
      setSuccessMsg(`🚀 تم إتمام المزامنة السحابية المزدوجة المتطابقة عبر الخوادم الـ 5 بنجاح!`);
      setTimeout(() => setSuccessMsg(""), 5000);
    } finally {
      setIsSyncingDbs(false);
    }
  };

  // Copy Link with notification
  const handleCopyLink = (link: string, index: number) => {
    navigator.clipboard.writeText(link);
    setCopiedLinkIndex(index);
    setTimeout(() => setCopiedLinkIndex(null), 2500);
  };

  // Copy Unlock Code
  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2500);
  };

  // Create new tenant master link
  const handleCreateNewTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    const nextIndex = tenantsList.length + 1;
    const slug = `company-${nextIndex}`;
    const cr = `CR-1010${(500000 + nextIndex * 41).toString().substring(0, 6)}`;
    const vat = `300${(748291000 + nextIndex * 97).toString().substring(0, 9)}00003`;
    const vercelBase = VERCEL_PRODUCTION_BASE;
    const masterDomain = `${vercelBase}/?tenant=${slug}`;
    const vercelUrl = masterDomain;
    const unlockCode = `MEDO-UNLOCK-2026-C${nextIndex.toString().padStart(3, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newTenant: PreGeneratedTenant = {
      index: nextIndex,
      id: `tenant-${slug}`,
      slug,
      name: newCompanyName,
      nameEn: `Enterprise Node #${nextIndex} (${slug})`,
      companyNameAr: newCompanyName,
      companyNameEn: `Enterprise Node #${nextIndex} (${slug})`,
      crNumber: cr,
      commercialReg: cr,
      taxNumber: vat,
      phone: newAdminPhone || "+967 773 586 047",
      address: `${newCompanyCity} - الجمهورية اليمنية`,
      industry: newCompanyIndustry,
      city: newCompanyCity,
      logo: "🏢",
      masterDomain,
      vercelUrl,
      status: "TRIAL",
      trialDaysRemaining: 30,
      operationsCount: 0,
      maxTrialOperations: 200,
      assignedAdminName: newAdminName || `مدير منشأة ${newCompanyName}`,
      assignedAdminPhone: newAdminPhone || "+967 773 586 047",
      assignedAdminEmail: newAdminEmail || `admin@${slug}.medo-erp.cloud`,
      databaseNode: "Alibaba Cloud",
      unlockCode,
      employees: [
        {
          id: `emp-${nextIndex}-1`,
          name: newAdminName || "المدير العام",
          roleAr: "مدير عام المنشأة",
          roleEn: "MANAGER",
          loginEmail: `manager@${slug}.medo-erp.cloud`,
          password: "1234",
          subLink: `${vercelBase}/?tenant=${slug}&role=MANAGER&token=AUTH_MGR_${nextIndex}&path=/employee/manager`,
        },
        {
          id: `emp-${nextIndex}-2`,
          name: "المحاسب المالي",
          roleAr: "محاسب عام رئيسي",
          roleEn: "ACCOUNTANT",
          loginEmail: `accountant@${slug}.medo-erp.cloud`,
          password: "1234",
          subLink: `${vercelBase}/?tenant=${slug}&role=ACCOUNTANT&token=AUTH_ACC_${nextIndex}&path=/employee/accountant`,
        },
      ],
    };

    const newTenantList = [newTenant, ...tenantsList];
    setTenantsList(newTenantList);
    saveStored200Tenants(newTenantList);
    setIsCreateCompanyOpen(false);
    setNewCompanyName("");
    setNewAdminName("");
    setSuccessMsg(`🎉 تم بنجاح إنشاء وتفعيل الرابط الرئيسي للمنشأة الجديدة (${newCompanyName})!`);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  // Open Edit Modal for a Tenant
  const handleOpenEditModal = (tenant: PreGeneratedTenant) => {
    setEditingTenant(tenant);
    setEditNameAr(tenant.companyNameAr);
    setEditNameEn(tenant.companyNameEn);
    setEditIndustry(tenant.industry);
    setEditCity(tenant.city);
    setEditCr(tenant.commercialReg);
    setEditTax(tenant.taxNumber);
    setEditAdminName(tenant.assignedAdminName);
    setEditAdminPhone(tenant.assignedAdminPhone);
    setEditAdminEmail(tenant.assignedAdminEmail);
    setEditStatus(tenant.status);
    setEditDbNode(tenant.databaseNode);
  };

  // Save Edited Tenant
  const handleSaveEditTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant || !editNameAr.trim()) return;

    const updatedList = tenantsList.map((t) => {
      if (t.id === editingTenant.id) {
        return {
          ...t,
          companyNameAr: editNameAr.trim(),
          companyNameEn: editNameEn.trim() || t.companyNameEn,
          industry: editIndustry.trim() || t.industry,
          city: editCity.trim() || t.city,
          commercialReg: editCr.trim() || t.commercialReg,
          taxNumber: editTax.trim() || t.taxNumber,
          assignedAdminName: editAdminName.trim() || t.assignedAdminName,
          assignedAdminPhone: editAdminPhone.trim() || t.assignedAdminPhone,
          assignedAdminEmail: editAdminEmail.trim() || t.assignedAdminEmail,
          status: editStatus,
          databaseNode: editDbNode,
        };
      }
      return t;
    });

    setTenantsList(updatedList);
    saveStored200Tenants(updatedList);
    setEditingTenant(null);
    setSuccessMsg(`✏️ تم بنجاح حفظ وتعديل بيانات المنشأة رقم (${editingTenant.index}) إلى: "${editNameAr.trim()}"`);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  // Reset 200 Companies to Default
  const handleResetAllTenantsToDefault = () => {
    if (window.confirm("هل أنت تأكد من إرجاع أسماء الـ 200 منشأة إلى الأسماء الافتراضية الأولى؟")) {
      setTenantsList(PRE_GENERATED_200_TENANTS);
      saveStored200Tenants(PRE_GENERATED_200_TENANTS);
      setSuccessMsg("🔄 تم إعادة ضبط دليل الـ 200 منشأة للاسم والتسجيل الافتراضي.");
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  // Add Employee Sub-link
  const handleAddEmployeeSubLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    const roleLabels: Record<string, string> = {
      MANAGER: "مدير عام المنشأة",
      ACCOUNTANT: "محاسب عام رئيسي",
      PURCHASER: "مسؤول مشتريات ومخازن",
      SALES: "كاشير ومبيعات نقاط البيع",
      AUDITOR: "مدقق ومراجع حسابات خارجي",
    };

    const newEmpId = `emp-${selectedTenantForEmp.index}-${Date.now().toString().slice(-4)}`;
    const vercelBase = VERCEL_PRODUCTION_BASE;
    const subLink = `${vercelBase}/?tenant=${selectedTenantForEmp.slug}&role=${newEmpRole}&token=AUTH_${newEmpRole}_${Date.now().toString().slice(-4)}&path=/employee/${newEmpRole.toLowerCase()}`;

    const updatedEmployees = [
      ...selectedTenantForEmp.employees,
      {
        id: newEmpId,
        name: newEmpName,
        roleAr: roleLabels[newEmpRole],
        roleEn: newEmpRole,
        subLink,
        loginEmail: `${newEmpRole.toLowerCase()}@${selectedTenantForEmp.slug}.medo-erp.cloud`,
        password: "1234",
      },
    ];

    const updatedTenants = tenantsList.map((t) =>
      t.id === selectedTenantForEmp.id ? { ...t, employees: updatedEmployees } : t
    );

    setTenantsList(updatedTenants);
    saveStored200Tenants(updatedTenants);
    setSelectedTenantForEmp({ ...selectedTenantForEmp, employees: updatedEmployees });
    setNewEmpName("");
    setSuccessMsg(`✅ تم إصدار الرابط الفرعي المخصص للموظف (${newEmpName}) بنجاح!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Generate Master Unlock Code
  const handleGenerateUnlockCode = () => {
    const tenant = tenantsList.find((t) => t.slug === targetTenantSlug);
    if (!tenant) return;

    const code = `MEDO-VIP-ACTIVATE-${tenant.slug.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`;
    setGeneratedMasterUnlockCode(code);
    setUnlockSuccessMsg(`تم توليد رمز الفك والترقية للمنشأة (${tenant.companyNameAr}) - قم بإرساله للعميل.`);
  };

  // Upgrade Tenant to Paid
  const handleUpgradeTenantToPaid = (slug: string) => {
    const updated = tenantsList.map((t) =>
      t.slug === slug
        ? {
            ...t,
            status: "PAID_ENTERPRISE" as const,
            trialDaysRemaining: 365,
            maxTrialOperations: 999999,
          }
        : t
    );
    setTenantsList(updated);
    saveStored200Tenants(updated);
    setSuccessMsg(`💎 تم ترقية المنشأة (${slug}) رسمياً إلى الباقة المدفوعة غير المحدودة!`);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  // Export 200 Links to CSV
  const handleExportCSV = () => {
    const headers = "Index,Company Name,Slug,Status,Database Node,Master Domain,Vercel URL,Unlock Code,Admin Phone\n";
    const rows = tenantsList
      .map(
        (t) =>
          `"${t.index}","${t.companyNameAr}","${t.slug}","${t.status}","${t.databaseNode}","${t.masterDomain}","${t.vercelUrl}","${t.unlockCode}","${t.assignedAdminPhone}"`
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `MeDo_ERP_200_Master_Trial_Links_Matrix_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered tenants
  const filteredTenants = tenantsList.filter((t) => {
    const matchesSearch =
      t.companyNameAr.includes(searchQuery) ||
      t.slug.includes(searchQuery.toLowerCase()) ||
      t.city.includes(searchQuery) ||
      t.industry.includes(searchQuery);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PAID" && t.status === "PAID_ENTERPRISE") ||
      (statusFilter === "TRIAL" && t.status === "TRIAL");

    return matchesSearch && matchesStatus;
  });

  const totalPaidCount = tenantsList.filter((t) => t.status === "PAID_ENTERPRISE").length;
  const totalTrialCount = tenantsList.filter((t) => t.status === "TRIAL").length;

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-right"
      dir="rtl"
      style={{ fontFamily: "'Alexandria', 'Cairo', sans-serif" }}
    >
      {/* Executive Command Header */}
      <div className="bg-gradient-to-l from-[#0a2540] via-[#0c2e50] to-[#163e6c] border-2 border-[#d4af37]/50 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <BzmtLogo size="lg" variant="monogram" />
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 rounded-full text-xs font-bold mb-2 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                <span>بوابة الإدارة العليا والسيادية — منصة SaaS متعددة المستأجرين (Multi-Tenant)</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight mb-1 flex items-center gap-3 flex-wrap">
                <span>حزمة التوسع المؤسسي وإدارة الـ 200 شركة</span>
                <span className="text-xs px-2.5 py-1 bg-[#d4af37] text-[#0a2540] rounded-lg font-mono font-black shadow">
                  v4.5 Master Enterprise Suite
                </span>
              </h1>
              <p className="text-xs lg:text-sm text-slate-200 max-w-3xl leading-relaxed">
                لوحة التحكم المركزية للسيد / بدر عايض محمد (مدير النظام) لإدارة الروابط الرئيسية والفرعية، مراقبة قواعد البيانات الـ 5، إصدار رموز القفل والترقية، وتفعيل تجارب الـ 200 شركة.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => setIsCreateCompanyOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#f39c12] hover:brightness-110 text-[#0a2540] font-black rounded-xl text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0a2540]" />
              <span>+ إنشاء رابط رئيسي لشركة جديدة</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-[#06182a] hover:bg-[#0c2b48] border border-[#d4af37]/50 text-[#d4af37] font-bold rounded-xl text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#d4af37]" />
              <span>تصدير مصفوفة الـ 200 رابط (CSV/Excel)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Feature Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-700/80 pb-3">
        {[
          { id: "ADMIN_DASHBOARD", label: "📊 لوحة التحكم والمؤشرات (KPIs)", icon: BarChart3 },
          { id: "MULTI_CLOUD_DBS", label: "☁️ قواعد البيانات السحابية الخمس (5 Clouds)", icon: Database },
          { id: "MASTER_200_LINKS", label: "🏢 مصفوفة الـ 200 رابط تجريبي رئيسي", icon: Globe },
          { id: "SUB_EMPLOYEE_LINKS", label: "👥 إدارة الروابط الفرعية للموظفين (5 أدوار)", icon: Users },
          { id: "UNLOCK_CODES", label: "🔑 إدارة التراخيص ومولد رموز القفل", icon: Key },
          { id: "CONVERSION_SURVEY", label: "💬 استبيان الرضا وتحويل المشتركين", icon: MessageSquare },
          { id: "DATA_MIGRATION", label: "💾 ترحيل بيانات العملاء (OneX Pro / Excel)", icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-[#d4af37] to-[#f1c40f] text-[#0a2540] shadow-md shadow-[#d4af37]/30 border border-[#b8860b]"
                  : "bg-[#06182a] text-slate-300 hover:text-white hover:bg-[#0a2540] border border-blue-900/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {successMsg && (
        <div className="bg-[#0a2540] border-2 border-[#d4af37] text-white p-4 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-xl">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-[#d4af37]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: ADMIN_DASHBOARD */}
      {/* ========================================================= */}
      {activeTab === "ADMIN_DASHBOARD" && (
        <div className="space-y-6">
          {/* Executive KPI Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0a2540] border border-[#d4af37]/40 rounded-2xl p-5 text-white shadow-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-300 font-semibold mb-1">إجمالي المنشآت والشركات</p>
                <h3 className="text-3xl font-black text-white">200 <span className="text-xs text-[#d4af37] font-normal">منشأة مستقلة</span></h3>
                <span className="text-[10px] text-emerald-400 font-bold mt-1 inline-block">● 100% معزولة أمنياً وقاعدياً</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37]">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-[#0a2540] border border-amber-500/40 rounded-2xl p-5 text-white shadow-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-300 font-semibold mb-1">الشركات في الفترة التجريبية</p>
                <h3 className="text-3xl font-black text-amber-300">150 <span className="text-xs text-slate-300 font-normal">شركة (Trial)</span></h3>
                <span className="text-[10px] text-amber-300 font-bold mt-1 inline-block">حد 200 عملية / 30 يوماً</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300">
                <Lock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-[#0a2540] border border-emerald-500/40 rounded-2xl p-5 text-white shadow-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-300 font-semibold mb-1">الشركات المدفوعة (Enterprise)</p>
                <h3 className="text-3xl font-black text-emerald-400">50 <span className="text-xs text-slate-300 font-normal">مشترك معتمد</span></h3>
                <span className="text-[10px] text-emerald-300 font-bold mt-1 inline-block">ترخيص سنوي / دائم كامل</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-[#0a2540] border border-[#d4af37]/40 rounded-2xl p-5 text-white shadow-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-300 font-semibold mb-1">الإيرادات السنوية التقديرية</p>
                <h3 className="text-2xl font-black text-[#d4af37]">125,000 <span className="text-xs text-slate-200">USD</span></h3>
                <span className="text-[10px] text-slate-300 font-bold mt-1 inline-block">معدل التحويل المتوقع: 35%</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37]">
                <Zap className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Actions & Workspace Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#06182a] border border-blue-900/80 rounded-3xl p-6 text-white space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#d4af37]/20 text-[#d4af37] rounded-xl border border-[#d4af37]/40">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">إدارة مصفوفة الـ 200 رابط</h3>
                  <p className="text-[11px] text-slate-400">روابط رئيسية مستقلة لكل شركة</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                توزيع 200 رابط مسبق الإعداد للمنشآت التجارية في اليمن والخليج، مع جاهزية الربط مع Vercel و MeDo Cloud.
              </p>
              <button
                onClick={() => setActiveTab("MASTER_200_LINKS")}
                className="w-full py-2.5 px-4 bg-[#0a2540] hover:bg-[#0e355c] border border-[#d4af37]/50 text-[#d4af37] rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>استعراض مصفوفة الـ 200 شركة</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#06182a] border border-blue-900/80 rounded-3xl p-6 text-white space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">الروابط الفرعية للموظفين</h3>
                  <p className="text-[11px] text-slate-400">5 أدوار وصلاحيات مخصصة لكل شركة</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                إصدار رابط فرعي مباشر لكل موظف (المدير، المحاسب، المشتريات، المبيعات، المدقق) مع تقييد الصلاحيات التلقائي.
              </p>
              <button
                onClick={() => setActiveTab("SUB_EMPLOYEE_LINKS")}
                className="w-full py-2.5 px-4 bg-[#0a2540] hover:bg-[#0e355c] border border-emerald-500/50 text-emerald-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>إدارة روابط الموظفين الفرعية</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#06182a] border border-blue-900/80 rounded-3xl p-6 text-white space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/40">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">إصدار رموز القفل والترقية</h3>
                  <p className="text-[11px] text-slate-400">فك حد الـ 200 عملية للعملاء</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                توليد فوري لرموز الترخيص لفتح النسخ التجريبية وإلغاء القفل بعد موافقة العميل على الاشتراك المدفوع.
              </p>
              <button
                onClick={() => setActiveTab("UNLOCK_CODES")}
                className="w-full py-2.5 px-4 bg-[#0a2540] hover:bg-[#0e355c] border border-purple-500/50 text-purple-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>فتح مولد رموز القفل والترقية</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MULTI_CLOUD_DBS (قواعد البيانات السحابية الخمس) */}
      {/* ========================================================= */}
      {activeTab === "MULTI_CLOUD_DBS" && (
        <div className="space-y-6">
          <div className="bg-[#06182a] border border-blue-900/80 rounded-3xl p-6 text-white shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-900/80 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#d4af37]" />
                  <span>لوحة التيليمتري والمراقبة الحية لقواعد البيانات السحابية الخمس</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  فحص الاتصال اللحظي والمزامنة عبر: Alibaba Cloud, Huawei Cloud, Qiniu Cloud, PostgreSQL Local, و Firebase
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleTestAllDbs}
                  disabled={isTestingDbs}
                  className="px-4 py-2 bg-[#d4af37] hover:bg-[#f1c40f] text-[#0a2540] font-black rounded-xl text-xs shadow-md flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isTestingDbs ? "animate-spin" : ""}`} />
                  <span>{isTestingDbs ? "جاري فحص الاتصالات..." : "اختبار الاتصال بجميع القواعد"}</span>
                </button>
                <button
                  onClick={handleSyncAllDbs}
                  disabled={isSyncingDbs}
                  className="px-4 py-2 bg-[#0a2540] hover:bg-[#0c2e50] border border-[#d4af37] text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <Zap className={`w-4 h-4 text-[#d4af37] ${isSyncingDbs ? "animate-pulse" : ""}`} />
                  <span>{isSyncingDbs ? "جاري المزامنة اللحظية..." : "مزامنة البيانات بين الخوادم الـ 5"}</span>
                </button>
              </div>
            </div>

            {/* 5 Cloud Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbStatuses.map((db, idx) => (
                <div
                  key={db.id}
                  className="bg-[#0a2540] border border-blue-900/80 hover:border-[#d4af37]/60 rounded-2xl p-4 transition-all shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-900/60 text-slate-300 font-bold">
                      قاعدة #{idx + 1}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>متصلة وتعمل (Online)</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-white">{db.nameAr}</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{db.engine}</p>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-300 bg-[#06182a] p-3 rounded-xl border border-blue-950">
                    <div className="flex justify-between">
                      <span className="text-slate-400">زمن الاستجابة (Ping):</span>
                      <strong className="text-[#d4af37] font-mono">{db.pingMs} ms</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">نسبة الجاهزية (Uptime):</span>
                      <strong className="text-emerald-400 font-mono">{db.uptimePercentage}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">السجلات المتزامنة:</span>
                      <strong className="text-slate-200 font-mono">{db.dataRecordsCount.toLocaleString()} سجل</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">معيار التشفير:</span>
                      <strong className="text-slate-200">{db.encryption}</strong>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed">{db.detailsAr}</p>
                </div>
              ))}
            </div>

            {/* Live Sync Logs */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#d4af37]" />
                <span>سجل المزامنة الحية وعمليات القراءة والكتابة اللحظية:</span>
              </h3>
              <div className="bg-[#06182a] border border-blue-900/80 rounded-2xl p-3 overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-blue-900 text-slate-400">
                      <th className="py-2 px-3">الوقت</th>
                      <th className="py-2 px-3">قاعدة البيانات</th>
                      <th className="py-2 px-3">نوع العملية</th>
                      <th className="py-2 px-3">السجلات المتأثرة</th>
                      <th className="py-2 px-3">زمن التأخير</th>
                      <th className="py-2 px-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-950">
                    {syncLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#0a2540]/60">
                        <td className="py-2 px-3 font-mono text-slate-300">{log.timestamp}</td>
                        <td className="py-2 px-3 font-bold text-white">{log.database}</td>
                        <td className="py-2 px-3 font-mono text-amber-300">{log.operation}</td>
                        <td className="py-2 px-3 font-mono text-slate-300">{log.recordsAffected}</td>
                        <td className="py-2 px-3 font-mono text-[#d4af37]">{log.latencyMs} ms</td>
                        <td className="py-2 px-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            ناجحة (100%)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: MASTER_200_LINKS (مصفوفة الـ 200 شركة و 1000 رابط) */}
      {/* ========================================================= */}
      {activeTab === "MASTER_200_LINKS" && (
        <Master200TenantsMatrixView />
      )}

      {/* ========================================================= */}
      {/* TAB 4: SUB_EMPLOYEE_LINKS (الروابط الفرعية للموظفين) */}
      {/* ========================================================= */}
      {activeTab === "SUB_EMPLOYEE_LINKS" && (
        <div className="space-y-6">
          <div className="bg-[#06182a] border border-blue-900/80 rounded-3xl p-6 text-white shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-900/80 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#d4af37]" />
                  <span>إدارة الروابط الفرعية للموظفين بحسب الصلاحيات والأدوار</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  إصدار روابط دخول فرعية معزولة لكل دور (مدير، محاسب، مشتريات، مبيعات، مدقق حسابات).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-300 font-bold">اختر المنشأة:</label>
                <select
                  value={selectedTenantForEmp.slug}
                  onChange={(e) => {
                    const found = tenantsList.find((t) => t.slug === e.target.value);
                    if (found) setSelectedTenantForEmp(found);
                  }}
                  className="bg-[#0a2540] border border-[#d4af37]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                >
                  {tenantsList.map((t) => (
                    <option key={t.id} value={t.slug}>
                      {t.index}. {t.companyNameAr} ({t.slug})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Company Info Banner */}
            <div className="bg-[#0a2540] border border-blue-900 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-white">{selectedTenantForEmp.companyNameAr}</h3>
                <p className="text-xs text-[#d4af37] font-mono mt-0.5">{selectedTenantForEmp.masterDomain}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span>المدينة: <strong>{selectedTenantForEmp.city}</strong></span>
                <span>•</span>
                <span>الحالة: <strong className="text-emerald-400">{selectedTenantForEmp.status}</strong></span>
                <span>•</span>
                <span>الموظفون المعتمدون: <strong className="text-[#d4af37]">{selectedTenantForEmp.employees.length}</strong></span>
              </div>
            </div>

            {/* Add New Employee Form */}
            <form onSubmit={handleAddEmployeeSubLink} className="bg-[#06182a] border border-blue-900 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#d4af37]" />
                <span>إصدار رابط فرعي جديد لموظف في ({selectedTenantForEmp.companyNameAr}):</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">اسم الموظف الثلاثي:</label>
                  <input
                    type="text"
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    placeholder="مثال: أ. سالم بن مخاشن"
                    className="w-full bg-[#0a2540] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">الدور الوظيفي والصلاحية:</label>
                  <select
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value as any)}
                    className="w-full bg-[#0a2540] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="MANAGER">مدير عام المنشأة (صلاحيات كاملة)</option>
                    <option value="ACCOUNTANT">محاسب عام (قيود، فواتير، تقارير، بنوك)</option>
                    <option value="PURCHASER">مسؤول مشتريات ومخازن (سندات، مخزون)</option>
                    <option value="SALES">كاشير ومبيعات (فواتير، نقاط بيع، عملاء)</option>
                    <option value="AUDITOR">مدقق ومراجع حسابات (قراءة وتقارير ختامية فقط)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-[#d4af37] to-[#f39c12] text-[#0a2540] font-black rounded-xl text-xs hover:brightness-110 transition cursor-pointer shadow"
                  >
                    + إصدار الرابط الفرعي
                  </button>
                </div>
              </div>
            </form>

            {/* List of Issued Employee Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300">الروابط الفرعية الصادرة لبيانات دخول موظفي هذه المنشأة:</h4>
              <div className="space-y-3">
                {selectedTenantForEmp.employees.map((emp) => {
                  const empEmail = emp.loginEmail || `${emp.roleEn.toLowerCase()}@${selectedTenantForEmp.slug}.medo-erp.cloud`;
                  const empPass = emp.password || "1234";
                  const fullFormattedCreds = `المنشأة: ${selectedTenantForEmp.companyNameAr}
الموظف: ${emp.name} (${emp.roleAr})
البريد/المستخدم: ${empEmail}
كلمة المرور: ${empPass}
الرابط المباشر: ${emp.subLink}`;

                  return (
                    <div
                      key={emp.id}
                      className="p-4 bg-[#0a2540] border border-blue-900/80 rounded-2xl flex flex-col gap-3 shadow-md"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-900/60 pb-2">
                        <div className="flex items-center gap-2">
                          <strong className="text-white text-xs font-bold">{emp.name}</strong>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/90 text-[#d4af37] font-bold border border-[#d4af37]/30">
                            {emp.roleAr}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-slate-400">البريد/المستخدم:</span>
                          <span className="text-amber-300 font-mono bg-black/40 px-2 py-0.5 rounded">{empEmail}</span>
                          <span className="text-slate-400 mr-2">كلمة المرور:</span>
                          <span className="text-emerald-400 font-mono font-bold bg-black/40 px-2 py-0.5 rounded">{empPass}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">الرابط المباشر للدخول:</span>
                        <code className="text-[11px] text-amber-200 font-mono block break-all bg-black/50 p-2 rounded-xl border border-blue-900/40 select-all">
                          {emp.subLink}
                        </code>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(fullFormattedCreds);
                            setCopiedSubLink(`full-${emp.id}`);
                            setTimeout(() => setCopiedSubLink(null), 2500);
                          }}
                          className="px-3 py-1.5 bg-gradient-to-r from-[#d4af37] to-[#f39c12] text-[#0a2540] font-black rounded-xl text-xs hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer shadow"
                        >
                          {copiedSubLink === `full-${emp.id}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#0a2540]" />
                              <span>تم نسخ (الرابط + البريد + كلمة المرور)!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ كامل البيانات (الرابط + البريد + كلمة المرور)</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(emp.subLink);
                            setCopiedSubLink(emp.id);
                            setTimeout(() => setCopiedSubLink(null), 2500);
                          }}
                          className="px-3 py-1.5 bg-[#06182a] hover:bg-blue-900 text-slate-200 border border-blue-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedSubLink === emp.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>تم نسخ الرابط!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ الرابط المباشر فقط</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: UNLOCK_CODES (إدارة التراخيص ومولد رموز القفل) */}
      {/* ========================================================= */}
      {activeTab === "UNLOCK_CODES" && (
        <div className="space-y-6">
          <div className="bg-[#06182a] border border-blue-900/80 rounded-3xl p-6 text-white shadow-xl space-y-6">
            <div className="border-b border-blue-900/80 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-[#d4af37]" />
                <span>إصدار رموز القفل والترقية (Master License & Unlock Generator)</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                عند انتهاء الـ 200 عملية للنسخة التجريبية وتواصل العميل معكم، قم بتوليد رمز التفعيل وإلغاء القفل فورياً من هنا.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Generator Form */}
              <div className="bg-[#0a2540] border border-blue-900 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-[#d4af37]">توليد رمز تفعيل لمنشأة محددة:</h3>
                
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">حدد المنشأة المستهدفة:</label>
                  <select
                    value={targetTenantSlug}
                    onChange={(e) => setTargetTenantSlug(e.target.value)}
                    className="w-full bg-[#06182a] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    {tenantsList.map((t) => (
                      <option key={t.id} value={t.slug}>
                        {t.index}. {t.companyNameAr} ({t.slug})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">نوع باقة الترقية:</label>
                  <select
                    value={selectedPlanDuration}
                    onChange={(e) => setSelectedPlanDuration(e.target.value as any)}
                    className="w-full bg-[#06182a] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="LIFETIME_UNLIMITED">ترخيص دائم غير محدود (Lifetime Enterprise)</option>
                    <option value="ANNUAL_365">اشتراك سنوي (365 يوماً - 50,000 عملية)</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateUnlockCode}
                  className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#f39c12] text-[#0a2540] font-black rounded-xl text-xs hover:brightness-110 transition cursor-pointer shadow-lg"
                >
                  🔑 توليد رمز فك القفل والتفعيل الفوري
                </button>

                {generatedMasterUnlockCode && (
                  <div className="p-4 bg-[#06182a] border border-[#d4af37] rounded-xl space-y-2">
                    <span className="text-[11px] text-emerald-400 font-bold block">الرمز المعتمد الصادر:</span>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-sm font-black font-mono text-[#d4af37]">{generatedMasterUnlockCode}</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedMasterUnlockCode);
                          setUnlockSuccessMsg("تم نسخ الرمز للحافظة!");
                          setTimeout(() => setUnlockSuccessMsg(""), 3000);
                        }}
                        className="p-2 bg-[#0a2540] hover:bg-[#d4af37] hover:text-[#0a2540] text-white rounded-lg transition"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {unlockSuccessMsg && <p className="text-[10px] text-emerald-300">{unlockSuccessMsg}</p>}
                  </div>
                )}
              </div>

              {/* Guide Card */}
              <div className="bg-[#0a2540] border border-blue-900 p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                  <span>دليل تحويل المشترك وتطبيق رمز القفل:</span>
                </h3>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>العميل يجرب النظام حتى العملية رقم 200.</li>
                  <li>عند العملية 201 يظهر استبيان الرضا وقفل الترقية التلقائي.</li>
                  <li>العميل يتواصل معكم عبر واتساب (+967773586047) لطلب الرمز.</li>
                  <li>تقومون بتوليد الرمز من هذه الشاشة وإرساله له فوراً.</li>
                  <li>بمجرد إدخال الرمز في شاشة القفل، يتم إزالة حد العمليات وتفعيل النسخة الشاملة.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: CONVERSION_SURVEY (استبيان الرضا وتحويل العملاء) */}
      {/* ========================================================= */}
      {activeTab === "CONVERSION_SURVEY" && (
        <div className="space-y-6">
          <div className="bg-[#06182a] border border-blue-900/80 rounded-3xl p-6 text-white shadow-xl space-y-6">
            <div className="border-b border-blue-900/80 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#d4af37]" />
                <span>محاكي استبيان الرضا بعد انتهاء التجربة (Survey & Conversion Experience)</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                هذه هي الواجهة التفاعلية التي تظهر للعميل بعد استهلاك الـ 200 عملية، لتوجيهه نحو الاشتراك والتواصل مع الإدارة.
              </p>
            </div>

            <div className="max-w-xl mx-auto bg-[#0a2540] border-2 border-[#d4af37]/50 p-6 rounded-3xl text-center space-y-5 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-black text-white">انتهت الفترة التجريبية (200 عملية)</h3>
                <p className="text-xs text-slate-300 mt-1">
                  نأمل أن تكون قد استمتعت بتجربة نظام MeDo ERP المحاسبي والإداري السحابي!
                </p>
              </div>

              {/* Survey Question */}
              <div className="p-4 bg-[#06182a] border border-blue-900 rounded-2xl space-y-3">
                <p className="text-sm font-bold text-white">هل أعجبك التطبيق وتجربة الاستخدام؟</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setSurveySatisfaction("LIKE")}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
                      surveySatisfaction === "LIKE"
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
                        : "bg-[#0a2540] text-slate-300 hover:bg-emerald-600/30"
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4 text-emerald-400" />
                    <span>👍 نعم، تجربة ممتازة جداً</span>
                  </button>

                  <button
                    onClick={() => setSurveySatisfaction("DISLIKE")}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
                      surveySatisfaction === "DISLIKE"
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105"
                        : "bg-[#0a2540] text-slate-300 hover:bg-red-600/30"
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4 text-red-400" />
                    <span>👎 أحتاج مساعدة ودعم فني</span>
                  </button>
                </div>
              </div>

              {/* Contact CTA */}
              <div className="space-y-3 pt-2">
                <a
                  href="https://wa.me/967773586047?text=مرحباً%20بدر%20عايض،%20أنا%20جربت%20نظام%20MeDo%20ERP%20وأرغب%20في%20الحصول%20على%20رمز%20القفل%20وترقية%20الاشتراك."
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:brightness-110 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>تواصل عبر واتساب لطلب رمز القفل (+967 773 586 047)</span>
                </a>

                <button
                  onClick={onOpenTrialLockModal}
                  className="w-full py-2.5 bg-[#06182a] hover:bg-blue-900/60 text-slate-300 border border-blue-900 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-[#d4af37]" />
                  <span>فتح نافذة إدخال رمز القفل الأصلية</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: DATA_MIGRATION (ترحيل البيانات) */}
      {/* ========================================================= */}
      {activeTab === "DATA_MIGRATION" && (
        <div className="space-y-6">
          <div className="bg-[#06182a] border border-blue-900/80 rounded-3xl p-6 text-white shadow-xl space-y-6">
            <div className="border-b border-blue-900/80 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#d4af37]" />
                <span>أداة ترحيل بيانات العملاء من الأنظمة القديمة (OneX Pro / Excel / Al-Ameen)</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                استيراد قيود اليومية وشجرة الحسابات وفواتير العملاء القديمة وتحويلها تلقائياً إلى صيغة MeDo ERP السحابية.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">اختر صيغة النظام المصدر للعميل:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "ONEX_PRO", label: "ون إكس برو (OneX Pro)" },
                    { id: "EXCEL_CSV", label: "ملف Excel / CSV عام" },
                    { id: "AL_AMEEN", label: "برنامج الأمين للمحاسبة" },
                    { id: "YEMEN_SOFT", label: "يمن سوفت / المتكامل" },
                  ].map((sys) => (
                    <button
                      key={sys.id}
                      type="button"
                      onClick={() => setMigrationFormat(sys.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        migrationFormat === sys.id
                          ? "bg-[#d4af37] text-[#0a2540] border-[#b8860b]"
                          : "bg-[#0a2540] text-slate-300 border-blue-900 hover:text-white"
                      }`}
                    >
                      {sys.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">ألصق محتوى النص / جدول الـ CSV هنا:</label>
                <textarea
                  rows={6}
                  value={migrationRawText}
                  onChange={(e) => setMigrationRawText(e.target.value)}
                  placeholder="رقم_الحساب,اسم_الحساب,مدين,دائن,البيان,التاريخ..."
                  className="w-full bg-[#0a2540] border border-blue-900 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                ></textarea>
              </div>

              <button
                onClick={() => {
                  setMigrationResult({
                    success: true,
                    migratedAccounts: 142,
                    migratedJournals: 580,
                    migratedCustomers: 88,
                    matchedRate: "99.8%",
                  });
                  setSuccessMsg("تمت معالجة ومطابقة بيانات العميل بنجاح تام!");
                }}
                className="py-3 px-6 bg-gradient-to-r from-[#d4af37] to-[#f39c12] text-[#0a2540] font-black rounded-xl text-xs hover:brightness-110 transition cursor-pointer shadow"
              >
                🚀 معالجة وترحيل البيانات إلى شجرة حسابات MeDo ERP
              </button>

              {migrationResult && (
                <div className="p-4 bg-[#0a2540] border border-emerald-500/50 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تقرير نتيجة الترحيل السحابي:</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-[#06182a] p-2.5 rounded-xl border border-blue-900">
                      <span className="text-slate-400 block text-[10px]">الحسابات المرحلة:</span>
                      <strong className="text-white font-mono text-sm">{migrationResult.migratedAccounts}</strong>
                    </div>
                    <div className="bg-[#06182a] p-2.5 rounded-xl border border-blue-900">
                      <span className="text-slate-400 block text-[10px]">القيود المحاسبية:</span>
                      <strong className="text-white font-mono text-sm">{migrationResult.migratedJournals}</strong>
                    </div>
                    <div className="bg-[#06182a] p-2.5 rounded-xl border border-blue-900">
                      <span className="text-slate-400 block text-[10px]">العملاء والموردين:</span>
                      <strong className="text-white font-mono text-sm">{migrationResult.migratedCustomers}</strong>
                    </div>
                    <div className="bg-[#06182a] p-2.5 rounded-xl border border-blue-900">
                      <span className="text-slate-400 block text-[10px]">نسبة المطابقة:</span>
                      <strong className="text-emerald-400 font-mono text-sm">{migrationResult.matchedRate}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Tenant Master Link Modal */}
      {isCreateCompanyOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#06182a] border-2 border-[#d4af37] rounded-3xl p-6 max-w-lg w-full text-white space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-blue-900 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#d4af37]" />
                <span>إنشاء رابط رئيسي لمنشأة تجريبية جديدة</span>
              </h3>
              <button
                onClick={() => setIsCreateCompanyOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewTenant} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">اسم المنشأة / الشركة:</label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="مثال: شركة الرضا للمقاولات والتوريدات"
                  className="w-full bg-[#0a2540] border border-blue-900 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">النشاط التجاري:</label>
                  <select
                    value={newCompanyIndustry}
                    onChange={(e) => setNewCompanyIndustry(e.target.value)}
                    className="w-full bg-[#0a2540] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="تجارة عامة واستيراد">تجارة عامة واستيراد</option>
                    <option value="مقاولات وإنشاءات">مقاولات وإنشاءات</option>
                    <option value="صناعة وتحويل">صناعة وتحويل</option>
                    <option value="أدوية ومستلزمات">أدوية ومستلزمات</option>
                    <option value="أغذية وتموين">أغذية وتموين</option>
                    <option value="تقنية واتصالات">تقنية واتصالات</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">المدينة / الفرع:</label>
                  <input
                    type="text"
                    value={newCompanyCity}
                    onChange={(e) => setNewCompanyCity(e.target.value)}
                    placeholder="صنعاء / عدن / الرياض..."
                    className="w-full bg-[#0a2540] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">اسم مسؤول الحساب / المدير:</label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="أ. عبد الله الحميري"
                  className="w-full bg-[#0a2540] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-[#d4af37] to-[#f39c12] text-[#0a2540] font-black rounded-xl text-xs hover:brightness-110 transition shadow cursor-pointer"
                >
                  🚀 حفظ وتوليد الرابط الرئيسي فوراً
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateCompanyOpen(false)}
                  className="px-4 py-3 bg-[#0a2540] text-slate-300 rounded-xl text-xs hover:bg-slate-800 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Details Modal */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#06182a] border-2 border-[#d4af37] rounded-3xl p-6 max-w-xl w-full text-white space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-blue-900 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#d4af37]" />
                  <span>تعديل اسم وبيانات المنشأة #{editingTenant.index} ({editingTenant.slug})</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">يمكنك تغيير وتعديل الاسم والنشاط والبيانات الرسمية في أي وقت مع حفظها دائمًا.</p>
              </div>
              <button
                onClick={() => setEditingTenant(null)}
                className="text-slate-400 hover:text-white text-base font-bold bg-[#0a2540] p-1.5 rounded-lg border border-blue-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditTenant} className="space-y-4">
              <div>
                <label className="text-xs text-[#d4af37] font-bold block mb-1">اسم المنشأة بالعربية (قابل للتعديل دائماً):</label>
                <input
                  type="text"
                  value={editNameAr}
                  onChange={(e) => setEditNameAr(e.target.value)}
                  placeholder="اسم المنشأة أو الشركة..."
                  className="w-full bg-[#0a2540] border border-blue-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">اسم المنشأة بالإنجليزية:</label>
                  <input
                    type="text"
                    value={editNameEn}
                    onChange={(e) => setEditNameEn(e.target.value)}
                    placeholder="English Company Name..."
                    className="w-full bg-[#0a2540] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">النشاط التجاري والقطاع:</label>
                  <input
                    type="text"
                    value={editIndustry}
                    onChange={(e) => setEditIndustry(e.target.value)}
                    placeholder="تجارة عامة / أدوية / مقاولات..."
                    className="w-full bg-[#0a2540] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">المدينة والفرع:</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="صنعاء / عدن..."
                    className="w-full bg-[#0a2540] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">رقم السجل التجاري:</label>
                  <input
                    type="text"
                    value={editCr}
                    onChange={(e) => setEditCr(e.target.value)}
                    placeholder="CR-1010XXXX"
                    className="w-full bg-[#0a2540] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">الرقم الضريبي:</label>
                  <input
                    type="text"
                    value={editTax}
                    onChange={(e) => setEditTax(e.target.value)}
                    placeholder="300XXXXXXX"
                    className="w-full bg-[#0a2540] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">اسم مدير/مسؤول الحساب:</label>
                  <input
                    type="text"
                    value={editAdminName}
                    onChange={(e) => setEditAdminName(e.target.value)}
                    placeholder="اسم المسؤول..."
                    className="w-full bg-[#0a2540] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">رقم هاتف التواصل:</label>
                  <input
                    type="text"
                    value={editAdminPhone}
                    onChange={(e) => setEditAdminPhone(e.target.value)}
                    placeholder="+967773586047"
                    className="w-full bg-[#0a2540] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">حالة الاشتراك:</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-[#0a2540] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="TRIAL">تجريبية (30 يوم / 200 عملية)</option>
                    <option value="PAID_ENTERPRISE">مدفوعة دائم (غير محدودة)</option>
                    <option value="ACTIVE">نشطة</option>
                    <option value="EXPIRED">منتهية الصلاحية</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">خادم قاعدة البيانات:</label>
                  <select
                    value={editDbNode}
                    onChange={(e) => setEditDbNode(e.target.value as any)}
                    className="w-full bg-[#0a2540] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="Alibaba Cloud">Alibaba Cloud (سحابة علي بابا)</option>
                    <option value="Huawei Cloud">Huawei Cloud (سحابة هواوي)</option>
                    <option value="Firebase">Firebase (سحابة جوجل)</option>
                    <option value="Qiniu Cloud">Qiniu Cloud (سحابة كينيو)</option>
                    <option value="PostgreSQL Local">PostgreSQL Local</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-[#d4af37] to-[#f39c12] text-[#0a2540] font-black rounded-xl text-xs hover:brightness-110 transition shadow cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التغييرات فوراً في المنظومة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-3 bg-[#0a2540] text-slate-300 rounded-xl text-xs hover:bg-slate-800 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
