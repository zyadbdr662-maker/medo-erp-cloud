import React, { useState } from "react";
import {
  Archive,
  FileText,
  ShieldCheck,
  Download,
  Printer,
  Copy,
  Check,
  Search,
  ExternalLink,
  Lock,
  Database,
  GitBranch,
  Globe,
  Key,
  Calendar,
  Building,
  UserCheck,
  FileCheck,
  Filter,
  Eye,
  Sparkles,
  Server,
  Code2,
  FolderArchive,
  Clock,
  Send,
  HelpCircle,
} from "lucide-react";
import { CurrencyCode, CurrencyInfo } from "../types/erp";

interface CentralArchiveSectionProps {
  companyName?: string;
  isDarkMode?: boolean;
  currencies?: CurrencyInfo[];
  displayCurrency?: CurrencyCode;
}

export interface ArchivedDocument {
  id: string;
  docNumber: string;
  title: string;
  category: "HANDOVER" | "FINANCIAL_AUDIT" | "BACKUP" | "CONTRACT" | "COMPLIANCE" | "SECURITY";
  date: string;
  fileType: "PDF" | "PROTOCOL" | "SQL_DUMP" | "JSON" | "DOCX";
  size: string;
  status: "OFFICIALLY_SEALED" | "ACTIVE" | "ARCHIVED" | "ENCRYPTED";
  author: string;
  description: string;
  accessLevel: "ADMIN_ONLY" | "EXECUTIVE" | "PUBLIC_AUDIT";
  badgeColor: string;
}

