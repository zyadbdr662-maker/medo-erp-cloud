/**
 * MeDo ERP - 200 Multi-Tenant Master Enterprise Companies Directory
 * Pre-configured directory of 200 independent enterprise nodes
 * Distributed across Vercel & MeDo Cloud domains (company-1 to company-200)
 * 5 Dedicated Roles per company = 1000 Total Isolated Links
 */

export interface TenantRoleCredentials {
  token: string;
  email: string;
  password: string;
  roleNameAr: string;
  path: string;
  subLink: string;
}

export interface PreGeneratedTenant {
  index: number;
  id: string; // 'company-1' to 'company-200'
  slug: string;
  name: string; // 'شركة الأمل للتجارة والمقاولات'
  nameEn: string;
  companyNameAr: string; // Alias for backward compatibility
  companyNameEn: string;
  crNumber: string; // Commercial Registration
  commercialReg: string; // Alias
  taxNumber: string; // VAT Number
  phone: string;
  address: string;
  city: string;
  industry: string;
  logo: string;
  masterDomain: string;
  vercelUrl: string;
  status: "ACTIVE" | "TRIAL" | "EXPIRED" | "PAID_ENTERPRISE";
  trialDaysRemaining: number;
  operationsCount: number;
  maxTrialOperations: number; // 200
  assignedAdminName: string;
  assignedAdminPhone: string;
  assignedAdminEmail: string;
  databaseNode: "Alibaba Cloud" | "Huawei Cloud" | "PostgreSQL Local" | "Firebase" | "Qiniu Cloud";
  unlockCode: string;
  roles?: {
    MANAGER: TenantRoleCredentials;
    ACCOUNTANT: TenantRoleCredentials;
    CASHIER: TenantRoleCredentials;
    PURCHASER: TenantRoleCredentials;
    AUDITOR: TenantRoleCredentials;
  };
  employees: {
    id: string;
    name: string;
    roleAr: string;
    roleEn: "MANAGER" | "ACCOUNTANT" | "PURCHASER" | "SALES" | "AUDITOR" | "CASHIER";
    subLink: string;
    loginEmail: string;
    password: string;
  }[];
}

const companyNames = [
  "شركة الأمل",
  "مؤسسة النور",
  "مجموعة الازدهار للاستيراد والتصدير",
  "شركة التقدم للخدمات اللوجستية",
  "رواد الخليج للصناعات التحويلية",
  "شركة البدر للأدوية والمستلزمات الطبية",
  "مؤسسة الفجر للطاقة المتجددة",
  "شركة الوفاق للمواد الغذائية والتموينية",
  "مجموعة الصرح للاستثمار والتطوير العقاري",
  "شركة التميز لتقنية المعلومات والحلول الذكية",
  "مؤسسة القمة للمعدات الثقيلة والآلات",
  "شركة المستقبل للأجهزة الكهربائية والمكيفات",
  "مجموعة الهلال للحديد والصلب",
  "شركة النخبة للسيارات وقطع الغيار",
  "مؤسسة الوسام للمفروشات والديكور الحديث",
  "شركة الأفق للملاحة والشحن الدولي",
  "مجموعة البركة للإنتاج الزراعي والحيواني",
  "شركة الإبداع للدعاية والتسويق الرقمي",
  "مؤسسة الريان لتنقية ومعالجة المياه",
  "شركة الشروق للمنسوجات والملابس الجاهزة",
  "مجموعة الاتحاد للبتروكيماويات والزيوت",
  "شركة الرواد للأخشاب وتصنيع الأثاث",
  "مؤسسة البشائر للأدوات الصحية والسباكة",
  "شركة النصر للألمنيوم والواجهات الزجاجية",
  "مجموعة الفرسان للأمن والسلامة المهنية",
  "شركة الدلتا للصناعات البلاستيكية والكرتون",
  "مؤسسة المجد للمقاولات العامة والإنشاءات",
  "شركة الواحة للتجارة العامة والتوكيلات",
  "مجموعة التضامن للصرافة والتحويلات المالية",
  "شركة المنار للصناعات الغذائية والتغليف",
  "مؤسسة دار الخبرة للاستشارات الإدارية والمالية",
  "شركة اليمامة لخدمات الطيران والسفر",
  "مجموعة الفردوس للمنتجعات السياحية والفنادق",
  "شركة الساحل للصيد البحري والأسماك",
  "مؤسسة ركاز للأحجار والرخام الطبيعي",
  "شركة طويق لحلول الاتصالات والشبكات",
  "مجموعة الروابي لمصانع الألبان والعصائر",
  "شركة الأطلس للمستودعات الجمركية والتخزين",
  "مؤسسة التاج للذهب والمجوهرات الثمينة",
  "شركة الشرق للمستلزمات المكتبية والقرطاسية",
];

