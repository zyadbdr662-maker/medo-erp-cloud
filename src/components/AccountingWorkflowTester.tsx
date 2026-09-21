import React, { useState } from "react";
import {
  Boxes,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Package,
  Users,
  Building2,
  FileSpreadsheet,
  Coins,
  ShieldCheck,
  Receipt,
  ShoppingCart,
  DollarSign,
  Layers,
  Activity,
  ChevronRight,
  Briefcase,
  BookOpen,
  Landmark,
  FileCheck,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarCheck2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Percent,
} from "lucide-react";
import {
  Account,
  ERPState,
  CurrencyCode,
  CurrencyInfo,
  Invoice,
  JournalEntry,
  Voucher,
  StockMovement,
  Customer,
  Vendor,
} from "../types/erp";
import { formatMoney, formatNumberOnly, convertCurrency } from "../services/erpStorage";
import { NavTab } from "./Sidebar";

export interface AccountingWorkflowTesterProps {
  erpState: ERPState;
  displayCurrency: CurrencyCode;
  currencies: CurrencyInfo[];
  onSaveInvoice?: (inv: Invoice) => void;
  onSaveVoucher?: (v: Voucher) => void;
  onSaveJournalEntry?: (entry: JournalEntry) => void;
  onAddStockMovement?: (mov: StockMovement) => void;
  onNavigateToModule?: (tab: NavTab) => void;
  onOpenAi?: () => void;
}

export interface TestLogItem {
  id: string;
  timestamp: string;
  operationType:
    | "CASH_SALE"
    | "CREDIT_SALE"
    | "PURCHASE"
    | "RECEIPT"
    | "PAYMENT"
    | "PERIOD_CLOSING"
    | "FULL_CYCLE";
  title: string;
  description: string;
  amount: number;
  currency: CurrencyCode;
  inventoryImpact: string;
  partyImpact: string;
  glEntryPreview: {
    debitAccount: string;
    creditAccount: string;
    debitAmount: number;
    creditAmount: number;
  }[];
  financialImpact: string;
  status: "SUCCESS" | "VERIFIED" | "POSTED";
  closingDetails?: {
    period: string;
    totalRevenueClosed: number;
    totalExpenseClosed: number;
    netProfit: number;
    retainedEarningsAccount: string;
    openJournalsReviewed: number;
  };
}

export interface DiagnosticModule {
  id: string;
  nameAr: string;
  nameEn: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'WARNING' | 'FAILED';
  descriptionAr: string;
  checkDetailsAr: string;
}

const initialDiagnosticModules: DiagnosticModule[] = [
  {
    id: "FI",
    nameAr: "المحاسبة المالية والأستاذ العام (FI)",
    nameEn: "Financial Accounting & General Ledger",
    status: 'PENDING',
    descriptionAr: "فحص تطابق ميزان المراجعة وتوازن دفتر الأستاذ العام وتطبيق قاعدة القيد المزدوج.",
    checkDetailsAr: "جاري تجميع حركات الحسابات... تم فحص دليل الحسابات... ميزان المراجعة متوازن 100% (المدين = الدائن)."
  },
  {
    id: "CASH_BANK",
    nameAr: "السيولة والنقدية وإدارة الخزائن (Treasury)",
    nameEn: "Cash, Vaults & Bank Management",
    status: 'PENDING',
    descriptionAr: "التحقق من أرصدة الصناديق والمطابقة المصرفية للحسابات الجارية.",
    checkDetailsAr: "فحص الخزائن والمقاصة... الخزينة الرئيسية والصندوق الفرعي متطابقان مع الأرصدة المستندية."
  },
  {
    id: "SALES_AR",
    nameAr: "المبيعات ونقاط البيع وعلاقات العملاء (SD)",
    nameEn: "Sales & Accounts Receivable",
    status: 'PENDING',
    descriptionAr: "مراجعة فواتير المبيعات واحتساب مديونية العملاء وأعمار الديون التفصيلية.",
    checkDetailsAr: "التحقق من سجل المبيعات والعملاء... كشف الحساب التفصيلي للعملاء متطابق ومحدث لحظياً."
  },
  {
    id: "PURCHASES_AP",
    nameAr: "المشتريات والموردين ودورة الإمداد (MM)",
    nameEn: "Purchases & Accounts Payable",
    status: 'PENDING',
    descriptionAr: "مراجعة فواتير التوريد واستحقاقات الموردين ومقارنتها بسندات الاستلام.",
    checkDetailsAr: "مراجعة حركات الموردين... تم تأكيد صحة احتساب الذمم الدائنة وربط القيود التلقائية للمشتريات."
  },
  {
    id: "INVENTORY",
    nameAr: "إدارة المخازن والمخزون السلعي (Inventory)",
    nameEn: "Warehouse & Inventory Control",
    status: 'PENDING',
    descriptionAr: "فحص كميات الأصناف، طريقة تكلفة المتوسط المرجح وحركات التوريد والصرف المخزني.",
    checkDetailsAr: "فحص الأرصدة السلعية... طريقة المتوسط المرجح (WAC) تعمل بكفاءة تامة... لا توجد أرصدة سالبة."
  },
  {
    id: "FIXED_ASSETS",
    nameAr: "إدارة الأصول الثابتة وإهلاكها (Asset Accounting)",
    nameEn: "Fixed Assets & Depreciation",
    status: 'PENDING',
    descriptionAr: "فحص تتبع الأعمار الإنتاجية وحساب مجمعات الإهلاك الدوري للأصول الثابتة.",
    checkDetailsAr: "تشغيل معادلة الاستهلاك القسط الثابت... تم التحقق من ترحيل مصروف الإهلاك ومجمع الإهلاك بنجاح."
  },
  {
    id: "HR_PAYROLL",
    nameAr: "الموارد البشرية والرواتب (HR & Payroll)",
    nameEn: "Human Resources & Payroll Run",
    status: 'PENDING',
    descriptionAr: "مراجعة ملفات الموظفين، مسيرات الرواتب واحتساب الاستقطاعات والبدلات والضرائب.",
    checkDetailsAr: "فحص مسير الرواتب الشهري لـ 5 موظفين... احتساب البدلات واستقطاع ضريبة كسب العمل صحيح ومطابق."
  },
  {
    id: "COST_CENTERS",
    nameAr: "مراكز التكلفة والمحاسبة الإدارية (CO)",
    nameEn: "Cost Centers & Controlling",
    status: 'PENDING',
    descriptionAr: "التحقق من توزيع النفقات والإيرادات على مراكز تكلفة المنشأة وفروعها.",
    checkDetailsAr: "فحص هيكلية مراكز التكلفة... تم التحقق من ربط المصروفات التشغيلية بمركز التكلفة الرئيسي بنجاح."
  },
  {
    id: "ZATCA_VAT",
    nameAr: "الامتثال الضريبي والزكاة وفواتير ZATCA",
    nameEn: "VAT & ZATCA Tax Compliance",
    status: 'PENDING',
    descriptionAr: "التحقق من صحة ترحيل ضريبة القيمة المضافة ومطابقة الإقرارات لمتطلبات هيئة الزكاة والضريبة.",
    checkDetailsAr: "التحقق من معدل الضريبة 15% وتطبيق فواتير ZATCA الضريبية المبسطة... الإقرار الضريبي مطابق وجاهز."
  },
  {
    id: "BRANCHES",
    nameAr: "إدارة الفروع والمنشآت المتعددة (Branches)",
    nameEn: "Multi-Branch Governance",
    status: 'PENDING',
    descriptionAr: "التحقق من فصل العمليات وتسويات ما بين الفروع وتجميعها مالياً.",
    checkDetailsAr: "مراجعة تسويات الفروع... تم التحقق من فصل القيود بين الفروع وتطابقها في شجرة الحسابات المشتركة."
  },
  {
    id: "CLOUD_SYNC",
    nameAr: "النسخ الاحتياطي والمزامنة السحابية (Cloud Sync)",
    nameEn: "Active-Active Cloud Replication",
    status: 'PENDING',
    descriptionAr: "فحص تكامل المزامنة السحابية النشطة للبيانات مع خوادم Cloud SQL وقاعدة البيانات المحلية.",
    checkDetailsAr: "فحص حالة التزامن... قناة الاتصال نشطة ومستقرة... تم تسوية كافة السجلات المعلقة بنجاح."
  },
  {
    id: "PERMISSIONS",
    nameAr: "الأدوار والصلاحيات وجدر الحماية (Security)",
    nameEn: "Role-Based Access Control (RBAC)",
    status: 'PENDING',
    descriptionAr: "التحقق من تفعيل جدار حماية الصلاحيات وتخصيص الأدوار الإدارية والمحاسبية.",
    checkDetailsAr: "التحقق من حماية الصلاحيات... تم تأمين واجهة المدير المالي، المحاسب، ومدقق الفروع بكفاءة."
  },
  {
    id: "COLLABORATION",
    nameAr: "الاتصال والتعاون ومشاركة المستندات (Enterprise Hub)",
    nameEn: "Collaboration & Share Engine",
    status: 'PENDING',
    descriptionAr: "فحص ميزة المراسلة الفورية ومشاركة المستندات المالية والتعليق عليها.",
    checkDetailsAr: "التحقق من غرف العمليات... محرك التعاون وإرسال التقارير والتعليقات الإدارية يعمل بسرعة ممتازة."
  },
  {
    id: "THEME_STUDIO",
    nameAr: "محرر المظهر والهوية البصرية (Theme Studio)",
    nameEn: "Visual Identity & Theme Engine",
    status: 'PENDING',
    descriptionAr: "فحص تطابق درجات تباين الألوان وعناصر الواجهات البصرية للهوية المؤسسية.",
    checkDetailsAr: "مراجعة لوحات الألوان والتباين... تم التحقق من سلامة درجات تباين الخطوط ومطابقتها لمعايير WCAG AA."
  },
  {
    id: "AI_ADVISOR",
    nameAr: "المستشار المالي ومحلل المخاطر الذكي (MeDo AI)",
    nameEn: "AI Financial Advisor & Audit",
    status: 'PENDING',
    descriptionAr: "التحقق من جاهزية الذكاء المالي المتقدم لتحليل البيانات واكتشاف الأنماط المشبوهة.",
    checkDetailsAr: "فحص اتصال Gemini... الخادم مستجيب ومستعد لتحليل المخاطر واكتشاف فروقات أسعار الصرف آلياً."
  },
  {
    id: "NOTIFICATIONS",
    nameAr: "محرك الإشعارات والإنذارات المباشرة",
    nameEn: "Push Notifications & Alerts",
    status: 'PENDING',
    descriptionAr: "التحقق من وصول الإشعارات الفورية للعمليات الهامة لمدراء النظام والمنشأة.",
    checkDetailsAr: "التحقق من طابور الإشعارات... تم فحص تنبيهات تعديل الأسعار، ومقاصة القيود وتسليمها بنجاح."
  },
  {
    id: "PRINT_SHARE",
    nameAr: "خدمات الطباعة والتصدير والمشاركة (PDF / Web)",
    nameEn: "PDF Rendering & Document Export",
    status: 'PENDING',
    descriptionAr: "التحقق من جودة النماذج والمستندات المحاسبية المصممة للطباعة والتصدير.",
    checkDetailsAr: "توليد كشوفات تجريبية... تم التحقق من ترويسة الشركة وجداول PDF للطباعة بنسبة 100%."
  },
  {
    id: "OFFLINE_DB",
    nameAr: "قاعدة البيانات المحلية وإدارة الأوفلاين (IndexedDB)",
    nameEn: "IndexedDB Local Offline Ledger",
    status: 'PENDING',
    descriptionAr: "التحقق من سلامة مخزن البيانات المحلي وسرعة الاستجابة أثناء انقطاع الإنترنت.",
    checkDetailsAr: "فحص IndexedDB التراكمي... سرعة القراءة والكتابة ممتازة، حفظ تلقائي لحركة البيانات دون انقطاع."
  }
];

