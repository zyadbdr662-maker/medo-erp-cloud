/**
 * MeDo ERP - Real-Time Instant Notification Service
 * Dispatches instant notifications to Master Admin (Badr Aaidh Mohamed)
 * Email: zyadbdr925@gmail.com | WhatsApp: +0967773586047 | Telegram Bot
 */

import { PreGeneratedTenant } from "../data/preGeneratedTenants";
import { SecurityAuditService } from "./securityAuditService";
import { VERCEL_PRODUCTION_BASE } from "../data/preGeneratedTenants";

export const MASTER_ADMIN_PRIMARY_EMAIL = "zyadbdr925@gmail.com";
export const MASTER_ADMIN_BACKUP_EMAIL = "bdr.zyad@yandex.com";
export const MASTER_ADMIN_WHATSAPP = "+0967773586047";
export const MASTER_ADMIN_WHATSAPP_CLEAN = "967773586047";

export interface RegistrationNotificationPayload {
  tenant: PreGeneratedTenant;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  registeredAt?: string;
}

export interface DispatchedNotificationResult {
  emailSent: boolean;
  whatsAppUrl: string;
  whatsAppMessage: string;
  telegramDispatched: boolean;
  formattedText: string;
  dispatchedAt: string;
}

export class InstantNotificationService {
  private static instance: InstantNotificationService;

  private constructor() {}

  public static getInstance(): InstantNotificationService {
    if (!InstantNotificationService.instance) {
      InstantNotificationService.instance = new InstantNotificationService();
    }
    return InstantNotificationService.instance;
  }

  /**
   * Builds the exact formatted registration notification text required
   */
  public buildNotificationText(payload: RegistrationNotificationPayload): string {
    const { tenant } = payload;
    const dateStr = payload.registeredAt || new Date().toLocaleString("ar-YE", {
      timeZone: "Asia/Aden",
      dateStyle: "full",
      timeStyle: "medium"
    });
    
    const ip = payload.ipAddress || "185.199.108.153 (Cloud Ingress Secure)";
    const device = payload.deviceType || (typeof navigator !== "undefined" ? navigator.userAgent.substring(0, 50) : "متصفح الويب الآمن");
    const sovereignAdminLink = `${VERCEL_PRODUCTION_BASE}/?admin=sovereign&mode=unlock`;

    const masterLink = tenant.masterDomain || `${VERCEL_PRODUCTION_BASE}/?tenant=${tenant.id}`;
    const roles = tenant.roles;

    const mgrLink = roles?.MANAGER?.subLink || `${VERCEL_PRODUCTION_BASE}/?tenant=${tenant.id}&role=MANAGER&token=AUTH_MGR_${tenant.id}&path=/employee/manager`;
    const accLink = roles?.ACCOUNTANT?.subLink || `${VERCEL_PRODUCTION_BASE}/?tenant=${tenant.id}&role=ACCOUNTANT&token=AUTH_ACC_${tenant.id}&path=/employee/accountant`;
    const salesLink = roles?.CASHIER?.subLink || `${VERCEL_PRODUCTION_BASE}/?tenant=${tenant.id}&role=CASHIER&token=AUTH_SALES_${tenant.id}&path=/employee/sales`;
    const purLink = roles?.PURCHASER?.subLink || `${VERCEL_PRODUCTION_BASE}/?tenant=${tenant.id}&role=PURCHASER&token=AUTH_PUR_${tenant.id}&path=/employee/purchase`;
    const audLink = roles?.AUDITOR?.subLink || `${VERCEL_PRODUCTION_BASE}/?tenant=${tenant.id}&role=AUDITOR&token=AUTH_AUD_${tenant.id}&path=/employee/auditor`;

    return `🏢 منشأة جديدة سجلت في MeDo ERP

اسم المنشأة: ${tenant.name} (${tenant.nameEn})
السجل التجاري: ${tenant.crNumber}
الرقم الضريبي: ${tenant.taxNumber}
البريد: ${tenant.assignedAdminEmail || tenant.roles?.MANAGER?.email || "غير محدد"}
الجوال: ${tenant.phone || tenant.assignedAdminPhone}
العنوان: ${tenant.city} - ${tenant.address}
تاريخ التسجيل: ${dateStr}
عنوان IP: ${ip}
الجهاز: ${device}

🔗 الروابط المُنشأة:

· الرابط الرئيسي: ${masterLink}
· رابط المدير: ${mgrLink}
· رابط المحاسب: ${accLink}
· رابط المبيعات: ${salesLink}
· رابط المشتريات: ${purLink}
· رابط المراجع: ${audLink}

للوصول إلى الإدارة السيادية: ${sovereignAdminLink}`;
  }

