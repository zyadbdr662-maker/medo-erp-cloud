import React, { useState, useMemo } from "react";
import { FormNavigationBar } from "./FormNavigationBar";
import {
  BookOpenCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Printer,
  Sparkles,
  ArrowRightLeft,
  Paperclip,
  FileCheck,
  Clock,
  Layers,
  Fingerprint,
} from "lucide-react";
import {
  Account,
  CostCenter,
  CurrencyCode,
  CurrencyInfo,
  EntryStatus,
  EntryType,
  JournalEntry,
  JournalLine,
} from "../types/erp";
import { formatMoney, formatNumberOnly } from "../services/erpStorage";
import { formatDate, formatDualDate } from "../utils/formatters";
import { SmartAiJournalModal } from "./SmartAiJournalModal";
import { BiometricApprovalModal } from "./security/BiometricApprovalModal";
import { cloudSecurityService } from "../services/cloudSecurityService";
import { ExportPdfButton } from "./ExportPdfButton";
import { ColumnCustomizer, useColumnVisibility, ColumnDef } from "./ColumnCustomizer";
import { Combobox, ComboboxOption } from "./Combobox";

interface JournalEntriesViewProps {
  journalEntries: JournalEntry[];
  accounts: Account[];
  costCenters: CostCenter[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  onSaveJournalEntry: (entry: JournalEntry) => void;
  onPostJournalEntry: (entryId: string) => void;
  onPrintDocument: (docType: "JOURNAL", data: any) => void;
  onOpenAi: () => void;
}

export const JournalEntriesView: React.FC<JournalEntriesViewProps> = ({
  journalEntries,
  accounts,
  costCenters,
  currencies,
  displayCurrency,
  onSaveJournalEntry,
  onPostJournalEntry,
  onPrintDocument,
  onOpenAi,
}) => {
  const [statusFilter, setStatusFilter] = useState<EntryStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSmartAiModal, setShowSmartAiModal] = useState(false);
  const [selectedEntryForView, setSelectedEntryForView] = useState<JournalEntry | null>(null);

  // Column Customization Hook
  const JOURNAL_COLUMNS: ColumnDef[] = [
    { id: "entryNumber", label: "رقم القيد", locked: true },
    { id: "date", label: "التاريخ / الفترة" },
    { id: "type", label: "النوع" },
    { id: "description", label: "البيان والوصف المحاسبي" },
    { id: "totalDebit", label: "إجمالي المدين" },
    { id: "totalCredit", label: "إجمالي الدائن" },
    { id: "status", label: "الحالة" },
    { id: "actions", label: "الإجراءات", locked: true },
  ];
  const { visibleColumns, updateVisibility, isVisible } = useColumnVisibility("journal_entries", JOURNAL_COLUMNS);

  // Biometric WebAuthn Financial Approval State
  const [biometricPending, setBiometricPending] = useState<{
    amount: number;
    description: string;
    onApprove: (sig: { authType: string; signature: string }) => void;
  } | null>(null);

  // New Journal Entry Form State
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<EntryType>("STANDARD");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [entryCurrency, setEntryCurrency] = useState<CurrencyCode>("YER_SANAA");

  const nonHeaderAccounts = accounts.filter((a) => !a.isHeader);

  const accountOptions: ComboboxOption[] = useMemo(() => {
    return nonHeaderAccounts.map(acc => ({
      id: acc.id,
      label: acc.nameAr,
      secondaryLabel: acc.code
    }));
  }, [nonHeaderAccounts]);

  const costCenterOptions: ComboboxOption[] = useMemo(() => {
    return [
      { id: "", label: "بدون مركز تكلفة" },
      ...costCenters.map(cc => ({
        id: cc.id,
        label: cc.nameAr,
        secondaryLabel: cc.code
      }))
    ];
  }, [costCenters]);

