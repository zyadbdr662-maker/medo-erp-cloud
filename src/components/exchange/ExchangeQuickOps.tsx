import React, { useState, useMemo } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wallet,
  DollarSign,
  Plus,
  Trash2,
  Package,
  Building,
  User,
  Phone,
  Printer,
  MessageCircle,
  HelpCircle,
  Send,
  RefreshCw,
  Search,
  Check,
  CreditCard,
  Building2,
  Tag,
  FileText,
} from "lucide-react";
import {
  ExchangeAccount,
  ExchangeTransaction,
  ExchangeTransactionType,
  ExchangePaymentMethod,
  ExchangeTransactionItem,
  InventoryItem,
  CurrencyCode,
  CurrencyInfo,
  CashVaultItem,
  BankAccountItem,
} from "../../types/erp";
import { formatMoney, formatNumberOnly } from "../../services/erpStorage";

interface ExchangeQuickOpsProps {
  accounts: ExchangeAccount[];
  transactions: ExchangeTransaction[];
  inventoryItems: InventoryItem[];
  currencies: CurrencyInfo[];
  cashVaults: CashVaultItem[];
  bankAccounts: BankAccountItem[];
  onExecuteTransaction: (txData: {
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
  }) => void;
  onOpenNotification: (tx: ExchangeTransaction) => void;
  onOpenNewAccount: () => void;
  onSelectAccountForStatement: (account: ExchangeAccount) => void;
}

