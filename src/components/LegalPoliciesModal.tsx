import React, { useState } from "react";
import { TermsOfServiceDocument } from "./TermsOfServiceDocument";
import { PrivacyPolicyDocument } from "./PrivacyPolicyDocument";
import { DisclaimerDocument } from "./DisclaimerDocument";
import { RefundPolicyDocument } from "./RefundPolicyDocument";
import { CookiesPolicyDocument } from "./CookiesPolicyDocument";
import { DpaPolicyDocument } from "./DpaPolicyDocument";
import { SlaPolicyDocument } from "./SlaPolicyDocument";
import { SubscriptionContractDocument } from "./SubscriptionContractDocument";
import { UserManualDocument } from "./UserManualDocument";
import { 
  ShieldCheck, 
  FileText, 
  Scale, 
  X, 
  Printer, 
  Mail, 
  Phone, 
  CheckCircle2,
  AlertTriangle,
  Building2,
  Lock,
  Award,
  Server,
  Zap,
  Clock,
  DatabaseBackup,
  Layers,
  FileCheck2,
  Info,
  ExternalLink,
  RotateCcw,
  Cookie
} from "lucide-react";

export type LegalPolicyType = 
  | "TRIAL_TERMS"
  | "TERMS" 
  | "CONTRACT"
  | "MANUAL"
  | "GTC" 
  | "SUPPLEMENT" 
  | "DPA" 
  | "SLA"
  | "PRIVACY" 
  | "EULA" 
  | "DISCLAIMER" 
  | "REFUND"
  | "COOKIES"
  | "SAP_MATRIX";

interface LegalPoliciesModalProps {
  initialPolicy?: LegalPolicyType;
  isOpen: boolean;
  onClose: () => void;
}

