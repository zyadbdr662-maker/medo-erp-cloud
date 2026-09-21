export type CurrencyCode = "YER_SANAA" | "YER_ADEN" | "SAR" | "USD" | "EUR";

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  symbol: string;
  exchangeRateToUSD: number; // e.g., USD=1, SAR=3.75, YER_SANAA=530, YER_ADEN=1920
  isLocal: boolean;
  isBase?: boolean;
  lastUpdated?: string;
}

export interface BranchPrintConfig {
  logoType?: "DEFAULT_CREST" | "CUSTOM_IMAGE" | "TEXT_BADGE";
  logoImage?: string;
  headerTitleAr?: string;
  headerTitleEn?: string;
  headerSubtitleAr?: string;
  headerSubtitleEn?: string;
  addressAr?: string;
  addressEn?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  commercialRegister?: string;
  footerTextAr?: string;
  footerTextEn?: string;
  showWatermark?: boolean;
  watermarkText?: string;
  showQrCode?: boolean;
  primaryColor?: string;
  paperSize?: "A4" | "THERMAL_80MM" | "LETTER";
}

export interface Branch {
  id: string; // e.g. "BR-SANAA-MAIN", "BR-ADEN-PORT"
  code: string; // e.g. "BR-01", "BR-02"
  nameAr: string; // e.g. "الفرع الرئيسي - صنعاء"
  nameEn: string; // e.g. "Main Branch - Sana'a"
  city: string; // e.g. "صنعاء", "عدن", "تعز"
  address?: string;
  phone?: string;
  email?: string;
  managerName?: string;
  currency: CurrencyCode; // العملة الافتراضية للفرع
  isMainBranch?: boolean;
  status: "ACTIVE" | "INACTIVE";
  costCenterId?: string;
  warehouseLocation?: string;
  createdAt?: string;
  printConfig?: BranchPrintConfig;
}

export type AccountCategory = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";

export type AccountNature = "DEBIT" | "CREDIT";

export interface Account {
  id: string; // e.g. "110101"
  code: string;
  nameAr: string;
  nameEn: string;
  name?: string; // Friendly alias for nameAr
  type?: string; // Alias for category
  category: AccountCategory;
  nature: AccountNature;
  level: number; // 1, 2, 3, 4, 5
  parentId?: string;
  isHeader: boolean; // if true, cannot post direct transactions
  currency: CurrencyCode | "MULTI";
  currentBalance: number;
  balanceDebit: number;
  balanceCredit: number;
  description?: string;
  costCenterRequired?: boolean;
  isActive?: boolean;
}

export type EntryStatus = "DRAFT" | "POSTED" | "APPROVED" | "CANCELLED";

export type EntryType = 
  | "STANDARD" // قيد يومية عام
  | "OPENING" // قيد افتتاحي
  | "RECEIPT" // سند قبض
  | "PAYMENT" // سند صرف
  | "INVOICE" // فاتورة مبيعات
  | "BILL" // فاتورة مشتريات
  | "ADJUSTMENT" // قيد تسوية / مردودات
  | "DEPRECIATION" // إهلاك أصول
  | "REVALUATION" // إعادة تقييم عملة
  | "CLOSING"; // قيد إقفال

export interface JournalLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountNameAr: string;
  accountName?: string; // Friendly alias for accountNameAr
  debit: number;
  credit: number;
  currency: CurrencyCode;
  exchangeRate: number;
  foreignDebit?: number;
  foreignCredit?: number;
  costCenterId?: string;
  costCenterName?: string;
  branchId?: string;
  memo?: string;
  description?: string; // Friendly alias for memo
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  period: string; // e.g. "2026-08"
  type: EntryType;
  reference?: string;
  description: string;
  status: EntryStatus;
  currency: CurrencyCode;
  branch?: string; // Friendly alias for branchId / branchName
  branchId?: string;
  branchName?: string;
  totalDebit: number;
  totalCredit: number;
  isBalanced?: boolean;
  lines: JournalLine[];
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  attachmentsCount?: number;
  tags?: string[];
}

export interface Voucher {
  id: string;
  voucherNumber: string;
  type: "RECEIPT" | "PAYMENT";
  date: string;
  beneficiaryOrPayer: string;
  partyName?: string; // Friendly alias for beneficiaryOrPayer
  amount: number;
  currency: CurrencyCode;
  exchangeRate: number;
  localAmount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "CHECK" | "ONLINE";
  sourceAccountId: string; // Vault or Bank account
  destinationAccountId: string; // Customer, Vendor, Expense, Revenue
  costCenterId?: string;
  branchId?: string;
  referenceNumber?: string;
  checkNumber?: string;
  checkDate?: string;
  bankName?: string;
  notes: string;
  description?: string; // Friendly alias for notes
  status: EntryStatus;
  journalEntryId?: string;
  createdByName: string;
}

