import React, { useState, useMemo } from "react";
import {
  Truck,
  Plus,
  Search,
  Printer,
  Calendar,
  DollarSign,
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wallet,
  Building2,
  CreditCard,
  Phone,
  Filter,
  Eye,
  FileSpreadsheet,
  BadgeCheck,
  Layers,
  Package,
  Share2,
  FileDown,
  Camera,
  Scan,
  Sparkles,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { exportInvoiceToPdf } from "../services/pdfExporter";
import {
  Account,
  BankAccountItem,
  CashVaultItem,
  CurrencyCode,
  CurrencyInfo,
  Invoice,
  InvoiceItem,
  InvoicePaymentMethod,
  InvoiceType,
  Vendor,
  InventoryItem,
} from "../types/erp";
import { formatMoney, formatNumberOnly } from "../services/erpStorage";
import { formatDate, formatDualDate } from "../utils/formatters";
import { generateZatcaQr } from "../utils/zatca";
import { QuickAddVendorModal, QuickAddItemModal } from "./QuickAddModals";
import { ColumnCustomizer, useColumnVisibility, ColumnDef } from "./ColumnCustomizer";
import { Combobox, ComboboxOption } from "./Combobox";

interface PurchasesAndReturnsViewProps {
  invoices: Invoice[];
  vendors: Vendor[];
  accounts: Account[];
  cashVaults: CashVaultItem[];
  bankAccounts: BankAccountItem[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  inventoryItems?: InventoryItem[];
  onSaveInvoice: (invoice: Invoice) => void;
  onAddVendor?: (vendor: Vendor) => void;
  onAddInventoryItem?: (item: InventoryItem) => void;
  onPrintDocument: (docType: "INVOICE", data: any) => void;
  onShareDocument?: (data: any) => void;
}

export const PurchasesAndReturnsView: React.FC<PurchasesAndReturnsViewProps> = ({
  invoices,
  vendors,
  accounts,
  cashVaults,
  bankAccounts,
  currencies,
  displayCurrency,
  inventoryItems = [],
  onSaveInvoice,
  onAddVendor,
  onAddInventoryItem,
  onPrintDocument,
  onShareDocument,
}) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "PURCHASES" | "RETURNS" | "EXPENSES">("ALL");

  const PURCHASES_COLUMNS: ColumnDef[] = [
    { id: "invoiceNumber", label: "رقم الفاتورة / المستند", locked: true },
    { id: "type", label: "النوع" },
    { id: "vendorName", label: "المورد" },
    { id: "date", label: "التاريخ" },
    { id: "totalAmount", label: "إجمالي الفاتورة" },
    { id: "purchaseExpenseAmount", label: "مصاريف الشحن والتوريد" },
    { id: "paidAmount", label: "المسدد للمورد" },
    { id: "remainingAmount", label: "المتبقي (الذمة)" },
    { id: "paymentMethod", label: "وسيلة الدفع" },
    { id: "status", label: "الحالة" },
    { id: "actions", label: "إجراءات", locked: true },
  ];
  const { visibleColumns: purVis, updateVisibility: updatePurVis, isVisible: isPurVis } = useColumnVisibility("purchases_and_returns_list", PURCHASES_COLUMNS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendorFilter, setSelectedVendorFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState("ALL");
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [selectedPurchaseDetails, setSelectedPurchaseDetails] = useState<Invoice | null>(null);
  const [showQuickAddVendor, setShowQuickAddVendor] = useState(false);
  const [showQuickAddItem, setShowQuickAddItem] = useState(false);
  const [activeRowForItemAdd, setActiveRowForItemAdd] = useState<string | null>(null);

  // Prepare Options for Searchable Selects
  const vendorOptions: ComboboxOption[] = useMemo(() => {
    return vendors.map(v => ({
      id: v.id,
      label: v.nameAr,
      secondaryLabel: v.phone
    }));
  }, [vendors]);

  const inventoryOptions: ComboboxOption[] = useMemo(() => {
    return inventoryItems.map(inv => ({
      id: inv.id,
      label: inv.nameAr,
      secondaryLabel: `${inv.code} | تكلفة: ${inv.costPrice.toLocaleString()}`
    }));
  }, [inventoryItems]);

  // New Purchase Form State
  const [purType, setPurType] = useState<"PURCHASE" | "PURCHASE_RETURN">("PURCHASE");
  const [purVendorId, setPurVendorId] = useState(vendors[0]?.id || "");
  const [purOriginalNumber, setPurOriginalNumber] = useState("");
  const [purReturnReason, setPurReturnReason] = useState("عدم مطابقة للمواصفات / تالف أثناء الشحن");
  const [purDate, setPurDate] = useState(new Date().toISOString().split("T")[0]);
  const [purDueDate, setPurDueDate] = useState(
    new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [purCurrency, setPurCurrency] = useState<CurrencyCode>("USD");
  const [purTaxRate, setPurTaxRate] = useState<number>(0);
  const [purDiscount, setPurDiscount] = useState<number>(0);
  const [purPurchaseExpense, setPurPurchaseExpense] = useState<number>(0); // مصاريف الشحن والاستيراد
  const [purPaymentMethod, setPurPaymentMethod] = useState<InvoicePaymentMethod>("BANK_TRANSFER");
  const [purWalletName, setPurWalletName] = useState("محفظة جوالي");
  const [purWalletNumber, setPurWalletNumber] = useState("");
  const [purWalletEmail, setPurWalletEmail] = useState("");
  const [purPaidAmount, setPurPaidAmount] = useState<number>(0);
  const [purPaymentAccountId, setPurPaymentAccountId] = useState<string>(
    bankAccounts[0]?.glAccountId || "110201"
  );
  const [purNotes, setPurNotes] = useState("");
  const [purTerms, setPurTerms] = useState("اعتماد سداد بعد الفحص والاستلام بالمستودع");
  const [purAttachments, setPurAttachments] = useState<string[]>([]);

  // OCR Camera & Processing States
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrSuccess, setOcrSuccess] = useState<string | null>(null);
  const [showOcrPanel, setShowOcrPanel] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setOcrError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      setCameraStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setOcrError("تعذر الوصول إلى الكاميرا. يرجى التحقق من الصلاحيات أو رفع ملف صورة بدلاً من ذلك.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const captureAndScan = async () => {
    if (!videoRef.current) return;
    try {
      setIsOcrScanning(true);
      setOcrError(null);
      setOcrSuccess(null);

      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        stopCamera();
        await processOcrImage(dataUrl, "image/jpeg");
      }
    } catch (err: any) {
      console.error("Capture error:", err);
      setOcrError("فشل التقاط الصورة من الكاميرا: " + err.message);
      setIsOcrScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrScanning(true);
    setOcrError(null);
    setOcrSuccess(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      await processOcrImage(dataUrl, file.type);
    };
    reader.onerror = () => {
      setOcrError("فشل قراءة الملف المرفوع.");
      setIsOcrScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const processOcrImage = async (imageBase64: string, mimeType: string) => {
    try {
      const res = await fetch("/api/gemini/parse-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType })
      });

      if (!res.ok) {
        throw new Error("فشل الخادم في معالجة الفاتورة.");
      }

      const data = await res.json();
      if (data.success && data.invoice) {
        const inv = data.invoice;
        
        // Populate the form fields with extracted data
        if (inv.invoiceNumber) setPurOriginalNumber(inv.invoiceNumber);
        if (inv.date) setPurDate(inv.date);
        if (inv.dueDate) setPurDueDate(inv.dueDate);
        if (inv.taxRate !== undefined) setPurTaxRate(inv.taxRate);
        if (inv.discount !== undefined) setPurDiscount(inv.discount);
        
        // Try to match the vendor from vendors array
        if (inv.vendorName) {
          const matchedVendor = vendors.find(v => 
            v.name.toLowerCase().includes(inv.vendorName.toLowerCase()) || 
            inv.vendorName.toLowerCase().includes(v.name.toLowerCase())
          );
          if (matchedVendor) {
            setPurVendorId(matchedVendor.id);
            setOcrSuccess(`تم التعرف على الفاتورة بنجاح ومطابقة المورد: ${matchedVendor.name}`);
          } else {
            setOcrSuccess(`تم التعرف على الفاتورة بنجاح. المورد المستخرج: "${inv.vendorName}" (يرجى مراجعته وتأكيده).`);
          }
        } else {
          setOcrSuccess("تم استخراج بيانات الفاتورة بنجاح تلقائياً!");
        }

        if (inv.currency) {
          const matchedCurrency = currencies.find(c => c.code === inv.currency);
          if (matchedCurrency) {
            setPurCurrency(matchedCurrency.code);
          }
        }

        if (inv.notes) {
          setPurNotes(prev => prev ? `${prev}\n[OCR]: ${inv.notes}` : `[OCR]: ${inv.notes}`);
        }

        // Map and set items
        if (Array.isArray(inv.items) && inv.items.length > 0) {
          const mappedItems = inv.items.map((item: any, index: number) => ({
            id: `item-ocr-${Date.now()}-${index}`,
            description: item.description || "صنف مستورد تلقائياً عبر OCR",
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            taxPercent: Number(item.taxPercent) || inv.taxRate || 0,
            discount: Number(item.discount) || 0,
            total: Number(item.total) || ((Number(item.quantity) || 1) * (Number(item.unitPrice) || 0))
          }));
          setPurItems(mappedItems);
        }
        
        // Hide panel on success so they see the populated form
        setShowOcrPanel(false);
      } else {
        throw new Error("تنسيق استجابة غير صالح من الذكاء المالي المتقدم.");
      }
    } catch (err: any) {
      console.error("OCR API error:", err);
      setOcrError("فشل استخراج البيانات بالذكاء المالي المتقدم: " + (err.message || "خطأ غير معروف"));
    } finally {
      setIsOcrScanning(false);
    }
  };

  // Items in form
  const [purItems, setPurItems] = useState<InvoiceItem[]>([
    {
      id: "item-p1",
      description: "توريد بضائع ومعدات من المورد",
      quantity: 1,
      unitPrice: 1500,
      taxPercent: 0,
      discount: 0,
      total: 1500,
    },
  ]);

  // Calculations
  const purSubtotal = purItems.reduce((sum, item) => sum + item.total, 0);
  const purTaxAmount = (purSubtotal * (purTaxRate || 0)) / 100;
  const rawGrandTotal = purSubtotal + purTaxAmount - (purDiscount || 0) + (Number(purPurchaseExpense) || 0);
  const purGrandTotal = Math.max(0, rawGrandTotal);
  const purRemainingAmount = Math.max(0, purGrandTotal - (Number(purPaidAmount) || 0));

  const handleSetPaidQuick = (type: "FULL" | "ZERO" | "HALF") => {
    if (type === "FULL") setPurPaidAmount(purGrandTotal);
    if (type === "ZERO") setPurPaidAmount(0);
    if (type === "HALF") setPurPaidAmount(Math.round(purGrandTotal / 2));
  };

  const handleOpenAddModal = (presetType: "PURCHASE" | "PURCHASE_RETURN" = "PURCHASE") => {
    setPurType(presetType);
    setPurItems([
      {
        id: `item-${Date.now()}`,
        description: presetType === "PURCHASE" ? "توريد بضائع ومواد للمخازن" : "إرجاع بضائع غير مطابقة للمورد",
        quantity: 1,
        unitPrice: 1500,
        taxPercent: 0,
        discount: 0,
        total: 1500,
      },
    ]);
    setPurPurchaseExpense(0);
    setPurDiscount(0);
    setPurTaxRate(0);
    setPurAttachments([]);
    setPurPaidAmount(presetType === "PURCHASE" ? 1500 : 0);
    setPurPaymentMethod(presetType === "PURCHASE" ? "BANK_TRANSFER" : "CREDIT");
    setShowAddPurchaseModal(true);
  };

  const handleCloseModal = () => {
    stopCamera();
    setShowOcrPanel(false);
    setOcrError(null);
    setOcrSuccess(null);
    setShowAddPurchaseModal(false);
  };

  const addPurchaseItem = () => {
    setPurItems((prev) => [
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

  const updatePurchaseItem = (id: string, field: keyof InvoiceItem, val: any) => {
    setPurItems((prev) =>
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

  const removePurchaseItem = (id: string) => {
    if (purItems.length <= 1) return;
    setPurItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Filter purchases & returns
  const purchasesAndReturns = invoices.filter(
    (inv) => inv.type === "PURCHASE" || inv.type === "PURCHASE_RETURN"
  );

  const filteredPurchases = purchasesAndReturns.filter((inv) => {
    if (activeTab === "PURCHASES" && inv.type !== "PURCHASE") return false;
    if (activeTab === "RETURNS" && inv.type !== "PURCHASE_RETURN") return false;
    if (activeTab === "EXPENSES" && (!inv.purchaseExpenseAmount || inv.purchaseExpenseAmount <= 0)) return false;

    if (selectedVendorFilter !== "ALL" && inv.vendorId !== selectedVendorFilter && inv.partyId !== selectedVendorFilter) {
      return false;
    }

    if (selectedStatusFilter !== "ALL" && inv.status !== selectedStatusFilter) {
      return false;
    }

    if (selectedPaymentFilter !== "ALL" && inv.paymentMethod !== selectedPaymentFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const numMatch = inv.invoiceNumber?.toLowerCase().includes(q);
      const nameMatch = (inv.vendorName || inv.partyName || "").toLowerCase().includes(q);
      const notesMatch = (inv.notes || "").toLowerCase().includes(q);
      return numMatch || nameMatch || notesMatch;
    }

    return true;
  });

  // KPIs
  const totalGrossPurchases = purchasesAndReturns
    .filter((i) => i.type === "PURCHASE")
    .reduce((sum, i) => sum + (i.totalAmount || 0), 0);

  const totalPurchaseReturns = purchasesAndReturns
    .filter((i) => i.type === "PURCHASE_RETURN")
    .reduce((sum, i) => sum + (i.totalAmount || 0), 0);

  const totalNetPurchases = totalGrossPurchases - totalPurchaseReturns;

  const totalPaidToVendors = purchasesAndReturns.reduce((sum, i) => {
    const paid = i.paidAmount || (i.status === "PAID" ? i.totalAmount : 0);
    return sum + (i.type === "PURCHASE" ? paid : -paid);
  }, 0);

  const totalPayables = purchasesAndReturns.reduce((sum, i) => {
    const rem = i.remainingAmount !== undefined ? i.remainingAmount : (i.status === "PAID" ? 0 : i.totalAmount);
    return sum + (i.type === "PURCHASE" ? rem : 0);
  }, 0);

  const totalShippingExpenses = purchasesAndReturns.reduce((sum, i) => sum + (i.purchaseExpenseAmount || 0), 0);

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const ven = vendors.find((v) => v.id === purVendorId) || vendors[0];
    const prefix = purType === "PURCHASE" ? "BILL-PUR" : "RET-PUR";
    const nextNum = `${prefix}-${new Date().getFullYear()}-${(purchasesAndReturns.length + 1).toString().padStart(4, "0")}`;

    const paidVal = Number(purPaidAmount) || 0;
    const remainingVal = Math.max(0, purGrandTotal - paidVal);

    let calculatedStatus: Invoice["status"] = "PENDING";
    if (purType === "PURCHASE_RETURN") {
      calculatedStatus = "RETURNED";
    } else if (remainingVal === 0) {
      calculatedStatus = "PAID";
    } else if (paidVal > 0) {
      calculatedStatus = "PARTIALLY_PAID";
    }

    const newInvoice: Invoice = {
      id: `bill-${Date.now()}`,
      invoiceNumber: nextNum,
      type: purType,
      date: purDate,
      dueDate: purDueDate,
      partyId: ven?.id,
      partyName: ven?.nameAr || "مورد تجاري",
      vendorId: ven?.id,
      vendorName: ven?.nameAr || "مورد تجاري",
      currency: purCurrency,
      exchangeRate: currencies.find((c) => c.code === purCurrency)?.exchangeRateToUSD || 1,
      items: purItems,
      subtotal: purSubtotal,
      discountTotal: purDiscount,
      discountAmount: purDiscount,
      taxTotal: purTaxAmount,
      taxAmount: purTaxAmount,
      taxRate: purTaxRate,
      purchaseExpenseAmount: Number(purPurchaseExpense) || 0,
      grandTotal: purGrandTotal,
      totalAmount: purGrandTotal,
      paidAmount: paidVal,
      remainingAmount: remainingVal,
      paymentMethod: purPaymentMethod,
      walletName: purPaymentMethod.startsWith("WALLET") ? purWalletName : undefined,
      walletNumber: purPaymentMethod.startsWith("WALLET") ? purWalletNumber : undefined,
      walletEmail: purPaymentMethod.startsWith("WALLET") ? purWalletEmail : undefined,
      paymentAccountId: purPaymentAccountId,
      originalInvoiceNumber: purOriginalNumber || undefined,
      returnReason: purType === "PURCHASE_RETURN" ? purReturnReason : undefined,
      status: calculatedStatus,
      paymentTerms: purTerms,
      notes: purNotes,
      qrCodeData: generateZatcaQr(
        "مجموعة بن زياد التجارية المتحدة", 
        "300000000000003", 
        new Date().toISOString(), 
        purGrandTotal.toString(), 
        purTaxAmount.toString()
      ),
      attachments: purAttachments.length > 0 ? purAttachments : undefined,
    };

    onSaveInvoice(newInvoice);
    handleCloseModal();
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
      case "WALLET_OTHER":
        return { label: walletName || "محفظة إلكترونية", icon: Wallet, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" };
      case "BANK_TRANSFER":
        return { label: "حوالة مصرفية / بنك", icon: Building2, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30" };
      case "CHECK":
        return { label: "شيك بنكي", icon: CreditCard, color: "text-slate-300 bg-slate-700/50 border-slate-600" };
      case "CREDIT":
      default:
        return { label: "آجل (ذمم دائنة)", icon: Clock, color: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30 text-blue-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                إدارة المشتريات ومرتجع المشتريات
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/60 font-mono">
                  Purchases & AP Hub
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                فواتير الشراء والتوريد للمخازن، إشعارات مرتجع المشتريات المدينة، مصاريف الشحن والاستيراد، وسداد الموردين
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Main Action Button */}
          <button
            onClick={() => handleOpenAddModal("PURCHASE")}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/25 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ إنشاء فاتورة مشتريات أو مرتجع</span>
          </button>

          <button
            onClick={() => handleOpenAddModal("PURCHASE_RETURN")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-800/60 text-sm font-medium transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>تسجيل مرتجع مشتريات</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>إجمالي المشتريات</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-base lg:text-lg font-bold text-blue-400 font-mono">
            {formatMoney(totalGrossPurchases, displayCurrency, currencies)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {purchasesAndReturns.filter((i) => i.type === "PURCHASE").length} فاتورة شراء
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>مرتجع المشتريات</span>
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base lg:text-lg font-bold text-amber-400 font-mono">
            {formatMoney(totalPurchaseReturns, displayCurrency, currencies)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {purchasesAndReturns.filter((i) => i.type === "PURCHASE_RETURN").length} إشعار مدين
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>صافي المشتريات</span>
            <BadgeCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-base lg:text-lg font-bold text-teal-400 font-mono">
            {formatMoney(totalNetPurchases, displayCurrency, currencies)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">بعد استبعاد المردودات</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>المسدد للموردين</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base lg:text-lg font-bold text-emerald-400 font-mono">
            {formatMoney(totalPaidToVendors, displayCurrency, currencies)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">دفعات محولة للموردين</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>الذمم الدائنة المتبقية</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-base lg:text-lg font-bold text-rose-400 font-mono">
            {formatMoney(totalPayables, displayCurrency, currencies)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">مستحقات للموردين</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>مصاريف الشحن والاستيراد</span>
            <Package className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-base lg:text-lg font-bold text-purple-400 font-mono">
            {formatMoney(totalShippingExpenses, displayCurrency, currencies)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">تكاليف نقل وتخليص</div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "ALL"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              جميع العمليات ({purchasesAndReturns.length})
            </button>
            <button
              onClick={() => setActiveTab("PURCHASES")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "PURCHASES"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              فواتير المشتريات والتوريد ({purchasesAndReturns.filter((i) => i.type === "PURCHASE").length})
            </button>
            <button
              onClick={() => setActiveTab("RETURNS")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "RETURNS"
                  ? "bg-amber-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              مرتجع ومردودات المشتريات ({purchasesAndReturns.filter((i) => i.type === "PURCHASE_RETURN").length})
            </button>
            <button
              onClick={() => setActiveTab("EXPENSES")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "EXPENSES"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              مصاريف الشحن والتوريد ({purchasesAndReturns.filter((i) => (i.purchaseExpenseAmount || 0) > 0).length})
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <ColumnCustomizer
              tableKey="purchases_and_returns_list"
              columns={PURCHASES_COLUMNS}
              visibleColumns={purVis}
              onChange={updatePurVis}
            />
            <span className="text-xs text-slate-400">النتائج: {filteredPurchases.length}</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الفاتورة، اسم المورد، البيان..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={selectedVendorFilter}
            onChange={(e) => setSelectedVendorFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">جميع الموردين</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nameAr}
              </option>
            ))}
          </select>

          <select
            value={selectedPaymentFilter}
            onChange={(e) => setSelectedPaymentFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">جميع وسائل الدفع</option>
            <option value="BANK_TRANSFER">حوالة مصرفية / بنك</option>
            <option value="CASH">نقداً (الخزينة)</option>
            <option value="WALLET_JAWWALI">محفظة جوالي</option>
            <option value="WALLET_JEEB">محفظة جيب</option>
            <option value="WALLET_FLOUSAK">محفظة فلوسك</option>
            <option value="WALLET_ONECASH">محفظة ون كاش</option>
            <option value="CHECK">شيك بنكي</option>
            <option value="CREDIT">آجل / ذمم دائنة</option>
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="PAID">مسددة بالكامل (Paid)</option>
            <option value="PARTIALLY_PAID">مسددة جزئياً (Partial)</option>
            <option value="PENDING">مستحقة السداد (Pending)</option>
            <option value="RETURNED">مرتجع مرحل (Returned)</option>
          </select>
        </div>
      </div>

      {/* Mobile Card List (Mobile-First UI) */}
      <div className="block lg:hidden space-y-3">
        {filteredPurchases.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
            <Truck className="w-8 h-8 mx-auto mb-2 opacity-40" />
            لا توجد فواتير مشتريات أو مرتجعات مطابقة لمعايير البحث الحالية
          </div>
        ) : (
          filteredPurchases.map((inv) => {
            const isReturn = inv.type === "PURCHASE_RETURN";
            const pMethod = getPaymentMethodLabel(inv.paymentMethod, inv.walletName);
            const PMIcon = pMethod.icon;

            return (
              <div
                key={`mob-purch-${inv.id}`}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3 transition-all hover:border-slate-700"
              >
                {/* Card Header: Doc Number & Type Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-sm text-slate-100">
                      📦 {inv.invoiceNumber}
                    </span>
                    {inv.originalInvoiceNumber && (
                      <span className="text-[10px] text-slate-400 font-sans">
                        (أصل: {inv.originalInvoiceNumber})
                      </span>
                    )}
                  </div>

                  {isReturn ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 flex-shrink-0">
                      <RotateCcw className="w-3 h-3" />
                      مردود شراء
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800/60 flex-shrink-0">
                      <Truck className="w-3 h-3" />
                      فاتورة شراء
                    </span>
                  )}
                </div>

                {/* Card Body: Vendor, Date, Payment */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">المورد:</span>
                    <span className="font-bold text-slate-200 truncate max-w-[200px]">
                      {inv.vendorName || inv.partyName || "مورد نقدي"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">التاريخ:</span>
                    <span className="font-mono text-slate-300" title={formatDualDate(inv.date)}>
                      {formatDate(inv.date)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">طريقة السداد:</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${pMethod.color}`}
                    >
                      <PMIcon className="w-3 h-3" />
                      <span>{pMethod.label}</span>
                    </span>
                  </div>

                  {/* Amount and Status Row */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">إجمالي الفاتورة:</span>
                      <span
                        className={`text-base font-mono font-black ${
                          isReturn ? "text-amber-400" : "text-blue-400"
                        }`}
                      >
                        {isReturn ? "-" : "+"}
                        {formatMoney(inv.totalAmount, inv.currency, currencies)}
                      </span>
                    </div>

                    <div className="text-left">
                      {inv.status === "PAID" && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          ✅ مسددة بالكامل
                        </span>
                      )}
                      {inv.status === "PARTIALLY_PAID" && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                          ⏳ سداد جزئي
                        </span>
                      )}
                      {inv.status === "PENDING" && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                          ⏳ مستحقة السداد
                        </span>
                      )}
                      {inv.status === "RETURNED" && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-950 text-purple-400 border border-purple-800">
                          🔄 مرتجع مرحل
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Touch-Friendly Action Buttons */}
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPurchaseDetails(inv)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs active:scale-95 transition-all border border-slate-700/80 min-h-[44px]"
                  >
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>معاينة التفاصيل بالكامل</span>
                  </button>

                  <button
                    onClick={() => onPrintDocument("INVOICE", inv)}
                    className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/80 active:scale-95 transition-all flex-shrink-0"
                    title="طباعة الفاتورة"
                    aria-label="طباعة الفاتورة"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {onShareDocument && (
                    <button
                      onClick={() =>
                        onShareDocument({
                          type: "INVOICE",
                          data: inv,
                          recipientName: inv.vendorName,
                          recipientPhone: inv.vendorPhone,
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

      {/* Main Table (Only on Large Screens) */}
      <div className="hidden lg:block bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                {isPurVis("invoiceNumber") && <th className="p-3.5 font-semibold">رقم الفاتورة / المستند</th>}
                {isPurVis("type") && <th className="p-3.5 font-semibold">النوع</th>}
                {isPurVis("vendorName") && <th className="p-3.5 font-semibold">المورد</th>}
                {isPurVis("date") && <th className="p-3.5 font-semibold">التاريخ</th>}
                {isPurVis("totalAmount") && <th className="p-3.5 font-semibold text-left">إجمالي الفاتورة</th>}
                {isPurVis("purchaseExpenseAmount") && <th className="p-3.5 font-semibold text-left">مصاريف الشحن والتوريد</th>}
                {isPurVis("paidAmount") && <th className="p-3.5 font-semibold text-left">المسدد للمورد</th>}
                {isPurVis("remainingAmount") && <th className="p-3.5 font-semibold text-left">المتبقي (الذمة)</th>}
                {isPurVis("paymentMethod") && <th className="p-3.5 font-semibold">وسيلة الدفع</th>}
                {isPurVis("status") && <th className="p-3.5 font-semibold">الحالة</th>}
                {isPurVis("actions") && <th className="p-3.5 font-semibold text-center">إجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={PURCHASES_COLUMNS.filter((c) => isPurVis(c.id)).length} className="p-8 text-center text-slate-500">
                    <Truck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    لا توجد فواتير مشتريات أو مرتجعات مطابقة لمعايير البحث الحالية
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((inv) => {
                  const isReturn = inv.type === "PURCHASE_RETURN";
                  const pMethod = getPaymentMethodLabel(inv.paymentMethod, inv.walletName);
                  const PMIcon = pMethod.icon;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      {isPurVis("invoiceNumber") && (
                        <td className="p-3.5 font-mono font-bold text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <span>{inv.invoiceNumber}</span>
                            {inv.originalInvoiceNumber && (
                              <span className="text-[10px] text-slate-400 font-sans">
                                (أصل: {inv.originalInvoiceNumber})
                              </span>
                            )}
                          </div>
                        </td>
                      )}

                      {isPurVis("type") && (
                        <td className="p-3.5">
                          {isReturn ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                              <RotateCcw className="w-3 h-3" />
                              مرتجع مشتريات
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800/60">
                              <Truck className="w-3 h-3" />
                              فاتورة مشتريات
                            </span>
                          )}
                        </td>
                      )}

                      {isPurVis("vendorName") && (
                        <td className="p-3.5 font-medium text-slate-200">
                          {inv.vendorName || inv.partyName || "مورد عام"}
                        </td>
                      )}

                      {isPurVis("date") && (
                        <td className="p-3.5 text-slate-400 font-mono" title={formatDualDate(inv.date)}>
                          {formatDate(inv.date)}
                        </td>
                      )}

                      {isPurVis("totalAmount") && (
                        <td className="p-3.5 text-left font-mono font-bold">
                          <span className={isReturn ? "text-amber-400" : "text-blue-400"}>
                            {isReturn ? "-" : "+"}
                            {formatMoney(inv.totalAmount, inv.currency, currencies)}
                          </span>
                        </td>
                      )}

                      {isPurVis("purchaseExpenseAmount") && (
                        <td className="p-3.5 text-left font-mono">
                          {(inv.purchaseExpenseAmount || 0) > 0 ? (
                            <span className="text-purple-400 font-medium">
                              {formatMoney(inv.purchaseExpenseAmount || 0, inv.currency, currencies)}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                      )}

                      {isPurVis("paidAmount") && (
                        <td className="p-3.5 text-left font-mono text-emerald-400">
                          {formatMoney(inv.paidAmount || (inv.status === "PAID" ? inv.totalAmount : 0), inv.currency, currencies)}
                        </td>
                      )}

                      {isPurVis("remainingAmount") && (
                        <td className="p-3.5 text-left font-mono">
                          {(inv.remainingAmount || 0) > 0 ? (
                            <span className="text-rose-400 font-bold">
                              {formatMoney(inv.remainingAmount || 0, inv.currency, currencies)}
                            </span>
                          ) : (
                            <span className="text-slate-500">0.00</span>
                          )}
                        </td>
                      )}

                      {isPurVis("paymentMethod") && (
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium border ${pMethod.color}`}
                          >
                            <PMIcon className="w-3 h-3" />
                            <span>{pMethod.label}</span>
                          </span>
                        </td>
                      )}

                      {isPurVis("status") && (
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
                              مستحقة السداد
                            </span>
                          )}
                          {inv.status === "RETURNED" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-950 text-purple-400 border border-purple-800">
                              مرتجع مرحل
                            </span>
                          )}
                        </td>
                      )}

                      {isPurVis("actions") && (
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {onShareDocument && (
                              <button
                                onClick={() =>
                                  onShareDocument({
                                    type: "INVOICE",
                                    data: inv,
                                    recipientName: inv.vendorName,
                                    recipientPhone: inv.vendorPhone,
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
                              onClick={() => setSelectedPurchaseDetails(inv)}
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

      {/* CREATE PURCHASE / RETURN MODAL */}
      {showAddPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl p-6 my-8 text-right animate-in zoom-in-95 space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {purType === "PURCHASE" ? (
                    <>
                      <Truck className="w-5 h-5 text-blue-400" />
                      <span>تسجيل فاتورة مشتريات وتوريد جديدة</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-5 h-5 text-amber-400" />
                      <span>تسجيل مرتجع مشتريات (إشعار مدين للمورد)</span>
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  إدخال بضائع المورد، مصاريف الشحن والتخليص والاستيراد، وتحديد وسيلة السداد (بنك / نقد / محافظ)
                </p>
              </div>

              <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPurType("PURCHASE")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    purType === "PURCHASE"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  فاتورة مشتريات
                </button>
                <button
                  type="button"
                  onClick={() => setPurType("PURCHASE_RETURN")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    purType === "PURCHASE_RETURN"
                      ? "bg-amber-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  مرتجع مشتريات
                </button>
              </div>
            </div>

            {/* القارئ الآلي للفواتير بالذكاء المالي المتقدم (OCR) */}
            <div className="bg-[#1A6B3C]/10 border border-[#1A6B3C]/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-right">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#1A6B3C]/20 rounded-xl text-[#1A6B3C]">
                  <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">القارئ الآلي للفواتير بالذكاء المالي المتقدم (OCR)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    التقط صورة للفاتورة الورقية عبر الكاميرا أو ارفعها مباشرة ليقوم الذكاء المالي المتقدم باستخراج البنود وتعبئة البيانات في ثوانٍ.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowOcrPanel(!showOcrPanel);
                  if (showOcrPanel) {
                    stopCamera();
                  } else {
                    setOcrError(null);
                    setOcrSuccess(null);
                  }
                }}
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-900 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer self-stretch md:self-auto justify-center"
              >
                <Scan className="w-4 h-4 animate-pulse" />
                <span>{showOcrPanel ? "إغلاق نافذة المسح" : "مسح الفاتورة بالكاميرا الذكية"}</span>
              </button>
            </div>

            {showOcrPanel && (
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 space-y-4 animate-in slide-in-from-top duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Camera Section */}
                  <div className="border border-slate-850 rounded-xl p-3 bg-slate-900/50 flex flex-col items-center justify-center min-h-[220px] text-center space-y-3 relative overflow-hidden">
                    {isCameraActive ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                        <div className="absolute inset-0 border-2 border-dashed border-[#D4AF37]/60 pointer-events-none animate-pulse flex items-center justify-center">
                          <div className="w-32 h-32 border-2 border-[#D4AF37] rounded-xl opacity-30 animate-ping"></div>
                        </div>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={captureAndScan}
                            disabled={isOcrScanning}
                            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-900 font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-all"
                          >
                            {isOcrScanning ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Camera className="w-4 h-4" />
                            )}
                            <span>التقاط ومعالجة</span>
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-all"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 space-y-3">
                        <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
                          <Camera className="w-6 h-6" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white">التقاط عبر الكاميرا</h5>
                          <p className="text-[11px] text-slate-400 mt-0.5">استخدم الكاميرا الخلفية لمسح الفاتورة الورقية مباشرة</p>
                        </div>
                        <button
                          type="button"
                          onClick={startCamera}
                          disabled={isOcrScanning}
                          className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 hover:border-blue-500/50 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>تفعيل الكاميرا</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* File Upload Section */}
                  <div className="border border-slate-850 rounded-xl p-3 bg-slate-900/50 flex flex-col items-center justify-center min-h-[220px] text-center space-y-3">
                    <div className="p-3 bg-[#D4AF37]/10 rounded-full text-[#D4AF37]">
                      <UploadCloud className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">رفع ملف صورة</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">رفع صورة الفاتورة المخزنة مسبقاً على جهازك</p>
                    </div>
                    <label className="px-3.5 py-1.5 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] border border-[#D4AF37]/30 hover:border-[#D4AF37]/50 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>اختار صورة الفاتورة</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isOcrScanning}
                        className="hidden"
                      />
                    </label>
                  </div>

                </div>

                {isOcrScanning && (
                  <div className="flex items-center justify-center gap-3 py-4 bg-slate-900/40 border border-slate-800 rounded-xl">
                    <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin" />
                    <span className="text-xs text-slate-300 font-medium animate-pulse">جاري إرسال الفاتورة للذكاء الاصطناعي واستخراج البيانات...</span>
                  </div>
                )}

                {ocrError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-right">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-300 font-medium">{ocrError}</p>
                  </div>
                )}

                {ocrSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 text-right animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-300 font-medium">{ocrSuccess}</p>
                  </div>
                )}
              </div>
            )}

            {ocrSuccess && !showOcrPanel && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 text-right animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-300 font-medium">{ocrSuccess}</p>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-5">
              {/* Vendor & Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-slate-400 font-medium">
                      المورد المعتمد / الداين *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddVendor(true)}
                      className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded-md border border-blue-500/30 transition-all"
                      title="إضافة مورد أو داين جديد لم يكن مسجلاً"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة داين/مورد</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Combobox
                      options={vendorOptions}
                      value={purVendorId}
                      onChange={(val) => setPurVendorId(val)}
                      placeholder="ابحث عن مورد..."
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setShowQuickAddVendor(true)}
                      className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center"
                      title="إضافة مورد أو داين جديد (+)"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">
                    تاريخ الفاتورة / التوريد *
                  </label>
                  <input
                    type="date"
                    value={purDate}
                    onChange={(e) => setPurDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">
                    تاريخ استحقاق السداد
                  </label>
                  <input
                    type="date"
                    value={purDueDate}
                    onChange={(e) => setPurDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Extra Return Details */}
              {purType === "PURCHASE_RETURN" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-amber-950/20 border border-amber-900/40">
                  <div>
                    <label className="block text-xs text-amber-300 mb-1 font-medium">
                      رقم فاتورة المشتريات الأصلية
                    </label>
                    <input
                      type="text"
                      value={purOriginalNumber}
                      onChange={(e) => setPurOriginalNumber(e.target.value)}
                      placeholder="مثال: BILL-PUR-2026-0001"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-amber-300 mb-1 font-medium">
                      سبب الإرجاع للمورد
                    </label>
                    <input
                      type="text"
                      value={purReturnReason}
                      onChange={(e) => setPurReturnReason(e.target.value)}
                      placeholder="مثال: غير مطابق للمواصفات الفنية..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Currency & Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">
                    عملة فاتورة المشتريات
                  </label>
                  <select
                    value={purCurrency}
                    onChange={(e) => setPurCurrency(e.target.value as CurrencyCode)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
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
                    شروط واستحقاق الفاتورة
                  </label>
                  <input
                    type="text"
                    value={purTerms}
                    onChange={(e) => setPurTerms(e.target.value)}
                    placeholder="مثال: اعتماد سداد بعد الفحص والاستلام..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>بنود المشتريات والمواد الموردة ({purItems.length})</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveRowForItemAdd(null);
                        setShowQuickAddItem(true);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 bg-blue-950/50 hover:bg-blue-900/60 px-2.5 py-1 rounded-lg border border-blue-800/40 transition-colors"
                      title="إضافة صنف جديد للمخزون"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة صنف للمخزن (+)</span>
                    </button>
                    <button
                      type="button"
                      onClick={addPurchaseItem}
                      className="text-xs text-slate-300 hover:text-white font-semibold flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      سطر مشتريات
                    </button>
                  </div>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <th className="p-2.5">بيان الصنف / المادة</th>
                        <th className="p-2.5 w-24">الكمية</th>
                        <th className="p-2.5 w-32">سعر التوريد</th>
                        <th className="p-2.5 w-32 text-left">الإجمالي</th>
                        <th className="p-2.5 w-12 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                      {purItems.map((item) => (
                        <tr key={item.id}>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              {inventoryItems && inventoryItems.length > 0 && (
                                <Combobox
                                  options={inventoryOptions}
                                  value={item.inventoryItemId || ""}
                                  onChange={(val) => {
                                    const matchedItem = inventoryItems.find((i) => i.id === val);
                                    updatePurchaseItem(item.id, "inventoryItemId", val || undefined);
                                    if (matchedItem) {
                                      updatePurchaseItem(item.id, "description", matchedItem.nameAr);
                                      updatePurchaseItem(item.id, "unitPrice", matchedItem.purchasePrice || matchedItem.costPrice || 0);
                                    }
                                  }}
                                  placeholder="ابحث عن صنف..."
                                  className="w-1/3 min-w-[200px]"
                                />
                              )}
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updatePurchaseItem(item.id, "description", e.target.value)}
                                placeholder="اسم الصنف أو المواد المشتراة..."
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveRowForItemAdd(item.id);
                                  setShowQuickAddItem(true);
                                }}
                                className="p-1.5 bg-blue-950/60 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-800/50 rounded-lg text-xs transition-all shrink-0"
                                title="إضافة صنف جديد للمخزون (+)"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {/* Selected Item Price & Cost Info Banner */}
                            {(() => {
                              const selInv = inventoryItems.find((inv) => inv.id === item.inventoryItemId);
                              if (!selInv) return null;
                              const lastSale = selInv.lastSellingPrice || selInv.sellingPrice || 0;
                              const purchase = selInv.purchasePrice || selInv.costPrice || 0;
                              const cost = selInv.costPrice || purchase || 0;
                              const sym = purCurrency === "SAR" ? "ر.س" : purCurrency === "USD" ? "$" : "ر.ي";

                              return (
                                <div className="mt-1.5 p-2 bg-slate-900/90 border border-blue-800/40 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                                  <div className="bg-slate-950 p-1.5 rounded">
                                    <span className="text-slate-400 block">الصنف:</span>
                                    <strong className="text-slate-200 truncate block">{selInv.nameAr}</strong>
                                  </div>
                                  <div className="bg-emerald-950/40 border border-emerald-800/40 p-1.5 rounded">
                                    <span className="text-emerald-400 block">آخر سعر بيع:</span>
                                    <strong className="text-emerald-300 font-mono block">{lastSale.toLocaleString()} {sym}</strong>
                                  </div>
                                  <div 
                                    onClick={() => updatePurchaseItem(item.id, "unitPrice", purchase)}
                                    className="bg-blue-950/40 border border-blue-800/40 p-1.5 rounded cursor-pointer hover:border-blue-400"
                                    title="انقر لتطبيق سعر الشراء المسجل"
                                  >
                                    <span className="text-blue-400 block">سعر الشراء المسجل:</span>
                                    <strong className="text-blue-300 font-mono block">{purchase.toLocaleString()} {sym}</strong>
                                  </div>
                                  <div className="bg-amber-950/40 border border-amber-800/40 p-1.5 rounded">
                                    <span className="text-amber-400 block">سعر التكلفة:</span>
                                    <strong className="text-amber-300 font-mono block">{cost.toLocaleString()} {sym}</strong>
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
                              onChange={(e) => updatePurchaseItem(item.id, "quantity", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono text-center focus:outline-none focus:border-blue-500"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.unitPrice}
                              onChange={(e) => updatePurchaseItem(item.id, "unitPrice", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 text-left"
                              required
                            />
                          </td>
                          <td className="p-2 text-left font-mono font-bold text-slate-200">
                            {formatNumberOnly(item.total)}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removePurchaseItem(item.id)}
                              disabled={purItems.length <= 1}
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

              {/* Purchase Expenses, Taxes, Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 block border-b border-slate-800 pb-1.5">
                    مصاريف الشحن والاستيراد
                  </span>

                  {/* Purchase Expense / Shipping field */}
                  <div>
                    <label className="block text-xs text-purple-300 mb-1 font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-purple-400" />
                        <span>مصاريف الشحن والتخليص الجمركي والتوريد</span>
                      </span>
                      <span className="text-[10px] text-slate-400">تضاف لتكلفة الشراء</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={purPurchaseExpense}
                      onChange={(e) => setPurPurchaseExpense(Number(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full bg-slate-900 border border-purple-900/50 rounded-xl px-3 py-2 text-xs text-purple-200 font-mono focus:outline-none focus:border-purple-500 text-left"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">الخصم التجاري المكتسب</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={purDiscount}
                        onChange={(e) => setPurDiscount(Number(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono text-left"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">الضريبة والرسوم %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={purTaxRate}
                        onChange={(e) => setPurTaxRate(Number(e.target.value) || 0)}
                        placeholder="0 %"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono text-left"
                      />
                    </div>
                  </div>
                </div>

                {/* Summary Totals */}
                <div className="space-y-2 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>مجموع الأصناف الموردة:</span>
                    <span className="font-mono">{formatNumberOnly(purSubtotal)}</span>
                  </div>
                  {purTaxAmount > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>الضريبة والرسوم:</span>
                      <span className="font-mono text-blue-400">+{formatNumberOnly(purTaxAmount)}</span>
                    </div>
                  )}
                  {purDiscount > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>الخصم المكتسب:</span>
                      <span className="font-mono text-rose-400">-{formatNumberOnly(purDiscount)}</span>
                    </div>
                  )}
                  {purPurchaseExpense > 0 && (
                    <div className="flex justify-between text-purple-300 font-medium">
                      <span>مصاريف الشحن والتوريد:</span>
                      <span className="font-mono">+{formatNumberOnly(purPurchaseExpense)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                    <span>إجمالي استحقاق الفاتورة:</span>
                    <span className="font-mono text-blue-400">
                      {formatMoney(purGrandTotal, purCurrency, currencies)}
                    </span>
                  </div>
                </div>
              </div>

              {/* PAYMENT METHODS & SETTLEMENT */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    <span>طريقة سداد المورد والحساب المنفذ (Payment Method)</span>
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleSetPaidQuick("FULL")}
                      className="text-[10px] px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded hover:bg-blue-900"
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

                {/* Method Pills */}
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-medium">
                    اختر وسيلة الدفع أو التحويل:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Bank Transfer */}
                    <button
                      type="button"
                      onClick={() => {
                        setPurPaymentMethod("BANK_TRANSFER");
                        setPurPaymentAccountId(bankAccounts[0]?.glAccountId || "110201");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        purPaymentMethod === "BANK_TRANSFER"
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      <span>حوالة مصرفية / بنك</span>
                    </button>

                    {/* Cash */}
                    <button
                      type="button"
                      onClick={() => {
                        setPurPaymentMethod("CASH");
                        setPurPaymentAccountId(cashVaults[0]?.glAccountId || "110101");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        purPaymentMethod === "CASH"
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
                        setPurPaymentMethod("WALLET_JAWWALI");
                        setPurWalletName("محفظة جوالي");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        purPaymentMethod === "WALLET_JAWWALI"
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
                        setPurPaymentMethod("WALLET_JEEB");
                        setPurWalletName("محفظة جيب");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        purPaymentMethod === "WALLET_JEEB"
                          ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-blue-400" />
                      <span>محفظة جيب</span>
                    </button>

                    {/* Flousak */}
                    <button
                      type="button"
                      onClick={() => {
                        setPurPaymentMethod("WALLET_FLOUSAK");
                        setPurWalletName("محفظة فلوسك");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        purPaymentMethod === "WALLET_FLOUSAK"
                          ? "bg-teal-600/20 border-teal-500 text-teal-300"
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
                        setPurPaymentMethod("WALLET_ONECASH");
                        setPurWalletName("محفظة ون كاش");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        purPaymentMethod === "WALLET_ONECASH"
                          ? "bg-cyan-600/20 border-cyan-500 text-cyan-300"
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
                        setPurPaymentMethod("WALLET_MFLOOS");
                        setPurWalletName("إم فلوس");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        purPaymentMethod === "WALLET_MFLOOS"
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
                        setPurPaymentMethod("WALLET_PAYPAL");
                        setPurWalletName("PayPal");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        purPaymentMethod === "WALLET_PAYPAL"
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
                        setPurPaymentMethod("WALLET_APPLE_PAY");
                        setPurWalletName("Apple Pay");
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        purPaymentMethod === "WALLET_APPLE_PAY"
                          ? "bg-slate-100/20 border-slate-100 text-slate-100 shadow-md shadow-slate-100/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-slate-100" />
                      <span>Apple Pay</span>
                    </button>

                    {/* Check */}
                    <button
                      type="button"
                      onClick={() => setPurPaymentMethod("CHECK")}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        purPaymentMethod === "CHECK"
                          ? "bg-purple-600/20 border-purple-500 text-purple-300"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-purple-400" />
                      <span>شيك بنكي</span>
                    </button>

                    {/* Credit */}
                    <button
                      type="button"
                      onClick={() => {
                        setPurPaymentMethod("CREDIT");
                        setPurPaidAmount(0);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        purPaymentMethod === "CREDIT"
                          ? "bg-rose-600/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Clock className="w-4 h-4 text-rose-400" />
                      <span>آجل (ذمة المورد)</span>
                    </button>
                  </div>
                </div>

                {/* Amounts & Accounts */}
                {purPaymentMethod.startsWith("WALLET") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pb-2 border-b border-slate-800">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">رقم المحفظة / الهاتف</label>
                      <input
                        type="text"
                        value={purWalletNumber}
                        onChange={(e) => setPurWalletNumber(e.target.value)}
                        placeholder="رقم الهاتف أو المحفظة..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">البريد الإلكتروني (إن وجد)</label>
                      <input
                        type="email"
                        value={purWalletEmail}
                        onChange={(e) => setPurWalletEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      حساب الصرف / البنك / الخزينة
                    </label>
                    <select
                      value={purPaymentAccountId}
                      onChange={(e) => setPurPaymentAccountId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <optgroup label="الحسابات البنكية">
                        {bankAccounts.map((b) => (
                          <option key={b.id} value={b.glAccountId}>
                            {b.bankName} - {b.accountNumber}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="الخزائن النقدية">
                        {cashVaults.map((v) => (
                          <option key={v.id} value={v.glAccountId}>
                            {v.name} ({v.currency})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-emerald-400 mb-1 font-medium">
                      المبلغ المسدد للمورد الآن *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={purPaidAmount}
                      onChange={(e) => setPurPaidAmount(Number(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-400 text-left"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-rose-400 mb-1 font-medium">
                      المبلغ المتبقي (ذمة للمورد)
                    </label>
                    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-rose-400 font-mono font-bold text-left flex items-center justify-between">
                      <span>{formatNumberOnly(purRemainingAmount)}</span>
                      <span className="text-[10px] text-slate-500 font-sans">
                        {purRemainingAmount === 0 ? "مسدد بالكامل" : "مستحق للمورد"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attachments & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">المرفقات والصور (اختياري)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files) {
                        const filesArray = Array.from(e.target.files).map(f => URL.createObjectURL(f as File));
                        setPurAttachments(prev => [...prev, ...filesArray]);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-900/50 file:text-blue-300 hover:file:bg-blue-900/70"
                  />
                  {purAttachments.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {purAttachments.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img src={url} alt="Attachment" className="w-12 h-12 object-cover rounded border border-slate-700" />
                          <button
                            type="button"
                            onClick={() => setPurAttachments(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">ملاحظات وبيان الفاتورة</label>
                  <textarea
                    rows={2}
                    value={purNotes}
                    onChange={(e) => setPurNotes(e.target.value)}
                    placeholder="ملاحظات حول الشحنة، سند الاستلام المخزني..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ وترحيل فاتورة المشتريات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedPurchaseDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 text-right animate-in zoom-in-95 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <span>تفاصيل فاتورة المشتريات: {selectedPurchaseDetails.invoiceNumber}</span>
              </h3>
              <button
                onClick={() => setSelectedPurchaseDetails(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500">المورد:</span>
                <div className="font-bold text-slate-200 mt-1">{selectedPurchaseDetails.vendorName}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500">تاريخ التوريد:</span>
                <div className="font-mono font-bold text-blue-400 mt-1">
                  {formatDate(selectedPurchaseDetails.date)}
                  <div className="text-[10px] text-slate-400 font-normal">
                    {formatDualDate(selectedPurchaseDetails.date)}
                  </div>
                </div>
              </div>
            </div>

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
                  {selectedPurchaseDetails.items?.map((item, idx) => (
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

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>مجموع المواد:</span>
                <span className="font-mono">{formatNumberOnly(selectedPurchaseDetails.subtotal)}</span>
              </div>
              {(selectedPurchaseDetails.purchaseExpenseAmount || 0) > 0 && (
                <div className="flex justify-between text-purple-300">
                  <span>مصاريف الشحن والاستيراد:</span>
                  <span className="font-mono">+{formatNumberOnly(selectedPurchaseDetails.purchaseExpenseAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-blue-400 font-bold pt-1 border-t border-slate-800">
                <span>الإجمالي الكلي:</span>
                <span className="font-mono">
                  {formatMoney(selectedPurchaseDetails.totalAmount, selectedPurchaseDetails.currency, currencies)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>المسدد للمورد:</span>
                <span className="font-mono">{formatNumberOnly(selectedPurchaseDetails.paidAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-rose-400 font-bold">
                <span>المتبقي ذمة للمورد:</span>
                <span className="font-mono">{formatNumberOnly(selectedPurchaseDetails.remainingAmount || 0)}</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              {onShareDocument && (
                <button
                  onClick={() => {
                    onShareDocument({
                      type: "INVOICE",
                      data: selectedPurchaseDetails,
                      recipientName: selectedPurchaseDetails.vendorName,
                      recipientPhone: selectedPurchaseDetails.vendorPhone,
                    });
                    setSelectedPurchaseDetails(null);
                  }}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </button>
              )}
              <button
                onClick={async () => {
                  await exportInvoiceToPdf("INVOICE", selectedPurchaseDetails, currencies);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <FileDown className="w-4 h-4" />
                تصدير كـ PDF
              </button>
              <button
                onClick={() => {
                  onPrintDocument("INVOICE", selectedPurchaseDetails);
                  setSelectedPurchaseDetails(null);
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                طباعة الفاتورة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Quick Add Vendor / Creditor */}
      <QuickAddVendorModal
        isOpen={showQuickAddVendor}
        onClose={() => setShowQuickAddVendor(false)}
        currencies={currencies}
        existingVendors={vendors}
        onVendorCreated={(newVendor) => {
          onAddVendor?.(newVendor);
          setPurVendorId(newVendor.id);
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
            updatePurchaseItem(activeRowForItemAdd, "description", newItem.nameAr);
            updatePurchaseItem(activeRowForItemAdd, "unitPrice", newItem.costPrice || 0);
            updatePurchaseItem(activeRowForItemAdd, "inventoryItemId", newItem.id);
          } else {
            // Append as new invoice line item
            setPurItems((prev) => [
              ...prev,
              {
                id: `item-${Date.now()}`,
                description: newItem.nameAr,
                quantity: 1,
                unitPrice: newItem.costPrice || 0,
                total: newItem.costPrice || 0,
                inventoryItemId: newItem.id,
                notes: newItem.code,
              },
            ]);
          }
          setActiveRowForItemAdd(null);
        }}
      />
    </div>
  );
};
