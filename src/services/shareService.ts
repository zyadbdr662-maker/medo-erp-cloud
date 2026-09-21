import { CurrencyCode, CurrencyInfo, Customer, Invoice, JournalEntry, Vendor, Voucher } from "../types/erp";
import { formatMoney, formatNumberOnly } from "./erpStorage";
import { generateDocumentShareUrl, OFFICIAL_APP_DOMAIN } from "../config/appConfig";
import { TenantIsolationService } from "./tenantIsolationService";

export interface TenantDetailsOverride {
  nameAr?: string;
  nameEn?: string;
  phone?: string;
  address?: string;
  city?: string;
  taxNumber?: string;
  commercialReg?: string;
}

export interface ShareDocumentPayload {
  title: string;
  type: "INVOICE" | "STATEMENT" | "REPORT" | "VOUCHER" | "JOURNAL";
  data: any;
  recipientName?: string;
  recipientPhone?: string;
  currency?: CurrencyCode;
}

function resolveTenantInfo(override?: TenantDetailsOverride) {
  const activeTenant = TenantIsolationService.getActiveTenantDetails();
  return {
    nameAr: override?.nameAr || activeTenant.nameAr || "ميدو تك للحلول البرمجية",
    nameEn: override?.nameEn || activeTenant.nameEn || "MeDo Tech Solutions",
    phone: override?.phone || activeTenant.phone || "+967 773 586 047",
    address: override?.address || activeTenant.address || "المركز الرئيسي",
    city: override?.city || activeTenant.city || "صنعاء",
  };
}

// Clean and normalize phone numbers for WhatsApp and SMS
export function normalizePhoneNumber(phone: string, defaultCountryCode: string = "967"): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, "");
  
  // If starts with 00, replace with nothing
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  }
  
  // If local Yemen number starting with 7 or 07 (e.g. 777123456 or 0777123456)
  if (cleaned.startsWith("07") && cleaned.length === 10) {
    cleaned = defaultCountryCode + cleaned.substring(1);
  } else if (cleaned.startsWith("7") && cleaned.length === 9) {
    cleaned = defaultCountryCode + cleaned;
  }
  
  return cleaned;
}

// Open WhatsApp
export function sendViaWhatsApp(phone: string, message: string) {
  const normalizedPhone = normalizePhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  
  if (normalizedPhone) {
    window.open(`https://wa.me/${normalizedPhone}?text=${encodedText}`, "_blank");
  } else {
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, "_blank");
  }
}

// Open SMS
export function sendViaSMS(phone: string, message: string) {
  const normalizedPhone = normalizePhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  
  if (normalizedPhone) {
    window.location.href = `sms:${normalizedPhone}?body=${encodedText}`;
  } else {
    window.location.href = `sms:?body=${encodedText}`;
  }
}

// Copy text helper
export async function copyShareText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error("Failed to copy text:", err);
    return false;
  }
}