export interface BankAccountItem {
  id: string;
  bankName: string;
  bankNameAr?: string;
  accountNumber: string;
  iban: string;
  branch: string;
  branchId?: string;
  currency: CurrencyCode;
  currentBalance: number;
  glAccountId: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface CashVaultItem {
  id: string;
  name: string;
  nameAr?: string;
  code?: string;
  custodian: string;
  location: string;
  branch?: string;
  branchId?: string;
  currency: CurrencyCode;
  currentBalance: number;
  glAccountId: string;
  limitMax: number;
}

export interface Customer {
  id: string;
  code: string;
  name?: string; // Friendly alias for nameAr
  nameAr: string;
  nameEn: string;
  phone: string;
  email?: string;
  taxNumber?: string;
  commercialRegister?: string;
  city: string;
  address?: string;
  branchId?: string;
  creditLimit?: number;
  currentBalance: number;
  currency: CurrencyCode;
  glAccountId: string;
  status?: "ACTIVE" | "BLOCKED";
  category?: string;
  createdAt?: string;
}

export interface Vendor {
  id: string;
  code: string;
  name?: string; // Friendly alias for nameAr
  nameAr: string;
  nameEn: string;
  phone: string;
  email?: string;
  taxNumber?: string;
  commercialRegister?: string;
  city: string;
  address?: string;
  branchId?: string;
  currentBalance: number;
  currency: CurrencyCode;
  glAccountId: string;
  status?: "ACTIVE" | "BLOCKED";
  category?: string;
  createdAt?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  itemName?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  taxPercent?: number; // 0, 5, 15%
  taxAmount?: number;
  totalPrice?: number;
  discount?: number;
  total: number;
  costCenterId?: string;
  branchId?: string;
  inventoryItemId?: string; // Links to real inventory tracking
}

export type InvoiceType = "SALES" | "SALES_RETURN" | "PURCHASE" | "PURCHASE_RETURN";

export type InvoicePaymentMethod = 
  | "CASH" 
  | "BANK_TRANSFER" 
  | "CHECK" 
  | "CREDIT" 
  | "WALLET_JAWWALI" 
  | "WALLET_JEEB" 
  | "WALLET_FLOUSAK" 
  | "WALLET_ONECASH"
  | "WALLET_CASH" // كاش (Cash)
  | "WALLET_MFLOOS" // إم فلوس
  | "WALLET_PAYPAL" // PayPal
  | "WALLET_STRIPE" // Stripe
  | "WALLET_APPLE_PAY" // Apple Pay
  | "WALLET_GOOGLE_PAY" // Google Pay
  | "WALLET_OTHER";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  date: string;
  dueDate?: string;
  issueDate?: string;
  branchId?: string;
  branchName?: string;
  partyId?: string; // customerId or vendorId
  partyName?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  vendorId?: string;
  vendorName?: string;
  vendorPhone?: string;
  currency: CurrencyCode;
  exchangeRate: number;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal?: number;
  discountAmount?: number;
  taxTotal?: number;
  taxAmount?: number;
  taxRate?: number;
  salesExpenseAmount?: number; // مصروفات المبيعات (شحن، تسليم، خدمات إضافية)
  purchaseExpenseAmount?: number; // مصروفات المشتريات والتوريد
  grandTotal?: number;
  totalAmount: number;
  paidAmount: number; // المبلغ المدفوع
  remainingAmount: number; // المبلغ المتبقي (الذمة)
  paymentMethod?: InvoicePaymentMethod; // وسيلة الدفع (نقد، محافظ محلية، حوالة بنكية، شيك، آجل)
  walletName?: string; // اسم المحفظة (جوالي، جيب، فلوسك، ون كاش...)
  walletNumber?: string; // رقم المحفظة
  walletEmail?: string; // البريد الإلكتروني للمحفظة
  paymentAccountId?: string; // حساب الخزينة أو البنك أو المحفظة
  originalInvoiceNumber?: string; // رقم الفاتورة الأصلية في حالة المرتجع
  returnReason?: string; // سبب الإرجاع
  status: "DRAFT" | "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "ISSUED" | "RETURNED";
  paymentTerms?: string;
  notes?: string;
  qrCodeData?: string;
  journalEntryId?: string;
  attachments?: string[]; // URLs or base64 data of attached files
}

export interface AssetMaintenanceRecord {
  id: string;
  date: string;
  description: string;
  cost: number;
  currency: CurrencyCode;
  serviceProvider: string;
  performedBy: string;
  notes?: string;
}

export interface AssetTransferRecord {
  id: string;
  date: string;
  fromCostCenterId: string;
  fromCostCenterName: string;
  toCostCenterId: string;
  toCostCenterName: string;
  transferredBy: string;
  reason: string;
}