const cities = ["صنعاء", "عدن", "الرياض", "جدة", "دبي", "الدمام", "تعز", "الحديدة", "المكلا", "أبوظبي", "الدوحة", "مسقط"];
const addresses = [
  "شارع حدة - مجمع النخبة التجاري",
  "شارع الزبيري - مقابل برج الأطباء",
  "شارع الستين الجنوبي - برج الأمل",
  "شارع الستين الغربي - بجوار سيتي ماكس",
  "شارع تعز - جولة 45",
  "شارع الدائري الغربي - مبنى التميز",
  "شارع التحلية - مركز التجارة والأعمال",
  "طريق الملك فهد - برج المروة",
  "شارع المطار - المنطقة الحرة",
  "شارع التسعين - مجمع النور",
  "شارع بغداد - عمارة الرواد",
  "شارع القيادة - مقابل البنك المركزي",
];

const industries = [
  "تجارة عامة واستيراد",
  "صناعة وتحويل",
  "مقاولات وإنشاءات",
  "أدوية ورعاية صحية",
  "أغذية ومشروبات",
  "تقنية واتصالات",
  "شحن ولوجستيات",
  "صرافة وخدمات مالية",
  "معدات وسيارات",
  "طاقة وبيئة",
];

export const VERCEL_PRODUCTION_BASE = "https://mdanmedo-erp-sap-s-4hana-6103-ai-st.vercel.app";

/**
 * Manual VIP Enterprise Nodes (Added by request)
 */