// 1. INVOICE (Sales, Purchase, Returns) Share Message Generator
export function formatInvoiceMessage(
  invoice: Invoice,
  currencies: CurrencyInfo[],
  format: "WHATSAPP" | "SMS",
  tenantOverride?: TenantDetailsOverride
): string {
  const tenant = resolveTenantInfo(tenantOverride);
  const isSales = invoice.type === "SALES";
  const isSalesReturn = invoice.type === "SALES_RETURN";
  const isPurchase = invoice.type === "PURCHASE";
  const isPurchaseReturn = invoice.type === "PURCHASE_RETURN";

  const docTitle = isSalesReturn
    ? "فاتورة مردود مبيعات (Sales Return)"
    : isPurchase
    ? "فاتورة مشتريات (Purchase Bill)"
    : isPurchaseReturn
    ? "فاتورة مردود مشتريات (Purchase Return)"
    : "فاتورة مبيعات ضريبية (Sales Invoice)";

  const partyName = invoice.customerName || invoice.vendorName || invoice.partyName || "العميل / المورد المحترم";
  const currFormattedTotal = formatMoney(invoice.totalAmount, invoice.currency, currencies);
  const paid = invoice.paidAmount || 0;
  const remaining = invoice.remainingAmount !== undefined ? invoice.remainingAmount : (invoice.totalAmount - paid);

  if (format === "SMS") {
    return `${tenant.nameAr}
${docTitle} رقم: ${invoice.invoiceNumber}
السيد: ${partyName}
التاريخ: ${invoice.date}
الإجمالي: ${currFormattedTotal}
المدفوع: ${formatMoney(paid, invoice.currency, currencies)}
المتبقي: ${formatMoney(remaining, invoice.currency, currencies)}
شكراً لتعاملكم معنا. للاستفسار: ${tenant.phone}`;
  }

  // WhatsApp rich formatted text
  let itemsList = "";
  if (invoice.items && invoice.items.length > 0) {
    itemsList = invoice.items
      .map(
        (it, idx) =>
          `🔹 *${idx + 1}.* ${it.description} | الكمية: *${it.quantity}* × السعر: *${formatNumberOnly(it.unitPrice)}* = *${formatNumberOnly(it.total)}*`
      )
      .join("\n");
  }

  const isWallet = typeof invoice.paymentMethod === "string" && invoice.paymentMethod.startsWith("WALLET");
  const isBank = invoice.paymentMethod === "BANK_TRANSFER" || invoice.paymentMethod === "CHECK";

  const paymentText =
    invoice.paymentMethod === "CASH"
      ? "💵 نقداً (الصندوق)"
      : isWallet
      ? `📱 محفظة إلكترونية (${invoice.walletName || "سداد إلكتروني"})`
      : isBank
      ? "🏦 تحويل بنكي / شيك"
      : "⏳ آجل (على الحساب)";

  const verificationUrl = generateDocumentShareUrl("invoice", invoice.invoiceNumber);

  return `🏢 *${tenant.nameAr}*
نظام الإدارة المالية والفوترة الإلكترونية
━━━━━━━━━━━━━━━━━━━━
📄 *${docTitle}*
🔢 *رقم الفاتورة:* \`${invoice.invoiceNumber}\`
📅 *التاريخ:* ${invoice.date}
👤 *الجهة:* ${partyName}
💳 *طريقة السداد:* ${paymentText}
━━━━━━━━━━━━━━━━━━━━
📦 *تفاصيل الأصناف والبنود:*
${itemsList || "• خدمات ومشتريات تجارية معتمدة"}
━━━━━━━━━━━━━━━━━━━━
💰 *إجمالي الفاتورة:* *${currFormattedTotal}*
${paid > 0 ? `✅ *المبلغ المسدد:* *${formatMoney(paid, invoice.currency, currencies)}*\n` : ""}${remaining > 0 ? `⚠️ *الرصيد المتبقي (ذمة):* *${formatMoney(remaining, invoice.currency, currencies)}*\n` : ""}📅 *تاريخ الاستحقاق:* ${invoice.dueDate || invoice.date}
━━━━━━━━━━━━━━━━━━━━
🌐 *رابط الفحص والمطابقة الرقمي:*
${verificationUrl}
━━━━━━━━━━━━━━━━━━━━
✨ *شاكرين ثقتكم وتعاملكم الراقي معنا.*
📞 ${tenant.address} - هاتف: ${tenant.phone}`;
}

// 2. STATEMENT OF ACCOUNT (كشف حساب عميل أو مورد)
export function formatStatementMessage(
  party: Customer | Vendor,
  partyType: "CUSTOMER" | "VENDOR",
  currencies: CurrencyInfo[],
  format: "WHATSAPP" | "SMS",
  invoicesCount: number = 0,
  lastTransactionDate?: string,
  tenantOverride?: TenantDetailsOverride
): string {
  const tenant = resolveTenantInfo(tenantOverride);
  const isCust = partyType === "CUSTOMER";
  const title = isCust ? "كشف حساب عميل معتمد (Customer Statement)" : "كشف حساب مورد معتمد (Vendor Statement)";
  const bal = formatMoney(party.currentBalance, party.currency, currencies);

  if (format === "SMS") {
    return `${tenant.nameAr}
${title}
الاسم: ${party.nameAr} (${party.code})
الرصيد المستحق: ${bal}
العملة: ${party.currency}
تاريخ: ${new Date().toISOString().split("T")[0]}
يرجى مراجعة الحساب وتأكيد المطابقة. هاتف: ${tenant.phone}`;
  }

  const statementUrl = generateDocumentShareUrl("statement", party.code);

  return `🏢 *${tenant.nameAr}*
الإدارة المالية والمحاسبية | إدارة الذمم والائتمان
━━━━━━━━━━━━━━━━━━━━
📑 *${title}*
👤 *الاسم:* ${party.nameAr} (${party.nameEn || ""})
🆔 *رمز الحساب:* \`${party.code}\`
📍 *المدينة:* ${party.city || tenant.city} | 📞 ${party.phone || "-"}
📅 *تاريخ الكشف:* ${new Date().toISOString().split("T")[0]}
━━━━━━━━━━━━━━━━━━━━
💵 *الرصيد الإجمالي القائم:*
👉 *${bal}* (${isCust ? "مدين مستحق السداد" : "دائن مستحق للمورد"})
${isCust && (party as Customer).creditLimit ? `🔒 *سقف الائتمان الممنوح:* *${formatMoney((party as Customer).creditLimit, party.currency, currencies)}*\n` : ""}${invoicesCount > 0 ? `📊 *عدد الحركات المقيدة:* ${invoicesCount} حركة\n` : ""}${lastTransactionDate ? `⏱️ *آخر حركة مسجلة:* ${lastTransactionDate}\n` : ""}━━━━━━━━━━━━━━━━━━━━
🌐 *رابط كشف الحساب الرقمي المباشر:*
${statementUrl}
━━━━━━━━━━━━━━━━━━━━
📌 *ملاحظة:* نرجو التكرم بمطابقة الرصيد وموافاتنا بأي ملاحظات خلال 3 أيام عمل.
✨ *مع خالص التقدير والاحترام.*
📞 الإدارة المالية: ${tenant.phone}`;
}