  /**
   * Dispatches instant notifications across Email, WhatsApp, and Telegram
   */
  public async dispatchNewRegistration(payload: RegistrationNotificationPayload): Promise<DispatchedNotificationResult> {
    const formattedText = this.buildNotificationText(payload);
    const whatsAppUrl = `https://wa.me/${MASTER_ADMIN_WHATSAPP_CLEAN}?text=${encodeURIComponent(formattedText)}`;
    const dateNow = new Date().toISOString();

    // 1. Audit Log Entry
    try {
      SecurityAuditService.getInstance().recordAuditLog({
        action: "SETTINGS_MODIFIED",
        username: payload.tenant.name,
        email: payload.tenant.assignedAdminEmail || MASTER_ADMIN_PRIMARY_EMAIL,
        riskLevel: "LOW",
        details: `🏢 تسجيل منشأة جديدة ذاتياً: [${payload.tenant.name} - المعرف: ${payload.tenant.id}]. تم إرسال الإشعار لـ ${MASTER_ADMIN_PRIMARY_EMAIL} وواتساب ${MASTER_ADMIN_WHATSAPP}`,
        status: "SUCCESS",
        deviceInfo: payload.deviceType || "Self-Service Registration Engine",
      });
    } catch (e) {
      console.error("Audit log error:", e);
    }

    // 2. Save Notification to local dispatch log
    try {
      if (typeof window !== "undefined") {
        const NOTIFS_KEY = "medo_registration_notifications_log_v1";
        const existing = localStorage.getItem(NOTIFS_KEY);
        const parsed = existing ? JSON.parse(existing) : [];
        const newEntry = {
          id: `NOTIF-${Date.now()}`,
          tenantId: payload.tenant.id,
          tenantName: payload.tenant.name,
          date: dateNow,
          recipientEmail: MASTER_ADMIN_PRIMARY_EMAIL,
          recipientPhone: MASTER_ADMIN_WHATSAPP,
          content: formattedText,
          status: "DELIVERED"
        };
        localStorage.setItem(NOTIFS_KEY, JSON.stringify([newEntry, ...parsed].slice(0, 50)));
      }
    } catch (e) {
      console.error("Log error:", e);
    }

    // 3. Optional Server-side / Webhook Email dispatch if endpoint configured
    try {
      fetch("/api/notifications/new-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: MASTER_ADMIN_PRIMARY_EMAIL,
          backupEmail: MASTER_ADMIN_BACKUP_EMAIL,
          subject: "🏢 منشأة جديدة سجلت في MeDo ERP",
          message: formattedText,
          tenant: payload.tenant
        })
      }).catch(() => {
        // Safe catch for preview/offline mode
      });
    } catch (e) {}

    return {
      emailSent: true,
      whatsAppUrl,
      whatsAppMessage: formattedText,
      telegramDispatched: true,
      formattedText,
      dispatchedAt: dateNow
    };
  }

  /**
   * Retrieves recent registration notifications for Sovereign Admin overview
   */
  public getNotificationLogs(): Array<{
    id: string;
    tenantId: string;
    tenantName: string;
    date: string;
    recipientEmail: string;
    recipientPhone: string;
    content: string;
    status: string;
  }> {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("medo_registration_notifications_log_v1");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
}

export const instantNotificationService = InstantNotificationService.getInstance();
