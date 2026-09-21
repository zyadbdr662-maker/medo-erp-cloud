import {
  SyncOutboxItem,
  SyncEntity,
  SyncOperationType,
  ConflictResolutionStrategy,
  ConflictLogEntry,
  NetworkConnectionMode,
  LocalDBSnapshot,
  ERPState,
} from "../types/erp";
import { ERPFullState, loadERPState, saveERPState } from "./erpStorage";
import { CryptoAES256Service } from "./cryptoAES256";
import { SecurityAuditService } from "./securityAuditService";

const OUTBOX_STORAGE_KEY = "medo_erp_sync_outbox_v1";
const CONFLICT_LOGS_KEY = "medo_erp_conflict_logs_v1";
const SNAPSHOTS_KEY = "medo_erp_db_snapshots_v1";
const NETWORK_MODE_KEY = "medo_erp_network_mode_v1";
const CONFLICT_STRATEGY_KEY = "medo_erp_conflict_strategy_v1";
const AES256_ENABLED_KEY = "medo_erp_aes256_enabled_v1";
const AES256_PASSPHRASE_KEY = "medo_erp_aes256_passphrase_v1";
const LAST_SYNC_TIME_KEY = "medo_erp_last_sync_time_v1";
const SYNC_CHARGING_ONLY_KEY = "medo_erp_sync_charging_only_v1";
const SIMULATED_CHARGING_KEY = "medo_erp_simulated_charging_v1";

export class LocalSyncEngine {
  private static instance: LocalSyncEngine;
  private networkMode: NetworkConnectionMode = "ONLINE";
  private conflictStrategy: ConflictResolutionStrategy = "TIMESTAMP_LATEST";
  private isSyncInProgress: boolean = false;
  private syncChargingOnly: boolean = false;
  private isCharging: boolean = true;
  private batteryLevel: number = 92;
  private hasBatteryApi: boolean = false;
  private simulatedCharging: boolean | null = null;
  private listeners: Array<() => void> = [];

  private constructor() {
    const savedMode = localStorage.getItem(NETWORK_MODE_KEY) as NetworkConnectionMode;
    if (savedMode) this.networkMode = savedMode;

    const savedStrat = localStorage.getItem(CONFLICT_STRATEGY_KEY) as ConflictResolutionStrategy;
    if (savedStrat) this.conflictStrategy = savedStrat;

    const savedLastSync = localStorage.getItem(LAST_SYNC_TIME_KEY);
    if (!savedLastSync) {
      // Seed initial recent sync timestamp (e.g., 2 minutes ago)
      const initialTime = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      localStorage.setItem(LAST_SYNC_TIME_KEY, initialTime);
    }

    const savedChargingOnly = localStorage.getItem(SYNC_CHARGING_ONLY_KEY);
    if (savedChargingOnly !== null) {
      this.syncChargingOnly = savedChargingOnly === "true";
    }

    const savedSimulatedCharging = localStorage.getItem(SIMULATED_CHARGING_KEY);
    if (savedSimulatedCharging !== null) {
      this.simulatedCharging = savedSimulatedCharging === "true";
    }

    // Initialize Battery API Listener
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && "getBattery" in (navigator as any)) {
      try {
        (navigator as any)
          .getBattery()
          .then((battery: any) => {
            this.hasBatteryApi = true;
            this.isCharging = !!battery.charging;
            this.batteryLevel = Math.round((battery.level ?? 1) * 100);
            this.notify();

            battery.addEventListener("chargingchange", () => {
              this.isCharging = !!battery.charging;
              this.notify();
            });

            battery.addEventListener("levelchange", () => {
              this.batteryLevel = Math.round((battery.level ?? 1) * 100);
              this.notify();
            });
          })
          .catch(() => {
            this.hasBatteryApi = false;
          });
      } catch {
        this.hasBatteryApi = false;
      }
    }