export interface FixedAsset {
  id: string;
  code: string;
  assetCode?: string;
  name: string;
  nameAr?: string;
  category: "BUILDINGS" | "MACHINERY" | "VEHICLES" | "IT_EQUIPMENT" | "FURNITURE" | string;
  purchaseDate: string;
  purchaseCost: number;
  cost?: number;
  currency: CurrencyCode;
  salvageValue: number;
  usefulLifeYears: number;
  annualDepreciation: number;
  depreciationMethod: "STRAIGHT_LINE" | "DECLINING_BALANCE";
  accumulatedDepreciation: number;
  bookValue: number;
  location: string;
  branchId?: string;
  assignedDepartment: string;
  costCenterId?: string;
  costCenterName?: string;
  custodianName?: string;
  serialNumber?: string;
  barcode?: string;
  warrantyExpiry?: string;
  supplierName?: string;
  assetGlAccount?: string;
  accumulatedDepGlAccount?: string;
  depExpenseGlAccount?: string;
  status?: "ACTIVE" | "DISPOSED" | "UNDER_MAINTENANCE";
  maintenanceRecords?: AssetMaintenanceRecord[];
  transferRecords?: AssetTransferRecord[];
  lastDepreciationDate?: string;
}

export interface CostCenter {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  manager: string;
  budgetAllocated: number;
  actualSpent: number;
  budget?: number;
  actualSpend?: number;
  currency?: CurrencyCode;
  parentId?: string;
  branchId?: string;
  type: "ADMINISTRATIVE" | "OPERATIONAL" | "SALES" | "PRODUCTION";
}

export interface ERPRolePermission {
  id: string;
  nameAr: string;
  categoryAr: string;
  descriptionAr: string;
}

export interface ERPRole {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  permissions: string[];
  isSystemRole?: boolean;
  color?: string;
}

export interface ERPUser {
  id: string;
  name: string;
  fullName?: string; // Friendly alias for name
  role: "CHIEF_ACCOUNTANT" | "FINANCIAL_CONTROLLER" | "CASHIER" | "AUDITOR" | "SYSTEM_ADMIN" | "INVENTORY_MANAGER" | string;
  roleId?: string;
  branch: string;
  branchId?: string;
  allowedBranchIds?: string[]; // الفروع المصرح للمستخدم بالوصول إليها
  avatar: string;
  status?: "ACTIVE" | "INACTIVE";
  isActive?: boolean;
  email?: string;
  phone?: string;
  tenantId?: string;
  customPermissions?: string[];
  plan?: "TRIAL" | "PRO" | "ENTERPRISE";
}

export interface InventoryItem {
  id: string;
  code: string; // SKU e.g. "INV-1001"
  sku?: string; // Optional SKU alias
  valuationMethod?: "FIFO" | "WEIGHTED_AVERAGE" | "LIFO" | string;
  nameAr: string;
  nameEn?: string;
  name?: string; // Friendly alias
  category: string;
  unit: string;
  quantityOnHand: number;
  minStockThreshold: number;
  costPrice: number;
  unitCost?: number;
  sellingPrice: number;
  reorderPoint?: number;
  salePrice?: number; // Friendly alias
  purchasePrice?: number; // سعر الشراء / التوريد
  lastSellingPrice?: number; // آخر سعر بيع مسجل
  currency: CurrencyCode;
  warehouseLocation: string;
  branchId?: string;
  totalSalesQty?: number;
  totalReturnsQty?: number; // مردودات الاصناف والعائد
  status?: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
  barcode?: string;
  description?: string;
  createdAt?: string;
}

export type StockMovementType =
  | "PURCHASE" // توريد بضاعة / مشتريات
  | "SALES" // صرف مبيعات
  | "RETURN_CUSTOMER" // مردود مبيعات (عائد من عميل)
  | "RETURN_VENDOR" // مردود مشتريات (عائد للمورد)
  | "TRANSFER_OUT" // تحويل صادر لفرع آخر
  | "TRANSFER_IN" // تحويل وارد من فرع آخر
  | "ADJUSTMENT_ADD" // تسوية جردية (إضافة)
  | "ADJUSTMENT_SUB" // تسوية جردية (خصم)
  | "IN"
  | "OUT"
  | "توريد مشتريات (+)"
  | "صرف مبيعات (-)"
  | "مرتجع من عميل (+)"
  | "مرتجع لمورد (-)"
  | "تسوية إضافة (+)"
  | "تسوية خصم (-)"
  | (string & {});

export interface StockMovement {
  id: string;
  itemId: string;
  itemCode?: string;
  itemNameAr?: string;
  type: StockMovementType;
  quantity: number;
  unitPrice?: number;
  unitCost?: number;
  totalCost?: number;
  totalAmount?: number;
  referenceType?: string;
  date: string;
  referenceNumber: string; // رقم الفاتورة / القيد / السند
  branchId?: string;
  destinationBranchId?: string; // للتحويل بين الفروع
  notes: string;
  createdBy?: string;
}

