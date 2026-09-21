import {
  Account,
  Branch,
  CurrencyCode,
  CurrencyInfo,
  Customer,
  FixedAsset,
  Invoice,
  JournalEntry,
  JournalLine,
  Vendor,
  Voucher,
  BankAccountItem,
  CashVaultItem,
  CostCenter,
  ERPUser,
  SystemSettings,
  InventoryItem,
  StockMovement,
  UnavailableItemRequest,
  ERPRole,
  HREmployee,
  HRAdministrativeDecision,
  HRAttendanceRecord,
  HRWorkingShift,
  HRMonthlyPayroll,
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
  SaaSClient,
} from "../types/erp";
import {
  INITIAL_ACCOUNTS,
  INITIAL_BRANCHES,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_CASH_VAULTS,
  INITIAL_COST_CENTERS,
  INITIAL_CURRENCIES,
  INITIAL_CUSTOMERS,
  INITIAL_FIXED_ASSETS,
  INITIAL_INVOICES,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_USERS,
  INITIAL_VENDORS,
  INITIAL_VOUCHERS,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_UNAVAILABLE_REQUESTS,
  INITIAL_ROLES,
  INITIAL_HR_EMPLOYEES,
  INITIAL_HR_DECISIONS,
  INITIAL_HR_SHIFTS,
  INITIAL_HR_ATTENDANCE,
  INITIAL_HR_PAYROLLS,
  INITIAL_CORRESPONDENCES,
  INITIAL_APPROVAL_REQUESTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SYSTEM_ALERTS,
  INITIAL_CHAT_CHANNELS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_ADMINISTRATIVE_CIRCULARS,
  INITIAL_WORKFLOW_RULES,
  INITIAL_EXCHANGE_ACCOUNTS,
  INITIAL_EXCHANGE_TRANSACTIONS,
  INITIAL_SAAS_CLIENTS,
} from "../data/initialERPData";

import { TenantIsolationService, KNOWN_TENANTS } from "./tenantIsolationService";
import { getMockTrialState } from "../data/mockTrialData";
import { getStored200Tenants, findTenantById } from "../data/preGeneratedTenants";

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  companyNameAr: "الشركة الزرقاء النبيلة (ش.م.ي)",
  companyNameEn: "Al-Zarqa Al-Nabeela Company",
  taxNumber: "300748291000003",
  commercialRegister: "CR-AZ-99201",
  phone: "+967 773 586 047",
  address: "المنطقة الحرة - عدن، اليمن",
  email: "finance@alzarqa.medo-erp.cloud",
  baseCurrency: "YER_SANAA",
  defaultBranchId: "BR-SANAA-MAIN",
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
  licenseDuration: "مدى الحياة (ترخيص دائم غير محدود)",
  licenseStatus: "ACTIVE_LIFETIME",
  licenseExpiryDate: "2099-12-31",
  scheduledBackup: {
    enabled: true,
    frequency: "EVERY_12_HOURS",
    scheduledTime: "02:00",
    autoEncrypt: true,
    encryptionKey: "MeDo-SAP-EncKey-9F2kL8xA3p",
    uploadToCloud: true,
    cloudStoragePath: "cloud_backups",
    keepMaxBackups: 10,
    lastBackupAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    nextScheduledAt: new Date(Date.now() + 3600000 * 8).toISOString(),
    lastBackupStatus: "SUCCESS",
    lastBackupMessage: "تم الرفع التلقائي المشفر بنجاح إلى سحابة Firestore",
  },
};

export function getTenantDefaultSettings(tenantSlug: string): SystemSettings {
  const cleanSlug = (tenantSlug || "").toLowerCase().trim();

  // 0. Explicit priority for required commercial launch tenants
  if (cleanSlug === "company-1" || cleanSlug === "client-1" || cleanSlug === "alamal" || cleanSlug === "al-amal" || cleanSlug === "amal") {
    return {
      ...DEFAULT_SYSTEM_SETTINGS,
      companyNameAr: "شركة الأمل",
      companyNameEn: "Al-Amal Trading & Contracting",
      commercialRegister: "1010500037",
      taxNumber: "300748291000003",
      phone: "+967 777 111 023",
      address: "صنعاء - شارع الستين",
      email: "manager@company-1.medo-erp.cloud",
    };
  }
  if (cleanSlug === "company-2" || cleanSlug === "client-2" || cleanSlug === "alnoor" || cleanSlug === "al-noor") {
    return {
      ...DEFAULT_SYSTEM_SETTINGS,
      companyNameAr: "مؤسسة النور",
      companyNameEn: "Al-Noor Electronics & Supplies",
      commercialRegister: "1010500074",
      taxNumber: "300748291000003",
      phone: "+967 777 111 046",
      address: "عدن - المعلا",
      email: "manager@company-2.medo-erp.cloud",
    };
  }
  if (cleanSlug === "alzarqa" || cleanSlug === "zarqa" || cleanSlug === "az") {
    return {
      ...DEFAULT_SYSTEM_SETTINGS,
      companyNameAr: "الزرقاء النبيلة",
      companyNameEn: "Al-Zarqa Al-Nabeela Company",
      commercialRegister: "CR-AZ-99201",
      taxNumber: "300748291000003",
      phone: "+967 773 586 047",
      address: "المنطقة الحرة - عدن، اليمن",
      email: "finance@alzarqa.medo-erp.cloud",
    };
  }
  if (cleanSlug === "bin-ziad" || cleanSlug === "binziyad" || cleanSlug === "binziad" || cleanSlug === "bz") {
    return {
      ...DEFAULT_SYSTEM_SETTINGS,
      companyNameAr: "بن زياد",
      companyNameEn: "Bin Ziad United Commercial Group",
      commercialRegister: "3892710",
      taxNumber: "30074829100003",
      phone: "+967 773586047 | 715779976",
      address: "الكندوي، حمر، عمران - اليمن",
      email: "manager@binziyad.medo-erp.cloud",
    };
  }

  if (tenantSlug === "albadr-pharma-2026" || tenantSlug === "client-albadr") {
    return TenantIsolationService.getAlBadrIsolatedState().systemSettings || DEFAULT_SYSTEM_SETTINGS;
  }

  // 1. Direct tenant lookup using findTenantById (covers all 200 tenants and registered tenants)
  const matched = findTenantById(cleanSlug);
  if (matched) {
    return {
      ...DEFAULT_SYSTEM_SETTINGS,
      companyNameAr: matched.name || matched.companyNameAr,
      companyNameEn: matched.nameEn || matched.companyNameEn,
      commercialRegister: matched.crNumber || matched.commercialReg,
      taxNumber: matched.taxNumber,
      phone: matched.phone || matched.assignedAdminPhone,
      address: matched.address || `المركز الرئيسي - ${matched.city}`,
      email: matched.assignedAdminEmail || `${matched.slug}@medo-erp.cloud`,
    };
  }

  // 2. Check known trial clients (client-1, client-2, client-3, etc.)
  const known = KNOWN_TENANTS[cleanSlug];
  if (known) {
    return {
      ...DEFAULT_SYSTEM_SETTINGS,
      companyNameAr: known.nameAr,
      companyNameEn: known.nameEn,
      email: known.adminEmail,
    };
  }

  return DEFAULT_SYSTEM_SETTINGS;
}

