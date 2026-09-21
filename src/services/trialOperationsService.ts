/**
 * MeDo ERP - Trial Operations Counter & Client Tracking Service
 * Enforces the strict 200-operation trial limit (locks on 201st operation)
 * Provides unique link tracking (client-1, client-2, client-3)
 */

export interface ClientTrackingRecord {
  clientId: string;
  clientName: string;
  firstAccessAt: string;
  lastAccessAt: string;
  operationsCount: number;
  featuresUsed: string[];
  totalSecondsSpent: number;
  deviceInfo: string;
  ipAddress?: string;
  feedbackSubmitted?: boolean;
  rating?: "LIKE" | "DISLIKE";
  chosenFeatures?: string[];
}

export const TRIAL_OPERATION_LIMIT = 200;

export class TrialOperationsService {
  private static instance: TrialOperationsService;
  private timerInterval: any = null;

  private constructor() {
    this.startSessionTimer();
  }

  public static getInstance(): TrialOperationsService {
    if (!TrialOperationsService.instance) {
      TrialOperationsService.instance = new TrialOperationsService();
    }
    return TrialOperationsService.instance;
  }

  /**
   * Get storage key for operations count of a tenant/client
   */
  private getOpsKey(tenantSlug: string): string {
    return `medo_trial_ops_${tenantSlug}`;
  }

  private getTrackingKey(clientId: string): string {
    return `medo_client_tracking_${clientId}`;
  }

  /**
   * Returns the current operations count
   */
  public getOperationsCount(tenantSlug: string = "client-1"): number {
    if (typeof window === "undefined") return 0;
    const raw = localStorage.getItem(this.getOpsKey(tenantSlug));
    return raw ? parseInt(raw, 10) || 0 : 0;
  }

  /**
   * Increments the operations count when a trial user performs any core action
   * (e.g., creates an invoice, voucher, journal entry, item, customer, vendor)
   * If it reaches 201, isLocked becomes true.
   */
  public incrementOperation(
    actionName: string,
    tenantSlug: string = "client-1",
    userRole?: string
  ): { count: number; isLocked: boolean; remaining: number } {
    if (typeof window === "undefined") return { count: 0, isLocked: false, remaining: 200 };

    // Admin accounts are 100% exempt from the operations lock
    if (userRole === "SUPER_ADMIN" || userRole === "SYSTEM_ADMIN") {
      return { count: 0, isLocked: false, remaining: 9999 };
    }

    const current = this.getOperationsCount(tenantSlug);
    const newCount = current + 1;
    localStorage.setItem(this.getOpsKey(tenantSlug), newCount.toString());

    // Record feature use in tracking
    this.recordFeatureUsed(tenantSlug, actionName);

    const isLocked = newCount > TRIAL_OPERATION_LIMIT;
    const remaining = Math.max(0, TRIAL_OPERATION_LIMIT - newCount);

    // Milestone Trigger (100, 180, 200 operations)
    if (newCount === 100) {
      this.dispatchMilestoneAlert("MILESTONE_100", tenantSlug, newCount);
    } else if (newCount === 180) {
      this.dispatchMilestoneAlert("MILESTONE_180", tenantSlug, newCount);
    } else if (newCount === 200) {
      this.dispatchMilestoneAlert("MILESTONE_200_LOCK", tenantSlug, newCount);
    }

    return {
      count: newCount,
      isLocked,
      remaining,
    };
  }

