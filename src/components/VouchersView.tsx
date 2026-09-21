import React, { useState, useMemo } from "react";
import {
  ReceiptText,
  Plus,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  Landmark,
  Wallet,
  CheckCircle2,
  Calendar,
  Layers,
  Share2,
} from "lucide-react";
import { FormNavigationBar } from "./FormNavigationBar";
import {
  Account,
  BankAccountItem,
  CashVaultItem,
  CostCenter,
  CurrencyCode,
  CurrencyInfo,
  Voucher,
  Customer,
  Vendor,
} from "../types/erp";
import { formatMoney, formatNumberOnly } from "../services/erpStorage";
import { formatDate, formatDualDate } from "../utils/formatters";
import {
  QuickAddAccountModal,
  QuickAddCustomerModal,
  QuickAddVendorModal,
} from "./QuickAddModals";
import { ColumnCustomizer, useColumnVisibility, ColumnDef } from "./ColumnCustomizer";
import { Combobox, ComboboxOption } from "./Combobox";

interface VouchersViewProps {
  vouchers: Voucher[];
  accounts: Account[];
  bankAccounts: BankAccountItem[];
  cashVaults: CashVaultItem[];
  costCenters: CostCenter[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  customers?: Customer[];
  vendors?: Vendor[];
  onSaveVoucher: (voucher: Voucher) => void;
  onAddAccount?: (account: Account) => void;
  onAddCustomer?: (customer: Customer) => void;
  onAddVendor?: (vendor: Vendor) => void;
  onPrintDocument: (docType: "RECEIPT" | "PAYMENT", data: any) => void;
  onShareDocument?: (data: any) => void;
}

export const VouchersView: React.FC<VouchersViewProps> = ({
  vouchers,
  accounts,
  bankAccounts,
  cashVaults,
  costCenters,
  currencies,
  displayCurrency,
  customers = [],
  vendors = [],
  onSaveVoucher,
  onAddAccount,
  onAddCustomer,
  onAddVendor,
  onPrintDocument,
  onShareDocument,
}) => {
  const [voucherTypeTab, setVoucherTypeTab] = useState<"ALL" | "RECEIPT" | "PAYMENT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const VOUCHER_COLUMNS: ColumnDef[] = [
    { id: "voucherNumber", label: "رقم السند", locked: true },
    { id: "type", label: "النوع" },
    { id: "date", label: "التاريخ" },
    { id: "party", label: "المستفيد / المسلّم منه" },
    { id: "paymentMethod", label: "طريقة الدفع" },
    { id: "amount", label: "المبلغ" },
    { id: "notes", label: "البيان" },
    { id: "actions", label: "الإجراءات", locked: true },
  ];
  const { visibleColumns, updateVisibility, isVisible } = useColumnVisibility("vouchers_list", VOUCHER_COLUMNS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<"RECEIPT" | "PAYMENT">("RECEIPT");

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [beneficiaryOrPayer, setBeneficiaryOrPayer] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [currency, setCurrency] = useState<CurrencyCode>("YER_SANAA");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER" | "CHECK">("CASH");
  const [sourceAccountId, setSourceAccountId] = useState(cashVaults[0]?.glAccountId || "110101");
  const [destinationAccountId, setDestinationAccountId] = useState("110301");
  const [costCenterId, setCostCenterId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [checkNumber, setCheckNumber] = useState("");
  const [checkDate, setCheckDate] = useState("");
  const [bankName, setBankName] = useState("");
  const [notes, setNotes] = useState("");
  const [showQuickAddAccount, setShowQuickAddAccount] = useState(false);
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);
  const [showQuickAddVendor, setShowQuickAddVendor] = useState(false);

  const nonHeaderAccounts = accounts.filter((a) => !a.isHeader);

  // Prepare Options for Searchable Selects
  const sourceAccountOptions: ComboboxOption[] = useMemo(() => {
    const opts: ComboboxOption[] = [];
    cashVaults.forEach(v => {
      opts.push({ id: v.glAccountId, label: v.name, secondaryLabel: `خزينة | ${v.currency}` });
    });
    bankAccounts.forEach(b => {
      opts.push({ id: b.glAccountId, label: `${b.bankName} - ${b.accountNumber}`, secondaryLabel: `بنك | ${b.currency}` });
    });
    return opts;
  }, [cashVaults, bankAccounts]);

  const destinationAccountOptions: ComboboxOption[] = useMemo(() => {
    return nonHeaderAccounts.map(a => ({
      id: a.id,
      label: a.nameAr,
      secondaryLabel: a.code
    }));
  }, [nonHeaderAccounts]);

  const openCreateModal = (typeToCreate: "RECEIPT" | "PAYMENT") => {
    setCreateType(typeToCreate);
    if (typeToCreate === "RECEIPT") {
      setDestinationAccountId("110301"); // العملاء
    } else {
      setDestinationAccountId("5201"); // الرواتب أو المصروفات
    }
    setShowCreateModal(true);
  };

  const handleSaveVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0 || !beneficiaryOrPayer.trim()) {
      alert("يرجى إدخال المبلغ واسم المستفيد / المستلم");
      return;
    }

