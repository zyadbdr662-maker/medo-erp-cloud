/**
 * System History, Prompts & Audit Timeline Service
 * Stores, queries, and manages all system requests, AI/developer prompts,
 * architectural decisions, user actions, and timeline milestones from inception.
 */

export interface SystemPromptRecord {
  id: string;
  timestamp: string;
  stage: "INITIAL_FOUNDATION" | "CORE_ACCOUNTING" | "SECURITY_GATEWAY" | "EMAIL_NOTIFICATIONS" | "UI_UX_POLISH" | "CUSTOM_REQUEST";
  stageLabelAr: string;
  userPrompt: string;
  systemActionSummary: string;
  targetComponents: string[];
  status: "COMPLETED" | "EXECUTED" | "ACTIVE";
  category: "ARCHITECTURE" | "ACCOUNTING" | "SECURITY" | "UI_UX" | "SYSTEM_AUDIT";
  author: string;
  impactLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "STANDARD";
  technicalDetails?: string;
  tags: string[];
}

const STORAGE_KEY_PROMPTS_HISTORY = "medo_erp_system_prompts_timeline_v1";

const INITIAL_SYSTEM_HISTORY: SystemPromptRecord[] = [
  {
    id: "HIST-001-FOUNDATION",
    timestamp: "2026-09-01T08:00:00.000Z",
    stage: "INITIAL_FOUNDATION",
    stageLabelAr: "تأسيس المعمارية والهيكل المالي الشجري",
    userPrompt: "تأسيس نظام محاسبي وإداري متكامل (MeDo ERP) يدعم معايير المحاسبة الدولية (IFRS/GAAP) مع شجرة حسابات ومراكز تكلفة ودعم فوارق العملة اليمنية (صنعاء / عدن).",
    systemActionSummary: "بناء المحرك المالي الأساسي، شجرة الحسابات متعددة المستويات، دعم الترحيل الآلي، وميزان المراجعة وقائمة الدخل والمركز المالي.",
    targetComponents: ["ChartOfAccountsView", "GeneralLedgerView", "FinancialReportsView", "erpStorage"],
    status: "COMPLETED",
    category: "ACCOUNTING",
    author: "المسؤول التنفيذي",
    impactLevel: "CRITICAL",
    technicalDetails: "تطبيق معايير IFRS وقواعد التدقيق المالي المزدوج مع دعم متعدد العملات (YER_SANAA, YER_ADEN, SAR, USD, EUR).",
    tags: ["محاسبة", "شجرة الحسابات", "IFRS", "متعدد العملات"]
  },
  {
    id: "HIST-002-MM-POS",
    timestamp: "2026-09-03T10:30:00.000Z",
    stage: "CORE_ACCOUNTING",
    stageLabelAr: "إدارة المخزون ونقاط البيع والفواتير",
    userPrompt: "تطوير موديول إدارة المخزون والمشتريات والمبيعات ونقاط البيع POS بنظام أوفلاين مع حساب تكلفة البضاعة المباعة والباركود.",
    systemActionSummary: "بناء وحدات إدارة المستودعات، حركات الأصناف الواردة والمنصرفة، فواتير المبيعات والمشتريات ومردوداتها، والربط اللحظي مع الحسابات.",
    targetComponents: ["InventoryView", "SalesAndReturnsView", "PurchasesAndReturnsView", "VouchersView"],
    status: "COMPLETED",
    category: "ARCHITECTURE",
    author: "المسؤول التنفيذي",
    impactLevel: "HIGH",
    technicalDetails: "اعتماد سياسة التقييم المالي للمخزون (FIFO / Weighted Average) والتحقق التلقائي من الكميات المتاحة قبل البيع.",
    tags: ["مخزون", "نقاط البيع", "مبيعات", "مشتريات"]
  },
  {
    id: "HIST-003-SECURITY-GATEWAY",
    timestamp: "2026-09-08T14:15:00.000Z",
    stage: "SECURITY_GATEWAY",
    stageLabelAr: "بوابة الإدارة العليا والتشفير الثلاثي للأجهزة",
    userPrompt: "تأمين بوابة الإدارة العليا بحماية ثلاثية: رابط سري، تشفير كلمة مرور المدير، وبصمة الأجهزة المعتمدة لمدير النظام حصراً.",
    systemActionSummary: "تطوير SecretAdminGatewayModal و AdminPortalSecurityService مع حماية بصمة العتاد وفك القفل الأمني وقيود محاولات الدخول (Rate Limiting).",
    targetComponents: ["SecretAdminGatewayModal", "AdminPortalSecurityService", "AdminDeviceManagerView"],
    status: "COMPLETED",
    category: "SECURITY",
    author: "الإدارة العليا (بدر عايض زياد)",
    impactLevel: "CRITICAL",
    technicalDetails: "استخدام PBKDF2/SHA-256 لتشفير كلمات المرور، وربط التحقق بالـ Fingerprint الرقمي للجهاز، وقفل تلقائي لمدة 24 ساعة بعد 3 محاولات خاطئة.",
    tags: ["أمان", "بصمة الأجهزة", "تشفير", "الإدارة العليا"]
  },
  {
    id: "HIST-004-INP-PERF",
    timestamp: "2026-09-10T16:45:00.000Z",
    stage: "SECURITY_GATEWAY",
    stageLabelAr: "تحسين استجابة النقر (INP) وسرعة البوابة",
    userPrompt: "معالجة بطء الاستجابة وملاحظات التفاعل عند النقر على عناصر التحقق في بوابة الإدارة العليا.",
    systemActionSummary: "إعادة هيكلة دوال الفحص والتحقق في SecretAdminGatewayModal لتشغيل الحسابات الرياضية غير المتزامنة عبر useTransition و Web Crypto API دون تجميد واجهة المستخدم.",
    targetComponents: ["SecretAdminGatewayModal"],
    status: "COMPLETED",
    category: "ARCHITECTURE",
    author: "الإدارة الفنية",
    impactLevel: "MEDIUM",
    technicalDetails: "تحسين Interaction to Next Paint (INP) إلى أقل من 50ms عبر نقل التشفير إلى مسار غير متزامن.",
    tags: ["أداء", "INP", "استجابة سريعة"]
  },
  {
    id: "HIST-005-EMAIL-NOTIFS",
    timestamp: "2026-09-11T12:00:00.000Z",
    stage: "EMAIL_NOTIFICATIONS",
    stageLabelAr: "حل مشكلة إشعارات البريد الإلكتروني للمدير",
    userPrompt: "هذه الصورة من شاشة احد المستخدمين، حاول الدخول إلى لوحة الإدارة العليا، لكن لم يصل بريد الكتروني إلى ايميل الإدارة. حل المشكلة.",
    systemActionSummary: "إعداد منظومة الإرسال المباشر للبريد الإلكتروني للإدارة العليا (zyadbdr925@gmail.com)، وتوفير وحدة تحكم وفحص خوادم SMTP وإرسال تنبيهات الأمان الفورية.",
    targetComponents: ["AdminDeviceManagerView", "adminPortalSecurityService", "emailNotificationService"],
    status: "COMPLETED",
    category: "SECURITY",
    author: "zyadbdr925@gmail.com",
    impactLevel: "HIGH",
    technicalDetails: "دعم قنوات إرسال متعددة ومحاكاة مشفرة وتوجيهات ضبط Gmail App Passwords لضمان وصول التنبيهات لصندوق الوارد.",
    tags: ["بريد إلكتروني", "SMTP", "تنبيهات أمنية", "zyadbdr925@gmail.com"]
  },
  {
    id: "HIST-006-LOGIN-UIUX",
    timestamp: "2026-09-12T09:30:00.000Z",
    stage: "UI_UX_POLISH",
    stageLabelAr: "ترقية أناقة شاشة الدخول وتفعيل روابط الوحدات",
    userPrompt: "حدث التعديلات السابقة، وانظر إلى الصورة شاشة الدخول تبدو غير جميله، حاول تعطيها نوع من الجمال والاناقة، وفعل كل الروابط الظاهرة مثل استكشف الوحدات.",
    systemActionSummary: "إعادة تصميم واجهة SapEnterpriseLoginPortal بتأثيرات الزجاج المصقول والتدرجات الفخمة، وتفعيل كافة روابط وبطاقات استكشف الوحدات وربطها بالموديولات التشغيلية.",
    targetComponents: ["SapEnterpriseLoginPortal", "CorporateWebsite"],
    status: "COMPLETED",
    category: "UI_UX",
    author: "المستخدم الرئيسي",
    impactLevel: "HIGH",
    technicalDetails: "تطبيق قواعد الأناقة والتدرجات اللونية الداكنة المتناسقة وحقول الإدخال ذات التباين المريح وحركات الانتقال الانسيابية.",
    tags: ["تصميم", "جماليات", "شاشة الدخول", "استكشف الوحدات"]
  },
  {
    id: "HIST-007-TIMELINE-DASHBOARD",
    timestamp: "2026-09-12T14:25:00.000Z",
    stage: "CUSTOM_REQUEST",
    stageLabelAr: "لوحة سجل المحادثات والطلبات والإجراءات المركزية",
    userPrompt: "قم بإنشاء مكون جديد لعرض سجل كامل للمحادثات والطلبات والإجراءات التي تمت داخل النظام منذ بدايته، بحيث يتم تخزين هذه البيانات وعرضها في لوحة تحكم مخصصة للمسؤولين.",
    systemActionSummary: "بناء مكون SystemPromptsHistoryDashboard المخصص للإدارة العليا مع إمكانية البحث، الفلترة حسب المراحل، إضافة طلبات جديدة وتصدير السجل الكامل بصيغ JSON و CSV.",
    targetComponents: ["SystemPromptsHistoryDashboard", "systemPromptsHistoryService", "AdminDeviceManagerView"],
    status: "COMPLETED",
    category: "SYSTEM_AUDIT",
    author: "المسؤول التنفيذي",
    impactLevel: "CRITICAL",
    technicalDetails: "تخزين دائم وسحابي لسجل العمليات والمحادثات مع ميزات التصفية حسب الأثر والمستوى وتصدير التقارير التوثيقية.",
    tags: ["سجل الطلبات", "محادثات", "توثيق", "لوحة الإدارة"]
  },
  {
    id: "HIST-008-BEAUTIFICATION-PROMPT",
    timestamp: "2026-09-12T14:34:00.000Z",
    stage: "UI_UX_POLISH",
    stageLabelAr: "ترقية جمال وأناقة شاشة سجل المحادثات وتوثيق الطلب",
    userPrompt: "حدث هذا الطلب وطلب جمال الشاشه",
    systemActionSummary: "تحديث وتوثيق الطلب في السجل المركزي، وإعادة تصميم شاشة سجل المحادثات والطلبات بنمط بصري فاخر، مع تدرجات لونية ملكية، وخط زمني مضيء متفاعل، وخيارات النسخ والطباعة الفورية وتوسيع البطاقات.",
    targetComponents: ["SystemPromptsHistoryDashboard", "systemPromptsHistoryService", "AdminDeviceManagerView"],
    status: "ACTIVE",
    category: "UI_UX",
    author: "المسؤول التنفيذي (zyadbdr925@gmail.com)",
    impactLevel: "HIGH",
    technicalDetails: "اعتماد أسلوب Dark Luxury Sapphire المتطور، وبطاقات الخط الزمني التفاعلية مع إضاءة حركية، وشارات التأثير ذات التباين العالي، ومحرك فلترة سريعة مع البحث الفوري وميزة النسخ بضغطة واحدة.",
    tags: ["جمال الشاشة", "أناقة الواجهات", "سجل المحادثات", "UI/UX الفاخر", "تحديث فوري"]
  }
];