export interface UnavailableItemRequest {
  id: string;
  requestNumber: string;
  itemName: string;
  category: string;
  requestedQty: number;
  customerOrBranch: string;
  branchId?: string;
  urgency: "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "ORDERED" | "FULFILLED" | "CANCELLED";
  requestDate: string;
  notes: string;
  createdBy?: string;
}

export interface GoogleDriveBackupConfig {
  enabled: boolean;
  accessToken?: string; // OAuth 2.0 Access Token
  folderId?: string; // Target Google Drive Folder ID (or root)
  autoUploadOnScheduled?: boolean;
  lastUploadAt?: string;
  lastUploadStatus?: "SUCCESS" | "FAILED" | "PENDING" | "NONE";
  lastUploadMessage?: string;
  lastUploadedFileId?: string;
  lastUploadedFileName?: string;
}

export interface YandexDiskBackupConfig {
  enabled: boolean;
  oauthToken?: string; // Yandex Disk OAuth Token
  targetFolder?: string; // e.g. "app:/MeDo_ERP_Backups/" or "disk:/Backups/"
  autoUploadOnScheduled?: boolean;
  lastUploadAt?: string;
  lastUploadStatus?: "SUCCESS" | "FAILED" | "PENDING" | "NONE";
  lastUploadMessage?: string;
  lastUploadedFilePath?: string;
}

export interface TelegramBackupConfig {
  enabled: boolean;
  botToken?: string; // Bot token from @BotFather
  chatId?: string; // Chat ID or Channel Username (e.g. -100xxxx or @channel)
  sendAsDocument?: boolean; // Send encrypted/json backup file as document
  sendSummaryText?: boolean; // Send financial and operations KPI summary message
  autoUploadOnScheduled?: boolean;
  lastUploadAt?: string;
  lastUploadStatus?: "SUCCESS" | "FAILED" | "PENDING" | "NONE";
  lastUploadMessage?: string;
  lastMessageId?: string;
}

export interface LocalBackupConfig {
  enabled?: boolean;
  autoDownloadOnBackup?: boolean; // Auto-trigger browser file download on backup execution
  saveToLocalStorageSnapshot?: boolean; // Store encrypted snapshot in browser storage vault
  keepLocalSnapshotsCount?: number; // Max snapshots to retain
  lastBackupAt?: string;
  lastBackupFileName?: string;
}

export interface BackupDestinationLog {
  destination: "GOOGLE_DRIVE" | "YANDEX_DISK" | "TELEGRAM" | "LOCAL_STORAGE" | "FIRESTORE_CLOUD";
  status: "SUCCESS" | "FAILED" | "SKIPPED";
  timestamp: string;
  targetDetails?: string;
  fileReference?: string;
  message?: string;
}

export interface ScheduledBackupConfig {
  enabled: boolean;
  frequency: "HOURLY" | "EVERY_6_HOURS" | "EVERY_12_HOURS" | "DAILY" | "WEEKLY";
  scheduledTime?: string; // e.g. "02:00"
  autoEncrypt: boolean;
  encryptionKey?: string; // AES-256 Secret Key
  uploadToCloud: boolean;
  cloudStoragePath?: string; // e.g., "cloud_backups" collection in Firestore
  keepMaxBackups: number; // e.g. 10
  lastBackupAt?: string;
  nextScheduledAt?: string;
  lastBackupStatus?: "SUCCESS" | "FAILED" | "IN_PROGRESS" | "NONE";
  lastBackupMessage?: string;

  // Multi-destination Backup Integrations
  googleDrive?: GoogleDriveBackupConfig;
  yandexDisk?: YandexDiskBackupConfig;
  telegram?: TelegramBackupConfig;
  localBackup?: LocalBackupConfig;
}

export interface BackupLogEntry {
  id: string;
  createdAt: string;
  triggerType: "AUTOMATIC_SCHEDULED" | "MANUAL_TRIGGER";
  fileSizeBytes: number;
  isEncrypted: boolean;
  encryptionAlgorithm: "AES-256-GCM";
  sha256Hash: string;
  cloudUploaded: boolean;
  cloudDocumentId?: string;
  encryptedDataPackage?: {
    ciphertextBase64: string;
    ivBase64: string;
    saltBase64: string;
    sha256: string;
  };
  rawJsonBackup?: string;
  status: "COMPLETED" | "FAILED";
  notes?: string;
  destinationsLogs?: BackupDestinationLog[];
}

export type CalendarType = "GREGORIAN" | "HIJRI" | "DUAL";

