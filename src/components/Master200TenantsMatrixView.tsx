import React, { useState, useMemo, useEffect } from "react";
import {
  getStored200Tenants,
  updateStoredTenant,
  generateTenantUnlockCode,
  PreGeneratedTenant,
  TenantRoleCredentials,
  VERCEL_PRODUCTION_BASE,
} from "../data/preGeneratedTenants";
import {
  Building2,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ShieldCheck,
  Users,
  Key,
  Globe,
  Database,
  CheckCircle2,
  Sparkles,
  Layers,
  Phone,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  Lock,
  Unlock,
  Plus,
  Send,
  RefreshCw,
  Edit3,
  X,
  CreditCard,
  MessageSquare,
  FlaskConical,
} from "lucide-react";
import { soundService } from "../services/notificationSoundService";
import { SaaSRegistrationPortal } from "./SaaSRegistrationPortal";
import { SapUniversalSearchModal } from "./SapUniversalSearchModal";
import { MASTER_ADMIN_WHATSAPP, MASTER_ADMIN_PRIMARY_EMAIL } from "../services/notificationService";
import { generate10TestTenantsHelper } from "../services/tenantTestHelper";

interface Master200TenantsMatrixViewProps {
  onClose?: () => void;
}

export const Master200TenantsMatrixView: React.FC<Master200TenantsMatrixViewProps> = ({ onClose }) => {
  const [tenantsList, setTenantsList] = useState<PreGeneratedTenant[]>(() => getStored200Tenants());
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [cityFilter, setCityFilter] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTenantForDetails, setSelectedTenantForDetails] = useState<PreGeneratedTenant | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<PreGeneratedTenant | null>(null);
  const [generatedUnlockCode, setGeneratedUnlockCode] = useState<{ [tenantId: string]: string }>({});
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);
  const [isUniversalSearchOpen, setIsUniversalSearchOpen] = useState(false);
  const itemsPerPage = 20;

  // Refresh tenants from storage
  const refreshTenants = () => {
    setTenantsList(getStored200Tenants());
  };

  const handleGenerateTestBatch = async () => {
    try {
      setIsGeneratingBatch(true);
      setBatchSuccessMsg(null);
      soundService.playSound("ROYAL_BANK_CHIME");
      
      const created = await generate10TestTenantsHelper();
      refreshTenants();
      
      setBatchSuccessMsg(`✨ تم توليد ${created.length} منشآت تجريبية بنجاح وإرسال الإشعارات إلى ${MASTER_ADMIN_PRIMARY_EMAIL} وواتساب!`);
      setTimeout(() => setBatchSuccessMsg(null), 8000);
    } catch (e) {
      console.error("Failed to generate test tenants batch", e);
      soundService.playSound("ENCRYPTION_VIOLATION_ALARM");
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  useEffect(() => {
    refreshTenants();
    const handleTenantUpdate = () => {
      refreshTenants();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleTenantUpdate);
      window.addEventListener("tenant_registered", handleTenantUpdate);
      window.addEventListener("tenants_updated", handleTenantUpdate);
      window.addEventListener("sovereign_admin_refreshed", handleTenantUpdate);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleTenantUpdate);
        window.removeEventListener("tenant_registered", handleTenantUpdate);
        window.removeEventListener("tenants_updated", handleTenantUpdate);
        window.removeEventListener("sovereign_admin_refreshed", handleTenantUpdate);
      }
    };
  }, []);

  // Track IDs of dynamically registered tenants
  const registeredTenantsIds = useMemo(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("medo_registered_tenants_v1");
        if (raw) {
          const list: PreGeneratedTenant[] = JSON.parse(raw);
          return new Set(list.map((t) => t.id || t.slug));
        }
      }
    } catch (e) {}
    return new Set<string>();
  }, [tenantsList]);

  // Filtered tenants list
  const filteredTenants = useMemo(() => {
    return tenantsList.filter((tenant) => {
      const matchesSearch =
        searchQuery === "" ||
        tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.crNumber.includes(searchQuery) ||
        tenant.taxNumber.includes(searchQuery) ||
        tenant.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.assignedAdminEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.index.toString() === searchQuery.trim();

      const isSelfReg = registeredTenantsIds.has(tenant.id || tenant.slug) || (tenant.index && tenant.index > 200);
      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "SELF_REGISTERED"
          ? isSelfReg
          : tenant.status === statusFilter;

      const matchesCity = cityFilter === "ALL" || tenant.city === cityFilter;

      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [tenantsList, searchQuery, statusFilter, cityFilter, registeredTenantsIds]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = tenantsList.length;
    const active = tenantsList.filter((t) => t.status === "ACTIVE").length;
    const trial = tenantsList.filter((t) => t.status === "TRIAL").length;
    const enterprise = tenantsList.filter((t) => t.status === "PAID_ENTERPRISE").length;
    const selfRegistered = tenantsList.filter(
      (t) => registeredTenantsIds.has(t.id || t.slug) || (t.index && t.index > 200)
    ).length;
    return { total, active, trial, enterprise, selfRegistered };
  }, [tenantsList, registeredTenantsIds]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage) || 1;
  const displayedTenants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTenants.slice(start, start + itemsPerPage);
  }, [filteredTenants, currentPage]);

  const uniqueCities = useMemo(() => {
    const set = new Set(tenantsList.map((t) => t.city));
    return Array.from(set);
  }, [tenantsList]);

  // Copy helper
  const handleCopyCredentials = (
    tenant: PreGeneratedTenant,
    roleKey: keyof PreGeneratedTenant["roles"]
  ) => {
    const cred = tenant.roles[roleKey];
    const text = `🏢 *${tenant.name}* (${tenant.slug})
👤 *الدور:* ${cred.roleNameAr}
🔑 *رمز المصادقة (Token):* ${cred.token}
📧 *البريد الإلكتروني:* ${cred.email}
🔒 *كلمة المرور:* ${cred.password}
🌐 *رابط الدخول المباشر المخصص:*
${cred.subLink}`;

    navigator.clipboard.writeText(text);
    const idKey = `${tenant.slug}-${roleKey}`;
    setCopiedId(idKey);
    soundService.playSound("ROYAL_BANK_CHIME");
    setTimeout(() => setCopiedId(null), 3000);
  };

  // WhatsApp helper
  const handleShareWhatsApp = (
    tenant: PreGeneratedTenant,
    roleKey: keyof PreGeneratedTenant["roles"]
  ) => {
    const cred = tenant.roles[roleKey];
    const message = `✨ *نظام MeDo ERP السحابي المتقدم - بيانات الدخول الحصري* ✨
-----------------------------------------
🏢 *المنشأة:* ${tenant.name}
📍 *المدينة:* ${tenant.city} | *س.ت:* ${tenant.crNumber}
👤 *الدور الوظيفي:* ${cred.roleNameAr}
🔑 *رمز التوثيق (Token):* \`${cred.token}\`
📧 *البريد:* \`${cred.email}\`
🔒 *كلمة المرور:* \`${cred.password}\`
-----------------------------------------
🌐 *رابط الدخول المباشر المعزول:*
${cred.subLink}
-----------------------------------------
💡 *ملاحظة أمنية:* تم تفعيل جدار عزل الصلاحيات (RBAC) التلقائي لهذه الجلسة.`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Generate / reveal unlock code for tenant
  const handleGenerateUnlockCode = (tenant: PreGeneratedTenant) => {
    const code = tenant.unlockCode || generateTenantUnlockCode(tenant.id || tenant.slug);
    setGeneratedUnlockCode((prev) => ({ ...prev, [tenant.id]: code }));
    soundService.playSound("ROYAL_BANK_CHIME");
  };

  // Update tenant status
  const handleUpdateStatus = (tenant: PreGeneratedTenant, newStatus: PreGeneratedTenant["status"]) => {
    const updated = { ...tenant, status: newStatus };
    updateStoredTenant(tenant.id || tenant.slug, updated);
    refreshTenants();
    if (selectedTenantForDetails?.id === tenant.id) {
      setSelectedTenantForDetails(updated);
    }
    soundService.playSound("SUCCESS_CHIME");
  };

  // Export 1000-Link CSV/Excel
  const handleExportFullMatrixCSV = () => {
    soundService.playSound("ROYAL_BANK_CHIME");
    const headers = [
      "رقم الشركة",
      "معرف المنشأة (Slug)",
      "اسم المنشأة بالعربية",
      "اسم المنشأة بالإنجليزية",
      "السجل التجاري",
      "الرقم الضريبي",
      "المدينة",
      "العنوان التفصيلي",
      "النشاط التجاري",
      "الهاتف",
      "حالة الاشتراك",
      "عقدة قاعدة البيانات",
      "رمز فك القفل (Unlock Code)",
      "الدور الوظيفي (Role)",
      "المسمى العربي",
      "رمز التوثيق (Token)",
      "البريد الإلكتروني",
      "كلمة المرور",
      "المسار الافتراضي",
      "الرابط السحابي المباشر",
    ];

    const rows: string[][] = [];

    tenantsList.forEach((tenant) => {
      const roleKeys: (keyof PreGeneratedTenant["roles"])[] = [
        "MANAGER",
        "ACCOUNTANT",
        "CASHIER",
        "PURCHASER",
        "AUDITOR",
      ];

      roleKeys.forEach((roleKey) => {
        const cred = tenant.roles[roleKey];
        if (!cred) return;
        rows.push([
          tenant.index.toString(),
          tenant.slug,
          `"${tenant.name.replace(/"/g, '""')}"`,
          `"${(tenant.nameEn || "").replace(/"/g, '""')}"`,
          tenant.crNumber,
          tenant.taxNumber,
          `"${tenant.city}"`,
          `"${(tenant.address || "").replace(/"/g, '""')}"`,
          `"${(tenant.industry || "").replace(/"/g, '""')}"`,
          tenant.phone,
          tenant.status,
          tenant.databaseNode,
          tenant.unlockCode || generateTenantUnlockCode(tenant.id),
          roleKey,
          `"${cred.roleNameAr}"`,
          cred.token,
          cred.email,
          cred.password,
          cred.path,
          `"${cred.subLink}"`,
        ]);
      });
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `MeDo_ERP_Tenants_Matrix_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "MANAGER":
        return "bg-purple-950/60 text-purple-300 border-purple-800";
      case "ACCOUNTANT":
        return "bg-blue-950/60 text-blue-300 border-blue-800";
      case "CASHIER":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-800";
      case "PURCHASER":
        return "bg-amber-950/60 text-amber-300 border-amber-800";
      case "AUDITOR":
        return "bg-rose-950/60 text-rose-300 border-rose-800";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-16" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider bg-indigo-900/60 px-2.5 py-0.5 rounded-full border border-indigo-700/50">
                    MeDo Multi-Tenant Sovereign Mesh
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Database Connected
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                  مصفوفة المنشآت السحابية المركزية (إدارة الـ 200+ منشأة)
                </h1>
              </div>
            </div>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              البوابة السيادية لإدارة المنشآت السحابية المسبقة والمسجلة ذاتياً. توفير روابط الوصول المعزولة (RBAC)، فك القفل التلقائي، وإشعارات التسجيل الفورية للبريد (<span className="text-blue-300 font-mono">{MASTER_ADMIN_PRIMARY_EMAIL}</span>) وواتساب (<span className="text-emerald-300 font-mono">{MASTER_ADMIN_WHATSAPP}</span>).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsUniversalSearchOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-950/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-amber-300"
              title="فتح محرك البحث الشامل عن جميع المنشآت والشركات والموظفين والأسماء والمسؤولين"
            >
              <Search className="w-5 h-5 text-slate-950" />
              <span>🔍 محرك البحث الشامل (200+ منشأة ومستخدم)</span>
            </button>

            <button
              onClick={handleGenerateTestBatch}
              disabled={isGeneratingBatch}
              className="px-5 py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-black rounded-2xl shadow-lg shadow-amber-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
              title="دالة اختبار: إنشاء 10 منشآت تجريبية تلقائياً وإرسال الإشعارات وعرضها في الجدول"
            >
              <FlaskConical className={`w-5 h-5 text-amber-200 ${isGeneratingBatch ? "animate-spin" : "animate-bounce"}`} />
              <span>{isGeneratingBatch ? "جاري الإنشاء الفوري..." : "🧪 إنشاء 10 منشآت تجريبية (Test Helper)"}</span>
            </button>

            <button
              onClick={() => setShowAddTenantModal(true)}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-black rounded-2xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>+ إضافة منشأة جديدة</span>
            </button>

            <button
              onClick={handleExportFullMatrixCSV}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>تصدير المصفوفة (CSV / Excel)</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl text-sm font-bold border border-slate-700 transition-all cursor-pointer"
              >
                إغلاق
              </button>
            )}
          </div>
        </div>

        {/* Batch Success Message Alert */}
        {batchSuccessMsg && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-900/90 to-slate-900 border border-emerald-500/60 text-emerald-200 text-sm font-bold flex items-center justify-between shadow-xl animate-fadeIn">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
              <span>{batchSuccessMsg}</span>
            </div>
            <button
              onClick={() => setBatchSuccessMsg(null)}
              className="text-xs bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 px-3 py-1 rounded-xl border border-emerald-700/50"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* 5 Live Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-white">{stats.total}</div>
              <div className="text-[11px] text-slate-400">إجمالي المنشآت</div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-emerald-500/40 rounded-2xl p-4 flex items-center gap-3 shadow-inner bg-gradient-to-br from-slate-950/90 to-emerald-950/30">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-xl font-black text-emerald-300">{stats.selfRegistered}</div>
              <div className="text-[11px] text-emerald-400/90 font-bold">مسجلة ذاتياً حديثاً ⚡</div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-emerald-400">{stats.active}</div>
              <div className="text-[11px] text-slate-400">منشآت نشطة (Active)</div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-amber-400">{stats.trial}</div>
              <div className="text-[11px] text-slate-400">نسخ تجريبية (Trial)</div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-purple-400">{stats.enterprise}</div>
              <div className="text-[11px] text-slate-400">منشآت مدفوعة (Enterprise)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="البحث بالاسم (عربي/إنجليزي)، السجل التجاري، الرقم الضريبي، المدينة، النشاط، أو الرقم (#)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-12 pl-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                مسح
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-slate-400 font-bold shrink-0">الحالة:</span>
            {[
              { key: "ALL", label: "الكل" },
              { key: "SELF_REGISTERED", label: `⚡ مسجلة ذاتياً (${stats.selfRegistered})` },
              { key: "ACTIVE", label: "نشط" },
              { key: "TRIAL", label: "تجريبي" },
              { key: "ENTERPRISE", label: "مؤسسي" },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => {
                  setStatusFilter(st.key);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  statusFilter === st.key
                    ? st.key === "SELF_REGISTERED"
                      ? "bg-gradient-to-r from-amber-500 to-emerald-600 text-slate-950 font-black shadow-md shadow-amber-500/30"
                      : "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 shrink-0"
          >
            <option value="ALL">جميع المدن ({uniqueCities.length})</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tenants Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {displayedTenants.length === 0 ? (
          <div className="col-span-full bg-slate-900 rounded-3xl p-12 text-center border border-slate-800 space-y-4">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">لا توجد منشآت مطابقة للبحث</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              جرب تغيير معايير البحث أو اختيار مدينة / حالة اشتراك مختلفة.
            </p>
          </div>
        ) : (
          displayedTenants.map((tenant) => {
            const isSelfRegistered =
              registeredTenantsIds.has(tenant.id || tenant.slug) || (tenant.index && tenant.index > 200);

            return (
            <div
              key={tenant.id || tenant.slug}
              className={`bg-slate-900 border ${
                isSelfRegistered
                  ? "border-amber-500/60 shadow-amber-500/10 shadow-2xl bg-gradient-to-br from-slate-900 via-[#0a1829] to-slate-900"
                  : "border-slate-800 hover:border-indigo-500/60"
              } rounded-3xl p-5 sm:p-6 shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${
                      isSelfRegistered
                        ? "bg-gradient-to-br from-amber-500 to-emerald-600 text-slate-950 font-black"
                        : "bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-black"
                    } flex items-center justify-center text-sm shadow-md shrink-0`}>
                      #{tenant.index}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors">
                          {tenant.name}
                        </h3>
                        {isSelfRegistered && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                            ⚡ مسجلة ذاتياً حديثاً
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            tenant.status === "ACTIVE"
                              ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                              : tenant.status === "PAID_ENTERPRISE"
                              ? "bg-purple-950/60 text-purple-300 border-purple-800"
                              : "bg-amber-950/60 text-amber-300 border-amber-800"
                          }`}
                        >
                          {tenant.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {tenant.nameEn} • {tenant.city} {tenant.assignedAdminEmail && `• ${tenant.assignedAdminEmail}`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTenantForDetails(tenant)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 shrink-0 cursor-pointer"
                    title="معاينة التفاصيل وإدارة الروابط"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Info Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-[11px] mb-4">
                  <div>
                    <span className="text-slate-500 block">السجل التجاري:</span>
                    <span className="font-mono font-bold text-slate-200">{tenant.crNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">الرقم الضريبي:</span>
                    <span className="font-mono font-bold text-slate-200">{tenant.taxNumber}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-500 block">الهاتف:</span>
                    <span className="font-mono font-bold text-slate-200" dir="ltr">{tenant.phone}</span>
                  </div>
                </div>

                {/* 5 Sub-Role Quick Action Badges */}
                <div className="space-y-1.5 mb-4">
                  {(Object.keys(tenant.roles || {}) as (keyof PreGeneratedTenant["roles"])[]).map((roleKey) => {
                    const cred = tenant.roles[roleKey];
                    if (!cred) return null;
                    const isCopied = copiedId === `${tenant.slug}-${roleKey}`;

                    return (
                      <div
                        key={roleKey}
                        className="p-2 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeColor(roleKey)}`}>
                            {roleKey}
                          </span>
                          <span className="text-slate-300 font-medium truncate">{cred.roleNameAr}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleCopyCredentials(tenant, roleKey)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                            title="نسخ بيانات الدخول"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleShareWhatsApp(tenant, roleKey)}
                            className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/60 transition-all"
                            title="مشاركة عبر واتساب"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={cred.subLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-400 border border-indigo-800/60 transition-all"
                            title="فتح الرابط المباشر"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Card Bar: Master Domain + Unlock Code */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <a
                  href={tenant.masterDomain}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  الرابط الرئيسي (Master)
                </a>

                <button
                  onClick={() => setSelectedTenantForDetails(tenant)}
                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                >
                  <Key className="w-3.5 h-3.5" />
                  رمز فك القفل والإدارة
                </button>
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">
            عرض الصفحة {currentPage} من أصل {totalPages} (إجمالي {filteredTenants.length} منشأة)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              السابق
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    currentPage === pageNum
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && <span className="text-xs text-slate-500">... {totalPages}</span>}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {/* Selected Tenant Sovereign Management & Unlock Code Modal */}
      {selectedTenantForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scaleUp max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/30">
                  #{selectedTenantForDetails.index}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white">
                      {selectedTenantForDetails.name}
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {selectedTenantForDetails.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedTenantForDetails.nameEn} • {selectedTenantForDetails.city} - {selectedTenantForDetails.industry}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTenantForDetails(null)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-all border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Unlock Code Section */}
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-950 to-indigo-950/40 border border-amber-500/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-black text-amber-300">
                  <Key className="w-5 h-5 text-amber-400" />
                  رمز فك القفل السيادي (Bypass 200 Ops Lock Code)
                </div>
                <button
                  onClick={() => handleGenerateUnlockCode(selectedTenantForDetails)}
                  className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black transition-all flex items-center gap-1 shadow-md shadow-amber-600/20"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  توليد / استرجاع الرمز
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-950 rounded-xl p-3 border border-slate-800">
                <span className="text-xs text-slate-400">الرمز المعتمد للمنشأة:</span>
                <span className="font-mono text-base font-black text-amber-400 tracking-widest">
                  {generatedUnlockCode[selectedTenantForDetails.id] ||
                    selectedTenantForDetails.unlockCode ||
                    generateTenantUnlockCode(selectedTenantForDetails.id)}
                </span>
                <button
                  onClick={() => {
                    const code =
                      generatedUnlockCode[selectedTenantForDetails.id] ||
                      selectedTenantForDetails.unlockCode ||
                      generateTenantUnlockCode(selectedTenantForDetails.id);
                    navigator.clipboard.writeText(code);
                    soundService.playSound("ROYAL_BANK_CHIME");
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  نسخ الرمز
                </button>
              </div>
            </div>

            {/* Plan / Status Upgrade Control */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300">تغيير حالة الاشتراك / ترقية المنشأة:</h4>
              <div className="flex flex-wrap items-center gap-2">
                {(["ACTIVE", "TRIAL", "PAID_ENTERPRISE", "EXPIRED"] as PreGeneratedTenant["status"][]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedTenantForDetails, st)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      selectedTenantForDetails.status === st
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {st === "ACTIVE" ? "✓ نشط (Active)" : st === "TRIAL" ? "⏳ تجريبي (Trial)" : st === "PAID_ENTERPRISE" ? "👑 مؤسسي (Paid Enterprise)" : "⛔ منتهي/موقوف (Expired)"}
                  </button>
                ))}
              </div>
            </div>

            {/* 5 Sub-links Table */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-white">روابط الأدوار الخمسة المباشرة:</h4>
              {(Object.keys(selectedTenantForDetails.roles || {}) as (keyof PreGeneratedTenant["roles"])[]).map((roleKey) => {
                const cred = selectedTenantForDetails.roles[roleKey];
                if (!cred) return null;
                return (
                  <div
                    key={roleKey}
                    className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRoleBadgeColor(roleKey)}`}>
                        {roleKey}
                      </span>
                      <p className="font-bold text-white mt-1">{cred.roleNameAr}</p>
                      <p className="text-[11px] font-mono text-slate-400">
                        {cred.email} | Token: {cred.token}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyCredentials(selectedTenantForDetails, roleKey)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold border border-slate-700 cursor-pointer flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ</span>
                      </button>
                      <a
                        href={cred.subLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>فتح</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => {
                  const message = `🏢 *روابط الوصول لمنشأة: ${selectedTenantForDetails.name}*
الرابط الرئيسي: ${selectedTenantForDetails.masterDomain}
رمز فك القفل: ${selectedTenantForDetails.unlockCode || generateTenantUnlockCode(selectedTenantForDetails.id)}
-----------------------------
1. المدير (MANAGER): ${selectedTenantForDetails.roles?.MANAGER?.subLink}
2. المحاسب (ACCOUNTANT): ${selectedTenantForDetails.roles?.ACCOUNTANT?.subLink}
3. الكاشير (CASHIER): ${selectedTenantForDetails.roles?.CASHIER?.subLink}
4. المشتريات (PURCHASER): ${selectedTenantForDetails.roles?.PURCHASER?.subLink}
5. المراجع (AUDITOR): ${selectedTenantForDetails.roles?.AUDITOR?.subLink}`;
                  window.open(`https://wa.me/967773586047?text=${encodeURIComponent(message)}`, "_blank");
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <MessageSquare className="w-4 h-4" />
                إرسال الروابط كاملة إلى واتساب المدير (+0967773586047)
              </button>

              <button
                onClick={() => setSelectedTenantForDetails(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Tenant Modal */}
      {showAddTenantModal && (
        <SaaSRegistrationPortal
          onCancel={() => setShowAddTenantModal(false)}
          onRegistrationSuccess={(newTenant) => {
            refreshTenants();
            setShowAddTenantModal(false);
            setSelectedTenantForDetails(newTenant);
          }}
        />
      )}

      {/* Universal Search Modal */}
      <SapUniversalSearchModal
        isOpen={isUniversalSearchOpen}
        onClose={() => setIsUniversalSearchOpen(false)}
        onSelectCompany={(companyId) => {
          setIsUniversalSearchOpen(false);
          const t = tenantsList.find((item) => item.id === companyId || item.id === `tenant-${companyId}`);
          if (t) setSelectedTenantForDetails(t);
        }}
        onSelectTenantManagerLogin={(t) => {
          setIsUniversalSearchOpen(false);
          setSelectedTenantForDetails(t);
        }}
      />
    </div>
  );
};
