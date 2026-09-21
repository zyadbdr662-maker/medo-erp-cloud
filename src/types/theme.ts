export interface ThemeColorConfig {
  primaryColor: string; // e.g. #0284c7, #059669, #4f46e5, #d97706, #e11d48
  primaryColorHover: string;
  primaryColorText: string;
  secondaryColor: string; // e.g. #f59e0b (gold/amber)
  backgroundColor: string; // page background e.g. #020617, #0f172a, #f8fafc, #ffffff
  cardBackgroundColor: string; // surface/card background e.g. #0f172a, #1e293b, #ffffff, #f1f5f9
  sidebarBackgroundColor: string; // sidebar background e.g. #0f172a, #090d16, #ffffff
  headerBackgroundColor: string; // header background e.g. #0f172a, #ffffff
  textColor: string; // primary text color e.g. #f8fafc, #0f172a
  secondaryTextColor: string; // secondary text color e.g. #94a3b8, #64748b
  borderColor: string; // border color e.g. #1e293b, #334155, #e2e8f0
  linkColor: string; // link color e.g. #38bdf8, #0284c7
  warningColor: string; // warning color e.g. #f59e0b
  errorColor: string; // error color e.g. #ef4444
  successColor: string; // success color e.g. #10b981
}

export type FontFamilyChoice =
  | "IBM Plex Sans Arabic"
  | "Cairo"
  | "Tajawal"
  | "Almarai"
  | "Readex Pro"
  | "Alexandria"
  | "Amiri"
  | "Katibeh"
  | "Aref Ruqaa"
  | "Noto Naskh Arabic"
  | "Traditional Arabic"
  | "Arial"
  | "system-ui";

export interface ThemeTypographyConfig {
  fontFamily: FontFamilyChoice;
  baseFontSize: number; // 12 to 24 (default 14 or 15)
  headingScale: number; // 1.1 to 1.8 (default 1.25)
  lineHeight: number; // 1.3 to 2.0 (default 1.5)
  fontWeight: "normal" | "medium" | "semibold" | "bold";
}

export type CornerRadiusStyle = "square" | "rounded-sm" | "rounded-md" | "rounded-lg" | "rounded-xl" | "pill";

export interface ThemeShapesConfig {
  tableCorners: "square" | "rounded-sm" | "rounded-md" | "rounded-lg" | "rounded-xl"; // 0px, 6px, 10px, 16px, 24px
  buttonCorners: "square" | "rounded-sm" | "rounded-md" | "rounded-lg" | "pill"; // 0px, 6px, 12px, 16px, 9999px
  cardCorners: "square" | "rounded-sm" | "rounded-md" | "rounded-lg" | "rounded-xl"; // 0px, 8px, 14px, 20px, 28px
  borderWidth: number; // 0, 1, 2, 3
  shadowIntensity: "none" | "subtle" | "medium" | "intense" | "neon";
}

export interface ThemeSpacingConfig {
  buttonSize: "compact" | "default" | "large" | "xlarge";
  inputSize: "compact" | "default" | "large";
  spacingDensity: "compact" | "standard" | "spacious";
}

