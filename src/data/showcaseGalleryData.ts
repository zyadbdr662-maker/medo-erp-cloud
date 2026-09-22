export interface ShowcaseItem {
  id: number;
  title: string;
  category: string;
  categoryKey: string;
  description: string;
  badge: string;
  moduleKey: string;
  features: string[];
  specs: {
    resolution: string;
    format: string;
    engine: string;
    securityLevel: string;
  };
  mockType: 
    | "INVOICE_STANDARD"
    | "INVOICE_AI"
    | "INVOICE_POS"
    | "SALES_RETURN"
    | "CUSTOMER_STATEMENT"
    | "PRINTED_INVOICE_A4"
    | "PURCHASE_BILL"
    | "PURCHASE_ORDER"
    | "GOODS_RECEIPT"
    | "VENDOR_STATEMENT"
    | "PURCHASE_RETURN"
    | "ITEM_MASTER"
    | "ITEM_UNITS_TREE"
    | "STOCK_COUNT"
    | "WAREHOUSE_TRANSFER"
    | "STOCK_ALERTS"
    | "INVENTORY_VALUATION"
    | "RECEIPT_VOUCHER"
    | "PAYMENT_VOUCHER"
    | "E_WALLETS_DASHBOARD"
    | "WALLET_RECONCILIATION"
    | "WALLET_TRANSFER"
    | "CHART_OF_ACCOUNTS"
    | "JOURNAL_ENTRY_MANUAL"
    | "JOURNAL_ENTRY_AI"
    | "VOICE_JOURNAL_ENTRY"
    | "TRIAL_BALANCE"
    | "BALANCE_SHEET"
    | "INCOME_STATEMENT"
    | "CASH_FLOW"
    | "ZAKAT_REPORT"
    | "TAX_AUDIT_REPORT"
    | "ZATCA_VAT_RETURN"
    | "EMPLOYEE_RECORD"
    | "PAYROLL_RUN"
    | "ATTENDANCE_BIOMETRIC"
    | "DEDUCTIONS_ADVANCES"
    | "EMPLOYEE_STATEMENT"
    | "FIXED_ASSETS_REGISTRY"
    | "DEPRECIATION_SCHEDULE"
    | "MAINTENANCE_SCHEDULE"
    | "AI_FINANCIAL_ADVISOR"
    | "AI_PROMPT_ENTRY"
    | "AI_VOICE_ASSISTANT"
    | "PROFITABILITY_ANALYSIS"
    | "CASH_FLOW_FORECAST"
    | "EXPENSE_ENTRY"
    | "REVENUE_ENTRY"
    | "APPROVAL_WORKFLOW"
    | "BUDGET_SETUP"
    | "VARIANCE_ANALYSIS"
    | "PARTNERS_MANAGEMENT"
    | "PROFIT_DISTRIBUTION"
    | "PARTNER_STATEMENT"
    | "TENANT_MANAGEMENT_200"
    | "ACTIVE_SESSIONS_MAP"
    | "AUDIT_LOG_STREAM"
    | "APP_ANDROID_MOBILE"
    | "APP_IOS_MOBILE"
    | "APP_DARK_MODE"
    | "THEME_EDITOR"
    | "LOGIN_PORTAL_VIEW"
    | "DASHBOARD_EXECUTIVE"
    | "SIDEBAR_NAVIGATION"
    | "BRANCH_MANAGEMENT"
    | "PRINTED_A4_TAX"
    | "THERMAL_80MM_RECEIPT"
    | "QR_ZATCA_INVOICE"
    | "PRINTED_RECEIPT_VOUCHER"
    | "PRINTED_PAYMENT_VOUCHER"
    | "SAAS_REGISTER_MODAL"
    | "PENDING_APPROVAL_SCREEN"
    | "TWO_FACTOR_AUTH_SCREEN"
    | "MASTER_ADMIN_PLATFORM"
    | "TENANT_ISOLATION_ENGINE"
    | "TASK_MANAGEMENT_BOARD"
    | "ONBOARDING_WIZARD"
    | "DESKTOP_4K_VIEW"
    | "TABLET_POS_VIEW"
    | "MOBILE_PWA_VIEW"
    | "APK_COMPANION_VIEW"
    | "OFFLINE_FIRST_SYNC"
    | "CURRENCY_DIFFERENTIALS"
    | "COST_CENTERS_3D"
    | "MULTI_BRANCH_CONSOLIDATION"
    | "SECURITY_SHIELD_VAULT"
    | "ELECTRONIC_STAMP_SIGN"
    | "BACKUP_RESTORE_CLOUD"
    | "SMART_ALERT_CENTER"
    | "ENTERPRISE_API_GATEWAY";
}

export const showcaseCategories = [
  { key: "ALL", nameAr: "جميع الصور (90)", icon: "✨" },
  { key: "SALES", nameAr: "المبيعات والفوترة (6)", icon: "🛒" },
  { key: "PURCHASES", nameAr: "المشتريات والموردين (5)", icon: "📦" },
  { key: "INVENTORY", nameAr: "المخزون والمستودعات (6)", icon: "🏬" },
  { key: "TREASURY", nameAr: "الخزينة والمحافظ (5)", icon: "💰" },
  { key: "ACCOUNTING", nameAr: "المحاسبة والأستاذ العام (6)", icon: "📊" },
  { key: "REPORTS", nameAr: "التقارير المالية والضريبية (5)", icon: "📑" },
  { key: "HR", nameAr: "الموارد البشرية والرواتب (6)", icon: "👥" },
  { key: "ASSETS", nameAr: "الأصول الثابتة والإهلاك (3)", icon: "🏗️" },
  { key: "AI", nameAr: "الذكاء الاصطناعي والمستشار (5)", icon: "🤖" },
  { key: "EXPENSES", nameAr: "المصروفات والإيرادات (3)", icon: "💳" },
  { key: "BUDGETS", nameAr: "الموازنات التقديرية (2)", icon: "🎯" },
  { key: "PARTNERS", nameAr: "الشراكات والأرباح (3)", icon: "🤝" },
  { key: "CLOUD", nameAr: "المنصة السحابية والسيادة (10)", icon: "☁️" },
  { key: "PRINTED", nameAr: "الفواتير والسندات المطبوعة (5)", icon: "🖨️" },
  { key: "DEVICES", nameAr: "التطبيقات والأجهزة (8)", icon: "📱" },
  { key: "PRO_VIEWS", nameAr: "لوحات التحكم والمميزات (9)", icon: "💎" },
];

