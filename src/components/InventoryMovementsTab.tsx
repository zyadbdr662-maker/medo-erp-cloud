import React, { useState } from "react";
import { StockMovement, CurrencyInfo, CurrencyCode } from "../types/erp";
import { formatMoney } from "../services/erpStorage";
import { History, Search, ArrowUpRight, ArrowDownLeft, RotateCcw, Truck, Package } from "lucide-react";

interface InventoryMovementsTabProps {
  stockMovements?: StockMovement[];
  currencies?: CurrencyInfo[];
  displayCurrency: CurrencyCode;
}

export const InventoryMovementsTab: React.FC<InventoryMovementsTabProps> = ({
  stockMovements = [],
  currencies = [],
  displayCurrency,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const safeList = Array.isArray(stockMovements) ? stockMovements : [];
  const searchLower = (searchTerm || "").trim().toLowerCase();

  const filteredMovements = safeList.filter((mov) => {
    if (!mov) return false;
    const name = (mov.itemNameAr || "").toLowerCase();
    const code = (mov.itemCode || "").toLowerCase();
    const ref = (mov.referenceNumber || "").toLowerCase();
    const notes = (mov.notes || "").toLowerCase();

    const matchesSearch = !searchLower || name.includes(searchLower) || code.includes(searchLower) || ref.includes(searchLower) || notes.includes(searchLower);
    const matchesType = typeFilter === "ALL" || mov.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getMovementLabel = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return "توريد مشتريات (+)";
      case "SALES":
        return "صرف مبيعات (-)";
      case "RETURN_CUSTOMER":
        return "مرتجع عملاء (+)";
      case "RETURN_VENDOR":
        return "مرتجع موردين (-)";
      case "ADJUSTMENT_ADD":
        return "تسوية جرد (فائض +)";
      case "ADJUSTMENT_SUB":
        return "تسوية جرد (عجز -)";
      case "TRANSFER_IN":
        return "تحويل وارد (+)";
      case "TRANSFER_OUT":
        return "تحويل صادر (-)";
      default:
        return type || "حركة مخزنية";
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case "SALES":
        return <ArrowUpRight className="w-4 h-4 text-blue-400" />;
      case "RETURN_CUSTOMER":
      case "RETURN_VENDOR":
        return <RotateCcw className="w-4 h-4 text-purple-400" />;
      case "ADJUSTMENT_ADD":
      case "ADJUSTMENT_SUB":
        return <Package className="w-4 h-4 text-amber-400" />;
      case "TRANSFER_OUT":
      case "TRANSFER_IN":
        return <Truck className="w-4 h-4 text-cyan-400" />;
      default:
        return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  const getMovementColor = (type: string = "") => {
    if (type.includes("ADD") || type === "PURCHASE" || type === "RETURN_CUSTOMER" || type === "TRANSFER_IN") return "text-emerald-300 bg-emerald-500/15 border border-emerald-500/30";
    if (type.includes("SUB") || type === "SALES" || type === "RETURN_VENDOR" || type === "TRANSFER_OUT") return "text-rose-300 bg-rose-500/15 border border-rose-500/30";
    return "text-slate-300 bg-slate-800/80 border border-slate-700";
  };

  return (
    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="بحث برقم المرجع، كود أو اسم الصنف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-emerald-500 text-white"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 text-white"
        >
          <option value="ALL">جميع الحركات</option>
          <option value="PURCHASE">مشتريات وتوريد</option>
          <option value="SALES">مبيعات وصرف</option>
          <option value="RETURN_CUSTOMER">مردود عملاء</option>
          <option value="RETURN_VENDOR">مردود موردين</option>
          <option value="ADJUSTMENT_ADD">تسوية جرد (إضافة)</option>
          <option value="ADJUSTMENT_SUB">تسوية جرد (عجز)</option>
        </select>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">التاريخ</th>
                <th className="px-4 py-3 font-semibold">المرجع</th>
                <th className="px-4 py-3 font-semibold">الصنف</th>
                <th className="px-4 py-3 font-semibold">نوع الحركة</th>
                <th className="px-4 py-3 font-semibold">الكمية</th>
                <th className="px-4 py-3 font-semibold">السعر الافرادي</th>
                <th className="px-4 py-3 font-semibold">الإجمالي</th>
                <th className="px-4 py-3 font-semibold">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    لا توجد حركات مخزنية مطابقة
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">{mov.date}</td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">{mov.referenceNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-white text-xs">{mov.itemNameAr}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{mov.itemCode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold ${getMovementColor(mov.type)}`}>
                        {getMovementIcon(mov.type)}
                        <span>{getMovementLabel(mov.type)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold font-mono text-white text-base">
                      {mov.type && (mov.type.includes("SUB") || mov.type === "SALES" || mov.type === "RETURN_VENDOR" || mov.type === "TRANSFER_OUT") ? "-" : "+"}
                      {mov.quantity || 0}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-xs">
                      {formatMoney(mov.unitPrice || 0, displayCurrency, currencies)}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                      {formatMoney(mov.totalAmount || 0, displayCurrency, currencies)}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-[150px]" title={mov.notes || ""}>
                      {mov.notes || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
