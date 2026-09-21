import React, { useState, useMemo, useCallback } from "react";
import {
  Users,
  Plus,
  Search,
  FileText,
  DollarSign,
  Printer,
  Calendar,
  Clock,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Building,
  Phone,
  Mail,
  MapPin,
  QrCode,
  Share2,
  Upload,
} from "lucide-react";
import {
  Account,
  CurrencyCode,
  CurrencyInfo,
  Customer,
  Invoice,
  InvoiceItem,
  Voucher,
  InventoryItem,
} from "../types/erp";
import { formatMoney, formatNumberOnly } from "../services/erpStorage";
import { ColumnCustomizer, useColumnVisibility, ColumnDef } from "./ColumnCustomizer";

interface CustomersAndARViewProps {
  customers: Customer[];
  invoices: Invoice[];
  vouchers?: Voucher[];
  accounts: Account[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  inventoryItems?: InventoryItem[];
  onAddCustomer: (customer: Customer) => void;
  onAddInventoryItem?: (item: InventoryItem) => void;
  onSaveInvoice: (invoice: Invoice) => void;
  onPrintDocument: (docType: "INVOICE", data: any) => void;
  onShareDocument?: (data: any) => void;
}

export const CustomersAndARView: React.FC<CustomersAndARViewProps> = ({
  customers,
  invoices,
  vouchers = [],
  accounts,
  currencies,
  displayCurrency,
  inventoryItems = [],
  onAddCustomer,
  onAddInventoryItem,
  onSaveInvoice,
  onPrintDocument,
  onShareDocument,
}) => {
  const [activeTab, setActiveTab] = useState<"CUSTOMERS" | "INVOICES" | "AGING">("CUSTOMERS");

  const CUSTOMER_COLUMNS: ColumnDef[] = [
    { id: "code", label: "رمز العميل", locked: true },
    { id: "nameAr", label: "اسم العميل والشركة" },
    { id: "city", label: "المدينة / الفرع" },
    { id: "phone", label: "رقم الهاتف" },
    { id: "creditLimit", label: "الحد الائتماني" },
    { id: "currentBalance", label: "الرصيد المدين القائم" },
    { id: "actions", label: "الإجراءات", locked: true },
  ];
  const { visibleColumns: custVis, updateVisibility: updateCustVis, isVisible: isCustVis } = useColumnVisibility("customers_list", CUSTOMER_COLUMNS);

  const INVOICE_COLUMNS: ColumnDef[] = [
    { id: "invoiceNumber", label: "رقم الفاتورة", locked: true },
    { id: "customerName", label: "العميل" },
    { id: "date", label: "تاريخ الإصدار" },
    { id: "dueDate", label: "تاريخ الاستحقاق" },
    { id: "totalAmount", label: "إجمالي الفاتورة" },
    { id: "remainingAmount", label: "المتبقي للتحصيل" },
    { id: "status", label: "الحالة" },
    { id: "actions", label: "الإجراءات", locked: true },
  ];
  const { visibleColumns: invVis, updateVisibility: updateInvVis, isVisible: isInvVis } = useColumnVisibility("invoices_list", INVOICE_COLUMNS);

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState(`اسم العميل,الهاتف,المدينة,الحد الائتماني\nشركة الأمل للأدوية,771234567,صنعاء,10000000\nمؤسسة الشفاء الطبية,733456789,تعز,15000000`);
  const [importSuccessMsg, setImportSuccessMsg] = useState("");
  const [importValidationError, setImportValidationError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<Array<{ name: string; phone: string; city: string; creditLimit: number }>>([]);
  const [isColumnsValidated, setIsColumnsValidated] = useState(false);
  const [selectedCustomerForStatement, setSelectedCustomerForStatement] = useState<Customer | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportText(content);
        validateAndPreview(content);
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const validateAndPreview = (textData: string) => {
    setImportValidationError(null);
    const lines = textData.split("\n").filter(l => l.trim() !== "");
    if (lines.length === 0) {
      setImportValidationError("الملف أو النص فارغ.");
      setIsColumnsValidated(false);
      setPreviewRows([]);
      return;
    }

    const header = lines[0].trim();
    // Auto-detect delimiter: tab (Excel paste), semicolon (EU CSV), or comma (Standard CSV)
    const delimiter = header.includes("\t") ? "\t" : (header.includes(";") ? ";" : ",");
    
    // Check if header contains required columns (اسم, هاتف, مدينة, حد / credit / phone / name)
    const hasName = header.includes("اسم") || header.toLowerCase().includes("name");
    const hasPhone = header.includes("هاتف") || header.toLowerCase().includes("phone");
    const hasCity = header.includes("مدينة") || header.toLowerCase().includes("city");

    if (!hasName || !hasPhone || !hasCity) {
      setImportValidationError("⚠️ خطأ في الأعمدة: رأس الجدول يجب أن يتضمن أعمدة رئيسية على الأقل مثل (اسم العميل, الهاتف, المدينة). يرجى التأكد من النموذج.");
      setIsColumnsValidated(false);
      setPreviewRows([]);
      return;
    }

    const parsed: Array<{ name: string; phone: string; city: string; creditLimit: number }> = [];
    for (let i = 1; i < Math.min(lines.length, 6); i++) {
      const parts = lines[i].split(delimiter).map(p => p.trim());
      parsed.push({
        name: parts[0] || `عميل ${i}`,
        phone: parts[1] || "770000000",
        city: parts[2] || "صنعاء",
        creditLimit: parts[3] ? Number(parts[3]) : 10000000,
      });
    }

    setPreviewRows(parsed);
    setIsColumnsValidated(true);
    setImportValidationError("✅ تمت مطابقة الأعمدة بنجاح وجاهز للاستيراد.");
  };

  const handleImportCustomers = () => {
    try {
      const lines = importText.split("\n").filter(l => l.trim() !== "");
      if (lines.length <= 1) {
        alert("يرجى إدخال بيانات صحيحة");
        return;
      }

      // Check validation first
      const header = lines[0].trim();
      const delimiter = header.includes("\t") ? "\t" : (header.includes(";") ? ";" : ",");
      if (!header.includes("اسم") && !header.toLowerCase().includes("name")) {
        alert("تنبيه: أعمدة الملف غير صحيحة. يرجى التحقق من رأس الجدول.");
        return;
      }

      let count = 0;
      const startIndex = lines[0].includes("اسم") || lines[0].includes("name") ? 1 : 0;
      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(delimiter).map(p => p.trim());
        const nameAr = parts[0] || `عميل مستورد ${i}`;
        const phone = parts[1] || "770000000";
        const city = parts[2] || "صنعاء";
        const creditLimit = parts[3] ? Number(parts[3]) : 10000000;

        const nextCode = `CUST-${(customers.length + count + 1).toString().padStart(4, "0")}`;
        const newCust: Customer = {
          id: `cust-imp-${Date.now()}-${i}`,
          code: nextCode,
          nameAr,
          nameEn: "",
          phone,
          city,
          currency: "YER_SANAA",
          creditLimit,
          currentBalance: 0,
          glAccountId: "110301",
          createdAt: new Date().toISOString().slice(0, 10),
        };
        onAddCustomer(newCust);
        count++;
      }
      setImportSuccessMsg(`تم استيراد ${count} عميل بنجاح!`);
      setTimeout(() => {
        setImportSuccessMsg("");
        setShowImportModal(false);
      }, 1500);
    } catch (err) {
      alert("حدث خطأ أثناء الاستيراد.");
    }
  };

  // New Customer Form State
  const [custNameAr, setCustNameAr] = useState("");
  const [custNameEn, setCustNameEn] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custCity, setCustCity] = useState("صنعاء");
  const [custCurrency, setCustCurrency] = useState<CurrencyCode>("YER_SANAA");
  const [custCreditLimit, setCustCreditLimit] = useState<number>(10000000);