  /**
   * Dispatches milestone alert to server and records in local audit log
   */
  public async dispatchMilestoneAlert(
    milestone: "FIRST_ACCESS" | "SUBSEQUENT_LOGIN" | "MILESTONE_100" | "MILESTONE_180" | "MILESTONE_200_LOCK" | "MILESTONE_25" | "MILESTONE_45" | "MILESTONE_50_LOCK",
    clientId: string,
    operationsCount: number
  ): Promise<void> {
    if (typeof window === "undefined") return;

    const trackingRec = this.getClientRecord(clientId);
    const clientName = trackingRec?.clientName || this.getClientDefaultName(clientId);
    const ua = navigator.userAgent || "Desktop Device";
    const isMobile = /Android|iPhone|iPad|Mobile/i.test(ua);
    const deviceType = isMobile ? (ua.includes("iPhone") ? "جوال iPhone" : "جوال Android") : "كمبيوتر مكتبي (Windows / Mac)";

    const payload = {
      milestone,
      clientId,
      clientName,
      operationsCount,
      deviceType,
      userAgent: ua,
      timestamp: new Date().toISOString(),
    };

    // Store in admin alerts history
    this.recordAlertHistory(payload);

    try {
      await fetch("/api/security/trial-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn("[TRIAL TRACKING] Milestone dispatch failed (offline or pending):", err);
    }
  }

  private recordAlertHistory(alert: any): void {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("medo_trial_alerts_history");
      const list = raw ? JSON.parse(raw) : [];
      list.unshift({ ...alert, id: `ALT-${Date.now()}` });
      localStorage.setItem("medo_trial_alerts_history", JSON.stringify(list.slice(0, 50)));
    } catch (e) {}
  }

