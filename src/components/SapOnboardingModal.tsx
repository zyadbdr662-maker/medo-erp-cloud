import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Layers,
  ShieldCheck,
  Play,
  Award,
  X,
  Search,
  FileSpreadsheet,
  FolderTree,
  ReceiptText,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  HelpCircle,
  CheckSquare,
  Compass,
  Minimize2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Building2,
  PieChart,
  Activity,
  Package,
  Coins,
  LayoutDashboard,
  Boxes,
  FileCheck,
  Briefcase,
  Scale,
  Landmark,
  Truck,
  Users,
  ArrowLeftRight,
} from "lucide-react";

interface SapOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  activeTab?: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  tabTarget: string;
  category: "مالية" | "عمليات" | "أمان";
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "task_chart",
    title: "استكشاف شجرة الحسابات والدليل المالي (FI)",
    description: "الاطلاع على الحسابات الخمسة الرئيسية وتقسيم الأصول والخصوم والملكيات.",
    tabTarget: "CHART_OF_ACCOUNTS",
    category: "مالية",
  },
  {
    id: "task_reports",
    title: "معاينة القوائم المالية الأربع (الدخل، الميزانية، التدفقات، ميزان المراجعة)",
    description: "الوصول المباشر إلى التقارير الختامية التلقائية وفق المعايير الدولية.",
    tabTarget: "FINANCIAL_REPORTS",
    category: "مالية",
  },
  {
    id: "task_journal",
    title: "إنشاء قيد يومية أو سند مالية تجريبي",
    description: "تجربة القيد المزدوج وتخصيص الفروع ومراكز التكلفة.",
    tabTarget: "JOURNAL_ENTRIES",
    category: "مالية",
  },
  {
    id: "task_invoice",
    title: "إصدار فاتورة مبيعات مع QR Code ضريبي مشفر (ZATCA)",
    description: "تطبيق قواعد الفاتورة الإلكترونية والتحقق من حساب الضريبة الـ 15%.",
    tabTarget: "SALES_RETURNS",
    category: "عمليات",
  },
  {
    id: "task_cashflow",
    title: "فحص قائمة التدفقات النقدية اللحظية (IAS 7)",
    description: "تتبع حركة السيولة النقدية من الأنشطة التشغيلية والاستثمارية.",
    tabTarget: "CASH_FLOW",
    category: "مالية",
  },
  {
    id: "task_inventory",
    title: "متابعة حركة المخزون والأصناف السلعية (MM)",
    description: "استعراض الأرصدة المخزنية وجرد المخرجات والمدخلات.",
    tabTarget: "INVENTORY",
    category: "عمليات",
  },
  {
    id: "task_trust",
    title: "التحقق من مركز الثقة، الأمان والنسخ الاحتياطي",
    description: "مراجعة شهادات التشفير، الصلاحيات، واستراتيجية النسخ التلقائي.",
    tabTarget: "TRUST_CENTER",
    category: "أمان",
  },
];

interface FeatureSearchItem {
  title: string;
  description: string;
  keywords: string[];
  tabTarget: string;
  badge: string;
  icon: React.ElementType;
}

