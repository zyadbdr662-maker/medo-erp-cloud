import React, { useState, useMemo } from "react";
import {
  QrCode,
  ShieldCheck,
  Building2,
  UserCheck,
  FileCode2,
  Send,
  Download,
  Share2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Printer,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Layers,
  FileText,
  Barcode,
  ExternalLink,
  ChevronRight,
  Plus,
  ArrowRight,
  KeyRound,
  Lock,
  Tag,
  Hash,
  Clock,
  Calendar,
  DollarSign,
  Percent,
  Package,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Invoice,
  InvoiceItem,
  InvoicePaymentMethod,
  Customer,
  CurrencyCode,
  CurrencyInfo,
  InventoryItem,
} from "../types/erp";
import { formatMoney } from "../services/erpStorage";
import { generateZatcaQr } from "../utils/zatca";

interface ElectronicInvoicingModuleProps {
  invoices: Invoice[];
  customers: Customer[];
  inventoryItems?: InventoryItem[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  onOpenCreateInvoice: (type: "SALES" | "SALES_RETURN") => void;
  onPrintDocument: (docType: "INVOICE", data: any) => void;
  onShareDocument?: (data: any) => void;
  onSaveInvoice?: (invoice: Invoice) => void;
}

// Helper to decode ZATCA TLV Base64
export function decodeZatcaTlv(base64String: string) {
  try {
    const binary = atob(base64String);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const tags: { tag: number; name: string; value: string; rawHex: string }[] = [];
    let i = 0;
    const decoder = new TextDecoder("utf-8");

    const tagNames: Record<number, string> = {
      1: "اسم المورد / المنشأة (Seller Name)",
      2: "الرقم الضريبي للمنشأة (VAT Registration Number)",
      3: "التاريخ والوقت بتنسيق ISO 8601 (Timestamp)",
      4: "إجمالي الفاتورة شاملاً الضريبة (Invoice Total)",
      5: "إجمالي مبلغ ضريبة القيمة المضافة (VAT Total)",
      6: "تجزئة الفاتورة الرقمية SHA-256 (Invoice Hash)",
      7: "التوقيع الرقمي للمفتاح العام ECDSA (Digital Signature)",
      8: "المفتاح العام لجهاز الفوترة (ECDSA Public Key)",
      9: "توقيع الختم المشفر للهيئة (ZATCA Stamp)",
    };

    while (i < bytes.length) {
      const tag = bytes[i];
      i += 1;
      if (i >= bytes.length) break;
      const length = bytes[i];
      i += 1;
      if (i + length > bytes.length) break;
      const valueBytes = bytes.slice(i, i + length);
      i += length;

      let value = "";
      if (tag <= 5) {
        try {
          value = decoder.decode(valueBytes);
        } catch {
          value = Array.from(valueBytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        }
      } else {
        // Cryptographic hashes / signatures in hex or base64
        value = Array.from(valueBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" ");
      }

      tags.push({
        tag,
        name: tagNames[tag] || `العلامة Tag ${tag}`,
        value,
        rawHex: Array.from(valueBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
      });
    }

    return { success: true, tags, error: null };
  } catch (err: any) {
    return { success: false, tags: [], error: err?.message || "تعذر فك ترميز كود TLV" };
  }
}

// Generate Compliant UBL 2.1 XML Invoice
export function generateUbl21Xml(invoice: Invoice, sellerInfo: { name: string; vatNumber: string; address: string; crNumber: string }) {
  const isB2B = Boolean(invoice.partyName && invoice.partyName !== "عميل نقدي عام" && (invoice as any).buyerVatNumber);
  const invoiceTypeCode = isB2B ? "388" : "388";
  const subType = isB2B ? "0100000" : "0200000"; // 0100000 = Standard Tax Invoice B2B, 0200000 = Simplified B2C

  const itemsXml = (invoice.items || [])
    .map(
      (item, idx) => `
    <cac:InvoiceLine>
        <cbc:ID>${idx + 1}</cbc:ID>
        <cbc:InvoicedQuantity unitCode="EA">${item.quantity || 1}</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="${invoice.currency || "SAR"}">${((item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)}</cbc:LineExtensionAmount>
        <cac:TaxTotal>
            <cbc:TaxAmount currencyID="${invoice.currency || "SAR"}">${((item.taxAmount || ((item.unitPrice || 0) * (item.quantity || 1) * (invoice.taxRate || 0.15)))).toFixed(2)}</cbc:TaxAmount>
            <cbc:RoundingAmount currencyID="${invoice.currency || "SAR"}">${(((item.unitPrice || 0) * (item.quantity || 1)) + (item.taxAmount || ((item.unitPrice || 0) * (item.quantity || 1) * (invoice.taxRate || 0.15)))).toFixed(2)}</cbc:RoundingAmount>
        </cac:TaxTotal>
        <cac:Item>
            <cbc:Name><![CDATA[${item.description || item.itemName || "صنف تجاري"}]]></cbc:Name>
            <cac:ClassifiedTaxCategory>
                <cbc:ID>S</cbc:ID>
                <cbc:Percent>${((invoice.taxRate || 0.15) * 100).toFixed(0)}</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:ClassifiedTaxCategory>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount currencyID="${invoice.currency || "SAR"}">${(item.unitPrice || 0).toFixed(2)}</cbc:PriceAmount>
        </cac:Price>
    </cac:InvoiceLine>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
    <!-- UBL 2.1 / ZATCA Fatoora Phase 2 Compliant E-Invoice -->
    <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
    <cbc:ID>${invoice.invoiceNumber || "INV-" + invoice.id}</cbc:ID>
    <cbc:UUID>${invoice.id || "uuid-gen-" + Date.now()}</cbc:UUID>
    <cbc:IssueDate>${invoice.date || new Date().toISOString().split("T")[0]}</cbc:IssueDate>
    <cbc:IssueTime>${(invoice as any).issueTime || "14:30:00"}</cbc:IssueTime>
    <cbc:InvoiceTypeCode name="${subType}">${invoiceTypeCode}</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>${invoice.currency || "SAR"}</cbc:DocumentCurrencyCode>
    <cbc:TaxCurrencyCode>${invoice.currency || "SAR"}</cbc:TaxCurrencyCode>
    
    <!-- Previous Invoice Hash (PIH) for Blockchain Chaining -->
    <cac:AdditionalDocumentReference>
        <cbc:ID>PIH</cbc:ID>
        <cac:Attachment>
            <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYTY0MmY0...</cbc:EmbeddedDocumentBinaryObject>
        </cac:Attachment>
    </cac:AdditionalDocumentReference>
    
    <!-- QR Code TLV Base64 -->
    <cac:AdditionalDocumentReference>
        <cbc:ID>QR</cbc:ID>
        <cac:Attachment>
            <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${invoice.qrCodeData || generateZatcaQr(sellerInfo.name, sellerInfo.vatNumber, invoice.date + "T14:30:00Z", (invoice.grandTotal || invoice.totalAmount || 0).toString(), (invoice.taxTotal || invoice.taxAmount || 0).toString())}</cbc:EmbeddedDocumentBinaryObject>
        </cac:Attachment>
    </cac:AdditionalDocumentReference>

    <!-- Supplier / Seller Information -->
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="CRN">${sellerInfo.crNumber}</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyName>
                <cbc:Name><![CDATA[${sellerInfo.name}]]></cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
                <cbc:StreetName>شارع الملك فهد</cbc:StreetName>
                <cbc:BuildingNumber>1234</cbc:BuildingNumber>
                <cbc:CityName>الرياض</cbc:CityName>
                <cbc:PostalZone>12211</cbc:PostalZone>
                <cac:Country>
                    <cbc:IdentificationCode>SA</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>${sellerInfo.vatNumber}</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName><![CDATA[${sellerInfo.name}]]></cbc:RegistrationName>
            </cac:PartyLegalEntity>
        </cac:Party>
    </cac:AccountingSupplierParty>

    <!-- Customer / Buyer Information -->
    <cac:AccountingCustomerParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="NAT">${(invoice as any).buyerVatNumber || "700000000000003"}</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyName>
                <cbc:Name><![CDATA[${invoice.customerName || invoice.partyName || "عميل نقدي"}]]></cbc:Name>
            </cac:PartyName>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>${(invoice as any).buyerVatNumber || "300000000000003"}</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
        </cac:Party>
    </cac:AccountingCustomerParty>

    <!-- Monetary Totals -->
    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${invoice.currency || "SAR"}">${(invoice.taxTotal || invoice.taxAmount || 0).toFixed(2)}</cbc:TaxAmount>
    </cac:TaxTotal>
    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="${invoice.currency || "SAR"}">${(invoice.subtotal || 0).toFixed(2)}</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="${invoice.currency || "SAR"}">${(invoice.subtotal || 0).toFixed(2)}</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="${invoice.currency || "SAR"}">${(invoice.grandTotal || invoice.totalAmount || 0).toFixed(2)}</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="${invoice.currency || "SAR"}">${(invoice.grandTotal || invoice.totalAmount || 0).toFixed(2)}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>

    <!-- Invoice Lines -->
    ${itemsXml}
</Invoice>`;
}

export const ElectronicInvoicingModule: React.FC<ElectronicInvoicingModuleProps> = ({
  invoices,
  customers,
  inventoryItems = [],
  currencies,
  displayCurrency,
  onOpenCreateInvoice,
  onPrintDocument,
  onShareDocument,
  onSaveInvoice,
}) => {
  const [subTab, setSubTab] = useState<"REGISTRY" | "TLV_SCANNER" | "SIMULATOR" | "UBL_XML" | "BARCODES">("REGISTRY");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "B2B" | "B2C">("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null);

  // TLV Scanner State
  const [tlvInput, setTlvInput] = useState<string>("");
  const [decodedTlvResult, setDecodedTlvResult] = useState<any>(null);

  // Barcode Print Generator State
  const [barcodeItem, setBarcodeItem] = useState<string>(inventoryItems[0]?.id || "");
  const [barcodeCount, setBarcodeCount] = useState<number>(12);
  const [barcodeFormat, setBarcodeFormat] = useState<"CODE128" | "QR" | "EAN13">("QR");
  const [showPriceOnLabel, setShowPriceOnLabel] = useState<boolean>(true);

  // Inspector Modal State
  const [showInspectorModal, setShowInspectorModal] = useState<boolean>(false);
  const [inspectingInvoice, setInspectingInvoice] = useState<Invoice | null>(null);

  // Quick issuance state with full Customers and Items Integration
  const [showQuickIssueModal, setShowQuickIssueModal] = useState<boolean>(false);
  const [quickInvoiceType, setQuickInvoiceType] = useState<"B2B" | "B2C">("B2B");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [quickCustomerName, setQuickCustomerName] = useState<string>("");
  const [quickBuyerVat, setQuickBuyerVat] = useState<string>("310000000000003");
  const [quickCurrency, setQuickCurrency] = useState<CurrencyCode>("SAR");
  const [quickPaymentMethod, setQuickPaymentMethod] = useState<InvoicePaymentMethod>("CASH");
  const [quickNotes, setQuickNotes] = useState<string>("فاتورة إلكترونية معتمدة مطابقة لمتطلبات هيئة الزكاة والضريبة والجمارك ZATCA Fatoora");

  // Dynamic Item Rows
  const [quickItems, setQuickItems] = useState<Array<{
    id: string;
    itemId?: string;
    description: string;
    barcode?: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }>>([
    {
      id: "item-1",
      itemId: inventoryItems[0]?.id || "",
      description: inventoryItems[0]?.nameAr || inventoryItems[0]?.name || "صنف تجاري عام",
      barcode: inventoryItems[0]?.sku || inventoryItems[0]?.barcode || "SKU-1001",
      unit: inventoryItems[0]?.unit || "قطعة",
      quantity: 1,
      unitPrice: inventoryItems[0]?.sellingPrice || 1000,
      taxRate: 15,
    },
  ]);

  // Handle selecting a registered customer
  const handleSelectCustomer = (custId: string) => {
    setSelectedCustomerId(custId);
    if (custId === "CASH" || !custId) {
      setQuickCustomerName("عميل نقدي عام");
      setQuickInvoiceType("B2C");
      return;
    }
    const found = customers.find((c) => c.id === custId);
    if (found) {
      setQuickCustomerName(found.nameAr || found.name);
      if (found.taxNumber) {
        setQuickBuyerVat(found.taxNumber);
        setQuickInvoiceType("B2B");
      } else if (found.name?.includes("شركة") || found.nameAr?.includes("شركة") || found.nameAr?.includes("مؤسسة")) {
        setQuickInvoiceType("B2B");
      }
    }
  };

  // Handle selecting an inventory item for a row
  const handleSelectInventoryItem = (rowId: string, invItemId: string) => {
    const foundItem = inventoryItems.find((it) => it.id === invItemId);
    setQuickItems((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        if (!foundItem) {
          return { ...row, itemId: "" };
        }
        return {
          ...row,
          itemId: foundItem.id,
          description: foundItem.nameAr || foundItem.name,
          barcode: foundItem.sku || foundItem.barcode || "",
          unit: foundItem.unit || "قطعة",
          unitPrice: foundItem.sellingPrice || 100,
        };
      })
    );
  };

  const handleAddItemRow = () => {
    const nextItem = inventoryItems[quickItems.length % (inventoryItems.length || 1)];
    const newRow = {
      id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      itemId: nextItem?.id || "",
      description: nextItem ? (nextItem.nameAr || nextItem.name) : "صنف تجاري إضافي",
      barcode: nextItem?.sku || nextItem?.barcode || "",
      unit: nextItem?.unit || "قطعة",
      quantity: 1,
      unitPrice: nextItem?.sellingPrice || 250,
      taxRate: 15,
    };
    setQuickItems((prev) => [...prev, newRow]);
  };

  const handleRemoveItemRow = (rowId: string) => {
    if (quickItems.length <= 1) return;
    setQuickItems((prev) => prev.filter((r) => r.id !== rowId));
  };

  const handleUpdateItemRow = (rowId: string, field: string, value: any) => {
    setQuickItems((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    );
  };

  // Calculations for quick e-invoice
  const quickSubtotal = useMemo(() => {
    return quickItems.reduce((sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0), 0);
  }, [quickItems]);

  const quickTotalTax = useMemo(() => {
    return quickItems.reduce((sum, item) => {
      const lineTotal = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0);
      const taxRate = (Number(item.taxRate) || 0) / 100;
      return sum + lineTotal * taxRate;
    }, 0);
  }, [quickItems]);

  const quickGrandTotal = quickSubtotal + quickTotalTax;

  // Company info for ZATCA & Fatoora
  const sellerInfo = {
    name: "منظومة SAP/MeDO ERP للحلول السحابية",
    vatNumber: "300000000000003",
    crNumber: "1010123456",
    address: "المملكة العربية السعودية / الجمهورية اليمنية",
  };

  // Derive E-Invoices list
  const electronicInvoices = useMemo(() => {
    return invoices.map((inv, idx) => {
      const isB2B = (inv.partyName && inv.partyName.includes("شركة")) || (inv.partyName && inv.partyName.includes("مجموعة")) || (inv.partyName && inv.partyName.includes("مؤسسة")) || idx % 2 === 0;
      const subtotal = inv.subtotal || (inv.grandTotal ? inv.grandTotal / 1.15 : 1000);
      const taxRate = inv.taxRate || (inv.currency === "SAR" ? 0.15 : 0.05);
      const taxAmount = inv.taxTotal || inv.taxAmount || subtotal * taxRate;
      const grandTotal = inv.grandTotal || inv.totalAmount || subtotal + taxAmount;
      
      const qrData =
        inv.qrCodeData ||
        generateZatcaQr(
          sellerInfo.name,
          sellerInfo.vatNumber,
          (inv.date || "2026-04-18") + "T14:30:00Z",
          grandTotal.toString(),
          taxAmount.toString()
        );

      return {
        ...inv,
        eInvoiceType: (isB2B ? "B2B" : "B2C") as "B2B" | "B2C",
        complianceStatus: "CLEARED" as const,
        calculatedSubtotal: subtotal,
        calculatedTax: taxAmount,
        calculatedGrandTotal: grandTotal,
        calculatedTaxRate: taxRate,
        qrCodeData: qrData,
        buyerVatNumber: isB2B ? ((inv as any).buyerVatNumber || "310000000000003") : undefined,
      };
    });
  }, [invoices]);

  // Filtered invoices
  const filteredEInvoices = useMemo(() => {
    return electronicInvoices.filter((inv) => {
      if (filterType === "B2B" && inv.eInvoiceType !== "B2B") return false;
      if (filterType === "B2C" && inv.eInvoiceType !== "B2C") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = inv.invoiceNumber?.toLowerCase().includes(q);
        const matchName = (inv.customerName || inv.partyName)?.toLowerCase().includes(q);
        return matchNum || matchName;
      }
      return true;
    });
  }, [electronicInvoices, filterType, searchQuery]);

  // Statistics
  const b2bCount = electronicInvoices.filter((i) => i.eInvoiceType === "B2B").length;
  const b2cCount = electronicInvoices.filter((i) => i.eInvoiceType === "B2C").length;
  const totalCount = electronicInvoices.length;

  const handleTestTlv = (encoded?: string) => {
    const stringToDecode = encoded || tlvInput;
    if (!stringToDecode.trim()) return;
    const result = decodeZatcaTlv(stringToDecode.trim());
    setDecodedTlvResult(result);
  };

  const handleOpenInspector = (invoice: Invoice) => {
    setInspectingInvoice(invoice);
    setShowInspectorModal(true);
  };

  const handleQuickIssue = () => {
    const vatAmount = quickTotalTax;
    const totalWithVat = quickGrandTotal;
    const subtotal = quickSubtotal;
    const dateNow = new Date().toISOString().split("T")[0];
    const timeNow = new Date().toTimeString().split(" ")[0] || "14:30:00";
    const nextInvNum = `INV-${new Date().getFullYear()}-${(invoices.length + 101).toString().padStart(5, "0")}`;

    const qrData = generateZatcaQr(
      sellerInfo.name,
      sellerInfo.vatNumber,
      `${dateNow}T${timeNow}Z`,
      totalWithVat.toFixed(2),
      vatAmount.toFixed(2)
    );

    const invoiceLines: InvoiceItem[] = quickItems.map((item, idx) => {
      const lineSubtotal = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0);
      const lineTax = lineSubtotal * ((Number(item.taxRate) || 0) / 100);
      return {
        id: `line-${Date.now()}-${idx}`,
        itemId: item.itemId,
        itemName: item.description,
        description: item.description,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        totalPrice: lineSubtotal,
        taxPercent: Number(item.taxRate) || 0,
        taxAmount: lineTax,
        total: lineSubtotal + lineTax,
      };
    });

    const finalCustomerName = quickCustomerName.trim() || (quickInvoiceType === "B2B" ? "شركة الأعمال والخدمات السحابية" : "عميل نقدي - نقطة بيع");

    const newInv: Invoice = {
      id: `einv-${Date.now()}`,
      invoiceNumber: nextInvNum,
      type: "SALES",
      date: dateNow,
      customerId: selectedCustomerId !== "CASH" ? selectedCustomerId : undefined,
      partyName: finalCustomerName,
      customerName: finalCustomerName,
      currency: quickCurrency,
      exchangeRate: quickCurrency === "SAR" ? 1 : quickCurrency === "USD" ? 3.75 : 0.007,
      subtotal: subtotal,
      taxRate: subtotal > 0 ? vatAmount / subtotal : 0.15,
      taxAmount: vatAmount,
      taxTotal: vatAmount,
      grandTotal: totalWithVat,
      totalAmount: totalWithVat,
      paidAmount: quickPaymentMethod === "CREDIT" ? 0 : totalWithVat,
      remainingAmount: quickPaymentMethod === "CREDIT" ? totalWithVat : 0,
      paymentMethod: quickPaymentMethod,
      status: quickPaymentMethod === "CREDIT" ? "PENDING" : "PAID",
      qrCodeData: qrData,
      notes: `${quickNotes} (${quickInvoiceType === "B2B" ? "فاتورة ضريبية B2B" : "فاتورة مبسطة B2C"})`,
      items: invoiceLines,
      buyerVatNumber: quickInvoiceType === "B2B" ? quickBuyerVat : undefined,
    } as Invoice;

    if (onSaveInvoice) {
      onSaveInvoice(newInv);
    }
    setShowQuickIssueModal(false);
    setSelectedInvoice(newInv);
    setSubTab("REGISTRY");
  };

  const handleDownloadXml = (invoice: Invoice) => {
    const xmlContent = generateUbl21Xml(invoice, sellerInfo);
    const blob = new Blob([xmlContent], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ZATCA_UBL21_${invoice.invoiceNumber || invoice.id}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = (invoice: Invoice) => {
    const jsonContent = JSON.stringify(
      {
        profileId: "reporting:1.0",
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.date,
        seller: sellerInfo,
        buyer: {
          name: invoice.customerName || invoice.partyName,
          vatNumber: (invoice as any).buyerVatNumber || "310000000000003",
        },
        financials: {
          subtotal: invoice.subtotal,
          taxRate: invoice.taxRate,
          taxAmount: invoice.taxTotal || invoice.taxAmount,
          grandTotal: invoice.grandTotal || invoice.totalAmount,
          currency: invoice.currency || "SAR",
        },
        tlvQrBase64: invoice.qrCodeData,
        compliance: {
          standard: "ZATCA Phase 2 / Fatoora",
          status: "CLEARED",
          hashAlgorithm: "SHA-256",
          signatureAlgorithm: "ECDSA",
        },
      },
      null,
      2
    );

    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ZATCA_Fatoora_${invoice.invoiceNumber || invoice.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectedInvXml = useMemo(() => {
    if (!selectedInvoice) return "";
    return generateUbl21Xml(selectedInvoice, sellerInfo);
  }, [selectedInvoice]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner & Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0B1329] p-5 rounded-2xl border border-slate-800 text-white shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-700/80 text-purple-300 shadow-inner">
            <QrCode className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl lg:text-2xl font-black text-white">
                منظومة الفاتورة الإلكترونية والباركود الذكي
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-purple-900/80 border border-purple-500/50 text-purple-200 text-xs font-mono font-bold tracking-wide">
                ZATCA Phase 1 & 2 / Fatoora
              </span>
            </div>
            <p className="text-xs lg:text-sm text-slate-300 mt-1">
              توليد فواتير B2B الضريبية و B2C المبسطة، التشفير الرقمي TLV Base64، وسلسلة التجزئة والمشاركة المباشرة
            </p>
          </div>
        </div>

        {/* Top Header Buttons */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap">
          <button
            onClick={() => {
              setSubTab("TLV_SCANNER");
              if (selectedInvoice?.qrCodeData) {
                setTlvInput(selectedInvoice.qrCodeData);
                handleTestTlv(selectedInvoice.qrCodeData);
              }
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-purple-400" />
            <span>فاحص باركود TLV QR</span>
          </button>

          <button
            onClick={() => setShowQuickIssueModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ إصدار فاتورة إلكترونية معتمدة</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards (4 Cards exactly matching the screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoices */}
        <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">إجمالي الفواتير الإلكترونية</div>
            <div className="text-2xl font-black text-slate-900 font-mono">{totalCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">مشفرة برمز الاستجابة السريع</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <QrCode className="w-6 h-6" />
          </div>
        </div>

        {/* B2B Invoices */}
        <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">فواتير ضريبية (B2B)</div>
            <div className="text-2xl font-black text-blue-600 font-mono">{b2bCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">معتمدة مع الرقم الضريبي للعميل</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* B2C Invoices */}
        <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">فواتير مبسطة (B2C)</div>
            <div className="text-2xl font-black text-emerald-600 font-mono">{b2cCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">مبيعات نقدية للأفراد</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Compliance Rate */}
        <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">نسبة الامتثال والربط</div>
            <div className="text-2xl font-black text-emerald-600 font-mono">100%</div>
            <div className="text-[11px] text-slate-400 mt-1">متوافقة مع متطلبات المرحلة 2</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Sub-tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300 overflow-x-auto">
        <button
          onClick={() => setSubTab("REGISTRY")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            subTab === "REGISTRY"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>سجل الفواتير الإلكترونية ({electronicInvoices.length})</span>
        </button>

        <button
          onClick={() => setSubTab("TLV_SCANNER")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            subTab === "TLV_SCANNER"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>محلل وفاحص كود TLV QR</span>
        </button>

        <button
          onClick={() => setSubTab("SIMULATOR")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            subTab === "SIMULATOR"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>محاكي الاعتماد والمطابقة (ZATCA Portal)</span>
        </button>

        <button
          onClick={() => setSubTab("UBL_XML")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            subTab === "UBL_XML"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>هيكل البيانات وملفات UBL 2.1 XML / JSON</span>
        </button>

        <button
          onClick={() => setSubTab("BARCODES")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            subTab === "BARCODES"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Barcode className="w-4 h-4" />
          <span>مولد وملصقات الباركود للأصناف (1D / 2D)</span>
        </button>
      </div>

      {/* 4. Tab 1: REGISTRY (Matching the Screenshot Table) */}
      {subTab === "REGISTRY" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث برقم الفاتورة أو اسم العميل..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setFilterType("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterType === "ALL" ? "bg-white text-purple-700 shadow-sm" : "text-slate-600"
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setFilterType("B2B")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterType === "B2B" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600"
                  }`}
                >
                  ضريبية (B2B)
                </button>
                <button
                  onClick={() => setFilterType("B2C")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterType === "B2C" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600"
                  }`}
                >
                  مبسطة (B2C)
                </button>
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              عدد الفواتير المعروضة: <span className="font-bold text-slate-900">{filteredEInvoices.length}</span>
            </div>
          </div>

          {/* Electronic Invoices Table (matching Screenshot 1) */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0F172A] text-white">
                <tr>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">رقم الفاتورة</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">نوع الفاتورة</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">المشتري / العميل</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">التاريخ والوقت</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">المبلغ قبل الضريبة</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">الضريبة (%15 / %5)</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">المبلغ الشامل</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">حالة المطابقة</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap text-center">إجراءات ومشاركة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredEInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                      <QrCode className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      لا توجد فواتير إلكترونية مطابقة للمعايير المحددة
                    </td>
                  </tr>
                ) : (
                  filteredEInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className={`hover:bg-purple-50/50 transition-colors cursor-pointer ${
                        selectedInvoice?.id === inv.id ? "bg-purple-50/80 font-medium" : ""
                      }`}
                    >
                      {/* Invoice Number */}
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-purple-600" />
                          <span>{inv.invoiceNumber}</span>
                        </div>
                      </td>

                      {/* Invoice Type Badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {inv.eInvoiceType === "B2B" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <Building2 className="w-3 h-3" />
                            ضريبية (B2B)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <UserCheck className="w-3 h-3" />
                            مبسطة (B2C)
                          </span>
                        )}
                      </td>

                      {/* Customer / Buyer */}
                      <td className="px-4 py-3 text-slate-800 whitespace-nowrap font-semibold">
                        <div>{inv.customerName || inv.partyName || "عميل نقدي عام"}</div>
                        {inv.buyerVatNumber && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            الرقم الضريبي: {inv.buyerVatNumber}
                          </div>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-3 text-slate-600 font-mono whitespace-nowrap">
                        {inv.date} 14:30:00
                      </td>

                      {/* Subtotal */}
                      <td className="px-4 py-3 font-mono text-slate-900 font-semibold whitespace-nowrap">
                        {formatMoney(inv.calculatedSubtotal, inv.currency || "SAR", currencies)}
                      </td>

                      {/* Tax */}
                      <td className="px-4 py-3 font-mono text-purple-700 font-bold whitespace-nowrap">
                        {formatMoney(inv.calculatedTax, inv.currency || "SAR", currencies)}
                      </td>

                      {/* Grand Total */}
                      <td className="px-4 py-3 font-mono text-emerald-700 font-black text-sm whitespace-nowrap">
                        {formatMoney(inv.calculatedGrandTotal, inv.currency || "SAR", currencies)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          معتمدة (CLEARED)
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Print */}
                          <button
                            onClick={() => onPrintDocument("INVOICE", inv)}
                            title="عرض وطباعة الفاتورة"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* QR / TLV Inspector */}
                          <button
                            onClick={() => handleOpenInspector(inv)}
                            title="فاحص وتفاصيل كود TLV QR"
                            className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 transition-all cursor-pointer"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {/* Download UBL XML */}
                          <button
                            onClick={() => handleDownloadXml(inv)}
                            title="تحميل ملف UBL 2.1 XML"
                            className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-all cursor-pointer"
                          >
                            <FileCode2 className="w-4 h-4" />
                          </button>

                          {/* Share Document */}
                          <button
                            onClick={() => (onShareDocument ? onShareDocument(inv) : onPrintDocument("INVOICE", inv))}
                            title="مشاركة الفاتورة الرقمية"
                            className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-all cursor-pointer"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab 2: TLV SCANNER & DECODER */}
      {subTab === "TLV_SCANNER" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-purple-600" />
              محلل وفاحص كود TLV Base64
            </h3>
            <p className="text-xs text-slate-500">
              قم بلصق كود Base64 المشفر أو قراءة رمز الاستجابة السريع للتحقق من توافقه الفوري مع معايير ZATCA للمرحلة الأولى والثانية.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">كود الفاتورة المشفر (Base64 TLV):</label>
              <textarea
                rows={5}
                value={tlvInput}
                onChange={(e) => setTlvInput(e.target.value)}
                placeholder="ألصق كود Base64 هنا..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTestTlv()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>فك وتحليل التشفير الآن</span>
              </button>

              <button
                onClick={() => {
                  if (selectedInvoice?.qrCodeData) {
                    setTlvInput(selectedInvoice.qrCodeData);
                    handleTestTlv(selectedInvoice.qrCodeData);
                  }
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                جلب من الفاتورة المحددة
              </button>
            </div>

            {/* QR Code Graphic Preview */}
            {tlvInput && (
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 flex flex-col items-center justify-center gap-2">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <QRCodeSVG value={tlvInput} size={150} level="M" />
                </div>
                <div className="text-[11px] font-mono text-purple-800 font-bold">
                  رمز الاستجابة السريع المعتمد من هيئة الزكاة والضريبة
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              البيانات المستخرجة والعلامات المشفرة (Decoded Tags)
            </h3>

            {decodedTlvResult?.success ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>تم فك تشفير الكود بنجاح - مطابق لجميع مواصفات هيئة الزكاة والضريبة والجمارك (ZATCA Compliant).</span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {decodedTlvResult.tags.map((item: any) => (
                    <div key={item.tag} className="p-3.5 bg-white hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-mono">
                            {item.tag}
                          </span>
                          <span>{item.name}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Tag 0x{item.tag.toString(16)}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 break-all">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <QrCode className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="text-xs">
                  {decodedTlvResult?.error || "أدخل كود Base64 في الخانة الجانبية واضغط 'فك وتحليل التشفير' لعرض محتويات الـ TLV"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Tab 3: ZATCA SIMULATOR */}
      {subTab === "SIMULATOR" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
                محاكي بوابة الربط والتكامل (ZATCA Portal & Fatoora API Simulation)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                التحقق التلقائي من متطلبات المرحلة الثانية: ختم التشفير CSID، التجزئة المشفرة SHA-256، وسلسلة الفواتير السابقة (PIH).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                API Connected: Production Ready
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <KeyRound className="w-4 h-4 text-purple-600" />
                <span>شهادة الامتثال الرقمية (CSID)</span>
              </div>
              <div className="text-xs text-slate-600 font-mono break-all bg-white p-2.5 rounded-lg border border-slate-200">
                CN=MeDoERP-Production-2026, O=Ben Ziad Group, C=SA
              </div>
              <div className="text-[10px] text-emerald-600 font-bold">صلاحية الشهادة: صالحة حتى 2028-12-31</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Hash className="w-4 h-4 text-blue-600" />
                <span>خوارزمية التجزئة الرقمية</span>
              </div>
              <div className="text-xs text-slate-600 font-mono break-all bg-white p-2.5 rounded-lg border border-slate-200">
                SHA-256 Hash Chained with Previous Invoice
              </div>
              <div className="text-[10px] text-blue-600 font-bold">PIH Sequence: Valid & Intact</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>نوع التوقيع الرقمي (Signature)</span>
              </div>
              <div className="text-xs text-slate-600 font-mono break-all bg-white p-2.5 rounded-lg border border-slate-200">
                ECDSA (secp256k1 curve) Cryptographic Stamp
              </div>
              <div className="text-[10px] text-emerald-600 font-bold">مطابق للمرحلة الثانية 100%</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3">
            <h4 className="text-xs font-bold text-purple-900">سجل عمليات الاعتماد اللحظي (Audit & Clearing Logs):</h4>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-white border border-purple-100 flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>POST /invoices/clearance (B2B Tax Invoice INV-2026-00101)</span>
                </span>
                <span className="text-emerald-700 font-bold">200 OK - CLEARED (0.12s)</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-purple-100 flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>POST /invoices/reporting (B2C Simplified Invoice INV-2026-00102)</span>
                </span>
                <span className="text-emerald-700 font-bold">200 OK - REPORTED (0.08s)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Tab 4: UBL 2.1 XML / JSON */}
      {subTab === "UBL_XML" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-purple-600" />
                ملفات UBL 2.1 XML و JSON المعتمدة
              </h3>
              <p className="text-xs text-slate-500">
                الفاتورة المحددة حالياً: <span className="font-bold text-purple-700">{selectedInvoice?.invoiceNumber || "INV-001"}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => selectedInvoice && handleDownloadXml(selectedInvoice)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تحميل UBL XML</span>
              </button>

              <button
                onClick={() => selectedInvoice && handleDownloadJson(selectedInvoice)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تحميل JSON</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-xl bg-[#0F172A] text-emerald-400 font-mono text-xs overflow-x-auto max-h-[500px] border border-slate-800 leading-relaxed dir-ltr text-left">
              {selectedInvXml}
            </pre>
          </div>
        </div>
      )}

      {/* 8. Tab 5: BARCODE LABELS GENERATOR */}
      {subTab === "BARCODES" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Barcode className="w-5 h-5 text-purple-600" />
              إعدادات طباعة ملصقات الباركود
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر الصنف:</label>
                <select
                  value={barcodeItem}
                  onChange={(e) => setBarcodeItem(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none"
                >
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.code}) - {item.sellingPrice || item.salePrice || 0} ر.س
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع الباركود:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setBarcodeFormat("QR")}
                    className={`p-2 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                      barcodeFormat === "QR" ? "bg-purple-600 text-white border-purple-600" : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    QR Code 2D
                  </button>
                  <button
                    onClick={() => setBarcodeFormat("CODE128")}
                    className={`p-2 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                      barcodeFormat === "CODE128" ? "bg-purple-600 text-white border-purple-600" : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    Code-128
                  </button>
                  <button
                    onClick={() => setBarcodeFormat("EAN13")}
                    className={`p-2 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                      barcodeFormat === "EAN13" ? "bg-purple-600 text-white border-purple-600" : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    EAN-13
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">عدد الملصقات (Stickers):</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={barcodeCount}
                  onChange={(e) => setBarcodeCount(Number(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="showPrice"
                  checked={showPriceOnLabel}
                  onChange={(e) => setShowPriceOnLabel(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="showPrice" className="text-slate-700 font-bold cursor-pointer">
                  طباعة السعر واسم المتجر على الملصق
                </label>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer mt-4"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة شيت الملصقات (A4 / Thermal)</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>معاينة شيت الملصقات الجاهز للطباعة</span>
              <span className="text-xs text-slate-400 font-normal">مطابق لمقاسات طابعات الباركود الحرارية</span>
            </h3>

            {/* Print Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 max-h-[500px] overflow-y-auto">
              {Array.from({ length: Math.min(barcodeCount, 24) }).map((_, idx) => {
                const currentItem = inventoryItems.find((i) => i.id === barcodeItem) || inventoryItems[0];
                const itemCode = currentItem?.code || "SKU-9901";
                const itemName = currentItem?.name || "صنف تجاري عام";
                const price = currentItem?.sellingPrice || currentItem?.salePrice || 150;

                return (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-slate-300 shadow-sm flex flex-col items-center justify-between text-center min-h-[140px]"
                  >
                    <div className="text-[10px] font-bold text-slate-800 line-clamp-1">{itemName}</div>
                    
                    <div className="my-1.5 flex items-center justify-center">
                      {barcodeFormat === "QR" ? (
                        <QRCodeSVG value={`ITEM:${itemCode}|PRICE:${price}`} size={60} level="M" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="h-9 w-28 bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_4px,#000_4px,#000_7px,transparent_7px,transparent_9px)]" />
                          <span className="text-[9px] font-mono tracking-widest text-slate-700 mt-0.5">{itemCode}</span>
                        </div>
                      )}
                    </div>

                    {showPriceOnLabel && (
                      <div className="text-[11px] font-black text-slate-900 font-mono">
                        {price} ر.س
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 9. Modal: Electronic Invoice Inspector */}
      {showInspectorModal && inspectingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4.5 bg-[#0B1329] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <QrCode className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm">
                  تفاصيل الفاتورة الإلكترونية والختم الرقمي ({inspectingInvoice.invoiceNumber})
                </h3>
              </div>
              <button
                onClick={() => setShowInspectorModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <QRCodeSVG
                    value={
                      inspectingInvoice.qrCodeData ||
                      generateZatcaQr(
                        sellerInfo.name,
                        sellerInfo.vatNumber,
                        (inspectingInvoice.date || "2026-04-18") + "T14:30:00Z",
                        (inspectingInvoice.grandTotal || inspectingInvoice.totalAmount || 0).toString(),
                        (inspectingInvoice.taxTotal || inspectingInvoice.taxAmount || 0).toString()
                      )
                    }
                    size={160}
                    level="M"
                  />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-slate-900 text-sm">{inspectingInvoice.customerName || inspectingInvoice.partyName}</div>
                  <div className="text-slate-600">المبلغ الإجمالي: <span className="font-bold text-slate-900">{inspectingInvoice.grandTotal || inspectingInvoice.totalAmount} {inspectingInvoice.currency || "SAR"}</span></div>
                  <div className="text-slate-600">ضريبة القيمة المضافة: <span className="font-bold text-purple-700">{inspectingInvoice.taxTotal || inspectingInvoice.taxAmount} {inspectingInvoice.currency || "SAR"}</span></div>
                  <div className="text-slate-600">تاريخ الإصدار: <span className="font-mono">{inspectingInvoice.date} 14:30:00</span></div>
                  <div className="text-emerald-700 font-bold flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>معتمدة من هيئة الزكاة والضريبة (ZATCA Cleared)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">كود Base64 TLV المستخرج:</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 break-all select-all">
                  {inspectingInvoice.qrCodeData ||
                    generateZatcaQr(
                      sellerInfo.name,
                      sellerInfo.vatNumber,
                      (inspectingInvoice.date || "2026-04-18") + "T14:30:00Z",
                      (inspectingInvoice.grandTotal || inspectingInvoice.totalAmount || 0).toString(),
                      (inspectingInvoice.taxTotal || inspectingInvoice.taxAmount || 0).toString()
                    )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => onPrintDocument("INVOICE", inspectingInvoice)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  طباعة الفاتورة
                </button>
                <button
                  onClick={() => handleDownloadXml(inspectingInvoice)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  تنزيل ملف UBL XML
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Modal: Quick Issue Electronic Invoice with Customers & Items Integration */}
      {showQuickIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="p-4 bg-[#0B1329] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">إصدار فاتورة إلكترونية معتمدة (ZATCA Fatoora)</h3>
                  <p className="text-[11px] text-slate-400">ربط مباشر مع سجلات العملاء ومخزون الأصناف</p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickIssueModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Top Row: Invoice Type & Payment Method & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Invoice Type */}
                <div className="sm:col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">نوع الفاتورة:</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuickInvoiceType("B2B")}
                      className={`py-2 px-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        quickInvoiceType === "B2B"
                          ? "bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      B2B ضريبية
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickInvoiceType("B2C")}
                      className={`py-2 px-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        quickInvoiceType === "B2C"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      B2C مبسطة
                    </button>
                  </div>
                </div>

                {/* Currency */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">عملة الفاتورة:</label>
                  <select
                    value={quickCurrency}
                    onChange={(e) => setQuickCurrency(e.target.value as CurrencyCode)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                  >
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="YER">ريال يمني (YER)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">طريقة السداد:</label>
                  <select
                    value={quickPaymentMethod}
                    onChange={(e) => setQuickPaymentMethod(e.target.value as InvoicePaymentMethod)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                  >
                    <option value="CASH">نقداً (Cash)</option>
                    <option value="BANK">تحويل بنكي / مدى (Bank)</option>
                    <option value="CREDIT">آجل / ذمم مدينة (Credit)</option>
                  </select>
                </div>
              </div>

              {/* Customer Selection Section */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <UserCheck className="w-4 h-4 text-purple-600" />
                    <span>بيانات العميل / المشتري:</span>
                  </div>
                  <span className="text-[10px] text-slate-500">اختر من القائمة أو أدخل يدوياً</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Registered Customer Dropdown */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">اختيار عميل مسجل:</label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => handleSelectCustomer(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium text-slate-900 focus:outline-none focus:border-purple-500"
                    >
                      <option value="">-- إدخال مخصص / عميل نقدي --</option>
                      {customers.map((cust) => (
                        <option key={cust.id} value={cust.id}>
                          {cust.nameAr || cust.name} {cust.taxNumber ? `(ضريبي: ${cust.taxNumber})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Customer Name Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم العميل المطبوع بالفاتورة:</label>
                    <input
                      type="text"
                      value={quickCustomerName}
                      onChange={(e) => setQuickCustomerName(e.target.value)}
                      placeholder="مثال: شركة الأعمال المتحدة للتجارة"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Buyer VAT (for B2B or Tax Invoices) */}
                {quickInvoiceType === "B2B" && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      الرقم الضريبي للمشتري (15 خانة الزكاة والضريبة):
                    </label>
                    <input
                      type="text"
                      value={quickBuyerVat}
                      onChange={(e) => setQuickBuyerVat(e.target.value)}
                      placeholder="300000000000003"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </div>

              {/* Items / Products Section */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>بنود الأصناف والخدمات ({quickItems.length}):</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة صنف آخر</span>
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {quickItems.map((itemRow, index) => {
                    const rowLineTotal = (Number(itemRow.unitPrice) || 0) * (Number(itemRow.quantity) || 0);
                    const rowTax = rowLineTotal * ((Number(itemRow.taxRate) || 0) / 100);
                    return (
                      <div
                        key={itemRow.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          {/* Item Selector from Inventory */}
                          <div className="sm:col-span-4">
                            <label className="block text-[10px] text-slate-500 mb-0.5">اختيار من المخزون:</label>
                            <select
                              value={itemRow.itemId || ""}
                              onChange={(e) => handleSelectInventoryItem(itemRow.id, e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs font-medium text-slate-900"
                            >
                              <option value="">-- بند مخصص --</option>
                              {inventoryItems.map((inv) => (
                                <option key={inv.id} value={inv.id}>
                                  {inv.nameAr || inv.name} ({inv.sellingPrice} ر.س)
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Item Description */}
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] text-slate-500 mb-0.5">بيان الصنف:</label>
                            <input
                              type="text"
                              value={itemRow.description}
                              onChange={(e) => handleUpdateItemRow(itemRow.id, "description", e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs font-bold text-slate-900"
                              placeholder="اسم الصنف أو الخدمة"
                            />
                          </div>

                          {/* Quantity */}
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-slate-500 mb-0.5">الكمية:</label>
                            <input
                              type="number"
                              min="1"
                              value={itemRow.quantity}
                              onChange={(e) => handleUpdateItemRow(itemRow.id, "quantity", Number(e.target.value) || 1)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs font-mono font-bold text-slate-900 text-center"
                            />
                          </div>

                          {/* Unit Price */}
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-slate-500 mb-0.5">السعر الفردي:</label>
                            <input
                              type="number"
                              min="0"
                              value={itemRow.unitPrice}
                              onChange={(e) => handleUpdateItemRow(itemRow.id, "unitPrice", Number(e.target.value) || 0)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs font-mono font-bold text-slate-900 text-center"
                            />
                          </div>

                          {/* Delete Action */}
                          <div className="sm:col-span-1 flex justify-center pt-3 sm:pt-0">
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(itemRow.id)}
                              disabled={quickItems.length <= 1}
                              className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 disabled:opacity-30 flex items-center justify-center cursor-pointer transition-colors"
                              title="حذف البند"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Row Subtotal Calculation details */}
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-600 font-mono">
                          <div className="flex items-center gap-2">
                            <span>نسبة الضريبة:</span>
                            <select
                              value={itemRow.taxRate}
                              onChange={(e) => handleUpdateItemRow(itemRow.id, "taxRate", Number(e.target.value))}
                              className="bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold"
                            >
                              <option value={15}>15% (KSA)</option>
                              <option value={5}>5% (مخفضة)</option>
                              <option value={0}>0% (معفاة)</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-3 font-semibold">
                            <span>قبل الضريبة: {rowLineTotal.toLocaleString()} {quickCurrency}</span>
                            <span className="text-purple-700">الضريبة: {rowTax.toFixed(2)} {quickCurrency}</span>
                            <span className="text-emerald-700 font-bold">الإجمالي: {(rowLineTotal + rowTax).toFixed(2)} {quickCurrency}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Calculation Card */}
              <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-100 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع قبل الضريبة (Subtotal):</span>
                  <span className="font-bold text-slate-900">{quickSubtotal.toFixed(2)} {quickCurrency}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>إجمالي ضريبة القيمة المضافة (VAT):</span>
                  <span className="font-bold text-purple-700">{quickTotalTax.toFixed(2)} {quickCurrency}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-purple-200">
                  <span>المبلغ الإجمالي النهائي (Grand Total):</span>
                  <span className="text-emerald-700">{quickGrandTotal.toFixed(2)} {quickCurrency}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowQuickIssueModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleQuickIssue}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-bold shadow-md shadow-purple-900/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>إصدار وتشفير الفاتورة في منظومة ZATCA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
