import React, { useState, useMemo } from "react";
import {
  X,
  Printer,
  Download,
  Search,
  Layers,
  Boxes,
  Package,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";
import { InventoryItem, CurrencyInfo } from "../../types/erp";
import {
  calculateStockInAllUnits,
  formatHierarchySummary,
  formatHierarchyEquation,
} from "../../utils/unitHierarchyUtils";
import { formatMoney } from "../../services/erpStorage";

interface MultiUnitInventoryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItems: InventoryItem[];
  currencies: CurrencyInfo[];
  companyName?: string;
}

export const MultiUnitInventoryReportModal: React.FC<MultiUnitInventoryReportModalProps> = ({
  isOpen,
  onClose,
  inventoryItems,
  currencies,
  companyName = "شركة الزرقاء النبيلة",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [onlyHierarchical, setOnlyHierarchical] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    inventoryItems.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return ["ALL", ...Array.from(set)];
  }, [inventoryItems]);

  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesSearch =
        (item.nameAr || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat =
        selectedCategory === "ALL" || item.category === selectedCategory;

      const matchesHierarchy =
        !onlyHierarchical ||
        (item.unitHierarchy?.levels && item.unitHierarchy.levels.length > 1);

      return matchesSearch && matchesCat && matchesHierarchy;
    });
  }, [inventoryItems, searchTerm, selectedCategory, onlyHierarchical]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      "كود الصنف",
      "اسم الصنف",
      "التصنيف",
      "الوحدة الأساسية",
      "الرصيد الأساسي",
      "معادلة التوزيع",
      "تفكيك الرصيد بجميع الوحدات",
      "تكلفة الوحدة",
      "القيمة الإجمالية",
    ];

    const rows = filteredItems.map((item) => {
      const stockBreakdown = calculateStockInAllUnits(
        item.quantityOnHand,
        item.unitHierarchy
      );
      const breakdownText = stockBreakdown
        .map((s) => `${s.quantity.toLocaleString()} ${s.unitName}`)
        .join(" | ");

      const equation = formatHierarchyEquation(item.unitHierarchy) || "وحدة مفردة";
      const totalVal = item.quantityOnHand * (item.costPrice || 0);

      return [
        `"${item.code}"`,
        `"${item.nameAr}"`,
        `"${item.category}"`,
        `"${item.unit}"`,
        item.quantityOnHand,
        `"${equation}"`,
        `"${breakdownText}"`,
        item.costPrice,
        totalVal,
      ].join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `تقرير_المخزون_متعدد_الوحدات_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-amber-950/80 px-5 py-4 border-b border-emerald-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white text-base font-bold">
                  تقرير المخزون الشامل بجميع الوحدات والتوزيعات الهرمية
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  {filteredItems.length} صنف
                </span>
              </div>
              <span className="text-xs text-slate-300">
                {companyName} - كشف تفصيلي بالأرصدة المتوفرة بكل وحدة (كرتون / شدة / حبة / كيس / كيلو)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              title="تصدير إلى ملف Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">تصدير CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              title="طباعة التقرير"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">طباعة</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث باسم الصنف، الباركود، أو الكود..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "ALL" ? "جميع التصنيفات" : c}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={onlyHierarchical}
              onChange={(e) => setOnlyHierarchical(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span>عرض الأصناف ذات التوزيعات الهرمية فقط</span>
          </label>
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto flex-1 p-4">
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">الصنف / الكود</th>
                  <th className="p-3">التصنيف</th>
                  <th className="p-3 text-center">الوحدة الأساسية</th>
                  <th className="p-3 text-center">الرصيد المتوفر</th>
                  <th className="p-3 min-w-[280px]">تفكيك الأرصدة بجميع الوحدات</th>
                  <th className="p-3 text-left">متوسط التكلفة</th>
                  <th className="p-3 text-left">القيمة الإجمالية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      لا توجد أصناف مطابقة لمعايير البحث الحالية
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const hasHierarchy =
                      item.unitHierarchy?.levels && item.unitHierarchy.levels.length > 1;
                    const stockBreakdown = calculateStockInAllUnits(
                      item.quantityOnHand,
                      item.unitHierarchy
                    );
                    const equation = formatHierarchyEquation(item.unitHierarchy);

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3">
                          <div className="font-bold text-slate-100">{item.nameAr}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {item.code} {item.barcode && `| ${item.barcode}`}
                          </div>
                        </td>

                        <td className="p-3 text-slate-300">{item.category}</td>

                        <td className="p-3 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-bold">
                            {item.unit}
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          <span
                            className={`font-mono font-bold text-sm ${
                              item.quantityOnHand <= (item.minStockThreshold || 0)
                                ? "text-rose-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {item.quantityOnHand.toLocaleString()}
                          </span>
                        </td>

                        <td className="p-3">
                          {hasHierarchy ? (
                            <div className="space-y-1.5">
                              {/* Summary Badges of all units */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {stockBreakdown.map((sb, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${
                                      sb.isBase
                                        ? "bg-amber-950/70 border-amber-700/60 text-amber-300"
                                        : "bg-slate-950 border-slate-700 text-emerald-300"
                                    }`}
                                  >
                                    <span>{sb.quantity.toLocaleString()}</span>
                                    <span className="font-normal text-slate-400 font-sans">
                                      {sb.unitName}
                                    </span>
                                  </span>
                                ))}
                              </div>

                              {/* Equation helper text */}
                              {equation && (
                                <div className="text-[10px] text-slate-400 font-mono">
                                  معادلة الصنف: {equation}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">
                              وحدة مفردة ({item.unit})
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-left font-mono text-slate-300">
                          {formatMoney(item.costPrice || 0, item.currency, currencies)}
                        </td>

                        <td className="p-3 text-left font-mono font-bold text-emerald-400">
                          {formatMoney(
                            item.quantityOnHand * (item.costPrice || 0),
                            item.currency,
                            currencies
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>
            إجمالي الأصناف المعروضة:{" "}
            <strong className="text-white font-mono">{filteredItems.length}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