export const ExchangeQuickOps: React.FC<ExchangeQuickOpsProps> = ({
  accounts,
  transactions,
  inventoryItems,
  currencies,
  cashVaults,
  bankAccounts,
  onExecuteTransaction,
  onOpenNotification,
  onOpenNewAccount,
  onSelectAccountForStatement,
}) => {
  // Selected Account (defaults to the first active account)
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    accounts[0]?.id || ""
  );

  // Operation Type
  const [opType, setOpType] = useState<ExchangeTransactionType>("DEPOSIT");

  // Form Fields
  const [amount, setAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<ExchangePaymentMethod>("CASH");
  const [paymentSourceName, setPaymentSourceName] = useState<string>(
    (cashVaults[0] as any)?.nameAr || cashVaults[0]?.name || "الخزينة الرئيسية"
  );
  const [recipientAccountId, setRecipientAccountId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // For "PURCHASE" operation - selected items list
  const [selectedItems, setSelectedItems] = useState<ExchangeTransactionItem[]>([]);
  const [materialCategory, setMaterialCategory] = useState<string>("ALL");
  const [searchMaterial, setSearchMaterial] = useState<string>("");

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active account object
  const currentAccount = useMemo(() => {
    return accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  }, [accounts, selectedAccountId]);

  // Available recipients (exclude current account)
  const recipientAccounts = useMemo(() => {
    return accounts.filter((a) => a.id !== currentAccount?.id && a.status === "ACTIVE");
  }, [accounts, currentAccount]);

  // Recipient account object
  const recipientAccount = useMemo(() => {
    return accounts.find((a) => a.id === recipientAccountId);
  }, [accounts, recipientAccountId]);

  // Filtered inventory materials
  const filteredMaterials = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchCat =
        materialCategory === "ALL" ||
        item.category.toLowerCase().includes(materialCategory.toLowerCase());
      const matchQuery =
        !searchMaterial ||
        item.nameAr.toLowerCase().includes(searchMaterial.toLowerCase()) ||
        item.code.toLowerCase().includes(searchMaterial.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [inventoryItems, materialCategory, searchMaterial]);

  // Calculate purchase total
  const purchaseTotal = useMemo(() => {
    return selectedItems.reduce((sum, it) => sum + it.total, 0);
  }, [selectedItems]);

  // Effective operation amount
  const effectiveAmount = opType === "PURCHASE" ? purchaseTotal : Number(amount) || 0;

  // Recent transactions for this selected customer
  const clientRecentTxs = useMemo(() => {
    if (!currentAccount) return [];
    return transactions
      .filter(
        (t) =>
          t.accountId === currentAccount.id ||
          t.recipientAccountId === currentAccount.id
      )
      .slice(0, 5);
  }, [transactions, currentAccount]);

  // Handle adding an item to purchase list
  const handleAddItem = (item: InventoryItem) => {
    const existingIndex = selectedItems.findIndex((i) => i.itemId === item.id);
    if (existingIndex > -1) {
      const updated = [...selectedItems];
      const newQty = updated[existingIndex].quantity + 1;
      if (newQty > item.quantityOnHand) {
        alert(`الكمية المطلوبة (${newQty}) تتجاوز الرصيد المخزني المتاح (${item.quantityOnHand} ${item.unit})`);
        return;
      }
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].total = newQty * updated[existingIndex].unitPrice;
      setSelectedItems(updated);
    } else {
      if (item.quantityOnHand < 1) {
        alert("هذا الصنف غير متوفر حالياً في المستودعات!");
        return;
      }
      setSelectedItems([
        ...selectedItems,
        {
          itemId: item.id,
          itemNameAr: item.nameAr,
          itemCode: item.code,
          quantity: 1,
          unit: item.unit,
          unitPrice: item.sellingPrice,
          total: item.sellingPrice,
        },
      ]);
    }
  };

  // Handle changing quantity of item
  const handleUpdateItemQty = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      setSelectedItems(selectedItems.filter((i) => i.itemId !== itemId));
      return;
    }
    const inv = inventoryItems.find((i) => i.id === itemId);
    if (inv && newQty > inv.quantityOnHand) {
      alert(`الكمية المطلوبة (${newQty}) تتجاوز المخزون المتاح (${inv.quantityOnHand})`);
      return;
    }
    setSelectedItems(
      selectedItems.map((i) =>
        i.itemId === itemId
          ? { ...i, quantity: newQty, total: newQty * i.unitPrice }
          : i
      )
    );
  };

  // Validate and submit
  const handleValidateForm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentAccount) {
      setErrorMsg("يرجى اختيار حساب العميل أولاً");
      return;
    }

    if (currentAccount.status !== "ACTIVE") {
      setErrorMsg("هذا الحساب مجمد أو غير نشط، لا يمكن إجراء حركات عليه");
      return;
    }

    if (opType === "PURCHASE") {
      if (selectedItems.length === 0) {
        setErrorMsg("يرجى اختيار صنف واحد على الأقل من المواد المطلوب شراؤها");
        return;
      }
      if (purchaseTotal <= 0) {
        setErrorMsg("إجمالي قيمة المواد يجب أن يكون أكبر من الصفر");
        return;
      }
      if (currentAccount.balance < purchaseTotal) {
        setErrorMsg(
          `رصيد الحساب الحالي (${formatMoney(
            currentAccount.balance,
            currentAccount.currency,
            currencies
          )}) غير كافٍ لإتمام عملية الشراء بقيمة (${formatMoney(
            purchaseTotal,
            currentAccount.currency,
            currencies
          )})`
        );
        return;
      }
    } else {
      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        setErrorMsg("يرجى إدخال مبلغ صحيح أكبر من الصفر");
        return;
      }

      if (opType === "WITHDRAW" && numAmount > currentAccount.balance) {
        setErrorMsg(
          `المبلغ المطلوب سحبه يتجاوز الرصيد المتاح (${formatMoney(
            currentAccount.balance,
            currentAccount.currency,
            currencies
          )})`
        );
        return;
      }

      if (opType === "TRANSFER") {
        if (!recipientAccountId) {
          setErrorMsg("يرجى تحديد العميل المستلم للحوالة الداخلية");
          return;
        }
        if (numAmount > currentAccount.balance) {
          setErrorMsg(
            `المبلغ المطلوب تحويله يتجاوز الرصيد المتاح بالحساب (${formatMoney(
              currentAccount.balance,
              currentAccount.currency,
              currencies
            )})`
          );
          return;
        }
      }
    }

    // All good -> show confirmation dialog
    setShowConfirmModal(true);
  };

  // Execute after confirmation
  const handleConfirmExecution = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    onExecuteTransaction({
      accountId: currentAccount.id,
      type: opType,
      amount: effectiveAmount,
      paymentMethod:
        opType === "PURCHASE" || opType === "TRANSFER"
          ? "INTERNAL_BALANCE"
          : paymentMethod,
      paymentSourceName:
        opType === "PURCHASE"
          ? "رصيد حساب الصرافة (شراء مواد)"
          : opType === "TRANSFER"
          ? "رصيد حساب الصرافة (تحويل داخلي)"
          : paymentSourceName,
      recipientAccountId: opType === "TRANSFER" ? recipientAccountId : undefined,
      purchasedItems: opType === "PURCHASE" ? selectedItems : undefined,
      notes:
        notes ||
        (opType === "DEPOSIT"
          ? "إيداع نقدي بحساب الصرافة"
          : opType === "WITHDRAW"
          ? "سحب نقدي من حساب الصرافة"
          : opType === "TRANSFER"
          ? `تحويل داخلي لصالح ${recipientAccount?.customerNameAr || "عميل آخر"}`
          : "شراء مواد بناء وزراعية من رصيد الحساب"),
      date: date || new Date().toISOString().slice(0, 10),
      time: timeStr,
    });

    // Reset fields
    setShowConfirmModal(false);
    setAmount("");
    setNotes("");
    setSelectedItems([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary Card (faithful to user's sketch) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Client Selector & Info */}
          <div className="space-y-2 flex-1 min-w-0 w-full lg:w-auto">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span>اختيار حساب العميل (Exchange Account):</span>
              </label>
              <button
                type="button"
                onClick={onOpenNewAccount}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>فتح حساب صرافة جديد</span>
              </button>
            </div>

            <select
              value={selectedAccountId}
              onChange={(e) => {
                setSelectedAccountId(e.target.value);
                setRecipientAccountId("");
              }}
              className="w-full bg-slate-950/80 border border-slate-700 text-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountNumber} - {acc.customerNameAr} ({acc.city}) | رصيد:{" "}
                  {formatNumberOnly(acc.balance)} {acc.currency}
                </option>
              ))}
            </select>

            {currentAccount && (
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-slate-300">{currentAccount.phone}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>{currentAccount.city} {currentAccount.address ? `- ${currentAccount.address}` : ""}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[11px] font-bold">
                  الحساب نشط (Active)
                </span>
              </div>
            )}
          </div>

          {/* Current Balance Display (Prominent Highlight from user sketch) */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-5 text-center min-w-[260px] shadow-lg">
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              الرصيد المتاح في حساب الصرافة:
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 tracking-tight">
              {currentAccount
                ? formatMoney(currentAccount.balance, currentAccount.currency, currencies)
                : "0"}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>الحد الأدنى: {formatNumberOnly(currentAccount?.minBalance || 0)}</span>
              <button
                onClick={() => currentAccount && onSelectAccountForStatement(currentAccount)}
                className="text-amber-400 hover:text-amber-300 underline font-medium"
              >
                كشف الحساب
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Operations Form (The 4 Requested Operations: إيداع / سحب / تحويل داخلي / شراء مواد) */}
      <form
        onSubmit={handleValidateForm}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6"
      >
        {/* Operation Type Switcher */}
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-2.5">
            اختر نوع العملية المطلوبة:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Deposit */}
            <button
              type="button"
              onClick={() => {
                setOpType("DEPOSIT");
                setErrorMsg(null);
              }}
              className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex flex-col items-center gap-1.5 transition-all ${
                opType === "DEPOSIT"
                  ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-600/10 scale-[1.02]"
                  : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
              <span>إيداع نقدي / بنكي (+)</span>
            </button>

            {/* Withdraw */}
            <button
              type="button"
              onClick={() => {
                setOpType("WITHDRAW");
                setErrorMsg(null);
              }}
              className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex flex-col items-center gap-1.5 transition-all ${
                opType === "WITHDRAW"
                  ? "bg-rose-600/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-600/10 scale-[1.02]"
                  : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <ArrowUpRight className="w-5 h-5 text-rose-400" />
              <span>سحب نقدي (-)</span>
            </button>

            {/* Internal Transfer */}
            <button
              type="button"
              onClick={() => {
                setOpType("TRANSFER");
                setErrorMsg(null);
              }}
              className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex flex-col items-center gap-1.5 transition-all ${
                opType === "TRANSFER"
                  ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-600/10 scale-[1.02]"
                  : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <ArrowLeftRight className="w-5 h-5 text-blue-400" />
              <span>تحويل داخلي بين العملاء</span>
            </button>

            {/* Purchase Materials */}
            <button
              type="button"
              onClick={() => {
                setOpType("PURCHASE");
                setErrorMsg(null);
              }}
              className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex flex-col items-center gap-1.5 transition-all ${
                opType === "PURCHASE"
                  ? "bg-amber-600/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-600/10 scale-[1.02]"
                  : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>شراء مواد بناء وزراعية</span>
            </button>
          </div>
        </div>

        {/* Dynamic Section Depending on Operation */}
        {opType === "TRANSFER" && (
          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-800/40 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
              <ArrowLeftRight className="w-4 h-4 text-blue-400" />
              <span>تحديد المستلم للحوالة الداخلية:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  اختر حساب العميل المستلم:
                </label>
                <select
                  value={recipientAccountId}
                  onChange={(e) => setRecipientAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- اختر المستلم من قائمة العملاء --</option>
                  {recipientAccounts.map((rec) => (
                    <option key={rec.id} value={rec.id}>
                      {rec.accountNumber} - {rec.customerNameAr} ({rec.city})
                    </option>
                  ))}
                </select>
              </div>

              {recipientAccount && (
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-200">{recipientAccount.customerNameAr}</div>
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>الهاتف: {recipientAccount.phone}</span>
                    <span className="text-emerald-400">حساب معتمد</span>
                  </div>
                  <div className="text-slate-400">
                    الرصيد الحالي للمستلم:{" "}
                    <span className="font-mono text-slate-200">
                      {formatNumberOnly(recipientAccount.balance)} {recipientAccount.currency}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PURCHASE MATERIALS & AGRICULTURAL SUPPLIES PICKER */}
        {opType === "PURCHASE" ? (
          <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Package className="w-4 h-4 text-amber-400" />
                <span>سلة شراء مواد البناء والمستلزمات الزراعية (من رصيد الصرافة):</span>
              </div>
              <div className="text-xs font-mono text-amber-400 font-bold">
                إجمالي السلة: {formatMoney(purchaseTotal, currentAccount?.currency || "YER_SANAA", currencies)}
              </div>
            </div>

            {/* Category and Search */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="relative col-span-2">
                <Search className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
                <input
                  type="text"
                  value={searchMaterial}
                  onChange={(e) => setSearchMaterial(e.target.value)}
                  placeholder="ابحث عن مادة (اسمنت، حديد، يوريا، أنابيب ري، ألواح، كابلات...)"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl pr-9 pl-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
              <select
                value={materialCategory}
                onChange={(e) => setMaterialCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">جميع الأقسام</option>
                <option value="مواد بناء">مواد بناء وإنشاءات</option>
                <option value="زراعية">مستلزمات زراعية وأسمدة</option>
                <option value="طاقة">طاقة شمسية وبطاريات</option>
              </select>
            </div>

            {/* Materials Grid / Picker */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
              {filteredMaterials.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleAddItem(item)}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between gap-2 text-xs group hover:bg-slate-900"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-1">
                      {item.nameAr}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>كود: {item.code}</span>
                      <span className="text-slate-300 font-semibold">
                        {formatMoney(item.sellingPrice, item.currency, currencies)} / {item.unit}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                    <span className={item.quantityOnHand > 5 ? "text-emerald-400" : "text-amber-400"}>
                      المخزون: {item.quantityOnHand} {item.unit}
                    </span>
                    <span className="text-amber-400 font-bold group-hover:underline flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      إضافة
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Items List */}
            {selectedItems.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300 block">
                  الأصناف المحددة للشراء:
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedItems.map((sel) => (
                    <div
                      key={sel.itemId}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-100 truncate">
                          {sel.itemNameAr}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          سعر الوحدة: {formatNumberOnly(sel.unitPrice)} ريال
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(sel.itemId, sel.quantity - 1)}
                            className="px-2 py-1 hover:bg-slate-800 text-slate-300"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={sel.quantity}
                            onChange={(e) =>
                              handleUpdateItemQty(sel.itemId, Number(e.target.value) || 1)
                            }
                            className="w-12 bg-transparent text-center text-xs text-white font-mono focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(sel.itemId, sel.quantity + 1)}
                            className="px-2 py-1 hover:bg-slate-800 text-slate-300"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-slate-400 text-[11px]">{sel.unit}</span>
                      </div>

                      <div className="text-left font-mono font-bold text-amber-400 w-24">
                        {formatNumberOnly(sel.total)}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUpdateItemQty(sel.itemId, 0)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Standard Amount Input (for Deposit, Withdraw, Transfer) */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                المبلغ المطلوب ({currentAccount?.currency || "YER_SANAA"}):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="أدخل المبلغ (مثال: 500000)"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-2xl px-4 py-3 text-base font-mono font-bold focus:outline-none focus:border-amber-500 shadow-inner"
                  required
                />
                <span className="absolute left-4 top-3 text-xs text-slate-500 font-mono">
                  {currentAccount?.currency}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                طريقة الدفع / الاستلام:
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => {
                  const val = e.target.value as ExchangePaymentMethod;
                  setPaymentMethod(val);
                  if (val === "CASH") setPaymentSourceName("الخزينة الرئيسية - نقداً");
                  else if (val === "BANK_TRANSFER") setPaymentSourceName("بنك التضامن الإسلامي");
                  else if (val === "WALLET_KURAIMI") setPaymentSourceName("محفظة الكريمي موني");
                  else if (val === "WALLET_JAWWALI") setPaymentSourceName("محفظة جوالي");
                  else if (val === "WALLET_JEEB") setPaymentSourceName("محفظة جيب");
                  else if (val === "WALLET_FLOUSAK") setPaymentSourceName("محفظة فلوسك");
                  else if (val === "WALLET_ONECASH") setPaymentSourceName("محفظة ون كاش");
                  else if (val === "WALLET_MFLOOS") setPaymentSourceName("محفظة إم فلوس");
                }}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="CASH">💵 نقداً (الخزينة والصندوق)</option>
                <option value="BANK_TRANSFER">🏦 تحويل بنكي (بنك التضامن / الكريمي)</option>
                <option value="WALLET_KURAIMI">📱 محفظة كريمي موني (Kuraimi)</option>
                <option value="WALLET_JAWWALI">📱 محفظة جوالي (Jawwali)</option>
                <option value="WALLET_JEEB">📱 محفظة جيب (Jeeb)</option>
                <option value="WALLET_FLOUSAK">📱 محفظة فلوسك (Flousak)</option>
                <option value="WALLET_ONECASH">📱 محفظة ون كاش (OneCash)</option>
                <option value="WALLET_MFLOOS">📱 محفظة إم فلوس (M-Floos)</option>
              </select>
            </div>
          </div>
        )}

        {/* Notes & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              ملاحظات وبيان العملية:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                opType === "DEPOSIT"
                  ? "مثال: إيداع نقدي بالحساب لتغطية دفعات البناء"
                  : opType === "WITHDRAW"
                  ? "مثال: سحب نقدي بناءً على طلب العميل"
                  : opType === "TRANSFER"
                  ? "مثال: حوالة داخلية لصالح المقاول"
                  : "مثال: شراء مواد بناء وتوريدها للورشة"
              }
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              تاريخ تنفيذ العملية:
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-2xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Execution Button */}
        <div className="pt-2 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>سيتم تجهيز إشعار فوري (WhatsApp & SMS) آلياً بعد التنفيذ</span>
          </div>

          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-600/20 transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>تنفيذ العملية وترحيلها</span>
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span>تأكيد تنفيذ العملية وقيدها المحاسبي</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">العميل:</span>
                <span className="font-bold text-slate-100">{currentAccount?.customerNameAr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">نوع العملية:</span>
                <span className="font-bold text-amber-400">
                  {opType === "DEPOSIT"
                    ? "إيداع نقدي (+)"
                    : opType === "WITHDRAW"
                    ? "سحب نقدي (-)"
                    : opType === "TRANSFER"
                    ? "تحويل داخلي"
                    : "شراء مواد بناء وزراعية"}
                </span>
              </div>
              {opType === "TRANSFER" && (
                <div className="flex justify-between">
                  <span className="text-slate-400">المستلم:</span>
                  <span className="font-bold text-blue-400">{recipientAccount?.customerNameAr}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">المبلغ الإجمالي:</span>
                <span className="font-bold font-mono text-emerald-400">
                  {formatMoney(effectiveAmount, currentAccount?.currency || "YER_SANAA", currencies)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-slate-400">الرصيد بعد التنفيذ:</span>
                <span className="font-bold font-mono text-white">
                  {formatMoney(
                    opType === "DEPOSIT"
                      ? currentAccount.balance + effectiveAmount
                      : currentAccount.balance - effectiveAmount,
                    currentAccount?.currency || "YER_SANAA",
                    currencies
                  )}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmExecution}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
              >
                تأكيد وتنفيذ فوري
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                إلغاء وتراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions List (faithful to user's sketch) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">
              آخر عمليات حساب ({currentAccount?.customerNameAr || "العميل"}):
            </h3>
          </div>
          <button
            onClick={() => currentAccount && onSelectAccountForStatement(currentAccount)}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            عرض كشف الحساب الكامل ←
          </button>
        </div>

        {clientRecentTxs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
            لا توجد حركات سابقة مسجلة لهذا الحساب حتى الآن. قم بإجراء أول عملية أعلاه.
          </div>
        ) : (
          <div className="space-y-2">
            {clientRecentTxs.map((tx) => {
              const isOutgoing =
                tx.type === "WITHDRAW" ||
                tx.type === "PURCHASE" ||
                (tx.type === "TRANSFER" && tx.accountId === currentAccount?.id);

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl border flex-shrink-0 ${
                        tx.type === "DEPOSIT"
                          ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                          : tx.type === "WITHDRAW"
                          ? "bg-rose-950 text-rose-400 border-rose-800"
                          : tx.type === "PURCHASE"
                          ? "bg-amber-950 text-amber-400 border-amber-800"
                          : "bg-blue-950 text-blue-400 border-blue-800"
                      }`}
                    >
                      {tx.type === "DEPOSIT" && <ArrowDownLeft className="w-4 h-4" />}
                      {tx.type === "WITHDRAW" && <ArrowUpRight className="w-4 h-4" />}
                      {tx.type === "PURCHASE" && <ShoppingBag className="w-4 h-4" />}
                      {tx.type === "TRANSFER" && <ArrowLeftRight className="w-4 h-4" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-200 flex items-center gap-2">
                        <span>
                          {tx.type === "DEPOSIT"
                            ? "إيداع"
                            : tx.type === "WITHDRAW"
                            ? "سحب"
                            : tx.type === "PURCHASE"
                            ? "شراء مواد بناء وزراعية"
                            : `تحويل داخلي`}
                        </span>
                        <span className="font-mono text-slate-400 text-[11px]">
                          ({tx.transactionNumber})
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {tx.notes || "عملية صرافة"} • {tx.date}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <div className="text-left font-mono">
                      <div
                        className={`font-bold text-sm ${
                          isOutgoing ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {isOutgoing ? "-" : "+"}
                        {formatNumberOnly(tx.amount)} {tx.currency}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        الرصيد: {formatNumberOnly(tx.balanceAfter)}
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenNotification(tx)}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition-colors"
                      title="معاينة وإرسال إشعار واتساب / SMS"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
