import React, { useState, useEffect, useRef, lazy, Suspense, useCallback } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { Sidebar, NavTab } from "./components/Sidebar";
import { Header } from "./components/Header";
import { IS_ADMIN_ENV } from "./config/env";

import { Dashboard } from "./components/Dashboard";
import { ChartOfAccountsView } from "./components/ChartOfAccountsView";
import { JournalEntriesView } from "./components/JournalEntriesView";
import { VouchersView } from "./components/VouchersView";
import { CashAndBankView } from "./components/CashAndBankView";
import { CustomersAndARView } from "./components/CustomersAndARView";
import { VendorsAndAPView } from "./components/VendorsAndAPView";
import { SalesAndReturnsView } from "./components/SalesAndReturnsView";
import { PurchasesAndReturnsView } from "./components/PurchasesAndReturnsView";
import { FinancialReportsView } from "./components/FinancialReportsView";
import { CostCentersAndAssetsView } from "./components/CostCentersAndAssetsView";
import { FixedAssetsModule } from "./components/FixedAssetsModule";
import { CurrencySettingsView } from "./components/CurrencySettingsView";
import { GeneralLedgerView } from "./components/GeneralLedgerView";
import { SystemSettingsView } from "./components/SystemSettingsView";
import { ScheduledBackupView } from "./components/ScheduledBackupView";
import { InventoryView } from "./components/InventoryView";
import { HumanResourcesView } from "./components/HumanResourcesView";
import { ExpensesAndRevenuesView } from "./components/ExpensesAndRevenuesView";
import { BranchManagementView } from "./components/BranchManagementView";
import { CloudSyncDashboard } from "./components/CloudSyncDashboard";
import { OfflineSyncCenter } from "./components/OfflineSyncCenter";
import { ThemeStudioView } from "./components/ThemeStudioView";
import { EnterpriseCollaborationView } from "./components/EnterpriseCollaborationView";
import { IntegratedErpSuiteView } from "./components/IntegratedErpSuiteView";
import { SaaSPlatformView } from "./components/SaaSPlatformView";
import { SaaSRegistrationPortal } from "./components/SaaSRegistrationPortal";
import { ClientExchangeView } from "./components/ClientExchangeView";
import { TrustCenterView } from "./components/TrustCenterView";
import { MedoErpBrochureView } from "./components/MedoErpBrochureView";
import { UserManualView } from "./components/UserManualView";
import { ExecutiveMasterSystemSuite } from "./components/ExecutiveMasterSystemSuite";
import { PartnersManagementView } from "./components/partners/PartnersManagementView";
import { CentralArchiveSection } from "./components/CentralArchiveSection";
import { SystemFooter } from "./components/SystemFooter";
import { LegalDocumentsPage } from "./components/LegalDocumentsPage";
import { PatentCertificateView } from "./components/PatentCertificateView";
import { TrialLockModal } from "./components/TrialLockModal";
import { TrialManagerDashboardModal } from "./components/TrialManagerDashboardModal";
import { ThemeManager } from "./services/themeManager";
import { ScheduledBackupEngine } from "./services/scheduledBackupEngine";
import { LocalSyncEngine } from "./services/localSyncEngine";
import { AiFinancialAdvisorModal } from "./components/AiFinancialAdvisorModal";
import { AiVoiceSearchModal } from "./components/AiVoiceSearchModal";
import { GlobalSearchModal } from "./components/GlobalSearchModal";
import { PrintDocumentModal } from "./components/PrintDocumentModal";
import { ShareDocumentModal, ShareData } from "./components/ShareDocumentModal";
import { MobileTopBar } from "./components/MobileTopBar";
import { MobileHomeHub } from "./components/MobileHomeHub";
import { MobileFloatingActionButton } from "./components/MobileFloatingActionButton";
import { MobileDocumentDetailModal, DetailDocument } from "./components/MobileDocumentDetailModal";
import { MobileNotificationsSheet } from "./components/MobileNotificationsSheet";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";
import { LoginModal } from "./components/LoginModal";
import { CorporateWebsite } from "./components/CorporateWebsite";
import { SapOnboardingModal } from "./components/SapOnboardingModal";
import { SystemUpdateModal } from "./components/SystemUpdateModal";
import { InstantDeployModal } from "./components/InstantDeployModal";
import { LegalPoliciesModal, LegalPolicyType } from "./components/LegalPoliciesModal";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
import { SapUniversalSearchModal } from "./components/SapUniversalSearchModal";
import { SovereignRejuvenationModal } from "./components/SovereignRejuvenationModal";
import { soundService } from "./services/notificationSoundService";
import { trialService, TrialState } from "./services/trialService";
import { trialOperationsService } from "./services/trialOperationsService";
import { SecretAdminGatewayModal } from "./components/SecretAdminGatewayModal";
import { AdminPortalSecurityService } from "./services/adminPortalSecurityService";
import { UnauthorizedAccessView } from "./components/UnauthorizedAccessView";
import { RoleSwitchingToolbar } from "./components/RoleSwitchingToolbar";
import {
  Account,
  BankAccountItem,
  Branch,
  CashVaultItem,
  CostCenter,
  CurrencyCode,
  CurrencyInfo,
  Customer,
  ERPState,
  ERPUser,
  FixedAsset,
  AssetMaintenanceRecord,
  AssetTransferRecord,
  Invoice,
  JournalEntry,
  SystemSettings,
  Vendor,
  Voucher,
  InventoryItem,
  StockMovement,
  UnavailableItemRequest,
  ERPRole,
  HREmployee,
  HRAdministrativeDecision,
  HRAttendanceRecord,
  HRWorkingShift,
  HRMonthlyPayroll,
  HRLoan,
  CorrespondenceDocument,
  ApprovalRequest,
  AuditLogEntry,
  SystemAlert,
  ChatChannel,
  ChatMessage,
  AdministrativeCircular,
  WorkflowRouteRule,
  ExchangeAccount,
  ExchangeTransaction,
  Partner,
  PartnerContribution,
  ProfitDistribution,
  PartnerWithdrawal,
} from "./types/erp";
import { PostgresRepository } from "./services/postgresRepository";
import { ERPRepository } from "./services/repository";
import { AnalyticsTracker, trackEvent } from "./components/marketing/AnalyticsTracker";
import {
  DEFAULT_SYSTEM_SETTINGS,
  convertCurrency,
  exportERPDataAsJSON,
  importERPDataFromJSON,
  loadERPState,
  recalculateAllAccountBalances,
  resetERPStateToDefault,
  saveERPState,
} from "./services/erpStorage";
import { NotificationSoundService } from "./services/notificationSoundService";
import { TenantIsolationService } from "./services/tenantIsolationService";
import { findTenantById } from "./data/preGeneratedTenants";

const repository: ERPRepository = new PostgresRepository();

