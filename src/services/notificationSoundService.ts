/**
 * MeDo ERP - Advanced Notification Sound & WhatsApp API Integration Service
 * Cross-platform PC & Mobile Web Audio Synthesizer with WhatsApp instant notifications.
 */

export type SoundType =
  | "ROYAL_BANK_CHIME"
  | "DIAMOND_VAULT"
  | "URGENT_APPROVAL_PING"
  | "CASH_FLOW_PULSE"
  | "ENTERPRISE_BELL"
  | "RADAR_SECURITY"
  | "SUCCESS_CHIME"
  | "ENCRYPTION_VIOLATION_ALARM";

export interface WhatsAppNotificationPayload {
  id: string;
  eventType: "NEW_TENANT" | "LARGE_TRANSACTION" | "APPROVAL_REQUIRED" | "SECURITY_ALERT" | "CUSTOM";
  title: string;
  message: string;
  amount?: number;
  currency?: string;
  companyName?: string;
  initiatorName?: string;
  recipientPhone: string;
  timestamp: string;
  status: "SENT" | "DELIVERED" | "QUEUED";
  directLink?: string;
}

export type FinancialMovementEventType =
  | "PAYMENT_VOUCHERS"
  | "LARGE_INVOICES"
  | "UNBALANCED_ENTRIES"
  | "SECURITY_KILLSWITCH"
  | "NEW_TENANT"
  | "DUAL_APPROVAL";

export interface EventSoundMapping {
  eventType: FinancialMovementEventType;
  titleAr: string;
  descriptionAr: string;
  soundType: SoundType;
  enabled: boolean;
  volume: number; // 0.0 to 1.0
  autoWhatsApp: boolean;
}

export interface SoundConfig {
  selectedTone: SoundType;
  enabled: boolean;
  volume: number; // 0.0 to 1.0
  autoWhatsAppAdminOnLargeTx: boolean;
  largeTxThreshold: number; // e.g. 500,000 YER or 1,000 USD
  adminWhatsAppPhone: string;
  eventSoundMappings: Record<FinancialMovementEventType, EventSoundMapping>;
}

const DEFAULT_ADMIN_PHONE = "+967773586047";
const SOUND_CONFIG_KEY = "medo_erp_sound_config";
const WA_LOGS_KEY = "medo_erp_whatsapp_logs";

const DEFAULT_EVENT_MAPPINGS: Record<FinancialMovementEventType, EventSoundMapping> = {
  PAYMENT_VOUCHERS: {
    eventType: "PAYMENT_VOUCHERS",
    titleAr: "سندات الصرف والمدفوعات المالية",
    descriptionAr: "تشغيل نغمة الخزينة عند إصدار أو اعتماد سند صرف نقدي أو بنكي",
    soundType: "DIAMOND_VAULT",
    enabled: true,
    volume: 0.85,
    autoWhatsApp: true,
  },
  LARGE_INVOICES: {
    eventType: "LARGE_INVOICES",
    titleAr: "الفواتير والحركات المالية الكبرى",
    descriptionAr: "تشغيل نغمة التدفق النقدي عند تسجيل فاتورة مبيعات أو تحصيل ضخم",
    soundType: "CASH_FLOW_PULSE",
    enabled: true,
    volume: 0.9,
    autoWhatsApp: true,
  },
  UNBALANCED_ENTRIES: {
    eventType: "UNBALANCED_ENTRIES",
    titleAr: "القيود غير المتوازنة والمسودات المعلقة",
    descriptionAr: "تشغيل نغمة التنبيه العاجل عند رصد قيد محاسبي غير متزن أو مسودة معلقة",
    soundType: "URGENT_APPROVAL_PING",
    enabled: true,
    volume: 0.95,
    autoWhatsApp: false,
  },
  SECURITY_KILLSWITCH: {
    eventType: "SECURITY_KILLSWITCH",
    titleAr: "التنبيهات الأمنية والإيقاف الفوري (Kill-Switch)",
    descriptionAr: "تشغيل صفير الرادار الأمني عند رصد نشاط مشبوه أو تجميد حساب موظف",
    soundType: "RADAR_SECURITY",
    enabled: true,
    volume: 1.0,
    autoWhatsApp: true,
  },
  NEW_TENANT: {
    eventType: "NEW_TENANT",
    titleAr: "تفعيل المنشآت والاشتراكات الجديدة",
    descriptionAr: "تشغيل نغمة البنك الملكية عند تسجيل أو تفعيل مؤسسة تجريبية جديدة",
    soundType: "ROYAL_BANK_CHIME",
    enabled: true,
    volume: 0.85,
    autoWhatsApp: true,
  },
  DUAL_APPROVAL: {
    eventType: "DUAL_APPROVAL",
    titleAr: "طلبات الاعتماد والرقابة المزدوجة",
    descriptionAr: "تشغيل جرس المنظومة الفاخر عند انتظار حركة مالية لاعتماد المشرف",
    soundType: "ENTERPRISE_BELL",
    enabled: true,
    volume: 0.8,
    autoWhatsApp: true,
  },
};

