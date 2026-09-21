import React, { useState, useEffect } from "react";
import {
  Printer,
  X,
  Share2,
  Smartphone,
  Check,
  Copy,
  FileDown,
  Mail,
  Sun,
  Moon,
  FileText,
} from "lucide-react";
import { CurrencyCode, CurrencyInfo, SystemSettings } from "../types/erp";
import { formatMoney, formatNumberOnly } from "../services/erpStorage";
import {
  formatInvoiceMessage,
  formatVoucherMessage,
  sendViaWhatsApp,
  sendViaSMS,
  copyShareText,
} from "../services/shareService";
import { exportElementToPdf, getTodayFormattedDate } from "../services/pdfExporter";
import { QRCodeSVG } from "qrcode.react";
import { formatCalendarDate, formatDualDate } from "../utils/calendarUtils";
import { TenantIsolationService } from "../services/tenantIsolationService";

interface PrintDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: "JOURNAL" | "RECEIPT" | "PAYMENT" | "INVOICE" | null;
  documentData: any;
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  onOpenShareModal?: (data: any) => void;
  isDarkMode?: boolean;
  systemSettings?: SystemSettings;
}

export const PrintDocumentModal: React.FC<PrintDocumentModalProps> = ({
  isOpen,
  onClose,
  documentType,
  documentData,
  currencies,
  displayCurrency,
  onOpenShareModal,
  isDarkMode = true,
  systemSettings,
}) => {
  // Visual preview mode toggle: LIGHT (الوضع المشرق) vs DARK (الوضع الليلي)
  const [previewMode, setPreviewMode] = useState<"LIGHT" | "DARK">(isDarkMode ? "DARK" : "LIGHT");
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Electronic Signature state hooks
  const [sigType, setSigType] = useState<"NONE" | "TEXT" | "IMAGE">(
    () => systemSettings?.signatureType || (localStorage.getItem("mdo_print_sig_type") as "NONE" | "TEXT" | "IMAGE") || "TEXT"
  );
  const [sigText, setSigText] = useState(
    () => systemSettings?.signatureText || localStorage.getItem("mdo_print_sig_text") || "المدير العام: م. زياد بدر"
  );
  const [sigImage, setSigImage] = useState(
    () => systemSettings?.signatureImage || localStorage.getItem("mdo_print_sig_image") || ""
  );
  const [showSigSettings, setShowSigSettings] = useState(false);

  // Dynamic Branch Print & Header/Footer Customizer state
  const [showPrintCustomizer, setShowPrintCustomizer] = useState(false);
  const [paperFormat, setPaperFormat] = useState<"A4" | "THERMAL_80MM">("A4");

  const activeTenantDetails = TenantIsolationService.getActiveTenantDetails();

  const [headerCompanyAr, setHeaderCompanyAr] = useState(() => {
    return localStorage.getItem("mdo_print_header_ar") || systemSettings?.companyNameAr || activeTenantDetails.nameAr;
  });
  const [headerSubtitleAr, setHeaderSubtitleAr] = useState(() => {
    return localStorage.getItem("mdo_print_sub_ar") || "الفرع الرئيسي - قسم التوريدات والخدمات التجارية";
  });
  const [headerCompanyEn, setHeaderCompanyEn] = useState(() => {
    return localStorage.getItem("mdo_print_header_en") || systemSettings?.companyNameEn || activeTenantDetails.nameEn;
  });
  const [headerSubtitleEn, setHeaderSubtitleEn] = useState(() => {
    return localStorage.getItem("mdo_print_sub_en") || "Building Materials & Commercial Supplies";
  });
  const [headerPhone, setHeaderPhone] = useState(() => {
    return localStorage.getItem("mdo_print_phone") || systemSettings?.phone || activeTenantDetails.phone;
  });
  const [headerTaxReg, setHeaderTaxReg] = useState(() => {
    return localStorage.getItem("mdo_print_tax_reg") || `س.ت: ${systemSettings?.commercialRegister || activeTenantDetails.commercialReg} | ضريبي: ${systemSettings?.taxNumber || activeTenantDetails.taxNumber}`;
  });

  const [logoType, setLogoType] = useState<"DEFAULT_CREST" | "CUSTOM_IMAGE" | "TEXT_BADGE">(
    () => (localStorage.getItem("mdo_print_logo_type") as any) || "DEFAULT_CREST"
  );
  const [logoImage, setLogoImage] = useState<string>(
    () => localStorage.getItem("mdo_print_logo_img") || ""
  );
  const [footerTermsAr, setFooterTermsAr] = useState<string>(
    () => localStorage.getItem("mdo_print_footer_terms") || "البضاعة المباعة لا ترد ولا تستبدل إلا وفق الشروط المعتمدة | شكراً لتعاملكم معنا"
  );
  const [showWatermark, setShowWatermark] = useState<boolean>(
    () => localStorage.getItem("mdo_print_watermark_show") !== "false"
  );
  const [watermarkText, setWatermarkText] = useState<string>(
    () => localStorage.getItem("mdo_print_watermark_text") || "مستند معتمد رسمياً"
  );

  // Synchronize dynamic print fields when systemSettings or documentData changes
  useEffect(() => {
    const activeTenantMeta = TenantIsolationService.getActiveTenantDetails();
    const effectiveCompanyAr = systemSettings?.companyNameAr || activeTenantMeta.nameAr;
    const effectiveCompanyEn = systemSettings?.companyNameEn || activeTenantMeta.nameEn;
    const effectivePhone = systemSettings?.phone || activeTenantMeta.phone;
    const effectiveCr = systemSettings?.commercialRegister || activeTenantMeta.commercialReg;
    const effectiveTax = systemSettings?.taxNumber || activeTenantMeta.taxNumber;

    if (effectiveCompanyAr) {
      setHeaderCompanyAr(effectiveCompanyAr);
    }
    if (effectiveCompanyEn) {
      setHeaderCompanyEn(effectiveCompanyEn);
    }
    if (effectivePhone) {
      setHeaderPhone(effectivePhone);
    }
    if (effectiveCr || effectiveTax) {
      setHeaderTaxReg(`س.ت: ${effectiveCr || "---"} | ضريبي: ${effectiveTax || "---"}`);
    }
    if (documentData?.branchName || documentData?.branch) {
      const bName = documentData.branchName || documentData.branch;
      if (bName && typeof bName === "string" && !localStorage.getItem("mdo_print_sub_ar_user")) {
        setHeaderSubtitleAr(`فرع: ${bName} - قسم التوريدات والخدمات`);
      }
    }
  }, [systemSettings, documentData]);

  // Persist print customizer choices to localStorage
  useEffect(() => { localStorage.setItem("mdo_print_header_ar", headerCompanyAr); }, [headerCompanyAr]);
  useEffect(() => { localStorage.setItem("mdo_print_sub_ar", headerSubtitleAr); }, [headerSubtitleAr]);
  useEffect(() => { localStorage.setItem("mdo_print_header_en", headerCompanyEn); }, [headerCompanyEn]);
  useEffect(() => { localStorage.setItem("mdo_print_sub_en", headerSubtitleEn); }, [headerSubtitleEn]);
  useEffect(() => { localStorage.setItem("mdo_print_phone", headerPhone); }, [headerPhone]);
  useEffect(() => { localStorage.setItem("mdo_print_tax_reg", headerTaxReg); }, [headerTaxReg]);
  useEffect(() => { localStorage.setItem("mdo_print_logo_type", logoType); }, [logoType]);
  useEffect(() => {
    if (logoImage) localStorage.setItem("mdo_print_logo_img", logoImage);
    else localStorage.removeItem("mdo_print_logo_img");
  }, [logoImage]);
  useEffect(() => { localStorage.setItem("mdo_print_footer_terms", footerTermsAr); }, [footerTermsAr]);
  useEffect(() => { localStorage.setItem("mdo_print_watermark_show", String(showWatermark)); }, [showWatermark]);
  useEffect(() => { localStorage.setItem("mdo_print_watermark_text", watermarkText); }, [watermarkText]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoImage(reader.result as string);
        setLogoType("CUSTOM_IMAGE");
      };
      reader.readAsDataURL(file);
    }
  };

  // Synchronize when systemSettings changes
  useEffect(() => {
    if (systemSettings) {
      if (systemSettings.signatureType) setSigType(systemSettings.signatureType);
      if (systemSettings.signatureText) setSigText(systemSettings.signatureText);
      if (systemSettings.signatureImage !== undefined) setSigImage(systemSettings.signatureImage || "");
    }
  }, [systemSettings]);

  // Synchronize signature changes to localStorage
  useEffect(() => {
    localStorage.setItem("mdo_print_sig_type", sigType);
  }, [sigType]);

  useEffect(() => {
    localStorage.setItem("mdo_print_sig_text", sigText);
  }, [sigText]);

  useEffect(() => {
    if (sigImage) {
      localStorage.setItem("mdo_print_sig_image", sigImage);
    } else {
      localStorage.removeItem("mdo_print_sig_image");
    }
  }, [sigImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSigImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Synchronize with external theme when opening
  useEffect(() => {
    if (isOpen) {
      setPreviewMode(isDarkMode ? "DARK" : "LIGHT");
    }
  }, [isOpen, isDarkMode]);

  if (!isOpen || !documentType || !documentData) return null;

  const isLight = previewMode === "LIGHT";

  // Palette constants according to executive specifications:
  // Light Mode:
  // - Background: #FFFFFF
  // - Border: #E0E6ED
  // - Titles: #0A2540
  // - Body: #1A2B4C
  // - Secondary (dates, meta): #4A5B6F
  // - Table Header: #0A2540 (bg) / #FFFFFF (text)
  // - Table Body: #1A2B4C
  // - Footer: #6B7A8F
  //
  // Dark Mode:
  // - Background: #1E2A3A
  // - Border: #2A3F5F
  // - Titles: #FFFFFF
  // - Body: #E8ECF1
  // - Secondary (dates, meta): #B0C4DE
  // - Table Header: #1A3A6A (bg) / #FFFFFF (text)
  // - Table Body: #E8ECF1
  // - Footer: #8A9BB0

  const colors = {
    canvasBg: isLight ? "#FFFFFF" : "#1E2A3A",
    border: isLight ? "#E0E6ED" : "#2A3F5F",
    cardBg: isLight ? "#F8FAFC" : "#162231",
    title: isLight ? "#0A2540" : "#FFFFFF",
    body: isLight ? "#1A2B4C" : "#E8ECF1",
    secondary: isLight ? "#4A5B6F" : "#B0C4DE",
    thBg: isLight ? "#0A2540" : "#1A3A6A",
    thText: "#FFFFFF",
    tdText: isLight ? "#1A2B4C" : "#E8ECF1",
    tdAltBg: isLight ? "#F8FAFC" : "#141D2B",
    tdTotalBg: isLight ? "#F1F5F9" : "#162231",
    signatureText: isLight ? "#0A2540" : "#FFFFFF",
    signatureLine: isLight ? "#4A5B6F" : "#B0C4DE",
    footerText: isLight ? "#6B7A8F" : "#8A9BB0",
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    const docNum =
      documentData.invoiceNumber ||
      documentData.voucherNumber ||
      documentData.entryNumber ||
      "001";
    const filename = `مستند_${documentType}_${docNum}_${new Date().toISOString().split("T")[0]}.pdf`;
    await exportElementToPdf("printable-document-canvas", filename);
    setIsExporting(false);
  };

  const getShareText = (format: "WHATSAPP" | "SMS") => {
    const tenantOverride = systemSettings
      ? {
          nameAr: systemSettings.companyNameAr,
          nameEn: systemSettings.companyNameEn,
          phone: systemSettings.phone,
          address: systemSettings.address,
        }
      : undefined;

    if (documentType === "INVOICE") {
      return formatInvoiceMessage(documentData, currencies, format, tenantOverride);
    }
    if (documentType === "RECEIPT" || documentType === "PAYMENT") {
      return formatVoucherMessage(documentData, currencies, format, tenantOverride);
    }
    const compName = systemSettings?.companyNameAr || activeTenantDetails.nameAr;
    return `${compName} - مستند رسمي رقم ${
      documentData.voucherNumber || documentData.entryNumber || documentData.invoiceNumber
    }`;
  };

  const handleDirectWhatsApp = () => {
    const phone = documentData.customerPhone || documentData.vendorPhone || documentData.phone || "";
    const text = getShareText("WHATSAPP");
    sendViaWhatsApp(phone, text);
  };

  const handleDirectSMS = () => {
    const phone = documentData.customerPhone || documentData.vendorPhone || documentData.phone || "";
    const text = getShareText("SMS");
    sendViaSMS(phone, text);
  };

  const handleDirectEmail = () => {
    const text = getShareText("WHATSAPP");
    const compName = systemSettings?.companyNameAr || activeTenantDetails.nameAr;
    const subject = `مستند رسمي - ${compName}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      text
    )}`;
  };

  const handleCopyText = async () => {
    const text = getShareText("WHATSAPP");
    const ok = await copyShareText(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const docNumber =
    documentData.voucherNumber ||
    documentData.entryNumber ||
    documentData.invoiceNumber ||
    "JV-INV-SALES-2026-0004";

  const rawDate = documentData.date || documentData.issueDate || new Date().toISOString().split("T")[0];
  const docDate = formatCalendarDate(rawDate);
  const docDualTooltip = formatDualDate(rawDate);

  const todayPrintDate = getTodayFormattedDate();

  let docTitle = "سند قيد محاسبي عام (Journal)";
  if (documentType === "JOURNAL") {
    docTitle = "سند قيد محاسبي عام (Journal)";
  } else if (documentType === "RECEIPT") {
    docTitle = "سند قبض مالي رسمي (Receipt Voucher)";
  } else if (documentType === "PAYMENT") {
    docTitle = "سند صرف مالي رسمي (Payment Voucher)";
  } else if (documentType === "INVOICE") {
    if (documentData.type === "SALES_RETURN") {
      docTitle = "فاتورة مرتجع مبيعات رسمية (Sales Return Invoice)";
    } else if (documentData.type === "PURCHASE") {
      docTitle = "فاتورة مشتريات تجارية (Purchase Bill)";
    } else if (documentData.type === "PURCHASE_RETURN") {
      docTitle = "فاتورة مرتجع مشتريات (Purchase Return Invoice)";
    } else {
      docTitle = "فاتورة مبيعات ضريبية (Tax Sales Invoice)";
    }
  }

  const statementDescription =
    documentData.description ||
    documentData.notes ||
    (documentType === "INVOICE"
      ? `فاتورة مبيعات رقم ${docNumber} للعميل ${documentData.customerName || "العميل النقدي"}`
      : "قيد محاسبي معتمد في نظام المحاسبة والإدارة المتكامل");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in overflow-y-auto print:bg-transparent print:p-0 print:static">
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl p-4 sm:p-6 text-right animate-in zoom-in-95 my-4 sm:my-8 print:bg-transparent print:border-none print:shadow-none print:p-0 print:my-0 print:w-full print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ACTION TOOLBAR (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-6 print:hidden">
          {/* Right: Title and Light/Dark Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold text-white">معاينة المستند الرسمي</span>
            </div>

            {/* LIGHT / DARK MODE TOGGLE SWITCHER (Section 1 & 2 of user request) */}
            <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 shadow-inner">
              <button
                type="button"
                onClick={() => setPreviewMode("LIGHT")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  isLight
                    ? "bg-white text-[#0A2540] shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
                title="معاينة المستند في الوضع المشرق (Light Mode)"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>الوضع المشرق (Light)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewMode("DARK")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  !isLight
                    ? "bg-[#1A3A6A] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
                title="معاينة المستند في الوضع الليلي (Dark Mode)"
              >
                <Moon className="w-3.5 h-3.5 text-cyan-300" />
                <span>الوضع الليلي (Dark)</span>
              </button>
            </div>
          </div>

          {/* Left: Actions (Print, PDF, WhatsApp, SMS, Copy, Close) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Direct WhatsApp Share */}
            <button
              onClick={handleDirectWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              title="مشاركة سريعة عبر واتساب"
            >
              <span>🟢</span>
              <span className="hidden sm:inline">واتساب</span>
            </button>

            {/* Direct SMS Share */}
            <button
              onClick={handleDirectSMS}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              title="إرسال رسالة SMS"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SMS</span>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              title="نسخ تفاصيل المستند"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? "تم النسخ" : "نسخ"}</span>
            </button>

            {/* Full Share Options */}
            {onOpenShareModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenShareModal({
                    type:
                      documentType === "INVOICE"
                        ? "INVOICE"
                        : documentType === "RECEIPT" || documentType === "PAYMENT"
                        ? "VOUCHER"
                        : "JOURNAL",
                    data: documentData,
                    recipientName:
                      documentData.customerName ||
                      documentData.vendorName ||
                      documentData.beneficiaryOrPayer,
                    recipientPhone:
                      documentData.customerPhone ||
                      documentData.vendorPhone ||
                      documentData.phone,
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-800/40 text-xs font-bold transition-colors"
                title="خيارات المشاركة المتقدمة"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">مشاركة</span>
              </button>
            )}

            {/* Export as PDF Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
              title="تصدير المستند كملف PDF عالي الدقة"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExporting ? "جاري التصدير..." : "تصدير PDF"}</span>
            </button>

            {/* Custom Header & Logo Settings Button */}
            <button
              onClick={() => {
                setShowPrintCustomizer(!showPrintCustomizer);
                if (showSigSettings) setShowSigSettings(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-md active:scale-95 ${
                showPrintCustomizer
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              }`}
              title="تخصيص الهيدر والفوتر والشعار والعلامة المائية للطباعة"
            >
              <span>🎨</span>
              <span>تخصيص الهيدر والشعار</span>
            </button>

            {/* Signature Settings Button */}
            <button
              onClick={() => {
                setShowSigSettings(!showSigSettings);
                if (showPrintCustomizer) setShowPrintCustomizer(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-md active:scale-95 ${
                showSigSettings
                  ? "bg-amber-600 border-amber-500 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              }`}
              title="إعدادات التوقيع الإلكتروني المعتمد للمستند"
            >
              <span>✍️</span>
              <span>تعديل التوقيع</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              title="طباعة المستند الورقي الرسمي"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة (Print)</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ELECTRONIC SIGNATURE SETTINGS PANEL (Hidden in Print) */}
        {showSigSettings && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6 space-y-4 text-right animate-in slide-in-from-top-3 duration-200 print:hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-extrabold text-amber-400 flex items-center gap-2">
                <span>✍️</span>
                <span>إعدادات التوقيع الإلكتروني للمسؤول</span>
              </h4>
              <button 
                onClick={() => setShowSigSettings(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                إغلاق ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Selection */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-300">نوع التوقيع التلقائي:</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSigType("NONE")}
                    className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                      sigType === "NONE" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    يدوي ورقي
                  </button>
                  <button
                    type="button"
                    onClick={() => setSigType("TEXT")}
                    className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                      sigType === "TEXT" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    نصي رقمي
                  </button>
                  <button
                    type="button"
                    onClick={() => setSigType("IMAGE")}
                    className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                      sigType === "IMAGE" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    صورة توقيع
                  </button>
                </div>
              </div>

              {/* Text Input */}
              {sigType === "TEXT" && (
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300">الاسم والصفة الوظيفية المعتمدة بالتوقيع:</label>
                  <input
                    type="text"
                    value={sigText}
                    onChange={(e) => setSigText(e.target.value)}
                    placeholder="مثال: المدير العام: م. زياد بدر"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Image Input */}
              {sigType === "IMAGE" && (
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300">رفع صورة توقيع المسؤول (يفضل PNG شفافة):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-xs text-slate-400 file:mr-4 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-slate-900 file:text-slate-300 hover:file:bg-slate-800"
                    />
                    {sigImage && (
                      <button
                        onClick={() => setSigImage("")}
                        className="px-2 py-1 bg-red-950/40 border border-red-800/40 text-red-400 text-[10px] rounded-lg hover:bg-red-900/40 whitespace-nowrap"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-[10px] text-slate-400">
              * يتم حفظ تفاصيل التوقيع وتحديثها تلقائياً على كافة الفواتير والسندات في هذا المتصفح. ينصح باستخدام توقيع ذو خلفية شفافة للحصول على أفضل جودة طباعة.
            </p>
          </div>
        )}

        {/* DYNAMIC PRINT HEADER / FOOTER & LOGO CUSTOMIZER PANEL (Hidden in Print) */}
        {showPrintCustomizer && (
          <div className="bg-slate-950 border border-blue-900/60 rounded-2xl p-4 mb-6 space-y-4 text-right animate-in slide-in-from-top-3 duration-200 print:hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-extrabold text-blue-400 flex items-center gap-2">
                <span>🎨</span>
                <span>لوحة تخصيص الهيدر والشعار للطباعة لكل فرع (Dynamic Branch Header/Footer)</span>
              </h4>
              <button 
                onClick={() => setShowPrintCustomizer(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {/* Company/Branch Name Arabic */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">اسم المنشأة/الفرع (عربي):</label>
                <input
                  type="text"
                  value={headerCompanyAr}
                  onChange={(e) => setHeaderCompanyAr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="مجموعة بن زياد التجارية"
                />
              </div>

              {/* Subtitle/Activity Arabic */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">نشاط/عنوان الفرع (عربي):</label>
                <input
                  type="text"
                  value={headerSubtitleAr}
                  onChange={(e) => {
                    setHeaderSubtitleAr(e.target.value);
                    localStorage.setItem("mdo_print_sub_ar_user", "true");
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="الفرع الرئيسي - الكدوي"
                />
              </div>

              {/* Company/Branch Name English */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">اسم المنشأة/الفرع (بالإنجليزية):</label>
                <input
                  type="text"
                  value={headerCompanyEn}
                  onChange={(e) => setHeaderCompanyEn(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                  placeholder="Bin Ziad Commercial Group"
                />
              </div>

              {/* Phone numbers */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">أرقام الهواتف والتواصل:</label>
                <input
                  type="text"
                  value={headerPhone}
                  onChange={(e) => setHeaderPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="+967 773586047 | 715779976"
                />
              </div>

              {/* Tax & CR */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">السجل التجاري والرقم الضريبي:</label>
                <input
                  type="text"
                  value={headerTaxReg}
                  onChange={(e) => setHeaderTaxReg(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="س.ت: 7102030 | ضريبي: 300010020"
                />
              </div>

              {/* Logo Selection Mode */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">نمط شعار الهيدر (Logo Style):</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setLogoType("DEFAULT_CREST")}
                    className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                      logoType === "DEFAULT_CREST" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    شعار رسمي
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoType("CUSTOM_IMAGE")}
                    className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                      logoType === "CUSTOM_IMAGE" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    صورة شعار
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoType("TEXT_BADGE")}
                    className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                      logoType === "TEXT_BADGE" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    شارة نصية
                  </button>
                </div>
              </div>

              {/* Custom Logo File Uploader */}
              {logoType === "CUSTOM_IMAGE" && (
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">رفع صورة شعار الفرع (PNG / JPG):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="block w-full text-xs text-slate-400 file:mr-4 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-slate-900 file:text-slate-300 hover:file:bg-slate-800"
                    />
                    {logoImage && (
                      <button
                        type="button"
                        onClick={() => { setLogoImage(""); setLogoType("DEFAULT_CREST"); }}
                        className="px-2 py-1 bg-red-950/40 border border-red-800/40 text-red-400 text-[10px] rounded-lg hover:bg-red-900/40 whitespace-nowrap"
                      >
                        حذف الشعار
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Footer Terms */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 mb-1">شروط وملاحظات الفوتر المطبوع:</label>
                <input
                  type="text"
                  value={footerTermsAr}
                  onChange={(e) => setFooterTermsAr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="البضاعة المباعة لا ترد ولا تستبدل إلا وفق الشروط المعتمدة"
                />
              </div>

              {/* Watermark & Paper size */}
              <div className="flex items-center justify-between sm:col-span-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showWatermarkCheck"
                    checked={showWatermark}
                    onChange={(e) => setShowWatermark(e.target.checked)}
                    className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                  />
                  <label htmlFor="showWatermarkCheck" className="text-slate-200 text-xs font-bold cursor-pointer">
                    إظهار العلامة المائية الشفافة (Watermark)
                  </label>
                  {showWatermark && (
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 text-xs text-amber-400 w-44 focus:outline-none"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-300 text-xs font-bold">قياس الورق:</span>
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPaperFormat("A4")}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        paperFormat === "A4" ? "bg-blue-600 text-white" : "text-slate-400"
                      }`}
                    >
                      A4 رسمي
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaperFormat("THERMAL_80MM")}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        paperFormat === "THERMAL_80MM" ? "bg-amber-600 text-white" : "text-slate-400"
                      }`}
                    >
                      حراري POS (80mm)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* DOCUMENT CANVAS CONTAINER (Light Mode / Dark Mode / Print)    */}
        {/* ------------------------------------------------------------- */}
        <div
          id="printable-document-canvas"
          className={`doc-canvas doc-font-cairo p-6 sm:p-8 rounded-2xl shadow-xl border transition-colors duration-200 space-y-6 print:p-0 print:border-none print:shadow-none relative overflow-hidden ${
            isLight ? "doc-mode-light" : "doc-mode-dark"
          } ${paperFormat === "THERMAL_80MM" ? "doc-paper-thermal" : ""}`}
          style={{
            backgroundColor: colors.canvasBg,
            color: colors.body,
            borderColor: colors.border,
            fontFamily: "'Noto Naskh Arabic', 'Amiri', 'Droid Arabic Naskh', 'Traditional Arabic', sans-serif",
          }}
        >
          {/* Dynamic Branch Watermark in Print */}
          {showWatermark && (
            <div className="doc-print-watermark hidden print:block pointer-events-none select-none">
              {watermarkText}
            </div>
          )}

          {/* 1. Header with Dynamic Branch Branding */}
          <div
            className="flex items-start justify-between pb-4 border-b-2 gap-2"
            style={{ borderColor: "#D4AF37" }}
          >
            {/* Right Side: Arabic Header */}
            <div className="space-y-1 text-right flex-1">
              <h1
                className="doc-company-title font-extrabold text-base sm:text-lg"
                style={{ color: colors.title }}
              >
                🏢 {headerCompanyAr}
              </h1>
              <div
                className="doc-secondary-text text-[12px] font-bold"
                style={{ color: colors.secondary }}
              >
                {headerSubtitleAr}
              </div>
              <div
                className="doc-meta text-[11px]"
                style={{ color: colors.secondary }}
              >
                للتواصل: {headerPhone}
              </div>
              {headerTaxReg && (
                <div
                  className="doc-meta text-[10px] font-mono"
                  style={{ color: colors.secondary }}
                >
                  {headerTaxReg}
                </div>
              )}
            </div>

            {/* Middle: Dynamic Logo Display */}
            <div className="flex-shrink-0 mx-2 sm:mx-4 flex flex-col items-center justify-center">
              {logoType === "CUSTOM_IMAGE" && logoImage ? (
                <img
                  src={logoImage}
                  alt="شعار الفرع المعتمد"
                  className="max-h-16 max-w-[120px] object-contain"
                />
              ) : logoType === "TEXT_BADGE" ? (
                <div className="px-3 py-2 rounded-xl bg-[#0A2540] text-[#D4AF37] font-black text-xs border border-[#D4AF37] text-center shadow-md">
                  {headerCompanyAr.slice(0, 16)}
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[#0A2540] text-sap-secondary font-black flex flex-col items-center justify-center border-2 border-sap-secondary shadow-md">
                  <span className="text-xs font-mono tracking-tighter">MDOtkBZ</span>
                  <span className="text-[8px] text-sap-secondary/90">بن زياد</span>
                </div>
              )}
            </div>

            {/* Left Side: English Header */}
            <div className="text-left space-y-1 flex-1" dir="ltr">
              <h2
                className="font-extrabold text-[13px] sm:text-[14px]"
                style={{ color: colors.title }}
              >
                {headerCompanyEn}
              </h2>
              <div
                className="text-[11px] font-medium"
                style={{ color: colors.secondary }}
              >
                {headerSubtitleEn}
              </div>
              <div
                className="text-[11px]"
                style={{ color: colors.secondary }}
              >
                {headerPhone}
              </div>
            </div>
          </div>

          {/* 2. Document Title & Reference Bar */}
          <div
            className="p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 doc-card-bg"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
            }}
          >
            <div>
              <span
                className="text-[12px] block doc-meta"
                style={{ color: colors.secondary }}
              >
                نوع المستند:
              </span>
              <h2
                className="doc-title mt-0.5"
                style={{ color: colors.title }}
              >
                📄 {docTitle}
              </h2>
            </div>

            <div className="text-left space-y-1" dir="ltr">
              <div
                className="doc-number font-mono"
                style={{ color: colors.title }}
              >
                Reference No: <b>{docNumber}</b>
              </div>
              <div
                className="doc-date text-right"
                dir="rtl"
                title={docDualTooltip}
                style={{ color: colors.secondary }}
              >
                تاريخ الإصدار: <b>{docDate}</b>
              </div>
              <div
                className="doc-date text-right"
                dir="rtl"
                style={{ color: colors.secondary }}
              >
                تاريخ الطباعة: <b>{todayPrintDate}</b>
              </div>
            </div>
          </div>

          {/* 3. General Statement (البيان العام) - 15-16px Regular */}
          <div
            className="p-3.5 rounded-xl border doc-card-bg"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
            }}
          >
            <div
              className="doc-statement"
              style={{ color: colors.body }}
            >
              <span
                className="font-bold ml-1.5"
                style={{ color: colors.title }}
              >
                البيان العام:
              </span>
              <span>{statementDescription}</span>
            </div>
          </div>

          {/* 4. DOCUMENT BODY BASED ON TYPE */}

          {/* 4.1. JOURNAL VOUCHER (سند قيد محاسبي عام) */}
          {documentType === "JOURNAL" && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table
                  className="w-full border-collapse text-right doc-table"
                  style={{ borderColor: colors.border }}
                >
                  <thead>
                    <tr>
                      <th
                        className="doc-table-th text-right"
                        style={{
                          backgroundColor: colors.thBg,
                          color: colors.thText,
                          borderColor: isLight ? "#0A2540" : colors.border,
                        }}
                      >
                        رمز الحساب
                      </th>
                      <th
                        className="doc-table-th text-right"
                        style={{
                          backgroundColor: colors.thBg,
                          color: colors.thText,
                          borderColor: isLight ? "#0A2540" : colors.border,
                        }}
                      >
                        اسم الحساب
                      </th>
                      <th
                        className="doc-table-th text-left"
                        style={{
                          backgroundColor: colors.thBg,
                          color: colors.thText,
                          borderColor: isLight ? "#0A2540" : colors.border,
                        }}
                      >
                        مدين
                      </th>
                      <th
                        className="doc-table-th text-left"
                        style={{
                          backgroundColor: colors.thBg,
                          color: colors.thText,
                          borderColor: isLight ? "#0A2540" : colors.border,
                        }}
                      >
                        دائن
                      </th>
                      <th
                        className="doc-table-th text-right"
                        style={{
                          backgroundColor: colors.thBg,
                          color: colors.thText,
                          borderColor: isLight ? "#0A2540" : colors.border,
                        }}
                      >
                        شرح السطر
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentData.lines?.map((line: any, idx: number) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 1 ? "doc-table-tr-alt" : ""}
                      >
                        <td
                          className="doc-table-td font-mono font-bold"
                          style={{
                            color: colors.tdText,
                            borderColor: colors.border,
                            backgroundColor: idx % 2 === 1 ? colors.tdAltBg : colors.canvasBg,
                          }}
                        >
                          {line.accountCode}
                        </td>
                        <td
                          className="doc-table-td font-semibold"
                          style={{
                            color: colors.tdText,
                            borderColor: colors.border,
                            backgroundColor: idx % 2 === 1 ? colors.tdAltBg : colors.canvasBg,
                          }}
                        >
                          {line.accountNameAr}
                        </td>
                        <td
                          className="doc-table-td text-left font-mono font-bold"
                          style={{
                            color: colors.tdText,
                            borderColor: colors.border,
                            backgroundColor: idx % 2 === 1 ? colors.tdAltBg : colors.canvasBg,
                          }}
                        >
                          {line.debit > 0 ? formatNumberOnly(line.debit) : ""}
                        </td>
                        <td
                          className="doc-table-td text-left font-mono font-bold"
                          style={{
                            color: colors.tdText,
                            borderColor: colors.border,
                            backgroundColor: idx % 2 === 1 ? colors.tdAltBg : colors.canvasBg,
                          }}
                        >
                          {line.credit > 0 ? formatNumberOnly(line.credit) : ""}
                        </td>
                        <td
                          className="doc-table-td"
                          style={{
                            color: colors.secondary,
                            borderColor: colors.border,
                            backgroundColor: idx % 2 === 1 ? colors.tdAltBg : colors.canvasBg,
                          }}
                        >
                          {line.memo || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="doc-table-tfoot">
                    <tr>
                      <td
                        colSpan={2}
                        className="doc-table-td font-bold"
                        style={{
                          backgroundColor: colors.tdTotalBg,
                          color: colors.title,
                          borderColor: colors.border,
                        }}
                      >
                        الإجمالي:
                      </td>
                      <td
                        className="doc-table-td text-left font-mono font-bold"
                        style={{
                          backgroundColor: colors.tdTotalBg,
                          color: colors.title,
                          borderColor: colors.border,
                        }}
                      >
                        {formatNumberOnly(documentData.totalDebit)}
                      </td>
                      <td
                        className="doc-table-td text-left font-mono font-bold"
                        style={{
                          backgroundColor: colors.tdTotalBg,
                          color: colors.title,
                          borderColor: colors.border,
                        }}
                      >
                        {formatNumberOnly(documentData.totalCredit)}
                      </td>
                      <td
                        className="doc-table-td"
                        style={{
                          backgroundColor: colors.tdTotalBg,
                          borderColor: colors.border,
                        }}
                      ></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* 4.2. INVOICE (فاتورة مبيعات / مشتريات / مرتجعات) */}
          {documentType === "INVOICE" && (
            <div className="space-y-4">
              {/* Party Information Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  className="p-3 rounded-xl border doc-card-bg"
                  style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
                >
                  <div className="text-[12px]" style={{ color: colors.secondary }}>
                    {documentData.type === "PURCHASE" || documentData.type === "PURCHASE_RETURN"
                      ? "المورد / البائع:"
                      : "العميل / المشتري:"}
                  </div>
                  <div
                    className="font-bold text-[14.5px] mt-1"
                    style={{ color: colors.title }}
                  >
                    {documentData.customerName ||
                      documentData.vendorName ||
                      documentData.partyName ||
                      "العميل العام"}
                  </div>
                </div>

                <div
                  className="p-3 rounded-xl border doc-card-bg"
                  style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
                >
                  <div className="text-[12px]" style={{ color: colors.secondary }}>
                    طريقة السداد / الحساب:
                  </div>
                  <div
                    className="font-bold text-[14.5px] mt-1"
                    style={{ color: colors.title }}
                  >
                    {documentData.paymentMethod === "CASH"
                      ? "نقداً (الخزينة)"
                      : documentData.paymentMethod === "WALLET"
                      ? `محفظة إلكترونية (${documentData.walletName || "سداد"})`
                      : documentData.paymentMethod === "BANK" || documentData.paymentMethod === "BANK_TRANSFER"
                      ? "تحويل مصرفي"
                      : "آجل (ذمم مدينة/دائنة)"}
                  </div>
                </div>

                <div
                  className="p-3 rounded-xl border doc-card-bg"
                  style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
                >
                  <div className="text-[12px]" style={{ color: colors.secondary }}>
                    تاريخ الاستحقاق:
                  </div>
                  <div
                    className="font-mono font-bold text-[14.5px] mt-1"
                    style={{ color: colors.title }}
                  >
                    {documentData.dueDate || documentData.date || docDate}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table
                  className="w-full border-collapse text-right doc-table"
                  style={{ borderColor: colors.border }}
                >
                  <thead>
                    <tr>
                      <th
                        className="doc-table-th text-center w-12"
                        style={{
                          backgroundColor: colors.thBg,
                          color: colors.thText,
                          borderColor: isLight ? "#0A2540" : colors.border,
                        }}
                      >
                        #
                      </th>
                      <th
                        className="doc-table-th text-right"
                        style={{
                          backgroundColor: colors.thBg,
                          color: colors.thText,
                          borderColor: isLight ? "#0A2540" : colors.border,
                        }}
                      >
                        بيان الصنف / الخدمة
                      </th>
                      <th
                        className="doc-table-th text-left"
                        style={{
                          backgroundColor: colors.thBg,
                          color: colors.thText,
                          borderColor: isLight ? "#0A2540" : colors.border,
                        }}
                      >
                        الكمية
                      </th>
                      <th
                        className="doc-table-th text-left"
                        style={{
                          backgroundColor: colors.thBg,
                          color: colors.thText,
                          borderColor: isLight ? "#0A2540" : colors.border,
                        }}
                      >
                        سعر الوحدة
                      </th>
                      <th
                        className="doc-table-th text-left"
                        style={{
                          backgroundColor: colors.thBg,
                          color: colors.thText,
                          borderColor: isLight ? "#0A2540" : colors.border,
                        }}
                      >
                        الإجمالي
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentData.items?.map((item: any, idx: number) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 1 ? "doc-table-tr-alt" : ""}
                      >
                        <td
                          className="doc-table-td text-center font-mono"
                          style={{
                            color: colors.tdText,
                            borderColor: colors.border,
                            backgroundColor: idx % 2 === 1 ? colors.tdAltBg : colors.canvasBg,
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td
                          className="doc-table-td font-medium"
                          style={{
                            color: colors.tdText,
                            borderColor: colors.border,
                            backgroundColor: idx % 2 === 1 ? colors.tdAltBg : colors.canvasBg,
                          }}
                        >
                          {item.description || item.itemName}
                        </td>
                        <td
                          className="doc-table-td text-left font-mono"
                          style={{
                            color: colors.tdText,
                            borderColor: colors.border,
                            backgroundColor: idx % 2 === 1 ? colors.tdAltBg : colors.canvasBg,
                          }}
                        >
                          {item.quantity} {item.unit || ""}
                        </td>
                        <td
                          className="doc-table-td text-left font-mono"
                          style={{
                            color: colors.tdText,
                            borderColor: colors.border,
                            backgroundColor: idx % 2 === 1 ? colors.tdAltBg : colors.canvasBg,
                          }}
                        >
                          {formatNumberOnly(item.unitPrice)}
                        </td>
                        <td
                          className="doc-table-td text-left font-mono font-bold"
                          style={{
                            color: colors.tdText,
                            borderColor: colors.border,
                            backgroundColor: idx % 2 === 1 ? colors.tdAltBg : colors.canvasBg,
                          }}
                        >
                          {formatNumberOnly(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="doc-table-tfoot">
                    <tr>
                      <td
                        colSpan={4}
                        className="doc-table-td font-bold"
                        style={{
                          backgroundColor: colors.tdTotalBg,
                          color: colors.title,
                          borderColor: colors.border,
                        }}
                      >
                        الإجمالي العام:
                      </td>
                      <td
                        className="doc-table-td text-left font-mono font-bold"
                        style={{
                          backgroundColor: colors.tdTotalBg,
                          color: colors.title,
                          borderColor: colors.border,
                        }}
                      >
                        {formatMoney(
                          documentData.totalAmount || documentData.grandTotal,
                          documentData.currency || displayCurrency,
                          currencies
                        )}
                      </td>
                    </tr>
                    {documentData.paidAmount !== undefined && documentData.paidAmount > 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="doc-table-td font-bold"
                          style={{
                            backgroundColor: isLight ? "#ECFDF5" : "#064E3B/30",
                            color: isLight ? "#065F46" : "#34D399",
                            borderColor: colors.border,
                          }}
                        >
                          المبلغ المدفوع / المسدد:
                        </td>
                        <td
                          className="doc-table-td text-left font-mono font-bold"
                          style={{
                            backgroundColor: isLight ? "#ECFDF5" : "#064E3B/30",
                            color: isLight ? "#065F46" : "#34D399",
                            borderColor: colors.border,
                          }}
                        >
                          {formatMoney(
                            documentData.paidAmount,
                            documentData.currency || displayCurrency,
                            currencies
                          )}
                        </td>
                      </tr>
                    )}
                    {documentData.remainingAmount !== undefined && documentData.remainingAmount > 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="doc-table-td font-bold"
                          style={{
                            backgroundColor: isLight ? "#FFFBEB" : "#78350F/30",
                            color: isLight ? "#92400E" : "#FBBF24",
                            borderColor: colors.border,
                          }}
                        >
                          المبلغ المتبقي (ذمة):
                        </td>
                        <td
                          className="doc-table-td text-left font-mono font-bold"
                          style={{
                            backgroundColor: isLight ? "#FFFBEB" : "#78350F/30",
                            color: isLight ? "#92400E" : "#FBBF24",
                            borderColor: colors.border,
                          }}
                        >
                          {formatMoney(
                            documentData.remainingAmount,
                            documentData.currency || displayCurrency,
                            currencies
                          )}
                        </td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>

              {/* QR Code Section */}
              <div
                className="p-3.5 border rounded-xl flex items-center gap-4 doc-card-bg"
                style={{
                  backgroundColor: colors.cardBg,
                  borderColor: "#D4AF37",
                }}
              >
                <div className="w-[80px] h-[80px] border p-1 rounded bg-white flex-shrink-0 flex items-center justify-center">
                  <QRCodeSVG
                    value={documentData.qrCodeData || `Bin Ziad Group - Invoice: ${docNumber} - Total: ${documentData.totalAmount || documentData.grandTotal} ${documentData.currency}`}
                    size={70}
                    level="M"
                  />
                </div>
                <div>
                  <div
                    className="text-xs font-bold"
                    style={{ color: colors.title }}
                  >
                    رمز الاستجابة السريعة (QR Code) - الفوترة الإلكترونية
                  </div>
                  <div
                    className="text-[11px] mt-0.5"
                    style={{ color: colors.secondary }}
                  >
                    متوافق مع المعايير المحاسبية المعتمدة للفوترة الإلكترونية وتدقيق القيود.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4.3. RECEIPT / PAYMENT VOUCHER (سند قبض / سند صرف) */}
          {(documentType === "RECEIPT" || documentType === "PAYMENT") && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className="p-3.5 rounded-xl border doc-card-bg"
                  style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
                >
                  <div className="text-[12px]" style={{ color: colors.secondary }}>
                    {documentType === "RECEIPT"
                      ? "استلمنا من الأخ / السادة:"
                      : "يصرف للأخ / السادة:"}
                  </div>
                  <div
                    className="font-bold text-[15px] mt-1"
                    style={{ color: colors.title }}
                  >
                    {documentData.beneficiaryOrPayer}
                  </div>
                </div>

                <div
                  className="p-3.5 rounded-xl border doc-card-bg"
                  style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
                >
                  <div className="text-[12px]" style={{ color: colors.secondary }}>
                    المبلغ الإجمالي بالأرقام:
                  </div>
                  <div
                    className="font-mono font-extrabold text-[18px] mt-1"
                    style={{ color: colors.title }}
                  >
                    {formatMoney(
                      documentData.amount,
                      documentData.currency || displayCurrency,
                      currencies
                    )}
                  </div>
                </div>
              </div>

              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]"
              >
                <div
                  className="p-3 rounded-xl border doc-card-bg"
                  style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
                >
                  <span style={{ color: colors.secondary }}>طريقة الدفع: </span>
                  <span
                    className="font-bold"
                    style={{ color: colors.title }}
                  >
                    {documentData.paymentMethod === "CASH"
                      ? "نقداً من الخزينة الرئيسية"
                      : documentData.paymentMethod === "BANK_TRANSFER"
                      ? "تحويل بنكي رسمي"
                      : `شيك مصرفي رقم ${documentData.checkNumber || ""}`}
                  </span>
                </div>

                <div
                  className="p-3 rounded-xl border doc-card-bg"
                  style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
                >
                  <span style={{ color: colors.secondary }}>حالة الترحيل: </span>
                  <span className="font-bold text-emerald-600">
                    مرحل ومقيد في دفتر الأستاذ العام
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 5. Signatures & Official Stamp (14-15px Semi Bold) */}
          <div
            className="pt-6 border-t-2 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
            style={{ borderColor: colors.border }}
          >
            {/* Auditor Signature */}
            <div className="space-y-6">
              <div
                className="doc-signature"
                style={{ color: colors.signatureText }}
              >
                المدقق المالي
              </div>
              <div
                className="doc-signature-line pb-1 text-center"
                style={{ color: colors.signatureLine }}
              >
                ___________________
              </div>
            </div>

            {/* Client / Manager Signature */}
            <div className="space-y-4">
              <div
                className="doc-signature"
                style={{ color: colors.signatureText }}
              >
                توقيع العميل / المدير (إلكتروني)
              </div>
              
              {sigType === "NONE" && (
                <div
                  className="doc-signature-line pb-1 text-center font-mono"
                  style={{ color: colors.signatureLine }}
                >
                  ___________________
                </div>
              )}

              {sigType === "TEXT" && (
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div 
                    className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 font-mono font-bold text-xs shadow-sm"
                    style={{ color: colors.signatureText }}
                  >
                    {sigText}
                  </div>
                  <div className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <span>🛡️</span>
                    <span>توقيع إلكتروني مؤمن ونشط</span>
                  </div>
                </div>
              )}

              {sigType === "IMAGE" && (
                <div className="flex flex-col items-center justify-center space-y-1">
                  {sigImage ? (
                    <img
                      src={sigImage}
                      alt="التوقيع الإلكتروني للمسؤول"
                      className="max-h-12 max-w-[140px] object-contain mix-blend-multiply dark:mix-blend-normal"
                    />
                  ) : (
                    <div className="px-3 py-1 rounded border border-dashed border-amber-500/50 text-amber-500 font-mono text-[10px] font-bold">
                      يرجى رفع صورة التوقيع
                    </div>
                  )}
                  {sigImage && (
                    <div className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                      <span>🛡️</span>
                      <span>معتمد وموقع الكترونياً</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Official Enterprise Stamp */}
            <div className="space-y-6">
              <div
                className="doc-signature"
                style={{ color: colors.signatureText }}
              >
                الختم الرسمي للمؤسسة
              </div>
              <div
                className="pb-1 font-bold text-[13px]"
                style={{ color: "#D4AF37" }}
              >
                {headerCompanyAr}
              </div>
            </div>
          </div>

          {/* 6. Dynamic Footer & Terms */}
          <div
            className="pt-4 border-t text-center space-y-1 doc-footer"
            style={{
              borderColor: colors.border,
              color: colors.footerText,
            }}
          >
            {footerTermsAr && (
              <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 border-b border-dashed border-slate-300 dark:border-slate-700 pb-1 mb-1">
                📌 {footerTermsAr}
              </div>
            )}
            <div className="font-semibold text-[11px]">
              جميع الحقوق محفوظة © {headerCompanyEn} | MeDo Tech & SAP/MeDO ERP
            </div>
            <div className="text-[10px] text-slate-500">
              طبع بواسطة: {documentData?.printedBy || 'نظام المحاسبة والإدارة المتكامل'} - {todayPrintDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
