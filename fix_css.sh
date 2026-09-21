sed -i '1282,$d' src/index.css

cat << 'INNER_EOF' >> src/index.css

/* 
  ==========================================================================
   8. UNIFIED SAP COLOR PALETTE & THEME COMPATIBILITY
   ========================================================================== 
*/

:root {
  /* Fallback to dynamic theme variables to ensure full compatibility */
  --sap-primary: var(--theme-primary, #1A6B3C);
  --sap-secondary: var(--theme-secondary, #D4AF37);
  --sap-dark: var(--theme-sidebar, #0A2E1A);
  --sap-light: var(--theme-bg, #F4F7FC);
  --sap-text-inverse: var(--theme-primary-text, #FFFFFF);
  --sap-border: var(--theme-border, #D1D5DB);
}

@theme {
  --color-sap-primary: var(--sap-primary);
  --color-sap-secondary: var(--sap-secondary);
  --color-sap-dark: var(--sap-dark);
  --color-sap-light: var(--sap-light);
}

/* Universal SAP Green & Gold Application Classes */
.sap-primary-bg, button[type="submit"], .btn-primary {
  background-color: var(--sap-primary) !important;
  color: var(--sap-text-inverse) !important;
}

.sap-secondary-bg, .btn-secondary {
  background-color: var(--sap-secondary) !important;
  color: var(--theme-text, #0A2E1A) !important;
}

.sap-primary-text {
  color: var(--sap-primary) !important;
}

.sap-secondary-text {
  color: var(--sap-secondary) !important;
}

.sap-primary-border {
  border-color: var(--sap-primary) !important;
}

.sap-secondary-border {
  border-color: var(--sap-secondary) !important;
}

/* Navbar & Header override */
header, .navbar, nav.top-nav {
  background-color: var(--theme-header, var(--sap-primary)) !important;
  border-color: var(--theme-border, rgba(212, 175, 55, 0.3)) !important;
}

/* Dynamic overrides for hardcoded tailwind classes used globally */
.bg-\[\#1A6B3C\] { background-color: var(--sap-primary) !important; }
.text-\[\#1A6B3C\] { color: var(--sap-primary) !important; }
.border-\[\#1A6B3C\] { border-color: var(--sap-primary) !important; }

.bg-\[\#D4AF37\] { background-color: var(--sap-secondary) !important; }
.text-\[\#D4AF37\] { color: var(--sap-secondary) !important; }
.border-\[\#D4AF37\] { border-color: var(--sap-secondary) !important; }
INNER_EOF
bash fix_css.sh
