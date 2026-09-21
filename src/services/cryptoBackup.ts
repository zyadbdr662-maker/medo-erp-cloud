/**
 * Utility for AES-256-GCM Client-Side Encryption & SHA-256 Data Integrity Checks
 * Uses standard Web Crypto API (crypto.subtle)
 */

export interface EncryptedPackage {
  ciphertextBase64: string;
  ivBase64: string;
  saltBase64: string;
  sha256: string;
  fileSizeBytes: number;
}

// Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Calculate SHA-256 Hash
export async function calculateSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Derive AES-GCM 256 Key using PBKDF2
async function deriveEncryptionKey(secretKey: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt JSON object or string with AES-256-GCM
 */
export async function encryptBackupData(
  data: any,
  secretKey: string
): Promise<EncryptedPackage> {
  const jsonString = typeof data === "string" ? data : JSON.stringify(data);
  const encoder = new TextEncoder();
  const encodedText = encoder.encode(jsonString);

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Derive key & encrypt
  const cryptoKey = await deriveEncryptionKey(secretKey, salt);
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    cryptoKey,
    encodedText
  );

  // Compute SHA-256 hash of unencrypted original JSON for data verification
  const sha256 = await calculateSHA256(jsonString);

  return {
    ciphertextBase64: arrayBufferToBase64(ciphertextBuffer),
    ivBase64: arrayBufferToBase64(iv.buffer),
    saltBase64: arrayBufferToBase64(salt.buffer),
    sha256,
    fileSizeBytes: ciphertextBuffer.byteLength,
  };
}

/**
 * Decrypt AES-256-GCM package back to parsed JSON object
 */
export async function decryptBackupData<T = any>(
  pkg: {
    ciphertextBase64: string;
    ivBase64: string;
    saltBase64: string;
    sha256?: string;
  },
  secretKey: string
): Promise<T> {
  try {
    const ciphertext = base64ToArrayBuffer(pkg.ciphertextBase64);
    const iv = new Uint8Array(base64ToArrayBuffer(pkg.ivBase64));
    const salt = new Uint8Array(base64ToArrayBuffer(pkg.saltBase64));

    const cryptoKey = await deriveEncryptionKey(secretKey, salt);
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      cryptoKey,
      ciphertext
    );

    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedBuffer);

    // Verify SHA-256 checksum if present
    if (pkg.sha256) {
      const computedHash = await calculateSHA256(jsonString);
      if (computedHash !== pkg.sha256) {
        throw new Error("فشل التحقق من بصمة البيانات (SHA-256 Checksum mismatch). الملف قد يكون معدلاً أو تالفاً.");
      }
    }

    return JSON.parse(jsonString) as T;
  } catch (err: any) {
    if (err.message && err.message.includes("Checksum")) {
      throw err;
    }
    throw new Error("فشل فك التشفير. مفتاح التشفير غير صحيح أو بيانات النسخة الاحتياطية تالفة.");
  }
}

/**
 * Generate a high-entropy random encryption key string
 */
export function generateSecureRandomKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  let result = "MeDo-SAP-Key-";
  for (let i = 0; i < 16; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}
