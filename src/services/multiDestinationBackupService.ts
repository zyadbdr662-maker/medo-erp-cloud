/**
 * Multi-Destination Backup Service for MeDo ERP
 * Integrates direct cloud backups to:
 * 1. Google Drive (via Google Drive REST API v3)
 * 2. Yandex Disk (via Yandex Disk Cloud API)
 * 3. Telegram (via Telegram Bot API)
 * 4. Local Saving & Browser Vault Snapshots
 */

import { ERPFullState } from "./erpStorage";
import { saveBackupToIDB, deleteBackupFromIDB } from "./idbBackupStorage";

export interface LocalVaultSnapshot {
  id: string;
  timestamp: string;
  fileName: string;
  fileSizeBytes: number;
  isEncrypted: boolean;
  sha256Hash: string;
  rawJsonOrCipher: string;
  recordCountSummary: {
    accounts: number;
    journals: number;
    invoices: number;
    customers: number;
    vendors: number;
    inventory: number;
  };
}

export type LocalBackupSnapshot = LocalVaultSnapshot;

const LOCAL_VAULT_SNAPSHOTS_KEY = "medo_erp_local_vault_snapshots_v1";

export class MultiDestinationBackupService {
  private static instance: MultiDestinationBackupService;

  public static getInstance(): MultiDestinationBackupService {
    if (!MultiDestinationBackupService.instance) {
      MultiDestinationBackupService.instance = new MultiDestinationBackupService();
    }
    return MultiDestinationBackupService.instance;
  }

  // ==========================================
  // 1. Google Drive API Integration
  // ==========================================

  /**
   * Test Google Drive OAuth Access Token
   */
  public async testGoogleDriveConnection(accessToken: string): Promise<{
    success: boolean;
    userEmail?: string;
    userName?: string;
    totalSpaceGB?: number;
    usedSpaceGB?: number;
    error?: string;
  }> {
    if (!accessToken || !accessToken.trim()) {
      return { success: false, error: "رمز الوصول (Access Token) الخاص بـ Google Drive غير محدد." };
    }

    try {
      const response = await fetch("https://www.googleapis.com/drive/v3/about?fields=user,storageQuota", {
        headers: {
          Authorization: `Bearer ${accessToken.trim()}`,
        },
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const msg = errJson?.error?.message || `خطأ Google Drive (${response.status}): ${response.statusText}`;
        return { success: false, error: msg };
      }

      const data = await response.json();
      const quota = data.storageQuota || {};
      const totalGB = quota.limit ? Math.round((Number(quota.limit) / (1024 * 1024 * 1024)) * 10) / 10 : 15;
      const usedGB = quota.usage ? Math.round((Number(quota.usage) / (1024 * 1024 * 1024)) * 10) / 10 : 0;

      return {
        success: true,
        userEmail: data.user?.emailAddress || "حساب Google متصل",
        userName: data.user?.displayName || "مستخدم Google",
        totalSpaceGB: totalGB,
        usedSpaceGB: usedGB,
      };
    } catch (err: any) {
      return { success: false, error: err.message || "تعذر الاتصال بخوادم Google Drive" };
    }
  }

  /**
   * Upload Backup file to Google Drive
   */
  public async uploadToGoogleDrive(
    content: string,
    fileName: string,
    accessToken: string,
    folderId?: string
  ): Promise<{ success: boolean; fileId?: string; fileName: string; error?: string }> {
    if (!accessToken || !accessToken.trim()) {
      throw new Error("رمز الوصول (Access Token) الخاص بـ Google Drive مفقود.");
    }

    const mimeType = fileName.endsWith(".enc") ? "application/octet-stream" : "application/json";

    const metadata: any = {
      name: fileName,
      mimeType: mimeType,
      description: `MeDo ERP Automated Cloud Backup - Generated at ${new Date().toISOString()}`,
    };

    if (folderId && folderId.trim() && folderId.trim().toLowerCase() !== "root") {
      metadata.parents = [folderId.trim()];
    }

    const boundary = "-------MeDoErpGoogleDriveBackupBoundary" + Math.random().toString(36).substring(2);
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelim = "\r\n--" + boundary + "--";

    const multipartRequestBody =
      delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      content +
      closeDelim;

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.trim()}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson?.error?.message || `فشل الرفع لـ Google Drive (${response.status}): ${response.statusText}`;
      throw new Error(msg);
    }

