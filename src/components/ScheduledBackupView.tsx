import React, { useState, useEffect } from "react";
import {
  Database,
  Lock,
  CloudUpload,
  Calendar,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  Clock,
  Eye,
  EyeOff,
  Sparkles,
  HardDrive,
  FileCheck2,
  Copy,
  Check,
  RotateCcw,
  ShieldAlert,
  Send,
  FolderSync,
  Radio,
  ExternalLink,
  Wifi,
  FileDown,
  Layers,
  Save,
  CheckCheck,
  Upload,
  FolderOpen,
  FileUp,
  FileText,
  SlidersHorizontal,
} from "lucide-react";
import { BackupDestinationLog, BackupLogEntry, ScheduledBackupConfig, SystemSettings } from "../types/erp";
import { ERPFullState, exportERPDataAsJSON, saveERPState } from "../services/erpStorage";
import { ScheduledBackupEngine } from "../services/scheduledBackupEngine";
import { generateSecureRandomKey, decryptBackupData, encryptBackupData } from "../services/cryptoBackup";
import { LocalBackupSnapshot, MultiDestinationBackupService } from "../services/multiDestinationBackupService";
import { getBackupFromIDB } from "../services/idbBackupStorage";

interface ScheduledBackupViewProps {
  systemSettings: SystemSettings;
  onUpdateSystemSettings: (newSettings: SystemSettings) => void;
  fullState: ERPFullState;
}