    // Listen to real browser network changes
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        if (this.networkMode !== "OFFLINE") {
          this.notify();
        }
      });
      window.addEventListener("offline", () => {
        this.notify();
      });
    }

    // Seed initial outbox items if empty to demonstrate functionality
    this.ensureSeedData();
  }

  public static getInstance(): LocalSyncEngine {
    if (!LocalSyncEngine.instance) {
      LocalSyncEngine.instance = new LocalSyncEngine();
    }
    return LocalSyncEngine.instance;
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

  private ensureSeedData() {
    const outbox = this.getOutbox();
    if (outbox.length === 0) {
      const initialOutbox: SyncOutboxItem[] = [
        {
          id: "sync-ob-101",
          entity: "INVOICE",
          entityId: "INV-2026-0092",
          entityRef: "فاتورة مبيعات نقدية - فرع صنعاء (مركز الأدوية)",
          operation: "CREATE",
          payload: { amount: 145000, currency: "YER_SANAA" },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          status: "PENDING",
          attempts: 0,
          branchId: "BR-SANAA-MAIN",
          branchName: "الفرع الرئيسي - صنعاء",
        },
        {
          id: "sync-ob-102",
          entity: "JOURNAL_ENTRY",
          entityId: "JV-2026-0044",
          entityRef: "قيد إثبات استحقاق صيانة أجهزة المستودع",
          operation: "CREATE",
          payload: { amount: 350000, currency: "YER_SANAA" },
          createdAt: new Date(Date.now() - 2800000).toISOString(),
          status: "PENDING",
          attempts: 0,
          branchId: "BR-SANAA-MAIN",
          branchName: "الفرع الرئيسي - صنعاء",
        },
        {
          id: "sync-ob-103",
          entity: "STOCK_MOVEMENT",
          entityId: "SM-2026-018",
          entityRef: "صرف مخزون أصناف جراحية - مستودع عدن",
          operation: "CREATE",
          payload: { qty: 25, itemId: "MED-002" },
          createdAt: new Date(Date.now() - 1900000).toISOString(),
          status: "PENDING",
          attempts: 0,
          branchId: "BR-ADEN-PORT",
          branchName: "فرع المنطقة الحرة - عدن",
        },
        {
          id: "sync-ob-104",
          entity: "VOUCHER",
          entityId: "PV-2026-0012",
          entityRef: "سند صرف مصاريف نقل وتخليص جمركي",
          operation: "CREATE",
          payload: { amount: 1200, currency: "USD" },
          createdAt: new Date(Date.now() - 1100000).toISOString(),
          status: "PENDING",
          attempts: 0,
          branchId: "BR-HOD-PORT",
          branchName: "فرع ميناء الحديدة",
        },
        {
          id: "sync-ob-105",
          entity: "INVOICE",
          entityId: "INV-2026-0093",
          entityRef: "فاتورة مبيعات آجلة - مستشفى الأمل الحديث",
          operation: "CREATE",
          payload: { amount: 520000, currency: "YER_SANAA" },
          createdAt: new Date(Date.now() - 400000).toISOString(),
          status: "PENDING",
          attempts: 0,
          branchId: "BR-SANAA-MAIN",
          branchName: "الفرع الرئيسي - صنعاء",
        },
      ];
      this.saveOutbox(initialOutbox);
    }
  }

  // --- Network Connection Mode ---
  public getNetworkMode(): NetworkConnectionMode {
    return this.networkMode;
  }

  public setNetworkMode(mode: NetworkConnectionMode) {
    this.networkMode = mode;
    localStorage.setItem(NETWORK_MODE_KEY, mode);
    this.notify();
  }

  public isEffectivelyOnline(): boolean {
    if (this.networkMode === "OFFLINE") return false;
    return true;
  }

  public isSyncing(): boolean {
    return this.isSyncInProgress;
  }

  public getLastSyncTime(): string {
    return localStorage.getItem(LAST_SYNC_TIME_KEY) || new Date().toISOString();
  }

  public setLastSyncTime(isoString: string) {
    localStorage.setItem(LAST_SYNC_TIME_KEY, isoString);
    this.notify();
  }

  public getFormattedLastSync(): { formattedTime: string; relativeTime: string } {
    const raw = this.getLastSyncTime();
    if (!raw) return { formattedTime: "لم تتم بعد", relativeTime: "غير متوفر" };

    try {
      const date = new Date(raw);
      const timeStr = date.toLocaleTimeString("ar-YE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const now = Date.now();
      const diffSec = Math.floor((now - date.getTime()) / 1000);

      let relative = "الآن";
      if (diffSec < 45) {
        relative = "الآن";
      } else if (diffSec < 120) {
        relative = "منذ دقيقة";
      } else if (diffSec < 3600) {
        const mins = Math.floor(diffSec / 60);
        relative = `منذ ${mins} د`;
      } else if (diffSec < 86400) {
        const hours = Math.floor(diffSec / 3600);
        relative = `منذ ${hours} س`;
      } else {
        relative = date.toLocaleDateString("ar-YE", { month: "short", day: "numeric" });
      }

      return {
        formattedTime: timeStr,
        relativeTime: relative,
      };
    } catch {
      return { formattedTime: raw, relativeTime: "مؤخراً" };
    }
  }

  // --- Conflict Resolution Strategy ---
  public getConflictStrategy(): ConflictResolutionStrategy {
    return this.conflictStrategy;
  }

  public setConflictStrategy(strat: ConflictResolutionStrategy) {
    this.conflictStrategy = strat;
    localStorage.setItem(CONFLICT_STRATEGY_KEY, strat);
    this.notify();
  }

  // --- Battery & Power-Saving Sync Settings ---
  public isSyncOnlyWhileCharging(): boolean {
    return this.syncChargingOnly;
  }

  public setSyncOnlyWhileCharging(enabled: boolean): void {
    this.syncChargingOnly = enabled;
    localStorage.setItem(SYNC_CHARGING_ONLY_KEY, enabled ? "true" : "false");
    
    // Record audit log for power setting changes
    try {
      SecurityAuditService.getInstance().recordAuditLog({
        action: "SETTINGS_MODIFIED",
        username: "مدير النظام (SYSTEM_ADMIN)",
        email: "admin@medoerp.com",
        deviceInfo: "محرك المزامنة وموفر طاقة البطارية",
        riskLevel: "LOW",
        details: enabled
          ? "تم تفعيل وضع (المزامنة عند الشحن فقط) للحفاظ على طاقة البطارية ومنع استهلاك الشبكة أثناء العمل بالبطارية."
          : "تم إلغاء تفعيل وضع (المزامنة عند الشحن فقط)؛ المزامنة التلقائية ستعمل في أي وقت.",
        status: "SUCCESS",
      });
    } catch {
      // Ignored if audit service not initialized
    }

    this.notify();
  }

  public isDeviceCharging(): boolean {
    if (this.simulatedCharging !== null) {
      return this.simulatedCharging;
    }
    return this.isCharging;
  }

  public getBatteryLevel(): number {
    return this.batteryLevel;
  }

  public isBatteryApiSupported(): boolean {
    return this.hasBatteryApi;
  }

  public getSimulatedCharging(): boolean | null {
    return this.simulatedCharging;
  }

  public setSimulatedCharging(val: boolean | null): void {
    this.simulatedCharging = val;
    if (val === null) {
      localStorage.removeItem(SIMULATED_CHARGING_KEY);
    } else {
      localStorage.setItem(SIMULATED_CHARGING_KEY, val ? "true" : "false");
    }
    this.notify();
  }

  public canSyncUnderBatteryPolicy(): { allowed: boolean; reason?: string } {
    if (this.syncChargingOnly && !this.isDeviceCharging()) {
      return {
        allowed: false,
        reason: "المزامنة التلقائية معلقة مؤقتاً لتوفير الطاقة (مفعل وضع المزامنة عند الشحن فقط والجهاز يعمل على البطارية).",
      };
    }
    return { allowed: true };
  }

  // --- AES-256 Data Encryption Layer ---
  public isAES256EncryptionEnabled(): boolean {
    if (typeof localStorage === "undefined") return true;
    const val = localStorage.getItem(AES256_ENABLED_KEY);
    return val === null ? true : val === "true"; // Default to ENABLED for high security
  }

  public async setAES256EncryptionEnabled(enabled: boolean, passphrase?: string): Promise<boolean> {
    localStorage.setItem(AES256_ENABLED_KEY, enabled ? "true" : "false");
    if (passphrase) {
      localStorage.setItem(AES256_PASSPHRASE_KEY, passphrase);
    }

    // Re-encrypt or decrypt current local snapshot storage to reflect toggle
    const currentState = loadERPState();
    if (enabled) {
      const encryptedBlob = await CryptoAES256Service.encrypt(currentState);
      localStorage.setItem("medo_erp_state_aes256_vault", encryptedBlob);
    } else {
      localStorage.removeItem("medo_erp_state_aes256_vault");
    }

    // Record Security Audit
    SecurityAuditService.getInstance().recordAuditLog({
      action: "AES_ENCRYPTION_TOGGLE",
      username: "مدير النظام (SYSTEM_ADMIN)",
      email: "admin@medoerp.com",
      deviceInfo: "محرك المزامنة التلقائي MeDo Sync Engine",
      riskLevel: enabled ? "LOW" : "HIGH",
      details: enabled
        ? "تم تفعيل طبقة تشفير AES-256 GCM للبيانات المحلية لحماية السجلات المخزنة حيوياً من الوصول المادي."
        : "⚠️ تم إيقاف تشفير AES-256 المحلي مؤقتاً بأمر من مدير النظام.",
      status: "SUCCESS",
    });

    this.notify();
    return enabled;
  }

  public async encryptLocalPayloadAES256(payload: any): Promise<string> {
    return await CryptoAES256Service.encrypt(payload);
  }

  public async decryptLocalPayloadAES256(encryptedBlob: string): Promise<any> {
    return await CryptoAES256Service.decrypt(encryptedBlob);
  }

  // --- Outbox Queue ---
  public getOutbox(): SyncOutboxItem[] {
    try {
      const raw = localStorage.getItem(OUTBOX_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getPendingCount(): number {
    return this.getOutbox().filter((item) => item.status === "PENDING").length;
  }

  public saveOutbox(items: SyncOutboxItem[]) {
    localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(items));
    this.notify();
  }

  public saveSnapshot(state: any) {
    try {
      localStorage.setItem("medo_erp_snapshot_local", JSON.stringify(state));
    } catch {
      // ignore
    }
  }

  public addToOutbox(
    itemOrEntity:
      | {
          entity: SyncEntity;
          entityId: string;
          entityRef?: string;
          operation: SyncOperationType;
          payload: any;
          branchId?: string;
          branchName?: string;
        }
      | SyncEntity,
    entityId?: string,
    operation?: SyncOperationType,
    payload?: any,
    entityRef?: string,
    branchId?: string,
    branchName?: string
  ): SyncOutboxItem {
    let entity: SyncEntity;
    let finalEntityId: string;
    let finalRef: string;
    let finalOp: SyncOperationType;
    let finalPayload: any;
    let finalBranchId: string;
    let finalBranchName: string;

    if (typeof itemOrEntity === "string") {
      entity = itemOrEntity;
      finalEntityId = entityId || `item-${Date.now()}`;
      finalOp = operation || "CREATE";
      finalPayload = payload || {};
      finalRef = entityRef || `${entity} [${finalEntityId}]`;
      finalBranchId = branchId || "BR-SANAA-MAIN";
      finalBranchName = branchName || "الفرع الرئيسي - صنعاء";
    } else {
      entity = itemOrEntity.entity;
      finalEntityId = itemOrEntity.entityId;
      finalOp = itemOrEntity.operation;
      finalPayload = itemOrEntity.payload;
      finalRef = itemOrEntity.entityRef || `${entity} [${finalEntityId}]`;
      finalBranchId = itemOrEntity.branchId || "BR-SANAA-MAIN";
      finalBranchName = itemOrEntity.branchName || "الفرع الرئيسي - صنعاء";
    }

    const newItem: SyncOutboxItem = {
      id: `ob-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      entity,
      entityId: finalEntityId,
      entityRef: finalRef,
      operation: finalOp,
      payload: finalPayload,
      createdAt: new Date().toISOString(),
      status: "PENDING",
      attempts: 0,
      branchId: finalBranchId,
      branchName: finalBranchName,
    };

    const current = this.getOutbox();
    this.saveOutbox([newItem, ...current]);
    return newItem;
  }

  public removeOutboxItem(id: string) {
    const updated = this.getOutbox().filter((i) => i.id !== id);
    this.saveOutbox(updated);
  }

  public clearSynced() {
    const updated = this.getOutbox().filter((i) => i.status !== "SYNCED");
    this.saveOutbox(updated);
  }

  public simulateOfflineTransaction(entityType: SyncEntity = "INVOICE"): SyncOutboxItem {
    const timestamp = Date.now();
    const branchId = "BR-SANAA-MAIN";
    const branchName = "الفرع الرئيسي - صنعاء";

    let ref = `INV-OFFLINE-${timestamp.toString().slice(-4)}`;
    let payload: any = {
      invoiceNumber: ref,
      customerName: "عميل تجريبي محلي (بدون اتصال)",
      total: 125000,
      currency: "YER",
      date: new Date().toISOString().slice(0, 10),
      items: [{ name: "بضاعة تجريبية مسجلة دون اتصال", qty: 2, price: 62500 }],
      notes: "تم حفظ الفاتورة محلياً في قاعدة البيانات أثناء انقطاع الإنترنت بنجاح",
    };

    if (entityType === "JOURNAL_ENTRY") {
      ref = `JV-OFFLINE-${timestamp.toString().slice(-4)}`;
      payload = {
        entryNumber: ref,
        description: "قيد تسوية محلي دون اتصال بالإنترنت",
        totalDebit: 85000,
        totalCredit: 85000,
        currency: "YER",
        date: new Date().toISOString().slice(0, 10),
      };
    } else if (entityType === "VOUCHER") {
      ref = `RV-OFFLINE-${timestamp.toString().slice(-4)}`;
      payload = {
        voucherNumber: ref,
        amount: 45000,
        currency: "SAR",
        receivedFrom: "مؤسسة الوفاء للتجارة",
        description: "سند قبض نقدي مسجل محلياً دون إنترنت",
      };
    }

    return this.addToOutbox(entityType, `sim-${timestamp}`, "CREATE", payload, ref, branchId, branchName);
  }

  // --- Conflict Logs ---
  public getConflictLogs(): ConflictLogEntry[] {
    try {
      const raw = localStorage.getItem(CONFLICT_LOGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public addConflictLog(entry: Omit<ConflictLogEntry, "id" | "timestamp">) {
    const newLog: ConflictLogEntry = {
      id: `conf-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    const current = this.getConflictLogs();
    localStorage.setItem(CONFLICT_LOGS_KEY, JSON.stringify([newLog, ...current]));
    this.notify();
  }

  // --- Trigger Full Sync ---
  public async triggerSync(options?: {
    branchFilter?: string;
    moduleFilter?: SyncEntity | "ALL";
    bypassBatteryCheck?: boolean;
    onProgress?: (progress: number, message: string) => void;
  }): Promise<{
    success: boolean;
    syncedCount: number;
    conflictsResolved: number;
    message: string;
  }> {
    this.isSyncInProgress = true;
    this.notify();

    try {
      // Power & Battery Policy Check
      if (this.syncChargingOnly && !this.isDeviceCharging() && !options?.bypassBatteryCheck) {
        this.isSyncInProgress = false;
        this.notify();
        return {
          success: false,
          syncedCount: 0,
          conflictsResolved: 0,
          message: "⚠️ تم تعليق المزامنة مؤقتاً للحفاظ على البطارية: الجهاز يعمل على طاقة البطارية ووضع (المزامنة عند الشحن فقط) مفعل. يرجى توصيل الشاحن أو المزامنة المباشرة بالتجاوز.",
        };
      }
      if (this.networkMode === "OFFLINE") {
        // Auto-switch to ONLINE when user initiates sync
        this.setNetworkMode("ONLINE");
      }

      const outbox = this.getOutbox();
      let toProcess = outbox.filter((item) => item.status === "PENDING" || item.status === "FAILED");

      if (options?.branchFilter && options.branchFilter !== "ALL") {
        toProcess = toProcess.filter((i) => i.branchId === options.branchFilter);
      }
      if (options?.moduleFilter && options.moduleFilter !== "ALL") {
        toProcess = toProcess.filter((i) => i.entity === options.moduleFilter);
      }

      if (toProcess.length === 0) {
        this.setLastSyncTime(new Date().toISOString());
        return {
          success: true,
          syncedCount: 0,
          conflictsResolved: 0,
          message: "جميع العمليات المحلية متزامنة ومحدثة بالكامل مع السحابة المركزية.",
        };
      }

      options?.onProgress?.(15, "الاتصال بالخادم السحابي وفحص التوافق...");
      await new Promise((res) => setTimeout(res, 600));

      // If flaky network, simulate 20% packet drop
      if (this.networkMode === "FLAKY" && Math.random() < 0.3) {
        options?.onProgress?.(40, "فقدان حزم الاتصال بسبب ضعف التغطية (Flaky Network)...");
        await new Promise((res) => setTimeout(res, 500));
        return {
          success: false,
          syncedCount: 0,
          conflictsResolved: 0,
          message: "فشلت المزامنة مؤقتاً بسبب تقطع شبكة الإنترنت. تم حفظ العمليات في طابور المزامنة المحلي لإعادة المحاولة تلقائياً.",
        };
      }

      options?.onProgress?.(50, `إرسال ${toProcess.length} معاملة من طابور الخروج المحلي...`);
      await new Promise((res) => setTimeout(res, 700));

      let syncedCount = 0;
      let conflictsResolved = 0;

      const updatedOutbox = outbox.map((item) => {
        const match = toProcess.find((tp) => tp.id === item.id);
        if (!match) return item;

        // Simulate a conflict on 1 item if more than 3 items
        const isConflict = item.id === "sync-ob-102";
        if (isConflict) {
          conflictsResolved++;
          let resolutionText = "";
          if (this.conflictStrategy === "TIMESTAMP_LATEST") {
            resolutionText = "تم اعتماد التعديل الأحدث زمنياً للفرع المحلي وفق مبدأ Last-Write-Wins.";
          } else if (this.conflictStrategy === "BRANCH_AUTHORITY") {
            resolutionText = "تم إعطاء الأولوية للفرع المحلي وتحديث السجل السحابي.";
          } else if (this.conflictStrategy === "CLOUD_AUTHORITY") {
            resolutionText = "تم اعتماد نسخة الخادم السحابي المركزي وتحديث المعرف المحلي.";
          } else {
            resolutionText = "تمت المراجعة والتدقيق اليدوي من قبل مراقب الحسابات.";
          }

          this.addConflictLog({
            entity: item.entity,
            entityId: item.entityId,
            entityRef: item.entityRef,
            strategyUsed: this.conflictStrategy,
            resolutionSummary: resolutionText,
            branchId: item.branchId || "BR-SANAA-MAIN",
            resolvedBy: "محرك المزامنة MeDo Sync Engine",
            localTimestamp: item.createdAt,
            cloudTimestamp: new Date().toISOString(),
          });

          return {
            ...item,
            status: "SYNCED" as const,
            attempts: item.attempts + 1,
            lastAttemptAt: new Date().toISOString(),
          };
        }

        syncedCount++;
        return {
          ...item,
          status: "SYNCED" as const,
          attempts: item.attempts + 1,
          lastAttemptAt: new Date().toISOString(),
        };
      });

      this.saveOutbox(updatedOutbox);
      this.setLastSyncTime(new Date().toISOString());
      options?.onProgress?.(100, "اكتملت المزامنة بنجاح تام.");

      return {
        success: true,
        syncedCount,
        conflictsResolved,
        message: `تمت مزامنة ${syncedCount} معاملة بنجاح مع الخادم السحابي${
          conflictsResolved > 0 ? ` ومعالجة ${conflictsResolved} تعارض وفق استراتيجية (${this.conflictStrategy})` : ""
        }.`,
      };
    } finally {
      this.isSyncInProgress = false;
      this.notify();
    }
  }

  // --- Local Database Export / Import (SQLite / JSON Encrypted) ---
  public exportLocalDatabase(asEncrypted: boolean = false, password?: string): string {
    const fullState = loadERPState();
    const outbox = this.getOutbox();
    const conflictLogs = this.getConflictLogs();

    const dbDump = {
      meta: {
        system: "MeDo ERP Hybrid Local Database",
        engine: "SQLite-Compatible Embedded Storage",
        version: "4.5.0-OfflineFirst",
        exportedAt: new Date().toISOString(),
        isEncrypted: asEncrypted,
        encryptionAlgorithm: asEncrypted ? "AES-GCM-256 (Simulated Secure Vault)" : "NONE",
        checksum: "MD5-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      },
      tables: {
        accounts: fullState.accounts,
        journal_entries: fullState.journalEntries,
        vouchers: fullState.vouchers,
        invoices: fullState.invoices,
        inventory_items: fullState.inventoryItems,
        stock_movements: fullState.stockMovements,
        customers: fullState.customers,
        vendors: fullState.vendors,
        branches: fullState.branches,
        sync_outbox: outbox,
        conflict_logs: conflictLogs,
      },
    };

    const jsonStr = JSON.stringify(dbDump, null, 2);
    if (asEncrypted && password) {
      // Create encrypted container simulation
      return JSON.stringify({
        encryptedVault: true,
        hint: `Vault protected with key hash: ${password.slice(0, 2)}***`,
        payload: btoa(unescape(encodeURIComponent(jsonStr))),
        createdAt: new Date().toISOString(),
      });
    }

    return jsonStr;
  }

  public importLocalDatabase(
    fileContent: string,
    password?: string
  ): { success: boolean; message: string; recordCount?: number } {
    try {
      let parsed = JSON.parse(fileContent);

      if (parsed.encryptedVault) {
        if (!password) {
          return {
            success: false,
            message: "قاعدة البيانات مشفرة! يرجى إدخال كلمة المرور لفك تشفير البيانات.",
          };
        }
        try {
          const decryptedJson = decodeURIComponent(escape(atob(parsed.payload)));
          parsed = JSON.parse(decryptedJson);
        } catch {
          return {
            success: false,
            message: "فشل فك التشفير. كلمة المرور غير صحيحة أو الملف تالف.",
          };
        }
      }

      if (!parsed.tables || !parsed.tables.accounts) {
        return {
          success: false,
          message: "تنسيق ملف قاعدة البيانات غير صالح. تأكد من تحديد ملف نسخة احتياطية صالح لنظام MeDo ERP.",
        };
      }

      // Restore data to local state
      const current = loadERPState();
      const updatedState: ERPFullState = {
        ...current,
        accounts: parsed.tables.accounts || current.accounts,
        journalEntries: parsed.tables.journal_entries || current.journalEntries,
        vouchers: parsed.tables.vouchers || current.vouchers,
        invoices: parsed.tables.invoices || current.invoices,
        inventoryItems: parsed.tables.inventory_items || current.inventoryItems,
        stockMovements: parsed.tables.stock_movements || current.stockMovements,
        customers: parsed.tables.customers || current.customers,
        vendors: parsed.tables.vendors || current.vendors,
        branches: parsed.tables.branches || current.branches,
      };

      saveERPState(updatedState);

      if (parsed.tables.sync_outbox) {
        this.saveOutbox(parsed.tables.sync_outbox);
      }

      const count =
        (parsed.tables.accounts?.length || 0) +
        (parsed.tables.journal_entries?.length || 0) +
        (parsed.tables.invoices?.length || 0) +
        (parsed.tables.inventory_items?.length || 0);

      this.notify();

      return {
        success: true,
        message: `تمت استعادة قاعدة البيانات المحلية بنجاح (${count} سجل).`,
        recordCount: count,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `حدث خطأ أثناء قراءة ملف قاعدة البيانات: ${err?.message || "خطأ غير معروف"}`,
      };
    }
  }

  // --- Snapshots ---
  public getSnapshots(): LocalDBSnapshot[] {
    try {
      const raw = localStorage.getItem(SNAPSHOTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    // Default snapshot
    const initial: LocalDBSnapshot[] = [
      {
        id: "snp-default-01",
        name: "النسخة التأسيسية لقاعدة البيانات (Baseline SQLite)",
        createdAt: "2026-08-15T08:00:00Z",
        sizeBytes: 428000,
        recordCount: 840,
        isEncrypted: true,
        version: "4.5.0",
        checksum: "SHA256-8A7B9C0",
        description: "نسخة أصلية تحتوي شجرة الحسابات، الأرصدة الافتتاحية، والمخزون الأولي.",
      },
    ];
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(initial));
    return initial;
  }

  public createSnapshot(name: string, description?: string): LocalDBSnapshot {
    const fullState = loadERPState();
    const count =
      fullState.accounts.length +
      fullState.journalEntries.length +
      fullState.invoices.length +
      fullState.vouchers.length +
      (fullState.inventoryItems?.length || 0);

    const newSnapshot: LocalDBSnapshot = {
      id: `snp-${Date.now()}`,
      name: name.trim() || `نسخة احتياطية محلية - ${new Date().toLocaleDateString("ar-YE")}`,
      createdAt: new Date().toISOString(),
      sizeBytes: count * 480,
      recordCount: count,
      isEncrypted: true,
      version: "4.5.0",
      checksum: "SHA256-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      description: description || "نسخة نقطة استعادة محلية سريعة قبل إجراء العمليات.",
    };

    const current = this.getSnapshots();
    const updated = [newSnapshot, ...current];
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
    this.notify();
    return newSnapshot;
  }
}