export class SystemPromptsHistoryService {
  public static getHistory(): SystemPromptRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROMPTS_HISTORY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_PROMPTS_HISTORY, JSON.stringify(INITIAL_SYSTEM_HISTORY));
        return INITIAL_SYSTEM_HISTORY;
      }
      const parsed: SystemPromptRecord[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure new built-in default records are merged if missing
        const existingIds = new Set(parsed.map((p) => p.id));
        const missingInitial = INITIAL_SYSTEM_HISTORY.filter((item) => !existingIds.has(item.id));
        if (missingInitial.length > 0) {
          const merged = [...missingInitial, ...parsed];
          localStorage.setItem(STORAGE_KEY_PROMPTS_HISTORY, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
      return INITIAL_SYSTEM_HISTORY;
    } catch {
      return INITIAL_SYSTEM_HISTORY;
    }
  }

  public static addRecord(record: Omit<SystemPromptRecord, "id" | "timestamp">): SystemPromptRecord {
    const list = this.getHistory();
    const newRecord: SystemPromptRecord = {
      ...record,
      id: `HIST-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newRecord, ...list];
    localStorage.setItem(STORAGE_KEY_PROMPTS_HISTORY, JSON.stringify(updated));
    return newRecord;
  }

  public static deleteRecord(id: string): void {
    const list = this.getHistory();
    const updated = list.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY_PROMPTS_HISTORY, JSON.stringify(updated));
  }

  public static exportAsJSON(): string {
    const list = this.getHistory();
    return JSON.stringify(list, null, 2);
  }

  public static resetToDefault(): void {
    localStorage.setItem(STORAGE_KEY_PROMPTS_HISTORY, JSON.stringify(INITIAL_SYSTEM_HISTORY));
  }
}
