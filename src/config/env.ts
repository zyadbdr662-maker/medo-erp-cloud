/**
 * Application Environment Configuration
 * 
 * Defines whether the app runs in Production (Customer mode) 
 * or Development (Admin/SaaS mode).
 * 
 * VITE_APP_ENV can be set in .env file.
 * Defaults to "production" (Customer mode) for strict isolation.
 */
export const IS_ADMIN_ENV = import.meta.env.VITE_APP_ENV === "development";