export interface SystemSettings {
  companyNameAr: string;
  companyNameEn: string;
  taxNumber: string;
  commercialRegister: string;
  phone: string;
  address: string;
  email: string;
  country?: string;
  dualCurrencyEnabled?: boolean;
  sanaaRate?: number;
  adenRate?: number;
  sarRate?: number;
  taxRate?: number;
  roundDecimals?: number;
  systemVersion?: string;
  baseCurrency: CurrencyCode;
  defaultBranchId?: string;
  fiscalYearStart: string;
  fiscalYearEnd: string;
  closingDate?: string;
  calendarType?: CalendarType;
  showHijriSecondary?: boolean;
  preventUnbalancedJournals: boolean;
  autoPostApprovedVouchers: boolean;
  requireCostCenterForExpenses: boolean;
  allowNegativeCash: boolean;
  aiModel: string;
  aiAutoValidation: boolean;
  scheduledBackup?: ScheduledBackupConfig;
  signatureType?: "NONE" | "TEXT" | "IMAGE";
  signatureText?: string;
  signatureImage?: string;
  printConfig?: BranchPrintConfig;
  licenseType?: "LIFETIME" | "ENTERPRISE_UNLIMITED";
  licenseDuration?: string;
  licenseStatus?: "ACTIVE_LIFETIME";
  licenseExpiryDate?: string;
}

export interface ERPState {
  branches?: Branch[];
  warehouses?: any[];
  activeBranchId?: string; // الفرع النشط في الجلسة ("ALL" أو معرف فرع محدد)
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
  hrLoans?: HRLoan[];
  // --- Enterprise Collaboration, Workflows, Audit Trail & Document Management ---
  correspondences?: CorrespondenceDocument[];
  approvalRequests?: ApprovalRequest[];
  workflowRules?: WorkflowRouteRule[];
  auditLogs?: AuditLogEntry[];
  systemAlerts?: SystemAlert[];
  chatChannels?: ChatChannel[];
  chatMessages?: ChatMessage[];
  administrativeCirculars?: AdministrativeCircular[];
  // --- SaaS Cloud Platform, Client Licensing & Monitoring ---
  saasClients?: SaaSClient[];
  saasConfig?: SaaSSystemConfig;
  activeSessions?: ActiveUserSession[];
  loginAlerts?: LoginNotificationAlert[];
  // --- وحدة الصرافة والتحويلات الداخلية وإدارة ودائع وأمانات العملاء ---
  exchangeAccounts?: ExchangeAccount[];
  exchangeTransactions?: ExchangeTransaction[];
}

export type ExchangeTransactionType =
  | "DEPOSIT"      // إيداع نقدي / بنكي بالحساب (+ زيادة الرصيد)
  | "WITHDRAW"     // سحب نقدي / بنكي من الحساب (- نقصان الرصيد)
  | "TRANSFER"     // تحويل داخلي من عميل لعميل (- للمرسل، + للمستلم)
  | "PURCHASE"     // شراء مواد بناء أو زراعية من رصيد الحساب (- نقصان الرصيد وتحديث المخزون)
  | "SETTLEMENT";  // تسوية فروق أو إغلاق حساب

export type ExchangePaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "WALLET_KURAIMI"
  | "WALLET_JAWWALI"
  | "WALLET_JEEB"
  | "WALLET_FLOUSAK"
  | "WALLET_ONECASH"
  | "WALLET_MFLOOS"
  | "WALLET_CASH"
  | "INTERNAL_BALANCE";

export interface ExchangeTransactionItem {
  itemId: string;
  itemNameAr: string;
  itemCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface ExchangeAccount {
  id: string;
  accountNumber: string; // e.g. "EXCH-1001"
  customerId: string;
  customerNameAr: string;
  customerNameEn?: string;
  phone: string;
  email?: string;
  taxNumber?: string;
  commercialRegister?: string;
  city: string;
  address?: string;
  currency: CurrencyCode;
  balance: number;
  balancesByCurrency?: Partial<Record<CurrencyCode, number>>;
  minBalance?: number;
  status: "ACTIVE" | "FROZEN" | "SUSPENDED";
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  totalDeposits?: number;
  totalWithdrawals?: number;
  totalPurchases?: number;
  totalTransfersSent?: number;
  totalTransfersReceived?: number;
  transactionsCount?: number;
}

export interface ExchangeTransaction {
  id: string;
  transactionNumber: string; // e.g. "EX-2026-0001"
  accountId: string;
  accountNumber?: string;
  customerId: string;
  customerNameAr: string;
  customerPhone: string;
  type: ExchangeTransactionType;
  amount: number;
  currency: CurrencyCode;
  exchangeRate?: number;
  paymentMethod: ExchangePaymentMethod;
  paymentSourceName?: string; // الخزينة الرئيسية، بنك التضامن، إلخ
  recipientAccountId?: string;
  recipientCustomerId?: string;
  recipientCustomerNameAr?: string;
  recipientPhone?: string;
  transferFee?: number;
  purchasedItems?: ExchangeTransactionItem[];
  invoiceId?: string;
  voucherId?: string;
  journalEntryId?: string;
  balanceBefore: number;
  balanceAfter: number;
  recipientBalanceBefore?: number;
  recipientBalanceAfter?: number;
  date: string;
  time: string;
  notes?: string;
  status?: "COMPLETED" | "CANCELLED" | "PENDING";
  createdByName?: string;
  createdAt?: string;
  // إشعارات الرسائل والواتساب
  smsNotificationSent?: boolean;
  whatsappNotificationSent?: boolean;
  notificationMessage?: string;
  notificationStatus?: "PENDING" | "SENT" | "FAILED";
  notifiedAt?: string;
}

export interface CorrespondenceAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  uploadDate: string;
}

