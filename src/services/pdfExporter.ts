import html2pdf from "html2pdf.js";
import { CurrencyCode, CurrencyInfo } from "../types/erp";
import { formatMoney, formatNumberOnly } from "./erpStorage";
import { TenantIsolationService } from "./tenantIsolationService";
import {
  formatCalendarDate,
  getActiveCalendarType,
  formatDualDate,
  formatGregorianDate,
  formatHijriDate,
} from "../utils/calendarUtils";

/**
 * Export a DOM element to PDF file
 */
export async function exportElementToPdf(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with ID '${elementId}' not found, falling back to browser print`);
    window.print();
    return false;
  }

  // 1. Ensure fonts are fully loaded to avoid blank/unrendered text
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      // ignore
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 100));

  const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;

  const opt = {
    margin: [6, 6, 6, 6],
    filename: cleanFilename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 820,
      scrollX: 0,
      scrollY: 0,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  // 2. Clone the element to an isolated top-level container to prevent clipping and transform issues
  const clone = element.cloneNode(true) as HTMLElement;
  clone.id = `${elementId}-export-clone`;

  // Preserve canvases (like ZATCA QR code)
  const origCanvases = element.querySelectorAll("canvas");
  const cloneCanvases = clone.querySelectorAll("canvas");
  origCanvases.forEach((orig, idx) => {
    const dest = cloneCanvases[idx];
    if (dest) {
      dest.width = orig.width;
      dest.height = orig.height;
      const destCtx = dest.getContext("2d");
      if (destCtx) {
        destCtx.drawImage(orig, 0, 0);
      }
    }
  });

  // Preserve form inputs if any
  const origInputs = element.querySelectorAll("input, select, textarea");
  const cloneInputs = clone.querySelectorAll("input, select, textarea");
  origInputs.forEach((orig, idx) => {
    const dest = cloneInputs[idx] as HTMLInputElement;
    if (dest) {
      dest.value = (orig as HTMLInputElement).value;
    }
  });

  // Apply clean high-contrast accounting styling on clone (No dark bars, pure white tables)
  clone.style.margin = "0 auto";
  clone.style.padding = "24px";
  clone.style.width = "794px"; // Standard A4 width in px at 96 DPI
  clone.style.maxWidth = "794px";
  clone.style.boxSizing = "border-box";
  clone.style.backgroundColor = "#FFFFFF";
  clone.style.color = "#000000";
  clone.style.transform = "none";
  clone.style.boxShadow = "none";
  clone.style.border = "none";
  clone.style.visibility = "visible";
  clone.style.display = "block";
  clone.style.opacity = "1";

  // Enforce white background and dark text for all tables and rows in clone
  const tables = clone.querySelectorAll("table");
  tables.forEach((t) => {
    t.style.backgroundColor = "#FFFFFF";
    t.style.borderCollapse = "collapse";
    t.style.width = "100%";
    t.style.border = "1px solid #94A3B8";
  });
  const headers = clone.querySelectorAll("th");
  headers.forEach((th) => {
    th.style.backgroundColor = "#F8FAFC";
    th.style.color = "#000000";
    th.style.borderColor = "#94A3B8";
    th.style.boxShadow = "none";
    th.style.fontWeight = "700";
  });
  const cells = clone.querySelectorAll("td");
  cells.forEach((td) => {
    td.style.backgroundColor = "#FFFFFF";
    td.style.color = "#000000";
    td.style.borderColor = "#CBD5E1";
    td.style.boxShadow = "none";
  });
  const allCloned = clone.querySelectorAll("*");
  allCloned.forEach((node) => {
    const el = node as HTMLElement;
    el.style.boxShadow = "none";
    el.style.textShadow = "none";
    el.style.filter = "none";
    if (el.tagName === "BUTTON" || el.classList.contains("no-print") || el.classList.contains("print:hidden")) {
      el.style.display = "none";
    } else {
      el.style.visibility = "visible";
    }
  });

  const exportWrapper = document.createElement("div");
  exportWrapper.id = "isolated-pdf-export-wrapper";
  exportWrapper.style.position = "fixed";
  exportWrapper.style.top = "0";
  exportWrapper.style.left = "0";
  exportWrapper.style.zIndex = "9999999";
  exportWrapper.style.backgroundColor = "#FFFFFF";
  exportWrapper.style.color = "#000000";
  exportWrapper.style.margin = "0";
  exportWrapper.style.padding = "0";
  exportWrapper.style.overflow = "visible";
  exportWrapper.style.pointerEvents = "none";
  exportWrapper.appendChild(clone);
  document.body.appendChild(exportWrapper);

  // --- STYLE SANITIZATION WORKAROUND FOR TAILWIND V4 OKLCH/OKLAB html2canvas BUG ---
  const styleElements = Array.from(document.querySelectorAll("style"));
  const originalStyleContents = styleElements.map((style) => style.innerHTML);
  const modifiedRules: { sheet: CSSStyleSheet; index: number; ruleText: string }[] = [];

  try {
    // 1. Sanitize <style> tags (common in Vite development)
    styleElements.forEach((style) => {
      let text = style.innerHTML;
      if (text.includes("oklab") || text.includes("oklch")) {
        text = text.replace(/oklab\([^)]+\)/g, "rgb(128, 128, 128)");
        text = text.replace(/oklch\(([^)]+)\)/g, (match, p1) => {
          const parts = p1.trim().split(/[\s/]+/);
          const lightness = parseFloat(parts[0]);
          if (!isNaN(lightness)) {
            if (lightness > 0.8) return "rgb(248, 250, 252)";
            if (lightness > 0.6) return "rgb(203, 213, 225)";
            if (lightness > 0.4) return "rgb(100, 116, 139)";
            if (lightness > 0.2) return "rgb(30, 41, 59)";
            return "rgb(15, 23, 42)";
          }
          return "rgb(100, 116, 139)";
        });
        style.innerHTML = text;
      }
    });

    // 2. Remove remaining oklab/oklch rules from CSSStyleSheets directly
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i] as CSSStyleSheet;
      try {
        if (!sheet.cssRules) continue;
        for (let j = sheet.cssRules.length - 1; j >= 0; j--) {
          const rule = sheet.cssRules[j];
          if (rule.cssText.includes("oklab") || rule.cssText.includes("oklch")) {
            modifiedRules.push({
              sheet,
              index: j,
              ruleText: rule.cssText,
            });
            sheet.deleteRule(j);
          }
        }
      } catch (e) {
        // Ignore CORS errors on external stylesheets
      }
    }
  } catch (err) {
    console.warn("Style sanitization failed", err);
  }

  try {
    // @ts-ignore
    await html2pdf().set(opt).from(clone).save();
    return true;
  } catch (err) {
    console.error("PDF export error:", err);
    // Fallback to native print
    window.print();
    return false;
  } finally {
    // --- REMOVE ISOLATED WRAPPER ---
    try {
      if (exportWrapper.parentNode) {
        exportWrapper.parentNode.removeChild(exportWrapper);
      }
    } catch (e) {
      // ignore
    }

    // --- RESTORE ORIGINAL STYLES ---
    try {
      styleElements.forEach((style, index) => {
        style.innerHTML = originalStyleContents[index];
      });

      modifiedRules.sort((a, b) => a.index - b.index);
      for (const item of modifiedRules) {
        try {
          item.sheet.insertRule(item.ruleText, item.index);
        } catch (err) {
          console.warn("Failed to restore stylesheet rule during cleanup", err);
        }
      }
    } catch (err) {
      console.warn("Failed to clean up style sanitization", err);
    }
  }
}

/**
 * Gets today's formatted date string according to the active calendar setting (Hijri / Gregorian / Dual)
 */
export function getTodayFormattedDate(): string {
  const activeType = getActiveCalendarType();
  return formatCalendarDate(new Date(), activeType);
}

/**
 * Export Invoice / Voucher Document directly to PDF
 */
export async function exportInvoiceToPdf(
  documentType: "JOURNAL" | "RECEIPT" | "PAYMENT" | "INVOICE",
  documentData: any,
  currencies: CurrencyInfo[],
  filenameOverride?: string
): Promise<boolean> {
  const docNum =
    documentData.invoiceNumber ||
    documentData.voucherNumber ||
    documentData.entryNumber ||
    "JV-INV-SALES-2026-0004";
  const defaultFilename = `مستند_${documentType}_${docNum}_${new Date().toISOString().split("T")[0]}.pdf`;
  const filename = filenameOverride || defaultFilename;

  // Check if printable canvas already exists in DOM
  const existingCanvas = document.getElementById("printable-document-canvas");
  if (existingCanvas) {
    return exportElementToPdf("printable-document-canvas", filename);
  }

  // Otherwise dynamically construct offscreen printable DOM container
  const container = document.createElement("div");
  container.id = "temp-pdf-export-container";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "790px"; // A4 width equivalent at 96 DPI
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#1A2B4C";
  container.style.padding = "24px";
  container.style.fontFamily = "'Noto Naskh Arabic', 'Amiri', 'Droid Arabic Naskh', 'Traditional Arabic', sans-serif";
  container.style.direction = "rtl";

  const todayDate = getTodayFormattedDate();
  const companyMeta = TenantIsolationService.getActiveTenantDetails();

  let docTitle = "سند قيد محاسبي عام (Journal)";
  if (documentType === "JOURNAL") docTitle = "سند قيد محاسبي عام (Journal)";
  else if (documentType === "RECEIPT") docTitle = "سند قبض مالي رسمي (Receipt Voucher)";
  else if (documentType === "PAYMENT") docTitle = "سند صرف مالي رسمي (Payment Voucher)";
  else if (documentType === "INVOICE") {
    if (documentData.type === "SALES_RETURN") docTitle = "فاتورة مرتجع مبيعات رسمية (Sales Return Invoice)";
    else if (documentData.type === "PURCHASE") docTitle = "فاتورة مشتريات تجارية (Purchase Bill)";
    else if (documentData.type === "PURCHASE_RETURN") docTitle = "فاتورة مرتجع مشتريات (Purchase Return Invoice)";
    else docTitle = "فاتورة مبيعات ضريبية (Tax Sales Invoice)";
  }

  let tableHtml = "";
  if (documentType === "INVOICE" && documentData.items) {
    tableHtml = `
      <table style="width:100%; border-collapse:collapse; margin-top:16px; font-size:13px; text-align:right; border:1px solid #CBD5E1; background-color:#FFFFFF;">
        <thead>
          <tr style="background-color:#F8FAFC; color:#0A2540;">
            <th style="padding:10px 14px; border:1px solid #CBD5E1; text-align:center; font-weight:700; font-size:13px; color:#0A2540;">#</th>
            <th style="padding:10px 14px; border:1px solid #CBD5E1; font-weight:700; font-size:13px; color:#0A2540;">بيان الصنف / الخدمة</th>
            <th style="padding:10px 14px; border:1px solid #CBD5E1; text-align:left; font-weight:700; font-size:13px; color:#0A2540;">الكمية</th>
            <th style="padding:10px 14px; border:1px solid #CBD5E1; text-align:left; font-weight:700; font-size:13px; color:#0A2540;">سعر الوحدة</th>
            <th style="padding:10px 14px; border:1px solid #CBD5E1; text-align:left; font-weight:700; font-size:13px; color:#0A2540;">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${documentData.items
            .map(
              (item: any, idx: number) => `
            <tr style="background-color:${idx % 2 === 1 ? "#F8FAFC" : "#FFFFFF"};">
              <td style="padding:9px 14px; border:1px solid #CBD5E1; text-align:center; font-family:monospace; color:#1A2B4C; font-size:13px; font-weight:700;">${idx + 1}</td>
              <td style="padding:9px 14px; border:1px solid #CBD5E1; color:#1A2B4C; font-size:13px; font-weight:700;">${item.description || item.itemName}</td>
              <td style="padding:9px 14px; border:1px solid #CBD5E1; text-align:left; font-family:monospace; color:#1A2B4C; font-size:13px; font-weight:700;">${item.quantity} ${item.unit || ""}</td>
              <td style="padding:9px 14px; border:1px solid #CBD5E1; text-align:left; font-family:monospace; color:#1A2B4C; font-size:13px; font-weight:700;">${formatNumberOnly(item.unitPrice)}</td>
              <td style="padding:9px 14px; border:1px solid #CBD5E1; text-align:left; font-family:monospace; font-weight:700; color:#1A2B4C; font-size:13px;">${formatNumberOnly(item.total)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr style="background-color:#F1F5F9; font-weight:700;">
            <td colspan="4" style="padding:10px 14px; border:1px solid #CBD5E1; color:#0A2540; font-size:13px;">الإجمالي العام:</td>
            <td style="padding:10px 14px; border:1px solid #CBD5E1; text-align:left; font-family:monospace; color:#0A2540; font-size:14px; font-weight:700;">
              ${formatMoney(documentData.totalAmount || documentData.grandTotal, documentData.currency, currencies)}
            </td>
          </tr>
        </tfoot>
      </table>
    `;
  } else if (documentType === "JOURNAL" && documentData.lines) {
    tableHtml = `
      <table style="width:100%; border-collapse:collapse; margin-top:16px; font-size:13px; text-align:right; border:1px solid #CBD5E1; background-color:#FFFFFF;">
        <thead>
          <tr style="background-color:#F8FAFC; color:#0A2540;">
            <th style="padding:10px 14px; border:1px solid #CBD5E1; font-weight:700; font-size:13px; color:#0A2540;">رمز الحساب</th>
            <th style="padding:10px 14px; border:1px solid #CBD5E1; font-weight:700; font-size:13px; color:#0A2540;">اسم الحساب</th>
            <th style="padding:10px 14px; border:1px solid #CBD5E1; text-align:left; font-weight:700; font-size:13px; color:#0A2540;">مدين</th>
            <th style="padding:10px 14px; border:1px solid #CBD5E1; text-align:left; font-weight:700; font-size:13px; color:#0A2540;">دائن</th>
            <th style="padding:10px 14px; border:1px solid #CBD5E1; font-weight:700; font-size:13px; color:#0A2540;">شرح السطر</th>
          </tr>
        </thead>
        <tbody>
          ${documentData.lines
            .map(
              (line: any, idx: number) => `
            <tr style="background-color:${idx % 2 === 1 ? "#F8FAFC" : "#FFFFFF"};">
              <td style="padding:9px 14px; border:1px solid #CBD5E1; font-family:monospace; font-weight:700; color:#1A2B4C; font-size:13px;">${line.accountCode}</td>
              <td style="padding:9px 14px; border:1px solid #CBD5E1; font-weight:700; color:#1A2B4C; font-size:13px;">${line.accountNameAr}</td>
              <td style="padding:9px 14px; border:1px solid #CBD5E1; text-align:left; font-family:monospace; font-weight:700; color:#1A2B4C; font-size:13px;">
                ${line.debit > 0 ? formatNumberOnly(line.debit) : ""}
              </td>
              <td style="padding:9px 14px; border:1px solid #CBD5E1; text-align:left; font-family:monospace; font-weight:700; color:#1A2B4C; font-size:13px;">
                ${line.credit > 0 ? formatNumberOnly(line.credit) : ""}
              </td>
              <td style="padding:9px 14px; border:1px solid #CBD5E1; color:#4A5B6F; font-size:13px; font-weight:700;">${line.memo || "-"}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr style="background-color:#F1F5F9; font-weight:700;">
            <td colspan="2" style="padding:10px 14px; border:1px solid #CBD5E1; color:#0A2540; font-size:13px;">الإجمالي:</td>
            <td style="padding:10px 14px; border:1px solid #CBD5E1; text-align:left; font-family:monospace; color:#0A2540; font-size:14px; font-weight:700;">${formatNumberOnly(documentData.totalDebit)}</td>
            <td style="padding:10px 14px; border:1px solid #CBD5E1; text-align:left; font-family:monospace; color:#0A2540; font-size:14px; font-weight:700;">${formatNumberOnly(documentData.totalCredit)}</td>
            <td style="padding:10px 14px; border:1px solid #CBD5E1;"></td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  const statementText =
    documentData.description ||
    documentData.notes ||
    (documentType === "INVOICE"
      ? `فاتورة مبيعات رقم ${docNum} للعميل ${documentData.customerName || "العميل النقدي"}`
      : "قيد محاسبي معتمد في نظام المحاسبة والإدارة المتكامل");

  container.innerHTML = `
    <!-- Header with Enterprise Logo -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #D4AF37; padding-bottom:14px; margin-bottom:16px;">
      <!-- Right Side: Arabic -->
      <div style="text-align:right;">
        <h1 style="margin:0; font-size:18px; font-weight:900; color:#0A2540; font-family:'Cairo', sans-serif;">🏢 ${companyMeta.nameAr}</h1>
        <div style="font-size:13px; font-weight:bold; color:#4A5B6F; margin-top:4px; font-family:'Cairo', sans-serif;">{companyMeta.industry} - العنوان: ${companyMeta.address}</div>
        <div style="font-size:12px; color:#4A5B6F; margin-top:2px; font-family:'Cairo', sans-serif;">للتواصل: ${companyMeta.phone}</div>
      </div>
      
      <!-- Middle: Logo -->
      <div style="text-align:center; flex-shrink:0;">
        <div style="background-color:#0A2540; color:#D4AF37; width:62px; height:62px; border-radius:12px; font-weight:900; font-size:14px; display:flex; flex-direction:column; align-items:center; justify-content:center; margin:0 auto; border:2px solid #D4AF37;">
          <span style="font-size:12px; font-family:monospace;">${companyMeta.logoText}</span>
          <span style="font-size:8px; color:rgba(212, 175, 55, 0.9);">MeDo ERP</span>
        </div>
      </div>

      <!-- Left Side: English -->
      <div style="text-align:left; direction:ltr;">
        <h2 style="margin:0; font-size:14px; font-weight:900; color:#0A2540; font-family:'Cairo', sans-serif;">${companyMeta.nameEn}</h2>
        <div style="font-size:11px; color:#4A5B6F; margin-top:3px; font-family:'Cairo', sans-serif;">${companyMeta.nameEn.split(" ").slice(0, 3).join(" ")} Support</div>
        <div style="font-size:11px; color:#4A5B6F; margin-top:2px; font-family:'Cairo', sans-serif;">Tel: ${companyMeta.phone}</div>
      </div>
    </div>

    <!-- Document Title & Reference Bar -->
    <div style="background-color:#F8FAFC; border:1px solid #E0E6ED; border-radius:10px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
      <div>
        <div style="font-size:12px; color:#4A5B6F; font-weight:bold;">نوع المستند:</div>
        <div style="font-size:22px; font-weight:700; color:#0A2540; margin-top:2px; font-family:'Cairo', sans-serif;">📄 ${docTitle}</div>
      </div>
      <div style="text-align:left;" dir="ltr">
        <div style="font-size:16px; font-weight:700; color:#0A2540; font-family:monospace;">Reference No: ${docNum}</div>
        <div style="font-size:14px; font-weight:700; color:#4A5B6F; margin-top:2px;" dir="rtl">تاريخ الإصدار: <b>${formatCalendarDate(documentData.date || documentData.issueDate || new Date())}</b></div>
        <div style="font-size:14px; font-weight:700; color:#4A5B6F; margin-top:2px;" dir="rtl">تاريخ الطباعة: <b>${todayDate}</b></div>
      </div>
    </div>

    <!-- General Statement (البيان العام) -->
    <div style="background-color:#F8FAFC; border:1px solid #E0E6ED; border-radius:10px; padding:12px 16px; margin-bottom:14px; font-size:14px; font-weight:700; color:#1A2B4C; line-height:1.65;">
      <b style="color:#0A2540; font-weight:700;">البيان العام: </b> ${statementText}
    </div>

    <!-- Main Table -->
    ${tableHtml}

    <!-- Signatures Section -->
    <div style="margin-top:36px; border-top:2px solid #E0E6ED; padding-top:20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; text-align:center; font-size:14px;">
      <div>
        <div style="font-weight:700; color:#0A2540;">المدقق المالي</div>
        <div style="margin-top:30px; border-bottom:1px dashed #94A3B8; padding-bottom:4px; color:#4A5B6F;">___________________</div>
      </div>
      <div>
        <div style="font-weight:700; color:#0A2540;">توقيع العميل / المدير (إلكتروني)</div>
        <div style="margin-top:30px; border-bottom:1px dashed #94A3B8; padding-bottom:4px; color:#4A5B6F;">___________________</div>
      </div>
      <div>
        <div style="font-weight:700; color:#0A2540;">الختم الرسمي للمؤسسة</div>
        <div style="margin-top:30px; font-weight:700; font-size:13px; color:#D4AF37;">${companyMeta.nameAr}</div>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="margin-top:28px; text-align:center; font-size:12px; font-weight:600; color:#6B7A8F; border-top:1px solid #E0E6ED; padding-top:10px; line-height:1.6;">
      <div>© 2026 ميدو تك و ${companyMeta.nameAr} | MeDo ERP</div>
      <div>نظام المحاسبة والإدارة المتكامل</div>
    </div>
  `;

  document.body.appendChild(container);
  const success = await exportElementToPdf("temp-pdf-export-container", filename);
  document.body.removeChild(container);

  return success;
}

/**
 * Export Financial Reports (Balance Sheet, Income Statement, Trial Balance, Cash Flow) to PDF
 */
export async function exportFinancialReportToPdf(
  reportType: "BALANCE_SHEET" | "INCOME_STATEMENT" | "TRIAL_BALANCE" | "CASH_FLOW",
  fiscalYear: string,
  reportData: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalRevenues: number;
    totalExpenses: number;
    netProfit: number;
    trialTotalDebit: number;
    trialTotalCredit: number;
    assetAccounts?: any[];
    liabilityAccounts?: any[];
    equityAccounts?: any[];
    revenueAccounts?: any[];
    expenseAccounts?: any[];
    allAccounts?: any[];
  },
  currencies: CurrencyInfo[],
  displayCurrency: CurrencyCode
): Promise<boolean> {
  const todayDate = getTodayFormattedDate();
  const companyMeta = TenantIsolationService.getActiveTenantDetails();

  let reportTitle = "التقرير المالي الختامي";
  if (reportType === "BALANCE_SHEET") reportTitle = "قائمة المركز المالي - الميزانية العمومية (Balance Sheet)";
  else if (reportType === "INCOME_STATEMENT") reportTitle = "قائمة الدخل والأرباح والخسائر (Income Statement / P&L)";
  else if (reportType === "TRIAL_BALANCE") reportTitle = "ميزان المراجعة بالأرصدة (Trial Balance)";
  else if (reportType === "CASH_FLOW") reportTitle = "قائمة التدفقات النقدية (Cash Flow Statement)";

  const filename = `التقرير_المالي_${reportType}_${fiscalYear}_${new Date().toISOString().split("T")[0]}.pdf`;

  // Existing report canvas check
  const existingReportCanvas = document.getElementById("financial-report-canvas");
  if (existingReportCanvas) {
    return exportElementToPdf("financial-report-canvas", filename);
  }

  // Create clean formatted DOM structure
  const container = document.createElement("div");
  container.id = "temp-report-pdf-container";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "790px";
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#1A2B4C";
  container.style.padding = "24px";
  container.style.fontFamily = "'Noto Naskh Arabic', 'Amiri', 'Droid Arabic Naskh', 'Traditional Arabic', sans-serif";
  container.style.direction = "rtl";

  let bodyContentHtml = "";

  if (reportType === "BALANCE_SHEET") {
    bodyContentHtml = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; font-size:14.5px;">
        <div style="border:1px solid #E0E6ED; border-radius:10px; padding:14px; background-color:#F8FAFC;">
          <h3 style="margin:0 0 10px 0; font-size:15px; font-weight:bold; color:#0A2540; border-bottom:2px solid #0A2540; padding-bottom:6px;">
            1. الأصول والموجودات (Assets)
          </h3>
          ${(reportData.assetAccounts || [])
            .map(
              (acc) => `
            <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #E0E6ED; font-size:14.5px;">
              <span>${acc.code} - ${acc.nameAr}</span>
              <span style="font-family:monospace; font-weight:bold; color:#1A2B4C;">${formatMoney(acc.currentBalance, acc.currency || displayCurrency, currencies)}</span>
            </div>
          `
            )
            .join("")}
          <div style="display:flex; justify-content:space-between; margin-top:14px; padding-top:8px; border-top:2px solid #0A2540; font-weight:bold; font-size:15px; color:#0A2540;">
            <span>إجمالي الأصول:</span>
            <span style="font-family:monospace;">${formatMoney(reportData.totalAssets, displayCurrency, currencies)}</span>
          </div>
        </div>

        <div style="border:1px solid #E0E6ED; border-radius:10px; padding:14px; background-color:#F8FAFC;">
          <h3 style="margin:0 0 10px 0; font-size:15px; font-weight:bold; color:#0A2540; border-bottom:2px solid #0A2540; padding-bottom:6px;">
            2. الالتزامات وحقوق الملكية (Liabilities & Equity)
          </h3>
          <div style="font-weight:bold; color:#4A5B6F; margin-bottom:6px; font-size:14.5px;">أ. الالتزامات (Liabilities)</div>
          ${(reportData.liabilityAccounts || [])
            .map(
              (acc) => `
            <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #E0E6ED; font-size:14.5px;">
              <span>${acc.code} - ${acc.nameAr}</span>
              <span style="font-family:monospace; font-weight:bold; color:#1A2B4C;">${formatMoney(acc.currentBalance, acc.currency || displayCurrency, currencies)}</span>
            </div>
          `
            )
            .join("")}
          
          <div style="font-weight:bold; color:#4A5B6F; margin:10px 0 6px 0; font-size:14.5px;">ب. حقوق الملكية وصافي ربح العام (Equity & Profit)</div>
          ${(reportData.equityAccounts || [])
            .map(
              (acc) => `
            <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #E0E6ED; font-size:14.5px;">
              <span>${acc.code} - ${acc.nameAr}</span>
              <span style="font-family:monospace; font-weight:bold; color:#1A2B4C;">${formatMoney(acc.currentBalance, acc.currency || displayCurrency, currencies)}</span>
            </div>
          `
            )
            .join("")}
          <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #E0E6ED; color:#0A2540; font-weight:bold; font-size:14.5px;">
            <span>صافي أرباح/خسائر الفترة الحالية:</span>
            <span style="font-family:monospace;">${formatMoney(reportData.netProfit, displayCurrency, currencies)}</span>
          </div>

          <div style="display:flex; justify-content:space-between; margin-top:14px; padding-top:8px; border-top:2px solid #0A2540; font-weight:bold; font-size:15px; color:#0A2540;">
            <span>إجمالي الالتزامات وحقوق الملكية:</span>
            <span style="font-family:monospace;">${formatMoney(reportData.totalLiabilities + reportData.totalEquity + reportData.netProfit, displayCurrency, currencies)}</span>
          </div>
        </div>
      </div>
    `;
  } else if (reportType === "INCOME_STATEMENT") {
    bodyContentHtml = `
      <div style="border:1px solid #E0E6ED; border-radius:10px; padding:16px; background-color:#F8FAFC; font-size:14.5px; margin-bottom:20px;">
        <h3 style="margin:0 0 12px 0; font-size:16px; font-weight:bold; color:#0A2540; border-bottom:2px solid #0A2540; padding-bottom:6px;">
          قائمة الأرباح والخسائر عن السنة المالية ${fiscalYear}
        </h3>

        <div style="margin-bottom:16px;">
          <div style="font-weight:bold; font-size:14.5px; color:#0A2540; margin-bottom:6px;">أولاً: الإيرادات التشغيلية والتجارية (Revenues)</div>
          ${(reportData.revenueAccounts || [])
            .map(
              (acc) => `
            <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #E0E6ED;">
              <span>${acc.code} - ${acc.nameAr}</span>
              <span style="font-family:monospace; font-weight:bold; color:#1A2B4C;">${formatMoney(acc.currentBalance, acc.currency || displayCurrency, currencies)}</span>
            </div>
          `
            )
            .join("")}
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-top:2px solid #0A2540; font-weight:bold; font-size:15px; color:#0A2540;">
            <span>إجمالي الإيرادات:</span>
            <span style="font-family:monospace;">${formatMoney(reportData.totalRevenues, displayCurrency, currencies)}</span>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <div style="font-weight:bold; font-size:14.5px; color:#0A2540; margin-bottom:6px;">ثانياً: المصروفات والتكاليف التشغيلية (Expenses)</div>
          ${(reportData.expenseAccounts || [])
            .map(
              (acc) => `
            <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #E0E6ED;">
              <span>${acc.code} - ${acc.nameAr}</span>
              <span style="font-family:monospace; font-weight:bold; color:#1A2B4C;">${formatMoney(acc.currentBalance, acc.currency || displayCurrency, currencies)}</span>
            </div>
          `
            )
            .join("")}
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-top:2px solid #0A2540; font-weight:bold; font-size:15px; color:#0A2540;">
            <span>إجمالي المصروفات:</span>
            <span style="font-family:monospace;">${formatMoney(reportData.totalExpenses, displayCurrency, currencies)}</span>
          </div>
        </div>

        <div style="padding:12px; background-color:#FFFFFF; border:1px solid #E0E6ED; border-radius:8px; display:flex; justify-content:space-between; font-weight:bold; font-size:16px; color:#0A2540;">
          <span>صافي الربح / الخسارة التشغيلي:</span>
          <span style="font-family:monospace;">${formatMoney(reportData.netProfit, displayCurrency, currencies)}</span>
        </div>
      </div>
    `;
  } else if (reportType === "TRIAL_BALANCE") {
    bodyContentHtml = `
      <div style="margin-bottom:20px;">
        <table style="width:100%; border-collapse:collapse; font-size:14.5px; text-align:right; border:1px solid #E0E6ED;">
          <thead>
            <tr style="background-color:#0A2540; color:#FFFFFF;">
              <th style="padding:10px 14px; border:1px solid #0A2540; font-weight:700;">رمز الحساب</th>
              <th style="padding:10px 14px; border:1px solid #0A2540; font-weight:700;">اسم الحساب المالي</th>
              <th style="padding:10px 14px; border:1px solid #0A2540; text-align:left; font-weight:700;">إجمالي المدين</th>
              <th style="padding:10px 14px; border:1px solid #0A2540; text-align:left; font-weight:700;">إجمالي الدائن</th>
            </tr>
          </thead>
          <tbody>
            ${(reportData.allAccounts || [])
              .map(
                (acc, idx) => `
              <tr style="background-color:${idx % 2 === 1 ? "#F8FAFC" : "#FFFFFF"};">
                <td style="padding:9px 14px; border:1px solid #E0E6ED; font-family:monospace; font-weight:bold; color:#1A2B4C;">${acc.code}</td>
                <td style="padding:9px 14px; border:1px solid #E0E6ED; font-weight:600; color:#1A2B4C;">${acc.nameAr}</td>
                <td style="padding:9px 14px; border:1px solid #E0E6ED; text-align:left; font-family:monospace; color:#1A2B4C;">
                  ${acc.currentBalance >= 0 ? formatNumberOnly(acc.currentBalance) : "-"}
                </td>
                <td style="padding:9px 14px; border:1px solid #E0E6ED; text-align:left; font-family:monospace; color:#1A2B4C;">
                  ${acc.currentBalance < 0 ? formatNumberOnly(Math.abs(acc.currentBalance)) : "-"}
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr style="background-color:#F1F5F9; font-weight:700; font-size:15px;">
              <td colspan="2" style="padding:10px 14px; border:1px solid #E0E6ED; color:#0A2540;">الإجمالي المالي الموزون:</td>
              <td style="padding:10px 14px; border:1px solid #E0E6ED; text-align:left; font-family:monospace; color:#0A2540;">${formatNumberOnly(reportData.trialTotalDebit)}</td>
              <td style="padding:10px 14px; border:1px solid #E0E6ED; text-align:left; font-family:monospace; color:#0A2540;">${formatNumberOnly(reportData.trialTotalCredit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }

  container.innerHTML = `
    <!-- Header with Enterprise Logo -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #D4AF37; padding-bottom:14px; margin-bottom:16px;">
      <!-- Right Side: Arabic -->
      <div style="text-align:right;">
        <h1 style="margin:0; font-size:18px; font-weight:900; color:#0A2540; font-family:'Cairo', sans-serif;">🏢 ${companyMeta.nameAr}</h1>
        <div style="font-size:13px; font-weight:bold; color:#4A5B6F; margin-top:4px; font-family:'Cairo', sans-serif;">${companyMeta.industry} - العنوان: ${companyMeta.address}</div>
        <div style="font-size:12px; color:#4A5B6F; margin-top:2px; font-family:'Cairo', sans-serif;">للتواصل: ${companyMeta.phone}</div>
      </div>
      
      <!-- Middle: Logo -->
      <div style="text-align:center; flex-shrink:0;">
        <div style="background-color:#0A2540; color:#D4AF37; width:62px; height:62px; border-radius:12px; font-weight:900; font-size:14px; display:flex; flex-direction:column; align-items:center; justify-content:center; margin:0 auto; border:2px solid #D4AF37;">
          <span style="font-size:12px; font-family:monospace;">${companyMeta.logoText}</span>
          <span style="font-size:8px; color:rgba(212, 175, 55, 0.9);">MeDo ERP</span>
        </div>
      </div>

      <!-- Left Side: English -->
      <div style="text-align:left; direction:ltr;">
        <h2 style="margin:0; font-size:14px; font-weight:900; color:#0A2540; font-family:'Cairo', sans-serif;">${companyMeta.nameEn}</h2>
        <div style="font-size:11px; color:#4A5B6F; margin-top:3px; font-family:'Cairo', sans-serif;"><b>Reference No:</b> ${reportType}-${fiscalYear}</div>
        <div style="font-size:11px; color:#4A5B6F; margin-top:2px; font-family:'Cairo', sans-serif;"><b>Date:</b> ${todayDate.split(" ")[0]}</div>
      </div>
    </div>

    <!-- Report Title Bar -->
    <div style="background-color:#0A2540; color:#FFFFFF; border-radius:10px; padding:14px 18px; display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <div>
        <div style="font-size:12px; color:#B0C4DE;">اسم التقرير المالي الختامي:</div>
        <div style="font-size:23px; font-weight:700; color:#FFFFFF; margin-top:2px; font-family:'Cairo', sans-serif;">${reportTitle}</div>
      </div>
      <div style="text-align:left;" dir="ltr">
        <div style="font-size:14px; color:#FFFFFF;">السنة المالية: <b>${fiscalYear}</b></div>
        <div style="font-size:12px; color:#D4AF37; margin-top:2px;" dir="rtl">تاريخ التصدير: <b>${todayDate}</b></div>
      </div>
    </div>

    ${bodyContentHtml}

    <!-- Official Signatures Footer -->
    <div style="margin-top:36px; border-top:2px solid #E0E6ED; padding-top:20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; text-align:center; font-size:14.5px;">
      <div>
        <div style="font-weight:600; color:#0A2540;">رئيس قسم المحاسبة العامة</div>
        <div style="margin-top:30px; border-bottom:1px dashed #94A3B8; padding-bottom:4px; color:#4A5B6F;">___________________</div>
      </div>
      <div>
        <div style="font-weight:600; color:#0A2540;">المدير المالي والتنفيذي (CFO)</div>
        <div style="margin-top:30px; border-bottom:1px dashed #94A3B8; padding-bottom:4px; color:#4A5B6F;">___________________</div>
      </div>
      <div>
        <div style="font-weight:600; color:#0A2540;">الختم الرسمي للمؤسسة</div>
        <div style="margin-top:30px; font-weight:bold; font-size:13px; color:#D4AF37;">${companyMeta.nameAr}</div>
      </div>
    </div>
    
    <!-- Footer (11-12px Light) -->
    <div style="margin-top:28px; text-align:center; font-size:11.5px; font-weight:300; color:#6B7A8F; border-top:1px solid #E0E6ED; padding-top:10px; line-height:1.6;">
      <div>© 2026 ميدو تك و {companyMeta.nameAr} | MeDo ERP</div>
      <div>نظام المحاسبة والإدارة المتكامل</div>
    </div>
  `;

  document.body.appendChild(container);
  const success = await exportElementToPdf("temp-report-pdf-container", filename);
  document.body.removeChild(container);

  return success;
}

/**
 * Export any active open table or container directly to PDF file using html2pdf.js
 */
export async function exportActiveTableToPdf(
  elementIdOrElement: string | HTMLElement,
  reportTitle: string = "تقرير مالي وجدول بيانات",
  filenameOverride?: string
): Promise<boolean> {
  const targetElement = typeof elementIdOrElement === "string" 
    ? document.getElementById(elementIdOrElement) 
    : elementIdOrElement;

  if (!targetElement) {
    console.warn(`Target element not found for PDF export`);
    window.print();
    return false;
  }

  const filename = filenameOverride || `تقرير_جدول_${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  const todayDate = getTodayFormattedDate();
  const companyMeta = TenantIsolationService.getActiveTenantDetails();

  // Create clean formatted DOM wrapper container
  const container = document.createElement("div");
  container.id = "temp-active-table-pdf-container";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "790px";
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#1A2B4C";
  container.style.padding = "24px";
  container.style.fontFamily = "'Noto Naskh Arabic', 'Amiri', 'Droid Arabic Naskh', 'Traditional Arabic', sans-serif";
  container.style.direction = "rtl";

  // Clone node so original UI isn't altered
  const clonedContent = targetElement.cloneNode(true) as HTMLElement;

  container.innerHTML = `
    <!-- Enterprise Header -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #D4AF37; padding-bottom:14px; margin-bottom:16px;">
      <div style="text-align:right;">
        <h1 style="margin:0; font-size:18px; font-weight:900; color:#0A2540; font-family:'Cairo', sans-serif;">🏢 ${companyMeta.nameAr}</h1>
        <div style="font-size:13px; font-weight:bold; color:#4A5B6F; margin-top:4px; font-family:'Cairo', sans-serif;">نظام المحاسبة والإدارة الإلكتروني - التوثيق المؤسسي الرسمي</div>
        <div style="font-size:12px; color:#4A5B6F; margin-top:2px; font-family:'Cairo', sans-serif;">للتواصل: ${companyMeta.phone}</div>
      </div>
      
      <div style="text-align:center; flex-shrink:0;">
        <div style="background-color:#0A2540; color:#D4AF37; width:62px; height:62px; border-radius:12px; font-weight:900; font-size:14px; display:flex; flex-direction:column; align-items:center; justify-content:center; margin:0 auto; border:2px solid #D4AF37;">
          <span style="font-size:12px; font-family:monospace;">${companyMeta.logoText}</span>
          <span style="font-size:8px; color:rgba(212, 175, 55, 0.9);">MeDo ERP</span>
        </div>
      </div>

      <div style="text-align:left; direction:ltr;">
        <h2 style="margin:0; font-size:14px; font-weight:900; color:#0A2540; font-family:'Cairo', sans-serif;">${companyMeta.nameEn}</h2>
        <div style="font-size:11px; color:#4A5B6F; margin-top:3px; font-family:'Cairo', sans-serif;">Institutional PDF Export (html2pdf.js)</div>
        <div style="font-size:11px; color:#4A5B6F; margin-top:2px; font-family:'Cairo', sans-serif;">Date: ${todayDate}</div>
      </div>
    </div>

    <!-- Title Bar -->
    <div style="background-color:#0A2540; color:#FFFFFF; border-radius:10px; padding:12px 18px; display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <div>
        <div style="font-size:12px; color:#B0C4DE;">عنوان التقرير / الجدول المفتوح:</div>
        <div style="font-size:20px; font-weight:700; color:#FFFFFF; margin-top:2px; font-family:'Cairo', sans-serif;">📄 ${reportTitle}</div>
      </div>
      <div style="text-align:left;" dir="ltr">
        <div style="font-size:12px; color:#D4AF37;" dir="rtl">تاريخ التصدير: <b>${todayDate}</b></div>
      </div>
    </div>

    <!-- Active Table/Content -->
    <div style="overflow-x:auto;">
      ${clonedContent.outerHTML}
    </div>

    <!-- Signatures Footer -->
    <div style="margin-top:36px; border-top:2px solid #E0E6ED; padding-top:20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; text-align:center; font-size:14px;">
      <div>
        <div style="font-weight:700; color:#0A2540;">إعداد وتوثيق</div>
        <div style="margin-top:30px; border-bottom:1px dashed #94A3B8; padding-bottom:4px; color:#4A5B6F;">___________________</div>
      </div>
      <div>
        <div style="font-weight:700; color:#0A2540;">الاعتماد المالي والرقابي</div>
        <div style="margin-top:30px; border-bottom:1px dashed #94A3B8; padding-bottom:4px; color:#4A5B6F;">___________________</div>
      </div>
      <div>
        <div style="font-weight:700; color:#0A2540;">الختم الرسمي للمؤسسة</div>
        <div style="margin-top:30px; font-weight:700; font-size:13px; color:#D4AF37;">${companyMeta.nameAr}</div>
      </div>
    </div>

    <!-- Footer -->
    <div style="margin-top:28px; text-align:center; font-size:12px; font-weight:600; color:#6B7A8F; border-top:1px solid #E0E6ED; padding-top:10px;">
      <div>© 2026 ميدو تك و ${companyMeta.nameAr} | MeDo ERP</div>
      <div>تم التصدير الآلي بصيغة PDF بواسطة html2pdf.js لتعزيز التوثيق المؤسسي</div>
    </div>
  `;

  document.body.appendChild(container);
  const success = await exportElementToPdf("temp-active-table-pdf-container", filename);
  document.body.removeChild(container);

  return success;
}

/**
 * Export Comprehensive Technical Reference Document as a rich, organized, and styled PDF file
 * Includes System Logo, Facility / Company Data, Full File Tree, Accounting Modules, Journal Simulator, Glossary & Signatures.
 */
export async function exportComprehensiveTechnicalReferencePdf(
  modulesData: any[],
  glossaryTerms: any[],
  companyNameOverride?: string,
  currentUserName?: string
): Promise<boolean> {
  const companyMeta = TenantIsolationService.getActiveTenantDetails();
  const activeCompanyName = companyNameOverride || companyMeta.nameAr || "شركة البدر للأدوية والمستلزمات الطبية";
  const todayDualDate = formatDualDate(new Date().toISOString());
  const refCode = "REF-MEDO-ERP-2026-SYSREF-FULL";
  const exporterName = currentUserName || "إدارة النظم والتوثيق المالي";

  const filename = `المرجع_الفني_الشامل_MeDo_ERP_${activeCompanyName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

  // System File Tree Data
  const systemFileTreeData = [
    { num: 1, nameEn: "index.html", nameAr: "صفحة البداية الرئيسية", desc: "نقطة انطلاق التطبيق وإعدادات الخطوط والوسوم", path: "/" },
    { num: 2, nameEn: "package.json", nameAr: "ملف حزم المكتبات", desc: "قائمة الاعتماديات والمكتبات المستخدمة للنظام", path: "/" },
    { num: 3, nameEn: "server.ts", nameAr: "خادم Express الخلفي", desc: "محرك API، الذكاء الاصطناعي، والتحقق من الهوية", path: "/" },
    { num: 4, nameEn: "src/App.tsx", nameAr: "التطبيق الرئيسي والتوجيه", desc: "إدارة الشاشات، الحالة الرئيسية، والتنقل", path: "/src/App.tsx" },
    { num: 5, nameEn: "src/components/MainLayout.tsx", nameAr: "الهيكل العام والتخطيط", desc: "الشريط العلوي، القائمة الجانبية، والتذييل", path: "/src/components/MainLayout.tsx" },
    { num: 6, nameEn: "src/components/UserManualView.tsx", nameAr: "دليل المستخدم والمرجع الفني", desc: "واجهة استعراض الشرح والمحاكي والمسرد والفيو", path: "/src/components/UserManualView.tsx" },
    { num: 7, nameEn: "src/services/pdfExporter.ts", nameAr: "محرك تصدير الـ PDF المؤسسي", desc: "توليد ملفات الـ PDF الرسمية والفواتير والتقارير", path: "/src/services/pdfExporter.ts" },
    { num: 8, nameEn: "src/services/tenantIsolationService.ts", nameAr: "محرك عزل المستأجرين", desc: "ضمان الأمان وعزل بيانات الشركات والمستخدمين", path: "/src/services/tenantIsolationService.ts" },
    { num: 9, nameEn: "src/services/erpStorage.ts", nameAr: "مستودع البيانات المحاسبية Local/DB", desc: "حفظ واسترجاع القيود والفواتير والحسابات", path: "/src/services/erpStorage.ts" },
    { num: 10, nameEn: "src/components/JournalEntriesView.tsx", nameAr: "واجهة قيود اليومية العامة", desc: "تسجيل واعتماد ومعاينة قيود اليومية بنظام القيد المزدوج", path: "/src/components/JournalEntriesView.tsx" },
    { num: 11, nameEn: "src/components/ChartOfAccountsView.tsx", nameAr: "واجهة شجرة الحسابات الموحدة", desc: "إدارة وتصنيف دليل الحسابات المالي والتحليلي", path: "/src/components/ChartOfAccountsView.tsx" },
    { num: 12, nameEn: "src/components/SalesAndReturnsView.tsx", nameAr: "واجهة المبيعات والفوترة الإلكترونية", desc: "إصدار فواتير المبيعات الضريبية وإشعارات الدائن", path: "/src/components/SalesAndReturnsView.tsx" },
    { num: 13, nameEn: "src/components/PurchasesAndReturnsView.tsx", nameAr: "واجهة المشتريات والموردين", desc: "تسجيل فواتير الشراء واحتساب التكاليف الإضافية", path: "/src/components/PurchasesAndReturnsView.tsx" },
    { num: 14, nameEn: "src/components/InventoryView.tsx", nameAr: "واجهة المخزون والمستودعات", desc: "تتبع التشغيلات (Batches)، الصلاحية، وسياسة FEFO", path: "/src/components/InventoryView.tsx" },
    { num: 15, nameEn: "src/components/FinancialReportsView.tsx", nameAr: "واجهة القوائم والتقارير المالية", desc: "ميزان المراجعة، قائمة الدخل، والمركز المالي", path: "/src/components/FinancialReportsView.tsx" },
  ];

  const container = document.createElement("div");
  container.id = "temp-comprehensive-ref-pdf-container";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "820px";
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#0F172A";
  container.style.padding = "28px";
  container.style.fontFamily = "'Noto Naskh Arabic', 'Cairo', 'Amiri', 'Traditional Arabic', sans-serif";
  container.style.direction = "rtl";

  const modulesHtml = modulesData.map((mod: any, idx: number) => `
    <div style="border:1px solid #CBD5E1; border-radius:10px; padding:16px; margin-bottom:20px; background-color:#FFFFFF; page-break-inside:avoid;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0EA5E9; padding-bottom:8px; margin-bottom:12px;">
        <div>
          <span style="font-family:monospace; font-size:11px; font-weight:bold; background-color:#F0F9FF; color:#0284C7; padding:3px 8px; border-radius:4px; border:1px solid #BAE6FD;">
            ${mod.sapCode}
          </span>
          <h3 style="margin:6px 0 2px 0; font-size:16px; font-weight:800; color:#0F172A; font-family:'Cairo', sans-serif;">
            ${idx + 1}. ${mod.titleAr} <span style="font-size:12px; color:#64748B; font-weight:normal;">(${mod.titleEn})</span>
          </h3>
          <p style="margin:0; font-size:11.5px; color:#475569;">${mod.shortDesc}</p>
        </div>
        <span style="font-size:11px; font-weight:bold; padding:4px 10px; border-radius:6px; background-color:#ECFDF5; color:#047857; border:1px solid #A7F3D0;">
          ${mod.badge}
        </span>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
        <div style="background-color:#F8FAFC; padding:10px; border-radius:6px; border:1px solid #E2E8F0;">
          <div style="font-size:11px; font-weight:bold; color:#0369A1; margin-bottom:3px;">💡 الهدف المالي والرقابي:</div>
          <div style="font-size:11px; color:#334155; line-height:1.5;">${mod.financialPurpose}</div>
        </div>
        <div style="background-color:#F8FAFC; padding:10px; border-radius:6px; border:1px solid #E2E8F0;">
          <div style="font-size:11px; font-weight:bold; color:#1D4ED8; margin-bottom:3px;">🛡️ المعيار المحاسبي الحاكم:</div>
          <div style="font-size:11px; color:#334155; line-height:1.5;">${mod.accountingStandard}</div>
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <div style="font-size:12px; font-weight:bold; color:#0F172A; margin-bottom:6px;">📌 الضوابط والمفاهيم الجوهرية:</div>
        <ul style="margin:0; padding-right:20px; font-size:11px; color:#334155; line-height:1.6;">
          ${mod.keyConcepts.map((c: string) => `<li>${c}</li>`).join("")}
        </ul>
      </div>

      <div style="margin-bottom:12px;">
        <div style="font-size:12px; font-weight:bold; color:#0F172A; margin-bottom:6px;">🔄 خطوات التشغيل والعمل:</div>
        <ol style="margin:0; padding-right:20px; font-size:11px; color:#334155; line-height:1.6;">
          ${mod.workflowSteps.map((s: any) => `
            <li>
              <b>${s.stepTitle}:</b> ${s.description}
              ${s.tips ? `<br/><span style="color:#D97706; font-size:10px;">💡 نصيحة: ${s.tips}</span>` : ""}
            </li>
          `).join("")}
        </ol>
      </div>

      ${mod.sampleJournalEntry ? `
        <div style="margin-top:10px; background-color:#F8FAFC; padding:10px; border-radius:8px; border:1px solid #E2E8F0;">
          <div style="font-size:11.5px; font-weight:bold; color:#0F172A; margin-bottom:6px;">📖 قيد اليومية النموذجي (${mod.sampleJournalEntry.scenario}):</div>
          <table style="width:100%; border-collapse:collapse; font-size:10.5px; text-align:right; border:1px solid #CBD5E1;">
            <thead>
              <tr style="background-color:#0F172A; color:#FFFFFF;">
                <th style="padding:5px 8px; border:1px solid #475569;">رقم الحساب</th>
                <th style="padding:5px 8px; border:1px solid #475569;">اسم الحساب المحاسبي</th>
                <th style="padding:5px 8px; border:1px solid #475569; text-align:center;">مدين (Debit)</th>
                <th style="padding:5px 8px; border:1px solid #475569; text-align:center;">دائن (Credit)</th>
                <th style="padding:5px 8px; border:1px solid #475569;">البيان والشرح</th>
              </tr>
            </thead>
            <tbody>
              ${mod.sampleJournalEntry.rows.map((r: any) => `
                <tr style="border-bottom:1px solid #E2E8F0;">
                  <td style="padding:5px 8px; font-family:monospace; border:1px solid #CBD5E1;">${r.accountCode}</td>
                  <td style="padding:5px 8px; font-weight:bold; border:1px solid #CBD5E1;">${r.accountName}</td>
                  <td style="padding:5px 8px; text-align:center; font-weight:bold; color:#059669; border:1px solid #CBD5E1;">${r.debit}</td>
                  <td style="padding:5px 8px; text-align:center; font-weight:bold; color:#2563EB; border:1px solid #CBD5E1;">${r.credit}</td>
                  <td style="padding:5px 8px; color:#475569; border:1px solid #CBD5E1;">${r.description}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div style="font-size:10px; color:#64748B; margin-top:4px;">ملاحظة: ${mod.sampleJournalEntry.notes}</div>
        </div>
      ` : ""}
    </div>
  `).join("");

  const fileTreeHtml = systemFileTreeData.map((f: any) => `
    <tr style="border-bottom:1px solid #E2E8F0;">
      <td style="padding:6px 8px; text-align:center; font-weight:bold; border:1px solid #CBD5E1;">${f.num}</td>
      <td style="padding:6px 8px; font-family:monospace; font-weight:bold; color:#0F172A; border:1px solid #CBD5E1;" dir="ltr">${f.nameEn}</td>
      <td style="padding:6px 8px; font-weight:bold; color:#0284C7; border:1px solid #CBD5E1;">${f.nameAr}</td>
      <td style="padding:6px 8px; color:#334155; border:1px solid #CBD5E1;">${f.desc}</td>
      <td style="padding:6px 8px; font-family:monospace; font-size:10px; color:#64748B; border:1px solid #CBD5E1;" dir="ltr">${f.path}</td>
    </tr>
  `).join("");

  const glossaryHtml = glossaryTerms.map((t: any, i: number) => `
    <tr style="border-bottom:1px solid #E2E8F0;">
      <td style="padding:6px 8px; text-align:center; border:1px solid #CBD5E1;">${i + 1}</td>
      <td style="padding:6px 8px; font-weight:bold; color:#0F172A; border:1px solid #CBD5E1;">${t.termAr}</td>
      <td style="padding:6px 8px; font-family:monospace; font-weight:bold; color:#0284C7; border:1px solid #CBD5E1;" dir="ltr">${t.termEn}</td>
      <td style="padding:6px 8px; color:#334155; border:1px solid #CBD5E1; line-height:1.5;">${t.def}</td>
    </tr>
  `).join("");

  container.innerHTML = `
    <!-- Institutional Cover Header & Logo Badge -->
    <div style="border-bottom:3px solid #D4AF37; padding-bottom:18px; margin-bottom:20px; display:flex; justify-style:space-between; align-items:flex-start; background-color:#0F172A; color:#FFFFFF; padding:20px; border-radius:12px;">
      <div style="flex:1;">
        <div style="display:inline-block; background-color:#D4AF37; color:#0F172A; font-size:10px; font-weight:900; padding:2px 8px; border-radius:4px; font-family:'Cairo', sans-serif; margin-bottom:6px;">
          الوثيقة المرجعية الرسمية المعتمدة v4.2
        </div>
        <h1 style="margin:0; font-size:20px; font-weight:900; color:#FFFFFF; font-family:'Cairo', sans-serif;">
          🏢 ${activeCompanyName}
        </h1>
        <div style="font-size:13px; font-weight:bold; color:#E2E8F0; margin-top:4px; font-family:'Cairo', sans-serif;">
          منظومة MeDo ERP - المرجع الفني والتوثيق التشغيلي المحاسبي الشامل
        </div>
        <div style="font-size:11px; color:#94A3B8; margin-top:6px; display:flex; gap:16px; flex-wrap:wrap;">
          <span>الرقم الضريبي VAT: <b>310123456700003</b></span>
          <span>السجل التجاري CR: <b>CR-101089204</b></span>
          <span>الفرع: <b>المركز الرئيسي - الإدارة العامة</b></span>
        </div>
      </div>

      <div style="text-align:center; padding-left:16px;">
        <div style="background:linear-gradient(135deg, #0F172A 0%, #1E293B 100%); color:#D4AF37; width:80px; height:80px; border-radius:16px; font-weight:900; font-size:16px; display:flex; flex-direction:column; align-items:center; justify-content:center; border:2px solid #D4AF37; box-shadow:0 4px 12px rgba(0,0,0,0.3);">
          <span style="font-size:18px; font-family:'Cairo', sans-serif; font-weight:900;">BZMT</span>
          <span style="font-size:8px; color:#E2E8F0; font-family:monospace; margin-top:-2px;">MeDo ERP</span>
        </div>
        <div style="font-size:9px; color:#D4AF37; margin-top:4px; font-weight:bold;">شعار المنظومة</div>
      </div>
    </div>

    <!-- Metadata Card -->
    <div style="background-color:#F8FAFC; border:1px solid #CBD5E1; border-radius:10px; padding:12px 16px; margin-bottom:24px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; font-size:11px;">
      <div>
        <span style="color:#64748B;">رقم المرجع التوثيقي:</span><br/>
        <strong style="color:#0F172A; font-family:monospace; font-size:11.5px;">${refCode}</strong>
      </div>
      <div>
        <span style="color:#64748B;">تاريخ التصدير والإصدار:</span><br/>
        <strong style="color:#0F172A;">${todayDualDate}</strong>
      </div>
      <div>
        <span style="color:#64748B;">تم الاستخراج بواسطة:</span><br/>
        <strong style="color:#0284C7;">${exporterName}</strong>
      </div>
    </div>

    <!-- Executive Summary -->
    <div style="margin-bottom:24px; background-color:#F0F9FF; border-right:4px solid #0284C7; padding:14px 16px; border-radius:0 8px 8px 0;">
      <h2 style="margin:0 0 6px 0; font-size:15px; color:#0369A1; font-family:'Cairo', sans-serif;">📋 الملخص التنفيذي للمنظومة المحاسبية</h2>
      <p style="margin:0; font-size:11.5px; color:#334155; line-height:1.6;">
        تعتبر منظومة <b>MeDo ERP (الإصدار المؤسسي v4.2)</b> النظام المحاسبي والإداري المركزي لـ <b>${activeCompanyName}</b>.
        يغطي هذا المرجع الفني كافة الشاشات والوحدات المحاسبية، شجرة الحسابات الموحدة، آلية تسجيل القيود اليومية بنظام القيد المزدوج، معالجة المبيعات والمشتريات والفوترة الإلكترونية المتوافقة مع متطلبات ZATCA والمعايير الدولية IFRS 15 و IAS 1 و IAS 21، بالإضافة للسياسات الخاصة بإدارة وعهد الأدوية والمستلزمات الطبية.
      </p>
    </div>

    <!-- SECTION 1: System File Tree -->
    <div style="margin-bottom:28px; page-break-inside:avoid;">
      <h2 style="font-size:16px; font-weight:800; color:#0F172A; border-bottom:2px solid #0F172A; padding-bottom:6px; margin-bottom:12px; font-family:'Cairo', sans-serif;">
        📂 أولاً: شجرة ملفات ومكونات النظام الكاملة (System Architecture File Tree)
      </h2>
      <table style="width:100%; border-collapse:collapse; font-size:11px; text-align:right; border:1px solid #CBD5E1;">
        <thead>
          <tr style="background-color:#0F172A; color:#FFFFFF;">
            <th style="padding:7px; border:1px solid #475569; text-align:center; width:30px;">#</th>
            <th style="padding:7px; border:1px solid #475569; width:150px;">اسم الملف (إنجليزي)</th>
            <th style="padding:7px; border:1px solid #475569; width:150px;">الاسم بالعربية</th>
            <th style="padding:7px; border:1px solid #475569;">الوصف والوظيفة</th>
            <th style="padding:7px; border:1px solid #475569; width:160px;">المسار</th>
          </tr>
        </thead>
        <tbody>
          ${fileTreeHtml}
        </tbody>
      </table>
    </div>

    <!-- SECTION 2: Modules Guide -->
    <div style="margin-bottom:28px;">
      <h2 style="font-size:16px; font-weight:800; color:#0F172A; border-bottom:2px solid #0F172A; padding-bottom:6px; margin-bottom:16px; font-family:'Cairo', sans-serif;">
        📚 ثانياً: الشرح التفصيلي للوحدات المحاسبية والقيود النموذجية (${modulesData.length} وحدات)
      </h2>
      ${modulesHtml}
    </div>

    <!-- SECTION 3: Glossary -->
    <div style="margin-bottom:28px; page-break-inside:avoid;">
      <h2 style="font-size:16px; font-weight:800; color:#0F172A; border-bottom:2px solid #0F172A; padding-bottom:6px; margin-bottom:12px; font-family:'Cairo', sans-serif;">
        📖 ثالثاً: مسرد المصطلحات المحاسبية والإنجليزية المعتمدة
      </h2>
      <table style="width:100%; border-collapse:collapse; font-size:11px; text-align:right; border:1px solid #CBD5E1;">
        <thead>
          <tr style="background-color:#0F172A; color:#FFFFFF;">
            <th style="padding:7px; border:1px solid #475569; text-align:center; width:30px;">#</th>
            <th style="padding:7px; border:1px solid #475569; width:160px;">المصطلح بالعربية</th>
            <th style="padding:7px; border:1px solid #475569; width:180px;">المصطلح بالإنجليزية (English)</th>
            <th style="padding:7px; border:1px solid #475569;">التعريف والمفهوم المحاسبي</th>
          </tr>
        </thead>
        <tbody>
          ${glossaryHtml}
        </tbody>
      </table>
    </div>

    <!-- SECTION 4: Pharma Guidelines -->
    <div style="margin-bottom:28px; page-break-inside:avoid; background-color:#FFFBEB; border:1px solid #FCD34D; padding:16px; border-radius:10px;">
      <h2 style="margin:0 0 10px 0; font-size:15px; color:#B45309; font-family:'Cairo', sans-serif;">
        💊 رابعاً: الإرشادات التشغيلية الخاصة بشركات الأدوية والمستلزمات الطبية
      </h2>
      <div style="font-size:11px; color:#78350F; line-height:1.6; space-y-2;">
        <p style="margin:0 0 6px 0;"><b>1. سياسة FEFO (First Expired First Out):</b> يلتزم النظام تلقائياً باقتراح واختيار التشغيلات ذات تاريخ الصلاحية الأقرب عند البيع والصرف لمنع تكدس الأدوية الراكدة.</p>
        <p style="margin:0 0 6px 0;"><b>2. إدارة عهد سيارات التوزيع:</b> تُعامل كل سيارة توزيع كمستودع متنقل فرعي، وتُصفى العهدة يومياً بتحويل المبيعات لفواتير نقدية وإعادة المتبقي للرفوف المركزية.</p>
        <p style="margin:0 0 6px 0;"><b>3. حظر وحجر التوالف ومنتهي الصلاحية:</b> أي صنف منتهي الصلاحية يُنقل فوراً لمستودع الحجر الصحي والتوالف لتثبيط البيع حتى صدور محضر الإتلاف والقيد المحاسبي المعاكس.</p>
        <p style="margin:0;"><b>4. السلسلة الباردة (Cold Chain):</b> تتيح بطاقات الأصناف تحديد ظروف التخزين المبردة لضمان مطابقة متطلبات هيئة الغذاء والدواء والرقابة الدوائية.</p>
      </div>
    </div>

    <!-- SECTION 5: Institutional Signatures & Stamp -->
    <div style="margin-top:36px; border-top:2px solid #0F172A; padding-top:20px; page-break-inside:avoid;">
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; text-align:center; font-size:12px;">
        <div>
          <div style="font-weight:bold; color:#0F172A;">إعداد التوثيق والنظم</div>
          <div style="margin-top:28px; border-bottom:1px dashed #64748B; padding-bottom:4px; color:#475569;">${exporterName}</div>
        </div>
        <div>
          <div style="font-weight:bold; color:#0F172A;">اعتماد المدير المالي (CFO)</div>
          <div style="margin-top:28px; border-bottom:1px dashed #64748B; padding-bottom:4px; color:#475569;">___________________</div>
        </div>
        <div>
          <div style="font-weight:bold; color:#0F172A;">الختم الرسمي للمنشأة</div>
          <div style="margin-top:24px; font-weight:900; font-size:12px; color:#D4AF37; border:2px border-dashed #D4AF37; padding:6px; border-radius:8px; display:inline-block;">
            ${activeCompanyName}
          </div>
        </div>
      </div>

      <div style="margin-top:24px; text-align:center; font-size:10.5px; color:#64748B; border-top:1px solid #E2E8F0; padding-top:10px;">
        <div>© 2026 ميدو تك لتقنية المعلومات و ${activeCompanyName} | MeDo ERP Enterprise Suite</div>
        <div>تم تصدير هذا المرجع الفني آلياً بتنسيق PDF عالي الدقة وربطه ببنية النظام الموحدة.</div>
      </div>
    </div>
  `;

  document.body.appendChild(container);
  const success = await exportElementToPdf("temp-comprehensive-ref-pdf-container", filename);
  document.body.removeChild(container);

  return success;
}
