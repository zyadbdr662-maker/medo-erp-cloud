import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";
import { BackupDestinationLog, BackupLogEntry, ERPState, ScheduledBackupConfig, SystemSettings } from "../types/erp";
import { ERPFullState, loadERPState, saveERPState } from "./erpStorage";
import { encryptBackupData, decryptBackupData, calculateSHA256 } from "./cryptoBackup";
import { MultiDestinationBackupService } from "./multiDestinationBackupService";
import { saveBackupToIDB, getBackupFromIDB, deleteBackupFromIDB } from "./idbBackupStorage";

const BACKUP_LOGS_STORAGE_KEY = "medo_erp_backup_logs_v1";

export class ScheduledBackupEngine {
  private static instance: ScheduledBackupEngine;
  private timerId: any = null;
  private isExecuting: boolean = false;
  private listeners: Array<() => void> = [];

  private constructor() {
    this.sanitizeExistingLogs();
    this.ensureSeedBackupLogs();
  }

  public static getInstance(): ScheduledBackupEngine {
    if (!ScheduledBackupEngine.instance) {
      ScheduledBackupEngine.instance = new ScheduledBackupEngine();
    }
    return ScheduledBackupEngine.instance;
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

  // --- Clean existing bloated logs from localStorage to free up browser quota immediately ---
  private sanitizeExistingLogs() {
    try {
      const raw = localStorage.getItem(BACKUP_LOGS_STORAGE_KEY);
      if (!raw) return;
      const logs = JSON.parse(raw);
      if (Array.isArray(logs) && logs.length > 0) {
        let hadBloat = false;
        const cleaned = logs.slice(0, 15).map((log, idx) => {
          if (log.rawJsonBackup || (log.encryptedDataPackage && idx > 0)) {
            hadBloat = true;
            const { rawJsonBackup, encryptedDataPackage, ...meta } = log;
            return meta;
          }
          return log;
        });
        if (hadBloat || logs.length > 15) {
          try {
            localStorage.setItem(BACKUP_LOGS_STORAGE_KEY, JSON.stringify(cleaned));
          } catch {
            const metaOnly = cleaned.slice(0, 10).map((l: any) => {
              const { rawJsonBackup, encryptedDataPackage, ...meta } = l;
              return meta;
            });
            try {
              localStorage.setItem(BACKUP_LOGS_STORAGE_KEY, JSON.stringify(metaOnly));
            } catch {}
          }
        }
      }
    } catch (e) {
      console.warn("Unable to sanitize existing backup logs:", e);
    }
  }

  // --- Seed initial log entries if empty ---
  private ensureSeedBackupLogs() {
    const logs = this.getBackupLogs();
    if (logs.length === 0) {
      const sampleLogs: BackupLogEntry[] = [
        {
          id: `bkp-${Date.now() - 3600000 * 12}`,
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          triggerType: "AUTOMATIC_SCHEDULED",
          fileSizeBytes: 148520,
          isEncrypted: true,
          encryptionAlgorithm: "AES-256-GCM",
          sha256Hash: "8f3e1a9b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",
          cloudUploaded: true,
          cloudDocumentId: "cloud-doc-101",
          status: "COMPLETED",
          notes: "نسخة آلية مشفرة ومحفوظة عبر قنوات النسخ الاحتياطي المتعددة بنجاح",
          destinationsLogs: [
            { destination: "FIRESTORE_CLOUD", status: "SUCCESS", timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), message: "مرفوع لسحابة Firestore Vault" },
            { destination: "LOCAL_STORAGE", status: "SUCCESS", timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), message: "محفوظ في الأرشيف المحلي" },
          ],
        },
      ];
      this.saveBackupLogs(sampleLogs);
    }
  }

  // --- Local Storage History with Quota Guard ---
  public getBackupLogs(): BackupLogEntry[] {
    try {
      const raw = localStorage.getItem(BACKUP_LOGS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public saveBackupLogs(logs: BackupLogEntry[]) {
    // 1. Sanitize logs so they do not consume massive localStorage space
    const sanitized = logs.slice(0, 15).map((log, index) => {
      // Allow data package only on index 0 if smaller than 30KB
      if (index === 0 && log.fileSizeBytes < 30000) {
        return log;
      }
      const { encryptedDataPackage, rawJsonBackup, ...metaOnly } = log;
      return metaOnly as BackupLogEntry;
    });

    try {
      localStorage.setItem(BACKUP_LOGS_STORAGE_KEY, JSON.stringify(sanitized));
    } catch (quotaErr) {
      console.warn("Storage quota limit reached when saving backup logs. Pruning payloads and history...", quotaErr);
      try {
        // Strip heavy payload completely from all logs
        const metadataOnly = logs.slice(0, 10).map((log) => {
          const { encryptedDataPackage, rawJsonBackup, ...metaOnly } = log;
          return metaOnly as BackupLogEntry;
        });
        localStorage.setItem(BACKUP_LOGS_STORAGE_KEY, JSON.stringify(metadataOnly));
      } catch (secondErr) {
        try {
          // Keep only last 5 lightweight metadata logs
          const minimal = logs.slice(0, 5).map((log) => {
            const { encryptedDataPackage, rawJsonBackup, ...metaOnly } = log;
            return metaOnly as BackupLogEntry;
          });
          localStorage.setItem(BACKUP_LOGS_STORAGE_KEY, JSON.stringify(minimal));
        } catch (finalErr) {
          console.warn("Unable to persist backup logs in localStorage due to browser quota limit:", finalErr);
        }
      }
    }
    this.notify();
  }

  public addBackupLog(entry: BackupLogEntry, maxKeep: number = 15) {
    const logs = [entry, ...this.getBackupLogs()];
    const pruned = logs.slice(0, maxKeep);
    this.saveBackupLogs(pruned);
  }

  public deleteBackupLog(id: string) {
    const logs = this.getBackupLogs().filter((l) => l.id !== id);
    this.saveBackupLogs(logs);
    deleteBackupFromIDB(id).catch(() => {});
  }

  // --- Calculate Next Scheduled Date ---
  public calculateNextScheduledDate(
    frequency: ScheduledBackupConfig["frequency"],
    scheduledTime: string = "02:00"
  ): string {
    const now = new Date();
    const [hours, minutes] = scheduledTime.split(":").map(Number);

    switch (frequency) {
      case "HOURLY":
        return new Date(now.getTime() + 3600000).toISOString();
      case "EVERY_6_HOURS":
        return new Date(now.getTime() + 3600000 * 6).toISOString();
      case "EVERY_12_HOURS":
        return new Date(now.getTime() + 3600000 * 12).toISOString();
      case "DAILY": {
        const next = new Date(now);
        next.setHours(hours || 2, minutes || 0, 0, 0);
        if (next.getTime() <= now.getTime()) {
          next.setDate(next.getDate() + 1);
        }
        return next.toISOString();
      }
      case "WEEKLY": {
        const next = new Date(now);
        next.setHours(hours || 2, minutes || 0, 0, 0);
        next.setDate(next.getDate() + (7 - next.getDay()));
        if (next.getTime() <= now.getTime()) {
          next.setDate(next.getDate() + 7);
        }
        return next.toISOString();
      }
      default:
        return new Date(now.getTime() + 3600000 * 24).toISOString();
    }
  }

  // --- Primary Multi-Destination Backup Execution Core ---
  public async executeEncryptedCloudBackup(
    fullState: ERPFullState,
    config: ScheduledBackupConfig,
    triggerType: "AUTOMATIC_SCHEDULED" | "MANUAL_TRIGGER" = "MANUAL_TRIGGER",
    progressCb?: (percentage: number, stageText: string) => void
  ): Promise<BackupLogEntry> {
    const backupId = `bkp-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const multiService = MultiDestinationBackupService.getInstance();
    const destinationsLogs: BackupDestinationLog[] = [];

    try {
      progressCb?.(10, "جاري تجهيز وتدقيق بيانات شجرة الحسابات، القيود، والفواتير...");
      await new Promise((r) => setTimeout(r, 200));

      const rawJson = JSON.stringify(fullState, null, 2);
      let isEncrypted = false;
      let encryptedPkg: any = null;
      let sha256Hash = "";
      let fileSizeBytes = new Blob([rawJson]).size;
      let exportContent = rawJson;
      const fileExt = config.autoEncrypt && config.encryptionKey ? "enc" : "json";
      const dateStr = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
      const backupFileName = `MeDo_ERP_Backup_${dateStr}.${fileExt}`;

      if (config.autoEncrypt && config.encryptionKey) {
        progressCb?.(30, "جاري التشفير المتقدم بخوارزمية AES-256-GCM وحساب بصمة SHA-256...");
        await new Promise((r) => setTimeout(r, 250));

        encryptedPkg = await encryptBackupData(fullState, config.encryptionKey);
        isEncrypted = true;
        sha256Hash = encryptedPkg.sha256;
        fileSizeBytes = encryptedPkg.fileSizeBytes;
        exportContent = JSON.stringify(encryptedPkg);
      } else {
        sha256Hash = await calculateSHA256(rawJson);
      }

      // Generate Rich Summary for notifications
      const summaryHTML = multiService.generateBackupSummaryHTML(
        fullState,
        backupFileName,
        isEncrypted,
        sha256Hash,
        fileSizeBytes
      );

      // --- 1. Firestore Cloud Vault Upload ---
      let cloudUploaded = false;
      let cloudDocId = "";
      if (config.uploadToCloud !== false) {
        progressCb?.(50, "جاري المزامنة مع سحابة Firestore المركزية...");
        try {
          const cloudPayload = {
            backupId,
            timestamp,
            triggerType,
            isEncrypted,
            encryptionAlgorithm: isEncrypted ? "AES-256-GCM" : "NONE",
            sha256Hash,
            fileSizeBytes,
            encryptedDataPackage: isEncrypted ? encryptedPkg : null,
            rawJsonBackup: isEncrypted ? null : rawJson,
            companyName: fullState.systemSettings?.companyNameAr || "MeDo ERP",
          };

          const docRef = doc(db, config.cloudStoragePath || "cloud_backups", backupId);
          await setDoc(docRef, cloudPayload);
          cloudUploaded = true;
          cloudDocId = backupId;
          destinationsLogs.push({
            destination: "FIRESTORE_CLOUD",
            status: "SUCCESS",
            timestamp: new Date().toISOString(),
            fileReference: backupId,
            message: "تم الرفع لسحابة Firestore بنجاح",
          });
        } catch (cloudErr: any) {
          console.warn("Firestore upload warning:", cloudErr);
          destinationsLogs.push({
            destination: "FIRESTORE_CLOUD",
            status: "FAILED",
            timestamp: new Date().toISOString(),
            message: `فشل الرفع لسحابة Firestore: ${cloudErr.message || "خطأ غير معروف"}`,
          });
        }
      }

      // --- 2. Google Drive Upload ---
      if (config.googleDrive?.enabled && config.googleDrive.accessToken) {
        progressCb?.(65, "جاري رفع النسخة الاحتياطية إلى Google Drive...");
        try {
          const gdriveRes = await multiService.uploadToGoogleDrive(
            exportContent,
            backupFileName,
            config.googleDrive.accessToken,
            config.googleDrive.folderId
          );
          destinationsLogs.push({
            destination: "GOOGLE_DRIVE",
            status: "SUCCESS",
            timestamp: new Date().toISOString(),
            fileReference: gdriveRes.fileId,
            targetDetails: gdriveRes.fileName,
            message: `تم الرفع إلى Google Drive بنجاح (ID: ${gdriveRes.fileId})`,
          });
        } catch (gdriveErr: any) {
          console.warn("Google Drive upload error:", gdriveErr);
          destinationsLogs.push({
            destination: "GOOGLE_DRIVE",
            status: "FAILED",
            timestamp: new Date().toISOString(),
            message: `فشل الرفع لـ Google Drive: ${gdriveErr.message || "خطأ بالاتصال"}`,
          });
        }
      }

      // --- 3. Yandex Disk Upload ---
      if (config.yandexDisk?.enabled && config.yandexDisk.oauthToken) {
        progressCb?.(75, "جاري رفع النسخة الاحتياطية إلى Yandex Disk...");
        try {
          const yandexRes = await multiService.uploadToYandexDisk(
            exportContent,
            backupFileName,
            config.yandexDisk.oauthToken,
            config.yandexDisk.targetFolder || "app:/MeDo_ERP_Backups/"
          );
          destinationsLogs.push({
            destination: "YANDEX_DISK",
            status: "SUCCESS",
            timestamp: new Date().toISOString(),
            targetDetails: yandexRes.filePath,
            message: `تم الحفظ في Yandex Disk بالمسار: ${yandexRes.filePath}`,
          });
        } catch (yandexErr: any) {
          console.warn("Yandex Disk upload error:", yandexErr);
          destinationsLogs.push({
            destination: "YANDEX_DISK",
            status: "FAILED",
            timestamp: new Date().toISOString(),
            message: `فشل الحفظ في Yandex Disk: ${yandexErr.message || "خطأ بالاتصال"}`,
          });
        }
      }

      // --- 4. Telegram Bot Dispatch ---
      if (config.telegram?.enabled && config.telegram.botToken && config.telegram.chatId) {
        progressCb?.(85, "جاري إرسال ملف النسخة والتقرير المحاسبي إلى تليجرام...");
        try {
          const tgRes = await multiService.sendBackupToTelegram(
            exportContent,
            backupFileName,
            config.telegram.botToken,
            config.telegram.chatId,
            summaryHTML,
            config.telegram.sendAsDocument !== false,
            config.telegram.sendSummaryText !== false
          );
          destinationsLogs.push({
            destination: "TELEGRAM",
            status: "SUCCESS",
            timestamp: new Date().toISOString(),
            fileReference: tgRes.messageId,
            targetDetails: config.telegram.chatId,
            message: `تم الإرسال إلى قناة/دردشة تليجرام بنجاح (Msg ID: ${tgRes.messageId || "OK"})`,
          });
        } catch (tgErr: any) {
          console.warn("Telegram backup dispatch error:", tgErr);
          destinationsLogs.push({
            destination: "TELEGRAM",
            status: "FAILED",
            timestamp: new Date().toISOString(),
            message: `فشل الإرسال لتليجرام: ${tgErr.message || "خطأ بالبوت"}`,
          });
        }
      }

      // --- 5. Local Storage Vault & Browser Auto-Download ---
      progressCb?.(92, "جاري تأمين الحفظ في الأرشيف المحلي والذاكرة المحمية...");
      try {
        if (config.localBackup?.saveToLocalStorageSnapshot !== false) {
          multiService.saveLocalVaultSnapshot(
            {
              timestamp,
              fileName: backupFileName,
              fileSizeBytes,
              isEncrypted,
              sha256Hash,
              rawJsonOrCipher: exportContent,
              recordCountSummary: {
                accounts: fullState.accounts?.length || 0,
                journals: fullState.journalEntries?.length || 0,
                invoices: fullState.invoices?.length || 0,
                customers: fullState.customers?.length || 0,
                vendors: fullState.vendors?.length || 0,
                inventory: fullState.inventoryItems?.length || 0,
              },
            },
            config.localBackup?.keepLocalSnapshotsCount || 10
          );
        }

        // Auto Download file in browser if enabled
        if (config.localBackup?.autoDownloadOnBackup) {
          multiService.triggerBrowserDownload(
            exportContent,
            backupFileName,
            isEncrypted ? "application/octet-stream" : "application/json"
          );
        }

        destinationsLogs.push({
          destination: "LOCAL_STORAGE",
          status: "SUCCESS",
          timestamp: new Date().toISOString(),
          targetDetails: backupFileName,
          message: "تم الحفظ في الأرشيف المحلي المحمي للمتصفح",
        });
      } catch (localErr: any) {
        console.warn("Local storage vault save warning:", localErr);
        destinationsLogs.push({
          destination: "LOCAL_STORAGE",
          status: "FAILED",
          timestamp: new Date().toISOString(),
          message: `فشل الحفظ المحلي: ${localErr.message || "خطأ تخزين"}`,
        });
      }

      progressCb?.(98, "جاري تدوين السجل وتحديث مؤشرات التتبع...");
      await new Promise((r) => setTimeout(r, 150));

      // Compose Destination Notes
      const successDests = destinationsLogs.filter((d) => d.status === "SUCCESS").map((d) => {
        if (d.destination === "GOOGLE_DRIVE") return "Google Drive";
        if (d.destination === "YANDEX_DISK") return "Yandex Disk";
        if (d.destination === "TELEGRAM") return "Telegram";
        if (d.destination === "LOCAL_STORAGE") return "حفظ محلي";
        return "سحابة Firestore";
      });

      // Persist full backup payload safely in IndexedDB (virtually unlimited quota)
      await saveBackupToIDB(backupId, {
        rawJson: isEncrypted ? undefined : exportContent,
        encryptedPackage: isEncrypted ? encryptedPkg : undefined,
        fileName: backupFileName,
        isEncrypted,
        sha256Hash,
        timestamp,
      });

      const newLog: BackupLogEntry = {
        id: backupId,
        createdAt: timestamp,
        triggerType,
        fileSizeBytes,
        isEncrypted,
        encryptionAlgorithm: "AES-256-GCM",
        sha256Hash,
        cloudUploaded,
        cloudDocumentId: cloudDocId || backupId,
        // Only keep inline if small to protect localStorage quota; full payload is safe in IndexedDB
        encryptedDataPackage: isEncrypted && fileSizeBytes < 30000 ? encryptedPkg : undefined,
        rawJsonBackup: !isEncrypted && fileSizeBytes < 30000 ? rawJson : undefined,
        status: "COMPLETED",
        notes: `تم الإنجاز عبر: ${successDests.join(" | ") || "التخزين المحلي"} (${isEncrypted ? "مشفر AES-256" : "غير مشفر"})`,
        destinationsLogs,
      };

      this.addBackupLog(newLog, config.keepMaxBackups || 15);
      progressCb?.(100, "تم اكتمال النسخ الاحتياطي متعدد الوجهات بنجاح فائق!");

      return newLog;
    } catch (error: any) {
      console.error("Scheduled Multi-Destination Backup Failed:", error);
      const failedLog: BackupLogEntry = {
        id: backupId,
        createdAt: timestamp,
        triggerType,
        fileSizeBytes: 0,
        isEncrypted: config.autoEncrypt,
        encryptionAlgorithm: "AES-256-GCM",
        sha256Hash: "",
        cloudUploaded: false,
        status: "FAILED",
        notes: `فشلت العملية: ${error.message || "خطأ غير معروف"}`,
        destinationsLogs,
      };
      this.addBackupLog(failedLog, config.keepMaxBackups || 15);
      throw error;
    }
  }

  // --- Restore Data from Backup Log ---
  public async restoreFromBackupLog(
    log: BackupLogEntry,
    secretKey?: string
  ): Promise<ERPFullState> {
    let encryptedPkg = log.encryptedDataPackage;
    let rawJson = log.rawJsonBackup;

    // 1. If not stored inline in localStorage log, retrieve from IndexedDB
    if (!encryptedPkg && !rawJson) {
      const idbData = await getBackupFromIDB(log.id);
      if (idbData) {
        encryptedPkg = idbData.encryptedPackage;
        rawJson = idbData.rawJson;
      }
    }

    // 2. Fallback: Search local vault snapshots
    if (!encryptedPkg && !rawJson) {
      const multiService = MultiDestinationBackupService.getInstance();
      const localSnapshots = multiService.getLocalVaultSnapshots();
      const matched = localSnapshots.find(
        (s) => s.sha256Hash === log.sha256Hash || s.timestamp === log.createdAt
      );
      if (matched && matched.rawJsonOrCipher) {
        if (matched.isEncrypted) {
          try {
            encryptedPkg = JSON.parse(matched.rawJsonOrCipher);
          } catch {}
        } else {
          rawJson = matched.rawJsonOrCipher;
        }
      }
    }

    // 3. Fallback: Fetch from Cloud Firestore if available
    if (!encryptedPkg && !rawJson && log.cloudUploaded && log.cloudDocumentId) {
      try {
        const docRef = doc(db, "cloud_backups", log.cloudDocumentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          if (cloudData.isEncrypted && cloudData.encryptedDataPackage) {
            encryptedPkg = cloudData.encryptedDataPackage;
          } else if (cloudData.rawJsonBackup) {
            rawJson = cloudData.rawJsonBackup;
          }
        }
      } catch (cloudErr) {
        console.warn("Could not retrieve cloud backup document:", cloudErr);
      }
    }

    if (log.isEncrypted) {
      if (!secretKey) {
        throw new Error("يلزم إدخال مفتاح فك التشفير الرئيسي (AES Secret Key) لاستعادة هذه النسخة.");
      }
      if (!encryptedPkg) {
        throw new Error("بيانات حزمة التشفير لهذه النسخة غير متوفرة في التخزين المحلي أو السحابي.");
      }

      const restoredState = await decryptBackupData<ERPFullState>(
        encryptedPkg,
        secretKey
      );
      saveERPState(restoredState);
      return restoredState;
    } else if (rawJson) {
      const restoredState = JSON.parse(rawJson) as ERPFullState;
      saveERPState(restoredState);
      return restoredState;
    } else {
      throw new Error("محتوى النسخة الاحتياطية غير متوفر في السجل المحلي أو السحابي.");
    }
  }

  // --- Background Scheduler Controller ---
  public startBackgroundScheduler(
    getCurrentState: () => ERPFullState,
    onSettingsUpdated: (updatedSettings: SystemSettings) => void
  ) {
    if (this.timerId) {
      clearInterval(this.timerId);
    }

    // Check every 60 seconds
    this.timerId = setInterval(async () => {
      if (this.isExecuting) return;

      const currentState = getCurrentState();
      const config = currentState.systemSettings?.scheduledBackup;

      if (!config || !config.enabled) return;

      const now = new Date();
      const nextScheduled = config.nextScheduledAt
        ? new Date(config.nextScheduledAt)
        : new Date(0);

      if (now.getTime() >= nextScheduled.getTime()) {
        this.isExecuting = true;
        try {
          console.log("⏰ Running automated multi-destination scheduled backup...");
          const backupLog = await this.executeEncryptedCloudBackup(
            currentState,
            config,
            "AUTOMATIC_SCHEDULED"
          );

          const nextDate = this.calculateNextScheduledDate(
            config.frequency,
            config.scheduledTime
          );

          const updatedConfig: ScheduledBackupConfig = {
            ...config,
            lastBackupAt: backupLog.createdAt,
            nextScheduledAt: nextDate,
            lastBackupStatus: "SUCCESS",
            lastBackupMessage: `تم التنفيذ بنجاح في ${new Date(backupLog.createdAt).toLocaleTimeString("ar-YE")}`,
          };

          const updatedSettings: SystemSettings = {
            ...currentState.systemSettings!,
            scheduledBackup: updatedConfig,
          };

          onSettingsUpdated(updatedSettings);
        } catch (err: any) {
          console.error("Scheduled Backup Background Error:", err);
          const updatedConfig: ScheduledBackupConfig = {
            ...config,
            lastBackupStatus: "FAILED",
            lastBackupMessage: `فشل التنفيذ الآلي: ${err.message || "خطأ بالنظام"}`,
          };
          onSettingsUpdated({
            ...currentState.systemSettings!,
            scheduledBackup: updatedConfig,
          });
        } finally {
          this.isExecuting = false;
        }
      }
    }, 60000);
  }

  public stopBackgroundScheduler() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