export const STORAGE_KEYS = {
  BRANCHES: "medo_erp_branches_v1",
  ACTIVE_BRANCH_ID: "medo_erp_active_branch_id_v1",
  ACCOUNTS: "medo_erp_accounts_v1",
  JOURNAL_ENTRIES: "medo_erp_journal_entries_v1",
  VOUCHERS: "medo_erp_vouchers_v1",
  CUSTOMERS: "medo_erp_customers_v1",
  VENDORS: "medo_erp_vendors_v1",
  INVOICES: "medo_erp_invoices_v1",
  FIXED_ASSETS: "medo_erp_fixed_assets_v1",
  BANK_ACCOUNTS: "medo_erp_banks_v1",
  CASH_VAULTS: "medo_erp_vaults_v1",
  COST_CENTERS: "medo_erp_cost_centers_v1",
  CURRENCIES: "medo_erp_currencies_v1",
  CURRENT_USER: "medo_erp_current_user_v1",
  SELECTED_CURRENCY: "medo_erp_selected_currency_v1",
  SYSTEM_SETTINGS: "medo_erp_system_settings_v1",
  INVENTORY_ITEMS: "medo_erp_inventory_items_v1",
  STOCK_MOVEMENTS: "medo_erp_stock_movements_v1",
  UNAVAILABLE_REQUESTS: "medo_erp_unavailable_requests_v1",
  ROLES: "medo_erp_roles_v1",
  USERS_LIST: "medo_erp_users_list_v1",
  HR_EMPLOYEES: "medo_erp_hr_employees_v1",
  HR_DECISIONS: "medo_erp_hr_decisions_v1",
  HR_ATTENDANCE: "medo_erp_hr_attendance_v1",
  HR_SHIFTS: "medo_erp_hr_shifts_v1",
  HR_PAYROLLS: "medo_erp_hr_payrolls_v1",
  CORRESPONDENCES: "medo_erp_correspondences_v1",
  APPROVAL_REQUESTS: "medo_erp_approval_requests_v1",
  AUDIT_LOGS: "medo_erp_audit_logs_v1",
  SYSTEM_ALERTS: "medo_erp_system_alerts_v1",
  CHAT_CHANNELS: "medo_erp_chat_channels_v1",
  CHAT_MESSAGES: "medo_erp_chat_messages_v1",
  CIRCULARS: "medo_erp_circulars_v1",
  WORKFLOW_RULES: "medo_erp_workflow_rules_v1",
  EXCHANGE_ACCOUNTS: "medo_erp_exchange_accounts_v1",
  EXCHANGE_TRANSACTIONS: "medo_erp_exchange_transactions_v1",
  SAAS_CLIENTS: "medo_erp_saas_clients_v1",
};

/**
 * Returns dynamic tenant-isolated storage keys
 */
export function getStorageKey(baseKey: keyof typeof STORAGE_KEYS, overrideTenant?: string): string {
  const tenant = overrideTenant || TenantIsolationService.resolveActiveTenant();
  if (tenant && tenant !== "default") {
    const cleanTenant = tenant.replace(/[^a-zA-Z0-9_-]/g, "_");
    return `medo_tenant_${cleanTenant}_${STORAGE_KEYS[baseKey]}`;
  }
  return STORAGE_KEYS[baseKey];
}

export interface ERPFullState {
  branches?: Branch[];
  activeBranchId?: string;
  accounts: Account[];
  journalEntries: JournalEntry[];
  vouchers: Voucher[];
  customers: Customer[];
  vendors: Vendor[];
  invoices: Invoice[];
  bills?: Invoice[];
  fixedAssets: FixedAsset[];
  bankAccounts: BankAccountItem[];
  cashVaults: CashVaultItem[];
  costCenters: CostCenter[];
  currencies: CurrencyInfo[];
  currentUser: ERPUser;
  selectedDisplayCurrency?: CurrencyCode;
  systemSettings?: SystemSettings;
  inventoryItems?: InventoryItem[];
  stockMovements?: StockMovement[];
  unavailableRequests?: UnavailableItemRequest[];
  roles?: ERPRole[];
  usersList?: ERPUser[];
  hrEmployees?: HREmployee[];
  hrDecisions?: HRAdministrativeDecision[];
  hrAttendanceRecords?: HRAttendanceRecord[];
  hrShifts?: HRWorkingShift[];
  hrPayrolls?: HRMonthlyPayroll[];
  correspondences?: CorrespondenceDocument[];
  approvalRequests?: ApprovalRequest[];
  workflowRules?: WorkflowRouteRule[];
  auditLogs?: AuditLogEntry[];
  systemAlerts?: SystemAlert[];
  chatChannels?: ChatChannel[];
  chatMessages?: ChatMessage[];
  administrativeCirculars?: AdministrativeCircular[];
  exchangeAccounts?: ExchangeAccount[];
  exchangeTransactions?: ExchangeTransaction[];
  saasClients?: SaaSClient[];
}