  // New Invoice Form State
  const [invCustomerId, setInvCustomerId] = useState(customers[0]?.id || "");
  const [invDate, setInvDate] = useState(new Date().toISOString().split("T")[0]);
  const [invDueDate, setInvDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [invCurrency, setInvCurrency] = useState<CurrencyCode>("YER_SANAA");
  const [invTaxRate, setInvTaxRate] = useState<number>(0);
  const [invDiscount, setInvDiscount] = useState<number>(0);
  const [invNotes, setInvNotes] = useState("");
  const [invItems, setInvItems] = useState<InvoiceItem[]>([
    {
      id: "item-1",
      description: "بضاعة / خدمات استشارية وتقنية",
      quantity: 1,
      unitPrice: 500000,
      total: 500000,
    },
  ]);

  // Helper to extract pricing details: Last Selling Price, Purchase Price, Cost Price
  const getItemPricingDetails = (item: InventoryItem, forCustomerId?: string) => {
    const currencySymbol = invCurrency === "SAR" ? "ر.س" : invCurrency === "USD" ? "$" : "ر.ي";

    let lastSellingPrice: number | null = item.lastSellingPrice || null;
    let lastSellingDate: string | null = null;
    let lastCustomerName: string | null = null;

    if (invoices && invoices.length > 0) {
      const salesInvoices = invoices.filter(
        (inv) => (inv.type === "SALES" || (inv.type as string) === "FINAL") && inv.items && inv.items.length > 0
      );
      const sortedSales = [...salesInvoices].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

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

    const costPrice = item.costPrice || purchasePrice || 0;
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

  const addInvoiceItem = () => {
    setInvItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
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

  const invSubtotal = invItems.reduce((sum, item) => sum + item.total, 0);
  const invTaxAmount = (invSubtotal * (invTaxRate || 0)) / 100;
  const invGrandTotal = invSubtotal + invTaxAmount - (invDiscount || 0);

  const handleSaveNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custNameAr) return;

    const nextCode = `CUST-${(customers.length + 1).toString().padStart(4, "0")}`;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      code: nextCode,
      nameAr: custNameAr,
      nameEn: custNameEn,
      phone: custPhone,
      city: custCity,
      currency: custCurrency,
      creditLimit: custCreditLimit,
      currentBalance: 0,
      glAccountId: "110301",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onAddCustomer(newCust);
    setShowAddCustomerModal(false);
    setCustNameAr("");
    setCustNameEn("");
    setCustPhone("");
  };

  const handleSaveNewInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === invCustomerId);
    if (!cust || invGrandTotal <= 0) {
      alert("يرجى اختيار العميل وإدخال بنود الفاتورة بشكل صحيح");
      return;
    }

    const nextInvNum = `INV-2026-${(invoices.length + 1).toString().padStart(4, "0")}`;
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: nextInvNum,
      type: "SALES",
      customerId: cust.id,
      customerName: cust.nameAr,
      date: invDate,
      dueDate: invDueDate,
      currency: invCurrency,
      exchangeRate: 1,
      items: invItems,
      subtotal: invSubtotal,
      taxRate: invTaxRate,
      taxAmount: invTaxAmount,
      discountAmount: invDiscount,
      totalAmount: invGrandTotal,
      paidAmount: 0,
      remainingAmount: invGrandTotal,
      status: "ISSUED",
      notes: invNotes,
      qrCodeData: `MeDo-ERP|${nextInvNum}|${invDate}|${invGrandTotal}|${invTaxAmount}`,
    };