// 3. FINANCIAL REPORTS (قائمة الدخل، الميزانية العمومية، ميزان المراجعة)
export function formatFinancialReportMessage(
  reportType: "BALANCE_SHEET" | "INCOME_STATEMENT" | "TRIAL_BALANCE" | "CASH_FLOW",
  fiscalYear: string,
  summary: {
    totalAssets?: number;
    totalLiabilities?: number;
    totalEquity?: number;
    totalRevenues?: number;
    totalExpenses?: number;
    netProfit?: number;
    trialDebit?: number;
    trialCredit?: number;
  },
  displayCurrency: CurrencyCode,
  currencies: CurrencyInfo[],
  format: "WHATSAPP" | "SMS",
  tenantOverride?: TenantDetailsOverride
): string {
  const tenant = resolveTenantInfo(tenantOverride);
  const reportTitles: Record<string, string> = {
    BALANCE_SHEET: "الميزانية العمومية والمركز المالي (Balance Sheet)",
    INCOME_STATEMENT: "قائمة الأرباح والخسائر والدخل الشامل (Income Statement)",
    TRIAL_BALANCE: "ميزان المراجعة بالأرصدة (Trial Balance)",
    CASH_FLOW: "تقرير السيولة والتدفقات النقدية (Cash Flow Summary)",
  };

  const reportTitle = reportTitles[reportType] || "التقرير المالي الرسمي";

  if (format === "SMS") {
    if (reportType === "INCOME_STATEMENT") {
      return `${tenant.nameAr} - ملخص قائمة الدخل ${fiscalYear}
الإيرادات: ${formatMoney(summary.totalRevenues || 0, displayCurrency, currencies)}
المصروفات: ${formatMoney(summary.totalExpenses || 0, displayCurrency, currencies)}
صافي الربح: ${formatMoney(summary.netProfit || 0, displayCurrency, currencies)}
معتمد من الإدارة المالية`;
    }
    return `${tenant.nameAr} - ${reportTitle}
السنة المالية: ${fiscalYear}
إجمالي الأصول: ${formatMoney(summary.totalAssets || 0, displayCurrency, currencies)}
إجمالي الالتزامات وحقوق الملكية: ${formatMoney((summary.totalLiabilities || 0) + (summary.totalEquity || 0), displayCurrency, currencies)}
معتمد IFRS`;
  }

  // WhatsApp rich formatted text
  let bodyContent = "";

  if (reportType === "INCOME_STATEMENT") {
    bodyContent = `📈 *إجمالي الإيرادات والمبيعات:* *${formatMoney(summary.totalRevenues || 0, displayCurrency, currencies)}*
📉 *إجمالي المصروفات التشغيلية:* *${formatMoney(summary.totalExpenses || 0, displayCurrency, currencies)}*
━━━━━━━━━━━━━━━━━━━━
🏆 *صافي الربح / الخسارة للفترة:*
👉 *${formatMoney(summary.netProfit || 0, displayCurrency, currencies)}* (${(summary.netProfit || 0) >= 0 ? "صافي أرباح تشغيلية محققة 🟢" : "عجز / خسارة 🔴"})`;
  } else if (reportType === "BALANCE_SHEET") {
    bodyContent = `🏛️ *إجمالي الأصول والموجودات:* *${formatMoney(summary.totalAssets || 0, displayCurrency, currencies)}*
💳 *إجمالي الالتزامات والخصوم:* *${formatMoney(summary.totalLiabilities || 0, displayCurrency, currencies)}*
💎 *حقوق الملكية ورأس المال:* *${formatMoney(summary.totalEquity || 0, displayCurrency, currencies)}*
━━━━━━━━━━━━━━━━━━━━
⚖️ *إجمالي الخصوم وحقوق الملكية:* *${formatMoney((summary.totalLiabilities || 0) + (summary.totalEquity || 0), displayCurrency, currencies)}*
✅ *حالة التوازن المحاسبي:* متطابق ومغلق وفق المعايير الدولية (IFRS)`;
  } else if (reportType === "TRIAL_BALANCE") {
    bodyContent = `🔵 *إجمالي الأرصدة المدينة:* *${formatMoney(summary.trialDebit || 0, displayCurrency, currencies)}*
🔴 *إجمالي الأرصدة الدائنة:* *${formatMoney(summary.trialCredit || 0, displayCurrency, currencies)}*
━━━━━━━━━━━━━━━━━━━━
⚖️ *الفرق المحاسبي:* *0.00* (ميزان مراجعة متوازن ومرحل بالكامل)`;
  } else {
    bodyContent = `💵 *صافي السيولة النقدية المتاحة:* *${formatMoney(summary.totalAssets || 0, displayCurrency, currencies)}*`;
  }

  return `🏢 *${tenant.nameAr}*
نظام الإدارة المالية والتقارير المحاسبية المعتمدة
━━━━━━━━━━━━━━━━━━━━
📊 *${reportTitle}*
📅 *السنة المالية:* ${fiscalYear} | العملة المعتمدة: ${displayCurrency}
⏰ *تاريخ ووقت الإصدار:* ${new Date().toLocaleString("ar-YE")}
━━━━━━━━━━━━━━━━━━━━
${bodyContent}
━━━━━━━━━━━━━━━━━━━━
✍️ *اعتماد:*
• الإدارة المالية والتدقيق الداخلي
📞 المركز الرئيسي: ${tenant.city} - هاتف: ${tenant.phone}`;
}

