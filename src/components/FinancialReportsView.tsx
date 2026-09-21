import React, { useState } from "react";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Layers,
  Scale,
  TrendingUp,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Building2,
  DollarSign,
  Share2,
  FileDown,
} from "lucide-react";
import {
  Account,
  BankAccountItem,
  CashVaultItem,
  CurrencyCode,
  CurrencyInfo,
  FixedAsset,
  Invoice,
  JournalEntry,
  Voucher,
} from "../types/erp";
import { convertCurrency, formatMoney, formatNumberOnly } from "../services/erpStorage";
import { TenantIsolationService } from "../services/tenantIsolationService";
import { AccountLedgerModal } from "./AccountLedgerModal";
import { exportFinancialReportToPdf, getTodayFormattedDate } from "../services/pdfExporter";
import { CashFlowStatementGenerator } from "./CashFlowStatementGenerator";
import { ZatcaVatReturnGenerator } from "./ZatcaVatReturnGenerator";
import { ColumnCustomizer, useColumnVisibility, ColumnDef } from "./ColumnCustomizer";

interface FinancialReportsViewProps {
  accounts: Account[];
  journalEntries: JournalEntry[];
  vouchers?: Voucher[];
  cashVaults?: CashVaultItem[];
  bankAccounts?: BankAccountItem[];
  invoices?: Invoice[];
  fixedAssets?: FixedAsset[];
  branches?: { id: string; nameAr: string; code: string }[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  initialReportType?: "BALANCE_SHEET" | "INCOME_STATEMENT" | "TRIAL_BALANCE" | "CASH_FLOW" | "VAT_RETURN";
  onOpenAi: () => void;
  onShareReport?: (data: any) => void;
}

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({
  accounts,
  journalEntries,
  vouchers = [],
  cashVaults = [],
  bankAccounts = [],
  invoices = [],
  fixedAssets = [],
  branches = [],
  currencies,
  displayCurrency,
  initialReportType = "BALANCE_SHEET",
  onOpenAi,
  onShareReport,
}) => {
  const companyMeta = TenantIsolationService.getActiveTenantDetails();
  const [reportType, setReportType] = useState<"BALANCE_SHEET" | "INCOME_STATEMENT" | "TRIAL_BALANCE" | "CASH_FLOW" | "VAT_RETURN">(initialReportType);
  const [fiscalYear, setFiscalYear] = useState("2026");
  const [selectedLedgerAccount, setSelectedLedgerAccount] = useState<Account | null>(null);

  const TRIAL_BALANCE_COLUMNS: ColumnDef[] = [
    { id: "code", label: "رمز الحساب", locked: true },
    { id: "nameAr", label: "اسم الحساب المالي" },
    { id: "category", label: "التصنيف" },
    { id: "debit", label: "أرصدة مدينة (Debit)" },
    { id: "credit", label: "أرصدة دائنة (Credit)" },
  ];
  const { visibleColumns, updateVisibility, isVisible } = useColumnVisibility("trial_balance", TRIAL_BALANCE_COLUMNS);

  // Non-header active accounts
  const nonHeaders = accounts.filter((a) => !a.isHeader);

  // Group by category and convert balances to display currency
  const assetAccounts = nonHeaders.filter((a) => a.category === "ASSET");
  const liabilityAccounts = nonHeaders.filter((a) => a.category === "LIABILITY");
  const equityAccounts = nonHeaders.filter((a) => a.category === "EQUITY");
  const revenueAccounts = nonHeaders.filter((a) => a.category === "REVENUE");
  const expenseAccounts = nonHeaders.filter((a) => a.category === "EXPENSE");

  const convertAccBal = (acc: Account): number => {
    if (acc.currency === "MULTI" || acc.currency === "YER_SANAA") {
      return convertCurrency(acc.currentBalance, "YER_SANAA", displayCurrency, currencies);
    }
    return convertCurrency(acc.currentBalance, acc.currency, displayCurrency, currencies);
  };

  // Calculations
  const totalAssets = assetAccounts.reduce((sum, a) => sum + convertAccBal(a), 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + convertAccBal(a), 0);
  const totalEquityBase = equityAccounts.reduce((sum, a) => sum + convertAccBal(a), 0);

  const totalRevenues = revenueAccounts.reduce((sum, a) => sum + convertAccBal(a), 0);
  const totalExpenses = expenseAccounts.reduce((sum, a) => sum + convertAccBal(a), 0);
  const currentYearNetProfit = totalRevenues - totalExpenses;

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquityBase + currentYearNetProfit;
  const balanceSheetDiff = Math.abs(totalAssets - totalLiabilitiesAndEquity);
  const isBalanceSheetBalanced = balanceSheetDiff < 1; // minor floating point tolerance

  // Trial balance sums
  const trialTotalDebit = nonHeaders.reduce((sum, a) => {
    const bal = convertAccBal(a);
    return sum + (a.nature === "DEBIT" && bal > 0 ? bal : a.nature === "CREDIT" && bal < 0 ? Math.abs(bal) : 0);
  }, 0);

  const trialTotalCredit = nonHeaders.reduce((sum, a) => {
    const bal = convertAccBal(a);
    return sum + (a.nature === "CREDIT" && bal > 0 ? bal : a.nature === "DEBIT" && bal < 0 ? Math.abs(bal) : 0);
  }, 0);

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    await exportFinancialReportToPdf(
      reportType as any,
      fiscalYear,
      {
        totalAssets,
        totalLiabilities,
        totalEquity: totalEquityBase,
        totalRevenues,
        totalExpenses,
        netProfit: currentYearNetProfit,
        trialTotalDebit,
        trialTotalCredit,
        assetAccounts,
        liabilityAccounts,
        equityAccounts,
        revenueAccounts,
        expenseAccounts,
        allAccounts: nonHeaders,
      },
      currencies,
      displayCurrency
    );
    setIsExportingPdf(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">التقارير والقوائم المالية الختامية (Financial Statements IFRS)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إعداد فوري للميزانية العمومية، قائمة الدخل، ميزان المراجعة وفق معايير IAS/IFRS و SAP S/4HANA
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onShareReport && (
            <button
              onClick={() =>
                onShareReport({
                  type: "REPORT",
                  reportType,
                  fiscalYear,
                  reportSummary: {
                    totalAssets,
                    totalLiabilities,
                    totalEquity: totalEquityBase,
                    totalRevenues,
                    totalExpenses,
                    netProfit: currentYearNetProfit,
                    trialDebit: trialTotalDebit,
                    trialCredit: trialTotalCredit,
                  },
                })
              }
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة التقرير عبر واتساب / SMS</span>
            </button>
          )}
          <button
            onClick={onOpenAi}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>تحليل القوائم عبر AI</span>
          </button>
          <ColumnCustomizer
            tableKey="trial_balance"
            columns={TRIAL_BALANCE_COLUMNS}
            visibleColumns={visibleColumns}
            onChange={updateVisibility}
          />
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
            title="تصدير القائمة المالية بملف PDF يحمل شعار المؤسسة وتاريخ اليوم"
          >
            <FileDown className="w-4 h-4" />
            <span>{isExportingPdf ? "جاري التصدير..." : "تصدير كـ PDF"}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs overflow-x-auto">
        {[
          { id: "BALANCE_SHEET", label: "1. قائمة المركز المالي (الميزانية العمومية)" },
          { id: "INCOME_STATEMENT", label: "2. قائمة الدخل والأرباح والخسائر (P&L)" },
          { id: "TRIAL_BALANCE", label: "3. ميزان المراجعة بالأرصدة (Trial Balance)" },
          { id: "CASH_FLOW", label: "4. قائمة التدفقات النقدية اللحظية (IAS 7)" },
          { id: "VAT_RETURN", label: "5. إقرار ضريبة القيمة المضافة (ZATCA)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
              reportType === tab.id
                ? "bg-emerald-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. REAL-TIME CASH FLOW GENERATOR WHEN CASH_FLOW TAB IS SELECTED */}
      {reportType === "CASH_FLOW" ? (
        <CashFlowStatementGenerator
          accounts={accounts}
          journalEntries={journalEntries}
          vouchers={vouchers}
          cashVaults={cashVaults}
          bankAccounts={bankAccounts}
          invoices={invoices}
          fixedAssets={fixedAssets}
          branches={branches}
          currencies={currencies}
          displayCurrency={displayCurrency}
          initialFiscalYear={fiscalYear}
          onOpenAi={onOpenAi}
          onShareReport={onShareReport}
        />
      ) : reportType === "VAT_RETURN" ? (
        <ZatcaVatReturnGenerator
          invoices={invoices}
          currencies={currencies}
          displayCurrency={displayCurrency}
          fiscalYear={fiscalYear}
        />
      ) : (
        /* REPORT CONTENT CONTAINER FOR BALANCE SHEET, INCOME STATEMENT, TRIAL BALANCE (Printable) */
        <div
          id="financial-report-canvas"
          className="doc-canvas doc-font-cairo bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 print:bg-white print:text-black print:border-none print:shadow-none print:p-0"
        >
          {/* Formal Header with Enterprise Logo */}
          <div className="border-b-2 border-sap-secondary pb-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="text-right space-y-1">
                <h1 className="doc-title text-base sm:text-lg font-extrabold text-white print:text-black">
                  🏢 {companyMeta.nameAr}
                </h1>
                <div className="doc-date text-xs font-bold text-slate-300 print:text-slate-700">
                  {companyMeta.industry} - العنوان: {companyMeta.address}
                </div>
                <div className="doc-meta text-xs text-slate-400 print:text-slate-600">
                  للتواصل: {companyMeta.phone}
                </div>
              </div>
              <div className="w-14 h-14 rounded-xl bg-[#0A2540] border-2 border-sap-secondary text-sap-secondary font-black text-xs flex flex-col items-center justify-center flex-shrink-0 shadow-md">
                <span className="font-mono tracking-tighter">{companyMeta.logoText}</span>
                <span className="text-[8px] text-sap-secondary/90">MeDo ERP</span>
              </div>
              <div className="text-left space-y-1" dir="ltr">
                <h2 className="text-[13px] sm:text-[14px] font-extrabold text-white print:text-black">
                  {companyMeta.nameEn}
                </h2>
                <div className="text-[11px] text-slate-300 print:text-slate-700 font-medium">
                  {companyMeta.nameEn.split(" ").slice(0, 3).join(" ")} Support
                </div>
                <div className="text-[11px] text-slate-400 print:text-slate-600">
                  Tel: {companyMeta.phone}
                </div>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 print:border-slate-300">
              <h2 className="text-base font-extrabold text-emerald-400 print:text-black">
                {reportType === "BALANCE_SHEET" && "📄 قائمة المركز المالي (الميزانية العمومية - Balance Sheet)"}
                {reportType === "INCOME_STATEMENT" && "📄 قائمة الدخل الشامل والأرباح والخسائر (Income Statement)"}
                {reportType === "TRIAL_BALANCE" && "📄 ميزان المراجعة العام بالأرصدة والمجاميع (Trial Balance)"}
              </h2>

              <div className="flex items-center gap-3 font-mono text-[12px]">
                <span className="text-slate-300 print:text-black">السنة المالية: <b className="text-white print:text-black">{fiscalYear}م</b></span>
                <span className="text-emerald-400 print:text-slate-800 font-bold">تاريخ التصدير: {getTodayFormattedDate()}</span>
              </div>
            </div>
            <div className="text-xs text-slate-400 print:text-slate-600">
              للسنة المالية المنتهية في 31 ديسمبر {fiscalYear}م | العملة المعروضة: {displayCurrency}
            </div>
          </div>

        {/* 1. BALANCE SHEET (قائمة المركز المالي) */}
        {reportType === "BALANCE_SHEET" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assets Column */}
              <div className="space-y-4">
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-emerald-300">أولاً: الأصـــول (Assets)</h3>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {formatMoney(totalAssets, displayCurrency, currencies)}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 px-2">الأصول المتداولة (Current Assets):</div>
                  {assetAccounts
                    .filter((a) => a.code.startsWith("11"))
                    .map((a) => (
                      <div
                        key={a.id}
                        onClick={() => setSelectedLedgerAccount(a)}
                        className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-950/50 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 cursor-pointer transition-colors group"
                        title="انقر لفتح كشف حساب الأستاذ العام"
                      >
                        <span className="text-slate-300 group-hover:text-white">{a.code} - {a.nameAr}</span>
                        <span className="font-mono font-bold text-slate-100 group-hover:text-emerald-400">
                          {formatMoney(convertAccBal(a), displayCurrency, currencies)}
                        </span>
                      </div>
                    ))}

                  <div className="text-[11px] font-bold text-slate-400 px-2 pt-2">الأصول غير المتداولة والثابتة (Non-Current):</div>
                  {assetAccounts
                    .filter((a) => !a.code.startsWith("11"))
                    .map((a) => (
                      <div
                        key={a.id}
                        onClick={() => setSelectedLedgerAccount(a)}
                        className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-950/50 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 cursor-pointer transition-colors group"
                        title="انقر لفتح كشف حساب الأستاذ العام"
                      >
                        <span className="text-slate-300 group-hover:text-white">{a.code} - {a.nameAr}</span>
                        <span className="font-mono font-bold text-slate-100 group-hover:text-emerald-400">
                          {formatMoney(convertAccBal(a), displayCurrency, currencies)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Liabilities & Equity Column */}
              <div className="space-y-4">
                <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-blue-300">ثانياً: الخصوم وحقوق الملكية (Liabilities & Equity)</h3>
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {formatMoney(totalLiabilitiesAndEquity, displayCurrency, currencies)}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 px-2">الخصوم المتداولة (Current Liabilities):</div>
                  {liabilityAccounts.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => setSelectedLedgerAccount(a)}
                      className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-950/50 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 cursor-pointer transition-colors group"
                      title="انقر لفتح كشف حساب الأستاذ العام"
                    >
                      <span className="text-slate-300 group-hover:text-white">{a.code} - {a.nameAr}</span>
                      <span className="font-mono font-bold text-slate-100 group-hover:text-blue-400">
                        {formatMoney(convertAccBal(a), displayCurrency, currencies)}
                      </span>
                    </div>
                  ))}

                  <div className="text-[11px] font-bold text-slate-400 px-2 pt-2">حقوق الملكية ورأس المال (Equity):</div>
                  {equityAccounts.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => setSelectedLedgerAccount(a)}
                      className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-950/50 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 cursor-pointer transition-colors group"
                      title="انقر لفتح كشف حساب الأستاذ العام"
                    >
                      <span className="text-slate-300 group-hover:text-white">{a.code} - {a.nameAr}</span>
                      <span className="font-mono font-bold text-slate-100 group-hover:text-blue-400">
                        {formatMoney(convertAccBal(a), displayCurrency, currencies)}
                      </span>
                    </div>
                  ))}

                  {/* Current Year P&L addition */}
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-emerald-950/30 border border-emerald-800/30">
                    <span className="font-bold text-emerald-300">أرباح (خسائر) الفترة المالية الحالية:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatMoney(currentYearNetProfit, displayCurrency, currencies)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Verification Footer */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                isBalanceSheetBalanced
                  ? "bg-emerald-950/50 border-emerald-800 text-emerald-300"
                  : "bg-rose-950/50 border-rose-800 text-rose-300"
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {isBalanceSheetBalanced ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>
                  {isBalanceSheetBalanced
                    ? "الميزانية متوازنة 100% (إجمالي الأصول = إجمالي الخصوم + حقوق الملكية)"
                    : `يوجد فارق عدم توازن في الميزانية: ${formatNumberOnly(balanceSheetDiff)}`}
                </span>
              </div>
              <div className="font-mono font-bold">
                الأصول: {formatNumberOnly(totalAssets)} = الخصوم والملكية: {formatNumberOnly(totalLiabilitiesAndEquity)}
              </div>
            </div>
          </div>
        )}

        {/* 2. INCOME STATEMENT (قائمة الدخل) */}
        {reportType === "INCOME_STATEMENT" && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* Revenues Section */}
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between text-xs font-bold text-emerald-300">
                <span>الإيرادات والمبيعات التشغيلية (Operating Revenues)</span>
                <span className="font-mono text-emerald-400">{formatMoney(totalRevenues, displayCurrency, currencies)}</span>
              </div>

              <div className="space-y-1 text-xs">
                {revenueAccounts.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => setSelectedLedgerAccount(a)}
                    className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-950/50 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 cursor-pointer transition-colors group"
                    title="انقر لفتح كشف حساب الأستاذ العام"
                  >
                    <span className="text-slate-300 group-hover:text-white">{a.code} - {a.nameAr}</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatMoney(convertAccBal(a), displayCurrency, currencies)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expenses Section */}
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 flex items-center justify-between text-xs font-bold text-rose-300">
                <span>المصروفات التشغيلية والإدارية والعمومية (Expenses)</span>
                <span className="font-mono text-rose-400">{formatMoney(totalExpenses, displayCurrency, currencies)}</span>
              </div>

              <div className="space-y-1 text-xs">
                {expenseAccounts.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => setSelectedLedgerAccount(a)}
                    className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-950/50 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 cursor-pointer transition-colors group"
                    title="انقر لفتح كشف حساب الأستاذ العام"
                  >
                    <span className="text-slate-300 group-hover:text-white">{a.code} - {a.nameAr}</span>
                    <span className="font-mono font-bold text-rose-400">
                      {formatMoney(convertAccBal(a), displayCurrency, currencies)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Net Income Summary Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400">صافي الربح / (الخسارة) للفترة المالية (Net Profit)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">معايير IFRS المحاسبية المعتمدة</div>
              </div>
              <div
                className={`text-xl font-extrabold font-mono ${
                  currentYearNetProfit >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {formatMoney(currentYearNetProfit, displayCurrency, currencies)}
              </div>
            </div>
          </div>
        )}

        {/* 3. TRIAL BALANCE (ميزان المراجعة) */}
        {reportType === "TRIAL_BALANCE" && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    {isVisible("code") && <th className="py-2.5 px-3 font-semibold">رمز الحساب</th>}
                    {isVisible("nameAr") && <th className="py-2.5 px-3 font-semibold">اسم الحساب المالي</th>}
                    {isVisible("category") && <th className="py-2.5 px-3 font-semibold">التصنيف</th>}
                    {isVisible("debit") && <th className="py-2.5 px-3 font-semibold text-left">أرصدة مدينة (Debit)</th>}
                    {isVisible("credit") && <th className="py-2.5 px-3 font-semibold text-left">أرصدة دائنة (Credit)</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {nonHeaders.map((acc) => {
                    const bal = convertAccBal(acc);
                    const isDebit = acc.nature === "DEBIT";
                    return (
                      <tr
                        key={acc.id}
                        onClick={() => setSelectedLedgerAccount(acc)}
                        className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                        title="انقر لفتح كشف حساب الأستاذ العام"
                      >
                        {isVisible("code") && <td className="py-2 px-3 font-mono font-bold text-emerald-400">{acc.code}</td>}
                        {isVisible("nameAr") && <td className="py-2 px-3 text-slate-200 font-medium">{acc.nameAr}</td>}
                        {isVisible("category") && <td className="py-2 px-3 text-slate-400 text-[11px]">{acc.category}</td>}
                        {isVisible("debit") && (
                          <td className="py-2 px-3 text-left font-mono font-bold text-emerald-400">
                            {isDebit && bal !== 0 ? formatNumberOnly(bal) : "-"}
                          </td>
                        )}
                        {isVisible("credit") && (
                          <td className="py-2 px-3 text-left font-mono font-bold text-blue-400">
                            {!isDebit && bal !== 0 ? formatNumberOnly(bal) : "-"}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-950 font-bold border-t-2 border-slate-700 text-sm">
                    <td colSpan={["code", "nameAr", "category"].filter((c) => isVisible(c)).length} className="py-3 px-3 text-white">إجمالي ميزان المراجعة:</td>
                    {isVisible("debit") && (
                      <td className="py-3 px-3 text-left font-mono text-emerald-400">
                        {formatMoney(trialTotalDebit, displayCurrency, currencies)}
                      </td>
                    )}
                    {isVisible("credit") && (
                      <td className="py-3 px-3 text-left font-mono text-blue-400">
                        {formatMoney(trialTotalCredit, displayCurrency, currencies)}
                      </td>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Official Signatures Section (14-15px Semi Bold) */}
        <div className="mt-8 pt-6 border-t-2 border-slate-800 print:border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-[14.5px]">
          <div>
            <div className="doc-signature font-bold text-slate-200 print:text-black">رئيس قسم المحاسبة العامة</div>
            <div className="mt-6 border-b border-dashed border-slate-700 print:border-slate-400 pb-2 text-slate-400 print:text-slate-600">
              ___________________
            </div>
          </div>
          <div>
            <div className="doc-signature font-bold text-slate-200 print:text-black">المدير المالي والتنفيذي (CFO)</div>
            <div className="mt-6 border-b border-dashed border-slate-700 print:border-slate-400 pb-2 text-slate-400 print:text-slate-600">
              ___________________
            </div>
          </div>
          <div>
            <div className="doc-signature font-bold text-slate-200 print:text-black">الختم الرسمي للمؤسسة</div>
            <div className="mt-6 font-bold text-[13px] text-sap-secondary">
              مجموعة بن زياد التجارية المتحدة
            </div>
          </div>
        </div>

        {/* Footer (11-12px Light) */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 print:border-slate-300 text-center text-[11.5px] font-light text-slate-400 print:text-slate-600 space-y-0.5">
          <div>© 2026 ميدو تك وبن زياد المتحدة | MeDo ERP</div>
          <div>نظام المحاسبة والإدارة المتكامل - التقارير المالية الختامية</div>
        </div>
      </div>
      )}

      {/* Account Ledger Modal */}
      {selectedLedgerAccount && (
        <AccountLedgerModal
          account={selectedLedgerAccount}
          accounts={accounts}
          journalEntries={journalEntries}
          currencies={currencies}
          displayCurrency={displayCurrency}
          onClose={() => setSelectedLedgerAccount(null)}
          onSelectAccount={(acc) => setSelectedLedgerAccount(acc)}
        />
      )}
    </div>
  );
};
