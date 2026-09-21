import React, { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  FileSpreadsheet,
  ArrowUpRight,
  Printer,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Truck,
  Phone,
  Share2,
  Upload,
} from "lucide-react";
import {
  Account,
  CurrencyCode,
  CurrencyInfo,
  Invoice,
  InvoiceItem,
  Vendor,
} from "../types/erp";
import { formatMoney, formatNumberOnly } from "../services/erpStorage";
import { ColumnCustomizer, useColumnVisibility, ColumnDef } from "./ColumnCustomizer";

interface VendorsAndAPViewProps {
  vendors: Vendor[];
  invoices: Invoice[];
  accounts: Account[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  onAddVendor: (vendor: Vendor) => void;
  onSaveInvoice: (invoice: Invoice) => void;
  onPrintDocument: (docType: "INVOICE", data: any) => void;
  onShareDocument?: (data: any) => void;
}

export const VendorsAndAPView: React.FC<VendorsAndAPViewProps> = ({
  vendors,
  invoices,
  accounts,
  currencies,
  displayCurrency,
  onAddVendor,
  onSaveInvoice,
  onPrintDocument,
  onShareDocument,
}) => {
  const [activeTab, setActiveTab] = useState<"VENDORS" | "PURCHASES">("VENDORS");

  const VENDOR_COLUMNS: ColumnDef[] = [
    { id: "code", label: "رمز المورد", locked: true },
    { id: "nameAr", label: "اسم الشركة / المورد" },
    { id: "category", label: "التصنيف" },
    { id: "city", label: "المدينة / الدولة" },
    { id: "phone", label: "الهاتف" },
    { id: "currentBalance", label: "الرصيد الدائن المستحق" },
    { id: "actions", label: "الإجراءات", locked: true },
  ];
  const { visibleColumns: venVis, updateVisibility: updateVenVis, isVisible: isVenVis } = useColumnVisibility("vendors_list", VENDOR_COLUMNS);

  const PURCHASE_BILL_COLUMNS: ColumnDef[] = [
    { id: "invoiceNumber", label: "رقم الفاتورة", locked: true },
    { id: "vendorName", label: "المورد" },
    { id: "date", label: "التاريخ" },
    { id: "dueDate", label: "تاريخ الاستحقاق" },
    { id: "totalAmount", label: "إجمالي الفاتورة" },
    { id: "status", label: "الحالة" },
    { id: "actions", label: "الإجراءات", locked: true },
  ];
  const { visibleColumns: purVis, updateVisibility: updatePurVis, isVisible: isPurVis } = useColumnVisibility("purchase_bills_list", PURCHASE_BILL_COLUMNS);

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState(`اسم المورد,الهاتف,المدينة,التصنيف\nمجموعة هائل سعيد أنعم,770123456,صنعاء,توريد مواد غذائية\nشركة الأدوية الحديثة,733987654,عدن,توريد أدوية`);
  const [importSuccessMsg, setImportSuccessMsg] = useState("");
  const [importValidationError, setImportValidationError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<Array<{ name: string; phone: string; city: string; category: string }>>([]);
  const [isColumnsValidated, setIsColumnsValidated] = useState(false);

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

    const hasName = header.includes("اسم") || header.toLowerCase().includes("name");
    const hasPhone = header.includes("هاتف") || header.toLowerCase().includes("phone");
    const hasCity = header.includes("مدينة") || header.toLowerCase().includes("city");

    if (!hasName || !hasPhone || !hasCity) {
      setImportValidationError("⚠️ خطأ في الأعمدة: رأس الجدول يجب أن يتضمن أعمدة رئيسية على الأقل مثل (اسم المورد, الهاتف, المدينة). يرجى التأكد من النموذج.");
      setIsColumnsValidated(false);
      setPreviewRows([]);
      return;
    }

    const parsed: Array<{ name: string; phone: string; city: string; category: string }> = [];
    for (let i = 1; i < Math.min(lines.length, 6); i++) {
      const parts = lines[i].split(delimiter).map(p => p.trim());
      parsed.push({
        name: parts[0] || `مورد ${i}`,
        phone: parts[1] || "770000000",
        city: parts[2] || "صنعاء",
        category: parts[3] || "توريد عام",
      });
    }

    setPreviewRows(parsed);
    setIsColumnsValidated(true);
    setImportValidationError("✅ تمت مطابقة الأعمدة بنجاح وجاهز للاستيراد.");
  };

  const handleImportVendors = () => {
    try {
      const lines = importText.split("\n").filter(l => l.trim() !== "");
      if (lines.length <= 1) {
        alert("يرجى إدخال بيانات صحيحة");
        return;
      }

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
        const nameAr = parts[0] || `مورد مستورد ${i}`;
        const phone = parts[1] || "770000000";
        const city = parts[2] || "صنعاء";
        const category = parts[3] || "توريد عام";

        const nextCode = `VEN-${(vendors.length + count + 1).toString().padStart(4, "0")}`;
        const newVen: Vendor = {
          id: `ven-imp-${Date.now()}-${i}`,
          code: nextCode,
          nameAr,
          nameEn: "",
          phone,
          city,
          currency: "USD",
          category,
          currentBalance: 0,
          glAccountId: "210101",
          createdAt: new Date().toISOString().slice(0, 10),
        };
        onAddVendor(newVen);
        count++;
      }
      setImportSuccessMsg(`تم استيراد ${count} مورد بنجاح!`);
      setTimeout(() => {
        setImportSuccessMsg("");
        setShowImportModal(false);
      }, 1500);
    } catch (err) {
      alert("حدث خطأ أثناء الاستيراد.");
    }
  };

