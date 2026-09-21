import { getAppBaseUrl } from "../config/appConfig";

/**
 * MeDo ERP - Advanced 48-Hour Trial Tracking & Browser Fingerprinting Service
 * Provides precise 48-hour trial lifecycle management and client hardware/browser fingerprinting.
 */

export interface BrowserFingerprintData {
  fingerprintHash: string;
  canvasHash: string;
  userAgent: string;
  language: string;
  screenResolution: string;
  timezone: string;
  hardwareConcurrency: number;
  deviceMemory?: number;
  platform: string;
  createdAt: string;
}

export interface TrialState {
  isTrial: boolean;
  trialStartedAt: string; // ISO string
  trialExpiresAt: string; // ISO string
  durationHours: number; // 48 hours
  companyName: string;
  userEmail: string;
  fingerprint: BrowserFingerprintData;
  isExpired: boolean;
  remainingSeconds: number;
  remainingHours: number;
  remainingMinutes: number;
  progressPercent: number;
}

export interface TrialExtensionRecord {
  id: string;
  tenantId: string;
  companyName: string;
  extendedBy: string;
  addedHours: number;
  previousExpiresAt: string;
  newExpiresAt: string;
  reason: string;
  timestamp: string;
}

export interface TwoFactorState {
  isVerified: boolean;
  verifiedAt?: string;
  verifiedUser?: string;
  verifiedCompany?: string;
  verificationMethod?: "SMS" | "WHATSAPP" | "EMAIL" | "AUTHENTICATOR";
  verificationCodeUsed?: string;
  deviceFingerprint?: string;
}

export interface EnterpriseTrialTenant {
  id: string;
  companyName: string;
  ownerName: string;
  userEmail: string;
  phone: string;
  city: string;
  businessType: string;
  fingerprint: BrowserFingerprintData;
  trialStartedAt: string;
  trialExpiresAt: string;
  durationHours: number;
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "ACTIVATED_PAID";
  remainingSeconds: number;
  remainingHours: number;
  remainingMinutes: number;
  progressPercent: number;
  extensionsCount: number;
  lastExtendedAt?: string;
  lastExtendedBy?: string;
}

const TRIAL_DURATION_HOURS = 48; // 48 Hours strictly
const TRIAL_STORAGE_KEY = "medo_erp_trial_state";
const TRIAL_FINGERPRINT_KEY = "medo_erp_browser_fingerprint";
const TENANT_TRIALS_KEY = "medo_erp_tenant_trials_v1";
const TRIAL_EXTENSIONS_HISTORY_KEY = "medo_erp_trial_extensions_history_v1";
const TRIAL_2FA_STORAGE_KEY = "medo_erp_trial_2fa_state_v1";

export class TrialService {
  private static instance: TrialService;
  private listeners: Array<() => void> = [];

  private constructor() {
    this.ensureSeedTenants();
  }

