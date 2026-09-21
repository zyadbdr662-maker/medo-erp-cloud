import React from "react";
import { Invoice, CurrencyInfo, CurrencyCode } from "../types/erp";
import { formatMoney } from "../services/erpStorage";
import { TenantIsolationService } from "../services/tenantIsolationService";
import { FileCheck, Download, Calculator, FileText, CheckCircle2 } from "lucide-react";
import { ExportPdfButton } from "./ExportPdfButton";

interface ZatcaVatReturnGeneratorProps {
  invoices: Invoice[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  fiscalYear: string;
}

export const ZatcaVatReturnGenerator: React.FC<ZatcaVatReturnGeneratorProps> = ({
  invoices,
  currencies,
  displayCurrency,
  fiscalYear,
}) => {
  const companyMeta = TenantIsolationService.getActiveTenantDetails();
  // Filter invoices for the current fiscal year
  const currentYearInvoices = invoices.filter(inv => inv.date.startsWith(fiscalYear));

  // Compute Sales (Standard Rated 15%)
  const salesInvoices = currentYearInvoices.filter(inv => inv.type === "SALES");
  const salesReturns = currentYearInvoices.filter(inv => inv.type === "SALES_RETURN");
  
  const totalSalesAmount = salesInvoices.reduce((sum, inv) => sum + (inv.subtotal || 0), 0) - salesReturns.reduce((sum, inv) => sum + (inv.subtotal || 0), 0);
  const totalSalesTax = salesInvoices.reduce((sum, inv) => sum + (inv.taxTotal || 0), 0) - salesReturns.reduce((sum, inv) => sum + (inv.taxTotal || 0), 0);

  // Compute Purchases (Standard Rated 15%)
  const purchaseInvoices = currentYearInvoices.filter(inv => inv.type === "PURCHASE");
  const purchaseReturns = currentYearInvoices.filter(inv => inv.type === "PURCHASE_RETURN");

  const totalPurchasesAmount = purchaseInvoices.reduce((sum, inv) => sum + (inv.subtotal || 0), 0) - purchaseReturns.reduce((sum, inv) => sum + (inv.subtotal || 0), 0);
  const totalPurchasesTax = purchaseInvoices.reduce((sum, inv) => sum + (inv.taxTotal || 0), 0) - purchaseReturns.reduce((sum, inv) => sum + (inv.taxTotal || 0), 0);

  // VAT Due calculation
  const netVatDue = totalSalesTax - totalPurchasesTax;

  const renderAmount = (amount: number) => formatMoney(amount, displayCurrency, currencies);

  return (
    <div id="vat-return-container" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-xl print:shadow-none print:border-none animate-in fade-in doc-canvas relative">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <FileCheck className="w-[400px] h-[400px] text-slate-500" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b-2 border-slate-800 print:border-slate-300">
          <div>
            <h2 className="text-2xl font-black text-white print:text-black">إقرار ضريبة القيمة المضافة</h2>
            <div className="text-sm text-slate-400 print:text-slate-600 mt-1">ZATCA VAT Return Form - للسنة المالية {fiscalYear}</div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <ExportPdfButton
              targetId="vat-return-container"
              reportTitle={`إقرار ضريبة القيمة المضافة ZATCA للسنة المالية ${fiscalYear}`}
              filename={`إقرار_الضريبة_${fiscalYear}.pdf`}
              label="تصدير الإقرار PDF"
            />
            <div className="text-left">
              <div className="text-sm text-slate-300 print:text-black">{companyMeta.nameAr}</div>
              <div className="text-sm font-bold text-emerald-400 print:text-black mt-1">الرقم الضريبي: {companyMeta.taxNumber}</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Section 1: Sales / Outputs */}
          <div>
            <h3 className="text-lg font-bold text-white print:text-black mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">1</span>
              ضريبة القيمة المضافة على المبيعات (المخرجات)
            </h3>
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden print:border-slate-400">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-900 text-slate-300 print:bg-slate-200 print:text-black border-b border-slate-800 print:border-slate-400">
                  <tr>
                    <th className="px-4 py-3">البيان</th>
                    <th className="px-4 py-3 w-40">المبلغ الخاضع للضريبة</th>
                    <th className="px-4 py-3 w-40">مبلغ الضريبة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300 text-slate-200 print:text-black">
                  <tr>
                    <td className="px-4 py-3">المبيعات الخاضعة للنسبة الأساسية (15%)</td>
                    <td className="px-4 py-3 font-mono">{renderAmount(totalSalesAmount)}</td>
                    <td className="px-4 py-3 font-mono">{renderAmount(totalSalesTax)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">المبيعات للمواطنين (الخاضعة لنسبة 0%)</td>
                    <td className="px-4 py-3 font-mono">{renderAmount(0)}</td>
                    <td className="px-4 py-3 font-mono">{renderAmount(0)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">المبيعات المعفاة</td>
                    <td className="px-4 py-3 font-mono">{renderAmount(0)}</td>
                    <td className="px-4 py-3 font-mono">{renderAmount(0)}</td>
                  </tr>
                  <tr className="bg-slate-900/50 print:bg-slate-100 font-bold">
                    <td className="px-4 py-3">إجمالي المبيعات (المخرجات)</td>
                    <td className="px-4 py-3 font-mono">{renderAmount(totalSalesAmount)}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400 print:text-black">{renderAmount(totalSalesTax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Purchases / Inputs */}
          <div>
            <h3 className="text-lg font-bold text-white print:text-black mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs">2</span>
              ضريبة القيمة المضافة على المشتريات (المدخلات)
            </h3>
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden print:border-slate-400">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-900 text-slate-300 print:bg-slate-200 print:text-black border-b border-slate-800 print:border-slate-400">
                  <tr>
                    <th className="px-4 py-3">البيان</th>
                    <th className="px-4 py-3 w-40">المبلغ الخاضع للضريبة</th>
                    <th className="px-4 py-3 w-40">مبلغ الضريبة القابلة للخصم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300 text-slate-200 print:text-black">
                  <tr>
                    <td className="px-4 py-3">المشتريات الخاضعة للنسبة الأساسية (15%)</td>
                    <td className="px-4 py-3 font-mono">{renderAmount(totalPurchasesAmount)}</td>
                    <td className="px-4 py-3 font-mono">{renderAmount(totalPurchasesTax)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">الاستيرادات الخاضعة لضريبة القيمة المضافة التي تدفع في الجمارك</td>
                    <td className="px-4 py-3 font-mono">{renderAmount(0)}</td>
                    <td className="px-4 py-3 font-mono">{renderAmount(0)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">المشتريات المعفاة أو الخاضعة لنسبة صفر</td>
                    <td className="px-4 py-3 font-mono">{renderAmount(0)}</td>
                    <td className="px-4 py-3 font-mono">{renderAmount(0)}</td>
                  </tr>
                  <tr className="bg-slate-900/50 print:bg-slate-100 font-bold">
                    <td className="px-4 py-3">إجمالي المشتريات (المدخلات)</td>
                    <td className="px-4 py-3 font-mono">{renderAmount(totalPurchasesAmount)}</td>
                    <td className="px-4 py-3 font-mono text-rose-400 print:text-black">{renderAmount(totalPurchasesTax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Summary / Net VAT */}
          <div className="mt-8 bg-slate-950 border border-slate-800 p-6 rounded-2xl print:border-slate-400 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-white print:text-black mb-2 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                صافي الضريبة المستحقة / (المستردة)
              </h3>
              <p className="text-sm text-slate-400 print:text-slate-600">
                (إجمالي ضريبة المخرجات - إجمالي ضريبة المدخلات القابلة للخصم)
              </p>
            </div>
            <div className={`p-4 rounded-xl border-2 text-center min-w-[250px] ${
              netVatDue > 0 
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            }`}>
              <div className="text-sm font-bold mb-1 print:text-black">
                {netVatDue > 0 ? "صافي الضريبة المستحقة للسداد" : "صافي الضريبة المستردة (لصالحك)"}
              </div>
              <div className="text-2xl font-black font-mono">
                {renderAmount(Math.abs(netVatDue))}
              </div>
            </div>
          </div>
        </div>

        {/* Official Signatures Section */}
        <div className="mt-12 pt-8 border-t-2 border-slate-800 print:border-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-sm">
          <div>
            <div className="font-bold text-slate-200 print:text-black mb-8">إقرار وتوقيع المكلف / المفوض</div>
            <div className="border-b border-dashed border-slate-700 print:border-slate-400 pb-2 text-slate-400 print:text-slate-600">
              أقر بأن جميع البيانات الواردة صحيحة ومطابقة للسجلات
            </div>
          </div>
          <div>
            <div className="font-bold text-slate-200 print:text-black mb-8">ختم المؤسسة</div>
            <div className="font-bold text-[13px] text-sap-secondary">
              {companyMeta.nameAr}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 print:border-slate-300 text-center text-xs font-light text-slate-400 print:text-slate-600 space-y-1">
          <div>© 2026 ميدو تك و {companyMeta.nameAr} | MeDo ERP</div>
          <div>إقرار ضريبة القيمة المضافة (ZATCA)</div>
        </div>
      </div>
    </div>
  );
};
