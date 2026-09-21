import React, { useState } from "react";
import {
  ArrowLeftRight,
  Receipt,
  FileText,
  Users,
  Plus,
  Building,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Phone,
  MessageCircle,
  HelpCircle,
  Share2,
} from "lucide-react";
import { TenantIsolationService } from "../services/tenantIsolationService";
import {
  ExchangeAccount,
  ExchangeTransaction,
  ExchangeTransactionType,
  ExchangePaymentMethod,
  ExchangeTransactionItem,
  Customer,
  InventoryItem,
  CurrencyInfo,
  CurrencyCode,
  SystemSettings,
  CashVaultItem,
  BankAccountItem,
  Voucher,
  JournalEntry,
} from "../types/erp";
import { formatMoney, formatNumberOnly } from "../services/erpStorage";
import { ExchangeQuickOps } from "./exchange/ExchangeQuickOps";
import { ExchangeStatement } from "./exchange/ExchangeStatement";
import { ExchangeJournal } from "./exchange/ExchangeJournal";
import { ExchangeNotificationModal } from "./exchange/ExchangeNotificationModal";
import { ExchangeNewAccountModal } from "./exchange/ExchangeNewAccountModal";

interface ClientExchangeViewProps {
  accounts: ExchangeAccount[];
  transactions: ExchangeTransaction[];
  customers: Customer[];
  inventoryItems: InventoryItem[];
  currencies: CurrencyInfo[];
  settings: SystemSettings;
  cashVaults: CashVaultItem[];
  bankAccounts: BankAccountItem[];
  onUpdateAccounts: (accounts: ExchangeAccount[]) => void;
  onUpdateTransactions: (transactions: ExchangeTransaction[]) => void;
  onAddVoucher?: (voucher: Voucher) => void;
  onAddJournalEntry?: (entry: JournalEntry) => void;
}

