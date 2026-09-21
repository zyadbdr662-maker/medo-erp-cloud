import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Landmark,
  Wallet,
  WalletCards,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Users,
  Building2,
  Sparkles,
  BookOpenCheck,
  BookPlus,
  Receipt,
  ReceiptText,
  FileText,
  FileSpreadsheet,
  FileCheck2,
  Clock,
  Clock3,
  ShieldCheck,
  ShieldAlert,
  Coins,
  CircleDollarSign,
  PieChart as PieChartIcon,
  CheckCircle2,
  AlertCircle,
  Scale,
  CreditCard,
  Layers,
  ArrowRight,
  BadgeDollarSign,
  Banknote,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Percent,
  Wifi,
  WifiOff,
  Radio,
  RefreshCw,
  HardDrive,
  Database,
  FilePlus2,
  PackagePlus,
  Check,
  Boxes,
  Lock,
  Timer,
  Bell,
  Mail,
  AlertTriangle,
  Key,
  Archive,
  ExternalLink,
} from "lucide-react";
import { CentralArchiveSection } from "./CentralArchiveSection";
import {
  Account,
  BankAccountItem,
  CashVaultItem,
  CurrencyCode,
  CurrencyInfo,
  Customer,
  Invoice,
  JournalEntry,
  Vendor,
  Voucher,
} from "../types/erp";
import { convertCurrency, formatMoney, formatNumberOnly } from "../services/erpStorage";
import { LocalSyncEngine } from "../services/localSyncEngine";
import { NavTab } from "./Sidebar";
import { IS_ADMIN_ENV } from "../config/env";

