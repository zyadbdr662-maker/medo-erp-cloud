import React, { useState } from "react";
import {
  Boxes,
  Network,
  CheckCircle2,
  AlertTriangle,
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
  GitBranch,
  Search,
  BadgeCheck,
  ExternalLink,
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
import { AccountingWorkflowTester } from "./AccountingWorkflowTester";

interface IntegratedErpSuiteViewProps {
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

interface TestLogItem {
  id: string;
  timestamp: string;
  operationType: "CASH_SALE" | "CREDIT_SALE" | "PURCHASE" | "RECEIPT" | "PAYMENT" | "FULL_CYCLE";
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
}

export const IntegratedErpSuiteView: React.FC<IntegratedErpSuiteViewProps> = ({
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
  const [activeSubTab, setActiveSubTab] = useState<"TEST_LAB" | "PILLARS" | "WORKFLOWS" | "GOVERNANCE">("TEST_LAB");
  const [isSimulating, setIsSimulating] = useState(false);
  const [testLogs, setTestLogs] = useState<TestLogItem[]>([]);
  const [simulationStep, setSimulationStep] = useState<number>(0);

  // Derive live figures from state
  const totalStockItems = erpState.inventoryItems?.length || 0;
  const totalStockQty = erpState.inventoryItems?.reduce((s, i) => s + (Number(i.quantityOnHand) || 0), 0) || 0;
  const totalStockValue = erpState.inventoryItems?.reduce((s, i) => s + ((Number(i.quantityOnHand) || 0) * (Number(i.costPrice) || 0)), 0) || 0;
  const totalCustomersAR = erpState.customers?.reduce((s, c) => s + (Number(c.currentBalance) || 0), 0) || 0;
  const totalVendorsAP = erpState.vendors?.reduce((s, v) => s + (Number(v.currentBalance) || 0), 0) || 0;
  const totalVaults = erpState.cashVaults?.reduce((s, v) => s + (Number(v.currentBalance) || 0), 0) || 0;
  const totalBanks = erpState.bankAccounts?.reduce((s, b) => s + (Number(b.currentBalance) || 0), 0) || 0;
  const totalLiquidity = totalVaults + totalBanks;
  const totalPostedJournals = erpState.journalEntries?.filter((j) => j.status === "POSTED" || !j.status).length || 0;

  // Handler: Run Single Test - Cash Sale
  const handleTestCashSale = () => {
    const testItem = erpState.inventoryItems?.[0] || { id: "item-1", nameAr: "مكيف سبلت 24 وحدة", code: "AC-24K", costPrice: 450000, sellingPrice: 620000 };
    const saleQty = 1;
    const saleTotal = Number(testItem.sellingPrice) * saleQty;
    const cogsTotal = Number(testItem.costPrice) * saleQty;
    const now = new Date().toLocaleTimeString("ar-YE");

    // 1. Create Invoice
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

    // 2. Add Stock Movement (Outward)
    if (onAddStockMovement) {
      onAddStockMovement({
        id: `mov-${Date.now()}`,
        itemId: testItem.id,
        itemCode: testItem.code,
        itemNameAr: testItem.nameAr,
        type: "OUT",
        quantity: saleQty,
        unitPrice: Number(testItem.sellingPrice) || 0,
        unitCost: Number(testItem.costPrice) || 0,
        totalCost: cogsTotal,
        totalAmount: saleTotal,
        date: new Date().toISOString().split("T")[0],
        referenceNumber: `CS-TEST-${Date.now().toString().slice(-4)}`,
        notes: `خصم مخزني آلي لاختبار بيع نقدي (${testItem.nameAr})`,
      });
    }

    // 3. Post Automatic Journal Entry
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

    // 4. Record Test Log
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
        { debitAccount: "1110 - النقدية بالخزينة", creditAccount: "4000 - إيرادات المبيعات", debitAmount: saleTotal, creditAmount: saleTotal },
        { debitAccount: "5000 - تكلفة البضاعة المباعة COGS", creditAccount: "1200 - مخزون البضائع", debitAmount: cogsTotal, creditAmount: cogsTotal },
      ],
      financialImpact: "زيادة إيرادات ومجمل ربح قائمة الدخل + زيادة نقدية الميزانية العمومية وانخفاض المخزون",
      status: "POSTED",
    };
    setTestLogs((prev) => [newLog, ...prev]);
  };

  // Handler: Run Single Test - Credit Sale
  const handleTestCreditSale = () => {
    const testItem = erpState.inventoryItems?.[1] || erpState.inventoryItems?.[0] || { id: "item-2", code: "INV-1002", nameAr: "شاشة تلفزيون ذكية 65 بوصة", costPrice: 380000, sellingPrice: 510000 };
    const testCust = erpState.customers?.[0] || { id: "cust-1", name: "شركة النور للتوكيلات التجارية" };
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
        itemCode: testItem.code,
        itemNameAr: testItem.nameAr,
        type: "OUT",
        quantity: saleQty,
        unitPrice: Number(testItem.sellingPrice) || 0,
        unitCost: Number(testItem.costPrice) || 0,
        totalCost: cogsTotal,
        totalAmount: saleTotal,
        date: new Date().toISOString().split("T")[0],
        referenceNumber: `CR-TEST-${Date.now().toString().slice(-4)}`,
        notes: `خصم مخزني لعملية بيع آجل (${testCust.name})`,
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
      title: "عملية مبيعات آجلة مع إضافة مديونية العميل وخصم المخزون",
      description: `تم بيع ${saleQty} وحدة من (${testItem.nameAr}) للعميل (${testCust.name}) بمبلغ ${saleTotal.toLocaleString()} ر.ي`,
      amount: saleTotal,
      currency: "YER_SANAA",
      inventoryImpact: `خصم ${saleQty} وحدة من صنف [${testItem.nameAr}] بقيمة تكلفة ${cogsTotal.toLocaleString()} ر.ي`,
      partyImpact: `زيادة مديونية العميل [${testCust.name}] بمقدار ${saleTotal.toLocaleString()} ر.ي في ميزان المدينين`,
      glEntryPreview: [
        { debitAccount: "1300 - العملاء والذمم المدينة (AR)", creditAccount: "4000 - إيرادات المبيعات", debitAmount: saleTotal, creditAmount: saleTotal },
        { debitAccount: "5000 - تكلفة البضاعة المباعة COGS", creditAccount: "1200 - مخزون البضائع", debitAmount: cogsTotal, creditAmount: cogsTotal },
      ],
      financialImpact: "زيادة الأصول المتداولة (الذمم المدينة) بقائمة المركز المالي وزيادة صافي الأرباح بقائمة الدخل",
      status: "POSTED",
    };
    setTestLogs((prev) => [newLog, ...prev]);
  };

  // Handler: Run Single Test - Purchase Inward
  const handleTestPurchase = () => {
    const testItem = erpState.inventoryItems?.[0] || { id: "item-1", code: "INV-1001", nameAr: "مكيف سبلت 24 وحدة", costPrice: 450000 };
    const testVendor = erpState.vendors?.[0] || { id: "vend-1", name: "مجموعة هائل سعيد التجارية" };
    const purQty = 2;
    const purTotal = Number(testItem.costPrice) * purQty;
    const now = new Date().toLocaleTimeString("ar-YE");

    if (onAddStockMovement) {
      onAddStockMovement({
        id: `mov-${Date.now()}`,
        itemId: testItem.id,
        itemCode: testItem.code,
        itemNameAr: testItem.nameAr,
        type: "IN",
        quantity: purQty,
        unitPrice: Number(testItem.costPrice) || 0,
        unitCost: Number(testItem.costPrice) || 0,
        totalCost: purTotal,
        totalAmount: purTotal,
        date: new Date().toISOString().split("T")[0],
        referenceNumber: `PO-TEST-${Date.now().toString().slice(-4)}`,
        notes: `توريد واستلام مخزني من المورد (${testVendor.name})`,
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
      title: "عملية مشتريات وتوريد مخزني مع إثبات مستحقات المورد",
      description: `تم توريد ${purQty} وحدة من (${testItem.nameAr}) من المورد (${testVendor.name}) بإجمالي ${purTotal.toLocaleString()} ر.ي`,
      amount: purTotal,
      currency: "YER_SANAA",
      inventoryImpact: `زيادة رصيد المخزن بمقدار +${purQty} وحدة وتحديث متوسط التكلفة`,
      partyImpact: `زيادة مستحقات والتزامات المورد [${testVendor.name}] بمقدار ${purTotal.toLocaleString()} ر.ي`,
      glEntryPreview: [
        { debitAccount: "1200 - مخزون البضائع بالمستودعات", creditAccount: "2100 - الموردين والذمم الدائنة (AP)", debitAmount: purTotal, creditAmount: purTotal },
      ],
      financialImpact: "زيادة أصول المخزون وزيادة الالتزامات المتداولة في الميزانية العمومية (توازن فوري 100%)",
      status: "POSTED",
    };
    setTestLogs((prev) => [newLog, ...prev]);
  };

  // Handler: Run Single Test - Receipt Voucher (AR Settlement)
  const handleTestReceipt = () => {
    const testCust = erpState.customers?.[0] || { id: "cust-1", name: "شركة النور للتوكيلات التجارية" };
    const amount = 300000;
    const now = new Date().toLocaleTimeString("ar-YE");

    if (onSaveVoucher) {
      const vc: Voucher = {
        id: `RV-TEST-${Date.now()}`,
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
      title: "سند قبض وسداد مديونية عميل (تحصيل نقدية)",
      description: `تم تحصيل مبلغ ${amount.toLocaleString()} ر.ي نقداً من العميل (${testCust.name}) وإيداعه بالخزينة`,
      amount: amount,
      currency: "YER_SANAA",
      inventoryImpact: "لا يوجد أثر مخزني (حركة نقدية وتسوية ذمم)",
      partyImpact: `تخفيض وتسديد مديونية العميل [${testCust.name}] بمقدار -${amount.toLocaleString()} ر.ي`,
      glEntryPreview: [
        { debitAccount: "1110 - النقدية بالخزينة", creditAccount: "1300 - العملاء والذمم المدينة (AR)", debitAmount: amount, creditAmount: amount },
      ],
      financialImpact: "إعادة هيكلة الأصول المتداولة بالميزانية العمومية (زيادة النقدية وانخفاض الذمم المدينة) مع ثبات إجمالي الأصول",
      status: "POSTED",
    };
    setTestLogs((prev) => [newLog, ...prev]);
  };

  // Handler: Run Single Test - Payment Voucher (AP Settlement)
  const handleTestPayment = () => {
    const testVendor = erpState.vendors?.[0] || { id: "vend-1", name: "مجموعة هائل سعيد التجارية" };
    const amount = 400000;
    const now = new Date().toLocaleTimeString("ar-YE");

    if (onSaveVoucher) {
      const vc: Voucher = {
        id: `PV-TEST-${Date.now()}`,
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
      title: "سند صرف وسداد مستحقات مورد (صرف نقدية)",
      description: `تم سداد مبلغ ${amount.toLocaleString()} ر.ي نقداً للمورد (${testVendor.name}) من الخزينة`,
      amount: amount,
      currency: "YER_SANAA",
      inventoryImpact: "لا يوجد أثر مخزني (حركة نقدية وتسوية التزامات)",
      partyImpact: `تخفيض التزامات ومستحقات المورد [${testVendor.name}] بمقدار -${amount.toLocaleString()} ر.ي`,
      glEntryPreview: [
        { debitAccount: "2100 - الموردين والذمم الدائنة (AP)", creditAccount: "1110 - النقدية بالخزينة", debitAmount: amount, creditAmount: amount },
      ],
      financialImpact: "تخفيض الالتزامات المتداولة وتخفيض الأصول النقدية في الميزانية العمومية بالتساوي",
      status: "POSTED",
    };
    setTestLogs((prev) => [newLog, ...prev]);
  };

  // Handler: Run Full End-to-End Simulation Cycle
  const handleRunFullCycle = async () => {
    setIsSimulating(true);
    setSimulationStep(1);

    // Step 1: Cash Sale
    handleTestCashSale();
    await new Promise((r) => setTimeout(r, 600));
    setSimulationStep(2);

    // Step 2: Credit Sale
    handleTestCreditSale();
    await new Promise((r) => setTimeout(r, 600));
    setSimulationStep(3);

    // Step 3: Purchase Inward
    handleTestPurchase();
    await new Promise((r) => setTimeout(r, 600));
    setSimulationStep(4);

    // Step 4: Receipt / AR Settlement
    handleTestReceipt();
    await new Promise((r) => setTimeout(r, 600));
    setSimulationStep(5);

    // Step 5: Payment / AP Settlement
    handleTestPayment();
    await new Promise((r) => setTimeout(r, 500));

    setIsSimulating(false);
    setSimulationStep(0);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header Banner & Identity */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A2540] via-[#14345B] to-[#071829] border border-sap-secondary/40 p-6 shadow-2xl text-slate-100">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-sap-secondary/20 border border-sap-secondary/50 flex items-center justify-center text-sap-secondary shadow-lg shadow-sap-secondary/20">
                <Boxes className="w-5 h-5" />
              </div>
              <span className="text-xs font-black tracking-wider uppercase px-3 py-1 rounded-full bg-sap-secondary text-slate-950 shadow-md">
                SAP S/4HANA Enterprise Architecture
              </span>
              <span className="text-xs font-bold text-amber-300 font-mono hidden sm:inline">
                IFRS / IAS / ZATCA Compliant
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>المنظومة المحاسبية والإدارية المتكاملة</span>
              <span className="text-sm font-normal text-amber-200/80 px-2.5 py-0.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
                Integrated ERP Suite
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              المركز المرجعي للمنظومة: يربط الأستاذ العام (FI)، مراكز التكلفة (CO)، المشتريات والمخازن (MM)، المبيعات ونقاط البيع (SD)، الرواتب (HCM)، وإدارة السيولة والخزائن في دورة مستندية مؤتمتة 100%.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRunFullCycle}
              disabled={isSimulating}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sap-secondary via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 active:scale-95 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} />
              <span>{isSimulating ? `جاري المحاكاة (خطوة ${simulationStep}/5)...` : "تشغيل دورة المحاكاة الشاملة"}</span>
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

      {/* 2. Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab("TEST_LAB")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === "TEST_LAB"
              ? "bg-sap-secondary text-slate-950 shadow-md shadow-sap-secondary/30 font-black"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>مختبر فحص العمليات والترحيل اللحظي (Live Test Lab)</span>
          {testLogs.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-300 font-mono">
              {testLogs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("PILLARS")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === "PILLARS"
              ? "bg-sap-secondary text-slate-950 shadow-md shadow-sap-secondary/30 font-black"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>الركائز الست للمنظومة المؤسسية (Enterprise Pillars)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("WORKFLOWS")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === "WORKFLOWS"
              ? "bg-sap-secondary text-slate-950 shadow-md shadow-sap-secondary/30 font-black"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>الدورات المستندية وخريطة الأثر المحاسبي</span>
        </button>

        <button
          onClick={() => setActiveSubTab("GOVERNANCE")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === "GOVERNANCE"
              ? "bg-sap-secondary text-slate-950 shadow-md shadow-sap-secondary/30 font-black"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>الحوكمة والرقابة الثنائية (Dual Control & RBAC)</span>
        </button>
      </div>

      {/* TAB 1: Live Workflow & Accounting Test Lab */}
      {activeSubTab === "TEST_LAB" && (
        <AccountingWorkflowTester
          erpState={erpState}
          displayCurrency={displayCurrency}
          currencies={currencies}
          onSaveInvoice={onSaveInvoice}
          onSaveVoucher={onSaveVoucher}
          onSaveJournalEntry={onSaveJournalEntry}
          onAddStockMovement={onAddStockMovement}
          onNavigateToModule={onNavigateToModule}
          onOpenAi={onOpenAi}
        />
      )}

      {/* TAB 2: The Six Enterprise Pillars */}
      {activeSubTab === "PILLARS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Pillar 1 */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-sap-secondary/60 transition-all space-y-3 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  SAP FI/CO
                </span>
              </div>
              <h3 className="text-sm font-black text-white">1. المنظومة المالية والمحاسبية العامة</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                شجرة الحسابات الموحدة متعددة المستويات، قيود اليومية العامة المزدوجة، دفتر الأستاذ العام FAGLL03، ومراكز التكلفة والربحية.
              </p>
            </div>
            {onNavigateToModule && (
              <button
                onClick={() => onNavigateToModule("CHART_OF_ACCOUNTS")}
                className="w-full mt-3 py-2 text-center text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 rounded-xl border border-emerald-800/60 transition-colors cursor-pointer"
              >
                فتح شجرة الحسابات &larr;
              </button>
            )}
          </div>

          {/* Pillar 2 */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-sap-secondary/60 transition-all space-y-3 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  SAP MM / SCM
                </span>
              </div>
              <h3 className="text-sm font-black text-white">2. المشتريات والمخازن وسلاسل الإمداد</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                دورة المشتريات من طلب الشراء حتى الفاتورة، الجرد المستمر، المتوسط المرجح للتكلفة، وإدارة الموردين والذمم الدائنة (AP).
              </p>
            </div>
            {onNavigateToModule && (
              <button
                onClick={() => onNavigateToModule("INVENTORY")}
                className="w-full mt-3 py-2 text-center text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-950/40 rounded-xl border border-amber-800/60 transition-colors cursor-pointer"
              >
                إدارة المخزون والمشتريات &larr;
              </button>
            )}
          </div>

          {/* Pillar 3 */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-sap-secondary/60 transition-all space-y-3 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                  SAP SD / ZATCA
                </span>
              </div>
              <h3 className="text-sm font-black text-white">3. المبيعات ونقاط البيع والفاتورة الإلكترونية</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                عروض الأسعار، نقاط البيع السريعة POS، الفاتورة الإلكترونية المشفرة برمز QR، ومتابعة مديونيات وحدود ائتمان العملاء (AR).
              </p>
            </div>
            {onNavigateToModule && (
              <button
                onClick={() => onNavigateToModule("SALES_RETURNS")}
                className="w-full mt-3 py-2 text-center text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-950/40 rounded-xl border border-blue-800/60 transition-colors cursor-pointer"
              >
                إدارة المبيعات ونقاط البيع &larr;
              </button>
            )}
          </div>

          {/* Pillar 4 */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-sap-secondary/60 transition-all space-y-3 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                  SAP HCM
                </span>
              </div>
              <h3 className="text-sm font-black text-white">4. الموارد البشرية ومسيرات الرواتب</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                ملفات الموظفين، الحضور والورديات، مسيرات الرواتب والبدلات، وترحيل قيود استحقاق وسداد الرواتب للأستاذ العام آلياً.
              </p>
            </div>
            {onNavigateToModule && (
              <button
                onClick={() => onNavigateToModule("HUMAN_RESOURCES")}
                className="w-full mt-3 py-2 text-center text-xs font-bold text-purple-400 hover:text-purple-300 bg-purple-950/40 rounded-xl border border-purple-800/60 transition-colors cursor-pointer"
              >
                شؤون الموظفين والرواتب &larr;
              </button>
            )}
          </div>

          {/* Pillar 5 */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-sap-secondary/60 transition-all space-y-3 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-sap-secondary/20 text-sap-secondary flex items-center justify-center font-black">
                  <Landmark className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  Treasury & Banks
                </span>
              </div>
              <h3 className="text-sm font-black text-white">5. الخزينة والسيولة والرقابة الثنائية</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                سندات القبض والصرف، إدارة الخزائن النقدية والبنوك، التسويات البنكية، وقائمة التدفقات النقدية اللحظية (IAS 7).
              </p>
            </div>
            {onNavigateToModule && (
              <button
                onClick={() => onNavigateToModule("CASH_AND_BANK")}
                className="w-full mt-3 py-2 text-center text-xs font-bold text-sap-secondary hover:text-amber-300 bg-amber-950/40 rounded-xl border border-amber-800/60 transition-colors cursor-pointer"
              >
                إدارة الخزائن والبنوك &larr;
              </button>
            )}
          </div>

          {/* Pillar 6 */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-sap-secondary/60 transition-all space-y-3 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black">
                  <Coins className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800 font-bold">
                  FX & Multi-Currency
                </span>
              </div>
              <h3 className="text-sm font-black text-white">6. الصرافة وتعدد العملات وفروق الصرف</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                إدارة أسعار صرف صنعاء وعدن، عقود الصرافة والتحويل، وإعادة التقييم الدوري للعملات الأجنبية (FAGL_FC_VAL).
              </p>
            </div>
            {onNavigateToModule && (
              <button
                onClick={() => onNavigateToModule("CURRENCY_SETTINGS")}
                className="w-full mt-3 py-2 text-center text-xs font-bold text-teal-400 hover:text-teal-300 bg-teal-950/40 rounded-xl border border-teal-800/60 transition-colors cursor-pointer"
              >
                إعدادات العملات والصرف &larr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Document Workflows & Posting Map */}
      {activeSubTab === "WORKFLOWS" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-sap-secondary" />
              <span>خريطة الدورات المستندية والأثر المحاسبي المؤتمت</span>
            </h3>

            {/* Sales Cycle Flow */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-400">أولاً: الدورة المستندية للمبيعات (Sales & AR Cycle)</h4>
                <span className="text-[10px] text-slate-400 font-mono">SD &rarr; MM &rarr; FI</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="font-bold text-white">1. أمر البيع</div>
                  <div className="text-[10px] text-slate-400">حجز الكميات في المستودع</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="font-bold text-white">2. سند الإخراج المخزني</div>
                  <div className="text-[10px] text-emerald-400">خصم المخزون + قيد COGS</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="font-bold text-white">3. الفاتورة الضريبية</div>
                  <div className="text-[10px] text-cyan-400">إثبات الإيراد والذمم المدينة</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="font-bold text-white">4. سند القبض والتحصيل</div>
                  <div className="text-[10px] text-amber-400">إيداع النقدية وتسوية العميل</div>
                </div>
              </div>
            </div>

            {/* Purchases Cycle Flow */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-400">ثانياً: الدورة المستندية للمشتريات (Purchases & AP Cycle)</h4>
                <span className="text-[10px] text-slate-400 font-mono">PR &rarr; PO &rarr; GRN &rarr; AP</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="font-bold text-white">1. أمر الشراء PO</div>
                  <div className="text-[10px] text-slate-400">تثبيت الأسعار والشروط</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="font-bold text-white">2. إذن الاستلام GRN</div>
                  <div className="text-[10px] text-emerald-400">إضافة المخزون وتحديث التكلفة</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="font-bold text-white">3. فاتورة المورد</div>
                  <div className="text-[10px] text-amber-400">إثبات الالتزامات والذمم الدائنة</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="font-bold text-white">4. سند الصرف والسداد</div>
                  <div className="text-[10px] text-rose-400">صرف النقدية وتسديد المورد</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Governance & Dual Control */}
      {activeSubTab === "GOVERNANCE" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sap-secondary/20 text-sap-secondary flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">الحوكمة والرقابة الثنائية وفصل الصلاحيات (RBAC & Dual Control)</h3>
              <p className="text-xs text-slate-400">تطبيق معايير التدقيق والمراقبة الداخلية لمنع الازدواجية وتوثيق كل حركة برقم مرجعي مشفر.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4" />
                <span>الرقابة الثنائية (Maker-Checker)</span>
              </h4>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                اشتراط اعتماد القيود والسندات التي تتجاوز السقف المحدد من قبل مسؤولين اثنين منفصلين لضمان سلامة الصرف.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>مصفوفة فصل المسؤوليات (SoD)</span>
              </h4>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                فصل صلاحيات أمين الصندوق عن المحاسب العام وعن مدخل فواتير المبيعات لمنع أي تضارب في المصالح.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4" />
                <span>سجل التدقيق غير القابل للتعديل</span>
              </h4>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                تسجيل اسم المستخدم، التاريخ، الوقت، والأثر المالي لكل حركة مع بصمة إلكترونية لحفظ السجلات المحاسبية.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
