/**
 * Authentication and Privilege Utilities
 */

export interface UserSessionData {
  userId?: string;
  username?: string;
  fullName?: string;
  role?: string;
  tenantId?: string;
  isSuperAdmin?: boolean;
  token?: string;
}

/**
 * Checks whether the current active session has administrative / managerial privileges.
 * Returns true if role is SYSTEM_ADMIN, SUPER_ADMIN, or MANAGER.
 */
export function checkAdminPrivileges(): boolean {
  if (typeof window === "undefined") return false;

  try {
    // 1. Check primary currentSession
    const sessionStr = localStorage.getItem("currentSession");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      const role = session.role?.toUpperCase();
      if (
        role === "SYSTEM_ADMIN" ||
        role === "SUPER_ADMIN" ||
        role === "ADMIN" ||
        role === "MANAGER" ||
        session.isSuperAdmin === true
      ) {
        return true;
      }
    }

    // 2. Check medo_erp_current_user_v1
    const userStr = localStorage.getItem("medo_erp_current_user_v1");
    if (userStr) {
      const user = JSON.parse(userStr);
      const role = user.role?.toUpperCase();
      if (
        role === "SYSTEM_ADMIN" ||
        role === "SUPER_ADMIN" ||
        role === "ADMIN" ||
        role === "MANAGER"
      ) {
        return true;
      }
    }

    // 3. Check sovereign admin gateway unlock session token
    const sovereignToken = sessionStorage.getItem("sovereign_admin_unlocked");
    if (sovereignToken === "true") {
      return true;
    }

    // 4. Check URL query params if role=MANAGER or role=SYSTEM_ADMIN
    if (typeof window.location !== "undefined" && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role")?.toUpperCase();
      if (roleParam === "MANAGER" || roleParam === "SYSTEM_ADMIN" || roleParam === "SUPER_ADMIN") {
        return true;
      }
    }
  } catch (e) {
    console.error("Error in checkAdminPrivileges:", e);
  }

  return false;
}

/**
 * Checks whether the user is logged into an active client tenant (customer / employee / tenant session)
 */
export function checkTenantSession(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const hasTenantInUrl = new URLSearchParams(window.location.search).has("tenant");
    const hasCurrentTenant = !!localStorage.getItem("currentTenant");
    const hasSession = !!localStorage.getItem("currentSession") || !!localStorage.getItem("medo_erp_current_user_v1");

    return hasTenantInUrl || hasCurrentTenant || hasSession;
  } catch (e) {
    return false;
  }
}
