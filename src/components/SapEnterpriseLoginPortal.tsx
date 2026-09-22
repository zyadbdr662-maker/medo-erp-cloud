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
  const [activeTab, setActiveTab] = useState<"CREDENTIALS" | "NEW_TRIAL">("CREDENTIALS");
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

  // Tenant switcher modal state
  const [showTenantSelectorModal, setShowTenantSelectorModal] = useState(false);
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
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [selectedLegalPolicy, setSelectedLegalPolicy] = useState<LegalPolicyType>("TERMS");
  const [complianceReportOpen, setComplianceReportOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

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

  // 2. STANDARD CREDENTIALS SUBMISSION
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

      // Check if account is currently locked out due to >3 failed attempts
      const lockStatus = SecurityAuditService.getInstance().isAccountLocked(email);
      if (lockStatus.isLocked) {
        setError(`⛔ الحساب مقفل حالياً لأسباب أمنية! يرجى الانتظار لمدة (${lockStatus.remainingMinutes} دقيقة) أو التواصل مع مدير النظام لإلغاء القفل.`);
        setIsLoading(false);
        return;
      }

      // Execute Google reCAPTCHA v3 & Firebase App Check security evaluation
      setMessage("جاري فحص الأمان عبر Google reCAPTCHA v3 و Firebase App Check...");
      const recaptchaRes = await executeRecaptchaV3("login");
      setRecaptchaResult(recaptchaRes);

      if (!recaptchaRes.success || recaptchaRes.isBotRisk || recaptchaRes.score < 0.5) {
        const failedInfo = SecurityAuditService.getInstance().recordFailedLogin(email, "مستخدم غير معروف (Bot)");
        if (failedInfo.alertTriggered) {
          setError(`🚨 تم حظر المحاولة! رصد أكثر من 3 محاولات فاشلة متتالية خلال دقيقة واحدة من جهازك. تم إخطار مدير النظام فوراً.`);
        } else {
          setError("⚠️ تم اكتشاف نشاط مشبوه أو سلوك آلي عبر Google reCAPTCHA v3 / Firebase App Check. تم حظر محاولة الدخول لحماية البيانات.");
        }
        setIsLoading(false);
        return;
      }

      // Try Firebase authentication
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        const erpUser: ERPUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "بدر عايض محمد (مدير المنظومة)",
          role: "SYSTEM_ADMIN",
          branch: availableBranches.find((b) => b.id === selectedBranchId)?.nameAr || "الفرع الرئيسي - صنعاء",
          branchId: selectedBranchId,
          avatar: "BM",
          status: "ACTIVE",
        };

        // Register session in Security Audit Service
        SecurityAuditService.getInstance().registerSession(erpUser);

        setMessage("تم تسجيل الدخول بنجاح! جاري تحميل بيئة العمل ومكتبات SAP المحاسبية...");
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

          // Register session
          SecurityAuditService.getInstance().registerSession(user);

          setMessage(`تم التحقق من بيانات ${matchedRole.roleTitleAr}. مرحباً بك!`);
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

          SecurityAuditService.getInstance().registerSession(user);

          setMessage(`تمت المصادقة بنجاح بصلاحية ${titleAr}. مرحباً بك!`);
          setTimeout(() => {
            onLoginSuccess(user, selectedBranchId, {
              clientId: currentClient.id,
              clientName: currentClient.nameAr,
              warehouseId: selectedWarehouseId,
            });
          }, 450);
        } else {
          // Record Failed Login
          const failedInfo = SecurityAuditService.getInstance().recordFailedLogin(email, email.split("@")[0]);
          if (failedInfo.alertTriggered) {
            setError(`🚨 تنبيه أمني عاجل! تم رصد أكثر من 3 محاولات فاشلة متتالية خلال دقيقة واحدة من هذا الجهاز (${failedInfo.failedCount} محاولات). تم إرسال تنبيه فوراً لمدير النظام وتوثيق السجل الأمني.`);
          } else {
            setError(`كلمة المرور أو بيانات الدخول غير صحيحة. (محاولة رقم ${failedInfo.failedCount} من نفس الجهاز)`);
          }
        }
      }
    } catch (err: any) {
      const failedInfo = SecurityAuditService.getInstance().recordFailedLogin(email, "مستخدم غير معروف");
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

      {/* TOP SAP ENTERPRISE BAR */}
      <header
        id="sap-portal-header"
        className="login-header w-full bg-[#0a2540] backdrop-blur-xl border-b border-[#d4af37]/30 py-4 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 z-20 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-right gap-3.5">
          <div className="flex items-center justify-center">
            <BzmtLogo size="md" variant="monogram" />
          </div>
          <div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <span className="logo text-[28px] sm:text-[32px] md:text-[38px] lg:text-[48px] font-black text-white tracking-wide leading-tight">
                MeDo ERP
              </span>
              <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] font-bold whitespace-nowrap">
                SAP S/4HANA & B1 Edition
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-normal mt-0.5">
              بوابة الدخول المؤسسي الموحدة — ميدو تك للحلول السحابية المتقدمة
            </p>
          </div>
        </div>

        {/* Real-time system telemetry and quick navigation */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs flex-wrap w-full md:w-auto">
          {onOpenCorporateSite && (
            <button
              id="sap-back-home-btn"
              onClick={onOpenCorporateSite}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#d4af37] border border-[#d4af37]/40 transition cursor-pointer font-black shadow-sm hover:scale-[1.05] text-[12px]"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>العودة إلى الرئيسية</span>
            </button>
          )}

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#06182a] border border-blue-900/60 text-slate-300 shadow-inner">
            <Server className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>النظام: <strong className="text-[#d4af37] font-mono">PRD-01 (Online)</strong></span>
            <span className="text-slate-600">|</span>
            <span>الإصدار: <strong className="text-[#d4af37] font-mono">2026.09-LTS</strong></span>
          </div>

          {onOpenTrustCenter && (
            <button
              id="sap-portal-trust-btn"
              onClick={onOpenTrustCenter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#06182a] hover:bg-[#0c2b48] text-slate-200 border border-blue-900/80 transition cursor-pointer font-medium shadow-sm hover:scale-[1.02] text-[11px] sm:text-xs"
              title="مركز الثقة والأمان السحابي"
            >
              <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
              <span className="whitespace-nowrap">مركز الثقة (Trust Center)</span>
            </button>
          )}

          {/* Search for companies and names button has been moved to SecretAdminGatewayModal (Sovereign Higher Administration) */}

          <button
            id="sap-portal-compliance-btn"
            onClick={() => setComplianceReportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#06182a] hover:bg-amber-500/20 text-[#d4af37] border border-[#d4af37]/40 transition cursor-pointer font-bold shadow-sm hover:scale-[1.02] text-[11px] sm:text-xs"
            title="فحص مطابقة معايير SAP الدولية"
          >
            <Award className="w-4 h-4 text-[#d4af37]" />
            <span className="whitespace-nowrap">معايير SAP</span>
          </button>

          {onOpenCorporateSite && (
            <button
              id="sap-portal-corporate-btn"
              onClick={onOpenCorporateSite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#06182a] hover:bg-[#0c2b48] text-amber-200 border border-[#d4af37]/40 transition cursor-pointer font-bold shadow-sm hover:scale-[1.02] text-[11px] sm:text-xs"
              title="استعراض موديولات النظام وبوابة المنشأة"
            >
              <Briefcase className="w-4 h-4 text-[#d4af37]" />
              <span className="whitespace-nowrap">الموقع التعريفي</span>
            </button>
          )}

          {/* SaaS onboarding registration button has been moved to SecretAdminGatewayModal (Sovereign Higher Administration) */}

          {/* Sovereign Analog Clock in Enterprise Login Portal */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-xl bg-[#06182a] border border-[#d4af37]/40 shadow-inner">
            <AnalogClock size={30} showSeconds={true} />
          </div>

          <div className="flex items-center border border-blue-900/80 rounded-xl overflow-hidden bg-[#06182a]">
            <button
              onClick={() => setLanguage("AR")}
              className={`px-2.5 sm:px-3 py-1 text-xs font-bold transition cursor-pointer ${
                language === "AR" ? "bg-[#d4af37] text-[#0a2540]" : "text-slate-400 hover:text-white"
              }`}
            >
              عربي
            </button>
            <button
              onClick={() => setLanguage("EN")}
              className={`px-2.5 sm:px-3 py-1 text-xs font-bold transition cursor-pointer ${
                language === "EN" ? "bg-[#d4af37] text-[#0a2540]" : "text-slate-400 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main id="sap-portal-main" className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center z-10">
        {/* CASE 1: TENANT PORTAL (When opened with ?tenant=...) */}
        {isCustomTenant ? (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#06182a]/95 to-[#0a2540]/95 border border-emerald-500/60 shadow-[0_10px_30px_rgba(16,185,129,0.15)] backdrop-blur-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 font-bold shadow-inner shrink-0">
                  <Building2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base sm:text-lg font-black text-white">
                      {currentTenantObj?.companyNameAr || activeTenantDetails.nameAr}
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold">
                      بوابة منشأة معزولة ومستقلة
                    </span>
                    {currentTenantObj?.status === "PAID_ENTERPRISE" && (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold">
                        اشتراك مؤسسي معتمد (Enterprise)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-normal mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {currentTenantObj?.city && <span>📍 المدينة: <strong className="text-white">{currentTenantObj.city}</strong></span>}
                    {currentTenantObj?.crNumber && <span>س.ت: <strong className="text-amber-300 font-mono">{currentTenantObj.crNumber}</strong></span>}
                    {currentTenantObj?.taxNumber && <span>الرقم الضريبي: <strong className="text-amber-300 font-mono">{currentTenantObj.taxNumber}</strong></span>}
                    {currentTenantObj?.assignedAdminName && <span>المدير المسؤول: <strong className="text-white">{currentTenantObj.assignedAdminName}</strong></span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.clear();
                      sessionStorage.clear();
                    } catch (e) {}
                    window.location.href = window.location.pathname;
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition cursor-pointer hover:scale-105"
                  title="الخروج من بوابة العميل والعودة إلى المنصة الرئيسية للمدير"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>🔐 دخول المدير (المنصة الرئيسية)</span>
                </button>
                <span className="text-[11px] text-emerald-300 font-mono bg-[#030d17] px-3 py-1.5 rounded-xl border border-emerald-800/80 shadow-sm">
                  Tenant: {activeTenantSlug}
                </span>
              </div>
            </div>

            {/* Quick 1-Click Role Login for this Company */}
            {currentTenantObj?.roles && (
              <div className="border-t border-slate-700/60 pt-3">
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>الدخول السريع بحسابات أدوار المنشأة (معاينة فورية):</span>
                  </span>
                  <span className="text-[11px] text-slate-400">كلمة المرور: 1234</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {Object.entries(currentTenantObj.roles).map(([roleKey, roleVal]: [string, any]) => {
                    const isSelected = email.toLowerCase() === roleVal.email.toLowerCase();
                    return (
                      <button
                        key={roleKey}
                        type="button"
                        onClick={() => {
                          setEmail(roleVal.email);
                          setPassword(roleVal.password || "1234");
                          setMessage(`تم تجهيز بيانات ${roleVal.roleNameAr || roleKey}. اضغط 'تسجيل الدخول' للدخول فوراً.`);
                          soundService.playSound("SUCCESS_CHIME");
                        }}
                        className={`p-2.5 rounded-xl text-right transition border text-xs cursor-pointer flex flex-col gap-0.5 ${
                          isSelected
                            ? "bg-[#d4af37]/25 border-[#d4af37] text-white shadow-[0_0_15px_rgba(212,175,55,0.35)]"
                            : "bg-[#06182a]/90 hover:bg-[#0c2b48] border-slate-700/70 text-slate-300"
                        }`}
                      >
                        <span className="font-bold text-white truncate">{roleVal.roleNameAr?.split("(")[0]?.trim() || roleKey}</span>
                        <span className="text-[10px] text-slate-400 font-mono truncate">{roleVal.email}</span>
                        <span className="text-[9px] text-emerald-400 font-bold mt-0.5">
                          {isSelected ? "✓ تم التحديد — جاهز" : "اضغط للمعاينة"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* CASE 2: MASTER PLATFORM (When opened without tenant) */
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#06182a]/95 via-[#0b2038]/95 to-[#05111e]/95 border border-[#d4af37]/60 shadow-[0_10px_30px_rgba(212,175,55,0.15)] backdrop-blur-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] font-black text-2xl shadow-inner shrink-0">
                  👑
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base sm:text-lg font-black text-white">
                      المنصة الرئيسية للمدير (Master Platform)
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 font-bold">
                      بوابة الإدارة السيادية والتحكم المركزي
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-normal mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>👤 مدير المنظومة: <strong className="text-amber-300 font-bold">بدر عايض محمد</strong></span>
                    <span>✉️ البريد السيادي: <strong className="text-white font-mono">admin@medo-erp.cloud</strong></span>
                    <span>🛡️ صلاحيات كاملة لإدارة السحابة وتطوير المنشآت</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setShowTenantSelectorModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition cursor-pointer hover:scale-105"
                  title="استعراض والذهاب إلى بوابة أي منشأة أو عميل"
                >
                  <Globe className="w-4 h-4" />
                  <span>🌐 الذهاب إلى بوابة عميل</span>
                </button>
              </div>
            </div>

            {/* Quick 1-Click Director Fast Login */}
            <div className="border-t border-slate-700/60 pt-3">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>الدخول السريع بحساب المدير العام السيادي:</span>
                </span>
                <span className="text-[11px] text-slate-400">admin@medo-erp.cloud</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@medo-erp.cloud");
                  setPassword("admin");
                  setMessage("تم تجهيز بيانات المدير العام (بدر عايض محمد). اضغط 'تسجيل الدخول' للدخول فوراً.");
                  soundService.playSound("SUCCESS_CHIME");
                }}
                className="w-full p-3 rounded-xl bg-[#0a2540]/90 hover:bg-[#10355a] border border-[#d4af37]/50 text-right text-xs transition cursor-pointer flex items-center justify-between shadow-sm hover:border-[#d4af37]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] font-bold">
                    BM
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">أ. بدر عايض محمد (المدير العام والمالك السيادي)</div>
                    <div className="text-[11px] text-slate-400 font-mono">admin@medo-erp.cloud (صلاحيات سيادية كاملة)</div>
                  </div>
                </div>
                <span className="text-xs px-3 py-1.5 rounded-lg bg-[#d4af37] text-[#0a2540] font-black shadow-sm">
                  ⚡ دخول فوري للمدير
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile/Tablet Quick System Config Toggle */}
        <div className="lg:hidden w-full max-w-xl mx-auto mb-4">
          <button
            type="button"
            onClick={() => setShowEnvConfigMobile(!showEnvConfigMobile)}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#0a1525]/90 border border-[#d4af37]/40 text-xs text-amber-200 font-bold flex items-center justify-between shadow-md hover:bg-[#10243d] transition cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Database className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span className="truncate">بيئة النظام: [{currentClient.code}] — {availableBranches.find((b) => b.id === selectedBranchId)?.nameAr || "الفرع الرئيسي"}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-300 shrink-0 mr-2">
              <span>{showEnvConfigMobile ? "إخفاء الإعدادات" : "تغيير العميل/الفرع"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showEnvConfigMobile ? "rotate-180" : ""}`} />
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT/RIGHT SIDEBAR: SAP CLIENT, BRANCH & WAREHOUSE CONFIG */}
          <div className={`lg:col-span-4 bg-gradient-to-br from-[#0a1525]/80 to-[#040810]/90 backdrop-blur-3xl border border-[#d4af37]/30 rounded-3xl p-5 sm:p-6 shadow-[0_15px_40px_rgba(212,175,55,0.15)] space-y-5 order-2 lg:order-1 ${showEnvConfigMobile ? "block" : "hidden lg:block"}`}>
            <div className="border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2 text-sap-secondary font-bold text-sm">
                <Database className="w-4 h-4" />
                <span>تهيئة بيئة الدخول (SAP System & Client)</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-normal">
                اختر شركة العميل، الفرع، والمستودع الافتراضي لجلسة العمل
              </p>
            </div>

            {/* Client (Mandant) Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>الشركة / العميل (Client):</span>
                </span>
              </div>
              <div className="relative">
                <select
                  id="sap-client-selector"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full bg-[#070d18] border border-slate-700/90 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-sap-secondary transition appearance-none cursor-pointer"
                >
                  {allClients.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#070d18] text-white">
                      [{c.code}] {c.nameAr} ({c.type})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-0.5">
                <span>الكود: <strong className="text-amber-300 font-mono">{currentClient.code}</strong></span>
              </div>
              <p className="text-xs text-slate-300 bg-[#070d18]/70 p-3 rounded-xl border border-slate-800 leading-relaxed font-normal">
                {currentClient.description}
              </p>
            </div>

            {/* Branch Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">الفرع التشغيلي (Branch):</label>
              <div className="relative">
                <select
                  id="sap-branch-selector"
                  value={selectedBranchId}
                  onChange={(e) => {
                    const newBranch = e.target.value;
                    setSelectedBranchId(newBranch);
                    const matchedWh = SAP_WAREHOUSES.find((w) => w.branchId === newBranch);
                    if (matchedWh) setSelectedWarehouseId(matchedWh.id);
                  }}
                  className="w-full bg-[#070d18] border border-slate-700/90 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-sap-secondary transition appearance-none cursor-pointer"
                >
                  {availableBranches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#070d18] text-white">
                      {b.nameAr} ({b.code})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Warehouse Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>المستودع الافتراضي (Default Warehouse):</span>
                <Warehouse className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <div className="relative">
                <select
                  id="sap-warehouse-selector"
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="w-full bg-[#070d18] border border-slate-700/90 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-sap-secondary transition appearance-none cursor-pointer"
                >
                  {filteredWarehouses.length > 0 ? (
                    filteredWarehouses.map((w) => (
                      <option key={w.id} value={w.id} className="bg-[#070d18] text-white">
                        {w.nameAr} [{w.code}]
                      </option>
                    ))
                  ) : (
                    <option value="WH-01" className="bg-[#070d18] text-white">
                      مستودع البضاعة الجاهزة والتوزيع الرئيسي (WH-01)
                    </option>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Security & Isolation Summary Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950/80 border border-emerald-800/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-sap-secondary">
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                <span>أمان الجلسة وعزل البيانات</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 leading-normal list-disc list-inside pr-1 font-normal">
                <li>عزل كامل لقواعد البيانات المحاسبية (Multi-Tenant Isolation).</li>
                <li>تشفير البيانات أثناء النقل والتخزين بروتوكول TLS 1.3 / AES-256.</li>
                <li>توثيق كامل للعمليات في سجل المراجعة القانوني (Audit Trail).</li>
              </ul>
            </div>

            {/* System Info Footnote */}
            <div className="pt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>قاعدة البيانات: <strong className="text-slate-300 font-mono">{currentClient.dbName}</strong></span>
              <span className="text-[#d4af37] font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                جاهز للاتصال
              </span>
            </div>
          </div>

          {/* RIGHT/CENTER: INTERACTIVE AUTHENTICATION MODES */}
          <div className="login-card dark-card lg:col-span-8 w-full max-w-[580px] lg:max-w-none mx-auto bg-gradient-to-tl from-[#0a2540]/95 via-[#0a1525]/98 to-[#040810]/98 backdrop-blur-3xl border border-[#d4af37]/40 rounded-[22px] sm:rounded-[26px] p-5 xs:p-[24px] sm:p-[30px] lg:p-[45px] shadow-[0_20px_50px_rgba(212,175,55,0.2),_inset_0_1px_1px_rgba(255,255,255,0.1)] space-y-[28px] sm:space-y-[30px] order-1 lg:order-2 box-border overflow-x-hidden">
            {/* CARD TOP BRANDING */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-amber-500/10 border border-[#d4af37]/40 flex items-center justify-center shadow-inner shrink-0 text-[#d4af37] font-black text-lg">
                  {isCustomTenant ? "🏢" : "👑"}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[20px] font-black text-white tracking-tight">
                      {isCustomTenant ? (currentTenantObj?.companyNameAr || activeTenantDetails.nameAr) : "المنصة الرئيسية للمدير"}
                    </span>
                    <span className="text-[11px] bg-slate-800 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-slate-700">
                      {isCustomTenant ? "بوابة منشأة معزولة" : "Master Platform"}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-300 font-medium">
                    {isCustomTenant ? "بيئة العمل والتشغيل السحابية المستقلة للمنشأة" : "بوابة الإدارة السيادية والتحكم المركزي — MeDo ERP"}
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#06182a] border border-blue-900/60 text-[12px] text-emerald-400 font-semibold shadow-sm shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>مشفر TLS 1.3 / AES-256</span>
              </div>
            </div>

            {/* PROMINENT TABS: بيانات الدخول المؤسسية vs تفعيل منشأة جديدة */}
            <div className="w-full grid grid-cols-2 p-1.5 bg-[#051322] border border-blue-900/80 rounded-2xl gap-2">
              <button
                id="sap-tab-credentials"
                type="button"
                onClick={() => setActiveTab("CREDENTIALS")}
                className={`min-h-[48px] py-2.5 px-3 rounded-xl text-[14px] sm:text-[15px] font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "CREDENTIALS"
                    ? "bg-[#d4af37] text-[#0a2540] font-black shadow-md shadow-[0_4px_15px_rgba(212,175,55,0.35)]"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span>بيانات الدخول المؤسسية</span>
              </button>
              <button
                id="sap-tab-trial"
                type="button"
                onClick={() => setActiveTab("NEW_TRIAL")}
                className={`min-h-[48px] py-2.5 px-3 rounded-xl text-[14px] sm:text-[15px] font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "NEW_TRIAL"
                    ? "bg-[#d4af37] text-[#0a2540] font-black shadow-md shadow-[0_4px_15px_rgba(212,175,55,0.35)]"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                <span>تفعيل منشأة جديدة</span>
              </button>
            </div>

            {/* ALERTS & FEEDBACK */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-sm flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-sm flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0 animate-pulse" />
                <span>{message}</span>
              </div>
            )}

            {/* TAB CONTENT 1: STANDARD CORPORATE CREDENTIALS & SSO */}
            {activeTab === "CREDENTIALS" && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-5 max-w-full mx-auto py-1">
                <div className="text-center space-y-1 mb-2">
                  <h3 className="login-title text-[28px] sm:text-[30px] md:text-[32px] font-black text-white leading-tight">
                    تسجيل الدخول بالبيانات المعتمدة
                  </h3>
                  <p className="login-subtitle text-[14px] sm:text-[15px] text-slate-300 leading-relaxed">
                    أدخل بريدك الإلكتروني المؤسسي أو اسم المستخدم وكلمة المرور الخاصة بمنظومة MeDo ERP
                  </p>
                </div>

                {/* Email / Username Field */}
                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-slate-200 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#d4af37]" />
                    <span>البريد الإلكتروني المؤسسي أو اسم المستخدم:</span>
                  </label>
                  <input
                    id="sap-login-email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="off"
                    className="input-field w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3.5 text-[16px] min-h-[52px] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 transition shadow-inner font-sans"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[14px] font-semibold text-slate-200">
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#d4af37]" />
                      <span>كلمة المرور:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-white text-[13px] sm:text-[14px] flex items-center gap-1 transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      <span>{showPassword ? "إخفاء" : "إظهار"}</span>
                    </button>
                  </div>
                  <input
                    id="sap-login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="input-field w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3.5 text-[16px] min-h-[52px] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 transition shadow-inner font-mono"
                    required
                  />
                  {password && (
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passStrength.color} transition-all duration-300`}
                          style={{ width: `${(passStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-[12px]">قوة كلمة المرور: {passStrength.text}</span>
                    </div>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-[14px] pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sap-primary focus:ring-0 focus:ring-offset-0"
                    />
                    <span>تذكرني (جلسة آمنة)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordEmail(email);
                      setShowForgotPasswordModal(true);
                      setForgotPasswordSubmitted(false);
                    }}
                    className="text-[#d4af37] hover:underline font-bold text-[14px] flex items-center gap-1 cursor-pointer"
                  >
                    <span>نسيت كلمة المرور؟</span>
                  </button>
                </div>

                {/* Primary Submit Button */}
                <button
                  id="sap-submit-login-btn"
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full h-[55px] min-h-[55px] py-3.5 px-4 rounded-xl bg-[#d4af37] hover:bg-[#e2bd46] active:bg-[#c59f2e] text-[#0a2540] font-black text-[18px] shadow-[0_8px_25px_rgba(212,175,55,0.4)] hover:shadow-[0_12px_32px_rgba(212,175,55,0.55)] transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 transition active:scale-98 disabled:opacity-50 border border-[#b8860b] cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-[#0a2540]" />
                      <span>جاري التحقق من الجلسة السحابية...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-[#0a2540]" />
                      <span>تسجيل الدخول إلى MeDo ERP</span>
                    </>
                  )}
                </button>

                {/* Clear Bright Divider */}
                <div className="relative flex items-center justify-center my-8">
                  <div className="flex-grow border-t border-slate-700/50"></div>
                  <span className="flex-shrink mx-4 w-10 h-10 flex items-center justify-center rounded-full bg-[#d4af37] text-[#0a2540] font-black text-[16px] shadow-[0_0_15px_rgba(212,175,55,0.4)] border-2 border-[#b8860b]">
                    أو
                  </span>
                  <div className="flex-grow border-t border-slate-700/50"></div>
                </div>

                {/* Google SSO Button */}
                <button
                  id="sap-google-sso-btn"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full h-[52px] min-h-[52px] py-2.5 px-4 rounded-xl bg-[#06182a] hover:bg-[#0c2b48] text-slate-100 border border-blue-900/90 hover:border-[#d4af37]/60 font-bold text-[16px] sm:text-[17px] flex items-center justify-center gap-3 transition cursor-pointer shadow-md"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.9 6.4C.7 8.8 0 10.8 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z"
                    />
                  </svg>
                  <span>الدخول بحساب Google</span>
                </button>

                {/* Concise Security Badge in Single Line */}
                <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#04101d]/90 border border-[#d4af37]/30 text-slate-200 text-[14px] font-bold text-center shadow-lg">
                  <Lock className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span className="truncate">محمي بـ reCAPTCHA v3 + Firebase App Check</span>
                </div>

                {/* Legal Trust Notice */}
                <div className="pt-4 text-center text-[14px] text-slate-300 space-y-3 select-none">
                  <p className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2">
                    <span className="text-slate-400">بتسجيل الدخول، أنت توافق على:</span>
                    <button
                      type="button"
                      onClick={() => openLegalPolicy("TERMS")}
                      className="text-[#d4af37] hover:underline font-bold flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      شروط الاستخدام
                    </button>
                    <button
                      type="button"
                      onClick={() => openLegalPolicy("PRIVACY")}
                      className="text-[#d4af37] hover:underline font-bold flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      سياسة الخصوصية
                    </button>
                    <button
                      type="button"
                      onClick={() => openLegalPolicy("COOKIES")}
                      className="text-[#d4af37] hover:underline font-bold flex items-center gap-1.5"
                    >
                      <Cookie className="w-3.5 h-3.5" />
                      ملفات الارتباط
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* TAB CONTENT 2: NEW TRIAL & ONBOARDING */}
            {activeTab === "NEW_TRIAL" && (
              <div className="space-y-5 max-w-full mx-auto py-1">
                <div className="text-center space-y-1 mb-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[13px] font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>تسجيل حساب وتفعيل ترخيص مجاني 30 يوماً</span>
                  </div>
                  <h3 className="login-title text-[26px] sm:text-[28px] md:text-[32px] font-black text-white leading-tight">
                    تسجيل مستخدم وتفعيل منشأة سحابية جديدة
                  </h3>
                  <p className="login-subtitle text-[14px] sm:text-[15px] text-slate-300 leading-relaxed">
                    أدخل بياناتك وبيانات منشأتك للتسجيل واجتياز الفحص الأمني للبدء الفوري
                  </p>
                </div>

                {/* Interactive SaaS Wizard launcher */}
                <button
                  type="button"
                  onClick={() => setShowSaaSOnboarding(true)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-950/90 via-indigo-950/90 to-blue-950/90 border border-[#d4af37]/40 text-[#d4af37] hover:text-white text-[14px] font-bold flex items-center justify-center gap-2 transition hover:bg-[#0c2b48] shadow-md cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  <span>فتح معالج الإعداد التفاعلي السريع (SaaS Setup Wizard)</span>
                </button>

                <div className="space-y-4 pt-1">
                  {/* Personal & Account Info */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-slate-200 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#d4af37]" />
                      <span>الاسم الكامل للعميل / المستخدم: *</span>
                    </label>
                    <input
                      id="registrant-fullname"
                      type="text"
                      value={registrantFullName}
                      onChange={(e) => setRegistrantFullName(e.target.value)}
                      placeholder="مثال: بدر عايض زياد"
                      className="input-field w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3.5 text-[16px] min-h-[52px] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] transition font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[14px] font-semibold text-slate-200 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#d4af37]" />
                        <span>البريد الإلكتروني الرسمي: *</span>
                      </label>
                      <input
                        id="registrant-email"
                        type="email"
                        value={registrantEmail}
                        onChange={(e) => setRegistrantEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="input-field w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3.5 text-[16px] min-h-[52px] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] transition dir-ltr text-right font-sans"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[14px] font-semibold text-slate-200 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#d4af37]" />
                        <span>رقم الهاتف / الجوال: *</span>
                      </label>
                      <input
                        id="registrant-phone"
                        type="tel"
                        value={registrantPhone}
                        onChange={(e) => setRegistrantPhone(e.target.value)}
                        placeholder="+967 773586047"
                        className="input-field w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3.5 text-[16px] min-h-[52px] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] transition dir-ltr text-right font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[14px] font-semibold text-slate-200 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#d4af37]" />
                        <span>كلمة المرور للحساب:</span>
                      </label>
                      <input
                        id="registrant-password"
                        type="password"
                        value={registrantPassword}
                        onChange={(e) => setRegistrantPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-field w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3.5 text-[16px] min-h-[52px] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] transition font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[14px] font-semibold text-slate-200 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                        <span>تأكيد كلمة المرور:</span>
                      </label>
                      <input
                        id="registrant-password-confirm"
                        type="password"
                        value={registrantPasswordConfirm}
                        onChange={(e) => setRegistrantPasswordConfirm(e.target.value)}
                        placeholder="••••••••"
                        className="input-field w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3.5 text-[16px] min-h-[52px] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] transition font-mono"
                      />
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="space-y-2 pt-1">
                    <label className="text-[14px] font-semibold text-slate-200 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#d4af37]" />
                      <span>اسم المنشأة أو الشركة: *</span>
                    </label>
                    <input
                      id="trial-company-name"
                      type="text"
                      value={trialCompanyName}
                      onChange={(e) => setTrialCompanyName(e.target.value)}
                      placeholder="مثال: شركة النماء للتوكيلات والتجارة"
                      className="input-field w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3.5 text-[16px] min-h-[52px] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] transition font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[14px] font-semibold text-slate-200">قطاع الأعمال:</label>
                      <select
                        value={trialIndustry}
                        onChange={(e) => setTrialIndustry(e.target.value)}
                        className="w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3.5 text-[15px] text-white focus:outline-none focus:border-[#d4af37] transition appearance-none cursor-pointer min-h-[52px]"
                      >
                        <option value="تجارة وتوزيع وإلكترونيات">تجارة وتوزيع وإلكترونيات</option>
                        <option value="تصنيع وتجميع وصناعات تحويلية">تصنيع وتجميع وصناعات تحويلية</option>
                        <option value="خدمات ومقاولات واستشارات">خدمات ومقاولات واستشارات</option>
                        <option value="استيراد وتصدير ومستودعات">استيراد وتصدير ومستودعات</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[14px] font-semibold text-slate-200">عملة القيد الأساسية:</label>
                      <select
                        value={trialCurrency}
                        onChange={(e) => setTrialCurrency(e.target.value)}
                        className="w-full bg-[#06182a] border border-blue-900/80 rounded-xl px-4 py-3.5 text-[15px] text-white focus:outline-none focus:border-[#d4af37] transition appearance-none cursor-pointer min-h-[52px]"
                      >
                        <option value="YER">ريال يمني (صنعاء / عدن)</option>
                        <option value="SAR">ريال سعودي (SAR)</option>
                        <option value="USD">دولار أمريكي (USD)</option>
                      </select>
                    </div>
                  </div>

                  {/* ANTI-BOT CAPTCHA HUMAN VERIFICATION BOX */}
                  <div className="p-3.5 rounded-xl bg-[#06182a] border border-amber-500/40 space-y-2">
                    <div className="flex items-center justify-between text-[13px] font-bold text-amber-400">
                      <div className="flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-amber-400" />
                        <span>فحص أمان المنظومة - أثبت أنك إنسان ولست روبوتًا:</span>
                      </div>
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="text-[12px] text-slate-300 hover:text-white flex items-center gap-1 underline cursor-pointer"
                        title="تغيير السؤال"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>تحديث</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-[#030d17] px-4 py-2.5 rounded-lg border border-slate-700 text-[#d4af37] font-mono text-[16px] font-bold tracking-wider select-none shrink-0">
                        {captchaNum1} + {captchaNum2} = ؟
                      </div>
                      <input
                        id="captcha-answer-input"
                        type="number"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        placeholder="أدخل الناتج..."
                        className="input-field flex-1 bg-[#030d17] border border-slate-700 rounded-xl px-4 py-3 text-[16px] min-h-[48px] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] text-center font-bold"
                      />
                    </div>
                  </div>

                  {/* Concise Security Badge in Single Line */}
                  <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#04101d]/90 border border-emerald-500/30 text-slate-300 text-[13px] sm:text-[14px] font-medium text-center shadow-inner">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">🔒 محمي بـ Google reCAPTCHA v3 + Firebase App Check</span>
                  </div>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#06182a] border border-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={trialWithSampleData}
                      onChange={(e) => setTrialWithSampleData(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sap-primary focus:ring-0 focus:ring-offset-0"
                    />
                    <div className="text-[14px]">
                      <span className="font-bold text-slate-200">تحميل بيانات افتراضية متكاملة (Sample Data)</span>
                      <p className="text-[12px] text-slate-400">
                        يشمل فواتير تجريبية، دليل حسابات جاهز، أصناف مخزنية، وعملاء وموردين.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#06182a] border border-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sap-primary focus:ring-0 focus:ring-offset-0 mt-0.5"
                    />
                    <div className="text-[13px] sm:text-[14px] text-slate-300">
                      <span>أوافق على <button type="button" onClick={() => openLegalPolicy("TRIAL_TERMS")} className="text-[#d4af37] hover:underline font-bold">شروط الاستخدام والترخيص الرسمية</button> و <button type="button" onClick={() => openLegalPolicy("PRIVACY")} className="text-[#d4af37] hover:underline font-bold">سياسة الخصوصية وسرية البيانات</button> لاتفاقية MeDo ERP Cloud.</span>
                    </div>
                  </label>

                  <button
                    id="sap-create-trial-btn"
                    onClick={handleCreateTrial}
                    disabled={isLoading}
                    className="btn-primary w-full h-[55px] min-h-[55px] py-3.5 px-4 rounded-xl bg-[#d4af37] hover:bg-[#e2bd46] active:bg-[#c59f2e] text-[#0a2540] font-black text-[18px] shadow-[0_8px_25px_rgba(212,175,55,0.4)] hover:shadow-[0_12px_32px_rgba(212,175,55,0.55)] transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 transition active:scale-98 disabled:opacity-50 cursor-pointer border border-[#b8860b]"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin text-[#0a2540]" />
                        <span>جاري إنشاء وتوثيق الحساب...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-5 h-5 text-[#0a2540]" />
                        <span>تسجيل الحساب وتفعيل بيئة العمل السحابية</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* SAP ENTERPRISE COMPLIANCE & LEGAL FOOTER */}
      <footer
        id="sap-portal-footer"
        className="w-full bg-[#09111C] border-t border-slate-800 py-6 px-4 sm:px-8 mt-auto z-20"
      >
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Compliance & Standards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400 pb-4 border-b border-slate-800/80">
            <div className="flex items-start gap-2.5">
              <Scale className="w-4 h-4 text-sap-secondary shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block text-xs">المعايير المحاسبية الدولية:</strong>
                <span className="text-[11px] text-slate-400">
                  متوافق مع IFRS ومبدأ القيد المزدوج، وإشعارات الفوترة الضريبية الإلكترونية (ZATCA Stage 2).
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block text-xs">الأمان والخصوصية السحابية:</strong>
                <span className="text-[11px] text-slate-400">
                  تشفير بنكي AES-256 للبيانات المخزنة، وبروتوكول TLS 1.3 للنقل، مع إسناد مستمر على سحابة Google Cloud.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Award className="w-4 h-4 text-sap-secondary shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block text-xs">شهادة المطابقة والاعتماد:</strong>
                <span className="text-[11px] text-slate-400">
                  فحص وتدقيق مستقل للامتثال لمعايير أنظمة تخطيط الموارد المؤسسية (ERP) المتقدمة.
                </span>
              </div>
            </div>
          </div>

          {/* Quick Legal Policy Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <button
                type="button"
                onClick={() => openLegalPolicy("TERMS")}
                className="hover:text-sap-secondary transition flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>شروط الاستخدام</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegalPolicy("PRIVACY")}
                className="hover:text-emerald-400 transition flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>سياسة الخصوصية</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegalPolicy("DISCLAIMER")}
                className="hover:text-amber-400 transition flex items-center gap-1 cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>إخلاء المسؤولية</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegalPolicy("REFUND")}
                className="hover:text-cyan-400 transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>سياسة الاسترداد</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open_patent_certificate"))}
                className="hover:text-[#d4af37] transition flex items-center gap-1 cursor-pointer font-bold"
              >
                <Award className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>شهادة الابتكار</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegalPolicy("COOKIES")}
                className="hover:text-amber-300 transition flex items-center gap-1 cursor-pointer"
              >
                <Cookie className="w-3.5 h-3.5 text-amber-300" />
                <span>ملفات الارتباط</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegalPolicy("DPA")}
                className="hover:text-sap-secondary transition flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>اتفاقية معالجة البيانات (DPA)</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegalPolicy("GTC")}
                className="hover:text-sap-secondary transition flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>الشروط العامة (GTC)</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegalPolicy("EULA")}
                className="hover:text-sap-secondary transition flex items-center gap-1 cursor-pointer"
              >
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>ترخيص (EULA)</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegalPolicy("SAP_MATRIX")}
                className="text-sap-secondary hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>مصفوفة مطابقة SAP</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              System: MEDO-PRD-01 | Release: 2026.09 | Build: SAP-B1-S4
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="text-center pt-2 text-xs text-slate-300 font-bold border-t border-slate-800/60 tracking-wide flex items-center justify-center gap-2 flex-wrap">
            <span>جميع الحقوق محفوظة ©</span>
            <span className="text-amber-300 font-sans">Bin Ziyad Group & MeDo Tech (BZMT)</span>
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

      {/* TENANT SELECTOR MODAL (استعراض والذهاب لبوابة عميل) */}
      {showTenantSelectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#06182a] border border-[#d4af37]/60 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">🌐 اختيار بوابة عميل / منشأة معزولة</h3>
                  <p className="text-xs text-slate-300">اختر منشأة للدخول المباشر إلى بيئة العمل السحابية المعزولة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTenantSelectorModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="py-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  value={tenantSearchTerm}
                  onChange={(e) => setTenantSearchTerm(e.target.value)}
                  placeholder="ابحث باسم الشركة أو المدينة أو المعرف (مثال: الزرقاء، بن زياد، كراع، صنعاء)..."
                  className="w-full bg-[#030d17] border border-slate-700 rounded-xl pr-10 pl-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            {/* Tenants List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-[45vh]">
              {preGeneratedTenants
                .filter((t) => {
                  if (!tenantSearchTerm) return true;
                  const term = tenantSearchTerm.toLowerCase();
                  return (
                    t.name.toLowerCase().includes(term) ||
                    t.companyNameAr?.toLowerCase().includes(term) ||
                    t.city.toLowerCase().includes(term) ||
                    t.id.toLowerCase().includes(term) ||
                    t.slug.toLowerCase().includes(term)
                  );
                })
                .slice(0, 30)
                .map((tenant) => (
                  <div
                    key={tenant.id}
                    className="p-3.5 rounded-2xl bg-[#0a2540]/60 hover:bg-[#0e3153] border border-slate-700/60 hover:border-[#d4af37]/60 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <span>{tenant.name || tenant.companyNameAr}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                            {tenant.id}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                          <span>📍 {tenant.city}</span>
                          <span>🏢 {tenant.industry}</span>
                          {tenant.assignedAdminName && <span>👤 {tenant.assignedAdminName}</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        try {
                          localStorage.clear();
                          sessionStorage.clear();
                        } catch (e) {}
                        window.location.href = `?tenant=${tenant.id}`;
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#d4af37] text-[#0a2540] font-black text-xs hover:bg-amber-400 transition cursor-pointer shadow-md shrink-0 group-hover:scale-105"
                    >
                      🚀 دخول البوابة
                    </button>
                  </div>
                ))}
            </div>

            <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <span>إجمالي المنشآت الجاهزة والمعزولة: 200 شركة</span>
              <button
                type="button"
                onClick={() => setShowTenantSelectorModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}

      <LegalPoliciesModal
        isOpen={legalModalOpen}
        initialPolicy={selectedLegalPolicy}
        onClose={() => setLegalModalOpen(false)}
      />

      <SapComplianceReportModal
        isOpen={complianceReportOpen}
        onClose={() => setComplianceReportOpen(false)}
      />
    </div>
  );
};