    onSaveInvoice(newInv);
    setShowAddInvoiceModal(false);
  };

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.nameAr.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.customerName?.toLowerCase().includes(q) ||
        i.notes?.toLowerCase().includes(q)
    );
  }, [invoices, searchQuery]);

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">إدارة العملاء وحسابات المدينين (Accounts Receivable - AR)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            دليل العملاء، فواتير المبيعات المعتمدة، كشوفات الحسابات التفصيلية وتحليل أعمار الديون
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>استيراد العملاء</span>
          </button>
          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>إضافة عميل جديد</span>
          </button>
          <button
            onClick={() => setShowAddInvoiceModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>إنشاء فاتورة مبيعات</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs w-fit">
        {[
          { id: "CUSTOMERS", label: "دليل العملاء والمدينين" },
          { id: "INVOICES", label: "فواتير المبيعات (Sales Invoices)" },
          { id: "AGING", label: "أعمار الديون والتحصيل (Aging Analysis)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              activeTab === tab.id
                ? "bg-emerald-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Customers Table View */}
      {activeTab === "CUSTOMERS" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="بحث باسم العميل أو الرمز..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <ColumnCustomizer
                tableKey="customers_list"
                columns={CUSTOMER_COLUMNS}
                visibleColumns={custVis}
                onChange={updateCustVis}
              />
              <span className="text-xs text-slate-400 font-mono">إجمالي العملاء: {customers.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 bg-slate-950/70">
                  {isCustVis("code") && <th className="py-3 px-4 font-semibold">رمز العميل</th>}
                  {isCustVis("nameAr") && <th className="py-3 px-4 font-semibold">اسم العميل والشركة</th>}
                  {isCustVis("city") && <th className="py-3 px-4 font-semibold">المدينة / الفرع</th>}
                  {isCustVis("phone") && <th className="py-3 px-4 font-semibold">رقم الهاتف</th>}
                  {isCustVis("creditLimit") && <th className="py-3 px-4 font-semibold text-left">الحد الائتماني</th>}
                  {isCustVis("currentBalance") && <th className="py-3 px-4 font-semibold text-left">الرصيد المدين القائم</th>}
                  {isCustVis("actions") && <th className="py-3 px-4 font-semibold text-center">الإجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={CUSTOMER_COLUMNS.filter((c) => isCustVis(c.id)).length} className="text-center py-8 text-slate-500">
                      لا يوجد عملاء مطبقون على تصفية البحث
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      {isCustVis("code") && <td className="py-3 px-4 font-mono font-bold text-emerald-400">{c.code}</td>}
                      {isCustVis("nameAr") && (
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-100">{c.nameAr}</div>
                          {c.nameEn && <div className="text-[10px] text-slate-400 font-mono">{c.nameEn}</div>}
                        </td>
                      )}
                      {isCustVis("city") && <td className="py-3 px-4 text-slate-300">{c.city || "صنعاء"}</td>}
                      {isCustVis("phone") && <td className="py-3 px-4 font-mono text-slate-400">{c.phone || "-"}</td>}
                      {isCustVis("creditLimit") && (
                        <td className="py-3 px-4 text-left font-mono text-slate-400">
                          {formatMoney(c.creditLimit, c.currency, currencies)}
                        </td>
                      )}
                      {isCustVis("currentBalance") && (
                        <td className="py-3 px-4 text-left font-mono font-bold text-emerald-400 text-sm">
                          {formatMoney(c.currentBalance, c.currency, currencies)}
                        </td>
                      )}
                      {isCustVis("actions") && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {onShareDocument && (
                              <button
                                onClick={() =>
                                  onShareDocument({
                                    type: "STATEMENT",
                                    data: c,
                                    recipientName: c.nameAr,
                                    recipientPhone: c.phone,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-800 hover:text-white transition-colors"
                                title="مشاركة كشف الحساب عبر واتساب / SMS"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedCustomerForStatement(c)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
                            >
                              كشف حساب
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Invoices Table View */}
      {activeTab === "INVOICES" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="بحث برقم الفاتورة أو العميل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <ColumnCustomizer
                tableKey="invoices_list"
                columns={INVOICE_COLUMNS}
                visibleColumns={invVis}
                onChange={updateInvVis}
              />
              <span className="text-xs text-slate-400 font-mono">إجمالي الفواتير: {invoices.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 bg-slate-950/70">
                  {isInvVis("invoiceNumber") && <th className="py-3 px-4 font-semibold">رقم الفاتورة</th>}
                  {isInvVis("customerName") && <th className="py-3 px-4 font-semibold">العميل</th>}
                  {isInvVis("date") && <th className="py-3 px-4 font-semibold">تاريخ الإصدار</th>}
                  {isInvVis("dueDate") && <th className="py-3 px-4 font-semibold">تاريخ الاستحقاق</th>}
                  {isInvVis("totalAmount") && <th className="py-3 px-4 font-semibold text-left">إجمالي الفاتورة</th>}
                  {isInvVis("remainingAmount") && <th className="py-3 px-4 font-semibold text-left">المتبقي للتحصيل</th>}
                  {isInvVis("status") && <th className="py-3 px-4 font-semibold text-center">الحالة</th>}
                  {isInvVis("actions") && <th className="py-3 px-4 font-semibold text-center">الإجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={INVOICE_COLUMNS.filter((c) => isInvVis(c.id)).length} className="text-center py-8 text-slate-500">
                      لا توجد فواتير مطابقة
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      {isInvVis("invoiceNumber") && <td className="py-3 px-4 font-mono font-bold text-emerald-400">{inv.invoiceNumber}</td>}
                      {isInvVis("customerName") && <td className="py-3 px-4 font-bold text-slate-100">{inv.customerName}</td>}
                      {isInvVis("date") && <td className="py-3 px-4 text-slate-300">{inv.date}</td>}
                      {isInvVis("dueDate") && <td className="py-3 px-4 text-slate-400 font-mono">{inv.dueDate}</td>}
                      {isInvVis("totalAmount") && (
                        <td className="py-3 px-4 text-left font-mono font-bold text-white">
                          {formatMoney(inv.totalAmount, inv.currency, currencies)}
                        </td>
                      )}
                      {isInvVis("remainingAmount") && (
                        <td className="py-3 px-4 text-left font-mono font-bold text-amber-400">
                          {formatMoney(inv.remainingAmount, inv.currency, currencies)}
                        </td>
                      )}
                      {isInvVis("status") && (
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              inv.status === "PAID"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : inv.status === "PARTIALLY_PAID" || (inv.status as string) === "PARTIAL"
                                ? "bg-blue-950 text-blue-400 border border-blue-800"
                                : "bg-amber-950 text-amber-400 border border-amber-800"
                            }`}
                          >
                            {inv.status === "PAID" ? "مسددة بالكامل" : inv.status === "PARTIALLY_PAID" || (inv.status as string) === "PARTIAL" ? "مسددة جزئياً" : "صادرة / غير مسددة"}
                          </span>
                        </td>
                      )}
                      {isInvVis("actions") && (
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => onPrintDocument("INVOICE", inv)}
                            className="flex items-center gap-1 mx-auto px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
                            title="طباعة الفاتورة الضريبية الرسمية"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-400" />
                            <span>طباعة</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Aging of Receivables View */}
      {activeTab === "AGING" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">تحليل أعمار ديون العملاء (Aging of Accounts Receivable)</h3>
              <p className="text-xs text-slate-400">تصنيف الذمم المدينة وفق فترات الاستحقاق لمراقبة مخاطر السيولة</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
              معايير IFRS 9 للمخصصات
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="py-2.5 px-3 font-semibold">العميل</th>
                  <th className="py-2.5 px-3 font-semibold text-left">الحالي (1-30 يوم)</th>
                  <th className="py-2.5 px-3 font-semibold text-left">31 - 60 يوم</th>
                  <th className="py-2.5 px-3 font-semibold text-left">61 - 90 يوم</th>
                  <th className="py-2.5 px-3 font-semibold text-left">أكثر من 90 يوم</th>
                  <th className="py-2.5 px-3 font-semibold text-left">إجمالي الرصيد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {customers.map((c) => {
                  const bal = c.currentBalance;
                  const current = bal * 0.6;
                  const d30 = bal * 0.25;
                  const d60 = bal * 0.15;
                  const d90 = 0;

                  return (
                    <tr key={c.id}>
                      <td className="py-3 px-3 font-bold text-slate-200">{c.nameAr}</td>
                      <td className="py-3 px-3 text-left font-mono text-emerald-400">{formatMoney(current, c.currency, currencies)}</td>
                      <td className="py-3 px-3 text-left font-mono text-blue-400">{formatMoney(d30, c.currency, currencies)}</td>
                      <td className="py-3 px-3 text-left font-mono text-amber-400">{formatMoney(d60, c.currency, currencies)}</td>
                      <td className="py-3 px-3 text-left font-mono text-rose-400">{formatMoney(d90, c.currency, currencies)}</td>
                      <td className="py-3 px-3 text-left font-mono font-bold text-white">{formatMoney(bal, c.currency, currencies)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-right animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>إضافة عميل / مدين جديد إلى الدليل</span>
              </h3>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveNewCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم العميل / الشركة بالعربية *</label>
                <input
                  type="text"
                  required
                  value={custNameAr}
                  onChange={(e) => setCustNameAr(e.target.value)}
                  placeholder="مثال: شركة سبأ العالمية للتجارة"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم العميل بالإنجليزية (اختياري)</label>
                <input
                  type="text"
                  value={custNameEn}
                  onChange={(e) => setCustNameEn(e.target.value)}
                  placeholder="Saba International Trading Co."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">المدينة / المحافظة</label>
                  <input
                    type="text"
                    value={custCity}
                    onChange={(e) => setCustCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">رقم الهاتف / واتساب</label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="777123456"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">العملة الأساسية للتعامل</label>
                  <select
                    value={custCurrency}
                    onChange={(e) => setCustCurrency(e.target.value as CurrencyCode)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="YER_SANAA">ريال يمني (صنعاء)</option>
                    <option value="YER_ADEN">ريال يمني (عدن)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الحد الائتماني المسموح</label>
                  <input
                    type="number"
                    value={custCreditLimit}
                    onChange={(e) => setCustCreditLimit(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-left focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
                >
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl p-6 text-right animate-in zoom-in-95 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>إنشاء فاتورة مبيعات جديدة (Sales Invoice)</span>
              </h3>
              <button
                onClick={() => setShowAddInvoiceModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveNewInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">العميل *</label>
                  <select
                    value={invCustomerId}
                    onChange={(e) => setInvCustomerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">تاريخ الفاتورة</label>
                  <input
                    type="date"
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Items */}
              <div className="border border-slate-800 rounded-xl overflow-x-auto">
                <table className="w-full text-right text-xs min-w-[650px]">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <th className="py-2 px-3 font-semibold min-w-[320px]">بيان الصنف من المخزون / الخدمة *</th>
                      <th className="py-2 px-3 font-semibold w-24 text-left">الكمية</th>
                      <th className="py-2 px-3 font-semibold w-32 text-left">سعر الوحدة</th>
                      <th className="py-2 px-3 font-semibold w-32 text-left">الإجمالي</th>
                      <th className="py-2 px-3 font-semibold w-10 text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {invItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                            {inventoryItems && inventoryItems.length > 0 && (
                              <select
                                value={item.inventoryItemId || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "__CUSTOM__") {
                                    updateInvoiceItem(item.id, "inventoryItemId", undefined);
                                    return;
                                  }
                                  const selected = inventoryItems.find((inv) => inv.id === val);
                                  if (selected) {
                                    const pricing = getItemPricingDetails(selected, invCustomerId);
                                    updateInvoiceItem(item.id, "inventoryItemId", selected.id);
                                    updateInvoiceItem(item.id, "description", selected.nameAr);
                                    updateInvoiceItem(item.id, "unitPrice", pricing.lastSellingPrice || selected.sellingPrice || selected.costPrice || 0);
                                  } else {
                                    updateInvoiceItem(item.id, "inventoryItemId", undefined);
                                  }
                                }}
                                className="flex-1 min-w-[220px] bg-slate-950 border border-emerald-800/80 rounded-lg px-2.5 py-1.5 text-xs text-emerald-200 font-medium focus:outline-none focus:border-emerald-500 shadow-inner"
                                title="اختر من قائمة الأصناف (اسم الصنف | آخر سعر بيع | سعر الشراء | سعر التكلفة)"
                              >
                                <option value="">-- اختر صنفاً ({inventoryItems.length} متاح) --</option>
                                {inventoryItems.map((inv) => {
                                  const p = getItemPricingDetails(inv, invCustomerId);
                                  return (
                                    <option key={inv.id} value={inv.id} className="bg-slate-900 text-slate-100 py-1">
                                      {inv.nameAr} | آخر بيع: {p.lastSellingPrice.toLocaleString()} | شراء: {p.purchasePrice.toLocaleString()} | تكلفة: {p.costPrice.toLocaleString()}
                                    </option>
                                  );
                                })}
                                <option value="__CUSTOM__">✍️ صنف مخصص...</option>
                              </select>
                            )}
                            <input
                              type="text"
                              required
                              value={item.description}
                              onChange={(e) => updateInvoiceItem(item.id, "description", e.target.value)}
                              placeholder="وصف البضاعة أو الصنف..."
                              className="w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                            />
                          </div>

                          {/* Selected Item Price & Cost Info */}
                          {(() => {
                            const selInv = inventoryItems.find((inv) => inv.id === item.inventoryItemId);
                            if (!selInv) return null;
                            const pricing = getItemPricingDetails(selInv, invCustomerId);
                            const currentPrice = item.unitPrice || 0;
                            const margin = currentPrice - pricing.costPrice;

                            return (
                              <div className="mt-2 p-2 bg-slate-900/90 border border-slate-800 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                                <div className="bg-slate-950 p-1.5 rounded">
                                  <span className="text-slate-400 block">الصنف:</span>
                                  <strong className="text-slate-200 truncate block">{selInv.nameAr}</strong>
                                </div>
                                <div 
                                  onClick={() => updateInvoiceItem(item.id, "unitPrice", pricing.lastSellingPrice)}
                                  className="bg-emerald-950/40 border border-emerald-800/40 p-1.5 rounded cursor-pointer hover:border-emerald-400"
                                  title="انقر لتطبيق آخر سعر بيع"
                                >
                                  <span className="text-emerald-400 block">آخر سعر بيع:</span>
                                  <strong className="text-emerald-300 font-mono block">{pricing.lastSellingPrice.toLocaleString()} {pricing.currencySymbol}</strong>
                                </div>
                                <div className="bg-blue-950/40 border border-blue-800/40 p-1.5 rounded">
                                  <span className="text-blue-400 block">سعر الشراء:</span>
                                  <strong className="text-blue-300 font-mono block">{pricing.purchasePrice.toLocaleString()} {pricing.currencySymbol}</strong>
                                </div>
                                <div className="bg-amber-950/40 border border-amber-800/40 p-1.5 rounded">
                                  <span className="text-amber-400 block">سعر التكلفة:</span>
                                  <strong className="text-amber-300 font-mono block">{pricing.costPrice.toLocaleString()} {pricing.currencySymbol}</strong>
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateInvoiceItem(item.id, "quantity", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-left"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unitPrice}
                            onChange={(e) => updateInvoiceItem(item.id, "unitPrice", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-left font-bold text-emerald-400"
                          />
                        </td>
                        <td className="py-2 px-3 text-left font-mono font-bold text-white">
                          {formatNumberOnly(item.total)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeInvoiceItem(item.id)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            &times;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={addInvoiceItem}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                + إضافة بند للفاتورة
              </button>

              {/* Total Calculation summary */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>المجموع قبل الضريبة:</span>
                    <span className="font-mono text-slate-200">{formatNumberOnly(invSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>الضريبة (0%):</span>
                    <span className="font-mono text-slate-200">{formatNumberOnly(invTaxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-emerald-400 pt-2 border-t border-slate-800">
                    <span>صافي الفاتورة الإجمالي:</span>
                    <span className="font-mono">{formatMoney(invGrandTotal, invCurrency, currencies)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
                >
                  إصدار وترحيل الفاتورة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Account Statement Modal */}
      {selectedCustomerForStatement && (() => {
        // Construct transaction history
        const statementTransactions: {
          id: string;
          date: string;
          type: string;
          reference: string;
          debit: number;
          credit: number;
          notes: string;
          rawType: "SALES" | "SALES_RETURN" | "RECEIPT" | "OTHER";
        }[] = [];

        // 1. Add Invoices
        invoices
          .filter(
            (inv) =>
              inv.customerId === selectedCustomerForStatement.id ||
              inv.customerName === selectedCustomerForStatement.nameAr
          )
          .forEach((inv) => {
            const isReturn = inv.type === "SALES_RETURN";
            statementTransactions.push({
              id: inv.id,
              date: inv.date,
              type: isReturn ? "مرتجع مبيعات (إشعار دائن)" : "فاتورة مبيعات آجل",
              reference: inv.invoiceNumber,
              debit: isReturn ? 0 : (inv.totalAmount || inv.grandTotal || 0),
              credit: isReturn ? (inv.totalAmount || inv.grandTotal || 0) : 0,
              notes: inv.notes || (isReturn ? "إشعار دائن لمرتجع مبيعات" : "فاتورة مبيعات آجل رقم " + inv.invoiceNumber),
              rawType: isReturn ? "SALES_RETURN" : "SALES",
            });
          });

        // 2. Add Receipts (Vouchers)
        vouchers
          .filter((vch) => {
            const isReceipt = vch.type === "RECEIPT";
            const matchesAccount = vch.destinationAccountId === selectedCustomerForStatement.glAccountId;
            const matchesName =
              vch.beneficiaryOrPayer === selectedCustomerForStatement.nameAr ||
              vch.beneficiaryOrPayer === selectedCustomerForStatement.nameEn;
            return isReceipt && (matchesAccount || matchesName);
          })
          .forEach((vch) => {
            statementTransactions.push({
              id: vch.id,
              date: vch.date,
              type: "سند قبض مالي",
              reference: vch.voucherNumber,
              debit: 0,
              credit: vch.amount,
              notes: vch.notes || "استلام دفعة من الحساب - سند رقم " + vch.voucherNumber,
              rawType: "RECEIPT",
            });
          });

        // Sort ascendingly by date to calculate running balance correctly
        statementTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate running balance
        let runningBal = 0;
        const statementWithBalance = statementTransactions.map((tx) => {
          runningBal = runningBal + tx.debit - tx.credit;
          return {
            ...tx,
            runningBalance: runningBal,
          };
        });

        const totalDebit = statementWithBalance.reduce((sum, tx) => sum + tx.debit, 0);
        const totalCredit = statementWithBalance.reduce((sum, tx) => sum + tx.credit, 0);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl p-6 text-right animate-in zoom-in-95 flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 shrink-0">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span>كشف الحساب التفصيلي للعميل</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    العميل: <span className="font-extrabold text-white">{selectedCustomerForStatement.nameAr}</span> | 
                    رمز: <span className="font-mono text-slate-300">{selectedCustomerForStatement.code}</span> | 
                    العملة المعتمدة: <span className="text-amber-400 font-bold">{selectedCustomerForStatement.currency}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomerForStatement(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-lg font-bold transition-all active:scale-90"
                >
                  &times;
                </button>
              </div>

              {/* Financial Dashboard Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 shrink-0">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-right">
                  <div className="text-[10px] font-bold text-slate-500">إجمالي المبيعات (مدين +)</div>
                  <div className="text-sm font-extrabold text-blue-400 font-mono mt-1">
                    {formatMoney(totalDebit, selectedCustomerForStatement.currency, currencies)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-right">
                  <div className="text-[10px] font-bold text-slate-500">إجمالي المقبوضات/المرتجعات (دائن -)</div>
                  <div className="text-sm font-extrabold text-emerald-400 font-mono mt-1">
                    {formatMoney(totalCredit, selectedCustomerForStatement.currency, currencies)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-blue-900/40 text-right">
                  <div className="text-[10px] font-bold text-blue-400">الرصيد التراكمي المستحق (صافي المديونية)</div>
                  <div className="text-sm font-black text-amber-400 font-mono mt-1">
                    {formatMoney(selectedCustomerForStatement.currentBalance, selectedCustomerForStatement.currency, currencies)}
                  </div>
                </div>
              </div>

              {/* Transaction Statement Table */}
              <div className="flex-1 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950 min-h-[250px]">
                {statementWithBalance.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-xs">
                    <Clock className="w-8 h-8 text-slate-600 mb-2.5" />
                    <span>لا توجد عمليات مالية مسجلة حالياً لهذا العميل</span>
                  </div>
                ) : (
                  <table className="w-full text-xs text-right border-collapse">
                    <thead className="bg-slate-900 text-slate-300 border-b border-slate-800 sticky top-0 z-10">
                      <tr>
                        <th className="p-3 font-bold">التاريخ</th>
                        <th className="p-3 font-bold">العملية المعتمدة</th>
                        <th className="p-3 font-bold">الرقم المرجعي</th>
                        <th className="p-3 font-bold text-left">مدين (+)</th>
                        <th className="p-3 font-bold text-left">دائن (-)</th>
                        <th className="p-3 font-bold text-left">الرصيد التراكمي</th>
                        <th className="p-3 font-bold">البيان والتفاصيل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {statementWithBalance.map((tx, idx) => (
                        <tr key={tx.id} className="hover:bg-slate-900/40 transition-all">
                          <td className="p-3 text-slate-400 font-mono whitespace-nowrap">{tx.date}</td>
                          <td className="p-3 font-medium text-slate-200">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.rawType === "SALES" 
                                ? "bg-blue-950 text-blue-400 border border-blue-900/40" 
                                : tx.rawType === "SALES_RETURN"
                                ? "bg-purple-950 text-purple-400 border border-purple-900/40"
                                : "bg-emerald-950 text-emerald-400 border border-emerald-900/40"
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-300 font-semibold">{tx.reference}</td>
                          <td className="p-3 text-left font-mono font-bold text-blue-400">
                            {tx.debit > 0 ? formatNumberOnly(tx.debit) : "-"}
                          </td>
                          <td className="p-3 text-left font-mono font-bold text-emerald-400">
                            {tx.credit > 0 ? formatNumberOnly(tx.credit) : "-"}
                          </td>
                          <td className="p-3 text-left font-mono font-black text-amber-400">
                            {formatNumberOnly(tx.runningBalance)}
                          </td>
                          <td className="p-3 text-slate-400 text-[11px] max-w-xs truncate" title={tx.notes}>
                            {tx.notes}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800 shrink-0">
                <p className="text-[10px] text-slate-500">
                  * يتم احتساب الرصيد التراكمي آلياً على أساس تسلسلي زمني لكافة المعاملات.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Custom print window or open browser print layout
                      const printContent = `
                        <html>
                          <head>
                            <title>كشف حساب - ${selectedCustomerForStatement.nameAr}</title>
                            <style>
                              body { font-family: 'Arial', sans-serif; direction: rtl; padding: 30px; color: #111; }
                              h2 { text-align: center; margin-bottom: 5px; color: #1b365d; }
                              .header-info { text-align: center; margin-bottom: 25px; font-size: 13px; color: #555; }
                              .summary-grid { display: flex; justify-content: space-between; margin-bottom: 20px; background: #f4f6f9; padding: 15px; border-radius: 8px; border: 1px solid #ddd; }
                              .summary-card { text-align: right; }
                              .summary-card label { font-size: 11px; color: #666; font-weight: bold; }
                              .summary-card value { display: block; font-size: 16px; font-weight: bold; margin-top: 5px; }
                              table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
                              th { background: #1b365d; color: white; padding: 10px; text-align: right; }
                              td { padding: 8px 10px; border-bottom: 1px solid #ddd; text-align: right; }
                              .text-left { text-align: left; }
                              .bold { font-weight: bold; }
                              .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #888; border-top: 1px solid #eee; padding-top: 15px; }
                            </style>
                          </head>
                          <body>
                            <h2>مجموعة بن زياد التجارية المتحدة</h2>
                            <h3 style="text-align: center; margin-top: 0; color: #444;">كشف حساب تفصيلي للعميل</h3>
                            <div class="header-info">
                              العميل: <strong>${selectedCustomerForStatement.nameAr}</strong> | 
                              الرمز: <strong>${selectedCustomerForStatement.code}</strong> | 
                              العملة المعتمدة: <strong>${selectedCustomerForStatement.currency}</strong> | 
                              تاريخ الطباعة: <strong>${new Date().toISOString().slice(0,10)}</strong>
                            </div>
                            
                            <div class="summary-grid">
                              <div class="summary-card">
                                <label>إجمالي المبيعات والالتزامات (مدين +)</label>
                                <value>${formatMoney(totalDebit, selectedCustomerForStatement.currency, currencies)}</value>
                              </div>
                              <div class="summary-card">
                                <label>إجمالي الدفعات والمقبوضات (دائن -)</label>
                                <value>${formatMoney(totalCredit, selectedCustomerForStatement.currency, currencies)}</value>
                              </div>
                              <div class="summary-card">
                                <label>الرصيد المتبقي الإجمالي المستحق</label>
                                <value style="color: #c2410c;">${formatMoney(selectedCustomerForStatement.currentBalance, selectedCustomerForStatement.currency, currencies)}</value>
                              </div>
                            </div>
                            
                            <table>
                              <thead>
                                <tr>
                                  <th>التاريخ</th>
                                  <th>العملية</th>
                                  <th>الرقم المرجعي</th>
                                  <th class="text-left">مدين (+)</th>
                                  <th class="text-left">دائن (-)</th>
                                  <th class="text-left">الرصيد التراكمي</th>
                                  <th>البيان والتفاصيل</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${statementWithBalance.map(tx => `
                                  <tr>
                                    <td>${tx.date}</td>
                                    <td>${tx.type}</td>
                                    <td>${tx.reference}</td>
                                    <td class="text-left">${tx.debit > 0 ? formatNumberOnly(tx.debit) : "-"}</td>
                                    <td class="text-left">${tx.credit > 0 ? formatNumberOnly(tx.credit) : "-"}</td>
                                    <td class="text-left bold">${formatNumberOnly(tx.runningBalance)}</td>
                                    <td>${tx.notes}</td>
                                  </tr>
                                `).join('')}
                              </tbody>
                            </table>
                            
                            <div class="footer">
                              نظام MeDo ERP للمحاسبة السحابية المتكاملة — تم التوليد وإصدار السند آلياً مع حماية التوقيع الرقمي.
                            </div>
                          </body>
                        </html>
                      `;
                      const printWindow = window.open("", "_blank");
                      if (printWindow) {
                        printWindow.document.write(printContent);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border border-slate-700"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة الكشف التفصيلي</span>
                  </button>

                  {onShareDocument && (
                    <button
                      onClick={() => {
                        onShareDocument({
                          type: "STATEMENT",
                          data: selectedCustomerForStatement,
                          recipientName: selectedCustomerForStatement.nameAr,
                          recipientPhone: selectedCustomerForStatement.phone,
                        });
                        setSelectedCustomerForStatement(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>مشاركة الكشف</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedCustomerForStatement(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* Import Customers Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl p-6 text-right animate-in zoom-in-95 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">استيراد قائمة العملاء (CSV / لصق سريع)</h3>
                  <p className="text-[11px] text-slate-400">الصق البيانات بالصيغة: اسم العميل, الهاتف, المدينة, الحد الائتماني</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {importSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs text-center font-bold">
                {importSuccessMsg}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <span className="font-bold text-white block">رفع ملف (CSV / Excel)</span>
                  <span className="text-[11px] text-slate-400">اختر ملف من جهازك للتحقق من الأعمدة تلقائياً</span>
                </div>
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md">
                  <span>اختر ملف...</span>
                  <input type="file" accept=".csv,.txt,.tsv" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {importValidationError && (
                <div className={`p-3 rounded-xl border text-xs font-semibold ${
                  importValidationError.includes("✅")
                    ? "bg-emerald-950/80 border-emerald-800 text-emerald-300"
                    : "bg-rose-950/80 border-rose-800 text-rose-300"
                }`}>
                  {importValidationError}
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">أو الصق البيانات مباشرة (سطر لكل عميل مفصول بفاصلة):</label>
                <textarea
                  rows={4}
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    validateAndPreview(e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="اسم العميل, الهاتف, المدينة, الحد الائتماني"
                />
              </div>

              {previewRows.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-semibold block text-[11px]">معاينة البيانات المستخرجة (أول 5 صفوف):</span>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden max-h-36 overflow-y-auto">
                    <table className="w-full text-right text-[11px]">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-2">الاسم</th>
                          <th className="p-2">الهاتف</th>
                          <th className="p-2">المدينة</th>
                          <th className="p-2">الحد الائتماني</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-slate-300">
                        {previewRows.map((r, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-medium">{r.name}</td>
                            <td className="p-2">{r.phone}</td>
                            <td className="p-2">{r.city}</td>
                            <td className="p-2">{r.creditLimit.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob(["اسم العميل,الهاتف,المدينة,الحد الائتماني\nشركة الأمل للأدوية,771234567,صنعاء,10000000\nمؤسسة الشفاء الطبية,733456789,تعز,15000000"], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "customers_template.csv";
                    a.click();
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  تحميل نموذج CSV جاهز
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleImportCustomers}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg"
                  >
                    بدء الاستيراد
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