export function loadERPState(overrideTenant?: string): ERPFullState {
  const activeTenant = overrideTenant || TenantIsolationService.resolveActiveTenant();

  // If active tenant is Al-Badr Pharmaceuticals, ensure isolated initial dataset is loaded if not yet set
  if (activeTenant === "albadr-pharma-2026" || activeTenant === "client-albadr") {
    const rawCustKey = getStorageKey("CUSTOMERS", activeTenant);
    const hasInitializedAlBadr = localStorage.getItem(rawCustKey) !== null;
    if (!hasInitializedAlBadr) {
      const isolatedState = TenantIsolationService.getAlBadrIsolatedState();
      saveERPState(isolatedState, activeTenant);
      return isolatedState;
    }
  }

  // If active tenant is one of the 3 trial clients, ensure isolated mock trial dataset is loaded if not yet set
  if (TenantIsolationService.isTrialClientTenant(activeTenant)) {
    const rawCustKey = getStorageKey("CUSTOMERS", activeTenant);
    const hasInitializedTrial = localStorage.getItem(rawCustKey) !== null;
    if (!hasInitializedTrial) {
      const isolatedTrialState = getMockTrialState(activeTenant);
      saveERPState(isolatedTrialState, activeTenant);
      return isolatedTrialState;
    }
  }

  try {
    const isDefaultWorkspace = !activeTenant || activeTenant === "default";

    const rawBranches = localStorage.getItem(getStorageKey("BRANCHES", activeTenant));
    let branches: Branch[];
    if (rawBranches) {
      branches = JSON.parse(rawBranches);
    } else if (activeTenant === "albadr-pharma-2026") {
      branches = TenantIsolationService.getAlBadrIsolatedState().branches || INITIAL_BRANCHES;
    } else if (isDefaultWorkspace) {
      branches = INITIAL_BRANCHES;
    } else {
      const tDetails = TenantIsolationService.getActiveTenantDetails(activeTenant);
      branches = [
        {
          id: `BR-${activeTenant.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10)}-01`,
          code: "BR-01",
          nameAr: `المركز الرئيسي - ${tDetails.city || "صنعاء"}`,
          nameEn: `Headquarters - ${tDetails.city || "Sana'a"}`,
          city: tDetails.city || "صنعاء",
          address: tDetails.address || "المركز الرئيسي",
          phone: tDetails.phone || "+967 773 586 047",
          email: `${activeTenant}@medo-erp.cloud`,
          managerName: tDetails.nameAr,
          currency: "YER_SANAA",
          isMainBranch: true,
          status: "ACTIVE",
          costCenterId: "CC-01",
          warehouseLocation: "المستودع الرئيسي",
          createdAt: new Date().toISOString().split("T")[0],
        },
      ];
    }
    const activeBranchId = localStorage.getItem(getStorageKey("ACTIVE_BRANCH_ID", activeTenant)) || branches?.[0]?.id || "ALL";

    const rawAccounts = localStorage.getItem(getStorageKey("ACCOUNTS", activeTenant));
    const accounts: Account[] = rawAccounts
      ? JSON.parse(rawAccounts)
      : (activeTenant === "albadr-pharma-2026" ? TenantIsolationService.getAlBadrIsolatedState().accounts : INITIAL_ACCOUNTS);

    const rawJournals = localStorage.getItem(getStorageKey("JOURNAL_ENTRIES", activeTenant));
    const journalEntries: JournalEntry[] = rawJournals 
      ? JSON.parse(rawJournals) 
      : (isDefaultWorkspace ? INITIAL_JOURNAL_ENTRIES : []);

    const rawVouchers = localStorage.getItem(getStorageKey("VOUCHERS", activeTenant));
    const vouchers: Voucher[] = rawVouchers 
      ? JSON.parse(rawVouchers) 
      : (isDefaultWorkspace ? INITIAL_VOUCHERS : []);

    const rawCustomers = localStorage.getItem(getStorageKey("CUSTOMERS", activeTenant));
    const customers: Customer[] = rawCustomers
      ? JSON.parse(rawCustomers)
      : (activeTenant === "albadr-pharma-2026" 
          ? TenantIsolationService.getAlBadrIsolatedState().customers 
          : (isDefaultWorkspace ? INITIAL_CUSTOMERS : []));

    const rawVendors = localStorage.getItem(getStorageKey("VENDORS", activeTenant));
    const vendors: Vendor[] = rawVendors
      ? JSON.parse(rawVendors)
      : (activeTenant === "albadr-pharma-2026" 
          ? TenantIsolationService.getAlBadrIsolatedState().vendors 
          : (isDefaultWorkspace ? INITIAL_VENDORS : []));

    const rawInvoices = localStorage.getItem(getStorageKey("INVOICES", activeTenant));
    let invoices: Invoice[] = rawInvoices
      ? JSON.parse(rawInvoices)
      : (isDefaultWorkspace ? INITIAL_INVOICES : []);
    
    // Ensure initial purchase bills exist if missing in current state for default dev workspace
    if (activeTenant === "default" && localStorage.getItem("medo_load_sample_data_flag") !== "false") {
      const hasPurchaseInvoices = invoices.some((i) => i.type === "PURCHASE" || i.type === "PURCHASE_RETURN");
      if (!hasPurchaseInvoices) {
        const initialPurchases = INITIAL_INVOICES.filter((i) => i.type === "PURCHASE" || i.type === "PURCHASE_RETURN");
        invoices = [...invoices, ...initialPurchases];
      }
    }
    const bills = invoices.filter((i) => i.type === "PURCHASE" || i.type === "PURCHASE_RETURN");

    const rawAssets = localStorage.getItem(getStorageKey("FIXED_ASSETS", activeTenant));
    const fixedAssets: FixedAsset[] = rawAssets
      ? JSON.parse(rawAssets)
      : (isDefaultWorkspace ? INITIAL_FIXED_ASSETS : []);

    const rawBanks = localStorage.getItem(getStorageKey("BANK_ACCOUNTS", activeTenant));
    const bankAccounts: BankAccountItem[] = rawBanks
      ? JSON.parse(rawBanks)
      : (activeTenant === "albadr-pharma-2026" 
          ? TenantIsolationService.getAlBadrIsolatedState().bankAccounts 
          : (isDefaultWorkspace ? INITIAL_BANK_ACCOUNTS : [
              {
                id: `BANK-${activeTenant.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}-01`,
                accountNameAr: "الحساب البنكي التجاري الرئيسي",
                accountNameEn: "Main Commercial Bank Account",
                bankName: "البنك التجاري اليمني",
                accountNumber: "2026-001-9988",
                iban: "YE99BOY00020260019988",
                currency: "YER_SANAA",
                glAccountId: "ACC-102",
                currentBalance: 0,
                status: "ACTIVE",
                branchId: branches[0]?.id || "BR-01",
              }
            ]));

    const rawVaults = localStorage.getItem(getStorageKey("CASH_VAULTS", activeTenant));
    const cashVaults: CashVaultItem[] = rawVaults
      ? JSON.parse(rawVaults)
      : (activeTenant === "albadr-pharma-2026" 
          ? TenantIsolationService.getAlBadrIsolatedState().cashVaults 
          : (isDefaultWorkspace ? INITIAL_CASH_VAULTS : [
              {
                id: `VAULT-${activeTenant.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}-01`,
                nameAr: "خزينة النقدية الرئيسية",
                nameEn: "Main Cash Vault",
                vaultType: "MAIN",
                currency: "YER_SANAA",
                glAccountId: "ACC-101",
                currentBalance: 0,
                status: "ACTIVE",
                responsibleEmployeeId: "EMP-01",
                branchId: branches[0]?.id || "BR-01",
                createdAt: new Date().toISOString().split("T")[0],
              }
            ]));

    const rawCostCenters = localStorage.getItem(getStorageKey("COST_CENTERS", activeTenant));
    const costCenters: CostCenter[] = rawCostCenters
      ? JSON.parse(rawCostCenters)
      : (activeTenant === "albadr-pharma-2026" 
          ? TenantIsolationService.getAlBadrIsolatedState().costCenters 
          : (isDefaultWorkspace ? INITIAL_COST_CENTERS : [
              {
                id: "CC-01",
                code: "CC-100",
                nameAr: "مركز التكلفة العام - الإدارة والمبيعات",
                nameEn: "General Administration & Sales Cost Center",
                branchId: branches[0]?.id || "BR-01",
                managerName: "الإدارة المالية",
                allocatedBudget: 50000000,
                spentAmount: 0,
                currency: "YER_SANAA",
                status: "ACTIVE",
              }
            ]));

    const rawCurrencies = localStorage.getItem(getStorageKey("CURRENCIES", activeTenant));
    const currencies: CurrencyInfo[] = rawCurrencies ? JSON.parse(rawCurrencies) : INITIAL_CURRENCIES;

    const rawUser = localStorage.getItem(getStorageKey("CURRENT_USER", activeTenant));
    const currentUser: ERPUser = rawUser
      ? JSON.parse(rawUser)
      : (activeTenant === "albadr-pharma-2026" ? TenantIsolationService.getAlBadrIsolatedState().currentUser : INITIAL_USERS[0]);

    const rawSelectedCurrency = localStorage.getItem(getStorageKey("SELECTED_CURRENCY", activeTenant)) as CurrencyCode;
    const selectedDisplayCurrency: CurrencyCode = rawSelectedCurrency || "YER_SANAA";

    const rawSettings = localStorage.getItem(getStorageKey("SYSTEM_SETTINGS", activeTenant));
    const fallbackSettings = getTenantDefaultSettings(activeTenant);
    const parsedSettings = rawSettings ? JSON.parse(rawSettings) : {};

    const systemSettings: SystemSettings = {
      ...fallbackSettings,
      ...parsedSettings,
      // For any isolated tenant (VIP or 200 nodes), ensure official company metadata is strictly prioritized
      companyNameAr: (activeTenant && activeTenant !== "default" && fallbackSettings.companyNameAr) 
        ? fallbackSettings.companyNameAr 
        : (parsedSettings.companyNameAr || fallbackSettings.companyNameAr),
      companyNameEn: (activeTenant && activeTenant !== "default" && fallbackSettings.companyNameEn) 
        ? fallbackSettings.companyNameEn 
        : (parsedSettings.companyNameEn || fallbackSettings.companyNameEn),
      commercialRegister: (activeTenant && activeTenant !== "default" && fallbackSettings.commercialRegister) 
        ? fallbackSettings.commercialRegister 
        : (parsedSettings.commercialRegister || fallbackSettings.commercialRegister),
      taxNumber: (activeTenant && activeTenant !== "default" && fallbackSettings.taxNumber) 
        ? fallbackSettings.taxNumber 
        : (parsedSettings.taxNumber || fallbackSettings.taxNumber),
      phone: (activeTenant && activeTenant !== "default" && fallbackSettings.phone) 
        ? fallbackSettings.phone 
        : (parsedSettings.phone || fallbackSettings.phone),
      email: (activeTenant && activeTenant !== "default" && fallbackSettings.email) 
        ? fallbackSettings.email 
        : (parsedSettings.email || fallbackSettings.email),
      address: (activeTenant && activeTenant !== "default" && fallbackSettings.address) 
        ? fallbackSettings.address 
        : (parsedSettings.address || fallbackSettings.address),
      scheduledBackup: {
        ...fallbackSettings?.scheduledBackup,
        ...(parsedSettings.scheduledBackup || {}),
        enabled: parsedSettings.scheduledBackup?.enabled !== false, // Always active
      },
    };

    const rawInventory = localStorage.getItem(getStorageKey("INVENTORY_ITEMS", activeTenant));
    let inventoryItems: InventoryItem[] = rawInventory
      ? JSON.parse(rawInventory)
      : (activeTenant === "albadr-pharma-2026" 
          ? (TenantIsolationService.getAlBadrIsolatedState().inventoryItems || []) 
          : (isDefaultWorkspace ? INITIAL_INVENTORY_ITEMS : []));
    
    // Auto-inject Tobacco & Moassel if missing ONLY for default development workspace
    if (activeTenant === "default" && localStorage.getItem("medo_load_sample_data_flag") !== "false") {
      const hasTobacco = inventoryItems.some(
        (item) => item.category === "التبغ والمعسل" || item.code.startsWith("INV-TOB-")
      );
      if (!hasTobacco) {
        const tobaccoItems = INITIAL_INVENTORY_ITEMS.filter(
          (item) => item.category === "التبغ والمعسل" || item.code.startsWith("INV-TOB-")
        );
        if (tobaccoItems.length > 0) {
          inventoryItems = [...inventoryItems, ...tobaccoItems];
          localStorage.setItem(getStorageKey("INVENTORY_ITEMS", activeTenant), JSON.stringify(inventoryItems));
        }
      }
    }

    const rawMovements = localStorage.getItem(getStorageKey("STOCK_MOVEMENTS", activeTenant));
    const stockMovements: StockMovement[] = rawMovements 
      ? JSON.parse(rawMovements) 
      : (isDefaultWorkspace ? INITIAL_STOCK_MOVEMENTS : []);

    const rawRequests = localStorage.getItem(getStorageKey("UNAVAILABLE_REQUESTS", activeTenant));
    const unavailableRequests: UnavailableItemRequest[] = rawRequests 
      ? JSON.parse(rawRequests) 
      : (isDefaultWorkspace ? INITIAL_UNAVAILABLE_REQUESTS : []);

    const rawRoles = localStorage.getItem(getStorageKey("ROLES", activeTenant));
    const roles: ERPRole[] = rawRoles ? JSON.parse(rawRoles) : INITIAL_ROLES;

    const rawUsersList = localStorage.getItem(getStorageKey("USERS_LIST", activeTenant));
    const usersList: ERPUser[] = rawUsersList 
      ? JSON.parse(rawUsersList) 
      : (activeTenant === "albadr-pharma-2026" 
          ? [currentUser] 
          : (isDefaultWorkspace ? INITIAL_USERS : [currentUser]));

    const rawEmployees = localStorage.getItem(getStorageKey("HR_EMPLOYEES", activeTenant));
    const hrEmployees: HREmployee[] = rawEmployees 
      ? JSON.parse(rawEmployees) 
      : (isDefaultWorkspace ? INITIAL_HR_EMPLOYEES : []);

    const rawDecisions = localStorage.getItem(getStorageKey("HR_DECISIONS", activeTenant));
    const hrDecisions: HRAdministrativeDecision[] = rawDecisions 
      ? JSON.parse(rawDecisions) 
      : (isDefaultWorkspace ? INITIAL_HR_DECISIONS : []);

    const rawAttendance = localStorage.getItem(getStorageKey("HR_ATTENDANCE", activeTenant));
    const hrAttendanceRecords: HRAttendanceRecord[] = rawAttendance 
      ? JSON.parse(rawAttendance) 
      : (isDefaultWorkspace ? INITIAL_HR_ATTENDANCE : []);

    const rawShifts = localStorage.getItem(getStorageKey("HR_SHIFTS", activeTenant));
    const hrShifts: HRWorkingShift[] = rawShifts 
      ? JSON.parse(rawShifts) 
      : (isDefaultWorkspace ? INITIAL_HR_SHIFTS : []);

    const rawPayrolls = localStorage.getItem(getStorageKey("HR_PAYROLLS", activeTenant));
    const hrPayrolls: HRMonthlyPayroll[] = rawPayrolls 
      ? JSON.parse(rawPayrolls) 
      : (isDefaultWorkspace ? INITIAL_HR_PAYROLLS : []);

    const rawCorr = localStorage.getItem(getStorageKey("CORRESPONDENCES", activeTenant));
    const correspondences: CorrespondenceDocument[] = rawCorr 
      ? JSON.parse(rawCorr) 
      : (isDefaultWorkspace ? INITIAL_CORRESPONDENCES : []);

    const rawApr = localStorage.getItem(getStorageKey("APPROVAL_REQUESTS", activeTenant));
    const approvalRequests: ApprovalRequest[] = rawApr 
      ? JSON.parse(rawApr) 
      : (isDefaultWorkspace ? INITIAL_APPROVAL_REQUESTS : []);

    const rawAudit = localStorage.getItem(getStorageKey("AUDIT_LOGS", activeTenant));
    const auditLogs: AuditLogEntry[] = rawAudit 
      ? JSON.parse(rawAudit) 
      : (isDefaultWorkspace ? INITIAL_AUDIT_LOGS : []);

    const rawAlerts = localStorage.getItem(getStorageKey("SYSTEM_ALERTS", activeTenant));
    const systemAlerts: SystemAlert[] = rawAlerts 
      ? JSON.parse(rawAlerts) 
      : (isDefaultWorkspace ? INITIAL_SYSTEM_ALERTS : []);

    const rawChannels = localStorage.getItem(getStorageKey("CHAT_CHANNELS", activeTenant));
    const chatChannels: ChatChannel[] = rawChannels 
      ? JSON.parse(rawChannels) 
      : (isDefaultWorkspace ? INITIAL_CHAT_CHANNELS : []);

    const rawMessages = localStorage.getItem(getStorageKey("CHAT_MESSAGES", activeTenant));
    const chatMessages: ChatMessage[] = rawMessages 
      ? JSON.parse(rawMessages) 
      : (isDefaultWorkspace ? INITIAL_CHAT_MESSAGES : []);

    const rawCirc = localStorage.getItem(getStorageKey("CIRCULARS", activeTenant));
    const administrativeCirculars: AdministrativeCircular[] = rawCirc 
      ? JSON.parse(rawCirc) 
      : (isDefaultWorkspace ? INITIAL_ADMINISTRATIVE_CIRCULARS : []);

    const rawWfRules = localStorage.getItem(getStorageKey("WORKFLOW_RULES", activeTenant));
    const workflowRules: WorkflowRouteRule[] = rawWfRules ? JSON.parse(rawWfRules) : (activeTenant === "albadr-pharma-2026" ? [] : INITIAL_WORKFLOW_RULES);

    const rawExchangeAccs = localStorage.getItem(getStorageKey("EXCHANGE_ACCOUNTS", activeTenant));
    const exchangeAccounts: ExchangeAccount[] = rawExchangeAccs ? JSON.parse(rawExchangeAccs) : (activeTenant === "albadr-pharma-2026" ? [] : INITIAL_EXCHANGE_ACCOUNTS);

    const rawExchangeTxs = localStorage.getItem(getStorageKey("EXCHANGE_TRANSACTIONS", activeTenant));
    const exchangeTransactions: ExchangeTransaction[] = rawExchangeTxs ? JSON.parse(rawExchangeTxs) : (activeTenant === "albadr-pharma-2026" ? [] : INITIAL_EXCHANGE_TRANSACTIONS);

    const rawSaasClients = localStorage.getItem(getStorageKey("SAAS_CLIENTS", activeTenant));
    const saasClients: SaaSClient[] = rawSaasClients ? JSON.parse(rawSaasClients) : (activeTenant === "albadr-pharma-2026" ? [] : INITIAL_SAAS_CLIENTS);

    return {
      branches,
      activeBranchId,
      accounts,
      journalEntries,
      vouchers,
      customers,
      vendors,
      invoices,
      bills,
      fixedAssets,
      bankAccounts,
      cashVaults,
      costCenters,
      currencies,
      currentUser,
      selectedDisplayCurrency,
      systemSettings,
      inventoryItems,
      stockMovements,
      unavailableRequests,
      roles,
      usersList,
      hrEmployees,
      hrDecisions,
      hrAttendanceRecords,
      hrShifts,
      hrPayrolls,
      correspondences,
      approvalRequests,
      workflowRules,
      auditLogs,
      systemAlerts,
      chatChannels,
      chatMessages,
      administrativeCirculars,
      exchangeAccounts,
      exchangeTransactions,
      saasClients,
    };
  } catch (error) {
    console.error("Failed to load ERP state from localStorage:", error);
    const fallback = activeTenant === "albadr-pharma-2026" ? TenantIsolationService.getAlBadrIsolatedState() : {
      branches: INITIAL_BRANCHES,
      activeBranchId: "ALL",
      accounts: INITIAL_ACCOUNTS,
      journalEntries: INITIAL_JOURNAL_ENTRIES,
      vouchers: INITIAL_VOUCHERS,
      customers: INITIAL_CUSTOMERS,
      vendors: INITIAL_VENDORS,
      invoices: INITIAL_INVOICES,
      fixedAssets: INITIAL_FIXED_ASSETS,
      bankAccounts: INITIAL_BANK_ACCOUNTS,
      cashVaults: INITIAL_CASH_VAULTS,
      costCenters: INITIAL_COST_CENTERS,
      currencies: INITIAL_CURRENCIES,
      currentUser: INITIAL_USERS[0],
      selectedDisplayCurrency: "YER_SANAA" as CurrencyCode,
      systemSettings: DEFAULT_SYSTEM_SETTINGS,
      inventoryItems: INITIAL_INVENTORY_ITEMS,
      stockMovements: INITIAL_STOCK_MOVEMENTS,
      unavailableRequests: INITIAL_UNAVAILABLE_REQUESTS,
      roles: INITIAL_ROLES,
      usersList: INITIAL_USERS,
      hrEmployees: INITIAL_HR_EMPLOYEES,
      hrDecisions: INITIAL_HR_DECISIONS,
      hrAttendanceRecords: INITIAL_HR_ATTENDANCE,
      hrShifts: INITIAL_HR_SHIFTS,
      hrPayrolls: INITIAL_HR_PAYROLLS,
      correspondences: INITIAL_CORRESPONDENCES,
      approvalRequests: INITIAL_APPROVAL_REQUESTS,
      workflowRules: INITIAL_WORKFLOW_RULES,
      auditLogs: INITIAL_AUDIT_LOGS,
      systemAlerts: INITIAL_SYSTEM_ALERTS,
      chatChannels: INITIAL_CHAT_CHANNELS,
      chatMessages: INITIAL_CHAT_MESSAGES,
      administrativeCirculars: INITIAL_ADMINISTRATIVE_CIRCULARS,
      exchangeAccounts: INITIAL_EXCHANGE_ACCOUNTS,
      exchangeTransactions: INITIAL_EXCHANGE_TRANSACTIONS,
      saasClients: INITIAL_SAAS_CLIENTS,
    };
    return fallback;
  }
}

