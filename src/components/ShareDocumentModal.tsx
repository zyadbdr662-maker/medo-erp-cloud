import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Share2,
  Phone,
  Copy,
  Check,
  ExternalLink,
  Printer,
  X,
  Send,
  Sparkles,
  Smartphone,
  Info,
} from "lucide-react";
import { CurrencyCode, CurrencyInfo, Customer, Invoice, SystemSettings, Vendor, Voucher } from "../types/erp";
import {
  formatInvoiceMessage,
  formatStatementMessage,
  formatFinancialReportMessage,
  formatVoucherMessage,
  sendViaWhatsApp,
  sendViaSMS,
  copyShareText,
} from "../services/shareService";
import { TenantIsolationService } from "../services/tenantIsolationService";

export interface ShareData {
  type: "INVOICE" | "STATEMENT" | "REPORT" | "VOUCHER";
  data: any;
  recipientName?: string;
  recipientPhone?: string;
  reportSummary?: any;
  fiscalYear?: string;
  reportType?: "BALANCE_SHEET" | "INCOME_STATEMENT" | "TRIAL_BALANCE" | "CASH_FLOW";
}

interface ShareDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareData | null;
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  onOpenPrint?: () => void;
  systemSettings?: SystemSettings;
}

const COUNTRY_CODES = [
  { code: "967", name: "اليمن (+967)", flag: "🇾🇪" },
  { code: "966", name: "السعودية (+966)", flag: "🇸🇦" },
  { code: "968", name: "عُمان (+968)", flag: "🇴🇲" },
  { code: "971", name: "الإمارات (+971)", flag: "🇦🇪" },
  { code: "20", name: "مصر (+20)", flag: "🇪🇬" },
  { code: "962", name: "الأردن (+962)", flag: "🇯🇴" },
  { code: "965", name: "الكويت (+965)", flag: "🇰🇼" },
  { code: "974", name: "قطر (+974)", flag: "🇶🇦" },
  { code: "973", name: "البحرين (+973)", flag: "🇧🇭" },
  { code: "1", name: "أمريكا/كندا (+1)", flag: "🇺🇸" },
];