export class NotificationSoundService {
  private static instance: NotificationSoundService;
  private audioCtx: AudioContext | null = null;
  private config: SoundConfig = {
    selectedTone: "ROYAL_BANK_CHIME",
    enabled: true,
    volume: 0.8,
    autoWhatsAppAdminOnLargeTx: true,
    largeTxThreshold: 500000,
    adminWhatsAppPhone: DEFAULT_ADMIN_PHONE,
    eventSoundMappings: DEFAULT_EVENT_MAPPINGS,
  };

  private constructor() {
    this.loadConfig();
  }

  public static getInstance(): NotificationSoundService {
    if (!NotificationSoundService.instance) {
      NotificationSoundService.instance = new NotificationSoundService();
    }
    return NotificationSoundService.instance;
  }

  public loadConfig(): SoundConfig {
    try {
      const raw = localStorage.getItem(SOUND_CONFIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.config = {
          ...this.config,
          ...parsed,
          eventSoundMappings: {
            ...DEFAULT_EVENT_MAPPINGS,
            ...(parsed.eventSoundMappings || {}),
          },
        };
      }
    } catch (e) {
      console.warn("Could not load sound config", e);
    }
    return this.config;
  }

  public saveConfig(newConfig: Partial<SoundConfig>): SoundConfig {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(SOUND_CONFIG_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.warn("Could not save sound config", e);
    }
    return this.config;
  }

  public updateEventSoundMapping(
    eventType: FinancialMovementEventType,
    updates: Partial<EventSoundMapping>
  ): SoundConfig {
    const currentMappings = this.config.eventSoundMappings || DEFAULT_EVENT_MAPPINGS;
    const updatedMapping = {
      ...currentMappings[eventType],
      ...updates,
    };

    const updatedConfig = this.saveConfig({
      eventSoundMappings: {
        ...currentMappings,
        [eventType]: updatedMapping,
      },
    });

    return updatedConfig;
  }

  public playEventSound(eventType: FinancialMovementEventType): void {
    if (!this.config.enabled) return;
    const mapping = this.config.eventSoundMappings?.[eventType] || DEFAULT_EVENT_MAPPINGS[eventType];
    if (!mapping || !mapping.enabled) return;
    this.playSound(mapping.soundType, mapping.volume);
  }