export const MANUAL_VIP_TENANTS: PreGeneratedTenant[] = [
  {
    index: 0,
    id: 'alzarqa',
    slug: 'alzarqa',
    name: 'الزرقاء النبيلة',
    nameEn: 'Al-Zarqa Al-Nabeela Company',
    companyNameAr: 'الزرقاء النبيلة',
    companyNameEn: 'Al-Zarqa Al-Nabeela Company',
    crNumber: 'CR-AZ-99201',
    commercialReg: 'CR-AZ-99201',
    taxNumber: '300748291000003',
    phone: '+967 773 586 047',
    address: 'المنطقة الحرة - عدن، اليمن',
    city: 'عدن',
    industry: 'تجارة عامة واستيراد',
    logo: '/logos/alzarqa.png',
    masterDomain: `${VERCEL_PRODUCTION_BASE}/?tenant=alzarqa`,
    vercelUrl: `${VERCEL_PRODUCTION_BASE}/?tenant=alzarqa`,
    status: "PAID_ENTERPRISE",
    trialDaysRemaining: 365,
    operationsCount: 1200,
    maxTrialOperations: 200,
    assignedAdminName: 'أ. بدر عايض',
    assignedAdminPhone: '+967 773 586 047',
    assignedAdminEmail: 'manager@alzarqa.medo-erp.cloud',
    databaseNode: "PostgreSQL Local",
    unlockCode: "MEDO-AZ-VIP-2026",
    roles: {
      MANAGER: { token: 'AUTH_MGR_AZ', email: 'manager@alzarqa.medo-erp.cloud', password: '1234', roleNameAr: "المدير العام (MANAGER)", path: "/employee/manager", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=alzarqa&role=MANAGER&token=AUTH_MGR_AZ&path=/employee/manager` },
      ACCOUNTANT: { token: 'AUTH_ACC_AZ', email: 'accountant@alzarqa.medo-erp.cloud', password: '1234', roleNameAr: "كبير المحاسبين (ACCOUNTANT)", path: "/employee/accountant", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=alzarqa&role=ACCOUNTANT&token=AUTH_ACC_AZ&path=/employee/accountant` },
      CASHIER: { token: 'AUTH_SALES_AZ', email: 'sales@alzarqa.medo-erp.cloud', password: '1234', roleNameAr: "مسؤول المبيعات (CASHIER)", path: "/employee/sales", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=alzarqa&role=CASHIER&token=AUTH_SALES_AZ&path=/employee/sales` },
      PURCHASER: { token: 'AUTH_PUR_AZ', email: 'purchase@alzarqa.medo-erp.cloud', password: '1234', roleNameAr: "مسؤول المشتريات (PURCHASER)", path: "/employee/purchase", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=alzarqa&role=PURCHASER&token=AUTH_PUR_AZ&path=/employee/purchase` },
      AUDITOR: { token: 'AUTH_AUD_AZ', email: 'auditor@alzarqa.medo-erp.cloud', password: '1234', roleNameAr: "المراجع المالي (AUDITOR)", path: "/employee/auditor", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=alzarqa&role=AUDITOR&token=AUTH_AUD_AZ&path=/employee/auditor` },
    },
    employees: []
  },
  {
    index: 0,
    id: 'bin-ziad',
    slug: 'bin-ziad',
    name: 'بن زياد',
    nameEn: 'Bin Ziad United Commercial Group',
    companyNameAr: 'بن زياد',
    companyNameEn: 'Bin Ziad United Commercial Group',
    crNumber: '3892710',
    commercialReg: '3892710',
    taxNumber: '30074829100003',
    phone: '+967 773586047 | 715779976',
    address: 'الكندوي، حمر، عمران - اليمن',
    city: 'عمران',
    industry: 'مواد بناء ومواد زراعية',
    logo: '/logos/binziad.png',
    masterDomain: `${VERCEL_PRODUCTION_BASE}/?tenant=bin-ziad`,
    vercelUrl: `${VERCEL_PRODUCTION_BASE}/?tenant=bin-ziad`,
    status: "PAID_ENTERPRISE",
    trialDaysRemaining: 365,
    operationsCount: 1800,
    maxTrialOperations: 200,
    assignedAdminName: 'أ. علي بن زياد',
    assignedAdminPhone: '+967 773 586 047',
    assignedAdminEmail: 'manager@binziyad.medo-erp.cloud',
    databaseNode: "PostgreSQL Local",
    unlockCode: "MEDO-BZ-VIP-2026",
    roles: {
      MANAGER: { token: 'AUTH_MGR_BZ', email: 'manager@binziyad.medo-erp.cloud', password: '1234', roleNameAr: "المدير العام (MANAGER)", path: "/employee/manager", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=bin-ziad&role=MANAGER&token=AUTH_MGR_BZ&path=/employee/manager` },
      ACCOUNTANT: { token: 'AUTH_ACC_BZ', email: 'accountant@binziyad.medo-erp.cloud', password: '1234', roleNameAr: "كبير المحاسبين (ACCOUNTANT)", path: "/employee/accountant", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=bin-ziad&role=ACCOUNTANT&token=AUTH_ACC_BZ&path=/employee/accountant` },
      CASHIER: { token: 'AUTH_SALES_BZ', email: 'sales@binziyad.medo-erp.cloud', password: '1234', roleNameAr: "مسؤول المبيعات (CASHIER)", path: "/employee/sales", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=bin-ziad&role=CASHIER&token=AUTH_SALES_BZ&path=/employee/sales` },
      PURCHASER: { token: 'AUTH_PUR_BZ', email: 'purchase@binziyad.medo-erp.cloud', password: '1234', roleNameAr: "مسؤول المشتريات (PURCHASER)", path: "/employee/purchase", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=bin-ziad&role=PURCHASER&token=AUTH_PUR_BZ&path=/employee/purchase` },
      AUDITOR: { token: 'AUTH_AUD_BZ', email: 'auditor@binziyad.medo-erp.cloud', password: '1234', roleNameAr: "المراجع المالي (AUDITOR)", path: "/employee/auditor", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=bin-ziad&role=AUDITOR&token=AUTH_AUD_BZ&path=/employee/auditor` },
    },
    employees: []
  },
  {
    index: 0,
    id: 'binziyad',
    slug: 'binziyad',
    name: 'بن زياد',
    nameEn: 'Bin Ziad United Commercial Group',
    companyNameAr: 'بن زياد',
    companyNameEn: 'Bin Ziad United Commercial Group',
    crNumber: '3892710',
    commercialReg: '3892710',
    taxNumber: '30074829100003',
    phone: '+967 773586047 | 715779976',
    address: 'الكندوي، حمر، عمران - اليمن',
    city: 'عمران',
    industry: 'مواد بناء ومواد زراعية',
    logo: '/logos/binziad.png',
    masterDomain: `${VERCEL_PRODUCTION_BASE}/?tenant=binziyad`,
    vercelUrl: `${VERCEL_PRODUCTION_BASE}/?tenant=binziyad`,
    status: "PAID_ENTERPRISE",
    trialDaysRemaining: 365,
    operationsCount: 1800,
    maxTrialOperations: 200,
    assignedAdminName: 'أ. علي بن زياد',
    assignedAdminPhone: '+967 773 586 047',
    assignedAdminEmail: 'manager@binziyad.medo-erp.cloud',
    databaseNode: "PostgreSQL Local",
    unlockCode: "MEDO-BZ-VIP-2026",
    roles: {
      MANAGER: { token: 'AUTH_MGR_BZ', email: 'manager@binziyad.medo-erp.cloud', password: '1234', roleNameAr: "المدير العام (MANAGER)", path: "/employee/manager", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=binziyad&role=MANAGER&token=AUTH_MGR_BZ&path=/employee/manager` },
      ACCOUNTANT: { token: 'AUTH_ACC_BZ', email: 'accountant@binziyad.medo-erp.cloud', password: '1234', roleNameAr: "كبير المحاسبين (ACCOUNTANT)", path: "/employee/accountant", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=binziyad&role=ACCOUNTANT&token=AUTH_ACC_BZ&path=/employee/accountant` },
      CASHIER: { token: 'AUTH_SALES_BZ', email: 'sales@binziyad.medo-erp.cloud', password: '1234', roleNameAr: "مسؤول المبيعات (CASHIER)", path: "/employee/sales", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=binziyad&role=CASHIER&token=AUTH_SALES_BZ&path=/employee/sales` },
      PURCHASER: { token: 'AUTH_PUR_BZ', email: 'purchase@binziyad.medo-erp.cloud', password: '1234', roleNameAr: "مسؤول المشتريات (PURCHASER)", path: "/employee/purchase", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=binziyad&role=PURCHASER&token=AUTH_PUR_BZ&path=/employee/purchase` },
      AUDITOR: { token: 'AUTH_AUD_BZ', email: 'auditor@binziyad.medo-erp.cloud', password: '1234', roleNameAr: "المراجع المالي (AUDITOR)", path: "/employee/auditor", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=binziyad&role=AUDITOR&token=AUTH_AUD_BZ&path=/employee/auditor` },
    },
    employees: []
  },
  {
    index: 0,
    id: 'albadr-pharma-2026',
    slug: 'albadr-pharma-2026',
    name: 'شركة البدر للأدوية والمستلزمات الطبية',
    nameEn: 'Al-Badr Pharmaceuticals & Medical Supplies',
    companyNameAr: 'شركة البدر للأدوية والمستلزمات الطبية',
    companyNameEn: 'Al-Badr Pharmaceuticals & Medical Supplies',
    crNumber: '1029384',
    commercialReg: '1029384',
    taxNumber: '30009827400003',
    phone: '+967 1 445566 | 771234567',
    address: 'المركز الرئيسي - شارع حدة، صنعاء',
    city: 'صنعاء',
    industry: 'أدوية ومستلزمات طبية',
    logo: '/logos/albadr.png',
    masterDomain: `${VERCEL_PRODUCTION_BASE}/?tenant=albadr-pharma-2026`,
    vercelUrl: `${VERCEL_PRODUCTION_BASE}/?tenant=albadr-pharma-2026`,
    status: "PAID_ENTERPRISE",
    trialDaysRemaining: 365,
    operationsCount: 950,
    maxTrialOperations: 200,
    assignedAdminName: 'د. عبدالملك بدر',
    assignedAdminPhone: '+967 771 234 567',
    assignedAdminEmail: 'manager@albadr.medo-erp.cloud',
    databaseNode: "PostgreSQL Local",
    unlockCode: "MEDO-BADR-VIP-2026",
    roles: {
      MANAGER: { token: 'AUTH_MGR_BADR', email: 'manager@albadr.medo-erp.cloud', password: '1234', roleNameAr: "المدير العام (MANAGER)", path: "/employee/manager", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=albadr-pharma-2026&role=MANAGER&token=AUTH_MGR_BADR&path=/employee/manager` },
      ACCOUNTANT: { token: 'AUTH_ACC_BADR', email: 'accountant@albadr.medo-erp.cloud', password: '1234', roleNameAr: "كبير المحاسبين (ACCOUNTANT)", path: "/employee/accountant", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=albadr-pharma-2026&role=ACCOUNTANT&token=AUTH_ACC_BADR&path=/employee/accountant` },
      CASHIER: { token: 'AUTH_SALES_BADR', email: 'sales@albadr.medo-erp.cloud', password: '1234', roleNameAr: "مسؤول المبيعات (CASHIER)", path: "/employee/sales", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=albadr-pharma-2026&role=CASHIER&token=AUTH_SALES_BADR&path=/employee/sales` },
      PURCHASER: { token: 'AUTH_PUR_BADR', email: 'purchase@albadr.medo-erp.cloud', password: '1234', roleNameAr: "مسؤول المشتريات (PURCHASER)", path: "/employee/purchase", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=albadr-pharma-2026&role=PURCHASER&token=AUTH_PUR_BADR&path=/employee/purchase` },
      AUDITOR: { token: 'AUTH_AUD_BADR', email: 'auditor@albadr.medo-erp.cloud', password: '1234', roleNameAr: "المراجع المالي (AUDITOR)", path: "/employee/auditor", subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=albadr-pharma-2026&role=AUDITOR&token=AUTH_AUD_BADR&path=/employee/auditor` },
    },
    employees: []
  }
];