export function saveERPState(state: Partial<ERPFullState>, overrideTenant?: string): void {
  const activeTenant = overrideTenant || TenantIsolationService.resolveActiveTenant();
  try {
    if (state.branches) localStorage.setItem(getStorageKey("BRANCHES", activeTenant), JSON.stringify(state.branches));
    if (state.activeBranchId) localStorage.setItem(getStorageKey("ACTIVE_BRANCH_ID", activeTenant), state.activeBranchId);
    if (state.accounts) localStorage.setItem(getStorageKey("ACCOUNTS", activeTenant), JSON.stringify(state.accounts));
    if (state.journalEntries) localStorage.setItem(getStorageKey("JOURNAL_ENTRIES", activeTenant), JSON.stringify(state.journalEntries));
    if (state.vouchers) localStorage.setItem(getStorageKey("VOUCHERS", activeTenant), JSON.stringify(state.vouchers));
    if (state.customers) localStorage.setItem(getStorageKey("CUSTOMERS", activeTenant), JSON.stringify(state.customers));
    if (state.vendors) localStorage.setItem(getStorageKey("VENDORS", activeTenant), JSON.stringify(state.vendors));
    if (state.invoices) localStorage.setItem(getStorageKey("INVOICES", activeTenant), JSON.stringify(state.invoices));
    if (state.fixedAssets) localStorage.setItem(getStorageKey("FIXED_ASSETS", activeTenant), JSON.stringify(state.fixedAssets));
    if (state.bankAccounts) localStorage.setItem(getStorageKey("BANK_ACCOUNTS", activeTenant), JSON.stringify(state.bankAccounts));
    if (state.cashVaults) localStorage.setItem(getStorageKey("CASH_VAULTS", activeTenant), JSON.stringify(state.cashVaults));
    if (state.costCenters) localStorage.setItem(getStorageKey("COST_CENTERS", activeTenant), JSON.stringify(state.costCenters));
    if (state.currencies) localStorage.setItem(getStorageKey("CURRENCIES", activeTenant), JSON.stringify(state.currencies));
    if (state.currentUser) localStorage.setItem(getStorageKey("CURRENT_USER", activeTenant), JSON.stringify(state.currentUser));
    if (state.selectedDisplayCurrency) localStorage.setItem(getStorageKey("SELECTED_CURRENCY", activeTenant), state.selectedDisplayCurrency);
    if (state.systemSettings) localStorage.setItem(getStorageKey("SYSTEM_SETTINGS", activeTenant), JSON.stringify(state.systemSettings));
    if (state.inventoryItems) localStorage.setItem(getStorageKey("INVENTORY_ITEMS", activeTenant), JSON.stringify(state.inventoryItems));
    if (state.stockMovements) localStorage.setItem(getStorageKey("STOCK_MOVEMENTS", activeTenant), JSON.stringify(state.stockMovements));
    if (state.unavailableRequests) localStorage.setItem(getStorageKey("UNAVAILABLE_REQUESTS", activeTenant), JSON.stringify(state.unavailableRequests));
    if (state.roles) localStorage.setItem(getStorageKey("ROLES", activeTenant), JSON.stringify(state.roles));
    if (state.usersList) localStorage.setItem(getStorageKey("USERS_LIST", activeTenant), JSON.stringify(state.usersList));
    if (state.hrEmployees) localStorage.setItem(getStorageKey("HR_EMPLOYEES", activeTenant), JSON.stringify(state.hrEmployees));
    if (state.hrDecisions) localStorage.setItem(getStorageKey("HR_DECISIONS", activeTenant), JSON.stringify(state.hrDecisions));
    if (state.hrAttendanceRecords) localStorage.setItem(getStorageKey("HR_ATTENDANCE", activeTenant), JSON.stringify(state.hrAttendanceRecords));
    if (state.hrShifts) localStorage.setItem(getStorageKey("HR_SHIFTS", activeTenant), JSON.stringify(state.hrShifts));
    if (state.hrPayrolls) localStorage.setItem(getStorageKey("HR_PAYROLLS", activeTenant), JSON.stringify(state.hrPayrolls));
    if (state.correspondences) localStorage.setItem(getStorageKey("CORRESPONDENCES", activeTenant), JSON.stringify(state.correspondences));
    if (state.approvalRequests) localStorage.setItem(getStorageKey("APPROVAL_REQUESTS", activeTenant), JSON.stringify(state.approvalRequests));
    if (state.workflowRules) localStorage.setItem(getStorageKey("WORKFLOW_RULES", activeTenant), JSON.stringify(state.workflowRules));
    if (state.auditLogs) localStorage.setItem(getStorageKey("AUDIT_LOGS", activeTenant), JSON.stringify(state.auditLogs));
    if (state.systemAlerts) localStorage.setItem(getStorageKey("SYSTEM_ALERTS", activeTenant), JSON.stringify(state.systemAlerts));
    if (state.chatChannels) localStorage.setItem(getStorageKey("CHAT_CHANNELS", activeTenant), JSON.stringify(state.chatChannels));
    if (state.chatMessages) localStorage.setItem(getStorageKey("CHAT_MESSAGES", activeTenant), JSON.stringify(state.chatMessages));
    if (state.administrativeCirculars) localStorage.setItem(getStorageKey("CIRCULARS", activeTenant), JSON.stringify(state.administrativeCirculars));
    if (state.exchangeAccounts) localStorage.setItem(getStorageKey("EXCHANGE_ACCOUNTS", activeTenant), JSON.stringify(state.exchangeAccounts));
    if (state.exchangeTransactions) localStorage.setItem(getStorageKey("EXCHANGE_TRANSACTIONS", activeTenant), JSON.stringify(state.exchangeTransactions));
    if (state.saasClients) localStorage.setItem(getStorageKey("SAAS_CLIENTS", activeTenant), JSON.stringify(state.saasClients));
  } catch (error) {
    console.error("Error saving ERP state:", error);
  }
}

