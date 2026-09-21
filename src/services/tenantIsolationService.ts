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

export interface TenantMetadata {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  adminName: string;
  adminEmail: string;
  category: "PHARMA" | "TRADING" | "MANUFACTURING" | "TECH" | "CUSTOM";
  dbPrefix: string;
}

export const KNOWN_TENANTS: Record<string, TenantMetadata> = {
  "client-1": {
    id: "CLIENT-01",
    slug: "client-1",
    nameAr: "شركة الأمل للتجارة العامة والاستيراد",
    nameEn: "Al-Amal General Trading & Contracting Co.",
    adminName: "مدير المشتريات والمبيعات",
    adminEmail: "client1@medo-trial.com",
    category: "TRADING",
    dbPrefix: "medo_tenant_client_1",
  },
  "alamal": {
    id: "CLIENT-01",
    slug: "client-1",
    nameAr: "شركة الأمل للتجارة العامة والاستيراد",
    nameEn: "Al-Amal General Trading & Contracting Co.",
    adminName: "مدير المشتريات والمبيعات",
    adminEmail: "client1@medo-trial.com",
    category: "TRADING",
    dbPrefix: "medo_tenant_client_1",
  },
  "al-amal": {
    id: "CLIENT-01",
    slug: "client-1",
    nameAr: "شركة الأمل للتجارة العامة والاستيراد",
    nameEn: "Al-Amal General Trading & Contracting Co.",
    adminName: "مدير المشتريات والمبيعات",
    adminEmail: "client1@medo-trial.com",
    category: "TRADING",
    dbPrefix: "medo_tenant_client_1",
  },
  "company-1": {
    id: "CLIENT-01",
    slug: "client-1",
    nameAr: "شركة الأمل للتجارة العامة والاستيراد",
    nameEn: "Al-Amal General Trading & Contracting Co.",
    adminName: "مدير المشتريات والمبيعات",
    adminEmail: "client1@medo-trial.com",
    category: "TRADING",
    dbPrefix: "medo_tenant_client_1",
  },
  "client-2": {
    id: "CLIENT-02",
    slug: "client-2",
    nameAr: "مؤسسة النور الحديثة للمعدات والتوريدات الزراعية",
    nameEn: "Al-Noor Modern Agri Supplies & Equipments",
    adminName: "مدير العمليات الزراعية والتجارية",
    adminEmail: "client2@medo-trial.com",
    category: "TRADING",
    dbPrefix: "medo_tenant_client_2",
  },
  "client-3": {
    id: "CLIENT-03",
    slug: "client-3",
    nameAr: "شركة القمة للإلكترونيات والأجهزة الذكية",
    nameEn: "Al-Qimma Smart Electronics & Technology",
    adminName: "مدير تقنية المعلومات والحسابات",
    adminEmail: "client3@medo-trial.com",
    category: "TECH",
    dbPrefix: "medo_tenant_client_3",
  },
  "pharma-trial": {
    id: "CLIENT-PHARMA",
    slug: "pharma-trial",
    nameAr: "شركة الشفاء الحديثة للأدوية والمستلزمات الطبية",
    nameEn: "Al-Shifa Modern Pharmaceuticals & Medical Supplies",
    adminName: "مدير العمليات الدوائية",
    adminEmail: "pharma-trial@medo-trial.com",
    category: "PHARMA",
    dbPrefix: "medo_tenant_pharma_trial",
  },
  "albadr-pharma-2026": {
    id: "CLIENT-PHARMA",
    slug: "pharma-trial",
    nameAr: "شركة الشفاء الحديثة للأدوية والمستلزمات الطبية",
    nameEn: "Al-Shifa Modern Pharmaceuticals & Medical Supplies",
    adminName: "مدير العمليات الدوائية",
    adminEmail: "pharma-trial@medo-trial.com",
    category: "PHARMA",
    dbPrefix: "medo_tenant_pharma_trial",
  },
};

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
  {
    id: "CUST-PH-03",
    code: "CUST-PH-103",
    nameAr: "مجمع الحياة الطبي التخصصي",
    nameEn: "Al-Hayat Specialized Medical Complex",
    phone: "+967 771 234 890",
    email: "pharma@alhayatmedical.ye",
    address: "صنعاء - شارع الستين الغربي",
    city: "صنعاء",
    taxNumber: "30044582000003",
    creditLimit: 30000000,
    currentBalance: 4200000,
    currency: "YER_SANAA",
    glAccountId: "ACC-PH-104",
    status: "ACTIVE",
    category: "مراكز طبية تخصصية",
    createdAt: "2026-02-05",
  },
  {
    id: "CUST-PH-04",
    code: "CUST-PH-104",
    nameAr: "صيدلية ابن سينا المركزية",
    nameEn: "Ibn Sina Central Pharmacy",
    phone: "+967 773 456 789",
    email: "ibnsina@pharmamail.ye",
    address: "عدن - كريتر",
    city: "عدن",
    taxNumber: "30077882000003",
    creditLimit: 25000000,
    currentBalance: 3100000,
    currency: "YER_ADEN",
    glAccountId: "ACC-PH-104",
    status: "ACTIVE",
    category: "صيدليات أهلية",
    createdAt: "2026-02-12",
  },
  {
    id: "CUST-PH-05",
    code: "CUST-PH-105",
    nameAr: "مستشفى الأمل للأورام ورعاية المرضى",
    nameEn: "Al-Amal Specialized Oncology Hospital",
    phone: "+967 775 678 912",
    email: "procurement@alamalhospital.ye",
    address: "تعز - الحوبان",
    city: "تعز",
    taxNumber: "30055662000003",
    creditLimit: 60000000,
    currentBalance: 9800000,
    currency: "YER_SANAA",
    glAccountId: "ACC-PH-104",
    status: "ACTIVE",
    category: "مستشفيات تخصصية",
    createdAt: "2026-03-01",
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
  {
    id: "VEND-PH-02",
    code: "VEND-PH-102",
    nameAr: "مختبرات الشفاء الدولية للأدوية واللقاحات",
    nameEn: "Al-Shifa International Pharma Labs",
    phone: "+967 1 778899",
    email: "orders@alshifalabs.com",
    address: "دبي - المنطقة الحرة / صنعاء",
    city: "صنعاء",
    taxNumber: "30088990010003",
    currentBalance: 18400000,
    currency: "USD",
    glAccountId: "ACC-PH-201",
    status: "ACTIVE",
    category: "مستوردو أدوية ومضادات",
    createdAt: "2026-01-18",
  },
  {
    id: "VEND-PH-03",
    code: "VEND-PH-103",
    nameAr: "المورد الدولي للأجهزة والمستلزمات الطبية الدقيقة",
    nameEn: "International Precision Medical Supplies",
    phone: "+967 2 667788",
    email: "medtech@intlmedsupply.ye",
    address: "عدن - خور مكسر",
    city: "عدن",
    taxNumber: "30066778890003",
    currentBalance: 11200000,
    currency: "YER_ADEN",
    glAccountId: "ACC-PH-201",
    status: "ACTIVE",
    category: "أجهزة ومستلزمات تشخيصية",
    createdAt: "2026-02-01",
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
  {
    id: "INV-MED-02",
    code: "MED-AUG-1G",
    nameAr: "أوجمنتين 1 جم مضاد حيوي واسع المجال (Augmentin 1g)",
    nameEn: "Augmentin 1g Film-Coated Tablets (Amoxicillin/Clavulanate)",
    category: "مضادات حيوية وعلاجات تخصصية",
    unit: "باكت (14 قرص)",
    quantityOnHand: 420,
    minStockThreshold: 80,
    costPrice: 4800,
    sellingPrice: 6200,
    currency: "YER_SANAA",
    warehouseLocation: "مستودع الأدوية - رف B2",
    totalSalesQty: 940,
    totalReturnsQty: 5,
  },
  {
    id: "INV-MED-03",
    code: "MED-SAL-500",
    nameAr: "محلول ملحي وريدي معقم 500 مل (Normal Saline 0.9% IV)",
    nameEn: "Normal Saline 0.9% IV Infusion 500ml",
    category: "محاليل وسوائل وريدية",
    unit: "عبوة وريدية معقمة",
    quantityOnHand: 1200,
    minStockThreshold: 250,
    costPrice: 850,
    sellingPrice: 1200,
    currency: "YER_SANAA",
    warehouseLocation: "مستودع المحاليل الطبية - قسم C",
    totalSalesQty: 3400,
    totalReturnsQty: 20,
  },
  {
    id: "INV-MED-04",
    code: "MED-OMR-M2",
    nameAr: "جهاز قياس ضغط الدم الإلكتروني الرقمي الدقيق (Omron M2)",
    nameEn: "Omron M2 Digital Upper Arm Blood Pressure Monitor",
    category: "أجهزة طبية وتشخيصية",
    unit: "جهاز كامل مع كفة",
    quantityOnHand: 75,
    minStockThreshold: 15,
    costPrice: 26000,
    sellingPrice: 34000,
    currency: "YER_SANAA",
    warehouseLocation: "خزينة الأجهزة الطبية - قسم E1",
    totalSalesQty: 120,
    totalReturnsQty: 2,
  },
  {
    id: "INV-MED-05",
    code: "MED-GAU-10X10",
    nameAr: "شاش طبي معقم 10×10 سم (Sterile Surgical Gauze)",
    nameEn: "Sterile Gauze Swabs 10x10cm (Pack of 100)",
    category: "مستلزمات طبية وجراحية",
    unit: "علبة (100 قطعة)",
    quantityOnHand: 800,
    minStockThreshold: 150,
    costPrice: 1400,
    sellingPrice: 1950,
    currency: "YER_SANAA",
    warehouseLocation: "مستودع المستلزمات - رف D3",
    totalSalesQty: 2100,
    totalReturnsQty: 15,
  },
  {
    id: "INV-MED-06",
    code: "MED-OME-20",
    nameAr: "أوميبريزول 20 مجم كبسولات (Omeprazole 20mg)",
    nameEn: "Omeprazole Gastro-Resistant Capsules 20mg",
    category: "أدوية ومسكنات وخافضات حرارة",
    unit: "باكت (28 كبسولة)",
    quantityOnHand: 500,
    minStockThreshold: 90,
    costPrice: 2100,
    sellingPrice: 2800,
    currency: "YER_SANAA",
    warehouseLocation: "مستودع الأدوية - رف A3",
    totalSalesQty: 1350,
    totalReturnsQty: 8,
  },
  {
    id: "INV-MED-07",
    code: "MED-VIT-C1000",
    nameAr: "فيتامين سي فوار 1000 مجم مع زنك (Vitamin C + Zinc)",
    nameEn: "Vitamin C 1000mg + Zinc Effervescent 20 Tablets",
    category: "مكملات غذائية وفيتامينات",
    unit: "أنبوب (20 قرص فوار)",
    quantityOnHand: 950,
    minStockThreshold: 120,
    costPrice: 1750,
    sellingPrice: 2350,
    currency: "YER_SANAA",
    warehouseLocation: "مستودع الفيتامينات - رف F2",
    totalSalesQty: 2900,
    totalReturnsQty: 18,
  },
  {
    id: "INV-MED-08",
    code: "MED-MSK-3PLY",
    nameAr: "كمامات طبية معقمة 3 طبقات بفلتر عالي الكفاءة",
    nameEn: "3-Ply Surgical Medical Face Masks (Box of 50)",
    category: "مستلزمات طبية وجراحية",
    unit: "علبة (50 حبة)",
    quantityOnHand: 1500,
    minStockThreshold: 200,
    costPrice: 900,
    sellingPrice: 1400,
    currency: "YER_SANAA",
    warehouseLocation: "مستودع المستلزمات - رف D1",
    totalSalesQty: 5400,
    totalReturnsQty: 30,
  },
  {
    id: "INV-MED-09",
    code: "MED-ACC-GLUC",
    nameAr: "جهاز قياس السكر بالدم مع 50 شريط فحص (Accu-Chek Instant)",
    nameEn: "Accu-Chek Instant Blood Glucose Monitoring Kit",
    category: "أجهزة طبية وتشخيصية",
    unit: "مجموعة فحص كاملة",
    quantityOnHand: 90,
    minStockThreshold: 20,
    costPrice: 21000,
    sellingPrice: 27500,
    currency: "YER_SANAA",
    warehouseLocation: "خزينة الأجهزة الطبية - قسم E2",
    totalSalesQty: 165,
    totalReturnsQty: 3,
  },
  {
    id: "INV-MED-10",
    code: "MED-SYR-5ML",
    nameAr: "حقن ومحاقن طبية معقمة 5 مل استخدام واحد (Sterile Syringes 5ml)",
    nameEn: "Sterile Disposable Syringes 5ml with Needle (Box 100)",
    category: "مستلزمات طبية وجراحية",
    unit: "علبة (100 حقنة)",
    quantityOnHand: 700,
    minStockThreshold: 100,
    costPrice: 2100,
    sellingPrice: 2900,
    currency: "YER_SANAA",
    warehouseLocation: "مستودع المستلزمات - رف D2",
    totalSalesQty: 3100,
    totalReturnsQty: 25,
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
  {
    id: "ACC-PH-102",
    code: "1112",
    nameAr: "بنك اليمن الدولي - حساب الأدوية والمستلزمات",
    nameEn: "IBY Bank - Pharma Operations Account",
    category: "ASSET",
    nature: "DEBIT",
    currency: "YER_SANAA",
    currentBalance: 89200000,
    balanceDebit: 89200000,
    balanceCredit: 0,
    level: 4,
    isHeader: false,
    isActive: true,
  },
  {
    id: "ACC-PH-103",
    code: "1121",
    nameAr: "مخزون الأدوية والمستلزمات الطبية",
    nameEn: "Pharmaceutical & Medical Inventory",
    category: "ASSET",
    nature: "DEBIT",
    currency: "YER_SANAA",
    currentBalance: 62450000,
    balanceDebit: 62450000,
    balanceCredit: 0,
    level: 4,
    isHeader: false,
    isActive: true,
  },
  {
    id: "ACC-PH-104",
    code: "1131",
    nameAr: "ذمم عملاء الصيدليات والمستشفيات",
    nameEn: "Accounts Receivable - Pharmacies & Hospitals",
    category: "ASSET",
    nature: "DEBIT",
    currency: "YER_SANAA",
    currentBalance: 50050000,
    balanceDebit: 50050000,
    balanceCredit: 0,
    level: 4,
    isHeader: false,
    isActive: true,
  },
  {
    id: "ACC-PH-201",
    code: "2111",
    nameAr: "ذمم موردي الأدوية والمصانع الطبية",
    nameEn: "Accounts Payable - Pharma Suppliers",
    category: "LIABILITY",
    nature: "CREDIT",
    currency: "YER_SANAA",
    currentBalance: 64600000,
    balanceDebit: 0,
    balanceCredit: 64600000,
    level: 4,
    isHeader: false,
    isActive: true,
  },
  {
    id: "ACC-PH-301",
    code: "3111",
    nameAr: "رأس مال شركة البدر للأدوية والمستلزمات الطبية",
    nameEn: "Al-Badr Pharma Capital Equity",
    category: "EQUITY",
    nature: "CREDIT",
    currency: "YER_SANAA",
    currentBalance: 125000000,
    balanceDebit: 0,
    balanceCredit: 125000000,
    level: 4,
    isHeader: false,
    isActive: true,
  },
  {
    id: "ACC-PH-401",
    code: "4111",
    nameAr: "إيرادات مبيعات الأدوية والمستلزمات",
    nameEn: "Revenues - Pharma & Medical Sales",
    category: "REVENUE",
    nature: "CREDIT",
    currency: "YER_SANAA",
    currentBalance: 78900000,
    balanceDebit: 0,
    balanceCredit: 78900000,
    level: 4,
    isHeader: false,
    isActive: true,
  },
  {
    id: "ACC-PH-501",
    code: "5111",
    nameAr: "تكلفة مبيعات الأدوية والمستلزمات",
    nameEn: "Cost of Goods Sold - Pharma",
    category: "EXPENSE",
    nature: "DEBIT",
    currency: "YER_SANAA",
    currentBalance: 49800000,
    balanceDebit: 49800000,
    balanceCredit: 0,
    level: 4,
    isHeader: false,
    isActive: true,
  },
  {
    id: "ACC-PH-502",
    code: "5211",
    nameAr: "مصاريف النقل المبرد والتخزين الطبي",
    nameEn: "Cold Chain Storage & Medical Logistics",
    category: "EXPENSE",
    nature: "DEBIT",
    currency: "YER_SANAA",
    currentBalance: 2500000,
    balanceDebit: 2500000,
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
  licenseDuration: "مدى الحياة (ترخيص دائم غير محدود ومستقل)",
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
    lastBackupAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    nextScheduledAt: new Date(Date.now() + 3600000 * 8).toISOString(),
    lastBackupStatus: "SUCCESS",
    lastBackupMessage: "تم الرفع التلقائي المشفر بنجاح إلى سحابة التخزين المالي",
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
  {
    id: "CC-PH-02",
    code: "CC-PH-102",
    nameAr: "مركز تكلفة توزيع المستلزمات الطبية - عدن",
    nameEn: "Aden Medical Distribution Cost Center",
    manager: "د. سامي القاضي",
    budgetAllocated: 30000000,
    actualSpent: 8200000,
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

export class TenantIsolationService {
  private static ACTIVE_TENANT_KEY = "medo_active_tenant_slug";

  /**
   * Resolves the current tenant slug from URL query, active session, hostnames, or storage
   */
  public static resolveActiveTenant(): string {
    if (typeof window !== "undefined" && window.location) {
      const search = window.location.search || "";
      const urlParams = new URLSearchParams(search);

      // 1. Check query param: ?tenant=company-1 or ?client=alzarqa or ?company=bin-ziad
      const clientParam = urlParams.get("tenant") || urlParams.get("client") || urlParams.get("company");
      if (clientParam) {
        const cleanSlug = clientParam.toLowerCase().trim();
        const matched = findTenantById(cleanSlug);
        const resolvedSlug = matched ? matched.id : cleanSlug;

        // [Requirement #3] Always clear localStorage and sessionStorage cache when opening a link with tenant query
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {}

        this.setActiveTenant(resolvedSlug);

        if (matched) {
          const tenantName = matched.name || matched.companyNameAr;
          localStorage.setItem('currentTenant', JSON.stringify(matched));
          localStorage.setItem('companyName', tenantName);
          localStorage.setItem('tenantName', tenantName);
          localStorage.setItem('mdo_print_header_ar', tenantName);
          localStorage.setItem('mdo_print_header_en', matched.nameEn || matched.companyNameEn || matched.name);
          localStorage.setItem('mdo_print_phone', matched.phone || matched.assignedAdminPhone || "+967 773 586 047");
          localStorage.setItem('mdo_print_tax_reg', `س.ت: ${matched.crNumber || matched.commercialReg || "CR-2026"} | ضريبي: ${matched.taxNumber || "300748291000003"}`);
          return matched.id;
        }

        localStorage.setItem('companyName', 'شركة جديدة');
        localStorage.setItem('tenantName', 'شركة جديدة');
        return resolvedSlug;
      }

      // 2. Check currentTenant stored in localStorage
      const storedCurrent = localStorage.getItem("currentTenant");
      if (storedCurrent) {
        try {
          const parsed = JSON.parse(storedCurrent);
          if (parsed && (parsed.id || parsed.slug)) {
            return parsed.id || parsed.slug;
          }
        } catch (e) {}
      }

      // 3. Check stored active tenant key
      const storedTenant = localStorage.getItem(this.ACTIVE_TENANT_KEY);
      if (storedTenant) {
        return storedTenant;
      }

      // 4. Check current user in storage
      const rawUser = localStorage.getItem("medo_erp_current_user_v1");
      if (rawUser) {
        try {
          const user = JSON.parse(rawUser);
          if (user.tenantId) {
            return user.tenantId;
          }
        } catch (e) {}
      }
    }

    return "alzarqa";
  }

  /**
   * Parses employee authentication & role parameters from URL query or path
   */
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

      const tenantParam = urlParams.get("tenant") || urlParams.get("client") || urlParams.get("company") || "";
      let role = urlParams.get("role");
      const token = urlParams.get("token");
      const path = urlParams.get("path") || pathname;

      if (tenantParam) {
        const matched = findTenantById(tenantParam);
        if (matched) {
          this.setActiveTenant(matched.id);
          localStorage.setItem('currentTenant', JSON.stringify(matched));
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
        
        // Lookup dynamic tenant metadata
        let companyName = "";
        let specificEmployeeName = "";

        const matchedTenant = findTenantById(tenantParam);
        if (matchedTenant) {
          companyName = matchedTenant.name;
          const roleKey = roleUpper === "SALES" ? "CASHIER" : roleUpper === "PURCHASER" ? "PURCHASER" : (roleUpper as keyof typeof matchedTenant.roles);
          if (matchedTenant.roles && matchedTenant.roles[roleKey]) {
            specificEmployeeName = `${matchedTenant.roles[roleKey].roleNameAr} - ${matchedTenant.name}`;
          }
        }

        const roleNames: Record<string, string> = {
          SALES: "أ. محمود صالح يحيى عايض (مسؤول المبيعات)",
          CASHIER: "أ. محمود صالح يحيى عايض (مسؤول المبيعات ونقاط البيع)",
          ACCOUNTANT: "أ. أحمد باوزير (كبير المحاسبين)",
          MANAGER: "أ. محمد العتيبي (المدير التنفيذي)",
          PURCHASER: "أ. خالد اليافعي (مدير المشتريات)",
          AUDITOR: "د. سامي القحطاني (المراجع المالي)",
        };

        return {
          role: roleUpper,
          token: token || `AUTH_${roleUpper}_AUTO`,
          path,
          employeeName: specificEmployeeName || roleNames[roleUpper] || `موظف معتمد (${roleUpper})`,
          tenantSlug: tenantParam || undefined,
          companyName: companyName || matchedTenant?.name || undefined,
        };
      }
    } catch (e) {
      console.error("Error parsing employee from URL:", e);
    }
    return null;
  }

  /**
   * Sets the active tenant slug
   */
  public static setActiveTenant(tenantSlug: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.ACTIVE_TENANT_KEY, tenantSlug);
      const matched = findTenantById(tenantSlug);
      if (matched) {
        localStorage.setItem("currentTenant", JSON.stringify(matched));
      }
    }
  }

  /**
   * Checks if the active workspace is Al-Badr Pharmaceuticals
   */
  public static isAlBadrTenant(): boolean {
    const tenant = this.resolveActiveTenant();
    return tenant === "albadr-pharma-2026" || tenant === "client-albadr";
  }

  /**
   * Checks if the current tenant is one of the trial clients
   */
  public static isTrialClientTenant(tenantSlug?: string): boolean {
    const slug = (tenantSlug || this.resolveActiveTenant()).toLowerCase();
    return (
      slug === "client-1" ||
      slug === "client-2" ||
      slug === "client-3" ||
      slug.startsWith("client-") ||
      slug.startsWith("company-")
    );
  }

  /**
   * Returns metadata for current or specified trial client
   */
  public static getTrialTenantDetails(tenantSlug?: string): TenantMetadata | null {
    const slug = tenantSlug || this.resolveActiveTenant();
    return KNOWN_TENANTS[slug] || null;
  }

  /**
   * Returns a clean, isolated seed state for Al-Badr Pharmaceuticals
   */
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

  /**
   * Resolves the current active tenant details dynamically for rendering custom headers, PDF exports, etc.
   */
  public static getActiveTenantDetails(tenantSlugOverride?: string): { 
    nameAr: string; 
    nameEn: string; 
    phone: string; 
    address: string; 
    logoText: string; 
    commercialReg: string; 
    taxNumber: string; 
    city: string;
    industry: string;
  } {
    let slug = tenantSlugOverride;
    if (!slug && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search || "");
      const urlTenant = urlParams.get("tenant") || urlParams.get("client") || urlParams.get("company");
      if (urlTenant) {
        slug = urlTenant.toLowerCase().trim();
      }
    }
    if (!slug) {
      slug = this.resolveActiveTenant();
    }

    // 1. Direct dynamic lookup in preGeneratedTenants (covers alzarqa, bin-ziad, albadr, and all 200 companies)
    const matched = findTenantById(slug);
    if (matched) {
      return {
        nameAr: matched.name || matched.companyNameAr,
        nameEn: matched.nameEn || matched.companyNameEn || matched.name,
        phone: matched.phone || matched.assignedAdminPhone || "+967 773 586 047",
        address: matched.address || `المركز الرئيسي - ${matched.city}`,
        logoText: (matched.slug || slug).toUpperCase(),
        commercialReg: matched.crNumber || matched.commercialReg || "CR-2026",
        taxNumber: matched.taxNumber || "300748291000003",
        city: matched.city || "صنعاء",
        industry: matched.industry || "تجارة عامة واستيراد"
      };
    }

    // 2. Check KNOWN_TENANTS
    const known = KNOWN_TENANTS[slug];
    if (known) {
      return {
        nameAr: known.nameAr,
        nameEn: known.nameEn,
        phone: "+967 773 586 047",
        address: "المركز الرئيسي - صنعاء، اليمن",
        logoText: "MeDo-ERP",
        commercialReg: "7102030",
        taxNumber: "300010020300003",
        city: "صنعاء",
        industry: "تجارة عامة ومقاولات"
      };
    }

    // 3. Check currentTenant stored in localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("currentTenant");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.name || parsed.companyNameAr)) {
            return {
              nameAr: parsed.name || parsed.companyNameAr,
              nameEn: parsed.nameEn || parsed.companyNameEn || parsed.name,
              phone: parsed.phone || parsed.assignedAdminPhone || "+967 773 586 047",
              address: parsed.address || `المركز الرئيسي - ${parsed.city || "اليمن"}`,
              logoText: (parsed.slug || slug || "MEDO").toUpperCase(),
              commercialReg: parsed.crNumber || parsed.commercialReg || "CR-2026",
              taxNumber: parsed.taxNumber || "300748291000003",
              city: parsed.city || "صنعاء",
              industry: parsed.industry || "تجارة عامة واستيراد"
            };
          }
        }
      } catch (e) {}
    }

    // 4. Default Fallback
    return {
      nameAr: "الشركة الزرقاء النبيلة (ش.م.ي)",
      nameEn: "Al-Zarqa Al-Nabeela Company",
      phone: "+967 773 586 047",
      address: "المنطقة الحرة - عدن، اليمن",
      logoText: "AL-ZARQA",
      commercialReg: "CR-AZ-99201",
      taxNumber: "300748291000003",
      city: "عدن",
      industry: "تجارة عامة واستيراد"
    };
  }

  /**
   * Validates if a given token matches the requested role
   */
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

  /**
   * Checks if a navigation tab is allowed for the user's role
   */
  public static isTabAllowedForRole(role: string | undefined | null, tab: string): boolean {
    if (tab === "LEGAL_DOCUMENTS") return true;
    if (!role) return false;
    const cleanRole = role.toUpperCase();

    if (cleanRole === "SYSTEM_ADMIN" || cleanRole === "SUPER_ADMIN" || cleanRole === "ADMIN" || cleanRole === "MANAGER") {
      return true;
    }

    if (cleanRole === "CASHIER" || cleanRole === "SALES") {
      const allowedSalesTabs = [
        "SALES_RETURNS",
        "CUSTOMERS_AR",
        "INVENTORY",
        "CASH_AND_BANK",
        "USER_MANUAL",
        "MEDO_BROCHURE",
        "AI_ASSISTANT",
        "COLLABORATION",
      ];
      return allowedSalesTabs.includes(tab);
    }

    if (cleanRole === "DATA_ENTRY" || cleanRole === "PURCHASER") {
      const allowedProcurementTabs = [
        "PURCHASES_RETURNS",
        "VENDORS_AP",
        "INVENTORY",
        "VOUCHERS",
        "USER_MANUAL",
        "MEDO_BROCHURE",
        "AI_ASSISTANT",
        "COLLABORATION",
      ];
      return allowedProcurementTabs.includes(tab);
    }

    if (cleanRole === "AUDITOR") {
      const allowedAuditorTabs = [
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
      return allowedAuditorTabs.includes(tab);
    }

    if (cleanRole === "ACCOUNTANT") {
      const adminOnlyTabs = [
        "EXECUTIVE_MASTER_SUITE",
        "SAAS_PLATFORM",
        "CENTRAL_ARCHIVE",
        "SECURITY_AND_ROLES",
        "SETTINGS",
      ];
      return !adminOnlyTabs.includes(tab);
    }

    return false;
  }

  /**
   * Returns tenant name by ID
   */
  public static getTenantName(tenantId: string): string {
    const tenant = findTenantById(tenantId) || preGeneratedTenants.find(t => t.id === tenantId || t.slug === tenantId);
    return tenant?.name || 'شركة جديدة';
  }

  /**
   * Returns full tenant details object
   */
  public static getTenantDetails(tenantId: string): any {
    const tenant = findTenantById(tenantId) || preGeneratedTenants.find(t => t.id === tenantId || t.slug === tenantId);
    return tenant || null;
  }
}
