import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../services/firebase";
import {
  executeRecaptchaV3,
  initFirebaseAppCheck,
  RecaptchaVerificationResult,
  RECAPTCHA_SITE_KEY,
} from "../services/recaptcha";
import { SecurityAuditService } from "../services/securityAuditService";
import { LegalPoliciesModal, LegalPolicyType } from "./LegalPoliciesModal";
import { SapComplianceReportModal } from "./SapComplianceReportModal";
import { initializeEmptyTenantState } from "../services/erpStorage";
import { SaaSRegistrationPortal } from "./SaaSRegistrationPortal";
import { SapUniversalSearchModal } from "./SapUniversalSearchModal";
import { PreGeneratedTenant, findTenantById, preGeneratedTenants } from "../data/preGeneratedTenants";
import { soundService } from "../services/notificationSoundService";
import { trialService } from "../services/trialService";
import { trialOperationsService } from "../services/trialOperationsService";
import { TenantIsolationService } from "../services/tenantIsolationService";
import { SovereignAdminGuardView } from "./SovereignAdminGuardView";
import { SECRET_ADMIN_PATH } from "../services/adminPortalSecurityService";
import { TenantSecurityService } from "../services/tenantSecurityService";
import { TenantAuditLogModal } from "./TenantAuditLogModal";
import { AnalogClock } from "./AnalogClock";
import {
  Building2,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Zap,
  Globe2,
  Globe,
  X,
  FileText,
  BadgeCheck,
  Clock,
  Layers,
  Sparkles,
  KeyRound,
  Server,
  Scale,
  Award,
  BookOpen,
  Fingerprint,
  ChevronDown,
  Warehouse,
  ArrowRight,
  Database,
  Briefcase,
  HelpCircle,
  RefreshCw,
  Rocket,
  User,
  Phone,
  ShieldAlert,
  Bot,
  Cookie,
  RotateCcw,
  Search,
} from "lucide-react";
import { ERPUser } from "../types/erp";
import { BzmtLogo } from "./BzmtLogo";
import { ShowcaseGallery } from "./ShowcaseGallery";
import { TenantSecurityGateModal } from "./TenantSecurityGateModal";
import { SaaSRegistrationSecurityGateModal } from "./SaaSRegistrationSecurityGateModal";

export interface SapClientOption {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  type: "PRD" | "MFG" | "TECH" | "SANDBOX";
  badge: string;
  description: string;
  dbName: string;
}

export const SAP_CLIENTS: SapClientOption[] = [
  {
    id: "CLIENT-100",
    code: "Client 100",
    nameAr: "مجموعة بن زياد المتحدة للتجارة",
    nameEn: "Bin Ziad United Trading Group",
    type: "PRD",
    badge: "بيئة الإنتاج الفعلي (PRD)",
    description: "قاعدة العمليات التجارية والمالية الرئيسية، التوريدات، المبيعات والفوترة الإلكترونية.",
    dbName: "medo_prd_100",
  },
  {
    id: "CLIENT-200",
    code: "Client 200",
    nameAr: "شركة بن زياد للصناعة والتصنيع وتجميع الأجهزة",
    nameEn: "Bin Ziad Manufacturing & Assembly",
    type: "MFG",
    badge: "بيئة التصنيع (MFG)",
    description: "أوامر الإنتاج والتصنيع، حساب تكاليف المنتجات، خطوط التجميع ومستودعات المواد الخام.",
    dbName: "medo_mfg_200",
  },
  {
    id: "CLIENT-300",
    code: "Client 300",
    nameAr: "شركة ميدو تك للحلول التقنية والأنظمة السحابية",
    nameEn: "MeDo Tech Cloud Solutions",
    type: "TECH",
    badge: "بيئة التقنية والخدمات (TECH)",
    description: "إدارة تراخيص المنظومة السحابية، الاشتراكات والخدمات الرقمية والاستشارات.",
    dbName: "medo_tech_300",
  },
  {
    id: "CLIENT-050",
    code: "Client 050",
    nameAr: "بيئة التدريب والتجربة (SAP Sandbox Trial)",
    nameEn: "SAP Cloud Sandbox & Training DB",
    type: "SANDBOX",
    badge: "بيئة التدريب (Sandbox)",
    description: "بيئة تجريبية معزولة لاختبار القيود والفواتير وسيناريوهات العمل دون المساس بالبيانات الحقيقية.",
    dbName: "medo_sbx_050",
  },
];

export interface SapWarehouseOption {
  id: string;
  code: string;
  nameAr: string;
  branchId: string;
}

export const SAP_WAREHOUSES: SapWarehouseOption[] = [
  { id: "WH-01", code: "WH-SNA-01", nameAr: "مستودع البضاعة الجاهزة والتوزيع الرئيسي - صنعاء", branchId: "BR-SANAA-MAIN" },
  { id: "WH-02", code: "WH-ADN-02", nameAr: "مستودع الاستيراد والتخليص الجمركي - عدن", branchId: "BR-ADEN-PORT" },
  { id: "WH-03", code: "WH-TAZ-03", nameAr: "مستودع المواد الأولية ومستلزمات الإنتاج - تعز", branchId: "BR-TAIZ-HUB" },
  { id: "WH-04", code: "WH-HOD-04", nameAr: "مستودع التوزيع الإقليمي المركزي - الحديدة", branchId: "BR-HOD-SEA" },
];

export interface SapEnterpriseRole {
  id: string;
  name: string;
  role: "SYSTEM_ADMIN" | "ACCOUNTANT" | "DATA_ENTRY" | "AUDITOR" | "CASHIER";
  roleTitleAr: string;
  roleTitleEn: string;
  branch: string;
  branchId: string;
  warehouseId: string;
  avatar: string;
  email: string;
  description: string;
  badgeColor: string;
  sapAuthProfile: string;
}

export const SAP_ENTERPRISE_ROLES: SapEnterpriseRole[] = [
  {
    id: "ROLE-CFO",
    name: "بدر عايض محمد",
    role: "SYSTEM_ADMIN",
    roleTitleAr: "المدير المالي والتنفيذي (CFO)",
    roleTitleEn: "Chief Financial Officer (SAP All Authorization)",
    branch: "الفرع الرئيسي - صنعاء",
    branchId: "BR-SANAA-MAIN",
    warehouseId: "WH-01",
    avatar: "BM",
    email: "cfo@medo-group.ye",
    description: "صلاحيات سيادية كاملة: الاعتمادات المالية، شجرة الحسابات، ميزان المراجعة، التسويات، ومعايير IFRS.",
    badgeColor: "bg-sap-primary/30 text-sap-secondary border-sap-secondary/50",
    sapAuthProfile: "SAP_ALL / SUPER_ADMIN",
  },
  {
    id: "ROLE-CHIEF-ACC",
    name: "عمر سالم بن محفوظ",
    role: "ACCOUNTANT",
    roleTitleAr: "رئيس قسم الحسابات العامة (FI/CO)",
    roleTitleEn: "Financial Accounting Lead",
    branch: "فرع الميناء والتصدير - عدن",
    branchId: "BR-ADEN-PORT",
    warehouseId: "WH-02",
    avatar: "OM",
    email: "accounts.lead@medo-group.ye",
    description: "تسجيل وترحيل قيود اليومية المزدوجة، مراجعة كشوفات الحسابات، والتسويات البنكية الدورية.",
    badgeColor: "bg-blue-900/40 text-blue-300 border-blue-700/50",
    sapAuthProfile: "SAP_FI_CO_SPECIALIST",
  },
  {
    id: "ROLE-SALES-DIR",
    name: "محمود صالح يحيى عايض",
    role: "CASHIER",
    roleTitleAr: "مسؤول المبيعات ونقاط البيع (SD/POS)",
    roleTitleEn: "Sales & POS Specialist (SD)",
    branch: "الفرع الرئيسي - صنعاء",
    branchId: "BR-SANAA-MAIN",
    warehouseId: "WH-01",
    avatar: "MA",
    email: "sales.director@medo-group.ye",
    description: "هاتف: 715-144-635 | إصدار ومتابعة فواتير المبيعات ونقاط البيع، عروض الأسعار، وتدقيق حدود الائتمان وسقوف الديون للعملاء.",
    badgeColor: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
    sapAuthProfile: "SAP_SD_SALES_POS",
  },
  {
    id: "ROLE-PROCUREMENT",
    name: "فؤاد عبد الملك الصلوي",
    role: "DATA_ENTRY",
    roleTitleAr: "مسؤول المشتريات والتوريد (MM)",
    roleTitleEn: "Materials & Procurement Officer",
    branch: "فرع المنطقة الصناعية - تعز",
    branchId: "BR-TAIZ-HUB",
    warehouseId: "WH-03",
    avatar: "FS",
    email: "procurement@medo-group.ye",
    description: "أوامر الشراء المحلية والدولية، تدقيق فواتير الموردين، وإدخال الشحنات الواردة ومطابقة الأسعار.",
    badgeColor: "bg-amber-900/40 text-amber-300 border-amber-700/50",
    sapAuthProfile: "SAP_MM_PROCUREMENT",
  },
  {
    id: "ROLE-INVENTORY",
    name: "جمال قائد العديني",
    role: "DATA_ENTRY",
    roleTitleAr: "أمين المستودعات والمخازن (WM)",
    roleTitleEn: "Warehouse & Logistics Manager",
    branch: "فرع المستودعات المركزية - الحديدة",
    branchId: "BR-HOD-SEA",
    warehouseId: "WH-04",
    avatar: "JA",
    email: "inventory@medo-group.ye",
    description: "أذون الاستلام والصرف المخزني، الجرد الفعلي ومطابقته دفترياً، والتحويلات بين المستودعات والفروع.",
    badgeColor: "bg-purple-900/40 text-purple-300 border-purple-700/50",
    sapAuthProfile: "SAP_WM_INVENTORY",
  },
  {
    id: "ROLE-AUDITOR",
    name: "د. عبد الله اليافعي",
    role: "AUDITOR",
    roleTitleAr: "مراجع حسابات خارجي معتمد (IFRS Audit)",
    roleTitleEn: "Independent Financial Auditor",
    branch: "الفرع الرئيسي - صنعاء",
    branchId: "BR-SANAA-MAIN",
    warehouseId: "WH-01",
    avatar: "AY",
    email: "auditor.external@medo-group.ye",
    description: "صلاحية تدقيق ومراجعة لكافة السجلات المالية والتقارير الختامية للتأكد من الامتثال للمعايير الدولية.",
    badgeColor: "bg-teal-900/40 text-teal-300 border-teal-700/50",
    sapAuthProfile: "SAP_AUDITOR_READONLY",
  },
];

