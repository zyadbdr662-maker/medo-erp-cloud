import React, { useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Percent,
  Coins,
  Shield,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Partner, PartnerType } from "../../types/erp";
import { soundService } from "../../services/notificationSoundService";

interface PartnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (partnerData: Omit<Partner, "id" | "createdAt">, editId?: string) => void;
  partnerToEdit?: Partner | null;
  existingPartners: Partner[];
}

export const PartnerFormModal: React.FC<PartnerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  partnerToEdit,
  existingPartners,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(partnerToEdit?.name || "");
  const [nameEn, setNameEn] = useState(partnerToEdit?.nameEn || "");
  const [idNumber, setIdNumber] = useState(partnerToEdit?.idNumber || "");
  const [phone, setPhone] = useState(partnerToEdit?.phone || "");
  const [email, setEmail] = useState(partnerToEdit?.email || "");
  const [address, setAddress] = useState(partnerToEdit?.address || "صنعاء - الجمهورية اليمنية");
  const [partnerType, setPartnerType] = useState<PartnerType>(partnerToEdit?.partnerType || "GENERAL");
  const [sharePercentage, setSharePercentage] = useState<number>(partnerToEdit?.sharePercentage || 10);
  const [capitalAmount, setCapitalAmount] = useState<number>(partnerToEdit?.capitalAmount || 4000000);
  const [paidCapital, setPaidCapital] = useState<number>(partnerToEdit?.paidCapital || partnerToEdit?.capitalAmount || 4000000);
  const [joinDate, setJoinDate] = useState(partnerToEdit?.joinDate || new Date().toISOString().split("T")[0]);
  const [isActive, setIsActive] = useState<boolean>(partnerToEdit?.isActive ?? true);
  const [notes, setNotes] = useState(partnerToEdit?.notes || "");
  const [errorMsg, setErrorMsg] = useState("");

  // Calculate remaining available share percentage
  const totalOtherShares = existingPartners
    .filter((p) => p.id !== partnerToEdit?.id)
    .reduce((sum, p) => sum + p.sharePercentage, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("يرجى إدخال اسم الشريك بالكامل");
      return;
    }
    if (sharePercentage <= 0 || sharePercentage > 100) {
      setErrorMsg("نسبة الحصة يجب أن تكون بين 1% و 100%");
      return;
    }
    if (totalOtherShares + sharePercentage > 100) {
      setErrorMsg(`مجموع حصص الشركاء سيتجاوز 100% (الحصص الحالية لبقية الشركاء: ${totalOtherShares}%، المتاح كحد أقصى: ${100 - totalOtherShares}%)`);
      return;
    }

    const remaining = Math.max(0, capitalAmount - paidCapital);

    onSave(
      {
        name: name.trim(),
        nameEn: nameEn.trim() || undefined,
        idNumber: idNumber.trim() || "N/A",
        phone: phone.trim() || "N/A",
        email: email.trim() || "partner@medoerp.com",
        address: address.trim(),
        partnerType,
        sharePercentage,
        capitalAmount,
        paidCapital,
        remainingCapital: remaining,
        joinDate,
        isActive,
        notes: notes.trim(),
        currency: "YER_SANAA",
      },
      partnerToEdit?.id
    );

    soundService.playSound("ROYAL_BANK_CHIME");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {partnerToEdit ? "تعديل بيانات الشريك" : "إضافة شريك جديد للنظام"}
              </h2>
              <p className="text-xs text-slate-400">
                تسجيل بيانات الشريك وحصته في رأس المال وتوثيق المسؤولية القانونية
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                الاسم بالكامل (عربي) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أحمد عبدالله محمد"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Name En */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                الاسم بالإنجليزية (اختياري)
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Ahmed Abdullah"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
                dir="ltr"
              />
            </div>

            {/* Partner Type */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                نوع الشريك والمسؤولية *
              </label>
              <select
                value={partnerType}
                onChange={(e) => setPartnerType(e.target.value as PartnerType)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
              >
                <option value="MAIN">شريك رئيسي (مسؤولية كاملة - أكبر حصة)</option>
                <option value="GENERAL">شريك عادي / متضامن (مسؤولية تضامنية)</option>
                <option value="LIMITED">شريك موصي (مسؤولية محدودة - لا يتدخل في الإدارة)</option>
                <option value="WORKING">شريك عامل (يعمل بالشركة)</option>
                <option value="SILENT">شريك صامت (مستثمر غير نشط)</option>
                <option value="SHAREHOLDER">مساهم (شركة مساهمة)</option>
              </select>
            </div>

            {/* Share Percentage */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                نسبة الحصة في رأس المال (%) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  required
                  value={sharePercentage}
                  onChange={(e) => setSharePercentage(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                المتاح غير المحجوز: {(100 - totalOtherShares).toFixed(1)}%
              </p>
            </div>

            {/* Capital Amount */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                قيمة رأس المال المكتتب به (ريال يمني) *
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                required
                value={capitalAmount}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setCapitalAmount(val);
                  if (paidCapital > val) setPaidCapital(val);
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors font-mono"
              />
            </div>

            {/* Paid Capital */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                رأس المال المدفوع فعلياً (ريال يمني) *
              </label>
              <input
                type="number"
                min="0"
                max={capitalAmount}
                step="1000"
                required
                value={paidCapital}
                onChange={(e) => setPaidCapital(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                المتبقي: {(Math.max(0, capitalAmount - paidCapital)).toLocaleString()} ريال
              </p>
            </div>

            {/* ID Number */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                رقم الهوية الوطنية / جواز السفر
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="1234567890"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                رقم الجوال / الهاتف
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="777123456"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
                dir="ltr"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@example.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
                dir="ltr"
              />
            </div>

            {/* Join Date */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                تاريخ الانضمام / التأسيس
              </label>
              <input
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              العنوان والمدينة
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="صنعاء - شارع حدة"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              ملاحظات وشروط الاتفاقية
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات حول صلاحيات الإدارة أو شروط التخارج وسحب الأرباح..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Status Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActivePartner"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-800 focus:ring-emerald-500"
            />
            <label htmlFor="isActivePartner" className="text-xs text-slate-300 cursor-pointer font-medium">
              شريك نشط ومعتمد في قرارات الجمعية العمومية
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{partnerToEdit ? "حفظ التعديلات" : "اعتماد وإضافة الشريك"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