  // New Vendor Form State
  const [venNameAr, setVenNameAr] = useState("");
  const [venNameEn, setVenNameEn] = useState("");
  const [venPhone, setVenPhone] = useState("");
  const [venCity, setVenCity] = useState("صنعاء");
  const [venCurrency, setVenCurrency] = useState<CurrencyCode>("USD");
  const [venCategory, setVenCategory] = useState("توريد بضائع ومواد");

  // New Purchase Bill Form State
  const [purVendorId, setPurVendorId] = useState(vendors[0]?.id || "");
  const [purDate, setPurDate] = useState(new Date().toISOString().split("T")[0]);
  const [purDueDate, setPurDueDate] = useState(
    new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [purCurrency, setPurCurrency] = useState<CurrencyCode>("USD");
  const [purItems, setPurItems] = useState<InvoiceItem[]>([
    {
      id: "item-p1",
      description: "توريد معدات وأجهزة شبكات وسيرفرات",
      quantity: 2,
      unitPrice: 1200,
      total: 2400,
    },
  ]);

  const addPurchaseItem = () => {
    setPurItems((prev) => [
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

  const purSubtotal = purItems.reduce((sum, item) => sum + item.total, 0);

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!venNameAr) return;

    const nextCode = `VEND-${(vendors.length + 1).toString().padStart(4, "0")}`;
    const newVen: Vendor = {
      id: `vend-${Date.now()}`,
      code: nextCode,
      nameAr: venNameAr,
      nameEn: venNameEn,
      phone: venPhone,
      city: venCity,
      currency: venCurrency,
      currentBalance: 0,
      glAccountId: "210101",
      category: venCategory,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onAddVendor(newVen);
    setShowAddVendorModal(false);
    setVenNameAr("");
    setVenNameEn("");
    setVenPhone("");
  };

  const handleSavePurchaseBill = (e: React.FormEvent) => {
    e.preventDefault();
    const vend = vendors.find((v) => v.id === purVendorId);
    if (!vend || purSubtotal <= 0) return;

    const nextBillNum = `BILL-2026-${(invoices.length + 1).toString().padStart(4, "0")}`;
    const newBill: Invoice = {
      id: `bill-${Date.now()}`,
      invoiceNumber: nextBillNum,
      type: "PURCHASE",
      vendorId: vend.id,
      vendorName: vend.nameAr,
      date: purDate,
      dueDate: purDueDate,
      currency: purCurrency,
      exchangeRate: 1,
      items: purItems,
      subtotal: purSubtotal,
      taxRate: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: purSubtotal,
      paidAmount: 0,
      remainingAmount: purSubtotal,
      status: "ISSUED",
      notes: `فاتورة مشتريات من المورد ${vend.nameAr}`,
    };

    onSaveInvoice(newBill);
    setShowAddPurchaseModal(false);
  };

  const filteredVendors = vendors.filter((v) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return v.nameAr.toLowerCase().includes(q) || v.code.toLowerCase().includes(q);
    }
    return true;
  });

  const purchaseBills = invoices.filter((i) => i.type === "PURCHASE");

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">إدارة الموردين والمشتريات (Accounts Payable - AP)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            دليل الموردين المحليين والدوليين، فواتير المشتريات ومتابعة استحقاقات الدفع
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>استيراد الموردين</span>
          </button>
          <button
            onClick={() => setShowAddVendorModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>إضافة مورد جديد</span>
          </button>
          <button
            onClick={() => setShowAddPurchaseModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تسجيل فاتورة مشتريات</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs w-fit">
        {[
          { id: "VENDORS", label: "دليل الموردين والدائنين" },
          { id: "PURCHASES", label: "فواتير المشتريات (Vendor Bills)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              activeTab === tab.id
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vendors Table */}
      {activeTab === "VENDORS" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="بحث باسم المورد أو الرمز..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <ColumnCustomizer
                tableKey="vendors_list"
                columns={VENDOR_COLUMNS}
                visibleColumns={venVis}
                onChange={updateVenVis}
              />
              <span className="text-xs text-slate-400 font-mono">إجمالي الموردين: {vendors.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 bg-slate-950/70">
                  {isVenVis("code") && <th className="py-3 px-4 font-semibold">رمز المورد</th>}
                  {isVenVis("nameAr") && <th className="py-3 px-4 font-semibold">اسم الشركة / المورد</th>}
                  {isVenVis("category") && <th className="py-3 px-4 font-semibold">التصنيف</th>}
                  {isVenVis("city") && <th className="py-3 px-4 font-semibold">المدينة / الدولة</th>}
                  {isVenVis("phone") && <th className="py-3 px-4 font-semibold">الهاتف</th>}
                  {isVenVis("currentBalance") && <th className="py-3 px-4 font-semibold text-left">الرصيد الدائن المستحق</th>}
                  {isVenVis("actions") && <th className="py-3 px-4 font-semibold text-center">الإجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={VENDOR_COLUMNS.filter((c) => isVenVis(c.id)).length} className="text-center py-8 text-slate-500">
                      لا يوجد موردون مطبقون على تصفية البحث
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                      {isVenVis("code") && <td className="py-3 px-4 font-mono font-bold text-amber-400">{v.code}</td>}
                      {isVenVis("nameAr") && (
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-100">{v.nameAr}</div>
                          {v.nameEn && <div className="text-[10px] text-slate-400 font-mono">{v.nameEn}</div>}
                        </td>
                      )}
                      {isVenVis("category") && (
                        <td className="py-3 px-4">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {v.category || "عام"}
                          </span>
                        </td>
                      )}
                      {isVenVis("city") && <td className="py-3 px-4 text-slate-300">{v.city}</td>}
                      {isVenVis("phone") && <td className="py-3 px-4 font-mono text-slate-400">{v.phone}</td>}
                      {isVenVis("currentBalance") && (
                        <td className="py-3 px-4 text-left font-mono font-bold text-amber-400 text-sm">
                          {formatMoney(v.currentBalance, v.currency, currencies)}
                        </td>
                      )}
                      {isVenVis("actions") && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {onShareDocument && (
                              <button
                                onClick={() =>
                                  onShareDocument({
                                    type: "STATEMENT",
                                    data: v,
                                    recipientName: v.nameAr,
                                    recipientPhone: v.phone,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/60 hover:bg-amber-800 hover:text-white transition-colors"
                                title="مشاركة كشف الحساب عبر واتساب / SMS"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                onShareDocument?.({
                                  type: "STATEMENT",
                                  data: v,
                                  recipientName: v.nameAr,
                                  recipientPhone: v.phone,
                                })
                              }
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

      {/* Purchases Table */}
      {activeTab === "PURCHASES" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-400 font-mono">إجمالي الفواتير: {purchaseBills.length}</div>
            <ColumnCustomizer
              tableKey="purchase_bills_list"
              columns={PURCHASE_BILL_COLUMNS}
              visibleColumns={purVis}
              onChange={updatePurVis}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 bg-slate-950/70">
                  {isPurVis("invoiceNumber") && <th className="py-3 px-4 font-semibold">رقم الفاتورة</th>}
                  {isPurVis("vendorName") && <th className="py-3 px-4 font-semibold">المورد</th>}
                  {isPurVis("date") && <th className="py-3 px-4 font-semibold">التاريخ</th>}
                  {isPurVis("dueDate") && <th className="py-3 px-4 font-semibold">تاريخ الاستحقاق</th>}
                  {isPurVis("totalAmount") && <th className="py-3 px-4 font-semibold text-left">إجمالي الفاتورة</th>}
                  {isPurVis("status") && <th className="py-3 px-4 font-semibold text-center">الحالة</th>}
                  {isPurVis("actions") && <th className="py-3 px-4 font-semibold text-center">الإجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {purchaseBills.length === 0 ? (
                  <tr>
                    <td colSpan={PURCHASE_BILL_COLUMNS.filter((c) => isPurVis(c.id)).length} className="py-12 text-center text-slate-400">
                      لا توجد فواتير مشتريات مسجلة
                    </td>
                  </tr>
                ) : (
                  purchaseBills.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40">
                      {isPurVis("invoiceNumber") && <td className="py-3 px-4 font-mono font-bold text-amber-400">{b.invoiceNumber}</td>}
                      {isPurVis("vendorName") && <td className="py-3 px-4 font-bold text-slate-100">{b.vendorName}</td>}
                      {isPurVis("date") && <td className="py-3 px-4 text-slate-300">{b.date}</td>}
                      {isPurVis("dueDate") && <td className="py-3 px-4 text-slate-400 font-mono">{b.dueDate}</td>}
                      {isPurVis("totalAmount") && (
                        <td className="py-3 px-4 text-left font-mono font-bold text-amber-400">
                          {formatMoney(b.totalAmount, b.currency, currencies)}
                        </td>
                      )}
                      {isPurVis("status") && (
                        <td className="py-3 px-4 text-center">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                            مستحق الدفع
                          </span>
                        </td>
                      )}
                      {isPurVis("actions") && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {onShareDocument && (
                              <button
                                onClick={() =>
                                  onShareDocument({
                                    type: "INVOICE",
                                    data: b,
                                    recipientName: b.vendorName,
                                    recipientPhone: (b as any).vendorPhone || (b as any).partyPhone || vendors.find((v) => v.id === b.partyId)?.phone,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-800 hover:text-white transition-colors"
                                title="مشاركة عبر واتساب / SMS"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onPrintDocument("INVOICE", b)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
                            >
                              طباعة
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

      {/* Add Vendor Modal */}
      {showAddVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-right animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>إضافة مورد / دائن جديد إلى الدليل</span>
              </h3>
              <button
                onClick={() => setShowAddVendorModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم الشركة / المورد بالعربية *</label>
                <input
                  type="text"
                  required
                  value={venNameAr}
                  onChange={(e) => setVenNameAr(e.target.value)}
                  placeholder="مثال: شركة النظم والتقنيات الحديثة"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">المدينة / الدولة</label>
                  <input
                    type="text"
                    value={venCity}
                    onChange={(e) => setVenCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">رقم الهاتف</label>
                  <input
                    type="text"
                    value={venPhone}
                    onChange={(e) => setVenPhone(e.target.value)}
                    placeholder="+967 1 234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">عملة الحساب</label>
                  <select
                    value={venCurrency}
                    onChange={(e) => setVenCurrency(e.target.value as CurrencyCode)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="YER_SANAA">ريال يمني (صنعاء)</option>
                    <option value="YER_ADEN">ريال يمني (عدن)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">تصنيف التوريد</label>
                  <input
                    type="text"
                    value={venCategory}
                    onChange={(e) => setVenCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddVendorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition-all"
                >
                  حفظ المورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Purchase Bill Modal */}
      {showAddPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 text-right animate-in zoom-in-95 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span>تسجيل فاتورة مشتريات (Vendor Bill)</span>
              </h3>
              <button
                onClick={() => setShowAddPurchaseModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePurchaseBill} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">المورد *</label>
                  <select
                    value={purVendorId}
                    onChange={(e) => setPurVendorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-bold focus:outline-none focus:border-amber-500"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nameAr} ({v.currency})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">تاريخ الفاتورة</label>
                  <input
                    type="date"
                    value={purDate}
                    onChange={(e) => setPurDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    value={purDueDate}
                    onChange={(e) => setPurDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Items */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <th className="py-2 px-3 font-semibold">بيان البضاعة / الخدمة *</th>
                      <th className="py-2 px-3 font-semibold w-24 text-left">الكمية</th>
                      <th className="py-2 px-3 font-semibold w-32 text-left">سعر الوحدة</th>
                      <th className="py-2 px-3 font-semibold w-32 text-left">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {purItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            required
                            value={item.description}
                            onChange={(e) => updatePurchaseItem(item.id, "description", e.target.value)}
                            placeholder="وصف البند المورد..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updatePurchaseItem(item.id, "quantity", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-left"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unitPrice}
                            onChange={(e) => updatePurchaseItem(item.id, "unitPrice", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-left font-bold text-amber-400"
                          />
                        </td>
                        <td className="py-2 px-3 text-left font-mono font-bold text-white">
                          {formatNumberOnly(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center font-bold">
                <span className="text-slate-400">إجمالي فاتورة المشتريات:</span>
                <span className="text-amber-400 font-mono text-base">
                  {formatMoney(purSubtotal, purCurrency, currencies)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPurchaseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition-all"
                >
                  حفظ الفاتورة وترحيل القيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Import Vendors Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl p-6 text-right animate-in zoom-in-95 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">استيراد قائمة الموردين (CSV / لصق سريع)</h3>
                  <p className="text-[11px] text-slate-400">الصق البيانات بالصيغة: اسم المورد, الهاتف, المدينة, التصنيف</p>
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
              <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-300 text-xs text-center font-bold">
                {importSuccessMsg}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <span className="font-bold text-white block">رفع ملف (CSV / Excel)</span>
                  <span className="text-[11px] text-slate-400">اختر ملف من جهازك للتحقق من الأعمدة تلقائياً</span>
                </div>
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-all shadow-md">
                  <span>اختر ملف...</span>
                  <input type="file" accept=".csv,.txt,.tsv" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {importValidationError && (
                <div className={`p-3 rounded-xl border text-xs font-semibold ${
                  importValidationError.includes("✅")
                    ? "bg-amber-950/80 border-amber-800 text-amber-300"
                    : "bg-rose-950/80 border-rose-800 text-rose-300"
                }`}>
                  {importValidationError}
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">أو الصق البيانات مباشرة (سطر لكل مورد مفصول بفاصلة):</label>
                <textarea
                  rows={4}
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    validateAndPreview(e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  placeholder="اسم المورد, الهاتف, المدينة, التصنيف"
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
                          <th className="p-2">التصنيف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-slate-300">
                        {previewRows.map((r, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-medium">{r.name}</td>
                            <td className="p-2">{r.phone}</td>
                            <td className="p-2">{r.city}</td>
                            <td className="p-2">{r.category}</td>
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
                    const blob = new Blob(["اسم المورد,الهاتف,المدينة,التصنيف\nمجموعة هائل سعيد أنعم,770123456,صنعاء,توريد مواد غذائية\nشركة الأدوية الحديثة,733987654,عدن,توريد أدوية"], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "vendors_template.csv";
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
                    onClick={handleImportVendors}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-lg"
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