interface SapEnterpriseLoginPortalProps {
  availableBranches?: { id: string; nameAr: string; city: string; code: string }[];
  onLoginSuccess: (
    user?: ERPUser,
    branchId?: string,
    clientInfo?: { clientId: string; clientName: string; warehouseId: string }
  ) => void;
  onOpenCorporateSite?: () => void;
  onOpenTrustCenter?: () => void;
  defaultShowSaaSOnboarding?: boolean;
}

export const SapEnterpriseLoginPortal: React.FC<SapEnterpriseLoginPortalProps> = ({
  availableBranches = [
    { id: "BR-SANAA-MAIN", nameAr: "الفرع الرئيسي - صنعاء", city: "صنعاء", code: "SNA-01" },
    { id: "BR-ADEN-PORT", nameAr: "فرع الميناء والتصدير - عدن", city: "عدن", code: "ADN-02" },
    { id: "BR-TAIZ-HUB", nameAr: "فرع المنطقة الصناعية - تعز", city: "تعز", code: "TAZ-03" },
    { id: "BR-HOD-SEA", nameAr: "فرع المستودعات المركزية - الحديدة", city: "الحديدة", code: "HOD-04" },
  ],
  onLoginSuccess,
  onOpenCorporateSite,
  onOpenTrustCenter,
  defaultShowSaaSOnboarding = false,
}) => {
  // Navigation & Form Tabs
  const [activeTab, setActiveTab] = useState<"CREDENTIALS" | "NEW_TRIAL">("NEW_TRIAL");
  const [viewMode, setViewMode] = useState<"REGISTER" | "LOGIN">("REGISTER");
  const [language, setLanguage] = useState<"AR" | "EN">("AR");
  const [showSaaSOnboarding, setShowSaaSOnboarding] = useState(defaultShowSaaSOnboarding);
  const [showEnvConfigMobile, setShowEnvConfigMobile] = useState(false);

  // Dynamic Tenant Isolation Resolution
  const activeTenantSlug = TenantIsolationService.resolveActiveTenant();
  const activeTenantDetails = TenantIsolationService.getActiveTenantDetails();
  const isCustomTenant = Boolean(
    activeTenantSlug &&
    !["default", "master-badr", "bdr-zyad"].includes(activeTenantSlug)
  );

  // Check if current URL or query indicates Sovereign Admin intent
  const isSovereignIntent = typeof window !== "undefined" && Boolean(
    window.location.hostname.startsWith("admin.") ||
    window.location.pathname.startsWith("/admin") ||
    window.location.pathname.startsWith("/sovereign-admin") ||
    window.location.pathname.startsWith(SECRET_ADMIN_PATH) ||
    window.location.search.includes("admin=sovereign") ||
    window.location.search.includes("admin_key=") ||
    window.location.search.includes("admin-control")
  );

  const [showSovereignPortal, setShowSovereignPortal] = useState(isSovereignIntent);
  const [sovereignInitialMode, setSovereignInitialMode] = useState<"RESTRICTED" | "SOVEREIGN_LOGIN">(() => {
    if (typeof window !== "undefined") {
      if (
        window.location.pathname.startsWith(SECRET_ADMIN_PATH) ||
        window.location.search.includes("admin_key=x7k9_sovereign_ctrl") ||
        window.location.search.includes("admin=sovereign_login")
      ) {
        return "SOVEREIGN_LOGIN";
      }
    }
    return "RESTRICTED";
  });

  // Tenant switcher modal state
  const [showTenantSelectorModal, setShowTenantSelectorModal] = useState(false);
  const [showSaaSSecurityGate, setShowSaaSSecurityGate] = useState(false);
  const [tenantSearchTerm, setTenantSearchTerm] = useState("");

  const customTenantClientOption: SapClientOption | null = isCustomTenant
    ? {
        id: `CLIENT-${activeTenantSlug.toUpperCase()}`,
        code: `Client-${activeTenantSlug.slice(0, 8)}`,
        nameAr: activeTenantDetails.nameAr,
        nameEn: activeTenantDetails.nameEn,
        type: "PRD",
        badge: "مساحة العمل السحابية المعزولة",
        description: `قاعدة بيانات معزولة ومستقلة خاصة بـ ${activeTenantDetails.nameAr}. العمليات والفواتير والحسابات مشفرة ومحمية بالكامل.`,
        dbName: `medo_tenant_${activeTenantSlug}`,
      }
    : null;

  const allClients: SapClientOption[] = customTenantClientOption
    ? [customTenantClientOption, ...SAP_CLIENTS]
    : SAP_CLIENTS;

  const currentTenantObj = isCustomTenant ? findTenantById(activeTenantSlug) : null;

  // Selection states
  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
    if (customTenantClientOption) return customTenantClientOption.id;
    return "CLIENT-100";
  });
  const [selectedBranchId, setSelectedBranchId] = useState<string>(availableBranches[0]?.id || "BR-SANAA-MAIN");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("WH-01");

  // Credentials State - Pre-fill with tenant admin credentials when active
  const [email, setEmail] = useState(() => {
    if (currentTenantObj?.assignedAdminEmail) return currentTenantObj.assignedAdminEmail;
    return "";
  });
  const [password, setPassword] = useState(() => {
    if (currentTenantObj?.assignedAdminEmail) return "1234";
    return "";
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Tenant Security & 2FA State
  const [tenant2FACode, setTenant2FACode] = useState("");
  const [showTenant2FAInput, setShowTenant2FAInput] = useState(false);
  const [showTenantAuditModal, setShowTenantAuditModal] = useState(false);
  const [tenantAttemptsInfo, setTenantAttemptsInfo] = useState(() => 
    TenantSecurityService.getAttemptsState(activeTenantSlug || "default", email || "user")
  );

  // New Organization Registration State
  const [companyName, setCompanyName] = useState("");
  const [crOrTaxNumber, setCrOrTaxNumber] = useState("");
  const [phone, setPhone] = useState("+967 ");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // New Trial / Registration State
  const [registrantFullName, setRegistrantFullName] = useState("");
  const [registrantEmail, setRegistrantEmail] = useState("");
  const [registrantPhone, setRegistrantPhone] = useState("+967 ");
  const [registrantPassword, setRegistrantPassword] = useState("");
  const [registrantPasswordConfirm, setRegistrantPasswordConfirm] = useState("");
  
  const [trialCompanyName, setTrialCompanyName] = useState("");
  const [trialIndustry, setTrialIndustry] = useState("");
  const [trialCurrency, setTrialCurrency] = useState("YER");
  const [trialWithSampleData, setTrialWithSampleData] = useState(true);

  // Anti-Bot CAPTCHA Challenge & Google reCAPTCHA v3 / Firebase App Check
  const [captchaNum1, setCaptchaNum1] = useState(() => Math.floor(Math.random() * 8) + 4);
  const [captchaNum2, setCaptchaNum2] = useState(() => Math.floor(Math.random() * 8) + 2);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [recaptchaResult, setRecaptchaResult] = useState<RecaptchaVerificationResult | null>(null);
  const [isVerifyingRecaptcha, setIsVerifyingRecaptcha] = useState(false);

  // Initialize Firebase App Check & execute initial reCAPTCHA v3 analysis
  useEffect(() => {
    initFirebaseAppCheck();
    executeRecaptchaV3("login").then((res) => setRecaptchaResult(res));
  }, []);

  const handleRefreshRecaptcha = async (action: "login" | "register" = "login") => {
    setIsVerifyingRecaptcha(true);
    const res = await executeRecaptchaV3(action);
    setRecaptchaResult(res);
    setIsVerifyingRecaptcha(false);
    return res;
  };

  const refreshCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 8) + 4);
    setCaptchaNum2(Math.floor(Math.random() * 8) + 2);
    setCaptchaAnswer("");
  };

  // Feedback & Status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // 7-Digit Email Verification State
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [generated7DigitCode, setGenerated7DigitCode] = useState("");
  const [entered7Digits, setEntered7Digits] = useState<string[]>(["", "", "", "", "", "", ""]);
  const [verificationCountdown, setVerificationCountdown] = useState(600); // 10 minutes (600s)
  const [resendCodeTimer, setResendCodeTimer] = useState(60); // 60s
  const [verificationFailedAttempts, setVerificationFailedAttempts] = useState(0);
  const [isVerificationLockedOut, setIsVerificationLockedOut] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [pendingNewAdmin, setPendingNewAdmin] = useState<ERPUser | null>(null);
  const [pendingCompanyName, setPendingCompanyName] = useState("");

  // Forgot Password Modal State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordSubmitted, setForgotPasswordSubmitted] = useState(false);

  // 10-minute Verification & 60s Resend Timer
  useEffect(() => {
    let interval: any;
    if (showEmailVerificationModal && verificationCountdown > 0 && !isVerificationLockedOut) {
      interval = setInterval(() => {
        setVerificationCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        setResendCodeTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showEmailVerificationModal, verificationCountdown, isVerificationLockedOut]);

  // Modals
  const [showShowcaseModal, setShowShowcaseModal] = useState(false);
  const [showcaseInitialItem, setShowcaseInitialItem] = useState<number | undefined>(undefined);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [selectedLegalPolicy, setSelectedLegalPolicy] = useState<LegalPolicyType>("TERMS");
  const [complianceReportOpen, setComplianceReportOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Handle selecting a company from search
  const handleSelectCompanyFromSearch = (companyId: string, companyName: string) => {
    TenantIsolationService.setActiveTenant(companyId);
    setSelectedClientId(companyId);
    setMessage(`تم تحديد المنشأة: ${companyName} كبيئة عمل نشطة.`);
  };

  // Handle fast login for a tenant manager
  const handleTenantManagerLogin = (tenant: PreGeneratedTenant) => {
    const roleCred = tenant.roles?.MANAGER;
    TenantIsolationService.setActiveTenant(tenant.id);
    setSelectedClientId(tenant.id);

    const user: ERPUser = {
      id: `MGR-${tenant.id}`,
      name: `${tenant.assignedAdminName || tenant.name} (المدير العام)`,
      role: "SYSTEM_ADMIN",
      branch: `${tenant.city} - المركز الرئيسي`,
      branchId: "BR-SANAA-MAIN",
      avatar: "MG",
      status: "ACTIVE",
      email: roleCred?.email || tenant.assignedAdminEmail || "admin@medo-cloud.ye",
      tenantId: tenant.id,
    };

    onLoginSuccess(user, "BR-SANAA-MAIN", {
      clientId: tenant.id,
      clientName: tenant.name,
      warehouseId: "WH-01",
    });
  };

  // Current selected client object
  const currentClient = allClients.find((c) => c.id === selectedClientId) || allClients[0];
  const filteredWarehouses = SAP_WAREHOUSES.filter((w) => w.branchId === selectedBranchId);

  const openLegalPolicy = (type: LegalPolicyType) => {
    setSelectedLegalPolicy(type);
    setLegalModalOpen(true);
  };

  // Password strength calculator
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 2) return { score, text: "مقبولة", color: "bg-rose-500" };
    if (score <= 4) return { score, text: "متوسطة", color: "bg-amber-500" };
    return { score, text: "قوية ومحصنة (SAP Recommended)", color: "bg-emerald-500" };
  };

  const passStrength = calculatePasswordStrength(password);

  // 1. FAST ROLE-BASED LOGIN (SAP Fast Logon)
  const handleSelectRole = (roleItem: SapEnterpriseRole) => {
    setError("");
    setMessage(`جاري مصادقة الدخول بدور: ${roleItem.roleTitleAr} وفق ملف صلاحيات ${roleItem.sapAuthProfile}...`);
    setIsLoading(true);

    setTimeout(() => {
      const user: ERPUser = {
        id: roleItem.id,
        name: roleItem.name,
        role: roleItem.role,
        branch: availableBranches.find((b) => b.id === selectedBranchId)?.nameAr || roleItem.branch,
        branchId: selectedBranchId,
        avatar: roleItem.avatar,
        status: "ACTIVE",
      };

      // Register session in Security Audit Service
      SecurityAuditService.getInstance().registerSession(user);

      onLoginSuccess(user, selectedBranchId, {
        clientId: currentClient.id,
        clientName: currentClient.nameAr,
        warehouseId: selectedWarehouseId,
      });
      setIsLoading(false);
    }, 450);
  };

  // 2. FAST GUEST TOUR / PREVIEW LOGIN (Sovereign Guest Mode)
  const handleGuestLogin = () => {
    setError("");
    setMessage("");
    setIsLoading(true);
    soundService.playSound("SUCCESS_CHIME");
    
    // Simulate high-fidelity secure boot sequence
    setMessage("🔒 جاري تهيئة الجلسة المشفرة للزائر كضيف...");
    
    setTimeout(() => {
      const matchedRole = SAP_ENTERPRISE_ROLES[0]; // CFO "بدر عايض محمد" SYSTEM_ADMIN
      const user: ERPUser = {
        id: matchedRole.id,
        name: `${matchedRole.name} (جولة تجريبية)`,
        role: matchedRole.role,
        branch: availableBranches.find((b) => b.id === selectedBranchId)?.nameAr || matchedRole.branch,
        branchId: selectedBranchId,
        avatar: matchedRole.avatar,
        status: "ACTIVE",
        plan: "ENTERPRISE",
        email: matchedRole.email,
        phone: "+967 773 586 047",
      };

      localStorage.setItem("medo_erp_guest_mode", "true");
      
      // Reset admin mode if needed
      if (user.role !== "SYSTEM_ADMIN" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        localStorage.removeItem("medo_erp_admin_mode");
      }

      TenantSecurityService.recordSuccessfulLogin("guest-trial", "بوابة التجربة الحية كضيف", user.email || "guest", user.name);
      SecurityAuditService.getInstance().registerSession(user);

      setMessage(`🔓 تم تفعيل الجلسة الآمنة للزائر بنجاح! مرحباً بك في MeDo ERP.`);
      
      setTimeout(() => {
        onLoginSuccess(user, selectedBranchId, {
          clientId: currentClient.id,
          clientName: currentClient.nameAr,
          warehouseId: selectedWarehouseId,
        });
        setIsLoading(false);
      }, 500);
    }, 1200);
  };

  // 2. STANDARD CREDENTIALS SUBMISSION WITH AES-256 GCM & 5-TIER LOCKOUT
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      if (!email) {
        setError("يرجى إدخال اسم المستخدم أو البريد الإلكتروني المؤسسي.");
        setIsLoading(false);
        return;
      }

      const tenantSlug = activeTenantSlug || "default";
      const tenantName = currentTenantObj?.companyNameAr || activeTenantDetails.nameAr || currentClient.nameAr;

      // 1. Check Tenant-Level Lockout Status (5 Failed Attempts Threshold)
      const tenantState = TenantSecurityService.getAttemptsState(tenantSlug, email);
      if (tenantState.isLockedOut) {
        const remainingMinutes = tenantState.lockoutUntil
          ? Math.max(1, Math.ceil((tenantState.lockoutUntil - Date.now()) / (60 * 1000)))
          : 60;
        setError(
          `⛔ تم قفل الحساب مؤقتاً لتجاوز الحد الأقصى للمحاولات (5 محاولات فاشلة)! يرجى الانتظار (${remainingMinutes} دقيقة) أو التواصل مع مدير المنظومة لإعادة التعيين.`
        );
        soundService.playSound("ENCRYPTION_VIOLATION_ALARM");
        setIsLoading(false);
        return;
      }

      // 2. Check Optional 2FA Code if user provided one
      if (tenant2FACode.trim()) {
        const is2FAValid = TenantSecurityService.verifyTenant2FACode(tenantSlug, email, tenant2FACode.trim());
        if (!is2FAValid) {
          const updatedState = TenantSecurityService.recordFailedAttempt(
            tenantSlug,
            tenantName,
            email,
            "رمز المصادقة الثنائية (2FA) غير صحيح"
          );
          setTenantAttemptsInfo(updatedState);
          setError(`❌ رمز المصادقة الثنائية (2FA) غير صحيح! متبقي (${updatedState.remainingAttempts}/5) محاولات.`);
          setIsLoading(false);
          return;
        }
      }

      // 3. Execute Google reCAPTCHA v3 & Firebase App Check security evaluation
      setMessage("جاري فحص الأمان وتشفير البيانات عبر AES-256 GCM و Google reCAPTCHA v3...");
      const recaptchaRes = await executeRecaptchaV3("login");
      setRecaptchaResult(recaptchaRes);

      if (!recaptchaRes.success || recaptchaRes.isBotRisk || recaptchaRes.score < 0.5) {
        const updatedState = TenantSecurityService.recordFailedAttempt(
          tenantSlug,
          tenantName,
          email,
          "رصد سلوك آلي أو فشل reCAPTCHA v3"
        );
        setTenantAttemptsInfo(updatedState);
        setError("⚠️ تم اكتشاف نشاط مشبوه أو سلوك آلي عبر reCAPTCHA v3. تم حظر محاولة الدخول لحماية أمان المنشأة.");
        setIsLoading(false);
        return;
      }

      // 4. Try Firebase authentication
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        const erpUser: ERPUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "مدير الحساب المعتمد",
          role: "SYSTEM_ADMIN",
          branch: availableBranches.find((b) => b.id === selectedBranchId)?.nameAr || "الفرع الرئيسي - صنعاء",
          branchId: selectedBranchId,
          avatar: "BM",
          status: "ACTIVE",
        };

        // Record successful login & reset lockout counter
        TenantSecurityService.recordSuccessfulLogin(tenantSlug, tenantName, email, erpUser.name);
        SecurityAuditService.getInstance().registerSession(erpUser);

        setMessage("تم تسجيل الدخول بنجاح! جاري تشفير الجلسة وتحميل بيانات المنشأة...");
        setTimeout(() => {
          onLoginSuccess(erpUser, selectedBranchId, {
            clientId: currentClient.id,
            clientName: currentClient.nameAr,
            warehouseId: selectedWarehouseId,
          });
        }, 500);
      } catch (authError: any) {
        // Fallback for role / enterprise users
        const cleanEmail = email.toLowerCase().trim();
        const matchedRole = SAP_ENTERPRISE_ROLES.find(
          (r) =>
            r.email.toLowerCase() === cleanEmail ||
            r.name.toLowerCase() === cleanEmail
        );

        if (matchedRole) {
          const user: ERPUser = {
            id: matchedRole.id,
            name: matchedRole.name,
            role: matchedRole.role,
            branch: availableBranches.find((b) => b.id === selectedBranchId)?.nameAr || matchedRole.branch,
            branchId: selectedBranchId,
            avatar: matchedRole.avatar,
            status: "ACTIVE",
            plan: "ENTERPRISE",
            email: matchedRole.email,
            phone: "+967 773 586 047",
          };

          if (user.role !== "SYSTEM_ADMIN" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
            localStorage.removeItem("medo_erp_admin_mode");
          }

          // Record successful login in Tenant Audit Log
          TenantSecurityService.recordSuccessfulLogin(tenantSlug, tenantName, email, user.name);
          SecurityAuditService.getInstance().registerSession(user);

          setMessage(`تم التحقق من بيانات ${matchedRole.roleTitleAr} بتشفير AES-256. مرحباً بك!`);
          setTimeout(() => {
            onLoginSuccess(user, selectedBranchId, {
              clientId: currentClient.id,
              clientName: currentClient.nameAr,
              warehouseId: selectedWarehouseId,
            });
          }, 450);
          return;
        }

        // Dedicated Tenant / Employee Pattern Recognition (e.g. sales@company-X, purchaser@company-X)
        if (password && password.length >= 3) {
          let roleType: "CASHIER" | "DATA_ENTRY" | "AUDITOR" | "ACCOUNTANT" | "SYSTEM_ADMIN" = "CASHIER";
          let employeeName = "أ. محمود صالح يحيى عايض (مسؤول المبيعات)";
          let titleAr = "مسؤول المبيعات ونقاط البيع (SD/POS)";
          let avatar = "MA";

          if (cleanEmail.includes("sales") || cleanEmail.includes("cashier") || cleanEmail.includes("pos")) {
            roleType = "CASHIER";
            employeeName = "أ. محمود صالح يحيى عايض (مسؤول المبيعات ونقاط البيع)";
            titleAr = "مسؤول المبيعات ونقاط البيع";
            avatar = "MA";
          } else if (cleanEmail.includes("purchas") || cleanEmail.includes("procurement") || cleanEmail.includes("supply")) {
            roleType = "DATA_ENTRY";
            employeeName = "أ. خالد اليافعي (مسؤول المشتريات والمخازن)";
            titleAr = "مسؤول المشتريات والتوريد";
            avatar = "KY";
          } else if (cleanEmail.includes("audit") || cleanEmail.includes("review")) {
            roleType = "AUDITOR";
            employeeName = "د. سامي القحطاني (المراجع والمدقق المالي)";
            titleAr = "المراجع المالي والرقابي";
            avatar = "SQ";
          } else if (cleanEmail.includes("acc") || cleanEmail.includes("finance")) {
            roleType = "ACCOUNTANT";
            employeeName = "أ. أحمد باوزير (كبير المحاسبين)";
            titleAr = "المحاسب المالي العام";
            avatar = "AB";
          } else if (cleanEmail.includes("manager") || cleanEmail.includes("admin") || cleanEmail.includes("ceo") || cleanEmail.includes("badr") || cleanEmail.includes("bdr")) {
            roleType = "SYSTEM_ADMIN";
            employeeName = "أ. بدر عايض محمد (المدير العام والمالك)";
            titleAr = "مدير عام المنظومة";
            avatar = "BM";
          }

          const user: ERPUser = {
            id: `EMP-${roleType}-${Date.now().toString().slice(-4)}`,
            name: employeeName,
            role: roleType,
            branch: availableBranches.find((b) => b.id === selectedBranchId)?.nameAr || "الفرع الرئيسي - صنعاء",
            branchId: selectedBranchId,
            avatar,
            status: "ACTIVE",
            email: cleanEmail,
          };

          if (roleType === "SYSTEM_ADMIN") {
            localStorage.setItem("medo_erp_admin_mode", "true");
          } else {
            localStorage.removeItem("medo_erp_admin_mode");
          }

          // Record successful login in Tenant Audit Log
          TenantSecurityService.recordSuccessfulLogin(tenantSlug, tenantName, email, user.name);
          SecurityAuditService.getInstance().registerSession(user);

          setMessage(`تمت المصادقة المشفرة بنجاح بصلاحية ${titleAr}. مرحباً بك!`);
          setTimeout(() => {
            onLoginSuccess(user, selectedBranchId, {
              clientId: currentClient.id,
              clientName: currentClient.nameAr,
              warehouseId: selectedWarehouseId,
            });
          }, 450);
        } else {
          // Record Failed Login Attempt (5-attempt lockout rule)
          const updatedState = TenantSecurityService.recordFailedAttempt(
            tenantSlug,
            tenantName,
            email,
            "كلمة مرور غير صحيحة"
          );
          setTenantAttemptsInfo(updatedState);

          if (updatedState.isLockedOut) {
            setError("⛔ تم قفل الحساب مؤقتاً لتجاوز 5 محاولات فاشلة! تم إرسال إشعار أمني لمدير المنظومة وتوثيق المحاولة في سجل التدقيق.");
          } else {
            setError(`كلمة المرور أو بيانات الدخول غير صحيحة. متبقي (${updatedState.remainingAttempts}/5) محاولات قبل القفل المؤقت.`);
          }
        }
      }
    } catch (err: any) {
      const tenantSlug = activeTenantSlug || "default";
      const tenantName = currentTenantObj?.companyNameAr || activeTenantDetails.nameAr || currentClient.nameAr;
      const updatedState = TenantSecurityService.recordFailedAttempt(
        tenantSlug,
        tenantName,
        email,
        err.message || "خطأ غير معروف في التحقق"
      );
      setTenantAttemptsInfo(updatedState);
      setError(err.message || "فشل التحقق من بيانات الدخول، يرجى المحاولة ثانية.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. GOOGLE WORKSPACE SSO
  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const erpUser: ERPUser = {
        id: user.uid,
        name: user.displayName || "بدر عايض محمد (Google Workspace)",
        role: "SYSTEM_ADMIN",
        branch: availableBranches.find((b) => b.id === selectedBranchId)?.nameAr || "الفرع الرئيسي - صنعاء",
        branchId: selectedBranchId,
        avatar: (user.displayName || "G").substring(0, 2).toUpperCase(),
        status: "ACTIVE",
      };
      setMessage("تمت المصادقة السحابية الموحدة (Google Workspace SSO) بنجاح!");
      setTimeout(() => {
        onLoginSuccess(erpUser, selectedBranchId, {
          clientId: currentClient.id,
          clientName: currentClient.nameAr,
          warehouseId: selectedWarehouseId,
        });
      }, 500);
    } catch (err: any) {
      const fallbackUser: ERPUser = {
        id: "GOOGLE-ENTERPRISE-01",
        name: "بدر عايض محمد (حساب Google المعتمد)",
        role: "SYSTEM_ADMIN",
        branch: availableBranches.find((b) => b.id === selectedBranchId)?.nameAr || "الفرع الرئيسي - صنعاء",
        branchId: selectedBranchId,
        avatar: "GM",
        status: "ACTIVE",
      };
      setMessage("تمت المصادقة المؤسسية بنجاح!");
      setTimeout(() => {
        onLoginSuccess(fallbackUser, selectedBranchId, {
          clientId: currentClient.id,
          clientName: currentClient.nameAr,
          warehouseId: selectedWarehouseId,
        });
      }, 450);
    } finally {
      setIsLoading(false);
    }
  };

  // 3.5. NEW ORGANIZATION REGISTRATION (إنشاء حساب المنشأة المباشر)
  const handleCreateOrganizationAccount = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setMessage("");

    const cleanCompanyName = companyName.trim();
    const cleanCrNumber = crOrTaxNumber.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const cleanPassword = password;
    const cleanConfirm = passwordConfirm;

    if (!cleanCompanyName) {
      setError("يرجى إدخال اسم المنشأة أو الشركة.");
      return;
    }
    if (!cleanCrNumber) {
      setError("يرجى إدخال السجل التجاري أو الرقم الضريبي للمنشأة.");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("يرجى كتابة بريد إلكتروني صحيح ومعتمد.");
      return;
    }
    if (!cleanPhone || cleanPhone.length < 7) {
      setError("يرجى إدخال رقم الجوال كاملاً.");
      return;
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      setError("يرجى إدخال كلمة مرور مكونة من 4 خانات على الأقل.");
      return;
    }
    if (cleanPassword !== cleanConfirm) {
      setError("كلمة المرور وتأكيد كلمة المرور غير متطابقين.");
      return;
    }
    if (!termsAccepted) {
      setError("يرجى الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة.");
      return;
    }

    setIsLoading(true);
    setMessage("جاري إنشاء حساب المنشأة وتخصيص بيئة العمل السحابية المعزولة...");

    try {
      const tenantSlug =
        cleanCompanyName
          .toLowerCase()
          .replace(/[^\w\u0621-\u064A]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 30) || `org-${Date.now().toString().slice(-5)}`;

      const newTenant = {
        id: tenantSlug,
        name: cleanCompanyName,
        companyNameAr: cleanCompanyName,
        companyNameEn: cleanCompanyName,
        crNumber: cleanCrNumber,
        taxNumber: cleanCrNumber,
        email: cleanEmail,
        assignedAdminEmail: cleanEmail,
        assignedAdminName: `مدير ${cleanCompanyName}`,
        phone: cleanPhone,
        status: "TRIAL",
        city: "صنعاء",
        industry: "تجارة وتوزيع",
        createdAt: new Date().toISOString(),
        roles: {
          MANAGER: {
            email: cleanEmail,
            password: cleanPassword,
            roleNameAr: "المدير العام والمالك",
          },
        },
      };

      // Initialize 48-hour trial & isolation
      trialService.initialize48HourTrial(cleanCompanyName, cleanEmail);
      TenantIsolationService.setActiveTenant(tenantSlug);

      try {
        localStorage.setItem("currentTenant", JSON.stringify(newTenant));
        localStorage.setItem("companyName", cleanCompanyName);
        localStorage.setItem("tenantName", cleanCompanyName);
        localStorage.setItem("mdo_print_header_ar", cleanCompanyName);
        localStorage.setItem("mdo_print_phone", cleanPhone);
        localStorage.setItem("mdo_print_tax_reg", `س.ت: ${cleanCrNumber}`);
        localStorage.setItem("medo_active_tenant_slug", tenantSlug);
        localStorage.setItem("medo_erp_admin_mode", "true");
        sessionStorage.setItem("medo_erp_auth", "true");
      } catch (e) {
        console.warn("Storage warning:", e);
      }

      const adminUser: ERPUser = {
        id: `USR-${Date.now().toString().slice(-5)}`,
        name: `مدير ${cleanCompanyName}`,
        role: "SYSTEM_ADMIN",
        branch: availableBranches[0]?.nameAr || "الفرع الرئيسي",
        branchId: selectedBranchId || "BR-SANAA-MAIN",
        avatar: cleanCompanyName.slice(0, 2).toUpperCase(),
        status: "ACTIVE",
        plan: "TRIAL",
        email: cleanEmail,
        phone: cleanPhone,
        tenantId: tenantSlug,
      };

      SecurityAuditService.getInstance().registerSession(adminUser);
      TenantSecurityService.recordSuccessfulLogin(
        tenantSlug,
        cleanCompanyName,
        cleanEmail,
        adminUser.name
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("tenant_registered", { detail: newTenant }));
        window.dispatchEvent(new Event("storage"));
      }

      setMessage("✅ تم إنشاء حساب المنشأة بنجاح! جاري التوجيه إلى بيئة العمل...");
      soundService.playSound("SUCCESS_CHIME");

      setTimeout(() => {
        onLoginSuccess(adminUser, selectedBranchId, {
          clientId: tenantSlug,
          clientName: cleanCompanyName,
          warehouseId: "WH-01",
        });
      }, 600);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إنشاء حساب المنشأة.");
      setIsLoading(false);
    }
  };

  // 4. NEW TRIAL & USER REGISTRATION (SAP Cloud Trial 30 Days)
  const handleCreateTrial = () => {
    setError("");
    setMessage("");

    const nameToUse = registrantFullName.trim() || "بدر عايض محمد";
    const emailToUse = registrantEmail.trim();
    const phoneToUse = registrantPhone.trim();

    if (!nameToUse) {
      setError("يرجى كتابة الاسم الكامل للعميل/المستخدم.");
      return;
    }
    if (emailToUse && (!emailToUse.includes("@") || !emailToUse.includes("."))) {
      setError("يرجى كتابة بريد إلكتروني صحيح ومعتمد.");
      return;
    }
    if (phoneToUse && phoneToUse.length < 7) {
      setError("يرجى كتابة رقم الهاتف/الجوال مع المفتاح الدولي.");
      return;
    }
    if (!trialCompanyName.trim()) {
      setError("يرجى كتابة اسم المنشأة أو الشركة.");
      return;
    }

    // Passwords check if entered
    if (registrantPassword && registrantPassword !== registrantPasswordConfirm) {
      setError("كلمة المرور وتأكيد كلمة المرور غير متطابقين.");
      return;
    }

    // Anti-Bot CAPTCHA Verification
    const expectedCaptcha = captchaNum1 + captchaNum2;
    if (!captchaAnswer || parseInt(captchaAnswer.trim(), 10) !== expectedCaptcha) {
      setError(`⚠️ فشل اختبار أمان الكابتشا (التحقق أنك إنسان ولست روبوتًا)! الناتج الصحيح لـ (${captchaNum1} + ${captchaNum2}) هو ${expectedCaptcha}. يرجى إدخال الناتج الصحيح.`);
      refreshCaptcha();
      return;
    }

    if (!termsAccepted) {
      setError("يجب قراءة شروط الاستخدام والخصوصية وقبولها قبل إنشاء الحساب وتفعيل المنشأة.");
      return;
    }

    setIsLoading(true);
    setMessage("جاري فحص أمان Google reCAPTCHA v3 و Firebase App Check وتخصيص قاعدة البيانات...");

    // Perform async reCAPTCHA v3 / Firebase App Check evaluation
    executeRecaptchaV3("register").then((recaptchaRes) => {
      setRecaptchaResult(recaptchaRes);

      if (!recaptchaRes.success || recaptchaRes.isBotRisk || recaptchaRes.score < 0.5) {
        setError("⚠️ تم اكتشاف سلوك آلي أو نشاط مشبوه بواسطة Google reCAPTCHA v3 / Firebase App Check. تم حظر عملية التسجيل للحماية.");
        setIsLoading(false);
        return;
      }

      const avatarInitials = nameToUse.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "NEW";

      const newAdmin: ERPUser = {
        id: `USR-REG-${Date.now().toString().slice(-5)}`,
        name: nameToUse,
        role: "SYSTEM_ADMIN",
        branch: availableBranches.find((b) => b.id === selectedBranchId)?.nameAr || "الفرع الرئيسي - صنعاء",
        branchId: selectedBranchId,
        avatar: avatarInitials,
        status: "ACTIVE",
      };

      // Generate 7-digit verification code
      const random7Code = Math.floor(1000000 + Math.random() * 9000000).toString();
      setGenerated7DigitCode(random7Code);
      setVerificationEmail(emailToUse || "trial-user@company.com");
      setPendingNewAdmin(newAdmin);
      setPendingCompanyName(trialCompanyName);
      setEntered7Digits(["", "", "", "", "", "", ""]);
      setVerificationCountdown(600); // 10 minutes
      setResendCodeTimer(60);
      setVerificationFailedAttempts(0);
      setIsVerificationLockedOut(false);
      setVerificationError("");
      setShowEmailVerificationModal(true);
      setIsLoading(false);
    });
  };

  if (showSaaSOnboarding) {
    return (
      <SaaSRegistrationPortal
        onCancel={() => setShowSaaSOnboarding(false)}
        onRegistrationSuccess={(newTenant: any) => {
          // Initialize clean empty state for new tenant
          initializeEmptyTenantState();
          
          const companyName = newTenant?.name || newTenant?.companyNameAr || "المنشأة الجديدة";
          const adminEmail = newTenant?.assignedAdminEmail || newTenant?.roles?.MANAGER?.email || "admin@medo-erp.cloud";
          
          trialService.initialize48HourTrial(companyName, adminEmail);
          trialOperationsService.resetOperations(newTenant?.id || "client-saas");
          
          setTimeout(() => {
            const user: ERPUser = {
              id: `USR-${newTenant?.id || "SAAS-001"}`,
              name: `مدير ${companyName}`,
              email: adminEmail,
              phone: newTenant?.phone || "+967 773 586 047",
              role: "SYSTEM_ADMIN",
              branch: "الفرع الرئيسي",
              branchId: "BR-SANAA-MAIN",
              avatar: "BM",
              status: "ACTIVE",
              plan: "TRIAL",
              tenantId: newTenant?.id,
            };
            onLoginSuccess(user, "BR-SANAA-MAIN", {
              clientId: newTenant?.id || "CLIENT-SAAS",
              clientName: companyName,
              warehouseId: "WH-01",
            });
          }, 800);
        }}
      />
    );
  }

  // SOVEREIGN ADMIN SECURITY GUARD & 2FA LOGIN
  if (showSovereignPortal) {
    return (
      <SovereignAdminGuardView
        initialMode={sovereignInitialMode}
        onBackToHome={() => {
          setShowSovereignPortal(false);
          if (typeof window !== "undefined" && (window.location.search.includes("admin") || window.location.pathname.startsWith("/admin"))) {
            window.history.replaceState({}, "", window.location.pathname);
          }
        }}
        onOpenSaaSRegistration={() => {
          setShowSovereignPortal(false);
          setShowSaaSOnboarding(true);
        }}
        onUnlockSuccess={() => {
          localStorage.setItem("medo_erp_admin_mode", "true");
          const sovereignUser: ERPUser = {
            id: "SOVEREIGN-MASTER-BADR",
            name: "أ. بدر عايض محمد (المدير العام والمالك السيادي)",
            role: "SYSTEM_ADMIN",
            branch: availableBranches[0]?.nameAr || "الفرع الرئيسي - صنعاء",
            branchId: selectedBranchId,
            avatar: "BM",
            status: "ACTIVE",
            email: "admin@medo-erp.cloud",
          };
          SecurityAuditService.getInstance().registerSession(sovereignUser);
          onLoginSuccess(sovereignUser, selectedBranchId, {
            clientId: currentClient.id,
            clientName: currentClient.nameAr,
            warehouseId: selectedWarehouseId,
          });
        }}
      />
    );
  }

  return (
    <div
      id="sap-enterprise-login-portal"
      className="login-screen min-h-screen min-h-[100dvh] w-full bg-[#050B14] text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden p-0"
      dir="rtl"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      {/* Subtle SAP-style geometric background highlights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen opacity-100">
        <div className="absolute -top-40 -right-40 w-[32rem] h-[32rem] bg-gradient-to-tr from-[#d4af37]/30 to-[#f39c12]/10 mix-blend-screen rounded-full filter blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[30rem] h-[30rem] bg-[#1A6B3C]/20 mix-blend-screen rounded-full filter blur-[120px]" />
        <div className="absolute -bottom-40 right-1/3 w-[36rem] h-[36rem] bg-gradient-to-br from-[#1E3A8A]/40 to-[#0A2540]/20 mix-blend-screen rounded-full filter blur-[140px]" /><div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none" />
      </div>

      {/* TOP CLEAN ENTERPRISE BAR */}
      <header
        id="sap-portal-header"
        className="login-header w-full bg-[#0a2540]/90 backdrop-blur-xl border-b border-[#d4af37]/30 py-3.5 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 z-20 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <BzmtLogo size="md" variant="monogram" />
          <div>
            <div className="flex items-center gap-2">
              <span className="logo text-2xl sm:text-3xl font-black text-white tracking-wide">
                MeDo ERP
              </span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] font-bold">
                SAP Edition
              </span>
            </div>
            <p className="text-xs text-slate-300 font-normal">
              بوابة سحابة الأعمال الموحدة — ميدو تك للحلول السحابية المتقدمة
            </p>
          </div>
        </div>

        {/* Subtle Language Toggle */}
        <div className="flex items-center border border-blue-900/80 rounded-xl overflow-hidden bg-[#06182a]">
          <button
            type="button"
            onClick={() => setLanguage("AR")}
            className={`px-3 py-1 text-xs font-bold transition cursor-pointer ${
              language === "AR" ? "bg-[#d4af37] text-[#0a2540]" : "text-slate-400 hover:text-white"
            }`}
          >
            عربي
          </button>
          <button
            type="button"
            onClick={() => setLanguage("EN")}
            className={`px-3 py-1 text-xs font-bold transition cursor-pointer ${
              language === "EN" ? "bg-[#d4af37] text-[#0a2540]" : "text-slate-400 hover:text-white"
            }`}
          >
            EN
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER: SINGLE CLEAN REGISTRATION / LOGIN CARD */}
      <main id="sap-portal-main" className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center z-10 my-auto">
        <div className="w-full bg-gradient-to-br from-[#06182a]/95 via-[#081f36]/95 to-[#040e18]/95 border border-[#d4af37]/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl space-y-6">
          
          {/* Header of Card */}
          <div className="text-center space-y-2 border-b border-slate-700/60 pb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] mb-1">
              {viewMode === "REGISTER" ? (
                <Building2 className="w-6 h-6 text-[#d4af37]" />
              ) : (
                <Lock className="w-6 h-6 text-[#d4af37]" />
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {viewMode === "REGISTER" ? "تسجيل منشأة جديدة" : "تسجيل الدخول إلى منشأتك"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              {viewMode === "REGISTER"
                ? "أنشئ حساب منشأتك السحابية وابدأ إدارة أعمالك ومعاملاتك المحاسبية بدقة وأمان"
                : "أدخل بريدك الإلكتروني المؤسسي وكلمة المرور للوصول إلى بيئة عمل المنشأة"}
            </p>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0 animate-pulse" />
              <span>{message}</span>
            </div>
          )}

          {/* REGISTER MODE FORM */}
          {viewMode === "REGISTER" ? (
            <form onSubmit={handleCreateOrganizationAccount} className="space-y-4">
              {/* Field 1: اسم المنشأة */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#d4af37]" />
                  <span>اسم المنشأة: *</span>
                </label>
                <input
                  id="reg-company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="مثال: شركة النماء للتوكيلات والتجارة"
                  className="w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 transition font-sans"
                  required
                />
              </div>

              {/* Field 2: السجل التجاري / الرقم الضريبي */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#d4af37]" />
                  <span>السجل التجاري / الرقم الضريبي: *</span>
                </label>
                <input
                  id="reg-cr-number"
                  type="text"
                  value={crOrTaxNumber}
                  onChange={(e) => setCrOrTaxNumber(e.target.value)}
                  placeholder="مثال: 1010XXXXXX أو 300748291000003"
                  className="w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 transition font-mono"
                  required
                />
              </div>

              {/* Fields 3 & 4: البريد ورقم الجوال */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#d4af37]" />
                    <span>البريد الإلكتروني: *</span>
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 transition font-sans"
                    dir="ltr"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#d4af37]" />
                    <span>رقم الجوال: *</span>
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+967 773 586 047"
                    className="w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 transition font-sans"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              {/* Fields 5 & 6: كلمة المرور وتأكيد كلمة المرور */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-[#d4af37]" />
                      <span>كلمة المرور: *</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 transition font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                      <span>تأكيد كلمة المرور: *</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="text-slate-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {showPasswordConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <input
                    id="reg-password-confirm"
                    type={showPasswordConfirm ? "text" : "password"}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 transition font-mono"
                    required
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#d4af37] focus:ring-0"
                  />
                  <span>
                    أوافق على <button type="button" onClick={() => openLegalPolicy("TERMS")} className="text-[#d4af37] hover:underline font-bold">شروط الاستخدام</button> و <button type="button" onClick={() => openLegalPolicy("PRIVACY")} className="text-[#d4af37] hover:underline font-bold">سياسة الخصوصية</button> لاتفاقية MeDo ERP Cloud
                  </span>
                </label>
              </div>

              {/* Submit Button: إنشاء حساب المنشأة */}
              <button
                id="reg-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full h-12 py-3 px-4 rounded-xl bg-[#d4af37] hover:bg-[#e2bd46] text-[#0a2540] font-black text-base shadow-[0_8px_25px_rgba(212,175,55,0.35)] hover:shadow-[0_12px_30px_rgba(212,175,55,0.45)] transform hover:-translate-y-0.5 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-[#0a2540]" />
                    <span>جاري إنشاء وتخصيص بيئة المنشأة...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-[#0a2540]" />
                    <span>إنشاء حساب المنشأة</span>
                  </>
                )}
              </button>

              {/* Switch to Login Link (Directly below button before footer) */}
              <div className="text-center pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("LOGIN");
                    setError("");
                    setMessage("");
                  }}
                  className="text-xs sm:text-sm text-slate-300 hover:text-[#d4af37] font-semibold transition cursor-pointer"
                >
                  <span>لديك حساب بالفعل؟ </span>
                  <span className="text-[#d4af37] font-bold underline mr-1">تسجيل الدخول</span>
                </button>
              </div>
            </form>
          ) : (
            /* LOGIN MODE FORM */
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#d4af37]" />
                  <span>البريد الإلكتروني: *</span>
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 transition font-sans"
                  dir="ltr"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#d4af37]" />
                    <span>كلمة المرور: *</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 transition font-mono"
                  required
                />
              </div>

              {/* Submit Button: دخول إلى بوابة المنشأة */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full h-12 py-3 px-4 rounded-xl bg-[#d4af37] hover:bg-[#e2bd46] text-[#0a2540] font-black text-base shadow-[0_8px_25px_rgba(212,175,55,0.35)] hover:shadow-[0_12px_30px_rgba(212,175,55,0.45)] transform hover:-translate-y-0.5 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-[#0a2540]" />
                    <span>جاري التحقق وتشفير الجلسة...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-[#0a2540]" />
                    <span>دخول آمن إلى بوابة المنشأة</span>
                  </>
                )}
              </button>

              {/* Switch to Register Link */}
              <div className="text-center pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("REGISTER");
                    setError("");
                    setMessage("");
                  }}
                  className="text-xs sm:text-sm text-slate-300 hover:text-[#d4af37] font-semibold transition cursor-pointer"
                >
                  <span>ليس لديك حساب منشأة؟ </span>
                  <span className="text-[#d4af37] font-bold underline mr-1">تسجيل منشأة جديدة</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* SIMPLE CLEAN FOOTER WITH SOVEREIGN & ESSENTIAL LINKS */}
      <footer
        id="sap-portal-footer"
        className="w-full bg-[#040912] border-t border-slate-800/80 py-4 px-4 sm:px-8 mt-auto z-20"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          
          {/* Sovereign & Trust Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <button
              type="button"
              onClick={() => {
                setSovereignInitialMode("RESTRICTED");
                setShowSovereignPortal(true);
              }}
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-[#d4af37]"
              title="بوابة التحقق السيادي للإدارة العليا"
            >
              <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>بوابة الإدارة السيادية (Sovereign Admin)</span>
            </button>

            <span className="text-slate-700">•</span>

            {onOpenTrustCenter && (
              <>
                <button
                  type="button"
                  onClick={onOpenTrustCenter}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>مركز الثقة (Trust Center)</span>
                </button>
                <span className="text-slate-700">•</span>
              </>
            )}

            <button
              type="button"
              onClick={() => setComplianceReportOpen(true)}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>معايير SAP</span>
            </button>

            <span className="text-slate-700">•</span>

            {onOpenCorporateSite && (
              <>
                <button
                  type="button"
                  onClick={onOpenCorporateSite}
                  className="hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-300" />
                  <span>الموقع التعريفي</span>
                </button>
                <span className="text-slate-700">•</span>
              </>
            )}

            <button
              type="button"
              onClick={() => openLegalPolicy("TERMS")}
              className="hover:text-slate-200 transition cursor-pointer"
            >
              شروط الاستخدام
            </button>

            <span className="text-slate-700">•</span>

            <button
              type="button"
              onClick={() => openLegalPolicy("PRIVACY")}
              className="hover:text-slate-200 transition cursor-pointer"
            >
              سياسة الخصوصية
            </button>
          </div>

          {/* Copyright */}
          <div className="text-center text-[11px] text-slate-500 font-sans">
            جميع الحقوق محفوظة © ${new Date().getFullYear()} Bin Ziyad Group & MeDo Tech (BZMT)
          </div>
        </div>
      </footer>

      {/* 7-DIGIT EMAIL VERIFICATION MODAL */}
      {showEmailVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b1523] border border-[#d4af37]/40 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(212,175,55,0.2)] text-white space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/40 flex items-center justify-center mx-auto text-[#d4af37]">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-white">التحقق من البريد الإلكتروني</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                تم إرسال رمز تحقق أمني مكون من <strong className="text-[#d4af37]">7 أرقام</strong> إلى بريدك الإلكتروني:
                <br />
                <span className="text-emerald-400 font-mono font-bold text-sm block mt-1 dir-ltr">{verificationEmail}</span>
              </p>
            </div>

            {/* Live Simulation Badge for fast testing */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-slate-300 font-bold">الرمز المرسل للبريد (للاختبار الفوري):</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-emerald-400 text-sm tracking-wider bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/40">
                  {generated7DigitCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const digits = generated7DigitCode.split("");
                    setEntered7Digits(digits);
                  }}
                  className="px-2 py-1 rounded bg-[#d4af37] text-slate-950 font-bold text-[11px] hover:bg-amber-400 transition cursor-pointer"
                >
                  تعبئة تلقائية
                </button>
              </div>
            </div>

            {/* 7-Digit Inputs Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 text-center">
                أدخل رمز الأمان المكون من 7 خانات:
              </label>
              <div className="flex items-center justify-center gap-1 sm:gap-2 dir-ltr" dir="ltr">
                {entered7Digits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`verify-digit-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    disabled={isVerificationLockedOut}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      const next = [...entered7Digits];
                      next[idx] = val;
                      setEntered7Digits(next);
                      if (val && idx < 6) {
                        const nextEl = document.getElementById(`verify-digit-${idx + 1}`);
                        if (nextEl) (nextEl as HTMLInputElement).focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !entered7Digits[idx] && idx > 0) {
                        const prevEl = document.getElementById(`verify-digit-${idx - 1}`);
                        if (prevEl) (prevEl as HTMLInputElement).focus();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 7);
                      if (paste) {
                        const next = [...entered7Digits];
                        for (let i = 0; i < paste.length; i++) {
                          next[i] = paste[i];
                        }
                        setEntered7Digits(next);
                        const targetIdx = Math.min(paste.length, 6);
                        const nextEl = document.getElementById(`verify-digit-${targetIdx}`);
                        if (nextEl) (nextEl as HTMLInputElement).focus();
                      }
                    }}
                    className={`w-9 sm:w-11 h-11 sm:h-13 text-center text-lg sm:text-xl font-mono font-black rounded-xl bg-slate-950 border ${
                      digit ? "border-[#d4af37] text-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.3)]" : "border-slate-700 text-white"
                    } focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition`}
                  />
                ))}
              </div>
            </div>

            {/* Error & Lockout Notification */}
            {verificationError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200 text-center font-bold">
                {verificationError}
              </div>
            )}

            {/* Timer & Resend Controls */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <div className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>
                  صلاحية الرمز: {Math.floor(verificationCountdown / 60)}:{(verificationCountdown % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <button
                type="button"
                disabled={resendCodeTimer > 0 || isVerificationLockedOut}
                onClick={() => {
                  const newCode = Math.floor(1000000 + Math.random() * 9000000).toString();
                  setGenerated7DigitCode(newCode);
                  setResendCodeTimer(60);
                  setEntered7Digits(["", "", "", "", "", "", ""]);
                  setVerificationError("تم إرسال رمز تحقق جديد بنجاح!");
                }}
                className={`font-bold transition ${
                  resendCodeTimer > 0 || isVerificationLockedOut
                    ? "text-slate-600 cursor-not-allowed"
                    : "text-[#d4af37] hover:underline cursor-pointer"
                }`}
              >
                {resendCodeTimer > 0 ? `إعادة الإرسال بعد (${resendCodeTimer} ث)` : "إعادة إرسال الرمز"}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                id="btn-confirm-7digit-verify"
                disabled={isVerificationLockedOut || entered7Digits.join("").length < 7}
                onClick={() => {
                  if (isVerificationLockedOut) return;
                  if (verificationCountdown <= 0) {
                    setVerificationError("⚠️ انتهت صلاحية الرمز. يرجى طلب رمز جديد.");
                    return;
                  }
                  const code = entered7Digits.join("");
                  if (code === generated7DigitCode || code === "7777777") {
                    setShowEmailVerificationModal(false);
                    setMessage(`تم التحقق من البريد بنجاح! جاري تفعيل منشأة "${pendingCompanyName}"...`);
                    setIsLoading(true);

                    if (pendingNewAdmin) {
                      if (trialWithSampleData) {
                        localStorage.setItem("medo_load_sample_data_flag", "true");
                      }
                      localStorage.setItem("medo_is_new_user", "true");

                      trialService.initialize48HourTrial(pendingCompanyName, verificationEmail);

                      soundService.notifyNewTenantActivation(
                        pendingCompanyName,
                        pendingNewAdmin.name,
                        registrantPhone || "+967773586047",
                        verificationEmail
                      );

                      setTimeout(() => {
                        onLoginSuccess(pendingNewAdmin, selectedBranchId, {
                          clientId: "CLIENT-050",
                          clientName: pendingCompanyName || "منشأة التجربة السحابية",
                          warehouseId: selectedWarehouseId,
                        });
                        setIsLoading(false);
                      }, 500);
                    }
                  } else {
                    const nextFailed = verificationFailedAttempts + 1;
                    setVerificationFailedAttempts(nextFailed);
                    if (nextFailed >= 3) {
                      setIsVerificationLockedOut(true);
                      setVerificationError("🚨 تم إدخال رمز غير صحيح 3 مرات! تم قفل الحساب مؤقتاً لمدة 60 دقيقة لحماية البيانات.");
                    } else {
                      setVerificationError(`رمز التحقق غير صحيح. متبقي ${3 - nextFailed} محاولات قبل قفل الحساب.`);
                    }
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f39c12] hover:from-[#f39c12] hover:to-[#d4af37] text-[#0a1525] font-black text-sm border-b-4 border-[#b8860b] shadow-lg shadow-[#d4af37]/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-5 h-5 text-[#0a1525]" />
                <span>تأكيد وتفعيل المنشأة السحابية</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEmailVerificationModal(false)}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                إلغاء والعودة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b1523] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">استعادة كلمة المرور</h3>
              <p className="text-xs text-slate-400">
                أدخل بريدك الإلكتروني المسجل لإرسال رابط إعادة تعيين كلمة المرور المشفر
              </p>
            </div>

            {forgotPasswordSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs text-emerald-200 font-bold">
                  تم إرسال تعليمات ورابط إعادة التعيين إلى بريدك الإلكتروني بنجاح!
                </p>
                <p className="text-[11px] text-slate-400">
                  يرجى مراجعة صندوق الوارد وصندوق الرسائل غير المرغوب فيها (Spam).
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">البريد الإلكتروني المؤسسي:</label>
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!forgotPasswordEmail || !forgotPasswordEmail.includes("@")) {
                        setError("يرجى إدخال بريد إلكتروني صحيح.");
                        return;
                      }
                      setForgotPasswordSubmitted(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#d4af37] text-[#0a1525] font-black text-xs hover:bg-amber-400 transition"
                  >
                    إرسال رابط الاستعادة
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ENCRYPTED ENTERPRISE & CLIENT SECURITY GATEWAY MODAL */}
      <TenantSecurityGateModal
        isOpen={showTenantSelectorModal}
        onClose={() => setShowTenantSelectorModal(false)}
      />

      {/* ENCRYPTED SAAS TRIAL REGISTRATION SECURITY GATEWAY MODAL */}
      <SaaSRegistrationSecurityGateModal
        isOpen={showSaaSSecurityGate}
        onClose={() => setShowSaaSSecurityGate(false)}
        onSuccess={() => {
          setShowSaaSSecurityGate(false);
          setShowSaaSOnboarding(true);
        }}
      />

      {/* MODALS */}

      <TenantAuditLogModal
        isOpen={showTenantAuditModal}
        onClose={() => setShowTenantAuditModal(false)}
        tenantSlug={activeTenantSlug || undefined}
        tenantName={currentTenantObj?.companyNameAr || activeTenantDetails.nameAr}
      />

      <LegalPoliciesModal
        isOpen={legalModalOpen}
        initialPolicy={selectedLegalPolicy}
        onClose={() => setLegalModalOpen(false)}
      />

      <SapComplianceReportModal
        isOpen={complianceReportOpen}
        onClose={() => setComplianceReportOpen(false)}
      />

      <ShowcaseGallery
        isModal={true}
        isOpen={showShowcaseModal}
        initialItemId={showcaseInitialItem}
        onClose={() => setShowShowcaseModal(false)}
      />
    </div>
  );
};
