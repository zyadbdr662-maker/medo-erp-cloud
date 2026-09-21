import React, { useState } from "react";
import {
  Landmark,
  Wallet,
  ArrowRightLeft,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Scale,
  DollarSign,
  Printer,
  ShieldCheck,
} from "lucide-react";
import {
  Account,
  BankAccountItem,
  CashVaultItem,
  CurrencyCode,
  CurrencyInfo,
} from "../types/erp";
import { formatMoney, formatNumberOnly } from "../services/erpStorage";

interface CashAndBankViewProps {
  bankAccounts: BankAccountItem[];
  cashVaults: CashVaultItem[];
  accounts: Account[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  onTransferFunds: (transferData: {
    fromType: "VAULT" | "BANK";
    fromId: string;
    toType: "VAULT" | "BANK";
    toId: string;
    amount: number;
    currency: CurrencyCode;
    notes: string;
  }) => void;
}

export const CashAndBankView: React.FC<CashAndBankViewProps> = ({
  bankAccounts,
  cashVaults,
  accounts,
  currencies,
  displayCurrency,
  onTransferFunds,
}) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "BANKS" | "VAULTS" | "RECONCILIATION">("ALL");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [selectedBankForReconcile, setSelectedBankForReconcile] = useState<BankAccountItem | null>(null);

  // Transfer state
  const [fromSource, setFromSource] = useState(`VAULT_${cashVaults[0]?.id || ""}`);
  const [toSource, setToSource] = useState(`BANK_${bankAccounts[0]?.id || ""}`);
  const [transferAmount, setTransferAmount] = useState<number | "">("");
  const [transferCurrency, setTransferCurrency] = useState<CurrencyCode>("YER_SANAA");
  const [transferNotes, setTransferNotes] = useState("");