export const LegalPoliciesModal: React.FC<LegalPoliciesModalProps> = ({
  initialPolicy = "TERMS",
  isOpen,
  onClose
}) => {
  const [activePolicy, setActivePolicy] = useState<LegalPolicyType>(initialPolicy);

  React.useEffect(() => {
    if (isOpen && initialPolicy) {
      setActivePolicy(initialPolicy);
    }
  }, [isOpen, initialPolicy]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      id="legal-policies-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      dir="rtl"
    >
      <div 
        id="legal-policies-modal-container"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{ fontFamily: "'Noto Naskh Arabic', 'Amiri', 'Droid Arabic Naskh', 'Traditional Arabic', sans-serif" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-sap-primary/30 to-slate-950 border-b border-slate-800 p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sap-primary/30 border border-sap-secondary/50 flex items-center justify-center text-sap-secondary font-black">
              {activePolicy === "TERMS" && <FileText className="w-6 h-6 text-sap-secondary" />}
              {activePolicy === "GTC" && <FileCheck2 className="w-6 h-6 text-sap-secondary" />}
              {activePolicy === "SUPPLEMENT" && <Server className="w-6 h-6 text-sap-secondary" />}
              {activePolicy === "DPA" && <ShieldCheck className="w-6 h-6 text-sap-secondary" />}
              {activePolicy === "PRIVACY" && <Lock className="w-6 h-6 text-sap-secondary" />}
              {activePolicy === "EULA" && <Award className="w-6 h-6 text-sap-secondary" />}
              {activePolicy === "DISCLAIMER" && <Scale className="w-6 h-6 text-sap-secondary" />}
              {activePolicy === "REFUND" && <RotateCcw className="w-6 h-6 text-sap-secondary" />}
              {activePolicy === "COOKIES" && <Cookie className="w-6 h-6 text-sap-secondary" />}
              {activePolicy === "SAP_MATRIX" && <Layers className="w-6 h-6 text-sap-secondary" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  الوثائق والسياسات القانونية (SAP Legal Suite)
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sap-primary/50 text-sap-secondary border border-sap-secondary/40 font-bold">
                  معايير SAP Cloud الرسمية
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                منظومة MeDo ERP — شركة ميدو تك ومجموعة بن زياد التجارية المحدودة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="print-legal-policy-btn"
              onClick={handlePrint}
              title="طباعة الوثيقة"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              id="close-legal-policy-btn"
              onClick={onClose}
              title="إغلاق"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors border border-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Policy Navigation Tabs - Complete SAP Suite */}
        <div className="bg-slate-950/70 border-b border-slate-800/80 px-3 sm:px-6 pt-2 flex gap-1 sm:gap-2 overflow-x-auto scrollbar-thin">
          <button
            id="tab-sap-trial-terms"
            onClick={() => setActivePolicy("TRIAL_TERMS")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activePolicy === "TRIAL_TERMS"
                ? "border-sap-secondary text-sap-secondary bg-sap-primary/20 rounded-t-xl shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📜</span>
            <span>شروط التجربة السحابية (SAP Cloud Trial)</span>
          </button>

          <button
            id="tab-terms-of-service"
            onClick={() => setActivePolicy("TERMS")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activePolicy === "TERMS"
                ? "border-sap-secondary text-sap-secondary bg-sap-primary/20 rounded-t-xl shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📄</span>
            <span>شروط الاستخدام (Terms)</span>
          </button>

          <button
            id="tab-subscription-contract"
            onClick={() => setActivePolicy("CONTRACT")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activePolicy === "CONTRACT"
                ? "border-amber-400 text-amber-300 bg-amber-950/40 rounded-t-xl shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📜</span>
            <span>عقد الاشتراك الرسمي (Contract)</span>
          </button>

          <button
            id="tab-user-manual"
            onClick={() => setActivePolicy("MANUAL")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activePolicy === "MANUAL"
                ? "border-indigo-400 text-indigo-300 bg-indigo-950/40 rounded-t-xl shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📖</span>
            <span>دليل المستخدم النهائي (Manual)</span>
          </button>

          <button
            id="tab-gtc-policy"
            onClick={() => setActivePolicy("GTC")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activePolicy === "GTC"
                ? "border-sap-secondary text-sap-secondary bg-sap-primary/20 rounded-t-xl shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📑</span>
            <span>الشروط العامة (GTC)</span>
          </button>

          <button
            id="tab-supplement-policy"
            onClick={() => setActivePolicy("SUPPLEMENT")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activePolicy === "SUPPLEMENT"
                ? "border-sap-secondary text-sap-secondary bg-sap-primary/20 rounded-t-xl shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📑</span>
            <span>الملحق السحابي (Supplement)</span>
          </button>

          <button
            id="tab-sla-policy"
            onClick={() => setActivePolicy("SLA")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activePolicy === "SLA"
                ? "border-indigo-400 text-indigo-300 bg-indigo-950/40 rounded-t-xl shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>⚡</span>
            <span>مستوى الخدمة (SLA)</span>
          </button>

          <button
            id="tab-dpa-policy"
            onClick={() => setActivePolicy("DPA")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activePolicy === "DPA"
                ? "border-blue-400 text-blue-300 bg-blue-950/40 rounded-t-xl shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🛡️</span>
            <span>معالجة البيانات (DPA)</span>
          </button>

          <button
            id="tab-privacy-policy"
            onClick={() => setActivePolicy("PRIVACY")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activePolicy === "PRIVACY"
                ? "border-sap-secondary text-sap-secondary bg-sap-primary/20 rounded-t-xl shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🔒</span>
            <span>سياسة الخصوصية (Privacy)</span>
          </button>

          <button
            id="tab-eula-policy"
            onClick={() => setActivePolicy("EULA")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activePolicy === "EULA"
                ? "border-sap-secondary text-sap-secondary bg-sap-primary/20 rounded-t-xl shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📜</span>
            <span>ترخيص المستخدم (EULA)</span>
          </button>

          <button
            id="tab-disclaimer-policy"
            onClick={() => setActivePolicy("DISCLAIMER")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activePolicy === "DISCLAIMER"
                ? "border-sap-secondary text-sap-secondary bg-sap-primary/20 rounded-t-xl shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>⚖️</span>
            <span>إخلاء المسؤولية</span>
          </button>

          <button
            id="tab-refund-policy"
            onClick={() => setActivePolicy("REFUND")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activePolicy === "REFUND"
                ? "border-cyan-400 text-cyan-300 bg-cyan-950/40 rounded-t-xl shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🔄</span>
            <span>سياسة الاسترداد (Refund)</span>
          </button>

          <button
            id="tab-cookies-policy"
            onClick={() => setActivePolicy("COOKIES")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activePolicy === "COOKIES"
                ? "border-amber-400 text-amber-300 bg-amber-950/40 rounded-t-xl shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🍪</span>
            <span>ملفات الارتباط (Cookies)</span>
          </button>

          <button
            id="tab-sap-matrix-policy"
            onClick={() => setActivePolicy("SAP_MATRIX")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activePolicy === "SAP_MATRIX"
                ? "border-sap-secondary text-sap-secondary bg-sap-primary/20 rounded-t-xl shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🏛️</span>
            <span>مطابقة مراجع SAP</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 text-slate-200 leading-relaxed text-sm sm:text-base bg-slate-900/70">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sap-secondary" />
              <span>الجهة القانونية: شركة ميدو تك للحلول البرمجية ومجموعة بن زياد التجارية المحدودة</span>
            </div>
            <div className="font-semibold text-sap-secondary">
              الإصدار: SAP-EDITION-2026.1 (ساري ومعتمد)
            </div>
          </div>

          {/* 0. SAP Cloud Trial Terms of Use (شروط استخدام التجربة السحابية - المعتمدة رسمياً) */}
          {activePolicy === "TRIAL_TERMS" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-slate-950 via-sap-primary/40 to-slate-950 border border-sap-secondary/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-md bg-sap-secondary/20 text-sap-secondary border border-sap-secondary/40 font-mono font-bold">
                      OFFICIAL DOCUMENT DATE: 2026-08-18
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-white mt-2 flex items-center gap-2.5">
                      <FileCheck2 className="w-6 h-6 text-sap-secondary" />
                      SAP Cloud Trial Terms of Use
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      شروط وأحكام استخدام النسخة التجريبية السحابية لمنظومة SAP &amp; MeDo ERP
                    </p>
                  </div>
                  <div className="shrink-0 bg-slate-900/90 border border-slate-700 p-3 rounded-xl text-center">
                    <span className="text-xs text-slate-400 block font-bold">فترة التجربة</span>
                    <span className="text-lg font-black text-sap-secondary">30 يوماً ($0.00)</span>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs sm:text-sm leading-relaxed space-y-2">
                  <div className="font-bold text-sap-secondary flex items-center gap-2">
                    <Info className="w-4 h-4 text-sap-secondary" />
                    <span>الديباجة والإقرار بالقبول القانوني (Preamble &amp; Power of Attorney):</span>
                  </div>
                  <p className="text-slate-200">
                    By clicking "Accept", "Agree" (or by clicking a similar expression of acceptance) you agree to all the terms and conditions stated in this Agreement. If you do not agree to these terms, do not click "Accept", "Agree". If you are clicking on behalf of a company (collectively, customer), you hereby represent and warrant that you have been given the power of attorney to carry out this transaction with SAP on behalf of Customer. Once completed, this Agreement is a legally binding agreement for SAP Cloud Services between Customer and SAP SE ("SAP").
                  </p>
                </div>
              </div>

              {/* Clauses Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Definitions */}
                <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sap-secondary flex items-center gap-2 text-sm sm:text-base">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      1. Definitions (التعاريف)
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Clause 1.1</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    <strong>1.1. "Customer"</strong> means the entity or person that is registered and identified in the ordering system.
                  </p>
                  <p className="text-slate-400 text-[11px] border-t border-slate-800/80 pt-1.5 mt-1">
                    العميل: الشخص أو المنشأة المسجلة والمعرفة رسمياً في نظام طلبات واشتراكات الخدمة السحابية.
                  </p>
                </div>

                {/* 2. Subscription Term */}
                <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sap-secondary flex items-center gap-2 text-sm sm:text-base">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      2. Subscription Term (مدة الاشتراك التجريبي)
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Clause 2.2</span>
                  </div>
                  <ul className="text-slate-300 text-xs space-y-1.5 list-disc list-inside">
                    <li>
                      <strong>2.2.1. 30 Days Term:</strong> Subscription begins upon SAP providing access and continues for thirty (30) days.
                    </li>
                    <li>
                      <strong>2.2.2. Auto Termination:</strong> Agreement automatically terminates after 30 days, ending access to Cloud Services and Confidential Info.
                    </li>
                  </ul>
                  <p className="text-slate-400 text-[11px] border-t border-slate-800/80 pt-1.5 mt-1">
                    تبدأ الفترة بمجرد إتاحة الوصول وتستمر 30 يوماً متصلة، وتنتهي التزامياً بانتهاء الفترة.
                  </p>
                </div>

                {/* 2.1 Cloud Services Usage Rules */}
                <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="font-bold text-sap-secondary flex items-center gap-2 text-sm sm:text-base">
                      <Server className="w-4 h-4 text-emerald-400" />
                      2.1. Cloud Services Restrictions &amp; Support Scope (شروط وضوابط استخدام الخدمة)
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Clauses 2.1.1 - 2.1.5</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">2.1.1. Internal Testing &amp; Evaluation</span>
                      <p className="text-slate-300 text-[11px]">
                        Customer may use the Cloud Services solely for internal testing and evaluation during Subscription Term.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">2.1.2. Non-Productive Data Only</span>
                      <p className="text-slate-300 text-[11px]">
                        The Cloud Services may ONLY be used with non-productive data and may NOT be used for production/commercial purposes.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">2.1.3. Single Authorized User Restriction</span>
                      <p className="text-slate-300 text-[11px]">
                        Up to 1 Authorized User may access the Cloud Services. Access &amp; storage may be limited anytime without prior notice.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">2.1.4. No Support or Maintenance Cases</span>
                      <p className="text-slate-300 text-[11px]">
                        Provided without maintenance/support. Customer may NOT submit support cases or contact SAP customer interaction center.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Payment Terms */}
                <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sap-secondary flex items-center gap-2 text-sm sm:text-base">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      3. Payment Terms &amp; Invoicing (الرسوم والفوترة)
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Section 3</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Cloud Services are provided <strong>free of charge ($0.00)</strong> during the Subscription Term.
                  </p>
                  <p className="text-slate-400 text-[11px] border-t border-slate-800/80 pt-1.5 mt-1">
                    تُتاح كافة الخدمات التجريبية مجاناً بالكامل دون أي مطالبة مالية أثناء فترة الـ 30 يوماً.
                  </p>
                </div>

                {/* 4. Export Restrictions */}
                <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sap-secondary flex items-center gap-2 text-sm sm:text-base">
                      <Scale className="w-4 h-4 text-emerald-400" />
                      4. Export Restrictions (قيود التصدير والعقوبات)
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Section 4</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Compliance with export control and trade sanctions laws of the US, EU, Germany.
                  </p>
                  <a 
                    href="https://www.sap.com/about/agreements/export-statements.html" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sap-secondary hover:underline text-[11px] font-bold mt-1"
                  >
                    <span>SAP Export Control Compliance Statement</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* 5. Referenced Documents Table */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sap-secondary" />
                  5. Referenced Documents (جدول الاتفاقيات والوثائق المرجعية)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-sap-secondary">
                        <th className="p-2.5">No.</th>
                        <th className="p-2.5">Agreement Name</th>
                        <th className="p-2.5">Location / URL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      <tr>
                        <td className="p-2.5 font-bold text-white">1</td>
                        <td className="p-2.5 font-bold">These Terms of Use ("Terms of Use")</td>
                        <td className="p-2.5 font-mono text-[11px]">Included in current document (Date: 2026-08-18)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-white">2</td>
                        <td className="p-2.5 font-bold">Supplemental Terms and Conditions for Cloud Services ("Supplement")</td>
                        <td className="p-2.5">
                          <a href="http://www.sap.com/agreements-cloud-supplement" target="_blank" rel="noreferrer" className="text-sap-secondary hover:underline font-mono text-[11px] inline-flex items-center gap-1">
                            <span>http://www.sap.com/agreements-cloud-supplement</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-white">3</td>
                        <td className="p-2.5 font-bold">Data Processing Agreement for Cloud Services, SAP Support and SAP Services ("DPA")</td>
                        <td className="p-2.5">
                          <a href="https://www.sap.com/data-processing-agreements" target="_blank" rel="noreferrer" className="text-sap-secondary hover:underline font-mono text-[11px] inline-flex items-center gap-1">
                            <span>https://www.sap.com/data-processing-agreements</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-white">4</td>
                        <td className="p-2.5 font-bold">General Terms and Conditions for Cloud Services ("GTC")</td>
                        <td className="p-2.5 text-emerald-400 font-bold">
                          Cloud Services Documents - SAP Trust Center
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 1. Terms of Use (شروط الاستخدام) */}
          {activePolicy === "TERMS" && (
            <div className="animate-fadeIn">
              <TermsOfServiceDocument />
            </div>
          )}

          {/* 2. GTC - General Terms & Conditions (الشروط والأحكام العامة) */}
          {activePolicy === "GTC" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
                <h1 className="text-xl sm:text-2xl font-black text-sap-secondary mb-3 flex items-center gap-2.5">
                  <FileCheck2 className="w-6 h-6 text-sap-secondary" />
                  الشروط والأحكام العامة للخدمات السحابية (GTC - General Terms & Conditions)
                </h1>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                  تحدد هذه الوثيقة الإطار التعاقدي الشامل المنظم للعلاقة بين <strong>شركة ميدو تك (مقدم الخدمة)</strong> و<strong>العميل (المستفيد)</strong> وفق أرقى معايير اتفاقيات البرمجيات كخدمة (SaaS GTC).
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-sap-secondary" />
                    أولاً: حقوق والتزامات العميل (Customer Rights & Obligations)
                  </h3>
                  <ul className="text-xs sm:text-sm text-slate-300 space-y-2 list-disc list-inside">
                    <li>الحق في الاستفادة الكاملة من كافة الوحدات المحاسبية والإدارية المرخصة طوال فترة الاشتراك.</li>
                    <li>الحق في طلب تصدير كامل البيانات المحاسبية بصيغ معيارية (JSON / Excel) دون قيد أو شرط.</li>
                    <li>الالتزام بعدم محاولة الهندسة العكسية للكود المصدري أو إعادة بيع الخدمة دون ترخيص وكالة معتمد.</li>
                    <li>الالتزام بالامتثال للقوانين واللوائح الضريبية والمحاسبية السارية في بلد المنشأة.</li>
                  </ul>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-sap-secondary" />
                    ثانياً: حقوق والتزامات ميدو تك ومجموعة بن زياد (Provider Obligations)
                  </h3>
                  <ul className="text-xs sm:text-sm text-slate-300 space-y-2 list-disc list-inside">
                    <li>ضمان توفر البنية التحتية السحابية بنسبة جاهزية لا تقل عن 99.98% وفق اتفاقية مستوى الخدمة (SLA).</li>
                    <li>توفير التحديثات البرمجية الدورية ومعالجة الثغرات والتحسينات المحاسبية بدون رسوم إضافية.</li>
                    <li>توفير قنوات الدعم الفني المحلي والاستشاري عبر واتساب والبريد الإلكتروني للعملاء المرخصين.</li>
                    <li>عزل بيانات كل منشأة محاسبياً وتقنياً في بيئة مشفرة مستقلة بنسبة 100%.</li>
                  </ul>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-sap-secondary" />
                    ثالثاً: سياسة الدفع، الفوترة، والإلغاء (Payment & Cancellation)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    تستحق الاشتراكات مقدماً حسب دورة الفوترة المختارة (شهري أو سنوي أو ترخيص دائم On-Premise). يحق للعميل إلغاء الاشتراك في أي وقت مع استمرار الوصول حتى نهاية الفترة المدفوعة واستخراج نسخة بياناته كاملة قبل الإغلاق.
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-sap-secondary" />
                    رابعاً: حدود المسؤولية والقانون الواجب التطبيق (Limitation of Liability)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    لا يتجاوز الحد الأقصى للمسؤولية القانونية لمقدم الخدمة عن أي أضرار مباشرة إجمالي المبالغ المدفوعة فعلياً من العميل خلال الـ 12 شهراً السابقة للواقعة. تخضع هذه الاتفاقية وتفسر وفقاً للقوانين والأنظمة التجارية المعتمدة.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Supplement & SLA (الملحق التكميلي للخدمات السحابية) */}
          {activePolicy === "SUPPLEMENT" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
                <h1 className="text-xl sm:text-2xl font-black text-sap-secondary mb-3 flex items-center gap-2.5">
                  <Server className="w-6 h-6 text-sap-secondary" />
                  الملحق التكميلي للخدمات السحابية ومستويات الخدمة (SAP Cloud Supplement & SLA)
                </h1>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                  يحدد هذا الملحق المواصفات التقنية الدقيقة للخدمات السحابية، مستويات الجاهزية التشغيلية (SLA)، خطط استمرارية الأعمال والدعم الفني المخصص لنظام <strong>MeDo ERP</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/60 border border-emerald-900/40 p-5 rounded-2xl text-center space-y-2">
                  <Zap className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="text-2xl font-black text-white">99.98%</div>
                  <div className="text-xs font-bold text-sap-secondary">مستوى جاهزية الخدمة (SLA)</div>
                  <p className="text-xs text-slate-400">توافر دائم للخوادم السحابية مع تعويضات تشغيلية في حال الانخفاض</p>
                </div>

                <div className="bg-slate-950/60 border border-emerald-900/40 p-5 rounded-2xl text-center space-y-2">
                  <Clock className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="text-2xl font-black text-white">&lt; 15 دقيقة</div>
                  <div className="text-xs font-bold text-sap-secondary">هدف نقطة الاستعادة (RPO)</div>
                  <p className="text-xs text-slate-400">نسخ احتياطي فوري متزامن وتدوير تلقائي لقواعد البيانات</p>
                </div>

                <div className="bg-slate-950/60 border border-emerald-900/40 p-5 rounded-2xl text-center space-y-2">
                  <DatabaseBackup className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="text-2xl font-black text-white">Zero Downtime</div>
                  <div className="text-xs font-bold text-sap-secondary">الاستمرارية دون اتصال</div>
                  <p className="text-xs text-slate-400">محرك Offline-First يضمن استمرار البيع والفوترة عند انقطاع الإنترنت بنسبة 100%</p>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-sap-secondary" />
                  مستويات الدعم الفني المعتمد (Technical Support Tiers)
                </h3>
                <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <strong className="text-emerald-400 block">المستوى 1: الحالات الطارئة والحرجة (Sev-1)</strong>
                      <span className="text-slate-400">توقف كامل للنظام أو الخادم — زمن الاستجابة: أقل من 30 دقيقة (24/7).</span>
                    </div>
                    <span className="px-2.5 py-1 bg-rose-950 text-rose-300 border border-rose-800 rounded-lg text-xs font-bold">فوري</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <strong className="text-amber-400 block">المستوى 2: الاستفسارات التشغيلية والمحاسبية</strong>
                      <span className="text-slate-400">استفسارات شجرة الحسابات، التسويات والتقارير — زمن الاستجابة: خلال 2 ساعة عمل.</span>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded-lg text-xs font-bold">مجدول</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. DPA - Data Processing Agreement (اتفاقية معالجة البيانات) */}
          {activePolicy === "DPA" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
                <h1 className="text-xl sm:text-2xl font-black text-sap-secondary mb-3 flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-sap-secondary" />
                  اتفاقية معالجة وحماية البيانات (DPA - Data Processing Agreement)
                </h1>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                  تحدد هذه الاتفاقية المعايير الصارمة لمعالجة وتشفير وتخزين بيانات العملاء وفق المعايير الدولية <strong>ISO/IEC 27001</strong> ولائحة حماية البيانات العامة (GDPR).
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <h3 className="font-bold text-white flex items-center gap-2 text-base text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    1. الغرض من جمع ومعالجة البيانات
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    يقتصر جمع ومعالجة البيانات على الأغراض التشغيلية والمحاسبية المحضة: تسجيل الفواتير، إصدار قيود اليومية، حساب الإهلاك، إدارة الرواتب والمخزون، وتوليد التقارير المالية والضريبية لصالح العميل.
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <h3 className="font-bold text-white flex items-center gap-2 text-base text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    2. مدة الاحتفاظ بالبيانات وسياسة الحذف
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    يتم الاحتفاظ بالبيانات طوال فترة سريان الاشتراك. عند انتهاء الخدمة أو طلب العميل الإلغاء، تتاح مهلة 60 يوماً لتصدير البيانات، يعقبها حذف البيانات بشكل نهائي وغير قابل للاسترجاع (Secure Purge) من الخوادم السحابية.
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <h3 className="font-bold text-white flex items-center gap-2 text-base text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    3. حقوق العميل في الوصول والتعديل والحذف الكامل
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    العميل هو المالك الحصري لبياناته، ويتمتع بكامل حقوق الوصول، التعديل، الاستخراج بصيغ مفتوحة (JSON / Excel)، وطلب الإتلاف الرقمي الشامل لبيانات المنشأة.
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <h3 className="font-bold text-white flex items-center gap-2 text-base text-emerald-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    4. تدابير الأمان والتشفير (AES-256)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    تطبيق تشفير عسكري <strong className="text-emerald-300">AES-256</strong> أثناء تخزين البيانات (Data at Rest) وتشفير <strong className="text-emerald-300">TLS 1.3</strong> أثناء النقل عبر الشبكة (Data in Transit)، مع نسخ احتياطي مشفر متعدد القنوات (Multi-Cloud & Local).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. Privacy Policy (سياسة الخصوصية الرسمية - Google & SAP Standards) */}
          {activePolicy === "PRIVACY" && (
            <div className="animate-fadeIn">
              <PrivacyPolicyDocument />
            </div>
          )}

          {/* 6. EULA (ترخيص المستخدم النهائي) */}
          {activePolicy === "EULA" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
                <h1 className="text-xl sm:text-2xl font-black text-sap-secondary mb-3 flex items-center gap-2.5">
                  <Award className="w-6 h-6 text-sap-secondary" />
                  اتفاقية ترخيص المستخدم النهائي (EULA - End User License Agreement)
                </h1>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                  تحدد هذه الاتفاقية حقوق استخدام برمجيات <strong>MeDo ERP</strong> على الأجهزة المكتبية والمتنقلة والخوادم المحلية.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-3">
                <h3 className="font-bold text-white text-base text-emerald-400">
                  شروط الترخيص وتثبيت تطبيق PWA
                </h3>
                <ul className="text-xs sm:text-sm text-slate-300 space-y-2 list-disc list-inside">
                  <li>يمنح المستخدم رخصة تثبيت التطبيق التقدمي (PWA) على أجهزة الشركة دون حدود لعدد الأجهزة المرتبطة بنفس المنشأة.</li>
                  <li>يُحظر تعديل شفرة العميل المصدرية أو تعطيل آليات التحقق من صحة الترخيص.</li>
                  <li>تظل التحديثات والتحسينات مشمولة ضمن باقة الصيانة السنوية الفعالة.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 7. Disclaimer (إخلاء المسؤولية) */}
          {activePolicy === "DISCLAIMER" && (
            <div className="animate-fadeIn">
              <DisclaimerDocument />
            </div>
          )}

          {/* 8. Refund Policy (سياسة الاسترداد) */}
          {activePolicy === "REFUND" && (
            <div className="animate-fadeIn">
              <RefundPolicyDocument />
            </div>
          )}

          {/* 9. Cookies Policy (سياسة ملفات الارتباط) */}
          {activePolicy === "COOKIES" && (
            <div className="animate-fadeIn">
              <CookiesPolicyDocument />
            </div>
          )}

          {/* DPA Policy */}
          {activePolicy === "DPA" && (
            <div className="animate-fadeIn">
              <DpaPolicyDocument />
            </div>
          )}

          {/* SLA Policy */}
          {activePolicy === "SLA" && (
            <div className="animate-fadeIn">
              <SlaPolicyDocument />
            </div>
          )}

          {/* Subscription Contract (عقد الاشتراك الرسمي) */}
          {activePolicy === "CONTRACT" && (
            <div className="animate-fadeIn">
              <SubscriptionContractDocument />
            </div>
          )}

          {/* User Manual (دليل المستخدم النهائي) */}
          {activePolicy === "MANUAL" && (
            <div className="animate-fadeIn">
              <UserManualDocument />
            </div>
          )}

          {/* 10. SAP Reference Matrix (جدول مطابقة مراجع SAP مع MeDo ERP) */}
          {activePolicy === "SAP_MATRIX" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
                <h1 className="text-xl sm:text-2xl font-black text-sap-secondary mb-3 flex items-center gap-2.5">
                  <Layers className="w-6 h-6 text-sap-secondary" />
                  جدول مطابقة مراجع SAP الرسمية مع نظام MeDo ERP
                </h1>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                  مصفوفة المقارنة والمطابقة المعيارية التي توضح الهيكلية القانونية والتقنية المعتمدة في MeDo ERP والمقابلة لمعايير <strong>SAP Cloud Terms &amp; Conditions</strong>:
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                <table className="w-full text-right text-xs sm:text-sm text-slate-200">
                  <thead className="bg-sap-primary/30 text-sap-secondary font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">المرجع في SAP Cloud</th>
                      <th className="p-3.5">ما يعادله في MeDo ERP</th>
                      <th className="p-3.5">الهدف والمضمون</th>
                      <th className="p-3.5">الحالة في النظام</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/60">
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-3.5 font-bold text-white">شروط الاستخدام (Terms of Use)</td>
                      <td className="p-3.5 text-sap-secondary font-bold">شروط استخدام MeDo ERP</td>
                      <td className="p-3.5 text-slate-300">حقوق الوصول، الملكية الفكرية، وقواعد استخدام المنصة السحابية.</td>
                      <td className="p-3.5"><span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold">✅ مطبق ومعتمد</span></td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-3.5 font-bold text-white">الملحق (Supplement & SLA)</td>
                      <td className="p-3.5 text-sap-secondary font-bold">الشروط التكميلية للخدمات السحابية</td>
                      <td className="p-3.5 text-slate-300">مستويات الخدمة (SLA 99.98%)، الدعم الفني، وخطط استمرارية الأعمال.</td>
                      <td className="p-3.5"><span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold">✅ مطبق ومعتمد</span></td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-3.5 font-bold text-white">اتفاقية معالجة البيانات (DPA)</td>
                      <td className="p-3.5 text-sap-secondary font-bold">سياسة معالجة البيانات وحمايتها</td>
                      <td className="p-3.5 text-slate-300">أمن البيانات، تشفير AES-256، حقوق التصدير والحذف، والامتثال لـ ISO 27001.</td>
                      <td className="p-3.5"><span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold">✅ مطبق ومعتمد</span></td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-3.5 font-bold text-white">الشروط العامة (GTC)</td>
                      <td className="p-3.5 text-sap-secondary font-bold">الشروط والأحكام العامة للخدمات</td>
                      <td className="p-3.5 text-slate-300">الحقوق والالتزامات المتبادلة، سياسات الدفع والإلغاء، وحدود المسؤولية التعاقدية.</td>
                      <td className="p-3.5"><span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold">✅ مطبق ومعتمد</span></td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-3.5 font-bold text-white">سياسة الخصوصية (Privacy Policy)</td>
                      <td className="p-3.5 text-sap-secondary font-bold">سياسة الخصوصية وسرية الحسابات</td>
                      <td className="p-3.5 text-slate-300">حظر مشاركة البيانات، حماية الهوية التجارية، وسجلات التدقيق المحاسبي.</td>
                      <td className="p-3.5"><span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold">✅ مطبق ومعتمد</span></td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-3.5 font-bold text-white">سياسة الاسترداد (Refund & Cancellation)</td>
                      <td className="p-3.5 text-sap-secondary font-bold">سياسة الاسترداد لمنصة MeDo ERP</td>
                      <td className="p-3.5 text-slate-300">فترة تجربة 30 يوماً، معالجة في 29 يوماً، واسترداد 100% للأعطال الفنية والتعليق.</td>
                      <td className="p-3.5"><span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold">✅ مطبق ومعتمد</span></td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-3.5 font-bold text-white">سياسة ملفات الارتباط (Cookies & Tracking)</td>
                      <td className="p-3.5 text-sap-secondary font-bold">سياسة ملفات تعريف الارتباط MeDo ERP</td>
                      <td className="p-3.5 text-slate-300">الامتثال لـ GDPR و ePrivacy، منع تتبع البيانات المالية، ومركز تحكم تفاعلي بالتفضيلات.</td>
                      <td className="p-3.5"><span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold">✅ مطبق ومعتمد</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Contact Legal Banner */}
          <div className="bg-gradient-to-l from-sap-primary/30 via-slate-950 to-slate-950 p-5 rounded-2xl border border-sap-secondary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">فريق الاستشارات القانونية والامتثال</h4>
              <p className="text-xs text-slate-400 mt-1">مجموعة بن زياد التجارية وميدو تك — صنعاء، الجمهورية اليمنية</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a 
                href="mailto:legal@medo-erp.com" 
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors border border-slate-700"
              >
                <Mail className="w-4 h-4 text-sap-secondary" />
                <span>legal@medo-erp.com</span>
              </a>
              <a 
                href="https://wa.me/967773586047" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sap-primary hover:bg-[#14532D] text-white text-xs font-bold transition-colors border border-sap-secondary/40"
              >
                <Phone className="w-4 h-4 text-sap-secondary" />
                <span dir="ltr">+967 773 586 047</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>🇾🇪 MeDo ERP © 2026 — ميدو تك ومجموعة بن زياد التجارية المحدودة</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-sap-primary hover:bg-[#14532D] border border-sap-secondary/60 text-sap-secondary font-bold text-sm shadow-lg shadow-sap-primary/30 transition-all cursor-pointer"
            >
              فهمت وأوافق على الشروط والسياسات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
