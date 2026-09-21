import React, { useState } from "react";
import { Plus, X, ShoppingBag, FileSpreadsheet, Receipt, Package, Truck, Sparkles } from "lucide-react";
import { NavTab } from "./Sidebar";

interface MobileFloatingActionButtonProps {
  activeTab: NavTab | "HOME_HUB";
  onAction: (actionType: "INVOICE" | "JOURNAL" | "RECEIPT" | "PAYMENT" | "INVENTORY") => void;
  onOpenAi?: () => void;
}

export const MobileFloatingActionButton: React.FC<MobileFloatingActionButtonProps> = ({
  activeTab,
  onAction,
  onOpenAi,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // If in a specific module, we can either directly trigger or show speed-dial
  const handlePrimaryClick = () => {
    switch (activeTab) {
      case "SALES_RETURNS":
      case "CUSTOMERS_AR":
        onAction("INVOICE");
        break;
      case "JOURNAL_ENTRIES":
      case "GENERAL_LEDGER":
        onAction("JOURNAL");
        break;
      case "VOUCHERS":
      case "CASH_AND_BANK":
        setIsOpen(!isOpen);
        break;
      case "PURCHASES_RETURNS":
      case "VENDORS_AP":
        onAction("INVOICE");
        break;
      case "INVENTORY":
        onAction("INVENTORY");
        break;
      default:
        setIsOpen(!isOpen);
        break;
    }
  };

  return (
    <div className="lg:hidden fixed bottom-6 left-6 z-40 flex flex-col items-end">
      {/* Speed Dial Options Menu */}
      {isOpen && (
        <div className="flex flex-col items-start gap-2.5 mb-3 animate-fadeIn">
          {/* Action 1: New Invoice */}
          <button
            onClick={() => {
              onAction("INVOICE");
              setIsOpen(false);
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 text-xs font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
            </div>
            <span>+ فاتورة مبيعات جديدة</span>
          </button>

          {/* Action 2: New Journal Entry */}
          <button
            onClick={() => {
              onAction("JOURNAL");
              setIsOpen(false);
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-teal-600 text-white shadow-xl shadow-teal-600/30 text-xs font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
            </div>
            <span>+ قيد يومية محاسبي</span>
          </button>

          {/* Action 3: New Voucher Receipt */}
          <button
            onClick={() => {
              onAction("RECEIPT");
              setIsOpen(false);
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-cyan-600 text-white shadow-xl shadow-cyan-600/30 text-xs font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5 text-white" />
            </div>
            <span>+ سند قبض مالي</span>
          </button>

          {/* Action 4: New Voucher Payment */}
          <button
            onClick={() => {
              onAction("PAYMENT");
              setIsOpen(false);
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-rose-600 text-white shadow-xl shadow-rose-600/30 text-xs font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5 text-white" />
            </div>
            <span>+ سند صرف مالي</span>
          </button>

          {/* Action 5: New Inventory Item */}
          <button
            onClick={() => {
              onAction("INVENTORY");
              setIsOpen(false);
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-purple-600 text-white shadow-xl shadow-purple-600/30 text-xs font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-white" />
            </div>
            <span>+ صنف / حركة مخزون</span>
          </button>
        </div>
      )}

      {/* Main Floating Action Button */}
      <button
        onClick={handlePrimaryClick}
        aria-label="إجراء جديد سريع"
        title="إجراء سريع جديد"
        className={`w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 active:scale-90 transition-all duration-200 cursor-pointer border-2 border-emerald-400/40 ${
          isOpen ? "rotate-45 !from-rose-600 !to-rose-500 shadow-rose-600/30 border-rose-400" : ""
        }`}
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};
