import React, { useState } from "react";
import {
  Package,
  Calendar,
  CheckCircle2,
  AlertOctagon,
  FileText,
  Plus,
  Printer,
  Search,
  Filter,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Clock,
  User,
  Building,
  Tag,
  DollarSign,
  AlertTriangle,
  X,
  Edit,
  Trash2,
  Send,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import {
  CurrencyCode,
  CurrencyInfo,
  InventoryItem,
  StockMovement,
  UnavailableItemRequest,
} from "../types/erp";
import { convertCurrency, formatMoney, formatNumberOnly } from "../services/erpStorage";

interface InventorySettingsSubViewProps {
  inventoryItems: InventoryItem[];
  stockMovements: StockMovement[];
  unavailableRequests: UnavailableItemRequest[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  onAddUnavailableRequest: (req: UnavailableItemRequest) => void;
  onUpdateUnavailableRequest: (req: UnavailableItemRequest) => void;
  onDeleteUnavailableRequest: (id: string) => void;
}

export const InventorySettingsSubView: React.FC<InventorySettingsSubViewProps> = ({
  inventoryItems,
  stockMovements,
  unavailableRequests,
  currencies,
  displayCurrency,
  onAddUnavailableRequest,
  onUpdateUnavailableRequest,
  onDeleteUnavailableRequest,
}) => {
  // Sub-tabs inside Inventory Settings
  const [subTab, setSubTab] = useState<"AUDIT" | "AVAILABLE" | "UNAVAILABLE" | "REQUESTS">("AUDIT");

  // Audit Date Range State
  const [auditStartDate, setAuditStartDate] = useState("2026-01-01");
  const [auditEndDate, setAuditEndDate] = useState("2026-12-31");
  const [auditCategory, setAuditCategory] = useState("ALL");

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");

  // Modal for "+ حر" Free Unavailable Item Request
  const [isFreeRequestModalOpen, setIsFreeRequestModalOpen] = useState(false);
  const [requestFormData, setRequestFormData] = useState<Partial<UnavailableItemRequest>>({
    itemName: "",
    category: "أجهزة طاقة شمسية",
    requestedQty: 1,
    customerOrBranch: "",
    urgency: "HIGH",
    notes: "",
  });

  const categories = Array.from(new Set(inventoryItems.map((item) => item.category))).filter(Boolean);

  // 1. Available Goods (البضاعة المتوفرة)
  const availableItems = inventoryItems.filter((item) => item.quantityOnHand > 0);

  // 2. Unavailable Goods (البضاعة الغير متوفرة / كمية 0)
  const unavailableItems = inventoryItems.filter((item) => item.quantityOnHand <= 0);

  // Handle Free Request Save
  const handleSaveFreeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestFormData.itemName || !requestFormData.requestedQty) {
      alert("يرجى كتابة اسم البضاعة / الصنف والكمية المطلوبة");
      return;
    }

    const newReq: UnavailableItemRequest = {
      id: `req-${Date.now()}`,
      requestNumber: `REQ-FREE-${Date.now().toString().slice(-5)}`,
      itemName: requestFormData.itemName,
      category: requestFormData.category || "طلب حر مخصص",
      requestedQty: Number(requestFormData.requestedQty || 1),
      customerOrBranch: requestFormData.customerOrBranch || "عميل خارجي / فرع",
      urgency: requestFormData.urgency || "HIGH",
      status: "PENDING",
      requestDate: new Date().toISOString().slice(0, 10),
      notes: requestFormData.notes || "طلب حر مخصص لبضاعة غير متوفرة بالدليل",
      createdBy: "المستخدم الحالي",
    };

    onAddUnavailableRequest(newReq);
    setIsFreeRequestModalOpen(false);
    setRequestFormData({
      itemName: "",
      category: "أجهزة طاقة شمسية",
      requestedQty: 1,
      customerOrBranch: "",
      urgency: "HIGH",
      notes: "",
    });
  };

  // Quick Status Toggle for Request
  const handleToggleRequestStatus = (req: UnavailableItemRequest) => {
    const statusMap: Record<UnavailableItemRequest["status"], UnavailableItemRequest["status"]> = {
      PENDING: "ORDERED",
      ORDERED: "FULFILLED",
      FULFILLED: "CANCELLED",
      CANCELLED: "PENDING",
    };

    const nextStatus = statusMap[req.status];
    onUpdateUnavailableRequest({ ...req, status: nextStatus });
  };

  // Compute Period Audit Statistics per Item
  const auditReportData = inventoryItems
    .filter((item) => auditCategory === "ALL" || item.category === auditCategory)
    .filter(
      (item) =>
        item.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((item) => {
      // Movements within range
      const itemMovements = stockMovements.filter(
        (m) =>
          m.itemId === item.id &&
          m.date >= auditStartDate &&
          m.date <= auditEndDate
      );

      const purchaseQty = itemMovements
        .filter((m) => m.type === "PURCHASE" || m.type === "ADJUSTMENT_ADD")
        .reduce((sum, m) => sum + m.quantity, 0);

      const salesQty = itemMovements
        .filter((m) => m.type === "SALES" || m.type === "ADJUSTMENT_SUB")
        .reduce((sum, m) => sum + m.quantity, 0);

      const customerReturns = itemMovements
        .filter((m) => m.type === "RETURN_CUSTOMER")
        .reduce((sum, m) => sum + m.quantity, 0);

      const vendorReturns = itemMovements
        .filter((m) => m.type === "RETURN_VENDOR")
        .reduce((sum, m) => sum + m.quantity, 0);

      const netInflow = purchaseQty + customerReturns;
      const netOutflow = salesQty + vendorReturns;

      // Estimated opening qty
      const openingQty = Math.max(0, item.quantityOnHand - netInflow + netOutflow);

      return {
        item,
        openingQty,
        purchaseQty,
        salesQty,
        customerReturns,
        vendorReturns,
        endingQty: item.quantityOnHand,
        costValueInDisplay: convertCurrency(
          item.costPrice * item.quantityOnHand,
          item.currency,
          displayCurrency,
          currencies
        ),
      };
    });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">إعدادات وتقارير المخزون الشاملة</h2>
            <p className="text-xs text-slate-400">
              جردة المخزون للفترة، كشوفات البضاعة المتوفرة وغير المتوفرة، وإدارة الطلبات الحرة.
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition self-start md:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة التقرير الحالي</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setSubTab("AUDIT")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            subTab === "AUDIT"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
              : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>1. جردة المخزون خلال فترة</span>
        </button>

        <button
          onClick={() => setSubTab("AVAILABLE")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            subTab === "AVAILABLE"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
              : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>2. كشف البضاعة المتوفرة ({availableItems.length})</span>
        </button>

        <button
          onClick={() => setSubTab("UNAVAILABLE")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            subTab === "UNAVAILABLE"
              ? "bg-rose-600 text-white shadow-lg shadow-rose-900/40"
              : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>3. كشف البضاعة الغير متوفرة ({unavailableItems.length})</span>
        </button>

        <button
          onClick={() => setSubTab("REQUESTS")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            subTab === "REQUESTS"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
              : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>4. كشف طلبات غير متوفرة ({unavailableRequests.length})</span>
        </button>
      </div>

      {/* ----------------- TAB 1: AUDIT DURING PERIOD (جردة المخزون خلال فترة) ----------------- */}
      {subTab === "AUDIT" && (
        <div className="space-y-4">
          {/* Period Filter Card */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>من تاريخ:</span>
                <input
                  type="date"
                  value={auditStartDate}
                  onChange={(e) => setAuditStartDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-1.5 focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                <span>إلى تاريخ:</span>
                <input
                  type="date"
                  value={auditEndDate}
                  onChange={(e) => setAuditEndDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-1.5 focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                <span>الفئة:</span>
                <select
                  value={auditCategory}
                  onChange={(e) => setAuditCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-indigo-500"
                >
                  <option value="ALL">جميع الفئات</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث في جردة الفترة..."
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pr-9 pl-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Audit Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
                    <th className="px-4 py-3.5">الصنف والكود</th>
                    <th className="px-4 py-3.5">رصيد أول الفترة (افتتاحي)</th>
                    <th className="px-4 py-3.5 text-emerald-400">الوارد / المشتريات (+)</th>
                    <th className="px-4 py-3.5 text-blue-400">المنصرف / المبيعات (-)</th>
                    <th className="px-4 py-3.5 text-purple-400">مرتجعات عملاء (+)</th>
                    <th className="px-4 py-3.5 text-amber-400">مرتجعات موارد (-)</th>
                    <th className="px-4 py-3.5">رصيد الجرد الفعلي (نهاية الفترة)</th>
                    <th className="px-4 py-3.5">القيمة الإجمالية للجردة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {auditReportData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-500">
                        لا توجد أصناف جردية للفترة المحددة.
                      </td>
                    </tr>
                  ) : (
                    auditReportData.map((row) => (
                      <tr key={row.item.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 font-bold">
                          <div className="text-white">{row.item.nameAr}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{row.item.code} | {row.item.category}</div>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-300">
                          {formatNumberOnly(row.openingQty)} {row.item.unit}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                          +{formatNumberOnly(row.purchaseQty)}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-blue-400">
                          -{formatNumberOnly(row.salesQty)}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-purple-300">
                          +{formatNumberOnly(row.customerReturns)}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-amber-300">
                          -{formatNumberOnly(row.vendorReturns)}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-white text-sm">
                          {formatNumberOnly(row.endingQty)} {row.item.unit}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                          {formatMoney(row.costValueInDisplay, displayCurrency, currencies)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: AVAILABLE GOODS (كشف البضاعة المتوفرة) ----------------- */}
      {subTab === "AVAILABLE" && (
        <div className="space-y-4">
          <div className="bg-emerald-950/40 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">جدول حصر الأصناف الجاهزة للتسليم والصرف بالمستودع</h3>
                <p className="text-xs text-slate-400">عدد الأصناف المتوفرة حالياً: {availableItems.length} صنف</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase text-[11px]">
                    <th className="px-4 py-3.5">الكود والاسم</th>
                    <th className="px-4 py-3.5">الفئة والموقع</th>
                    <th className="px-4 py-3.5">الكمية المتوفرة</th>
                    <th className="px-4 py-3.5">سعر التكلفة</th>
                    <th className="px-4 py-3.5">سعر البيع</th>
                    <th className="px-4 py-3.5">القيمة الإجمالية المتوفرة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {availableItems.map((item) => {
                    const totalCostVal = convertCurrency(item.costPrice * item.quantityOnHand, item.currency, displayCurrency, currencies);
                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3.5 font-bold">
                          <div className="text-white text-sm">{item.nameAr}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.code}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-slate-300">{item.category}</div>
                          <div className="text-[10px] text-slate-400">{item.warehouseLocation}</div>
                        </td>
                        <td className="px-4 py-3.5 font-bold font-mono text-emerald-400 text-sm">
                          {formatNumberOnly(item.quantityOnHand)} {item.unit}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-300">
                          {formatMoney(item.costPrice, item.currency, currencies)}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-teal-400">
                          {formatMoney(item.sellingPrice, item.currency, currencies)}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                          {formatMoney(totalCostVal, displayCurrency, currencies)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 3: UNAVAILABLE GOODS (كشف البضاعة الغير متوفرة) ----------------- */}
      {subTab === "UNAVAILABLE" && (
        <div className="space-y-4">
          <div className="bg-rose-950/40 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-400" />
              <div>
                <h3 className="text-sm font-bold text-white">كشف الأصناف التي نفذت كميتها بالكامل من المخزون (0)</h3>
                <p className="text-xs text-slate-400">يتطلب هذا الكشف التوريد وإعادة الطلب السريع لضمان الاستمرارية</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase text-[11px]">
                    <th className="px-4 py-3.5">كود الصنف</th>
                    <th className="px-4 py-3.5">اسم الصنف الغير متوفر</th>
                    <th className="px-4 py-3.5">الفئة</th>
                    <th className="px-4 py-3.5">الكمية الحالية</th>
                    <th className="px-4 py-3.5">حد الخطر / الطلب الأدنى</th>
                    <th className="px-4 py-3.5">سعر التكلفة التقديري</th>
                    <th className="px-4 py-3.5 text-center">حالة التنبيه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {unavailableItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-emerald-400 font-bold">
                        🎉 ممتاز! جميع الأصناف في المستودع متوفرة ولا يوجد أي صنف منفذ.
                      </td>
                    </tr>
                  ) : (
                    unavailableItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 bg-rose-950/10">
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-300">{item.code}</td>
                        <td className="px-4 py-3.5 font-bold text-white text-sm">{item.nameAr}</td>
                        <td className="px-4 py-3.5 text-slate-300">{item.category}</td>
                        <td className="px-4 py-3.5 font-bold font-mono text-rose-400 text-sm">
                          0 {item.unit}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-amber-300">
                          {item.minStockThreshold} {item.unit}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-300">
                          {formatMoney(item.costPrice, item.currency, currencies)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>نفذت الكمية 🚨</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 4: UNAVAILABLE REQUESTS LIST WITH "+ حر" BUTTON (طلبات غير متوفرة) ----------------- */}
      {subTab === "REQUESTS" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-sm font-bold text-white">قائمة طلبات الأصناف والبضائع غير المتوفرة</h3>
                <p className="text-xs text-slate-400">تتبع الطلبات الخاصة من العملاء والفروع مع إمكانية إضافة طلب حُر مخصص</p>
              </div>
            </div>

            {/* "+ حر" Free Custom Request Button */}
            <button
              onClick={() => setIsFreeRequestModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-950/50 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ حُـر (إضافة طلب مخصص)</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase text-[11px]">
                    <th className="px-4 py-3.5">رقم الطلب</th>
                    <th className="px-4 py-3.5">اسم البضاعة / الصنف المطلوب</th>
                    <th className="px-4 py-3.5">الكمية والجهة الطالبة</th>
                    <th className="px-4 py-3.5">تاريخ الطلب والأولوية</th>
                    <th className="px-4 py-3.5">حالة الطلب</th>
                    <th className="px-4 py-3.5">ملاحظات والتفاصيل</th>
                    <th className="px-4 py-3.5 text-center">تحديث الحالة / حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {unavailableRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        لا توجد طلبات أصناف غير متوفرة مسجلة حالياً. استخدم زر "+ حُـر" لإضافة طلب جديد.
                      </td>
                    </tr>
                  ) : (
                    unavailableRequests.map((req) => {
                      let statusBadge = "bg-amber-500/20 text-amber-300 border-amber-500/30";
                      let statusText = "قيد الانتظار ⏳";

                      if (req.status === "ORDERED") {
                        statusBadge = "bg-blue-500/20 text-blue-300 border-blue-500/30";
                        statusText = "تم الطلب من المورد 📦";
                      } else if (req.status === "FULFILLED") {
                        statusBadge = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
                        statusText = "تم التوفير بنجاح ✅";
                      } else if (req.status === "CANCELLED") {
                        statusBadge = "bg-rose-500/20 text-rose-300 border-rose-500/30";
                        statusText = "ملغى ❌";
                      }

                      return (
                        <tr key={req.id} className="hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3.5 font-mono font-bold text-purple-400">{req.requestNumber}</td>
                          <td className="px-4 py-3.5 font-bold text-white text-sm">
                            {req.itemName}
                            <div className="text-[10px] text-slate-400">{req.category}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-emerald-400 font-mono text-sm">{req.requestedQty} قطعة</div>
                            <div className="text-[10px] text-slate-400">{req.customerOrBranch}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-mono text-slate-300">{req.requestDate}</div>
                            {req.urgency === "HIGH" && (
                              <span className="text-[10px] font-bold text-rose-400">عاجل جداً 🔥</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-block px-2.5 py-1 rounded border text-[11px] font-bold ${statusBadge}`}>
                              {statusText}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-300 max-w-xs">{req.notes}</td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleToggleRequestStatus(req)}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition"
                                title="تغيير مرحلة حالة الطلب"
                              >
                                تغيير الحالة
                              </button>
                              <button
                                onClick={() => onDeleteUnavailableRequest(req.id)}
                                className="p-1 rounded bg-rose-950 text-rose-400 hover:bg-rose-900 transition"
                                title="حذف الطلب"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal for "+ حر" Free Custom Request */}
      {isFreeRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">إضافة طلب حُـر لبضاعة غير متوفرة</h3>
              </div>
              <button
                onClick={() => setIsFreeRequestModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFreeRequest} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">اسم البضاعة / الصنف المطلوبة حر كتايةً:</label>
                <input
                  type="text"
                  value={requestFormData.itemName}
                  onChange={(e) => setRequestFormData({ ...requestFormData, itemName: e.target.value })}
                  placeholder="مثال: إنفرتر طاقة شمسية 10KW ثلاثي الأوجه Deye"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-purple-500 font-bold text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الفئة / التصنيف:</label>
                  <input
                    type="text"
                    value={requestFormData.category}
                    onChange={(e) => setRequestFormData({ ...requestFormData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الكمية المطلوبة:</label>
                  <input
                    type="number"
                    min="1"
                    value={requestFormData.requestedQty}
                    onChange={(e) =>
                      setRequestFormData({ ...requestFormData, requestedQty: parseFloat(e.target.value) || 1 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-bold focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">اسم العميل / الفرع الطالب:</label>
                  <input
                    type="text"
                    value={requestFormData.customerOrBranch}
                    onChange={(e) => setRequestFormData({ ...requestFormData, customerOrBranch: e.target.value })}
                    placeholder="مثال: شركة النجم الأحمر / فرع صنعاء"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">درجة الأهمية والسرعة:</label>
                  <select
                    value={requestFormData.urgency}
                    onChange={(e) =>
                      setRequestFormData({
                        ...requestFormData,
                        urgency: e.target.value as UnavailableItemRequest["urgency"],
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-purple-500 font-bold"
                  >
                    <option value="HIGH">عاجل جداً 🔥</option>
                    <option value="MEDIUM">متوسط ⚡</option>
                    <option value="LOW">عادي ☕</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ملاحظات ومواصفات إضافية:</label>
                <textarea
                  rows={3}
                  value={requestFormData.notes}
                  onChange={(e) => setRequestFormData({ ...requestFormData, notes: e.target.value })}
                  placeholder="اكتب أية مواصفات دقيقة مثل الجهد الكهرائي، الشركة المصنعة المفضل التوريد منها..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFreeRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 shadow-lg shadow-purple-900/40 transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>تسجيل الطلب الحر</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