const dbNodes: ("Alibaba Cloud" | "Huawei Cloud" | "PostgreSQL Local" | "Firebase" | "Qiniu Cloud")[] = [
  "Alibaba Cloud",
  "Huawei Cloud",
  "Firebase",
  "PostgreSQL Local",
  "Qiniu Cloud",
];

// Generate exact 200 distinct enterprise nodes with full 5-role credentials
export const PRE_GENERATED_200_TENANTS: PreGeneratedTenant[] = Array.from({ length: 200 }, (_, i) => {
  const num = i + 1;
  const nameBase = companyNames[(num - 1) % companyNames.length];
  const companyNameAr = num <= companyNames.length ? nameBase : `${nameBase} (الفرع ${Math.floor((num - 1) / companyNames.length) + 1})`;
  const slug = `company-${num}`;
  const id = slug;
  const city = cities[(num * 3) % cities.length];
  const address = `${city} - ${addresses[(num * 5) % addresses.length]}`;
  const industry = industries[(num * 2) % industries.length];
  const cr = `1010${(500000 + num * 37).toString().substring(0, 6)}`;
  const vat = `300${(748291000 + num * 91).toString().substring(0, 9)}00003`;
  const phone = `777${(111000 + num * 23).toString().substring(0, 6)}`;
  
  const isPaid = num % 4 === 0; // 50 paid, 150 trial
  const status: "ACTIVE" | "TRIAL" | "EXPIRED" | "PAID_ENTERPRISE" = isPaid ? "PAID_ENTERPRISE" : "TRIAL";
  const opsCount = isPaid ? Math.floor(Math.random() * 4500) + 500 : Math.floor(Math.random() * 185) + 1;
  const trialDaysRemaining = isPaid ? 365 : Math.max(1, 30 - Math.floor(opsCount / 7));
  const databaseNode = dbNodes[num % dbNodes.length];

  const unlockCode = `MEDO-UNLOCK-2026-C${num.toString().padStart(3, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const masterDomain = `${VERCEL_PRODUCTION_BASE}/?tenant=${slug}`;
  const vercelUrl = masterDomain;

  const roles = {
    MANAGER: {
      token: `AUTH_MGR_${num}`,
      email: `manager@${slug}.medo-erp.cloud`,
      password: "1234",
      roleNameAr: "مدير عام المنشأة (MANAGER)",
      path: "/employee/manager",
      subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=${slug}&role=MANAGER&token=AUTH_MGR_${num}&path=/employee/manager`,
    },
    ACCOUNTANT: {
      token: `AUTH_ACC_${num}`,
      email: `accountant@${slug}.medo-erp.cloud`,
      password: "1234",
      roleNameAr: "كبير المحاسبين (ACCOUNTANT)",
      path: "/employee/accountant",
      subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=${slug}&role=ACCOUNTANT&token=AUTH_ACC_${num}&path=/employee/accountant`,
    },
    CASHIER: {
      token: `AUTH_SALES_${num}`,
      email: `sales@${slug}.medo-erp.cloud`,
      password: "1234",
      roleNameAr: "مسؤول المبيعات ونقاط البيع (CASHIER)",
      path: "/employee/sales",
      subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=${slug}&role=CASHIER&token=AUTH_SALES_${num}&path=/employee/sales`,
    },
    PURCHASER: {
      token: `AUTH_PUR_${num}`,
      email: `purchase@${slug}.medo-erp.cloud`,
      password: "1234",
      roleNameAr: "مسؤول المشتريات والتوريد (PURCHASER)",
      path: "/employee/purchase",
      subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=${slug}&role=PURCHASER&token=AUTH_PUR_${num}&path=/employee/purchase`,
    },
    AUDITOR: {
      token: `AUTH_AUD_${num}`,
      email: `auditor@${slug}.medo-erp.cloud`,
      password: "1234",
      roleNameAr: "مدقق ومراجع الحسابات (AUDITOR)",
      path: "/employee/auditor",
      subLink: `${VERCEL_PRODUCTION_BASE}/?tenant=${slug}&role=AUDITOR&token=AUTH_AUD_${num}&path=/employee/auditor`,
    },
  };

  const employees = [
    {
      id: `emp-${num}-1`,
      name: `أ. محمد العتيبي (المدير العام)`,
      roleAr: "مدير عام المنشأة",
      roleEn: "MANAGER" as const,
      subLink: roles.MANAGER.subLink,
      loginEmail: roles.MANAGER.email,
      password: roles.MANAGER.password,
    },
    {
      id: `emp-${num}-2`,
      name: `أ. أحمد باوزير (كبير المحاسبين)`,
      roleAr: "محاسب عام رئيسي",
      roleEn: "ACCOUNTANT" as const,
      subLink: roles.ACCOUNTANT.subLink,
      loginEmail: roles.ACCOUNTANT.email,
      password: roles.ACCOUNTANT.password,
    },
    {
      id: `emp-${num}-3`,
      name: `أ. خالد اليافعي (مدير المشتريات)`,
      roleAr: "مسؤول مشتريات وتوريد",
      roleEn: "PURCHASER" as const,
      subLink: roles.PURCHASER.subLink,
      loginEmail: roles.PURCHASER.email,
      password: roles.PURCHASER.password,
    },
    {
      id: `emp-${num}-4`,
      name: `أ. محمود صالح يحيى عايض (مسؤول المبيعات ونقاط البيع)`,
      roleAr: "كاشير ونقاط البيع POS",
      roleEn: "SALES" as const,
      subLink: roles.CASHIER.subLink,
      loginEmail: roles.CASHIER.email,
      password: roles.CASHIER.password,
    },
    {
      id: `emp-${num}-5`,
      name: `د. سامي القحطاني (المراجع المالي)`,
      roleAr: "مدقق ومراجع حسابات خارجي",
      roleEn: "AUDITOR" as const,
      subLink: roles.AUDITOR.subLink,
      loginEmail: roles.AUDITOR.email,
      password: roles.AUDITOR.password,
    },
  ];

  return {
    index: num,
    id,
    slug,
    name: companyNameAr,
    nameEn: `Enterprise Node #${num} (${slug})`,
    companyNameAr,
    companyNameEn: `Enterprise Node #${num} (${slug})`,
    crNumber: cr,
    commercialReg: cr,
    taxNumber: vat,
    phone,
    address,
    city,
    industry,
    logo: `/logos/${slug}.png`,
    masterDomain,
    vercelUrl,
    status,
    trialDaysRemaining,
    operationsCount: opsCount,
    maxTrialOperations: 200,
    assignedAdminName: `مسؤول الحساب - المنشأة ${num}`,
    assignedAdminPhone: phone,
    assignedAdminEmail: roles.MANAGER.email,
    databaseNode,
    unlockCode,
    roles,
    employees,
  };
});

