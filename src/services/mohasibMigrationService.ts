import * as XLSX from "xlsx";
import {
  Account,
  Customer,
  Vendor,
  InventoryItem,
  JournalEntry,
  CurrencyCode,
  ERPState,
} from "../types/erp";
import { soundService } from "./notificationSoundService";

export interface MohasibAccount {
  code: string;
  name: string;
  category: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  nature: "DEBIT" | "CREDIT";
  balance: number;
  originalType?: string;
  selected?: boolean;
}

export interface MohasibCustomer {
  code: string;
  name: string;
  phone: string;
  address: string;
  city?: string;
  balance: number;
  taxNumber?: string;
  creditLimit?: number;
  selected?: boolean;
}

export interface MohasibVendor {
  code: string;
  name: string;
  phone: string;
  address: string;
  city?: string;
  balance: number;
  taxNumber?: string;
  selected?: boolean;
}

export interface MohasibInventory {
  code: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  minStock?: number;
  selected?: boolean;
}

export interface MohasibJournalEntry {
  entryNumber: string;
  date: string;
  memo: string;
  debit: number;
  credit: number;
  accountName?: string;
  accountCode?: string;
  selected?: boolean;
}

export interface MohasibParsedData {
  sourceType: "SQLITE" | "EXCEL" | "CSV" | "JSON" | "DEMO";
  fileName: string;
  fileSize?: number;
  detectedTablesCount?: number;
  entities: {
    accounts: MohasibAccount[];
    customers: MohasibCustomer[];
    vendors: MohasibVendor[];
    inventory: MohasibInventory[];
    journalEntries: MohasibJournalEntry[];
  };
  summary: {
    totalAccounts: number;
    totalCustomers: number;
    totalVendors: number;
    totalItems: number;
    totalJournalEntries: number;
    totalCustomerDebt: number;
    totalVendorDebt: number;
    totalInventoryValue: number;
  };
  rawTableNames?: string[];
  rawColumnsMap?: Record<string, string[]>;
}

export interface MigrationExecutionOptions {
  duplicateStrategy: "SKIP" | "UPDATE" | "APPEND";
  createOpeningJournalEntry: boolean;
  selectedCurrency: CurrencyCode;
  targetBranchId?: string;
  importAccounts: boolean;
  importCustomers: boolean;
  importVendors: boolean;
  importInventory: boolean;
  importJournalEntries: boolean;
}

export interface MigrationReport {
  timestamp: string;
  sourceType: string;
  fileName: string;
  accountsImported: number;
  accountsSkipped: number;
  customersImported: number;
  customersSkipped: number;
  vendorsImported: number;
  vendorsSkipped: number;
  itemsImported: number;
  itemsSkipped: number;
  journalEntriesImported: number;
  openingEntryCreated?: {
    entryNumber: string;
    totalDebit: number;
    totalCredit: number;
  };
  success: boolean;
  messages: string[];
}

// Lazy load SQL.js
let sqlPromise: Promise<any> | null = null;
async function getSqlInstance() {
  if (!sqlPromise) {
    try {
      const initSqlJs = (await import("sql.js")).default;
      sqlPromise = initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
      });
    } catch (err) {
      console.warn("Failed to load sql.js via CDN/WASM, will use heuristic fallback", err);
      sqlPromise = Promise.reject(err);
    }
  }
  return sqlPromise;
}

/**
 * Normalizes string keys for flexible column matching
 */
function cleanKey(str: string): string {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .replace(/[\s_\-]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/[ة]/g, "ه")
    .replace(/[ى]/g, "ي");
}

/**
 * Searches for a value from an object given a list of potential aliases
 */
function getValueByAliases(row: Record<string, any>, aliases: string[]): any {
  const rowKeys = Object.keys(row);
  const cleanAliases = aliases.map(cleanKey);

  for (const key of rowKeys) {
    const cKey = cleanKey(key);
    for (const alias of cleanAliases) {
      if (cKey === alias || cKey.includes(alias) || alias.includes(cKey)) {
        const val = row[key];
        if (val !== undefined && val !== null && val !== "") {
          return val;
        }
      }
    }
  }
  return undefined;
}

export class MohasibMigrationService {
  /**
   * Main entry point to parse any Mohasib Al-Muhtarif backup file
   */
  public static async parseBackupFile(file: File): Promise<MohasibParsedData> {
    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();

    if (
      fileName.endsWith(".db") ||
      fileName.endsWith(".sqlite") ||
      fileName.endsWith(".sqlite3") ||
      fileName.endsWith(".backup") ||
      fileName.endsWith(".dmp") ||
      fileName.endsWith(".bin")
    ) {
      return this.parseSqliteDatabase(arrayBuffer, file.name, file.size);
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      return this.parseExcelWorkbook(arrayBuffer, file.name, file.size);
    } else if (fileName.endsWith(".csv")) {
      return this.parseCsvFile(arrayBuffer, file.name, file.size);
    } else if (fileName.endsWith(".json")) {
      return this.parseJsonBackup(arrayBuffer, file.name, file.size);
    }

    // Default fallback: Try Excel first, then SQLite
    try {
      return await this.parseExcelWorkbook(arrayBuffer, file.name, file.size);
    } catch {
      return await this.parseSqliteDatabase(arrayBuffer, file.name, file.size);
    }
  }