const FEATURE_CATALOG: FeatureSearchItem[] = [
  {
    title: "قائمة الدخل والأرباح والخسائر (Income Statement)",
    description: "استخراج تقرير أداء الإيرادات والمصروفات وصافي الربح التشغيلي.",
    keywords: ["قائمة الدخل", "أرباح وخسائر", "ربح", "خسارة", "إيرادات", "مصروفات"],
    tabTarget: "FINANCIAL_REPORTS",
    badge: "تقرير مالي ختامي",
    icon: FileSpreadsheet,
  },
  {
    title: "الميزانية العمومية (Balance Sheet)",
    description: "تقييم المركز المالي للمنشأة (الأصول، الالتزامات، حقوق الملكية).",
    keywords: ["الميزانية العمومية", "المركز المالي", "أصول", "خصوم", "التزامات", "حقوق ملكية"],
    tabTarget: "FINANCIAL_REPORTS",
    badge: "تقرير مالي ختامي",
    icon: Scale,
  },
  {
    title: "قائمة التدفقات النقدية (IAS 7 Cash Flow)",
    description: "تحليل حركة التدفقات النقدية الداقلة والخارجة وتقسيمها حسب الأنشطة.",
    keywords: ["التدفقات النقدية", "تدفق نقدي", "سيولة", "IAS 7", "تشغيلي", "استثماري"],
    tabTarget: "CASH_FLOW",
    badge: "سيولة ونقدية",
    icon: Activity,
  },
  {
    title: "ميزان المراجعة (Trial Balance)",
    description: "مراجعة التوازن الدائن والمدين لكافة حسابات الأستاذ العام.",
    keywords: ["ميزان المراجعة", "توازن", "مدين ودائن", "أرصدة مجاميع"],
    tabTarget: "FINANCIAL_REPORTS",
    badge: "تقرير محاسبي",
    icon: BarChart3,
  },
  {
    title: "شجرة الحسابات والدليل المالي (Chart of Accounts)",
    description: "استعراض الهيكل الشجري وتصنيف الأصول والخصوم والمصروفات.",
    keywords: ["شجرة الحسابات", "دليل محاسبي", "حساب رئيسي", "حساب فرعي", "FI"],
    tabTarget: "CHART_OF_ACCOUNTS",
    badge: "دليل الحسابات",
    icon: FolderTree,
  },
  {
    title: "قيود اليومية العامة (Journal Entries)",
    description: "تسجيل القيود المزدوجة ومتابعة توازن الأطراف الدائنة والمدينة.",
    keywords: ["قيد يومية", "قيود", "تسجيل قيد", "ترحيل", "قيد مزدوج"],
    tabTarget: "JOURNAL_ENTRIES",
    badge: "عملية محاسبية",
    icon: BookOpen,
  },
  {
    title: "سندات القبض والصرف (Vouchers)",
    description: "إصدار سندات القبض والدفع النقدي والبنكي مع طابعة معتمدة.",
    keywords: ["سند قبض", "سند صرف", "سندات", "ايصال", "قبض ونقدية"],
    tabTarget: "VOUCHERS",
    badge: "سندات مالية",
    icon: ReceiptText,
  },
  {
    title: "إدارة المبيعات والفاتورة الإلكترونية (ZATCA Sales)",
    description: "إصدار الفواتير الضريبية مع توليد كود الـ QR والتحقق التلقائي.",
    keywords: ["مبيعات", "فاتورة", "فاتورة إلكترونية", "ZATCA", "ضريبة", "QR"],
    tabTarget: "SALES_RETURNS",
    badge: "فواتير وضريبة",
    icon: ShoppingBag,
  },
  {
    title: "إدارة المشتريات والموردين (Purchases & AP)",
    description: "متابعة فواتير المشتريات وأوامر التوريد والذمم الدائنة للموردين.",
    keywords: ["مشتريات", "موردين", "أوامر شراء", "ذمم دائنة", "تلقي بضاعة"],
    tabTarget: "PURCHASES_RETURNS",
    badge: "مشتريات وموردون",
    icon: Truck,
  },
  {
    title: "الخزائن والبنوك والتسويات النقدية",
    description: "إدارة حسابات البنوك، الصناديق النقدية، والتسويات البنكية.",
    keywords: ["بنك", "خزينة", "صندوق", "تسوية بنكية", "سيولة"],
    tabTarget: "CASH_AND_BANK",
    badge: "السيولة والنقدية",
    icon: Landmark,
  },
  {
    title: "المخزون وحركة الأصناف (MM Stock)",
    description: "تتبع حركة الأصناف، أرصدة المستودعات، وتعديل الكميات.",
    keywords: ["مخزون", "مستودع", "أصناف", "جرد", "حركة مواد"],
    tabTarget: "INVENTORY",
    badge: "إدارة المخازن",
    icon: Package,
  },
  {
    title: "مركز الثقة والأمان والنسخ الاحتياطي (Trust Center)",
    description: "فحص مستويات تشفير البيانات والنسخ الاحتياطي السحابي التلقائي.",
    keywords: ["ثقة", "أمان", "نسخ احتياطي", "تشفير", "صلاحيات", "حماية"],
    tabTarget: "TRUST_CENTER",
    badge: "أمان وتشفير",
    icon: ShieldCheck,
  },
];

