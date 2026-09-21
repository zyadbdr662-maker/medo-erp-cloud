import React, { useState, useRef, useMemo } from "react";
import {
  Package,
  Upload,
  Download,
  AlertTriangle,
  AlertOctagon,
  History,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Printer,
  Edit,
  Trash2,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  XCircle,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Layers,
  Building,
  Tag,
  DollarSign,
  Barcode,
  HelpCircle,
  CheckSquare,
  Square,
  AlertCircle,
} from "lucide-react";
import {
  CurrencyCode,
  CurrencyInfo,
  InventoryItem,
  StockMovement,
  StockMovementType,
  JournalEntry,
} from "../types/erp";
import { convertCurrency, formatMoney, formatNumberOnly } from "../services/erpStorage";
import { InventoryMovementsTab } from "./InventoryMovementsTab";
import { InventoryStocktakeTab } from "./InventoryStocktakeTab";
import { ColumnCustomizer, useColumnVisibility, ColumnDef } from "./ColumnCustomizer";

interface InventoryViewProps {
  inventoryItems: InventoryItem[];
  stockMovements: StockMovement[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  onAddInventoryItem: (item: InventoryItem) => void;
  onUpdateInventoryItem: (item: InventoryItem) => void;
  onDeleteInventoryItem: (id: string) => void;
  onBulkDeleteInventoryItems?: (ids: string[]) => void;
  onClearAllInventoryItems?: (warehouse?: string) => void;
  onImportInventoryItems: (items: InventoryItem[]) => void;
  onAddStockMovement: (movement: StockMovement, updatedItemQty?: number) => void;
  onSaveJournalEntry?: (entry: JournalEntry) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventoryItems: rawInventoryItems = [],
  stockMovements: rawStockMovements = [],
  currencies = [],
  displayCurrency = "YER_SANAA",
  onAddInventoryItem,
  onUpdateInventoryItem,
  onDeleteInventoryItem,
  onBulkDeleteInventoryItems,
  onClearAllInventoryItems,
  onImportInventoryItems,
  onAddStockMovement,
  onSaveJournalEntry,
}) => {
  const inventoryItems = Array.isArray(rawInventoryItems) ? rawInventoryItems.filter(Boolean) : [];
  const stockMovements = Array.isArray(rawStockMovements) ? rawStockMovements.filter(Boolean) : [];

  const [activeTab, setActiveTab] = useState<"ITEMS" | "MOVEMENTS" | "STOCKTAKE">("ITEMS");
  
  const INVENTORY_COLUMNS: ColumnDef[] = [
    { id: "code", label: "كود الصنف / SKU", locked: true },
    { id: "nameAr", label: "بيانات الصنف والباركود" },
    { id: "category", label: "الفئة والمستودع" },
    { id: "quantity", label: "الكمية المتوفرة / الحد الأدنى" },
    { id: "status", label: "حالة المخزون" },
    { id: "costPrice", label: "سعر التكلفة" },
    { id: "sellingPrice", label: "سعر البيع / الهامش" },
    { id: "salesReturns", label: "المبيعات / المرتجعات" },
    { id: "actions", label: "الإجراءات", locked: true },
  ];
  const { visibleColumns, updateVisibility, isVisible } = useColumnVisibility("inventory_items", INVENTORY_COLUMNS);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("ALL");
  const [stockStatusFilter, setStockStatusFilter] = useState<"ALL" | "OUT_OF_STOCK" | "LOW_STOCK" | "WITH_RETURNS">("ALL");

  // Selection and Clear/Delete States
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearScope, setClearScope] = useState<"SELECTED" | "ZERO_STOCK" | "WAREHOUSE" | "ALL">("SELECTED");
  const [clearConfirmText, setClearConfirmText] = useState("");
  const [clearTargetWarehouse, setClearTargetWarehouse] = useState<string>("ALL");

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<InventoryItem[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedMovementItem, setSelectedMovementItem] = useState<InventoryItem | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isNewMovementModalOpen, setIsNewMovementModalOpen] = useState(false);

  // Form State for Add/Edit Item
  const [itemFormData, setItemFormData] = useState<Partial<InventoryItem>>({
    code: "",
    nameAr: "",
    category: "أجهزة طاقة شمسية",
    unit: "قطعة",
    quantityOnHand: 10,
    minStockThreshold: 5,
    costPrice: 1000,
    sellingPrice: 1500,
    currency: displayCurrency,
    warehouseLocation: "المستودع الرئيسي",
    barcode: "",
    description: "",
  });

  // Form State for New Stock Movement
  const [movementFormData, setMovementFormData] = useState<{
    type: StockMovementType;
    quantity: number;
    unitPrice: number;
    referenceNumber: string;
    notes: string;
  }>({
    type: "PURCHASE",
    quantity: 1,
    unitPrice: 0,
    referenceNumber: `DOC-${Date.now().toString().slice(-6)}`,
    notes: "",
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;

  // Unique categories & warehouses list (Memoized)
  const categories = useMemo(() => {
    return Array.from(
      new Set(inventoryItems.map((item) => (item?.category || "عمومي").trim()))
    ).filter(Boolean);
  }, [inventoryItems]);

  const warehouses = useMemo(() => {
    return Array.from(
      new Set(inventoryItems.map((item) => (item?.warehouseLocation || "المستودع الرئيسي").trim()))
    ).filter(Boolean);
  }, [inventoryItems]);

  // Alert Counts (Memoized)
  const outOfStockItems = useMemo(() => {
    return inventoryItems.filter((item) => (item?.quantityOnHand ?? 0) <= 0);
  }, [inventoryItems]);

  const lowStockItems = useMemo(() => {
    return inventoryItems.filter(
      (item) => (item?.quantityOnHand ?? 0) > 0 && (item?.quantityOnHand ?? 0) <= (item?.minStockThreshold ?? 5)
    );
  }, [inventoryItems]);

  const returnedItems = useMemo(() => {
    return inventoryItems.filter((item) => (item?.totalReturnsQty || 0) > 0);
  }, [inventoryItems]);

  const zeroStockItems = useMemo(() => {
    return inventoryItems.filter((item) => (item?.quantityOnHand ?? 0) <= 0);
  }, [inventoryItems]);

  // Filter items safely (Memoized)
  const filteredItems = useMemo(() => {
    const searchLower = (searchTerm || "").trim().toLowerCase();
    return inventoryItems.filter((item) => {
      if (!item) return false;
      const name = (item.nameAr || "").toLowerCase();
      const code = (item.code || "").toLowerCase();
      const barcode = (item.barcode || "").toLowerCase();
      
      const matchesSearch = !searchLower || name.includes(searchLower) || code.includes(searchLower) || barcode.includes(searchLower);
      const itemCat = item.category || "عمومي";
      const itemWh = item.warehouseLocation || "المستودع الرئيسي";

      const matchesCategory = selectedCategory === "ALL" || itemCat === selectedCategory;
      const matchesWarehouse = selectedWarehouse === "ALL" || itemWh === selectedWarehouse;

      const qty = item.quantityOnHand ?? 0;
      const minThreshold = item.minStockThreshold ?? 0;
      let matchesStatus = true;
      if (stockStatusFilter === "OUT_OF_STOCK") {
        matchesStatus = qty <= 0;
      } else if (stockStatusFilter === "LOW_STOCK") {
        matchesStatus = qty > 0 && qty <= minThreshold;
      } else if (stockStatusFilter === "WITH_RETURNS") {
        matchesStatus = (item.totalReturnsQty || 0) > 0;
      }

      return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus;
    });
  }, [inventoryItems, searchTerm, selectedCategory, selectedWarehouse, stockStatusFilter]);

  // Paginated items for high performance on mobile
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedWarehouse, stockStatusFilter]);

  // Delete & Clear Handlers
  const handleConfirmSingleDelete = () => {
    if (!itemToDelete) return;
    onDeleteInventoryItem(itemToDelete.id);
    setSelectedItemIds((prev) => prev.filter((id) => id !== itemToDelete.id));
    setItemToDelete(null);
  };

  const handleExecuteClearItems = () => {
    if (clearScope === "SELECTED") {
      if (selectedItemIds.length === 0) return;
      if (onBulkDeleteInventoryItems) {
        onBulkDeleteInventoryItems(selectedItemIds);
      } else {
        selectedItemIds.forEach((id) => onDeleteInventoryItem(id));
      }
      setSelectedItemIds([]);
      setIsClearModalOpen(false);
    } else if (clearScope === "ZERO_STOCK") {
      const zeroIds = zeroStockItems.map((it) => it.id);
      if (zeroIds.length === 0) {
        setIsClearModalOpen(false);
        return;
      }
      if (onBulkDeleteInventoryItems) {
        onBulkDeleteInventoryItems(zeroIds);
      } else {
        zeroIds.forEach((id) => onDeleteInventoryItem(id));
      }
      setSelectedItemIds((prev) => prev.filter((id) => !zeroIds.includes(id)));
      setIsClearModalOpen(false);
    } else if (clearScope === "WAREHOUSE") {
      const targetWh = clearTargetWarehouse !== "ALL" ? clearTargetWarehouse : selectedWarehouse !== "ALL" ? selectedWarehouse : warehouses[0] || "المستودع الرئيسي";
      if (!targetWh || targetWh === "ALL") {
        alert("يرجى اختيار المستودع المراد مسح أصنافه");
        return;
      }
      if (onClearAllInventoryItems) {
        onClearAllInventoryItems(targetWh);
      } else {
        const whItemIds = inventoryItems
          .filter((it) => (it.warehouseLocation || "المستودع الرئيسي") === targetWh)
          .map((it) => it.id);
        whItemIds.forEach((id) => onDeleteInventoryItem(id));
      }
      setSelectedItemIds([]);
      setIsClearModalOpen(false);
    } else if (clearScope === "ALL") {
      if (clearConfirmText.trim() !== "تأكيد" && clearConfirmText.trim() !== "مسح") {
        alert("يرجى كتابة كلمة 'تأكيد' أو 'مسح' للمتابعة في تصفير سجل المخزون بالكامل");
        return;
      }
      if (onClearAllInventoryItems) {
        onClearAllInventoryItems("ALL");
      } else {
        inventoryItems.forEach((it) => onDeleteInventoryItem(it.id));
      }
      setSelectedItemIds([]);
      setClearConfirmText("");
      setIsClearModalOpen(false);
    }
  };

  // Financial Metrics with safety checks
  const totalInventoryCostValue = inventoryItems.reduce((acc, item) => {
    if (!item) return acc;
    const cost = Number(item.costPrice || 0);
    const qty = Number(item.quantityOnHand || 0);
    const itemCurr = item.currency || displayCurrency || "YER_SANAA";
    try {
      const costInDisplay = convertCurrency(cost * qty, itemCurr, displayCurrency, currencies);
      return acc + (isNaN(costInDisplay) ? 0 : costInDisplay);
    } catch {
      return acc + (cost * qty);
    }
  }, 0);

  const totalInventorySalesValue = inventoryItems.reduce((acc, item) => {
    if (!item) return acc;
    const sell = Number(item.sellingPrice || 0);
    const qty = Number(item.quantityOnHand || 0);
    const itemCurr = item.currency || displayCurrency || "YER_SANAA";
    try {
      const salesInDisplay = convertCurrency(sell * qty, itemCurr, displayCurrency, currencies);
      return acc + (isNaN(salesInDisplay) ? 0 : salesInDisplay);
    } catch {
      return acc + (sell * qty);
    }
  }, 0);

  const totalReturnQuantity = inventoryItems.reduce((acc, item) => acc + (Number(item?.totalReturnsQty) || 0), 0);

  // Helpers
  const handleOpenAddItem = () => {
    setEditingItem(null);
    const nextSku = `INV-${1000 + inventoryItems.length + 1}`;
    setItemFormData({
      code: nextSku,
      nameAr: "",
      category: categories[0] || "عمومي",
      unit: "قطعة",
      quantityOnHand: 10,
      minStockThreshold: 5,
      costPrice: 100,
      sellingPrice: 140,
      currency: displayCurrency,
      warehouseLocation: "مستودع صنعاء المركز",
      totalSalesQty: 0,
      totalReturnsQty: 0,
      barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      description: "",
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setItemFormData({ ...item });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.nameAr || !itemFormData.code) {
      alert("يرجى إدخال كود واسم الصنف");
      return;
    }

    if (editingItem) {
      const updated: InventoryItem = {
        ...editingItem,
        ...(itemFormData as InventoryItem),
      };
      onUpdateInventoryItem(updated);
    } else {
      const newItem: InventoryItem = {
        id: `item-${Date.now()}`,
        code: itemFormData.code!,
        nameAr: itemFormData.nameAr!,
        nameEn: itemFormData.nameEn || "",
        category: itemFormData.category || "عام",
        unit: itemFormData.unit || "حبة",
        quantityOnHand: Number(itemFormData.quantityOnHand || 0),
        minStockThreshold: Number(itemFormData.minStockThreshold || 0),
        costPrice: Number(itemFormData.costPrice || 0),
        sellingPrice: Number(itemFormData.sellingPrice || 0),
        currency: itemFormData.currency || displayCurrency,
        warehouseLocation: itemFormData.warehouseLocation || "المستودع الرئيسي",
        totalSalesQty: 0,
        totalReturnsQty: 0,
        barcode: itemFormData.barcode || "",
        description: itemFormData.description || "",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      onAddInventoryItem(newItem);
    }
    setIsItemModalOpen(false);
  };

  // CSV Import Logic
  const handleDownloadCsvTemplate = () => {
    const csvHeader = "Code,NameAr,Category,Unit,QuantityOnHand,MinStockThreshold,CostPrice,SellingPrice,WarehouseLocation,Barcode,Description\n";
    const csvRows = [
      'INV-2001,بطارية طاقة جل 200Ah,بطاريات وخلايا,وحدة,15,5,180000,225000,مستودع صنعاء - الرف C1,693847292001,بطارية جل ألمانية عالية الجودة',
      'INV-2002,لوح شمسي 600W Trina,ألواح شمسية,لوح,8,10,95000,125000,مستودع عدن - الرف B2,693847292002,ألواح كفاءة عالية أحدث موديل 2026',
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "نموذج_استيراد_الأصناف_المخزنية.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter((line) => line.trim().length > 0);
        
        if (lines.length <= 1) {
          alert("الملف فارغ أو لا يحتوي على بيانات أسطر أصناف");
          return;
        }

        const errors: string[] = [];
        const parsedItems: InventoryItem[] = [];

        // Header mapping
        const header = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
          if (row.length < 2) continue;

          const code = row[0] || `SKU-${Date.now()}-${i}`;
          const nameAr = row[1];
          if (!nameAr) {
            errors.push(`السطر ${i + 1}: اسم الصنف مفقود`);
            continue;
          }

          const category = row[2] || "عام";
          const unit = row[3] || "قطعة";
          const quantityOnHand = parseFloat(row[4]) || 0;
          const minStockThreshold = parseFloat(row[5]) || 5;
          const costPrice = parseFloat(row[6]) || 0;
          const sellingPrice = parseFloat(row[7]) || 0;
          const warehouseLocation = row[8] || "المستودع الرئيسي";
          const barcode = row[9] || "";
          const description = row[10] || "";

          parsedItems.push({
            id: `item-csv-${Date.now()}-${i}`,
            code,
            nameAr,
            category,
            unit,
            quantityOnHand,
            minStockThreshold,
            costPrice,
            sellingPrice,
            currency: displayCurrency,
            warehouseLocation,
            totalSalesQty: 0,
            totalReturnsQty: 0,
            barcode,
            description,
            createdAt: new Date().toISOString().slice(0, 10),
          });
        }

        setImportPreviewData(parsedItems);
        setImportErrors(errors);
        setIsImportModalOpen(true);
      } catch (err) {
        console.error("CSV Read Error", err);
        alert("فشل قراءة ملف CSV، تأكد من تنسيق الملف");
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleConfirmImport = () => {
    if (importPreviewData.length === 0) return;
    onImportInventoryItems(importPreviewData);
    setIsImportModalOpen(false);
    setImportPreviewData([]);
    alert(`تم استيراد ${importPreviewData.length} صنف بنجاح إلى قاعدة بيانات المخزون!`);
  };

  // Stock Movement Helper
  const handleOpenMovementModal = (item: InventoryItem) => {
    setSelectedMovementItem(item);
    setIsMovementModalOpen(true);
  };

  const handleOpenNewMovementForm = () => {
    if (!selectedMovementItem) return;
    setMovementFormData({
      type: "PURCHASE",
      quantity: 1,
      unitPrice: selectedMovementItem.costPrice,
      referenceNumber: `SM-${Date.now().toString().slice(-6)}`,
      notes: "",
    });
    setIsNewMovementModalOpen(true);
  };

  const handleSaveStockMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovementItem) return;

    const qty = Number(movementFormData.quantity || 0);
    if (qty <= 0) {
      alert("يرجى إدخال كمية صحيحة أكبر من صفر");
      return;
    }

    // Calculate new item quantity based on movement type
    let newQty = selectedMovementItem.quantityOnHand;
    let returnsAdd = selectedMovementItem.totalReturnsQty || 0;
    let salesAdd = selectedMovementItem.totalSalesQty || 0;

    if (movementFormData.type === "PURCHASE" || movementFormData.type === "ADJUSTMENT_ADD") {
      newQty += qty;
    } else if (movementFormData.type === "SALES" || movementFormData.type === "ADJUSTMENT_SUB") {
      newQty -= qty;
      if (movementFormData.type === "SALES") salesAdd += qty;
    } else if (movementFormData.type === "RETURN_CUSTOMER") {
      newQty += qty; // Customer returned item back to stock
      returnsAdd += qty;
    } else if (movementFormData.type === "RETURN_VENDOR") {
      newQty -= qty; // Returned item to vendor
      returnsAdd += qty;
    }

    const newMovement: StockMovement = {
      id: `sm-${Date.now()}`,
      itemId: selectedMovementItem.id,
      itemCode: selectedMovementItem.code,
      itemNameAr: selectedMovementItem.nameAr,
      type: movementFormData.type,
      quantity: qty,
      unitPrice: Number(movementFormData.unitPrice || 0),
      totalAmount: qty * Number(movementFormData.unitPrice || 0),
      date: new Date().toISOString().slice(0, 10),
      referenceNumber: movementFormData.referenceNumber,
      notes: movementFormData.notes || "حركة ترحيل مخزني",
      createdBy: "المحاسب الحالي",
    };

    onAddStockMovement(newMovement, newQty);

    // Update local state for immediate view refresh
    const updatedItem = {
      ...selectedMovementItem,
      quantityOnHand: Math.max(0, newQty),
      totalReturnsQty: returnsAdd,
      totalSalesQty: salesAdd,
    };
    setSelectedMovementItem(updatedItem);
    onUpdateInventoryItem(updatedItem);

    setIsNewMovementModalOpen(false);
  };

  // Printable stock report
  const handlePrintStock = () => {
    window.print();
  };

  return (
    <div className="space-[#1a2333] space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  إدارة المخزون السلعي وتتبع الحركة (SAP MM)
                </h1>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  نظام المستودعات v2.6
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                إدارة الأصناف، تتبع الكميات بالرموز الشريطية، كشوف الحركة والعائد، واستيراد الأصناف عبر Excel/CSV.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadCsvTemplate}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            title="تحميل قالب CSV لتعبئة الأصناف واستيرادها"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>قالب CSV</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv, .txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-teal-950/40 transition"
          >
            <Upload className="w-4 h-4" />
            <span>استيراد عبر Excel / CSV</span>
          </button>

          <button
            onClick={handleOpenAddItem}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/40 transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صنف جديد</span>
          </button>

          {/* مسح الأصناف Button */}
          <button
            onClick={() => {
              if (selectedItemIds.length > 0) {
                setClearScope("SELECTED");
              } else {
                setClearScope("ALL");
              }
              setClearConfirmText("");
              setIsClearModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white text-xs font-bold border border-rose-800/60 shadow-lg shadow-rose-950/40 transition"
            title="مسح وتفريغ الأصناف من المخزون والمستودعات"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>مسح الأصناف {selectedItemIds.length > 0 ? `(${selectedItemIds.length})` : ""}</span>
          </button>

          <button
            onClick={handlePrintStock}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الكشف</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("ITEMS")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "ITEMS"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "text-slate-400 hover:bg-slate-800"
          }`}
        >
          قائمة الأصناف (Item Master)
        </button>
        <button
          onClick={() => setActiveTab("MOVEMENTS")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "MOVEMENTS"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "text-slate-400 hover:bg-slate-800"
          }`}
        >
          حركات المخزون (Material Ledger)
        </button>
        <button
          onClick={() => setActiveTab("STOCKTAKE")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "STOCKTAKE"
              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
              : "text-slate-400 hover:bg-slate-800"
          }`}
        >
          تسوية الجرد (Physical Count)
        </button>
      </div>

      {activeTab === "ITEMS" && (
        <>
          {/* Alert Filter Toolbar (أزرار التنبيهات) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Button 1: All Items */}
        <button
          onClick={() => setStockStatusFilter("ALL")}
          className={`flex items-center justify-between p-4 rounded-xl border transition text-right ${
            stockStatusFilter === "ALL"
              ? "bg-blue-950/80 border-blue-500/60 ring-1 ring-blue-500/40 text-white shadow-lg shadow-blue-950/50"
              : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold">جميع الأصناف</div>
              <div className="text-[11px] text-slate-400">إجمالي سجل المخزون</div>
            </div>
          </div>
          <span className="text-lg font-black text-white px-2.5 py-0.5 rounded-lg bg-slate-800">
            {inventoryItems.length}
          </span>
        </button>

        {/* Button 2: Out of Stock Alert Button */}
        <button
          onClick={() => setStockStatusFilter("OUT_OF_STOCK")}
          className={`flex items-center justify-between p-4 rounded-xl border transition text-right ${
            stockStatusFilter === "OUT_OF_STOCK"
              ? "bg-rose-950/90 border-rose-500/80 ring-2 ring-rose-500/50 text-white shadow-lg shadow-rose-950/60 animate-pulse"
              : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-300 flex items-center gap-1">
                <span>أصناف منتهية 🚨</span>
              </div>
              <div className="text-[11px] text-slate-400">كمية صفرية في المستودع</div>
            </div>
          </div>
          <span
            className={`text-lg font-black px-2.5 py-0.5 rounded-lg ${
              outOfStockItems.length > 0 ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400"
            }`}
          >
            {outOfStockItems.length}
          </span>
        </button>

        {/* Button 3: Low Stock Alert Button */}
        <button
          onClick={() => setStockStatusFilter("LOW_STOCK")}
          className={`flex items-center justify-between p-4 rounded-xl border transition text-right ${
            stockStatusFilter === "LOW_STOCK"
              ? "bg-amber-950/90 border-amber-500/80 ring-2 ring-amber-500/50 text-white shadow-lg shadow-amber-950/60"
              : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <span>حد الخطر / الأدنى ⚠️</span>
              </div>
              <div className="text-[11px] text-slate-400">وصلت إلى أو أقل من حد الطلب</div>
            </div>
          </div>
          <span
            className={`text-lg font-black px-2.5 py-0.5 rounded-lg ${
              lowStockItems.length > 0 ? "bg-amber-500 text-slate-950 font-extrabold" : "bg-slate-800 text-slate-400"
            }`}
          >
            {lowStockItems.length}
          </span>
        </button>

        {/* Button 4: Returns & Yield Filter Button */}
        <button
          onClick={() => setStockStatusFilter("WITH_RETURNS")}
          className={`flex items-center justify-between p-4 rounded-xl border transition text-right ${
            stockStatusFilter === "WITH_RETURNS"
              ? "bg-purple-950/90 border-purple-500/80 ring-2 ring-purple-500/50 text-white shadow-lg shadow-purple-950/60"
              : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-purple-300 flex items-center gap-1">
                <span>المرتجعات والعائد ↩️</span>
              </div>
              <div className="text-[11px] text-slate-400">أصناف بها حركات عائد</div>
            </div>
          </div>
          <span
            className={`text-lg font-black px-2.5 py-0.5 rounded-lg ${
              returnedItems.length > 0 ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"
            }`}
          >
            {returnedItems.length}
          </span>
        </button>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">قيمة المخزون بسعر التكلفة</div>
            <div className="text-lg font-black text-white mt-1">
              {formatMoney(totalInventoryCostValue, displayCurrency, currencies)}
            </div>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">قيمة المبيعات المتوقعة</div>
            <div className="text-lg font-black text-emerald-400 mt-1">
              {formatMoney(totalInventorySalesValue, displayCurrency, currencies)}
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">إجمالي التنبيهات الحرجة</div>
            <div className="text-lg font-black text-rose-400 mt-1">
              {outOfStockItems.length + lowStockItems.length} صنف يتطلب إجراء
            </div>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">إجمالي القطع المرتجعة والعائد</div>
            <div className="text-lg font-black text-purple-400 mt-1">
              {totalReturnQuantity} قطعة مرتجعة
            </div>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالكود، الاسم، الرمز الشريط (الباركود)..."
            className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pr-10 pl-4 py-2.5 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>الفئة:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">جميع الفئات ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-xs text-slate-400 mr-2">
            <Building className="w-4 h-4 text-slate-400" />
            <span>المستودع:</span>
          </div>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">جميع المستودعات ({warehouses.length})</option>
            {warehouses.map((wh) => (
              <option key={wh} value={wh}>
                {wh}
              </option>
            ))}
          </select>

          <ColumnCustomizer
            tableKey="inventory_items"
            columns={INVENTORY_COLUMNS}
            visibleColumns={visibleColumns}
            onChange={updateVisibility}
          />
        </div>
      </div>

      {/* Selected Items Bulk Action Bar */}
      {selectedItemIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-rose-950/50 border border-rose-800/60 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2.5 text-xs text-rose-200">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
            <span className="font-bold">
              تم تحديد <span className="font-mono text-white text-sm px-2 py-0.5 rounded bg-rose-900/80 border border-rose-700/50">{selectedItemIds.length}</span> صنف من المخزون والمستودعات
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setClearScope("SELECTED");
                setIsClearModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/40 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح الأصناف المحددة ({selectedItemIds.length})</span>
            </button>
            <button
              onClick={() => setSelectedItemIds([])}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* Main Inventory Items Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl doc-canvas">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
                <th className="px-3 py-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredItems.length > 0 && filteredItems.every((it) => selectedItemIds.includes(it.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const visibleIds = filteredItems.map((it) => it.id);
                        setSelectedItemIds(Array.from(new Set([...selectedItemIds, ...visibleIds])));
                      } else {
                        const visibleIds = new Set(filteredItems.map((it) => it.id));
                        setSelectedItemIds(selectedItemIds.filter((id) => !visibleIds.has(id)));
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    title="تحديد كل الأصناف المعروضة"
                  />
                </th>
                {isVisible("code") && <th className="px-4 py-3.5">كود الصنف / SKU</th>}
                {isVisible("nameAr") && <th className="px-4 py-3.5">بيانات الصنف والباركود</th>}
                {isVisible("category") && <th className="px-4 py-3.5">الفئة والمستودع</th>}
                {isVisible("quantity") && <th className="px-4 py-3.5">الكمية المتوفرة / الحد الأدنى</th>}
                {isVisible("status") && <th className="px-4 py-3.5">حالة المخزون</th>}
                {isVisible("costPrice") && <th className="px-4 py-3.5">سعر التكلفة</th>}
                {isVisible("sellingPrice") && <th className="px-4 py-3.5">سعر البيع / الهامش</th>}
                {isVisible("salesReturns") && <th className="px-4 py-3.5">المبيعات / المرتجعات</th>}
                {isVisible("actions") && <th className="px-4 py-3.5 text-center">الإجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={1 + INVENTORY_COLUMNS.filter((c) => isVisible(c.id)).length} className="text-center py-12 text-slate-500">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <div>لا توجد أصناف مخزنية تطابق معايير البحث والفلترة.</div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const isOut = item.quantityOnHand <= 0;
                  const isLow = item.quantityOnHand > 0 && item.quantityOnHand <= item.minStockThreshold;

                  const costFormatted = formatMoney(item.costPrice, item.currency, currencies);
                  const sellFormatted = formatMoney(item.sellingPrice, item.currency, currencies);
                  const marginPercent = item.costPrice > 0
                    ? Math.round(((item.sellingPrice - item.costPrice) / item.costPrice) * 100)
                    : 0;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-800/40 transition ${
                        selectedItemIds.includes(item.id) ? "bg-rose-950/20" : ""
                      }`}
                    >
                      <td className="px-3 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedItemIds.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItemIds([...selectedItemIds, item.id]);
                            } else {
                              setSelectedItemIds(selectedItemIds.filter((id) => id !== item.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* Code */}
                      {isVisible("code") && (
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-300">
                          {item.code}
                        </td>
                      )}

                      {/* Name & Barcode */}
                      {isVisible("nameAr") && (
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white text-sm">{item.nameAr}</div>
                          {item.nameEn && <div className="text-[10px] text-slate-400 font-mono">{item.nameEn}</div>}
                          {item.barcode && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                              <Barcode className="w-3 h-3 text-slate-500" />
                              <span className="font-mono">{item.barcode}</span>
                            </div>
                          )}
                        </td>
                      )}

                      {/* Category & Warehouse */}
                      {isVisible("category") && (
                        <td className="px-4 py-3.5">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold mb-1">
                            {item.category}
                          </span>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-500" />
                            <span>{item.warehouseLocation}</span>
                          </div>
                        </td>
                      )}

                      {/* Quantity & Threshold */}
                      {isVisible("quantity") && (
                        <td className="px-4 py-3.5 font-bold">
                          <div className="text-sm">
                            {formatNumberOnly(item.quantityOnHand)}{" "}
                            <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                            الحد الأدنى: {item.minStockThreshold} {item.unit}
                          </div>
                        </td>
                      )}

                      {/* Stock Status Badge */}
                      {isVisible("status") && (
                        <td className="px-4 py-3.5">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[11px] animate-pulse">
                              <AlertOctagon className="w-3.5 h-3.5" />
                              <span>منتهية (0) 🚨</span>
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>حد الخطر ⚠️</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>متوفر 🟢</span>
                            </span>
                          )}
                        </td>
                      )}

                      {/* Cost Price */}
                      {isVisible("costPrice") && (
                        <td className="px-4 py-3.5 font-mono text-slate-300">
                          {costFormatted}
                        </td>
                      )}

                      {/* Selling Price & Margin */}
                      {isVisible("sellingPrice") && (
                        <td className="px-4 py-3.5">
                          <div className="font-mono font-bold text-emerald-400">{sellFormatted}</div>
                          <div className="text-[10px] text-teal-400 font-mono">
                            هامش الربح: +{marginPercent}%
                          </div>
                        </td>
                      )}

                      {/* Sales & Returns */}
                      {isVisible("salesReturns") && (
                        <td className="px-4 py-3.5">
                          <div className="text-[11px] text-slate-300">
                            مبيعات: <span className="font-bold text-blue-400">{item.totalSalesQty || 0}</span>
                          </div>
                          <div className="text-[11px] text-purple-400 font-semibold mt-0.5">
                            عائد/مرتجع: <span className="font-bold">{item.totalReturnsQty || 0}</span>
                          </div>
                        </td>
                      )}

                      {/* Actions */}
                      {isVisible("actions") && (
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Stock Ledger History Button */}
                            <button
                              onClick={() => handleOpenMovementModal(item)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-950/90 text-teal-300 hover:bg-teal-900 border border-teal-700/50 text-[11px] font-bold transition"
                              title="عرض كشف حركة الصنف والعائد"
                            >
                              <History className="w-3.5 h-3.5" />
                              <span>كشف الحركة</span>
                            </button>

                            {/* Edit Item */}
                            <button
                              onClick={() => handleOpenEditItem(item)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                              title="تعديل بيانات الصنف"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Item */}
                            <button
                              onClick={() => setItemToDelete(item)}
                              className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-400 border border-rose-800/40 transition"
                              title="مسح الصنف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-300">
            <div>
              عرض الصفحة <span className="font-bold text-white">{currentPage}</span> من <span className="font-bold text-white">{totalPages}</span> (إجمالي الأصناف المطابقة: {filteredItems.length})
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition cursor-pointer font-bold"
              >
                السابق
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition cursor-pointer font-bold"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
      </>
      )}

      {activeTab === "MOVEMENTS" && (
        <InventoryMovementsTab
          stockMovements={stockMovements}
          currencies={currencies}
          displayCurrency={displayCurrency}
        />
      )}
      
      {activeTab === "STOCKTAKE" && (
        <InventoryStocktakeTab
          inventoryItems={inventoryItems}
          currencies={currencies}
          displayCurrency={displayCurrency}
          onAddStockMovement={onAddStockMovement}
          onUpdateInventoryItem={onUpdateInventoryItem}
          onSaveJournalEntry={onSaveJournalEntry}
        />
      )}

      {/* Stock Movement Ledger Modal (كشف حركة الصنف والعائد) */}
      {isMovementModalOpen && selectedMovementItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    كشف حركة الصنف وتحليل العائد
                  </h3>
                  <div className="text-xs text-teal-400 font-mono">
                    {selectedMovementItem.code} - {selectedMovementItem.nameAr}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenNewMovementForm}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة حركة مخزنية</span>
                </button>
                <button
                  onClick={() => setIsMovementModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Item Info Card */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[11px] text-slate-400">الكمية الحالية بالمستودع:</span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {formatNumberOnly(selectedMovementItem.quantityOnHand)} {selectedMovementItem.unit}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">سعر التكلفة للوحدة:</span>
                  <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">
                    {formatMoney(selectedMovementItem.costPrice, selectedMovementItem.currency, currencies)}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">إجمالي كمية المبيعات:</span>
                  <div className="text-sm font-mono font-bold text-blue-400 mt-0.5">
                    {selectedMovementItem.totalSalesQty || 0} {selectedMovementItem.unit}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">إجمالي المرتجعات والعائد:</span>
                  <div className="text-sm font-mono font-bold text-purple-400 mt-0.5">
                    {selectedMovementItem.totalReturnsQty || 0} {selectedMovementItem.unit}
                  </div>
                </div>
              </div>

              {/* Movement History Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-400" />
                  <span>جدول السجل التاريخي للحركات والوثائق:</span>
                </h4>

                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold text-[11px]">
                        <th className="px-3 py-3">التاريخ</th>
                        <th className="px-3 py-3">نوع الحركة</th>
                        <th className="px-3 py-3">رقم المستند / القيد</th>
                        <th className="px-3 py-3">الكمية</th>
                        <th className="px-3 py-3">سعر الوحدة</th>
                        <th className="px-3 py-3">إجمالي القيمة</th>
                        <th className="px-3 py-3">ملاحظات والتفاصيل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {stockMovements.filter((m) => m.itemId === selectedMovementItem.id).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-6 text-slate-500">
                            لا توجد حركات مخزنية مسجلة لهذا الصنف بعد.
                          </td>
                        </tr>
                      ) : (
                        stockMovements
                          .filter((m) => m.itemId === selectedMovementItem.id)
                          .map((mv) => {
                            let badgeClass = "bg-slate-800 text-slate-300";
                            let badgeLabel = mv.type;

                            if (mv.type === "PURCHASE") {
                              badgeClass = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
                              badgeLabel = "توريد مشتريات (+)";
                            } else if (mv.type === "SALES") {
                              badgeClass = "bg-blue-500/20 text-blue-400 border border-blue-500/30";
                              badgeLabel = "صرف مبيعات (-)";
                            } else if (mv.type === "RETURN_CUSTOMER") {
                              badgeClass = "bg-purple-500/20 text-purple-300 border border-purple-500/30";
                              badgeLabel = "مرتجع من عميل (+)";
                            } else if (mv.type === "RETURN_VENDOR") {
                              badgeClass = "bg-amber-500/20 text-amber-300 border border-amber-500/30";
                              badgeLabel = "مرتجع لمورد (-)";
                            } else if (mv.type === "ADJUSTMENT_ADD") {
                              badgeClass = "bg-teal-500/20 text-teal-300 border border-teal-500/30";
                              badgeLabel = "تسوية إضافة (+)";
                            } else if (mv.type === "ADJUSTMENT_SUB") {
                              badgeClass = "bg-rose-500/20 text-rose-300 border border-rose-500/30";
                              badgeLabel = "تسوية خصم (-)";
                            }

                            return (
                              <tr key={mv.id} className="hover:bg-slate-800/40">
                                <td className="px-3 py-3 font-mono text-slate-400">{mv.date}</td>
                                <td className="px-3 py-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}`}>
                                    {badgeLabel}
                                  </span>
                                </td>
                                <td className="px-3 py-3 font-mono text-slate-200">{mv.referenceNumber}</td>
                                <td className="px-3 py-3 font-bold font-mono text-white">{mv.quantity}</td>
                                <td className="px-3 py-3 font-mono">
                                  {formatMoney(mv.unitPrice, selectedMovementItem.currency, currencies)}
                                </td>
                                <td className="px-3 py-3 font-mono font-bold text-emerald-400">
                                  {formatMoney(mv.totalAmount, selectedMovementItem.currency, currencies)}
                                </td>
                                <td className="px-3 py-3 text-slate-400">{mv.notes}</td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Stock Movement Modal Form */}
      {isNewMovementModalOpen && selectedMovementItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">تسجيل حركة مخزنية جديدة</h3>
              <button
                onClick={() => setIsNewMovementModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockMovement} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">نوع الحركة المخزنية:</label>
                <select
                  value={movementFormData.type}
                  onChange={(e) =>
                    setMovementFormData({
                      ...movementFormData,
                      type: e.target.value as StockMovementType,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-emerald-500"
                >
                  <option value="PURCHASE">توريد بضاعة / مشتريات (+)</option>
                  <option value="SALES">صرف بضاعة / مبيعات (-)</option>
                  <option value="RETURN_CUSTOMER">مرتجع من عميل / عائد (+)</option>
                  <option value="RETURN_VENDOR">مرتجع إلى مورد / عائد (-)</option>
                  <option value="ADJUSTMENT_ADD">تسوية جردية - إضافة (+)</option>
                  <option value="ADJUSTMENT_SUB">تسوية جردية - خصم (-)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الكمية:</label>
                  <input
                    type="number"
                    min="1"
                    value={movementFormData.quantity}
                    onChange={(e) =>
                      setMovementFormData({
                        ...movementFormData,
                        quantity: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-bold focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">سعر الوحدة:</label>
                  <input
                    type="number"
                    value={movementFormData.unitPrice}
                    onChange={(e) =>
                      setMovementFormData({
                        ...movementFormData,
                        unitPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-bold focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">رقم المستند / الفاتورة:</label>
                <input
                  type="text"
                  value={movementFormData.referenceNumber}
                  onChange={(e) =>
                    setMovementFormData({ ...movementFormData, referenceNumber: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-mono focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">شرح وملاحظات الحركة:</label>
                <textarea
                  rows={2}
                  value={movementFormData.notes}
                  onChange={(e) => setMovementFormData({ ...movementFormData, notes: e.target.value })}
                  placeholder="سبب الحركة أو التفاصيل الإضافية..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewMovementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  حفظ الحركة والتحديث
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Inventory Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingItem ? "تعديل بيانات الصنف المخزني" : "إضافة صنف مخزني جديد"}
              </h3>
              <button onClick={() => setIsItemModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">كود الصنف (SKU): *</label>
                  <input
                    type="text"
                    value={itemFormData.code}
                    onChange={(e) => setItemFormData({ ...itemFormData, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-mono focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">اسم الصنف بالعربية: *</label>
                  <input
                    type="text"
                    value={itemFormData.nameAr}
                    onChange={(e) => setItemFormData({ ...itemFormData, nameAr: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">فئة الصنف:</label>
                  <input
                    type="text"
                    value={itemFormData.category}
                    onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value })}
                    placeholder="مثال: أجهزة طاقة شمسية"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">وحدة القياس:</label>
                  <input
                    type="text"
                    value={itemFormData.unit}
                    onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                    placeholder="طقم / حبة / لفة / كرتون"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الكمية الافتتاحية بالحساب:</label>
                  <input
                    type="number"
                    value={itemFormData.quantityOnHand}
                    onChange={(e) => setItemFormData({ ...itemFormData, quantityOnHand: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-bold focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">حد الخطر / الحد الأدنى:</label>
                  <input
                    type="number"
                    value={itemFormData.minStockThreshold}
                    onChange={(e) => setItemFormData({ ...itemFormData, minStockThreshold: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-bold focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">سعر التكلفة:</label>
                  <input
                    type="number"
                    value={itemFormData.costPrice}
                    onChange={(e) => setItemFormData({ ...itemFormData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-mono focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">سعر البيع:</label>
                  <input
                    type="number"
                    value={itemFormData.sellingPrice}
                    onChange={(e) => setItemFormData({ ...itemFormData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-mono focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">المستودع / الرف:</label>
                  <input
                    type="text"
                    value={itemFormData.warehouseLocation}
                    onChange={(e) => setItemFormData({ ...itemFormData, warehouseLocation: e.target.value })}
                    placeholder="مستودع صنعاء - الرف A1"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الرمز الشريط (Barcode):</label>
                  <input
                    type="text"
                    value={itemFormData.barcode}
                    onChange={(e) => setItemFormData({ ...itemFormData, barcode: e.target.value })}
                    placeholder="693847291001"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-mono focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Preview Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-6 h-6 text-teal-400" />
                <h3 className="text-base font-bold text-white">معاينة استيراد الأصناف عبر Excel / CSV</h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-teal-950/40 border border-teal-800/50 p-3 rounded-xl text-teal-300">
                تم استخراج <strong>{importPreviewData.length}</strong> صنف جاهز للاستيراد وتحديث قاعدة البيانات.
              </div>

              {importErrors.length > 0 && (
                <div className="bg-rose-950/40 border border-rose-800/50 p-3 rounded-xl text-rose-300 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>تحذيرات الأسطر المرفوضة:</span>
                  </div>
                  {importErrors.map((err, idx) => (
                    <div key={idx}>• {err}</div>
                  ))}
                </div>
              )}

              <div className="border border-slate-800 rounded-xl overflow-x-auto max-h-60">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <th className="px-3 py-2">كود الصنف</th>
                      <th className="px-3 py-2">اسم الصنف</th>
                      <th className="px-3 py-2">الفئة</th>
                      <th className="px-3 py-2">الكمية</th>
                      <th className="px-3 py-2">الحد الأدنى</th>
                      <th className="px-3 py-2">التكلفة</th>
                      <th className="px-3 py-2">البيع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {importPreviewData.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-mono">{item.code}</td>
                        <td className="px-3 py-2 font-bold">{item.nameAr}</td>
                        <td className="px-3 py-2">{item.category}</td>
                        <td className="px-3 py-2 font-bold">{item.quantityOnHand}</td>
                        <td className="px-3 py-2 text-slate-400">{item.minStockThreshold}</td>
                        <td className="px-3 py-2 font-mono">{item.costPrice}</td>
                        <td className="px-3 py-2 font-mono">{item.sellingPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  تأكيد الاستيراد الحفظ النهائي
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Item Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 bg-rose-950/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-rose-400">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">تأكيد مسح الصنف من المخزون والمستودعات</h3>
              </div>
              <button
                onClick={() => setItemToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400 pb-1 border-b border-slate-800/80">
                  <span>اسم الصنف:</span>
                  <span className="font-bold text-white text-sm">{itemToDelete.nameAr}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>كود الصنف (SKU):</span>
                  <span className="font-mono text-emerald-400 font-bold">{itemToDelete.code}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>الفئة:</span>
                  <span className="text-slate-200">{itemToDelete.category}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>المستودع:</span>
                  <span className="text-slate-200">{itemToDelete.warehouseLocation || "المستودع الرئيسي"}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>الكمية الحالية في الرصيد:</span>
                  <span className="font-bold text-amber-400 font-mono text-sm">{itemToDelete.quantityOnHand} {itemToDelete.unit || "قطعة"}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  هل أنت متأكد من مسح وحذف هذا الصنف؟ سيتم حذفه من سجلات المخزون والمستودعات بشكل نهائي.
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSingleDelete}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>تأكيد مسح الصنف</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk / Clear Items Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-rose-950/60 via-slate-900 to-rose-950/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">مسح وتفريغ الأصناف من المخزون والمستودعات</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    اختر نطاق المسح المطلوب لمعالجة بيانات الأصناف والمستودعات
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Scope Options */}
              <div className="space-y-2.5">
                {/* 1. Selected Items */}
                <label
                  onClick={() => setClearScope("SELECTED")}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    clearScope === "SELECTED"
                      ? "bg-rose-950/30 border-rose-600/70 shadow-sm"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                  } ${selectedItemIds.length === 0 ? "opacity-60" : ""}`}
                >
                  <input
                    type="radio"
                    name="clearScope"
                    checked={clearScope === "SELECTED"}
                    onChange={() => setClearScope("SELECTED")}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">مسح الأصناف المحددة</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                        {selectedItemIds.length} صنف محدد
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      مسح وحذف الأصناف التي قمت بوضع علامة الاختيار عليها في جدول المخزون.
                    </p>
                  </div>
                </label>

                {/* 2. Zero Stock Items */}
                <label
                  onClick={() => setClearScope("ZERO_STOCK")}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    clearScope === "ZERO_STOCK"
                      ? "bg-rose-950/30 border-rose-600/70 shadow-sm"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="clearScope"
                    checked={clearScope === "ZERO_STOCK"}
                    onChange={() => setClearScope("ZERO_STOCK")}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">مسح الأصناف الصفرية ومنتهية الرصيد</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                        {zeroStockItems.length} صنف رصيده 0
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      تنظيف المخزون عبر مسح جميع الأصناف التي كميتها صفر أو أقل.
                    </p>
                  </div>
                </label>

                {/* 3. Specific Warehouse */}
                <label
                  onClick={() => setClearScope("WAREHOUSE")}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    clearScope === "WAREHOUSE"
                      ? "bg-rose-950/30 border-rose-600/70 shadow-sm"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="clearScope"
                    checked={clearScope === "WAREHOUSE"}
                    onChange={() => setClearScope("WAREHOUSE")}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">مسح أصناف مستودع محدد</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                        تفريغ مستودع
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      مسح كافة الأصناف المرتبطة بمستودع أو موقع تخزين معين.
                    </p>

                    {clearScope === "WAREHOUSE" && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                        <label className="block text-[11px] text-slate-300 mb-1.5 font-medium">
                          اختر المستودع المراد مسح أصنافه:
                        </label>
                        <select
                          value={clearTargetWarehouse}
                          onChange={(e) => setClearTargetWarehouse(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-rose-500"
                        >
                          <option value="ALL">-- اختر المستودع --</option>
                          {warehouses.map((wh) => {
                            const countInWh = inventoryItems.filter(
                              (it) => (it.warehouseLocation || "المستودع الرئيسي") === wh
                            ).length;
                            return (
                              <option key={wh} value={wh}>
                                {wh} ({countInWh} صنف)
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>
                </label>

                {/* 4. Clear All Items */}
                <label
                  onClick={() => setClearScope("ALL")}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    clearScope === "ALL"
                      ? "bg-rose-950/40 border-rose-500 shadow-md"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="clearScope"
                    checked={clearScope === "ALL"}
                    onChange={() => setClearScope("ALL")}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-rose-300">مسح وتصفير سجل المخزون بالكامل</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-600/30 text-rose-200 font-mono font-bold">
                        كافة الأصناف ({inventoryItems.length})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      مسح شامل لجميع الأصناف من كافة المستودعات وتفريغ السجل تماماً.
                    </p>

                    {clearScope === "ALL" && (
                      <div className="mt-3 pt-2.5 border-t border-rose-800/40 space-y-2">
                        <div className="text-[11px] text-rose-300 font-semibold">
                          ⚠️ إجراء حساس: لتأكيد مسح كافة الأصناف ({inventoryItems.length} صنف)، يرجى كتابة كلمة <strong className="text-white bg-rose-950 px-1.5 py-0.5 rounded border border-rose-700">تأكيد</strong> أو <strong className="text-white bg-rose-950 px-1.5 py-0.5 rounded border border-rose-700">مسح</strong> أدناه:
                        </div>
                        <input
                          type="text"
                          value={clearConfirmText}
                          onChange={(e) => setClearConfirmText(e.target.value)}
                          placeholder="اكتب تأكيد أو مسح هنا..."
                          className="w-full bg-slate-900 border border-rose-800 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-rose-400"
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsClearModalOpen(false);
                    setClearConfirmText("");
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleExecuteClearItems}
                  disabled={
                    (clearScope === "SELECTED" && selectedItemIds.length === 0) ||
                    (clearScope === "ZERO_STOCK" && zeroStockItems.length === 0) ||
                    (clearScope === "WAREHOUSE" && (clearTargetWarehouse === "ALL" || !clearTargetWarehouse)) ||
                    (clearScope === "ALL" && clearConfirmText.trim() !== "تأكيد" && clearConfirmText.trim() !== "مسح")
                  }
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>تنفيذ مسح الأصناف</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