// Alias export for standard naming
export const preGeneratedTenants = [...MANUAL_VIP_TENANTS, ...PRE_GENERATED_200_TENANTS];

export const TENANTS_STORAGE_KEY = "medo_erp_200_tenants_v3";
export const REGISTERED_TENANTS_KEY = "medo_erp_registered_tenants_v1";

/**
 * Robust Arabic-to-Latin transliteration helper for tenant slugs
 */
export function generateTenantSlug(nameAr: string, nameEn?: string, nextIndex: number = 1): string {
  if (nameEn && nameEn.trim()) {
    const cleanEn = nameEn
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (cleanEn.length >= 3) {
      const suffix = Math.random().toString(36).substring(2, 6);
      return `${cleanEn}-${suffix}`;
    }
  }

  const arabicMap: Record<string, string> = {
    "شركة": "company",
    "مؤسسة": "foundation",
    "مجموعة": "group",
    "عالم": "alam",
    "الديكور": "decor",
    "ديكور": "decor",
    "الحديث": "modern",
    "حديث": "modern",
    "الأمل": "alamal",
    "النور": "alnoor",
    "البدر": "albadr",
    "الفخامة": "fakhamah",
    "القمة": "qimma",
    "الريان": "rayyan",
    "الرواد": "ruwwad",
    "التجارة": "trading",
    "المقاولات": "contracting",
    "للأدوية": "pharma",
    "المتجددة": "renewable",
    "طاقة": "energy",
    "أنظمة": "systems",
    "تقنية": "tech",
  };

  let transliterated = (nameAr || "").trim();
  for (const [ar, en] of Object.entries(arabicMap)) {
    transliterated = transliterated.replace(new RegExp(ar, "g"), ` ${en} `);
  }

  const clean = transliterated
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const suffix = Math.random().toString(36).substring(2, 6);
  if (clean && clean.length >= 3) {
    return `${clean}-${suffix}`;
  }

  return `enterprise-${nextIndex}-${suffix}`;
}

