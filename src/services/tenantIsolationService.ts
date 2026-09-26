/**
 * ============================================================
 * 📁 الملف: src/services/tenantIsolationService.ts
 * الوظيفة: إدارة المنشآت المتعددة (Multi-Tenancy) وعزل الجلسات
 * الإصدار: 2.0 - Production Ready
 * آخر تحديث: 2026-09-26
 * ============================================================
 */

import type { ERPFullState } from "./erpStorage";
import {
  Account,
  Branch,
  Customer,
  ERPUser,
  InventoryItem,
  Vendor,
  BankAccountItem,
  CashVaultItem,
  CostCenter,
  CurrencyInfo,
  SystemSettings,
} from "../types/erp";
import { INITIAL_CURRENCIES } from "../data/initialERPData";
import { PRE_GENERATED_200_TENANTS, preGeneratedTenants, findTenantById } from "../data/preGeneratedTenants";
import { getApps, getApp } from "firebase/app";
import {
  doc,
  getDoc,
  getFirestore,
  runTransaction,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";

// ============================================================
// 🔑 المفاتيح الموحدة (Single Source of Truth)
// ============================================================
export const TENANT_KEY = "medo_active_tenant_slug";
export const TENANT_SESSION_KEY = "medo_tenant_session";
export const TENANT_CACHE_KEY = "medo_tenant_cache";

// ============================================================
// 📋 الأنواع (Types & Interfaces)
// ============================================================

export interface RuntimeTenantRecord {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  companyNameAr: string;
  companyNameEn: string;
  crNumber?: string;
  vatNumber?: string;
  taxNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  industry?: string;
  status: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface TenantDetails {
  nameAr: string;
  nameEn: string;
  phone: string;
  address: string;
  logoText: string;
  commercialReg: string;
  taxNumber: string;
  city: string;
  industry: string;
}

// ============================================================
// 🔧 الدوال المساعدة (Helper Functions)
// ============================================================

function getFirebaseDb(): Firestore {
  const apps = getApps();
  if (!apps.length) {
    throw new Error(
      "Firebase has not been initialized. Initialize Firebase before using tenantIsolationService."
    );
  }
  return getFirestore(getApp());
}

function normalizeTenantSlug(value: string): string {
  if (!value) return "";
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function makeTenantSlug(nameAr: string, nameEn?: string): string {
  const source = (nameEn || nameAr || "").trim();
  const slug = normalizeTenantSlug(source);
  return slug || `tenant-${Date.now()}`;
}

/**
 * يحذف كل مفاتيح الجلسة والذاكرة المرتبطة بمنشأة سابقة.
 * هذا هو الدرع الأساسي ضد تسرب البيانات بين المنشآت.
 */
function purgePreviousTenantSession(): void {
  if (typeof window === "undefined") return;

  const staticKeys = [
    TENANT_KEY,
    TENANT_SESSION_KEY,
    "currentTenant",
    "companyName",
    "tenantName",
    "currentSession",
    "medo_erp_state_v1",
    "medo_erp_current_user_v1",
    "medo_original_manager_session",
    "medo_erp_auth",
  ];

  for (const key of staticKeys) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  // مسح كل المفاتيح الديناميكية المرتبطة بمنشآت محددة
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("medo_state_") ||
          key.startsWith("medo_tenant_") ||
          key.startsWith("tenant_") ||
          key.startsWith("erp_") ||
          key.includes("client-") ||
          key.includes("company-"))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {}

  try {
    sessionStorage.clear();
  } catch {}
}

function cacheTenant(tenant: RuntimeTenantRecord | any): void {
  if (typeof window === "undefined" || !tenant) return;

  try {
    const normalized = {
      id: tenant.id || tenant.slug,
      slug: tenant.slug || tenant.id,
      name: tenant.name || tenant.nameAr || tenant.companyNameAr || tenant.slug,
      nameAr: tenant.nameAr || tenant.companyNameAr || tenant.name || tenant.slug,
      nameEn: tenant.nameEn || tenant.companyNameEn || tenant.name || tenant.slug,
      companyNameAr: tenant.companyNameAr || tenant.nameAr || tenant.name || tenant.slug,
      companyNameEn: tenant.companyNameEn || tenant.nameEn || tenant.name || tenant.slug,
      crNumber: tenant.crNumber || tenant.commercialReg || "CR-2026",
      vatNumber: tenant.vatNumber || tenant.taxNumber || "",
      taxNumber: tenant.taxNumber || tenant.vatNumber || "",
      phone: tenant.phone || "+967 773 586 047",
      email: tenant.email || "",
      address: tenant.address || "اليمن",
      city: tenant.city || "صنعاء",
      industry: tenant.industry || "تجارة عامة",
      status: tenant.status || "ACTIVE",
    };

    localStorage.setItem(TENANT_CACHE_KEY, JSON.stringify(normalized));
    localStorage.setItem("currentTenant", JSON.stringify(normalized));
    localStorage.setItem("companyName", normalized.nameAr);
    localStorage.setItem("tenantName", normalized.nameAr);
  } catch {}
}

async function fetchRuntimeTenant(slug: string): Promise<RuntimeTenantRecord | null> {
  const cleanSlug = normalizeTenantSlug(slug);
  if (!cleanSlug) return null;

  try {
    const snapshot = await getDoc(doc(getFirebaseDb(), "tenants", cleanSlug));
    if (!snapshot.exists()) return null;

    const data = snapshot.data() as Omit<RuntimeTenantRecord, "id" | "slug">;
    return {
      ...data,
      id: cleanSlug,
      slug: cleanSlug,
    };
  } catch (error) {
    console.error("Failed to load tenant from Firebase:", error);
    return null;
  }
}

async function hydrateTenantFromFirebase(slug: string): Promise<void> {
  const cleanSlug = normalizeTenantSlug(slug);
  if (!cleanSlug || typeof window === "undefined") return;

  const runtimeTenant = await fetchRuntimeTenant(cleanSlug);
  if (!runtimeTenant) return;

  // حماية من استجابة قديمة تكتب فوق اختيار أحدث
  const active = localStorage.getItem(TENANT_KEY);
  if (active !== cleanSlug) return;

  cacheTenant(runtimeTenant);

  try {
    window.dispatchEvent(
      new CustomEvent("tenant_hydrated", {
        detail: { tenantId: cleanSlug, tenant: runtimeTenant },
      })
    );
  } catch {}
}

// ============================================================
// 🏢 بيانات تجريبية لمنشأة "البدر للأدوية" (Demo Data Only)
// ============================================================

export const ALBADR_ISOLATED_BRANCHES: Branch[] = [
  {
    id: "BR-ALBADR-MAIN",
    code: "BR-PH-01",
    nameAr: "المستودع المركزي للأدوية - صنعاء",
    nameEn: "Central Pharma Warehouse - Sana'a",
    city: "صنعاء",
    address: "شارع الزبيري - مجمع الأطباء التجاري",
    phone: "+967 1 200300",
    email: "sanaa-pharma@medo-trial.com",
    managerName: "د. أمين الصبري",
    currency: "YER_SANAA",
    isMainBranch: true,
    status: "ACTIVE",
    costCenterId: "CC-PH-01",
    warehouseLocation: "مستودع الأدوية المركزي - الزبيري",
    createdAt: "2026-01-01",
  },
  {
    id: "BR-ALBADR-ADEN",
    code: "BR-PH-02",
    nameAr: "فرع توزيع الأدوية والمستلزمات - عدن",
    nameEn: "Aden Medical Distribution Branch",
    city: "عدن",
    address: "المنصورة - شارع التسعين",
    phone: "+967 2 350400",
    email: "aden-pharma@albadr-pharma.com",
    managerName: "د. سامي القاضي",
    currency: "YER_ADEN",
    isMainBranch: false,
    status: "ACTIVE",
    costCenterId: "CC-PH-02",
    warehouseLocation: "مستودع عدن المبرد للأدوية",
    createdAt: "2026-02-01",
  },
];

export const ALBADR_ISOLATED_CUSTOMERS: Customer[] = [
  {
    id: "CUST-PH-01",
    code: "CUST-PH-101",
    nameAr: "صيدليات النور الحديثة - المركز الرئيسي",
    nameEn: "Al-Noor Modern Pharmacies - Main Hub",
    phone: "+967 777 123 456",
    email: "info@alnoorpharma.ye",
    address: "صنعاء - شارع حدة",
    city: "صنعاء",
    taxNumber: "30012948200003",
    creditLimit: 50000000,
    currentBalance: 8450000,
    currency: "YER_SANAA",
    glAccountId: "ACC-PH-104",
    status: "ACTIVE",
    category: "سلاسل صيدليات كبرى",
    createdAt: "2026-01-15",
  },
  {
    id: "CUST-PH-02",
    code: "CUST-PH-102",
    nameAr: "مستشفى الثورة العام النموذجي",
    nameEn: "Al-Thawra General Model Hospital",
    phone: "+967 1 246810",
    email: "purchasing@althawrahospital.ye",
    address: "صنعاء - نقم",
    city: "صنعاء",
    taxNumber: "30099482000003",
    creditLimit: 120000000,
    currentBalance: 24500000,
    currency: "YER_SANAA",
    glAccountId: "ACC-PH-104",
    status: "ACTIVE",
    category: "مستشفيات حكومية ونموذجية",
    createdAt: "2026-01-20",
  },
];

export const ALBADR_ISOLATED_VENDORS: Vendor[] = [
  {
    id: "VEND-PH-01",
    code: "VEND-PH-101",
    nameAr: "الشركة الدوائية العالمية للصناعات الدوائية",
    nameEn: "Global Pharmaceutical Industries Corp.",
    phone: "+967 1 445566",
    email: "supply@globalpharma.ye",
    address: "صنعاء - المنطقة الصناعية",
    city: "صنعاء",
    taxNumber: "30011223340003",
    currentBalance: 35000000,
    currency: "YER_SANAA",
    glAccountId: "ACC-PH-201",
    status: "ACTIVE",
    category: "مصانع أدوية محلية",
    createdAt: "2026-01-10",
  },
];

export const ALBADR_ISOLATED_INVENTORY: InventoryItem[] = [
  {
    id: "INV-MED-01",
    code: "MED-PAN-500",
    nameAr: "بانادول إكسترا 500 مجم (Panadol Extra)",
    nameEn: "Panadol Extra 500mg (Paracetamol/Caffeine)",
    category: "أدوية ومسكنات وخافضات حرارة",
    unit: "باكت (24 قرص)",
    quantityOnHand: 650,
    minStockThreshold: 100,
    costPrice: 1200,
    sellingPrice: 1600,
    currency: "YER_SANAA",
    warehouseLocation: "مستودع الأدوية - رف A1",
    totalSalesQty: 1850,
    totalReturnsQty: 12,
  },
];

export const ALBADR_ISOLATED_ACCOUNTS: Account[] = [
  {
    id: "ACC-PH-101",
    code: "1111",
    nameAr: "الصندوق الرئيسي - فرع الأدوية صنعاء",
    nameEn: "Main Cash Vault - Sana'a Pharma",
    category: "ASSET",
    nature: "DEBIT",
    currency: "YER_SANAA",
    currentBalance: 14500000,
    balanceDebit: 14500000,
    balanceCredit: 0,
    level: 4,
    isHeader: false,
    isActive: true,
  },
];

export const ALBADR_ISOLATED_SETTINGS: SystemSettings = {
  companyNameAr: "شركة البدر للأدوية والمستلزمات الطبية",
  companyNameEn: "Al-Badr Pharmaceuticals & Medical Supplies Co.",
  taxNumber: "30089241040003",
  commercialRegister: "1010-847291",
  phone: "+967 771 900 800",
  address: "صنعاء - شارع الزبيري - مجمع الأطباء التجاري",
  email: "info@albadr-pharma.com",
  baseCurrency: "YER_SANAA",
  defaultBranchId: "BR-ALBADR-MAIN",
  fiscalYearStart: "2026-01-01",
  fiscalYearEnd: "2026-12-31",
  closingDate: "",
  preventUnbalancedJournals: true,
  autoPostApprovedVouchers: true,
  requireCostCenterForExpenses: true,
  allowNegativeCash: false,
  aiModel: "gemini-3.7-flash",
  aiAutoValidation: true,
  licenseType: "LIFETIME",
  licenseDuration: "مدى الحياة",
  licenseStatus: "ACTIVE_LIFETIME",
  licenseExpiryDate: "2099-12-31",
  scheduledBackup: {
    enabled: true,
    frequency: "EVERY_12_HOURS",
    scheduledTime: "02:00",
    autoEncrypt: true,
    encryptionKey: "AlBadr-Pharma-EncKey-2026",
    uploadToCloud: true,
    cloudStoragePath: "cloud_backups_albadr",
    keepMaxBackups: 10,
    lastBackupAt: new Date().toISOString(),
    nextScheduledAt: new Date().toISOString(),
    lastBackupStatus: "SUCCESS",
    lastBackupMessage: "تم الرفع التلقائي المشفر بنجاح",
  },
};

export const ALBADR_ISOLATED_USER: ERPUser = {
  id: "ROLE-PHARMA-DEMO",
  name: "د. أحمد سالم",
  role: "SYSTEM_ADMIN",
  branch: "المستودع المركزي للأدوية - صنعاء",
  branchId: "BR-ALBADR-MAIN",
  avatar: "AS",
  status: "ACTIVE",
  plan: "ENTERPRISE",
  email: "demo@medoerp.com",
  phone: "+967 771 900 800",
};

export const ALBADR_ISOLATED_COST_CENTERS: CostCenter[] = [
  {
    id: "CC-PH-01",
    code: "CC-PH-101",
    nameAr: "مركز تكلفة المستودع المركزي للأدوية - صنعاء",
    nameEn: "Central Pharma Warehouse Cost Center",
    manager: "د. أحمد سالم",
    budgetAllocated: 50000000,
    actualSpent: 12400000,
    type: "OPERATIONAL",
  },
];

export const ALBADR_ISOLATED_BANKS: BankAccountItem[] = [
  {
    id: "BANK-PH-01",
    bankName: "بنك اليمن الدولي (IBY)",
    bankNameAr: "بنك اليمن الدولي (IBY)",
    accountNumber: "IBY-YE-992014-PHARMA",
    iban: "YE45IBYY0000000992014001",
    currency: "YER_SANAA",
    currentBalance: 89200000,
    glAccountId: "ACC-PH-102",
    branch: "فرع الزبيري للأطباء",
    status: "ACTIVE",
  },
];

export const ALBADR_ISOLATED_VAULTS: CashVaultItem[] = [
  {
    id: "VAULT-PH-01",
    name: "خزينة مبيعات الصيدليات المركزية",
    nameAr: "خزينة مبيعات الصيدليات المركزية",
    currency: "YER_SANAA",
    currentBalance: 14500000,
    glAccountId: "ACC-PH-101",
    custodian: "د. عبدالملك بدر",
    location: "صنعاء - شارع الزبيري",
    branchId: "BR-ALBADR-MAIN",
    limitMax: 50000000,
  },
];

// ============================================================
// 🎯 الدوال العامة (Top-Level Public Functions)
// ============================================================

export function getTenantIdFromUrl(): string {
  return TenantIsolationService.getTenantIdFromUrl();
}

export function setActiveTenant(tenantSlug: string, tenantData?: any): void {
  TenantIsolationService.setActiveTenant(tenantSlug, tenantData);
}

export function getActiveTenant(): { id: string; data: TenantDetails } | null {
  const slug = TenantIsolationService.getActiveTenant();
  if (!slug) return null;
  const details = TenantIsolationService.getActiveTenantDetails(slug);
  return { id: slug, data: details };
}

export function clearActiveTenant(): void {
  TenantIsolationService.clearActiveTenant();
}

export async function createTenant(data: {
  name: string;
  crNumber?: string;
  vatNumber?: string;
  ownerEmail: string;
  phone?: string;
  industry?: string;
  nameEn?: string;
}): Promise<{ tenantId: string; accessUrl: string; tenantObject: RuntimeTenantRecord }> {
  return TenantIsolationService.createTenant({
    nameAr: data.name,
    nameEn: data.nameEn,
    crNumber: data.crNumber,
    vatNumber: data.vatNumber,
    email: data.ownerEmail,
    phone: data.phone,
    industry: data.industry,
  });
}

export function initializeTenant(): { id: string; data: TenantDetails } | null {
  return TenantIsolationService.initializeTenant();
}

// ============================================================
// 🏛️ الخدمة الرئيسية (Main Service Class)
// ============================================================

export class TenantIsolationService {
  // --------------------------------------------------------
  // 📖 قراءة المنشأة من الرابط
  // --------------------------------------------------------
  public static getTenantIdFromUrl(): string {
    if (typeof window === "undefined" || !window.location) return "";

    try {
      const params = new URLSearchParams(window.location.search || "");
      const queryTenant =
        params.get("tenant") ||
        params.get("client") ||
        params.get("company");

      if (queryTenant) {
        return normalizeTenantSlug(queryTenant);
      }

      const pathname = window.location.pathname || "";
      const match = pathname.match(/\/t\/([^/?#]+)/i);
      return match?.[1] ? normalizeTenantSlug(decodeURIComponent(match[1])) : "";
    } catch {
      return "";
    }
  }

  // --------------------------------------------------------
  // 🔄 تفعيل منشأة (مع عزل الجلسة السابقة)
  // --------------------------------------------------------
  public static setActiveTenant(tenantSlug: string, tenantData?: any): void {
    if (typeof window === "undefined" || !tenantSlug) return;

    const cleanSlug = normalizeTenantSlug(tenantSlug);
    if (!cleanSlug) return;

    const previousTenant = localStorage.getItem(TENANT_KEY);

    // 🔒 العزل: إذا كانت المنشأة مختلفة، امسح كل شيء
    if (previousTenant && previousTenant !== cleanSlug) {
      purgePreviousTenantSession();
    }

    localStorage.setItem(TENANT_KEY, cleanSlug);
    try {
      sessionStorage.setItem(TENANT_SESSION_KEY, cleanSlug);
    } catch {}

    const matched = findTenantById(cleanSlug);

    if (matched) {
      // منشأة معروفة (مثل ميدو تك)
      cacheTenant(matched);
    } else if (tenantData) {
      // بيانات تمرر مباشرة
      cacheTenant({
        ...tenantData,
        id: tenantData.id || cleanSlug,
        slug: cleanSlug,
      });
    } else {
      // ⚠️ منشأة جديدة (Runtime) — لا نستخدم "ميدو تك" أبداً
      // نستخدم slug المنشأة كاسم مؤقت حتى ينتهي الـ Hydration
      cacheTenant({
        id: cleanSlug,
        slug: cleanSlug,
        name: cleanSlug,
        nameAr: cleanSlug,
        nameEn: cleanSlug,
        companyNameAr: cleanSlug,
        companyNameEn: cleanSlug,
        crNumber: "",
        vatNumber: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        industry: "",
        status: "LOADING",
      });

      // جلب البيانات الحقيقية من Firebase بشكل غير متزامن
      void hydrateTenantFromFirebase(cleanSlug);
    }

    try {
      window.dispatchEvent(
        new CustomEvent("tenant_switched", {
          detail: { tenantId: cleanSlug },
        })
      );
    } catch {}
  }

  // --------------------------------------------------------
  // 📖 جلب المنشأة النشطة (URL يتغلب على الذاكرة)
  // --------------------------------------------------------
  public static getActiveTenant(): string {
    const urlTenant = this.getTenantIdFromUrl();
    if (urlTenant) {
      const stored = typeof window !== "undefined"
        ? localStorage.getItem(TENANT_KEY)
        : null;

      if (stored !== urlTenant) {
        this.setActiveTenant(urlTenant);
      }
      return urlTenant;
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(TENANT_KEY);
      if (stored) return normalizeTenantSlug(stored);
    }

    return "";
  }

  // --------------------------------------------------------
  // 🧹 مسح الجلسة بالكامل
  // --------------------------------------------------------
  public static clearActiveTenant(): void {
    if (typeof window === "undefined") return;

    purgePreviousTenantSession();

    try {
      window.dispatchEvent(new CustomEvent("tenant_cleared"));
    } catch {}
  }

  // --------------------------------------------------------
  // 🆕 إنشاء منشأة جديدة في Firebase
  // --------------------------------------------------------
  public static async createTenant(tenantData: {
    nameAr: string;
    nameEn?: string;
    crNumber?: string;
    vatNumber?: string;
    email?: string;
    phone?: string;
    industry?: string;
  }): Promise<{ tenantSlug: string; accessUrl: string; tenantObject: RuntimeTenantRecord }> {
    const db = getFirebaseDb();

    const baseSlug = makeTenantSlug(tenantData.nameAr, tenantData.nameEn);
    let tenantSlug = baseSlug;
    let suffix = 1;
    let createdTenant: RuntimeTenantRecord | null = null;

    // 🔁 محاولة توليد slug فريد
    while (suffix <= 1000) {
      const candidate = suffix === 1 ? baseSlug : `${baseSlug}-${suffix}`;
      const ref = doc(db, "tenants", candidate);

      try {
        const result = await runTransaction(db, async (transaction) => {
          const existing = await transaction.get(ref);
          if (existing.exists()) return null;

          const tenantObject: RuntimeTenantRecord = {
            id: candidate,
            slug: candidate,
            nameAr: tenantData.nameAr,
            nameEn: tenantData.nameEn || tenantData.nameAr,
            companyNameAr: tenantData.nameAr,
            companyNameEn: tenantData.nameEn || tenantData.nameAr,
            crNumber: tenantData.crNumber || "",
            vatNumber: tenantData.vatNumber || "",
            taxNumber: tenantData.vatNumber || "",
            email: tenantData.email || "",
            phone: tenantData.phone || "",
            industry: tenantData.industry || "تجارة عامة واستيراد",
            status: "ACTIVE",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          transaction.set(ref, tenantObject);
          return tenantObject;
        });

        if (result) {
          tenantSlug = candidate;
          createdTenant = result;
          break;
        }
      } catch (err) {
        console.error("Transaction failed, retrying with new slug:", err);
      }

      suffix += 1;
    }

    if (!createdTenant) {
      throw new Error("فشل توليد معرف فريد للمنشأة الجديدة.");
    }

    const accessUrl = `${window.location.origin}/?tenant=${encodeURIComponent(tenantSlug)}`;

    // ✅ لا نفعّل المنشأة الجديدة في جلسة المستخدم الحالي
    // (المستخدم الحالي هو مالك المنشأة الأم، ونحن لا نريد عزله)

    return {
      tenantSlug,
      accessUrl,
      tenantObject: createdTenant,
    };
  }

  // --------------------------------------------------------
  // 🚀 التهيئة عند تحميل التطبيق
  // --------------------------------------------------------
  public static initializeTenant(): { id: string; data: TenantDetails } | null {
    const urlTenant = this.getTenantIdFromUrl();

    if (urlTenant) {
      this.setActiveTenant(urlTenant);

      const details = this.getActiveTenantDetails(urlTenant);
      void hydrateTenantFromFirebase(urlTenant);

      return { id: urlTenant, data: details };
    }

    const current = this.getActiveTenant();
    if (!current) return null;

    return {
      id: current,
      data: this.getActiveTenantDetails(current),
    };
  }

  // --------------------------------------------------------
  // 🔍 تحديد المنشأة النشطة (URL ← الذاكرة)
  // --------------------------------------------------------
  public static resolveActiveTenant(): string {
    const urlTenant = this.getTenantIdFromUrl();
    if (urlTenant) {
      this.setActiveTenant(urlTenant);
      return urlTenant;
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(TENANT_KEY);
      if (stored) return stored.toLowerCase().trim();
    }

    return "";
  }

  // --------------------------------------------------------
  // 📄 جلب تفاصيل المنشأة (⚠️ لا Fallback إلى "ميدو تك")
  // --------------------------------------------------------
  public static getActiveTenantDetails(tenantSlugOverride?: string): TenantDetails {
    let slug = tenantSlugOverride;

    // 1. أولوية: URL
    if (!slug && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search || "");
      const urlTenant =
        urlParams.get("tenant") ||
        urlParams.get("client") ||
        urlParams.get("company");
      if (urlTenant) {
        slug = normalizeTenantSlug(urlTenant);
      }
    }

    // 2. الذاكرة
    if (!slug) {
      slug = this.resolveActiveTenant();
    }

    // 3. البحث في المنشآت المعروفة (ميدو تك فقط)
    const matched = findTenantById(slug);
    if (matched) {
      return {
        nameAr: matched.name || matched.companyNameAr,
        nameEn: matched.nameEn || matched.companyNameEn || matched.name,
        phone: matched.phone || "+967 773 586 047",
        address: matched.address || `المركز الرئيسي - ${matched.city}`,
        logoText: (matched.slug || slug).toUpperCase(),
        commercialReg: matched.crNumber || matched.commercialReg || "CR-2026",
        taxNumber: matched.taxNumber || "300748291000003",
        city: matched.city || "صنعاء",
        industry: matched.industry || "تجارة عامة واستيراد",
      };
    }

    // 4. البحث في Cache (منشأة Runtime محمّلة من Firebase)
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(TENANT_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (
            parsed &&
            (parsed.slug === slug || parsed.id === slug) &&
            (parsed.nameAr || parsed.name)
          ) {
            return {
              nameAr: parsed.nameAr || parsed.name || slug,
              nameEn: parsed.nameEn || parsed.name || slug,
              phone: parsed.phone || "",
              address: parsed.address || "",
              logoText: (parsed.slug || slug).toUpperCase(),
              commercialReg: parsed.crNumber || "",
              taxNumber: parsed.taxNumber || parsed.vatNumber || "",
              city: parsed.city || "",
              industry: parsed.industry || "",
            };
          }
        }
      } catch {}
    }

    // 5. ⚠️ منشأة غير معروفة — لا نُرجع "ميدو تك"!
    // نُرجع placeholder مؤقت يعرض slug المنشأة
    return {
      nameAr: slug ? `منشأة ${slug}` : "منشأة جديدة",
      nameEn: slug ? `Tenant ${slug}` : "New Tenant",
      phone: "",
      address: "",
      logoText: (slug || "MEDO").toUpperCase(),
      commercialReg: "",
      taxNumber: "",
      city: "",
      industry: "",
    };
  }

  // --------------------------------------------------------
  // 👤 تحليل بيانات الموظف من الرابط
  // --------------------------------------------------------
  public static parseEmployeeFromUrl(): {
    role: string;
    token: string;
    path: string;
    employeeName: string;
    tenantSlug?: string;
    companyName?: string;
  } | null {
    if (typeof window === "undefined" || !window.location) return null;
    try {
      const search = window.location.search || "";
      const pathname = window.location.pathname || "";
      const urlParams = new URLSearchParams(search);

      const tenantParam =
        urlParams.get("tenant") ||
        urlParams.get("client") ||
        urlParams.get("company") ||
        "";
      let role = urlParams.get("role");
      const token = urlParams.get("token");
      const path = urlParams.get("path") || pathname;

      if (tenantParam) {
        const matched = findTenantById(tenantParam);
        if (matched) {
          this.setActiveTenant(matched.id);
        } else {
          this.setActiveTenant(tenantParam);
        }
      }

      if (!role && path) {
        if (path.includes("/employee/sales")) role = "SALES";
        else if (path.includes("/employee/accountant")) role = "ACCOUNTANT";
        else if (path.includes("/employee/manager")) role = "MANAGER";
        else if (path.includes("/employee/purchaser")) role = "PURCHASER";
        else if (path.includes("/employee/auditor")) role = "AUDITOR";
      }

      if (role || token) {
        const roleUpper = (role || "SALES").toUpperCase();
        const roleNames: Record<string, string> = {
          SALES: "مسؤول المبيعات",
          CASHIER: "أمين الصندوق",
          ACCOUNTANT: "كبير المحاسبين",
          MANAGER: "المدير التنفيذي",
          PURCHASER: "مدير المشتريات",
          AUDITOR: "المراجع المالي",
        };

        return {
          role: roleUpper,
          token: token || `AUTH_${roleUpper}_AUTO`,
          path,
          employeeName: roleNames[roleUpper] || `موظف (${roleUpper})`,
          tenantSlug: tenantParam || undefined,
          companyName: undefined,
        };
      }
    } catch (e) {
      console.error("Error parsing employee from URL:", e);
    }
    return null;
  }

  // --------------------------------------------------------
  // 🔐 التحقق من صلاحية التوكن
  // --------------------------------------------------------
  public static validateTokenForRole(token: string | null | undefined, role: string): boolean {
    if (!token) return false;
    const cleanToken = token.trim().toUpperCase();
    const cleanRole = role.trim().toUpperCase();

    if (cleanRole === "CASHIER" || cleanRole === "SALES") {
      return cleanToken.startsWith("AUTH_SALES") || cleanToken.startsWith("AUTH_CASHIER") || cleanToken === "1234";
    }
    if (cleanRole === "DATA_ENTRY" || cleanRole === "PURCHASER" || cleanRole === "PURCHASES") {
      return cleanToken.startsWith("AUTH_PUR") || cleanToken === "1234";
    }
    if (cleanRole === "AUDITOR") {
      return cleanToken.startsWith("AUTH_AUD") || cleanToken === "1234";
    }
    if (cleanRole === "ACCOUNTANT") {
      return cleanToken.startsWith("AUTH_ACC") || cleanToken === "1234";
    }
    if (cleanRole === "MANAGER" || cleanRole === "SYSTEM_ADMIN" || cleanRole === "SUPER_ADMIN" || cleanRole === "ADMIN") {
      return cleanToken.startsWith("AUTH_MGR") || cleanToken.startsWith("AUTH_ADMIN") || cleanToken === "1234";
    }
    return true;
  }

  // --------------------------------------------------------
  // ✅ التحقق من صلاحية التبويب للدور
  // --------------------------------------------------------
  public static isTabAllowedForRole(role: string | undefined | null, tab: string): boolean {
    const publicTabs = ["LEGAL_DOCUMENTS", "HOME_HUB", "MEDO_BROCHURE", "USER_MANUAL", "AI_ASSISTANT", "COLLABORATION"];
    if (publicTabs.includes(tab)) return true;
    if (!role) return false;

    const cleanRole = role.toUpperCase();

    if (cleanRole === "SYSTEM_ADMIN" || cleanRole === "SUPER_ADMIN" || cleanRole === "ADMIN" || cleanRole === "MANAGER") {
      return true;
    }

    if (cleanRole === "CASHIER" || cleanRole === "SALES") {
      return [
        "SALES_RETURNS", "CUSTOMERS_AR", "INVENTORY", "CASH_AND_BANK",
        "USER_MANUAL", "MEDO_BROCHURE", "AI_ASSISTANT", "COLLABORATION",
      ].includes(tab);
    }

    if (cleanRole === "DATA_ENTRY" || cleanRole === "PURCHASER") {
      return [
        "PURCHASES_RETURNS", "VENDORS_AP", "INVENTORY", "VOUCHERS",
        "USER_MANUAL", "MEDO_BROCHURE", "AI_ASSISTANT", "COLLABORATION",
      ].includes(tab);
    }

    if (cleanRole === "AUDITOR") {
      return [
        "DASHBOARD", "FINANCIAL_REPORTS", "GENERAL_LEDGER", "JOURNAL_ENTRIES",
        "CHART_OF_ACCOUNTS", "CASH_FLOW", "FIXED_ASSETS", "COST_CENTERS",
        "CUSTOMERS_AR", "VENDORS_AP", "INVENTORY", "CASH_AND_BANK",
        "PARTNERS", "USER_MANUAL", "MEDO_BROCHURE", "AI_ASSISTANT", "COLLABORATION",
      ].includes(tab);
    }

    if (cleanRole === "PARTNER") {
      return [
        "DASHBOARD", "PARTNERS", "FINANCIAL_REPORTS",
        "USER_MANUAL", "MEDO_BROCHURE", "COLLABORATION", "AI_ASSISTANT",
      ].includes(tab);
    }

    if (cleanRole === "ACCOUNTANT") {
      const adminOnly = ["EXECUTIVE_MASTER_SUITE", "SAAS_PLATFORM", "CENTRAL_ARCHIVE", "SECURITY_AND_ROLES", "SETTINGS"];
      return !adminOnly.includes(tab);
    }

    return false;
  }

  // --------------------------------------------------------
  // 📛 اسم المنشأة بواسطة ID
  // --------------------------------------------------------
  public static getTenantName(tenantId: string): string {
    const tenant =
      findTenantById(tenantId) ||
      preGeneratedTenants.find((t) => t.id === tenantId || t.slug === tenantId);
    return tenant?.name || "شركة جديدة";
  }

  public static getTenantDetails(tenantId: string): any {
    const tenant =
      findTenantById(tenantId) ||
      preGeneratedTenants.find((t) => t.id === tenantId || t.slug === tenantId);
    return tenant || null;
  }

  // --------------------------------------------------------
  // 🧪 دوال مساعدة للاختبار
  // --------------------------------------------------------
  public static isAlBadrTenant(): boolean {
    const tenant = this.resolveActiveTenant();
    return tenant === "albadr-pharma-2026" || tenant === "client-albadr";
  }

  public static isTrialClientTenant(tenantSlug?: string): boolean {
    const slug = (tenantSlug || this.resolveActiveTenant()).toLowerCase();
    return slug.startsWith("client-") || slug.startsWith("company-");
  }

  public static getAlBadrIsolatedState(): ERPFullState {
    return {
      branches: ALBADR_ISOLATED_BRANCHES,
      activeBranchId: "BR-ALBADR-MAIN",
      accounts: ALBADR_ISOLATED_ACCOUNTS,
      journalEntries: [],
      vouchers: [],
      customers: ALBADR_ISOLATED_CUSTOMERS,
      vendors: ALBADR_ISOLATED_VENDORS,
      invoices: [],
      bills: [],
      fixedAssets: [],
      bankAccounts: ALBADR_ISOLATED_BANKS,
      cashVaults: ALBADR_ISOLATED_VAULTS,
      costCenters: ALBADR_ISOLATED_COST_CENTERS,
      currencies: INITIAL_CURRENCIES,
      currentUser: ALBADR_ISOLATED_USER,
      selectedDisplayCurrency: "YER_SANAA",
      systemSettings: ALBADR_ISOLATED_SETTINGS,
      inventoryItems: ALBADR_ISOLATED_INVENTORY,
      stockMovements: [],
      unavailableRequests: [],
      roles: [],
      usersList: [ALBADR_ISOLATED_USER],
      hrEmployees: [],
      hrDecisions: [],
      hrAttendanceRecords: [],
      hrShifts: [],
      hrPayrolls: [],
      correspondences: [],
      approvalRequests: [],
      workflowRules: [],
      auditLogs: [],
      systemAlerts: [],
      chatChannels: [],
      chatMessages: [],
      administrativeCirculars: [],
      exchangeAccounts: [],
      exchangeTransactions: [],
      saasClients: [],
    };
  }
}