export interface ThemeConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  mode: "dark" | "light" | "colored";
  category?: "EXECUTIVE_LIGHT" | "EXECUTIVE_DARK" | "ELEGANT_DARK" | "LUXURY_METALLIC" | "SAP_OFFICIAL" | "ACCESSIBILITY";
  badgeAr?: string;
  colors: ThemeColorConfig;
  typography: ThemeTypographyConfig;
  shapes: ThemeShapesConfig;
  spacing: ThemeSpacingConfig;
  zoomLevel: number; // 50 to 200 (default 100)
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Predefined themes list according to SAP Fiori standards & Executive Enterprise Design
export const PREDEFINED_THEMES: ThemeConfig[] = [
  {
    id: "executive_navy_white_official",
    nameAr: "الهوية الرسمية المعتمدة - كحلي ملكي وأبيض ناصع (Deep Navy & Pure White)",
    nameEn: "MeDo Official Deep Navy & Crisp White Executive Edition",
    descriptionAr: "المظهر الرسمي المعتمد للمنظومة: شريط علوي أزرق داكن كحلي (#0B192C)، بطاقات بيضاء ناصعة (#FFFFFF)، أزرار كحلية ملكية، وخط عربي عريض متمدد وفائق الجاذبية والوضوح",
    mode: "light",
    category: "EXECUTIVE_LIGHT",
    badgeAr: "المعتمد رسمياً - Navy & White",
    colors: {
      primaryColor: "#0a2540", // Deep Navy Blue
      primaryColorHover: "#1E3A8A", // Royal Navy Hover
      primaryColorText: "#ffffff",
      secondaryColor: "#d4af37", // Royal Blue Accent
      backgroundColor: "#f4f7fc", // Clean Crisp Light Slate
      cardBackgroundColor: "#ffffff", // Pure Crisp White Cards
      sidebarBackgroundColor: "#081220", // Deep Midnight Navy Sidebar
      headerBackgroundColor: "#0a2540", // Dark Navy Header
      textColor: "#1a2b4c", // Deep Slate Charcoal (High Contrast)
      secondaryTextColor: "#6a7f9f", // Clear Slate
      borderColor: "#CBD5E1", // Crisp Border
      linkColor: "#1D4ED8",
      warningColor: "#d68910",
      errorColor: "#c0392b",
      successColor: "#1e7e34",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 15,
      headingScale: 1.35,
      lineHeight: 1.65,
      fontWeight: "bold",
    },
    shapes: {
      tableCorners: "rounded-xl",
      buttonCorners: "rounded-lg",
      cardCorners: "rounded-xl",
      borderWidth: 1,
      shadowIntensity: "subtle",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "executive_hybrid_light",
    nameAr: "مظهر SAP Green & Gold المؤسسي - أخضر داكن مع لمسات ذهبية",
    nameEn: "SAP Green & Gold Enterprise Identity (MeDo ERP)",
    descriptionAr: "المظهر الأخضر والذهبي: أخضر داكن (#1A6B3C)، لمسات ذهبية للفخامة (#D4AF37)، خلفية #F4F7FC، وبطاقات بيضاء ناصعة #FFFFFF",
    mode: "light",
    category: "EXECUTIVE_LIGHT",
    badgeAr: "SAP Green & Gold",
    colors: {
      primaryColor: "#1A6B3C", // SAP Dark Green
      primaryColorHover: "#14532D",
      primaryColorText: "#ffffff",
      secondaryColor: "#D4AF37", // Luxury Gold
      backgroundColor: "#F4F7FC", // Clean Light Professional Canvas
      cardBackgroundColor: "#ffffff", // Pure Crisp White Cards
      sidebarBackgroundColor: "#0A2E1A", // Deep SAP Green Sidebar
      headerBackgroundColor: "#1A6B3C", // SAP Green Header
      textColor: "#0A2E1A", // Deep Green-Charcoal Text
      secondaryTextColor: "#4A5B6F", // Slate Dark
      borderColor: "#D1D5DB", // Clean subtle border
      linkColor: "#1A6B3C",
      warningColor: "#d68910",
      errorColor: "#E74C3C",
      successColor: "#2E7D32",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.3,
      lineHeight: 1.6,
      fontWeight: "semibold",
    },
    shapes: {
      tableCorners: "rounded-xl",
      buttonCorners: "rounded-lg",
      cardCorners: "rounded-xl",
      borderWidth: 1,
      shadowIntensity: "subtle",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "ultra_clear_royal_sky",
    nameAr: "الأبيض الملكي والأزرق السناوي - عالي الوضوح والتباين (فائق الوضوح)",
    nameEn: "Ultra Clear White, Royal & Sky Blue (High Contrast)",
    descriptionAr: "ثيم معتمد فائق الوضوح بخلفية مستندات وكروت أبيض ناصع، خطوط سوداء غامقة جداً 100%، وأزرار زرقاء ملكية وسناوية زاهية دون أي ضبابية أو خطوط باهتة",
    mode: "light",
    category: "EXECUTIVE_LIGHT",
    badgeAr: "موصى به - فائق الوضوح",
    colors: {
      primaryColor: "#1D4ED8", // Royal Blue
      primaryColorHover: "#1E40AF",
      primaryColorText: "#ffffff",
      secondaryColor: "#0284C7", // Bright Sky Blue
      backgroundColor: "#F1F5F9", // Crisp Clean Light Gray-Blue
      cardBackgroundColor: "#ffffff", // Pure Crisp White Document
      sidebarBackgroundColor: "#0F172A", // Dark Slate Navy for high distinction
      headerBackgroundColor: "#0B1329", // Dark Slate Navy Header
      textColor: "#000000", // Jet Black (100% Contrast)
      secondaryTextColor: "#1E293B", // Dark Slate Charcoal Black (100% Readable)
      borderColor: "#94A3B8", // Sharp Slate Border
      linkColor: "#0284C7",
      warningColor: "#d68910",
      errorColor: "#c0392b",
      successColor: "#1e7e34",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 15,
      headingScale: 1.3,
      lineHeight: 1.6,
      fontWeight: "semibold",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 2,
      shadowIntensity: "subtle",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "sap_horizon",
    nameAr: "Horizon (sap_horizon) - أساسي (الأحدث)",
    nameEn: "SAP Fiori Horizon Light (Default)",
    descriptionAr: "المظهر الأساسي الأحدث طبقاً لمعايير SAP Horizon بتدرجات رمادية محايدة مع لمسات كحلية داكنة وذهبية وتباين عالي للنصوص",
    mode: "light",
    category: "SAP_OFFICIAL",
    badgeAr: "الافتراضي المعتمد",
    colors: {
      primaryColor: "#0A2540", // Dark Navy
      primaryColorHover: "#1B365D",
      primaryColorText: "#ffffff",
      secondaryColor: "#D4AF37", // Company Identity Gold
      backgroundColor: "#F5F6F8", // SAP Horizon Neutral Light Gray
      cardBackgroundColor: "#ffffff", // Pure Crisp White
      sidebarBackgroundColor: "#0B1626", // Dark Navy Luxury Sidebar
      headerBackgroundColor: "#ffffff", // Clean Horizon Header
      textColor: "#111827", // High contrast dark slate
      secondaryTextColor: "#4B5563", // Crisp gray text
      borderColor: "#D1D5DB", // Neutral clean border
      linkColor: "#0854A0",
      warningColor: "#d68910",
      errorColor: "#c0392b",
      successColor: "#059669",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "subtle",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "sovereign_sapphire_platinum",
    nameAr: "الياقوت السيادي والبلاتين النقي (Sovereign Sapphire)",
    nameEn: "Sovereign Sapphire & Pure Platinum",
    descriptionAr: "تصميم سيادي ملكي فائق الفخامة والوضوح مصمم لصناديق الاستثمار والمؤسسات الكبرى بخلفية بلاتينية ناصعة وياقوت أزرق عميق وذهب نقي",
    mode: "light",
    category: "EXECUTIVE_LIGHT",
    badgeAr: "صناديق استثمارية سيادية",
    colors: {
      primaryColor: "#0F2B48", // Deep Sovereign Sapphire Navy
      primaryColorHover: "#19426D",
      primaryColorText: "#ffffff",
      secondaryColor: "#C59B27", // Sovereign Pure Gold
      backgroundColor: "#F2F5F9", // Crisp Ice Platinum
      cardBackgroundColor: "#ffffff", // Pure Crystal White
      sidebarBackgroundColor: "#0B1A2C", // Dark Sovereign Obsidian
      headerBackgroundColor: "#ffffff",
      textColor: "#0A1626", // Ultra-dense readable slate
      secondaryTextColor: "#475569",
      borderColor: "#CCD6E2",
      linkColor: "#0F2B48",
      warningColor: "#d68910",
      errorColor: "#c0392b",
      successColor: "#059669",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "medium",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "subtle",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "imperial_emerald_alabaster",
    nameAr: "الزمرد الإمبراطوري والعاجي الملكي (Imperial Emerald)",
    nameEn: "Imperial Emerald & Royal Alabaster",
    descriptionAr: "أناقة رسمية مستوحاة من الصروح المالية العالمية بمزيج أخضر الزمرد الملكي العميق والعاجي المريح للعين مع أرقام وجداول واضحة جداً",
    mode: "light",
    category: "EXECUTIVE_LIGHT",
    badgeAr: "راقي ومريح للعين",
    colors: {
      primaryColor: "#0B5345", // Deep Imperial Emerald
      primaryColorHover: "#0E6655",
      primaryColorText: "#ffffff",
      secondaryColor: "#B78727", // Royal Antique Gold
      backgroundColor: "#FAF9F5", // Soft Warm Alabaster Ivory
      cardBackgroundColor: "#ffffff",
      sidebarBackgroundColor: "#08231E", // Imperial Dark Emerald Forest
      headerBackgroundColor: "#ffffff",
      textColor: "#0B1E19", // Dark Slate Forest
      secondaryTextColor: "#425C54",
      borderColor: "#DCE5E0",
      linkColor: "#0B5345",
      warningColor: "#d68910",
      errorColor: "#C0392B",
      successColor: "#1E8449",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "subtle",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "crystal_diplomatic_indigo",
    nameAr: "النيلي الدبلوماسي والفضة الكريستالية (Diplomatic Indigo)",
    nameEn: "Diplomatic Indigo & Crystal Silver",
    descriptionAr: "مظهر حكومي ودبلوماسي رسمي رفيع المستوى يجمع بين النيلي الكحلي المتزن والفضة المعدنية مع تباين قراءة مثالي للأرقام والتقارير",
    mode: "light",
    category: "EXECUTIVE_LIGHT",
    badgeAr: "رسمي دبلوماسي",
    colors: {
      primaryColor: "#1B2A4A", // Diplomatic Navy
      primaryColorHover: "#283C66",
      primaryColorText: "#ffffff",
      secondaryColor: "#C99A45", // Diplomatic Gold
      backgroundColor: "#F3F6FA", // Crystal Silver White
      cardBackgroundColor: "#ffffff",
      sidebarBackgroundColor: "#101B30", // Deep Diplomatic Midnight
      headerBackgroundColor: "#ffffff",
      textColor: "#0D172A",
      secondaryTextColor: "#475569",
      borderColor: "#CFD8E3",
      linkColor: "#1B2A4A",
      warningColor: "#d68910",
      errorColor: "#c0392b",
      successColor: "#059669",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "subtle",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "titanium_swiss_gold",
    nameAr: "التيتانيوم الكربوني والذهب السويسري (Titanium Carbon)",
    nameEn: "Titanium Carbon & 24K Swiss Gold",
    descriptionAr: "ثيم مسائي فائق الرقي والجاذبية يجمع بين كربون التيتانيوم غير اللامع وبريق الذهب السويسري 24K مع تباين حاد ودقيق جداً",
    mode: "dark",
    category: "LUXURY_METALLIC",
    badgeAr: "فخامة تيتانيوم 24K",
    colors: {
      primaryColor: "#E5B869", // 24K Swiss Gold
      primaryColorHover: "#D4A352",
      primaryColorText: "#090D14",
      secondaryColor: "#38BDF8", // Ice Blue
      backgroundColor: "#090D14", // Deep Matte Titanium Carbon
      cardBackgroundColor: "#121A26", // Polished Obsidian Surface
      sidebarBackgroundColor: "#07090F",
      headerBackgroundColor: "#07090F",
      textColor: "#F9FAFB", // Pure Bright White
      secondaryTextColor: "#94A3B8", // Platinum Gray
      borderColor: "#223044", // Polished Steel Border
      linkColor: "#F1C40F",
      warningColor: "#F59E0B",
      errorColor: "#EF4444",
      successColor: "#10B981",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "medium",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "medium",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "obsidian_bronze_prestige",
    nameAr: "الأوبسيديان الملكي والبرونز المصقول (Obsidian Bronze)",
    nameEn: "Obsidian Slate & Polished Bronze",
    descriptionAr: "فخامة هادئة ودافئة للبيئات الليلية بالبرونز المصقول والأوبسيديان العميق لراحة تامة للعين وهيبة تنفيذية رفيعة",
    mode: "dark",
    category: "LUXURY_METALLIC",
    badgeAr: "برونز ملكي فاخر",
    colors: {
      primaryColor: "#D4A373", // Warm Polished Bronze
      primaryColorHover: "#C4905D",
      primaryColorText: "#0C0E14",
      secondaryColor: "#60A5FA", // Soft Blue
      backgroundColor: "#0C0E14", // Royal Obsidian
      cardBackgroundColor: "#151822",
      sidebarBackgroundColor: "#080A0E",
      headerBackgroundColor: "#080A0E",
      textColor: "#FAFAFA",
      secondaryTextColor: "#9EABC0",
      borderColor: "#262C3D",
      linkColor: "#E2B17D",
      warningColor: "#F59E0B",
      errorColor: "#EF4444",
      successColor: "#10B981",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "medium",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "executive_platinum_royal",
    nameAr: "بلاتينيوم النخبة والرمادي الملكي (Executive Platinum)",
    nameEn: "Executive Platinum & Royal Slate",
    descriptionAr: "ثيم تنفيذي رسمي فائق الوضوح مستوحى من واجهات البنوك ومجالس الإدارة العالمية بلمسات بلاتينية نقية وأزرق ملكي أنيق",
    mode: "light",
    category: "EXECUTIVE_LIGHT",
    badgeAr: "تنفيذي فاخر",
    colors: {
      primaryColor: "#1E40AF", // Royal Blue
      primaryColorHover: "#1D4ED8",
      primaryColorText: "#ffffff",
      secondaryColor: "#C5A880", // Champagne Gold
      backgroundColor: "#F4F6F9", // Executive Platinum Light
      cardBackgroundColor: "#ffffff", // Pure crisp white
      sidebarBackgroundColor: "#0E1726", // Executive Navy Obsidian
      headerBackgroundColor: "#ffffff",
      textColor: "#1a2b4c", // Slate 900
      secondaryTextColor: "#475569", // Slate 600
      borderColor: "#CBD5E1", // Slate 300
      linkColor: "#1D4ED8",
      warningColor: "#d68910",
      errorColor: "#c0392b",
      successColor: "#059669",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "medium",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "subtle",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "swiss_minimalist_ledger",
    nameAr: "المحاسب السويسري فائق الوضوح (Swiss Minimalist)",
    nameEn: "Swiss Minimalist Precision Ledger",
    descriptionAr: "دقة سويسرية متناهية ووضوح هندسي خالص للمدققين والمحاسبين القانونيين مع تباين أرقام وجداول فائق بدون أي تشويش",
    mode: "light",
    category: "EXECUTIVE_LIGHT",
    badgeAr: "وضوح فائق للمحاسبين",
    colors: {
      primaryColor: "#0F172A", // Deep Onyx Slate
      primaryColorHover: "#1E293B",
      primaryColorText: "#ffffff",
      secondaryColor: "#2563EB", // Cobalt Accent
      backgroundColor: "#f4f7fc", // Ice White
      cardBackgroundColor: "#ffffff",
      sidebarBackgroundColor: "#ffffff", // Pure White Minimalist Sidebar
      headerBackgroundColor: "#ffffff",
      textColor: "#020617", // Pure Deep Slate
      secondaryTextColor: "#6a7f9f", // Clear Dark Slate
      borderColor: "#CBD5E1", // Defined Border
      linkColor: "#2563EB",
      warningColor: "#d68910",
      errorColor: "#E11D48",
      successColor: "#059669",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.2,
      lineHeight: 1.55,
      fontWeight: "medium",
    },
    shapes: {
      tableCorners: "rounded-sm",
      buttonCorners: "rounded-sm",
      cardCorners: "rounded-md",
      borderWidth: 1,
      shadowIntensity: "none",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "compact",
    },
    zoomLevel: 100,
  },
  {
    id: "oxford_diplomatic_navy",
    nameAr: "الكحلي الدبلوماسي والعاجي الفاخر (Oxford Navy)",
    nameEn: "Oxford Diplomatic Navy & Ivory Crest",
    descriptionAr: "هيبة مؤسسية رفيعة تجمع بين الكحلي الملكي العريق والعاجي الفاتح المريح للعين أثناء ساعات العمل المحاسبي الطويلة",
    mode: "light",
    category: "EXECUTIVE_LIGHT",
    badgeAr: "رسمي مؤسسي",
    colors: {
      primaryColor: "#002147", // Classic Oxford Navy
      primaryColorHover: "#083266",
      primaryColorText: "#ffffff",
      secondaryColor: "#B38043", // Diplomatic Antique Gold
      backgroundColor: "#FAF9F6", // Alabaster Ivory
      cardBackgroundColor: "#ffffff",
      sidebarBackgroundColor: "#001A38", // Deep Oxford Midnight
      headerBackgroundColor: "#ffffff",
      textColor: "#1A202C", // Dark Charcoal
      secondaryTextColor: "#4A5568", // Gray 700
      borderColor: "#E2E8F0",
      linkColor: "#003B7A",
      warningColor: "#d68910",
      errorColor: "#C53030",
      successColor: "#2F855A",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "subtle",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "london_bank_mint",
    nameAr: "الضباب اللندني وأخضر النعناع المصرفي (London Fog)",
    nameEn: "London Fog & Banking Mint",
    descriptionAr: "طابع مصرفي راقٍ مستوحى من حي المال بلندن بمزيج أخضر النعناع الإسترليني والبرونز الذهبي مع خلفيات ناصعة",
    mode: "light",
    category: "EXECUTIVE_LIGHT",
    badgeAr: "بنوك وصرافة",
    colors: {
      primaryColor: "#0D7A68", // London Mint Teal
      primaryColorHover: "#0A6153",
      primaryColorText: "#ffffff",
      secondaryColor: "#C49752", // Bronze Gold
      backgroundColor: "#F1F5F5", // Cool London Mist
      cardBackgroundColor: "#ffffff",
      sidebarBackgroundColor: "#0A1C18", // Deep Forest Oxford
      headerBackgroundColor: "#ffffff",
      textColor: "#0A1C18", // Dark Emerald Charcoal
      secondaryTextColor: "#405852",
      borderColor: "#D0DFDC",
      linkColor: "#0D7A68",
      warningColor: "#d68910",
      errorColor: "#c0392b",
      successColor: "#059669",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.55,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "subtle",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "alabaster_royal_indigo",
    nameAr: "لؤلؤ المرمر والنيلي الملكي (Alabaster Indigo)",
    nameEn: "Alabaster Pearl & Royal Indigo",
    descriptionAr: "ألوان هادئة بلمسات النيلي الملكي والمرمر المضيء تمنح شعوراً بالاتساع والهدوء وتمنع إجهاد النظر نهائياً",
    mode: "light",
    category: "EXECUTIVE_LIGHT",
    badgeAr: "مريح للعين",
    colors: {
      primaryColor: "#4338CA", // Royal Indigo
      primaryColorHover: "#3730A3",
      primaryColorText: "#ffffff",
      secondaryColor: "#D97706", // Amber Crest
      backgroundColor: "#F7F8FC", // Soft Indigo Alabaster
      cardBackgroundColor: "#ffffff",
      sidebarBackgroundColor: "#131628", // Deep Indigo Velvet
      headerBackgroundColor: "#ffffff",
      textColor: "#111827",
      secondaryTextColor: "#4B5563",
      borderColor: "#E0E4F0",
      linkColor: "#4338CA",
      warningColor: "#d68910",
      errorColor: "#c0392b",
      successColor: "#059669",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-xl",
      borderWidth: 1,
      shadowIntensity: "subtle",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "geneva_private_banking",
    nameAr: "الخدمات المصرفية الخاصة بجنيف (Geneva Private Banking)",
    nameEn: "Geneva Private Banking & Gold",
    descriptionAr: "تصميم بنكي سويسري عريق باللون الكحلي الداكن والذهب السويسري النقي والخلفية البيضاء الكريستالية",
    mode: "light",
    category: "LUXURY_METALLIC",
    badgeAr: "مصرفي سويسري",
    colors: {
      primaryColor: "#1E3A5F", // Geneva Navy
      primaryColorHover: "#142942",
      primaryColorText: "#ffffff",
      secondaryColor: "#D4AF37", // Swiss Pure Gold
      backgroundColor: "#F6F8FA",
      cardBackgroundColor: "#ffffff",
      sidebarBackgroundColor: "#102136",
      headerBackgroundColor: "#ffffff",
      textColor: "#0E1B2A",
      secondaryTextColor: "#4A5D73",
      borderColor: "#D1D9E2",
      linkColor: "#1E3A5F",
      warningColor: "#d68910",
      errorColor: "#c0392b",
      successColor: "#059669",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "subtle",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "imperial_midnight_rosegold",
    nameAr: "الليل الإمبراطوري والذهب الوردي (Imperial Rose Gold)",
    nameEn: "Imperial Midnight & Rose Gold",
    descriptionAr: "فخامة استثنائية راقية تناسب مجالس الإدارة مع تباين ذهبي وردي على سواد ليلي عميق ومهيب",
    mode: "dark",
    category: "LUXURY_METALLIC",
    badgeAr: "قمة الفخامة والأناقة",
    colors: {
      primaryColor: "#E0A96D", // Rose Gold / Champagne Gold
      primaryColorHover: "#D49B5A",
      primaryColorText: "#070A0F",
      secondaryColor: "#60A5FA", // Sky Blue
      backgroundColor: "#0A0D14", // Imperial Midnight
      cardBackgroundColor: "#121722", // Deep Slate Obsidian
      sidebarBackgroundColor: "#070A0F",
      headerBackgroundColor: "#070A0F",
      textColor: "#FDFEFE", // Pure bright
      secondaryTextColor: "#A0ABC0", // Crisp Silver Gray
      borderColor: "#232B3B",
      linkColor: "#F6AD55",
      warningColor: "#F59E0B",
      errorColor: "#EF4444",
      successColor: "#10B981",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "medium",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "medium",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "nordic_arctic_aurora",
    nameAr: "الشفق الإسكندنافي والأردواز القطبي (Nordic Aurora)",
    nameEn: "Nordic Arctic & Aurora Mint",
    descriptionAr: "هدوء إسكندنافي عصري وأنيق مع درجات الأردواز القطبي ولمسات الشفق المنعشة المريحة للعين في البيئات المظلمة",
    mode: "dark",
    category: "ELEGANT_DARK",
    badgeAr: "عصري وأنيق",
    colors: {
      primaryColor: "#38BDF8", // Arctic Ice Blue
      primaryColorHover: "#0EA5E9",
      primaryColorText: "#0B131F",
      secondaryColor: "#34D399", // Aurora Mint
      backgroundColor: "#0B131F", // Nordic Arctic Slate
      cardBackgroundColor: "#111C2D", // Deep Arctic Card
      sidebarBackgroundColor: "#080E17",
      headerBackgroundColor: "#080E17",
      textColor: "#F8FAFC",
      secondaryTextColor: "#94A3B8",
      borderColor: "#1E2E45",
      linkColor: "#38BDF8",
      warningColor: "#F59E0B",
      errorColor: "#EF4444",
      successColor: "#10B981",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "medium",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "monaco_blue_titanium",
    nameAr: "الأزرق الموناكي والتيتانيوم المصقول (Monaco Titanium)",
    nameEn: "Monaco Blue & Polished Titanium",
    descriptionAr: "مظهر إدارة الثروات الأوروبية الفاخر بتدرجات النيلي الموناكي والتيتانيوم المعدني المصقول",
    mode: "dark",
    category: "ELEGANT_DARK",
    badgeAr: "إدارة ثروات",
    colors: {
      primaryColor: "#4F46E5", // Electric Royal Indigo
      primaryColorHover: "#4338CA",
      primaryColorText: "#ffffff",
      secondaryColor: "#38BDF8", // Yacht Cyan
      backgroundColor: "#0C1021", // Monaco Midnight
      cardBackgroundColor: "#141A33",
      sidebarBackgroundColor: "#090C1A",
      headerBackgroundColor: "#090C1A",
      textColor: "#EEF2FF",
      secondaryTextColor: "#8E9BB8",
      borderColor: "#252F5A",
      linkColor: "#818CF8",
      warningColor: "#F59E0B",
      errorColor: "#EF4444",
      successColor: "#10B981",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "medium",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "graphite_tech_amber",
    nameAr: "الجرافيت التقني والكهرمان العصري (Graphite Tech)",
    nameEn: "Graphite Tech & Pure Amber",
    descriptionAr: "طابع التقنية المالية الحديثة (FinTech) بجرافيت داكن غير لامع مع لمسات كهرمانية حية وواضحة جداً",
    mode: "dark",
    category: "ELEGANT_DARK",
    badgeAr: "تقنية مالية FinTech",
    colors: {
      primaryColor: "#F59E0B", // Luminous Amber
      primaryColorHover: "#D97706",
      primaryColorText: "#111215",
      secondaryColor: "#10B981", // Emerald Tech
      backgroundColor: "#111215", // Matte Graphite
      cardBackgroundColor: "#191B22",
      sidebarBackgroundColor: "#0D0E10",
      headerBackgroundColor: "#0D0E10",
      textColor: "#F9FAFB",
      secondaryTextColor: "#9CA3AF",
      borderColor: "#2B2F3D",
      linkColor: "#FBBF24",
      warningColor: "#F59E0B",
      errorColor: "#EF4444",
      successColor: "#10B981",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.55,
      fontWeight: "medium",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "medium",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "tokyo_cyber_violet",
    nameAr: "طوكيو التقني والبنفسج الحديث (Tokyo Cyber Violet)",
    nameEn: "Tokyo Cyberpunk & Ultra Violet",
    descriptionAr: "تصميم تقني مستقبلي أنيق بتدرجات البنفسج التكنولوجي والنيون الفيروزي لأعلى وضوح وشاشة عصرية",
    mode: "dark",
    category: "ELEGANT_DARK",
    badgeAr: "مستقبلي عصري",
    colors: {
      primaryColor: "#818CF8", // Electric Violet
      primaryColorHover: "#6366F1",
      primaryColorText: "#080711",
      secondaryColor: "#2DD4BF", // Neon Teal
      backgroundColor: "#080711", // Deep Space Violet
      cardBackgroundColor: "#110F24",
      sidebarBackgroundColor: "#05040B",
      headerBackgroundColor: "#05040B",
      textColor: "#F5F3FF",
      secondaryTextColor: "#A5B4FC",
      borderColor: "#241E45",
      linkColor: "#A78BFA",
      warningColor: "#F59E0B",
      errorColor: "#EF4444",
      successColor: "#10B981",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "intense",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "sap_horizon_dark",
    nameAr: "Horizon Dark (sap_horizon_dark) - المسائي",
    nameEn: "SAP Fiori Horizon Dark Mode",
    descriptionAr: "الوضع الليلي الاحترافي وفق معايير SAP Evening Horizon بخلفيات داكنة محايدة ولمسات كحلية وذهبية عالية التباين",
    mode: "dark",
    category: "SAP_OFFICIAL",
    badgeAr: "ليلي رسمي SAP",
    colors: {
      primaryColor: "#3B82F6", // SAP Horizon Bright Blue
      primaryColorHover: "#60A5FA",
      primaryColorText: "#ffffff",
      secondaryColor: "#D4AF37", // Company Identity Gold
      backgroundColor: "#0B111A", // Deep neutral slate dark
      cardBackgroundColor: "#141D2B", // Slate-Navy dark card
      sidebarBackgroundColor: "#0D1522",
      headerBackgroundColor: "#0D1522",
      textColor: "#FFFFFF", // Pure white for high contrast
      secondaryTextColor: "#94A3B8", // High contrast secondary
      borderColor: "#243248", // Defined border
      linkColor: "#60A5FA",
      warningColor: "#F59E0B",
      errorColor: "#EF4444",
      successColor: "#10B981",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "medium",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "sap_fiori_3",
    nameAr: "Quartz Light (sap_fiori_3) - كلاسيكي",
    nameEn: "SAP Fiori 3 Quartz Light (Fallback)",
    descriptionAr: "المظهر الكلاسيكي المعتمد لـ SAP Fiori 3 بتدرج الكوارتز الرمادي المزرق واللمسات الكحلية والذهبية",
    mode: "light",
    category: "SAP_OFFICIAL",
    badgeAr: "SAP كلاسيكي",
    colors: {
      primaryColor: "#0854A0", // SAP Classic Fiori Blue
      primaryColorHover: "#0A2540",
      primaryColorText: "#ffffff",
      secondaryColor: "#D4AF37", // Company Identity Gold
      backgroundColor: "#EFF4F9", // Classic SAP Quartz Light Background
      cardBackgroundColor: "#ffffff",
      sidebarBackgroundColor: "#ffffff",
      headerBackgroundColor: "#354A5F", // Classic Fiori Shell Header
      textColor: "#1B2733", // High contrast text
      secondaryTextColor: "#556B82",
      borderColor: "#D9E1E8",
      linkColor: "#0854A0",
      warningColor: "#E9730C",
      errorColor: "#BB0000",
      successColor: "#107E3E",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-md",
      borderWidth: 1,
      shadowIntensity: "subtle",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "fiori_light",
    nameAr: "المؤسسات الفاتح (Enterprise Fiori Light)",
    nameEn: "Enterprise Fiori Light",
    descriptionAr: "مظهر ناصع البياض مريح للعين مع تباين عالي مستوحى من واجهات الأعمال والشركات الكبرى",
    mode: "light",
    category: "EXECUTIVE_LIGHT",
    badgeAr: "مؤسسي خفيف",
    colors: {
      primaryColor: "#0284c7", // Sky 600
      primaryColorHover: "#0369a1", // Sky 700
      primaryColorText: "#ffffff",
      secondaryColor: "#d97706", // Amber 600
      backgroundColor: "#f8fafc", // Slate 50
      cardBackgroundColor: "#ffffff", // Pure White
      sidebarBackgroundColor: "#ffffff", // Pure White
      headerBackgroundColor: "#ffffff",
      textColor: "#0f172a", // Slate 900
      secondaryTextColor: "#64748b", // Slate 500
      borderColor: "#e2e8f0", // Slate 200
      linkColor: "#0284c7",
      warningColor: "#d97706",
      errorColor: "#dc2626",
      successColor: "#059669",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.5,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-md",
      borderWidth: 1,
      shadowIntensity: "subtle",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "yemen_emerald",
    nameAr: "الزمرد اليمني الأخضر (Yemen Emerald)",
    nameEn: "Yemen Emerald Green & Saba Gold",
    descriptionAr: "طابع تراثي يمني فاخر بالأخضر الزمردي والزيتي مع ذهب سبئي أصيل يعكس الأصالة والنمو",
    mode: "dark",
    category: "LUXURY_METALLIC",
    badgeAr: "أصالة يمنية",
    colors: {
      primaryColor: "#10b981", // Emerald 500
      primaryColorHover: "#059669", // Emerald 600
      primaryColorText: "#ffffff",
      secondaryColor: "#fbbf24", // Amber Gold 400
      backgroundColor: "#031c15", // Dark Emerald-Slate
      cardBackgroundColor: "#062b21", // Deep Pine
      sidebarBackgroundColor: "#042018",
      headerBackgroundColor: "#042018",
      textColor: "#ecfdf5", // Emerald 50
      secondaryTextColor: "#6ee7b7", // Emerald 300
      borderColor: "#064e3b", // Emerald 900
      linkColor: "#34d399",
      warningColor: "#f59e0b",
      errorColor: "#ef4444",
      successColor: "#10b981",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.5,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-lg",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "medium",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "royal_ruby_red",
    nameAr: "الياقوت الإمبراطوري الأحمر (Imperial Ruby Red)",
    nameEn: "Imperial Ruby Red",
    descriptionAr: "مظهر مالي جريء باللون العنابي والأحمر الياقوتي الفاخر يعكس الحزم والقوة المحاسبية",
    mode: "dark",
    category: "LUXURY_METALLIC",
    badgeAr: "قوة وحزم مالي",
    colors: {
      primaryColor: "#e11d48", // Rose 600
      primaryColorHover: "#be123c", // Rose 700
      primaryColorText: "#ffffff",
      secondaryColor: "#f59e0b", // Amber 500
      backgroundColor: "#170208", // Very dark crimson
      cardBackgroundColor: "#24040e", // Deep rose black
      sidebarBackgroundColor: "#1c030b",
      headerBackgroundColor: "#1c030b",
      textColor: "#fff1f2", // Rose 50
      secondaryTextColor: "#fda4af", // Rose 300
      borderColor: "#4c0519", // Rose 950
      linkColor: "#fb7185",
      warningColor: "#f59e0b",
      errorColor: "#ef4444",
      successColor: "#10b981",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.5,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "rounded-md",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "medium",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "ocean_blue_sapphire",
    nameAr: "المحيط الأزرق الياقوتي (Ocean Sapphire Blue)",
    nameEn: "Ocean Sapphire Blue",
    descriptionAr: "أزرق نيلي كلاسيكي مخصص للمصارف وشركات الصرافة والتحويلات المالية الدولية",
    mode: "dark",
    category: "ELEGANT_DARK",
    badgeAr: "صرافة وبنوك",
    colors: {
      primaryColor: "#2563eb", // Blue 600
      primaryColorHover: "#1d4ed8", // Blue 700
      primaryColorText: "#ffffff",
      secondaryColor: "#38bdf8", // Sky 400
      backgroundColor: "#030712", // Gray 950
      cardBackgroundColor: "#0f172a", // Slate 900
      sidebarBackgroundColor: "#0b1120",
      headerBackgroundColor: "#0b1120",
      textColor: "#f0fdf4",
      secondaryTextColor: "#93c5fd",
      borderColor: "#1e3a8a", // Blue 900
      linkColor: "#60a5fa",
      warningColor: "#f59e0b",
      errorColor: "#f87171",
      successColor: "#34d399",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.5,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "pill",
      cardCorners: "rounded-lg",
      borderWidth: 1,
      shadowIntensity: "medium",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "desert_sand_amber",
    nameAr: "رمال الصحراء والعنبر الدافئ (Desert Amber)",
    nameEn: "Desert Amber & Warm Sand",
    descriptionAr: "ثيم أرضي دافئ مستوحى من ألوان القهوة والرمال الذهبية المهدئة للعين",
    mode: "light",
    category: "LUXURY_METALLIC",
    badgeAr: "دافئ ومريح",
    colors: {
      primaryColor: "#b45309", // Amber 700
      primaryColorHover: "#92400e", // Amber 800
      primaryColorText: "#ffffff",
      secondaryColor: "#059669", // Emerald 600
      backgroundColor: "#fbf7ee", // Warm creamy beige
      cardBackgroundColor: "#ffffff", // Pure white card
      sidebarBackgroundColor: "#f5ece0", // Warm Sand
      headerBackgroundColor: "#f5ece0",
      textColor: "#451a03", // Amber 950
      secondaryTextColor: "#78350f", // Amber 900
      borderColor: "#e6d5bc", // Beige border
      linkColor: "#b45309",
      warningColor: "#d97706",
      errorColor: "#dc2626",
      successColor: "#059669",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 15,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "medium",
    },
    shapes: {
      tableCorners: "rounded-lg",
      buttonCorners: "rounded-lg",
      cardCorners: "rounded-xl",
      borderWidth: 1,
      shadowIntensity: "subtle",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "pure_dark_oled",
    nameAr: "السواد الفائق والتيتانيوم (OLED Pure Black)",
    nameEn: "OLED Pure Black & Gold",
    descriptionAr: "سواد كامل نقي #000000 موفر للطاقة وشاشات OLED مع لمسات ذهبية ومعدنية برّاقة",
    mode: "dark",
    category: "LUXURY_METALLIC",
    badgeAr: "شاشات OLED",
    colors: {
      primaryColor: "#eab308", // Yellow Gold 500
      primaryColorHover: "#ca8a04", // Gold 600
      primaryColorText: "#000000",
      secondaryColor: "#38bdf8", // Sky 400
      backgroundColor: "#000000", // Pure Black
      cardBackgroundColor: "#0a0a0a", // Neutral 950
      sidebarBackgroundColor: "#050505",
      headerBackgroundColor: "#050505",
      textColor: "#ffffff",
      secondaryTextColor: "#a3a3a3", // Neutral 400
      borderColor: "#262626", // Neutral 800
      linkColor: "#facc15",
      warningColor: "#f59e0b",
      errorColor: "#f87171",
      successColor: "#4ade80",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 15,
      headingScale: 1.3,
      lineHeight: 1.55,
      fontWeight: "medium",
    },
    shapes: {
      tableCorners: "rounded-sm",
      buttonCorners: "rounded-sm",
      cardCorners: "rounded-md",
      borderWidth: 1,
      shadowIntensity: "intense",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "sap_horizon_hcb",
    nameAr: "High Contrast Black (sap_horizon_hcb)",
    nameEn: "SAP Fiori Horizon High Contrast Black (HCB)",
    descriptionAr: "ثيم التباين العالي الداكن المعتمد رسمياً في SAP Fiori Horizon بسواد تام #000000 وحدود بيضاء ناصعة ولمسات ذهبية لتوافق تام مع معايير الوصول العالمية WCAG AAA",
    mode: "dark",
    category: "ACCESSIBILITY",
    badgeAr: "WCAG AAA تباين فائق",
    colors: {
      primaryColor: "#FFE600", // High-visibility contrast yellow
      primaryColorHover: "#FFF066",
      primaryColorText: "#000000",
      secondaryColor: "#D4AF37", // Company Identity Gold
      backgroundColor: "#000000", // Pure stark black
      cardBackgroundColor: "#000000", // Stark black
      sidebarBackgroundColor: "#000000",
      headerBackgroundColor: "#000000",
      textColor: "#FFFFFF", // Pure white
      secondaryTextColor: "#F3F4F6", // Ultra crisp bright gray
      borderColor: "#FFFFFF", // Crisp solid white borders
      linkColor: "#5EEAD4", // High visibility teal / cyan
      warningColor: "#FFE600",
      errorColor: "#FF4D4D",
      successColor: "#00FF66",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "square",
      buttonCorners: "rounded-sm",
      cardCorners: "rounded-sm",
      borderWidth: 2,
      shadowIntensity: "none",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "sap_horizon_hcw",
    nameAr: "High Contrast White (sap_horizon_hcw)",
    nameEn: "SAP Fiori Horizon High Contrast White (HCW)",
    descriptionAr: "ثيم التباين العالي الفاتح المعتمد رسمياً في SAP Fiori Horizon ببياض ناصع #FFFFFF ونصوص وحدود سوداء داكنة بالكامل لأعلى قراءة بصرية WCAG AAA",
    mode: "light",
    category: "ACCESSIBILITY",
    badgeAr: "WCAG AAA تباين فائق",
    colors: {
      primaryColor: "#000000", // Solid black
      primaryColorHover: "#1F2937",
      primaryColorText: "#FFFFFF",
      secondaryColor: "#92400E", // High contrast amber/gold
      backgroundColor: "#FFFFFF", // Pure white
      cardBackgroundColor: "#FFFFFF", // Pure white
      sidebarBackgroundColor: "#FFFFFF",
      headerBackgroundColor: "#FFFFFF",
      textColor: "#000000", // Pure solid black
      secondaryTextColor: "#1F2937", // Deep charcoal
      borderColor: "#000000", // Solid black borders
      linkColor: "#0000EE", // Classic high-contrast blue link
      warningColor: "#92400E",
      errorColor: "#991B1B",
      successColor: "#065F46",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 14,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "normal",
    },
    shapes: {
      tableCorners: "square",
      buttonCorners: "rounded-sm",
      cardCorners: "rounded-sm",
      borderWidth: 2,
      shadowIntensity: "none",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
  {
    id: "medo_official_dark",
    nameAr: "الهوية الرسمية - الوضع الليلي (Deep Navy Dark)",
    nameEn: "MeDo Official Deep Navy Dark Edition",
    descriptionAr: "الوضع الليلي الرسمي: خلفيات كحلية داكنة جداً للراحة البصرية، ونصوص بيضاء وزرقاء رمادية، مع تمييز ذهبي فاخر.",
    mode: "dark",
    category: "EXECUTIVE_DARK",
    badgeAr: "الوضع الليلي الرسمي",
    colors: {
      primaryColor: "#d4af37", // Gold for highlights in dark mode
      primaryColorHover: "#c49b2a",
      primaryColorText: "#0a1525", // Dark text on gold button
      secondaryColor: "#1A6B3C", // Emerald
      backgroundColor: "#0d1a2d", // Page bg
      cardBackgroundColor: "#0a1525", // Cards
      sidebarBackgroundColor: "#08111e", // Sidebar
      headerBackgroundColor: "#08111e", // Header
      textColor: "#e8ecf1", // Main text
      secondaryTextColor: "#8a9bb0", // Secondary text
      borderColor: "#1e2f4a", // Borders
      linkColor: "#d4af37", // Gold links
      warningColor: "#d68910",
      errorColor: "#c0392b",
      successColor: "#1e7e34",
    },
    typography: {
      fontFamily: "Cairo",
      baseFontSize: 15,
      headingScale: 1.25,
      lineHeight: 1.6,
      fontWeight: "semibold",
    },
    shapes: {
      tableCorners: "rounded-md",
      buttonCorners: "pill",
      cardCorners: "rounded-xl",
      borderWidth: 1,
      shadowIntensity: "subtle",
    },
    spacing: {
      buttonSize: "default",
      inputSize: "default",
      spacingDensity: "standard",
    },
    zoomLevel: 100,
  },
];
