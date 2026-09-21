import { ItemUnitHierarchy, ItemUnitLevel, InventoryItem } from "../types/erp";

export interface YemeniUnitTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  baseUnit: string;
  levels: {
    unitName: string;
    conversionFactor: number;
    unitCode?: string;
  }[];
}

/**
 * القوالب التجارية الشائعة والجاهزة في السوق اليمني
 */
export const YEMENI_UNIT_TEMPLATES: YemeniUnitTemplate[] = [
  {
    id: "carton-bundle-piece",
    name: "كرتون ← شدة ← حبة",
    description: "الأكثر شيوعاً للمواد الغذائية والمنظفات والبسكويت والمعلبات",
    category: "مواد غذائية واستهلاكية",
    baseUnit: "كرتون",
    levels: [
      { unitName: "كرتون", conversionFactor: 1 },
      { unitName: "شدة", conversionFactor: 12 },
      { unitName: "حبة", conversionFactor: 10 },
    ],
  },
  {
    id: "carton-packet-piece",
    name: "كرتون ← باكت ← علبة / حبة",
    description: "مناسب لشاي الكبوس، السجائر، الأدوية، والمناديل الورقية",
    category: "أدوية وتبغ وشاي",
    baseUnit: "كرتون",
    levels: [
      { unitName: "كرتون", conversionFactor: 1 },
      { unitName: "باكت", conversionFactor: 20 },
      { unitName: "حبة", conversionFactor: 10 },
    ],
  },
  {
    id: "ton-bag-kilo",
    name: "طن ← كيس (50 كجم) ← كيلو",
    description: "خاص بمواد البناء (الأسمنت، الجبس، النورة) والحبوب الكبرى",
    category: "مواد بناء وأسمنت",
    baseUnit: "طن",
    levels: [
      { unitName: "طن", conversionFactor: 1 },
      { unitName: "كيس (50 كجم)", conversionFactor: 20 },
      { unitName: "كيلو", conversionFactor: 50 },
    ],
  },
  {
    id: "bag-kilo-halfkilo",
    name: "كيس (50 كجم) ← كيلو ← نصف كيلو",
    description: "مناسب لتجارة الحبوب، أرز الشعلان، السكر، والدقيق",
    category: "أرز وحبوب وسكر",
    baseUnit: "كيس",
    levels: [
      { unitName: "كيس", conversionFactor: 1 },
      { unitName: "كيلو", conversionFactor: 50 },
      { unitName: "نصف كيلو", conversionFactor: 2 },
    ],
  },
  {
    id: "roll-yard-meter",
    name: "لفة ← ياردة ← متر",
    description: "للأقمشة، والبزوز، وليات التقطير الزراعية، والأسلاك الكهربائية",
    category: "أقمشة وأدوات زراعية",
    baseUnit: "لفة",
    levels: [
      { unitName: "لفة", conversionFactor: 1 },
      { unitName: "ياردة", conversionFactor: 50 },
      { unitName: "متر", conversionFactor: 1 },
    ],
  },
  {
    id: "carton-tin-liter",
    name: "كرتون ← تنكة / جالون ← لتر",
    description: "لزيوت الطبخ (الصافي، هناء، شوارق)، السمن، وزيوت المحركات",
    category: "زيوت وسوائل",
    baseUnit: "كرتون",
    levels: [
      { unitName: "كرتون", conversionFactor: 1 },
      { unitName: "تنكة / جالون", conversionFactor: 4 },
      { unitName: "لتر", conversionFactor: 4 },
    ],
  },
  {
    id: "ton-bar-meter",
    name: "طن ← سيخ حديد ← متر",
    description: "حديد التسليح (سابك، اليمامة، حديد محلي 12ملم، 14ملم، 16ملم)",
    category: "حديد وصلب",
    baseUnit: "طن",
    levels: [
      { unitName: "طن", conversionFactor: 1 },
      { unitName: "سيخ (12 متر)", conversionFactor: 112 },
      { unitName: "متر", conversionFactor: 12 },
    ],
  },
];

/**
 * إعادة حساب المعاملات التراكمية لكل المستويات بدقة
 * Cumulative factor represents: 1 Base Unit = X this unit
 */
export function recalculateLevels(levels: ItemUnitLevel[], baseUnitName?: string): ItemUnitLevel[] {
  if (!levels || levels.length === 0) return [];

  let currentCumulative = 1;

  return levels.map((lvl, index) => {
    const isBase = index === 0;
    const factor = isBase ? 1 : Math.max(0.0001, Number(lvl.conversionFactor) || 1);
    
    if (isBase) {
      currentCumulative = 1;
    } else {
      currentCumulative = currentCumulative * factor;
    }

    return {
      ...lvl,
      level: index + 1,
      unitName: (isBase && baseUnitName) ? baseUnitName : (lvl.unitName || `وحدة ${index + 1}`),
      conversionFactor: factor,
      cumulativeFactor: Math.round(currentCumulative * 10000) / 10000,
      isActive: lvl.isActive !== false,
    };
  });
}

