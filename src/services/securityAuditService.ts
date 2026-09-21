import { ERPUser } from "../types/erp";
import { soundService } from "./notificationSoundService";

export interface ActiveSession {
  id: string;
  userId: string;
  username: string;
  email: string;
  role: string;
  branch: string;
  loginTime: string;
  lastActiveTime: string;
  ipAddress: string;
  userAgent: string;
  deviceType: string;
  location: string;
  status: "ACTIVE" | "TERMINATED" | "SUSPICIOUS";
  isCurrentSession?: boolean;
}

export type AuditActionType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "SESSION_TERMINATED"
  | "SECURITY_ALERT"
  | "AES_ENCRYPTION_TOGGLE"
  | "ROLE_CHANGED"
  | "SETTINGS_MODIFIED";

export type AuditRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditActionType;
  userId?: string;
  username: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo: string;
  location: string;
  riskLevel: AuditRiskLevel;
  details: string;
  status: "SUCCESS" | "FAILED" | "BLOCKED";
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  type: "SECURITY_ALERT" | "FAILED_LOGINS_EXCEEDED" | "SUSPICIOUS_SESSION" | "SYSTEM";
  title: string;
  message: string;
  ipAddress: string;
  deviceInfo: string;
  attemptCount: number;
  severity: "WARNING" | "HIGH" | "CRITICAL";
  isRead: boolean;
}

const AUDIT_LOGS_KEY = "medo_erp_security_audit_logs_v1";
const ACTIVE_SESSIONS_KEY = "medo_erp_active_sessions_v1";
const SYSTEM_ALERTS_KEY = "medo_erp_system_alerts_v1";
const FAILED_ATTEMPTS_KEY = "medo_erp_failed_login_window_v1";
const LOCKED_ACCOUNTS_KEY = "medo_erp_locked_accounts_v1";

export interface AccountLockRecord {
  email: string;
  lockedAt: number;
  lockDurationMs: number; // e.g. 15 minutes or 24 hours
  failedAttempts: number;
  ip: string;
  reason: string;
  unlockTime: number;
}

interface FailedAttemptRecord {
  ip: string;
  timestamp: number;
  email: string;
  deviceInfo: string;
}

export class SecurityAuditService {
  private static instance: SecurityAuditService;
  private listeners: Array<() => void> = [];
  private detectedIp: string = "197.230.14.88"; // Fallback realistic client IP (Yemen Telecom / Fiber)

  private constructor() {
    this.initAutoIpDetection();
    this.ensureSeedData();
  }