  public getConfig(): SoundConfig {
    return { ...this.config };
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Synthesize and play custom crystal-clear tones
   */
  public playSound(soundType?: SoundType, overrideVolume?: number): void {
    if (!this.config.enabled && soundType === undefined) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const toneToPlay = soundType || this.config.selectedTone;
      const vol = overrideVolume !== undefined ? overrideVolume : this.config.volume;
      const now = ctx.currentTime;

      if (toneToPlay === "ROYAL_BANK_CHIME") {
        // Royal Multi-tone Bank Chime (C6 -> E6 -> G6 -> C7)
        const notes = [1046.5, 1318.5, 1567.98, 2093.0];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.25 * vol, now + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.4);
        });
      } else if (toneToPlay === "DIAMOND_VAULT") {
        // Diamond Vault Harmonic Resonance (Rich dual bells)
        [523.25, 1046.5, 1567.98].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = i === 0 ? "triangle" : "sine";
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.2 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.7);
        });
      } else if (toneToPlay === "URGENT_APPROVAL_PING") {
        // Rapid double attention pulse (High urgency)
        [0, 0.12].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(1760, now + offset); // A6
          gain.gain.setValueAtTime(0.3 * vol, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.1);
        });
      } else if (toneToPlay === "CASH_FLOW_PULSE") {
        // Cash Register / Currency Harmonic Sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.18); // A6

        gain.gain.setValueAtTime(0.28 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (toneToPlay === "RADAR_SECURITY") {
        // Security Radar Ping
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.2);

        gain.gain.setValueAtTime(0.18 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (toneToPlay === "ENCRYPTION_VIOLATION_ALARM") {
        // High-urgency security siren: alternating dual-frequency pulse
        [0, 0.18, 0.36].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(980, now + offset);
          osc.frequency.linearRampToValueAtTime(1350, now + offset + 0.09);
          osc.frequency.linearRampToValueAtTime(880, now + offset + 0.16);

          gain.gain.setValueAtTime(0.35 * vol, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.16);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.16);
        });
      } else {
        // ENTERPRISE_BELL
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

        gain.gain.setValueAtTime(0.3 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (err) {
      console.warn("Audio synth playback warning:", err);
    }
  }

  /**
   * Generates WhatsApp Web / API formatted URL
   */
  public generateWhatsAppUrl(phone: string, text: string): string {
    const cleanPhone = phone.replace(/[^\d]/g, "");
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  }

  /**
   * Dispatches an instant WhatsApp notification for New Tenant Activation
   */
  public notifyNewTenantActivation(companyName: string, ownerName: string, phone: string, email: string): WhatsAppNotificationPayload {
    this.playSound("ROYAL_BANK_CHIME");

    const message = `✨ *منظومة MeDo ERP السحابية - تفعيل منشأة جديدة* ✨
🏢 *اسم المنشأة*: ${companyName}
👤 *المالك / المدير*: ${ownerName}
📞 *الهاتف*: ${phone || "غير محدد"}
📧 *البريد*: ${email || "غير محدد"}
🔐 *حالة الحساب*: نشط ومفعل (فترة تجريبية 48 ساعة)
⏰ *التوقيت*: ${new Date().toLocaleString("ar-SA")}`;

    const adminPhone = this.config.adminWhatsAppPhone || DEFAULT_ADMIN_PHONE;
    const directLink = this.generateWhatsAppUrl(adminPhone, message);

    const payload: WhatsAppNotificationPayload = {
      id: `WA-TENANT-${Date.now()}`,
      eventType: "NEW_TENANT",
      title: "تفعيل منشأة جديدة",
      message,
      companyName,
      initiatorName: ownerName,
      recipientPhone: adminPhone,
      timestamp: new Date().toISOString(),
      status: "SENT",
      directLink,
    };

    this.saveWhatsAppLog(payload);
    return payload;
  }

  /**
   * Dispatches an instant WhatsApp notification for Large Financial Transactions
   */
  public notifyLargeFinancialTransaction(
    txType: string,
    amount: number,
    currency: string,
    referenceNo: string,
    description: string,
    initiatorName: string,
    requiresApproval = false
  ): WhatsAppNotificationPayload {
    this.playSound(requiresApproval ? "URGENT_APPROVAL_PING" : "CASH_FLOW_PULSE");

    const formattedAmount = Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2 });
    const message = `🚨 *تنبيه حركة مالية كبرى - MeDo ERP* 🚨
💰 *المبلغ*: ${formattedAmount} ${currency}
📑 *نوع الحركة*: ${txType} (مرجع: ${referenceNo})
📝 *البيان*: ${description}
👤 *المسؤول*: ${initiatorName}
⚠️ *الحالة*: ${requiresApproval ? "⏳ تتطلب اعتماد مدير النظام الفوري" : "✅ مقيدة بالسجلات"}
⏰ *التاريخ*: ${new Date().toLocaleString("ar-SA")}`;

    const adminPhone = this.config.adminWhatsAppPhone || DEFAULT_ADMIN_PHONE;
    const directLink = this.generateWhatsAppUrl(adminPhone, message);

    const payload: WhatsAppNotificationPayload = {
      id: `WA-TX-${Date.now()}`,
      eventType: "LARGE_TRANSACTION",
      title: `حركة مالية كبرى (${formattedAmount} ${currency})`,
      message,
      amount,
      currency,
      initiatorName,
      recipientPhone: adminPhone,
      timestamp: new Date().toISOString(),
      status: "SENT",
      directLink,
    };

    this.saveWhatsAppLog(payload);
    return payload;
  }

  /**
   * Saves notification log to local store
   */
  private saveWhatsAppLog(payload: WhatsAppNotificationPayload): void {
    try {
      const logs = this.getWhatsAppLogs();
      logs.unshift(payload);
      localStorage.setItem(WA_LOGS_KEY, JSON.stringify(logs.slice(0, 40)));
    } catch (e) {
      console.warn("Could not save WhatsApp log", e);
    }
  }

  /**
   * Retrieves all WhatsApp logs
   */
  public getWhatsAppLogs(): WhatsAppNotificationPayload[] {
    try {
      const raw = localStorage.getItem(WA_LOGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
}

export const soundService = NotificationSoundService.getInstance();
