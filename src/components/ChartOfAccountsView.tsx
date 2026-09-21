import React, { useState } from "react";
import {
  FolderTree,
  Folder,
  FolderOpen,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  FileText,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Download,
  Printer,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Account, AccountCategory, AccountNature, CurrencyCode, CurrencyInfo, JournalEntry } from "../types/erp";
import { formatMoney, formatNumberOnly } from "../services/erpStorage";
import { AccountLedgerModal } from "./AccountLedgerModal";

interface ChartOfAccountsViewProps {
  accounts: Account[];
  journalEntries: JournalEntry[];
  onAddAccount: (newAcc: Account) => void;
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
}

export const ChartOfAccountsView: React.FC<ChartOfAccountsViewProps> = ({
  accounts,
  journalEntries,
  onAddAccount,
  currencies,
  displayCurrency,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AccountCategory | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLedgerAccount, setSelectedLedgerAccount] = useState<Account | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "1": true,
    "11": true,
    "1101": true,
    "12": true,
    "2": true,
    "21": true,
    "3": true,
    "4": true,
    "5": true,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedParentAccount, setSelectedParentAccount] = useState<Account | null>(null);

  // New Account Form State
  const [newCode, setNewCode] = useState("");
  const [newNameAr, setNewNameAr] = useState("");
  const [newNameEn, setNewNameEn] = useState("");
  const [newCategory, setNewCategory] = useState<AccountCategory>("ASSET");
  const [newNature, setNewNature] = useState<AccountNature>("DEBIT");
  const [newCurrency, setNewCurrency] = useState<CurrencyCode | "MULTI">("YER_SANAA");
  const [newIsHeader, setNewIsHeader] = useState(false);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    accounts.forEach((a) => {
      all[a.id] = true;
    });
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  const openAddChildModal = (parent: Account) => {
    setSelectedParentAccount(parent);
    setNewCategory(parent.category);
    setNewNature(parent.nature);
    setNewCurrency(parent.currency);
    setNewIsHeader(false);

    // Auto calculate next code suggestion
    const siblings = accounts.filter((a) => a.parentId === parent.id);
    let nextSuffix = "01";
    if (siblings.length > 0) {
      const highestCode = siblings[siblings.length - 1].code;
      const num = parseInt(highestCode.slice(-2)) || siblings.length;
      nextSuffix = (num + 1).toString().padStart(2, "0");
    }
    setNewCode(`${parent.code}${nextSuffix}`);
    setShowAddModal(true);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newNameAr) return;

    const parent = selectedParentAccount;
    const newAccount: Account = {
      id: newCode,
      code: newCode,
      nameAr: newNameAr,
      nameEn: newNameEn || newNameAr,
      category: newCategory,
      nature: newNature,
      level: parent ? parent.level + 1 : 1,
      parentId: parent ? parent.id : undefined,
      isHeader: newIsHeader,
      currency: newCurrency,
      currentBalance: 0,
      balanceDebit: 0,
      balanceCredit: 0,
    };

    onAddAccount(newAccount);
    setShowAddModal(false);
    setNewCode("");
    setNewNameAr("");
    setNewNameEn("");
  };

  // Filter accounts
  const filteredAccounts = accounts.filter((a) => {
    if (selectedCategory !== "ALL" && a.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.code.toLowerCase().includes(q) ||
        a.nameAr.toLowerCase().includes(q) ||
        a.nameEn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate aggregated balance for headers
  const getAggregatedBalance = (account: Account): number => {
    if (!account.isHeader) return account.currentBalance;
    const descendants = accounts.filter((a) => a.code.startsWith(account.code) && !a.isHeader);
    return descendants.reduce((sum, d) => sum + d.currentBalance, 0);
  };

  // Group root accounts (Level 1)
  const rootAccounts = filteredAccounts.filter((a) => a.level === 1 || !a.parentId);

  // Render tree node recursive
  const renderAccountNode = (acc: Account) => {
    const children = accounts.filter((a) => a.parentId === acc.id);
    const isExpanded = expandedNodes[acc.id];
    const balance = getAggregatedBalance(acc);

    return (
      <div key={acc.id} className="space-y-1">
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
            acc.isHeader
              ? "bg-slate-900/90 font-bold border border-slate-800/80 hover:border-slate-700"
              : "bg-slate-950/40 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 font-normal"
          }`}
          style={{ paddingRight: `${Math.max(acc.level * 16, 12)}px` }}
        >
          {/* Account Code & Name */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {acc.isHeader ? (
              <button
                onClick={() => toggleNode(acc.id)}
                className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <span className="w-4 inline-block"></span>
            )}

            <div className="flex items-center gap-2">
              {acc.isHeader ? (
                isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Folder className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )
              ) : (
                <FileText className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              )}
              <span className="font-mono text-xs font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-900/50">
                {acc.code}
              </span>
              <span className={`text-xs truncate ${acc.isHeader ? "text-slate-100 font-bold" : "text-slate-300"}`}>
                {acc.nameAr}
              </span>
              {acc.nameEn && (
                <span className="text-[11px] text-slate-400 font-mono hidden xl:inline">({acc.nameEn})</span>
              )}
            </div>
          </div>

          {/* Account Attributes & Balance */}
          <div className="flex items-center gap-4">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                acc.nature === "DEBIT"
                  ? "bg-blue-950 text-blue-300 border border-blue-800/40"
                  : "bg-amber-950 text-amber-300 border border-amber-800/40"
              }`}
            >
              {acc.nature === "DEBIT" ? "طبيعة مدينة" : "طبيعة دائنة"}
            </span>

            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
              {acc.currency === "MULTI" ? "متعدد العملات" : acc.currency}
            </span>

            <div className="text-left font-mono font-bold text-xs min-w-[130px]">
              <span
                className={
                  balance > 0 ? "text-emerald-400" : balance < 0 ? "text-rose-400" : "text-slate-400"
                }
              >
                {formatMoney(balance, displayCurrency, currencies)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSelectedLedgerAccount(acc)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 text-[11px] font-semibold transition-colors flex items-center gap-1"
                title="عرض كشف حساب الأستاذ العام"
              >
                <BookOpen className="w-3 h-3" />
                <span className="hidden sm:inline">كشف حساب</span>
              </button>

              {acc.isHeader && (
                <button
                  onClick={() => openAddChildModal(acc)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors"
                  title="إضافة حساب فرعي"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Children Nodes */}
        {acc.isHeader && isExpanded && children.length > 0 && (
          <div className="space-y-1 pr-3 border-r-2 border-slate-800/60 mr-2">
            {children.map((child) => renderAccountNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Top Header & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">دليل وشجرة الحسابات الموحدة (FI Chart of Accounts)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            هيكل هرمي خماسي المستويات متوافق مع نظام SAP S/4HANA والمعايير المحاسبية IFRS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs transition-colors"
          >
            توسيع الكل
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs transition-colors"
          >
            طي الكل
          </button>
          <button
            onClick={() => {
              setSelectedParentAccount(null);
              setNewCode("");
              setNewNameAr("");
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حساب رئيسي</span>
          </button>
        </div>
      </div>

      {/* Category Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          {[
            { id: "ALL", label: "كافة الحسابات" },
            { id: "ASSET", label: "1. الأصول (Assets)" },
            { id: "LIABILITY", label: "2. الخصوم (Liabilities)" },
            { id: "EQUITY", label: "3. حقوق الملكية (Equity)" },
            { id: "REVENUE", label: "4. الإيرادات (Revenues)" },
            { id: "EXPENSE", label: "5. المصروفات (Expenses)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                selectedCategory === tab.id
                  ? "bg-emerald-600 text-white font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث برقم الحساب أو الاسم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Tree Container */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
        {rootAccounts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            لا توجد حسابات مطابقة لمعايير البحث
          </div>
        ) : (
          rootAccounts.map((root) => renderAccountNode(root))
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-right animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-emerald-400" />
                <span>
                  {selectedParentAccount
                    ? `إضافة حساب فرعي تحت (${selectedParentAccount.nameAr})`
                    : "إضافة حساب رئيسي جديد"}
                </span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">رمز / رقم الحساب *</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="مثال: 110105"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">التصنيف المحاسبي</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as AccountCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ASSET">أصول (Assets)</option>
                    <option value="LIABILITY">خصوم (Liabilities)</option>
                    <option value="EQUITY">حقوق ملكية (Equity)</option>
                    <option value="REVENUE">إيرادات (Revenues)</option>
                    <option value="EXPENSE">مصروفات (Expenses)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم الحساب بالعربية *</label>
                <input
                  type="text"
                  required
                  value={newNameAr}
                  onChange={(e) => setNewNameAr(e.target.value)}
                  placeholder="مثال: صندوق فرع المكلا"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم الحساب بالإنجليزية (اختياري)</label>
                <input
                  type="text"
                  value={newNameEn}
                  onChange={(e) => setNewNameEn(e.target.value)}
                  placeholder="مثال: Mukalla Branch Cash Vault"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">طبيعة الحساب</label>
                  <select
                    value={newNature}
                    onChange={(e) => setNewNature(e.target.value as AccountNature)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="DEBIT">مدين (Debit)</option>
                    <option value="CREDIT">دائن (Credit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">العملة الأساسية للحساب</label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="MULTI">متعدد العملات (Multi-Currency)</option>
                    <option value="YER_SANAA">ريال يمني (صنعاء)</option>
                    <option value="YER_ADEN">ريال يمني (عدن)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">حساب رئيسي / تجميعي (Header Account)</div>
                  <div className="text-[10px] text-slate-400">إذا تم تفعيله، لن يتم قبول قيود مباشرة عليه بل ستجمع أرصدة فروعه</div>
                </div>
                <input
                  type="checkbox"
                  checked={newIsHeader}
                  onChange={(e) => setNewIsHeader(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  حفظ الحساب في الدليل
                </button>
              </div>
            </form>
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
