import React, { useState, useEffect } from "react";
import {
  Bell,
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  Save,
  Radio,
  Sliders,
  Sparkles,
  Phone,
  Send,
  ShieldAlert,
  CreditCard,
  FileSpreadsheet,
  AlertOctagon,
  Building2,
  UserCheck,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  soundService,
  SoundType,
  FinancialMovementEventType,
  EventSoundMapping,
  SoundConfig,
  WhatsAppNotificationPayload,
} from "../services/notificationSoundService";
import { cloudSecurityService } from "../services/cloudSecurityService";

interface SystemAlertCenterViewProps {
  currentUserName?: string;
}

const AVAILABLE_TONES: { type: SoundType; nameAr: string; descAr: string }[] = [
  {
    type: "ROYAL_BANK_CHIME",
    nameAr: "نغمة البنك الملكية (Royal Bank Chime)",
    descAr: "رنين تتابعي نقي مستوحى من البنوك السويسرية الفاخرة",
  },
  {
    type: "DIAMOND_VAULT",
    nameAr: "نغمة الخزينة الماسية (Diamond Vault)",
    descAr: "نغمات كريستالية آمنة مخصصة لحركات الصرف والخزائن",
  },
  {
    type: "URGENT_APPROVAL_PING",
    nameAr: "تنبيه الاعتماد الفوري (Urgent Ping)",
    descAr: "نبضات ثنائية بتردد متصاعد للقيود غير المتزنة والاعتمادات",
  },
  {
    type: "CASH_FLOW_PULSE",
    nameAr: "نبض التدفق النقدي (Cash Flow Pulse)",
    descAr: "نغمة تتابعية صاعدة للفواتير والإيرادات الكبرى",
  },
  {
    type: "ENTERPRISE_BELL",
    nameAr: "جرس المنظومة الرئاسي (Enterprise Bell)",
    descAr: "جرس هادئ ومميز للتنبيهات التشغيلية والمشرفين",
  },
  {
    type: "RADAR_SECURITY",
    nameAr: "صفير الرادار الأمني (Radar Security)",
    descAr: "تردد أمني تحذيري للنشاطات المشبوهة والإيقاف الفوري",
  },
  {
    type: "SUCCESS_CHIME",
    nameAr: "رنين الإنجاز والتمديد (Success Chime)",
    descAr: "نغمة احتفالية خفيفة عند اكتمال العمليات بنجاح",
  },
];

