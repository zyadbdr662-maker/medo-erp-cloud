import React, { useState, useEffect } from "react";
import {
  Scale,
  ShieldCheck,
  Building2,
  FileText,
  Search,
  Printer,
  Copy,
  Check,
  Download,
  ArrowRight,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Layers,
  Lock,
  Zap,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  Info,
  AlertTriangle,
  RotateCcw,
  Cookie
} from "lucide-react";
import { TermsOfServiceDocument } from "./TermsOfServiceDocument";
import { PrivacyPolicyDocument } from "./PrivacyPolicyDocument";
import { DisclaimerDocument } from "./DisclaimerDocument";
import { RefundPolicyDocument } from "./RefundPolicyDocument";
import { CookiesPolicyDocument } from "./CookiesPolicyDocument";
import { DpaPolicyDocument } from "./DpaPolicyDocument";
import { SlaPolicyDocument } from "./SlaPolicyDocument";
import { SubscriptionContractDocument } from "./SubscriptionContractDocument";
import { UserManualDocument } from "./UserManualDocument";
import { SystemFooter } from "./SystemFooter";

interface LegalDocumentsPageProps {
  onBack?: () => void;
  initialDoc?: "TERMS" | "PRIVACY" | "DISCLAIMER" | "REFUND" | "COOKIES" | "DPA" | "SLA" | "CONTRACT" | "MANUAL";
}