    const prefix = createType === "RECEIPT" ? "RV" : "PV";
    const nextNum = `${prefix}-2026-${(vouchers.length + 1).toString().padStart(4, "0")}`;

    const newVoucher: Voucher = {
      id: `vch-${Date.now()}`,
      voucherNumber: nextNum,
      type: createType,
      date,
      beneficiaryOrPayer,
      amount: Number(amount),
      currency,
      exchangeRate: 1,
      localAmount: Number(amount),
      paymentMethod,
      sourceAccountId,
      destinationAccountId,
      costCenterId: costCenterId || undefined,
      referenceNumber: referenceNumber || undefined,
      checkNumber: checkNumber || undefined,
      checkDate: checkDate || undefined,
      bankName: bankName || undefined,
      notes: notes || (createType === "RECEIPT" ? `استلام من ${beneficiaryOrPayer}` : `صرف لـ ${beneficiaryOrPayer}`),
      status: "POSTED",
      createdByName: "أ. محمد عبد الرقيب",
    };

    onSaveVoucher(newVoucher);
    setShowCreateModal(false);
    // Reset
    setAmount("");
    setBeneficiaryOrPayer("");
    setNotes("");
    setReferenceNumber("");
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (voucherTypeTab !== "ALL" && v.type !== voucherTypeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.voucherNumber.toLowerCase().includes(q) ||
        v.beneficiaryOrPayer.toLowerCase().includes(q) ||
        v.notes.toLowerCase().includes(q)
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
            <ReceiptText className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">إدارة سندات القبض والصرف (Vouchers & Receipts)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            توثيق المقبوضات والمدفوعات النقدية والمصرفية والشيكات مع توليد قيود اليومية آلياً
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openCreateModal("RECEIPT")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>سند قبض جديد</span>
          </button>
          <button
            onClick={() => openCreateModal("PAYMENT")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>سند صرف جديد</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          {[
            { id: "ALL", label: "كافة السندات" },
            { id: "RECEIPT", label: "سندات القبض (Receipts)" },
            { id: "PAYMENT", label: "سندات الصرف (Payments)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setVoucherTypeTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                voucherTypeTab === tab.id
                  ? "bg-emerald-600 text-white font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ColumnCustomizer
            tableKey="vouchers_list"
            columns={VOUCHER_COLUMNS}
            visibleColumns={visibleColumns}
            onChange={updateVisibility}
          />
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث برقم السند أو المستفيد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Mobile Card List (Mobile-First UI) */}
      <div className="block lg:hidden space-y-3">
        {filteredVouchers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-medium bg-slate-900 border border-slate-700 rounded-2xl">
            لا توجد سندات مسجلة
          </div>
        ) : (
          filteredVouchers.map((vch) => {
            const isReceipt = vch.type === "RECEIPT";

            return (
              <div
                key={`mob-vch-${vch.id}`}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-sm text-emerald-400">
                    📜 {vch.voucherNumber}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      isReceipt
                        ? "bg-blue-950 text-blue-300 border border-blue-600"
                        : "bg-amber-950 text-amber-300 border border-amber-600"
                    }`}
                  >
                    {isReceipt ? "سند قبض (Receipt)" : "سند صرف (Payment)"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">الطرف:</span>
                    <span className="font-bold text-slate-200 truncate max-w-[200px]">
                      {vch.partyName || "جهة غير محددة"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">التاريخ:</span>
                    <span className="font-mono text-slate-300" title={formatDualDate(vch.date)}>
                      {formatDate(vch.date)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">طريقة الدفع:</span>
                    <span className="text-slate-300">
                      {vch.paymentMethod === "CASH"
                        ? "نقداً من الخزينة"
                        : vch.paymentMethod === "BANK_TRANSFER"
                        ? "تحويل بنكي"
                        : "شيك"}
                    </span>
                  </div>

                  {vch.description && (
                    <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-800/60">
                      <span className="text-slate-400">البيان:</span>
                      <span className="text-slate-300 text-left line-clamp-1">{vch.description}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">مبلغ السند:</span>
                      <span
                        className={`text-base font-mono font-black ${
                          isReceipt ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {formatMoney(vch.amount, vch.currency, currencies)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => onPrintDocument(vch.type, vch)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 active:scale-95 transition-all min-h-[44px]"
                  >
                    <Printer className="w-4 h-4 text-emerald-400" />
                    <span>طباعة السند</span>
                  </button>

                  {onShareDocument && (
                    <button
                      onClick={() =>
                        onShareDocument({
                          type: "VOUCHER",
                          data: vch,
                          recipientName: vch.partyName,
                        })
                      }
                      className="w-11 h-11 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/80 flex items-center justify-center active:scale-95 transition-all flex-shrink-0"
                      title="مشاركة"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Vouchers Table (Desktop) */}
      <div className="hidden lg:block bg-slate-900 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-slate-200">
            <thead>
              <tr className="text-white border-b-2 border-slate-700 bg-slate-950 font-bold">
                {isVisible("voucherNumber") && <th className="py-4 px-4 font-extrabold text-xs text-white">رقم السند</th>}
                {isVisible("type") && <th className="py-4 px-4 font-extrabold text-xs text-white">النوع</th>}
                {isVisible("date") && <th className="py-4 px-4 font-extrabold text-xs text-white">التاريخ</th>}
                {isVisible("party") && <th className="py-4 px-4 font-extrabold text-xs text-white">المستفيد / المسلّم منه</th>}
                {isVisible("paymentMethod") && <th className="py-4 px-4 font-extrabold text-xs text-white">طريقة الدفع</th>}
                {isVisible("amount") && <th className="py-4 px-4 font-extrabold text-xs text-white text-left">المبلغ</th>}
                {isVisible("notes") && <th className="py-4 px-4 font-extrabold text-xs text-white">البيان</th>}
                {isVisible("actions") && <th className="py-4 px-4 font-extrabold text-xs text-white text-center">الإجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/80">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={VOUCHER_COLUMNS.filter((c) => isVisible(c.id)).length} className="py-12 text-center text-slate-400 font-medium">
                    لا توجد سندات مسجلة
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((vch) => {
                  const isReceipt = vch.type === "RECEIPT";
                  return (
                    <tr key={vch.id} className="hover:bg-slate-800/60 transition-colors">
                      {isVisible("voucherNumber") && <td className="py-4 px-4 font-mono font-black text-emerald-400 text-sm">{vch.voucherNumber}</td>}
                      {isVisible("type") && (
                        <td className="py-4 px-4">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1 w-fit ${
                              isReceipt
                                ? "bg-blue-950 text-blue-300 border border-blue-600"
                                : "bg-amber-950 text-amber-300 border border-amber-600"
                            }`}
                          >
                            {isReceipt ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                            <span>{isReceipt ? "قبض" : "صرف"}</span>
                          </span>
                        </td>
                      )}
                      {isVisible("date") && (
                        <td className="py-4 px-4 text-slate-200 font-medium" title={formatDualDate(vch.date)}>
                          {formatDate(vch.date)}
                        </td>
                      )}
                      {isVisible("party") && <td className="py-4 px-4 text-slate-100 font-bold max-w-xs truncate text-sm">{vch.beneficiaryOrPayer}</td>}
                      {isVisible("paymentMethod") && (
                        <td className="py-4 px-4">
                          <span className="text-xs text-slate-200 font-semibold">
                            {vch.paymentMethod === "CASH"
                              ? "نقداً (خزينة)"
                              : vch.paymentMethod === "BANK_TRANSFER"
                              ? "تحويل بنكي"
                              : "شيك بنكي"}
                          </span>
                          {vch.checkNumber && (
                            <div className="text-xs text-slate-400 font-mono mt-0.5">شيك: {vch.checkNumber}</div>
                          )}
                        </td>
                      )}
                      {isVisible("amount") && (
                        <td className="py-4 px-4 text-left font-mono font-black text-base">
                          <span className={isReceipt ? "text-emerald-400" : "text-amber-400"}>
                            {isReceipt ? "+" : "-"}{formatMoney(vch.amount, vch.currency, currencies)}
                          </span>
                        </td>
                      )}
                      {isVisible("notes") && <td className="py-3.5 px-4 text-slate-300 text-[11px] max-w-xs truncate">{vch.notes}</td>}
                      {isVisible("actions") && (
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {onShareDocument && (
                              <button
                                onClick={() =>
                                  onShareDocument({
                                    type: isReceipt ? "RECEIPT" : "PAYMENT",
                                    data: vch,
                                    recipientName: vch.beneficiaryOrPayer,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-800 hover:text-white transition-colors"
                                title="مشاركة السند عبر واتساب / SMS"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onPrintDocument(vch.type, vch)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
                              title="طباعة السند"
                            >
                              <Printer className="w-3.5 h-3.5 text-emerald-400" />
                              <span>طباعة</span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Voucher Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-4 text-right animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <FormNavigationBar
              title={createType === "RECEIPT" ? "إنشاء سند قبض مالي جديد (Receipt Voucher)" : "إنشاء سند صرف مالي جديد (Payment Voucher)"}
              onBack={() => setShowCreateModal(false)}
              onSave={() => {
                // Trigger form submission
                const formEl = document.getElementById("voucher-create-form") as HTMLFormElement;
                if (formEl) formEl.requestSubmit();
              }}
              onSaveAndPrint={() => {
                const formEl = document.getElementById("voucher-create-form") as HTMLFormElement;
                if (formEl) formEl.requestSubmit();
              }}
              onSaveAndNew={() => {
                const formEl = document.getElementById("voucher-create-form") as HTMLFormElement;
                if (formEl) formEl.requestSubmit();
              }}
              hasUnsavedChanges={Boolean(amount || beneficiaryOrPayer.trim() || notes.trim())}
            />

            <div className="p-6">
              <form id="voucher-create-form" onSubmit={handleSaveVoucher} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">تاريخ السند *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">طريقة الدفع / التحصيل</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CASH">نقداً من الخزينة</option>
                    <option value="BANK_TRANSFER">تحويل بنكي / إيداع</option>
                    <option value="CHECK">شيك مصرفي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">العملة</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="YER_SANAA">ريال يمني (صنعاء)</option>
                    <option value="YER_ADEN">ريال يمني (عدن)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-400 font-semibold">
                      {createType === "RECEIPT" ? "استلمنا من السيد / الجهة *" : "يصرف إلى السيد / الجهة *"}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (createType === "RECEIPT") {
                          setShowQuickAddCustomer(true);
                        } else {
                          setShowQuickAddVendor(true);
                        }
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 transition-all"
                      title="إضافة عميل أو مورد جديد لم يكن مسجلاً"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{createType === "RECEIPT" ? "إضافة عميل (+)" : "إضافة مورد (+)"}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      value={beneficiaryOrPayer}
                      onChange={(e) => setBeneficiaryOrPayer(e.target.value)}
                      placeholder="اسم العميل، المورد، الموظف، أو الجهة المستفيدة"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (createType === "RECEIPT") {
                          setShowQuickAddCustomer(true);
                        } else {
                          setShowQuickAddVendor(true);
                        }
                      }}
                      className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center"
                      title="إضافة عميل أو مورد جديد (+)"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">المبلغ الإجمالي *</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || "")}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500 text-left"
                  />
                </div>
              </div>

              {/* Source (Vault/Bank) vs Destination (Account) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    {createType === "RECEIPT" ? "حساب الخزينة / البنك المودع فيه *" : "حساب الخزينة / البنك المسحوب منه *"}
                  </label>
                  <Combobox
                    options={sourceAccountOptions}
                    value={sourceAccountId}
                    onChange={(val) => setSourceAccountId(val)}
                    placeholder="ابحث عن خزينة أو بنك..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-400 font-semibold">الحساب المقابل في الدليل المحاسبي *</label>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddAccount(true)}
                      className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 transition-all"
                      title="إضافة حساب أو بند مصروف جديد بالدليل"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة حساب/مصروف</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Combobox
                      options={destinationAccountOptions}
                      value={destinationAccountId}
                      onChange={(val) => setDestinationAccountId(val)}
                      placeholder="ابحث عن حساب..."
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setShowQuickAddAccount(true)}
                      className="p-2 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center"
                      title="إضافة حساب أو بند مصروف جديد (+)"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Check details if check */}
              {paymentMethod === "CHECK" && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">رقم الشيك</label>
                    <input
                      type="text"
                      value={checkNumber}
                      onChange={(e) => setCheckNumber(e.target.value)}
                      placeholder="CHK-123456"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">تاريخ استحقاق الشيك</label>
                    <input
                      type="date"
                      value={checkDate}
                      onChange={(e) => setCheckDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">البنك المسحوب عليه</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="اسم البنك"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">وذلك مقابل / البيان التفصيلي *</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="شرح سبب الصرف أو القبض، رقم الفاتورة، أو الشحنة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 ${
                    createType === "RECEIPT"
                      ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
                      : "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ وترحيل السند</span>
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Quick Add Account / Expense */}
      <QuickAddAccountModal
        isOpen={showQuickAddAccount}
        onClose={() => setShowQuickAddAccount(false)}
        currencies={currencies}
        existingAccounts={accounts}
        defaultType={createType === "RECEIPT" ? "REVENUE" : "EXPENSE"}
        title={createType === "RECEIPT" ? "إضافة حساب مقبوضات / إيراد جديد بالدليل" : "إضافة بند مصروف / حساب جديد بالدليل"}
        onAccountCreated={(newAcc) => {
          onAddAccount?.(newAcc);
          setDestinationAccountId(newAcc.id);
          if (!beneficiaryOrPayer.trim()) {
            setBeneficiaryOrPayer(newAcc.nameAr);
          }
        }}
      />

      {/* Modal: Quick Add Customer (Receipt Beneficiary) */}
      <QuickAddCustomerModal
        isOpen={showQuickAddCustomer}
        onClose={() => setShowQuickAddCustomer(false)}
        currencies={currencies}
        existingCustomers={customers}
        onCustomerCreated={(newCust) => {
          onAddCustomer?.(newCust);
          setBeneficiaryOrPayer(newCust.nameAr);
          setDestinationAccountId("110301"); // ذمم مدينة / عملاء
        }}
      />

      {/* Modal: Quick Add Vendor (Payment Beneficiary) */}
      <QuickAddVendorModal
        isOpen={showQuickAddVendor}
        onClose={() => setShowQuickAddVendor(false)}
        currencies={currencies}
        existingVendors={vendors}
        onVendorCreated={(newVend) => {
          onAddVendor?.(newVend);
          setBeneficiaryOrPayer(newVend.nameAr);
          setDestinationAccountId("210101"); // ذمم دائنة / موردين
        }}
      />
    </div>
  );
};