interface DashboardProps {
  accounts: Account[];
  journalEntries: JournalEntry[];
  vouchers: Voucher[];
  customers: Customer[];
  vendors: Vendor[];
  invoices: Invoice[];
  bankAccounts: BankAccountItem[];
  cashVaults: CashVaultItem[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  setActiveTab: (tab: NavTab) => void;
  onOpenQuickAction: (actionType: "JOURNAL" | "RECEIPT" | "PAYMENT" | "INVOICE") => void;
  onOpenAi: () => void;
  onOpenTrialLockModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  accounts,
  journalEntries,
  vouchers,
  customers,
  vendors,
  invoices,
  bankAccounts,
  cashVaults,
  currencies,
  displayCurrency,
  setActiveTab,
  onOpenQuickAction,
  onOpenAi,
  onOpenTrialLockModal,
}) => {
  // Trial Countdown & Warning Notification State (SAP Cloud Trial Architecture)
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number>(() => {
    const saved = localStorage.getItem("medo_trial_sim_days");
    return saved !== null ? parseInt(saved, 10) : 5; // Default to 5 to demonstrate the 5-day warning requirement
  });
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [notificationType, setNotificationType] = useState<"INTERNAL_ALERT" | "EMAIL_ALERT" | "WHATSAPP_ALERT">("INTERNAL_ALERT");

  // Countdown timer clock
  const [timeLeft, setTimeLeft] = useState({
    days: trialDaysRemaining,
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    setTimeLeft((prev) => ({ ...prev, days: trialDaysRemaining }));
    localStorage.setItem("medo_trial_sim_days", trialDaysRemaining.toString());
  }, [trialDaysRemaining]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Local Sync Engine Subscription
  const [syncState, setSyncState] = useState(() => {
    const engine = LocalSyncEngine.getInstance();
    return {
      networkMode: engine.getNetworkMode(),
      pendingCount: engine.getPendingCount(),
      isSyncing: false,
      lastSyncMessage: "",
    };
  });

  useEffect(() => {
    const engine = LocalSyncEngine.getInstance();
    const unsubscribe = engine.subscribe(() => {
      setSyncState((prev) => ({
        ...prev,
        networkMode: engine.getNetworkMode(),
        pendingCount: engine.getPendingCount(),
      }));
    });
    return unsubscribe;
  }, []);

  const handleDirectSync = async () => {
    setSyncState((prev) => ({ ...prev, isSyncing: true, lastSyncMessage: "" }));
    const engine = LocalSyncEngine.getInstance();
    const res = await engine.triggerSync();
    setSyncState((prev) => ({
      ...prev,
      isSyncing: false,
      pendingCount: engine.getPendingCount(),
      lastSyncMessage: res.message,
    }));
  };

  const getCurrencyNameAr = (curr: CurrencyCode) => {
    switch (curr) {
      case "SAR":
        return "ريال سعودي";
      case "USD":
        return "دولار أمريكي";
      case "EUR":
        return "يورو";
      case "YER_ADEN":
        return "ريال يمني (عدن)";
      case "YER_SANAA":
      default:
        return "ريال يمني (صنعاء)";
    }
  };

  // Financial Calculations
  const assetAccounts = accounts.filter((a) => a.category === "ASSET" && !a.isHeader);
  const liabilityAccounts = accounts.filter((a) => a.category === "LIABILITY" && !a.isHeader);
  const revenueAccounts = accounts.filter((a) => a.category === "REVENUE" && !a.isHeader);
  const expenseAccounts = accounts.filter((a) => a.category === "EXPENSE" && !a.isHeader);

  // Totals in YER_SANAA as reference base, then convert to displayCurrency
  const totalAssets = assetAccounts.reduce((sum, a) => {
    const amountInBase = a.currency !== "MULTI" && a.currency !== "YER_SANAA"
      ? convertCurrency(a.currentBalance, a.currency, "YER_SANAA", currencies)
      : a.currentBalance;
    return sum + amountInBase;
  }, 0);

  const totalLiabilities = liabilityAccounts.reduce((sum, a) => {
    const amountInBase = a.currency !== "MULTI" && a.currency !== "YER_SANAA"
      ? convertCurrency(a.currentBalance, a.currency, "YER_SANAA", currencies)
      : a.currentBalance;
    return sum + amountInBase;
  }, 0);

  const totalRevenue = revenueAccounts.reduce((sum, a) => {
    const amountInBase = a.currency !== "MULTI" && a.currency !== "YER_SANAA"
      ? convertCurrency(a.currentBalance, a.currency, "YER_SANAA", currencies)
      : a.currentBalance;
    return sum + amountInBase;
  }, 0);

  const totalExpenses = expenseAccounts.reduce((sum, a) => {
    const amountInBase = a.currency !== "MULTI" && a.currency !== "YER_SANAA"
      ? convertCurrency(a.currentBalance, a.currency, "YER_SANAA", currencies)
      : a.currentBalance;
    return sum + amountInBase;
  }, 0);

  const netProfit = totalRevenue - totalExpenses;

  // Cash & Bank Liquidity
  const totalVaults = cashVaults.reduce((sum, v) => {
    return sum + convertCurrency(v.currentBalance, v.currency, "YER_SANAA", currencies);
  }, 0);

  const totalBanks = bankAccounts.reduce((sum, b) => {
    return sum + convertCurrency(b.currentBalance, b.currency, "YER_SANAA", currencies);
  }, 0);

  const totalLiquidity = totalVaults + totalBanks;

  // Receivables & Payables
  const totalReceivables = customers.reduce((sum, c) => {
    return sum + convertCurrency(c.currentBalance, c.currency, "YER_SANAA", currencies);
  }, 0);

  const totalPayables = vendors.reduce((sum, v) => {
    return sum + convertCurrency(v.currentBalance, v.currency, "YER_SANAA", currencies);
  }, 0);

  // Converted to User Selected Currency for Display
  const displayTotalAssets = convertCurrency(totalAssets, "YER_SANAA", displayCurrency, currencies);
  const displayTotalLiabilities = convertCurrency(totalLiabilities, "YER_SANAA", displayCurrency, currencies);
  const displayRevenue = convertCurrency(totalRevenue, "YER_SANAA", displayCurrency, currencies);
  const displayExpenses = convertCurrency(totalExpenses, "YER_SANAA", displayCurrency, currencies);
  const displayNetProfit = convertCurrency(netProfit, "YER_SANAA", displayCurrency, currencies);
  const displayLiquidity = convertCurrency(totalLiquidity, "YER_SANAA", displayCurrency, currencies);
  const displayReceivables = convertCurrency(totalReceivables, "YER_SANAA", displayCurrency, currencies);
  const displayPayables = convertCurrency(totalPayables, "YER_SANAA", displayCurrency, currencies);

  // Currency symbol
  const currSymbol = displayCurrency === "SAR" ? "ر.س" : displayCurrency === "USD" ? "$" : "ر.ي";

  // Recent 5 Journal Entries
  const recentEntries = [...journalEntries].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);

  // Pending Approvals
  const pendingApprovals = journalEntries.filter((j) => j.status === "DRAFT");

  return (
    <div className="space-y-6 pb-12 animate-in fade-in" style={{ fontFamily: "'Noto Naskh Arabic', 'Amiri', 'Droid Arabic Naskh', 'Traditional Arabic', sans-serif" }}>
      {/* 0. SAP Cloud Trial Countdown & Warning Notification Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
              trialDaysRemaining <= 5 
                ? "bg-amber-500/20 text-sap-secondary border-amber-500/40 animate-pulse" 
                : "bg-sap-primary/25 text-emerald-400 border-sap-primary/50"
            }`}>
              {trialDaysRemaining <= 5 ? <AlertTriangle className="w-6 h-6 text-sap-secondary" /> : <Timer className="w-6 h-6 text-sap-secondary" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-white">
                  النسخة التجريبية السحابية (SAP Cloud Trial)
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sap-primary/30 text-sap-secondary border border-sap-secondary/40 font-bold">
                  مستخدمين غير محدودين
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                فترة تجريبية 30 يوماً مع عزل تام للبيانات وقاعدة بيانات هجينة مشفرة
              </p>
            </div>
          </div>

          {/* Countdown Clock Displays */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-2xl">
              <div className="text-center min-w-[36px]">
                <div className={`text-base sm:text-lg font-black font-mono leading-none ${
                  trialDaysRemaining <= 5 ? "text-amber-400" : "text-sap-secondary"
                }`}>
                  {String(timeLeft.days).padStart(2, "0")}
                </div>
                <div className="text-[9px] text-slate-400 font-bold mt-1">يوم</div>
              </div>
              <span className="text-slate-600 font-bold">:</span>
              <div className="text-center min-w-[36px]">
                <div className="text-base sm:text-lg font-black font-mono text-white leading-none">
                  {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <div className="text-[9px] text-slate-400 font-bold mt-1">ساعة</div>
              </div>
              <span className="text-slate-600 font-bold">:</span>
              <div className="text-center min-w-[36px]">
                <div className="text-base sm:text-lg font-black font-mono text-white leading-none">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <div className="text-[9px] text-slate-400 font-bold mt-1">دقيقة</div>
              </div>
              <span className="text-slate-600 font-bold">:</span>
              <div className="text-center min-w-[36px]">
                <div className="text-base sm:text-lg font-black font-mono text-emerald-400 leading-none">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </div>
                <div className="text-[9px] text-slate-400 font-bold mt-1">ثانية</div>
              </div>
            </div>

            {/* Upgrade & License CTAs */}
            <button
              onClick={() => onOpenTrialLockModal ? onOpenTrialLockModal() : setActiveTab("EXECUTIVE_MASTER_SUITE")}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-sap-primary hover:bg-[#14532D] border border-sap-secondary/60 text-sap-secondary font-bold text-xs shadow-lg shadow-sap-primary/30 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Key className="w-4 h-4 text-sap-secondary" />
              <span>تفعيل الترخيص الدائم</span>
            </button>
          </div>
        </div>

        {/* 5-Day Expiration Warning Box (Shown when trialDaysRemaining <= 5) */}
        {trialDaysRemaining <= 5 && (
          <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-950 border border-amber-500/40 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
                <Bell className="w-5 h-5 text-amber-400 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-300 text-sm">
                    ⚠️ إشعار اقتراب انتهاء النسخة التجريبية ({trialDaysRemaining} {trialDaysRemaining === 1 ? 'يوم متبقي' : 'أيام متبقية'})
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                    إشعار قبل 5 أيام
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  عزيزنا العميل في مجموعة بن زياد، نود تذكيركم بأنه متبقي <strong>{trialDaysRemaining} أيام</strong> على انتهاء الفترة التجريبية لنظام MeDo ERP. يرجى تفعيل الترخيص أو التواصل مع الدعم لتفادي توقف المزامنة السحابية.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
              <button
                onClick={() => setShowNotificationModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                title="معاينة نموذج الإشعار الداخلي والبريد الإلكتروني"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>معاينة إشعار التجربة</span>
              </button>
              <a
                href="https://wa.me/967773586047?text=السلام%20عليكم%20أرغب%20بتجديد%20وترخيص%20نظام%20MeDo%20ERP"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700/60 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
              >
                <span>طلب التجديد الفوري</span>
              </a>
            </div>
          </div>
        )}

        {/* Trial Days Progress Bar and Simulation Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs text-slate-400">
          <div className="w-full sm:w-1/2 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span>معدل استهلاك فترة التجربة (30 يوماً)</span>
              <span className="font-bold text-white">مستهلك {30 - trialDaysRemaining} من 30 يوماً</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  trialDaysRemaining <= 5 ? "bg-amber-500" : "bg-sap-primary"
                }`}
                style={{ width: `${Math.min(100, Math.max(5, ((30 - trialDaysRemaining) / 30) * 100))}%` }}
              ></div>
            </div>
          </div>

          {/* Testing simulation pills */}
          <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 p-1 rounded-xl">
            <span className="text-[10px] text-slate-500 font-bold px-1.5">اختبار المحاكاة:</span>
            <button
              onClick={() => setTrialDaysRemaining(25)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                trialDaysRemaining === 25 ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              25 يوم
            </button>
            <button
              onClick={() => setTrialDaysRemaining(5)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                trialDaysRemaining === 5 ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              5 أيام ⚠️
            </button>
            <button
              onClick={() => setTrialDaysRemaining(1)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                trialDaysRemaining === 1 ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              1 يوم 🚨
            </button>
            <button
              onClick={() => {
                if (onOpenTrialLockModal) onOpenTrialLockModal();
              }}
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              قفل النسخة 🔒
            </button>
          </div>
        </div>
      </div>

      {/* Trial Notification Preview Modal (Email & Internal Alert Simulation) */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-right animate-scaleUp" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-sap-secondary border border-amber-500/30 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5 text-sap-secondary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    نموذج إشعار اقتراب انتهاء الفترة التجريبية (Trial Expiration Notice)
                  </h3>
                  <p className="text-xs text-slate-400">
                    يتم إرساله آلياً للمستخدم قبل 5 أيام من الإيقاف بنمط SAP Cloud
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Notification Type Selector */}
            <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setNotificationType("INTERNAL_ALERT")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  notificationType === "INTERNAL_ALERT" ? "bg-sap-primary text-sap-secondary shadow" : "text-slate-400"
                }`}
              >
                رسالة داخلية (System Alert)
              </button>
              <button
                onClick={() => setNotificationType("EMAIL_ALERT")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  notificationType === "EMAIL_ALERT" ? "bg-sap-primary text-sap-secondary shadow" : "text-slate-400"
                }`}
              >
                بريد إلكتروني (Email Notice)
              </button>
              <button
                onClick={() => setNotificationType("WHATSAPP_ALERT")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  notificationType === "WHATSAPP_ALERT" ? "bg-sap-primary text-sap-secondary shadow" : "text-slate-400"
                }`}
              >
                واتساب (WhatsApp Alert)
              </button>
            </div>

            {/* Preview Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              {notificationType === "EMAIL_ALERT" && (
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="pb-2 border-b border-slate-800 text-slate-400 flex justify-between">
                    <span><strong>إلى:</strong> zyadbdr925@gmail.com</span>
                    <span><strong>الموضوع:</strong> [MeDo ERP] تنبيه: متبقي 5 أيام على انتهاء نسختكم التجريبية</span>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-slate-200">
                    <p className="font-bold text-amber-400">عزيزنا الأخ / بدر عايض محمد (مدير النظام - مجموعة بن زياد):</p>
                    <p>نحيطكم علماً بأنه متبقي <strong>5 أيام</strong> فقط على انتهاء الفترة التجريبية المجانية (30 يوماً) لنظام MeDo ERP المؤسسي.</p>
                    <p className="text-slate-300">للحفاظ على استمرارية العمليات المحاسبية، الفوترة الإلكترونية، والمزامنة السحابية غير المنقطعة، يرجى تفعيل مفتاح الترخيص الدائم.</p>
                    <div className="p-3 bg-sap-primary/20 border border-sap-secondary/30 rounded-lg text-sap-secondary text-center font-bold">
                      رابط التفعيل الفوري: https://app.medo-erp.com/activate?ref=binziyad
                    </div>
                  </div>
                </div>
              )}

              {notificationType === "INTERNAL_ALERT" && (
                <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Bell className="w-4 h-4" />
                    <span>تنبيه نظام فوري (In-App Notification)</span>
                  </div>
                  <p className="text-slate-200">
                    تنبيه: ستنتهي صلاحية النسخة التجريبية خلال 5 أيام (بتاريخ 14 سبتمبر 2026). يرجى التوجه لتبويب <strong>لوحة تحكم الإدارة والتراخيص</strong> لتوليد وتفعيل الترخيص الدائم.
                  </p>
                </div>
              )}

              {notificationType === "WHATSAPP_ALERT" && (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-2 text-xs text-slate-200">
                  <div className="font-bold text-emerald-400">رسالة WhatsApp الرسمية من MeDo Cloud:</div>
                  <p>
                    مرحباً بكم أخي بدر، نود إشعاركم بأن فترة تجربة MeDo ERP المخصصة لمجموعة بن زياد التجارية متبقي عليها 5 أيام. لتجديد الاشتراك أو التفعيل السنوي تواصلوا معنا مباشرة.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Offline-First Master Container matching User's exact ASCII wireframe */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-4 sm:p-5 backdrop-blur">
        {/* Header line: 📶 وضع غير متصل (Offline Mode) | 🔄 مزامنة (X) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border transition-all ${
                syncState.networkMode === "OFFLINE"
                  ? "bg-rose-950/60 text-rose-400 border-rose-800/60 shadow-lg shadow-rose-950/40"
                  : syncState.networkMode === "FLAKY"
                  ? "bg-amber-950/60 text-amber-400 border-amber-800/60 shadow-lg shadow-amber-950/40"
                  : "bg-emerald-950/60 text-emerald-400 border-emerald-800/60 shadow-lg shadow-emerald-950/40"
              }`}
            >
              {syncState.networkMode === "OFFLINE" ? (
                <WifiOff className="w-5 h-5 animate-pulse" />
              ) : syncState.networkMode === "FLAKY" ? (
                <Radio className="w-5 h-5 animate-pulse" />
              ) : (
                <Wifi className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-sm font-black flex items-center gap-2">
                <span
                  className={
                    syncState.networkMode === "OFFLINE"
                      ? "text-rose-400"
                      : syncState.networkMode === "FLAKY"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }
                >
                  {syncState.networkMode === "OFFLINE"
                    ? "📶 وضع غير متصل (Offline Mode)"
                    : syncState.networkMode === "FLAKY"
                    ? "⚡ شبكة متقطعة / ضعيفة (Flaky Network)"
                    : "🌐 متصل بالسحابة (Online Mode)"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400 font-mono">
                  Local-First Hybrid
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {syncState.networkMode === "OFFLINE"
                  ? "يتم حفظ كافة القيود والفواتير والمخزون في قاعدة البيانات المحلية المشفرة فوراً."
                  : "الاتصال مستقر مع إمكانية المزامنة اللحظية ثنائية الاتجاه مع الخوادم المركزية."}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {IS_ADMIN_ENV && (
              <button
                onClick={() => setActiveTab("CLOUD_SYNC")}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                title="فتح مركز المزامنة وإدارة قاعدة البيانات المحلية"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${syncState.isSyncing ? "animate-spin" : ""}`} />
                <span>مزامنة ({syncState.pendingCount})</span>
              </button>
            )}

            {/* Quick Network Mode Simulation Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-[11px]">
              <button
                onClick={() => LocalSyncEngine.getInstance().setNetworkMode("ONLINE")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  syncState.networkMode === "ONLINE"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                متصل
              </button>
              <button
                onClick={() => LocalSyncEngine.getInstance().setNetworkMode("OFFLINE")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  syncState.networkMode === "OFFLINE"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                غير متصل
              </button>
            </div>
          </div>
        </div>

        {/* 📚 MeDo ERP Interactive Guides & Central Archival Protocol */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-500/40 p-4 flex flex-col justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
                📘
              </div>
              <div className="text-right">
                <h4 className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                  <span>دليل الاستخدام المحاسبي</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold">20 وحدة</span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  شرح تفصيلي خطوة بخطوة لكافة الوحدات المحاسبية مع القيود النموذجية.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("USER_MANUAL")}
              className="w-full px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-center"
            >
              فتح دليل الاستخدام 👈
            </button>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-[#0A2540] border border-purple-500/40 p-4 flex flex-col justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold shrink-0">
                📋
              </div>
              <div className="text-right">
                <h4 className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                  <span>وثيقة التسليم الفني والأرشيف</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-extrabold">رسمي</span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  محضر تسليم البيئة، مستودع GitHub، الروابط السحابية، ومصفوفة الصلاحيات.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                // Scroll smoothly to central archive section
                const el = document.querySelector("#central-archive-anchor");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="w-full px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-center"
            >
              عرض وثيقة التسليم والأرشيف 👈
            </button>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-[#0A2540] border border-sap-secondary/35 p-4 flex flex-col justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sap-secondary/20 text-sap-secondary border border-sap-secondary/30 flex items-center justify-center font-bold shrink-0">
                📖
              </div>
              <div className="text-right">
                <h4 className="text-xs font-black text-[#D4AF37] flex items-center gap-1.5">
                  <span>الكتيب الفني الشامل</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-sap-secondary border border-sap-secondary/30 font-extrabold animate-pulse">S/4HANA</span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  استعرض مواصفات النظام، معايير التكامل، ومحاكاة الذكاء المالي المتقدم والمزامنة.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("MEDO_BROCHURE")}
              className="w-full px-3 py-1.5 bg-sap-secondary hover:bg-[#c29f2e] text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-center"
            >
              تصفح الكتيب 👈
            </button>
          </div>
        </div>

        {/* 4 Primary KPI Cards matching exact ASCII wireframe */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 my-4">
          {/* 1. إجمالي الأصول */}
          <div className="bg-[#0A2540] border border-slate-800/80 hover:border-sap-secondary/80 rounded-2xl p-4 shadow-md transition-all group flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">💰 إجمالي الأصول</span>
              <span className="text-[10px] text-slate-500 font-mono">ASSETS</span>
            </div>
            <div className="my-2.5">
              <div className="text-2xl font-black text-slate-100 tracking-tight font-mono">
                {formatNumberOnly(displayTotalAssets)}
              </div>
              <div className="text-xs font-bold text-sap-secondary mt-0.5">
                {getCurrencyNameAr(displayCurrency)}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800/60 flex items-center justify-between">
              <span>محفوظة محلياً</span>
              <span className="text-emerald-400 font-bold">100% متوازن</span>
            </div>
          </div>

          {/* 2. السيولة */}
          <div className="bg-[#0A2540] border border-slate-800/80 hover:border-emerald-500/80 rounded-2xl p-4 shadow-md transition-all group flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">💵 السيولة</span>
              <span className="text-[10px] text-slate-500 font-mono">LIQUIDITY</span>
            </div>
            <div className="my-2.5">
              <div className="text-2xl font-black text-emerald-400 tracking-tight font-mono">
                {formatNumberOnly(displayLiquidity)}
              </div>
              <div className="text-xs font-bold text-emerald-300 mt-0.5">
                {getCurrencyNameAr(displayCurrency)}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800/60 flex items-center justify-between font-mono">
              <span>خزائن: {formatNumberOnly(convertCurrency(totalVaults, "YER_SANAA", displayCurrency, currencies))}</span>
              <span>بنوك: {formatNumberOnly(convertCurrency(totalBanks, "YER_SANAA", displayCurrency, currencies))}</span>
            </div>
          </div>

          {/* 3. الإيرادات */}
          <div className="bg-[#0A2540] border border-slate-800/80 hover:border-teal-500/80 rounded-2xl p-4 shadow-md transition-all group flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">📈 الإيرادات</span>
              <span className="text-[10px] text-slate-500 font-mono">REVENUES</span>
            </div>
            <div className="my-2.5">
              <div className="text-2xl font-black text-teal-300 tracking-tight font-mono">
                {formatNumberOnly(displayRevenue)}
              </div>
              <div className="text-xs font-bold text-teal-300 mt-0.5">
                {getCurrencyNameAr(displayCurrency)}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-teal-400 font-bold">+14.8% نمو المبيعات</span>
              <span>مباشر</span>
            </div>
          </div>

          {/* 4. المصروفات */}
          <div className="bg-[#0A2540] border border-slate-800/80 hover:border-rose-500/80 rounded-2xl p-4 shadow-md transition-all group flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">📉 المصروفات</span>
              <span className="text-[10px] text-slate-500 font-mono">EXPENSES</span>
            </div>
            <div className="my-2.5">
              <div className="text-2xl font-black text-rose-400 tracking-tight font-mono">
                {formatNumberOnly(displayExpenses)}
              </div>
              <div className="text-xs font-bold text-rose-300 mt-0.5">
                {getCurrencyNameAr(displayCurrency)}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-rose-400 font-bold">-3.2% انضباط تشغيلي</span>
              <span>مضبوطة</span>
            </div>
          </div>
        </div>

        {/* ⚡ العمليات السريعة (بدون اتصال) */}
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-3.5 mb-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">⚡ العمليات السريعة</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                تعمل فوراً دون إنترنت
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              تسجيل القيود والفواتير والحركات في الذاكرة المحلية
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => onOpenQuickAction("INVOICE")}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 hover:text-white border border-purple-800/50 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <FilePlus2 className="w-4 h-4 text-purple-400" />
              <span>[+ فاتورة جديدة]</span>
            </button>

            <button
              onClick={() => onOpenQuickAction("JOURNAL")}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 hover:text-white border border-emerald-800/50 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <BookPlus className="w-4 h-4 text-emerald-400" />
              <span>[+ قيد يومية]</span>
            </button>

            <button
              onClick={() => setActiveTab("INVENTORY")}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-blue-200 hover:text-white border border-blue-800/50 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <PackagePlus className="w-4 h-4 text-blue-400" />
              <span>[+ حركة مخزون]</span>
            </button>

            <button
              onClick={() => onOpenQuickAction("PAYMENT")}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 hover:text-white border border-amber-800/50 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <ReceiptText className="w-4 h-4 text-amber-400" />
              <span>[+ سند صرف]</span>
            </button>
          </div>
        </div>

        {/* 🔄 المزامنة مع السحابة */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-[#0A2540] border border-indigo-800/40 p-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-900/60 border border-indigo-700/60 flex items-center justify-center text-indigo-300 flex-shrink-0">
                <RefreshCw className={`w-5 h-5 ${syncState.isSyncing ? "animate-spin text-indigo-200" : ""}`} />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-2">
                  <span>🔄 المزامنة مع السحابة</span>
                  {syncState.pendingCount > 0 ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold font-mono animate-pulse">
                      معاملات معلقة
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> متزامن بالكامل
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  📤 <span className="font-bold text-white font-mono">{syncState.pendingCount}</span> معاملات جديدة في انتظار المزامنة
                  {syncState.lastSyncMessage && (
                    <span className="text-emerald-400 text-[11px] mr-2">({syncState.lastSyncMessage})</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDirectSync}
                disabled={syncState.isSyncing}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncState.isSyncing ? "animate-spin" : ""}`} />
                <span>{syncState.isSyncing ? "جاري المزامنة..." : "[بدء المزامنة الآن]"}</span>
              </button>

              {IS_ADMIN_ENV && (
                <button
                  onClick={() => setActiveTab("CLOUD_SYNC")}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  title="عرض تفاصيل سجل التعارضات وقاعدة البيانات"
                >
                  مركز المزامنة
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Banner: MeDo AI Financial Advisor Insight */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0A2540] via-[#0B2A4A] to-[#071829] border border-slate-800/50 p-5 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sap-secondary via-amber-500 to-amber-200 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 flex-shrink-0">
              <Sparkles className="w-6 h-6 text-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">رؤية المستشار المالي والرقابي MeDo AI</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950/80 text-sap-secondary border border-sap-secondary/40 font-bold">
                  تحليل لحظي IFRS
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                السيولة النقدية والمصرفية ممتازة وتغطي التزامات الـ 90 يوماً القادمة بنسبة{" "}
                <span className="text-sap-secondary font-bold">2.4x</span>. هامش صافي الربح التشغيلي يبلغ{" "}
                <span className="text-emerald-400 font-bold">{totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0"}%</span>.
                ميزان المراجعة متوازن والعمليات اليومية مطابقة لمعايير الحوكمة المالية الدولية.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-center">
            <button
              onClick={onOpenAi}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sap-secondary to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20 active:scale-95 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>لوحة المستشار المالي الذكي</span>
            </button>
            <button
              onClick={() => setActiveTab("FINANCIAL_REPORTS")}
              className="px-3.5 py-2.5 rounded-xl bg-[#071829] hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700/60 transition-colors whitespace-nowrap cursor-pointer"
            >
              القوائم المالية IFRS
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-sap-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. المنظومة المحاسبية والإدارية المتكاملة (S/4HANA Enterprise Suite) Prominent Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#111827] via-[#0E2038] to-[#111827] border-2 border-sap-secondary/50 p-5 shadow-2xl transition-all hover:border-sap-secondary group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-teal-600 to-sap-secondary flex items-center justify-center text-white shadow-xl shadow-indigo-950/50 flex-shrink-0 border border-sap-secondary/30 group-hover:scale-105 transition-transform duration-300">
              <Boxes className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>المنظومة المحاسبية والإدارية المتكاملة</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-extrabold animate-pulse">
                    متاحة ومكتملة
                  </span>
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/40 font-mono font-black">
                  S/4HANA Enterprise Suite
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
                وحدة السيطرة المحاسبية والتحكم المركزي المكتملة. تشمل الدورة المستندية الكاملة (مبيعات ومشتريات ومخازن مع توليد القيود التلقائية المترابطة)، لوحة تحكم الرقابة الإدارية، واختبار كفاءة دورة الترحيل المحاسبي إلى دفتر الأستاذ العام والقوائم المالية الختامية المطابقة لمعايير التقارير الدولية IFRS.
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> الدورة المستندية متكاملة 100%</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-sap-secondary" /> مطابقة لمعايير IFRS المحاسبية</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> ترحيل آلي لحظي ومقاومة الأخطاء</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 self-end md:self-center">
            <button
              onClick={() => setActiveTab("INTEGRATED_ERP")}
              className="w-full md:w-auto px-5 py-3 rounded-2xl bg-sap-secondary hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-sap-secondary/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>فتح المنظومة المتكاملة ومحاكي العمليات</span>
              <ArrowLeftRight className="w-4 h-4 text-slate-950 transition-transform group-hover:translate-x-[-2px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards Grid (Deep Blue & Gold Identity - Total Assets, Liquidity, Revenues, Expenses) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Assets (إجمالي الأصول) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
          className="bg-[#0a2540] border-none rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-bold text-white">إجمالي الأصول</span>
            <div className="bg-white/10 p-2 rounded-full">
              <Landmark className="w-12 h-12 text-[#d4af37]" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{formatNumberOnly(displayTotalAssets)}</div>
          <div className="text-lg font-bold text-white/80 mt-1">{getCurrencyNameAr(displayCurrency)}</div>
        </motion.div>

        {/* 2. Liquidity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-[#0066CC] border-none rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-bold text-white">السيولة النقدية</span>
            <div className="bg-white/10 p-2 rounded-full">
              <Wallet className="w-12 h-12 text-[#d4af37]" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{formatNumberOnly(displayLiquidity)}</div>
          <div className="text-lg font-bold text-white/80 mt-1">{getCurrencyNameAr(displayCurrency)}</div>
        </motion.div>

        {/* 3. Total Revenues (الإيرادات) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-[#1e7e34] border-none rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-bold text-white">إجمالي الإيرادات</span>
            <div className="bg-white/10 p-2 rounded-full">
              <ArrowUpCircle className="w-12 h-12 text-[#d4af37]" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{formatNumberOnly(displayRevenue)}</div>
          <div className="text-lg font-bold text-white/80 mt-1">{getCurrencyNameAr(displayCurrency)}</div>
        </motion.div>

        {/* 4. Total Expenses (المصروفات) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-[#8b0000] border-none rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-bold text-white">إجمالي المصروفات</span>
            <div className="bg-white/10 p-2 rounded-full">
              <ArrowDownCircle className="w-12 h-12 text-[#d4af37]" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{formatNumberOnly(displayExpenses)}</div>
          <div className="text-lg font-bold text-white/80 mt-1">{getCurrencyNameAr(displayCurrency)}</div>
        </motion.div>
      </div>

      {/* Secondary Strategic Row: Net Profit & AR/AP Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Net Profit (صافي الربح) */}
        <div className="bg-gradient-to-br from-[#0A2540] via-[#0B2E52] to-[#071829] border border-slate-800/50 hover:border-sap-secondary/60 rounded-3xl p-4.5 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sap-secondary/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-sap-secondary">صافي الربح التشغيلي (Net Profit P&L)</span>
            <div className="w-10 h-10 rounded-2xl bg-sap-secondary/20 text-sap-secondary border border-sap-secondary/40 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <BadgeDollarSign className="w-5 h-5 text-sap-secondary" />
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-black tracking-tight font-mono ${displayNetProfit >= 0 ? "text-sap-secondary" : "text-rose-400"}`}>
              {formatMoney(displayNetProfit, displayCurrency, currencies)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50 text-[11px] text-slate-300 font-mono">
              <span>هامش الربحية: {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0"}%</span>
              <span className="text-sap-secondary font-bold">الفارق التشغيلي</span>
            </div>
          </div>
        </div>

        {/* Accounts Receivable vs Payable (الذمم المدينة والدائنة) */}
        <div className="bg-[#2980b9] border-none rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-bold text-white">الذمم المدينة والدائنة</span>
            <div className="bg-white/10 p-2 rounded-full">
              <Scale className="w-12 h-12 text-[#d4af37]" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono flex gap-4">
            <span className="text-emerald-300">+{formatNumberOnly(displayReceivables)}</span>
            <span className="text-white/50">/</span>
            <span className="text-amber-300">-{formatNumberOnly(displayPayables)}</span>
          </div>
          <div className="text-lg font-bold text-white/80 mt-1">{getCurrencyNameAr(displayCurrency)}</div>
        </div>
      </div>

      {/* Operational Modules & Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Quick Action Center & Bank Balances */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Action Dock */}
          <div className="bg-[#0A2540] border border-slate-800/50 rounded-3xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-sap-secondary" />
                <span>العمليات المحاسبية السريعة</span>
              </h3>
              <span className="text-xs text-slate-400">اختصارات المعاملات والقيود</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => onOpenQuickAction("JOURNAL")}
                className="p-3.5 rounded-2xl bg-[#071829] hover:bg-slate-800 border border-slate-800/50 hover:border-sap-secondary/60 text-right transition-all group active:scale-95 cursor-pointer shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-sap-secondary/10 text-sap-secondary border border-sap-secondary/20 flex items-center justify-center mb-2.5 group-hover:bg-sap-secondary group-hover:text-slate-950 transition-colors">
                  <BookPlus className="w-4.5 h-4.5" />
                </div>
                <div className="text-xs font-bold text-slate-200">قيد يومية جديد</div>
                <div className="text-[10px] text-slate-400 mt-0.5">مدين / دائن متوازن</div>
              </button>

              <button
                onClick={() => onOpenQuickAction("RECEIPT")}
                className="p-3.5 rounded-2xl bg-[#071829] hover:bg-slate-800 border border-slate-800/50 hover:border-emerald-500/60 text-right transition-all group active:scale-95 cursor-pointer shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-2.5 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <ArrowDownLeft className="w-4.5 h-4.5" />
                </div>
                <div className="text-xs font-bold text-slate-200">سند قبض مالي</div>
                <div className="text-[10px] text-slate-400 mt-0.5">نقد / بنك / شيك</div>
              </button>

              <button
                onClick={() => onOpenQuickAction("PAYMENT")}
                className="p-3.5 rounded-2xl bg-[#071829] hover:bg-slate-800 border border-slate-800/50 hover:border-rose-500/60 text-right transition-all group active:scale-95 cursor-pointer shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-2.5 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-4.5 h-4.5" />
                </div>
                <div className="text-xs font-bold text-slate-200">سند صرف مالي</div>
                <div className="text-[10px] text-slate-400 mt-0.5">رواتب / موردين / مصروف</div>
              </button>

              <button
                onClick={() => onOpenQuickAction("INVOICE")}
                className="p-3.5 rounded-2xl bg-[#071829] hover:bg-slate-800 border border-slate-800/50 hover:border-blue-500/60 text-right transition-all group active:scale-95 cursor-pointer shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-2.5 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <ReceiptText className="w-4.5 h-4.5" />
                </div>
                <div className="text-xs font-bold text-slate-200">فاتورة مبيعات</div>
                <div className="text-[10px] text-slate-400 mt-0.5">مع رمز استجابة QR</div>
              </button>
            </div>
          </div>

          {/* Cash Vaults & Bank Accounts Live Overview */}
          <div className="bg-[#0A2540] border border-slate-800/50 rounded-3xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-sap-secondary" />
                <span>حسابات البنوك والخزائن النقدية</span>
              </h3>
              <button
                onClick={() => setActiveTab("CASH_AND_BANK")}
                className="text-xs text-sap-secondary hover:text-amber-300 font-bold cursor-pointer"
              >
                إدارة السيولة والتسويات &larr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Banks */}
              {bankAccounts.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-2xl bg-[#071829] border border-slate-800/50 hover:border-blue-500/40 flex items-center justify-between transition-colors shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-300 border border-blue-800/80 flex items-center justify-center font-bold text-xs">
                      {b.currency === "USD" ? "$" : b.currency === "SAR" ? "ر.س" : "ر.ي"}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 truncate max-w-[150px]">{b.bankName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{b.accountNumber}</div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-slate-100 font-mono">
                      {formatMoney(b.currentBalance, b.currency, currencies)}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-medium">نشط ومطابق</div>
                  </div>
                </div>
              ))}

              {/* Cash Vaults */}
              {cashVaults.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-2xl bg-[#071829] border border-slate-800/50 hover:border-emerald-500/40 flex items-center justify-between transition-colors shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800/80 flex items-center justify-center font-bold text-xs">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 truncate max-w-[150px]">{v.name}</div>
                      <div className="text-[10px] text-slate-400">{v.custodian}</div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-emerald-400 font-mono">
                      {formatMoney(v.currentBalance, v.currency, currencies)}
                    </div>
                    <div className="text-[10px] text-slate-400">أمين الصندوق</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Journal Entries Table */}
          <div className="bg-[#0A2540] border border-slate-800/50 rounded-3xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-sap-secondary" />
                <span>أحدث قيود اليومية العامة (GL Stream)</span>
              </h3>
              <button
                onClick={() => setActiveTab("JOURNAL_ENTRIES")}
                className="text-xs text-sap-secondary hover:text-amber-300 font-bold cursor-pointer"
              >
                عرض كافة القيود &larr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800/50 bg-[#071829]">
                    <th className="py-2.5 px-3 rounded-r-xl font-semibold">رقم القيد</th>
                    <th className="py-2.5 px-3 font-semibold">التاريخ</th>
                    <th className="py-2.5 px-3 font-semibold">البيان / الوصف</th>
                    <th className="py-2.5 px-3 font-semibold text-left">إجمالي المبلغ</th>
                    <th className="py-2.5 px-3 rounded-l-xl font-semibold text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {recentEntries.map((je) => (
                    <tr key={je.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-sap-secondary">{je.entryNumber}</td>
                      <td className="py-3 px-3 text-slate-300">{je.date}</td>
                      <td className="py-3 px-3 text-slate-200 font-medium max-w-xs truncate">{je.description}</td>
                      <td className="py-3 px-3 text-left font-mono font-bold text-slate-100">
                        {formatMoney(je.totalDebit, je.currency, currencies)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                            je.status === "POSTED"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : je.status === "APPROVED"
                              ? "bg-blue-950 text-blue-400 border border-blue-800"
                              : "bg-amber-950 text-amber-400 border border-amber-800"
                          }`}
                        >
                          {je.status === "POSTED" ? "مرحل" : je.status === "APPROVED" ? "معتمد" : "مسودة"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Multi-Currency Matrix & Pending Approvals */}
        <div className="space-y-6">
          {/* Multi-Currency & Yemen Exposure Monitor */}
          <div className="bg-[#0A2540] border border-slate-800/50 rounded-3xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Coins className="w-4 h-4 text-sap-secondary" />
                <span>مصفوفة العملات والمخاطر</span>
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#071829] text-sap-secondary border border-sap-secondary/30 font-bold font-mono">
                صنعاء / عدن / دولي
              </span>
            </div>

            <div className="space-y-3">
              {currencies.map((c) => {
                // Calculate total assets in this specific currency
                const matchingVaults = cashVaults
                  .filter((v) => v.currency === c.code)
                  .reduce((sum, v) => sum + v.currentBalance, 0);
                const matchingBanks = bankAccounts
                  .filter((b) => b.currency === c.code)
                  .reduce((sum, b) => sum + b.currentBalance, 0);
                const totalInCurrency = matchingVaults + matchingBanks;

                return (
                  <div
                    key={c.code}
                    className="p-3 rounded-2xl bg-[#071829] border border-slate-800/50 hover:border-sap-secondary/40 transition-colors shadow-md"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-200">{c.name}</span>
                      <span className="text-xs font-mono font-bold text-sap-secondary">
                        {formatMoney(totalInCurrency, c.code, currencies)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>سعر الصرف للدولار:</span>
                      <span className="font-mono text-slate-300">
                        {c.code === "USD" ? "1.00 $" : `${c.exchangeRateToUSD} ${c.symbol}/$`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setActiveTab("CURRENCY_SETTINGS")}
              className="w-full mt-4 py-2.5 text-center text-xs font-bold text-sap-secondary hover:text-amber-300 bg-[#071829] hover:bg-slate-800 rounded-xl border border-slate-800/50 transition-all cursor-pointer shadow-md"
            >
              تعديل أسعار الصرف وإعادة التقييم (FAGL_FC_VAL)
            </button>
          </div>

          {/* Pending Approvals & Audit Queue */}
          <div className="bg-[#0A2540] border border-slate-800/50 rounded-3xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-amber-400" />
                <span>طابور الاعتماد والتدقيق</span>
              </h3>
              <span className="text-xs font-bold text-amber-400 font-mono">
                {pendingApprovals.length} معلقة
              </span>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#071829] border border-slate-800/50 text-center shadow-md">
                <FileCheck2 className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-300">كافة العمليات معتمدة ومرحلة</div>
                <div className="text-[10px] text-slate-500 mt-0.5">لا توجد مسودات معلقة تتطلب التدقيق</div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingApprovals.map((j) => (
                  <div
                    key={j.id}
                    className="p-3 rounded-2xl bg-[#071829] border border-slate-800/50 flex items-center justify-between shadow-md"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">{j.entryNumber}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[170px]">{j.description}</div>
                    </div>
                    <button
                      onClick={() => setActiveTab("JOURNAL_ENTRIES")}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      مراجعة
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SAP Compliance & Regulatory Badge */}
          <div className="bg-gradient-to-br from-[#0A2540] to-[#071829] border border-slate-800/50 rounded-3xl p-5 text-xs text-slate-300 space-y-2.5 shadow-md">
            <div className="flex items-center gap-2 font-bold text-sap-secondary">
              <ShieldCheck className="w-5 h-5" />
              <span>المعايير المحاسبية المعتمدة</span>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside">
              <li>المعايير الدولية لإعداد التقارير المالية (IFRS / IAS)</li>
              <li>النظام المالي الموحد للشركات والمؤسسات التجارية</li>
              <li>متوافق مع الهيكل المحاسبي SAP S/4HANA (FI/CO)</li>
            </ul>
          </div>
        </div>

        {/* 🗄️ منظومة الأرشيف المركزي ووثائق التسليم والإقرار الفني الشامل */}
        <div id="central-archive-anchor" className="mt-8 pt-6 border-t border-slate-800/80">
          <CentralArchiveSection
            companyName="شركة البدر للأدوية والمستلزمات الطبية"
            isDarkMode={true}
            currencies={currencies}
            displayCurrency={displayCurrency}
          />
        </div>
      </div>
    </div>
  );
};