  public static getInstance(): SecurityAuditService {
    if (!SecurityAuditService.instance) {
      SecurityAuditService.instance = new SecurityAuditService();
    }
    return SecurityAuditService.instance;
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("medo_security_update"));
    }
  }

  // --- Auto IP & Device Detection ---
  private async initAutoIpDetection() {
    if (typeof window === "undefined") return;
    try {
      // Try fetching public IP with short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.ip) {
          this.detectedIp = data.ip;
        }
      }
    } catch {
      // Fallback stays as default realistic IP
    }
  }

  public getClientIp(): string {
    return this.detectedIp;
  }

  public getDeviceInfo(): { userAgent: string; deviceType: string; location: string } {
    if (typeof window === "undefined") {
      return { userAgent: "MeDo ERP Client/1.0", deviceType: "Desktop PC", location: "صنعاء، اليمن" };
    }
    const ua = navigator.userAgent;
    let deviceType = "كمبيوتر مكتبي (Windows / macOS)";
    if (/Mobile|Android|iPhone|iPad/i.test(ua)) {
      deviceType = "جهاز محمول (Mobile/Tablet)";
    }
    return {
      userAgent: ua.slice(0, 80),
      deviceType,
      location: "صنعاء - الفرع الرئيسي، اليمن",
    };
  }

  // --- Seed Data Initialization ---
  private ensureSeedData() {
    if (typeof window === "undefined") return;

    // Active Sessions Seed
    const savedSessions = localStorage.getItem(ACTIVE_SESSIONS_KEY);
    if (!savedSessions) {
      const now = new Date();
      const initialSessions: ActiveSession[] = [
        {
          id: `sess-curr-${Date.now().toString().slice(-4)}`,
          userId: "USR-001",
          username: "زياد بدر الدين",
          email: "zyadbdr925@gmail.com",
          role: "مدير النظام الأعلى (SYSTEM_ADMIN)",
          branch: "الفرع الرئيسي - صنعاء",
          loginTime: new Date(now.getTime() - 25 * 60000).toISOString(),
          lastActiveTime: new Date().toISOString(),
          ipAddress: this.getClientIp(),
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
          deviceType: "حاسوب محمول - Windows 11 Pro",
          location: "صنعاء - حدة، اليمن",
          status: "ACTIVE",
          isCurrentSession: true,
        },
        {
          id: "sess-aden-882",
          userId: "USR-002",
          username: "م. طارق العريقي",
          email: "tarek.aden@medoerp.com",
          role: "مدير فرع عدن (BRANCH_MANAGER)",
          branch: "فرع المنطقة الحرة - عدن",
          loginTime: new Date(now.getTime() - 140 * 60000).toISOString(),
          lastActiveTime: new Date(now.getTime() - 12 * 60000).toISOString(),
          ipAddress: "109.200.182.45",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/17.4",
          deviceType: "جهاز مكتب - macOS Sonoma",
          location: "عدن - المعلا، اليمن",
          status: "ACTIVE",
          isCurrentSession: false,
        },
        {
          id: "sess-exch-319",
          userId: "USR-003",
          username: "أحمد بن شهاب",
          email: "ahmed.exchange@medoerp.com",
          role: "محاسب الصرافة والتحويلات",
          branch: "مركز الصرافة والتحويلات - صنعاء",
          loginTime: new Date(now.getTime() - 310 * 60000).toISOString(),
          lastActiveTime: new Date(now.getTime() - 45 * 60000).toISOString(),
          ipAddress: "197.230.88.102",
          userAgent: "Mozilla/5.0 (Android 14; Mobile; rv:125.0) Gecko/125.0 Firefox/125.0",
          deviceType: "هاتف ذكي - Samsung Galaxy S24 Ultra",
          location: "صنعاء - التحرير، اليمن",
          status: "ACTIVE",
          isCurrentSession: false,
        },
      ];
      localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(initialSessions));
    }

    // Audit Logs Seed
    const savedLogs = localStorage.getItem(AUDIT_LOGS_KEY);
    if (!savedLogs) {
      const initialLogs: AuditLogEntry[] = [
        {
          id: `audit-${Date.now()}-101`,
          timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
          action: "LOGIN_SUCCESS",
          userId: "USR-001",
          username: "زياد بدر الدين",
          email: "zyadbdr925@gmail.com",
          ipAddress: this.getClientIp(),
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
          deviceInfo: "حاسوب محمول - Windows 11 Pro",
          location: "صنعاء - حدة، اليمن",
          riskLevel: "LOW",
          details: "تم تسجيل الدخول بنجاح عبر بوابة SAP Enterprise مع اجتياز فحص Google reCAPTCHA v3 (درجة الثقة: 98%).",
          status: "SUCCESS",
        },
        {
          id: `audit-${Date.now()}-102`,
          timestamp: new Date(Date.now() - 110 * 60000).toISOString(),
          action: "AES_ENCRYPTION_TOGGLE",
          userId: "USR-001",
          username: "زياد بدر الدين",
          email: "zyadbdr925@gmail.com",
          ipAddress: this.getClientIp(),
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          deviceInfo: "حاسوب محمول",
          location: "صنعاء، اليمن",
          riskLevel: "LOW",
          details: "تم تفعيل طبقة تشفير البيانات المحلية AES-256 GCM بنجاح لمنع الوصول المادي لقاعدة البيانات.",
          status: "SUCCESS",
        },
        {
          id: `audit-${Date.now()}-103`,
          timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
          action: "LOGIN_FAILED",
          username: "غير معروف",
          email: "admin_test@unknown-host.org",
          ipAddress: "185.220.101.4",
          userAgent: "Python-urllib/3.10 (Bot Scanner)",
          deviceInfo: "جهاز محاكي تلقائي (Automated Script)",
          location: "عنوان خارجي مشبوه",
          riskLevel: "HIGH",
          details: "محاولة تسجيل دخول فاشلة: كلمة مرور غير صحيحة مع توكن reCAPTCHA غير متوافق.",
          status: "FAILED",
        },
      ];
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(initialLogs));
    }
  }

  // --- Audit Log Management ---
  public getAuditLogs(): AuditLogEntry[] {
    try {
      const raw = localStorage.getItem(AUDIT_LOGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public recordAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp" | "ipAddress" | "userAgent" | "location"> & { ipAddress?: string; userAgent?: string; location?: string }): AuditLogEntry {
    const dev = this.getDeviceInfo();
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ipAddress: entry.ipAddress || this.getClientIp(),
      userAgent: entry.userAgent || dev.userAgent,
      location: entry.location || dev.location,
      ...entry,
    };

    const current = this.getAuditLogs();
    const updated = [newEntry, ...current].slice(0, 300); // Keep last 300 logs
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated));
    this.notify();
    return newEntry;
  }

  // --- Active Sessions Management ---
  public getActiveSessions(): ActiveSession[] {
    try {
      const raw = localStorage.getItem(ACTIVE_SESSIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public registerSession(user: ERPUser): ActiveSession {
    const dev = this.getDeviceInfo();
    const sessions = this.getActiveSessions();

    const newSession: ActiveSession = {
      id: `sess-${Date.now().toString().slice(-6)}`,
      userId: user.id,
      username: user.name,
      email: user.email || `${user.id.toLowerCase()}@medoerp.com`,
      role: user.role,
      branch: user.branch || "الفرع الرئيسي - صنعاء",
      loginTime: new Date().toISOString(),
      lastActiveTime: new Date().toISOString(),
      ipAddress: this.getClientIp(),
      userAgent: dev.userAgent,
      deviceType: dev.deviceType,
      location: dev.location,
      status: "ACTIVE",
      isCurrentSession: true,
    };

    // Mark previous current session as false
    const updated = [
      newSession,
      ...sessions.map((s) => ({ ...s, isCurrentSession: false })),
    ];

    localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(updated));

    // Audit log
    this.recordAuditLog({
      action: "LOGIN_SUCCESS",
      userId: user.id,
      username: user.name,
      email: user.email || `${user.id.toLowerCase()}@medoerp.com`,
      deviceInfo: dev.deviceType,
      riskLevel: "LOW",
      details: `تم إنشاء جلسة نشطة جديدة للفيصل/المستخدم "${user.name}" (${user.role}) من الفرع ${user.branch}.`,
      status: "SUCCESS",
    });

    // Real-Time Multi-Channel Notification Dispatcher to Manager
    try {
      fetch("/api/security/login-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.name,
          email: user.email || `${user.id.toLowerCase()}@medoerp.com`,
          companyName: user.branch || "المنظومة السحابية MeDo ERP",
          branchName: user.branch || "الفرع الرئيسي",
          role: user.role,
          ipAddress: this.getClientIp(),
          userAgent: dev.userAgent,
          deviceType: dev.deviceType,
          isTrial: user.plan === "TRIAL",
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => {
        console.warn("[SECURITY AUDIT] Login notification dispatch warning:", err);
      });
    } catch (e) {
      // Non-blocking
    }

    this.notify();
    return newSession;
  }

  public terminateSession(sessionId: string, terminatedBy: string = "مدير النظام"): boolean {
    const sessions = this.getActiveSessions();
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return false;

    const updated = sessions.map((s) =>
      s.id === sessionId ? { ...s, status: "TERMINATED" as const, isCurrentSession: false } : s
    );

    localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(updated));

    // Create Audit Entry
    this.recordAuditLog({
      action: "SESSION_TERMINATED",
      userId: target.userId,
      username: target.username,
      email: target.email,
      deviceInfo: target.deviceType,
      riskLevel: "HIGH",
      details: `تم إنهاء وإلغاء الجلسة النشطة (ID: ${sessionId}) قسراً بواسطة ${terminatedBy} لحماية الحساب من الأنشطة المشبوهة.`,
      status: "BLOCKED",
    });

    this.notify();
    return true;
  }

  // --- Failed Logins & Instant Security Alerting ---
  /**
   * Tracks failed login attempts in a rolling 1-minute (60s) window per IP/Device.
   * Triggers an instant `SystemAlert` when count exceeds 3 failed attempts!
   */
  public recordFailedLogin(email: string, username: string = "مستخدم غير معروف"): {
    failedCount: number;
    alertTriggered: boolean;
    alert?: SystemAlert;
  } {
    const clientIp = this.getClientIp();
    const dev = this.getDeviceInfo();
    const now = Date.now();
    const ONE_MINUTE_MS = 60 * 1000;

    // Load recent failed attempts window
    let failedHistory: FailedAttemptRecord[] = [];
    try {
      const raw = localStorage.getItem(FAILED_ATTEMPTS_KEY);
      if (raw) failedHistory = JSON.parse(raw);
    } catch {}

    // Filter attempts within the last 60 seconds for this IP
    const recentFromIp = failedHistory.filter(
      (rec) => rec.ip === clientIp && now - rec.timestamp <= ONE_MINUTE_MS
    );

    const newRecord: FailedAttemptRecord = {
      ip: clientIp,
      timestamp: now,
      email,
      deviceInfo: dev.deviceType,
    };

    const updatedHistory = [...failedHistory.filter((rec) => now - rec.timestamp <= ONE_MINUTE_MS * 5), newRecord];
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(updatedHistory));

    const currentFailedCount = recentFromIp.length + 1;

    // Record Audit Log for this failed attempt
    this.recordAuditLog({
      action: "LOGIN_FAILED",
      username,
      email,
      deviceInfo: dev.deviceType,
      riskLevel: currentFailedCount >= 3 ? "CRITICAL" : "MEDIUM",
      details: `محاولة دخول فاشلة لرقم البريد (${email}). المحاولة رقم (${currentFailedCount}) خلال دقيقة واحدة من نفس العنوان الرقمي ${clientIp}.`,
      status: "FAILED",
    });

    let alertTriggered = false;
    let alertObj: SystemAlert | undefined;

    // IF MORE THAN 3 FAILED ATTEMPTS IN 1 MINUTE -> TRIGGER INSTANT ALERT & SOUND & LOCK
    if (currentFailedCount >= 3) {
      // Play high-urgency security sound
      try {
        soundService.playSound("RADAR_SECURITY");
      } catch (e) {
        console.warn("Sound alert error:", e);
      }

      // Lock account for 15 minutes
      const lockDurationMs = 15 * 60 * 1000;
      this.lockAccount(email, lockDurationMs, currentFailedCount, `تجاوز الحد الأقصى لمحاولات الدخول الخاطئة (${currentFailedCount} محاولات).`);

      alertTriggered = true;
      alertObj = this.triggerSystemAlert({
        type: "FAILED_LOGINS_EXCEEDED",
        title: "⚠️ إنذار أمني فوري: رصد محاولات دخول خاطئة متتالية وقفل الحساب",
        message: `تم رصد ${currentFailedCount} محاولات دخول خاطئة متتالية للبريد (${email}) من الجهاز/عنوان IP (${clientIp}). تم إطلاق صفارة الإنذار وقفل الحساب لمدة 15 دقيقة وإخطار لوحة تحكم المسؤول فوراً.`,
        ipAddress: clientIp,
        deviceInfo: dev.deviceType,
        attemptCount: currentFailedCount,
        severity: "CRITICAL",
      });
    }

    this.notify();
    return {
      failedCount: currentFailedCount,
      alertTriggered,
      alert: alertObj,
    };
  }

  // --- Account Lockout Management ---
  public getLockedAccounts(): AccountLockRecord[] {
    try {
      const raw = localStorage.getItem(LOCKED_ACCOUNTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public isAccountLocked(email: string): { isLocked: boolean; remainingMinutes?: number; lockRecord?: AccountLockRecord } {
    if (!email) return { isLocked: false };
    const normalizedEmail = email.trim().toLowerCase();
    const locks = this.getLockedAccounts();
    const now = Date.now();

    const record = locks.find((l) => l.email.toLowerCase() === normalizedEmail);
    if (!record) return { isLocked: false };

    if (now < record.unlockTime) {
      const remainingMs = record.unlockTime - now;
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      return { isLocked: true, remainingMinutes, lockRecord: record };
    } else {
      // Lock expired, remove it
      this.unlockAccount(email, "انتهاء مهلة القفل التلقائي");
      return { isLocked: false };
    }
  }

  public lockAccount(email: string, durationMs: number = 15 * 60 * 1000, failedCount: number = 3, reason: string = "تجاوز محاولات الدخول الخاطئة"): AccountLockRecord {
    const normalizedEmail = email.trim().toLowerCase();
    const locks = this.getLockedAccounts().filter((l) => l.email.toLowerCase() !== normalizedEmail);
    const now = Date.now();

    const newLock: AccountLockRecord = {
      email: normalizedEmail,
      lockedAt: now,
      lockDurationMs: durationMs,
      failedAttempts: failedCount,
      ip: this.getClientIp(),
      reason,
      unlockTime: now + durationMs,
    };

    locks.push(newLock);
    localStorage.setItem(LOCKED_ACCOUNTS_KEY, JSON.stringify(locks));

    this.recordAuditLog({
      action: "SETTINGS_MODIFIED",
      username: email.split("@")[0] || email,
      email: normalizedEmail,
      deviceInfo: "نظام الحماية والأمان السيادي",
      riskLevel: "CRITICAL",
      details: `تم تفعيل قفل الحساب الوقائي (${normalizedEmail}) لمدة ${Math.round(durationMs / 60000)} دقيقة بعد ${failedCount} محاولات خاطئة متتالية.`,
      status: "BLOCKED",
    });

    this.notify();
    return newLock;
  }

  public unlockAccount(email: string, unlockedBy: string = "مدير النظام"): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const locks = this.getLockedAccounts();
    const filtered = locks.filter((l) => l.email.toLowerCase() !== normalizedEmail);
    localStorage.setItem(LOCKED_ACCOUNTS_KEY, JSON.stringify(filtered));

    // Clear failed history for this email
    try {
      const raw = localStorage.getItem(FAILED_ATTEMPTS_KEY);
      if (raw) {
        const history: FailedAttemptRecord[] = JSON.parse(raw);
        const updated = history.filter((h) => h.email.toLowerCase() !== normalizedEmail);
        localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(updated));
      }
    } catch {}

    this.recordAuditLog({
      action: "SETTINGS_MODIFIED",
      username: email.split("@")[0] || email,
      email: normalizedEmail,
      deviceInfo: "لوحة تحكم المسؤول (Security Console)",
      riskLevel: "MEDIUM",
      details: `تم إلغاء قفل الحساب وتصفير عداد المحاولات للبريد (${normalizedEmail}) بواسطة ${unlockedBy}.`,
      status: "SUCCESS",
    });

    this.notify();
    return true;
  }

  // --- System Alerts ---
  public getSystemAlerts(): SystemAlert[] {
    try {
      const raw = localStorage.getItem(SYSTEM_ALERTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public triggerSystemAlert(alert: Omit<SystemAlert, "id" | "timestamp" | "isRead">): SystemAlert {
    const newAlert: SystemAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...alert,
    };

    const current = this.getSystemAlerts();
    const updated = [newAlert, ...current].slice(0, 50);
    localStorage.setItem(SYSTEM_ALERTS_KEY, JSON.stringify(updated));

    // Dispatch global custom event for instant banner alert popup
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("medo_system_alert_triggered", { detail: newAlert })
      );
    }

    this.notify();
    return newAlert;
  }

  public markAlertAsRead(alertId: string) {
    const alerts = this.getSystemAlerts();
    const updated = alerts.map((a) => (a.id === alertId ? { ...a, isRead: true } : a));
    localStorage.setItem(SYSTEM_ALERTS_KEY, JSON.stringify(updated));
    this.notify();
  }

  public clearAlerts() {
    localStorage.setItem(SYSTEM_ALERTS_KEY, JSON.stringify([]));
    this.notify();
  }
}