export const SapOnboardingModal: React.FC<SapOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  activeTab,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeViewMode, setActiveViewMode] = useState<"STEPS" | "CHECKLIST" | "SEARCH">("STEPS");
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [completedTasks, setCompletedTasks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("medo_onboarding_completed_tasks");
      return saved ? JSON.parse(saved) : ["task_chart"];
    } catch {
      return ["task_chart"];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("medo_onboarding_completed_tasks", JSON.stringify(completedTasks));
    } catch (e) {
      console.error("Failed to save onboarding tasks progress", e);
    }
  }, [completedTasks]);

  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const steps = [
    {
      title: "1. الترحيب بمنظومة MeDo ERP والهيكل التنظيمي",
      subtitle: "استكشاف الواجهة الرئيسية، اختيار الفرع النشط، والعملة المعروضة",
      icon: Award,
      actionTab: "DASHBOARD",
      actionLabel: "فتح لوحة التحكم التنفيذية",
      content: (
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-3 bg-sap-primary/10 border border-sap-primary/30 rounded-xl text-sap-primary font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sap-secondary shrink-0" />
            <span>مرحباً بك! تم إعداد حسابك بنجاح مع الهوية المؤسسية المعتمدة لنظام MeDo ERP.</span>
          </div>
          <p className="font-bold text-slate-900">
            يتيح لك الشريط العلوي والتنقل الجانبي التحول بين الوحدات المحاسبية والإدارية بسرعة، مع إمكانية تبديل الفرع النشط واختيار عملة العرض الرئيسية (ريال يمني، ريال سعودي، دولار أمريكي).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="font-bold text-sap-primary mb-1">🟢 واجهة القيادة التفاعلية</div>
              <div className="text-[11px] text-slate-600">رسوم بيانية لحظية ومؤشرات الأداء المالي الحاسم (KPIs).</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="font-bold text-sap-secondary mb-1">✨ الدعم الفوري والذكاء المالي المتقدم</div>
              <div className="text-[11px] text-slate-600">مستشار مالي ذكي جاهز لتحليل قوائمك المالية بنقرة واحدة.</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "2. شجرة الحسابات والدليل المحاسبي الموحد (Chart of Accounts)",
      subtitle: "الهيكل الشجري للحسابات الأربعة والخمسة وتصنيف الحسابات الرئيسية والفرعية",
      icon: FolderTree,
      actionTab: "CHART_OF_ACCOUNTS",
      actionLabel: "استكشاف شجرة الحسابات (FI)",
      content: (
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p className="font-bold text-slate-900">كيف تستفيد من دليل الحسابات الموحد؟</p>
          <ol className="list-decimal list-inside space-y-2 pr-1">
            <li>انتقل إلى شاشة <span className="text-sap-primary font-bold">شجرة الحسابات (FI)</span> لتصفح الفئات الخمس: (الأصول، الخصوم، حقوق الملكية، الإيرادات، والمصروفات).</li>
            <li>تتبع ترميز الحسابات الشجرية (مثل: 101 للأصول المتداولة، 1011 النقدية والبنوك).</li>
            <li>يمكنك إضافة حساب فرعي جديد أو تعديل خصائص الحسابات بسهولة مع الربط بمراكز التكلفة.</li>
          </ol>
          <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-600">
            💡 <strong className="text-slate-800">تلميح محاسبي:</strong> الدليل مصمم ليتوافق تماماً مع المعايير الدولية للإبلاغ المالي (IFRS) والأنظمة الضريبية المحلية.
          </div>
        </div>
      ),
    },
    {
      title: "3. القيود اليومية وسندات القبض والصرف (Journal & Vouchers)",
      subtitle: "تسجيل القيود المحاسبية المزدوجة وإصدار سندات القبض والدفع الفورية",
      icon: BookOpen,
      actionTab: "JOURNAL_ENTRIES",
      actionLabel: "فتح شاشة القيود المحاسبية",
      content: (
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p className="font-bold text-slate-900">خطوات إجراء المعاملات المالية المزدوجة:</p>
          <ol className="list-decimal list-inside space-y-2 pr-1">
            <li>افتح شاشة <span className="text-sap-primary font-bold">قيود اليومية العامة</span> أو <span className="text-sap-primary font-bold">سندات القبض والصرف</span>.</li>
            <li>أدخل أطراف القيد المدين والدائن مع التحقق التلقائي من توازن المجموع.</li>
            <li>حدد مركز التكلفة والفرع المعني لإخراج تقارير تحليلية دقيقة.</li>
            <li>طباعة السند بتصميم مؤسسي أنيق يحمل شعار المنشأة والـ QR المعين.</li>
          </ol>
        </div>
      ),
    },
    {
      title: "4. القوائم والتقارير المالية الختامية الأربع (Financial Statements)",
      subtitle: "كيفية الوصول المباشر واستخراج قائمة الدخل، الميزانية العمومية، والتدفقات النقدية",
      icon: FileSpreadsheet,
      actionTab: "FINANCIAL_REPORTS",
      actionLabel: "الانتقال المباشر للقوائم المالية",
      content: (
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p className="font-bold text-slate-900">شرح الوصول للقوائم المالية الأساسية:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="font-bold text-sap-primary block">📈 1. قائمة الدخل (Profit & Loss)</span>
              <span className="text-[11px] text-slate-600">تظهر لك مجمل الأرباح، المصروفات الإدارية، والربح الصافي للفترة المحاسبية.</span>
            </div>
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
              <span className="font-bold text-blue-900 block">🏛️ 2. الميزانية العمومية (Balance Sheet)</span>
              <span className="text-[11px] text-slate-600">تعرض إجمالي الأصول مقابل الخصوم وحقوق الملكية للتحقق من المتانة المالية.</span>
            </div>
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="font-bold text-amber-900 block">💧 3. التدفقات النقدية (IAS 7 Cash Flow)</span>
              <span className="text-[11px] text-slate-600">تتبع حركة السيولة النقدية الفعلية عبر الأنشطة التشغيلية، الاستثمارية والتمويلية.</span>
            </div>
            <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
              <span className="font-bold text-purple-900 block">⚖️ 4. ميزان المراجعة (Trial Balance)</span>
              <span className="text-[11px] text-slate-600">تأكيد توازن كافة أرصدة ومجاميع الحسابات قبل إغلاق الفترة.</span>
            </div>
          </div>
          <div className="p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-xl text-emerald-900 text-[11px] font-bold flex items-center justify-between">
            <span>💡 جميع القوائم تدعم التصدير الفوري لمستندات PDF معتمدة أو جداول Excel.</span>
          </div>
        </div>
      ),
    },
    {
      title: "5. دورة المبيعات، المشتريات والفاتورة الإلكترونية (ZATCA)",
      subtitle: "إصدار الفواتير الضريبية المشفرة وتحديث المخزون والذمم المالية تلقائياً",
      icon: ShoppingBag,
      actionTab: "SALES_RETURNS",
      actionLabel: "إصدار فاتورة مبيعات جديدة",
      content: (
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p className="font-bold text-slate-900">طريقة تجربة دورة المبيعات والفواتير الضريبية:</p>
          <ol className="list-decimal list-inside space-y-2 pr-1">
            <li>انتقل إلى شاشة <span className="text-sap-primary font-bold">إدارة المبيعات والمرتجعات</span>.</li>
            <li>اضغط على <span className="text-sap-primary font-bold">"إصدار فاتورة مبيعات جديدة"</span> واختر الصنف والعميل.</li>
            <li>يقوم النظام آلياً باحتساب ضريبة القيمة المضافة وتوليد كود الـ QR المشفر والتوقيع الرقمي.</li>
            <li>يتم قيد المبيعات في الحسابات وتخفيض الكمية من المستودع تلقائياً دون تدخل يدوي.</li>
          </ol>
        </div>
      ),
    },
    {
      title: "6. إدارة المخزون وحركة المواد، الفروع، والموارد البشرية",
      subtitle: "السيطرة على جرد المواد في المستودعات، متابعة الفروع، وكشوفات الرواتب",
      icon: Package,
      actionTab: "INVENTORY",
      actionLabel: "فتح شاشة إدارة المخزون",
      content: (
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p className="font-bold text-slate-900">ميزات إدارة العمليات الميدانية:</p>
          <ul className="list-disc list-inside space-y-1.5 pr-1">
            <li><strong className="text-slate-800">المخزون السلعي (MM):</strong> متابعة حركة الصرف والتوريد وتحديد حد الطلب الأدنى للأصناف.</li>
            <li><strong className="text-slate-800">إدارة الفروع:</strong> مقارنة أداء المبيعات والأرباح بين الفروع المتعددة.</li>
            <li><strong className="text-slate-800">الموارد البشرية والرواتب (HR):</strong> تسجيل الموظفين، الحضور، ومُسيرات مسحوب الرواتب.</li>
          </ul>
        </div>
      ),
    },
    {
      title: "7. مركز الثقة، الأمان والنسخ الاحتياطي السحابي (Trust Center)",
      subtitle: "حماية البيانات بتشفير AES-256، النسخ الاحتياطي التلقائي، وإدار الصلاحيات",
      icon: ShieldCheck,
      actionTab: "TRUST_CENTER",
      actionLabel: "زيارة مركز الثقة والأمان",
      content: (
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p className="font-bold text-slate-900">معايير الموثوقية والأمان السحابي:</p>
          <ol className="list-decimal list-inside space-y-2 pr-1">
            <li>انتقل لتبويب <span className="text-sap-primary font-bold">مركز الثقة والأمان (Trust Center)</span>.</li>
            <li>استعرض سجلات التدقيق والتأكد من مطابقة النظام لمعايير ISO و ZATCA.</li>
            <li>تأكد من تفعيل النسخ الاحتياطي الذاتي لضمان عدم فقدان بيانات المنشأة إطلاقاً.</li>
          </ol>
        </div>
      ),
    },
  ];

  const filteredCatalog = FEATURE_CATALOG.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const completionPercentage = Math.round(
    (completedTasks.length / CHECKLIST_ITEMS.length) * 100
  );

  if (!isOpen && !isMinimized) return null;

  // Render Floating Mini Guide Mode
  if (isMinimized) {
    const currentStep = steps[activeStep];
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-slate-900 text-white border-2 border-sap-secondary/70 rounded-2xl shadow-2xl p-4 animate-scaleUp font-sans">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sap-primary flex items-center justify-center text-sap-secondary font-bold text-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-sap-secondary">مرشد MeDo ERP العائم</div>
              <div className="text-[10px] text-slate-400">الخطوة {activeStep + 1} من {steps.length}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              title="تكبير الجولة الإرشادية"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-300 transition cursor-pointer"
              title="إغلاق المرشد"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h5 className="text-xs font-bold text-white leading-snug line-clamp-1">
            {currentStep.title}
          </h5>
          <p className="text-[11px] text-slate-300 line-clamp-2">
            {currentStep.subtitle}
          </p>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-sap-secondary h-full transition-all duration-300"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1 gap-2">
            <button
              onClick={() => {
                onSelectTab(currentStep.actionTab);
              }}
              className="flex-1 py-1.5 px-2 rounded-lg bg-sap-secondary hover:bg-amber-400 text-slate-950 font-black text-[11px] transition flex items-center justify-center gap-1 shadow cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>انتقل للشاشة 🚀</span>
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                disabled={activeStep === 0}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                disabled={activeStep === steps.length - 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-3xl bg-white border border-sap-primary/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-l from-sap-primary via-[#14532D] to-sap-primary px-5 py-4 text-white flex items-center justify-between border-b border-sap-secondary/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sap-secondary border border-sap-secondary/40 shadow-inner">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">الجولة الإرشادية التفاعلية - MeDo ERP</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sap-secondary text-slate-950">
                  SAP Enterprise Tour
                </span>
              </div>
              <p className="text-[11px] text-emerald-200">
                دليلك الميداني السريع لاستكشاف القوائم المالية، المبيعات، والدليل المحاسبي
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="تصغير إلى الشريط العائم لمتابعة الشرح أثناء التصفح"
            >
              <Minimize2 className="w-4 h-4" />
              <span className="hidden sm:inline">تصغير عائم</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="bg-slate-100 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveViewMode("STEPS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeViewMode === "STEPS"
                  ? "bg-sap-primary text-white shadow"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>الخطوات الموجهة ({steps.length})</span>
            </button>
            <button
              onClick={() => setActiveViewMode("CHECKLIST")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeViewMode === "CHECKLIST"
                  ? "bg-sap-primary text-white shadow"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>قائمة التبني ({completedTasks.length}/{CHECKLIST_ITEMS.length})</span>
            </button>
            <button
              onClick={() => setActiveViewMode("SEARCH")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeViewMode === "SEARCH"
                  ? "bg-sap-primary text-white shadow"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>مستكشف الميزات والتقارير</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span>نسبة التبني:</span>
            <span className="text-sap-primary font-black">{completionPercentage}%</span>
            <div className="w-20 bg-slate-300 h-2 rounded-full overflow-hidden">
              <div
                className="bg-sap-primary h-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* VIEW MODE 1: STEPS */}
          {activeViewMode === "STEPS" && (
            <div className="space-y-4">
              {/* Step indicator bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                {steps.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                      activeStep === idx
                        ? "bg-sap-primary text-white border-sap-primary shadow-md"
                        : activeStep > idx
                        ? "bg-emerald-50 text-sap-primary border-emerald-200"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">
                      {idx + 1}
                    </span>
                    <span className="max-w-[120px] truncate">{s.title.split(". ")[1] || s.title}</span>
                  </button>
                ))}
              </div>

              {/* Step content detail */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-start gap-3 border-b border-slate-200 pb-3">
                  <div className="p-3 rounded-2xl bg-sap-primary/10 text-sap-primary border border-sap-primary/20 shrink-0">
                    {React.createElement(steps[activeStep].icon, { className: "w-6 h-6" })}
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">{steps[activeStep].title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{steps[activeStep].subtitle}</p>
                  </div>
                </div>

                <div>{steps[activeStep].content}</div>

                {steps[activeStep].actionTab && (
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sap-secondary" />
                      <span>هل تريد الانتقال الفوري لهذه الوحدة في النظام؟</span>
                    </div>
                    <button
                      onClick={() => {
                        onSelectTab(steps[activeStep].actionTab!);
                        setIsMinimized(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-sap-secondary hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{steps[activeStep].actionLabel}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: CHECKLIST */}
          {activeViewMode === "CHECKLIST" && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-sap-primary flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-sap-secondary" />
                    <span>قائمة المهام التفاعلية لتبني ميزات MeDo ERP</span>
                  </h4>
                  <p className="text-xs text-slate-600">
                    قم بإنهاء المهام التالية للتيقن من استيعابك لكافة الميزات والقوائم المالية في النظام.
                  </p>
                </div>
                <div className="text-left shrink-0">
                  <div className="text-2xl font-black text-sap-primary">{completionPercentage}%</div>
                  <div className="text-[10px] text-slate-500">إجمالي التقدم</div>
                </div>
              </div>

              <div className="space-y-2">
                {CHECKLIST_ITEMS.map((item) => {
                  const isDone = completedTasks.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                        isDone
                          ? "bg-emerald-50/60 border-emerald-300"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTaskCompletion(item.id)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition mt-0.5 cursor-pointer ${
                            isDone
                              ? "bg-sap-primary border-sap-primary text-white"
                              : "border-slate-300 bg-slate-50 hover:border-sap-primary"
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold ${
                                isDone ? "line-through text-slate-500" : "text-slate-900"
                              }`}
                            >
                              {item.title}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!isDone) toggleTaskCompletion(item.id);
                          onSelectTab(item.tabTarget);
                          setIsMinimized(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sap-primary hover:text-white text-slate-700 font-bold text-xs transition shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <span>تجربة الميزة</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE 3: SEARCH CATALOG */}
          {activeViewMode === "SEARCH" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute right-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن أي تقرير مالي أو ميزة (مثل: قائمة الدخل، الميزانية العمومية، قيد اليومية...)"
                  className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-300 focus:border-sap-primary focus:ring-2 focus:ring-sap-primary/20 text-xs font-bold text-slate-800 focus:outline-none transition"
                />
              </div>

              {/* Quick Tag Suggestion Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-bold">كلمات سريعة:</span>
                {[
                  "قائمة الدخل",
                  "الميزانية العمومية",
                  "التدفقات النقدية",
                  "ميزان المراجعة",
                  "شجرة الحسابات",
                  "قيود اليومية",
                  "الفاتورة الضريبية",
                  "الخزائن والبنوك",
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Catalog list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCatalog.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 bg-white border border-slate-200 hover:border-sap-primary/50 rounded-xl shadow-sm hover:shadow transition space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-emerald-50 text-sap-primary">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="font-extrabold text-xs text-slate-900">{feat.title}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                            {feat.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{feat.description}</p>
                      </div>

                      <button
                        onClick={() => {
                          onSelectTab(feat.tabTarget);
                          setIsMinimized(true);
                        }}
                        className="w-full py-2 rounded-lg bg-sap-primary hover:bg-[#14532D] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>فتح الشاشة مباشرة</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0 || activeViewMode !== "STEPS"}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeStep === 0 || activeViewMode !== "STEPS"
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
            }`}
          >
            السابق
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer flex items-center gap-1"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>متابعة العمل وضع عائم</span>
            </button>

            {activeViewMode === "STEPS" && (
              <button
                onClick={() => {
                  if (activeStep < steps.length - 1) {
                    setActiveStep((prev) => prev + 1);
                  } else {
                    onClose();
                  }
                }}
                className="px-5 py-2 rounded-xl bg-sap-primary hover:bg-[#14532D] text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <span>{activeStep === steps.length - 1 ? "إنهاء وجاهز للعمل" : "التالي"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