export function resetERPData(): ERPFullState {
  localStorage.clear();
  return loadERPState();
}

export function resetERPStateToDefault(): ERPFullState {
  return resetERPData();
}

export function initializeEmptyTenantState(): void {
  try {
    const defaultKeysToKeep = [
      STORAGE_KEYS.ACCOUNTS,
      STORAGE_KEYS.COST_CENTERS,
      STORAGE_KEYS.CURRENCIES,
      STORAGE_KEYS.SYSTEM_SETTINGS,
      STORAGE_KEYS.BRANCHES,
    ];

    // Keep structurally required defaults but wipe operational data
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
    localStorage.setItem(STORAGE_KEYS.COST_CENTERS, JSON.stringify(INITIAL_COST_CENTERS));
    localStorage.setItem(STORAGE_KEYS.CURRENCIES, JSON.stringify(INITIAL_CURRENCIES));
    localStorage.setItem(STORAGE_KEYS.SYSTEM_SETTINGS, JSON.stringify(DEFAULT_SYSTEM_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(INITIAL_BRANCHES));

    localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INVENTORY_ITEMS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.FIXED_ASSETS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CASH_VAULTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.WORKFLOW_RULES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CORRESPONDENCES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.APPROVAL_REQUESTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.HR_EMPLOYEES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EXCHANGE_ACCOUNTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EXCHANGE_TRANSACTIONS, JSON.stringify([]));

    // Special trigger for the onboarding modal
    localStorage.setItem("medo_is_new_user", "true");
    localStorage.setItem("medo_load_sample_data_flag", "false");
  } catch (error) {
    console.error("Error initializing empty tenant state:", error);
  }
}

