import React, { useState } from "react";
import { X, Plus, User, Phone, MapPin, Coins, ShieldCheck } from "lucide-react";
import { Customer, CurrencyCode, CurrencyInfo, ExchangeAccount } from "../../types/erp";

interface ExchangeNewAccountModalProps {
  customers: Customer[];
  currencies: CurrencyInfo[];
  existingAccounts: ExchangeAccount[];
  onClose: () => void;
  onCreateAccount: (newAccount: {
    customerId: string;
    customerNameAr: string;
    accountNumber: string;
    phone: string;
    currency: CurrencyCode;
    initialBalance: number;
    minBalance: number;
    city: string;
    address: string;
  }) => void;
}

export const ExchangeNewAccountModal: React.FC<ExchangeNewAccountModalProps> = ({
  customers,
  currencies,
  existingAccounts,
  onClose,
  onCreateAccount,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers[0]?.id || ""
  );
  const [currency, setCurrency] = useState<CurrencyCode>("YER_SANAA");
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [minBalance, setMinBalance] = useState<number>(0);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Generate unique account number like EX-2026-004
  const nextAccNum = `EX-2026-${String(existingAccounts.length + 1).padStart(3, "0")}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    onCreateAccount({
      customerId: selectedCustomer.id,
      customerNameAr: selectedCustomer.nameAr,
      accountNumber: nextAccNum,
      phone: selectedCustomer.phone || "0967773586047",
      currency,
      initialBalance: Number(initialBalance) || 0,
      minBalance: Number(minBalance) || 0,
      city: selectedCustomer.city || "صنعاء",
      address: selectedCustomer.address || "المركز الرئيسي",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                فتح حساب صرافة وأمانات جديد
              </h3>
              <p className="text-xs text-slate-400">
                رقم الحساب التلقائي: {nextAccNum}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              اختيار العميل المستفيد:
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:border-amber-500 focus:outline-none"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameAr} - {c.city} ({c.phone || "بدون هاتف"})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                عملة الحساب:
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
              >
                <option value="YER_SANAA">ريال يمني (صنعاء)</option>
                <option value="YER_ADEN">ريال يمني (عدن)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="USD">دولار أمريكي (USD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                الرصيد الافتتاحي (الإيداع الأولي):
              </label>
              <input
                type="number"
                min="0"
                value={initialBalance}
                onChange={(e) => setInitialBalance(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                الحد الأدنى للرصيد (Min Balance):
              </label>
              <input
                type="number"
                min="0"
                value={minBalance}
                onChange={(e) => setMinBalance(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                الهاتف المعتمد للإشعارات:
              </label>
              <input
                type="text"
                defaultValue={selectedCustomer?.phone || "0967773586047"}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
                readOnly
              />
            </div>
          </div>

          <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl text-xs text-amber-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>ميثاق الحسابات الجارية وأمانات الصرافة:</span>
            </div>
            <p className="text-[11px] text-slate-300">
              يتم قيد المبالغ تلقائياً في دليل الحسابات وتخصيص كشف حساب لحظي، مع تفعيل إشعارات الواتساب والرسائل النصية لكل عملية إيداع وسحب ومشتريات.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-600/20"
            >
              فتح وتفعيل الحساب
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