export const ShareDocumentModal: React.FC<ShareDocumentModalProps> = ({
  isOpen,
  onClose,
  shareData,
  currencies,
  displayCurrency,
  onOpenPrint,
  systemSettings,
}) => {
  const [activeChannel, setActiveChannel] = useState<"WHATSAPP" | "SMS">("WHATSAPP");
  const [selectedCountryCode, setSelectedCountryCode] = useState("967");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Derive tenant override
  const tenantOverride = systemSettings
    ? {
        nameAr: systemSettings.companyNameAr,
        nameEn: systemSettings.companyNameEn,
        phone: systemSettings.phone,
        address: systemSettings.address,
      }
    : undefined;

  // Initialize message based on payload
  useEffect(() => {
    if (!shareData) return;

    // Set phone number
    if (shareData.recipientPhone) {
      // Extract country code if present
      let raw = shareData.recipientPhone.replace(/[\s\-\(\)\+]/g, "");
      let detectedCode = "967";
      let localNum = raw;

      for (const cc of COUNTRY_CODES) {
        if (raw.startsWith(cc.code)) {
          detectedCode = cc.code;
          localNum = raw.substring(cc.code.length);
          break;
        }
      }
      setSelectedCountryCode(detectedCode);
      setPhoneNumber(localNum);
    } else {
      setPhoneNumber("");
    }

    generateMessageText(activeChannel);
  }, [shareData, activeChannel, displayCurrency, systemSettings]);

  if (!isOpen || !shareData) return null;

  const generateMessageText = (channel: "WHATSAPP" | "SMS") => {
    if (!shareData) return;
    let msg = "";

    switch (shareData.type) {
      case "INVOICE":
        msg = formatInvoiceMessage(shareData.data as Invoice, currencies, channel, tenantOverride);
        break;

      case "STATEMENT":
        const party = shareData.data as Customer | Vendor;
        const isCust = "creditLimit" in party || "terms" in party;
        msg = formatStatementMessage(
          party,
          isCust ? "CUSTOMER" : "VENDOR",
          currencies,
          channel,
          0,
          undefined,
          tenantOverride
        );
        break;

      case "REPORT":
        msg = formatFinancialReportMessage(
          shareData.reportType || "INCOME_STATEMENT",
          shareData.fiscalYear || "2026",
          shareData.reportSummary || {},
          displayCurrency,
          currencies,
          channel,
          tenantOverride
        );
        break;

      case "VOUCHER":
        msg = formatVoucherMessage(shareData.data as Voucher, currencies, channel, tenantOverride);
        break;

      default:
        msg = "بيانات المستند المالي - MeDo ERP";
    }

    setCustomMessage(msg);
  };

  const handleChannelSwitch = (channel: "WHATSAPP" | "SMS") => {
    setActiveChannel(channel);
    generateMessageText(channel);
  };

  const getFullPhoneNumber = (): string => {
    if (!phoneNumber) return "";
    let clean = phoneNumber.replace(/[\s\-\(\)\+]/g, "");
    if (clean.startsWith("0")) clean = clean.substring(1);
    return `${selectedCountryCode}${clean}`;
  };

  const handleSendWhatsApp = () => {
    sendViaWhatsApp(getFullPhoneNumber(), customMessage);
  };

  const handleSendSMS = () => {
    sendViaSMS(getFullPhoneNumber(), customMessage);
  };

  const handleCopy = async () => {
    const success = await copyShareText(customMessage);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getModalTitle = (): string => {
    switch (shareData.type) {
      case "INVOICE":
        const inv = shareData.data as Invoice;
        if (inv.type === "SALES_RETURN") return `مشاركة مرتجع مبيعات رقم ${inv.invoiceNumber}`;
        if (inv.type === "PURCHASE") return `مشاركة فاتورة مشتريات رقم ${inv.invoiceNumber}`;
        if (inv.type === "PURCHASE_RETURN") return `مشاركة مرتجع مشتريات رقم ${inv.invoiceNumber}`;
        return `مشاركة فاتورة مبيعات رقم ${inv.invoiceNumber}`;
      case "STATEMENT":
        return `مشاركة كشف حساب (${shareData.recipientName || "العميل/المورد"})`;
      case "REPORT":
        return `مشاركة القائمة المالية (${shareData.reportType === "BALANCE_SHEET" ? "الميزانية العمومية" : shareData.reportType === "INCOME_STATEMENT" ? "قائمة الدخل" : "ميزان المراجعة"})`;
      case "VOUCHER":
        const v = shareData.data as Voucher;
        return `مشاركة سند ${v.type === "RECEIPT" ? "قبض" : "صرف"} رقم ${v.voucherNumber}`;
      default:
        return "مشاركة المستند المالي";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 text-right animate-in zoom-in-95 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{getModalTitle()}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {tenantOverride?.nameAr || TenantIsolationService.getActiveTenantDetails().nameAr}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                إرسال ومشاركة فورية عبر تطبيق واتساب أو الرسائل النصية القصيرة (SMS)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Switch Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => handleChannelSwitch("WHATSAPP")}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeChannel === "WHATSAPP"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="text-base">🟢</span>
            <span>واتساب (WhatsApp)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
              تنسيق منسق وغني
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleChannelSwitch("SMS")}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeChannel === "SMS"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="w-4 h-4 text-blue-300" />
            <span>رسالة نصية (SMS)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-500/40">
              موجز للأجهزة
            </span>
          </button>
        </div>

        {/* Recipient Information */}
        <div className="space-y-4 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 text-xs font-semibold">مفتاح الدولة</label>
              <select
                value={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1 text-xs font-semibold flex items-center justify-between">
                <span>رقم هاتف المستلم (WhatsApp / SMS)</span>
                {shareData.recipientName && (
                  <span className="text-emerald-400 text-[10px]">الجهة: {shareData.recipientName}</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="مثال: 777123456 أو 501234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-9 py-2 text-slate-200 text-xs font-mono text-left focus:outline-none focus:border-emerald-500"
                  dir="ltr"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Message Text Area / Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>نص الرسالة المعدة للإرسال (يمكنك التعديل والإضافة بحرية):</span>
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تم النسخ بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ النص بالكامل</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={9}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-slate-200 text-xs font-sans leading-relaxed focus:outline-none focus:border-emerald-500 shadow-inner resize-y font-mono whitespace-pre-wrap"
                dir="rtl"
              />
              <div className="absolute left-3 bottom-3 text-[10px] text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">
                {customMessage.length} حرف
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {onOpenPrint && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPrint();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>معاينة الطباعة الرسمية</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? "تم النسخ" : "نسخ النص"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium transition-colors"
            >
              إلغاء
            </button>

            {activeChannel === "WHATSAPP" ? (
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/60 active:scale-95"
              >
                <span className="text-sm">🟢</span>
                <span>فتح وإرسال عبر واتساب (Send WhatsApp)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendSMS}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-950/60 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال رسالة نصية SMS</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