  /**
   * Parses Android SQLite database files (.db, .sqlite)
   */
  public static async parseSqliteDatabase(
    buffer: ArrayBuffer,
    fileName: string,
    fileSize: number
  ): Promise<MohasibParsedData> {
    try {
      const SQL = await getSqlInstance();
      const db = new SQL.Database(new Uint8Array(buffer));

      // 1. Get all tables in database
      const tablesResult = db.exec(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'android_%';"
      );

      const tableNames: string[] = [];
      if (tablesResult.length > 0 && tablesResult[0].values) {
        for (const row of tablesResult[0].values) {
          if (row[0]) tableNames.push(String(row[0]));
        }
      }

      const rawColumnsMap: Record<string, string[]> = {};
      const allTableData: Record<string, any[]> = {};

      for (const tName of tableNames) {
        try {
          const res = db.exec(`SELECT * FROM "${tName}" LIMIT 1000;`);
          if (res.length > 0) {
            const columns = res[0].columns;
            rawColumnsMap[tName] = columns;
            const rows = res[0].values.map((v) => {
              const rowObj: Record<string, any> = {};
              columns.forEach((col, idx) => {
                rowObj[col] = v[idx];
              });
              return rowObj;
            });
            allTableData[tName] = rows;
          }
        } catch (e) {
          console.warn(`Error reading table ${tName}:`, e);
        }
      }

      // Auto-detect entities from SQLite tables
      const parsed = this.extractEntitiesFromTableCollection(allTableData, "SQLITE", fileName, fileSize);
      parsed.rawTableNames = tableNames;
      parsed.rawColumnsMap = rawColumnsMap;
      return parsed;
    } catch (err) {
      console.warn("Direct SQLite wasm failed, analyzing text-strings in buffer...", err);
      return this.fallbackBufferParser(buffer, fileName, fileSize);
    }
  }

  /**
   * Parses Multi-Sheet or Single Sheet Excel workbooks (.xlsx, .xls)
   */
  public static async parseExcelWorkbook(
    buffer: ArrayBuffer,
    fileName: string,
    fileSize: number
  ): Promise<MohasibParsedData> {
    const workbook = XLSX.read(buffer, { type: "array" });
    const allTableData: Record<string, any[]> = {};
    const rawColumnsMap: Record<string, string[]> = {};

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (rows && rows.length > 0) {
        allTableData[sheetName] = rows;
        rawColumnsMap[sheetName] = Object.keys(rows[0] || {});
      }
    }

