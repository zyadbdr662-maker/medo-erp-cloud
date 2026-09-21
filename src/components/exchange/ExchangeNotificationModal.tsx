import React, { useState } from "react";
import {
  X,
  MessageCircle,
  Smartphone,
  Copy,
  Check,
  Printer,
  ExternalLink,
  PhoneCall,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { ExchangeTransaction, CurrencyInfo } from "../../types/erp";
import { formatMoney } from "../../services/erpStorage";

interface ExchangeNotificationModalProps {
  transaction: ExchangeTransaction | null;
  currencies: CurrencyInfo[];
  onClose: () => void;
  onPrint?: (tx: ExchangeTransaction) => void;
}

export const ExchangeNotificationModal: React.FC<ExchangeNotificationModalProps> = ({
  transaction,
  currencies,
  onClose,
  onPrint,
}) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const defaultPhone = "0967773586047";
  const clientPhone = transaction.customerPhone || defaultPhone;
  
  // Clean phone for whatsapp url (removing spaces, plus, hyphens)
  const cleanPhoneForWa = clientPhone.replace(/[^0-9]/g, "");

  const messageText = transaction.notificationMessage || `📱 شركة مجموعة بن زياد التجارية المتحدة

عميلنا العزيز ${transaction.customerNameAr}،

تم ${
    transaction.type === "DEPOSIT"
      ? "إيداع"
      : transaction.type === "WITHDRAW"
      ? "سحب"
      : transaction.type === "TRANSFER"
      ? "تحويل"
      : transaction.type === "PURCHASE"
      ? "شراء"
      : "تسوية"
  } مبلغ ${formatMoney(transaction.amount, transaction.currency, currencies)}
من حساب الصرافة الخاص بكم.

الرصيد الحالي: ${formatMoney(transaction.balanceAfter, transaction.currency, currencies)}

التاريخ: ${transaction.date}
رقم العملية: ${transaction.transactionNumber}

للتواصل: ${defaultPhone}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    const waUrl = cleanPhoneForWa
      ? `https://api.whatsapp.com/send?phone=${cleanPhoneForWa}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                إشعار العملية الفوري (SMS & WhatsApp)
              </h3>
              <p className="text-xs text-slate-400">
                رقم الإشعار: {transaction.transactionNumber}
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

        {/* Body / Phone Simulation */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>تم تنفيذ وقيد العملية بنجاح وتحديث الرصيد المحاسبي</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold">
              معتمد
            </span>
          </div>

          {/* Smartphone Simulator */}
          <div className="mx-auto max-w-xs rounded-3xl border-4 border-slate-800 bg-slate-950 p-4 shadow-xl relative">
            <div className="w-16 h-1.5 bg-slate-800 rounded-full mx-auto mb-3" />
            
            {/* Message Bubble */}
            <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-2xl p-3.5 space-y-2 text-xs text-slate-100 shadow">
              <div className="flex items-center justify-between text-[11px] text-emerald-400 border-b border-emerald-800/40 pb-1.5">
                <span className="font-bold">مجموعة بن زياد التجارية</span>
                <span>{transaction.time || "الآن"}</span>
              </div>
              <div className="whitespace-pre-line leading-relaxed font-sans text-slate-200 text-xs">
                {messageText}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>هاتف المستلم: {clientPhone}</span>
              <span className="text-emerald-400">● جاهز للإرسال</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleOpenWhatsApp}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>إرسال عبر واتساب الآن</span>
            </button>

            <button
              onClick={handleCopy}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                copied
                  ? "bg-amber-600/20 border-amber-500 text-amber-300"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "تم نسخ النص بنجاح!" : "نسخ نص رسالة SMS"}</span>
            </button>
          </div>

          {/* Additional quick actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
            <button
              onClick={() => onPrint && onPrint(transaction)}
              className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>طباعة إيصال العملية</span>
            </button>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
              <span>خدمة العملاء: {defaultPhone}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            إغلاق الإشعار
          </button>
        </div>
      </div>
    </div>
  );
};