  const initialLines: JournalLine[] = [
    {
      id: "line-1",
      accountId: nonHeaderAccounts[0]?.id || "110101",
      accountCode: nonHeaderAccounts[0]?.code || "110101",
      accountNameAr: nonHeaderAccounts[0]?.nameAr || "الصندوق",
      debit: 0,
      credit: 0,
      currency: "YER_SANAA",
      exchangeRate: 1,
      costCenterId: "",
      memo: "",
    },
    {
      id: "line-2",
      accountId: nonHeaderAccounts[1]?.id || "4101",
      accountCode: nonHeaderAccounts[1]?.code || "4101",
      accountNameAr: nonHeaderAccounts[1]?.nameAr || "المبيعات",
      debit: 0,
      credit: 0,
      currency: "YER_SANAA",
      exchangeRate: 1,
      costCenterId: "",
      memo: "",
    },
  ];

  const [lines, setLines] = useState<JournalLine[]>(initialLines);

  const addLine = () => {
    const nextAcc = nonHeaderAccounts[0];
    setLines((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}-${Math.random()}`,
        accountId: nextAcc?.id || "110101",
        accountCode: nextAcc?.code || "110101",
        accountNameAr: nextAcc?.nameAr || "حساب",
        debit: 0,
        credit: 0,
        currency: entryCurrency,
        exchangeRate: 1,
        costCenterId: "",
        memo: "",
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length <= 2) return;
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLine = (id: string, field: keyof JournalLine, value: any) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;

        if (field === "accountId") {
          const acc = nonHeaderAccounts.find((a) => a.id === value);
          return {
            ...l,
            accountId: value,
            accountCode: acc?.code || "",
            accountNameAr: acc?.nameAr || "",
          };
        }

        if (field === "costCenterId") {
          const cc = costCenters.find((c) => c.id === value);
          return {
            ...l,
            costCenterId: value,
            costCenterName: cc?.nameAr || "",
          };
        }

        return { ...l, [field]: value };
      })
    );
  };

  // Balancing calculations
  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && difference === 0;

  const handleSaveEntry = (statusToSet: EntryStatus = "DRAFT") => {
    if (!description.trim()) {
      alert("يرجى إدخال بيان ووصف القيد");
      return;
    }
    if (!isBalanced && statusToSet === "POSTED") {
      alert("لا يمكن ترحيل قيد غير متوازن (إجمالي المدين لا يساوي إجمالي الدائن)");
      return;
    }

    const nextNumber = `JV-2026-${(journalEntries.length + 1).toString().padStart(4, "0")}`;
    const newEntry: JournalEntry = {
      id: `je-${Date.now()}`,
      entryNumber: nextNumber,
      date,
      period: date.slice(0, 7),
      type,
      reference,
      description,
      status: statusToSet,
      currency: entryCurrency,
      totalDebit,
      totalCredit,
      lines,
      createdBy: "أ. محمد عبد الرقيب",
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      approvedBy: statusToSet === "APPROVED" || statusToSet === "POSTED" ? "د. طارق المنصوري" : undefined,
      approvedAt: statusToSet === "APPROVED" || statusToSet === "POSTED" ? new Date().toISOString().slice(0, 10) : undefined,
    };

    // Check if WebAuthn biometric verification is required for this amount
    if (
      (statusToSet === "POSTED" || statusToSet === "APPROVED") &&
      cloudSecurityService.isBiometricRequiredForTransaction(totalDebit)
    ) {
      setBiometricPending({
        amount: totalDebit,
        description: `اعتماد وترحيل سند قيد يومية رقم (${nextNumber}): ${description}`,
        onApprove: (sig) => {
          newEntry.approvedBy = `مصادقة بيومترية WebAuthn (${sig.signature.slice(0, 14)})`;
          newEntry.approvedAt = new Date().toISOString().slice(0, 10);
          onSaveJournalEntry(newEntry);
          setShowCreateModal(false);
          setDescription("");
          setReference("");
          setLines(initialLines);
          setBiometricPending(null);
        },
      });
      return;
    }

    onSaveJournalEntry(newEntry);
    setShowCreateModal(false);
    // Reset
    setDescription("");
    setReference("");
    setLines(initialLines);
  };

  const handleRequestPostEntry = (entry: JournalEntry) => {
    const amount = Math.max(entry.totalDebit, entry.totalCredit);
    if (cloudSecurityService.isBiometricRequiredForTransaction(amount)) {
      setBiometricPending({
        amount,
        description: `ترحيل قيد اليومية (${entry.entryNumber}) - ${entry.description}`,
        onApprove: () => {
          onPostJournalEntry(entry.id);
          setBiometricPending(null);
        },
      });
    } else {
      onPostJournalEntry(entry.id);
    }
  };

  // Filter entries
  const filteredEntries = journalEntries.filter((je) => {
    if (statusFilter !== "ALL" && je.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        je.entryNumber.toLowerCase().includes(q) ||
        je.description.toLowerCase().includes(q) ||
        (je.reference && je.reference.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">دفتر قيود اليومية العامة (GL Journal Vouchers)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            سجل القيود المزدوجة المتوافقة مع معايير التدقيق SAP FI ونظام الترحيل الفوري للأستاذ العام
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ExportPdfButton
            targetId="journal-entries-table-container"
            reportTitle="سجل سندات قيود اليومية المحاسبية المعتمدة"
            filename="سجل_قيود_اليومية.pdf"
            label="تصدير القيود PDF"
          />
          <button
            onClick={() => setShowSmartAiModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>توليد قيد ذكي عبر AI</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء قيد محاسبي جديد</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          {[
            { id: "ALL", label: "كافة القيود" },
            { id: "POSTED", label: "المرحلة (Posted)" },
            { id: "APPROVED", label: "المعتمدة (Approved)" },
            { id: "DRAFT", label: "مسودات معلقة (Drafts)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                statusFilter === tab.id
                  ? "bg-emerald-600 text-white font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Column Customizer */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ColumnCustomizer
            tableKey="journal_entries"
            columns={JOURNAL_COLUMNS}
            visibleColumns={visibleColumns}
            onChange={updateVisibility}
          />
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث برقم القيد أو البيان أو المرجع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Entries Table */}
      <div id="journal-entries-table-container" className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-slate-200">
            <thead>
              <tr className="text-white border-b-2 border-slate-700 bg-slate-950 font-bold">
                {isVisible("entryNumber") && <th className="py-4 px-4 font-extrabold text-xs text-white">رقم القيد</th>}
                {isVisible("date") && <th className="py-4 px-4 font-extrabold text-xs text-white">التاريخ / الفترة</th>}
                {isVisible("type") && <th className="py-4 px-4 font-extrabold text-xs text-white">النوع</th>}
                {isVisible("description") && <th className="py-4 px-4 font-extrabold text-xs text-white">البيان والوصف المحاسبي</th>}
                {isVisible("totalDebit") && <th className="py-4 px-4 font-extrabold text-xs text-white text-left">إجمالي المدين</th>}
                {isVisible("totalCredit") && <th className="py-4 px-4 font-extrabold text-xs text-white text-left">إجمالي الدائن</th>}
                {isVisible("status") && <th className="py-4 px-4 font-extrabold text-xs text-white text-center">الحالة</th>}
                {isVisible("actions") && <th className="py-4 px-4 font-extrabold text-xs text-white text-center">الإجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/80">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={JOURNAL_COLUMNS.filter((c) => isVisible(c.id)).length} className="py-12 text-center text-slate-400 font-medium">
                    لا توجد قيود يومية مطابقة للفلتر المحدد
                  </td>
                </tr>
              ) : (
                filteredEntries.map((je) => (
                  <tr key={je.id} className="hover:bg-slate-800/60 transition-colors">
                    {isVisible("entryNumber") && <td className="py-4 px-4 font-mono font-black text-emerald-400 text-sm">{je.entryNumber}</td>}
                    {isVisible("date") && (
                      <td className="py-4 px-4 text-slate-200 font-medium">
                        <div title={formatDualDate(je.date)} className="font-semibold text-slate-100">
                          {formatDate(je.date)}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{je.period}</div>
                      </td>
                    )}
                    {isVisible("type") && (
                      <td className="py-4 px-4">
                        <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 font-bold border border-slate-600">
                          {je.type === "OPENING"
                            ? "افتتاحي"
                            : je.type === "RECEIPT"
                            ? "قبض"
                            : je.type === "PAYMENT"
                            ? "صرف"
                            : je.type === "DEPRECIATION"
                            ? "إهلاك"
                            : "يومية عام"}
                        </span>
                      </td>
                    )}
                    {isVisible("description") && (
                      <td className="py-4 px-4 text-slate-100 font-semibold max-w-sm">
                        <div className="truncate text-sm">{je.description}</div>
                        {je.reference && (
                          <div className="text-xs text-slate-300 font-mono mt-0.5">مرجع: {je.reference}</div>
                        )}
                      </td>
                    )}
                    {isVisible("totalDebit") && (
                      <td className="py-4 px-4 text-left font-mono font-black text-emerald-400 text-base">
                        {formatMoney(je.totalDebit, je.currency, currencies)}
                      </td>
                    )}
                    {isVisible("totalCredit") && (
                      <td className="py-4 px-4 text-left font-mono font-black text-blue-400 text-base">
                        {formatMoney(je.totalCredit, je.currency, currencies)}
                      </td>
                    )}
                    {isVisible("status") && (
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`text-xs px-3 py-1 rounded-md font-bold ${
                            je.status === "POSTED"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-600"
                              : je.status === "APPROVED"
                              ? "bg-blue-950 text-blue-300 border border-blue-600"
                              : "bg-amber-950 text-amber-300 border border-amber-600"
                          }`}
                        >
                          {je.status === "POSTED" ? "مرحل" : je.status === "APPROVED" ? "معتمد" : "مسودة"}
                        </span>
                      </td>
                    )}
                    {isVisible("actions") && (
                      <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedEntryForView(je)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="عرض تفاصيل القيد"
                        >
                          <BookOpenCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onPrintDocument("JOURNAL", je)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="طباعة سند القيد"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {je.status === "DRAFT" && (
                          <button
                            onClick={() => handleRequestPostEntry(je)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-all shadow-sm flex items-center gap-1"
                            title="ترحيل القيد للأستاذ العام (مع التحقق البيومتري للمبالغ المرتفعة)"
                          >
                            {cloudSecurityService.isBiometricRequiredForTransaction(
                              Math.max(je.totalDebit, je.totalCredit)
                            ) && <Fingerprint className="w-3 h-3 text-emerald-200" />}
                            <span>ترحيل</span>
                          </button>
                        )}
                      </div>
                    </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Journal Entry Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-4 text-right animate-in zoom-in-95 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <FormNavigationBar
              title="إنشاء سند قيد محاسبي جديد (Journal Voucher)"
              onBack={() => setShowCreateModal(false)}
              onSave={() => handleSaveEntry(isBalanced ? "POSTED" : "DRAFT")}
              onSaveAndPrint={() => handleSaveEntry("POSTED")}
              onSaveAndNew={() => handleSaveEntry(isBalanced ? "POSTED" : "DRAFT")}
              hasUnsavedChanges={Boolean(description.trim() !== "" || lines.length > 0)}
            />

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">تاريخ القيد *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">نوع القيد المحاسبي</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as EntryType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="STANDARD">قيد يومية عام (Standard JV)</option>
                  <option value="OPENING">قيد افتتاحي (Opening)</option>
                  <option value="ADJUSTING">قيد تسوية (Adjusting)</option>
                  <option value="DEPRECIATION">قيد إهلاك أصول (Depreciation)</option>
                  <option value="REVALUATION">قيد إعادة تقييم عملة (Forex Reval)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">عملة القيد الأساسية</label>
                <select
                  value={entryCurrency}
                  onChange={(e) => setEntryCurrency(e.target.value as CurrencyCode)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="YER_SANAA">ريال يمني (صنعاء)</option>
                  <option value="YER_ADEN">ريال يمني (عدن)</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">رقم المرجع / المستند المرفق</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="مثال: فاتورة #109 أو شيك #784"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="mb-4 text-xs">
              <label className="block text-slate-400 mb-1 font-semibold">البيان والوصف العام للقيد *</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب شرحاً وافياً للمعاملة المالية..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Lines Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="py-2.5 px-3 font-semibold w-10 text-center">#</th>
                    <th className="py-2.5 px-3 font-semibold min-w-[220px]">الحساب المالي (GL Account) *</th>
                    <th className="py-2.5 px-3 font-semibold w-36 text-left">مدين (Debit)</th>
                    <th className="py-2.5 px-3 font-semibold w-36 text-left">دائن (Credit)</th>
                    <th className="py-2.5 px-3 font-semibold min-w-[150px]">مركز التكلفة (CO)</th>
                    <th className="py-2.5 px-3 font-semibold min-w-[180px]">شرح السطر (Memo)</th>
                    <th className="py-2.5 px-3 font-semibold w-10 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                  {lines.map((line, idx) => (
                    <tr key={line.id} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <Combobox
                          options={accountOptions}
                          value={line.accountId}
                          onChange={(val) => updateLine(line.id, "accountId", val)}
                          placeholder="اختر الحساب المحاسبي..."
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={line.debit === 0 ? "" : line.debit}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            updateLine(line.id, "debit", val);
                            if (val > 0) updateLine(line.id, "credit", 0); // debit and credit mutually exclusive on same line
                          }}
                          placeholder="0.00"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-left text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={line.credit === 0 ? "" : line.credit}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            updateLine(line.id, "credit", val);
                            if (val > 0) updateLine(line.id, "debit", 0);
                          }}
                          placeholder="0.00"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-left text-blue-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Combobox
                          options={costCenterOptions}
                          value={line.costCenterId || ""}
                          onChange={(val) => updateLine(line.id, "costCenterId", val)}
                          placeholder="بدون مركز تكلفة"
                          className="min-w-[150px]"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={line.memo}
                          onChange={(e) => updateLine(line.id, "memo", e.target.value)}
                          placeholder="ملاحظات السطر..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-emerald-500"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          disabled={lines.length <= 2}
                          className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold mb-4 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>إضافة طرف / سطر جديد للقيد</span>
            </button>

            {/* Balancing Indicator Footer */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4 text-xs font-mono font-bold">
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">إجمالي المدين:</span>
                  <span className="text-emerald-400 text-sm">{formatMoney(totalDebit, entryCurrency, currencies)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">إجمالي الدائن:</span>
                  <span className="text-blue-400 text-sm">{formatMoney(totalCredit, entryCurrency, currencies)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">الفارق:</span>
                  <span className={difference === 0 ? "text-emerald-400 text-sm" : "text-rose-400 text-sm"}>
                    {formatMoney(difference, entryCurrency, currencies)}
                  </span>
                </div>
              </div>

              <div>
                {isBalanced ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>القيد متوازن وصالح للترحيل</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-950/60 border border-rose-800/60 px-3 py-1.5 rounded-xl">
                    <AlertCircle className="w-4 h-4" />
                    <span>القيد غير متوازن (فارق: {formatNumberOnly(difference)})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                إلغاء
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveEntry("DRAFT")}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-colors border border-amber-900/40"
                >
                  حفظ كمسودة
                </button>
                <button
                  type="button"
                  disabled={!isBalanced}
                  onClick={() => handleSaveEntry("POSTED")}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>اعتماد وترحيل القيد للأستاذ العام</span>
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* View Entry Details Modal */}
      {selectedEntryForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl p-6 text-right animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpenCheck className="w-4 h-4 text-emerald-400" />
                  <span>تفاصيل سند القيد ({selectedEntryForView.entryNumber})</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  تاريخ: <span className="text-emerald-400 font-semibold">{formatDate(selectedEntryForView.date)}</span>
                  <span className="text-slate-500 mr-1.5">({formatDualDate(selectedEntryForView.date)})</span> | بواسطة: {selectedEntryForView.createdBy}
                </div>
              </div>
              <button
                onClick={() => setSelectedEntryForView(null)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 mb-4 text-xs">
              <div className="text-slate-400 font-semibold mb-1">البيان:</div>
              <div className="text-slate-200 font-medium">{selectedEntryForView.description}</div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="py-2 px-3 font-semibold">رمز الحساب</th>
                    <th className="py-2 px-3 font-semibold">اسم الحساب</th>
                    <th className="py-2 px-3 font-semibold text-left">مدين</th>
                    <th className="py-2 px-3 font-semibold text-left">دائن</th>
                    <th className="py-2 px-3 font-semibold">مركز التكلفة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedEntryForView.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{l.accountCode}</td>
                      <td className="py-2.5 px-3 text-slate-200">{l.accountNameAr}</td>
                      <td className="py-2.5 px-3 text-left font-mono font-bold text-emerald-400">
                        {l.debit > 0 ? formatMoney(l.debit, l.currency, currencies) : "-"}
                      </td>
                      <td className="py-2.5 px-3 text-left font-mono font-bold text-blue-400">
                        {l.credit > 0 ? formatMoney(l.credit, l.currency, currencies) : "-"}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{l.costCenterName || "-"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-950 font-bold border-t border-slate-800">
                    <td colSpan={2} className="py-2.5 px-3 text-slate-300">الإجمالي العام:</td>
                    <td className="py-2.5 px-3 text-left font-mono text-emerald-400">
                      {formatMoney(selectedEntryForView.totalDebit, selectedEntryForView.currency, currencies)}
                    </td>
                    <td className="py-2.5 px-3 text-left font-mono text-blue-400">
                      {formatMoney(selectedEntryForView.totalCredit, selectedEntryForView.currency, currencies)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  onPrintDocument("JOURNAL", selectedEntryForView);
                  setSelectedEntryForView(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة سند القيد الرسمي</span>
              </button>

              <button
                onClick={() => setSelectedEntryForView(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart AI Journal Generator Modal */}
      {showSmartAiModal && (
        <SmartAiJournalModal
          accounts={accounts}
          costCenters={costCenters}
          currencies={currencies}
          displayCurrency={displayCurrency}
          onClose={() => setShowSmartAiModal(false)}
          onApplyGeneratedEntry={(aiData) => {
            if (aiData.description) setDescription(aiData.description);
            if (aiData.reference) setReference(aiData.reference);
            if (aiData.currency) setEntryCurrency(aiData.currency);
            if (aiData.lines && aiData.lines.length > 0) {
              setLines(aiData.lines);
            }
            setShowCreateModal(true);
          }}
        />
      )}

      {/* Biometric WebAuthn Approval Modal for Financial Transactions */}
      {biometricPending && (
        <BiometricApprovalModal
          isOpen={true}
          onClose={() => setBiometricPending(null)}
          onApproved={biometricPending.onApprove}
          amount={biometricPending.amount}
          currency={entryCurrency}
          actionDescription={biometricPending.description}
          actorName="المسؤول المالي"
          actorRole="FINANCIAL_MANAGER"
        />
      )}
    </div>
  );
};
