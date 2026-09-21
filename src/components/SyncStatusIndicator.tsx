import React, { useState, useEffect, useRef } from "react";
import {
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Clock,
  Database,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Battery,
  BatteryCharging,
  BatteryMedium,
  Zap,
  Power,
  ToggleLeft,
  ToggleRight,
  Info,
} from "lucide-react";
import { LocalSyncEngine } from "../services/localSyncEngine";

interface SyncStatusIndicatorProps {
  onNavigateToSync?: () => void;
  className?: string;
  isCompact?: boolean;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  onNavigateToSync,
  className = "",
  isCompact = false,
}) => {
  const syncEngine = LocalSyncEngine.getInstance();
  const [isOpen, setIsOpen] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState(() => ({
    networkMode: syncEngine.getNetworkMode(),
    pendingCount: syncEngine.getPendingCount(),
    isSyncing: syncEngine.isSyncing(),
    lastSync: syncEngine.getFormattedLastSync(),
    rawLastSync: syncEngine.getLastSyncTime(),
    syncChargingOnly: syncEngine.isSyncOnlyWhileCharging(),
    isCharging: syncEngine.isDeviceCharging(),
    batteryLevel: syncEngine.getBatteryLevel(),
    hasBatteryApi: syncEngine.isBatteryApiSupported(),
    simulatedCharging: syncEngine.getSimulatedCharging(),
  }));

  // Update on engine notifications and on periodic timer
  useEffect(() => {
    const updateState = () => {
      setStatus({
        networkMode: syncEngine.getNetworkMode(),
        pendingCount: syncEngine.getPendingCount(),
        isSyncing: syncEngine.isSyncing(),
        lastSync: syncEngine.getFormattedLastSync(),
        rawLastSync: syncEngine.getLastSyncTime(),
        syncChargingOnly: syncEngine.isSyncOnlyWhileCharging(),
        isCharging: syncEngine.isDeviceCharging(),
        batteryLevel: syncEngine.getBatteryLevel(),
        hasBatteryApi: syncEngine.isBatteryApiSupported(),
        simulatedCharging: syncEngine.getSimulatedCharging(),
      });
    };

    const unsubscribe = syncEngine.subscribe(updateState);
    const interval = setInterval(updateState, 15000); // refresh relative time

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [syncEngine]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleQuickSync = async (e: React.MouseEvent, bypassBattery: boolean = true) => {
    e.stopPropagation();
    setIsManualSyncing(true);
    setSyncFeedback("جاري الاتصال بالسحابة وفحص التوافق...");

    const res = await syncEngine.triggerSync({ bypassBatteryCheck: bypassBattery });
    setIsManualSyncing(false);
    setSyncFeedback(res.message);

    setTimeout(() => {
      setSyncFeedback(null);
    }, 4500);
  };

  const handleToggleMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status.networkMode === "OFFLINE") {
      syncEngine.setNetworkMode("ONLINE");
    } else {
      syncEngine.setNetworkMode("OFFLINE");
    }
  };

  const handleToggleChargingOnly = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = !status.syncChargingOnly;
    syncEngine.setSyncOnlyWhileCharging(nextVal);
    setSyncFeedback(
      nextVal
        ? "تم تفعيل 'المزامنة عند الشحن فقط' للحفاظ على طاقة البطارية 🔋"
        : "تم تعطيل 'المزامنة عند الشحن فقط'. المزامنة ستعمل في أي وقت ⚡"
    );
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  const isOffline = status.networkMode === "OFFLINE";
  const isFlaky = status.networkMode === "FLAKY";
  const isSyncingActive = status.isSyncing || isManualSyncing;
  const isSuspendedForBattery = status.syncChargingOnly && !status.isCharging;

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Navbar Badge Button */}
      <button
        type="button"
        id="top-nav-sync-indicator-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all select-none cursor-pointer active:scale-95 shadow-sm ${
          isOffline
            ? "bg-rose-950/80 hover:bg-rose-900/90 border-rose-600/70 text-rose-200 hover:text-white shadow-rose-950/40"
            : isFlaky
            ? "bg-amber-950/80 hover:bg-amber-900/90 border-amber-600/70 text-amber-200 hover:text-white"
            : isSyncingActive
            ? "bg-cyan-950/90 hover:bg-cyan-900/90 border-cyan-500/70 text-cyan-200"
            : isSuspendedForBattery
            ? "bg-amber-950/80 hover:bg-amber-900/90 border-amber-500/70 text-amber-200 shadow-amber-950/40"
            : status.pendingCount > 0
            ? "bg-amber-950/70 hover:bg-amber-900/80 border-amber-500/50 text-amber-200"
            : "bg-[#071829]/90 hover:bg-slate-800/90 border-emerald-500/40 text-emerald-300 hover:text-white"
        }`}
        title="مؤشر حالة المزامنة التلقائية وخيار المزامنة عند الشحن فقط"
        aria-expanded={isOpen}
      >
        {/* Status Icon with Ping or Battery */}
        <div className="relative flex items-center justify-center">
          {isOffline ? (
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
          ) : isSyncingActive ? (
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          ) : isSuspendedForBattery ? (
            <Battery className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          ) : isFlaky ? (
            <Wifi className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
            </>
          )}
        </div>

        {/* Status Text for Desktop / Tablet */}
        {!isCompact && (
          <div className="hidden md:flex flex-col text-right leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[11.5px]">
                {isOffline
                  ? "وضع عدم الاتصال"
                  : isSyncingActive
                  ? "جاري المزامنة..."
                  : isSuspendedForBattery
                  ? "المزامنة معلقة (بالبطارية)"
                  : isFlaky
                  ? "شبكة متذبذبة"
                  : status.pendingCount > 0
                  ? "بانتظار الرفع"
                  : "متزامن مع السحابة"}
              </span>

              {status.pendingCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {status.pendingCount}
                </span>
              )}

              {/* Battery Mode Tag in Navbar */}
              {status.syncChargingOnly ? (
                <span
                  className={`text-[9.5px] px-1.5 py-0.2 rounded-md font-bold flex items-center gap-0.5 border ${
                    status.isCharging
                      ? "bg-emerald-950/90 text-emerald-300 border-emerald-600/60"
                      : "bg-amber-950/90 text-amber-300 border-amber-600/60"
                  }`}
                  title={
                    status.isCharging
                      ? "وضع الشحن فقط مفعل: متصل بالشاحن ⚡ المزامنة متاحة"
                      : "وضع الشحن فقط مفعل: يعمل على البطارية 🔋 المزامنة معلقة لتوفير الطاقة"
                  }
                >
                  {status.isCharging ? (
                    <>
                      <Zap className="w-2.5 h-2.5 text-emerald-400" />
                      <span>شحن ⚡</span>
                    </>
                  ) : (
                    <>
                      <Battery className="w-2.5 h-2.5 text-amber-400" />
                      <span>بطارية 🔋</span>
                    </>
                  )}
                </span>
              ) : (
                <span
                  className="hidden xl:inline-flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded bg-slate-900/80 border border-slate-700/60 text-slate-300"
                  title="خيار المزامنة عند الشحن متاح - اضغط للضبط"
                >
                  <BatteryMedium className="w-2.5 h-2.5 text-slate-400" />
                  <span>{status.batteryLevel}%</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[10px] text-slate-300 font-normal">
              <Clock className="w-2.5 h-2.5 opacity-70" />
              <span>آخر مزامنة: {status.lastSync.relativeTime}</span>
            </div>
          </div>
        )}

        {/* Compact view (Mobile / Tight spaces) */}
        {isCompact && (
          <div className="flex items-center gap-1 text-[11px]">
            <span>
              {isOffline
                ? "أوفلاين"
                : isSyncingActive
                ? "مزامنة..."
                : isSuspendedForBattery
                ? "بالبطارية"
                : "متزامن"}
            </span>
            {status.syncChargingOnly && (
              <span className="text-[10px]" title="وضع المزامنة عند الشحن فقط">
                {status.isCharging ? "⚡" : "🔋"}
              </span>
            )}
            {status.pendingCount > 0 && (
              <span className="text-[9px] px-1 rounded-full font-mono bg-amber-500/20 text-amber-300">
                {status.pendingCount}
              </span>
            )}
          </div>
        )}

        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </button>

      {/* Interactive Dropdown / Popover Card */}
      {isOpen && (
        <div
          id="sync-indicator-popover"
          className="absolute left-0 mt-2 w-84 sm:w-92 z-50 bg-[#071829] border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-right backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
          style={{ transformOrigin: "top left" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-xl border ${
                  isOffline
                    ? "bg-rose-950/60 border-rose-800 text-rose-400"
                    : isSuspendedForBattery
                    ? "bg-amber-950/60 border-amber-800 text-amber-400"
                    : "bg-emerald-950/60 border-emerald-800 text-emerald-400"
                }`}
              >
                {isOffline ? (
                  <CloudOff className="w-4 h-4" />
                ) : isSuspendedForBattery ? (
                  <Battery className="w-4 h-4" />
                ) : (
                  <Cloud className="w-4 h-4" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-black text-white">حالة المزامنة السحابية</h4>
                <p className="text-[10px] text-slate-300">MeDo Cloud & Offline Engine</p>
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isOffline
                  ? "bg-rose-950 border-rose-700 text-rose-300"
                  : isSyncingActive
                  ? "bg-cyan-950 border-cyan-700 text-cyan-300 animate-pulse"
                  : isSuspendedForBattery
                  ? "bg-amber-950 border-amber-700 text-amber-300"
                  : "bg-emerald-950 border-emerald-700 text-emerald-300"
              }`}
            >
              {isOffline
                ? "غير متصل (Offline)"
                : isSyncingActive
                ? "مزامنة نشطة"
                : isSuspendedForBattery
                ? "معلق لتوفير البطارية 🔋"
                : "متصل بالسحابة 🟢"}
            </span>
          </div>

          {/* Detailed Timestamps & Stats */}
          <div className="py-3 space-y-2.5 text-xs">
            {/* Last Successful Sync Time */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>وقت آخر مزامنة ناجحة:</span>
              </div>
              <div className="text-left">
                <div className="font-mono font-bold text-emerald-300 text-xs">
                  {status.lastSync.formattedTime}
                </div>
                <div className="text-[10px] text-slate-300">({status.lastSync.relativeTime})</div>
              </div>
            </div>

            {/* Local Queue & Storage */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">طابور العمليات:</span>
                <span
                  className={`font-mono font-bold ${
                    status.pendingCount > 0 ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {status.pendingCount === 0 ? "متطابق (0)" : `${status.pendingCount} معلق`}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">الحفظ المحلي:</span>
                <span className="text-cyan-300 font-bold flex items-center gap-1">
                  <Database className="w-3 h-3 text-cyan-400" />
                  SQLite
                </span>
              </div>
            </div>

            {/* --- Battery Saver: "Sync Only While Charging" Setting Box --- */}
            <div className="p-3 rounded-xl bg-[#0A2540]/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg border ${
                      status.isCharging
                        ? "bg-emerald-950 border-emerald-700 text-emerald-400"
                        : "bg-amber-950 border-amber-700 text-amber-400"
                    }`}
                  >
                    {status.isCharging ? (
                      <BatteryCharging className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Battery className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">
                      المزامنة عند الشحن فقط
                    </span>
                    <span className="text-[10px] text-slate-300">حفظ طاقة البطارية والشبكة</span>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={handleToggleChargingOnly}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
                    status.syncChargingOnly
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-700/30"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                  title="التبديل بين تشغيل وتعطيل المزامنة عند الشحن فقط"
                >
                  {status.syncChargingOnly ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-200" />
                      <span>مفعل ⚡</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-slate-400" />
                      <span>معطل</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Battery Telemetry & State */}
              <div className="bg-[#071829] p-2 rounded-lg border border-slate-800/80 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    {status.isCharging ? (
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <BatteryMedium className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>مصدر الطاقة:</span>
                  </span>
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      status.isCharging ? "text-emerald-300" : "text-amber-300"
                    }`}
                  >
                    {status.isCharging ? "⚡ متصل بالشاحن (AC Power)" : "🔋 يعمل على البطارية"}
                  </span>
                </div>

                {/* Battery level bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-300 font-mono w-8">
                    {status.batteryLevel}%
                  </span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        status.isCharging
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : status.batteryLevel > 30
                          ? "bg-amber-400"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, status.batteryLevel))}%` }}
                    ></div>
                  </div>
                </div>

                {/* Policy explanation */}
                <div className="text-[10px] text-slate-300 leading-normal pt-1 border-t border-slate-800/50">
                  {status.syncChargingOnly ? (
                    status.isCharging ? (
                      <span className="text-emerald-400 font-medium">
                        ✓ الجهاز متصل بالشاحن: المزامنة التلقائية الدورية مسموحة ونشطة.
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium">
                        ⏳ المزامنة التلقائية معلقة لتوفير البطارية حتى يتم توصيل الشاحن.
                      </span>
                    )
                  ) : (
                    <span className="text-slate-300">
                      المزامنة تعمل في كافة الأوضاع (سواء على الشاحن أو على البطارية).
                    </span>
                  )}
                </div>

                {/* Simulation controls for testability */}
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                  <span>محاكاة الشحن للاختبار:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        syncEngine.setSimulatedCharging(true);
                      }}
                      className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${
                        status.simulatedCharging === true
                          ? "bg-emerald-950 border-emerald-600 text-emerald-300"
                          : "bg-slate-900 border-slate-800 hover:text-white"
                      }`}
                      title="محاكاة توصيل الشاحن"
                    >
                      ⚡ متصل
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        syncEngine.setSimulatedCharging(false);
                      }}
                      className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${
                        status.simulatedCharging === false
                          ? "bg-amber-950 border-amber-600 text-amber-300"
                          : "bg-slate-900 border-slate-800 hover:text-white"
                      }`}
                      title="محاكاة فصل الشاحن"
                    >
                      🔋 مفصول
                    </button>
                    {status.simulatedCharging !== null && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          syncEngine.setSimulatedCharging(null);
                        }}
                        className="px-1 py-0.5 rounded text-[9px] text-slate-400 hover:text-white"
                        title="إلغاء المحاكاة واستخدام قراءة المتصفح الحقيقية"
                      >
                        إلغاء
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Offline notification if offline */}
            {isOffline && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-700/50 text-rose-300 text-[11px] leading-relaxed">
                <div className="font-bold flex items-center gap-1 text-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  النظام يعمل حالياً باستقلالية تامة:
                </div>
                يتم تخزين جميع الفواتير والقيود والسندات في قاعدة البيانات المحلية المشفرة وتُرحل تلقائياً فور الاتصال.
              </div>
            )}

            {/* Feedback notification if any */}
            {syncFeedback && (
              <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-[11px] font-bold text-center">
                {syncFeedback}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => handleQuickSync(e, true)}
                disabled={isSyncingActive}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSyncingActive
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : isSuspendedForBattery
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md active:scale-95"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-700/20 active:scale-95"
                }`}
                title={
                  isSuspendedForBattery
                    ? "مزامنة استثنائية فورية مع تجاوز فحص شحن البطارية"
                    : "بدء مزامنة فورية مع السحابة"
                }
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingActive ? "animate-spin" : ""}`} />
                <span>
                  {isSyncingActive
                    ? "جاري المزامنة..."
                    : isSuspendedForBattery
                    ? "مزامنة الآن (تجاوز البطارية) ⚡"
                    : "مزامنة الآن ⚡"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleToggleMode}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                  isOffline
                    ? "bg-emerald-950/80 hover:bg-emerald-900 border-emerald-600 text-emerald-300"
                    : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300"
                }`}
                title="التبديل بين وضع الاتصال ووضع عدم الاتصال"
              >
                {isOffline ? "اتصال بالسحابة" : "وضع أوفلاين"}
              </button>
            </div>

            {onNavigateToSync && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToSync();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-slate-400 hover:text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                <span>فتح مركز المزامنة وإدارة النزاعات وقاعدة البيانات</span>
                <ArrowRight className="w-3 h-3 rotate-180" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