    const resData = await response.json();
    return {
      success: true,
      fileId: resData.id,
      fileName: fileName,
    };
  }

  // ==========================================
  // 2. Yandex Disk Cloud API Integration
  // ==========================================

  /**
   * Test Yandex Disk OAuth Token
   */
  public async testYandexDiskConnection(oauthToken: string): Promise<{
    success: boolean;
    userLogin?: string;
    totalSpaceGB?: number;
    usedSpaceGB?: number;
    error?: string;
  }> {
    if (!oauthToken || !oauthToken.trim()) {
      return { success: false, error: "رمز OAuth الخاص بـ Yandex Disk غير محدد." };
    }

    try {
      const response = await fetch("https://cloud-api.yandex.net/v1/disk", {
        headers: {
          Authorization: `OAuth ${oauthToken.trim()}`,
        },
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const msg = errJson?.message || `خطأ Yandex Disk (${response.status}): ${response.statusText}`;
        return { success: false, error: msg };
      }

      const data = await response.json();
      const totalGB = data.total_space ? Math.round((data.total_space / (1024 * 1024 * 1024)) * 10) / 10 : 10;
      const usedGB = data.used_space ? Math.round((data.used_space / (1024 * 1024 * 1024)) * 10) / 10 : 0;
      const user = data.user?.login || "حساب Yandex نشط";

      return {
        success: true,
        userLogin: user,
        totalSpaceGB: totalGB,
        usedSpaceGB: usedGB,
      };
    } catch (err: any) {
      return { success: false, error: err.message || "تعذر الاتصال بخوادم Yandex Disk" };
    }
  }

  /**
   * Upload Backup file to Yandex Disk
   */
  public async uploadToYandexDisk(
    content: string,
    fileName: string,
    oauthToken: string,
    targetFolder: string = "app:/MeDo_ERP_Backups/"
  ): Promise<{ success: boolean; filePath: string; error?: string }> {
    if (!oauthToken || !oauthToken.trim()) {
      throw new Error("رمز OAuth الخاص بـ Yandex Disk مفقود.");
    }

    let folderPath = targetFolder.trim();
    if (!folderPath) folderPath = "app:/MeDo_ERP_Backups/";
    if (!folderPath.endsWith("/")) folderPath += "/";

    // 1. Attempt to create the folder if it doesn't exist
    try {
      const cleanFolder = folderPath.replace(/\/$/, "");
      await fetch(`https://cloud-api.yandex.net/v1/disk/resources?path=${encodeURIComponent(cleanFolder)}`, {
        method: "PUT",
        headers: {
          Authorization: `OAuth ${oauthToken.trim()}`,
        },
      });
    } catch {
      // Ignore conflict error if folder exists
    }

    const fullPath = `${folderPath}${fileName}`;

    // 2. Request Upload URL from Yandex
    const getUploadUrlRes = await fetch(
      `https://cloud-api.yandex.net/v1/disk/resources/upload?path=${encodeURIComponent(fullPath)}&overwrite=true`,
      {
        headers: {
          Authorization: `OAuth ${oauthToken.trim()}`,
        },
      }
    );

    if (!getUploadUrlRes.ok) {
      const errJson = await getUploadUrlRes.json().catch(() => ({}));
      const msg = errJson?.message || `فشل طلب رابط الرفع من Yandex (${getUploadUrlRes.status}): ${getUploadUrlRes.statusText}`;
      throw new Error(msg);
    }

    const { href: uploadUrl } = await getUploadUrlRes.json();
    if (!uploadUrl) {
      throw new Error("لم يتم الحصول على رابط الرفع من Yandex Disk.");
    }

    // 3. Put File directly to Yandex storage server
    const mimeType = fileName.endsWith(".enc") ? "application/octet-stream" : "application/json";
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": mimeType,
      },
      body: content,
    });

    if (!putRes.ok && putRes.status !== 201 && putRes.status !== 200) {
      throw new Error(`فشل رفع المحتوى إلى Yandex (${putRes.status}): ${putRes.statusText}`);
    }

    return {
      success: true,
      filePath: fullPath,
    };
  }

  // ==========================================
  // 3. Telegram Bot API Integration
  // ==========================================

  /**
   * Test Telegram Bot Token and Chat ID
   */
  public async testTelegramConnection(
    botToken: string,
    chatId?: string
  ): Promise<{
    success: boolean;
    botName?: string;
    botUsername?: string;
    messageSent?: boolean;
    error?: string;
  }> {
    if (!botToken || !botToken.trim()) {
      return { success: false, error: "رمز توكن بوت تليجرام (Bot Token) غير محدد." };
    }

    try {
      const meRes = await fetch(`https://api.telegram.org/bot${botToken.trim()}/getMe`);
      if (!meRes.ok) {
        const errJson = await meRes.json().catch(() => ({}));
        return { success: false, error: errJson?.description || "رمز البوت غير صالح أو منتهي." };
      }

      const meData = await meRes.json();
      const bot = meData.result || {};

      let messageSent = false;
      if (chatId && chatId.trim()) {
        const testText = `🔔 <b>اختبار ربط النسخ الاحتياطي لنظام MeDo ERP</b>\n\n✅ تم الاتصال بنجاح مع بوت تليجرام <b>@${bot.username}</b>!\n⏰ التاريخ والوقت: <code>${new Date().toLocaleString("ar-YE")}</code>\n🔒 النظام جاهز لاستقبال النسخ الاحتياطية المشفرة والتقارير الدورية.`;
        const sendRes = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId.trim(),
            text: testText,
            parse_mode: "HTML",
          }),
        });
        messageSent = sendRes.ok;
      }

      return {
        success: true,
        botName: bot.first_name || "MeDo Backup Bot",
        botUsername: bot.username || "bot",
        messageSent,
      };
    } catch (err: any) {
      return { success: false, error: err.message || "تعذر الاتصال بخوادم تليجرام" };
    }
  }

  /**
   * Send Backup File and Rich Summary Message to Telegram Channel/Chat
   */
  public async sendBackupToTelegram(
    content: string,
    fileName: string,
    botToken: string,
    chatId: string,
    summaryText: string,
    sendAsDocument: boolean = true,
    sendSummaryText: boolean = true
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!botToken || !botToken.trim() || !chatId || !chatId.trim()) {
      throw new Error("رمز البوت (Bot Token) أو معرف الدردشة (Chat ID) مفقود لتليجرام.");
    }

    const cleanToken = botToken.trim();
    const cleanChatId = chatId.trim();
    let mainMessageId: string | undefined;

    // 1. Send Rich Summary Message
    if (sendSummaryText) {
      try {
        const msgRes = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: cleanChatId,
            text: summaryText,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        });

        if (msgRes.ok) {
          const resData = await msgRes.json();
          mainMessageId = String(resData.result?.message_id || "");
        }
      } catch (err) {
        console.warn("Telegram summary text warning:", err);
      }
    }

    // 2. Send File Document Attachment
    if (sendAsDocument) {
      const mimeType = fileName.endsWith(".enc") ? "application/octet-stream" : "application/json";
      const blob = new Blob([content], { type: mimeType });
      const formData = new FormData();
      formData.append("chat_id", cleanChatId);
      formData.append("document", blob, fileName);
      formData.append(
        "caption",
        `📦 <b>ملف النسخة الاحتياطية للنظام (${fileName})</b>\n🔒 التشفير: ${fileName.endsWith(".enc") ? "AES-256-GCM" : "JSON عادي"}\n⏰ التوقيت: ${new Date().toLocaleString("ar-YE")}`
      );
      formData.append("parse_mode", "HTML");

      const docRes = await fetch(`https://api.telegram.org/bot${cleanToken}/sendDocument`, {
        method: "POST",
        body: formData,
      });

      if (!docRes.ok) {
        const errJson = await docRes.json().catch(() => ({}));
        const msg = errJson?.description || `فشل إرسال ملف النسخة لتليجرام (${docRes.status}): ${docRes.statusText}`;
        throw new Error(msg);
      }

      const docData = await docRes.json();
      mainMessageId = String(docData.result?.message_id || mainMessageId || "");
    }

    return {
      success: true,
      messageId: mainMessageId,
    };
  }

  // ==========================================
  // 4. Local Saving & Browser Vault Snapshots
  // ==========================================

  /**
   * Trigger automatic file download in the browser
   */
  public triggerBrowserDownload(content: string, fileName: string, mimeType: string = "application/json") {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Local file download error:", err);
    }
  }

  /**
   * Save an encrypted/plain snapshot to browser Local Vault storage
   */
  public saveLocalVaultSnapshot(
    snapshot: Omit<LocalVaultSnapshot, "id">,
    maxKeep: number = 5
  ): LocalVaultSnapshot {
    const snapshots = this.getLocalVaultSnapshots();
    const newEntry: LocalVaultSnapshot = {
      ...snapshot,
      id: `lvs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    // 1. Always persist payload safely in IndexedDB (bypasses 5MB limit)
    saveBackupToIDB(newEntry.id, {
      rawJson: snapshot.isEncrypted ? undefined : snapshot.rawJsonOrCipher,
      encryptedPackage: snapshot.isEncrypted ? (() => {
        try { return JSON.parse(snapshot.rawJsonOrCipher); } catch { return undefined; }
      })() : undefined,
      fileName: snapshot.fileName,
      isEncrypted: snapshot.isEncrypted,
      sha256Hash: snapshot.sha256Hash,
      timestamp: snapshot.timestamp,
    }).catch((err) => console.warn("Could not save snapshot to IndexedDB:", err));

    // 2. In localStorage, keep at most 2 snapshots with payload, and metadata for the rest
    const limitedSnapshots = [newEntry, ...snapshots].slice(0, Math.min(maxKeep, 5)).map((s, idx) => {
      if (idx === 0) return s;
      // Strip heavy raw payload from older snapshots to conserve quota
      return { ...s, rawJsonOrCipher: "" };
    });

    try {
      localStorage.setItem(LOCAL_VAULT_SNAPSHOTS_KEY, JSON.stringify(limitedSnapshots));
    } catch (storageErr) {
      console.warn("Storage quota limit reached when saving local snapshot, pruning older:", storageErr);
      try {
        // Prune to only 1 newest snapshot without payload in localStorage
        const metaOnly = [{ ...newEntry, rawJsonOrCipher: "" }];
        localStorage.setItem(LOCAL_VAULT_SNAPSHOTS_KEY, JSON.stringify(metaOnly));
      } catch (innerErr) {
        console.warn("Could not save local vault snapshot in localStorage:", innerErr);
      }
    }

    return newEntry;
  }

  /**
   * Retrieve all Local Vault snapshots
   */
  public getLocalVaultSnapshots(): LocalVaultSnapshot[] {
    try {
      const raw = localStorage.getItem(LOCAL_VAULT_SNAPSHOTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Delete a Local Vault snapshot by ID
   */
  public deleteLocalVaultSnapshot(id: string) {
    const list = this.getLocalVaultSnapshots().filter((s) => s.id !== id);
    try {
      localStorage.setItem(LOCAL_VAULT_SNAPSHOTS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn("Could not update local vault snapshots after deletion:", e);
    }
    deleteBackupFromIDB(id).catch(() => {});
  }

  /**
   * Clear all Local Vault snapshots
   */
  public clearLocalVaultSnapshots() {
    localStorage.removeItem(LOCAL_VAULT_SNAPSHOTS_KEY);
  }

  // ==========================================
  // Helper: Build Rich Financial Summary for Alerts
  // ==========================================
  public generateBackupSummaryHTML(
    fullState: ERPFullState,
    fileName: string,
    isEncrypted: boolean,
    sha256Hash: string,
    fileSizeBytes: number
  ): string {
    const company = fullState.systemSettings?.companyNameAr || "شركة MeDo للحلول المالية";
    const now = new Date().toLocaleString("ar-YE");
    const accountsCount = fullState.accounts?.length || 0;
    const journalsCount = fullState.journalEntries?.length || 0;
    const invoicesCount = fullState.invoices?.length || 0;
    const customersCount = fullState.customers?.length || 0;
    const inventoryCount = fullState.inventoryItems?.length || 0;

    const sizeKB = Math.round(fileSizeBytes / 1024 * 10) / 10;

    return `🛡️ <b>تقرير النسخ الاحتياطي لنظام MeDo ERP</b>\n\n🏢 <b>المنشأة:</b> ${company}\n⏰ <b>التاريخ والوقت:</b> <code>${now}</code>\n📦 <b>الملف:</b> <code>${fileName}</code> (${sizeKB} KB)\n🔒 <b>الأمان:</b> ${isEncrypted ? "مشفر بـ AES-256-GCM 🔐" : "JSON عادي 📄"}\n\n📊 <b>إحصائيات قاعدة البيانات:</b>\n• شجرة الحسابات: <b>${accountsCount}</b> حساب\n• قيود اليومية: <b>${journalsCount}</b> قيد محاسبي\n• الفواتير والسندات: <b>${invoicesCount}</b> مستند\n• دليل العملاء والموردين: <b>${customersCount}</b> طرف\n• الأصناف المخزنية: <b>${inventoryCount}</b> صنف\n\n🔍 <b>بصمة التحقق (SHA-256):</b>\n<code>${sha256Hash.substring(0, 16)}...${sha256Hash.substring(sha256Hash.length - 8)}</code>\n\n✅ <i>تم إنشاء وحفظ النسخة الاحتياطية بنجاح عبر مدير النظام.</i>`;
  }
}