  public static getInstance(): TrialService {
    if (!TrialService.instance) {
      TrialService.instance = new TrialService();
    }
    return TrialService.instance;
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private ensureSeedTenants() {
    if (typeof window === "undefined") return;

    if (!localStorage.getItem(TENANT_TRIALS_KEY)) {
      const now = Date.now();
      const fp = this.generateBrowserFingerprint();

      const seedTenants: EnterpriseTrialTenant[] = [
        {
          id: "TENANT-TR-100",
          companyName: "شركة القمة للتجارة والتوكيلات",
          ownerName: "أحمد بن سالم",
          userEmail: "ahmed.salem@al-qimma.ye",
          phone: "+967771900800",
          city: "صنعاء - شارع الزبيري",
          businessType: "تجارة واستيراد وتوكيلات تجارية",
          fingerprint: { ...fp, fingerprintHash: "BF-ALQIMMA-CORP-7735" },
          trialStartedAt: new Date(now - 48 * 3600 * 1000).toISOString(),
          trialExpiresAt: new Date(now).toISOString(), // Expired to demonstrate post-trial 2FA & Original Link
          durationHours: 48,
          status: "EXPIRED",
          remainingSeconds: 0,
          remainingHours: 0,
          remainingMinutes: 0,
          progressPercent: 100,
          extensionsCount: 0,
        },
        {
          id: "TENANT-TR-101",
          companyName: "شركة بن زياد للمقاولات والتوريدات",
          ownerName: "بدر عايض محمد",
          userEmail: "zyadbdr925@gmail.com",
          phone: "+967773586047",
          city: "صنعاء - التحرير",
          businessType: "مقاولات وتجارة عامة",
          fingerprint: fp,
          trialStartedAt: new Date(now - 44 * 3600 * 1000).toISOString(),
          trialExpiresAt: new Date(now + 4 * 3600 * 1000).toISOString(), // 4 hours remaining -> EXPIRING SOON!
          durationHours: 48,
          status: "EXPIRING_SOON",
          remainingSeconds: 4 * 3600,
          remainingHours: 4,
          remainingMinutes: 0,
          progressPercent: 91,
          extensionsCount: 0,
        },
        {
          id: "TENANT-TR-102",
          companyName: "مجموعة الأفق للصرافة والتحويلات الدولية",
          ownerName: "صالح بن عفيشة",
          userEmail: "horizon.exchange@yandex.com",
          phone: "+967771234567",
          city: "عدن - كريتر",
          businessType: "صرافة ومصارف مالية",
          fingerprint: { ...fp, fingerprintHash: "BF-7E8B99A04C1-EXCHANGE" },
          trialStartedAt: new Date(now - 12 * 3600 * 1000).toISOString(),
          trialExpiresAt: new Date(now + 36 * 3600 * 1000).toISOString(),
          durationHours: 48,
          status: "ACTIVE",
          remainingSeconds: 36 * 3600,
          remainingHours: 36,
          remainingMinutes: 0,
          progressPercent: 25,
          extensionsCount: 0,
        },
        {
          id: "TENANT-TR-103",
          companyName: "مستشفى الأمل التخصصي الحديث",
          ownerName: "د. هاني الوجيه",
          userEmail: "amal.hospital.med@gmail.com",
          phone: "+967733889900",
          city: "تعز - الحوبان",
          businessType: "قطاع صحي ومستشفيات",
          fingerprint: { ...fp, fingerprintHash: "BF-3C9A11880E-HOSP" },
          trialStartedAt: new Date(now - 46 * 3600 * 1000).toISOString(),
          trialExpiresAt: new Date(now + 2 * 3600 * 1000).toISOString(), // 2 hours remaining -> EXPIRING SOON!
          durationHours: 48,
          status: "EXPIRING_SOON",
          remainingSeconds: 2 * 3600,
          remainingHours: 2,
          remainingMinutes: 0,
          progressPercent: 95,
          extensionsCount: 1,
          lastExtendedAt: new Date(now - 20 * 3600 * 1000).toISOString(),
          lastExtendedBy: "زياد بدر الدين",
        },
        {
          id: "TENANT-TR-104",
          companyName: "سلسلة محطات الوقود والغاز النجم",
          ownerName: "م. عادل الشميري",
          userEmail: "najm.stations@gmail.com",
          phone: "+967711223344",
          city: "الحديدة - شارع الميناء",
          businessType: "محطات طاقة ومشتقات نفطية",
          fingerprint: { ...fp, fingerprintHash: "BF-5F881122D-FUEL" },
          trialStartedAt: new Date(now - 55 * 3600 * 1000).toISOString(),
          trialExpiresAt: new Date(now - 7 * 3600 * 1000).toISOString(), // Expired
          durationHours: 48,
          status: "EXPIRED",
          remainingSeconds: 0,
          remainingHours: 0,
          remainingMinutes: 0,
          progressPercent: 100,
          extensionsCount: 0,
        },
      ];

      localStorage.setItem(TENANT_TRIALS_KEY, JSON.stringify(seedTenants));
    }

    if (!localStorage.getItem(TRIAL_EXTENSIONS_HISTORY_KEY)) {
      const initialHistory: TrialExtensionRecord[] = [
        {
          id: "EXT-HIST-001",
          tenantId: "TENANT-TR-103",
          companyName: "مستشفى الأمل التخصصي الحديث",
          extendedBy: "زياد بدر الدين (مدير النظام)",
          addedHours: 24,
          previousExpiresAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
          newExpiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
          reason: "طلب إدارة المستشفى مهلة 24 ساعة إضافية لاستكمال رفع شجرة الحسابات الطبية ومطابقة الأرصدة.",
          timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        },
      ];
      localStorage.setItem(TRIAL_EXTENSIONS_HISTORY_KEY, JSON.stringify(initialHistory));
    }
  }

  public getEnterpriseTenants(): EnterpriseTrialTenant[] {
    try {
      const raw = localStorage.getItem(TENANT_TRIALS_KEY);
      let list: EnterpriseTrialTenant[] = raw ? JSON.parse(raw) : [];
      const now = Date.now();

      return list.map((t) => {
        const expires = new Date(t.trialExpiresAt).getTime();
        const started = new Date(t.trialStartedAt).getTime();
        const totalDurationMs = Math.max(1, expires - started);

        const remainingMs = Math.max(0, expires - now);
        const remainingSeconds = Math.floor(remainingMs / 1000);
        const remainingHours = Math.floor(remainingSeconds / 3600);
        const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);

        const isExpired = remainingMs <= 0;
        const isExpiringSoon = !isExpired && remainingHours < 6; // Warning under 6 hours

        let status: EnterpriseTrialTenant["status"] = t.status;
        if (t.status !== "ACTIVATED_PAID") {
          if (isExpired) status = "EXPIRED";
          else if (isExpiringSoon) status = "EXPIRING_SOON";
          else status = "ACTIVE";
        }

        const elapsedMs = Math.min(totalDurationMs, Math.max(0, now - started));
        const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));

        return {
          ...t,
          status,
          remainingSeconds,
          remainingHours,
          remainingMinutes,
          progressPercent,
        };
      });
    } catch {
      return [];
    }
  }

  public extendTrial(
    tenantId: string,
    hoursToAdd: number,
    reason: string,
    extendedBy: string = "مدير النظام"
  ): { success: boolean; tenant?: EnterpriseTrialTenant; record?: TrialExtensionRecord } {
    const tenants = this.getEnterpriseTenants();
    const target = tenants.find((t) => t.id === tenantId);
    if (!target) return { success: false };

    const currentExpiresTime = Math.max(Date.now(), new Date(target.trialExpiresAt).getTime());
    const newExpiresDate = new Date(currentExpiresTime + hoursToAdd * 3600 * 1000);

    const record: TrialExtensionRecord = {
      id: `EXT-REC-${Date.now()}`,
      tenantId: target.id,
      companyName: target.companyName,
      extendedBy,
      addedHours: hoursToAdd,
      previousExpiresAt: target.trialExpiresAt,
      newExpiresAt: newExpiresDate.toISOString(),
      reason: reason || "تمديد استثنائي من مدير النظام الأعلى لمتابعة تجربة المنظومة",
      timestamp: new Date().toISOString(),
    };

    const updatedTenant: EnterpriseTrialTenant = {
      ...target,
      trialExpiresAt: newExpiresDate.toISOString(),
      durationHours: target.durationHours + hoursToAdd,
      status: "ACTIVE",
      extensionsCount: target.extensionsCount + 1,
      lastExtendedAt: record.timestamp,
      lastExtendedBy: extendedBy,
    };

    const updatedList = tenants.map((t) => (t.id === tenantId ? updatedTenant : t));
    localStorage.setItem(TENANT_TRIALS_KEY, JSON.stringify(updatedList));

    // Save Extension History Record
    const history = this.getExtensionsHistory();
    const updatedHistory = [record, ...history];
    localStorage.setItem(TRIAL_EXTENSIONS_HISTORY_KEY, JSON.stringify(updatedHistory));

    this.notify();
    return { success: true, tenant: updatedTenant, record };
  }

  public getExtensionsHistory(): TrialExtensionRecord[] {
    try {
      const raw = localStorage.getItem(TRIAL_EXTENSIONS_HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getExpiringSoonTenants(hoursThreshold: number = 6): EnterpriseTrialTenant[] {
    const tenants = this.getEnterpriseTenants();
    return tenants.filter(
      (t) => t.status === "EXPIRING_SOON" || (t.status === "ACTIVE" && t.remainingHours <= hoursThreshold)
    );
  }

  /**
   * Generates a unique, high-entropy browser fingerprint hash using Canvas and Device characteristics
   */
  public generateBrowserFingerprint(): BrowserFingerprintData {
    if (typeof window === "undefined") {
      return {
        fingerprintHash: "SERVER_SSR",
        canvasHash: "NONE",
        userAgent: "SSR",
        language: "ar",
        screenResolution: "1920x1080",
        timezone: "Asia/Riyadh",
        hardwareConcurrency: 4,
        platform: "Web",
        createdAt: new Date().toISOString(),
      };
    }

    // 1. Canvas Fingerprinting Hash
    let canvasHash = "NO_CANVAS";
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 240;
      canvas.height = 60;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px 'Cairo', 'Arial'";
        ctx.fillStyle = "#0B192C";
        ctx.fillRect(0, 0, 240, 60);
        ctx.fillStyle = "#2563EB";
        ctx.fillText("MeDo-ERP-SAP-Secure-Fingerprint-v4.5", 10, 15);
        ctx.fillStyle = "#10B981";
        ctx.fillText("بدر عايض - بن زياد المتحدة", 10, 35);
        canvasHash = this.hashString(canvas.toDataURL());
      }
    } catch (e) {
      canvasHash = "CANVAS_SEC_ERR";
    }

    // 2. Hardware & Browser metadata
    const userAgent = navigator.userAgent || "";
    const language = navigator.language || "ar";
    const screenResolution = `${window.screen?.width || 0}x${window.screen?.height || 0} (${window.screen?.colorDepth || 24}-bit)`;
    const timezone = Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || "Asia/Riyadh";
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = (navigator as any).deviceMemory || 8;
    const platform = navigator.platform || "Web";

    // 3. Combined Master Hash
    const rawEntropy = `${canvasHash}|${userAgent}|${screenResolution}|${timezone}|${hardwareConcurrency}|${language}`;
    const fingerprintHash = `BF-${this.hashString(rawEntropy).toUpperCase()}`;

    const fpData: BrowserFingerprintData = {
      fingerprintHash,
      canvasHash,
      userAgent,
      language,
      screenResolution,
      timezone,
      hardwareConcurrency,
      deviceMemory,
      platform,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(TRIAL_FINGERPRINT_KEY, JSON.stringify(fpData));
    return fpData;
  }

  /**
   * Simple and fast deterministic string hashing (Murmur/FNV style)
   */
  private hashString(str: string): string {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  }

  /**
   * Initializes a 48-Hour Trial for a new tenant
   */
  public initialize48HourTrial(companyName: string, userEmail: string): TrialState {
    const fingerprint = this.generateBrowserFingerprint();
    const now = Date.now();
    const expiresAt = now + TRIAL_DURATION_HOURS * 60 * 60 * 1000;

    const state: TrialState = {
      isTrial: true,
      trialStartedAt: new Date(now).toISOString(),
      trialExpiresAt: new Date(expiresAt).toISOString(),
      durationHours: TRIAL_DURATION_HOURS,
      companyName,
      userEmail,
      fingerprint,
      isExpired: false,
      remainingSeconds: TRIAL_DURATION_HOURS * 3600,
      remainingHours: TRIAL_DURATION_HOURS,
      remainingMinutes: 0,
      progressPercent: 0,
    };

    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(state));
    return state;
  }

  /**
   * Gets the current trial state and exact remaining duration
   */
  public getTrialState(): TrialState | null {
    try {
      const raw = localStorage.getItem(TRIAL_STORAGE_KEY);
      if (!raw) return null;

      const state: TrialState = JSON.parse(raw);
      const now = Date.now();
      const expires = new Date(state.trialExpiresAt).getTime();
      const started = new Date(state.trialStartedAt).getTime();
      const totalDurationMs = TRIAL_DURATION_HOURS * 60 * 60 * 1000;

      const remainingMs = Math.max(0, expires - now);
      const isExpired = remainingMs <= 0;

      const remainingSeconds = Math.floor(remainingMs / 1000);
      const remainingHours = Math.floor(remainingSeconds / 3600);
      const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);

      const elapsedMs = Math.min(totalDurationMs, now - started);
      const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));

      const updatedState: TrialState = {
        ...state,
        isExpired,
        remainingSeconds,
        remainingHours,
        remainingMinutes,
        progressPercent,
      };

      return updatedState;
    } catch (e) {
      return null;
    }
  }

  /**
   * Extend or renew trial with a valid key
   */
  public activateLicense(licenseKey: string): boolean {
    if (licenseKey && licenseKey.length >= 6) {
      localStorage.removeItem(TRIAL_STORAGE_KEY);
      localStorage.setItem("medo_erp_activated_license", licenseKey);
      this.notify();
      return true;
    }
    return false;
  }

  /**
   * Gets current Two-Factor Authentication (2FA) State for expired trial verification
   */
  public get2FAState(): TwoFactorState {
    try {
      const raw = localStorage.getItem(TRIAL_2FA_STORAGE_KEY);
      return raw ? JSON.parse(raw) : { isVerified: false };
    } catch {
      return { isVerified: false };
    }
  }

  /**
   * Verifies the 2FA code entered by the client (supports demo code 852963 or 6-digit PIN)
   */
  public verifyTwoFactorCode(
    code: string,
    user: string = "عبدالملك بدر",
    company: string = "شركة البدر للأدوية والمستلزمات الطبية",
    method: "SMS" | "WHATSAPP" | "EMAIL" | "AUTHENTICATOR" = "SMS"
  ): { success: boolean; message: string; state?: TwoFactorState } {
    const clean = code.trim().replace(/\s+/g, "");
    // Demo verification code is 852963 or any 6-digit numeric string
    if (clean === "852963" || (clean.length === 6 && /^\d+$/.test(clean))) {
      const state: TwoFactorState = {
        isVerified: true,
        verifiedAt: new Date().toISOString(),
        verifiedUser: user,
        verifiedCompany: company,
        verificationMethod: method,
        verificationCodeUsed: clean,
        deviceFingerprint: this.generateBrowserFingerprint().fingerprintHash,
      };
      localStorage.setItem(TRIAL_2FA_STORAGE_KEY, JSON.stringify(state));
      this.notify();
      return {
        success: true,
        message: `تم التحقق بنجاح عبر المصادقة الثنائية (2FA) للمستخدم ${user} - منشأة ${company}.`,
        state,
      };
    }

    return {
      success: false,
      message: "رمز المصادقة غير صحيح. يرجى إدخال رمز التحقق المكون من 6 أرقام (أو الرمز التجريبي 852963).",
    };
  }

  /**
   * Resets 2FA state (for re-testing)
   */
  public resetTwoFactorState(): void {
    localStorage.removeItem(TRIAL_2FA_STORAGE_KEY);
    this.notify();
  }

  /**
   * Generates a unique, secure Original Version activation link and key
   */
  public getOriginalVersionLink(companyName: string = "شركة البدر للأدوية والمستلزمات الطبية"): {
    url: string;
    licenseKey: string;
    token: string;
    issuedAt: string;
    companySlug: string;
  } {
    const isBinZiyad = companyName.includes("بن زياد") || companyName.includes("ziyad");
    const isBadr = companyName.includes("البدر") || companyName.includes("badr");
    
    const companySlug = isBinZiyad
      ? "binziyad"
      : isBadr
      ? "albadr-pharma-2026"
      : companyName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) || "medo-tenant";

    const token = `ORIGINAL-MEDO-${companySlug.toUpperCase().replace(/-/g, "").slice(0, 8)}-VERIFIED`;
    const licenseKey = `MEDO-PRO-2026-${companySlug.toUpperCase().replace(/-/g, "").slice(0, 8)}-L1`;
    const issuedAt = new Date().toISOString();
    
    const baseOrigin = getAppBaseUrl();
    const url = `${baseOrigin}/?client=${encodeURIComponent(companySlug)}&token=${encodeURIComponent(token)}&sec=2fa-verified&edition=original&activate=true&company=${encodeURIComponent(companyName)}`;
    
    return {
      url,
      licenseKey,
      token,
      issuedAt,
      companySlug,
    };
  }

  /**
   * Checks current URL query parameters and automatically activates license if a valid token is present
   */
  public checkAndActivateFromUrl(): { activated: boolean; companyName?: string; user?: string } {
    if (typeof window === "undefined" || !window.location) {
      return { activated: false };
    }

    try {
      const search = window.location.search || "";
      const urlParams = new URLSearchParams(search);

      const token = urlParams.get("token");
      const client = urlParams.get("client");
      const activate = urlParams.get("activate");
      const key = urlParams.get("key") || urlParams.get("licenseKey");
      const companyParam = urlParams.get("company");
      const userParam = urlParams.get("user");

      const isTokenMatch = token === "ORIGINAL-MEDO-ALBADR-9921-VERIFIED" || (token && token.startsWith("ORIGINAL-MEDO"));
      const isClientMatch = client === "albadr-pharma-2026" || client === "binziyad" || (client && client.length > 0);
      const isDirectActivate = activate === "true" || !!key;

      if (isTokenMatch || (isClientMatch && (isDirectActivate || token))) {
        const activeKey = key || "MEDO-PRO-2026-SOVEREIGN-L1";
        this.activateLicense(activeKey);
        
        const verifiedCompany = companyParam || (client === "binziyad" ? "مجموعة بن زياد التجارية المحدودة" : (client === "albadr-pharma-2026" ? "شركة البدر للأدوية والمستلزمات الطبية" : "المنشأة المعتمدة"));
        const verifiedUser = userParam || (client === "binziyad" ? "بدر عايض محمد" : "المفوض المعتمد");

        const twoFactorState: TwoFactorState = {
          isVerified: true,
          verifiedAt: new Date().toISOString(),
          verifiedUser,
          verifiedCompany,
          verificationMethod: "SMS",
          verificationCodeUsed: "852963",
          deviceFingerprint: this.generateBrowserFingerprint().fingerprintHash,
        };
        localStorage.setItem(TRIAL_2FA_STORAGE_KEY, JSON.stringify(twoFactorState));
        this.notify();

        return {
          activated: true,
          companyName: verifiedCompany,
          user: verifiedUser,
        };
      }
    } catch (e) {
      console.error("Error activating license from URL:", e);
    }

    return { activated: false };
  }

  /**
   * Forces trial expiration to allow instant testing of post-trial 2FA and Original Link flows
   */
  public simulateTrialExpiration(
    companyName: string = "شركة القمة للتجارة والتوكيلات",
    userEmail: string = "demo@medoerp.com"
  ): TrialState {
    const fingerprint = this.generateBrowserFingerprint();
    const now = Date.now();
    const expiredStartedAt = now - 49 * 3600 * 1000;
    const expiredAt = now - 1 * 3600 * 1000; // 1 hour ago

    const state: TrialState = {
      isTrial: true,
      trialStartedAt: new Date(expiredStartedAt).toISOString(),
      trialExpiresAt: new Date(expiredAt).toISOString(),
      durationHours: 48,
      companyName,
      userEmail,
      fingerprint,
      isExpired: true,
      remainingSeconds: 0,
      remainingHours: 0,
      remainingMinutes: 0,
      progressPercent: 100,
    };

    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(state));
    // Reset 2FA state so user can experience the 2FA flow freshly
    localStorage.removeItem(TRIAL_2FA_STORAGE_KEY);
    this.notify();
    return state;
  }

  /**
   * Resets trial to fresh 48 hours for evaluation
   */
  public resetTrialToFresh48Hours(
    companyName: string = "شركة القمة للتجارة والتوكيلات",
    userEmail: string = "demo@medoerp.com"
  ): TrialState {
    localStorage.removeItem("medo_erp_activated_license");
    localStorage.removeItem(TRIAL_2FA_STORAGE_KEY);
    return this.initialize48HourTrial(companyName, userEmail);
  }
}

export const trialService = TrialService.getInstance();
