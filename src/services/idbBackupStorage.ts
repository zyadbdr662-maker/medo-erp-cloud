/**
 * IndexedDB Storage Engine for MeDo ERP Backup Snapshots
 * Completely bypasses localStorage 5MB quota limit with virtually unlimited client storage.
 */

const DB_NAME = "medo_erp_backup_vault_db";
const DB_VERSION = 1;
const STORE_NAME = "backup_packages";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface IDBBackupPayload {
  id: string;
  rawJson?: string;
  encryptedPackage?: any;
  fileName?: string;
  isEncrypted?: boolean;
  sha256Hash?: string;
  timestamp?: string;
  createdAt: number;
}

export async function saveBackupToIDB(
  id: string,
  payload: {
    rawJson?: string;
    encryptedPackage?: any;
    fileName?: string;
    isEncrypted?: boolean;
    sha256Hash?: string;
    timestamp?: string;
  }
): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const record: IDBBackupPayload = {
        id,
        ...payload,
        createdAt: Date.now(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IDB backup storage save warning:", err);
  }
}

export async function getBackupFromIDB(id: string): Promise<IDBBackupPayload | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IDB backup storage read warning:", err);
    return null;
  }
}

export async function deleteBackupFromIDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IDB backup storage delete warning:", err);
  }
}

export async function cleanupOldIDBBackups(keepCount: number = 20): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const records: IDBBackupPayload[] = req.result || [];
        if (records.length > keepCount) {
          records.sort((a, b) => b.createdAt - a.createdAt);
          const toDelete = records.slice(keepCount);
          toDelete.forEach((r) => store.delete(r.id));
        }
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IDB backup cleanup warning:", err);
  }
}