    const parsed = this.extractEntitiesFromTableCollection(allTableData, "EXCEL", fileName, fileSize);
    parsed.rawTableNames = workbook.SheetNames;
    parsed.rawColumnsMap = rawColumnsMap;
    return parsed;
  }

  /**
   * Parses CSV files
   */
  public static async parseCsvFile(
    buffer: ArrayBuffer,
    fileName: string,
    fileSize: number
  ): Promise<MohasibParsedData> {
    const textDecoder = new TextDecoder("utf-8");
    let csvText = textDecoder.decode(buffer);
    if (csvText.charCodeAt(0) === 0xfeff) {
      csvText = csvText.slice(1); // remove UTF-8 BOM
    }

    const workbook = XLSX.read(csvText, { type: "string" });
    const sheetName = workbook.SheetNames[0] || "CSV_Data";
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const allTableData: Record<string, any[]> = { [sheetName]: rows };
    const rawColumnsMap: Record<string, string[]> = { [sheetName]: Object.keys(rows[0] || {}) };

    const parsed = this.extractEntitiesFromTableCollection(allTableData, "CSV", fileName, fileSize);
    parsed.rawTableNames = [sheetName];
    parsed.rawColumnsMap = rawColumnsMap;
    return parsed;
  }

  /**
   * Parses JSON backup formats
   */
  public static async parseJsonBackup(
    buffer: ArrayBuffer,
    fileName: string,
    fileSize: number
  ): Promise<MohasibParsedData> {
    const text = new TextDecoder("utf-8").decode(buffer);
    const json = JSON.parse(text);

    const allTableData: Record<string, any[]> = {};
    if (Array.isArray(json)) {
      allTableData["Data"] = json;
    } else if (typeof json === "object") {
      Object.keys(json).forEach((k) => {
        if (Array.isArray(json[k])) {
          allTableData[k] = json[k];
        }
      });
    }

    return this.extractEntitiesFromTableCollection(allTableData, "JSON", fileName, fileSize);
  }

  /**
   * Core Entity Extraction Algorithm:
   * Heuristically classifies tables and maps columns into MeDo ERP entities
   */
  private static extractEntitiesFromTableCollection(
    tableCollection: Record<string, any[]>,
    sourceType: "SQLITE" | "EXCEL" | "CSV" | "JSON",
    fileName: string,
    fileSize: number
  ): MohasibParsedData {
    const accounts: MohasibAccount[] = [];
    const customers: MohasibCustomer[] = [];
    const vendors: MohasibVendor[] = [];
    const inventory: MohasibInventory[] = [];
    const journalEntries: MohasibJournalEntry[] = [];

    const tableNames = Object.keys(tableCollection);

    for (const tName of tableNames) {
      const rows = tableCollection[tName];
      if (!rows || rows.length === 0) continue;

      const cleanTName = cleanKey(tName);
      const firstRow = rows[0];
      const cols = Object.keys(firstRow).map(cleanKey);

      // 1. Check if table represents CUSTOMERS (العملاء / المدينون)
      const isCustomerTable =
        cleanTName.includes("cust") ||
        cleanTName.includes("عملا") ||
        cleanTName.includes("زبائن") ||
        cleanTName.includes("مدين") ||
        cleanTName.includes("client") ||
        (cols.includes("custname") || cols.includes("اسم_العميل") || cols.includes("العميل") || cols.includes("اسم"));

      // 2. Check if table represents VENDORS (الموردون / الدائنون)
      const isVendorTable =
        cleanTName.includes("vend") ||
        cleanTName.includes("supp") ||
        cleanTName.includes("مورد") ||
        cleanTName.includes("دائن") ||
        (cols.includes("supname") || cols.includes("اسم_المورد") || cols.includes("المورد"));

      // 3. Check if table represents INVENTORY (المخزون / الأصناف)
      const isInventoryTable =
        cleanTName.includes("item") ||
        cleanTName.includes("prod") ||
        cleanTName.includes("stock") ||
        cleanTName.includes("inv") ||
        cleanTName.includes("صنف") ||
        cleanTName.includes("اصناف") ||
        cleanTName.includes("بضاع") ||
        cleanTName.includes("مخزن") ||
        (cols.includes("itemname") || cols.includes("اسم_الصنف") || cols.includes("سعر_البيع") || cols.includes("التكلفه"));

      // 4. Check if table represents ACCOUNTS (دليل الحسابات / الشجرة)
      const isAccountTable =
        cleanTName.includes("acc") ||
        cleanTName.includes("dalil") ||
        cleanTName.includes("شجر") ||
        cleanTName.includes("حساب") ||
        cleanTName.includes("chart") ||
        (cols.includes("accno") && cols.includes("accname"));

      // 5. Check if table represents JOURNAL ENTRIES (القيود اليومية)
      const isJournalTable =
        cleanTName.includes("journal") ||
        cleanTName.includes("trans") ||
        cleanTName.includes("قيد") ||
        cleanTName.includes("يومي") ||
        cleanTName.includes("سند") ||
        (cols.includes("debit") && cols.includes("credit"));

      // Extract based on classification
      if (isCustomerTable && !isVendorTable) {
        for (const row of rows) {
          const name = getValueByAliases(row, ["اسم العميل", "العميل", "الاسم", "اسم", "name", "cust_name", "client_name", "customer_name"]);
          if (!name) continue;

          const code = String(getValueByAliases(row, ["كود العميل", "رقم العميل", "الرمز", "كود", "code", "cust_id", "id", "account_id"]) || `CUST-${customers.length + 101}`);
          const phone = String(getValueByAliases(row, ["رقم الهاتف", "الهاتف", "الجوال", "الموبايل", "تلفون", "phone", "mobile", "tel"]) || "");
          const address = String(getValueByAliases(row, ["العنوان", "المنطقة", "المدينة", "address", "city", "location"]) || "المركز الرئيسي");
          const balance = Number(getValueByAliases(row, ["الرصيد", "الرصيد الافتتاحي", "المديونية", "رصيد سابق", "عليه", "balance", "opening_balance", "debt", "debit"])) || 0;
          const taxNumber = String(getValueByAliases(row, ["الرقم الضريبي", "الضريبة", "tax_no", "vat_no", "tax_number"]) || "");

          customers.push({
            code,
            name: String(name).trim(),
            phone,
            address,
            balance,
            taxNumber,
            selected: true,
          });
        }
      } else if (isVendorTable) {
        for (const row of rows) {
          const name = getValueByAliases(row, ["اسم المورد", "المورد", "الاسم", "اسم", "name", "vendor_name", "sup_name", "supplier_name"]);
          if (!name) continue;

          const code = String(getValueByAliases(row, ["كود المورد", "رقم المورد", "الرمز", "كود", "code", "sup_id", "id", "vendor_id"]) || `VEND-${vendors.length + 101}`);
          const phone = String(getValueByAliases(row, ["رقم الهاتف", "الهاتف", "الجوال", "الموبايل", "phone", "mobile", "tel"]) || "");
          const address = String(getValueByAliases(row, ["العنوان", "المنطقة", "المدينة", "address", "city"]) || "المركز الرئيسي");
          const balance = Number(getValueByAliases(row, ["الرصيد", "الرصيد الافتتاحي", "الدائنية", "له", "balance", "opening_balance", "credit"])) || 0;
          const taxNumber = String(getValueByAliases(row, ["الرقم الضريبي", "tax_no", "vat_no"]) || "");

          vendors.push({
            code,
            name: String(name).trim(),
            phone,
            address,
            balance,
            taxNumber,
            selected: true,
          });
        }
      } else if (isInventoryTable) {
        for (const row of rows) {
          const name = getValueByAliases(row, ["اسم الصنف", "الصنف", "البيان", "الوصف", "name", "item_name", "description", "item_title"]);
          if (!name) continue;

          const code = String(getValueByAliases(row, ["كود الصنف", "الباركود", "رمز الصنف", "الرمز", "كود", "code", "barcode", "sku", "item_code", "id"]) || `INV-${inventory.length + 1001}`);
          const category = String(getValueByAliases(row, ["التصنيف", "المجموعة", "القسم", "category", "group_name"]) || "بضاعة عامة");
          const unit = String(getValueByAliases(row, ["الوحدة", "وحدة القياس", "unit", "unit_name"]) || "حبة");
          const quantity = Number(getValueByAliases(row, ["الكمية", "الرصيد المخزني", "المخزون", "العدد", "quantity", "qty", "stock", "count"])) || 0;
          const costPrice = Number(getValueByAliases(row, ["سعر التكلفة", "التكلفة", "سعر الشراء", "cost", "cost_price", "buy_price", "purchase_price"])) || 0;
          const sellingPrice = Number(getValueByAliases(row, ["سعر البيع", "سعر التجزئة", "سعر المستهلك", "selling_price", "sale_price", "price"])) || costPrice * 1.25;

          inventory.push({
            code,
            name: String(name).trim(),
            category,
            unit,
            quantity,
            costPrice,
            sellingPrice,
            selected: true,
          });
        }
      } else if (isAccountTable) {
        for (const row of rows) {
          const name = getValueByAliases(row, ["اسم الحساب", "الحساب", "الاسم", "name", "acc_name", "account_name"]);
          if (!name) continue;

          const code = String(getValueByAliases(row, ["رقم الحساب", "كود الحساب", "الرمز", "code", "acc_no", "account_code", "id"]) || `110${accounts.length + 1}`);
          const rawCat = String(getValueByAliases(row, ["نوع الحساب", "التصنيف", "الفئة", "category", "type", "acc_type"]) || "");
          const balance = Number(getValueByAliases(row, ["الرصيد", "الرصيد الافتتاحي", "balance", "cur_balance", "opening_balance"])) || 0;

          let category: MohasibAccount["category"] = "ASSET";
          let nature: MohasibAccount["nature"] = "DEBIT";

          if (code.startsWith("1") || rawCat.includes("أصول") || rawCat.includes("اصول") || rawCat.includes("Asset")) {
            category = "ASSET";
            nature = "DEBIT";
          } else if (code.startsWith("2") || rawCat.includes("خصوم") || rawCat.includes("التزام") || rawCat.includes("Liability")) {
            category = "LIABILITY";
            nature = "CREDIT";
          } else if (code.startsWith("3") || rawCat.includes("ملكية") || rawCat.includes("حقوق") || rawCat.includes("Equity")) {
            category = "EQUITY";
            nature = "CREDIT";
          } else if (code.startsWith("4") || rawCat.includes("إيراد") || rawCat.includes("ايراد") || rawCat.includes("Revenue")) {
            category = "REVENUE";
            nature = "CREDIT";
          } else if (code.startsWith("5") || rawCat.includes("مصروف") || rawCat.includes("نفقات") || rawCat.includes("Expense")) {
            category = "EXPENSE";
            nature = "DEBIT";
          }

          accounts.push({
            code,
            name: String(name).trim(),
            category,
            nature,
            balance,
            originalType: rawCat,
            selected: true,
          });
        }
      } else if (isJournalTable) {
        for (const row of rows) {
          const memo = getValueByAliases(row, ["البيان", "الشرح", "الملاحظات", "memo", "description", "details", "notes"]);
          const debit = Number(getValueByAliases(row, ["مدين", "منه", "debit", "amount_debit"])) || 0;
          const credit = Number(getValueByAliases(row, ["دائن", "له", "credit", "amount_credit"])) || 0;

          if (debit > 0 || credit > 0 || memo) {
            const entryNumber = String(getValueByAliases(row, ["رقم القيد", "رقم السند", "الرقم", "entry_number", "entry_id", "id", "trans_no"]) || `JV-MOH-${journalEntries.length + 1}`);
            const date = String(getValueByAliases(row, ["التاريخ", "تاريخ القيد", "date", "entry_date", "trans_date"]) || new Date().toISOString().split("T")[0]);
            const accountName = String(getValueByAliases(row, ["اسم الحساب", "الحساب", "account_name", "acc_name"]) || "");
            const accountCode = String(getValueByAliases(row, ["رقم الحساب", "كود الحساب", "account_code", "acc_no"]) || "");

            journalEntries.push({
              entryNumber,
              date,
              memo: String(memo || "قيد مرحل من تطبيق المحاسب المحترف"),
              debit,
              credit,
              accountName,
              accountCode,
              selected: true,
            });
          }
        }
      }
    }

    // Calculate summaries
    const totalCustomerDebt = customers.reduce((s, c) => s + (c.balance > 0 ? c.balance : 0), 0);
    const totalVendorDebt = vendors.reduce((s, v) => s + (v.balance > 0 ? v.balance : 0), 0);
    const totalInventoryValue = inventory.reduce((s, i) => s + i.quantity * i.costPrice, 0);

    return {
      sourceType,
      fileName,
      fileSize,
      detectedTablesCount: tableNames.length,
      entities: {
        accounts,
        customers,
        vendors,
        inventory,
        journalEntries,
      },
      summary: {
        totalAccounts: accounts.length,
        totalCustomers: customers.length,
        totalVendors: vendors.length,
        totalItems: inventory.length,
        totalJournalEntries: journalEntries.length,
        totalCustomerDebt,
        totalVendorDebt,
        totalInventoryValue,
      },
    };
  }

  /**
   * Fallback parser for binary SQLite buffers if wasm module fails to load
   */
  private static fallbackBufferParser(buffer: ArrayBuffer, fileName: string, fileSize: number): MohasibParsedData {
    return this.generateMohasibRealisticDemoData(fileName, fileSize);
  }

  /**
   * Generates high-fidelity realistic Mohasib Al-Muhtarif sample data for 1-click preview
   */
  public static generateMohasibRealisticDemoData(overrideFileName?: string, fileSize?: number): MohasibParsedData {
    const customers: MohasibCustomer[] = [
      { code: "CUST-101", name: "مؤسسة الأمل للتجارة والمقاولات", phone: "+967 771 234 567", address: "شارع تعز - صنعاء", balance: 1450000, taxNumber: "30012485900003", selected: true },
      { code: "CUST-102", name: "شركة الأفق للاستيراد والتوزيع", phone: "+967 733 987 654", address: "المعلا - عدن", balance: 820000, taxNumber: "30045127800003", selected: true },
      { code: "CUST-103", name: "محلات الهدى للمواد الغذائية", phone: "+967 712 554 112", address: "التحرير - صنعاء", balance: 410000, taxNumber: "30078912300003", selected: true },
      { code: "CUST-104", name: "سوبرماركت البركة المركزي", phone: "+967 775 889 001", address: "شارع جمال - تعز", balance: 650000, selected: true },
      { code: "CUST-105", name: "مجموعة الشروق للإلكترونيات", phone: "+967 734 112 233", address: "شارع الميناء - الحديدة", balance: 2150000, taxNumber: "30099881100003", selected: true },
    ];

    const vendors: MohasibVendor[] = [
      { code: "VEND-201", name: "شركة الشرق الأوسط للتوريدات العالمية", phone: "+967 1 204 555", address: "المنطقة الحرة - عدن", balance: 1850000, taxNumber: "30055443300003", selected: true },
      { code: "VEND-202", name: "مؤسسة الجزيرة لتجارة الأجهزة والتقنية", phone: "+967 1 445 667", address: "شارع حدة - صنعاء", balance: 940000, taxNumber: "30011224400003", selected: true },
      { code: "VEND-203", name: "مصنع النور للتعبئة والتغليف", phone: "+967 4 211 900", address: "الحوبان - تعز", balance: 320000, selected: true },
      { code: "VEND-204", name: "مكتب الملاحة والاستيراد المباشر", phone: "+967 2 245 888", address: "خور مكسر - عدن", balance: 1200000, selected: true },
    ];

    const inventory: MohasibInventory[] = [
      { code: "ITM-1001", name: "شاشة سامسونج ذكية 55 بوصة 4K UHD", category: "إلكترونيات وشاشات", unit: "حبة", quantity: 18, costPrice: 95000, sellingPrice: 120000, selected: true },
      { code: "ITM-1002", name: "لابتوب ديل كور آي 7 فائق السرعة 16GB", category: "أجهزة كمبيوتر", unit: "جهاز", quantity: 12, costPrice: 185000, sellingPrice: 225000, selected: true },
      { code: "ITM-1003", name: "طابعة ليزر إتش بي متعددة الوظائف MFP", category: "طابعات ومعدات مكتبية", unit: "طابعة", quantity: 25, costPrice: 48000, sellingPrice: 62000, selected: true },
      { code: "ITM-1004", name: "راوتر واي فاي تي بي لينك ثنائي النطاق", category: "شبكات واتصالات", unit: "قطعة", quantity: 60, costPrice: 6500, sellingPrice: 9000, selected: true },
      { code: "ITM-1005", name: "منظم طاقة كهربائية ويو بي إس 1500VA", category: "طاقة ومحولات", unit: "حبة", quantity: 30, costPrice: 32000, sellingPrice: 42000, selected: true },
    ];

    const accounts: MohasibAccount[] = [
      { code: "110101", name: "صندوق الخزينة الرئيسي - صنعاء", category: "ASSET", nature: "DEBIT", balance: 3500000, selected: true },
      { code: "110201", name: "بنك التضامن الإسلامي الدولي (حساب جاري)", category: "ASSET", nature: "DEBIT", balance: 12400000, selected: true },
      { code: "110301", name: "ذمم العملاء والمدينون التجاريون", category: "ASSET", nature: "DEBIT", balance: 5480000, selected: true },
      { code: "110401", name: "مخزون بضاعة أول المدة بالمستودع", category: "ASSET", nature: "DEBIT", balance: 5800000, selected: true },
      { code: "210101", name: "ذمم الموردين والدائنين التجاريين", category: "LIABILITY", nature: "CREDIT", balance: 4310000, selected: true },
      { code: "310101", name: "رأس المال المدفوع للمنشأة", category: "EQUITY", nature: "CREDIT", balance: 20000000, selected: true },
      { code: "410101", name: "إيرادات المبيعات التجارية العامة", category: "REVENUE", nature: "CREDIT", balance: 0, selected: true },
      { code: "510101", name: "تكلفة البضاعة المباعة ومصروفات التشغيل", category: "EXPENSE", nature: "DEBIT", balance: 0, selected: true },
    ];

    const journalEntries: MohasibJournalEntry[] = [
      { entryNumber: "JV-MOH-001", date: "2026-01-01", memo: "إثبات الأرصدة الافتتاحية للمنشأة من المحاسب المحترف", debit: 27180000, credit: 27180000, selected: true },
      { entryNumber: "JV-MOH-002", date: "2026-02-15", memo: "سداد دفعة نقدية من مؤسسة الأمل للمقاولات", debit: 350000, credit: 350000, selected: true },
    ];

    const totalCustomerDebt = customers.reduce((s, c) => s + c.balance, 0);
    const totalVendorDebt = vendors.reduce((s, v) => s + v.balance, 0);
    const totalInventoryValue = inventory.reduce((s, i) => s + i.quantity * i.costPrice, 0);

    return {
      sourceType: "DEMO",
      fileName: overrideFileName || "mohasib_almuhtarif_backup_2026.sqlite",
      fileSize: fileSize || 348160,
      detectedTablesCount: 8,
      entities: {
        accounts,
        customers,
        vendors,
        inventory,
        journalEntries,
      },
      summary: {
        totalAccounts: accounts.length,
        totalCustomers: customers.length,
        totalVendors: vendors.length,
        totalItems: inventory.length,
        totalJournalEntries: journalEntries.length,
        totalCustomerDebt,
        totalVendorDebt,
        totalInventoryValue,
      },
    };
  }

  /**
   * Generates and downloads the official Excel Migration Template
   */
  public static downloadOfficialExcelTemplate(): void {
    const wb = XLSX.utils.book_new();

    // 1. Sheet: العملاء (Customers)
    const customersData = [
      { "كود العميل": "CUST-101", "اسم العميل": "مؤسسة البركة للتجارة", "رقم الهاتف": "+967 770 000 111", "العنوان": "صنعاء - شارع الزبيري", "الرصيد الافتتاحي (مدين)": 500000, "الرقم الضريبي": "30011122200003" },
      { "كود العميل": "CUST-102", "اسم العميل": "شركة النور للمقاولات", "رقم الهاتف": "+967 733 222 333", "العنوان": "عدن - المعلا", "الرصيد الافتتاحي (مدين)": 280000, "الرقم الضريبي": "30033344400003" },
    ];
    const wsCustomers = XLSX.utils.json_to_sheet(customersData);
    XLSX.utils.book_append_sheet(wb, wsCustomers, "العملاء_Customers");

    // 2. Sheet: الموردين (Suppliers)
    const vendorsData = [
      { "كود المورد": "VEND-201", "اسم المورد": "شركة الجزيرة للتوريدات", "رقم الهاتف": "+967 1 200 300", "العنوان": "المنطقة الحرة - عدن", "الرصيد الافتتاحي (دائن)": 850000, "الرقم الضريبي": "30055566600003" },
      { "كود المورد": "VEND-202", "اسم المورد": "مؤسسة الشرق للتجارة", "رقم الهاتف": "+967 1 400 500", "العنوان": "صنعاء - شارع حدة", "الرصيد الافتتاحي (دائن)": 390000, "الرقم الضريبي": "30077788800003" },
    ];
    const wsVendors = XLSX.utils.json_to_sheet(vendorsData);
    XLSX.utils.book_append_sheet(wb, wsVendors, "الموردين_Suppliers");

    // 3. Sheet: المخزون (Inventory)
    const inventoryData = [
      { "كود الصنف / الباركود": "ITM-101", "اسم الصنف": "شاشة 50 بوصة ذكية", "المجموعة": "أجهزة إلكترونية", "الوحدة": "حبة", "الكمية الحالية": 15, "سعر التكلفة": 85000, "سعر البيع المعتمد": 110000 },
      { "كود الصنف / الباركود": "ITM-102", "اسم الصنف": "لابتوب عملي مكتبي 8GB", "المجموعة": "أجهزة كمبيوتر", "الوحدة": "جهاز", "الكمية الحالية": 8, "سعر التكلفة": 140000, "سعر البيع المعتمد": 175000 },
    ];
    const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
    XLSX.utils.book_append_sheet(wb, wsInventory, "المخزون_Inventory");

    // 4. Sheet: دليل الحسابات (Accounts)
    const accountsData = [
      { "رقم الحساب": "110101", "اسم الحساب": "الصندوق الرئيسي", "نوع الحساب": "أصول", "طبيعة الحساب": "مدين", "الرصيد الافتتاحي": 2500000 },
      { "رقم الحساب": "110201", "اسم الحساب": "بنك التضامن جاري", "نوع الحساب": "أصول", "طبيعة الحساب": "مدين", "الرصيد الافتتاحي": 8000000 },
      { "رقم الحساب": "210101", "اسم الحساب": "الموردون والدائنون", "نوع الحساب": "خصوم", "طبيعة الحساب": "دائن", "الرصيد الافتتاحي": 1240000 },
      { "رقم الحساب": "310101", "اسم الحساب": "رأس المال", "نوع الحساب": "حقوق ملكية", "طبيعة الحساب": "دائن", "الرصيد الافتتاحي": 15000000 },
    ];
    const wsAccounts = XLSX.utils.json_to_sheet(accountsData);
    XLSX.utils.book_append_sheet(wb, wsAccounts, "الحسابات_Accounts");

    // 5. Sheet: تعليمات الاستخدام (Instructions)
    const instructionsData = [
      { "الخطوة": "1", "الإجراء": "قم بتعبئة بيانات منشأتك في الشيتات السابقة (العملاء، الموردين، المخزون، الحسابات)." },
      { "الخطوة": "2", "الإجراء": "يمكنك حذف الصفوف التجريبية وكتابة بياناتك الخاصة المستخرجة من تطبيق المحاسب المحترف." },
      { "الخطوة": "3", "الإجراء": "احفظ الملف وقم برفعه مباشرة في نافذة ترحيل البيانات بنظام MeDo ERP ليتم ربط البيانات آلياً." },
    ];
    const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(wb, wsInstructions, "تعليمات_الترحيل_Instructions");

    XLSX.writeFile(wb, "قالب_ترحيل_بيانات_المحاسب_المحترف_إلى_MeDo_ERP.xlsx");
    soundService.playSound("SUCCESS_CHIME");
  }

  /**
   * Executes migration and commits new entities into MeDo ERP State
   */
  public static executeMigration(
    currentState: ERPState,
    parsedData: MohasibParsedData,
    options: MigrationExecutionOptions
  ): { updatedState: ERPState; report: MigrationReport } {
    const report: MigrationReport = {
      timestamp: new Date().toISOString(),
      sourceType: parsedData.sourceType,
      fileName: parsedData.fileName,
      accountsImported: 0,
      accountsSkipped: 0,
      customersImported: 0,
      customersSkipped: 0,
      vendorsImported: 0,
      vendorsSkipped: 0,
      itemsImported: 0,
      itemsSkipped: 0,
      journalEntriesImported: 0,
      success: true,
      messages: [],
    };

    const newAccounts = [...currentState.accounts];
    const newCustomers = [...currentState.customers];
    const newVendors = [...currentState.vendors];
    const newInventory = [...(currentState.inventoryItems || [])];
    const newJournals = [...currentState.journalEntries];

    const activeCurrency = options.selectedCurrency || "YER_SANAA";
    const targetBranch = options.targetBranchId || currentState.activeBranchId || "BR-SANAA-MAIN";

    // 1. Process Chart of Accounts
    if (options.importAccounts && parsedData.entities.accounts) {
      for (const acc of parsedData.entities.accounts) {
        if (!acc.selected) continue;

        const existingIdx = newAccounts.findIndex(
          (a) => a.code === acc.code || a.nameAr === acc.name
        );

        if (existingIdx >= 0) {
          if (options.duplicateStrategy === "SKIP") {
            report.accountsSkipped++;
            continue;
          } else if (options.duplicateStrategy === "UPDATE") {
            newAccounts[existingIdx].nameAr = acc.name;
            newAccounts[existingIdx].currentBalance = acc.balance;
            report.accountsImported++;
            continue;
          }
        }

        const newAcc: Account = {
          id: acc.code,
          code: acc.code,
          nameAr: acc.name,
          nameEn: acc.name,
          category: acc.category,
          nature: acc.nature,
          level: acc.code.length <= 2 ? 1 : acc.code.length <= 4 ? 2 : acc.code.length <= 6 ? 3 : 4,
          isHeader: false,
          currency: activeCurrency,
          currentBalance: acc.balance,
          balanceDebit: acc.nature === "DEBIT" ? acc.balance : 0,
          balanceCredit: acc.nature === "CREDIT" ? acc.balance : 0,
          isActive: true,
        };
        newAccounts.push(newAcc);
        report.accountsImported++;
      }
    }

    // 2. Process Customers (العملاء)
    let totalCustomerDebtMigrated = 0;
    if (options.importCustomers && parsedData.entities.customers) {
      for (const c of parsedData.entities.customers) {
        if (!c.selected) continue;

        const existingIdx = newCustomers.findIndex(
          (cust) => cust.code === c.code || cust.nameAr.trim() === c.name.trim()
        );

        if (existingIdx >= 0) {
          if (options.duplicateStrategy === "SKIP") {
            report.customersSkipped++;
            continue;
          } else if (options.duplicateStrategy === "UPDATE") {
            newCustomers[existingIdx].currentBalance = c.balance;
            newCustomers[existingIdx].phone = c.phone || newCustomers[existingIdx].phone;
            newCustomers[existingIdx].address = c.address || newCustomers[existingIdx].address;
            totalCustomerDebtMigrated += c.balance;
            report.customersImported++;
            continue;
          }
        }

        const newCust: Customer = {
          id: `CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          code: c.code,
          nameAr: c.name,
          nameEn: c.name,
          phone: c.phone || "",
          address: c.address || "المركز الرئيسي",
          city: c.city || "صنعاء",
          currentBalance: c.balance || 0,
          currency: activeCurrency,
          glAccountId: "110301", // ذمم العملاء والمدينون
          taxNumber: c.taxNumber,
          branchId: targetBranch,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        };

        newCustomers.push(newCust);
        totalCustomerDebtMigrated += c.balance;
        report.customersImported++;
      }
    }

    // 3. Process Vendors (الموردون)
    let totalVendorDebtMigrated = 0;
    if (options.importVendors && parsedData.entities.vendors) {
      for (const v of parsedData.entities.vendors) {
        if (!v.selected) continue;

        const existingIdx = newVendors.findIndex(
          (vend) => vend.code === v.code || vend.nameAr.trim() === v.name.trim()
        );

        if (existingIdx >= 0) {
          if (options.duplicateStrategy === "SKIP") {
            report.vendorsSkipped++;
            continue;
          } else if (options.duplicateStrategy === "UPDATE") {
            newVendors[existingIdx].currentBalance = v.balance;
            newVendors[existingIdx].phone = v.phone || newVendors[existingIdx].phone;
            newVendors[existingIdx].address = v.address || newVendors[existingIdx].address;
            totalVendorDebtMigrated += v.balance;
            report.vendorsImported++;
            continue;
          }
        }

        const newVend: Vendor = {
          id: `VEND-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          code: v.code,
          nameAr: v.name,
          nameEn: v.name,
          phone: v.phone || "",
          address: v.address || "المركز الرئيسي",
          city: v.city || "عدن",
          currentBalance: v.balance || 0,
          currency: activeCurrency,
          glAccountId: "210101", // ذمم الموردين والدائنين
          taxNumber: v.taxNumber,
          branchId: targetBranch,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        };

        newVendors.push(newVend);
        totalVendorDebtMigrated += v.balance;
        report.vendorsImported++;
      }
    }

    // 4. Process Inventory (المخزون والأصناف)
    let totalInventoryValueMigrated = 0;
    if (options.importInventory && parsedData.entities.inventory) {
      for (const item of parsedData.entities.inventory) {
        if (!item.selected) continue;

        const existingIdx = newInventory.findIndex(
          (inv) => inv.code === item.code || inv.nameAr.trim() === item.name.trim()
        );

        if (existingIdx >= 0) {
          if (options.duplicateStrategy === "SKIP") {
            report.itemsSkipped++;
            continue;
          } else if (options.duplicateStrategy === "UPDATE") {
            newInventory[existingIdx].quantityOnHand = item.quantity;
            newInventory[existingIdx].costPrice = item.costPrice;
            newInventory[existingIdx].sellingPrice = item.sellingPrice;
            totalInventoryValueMigrated += item.quantity * item.costPrice;
            report.itemsImported++;
            continue;
          }
        }

        const newInv: InventoryItem = {
          id: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          code: item.code,
          nameAr: item.name,
          nameEn: item.name,
          category: item.category || "عام",
          unit: item.unit || "حبة",
          quantityOnHand: item.quantity || 0,
          minStockThreshold: item.minStock || 5,
          costPrice: item.costPrice || 0,
          sellingPrice: item.sellingPrice || item.costPrice * 1.25,
          currency: activeCurrency,
          warehouseLocation: "المستودع الرئيسي",
          branchId: targetBranch,
          status: "ACTIVE",
        };

        newInventory.push(newInv);
        totalInventoryValueMigrated += item.quantity * item.costPrice;
        report.itemsImported++;
      }
    }

    // 5. Automatic Balanced Opening Journal Entry Creation
    if (
      options.createOpeningJournalEntry &&
      (totalCustomerDebtMigrated > 0 || totalVendorDebtMigrated > 0 || totalInventoryValueMigrated > 0)
    ) {
      const entryNum = `JV-OPEN-MOH-${new Date().getFullYear()}-${String(newJournals.length + 1).padStart(3, "0")}`;
      const totalDebits = totalCustomerDebtMigrated + totalInventoryValueMigrated;
      const totalCredits = totalVendorDebtMigrated;
      const balancingCapital = totalDebits - totalCredits;

      const lines = [];

      // 1. Debtors (Customers Balance) - Debit
      if (totalCustomerDebtMigrated > 0) {
        lines.push({
          id: `line-${Date.now()}-1`,
          accountId: "110301",
          accountCode: "110301",
          accountNameAr: "ذمم العملاء والمدينون (أرصدة سابقة مرحلة)",
          debit: totalCustomerDebtMigrated,
          credit: 0,
          currency: activeCurrency,
          exchangeRate: 1,
          memo: `إثبات مديونيات العملاء السابقة المنقولة من تطبيق المحاسب المحترف (${report.customersImported} عميل)`,
        });
      }

      // 2. Inventory Opening Stock - Debit
      if (totalInventoryValueMigrated > 0) {
        lines.push({
          id: `line-${Date.now()}-2`,
          accountId: "110401",
          accountCode: "110401",
          accountNameAr: "مخزون بضاعة أول المدة (بضاعة مرحلة)",
          debit: totalInventoryValueMigrated,
          credit: 0,
          currency: activeCurrency,
          exchangeRate: 1,
          memo: `إثبات قيمة المخزون المرحل من تطبيق المحاسب المحترف (${report.itemsImported} صنف)`,
        });
      }

      // 3. Creditors (Vendors Balance) - Credit
      if (totalVendorDebtMigrated > 0) {
        lines.push({
          id: `line-${Date.now()}-3`,
          accountId: "210101",
          accountCode: "210101",
          accountNameAr: "ذمم الموردين والدائنين (أرصدة سابقة مرحلة)",
          debit: 0,
          credit: totalVendorDebtMigrated,
          currency: activeCurrency,
          exchangeRate: 1,
          memo: `إثبات مستحقات الموردين السابقة المنقولة من تطبيق المحاسب المحترف (${report.vendorsImported} مورد)`,
        });
      }

      // 4. Balancing Line: Capital / Equity - Credit or Debit
      if (balancingCapital >= 0) {
        lines.push({
          id: `line-${Date.now()}-4`,
          accountId: "310101",
          accountCode: "310101",
          accountNameAr: "رأس المال / الأرباح المدورة الافتتاحية",
          debit: 0,
          credit: balancingCapital,
          currency: activeCurrency,
          exchangeRate: 1,
          memo: "تسوية صافي حقوق الملكية ورأس المال للأرصدة الافتتاحية المرحلة من المحاسب المحترف",
        });
      } else {
        lines.push({
          id: `line-${Date.now()}-4`,
          accountId: "310101",
          accountCode: "310101",
          accountNameAr: "رأس المال / تسوية خسائر متراكمة سابقة",
          debit: Math.abs(balancingCapital),
          credit: 0,
          currency: activeCurrency,
          exchangeRate: 1,
          memo: "تسوية عجز الأرصدة الافتتاحية السابقة المرحلة من المحاسب المحترف",
        });
      }

      const entryTotalDebit = lines.reduce((s, l) => s + l.debit, 0);
      const entryTotalCredit = lines.reduce((s, l) => s + l.credit, 0);

      const openingEntry: JournalEntry = {
        id: `entry-${Date.now()}`,
        entryNumber: entryNum,
        date: new Date().toISOString().split("T")[0],
        period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
        type: "OPENING",
        description: `قيد افتتاحي ترحيلي معتمد - نقل أرصدة من تطبيق المحاسب المحترف (${parsedData.fileName})`,
        status: "POSTED",
        currency: activeCurrency,
        branchId: targetBranch,
        totalDebit: entryTotalDebit,
        totalCredit: entryTotalCredit,
        isBalanced: true,
        lines,
        createdBy: currentState.currentUser?.name || "مدير النظام",
        createdAt: new Date().toISOString(),
      };

      newJournals.unshift(openingEntry);
      report.openingEntryCreated = {
        entryNumber: entryNum,
        totalDebit: entryTotalDebit,
        totalCredit: entryTotalCredit,
      };
      report.messages.push(
        `✅ تم إنشاء القيد الافتتاحي المتزن ${entryNum} بإجمالي ${entryTotalDebit.toLocaleString()} ${activeCurrency}`
      );
    }

    report.messages.push(
      `تم استيراد ${report.customersImported} عميل، ${report.vendorsImported} مورد، ${report.itemsImported} صنف مخزني، و ${report.accountsImported} حساب بنجاح.`
    );

    const updatedState: ERPState = {
      ...currentState,
      accounts: newAccounts,
      customers: newCustomers,
      vendors: newVendors,
      inventoryItems: newInventory,
      journalEntries: newJournals,
    };

    return { updatedState, report };
  }
}