/**
 * Retrieves all registered and pre-generated tenants combined
 */
export function getStored200Tenants(): PreGeneratedTenant[] {
  if (typeof window === "undefined") return preGeneratedTenants;
  try {
    const raw = localStorage.getItem(TENANTS_STORAGE_KEY);
    const selfRegisteredRaw = localStorage.getItem(REGISTERED_TENANTS_KEY);
    let baseList = preGeneratedTenants;
    
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        baseList = parsed;
      }
    }

    if (selfRegisteredRaw) {
      const registeredParsed = JSON.parse(selfRegisteredRaw);
      if (Array.isArray(registeredParsed)) {
        // Merge without duplicates
        const existingIds = new Set(baseList.map((t) => t.id));
        const customToAdd = registeredParsed.filter((t) => !existingIds.has(t.id));
        return [...customToAdd, ...baseList];
      }
    }

    return baseList;
  } catch (e) {
    console.error("Failed to load stored tenants", e);
  }
  return preGeneratedTenants;
}

/**
 * Saves updated 200 tenants list to localStorage
 */
export function saveStored200Tenants(tenants: PreGeneratedTenant[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));
  } catch (e) {
    console.error("Failed to save tenants", e);
  }
}

export interface RegisterTenantInput {
  nameAr: string;
  nameEn: string;
  crNumber: string;
  taxNumber: string;
  industry: string;
  address: string;
  city?: string;
  email: string;
  phone: string;
  password?: string;
}

/**
 * Registers a new Self-Service Tenant dynamically
 */