export function exportERPDataAsJSON(state: ERPFullState): void {
  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", jsonStr);
  downloadAnchor.setAttribute("download", `medo_erp_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importERPDataFromJSON(file: File): Promise<ERPFullState | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.accounts && parsed.journalEntries) {
          saveERPState(parsed);
          resolve(parsed);
        } else {
          alert("الملف لا يحتوي على بيانات ERP صالحة");
          resolve(null);
        }
      } catch (err) {
        console.error("Invalid ERP JSON file", err);
        alert("فشل قراءة ملف النسخة الاحتياطية");
        resolve(null);
      }
    };
    reader.readAsText(file);
  });
}

/**
 * Currency Conversion Helper
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  currencies: CurrencyInfo[]
): number {
  if (from === to || amount === 0) return amount;

  const fromRate = currencies.find((c) => c.code === from)?.exchangeRateToUSD || 1;
  const toRate = currencies.find((c) => c.code === to)?.exchangeRateToUSD || 1;

  // Convert `from` to USD, then USD to `to`
  // Example: 530 YER_SANAA -> 1 USD -> 3.75 SAR
  const amountInUSD = amount / fromRate;
  const converted = amountInUSD * toRate;
  return Math.round(converted * 100) / 100;
}

/**
 * Format currency with symbols and nice commas
 */
export function formatMoney(amount: number, currency: CurrencyCode = "YER_SANAA", currencies: CurrencyInfo[] = INITIAL_CURRENCIES): string {
  const curr = currencies.find((c) => c.code === currency);
  const symbol = curr ? curr.symbol : currency;
  const formatted = new Intl.NumberFormat("ar-YE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ${symbol}`;
}

export function formatNumberOnly(amount: number): string {
  return new Intl.NumberFormat("ar-YE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Re-calculate GL Account Balances from all Posted Journal Entries
 */
export function recalculateAllAccountBalances(
  accounts: Account[],
  journalEntries: JournalEntry[],
  currencies?: CurrencyInfo[]
): Account[] {
  const accountMap = new Map<string, { debit: number; credit: number }>();

  // Initialize
  accounts.forEach((acc) => {
    accountMap.set(acc.id, { debit: 0, credit: 0 });
  });

  // Accumulate posted journal lines
  journalEntries
    .filter((entry) => entry.status === "POSTED" || entry.status === "APPROVED")
    .forEach((entry) => {
      entry.lines.forEach((line) => {
        const current = accountMap.get(line.accountId) || { debit: 0, credit: 0 };
        current.debit += Number(line.debit || 0);
        current.credit += Number(line.credit || 0);
        accountMap.set(line.accountId, current);
      });
    });

  // Calculate new balance based on Nature (Debit or Credit)
  return accounts.map((acc) => {
    if (acc.isHeader) {
      // Header balance is computed dynamically in tree view
      return acc;
    }
    const totals = accountMap.get(acc.id) || { debit: 0, credit: 0 };
    const netBalance = acc.nature === "DEBIT" ? totals.debit - totals.credit : totals.credit - totals.debit;

    return {
      ...acc,
      balanceDebit: totals.debit,
      balanceCredit: totals.credit,
      currentBalance: netBalance,
    };
  });
}