export const showcaseItemsData: ShowcaseItem[] = [
  // القسم 1: المبيعات والفوترة (1-6)
  {
    id: 1,
    title: "إنشاء فاتورة مبيعات قياسية",
    category: "المبيعات والفوترة",
    categoryKey: "SALES",
    moduleKey: "sales",
    badge: "ZATCA Stage 2 Ready",
    description: "شاشة تفاعلية لإنشاء فواتير المبيعات مع دعم ماسح الباركود، حساب الضرائب الفوري، والخصومات الترويجية.",
    features: ["توليد QR Code ضريبي مشفر", "تسعير متعدد بالعملات", "ربط لحظي مع المخزون والعملاء"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Sales Engine v4", securityLevel: "AES-256 GCM" },
    mockType: "INVOICE_STANDARD"
  },
  {
    id: 2,
    title: "فاتورة مبيعات ذكية بالذكاء الاصطناعي",
    category: "المبيعات والفوترة",
    categoryKey: "SALES",
    moduleKey: "sales",
    badge: "AI Powered",
    description: "توليد فواتير المبيعات من خلال الأوامر الصوتية أو النصوص التلقائية بدقة حسابية عالية.",
    features: ["التعرف على الأصناف تلقائياً", "مطابقة الأسعار التاريخية للعميل", "كشف فوري للأخطاء الحسابية"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Gemini 2.5 Flash", securityLevel: "Zero Data Leak" },
    mockType: "INVOICE_AI"
  },
  {
    id: 3,
    title: "شاشة نقاط البيع السريعة (POS)",
    category: "المبيعات والفوترة",
    categoryKey: "SALES",
    moduleKey: "sales",
    badge: "Offline-First",
    description: "كاشير فائق السرعة يعمل بلمسة واحدة ويدعم الشاشات اللمسية والطباعة الحرارية السريعة.",
    features: ["عمل كامل دون إنترنت", "مزامنة تلقائية عند عودة الشبكة", "أزرار أصناف بصرية سريعة"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "POS IndexedDB Sync", securityLevel: "Encrypted Cache" },
    mockType: "INVOICE_POS"
  },
  {
    id: 4,
    title: "إدارة مردودات المبيعات",
    category: "المبيعات والفوترة",
    categoryKey: "SALES",
    moduleKey: "sales",
    badge: "Reverse Inventory",
    description: "معالجة مرتجعات المبيعات برقم الفاتورة الأصلية، مع إعادة الكميات إلى المخزن وتعديل حساب العميل آلياً.",
    features: ["التحقق من صحة الفاتورة الأصلية", "إعادة تقييم تكلفة البضاعة", "إشعار دائن آلي"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Accounting Reversal", securityLevel: "Audit Logged" },
    mockType: "SALES_RETURN"
  },
  {
    id: 5,
    title: "كشف حساب عميل تحليلي تفصيلي",
    category: "المبيعات والفوترة",
    categoryKey: "SALES",
    moduleKey: "sales",
    badge: "Multi-Currency",
    description: "كشف حساب شامل يوضح الحركات الدائنة والمدينة والأرصدة التراكمية مع مطابقة العملة وفترات الاستحقاق.",
    features: ["تصنيف أعمار الديون", "تصدير فوري PDF و Excel", "مشاركة مباشرة عبر واتساب"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Ledger Engine v4", securityLevel: "Role-Based ACL" },
    mockType: "CUSTOMER_STATEMENT"
  },
  {
    id: 6,
    title: "الفاتورة الضريبية المعتمدة A4 مع الـ QR Code",
    category: "المبيعات والفوترة",
    categoryKey: "SALES",
    moduleKey: "sales",
    badge: "Official Tax Form",
    description: "نموذج الطباعة النهائي للفاتورة الضريبية متضمناً الختم المائي، الباركود، وبيانات التسجيل الضريبي.",
    features: ["تصميم مهني معتمد", "تشفير Base64 لرمز الاستجابة", "دعم الشعار المخصص للشركة"],
    specs: { resolution: "2480x3508 A4 HD", format: "Vector SVG", engine: "Print Composer Pro", securityLevel: "Cryptographic QR" },
    mockType: "PRINTED_INVOICE_A4"
  },

  // القسم 2: المشتريات والموردين (7-11)
  {
    id: 7,
    title: "إنشاء فاتورة مشتريات وتوريد بضائع",
    category: "المشتريات والموردين",
    categoryKey: "PURCHASES",
    moduleKey: "purchases",
    badge: "FIFO Costing",
    description: "شاشة استلام فواتير الموردين وتوزيع مصاريف الشحن والجمارك على تكلفة الأصناف تلقائياً.",
    features: ["تحميل التكاليف الإضافية (Landed Cost)", "تحديث متوسط تكلفة الشراء", "تأكيد الكميات المستلمة"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Cost Allocator v2", securityLevel: "Tier-1 Security" },
    mockType: "PURCHASE_BILL"
  },
  {
    id: 8,
    title: "أمر الشراء والتوريد المعتمد (PO)",
    category: "المشتريات والموردين",
    categoryKey: "PURCHASES",
    moduleKey: "purchases",
    badge: "Workflow Approved",
    description: "دورة معتمدة لأوامر الشراء تبدأ من طلب الشراء والموافقة الإدارية وحتى إصدار التعميد الرسمي.",
    features: ["سلسلة موافقات متعددة المستويات", "تتبع تواريخ الاستلام المتوقعة", "مقارنة عروض الأسعار"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Approval Matrix", securityLevel: "Digital Signature" },
    mockType: "PURCHASE_ORDER"
  },
  {
    id: 9,
    title: "إذن استلام البضائع والفحص المخزني",
    category: "المشتريات والموردين",
    categoryKey: "PURCHASES",
    moduleKey: "purchases",
    badge: "Goods Receipt",
    description: "مطابقة الكميات الموردة فعلياً مع أمر الشراء وتسجيل تواريخ الصلاحية وأرقام التشغيلات (Batches).",
    features: ["فحص الجودة والمطابقة", "تسجيل أرقام التشغيلات", "توليد قيد الاستحقاق المؤقت"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Warehouse GRN", securityLevel: "Role Gate" },
    mockType: "GOODS_RECEIPT"
  },
  {
    id: 10,
    title: "كشف حساب مورد ومطابقة الأرصدة",
    category: "المشتريات والموردين",
    categoryKey: "PURCHASES",
    moduleKey: "purchases",
    badge: "Payables Ledger",
    description: "تقرير مالي دقيق لالتزامات الموردين وجداول السداد والكمبيالات المستحقة وتواريخ التسوية.",
    features: ["جدولة الدفعات المستحقة", "تنبيهات بمواعيد السداد", "مطابقة كشوف المورد"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "AP Sub-ledger", securityLevel: "Strict Privacy" },
    mockType: "VENDOR_STATEMENT"
  },
  {
    id: 11,
    title: "مردودات المشتريات وإشعار الخصم",
    category: "المشتريات والموردين",
    categoryKey: "PURCHASES",
    moduleKey: "purchases",
    badge: "Debit Note",
    description: "إعادة البضائع المعيبة إلى الموردين وتخفيض رصيد حساب المورد وتعديل ميزان المخزون.",
    features: ["إصدار إشعار مدين فوري", "استبعاد تكلفة الصنف بالمتوسط", "توثيق أسباب الإرجاع"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Purchasing Engine", securityLevel: "Audit Logged" },
    mockType: "PURCHASE_RETURN"
  },

  // القسم 3: المخزون والمستودعات (12-17)
  {
    id: 12,
    title: "بطاقة الصنف المتكاملة والباركود",
    category: "المخزون والمستودعات",
    categoryKey: "INVENTORY",
    moduleKey: "inventory",
    badge: "Multi-Barcode",
    description: "تعريف شامل للأصناف يشتمل على أسعار البيع المتعددة، حد الطلب، والوحدات والباركود الدولي.",
    features: ["وحدات قياس متعددة", "دعم الأرقام التسلسلية والصلاحية", "تحديد المستودعات الافتراضية"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Catalog Core v3", securityLevel: "System Guard" },
    mockType: "ITEM_MASTER"
  },
  {
    id: 13,
    title: "شجرة توزيع وحدات الأصناف (كرتون / شدة / حبة)",
    category: "المخزون والمستودعات",
    categoryKey: "INVENTORY",
    moduleKey: "inventory",
    badge: "Nested Units",
    description: "هيكل هرمي لمعاملات التحويل بين العبوات الكبرى والتجزئة مع احتساب التكلفة الآلي لكل وحدة.",
    features: ["معاملات تحويل غير محدودة", "تسعير مخصص لكل وحدة", "تتبع حركة الجرد بالوحدات"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Unit Multiplier Tree", securityLevel: "Protected Data" },
    mockType: "ITEM_UNITS_TREE"
  },
  {
    id: 14,
    title: "شاشة الجرد المخزني وتسوية الفروقات",
    category: "المخزون والمستودعات",
    categoryKey: "INVENTORY",
    moduleKey: "inventory",
    badge: "Stock Reconciliation",
    description: "مطابقة الرصيد الدفتري مع الجرد الفعلي، مع توليد قيود فروقات الجرد (عجز / زيادة) فورياً.",
    features: ["جرد دوري أو مفاجئ", "توليد قيود تسوية تلقائية", "استخدام ماسحات الباركود"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Variance Reconciler", securityLevel: "Audited Action" },
    mockType: "STOCK_COUNT"
  },
  {
    id: 15,
    title: "التحويل بين المستودعات والفروع",
    category: "المخزون والمستودعات",
    categoryKey: "INVENTORY",
    moduleKey: "inventory",
    badge: "Inter-Branch Transfer",
    description: "نقل البضائع بين الفروع والمستودعات المركزية مع إدارة البضاعة بالطريق وحساب تكاليف النقل.",
    features: ["نظام تأكيد الاستلام المزدوج", "متابعة البضاعة في الطريق (Transit)", "قيود تحويل بين الفروع"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Transit Logistics", securityLevel: "Branch Isolation" },
    mockType: "WAREHOUSE_TRANSFER"
  },
  {
    id: 16,
    title: "مركز تنبيهات المخزون والصلاحية",
    category: "المخزون والمستودعات",
    categoryKey: "INVENTORY",
    moduleKey: "inventory",
    badge: "Smart Alerts",
    description: "لوحة رصد ذكية للأصناف الراكدة، قرب انتهاء الصلاحية، وتجاوز الحدود الدنيا والقصوى للأصناف.",
    features: ["تنبيهات استباقية قبل النفاذ", "تحليل معدل دوران المخزون", "اقتراح كميات إعادة الطلب"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Alert Daemon v2", securityLevel: "Real-time SSE" },
    mockType: "STOCK_ALERTS"
  },
  {
    id: 17,
    title: "تقرير تقييم المخزون وحركة الأصناف",
    category: "المخزون والمستودعات",
    categoryKey: "INVENTORY",
    moduleKey: "inventory",
    badge: "IAS 2 Inventory Value",
    description: "تقرير تفصيلي لتقييم المخزون بطريقة FIFO والمتوسط المرجح ومقارنة القيمة السوقية بالتكلفة.",
    features: ["مطابقة المعيار المحاسبي الدولي IAS 2", "كشف بالأصناف منتهية الصلاحية", "تصدير فوري للمعادلات"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Valuation Engine", securityLevel: "Zero Tamper" },
    mockType: "INVENTORY_VALUATION"
  },

  // القسم 4: الخزينة والمحافظ (18-22)
  {
    id: 18,
    title: "سند قبض نقدي وبنكي معتمد",
    category: "الخزينة والمحافظ",
    categoryKey: "TREASURY",
    moduleKey: "treasury",
    badge: "Instant Voucher",
    description: "إصدار سندات القبض متعددة العملات مع طباعة فورية وتوليد القيود المحاسبية التلقائية وتحديث الصندوق.",
    features: ["توليد رقم تسلسلي غير قابل للتكرار", "ربط مع مراكز التكلفة والمشاريع", "طباعة إيصال فوري للعميل"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Treasury Core", securityLevel: "Encrypted Ledger" },
    mockType: "RECEIPT_VOUCHER"
  },
  {
    id: 19,
    title: "سند صرف وإدارة المصروفات النقدية",
    category: "الخزينة والمحافظ",
    categoryKey: "TREASURY",
    moduleKey: "treasury",
    badge: "Controlled Payout",
    description: "شاشة تحرير سندات الصرف مع التأكد من وجود رصيد كافٍ في الصندوق أو البنك وتسجيل المستلم والمستند المرفق.",
    features: ["مراقبة سقف السحب اليومي", "إرفاق صور السندات الورقية", "توليد قيد الصرف المحاسبي"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Treasury Core", securityLevel: "2-Step Approval" },
    mockType: "PAYMENT_VOUCHER"
  },
  {
    id: 20,
    title: "إدارة المحافظ الإلكترونية (جوالي، جيب، فلوسك)",
    category: "الخزينة والمحافظ",
    categoryKey: "TREASURY",
    moduleKey: "treasury",
    badge: "FinTech Gateway",
    description: "لوحة موحدة لرصد ومتابعة أرصدة وحركات المحافظ الإلكترونية اليمنية والتحويلات اللحظية.",
    features: ["تتبع رصيد كل محفظة لحظياً", "كشف حساب الحركات الإلكترونية", "معالجة عمولات التحويل المصرفي"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "FinTech Connect", securityLevel: "High Banking Grade" },
    mockType: "E_WALLETS_DASHBOARD"
  },
  {
    id: 21,
    title: "مطابقة كشوف الحسابات والمحافظ البنكية",
    category: "الخزينة والمحافظ",
    categoryKey: "TREASURY",
    moduleKey: "treasury",
    badge: "Smart Bank Reco",
    description: "استيراد كشوفات الحسابات البنكية ومطابقة المعاملات آلياً مع القيود الدفترية وكشف الفروقات.",
    features: ["مطابقة آلية بأرقام الحوالات", "تسوية المبالغ المعلقة", "تقرير تسوية البنك الشهري"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Reco AI Matcher", securityLevel: "Immutable Log" },
    mockType: "WALLET_RECONCILIATION"
  },
  {
    id: 22,
    title: "التحويل بين الصناديق والمحافظ والحسابات البنكية",
    category: "الخزينة والمحافظ",
    categoryKey: "TREASURY",
    moduleKey: "treasury",
    badge: "Internal Transfer",
    description: "نقل السيولة بين الخزائن والمصارف والمحافظ مع معالجة فروق أسعار صرف العملات تلقائياً.",
    features: ["قيد مزدوج للتحويل الفوري", "معالجة فوارق الصرف اللحظية", "تأكيد الاستلام من الطرفين"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Inter-Vault Engine", securityLevel: "Cryptographic Salt" },
    mockType: "WALLET_TRANSFER"
  },

  // القسم 5: المحاسبة والأستاذ العام (23-28)
  {
    id: 23,
    title: "دليل الحسابات الشجري غير المحدود (COA)",
    category: "المحاسبة والأستاذ العام",
    categoryKey: "ACCOUNTING",
    moduleKey: "accounting",
    badge: "IFRS Standard Tree",
    description: "شجرة الحسابات الهيكلية المتوافقة مع المعايير الدولية مع ترميز ذكي غير محدود وتحديد نوع وطبيعة كل حساب.",
    features: ["مستويات شجرية غير محدودة", "فصل الأصول والالتزامات والمصروفات", "تحديد العملات الافتراضية"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Tree Ledger v5", securityLevel: "Master Guard" },
    mockType: "CHART_OF_ACCOUNTS"
  },
  {
    id: 24,
    title: "قيد اليومية اليدوي متعدد العملات ومراكز التكلفة",
    category: "المحاسبة والأستاذ العام",
    categoryKey: "ACCOUNTING",
    moduleKey: "accounting",
    badge: "Balanced Double Entry",
    description: "شاشة إدخال القيود اليومية مع التحقق الفوري من توازن الطرفين (المدين والدائن) وربط كل سطر بمركز تكلفة.",
    features: ["توازن إجباري 100%", "دعم العملات المتعددة وفوارق الصرف", "إرفاق المستندات المؤيدة"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Double-Entry Kernel", securityLevel: "Strictly Sealed" },
    mockType: "JOURNAL_ENTRY_MANUAL"
  },
  {
    id: 25,
    title: "قيد اليومية الذكي بالنص الطبيعي (Prompt-to-Entry)",
    category: "المحاسبة والأستاذ العام",
    categoryKey: "ACCOUNTING",
    moduleKey: "accounting",
    badge: "AI Natural Language",
    description: "كتابة المعاملة باللغة العربية البسيطة ليقوم الذكاء الاصطناعي بتوليد القيد المحاسبي المتوازن فورياً.",
    features: ["فهم النصوص واللغة الطبيعية", "تحديد الحسابات تلقائياً من الشجرة", "شرح محاسبي متكامل لكل طرف"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Gemini 2.5 Pro", securityLevel: "Private AI VPC" },
    mockType: "JOURNAL_ENTRY_AI"
  },
  {
    id: 26,
    title: "قيد اليومية بالمساعد الصوتي الذكي",
    category: "المحاسبة والأستاذ العام",
    categoryKey: "ACCOUNTING",
    moduleKey: "accounting",
    badge: "Voice Recognition",
    description: "إملاء المعاملة المالية صوتياً بالهاتف أو الحاسوب لتحويلها بلحظات إلى قيد يومية محاسبي مدقق.",
    features: ["معالجة صوتية فورية باللغة العربية", "مطابقة أسماء الحسابات والعملات", "عرض المسودة قبل الترحيل"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Speech-to-Text Pro", securityLevel: "Encrypted Audio" },
    mockType: "VOICE_JOURNAL_ENTRY"
  },
  {
    id: 27,
    title: "ميزان المراجعة بالمجاميع والأرصدة (Trial Balance)",
    category: "المحاسبة والأستاذ العام",
    categoryKey: "ACCOUNTING",
    moduleKey: "accounting",
    badge: "Real-time Trial Balance",
    description: "توليد ميزان المراجعة اللحظي على مستوى أي فرع أو مركز تكلفة مع تفصيل الحركات والأرصدة الافتتاحية والنهائية.",
    features: ["مطابقة تامة للميزان", "حفر سريع (Drill-down) للأستاذ المساعد", "تصدير فوري للمعادلات"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Real-time Aggregate", securityLevel: "Read-only Cache" },
    mockType: "TRIAL_BALANCE"
  },
  {
    id: 28,
    title: "الميزانية العمومية والمركز المالي (Balance Sheet)",
    category: "المحاسبة والأستاذ العام",
    categoryKey: "ACCOUNTING",
    moduleKey: "accounting",
    badge: "IAS 1 Presentation",
    description: "عرض المركز المالي الشامل للمنشأة وفق المعايير المحاسبية مع مقارنة الفترات المالية السابقة والنسب المالية.",
    features: ["تصنيف الأصول المتداولة وغير المتداولة", "حساب حقوق الملكية والأرباح المحتجزة", "تحليل رأسمال العامل"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Financial Reporter Pro", securityLevel: "Certified Output" },
    mockType: "BALANCE_SHEET"
  },

  // القسم 6: التقارير المالية والضريبية (29-33)
  {
    id: 29,
    title: "قائمة الدخل والأرباح والخسائر (Income Statement)",
    category: "التقارير المالية والضريبية",
    categoryKey: "REPORTS",
    moduleKey: "reports",
    badge: "Profit & Loss",
    description: "بيان صافي المبيعات، تكلفة البضاعة المباعة (COGS)، المصروفات التشغيلية وصافي الأرباح للفترة.",
    features: ["حساب مجمل وصافي الربح بدقة", "مقارنة شهرية وربع سنوية", "تحليل هوامش الربحية بالنسبة المئوية"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "P&L Engine v4", securityLevel: "Financial Grade" },
    mockType: "INCOME_STATEMENT"
  },
  {
    id: 30,
    title: "قائمة التدفقات النقدية وفق المعيار (IAS 7 Cash Flow)",
    category: "التقارير المالية والضريبية",
    categoryKey: "REPORTS",
    moduleKey: "reports",
    badge: "IAS 7 Cash Flow",
    description: "تحليل السيولة النقدية من الأنشطة التشغيلية والاستثمارية والتمويلية لمعرفة حركة الأموال الفعلية.",
    features: ["الطريقة المباشرة وغير المباشرة", "تتبع التدفق النقدي الحر", "توقعات السيولة قصيرة المدى"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Cash Flow Engine", securityLevel: "Audit Logged" },
    mockType: "CASH_FLOW"
  },
  {
    id: 31,
    title: "تقرير وعاء الزكاة الشرعية للشركات",
    category: "التقارير المالية والضريبية",
    categoryKey: "REPORTS",
    moduleKey: "reports",
    badge: "Islamic Zakat 2.5%",
    description: "احتساب الوعاء الزكوي السنوي بدقة وفق الأحكام الشرعية المعتمدة (الأموال النامية، عروض التجارة، والديون المرجوة).",
    features: ["احتساب نصاب الزكاة والمقدار المستحق (2.5%)", "استبعاد الأصول الثابتة غير الخاضعة", "تقرير زكوي رسمي قابل للطباعة"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Zakat Standard v2", securityLevel: "Compliant" },
    mockType: "ZAKAT_REPORT"
  },
  {
    id: 32,
    title: "تقرير الإقرارات الضريبية والتدقيق المالي",
    category: "التقارير المالية والضريبية",
    categoryKey: "REPORTS",
    moduleKey: "reports",
    badge: "Tax Audit Ready",
    description: "كشف ضريبي متكامل يوضح ضريبة المبيعات والمشتريات والفروقات الواجب سدادها لمصلحة الضرائب.",
    features: ["فصل الضرائب المباشرة وغير المباشرة", "سجل الفواتير الضريبية المسلسلة", "تطابق المبيعات مع المشتريات"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Tax Compliance Kernel", securityLevel: "Govt Proof" },
    mockType: "TAX_AUDIT_REPORT"
  },
  {
    id: 33,
    title: "إقرار ضريبة القيمة المضافة (ZATCA VAT Return)",
    category: "التقارير المالية والضريبية",
    categoryKey: "REPORTS",
    moduleKey: "reports",
    badge: "ZATCA e-Invoicing Phase 2",
    description: "نموذج إقرار ضريبة القيمة المضافة 15% متوافق مع متطلبات هيئة الزكاة والضريبة والجمارك.",
    features: ["توليد ملف الإقرار الضريبي الرسمي", "مطابقة الفواتير الإلكترونية المعتمدة", "أرشفة مشفرة لجميع العمليات"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "ZATCA Gateway", securityLevel: "Cryptographic Seal" },
    mockType: "ZATCA_VAT_RETURN"
  },

  // القسم 7: الموارد البشرية والرواتب (34-39)
  {
    id: 34,
    title: "ملف الموظف الإلكتروني والبيانات الوظيفية",
    category: "الموارد البشرية والرواتب",
    categoryKey: "HR",
    moduleKey: "hr",
    badge: "Employee 360",
    description: "ملف شامل لبيانات الموظف، العقود، التأمينات، المستندات المرفقة، وتاريخ الترقيات والرواتب.",
    features: ["أرشفة الوثائق والهويات", "تتبع تواريخ انتهاء الإقامات والجوازات", "هيكل الرواتب والبدلات"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "HR Core v3", securityLevel: "GDPR Compliant" },
    mockType: "EMPLOYEE_RECORD"
  },
  {
    id: 35,
    title: "مسير الرواتب الشهري الآلي والتحويلات المصرفية",
    category: "الموارد البشرية والرواتب",
    categoryKey: "HR",
    moduleKey: "hr",
    badge: "Payroll Automation",
    description: "احتساب صافي الرواتب بضغطة زر مع البدلات والخصميات والسلف وتوليد القيود المحاسبية وملف البنك.",
    features: ["توليد قيود استحقاق الرواتب آلياً", "إصدار قسائم الرواتب الفردية (Payslip)", "ملف حماية الأجور المصرفي (WPS)"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Payroll Kernel v4", securityLevel: "AES-256 Vault" },
    mockType: "PAYROLL_RUN"
  },
  {
    id: 36,
    title: "سجل الحضور والانصراف والبصمة الإلكترونية",
    category: "الموارد البشرية والرواتب",
    categoryKey: "HR",
    moduleKey: "hr",
    badge: "Biometric Integration",
    description: "ربط أجهزة البصمة والورديات المرنة واحتساب ساعات العمل الإضافية والتأخير تلقائياً في مسير الراتب.",
    features: ["مزامنة مع أجهزة ZKTeco وغيرها", "معالجة الورديات المتعددة", "سجل الحركات اللحظية للموظفين"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Biometric Sync", securityLevel: "Secure API" },
    mockType: "ATTENDANCE_BIOMETRIC"
  },
  {
    id: 37,
    title: "إدارة الخصميات، السلف، والمكافآت",
    category: "الموارد البشرية والرواتب",
    categoryKey: "HR",
    moduleKey: "hr",
    badge: "Advance Loan Recovery",
    description: "جدولة أقساط السلف واستقطاعها التلقائي من راتب الموظف مع تسجيل المكافآت التشجيعية والجزاءات.",
    features: ["تتبع رصيد سلفة الموظف", "استقطاع آلي شهري", "موافقات إدارية مشفرة"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "HR Ledger", securityLevel: "Audited Action" },
    mockType: "DEDUCTIONS_ADVANCES"
  },
  {
    id: 38,
    title: "كشف حساب الموظف التفصيلي والعهد",
    category: "الموارد البشرية والرواتب",
    categoryKey: "HR",
    moduleKey: "hr",
    badge: "Staff Subledger",
    description: "كشف حساب مالي وإداري للموظف يوضح مستحقاته، السلف المتبقية، والعهد العينية المسلمة له.",
    features: ["جرد العهد العينية والأجهزة", "مطابقة المستحقات ونهاية الخدمة", "تصدير كشف الحساب بـ PDF"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Staff Ledger", securityLevel: "Private ACL" },
    mockType: "EMPLOYEE_STATEMENT"
  },
  {
    id: 39,
    title: "حساب مكافأة نهاية الخدمة والإجازات المستحقة",
    category: "الموارد البشرية والرواتب",
    categoryKey: "HR",
    moduleKey: "hr",
    badge: "Labor Law Compliant",
    description: "احتساب مخصصات نهاية الخدمة ورصيد الإجازات السنوية وفق قانون العمل اليمني والخليجي.",
    features: ["حساب المخصصات الدورية آلياً", "مخصص نهاية الخدمة الشهري", "تصفية الحساب عند الاستقالة"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Labor Law Rules", securityLevel: "Strictly Verified" },
    mockType: "PAYROLL_RUN"
  },

  // القسم 8: الأصول الثابتة (40-42)
  {
    id: 40,
    title: "سجل الأصول الثابتة والترميز بالباركود",
    category: "الأصول الثابتة والإهلاك",
    categoryKey: "ASSETS",
    moduleKey: "assets",
    badge: "IAS 16 Property, Plant & Equip",
    description: "تسجيل الأصول الرأسمالية والمباني والآلات مع تحديد المواقع، الموظف المسؤول، وتاريخ الشراء.",
    features: ["توليد ملصقات الباركود للأصل", "تحديد العمر الإنتاجي وقيمة الخردة", "ربط الأصل بمركز التكلفة"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Asset Life-Cycle", securityLevel: "Shield Locked" },
    mockType: "FIXED_ASSETS_REGISTRY"
  },
  {
    id: 41,
    title: "جدول الإهلاك التلقائي والقيود الدورية",
    category: "الأصول الثابتة والإهلاك",
    categoryKey: "ASSETS",
    moduleKey: "assets",
    badge: "Auto-Depreciation",
    description: "حساب إهلاك الأصول بطريقة القسط الثابت أو المتناقص وتوليد قيود مجمع الإهلاك والمصروف آلياً.",
    features: ["توليد قيود الإهلاك الشهرية والسنوية", "تتبع القيمة الدفترية المتبقية", "معالجة استبعاد أو بيع الأصل"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Depreciation Matrix", securityLevel: "Certified Math" },
    mockType: "DEPRECIATION_SCHEDULE"
  },
  {
    id: 42,
    title: "جدول الصيانة الوقائية والتكاليف الرأسمالية",
    category: "الأصول الثابتة والإهلاك",
    categoryKey: "ASSETS",
    moduleKey: "assets",
    badge: "Preventive Maintenance",
    description: "جدولة مواعيد صيانة الآلات والمركبات مع رسملة تكاليف الصيانة الكبرى وتحديث العمر الإنتاجي.",
    features: ["تنبيهات بمواعيد الصيانة الدورية", "تتبع تكلفة قطع الغيار", "تأثير الصيانة على قيمة الأصل"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Maintenance Log", securityLevel: "Role Gate" },
    mockType: "MAINTENANCE_SCHEDULE"
  },

  // القسم 9: الذكاء الاصطناعي والمستشار (43-47)
  {
    id: 43,
    title: "المستشار المالي الذكي (Gemini 2.5 Financial Advisor)",
    category: "الذكاء الاصطناعي والمستشار",
    categoryKey: "AI",
    moduleKey: "ai",
    badge: "Next-Gen AI Core",
    description: "مستشار مالي خبير يحلل الأداء اليومي ويقدم توصيات استراتيجية لخفض التكاليف وزيادة الأرباح.",
    features: ["تحليل القوائم المالية بلحظة واحدة", "اكتشاف المعاملات الشاذة وغير المبررة", "إجابة صوتية وكتابية على الأسئلة"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Gemini 2.5 Pro", securityLevel: "Air-Gapped Privacy" },
    mockType: "AI_FINANCIAL_ADVISOR"
  },
  {
    id: 44,
    title: "توليد القيود المحاسبية عبر الذكاء الاصطناعي",
    category: "الذكاء الاصطناعي والمستشار",
    categoryKey: "AI",
    moduleKey: "ai",
    badge: "AI Auto-Journal",
    description: "تحويل نصوص العقود والفواتير إلى قيود محاسبية مركبة متوازنة مع الشرح الآلي لكل حساب.",
    features: ["تفريغ العقود والفواتير الورقية", "مطابقة دليل الحسابات المعتمد", "شرح المعالجة المحاسبية بالأدلة"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Gemini 2.5 Flash", securityLevel: "AES-256 GCM" },
    mockType: "AI_PROMPT_ENTRY"
  },
  {
    id: 45,
    title: "المساعد الصوتي المحاسبي التفاعلي (Voice ERP)",
    category: "الذكاء الاصطناعي والمستشار",
    categoryKey: "AI",
    moduleKey: "ai",
    badge: "Voice Interactive",
    description: "إدارة النظام وإصدار الأوامر والاستعلام عن الأرصدة عبر المحادثة الصوتية الحية المباشرة.",
    features: ["استعلام صوتي عن الأرصدة والمبيعات", "إصدار أوامر فواتير سريعة بالصوت", "دعم اللهجات العربية واليمنية"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Live Audio API", securityLevel: "Zero Audio Retention" },
    mockType: "AI_VOICE_ASSISTANT"
  },
  {
    id: 46,
    title: "تحليل الربحية ونقاط التعادل التنبؤية",
    category: "الذكاء الاصطناعي والمستشار",
    categoryKey: "AI",
    moduleKey: "ai",
    badge: "Predictive Analytics",
    description: "دراسة هوامش الربحية لكل صنف وفرع وعميل مع تحديد نقطة التعادل (Break-Even) التقديرية.",
    features: ["تحليل ربحية المنتجات والخدمات", "مخططات بيانية تفاعلية متقدمة", "اقتراح تسعير ديناميكي ذكي"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Predictive ML v3", securityLevel: "Strict Tenant Isolated" },
    mockType: "PROFITABILITY_ANALYSIS"
  },
  {
    id: 47,
    title: "التنبؤ بالسيولة النقدية والمخاطر المالية",
    category: "الذكاء الاصطناعي والمستشار",
    categoryKey: "AI",
    moduleKey: "ai",
    badge: "Liquidity Forecast",
    description: "نمذجة التدفقات النقدية المستقبلية لـ 90 يوماً وتنبيه الإدارة مبكراً عند وجود فجوات في السيولة.",
    features: ["محاكاة السيناريوهات المالية (What-if)", "توقع مواعيد تحصيل المستحقات", "تجنب العجز النقدي مسبقاً"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Monte Carlo Simulator", securityLevel: "Certified Security" },
    mockType: "CASH_FLOW_FORECAST"
  },

  // القسم 10: المصروفات والإيرادات (48-50)
  {
    id: 48,
    title: "تسجيل المصروفات التشغيلية والمرفقات",
    category: "المصروفات والإيرادات",
    categoryKey: "EXPENSES",
    moduleKey: "expenses",
    badge: "Expense Control",
    description: "إدارة المصروفات اليومية والنثريات وتوزيعها على مراكز التكلفة والمشاريع مع إرفاق الفواتير المصورة.",
    features: ["تصنيف بنود المصروفات الشجرية", "مراقبة الحدود القصوى لكل بند", "إرفاق إيصالات المصروفات فورياً"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Expense Engine", securityLevel: "Encrypted Storage" },
    mockType: "EXPENSE_ENTRY"
  },
  {
    id: 49,
    title: "تسجيل الإيرادات المتنوعة وغير التشغيلية",
    category: "المصروفات والإيرادات",
    categoryKey: "EXPENSES",
    moduleKey: "expenses",
    badge: "Revenue Recognition",
    description: "توثيق عوائد الاستثمارات، إيرادات الإيجارات، والأرباح الرأسمالية وتوجيهها للحسابات المخصصة.",
    features: ["مطابقة معايير تحقق الإيراد IFRS 15", "تحديد فترات الاستحقاق", "توليد قيود الإيراد المؤجل"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Revenue Recognition", securityLevel: "Tamper Proof" },
    mockType: "REVENUE_ENTRY"
  },
  {
    id: 50,
    title: "مسار الموافقات الإلكتروني وسلسلة الاعتماد",
    category: "المصروفات والإيرادات",
    categoryKey: "EXPENSES",
    moduleKey: "expenses",
    badge: "Workflow Engine",
    description: "اعتماد طلبات الصرف والشراء وفق مصفوفة الصلاحيات (أمين الصندوق → المدير المالي → المدير العام).",
    features: ["إشعارات لحظية لمتخذي القرار", "سجل كامل لتاريخ كل اعتماد", "إمكانية الرفض مع ذكر السبب"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Approval Matrix v2", securityLevel: "Digital Signatures" },
    mockType: "APPROVAL_WORKFLOW"
  },

  // القسم 11: الموازنات التقديرية (51-52)
  {
    id: 51,
    title: "إعداد الموازنة التقديرية السنوية (Budget Plan)",
    category: "الموازنات التقديرية",
    categoryKey: "BUDGETS",
    moduleKey: "budgets",
    badge: "Master Budgeting",
    description: "تخطيط المصروفات والإيرادات التقديرية لكل حساب ومركز تكلفة على مدار الأشهر الـ 12 القادمة.",
    features: ["توزيع الموازنة على الفصول والشهور", "ربط الموازنة بمراكز التكلفة", "تحديد سقف الإنفاق لكل إدارة"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Budget Master v3", securityLevel: "Strict Control" },
    mockType: "BUDGET_SETUP"
  },
  {
    id: 52,
    title: "تحليل الفروقات بين الفعلي والتقديري (Variance)",
    category: "الموازنات التقديرية",
    categoryKey: "BUDGETS",
    moduleKey: "budgets",
    badge: "Variance Analytics",
    description: "مقارنة حية لحظية بين المصروفات الفعلية والمخططة ورصد التجاوزات بنسب مئوية ومخططات بيانية ملونة.",
    features: ["تنبيه عند اقتراب تجاوز الموازنة", "تحليل أسباب الانحرافات المالية", "تقرير شامل للإدارة التنفيذية"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Variance Analyzer", securityLevel: "Audited System" },
    mockType: "VARIANCE_ANALYSIS"
  },

  // القسم 12: الشراكات والشركاء (53-55)
  {
    id: 53,
    title: "إدارة الشركاء ورؤوس الأموال والحصص",
    category: "الشراكات والأرباح",
    categoryKey: "PARTNERS",
    moduleKey: "partners",
    badge: "Partners Equity",
    description: "تسجيل حصص الشركاء ورؤوس الأموال ومتابعة المسحوبات الشخصية وتغيرات حقوق الملكية.",
    features: ["حساب نسب الشراكة المئوية", "تتبع المسحوبات الشخصية لكل شريك", "أرشفة عقود التأسيس والتعديل"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Equity Master", securityLevel: "Master Grade" },
    mockType: "PARTNERS_MANAGEMENT"
  },
  {
    id: 54,
    title: "شاشة توزيع الأرباح السنوية والدورية",
    category: "الشراكات والأرباح",
    categoryKey: "PARTNERS",
    moduleKey: "partners",
    badge: "Profit Allocation",
    description: "احتساب الأرباح الصافية وتوزيعها على الشركاء بعد خصم الاحتياطي النظامي والمسحوبات الشخصية.",
    features: ["حساب الاحتياطي الإجباري والاختياري", "توليد قيود توزيع الأرباح آلياً", "ترحيل الأرصدة إلى حسابات الشركاء الجارية"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Profit Calculator", securityLevel: "Certified Vault" },
    mockType: "PROFIT_DISTRIBUTION"
  },
  {
    id: 55,
    title: "كشف الحساب الجاري للشريك وتفاصيل المسحوبات",
    category: "الشراكات والأرباح",
    categoryKey: "PARTNERS",
    moduleKey: "partners",
    badge: "Partner Current Account",
    description: "كشف حساب مالي تفصيلي لحركات جاري الشريك (مسحوبات، أرباح مرحلة، إيداعات إضافية).",
    features: ["كشف حركات تفصيلي بالتواريخ", "مطابقة رصيد رأس المال والجاري", "تصدير رسمي موثق"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Partner Subledger", securityLevel: "Confidential" },
    mockType: "PARTNER_STATEMENT"
  },

  // القسم 13: المنصة السحابية والسيادة (56-62 + 76-85)
  {
    id: 56,
    title: "لوحة إدارة الـ 200 منشأة المعزولة (SaaS Multi-Tenant)",
    category: "المنصة السحابية والسيادة",
    categoryKey: "CLOUD",
    moduleKey: "cloud",
    badge: "200 Isolated Tenants",
    description: "تحكم مركزي لإدارة أكثر من 200 منشأة وشركة مع العزل التام لقواعد البيانات ومفاتيح التشفير.",
    features: ["عزل بيانات كامل 100%", "تخصيص الهوية والشعار لكل شركة", "لوحة تحكم للمدير العام بدر عايض"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Multi-Tenant Core v4", securityLevel: "Military AES-256" },
    mockType: "TENANT_MANAGEMENT_200"
  },
  {
    id: 57,
    title: "خريطة الجلسات النشطة والمراقبة اللحظية",
    category: "المنصة السحابية والسيادة",
    categoryKey: "CLOUD",
    moduleKey: "cloud",
    badge: "Live Session Guard",
    description: "متابعة جميع المستخدمين المتصلين لحظياً وتحديد مواقعهم ونوع الأجهزة وإمكانية إنهاء الجلسة فورياً.",
    features: ["رصد عناوين الـ IP والموقع الجغرافي", "إنهاء الجلسات المشبوهة بضغطة زر", "حماية من تسجيل الدخول المتزامن غير المصرح"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Session Monitor Pro", securityLevel: "Zero Trust" },
    mockType: "ACTIVE_SESSIONS_MAP"
  },
  {
    id: 58,
    title: "سجل التدقيق الأمني ومكافحة الاختراق (Audit Log)",
    category: "المنصة السحابية والسيادة",
    categoryKey: "CLOUD",
    moduleKey: "cloud",
    badge: "Immutable Audit Trail",
    description: "توثيق مشفر لكافة الحركات والتعديلات والعمليات المالية مع تسجيل هوية المستخدم والتوقيت وجهاز الاتصال.",
    features: ["سجل غير قابل للتعديل أو الحذف", "تنبيهات فورية بمحاولات التلاعب", "تصدير تقارير المراجعة والتدقيق"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Audit Blockchain-Grade", securityLevel: "Tamper Proof" },
    mockType: "AUDIT_LOG_STREAM"
  },
  {
    id: 59,
    title: "محرك عزل قواعد البيانات السحابية (Tenant Isolation)",
    category: "المنصة السحابية والسيادة",
    categoryKey: "CLOUD",
    moduleKey: "cloud",
    badge: "Sovereign Cloud Data",
    description: "محرك برمجي يضمن استحالة تسريب أو تداخل بيانات أي شركة مع شركة أخرى عبر مساحات تخزين مستقلة.",
    features: ["تشفير خاص لكل منشأة", "سيادة تامة على البيانات", "نسخ احتياطي سحابي مستقل"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Data Isolation Kernel", securityLevel: "Tier-4 Bank Standard" },
    mockType: "TENANT_ISOLATION_ENGINE"
  },
  {
    id: 60,
    title: "لوحة الإدارة العليا السيادية (Master Platform)",
    category: "المنصة السحابية والسيادة",
    categoryKey: "CLOUD",
    moduleKey: "cloud",
    badge: "Sovereign Control",
    description: "بوابة القيادة والتحكم الشاملة لإدارة الاشتراكات، الصلاحيات، مراقبة الخوادم، وتحديثات النظام المركزية.",
    features: ["مراقبة أداء الخوادم السحابية", "إدارة تراخيص المنشآت", "تفعيل وتعطيل الميزات بلحظة"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Master Platform v5", securityLevel: "Supreme Admin Mode" },
    mockType: "MASTER_ADMIN_PLATFORM"
  },

  // القسم 14: الفواتير والسندات المطبوعة والحرارية (66-75)
  {
    id: 61,
    title: "فاتورة المبيعات الضريبية A4 مع الرمز المشفر",
    category: "الفواتير والسندات المطبوعة",
    categoryKey: "PRINTED",
    moduleKey: "printed",
    badge: "Official Tax A4",
    description: "تصميم طباعة معتمد للفاتورة الضريبية الرسمية A4 يشتمل على جدول الأصناف والضريبة والباركود المشفر.",
    features: ["طباعة عالية الدقة متوافقة مع جميع الطابعات", "دعم الشعار والختم والتوقيع", "تنسيق مالي وأرقام تفقيطية بالعربية"],
    specs: { resolution: "2480x3508 A4 HD", format: "Vector SVG", engine: "Print Master Pro", securityLevel: "Verified Hash" },
    mockType: "PRINTED_A4_TAX"
  },
  {
    id: 62,
    title: "إيصال نقاط البيع الحراري 80mm مع QR Code",
    category: "الفواتير والسندات المطبوعة",
    categoryKey: "PRINTED",
    moduleKey: "printed",
    badge: "80mm POS Thermal",
    description: "إيصال كاشير سريع وموجز للطابعات الحرارية مع QR Code مشفر وفق مواصفات هيئة الزكاة والضريبة.",
    features: ["طباعة فورية بكسور الثانية", "دعم طابعات البلوتوث والـ USB", "تصميم منظم وسهل القراءة"],
    specs: { resolution: "80mm Thermal Vector", format: "Direct ESC/POS", engine: "Thermal Print Kernel", securityLevel: "ZATCA Compliant" },
    mockType: "THERMAL_80MM_RECEIPT"
  },
  {
    id: 63,
    title: "فاتورة الزكاة والدخل الإلكترونية المشفرة ZATCA",
    category: "الفواتير والسندات المطبوعة",
    categoryKey: "PRINTED",
    moduleKey: "printed",
    badge: "Phase 2 Cryptographic Stamp",
    description: "فاتورة رسمية مشفرة بختم رقمي غير قابل للتزوير مع التحقق الفوري من صحة الفاتورة عبر تطبيق الجوال.",
    features: ["تشفير Base64 ومعايير TLV", "تضمين الرقم الضريبي والتوقيت بالثواني", "مطابقة الفحص الميداني"],
    specs: { resolution: "Vector SVG", format: "ZATCA Phase 2", engine: "Crypto Stamp v2", securityLevel: "Digital Cert" },
    mockType: "QR_ZATCA_INVOICE"
  },
  {
    id: 64,
    title: "سند القبض المالي المطبوع مع الختم الرقمي",
    category: "الفواتير والسندات المطبوعة",
    categoryKey: "PRINTED",
    moduleKey: "printed",
    badge: "Official Cash Receipt",
    description: "نموذج طباعة سند القبض متضمناً اسم المستلم، المبلغ كتابة ورقماً، الحساب المودع فيه، وتوقيع أمين الصندوق.",
    features: ["تفقيط المبالغ بالريال والدولار والريال السعودي", "مكان مخصص للأختام الرسمية", "نسخة للمستلم ونسخة للأرشيف"],
    specs: { resolution: "A5 / A4 Vector", format: "High-Res PDF", engine: "Voucher Print Engine", securityLevel: "Anti-Counterfeit" },
    mockType: "PRINTED_RECEIPT_VOUCHER"
  },
  {
    id: 65,
    title: "سند الصرف المالي المطبوع مع اعتمادات الإدارة",
    category: "الفواتير والسندات المطبوعة",
    categoryKey: "PRINTED",
    moduleKey: "printed",
    badge: "Official Payment Voucher",
    description: "سند صرف مطبوع يوثق المبالغ المنصرفة مع خانات الاعتماد (المحاسب، المدير المالي، المستلم).",
    features: ["توثيق طريقة الصرف (نقداً / شيك / حوالة)", "تأصيل محاسبي للطرف المدين والدائن", "باركود تتبع سريع للسند"],
    specs: { resolution: "A5 / A4 Vector", format: "High-Res PDF", engine: "Voucher Print Engine", securityLevel: "Anti-Counterfeit" },
    mockType: "PRINTED_PAYMENT_VOUCHER"
  },

  // القسم 15: التطبيقات والأجهزة (86-90 + إضافي)
  {
    id: 66,
    title: "تطبيق الأندرويد والهواتف الذكية (Android Companion)",
    category: "التطبيقات والأجهزة",
    categoryKey: "DEVICES",
    moduleKey: "devices",
    badge: "Native Android App",
    description: "تطبيق سلس وخفيف للمناديب والمبيعات الميدانية مع دعم الباركود عبر كاميرا الهاتف والطباعة عبر البلوتوث.",
    features: ["فواتير سريعة بالهاتف", "ماسح باركود ذكي بالكاميرا", "تحديد مواقع العملاء بنظام GPS"],
    specs: { resolution: "1080x2400 Mobile", format: "WebP / Android", engine: "Kotlin / PWA Hybrid", securityLevel: "Biometric Lock" },
    mockType: "APP_ANDROID_MOBILE"
  },
  {
    id: 67,
    title: "تطبيق الآيفون والـ iOS للأجهزة اللوحية",
    category: "التطبيقات والأجهزة",
    categoryKey: "DEVICES",
    moduleKey: "devices",
    badge: "iOS & iPad Pro",
    description: "واجهة فائقة الانسيابية مصممة خصيصاً لشاشات أبل اللمسية لمتابعة لوحات التحكم والتقارير التنفيذية.",
    features: ["دعم إيماءات اللمس السريعة", "إشعارات تنبيهية فورية", "لوحة تحكم تنفيذية للإدارة العليا"],
    specs: { resolution: "1170x2532 iOS", format: "WebP / Retina", engine: "Swift / WebKit Engine", securityLevel: "FaceID Integration" },
    mockType: "APP_IOS_MOBILE"
  },
  {
    id: 68,
    title: "واجهة النظام بالوضع الليلي الفاخر (Dark Mode)",
    category: "التطبيقات والأجهزة",
    categoryKey: "DEVICES",
    moduleKey: "devices",
    badge: "OLED Midnight Theme",
    description: "تصميم داكن أنيق مريح للعينين خلال العمل الليلي المطول مع تباين ألوان عالي ومظهر فخم.",
    features: ["تقليل إجهاد العينين", "توفير استهلاك الطاقة لشاشات OLED", "ألوان محاسبية واضحة بدقة عالية"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Tailwind Dark Kernel", securityLevel: "Eye-Safe Standard" },
    mockType: "APP_DARK_MODE"
  },
  {
    id: 69,
    title: "محرر الثيمات وتخصيص هوية المنشأة (Theme Customizer)",
    category: "التطبيقات والأجهزة",
    categoryKey: "DEVICES",
    moduleKey: "devices",
    badge: "Custom Branding",
    description: "إمكانية اختيار الألوان المؤسسية والشعار ونمط الخطوط ليتناسب مظهر النظام مع الهوية البصرية لشركتك.",
    features: ["اختيار ألوان العلامة التجارية", "تغيير الشعار والهيدر", "حفظ وتطبيق الثيم فورياً"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Theme Engine Pro", securityLevel: "Isolated Preference" },
    mockType: "THEME_EDITOR"
  },
  {
    id: 70,
    title: "شاشة الدخول السيادية للمنشآت (Tenant Portal)",
    category: "لوحات التحكم والمميزات",
    categoryKey: "PRO_VIEWS",
    moduleKey: "pro_views",
    badge: "Sovereign Login",
    description: "بوابة دخول مؤسسية مشفرة بـ AES-256 تدعم الدخول بالبريد المؤسسي، المصادقة الثنائية 2FA، واختيار الفرع.",
    features: ["حماية من هجمات التخمين (5 محاولات)", "فحص reCAPTCHA v3", "دعم الدخول الموحد Google SSO"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Security Portal v5", securityLevel: "AES-256 GCM + PBKDF2" },
    mockType: "LOGIN_PORTAL_VIEW"
  },
  {
    id: 71,
    title: "لوحة التحكم التنفيذية الشاملة (Executive Dashboard)",
    category: "لوحات التحكم والمميزات",
    categoryKey: "PRO_VIEWS",
    moduleKey: "pro_views",
    badge: "C-Level Executive View",
    description: "رؤية بانورامية لجميع مؤشرات الأداء المالي والتشغيلي (KPIs)، الإيرادات، الأرباح، والسيولة اللحظية.",
    features: ["رسوم بيانية حية ومؤشرات تفاعلية", "مقارنة المبيعات بين الفروع", "تحديث لحظي دون إعادة تحميل"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Recharts & D3 Pro", securityLevel: "Role Gate" },
    mockType: "DASHBOARD_EXECUTIVE"
  },
  {
    id: 72,
    title: "القائمة الجانبية الذكية والتنقل السريع (Sidebar)",
    category: "لوحات التحكم والمميزات",
    categoryKey: "PRO_VIEWS",
    moduleKey: "pro_views",
    badge: "Ergonomic Navigation",
    description: "قائمة جانبية انسيابية مقسمة حسب الصلاحيات والوحدات مع بحث فوري واختصارات لوحة المفاتيح.",
    features: ["تنقل فوري بين الشاشات", "عرض الصلاحيات حسب دور المستخدم", "شريط بحث سريع عن أي حركة أو تقرير"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Nav Core Pro", securityLevel: "Strict ACL" },
    mockType: "SIDEBAR_NAVIGATION"
  },
  {
    id: 73,
    title: "إدارة الفروع والمستودعات المتعددة (Multi-Branch)",
    category: "لوحات التحكم والمميزات",
    categoryKey: "PRO_VIEWS",
    moduleKey: "pro_views",
    badge: "Consolidated Branches",
    description: "ربط وإدارة فروع الشركة في مختلف المدن مع توحيد القوائم المالية أو فصلها حسب الطلب.",
    features: ["تحديد صلاحيات المستخدم لكل فرع", "تقارير مالية مجمعة أو منفصلة", "تحويلات مخزنية ومالية بين الفروع"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Branch Router", securityLevel: "Branch Isolation" },
    mockType: "BRANCH_MANAGEMENT"
  },
  {
    id: 74,
    title: "شاشة تسجيل المنشأة الجديدة وبدء التجربة المجانية",
    category: "لوحات التحكم والمميزات",
    categoryKey: "PRO_VIEWS",
    moduleKey: "pro_views",
    badge: "Instant SaaS Onboarding",
    description: "معالج تفعيل منشأة جديدة في أقل من 60 ثانية مع بناء شجرة الحسابات والبيئة السحابية فورياً.",
    features: ["إعداد تلقائي لشجرة الحسابات والعملات", "تجربة مجانية فورية", "بيئة معزولة تماماً"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Onboarding Provisioner", securityLevel: "Sandboxed" },
    mockType: "SAAS_REGISTER_MODAL"
  },
  {
    id: 75,
    title: "شاشة انتظار الموافقة والتحقق من الهوية (Pending Approval)",
    category: "لوحات التحكم والمميزات",
    categoryKey: "PRO_VIEWS",
    moduleKey: "pro_views",
    badge: "Security Verification",
    description: "شاشة آمنة لإشعار العميل بحالة طلب الاشتراك وتأكيد تدقيق الهوية من قِبل إدارة MeDo ERP.",
    features: ["رقم تتبع آلي للطلب", "إشعار فوري عبر البريد والواتساب", "قفل آمن حتى الموافقة الرسمية"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "KYC Validator", securityLevel: "Zero Trust" },
    mockType: "PENDING_APPROVAL_SCREEN"
  },
  {
    id: 76,
    title: "المصادقة الثنائية المشفرة (Two-Factor Authentication 2FA)",
    category: "لوحات التحكم والمميزات",
    categoryKey: "PRO_VIEWS",
    moduleKey: "pro_views",
    badge: "2FA Security Guard",
    description: "طبقة حماية إضافية تطلب رمز الأمان المكون من 6 أرقام للوصول إلى الحسابات الإدارية والمالية الحساسة.",
    features: ["توليد رموز مؤقتة TOTP", "حماية من سرقة كلمات المرور", "إشعار أمني عند تسجيل الدخول من جهاز جديد"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "TOTP / PBKDF2", securityLevel: "Tier-1 Fortress" },
    mockType: "TWO_FACTOR_AUTH_SCREEN"
  },
  {
    id: 77,
    title: "إدارة المهام المحاسبية والتنبيهات المجدولة",
    category: "لوحات التحكم والمميزات",
    categoryKey: "PRO_VIEWS",
    moduleKey: "pro_views",
    badge: "Accounting Tasks Board",
    description: "لوحة كانبان تفاعلية لتعيين المهام المحاسبية، متابعة إغلاق الفترات، ومراجعة تسويات الإقرارات.",
    features: ["تعيين المهام للمحاسبين مع المواعيد النهائية", "تتبع نسبة الإنجاز اليومي", "إشعارات تذكيرية آلية"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Task Flow Pro", securityLevel: "Team ACL" },
    mockType: "TASK_MANAGEMENT_BOARD"
  },
  {
    id: 78,
    title: "معالج الإعداد الأولي للمنشأة (Onboarding Wizard)",
    category: "لوحات التحكم والمميزات",
    categoryKey: "PRO_VIEWS",
    moduleKey: "pro_views",
    badge: "Zero-Config Setup",
    description: "خطوات إرشادية مبسطة لتهيئة الفروع، الصناديق، المستودعات، واستيراد بيانات العملاء والأصناف من Excel.",
    features: ["استيراد سريع لقوائم Excel", "اختيار قالب النشاط التجاري", "جاهزية فورية للعمل خلال دقائق"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Import Pipeline Pro", securityLevel: "Validated Schema" },
    mockType: "ONBOARDING_WIZARD"
  },
  {
    id: 79,
    title: "عرض النظام على الشاشات الكبيرة وفائقة الدقة 4K",
    category: "التطبيقات والأجهزة",
    categoryKey: "DEVICES",
    moduleKey: "devices",
    badge: "Desktop 4K Precision",
    description: "استغلال كامل لمساحة الشاشات العريضة لعرض عدة لوحات محاسبية وتقارير متزامنة جنباً إلى جنب.",
    features: ["تصميم شبكي متعدد النوافذ (Multi-Panel)", "دقة تفاصيل عالية", "أداء فائق السرعة"],
    specs: { resolution: "3840x2160 4K UHD", format: "Vector", engine: "Fluid CSS Grid", securityLevel: "Standard" },
    mockType: "DESKTOP_4K_VIEW"
  },
  {
    id: 80,
    title: "عرض نقاط البيع على الأجهزة اللوحية (Tablet POS)",
    category: "التطبيقات والأجهزة",
    categoryKey: "DEVICES",
    moduleKey: "devices",
    badge: "Touchscreen POS Optimized",
    description: "واجهة لمسية متطورة مصممة للمطاعم والمحلات التجارية على أجهزة الآيباد والتابلت.",
    features: ["أزرار مبيعات كبيرة مريحة للمس", "تقسيم وتجميع الفواتير بلمسة", "دعم درج النقود والطابعة"],
    specs: { resolution: "2048x1536 iPad Retina", format: "Vector", engine: "Touch Core v3", securityLevel: "POS Terminal Key" },
    mockType: "TABLET_POS_VIEW"
  },
  {
    id: 81,
    title: "تطبيق الويب التقدمي (Progressive Web App - PWA)",
    category: "التطبيقات والأجهزة",
    categoryKey: "DEVICES",
    moduleKey: "devices",
    badge: "Installable PWA",
    description: "تثبيت النظام كتطبيق أصلي على أي حاسوب أو جوال دون الحاجة للتحميل من متاجر التطبيقات وبحجم خفيف جداً.",
    features: ["تثبيت فوري بضغطة زر واحدة", "أداء فائق مع استهلاك شبه منعدم للمساحة", "تحديث تلقائي لحظي"],
    specs: { resolution: "Responsive Multi-View", format: "PWA Service Worker", engine: "Vite PWA Core", securityLevel: "TLS 1.3 Certified" },
    mockType: "MOBILE_PWA_VIEW"
  },
  {
    id: 82,
    title: "تطبيق التوزيع والمبيعات الميدانية (APK Companion)",
    category: "التطبيقات والأجهزة",
    categoryKey: "DEVICES",
    moduleKey: "devices",
    badge: "Field Sales APK",
    description: "حل متكامل لسيارات التوزيع ومندوبي المبيعات لطباعة الفواتير وتحصيل الأموال ومزامنتها مع الإدارة المركزية.",
    features: ["تتبع خطوط سير المناديب", "تحصيل الأقساط وتسجيل سندات القبض", "مزامنة آلية عند توفر الإنترنت"],
    specs: { resolution: "1080x2400 Android", format: "APK / Hybrid", engine: "Field Distribution v2", securityLevel: "Encrypted Cache" },
    mockType: "APK_COMPANION_VIEW"
  },
  {
    id: 83,
    title: "المزامنة الذكية بدون اتصال (Offline-First Architecture)",
    category: "المنصة السحابية والسيادة",
    categoryKey: "CLOUD",
    moduleKey: "cloud",
    badge: "Offline-First Engine",
    description: "العمل دون انقطاع حتى في أسوأ ظروف انقطاع الإنترنت، مع خوارزميات معالجة التعارض التلقائية عند عودة الشبكة.",
    features: ["حفظ العمليات في قاعدة بيانات IndexedDB المحلية", "مزامنة خلفية ذكية دون تعطيل العمل", "حماية البيانات من الفقدان"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "CRDT Sync Kernel", securityLevel: "Local AES Encryption" },
    mockType: "OFFLINE_FIRST_SYNC"
  },
  {
    id: 84,
    title: "معالجة فوارق العملة اليمنية (صنعاء / عدن / دولي)",
    category: "التقارير المالية والضريبية",
    categoryKey: "REPORTS",
    moduleKey: "reports",
    badge: "Yemeni Currency Differential",
    description: "محرك محاسبي متطور مخصص للسوق اليمني يعالج الفوارق اللحظية بين الريال القديم والجديد والدولار والريال السعودي.",
    features: ["تحديث تلقائي لأسعار الصرف اليومية", "تسجيل أرباح وخسائر فروق العملة آلياً", "تقارير حسابية مفصلة بكل عملة"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Currency Dual-Rate v4", securityLevel: "Banking Precision" },
    mockType: "CURRENCY_DIFFERENTIALS"
  },
  {
    id: 85,
    title: "مراكز التكلفة ثلاثية الأبعاد والمشاريع (Cost Centers 3D)",
    category: "المحاسبة والأستاذ العام",
    categoryKey: "ACCOUNTING",
    moduleKey: "accounting",
    badge: "3D Cost Allocation",
    description: "توزيع المصروفات والإيرادات على المشاريع، الأقسام، والمندوبين بدقة لمعرفة ربحية كل مشروع على حدة.",
    features: ["هيكل شجري لمراكز التكلفة", "تحليل ربحية وخسارة كل مشروع", "توزيع تلقائي بالنسب المئوية"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Cost Allocator 3D", securityLevel: "Protected Ledger" },
    mockType: "COST_CENTERS_3D"
  },
  {
    id: 86,
    title: "توحيد القوائم المالية للفروع والشركات القابضة",
    category: "التقارير المالية والضريبية",
    categoryKey: "REPORTS",
    moduleKey: "reports",
    badge: "Consolidation IFRS 10",
    description: "إصدار ميزانية عمومية وقائمة دخل موحدة للمجموعة والشركات التابعة مع استبعاد المعاملات البينية (Intercompany).",
    features: ["مطابقة المعيار الدولي IFRS 10", "استبعاد الأرصدة البينية آلياً", "تحليل مساهمة كل فرع في الأرباح"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Group Consolidation", securityLevel: "Supreme Level" },
    mockType: "MULTI_BRANCH_CONSOLIDATION"
  },
  {
    id: 87,
    title: "درع الأمان السيادي المشفر (Security Shield & Vault)",
    category: "المنصة السحابية والسيادة",
    categoryKey: "CLOUD",
    moduleKey: "cloud",
    badge: "Military AES-256 Vault",
    description: "طبقات الحماية الفائقة التي تحمي بيانات المنشأة من الاختراق، برمجيات الفدية، ومحاولات التسلل غير المصرح بها.",
    features: ["تشفير كامل لقواعد البيانات والنسخ الاحتياطي", "حماية الجلسات والاتصالات بتشفير TLS 1.3", "فحص دوري للثغرات الأمنية"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "MeDo Guard Shield", securityLevel: "Military Grade" },
    mockType: "SECURITY_SHIELD_VAULT"
  },
  {
    id: 88,
    title: "الختم والتوقيع الإلكتروني المعتمد للمستندات",
    category: "الفواتير والسندات المطبوعة",
    categoryKey: "PRINTED",
    moduleKey: "printed",
    badge: "Digital Signature & Stamp",
    description: "إضافة ختم الشركة الرسمي وتوقيع المفوضين إلكترونياً على الفواتير والسندات والتقارير المالية لمنع تزويرها.",
    features: ["تشفير الختم الرقمي لمنع نسخه", "تحديد المستخدم الذي قام بالاعتماد", "إمكانية التحقق من صحة المستند"],
    specs: { resolution: "Vector HD", format: "Digital Crypto Stamp", engine: "E-Signature Pro", securityLevel: "Certified Valid" },
    mockType: "ELECTRONIC_STAMP_SIGN"
  },
  {
    id: 89,
    title: "النسخ الاحتياطي السحابي والاستعادة الفورية",
    category: "المنصة السحابية والسيادة",
    categoryKey: "CLOUD",
    moduleKey: "cloud",
    badge: "Automated Cloud Backup",
    description: "نسخ احتياطي تلقائي مشفر كل 6 ساعات مع إمكانية استعادة البيانات بضغطة زر واحدة أو تنزيل نسخة محلية.",
    features: ["نسخ احتياطي سحابي متعدد الخوادم", "تنزيل نسخة مشفرة مضغوطة", "استعادة سريعة خلال دقائق معدودة"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "Backup Vault Daemon", securityLevel: "Redundant Geo-Storage" },
    mockType: "BACKUP_RESTORE_CLOUD"
  },
  {
    id: 90,
    title: "بوابة الربط البرمجي وواجهات API المؤسسية (API Gateway)",
    category: "المنصة السحابية والسيادة",
    categoryKey: "CLOUD",
    moduleKey: "cloud",
    badge: "Enterprise REST API",
    description: "ربط MeDo ERP مع المتاجر الإلكترونية، بوابات الدفع، وتطبيقات الطرف الثالث عبر واجهات REST API آمنة وموثقة.",
    features: ["مفاتيح API مشفرة ومحددة الصلاحيات", "توثيق شامل Swagger / Postman", "ربط مع منصات سلة، زد، وشوبيفاي"],
    specs: { resolution: "1920x1080 FHD", format: "WebP / Vector", engine: "FastAPI / Node Gateway", securityLevel: "OAuth2 & API Keys" },
    mockType: "ENTERPRISE_API_GATEWAY"
  }
];