  public getAlertsHistory(): any[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("medo_trial_alerts_history");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  public getClientRecord(clientId: string): ClientTrackingRecord | null {
    if (typeof window === "undefined") return null;
    const key = this.getTrackingKey(clientId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  public getClientDefaultName(clientId: string): string {
    if (clientId === "client-1") return "شركة الأمل للتجارة العامة (العميل 1)";
    if (clientId === "client-2") return "مؤسسة النور للمعدات والزراعة (العميل 2)";
    if (clientId === "client-3") return "شركة القمة للإلكترونيات والأجهزة (العميل 3)";
    return `عميل تجريبي (${clientId})`;
  }

  /**
   * Checks if the trial has reached or exceeded 200 operations
   */
  public isTrialLocked(tenantSlug: string = "client-1", userRole?: string): boolean {
    if (userRole === "SUPER_ADMIN" || userRole === "SYSTEM_ADMIN") {
      return false;
    }
    const count = this.getOperationsCount(tenantSlug);
    return count >= TRIAL_OPERATION_LIMIT;
  }

  /**
   * Resets operations count (for admin testing or re-activation)
   */
  public resetOperations(tenantSlug: string = "client-1"): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.getOpsKey(tenantSlug));
  }

  /**
   * Register or update client access from unique link
   */
  public registerClientAccess(clientId: string, clientName?: string): ClientTrackingRecord {
    if (typeof window === "undefined") {
      return {
        clientId,
        clientName: clientName || clientId,
        firstAccessAt: new Date().toISOString(),
        lastAccessAt: new Date().toISOString(),
        operationsCount: 0,
        featuresUsed: [],
        totalSecondsSpent: 0,
        deviceInfo: "Browser",
      };
    }

    const key = this.getTrackingKey(clientId);
    const raw = localStorage.getItem(key);
    const now = new Date().toISOString();
    const ua = navigator.userAgent || "Desktop Browser";
    const isFirstAccess = !raw;

    let record: ClientTrackingRecord;
    if (raw) {
      try {
        record = JSON.parse(raw);
        record.lastAccessAt = now;
        record.operationsCount = this.getOperationsCount(clientId);
      } catch (e) {
        record = {
          clientId,
          clientName: clientName || this.getClientDefaultName(clientId),
          firstAccessAt: now,
          lastAccessAt: now,
          operationsCount: 0,
          featuresUsed: [],
          totalSecondsSpent: 0,
          deviceInfo: ua,
        };
      }
    } else {
      record = {
        clientId,
        clientName: clientName || this.getClientDefaultName(clientId),
        firstAccessAt: now,
        lastAccessAt: now,
        operationsCount: 0,
        featuresUsed: [],
        totalSecondsSpent: 0,
        deviceInfo: ua,
      };
    }

    localStorage.setItem(key, JSON.stringify(record));

    // Dispatch Login Alert (First access or subsequent)
    if (isFirstAccess) {
      this.dispatchMilestoneAlert("FIRST_ACCESS", clientId, record.operationsCount);
    } else {
      this.dispatchMilestoneAlert("SUBSEQUENT_LOGIN", clientId, record.operationsCount);
    }

    return record;
  }

  /**
   * Record a feature used by this client
   */
  public recordFeatureUsed(clientId: string, featureName: string): void {
    if (typeof window === "undefined") return;
    const key = this.getTrackingKey(clientId);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const rec: ClientTrackingRecord = JSON.parse(raw);
        if (!rec.featuresUsed.includes(featureName)) {
          rec.featuresUsed.push(featureName);
        }
        rec.operationsCount = this.getOperationsCount(clientId);
        localStorage.setItem(key, JSON.stringify(rec));
      } catch (e) {}
    }
  }

  /**
   * Record feedback from trial lock modal
   */
  public submitClientFeedback(
    clientId: string,
    rating: "LIKE" | "DISLIKE",
    chosenFeatures: string[]
  ): void {
    if (typeof window === "undefined") return;
    const key = this.getTrackingKey(clientId);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const rec: ClientTrackingRecord = JSON.parse(raw);
        rec.feedbackSubmitted = true;
        rec.rating = rating;
        rec.chosenFeatures = chosenFeatures;
        localStorage.setItem(key, JSON.stringify(rec));
      } catch (e) {}
    }
  }

  /**
   * Get all registered clients tracking for Master Admin view
   */
  public getAllClientsTracking(): ClientTrackingRecord[] {
    if (typeof window === "undefined") return [];
    const clientIds = ["client-1", "client-2", "client-3"];
    return clientIds.map((cid) => {
      const key = this.getTrackingKey(cid);
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const rec = JSON.parse(raw);
          rec.operationsCount = this.getOperationsCount(cid);
          return rec;
        } catch (e) {}
      }
      return {
        clientId: cid,
        clientName:
          cid === "client-1"
            ? "شركة الأمل للتجارة (العميل 1)"
            : cid === "client-2"
            ? "مؤسسة النور للمعدات والزراعة (العميل 2)"
            : "شركة القمة للإلكترونيات (العميل 3)",
        firstAccessAt: "لم يدخل بعد",
        lastAccessAt: "لم يدخل بعد",
        operationsCount: this.getOperationsCount(cid),
        featuresUsed: [],
        totalSecondsSpent: 0,
        deviceInfo: "-",
      };
    });
  }

  /**
   * Get single client tracking record
   */
  public getClientTracking(clientId: string): ClientTrackingRecord | null {
    if (typeof window === "undefined") return null;
    const key = this.getTrackingKey(clientId);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const rec = JSON.parse(raw);
        rec.operationsCount = this.getOperationsCount(clientId);
        return rec;
      } catch (e) {
        return null;
      }
    }
    return {
      clientId,
      clientName: this.getClientDefaultName(clientId),
      firstAccessAt: "لم يدخل بعد",
      lastAccessAt: "لم يدخل بعد",
      operationsCount: this.getOperationsCount(clientId),
      featuresUsed: [],
      totalSecondsSpent: 0,
      deviceInfo: "-",
    };
  }

  /**
   * Session timer to record total duration spent in app
   */
  private startSessionTimer(): void {
    if (typeof window === "undefined") return;
    this.timerInterval = setInterval(() => {
      const activeTenant = localStorage.getItem("medo_active_tenant_slug") || "client-1";
      if (activeTenant.startsWith("client-")) {
        const key = this.getTrackingKey(activeTenant);
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const rec: ClientTrackingRecord = JSON.parse(raw);
            rec.totalSecondsSpent = (rec.totalSecondsSpent || 0) + 10;
            localStorage.setItem(key, JSON.stringify(rec));
          } catch (e) {}
        }
      }
    }, 10000);
  }

  /**
   * Generates unique URL for each client
   */
  public getClientUniqueLink(clientId: string): string {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://medo-erp.cloud";
    return `${origin}/client/${clientId}`;
  }

  /**
   * Professional WhatsApp templates for client onboarding and engagement (Points 7 & 8)
   */
  public getWhatsAppTemplates(clientId: string): {
    id: string;
    title: string;
    timing: string;
    text: string;
    waUrl: string;
  }[] {
    const rec = this.getClientRecord(clientId);
    const clientName = rec?.clientName || this.getClientDefaultName(clientId);
    const link = this.getClientUniqueLink(clientId);
    const managerName = "بدر عائض محمد";
    const groupName = "مجموعة بن زياد التجارية";
    const managerPhone = "+0967773586047";

    const templates = [
      {
        id: "WELCOME",
        title: "الرسالة الترحيبية الأولى (فور إرسال الرابط)",
        timing: "عند إطلاق النسخة وإرسال الرابط للعميل",
        text:
          `السلام عليكم ورحمة الله وبركاته،\n\n` +
          `الأخوة الكرام في *${clientName}* المحترمون،\n` +
          `تحية طيبة وبعد،،\n\n` +
          `يسرنا في *${groupName}* أن نضع بين أيديكم رابط النسخة التجريبية الحصرية لمنظومة *MeDo ERP* المحاسبية والإدارية السحابية.\n\n` +
          `🔹 *رابط الدخول المباشر لبيئتكم الخاصة:* \n${link}\n\n` +
          `💡 *مميزات النسخة التجريبية:* \n` +
          `• قاعدة بيانات مستقلة بالكامل ومنعزلة.\n` +
          `• رصيد تجريبي يتيح تجربة حتى 200 عملية مكتملة (فواتير، قيود، سندات، مخازن).\n` +
          `• دعم العمل بالفوارق السعرية (صنعاء / عدن / الريال السعودي / الدولار).\n` +
          `• تقارير مالية وختامية وميزانية عمومية لحظية ودقيقة.\n\n` +
          `فريق الدعم والاستشارات جاهز لخدمتكم والإجابة على أي استفسار على مدار الساعة.\n\n` +
          `مع أطيب التحايا،\n` +
          `*${managerName}* | ${groupName}\n` +
          `هاتف / واتساب: ${managerPhone}`,
        waUrl: "",
      },
      {
        id: "FOLLOWUP_24H",
        title: "متابعة بعد 24 ساعة (اليوم الأول)",
        timing: "بعد مرور 24 ساعة من إرسال الرابط",
        text:
          `السلام عليكم ورحمة الله وبركاته،\n\n` +
          `حياكم الله شركاءنا في *${clientName}*،\n` +
          `نأمل أنكم بدأتم باكتشاف واجهات وسرعة منظومة *MeDo ERP*.\n\n` +
          `يسعدنا معرفة انطباعكم الأولي وهل واجهتم أي صعوبة في إضافة أي فاتورة أو الاطلاع على شجرة الحسابات والتقارير؟\n\n` +
          `إذا رغبتم بجلسة استعراض (Demo) سريعة لمدة 10 دقائق لتوضيح أهم المزايا، يسعدنا ترتيب ذلك في الوقت المناسب لكم.\n\n` +
          `دمتم بخير،\n` +
          `*${managerName}* | ${groupName}\n` +
          `واتساب: ${managerPhone}`,
        waUrl: "",
      },
      {
        id: "FOLLOWUP_3D",
        title: "متابعة اليوم الثالث (منتصف المدة)",
        timing: "في اليوم الثالث من فترة التجربة",
        text:
          `السلام عليكم ورحمة الله وبركاته،\n\n` +
          `الأخوة الأعزاء في *${clientName}*،\n` +
          `نتابع باهتمام تجربتكم لمنظومة *MeDo ERP* ويسرنا تزويدكم بأي دعم فني تحتاجونه لتجربة وحدات المخازن ونقاط البيع والفواتير الإلكترونية.\n\n` +
          `نود إحاطتكم بأن الرصيد التجريبي مصمم لإتاحة 200 عملية شاملة، ونحن على أتم الاستعداد لمناقشة خطة الانتقال وتخصيص النسخة الكاملة لمنشأتكم.\n\n` +
          `تحياتنا وتقديرنا،\n` +
          `*${managerName}* - ${groupName}`,
        waUrl: "",
      },
      {
        id: "MILESTONE_100_DEMO",
        title: "تنبيه بلوغ 100 عملية (عرض الديمو المباشر)",
        timing: "عند إنجاز العميل لـ 100 عملية في النظام",
        text:
          `مرحباً بكم *${clientName}*،\n\n` +
          `لاحظنا تفاعلكم المميز وإنجازكم لـ *100 عملية محاسبية* على منظومة MeDo ERP!\n` +
          `تقديراً لاهتمامكم، نود أن نعرض عليكم جلسة إرشادية مباشرة ومجانية لاستعراض:\n` +
          `1. توليد القوائم المالية الآلية (الأرباح والخسائر، كشف الحساب التحليلي).\n` +
          `2. وحدة الحوالات والصرافة بالفوارق السعرية بين صنعاء وعدن.\n` +
          `3. الربط الشبكي وإدارة الفروع والصلاحيات المتعددة.\n\n` +
          `هل يناسبكم اتصال سريع اليوم لاستعراض هذه المزايا؟\n` +
          `*${managerName}* | ${managerPhone}`,
        waUrl: "",
      },
      {
        id: "MILESTONE_180_URGENT",
        title: "تنبيه قرب استنفاد الرصيد (180 عملية)",
        timing: "عند بلوغ 180 عملية (متبقي 20 عملية فقط)",
        text:
          `أهلاً بكم *${clientName}*،\n\n` +
          `نحيطكم علماً بأنكم أنجزتم *180 عملية* من أصل 200 عملية مخصصة للنسخة التجريبية.\n` +
          `متبقي لكم *20 عملية فقط* قبل تفعيل شاشة الإغلاق وطلب المفتاح الدائم.\n\n` +
          `لضمان استمرارية العمل دون توقف وحجز نسختكم الأصلية مع خصم الإطلاق الخاص، يسعدنا التنسيق معكم لاعتماد باقة الاشتراك المناسبة.\n\n` +
          `مع التقدير،\n` +
          `*${managerName}* | ${groupName}`,
        waUrl: "",
      },
      {
        id: "MILESTONE_200_CLOSING",
        title: "إغلاق الصفقة وتسليم النسخة الأصلية (200 عملية)",
        timing: "عند اكتمال الـ 200 عملية وظهور شاشة القفل",
        text:
          `الأخوة الأكارم في *${clientName}* المحترمون،\n\n` +
          `شكراً جزيلاً لتجربتكم منظومة *MeDo ERP* واكتمال مرحلة التجربة (200 عملية بنجاح).\n\n` +
          `نحن جاهزون الآن لـ:\n` +
          `✅ تفعيل نسختكم الإنتاجية الأصلية غير المحدودة.\n` +
          `✅ ترحيل كافة بياناتكم الحقيقية بأمان وسرية تامة.\n` +
          `✅ تدريب فريقكم المحاسبي ومنحكم شهادة الترخيص المعتمدة.\n\n` +
          `يسعدنا تواصلكم فوراً لإتمام الاتفاق وتزويدكم برابط النسخة الدائمة.\n\n` +
          `أخوكم،\n` +
          `*${managerName}* | مجموعة بن زياد\n` +
          `هاتف: ${managerPhone}`,
        waUrl: "",
      },
    ];

    return templates.map((t) => ({
      ...t,
      waUrl: `https://wa.me/967773586047?text=${encodeURIComponent(t.text)}`,
    }));
  }

  /**
   * Generates a 5-Day Progress and Evaluation Report (Point 9)
   */
  public generateFiveDayEvaluationReport(): {
    generatedAt: string;
    clientsCount: number;
    clients: {
      id: string;
      name: string;
      link: string;
      operations: number;
      percentageUsed: number;
      status: "NEW" | "ACTIVE" | "HALFWAY" | "NEAR_LIMIT" | "LOCKED";
      durationFormatted: string;
      featuresCount: number;
      feedback: string;
      suggestedAction: string;
    }[];
    overallConversionProbability: string;
    executiveSummary: string;
  } {
    const clientsData = this.getAllClientsTracking();
    const mapped = clientsData.map((c) => {
      const ops = c.operationsCount;
      const pct = Math.min(100, Math.round((ops / TRIAL_OPERATION_LIMIT) * 100));
      let status: "NEW" | "ACTIVE" | "HALFWAY" | "NEAR_LIMIT" | "LOCKED" = "NEW";
      let suggestedAction = "إرسال الرسالة الترحيبية ورابط الدخول";

      if (ops >= 200) {
        status = "LOCKED";
        suggestedAction = "📞 اتصال مباشر لإغلاق الصفقة وتوقيع عقد الشراء";
      } else if (ops >= 180) {
        status = "NEAR_LIMIT";
        suggestedAction = "⚡ إرسال عرض الأسعار وحجز النسخة الدائمة قبل التوقف";
      } else if (ops >= 100) {
        status = "HALFWAY";
        suggestedAction = "📊 تقديم جلسة ديمو سريعة لاستعراض التقارير المتقدمة";
      } else if (ops > 0) {
        status = "ACTIVE";
        suggestedAction = "💬 رسالة متابعة للاطمئنان على سير الاستخدام وسماع الملاحظات";
      }

      const mins = Math.floor((c.totalSecondsSpent || 0) / 60);
      const secs = (c.totalSecondsSpent || 0) % 60;
      const durationFormatted = `${mins} دقيقة و ${secs} ثانية`;

      let feedback = "لم يقدم تقييماً بعد";
      if (c.feedbackSubmitted) {
        feedback = c.rating === "LIKE" ? "👍 راضٍ جداً عن النظام" : "👎 لديه ملاحظات ومقترحات";
      }

      return {
        id: c.clientId,
        name: c.clientName,
        link: this.getClientUniqueLink(c.clientId),
        operations: ops,
        percentageUsed: pct,
        status,
        durationFormatted,
        featuresCount: c.featuresUsed?.length || 0,
        feedback,
        suggestedAction,
      };
    });

    const activeClientsCount = mapped.filter((m) => m.operations > 0).length;
    const totalOps = mapped.reduce((acc, curr) => acc + curr.operations, 0);

    let conversion = "75% - مرتفعة جداً";
    if (activeClientsCount === 3 && totalOps >= 60) conversion = "90% - ممتازة (جاهزة للإغلاق)";
    else if (activeClientsCount === 0) conversion = "قيد الإطلاق الأولي";

    return {
      generatedAt: new Date().toISOString(),
      clientsCount: mapped.length,
      clients: mapped,
      overallConversionProbability: conversion,
      executiveSummary: `تم رصد نشاط العملاء التجريبيين الثلاثة بإجمالي ${totalOps} عملية منفذة عبر الروبط المنعزلة. أعلى عميل نشاطاً استنفد نسبة من الرصيد التجريبي، والمنظومة تعمل بكامل كفاءتها وتوافقها مع الجوال والكمبيوتر.`,
    };
  }
}

export const trialOperationsService = TrialOperationsService.getInstance();
