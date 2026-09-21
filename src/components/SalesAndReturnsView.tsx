import React, { useState, useMemo } from "react";
import { FormNavigationBar } from "./FormNavigationBar";
import {
  ShoppingBag,
  Plus,
  Search,
  Printer,
  Calendar,
  DollarSign,
  ArrowDownLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wallet,
  Building,
  CreditCard,
  Truck,
  Phone,
  Filter,
  Eye,
  FileText,
  BadgeCheck,
  ChevronDown,
  Layers,
  Share2,
  FileDown,
  ArrowLeftRight,
  QrCode,
  Barcode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { exportInvoiceToPdf } from "../services/pdfExporter";
import {
  Account,
  BankAccountItem,
  CashVaultItem,
  CurrencyCode,
  CurrencyInfo,
  Customer,
  Invoice,
  InvoiceItem,
  InvoicePaymentMethod,
  InvoiceType,
  InventoryItem,
} from "../types/erp";
import { formatMoney, formatNumberOnly } from "../services/erpStorage";
import { formatDate, formatDualDate } from "../utils/formatters";
import { generateZatcaQr } from "../utils/zatca";
import { QuickAddCustomerModal, QuickAddItemModal } from "./QuickAddModals";
import { ElectronicInvoicingModule } from "./ElectronicInvoicingModule";
import { ColumnCustomizer, useColumnVisibility, ColumnDef } from "./ColumnCustomizer";
import { Combobox, ComboboxOption } from "./Combobox";

interface SalesAndReturnsViewProps {
  invoices: Invoice[];
  customers: Customer[];
  accounts: Account[];
  cashVaults: CashVaultItem[];
  bankAccounts: BankAccountItem[];
  inventoryItems?: InventoryItem[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  onSaveInvoice: (invoice: Invoice) => void;
  onAddCustomer?: (customer: Customer) => void;
  onAddInventoryItem?: (item: InventoryItem) => void;
  onPrintDocument: (docType: "INVOICE", data: any) => void;
  onShareDocument?: (data: any) => void;
}

export const SalesAndReturnsView: React.FC<SalesAndReturnsViewProps> = ({
  invoices,
  customers,
  accounts,
  cashVaults,
  bankAccounts,
  inventoryItems = [],
  currencies,
  displayCurrency,
  onSaveInvoice,
  onAddCustomer,
  onAddInventoryItem,
  onPrintDocument,
  onShareDocument,
}) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "SALES" | "RETURNS" | "EXPENSES" | "EINVOICE">("ALL");

  const SALES_COLUMNS: ColumnDef[] = [
    { id: "invoiceNumber", label: "رقم الفاتورة / المستند", locked: true },
    { id: "type", label: "النوع" },
    { id: "customerName", label: "العميل" },
    { id: "date", label: "التاريخ" },
    { id: "totalAmount", label: "إجمالي الفاتورة" },
    { id: "salesExpenseAmount", label: "مصروفات المبيعات" },
    { id: "paidAmount", label: "المدفوع" },
    { id: "remainingAmount", label: "المتبقي (الذمة)" },
    { id: "paymentMethod", label: "وسيلة الدفع" },
    { id: "status", label: "الحالة" },
    { id: "actions", label: "إجراءات", locked: true },
  ];
  const { visibleColumns: salesVis, updateVisibility: updateSalesVis, isVisible: isSalesVis } = useColumnVisibility("sales_and_returns_list", SALES_COLUMNS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState("ALL");
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState<Invoice | null>(null);
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);
  const [showQuickAddItem, setShowQuickAddItem] = useState(false);
  const [activeRowForItemAdd, setActiveRowForItemAdd] = useState<string | null>(null);
  const [barcodeSearchTerm, setBarcodeSearchTerm] = useState("");

  // New Invoice Form State
  const [invType, setInvType] = useState<"SALES" | "SALES_RETURN">("SALES");
  const [invCustomerId, setInvCustomerId] = useState(customers[0]?.id || "");
  const [invOriginalNumber, setInvOriginalNumber] = useState("");
  const [invReturnReason, setInvReturnReason] = useState("عيوب مصنعية / عدم مطابقة للمواصفات");
  const [invDate, setInvDate] = useState(new Date().toISOString().split("T")[0]);
  const [invDueDate, setInvDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [invCurrency, setInvCurrency] = useState<CurrencyCode>(displayCurrency || "YER_SANAA");
  const [invTaxRate, setInvTaxRate] = useState<number>(0);
  const [invDiscount, setInvDiscount] = useState<number>(0);
  const [invSalesExpense, setInvSalesExpense] = useState<number>(0); // مصروفات المبيعات والشحن
  const [invPaymentMethod, setInvPaymentMethod] = useState<InvoicePaymentMethod>("CASH");
  const [invWalletName, setInvWalletName] = useState("محفظة جوالي");
  const [invWalletNumber, setInvWalletNumber] = useState("");
  const [invWalletEmail, setInvWalletEmail] = useState("");
  const [invPaidAmount, setInvPaidAmount] = useState<number>(0);
  const [invPaymentAccountId, setInvPaymentAccountId] = useState<string>(
    cashVaults[0]?.glAccountId || "110101"
  );
  const [invNotes, setInvNotes] = useState("");
  const [invTerms, setInvTerms] = useState("السداد خلال المدة المحددة بالفاتورة");

  // Items in form
  const [invItems, setInvItems] = useState<InvoiceItem[]>([
    {
      id: "item-1",
      description: "بضاعة / منتجات تجارية",
      quantity: 1,
      unitPrice: 250000,
      taxPercent: 0,
      discount: 0,
      total: 250000,
    },
  ]);

  // Helper to extract pricing details: Last Selling Price, Purchase Price, Cost Price
  const getItemPricingDetails = (item: InventoryItem, forCustomerId?: string) => {
    const currencySymbol = invCurrency === "SAR" ? "ر.س" : invCurrency === "USD" ? "$" : "ر.ي";

    // 1. Last selling price (آخر سعر بيع)
    let lastSellingPrice: number | null = item.lastSellingPrice || null;
    let lastSellingDate: string | null = null;
    let lastCustomerName: string | null = null;

    if (invoices && invoices.length > 0) {
      const salesInvoices = invoices.filter(
        (inv) => (inv.type === "SALES" || (inv.type as string) === "FINAL") && inv.items && inv.items.length > 0
      );
      // Sort newest first
      const sortedSales = [...salesInvoices].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

      // Priority 1: Check previous sale to this specific customer
      if (forCustomerId) {
        for (const inv of sortedSales) {
          if (inv.customerId === forCustomerId || inv.partyId === forCustomerId) {
            const match = inv.items?.find(
              (it) => it.inventoryItemId === item.id || it.description?.trim() === item.nameAr?.trim()
            );
            if (match && match.unitPrice) {
              lastSellingPrice = match.unitPrice;
              lastSellingDate = inv.date;
              lastCustomerName = inv.partyName || "هذا العميل";
              break;
            }
          }
        }
      }

      // Priority 2: Check latest general selling price across all customers
      if (!lastSellingPrice) {
        for (const inv of sortedSales) {
          const match = inv.items?.find(
            (it) => it.inventoryItemId === item.id || it.description?.trim() === item.nameAr?.trim()
          );
          if (match && match.unitPrice) {
            lastSellingPrice = match.unitPrice;
            lastSellingDate = inv.date;
            lastCustomerName = inv.partyName || null;
            break;
          }
        }
      }
    }

    if (!lastSellingPrice) {
      lastSellingPrice = item.sellingPrice || 0;
    }

    // 2. Purchase price (سعر الشراء)
    let purchasePrice: number | null = item.purchasePrice || null;
    let lastPurchaseDate: string | null = null;
    let lastVendorName: string | null = null;

    if (invoices && invoices.length > 0) {
      const purchaseInvoices = invoices.filter(
        (inv) => inv.type === "PURCHASE" && inv.items && inv.items.length > 0
      );
      const sortedPurchases = [...purchaseInvoices].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      for (const inv of sortedPurchases) {
        const match = inv.items?.find(
          (it) => it.inventoryItemId === item.id || it.description?.trim() === item.nameAr?.trim()
        );
        if (match && match.unitPrice) {
          purchasePrice = match.unitPrice;
          lastPurchaseDate = inv.date;
          lastVendorName = inv.partyName || null;
          break;
        }
      }
    }

    if (!purchasePrice) {
      purchasePrice = item.purchasePrice || item.costPrice || 0;
    }

    // 3. Cost price (سعر التكلفة)
    const costPrice = item.costPrice || purchasePrice || 0;

    // 4. Standard approved selling price (سعر البيع المعتمد)
    const standardSellingPrice = item.sellingPrice || 0;

    return {
      lastSellingPrice,
      lastSellingDate,
      lastCustomerName,
      purchasePrice,
      lastPurchaseDate,
      lastVendorName,
      costPrice,
      standardSellingPrice,
      currencySymbol,
    };
  };

  // Prepare Options for Searchable Selects
  const customerOptions: ComboboxOption[] = useMemo(() => {
    return customers.map(c => ({
      id: c.id,
      label: c.nameAr,
      secondaryLabel: c.phone
    }));
  }, [customers]);

  const inventoryOptions: ComboboxOption[] = useMemo(() => {
    return inventoryItems.map(inv => {
      const p = getItemPricingDetails(inv, invCustomerId);
      return {
        id: inv.id,
        label: inv.nameAr,
        secondaryLabel: `${inv.code} | بيع: ${p.lastSellingPrice.toLocaleString()} | تكلفة: ${p.costPrice.toLocaleString()}`
      };
    });
  }, [inventoryItems, invCustomerId, invCurrency, invoices]);

  // Calculations for Modal
  const invSubtotal = invItems.reduce((sum, item) => sum + item.total, 0);
  const invTaxAmount = (invSubtotal * (invTaxRate || 0)) / 100;
  const rawGrandTotal = invSubtotal + invTaxAmount - (invDiscount || 0) + (Number(invSalesExpense) || 0);
  const invGrandTotal = Math.max(0, rawGrandTotal);
  const invRemainingAmount = Math.max(0, invGrandTotal - (Number(invPaidAmount) || 0));

  // Invoice Profitability & Cost calculations
  const invoiceCOGS = invItems.reduce((sum, item) => {
    const orig = inventoryItems?.find((inv) => inv.id === item.inventoryItemId);
    const itemCost = orig ? (orig.costPrice || 0) : 0;
    return sum + (item.quantity * itemCost);
  }, 0);
  const invoiceGrossProfit = invSubtotal - invoiceCOGS;
  const invoiceMarginPercent = invSubtotal > 0 ? (invoiceGrossProfit / invSubtotal) * 100 : 0;

  // Quick helper to fill full payment or clear
  const handleSetPaidQuick = (type: "FULL" | "ZERO" | "HALF") => {
    if (type === "FULL") setInvPaidAmount(invGrandTotal);
    if (type === "ZERO") setInvPaidAmount(0);
    if (type === "HALF") setInvPaidAmount(Math.round(invGrandTotal / 2));
  };

  const handleOpenAddModal = (presetType: "SALES" | "SALES_RETURN" = "SALES") => {
    setInvType(presetType);
    const firstInv = inventoryItems && inventoryItems.length > 0 ? inventoryItems[0] : null;
    const firstPricing = firstInv ? getItemPricingDetails(firstInv, invCustomerId) : null;
    const initialPrice = firstPricing ? firstPricing.lastSellingPrice : 250000;

    setInvItems([
      {
        id: `item-${Date.now()}`,
        inventoryItemId: firstInv ? firstInv.id : undefined,
        description: firstInv ? firstInv.nameAr : (presetType === "SALES" ? "توريد بضاعة / خدمات تجارية" : "مردود بضاعة مرتجعة من العميل"),
        quantity: 1,
        unitPrice: initialPrice,
        taxPercent: 0,
        discount: 0,
        total: initialPrice,
      },
    ]);
    setInvSalesExpense(0);
    setInvDiscount(0);
    setInvTaxRate(0);
    setInvPaidAmount(initialPrice);
    setInvPaymentMethod(presetType === "SALES" ? "CASH" : "CREDIT");
    setShowAddInvoiceModal(true);
  };

  const addInvoiceItem = () => {
    setInvItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxPercent: 0,
        discount: 0,
        total: 0,
      },
    ]);
  };

  const updateInvoiceItem = (id: string, field: keyof InvoiceItem, val: any) => {
    setInvItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === "quantity" || field === "unitPrice") {
          const qty = field === "quantity" ? Number(val) : item.quantity;
          const price = field === "unitPrice" ? Number(val) : item.unitPrice;
          updated.total = qty * price;
        }
        return updated;
      })
    );
  };

  const removeInvoiceItem = (id: string) => {
    if (invItems.length <= 1) return;
    setInvItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleScanOrAddBarcode = (codeToScan?: string) => {
    const term = (codeToScan || barcodeSearchTerm).trim().toLowerCase();
    if (!term) return;

    const matchedItem = inventoryItems?.find(
      (item) =>
        item.code?.toLowerCase() === term ||
        (item as any).barcode?.toLowerCase() === term ||
        item.id.toLowerCase() === term ||
        item.nameAr.toLowerCase().includes(term)
    );

    if (matchedItem) {
      const pricing = getItemPricingDetails(matchedItem, invCustomerId);
      const existingLine = invItems.find((i) => i.inventoryItemId === matchedItem.id);

      if (existingLine) {
        updateInvoiceItem(existingLine.id, "quantity", (existingLine.quantity || 1) + 1);
      } else {
        const hasSingleEmptyRow =
          invItems.length === 1 && !invItems[0].inventoryItemId && !invItems[0].description && invItems[0].total === 0;

        const newItem: InvoiceItem = {
          id: `item-${Date.now()}`,
          inventoryItemId: matchedItem.id,
          description: matchedItem.nameAr,
          quantity: 1,
          unitPrice: pricing.lastSellingPrice || matchedItem.sellingPrice || matchedItem.costPrice || 0,
          total: pricing.lastSellingPrice || matchedItem.sellingPrice || matchedItem.costPrice || 0,
        };

        if (hasSingleEmptyRow) {
          setInvItems([newItem]);
        } else {
          setInvItems((prev) => [...prev, newItem]);
        }
      }
      setBarcodeSearchTerm("");
    }
  };

  // Filter all sales & returns
  const salesAndReturns = invoices.filter(
    (inv) => inv.type === "SALES" || inv.type === "SALES_RETURN"
  );

  const filteredInvoices = salesAndReturns.filter((inv) => {
    // Tab filter
    if (activeTab === "SALES" && inv.type !== "SALES") return false;
    if (activeTab === "RETURNS" && inv.type !== "SALES_RETURN") return false;
    if (activeTab === "EXPENSES" && (!inv.salesExpenseAmount || inv.salesExpenseAmount <= 0)) return false;

    // Customer filter
    if (selectedCustomerFilter !== "ALL" && inv.customerId !== selectedCustomerFilter && inv.partyId !== selectedCustomerFilter) {
      return false;
    }

    // Status filter
    if (selectedStatusFilter !== "ALL" && inv.status !== selectedStatusFilter) {
      return false;
    }

    // Payment method filter
    if (selectedPaymentFilter !== "ALL" && inv.paymentMethod !== selectedPaymentFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const numMatch = inv.invoiceNumber?.toLowerCase().includes(q);
      const nameMatch = (inv.customerName || inv.partyName || "").toLowerCase().includes(q);
      const notesMatch = (inv.notes || "").toLowerCase().includes(q);
      return numMatch || nameMatch || notesMatch;
    }

    return true;
  });

  // Calculate high-level KPIs
  const totalGrossSales = salesAndReturns
    .filter((i) => i.type === "SALES")
    .reduce((sum, i) => sum + (i.totalAmount || 0), 0);

  const totalSalesReturns = salesAndReturns
    .filter((i) => i.type === "SALES_RETURN")
    .reduce((sum, i) => sum + (i.totalAmount || 0), 0);

  const totalNetSales = totalGrossSales - totalSalesReturns;

  const totalCollected = salesAndReturns.reduce((sum, i) => {
    const paid = i.paidAmount || (i.status === "PAID" ? i.totalAmount : 0);
    return sum + (i.type === "SALES" ? paid : -paid);
  }, 0);

  const totalReceivables = salesAndReturns.reduce((sum, i) => {
    const rem = i.remainingAmount !== undefined ? i.remainingAmount : (i.status === "PAID" ? 0 : i.totalAmount);
    return sum + (i.type === "SALES" ? rem : 0);
  }, 0);

  const totalSalesExpenses = salesAndReturns.reduce((sum, i) => sum + (i.salesExpenseAmount || 0), 0);

  // Profitability Guard & Cost States
  const [showProfitGuardModal, setShowProfitGuardModal] = useState(false);
  const [managerPasscode, setManagerPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [overrideReason, setOverrideReason] = useState("تخفيضات خاصة بالعميل وتصفية كميات بموافقة الإدارة");

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if any items are sold below cost
    const itemsBelowCost = invItems.filter((item) => {
      const originalInvItem = inventoryItems?.find((inv) => inv.id === item.inventoryItemId);
      if (!originalInvItem) return false;
      return (item.unitPrice || 0) < (originalInvItem.costPrice || 0);
    });

    if (itemsBelowCost.length > 0) {
      // Trigger guard modal instead of saving immediately
      setShowProfitGuardModal(true);
      return;
    }

    executeSave();
  };

  const executeSave = () => {
    const cust = customers.find((c) => c.id === invCustomerId) || customers[0];
    const prefix = invType === "SALES" ? "INV-SALES" : "RET-SALES";
    const nextNum = `${prefix}-${new Date().getFullYear()}-${(salesAndReturns.length + 1).toString().padStart(4, "0")}`;

    const paidVal = Number(invPaidAmount) || 0;
    const remainingVal = Math.max(0, invGrandTotal - paidVal);

    let calculatedStatus: Invoice["status"] = "PENDING";
    if (invType === "SALES_RETURN") {
      calculatedStatus = "RETURNED";
    } else if (remainingVal === 0) {
      calculatedStatus = "PAID";
    } else if (paidVal > 0) {
      calculatedStatus = "PARTIALLY_PAID";
    }

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: nextNum,
      type: invType,
      date: invDate,
      dueDate: invDueDate,
      partyId: cust?.id,
      partyName: cust?.nameAr || "عميل عام",
      customerId: cust?.id,
      customerName: cust?.nameAr || "عميل عام",
      currency: invCurrency,
      exchangeRate: currencies.find((c) => c.code === invCurrency)?.exchangeRateToUSD || 1,
      items: invItems,
      subtotal: invSubtotal,
      discountTotal: invDiscount,
      discountAmount: invDiscount,
      taxTotal: invTaxAmount,
      taxAmount: invTaxAmount,
      taxRate: invTaxRate,
      salesExpenseAmount: Number(invSalesExpense) || 0,
      grandTotal: invGrandTotal,
      totalAmount: invGrandTotal,
      paidAmount: paidVal,
      remainingAmount: remainingVal,
      paymentMethod: invPaymentMethod,
      walletName: invPaymentMethod.startsWith("WALLET") ? invWalletName : undefined,
      walletNumber: invPaymentMethod.startsWith("WALLET") ? invWalletNumber : undefined,
      walletEmail: invPaymentMethod.startsWith("WALLET") ? invWalletEmail : undefined,
      paymentAccountId: invPaymentAccountId,
      originalInvoiceNumber: invOriginalNumber || undefined,
      returnReason: invType === "SALES_RETURN" ? invReturnReason : undefined,
      status: calculatedStatus,
      paymentTerms: invTerms,
      notes: invNotes ? `${invNotes} [تجاوز مبيعات: ${overrideReason}]` : `[تجاوز مبيعات تحت التكلفة: ${overrideReason}]`,
      qrCodeData: generateZatcaQr(
        "مجموعة بن زياد التجارية المتحدة", 
        "300000000000003", 
        new Date().toISOString(), 
        invGrandTotal.toString(), 
        invTaxAmount.toString()
      ),
    };

    onSaveInvoice(newInvoice);
    setShowAddInvoiceModal(false);
    setShowProfitGuardModal(false);
    setManagerPasscode("");
    setPasscodeError("");
  };

  const getPaymentMethodLabel = (method?: InvoicePaymentMethod, walletName?: string) => {
    switch (method) {
      case "CASH":
        return { label: "نقداً (الخزينة)", icon: DollarSign, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
      case "WALLET_JAWWALI":
        return { label: "محفظة جوالي", icon: Wallet, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
      case "WALLET_JEEB":
        return { label: "محفظة جيب", icon: Wallet, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" };
      case "WALLET_FLOUSAK":
        return { label: "محفظة فلوسك", icon: Wallet, color: "text-teal-400 bg-teal-500/10 border-teal-500/30" };
      case "WALLET_ONECASH":
        return { label: "محفظة ون كاش", icon: Wallet, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" };
      case "WALLET_CASH":
        return { label: "محفظة كاش", icon: Wallet, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" };
      case "WALLET_MFLOOS":
        return { label: "إم فلوس", icon: Wallet, color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30" };
      case "WALLET_PAYPAL":
        return { label: "PayPal", icon: Wallet, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" };
      case "WALLET_STRIPE":
        return { label: "Stripe", icon: Wallet, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30" };
      case "WALLET_APPLE_PAY":
        return { label: "Apple Pay", icon: Wallet, color: "text-slate-100 bg-slate-100/10 border-slate-100/30" };
      case "WALLET_GOOGLE_PAY":
        return { label: "Google Pay", icon: Wallet, color: "text-blue-400 bg-blue-400/10 border-blue-400/30" };
      case "WALLET_OTHER":
        return { label: walletName || "محفظة إلكترونية", icon: Wallet, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" };
      case "BANK_TRANSFER":
        return { label: "حوالة مصرفية / بنك", icon: Building, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30" };
      case "CHECK":
        return { label: "شيك بنكي", icon: CreditCard, color: "text-slate-300 bg-slate-700/50 border-slate-600" };
      case "CREDIT":
      default:
        return { label: "آجل (ذمم مدينة)", icon: Clock, color: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Action */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 text-emerald-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="page-title text-2xl lg:text-3xl font-extrabold text-white flex items-center gap-2">
                فواتير المبيعات ومرتجع المبيعات
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono">
                  Sales & Returns Hub
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                إصدار ومتابعة فواتير المبيعات، إشعارات المرتجع الدائنة، مصروفات الشحن والتسليم، وتنوع وسائل الدفع المحلية
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Electronic Invoicing & Barcode Quick Button */}
          <button
            onClick={() => setActiveTab("EINVOICE")}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all border shadow-md cursor-pointer ${
              activeTab === "EINVOICE"
                ? "bg-purple-600 text-white border-purple-500 shadow-purple-900/40"
                : "bg-purple-950/80 hover:bg-purple-900/80 text-purple-200 border-purple-800/60"
            }`}
          >
            <QrCode className="w-5 h-5 text-purple-400" />
            <span>منظومة الفاتورة الإلكترونية والباركود</span>
          </button>

          {/* Main Prominent Action Button */}
          <button
            onClick={() => handleOpenAddModal("SALES")}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-base font-semibold shadow-lg shadow-emerald-600/25 transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>+ إنشاء فاتورة مبيعات أو مرتجع</span>
          </button>

          <button
            onClick={() => handleOpenAddModal("SALES_RETURN")}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-base font-semibold transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>تسجيل مرتجع مبيعات</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-sm font-semibold mb-1">
            <span>إجمالي المبيعات</span>
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {formatMoney(totalGrossSales, displayCurrency, currencies)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {salesAndReturns.filter((i) => i.type === "SALES").length} فاتورة مصدرة
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-sm font-semibold mb-1">
            <span>مرتجع المبيعات</span>
            <RotateCcw className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">
            {formatMoney(totalSalesReturns, displayCurrency, currencies)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {salesAndReturns.filter((i) => i.type === "SALES_RETURN").length} إشعار دائن
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-sm font-semibold mb-1">
            <span>صافي المبيعات</span>
            <BadgeCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-bold text-teal-400 font-mono">
            {formatMoney(totalNetSales, displayCurrency, currencies)}
          </div>
          <div className="text-xs text-slate-500 mt-1">المبيعات بعد خصم المرتجعات</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-sm font-semibold mb-1">
            <span>المحصل (نقد/محافظ)</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400 font-mono">
            {formatMoney(totalCollected, displayCurrency, currencies)}
          </div>
          <div className="text-xs text-slate-500 mt-1">مدفوعات مستلمة فعلياً</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-sm font-semibold mb-1">
            <span>الذمم المتبقية</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            {formatMoney(totalReceivables, displayCurrency, currencies)}
          </div>
          <div className="text-xs text-slate-500 mt-1">مستحقات قيد التحصيل</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>مصروفات المبيعات</span>
            <Truck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-base lg:text-lg font-bold text-purple-400 font-mono">
            {formatMoney(totalSalesExpenses, displayCurrency, currencies)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">شحن، توصيل، خدمات</div>
        </div>
      </div>

      {/* When activeTab is EINVOICE, render the full Electronic Invoicing Module */}
      {activeTab === "EINVOICE" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("ALL")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <span>← العودة إلى جدول العمليات والمبيعات العامة</span>
            </button>
            <span className="text-xs text-purple-300 font-bold">
              الوضع النشط: الفاتورة الإلكترونية والباركود (ZATCA Phase 1 & 2 / Fatoora)
            </span>
          </div>

          <ElectronicInvoicingModule
            invoices={invoices}
            customers={customers}
            inventoryItems={inventoryItems}
            currencies={currencies}
            displayCurrency={displayCurrency}
            onOpenCreateInvoice={(type) => handleOpenAddModal(type)}
            onPrintDocument={onPrintDocument}
            onShareDocument={onShareDocument}
            onSaveInvoice={onSaveInvoice}
          />
        </div>
      ) : (
        <>
          {/* Tabs & Search & Filter Bar */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              {/* Sub Navigation Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-x-auto w-full md:w-auto">
                <button
                  onClick={() => setActiveTab("ALL")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "ALL"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  جميع العمليات ({salesAndReturns.length})
                </button>
                <button
                  onClick={() => setActiveTab("SALES")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "SALES"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  فواتير المبيعات ({salesAndReturns.filter((i) => i.type === "SALES").length})
                </button>
                <button
                  onClick={() => setActiveTab("RETURNS")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "RETURNS"
                      ? "bg-rose-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  مرتجع المبيعات والإشعارات الدائنة ({salesAndReturns.filter((i) => i.type === "SALES_RETURN").length})
                </button>
                <button
                  onClick={() => setActiveTab("EXPENSES")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "EXPENSES"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  مصروفات المبيعات والشحن ({salesAndReturns.filter((i) => (i.salesExpenseAmount || 0) > 0).length})
                </button>
                <button
                  onClick={() => setActiveTab("EINVOICE")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    (activeTab as string) === "EINVOICE"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-purple-300 hover:text-white hover:bg-purple-900/60"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>الفاتورة الإلكترونية والباركود (ZATCA)</span>
                </button>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <ColumnCustomizer
                  tableKey="sales_and_returns_list"
                  columns={SALES_COLUMNS}
                  visibleColumns={salesVis}
                  onChange={updateSalesVis}
                />
                <span className="text-xs text-slate-400">عدد النتائج: {filteredInvoices.length}</span>
              </div>
            </div>

            {/* Filter Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث برقم الفاتورة، اسم العميل، البيان..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Customer Filter */}
              <select
                value={selectedCustomerFilter}
                onChange={(e) => setSelectedCustomerFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">جميع العملاء</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameAr}
                  </option>
                ))}
              </select>

              {/* Payment Method Filter */}
              <select
                value={selectedPaymentFilter}
                onChange={(e) => setSelectedPaymentFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">جميع وسائل الدفع</option>
                <option value="CASH">نقداً (الخزينة)</option>
                <option value="WALLET_JAWWALI">محفظة جوالي</option>
                <option value="WALLET_JEEB">محفظة جيب</option>
                <option value="WALLET_FLOUSAK">محفظة فلوسك</option>
                <option value="WALLET_ONECASH">محفظة ون كاش</option>
                <option value="BANK_TRANSFER">حوالة مصرفية / بنك</option>
                <option value="CHECK">شيك بنكي</option>
                <option value="CREDIT">آجل / ذمم مدينة</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="PAID">مسددة بالكامل (Paid)</option>
                <option value="PARTIALLY_PAID">مسددة جزئياً (Partial)</option>
                <option value="PENDING">معلقة / مستحقة (Pending)</option>
                <option value="RETURNED">مرتجع مبيعات (Returned)</option>
              </select>
            </div>
          </div>

      {/* Mobile Card List (Section 4: Wireframe for Mobile Screens) */}
      <div className="block lg:hidden space-y-3">
        {filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
            لا توجد فواتير أو مرتجعات مطابقة لمعايير البحث الحالية
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const isReturn = inv.type === "SALES_RETURN";
            const pMethod = getPaymentMethodLabel(inv.paymentMethod, inv.walletName);
            const PMIcon = pMethod.icon;

            return (
              <div
                key={`mob-inv-${inv.id}`}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3 transition-all hover:border-slate-700"
              >
                {/* Card Header: Doc Number & Type Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-base text-slate-100">
                      📄 {inv.invoiceNumber}
                    </span>
                    {inv.originalInvoiceNumber && (
                      <span className="text-xs text-slate-400 font-sans">
                        (أصل: {inv.originalInvoiceNumber})
                      </span>
                    )}
                  </div>

                  {isReturn ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60 flex-shrink-0">
                      <RotateCcw className="w-3.5 h-3.5" />
                      مرتجع
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex-shrink-0">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      فاتورة بيع
                    </span>
                  )}
                </div>

                {/* Card Body: Customer, Date, Payment */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">العميل:</span>
                    <span className="font-semibold text-base text-slate-200 truncate max-w-[220px]">
                      {inv.customerName || inv.partyName || "عميل نقدي"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">التاريخ:</span>
                    <span className="font-mono font-medium text-slate-300" title={formatDualDate(inv.date)}>
                      {formatDate(inv.date)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">طريقة السداد:</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${pMethod.color}`}
                    >
                      <PMIcon className="w-3.5 h-3.5" />
                      <span>{pMethod.label}</span>
                    </span>
                  </div>

                  {/* Amount and Status Row */}
                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">إجمالي المبلغ:</span>
                      <span
                        className={`text-xl font-mono font-bold ${
                          isReturn ? "text-rose-400" : "text-sap-secondary dark:text-[#F5D76E]"
                        }`}
                      >
                        {isReturn ? "-" : "+"}
                        {formatMoney(inv.totalAmount, inv.currency, currencies)}
                      </span>
                    </div>

                    <div className="text-left">
                      {inv.status === "PAID" && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          ✅ معتمدة / مسددة
                        </span>
                      )}
                      {inv.status === "PARTIALLY_PAID" && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">
                          ⏳ سداد جزئي
                        </span>
                      )}
                      {inv.status === "PENDING" && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800">
                          ⏳ آجل مستحقة
                        </span>
                      )}
                      {inv.status === "RETURNED" && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-950 text-purple-400 border border-purple-800">
                          🔄 مرتجع مرحل
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Touch-Friendly Action Buttons (min 44px target) */}
                <div className="pt-2.5 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedInvoiceDetails(inv)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-base active:scale-95 transition-all border border-slate-700/80 min-h-[46px]"
                  >
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>معاينة التفاصيل بالكامل</span>
                  </button>

                  <button
                    onClick={() => onPrintDocument("INVOICE", inv)}
                    className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/80 active:scale-95 transition-all flex-shrink-0"
                    title="طباعة الفاتورة"
                    aria-label="طباعة الفاتورة"
                  >
                    <Printer className="w-5 h-5" />
                  </button>

                  {onShareDocument && (
                    <button
                      onClick={() =>
                        onShareDocument({
                          type: "INVOICE",
                          data: inv,
                          recipientName: inv.customerName,
                          recipientPhone: inv.customerPhone,
                        })
                      }
                      className="w-11 h-11 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/80 flex items-center justify-center active:scale-95 transition-all flex-shrink-0"
                      title="مشاركة"
                      aria-label="مشاركة"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main Table List (Only on Large Screens) */}
      <div className="hidden lg:block bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                {isSalesVis("invoiceNumber") && <th className="p-3.5 font-semibold">رقم الفاتورة / المستند</th>}
                {isSalesVis("type") && <th className="p-3.5 font-semibold">النوع</th>}
                {isSalesVis("customerName") && <th className="p-3.5 font-semibold">العميل</th>}
                {isSalesVis("date") && <th className="p-3.5 font-semibold">التاريخ</th>}
                {isSalesVis("totalAmount") && <th className="p-3.5 font-semibold text-left">إجمالي الفاتورة</th>}
                {isSalesVis("salesExpenseAmount") && <th className="p-3.5 font-semibold text-left">مصروفات المبيعات</th>}
                {isSalesVis("paidAmount") && <th className="p-3.5 font-semibold text-left">المدفوع</th>}
                {isSalesVis("remainingAmount") && <th className="p-3.5 font-semibold text-left">المتبقي (الذمة)</th>}
                {isSalesVis("paymentMethod") && <th className="p-3.5 font-semibold">وسيلة الدفع</th>}
                {isSalesVis("status") && <th className="p-3.5 font-semibold">الحالة</th>}
                {isSalesVis("actions") && <th className="p-3.5 font-semibold text-center">إجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={SALES_COLUMNS.filter((c) => isSalesVis(c.id)).length} className="p-8 text-center text-slate-500">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    لا توجد فواتير أو مرتجعات مطابقة لمعايير البحث الحالية
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isReturn = inv.type === "SALES_RETURN";
                  const pMethod = getPaymentMethodLabel(inv.paymentMethod, inv.walletName);
                  const PMIcon = pMethod.icon;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      {isSalesVis("invoiceNumber") && (
                        <td className="p-3.5 font-semibold text-base text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <span>{inv.invoiceNumber}</span>
                            {inv.originalInvoiceNumber && (
                              <span className="text-xs text-slate-400 font-sans">
                                (أصل: {inv.originalInvoiceNumber})
                              </span>
                            )}
                          </div>
                        </td>
                      )}

                      {isSalesVis("type") && (
                        <td className="p-3.5">
                          {isReturn ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                              <RotateCcw className="w-3.5 h-3.5" />
                              مرتجع مبيعات
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                              <ShoppingBag className="w-3.5 h-3.5" />
                              فاتورة مبيعات
                            </span>
                          )}
                        </td>
                      )}

                      {isSalesVis("customerName") && (
                        <td className="p-3.5 font-semibold text-base text-slate-200">
                          {inv.customerName || inv.partyName || "عميل نقدي"}
                        </td>
                      )}

                      {isSalesVis("date") && (
                        <td className="p-3.5 text-slate-400 font-mono font-medium text-sm" title={formatDualDate(inv.date)}>
                          {formatDate(inv.date)}
                        </td>
                      )}

                      {isSalesVis("totalAmount") && (
                        <td className="p-3.5 text-left font-mono font-bold text-base lg:text-lg">
                          <span className={isReturn ? "text-rose-400" : "text-sap-secondary dark:text-[#F5D76E]"}>
                            {isReturn ? "-" : "+"}
                            {formatMoney(inv.totalAmount, inv.currency, currencies)}
                          </span>
                        </td>
                      )}

                      {isSalesVis("salesExpenseAmount") && (
                        <td className="p-3.5 text-left font-mono">
                          {(inv.salesExpenseAmount || 0) > 0 ? (
                            <span className="text-purple-400 font-medium">
                              {formatMoney(inv.salesExpenseAmount || 0, inv.currency, currencies)}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                      )}

                      {isSalesVis("paidAmount") && (
                        <td className="p-3.5 text-left font-mono text-cyan-400">
                          {formatMoney(inv.paidAmount || (inv.status === "PAID" ? inv.totalAmount : 0), inv.currency, currencies)}
                        </td>
                      )}

                      {isSalesVis("remainingAmount") && (
                        <td className="p-3.5 text-left font-mono">
                          {(inv.remainingAmount || 0) > 0 ? (
                            <span className="text-amber-400 font-bold">
                              {formatMoney(inv.remainingAmount || 0, inv.currency, currencies)}
                            </span>
                          ) : (
                            <span className="text-slate-500">0.00</span>
                          )}
                        </td>
                      )}

                      {isSalesVis("paymentMethod") && (
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium border ${pMethod.color}`}
                          >
                            <PMIcon className="w-3 h-3" />
                            <span>{pMethod.label}</span>
                          </span>
                        </td>
                      )}

                      {isSalesVis("status") && (
                        <td className="p-3.5">
                          {inv.status === "PAID" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                              مسددة بالكامل
                            </span>
                          )}
                          {inv.status === "PARTIALLY_PAID" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-950 text-amber-400 border border-amber-800">
                              سداد جزئي
                            </span>
                          )}
                          {inv.status === "PENDING" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-950 text-rose-400 border border-rose-800">
                              آجل (مستحقة)
                            </span>
                          )}
                          {inv.status === "RETURNED" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-950 text-purple-400 border border-purple-800">
                              مرتجع مرحل
                            </span>
                          )}
                        </td>
                      )}

                      {isSalesVis("actions") && (
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {onShareDocument && (
                              <button
                                onClick={() =>
                                  onShareDocument({
                                    type: "INVOICE",
                                    data: inv,
                                    recipientName: inv.customerName,
                                    recipientPhone: inv.customerPhone,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-800 hover:text-white transition-colors"
                                title="مشاركة عبر واتساب / SMS"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => onPrintDocument("INVOICE", inv)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                              title="معاينة وطباعة الفاتورة"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedInvoiceDetails(inv)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                              title="تفاصيل البنود والمصروفات"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* CREATE INVOICE OR RETURN MODAL */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-4 text-right animate-in zoom-in-95 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <FormNavigationBar
              title={invType === "SALES" ? "إنشاء فاتورة مبيعات جديدة (Sales Invoice)" : "تسجيل مرتجع مبيعات (Sales Return)"}
              onBack={() => setShowAddInvoiceModal(false)}
              onSave={() => {
                const formEl = document.getElementById("sales-invoice-form") as HTMLFormElement;
                if (formEl) formEl.requestSubmit();
              }}
              onSaveAndPrint={() => {
                const formEl = document.getElementById("sales-invoice-form") as HTMLFormElement;
                if (formEl) formEl.requestSubmit();
              }}
              onSaveAndNew={() => {
                const formEl = document.getElementById("sales-invoice-form") as HTMLFormElement;
                if (formEl) formEl.requestSubmit();
              }}
              hasUnsavedChanges={Boolean(invItems.length > 0 || invNotes.trim() !== "")}
              customActions={
                <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setInvType("SALES")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      invType === "SALES"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    فاتورة مبيعات
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvType("SALES_RETURN")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      invType === "SALES_RETURN"
                        ? "bg-rose-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    مرتجع مبيعات
                  </button>
                </div>
              }
            />

            <div className="p-6 overflow-y-auto flex-1">
              <form id="sales-invoice-form" onSubmit={handleSaveForm} className="space-y-5">
              {/* Customer & Main Meta */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-slate-400 font-medium">
                      العميل / المستفيد *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddCustomer(true)}
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30 transition-all"
                      title="إضافة عميل جديد لم يكن مسجلاً"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة عميل</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Combobox
                      options={customerOptions}
                      value={invCustomerId}
                      onChange={(val) => setInvCustomerId(val)}
                      placeholder="ابحث عن عميل..."
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setShowQuickAddCustomer(true)}
                      className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center"
                      title="إضافة عميل جديد (+)"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">
                    تاريخ الفاتورة *
                  </label>
                  <input
                    type="date"
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">
                    تاريخ الاستحقاق
                  </label>
                  <input
                    type="date"
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Extra Return Details if Return */}
              {invType === "SALES_RETURN" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-rose-950/20 border border-rose-900/40">
                  <div>
                    <label className="block text-xs text-rose-300 mb-1 font-medium">
                      رقم فاتورة المبيعات الأصلية (المرتجعة)
                    </label>
                    <input
                      type="text"
                      value={invOriginalNumber}
                      onChange={(e) => setInvOriginalNumber(e.target.value)}
                      placeholder="مثال: INV-SALES-2026-0001"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-rose-300 mb-1 font-medium">
                      سبب الإرجاع وملاحظات الفحص
                    </label>
                    <input
                      type="text"
                      value={invReturnReason}
                      onChange={(e) => setInvReturnReason(e.target.value)}
                      placeholder="مثال: عيوب مصنعية، أو طلب العميل إلغاء البند..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              )}

              {/* Currency & Cost Center */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">
                    عملة الفاتورة
                  </label>
                  <select
                    value={invCurrency}
                    onChange={(e) => setInvCurrency(e.target.value as CurrencyCode)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">
                    شروط السداد المعتمدة
                  </label>
                  <input
                    type="text"
                    value={invTerms}
                    onChange={(e) => setInvTerms(e.target.value)}
                    placeholder="مثال: نقداً فور الاستلام، أو 30 يوماً..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                {/* Barcode Fast Scan / Input Bar */}
                <div className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-emerald-900/60 shadow-inner">
                  <Barcode className="w-5 h-5 text-emerald-400 shrink-0" />
                  <input
                    type="text"
                    value={barcodeSearchTerm}
                    onChange={(e) => setBarcodeSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleScanOrAddBarcode();
                      }
                    }}
                    placeholder="مسح الباركود بقارئ الليزر (Scanner) أو إدخال كود الصنف / SKU والضغط على Enter لإضافته فوراً..."
                    className="flex-1 bg-transparent border-none text-xs text-emerald-200 placeholder-slate-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleScanOrAddBarcode()}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة بالباركود</span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>بنود الأصناف والخدمات ({invItems.length})</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveRowForItemAdd(null);
                        setShowQuickAddItem(true);
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 bg-emerald-950/50 hover:bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-800/40 transition-colors"
                      title="إضافة صنف جديد لم يكن مسجلاً في المخزون"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة صنف جديد (+)</span>
                    </button>
                    <button
                      type="button"
                      onClick={addInvoiceItem}
                      className="text-xs text-slate-300 hover:text-white font-semibold flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      سطر جديد
                    </button>
                  </div>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-right text-xs min-w-[750px]">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <th className="p-2.5 min-w-[360px]">الصنف من المخزون / بيان الخدمة</th>
                        <th className="p-2.5 w-24">الكمية</th>
                        <th className="p-2.5 w-32">سعر الوحدة</th>
                        <th className="p-2.5 w-32 text-left">الإجمالي</th>
                        <th className="p-2.5 w-12 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                      {invItems.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="p-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                              {/* Inventory Items Dropdown Selector */}
                              {inventoryItems && inventoryItems.length > 0 ? (
                                <Combobox
                                  options={inventoryOptions}
                                  value={item.inventoryItemId || ""}
                                  onChange={(val) => {
                                    if (!val) {
                                      updateInvoiceItem(item.id, "inventoryItemId", undefined);
                                      return;
                                    }
                                    const selected = inventoryItems.find((inv) => inv.id === val);
                                    if (selected) {
                                      const pricing = getItemPricingDetails(selected, invCustomerId);
                                      updateInvoiceItem(item.id, "inventoryItemId", selected.id);
                                      updateInvoiceItem(item.id, "description", selected.nameAr);
                                      updateInvoiceItem(item.id, "unitPrice", pricing.lastSellingPrice || selected.sellingPrice || selected.costPrice || 0);
                                    }
                                  }}
                                  placeholder="ابحث عن صنف..."
                                  className="flex-1 min-w-[240px]"
                                />
                              ) : (
                                <div className="text-amber-400 text-[11px] py-1 px-2 bg-amber-950/40 border border-amber-800/50 rounded-lg flex items-center gap-1">
                                  <span>لا توجد أصناف بالمخزون حالياً</span>
                                </div>
                              )}

                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateInvoiceItem(item.id, "description", e.target.value)}
                                placeholder="بيان الصنف أو تفاصيل الفاتورة..."
                                className="w-full sm:w-48 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                required
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveRowForItemAdd(item.id);
                                  setShowQuickAddItem(true);
                                }}
                                className="p-1.5 bg-emerald-950/60 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-800/50 rounded-lg text-xs transition-all shrink-0 self-end sm:self-center"
                                title="إضافة صنف جديد لم يكن مسجلاً (+)"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {/* Selected Item Price & Cost Info Banner */}
                            {(() => {
                              const selInv = inventoryItems.find((inv) => inv.id === item.inventoryItemId);
                              if (!selInv) return null;
                              const pricing = getItemPricingDetails(selInv, invCustomerId);
                              const currentPrice = item.unitPrice || 0;
                              const margin = currentPrice - pricing.costPrice;
                              const marginPercent = pricing.costPrice > 0 ? ((margin / pricing.costPrice) * 100).toFixed(1) : "0";

                              return (
                                <div className="mt-2 p-2.5 bg-slate-900/95 border border-emerald-800/40 rounded-xl space-y-2 text-xs animate-fade-in shadow-md">
                                  {/* Header info */}
                                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                      <span className="font-bold text-slate-100 text-sm">{selInv.nameAr}</span>
                                      <span className="text-[11px] text-slate-400 font-mono">({selInv.code})</span>
                                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                                        المتوفر: {selInv.quantityOnHand || 0} {selInv.unit || "وحدة"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[11px]">
                                      <span className="text-slate-400">هامش الربح للفاتورة:</span>
                                      <span className={`font-mono font-bold px-2 py-0.5 rounded ${margin >= 0 ? "bg-emerald-950 text-emerald-300 border border-emerald-800/50" : "bg-rose-950 text-rose-300 border border-rose-800/50"}`}>
                                        {margin >= 0 ? "+" : ""}{margin.toLocaleString()} {pricing.currencySymbol} ({marginPercent}%)
                                      </span>
                                    </div>
                                  </div>

                                  {/* Grid of the 4 requested price metrics */}
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                    {/* 1. اسم الصنف ورمزه */}
                                    <div className="bg-slate-950/80 border border-slate-800/70 p-2 rounded-lg">
                                      <div className="text-slate-400 text-[10px] mb-0.5">اسم الصنف والتصنيف</div>
                                      <div className="font-bold text-slate-200 truncate" title={selInv.nameAr}>{selInv.nameAr}</div>
                                      <div className="text-[10px] text-slate-400 truncate">{selInv.category} - {selInv.unit}</div>
                                    </div>

                                    {/* 2. آخر سعر بيع */}
                                    <div 
                                      onClick={() => updateInvoiceItem(item.id, "unitPrice", pricing.lastSellingPrice)}
                                      className="bg-emerald-950/40 border border-emerald-800/50 p-2 rounded-lg hover:border-emerald-400 cursor-pointer transition-all"
                                      title="انقر لتطبيق آخر سعر بيع على السطر"
                                    >
                                      <div className="text-emerald-400 font-semibold text-[10px] mb-0.5 flex items-center justify-between">
                                        <span>آخر سعر بيع</span>
                                        {pricing.lastSellingDate && <span className="text-[9px] text-slate-400 font-mono">{pricing.lastSellingDate}</span>}
                                      </div>
                                      <div className="font-black text-emerald-300 text-sm font-mono">
                                        {pricing.lastSellingPrice.toLocaleString()} <span className="text-[10px] font-normal">{pricing.currencySymbol}</span>
                                      </div>
                                      <div className="text-[10px] text-slate-400 truncate">
                                        {pricing.lastCustomerName ? `للعميل: ${pricing.lastCustomerName}` : `سعر البيع المعتمد`}
                                      </div>
                                    </div>

                                    {/* 3. سعر الشراء */}
                                    <div className="bg-blue-950/40 border border-blue-800/50 p-2 rounded-lg">
                                      <div className="text-blue-400 font-semibold text-[10px] mb-0.5 flex items-center justify-between">
                                        <span>سعر الشراء</span>
                                        {pricing.lastPurchaseDate && <span className="text-[9px] text-slate-400 font-mono">{pricing.lastPurchaseDate}</span>}
                                      </div>
                                      <div className="font-black text-blue-300 text-sm font-mono">
                                        {pricing.purchasePrice.toLocaleString()} <span className="text-[10px] font-normal">{pricing.currencySymbol}</span>
                                      </div>
                                      <div className="text-[10px] text-slate-400 truncate">
                                        {pricing.lastVendorName ? `من: ${pricing.lastVendorName}` : "سعر التوريد من المورد"}
                                      </div>
                                    </div>

                                    {/* 4. سعر التكلفة */}
                                    <div className="bg-amber-950/40 border border-amber-800/50 p-2 rounded-lg">
                                      <div className="text-amber-400 font-semibold text-[10px] mb-0.5">سعر التكلفة المخزنية</div>
                                      <div className="font-black text-amber-300 text-sm font-mono">
                                        {pricing.costPrice.toLocaleString()} <span className="text-[10px] font-normal">{pricing.currencySymbol}</span>
                                      </div>
                                      <div className="text-[10px] text-slate-400">متوسط التكلفة المرجح (WAC)</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              step="any"
                              value={item.quantity}
                              onChange={(e) => updateInvoiceItem(item.id, "quantity", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono text-center focus:outline-none focus:border-emerald-500"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.unitPrice}
                              onChange={(e) => updateInvoiceItem(item.id, "unitPrice", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 text-left"
                              required
                            />
                          </td>
                          <td className="p-2 text-left font-mono font-bold text-slate-200">
                            {formatNumberOnly(item.total)}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeInvoiceItem(item.id)}
                              disabled={invItems.length <= 1}
                              className="p-1 rounded text-rose-400 hover:bg-rose-950/50 disabled:opacity-30"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals, Sales Expenses, Taxes & Discounts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 block border-b border-slate-800 pb-1.5">
                    المصروفات الإضافية والخصومات
                  </span>

                  {/* Sales Expense / Shipping field requested by user */}
                  <div>
                    <label className="block text-xs text-purple-300 mb-1 font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-purple-400" />
                        <span>مصروفات المبيعات / الشحن والتسليم</span>
                      </span>
                      <span className="text-[10px] text-slate-400">تضاف لإجمالي الفاتورة</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={invSalesExpense}
                      onChange={(e) => setInvSalesExpense(Number(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full bg-slate-900 border border-purple-900/50 rounded-xl px-3 py-2 text-xs text-purple-200 font-mono focus:outline-none focus:border-purple-500 text-left"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">الخصم الممنوح</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={invDiscount}
                        onChange={(e) => setInvDiscount(Number(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono text-left"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">ضريبة القيمة المضافة %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={invTaxRate}
                        onChange={(e) => setInvTaxRate(Number(e.target.value) || 0)}
                        placeholder="0 %"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono text-left"
                      />
                    </div>
                  </div>
                </div>

                {/* Summary Totals */}
                <div className="space-y-2 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>مجموع البنود (Subtotal):</span>
                    <span className="font-mono">{formatNumberOnly(invSubtotal)}</span>
                  </div>
                  {invTaxAmount > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>الضريبة ({invTaxRate}%):</span>
                      <span className="font-mono text-emerald-400">+{formatNumberOnly(invTaxAmount)}</span>
                    </div>
                  )}
                  {invDiscount > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>الخصم الممنوح:</span>
                      <span className="font-mono text-rose-400">-{formatNumberOnly(invDiscount)}</span>
                    </div>
                  )}
                  {invSalesExpense > 0 && (
                    <div className="flex justify-between text-purple-300 font-medium">
                      <span>مصروفات المبيعات والشحن:</span>
                      <span className="font-mono">+{formatNumberOnly(invSalesExpense)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                    <span>الإجمالي المستحق:</span>
                    <span className="font-mono text-emerald-400">
                      {formatMoney(invGrandTotal, invCurrency, currencies)}
                    </span>
                  </div>
                </div>

                {/* FEATURE 3: Invoice Profitability & Tax Analytics Drawer */}
                <div className="p-3.5 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span>تحليل ربحية الفاتورة والضرائب (Profitability Analytics)</span>
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      invoiceMarginPercent < 0 
                        ? "bg-rose-950 text-rose-300 border border-rose-800/40" 
                        : invoiceMarginPercent < 15 
                          ? "bg-amber-950 text-amber-300 border border-amber-800/40" 
                          : "bg-emerald-950 text-emerald-300 border border-emerald-800/40"
                    }`}>
                      {invoiceMarginPercent < 0 ? "⚠️ بيع بالخسارة" : invoiceMarginPercent < 15 ? "📊 ربحية منخفضة" : "🟢 ربحية ممتازة"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                      <div className="text-[9px] text-slate-400 mb-0.5">تكلفة المشتريات (COGS)</div>
                      <div className="text-xs font-mono font-bold text-amber-500">{invoiceCOGS.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                      <div className="text-[9px] text-slate-400 mb-0.5">صافي الربح المتوقع</div>
                      <div className={`text-xs font-mono font-bold ${invoiceGrossProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {invoiceGrossProfit.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                      <div className="text-[9px] text-slate-400 mb-0.5">هامش الربح %</div>
                      <div className={`text-xs font-mono font-bold ${invoiceMarginPercent >= 15 ? "text-emerald-400" : invoiceMarginPercent >= 0 ? "text-amber-400" : "text-rose-400"}`}>
                        {invoiceMarginPercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          invoiceMarginPercent < 0 
                            ? "bg-rose-500" 
                            : invoiceMarginPercent < 15 
                              ? "bg-amber-500" 
                              : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, invoiceMarginPercent))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-500">
                      <span>0% تكلفة</span>
                      <span>هامش الربح الحالي</span>
                      <span>100% حد أقصى</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PAYMENT METHODS & SETTLEMENT SECTION */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    <span>تنوع وسائل الدفع وحساب السداد (Payment & E-Wallets)</span>
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleSetPaidQuick("FULL")}
                      className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded hover:bg-emerald-900"
                    >
                      سداد كامل (100%)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPaidQuick("HALF")}
                      className="text-[10px] px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded hover:bg-amber-900"
                    >
                      سداد 50%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPaidQuick("ZERO")}
                      className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                    >
                      آجل بالكامل (0%)
                    </button>
                  </div>
                </div>

                {/* Payment Method Selector Grid */}
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-medium">
                    اختر وسيلة الدفع أو المحفظة الإلكترونية:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Cash */}
                    <button
                      type="button"
                      onClick={() => {
                        setInvPaymentMethod("CASH");
                        setInvPaymentAccountId(cashVaults[0]?.glAccountId || "110101");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        invPaymentMethod === "CASH"
                          ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span>نقداً (الخزينة)</span>
                    </button>

                    {/* Jawwali Wallet */}
                    <button
                      type="button"
                      onClick={() => {
                        setInvPaymentMethod("WALLET_JAWWALI");
                        setInvWalletName("محفظة جوالي");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        invPaymentMethod === "WALLET_JAWWALI"
                          ? "bg-amber-600/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-amber-400" />
                      <span>محفظة جوالي</span>
                    </button>

                    {/* Jeeb Wallet */}
                    <button
                      type="button"
                      onClick={() => {
                        setInvPaymentMethod("WALLET_JEEB");
                        setInvWalletName("محفظة جيب");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        invPaymentMethod === "WALLET_JEEB"
                          ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-blue-400" />
                      <span>محفظة جيب</span>
                    </button>

                    {/* Flousak Wallet */}
                    <button
                      type="button"
                      onClick={() => {
                        setInvPaymentMethod("WALLET_FLOUSAK");
                        setInvWalletName("محفظة فلوسك");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        invPaymentMethod === "WALLET_FLOUSAK"
                          ? "bg-teal-600/20 border-teal-500 text-teal-300 shadow-md shadow-teal-500/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-teal-400" />
                      <span>محفظة فلوسك</span>
                    </button>

                    {/* OneCash */}
                    <button
                      type="button"
                      onClick={() => {
                        setInvPaymentMethod("WALLET_ONECASH");
                        setInvWalletName("محفظة ون كاش");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        invPaymentMethod === "WALLET_ONECASH"
                          ? "bg-cyan-600/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-cyan-400" />
                      <span>ون كاش</span>
                    </button>

                    {/* M-Floos */}
                    <button
                      type="button"
                      onClick={() => {
                        setInvPaymentMethod("WALLET_MFLOOS");
                        setInvWalletName("إم فلوس");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        invPaymentMethod === "WALLET_MFLOOS"
                          ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-emerald-300" />
                      <span>إم فلوس</span>
                    </button>

                    {/* PayPal */}
                    <button
                      type="button"
                      onClick={() => {
                        setInvPaymentMethod("WALLET_PAYPAL");
                        setInvWalletName("PayPal");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        invPaymentMethod === "WALLET_PAYPAL"
                          ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-blue-500" />
                      <span>PayPal</span>
                    </button>

                    {/* Apple Pay */}
                    <button
                      type="button"
                      onClick={() => {
                        setInvPaymentMethod("WALLET_APPLE_PAY");
                        setInvWalletName("Apple Pay");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        invPaymentMethod === "WALLET_APPLE_PAY"
                          ? "bg-slate-100/20 border-slate-100 text-slate-100 shadow-md shadow-slate-100/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-slate-100" />
                      <span>Apple Pay</span>
                    </button>

                    {/* Bank Transfer */}
                    <button
                      type="button"
                      onClick={() => {
                        setInvPaymentMethod("BANK_TRANSFER");
                        setInvPaymentAccountId(bankAccounts[0]?.glAccountId || "110201");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        invPaymentMethod === "BANK_TRANSFER"
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Building className="w-4 h-4 text-indigo-400" />
                      <span>حوالة / بنك</span>
                    </button>

                    {/* Client Exchange Deposit Account */}
                    <button
                      type="button"
                      onClick={() => {
                        setInvPaymentMethod("EXCHANGE_BALANCE" as any);
                        setInvWalletName("رصيد حساب الصرافة (أمانات العميل)");
                        setInvPaymentAccountId("2104");
                        setInvPaidAmount(invGrandTotal);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        (invPaymentMethod as any) === "EXCHANGE_BALANCE"
                          ? "bg-amber-600/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <ArrowLeftRight className="w-4 h-4 text-amber-400" />
                      <span>رصيد الصرافة (أمانات)</span>
                    </button>

                    {/* Bank Check */}
                    <button
                      type="button"
                      onClick={() => setInvPaymentMethod("CHECK")}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        invPaymentMethod === "CHECK"
                          ? "bg-purple-600/20 border-purple-500 text-purple-300"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-purple-400" />
                      <span>شيك بنكي</span>
                    </button>

                    {/* Credit (On Account) */}
                    <button
                      type="button"
                      onClick={() => {
                        setInvPaymentMethod("CREDIT");
                        setInvPaidAmount(0);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        invPaymentMethod === "CREDIT"
                          ? "bg-rose-600/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Clock className="w-4 h-4 text-rose-400" />
                      <span>آجل (ذمة العميل)</span>
                    </button>
                  </div>
                </div>

                {/* Paid & Remaining Amounts */}
                {invPaymentMethod.startsWith("WALLET") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pb-2 border-b border-slate-800">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">رقم المحفظة / الهاتف</label>
                      <input
                        type="text"
                        value={invWalletNumber}
                        onChange={(e) => setInvWalletNumber(e.target.value)}
                        placeholder="رقم هاتف العميل أو رقم المحفظة..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">البريد الإلكتروني (إن وجد)</label>
                      <input
                        type="email"
                        value={invWalletEmail}
                        onChange={(e) => setInvWalletEmail(e.target.value)}
                        placeholder="paypal@example.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      حساب الإيداع / الخزينة / البنك
                    </label>
                    <select
                      value={invPaymentAccountId}
                      onChange={(e) => setInvPaymentAccountId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <optgroup label="الخزائن والمحافظ النقدية">
                        {cashVaults.map((v) => (
                          <option key={v.id} value={v.glAccountId}>
                            {v.name} ({v.currency})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="الحسابات البنكية">
                        {bankAccounts.map((b) => (
                          <option key={b.id} value={b.glAccountId}>
                            {b.bankName} - {b.accountNumber}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-cyan-400 mb-1 font-medium">
                      المبلغ المدفوع (المحصل الآن) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={invPaidAmount}
                      onChange={(e) => setInvPaidAmount(Number(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-400 text-left"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-amber-400 mb-1 font-medium">
                      المبلغ المتبقي (ذمة على العميل)
                    </label>
                    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold text-left flex items-center justify-between">
                      <span>{formatNumberOnly(invRemainingAmount)}</span>
                      <span className="text-[10px] text-slate-500 font-sans">
                        {invRemainingAmount === 0 ? "مسدد بالكامل" : "ذمة مستحقة"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">ملاحظات وبيان إضافي</label>
                <textarea
                  rows={2}
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  placeholder="أي ملاحظات أو بنود خاصة بالفاتورة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ وترحيل الفاتورة للقيد المحاسبي</span>
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedInvoiceDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 text-right animate-in zoom-in-95 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>تفاصيل الفاتورة: {selectedInvoiceDetails.invoiceNumber}</span>
              </h3>
              <button
                onClick={() => setSelectedInvoiceDetails(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500">العميل:</span>
                <div className="font-bold text-slate-200 mt-1">{selectedInvoiceDetails.customerName}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500">تاريخ الفاتورة:</span>
                <div className="font-mono font-bold text-emerald-400 mt-1">
                  {formatDate(selectedInvoiceDetails.date)}
                  <div className="text-[10px] text-slate-400 font-normal">
                    {formatDualDate(selectedInvoiceDetails.date)}
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="p-2.5">البيان</th>
                    <th className="p-2.5 text-center">الكمية</th>
                    <th className="p-2.5 text-left">السعر</th>
                    <th className="p-2.5 text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {selectedInvoiceDetails.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 text-slate-200">{item.description}</td>
                      <td className="p-2.5 text-center font-mono">{item.quantity}</td>
                      <td className="p-2.5 text-left font-mono">{formatNumberOnly(item.unitPrice)}</td>
                      <td className="p-2.5 text-left font-mono font-bold text-slate-200">
                        {formatNumberOnly(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Breakdown */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>مجموع البنود:</span>
                <span className="font-mono">{formatNumberOnly(selectedInvoiceDetails.subtotal)}</span>
              </div>
              {(selectedInvoiceDetails.salesExpenseAmount || 0) > 0 && (
                <div className="flex justify-between text-purple-300">
                  <span>مصروفات المبيعات والشحن:</span>
                  <span className="font-mono">+{formatNumberOnly(selectedInvoiceDetails.salesExpenseAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
                <span>الإجمالي الكلي:</span>
                <span className="font-mono">
                  {formatMoney(selectedInvoiceDetails.totalAmount, selectedInvoiceDetails.currency, currencies)}
                </span>
              </div>
              <div className="flex justify-between text-cyan-400">
                <span>المبلغ المدفوع:</span>
                <span className="font-mono">{formatNumberOnly(selectedInvoiceDetails.paidAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-bold">
                <span>المتبقي (ذمة):</span>
                <span className="font-mono">{formatNumberOnly(selectedInvoiceDetails.remainingAmount || 0)}</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              {onShareDocument && (
                <button
                  onClick={() => {
                    onShareDocument({
                      type: "INVOICE",
                      data: selectedInvoiceDetails,
                      recipientName: selectedInvoiceDetails.customerName,
                      recipientPhone: selectedInvoiceDetails.customerPhone,
                    });
                    setSelectedInvoiceDetails(null);
                  }}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </button>
              )}
              <button
                onClick={async () => {
                  await exportInvoiceToPdf("INVOICE", selectedInvoiceDetails, currencies);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <FileDown className="w-4 h-4" />
                تصدير كـ PDF
              </button>
              <button
                onClick={() => {
                  onPrintDocument("INVOICE", selectedInvoiceDetails);
                  setSelectedInvoiceDetails(null);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                طباعة الفاتورة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Quick Add Customer */}
      <QuickAddCustomerModal
        isOpen={showQuickAddCustomer}
        onClose={() => setShowQuickAddCustomer(false)}
        currencies={currencies}
        existingCustomers={customers}
        onCustomerCreated={(newCust) => {
          onAddCustomer?.(newCust);
          setInvCustomerId(newCust.id);
        }}
      />

      {/* Modal: Quick Add Item */}
      <QuickAddItemModal
        isOpen={showQuickAddItem}
        onClose={() => {
          setShowQuickAddItem(false);
          setActiveRowForItemAdd(null);
        }}
        currencies={currencies}
        existingItems={inventoryItems}
        defaultCategory="مواد بناء وأسمنت"
        onItemCreated={(newItem) => {
          onAddInventoryItem?.(newItem);
          if (activeRowForItemAdd) {
            updateInvoiceItem(activeRowForItemAdd, "inventoryItemId", newItem.id);
            updateInvoiceItem(activeRowForItemAdd, "description", newItem.nameAr);
            updateInvoiceItem(activeRowForItemAdd, "unitPrice", newItem.sellingPrice || newItem.costPrice || 0);
          } else {
            // Append as new invoice line item
            setInvItems((prev) => [
              ...prev,
              {
                id: `item-${Date.now()}`,
                inventoryItemId: newItem.id,
                description: newItem.nameAr,
                quantity: 1,
                unitPrice: newItem.sellingPrice || newItem.costPrice || 0,
                total: newItem.sellingPrice || newItem.costPrice || 0,
                notes: newItem.code,
              },
            ]);
          }
          setActiveRowForItemAdd(null);
        }}
      />

      {/* FEATURE 1: Modal: Profitability Guard Override Warning */}
      {showProfitGuardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-950/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5 pb-2 border-b border-rose-900/20">
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-400">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">درع حماية الأمان والربحية 🚨</h3>
                <p className="text-[11px] text-rose-300 mt-0.5">تم رصد أصناف مسعرة بأقل من تكلفة الشراء الفعلية!</p>
              </div>
            </div>

            <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-bold mb-1">الأصناف المخالفة لسياسة الهامش:</div>
              {invItems.map((item) => {
                const orig = inventoryItems?.find((inv) => inv.id === item.inventoryItemId);
                if (!orig || (item.unitPrice || 0) >= (orig.costPrice || 0)) return null;
                const itemDeficit = (orig.costPrice || 0) - (item.unitPrice || 0);
                return (
                  <div key={item.id} className="flex justify-between items-center text-[11px] border-b border-slate-800/40 last:border-0 pb-1.5 pt-1">
                    <span className="text-slate-300 font-medium">{item.description || "صنف غير مسمى"}</span>
                    <div className="flex items-center gap-1.5 text-right font-mono">
                      <span className="text-slate-500">التكلفة: {orig.costPrice}</span>
                      <span className="text-rose-400 font-bold">البيع: {item.unitPrice}</span>
                      <span className="text-rose-500 font-bold bg-rose-950/40 px-1 rounded">-{itemDeficit}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">سبب الاستثناء (البيع بالخسارة):</label>
                <select
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="تخفيضات خاصة بالعميل وتصفية كميات بموافقة الإدارة">تخفيضات خاصة بالعميل وتصفية كميات بموافقة الإدارة</option>
                  <option value="بيع عينات ترويجية للعملاء">بيع عينات ترويجية للعملاء</option>
                  <option value="تلف جزئي أو تاريخ صلاحية قريب">تلف جزئي أو تاريخ صلاحية قريب</option>
                  <option value="اتفاقية تجارية متبادلة مع المورد">اتفاقية تجارية متبادلة مع المورد</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">رمز التحقق لتجاوز المدير (Supervisor Passcode):</label>
                <input
                  type="password"
                  placeholder="أدخل الرمز لتأكيد الإذن (الافتراضي: 1234)"
                  value={managerPasscode}
                  onChange={(e) => {
                    setManagerPasscode(e.target.value);
                    setPasscodeError("");
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-center text-white"
                />
                {passcodeError && (
                  <p className="text-[10px] text-rose-400 mt-1">{passcodeError}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (managerPasscode === "1234") {
                    executeSave();
                  } else {
                    setPasscodeError("❌ رمز المرور غير صحيح! يرجى إدخال رمز المدير المعتمد (1234).");
                  }
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white rounded-xl text-xs font-extrabold shadow-lg transition-all active:scale-95"
              >
                🔓 اعتماد وتجاوز الأمان
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfitGuardModal(false);
                  setManagerPasscode("");
                  setPasscodeError("");
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
              >
                إلغاء وتعديل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