export interface CorrespondenceDocument {
  id: string;
  refNumber: string; // e.g. "IN-2026-089", "OUT-2026-042"
  type: "INCOMING" | "OUTGOING" | "INTERNAL_MEMO";
  category: "FINANCIAL" | "ADMINISTRATIVE" | "OPERATIONAL" | "LEGAL" | "HR";
  title: string;
  summary: string;
  senderName: string;
  senderOrganization: string;
  recipientName: string;
  recipientDepartment: string;
  date: string;
  dueDate?: string;
  priority: "URGENT" | "HIGH" | "NORMAL" | "LOW";
  status: "NEW" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED";
  tags?: string[];
  attachments: CorrespondenceAttachment[];
  linkedTransactionType?: "JOURNAL" | "INVOICE" | "VOUCHER" | "HR_DECISION" | "PURCHASE" | "GENERAL";
  linkedTransactionId?: string;
  branchId?: string;
  branchName?: string;
  confidentiality: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "TOP_SECRET";
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  digitalSignature?: DigitalSignature;
  createdBy: string;
  createdAt: string;
}

export interface ApprovalWorkflowStep {
  stepOrder: number;
  stepName: string;
  approverRole: string;
  approverUserId?: string;
  approverUserName?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SKIPPED";
  actionDate?: string;
  notes?: string;
  signatureImage?: string;
}

export interface ApprovalComment {
  id: string;
  userName: string;
  userAvatar: string;
  role: string;
  timestamp: string;
  text: string;
  action?: "APPROVE" | "REJECT" | "FORWARD" | "COMMENT" | "REVISION_REQUEST";
}

export interface DocumentStudyAnalysis {
  id: string;
  title: string;
  documentTitle?: string;
  documentRef: string;
  summary: string;
  preparedBy: string;
  preparedRole: string;
  preparedDate: string;
  date?: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  feasibilityScore?: number; // 0-100%
  financialImpactNotes?: string;
  budgetAllocated?: number;
  currency?: CurrencyCode;
  expectedRoiPercentage?: number;
  roiEstimatePercent?: number;
  recommendations?: string[];
  studyAttachments?: {
    id: string;
    name: string;
    size: string;
    type: string;
    url?: string;
    description?: string;
  }[];
}

export interface WorkflowStepDefinition {
  stepOrder: number;
  stepName: string;
  approverRole: string;
  approverUserId?: string;
  approverUserName?: string;
  slaHours?: number;
  requireSignature?: boolean;
  requiresDigitalSignature?: boolean;
  requireStudyDocument?: boolean;
  requiresStudyDocument?: boolean;
  isMandatory?: boolean;
  description?: string;
}

export interface WorkflowRouteRule {
  id: string;
  name: string;
  nameAr?: string;
  documentType: "JOURNAL" | "VOUCHER" | "PURCHASE_BILL" | "SALES_INVOICE" | "HR_PAYROLL" | "EXPENSE" | "GENERAL_MEMO";
  minAmount?: number;
  maxAmount?: number;
  currency?: CurrencyCode;
  branchScope: "ALL" | "SPECIFIC";
  branchNames?: string[];
  priority: "URGENT" | "HIGH" | "NORMAL" | "LOW";
  isActive: boolean;
  steps: WorkflowStepDefinition[];
  description?: string;
  createdAt: string;
}

export interface DigitalSignature {
  signerName: string;
  signerRole: string;
  signerUserId: string;
  signedAt: string;
  signatureDataUrl: string; // Base64 signature image
  certificateId: string;
  ipAddress?: string;
  verificationHash: string;
}

