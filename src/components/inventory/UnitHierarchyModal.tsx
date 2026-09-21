import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Tag,
  Boxes,
  RotateCcw,
  Zap,
} from "lucide-react";
import { ItemUnitHierarchy, ItemUnitLevel } from "../../types/erp";
import {
  YEMENI_UNIT_TEMPLATES,
  recalculateLevels,
  createHierarchyFromTemplate,
  formatHierarchyEquation,
} from "../../utils/unitHierarchyUtils";

interface UnitHierarchyModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseUnit: string;
  itemName?: string;
  initialHierarchy?: ItemUnitHierarchy;
  onSave: (hierarchy: ItemUnitHierarchy) => void;
  baseSellingPrice?: number;
  basePurchasePrice?: number;
  currencySymbol?: string;
  itemCode?: string;
  itemSellingPrice?: number;
  itemCostPrice?: number;
  currency?: any;
}

export const UnitHierarchyModal: React.FC<UnitHierarchyModalProps> = ({
  isOpen,
  onClose,
  baseUnit,
  itemName,
  initialHierarchy,
  onSave,
  baseSellingPrice = 0,
  basePurchasePrice = 0,
  currencySymbol = "ر.ي",
}) => {
  const [currentBaseUnit, setCurrentBaseUnit] = useState(baseUnit || "كرتون");
  const [levels, setLevels] = useState<ItemUnitLevel[]>([]);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"builder" | "preview">("builder");

  // Common quick unit suggestions for Yemeni market
  const COMMON_UNITS = [
    "كرتون",
    "شدة",
    "حبة",
    "باكت",
    "قطعة",
    "طن",
    "كيس",
    "كيلو",
    "نصف كيلو",
    "جرام",
    "لفة",
    "ياردة",
    "متر",
    "سم",
    "تنكة",
    "جالون",
    "لتر",
    "مل",
    "برميل",
    "سيخ",
    "علبة",
    "طرد",
    "درزن",
  ];

  useEffect(() => {
    if (isOpen) {
      const activeBase = initialHierarchy?.baseUnit || baseUnit || "كرتون";
      setCurrentBaseUnit(activeBase);
      setNotes(initialHierarchy?.notes || "");

      if (initialHierarchy?.levels && initialHierarchy.levels.length > 0) {
        // Ensure levels are recalculated with current base unit
        const updated = recalculateLevels(initialHierarchy.levels, activeBase);
        setLevels(updated);
      } else {
        // Default 3 levels: e.g. كرتون -> شدة -> حبة
        const defaultLevels: ItemUnitLevel[] = [
          {
            id: `lvl-1-${Date.now()}`,
            level: 1,
            unitName: activeBase,
            conversionFactor: 1,
            cumulativeFactor: 1,
            isActive: true,
          },
          {
            id: `lvl-2-${Date.now() + 1}`,
            level: 2,
            unitName: activeBase === "طن" ? "كيس" : activeBase === "كيس" ? "كيلو" : "شدة",
            conversionFactor: activeBase === "طن" ? 20 : activeBase === "كيس" ? 50 : 12,
            cumulativeFactor: activeBase === "طن" ? 20 : activeBase === "كيس" ? 50 : 12,
            isActive: true,
          },
          {
            id: `lvl-3-${Date.now() + 2}`,
            level: 3,
            unitName: activeBase === "طن" ? "كيلو" : activeBase === "كيس" ? "نصف كيلو" : "حبة",
            conversionFactor: activeBase === "طن" ? 50 : activeBase === "كيس" ? 2 : 10,
            cumulativeFactor: activeBase === "طن" ? 1000 : activeBase === "كيس" ? 100 : 120,
            isActive: true,
          },
        ];
        setLevels(defaultLevels);
      }
    }
  }, [isOpen, initialHierarchy, baseUnit]);

  if (!isOpen) return null;

  // Handle changing conversion factor or unit name
  const handleLevelChange = (index: number, field: keyof ItemUnitLevel, value: any) => {
    const updated = [...levels];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    if (field === "unitName" && index === 0) {
      setCurrentBaseUnit(value);
    }

    const recalculated = recalculateLevels(updated, index === 0 ? value : currentBaseUnit);
    setLevels(recalculated);
  };

  // Add a new level to the hierarchy
  const handleAddLevel = () => {
    const nextLevelNum = levels.length + 1;
    const prevLevel = levels[levels.length - 1];

    let suggestedName = "حبة";
    let suggestedFactor = 10;

    if (prevLevel?.unitName === "كرتون") {
      suggestedName = "شدة";
      suggestedFactor = 12;
    } else if (prevLevel?.unitName === "شدة") {
      suggestedName = "حبة";
      suggestedFactor = 10;
    } else if (prevLevel?.unitName === "طن") {
      suggestedName = "كيس";
      suggestedFactor = 20;
    } else if (prevLevel?.unitName === "كيس") {
      suggestedName = "كيلو";
      suggestedFactor = 50;
    } else if (prevLevel?.unitName === "كيلو") {
      suggestedName = "نصف كيلو";
      suggestedFactor = 2;
    }

    const newLevel: ItemUnitLevel = {
      id: `lvl-${nextLevelNum}-${Date.now()}`,
      level: nextLevelNum,
      unitName: suggestedName,
      conversionFactor: suggestedFactor,
      cumulativeFactor: (prevLevel?.cumulativeFactor || 1) * suggestedFactor,
      isActive: true,
    };

    const updated = recalculateLevels([...levels, newLevel], currentBaseUnit);
    setLevels(updated);
  };

  // Remove a level (only level > 1)
  const handleRemoveLevel = (index: number) => {
    if (index === 0) return; // Cannot delete base level
    const updated = levels.filter((_, i) => i !== index);
    const recalculated = recalculateLevels(updated, currentBaseUnit);
    setLevels(recalculated);
  };

  // Apply a Yemeni market template
  const handleApplyTemplate = (tmpl: (typeof YEMENI_UNIT_TEMPLATES)[0]) => {
    const newHierarchy = createHierarchyFromTemplate(tmpl, currentBaseUnit || tmpl.baseUnit);
    setCurrentBaseUnit(newHierarchy.baseUnit);
    setLevels(newHierarchy.levels);
    setNotes(tmpl.description);
  };

  // Reset to default
  const handleReset = () => {
    const defaultTemplate = YEMENI_UNIT_TEMPLATES[0];
    handleApplyTemplate(defaultTemplate);
  };

  // Save changes
  const handleSave = () => {
    if (levels.length === 0) return;

    const finalLevels = recalculateLevels(levels, currentBaseUnit);
    const hierarchy: ItemUnitHierarchy = {
      baseUnit: currentBaseUnit,
      levels: finalLevels,
      notes: notes.trim() || undefined,
    };

    onSave(hierarchy);
    onClose();
  };

  const previewHierarchy: ItemUnitHierarchy = {
    baseUnit: currentBaseUnit,
    levels,
    notes,
  };

  const equationText = formatHierarchyEquation(previewHierarchy);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-emerald-950/80 px-5 py-3.5 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white text-base font-bold">
                  توزيعات الأصناف الهرمية
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60 font-mono">
                  {currentBaseUnit}
                </span>
              </div>
              <span className="text-xs text-slate-300">
                {itemName ? `للصنف: ${itemName}` : "تحديد ترابط الوحدات، معاملات التحويل، وتفكيك المخزون"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="إعادة التعيين إلى كرتون ← شدة ← حبة"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">افتراضي</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Top Quick Templates Selector (Yemeni Commerce Patterns) */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>قوالب السوق اليمني الجاهزة (بنقرة واحدة):</span>
              </span>
              <span className="text-[11px] text-slate-400">
                اختر قالباً للتعبئة الفورية
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {YEMENI_UNIT_TEMPLATES.map((tmpl) => {
                const isSelected = tmpl.baseUnit === currentBaseUnit && levels.length === tmpl.levels.length;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-amber-950/80 border-amber-500/80 text-amber-300 shadow-sm"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-amber-200"
                    }`}
                    title={tmpl.description}
                  >
                    <Boxes className="w-3 h-3 text-amber-400" />
                    <span>{tmpl.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Hierarchy Tree & Equation Display */}
          <div className="p-3.5 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 rounded-xl border border-emerald-900/50 shadow-inner space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>معادلة التوزيع والترابط التراكمي:</span>
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
                {levels.length} مستويات مترابطة
              </span>
            </div>

            {/* Glowing Equation Pill */}
            <div className="p-3 bg-slate-950/90 rounded-xl border border-emerald-800/40 flex items-center justify-center font-mono text-sm sm:text-base font-bold text-emerald-300 tracking-wide text-center">
              {equationText || "لم يتم تحديد مستويات بعد"}
            </div>

            {/* Visual Tree Line */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-1">
              {levels.map((lvl, idx) => (
                <React.Fragment key={lvl.id}>
                  <div className="flex flex-col items-center bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl text-center shadow-sm">
                    <span className="text-[10px] text-slate-400 font-semibold mb-0.5">
                      {idx === 0 ? "المستوى 1 (الأساس)" : `المستوى ${lvl.level}`}
                    </span>
                    <span className="text-sm font-bold text-slate-100">{lvl.unitName}</span>
                    <span className="text-[11px] text-amber-400 font-mono font-semibold">
                      = {lvl.cumulativeFactor.toLocaleString()} من الأساس
                    </span>
                  </div>

                  {idx < levels.length - 1 && (
                    <div className="flex flex-col items-center text-slate-500">
                      <ArrowRight className="w-4 h-4 text-amber-400 rotate-180" />
                      <span className="text-[10px] font-mono text-slate-400">
                        ×{levels[idx + 1]?.conversionFactor}
                      </span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Levels Editor Table / Cards */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>إعداد مستويات الهرم ومعاملات التحويل:</span>
              </span>
              <button
                type="button"
                onClick={handleAddLevel}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md shadow-emerald-950 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مستوى جديد (+)</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {levels.map((lvl, index) => {
                const isBase = index === 0;
                const prevLevel = index > 0 ? levels[index - 1] : null;

                // Calculated suggested prices based on base prices
                const suggestedSelling =
                  lvl.sellingPrice ||
                  (baseSellingPrice > 0
                    ? Math.round((baseSellingPrice / lvl.cumulativeFactor) * 100) / 100
                    : 0);

                return (
                  <div
                    key={lvl.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isBase
                        ? "bg-slate-950/80 border-amber-500/50"
                        : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Level Badge & Label */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-mono ${
                            isBase
                              ? "bg-amber-500 text-slate-950"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {lvl.level}
                        </span>
                        <div>
                          <span className="block font-bold text-slate-200">
                            {isBase ? "الوحدة الأساسية (المستوى 1)" : `المستوى ${lvl.level}`}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {isBase
                              ? "وحدة الجرد والتسعير الرئيسية"
                              : `معامل التحويل من (${prevLevel?.unitName})`}
                          </span>
                        </div>
                      </div>

                      {/* Level Conversion Configuration */}
                      <div className="flex-1 flex flex-wrap items-center gap-2">
                        {isBase ? (
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-slate-400 text-xs shrink-0">اسم الوحدة:</span>
                            <input
                              type="text"
                              value={lvl.unitName}
                              onChange={(e) => handleLevelChange(index, "unitName", e.target.value)}
                              placeholder="مثال: كرتون، طن، كيس..."
                              list="common-units-list"
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 w-36 font-semibold"
                            />
                            <span className="px-2 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 text-[11px] font-mono">
                              = 1 وحدة أساسية
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap flex-1">
                            <span className="text-slate-300 font-medium">
                              1 {prevLevel?.unitName} =
                            </span>
                            <input
                              type="number"
                              min="0.0001"
                              step="any"
                              value={lvl.conversionFactor}
                              onChange={(e) =>
                                handleLevelChange(
                                  index,
                                  "conversionFactor",
                                  parseFloat(e.target.value) || 1
                                )
                              }
                              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono font-bold w-20 text-center focus:outline-none focus:border-emerald-500"
                            />
                            <input
                              type="text"
                              value={lvl.unitName}
                              onChange={(e) => handleLevelChange(index, "unitName", e.target.value)}
                              placeholder="اسم الوحدة..."
                              list="common-units-list"
                              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-semibold w-28 focus:outline-none focus:border-emerald-500"
                            />
                            <span className="text-slate-400 text-[11px] font-mono">
                              (المعامل التراكمي: ×{lvl.cumulativeFactor})
                            </span>
                          </div>
                        )}

                        {/* Custom Selling Price (Optional) */}
                        <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 shrink-0">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] text-slate-400">سعر البيع:</span>
                          <input
                            type="number"
                            step="any"
                            value={suggestedSelling || ""}
                            onChange={(e) =>
                              handleLevelChange(
                                index,
                                "sellingPrice",
                                parseFloat(e.target.value) || undefined
                              )
                            }
                            placeholder="تلقائي"
                            className="bg-transparent border-none text-xs text-emerald-400 font-mono w-16 focus:outline-none text-left"
                            title="سعر بيع خاص بهذه الوحدة (أو اتركه للحساب التلقائي بالتناسب)"
                          />
                          <span className="text-[10px] text-slate-500">{currencySymbol}</span>
                        </div>

                        {/* Delete Action (Level > 1) */}
                        {!isBase && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLevel(index)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900 transition-colors shrink-0"
                            title="حذف هذا المستوى"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Datalist for Unit Autocomplete */}
          <datalist id="common-units-list">
            {COMMON_UNITS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>

          {/* Calculation Breakdown Example (Real-time Demonstration) */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
            <span className="text-xs font-bold text-slate-300 block">
              💡 مثال عملي على حركة المخزون والفواتير:
            </span>
            <div className="text-slate-400 text-[11px] leading-relaxed space-y-1">
              <p>
                • عند إدخال فاتورة بيع بكمية{" "}
                <span className="text-emerald-300 font-bold font-mono">
                  1 {currentBaseUnit}
                </span>
                ، سيتم خصم ما يعادلها تماماً في جميع المستويات (
                <span className="text-amber-300 font-mono font-bold">
                  {levels
                    .slice(1)
                    .map((l) => `${l.cumulativeFactor} ${l.unitName}`)
                    .join(" أو ")}
                </span>
                ).
              </p>
              <p>
                • عند البيع بوحدة{" "}
                <span className="text-cyan-300 font-bold font-mono">
                  {levels[levels.length - 1]?.unitName}
                </span>
                ، سيقوم النظام تلقائياً بخصم أجزاء الوحدة الأساسية بدقة متناهية وبدون أي تداخل.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>حفظ واعتماد التوزيعات الهرمية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