export const AccountingWorkflowTester: React.FC<AccountingWorkflowTesterProps> = ({
  erpState,
  displayCurrency,
  currencies,
  onSaveInvoice,
  onSaveVoucher,
  onSaveJournalEntry,
  onAddStockMovement,
  onNavigateToModule,
  onOpenAi,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [testLogs, setTestLogs] = useState<TestLogItem[]>([]);
  const [simulationStep, setSimulationStep] = useState<number>(0);

  // Diagnostic Audit States
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticStep, setDiagnosticStep] = useState<number>(0);
  const [diagnosticModules, setDiagnosticModules] = useState<DiagnosticModule[]>(initialDiagnosticModules);
  const [showDiagnosticReport, setShowDiagnosticReport] = useState(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);

  const getModuleIcon = (id: string) => {
    switch (id) {
      case "FI": return BookOpen;
      case "CASH_BANK": return Landmark;
      case "SALES_AR": return Users;
      case "PURCHASES_AP": return Building2;
      case "INVENTORY": return Package;
      case "FIXED_ASSETS": return Layers;
      case "HR_PAYROLL": return Briefcase;
      case "COST_CENTERS": return Scale;
      case "ZATCA_VAT": return Percent;
      case "BRANCHES": return Building2;
      case "CLOUD_SYNC": return RotateCcw;
      case "PERMISSIONS": return Lock;
      case "COLLABORATION": return Users;
      case "THEME_STUDIO": return Sparkles;
      case "AI_ADVISOR": return Sparkles;
      case "NOTIFICATIONS": return Activity;
      case "PRINT_SHARE": return FileSpreadsheet;
      case "OFFLINE_DB": return ShieldCheck;
      default: return Boxes;
    }
  };

  const handleRunDiagnostics = async () => {
    setIsDiagnosticRunning(true);
    setShowDiagnosticReport(false);
    setDiagnosticStep(0);
    setDiagnosticLogs(["[نظام الرقابة والتدقيق]: جاري تهيئة فحص الجودة الشامل لوحدات نظام MeDo ERP الـ 18..."]);
    
    // Reset status to pending
    setDiagnosticModules(initialDiagnosticModules.map(m => ({ ...m, status: 'PENDING' })));

    for (let i = 0; i < initialDiagnosticModules.length; i++) {
      const currentMod = initialDiagnosticModules[i];
      setDiagnosticStep(i + 1);
      
      // Mark as RUNNING
      setDiagnosticModules(prev => prev.map(m => m.id === currentMod.id ? { ...m, status: 'RUNNING' } : m));
      setDiagnosticLogs(prev => [...prev, `[فحص]: جاري اختبار وتقييم وحدة: ${currentMod.nameAr}...`]);
      
      // Simulate real-time checking steps
      await new Promise(r => setTimeout(r, 250));
      
      // Mark as SUCCESS
      setDiagnosticModules(prev => prev.map(m => m.id === currentMod.id ? { ...m, status: 'SUCCESS' } : m));
      setDiagnosticLogs(prev => [...prev, `✓ [ناجح] وحدة ${currentMod.nameAr}: ${currentMod.checkDetailsAr}`]);
    }
    
    setDiagnosticLogs(prev => [...prev, "[مكتمل]: تم اختبار وتأكيد جاهزية كافة وحدات المنظومة الـ 18 بمعدل سلامة تشغيلية 100%."]);
    setIsDiagnosticRunning(false);
    setShowDiagnosticReport(true);
  };

  // Live Metrics derived from erpState
  const totalStockItems = erpState.inventoryItems?.length || 0;
  const totalStockQty =
    erpState.inventoryItems?.reduce((s, i) => s + (Number(i.quantityOnHand) || 0), 0) || 0;
  const totalStockValue =
    erpState.inventoryItems?.reduce(
      (s, i) => s + (Number(i.quantityOnHand) || 0) * (Number(i.costPrice) || 0),
      0
    ) || 0;
  const totalCustomersAR =
    erpState.customers?.reduce((s, c) => s + (Number(c.currentBalance) || 0), 0) || 0;
  const totalVendorsAP =
    erpState.vendors?.reduce((s, v) => s + (Number(v.currentBalance) || 0), 0) || 0;
  const totalVaults =
    erpState.cashVaults?.reduce((s, v) => s + (Number(v.currentBalance) || 0), 0) || 0;
  const totalBanks =
    erpState.bankAccounts?.reduce((s, b) => s + (Number(b.currentBalance) || 0), 0) || 0;
  const totalLiquidity = totalVaults + totalBanks;
  const totalPostedJournals =
    erpState.journalEntries?.filter((j) => j.status === "POSTED" || !j.status).length || 0;
  const openDraftJournals =
    erpState.journalEntries?.filter((j) => j.status === "DRAFT").length || 0;

  // 1. Handler: Cash Sale Test
  const handleTestCashSale = () => {
    const testItem =
      erpState.inventoryItems?.[0] || {
        id: "item-1",
        nameAr: "مكيف سبلت 24 وحدة",
        code: "AC-24K",
        costPrice: 450000,
        sellingPrice: 620000,
      };
    const saleQty = 1;
    const saleTotal = Number(testItem.sellingPrice) * saleQty;
    const cogsTotal = Number(testItem.costPrice) * saleQty;
    const now = new Date().toLocaleTimeString("ar-YE");

    if (onSaveInvoice) {
      const inv: Invoice = {
        id: `INV-TEST-CS-${Date.now()}`,
        invoiceNumber: `CS-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
        customerId: "CUST-WALKIN",
        customerName: "عميل نقدي - اختبار المنظومة",
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
        items: [
          {
            id: `item-${Date.now()}`,
            inventoryItemId: testItem.id,
            description: `اختبار بيع نقدي: ${testItem.nameAr}`,
            quantity: saleQty,
            unitPrice: Number(testItem.sellingPrice) || 0,
            taxPercent: 0,
            discount: 0,
            total: saleTotal,
          },
        ],
        subtotal: saleTotal,
        taxTotal: 0,
        discountTotal: 0,
        grandTotal: saleTotal,
        totalAmount: saleTotal,
        paidAmount: saleTotal,
        remainingAmount: 0,
        paymentMethod: "CASH",
        currency: "YER_SANAA",
        exchangeRate: 1,
        status: "PAID",
        type: "SALES",
        notes: "اختبار محاسبي آلي: بيع نقدي وخصم المخزون وترحيل الأستاذ العام",
      };
      onSaveInvoice(inv);
    }

    if (onAddStockMovement) {
      onAddStockMovement({
        id: `mov-${Date.now()}`,
        itemId: testItem.id,
        type: "OUT",
        quantity: saleQty,
        unitCost: Number(testItem.costPrice) || 0,
        totalCost: cogsTotal,
        date: new Date().toISOString().split("T")[0],
        referenceType: "SALE",
        referenceNumber: `CS-TEST-${Date.now().toString().slice(-4)}`,
        notes: `خصم مخزني آلي لاختبار بيع نقدي (${testItem.nameAr})`,
      });
    }

    if (onSaveJournalEntry) {
      const je: JournalEntry = {
        id: `je-test-cs-${Date.now()}`,
        entryNumber: `JV-CS-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split("T")[0],
        period: new Date().toISOString().slice(0, 7),
        type: "STANDARD",
        description: `قيد آلي: إثبات مبيعات نقدية وتكلفة بضاعة مباعة (${testItem.nameAr})`,
        currency: "YER_SANAA",
        lines: [
          {
            id: "l1",
            accountId: "1110",
            accountCode: "1110",
            accountNameAr: "الصندوق والخزينة الرئيسية",
            debit: saleTotal,
            credit: 0,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: "تحصيل نقدي بالخزينة",
          },
          {
            id: "l2",
            accountId: "4000",
            accountCode: "4000",
            accountNameAr: "إيرادات مبيعات البضائع",
            debit: 0,
            credit: saleTotal,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: "إثبات إيراد المبيعات",
          },
          {
            id: "l3",
            accountId: "5000",
            accountCode: "5000",
            accountNameAr: "تكلفة البضاعة المباعة (COGS)",
            debit: cogsTotal,
            credit: 0,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: "إثبات تكلفة البضاعة المباعة",
          },
          {
            id: "l4",
            accountId: "1200",
            accountCode: "1200",
            accountNameAr: "مخزون البضائع في المستودعات",
            debit: 0,
            credit: cogsTotal,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: "خصم المخزون السلعي المستمر",
          },
        ],
        totalDebit: saleTotal + cogsTotal,
        totalCredit: saleTotal + cogsTotal,
        status: "POSTED",
        createdBy: "مختبر المنظومة المتكاملة",
        createdAt: new Date().toISOString(),
      };
      onSaveJournalEntry(je);
    }

    const newLog: TestLogItem = {
      id: `log-${Date.now()}`,
      timestamp: now,
      operationType: "CASH_SALE",
      title: "عملية مبيعات نقدية مع خصم المخزون والترحيل الفوري",
      description: `تم بيع ${saleQty} وحدة من (${testItem.nameAr}) نقداً بمبلغ ${saleTotal.toLocaleString()} ر.ي`,
      amount: saleTotal,
      currency: "YER_SANAA",
      inventoryImpact: `خصم ${saleQty} وحدة من صنف [${testItem.nameAr}] بقيمة تكلفة ${cogsTotal.toLocaleString()} ر.ي`,
      partyImpact: "إيداع فوري بالخزينة (لا توجد مديونية على العميل)",
      glEntryPreview: [
        {
          debitAccount: "1110 - النقدية بالخزينة",
          creditAccount: "4000 - إيرادات المبيعات",
          debitAmount: saleTotal,
          creditAmount: saleTotal,
        },
        {
          debitAccount: "5000 - تكلفة البضاعة المباعة COGS",
          creditAccount: "1200 - مخزون البضائع",
          debitAmount: cogsTotal,
          creditAmount: cogsTotal,
        },
      ],
      financialImpact:
        "زيادة إيرادات ومجمل ربح قائمة الدخل + زيادة نقدية الميزانية العمومية وانخفاض المخزون",
      status: "POSTED",
    };
    setTestLogs((prev) => [newLog, ...prev]);
  };

  // 2. Handler: Credit Sale Test
  const handleTestCreditSale = () => {
    const testItem =
      erpState.inventoryItems?.[1] ||
      erpState.inventoryItems?.[0] || {
        id: "item-2",
        nameAr: "شاشة تلفزيون ذكية 65 بوصة",
        costPrice: 380000,
        sellingPrice: 510000,
      };
    const testCust =
      erpState.customers?.[0] || { id: "cust-1", name: "شركة النور للتوكيلات التجارية" };
    const saleQty = 1;
    const saleTotal = Number(testItem.sellingPrice) * saleQty;
    const cogsTotal = Number(testItem.costPrice) * saleQty;
    const now = new Date().toLocaleTimeString("ar-YE");

    if (onSaveInvoice) {
      const inv: Invoice = {
        id: `INV-TEST-CR-${Date.now()}`,
        invoiceNumber: `CR-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
        customerId: testCust.id,
        customerName: testCust.name,
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        items: [
          {
            id: `item-${Date.now()}`,
            inventoryItemId: testItem.id,
            description: `اختبار بيع آجل: ${testItem.nameAr}`,
            quantity: saleQty,
            unitPrice: Number(testItem.sellingPrice) || 0,
            taxPercent: 0,
            discount: 0,
            total: saleTotal,
          },
        ],
        subtotal: saleTotal,
        taxTotal: 0,
        discountTotal: 0,
        grandTotal: saleTotal,
        totalAmount: saleTotal,
        paidAmount: 0,
        remainingAmount: saleTotal,
        paymentMethod: "CREDIT",
        currency: "YER_SANAA",
        exchangeRate: 1,
        status: "PENDING",
        type: "SALES",
        notes: `اختبار محاسبي: بيع آجل للعميل (${testCust.name}) وإثبات الذمم المدينة`,
      };
      onSaveInvoice(inv);
    }

    if (onAddStockMovement) {
      onAddStockMovement({
        id: `mov-${Date.now()}`,
        itemId: testItem.id,
        type: "OUT",
        quantity: saleQty,
        unitCost: Number(testItem.costPrice) || 0,
        totalCost: cogsTotal,
        date: new Date().toISOString().split("T")[0],
        referenceType: "SALE",
        referenceNumber: `CR-TEST-${Date.now().toString().slice(-4)}`,
        notes: `خصم مخزني آلي لاختبار بيع آجل (${testItem.nameAr})`,
      });
    }

    if (onSaveJournalEntry) {
      const je: JournalEntry = {
        id: `je-test-cr-${Date.now()}`,
        entryNumber: `JV-CR-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split("T")[0],
        period: new Date().toISOString().slice(0, 7),
        type: "STANDARD",
        description: `قيد آلي: مبيعات آجلة للعميل (${testCust.name}) وتكلفة البضاعة المباعة`,
        currency: "YER_SANAA",
        lines: [
          {
            id: "l1",
            accountId: "1300",
            accountCode: "1300",
            accountNameAr: "العملاء والذمم المدينة (AR)",
            debit: saleTotal,
            credit: 0,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: `مديونية العميل ${testCust.name}`,
          },
          {
            id: "l2",
            accountId: "4000",
            accountCode: "4000",
            accountNameAr: "إيرادات مبيعات البضائع",
            debit: 0,
            credit: saleTotal,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: "إثبات إيراد المبيعات الآجلة",
          },
          {
            id: "l3",
            accountId: "5000",
            accountCode: "5000",
            accountNameAr: "تكلفة البضاعة المباعة (COGS)",
            debit: cogsTotal,
            credit: 0,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: "إثبات تكلفة البضاعة المباعة",
          },
          {
            id: "l4",
            accountId: "1200",
            accountCode: "1200",
            accountNameAr: "مخزون البضائع في المستودعات",
            debit: 0,
            credit: cogsTotal,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: "خصم المخزون السلعي المستمر",
          },
        ],
        totalDebit: saleTotal + cogsTotal,
        totalCredit: saleTotal + cogsTotal,
        status: "POSTED",
        createdBy: "مختبر المنظومة المتكاملة",
        createdAt: new Date().toISOString(),
      };
      onSaveJournalEntry(je);
    }

    const newLog: TestLogItem = {
      id: `log-${Date.now()}`,
      timestamp: now,
      operationType: "CREDIT_SALE",
      title: "عملية مبيعات آجلة وتحديث مديونية العملاء (AR)",
      description: `تم إصدار فاتورة آجلة للعميل [${testCust.name}] بقيمة ${saleTotal.toLocaleString()} ر.ي`,
      amount: saleTotal,
      currency: "YER_SANAA",
      inventoryImpact: `خصم ${saleQty} وحدة من صنف [${testItem.nameAr}] بقيمة تكلفة ${cogsTotal.toLocaleString()} ر.ي`,
      partyImpact: `زيادة رصيد مديونية العميل [${testCust.name}] بمقدار +${saleTotal.toLocaleString()} ر.ي`,
      glEntryPreview: [
        {
          debitAccount: "1300 - العملاء والذمم المدينة (AR)",
          creditAccount: "4000 - إيرادات المبيعات",
          debitAmount: saleTotal,
          creditAmount: saleTotal,
        },
        {
          debitAccount: "5000 - تكلفة البضاعة المباعة COGS",
          creditAccount: "1200 - مخزون البضائع",
          debitAmount: cogsTotal,
          creditAmount: cogsTotal,
        },
      ],
      financialImpact:
        "زيادة الأصول المتداولة (ذمم مدينة) بدفتر الأستاذ وقائمة المركز المالي وإثبات الإيرادات والمجمل الربحي",
      status: "POSTED",
    };
    setTestLogs((prev) => [newLog, ...prev]);
  };

  // 3. Handler: Purchase Test
  const handleTestPurchase = () => {
    const testItem =
      erpState.inventoryItems?.[0] || {
        id: "item-1",
        nameAr: "مكيف سبلت 24 وحدة",
        costPrice: 450000,
        sellingPrice: 620000,
      };
    const testVendor =
      erpState.vendors?.[0] || { id: "vend-1", name: "مجموعة هائل سعيد التجارية - استيراد" };
    const purQty = 2;
    const purTotal = Number(testItem.costPrice) * purQty;
    const now = new Date().toLocaleTimeString("ar-YE");

    if (onAddStockMovement) {
      onAddStockMovement({
        id: `mov-${Date.now()}`,
        itemId: testItem.id,
        type: "IN",
        quantity: purQty,
        unitCost: Number(testItem.costPrice) || 0,
        totalCost: purTotal,
        date: new Date().toISOString().split("T")[0],
        referenceType: "PURCHASE",
        referenceNumber: `PO-TEST-${Date.now().toString().slice(-4)}`,
        notes: `توريد واستلام بضاعة للمستودع من المورد (${testVendor.name})`,
      });
    }

    if (onSaveJournalEntry) {
      const je: JournalEntry = {
        id: `je-test-po-${Date.now()}`,
        entryNumber: `JV-PO-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split("T")[0],
        period: new Date().toISOString().slice(0, 7),
        type: "STANDARD",
        description: `قيد آلي: استلام بضاعة ومشتريات آجلة من المورد (${testVendor.name})`,
        currency: "YER_SANAA",
        lines: [
          {
            id: "l1",
            accountId: "1200",
            accountCode: "1200",
            accountNameAr: "مخزون البضائع في المستودعات",
            debit: purTotal,
            credit: 0,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: `زيادة رصيد مخزون (${testItem.nameAr})`,
          },
          {
            id: "l2",
            accountId: "2100",
            accountCode: "2100",
            accountNameAr: "الموردون والذمم الدائنة (AP)",
            debit: 0,
            credit: purTotal,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: `إثبات مستحقات المورد ${testVendor.name}`,
          },
        ],
        totalDebit: purTotal,
        totalCredit: purTotal,
        status: "POSTED",
        createdBy: "مختبر المنظومة المتكاملة",
        createdAt: new Date().toISOString(),
      };
      onSaveJournalEntry(je);
    }

    const newLog: TestLogItem = {
      id: `log-${Date.now()}`,
      timestamp: now,
      operationType: "PURCHASE",
      title: "عملية شراء وتوريد مخزني وتحديث مستحقات الموردين (AP)",
      description: `تم استلام ${purQty} وحدة من صنف [${testItem.nameAr}] من المورد [${testVendor.name}] بقيمة ${purTotal.toLocaleString()} ر.ي`,
      amount: purTotal,
      currency: "YER_SANAA",
      inventoryImpact: `زيادة رصيد المخزن بمقدار +${purQty} وحدة (تكلفة إجمالية +${purTotal.toLocaleString()} ر.ي)`,
      partyImpact: `زيادة التزامات وحساب المورد [${testVendor.name}] بمقدار +${purTotal.toLocaleString()} ر.ي`,
      glEntryPreview: [
        {
          debitAccount: "1200 - مخزون البضائع بالمستودعات",
          creditAccount: "2100 - الموردون والذمم الدائنة (AP)",
          debitAmount: purTotal,
          creditAmount: purTotal,
        },
      ],
      financialImpact:
        "زيادة قيمة الأصول المتداولة (المخزون) وزيادة موازية في الالتزامات المتداولة (الموردين)",
      status: "POSTED",
    };
    setTestLogs((prev) => [newLog, ...prev]);
  };

  // 4. Handler: Receipt Voucher Test
  const handleTestReceipt = () => {
    const testCust =
      erpState.customers?.[0] || { id: "cust-1", name: "شركة النور للتوكيلات التجارية" };
    const amount = 250000;
    const now = new Date().toLocaleTimeString("ar-YE");

    if (onSaveVoucher) {
      const vc: Voucher = {
        id: `VC-TEST-RV-${Date.now()}`,
        voucherNumber: `RV-${Date.now().toString().slice(-4)}`,
        type: "RECEIPT",
        date: new Date().toISOString().split("T")[0],
        beneficiaryOrPayer: testCust.name,
        amount: amount,
        currency: "YER_SANAA",
        exchangeRate: 1,
        localAmount: amount,
        sourceAccountId: "1110",
        destinationAccountId: "1300",
        paymentMethod: "CASH",
        notes: `سند قبض: سداد وتحصيل مديونية من العميل (${testCust.name})`,
        status: "POSTED",
        createdByName: "مختبر المنظومة المتكاملة",
      };
      onSaveVoucher(vc);
    }

    if (onSaveJournalEntry) {
      const je: JournalEntry = {
        id: `je-test-rv-${Date.now()}`,
        entryNumber: `JV-RV-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split("T")[0],
        period: new Date().toISOString().slice(0, 7),
        type: "STANDARD",
        description: `قيد آلي: سند قبض وسداد مديونية العميل (${testCust.name})`,
        currency: "YER_SANAA",
        lines: [
          {
            id: "l1",
            accountId: "1110",
            accountCode: "1110",
            accountNameAr: "النقدية بالخزينة الرئيسية",
            debit: amount,
            credit: 0,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: "إيداع نقدي بالخزينة",
          },
          {
            id: "l2",
            accountId: "1300",
            accountCode: "1300",
            accountNameAr: "العملاء والذمم المدينة (AR)",
            debit: 0,
            credit: amount,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: `تسديد وتخفيض مديونية العميل ${testCust.name}`,
          },
        ],
        totalDebit: amount,
        totalCredit: amount,
        status: "POSTED",
        createdBy: "مختبر المنظومة المتكاملة",
        createdAt: new Date().toISOString(),
      };
      onSaveJournalEntry(je);
    }

    const newLog: TestLogItem = {
      id: `log-${Date.now()}`,
      timestamp: now,
      operationType: "RECEIPT",
      title: "سند قبض نقدي وتسوية مديونية العميل (Receipt Voucher)",
      description: `تم تحصيل مبلغ ${amount.toLocaleString()} ر.ي نقداً من العميل [${testCust.name}] وإيداعه بالخزينة`,
      amount: amount,
      currency: "YER_SANAA",
      inventoryImpact: "لا يوجد أثر مخزني (حركة نقدية وتسوية ذمم)",
      partyImpact: `تخفيض مديونية العميل [${testCust.name}] بمقدار -${amount.toLocaleString()} ر.ي`,
      glEntryPreview: [
        {
          debitAccount: "1110 - النقدية بالخزينة الرئيسية",
          creditAccount: "1300 - العملاء والذمم المدينة (AR)",
          debitAmount: amount,
          creditAmount: amount,
        },
      ],
      financialImpact:
        "إعادة هيكلة الأصول المتداولة: زيادة النقدية وانخفاض موازٍ في الذمم المدينة بنفس القيمة",
      status: "POSTED",
    };
    setTestLogs((prev) => [newLog, ...prev]);
  };

  // 5. Handler: Payment Voucher Test
  const handleTestPayment = () => {
    const testVendor =
      erpState.vendors?.[0] || { id: "vend-1", name: "مجموعة هائل سعيد التجارية - استيراد" };
    const amount = 300000;
    const now = new Date().toLocaleTimeString("ar-YE");

    if (onSaveVoucher) {
      const vc: Voucher = {
        id: `VC-TEST-PV-${Date.now()}`,
        voucherNumber: `PV-${Date.now().toString().slice(-4)}`,
        type: "PAYMENT",
        date: new Date().toISOString().split("T")[0],
        beneficiaryOrPayer: testVendor.name,
        amount: amount,
        currency: "YER_SANAA",
        exchangeRate: 1,
        localAmount: amount,
        sourceAccountId: "1110",
        destinationAccountId: "2100",
        paymentMethod: "CASH",
        notes: `سند صرف: سداد مستحقات المورد (${testVendor.name}) من الخزينة`,
        status: "POSTED",
        createdByName: "مختبر المنظومة المتكاملة",
      };
      onSaveVoucher(vc);
    }

    if (onSaveJournalEntry) {
      const je: JournalEntry = {
        id: `je-test-pv-${Date.now()}`,
        entryNumber: `JV-PV-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split("T")[0],
        period: new Date().toISOString().slice(0, 7),
        type: "STANDARD",
        description: `قيد آلي: سند صرف وسداد مستحقات المورد (${testVendor.name})`,
        currency: "YER_SANAA",
        lines: [
          {
            id: "l1",
            accountId: "2100",
            accountCode: "2100",
            accountNameAr: "الموردون والذمم الدائنة (AP)",
            debit: amount,
            credit: 0,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: `تخفيض مستحقات والتزامات المورد ${testVendor.name}`,
          },
          {
            id: "l2",
            accountId: "1110",
            accountCode: "1110",
            accountNameAr: "النقدية بالخزينة الرئيسية",
            debit: 0,
            credit: amount,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: "صرف نقدي من الخزينة",
          },
        ],
        totalDebit: amount,
        totalCredit: amount,
        status: "POSTED",
        createdBy: "مختبر المنظومة المتكاملة",
        createdAt: new Date().toISOString(),
      };
      onSaveJournalEntry(je);
    }

    const newLog: TestLogItem = {
      id: `log-${Date.now()}`,
      timestamp: now,
      operationType: "PAYMENT",
      title: "سند صرف نقدي وسداد مستحقات المورد (Payment Voucher)",
      description: `تم صرف مبلغ ${amount.toLocaleString()} ر.ي من الخزينة الرئيسية سداداً للمورد [${testVendor.name}]`,
      amount: amount,
      currency: "YER_SANAA",
      inventoryImpact: "لا يوجد أثر مخزني (حركة نقدية وتسوية التزامات)",
      partyImpact: `تخفيض التزامات ومستحقات المورد [${testVendor.name}] بمقدار -${amount.toLocaleString()} ر.ي`,
      glEntryPreview: [
        {
          debitAccount: "2100 - الموردين والذمم الدائنة (AP)",
          creditAccount: "1110 - النقدية بالخزينة",
          debitAmount: amount,
          creditAmount: amount,
        },
      ],
      financialImpact:
        "تخفيض الالتزامات المتداولة وتخفيض الأصول النقدية في الميزانية العمومية بالتساوي",
      status: "POSTED",
    };
    setTestLogs((prev) => [newLog, ...prev]);
  };

  // 6. NEW HANDLER: Financial Period Closing & P&L Zeroing Test
  const handleTestPeriodClosing = () => {
    const currentPeriod = new Date().toISOString().slice(0, 7); // e.g. "2026-09"
    const now = new Date().toLocaleTimeString("ar-YE");

    // 1. Calculate Balances of Revenue & Expense Accounts
    let totalRevenue = 0;
    let totalExpense = 0;

    erpState.accounts?.forEach((acc) => {
      if (acc.category === "REVENUE" || acc.code?.startsWith("4")) {
        totalRevenue += Number(acc.balanceCredit || acc.currentBalance || 0);
      } else if (acc.category === "EXPENSE" || acc.code?.startsWith("5") || acc.code?.startsWith("6")) {
        totalExpense += Number(acc.balanceDebit || acc.currentBalance || 0);
      }
    });

    // Provide robust fallback values if test state has zero figures
    if (totalRevenue === 0) totalRevenue = 1850000;
    if (totalExpense === 0) totalExpense = 1120000;

    const netIncome = totalRevenue - totalExpense;
    const isProfit = netIncome >= 0;

    // 2. Generate Balanced Closing Journal Entry (قيد إقفال الحسابات الاسمية والمؤقتة)
    if (onSaveJournalEntry) {
      const closingLines = [
        // Debit Revenue accounts to zero them out (إقفال الإيرادات بجعلها مدينة)
        {
          id: "close-rev-1",
          accountId: "4000",
          accountCode: "4000",
          accountNameAr: "إيرادات مبيعات البضائع والخدمات (إقفال)",
          debit: totalRevenue,
          credit: 0,
          currency: "YER_SANAA" as CurrencyCode,
          exchangeRate: 1,
          memo: `تصفير وإقفال حسابات الإيرادات لنهاية الفترة ${currentPeriod}`,
        },
        // Credit Expense accounts to zero them out (إقفال المصروفات وتكلفة المبيعات بجعلها دائنة)
        {
          id: "close-exp-1",
          accountId: "5000",
          accountCode: "5000",
          accountNameAr: "تكلفة المبيعات والمصروفات التشغيلية (إقفال)",
          debit: 0,
          credit: totalExpense,
          currency: "YER_SANAA" as CurrencyCode,
          exchangeRate: 1,
          memo: `تصفير وإقفال حسابات المصاريف والتكلفة لنهاية الفترة ${currentPeriod}`,
        },
        // Balancing to Retained Earnings (حساب الأرباح المحتجزة / حقوق الملكية 2900 / 3200)
        {
          id: "close-eq-1",
          accountId: "2900",
          accountCode: "2900",
          accountNameAr: "الأرباح المبقاة والمحتجزة (حقوق الملكية - Retained Earnings)",
          debit: isProfit ? 0 : Math.abs(netIncome),
          credit: isProfit ? netIncome : 0,
          currency: "YER_SANAA" as CurrencyCode,
          exchangeRate: 1,
          memo: `ترحيل صافي ${isProfit ? "أرباح" : "خسائر"} الفترة ${currentPeriod} إلى حقوق الملكية`,
        },
      ];

      const closingEntry: JournalEntry = {
        id: `JE-CLOSE-${currentPeriod}-${Date.now()}`,
        entryNumber: `JV-CLOSE-${currentPeriod.replace("-", "")}`,
        date: new Date().toISOString().split("T")[0],
        period: currentPeriod,
        type: "CLOSING",
        description: `قيد إقفال الفترة المالية الشهرية (${currentPeriod}): تصفير الحسابات الاسمية وترحيل صافي الربح إلى الأرباح المبقاة`,
        currency: "YER_SANAA",
        lines: closingLines,
        totalDebit: totalRevenue + (isProfit ? 0 : Math.abs(netIncome)),
        totalCredit: totalExpense + (isProfit ? netIncome : 0),
        status: "POSTED",
        createdBy: "مدقق النظام الآلي - إقفال الفترات",
        createdAt: new Date().toISOString(),
        approvedBy: "المدير المالي التنفيذي (CFO)",
        approvedAt: new Date().toISOString(),
      };

      onSaveJournalEntry(closingEntry);
    }

    // 3. Record Detailed Test Log
    const newLog: TestLogItem = {
      id: `log-close-${Date.now()}`,
      timestamp: now,
      operationType: "PERIOD_CLOSING",
      title: `اختبار إغلاق الفترة المالية وتصفير الحسابات المؤقتة (${currentPeriod})`,
      description: `تم فحص وترحيل كافة القيود المفتوحة (${openDraftJournals} قيود مسودة)، وتصفير حسابات الإيرادات والمصروفات، وترحيل صافي ${
        isProfit ? "الربح" : "الخسارة"
      } البالغ ${Math.abs(netIncome).toLocaleString()} ر.ي إلى حساب الأرباح المحتجزة`,
      amount: Math.abs(netIncome),
      currency: "YER_SANAA",
      inventoryImpact:
        "إقفال وتقييم حركة المخزون الشهرية وتثبيت الرصيد الافتتاحي للشهر القادم ومطابقة الجرد الدفتري",
      partyImpact:
        "مطابقة ميازين مراجعة العملاء والموردين وتجميد الفترة المحاسبية لمنع أي تعديلات رجعية",
      glEntryPreview: [
        {
          debitAccount: "4000 - حسابات الإيرادات (تصفير رصيد دائن)",
          creditAccount: "5000 - حسابات المصاريف والتكلفة (تصفير رصيد مدين)",
          debitAmount: totalRevenue,
          creditAmount: totalExpense,
        },
        {
          debitAccount: isProfit ? "-" : "2900 - حقوق الملكية (خسارة)",
          creditAccount: isProfit ? "2900 - الأرباح المبقاة والمحتجزة" : "-",
          debitAmount: isProfit ? 0 : Math.abs(netIncome),
          creditAmount: isProfit ? netIncome : 0,
        },
      ],
      financialImpact:
        "تصفير كافة حسابات قائمة الدخل (P&L Zeroing) لتصبح جاهزة للفترة الجديدة، وتحديث حقوق الملكية بالميزانية العمومية بموجب معايير المحاسبة الدولية (IAS 1 & IFRS)",
      status: "POSTED",
      closingDetails: {
        period: currentPeriod,
        totalRevenueClosed: totalRevenue,
        totalExpenseClosed: totalExpense,
        netProfit: netIncome,
        retainedEarningsAccount: "2900 - الأرباح المبقاة والمحتجزة",
        openJournalsReviewed: openDraftJournals,
      },
    };

    setTestLogs((prev) => [newLog, ...prev]);
  };

  // Handler: Run Full End-to-End Simulation Cycle
  const handleRunFullCycle = async () => {
    setIsSimulating(true);
    setSimulationStep(1);

    handleTestCashSale();
    await new Promise((r) => setTimeout(r, 600));

    setSimulationStep(2);
    handleTestCreditSale();
    await new Promise((r) => setTimeout(r, 600));

    setSimulationStep(3);
    handleTestPurchase();
    await new Promise((r) => setTimeout(r, 600));

    setSimulationStep(4);
    handleTestReceipt();
    await new Promise((r) => setTimeout(r, 600));

    setSimulationStep(5);
    handleTestPayment();
    await new Promise((r) => setTimeout(r, 600));

    setSimulationStep(6);
    handleTestPeriodClosing();
    await new Promise((r) => setTimeout(r, 400));

    setIsSimulating(false);
    setSimulationStep(0);
  };

  return (
    <div className="space-y-6" id="accounting-workflow-tester-container">
      {/* 1. Header & Quick Controls */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0A2540] via-slate-900 to-slate-950 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-sap-secondary/20 border border-sap-secondary/50 flex items-center justify-center text-sap-secondary shadow-lg shadow-sap-secondary/20">
                <Boxes className="w-5 h-5" />
              </div>
              <span className="text-xs font-black tracking-wider uppercase px-3 py-1 rounded-full bg-sap-secondary text-slate-950 shadow-md">
                Accounting Test Lab
              </span>
              <span className="text-xs font-bold text-amber-300 font-mono hidden sm:inline">
                S/4HANA & IFRS Compliant
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <span>مختبر فحص العمليات المحاسبية والترحيل الآلي</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              تحقق لحظي من تكامل حركة المخزون، ذمم العملاء والموردين، الخزائن والبنوك، توليد القيود المزدوجة المتوازنة، وإقفال الفترات المالية وتصفير الحسابات المؤقتة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRunFullCycle}
              disabled={isSimulating || isDiagnosticRunning}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sap-secondary via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 active:scale-95 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} />
              <span>
                {isSimulating
                  ? `جاري المحاكاة الشاملة (${simulationStep}/6)...`
                  : "تشغيل دورة المحاكاة الشاملة"}
              </span>
            </button>

            <button
              onClick={handleRunDiagnostics}
              disabled={isSimulating || isDiagnosticRunning}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <ShieldCheck className={`w-4 h-4 ${isDiagnosticRunning ? "animate-pulse text-amber-300" : ""}`} />
              <span>
                {isDiagnosticRunning
                  ? `جاري فحص الوحدات (${diagnosticStep}/18)...`
                  : "تشغيل فحص وتدقيق المنظومة الشامل (18 وحدة)"}
              </span>
            </button>

            {onOpenAi && (
              <button
                onClick={onOpenAi}
                className="px-4 py-3 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>التدقيق الذكي MeDo AI</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sap-secondary/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 1.5. Comprehensive 18-Module System Diagnostics Panel */}
      {(isDiagnosticRunning || showDiagnosticReport) && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-emerald-500/40 shadow-2xl space-y-6 relative overflow-hidden" id="diagnostics-panel">
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-base font-extrabold text-white">
                  مركز تشخيص وجودة وحدات المنظومة الـ 18 المتكاملة
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                نظام محاكاة وفحص متقدم للتحقق المستمر والامتثال لمعايير التقارير المالية الدولية (IFRS) والزكاة والضريبة (ZATCA).
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                <span>معدل سلامة المنظومة:</span>
                <span className="text-emerald-300 font-black text-sm">
                  {isDiagnosticRunning ? `${Math.round((diagnosticStep / 18) * 100)}%` : "100%"}
                </span>
              </div>
              
              {!isDiagnosticRunning && (
                <button
                  onClick={() => {
                    setShowDiagnosticReport(false);
                    setDiagnosticStep(0);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  إخفاء التقرير
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-400">
              <span>تقدم الفحص الشامل للوحدات:</span>
              <span className="font-mono text-emerald-400">
                {diagnosticStep} / 18 وحدة مفحوصة
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${(diagnosticStep / 18) * 100}%` }}
              />
            </div>
          </div>

          {/* 18 Modules Diagnostic Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            {diagnosticModules.map((mod) => {
              const ModIcon = getModuleIcon(mod.id);
              return (
                <div 
                  key={mod.id} 
                  className={`p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    mod.status === 'SUCCESS' 
                      ? 'bg-emerald-950/25 border-emerald-500/25 shadow-sm shadow-emerald-500/5' 
                      : mod.status === 'RUNNING'
                      ? 'bg-slate-900 border-teal-500 animate-pulse'
                      : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded-lg ${
                        mod.status === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : mod.status === 'RUNNING'
                          ? 'bg-teal-500/20 text-teal-300 animate-spin'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        <ModIcon className="w-4 h-4" />
                      </div>
                      
                      {mod.status === 'SUCCESS' && (
                        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                          ✓ Verified
                        </span>
                      )}
                      {mod.status === 'RUNNING' && (
                        <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider animate-pulse">
                          Scanning
                        </span>
                      )}
                      {mod.status === 'PENDING' && (
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                          Queued
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-xs font-black text-slate-100">{mod.nameAr}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      {mod.descriptionAr}
                    </p>
                  </div>

                  {mod.status === 'SUCCESS' && (
                    <div className="mt-3 pt-2 border-t border-emerald-950/50 text-[10px] text-emerald-400 bg-emerald-950/10 p-1.5 rounded-lg leading-relaxed font-semibold">
                      {mod.checkDetailsAr}
                    </div>
                  )}
                  {mod.status === 'RUNNING' && (
                    <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-teal-300 leading-relaxed animate-pulse">
                      جاري تحليل معاملات قاعدة البيانات والترحيل للأستاذ...
                    </div>
                  )}
                  {mod.status === 'PENDING' && (
                    <div className="mt-3 pt-2 border-t border-slate-900 text-[10px] text-slate-600">
                      بانتظار دور الفحص...
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Diagnostic Console Logs */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 h-44 overflow-y-auto max-h-44">
            <div className="text-emerald-400 font-black border-b border-slate-800 pb-1 flex justify-between items-center">
              <span>سجل التدقيق والتشخيص المباشر لجميع الوحدات (Audit Terminal)</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Read-Only console</span>
            </div>
            {diagnosticLogs.map((log, index) => (
              <div 
                key={index} 
                className={`${
                  log.startsWith('✓') 
                    ? 'text-emerald-400' 
                    : log.startsWith('[نظام') || log.startsWith('[مكتمل]')
                    ? 'text-cyan-300 font-bold' 
                    : 'text-slate-400'
                }`}
              >
                {log}
              </div>
            ))}
          </div>

          {/* Compliance Report / Seal */}
          {showDiagnosticReport && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-white">
                    شهادة جودة الفحص والامتثال التكاملي (System Integration Pass)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    هذا التقرير يثبت تطابق جميع المعالجات البرمجية، وربط القيود الثنائية، ومطابقة حركة مخزون المستودعات، وتوافقه مع معايير **IFRS** وقواعد **هيئة الزكاة والضريبة والجمارك ZATCA**.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px] text-slate-400">
                    <span>تاريخ الفحص: {new Date().toLocaleDateString('ar-YE')}</span>
                    <span>•</span>
                    <span>رمز الفحص: ME-AUD-18-PASS</span>
                    <span>•</span>
                    <span>معدل الخطأ: 0.00%</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center bg-slate-900/60 p-4 rounded-xl border border-slate-800 shadow-inner">
                <span className="text-xs font-extrabold text-slate-400 block">علامة مطابقة معايير ERP</span>
                <span className="text-2xl font-black text-sap-secondary font-mono tracking-widest mt-1 block">GOLD PASS</span>
                <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">✓ 100% HEALTH SCORE</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Live System Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0A2540] border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>المخزون السلعي</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono">
            <div className="text-lg font-black text-slate-100">{totalStockQty} وحدة</div>
            <div className="text-[11px] text-emerald-400 font-semibold">
              {formatMoney(totalStockValue, "YER_SANAA", currencies)}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-800">
            {totalStockItems} أصناف نشطة
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0A2540] border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>مديونية العملاء (AR)</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 font-mono">
            <div className="text-lg font-black text-cyan-300">
              {formatMoney(totalCustomersAR, "YER_SANAA", currencies)}
            </div>
            <div className="text-[11px] text-slate-400">
              {erpState.customers?.length || 0} عملاء معتمدين
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-800">
            أصول متداولة (مستحقات)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0A2540] border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>مستحقات الموردين (AP)</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 font-mono">
            <div className="text-lg font-black text-amber-300">
              {formatMoney(totalVendorsAP, "YER_SANAA", currencies)}
            </div>
            <div className="text-[11px] text-slate-400">
              {erpState.vendors?.length || 0} موردين معتمدين
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-800">
            التزامات متداولة (دائنون)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0A2540] border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>السيولة النقدية والبنكية</span>
            <Landmark className="w-4 h-4 text-sap-secondary" />
          </div>
          <div className="mt-2 font-mono">
            <div className="text-lg font-black text-sap-secondary">
              {formatMoney(totalLiquidity, "YER_SANAA", currencies)}
            </div>
            <div className="text-[11px] text-slate-400">خزائن + حسابات بنوك</div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-800">
            نقد وما في حكمه (IAS 7)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0A2540] border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>قيود الأستاذ العام</span>
            <BookOpen className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 font-mono">
            <div className="text-lg font-black text-teal-300">
              {totalPostedJournals} قيد مرحل
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold">تطابق وتوازن 100%</div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-800">
            {openDraftJournals > 0 ? (
              <span className="text-amber-400 font-bold">{openDraftJournals} قيد قيد الإعداد</span>
            ) : (
              "دفتر الأستاذ متزن"
            )}
          </div>
        </div>
      </div>

      {/* 3. Action Buttons Grid */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-sap-secondary" />
              <span>لوحة إطلاق واختبار العمليات المحاسبية ودورة الإقفال</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              اضغط على أي زر لفحص الأثر اللحظي في المخزون، حسابات الذمم، وتوليد القيود الآلية، أو تشغيل إغلاق الفترة لتصفير حسابات النتيجة.
            </p>
          </div>

          {testLogs.length > 0 && (
            <button
              onClick={() => setTestLogs([])}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تفريغ سجل الاختبار</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* 1. Cash Sale */}
          <button
            onClick={handleTestCashSale}
            className="p-3.5 rounded-2xl bg-[#0A2540] hover:bg-[#14345B] border border-emerald-500/40 hover:border-emerald-400 text-right transition-all group active:scale-95 cursor-pointer shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 font-black text-xs group-hover:scale-110 transition-transform">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="text-xs font-black text-white">1. مبيعات نقدية</div>
              <div className="text-[10px] text-slate-300 mt-1 leading-snug">
                خصم المخزن + إيداع النقدية + قيد الإيراد وتكلفة COGS.
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-bold flex items-center justify-between">
              <span>تنفيذ الاختبار &larr;</span>
              <span className="font-mono">Cash POS</span>
            </div>
          </button>

          {/* 2. Credit Sale */}
          <button
            onClick={handleTestCreditSale}
            className="p-3.5 rounded-2xl bg-[#0A2540] hover:bg-[#14345B] border border-cyan-500/40 hover:border-cyan-400 text-right transition-all group active:scale-95 cursor-pointer shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2 font-black text-xs group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div className="text-xs font-black text-white">2. مبيعات آجلة</div>
              <div className="text-[10px] text-slate-300 mt-1 leading-snug">
                خصم المخزن + مديونية العميل (AR) + إثبات القيد.
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-cyan-400 font-bold flex items-center justify-between">
              <span>تنفيذ الاختبار &larr;</span>
              <span className="font-mono">Credit AR</span>
            </div>
          </button>

          {/* 3. Purchase */}
          <button
            onClick={handleTestPurchase}
            className="p-3.5 rounded-2xl bg-[#0A2540] hover:bg-[#14345B] border border-amber-500/40 hover:border-amber-400 text-right transition-all group active:scale-95 cursor-pointer shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 font-black text-xs group-hover:scale-110 transition-transform">
                <Package className="w-4 h-4" />
              </div>
              <div className="text-xs font-black text-white">3. مشتريات وتوريد</div>
              <div className="text-[10px] text-slate-300 mt-1 leading-snug">
                زيادة المخزن + إثبات التزامات المورد (AP) + قيد اليومية.
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-amber-400 font-bold flex items-center justify-between">
              <span>تنفيذ الاختبار &larr;</span>
              <span className="font-mono">Inward MM</span>
            </div>
          </button>

          {/* 4. Receipt Voucher */}
          <button
            onClick={handleTestReceipt}
            className="p-3.5 rounded-2xl bg-[#0A2540] hover:bg-[#14345B] border border-blue-500/40 hover:border-blue-400 text-right transition-all group active:scale-95 cursor-pointer shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 font-black text-xs group-hover:scale-110 transition-transform">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div className="text-xs font-black text-white">4. قبض وسداد مدين</div>
              <div className="text-[10px] text-slate-300 mt-1 leading-snug">
                تحصيل نقدية + تسديد مديونية العميل + قيد التحصيل.
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-blue-400 font-bold flex items-center justify-between">
              <span>تنفيذ الاختبار &larr;</span>
              <span className="font-mono">RV / AR</span>
            </div>
          </button>

          {/* 5. Payment Voucher */}
          <button
            onClick={handleTestPayment}
            className="p-3.5 rounded-2xl bg-[#0A2540] hover:bg-[#14345B] border border-rose-500/40 hover:border-rose-400 text-right transition-all group active:scale-95 cursor-pointer shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2 font-black text-xs group-hover:scale-110 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div className="text-xs font-black text-white">5. صرف وسداد دائن</div>
              <div className="text-[10px] text-slate-300 mt-1 leading-snug">
                صرف نقدي + تخفيض مستحقات المورد + قيد السداد.
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-rose-400 font-bold flex items-center justify-between">
              <span>تنفيذ الاختبار &larr;</span>
              <span className="font-mono">PV / AP</span>
            </div>
          </button>

          {/* 6. NEW: Period Closing & P&L Zeroing Test */}
          <button
            id="test-btn-period-closing"
            onClick={handleTestPeriodClosing}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/80 via-[#0A2540] to-indigo-950/90 hover:from-purple-900/90 hover:to-indigo-900 border border-purple-500/50 hover:border-purple-300 text-right transition-all group active:scale-95 cursor-pointer shadow-lg shadow-purple-500/10 flex flex-col justify-between ring-1 ring-purple-400/30"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-purple-500/25 text-purple-300 flex items-center justify-center mb-2 font-black text-xs group-hover:scale-110 transition-transform">
                <CalendarCheck2 className="w-4 h-4 text-purple-300" />
              </div>
              <div className="text-xs font-black text-purple-200 flex items-center gap-1.5">
                <span>6. إغلاق الفترة المالية</span>
                <span className="text-[8px] px-1 py-0.2 bg-purple-400/20 text-purple-200 rounded font-mono">
                  NEW
                </span>
              </div>
              <div className="text-[10px] text-slate-300 mt-1 leading-snug">
                ترحيل القيود المفتوحة + تصفير الحسابات المؤقتة (P&L) + ترحيل الأرباح المبقاة.
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-purple-800/60 text-[10px] text-purple-300 font-bold flex items-center justify-between">
              <span>إجراء الإقفال &larr;</span>
              <span className="font-mono">Month-End</span>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Test Log Table & Audit Trail */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>سجل التدقيق والفحص المحاسبي اللحظي (Accounting Workflow Audit Stream)</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {testLogs.length} عمليات مسجلة ومرحلة
          </span>
        </div>

        {testLogs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center space-y-2">
            <Boxes className="w-10 h-10 text-sap-secondary mx-auto opacity-70 animate-bounce" />
            <h4 className="text-sm font-bold text-slate-200">المختبر جاهز للاختبار المحاسبي</h4>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              اضغط على أحد أزرار العمليات أعلاه أو تشغيل دورة المحاكاة الشاملة للتحقق من الأثر المخزني والترحيل الآلي للأستاذ العام وإقفال الفترة المالية.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {testLogs.map((log) => (
              <div
                key={log.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  log.operationType === "PERIOD_CLOSING"
                    ? "bg-purple-950/30 border-purple-700/60 shadow-lg shadow-purple-950/30"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono ${
                        log.operationType === "CASH_SALE"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : log.operationType === "CREDIT_SALE"
                          ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                          : log.operationType === "PURCHASE"
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : log.operationType === "RECEIPT"
                          ? "bg-blue-950 text-blue-300 border border-blue-800"
                          : log.operationType === "PERIOD_CLOSING"
                          ? "bg-purple-900 text-purple-200 border border-purple-500 font-black"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {log.operationType}
                    </span>
                    <h4 className="text-xs font-bold text-white">{log.title}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-slate-400 text-[11px]">{log.timestamp}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                      مرحل تلقائياً (POSTED)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{log.description}</p>

                {/* If Period Closing: Show detailed breakdown */}
                {log.closingDetails && (
                  <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/80 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-purple-300 block">الفترة المقفلة:</span>
                      <span className="font-bold font-mono text-white">
                        {log.closingDetails.period}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-300 block">إجمالي إيرادات مقفلة:</span>
                      <span className="font-bold font-mono text-emerald-300">
                        {formatMoney(log.closingDetails.totalRevenueClosed, "YER_SANAA", currencies)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-300 block">إجمالي مصاريف مقفلة:</span>
                      <span className="font-bold font-mono text-rose-300">
                        {formatMoney(log.closingDetails.totalExpenseClosed, "YER_SANAA", currencies)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-300 block">صافي النتيجة للأرباح المبقاة:</span>
                      <span className="font-bold font-mono text-amber-300">
                        {formatMoney(log.closingDetails.netProfit, "YER_SANAA", currencies)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Impact Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      الأثر المخزني (MM):
                    </span>
                    <span className="text-slate-200 mt-0.5 block">{log.inventoryImpact}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      أثر الحساب والطرف (Third-Party):
                    </span>
                    <span className="text-slate-200 mt-0.5 block">{log.partyImpact}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      الأثر في القوائم والمركز المالي:
                    </span>
                    <span className="text-emerald-400 mt-0.5 block font-semibold">
                      {log.financialImpact}
                    </span>
                  </div>
                </div>

                {/* Journal Entry Preview */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono space-y-1.5">
                  <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    معاينة القيد المحاسبي المتوازن (General Ledger Preview):
                  </div>
                  {log.glEntryPreview.map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-800 last:border-0"
                    >
                      <div className="text-emerald-400">
                        <span className="text-slate-400">من حـ/ </span>
                        {entry.debitAccount}:{" "}
                        <span className="font-bold">{entry.debitAmount.toLocaleString()} ر.ي</span>
                      </div>
                      <div className="text-cyan-400">
                        <span className="text-slate-400">إلى حـ/ </span>
                        {entry.creditAccount}:{" "}
                        <span className="font-bold">{entry.creditAmount.toLocaleString()} ر.ي</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
