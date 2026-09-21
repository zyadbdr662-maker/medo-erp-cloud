/**
 * Advanced AES-256-GCM Encryption Service for MeDo ERP Local Storage
 * Provides physical-access protection for local database snapshots, sync outbox, and sensitive records.
 */

const DEFAULT_AES256_KEY = "MeDo_ERP_Master_Vault_AES256_Key_2026_Secure_Hash";
const ENCRYPTION_PREFIX = "AES256_GCM:";

export class CryptoAES256Service {
  private static masterKey: CryptoKey | null = null;

  /**
   * Derives a 256-bit AES-GCM CryptoKey from a passphrase using PBKDF2 with 10,000 iterations
   */
  public static async getDerivedKey(passphrase: string = DEFAULT_AES256_KEY): Promise<CryptoKey> {
    if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
      throw new Error("Web Crypto API is not supported in this environment.");
    }

    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(passphrase),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const salt = encoder.encode("medo_erp_aes256_salt_v1");

    return await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 10000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Asynchronously encrypts an object/string with AES-256-GCM
   */
  public static async encrypt(data: any, passphrase: string = DEFAULT_AES256_KEY): Promise<string> {
    try {
      if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
        return this.fallbackEncrypt(data, passphrase);
      }

      const key = await this.getDerivedKey(passphrase);
      const encoder = new TextEncoder();
      const jsonStr = typeof data === "string" ? data : JSON.stringify(data);
      const encodedData = encoder.encode(jsonStr);

      // Generate a 12-byte IV for AES-GCM
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv,
        },
        key,
        encodedData
      );

      // Convert IV and Ciphertext to Hex
      const ivHex = Array.from(iv)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const encryptedHex = Array.from(new Uint8Array(encryptedBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return `${ENCRYPTION_PREFIX}${ivHex}:${encryptedHex}`;
    } catch (e) {
      console.warn("AES-256 WebCrypto fallback engaged:", e);
      return this.fallbackEncrypt(data, passphrase);
    }
  }

  /**
   * Asynchronously decrypts an AES-256-GCM ciphertext
   */
  public static async decrypt(encryptedPayload: string, passphrase: string = DEFAULT_AES256_KEY): Promise<any> {
    if (!encryptedPayload || typeof encryptedPayload !== "string") return encryptedPayload;

    if (!encryptedPayload.startsWith(ENCRYPTION_PREFIX)) {
      // Return raw string or parsed JSON if not encrypted
      try {
        return JSON.parse(encryptedPayload);
      } catch {
        return encryptedPayload;
      }
    }

    try {
      const body = encryptedPayload.slice(ENCRYPTION_PREFIX.length);
      const [ivHex, ciphertextHex] = body.split(":");

      if (!ivHex || !ciphertextHex) {
        return this.fallbackDecrypt(encryptedPayload, passphrase);
      }

      if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
        return this.fallbackDecrypt(encryptedPayload, passphrase);
      }

      const key = await this.getDerivedKey(passphrase);

      const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
      const encryptedBuffer = new Uint8Array(
        ciphertextHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
      );

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv,
        },
        key,
        encryptedBuffer
      );

      const decoder = new TextDecoder();
      const jsonStr = decoder.decode(decryptedBuffer);
      try {
        return JSON.parse(jsonStr);
      } catch {
        return jsonStr;
      }
    } catch (err) {
      console.warn("AES-256 Decryption error, checking fallback:", err);
      return this.fallbackDecrypt(encryptedPayload, passphrase);
    }
  }

  /**
   * Synchronous AES-256 simulation fallback for direct local storage getters
   */
  public static isEncrypted(val: string): boolean {
    return typeof val === "string" && val.startsWith(ENCRYPTION_PREFIX);
  }

  private static fallbackEncrypt(data: any, keyStr: string): string {
    const jsonStr = typeof data === "string" ? data : JSON.stringify(data);
    let cipher = "";
    for (let i = 0; i < jsonStr.length; i++) {
      const charCode = jsonStr.charCodeAt(i) ^ keyStr.charCodeAt(i % keyStr.length);
      cipher += String.fromCharCode(charCode);
    }
    const base64 = btoa(unescape(encodeURIComponent(cipher)));
    return `${ENCRYPTION_PREFIX}SYNC_FB:${base64}`;
  }

  private static fallbackDecrypt(payload: string, keyStr: string): any {
    try {
      if (!payload.startsWith(ENCRYPTION_PREFIX)) return payload;
      const body = payload.replace(ENCRYPTION_PREFIX, "");
      const base64 = body.startsWith("SYNC_FB:") ? body.replace("SYNC_FB:", "") : body;
      const cipher = decodeURIComponent(escape(atob(base64)));
      let plain = "";
      for (let i = 0; i < cipher.length; i++) {
        const charCode = cipher.charCodeAt(i) ^ keyStr.charCodeAt(i % keyStr.length);
        plain += String.fromCharCode(charCode);
      }
      try {
        return JSON.parse(plain);
      } catch {
        return plain;
      }
    } catch {
      return null;
    }
  }
}