export interface ApprovalRequest {
  id: string;
  requestNumber: string; // e.g. "APR-2026-104"
  title: string;
  description?: string;
  documentType: "JOURNAL" | "VOUCHER" | "PURCHASE_BILL" | "SALES_INVOICE" | "HR_PAYROLL" | "EXPENSE" | "GENERAL_MEMO";
  documentId: string;
  documentRef: string;
  amount?: number;
  currency?: CurrencyCode;
  requestedBy: string;
  requesterRole: string;
  requestedAt: string;
  currentStep: number;
  totalSteps: number;
  workflowSteps: ApprovalWorkflowStep[];
  status: "PENDING" | "APPROVED" | "REJECTED" | "FORWARDED";
  priority: "URGENT" | "HIGH" | "MEDIUM" | "NORMAL";
  comments: ApprovalComment[];
  digitalSignature?: DigitalSignature;
  branchId?: string;
  branchName?: string;
  notes?: string;
  workflowRuleId?: string;
  studyAnalysis?: DocumentStudyAnalysis;
  linkedDocumentDetails?: {
    docType: string;
    documentType?: string;
    ref: string;
    documentNumber?: string;
    date: string;
    partyName?: string;
    debitAccount?: string;
    creditAccount?: string;
    description?: string;
    branch?: string;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  userAvatar: string;
  branchName: string;
  actionType: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT" | "PRINT" | "EXPORT" | "LOGIN" | "SIGNATURE";
  module: "FI_JOURNAL" | "SD_SALES" | "MM_PURCHASE" | "MM_INVENTORY" | "HR_PAYROLL" | "TREASURY" | "COLLABORATION" | "SYSTEM_SETTINGS";
  entityId: string;
  entityRef: string;
  details: string;
  ipAddress: string;
  device: string;
  status: "SUCCESS" | "WARNING" | "SECURITY_ALERT";
}

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: "FINANCIAL_RISK" | "INVENTORY_SHORTAGE" | "APPROVAL_REQUIRED" | "COMPLIANCE_AUDIT" | "SYSTEM_SECURITY";
  severity: "CRITICAL" | "WARNING" | "INFO";
  createdAt: string;
  isRead: boolean;
  targetRoles?: string[];
  actionUrl?: string;
  branchId?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  branchName: string;
  text: string;
  timestamp: string;
  attachments?: { name: string; size: string; type: string; url?: string }[];
  linkedDoc?: { type: string; id: string; title: string; ref?: string };
  mentions?: string[];
  reactions?: { emoji: string; count: number; users: string[] }[];
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  type: "DIRECT" | "GROUP" | "BRANCH" | "DEPARTMENT";
  participants: string[];
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  icon?: string;
  isArchived?: boolean;
  branchId?: string;
}

export interface AdministrativeCircular {
  id: string;
  circularNumber: string; // e.g. "CIRC-2026-01"
  title: string;
  content: string;
  issuedBy: string;
  issuerRole: string;
  issueDate: string;
  expiryDate?: string;
  priority: "URGENT" | "IMPORTANT" | "ROUTINE";
  targetAudience: "ALL" | "BRANCH" | "DEPARTMENT" | "SPECIFIC_ROLES";
  targetBranches?: string[];
  targetDepartments?: string[];
  isPinned: boolean;
  attachments?: { name: string; size: string }[];
  acknowledgedBy: { userId: string; userName: string; acknowledgedAt: string }[];
}

export interface HREmployee {
  id: string;
  code: string;
  name: string;
  jobTitle: string;
  department: string;
  branch: string;
  branchId?: string;
  hireDate: string;
  nationalId: string;
  phone: string;
  email: string;
  status: "ACTIVE" | "ON_LEAVE" | "SUSPENDED" | "TERMINATED";
  contract: HRContract;
  salaryStructure: HRSalaryStructure;
}

export interface HRContract {
  type: "FULL_TIME" | "PART_TIME" | "PROBATION" | "TEMPORARY";
  startDate: string;
  endDate: string;
  probationMonths: number;
  status: "ACTIVE" | "EXPIRED" | "RENEWED";
  terms: string;
}

export interface HRSalaryAllowance {
  id: string;
  name: string;
  amount: number;
  type: "HOUSING" | "TRANSPORT" | "COMMUNICATION" | "RISK" | "OTHER";
}

export interface HRSalaryBonus {
  id: string;
  name: string;
  amount: number;
  reason: string;
  date: string;
}

export interface HRSalaryDeduction {
  id: string;
  name: string;
  amount: number;
  reason: string;
  date: string;
}

export interface HRSalaryStructure {
  basicSalary: number;
  currency: CurrencyCode;
  allowances: HRSalaryAllowance[];
  bonuses: HRSalaryBonus[];
  deductions: HRSalaryDeduction[];
}

export interface HRAdministrativeDecision {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "PROMOTION" | "TRANSFER" | "PENALTY" | "BONUS_DECISION" | "CONTRACT_RENEWAL" | "TERMINATION" | "APPOINTMENT";
  title: string;
  date: string;
  effectiveDate: string;
  details: string;
  issuedBy: string;
  documentRef?: string;
}

