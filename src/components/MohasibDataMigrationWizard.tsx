import React, { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  Database,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  Building,
  Package,
  BookOpen,
  DollarSign,
  Download,
  Sparkles,
  RefreshCw,
  Layers,
  ChevronDown,
  Info,
  Check,
  X,
  Search,
  ExternalLink,
  ShieldCheck,
  Sliders,
  TrendingUp,
  FileDown,
} from "lucide-react";
import {
  MohasibMigrationService,
  MohasibParsedData,
  MigrationExecutionOptions,
  MigrationReport,
} from "../services/mohasibMigrationService";
import { ERPState, CurrencyCode } from "../types/erp";
import { soundService } from "../services/notificationSoundService";

interface MohasibDataMigrationWizardProps {
  erpState: ERPState;
  onStateUpdate: (updatedState: ERPState) => void;
  onNavigateToTab?: (tab: string) => void;
  onClose?: () => void;
}

export const MohasibDataMigrationWizard: React.FC<MohasibDataMigrationWizardProps> = ({
  erpState,
  onStateUpdate,
  onNavigateToTab,
  onClose,
}) => {
  // Step state: 1 = Upload, 2 = Entity Review & Preview, 3 = Options & Mapping, 4 = Result Report
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // File handling states
  const [isParsing, setIsParsing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<MohasibParsedData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Preview Tab
  const [activePreviewTab, setActivePreviewTab] = useState<
    "CUSTOMERS" | "VENDORS" | "INVENTORY" | "ACCOUNTS" | "JOURNAL"
  >("CUSTOMERS");
  const [searchFilter, setSearchFilter] = useState("");

  // Migration Options
  const [options, setOptions] = useState<MigrationExecutionOptions>({
    duplicateStrategy: "UPDATE",
    createOpeningJournalEntry: true,
    selectedCurrency: erpState.selectedDisplayCurrency || "YER_SANAA",
    targetBranchId: erpState.activeBranchId || "BR-SANAA-MAIN",
    importAccounts: true,
    importCustomers: true,
    importVendors: true,
    importInventory: true,
    importJournalEntries: false,
  });

  // Execution states
  const [isExecuting, setIsExecuting] = useState(false);
  const [migrationReport, setMigrationReport] = useState<MigrationReport | null>(null);

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setUploadError(null);

    try {
      const result = await MohasibMigrationService.parseBackupFile(file);
      setParsedData(result);
      soundService.playSound("SUCCESS_CHIME");
      setCurrentStep(2);
    } catch (err: any) {
      console.error("Parse error:", err);
      setUploadError(err.message || "تعذر قراءة ملف النسخة الاحتياطية. يرجى التأكد من صيغة الملف.");
      soundService.playSound("ENCRYPTION_VIOLATION_ALARM");
    } finally {
      setIsParsing(false);
    }
  };

  // Load Realistic Demo
  const handleLoadDemo = () => {
    setIsParsing(true);
    setTimeout(() => {
      const demoData = MohasibMigrationService.generateMohasibRealisticDemoData();
      setParsedData(demoData);
      setIsParsing(false);
      soundService.playSound("SUCCESS_CHIME");
      setCurrentStep(2);
    }, 400);
  };

  // Toggle selection for all items in active category
  const handleToggleSelectAll = (selected: boolean) => {
    if (!parsedData) return;
    const updated = { ...parsedData };

    if (activePreviewTab === "CUSTOMERS") {
      updated.entities.customers.forEach((c) => (c.selected = selected));
    } else if (activePreviewTab === "VENDORS") {
      updated.entities.vendors.forEach((v) => (v.selected = selected));
    } else if (activePreviewTab === "INVENTORY") {
      updated.entities.inventory.forEach((i) => (i.selected = selected));
    } else if (activePreviewTab === "ACCOUNTS") {
      updated.entities.accounts.forEach((a) => (a.selected = selected));
    } else if (activePreviewTab === "JOURNAL") {
      updated.entities.journalEntries.forEach((j) => (j.selected = selected));
    }

    setParsedData(updated);
  };

  // Execute Final Migration
  const handleExecuteMigration = () => {
    if (!parsedData) return;

    setIsExecuting(true);
    setTimeout(() => {
      try {
        const { updatedState, report } = MohasibMigrationService.executeMigration(
          erpState,
          parsedData,
          options
        );

        onStateUpdate(updatedState);
        setMigrationReport(report);
        soundService.playSound("SUCCESS_CHIME");
        setCurrentStep(4);
      } catch (err: any) {
        console.error("Migration execution error:", err);
        setUploadError("حدث خطأ أثناء ترحيل البيانات: " + err.message);
      } finally {
        setIsExecuting(false);
      }
    }, 800);
  };

  return (
    <div className="w-full bg-[#0a192f] border border-blue-900/60 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-[#06182a] via-[#0d2a4a] to-[#06182a] border-b border-blue-900/80 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-[#d4af37]">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                بوابة ترحيل بيانات تطبيق «المحاسب المحترف» (أندرويد)
              </h2>
              <span className="bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[11px] font-bold px-2 py-0.5 rounded-full">
                Migration Wizard v2.5
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              نقل شجرة الحسابات، العملاء، الموردين، المخزون، والأرصدة الافتتاحية السابقة بضغطة زر واحدة إلى MeDo ERP
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => MohasibMigrationService.downloadOfficialExcelTemplate()}
            className="px-3.5 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md"
            title="تحميل قالب Excel جاهز ومعتمد للتعبئة اليدوية إن لزم الأمر"
          >
            <Download className="w-4 h-4 text-[#d4af37]" />
            <span>تحميل قالب Excel المعتمد</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* STEPPER PROGRESS */}
      <div className="bg-[#071526] border-b border-blue-950 px-6 py-3.5">
        <div className="flex items-center justify-between max-w-3xl mx-auto text-xs">
          {/* Step 1 */}
          <div
            className={`flex items-center gap-2 font-bold cursor-pointer transition ${
              currentStep === 1
                ? "text-[#d4af37]"
                : currentStep > 1
                ? "text-emerald-400"
                : "text-slate-500"
            }`}
            onClick={() => setCurrentStep(1)}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                currentStep === 1
                  ? "border-[#d4af37] bg-[#d4af37]/20 text-[#d4af37]"
                  : currentStep > 1
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                  : "border-slate-700 bg-slate-900 text-slate-500"
              }`}
            >
              {currentStep > 1 ? "✓" : "1"}
            </span>
            <span>1. رفع ملف النسخة الاحتياطية</span>
          </div>

          <div className="w-8 sm:w-16 h-0.5 bg-blue-900/50" />

          {/* Step 2 */}
          <div
            className={`flex items-center gap-2 font-bold cursor-pointer transition ${
              currentStep === 2
                ? "text-[#d4af37]"
                : currentStep > 2
                ? "text-emerald-400"
                : "text-slate-500"
            }`}
            onClick={() => parsedData && setCurrentStep(2)}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                currentStep === 2
                  ? "border-[#d4af37] bg-[#d4af37]/20 text-[#d4af37]"
                  : currentStep > 2
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                  : "border-slate-700 bg-slate-900 text-slate-500"
              }`}
            >
              {currentStep > 2 ? "✓" : "2"}
            </span>
            <span>2. الفحص الذكي والمعاينة</span>
          </div>

          <div className="w-8 sm:w-16 h-0.5 bg-blue-900/50" />

          {/* Step 3 */}
          <div
            className={`flex items-center gap-2 font-bold cursor-pointer transition ${
              currentStep === 3
                ? "text-[#d4af37]"
                : currentStep > 3
                ? "text-emerald-400"
                : "text-slate-500"
            }`}
            onClick={() => parsedData && setCurrentStep(3)}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                currentStep === 3
                  ? "border-[#d4af37] bg-[#d4af37]/20 text-[#d4af37]"
                  : currentStep > 3
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                  : "border-slate-700 bg-slate-900 text-slate-500"
              }`}
            >
              {currentStep > 3 ? "✓" : "3"}
            </span>
            <span>3. معالجة التعارضات والقيد الافتتاحي</span>
          </div>

          <div className="w-8 sm:w-16 h-0.5 bg-blue-900/50" />

          {/* Step 4 */}
          <div
            className={`flex items-center gap-2 font-bold transition ${
              currentStep === 4 ? "text-emerald-400" : "text-slate-500"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                currentStep === 4
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                  : "border-slate-700 bg-slate-900 text-slate-500"
              }`}
            >
              4
            </span>
            <span>4. اكتمال الترحيل</span>
          </div>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="p-6">
        {/* ============================================================== */}
        {/* STEP 1: UPLOAD OR TEST DEMO */}
        {/* ============================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {uploadError && (
              <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-sm flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Instruction Banner */}
            <div className="p-4 rounded-2xl bg-[#071e38] border border-blue-800/60 flex items-start gap-3.5">
              <Info className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-300 space-y-1">
                <p className="font-bold text-white">
                  كيف تستخرج نسخة بياناتك من تطبيق «المحاسب المحترف» على هاتف الأندرويد؟
                </p>
                <p>
                  1. افتح تطبيق المحاسب المحترف على هاتفك &larr; اذهب إلى (القائمة الرئيسية) &larr; (النسخ الاحتياطي واستعادة البيانات) &larr; (إنشاء نسخة احتياطية).
                </p>
                <p>
                  2. سيتم حفظ ملف بامتداد <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">.db</code> أو <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">.sqlite</code> في مجلد التنزيلات (Download) أو مسار التطبيق.
                </p>
                <p>
                  3. انقل الملف إلى جهازك وارفعه أدناه، أو قم بتصدير شيتات الإكسل (.xlsx / .csv) وسيقوم النظام بالتعرف الآلي عليها.
                </p>
              </div>
            </div>

            {/* Upload Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-700/60 hover:border-[#d4af37] bg-[#06182a]/80 hover:bg-[#082038] rounded-3xl p-8 sm:p-12 text-center transition cursor-pointer flex flex-col items-center justify-center gap-4 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".db,.sqlite,.sqlite3,.backup,.dmp,.xlsx,.xls,.csv,.json,.bin"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-blue-900/40 group-hover:bg-[#d4af37]/20 border border-blue-700/60 group-hover:border-[#d4af37] flex items-center justify-center transition">
                {isParsing ? (
                  <RefreshCw className="w-8 h-8 text-[#d4af37] animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-blue-300 group-hover:text-[#d4af37] transition" />
                )}
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                  {isParsing ? "جاري فحص وقراءة قاعدة البيانات..." : "اضغط هنا لاختيار ملف النسخة الاحتياطية أو اسحبه إلى هنا"}
                </h3>
                <p className="text-xs text-slate-400">
                  يدعم ملفات: <span className="font-mono text-amber-300 font-bold">.db, .sqlite, .xlsx, .csv, .json</span> (حجم أقصى: 100 ميجابايت)
                </p>
              </div>
            </div>

            {/* Alternative Action: Instant Demo Preview */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#061628] border border-blue-950">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#d4af37]" />
                <div className="text-xs">
                  <p className="font-bold text-white">تريد تجربة الترحيل الفوري أولاً؟</p>
                  <p className="text-slate-400">يمكنك فحص واختبار ترحيل بيانات واقعية متكاملة لـ 5 عملاء و 4 موردين ومخزون تجريبي بضغطة واحدة.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLoadDemo}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>تحميل عينة تجريبية فورية</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: SMART AUDIT & DATA PREVIEW */}
        {/* ============================================================== */}
        {currentStep === 2 && parsedData && (
          <div className="space-y-6">
            {/* Source Overview Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#06182a] border border-blue-900/60">
                <span className="text-[11px] text-slate-400 block mb-1">مصدر البيانات:</span>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#d4af37]" />
                  <span className="text-sm font-bold text-white font-mono">{parsedData.sourceType}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#06182a] border border-blue-900/60">
                <span className="text-[11px] text-slate-400 block mb-1">اسم الملف المكتشف:</span>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-200 truncate">{parsedData.fileName}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#06182a] border border-blue-900/60">
                <span className="text-[11px] text-slate-400 block mb-1">إجمالي ديون العملاء (مدين):</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {parsedData.summary.totalCustomerDebt.toLocaleString()} YER
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#06182a] border border-blue-900/60">
                <span className="text-[11px] text-slate-400 block mb-1">إجمالي قيمة المخزون:</span>
                <span className="text-sm font-bold text-amber-300 font-mono">
                  {parsedData.summary.totalInventoryValue.toLocaleString()} YER
                </span>
              </div>
            </div>

            {/* Entity Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-900/80 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActivePreviewTab("CUSTOMERS")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    activePreviewTab === "CUSTOMERS"
                      ? "bg-[#d4af37] text-slate-950 shadow-md"
                      : "bg-[#06182a] text-slate-300 hover:bg-blue-900/50"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>العملاء والمدينون ({parsedData.entities.customers.length})</span>
                </button>

                <button
                  onClick={() => setActivePreviewTab("VENDORS")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    activePreviewTab === "VENDORS"
                      ? "bg-[#d4af37] text-slate-950 shadow-md"
                      : "bg-[#06182a] text-slate-300 hover:bg-blue-900/50"
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>الموردون والدائنون ({parsedData.entities.vendors.length})</span>
                </button>

                <button
                  onClick={() => setActivePreviewTab("INVENTORY")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    activePreviewTab === "INVENTORY"
                      ? "bg-[#d4af37] text-slate-950 shadow-md"
                      : "bg-[#06182a] text-slate-300 hover:bg-blue-900/50"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>المخزون والأصناف ({parsedData.entities.inventory.length})</span>
                </button>

                <button
                  onClick={() => setActivePreviewTab("ACCOUNTS")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    activePreviewTab === "ACCOUNTS"
                      ? "bg-[#d4af37] text-slate-950 shadow-md"
                      : "bg-[#06182a] text-slate-300 hover:bg-blue-900/50"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>دليل الحسابات ({parsedData.entities.accounts.length})</span>
                </button>
              </div>

              {/* Search & Bulk Selection */}
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="بحث في السجلات..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="bg-[#06182a] border border-blue-900/80 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <button
                  onClick={() => handleToggleSelectAll(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold hover:bg-emerald-900 transition cursor-pointer"
                >
                  تحديد الكل
                </button>
                <button
                  onClick={() => handleToggleSelectAll(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                >
                  إلغاء التحديد
                </button>
              </div>
            </div>

            {/* TAB CONTENT TABLES */}
            <div className="border border-blue-900/80 rounded-2xl overflow-hidden bg-[#06182a]">
              {/* CUSTOMERS TABLE */}
              {activePreviewTab === "CUSTOMERS" && (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#040e1a] text-slate-300 sticky top-0 border-b border-blue-900/80">
                      <tr>
                        <th className="p-3 w-12 text-center">ترحيل</th>
                        <th className="p-3">كود العميل</th>
                        <th className="p-3">اسم العميل (في المحاسب المحترف)</th>
                        <th className="p-3">رقم الهاتف</th>
                        <th className="p-3">العنوان / المنطقة</th>
                        <th className="p-3">الرصيد الافتتاحي (المديونية السابقة)</th>
                        <th className="p-3">حساب الأستاذ العام (MeDo ERP)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-950/60 font-sans">
                      {parsedData.entities.customers
                        .filter(
                          (c) =>
                            c.name.includes(searchFilter) ||
                            c.phone.includes(searchFilter) ||
                            c.code.includes(searchFilter)
                        )
                        .map((c, idx) => (
                          <tr key={idx} className="hover:bg-blue-900/20">
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={c.selected ?? true}
                                onChange={(e) => {
                                  c.selected = e.target.checked;
                                  setParsedData({ ...parsedData });
                                }}
                                className="w-4 h-4 rounded border-slate-700 text-[#d4af37] focus:ring-0"
                              />
                            </td>
                            <td className="p-3 font-mono text-slate-400">{c.code}</td>
                            <td className="p-3 font-bold text-white">{c.name}</td>
                            <td className="p-3 font-mono text-slate-300" dir="ltr">
                              {c.phone || "—"}
                            </td>
                            <td className="p-3 text-slate-400">{c.address || "المركز الرئيسي"}</td>
                            <td className="p-3 font-mono font-bold text-emerald-400">
                              {c.balance.toLocaleString()} YER
                            </td>
                            <td className="p-3 text-slate-400">110301 (ذمم العملاء والمدينون)</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* VENDORS TABLE */}
              {activePreviewTab === "VENDORS" && (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#040e1a] text-slate-300 sticky top-0 border-b border-blue-900/80">
                      <tr>
                        <th className="p-3 w-12 text-center">ترحيل</th>
                        <th className="p-3">كود المورد</th>
                        <th className="p-3">اسم المورد</th>
                        <th className="p-3">رقم الهاتف</th>
                        <th className="p-3">العنوان</th>
                        <th className="p-3">الرصيد الدائن المستحق (له)</th>
                        <th className="p-3">حساب الأستاذ العام (MeDo ERP)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-950/60 font-sans">
                      {parsedData.entities.vendors
                        .filter(
                          (v) =>
                            v.name.includes(searchFilter) ||
                            v.phone.includes(searchFilter) ||
                            v.code.includes(searchFilter)
                        )
                        .map((v, idx) => (
                          <tr key={idx} className="hover:bg-blue-900/20">
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={v.selected ?? true}
                                onChange={(e) => {
                                  v.selected = e.target.checked;
                                  setParsedData({ ...parsedData });
                                }}
                                className="w-4 h-4 rounded border-slate-700 text-[#d4af37] focus:ring-0"
                              />
                            </td>
                            <td className="p-3 font-mono text-slate-400">{v.code}</td>
                            <td className="p-3 font-bold text-white">{v.name}</td>
                            <td className="p-3 font-mono text-slate-300" dir="ltr">
                              {v.phone || "—"}
                            </td>
                            <td className="p-3 text-slate-400">{v.address || "المركز الرئيسي"}</td>
                            <td className="p-3 font-mono font-bold text-amber-400">
                              {v.balance.toLocaleString()} YER
                            </td>
                            <td className="p-3 text-slate-400">210101 (ذمم الموردين والدائنين)</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* INVENTORY TABLE */}
              {activePreviewTab === "INVENTORY" && (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#040e1a] text-slate-300 sticky top-0 border-b border-blue-900/80">
                      <tr>
                        <th className="p-3 w-12 text-center">ترحيل</th>
                        <th className="p-3">كود / باركود</th>
                        <th className="p-3">اسم الصنف</th>
                        <th className="p-3">الوحدة</th>
                        <th className="p-3">الكمية المرحّلة</th>
                        <th className="p-3">سعر التكلفة</th>
                        <th className="p-3">سعر البيع</th>
                        <th className="p-3">إجمالي قيمة الصنف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-950/60 font-sans">
                      {parsedData.entities.inventory
                        .filter(
                          (i) =>
                            i.name.includes(searchFilter) ||
                            i.code.includes(searchFilter) ||
                            i.category.includes(searchFilter)
                        )
                        .map((i, idx) => (
                          <tr key={idx} className="hover:bg-blue-900/20">
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={i.selected ?? true}
                                onChange={(e) => {
                                  i.selected = e.target.checked;
                                  setParsedData({ ...parsedData });
                                }}
                                className="w-4 h-4 rounded border-slate-700 text-[#d4af37] focus:ring-0"
                              />
                            </td>
                            <td className="p-3 font-mono text-slate-400">{i.code}</td>
                            <td className="p-3 font-bold text-white">{i.name}</td>
                            <td className="p-3 text-slate-400">{i.unit}</td>
                            <td className="p-3 font-mono font-bold text-cyan-300">{i.quantity}</td>
                            <td className="p-3 font-mono text-slate-300">
                              {i.costPrice.toLocaleString()} YER
                            </td>
                            <td className="p-3 font-mono text-emerald-400">
                              {i.sellingPrice.toLocaleString()} YER
                            </td>
                            <td className="p-3 font-mono font-bold text-amber-300">
                              {(i.quantity * i.costPrice).toLocaleString()} YER
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ACCOUNTS TABLE */}
              {activePreviewTab === "ACCOUNTS" && (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#040e1a] text-slate-300 sticky top-0 border-b border-blue-900/80">
                      <tr>
                        <th className="p-3 w-12 text-center">ترحيل</th>
                        <th className="p-3">رقم الحساب</th>
                        <th className="p-3">اسم الحساب</th>
                        <th className="p-3">التصنيف</th>
                        <th className="p-3">طبيعة الحساب</th>
                        <th className="p-3">الرصيد الافتتاحي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-950/60 font-sans">
                      {parsedData.entities.accounts
                        .filter(
                          (a) =>
                            a.name.includes(searchFilter) ||
                            a.code.includes(searchFilter)
                        )
                        .map((a, idx) => (
                          <tr key={idx} className="hover:bg-blue-900/20">
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={a.selected ?? true}
                                onChange={(e) => {
                                  a.selected = e.target.checked;
                                  setParsedData({ ...parsedData });
                                }}
                                className="w-4 h-4 rounded border-slate-700 text-[#d4af37] focus:ring-0"
                              />
                            </td>
                            <td className="p-3 font-mono text-slate-400">{a.code}</td>
                            <td className="p-3 font-bold text-white">{a.name}</td>
                            <td className="p-3 text-slate-400">{a.category}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  a.nature === "DEBIT"
                                    ? "bg-blue-900/50 text-blue-300"
                                    : "bg-purple-900/50 text-purple-300"
                                }`}
                              >
                                {a.nature === "DEBIT" ? "مدين" : "دائن"}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-white">
                              {a.balance.toLocaleString()} YER
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة لاختيار ملف آخر</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-[#e2bd46] hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition"
              >
                <span>متابعة لخيارات معالجة التعارضات والقيد الافتتاحي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: CONFLICT RESOLUTION & MIGRATION OPTIONS */}
        {/* ============================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-[#06182a] border border-blue-900/80 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#d4af37]" />
                <span>إعدادات معالجة التعارضات والربط المحاسبي (Data Mapping)</span>
              </h3>

              {/* Duplicate Strategy Option */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  سياسة السجلات المتطابقة أو المكررة (Duplicate Strategy):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setOptions({ ...options, duplicateStrategy: "UPDATE" })}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                      options.duplicateStrategy === "UPDATE"
                        ? "bg-[#d4af37]/20 border-[#d4af37] text-white font-bold"
                        : "bg-[#040e1a] border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="font-bold text-amber-300 mb-1">تحديث الأرصدة (موصى به)</div>
                    <div className="text-[11px] text-slate-300">
                      تحديث أرصدة العملاء والموردين والمخزون الحالي دون تكرار أسمائهم.
                    </div>
                  </div>

                  <div
                    onClick={() => setOptions({ ...options, duplicateStrategy: "SKIP" })}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                      options.duplicateStrategy === "SKIP"
                        ? "bg-[#d4af37]/20 border-[#d4af37] text-white font-bold"
                        : "bg-[#040e1a] border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="font-bold text-blue-300 mb-1">تجاهل المكرر (Skip)</div>
                    <div className="text-[11px] text-slate-300">
                      عدم تعديل أي سجل موجود مسبقاً، وإضافة السجلات الجديدة فقط.
                    </div>
                  </div>

                  <div
                    onClick={() => setOptions({ ...options, duplicateStrategy: "APPEND" })}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                      options.duplicateStrategy === "APPEND"
                        ? "bg-[#d4af37]/20 border-[#d4af37] text-white font-bold"
                        : "bg-[#040e1a] border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="font-bold text-purple-300 mb-1">إضافة كسجلات جديدة</div>
                    <div className="text-[11px] text-slate-300">
                      إنشاء كود جديد لكل صنف أو عميل بصرف النظر عن السجلات السابقة.
                    </div>
                  </div>
                </div>
              </div>

              {/* Automatic Opening Journal Entry */}
              <div className="p-4 rounded-xl bg-[#04101e] border border-blue-900/60 space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.createOpeningJournalEntry}
                    onChange={(e) =>
                      setOptions({ ...options, createOpeningJournalEntry: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#d4af37] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-white block">
                      إنشاء قيد افتتاحي متزن تلقائياً (Balanced Opening Entry)
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      يقوم النظام تلقائياً بتجميع مديونيات العملاء ومستحقات الموردين وقيمة المخزون وموازنتها محاسبياً مقابل حساب رأس المال / الأرباح المبقاة حتى يبقى ميزان المراجعة متزناً بنسبة 100%.
                    </span>
                  </div>
                </label>
              </div>

              {/* Currency and Target Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">العملة الافتراضية للترحيل:</label>
                  <select
                    value={options.selectedCurrency}
                    onChange={(e) =>
                      setOptions({ ...options, selectedCurrency: e.target.value as CurrencyCode })
                    }
                    className="w-full bg-[#040e1a] border border-blue-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="YER_SANAA">ريال يمني (صنعاء)</option>
                    <option value="YER_ADEN">ريال يمني (عدن)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">الفرع المستهدف لاستقبال البيانات:</label>
                  <select
                    value={options.targetBranchId}
                    onChange={(e) => setOptions({ ...options, targetBranchId: e.target.value })}
                    className="w-full bg-[#040e1a] border border-blue-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    {(erpState.branches || []).map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة لمعاينة البيانات</span>
              </button>

              <button
                type="button"
                disabled={isExecuting}
                onClick={handleExecuteMigration}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center gap-2 cursor-pointer shadow-xl active:scale-95 transition disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>جاري ترحيل البيانات والاعتماد المحاسبي...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>تأكيد واعتماد ترحيل البيانات إلى MeDo ERP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: MIGRATION COMPLETED REPORT */}
        {/* ============================================================== */}
        {currentStep === 4 && migrationReport && (
          <div className="space-y-6 max-w-3xl mx-auto text-center py-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                تم ترحيل بيانات «المحاسب المحترف» بنجاح تام!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                تم تحديث قيود اليومية، أرصدة العملاء والموردين، والمخزون، وتوليد القيد الافتتاحي المتزن.
              </p>
            </div>

            {/* Metrics Report Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
              <div className="p-4 rounded-xl bg-[#06182a] border border-emerald-900/60">
                <span className="text-xs text-slate-400 block mb-1">العملاء المرحلون:</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {migrationReport.customersImported} عميل
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#06182a] border border-blue-900/60">
                <span className="text-xs text-slate-400 block mb-1">الموردون المرحلون:</span>
                <span className="text-lg font-bold text-blue-400 font-mono">
                  {migrationReport.vendorsImported} مورد
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#06182a] border border-amber-900/60">
                <span className="text-xs text-slate-400 block mb-1">الأصناف المخزنية:</span>
                <span className="text-lg font-bold text-amber-300 font-mono">
                  {migrationReport.itemsImported} صنف
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#06182a] border border-purple-900/60">
                <span className="text-xs text-slate-400 block mb-1">شجرة الحسابات:</span>
                <span className="text-lg font-bold text-purple-300 font-mono">
                  {migrationReport.accountsImported} حساب
                </span>
              </div>
            </div>

            {/* Opening Entry Alert if created */}
            {migrationReport.openingEntryCreated && (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 text-right text-xs space-y-1">
                <div className="font-bold text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>
                    تم توليد القيد الافتتاحي المتزن: {migrationReport.openingEntryCreated.entryNumber}
                  </span>
                </div>
                <p className="text-slate-300">
                  إجمالي الجانب المدين:{" "}
                  <span className="font-mono font-bold text-white">
                    {migrationReport.openingEntryCreated.totalDebit.toLocaleString()} YER
                  </span>{" "}
                  | إجمالي الجانب الدائن:{" "}
                  <span className="font-mono font-bold text-white">
                    {migrationReport.openingEntryCreated.totalCredit.toLocaleString()} YER
                  </span>{" "}
                  (متزن 100%).
                </p>
              </div>
            )}

            {/* Quick Links to verify */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              {onNavigateToTab && (
                <>
                  <button
                    onClick={() => onNavigateToTab("CUSTOMERS_AR")}
                    className="px-4 py-2 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-blue-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>كشف حسابات العملاء</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onNavigateToTab("INVENTORY")}
                    className="px-4 py-2 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>فحص جرد المخزون</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onNavigateToTab("JOURNAL_ENTRIES")}
                    className="px-4 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>دفتر قيود اليومية</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {onClose && (
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#e2bd46] text-slate-950 text-xs font-black transition cursor-pointer"
                >
                  إغلاق نافذة الترحيل
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
