import React, { useState } from "react";
import {
  X,
  CreditCard,
  Calendar,
  Wallet,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Partner, PartnerWithdrawal, Account } from "../../types/erp";
import { soundService } from "../../services/notificationSoundService";

interface PartnerWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: Partner[];
  accounts: Account[];
  preSelectedPartnerId?: string;
  onSaveWithdrawal: (
    withdrawal: Omit<PartnerWithdrawal, "id">,
    createJournalEntry: boolean
  ) => void;
}

export const PartnerWithdrawalModal: React.FC<PartnerWithdrawalModalProps> = ({
  isOpen,
  onClose,
  partners,
  accounts,
  preSelectedPartnerId,
  onSaveWithdrawal,
}) => {
  if (!isOpen) return null;

  const [partnerId, setPartnerId] = useState(preSelectedPartnerId || partners[0]?.id || "");
  const [amount, setAmount] = useState<number>(200000);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK">("CASH");
  const [description, setDescription] = useState("");
  const [autoPostJournal, setAutoPostJournal] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const selectedPartner = partners.find((p) => p.id === partnerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId) {
      setErrorMsg("يرجى تحديد الشريك");
      return;
    }
    if (amount <= 0) {
      setErrorMsg("يرجى إدخال مبلغ سحب صحيح أكبر من الصفر");
      return;
    }

    const desc = description.trim() || `سحب نقدي للشريك ${selectedPartner?.name} على ذمة جاري الأرباح`;

    onSaveWithdrawal(
      {
        partnerId,
        partnerName: selectedPartner?.name || "شريك",
        amount,
        date,
        description: desc,
        paymentMethod,
        status: "PAID",
      },
      autoPostJournal
    );

    soundService.playSound("CASH_FLOW_PULSE");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                تسجيل مسحوبات شريك (جاري مدين)
              </h2>
              <p className="text-xs text-slate-400">
                صرف مبالغ شخصية للشريك وخصمها من رصيده أو أرباحه المستحقة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Partner Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              الشريك *
            </label>
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (الحصة: {p.sharePercentage}% - رأس المال المدفوع: {p.paidCapital.toLocaleString()} ريال)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Method */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                طريقة الصرف *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
              >
                <option value="CASH">نقداً من الصندوق الرئيسي</option>
                <option value="BANK">تحويل بنكي رسمي</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                تاريخ السحب *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              المبلغ المسحوب (ريال يمني) *
            </label>
            <input
              type="number"
              min="1000"
              step="1000"
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors font-mono"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              بيان وسبب السحب
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: سحب نقدي لمصاريف شخصية على حساب الأرباح"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
            />
          </div>

          {/* Auto Journal Entry Toggle */}
          <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl flex items-start gap-3">
            <input
              type="checkbox"
              id="autoPostJournalWithdraw"
              checked={autoPostJournal}
              onChange={(e) => setAutoPostJournal(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-amber-600 bg-slate-950 border-slate-800 focus:ring-amber-500"
            />
            <div>
              <label htmlFor="autoPostJournalWithdraw" className="text-xs font-bold text-amber-300 cursor-pointer">
                توليد وترحيل قيد يومية تلقائي
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                من حـ/ جاري الشريك (مسحوبات) {selectedPartner?.name} (مدين) إلى حـ/ الصندوق أو البنك (دائن)
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تسجيل السحب وترحيله</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
