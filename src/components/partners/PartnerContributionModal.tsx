import React, { useState } from "react";
import {
  X,
  Coins,
  Calendar,
  Building,
  CreditCard,
  FileCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Partner, PartnerContribution, PartnerContributionType, Account, JournalEntry } from "../../types/erp";
import { soundService } from "../../services/notificationSoundService";

interface PartnerContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: Partner[];
  accounts: Account[];
  preSelectedPartnerId?: string;
  onSaveContribution: (
    contribution: Omit<PartnerContribution, "id">,
    createJournalEntry: boolean
  ) => void;
}

export const PartnerContributionModal: React.FC<PartnerContributionModalProps> = ({
  isOpen,
  onClose,
  partners,
  accounts,
  preSelectedPartnerId,
  onSaveContribution,
}) => {
  if (!isOpen) return null;

  const [partnerId, setPartnerId] = useState(preSelectedPartnerId || partners[0]?.id || "");
  const [contributionType, setContributionType] = useState<PartnerContributionType>("CASH");
  const [amount, setAmount] = useState<number>(1000000);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [referenceAccount, setReferenceAccount] = useState("110101"); // صندوق المركز الرئيسي
  const [autoPostJournal, setAutoPostJournal] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const selectedPartner = partners.find((p) => p.id === partnerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId) {
      setErrorMsg("يرجى اختيار الشريك");
      return;
    }
    if (amount <= 0) {
      setErrorMsg("يرجى إدخال مبلغ مساهمة صحيح أكبر من الصفر");
      return;
    }

    const desc = description.trim() || `مساهمة رأس مال جديدة - ${selectedPartner?.name} (${contributionType === "CASH" ? "نقداً" : contributionType === "IN_KIND" ? "عينية/أصول" : "أخرى"})`;

    onSaveContribution(
      {
        partnerId,
        partnerName: selectedPartner?.name || "شريك",
        contributionType,
        amount,
        date,
        description: desc,
        status: "PAID",
        referenceAccount,
      },
      autoPostJournal
    );

    soundService.playSound("ROYAL_BANK_CHIME");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                تسجيل مساهمة / زيادة رأس مال
              </h2>
              <p className="text-xs text-slate-400">
                إيداع حصة نقدية أو عينية للشريك وتوثيق القيد المحاسبي
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
              الشريك المعني *
            </label>
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (الحصة: {p.sharePercentage}% - رأس المال: {p.capitalAmount.toLocaleString()} ريال)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Contribution Type */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                نوع المساهمة *
              </label>
              <select
                value={contributionType}
                onChange={(e) => setContributionType(e.target.value as PartnerContributionType)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
              >
                <option value="CASH">نقدية (صندوق / بنك)</option>
                <option value="ASSET">عينية (أصول ومعدات)</option>
                <option value="INTELLECTUAL">معنوية / فكرية / براءة اختراع</option>
                <option value="REAL_ESTATE">عقارية (مباني وأراضي)</option>
                <option value="SHARES">أسهم وسندات</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                تاريخ المساهمة *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              قيمة المساهمة (ريال يمني) *
            </label>
            <input
              type="number"
              min="1000"
              step="1000"
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors font-mono"
            />
          </div>

          {/* Receiving Account */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              الحساب المالي المستلم (المدين) *
            </label>
            <select
              value={referenceAccount}
              onChange={(e) => setReferenceAccount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
            >
              <option value="110101">110101 - الصندوق الرئيسي / الخزينة العامة</option>
              <option value="110201">110201 - بنك الكريمي الإسلامي</option>
              <option value="110202">110202 - بنك التضامن الإسلامي</option>
              <option value="120101">120101 - أصول ثابتة (مباني ومعدات عينية)</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              البيان والتوثيق
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: توريد دفعة نقدية لزيادة حصة رأس المال التأسيسي"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
            />
          </div>

          {/* Auto Journal Entry Toggle */}
          <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex items-start gap-3">
            <input
              type="checkbox"
              id="autoPostJournalContrib"
              checked={autoPostJournal}
              onChange={(e) => setAutoPostJournal(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-800 focus:ring-emerald-500"
            />
            <div>
              <label htmlFor="autoPostJournalContrib" className="text-xs font-bold text-emerald-300 cursor-pointer">
                توليد وترحيل قيد يومية تلقائي متوازن
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                من حـ/ الخزينة أو البنك (مدين) إلى حـ/ رأس مال الشريك {selectedPartner?.name} (دائن)
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
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تسجيل المساهمة وترحيلها</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