export const LegalDocumentsPage: React.FC<LegalDocumentsPageProps> = ({
  onBack,
  initialDoc = "TERMS",
}) => {
  const [activeDoc, setActiveDoc] = useState<"TERMS" | "PRIVACY" | "DISCLAIMER" | "REFUND" | "COOKIES" | "DPA" | "SLA" | "CONTRACT" | "MANUAL">(initialDoc);
  const [activeArticleId, setActiveArticleId] = useState<string>("art-1");
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Monitor scroll for back-to-top
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToArticle = (id: string) => {
    setActiveArticleId(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // offset for fixed headers
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Article groupings for Terms of Service (20 Articles)
  const termsCategories = [
    {
      category: "الأحكام العامة والتعريفات",
      items: [
        { id: "art-1", num: 1, title: "التعريفات والمصطلحات" },
        { id: "art-2", num: 2, title: "قبول الشروط والأهلية" },
      ],
    },
    {
      category: "الحسابات والباقات والاشتراك",
      items: [
        { id: "art-3", num: 3, title: "التسجيل وتأكيد الحساب" },
        { id: "art-4", num: 4, title: "الاشتراك والأسعار والدفع" },
      ],
    },
    {
      category: "ضوابط الاستخدام والبيانات",
      items: [
        { id: "art-5", num: 5, title: "الاستخدام المسموح والمحظور" },
        { id: "art-6", num: 6, title: "ملكية المحتوى والبيانات" },
        { id: "art-7", num: 7, title: "الخصوصية وحماية البيانات" },
        { id: "art-8", num: 8, title: "حقوق الملكية الفكرية" },
      ],
    },
    {
      category: "الخدمة والذكاء المالي المتقدم",
      items: [
        { id: "art-9", num: 9, title: "الدعم الفني والصيانة" },
        { id: "art-10", num: 10, title: "مستويات الخدمة (SLA)" },
        { id: "art-11", num: 11, title: "سياسات الذكاء المالي المتقدم" },
        { id: "art-12", num: 12, title: "النسخ الاحتياطي والاستعادة" },
        { id: "art-13", num: 13, title: "الأمان والحماية المتقدمة" },
      ],
    },
    {
      category: "المسؤوليات وإنهاء الخدمة والنزاعات",
      items: [
        { id: "art-14", num: 14, title: "حدود المسؤولية المالية" },
        { id: "art-15", num: 15, title: "التعويض والمساءلة" },
        { id: "art-16", num: 16, title: "إنهاء الخدمة وحذف الحساب" },
        { id: "art-17", num: 17, title: "القوة القاهرة والظروف الطارئة" },
        { id: "art-18", num: 18, title: "حل النزاعات والقانون المعمول به" },
        { id: "art-19", num: 19, title: "أحكام عامة وإخطارات" },
        { id: "art-20", num: 20, title: "التواصل والقنوات المعتمدة" },
      ],
    },
  ];

  // Article groupings for Privacy Policy (15 Articles)
  const privacyCategories = [
    {
      category: "التعريفات والمبادئ",
      items: [
        { id: "priv-art-1", num: 1, title: "التعريفات والمصطلحات" },
        { id: "priv-art-2", num: 2, title: "المعلومات التي نجمعها" },
        { id: "priv-art-3", num: 3, title: "كيف نجمع المعلومات" },
      ],
    },
    {
      category: "المعالجة والأسس القانونية",
      items: [
        { id: "priv-art-4", num: 4, title: "لماذا نجمع البيانات" },
        { id: "priv-art-5", num: 5, title: "الأساس القانوني للمعالجة" },
        { id: "priv-art-6", num: 6, title: "عناصر التحكم وحقوقك (GDPR)" },
      ],
    },
    {
      category: "الأمان والمشاركة والاحتفاظ",
      items: [
        { id: "priv-art-7", num: 7, title: "مشاركة المعلومات وحدودها" },
        { id: "priv-art-8", num: 8, title: "حماية المعلومات والأمن" },
        { id: "priv-art-9", num: 9, title: "مدة الاحتفاظ بالبيانات (7 سنوات)" },
        { id: "priv-art-10", num: 10, title: "نقل البيانات والخوادم" },
      ],
    },
    {
      category: "الكوكيز والامتثال الخاص",
      items: [
        { id: "priv-art-11", num: 11, title: "ملفات تعريف الارتباط (Cookies)" },
        { id: "priv-art-12", num: 12, title: "خصوصية الأطفال والقُصَّر" },
        { id: "priv-art-13", num: 13, title: "الإشعار عند الاختراق (72 ساعة)" },
        { id: "priv-art-14", num: 14, title: "الإشعارات والتحديثات" },
        { id: "priv-art-15", num: 15, title: "التواصل ومسؤول الحماية (DPO)" },
      ],
    },
  ];

  // Article groupings for Disclaimer (14 Articles)
  const disclaimerCategories = [
    {
      category: "الأحكام العامة وتقديم الخدمة",
      items: [
        { id: "disc-art-1", num: 1, title: "التعريفات والمصطلحات" },
        { id: "disc-art-2", num: 2, title: "تقديم الخدمة كما هي (As Is)" },
      ],
    },
    {
      category: "المحاسبة وسعر الصرف والذكاء المالي المتقدم",
      items: [
        { id: "disc-art-3", num: 3, title: "دقة البيانات والمدخلات المحاسبية" },
        { id: "disc-art-4", num: 4, title: "سعر الصرف وفروق العملات" },
        { id: "disc-art-5", num: 5, title: "قائمة التدفقات النقدية" },
        { id: "disc-art-6", num: 6, title: "الذكاء المالي المتقدم (Gemini AI)" },
      ],
    },
    {
      category: "الامتثال والأعطال والخسائر",
      items: [
        { id: "disc-art-7", num: 7, title: "الامتثال الضريبي والزكوي" },
        { id: "disc-art-8", num: 8, title: "الأخطاء والانقطاعات التقنية" },
        { id: "disc-art-9", num: 9, title: "الخسائر غير المباشرة والتبعية" },
      ],
    },
    {
      category: "المسؤوليات والتعويض والقضاء",
      items: [
        { id: "disc-art-10", num: 10, title: "مسؤوليات المستخدم والحماية" },
        { id: "disc-art-11", num: 11, title: "حدود التعويض القصوى" },
        { id: "disc-art-12", num: 12, title: "الاستثناءات والحقوق النظامية" },
        { id: "disc-art-13", num: 13, title: "القانون المعمول به والنزاعات" },
        { id: "disc-art-14", num: 14, title: "قنوات التواصل الرسمية" },
      ],
    },
  ];

  // Article groupings for Refund Policy (12 Articles)
  const refundCategories = [
    {
      category: "الأحكام العامة والمبادئ",
      items: [
        { id: "ref-art-1", num: 1, title: "التعريفات والمصطلحات" },
        { id: "ref-art-2", num: 2, title: "المبادئ العامة لسياسة الاسترداد" },
        { id: "ref-art-3", num: 3, title: "فترة التجربة المجانية (30 يوماً)" },
      ],
    },
    {
      category: "حالات الاسترداد الكامل والجزئي",
      items: [
        { id: "ref-art-4", num: 4, title: "حالات الاسترداد الكامل (100%)" },
        { id: "ref-art-5", num: 5, title: "حالات الاسترداد الجزئي (50% - 80%)" },
      ],
    },
    {
      category: "حالات عدم الاسترداد وإجراءات الطلب",
      items: [
        { id: "ref-art-6", num: 6, title: "حالات عدم الاسترداد (8 حالات)" },
        { id: "ref-art-7", num: 7, title: "آلية تقديم طلب الاسترداد" },
        { id: "ref-art-8", num: 8, title: "مدة معالجة الطلب (29 يوم عمل)" },
      ],
    },
    {
      category: "السداد والاستثناءات والقضاء",
      items: [
        { id: "ref-art-9", num: 9, title: "طرق وقنوات سداد الاسترداد" },
        { id: "ref-art-10", num: 10, title: "الاستثناءات والحالات الخاصة" },
        { id: "ref-art-11", num: 11, title: "القانون المعمول به والنزاعات" },
        { id: "ref-art-12", num: 12, title: "قنوات التواصل والإشعارات" },
      ],
    },
  ];

  // Article groupings for Cookies Policy (13 Articles)
  const cookiesCategories = [
    {
      category: "المفاهيم وآليات العمل الأساسية",
      items: [
        { id: "cookie-art-1", num: 1, title: "التعريفات والمصطلحات" },
        { id: "cookie-art-2", num: 2, title: "ما هي ملفات تعريف الارتباط؟" },
        { id: "cookie-art-3", num: 3, title: "أنواع الملفات وقواعد الموافقة" },
      ],
    },
    {
      category: "الفئات الأربع للملفات بالتفصيل",
      items: [
        { id: "cookie-art-4", num: 4, title: "الملفات الضرورية (Strictly Necessary)" },
        { id: "cookie-art-5", num: 5, title: "الملفات الوظيفية (Functional)" },
        { id: "cookie-art-6", num: 6, title: "الملفات التحليلية (Analytics)" },
        { id: "cookie-art-7", num: 7, title: "الملفات التسويقية (Marketing)" },
      ],
    },
    {
      category: "الجهات الخارجية ومدد الاحتفاظ",
      items: [
        { id: "cookie-art-8", num: 8, title: "ملفات الطرف الثالث وسياساتها" },
        { id: "cookie-art-9", num: 9, title: "مدة الاحتفاظ والحذف التلقائي" },
      ],
    },
    {
      category: "التحكم والتعطيل والتواصل",
      items: [
        { id: "cookie-art-10", num: 10, title: "كيف تتحكم في ملفات الارتباط؟" },
        { id: "cookie-art-11", num: 11, title: "الأثر المترتب على التعطيل" },
        { id: "cookie-art-12", num: 12, title: "التحديثات الدورية للسياسة" },
        { id: "cookie-art-13", num: 13, title: "قنوات التواصل ومسؤول الحماية (DPO)" },
      ],
    },
  ];

  // Article groupings for Data Processing Agreement (DPA)
  const dpaCategories = [
    {
      category: "الأحكام العامة والنطاق",
      items: [
        { id: "dpa-art-1", num: 1, title: "المادة الأولى: النطاق والتعريفات" },
        { id: "dpa-art-2", num: 2, title: "المادة الثانية: التزامات معالج البيانات" },
      ],
    },
    {
      category: "الأمن والتدقيق",
      items: [
        { id: "dpa-art-3", num: 3, title: "المادة الثالثة: أمن البيانات والتشفير" },
        { id: "dpa-art-4", num: 4, title: "المادة الرابعة: التدقيق وحقوق الرقابة" },
      ],
    },
  ];

  // Article groupings for Service Level Agreement (SLA - 12 Articles)
  const slaCategories = [
    {
      category: "التعريفات ونطاق الخدمة والتوفر",
      items: [
        { id: "sla-art-1", num: 1, title: "المادة 1: التعريفات" },
        { id: "sla-art-2", num: 2, title: "المادة 2: نطاق الخدمة والباقات" },
        { id: "sla-art-3", num: 3, title: "المادة 3: مستويات ونسب التوفر" },
      ],
    },
    {
      category: "أوقات الاستجابة والحل والأداء",
      items: [
        { id: "sla-art-4", num: 4, title: "المادة 4: أوقات الاستجابة" },
        { id: "sla-art-5", num: 5, title: "المادة 5: أوقات الحل" },
        { id: "sla-art-6", num: 6, title: "المادة 6: معايير الأداء والسرعة" },
      ],
    },
    {
      category: "الصيانة والإشعارات والتعويضات",
      items: [
        { id: "sla-art-7", num: 7, title: "المادة 7: الصيانة والتحديثات" },
        { id: "sla-art-8", num: 8, title: "المادة 8: الإشعارات والتقارير" },
        { id: "sla-art-9", num: 9, title: "المادة 9: نسب وضوابط التعويضات" },
      ],
    },
    {
      category: "الاستثناءات والمراقبة والتواصل",
      items: [
        { id: "sla-art-10", num: 10, title: "المادة 10: الاستثناءات والقوة القاهرة" },
        { id: "sla-art-11", num: 11, title: "المادة 11: المراقبة ولوحة الحالة" },
        { id: "sla-art-12", num: 12, title: "المادة 12: قنوات التواصل الرسمية" },
      ],
    },
  ];

  // Article groupings for Subscription Contract (18 Articles)
  const contractCategories = [
    {
      category: "الديباجة وبيانات الطرفين والتعريفات",
      items: [
        { id: "cnt-art-1", num: 1, title: "المادة 1: بيانات الطرفين (المزود والعميل)" },
        { id: "cnt-art-2", num: 2, title: "المادة 2: التعريفات المعتمدة" },
        { id: "cnt-art-3", num: 3, title: "المادة 3: موضوع العقد ونطاق الخدمة" },
      ],
    },
    {
      category: "الباقة، المدة، والرسوم المالية",
      items: [
        { id: "cnt-art-4", num: 4, title: "المادة 4: الباقة المشترك بها وميزاتها" },
        { id: "cnt-art-5", num: 5, title: "المادة 5: مدة العقد والتجديد التلقائي" },
        { id: "cnt-art-6", num: 6, title: "المادة 6: قيمة الاشتراك وطرق السداد" },
      ],
    },
    {
      category: "الالتزامات والوثائق والملكية الفكرية",
      items: [
        { id: "cnt-art-7", num: 7, title: "المادة 7: التزامات المزود" },
        { id: "cnt-art-8", num: 8, title: "المادة 8: التزامات العميل" },
        { id: "cnt-art-9", num: 9, title: "المادة 9: الوثائق والسياسات المرتبطة" },
        { id: "cnt-art-10", num: 10, title: "المادة 10: الاستخدام المسموح والمحظور" },
        { id: "cnt-art-11", num: 11, title: "المادة 11: الملكية الفكرية" },
        { id: "cnt-art-12", num: 12, title: "المادة 12: السرية وحماية المعلومات" },
      ],
    },
    {
      category: "البيانات، المسؤولية، الفض والتوقيعات",
      items: [
        { id: "cnt-art-13", num: 13, title: "المادة 13: حماية البيانات والأمان" },
        { id: "cnt-art-14", num: 14, title: "المادة 14: حدود المسؤولية" },
        { id: "cnt-art-15", num: 15, title: "المادة 15: إنهاء العقد وآثاره" },
        { id: "cnt-art-16", num: 16, title: "المادة 16: حل النزاعات والقضاء" },
        { id: "cnt-art-17", num: 17, title: "المادة 17: أحكام عامة" },
        { id: "cnt-art-18", num: 18, title: "المادة 18: التوقيعات والاعتماد وملحق الدفع" },
      ],
    },
  ];

  // Sections groupings for User Manual (5 Sections)
  const manualCategories = [
    {
      category: "البدء والمتطلبات",
      items: [
        { id: "man-sec-1", num: 1, title: "1. مقدمة عن MeDo ERP" },
        { id: "man-sec-2", num: 2, title: "2. متطلبات التشغيل" },
        { id: "man-sec-3", num: 3, title: "3. تسجيل الدخول والوصول" },
        { id: "man-sec-4", num: 4, title: "4. الإعدادات الأولية للمنشأة" },
      ],
    },
    {
      category: "الوحدات الأساسية",
      items: [
        { id: "man-sec-5", num: 5, title: "5. المبيعات والعملاء" },
        { id: "man-sec-6", num: 6, title: "6. المشتريات والموردين" },
        { id: "man-sec-7", num: 7, title: "7. المخزون والمستودعات" },
        { id: "man-sec-8", num: 8, title: "8. الخزينة والمحافظ" },
        { id: "man-sec-9", num: 9, title: "9. المحاسبة والأستاذ العام" },
        { id: "man-sec-10", num: 10, title: "10. التقارير المالية" },
      ],
    },
    {
      category: "الميزات المتقدمة والإدارة",
      items: [
        { id: "man-sec-13", num: 13, title: "13. الذكاء المالي المتقدم والتحليل" },
        { id: "man-sec-14", num: 14, title: "14. الفوترة الإلكترونية (ZATCA)" },
        { id: "man-sec-19", num: 19, title: "19. إدارة المستخدمين والصلاحيات" },
      ],
    },
    {
      category: "المساعدة والدعم",
      items: [
        { id: "man-sec-21", num: 21, title: "21. الأسئلة الشائعة" },
        { id: "man-sec-22", num: 22, title: "22. استكشاف الأخطاء وإصلاحها" },
        { id: "man-sec-23", num: 23, title: "23. التواصل والدعم الفني" },
      ],
    },
  ];

  const currentCategories =
    activeDoc === "TERMS"
      ? termsCategories
      : activeDoc === "PRIVACY"
      ? privacyCategories
      : activeDoc === "DISCLAIMER"
      ? disclaimerCategories
      : activeDoc === "REFUND"
      ? refundCategories
      : activeDoc === "COOKIES"
      ? cookiesCategories
      : activeDoc === "DPA"
      ? dpaCategories
      : activeDoc === "SLA"
      ? slaCategories
      : activeDoc === "CONTRACT"
      ? contractCategories
      : manualCategories;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 select-text" dir="rtl">
      {/* Top Header & Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                title="الرجوع إلى الشاشة السابقة"
              >
                <ArrowRight className="w-4 h-4" />
                <span className="hidden sm:inline">رجوع</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                {activeDoc === "TERMS" ? (
                  <Scale className="w-4 h-4 text-amber-400" />
                ) : activeDoc === "PRIVACY" ? (
                  <Lock className="w-4 h-4 text-emerald-400" />
                ) : activeDoc === "DISCLAIMER" ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : activeDoc === "REFUND" ? (
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Cookie className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-white leading-tight flex items-center gap-2">
                  <span>الوثائق القانونية الرسمية</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/60 font-mono font-bold">
                    الإصدار 2.0
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  ميدو تك للحلول البرمجية — معتمدة وسارية المفعول
                </p>
              </div>
            </div>
          </div>

          {/* Document Switcher Tabs in Top Nav */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner overflow-x-auto">
            <button
              onClick={() => {
                setActiveDoc("TERMS");
                setActiveArticleId("art-1");
                scrollToTop();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeDoc === "TERMS"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>شروط الاستخدام</span>
              <span className="text-[10px] opacity-80">(20 مادة)</span>
            </button>

            <button
              onClick={() => {
                setActiveDoc("PRIVACY");
                setActiveArticleId("priv-art-1");
                scrollToTop();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeDoc === "PRIVACY"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>سياسة الخصوصية</span>
              <span className="text-[10px] opacity-80">(15 مادة)</span>
            </button>

            <button
              onClick={() => {
                setActiveDoc("DISCLAIMER");
                setActiveArticleId("disc-art-1");
                scrollToTop();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeDoc === "DISCLAIMER"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>إخلاء المسؤولية</span>
              <span className="text-[10px] opacity-80">(14 مادة)</span>
            </button>

            <button
              onClick={() => {
                setActiveDoc("REFUND");
                setActiveArticleId("ref-art-1");
                scrollToTop();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeDoc === "REFUND"
                  ? "bg-cyan-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>سياسة الاسترداد</span>
              <span className="text-[10px] opacity-80">(12 مادة)</span>
            </button>

            <button
              onClick={() => {
                setActiveDoc("COOKIES");
                setActiveArticleId("cookie-art-1");
                scrollToTop();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeDoc === "COOKIES"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Cookie className="w-3.5 h-3.5" />
              <span>ملفات الارتباط</span>
              <span className="text-[10px] opacity-80">(13 مادة)</span>
            </button>

            <button
              onClick={() => {
                setActiveDoc("DPA");
                setActiveArticleId("dpa-art-1");
                scrollToTop();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeDoc === "DPA"
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>معالجة البيانات (DPA)</span>
              <span className="text-[10px] opacity-80">(4 مواد)</span>
            </button>

            <button
              onClick={() => {
                setActiveDoc("SLA");
                setActiveArticleId("sla-art-1");
                scrollToTop();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeDoc === "SLA"
                  ? "bg-indigo-500 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>مستوى الخدمة (SLA)</span>
              <span className="text-[10px] opacity-80">(12 مادة)</span>
            </button>

            <button
              onClick={() => {
                setActiveDoc("CONTRACT");
                setActiveArticleId("cnt-art-1");
                scrollToTop();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeDoc === "CONTRACT"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>عقد الاشتراك الرسمي</span>
              <span className="text-[10px] opacity-80">(18 مادة)</span>
            </button>

            <button
              onClick={() => {
                setActiveDoc("MANUAL");
                setActiveArticleId("art-1");
                scrollToTop();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeDoc === "MANUAL"
                  ? "bg-indigo-500 text-white font-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>دليل المستخدم</span>
              <span className="text-[10px] opacity-80">(23 قسماً)</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-slate-600"
              title="طباعة الوثيقة الرسمية"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">طباعة</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-slate-600"
              title="نسخ الرابط"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="hidden md:inline">{copied ? "تم النسخ" : "مشاركة"}</span>
            </button>

            <a
              href={
                activeDoc === "PRIVACY" || activeDoc === "COOKIES"
                  ? "mailto:dpo@medo-erp.com"
                  : activeDoc === "REFUND"
                  ? "mailto:billing@medo-erp.com"
                  : "mailto:legal@medo-erp.com"
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md text-slate-950 ${
                activeDoc === "PRIVACY"
                  ? "bg-emerald-400 hover:bg-emerald-300"
                  : activeDoc === "REFUND"
                  ? "bg-cyan-400 hover:bg-cyan-300"
                  : activeDoc === "COOKIES"
                  ? "bg-amber-400 hover:bg-amber-300"
                  : "bg-amber-500 hover:bg-amber-400"
              }`}
              title="التواصل المباشر"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {activeDoc === "PRIVACY" || activeDoc === "COOKIES"
                  ? "مسؤول الحماية (DPO)"
                  : activeDoc === "REFUND"
                  ? "البريد المالي (Billing)"
                  : "الإدارة القانونية"}
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container with Sticky TOC Sidebar + Document */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Table of Contents Navigation Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1 pl-1 scrollbar-thin">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-black text-white">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>
                    فهرس مواد{" "}
                    {activeDoc === "TERMS"
                      ? "الشروط (20)"
                      : activeDoc === "PRIVACY"
                      ? "الخصوصية (15)"
                      : activeDoc === "DISCLAIMER"
                      ? "إخلاء المسؤولية (14)"
                      : activeDoc === "REFUND"
                      ? "الاسترداد (12)"
                      : "ملفات الارتباط (13)"}
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                  activeDoc === "PRIVACY" 
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/60" 
                    : activeDoc === "REFUND"
                    ? "bg-cyan-950/80 text-cyan-300 border-cyan-800/60"
                    : activeDoc === "COOKIES"
                    ? "bg-amber-950/80 text-amber-300 border-amber-800/60"
                    : "bg-amber-950/80 text-amber-300 border-amber-800/60"
                }`}>
                  {activeDoc === "PRIVACY"
                    ? "GDPR & Cloud"
                    : activeDoc === "TERMS"
                    ? "IFRS & Law"
                    : activeDoc === "DISCLAIMER"
                    ? "SLA & Audit"
                    : activeDoc === "REFUND"
                    ? "SaaS Guarantee"
                    : "GDPR & ePrivacy"}
                </span>
              </div>

              {/* Grouped Article Links */}
              <div className="space-y-4 text-xs">
                {currentCategories.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-1.5">
                    <h3 className="text-[11px] font-bold text-slate-400 pr-1 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        activeDoc === "PRIVACY"
                          ? "bg-emerald-400"
                          : activeDoc === "REFUND"
                          ? "bg-cyan-400"
                          : "bg-amber-400"
                      }`} />
                      {group.category}
                    </h3>
                    <div className="space-y-1">
                      {group.items.map((art) => (
                        <button
                          key={art.id}
                          onClick={() => scrollToArticle(art.id)}
                          className={`w-full text-right px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group cursor-pointer ${
                            activeArticleId === art.id
                              ? activeDoc === "PRIVACY"
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold"
                                : activeDoc === "REFUND"
                                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold"
                                : "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold"
                              : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span className={`font-mono text-[11px] ${
                              activeDoc === "PRIVACY"
                                ? "text-emerald-400"
                                : activeDoc === "REFUND"
                                ? "text-cyan-400"
                                : "text-amber-400"
                            }`}>
                              م.{art.num}
                            </span>
                            <span className="truncate">{art.title}</span>
                          </span>
                          <span className={`text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ${
                            activeDoc === "PRIVACY"
                              ? "text-emerald-400"
                              : activeDoc === "REFUND"
                              ? "text-cyan-400"
                              : "text-amber-400"
                          }`}>
                            ←
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Legal Help Box */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
                  <div className="font-bold text-slate-200 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {activeDoc === "REFUND"
                        ? "ضمانات الشفافية والاسترداد"
                        : activeDoc === "COOKIES"
                        ? "إدارة ملفات الارتباط والتفضيلات"
                        : "ضمانات الخصوصية والأمان"}
                    </span>
                  </div>
                  <p className="leading-relaxed text-[10px]">
                    {activeDoc === "PRIVACY"
                      ? "نلتزم بعدم بيع أو مشاركة بياناتك، مع تشفير AES-256 وحفظ السجلات المالية لمدة 7 سنوات وفق القانون اليمني."
                      : activeDoc === "TERMS"
                      ? "تخضع هذه الاتفاقية للقوانين السارية بالجمهورية اليمنية، ومحاكم أمانة العاصمة صنعاء هي المختصة بنظر أي نزاع."
                      : activeDoc === "DISCLAIMER"
                      ? "تعتمد دقة التقارير وفروق الصرف على مدخلات المنشأة، والذكاء المالي المتقدم أداة مساعدة تتطلب مراجعة بشرية مستقلة."
                      : activeDoc === "REFUND"
                      ? "فترة تجربة مجانية 30 يوماً (50 عملية)، مع استرداد 100% للأعطال الفنية ومعالجة منظمة خلال 29 يوم عمل كحد أقصى."
                      : "إدارة شفافة لملفات الارتباط، حظر تام لمشاركة أي بيانات مالية مع الشركات الإعلانية، مع تمكين كامل لتعديل التفضيلات."}
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                    <Phone className="w-3 h-3" />
                    <span dir="ltr">+0967773586047</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Full Document Content Column */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {activeDoc === "TERMS" ? (
              <TermsOfServiceDocument />
            ) : activeDoc === "PRIVACY" ? (
              <PrivacyPolicyDocument />
            ) : activeDoc === "DISCLAIMER" ? (
              <DisclaimerDocument />
            ) : activeDoc === "REFUND" ? (
              <RefundPolicyDocument />
            ) : activeDoc === "COOKIES" ? (
              <CookiesPolicyDocument />
            ) : activeDoc === "DPA" ? (
              <DpaPolicyDocument />
            ) : activeDoc === "SLA" ? (
              <SlaPolicyDocument />
            ) : activeDoc === "CONTRACT" ? (
              <SubscriptionContractDocument />
            ) : (
              <UserManualDocument />
            )}
          </div>

        </div>
      </main>

      <SystemFooter />

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 left-6 z-40 p-3 rounded-2xl font-bold shadow-2xl transition-all active:scale-95 flex items-center gap-1.5 text-xs cursor-pointer border text-slate-950 ${
            activeDoc === "PRIVACY" 
              ? "bg-emerald-400 hover:bg-emerald-300 border-emerald-200" 
              : activeDoc === "REFUND"
              ? "bg-cyan-400 hover:bg-cyan-300 border-cyan-200"
              : activeDoc === "COOKIES"
              ? "bg-amber-400 hover:bg-amber-300 border-amber-200"
              : "bg-amber-500 hover:bg-amber-400 border-amber-300"
          }`}
          title="العودة إلى أعلى الصفحة"
        >
          <ChevronUp className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">أعلى الوثيقة</span>
        </button>
      )}
    </div>
  );
};
