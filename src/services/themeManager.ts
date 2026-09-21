import { PREDEFINED_THEMES, ThemeConfig } from "../types/theme";

const STORAGE_KEY = "medo_erp_theme_config";
const CUSTOM_THEMES_KEY = "medo_erp_custom_themes_list";

export class ThemeManager {
  private static currentTheme: ThemeConfig = PREDEFINED_THEMES[0];

  /**
   * Get the current active theme
   */
  public static getActiveTheme(): ThemeConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.colors && parsed.typography && parsed.shapes) {
          this.currentTheme = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load theme from localStorage, using default", e);
    }
    return this.currentTheme || PREDEFINED_THEMES[0];
  }

  /**
   * Get list of all available themes (predefined + saved custom themes)
   */
  public static getAllThemes(): ThemeConfig[] {
    const custom = this.getCustomThemes();
    return [...PREDEFINED_THEMES, ...custom];
  }

  /**
   * Get list of user-created custom themes
   */
  public static getCustomThemes(): ThemeConfig[] {
    try {
      const saved = localStorage.getItem(CUSTOM_THEMES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to parse custom themes", e);
    }
    return [];
  }

  /**
   * Save a theme to custom list
   */
  public static saveCustomTheme(theme: ThemeConfig): void {
    try {
      const currentList = this.getCustomThemes();
      const existingIdx = currentList.findIndex((t) => t.id === theme.id);
      let updated: ThemeConfig[];
      if (existingIdx >= 0) {
        updated = [...currentList];
        updated[existingIdx] = { ...theme, isCustom: true, updatedAt: new Date().toISOString() };
      } else {
        updated = [
          ...currentList,
          {
            ...theme,
            id: theme.id || `custom_${Date.now()}`,
            isCustom: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      }
      localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save custom theme", e);
    }
  }

  /**
   * Delete a custom theme
   */
  public static deleteCustomTheme(themeId: string): void {
    try {
      const currentList = this.getCustomThemes();
      const updated = currentList.filter((t) => t.id !== themeId);
      localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to delete custom theme", e);
    }
  }

  /**
   * Convert shape styles to CSS radius values
   */
  public static getRadiusValue(style: string): string {
    switch (style) {
      case "square":
        return "0px";
      case "rounded-sm":
        return "6px";
      case "rounded-md":
        return "12px";
      case "rounded-lg":
        return "18px";
      case "rounded-xl":
        return "24px";
      case "rounded-2xl":
        return "32px";
      case "pill":
        return "9999px";
      default:
        return "12px";
    }
  }

  /**
   * Convert shadow intensity to CSS box-shadow
   */
  public static getShadowValue(intensity: string): string {
    switch (intensity) {
      case "none":
        return "none";
      case "subtle":
        return "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)";
      case "medium":
        return "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2)";
      case "intense":
        return "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)";
      case "neon":
        return "0 0 15px rgba(56, 189, 248, 0.4), 0 0 30px rgba(16, 185, 129, 0.2)";
      default:
        return "0 4px 6px -1px rgba(0, 0, 0, 0.2)";
    }
  }

  /**
   * Apply a theme configuration immediately to the DOM
   */
  public static applyTheme(theme: ThemeConfig, persist = true): void {
    this.currentTheme = theme;
    if (persist) {
      try {
        if (theme.id === "sap_default" && !theme.isCustom) {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
        }
      } catch (e) {
        console.warn("Could not save active theme to localStorage", e);
      }
    }

    const root = document.documentElement;

    const { colors, typography, shapes, zoomLevel } = theme;

    // 1. Set CSS Custom Properties on :root
    root.style.setProperty("--theme-primary", colors.primaryColor);
    root.style.setProperty("--theme-primary-hover", colors.primaryColorHover);
    root.style.setProperty("--theme-primary-text", colors.primaryColorText);
    root.style.setProperty("--theme-secondary", colors.secondaryColor);
    root.style.setProperty("--theme-bg", colors.backgroundColor);
    root.style.setProperty("--theme-card", colors.cardBackgroundColor);
    root.style.setProperty("--theme-sidebar", colors.sidebarBackgroundColor);
    root.style.setProperty("--theme-header", colors.headerBackgroundColor);
    root.style.setProperty("--theme-text", colors.textColor);
    root.style.setProperty("--theme-text-muted", colors.secondaryTextColor);
    root.style.setProperty("--theme-border", colors.borderColor);
    root.style.setProperty("--theme-link", colors.linkColor);
    root.style.setProperty("--theme-warning", colors.warningColor);
    root.style.setProperty("--theme-error", colors.errorColor);
    root.style.setProperty("--theme-success", colors.successColor);

    // Typography
    root.style.setProperty("--theme-font-family", `'${typography.fontFamily}', system-ui, sans-serif`);
    root.style.setProperty("--theme-font-size", `${typography.baseFontSize}px`);
    root.style.setProperty("--theme-line-height", `${typography.lineHeight}`);
    root.style.setProperty("--theme-heading-scale", `${typography.headingScale}`);
    root.style.setProperty("--theme-font-weight", typography.fontWeight);

    // Shapes & Spacing
    root.style.setProperty("--theme-radius-table", this.getRadiusValue(shapes.tableCorners));
    root.style.setProperty("--theme-radius-btn", this.getRadiusValue(shapes.buttonCorners));
    root.style.setProperty("--theme-radius-card", this.getRadiusValue(shapes.cardCorners));
    root.style.setProperty("--theme-border-w", `${shapes.borderWidth}px`);
    root.style.setProperty("--theme-shadow", this.getShadowValue(shapes.shadowIntensity));

    // Zoom Level
    const validZoom = Math.min(Math.max(zoomLevel || 100, 50), 200);
    root.style.setProperty("--theme-zoom", `${validZoom / 100}`);
    
    // Direct style manipulations
    document.body.style.fontFamily = `'${typography.fontFamily}', system-ui, sans-serif`;
    document.body.style.backgroundColor = colors.backgroundColor;
    document.body.style.color = colors.textColor;

    // Apply zoom safely
    try {
      // @ts-ignore
      root.style.zoom = `${validZoom}%`;
    } catch (e) {
      console.warn("Browser does not support css zoom property", e);
    }

    // Toggle custom mode class
    if (theme.mode === "light") {
      root.classList.add("theme-light-mode");
      root.classList.remove("theme-dark-mode");
    } else {
      root.classList.add("theme-dark-mode");
      root.classList.remove("theme-light-mode");
    }

    // Toggle high-contrast class if applicable
    const isHCTheme = theme.id === "sap_horizon_hcb" || theme.id === "sap_horizon_hcw" || theme.id.includes("hcb") || theme.id.includes("hcw");
    const isHCModeEnabled = localStorage.getItem("medo_erp_high_contrast") === "true";
    
    if (isHCTheme || isHCModeEnabled) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Inject or update dynamic style tag for deep overrides
    this.injectDynamicStyles(theme);
  }

  /**
   * Remove any dynamic style overrides from head
   */
  public static removeDynamicStyles(): void {
    const styleTag = document.getElementById("medo-erp-theme-dynamic-styles");
    if (styleTag) {
      styleTag.remove();
    }
  }

  /**
   * Inject high-priority dynamic CSS to theme all existing standard components
   */
  private static injectDynamicStyles(theme: ThemeConfig): void {
    let styleTag = document.getElementById("medo-erp-theme-dynamic-styles");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "medo-erp-theme-dynamic-styles";
      document.head.appendChild(styleTag);
    }

    const { colors, typography, shapes } = theme;
    const tableRadius = this.getRadiusValue(shapes.tableCorners);
    const btnRadius = this.getRadiusValue(shapes.buttonCorners);
    const cardRadius = this.getRadiusValue(shapes.cardCorners);
    const shadowVal = this.getShadowValue(shapes.shadowIntensity);

    styleTag.textContent = `
      :root {
        --theme-primary: ${colors.primaryColor};
        --theme-bg: ${colors.backgroundColor};
        --theme-card: ${colors.cardBackgroundColor};
        --theme-border: ${colors.borderColor};
        --theme-text: ${colors.textColor};
        --theme-text-muted: ${colors.secondaryTextColor};
      }

      body {
        font-family: '${typography.fontFamily}', 'Noto Naskh Arabic', 'Amiri', 'Droid Arabic Naskh', 'Traditional Arabic', sans-serif !important;
        background-color: ${colors.backgroundColor} !important;
        color: ${colors.textColor} !important;
        font-size: ${typography.baseFontSize}px;
        line-height: ${typography.lineHeight};
      }

      /* Desktop & Mobile Headers: Always deep dark navy as in screenshots */
      header, .mobile-top-bar, [data-mobile-top-bar] {
        background-color: ${colors.headerBackgroundColor} !important;
        border-bottom: 1px solid #1E293B !important;
      }
      header h1, header h2, header h3, header h4, header h5, header h6,
      header .text-slate-100, header .text-slate-200, header .text-slate-300, header .text-white,
      .mobile-top-bar .text-slate-100, .mobile-top-bar .text-slate-200, .mobile-top-bar .text-slate-300, .mobile-top-bar .text-white,
      [data-mobile-top-bar] .text-slate-100, [data-mobile-top-bar] .text-slate-200, [data-mobile-top-bar] .text-slate-300, [data-mobile-top-bar] .text-white {
        color: #FFFFFF !important;
      }
      header .text-slate-400, header .text-slate-500,
      .mobile-top-bar .text-slate-400, .mobile-top-bar .text-slate-500,
      [data-mobile-top-bar] .text-slate-400, [data-mobile-top-bar] .text-slate-500 {
        color: #94A3B8 !important;
      }
      header input, .mobile-top-bar input, [data-mobile-top-bar] input {
        background-color: #1E293B !important;
        color: #F8FAFC !important;
        border: 1px solid #334155 !important;
      }

      /* Sidebar */
      aside {
        background-color: ${colors.sidebarBackgroundColor} !important;
      }
      aside h1, aside h2, aside h3, aside h4, aside h5, aside h6,
      aside .text-slate-100, aside .text-slate-200, aside .text-slate-300, aside .text-white {
        color: #FFFFFF !important;
      }
      aside .text-slate-400, aside .text-slate-500 {
        color: #94A3B8 !important;
      }

      /* Global Layout & Cards */
      .bg-slate-950 {
        background-color: ${colors.backgroundColor} !important;
      }

      /* Buttons & Corners */
      button, .rounded-xl, .rounded-lg, .rounded-2xl {
        border-radius: ${btnRadius};
      }
      
      /* Card shapes */
      .bg-slate-900.border, .bg-slate-900\\/80.border, .p-6.bg-slate-900, .p-5.bg-slate-900 {
        border-radius: ${cardRadius} !important;
        box-shadow: ${shadowVal};
      }

      /* Tables & Shapes */
      table {
        border-radius: ${tableRadius};
      }
      .overflow-hidden.rounded-xl, .overflow-hidden.rounded-2xl {
        border-radius: ${tableRadius} !important;
      }

      /* Primary colored highlights */
      .bg-emerald-600, .bg-emerald-700 {
        background-color: #059669 !important;
        color: #FFFFFF !important;
      }
      .bg-emerald-600:hover, .bg-emerald-700:hover {
        background-color: #047857 !important;
      }

      /* Inputs */
      input, select, textarea {
        border-radius: ${btnRadius} !important;
        border-width: ${shapes.borderWidth}px !important;
      }

      ${
        theme.mode === "light"
          ? `
        /* Light mode canvas and standard typography */
        main, #root > div, .min-h-screen {
          background-color: ${theme.colors.backgroundColor} !important;
          color: ${theme.colors.textColor} !important;
        }
        
        /* Table Styles matching Light Theme */
        table th, table thead th {
          background-color: ${theme.colors.sidebarBackgroundColor} !important;
          color: #FFFFFF !important;
          font-weight: 700 !important;
        }
        table tbody tr {
          background-color: #FFFFFF !important;
          border-bottom: 1px solid #E2E8F0 !important;
        }
        table tbody tr:hover {
          background-color: #F8FAFC !important;
        }
        table tbody td {
          color: ${theme.colors.textColor} !important;
        }
      `
          : `
        /* Dark mode enhancements */
        .text-slate-100, .text-slate-200, .text-white {
          color: #FFFFFF !important;
        }
        .text-slate-300 {
          color: #F8FAFC !important;
        }
        .text-slate-400 {
          color: #E2E8F0 !important;
        }
        .text-slate-500 {
          color: #CBD5E1 !important;
        }
        table th, table thead th {
          background-color: #0B1120 !important;
          color: #FFFFFF !important;
        }
      `
      }
    `;
  }

  /**
   * Reset theme to default system preset
   */
  public static resetToDefault(): ThemeConfig {
    const defaultTheme = PREDEFINED_THEMES[0];
    this.applyTheme(defaultTheme, true);
    return defaultTheme;
  }

  /**
   * Export theme as JSON file for download
   */
  public static exportThemeAsJSON(theme: ThemeConfig): void {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(theme, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    const safeName = (theme.nameEn || "custom_theme").toLowerCase().replace(/[^a-z0-9]/g, "_");
    downloadAnchor.setAttribute("download", `medo_erp_theme_${safeName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * Validate and parse an imported theme JSON string
   */
  public static importThemeFromJSON(jsonString: string): ThemeConfig {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.colors || !parsed.typography || !parsed.shapes) {
        throw new Error("بنية ملف الثيم غير متوافقة مع معايير MeDo ERP.");
      }
      const newTheme: ThemeConfig = {
        ...PREDEFINED_THEMES[0],
        ...parsed,
        id: parsed.id || `custom_${Date.now()}`,
        nameAr: parsed.nameAr || "ثيم مستورد مخصص",
        nameEn: parsed.nameEn || "Imported Custom Theme",
        isCustom: true,
        updatedAt: new Date().toISOString(),
      };
      this.saveCustomTheme(newTheme);
      this.applyTheme(newTheme, true);
      return newTheme;
    } catch (e: any) {
      throw new Error(`تعذر استيراد الثيم: ${e.message || "الملف غير صالح"}`);
    }
  }

  /**
   * Check if current active theme is in dark mode
   */
  public static isDarkMode(): boolean {
    const current = this.getActiveTheme();
    return current.mode !== "light";
  }

  /**
   * Toggle between dark mode and light mode presets
   */
  public static toggleDarkLightMode(): ThemeConfig {
    const current = this.getActiveTheme();
    if (current.mode === "light") {
      // Switch to SAP Horizon Dark Mode
      const darkTheme = PREDEFINED_THEMES.find((t) => t.id === "sap_horizon_dark") || PREDEFINED_THEMES[1];
      this.applyTheme(darkTheme, true);
      return darkTheme;
    } else {
      // Switch to SAP Horizon Light (Primary)
      const lightTheme = PREDEFINED_THEMES.find((t) => t.id === "sap_horizon") || PREDEFINED_THEMES[0];
      this.applyTheme(lightTheme, true);
      return lightTheme;
    }
  }

  /**
   * Check if current active theme is in High Contrast mode (SAP HCB or HCW)
   */
  public static isHighContrast(): boolean {
    const current = this.getActiveTheme();
    return current.id === "sap_horizon_hcb" || current.id === "sap_horizon_hcw" || localStorage.getItem("medo_erp_high_contrast") === "true";
  }

  /**
   * Toggle the High Contrast accessibility modifier
   */
  public static toggleHighContrast(target?: boolean): ThemeConfig {
    const current = this.getActiveTheme();
    const isCurrentlyHC = this.isHighContrast();
    const nextState = target !== undefined ? target : !isCurrentlyHC;

    if (nextState) {
      localStorage.setItem("medo_erp_high_contrast", "true");
    } else {
      localStorage.setItem("medo_erp_high_contrast", "false");
    }

    // Re-apply the current theme to trigger the classList updates
    this.applyTheme(current, true);
    return current;
  }
}