/**
 * بناء توزيع هرمي من قالب جاهز
 */
export function createHierarchyFromTemplate(template: YemeniUnitTemplate, customBaseUnit?: string): ItemUnitHierarchy {
  const baseUnit = customBaseUnit || template.baseUnit;
  let cumulative = 1;

  const levels: ItemUnitLevel[] = template.levels.map((lvl, idx) => {
    const isBase = idx === 0;
    const factor = isBase ? 1 : lvl.conversionFactor;
    cumulative = isBase ? 1 : cumulative * factor;

    return {
      id: `lvl-${idx + 1}-${Date.now()}`,
      level: idx + 1,
      unitName: isBase && customBaseUnit ? customBaseUnit : lvl.unitName,
      unitCode: lvl.unitCode || `U-${idx + 1}`,
      conversionFactor: factor,
      cumulativeFactor: cumulative,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  });

  return {
    baseUnit,
    levels,
    notes: template.description,
  };
}

/**
 * تحويل أي كمية بوحدة معينة إلى كمية بالوحدة الأساسية للمخزون
 */
export function convertToBaseUnits(
  quantity: number,
  fromUnitName: string,
  hierarchy?: ItemUnitHierarchy
): number {
  const qty = Number(quantity) || 0;
  if (!hierarchy || !hierarchy.levels || hierarchy.levels.length <= 1) {
    return qty;
  }

  const cleanFrom = fromUnitName.trim().toLowerCase();
  const matched = hierarchy.levels.find(
    (lvl) => lvl.unitName.trim().toLowerCase() === cleanFrom
  );

  if (!matched || matched.level === 1 || !matched.cumulativeFactor) {
    return qty;
  }

  // If 1 Base = 120 Pieces, then 240 Pieces = 240 / 120 = 2 Base Units
  return qty / matched.cumulativeFactor;
}

/**
 * تحويل كمية بالوحدة الأساسية إلى أي وحدة تابعة
 */
export function convertFromBaseUnits(
  baseQuantity: number,
  targetUnitName: string,
  hierarchy?: ItemUnitHierarchy
): number {
  const baseQty = Number(baseQuantity) || 0;
  if (!hierarchy || !hierarchy.levels || hierarchy.levels.length <= 1) {
    return baseQty;
  }

  const cleanTarget = targetUnitName.trim().toLowerCase();
  const matched = hierarchy.levels.find(
    (lvl) => lvl.unitName.trim().toLowerCase() === cleanTarget
  );

  if (!matched || matched.level === 1 || !matched.cumulativeFactor) {
    return baseQty;
  }

  // If 1 Base = 120 Pieces, then 2 Base Units = 2 * 120 = 240 Pieces
  return baseQty * matched.cumulativeFactor;
}

/**
 * تحويل كمية بين وحدتين داخل نفس الهرم
 */
export function convertBetweenUnits(
  quantity: number,
  fromUnitName: string,
  toUnitName: string,
  hierarchy?: ItemUnitHierarchy
): number {
  if (fromUnitName === toUnitName) return quantity;
  const inBase = convertToBaseUnits(quantity, fromUnitName, hierarchy);
  return convertFromBaseUnits(inBase, toUnitName, hierarchy);
}

/**
 * الحصول على معامل تحويل وحدة معينة بالنسبة للوحدة الأساسية
 */
export function getUnitCumulativeFactor(
  unitName: string,
  hierarchy?: ItemUnitHierarchy
): number {
  if (!hierarchy || !hierarchy.levels) return 1;
  const clean = unitName.trim().toLowerCase();
  const matched = hierarchy.levels.find(
    (lvl) => lvl.unitName.trim().toLowerCase() === clean
  );
  return matched?.cumulativeFactor || 1;
}

/**
 * استخراج ملخص مسار الهرم (مثال: كرتون ← شدة ← حبة)
 */
export function formatHierarchySummary(hierarchy?: ItemUnitHierarchy): string {
  if (!hierarchy || !hierarchy.levels || hierarchy.levels.length === 0) {
    return "";
  }
  return hierarchy.levels.map((l) => l.unitName).join(" ← ");
}

/**
 * صياغة معادلة التوزيع الكاملة (مثال: 1 كرتون = 12 شدة = 120 حبة)
 */
export function formatHierarchyEquation(hierarchy?: ItemUnitHierarchy): string {
  if (!hierarchy || !hierarchy.levels || hierarchy.levels.length <= 1) {
    return "";
  }
  const base = hierarchy.levels[0];
  const parts = [`1 ${base.unitName}`];

  for (let i = 1; i < hierarchy.levels.length; i++) {
    const lvl = hierarchy.levels[i];
    parts.push(`${lvl.cumulativeFactor.toLocaleString()} ${lvl.unitName}`);
  }

  return parts.join(" = ");
}

/**
 * تفكيك كمية محددة إلى جميع وحدات الهرم
 * مثال: 2 كرتون = 24 شدة = 240 حبة
 */
export function formatUnitBreakdown(
  quantity: number,
  currentUnit: string,
  hierarchy?: ItemUnitHierarchy
): {
  equationText: string;
  baseUnitsQty: number;
  breakdownList: { unitName: string; quantity: number; level: number; isBase: boolean }[];
} {
  const qty = Number(quantity) || 0;
  if (!hierarchy || !hierarchy.levels || hierarchy.levels.length <= 1) {
    return {
      equationText: `${qty} ${currentUnit}`,
      baseUnitsQty: qty,
      breakdownList: [{ unitName: currentUnit, quantity: qty, level: 1, isBase: true }],
    };
  }

  const baseQty = convertToBaseUnits(qty, currentUnit, hierarchy);
  const breakdownList = hierarchy.levels.map((lvl) => {
    const unitQty = baseQty * lvl.cumulativeFactor;
    return {
      unitName: lvl.unitName,
      quantity: Math.round(unitQty * 1000) / 1000,
      level: lvl.level,
      isBase: lvl.level === 1,
    };
  });

  const equationText = breakdownList
    .map((b) => `${b.quantity.toLocaleString()} ${b.unitName}`)
    .join(" = ");

  return {
    equationText,
    baseUnitsQty: baseQty,
    breakdownList,
  };
}

/**
 * حساب المخزون المتوفر بجميع الوحدات لصنف معين
 */
export function calculateStockInAllUnits(
  stockOnHandInBase: number,
  hierarchy?: ItemUnitHierarchy
): { unitName: string; quantity: number; level: number; isBase: boolean; cumulativeFactor: number }[] {
  const baseStock = Number(stockOnHandInBase) || 0;

  if (!hierarchy || !hierarchy.levels || hierarchy.levels.length === 0) {
    return [
      {
        unitName: "وحدة",
        quantity: baseStock,
        level: 1,
        isBase: true,
        cumulativeFactor: 1,
      },
    ];
  }

  return hierarchy.levels.map((lvl) => ({
    unitName: lvl.unitName,
    quantity: Math.round(baseStock * lvl.cumulativeFactor * 100) / 100,
    level: lvl.level,
    isBase: lvl.level === 1,
    cumulativeFactor: lvl.cumulativeFactor,
  }));
}

/**
 * حساب سعر البيع المقترح لوحدة معينة بناء على سعر الوحدة الأساسية
 */
export function calculateUnitSellingPrice(
  baseSellingPrice: number,
  targetUnitName: string,
  hierarchy?: ItemUnitHierarchy
): number {
  if (!hierarchy || !hierarchy.levels || hierarchy.levels.length <= 1) {
    return baseSellingPrice;
  }

  const clean = targetUnitName.trim().toLowerCase();
  const matched = hierarchy.levels.find(
    (lvl) => lvl.unitName.trim().toLowerCase() === clean
  );

  if (!matched) return baseSellingPrice;

  // إذا تم تحديد سعر بيع مخصص لهذه الوحدة بالذات
  if (matched.sellingPrice && matched.sellingPrice > 0) {
    return matched.sellingPrice;
  }

  // إذا كانت الوحدة الأساسية
  if (matched.level === 1 || !matched.cumulativeFactor) {
    return baseSellingPrice;
  }

  // السعر بالتناسب المباشر
  return Math.round((baseSellingPrice / matched.cumulativeFactor) * 100) / 100;
}

/**
 * استخراج قائمة جميع الوحدات المتاحة لصنف
 */
export function getAllItemUnits(item?: InventoryItem | null): { unitName: string; factor: number; level: number }[] {
  if (!item) return [];
  if (!item.unitHierarchy || !item.unitHierarchy.levels || item.unitHierarchy.levels.length === 0) {
    return [{ unitName: item.unit || "وحدة", factor: 1, level: 1 }];
  }
  return item.unitHierarchy.levels.map((lvl) => ({
    unitName: lvl.unitName,
    factor: lvl.cumulativeFactor,
    level: lvl.level,
  }));
}