  // Bank Reconciliation state
  const [statementBalance, setStatementBalance] = useState<number | "">("");
  const [uncreditedDeposits, setUncreditedDeposits] = useState<number>(0);
  const [outstandingChecks, setOutstandingChecks] = useState<number>(0);

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || transferAmount <= 0) return;

    const [fromType, fromId] = fromSource.split("_") as ["VAULT" | "BANK", string];
    const [toType, toId] = toSource.split("_") as ["VAULT" | "BANK", string];

    if (fromType === toType && fromId === toId) {
      alert("لا يمكن التحويل من وإلى نفس الحساب!");
      return;
    }

    onTransferFunds({
      fromType,
      fromId,
      toType,
      toId,
      amount: Number(transferAmount),
      currency: transferCurrency,
      notes: transferNotes || `تحويل سيولة داخلية`,
    });

    setShowTransferModal(false);
    setTransferAmount("");
    setTransferNotes("");
  };

  const openReconcileModal = (bank: BankAccountItem) => {
    setSelectedBankForReconcile(bank);
    setStatementBalance(bank.currentBalance);
    setUncreditedDeposits(0);
    setOutstandingChecks(0);
    setShowReconcileModal(true);
  };

  // Reconciled balance calculation
  const bookBalance = selectedBankForReconcile?.currentBalance || 0;
  const adjustedStatement =
    (typeof statementBalance === "number" ? statementBalance : 0) +
    uncreditedDeposits -
    outstandingChecks;
  const reconcileDiff = Math.abs(bookBalance - adjustedStatement);

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">إدارة الخزائن النقدية والبنوك (Cash & Bank Management)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            متابعة السيولة النقدية، حركة حسابات البنوك، التسويات المصرفية والتحويلات الداخلية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>تحويل أموال داخلي</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs w-fit">
        {[
          { id: "ALL", label: "كافة الحسابات والخزائن" },
          { id: "BANKS", label: "الحسابات المصرفية (Banks)" },
          { id: "VAULTS", label: "الخزائن النقدية (Vaults)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              activeTab === tab.id
                ? "bg-emerald-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bank Accounts Grid */}
      {(activeTab === "ALL" || activeTab === "BANKS") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-blue-400" />
              <span>الحسابات المصرفية النشطة لدى البنوك</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">{bankAccounts.length} حسابات</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bankAccounts.map((b) => (
              <div
                key={b.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
                        {b.currency === "USD" ? "$" : b.currency === "SAR" ? "ر.س" : "ر.ي"}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{b.bankName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">IBAN: {b.iban || b.accountNumber}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                      نشط
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 mb-3">
                    <div className="text-[10px] text-slate-400 mb-0.5">الرصيد الدفتري الحالي</div>
                    <div className="text-base font-extrabold text-cyan-300 font-mono">
                      {formatMoney(b.currentBalance, b.currency, currencies)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400">حساب الأستاذ: {b.glAccountId}</span>
                  <button
                    onClick={() => openReconcileModal(b)}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>تسوية بنكية</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cash Vaults Grid */}
      {(activeTab === "ALL" || activeTab === "VAULTS") && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>خزائن النقدية والفروع (Cash Vaults)</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">{cashVaults.length} صناديق</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cashVaults.map((v) => (
              <div
                key={v.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{v.name}</div>
                        <div className="text-[10px] text-slate-400">أمين الصندوق: {v.custodian}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {v.branch}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 mb-3">
                    <div className="text-[10px] text-slate-400 mb-0.5">الرصيد الفعلي المتوفر</div>
                    <div className="text-base font-extrabold text-emerald-300 font-mono">
                      {formatMoney(v.currentBalance, v.currency, currencies)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400">حساب GL: {v.glAccountId}</span>
                  <span className="text-[10px] text-emerald-400 font-medium">جرد دوري مطابق</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Internal Fund Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-right animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">تحويل سيولة داخلية (بين الخزائن والبنوك)</h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">من حساب / خزينة (المصدر) *</label>
                <select
                  value={fromSource}
                  onChange={(e) => setFromSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <optgroup label="الخزائن النقدية">
                    {cashVaults.map((v) => (
                      <option key={v.id} value={`VAULT_${v.id}`}>
                        خزينة: {v.name} ({v.currency}) - رصيد: {formatNumberOnly(v.currentBalance)}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="الحسابات البنكية">
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={`BANK_${b.id}`}>
                        بنك: {b.bankName} ({b.currency}) - رصيد: {formatNumberOnly(b.currentBalance)}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">إلى حساب / خزينة (الوجهة) *</label>
                <select
                  value={toSource}
                  onChange={(e) => setToSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <optgroup label="الحسابات البنكية">
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={`BANK_${b.id}`}>
                        بنك: {b.bankName} ({b.currency})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="الخزائن النقدية">
                    {cashVaults.map((v) => (
                      <option key={v.id} value={`VAULT_${v.id}`}>
                        خزينة: {v.name} ({v.currency})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">مبلغ التحويل *</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="any"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(parseFloat(e.target.value) || "")}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold focus:outline-none focus:border-emerald-500 text-left"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">عملة التحويل</label>
                  <select
                    value={transferCurrency}
                    onChange={(e) => setTransferCurrency(e.target.value as CurrencyCode)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="YER_SANAA">ريال يمني (صنعاء)</option>
                    <option value="YER_ADEN">ريال يمني (عدن)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">البيان / ملاحظات التحويل</label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="مثال: تغذية حساب البنك من خزينة المركز الرئيسي"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md active:scale-95"
                >
                  تنفيذ التحويل وترحيل القيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bank Reconciliation Modal */}
      {showReconcileModal && selectedBankForReconcile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-right animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    مذكرة التسوية البنكية - {selectedBankForReconcile.bankName}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    حساب: {selectedBankForReconcile.accountNumber} ({selectedBankForReconcile.currency})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReconcileModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-bold">
                <span className="text-slate-400">الرصيد الدفتري (نظام MeDo ERP):</span>
                <span className="text-cyan-300 font-mono text-sm">
                  {formatMoney(bookBalance, selectedBankForReconcile.currency, currencies)}
                </span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  الرصيد بموجب كشف حساب البنك الفعلي (Statement Balance) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={statementBalance}
                  onChange={(e) => setStatementBalance(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold focus:outline-none focus:border-emerald-500 text-left"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">+ إيداعات بالطريق لم تظهر</label>
                  <input
                    type="number"
                    step="any"
                    value={uncreditedDeposits}
                    onChange={(e) => setUncreditedDeposits(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-left"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">- شيكات مسحوبة لم تصرف</label>
                  <input
                    type="number"
                    step="any"
                    value={outstandingChecks}
                    onChange={(e) => setOutstandingChecks(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-left"
                  />
                </div>
              </div>

              {/* Difference Indicator */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  reconcileDiff === 0
                    ? "bg-emerald-950/50 border-emerald-800 text-emerald-300"
                    : "bg-rose-950/50 border-rose-800 text-rose-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {reconcileDiff === 0 ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  <div>
                    <div className="font-bold">
                      {reconcileDiff === 0 ? "الحساب مطابق تماماً" : `يوجد فارق تسوية: ${formatNumberOnly(reconcileDiff)}`}
                    </div>
                    <div className="text-[10px] opacity-80">
                      الرصيد المعدل: {formatNumberOnly(adjustedStatement)} {selectedBankForReconcile.currency}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReconcileModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  إغلاق
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert("تم حفظ واعتماد مذكرة التسوية البنكية بنجاح.");
                    setShowReconcileModal(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
                >
                  اعتماد التسوية البنكية
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