export const SystemAlertCenterView: React.FC<SystemAlertCenterViewProps> = ({
  currentUserName = "مدير النظام الأعلى",
}) => {
  const [config, setConfig] = useState<SoundConfig>(() => soundService.loadConfig());
  const [waLogs, setWaLogs] = useState<WhatsAppNotificationPayload[]>(() => soundService.getWhatsAppLogs());
  const [activeTab, setActiveTab] = useState<"MOVEMENT_TONES" | "WHATSAPP_GATEWAY">("MOVEMENT_TONES");

  const [playingEventType, setPlayingEventType] = useState<FinancialMovementEventType | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Global settings state
  const [globalVolume, setGlobalVolume] = useState<number>(config.volume);
  const [globalEnabled, setGlobalEnabled] = useState<boolean>(config.enabled);
  const [adminPhone, setAdminPhone] = useState<string>(config.adminWhatsAppPhone);
  const [largeTxThreshold, setLargeTxThreshold] = useState<number>(config.largeTxThreshold);

  // Mappings local state
  const [mappings, setMappings] = useState<Record<FinancialMovementEventType, EventSoundMapping>>(
    config.eventSoundMappings
  );

  useEffect(() => {
    const fresh = soundService.loadConfig();
    setConfig(fresh);
    setMappings(fresh.eventSoundMappings);
    setGlobalVolume(fresh.volume);
    setGlobalEnabled(fresh.enabled);
    setAdminPhone(fresh.adminWhatsAppPhone);
    setLargeTxThreshold(fresh.largeTxThreshold);
    setWaLogs(soundService.getWhatsAppLogs());
  }, []);

  const handleTestSound = (soundType: SoundType, eventType?: FinancialMovementEventType) => {
    if (eventType) setPlayingEventType(eventType);
    soundService.playSound(soundType, mappings[eventType || "PAYMENT_VOUCHERS"]?.volume || 0.85);
    setTimeout(() => {
      setPlayingEventType(null);
    }, 1200);
  };

  const handleUpdateMappingTone = (eventType: FinancialMovementEventType, tone: SoundType) => {
    const updated = {
      ...mappings,
      [eventType]: {
        ...mappings[eventType],
        soundType: tone,
      },
    };
    setMappings(updated);
    soundService.updateEventSoundMapping(eventType, { soundType: tone });
    handleTestSound(tone, eventType);
  };

  const handleUpdateMappingVolume = (eventType: FinancialMovementEventType, vol: number) => {
    const updated = {
      ...mappings,
      [eventType]: {
        ...mappings[eventType],
        volume: vol,
      },
    };
    setMappings(updated);
    soundService.updateEventSoundMapping(eventType, { volume: vol });
  };

  const handleToggleMappingEnabled = (eventType: FinancialMovementEventType, enabled: boolean) => {
    const updated = {
      ...mappings,
      [eventType]: {
        ...mappings[eventType],
        enabled,
      },
    };
    setMappings(updated);
    soundService.updateEventSoundMapping(eventType, { enabled });
  };

  const handleToggleMappingWhatsApp = (eventType: FinancialMovementEventType, autoWhatsApp: boolean) => {
    const updated = {
      ...mappings,
      [eventType]: {
        ...mappings[eventType],
        autoWhatsApp,
      },
    };
    setMappings(updated);
    soundService.updateEventSoundMapping(eventType, { autoWhatsApp });
  };

  const handleSaveAllConfig = () => {
    const saved = soundService.saveConfig({
      enabled: globalEnabled,
      volume: globalVolume,
      adminWhatsAppPhone: adminPhone,
      largeTxThreshold: largeTxThreshold,
      eventSoundMappings: mappings,
    });
    setConfig(saved);

    cloudSecurityService.recordImmutableAudit({
      category: "SECURITY",
      actionType: "ALERT_CENTER_CONFIG_SAVED",
      actorName: currentUserName,
      actorRole: "SYSTEM_ADMIN",
      details: `تم حفظ وتحديث إعدادات نغمات التنبيهات المخصصة وبوابة واتساب للمدير: هاتف (${adminPhone})، حد الحركات (${largeTxThreshold}).`,
    });

    soundService.playSound("SUCCESS_CHIME");
    setSaveSuccessMsg("✓ تم حفظ كافة إعدادات التنبيهات ونغمات الحركات المالية بنجاح!");
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  const handleSendTestWhatsApp = () => {
    const payload = soundService.notifyLargeFinancialTransaction(
      "سند صرف تجريبي (Test Voucher)",
      largeTxThreshold,
      "YER",
      `TX-TEST-${Date.now().toString().slice(-4)}`,
      "حركة مالية تجريبية للتحقق من وصول إشعارات واتساب الفورية للمدير الأعلى",
      currentUserName,
      true
    );
    setWaLogs(soundService.getWhatsAppLogs());
    if (payload.directLink) {
      window.open(payload.directLink, "_blank");
    }
  };

  const eventIcons: Record<FinancialMovementEventType, React.ReactNode> = {
    PAYMENT_VOUCHERS: <CreditCard className="w-5 h-5 text-amber-400" />,
    LARGE_INVOICES: <FileSpreadsheet className="w-5 h-5 text-emerald-400" />,
    UNBALANCED_ENTRIES: <AlertOctagon className="w-5 h-5 text-red-400" />,
    SECURITY_KILLSWITCH: <ShieldAlert className="w-5 h-5 text-rose-400" />,
    NEW_TENANT: <Building2 className="w-5 h-5 text-indigo-400" />,
    DUAL_APPROVAL: <UserCheck className="w-5 h-5 text-blue-400" />,
  };

  return (
    <div className="space-y-6 font-['Alexandria','Cairo',sans-serif] text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-blue-500/30 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>مركز تنبيهات النظام وتخصيص النغمات (System Alert Center)</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Web Audio & WhatsApp API 🔔
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              تخصيص نغمات صوتية فريدة لكل نوع من الحركات المالية (سندات الصرف، الفواتير الكبيرة، القيود المعلقة، الرادار الأمني) مع بوابة الإشعارات الفورية عبر واتساب.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveAllConfig}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition shadow-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500 text-emerald-200 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab("MOVEMENT_TONES")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === "MOVEMENT_TONES"
              ? "bg-indigo-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>تخصيص نغمات الحركات المالية</span>
        </button>
        <button
          onClick={() => setActiveTab("WHATSAPP_GATEWAY")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === "WHATSAPP_GATEWAY"
              ? "bg-emerald-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Send className="w-4 h-4" />
          <span>بوابة إشعارات واتساب للمدير (WhatsApp API)</span>
        </button>
      </div>

      {/* Tab 1: Financial Movement Tone Customization */}
      {activeTab === "MOVEMENT_TONES" && (
        <div className="space-y-6">
          {/* Master Volume & General Toggle */}
          <div className="bg-slate-900/90 border border-blue-500/30 p-5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">التحكم الصوتي العام في المتصفح</h3>
                  <p className="text-[11px] text-slate-400">تشغيل التنبيهات عبر واجهة Web Audio API بدون الحاجة لملفات صوت خارجية</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-bold">مستوى الصوت العام:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={globalVolume}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setGlobalVolume(v);
                      soundService.saveConfig({ volume: v });
                    }}
                    className="w-28 accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-indigo-300">
                    {Math.round(globalVolume * 100)}%
                  </span>
                </div>

                <button
                  onClick={() => {
                    const next = !globalEnabled;
                    setGlobalEnabled(next);
                    soundService.saveConfig({ enabled: next });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    globalEnabled
                      ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                      : "bg-red-600/30 text-red-300 border border-red-500/40"
                  }`}
                >
                  {globalEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>{globalEnabled ? "الأصوات مفعلة" : "الأصوات مكتومة"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cards for each Financial Movement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(Object.keys(mappings) as FinancialMovementEventType[]).map((eventType) => {
              const mapping = mappings[eventType];
              const isPlaying = playingEventType === eventType;

              return (
                <div
                  key={eventType}
                  className={`p-5 rounded-2xl border transition-all duration-200 ${
                    mapping.enabled
                      ? "bg-slate-900/90 border-blue-500/30 shadow-lg"
                      : "bg-slate-950/60 border-slate-800 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0">
                        {eventIcons[eventType]}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-white">{mapping.titleAr}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {mapping.descriptionAr}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleMappingEnabled(eventType, !mapping.enabled)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer shrink-0 ${
                        mapping.enabled
                          ? "bg-indigo-600 text-white shadow"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {mapping.enabled ? "مفعّل ✓" : "معطل"}
                    </button>
                  </div>

                  {/* Settings controls for this movement */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
                    {/* Tone Selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        نغمة التنبيه المخصصة:
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={mapping.soundType}
                          onChange={(e) =>
                            handleUpdateMappingTone(eventType, e.target.value as SoundType)
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                        >
                          {AVAILABLE_TONES.map((t) => (
                            <option key={t.type} value={t.type}>
                              {t.nameAr}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleTestSound(mapping.soundType, eventType)}
                          disabled={!mapping.enabled}
                          className="px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-40"
                          title="استماع تجريبي فوري"
                        >
                          <Play className={`w-3.5 h-3.5 ${isPlaying ? "animate-spin" : ""}`} />
                          <span>استماع</span>
                        </button>
                      </div>
                    </div>

                    {/* Volume and WhatsApp per event */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">مستوى الصوت:</span>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={mapping.volume}
                          onChange={(e) =>
                            handleUpdateMappingVolume(eventType, Number(e.target.value))
                          }
                          className="w-20 accent-indigo-500 cursor-pointer"
                        />
                        <span className="font-mono text-indigo-300 font-bold">
                          {Math.round(mapping.volume * 100)}%
                        </span>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mapping.autoWhatsApp}
                          onChange={(e) =>
                            handleToggleMappingWhatsApp(eventType, e.target.checked)
                          }
                          className="rounded accent-emerald-500"
                        />
                        <span className="text-slate-300 font-bold">
                          إرسال إشعار واتساب تلقائي للمدير 📱
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: WhatsApp Gateway & Logs */}
      {activeTab === "WHATSAPP_GATEWAY" && (
        <div className="space-y-6">
          {/* WhatsApp Admin Config */}
          <div className="bg-slate-900/90 border border-emerald-500/30 p-5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">إعدادات بوابة واتساب لمدير النظام (WhatsApp Admin Gateway)</h3>
                  <p className="text-[11px] text-slate-400">
                    استقبال إشعارات فورية عبر واتساب عند تفعيل منشأة جديدة أو تسجيل حركة مالية كبرى
                  </p>
                </div>
              </div>

              <button
                onClick={handleSendTestWhatsApp}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition shadow cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>إرسال إشعار تجريبي الآن 📲</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  رقم هاتف مدير النظام المستلم (مع رمز الدولة):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    placeholder="+967773586047"
                  />
                  <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-3.5" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">الرقم المعتمد: +967773586047 (بدر عايض - بن زياد)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  الحد الأدنى للمبالغ الكبرى المؤهلة للإشعار الفوري (YER):
                </label>
                <input
                  type="number"
                  step="50000"
                  value={largeTxThreshold}
                  onChange={(e) => setLargeTxThreshold(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">أي حركة تتجاوز هذا المبلغ ستطلق نغمة فورية وتفتح إشعار واتساب</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Logs Table */}
          <div className="bg-slate-900/90 border border-blue-500/30 p-5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">سجل الإشعارات الصادرة عبر واتساب (WhatsApp Notification Logs)</h3>
              </div>
              <span className="text-xs font-mono text-emerald-300 bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-800">
                {waLogs.length} إشعار
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">معرف الإشعار</th>
                    <th className="p-3">نوع الحدث</th>
                    <th className="p-3">العنوان والبيان</th>
                    <th className="p-3">المبلغ</th>
                    <th className="p-3">المستلم</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3">التوقيت</th>
                    <th className="p-3 text-center">فتح في واتساب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {waLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-500">
                        لا توجد إشعارات واتساب سابقة
                      </td>
                    </tr>
                  ) : (
                    waLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-3 text-indigo-300 font-bold">{log.id}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              log.eventType === "NEW_TENANT"
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                                : log.eventType === "LARGE_TRANSACTION"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            }`}
                          >
                            {log.eventType}
                          </span>
                        </td>
                        <td className="p-3 text-white font-['Alexandria'] max-w-xs truncate" title={log.message}>
                          {log.title}
                        </td>
                        <td className="p-3 font-bold text-amber-400">
                          {log.amount ? `${Number(log.amount).toLocaleString()} ${log.currency || "YER"}` : "—"}
                        </td>
                        <td className="p-3 text-slate-300">{log.recipientPhone}</td>
                        <td className="p-3">
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>مُرسل</span>
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">
                          {new Date(log.timestamp).toLocaleString("ar-SA")}
                        </td>
                        <td className="p-3 text-center">
                          {log.directLink && (
                            <a
                              href={log.directLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold transition inline-flex items-center gap-1"
                            >
                              <span>فتح</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
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
    </div>
  );
};
