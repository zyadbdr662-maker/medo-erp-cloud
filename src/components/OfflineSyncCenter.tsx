import React, { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  ShieldCheck,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Upload,
  Layers,
  ArrowRight,
  Filter,
  Lock,
  Unlock,
  FileCode,
  FileCheck,
  Server,
  Smartphone,
  Laptop,
  Radio,
  Play,
  Check,
  Trash2,
  Plus,
  Battery,
  BatteryCharging,
  BatteryMedium,
  Zap,
  Power,
  ToggleLeft,
  ToggleRight,
  Info,
} from "lucide-react";
import {
  NetworkConnectionMode,
  ConflictResolutionStrategy,
  SyncOutboxItem,
  ConflictLogEntry,
  LocalDBSnapshot,
  SyncEntity,
} from "../types/erp";
import { LocalSyncEngine } from "../services/localSyncEngine";
import { PWAInstallButton } from "./PWAInstallButton";

interface OfflineSyncCenterProps {
  onClose?: () => void;
  onOpenQuickAction?: (actionType: "JOURNAL" | "RECEIPT" | "PAYMENT" | "INVOICE") => void;
  fullState?: any;
  onStateRestored?: (restored: any) => void;
}

export const OfflineSyncCenter: React.FC<OfflineSyncCenterProps> = ({ onClose, onOpenQuickAction }) => {
  const syncEngine = LocalSyncEngine.getInstance();

  const [networkMode, setNetworkMode] = useState<NetworkConnectionMode>(syncEngine.getNetworkMode());
  const [conflictStrategy, setConflictStrategy] = useState<ConflictResolutionStrategy>(syncEngine.getConflictStrategy());
  const [outbox, setOutbox] = useState<SyncOutboxItem[]>(syncEngine.getOutbox());
  const [conflictLogs, setConflictLogs] = useState<ConflictLogEntry[]>(syncEngine.getConflictLogs());
  const [snapshots, setSnapshots] = useState<LocalDBSnapshot[]>(syncEngine.getSnapshots());

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [selectedModule, setSelectedModule] = useState<SyncEntity | "ALL">("ALL");

  // Export / Import states
  const [encryptExport, setEncryptExport] = useState(true);
  const [exportPassword, setExportPassword] = useState("MeDo#2026");
  const [importPassword, setImportPassword] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const [newSnapshotName, setNewSnapshotName] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<
    "OUTBOX" | "LOCAL_DB" | "CONFLICTS" | "BACKUP" | "POWER_SETTINGS"
  >("OUTBOX");

  const [syncChargingOnly, setSyncChargingOnly] = useState<boolean>(syncEngine.isSyncOnlyWhileCharging());
  const [isCharging, setIsCharging] = useState<boolean>(syncEngine.isDeviceCharging());
  const [batteryLevel, setBatteryLevel] = useState<number>(syncEngine.getBatteryLevel());
  const [simulatedCharging, setSimulatedCharging] = useState<boolean | null>(syncEngine.getSimulatedCharging());
  const [hasBatteryApi, setHasBatteryApi] = useState<boolean>(syncEngine.isBatteryApiSupported());

  useEffect(() => {
    const unsub = syncEngine.subscribe(() => {
      setNetworkMode(syncEngine.getNetworkMode());
      setConflictStrategy(syncEngine.getConflictStrategy());
      setOutbox(syncEngine.getOutbox());
      setConflictLogs(syncEngine.getConflictLogs());
      setSnapshots(syncEngine.getSnapshots());
      setSyncChargingOnly(syncEngine.isSyncOnlyWhileCharging());
      setIsCharging(syncEngine.isDeviceCharging());
      setBatteryLevel(syncEngine.getBatteryLevel());
      setSimulatedCharging(syncEngine.getSimulatedCharging());
      setHasBatteryApi(syncEngine.isBatteryApiSupported());
    });
    return () => unsub();
  }, [syncEngine]);

  const pendingCount = outbox.filter((i) => i.status === "PENDING").length;

  const handleModeChange = (mode: NetworkConnectionMode) => {
    setNetworkMode(mode);
    syncEngine.setNetworkMode(mode);
  };

  const handleStrategyChange = (strat: ConflictResolutionStrategy) => {
    setConflictStrategy(strat);
    syncEngine.setConflictStrategy(strat);
  };

  const handleToggleChargingOnly = (enabled: boolean) => {
    syncEngine.setSyncOnlyWhileCharging(enabled);
  };

  const handleStartSync = async (bypassBatteryCheck: boolean = false) => {
    if (networkMode === "OFFLINE") {
      setNetworkMode("ONLINE");
      syncEngine.setNetworkMode("ONLINE");
    }

    setIsSyncing(true);
    setSyncProgress(10);
    setSyncMessage("بدء الاتصال بخادم السحابة وفحص التوافق...");
    setSyncResult(null);

    const result = await syncEngine.triggerSync({
      branchFilter: selectedBranch,
      moduleFilter: selectedModule,
      bypassBatteryCheck,
      onProgress: (prog, msg) => {
        setSyncProgress(prog);
        setSyncMessage(msg);
      },
    });

    setIsSyncing(false);
    setSyncResult(result);
  };

  const handleSimulateOffline = (type: SyncEntity = "INVOICE") => {
    syncEngine.simulateOfflineTransaction(type);
    setSyncResult({
      success: true,
      message: `تم حفظ العملية التجريبية محلياً (${type === "INVOICE" ? "فاتورة مبيعات" : type === "JOURNAL_ENTRY" ? "قيد يومية" : "سند قبض"}) بنجاح في قاعدة البيانات المحلية وطابور المزامنة دون اتصال. يمكنك الآن فحص مزامنتها!`,
    });
  };

  const handleExportDB = () => {
    const data = syncEngine.exportLocalDatabase(encryptExport, encryptExport ? exportPassword : undefined);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medo_erp_local_database_${encryptExport ? "encrypted_" : ""}${new Date().toISOString().slice(0, 10)}.sqlite.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError("");
    setImportSuccess("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = syncEngine.importLocalDatabase(content, importPassword);
      if (res.success) {
        setImportSuccess(res.message);
      } else {
        setImportError(res.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCreateSnapshot = () => {
    syncEngine.createSnapshot(newSnapshotName);
    setNewSnapshotName("");
  };

  // Local table stats
  const localTableStats = [
    { name: "شجرة الحسابات (accounts)", count: "124 سجل", size: "48 KB", status: "مزامنة دورية" },
    { name: "قيود اليومية (journal_entries)", count: "89 قيد", size: "112 KB", status: "نشط محلياً" },
    { name: "فواتير المبيعات (invoices)", count: "64 فاتورة", size: "94 KB", status: "محلي + طابور" },
    { name: "سندات القبض والصرف (vouchers)", count: "48 سند", size: "58 KB", status: "محلي + طابور" },
    { name: "دليل الأصناف والمستودع (inventory)", count: "312 صنف", size: "142 KB", status: "محلي دائم" },
    { name: "حركات المخزون (stock_movements)", count: "73 حركة", size: "45 KB", status: "محلي + طابور" },
    { name: "طابور الخروج المعلق (sync_outbox)", count: `${pendingCount} معلق`, size: "18 KB", status: "في انتظار السحابة" },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in" style={{ fontFamily: "'Noto Naskh Arabic', 'Amiri', 'Droid Arabic Naskh', 'Traditional Arabic', sans-serif" }}>
      {/* Top Banner & Title */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0A2540] via-[#0B2A4A] to-[#071829] border border-slate-800/50 p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-300 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <Database className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-black text-slate-100">
                  مركز النظام الهجين ومحرك المزامنة المحلي (Local-First & Offline Engine)
                </h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  سيادة كاملة على البيانات (Data Sovereignty)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                نظام MeDo ERP يعمل بمبدأ <strong>"محلي في الأساس وسحابي عند الحاجة"</strong>. تظل كافة العمليات، الفواتير، والقيود
                متاحة وسريعة جداً بدون اتصال بالإنترنت وتُخزن في قاعدة بيانات محلية، ثم تُزامن تلقائياً وبأمان مع السحابة عند عودة الاتصال.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <PWAInstallButton variant="header" />
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                العودة للرئيسية
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Connection Mode Status Bar (Interactive Network Simulator) */}
      <div className="rounded-2xl bg-[#0A2540] border border-slate-800 p-4.5 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
                networkMode === "ONLINE"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : networkMode === "OFFLINE"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}
            >
              {networkMode === "ONLINE" ? (
                <Wifi className="w-5 h-5" />
              ) : networkMode === "OFFLINE" ? (
                <WifiOff className="w-5 h-5" />
              ) : (
                <Radio className="w-5 h-5 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">حالة الاتصال بالشبكة:</span>
                <span
                  className={`text-sm font-black flex items-center gap-1.5 ${
                    networkMode === "ONLINE"
                      ? "text-emerald-400"
                      : networkMode === "OFFLINE"
                      ? "text-rose-400"
                      : "text-amber-400"
                  }`}
                >
                  {networkMode === "ONLINE" && "🌐 متصل بالسحابة (Online Mode)"}
                  {networkMode === "OFFLINE" && "📶 وضع غير متصل (Offline Mode - Local Only)"}
                  {networkMode === "FLAKY" && "⚡ شبكة ضعيفة / متقطعة (Flaky / Low Bandwidth)"}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                {networkMode === "ONLINE" && "المزامنة المباشرة تعمل بتناغم مع الخادم السحابي مع حفظ نسخة محلية فورية."}
                {networkMode === "OFFLINE" && "يتم حفظ العمليات محلياً في قاعدة البيانات وطابور المزامنة بدون توقف."}
                {networkMode === "FLAKY" && "محاكاة لشبكة غير مستقرة لاختبار معالجة فقدان الحزم وإعادة المحاولة التلقائية."}
              </div>
            </div>
          </div>

          {/* Network Simulator Mode Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-[#071829] border border-slate-800 rounded-2xl self-start md:self-auto">
            <span className="text-[10px] text-slate-400 px-2 font-bold hidden sm:inline">محاكي الشبكة:</span>
            <button
              onClick={() => handleModeChange("ONLINE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                networkMode === "ONLINE"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>متصل 100%</span>
            </button>
            <button
              onClick={() => handleModeChange("OFFLINE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                networkMode === "OFFLINE"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>غير متصل (Offline)</span>
            </button>
            <button
              onClick={() => handleModeChange("FLAKY")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                networkMode === "FLAKY"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>شبكة متقطعة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab("OUTBOX")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === "OUTBOX"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-slate-400 hover:text-slate-200 bg-[#0A2540]/60"
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>طابور المزامنة السحابية (Sync Outbox)</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-mono font-bold">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("LOCAL_DB")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === "LOCAL_DB"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-slate-400 hover:text-slate-200 bg-[#0A2540]/60"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>قاعدة البيانات المحلية (SQLite Local Engine)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("CONFLICTS")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === "CONFLICTS"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-slate-400 hover:text-slate-200 bg-[#0A2540]/60"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>حل التعارضات (Conflict Resolution)</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[10px] font-mono font-bold">
            {conflictLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("BACKUP")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === "BACKUP"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-slate-400 hover:text-slate-200 bg-[#0A2540]/60"
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>النسخ الاحتياطي المشفر والاستعادة</span>
        </button>

        <button
          onClick={() => setActiveSubTab("POWER_SETTINGS")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === "POWER_SETTINGS"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-slate-400 hover:text-slate-200 bg-[#0A2540]/60"
          }`}
        >
          <BatteryCharging className="w-4 h-4" />
          <span>إعدادات حفظ البطارية (Battery & Power)</span>
          {syncChargingOnly ? (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isCharging
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-700/60"
                  : "bg-amber-950 text-amber-300 border border-amber-700/60"
              }`}
            >
              {isCharging ? "شحن ⚡" : "بطارية 🔋"}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">({batteryLevel}%)</span>
          )}
        </button>
      </div>

      {/* Tab 1: Sync Outbox Queue */}
      {activeSubTab === "OUTBOX" && (
        <div className="space-y-6">
          {/* Battery Saver Alert Banner if suspended */}
          {syncChargingOnly && !isCharging && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-950 border border-amber-700 text-amber-400">
                  <Battery className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-200 flex items-center gap-2">
                    <span>وضع المزامنة عند الشحن فقط مفعل ⚡</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/80 text-amber-300 font-mono">
                      البطارية: {batteryLevel}%
                    </span>
                  </h4>
                  <p className="text-[11px] text-amber-300/80 mt-0.5">
                    المزامنة التلقائية معلقة لحماية بطارية الجهاز من الاستهلاك السريع. سيتم رفع العمليات فور وصل الشاحن، أو يمكنك المزامنة الفورية الآن بالتجاوز.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleStartSync(true)}
                  disabled={isSyncing}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  مزامنة استثنائية بالتجاوز ⚡
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("POWER_SETTINGS")}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
                >
                  إعدادات الشحن
                </button>
              </div>
            </div>
          )}

          {/* Quick Action bar & Sync Execution Card */}
          <div className="bg-[#0A2540] border border-slate-800 rounded-3xl p-5 shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <RefreshCw className={`w-5 h-5 text-emerald-400 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>طابور العمليات المنفذة دون اتصال (Outbox Queue)</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  جميع الفواتير والقيود والسندات وحركات المخزون التي تم إنشاؤها أثناء انقطاع النت تُحفظ محلياً وتظهر هنا
                  في انتظار المزامنة مع السحابة.
                </p>
              </div>

              {/* Sync Trigger and Simulation Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleStartSync(false)}
                  disabled={isSyncing}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all shadow-md cursor-pointer ${
                    isSyncing
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                      : pendingCount > 0
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20 active:scale-95"
                      : "bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 active:scale-95"
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>
                    {pendingCount > 0
                      ? `بدء المزامنة والترحيل للسحابة (${pendingCount})`
                      : "فحص الاتصال ومطابقة السحابة (100%)"}
                  </span>
                </button>

                <button
                  onClick={() => handleSimulateOffline("INVOICE")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#071829] hover:bg-slate-800 text-amber-300 border border-amber-500/30 transition-all active:scale-95 cursor-pointer shadow-sm"
                  title="إنشاء فاتورة محلية للتأكد من حفظ العمليات دون اتصال"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>محاكاة عملية دون اتصال ⚡</span>
                </button>

                {onOpenQuickAction && (
                  <div className="flex items-center gap-1.5 bg-[#071829] p-1 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 px-2 font-bold hidden sm:inline">إدخال حقيقي:</span>
                    <button
                      onClick={() => onOpenQuickAction("INVOICE")}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      + فاتورة
                    </button>
                    <button
                      onClick={() => onOpenQuickAction("JOURNAL")}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      + قيد
                    </button>
                    <button
                      onClick={() => onOpenQuickAction("RECEIPT")}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      + سند
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sync Progress Bar */}
            {isSyncing && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                  <span>{syncMessage}</span>
                  <span className="font-mono">{syncProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#071829] overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Sync Result Alert */}
            {syncResult && (
              <div
                className={`mt-4 p-3.5 rounded-2xl flex items-start gap-3 text-xs border ${
                  syncResult.success
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                }`}
              >
                {syncResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-bold">{syncResult.success ? "نجاح المزامنة" : "تنبيه المزامنة"}</div>
                  <div className="text-[11px] mt-0.5 text-slate-300">{syncResult.message}</div>
                </div>
              </div>
            )}

            {/* Selective Sync Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-bold">تصفية حسب الفرع:</span>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-[#071829] border border-slate-700 rounded-xl px-2.5 py-1 text-slate-200 text-xs focus:border-emerald-500 outline-none"
                >
                  <option value="ALL">جميع الفروع (All Branches)</option>
                  <option value="BR-SANAA-MAIN">الفرع الرئيسي - صنعاء</option>
                  <option value="BR-ADEN-PORT">فرع المنطقة الحرة - عدن</option>
                  <option value="BR-HOD-PORT">فرع ميناء الحديدة</option>
                  <option value="BR-MARIB-IND">فرع مأرب الصناعي</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-bold">تصفية حسب الوحدة:</span>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value as any)}
                  className="bg-[#071829] border border-slate-700 rounded-xl px-2.5 py-1 text-slate-200 text-xs focus:border-emerald-500 outline-none"
                >
                  <option value="ALL">كافة الوحدات المحاسبية</option>
                  <option value="INVOICE">فواتير المبيعات</option>
                  <option value="JOURNAL_ENTRY">قيود اليومية</option>
                  <option value="VOUCHER">سندات القبض والصرف</option>
                  <option value="STOCK_MOVEMENT">حركات المخزون</option>
                </select>
              </div>
            </div>
          </div>

          {/* Outbox Table */}
          <div className="bg-[#0A2540] border border-slate-800 rounded-3xl overflow-hidden shadow-md">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <span>المعاملات المعلقة في طابور الخروج</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {outbox.length} معاملة
                </span>
              </div>
              <button
                onClick={() => syncEngine.clearSynced()}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>تنظيف المعاملات المكتملة</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-[#071829] text-slate-400 border-b border-slate-800 font-bold">
                    <th className="p-3.5">المعرف والنوع</th>
                    <th className="p-3.5">البيان / الوصف</th>
                    <th className="p-3.5">الفرع</th>
                    <th className="p-3.5">توقيت الإنشاء محلياً</th>
                    <th className="p-3.5">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {outbox.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        لا توجد معاملات في طابور الخروج. جميع العمليات متزامنة كلياً!
                      </td>
                    </tr>
                  ) : (
                    outbox.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-mono">
                          <div className="font-bold text-slate-200">{item.entityId}</div>
                          <div className="text-[10px] text-emerald-400 font-sans">{item.entity}</div>
                        </td>
                        <td className="p-3.5 text-slate-300 max-w-xs truncate">{item.entityRef}</td>
                        <td className="p-3.5 text-slate-400 text-[11px]">{item.branchName || "الفرع الرئيسي"}</td>
                        <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                          {new Date(item.createdAt).toLocaleTimeString("ar-YE")}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                              item.status === "SYNCED"
                                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                                : item.status === "PENDING"
                                ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                                : "bg-rose-950/80 text-rose-400 border border-rose-800/60"
                            }`}
                          >
                            {item.status === "SYNCED" ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>تمت المزامنة</span>
                              </>
                            ) : item.status === "PENDING" ? (
                              <>
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>في الانتظار (معلق)</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                <span>تعارض / فشل</span>
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SQLite Local Database Engine */}
      {activeSubTab === "LOCAL_DB" && (
        <div className="space-y-6">
          {/* Engine Header Info */}
          <div className="bg-[#0A2540] border border-slate-800 rounded-3xl p-5 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sap-secondary/20 text-sap-secondary border border-sap-secondary/40 flex items-center justify-center flex-shrink-0">
                  <Database className="w-5 h-5 text-sap-secondary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>محرك التخزين المحلي (SQLite IndexedDB Virtual FileSystem)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                      ACTIVE & READY
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    يعمل المحرك داخل بيئة العميل المحلية مباشرة، مما يضمن استجابة في أجزاء من الثانية (Zero Latency) وأماناً
                    تاماً لبيانات المؤسسة دون الحاجة لخوادم وسيطة أثناء انقطاع النت.
                  </p>
                </div>
              </div>

              <div className="text-left font-mono text-xs text-slate-400">
                <div>إجمالي الجداول: <strong className="text-slate-200">7 جداول</strong></div>
                <div>الحجم التقديري: <strong className="text-emerald-400">517 KB</strong></div>
              </div>
            </div>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localTableStats.map((tbl, i) => (
              <div key={i} className="bg-[#0A2540] border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-200 font-mono">{tbl.name}</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#071829] text-emerald-400 font-mono border border-slate-800">
                    {tbl.size}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/50">
                  <span>عدد السجلات: <strong className="text-slate-200 font-mono">{tbl.count}</strong></span>
                  <span className="text-[11px] text-teal-400">{tbl.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Standalone Desktop / PWA Banner */}
          <PWAInstallButton variant="banner" />
        </div>
      )}

      {/* Tab 3: Conflict Resolution Manager */}
      {activeSubTab === "CONFLICTS" && (
        <div className="space-y-6">
          <div className="bg-[#0A2540] border border-slate-800 rounded-3xl p-5 shadow-md">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>استراتيجية حل التعارضات (Conflict Resolution Strategy)</span>
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              عند تعديل نفس القيد أو الفاتورة في السحابة وفي الفرع دون اتصال في نفس اللحظة، يقوم محرك المزامنة بتطبيق
              القاعدة المحددة أدناه لضمان دقة القوائم المالية وتجنب ازدواجية الإدخال:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: "TIMESTAMP_LATEST",
                  title: "أحدث طابع زمني (Last-Write-Wins)",
                  desc: "اعتماد التعديل الأحدث زمنياً مع أرشفة السجل الأقدم في سجل التدقيق.",
                },
                {
                  id: "BRANCH_AUTHORITY",
                  title: "أولوية الفرع المحلي (Branch Wins)",
                  desc: "إعطاء الأولوية للفرع الميداني الذي نفذ المعاملة وتحديث السحابة.",
                },
                {
                  id: "CLOUD_AUTHORITY",
                  title: "أولوية السحابة (Cloud Master)",
                  desc: "اعتماد نسخة السحابة المركزية وإشعار الفرع المحلي بالمراجعة.",
                },
                {
                  id: "MANUAL_REVIEW",
                  title: "مراجعة وتدقيق يدوي (Manual)",
                  desc: "إيقاف السجل المتعارض وتنبيه مراقب الحسابات لاعتماد النسخة الصحيحة.",
                },
              ].map((strat) => (
                <button
                  key={strat.id}
                  onClick={() => handleStrategyChange(strat.id as ConflictResolutionStrategy)}
                  className={`p-3.5 rounded-2xl text-right transition-all border cursor-pointer ${
                    conflictStrategy === strat.id
                      ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md"
                      : "bg-[#071829] border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold">{strat.title}</span>
                    {conflictStrategy === strat.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{strat.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Conflict History Table */}
          <div className="bg-[#0A2540] border border-slate-800 rounded-3xl overflow-hidden shadow-md">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">سجل التعارضات المحلولة سابقاً (Resolution Audit Log)</span>
              <span className="text-[10px] text-slate-400">{conflictLogs.length} سجلات تعارض</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-[#071829] text-slate-400 border-b border-slate-800 font-bold">
                    <th className="p-3.5">المعاملة</th>
                    <th className="p-3.5">الاستراتيجية المطبقة</th>
                    <th className="p-3.5">نتيجة المعالجة</th>
                    <th className="p-3.5">الفرع</th>
                    <th className="p-3.5">التاريخ والوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {conflictLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">
                        لم يتم تسجيل أي تعارضات سابقة في هذا الجهاز.
                      </td>
                    </tr>
                  ) : (
                    conflictLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono">
                          <div className="font-bold text-slate-200">{log.entityId}</div>
                          <div className="text-[10px] text-slate-400">{log.entityRef}</div>
                        </td>
                        <td className="p-3.5 text-amber-300 font-medium">{log.strategyUsed}</td>
                        <td className="p-3.5 text-slate-300 text-[11px]">{log.resolutionSummary}</td>
                        <td className="p-3.5 text-slate-400">{log.branchId}</td>
                        <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString("ar-YE")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Local Encrypted Backup & Restore */}
      {activeSubTab === "BACKUP" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export Section */}
            <div className="bg-[#0A2540] border border-slate-800 rounded-3xl p-5 shadow-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Download className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">تصدير قاعدة البيانات المحلية (Local DB Export)</h3>
                  <p className="text-xs text-slate-400">حفظ نسخة كاملة من الحسابات والفواتير والقيود كملف مشفر.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#071829] border border-slate-800 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={encryptExport}
                    onChange={(e) => setEncryptExport(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    {encryptExport ? <Lock className="w-3.5 h-3.5 text-emerald-400" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                    تشفير النسخة الاحتياطية بكلمة مرور (AES-GCM-256)
                  </span>
                </label>

                {encryptExport && (
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">كلمة مرور التشفير:</label>
                    <input
                      type="password"
                      value={exportPassword}
                      onChange={(e) => setExportPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 outline-none font-mono"
                      placeholder="أدخل كلمة مرور قوية..."
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleExportDB}
                className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>تحميل ملف النسخة الاحتياطية (.sqlite.json)</span>
              </button>
            </div>

            {/* Import Section */}
            <div className="bg-[#0A2540] border border-slate-800 rounded-3xl p-5 shadow-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">استعادة قاعدة بيانات (Restore Local DB)</h3>
                  <p className="text-xs text-slate-400">استيراد ملف قاعدة بيانات واسترجاع كافة القيود والفواتير.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#071829] border border-slate-800 space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">كلمة مرور فك التشفير (إذا كان الملف مشفراً):</label>
                  <input
                    type="password"
                    value={importPassword}
                    onChange={(e) => setImportPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 outline-none font-mono"
                    placeholder="أدخل كلمة المرور إذا لزم..."
                  />
                </div>

                <label className="block w-full py-3 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500 bg-slate-900/50 text-center cursor-pointer transition-colors">
                  <span className="text-xs font-bold text-emerald-400 block">اختر ملف النسخة الاحتياطية (.sqlite.json / .json)</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">انقر للتحديد من جهازك</span>
                  <input type="file" accept=".json,.sqlite" onChange={handleImportFile} className="hidden" />
                </label>

                {importSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{importSuccess}</span>
                  </div>
                )}

                {importError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Snapshots */}
          <div className="bg-[#0A2540] border border-slate-800 rounded-3xl p-5 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span>نقاط الاستعادة السريعة (Local DB Snapshots)</span>
              </h3>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={newSnapshotName}
                  onChange={(e) => setNewSnapshotName(e.target.value)}
                  placeholder="اسم نقطة الاستعادة..."
                  className="bg-[#071829] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500 w-full sm:w-60"
                />
                <button
                  onClick={handleCreateSnapshot}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
                >
                  إنشاء نقطة استعادة
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-3.5 rounded-2xl bg-[#071829] border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span>{snap.name}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-md bg-slate-800 text-slate-400 font-mono">
                        {snap.checksum}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{snap.description}</div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span>{snap.recordCount} سجل</span>
                    <span>{(snap.sizeBytes / 1024).toFixed(0)} KB</span>
                    <span>{new Date(snap.createdAt).toLocaleDateString("ar-YE")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Power Saving & Battery Sync Settings */}
      {activeSubTab === "POWER_SETTINGS" && (
        <div className="space-y-6">
          {/* Main Hero Card */}
          <div className="bg-[#0A2540] border border-slate-800 rounded-3xl p-6 shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-xl border ${
                      isCharging
                        ? "bg-emerald-950 border-emerald-700 text-emerald-400"
                        : "bg-amber-950 border-amber-700 text-amber-400"
                    }`}
                  >
                    {isCharging ? (
                      <BatteryCharging className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Battery className="w-6 h-6 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <span>وضع المزامنة عند الشحن فقط (Battery Saver Mode)</span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                          syncChargingOnly
                            ? isCharging
                              ? "bg-emerald-950 text-emerald-300 border-emerald-600"
                              : "bg-amber-950 text-amber-300 border-amber-600"
                            : "bg-slate-900 text-slate-400 border-slate-700"
                        }`}
                      >
                        {syncChargingOnly
                          ? isCharging
                            ? "مفعل ومتاح (متصل بالشاحن ⚡)"
                            : "مفعل (معلق بالبطارية 🔋)"
                          : "معطل (مزامنة عادية)"}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      تقليل استهلاك طاقة الجهاز وحفظ البطارية عند العمل الميداني أو في الفروع خارج الشبكة الكهربائية.
                    </p>
                  </div>
                </div>
              </div>

              {/* Master Toggle Button */}
              <button
                type="button"
                onClick={() => handleToggleChargingOnly(!syncChargingOnly)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all border cursor-pointer shadow-lg active:scale-95 whitespace-nowrap self-start lg:self-auto ${
                  syncChargingOnly
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-emerald-700/30"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                {syncChargingOnly ? (
                  <>
                    <ToggleRight className="w-5 h-5 text-emerald-100" />
                    <span>الوضع مفعل (المزامنة عند الشحن فقط) ⚡</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5 text-slate-400" />
                    <span>تفعيل المزامنة عند الشحن فقط</span>
                  </>
                )}
              </button>
            </div>

            {/* Battery Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              {/* Battery Level Card */}
              <div className="p-4 rounded-2xl bg-[#071829] border border-slate-800/80 space-y-2">
                <span className="text-xs text-slate-400 font-bold block">مستوى شحن البطارية الحالي</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-white">{batteryLevel}%</span>
                  <span className="text-xs text-slate-400 font-normal">
                    {batteryLevel > 70 ? "ممتاز" : batteryLevel > 30 ? "متوسط" : "منخفض"}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCharging
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                        : batteryLevel > 30
                        ? "bg-amber-400"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, batteryLevel))}%` }}
                  ></div>
                </div>
              </div>

              {/* Power Source Card */}
              <div className="p-4 rounded-2xl bg-[#071829] border border-slate-800/80 space-y-2">
                <span className="text-xs text-slate-400 font-bold block">مصدر الطاقة وحالة التوصيل</span>
                <div className="flex items-center gap-2">
                  {isCharging ? (
                    <Zap className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <BatteryMedium className="w-5 h-5 text-amber-400" />
                  )}
                  <span
                    className={`text-sm font-black ${
                      isCharging ? "text-emerald-300" : "text-amber-300"
                    }`}
                  >
                    {isCharging ? "متصل بالشاحن (AC Adapter ⚡)" : "يعمل على طاقة البطارية (DC 🔋)"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {hasBatteryApi
                    ? "قراءة تلقائية مباشرة من مستشعر الجهاز (Battery API)"
                    : simulatedCharging !== null
                    ? "قراءة وضع المحاكاة اليدوية للمطورين"
                    : "محرك الطاقة القياسي المتوافق"}
                </div>
              </div>

              {/* Engine Sync Verdict Card */}
              <div className="p-4 rounded-2xl bg-[#071829] border border-slate-800/80 space-y-2">
                <span className="text-xs text-slate-400 font-bold block">قرار محرك المزامنة التلقائية</span>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      !syncChargingOnly || isCharging ? "text-emerald-400" : "text-amber-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-black ${
                      !syncChargingOnly || isCharging ? "text-emerald-300" : "text-amber-300"
                    }`}
                  >
                    {!syncChargingOnly || isCharging ? "المزامنة مسموحة ونشطة" : "المزامنة التلقائية معلقة"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {!syncChargingOnly
                    ? "المزامنة تعمل بصورة طبيعية دون اشتراط الشحن."
                    : isCharging
                    ? "تم اكتشاف توصيل الشاحن، المزامنة مسموحة."
                    : "يتم حفظ العمليات محلياً لحين توصيل الشاحن."}
                </div>
              </div>
            </div>

            {/* Test Simulation Controls */}
            <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>أدوات محاكاة الشاحن لاختبار السيناريوهات:</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  يتيح لك اختبار سلوك النظام عند فصل الشاحن أو توصيله على الأجهزة المكتبية أو المتصفحات التي تقيّد مستشعر البطارية.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => syncEngine.setSimulatedCharging(true)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    simulatedCharging === true
                      ? "bg-emerald-950 border-emerald-500 text-emerald-200 shadow-sm"
                      : "bg-[#071829] border-slate-700 text-slate-300 hover:text-white"
                  }`}
                >
                  ⚡ محاكاة متصل بالشاحن
                </button>

                <button
                  type="button"
                  onClick={() => syncEngine.setSimulatedCharging(false)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    simulatedCharging === false
                      ? "bg-amber-950 border-amber-500 text-amber-200 shadow-sm"
                      : "bg-[#071829] border-slate-700 text-slate-300 hover:text-white"
                  }`}
                >
                  🔋 محاكاة فصل الشاحن (على البطارية)
                </button>

                {simulatedCharging !== null && (
                  <button
                    type="button"
                    onClick={() => syncEngine.setSimulatedCharging(null)}
                    className="px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="الرجوع للقراءة التلقائية للمتصفح"
                  >
                    إعادة ضبط
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Technical Policy Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0A2540] border border-slate-800 rounded-3xl p-5 shadow-md space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>كيف يعمل وضع المزامنة عند الشحن فقط؟</span>
              </h3>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
                <li>
                  <strong className="text-white">تأجيل عمليات النقل الثقيلة:</strong> تجميع المعاملات في قاعدة البيانات المحلية المشفرة وتأجيل الاتصالات الدورية بالسحابة لحين توصيل مصدر طاقة خارجي.
                </li>
                <li>
                  <strong className="text-white">حماية البطارية من السخونة:</strong> إجراء المزامنة والتحقق من التجزئة وتشفير السجلات أثناء الشحن يجنب استنزاف بطارية الهاتف أو الجهاز اللوحي في الفروع.
                </li>
                <li>
                  <strong className="text-white">استقلالية تامة للعمليات:</strong> يستمر الموظف في إصدار الفواتير وطباعة السندات بدون أي تأخير، حيث تُخزن العمليات في طابور محلي غير متطاير.
                </li>
              </ul>
            </div>

            <div className="bg-[#0A2540] border border-slate-800 rounded-3xl p-5 shadow-md space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>المزامنة اليدوية الاستثنائية</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                حتى وإن كان وضع الشحن فقط مفعلاً والجهاز يعمل على البطارية، يمكنك دائماً الضغط على زر المزامنة الاستثنائية لتجاوز فحص البطارية ورفع العمليات فوراً في الحالات الطارئة.
              </p>
              <button
                type="button"
                onClick={() => handleStartSync(true)}
                disabled={isSyncing}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                <span>بدء مزامنة استثنائية فوراً (تجاوز فحص الشحن) ⚡</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
