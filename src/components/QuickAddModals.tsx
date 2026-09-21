import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Users,
  Building2,
  Package,
  BookOpen,
  DollarSign,
  Phone,
  MapPin,
  Barcode,
  Layers,
  CheckCircle2,
  FileText,
  ShieldAlert,
} from "lucide-react";
import {
  Account,
  Customer,
  Vendor,
  InventoryItem,
  CurrencyCode,
  CurrencyInfo,
  AccountCategory,
  AccountNature,
} from "../types/erp";

// ==========================================
// 1. Quick Add Customer Modal (إضافة عميل سريع)
// ==========================================
interface QuickAddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencies: CurrencyInfo[];
  existingCustomers: Customer[];
  onCustomerCreated: (customer: Customer) => void;
}

export const QuickAddCustomerModal: React.FC<QuickAddCustomerModalProps> = ({
  isOpen,
  onClose,
  currencies,
  existingCustomers,
  onCustomerCreated,
}) => {
  const [nameAr, setNameAr] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("صنعاء");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("YER_SANAA");
  const [creditLimit, setCreditLimit] = useState<number>(1000000);
  const [taxNumber, setTaxNumber] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) return;

    const nextNumber = existingCustomers.length + 1;
    const code = `CUST-${nextNumber.toString().padStart(4, "0")}`;
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      code,
      nameAr: nameAr.trim(),
      nameEn: nameAr.trim(),
      phone: phone.trim() || "غير مسجل",
      city: city || "صنعاء",
      address: address.trim(),
      currency,
      creditLimit: Number(creditLimit) || 0,
      currentBalance: 0,
      glAccountId: "110301", // مدينون تجاريون
      taxNumber: taxNumber.trim(),
      status: "ACTIVE",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onCustomerCreated(newCustomer);
    onClose();
    setNameAr("");
    setPhone("");
    setAddress("");
    setTaxNumber("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 px-5 py-4 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="block text-white text-base">إضافة عميل جديد فوري</span>
              <span className="text-[11px] text-emerald-400 font-normal">تسجيل العميل وحفظه مباشرة في الفاتورة والدليل</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              اسم العميل / المؤسسة <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: مؤسسة الأمل للمقاولات / عادل الشميري"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                رقم الهاتف / واتساب <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="77XXXXXXX أو 73XXXXXXX"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-left"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">المدينة</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="صنعاء">صنعاء</option>
                <option value="عدن">عدن</option>
                <option value="تعز">تعز</option>
                <option value="الحديدة">الحديدة</option>
                <option value="إب">إب</option>
                <option value="ذمار">ذمار</option>
                <option value="مأرب">مأرب</option>
                <option value="حضرموت">حضرموت</option>
                <option value="أخرى">محافظة أخرى</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">العملة الافتراضية</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">سقف الائتمان المسموح</label>
              <input
                type="number"
                min="0"
                value={creditLimit}
                onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">العنوان / المنطقة</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="الشارع أو الحي..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">الرقم الضريبي (إن وجد)</label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="اختياري"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/30 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة واختيار العميل</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. Quick Add Vendor / Creditor Modal (إضافة مورد أو داين)
// ==========================================
interface QuickAddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencies: CurrencyInfo[];
  existingVendors: Vendor[];
  onVendorCreated: (vendor: Vendor) => void;
}

