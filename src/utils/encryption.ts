import CryptoJS from 'crypto-js';

// Central fallback keys if env vars are not set in the browser client
const DEFAULT_ADMIN_KEY = 'medo_sovereign_master_aes256_key_2026_badr';
const DEFAULT_TENANT_KEY = 'medo_tenant_shared_aes256_encryption_key_2026';
const DEFAULT_SESSION_KEY = 'medo_enterprise_session_aes256_secure_key';
const DEFAULT_JWT_SECRET = 'medo_cloud_erp_jwt_signing_token_secret_2026';

// Encryption keys resolution
export const getAdminEncryptionKey = (): string => {
  if (typeof process !== 'undefined' && process.env?.ADMIN_ENCRYPTION_KEY) {
    return process.env.ADMIN_ENCRYPTION_KEY;
  }
  return (import.meta as any).env?.VITE_ADMIN_ENCRYPTION_KEY || DEFAULT_ADMIN_KEY;
};

export const getTenantEncryptionKey = (tenantSlug?: string): string => {
  const baseKey =
    (typeof process !== 'undefined' && process.env?.TENANT_ENCRYPTION_KEY) ||
    (import.meta as any).env?.VITE_TENANT_ENCRYPTION_KEY ||
    DEFAULT_TENANT_KEY;

  if (tenantSlug && tenantSlug !== 'default') {
    // Generate isolated key for specific tenant using SHA-256 HMAC
    return CryptoJS.HmacSHA256(tenantSlug, baseKey).toString();
  }
  return baseKey;
};

export const getSessionEncryptionKey = (): string => {
  if (typeof process !== 'undefined' && process.env?.SESSION_ENCRYPTION_KEY) {
    return process.env.SESSION_ENCRYPTION_KEY;
  }
  return (import.meta as any).env?.VITE_SESSION_ENCRYPTION_KEY || DEFAULT_SESSION_KEY;
};

/**
 * Encrypt arbitrary data using AES-256
 */
export const encryptData = (data: string, key?: string): string => {
  try {
    const activeKey = key || getTenantEncryptionKey();
    return CryptoJS.AES.encrypt(data, activeKey).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return data;
  }
};

/**
 * Decrypt arbitrary data using AES-256
 */
export const decryptData = (encrypted: string, key?: string): string => {
  try {
    const activeKey = key || getTenantEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encrypted, activeKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || '';
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

/**
 * Hash password with PBKDF2 + Cryptographic Random Salt (AES-256 standard)
 */
export const hashPassword = (password: string): string => {
  try {
    const salt = CryptoJS.lib.WordArray.random(128 / 8);
    const hash = CryptoJS.PBKDF2(password, salt, {
      keySize: 512 / 32,
      iterations: 10000,
    });
    return `${salt.toString()}:${hash.toString()}`;
  } catch (error) {
    console.error('Password hashing error:', error);
    return password;
  }
};

/**
 * Verify password against stored PBKDF2 hash & salt
 */
export const verifyPassword = (password: string, stored: string): boolean => {
  try {
    if (!stored) return false;
    
    // Check if plain text legacy or simple match (for backward compatibility)
    if (!stored.includes(':')) {
      return password === stored;
    }

    const [saltHex, expectedHash] = stored.split(':');
    if (!saltHex || !expectedHash) return false;

    const salt = CryptoJS.enc.Hex.parse(saltHex);
    const testHash = CryptoJS.PBKDF2(password, salt, {
      keySize: 512 / 32,
      iterations: 10000,
    });

    return expectedHash === testHash.toString();
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
};

/**
 * Generate a secure time-limited encrypted token for tenant portal links
 */
export const generateSecureToken = (
  payload: Record<string, any>,
  expiresInMinutes: number = 60,
  tenantSlug?: string
): string => {
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  const data = JSON.stringify({
    ...payload,
    exp: expiresAt,
    iat: Date.now(),
    nonce: CryptoJS.lib.WordArray.random(16).toString(),
  });

  const key = getTenantEncryptionKey(tenantSlug);
  return CryptoJS.AES.encrypt(data, key).toString();
};

/**
 * Verify and decode an encrypted token
 */
export const verifySecureToken = (
  token: string,
  tenantSlug?: string
): { valid: boolean; payload?: any; reason?: string } => {
  try {
    const key = getTenantEncryptionKey(tenantSlug);
    const bytes = CryptoJS.AES.decrypt(token, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return { valid: false, reason: 'Invalid or corrupt token' };

    const parsed = JSON.parse(decrypted);
    if (parsed.exp && Date.now() > parsed.exp) {
      return { valid: false, reason: 'Token has expired' };
    }

    return { valid: true, payload: parsed };
  } catch (error: any) {
    return { valid: false, reason: error?.message || 'Token verification failed' };
  }
};

/**
 * Encrypted Session Storage Wrapper
 */
export const EncryptedSessionStorage = {
  setItem: (key: string, value: any, tenantSlug?: string) => {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      const encrypted = encryptData(serialized, getTenantEncryptionKey(tenantSlug));
      sessionStorage.setItem(`medo_sec_${key}`, encrypted);
    } catch (e) {
      console.error('EncryptedSessionStorage set error', e);
    }
  },

  getItem: <T = any>(key: string, tenantSlug?: string): T | null => {
    try {
      const encrypted = sessionStorage.getItem(`medo_sec_${key}`);
      if (!encrypted) return null;
      const decrypted = decryptData(encrypted, getTenantEncryptionKey(tenantSlug));
      if (!decrypted) return null;
      try {
        return JSON.parse(decrypted) as T;
      } catch {
        return decrypted as unknown as T;
      }
    } catch (e) {
      console.error('EncryptedSessionStorage get error', e);
      return null;
    }
  },

  removeItem: (key: string) => {
    sessionStorage.removeItem(`medo_sec_${key}`);
  },
};