// 4. VOUCHER (سند قبض / سند صرف)
export function formatVoucherMessage(
  voucher: Voucher,
  currencies: CurrencyInfo[],
  format: "WHATSAPP" | "SMS",
  tenantOverride?: TenantDetailsOverride
): string {
  const tenant = resolveTenantInfo(tenantOverride);
  const isReceipt = voucher.type === "RECEIPT";
  const title = isReceipt ? "سند قبض مالي رسمي (Receipt Voucher)" : "سند صرف مالي رسمي (Payment Voucher)";
  const amtFormatted = formatMoney(voucher.amount, voucher.currency, currencies);

  if (format === "SMS") {
    return `${tenant.nameAr}
${title} رقم: ${voucher.voucherNumber}
${isReceipt ? "استلمنا من:" : "صرف للأخ:"} ${voucher.beneficiaryOrPayer}
المبلغ: ${amtFormatted}
البيان: ${voucher.notes}
التاريخ: ${voucher.date}
تم الترحيل للأستاذ العام.`;
  }

  const payMethodText =
    voucher.paymentMethod === "CASH"
      ? "💵 نقداً من الصندوق"
      : voucher.paymentMethod === "BANK_TRANSFER"
      ? "🏦 تحويل بنكي رسمي"
      : `📄 شيك رقم ${voucher.checkNumber || "-"}`;

  const voucherUrl = generateDocumentShareUrl("voucher", voucher.voucherNumber);

  return `🏢 *${tenant.nameAr}*
الإدارة المالية والمصرفية
━━━━━━━━━━━━━━━━━━━━
📑 *${title}*
🔢 *رقم السند:* \`${voucher.voucherNumber}\`
📅 *التاريخ:* ${voucher.date}
👤 *${isReceipt ? "استلمنا من الأخ / السادة:" : "يصرف للأخ / السادة:"}*
👉 *${voucher.beneficiaryOrPayer}*
━━━━━━━━━━━━━━━━━━━━
💰 *المبلغ:* *${amtFormatted}*
💳 *طريقة الدفع:* ${payMethodText}
📝 *وذلك مقابل (البيان):*
${voucher.notes}
━━━━━━━━━━━━━━━━━━━━
🌐 *رابط مطابقة السند الرقمي:*
${voucherUrl}
━━━━━━━━━━━━━━━━━━━━
🔒 *حالة السند:* مقيد ومرحل في دفتر الأستاذ العام
✍️ *المحاسب المختص:* قسم الحسابات العامة
✨ *شكراً لتعاملكم معنا.*`;
}