export const ScheduledBackupView: React.FC<ScheduledBackupViewProps> = ({
  systemSettings,
  onUpdateSystemSettings,
  fullState,
}) => {
  const backupEngine = ScheduledBackupEngine.getInstance();
  const multiService = MultiDestinationBackupService.getInstance();

  // Active configuration sub-tab
  const [activeTab, setActiveTab] = useState<"GENERAL" | "GDRIVE" | "YANDEX" | "TELEGRAM" | "LOCAL" | "LOGS">("GENERAL");

  // Config state initialized from systemSettings or default
  const [config, setConfig] = useState<ScheduledBackupConfig>(() => {
    return (
      systemSettings.scheduledBackup || {
        enabled: true,
        frequency: "EVERY_12_HOURS",
        scheduledTime: "02:00",
        autoEncrypt: true,
        encryptionKey: "MeDo-SAP-EncKey-9F2kL8xA3p",
        uploadToCloud: true,
        cloudStoragePath: "cloud_backups",
        keepMaxBackups: 15,
        lastBackupAt: new Date().toISOString(),
        nextScheduledAt: new Date(Date.now() + 3600000 * 12).toISOString(),
        lastBackupStatus: "SUCCESS",
        lastBackupMessage: "النظام متأهب ومستعد للنسخ الاحتياطي متعدد الوجهات",
        googleDrive: {
          enabled: false,
          accessToken: "",
          folderId: "",
          autoSync: true,
        },
        yandexDisk: {
          enabled: false,
          oauthToken: "",
          targetFolder: "app:/MeDo_ERP_Backups/",
          autoSync: true,
        },
        telegram: {
          enabled: false,
          botToken: "",
          chatId: "",
          sendAsDocument: true,
          sendSummaryText: true,
        },
        localBackup: {
          saveToLocalStorageSnapshot: true,
          autoDownloadOnBackup: false,
          keepLocalSnapshotsCount: 10,
        },
      }
    );
  });

  const [backupLogs, setBackupLogs] = useState<BackupLogEntry[]>(() =>
    backupEngine.getBackupLogs()
  );

  const [localSnapshots, setLocalSnapshots] = useState<LocalBackupSnapshot[]>(() =>
    multiService.getLocalVaultSnapshots()
  );

  const [showKey, setShowKey] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Connection Test States
  const [testingGDrive, setTestingGDrive] = useState(false);
  const [gdriveTestResult, setGdriveTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const [testingYandex, setTestingYandex] = useState(false);
  const [yandexTestResult, setYandexTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Manual Trigger Execution Progress
  const [isExecuting, setIsExecuting] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [executionError, setExecutionError] = useState<string | null>(null);

  // Restore Modal State
  const [restoreModalLog, setRestoreModalLog] = useState<BackupLogEntry | null>(null);
  const [restoreKeyInput, setRestoreKeyInput] = useState("");
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Device file manager state
  const [deviceSaveMessage, setDeviceSaveMessage] = useState<{
    type: "SUCCESS" | "ERROR";
    text: string;
  } | null>(null);
  const [deviceImporting, setDeviceImporting] = useState(false);

  useEffect(() => {
    const unsub = backupEngine.subscribe(() => {
      setBackupLogs(backupEngine.getBackupLogs());
      setLocalSnapshots(multiService.getLocalVaultSnapshots());
    });
    return () => unsub();
  }, []);

  const handleSaveConfig = (newConfig: ScheduledBackupConfig) => {
    setConfig(newConfig);
    const updatedSettings: SystemSettings = {
      ...systemSettings,
      scheduledBackup: newConfig,
    };
    onUpdateSystemSettings(updatedSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleGenerateKey = () => {
    const newKey = generateSecureRandomKey();
    const updated = { ...config, encryptionKey: newKey };
    handleSaveConfig(updated);
  };

  const handleCopyKey = () => {
    if (config.encryptionKey) {
      navigator.clipboard.writeText(config.encryptionKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    }
  };

  // Test Google Drive
  const handleTestGoogleDrive = async () => {
    if (!config.googleDrive?.accessToken) {
      setGdriveTestResult({ success: false, msg: "يرجى إدخال رمز الوصول OAuth Access Token أولاً." });
      return;
    }
    setTestingGDrive(true);
    setGdriveTestResult(null);
    try {
      const res = await multiService.testGoogleDriveConnection(config.googleDrive.accessToken);
      setGdriveTestResult({
        success: res.success,
        msg: res.success
          ? `تم التحقق بنجاح! المستخدم: ${res.userEmail || res.userName || "متصل"}`
          : `فشل التحقق: ${res.error || "رمز غير صالح"}`,
      });
    } catch (e: any) {
      setGdriveTestResult({ success: false, msg: e.message || "خطأ أثناء الاتصال بقوقل درايف." });
    } finally {
      setTestingGDrive(false);
    }
  };

  // Test Yandex Disk
  const handleTestYandex = async () => {
    if (!config.yandexDisk?.oauthToken) {
      setYandexTestResult({ success: false, msg: "يرجى إدخال رمز الوصول OAuth Token لياندكس ديسك." });
      return;
    }
    setTestingYandex(true);
    setYandexTestResult(null);
    try {
      const res = await multiService.testYandexDiskConnection(config.yandexDisk.oauthToken);
      setYandexTestResult({
        success: res.success,
        msg: res.success
          ? `تم الاتصال بياندكس بنجاح! المستخدم: ${res.userLogin || "متصل"} (المساحة الكلية: ${res.totalSpaceGB || 0} GB)`
          : `فشل التحقق: ${res.error || "رمز غير صالح"}`,
      });
    } catch (e: any) {
      setYandexTestResult({ success: false, msg: e.message || "خطأ أثناء الاتصال بياندكس." });
    } finally {
      setTestingYandex(false);
    }
  };

  // Test Telegram Bot
  const handleTestTelegram = async () => {
    if (!config.telegram?.botToken || !config.telegram?.chatId) {
      setTelegramTestResult({ success: false, msg: "يرجى إدخال توكن البوت Bot Token ومعرف الدردشة Chat ID." });
      return;
    }
    setTestingTelegram(true);
    setTelegramTestResult(null);
    try {
      const res = await multiService.testTelegramConnection(config.telegram.botToken, config.telegram.chatId);
      setTelegramTestResult({
        success: res.success,
        msg: res.success
          ? `تم إرسال رسالة تجريبية بنجاح إلى تليجرام! (البوت: ${res.botName || res.botUsername || "متصل"})`
          : `فشل إرسال الرسالة: ${res.error || "تأكد من بدء المحادثة مع البوت /start"}`,
      });
    } catch (e: any) {
      setTelegramTestResult({ success: false, msg: e.message || "خطأ بالاتصال مع خوادم تليجرام." });
    } finally {
      setTestingTelegram(false);
    }
  };

  // Trigger Instant Backup
  const handleRunBackupNow = async () => {
    setIsExecuting(true);
    setProgressPct(5);
    setProgressStage("جاري بدء النسخ الاحتياطي وتجهيز القنوات المتعددة...");
    setExecutionError(null);

    try {
      const resultLog = await backupEngine.executeEncryptedCloudBackup(
        fullState,
        config,
        "MANUAL_TRIGGER",
        (pct, stageText) => {
          setProgressPct(pct);
          setProgressStage(stageText);
        }
      );

      const nextDate = backupEngine.calculateNextScheduledDate(
        config.frequency,
        config.scheduledTime
      );

      const updatedConfig: ScheduledBackupConfig = {
        ...config,
        lastBackupAt: resultLog.createdAt,
        nextScheduledAt: nextDate,
        lastBackupStatus: "SUCCESS",
        lastBackupMessage: `تم التنفيذ متعدد الوجهات بنجاح (${new Date(resultLog.createdAt).toLocaleTimeString("ar-YE")})`,
      };

      handleSaveConfig(updatedConfig);
      setLocalSnapshots(multiService.getLocalVaultSnapshots());
    } catch (err: any) {
      setExecutionError(err.message || "حدث خطأ أثناء إجراء النسخ الاحتياطي.");
    } finally {
      setTimeout(() => {
        setIsExecuting(false);
        setProgressPct(0);
        setProgressStage("");
      }, 1500);
    }
  };

  const handleConfirmRestore = async () => {
    if (!restoreModalLog) return;
    setIsRestoring(true);
    setRestoreError(null);

    try {
      await backupEngine.restoreFromBackupLog(restoreModalLog, restoreKeyInput);
      alert("تمت استعادة قاعدة البيانات بنجاح! سيتم إعادة تحميل الواجهة الآن.");
      window.location.reload();
    } catch (err: any) {
      setRestoreError(err.message || "فشل استعادة قاعدة البيانات.");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDownloadDecryptedLog = async (log: BackupLogEntry) => {
    try {
      let encPkg = log.encryptedDataPackage;
      let rawJson = log.rawJsonBackup;

      if (!encPkg && !rawJson) {
        const idbData = await getBackupFromIDB(log.id);
        if (idbData) {
          encPkg = idbData.encryptedPackage;
          rawJson = idbData.rawJson;
        }
      }

      if (!encPkg && !rawJson) {
        const localSnapshots = multiService.getLocalVaultSnapshots();
        const matched = localSnapshots.find(
          (s) => s.sha256Hash === log.sha256Hash || s.timestamp === log.createdAt
        );
        if (matched && matched.rawJsonOrCipher) {
          if (matched.isEncrypted) {
            try {
              encPkg = JSON.parse(matched.rawJsonOrCipher);
            } catch {}
          } else {
            rawJson = matched.rawJsonOrCipher;
          }
        }
      }

      if (log.isEncrypted) {
        const keyToUse = config.encryptionKey;
        if (!keyToUse) {
          alert("يلزم إدخال مفتاح التشفير الرئيسي لفك الملف.");
          return;
        }
        if (!encPkg) {
          alert("بيانات حزمة التشفير غير متوفرة في السجل المحلي.");
          return;
        }
        const stateData = await decryptBackupData(encPkg, keyToUse);
        exportERPDataAsJSON(stateData);
      } else if (rawJson) {
        const stateData = JSON.parse(rawJson);
        exportERPDataAsJSON(stateData);
      } else {
        alert("محتوى النسخة غير متوفر في السجل المحلي.");
      }
    } catch (err: any) {
      alert(`فشل تحميل الملف: ${err.message}`);
    }
  };

  const handleSaveToDeviceFileManager = async (isEncrypted: boolean = false) => {
    try {
      const stateToSave = fullState;
      let content = "";
      let fileName = "";
      const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

      if (isEncrypted) {
        const key = config.encryptionKey || "MeDo-SAP-EncKey-9F2kL8xA3p";
        const encrypted = await encryptBackupData(stateToSave, key);
        content = JSON.stringify(encrypted, null, 2);
        fileName = `medo_erp_backup_encrypted_${dateStr}.enc`;
      } else {
        content = JSON.stringify(stateToSave, null, 2);
        fileName = `medo_erp_backup_plain_${dateStr}.json`;
      }

      // 1. Try Native File System Access API (Opens real file manager dialog)
      if ("showSaveFilePicker" in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: isEncrypted
                  ? "MeDo ERP Encrypted Backup (*.enc)"
                  : "MeDo ERP Database (*.json)",
                accept: {
                  "application/json": [isEncrypted ? ".enc" : ".json"],
                },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(content);
          await writable.close();
          setDeviceSaveMessage({
            type: "SUCCESS",
            text: `✅ تم حفظ النسخة الاحتياطية بنجاح في مدير الملفات بالجهاز باسم: ${fileName}`,
          });
          setTimeout(() => setDeviceSaveMessage(null), 6000);
          return;
        } catch (pickerErr: any) {
          if (pickerErr.name === "AbortError") {
            return; // User intentionally cancelled the picker
          }
          console.warn("File picker failed, falling back to download", pickerErr);
        }
      }

      // 2. Fallback: Standard browser download
      multiService.triggerBrowserDownload(
        content,
        fileName,
        isEncrypted ? "application/octet-stream" : "application/json"
      );
      setDeviceSaveMessage({
        type: "SUCCESS",
        text: `✅ تم بدء تنزيل النسخة الاحتياطية إلى جهازك باسم: ${fileName}`,
      });
      setTimeout(() => setDeviceSaveMessage(null), 6000);
    } catch (err: any) {
      setDeviceSaveMessage({
        type: "ERROR",
        text: `فشل الحفظ في مدير الملفات: ${err.message}`,
      });
      setTimeout(() => setDeviceSaveMessage(null), 6000);
    }
  };

  const handleImportDeviceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDeviceImporting(true);
    try {
      const text = await file.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        alert("الملف المحدد ليس ملف JSON أو مشفر صالح.");
        return;
      }

      // Check if encrypted package
      if (parsed.ciphertextBase64 && parsed.ivBase64 && parsed.saltBase64) {
        const key = prompt(
          "هذا الملف مشفر بمعيار AES-256. يرجى إدخال مفتاح التشفير لفك البيانات واستعادتها:",
          config.encryptionKey || ""
        );
        if (!key) return;

        try {
          const decryptedState = await decryptBackupData(parsed, key);
          if (
            confirm(
              `تم التحقق من النسخة المشفرة وفكها بنجاح!\n` +
                `الحسابات: ${decryptedState.accounts?.length || 0}\n` +
                `القيود: ${decryptedState.journalEntries?.length || 0}\n` +
                `الفواتير والمشتريات: ${(decryptedState.invoices?.length || 0) + (decryptedState.bills?.length || 0)}\n` +
                `العملاء والموردين: ${(decryptedState.customers?.length || 0) + (decryptedState.vendors?.length || 0)}\n` +
                `هل ترغب في استبدال واستعادة كافة بيانات النظام الحالية بهذه النسخة؟`
            )
          ) {
            saveERPState(decryptedState);
            alert("تمت استعادة البيانات بنجاح! سيتم تحديث الصفحة.");
            window.location.reload();
          }
        } catch (decryptErr: any) {
          alert(`فشل فك التشفير: ${decryptErr.message || "مفتاح التشفير غير صحيح"}`);
        }
      } else if (parsed.accounts && parsed.journalEntries) {
        // Plain JSON
        if (
          confirm(
            `تم قراءة ملف النسخة الاحتياطية بنجاح!\n` +
              `الحسابات: ${parsed.accounts?.length || 0}\n` +
              `القيود: ${parsed.journalEntries?.length || 0}\n` +
              `الفواتير والمشتريات: ${(parsed.invoices?.length || 0) + (parsed.bills?.length || 0)}\n` +
              `العملاء والموردين: ${(parsed.customers?.length || 0) + (parsed.vendors?.length || 0)}\n` +
              `هل ترغب في استبدال واستعادة كافة بيانات النظام بهذه النسخة؟`
          )
        ) {
          saveERPState(parsed);
          alert("تمت استعادة البيانات بنجاح! سيتم تحديث الصفحة.");
          window.location.reload();
        }
      } else {
        alert("هيكل بيانات الملف غير متوافق مع نظام MeDo ERP.");
      }
    } catch (err: any) {
      alert(`فشل قراءة الملف: ${err.message}`);
    } finally {
      setDeviceImporting(false);
      e.target.value = "";
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6" id="scheduled-backup-container">
      {/* Header Info Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg ${
                config.enabled
                  ? "bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-500/20"
                  : "bg-slate-800 text-slate-400"
              }`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-black text-white">
                    منظومة النسخ الاحتياطي متعدد القنوات (Multi-Destination Vault)
                  </h2>
                  {config.enabled ? (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      النسخ التلقائي: مفعّل ويعمل بنجاح
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      النسخ التلقائي: غير مفعّل
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  تأمين القيود والحسابات والبيانات الحساسة بتشفير AES-256 والرفع المزدوج إلى قوقل درايف، ياندكس، تليجرام، وسحابة المخدم والحفظ المحلي.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Master Activation Toggle Switch */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl">
              <span className="text-xs font-bold text-slate-300">
                {config.enabled ? "المحرك التلقائي نشط" : "المحرك التلقائي متوقف"}
              </span>
              <button
                type="button"
                onClick={() => handleSaveConfig({ ...config, enabled: !config.enabled })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.enabled ? "bg-emerald-500" : "bg-slate-700"
                }`}
                role="switch"
                aria-checked={config.enabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    config.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {!config.enabled && (
              <button
                type="button"
                onClick={() =>
                  handleSaveConfig({
                    ...config,
                    enabled: true,
                    nextScheduledAt: backupEngine.calculateNextScheduledDate(
                      config.frequency,
                      config.scheduledTime
                    ),
                  })
                }
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>تفعيل النسخ الاحتياطي فوراً</span>
              </button>
            )}

            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                تم حفظ الإعدادات
              </span>
            )}
            <button
              id="btn-quick-save-device"
              onClick={() => handleSaveToDeviceFileManager(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 transition-all shadow-md active:scale-95"
              title="حفظ فوري في مدير الملفات بالجهاز (مشفر AES-256)"
            >
              <Save className="w-4 h-4" />
              <span>حفظ بالجهاز الآن</span>
            </button>
            <button
              id="btn-run-backup-now"
              onClick={handleRunBackupNow}
              disabled={isExecuting}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isExecuting ? "animate-spin" : ""}`} />
              <span>{isExecuting ? "جاري النسخ والتوزيع..." : "تنفيذ النسخ لكافة الوجهات الآن"}</span>
            </button>
          </div>
        </div>

        {/* Live Execution Progress Bar */}
        {isExecuting && (
          <div className="mt-5 pt-4 border-t border-slate-800 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                {progressStage}
              </span>
              <span className="font-mono">{progressPct}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {executionError && (
          <div className="mt-4 p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{executionError}</span>
          </div>
        )}

        {/* Channel Highlights Quick Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-4 mt-4 border-t border-slate-800/80 text-[11px]">
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${config.uploadToCloud !== false ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
            <CloudUpload className="w-4 h-4 flex-shrink-0" />
            <div>
              <div className="font-bold">Firestore Cloud</div>
              <div className="text-[9px] opacity-80">{config.uploadToCloud !== false ? "مفعل" : "معطل"}</div>
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${config.googleDrive?.enabled ? "bg-blue-950/40 border-blue-800/50 text-blue-300" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
            <HardDrive className="w-4 h-4 flex-shrink-0" />
            <div>
              <div className="font-bold">Google Drive</div>
              <div className="text-[9px] opacity-80">{config.googleDrive?.enabled ? "مفعل" : "معطل"}</div>
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${config.yandexDisk?.enabled ? "bg-red-950/40 border-red-800/50 text-red-300" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
            <FolderSync className="w-4 h-4 flex-shrink-0" />
            <div>
              <div className="font-bold">Yandex Disk</div>
              <div className="text-[9px] opacity-80">{config.yandexDisk?.enabled ? "مفعل" : "معطل"}</div>
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${config.telegram?.enabled ? "bg-sky-950/40 border-sky-800/50 text-sky-300" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
            <Send className="w-4 h-4 flex-shrink-0" />
            <div>
              <div className="font-bold">Telegram Bot</div>
              <div className="text-[9px] opacity-80">{config.telegram?.enabled ? "مفعل" : "معطل"}</div>
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${config.localBackup?.saveToLocalStorageSnapshot !== false ? "bg-amber-950/40 border-amber-800/50 text-amber-300" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
            <Save className="w-4 h-4 flex-shrink-0" />
            <div>
              <div className="font-bold">الحفظ المحلي</div>
              <div className="text-[9px] opacity-80">{config.localBackup?.saveToLocalStorageSnapshot !== false ? "مفعل" : "معطل"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Multi-Destination Configuration */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("GENERAL")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "GENERAL"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>الجدولة والتشفير (AES-256)</span>
        </button>

        <button
          onClick={() => setActiveTab("GDRIVE")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "GDRIVE"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Google Drive</span>
          {config.googleDrive?.enabled && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
        </button>

        <button
          onClick={() => setActiveTab("YANDEX")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "YANDEX"
              ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <FolderSync className="w-4 h-4" />
          <span>Yandex Disk</span>
          {config.yandexDisk?.enabled && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />}
        </button>

        <button
          onClick={() => setActiveTab("TELEGRAM")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "TELEGRAM"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Telegram</span>
          {config.telegram?.enabled && <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />}
        </button>

        <button
          onClick={() => setActiveTab("LOCAL")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "LOCAL"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Save className="w-4 h-4" />
          <span>الحفظ المحلي والتحميل</span>
        </button>

        <button
          onClick={() => setActiveTab("LOGS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "LOGS"
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>سجل العمليات والأرشيف ({backupLogs.length})</span>
        </button>
      </div>

      {/* --- TAB 1: General & Scheduler & AES-256 --- */}
      {activeTab === "GENERAL" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Panel: Scheduler & Frequency Config */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                جدولة التوقيت والتواتر الزمني (Automation Schedule)
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => handleSaveConfig({ ...config, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  تواتر إجراء النسخ الاحتياطي التلقائي:
                </label>
                <select
                  value={config.frequency}
                  disabled={!config.enabled}
                  onChange={(e) =>
                    handleSaveConfig({
                      ...config,
                      frequency: e.target.value as any,
                      nextScheduledAt: backupEngine.calculateNextScheduledDate(
                        e.target.value as any,
                        config.scheduledTime
                      ),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-bold text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                >
                  <option value="HOURLY">كل ساعة (Hourly High-Frequency)</option>
                  <option value="EVERY_6_HOURS">كل 6 ساعات (Quarter-Day Backup)</option>
                  <option value="EVERY_12_HOURS">كل 12 ساعة (Half-Day Backup)</option>
                  <option value="DAILY">يومياً (Daily Master Backup)</option>
                  <option value="WEEKLY">أسبوعياً (Weekly Archive)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">وقت تنفيذ النسخ اليومي/الأسبوعي:</label>
                  <input
                    type="time"
                    disabled={!config.enabled}
                    value={config.scheduledTime || "02:00"}
                    onChange={(e) =>
                      handleSaveConfig({
                        ...config,
                        scheduledTime: e.target.value,
                        nextScheduledAt: backupEngine.calculateNextScheduledDate(
                          config.frequency,
                          e.target.value
                        ),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 font-bold text-emerald-300 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">الحد الأقصى للنسخ المحفوظة:</label>
                  <select
                    value={config.keepMaxBackups || 15}
                    disabled={!config.enabled}
                    onChange={(e) =>
                      handleSaveConfig({ ...config, keepMaxBackups: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 font-bold text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  >
                    <option value={5}>آخر 5 نسخ احتياطية</option>
                    <option value={10}>آخر 10 نسخ احتياطية</option>
                    <option value={15}>آخر 15 نسخة احتياطية (موصى به)</option>
                    <option value={30}>آخر 30 نسخة احتياطية</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-3 text-[11px]">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">آخر عملية نسخ ناجحة:</span>
                  <div className="font-bold text-emerald-400">
                    {config.lastBackupAt
                      ? new Date(config.lastBackupAt).toLocaleString("ar-YE")
                      : "لم تنفذ بعد"}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">موعد العملية القادمة:</span>
                  <div className="font-bold text-cyan-300">
                    {config.enabled && config.nextScheduledAt
                      ? new Date(config.nextScheduledAt).toLocaleString("ar-YE")
                      : "المجدول متوقف"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel: Encryption & Cloud Vault */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                مفتاح التشفير والرفع السحابي (AES-256 Encryption & Cloud Vault)
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoEncrypt}
                  onChange={(e) => handleSaveConfig({ ...config, autoEncrypt: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    مفتاح التشفير الرئيسي (AES Master Secret Key):
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateKey}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    توليد مفتاح أمان جديد
                  </button>
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showKey ? "text" : "password"}
                    disabled={!config.autoEncrypt}
                    value={config.encryptionKey || ""}
                    onChange={(e) => handleSaveConfig({ ...config, encryptionKey: e.target.value })}
                    placeholder="أدخل مفتاح التشفير الرئيسي..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-20 pr-10 py-2.5 font-mono text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 text-slate-400 hover:text-slate-200"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="absolute left-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                  >
                    {keyCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {keyCopied ? "تم النسخ" : "نسخ"}
                  </button>
                </div>
              </div>

              {/* Firestore Cloud Toggle */}
              <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="uploadToCloud"
                  checked={config.uploadToCloud !== false}
                  onChange={(e) => handleSaveConfig({ ...config, uploadToCloud: e.target.checked })}
                  className="mt-1 w-4 h-4 accent-emerald-500 rounded"
                />
                <div>
                  <label htmlFor="uploadToCloud" className="font-bold text-white cursor-pointer flex items-center gap-1.5">
                    <CloudUpload className="w-4 h-4 text-emerald-400" />
                    رفع الحزمة المشفرة تلقائياً لسحابة Firestore Cloud Vault
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    يتم تخزين النسخة المشفرة بآمان في مجموعة <code className="text-amber-300 font-mono">cloud_backups</code> المركزية.
                  </p>
                </div>
              </div>

              {/* Cryptographic Standard Badge */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1 text-[11px]">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  معايير التشفير المطبقة (Enterprise Encryption Standard):
                </div>
                <p className="text-slate-400 leading-relaxed">
                  • <b>AES-256-GCM</b> تشفير بيانات المحاسبة والقيود بقوة 256 بت.<br />
                  • <b>PBKDF2</b> اشتقاق المفاتيح بـ 100,000 جولة حماية مع Salt عشوائي.<br />
                  • <b>SHA-256</b> بصمة رقمية فريدة تضمن نزاهة وعدم تحريف البيانات.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: Google Drive Configuration --- */}
      {activeTab === "GDRIVE" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">إعدادات النسخ الاحتياطي إلى Google Drive</h3>
                <p className="text-xs text-slate-400">مزامنة النسخ المشفرة مباشرة إلى حساب قوقل درايف الخاص بالمنشأة</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.googleDrive?.enabled || false}
                onChange={(e) =>
                  handleSaveConfig({
                    ...config,
                    googleDrive: {
                      ...(config.googleDrive || { accessToken: "" }),
                      enabled: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="space-y-4 text-xs max-w-3xl">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 flex items-center justify-between">
                <span>رمز الوصول (OAuth 2.0 Access Token / Google Drive Token):</span>
                <span className="text-[10px] text-slate-400 font-normal">يتطلب صلاحية https://www.googleapis.com/auth/drive.file</span>
              </label>
              <input
                type="password"
                disabled={!config.googleDrive?.enabled}
                value={config.googleDrive?.accessToken || ""}
                onChange={(e) =>
                  handleSaveConfig({
                    ...config,
                    googleDrive: {
                      ...(config.googleDrive || { enabled: true }),
                      accessToken: e.target.value,
                    },
                  })
                }
                placeholder="أدخل رمز Google OAuth 2.0 Access Token (Bearer ya29...)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-xs text-blue-300 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">معرف المجلد الهدف (Folder ID - اختياري):</label>
              <input
                type="text"
                disabled={!config.googleDrive?.enabled}
                value={config.googleDrive?.folderId || ""}
                onChange={(e) =>
                  handleSaveConfig({
                    ...config,
                    googleDrive: {
                      ...(config.googleDrive || { enabled: true, accessToken: "" }),
                      folderId: e.target.value,
                    },
                  })
                }
                placeholder="اتركه فارغاً للحفظ في الجذر الرئيسي (Root) أو أدخل معرف المجلد..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestGoogleDrive}
                disabled={testingGDrive || !config.googleDrive?.enabled || !config.googleDrive?.accessToken}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
              >
                <Wifi className={`w-4 h-4 ${testingGDrive ? "animate-spin" : ""}`} />
                <span>{testingGDrive ? "جاري الفحص والاتصال..." : "فحص واختبار اتصال Google Drive"}</span>
              </button>
            </div>

            {gdriveTestResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  gdriveTestResult.success
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-rose-500/20 border-rose-500/40 text-rose-300"
                }`}
              >
                {gdriveTestResult.success ? (
                  <CheckCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                )}
                <span>{gdriveTestResult.msg}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: Yandex Disk Configuration --- */}
      {activeTab === "YANDEX" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <FolderSync className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">إعدادات النسخ الاحتياطي إلى Yandex Disk (ياندكس ديسك)</h3>
                <p className="text-xs text-slate-400">رفع وتخزين النسخ الاحتياطية المشفرة في سحابة Yandex Cloud Storage الآمنة</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.yandexDisk?.enabled || false}
                onChange={(e) =>
                  handleSaveConfig({
                    ...config,
                    yandexDisk: {
                      ...(config.yandexDisk || { oauthToken: "" }),
                      enabled: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="space-y-4 text-xs max-w-3xl">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 flex items-center justify-between">
                <span>رمز المصادقة (Yandex OAuth Token / App Password):</span>
                <span className="text-[10px] text-slate-400 font-normal">من خلال Yandex OAuth (cloud_api:disk.write)</span>
              </label>
              <input
                type="password"
                disabled={!config.yandexDisk?.enabled}
                value={config.yandexDisk?.oauthToken || ""}
                onChange={(e) =>
                  handleSaveConfig({
                    ...config,
                    yandexDisk: {
                      ...(config.yandexDisk || { enabled: true }),
                      oauthToken: e.target.value,
                    },
                  })
                }
                placeholder="أدخل رمز Yandex OAuth Token (y0_AgAAAA...)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-xs text-red-300 focus:outline-none focus:border-red-500 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">مسار المجلد على ياندكس ديسك:</label>
              <input
                type="text"
                disabled={!config.yandexDisk?.enabled}
                value={config.yandexDisk?.targetFolder || "app:/MeDo_ERP_Backups/"}
                onChange={(e) =>
                  handleSaveConfig({
                    ...config,
                    yandexDisk: {
                      ...(config.yandexDisk || { enabled: true, oauthToken: "" }),
                      targetFolder: e.target.value,
                    },
                  })
                }
                placeholder="app:/MeDo_ERP_Backups/ أو disk:/Backups/"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-red-500 disabled:opacity-50"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestYandex}
                disabled={testingYandex || !config.yandexDisk?.enabled || !config.yandexDisk?.oauthToken}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
              >
                <Wifi className={`w-4 h-4 ${testingYandex ? "animate-spin" : ""}`} />
                <span>{testingYandex ? "جاري الفحص..." : "فحص واختبار اتصال Yandex Disk"}</span>
              </button>
            </div>

            {yandexTestResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  yandexTestResult.success
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-rose-500/20 border-rose-500/40 text-rose-300"
                }`}
              >
                {yandexTestResult.success ? (
                  <CheckCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                )}
                <span>{yandexTestResult.msg}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 4: Telegram Bot Configuration --- */}
      {activeTab === "TELEGRAM" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">إعدادات إرسال النسخ الاحتياطي عبر بوت تليجرام (Telegram Bot)</h3>
                <p className="text-xs text-slate-400">إرسال ملف النسخة المشفر وملخص محاسبي فوري إلى قناتك أو محادثتك الخاصة في تليجرام</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.telegram?.enabled || false}
                onChange={(e) =>
                  handleSaveConfig({
                    ...config,
                    telegram: {
                      ...(config.telegram || { botToken: "", chatId: "" }),
                      enabled: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>

          <div className="space-y-4 text-xs max-w-3xl">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">رمز توكن البوت (Telegram Bot Token):</label>
              <input
                type="password"
                disabled={!config.telegram?.enabled}
                value={config.telegram?.botToken || ""}
                onChange={(e) =>
                  handleSaveConfig({
                    ...config,
                    telegram: {
                      ...(config.telegram || { enabled: true, chatId: "" }),
                      botToken: e.target.value,
                    },
                  })
                }
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ (من @BotFather)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-xs text-sky-300 focus:outline-none focus:border-sky-500 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">معرف الدردشة أو القناة (Telegram Chat ID):</label>
              <input
                type="text"
                disabled={!config.telegram?.enabled}
                value={config.telegram?.chatId || ""}
                onChange={(e) =>
                  handleSaveConfig({
                    ...config,
                    telegram: {
                      ...(config.telegram || { enabled: true, botToken: "" }),
                      chatId: e.target.value,
                    },
                  })
                }
                placeholder="مثال: 987654321 أو معرف القناة -1001234567890"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-sky-500 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!config.telegram?.enabled}
                  checked={config.telegram?.sendAsDocument !== false}
                  onChange={(e) =>
                    handleSaveConfig({
                      ...config,
                      telegram: {
                        ...(config.telegram || { enabled: true, botToken: "", chatId: "" }),
                        sendAsDocument: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-sky-500 rounded"
                />
                <span className="text-slate-300 font-bold">إرفاق ملف النسخة كملف وثيقة Document</span>
              </label>

              <label className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!config.telegram?.enabled}
                  checked={config.telegram?.sendSummaryText !== false}
                  onChange={(e) =>
                    handleSaveConfig({
                      ...config,
                      telegram: {
                        ...(config.telegram || { enabled: true, botToken: "", chatId: "" }),
                        sendSummaryText: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-sky-500 rounded"
                />
                <span className="text-slate-300 font-bold">إرسال تقرير ملخص الحسابات والعمليات</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={testingTelegram || !config.telegram?.enabled || !config.telegram?.botToken || !config.telegram?.chatId}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/40 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
              >
                <Wifi className={`w-4 h-4 ${testingTelegram ? "animate-spin" : ""}`} />
                <span>{testingTelegram ? "جاري الإرسال التجريبي..." : "إرسال رسالة اختبار للبوت"}</span>
              </button>
            </div>

            {telegramTestResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  telegramTestResult.success
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-rose-500/20 border-rose-500/40 text-rose-300"
                }`}
              >
                {telegramTestResult.success ? (
                  <CheckCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                )}
                <span>{telegramTestResult.msg}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 5: Local Saving & Snapshots Vault --- */}
      {activeTab === "LOCAL" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">إعدادات الحفظ في مدير الملفات بالجهاز والخزينة المحلية</h3>
                <p className="text-xs text-slate-400">حفظ النسخ الاحتياطية مباشرة في أي مجلد بجهازك، واستعادتها بضغطة زر واحدة</p>
              </div>
            </div>
          </div>

          {/* Device Save Message Banner */}
          {deviceSaveMessage && (
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-bold animate-fade-in ${
                deviceSaveMessage.type === "SUCCESS"
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-500/15 border-rose-500/40 text-rose-300"
              }`}
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{deviceSaveMessage.text}</span>
            </div>
          )}

          {/* Section 1: Save Directly to Device File Manager */}
          <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Save className="w-4 h-4 text-amber-400" />
                  حفظ نسخة احتياطية مباشرة في مدير الملفات بالجهاز (Device File Manager)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  يتيح لك نظام MeDo حفظ وتحديد مجلد الحفظ (Downloads, Documents, Flash Drive, إلخ) مباشرة على حاسوبك أو هاتفك.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              <button
                id="btn-save-device-encrypted"
                onClick={() => handleSaveToDeviceFileManager(true)}
                className="p-4 bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/40 hover:to-amber-500/30 border border-amber-500/40 rounded-xl text-right transition-all group shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 bg-amber-500/20 text-amber-300 rounded-lg group-hover:scale-110 transition-transform">
                    <Lock className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    أعلى أمان (AES-256)
                  </span>
                </div>
                <div className="font-bold text-white text-xs">حفظ ملف مشفر (.enc) بالجهاز</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  مشفر بمفتاحك السري، آمن للحفظ في وسائط التخزين الخارجية والفلاش ميموري
                </p>
              </button>

              <button
                id="btn-save-device-plain"
                onClick={() => handleSaveToDeviceFileManager(false)}
                className="p-4 bg-slate-900 hover:bg-slate-800/80 border border-slate-700/80 rounded-xl text-right transition-all group shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 bg-slate-800 text-cyan-300 rounded-lg group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    ملف قياسي
                  </span>
                </div>
                <div className="font-bold text-white text-xs">حفظ ملف JSON مفتوح (.json) بالجهاز</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  ملف قاعدة بيانات MeDo ERP القياسي، قابل للقراءة والاستيراد المباشر
                </p>
              </button>

              <label className="p-4 bg-slate-900 hover:bg-slate-800/80 border border-indigo-700/50 rounded-xl text-right transition-all cursor-pointer group shadow-md relative">
                <input
                  type="file"
                  accept=".json,.enc"
                  onChange={handleImportDeviceFile}
                  disabled={deviceImporting}
                  className="hidden"
                />
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg group-hover:scale-110 transition-transform">
                    <FileUp className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    استيراد فوري
                  </span>
                </div>
                <div className="font-bold text-white text-xs">استيراد واستعادة من ملف بالجهاز</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  اختر أي ملف .json أو .enc من مدير الملفات لاسترجاع بيانات النظام فوراً
                </p>
              </label>
            </div>
          </div>

          {/* Section 2: Local Auto-Save Preferences */}
          <div className="space-y-4 text-xs max-w-3xl">
            <h4 className="font-bold text-slate-200 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              خيارات الأتمتة والخزينة المحلية للمتصفح
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={config.localBackup?.saveToLocalStorageSnapshot !== false}
                  onChange={(e) =>
                    handleSaveConfig({
                      ...config,
                      localBackup: {
                        ...(config.localBackup || {}),
                        saveToLocalStorageSnapshot: e.target.checked,
                      },
                    })
                  }
                  className="mt-1 w-4 h-4 accent-amber-500 rounded"
                />
                <div>
                  <div className="font-bold text-white">حفظ لقطات في خزينة المتصفح الآمنة (Local Vault)</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">تخزين النسخ داخل ذاكرة المتصفح للوصول الفوري عند انقطاع الإنترنت</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={config.localBackup?.autoDownloadOnBackup || false}
                  onChange={(e) =>
                    handleSaveConfig({
                      ...config,
                      localBackup: {
                        ...(config.localBackup || {}),
                        autoDownloadOnBackup: e.target.checked,
                      },
                    })
                  }
                  className="mt-1 w-4 h-4 accent-amber-500 rounded"
                />
                <div>
                  <div className="font-bold text-white">تحميل ملف النسخة الاحتياطية تلقائياً عند النسخ</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">تنزيل ملف .json أو .enc تلقائياً إلى مجلد التنزيلات عند كل عملية نسخ مجدولة</p>
                </div>
              </label>
            </div>

            {/* Local Snapshots Vault List */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  لقطات الخزينة المحلية المحفوظة ({localSnapshots.length})
                </h4>
                {localSnapshots.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("هل تريد مسح جميع لقطات الذاكرة المحلية؟")) {
                        multiService.clearLocalVaultSnapshots();
                        setLocalSnapshots([]);
                      }
                    }}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300"
                  >
                    تفريغ الخزينة المحلية
                  </button>
                )}
              </div>

              {localSnapshots.length === 0 ? (
                <div className="p-6 bg-slate-950 rounded-xl border border-dashed border-slate-800 text-center text-slate-500">
                  لا توجد لقطات محلية حتى الآن. سيتم التخزين تلقائياً عند إجراء النسخ الاحتياطي.
                </div>
              ) : (
                <div className="space-y-2">
                  {localSnapshots.map((snap, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <b className="text-white font-mono">{snap.fileName}</b>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                            {formatBytes(snap.fileSizeBytes)}
                          </span>
                          {snap.isEncrypted && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              AES-256
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(snap.timestamp).toLocaleString("ar-YE")} • الحسابات: {snap.recordCountSummary?.accounts || 0} • القيود: {snap.recordCountSummary?.journals || 0} • الفواتير: {snap.recordCountSummary?.invoices || 0}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            multiService.triggerBrowserDownload(
                              snap.rawJsonOrCipher,
                              snap.fileName,
                              snap.isEncrypted ? "application/octet-stream" : "application/json"
                            )
                          }
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg transition-colors flex items-center gap-1.5 font-bold"
                          title="تنزيل اللقطة"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>تنزيل</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 6: Backup Logs History Table --- */}
      {activeTab === "LOGS" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                أرشيف سجلات النسخ الاحتياطية متعددة الوجهات
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تتبع مسار كل نسخة، حالة رفعها إلى السحابة، Google Drive، Yandex، وتليجرام واستعادة النظام
              </p>
            </div>

            <span className="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              إجمالي النسخ المحفوظة: <b className="text-emerald-400 font-mono">{backupLogs.length}</b>
            </span>
          </div>

          {backupLogs.length === 0 ? (
            <div className="text-center py-10 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 text-slate-500 space-y-2">
              <HardDrive className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
              <p className="text-xs font-bold">لا يوجد سجلات نسخ احتياطية حتى الآن</p>
              <p className="text-[11px]">اضغط على زر "تنفيذ النسخ لكافة الوجهات الآن" للبدء</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-3">المعرف وتاريخ الإنشاء</th>
                    <th className="p-3">نوع العملية</th>
                    <th className="p-3">الحجم</th>
                    <th className="p-3">معيار التشفير</th>
                    <th className="p-3">القنوات والوجهات</th>
                    <th className="p-3">الحالة العامة</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {backupLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono">
                        <div className="text-white font-bold">{new Date(log.createdAt).toLocaleString("ar-YE")}</div>
                        <div className="text-[10px] text-slate-500">{log.id}</div>
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            log.triggerType === "AUTOMATIC_SCHEDULED"
                              ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                              : "bg-purple-500/10 text-purple-300 border border-purple-500/30"
                          }`}
                        >
                          {log.triggerType === "AUTOMATIC_SCHEDULED" ? "آلي مجدول" : "يدوي فوري"}
                        </span>
                      </td>

                      <td className="p-3 font-mono text-slate-300">{formatBytes(log.fileSizeBytes)}</td>

                      <td className="p-3">
                        {log.isEncrypted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold">
                            <Lock className="w-3 h-3 text-amber-400" />
                            AES-256-GCM
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">غير مشفر</span>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {log.destinationsLogs && log.destinationsLogs.length > 0 ? (
                            log.destinationsLogs.map((d, i) => (
                              <span
                                key={i}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1 ${
                                  d.status === "SUCCESS"
                                    ? "bg-emerald-950/60 border-emerald-800/60 text-emerald-300"
                                    : "bg-rose-950/60 border-rose-800/60 text-rose-300"
                                }`}
                                title={d.message || d.destination}
                              >
                                {d.destination === "GOOGLE_DRIVE" && "Drive"}
                                {d.destination === "YANDEX_DISK" && "Yandex"}
                                {d.destination === "TELEGRAM" && "Telegram"}
                                {d.destination === "LOCAL_STORAGE" && "Local"}
                                {d.destination === "FIRESTORE_CLOUD" && "Cloud"}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[10px]">{log.notes || "سجل قياسي"}</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          {log.status === "COMPLETED" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              مكتمل
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                              <AlertCircle className="w-3.5 h-3.5" />
                              فشل
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleDownloadDecryptedLog(log)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                            title="تحميل وتفكيك التشفير كملف JSON"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                          </button>

                          <button
                            onClick={() => {
                              setRestoreModalLog(log);
                              setRestoreKeyInput(config.encryptionKey || "");
                              setRestoreError(null);
                            }}
                            className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                            title="استعادة قاعدة البيانات من هذه النسخة"
                          >
                            <RotateCcw className="w-3 h-3" />
                            استعادة
                          </button>

                          <button
                            onClick={() => {
                              if (confirm("هل أنت متأكد من إزالة هذا السجل من الأرشيف؟")) {
                                backupEngine.deleteBackupLog(log.id);
                              }
                            }}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition-colors"
                            title="حذف السجل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {restoreModalLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">تأكيد استعادة قاعدة البيانات</h3>
                <p className="text-xs text-slate-400">تنبيه: سيتم استبدال الحالة الحالية بالنظام بهذه النسخة الاحتياطية</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">تاريخ النسخة:</span>
                  <b className="text-white font-mono">{new Date(restoreModalLog.createdAt).toLocaleString("ar-YE")}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">حالة التشفير:</span>
                  <b className="text-amber-400 font-mono">{restoreModalLog.isEncrypted ? "AES-256-GCM Encrypted" : "Unencrypted"}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">بصمة SHA-256:</span>
                  <b className="text-slate-300 font-mono truncate max-w-[200px]">{restoreModalLog.sha256Hash}</b>
                </div>
              </div>

              {restoreModalLog.isEncrypted && (
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-200">أدخل مفتاح التشفير الرئيسي لاستعادة النسخة:</label>
                  <input
                    type="password"
                    value={restoreKeyInput}
                    onChange={(e) => setRestoreKeyInput(e.target.value)}
                    placeholder="مفتاح AES-256..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {restoreError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{restoreError}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRestoreModalLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isRestoring ? "جاري الاستعادة..." : "تأكيد الاستعادة والبدء"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