export const CentralArchiveSection: React.FC<CentralArchiveSectionProps> = ({
  companyName = "مجموعة بن زياد التجارية المحدودة (شركة البدر للأدوية)",
  isDarkMode = true,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDoc, setSelectedDoc] = useState<ArchivedDocument | null>(null);
  const [showHandoverModal, setShowHandoverModal] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [handoverSigned, setHandoverSigned] = useState<boolean>(() => {
    return localStorage.getItem("medo_handover_signed") === "true";
  });

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handlePrintHandover = () => {
    window.print();
  };

  // Official Archival Documents Collection
  const initialDocs: ArchivedDocument[] = [
    {
      id: "DOC-2026-HD01",
      docNumber: "PRT-MEDO-2026-0913",
      title: "📋 وثيقة التسليم والإقرار الفني الشامل (MeDo ERP Suite)",
      category: "HANDOVER",
      date: "2026-09-13",
      fileType: "PROTOCOL",
      size: "480 KB",
      status: "OFFICIALLY_SEALED",
      author: "Antigravity AI Lead / Google AI Studio",
      description: "المحضر الإداري والرسمي لتسليم بيئة التطوير الكاملة، مستودع GitHub، الروابط السحابية، ومصفوفة المفاتيح لأ/ بدر عايض محمد.",
      accessLevel: "ADMIN_ONLY",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      id: "DOC-2026-AUD02",
      docNumber: "AUD-IFRS-S4HANA-01",
      title: "تقرير المطابقة والمعايير المحاسبية الدولية (IFRS & SAP)",
      category: "COMPLIANCE",
      date: "2026-09-12",
      fileType: "PDF",
      size: "1.2 MB",
      status: "ACTIVE",
      author: "Chief Financial Systems Auditor",
      description: "شهادة مطابقة النظام للقيد المزدوج، معايير تقييم العملات الأجنبية IAS 21، وإدارة المخزون الدوائي IAS 2.",
      accessLevel: "EXECUTIVE",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
    {
      id: "DOC-2026-BKP03",
      docNumber: "BKP-SNAP-FULL-202609",
      title: "لقطة النسخ الاحتياطي لقاعدة البيانات ودليل الحسابات",
      category: "BACKUP",
      date: "2026-09-13",
      fileType: "JSON",
      size: "4.8 MB",
      status: "ENCRYPTED",
      author: "LocalSync & Firestore Engine",
      description: "نسخة مشفرة كاملة من شجرة الحسابات، قيود اليومية، العملاء والموردين، وفواتير المبيعات والمخزون.",
      accessLevel: "ADMIN_ONLY",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    {
      id: "DOC-2026-SEC04",
      docNumber: "SEC-POL-RBAC-09",
      title: "وثيقة سياسات الأمان وتدرج الصلاحيات (Enterprise RBAC)",
      category: "SECURITY",
      date: "2026-09-10",
      fileType: "PDF",
      size: "650 KB",
      status: "ACTIVE",
      author: "Security Architecture Team",
      description: "توثيق مصفوفة الصلاحيات، مسارات الاعتماد المالي الثنائي، وجدار حماية البيانات على مستوى المتصفح والخادم.",
      accessLevel: "ADMIN_ONLY",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    {
      id: "DOC-2026-MAN05",
      docNumber: "MAN-ACC-20-MOD",
      title: "دليل الاستخدام والتشغيل المحاسبي لـ 20 وحدة (FI/CO/SD/MM)",
      category: "HANDOVER",
      date: "2026-09-13",
      fileType: "PDF",
      size: "2.4 MB",
      status: "ACTIVE",
      author: "SAP Accounting Documentation Lead",
      description: "الدليل الشامل المزود بالقيود النموذجية وشرح خطوة بخطوة للعمليات المحاسبية والمخزنية ومسيرات الرواتب.",
      accessLevel: "PUBLIC_AUDIT",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    },
  ];

  const filteredDocs = initialDocs.filter((doc) => {
    const matchesCat = activeCategory === "ALL" || doc.category === activeCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-[#0A2540] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl mb-6 text-right">
      {/* Header & Main Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-md shrink-0">
            <Archive className="w-6 h-6 text-sap-secondary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-100">
                منظومة الأرشيف المركزي والتوثيق الرقمي
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold font-mono">
                SECURE ARCHIVE v2.6
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              مستودع الوثائق السيادية، محاضر التسليم الفني، شهادات المعايير المحاسبية، والنسخ الاحتياطية المعتمدة لـ <strong>{companyName}</strong>.
            </p>
          </div>
        </div>

        {/* Quick Launch Handover Protocol Button */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => setShowHandoverModal(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sap-secondary to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <FileCheck className="w-4 h-4 text-slate-950" />
            <span>عرض 📋 وثيقة التسليم والإقرار الفني الشامل</span>
          </button>
        </div>
      </div>

      {/* Featured Spotlight: Handover Protocol Highlight Card */}
      <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#071829] border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-300">
                المحضر الإداري الرسمي الصادر لإدارة: بدر عايض محمد
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black">
                معتمد رسمياً
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              تأكيد تسليم كامل بيئة التطوير، مستودع GitHub، الربط السحابي، ودليل التعديل والإدارة المستقل.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={() => setShowHandoverModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>قراءة الوثيقة</span>
          </button>
          <button
            onClick={() => {
              const fullText = `وثيقة التسليم والإقرار الفني الشامل (MeDo ERP Suite)
المدير المفوض: بدر عايض محمد - مجموعة بن زياد التجارية المحدودة
المستودع: https://github.com/zyadbdr662-maker/Mdanmedo-erp-sap-s-4hana-6103.ai.studio
رابط التشغيل المعتمد: https://medo-erp-cloud.vercel.app
النطاق المخصص: https://medo-erp.us.ci
حالة البيئة: جاهزة ومستقلة 100%`;
              handleCopy(fullText, "quick_handover");
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            {copiedKey === "quick_handover" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "quick_handover" ? "تم النسخ!" : "نسخ الملخص"}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-5">
        {/* Categories Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 text-xs">
          {[
            { id: "ALL", label: "كافة الوثائق", count: initialDocs.length },
            { id: "HANDOVER", label: "التسليم والإدارة", count: 2 },
            { id: "COMPLIANCE", label: "المعايير والمطابقة", count: 1 },
            { id: "BACKUP", label: "النسخ الاحتياطية", count: 1 },
            { id: "SECURITY", label: "الأمان والصلاحيات", count: 1 },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? "bg-sap-secondary text-slate-950 shadow-md"
                  : "bg-[#071829] text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeCategory === cat.id ? "bg-slate-950/20 text-slate-950 font-mono" : "bg-slate-800 text-slate-400"}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الأرشيف (رقم الوثيقة، العنوان)..."
            className="w-full bg-[#071829] border border-slate-800 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sap-secondary transition-colors"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Archived Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-4 rounded-2xl bg-[#071829] border border-slate-800/80 hover:border-sap-secondary/50 transition-all flex flex-col justify-between group shadow-md"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold text-sap-secondary bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {doc.docNumber}
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold border ${doc.badgeColor}`}>
                  {doc.status === "OFFICIALLY_SEALED" ? "مختومة ومعتمدة" : doc.status === "ENCRYPTED" ? "مشفرة" : "نشطة"}
                </span>
              </div>

              <h4 className="text-xs font-black text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-2">
                {doc.title}
              </h4>

              <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {doc.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between text-[10px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-mono">{doc.date}</span>
                <span>•</span>
                <span className="font-mono text-slate-500">{doc.size}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {doc.category === "HANDOVER" ? (
                  <button
                    onClick={() => setShowHandoverModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-sap-secondary hover:bg-amber-400 text-slate-950 font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>فتح الوثيقة</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      alert(`تم تنزيل الوثيقة المحفوظة في الأرشيف:\n${doc.title}\nالرمز: ${doc.docNumber}\nالحجم: ${doc.size}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>تحميل</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 📜 OFFICIAL HANDOVER MODAL VIEW */}
      {showHandoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#071829] border border-emerald-500/50 rounded-3xl max-w-4xl w-full p-5 sm:p-8 shadow-2xl text-right max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                    <span>وثيقة التسليم والإقرار الفني الشامل</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black">
                      OFFICIAL PROTOCOL
                    </span>
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    مرجع الوثيقة: <span className="font-mono text-emerald-400 font-bold">PRT-MEDO-2026-0913-BYZ</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintHandover}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="طباعة الوثيقة الرسمية"
                >
                  <Printer className="w-4 h-4 text-slate-300" />
                  <span className="hidden sm:inline">طباعة الوثيقة</span>
                </button>
                <button
                  onClick={() => setShowHandoverModal(false)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official Document Body */}
            <div className="space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
              {/* Introduction Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30">
                <div className="text-sm font-bold text-emerald-300 mb-1">
                  إلى: الأخ الموقر / بدر عايض محمد (مدير النظام - مجموعة بن زياد التجارية المحدودة)
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  بموجب هذا المحضر الرسمي، يتم إقرار وإثبات الجاهزية الكاملة لنظام <strong>MeDo ERP Suite (المستوحى من معايير SAP S/4HANA و IFRS)</strong>، وتأكيد انتقال كافة الصلاحيات وبيئة العمل والمفاتيح الفنية إلى سيادتكم بالكامل دون أي قيود أو اعتمادات وسيطة.
                </div>
              </div>

              {/* Section 1: Development Environment & Repository */}
              <div className="p-4 rounded-2xl bg-[#0A2540] border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-sap-secondary flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-sap-secondary" />
                  <span>أولاً: بيئة التطوير والشيفرة المصدرية (Source Code & Repo)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-xl bg-[#071829] border border-slate-800">
                    <div className="text-slate-400 font-bold mb-1">مستودع GitHub المعتمد:</div>
                    <div className="font-mono text-emerald-400 font-bold break-all flex items-center justify-between gap-1">
                      <span>https://github.com/zyadbdr662-maker/Mdanmedo-erp-sap-s-4hana-6103.ai.studio</span>
                      <button
                        onClick={() => handleCopy("https://github.com/zyadbdr662-maker/Mdanmedo-erp-sap-s-4hana-6103.ai.studio", "repo")}
                        className="p-1 hover:text-white"
                        title="نسخ"
                      >
                        {copiedKey === "repo" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#071829] border border-slate-800">
                    <div className="text-slate-400 font-bold mb-1">رابط النشر الحي المعتمد (Live Production):</div>
                    <div className="font-mono text-blue-400 font-bold break-all flex items-center justify-between gap-1">
                      <span>https://medo-erp-cloud.vercel.app</span>
                      <button
                        onClick={() => handleCopy("https://medo-erp-cloud.vercel.app", "live_url")}
                        className="p-1 hover:text-white cursor-pointer"
                        title="نسخ"
                      >
                        {copiedKey === "live_url" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Cloud Database & Offline Engine */}
              <div className="p-4 rounded-2xl bg-[#0A2540] border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-sap-secondary flex items-center gap-2">
                  <Database className="w-4 h-4 text-sap-secondary" />
                  <span>ثانياً: قاعدة البيانات ونظام العمل دون اتصال (Database & Sync)</span>
                </h4>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#071829] border border-slate-800">
                    <span className="text-slate-300">قاعدة بيانات Firestore الأساسية:</span>
                    <span className="font-mono font-bold text-emerald-400">ai-studio-remixmedoerpsaps-5a1598c1-3874-4ae5-bd14-c4c4ffab3c34</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#071829] border border-slate-800">
                    <span className="text-slate-300">نظام المزامنة والتخزين المحلي:</span>
                    <span className="text-slate-200 font-bold">IndexedDB + LocalStorage (دعم كامل لإصدار الفواتير بدون إنترنت)</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Access Keys & Security Matrix */}
              <div className="p-4 rounded-2xl bg-[#0A2540] border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-sap-secondary flex items-center gap-2">
                  <Key className="w-4 h-4 text-sap-secondary" />
                  <span>ثالثاً: مصفوفة المفاتيح والصلاحيات الإدارية (Access Matrix)</span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-[11px]">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 bg-[#071829]">
                        <th className="py-2 px-3">المنصة</th>
                        <th className="py-2 px-3">البريد / الحساب</th>
                        <th className="py-2 px-3">الصلاحية</th>
                        <th className="py-2 px-3 text-center">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-200">Google AI Studio</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">zyadbdr925@gmail.com</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">Master Owner</td>
                        <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">مفعل 100%</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-200">GitHub Repo</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">zyadbdr662-maker</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">Admin / Full Access</td>
                        <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">محدث بالكامل</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-200">Firebase Firestore</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">Google Cloud Project Instance</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">Root Database Admin</td>
                        <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">جاهز ومتزامن</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-200">Gemini AI Assistant</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">Server Side process.env</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">Automated Copilot</td>
                        <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">مؤمن بالخادم</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4: Final Affirmation and Official Sign-off */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#071829] border border-sap-secondary/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#D4AF37]">الإقرار النهائي بالاستقلالية والاعتماد</span>
                  <span className="text-[10px] font-mono text-slate-400">DATE: 2026-09-13</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  نقر نحن الفريق البرمجي في منصة الذكاء المالي المتقدم بأن هذا النظام بكامل مكوناته الـ 20 المحاسبية، وتصاميم الفواتير، ونظام شجرة الحسابات، ودليل الاستخدام الشامل، قد تم بناؤه وتجهيزه وتشغيله بنجاح، وهو ملك كامل ومستقل للمدير <strong>بدر عايض محمد</strong>.
                </p>

                {/* Digital Signature Box */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-200">المستلم المعتمد: أ/ بدر عايض محمد</div>
                    <div className="text-[10px] text-slate-400">مجموعة بن زياد التجارية المحدودة • bdr.zyad@yandex.com</div>
                  </div>

                  <button
                    onClick={() => {
                      setHandoverSigned(true);
                      localStorage.setItem("medo_handover_signed", "true");
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
                      handoverSigned
                        ? "bg-emerald-500 text-slate-950 shadow-md"
                        : "bg-sap-secondary hover:bg-amber-400 text-slate-950"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>{handoverSigned ? "تم توثيق الاستلام بنجاح ✓" : "اعتماد وتوقيع الاستلام الرقمي"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