export default function App() {
  const [erpState, setErpState] = useState<ERPState | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab | "HOME_HUB">(() => {
    return typeof window !== "undefined" && window.innerWidth < 1024 ? "HOME_HUB" : "DASHBOARD";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [mobileDetailDoc, setMobileDetailDoc] = useState<DetailDocument | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return true;
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("YER_SANAA");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [globalSearchInitialQuery, setGlobalSearchInitialQuery] = useState("");
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return ThemeManager.isHighContrast();
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return ThemeManager.isDarkMode();
  });
  const [syncViewTab, setSyncViewTab] = useState<"OFFLINE_LOCAL" | "CLOUD_MONITOR">("OFFLINE_LOCAL");
  const [isTrialLockModalOpen, setIsTrialLockModalOpen] = useState(false);
  const [globalLegalModalOpen, setGlobalLegalModalOpen] = useState(false);
  const [globalLegalPolicy, setGlobalLegalPolicy] = useState<LegalPolicyType>("TRIAL_TERMS");
  const [legalInitialDoc, setLegalInitialDoc] = useState<"TERMS" | "PRIVACY" | "DISCLAIMER" | "REFUND" | "COOKIES">("TERMS");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [showPatent, setShowPatent] = useState(false);
  const [isSelfRegistrationOpen, setIsSelfRegistrationOpen] = useState(false);
  const [isUniversalSearchOpen, setIsUniversalSearchOpen] = useState(false);
  const [isInstantDeployOpen, setIsInstantDeployOpen] = useState(false);
  const [isSovereignRejuvenationOpen, setIsSovereignRejuvenationOpen] = useState(false);

  useEffect(() => {
    const handleOpenSelfReg = () => {
      setIsSelfRegistrationOpen(true);
    };
    const handleOpenUniversalSearch = () => {
      setIsUniversalSearchOpen(true);
    };
    const handleOpenPatent = () => {
      setShowPatent(true);
    };
    const handleOpenInstantDeploy = () => {
      setIsInstantDeployOpen(true);
    };
    const handleOpenRejuvenation = () => {
      setIsSovereignRejuvenationOpen(true);
    };
    window.addEventListener("open_self_registration", handleOpenSelfReg);
    window.addEventListener("open_universal_search", handleOpenUniversalSearch);
    window.addEventListener("open_patent_certificate", handleOpenPatent);
    window.addEventListener("open_instant_deploy", handleOpenInstantDeploy);
    window.addEventListener("open_sovereign_rejuvenation", handleOpenRejuvenation);
    return () => {
      window.removeEventListener("open_self_registration", handleOpenSelfReg);
      window.removeEventListener("open_universal_search", handleOpenUniversalSearch);
      window.removeEventListener("open_patent_certificate", handleOpenPatent);
      window.removeEventListener("open_instant_deploy", handleOpenInstantDeploy);
      window.removeEventListener("open_sovereign_rejuvenation", handleOpenRejuvenation);
    };
  }, []);
  const [isSystemUpdateOpen, setIsSystemUpdateOpen] = useState(false);
  const [isRefreshingData, setIsRefreshingData] = useState(false);
  const [refreshSuccessMessage, setRefreshSuccessMessage] = useState<string | null>(null);
  const [activatedLicenseBanner, setActivatedLicenseBanner] = useState<{ companyName: string; user: string } | null>(null);
  const [appVersion, setAppVersion] = useState<string>("V1.2.4");

  /**
   * [VIP TENANT LOADER & STRICT SESSION ISOLATION]
   * Detects tenant change from URL, verifies against currentTenant/storedSlug, purges conflicting tenant cache, and synchronizes company branding & permissions.
   */
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tenantParam = searchParams.get('tenant') || searchParams.get('client') || searchParams.get('company');
    
    if (tenantParam) {
      const storedSlug = localStorage.getItem("medo_active_tenant_slug");
      const currentTenantRaw = localStorage.getItem("currentTenant");
      const matched = findTenantById(tenantParam);
      const targetSlug = matched ? matched.id : tenantParam.toLowerCase().trim();
      
      // Check for mismatch against stored active slug or currentTenant object
      let isMismatch = storedSlug && storedSlug !== targetSlug;
      if (!isMismatch && currentTenantRaw) {
        try {
          const current = JSON.parse(currentTenantRaw);
          if (current.id !== targetSlug && current.slug !== targetSlug) {
            isMismatch = true;
          }
        } catch (e) {}
      }

      // Always clear stale individual company branding caches
      localStorage.removeItem('tenantName');
      localStorage.removeItem('companyName');
      localStorage.removeItem('mdo_print_header_ar');
      localStorage.removeItem('mdo_print_header_en');
      localStorage.removeItem('mdo_print_phone');
      localStorage.removeItem('mdo_print_tax_reg');

      if (isMismatch) {
        console.log(`[IsolationGuard] Tenant mismatch detected: active ${storedSlug} vs requested ${targetSlug}. Purging stale session...`);
        localStorage.removeItem('currentSession');
        localStorage.removeItem('medo_erp_state_v1');
        localStorage.removeItem('medo_erp_current_user_v1');
        localStorage.removeItem('medo_original_manager_session');
        localStorage.removeItem('medo_erp_auth');
        try { sessionStorage.clear(); } catch(e) {}
      }

      TenantIsolationService.setActiveTenant(targetSlug);
      if (matched) {
        localStorage.setItem('currentTenant', JSON.stringify(matched));
      }
      const details = TenantIsolationService.getActiveTenantDetails(targetSlug);
      document.title = `${details.nameAr} - منظومة MeDo ERP السحابية السيادية`;
      
      // Update global state immediately with cleanly isolated state
      const freshIsolatedState = loadERPState(targetSlug);
      setErpState({
        ...freshIsolatedState,
        systemSettings: {
          ...freshIsolatedState.systemSettings,
          companyNameAr: details.nameAr,
          companyNameEn: details.nameEn,
          commercialRegister: details.commercialReg,
          taxNumber: details.taxNumber,
          phone: details.phone,
          address: details.address,
        }
      });
    }
  }, []);

  // Sovereign 3-Layer Admin Security Engine States & Dedicated License Activation
  const [isAdminSessionUnlocked, setIsAdminSessionUnlocked] = useState<boolean>(() => {
    return AdminPortalSecurityService.isAdminSessionActive();
  });
  const [isSecretGatewayOpen, setIsSecretGatewayOpen] = useState(false);
  const [isTrialManagerOpen, setIsTrialManagerOpen] = useState(false);

  /**
   * Central Authentication & Token Security Guard
   * Validates token authenticity, role matching, and isolates permissions before modules load
   */
  const checkAuthAccess = useCallback((): {
    isAuthenticated: boolean;
    user: ERPUser | null;
    role: "SYSTEM_ADMIN" | "ACCOUNTANT" | "DATA_ENTRY" | "AUDITOR" | "CASHIER" | null;
    initialTab: NavTab | "HOME_HUB";
  } => {
    const empFromUrl = TenantIsolationService.parseEmployeeFromUrl();
    if (!empFromUrl) {
      return {
        isAuthenticated: sessionStorage.getItem("medo_erp_auth") === "true",
        user: erpState?.currentUser || null,
        role: (erpState?.currentUser?.role as any) || null,
        initialTab: activeTab,
      };
    }

    const isTokenValid = TenantIsolationService.validateTokenForRole(empFromUrl.token, empFromUrl.role);
    if (!isTokenValid) {
      console.warn("⛔ checkAuthAccess: Invalid or mismatched Token for role:", empFromUrl);
      sessionStorage.removeItem("medo_erp_auth");
      localStorage.removeItem("medo_erp_admin_mode");
      setIsAuthenticated(false);
      setIsAdminSessionUnlocked(false);
      return {
        isAuthenticated: false,
        user: null,
        role: null,
        initialTab: "SALES_RETURNS",
      };
    }

    let mappedRole: "SYSTEM_ADMIN" | "ACCOUNTANT" | "DATA_ENTRY" | "AUDITOR" | "CASHIER" = "CASHIER";
    let startTab: NavTab = "SALES_RETURNS";

    if (empFromUrl.role === "MANAGER" || empFromUrl.role === "SYSTEM_ADMIN" || empFromUrl.role === "ADMIN") {
      mappedRole = "SYSTEM_ADMIN";
      startTab = "DASHBOARD";
    } else if (empFromUrl.role === "SALES" || empFromUrl.role === "CASHIER" || empFromUrl.role === "POS") {
      mappedRole = "CASHIER";
      startTab = "SALES_RETURNS";
    } else if (empFromUrl.role === "PURCHASER" || empFromUrl.role === "DATA_ENTRY" || empFromUrl.role === "PURCHASES") {
      mappedRole = "DATA_ENTRY";
      startTab = "PURCHASES_RETURNS";
    } else if (empFromUrl.role === "AUDITOR") {
      mappedRole = "AUDITOR";
      startTab = "FINANCIAL_REPORTS";
    } else if (empFromUrl.role === "ACCOUNTANT") {
      mappedRole = "ACCOUNTANT";
      startTab = "GENERAL_LEDGER";
    }

    const employeeUser: ERPUser = {
      id: `EMP-${empFromUrl.role}-${Date.now().toString().slice(-4)}`,
      name: empFromUrl.employeeName,
      role: mappedRole,
      branch: "الفرع الرئيسي - صنعاء",
      status: "ACTIVE",
      avatar: empFromUrl.role.slice(0, 2),
    };

    setIsAuthenticated(true);
    sessionStorage.setItem("medo_erp_auth", "true");
    setActiveTab(startTab);

    // Retrieve company metadata from 200 matrix if applicable
    const activeTenantDetails = TenantIsolationService.getActiveTenantDetails();

    setErpState((prev) => ({
      ...prev,
      currentUser: employeeUser,
      systemSettings: {
        ...prev.systemSettings,
        companyNameAr: activeTenantDetails.nameAr,
        companyNameEn: activeTenantDetails.nameEn,
        commercialRegister: activeTenantDetails.commercialReg,
        taxNumber: activeTenantDetails.taxNumber,
        phone: activeTenantDetails.phone,
        address: activeTenantDetails.address,
      },
    }));

    // Role authorization isolation
    if (mappedRole === "SYSTEM_ADMIN") {
      setIsAdminSessionUnlocked(true);
      localStorage.setItem("medo_erp_admin_mode", "true");
      const mgrSession = {
        isManager: true,
        managerName: employeeUser.name || "أ. بدر عايض محمد (المدير العام)",
        tenantSlug: empFromUrl.tenantSlug || TenantIsolationService.resolveActiveTenant() || "binziyad",
        token: empFromUrl.token || "AUTH_MGR_AUTO",
        timestamp: Date.now()
      };
      sessionStorage.setItem("medo_original_manager_session", JSON.stringify(mgrSession));
      localStorage.setItem("medo_original_manager_session", JSON.stringify(mgrSession));
    } else {
      setIsAdminSessionUnlocked(false);
      localStorage.removeItem("medo_erp_admin_mode");
    }

    return {
      isAuthenticated: true,
      user: employeeUser,
      role: mappedRole,
      initialTab: startTab,
    };
  }, []);

  // Manager Original Session Tracking State
  const [hasOriginalManagerSession, setHasOriginalManagerSession] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(
      sessionStorage.getItem("medo_original_manager_session") ||
      localStorage.getItem("medo_original_manager_session")
    );
  });

  useEffect(() => {
    const checkSession = () => {
      const sessionExists = Boolean(
        sessionStorage.getItem("medo_original_manager_session") ||
        localStorage.getItem("medo_original_manager_session")
      );
      setHasOriginalManagerSession(sessionExists);
    };
    checkSession();
    window.addEventListener("storage", checkSession);
    return () => window.removeEventListener("storage", checkSession);
  }, [erpState?.currentUser]);

  // Global Logout Handler
  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("medo_erp_auth");
    sessionStorage.removeItem("medo_original_manager_session");
    sessionStorage.removeItem("medo_designer_badr_auth");
    localStorage.removeItem("medo_erp_admin_mode");
    localStorage.removeItem("medo_original_manager_session");

    setIsAuthenticated(false);
    setIsAdminSessionUnlocked(false);
    setHasOriginalManagerSession(false);

    setErpState((prev) => prev ? ({
      ...prev,
      currentUser: {
        id: "GUEST",
        name: "زائر غير مسجل",
        role: "CASHIER",
        branch: "الفرع الرئيسي",
        status: "ACTIVE",
        avatar: "🚪",
      }
    }) : null);

    window.history.pushState({}, "", window.location.pathname);
    setRefreshSuccessMessage("🚪 تم تسجيل الخروج بنجاح. مرحباً بك في بوابة الدخول الرئيسية.");
    soundService.playSound("ROYAL_BANK_CHIME");
    setTimeout(() => setRefreshSuccessMessage(null), 4000);
  }, []);

  // Handler to Return Back to Manager Mode
  const handleSwitchBackToManager = useCallback(() => {
    let mgrSessionRaw = sessionStorage.getItem("medo_original_manager_session") || localStorage.getItem("medo_original_manager_session");
    let mgrSession: any = null;
    if (mgrSessionRaw) {
      try { mgrSession = JSON.parse(mgrSessionRaw); } catch (e) {}
    }

    const managerUser: ERPUser = {
      id: "EMP-MANAGER-9999",
      name: mgrSession?.managerName || "أ. بدر عايض محمد (المدير العام)",
      role: "SYSTEM_ADMIN",
      branch: "الفرع الرئيسي - صنعاء",
      status: "ACTIVE",
      avatar: "👑",
    };

    setIsAdminSessionUnlocked(true);
    localStorage.setItem("medo_erp_admin_mode", "true");
    setIsAuthenticated(true);
    sessionStorage.setItem("medo_erp_auth", "true");

    setErpState((prev) => prev ? ({
      ...prev,
      currentUser: managerUser,
    }) : null);

    setActiveTab("DASHBOARD");

    const tenant = mgrSession?.tenantSlug || TenantIsolationService.resolveActiveTenant() || "binziyad";
    const token = mgrSession?.token || "AUTH_MGR_AUTO";
    const newUrl = `${window.location.pathname}?tenant=${tenant}&role=MANAGER&token=${token}&path=/employee/manager`;
    window.history.pushState({}, "", newUrl);

    setRefreshSuccessMessage("👑 تم العودة بنجاح إلى وضع المدير العام واستعادة كامل الصلاحيات الإدارية والمالية!");
    soundService.playSound("ROYAL_BANK_CHIME");
    setTimeout(() => setRefreshSuccessMessage(null), 5000);
  }, []);

  // Handler to Switch to Test Role safely
  const handleSwitchRole = useCallback((targetRole: "MANAGER" | "ACCOUNTANT" | "PURCHASER" | "CASHIER" | "AUDITOR") => {
    if (targetRole === "MANAGER") {
      handleSwitchBackToManager();
      return;
    }

    if (erpState?.currentUser?.role === "SYSTEM_ADMIN" || erpState?.currentUser?.role === "ADMIN") {
      const mgrSession = {
        isManager: true,
        managerName: erpState.currentUser.name || "أ. بدر عايض محمد (المدير العام)",
        tenantSlug: TenantIsolationService.resolveActiveTenant() || "binziyad",
        token: "AUTH_MGR_AUTO",
        timestamp: Date.now()
      };
      sessionStorage.setItem("medo_original_manager_session", JSON.stringify(mgrSession));
      localStorage.setItem("medo_original_manager_session", JSON.stringify(mgrSession));
      setHasOriginalManagerSession(true);
    }

    let mappedRole: "SYSTEM_ADMIN" | "ACCOUNTANT" | "DATA_ENTRY" | "AUDITOR" | "CASHIER" = "CASHIER";
    let startTab: NavTab = "SALES_RETURNS";
    let empName = "أ. محمود صالح يحيى عايض (مسؤول المبيعات ونقاط البيع)";
    let roleTitleAr = "مسؤول المبيعات ونقاط البيع";

    if (targetRole === "CASHIER") {
      mappedRole = "CASHIER";
      startTab = "SALES_RETURNS";
      empName = "أ. محمود صالح يحيى عايض (مسؤول المبيعات ونقاط البيع)";
      roleTitleAr = "مسؤول المبيعات ونقاط البيع";
    } else if (targetRole === "ACCOUNTANT") {
      mappedRole = "ACCOUNTANT";
      startTab = "GENERAL_LEDGER";
      empName = "أ. محمد عبد الله العريقي (المحاسب المالي العام)";
      roleTitleAr = "المحاسب المالي العام";
    } else if (targetRole === "PURCHASER") {
      mappedRole = "DATA_ENTRY";
      startTab = "PURCHASES_RETURNS";
      empName = "أ. علي أحمد المخلافي (مسؤول المشتريات والمخازن)";
      roleTitleAr = "مسؤول المشتريات والمخازن";
    } else if (targetRole === "AUDITOR") {
      mappedRole = "AUDITOR";
      startTab = "FINANCIAL_REPORTS";
      empName = "أ. سامي عبد الرحمن الحكيمي (المراجع والمدقق المالي)";
      roleTitleAr = "المراجع والمدقق المالي";
    }

    const newEmpUser: ERPUser = {
      id: `EMP-${targetRole}-${Date.now().toString().slice(-4)}`,
      name: empName,
      role: mappedRole,
      branch: "الفرع الرئيسي - صنعاء",
      status: "ACTIVE",
      avatar: targetRole.slice(0, 2),
    };

    setIsAdminSessionUnlocked(false);
    localStorage.removeItem("medo_erp_admin_mode");

    setErpState((prev) => prev ? ({
      ...prev,
      currentUser: newEmpUser,
    }) : null);

    setActiveTab(startTab);

    const tenant = TenantIsolationService.resolveActiveTenant() || "binziyad";
    const newUrl = `${window.location.pathname}?tenant=${tenant}&role=${targetRole}&token=AUTH_${targetRole}_AUTO&path=/employee/${targetRole.toLowerCase()}`;
    window.history.pushState({}, "", newUrl);

    setRefreshSuccessMessage(`🔄 تم التبديل التجريبي إلى دور (${roleTitleAr}). يمكنك العودة لوضع المدير العام في أي وقت!`);
    soundService.playSound("SUCCESS_CHIME");
    setTimeout(() => setRefreshSuccessMessage(null), 5000);
  }, [erpState?.currentUser, handleSwitchBackToManager]);

  // ⚡ Priority #1: Central Auth & Token Access Verification Hook (Executes before module load)
  useEffect(() => {
    const authResult = checkAuthAccess();
    if (authResult.isAuthenticated && authResult.user) {
      setRefreshSuccessMessage(`🔒 تم التحقق الأمني من الـ Token والصلاحية (${authResult.user.name}) - الوحدة المصرح بها: ${authResult.initialTab}`);
      setTimeout(() => setRefreshSuccessMessage(null), 4000);
    }
  }, [checkAuthAccess]);

  // Secret Admin URL & Auto-Sanitization & License Token Activation Listener
  useEffect(() => {
    // 0. Register Trial Client Access if on trial link
    const activeTenant = TenantIsolationService.resolveActiveTenant();
    if (TenantIsolationService.isTrialClientTenant(activeTenant)) {
      trialOperationsService.registerClientAccess(activeTenant);
      if (trialOperationsService.isTrialLocked(activeTenant, erpState?.currentUser?.role)) {
        setIsTrialLockModalOpen(true);
      }
    }

    // 1. Check if user opened a dedicated license activation link
    const activationResult = trialService.checkAndActivateFromUrl();
    if (activationResult.activated && activationResult.companyName) {
      setActivatedLicenseBanner({
        companyName: activationResult.companyName,
        user: activationResult.user || "المفوض المعتمد",
      });
      soundService.playSound("SUCCESS_CHIME");
    }

    // 2. Sanitize generic /admin or /saas URLs -> Redirect immediately
    AdminPortalSecurityService.sanitizeUrlIfGenericAdminAttempt();

    // 3. Detect Secret Admin URL Access
    if (AdminPortalSecurityService.isSecretUrlAccessed()) {
      setIsSecretGatewayOpen(true);
      AdminPortalSecurityService.cleanSecretUrlFromAddressBar();
    }

    const handleLocationEvent = () => {
      AdminPortalSecurityService.sanitizeUrlIfGenericAdminAttempt();
      if (AdminPortalSecurityService.isSecretUrlAccessed()) {
        setIsSecretGatewayOpen(true);
        AdminPortalSecurityService.cleanSecretUrlFromAddressBar();
      }
    };

    window.addEventListener("popstate", handleLocationEvent);
    window.addEventListener("hashchange", handleLocationEvent);
    return () => {
      window.removeEventListener("popstate", handleLocationEvent);
      window.removeEventListener("hashchange", handleLocationEvent);
    };
  }, []);

  const isMasterAdminActive = Boolean(IS_ADMIN_ENV || isAdminSessionUnlocked);

  const applyUrlEmployeeToState = (loaded: any): any => {
    if (!loaded) return loaded;

    const activeTenantDetails = TenantIsolationService.getActiveTenantDetails();
    const stateWithTenantInfo = {
      ...loaded,
      systemSettings: {
        ...(loaded?.systemSettings || {}),
        companyNameAr: activeTenantDetails.nameAr,
        companyNameEn: activeTenantDetails.nameEn,
        commercialRegister: activeTenantDetails.commercialReg,
        taxNumber: activeTenantDetails.taxNumber,
        phone: activeTenantDetails.phone,
        address: activeTenantDetails.address,
      },
    };

    const empFromUrl = TenantIsolationService.parseEmployeeFromUrl();
    if (!empFromUrl) return stateWithTenantInfo;

    const isTokenValid = TenantIsolationService.validateTokenForRole(empFromUrl.token, empFromUrl.role);
    if (!isTokenValid) return stateWithTenantInfo;

    let mappedRole: "SYSTEM_ADMIN" | "ACCOUNTANT" | "DATA_ENTRY" | "AUDITOR" | "CASHIER" = "CASHIER";

    if (empFromUrl.role === "MANAGER" || empFromUrl.role === "SYSTEM_ADMIN") {
      mappedRole = "SYSTEM_ADMIN";
    } else if (empFromUrl.role === "SALES" || empFromUrl.role === "CASHIER") {
      mappedRole = "CASHIER";
    } else if (empFromUrl.role === "PURCHASER" || empFromUrl.role === "DATA_ENTRY") {
      mappedRole = "DATA_ENTRY";
    } else if (empFromUrl.role === "AUDITOR") {
      mappedRole = "AUDITOR";
    } else if (empFromUrl.role === "ACCOUNTANT") {
      mappedRole = "ACCOUNTANT";
    }

    const employeeUser: ERPUser = {
      id: `EMP-${empFromUrl.role}-${Date.now().toString().slice(-4)}`,
      name: empFromUrl.employeeName,
      role: mappedRole,
      branch: "الفرع الرئيسي - صنعاء",
      status: "ACTIVE",
      avatar: empFromUrl.role.slice(0, 2),
    };

    return {
      ...stateWithTenantInfo,
      currentUser: employeeUser,
    };
  };

  const handleGlobalRefresh = () => {
    setIsRefreshingData(true);
    soundService.playSound("SUCCESS_CHIME");

    setTimeout(() => {
      repository.loadState().then((loaded) => {
        const resolvedState = applyUrlEmployeeToState(loaded);
        if (resolvedState) {
          updateStateWithRecalculatedGL(resolvedState);
        } else {
          const fresh = applyUrlEmployeeToState(loadERPState());
          updateStateWithRecalculatedGL(fresh);
        }
        setIsRefreshingData(false);
        setRefreshSuccessMessage("✨ تم تحديث ومزامنة كافة الوحدات المحاسبية والمستودعات وإلغاء القيود المعلقة وحل التعليقات بنجاح!");
        setTimeout(() => setRefreshSuccessMessage(null), 4500);
      }).catch(() => {
        const fresh = applyUrlEmployeeToState(loadERPState());
        updateStateWithRecalculatedGL(fresh);
        setIsRefreshingData(false);
        setRefreshSuccessMessage("✨ تم تحديث ومزامنة كافة الوحدات المحاسبية بنجاح!");
        setTimeout(() => setRefreshSuccessMessage(null), 4000);
      });
    }, 600);
  };

  const erpStateRef = useRef<ERPState | null>(erpState);
  erpStateRef.current = erpState;

  useEffect(() => {
    const active = ThemeManager.getActiveTheme();
    ThemeManager.applyTheme(active, false);
    setIsDarkMode(active.mode !== "light");
    setHighContrast(ThemeManager.isHighContrast());
    repository.loadState().then((loaded) => {
      const resolvedState = applyUrlEmployeeToState(loaded);
      // Ensure scheduled backup is fully active by default
      if (resolvedState && (!resolvedState.systemSettings?.scheduledBackup || resolvedState.systemSettings.scheduledBackup.enabled === false)) {
        const activeBackupSettings = {
          ...(resolvedState.systemSettings?.scheduledBackup || {
            frequency: "EVERY_12_HOURS",
            scheduledTime: "02:00",
            autoEncrypt: true,
            encryptionKey: "MeDo-SAP-EncKey-9F2kL8xA3p",
            uploadToCloud: true,
            cloudStoragePath: "cloud_backups",
            keepMaxBackups: 15,
            lastBackupStatus: "SUCCESS",
            lastBackupMessage: "تم تفعيل النسخ الاحتياطي التلقائي المتعدد بنجاح",
          }),
          enabled: true,
          nextScheduledAt: new Date(Date.now() + 3600000 * 6).toISOString(),
        };
        const updatedState = {
          ...resolvedState,
          systemSettings: {
            ...resolvedState.systemSettings!,
            scheduledBackup: activeBackupSettings,
          },
        };
        setErpState(updatedState);
        repository.saveState(updatedState);
      } else {
        setErpState(resolvedState);
      }
    });
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        sessionStorage.setItem("medo_erp_auth", "true");
        trackEvent('login', { method: 'firebase' });
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Role-Based Tab Guard & Auto-Redirect
  useEffect(() => {
    const role = erpState?.currentUser?.role;
    if (role === "CASHIER") {
      const allowedSalesTabs: (NavTab | "HOME_HUB")[] = [
        "SALES_RETURNS",
        "CUSTOMERS_AR",
        "INVENTORY",
        "CASH_AND_BANK",
        "USER_MANUAL",
        "MEDO_BROCHURE",
        "AI_ASSISTANT",
        "COLLABORATION",
      ];
      if (!allowedSalesTabs.includes(activeTab)) {
        setActiveTab("SALES_RETURNS");
      }
    } else if (role === "DATA_ENTRY") {
      const allowedProcurementTabs: (NavTab | "HOME_HUB")[] = [
        "PURCHASES_RETURNS",
        "VENDORS_AP",
        "INVENTORY",
        "VOUCHERS",
        "USER_MANUAL",
        "MEDO_BROCHURE",
        "AI_ASSISTANT",
        "COLLABORATION",
      ];
      if (!allowedProcurementTabs.includes(activeTab)) {
        setActiveTab("PURCHASES_RETURNS");
      }
    } else if (role === "AUDITOR") {
      const allowedAuditorTabs: (NavTab | "HOME_HUB")[] = [
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
      if (!allowedAuditorTabs.includes(activeTab)) {
        setActiveTab("FINANCIAL_REPORTS");
      }
    }
  }, [erpState?.currentUser?.role, activeTab]);

  // Background Scheduled Backup Engine Initialization (Always active & reactive)
  useEffect(() => {
    if (erpState) {
      const backupEngine = ScheduledBackupEngine.getInstance();
      backupEngine.startBackgroundScheduler(
        () => erpStateRef.current || erpState,
        (updatedSettings) => {
          setErpState((prev) => (prev ? { ...prev, systemSettings: updatedSettings } : prev));
        }
      );
      return () => {
        backupEngine.stopBackgroundScheduler();
      };
    }
  }, [
    erpState?.systemSettings?.scheduledBackup?.enabled,
    erpState?.systemSettings?.scheduledBackup?.frequency,
    erpState?.systemSettings?.scheduledBackup?.scheduledTime,
  ]);

  // Global Keyboard Shortcut for Smart Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Toggle High Contrast
  const handleToggleHighContrast = () => {
    const newTheme = ThemeManager.toggleHighContrast();
    const isHC = ThemeManager.isHighContrast();
    setHighContrast(isHC);
    setIsDarkMode(newTheme.mode !== "light");
  };

  // Toggle Light/Dark Mode
  const handleToggleDarkMode = () => {
    const newTheme = ThemeManager.toggleDarkLightMode();
    setIsDarkMode(newTheme.mode !== "light");
  };

  // Document Print Modal
  const [printDocType, setPrintDocType] = useState<"JOURNAL" | "RECEIPT" | "PAYMENT" | "INVOICE" | null>(null);
  const [printDocData, setPrintDocData] = useState<any>(null);

  // Document Share Modal (WhatsApp / SMS)
  const [shareData, setShareData] = useState<ShareData | null>(null);

  const handleOpenShareDoc = (data: ShareData) => {
    setShareData(data);
  };

  // Auto-persist state changes with debounce to prevent UI freezing
  useEffect(() => {
    if (!erpState) return;
    const timer = setTimeout(() => {
      try {
        saveERPState(erpState); // local backup
        LocalSyncEngine.getInstance().saveSnapshot(erpState); // encrypted local snapshot
        repository.saveState(erpState); // postgres sync
      } catch (err) {
        console.error("Persistence error:", err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [erpState]);

  // Recalculate GL balances when transactions change
  const updateStateWithRecalculatedGL = (newState: Partial<ERPState>) => {
    setErpState((prev) => {
      const merged: ERPState = { ...prev, ...newState };
      const updatedAccounts = recalculateAllAccountBalances(
        merged.accounts,
        merged.journalEntries,
        merged.currencies
      );
      return { ...merged, accounts: updatedAccounts };
    });
  };

  // --- Handlers ---

  // Verify and enforce 50-operation trial limits for trial tenants
  const checkAndRegisterTrialOperation = (actionName: string): boolean => {
    const activeTenant = TenantIsolationService.resolveActiveTenant();
    if (!TenantIsolationService.isTrialClientTenant(activeTenant)) {
      return true;
    }
    const role = erpState?.currentUser?.role;
    if (role === "SUPER_ADMIN" || role === "SYSTEM_ADMIN") {
      return true;
    }
    if (trialOperationsService.isTrialLocked(activeTenant, role)) {
      setIsTrialLockModalOpen(true);
      soundService.playSound("ENCRYPTION_VIOLATION_ALARM");
      return false;
    }
    const result = trialOperationsService.incrementOperation(actionName, activeTenant, role);
    if (result.isLocked) {
      setIsTrialLockModalOpen(true);
      soundService.playSound("ENCRYPTION_VIOLATION_ALARM");
      return false;
    }
    return true;
  };

  // Add Account to COA
  const handleAddAccount = (newAcc: Account) => {
    if (!checkAndRegisterTrialOperation("إضافة حساب بدليل الحسابات")) return;
    const updated = [...erpState.accounts, newAcc];
    updateStateWithRecalculatedGL({ accounts: updated });
    LocalSyncEngine.getInstance().addToOutbox("ACCOUNT", newAcc.id, "CREATE", newAcc);
  };

  // Save Journal Entry
  const handleSaveJournalEntry = (entry: JournalEntry) => {
    if (!checkAndRegisterTrialOperation("ترحيل قيد يومية محاسبي")) return;
    const updatedEntries = [entry, ...erpState.journalEntries.filter((e) => e.id !== entry.id)];
    updateStateWithRecalculatedGL({ journalEntries: updatedEntries });
    LocalSyncEngine.getInstance().addToOutbox("JOURNAL_ENTRY", entry.id, "CREATE", entry);

    // Audio & WhatsApp Instant Alert for large transaction
    const threshold = soundService.getConfig().largeTxThreshold;
    if (entry.totalDebit >= threshold || entry.status === "DRAFT") {
      soundService.notifyLargeFinancialTransaction(
        "قيد يومية عام",
        entry.totalDebit,
        entry.currency,
        entry.entryNumber,
        entry.description,
        erpState.currentUser?.name || "مدير النظام",
        entry.status === "DRAFT"
      );
    }
  };

  // Post Journal Entry
  const handlePostJournalEntry = (entryId: string) => {
    let postedEntry: JournalEntry | undefined;
    const updatedEntries = erpState.journalEntries.map((e) => {
      if (e.id === entryId) {
        postedEntry = {
          ...e,
          status: "POSTED" as const,
          approvedBy: "د. طارق المنصوري",
          approvedAt: new Date().toISOString().slice(0, 10),
        };
        return postedEntry;
      }
      return e;
    });
    updateStateWithRecalculatedGL({ journalEntries: updatedEntries });
    LocalSyncEngine.getInstance().addToOutbox("JOURNAL_ENTRY", entryId, "UPDATE", { id: entryId, status: "POSTED" });

    if (postedEntry && postedEntry.totalDebit >= soundService.getConfig().largeTxThreshold) {
      soundService.notifyLargeFinancialTransaction(
        "اعتماد قيد يومية",
        postedEntry.totalDebit,
        postedEntry.currency,
        postedEntry.entryNumber,
        postedEntry.description,
        erpState.currentUser?.name || "مدير النظام",
        false
      );
    }
  };

  // Save Voucher (Receipt / Payment) and auto-generate corresponding Journal Entry
  const handleSaveVoucher = (voucher: Voucher) => {
    const isReceipt = voucher.type === "RECEIPT";
    if (!checkAndRegisterTrialOperation(isReceipt ? "إنشاء سند قبض مالي" : "إنشاء سند صرف مالي")) return;
    const jvNumber = `JV-${voucher.voucherNumber}`;

    // Trigger Audio & WhatsApp alert if amount is large
    if (voucher.amount >= soundService.getConfig().largeTxThreshold) {
      soundService.notifyLargeFinancialTransaction(
        isReceipt ? "سند قبض نقدي/بنكي" : "سند صرف نقدي/بنكي",
        voucher.amount,
        voucher.currency,
        voucher.voucherNumber,
        voucher.notes,
        erpState.currentUser?.name || "أمين الصندوق",
        false
      );
    }

    // Create balanced GL journal lines
    const debitAccId = isReceipt ? voucher.sourceAccountId : voucher.destinationAccountId;
    const creditAccId = isReceipt ? voucher.destinationAccountId : voucher.sourceAccountId;

    const debitAcc = erpState.accounts.find((a) => a.id === debitAccId) || erpState.accounts[0];
    const creditAcc = erpState.accounts.find((a) => a.id === creditAccId) || erpState.accounts[1];

    const autoEntry: JournalEntry = {
      id: `je-auto-${voucher.id}`,
      entryNumber: jvNumber,
      date: voucher.date,
      period: voucher.date.slice(0, 7),
      type: isReceipt ? "RECEIPT" : "PAYMENT",
      reference: voucher.voucherNumber,
      description: voucher.notes,
      status: "POSTED",
      currency: voucher.currency,
      totalDebit: voucher.amount,
      totalCredit: voucher.amount,
      lines: [
        {
          id: `l-deb-${Date.now()}`,
          accountId: debitAcc.id,
          accountCode: debitAcc.code,
          accountNameAr: debitAcc.nameAr,
          debit: voucher.amount,
          credit: 0,
          currency: voucher.currency,
          exchangeRate: voucher.exchangeRate,
          memo: voucher.notes,
        },
        {
          id: `l-crd-${Date.now()}`,
          accountId: creditAcc.id,
          accountCode: creditAcc.code,
          accountNameAr: creditAcc.nameAr,
          debit: 0,
          credit: voucher.amount,
          currency: voucher.currency,
          exchangeRate: voucher.exchangeRate,
          memo: voucher.notes,
        },
      ],
      createdBy: voucher.createdByName,
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      approvedBy: "د. طارق المنصوري",
      approvedAt: voucher.date,
    };

    // Also update bank/vault balance directly if matching
    const updatedVaults = erpState.cashVaults.map((v) => {
      if (v.glAccountId === voucher.sourceAccountId) {
        return {
          ...v,
          currentBalance: isReceipt ? v.currentBalance + voucher.amount : v.currentBalance - voucher.amount,
        };
      }
      return v;
    });

    const updatedBanks = erpState.bankAccounts.map((b) => {
      if (b.glAccountId === voucher.sourceAccountId) {
        return {
          ...b,
          currentBalance: isReceipt ? b.currentBalance + voucher.amount : b.currentBalance - voucher.amount,
        };
      }
      return b;
    });

    // Update customer / vendor balance if applicable
    const updatedCustomers = erpState.customers.map((c) => {
      if (c.nameAr === voucher.beneficiaryOrPayer && isReceipt) {
        return { ...c, currentBalance: Math.max(0, c.currentBalance - voucher.amount) };
      }
      return c;
    });

    const updatedVendors = erpState.vendors.map((v) => {
      if (v.nameAr === voucher.beneficiaryOrPayer && !isReceipt) {
        return { ...v, currentBalance: Math.max(0, v.currentBalance - voucher.amount) };
      }
      return v;
    });

    const updatedVouchers = [voucher, ...erpState.vouchers.filter((v) => v.id !== voucher.id)];
    const updatedEntries = [autoEntry, ...erpState.journalEntries];

    updateStateWithRecalculatedGL({
      vouchers: updatedVouchers,
      journalEntries: updatedEntries,
      cashVaults: updatedVaults,
      bankAccounts: updatedBanks,
      customers: updatedCustomers,
      vendors: updatedVendors,
    });
    LocalSyncEngine.getInstance().addToOutbox("VOUCHER", voucher.id, "CREATE", voucher);
    trackEvent('voucher_created', { type: voucher.type, amount: voucher.amount });
  };

  // Add Customer
  const handleAddCustomer = (customer: Customer) => {
    if (!checkAndRegisterTrialOperation("إضافة عميل جديد")) return;
    updateStateWithRecalculatedGL({
      customers: [...erpState.customers, customer],
    });
    trackEvent('new_customer', { city: customer.city });
  };

  // Add Vendor
  const handleAddVendor = (vendor: Vendor) => {
    if (!checkAndRegisterTrialOperation("إضافة مورد جديد")) return;
    updateStateWithRecalculatedGL({
      vendors: [...erpState.vendors, vendor],
    });
  };

  // Update Exchange Accounts & Transactions
  const handleUpdateExchangeAccounts = (accounts: ExchangeAccount[]) => {
    updateStateWithRecalculatedGL({ exchangeAccounts: accounts });
    saveERPState({ exchangeAccounts: accounts });
    LocalSyncEngine.getInstance().addToOutbox("EXCHANGE_ACCOUNT", "batch", "UPDATE", accounts);
  };

  const handleUpdateExchangeTransactions = (transactions: ExchangeTransaction[]) => {
    updateStateWithRecalculatedGL({ exchangeTransactions: transactions });
    saveERPState({ exchangeTransactions: transactions });
    LocalSyncEngine.getInstance().addToOutbox("EXCHANGE_TRANSACTION", "batch", "UPDATE", transactions);
  };

  // Save Invoice (Sales, Sales Returns, Purchases, Purchase Returns)
  const handleSaveInvoice = (invoice: Invoice) => {
    const isSales = invoice.type === "SALES";
    const isSalesReturn = invoice.type === "SALES_RETURN";
    const isPurchase = invoice.type === "PURCHASE";
    const isPurchaseReturn = invoice.type === "PURCHASE_RETURN";

    if (!checkAndRegisterTrialOperation(`إصدار فاتورة ${isSales ? "مبيعات" : isPurchase ? "مشتريات" : "مرتجع"}`)) return;

    const jvNumber = `JV-${invoice.invoiceNumber}`;
    const paid = invoice.paidAmount || 0;
    const remaining = invoice.remainingAmount !== undefined ? invoice.remainingAmount : (invoice.totalAmount - paid);

    let desc = "";
    if (isSales) desc = `فاتورة مبيعات رقم ${invoice.invoiceNumber} للعميل ${invoice.customerName || invoice.partyName || "عميل عام"}`;
    else if (isSalesReturn) desc = `مرتجع مبيعات رقم ${invoice.invoiceNumber} للعميل ${invoice.customerName || invoice.partyName || "عميل عام"}`;
    else if (isPurchase) desc = `فاتورة مشتريات رقم ${invoice.invoiceNumber} من المورد ${invoice.vendorName || invoice.partyName || "مورد عام"}`;
    else if (isPurchaseReturn) desc = `مرتجع مشتريات رقم ${invoice.invoiceNumber} للمورد ${invoice.vendorName || invoice.partyName || "مورد عام"}`;

    // Create balanced invoice entry lines
    let entryLines: any[] = [];

    if (isSales) {
      // Debit: Receivables (AR) or Cash/Vault/Wallet + Credit: Sales Revenue
      if (paid > 0 && remaining > 0) {
        entryLines = [
          {
            id: `l-deb-cash-${Date.now()}`,
            accountId: invoice.paymentAccountId || "110101",
            accountCode: "110101",
            accountNameAr: `النقدية / المحافظ - ${invoice.walletName || "نقد"}`,
            debit: paid,
            credit: 0,
            currency: invoice.currency,
            exchangeRate: invoice.exchangeRate || 1,
          },
          {
            id: `l-deb-ar-${Date.now() + 1}`,
            accountId: "110301",
            accountCode: "110301",
            accountNameAr: "العملاء والمدينون التجاريون (الذمة المتبقية)",
            debit: remaining,
            credit: 0,
            currency: invoice.currency,
            exchangeRate: invoice.exchangeRate || 1,
          },
          {
            id: `l-crd-rev-${Date.now() + 2}`,
            accountId: "4101",
            accountCode: "4101",
            accountNameAr: "إيرادات المبيعات والخدمات",
            debit: 0,
            credit: invoice.totalAmount,
            currency: invoice.currency,
            exchangeRate: invoice.exchangeRate || 1,
          },
        ];
      } else if (paid > 0 && remaining <= 0) {
        entryLines = [
          {
            id: `l-deb-cash-${Date.now()}`,
            accountId: invoice.paymentAccountId || "110101",
            accountCode: "110101",
            accountNameAr: `النقدية والمحافظ - ${invoice.walletName || "نقد"}`,
            debit: invoice.totalAmount,
            credit: 0,
            currency: invoice.currency,
            exchangeRate: invoice.exchangeRate || 1,
          },
          {
            id: `l-crd-rev-${Date.now() + 1}`,
            accountId: "4101",
            accountCode: "4101",
            accountNameAr: "إيرادات المبيعات والخدمات",
            debit: 0,
            credit: invoice.totalAmount,
            currency: invoice.currency,
            exchangeRate: invoice.exchangeRate || 1,
          },
        ];
      } else {
        entryLines = [
          {
            id: `l-deb-ar-${Date.now()}`,
            accountId: "110301",
            accountCode: "110301",
            accountNameAr: "العملاء والمدينون التجاريون",
            debit: invoice.totalAmount,
            credit: 0,
            currency: invoice.currency,
            exchangeRate: invoice.exchangeRate || 1,
          },
          {
            id: `l-crd-rev-${Date.now() + 1}`,
            accountId: "4101",
            accountCode: "4101",
            accountNameAr: "إيرادات المبيعات والخدمات",
            debit: 0,
            credit: invoice.totalAmount,
            currency: invoice.currency,
            exchangeRate: invoice.exchangeRate || 1,
          },
        ];
      }
    } else if (isSalesReturn) {
      // Debit: Sales Returns / Allowances (410102) + Credit: Cash refunded or AR reduced
      entryLines = [
        {
          id: `l-deb-ret-${Date.now()}`,
          accountId: "410102",
          accountCode: "410102",
          accountNameAr: "مردودات ومسموحات المبيعات",
          debit: invoice.totalAmount,
          credit: 0,
          currency: invoice.currency,
          exchangeRate: invoice.exchangeRate || 1,
        },
        {
          id: `l-crd-party-${Date.now() + 1}`,
          accountId: paid > 0 ? (invoice.paymentAccountId || "110101") : "110301",
          accountCode: paid > 0 ? "110101" : "110301",
          accountNameAr: paid > 0 ? "الصندوق / المحفظة المستردة" : "العملاء والمدينون التجاريون",
          debit: 0,
          credit: invoice.totalAmount,
          currency: invoice.currency,
          exchangeRate: invoice.exchangeRate || 1,
        },
      ];
    } else if (isPurchase) {
      // Debit: Inventory / Cost of Goods + Credit: AP or Cash
      if (paid > 0 && remaining > 0) {
        entryLines = [
          {
            id: `l-deb-cogs-${Date.now()}`,
            accountId: "5101",
            accountCode: "5101",
            accountNameAr: "تكلفة المبيعات والبضاعة المشتراة",
            debit: invoice.totalAmount,
            credit: 0,
            currency: invoice.currency,
            exchangeRate: invoice.exchangeRate || 1,
          },
          {
            id: `l-crd-cash-${Date.now() + 1}`,
            accountId: invoice.paymentAccountId || "110101",
            accountCode: "110101",
            accountNameAr: `النقدية / المحافظ المسددة - ${invoice.walletName || "نقد"}`,
            debit: 0,
            credit: paid,
            currency: invoice.currency,
            exchangeRate: invoice.exchangeRate || 1,
          },
          {
            id: `l-crd-ap-${Date.now() + 2}`,
            accountId: "210101",
            accountCode: "210101",
            accountNameAr: "الموردون والدائنون التجاريون (المتبقي)",
            debit: 0,
            credit: remaining,
            currency: invoice.currency,
            exchangeRate: invoice.exchangeRate || 1,
          },
        ];
      } else {
        entryLines = [
          {
            id: `l-deb-cogs-${Date.now()}`,
            accountId: "5101",
            accountCode: "5101",
            accountNameAr: "تكلفة المبيعات والبضاعة المشتراة",
            debit: invoice.totalAmount,
            credit: 0,
            currency: invoice.currency,
            exchangeRate: invoice.exchangeRate || 1,
          },
          {
            id: `l-crd-ap-${Date.now() + 1}`,
            accountId: paid > 0 ? (invoice.paymentAccountId || "110101") : "210101",
            accountCode: paid > 0 ? "110101" : "210101",
            accountNameAr: paid > 0 ? "الصندوق / البنك المسدد منه" : "الموردون والدائنون التجاريون",
            debit: 0,
            credit: invoice.totalAmount,
            currency: invoice.currency,
            exchangeRate: invoice.exchangeRate || 1,
          },
        ];
      }
    } else {
      // PURCHASE_RETURN
      entryLines = [
        {
          id: `l-deb-party-${Date.now()}`,
          accountId: paid > 0 ? (invoice.paymentAccountId || "110101") : "210101",
          accountCode: paid > 0 ? "110101" : "210101",
          accountNameAr: paid > 0 ? "الصندوق / المحفظة المستلمة" : "الموردون والدائنون التجاريون",
          debit: invoice.totalAmount,
          credit: 0,
          currency: invoice.currency,
          exchangeRate: invoice.exchangeRate || 1,
        },
        {
          id: `l-crd-ret-${Date.now() + 1}`,
          accountId: "5101",
          accountCode: "5101",
          accountNameAr: "مردودات ومسموحات المشتريات",
          debit: 0,
          credit: invoice.totalAmount,
          currency: invoice.currency,
          exchangeRate: invoice.exchangeRate || 1,
        },
      ];
    }

    const autoEntry: JournalEntry = {
      id: `je-inv-${invoice.id}`,
      entryNumber: jvNumber,
      date: invoice.date,
      period: invoice.date.slice(0, 7),
      type: isSalesReturn || isPurchaseReturn ? "ADJUSTMENT" : "STANDARD",
      reference: invoice.invoiceNumber,
      description: desc,
      status: "POSTED",
      currency: invoice.currency,
      totalDebit: invoice.totalAmount,
      totalCredit: invoice.totalAmount,
      lines: entryLines,
      createdBy: "أ. محمد عبد الرقيب",
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      approvedBy: "د. طارق المنصوري",
      approvedAt: invoice.date,
    };

    // Update customer / vendor current balance
    const custId = invoice.customerId || invoice.partyId;
    const vendId = invoice.vendorId || invoice.partyId;

    const updatedCustomers = erpState.customers.map((c) => {
      if (c.id === custId) {
        if (isSales) return { ...c, currentBalance: c.currentBalance + remaining };
        if (isSalesReturn) return { ...c, currentBalance: Math.max(0, c.currentBalance - invoice.totalAmount) };
      }
      return c;
    });

    const updatedVendors = erpState.vendors.map((v) => {
      if (v.id === vendId) {
        if (isPurchase) return { ...v, currentBalance: v.currentBalance + remaining };
        if (isPurchaseReturn) return { ...v, currentBalance: Math.max(0, v.currentBalance - invoice.totalAmount) };
      }
      return v;
    });

    // Update vaults or banks if paid immediately
    const updatedVaults = erpState.cashVaults.map((vault) => {
      if (vault.id === invoice.paymentAccountId || vault.glAccountId === invoice.paymentAccountId) {
        if (isSales) return { ...vault, currentBalance: vault.currentBalance + paid };
        if (isSalesReturn) return { ...vault, currentBalance: Math.max(0, vault.currentBalance - paid) };
        if (isPurchase) return { ...vault, currentBalance: Math.max(0, vault.currentBalance - paid) };
        if (isPurchaseReturn) return { ...vault, currentBalance: vault.currentBalance + paid };
      }
      return vault;
    });

    const updatedBanks = erpState.bankAccounts.map((bank) => {
      if (bank.id === invoice.paymentAccountId || bank.glAccountId === invoice.paymentAccountId) {
        if (isSales) return { ...bank, currentBalance: bank.currentBalance + paid };
        if (isSalesReturn) return { ...bank, currentBalance: Math.max(0, bank.currentBalance - paid) };
        if (isPurchase) return { ...bank, currentBalance: Math.max(0, bank.currentBalance - paid) };
        if (isPurchaseReturn) return { ...bank, currentBalance: bank.currentBalance + paid };
      }
      return bank;
    });

    // Update inventory levels and prices if items are linked
    const updatedInventoryItems = (erpState.inventoryItems || []).map((invItem) => {
      const matchedInvoiceItem = invoice.items.find(
        (i) => i.inventoryItemId === invItem.id || (i.description && i.description.trim() === invItem.nameAr.trim())
      );
      if (matchedInvoiceItem) {
        if (isPurchase) {
          const newQty = invItem.quantityOnHand + matchedInvoiceItem.quantity;
          const newPurchasePrice = matchedInvoiceItem.unitPrice || invItem.purchasePrice || invItem.costPrice;
          // Weighted Average Cost (WAC)
          const currentTotalCost = invItem.quantityOnHand * (invItem.costPrice || newPurchasePrice);
          const incomingTotalCost = matchedInvoiceItem.quantity * newPurchasePrice;
          const weightedCost = newQty > 0 ? (currentTotalCost + incomingTotalCost) / newQty : newPurchasePrice;

          return {
            ...invItem,
            quantityOnHand: newQty,
            purchasePrice: newPurchasePrice,
            costPrice: Math.round(weightedCost),
          };
        } else if (isPurchaseReturn) {
          return {
            ...invItem,
            quantityOnHand: Math.max(0, invItem.quantityOnHand - matchedInvoiceItem.quantity),
          };
        } else if (isSales) {
          return {
            ...invItem,
            quantityOnHand: Math.max(0, invItem.quantityOnHand - matchedInvoiceItem.quantity),
            totalSalesQty: (invItem.totalSalesQty || 0) + matchedInvoiceItem.quantity,
            lastSellingPrice: matchedInvoiceItem.unitPrice || invItem.lastSellingPrice || invItem.sellingPrice,
          };
        } else if (isSalesReturn) {
          return {
            ...invItem,
            quantityOnHand: invItem.quantityOnHand + matchedInvoiceItem.quantity,
            totalReturnsQty: (invItem.totalReturnsQty || 0) + matchedInvoiceItem.quantity,
          };
        }
      }
      return invItem;
    });

    const updatedInvoices = [invoice, ...erpState.invoices.filter((i) => i.id !== invoice.id)];
    const updatedBills = isPurchase || isPurchaseReturn
      ? [invoice, ...(erpState.bills || []).filter((b) => b.id !== invoice.id)]
      : (erpState.bills || []);
    const updatedEntries = [autoEntry, ...erpState.journalEntries];

    updateStateWithRecalculatedGL({
      invoices: updatedInvoices,
      bills: updatedBills,
      journalEntries: updatedEntries,
      customers: updatedCustomers,
      vendors: updatedVendors,
      cashVaults: updatedVaults,
      bankAccounts: updatedBanks,
      inventoryItems: updatedInventoryItems,
    });
    LocalSyncEngine.getInstance().addToOutbox("INVOICE", invoice.id, "CREATE", invoice);
    trackEvent('invoice_created', { type: invoice.type, total: invoice.totalAmount });
  };

  // Transfer funds between vaults and banks
  const handleTransferFunds = (data: {
    fromType: "VAULT" | "BANK";
    fromId: string;
    toType: "VAULT" | "BANK";
    toId: string;
    amount: number;
    currency: CurrencyCode;
    notes: string;
  }) => {
    let fromAccId = "110101";
    let toAccId = "110201";

    const updatedVaults = erpState.cashVaults.map((v) => {
      if (data.fromType === "VAULT" && v.id === data.fromId) {
        fromAccId = v.glAccountId;
        return { ...v, currentBalance: v.currentBalance - data.amount };
      }
      if (data.toType === "VAULT" && v.id === data.toId) {
        toAccId = v.glAccountId;
        return { ...v, currentBalance: v.currentBalance + data.amount };
      }
      return v;
    });

    const updatedBanks = erpState.bankAccounts.map((b) => {
      if (data.fromType === "BANK" && b.id === data.fromId) {
        fromAccId = b.glAccountId;
        return { ...b, currentBalance: b.currentBalance - data.amount };
      }
      if (data.toType === "BANK" && b.id === data.toId) {
        toAccId = b.glAccountId;
        return { ...b, currentBalance: b.currentBalance + data.amount };
      }
      return b;
    });

    const fromAcc = erpState.accounts.find((a) => a.id === fromAccId) || erpState.accounts[0];
    const toAcc = erpState.accounts.find((a) => a.id === toAccId) || erpState.accounts[1];

    const trfEntry: JournalEntry = {
      id: `je-trf-${Date.now()}`,
      entryNumber: `JV-TRF-${(erpState.journalEntries.length + 1).toString().padStart(4, "0")}`,
      date: new Date().toISOString().slice(0, 10),
      period: new Date().toISOString().slice(0, 7),
      type: "STANDARD",
      description: data.notes,
      status: "POSTED",
      currency: data.currency,
      totalDebit: data.amount,
      totalCredit: data.amount,
      lines: [
        {
          id: `l-deb-${Date.now()}`,
          accountId: toAcc.id,
          accountCode: toAcc.code,
          accountNameAr: toAcc.nameAr,
          debit: data.amount,
          credit: 0,
          currency: data.currency,
          exchangeRate: 1,
        },
        {
          id: `l-crd-${Date.now()}`,
          accountId: fromAcc.id,
          accountCode: fromAcc.code,
          accountNameAr: fromAcc.nameAr,
          debit: 0,
          credit: data.amount,
          currency: data.currency,
          exchangeRate: 1,
        },
      ],
      createdBy: "أ. محمد عبد الرقيب",
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      approvedBy: "د. طارق المنصوري",
      approvedAt: new Date().toISOString().slice(0, 10),
    };

    updateStateWithRecalculatedGL({
      cashVaults: updatedVaults,
      bankAccounts: updatedBanks,
      journalEntries: [trfEntry, ...erpState.journalEntries],
    });
  };

  // Add Cost Center & Fixed Asset
  const handleUpdatePartnersState = (data: {
    partners?: Partner[];
    partnerContributions?: PartnerContribution[];
    profitDistributions?: ProfitDistribution[];
    partnerWithdrawals?: PartnerWithdrawal[];
    journalEntries?: JournalEntry[];
  }) => {
    updateStateWithRecalculatedGL(data);
  };

  const handleAddCostCenter = (cc: CostCenter) => {
    updateStateWithRecalculatedGL({ costCenters: [...erpState.costCenters, cc] });
  };

  const handleAddFixedAsset = (asset: FixedAsset) => {
    if (!checkAndRegisterTrialOperation("تسجيل أصل ثابت جديد")) return;
    updateStateWithRecalculatedGL({ fixedAssets: [...erpState.fixedAssets, asset] });
  };

  const handleUpdateFixedAsset = (updatedAsset: FixedAsset) => {
    const updated = erpState.fixedAssets.map((a) => (a.id === updatedAsset.id ? updatedAsset : a));
    updateStateWithRecalculatedGL({ fixedAssets: updated });
  };

  const handleDeleteFixedAsset = (assetId: string) => {
    const updated = erpState.fixedAssets.filter((a) => a.id !== assetId);
    updateStateWithRecalculatedGL({ fixedAssets: updated });
  };

  const handleTransferFixedAsset = (
    assetId: string,
    toCostCenterId: string,
    toCostCenterName: string,
    reason: string
  ) => {
    const asset = erpState.fixedAssets.find((a) => a.id === assetId);
    if (!asset) return;

    const transferRecord: AssetTransferRecord = {
      id: `tr-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      fromCostCenterId: asset.costCenterId || "",
      fromCostCenterName: asset.costCenterName || "المركز السابق",
      toCostCenterId,
      toCostCenterName,
      transferredBy: erpState.currentUser?.name || "د. طارق المنصوري",
      reason,
    };

    const updated = erpState.fixedAssets.map((a) => {
      if (a.id === assetId) {
        return {
          ...a,
          costCenterId: toCostCenterId,
          costCenterName: toCostCenterName,
          transferRecords: [...(a.transferRecords || []), transferRecord],
        };
      }
      return a;
    });

    updateStateWithRecalculatedGL({ fixedAssets: updated });
  };

  const handleAddAssetMaintenance = (assetId: string, record: AssetMaintenanceRecord) => {
    const updated = erpState.fixedAssets.map((a) => {
      if (a.id === assetId) {
        return {
          ...a,
          maintenanceRecords: [...(a.maintenanceRecords || []), record],
        };
      }
      return a;
    });
    updateStateWithRecalculatedGL({ fixedAssets: updated });
  };

  const handleDisposeFixedAsset = (
    assetId: string,
    saleAmount: number,
    disposalDate: string,
    notes: string
  ) => {
    const asset = erpState.fixedAssets.find((a) => a.id === assetId);
    if (!asset) return;

    const currentBookVal =
      asset.bookValue ||
      (asset.purchaseCost || asset.cost || 0) - (asset.accumulatedDepreciation || 0);
    const gainOrLoss = saleAmount - currentBookVal;

    const jvNumber = `JV-DISP-${(erpState.journalEntries.length + 1).toString().padStart(4, "0")}`;
    const dispLines = [
      {
        id: `l-deb-acc-${Date.now()}`,
        accountId: asset.accumulatedDepGlAccount || "1209",
        accountCode: asset.accumulatedDepGlAccount || "1209",
        accountNameAr: `إقفال مجمع إهلاك - ${asset.nameAr || asset.name}`,
        debit: asset.accumulatedDepreciation || 0,
        credit: 0,
        currency: asset.currency,
        exchangeRate: 1,
      },
      ...(saleAmount > 0
        ? [
            {
              id: `l-deb-cash-${Date.now() + 1}`,
              accountId: "110101",
              accountCode: "110101",
              accountNameAr: "الصندوق الرئيسي / محصلات بيع الأصل",
              debit: saleAmount,
              credit: 0,
              currency: asset.currency,
              exchangeRate: 1,
            },
          ]
        : []),
      ...(gainOrLoss < 0
        ? [
            {
              id: `l-deb-loss-${Date.now() + 2}`,
              accountId: "5204",
              accountCode: "5204",
              accountNameAr: "خسائر استبعاد وتخريد أصول ثابتة",
              debit: Math.abs(gainOrLoss),
              credit: 0,
              currency: asset.currency,
              exchangeRate: 1,
            },
          ]
        : []),
      ...(gainOrLoss > 0
        ? [
            {
              id: `l-crd-gain-${Date.now() + 3}`,
              accountId: "4201",
              accountCode: "4201",
              accountNameAr: "أرباح بيع واستبعاد أصول ثابتة",
              debit: 0,
              credit: gainOrLoss,
              currency: asset.currency,
              exchangeRate: 1,
            },
          ]
        : []),
      {
        id: `l-crd-asset-${Date.now() + 4}`,
        accountId: asset.assetGlAccount || "1202",
        accountCode: asset.assetGlAccount || "1202",
        accountNameAr: `استبعاد التكلفة التاريخية - ${asset.nameAr || asset.name}`,
        debit: 0,
        credit: asset.purchaseCost || asset.cost || 0,
        currency: asset.currency,
        exchangeRate: 1,
      },
    ];

    const totalDeb = dispLines.reduce((s, l) => s + (l.debit || 0), 0);
    const totalCrd = dispLines.reduce((s, l) => s + (l.credit || 0), 0);

    const disposalEntry: JournalEntry = {
      id: `je-disp-${Date.now()}`,
      entryNumber: jvNumber,
      date: disposalDate,
      period: disposalDate.slice(0, 7),
      type: "ADJUSTMENT",
      reference: asset.code || asset.assetCode,
      description: `استبعاد وتكهين الأصل: ${asset.nameAr || asset.name} | ${notes}`,
      status: "POSTED",
      currency: asset.currency,
      totalDebit: totalDeb,
      totalCredit: totalCrd,
      lines: dispLines,
      createdBy: "أ. محمد عبد الرقيب",
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      approvedBy: "د. طارق المنصوري",
      approvedAt: disposalDate,
    };

    const updated = erpState.fixedAssets.map((a) => {
      if (a.id === assetId) {
        return {
          ...a,
          status: "DISPOSED" as const,
          bookValue: 0,
        };
      }
      return a;
    });

    updateStateWithRecalculatedGL({
      fixedAssets: updated,
      journalEntries: [disposalEntry, ...erpState.journalEntries],
    });
  };

  // Run Periodic Depreciation Auto Entry (IAS 16)
  const handleRunDepreciation = (
    period: "MONTHLY" | "QUARTERLY" | "ANNUAL" = "MONTHLY",
    customDate?: string
  ) => {
    if (erpState.fixedAssets.length === 0) return;

    const multiplier = period === "MONTHLY" ? 1 : period === "QUARTERLY" ? 3 : 12;
    const periodLabel = period === "MONTHLY" ? "الشهري" : period === "QUARTERLY" ? "الربع سنوي" : "السنوي";
    const runDate = customDate
      ? customDate.length === 7
        ? `${customDate}-28`
        : customDate
      : new Date().toISOString().slice(0, 10);
    const periodStr = runDate.slice(0, 7);

    let totalDepAmount = 0;
    const lines: any[] = [];

    erpState.fixedAssets
      .filter((a) => a.status === "ACTIVE" && (a.bookValue === undefined || a.bookValue > (a.salvageValue || 0)))
      .forEach((asset, idx) => {
        const annualDep = asset.annualDepreciation || 0;
        const currentBook =
          asset.bookValue ??
          ((asset.purchaseCost || asset.cost || 0) - (asset.accumulatedDepreciation || 0));
        const salvage = asset.salvageValue || 0;
        const maxDeprec = Math.max(0, currentBook - salvage);
        const depAmt = Math.min(maxDeprec, (annualDep / 12) * multiplier);

        if (depAmt > 0) {
          totalDepAmount += depAmt;

          // Debit Line (Expense by Cost Center)
          lines.push({
            id: `l-deb-${asset.id}-${Date.now()}-${idx}`,
            accountId: asset.depExpenseGlAccount || "5204",
            accountCode: asset.depExpenseGlAccount || "5204",
            accountNameAr: `مصروف إهلاك: ${asset.nameAr || asset.name} [${asset.costCenterName || (erpState?.systemSettings?.companyNameAr || TenantIsolationService.getActiveTenantDetails()?.nameAr || "المركز الرئيسي")}]`,
            debit: depAmt,
            credit: 0,
            currency: asset.currency || "YER_SANAA",
            exchangeRate: 1,
          });

          // Credit Line (Accumulated Depreciation)
          lines.push({
            id: `l-crd-${asset.id}-${Date.now()}-${idx}`,
            accountId: asset.accumulatedDepGlAccount || "1209",
            accountCode: asset.accumulatedDepGlAccount || "1209",
            accountNameAr: `مجمع إهلاك: ${asset.nameAr || asset.name}`,
            debit: 0,
            credit: depAmt,
            currency: asset.currency || "YER_SANAA",
            exchangeRate: 1,
          });
        }
      });

    if (totalDepAmount === 0) {
      alert("جميع الأصول مستهلكة بالكامل أو لا يوجد قسط إهلاك مستحق لهذه الفترة.");
      return;
    }

    const jvNumber = `JV-DEP-${(erpState.journalEntries.length + 1).toString().padStart(4, "0")}`;

    const depEntry: JournalEntry = {
      id: `je-dep-${Date.now()}`,
      entryNumber: jvNumber,
      date: runDate,
      period: periodStr,
      type: "DEPRECIATION",
      description: `قيد إهلاك الأصول الثابتة ${periodLabel} الدوري لـ (${erpState?.systemSettings?.companyNameAr || TenantIsolationService.getActiveTenantDetails()?.nameAr || "المنشأة المعتمدة"}) وفق المعيار IAS 16`,
      status: "POSTED",
      currency: "YER_SANAA",
      totalDebit: totalDepAmount,
      totalCredit: totalDepAmount,
      lines: lines,
      createdBy: "أ. محمد عبد الرقيب",
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      approvedBy: "د. طارق المنصوري",
      approvedAt: runDate,
    };

    const updatedAssets = erpState.fixedAssets.map((asset) => {
      if (asset.status !== "ACTIVE") return asset;
      const annualDep = asset.annualDepreciation || 0;
      const currentBook =
        asset.bookValue ??
        ((asset.purchaseCost || asset.cost || 0) - (asset.accumulatedDepreciation || 0));
      const salvage = asset.salvageValue || 0;
      const maxDeprec = Math.max(0, currentBook - salvage);
      const depAmt = Math.min(maxDeprec, (annualDep / 12) * multiplier);

      if (depAmt <= 0) return asset;

      return {
        ...asset,
        accumulatedDepreciation: (asset.accumulatedDepreciation || 0) + depAmt,
        bookValue: Math.max(salvage, currentBook - depAmt),
        lastDepreciationDate: runDate,
      };
    });

    updateStateWithRecalculatedGL({
      journalEntries: [depEntry, ...erpState.journalEntries],
      fixedAssets: updatedAssets,
    });

    alert(
      `تم احتساب وترحيل قيد إهلاك الفترة بنجاح (${jvNumber}) بمبلغ ${totalDepAmount.toLocaleString()} ر.ي`
    );
  };

  // Update Exchange Rate
  const handleUpdateExchangeRate = (currencyCode: CurrencyCode, newRateToUSD: number) => {
    const updatedCurrencies = erpState.currencies.map((c) => {
      if (c.code === currencyCode) {
        return {
          ...c,
          exchangeRateToUSD: newRateToUSD,
          lastUpdated: new Date().toISOString().slice(0, 10),
        };
      }
      return c;
    });
    updateStateWithRecalculatedGL({ currencies: updatedCurrencies });
  };

  // Execute Forex Revaluation Entry (FAGL_FC_VAL)
  const handleExecuteForexRevaluation = () => {
    const revalAmount = 1850000;
    const revalEntry: JournalEntry = {
      id: `je-reval-${Date.now()}`,
      entryNumber: `JV-FX-${(erpState.journalEntries.length + 1).toString().padStart(4, "0")}`,
      date: new Date().toISOString().slice(0, 10),
      period: new Date().toISOString().slice(0, 7),
      type: "REVALUATION",
      description: `قيد إعادة تقييم أرصدة العملات الأجنبية (FAGL_FC_VAL - IAS 21)`,
      status: "POSTED",
      currency: "YER_SANAA",
      totalDebit: revalAmount,
      totalCredit: revalAmount,
      lines: [
        {
          id: `l-deb-${Date.now()}`,
          accountId: "110202",
          accountCode: "110202",
          accountNameAr: "بنك التضامن الإسلامي - دولار",
          debit: revalAmount,
          credit: 0,
          currency: "YER_SANAA",
          exchangeRate: 1,
        },
        {
          id: `l-crd-${Date.now()}`,
          accountId: "4201",
          accountCode: "4201",
          accountNameAr: "أرباح فروق تقييم أسعار الصرف",
          debit: 0,
          credit: revalAmount,
          currency: "YER_SANAA",
          exchangeRate: 1,
        },
      ],
      createdBy: "أ. محمد عبد الرقيب",
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      approvedBy: "د. طارق المنصوري",
      approvedAt: new Date().toISOString().slice(0, 10),
    };

    updateStateWithRecalculatedGL({
      journalEntries: [revalEntry, ...erpState.journalEntries],
    });
    alert(`تم تنفيذ إعادة التقييم وترحيل قيد فروق العملة بمبلغ ${revalAmount.toLocaleString()} ر.ي`);
  };

  // Print Document Trigger
  const handleOpenPrintDoc = (docType: "JOURNAL" | "RECEIPT" | "PAYMENT" | "INVOICE", data: any) => {
    setPrintDocType(docType);
    setPrintDocData(data);
  };

  // Quick action from header
  const handleQuickAction = (actionType: "JOURNAL" | "RECEIPT" | "PAYMENT" | "INVOICE") => {
    if (actionType === "JOURNAL") setActiveTab("JOURNAL_ENTRIES");
    if (actionType === "RECEIPT" || actionType === "PAYMENT") setActiveTab("VOUCHERS");
    if (actionType === "INVOICE") setActiveTab("SALES_RETURNS");
  };

  // Reset demo
  const handleResetData = () => {
    if (confirm("هل أنت متأكد من رغبتك في إعادة تعيين كافة البيانات إلى الحالة الافتراضية؟")) {
      const reset = resetERPStateToDefault();
      setErpState(reset);
    }
  };

  const handleExportData = () => {
    exportERPDataAsJSON(erpState);
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const imported = await importERPDataFromJSON(file);
        if (imported) setErpState(imported);
      }
    };
    input.click();
  };

  const handleUpdateSystemSettings = (newSettings: SystemSettings) => {
    updateStateWithRecalculatedGL({ systemSettings: newSettings });
  };

  const handleUpdateCurrenciesList = (newCurrencies: CurrencyInfo[]) => {
    updateStateWithRecalculatedGL({ currencies: newCurrencies });
  };

  const handleSwitchUser = (user: ERPUser) => {
    updateStateWithRecalculatedGL({ currentUser: user });
  };

  const handleAddInventoryItem = (newItem: InventoryItem) => {
    if (!checkAndRegisterTrialOperation("إضافة صنف مخزني جديد")) return;
    const updated = [newItem, ...(erpState.inventoryItems || [])];
    updateStateWithRecalculatedGL({ inventoryItems: updated });
    LocalSyncEngine.getInstance().addToOutbox("INVENTORY_ITEM", newItem.id, "CREATE", newItem);
    trackEvent('new_item', { category: newItem.category });
  };

  const handleUpdateInventoryItem = (updatedItem: InventoryItem) => {
    const updated = (erpState.inventoryItems || []).map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    updateStateWithRecalculatedGL({ inventoryItems: updated });
    LocalSyncEngine.getInstance().addToOutbox("INVENTORY_ITEM", updatedItem.id, "UPDATE", updatedItem);
  };

  const handleDeleteInventoryItem = (id: string) => {
    const updated = (erpState.inventoryItems || []).filter((item) => item.id !== id);
    updateStateWithRecalculatedGL({ inventoryItems: updated });
    LocalSyncEngine.getInstance().addToOutbox("INVENTORY_ITEM", id, "DELETE", { id });
  };

  const handleBulkDeleteInventoryItems = (ids: string[]) => {
    const idSet = new Set(ids);
    const updated = (erpState.inventoryItems || []).filter((item) => !idSet.has(item.id));
    updateStateWithRecalculatedGL({ inventoryItems: updated });
    ids.forEach((id) => {
      LocalSyncEngine.getInstance().addToOutbox("INVENTORY_ITEM", id, "DELETE", { id });
    });
  };

  const handleClearAllInventoryItems = (warehouse?: string) => {
    let itemsToDelete = erpState.inventoryItems || [];
    let remainingItems: typeof itemsToDelete = [];
    if (warehouse && warehouse !== "ALL") {
      itemsToDelete = (erpState.inventoryItems || []).filter(
        (item) => (item.warehouseLocation || "المستودع الرئيسي") === warehouse
      );
      remainingItems = (erpState.inventoryItems || []).filter(
        (item) => (item.warehouseLocation || "المستودع الرئيسي") !== warehouse
      );
    }
    updateStateWithRecalculatedGL({ inventoryItems: remainingItems });
    itemsToDelete.forEach((item) => {
      LocalSyncEngine.getInstance().addToOutbox("INVENTORY_ITEM", item.id, "DELETE", { id: item.id });
    });
  };

  const handleImportInventoryItems = (importedItems: InventoryItem[]) => {
    const existingCodes = new Set((erpState.inventoryItems || []).map((item) => item.code));
    const nonDuplicates = importedItems.filter((item) => !existingCodes.has(item.code));
    const updated = [...nonDuplicates, ...(erpState.inventoryItems || [])];
    updateStateWithRecalculatedGL({ inventoryItems: updated });
  };

  const handleAddStockMovement = (newMovement: StockMovement, updatedQty?: number) => {
    const updatedMovements = [newMovement, ...(erpState.stockMovements || [])];
    let updatedItems = erpState.inventoryItems || [];
    if (updatedQty !== undefined) {
      updatedItems = updatedItems.map((item) => {
        if (item.id === newMovement.itemId) {
          const isReturn = newMovement.type === "RETURN_CUSTOMER" || newMovement.type === "RETURN_VENDOR";
          return {
            ...item,
            quantityOnHand: Math.max(0, updatedQty),
            totalReturnsQty: isReturn ? (item.totalReturnsQty || 0) + newMovement.quantity : (item.totalReturnsQty || 0),
          };
        }
        return item;
      });
    }
    updateStateWithRecalculatedGL({ stockMovements: updatedMovements, inventoryItems: updatedItems });
  };

  const handleAddUnavailableRequest = (req: UnavailableItemRequest) => {
    const updated = [req, ...(erpState.unavailableRequests || [])];
    updateStateWithRecalculatedGL({ unavailableRequests: updated });
  };

  const handleUpdateUnavailableRequest = (req: UnavailableItemRequest) => {
    const updated = (erpState.unavailableRequests || []).map((r) =>
      r.id === req.id ? req : r
    );
    updateStateWithRecalculatedGL({ unavailableRequests: updated });
  };

  const handleDeleteUnavailableRequest = (id: string) => {
    const updated = (erpState.unavailableRequests || []).filter((r) => r.id !== id);
    updateStateWithRecalculatedGL({ unavailableRequests: updated });
  };

  const handleUpdateRoles = (newRoles: ERPRole[]) => {
    updateStateWithRecalculatedGL({ roles: newRoles });
  };

  const handleUpdateUsersList = (newUsers: ERPUser[]) => {
    updateStateWithRecalculatedGL({ usersList: newUsers });
  };

  const handleUpdateHREmployees = (emps: HREmployee[]) => {
    updateStateWithRecalculatedGL({ hrEmployees: emps });
  };

  const handleUpdateHRDecisions = (decs: HRAdministrativeDecision[]) => {
    updateStateWithRecalculatedGL({ hrDecisions: decs });
  };

  const handleUpdateHRAttendance = (atts: HRAttendanceRecord[]) => {
    updateStateWithRecalculatedGL({ hrAttendanceRecords: atts });
  };

  const handleUpdateHRShifts = (shifts: HRWorkingShift[]) => {
    updateStateWithRecalculatedGL({ hrShifts: shifts });
  };

  const handleUpdateHRPayrolls = (pays: HRMonthlyPayroll[]) => {
    updateStateWithRecalculatedGL({ hrPayrolls: pays });
  };

  const handleUpdateHRLoans = (loans: HRLoan[]) => {
    updateStateWithRecalculatedGL({ hrLoans: loans });
  };

  const handleAddJournalEntry = (newEntry: JournalEntry) => {
    updateStateWithRecalculatedGL({
      journalEntries: [newEntry, ...erpState.journalEntries],
    });
  };

  const handleSaveBranch = (branch: Branch) => {
    const existing = erpState.branches || [];
    const index = existing.findIndex((b) => b.id === branch.id);
    let updated: Branch[];
    if (index >= 0) {
      updated = existing.map((b) => (b.id === branch.id ? branch : b));
    } else {
      updated = [...existing, branch];
    }
    updateStateWithRecalculatedGL({ branches: updated });
  };

  const handleDeleteBranch = (branchId: string) => {
    const updated = (erpState.branches || []).filter((b) => b.id !== branchId);
    updateStateWithRecalculatedGL({ branches: updated });
  };

  const handleSetActiveBranchId = (branchId: string) => {
    updateStateWithRecalculatedGL({ activeBranchId: branchId });
  };

  const handleUpdateCorrespondences = (docs: CorrespondenceDocument[]) => {
    updateStateWithRecalculatedGL({ correspondences: docs });
  };

  const handleUpdateApprovalRequests = (aprs: ApprovalRequest[]) => {
    updateStateWithRecalculatedGL({ approvalRequests: aprs });
  };

  const handleAddAuditLog = (log: AuditLogEntry) => {
    const updated = [log, ...(erpState.auditLogs || [])];
    updateStateWithRecalculatedGL({ auditLogs: updated });
  };

  const handleUpdateSystemAlerts = (alerts: SystemAlert[]) => {
    updateStateWithRecalculatedGL({ systemAlerts: alerts });
  };

  const handleUpdateChatChannels = (channels: ChatChannel[]) => {
    updateStateWithRecalculatedGL({ chatChannels: channels });
  };

  const handleSendMessage = (msg: ChatMessage) => {
    const updated = [...(erpState.chatMessages || []), msg];
    updateStateWithRecalculatedGL({ chatMessages: updated });
  };

  const handleUpdateCirculars = (circulars: AdministrativeCircular[]) => {
    updateStateWithRecalculatedGL({ administrativeCirculars: circulars });
  };

  const handleUpdateWorkflowRules = (rules: WorkflowRouteRule[]) => {
    updateStateWithRecalculatedGL({ workflowRules: rules });
  };

  const getTabDisplayTitle = (tab: NavTab | "HOME_HUB"): string => {
    const titles: Record<string, string> = {
      DASHBOARD: "لوحة القيادة التنفيذية",
      CHART_OF_ACCOUNTS: "دليل وشجرة الحسابات",
      JOURNAL_ENTRIES: "سجل قيود اليومية العامة",
      GENERAL_LEDGER: "دفتر الأستاذ العام",
      VOUCHERS: "سندات القبض والصرف",
      SALES_RETURNS: "فواتير المبيعات ونقاط البيع",
      PURCHASES_RETURNS: "فواتير المشتريات والتوريد",
      CASH_AND_BANK: "إدارة الخزائن والحسابات البنكية",
      CUSTOMERS_AR: "حسابات العملاء والذمم المدينة",
      VENDORS_AP: "حسابات الموردين والذمم الدائنة",
      FINANCIAL_REPORTS: "التقارير المالية والختامية",
      CASH_FLOW: "قائمة التدفقات النقدية",
      FIXED_ASSETS: "الأصول الثابتة والإهلاكات",
      COST_CENTERS: "مراكز التكلفة والمشاريع",
      PARTNERS: "إدارة الشراكات والشركاء وتوزيع الأرباح",
      INVENTORY: "المستودعات والمخزون السلعي",
      BRANCH_MANAGEMENT: "إدارة الفروع والمواقع",
      HUMAN_RESOURCES: "الموارد البشرية والرواتب",
      EXPENSES_AND_REVENUES: "المصروفات والإيرادات",
      SETTINGS: "إعدادات النظام والتهيئة",
      SECURITY_AND_ROLES: "الأمان والمستخدمين والصلاحيات",
      EXECUTIVE_MASTER_SUITE: "اللوحة السيادية والتحكم المالي المركزي",
      SAAS_PLATFORM: "منصة السحاب وإدارة المنشآت",
      CENTRAL_ARCHIVE: "الأرشيف السحابي المركزي",
      LEGAL_DOCUMENTS: "الوثائق القانونية وشروط الاستخدام",
    };
    return titles[tab] || "هذه الوحدة المحاسبية";
  };

  if (erpState === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans" dir="rtl">
        جاري تحميل البيانات...
      </div>
    );
  }

  const unbalancedCount = erpState.journalEntries.filter((j) => j.status === "DRAFT").length;

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-row overflow-x-hidden font-sans selection:bg-emerald-500 selection:text-white ${
        highContrast ? "high-contrast" : ""
      }`}
      dir="rtl"
    >
      <AnalyticsTracker />
      {authLoading ? (
        <div className="flex items-center justify-center min-h-screen w-full text-slate-400 font-medium">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>جاري التحقق من أمان الجلسة والبيئة السحابية...</span>
          </div>
        </div>
      ) : showPatent ? (
        <div className="relative w-full h-full">
           <PatentCertificateView />
           <button 
             onClick={() => setShowPatent(false)}
             className="fixed top-6 left-6 z-[100] bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-all shadow-xl"
           >
             ✕
           </button>
        </div>
      ) : !isAuthenticated ? (
        <CorporateWebsite
          availableBranches={erpState.branches?.map((b) => ({
            id: b.id,
            nameAr: b.nameAr,
            city: b.city,
            code: b.code,
          }))}
          onLoginSuccess={(user, branchId) => {
            if (user) {
              setErpState((prev) => (prev ? { ...prev, currentUser: user, activeBranchId: branchId || prev.activeBranchId } : prev));
              if (user.role === "CASHIER") {
                setActiveTab("SALES_RETURNS");
              } else if (user.role === "DATA_ENTRY") {
                setActiveTab("PURCHASES_RETURNS");
              } else if (user.role === "AUDITOR") {
                setActiveTab("FINANCIAL_REPORTS");
              } else if (user.plan === "TRIAL") {
                setActiveTab("DASHBOARD");
              }
            }
            sessionStorage.setItem("medo_erp_auth", "true");
            setIsAuthenticated(true);

            // Check if user is newly registered to display onboarding welcome message
            if (localStorage.getItem("medo_is_new_user") === "true") {
              // Reload state to reflect the wiped operational data from empty tenant initialization
              repository.loadState().then((loaded) => {
                if (loaded) {
                  setErpState(loaded);
                }
                setIsOnboardingOpen(true);
                localStorage.removeItem("medo_is_new_user");
              });
            }

            // Mock Login Notification to Admin
            try {
               console.log("SENDING LOGIN NOTIFICATION TO ADMIN (Mock Email/WhatsApp): zyadbdr925@gmail.com, +0967773586047", { user: user?.name, time: new Date() });
            } catch (e) {}
          }}
        />
      ) : (
        <>
          <Sidebar
            activeTab={activeTab === "HOME_HUB" ? "DASHBOARD" : activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setIsMobileMenuOpen(false);
            }}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            pendingApprovalsCount={unbalancedCount}
            currentUser={erpState.currentUser}
            isAdminUnlocked={isMasterAdminActive}
            onOpenAdminGateway={() => setIsSecretGatewayOpen(true)}
            onLockAdmin={() => {
              AdminPortalSecurityService.terminateAdminSession();
              setIsAdminSessionUnlocked(false);
              setActiveTab("DASHBOARD");
            }}
            onOpenAi={() => setIsAiModalOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onRefreshSystem={() => {
              const fresh = loadERPState();
              setErpState(fresh);
              NotificationSoundService.getInstance().playSound("SUCCESS_CHIME");
              alert("⚡ تم تنشيط وتحديث كافة وحدات النظام وبيانات المخزون السلعي بنجاح!");
            }}
            onQuickBackup={() => {
              setActiveTab("SCHEDULED_BACKUP");
            }}
            onLogout={handleLogout}
            appVersion={appVersion}
            onVersionClick={() => setIsSystemUpdateOpen(true)}
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />

          <div className="flex-1 flex flex-col min-w-0">
            {/* Original License Activation Banner */}
            {activatedLicenseBanner && (
              <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 border-b-2 border-blue-500 px-4 py-3 text-xs text-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl animate-fadeIn z-40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold shrink-0">
                    🎉
                  </div>
                  <div>
                    <div className="font-black text-white flex items-center gap-2">
                      <span>تم تفعيل النسخة الأصلية بنجاح عبر الرابط المخصص المعتمد!</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ترخيص كامل مفتوح
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      المنشأة: <strong className="text-white">{activatedLicenseBanner.companyName}</strong> | المفوض المعتمد: <strong className="text-amber-300">{activatedLicenseBanner.user}</strong>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActivatedLicenseBanner(null)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow transition cursor-pointer shrink-0"
                >
                  حسناً، بدء العمل &larr;
                </button>
              </div>
            )}

            {/* Refresh Success Toast Banner */}
            {refreshSuccessMessage && (
              <div className="bg-emerald-950/90 border-b border-emerald-500 px-4 py-2.5 text-xs text-emerald-200 flex items-center justify-between shadow-lg animate-fadeIn z-40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-bold">{refreshSuccessMessage}</span>
                </div>
                <button
                  onClick={() => setRefreshSuccessMessage(null)}
                  className="text-emerald-300 hover:text-white font-bold text-xs px-2 py-0.5 rounded bg-emerald-900/60"
                >
                  إخفاء
                </button>
              </div>
            )}

            {/* Mobile Top Bar (Only visible on screens < lg) */}
            <MobileTopBar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenUserMenu={() => setActiveTab("SETTINGS")}
              currentUser={erpState.currentUser}
              unreadAlertsCount={
                unbalancedCount +
                (erpState.approvalRequests?.filter((a) => a.status === "PENDING")?.length || 0)
              }
              selectedCurrency={selectedCurrency}
              setSelectedCurrency={setSelectedCurrency}
              currencies={erpState.currencies}
              onOpenAi={() => setIsAiModalOpen(true)}
              onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
              onOpenGlobalSearch={(initialQ) => {
                if (typeof initialQ === "string") setGlobalSearchInitialQuery(initialQ);
                setIsGlobalSearchOpen(true);
              }}
              isDarkMode={isDarkMode}
              onToggleDarkMode={handleToggleDarkMode}
              highContrast={highContrast}
              onToggleHighContrast={handleToggleHighContrast}
              onBack={() => setActiveTab("HOME_HUB")}
              onRefreshData={handleGlobalRefresh}
              isRefreshing={isRefreshingData}
              isAdminUnlocked={isMasterAdminActive}
              onOpenAdminGateway={() => setIsSecretGatewayOpen(true)}
              onLockAdmin={() => {
                AdminPortalSecurityService.terminateAdminSession();
                setIsAdminSessionUnlocked(false);
                setActiveTab("DASHBOARD");
              }}
            />

            {/* Desktop Header (Only visible on screens >= lg) */}
            <Header
              currencies={erpState.currencies}
              selectedCurrency={selectedCurrency}
              setSelectedCurrency={setSelectedCurrency}
              currentUser={erpState.currentUser}
              setCurrentUser={(u) => setErpState((prev) => ({ ...prev, currentUser: u }))}
              onOpenAi={() => setIsAiModalOpen(true)}
              onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
              onOpenGlobalSearch={(initialQ) => {
                if (typeof initialQ === "string") setGlobalSearchInitialQuery(initialQ);
                setIsGlobalSearchOpen(true);
              }}
              onOpenQuickAction={handleQuickAction}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onResetData={handleResetData}
              setActiveTab={setActiveTab}
              unbalancedJournalsCount={unbalancedCount}
              highContrast={highContrast}
              onToggleHighContrast={handleToggleHighContrast}
              isDarkMode={isDarkMode}
              onToggleDarkMode={handleToggleDarkMode}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onOpenSystemUpdate={() => setIsSystemUpdateOpen(true)}
              onRefreshData={handleGlobalRefresh}
              isRefreshing={isRefreshingData}
              isAdminUnlocked={isMasterAdminActive}
              onOpenAdminGateway={() => setIsSecretGatewayOpen(true)}
              onLockAdmin={() => {
                AdminPortalSecurityService.terminateAdminSession();
                setIsAdminSessionUnlocked(false);
                setActiveTab("DASHBOARD");
              }}
              onOpenTrialManager={() => setIsTrialManagerOpen(true)}
              onLogout={handleLogout}
            />

            {/* 48-Hour Trial Live Countdown & Operations Bar */}
            {(() => {
              const activeTenant = TenantIsolationService.resolveActiveTenant();
              const isTrialClient = TenantIsolationService.isTrialClientTenant(activeTenant);
              const isTrialPlan = erpState.currentUser?.plan === "TRIAL";

              if (!isTrialPlan && !isTrialClient) return null;

              const trial = trialService.getTrialState();
              const remainingHrs = trial ? trial.remainingHours : 47;
              const remainingMins = trial ? trial.remainingMinutes : 59;
              const isExpired = trial ? trial.isExpired : false;
              const clientTracking = isTrialClient ? trialOperationsService.getClientTracking(activeTenant) : null;
              const opsCount = clientTracking ? clientTracking.operationsCount : 0;
              const isOpsLocked = clientTracking ? opsCount >= 50 : false;
              const tenantMeta = isTrialClient ? TenantIsolationService.getTrialTenantDetails(activeTenant) : null;
              const companyName = tenantMeta?.nameAr || erpState.systemSettings?.companyNameAr || TenantIsolationService.getActiveTenantDetails()?.nameAr || "المنشأة المعتمدة";

              return (
                <div className={`bg-gradient-to-r ${isOpsLocked || isExpired ? "from-rose-950 via-slate-900 to-rose-950 border-rose-600/50" : "from-[#170e03] via-slate-900 to-[#170e03] border-amber-600/50"} border-b px-3 sm:px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-amber-200 shadow-md`}>
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isOpsLocked || isExpired ? "bg-rose-500 animate-ping" : "bg-amber-400 animate-ping"}`}></span>
                    <span className="font-black text-white">
                      {isOpsLocked
                        ? "🚨 تم استنفاد سقف العمليات (50/50):"
                        : isExpired
                        ? "🚨 انتهت الفترة التجريبية (48 ساعة):"
                        : `⏳ النسخة التجريبية (${companyName}):`}
                    </span>
                    <span className={`font-mono px-2 py-0.5 rounded border text-[11px] font-bold ${
                      isOpsLocked || isExpired
                        ? "bg-rose-950/80 border-rose-600/60 text-rose-300"
                        : "bg-amber-950/80 border-amber-500/40 text-amber-300"
                    }`}>
                      {isOpsLocked
                        ? "مقفل • يرجى التواصل لتفعيل النسخة الكاملة"
                        : isExpired
                        ? "انقضت المدة • يتطلب المصادقة الثنائية 2FA"
                        : `متبقي: ${remainingHrs} ساعة و ${remainingMins} دقيقة`}
                    </span>

                    {isTrialClient && (
                      <span className={`font-mono px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        opsCount >= 45
                          ? "bg-rose-950 text-rose-300 border-rose-600 animate-pulse"
                          : opsCount >= 25
                          ? "bg-amber-950 text-amber-300 border-amber-600"
                          : "bg-blue-950 text-blue-300 border-blue-600"
                      }`}>
                        العمليات المنجزة: {opsCount} / 50 عملية
                      </span>
                    )}

                    <span className="hidden sm:inline text-slate-400 font-medium text-[11px]">
                      (المفوض: {erpState.currentUser?.name || tenantMeta?.adminName || "المفوض المعتمد"})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTrialManagerOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-600/40 font-bold text-[11px] transition shadow cursor-pointer flex items-center gap-1"
                      title="لوحة رقابة ومتابعة النسخ التجريبية للعملاء الثلاثة"
                    >
                      <span>🎯 رقابة النسخ التجريبية</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        trialService.simulateTrialExpiration(
                          companyName,
                          erpState.currentUser?.email || "trial@medo-trial.com"
                        );
                        setIsTrialLockModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-600/40 font-bold text-[11px] transition shadow cursor-pointer flex items-center gap-1"
                      title="محاكاة انقضاء الـ 48 ساعة أو استنفاد العمليات لتجربة شاشة القفل"
                    >
                      <span>⚡ تجربة القفل</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTrialLockModalOpen(true)}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[11px] shadow transition cursor-pointer flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                      <span>المصادقة الثنائية وترقية النسخة 🔑</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              {erpState.currentUser?.plan === "TRIAL" && (trialService.getTrialState()?.isExpired ?? false) && ["DASHBOARD", "INTEGRATED_ERP", "SAAS_PLATFORM", "SCHEDULED_BACKUP", "CLOUD_SYNC", "TRUST_CENTER", "SETTINGS", "THEME_STUDIO"].includes(activeTab) ? (
                <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center animate-fade-in">
                  <div className="w-24 h-24 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                    <Lock className="w-12 h-12 text-rose-500" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">الوصول مقيد (نسخة تجريبية)</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      هذه الوحدة غير متاحة في النسخة التجريبية الحالية. للوصول إلى لوحات التحكم السحابية المتقدمة والإعدادات المركزية، يرجى ترقية حسابك إلى النسخة الكاملة (Pro / Enterprise).
                    </p>
                  </div>
                  <button
                    onClick={() => setIsTrialLockModalOpen(true)}
                    className="px-6 py-3 rounded-xl bg-sap-secondary hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-sap-secondary/30 transition-all cursor-pointer"
                  >
                    ترقية النسخة وتفعيل النظام
                  </button>
                </div>
              ) : !TenantIsolationService.isTabAllowedForRole(erpState.currentUser?.role, activeTab) ? (
                <UnauthorizedAccessView
                  currentUser={erpState.currentUser}
                  attemptedTabTitle={getTabDisplayTitle(activeTab)}
                  onNavigateToAllowed={() => {
                    if (erpState.currentUser?.role === "CASHIER") setActiveTab("SALES_RETURNS");
                    else if (erpState.currentUser?.role === "DATA_ENTRY") setActiveTab("PURCHASES_RETURNS");
                    else if (erpState.currentUser?.role === "AUDITOR") setActiveTab("FINANCIAL_REPORTS");
                    else setActiveTab("GENERAL_LEDGER");
                  }}
                  onLogout={() => {
                    sessionStorage.removeItem("medo_erp_auth");
                    setIsAuthenticated(false);
                  }}
                />
              ) : (
                <Suspense fallback={null}>
                  <>
                    {activeTab === "HOME_HUB" && (
                <MobileHomeHub
                  onSelectModule={(mod) => {
                    React.startTransition(() => {
                      setActiveTab(mod);
                    });
                  }}
                  erpState={erpState}
                  displayCurrency={selectedCurrency}
                  currencies={erpState.currencies}
                  onOpenQuickAction={handleQuickAction}
                  onOpenAi={() => setIsAiModalOpen(true)}
                />
              )}
              {activeTab === "DASHBOARD" && (
                <Dashboard
                  accounts={erpState.accounts}
                  journalEntries={erpState.journalEntries}
                  vouchers={erpState.vouchers}
                  customers={erpState.customers}
                  vendors={erpState.vendors}
                  invoices={erpState.invoices}
                  bankAccounts={erpState.bankAccounts}
                  cashVaults={erpState.cashVaults}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                  setActiveTab={setActiveTab}
                  onOpenQuickAction={handleQuickAction}
                  onOpenAi={() => setIsAiModalOpen(true)}
                  onOpenTrialLockModal={() => setIsTrialLockModalOpen(true)}
                />
              )}
              {activeTab === "USER_MANUAL" && (
                <UserManualView
                  onNavigateToModule={(tab) => {
                    React.startTransition(() => {
                      setActiveTab(tab);
                    });
                  }}
                  currentUser={erpState.currentUser}
                  companyName={erpState.systemSettings?.companyNameAr || TenantIsolationService.getActiveTenantDetails()?.nameAr || "المنشأة المعتمدة"}
                  isDarkMode={isDarkMode}
                />
              )}
              {activeTab === "COLLABORATION" && (
                <EnterpriseCollaborationView
                  currentUser={erpState.currentUser}
                  branches={erpState.branches || []}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                  correspondences={erpState.correspondences || []}
                  onUpdateCorrespondences={handleUpdateCorrespondences}
                  approvalRequests={erpState.approvalRequests || []}
                  onUpdateApprovalRequests={handleUpdateApprovalRequests}
                  auditLogs={erpState.auditLogs || []}
                  onAddAuditLog={handleAddAuditLog}
                  systemAlerts={erpState.systemAlerts || []}
                  onUpdateSystemAlerts={handleUpdateSystemAlerts}
                  chatChannels={erpState.chatChannels || []}
                  onUpdateChatChannels={handleUpdateChatChannels}
                  chatMessages={erpState.chatMessages || []}
                  onSendMessage={handleSendMessage}
                  circulars={erpState.administrativeCirculars || []}
                  onUpdateCirculars={handleUpdateCirculars}
                  workflowRules={erpState.workflowRules || []}
                  onUpdateWorkflowRules={handleUpdateWorkflowRules}
                  onNavigateToModule={(tab) => setActiveTab(tab)}
                />
              )}
              {activeTab === "INTEGRATED_ERP" && (
                <IntegratedErpSuiteView
                  erpState={erpState}
                  displayCurrency={selectedCurrency}
                  currencies={erpState.currencies}
                  onSaveInvoice={handleSaveInvoice}
                  onSaveVoucher={handleSaveVoucher}
                  onSaveJournalEntry={handleSaveJournalEntry}
                  onAddStockMovement={handleAddStockMovement}
                  onNavigateToModule={(tab) => setActiveTab(tab)}
                  onOpenAi={() => setIsAiModalOpen(true)}
                />
              )}
              {activeTab === "MEDO_BROCHURE" && (
                <MedoErpBrochureView
                  onNavigateToModule={(tab) => setActiveTab(tab)}
                  isDarkMode={isDarkMode}
                />
              )}
              {activeTab === "CHART_OF_ACCOUNTS" && (
                <ChartOfAccountsView
                  accounts={erpState.accounts}
                  journalEntries={erpState.journalEntries}
                  onAddAccount={handleAddAccount}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                />
              )}
              {activeTab === "JOURNAL_ENTRIES" && (
                <JournalEntriesView
                  journalEntries={erpState.journalEntries}
                  accounts={erpState.accounts}
                  costCenters={erpState.costCenters}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                  onSaveJournalEntry={handleSaveJournalEntry}
                  onPostJournalEntry={handlePostJournalEntry}
                  onPrintDocument={handleOpenPrintDoc}
                  onOpenAi={() => setIsAiModalOpen(true)}
                />
              )}
              {activeTab === "GENERAL_LEDGER" && (
                <GeneralLedgerView
                  accounts={erpState.accounts}
                  journalEntries={erpState.journalEntries}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                />
              )}
              {activeTab === "VOUCHERS" && (
                <VouchersView
                  vouchers={erpState.vouchers}
                  accounts={erpState.accounts}
                  bankAccounts={erpState.bankAccounts}
                  cashVaults={erpState.cashVaults}
                  costCenters={erpState.costCenters}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                  customers={erpState.customers}
                  vendors={erpState.vendors}
                  onSaveVoucher={handleSaveVoucher}
                  onAddAccount={handleAddAccount}
                  onAddCustomer={handleAddCustomer}
                  onAddVendor={handleAddVendor}
                  onPrintDocument={handleOpenPrintDoc}
                  onShareDocument={handleOpenShareDoc}
                />
              )}
              {activeTab === "SALES_RETURNS" && (
                <SalesAndReturnsView
                  invoices={erpState.invoices}
                  customers={erpState.customers}
                  accounts={erpState.accounts}
                  cashVaults={erpState.cashVaults}
                  bankAccounts={erpState.bankAccounts}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                  inventoryItems={erpState.inventoryItems || []}
                  onSaveInvoice={handleSaveInvoice}
                  onAddCustomer={handleAddCustomer}
                  onAddInventoryItem={handleAddInventoryItem}
                  onPrintDocument={handleOpenPrintDoc}
                  onShareDocument={handleOpenShareDoc}
                />
              )}
              {activeTab === "PURCHASES_RETURNS" && (
                <PurchasesAndReturnsView
                  invoices={erpState.bills && erpState.bills.length > 0 ? erpState.bills : (erpState.invoices || []).filter(i => i.type === "PURCHASE" || i.type === "PURCHASE_RETURN")}
                  vendors={erpState.vendors}
                  accounts={erpState.accounts}
                  cashVaults={erpState.cashVaults}
                  bankAccounts={erpState.bankAccounts}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                  inventoryItems={erpState.inventoryItems || []}
                  onSaveInvoice={handleSaveInvoice}
                  onAddVendor={handleAddVendor}
                  onAddInventoryItem={handleAddInventoryItem}
                  onPrintDocument={handleOpenPrintDoc}
                  onShareDocument={handleOpenShareDoc}
                />
              )}
              {activeTab === "CASH_AND_BANK" && (
                <CashAndBankView
                  bankAccounts={erpState.bankAccounts}
                  cashVaults={erpState.cashVaults}
                  accounts={erpState.accounts}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                  onTransferFunds={handleTransferFunds}
                />
              )}
              {activeTab === "CUSTOMERS_AR" && (
                <CustomersAndARView
                  customers={erpState.customers}
                  invoices={erpState.invoices}
                  vouchers={erpState.vouchers}
                  accounts={erpState.accounts}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                  inventoryItems={erpState.inventoryItems || []}
                  onAddCustomer={handleAddCustomer}
                  onAddInventoryItem={handleAddInventoryItem}
                  onSaveInvoice={handleSaveInvoice}
                  onPrintDocument={handleOpenPrintDoc}
                  onShareDocument={handleOpenShareDoc}
                />
              )}
              {activeTab === "CLIENT_EXCHANGE" && (
                <ClientExchangeView
                  accounts={erpState.exchangeAccounts || []}
                  transactions={erpState.exchangeTransactions || []}
                  customers={erpState.customers}
                  inventoryItems={erpState.inventoryItems || []}
                  currencies={erpState.currencies}
                  settings={erpState.systemSettings || DEFAULT_SYSTEM_SETTINGS}
                  cashVaults={erpState.cashVaults}
                  bankAccounts={erpState.bankAccounts}
                  onUpdateAccounts={handleUpdateExchangeAccounts}
                  onUpdateTransactions={handleUpdateExchangeTransactions}
                  onAddVoucher={handleSaveVoucher}
                  onAddJournalEntry={handleSaveJournalEntry}
                />
              )}
              {activeTab === "VENDORS_AP" && (
                <VendorsAndAPView
                  vendors={erpState.vendors}
                  invoices={erpState.bills && erpState.bills.length > 0 ? erpState.bills : (erpState.invoices || []).filter(i => i.type === "PURCHASE" || i.type === "PURCHASE_RETURN")}
                  accounts={erpState.accounts}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                  onAddVendor={handleAddVendor}
                  onSaveInvoice={handleSaveInvoice}
                  onPrintDocument={handleOpenPrintDoc}
                  onShareDocument={handleOpenShareDoc}
                />
              )}
              {activeTab === "FINANCIAL_REPORTS" && (
                <FinancialReportsView
                  accounts={erpState.accounts}
                  journalEntries={erpState.journalEntries}
                  vouchers={erpState.vouchers}
                  cashVaults={erpState.cashVaults}
                  bankAccounts={erpState.bankAccounts}
                  invoices={erpState.invoices}
                  fixedAssets={erpState.fixedAssets}
                  branches={erpState.branches}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                  initialReportType="BALANCE_SHEET"
                  onOpenAi={() => setIsAiModalOpen(true)}
                  onShareReport={handleOpenShareDoc}
                />
              )}
              {activeTab === "CASH_FLOW" && (
                <FinancialReportsView
                  accounts={erpState.accounts}
                  journalEntries={erpState.journalEntries}
                  vouchers={erpState.vouchers}
                  cashVaults={erpState.cashVaults}
                  bankAccounts={erpState.bankAccounts}
                  invoices={erpState.invoices}
                  fixedAssets={erpState.fixedAssets}
                  branches={erpState.branches}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                  initialReportType="CASH_FLOW"
                  onOpenAi={() => setIsAiModalOpen(true)}
                  onShareReport={handleOpenShareDoc}
                />
              )}
              {activeTab === "THEME_STUDIO" && (
                <ThemeStudioView
                  currentUser={erpState.currentUser}
                  displayCurrency={selectedCurrency}
                  onThemeChanged={(theme) => {
                    ThemeManager.applyTheme(theme, true);
                  }}
                />
              )}
              {activeTab === "FIXED_ASSETS" && (
                <FixedAssetsModule
                  fixedAssets={erpState.fixedAssets}
                  costCenters={erpState.costCenters}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                  onAddFixedAsset={handleAddFixedAsset}
                  onUpdateFixedAsset={handleUpdateFixedAsset}
                  onDeleteFixedAsset={handleDeleteFixedAsset}
                  onRunDepreciation={handleRunDepreciation}
                  onTransferAsset={handleTransferFixedAsset}
                  onAddMaintenance={handleAddAssetMaintenance}
                  onDisposeAsset={handleDisposeFixedAsset}
                  onOpenCostCenters={() => setActiveTab("COST_CENTERS")}
                />
              )}
              {activeTab === "COST_CENTERS" && (
                <CostCentersAndAssetsView
                  costCenters={erpState.costCenters}
                  fixedAssets={erpState.fixedAssets}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                  onAddCostCenter={handleAddCostCenter}
                  onAddFixedAsset={handleAddFixedAsset}
                  onUpdateFixedAsset={handleUpdateFixedAsset}
                  onDeleteFixedAsset={handleDeleteFixedAsset}
                  onRunDepreciation={handleRunDepreciation}
                  onTransferAsset={handleTransferFixedAsset}
                  onAddMaintenance={handleAddAssetMaintenance}
                  onDisposeAsset={handleDisposeFixedAsset}
                />
              )}
              {activeTab === "PARTNERS" && (
                <PartnersManagementView
                  partners={erpState.partners || []}
                  partnerContributions={erpState.partnerContributions || []}
                  profitDistributions={erpState.profitDistributions || []}
                  partnerWithdrawals={erpState.partnerWithdrawals || []}
                  accounts={erpState.accounts}
                  journalEntries={erpState.journalEntries}
                  displayCurrency={selectedCurrency}
                  currentUser={erpState.currentUser}
                  onUpdatePartnersState={handleUpdatePartnersState}
                />
              )}
              {isMasterAdminActive && activeTab === "EXECUTIVE_MASTER_SUITE" && (
                <ExecutiveMasterSystemSuite
                  fullState={erpState}
                  onUpdateSystemSettings={handleUpdateSystemSettings}
                  onResetAllData={handleResetData}
                  onLogout={() => {
                    sessionStorage.removeItem("medo_erp_auth");
                    setIsAuthenticated(false);
                  }}
                  isSuperAdmin={
                    erpState.currentUser?.role === "SUPER_ADMIN" ||
                    erpState.currentUser?.role === "SYSTEM_ADMIN" ||
                    erpState.currentUser?.name?.includes("بدر") ||
                    erpState.currentUser?.id === "USR-MAIN-001" ||
                    localStorage.getItem("medo_erp_admin_mode") === "true"
                  }
                />
              )}
              {activeTab === "CURRENCY_SETTINGS" && (
                <CurrencySettingsView
                  currencies={erpState.currencies}
                  onUpdateExchangeRate={handleUpdateExchangeRate}
                  onExecuteForexRevaluation={handleExecuteForexRevaluation}
                />
              )}
              {activeTab === "SETTINGS" && (
                <SystemSettingsView
                  systemSettings={erpState.systemSettings}
                  onUpdateSystemSettings={handleUpdateSystemSettings}
                  currencies={erpState.currencies}
                  onUpdateCurrencies={handleUpdateCurrenciesList}
                  currentUser={erpState.currentUser}
                  onSwitchUser={handleSwitchUser}
                  onResetAllData={handleResetData}
                  fullState={erpState}
                  onLogout={() => {
                    sessionStorage.removeItem("medo_erp_auth");
                    setIsAuthenticated(false);
                  }}
                  inventoryItems={erpState.inventoryItems}
                  stockMovements={erpState.stockMovements}
                  unavailableRequests={erpState.unavailableRequests}
                  roles={erpState.roles}
                  onUpdateRoles={handleUpdateRoles}
                  usersList={erpState.usersList}
                  onUpdateUsersList={handleUpdateUsersList}
                />
              )}
              {activeTab === "LEGAL_DOCUMENTS" && (
                <LegalDocumentsPage
                  initialDoc={legalInitialDoc}
                  onBack={() => setActiveTab("DASHBOARD")}
                />
              )}
              {activeTab === "SCHEDULED_BACKUP" && (
                <ScheduledBackupView
                  systemSettings={erpState.systemSettings}
                  onUpdateSystemSettings={handleUpdateSystemSettings}
                  fullState={erpState}
                />
              )}
              {activeTab === "INVENTORY" && (
                <InventoryView
                  inventoryItems={erpState.inventoryItems || []}
                  stockMovements={erpState.stockMovements || []}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                  onAddInventoryItem={handleAddInventoryItem}
                  onUpdateInventoryItem={handleUpdateInventoryItem}
                  onDeleteInventoryItem={handleDeleteInventoryItem}
                  onBulkDeleteInventoryItems={handleBulkDeleteInventoryItems}
                  onClearAllInventoryItems={handleClearAllInventoryItems}
                  onImportInventoryItems={handleImportInventoryItems}
                  onAddStockMovement={handleAddStockMovement}
                  onSaveJournalEntry={handleSaveJournalEntry}
                />
              )}
              {activeTab === "BRANCH_MANAGEMENT" && (
                <BranchManagementView
                  branches={erpState.branches || []}
                  activeBranchId={erpState.activeBranchId || "ALL"}
                  onSetActiveBranchId={handleSetActiveBranchId}
                  onSaveBranch={handleSaveBranch}
                  onDeleteBranch={handleDeleteBranch}
                  invoices={erpState.invoices}
                  bills={erpState.bills || []}
                  journalEntries={erpState.journalEntries}
                  accounts={erpState.accounts}
                  costCenters={erpState.costCenters}
                  inventoryItems={erpState.inventoryItems || []}
                  vouchers={erpState.vouchers}
                  cashVaults={erpState.cashVaults}
                  bankAccounts={erpState.bankAccounts}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                  currentUser={erpState.currentUser}
                  onOpenAi={() => setIsAiModalOpen(true)}
                  onShareReport={handleOpenShareDoc}
                />
              )}
              {activeTab === "HUMAN_RESOURCES" && (
                <HumanResourcesView
                  employees={erpState.hrEmployees || []}
                  decisions={erpState.hrDecisions || []}
                  attendanceRecords={erpState.hrAttendanceRecords || []}
                  shifts={erpState.hrShifts || []}
                  payrolls={erpState.hrPayrolls || []}
                  loans={erpState.hrLoans || []}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                  onUpdateEmployees={handleUpdateHREmployees}
                  onUpdateDecisions={handleUpdateHRDecisions}
                  onUpdateAttendance={handleUpdateHRAttendance}
                  onUpdateShifts={handleUpdateHRShifts}
                  onUpdatePayrolls={handleUpdateHRPayrolls}
                  onUpdateLoans={handleUpdateHRLoans}
                  onAddJournalEntry={handleAddJournalEntry}
                />
              )}
              {activeTab === "EXPENSES_AND_REVENUES" && (
                <ExpensesAndRevenuesView
                  accounts={erpState.accounts}
                  journalEntries={erpState.journalEntries}
                  vouchers={erpState.vouchers}
                  cashVaults={erpState.cashVaults}
                  bankAccounts={erpState.bankAccounts}
                  costCenters={erpState.costCenters}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                  customers={erpState.customers}
                  vendors={erpState.vendors}
                  onSaveVoucher={handleSaveVoucher}
                  onAddAccount={handleAddAccount}
                  onAddCustomer={handleAddCustomer}
                  onAddVendor={handleAddVendor}
                  onPrintDocument={handleOpenPrintDoc}
                />
              )}
              {(activeTab === "CLOUD_SYNC" || activeTab === "HUAWEI_CLOUD" || activeTab === "ALIBABA_CLOUD" || activeTab === "QQ_CLOUD") && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSyncViewTab("OFFLINE_LOCAL")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          syncViewTab === "OFFLINE_LOCAL"
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        ⚡ محرك العمل دون اتصال (Offline-First Engine)
                      </button>
                      <button
                        onClick={() => setSyncViewTab("CLOUD_MONITOR")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          syncViewTab === "CLOUD_MONITOR"
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        🌐 مراقبة السحابة والنسخ المتماثل (Multi-Cloud Active-Active)
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                      المحرك المحلي يدعم الاستقلالية التامة واستعادة البيانات وتشفيرها
                    </span>
                  </div>

                  {syncViewTab === "OFFLINE_LOCAL" ? (
                    <OfflineSyncCenter
                      fullState={erpState}
                      onStateRestored={(restored) => {
                        setErpState(restored);
                        saveERPState(restored);
                      }}
                      onOpenQuickAction={(actionType) => {
                        if (actionType === "INVOICE") setActiveTab("SALES_RETURNS");
                        else if (actionType === "JOURNAL") setActiveTab("JOURNAL_ENTRIES");
                        else if (actionType === "RECEIPT" || actionType === "PAYMENT") setActiveTab("VOUCHERS");
                      }}
                    />
                  ) : (
                    <CloudSyncDashboard />
                  )}
                </div>
              )}
              {activeTab === "SAAS_PLATFORM" && (() => {
                const userRole = erpState?.currentUser?.role;
                const isAdminOrSuperAdmin =
                  userRole === "ADMIN" ||
                  userRole === "SUPER_ADMIN" ||
                  userRole === "SYSTEM_ADMIN" ||
                  erpState?.currentUser?.name?.includes("بدر") ||
                  erpState?.currentUser?.id === "USR-MAIN-001" ||
                  localStorage.getItem("medo_erp_admin_mode") === "true";

                const isDesignerAuth = typeof window !== 'undefined' && sessionStorage.getItem("medo_designer_badr_auth") === "true";

                if (!isAdminOrSuperAdmin) {
                  return (
                    <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl max-w-lg mx-auto mt-12">
                      <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                        🔒
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">عذراً، غير مصرح لك بالوصول</h3>
                      <p className="text-sm text-slate-400 mb-6">
                        وحدة إدارة المنصة السحابية والتراخيص مقتصرة حصرياً على مسؤولي النظام والمصمم الأساسي.
                      </p>
                      <button
                        onClick={() => setActiveTab("DASHBOARD")}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all"
                      >
                        العودة إلى لوحة التحكم الرئيسية
                      </button>
                    </div>
                  );
                }

                if (!isDesignerAuth) {
                  return (
                    <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl max-w-md mx-auto mt-16 shadow-2xl text-center">
                      <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                        🔒
                      </div>
                      <h3 className="text-lg font-black text-white mb-2">بوابة المصمم بدر عايض زياد</h3>
                      <p className="text-xs text-slate-400 mb-6">
                        يرجى إدخال كلمة المرور الخاصة بالمصمم للاطلاع على إدارة المنصة السحابية والتراخيص:
                      </p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const inputVal = (document.getElementById("direct_designer_pin") as HTMLInputElement)?.value;
                          if (inputVal === "BadrZiad2026" || inputVal === "بدر2026" || inputVal === "1234") {
                            sessionStorage.setItem("medo_designer_badr_auth", "true");
                            setErpState((prev) => ({ ...prev })); // force re-render
                          } else {
                            alert("⚠️ كلمة المرور غير صحيحة. يرجى إدخال كلمة مرور المصمم بدر عايض زياد الصحيحة.");
                          }
                        }}
                        className="space-y-4"
                      >
                        <input
                          id="direct_designer_pin"
                          type="password"
                          placeholder="كلمة مرور المصمم..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-center font-mono tracking-widest"
                          autoFocus
                        />
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setActiveTab("DASHBOARD")}
                            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30"
                          >
                            فتح الإدارة
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                }

                return (
                  <ExecutiveMasterSystemSuite
                    fullState={erpState}
                    onUpdateSystemSettings={handleUpdateSystemSettings}
                    onResetAllData={handleResetData}
                    onLogout={handleLogout}
                    isSuperAdmin={true}
                  />
                );
              })()}
              {isMasterAdminActive && activeTab === "CENTRAL_ARCHIVE" && (
                <CentralArchiveSection
                  companyName={erpState.systemSettings.companyNameAr}
                  currencies={erpState.currencies}
                  displayCurrency={selectedCurrency}
                />
              )}
              {isMasterAdminActive && activeTab === "TRUST_CENTER" && <TrustCenterView />}
              {activeTab === "AI_ASSISTANT" && (
                <AiFinancialAdvisorModal
                  isOpen={true}
                  onClose={() => setActiveTab("DASHBOARD")}
                  accounts={erpState.accounts}
                  journalEntries={erpState.journalEntries}
                  currencies={erpState.currencies}
                  bankAccounts={erpState.bankAccounts}
                  cashVaults={erpState.cashVaults}
                  vouchers={erpState.vouchers}
                  invoices={erpState.invoices}
                  customers={erpState.customers}
                  vendors={erpState.vendors}
                  displayCurrency={selectedCurrency}
                  onOpenQuickAction={handleQuickAction}
                />
              )}
              </>
                </Suspense>
              )}
            </main>

            {/* Persistent Enterprise Brand Footer */}
            <SystemFooter
              isCompact={true}
              onOpenLegalDocuments={(tab) => {
                if (tab) setLegalInitialDoc(tab);
                setActiveTab("LEGAL_DOCUMENTS");
              }}
              onOpenInstantDeploy={() => setIsInstantDeployOpen(true)}
            />
          </div>

          <SapOnboardingModal
            isOpen={isOnboardingOpen}
            onClose={() => setIsOnboardingOpen(false)}
            onSelectTab={(tab) => setActiveTab(tab as any)}
            activeTab={activeTab}
          />

          <AiFinancialAdvisorModal
            isOpen={isAiModalOpen}
            onClose={() => setIsAiModalOpen(false)}
            accounts={erpState.accounts}
            journalEntries={erpState.journalEntries}
            currencies={erpState.currencies}
            bankAccounts={erpState.bankAccounts}
            cashVaults={erpState.cashVaults}
            vouchers={erpState.vouchers}
            invoices={erpState.invoices}
            customers={erpState.customers}
            vendors={erpState.vendors}
            displayCurrency={selectedCurrency}
            onOpenQuickAction={handleQuickAction}
          />

          <AiVoiceSearchModal
            isOpen={isVoiceSearchOpen}
            onClose={() => setIsVoiceSearchOpen(false)}
            setActiveTab={setActiveTab}
            erpState={erpState}
            onSaveJournalEntry={handleSaveJournalEntry}
          />

          <GlobalSearchModal
            isOpen={isGlobalSearchOpen}
            onClose={() => {
              setIsGlobalSearchOpen(false);
              setGlobalSearchInitialQuery("");
            }}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setIsGlobalSearchOpen(false);
            }}
            invoices={erpState.invoices}
            bills={erpState.bills}
            journalEntries={erpState.journalEntries}
            customers={erpState.customers}
            vendors={erpState.vendors}
            accounts={erpState.accounts}
            currencies={erpState.currencies}
            displayCurrency={selectedCurrency}
            onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
            initialQuery={globalSearchInitialQuery}
          />

          <PrintDocumentModal
            isOpen={!!printDocType}
            onClose={() => setPrintDocType(null)}
            documentType={printDocType}
            documentData={printDocData}
            currencies={erpState.currencies}
            displayCurrency={selectedCurrency}
            onOpenShareModal={handleOpenShareDoc}
            isDarkMode={isDarkMode}
            systemSettings={erpState.systemSettings}
          />

          <ShareDocumentModal
            isOpen={!!shareData}
            onClose={() => setShareData(null)}
            shareData={shareData}
            currencies={erpState.currencies}
            displayCurrency={selectedCurrency}
            onOpenPrint={() => {
              if (shareData) {
                setPrintDocType(shareData.type === "INVOICE" ? "INVOICE" : "RECEIPT");
                setPrintDocData(shareData.data);
              }
            }}
          />

          {/* Mobile Floating Action Button (FAB - Section 2.2) */}
          <MobileFloatingActionButton
            activeTab={activeTab}
            onAction={handleQuickAction}
            onOpenAi={() => setIsAiModalOpen(true)}
          />

          {/* Mobile Notifications & Approvals Sheet */}
          <MobileNotificationsSheet
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            erpState={erpState}
            unbalancedJournalsCount={unbalancedCount}
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
              setIsNotificationsOpen(false);
            }}
          />

          {/* Mobile Document Detail Screen Modal (Section 2.3) */}
          <MobileDocumentDetailModal
            document={mobileDetailDoc}
            onClose={() => setMobileDetailDoc(null)}
            displayCurrency={selectedCurrency}
            currencies={erpState.currencies}
            onPrint={(doc) => {
              if (doc.type === "INVOICE") handleOpenPrintDoc("INVOICE", doc.data);
              else if (doc.type === "VOUCHER")
                handleOpenPrintDoc(
                  doc.data.type === "RECEIPT" ? "RECEIPT" : "PAYMENT",
                  doc.data
                );
              else if (doc.type === "JOURNAL_ENTRY")
                handleOpenPrintDoc("JOURNAL", doc.data);
            }}
            onShare={(doc) => {
              if (doc.type === "INVOICE") {
                handleOpenShareDoc({
                  type: "INVOICE",
                  data: doc.data,
                  recipientName: doc.data.customerName,
                  recipientPhone: doc.data.customerPhone,
                });
              }
            }}
          />

          <TrialLockModal
            isOpen={isTrialLockModalOpen}
            onClose={() => setIsTrialLockModalOpen(false)}
            currentUser={erpState.currentUser}
            currentCompany={erpState.systemSettings?.companyNameAr || TenantIsolationService.getActiveTenantDetails()?.nameAr || "المنشأة المعتمدة"}
            onActivateWithLicenseKey={(key) => {
              setErpState((prev) =>
                prev
                  ? {
                      ...prev,
                      currentUser: prev.currentUser
                        ? { ...prev.currentUser, plan: "ENTERPRISE" }
                        : null,
                    }
                  : prev
              );
            }}
            onOpenLegalPolicy={(policy) => {
              setGlobalLegalPolicy(policy);
              setGlobalLegalModalOpen(true);
            }}
          />

          <TrialManagerDashboardModal
            isOpen={isTrialManagerOpen}
            onClose={() => setIsTrialManagerOpen(false)}
            onSwitchToClient={(clientId) => {
              TenantIsolationService.setActiveTenant(clientId);
              window.location.search = `?client=${clientId}`;
            }}
          />

          <LegalPoliciesModal
            isOpen={globalLegalModalOpen}
            onClose={() => setGlobalLegalModalOpen(false)}
            initialPolicy={globalLegalPolicy}
          />

          <SystemUpdateModal
            isOpen={isSystemUpdateOpen}
            onClose={() => setIsSystemUpdateOpen(false)}
            erpState={erpState}
            onUpdateState={(newState) => {
              setErpState((prev) => (prev ? { ...prev, ...newState } : prev));
            }}
          />

          {/* Self-Service Enterprise Registration Portal Overlay */}
          {isSelfRegistrationOpen && (
            <SaaSRegistrationPortal
              onCancel={() => setIsSelfRegistrationOpen(false)}
              onRegistrationSuccess={(newTenant) => {
                setIsSelfRegistrationOpen(false);
                const targetDomain = newTenant?.masterDomain || `/?tenant=${newTenant?.id || newTenant?.slug}`;
                window.location.href = targetDomain;
              }}
            />
          )}

          {/* Sovereign 3-Layer Admin Gateway Gate Modal (Badr Ayed Ziad Exclusive) */}
          <SecretAdminGatewayModal
            isOpen={isSecretGatewayOpen}
            onClose={() => setIsSecretGatewayOpen(false)}
            onSuccessUnlock={() => {
              setIsAdminSessionUnlocked(true);
              setActiveTab("EXECUTIVE_MASTER_SUITE");
            }}
          />

          {/* Global Role Switching Toolbar & Top Floating Bar */}
          <RoleSwitchingToolbar
            currentUser={erpState.currentUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            onSwitchBackToManager={handleSwitchBackToManager}
            onSwitchRole={handleSwitchRole}
            hasOriginalManagerSession={hasOriginalManagerSession}
            companyName={erpState.systemSettings?.companyNameAr}
          />

          {/* Global Universal Search Engine Modal (200+ Tenants & Users Index) */}
          <SapUniversalSearchModal
            isOpen={isUniversalSearchOpen}
            onClose={() => setIsUniversalSearchOpen(false)}
            onSelectCompany={(companyId, companyName) => {
              setIsUniversalSearchOpen(false);
              window.location.search = `?tenant=${companyId}`;
            }}
            onSelectUserDirectLogin={(roleItem) => {
              setIsUniversalSearchOpen(false);
              const targetRole = roleItem.role.toLowerCase();
              window.location.search = `?role=${targetRole}&emp=${encodeURIComponent(roleItem.roleTitleAr || roleItem.name)}`;
            }}
          />

          {/* Instant Deploy Modal */}
          <InstantDeployModal
            isOpen={isInstantDeployOpen}
            onClose={() => setIsInstantDeployOpen(false)}
          />

          {/* Sovereign Rejuvenation & Optimization Modal (مركز الإنعاش والتطهير السيادي السحابي) */}
          <SovereignRejuvenationModal
            isOpen={isSovereignRejuvenationOpen}
            onClose={() => setIsSovereignRejuvenationOpen(false)}
          />

          {/* Cookie Consent Banner */}
          <CookieConsentBanner
            onOpenPolicy={() => {
              setLegalInitialDoc("COOKIES");
              setActiveTab("LEGAL_DOCUMENTS");
            }}
          />
          
          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden">
            <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
          </div>
        </>
      )}
    </div>
  );
}
