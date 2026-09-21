import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  X,
  FileText,
  Scale,
  Users,
  Building2,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
  Mic,
  Tag,
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  CornerDownLeft,
  Filter,
  DollarSign,
  TrendingUp,
  Receipt,
  ExternalLink,
} from "lucide-react";
import { NavTab } from "./Sidebar";
import {
  Invoice,
  JournalEntry,
  Customer,
  Vendor,
  Account,
  CurrencyCode,
  CurrencyInfo,
} from "../types/erp";
import { formatCurrency } from "../utils/formatters";
import { IS_ADMIN_ENV } from "../config/env";

export type SearchCategory = "ALL" | "INVOICES" | "JOURNALS" | "CUSTOMERS" | "VENDORS" | "ACCOUNTS";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: NavTab) => void;
  invoices?: Invoice[];
  bills?: Invoice[];
  journalEntries?: JournalEntry[];
  customers?: Customer[];
  vendors?: Vendor[];
  accounts?: Account[];
  currencies?: CurrencyInfo[];
  displayCurrency?: CurrencyCode;
  onOpenVoiceSearch?: () => void;
  initialQuery?: string;
}

const RECENT_SEARCHES_KEY = "medo_erp_recent_searches_v1";

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  invoices = [],
  bills = [],
  journalEntries = [],
  customers = [],
  vendors = [],
  accounts = [],
  currencies = [],
  displayCurrency = "YER_SANAA",
  onOpenVoiceSearch,
  initialQuery = "",
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>("ALL");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 8));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Update query when initialQuery prop changes or when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setQuery(initialQuery);
      }
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialQuery]);

  // Combine all invoices & bills into one searchable array
  const allInvoices = useMemo(() => {
    const combined = [...invoices];
    if (bills && bills.length > 0) {
      bills.forEach((b) => {
        if (!combined.some((ex) => ex.id === b.id || ex.invoiceNumber === b.invoiceNumber)) {
          combined.push(b);
        }
      });
    }
    return combined;
  }, [invoices, bills]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    try {
      const updated = [term.trim(), ...recentSearches.filter((s) => s !== term.trim())].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((s) => s !== term);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Filtered and Scored Results
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: {
      id: string;
      category: "INVOICES" | "JOURNALS" | "CUSTOMERS" | "VENDORS" | "ACCOUNTS";
      title: string;
      subtitle: string;
      details: string;
      badge: string;
      badgeColor: string;
      amount?: string;
      status?: string;
      date?: string;
      tab: NavTab;
      raw: any;
    }[] = [];

    // 1. Search Invoices & Bills
    if (selectedCategory === "ALL" || selectedCategory === "INVOICES") {
      allInvoices.forEach((inv) => {
        const invNum = (inv.invoiceNumber || "").toLowerCase();
        const party = (inv.partyName || inv.customerName || inv.vendorName || "").toLowerCase();
        const notes = (inv.notes || "").toLowerCase();
        const paymentTerms = (inv.paymentTerms || "").toLowerCase();
        const totalStr = (inv.totalAmount || inv.grandTotal || "").toString();
        const itemsMatch = (inv.items || []).some((it) => (it.description || "").toLowerCase().includes(q));

        if (
          invNum.includes(q) ||
          party.includes(q) ||
          notes.includes(q) ||
          paymentTerms.includes(q) ||
          totalStr.includes(q) ||
          itemsMatch
        ) {
          const isPurchase = inv.type === "PURCHASE" || inv.type === "PURCHASE_RETURN";
          const isReturn = inv.type === "SALES_RETURN" || inv.type === "PURCHASE_RETURN";
          
          let badge = "فاتورة مبيعات";
          let badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
          let targetTab: NavTab = "SALES_RETURNS";

          if (inv.type === "SALES_RETURN") {
            badge = "مردود مبيعات";
            badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
            targetTab = "SALES_RETURNS";
          } else if (inv.type === "PURCHASE") {
            badge = "فاتورة مشتريات (دائن)";
            badgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/40";
            targetTab = "PURCHASES_RETURNS";
          } else if (inv.type === "PURCHASE_RETURN") {
            badge = "مردود مشتريات";
            badgeColor = "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
            targetTab = "PURCHASES_RETURNS";
          }

          results.push({
            id: `inv-${inv.id}`,
            category: "INVOICES",
            title: `${inv.invoiceNumber} - ${party || "عميل عام"}`,
            subtitle: inv.notes || `تاريخ الفاتورة: ${inv.date} | الاستحقاق: ${inv.dueDate || inv.date}`,
            details: `الأصناف: ${inv.items?.length || 0} | المدفوع: ${formatCurrency(inv.paidAmount || 0, inv.currency || "YER_SANAA")}`,
            badge,
            badgeColor,
            amount: formatCurrency(inv.totalAmount || inv.grandTotal || 0, inv.currency || "YER_SANAA"),
            status: inv.status === "PAID" ? "مدفوعة بالكامل" : inv.status === "PARTIALLY_PAID" ? "مدفوعة جزئياً" : "غير مدفوعة (آجلة)",
            date: inv.date,
            tab: targetTab,
            raw: inv,
          });
        }
      });
    }

    // 2. Search Journal Entries
    if (selectedCategory === "ALL" || selectedCategory === "JOURNALS") {
      journalEntries.forEach((je) => {
        const entryNum = (je.entryNumber || "").toLowerCase();
        const desc = (je.description || "").toLowerCase();
        const ref = (je.reference || "").toLowerCase();
        const branch = (je.branch || "").toLowerCase();
        const linesMatch = (je.lines || []).some(
          (l) =>
            (l.accountName || "").toLowerCase().includes(q) ||
            (l.accountCode || "").toLowerCase().includes(q) ||
            (l.description || "").toLowerCase().includes(q)
        );

        if (entryNum.includes(q) || desc.includes(q) || ref.includes(q) || branch.includes(q) || linesMatch) {
          const totalDebit = (je.lines || []).reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
          const isBalanced = je.isBalanced !== false;

          results.push({
            id: `je-${je.id}`,
            category: "JOURNALS",
            title: `${je.entryNumber} - ${je.description}`,
            subtitle: `المرجع: ${je.reference || "بدون"} | الفرع: ${je.branch || "الرئيسي"} | الأطراف: ${je.lines?.length || 0} أسطر`,
            details: je.lines?.map((l) => `${l.accountName} (${l.debit ? `مدين: ${l.debit}` : `دائن: ${l.credit}`})`).slice(0, 2).join(" • ") || "",
            badge: isBalanced ? "قيد يومية متزن" : "قيد غير متزن ⚠️",
            badgeColor: isBalanced ? "bg-teal-500/20 text-teal-300 border-teal-500/40" : "bg-rose-500/20 text-rose-300 border-rose-500/40",
            amount: formatCurrency(totalDebit, je.currency || "YER_SANAA"),
            status: je.status === "POSTED" ? "مرحّل" : "مسودة",
            date: je.date,
            tab: "JOURNAL_ENTRIES",
            raw: je,
          });
        }
      });
    }

    // 3. Search Customers
    if (selectedCategory === "ALL" || selectedCategory === "CUSTOMERS") {
      customers.forEach((c) => {
        const nameAr = (c.nameAr || "").toLowerCase();
        const nameEn = (c.nameEn || "").toLowerCase();
        const code = (c.code || "").toLowerCase();
        const phone = (c.phone || "").toLowerCase();
        const email = (c.email || "").toLowerCase();
        const taxNum = (c.taxNumber || "").toLowerCase();
        const city = (c.city || "").toLowerCase();

        if (
          nameAr.includes(q) ||
          nameEn.includes(q) ||
          code.includes(q) ||
          phone.includes(q) ||
          email.includes(q) ||
          taxNum.includes(q) ||
          city.includes(q)
        ) {
          results.push({
            id: `cust-${c.id}`,
            category: "CUSTOMERS",
            title: `${c.code} • ${c.nameAr}`,
            subtitle: `هاتف: ${c.phone || "غير مسجل"} | المدينة: ${c.city || "صنعاء"} | الرقم الضريبي: ${c.taxNumber || "—"}`,
            details: `الحد الائتماني: ${formatCurrency(c.creditLimit || 0, c.currency || "YER_SANAA")}`,
            badge: "عميل (مدين)",
            badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
            amount: formatCurrency(c.currentBalance || 0, c.currency || "YER_SANAA"),
            status: (c.currentBalance || 0) > 0 ? "مدين لنا (رصيد مستحق)" : (c.currentBalance || 0) < 0 ? "دائن لنا" : "الحساب مصفر",
            tab: "CUSTOMERS_AR",
            raw: c,
          });
        }
      });
    }

    // 4. Search Vendors
    if (selectedCategory === "ALL" || selectedCategory === "VENDORS") {
      vendors.forEach((v) => {
        const nameAr = (v.nameAr || "").toLowerCase();
        const nameEn = (v.nameEn || "").toLowerCase();
        const code = (v.code || "").toLowerCase();
        const phone = (v.phone || "").toLowerCase();
        const email = (v.email || "").toLowerCase();
        const taxNum = (v.taxNumber || "").toLowerCase();
        const city = (v.city || "").toLowerCase();

        if (
          nameAr.includes(q) ||
          nameEn.includes(q) ||
          code.includes(q) ||
          phone.includes(q) ||
          email.includes(q) ||
          taxNum.includes(q) ||
          city.includes(q)
        ) {
          results.push({
            id: `vend-${v.id}`,
            category: "VENDORS",
            title: `${v.code} • ${v.nameAr}`,
            subtitle: `هاتف: ${v.phone || "غير مسجل"} | المدينة: ${v.city || "صنعاء"} | البريد: ${v.email || "—"}`,
            details: `التصنيف: ${v.category || "مورد عام"} | السجل التجاري: ${v.commercialRegister || "—"}`,
            badge: "مورد (دائن)",
            badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
            amount: formatCurrency(v.currentBalance || 0, v.currency || "YER_SANAA"),
            status: (v.currentBalance || 0) > 0 ? "دائن (مستحق للمورد)" : "خالص السداد",
            tab: "VENDORS_AP",
            raw: v,
          });
        }
      });
    }

    // 5. Search Accounts & General Ledger
    if (selectedCategory === "ALL" || selectedCategory === "ACCOUNTS") {
      accounts.forEach((acc) => {
        const code = (acc.code || "").toLowerCase();
        const nameAr = (acc.nameAr || "").toLowerCase();
        const nameEn = (acc.nameEn || "").toLowerCase();
        const type = (acc.type || "").toLowerCase();

        if (code.includes(q) || nameAr.includes(q) || nameEn.includes(q) || type.includes(q)) {
          let typeLabel = "حساب مالي";
          if (acc.type === "ASSET") typeLabel = "أصول";
          else if (acc.type === "LIABILITY") typeLabel = "خصوم والتزامات";
          else if (acc.type === "EQUITY") typeLabel = "حقوق ملكية";
          else if (acc.type === "REVENUE") typeLabel = "إيرادات";
          else if (acc.type === "EXPENSE") typeLabel = "مصروفات";

          results.push({
            id: `acc-${acc.id}`,
            category: "ACCOUNTS",
            title: `${acc.code} • ${acc.nameAr}`,
            subtitle: `النوع: ${typeLabel} | العملة: ${acc.currency} | المستوى: ${acc.level || 1}`,
            details: acc.nameEn || "دليل الحسابات المحاسبي الموحد",
            badge: typeLabel,
            badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
            amount: formatCurrency(acc.currentBalance || 0, acc.currency || "YER_SANAA"),
            status: acc.isActive ? "نشط" : "معطل",
            tab: "CHART_OF_ACCOUNTS",
            raw: acc,
          });
        }
      });
    }

    // 5. System & Security Navigation Destinations
    const sysDestinations: {
      name: string;
      keywords: string[];
      tab: NavTab;
      badge: string;
      details: string;
    }[] = [
      {
        name: "المنصة السحابية المشفرة ومركز الأمان السيادي (Cloud Security & Firewall)",
        keywords: ["سحاب", "سحابية", "مشفر", "مشفرة", "أمن", "أمان", "firewall", "حماية", "webauthn", "بصمة", "تشفير", "aes"],
        tab: "EXECUTIVE_MASTER_SUITE",
        badge: "منصة سحابية مشفرة",
        details: "جدار الحماية WAF، تشفير قواعد البيانات AES-256، التحقق البيومتري، والتحليلات الجغرافية",
      },
      {
        name: "المنظومة والتراخيص السحابية (SaaS Multi-Tenant)",
        keywords: ["ترخيص", "تراخيص", "saas", "سحابية", "اشتراك", "سحابة"],
        tab: "EXECUTIVE_MASTER_SUITE",
        badge: "تراخيص سحابية",
        details: "إدارة المؤسسات المستأجرة، وتراخيص الفروع والمستخدمين السحابية",
      },
      {
        name: "المزامنة وقاعدة البيانات السحابية (Cloud Sync & Offline)",
        keywords: ["مزامنة", "سحاب", "تزامن", "offline", "sync", "محرك"],
        tab: "CLOUD_SYNC",
        badge: "مزامنة سحابية",
        details: "مزامنة البيانات بين النسخ المحلية والسحابية المتعددة Multi-Cloud",
      },
    ];

    const finalSysDestinations = IS_ADMIN_ENV 
      ? sysDestinations 
      : sysDestinations.filter(d => d.tab !== "EXECUTIVE_MASTER_SUITE" && d.tab !== "SAAS_PLATFORM" && d.tab !== "CLOUD_SYNC");

    finalSysDestinations.forEach((dest, idx) => {
      if (dest.keywords.some((kw) => q.includes(kw) || kw.includes(q)) || dest.name.toLowerCase().includes(q)) {
        results.unshift({
          id: `sys-nav-${idx}`,
          category: "ACCOUNTS",
          title: `⚡ انتقال سريع: ${dest.name}`,
          subtitle: dest.details,
          details: "اختصار مباشر إلى النظام",
          badge: dest.badge,
          badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
          tab: dest.tab,
          raw: dest,
        });
      }
    });

    return results;
  }, [query, selectedCategory, allInvoices, journalEntries, customers, vendors, accounts, currencies]);

  // Keyboard navigation inside search results
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults.length > 0 && searchResults[selectedIndex]) {
        handleSelectResult(searchResults[selectedIndex]);
      }
    }
  };

  const handleSelectResult = (item: (typeof searchResults)[0]) => {
    saveRecentSearch(query);
    setActiveTab(item.tab);
    onClose();
  };

  if (!isOpen) return null;

  const counts = {
    all: searchResults.length,
    invoices: searchResults.filter((r) => r.category === "INVOICES").length,
    journals: searchResults.filter((r) => r.category === "JOURNALS").length,
    customers: searchResults.filter((r) => r.category === "CUSTOMERS").length,
    vendors: searchResults.filter((r) => r.category === "VENDORS").length,
    accounts: searchResults.filter((r) => r.category === "ACCOUNTS").length,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Search Input Box */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 flex-shrink-0">
            <Search className="w-5 h-5" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في الفواتير، القيود المحاسبية، أسماء العملاء، الموردين، الحسابات..."
              className="w-full bg-transparent border-none text-sm sm:text-base font-bold text-white placeholder-slate-400 focus:outline-none focus:ring-0"
              autoFocus
            />
          </div>

          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
              title="مسح النص"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {onOpenVoiceSearch && (
            <button
              onClick={() => {
                onClose();
                onOpenVoiceSearch();
              }}
              className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm flex-shrink-0"
              title="البحث الصوتي الذكي"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline">بحث صوتي</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all flex-shrink-0"
            title="إغلاق (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Categories Bar */}
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-slate-500 text-[11px] font-bold flex items-center gap-1 pl-2">
            <Filter className="w-3 h-3" />
            تصفية:
          </span>

          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === "ALL"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <span>الكل</span>
            {query && <span className="text-[10px] opacity-75">({counts.all})</span>}
          </button>

          <button
            onClick={() => setSelectedCategory("INVOICES")}
            className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === "INVOICES"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>الفواتير والمشتريات</span>
            {query && <span className="text-[10px] opacity-75">({counts.invoices})</span>}
          </button>

          <button
            onClick={() => setSelectedCategory("JOURNALS")}
            className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === "JOURNALS"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-teal-400" />
            <span>القيود المحاسبية</span>
            {query && <span className="text-[10px] opacity-75">({counts.journals})</span>}
          </button>

          <button
            onClick={() => setSelectedCategory("CUSTOMERS")}
            className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === "CUSTOMERS"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>العملاء</span>
            {query && <span className="text-[10px] opacity-75">({counts.customers})</span>}
          </button>

          <button
            onClick={() => setSelectedCategory("VENDORS")}
            className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === "VENDORS"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>الموردين</span>
            {query && <span className="text-[10px] opacity-75">({counts.vendors})</span>}
          </button>

          <button
            onClick={() => setSelectedCategory("ACCOUNTS")}
            className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === "ACCOUNTS"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>الحسابات</span>
            {query && <span className="text-[10px] opacity-75">({counts.accounts})</span>}
          </button>
        </div>

        {/* Results List / Empty State */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[55vh]">
          {query.trim() === "" ? (
            /* Empty State: Recent Searches & Suggested Prompts */
            <div className="p-4 space-y-6">
              {recentSearches.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      عمليات البحث الأخيرة
                    </span>
                    <button
                      onClick={clearAllRecentSearches}
                      className="text-[11px] text-rose-400 hover:underline"
                    >
                      مسح السجل
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setQuery(term);
                          inputRef.current?.focus();
                        }}
                        className="group flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-medium text-slate-300 hover:text-white cursor-pointer transition-all shadow-sm"
                      >
                        <Search className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                        <span>{term}</span>
                        <button
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="text-slate-600 hover:text-rose-400 p-0.5 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Quick Searches */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  اقتراحات بحث سريعة في النظام
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setQuery("INV-2026")}
                    className="p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 rounded-xl text-right flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-bold text-slate-200">فواتير مبيعات 2026</div>
                        <div className="text-[10px] text-slate-500">بحث في أرقام فواتير المبيعات الصادرة</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </button>

                  <button
                    onClick={() => setQuery("BILL-2026")}
                    className="p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 rounded-xl text-right flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-bold text-slate-200">فواتير المشتريات والموردين</div>
                        <div className="text-[10px] text-slate-500">متابعة الاستحقاقات والدائنين</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                  </button>

                  <button
                    onClick={() => setQuery("قيد")}
                    className="p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 rounded-xl text-right flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-bold text-slate-200">القيود المحاسبية اليومية</div>
                        <div className="text-[10px] text-slate-500">عرض القيود والترحيل المالي</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors" />
                  </button>

                  <button
                    onClick={() => setQuery("صندوق")}
                    className="p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 rounded-xl text-right flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-bold text-slate-200">حسابات الصندوق والنقدية</div>
                        <div className="text-[10px] text-slate-500">دليل الحسابات والأرصدة</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            /* No Results Found */
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">لم يتم العثور على نتائج مطابقة</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                لا توجد فواتير أو قيود أو عملاء أو حسابات تطابق "<span className="text-emerald-400 font-bold">{query}</span>".
                يرجى التأكد من كتابة الاسم أو رقم الفاتورة أو القيد بشكل صحيح.
              </p>
            </div>
          ) : (
            /* Results List */
            searchResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-slate-800 border-emerald-500/60 shadow-lg shadow-emerald-500/5 translate-x-1"
                      : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                        item.category === "INVOICES"
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
                          : item.category === "JOURNALS"
                          ? "bg-teal-950/40 text-teal-400 border-teal-800/50"
                          : item.category === "CUSTOMERS"
                          ? "bg-cyan-950/40 text-cyan-400 border-cyan-800/50"
                          : item.category === "VENDORS"
                          ? "bg-blue-950/40 text-blue-400 border-blue-800/50"
                          : "bg-purple-950/40 text-purple-400 border-purple-800/50"
                      }`}
                    >
                      {item.category === "INVOICES" && <FileText className="w-5 h-5" />}
                      {item.category === "JOURNALS" && <Scale className="w-5 h-5" />}
                      {item.category === "CUSTOMERS" && <Users className="w-5 h-5" />}
                      {item.category === "VENDORS" && <Building2 className="w-5 h-5" />}
                      {item.category === "ACCOUNTS" && <BookOpen className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-white truncate">{item.title}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                        {item.status && (
                          <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {item.status}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-300 truncate">{item.subtitle}</div>

                      {item.details && (
                        <div className="text-[11px] text-slate-400 truncate">{item.details}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0 pr-2">
                    {item.amount && (
                      <span className="text-xs sm:text-sm font-mono font-black text-emerald-400">
                        {item.amount}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 group-hover:text-emerald-300">
                      <span>عرض وتفاصيل</span>
                      <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 font-mono">
                ↑↓
              </kbd>
              <span>للتنقل</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 font-mono">
                Enter ↵
              </kbd>
              <span>للفتح والانتقال</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 font-mono">
                Esc
              </kbd>
              <span>للإغلاق</span>
            </span>
          </div>

          <div className="text-[10px] text-slate-500 font-medium">
            بحث ذكي فوري متعدد الكيانات • MeDo ERP Global Search
          </div>
        </div>
      </div>
    </div>
  );
};