export function registerSelfServiceTenant(input: RegisterTenantInput): PreGeneratedTenant {
  const allCurrent = getStored200Tenants();
  const nextIndex = allCurrent.length + 1;
  
  // Clean slug generation with Arabic transliteration support
  const slug = generateTenantSlug(input.nameAr, input.nameEn, nextIndex);
  const id = slug;
  const vercelBase = VERCEL_PRODUCTION_BASE;
  const masterLink = `${vercelBase}/?tenant=${id}`;
  const defaultPassword = input.password || "1234";
  const unlockCode = `MEDO-LOCK-${Math.floor(100000 + Math.random() * 900000)}`;

  const roles: PreGeneratedTenant["roles"] = {
    MANAGER: {
      token: `AUTH_MGR_${id}`,
      email: input.email || `manager@${slug}.medo-erp.cloud`,
      password: defaultPassword,
      roleNameAr: "المدير العام / المدير المالي",
      path: "/employee/manager",
      subLink: `${vercelBase}/?tenant=${id}&role=MANAGER&token=AUTH_MGR_${id}&path=/employee/manager`,
    },
    ACCOUNTANT: {
      token: `AUTH_ACC_${id}`,
      email: `accountant@${slug}.medo-erp.cloud`,
      password: defaultPassword,
      roleNameAr: "المحاسب المالي العام",
      path: "/employee/accountant",
      subLink: `${vercelBase}/?tenant=${id}&role=ACCOUNTANT&token=AUTH_ACC_${id}&path=/employee/accountant`,
    },
    CASHIER: {
      token: `AUTH_SALES_${id}`,
      email: `cashier@${slug}.medo-erp.cloud`,
      password: defaultPassword,
      roleNameAr: "كاشير / مسؤول المبيعات ونقاط البيع",
      path: "/employee/sales",
      subLink: `${vercelBase}/?tenant=${id}&role=CASHIER&token=AUTH_SALES_${id}&path=/employee/sales`,
    },
    PURCHASER: {
      token: `AUTH_PUR_${id}`,
      email: `purchaser@${slug}.medo-erp.cloud`,
      password: defaultPassword,
      roleNameAr: "مسؤول المشتريات والتوريدات",
      path: "/employee/purchase",
      subLink: `${vercelBase}/?tenant=${id}&role=PURCHASER&token=AUTH_PUR_${id}&path=/employee/purchase`,
    },
    AUDITOR: {
      token: `AUTH_AUD_${id}`,
      email: `auditor@${slug}.medo-erp.cloud`,
      password: defaultPassword,
      roleNameAr: "مدقق ومراجع حسابات خارجي",
      path: "/employee/auditor",
      subLink: `${vercelBase}/?tenant=${id}&role=AUDITOR&token=AUTH_AUD_${id}&path=/employee/auditor`,
    },
  };

  const employees: PreGeneratedTenant["employees"] = [
    {
      id: `emp-${id}-mgr`,
      name: `${input.nameAr} - المدير العام`,
      roleAr: roles.MANAGER.roleNameAr,
      roleEn: "MANAGER",
      subLink: roles.MANAGER.subLink,
      loginEmail: roles.MANAGER.email,
      password: roles.MANAGER.password,
    },
    {
      id: `emp-${id}-acc`,
      name: `المحاسب المالي (${input.nameAr})`,
      roleAr: roles.ACCOUNTANT.roleNameAr,
      roleEn: "ACCOUNTANT",
      subLink: roles.ACCOUNTANT.subLink,
      loginEmail: roles.ACCOUNTANT.email,
      password: roles.ACCOUNTANT.password,
    },
    {
      id: `emp-${id}-sales`,
      name: `مسؤول المبيعات (${input.nameAr})`,
      roleAr: roles.CASHIER.roleNameAr,
      roleEn: "CASHIER",
      subLink: roles.CASHIER.subLink,
      loginEmail: roles.CASHIER.email,
      password: roles.CASHIER.password,
    },
    {
      id: `emp-${id}-pur`,
      name: `مسؤول المشتريات (${input.nameAr})`,
      roleAr: roles.PURCHASER.roleNameAr,
      roleEn: "PURCHASER",
      subLink: roles.PURCHASER.subLink,
      loginEmail: roles.PURCHASER.email,
      password: roles.PURCHASER.password,
    },
    {
      id: `emp-${id}-aud`,
      name: `مدقق الحسابات (${input.nameAr})`,
      roleAr: roles.AUDITOR.roleNameAr,
      roleEn: "AUDITOR",
      subLink: roles.AUDITOR.subLink,
      loginEmail: roles.AUDITOR.email,
      password: roles.AUDITOR.password,
    },
  ];

  const newTenant: PreGeneratedTenant = {
    index: nextIndex,
    id,
    slug,
    name: input.nameAr,
    nameEn: input.nameEn || `${input.nameAr} (En)`,
    companyNameAr: input.nameAr,
    companyNameEn: input.nameEn || `${input.nameAr} (En)`,
    crNumber: input.crNumber || `CR-${Math.floor(100000 + Math.random() * 900000)}`,
    commercialReg: input.crNumber || `CR-${Math.floor(100000 + Math.random() * 900000)}`,
    taxNumber: input.taxNumber || `300${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    phone: input.phone || "+967 773 586 047",
    address: input.address || "المركز الرئيسي",
    city: input.city || "صنعاء / عدن",
    industry: input.industry || "تجارة عامة واستيراد",
    logo: `/logos/${slug}.png`,
    masterDomain: masterLink,
    vercelUrl: masterLink,
    status: "TRIAL",
    trialDaysRemaining: 7,
    operationsCount: 0,
    maxTrialOperations: 200,
    assignedAdminName: `${input.nameAr} (مسؤول النظام)`,
    assignedAdminPhone: input.phone,
    assignedAdminEmail: input.email,
    databaseNode: "PostgreSQL Local",
    unlockCode,
    roles,
    employees,
  };

  // Persist to custom registered list
  try {
    if (typeof window !== "undefined") {
      const existingRaw = localStorage.getItem(REGISTERED_TENANTS_KEY);
      const existingList: PreGeneratedTenant[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updatedList = [newTenant, ...existingList];
      localStorage.setItem(REGISTERED_TENANTS_KEY, JSON.stringify(updatedList));

      // Also ensure main directory list is refreshed
      const fullList = [newTenant, ...allCurrent];
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(fullList));
    }
  } catch (e) {
    console.error("Failed to persist newly registered tenant", e);
  }

  return newTenant;
}

/**
 * Updates a tenant's status, plan or generates a new unlock code
 */
export function updateStoredTenant(
  tenantId: string,
  updates: Partial<PreGeneratedTenant>
): PreGeneratedTenant | null {
  if (typeof window === "undefined") return null;
  try {
    const all = getStored200Tenants();
    const idx = all.findIndex((t) => t.id === tenantId || t.slug === tenantId);
    if (idx !== -1) {
      const updated = { ...all[idx], ...updates };
      all[idx] = updated;
      saveStored200Tenants(all);

      // Also update in registered list if present
      const regRaw = localStorage.getItem(REGISTERED_TENANTS_KEY);
      if (regRaw) {
        const regList: PreGeneratedTenant[] = JSON.parse(regRaw);
        const rIdx = regList.findIndex((t) => t.id === tenantId || t.slug === tenantId);
        if (rIdx !== -1) {
          regList[rIdx] = { ...regList[rIdx], ...updates };
          localStorage.setItem(REGISTERED_TENANTS_KEY, JSON.stringify(regList));
        }
      }
      return updated;
    }
  } catch (e) {
    console.error("Failed to update tenant", e);
  }
  return null;
}

/**
 * Robust tenant lookup by ID, slug, index or standard aliases
 */
export function findTenantById(tenantIdentifier: string | null | undefined): PreGeneratedTenant | null {
  if (!tenantIdentifier) return null;
  const clean = tenantIdentifier.toLowerCase().trim();

  // 0. High priority checks to prevent stale localStorage cache overrides for core enterprise tenants
  if (clean === "alzarqa" || clean === "zarqa" || clean === "az") {
    return preGeneratedTenants.find((t) => t.id === "alzarqa") || null;
  }
  if (clean === "bin-ziad" || clean === "binziyad" || clean === "binziad" || clean === "bz") {
    return preGeneratedTenants.find((t) => t.id === "bin-ziad" || t.id === "binziyad") || null;
  }
  if (clean === "company-1" || clean === "client-1" || clean === "alamal" || clean === "al-amal" || clean === "amal") {
    return preGeneratedTenants.find((t) => t.id === "company-1") || null;
  }
  if (clean === "company-2" || clean === "client-2" || clean === "alnoor" || clean === "al-noor") {
    return preGeneratedTenants.find((t) => t.id === "company-2") || null;
  }
  if (clean === "albadr" || clean === "albadr-pharma-2026" || clean === "badr" || clean === "client-albadr") {
    return preGeneratedTenants.find((t) => t.id === "albadr-pharma-2026") || null;
  }

  // 1. Check stored/registered tenants (dynamic state for custom user-registered tenants)
  const storedList = getStored200Tenants();
  let found = storedList.find((t) => t.id.toLowerCase() === clean || t.slug.toLowerCase() === clean);
  if (found) return found;

  // 2. Check in-memory preGeneratedTenants
  const allTenants = preGeneratedTenants;

  found = allTenants.find((t) => t.id.toLowerCase() === clean || t.slug.toLowerCase() === clean);
  if (found) return found;

  // Check aliases
  if (clean === "alzarqa" || clean === "zarqa" || clean === "az") {
    return allTenants.find((t) => t.id === "alzarqa") || null;
  }
  if (clean === "bin-ziad" || clean === "binziyad" || clean === "binziad" || clean === "bz") {
    return allTenants.find((t) => t.id === "bin-ziad" || t.id === "binziyad") || null;
  }
  if (clean === "albadr" || clean === "albadr-pharma-2026" || clean === "badr" || clean === "client-albadr") {
    return allTenants.find((t) => t.id === "albadr-pharma-2026") || null;
  }
  if (clean === "company-1" || clean === "client-1" || clean === "alamal" || clean === "al-amal" || clean === "amal") {
    return allTenants.find((t) => t.id === "company-1") || null;
  }
  if (clean === "company-2" || clean === "client-2" || clean === "alnoor" || clean === "al-noor") {
    return allTenants.find((t) => t.id === "company-2") || null;
  }
  if (clean === "company-3" || clean === "client-3" || clean === "alqimma" || clean === "al-qimma") {
    return allTenants.find((t) => t.id === "company-3") || null;
  }

  // Check numerical pattern e.g. "1" -> "company-1"
  if (/^\d+$/.test(clean)) {
    const num = parseInt(clean, 10);
    found = storedList.find((t) => t.index === num || t.id === `company-${num}`) ||
            allTenants.find((t) => t.index === num || t.id === `company-${num}`);
    if (found) return found;
  }

  // Check "company_X" or "companyX"
  const match = clean.match(/^company[_-]?(\d+)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    found = storedList.find((t) => t.index === num || t.id === `company-${num}`) ||
            allTenants.find((t) => t.index === num || t.id === `company-${num}`);
    if (found) return found;
  }

  // Check matching by name (Arabic or English)
  found = storedList.find((t) => 
    (t.name && t.name.toLowerCase().trim() === clean) || 
    (t.companyNameAr && t.companyNameAr.toLowerCase().trim() === clean) ||
    (t.nameEn && t.nameEn.toLowerCase().trim() === clean)
  ) || allTenants.find((t) => 
    (t.name && t.name.toLowerCase().trim() === clean) || 
    (t.companyNameAr && t.companyNameAr.toLowerCase().trim() === clean) ||
    (t.nameEn && t.nameEn.toLowerCase().trim() === clean)
  );
  if (found) return found;

  return null;
}

/**
 * Generate a deterministic or randomized sovereign unlock code for a tenant
 */
export function generateTenantUnlockCode(tenantIdOrSlug: string): string {
  const clean = (tenantIdOrSlug || "TENANT").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `MEDO-VIP-ACTIVATE-${clean}-2026`;
}