export interface HRAttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  branchId?: string;
  date: string;
  shiftName: string;
  expectedCheckIn: string;
  expectedCheckOut: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE" | "HALF_DAY";
  latenessMinutes: number;
  overtimeHours: number;
  notes?: string;
}

export interface HRWorkingShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  workingDaysPerWeek: number;
  overtimeRate: number;
}

export interface HRLoan {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  reason: string;
  installmentAmount: number;
  remainingAmount: number;
  status: "ACTIVE" | "PAID";
}

export interface HRMonthlyPayroll {
  id: string;
  period: string; // e.g. "2026-08"
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  department: string;
  branchId?: string;
  basicSalary: number;
  totalAllowances: number;
  totalBonuses: number;
  latenessDeductions: number;
  otherDeductions: number;
  loansDeduction?: number;
  netSalary: number;
  currency: CurrencyCode;
  status: "DRAFT" | "APPROVED" | "DISBURSED";
  disbursementDate?: string;
  journalEntryId?: string;
}

// ==========================================
// Offline-First, Local DB & Sync Engine Types
// ==========================================

export type SyncStatus = "PENDING" | "SYNCED" | "FAILED" | "CONFLICT";

export type SyncOperationType = "CREATE" | "UPDATE" | "DELETE";

export type SyncEntity =
  | "JOURNAL_ENTRY"
  | "VOUCHER"
  | "INVOICE"
  | "STOCK_MOVEMENT"
  | "INVENTORY_ITEM"
  | "ACCOUNT"
  | "CUSTOMER"
  | "VENDOR"
  | "SETTINGS"
  | "EXCHANGE_ACCOUNT"
  | "EXCHANGE_TRANSACTION";

export interface SyncOutboxItem {
  id: string;
  entity: SyncEntity;
  entityId: string;
  entityRef: string; // Document Number or description
  operation: SyncOperationType;
  payload: any;
  createdAt: string;
  status: SyncStatus;
  attempts: number;
  lastAttemptAt?: string;
  errorMessage?: string;
  branchId?: string;
  branchName?: string;
  localHash?: string;
}

export type ConflictResolutionStrategy =
  | "TIMESTAMP_LATEST" // أحدث طابع زمني (Last Write Wins)
  | "BRANCH_AUTHORITY" // أولوية الفرع / الجهاز المحلي
  | "CLOUD_AUTHORITY" // أولوية الخادم المركزي (Cloud Master)
  | "MANUAL_REVIEW"; // مراجعة وتدقيق يدوي

export interface ConflictLogEntry {
  id: string;
  timestamp: string;
  entity: SyncEntity;
  entityId: string;
  entityRef: string;
  strategyUsed: ConflictResolutionStrategy;
  resolutionSummary: string;
  branchId: string;
  resolvedBy: string;
  localTimestamp: string;
  cloudTimestamp: string;
}

export type NetworkConnectionMode = "ONLINE" | "OFFLINE" | "FLAKY";

export interface LocalDBSnapshot {
  id: string;
  name: string;
  createdAt: string;
  sizeBytes: number;
  recordCount: number;
  isEncrypted: boolean;
  version: string;
  checksum: string;
  description?: string;
}

export interface SaaSClient {
  id: string;
  companyName: string;
  clientName: string;
  email: string;
  phone: string;
  licenseKey: string;
  uniqueDomain: string;
  subscriptionStart: string;
  subscriptionEnd: string;
  status: "ACTIVE" | "TRIAL" | "EXPIRED" | "SUSPENDED";
  databaseType: "SQLITE" | "POSTGRES_LOCAL" | "CLOUD_FIRESTORE";
  encryptionKey?: string;
  maxOperations: number;
  currentOperationsCount: number;
  usersCount: number;
  lastLogin?: string;
  notes?: string;
}

export interface SaaSSystemConfig {
  trialDays: number;
  maxTrialOperations: number;
  notificationEmail: string;
  notificationWhatsApp: string;
  telegramBotEnabled: boolean;
  platformName: string;
}

export interface ActiveUserSession {
  id: string;
  username: string;
  email: string;
  branch: string;
  loginTime: string;
  ipAddress: string;
  userAgent: string;
  deviceType: string;
}

export interface LoginNotificationAlert {
  id: string;
  username: string;
  email: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  notifiedChannels: ("EMAIL" | "WHATSAPP" | "TELEGRAM")[];
}

export interface AdminManualTopic {
  id: string;
  title: string;
  category: "DEVELOPMENT" | "INVOICES" | "DATA_MIGRATION" | "LOCAL_DB" | "LEGAL";
  summary: string;
  contentMarkdown: string;
}