export const ClientExchangeView: React.FC<ClientExchangeViewProps> = ({
  accounts,
  transactions,
  customers,
  inventoryItems,
  currencies,
  settings,
  cashVaults,
  bankAccounts,
  onUpdateAccounts,
  onUpdateTransactions,
  onAddVoucher,
  onAddJournalEntry,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    "QUICK_OPS" | "STATEMENT" | "DAILY_JOURNAL" | "ACCOUNTS_LIST"
  >("QUICK_OPS");

  // Modals state
  const [activeNotificationTx, setActiveNotificationTx] =
    useState<ExchangeTransaction | null>(null);
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [statementTargetAccountId, setStatementTargetAccountId] =
    useState<string | undefined>(undefined);

  // Success toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Transaction execution engine
  const handleExecuteTransaction = (txData: {
    accountId: string;
    type: ExchangeTransactionType;
    amount: number;
    paymentMethod: ExchangePaymentMethod;
    paymentSourceName?: string;
    recipientAccountId?: string;
    purchasedItems?: ExchangeTransactionItem[];
    notes?: string;
    date: string;
    time: string;
  }) => {
    const senderAcc = accounts.find((a) => a.id === txData.accountId);
    if (!senderAcc) return;

    const defaultPhone = "0967773586047";
    const senderPhone = senderAcc.phone || defaultPhone;

    // Calculate new sender balance
    let newSenderBalance = senderAcc.balance;
    if (txData.type === "DEPOSIT") {
      newSenderBalance += txData.amount;
    } else {
      newSenderBalance -= txData.amount;
    }

    const nextTxNumber = `TX-${new Date().getFullYear()}-${String(
      transactions.length + 1
    ).padStart(4, "0")}`;

    // Notification text tailored for Yemeni market
    const notificationText = `📱 شركة مجموعة بن زياد التجارية المتحدة

عميلنا العزيز ${senderAcc.customerNameAr}،

تم ${
      txData.type === "DEPOSIT"
        ? "إيداع"
        : txData.type === "WITHDRAW"
        ? "سحب"
        : txData.type === "TRANSFER"
        ? "تحويل"
        : txData.type === "PURCHASE"
        ? "شراء مواد"
        : "تسوية"
    } مبلغ ${formatMoney(txData.amount, senderAcc.currency, currencies)}
من حساب الصرافة الخاص بكم.

الرصيد الحالي: ${formatMoney(newSenderBalance, senderAcc.currency, currencies)}

التاريخ: ${txData.date}
رقم العملية: ${nextTxNumber}

للتواصل: ${defaultPhone}`;

    const newSenderTx: ExchangeTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      accountId: senderAcc.id,
      accountNumber: senderAcc.accountNumber,
      customerId: senderAcc.customerId,
      customerNameAr: senderAcc.customerNameAr,
      customerPhone: senderPhone,
      type: txData.type,
      amount: txData.amount,
      currency: senderAcc.currency,
      balanceBefore: senderAcc.balance,
      balanceAfter: newSenderBalance,
      paymentMethod: txData.paymentMethod,
      paymentSourceName: txData.paymentSourceName,
      recipientAccountId: txData.recipientAccountId,
      purchasedItems: txData.purchasedItems,
      date: txData.date,
      time: txData.time,
      transactionNumber: nextTxNumber,
      notes: txData.notes,
      notificationMessage: notificationText,
      notificationStatus: "PENDING",
      createdAt: new Date().toISOString(),
    };

    let updatedAccounts = accounts.map((a) =>
      a.id === senderAcc.id ? { ...a, balance: newSenderBalance } : a
    );

    let createdTransactions: ExchangeTransaction[] = [newSenderTx];

    // If TRANSFER -> also credit recipient account and create credit transaction
    if (txData.type === "TRANSFER" && txData.recipientAccountId) {
      const recipientAcc = accounts.find((a) => a.id === txData.recipientAccountId);
      if (recipientAcc) {
        const newRecipientBalance = recipientAcc.balance + txData.amount;
        updatedAccounts = updatedAccounts.map((a) =>
          a.id === recipientAcc.id ? { ...a, balance: newRecipientBalance } : a
        );

        const recipientTxNum = `TX-${new Date().getFullYear()}-${String(
          transactions.length + 2
        ).padStart(4, "0")}`;

        const recipientNotification = `📱 شركة مجموعة بن زياد التجارية المتحدة

عميلنا العزيز ${recipientAcc.customerNameAr}،

تم استلام حوالة داخلية وإيداعها في حساب الصرافة الخاص بكم بمبلغ ${formatMoney(
          txData.amount,
          recipientAcc.currency,
          currencies
        )} من العميل ${senderAcc.customerNameAr}.

الرصيد الحالي: ${formatMoney(newRecipientBalance, recipientAcc.currency, currencies)}

التاريخ: ${txData.date}
رقم العملية: ${recipientTxNum}

للتواصل: ${defaultPhone}`;

        const recipientTx: ExchangeTransaction = {
          id: `tx-${Date.now()}-rec`,
          accountId: recipientAcc.id,
          accountNumber: recipientAcc.accountNumber,
          customerId: recipientAcc.customerId,
          customerNameAr: recipientAcc.customerNameAr,
          customerPhone: recipientAcc.phone || defaultPhone,
          type: "DEPOSIT",
          amount: txData.amount,
          currency: recipientAcc.currency,
          balanceBefore: recipientAcc.balance,
          balanceAfter: newRecipientBalance,
          paymentMethod: "INTERNAL_BALANCE",
          paymentSourceName: `حوالة واردة من حساب ${senderAcc.customerNameAr}`,
          date: txData.date,
          time: txData.time,
          transactionNumber: recipientTxNum,
          notes: `حوالة واردة من ${senderAcc.customerNameAr} (${senderAcc.accountNumber})`,
          notificationMessage: recipientNotification,
          notificationStatus: "PENDING",
          createdAt: new Date().toISOString(),
        };

        createdTransactions.push(recipientTx);
      }
    }

    // Update state
    onUpdateAccounts(updatedAccounts);
    onUpdateTransactions([...createdTransactions, ...transactions]);

    // Optional automated Voucher / Accounting linkage
    if (onAddVoucher && (txData.type === "DEPOSIT" || txData.type === "WITHDRAW")) {
      const isDep = txData.type === "DEPOSIT";
      const newVoucher: Voucher = {
        id: `v-ex-${Date.now()}`,
        voucherNumber: isDep ? `RV-EX-${Date.now().toString().slice(-4)}` : `PV-EX-${Date.now().toString().slice(-4)}`,
        type: isDep ? "RECEIPT" : "PAYMENT",
        date: txData.date,
        beneficiaryOrPayer: senderAcc.customerNameAr,
        amount: txData.amount,
        currency: senderAcc.currency,
        exchangeRate: 1,
        localAmount: txData.amount,
        paymentMethod: txData.paymentMethod === "CASH" ? "CASH" : "BANK_TRANSFER",
        sourceAccountId: cashVaults[0]?.id || "110101",
        destinationAccountId: "2104",
        status: "POSTED",
        notes: `قيد صرافة آلي - ${txData.notes || (isDep ? "إيداع صرافة" : "سحب صرافة")}`,
        createdByName: "مدير الصرافة والتحويلات",
      };
      onAddVoucher(newVoucher);
    }

    // Automatically pop open the WhatsApp / SMS notification modal
    setActiveNotificationTx(newSenderTx);
    showToast(`تم تنفيذ وقيد العملية ${nextTxNumber} بنجاح!`);
  };

  // Create new exchange account
  const handleCreateNewAccount = (data: {
    customerId: string;
    customerNameAr: string;
    accountNumber: string;
    phone: string;
    currency: CurrencyCode;
    initialBalance: number;
    minBalance: number;
    city: string;
    address: string;
  }) => {
    const newAcc: ExchangeAccount = {
      id: `acc-ex-${Date.now()}`,
      accountNumber: data.accountNumber,
      customerId: data.customerId,
      customerNameAr: data.customerNameAr,
      customerNameEn: data.customerNameAr,
      phone: data.phone,
      currency: data.currency,
      balance: data.initialBalance,
      minBalance: data.minBalance,
      city: data.city,
      address: data.address,
      status: "ACTIVE",
      notes: "حساب صرافة وأمانات معتمد",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateAccounts([...accounts, newAcc]);

    if (data.initialBalance > 0) {
      const initTx: ExchangeTransaction = {
        id: `tx-init-${Date.now()}`,
        accountId: newAcc.id,
        accountNumber: newAcc.accountNumber,
        customerId: newAcc.customerId,
        customerNameAr: newAcc.customerNameAr,
        customerPhone: newAcc.phone,
        type: "DEPOSIT",
        amount: data.initialBalance,
        currency: data.currency,
        balanceBefore: 0,
        balanceAfter: data.initialBalance,
        paymentMethod: "CASH",
        paymentSourceName: "إيداع افتتاحي نقداً",
        date: new Date().toISOString().slice(0, 10),
        time: "10:00",
        transactionNumber: `TX-${new Date().getFullYear()}-0001`,
        notes: "رصيد افتتاحي عند فتح حساب الصرافة",
        notificationMessage: `📱 شركة مجموعة بن زياد التجارية المتحدة\nعميلنا العزيز ${newAcc.customerNameAr}، نرحب بكم. تم فتح حساب الصرافة الخاص بكم بنجاح برصيد افتتاحي: ${data.initialBalance} ${data.currency}. للتواصل: 0967773586047`,
        notificationStatus: "PENDING",
        createdAt: new Date().toISOString(),
      };
      onUpdateTransactions([initTx, ...transactions]);
    }

    showToast(`تم فتح حساب الصرافة (${data.accountNumber}) للعميل ${data.customerNameAr} بنجاح!`);
  };

  // Aggregate sums
  const totalBalancesYER = accounts
    .filter((a) => a.currency.startsWith("YER"))
    .reduce((sum, a) => sum + a.balance, 0);

  const totalBalancesSAR = accounts
    .filter((a) => a.currency === "SAR")
    .reduce((sum, a) => sum + a.balance, 0);

  const totalBalancesUSD = accounts
    .filter((a) => a.currency === "USD")
    .reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 p-4 rounded-2xl bg-emerald-900 border border-emerald-600 text-emerald-100 shadow-2xl flex items-center gap-3 animate-slideUp">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-xs">{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ArrowLeftRight className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-100">
                الصرافة والتحويلات الداخلية للعملاء
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
                {TenantIsolationService.getActiveTenantDetails()?.nameAr || "المنشأة المعتمدة"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              إدارة أمانات وودائع العملاء الجارية، التحويلات الداخلية، والشراء المباشر لمواد البناء والمستلزمات الزراعية مع إشعارات WhatsApp و SMS اللحظية.
            </p>
          </div>
        </div>

        {/* Quick Open Account Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsNewAccountModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-600/20 transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>فتح حساب صرافة جديد</span>
          </button>
        </div>
      </div>

      {/* Top Aggregates Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
          <div className="text-xs text-slate-400 mb-1">إجمالي ودائع الصرافة (ريال يمني):</div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {formatNumberOnly(totalBalancesYER)} <span className="text-xs text-slate-400 font-sans">ريال</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
          <div className="text-xs text-slate-400 mb-1">إجمالي ودائع الصرافة (ريال سعودي):</div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {formatNumberOnly(totalBalancesSAR)} <span className="text-xs text-slate-400 font-sans">ر.س</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
          <div className="text-xs text-slate-400 mb-1">عدد حسابات الصرافة النشطة:</div>
          <div className="text-xl font-bold font-mono text-blue-400">
            {accounts.length} <span className="text-xs text-slate-400 font-sans">عميل معتمد</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("QUICK_OPS")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "QUICK_OPS"
              ? "bg-amber-600 text-slate-950 shadow-md shadow-amber-600/20"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>لوحة العمليات السريعة</span>
        </button>

        <button
          onClick={() => setActiveTab("STATEMENT")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "STATEMENT"
              ? "bg-amber-600 text-slate-950 shadow-md shadow-amber-600/20"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>كشف حساب العميل والطباعة</span>
        </button>

        <button
          onClick={() => setActiveTab("DAILY_JOURNAL")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "DAILY_JOURNAL"
              ? "bg-amber-600 text-slate-950 shadow-md shadow-amber-600/20"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>حركة الصرافة اليومية وسجل العمليات</span>
        </button>

        <button
          onClick={() => setActiveTab("ACCOUNTS_LIST")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "ACCOUNTS_LIST"
              ? "bg-amber-600 text-slate-950 shadow-md shadow-amber-600/20"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>دليل حسابات وأرصدة العملاء</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "QUICK_OPS" && (
        <ExchangeQuickOps
          accounts={accounts}
          transactions={transactions}
          inventoryItems={inventoryItems}
          currencies={currencies}
          cashVaults={cashVaults}
          bankAccounts={bankAccounts}
          onExecuteTransaction={handleExecuteTransaction}
          onOpenNotification={(tx) => setActiveNotificationTx(tx)}
          onOpenNewAccount={() => setIsNewAccountModalOpen(true)}
          onSelectAccountForStatement={(acc) => {
            setStatementTargetAccountId(acc.id);
            setActiveTab("STATEMENT");
          }}
        />
      )}

      {activeTab === "STATEMENT" && (
        <ExchangeStatement
          accounts={accounts}
          transactions={transactions}
          currencies={currencies}
          settings={settings}
          preselectedAccountId={statementTargetAccountId}
          onOpenNotification={(tx) => setActiveNotificationTx(tx)}
        />
      )}

      {activeTab === "DAILY_JOURNAL" && (
        <ExchangeJournal
          transactions={transactions}
          accounts={accounts}
          currencies={currencies}
          onOpenNotification={(tx) => setActiveNotificationTx(tx)}
        />
      )}

      {activeTab === "ACCOUNTS_LIST" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>أرصدة حسابات الصرافة والأمانات للعملاء:</span>
            </h3>
            <button
              onClick={() => setIsNewAccountModalOpen(true)}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة حساب جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-3 shadow group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-mono text-amber-400 font-bold">{acc.accountNumber}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                      {acc.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm group-hover:text-amber-300 transition-colors">
                    {acc.customerNameAr}
                  </h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{acc.phone}</span> • <span>{acc.city}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">الرصيد المتاح:</span>
                    <div className="text-base font-black font-mono text-amber-400">
                      {formatMoney(acc.balance, acc.currency, currencies)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setStatementTargetAccountId(acc.id);
                        setActiveTab("STATEMENT");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                    >
                      كشف الحساب
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WhatsApp / SMS Notification Modal */}
      {activeNotificationTx && (
        <ExchangeNotificationModal
          transaction={activeNotificationTx}
          currencies={currencies}
          onClose={() => setActiveNotificationTx(null)}
          onPrint={() => {
            setActiveNotificationTx(null);
            setStatementTargetAccountId(activeNotificationTx.accountId);
            setActiveTab("STATEMENT");
          }}
        />
      )}

      {/* New Exchange Account Modal */}
      {isNewAccountModalOpen && (
        <ExchangeNewAccountModal
          customers={customers}
          currencies={currencies}
          existingAccounts={accounts}
          onClose={() => setIsNewAccountModalOpen(false)}
          onCreateAccount={handleCreateNewAccount}
        />
      )}
    </div>
  );
};