export const QuickAddVendorModal: React.FC<QuickAddVendorModalProps> = ({
  isOpen,
  onClose,
  currencies,
  existingVendors,
  onVendorCreated,
}) => {
  const [nameAr, setNameAr] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("صنعاء");
  const [category, setCategory] = useState("مواد بناء وأسمنت");
  const [currency, setCurrency] = useState<CurrencyCode>("YER_SANAA");
  const [address, setAddress] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) return;

    const nextNumber = existingVendors.length + 1;
    const code = `VEND-${nextNumber.toString().padStart(4, "0")}`;
    const newVendor: Vendor = {
      id: `vend-${Date.now()}`,
      code,
      nameAr: nameAr.trim(),
      nameEn: nameAr.trim(),
      phone: phone.trim() || "غير مسجل",
      city: city || "صنعاء",
      address: address.trim() || companyName.trim(),
      currency,
      currentBalance: 0,
      glAccountId: "210101", // دائنون وموردون تجاريون
      category,
      status: "ACTIVE",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onVendorCreated(newVendor);
    onClose();
    setNameAr("");
    setCompanyName("");
    setPhone("");
    setAddress("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="bg-slate-900 border border-blue-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-blue-950/80 to-slate-900 px-5 py-4 border-b border-blue-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-blue-400 font-bold text-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <span className="block text-white text-base">إضافة مورد / داين جديد</span>
              <span className="text-[11px] text-blue-400 font-normal">تسجيل حساب المورد أو الدائن واعتماده في فاتورة المشتريات</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              اسم المورد / الداين <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: شركة الرويشان للتجارة / الحاج قائد عبد الله"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">اسم المؤسسة / المعرض</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="المصنع أو المعرض..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                رقم الهاتف / واتساب <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="77XXXXXXX أو 71XXXXXXX"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-left"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">نشاط / تصنيف المورد</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="مواد بناء وأسمنت">مواد بناء وأسمنت</option>
                <option value="حديد وصلب وتسليح">حديد وصلب وتسليح</option>
                <option value="أسمدة ومبيدات زراعية">أسمدة ومبيدات زراعية</option>
                <option value="شبكات ري وأنابيب">شبكات ري وأنابيب</option>
                <option value="معدات وأدوات عامة">معدات وأدوات عامة</option>
                <option value="خدمات ونقليات">خدمات ونقليات</option>
                <option value="داين / التزام مالي">داين / التزام مالي عام</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">العملة المعتمدة</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">المدينة</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="صنعاء">صنعاء</option>
                <option value="الحديدة">الحديدة</option>
                <option value="عدن">عدن</option>
                <option value="تعز">تعز</option>
                <option value="ذمار">ذمار</option>
                <option value="عمران">عمران</option>
                <option value="مأرب">مأرب</option>
                <option value="خارجي / استيراد">خارجي / استيراد</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">العنوان / الملاحظات</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="الشارع أو المحل..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-900/30 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة واختيار المورد / الداين</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. Quick Add Inventory Item Modal (إضافة صنف مخزون فوري)
// ==========================================
interface QuickAddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencies: CurrencyInfo[];
  existingItems?: InventoryItem[];
  onItemCreated: (item: InventoryItem) => void;
  defaultCategory?: string;
}

export const QuickAddItemModal: React.FC<QuickAddItemModalProps> = ({
  isOpen,
  onClose,
  currencies,
  existingItems = [],
  onItemCreated,
  defaultCategory = "مواد بناء وأسمنت",
}) => {
  const [nameAr, setNameAr] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [unit, setUnit] = useState("كيس");
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [quantityOnHand, setQuantityOnHand] = useState<number>(0);
  const [minStockThreshold, setMinStockThreshold] = useState<number>(10);
  const [warehouseLocation, setWarehouseLocation] = useState("المستودع الرئيسي - صنعاء");
  const [currency, setCurrency] = useState<CurrencyCode>("YER_SANAA");

  useEffect(() => {
    if (isOpen) {
      // Auto suggest SKU
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      setCode(`SKU-${randomPart}`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) return;

    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      code: code.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      nameAr: nameAr.trim(),
      nameEn: nameAr.trim(),
      category: category || "مواد بناء وأسمنت",
      unit: unit || "كيس",
      purchasePrice: Number(purchasePrice) || Number(costPrice) || 0,
      costPrice: Number(costPrice) || Number(purchasePrice) || 0,
      sellingPrice: Number(sellingPrice) || Number(costPrice) * 1.1 || 0,
      lastSellingPrice: Number(sellingPrice) || Number(costPrice) * 1.1 || 0,
      quantityOnHand: Number(quantityOnHand) || 0,
      minStockThreshold: Number(minStockThreshold) || 5,
      currency,
      warehouseLocation: warehouseLocation || "المستودع الرئيسي - صنعاء",
      totalSalesQty: 0,
      totalReturnsQty: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onItemCreated(newItem);
    onClose();
    setNameAr("");
    setPurchasePrice(0);
    setCostPrice(0);
    setSellingPrice(0);
    setQuantityOnHand(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 px-5 py-4 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Package className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="block text-white text-base">إضافة صنف جديد للمخزون فورا</span>
              <span className="text-[11px] text-emerald-400 font-normal">تسجيل الصنف في بطاقة الأصناف وربطه تلقائياً بالفاتورة</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              اسم الصنف والمواصفات <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: أسمنت الوطنية بورتلاندي 50كجم / حديد 14ملم سابك / سماد يوريا 46%"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">كود الصنف / SKU</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">التصنيف الرئيسي</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="مواد بناء وأسمنت">مواد بناء وأسمنت</option>
                <option value="حديد وصلب وتسليح">حديد وصلب وتسليح</option>
                <option value="أسمدة ومخصبات زراعية">أسمدة ومخصبات زراعية</option>
                <option value="مبيدات وبذور زراعية">مبيدات وبذور زراعية</option>
                <option value="شبكات ري وليات تقطير">شبكات ري وليات تقطير</option>
                <option value="أدوات ومعدات وسباكة">أدوات ومعدات وسباكة</option>
                <option value="أصناف عامة">أصناف عامة</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">وحدة القياس</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="كيس">كيس (Bag)</option>
                <option value="طن">طن (Ton)</option>
                <option value="حبة / قطعة">حبة / قطعة</option>
                <option value="كرتون">كرتون (Box)</option>
                <option value="لتر">لتر (Liter)</option>
                <option value="لفة">لفة (Roll)</option>
                <option value="متر">متر (Meter)</option>
                <option value="برميل">برميل (Drum)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                سعر الشراء <span className="text-[10px] text-blue-400">(من المورد)</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={purchasePrice || ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setPurchasePrice(val);
                  if (!costPrice) setCostPrice(val);
                }}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500 text-left"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                سعر التكلفة <span className="text-[10px] text-amber-400">(المخزنية)</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={costPrice || ""}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500 text-left"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                سعر البيع المعتمد <span className="text-[10px] text-emerald-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={sellingPrice || ""}
                onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-500 text-left"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">الرصيد الأولي بالمخزن</label>
              <input
                type="number"
                min="0"
                value={quantityOnHand}
                onChange={(e) => setQuantityOnHand(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500 text-center"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">حد إعادة الطلب</label>
              <input
                type="number"
                min="0"
                value={minStockThreshold}
                onChange={(e) => setMinStockThreshold(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500 text-center"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">العملة</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">مستودع التخزين الافتراضي</label>
            <input
              type="text"
              value={warehouseLocation}
              onChange={(e) => setWarehouseLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/30 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>حفظ الصنف وإدراجه</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. Quick Add Account / Expense Modal (إضافة بند مصروف أو حساب في الدليل)
// ==========================================
interface QuickAddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencies: CurrencyInfo[];
  existingAccounts: Account[];
  onAccountCreated: (account: Account) => void;
  defaultType?: "EXPENSE" | "REVENUE" | "LIABILITY" | "ASSET";
  title?: string;
}

export const QuickAddAccountModal: React.FC<QuickAddAccountModalProps> = ({
  isOpen,
  onClose,
  currencies,
  existingAccounts,
  onAccountCreated,
  defaultType = "EXPENSE",
  title = "إضافة بند مصروف / حساب جديد بالدليل",
}) => {
  const [nameAr, setNameAr] = useState("");
  const [category, setCategory] = useState<AccountCategory>(defaultType === "REVENUE" ? "REVENUE" : defaultType === "LIABILITY" ? "LIABILITY" : "EXPENSE");
  const [parentCode, setParentCode] = useState(defaultType === "REVENUE" ? "4101" : defaultType === "LIABILITY" ? "2101" : "5200");
  const [code, setCode] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("YER_SANAA");
  const [description, setDescription] = useState("");

  // Calculate next account code suggestion
  useEffect(() => {
    if (isOpen) {
      const pCode = category === "EXPENSE" ? "520" : category === "REVENUE" ? "410" : category === "LIABILITY" ? "210" : "110";
      const related = existingAccounts.filter((a) => a.code.startsWith(pCode));
      let nextNum = related.length + 1;
      let calculatedCode = `${pCode}${nextNum.toString().padStart(2, "0")}`;
      // ensure uniqueness
      while (existingAccounts.some((a) => a.code === calculatedCode)) {
        nextNum++;
        calculatedCode = `${pCode}${nextNum.toString().padStart(2, "0")}`;
      }
      setCode(calculatedCode);
      setParentCode(`${pCode}0`);
    }
  }, [isOpen, category, existingAccounts]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) return;

    const nature: AccountNature = category === "REVENUE" || category === "LIABILITY" ? "CREDIT" : "DEBIT";

    const newAccount: Account = {
      id: code.trim(),
      code: code.trim(),
      nameAr: nameAr.trim(),
      nameEn: nameAr.trim(),
      category,
      nature,
      level: 4,
      parentId: parentCode,
      isHeader: false,
      currency,
      currentBalance: 0,
      balanceDebit: 0,
      balanceCredit: 0,
      description: description.trim() || `حساب مضاف مباشرة: ${nameAr.trim()}`,
      costCenterRequired: category === "EXPENSE",
    };

    onAccountCreated(newAccount);
    onClose();
    setNameAr("");
    setDescription("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-amber-950/80 to-slate-900 px-5 py-4 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="block text-white text-base">{title}</span>
              <span className="text-[11px] text-amber-400 font-normal">إنشاء الحساب في شجرة الحسابات العامة واختياره فوراً</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              اسم بند المصروف / الحساب <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: مصاريف صيانة شاحنات ونقل بضائع / إيجار مخازن الحديد"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">نوع وتبويب الحساب</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AccountCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="EXPENSE">مصروفات عمومية وتشغيلية (مدين)</option>
                <option value="REVENUE">إيرادات ومبيعات أخرى (دائن)</option>
                <option value="LIABILITY">التزامات ودائنون آخرون (دائن)</option>
                <option value="ASSET">أصول وأمانات نقدية (مدين)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">رمز / كود الحساب المقترح</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500 text-left"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">العملة</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">طبيعة الحساب المحاسبية</label>
              <input
                type="text"
                readOnly
                value={category === "EXPENSE" || category === "ASSET" ? "مدين (Debit)" : "دائن (Credit)"}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-semibold cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">ملاحظات / وصف الحساب</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف طبيعة الصرف أو الحركة المالية..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-900/30 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة واعتماد الحساب</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
