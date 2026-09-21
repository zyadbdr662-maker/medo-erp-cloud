import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Building2,
  User,
  Users,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  X,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  KeyRound,
  Zap,
  Filter,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import {
  PreGeneratedTenant,
  getStored200Tenants,
  VERCEL_PRODUCTION_BASE,
} from "../data/preGeneratedTenants";
import {
  SAP_ENTERPRISE_ROLES,
  SapEnterpriseRole,
  SAP_CLIENTS,
  SapClientOption,
} from "./SapEnterpriseLoginPortal";
import { soundService } from "../services/notificationSoundService";

export interface SearchResultItem {
  id: string;
  type: "COMPANY" | "USER";
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  badgeColor?: string;
  details: {
    email?: string;
    phone?: string;
    city?: string;
    industry?: string;
    crNumber?: string;
    taxNumber?: string;
    roleKey?: string;
    subLink?: string;
    tenantId?: string;
    databaseNode?: string;
  };
  rawTenant?: PreGeneratedTenant;
  rawRole?: SapEnterpriseRole;
  rawClient?: SapClientOption;
}

interface SapUniversalSearchModalProps {
  isOpen?: boolean;
  isEmbedded?: boolean;
  onClose?: () => void;
  onSelectCompany?: (companyId: string, companyName: string) => void;
  onSelectUserDirectLogin?: (roleItem: SapEnterpriseRole) => void;
  onSelectTenantManagerLogin?: (tenant: PreGeneratedTenant) => void;
  onFillEmail?: (email: string) => void;
}

