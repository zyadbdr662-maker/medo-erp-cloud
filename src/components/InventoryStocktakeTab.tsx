import React, { useState } from "react";
import { InventoryItem, StockMovement, CurrencyInfo, CurrencyCode, JournalEntry } from "../types/erp";
import { formatMoney } from "../services/erpStorage";
import { Search, Save, Package, Scale, ArrowRightLeft } from "lucide-react";

interface InventoryStocktakeTabProps {
  inventoryItems?: InventoryItem[];
  currencies?: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  onAddStockMovement: (movement: StockMovement, updatedQty?: number) => void;
  onUpdateInventoryItem: (item: InventoryItem) => void;
  onSaveJournalEntry?: (entry: JournalEntry) => void;
}

export const InventoryStocktakeTab: React.FC<InventoryStocktakeTabProps> = ({
  inventoryItems = [],
  currencies = [],
  displayCurrency,
  onAddStockMovement,
  onUpdateInventoryItem,
  onSaveJournalEntry,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [physicalCount, setPhysicalCount] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  const safeItems = Array.isArray(inventoryItems) ? inventoryItems : [];
  const searchLower = (searchTerm || "").trim().toLowerCase();

  const filteredItems = safeItems.filter((item) => {
    if (!item) return false;
    const name = (item.nameAr || "").toLowerCase();
    const code = (item.code || "").toLowerCase();
    const barcode = (item.barcode || "").toLowerCase();
    return !searchLower || name.includes(searchLower) || code.includes(searchLower) || barcode.includes(searchLower);
  });

  const difference = typeof physicalCount === "number" ? physicalCount - (selectedItem?.quantityOnHand || 0) : 0;
  const absDifference = Math.abs(difference);

  const handlePostAdjustment = () => {
    if (!selectedItem || typeof physicalCount !== "number" || difference === 0) {
      alert("يرجى تحديد صنف وإدخال كمية جرد فعلية تختلف عن رصيد النظام");
      return;
    }

    const isSurplus = difference > 0;
    const movementType = isSurplus ? "ADJUSTMENT_ADD" : "ADJUSTMENT_SUB";
    
    // 1. Create Stock Movement
    const newMovement: StockMovement = {
      id: `sm-adj-${Date.now()}`,
      itemId: selectedItem.id,
      itemCode: selectedItem.code,
      itemNameAr: selectedItem.nameAr,
      type: movementType,
      quantity: absDifference,
      unitPrice: selectedItem.costPrice,
      totalAmount: absDifference * selectedItem.costPrice,
      date: new Date().toISOString().slice(0, 10),
      referenceNumber: `ADJ-${Date.now().toString().slice(-6)}`,
      notes: notes || `تسوية جرد فعلي (${isSurplus ? "فائض" : "عجز"})`,
      createdBy: "أمين المخزن",
    };

    onAddStockMovement(newMovement, physicalCount);

    // 2. Create Journal Entry if possible
    if (onSaveJournalEntry) {
      const inventoryAccount = "1200"; // حساب المخزون
      const adjustmentAccount = "5900"; // حساب تسويات جردية / فوارق جرد

      const totalValue = absDifference * selectedItem.costPrice;

      const journalEntry: JournalEntry = {
        id: `JE-ADJ-${Date.now()}`,
        entryNumber: `JV-ADJ-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().slice(0, 10),
        period: new Date().toISOString().slice(0, 7),
        type: "ADJUSTMENT",
        description: `تسوية جردية للصنف (${selectedItem.nameAr}) - ${isSurplus ? "فائض جردي" : "عجز جردي"}`,
        currency: selectedItem.currency,
        lines: [
          {
            id: `line1-${Date.now()}`,
            accountId: inventoryAccount,
            accountCode: inventoryAccount,
            accountNameAr: "المخزون السلعي",
            debit: isSurplus ? totalValue : 0,
            credit: isSurplus ? 0 : totalValue,
            currency: selectedItem.currency,
            exchangeRate: 1,
            memo: `تسوية كمية المخزون (الفرق: ${absDifference})`,
          },
          {
            id: `line2-${Date.now()}`,
            accountId: adjustmentAccount,
            accountCode: adjustmentAccount,
            accountNameAr: "فوارق تسويات جردية",
            debit: isSurplus ? 0 : totalValue,
            credit: isSurplus ? totalValue : 0,
            currency: selectedItem.currency,
            exchangeRate: 1,
            memo: `إثبات ${isSurplus ? "فائض" : "عجز"} الجرد الفعلي`,
          }
        ],
        totalDebit: totalValue,
        totalCredit: totalValue,
        status: "POSTED",
        createdBy: "النظام الآلي - تسويات المخزون",
        createdAt: new Date().toISOString(),
      };
      
      onSaveJournalEntry(journalEntry);
    }

    alert(`تمت تسوية المخزون بنجاح!\nالرصيد الجديد: ${physicalCount}`);
    setSelectedItem(null);
    setPhysicalCount("");
    setNotes("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-200">
      
      {/* 1. Item Selection */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[600px]">
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-emerald-400" />
            اختيار الصنف للجرد
          </h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="بحث للفلترة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:border-emerald-500 text-white"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setSelectedItem(item); setPhysicalCount(item.quantityOnHand); setNotes(""); }}
              className={`w-full text-right p-3 rounded-xl transition-all border ${
                selectedItem?.id === item.id 
                  ? "bg-purple-500/20 border-purple-500/50 ring-1 ring-purple-500/40" 
                  : "bg-slate-950 border-slate-800 hover:bg-slate-900"
              }`}
            >
              <div className="font-bold text-white text-sm">{item.nameAr}</div>
              <div className="flex items-center justify-between mt-1 text-xs text-slate-400 font-mono">
                <span>{item.code}</span>
                <span>رصيد: {item.quantityOnHand}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Stocktake Form & Variance Analysis */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
          <Scale className="w-5 h-5 text-purple-400" />
          بطاقة الجرد الفعلي ومطابقة الأرصدة
        </h3>

        {!selectedItem ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 space-y-3">
            <Search className="w-12 h-12 opacity-20" />
            <p>يرجى اختيار صنف من القائمة الجانبية لبدء الجرد</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* System Balance Card */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">الرصيد الدفتري (النظام)</div>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  {selectedItem.quantityOnHand} <span className="text-sm font-normal text-slate-500">{selectedItem.unit}</span>
                </div>
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-400">تكلفة الوحدة</div>
                <div className="text-base font-bold text-slate-300 font-mono mt-1">
                  {formatMoney(selectedItem.costPrice, selectedItem.currency, currencies)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">الجرد الفعلي (Physical Count)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={physicalCount}
                    onChange={(e) => setPhysicalCount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-purple-500/50 rounded-xl p-3 text-lg font-black text-white font-mono focus:border-purple-400 focus:ring-1 focus:ring-purple-400 shadow-inner"
                    placeholder="أدخل الكمية الفعلية..."
                    min="0"
                    step="0.01"
                  />
                  <div className="absolute left-3 top-3.5 text-slate-400 font-bold text-sm">
                    {selectedItem.unit}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">مقدار الفارق (Variance)</label>
                <div className={`p-3 rounded-xl border flex items-center justify-between font-mono font-black text-lg ${
                  difference === 0 
                    ? "bg-slate-950 border-slate-800 text-slate-400" 
                    : difference > 0
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}>
                  <span>{difference === 0 ? "متطابق" : difference > 0 ? "فائض جردي +" : "عجز جردي -"}</span>
                  <span>{absDifference}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">ملاحظات وسبب التسوية</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-purple-500"
                placeholder="أدخل سبب العجز أو الزيادة (تلف، ضياع، إدخال خاطئ...)"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
              <button
                onClick={handlePostAdjustment}
                disabled={difference === 0 || physicalCount === ""}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Save className="w-5 h-5" />
                <span>اعتماد التسوية وإنشاء قيد الفروقات</span>
              </button>
            </div>

            {difference !== 0 && (
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>الأثر المالي المباشر للتسوية:</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>قيمة {difference > 0 ? "الفائض المضافة للمخزون" : "العجز المخصومة من المخزون"}:</span>
                  <span className="font-mono font-bold text-white">
                    {formatMoney(absDifference * selectedItem.costPrice, selectedItem.currency, currencies)}
                  </span>
                </div>
                <p className="text-slate-500 mt-2 border-t border-slate-800 pt-2 leading-relaxed">
                  * سيتم إنشاء قيد يومية آلي من حساب (المخزون السلعي) إلى حساب (فوارق تسويات جردية) لإثبات الأثر المالي وفق المعايير المحاسبية.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