export const SapUniversalSearchModal: React.FC<SapUniversalSearchModalProps> = ({
  isOpen = true,
  isEmbedded = false,
  onClose = () => {},
  onSelectCompany = () => {},
  onSelectUserDirectLogin = () => {},
  onSelectTenantManagerLogin,
  onFillEmail = () => {},
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "COMPANIES" | "USERS">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [storedTenants, setStoredTenants] = useState<PreGeneratedTenant[]>([]);

  useEffect(() => {
    if (isOpen || isEmbedded) {
      setStoredTenants(getStored200Tenants());
      soundService.playSound("ENTERPRISE_BELL");
    }
  }, [isOpen, isEmbedded]);

  // Build searchable index of all companies & users
  const allSearchableItems: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = [];

    // 1. Primary SAP Enterprise Clients
    SAP_CLIENTS.forEach((c) => {
      items.push({
        id: `client-${c.id}`,
        type: "COMPANY",
        title: c.nameAr,
        subtitle: `${c.nameEn} • ${c.code}`,
        category: "عميل مؤسسي رئيسي (SAP Client)",
        badge: c.badge,
        badgeColor: "bg-blue-900/60 text-blue-300 border-blue-700",
        details: {
          industry: "مجموعة تجارية / تصنيع / تقنية",
          subLink: `${VERCEL_PRODUCTION_BASE}/?client=${c.id.toLowerCase()}`,
        },
        rawClient: c,
      });
    });

    // 2. 200+ Multi-Tenant Companies
    storedTenants.forEach((t) => {
      // Add the Company entity
      items.push({
        id: `tenant-${t.id}`,
        type: "COMPANY",
        title: t.name || t.companyNameAr,
        subtitle: `${t.nameEn || t.companyNameEn || ""} • ${t.city} • ${t.industry || ""}`,
        category: `منشأة سحابية (#${t.index})`,
        badge: t.status === "ACTIVE" ? "نشط" : t.status === "PAID_ENTERPRISE" ? "مؤسسي" : "تجريبي",
        badgeColor:
          t.status === "ACTIVE" || t.status === "PAID_ENTERPRISE"
            ? "bg-emerald-950/80 text-emerald-300 border-emerald-700"
            : "bg-amber-950/80 text-amber-300 border-amber-700",
        details: {
          city: t.city,
          industry: t.industry,
          crNumber: t.crNumber || t.commercialReg,
          taxNumber: t.taxNumber,
          phone: t.phone || t.assignedAdminPhone,
          email: t.assignedAdminEmail,
          subLink: t.masterDomain || `${VERCEL_PRODUCTION_BASE}/?tenant=${t.id}`,
          tenantId: t.id,
          databaseNode: t.databaseNode,
        },
        rawTenant: t,
      });

      // Add Company Manager / Employees as searchable users
      if (t.assignedAdminName) {
        items.push({
          id: `tenant-mgr-${t.id}`,
          type: "USER",
          title: t.assignedAdminName,
          subtitle: `المدير العام لـ ${t.name} • ${t.city}`,
          category: "إدارة المنشأة",
          badge: "مدير منشأة",
          badgeColor: "bg-purple-950/80 text-purple-300 border-purple-700",
          details: {
            email: t.assignedAdminEmail || t.roles?.MANAGER?.email,
            phone: t.assignedAdminPhone || t.phone,
            roleKey: "MANAGER",
            tenantId: t.id,
            subLink: t.roles?.MANAGER?.subLink || `${VERCEL_PRODUCTION_BASE}/?tenant=${t.id}&role=MANAGER&token=AUTH_MGR_${t.id}&path=/employee/manager`,
          },
          rawTenant: t,
        });
      }

      // Add other roles from tenant.roles if present
      if (t.roles) {
        if (t.roles.ACCOUNTANT) {
          items.push({
            id: `tenant-acc-${t.id}`,
            type: "USER",
            title: `كبير المحاسبين - ${t.name}`,
            subtitle: `${t.roles.ACCOUNTANT.email} • ${t.city}`,
            category: "قسم الحسابات",
            badge: "محاسب",
            badgeColor: "bg-blue-950/80 text-blue-300 border-blue-700",
            details: {
              email: t.roles.ACCOUNTANT.email,
              roleKey: "ACCOUNTANT",
              tenantId: t.id,
              subLink: t.roles.ACCOUNTANT.subLink,
            },
            rawTenant: t,
          });
        }
        if (t.roles.CASHIER) {
          items.push({
            id: `tenant-cashier-${t.id}`,
            type: "USER",
            title: `مسؤول المبيعات ونقاط البيع - ${t.name}`,
            subtitle: `${t.roles.CASHIER.email} • ${t.city}`,
            category: "المبيعات والكاشير",
            badge: "كاشير",
            badgeColor: "bg-emerald-950/80 text-emerald-300 border-emerald-700",
            details: {
              email: t.roles.CASHIER.email,
              roleKey: "CASHIER",
              tenantId: t.id,
              subLink: t.roles.CASHIER.subLink,
            },
            rawTenant: t,
          });
        }
      }
    });

    // 3. Primary SAP Enterprise Roles & System Administrators
    SAP_ENTERPRISE_ROLES.forEach((r) => {
      items.push({
        id: `role-${r.id}`,
        type: "USER",
        title: r.name,
        subtitle: `${r.roleTitleAr} • ${r.branch} • ${r.email}`,
        category: "قيادات وموظفي النظام الأساسي",
        badge: r.role,
        badgeColor: "bg-amber-950/80 text-amber-300 border-amber-700",
        details: {
          email: r.email,
          roleKey: r.role,
          subLink: `${VERCEL_PRODUCTION_BASE}/?role=${r.role}`,
        },
        rawRole: r,
      });
    });

    return items;
  }, [storedTenants]);

  // Filtered results based on query & active tab
  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allSearchableItems.filter((item) => {
      // Type filtering
      if (activeFilter === "COMPANIES" && item.type !== "COMPANY") return false;
      if (activeFilter === "USERS" && item.type !== "USER") return false;

      // Query matching
      if (!q) return true;

      const titleMatch = item.title.toLowerCase().includes(q);
      const subMatch = item.subtitle.toLowerCase().includes(q);
      const catMatch = item.category.toLowerCase().includes(q);
      const emailMatch = item.details.email ? item.details.email.toLowerCase().includes(q) : false;
      const phoneMatch = item.details.phone ? item.details.phone.toLowerCase().includes(q) : false;
      const cityMatch = item.details.city ? item.details.city.toLowerCase().includes(q) : false;
      const indMatch = item.details.industry ? item.details.industry.toLowerCase().includes(q) : false;
      const crMatch = item.details.crNumber ? item.details.crNumber.includes(q) : false;
      const tenantIdMatch = item.details.tenantId ? item.details.tenantId.toLowerCase().includes(q) : false;

      return (
        titleMatch ||
        subMatch ||
        catMatch ||
        emailMatch ||
        phoneMatch ||
        cityMatch ||
        indMatch ||
        crMatch ||
        tenantIdMatch
      );
    });
  }, [allSearchableItems, searchQuery, activeFilter]);

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundService.playSound("ROYAL_BANK_CHIME");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen && !isEmbedded) return null;

  const contentJSX = (
    <div className={`w-full ${isEmbedded ? "max-w-7xl mx-auto" : "max-w-4xl my-auto max-h-[90vh]"} bg-gradient-to-b from-[#0a1828] to-[#040912] border border-[#d4af37]/50 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.8),_0_0_30px_rgba(212,175,55,0.2)] overflow-hidden flex flex-col`}>
      {/* MODAL HEADER WITH SEARCH BAR */}
      <div className="p-4 sm:p-6 border-b border-slate-700/60 bg-[#06121f]/90 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>محرك البحث الشامل عن المنشآت والأسماء</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  200+ منشأة ومستخدم
                </span>
              </h3>
              <p className="text-xs text-slate-300 font-normal">
                ابحث عن أي شركة، منشأة تجارية، مدير، محاسب، موظف مبيعات، أو رقم هاتف وسجل تجاري
              </p>
            </div>
          </div>

          {!isEmbedded && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

          {/* MAIN SEARCH INPUT FIELD */}
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="اكتب اسم الشركة، اسم الشخص (مثال: بدر، عمر، الأمل، البدر، مستشفى...)، البريد، أو الهاتف..."
              className="w-full bg-[#030a12] border-2 border-[#d4af37]/60 focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/20 rounded-2xl pl-12 pr-12 py-3.5 text-sm sm:text-base text-white placeholder-slate-500 shadow-inner transition outline-none font-sans"
            />
            <Search className="w-5 h-5 text-[#d4af37] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 cursor-pointer"
              >
                مسح
              </button>
            )}
          </div>

          {/* FILTER TABS */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5 p-1 bg-[#030910] border border-slate-800 rounded-xl">
              <button
                onClick={() => setActiveFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === "ALL"
                    ? "bg-[#d4af37] text-[#0a2540] shadow-sm font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>الكل ({allSearchableItems.length})</span>
              </button>
              <button
                onClick={() => setActiveFilter("COMPANIES")}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === "COMPANIES"
                    ? "bg-[#d4af37] text-[#0a2540] shadow-sm font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>الشركات والمنشآت</span>
              </button>
              <button
                onClick={() => setActiveFilter("USERS")}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === "USERS"
                    ? "bg-[#d4af37] text-[#0a2540] shadow-sm font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>الأسماء والموظفين</span>
              </button>
            </div>

            <div className="text-slate-400 text-xs font-mono">
              نتائج البحث: <span className="text-amber-300 font-bold">{filteredResults.length}</span> نتيجة
            </div>
          </div>
        </div>

        {/* SEARCH RESULTS LIST */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {filteredResults.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
                <Search className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">لم يتم العثور على نتائج مطابقة</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                جرب البحث بكلمات أخرى مثل "بدر"، "الأمل"، "صنعاء"، "محاسب"، أو رقم الهاتف
              </p>
            </div>
          ) : (
            filteredResults.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-gradient-to-r from-[#071320] to-[#040912] border border-slate-800 hover:border-[#d4af37]/60 transition-all duration-200 shadow-md group space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Entity Information */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                        item.type === "COMPANY"
                          ? "bg-blue-950/80 text-blue-300 border-blue-800"
                          : "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                      }`}
                    >
                      {item.type === "COMPANY" ? (
                        <Building2 className="w-5 h-5 text-[#d4af37]" />
                      ) : (
                        <User className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition">
                          {item.title}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {item.category}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-normal">{item.subtitle}</p>

                      {/* Detail Chips */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 pt-1">
                        {item.details.email && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Mail className="w-3 h-3 text-[#d4af37]" />
                            <span className="font-mono">{item.details.email}</span>
                          </span>
                        )}
                        {item.details.phone && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span className="font-mono" dir="ltr">{item.details.phone}</span>
                          </span>
                        )}
                        {item.details.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-400" />
                            <span>{item.details.city}</span>
                          </span>
                        )}
                        {item.details.crNumber && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-purple-400" />
                            <span>س.ت: {item.details.crNumber}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 self-end sm:self-center shrink-0">
                    {/* If it's a direct SAP Role -> Fast Login */}
                    {item.rawRole && (
                      <button
                        onClick={() => {
                          onSelectUserDirectLogin(item.rawRole!);
                          onClose();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-400 hover:to-amber-600 text-[#0a2540] font-black text-xs shadow-md flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>دخول فوري مباشر</span>
                      </button>
                    )}

                    {/* If it's a Company Tenant -> Select / Enter as Manager */}
                    {item.rawTenant && (
                      <button
                        onClick={() => {
                          if (onSelectTenantManagerLogin) {
                            onSelectTenantManagerLogin(item.rawTenant!);
                          } else {
                            onSelectCompany(item.rawTenant!.id, item.rawTenant!.name);
                          }
                          onClose();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>فتح مساحة المنشأة</span>
                      </button>
                    )}

                    {/* If it's a Client Option */}
                    {item.rawClient && (
                      <button
                        onClick={() => {
                          onSelectCompany(item.rawClient!.id, item.rawClient!.nameAr);
                          onClose();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تحديد الشركة</span>
                      </button>
                    )}

                    {/* Fill Email in Form */}
                    {item.details.email && (
                      <button
                        onClick={() => {
                          onFillEmail(item.details.email!);
                          onClose();
                          soundService.playSound("SUCCESS_CHIME");
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1 transition cursor-pointer"
                        title="تعبئة البريد في شاشة تسجيل الدخول"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>تعبئة البريد</span>
                      </button>
                    )}

                    {/* Copy Link Button */}
                    {item.details.subLink && (
                      <button
                        onClick={() => handleCopyLink(item.details.subLink!, item.id)}
                        className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition cursor-pointer"
                        title="نسخ الرابط المباشر"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-[#06121f]/90 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>نظام الفهرسة والبحث السريع مفعل ومحدث لحظياً (200+ منشأة ومستخدم)</span>
          </div>

          <div className="flex items-center gap-3">
            {!isEmbedded && (
              <>
                <span className="hidden sm:inline text-slate-400 font-mono text-[11px]">
                  اضغط <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">ESC</kbd> للإغلاق
                </span>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  إغلاق النافذة
                </button>
              </>
            )}
          </div>
        </div>
      </div>
  );

  if (isEmbedded) {
    return contentJSX;
  }

  return (
    <div
      id="sap-universal-search-modal"
      className="fixed inset-0 z-[100] flex items-start justify-center p-3 sm:p-6 md:p-10 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {contentJSX}
    </div>
  );
};
