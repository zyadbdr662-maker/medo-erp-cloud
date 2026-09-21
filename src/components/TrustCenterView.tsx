import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Server, 
  FileCheck, 
  CheckCircle2, 
  Award, 
  Globe, 
  Database, 
  ShieldAlert, 
  Cpu,
  FileText,
  Scale,
  Activity,
  ArrowRight,
  ExternalLink,
  Zap,
  Check
} from "lucide-react";
import { LegalPoliciesModal, LegalPolicyType } from "./LegalPoliciesModal";
import { SapComplianceReportModal } from "./SapComplianceReportModal";

interface TrustCenterViewProps {
  onOpenLegalPolicy?: (policy: LegalPolicyType) => void;
}

export const TrustCenterView: React.FC<TrustCenterViewProps> = ({ onOpenLegalPolicy }) => {
  const [localModalOpen, setLocalModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<LegalPolicyType>("PRIVACY");
  const [complianceModalOpen, setComplianceModalOpen] = useState(false);

  const handleOpenPolicy = (policy: LegalPolicyType) => {
    if (onOpenLegalPolicy) {
      onOpenLegalPolicy(policy);
    } else {
      setSelectedPolicy(policy);
      setLocalModalOpen(true);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 max-w-7xl mx-auto font-sans" dir="rtl">
      {/* 1. Header Banner - SAP Green & Gold Identity */}
      <div className="bg-gradient-to-l from-sap-primary via-[#14532D] to-[#0A2E1A] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border-2 border-sap-secondary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-sap-secondary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sap-secondary/20 text-sap-secondary border border-sap-secondary/40 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-sap-secondary" /> مركز الثقة والأمان المؤسسي (SAP Trust Center)
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              معايير الأمان، الامتثال والخصوصية في SAP/MeDO ERP
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
              تلتزم منظومة SAP/MeDO ERP بتطبيق أعلى معايير الحماية المؤسسية وتشفير البيانات المستوحاة من SAP Business One والمعايير الدولية لضمان سرية واستمرارية الأعمال.
            </p>
            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                onClick={() => setComplianceModalOpen(true)}
                className="px-4 py-2 bg-sap-secondary hover:bg-[#b89528] text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-black/30 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>تقرير الامتثال والاختبار الشامل لمعايير SAP (نسبة 99.4%)</span>
              </button>
              <button
                onClick={() => handleOpenPolicy("TRIAL_TERMS")}
                className="px-4 py-2 bg-slate-900/80 hover:bg-slate-900 text-sap-secondary border border-sap-secondary/50 font-bold rounded-xl text-xs shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-sap-secondary" />
                <span>شروط أحكام اتفاقية SAP Cloud Trial المعتمدة (2026-08-18)</span>
              </button>
            </div>
          </div>
          <div className="flex flex-row md:flex-col gap-3 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center shrink-0">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-sap-secondary">99.98%</div>
              <div className="text-[11px] text-emerald-100">جهوزية الخوادم السحابية</div>
            </div>
            <div className="border-r md:border-r-0 md:border-t border-white/20 pt-2 md:pt-2">
              <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>الخدمات تعمل بكفاءة تامة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. الأمان (Security) - Pillar 1 */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-sap-primary border border-emerald-200 flex items-center justify-center">
              <Lock className="w-6 h-6 text-sap-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">1. إجراءات الأمان والتحكم (Security Controls)</h2>
              <p className="text-xs text-slate-500">حماية البيانات وفق أحدث معايير التشفير البنكي وعزل المستأجرين</p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-emerald-100 text-sap-primary rounded-full text-xs font-bold">
            AES-256 &amp; TLS 1.3
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-sap-primary flex items-center justify-center font-bold">
              <Lock className="w-5 h-5 text-sap-primary" />
            </div>
            <h3 className="text-base font-bold text-slate-900">تشفير البيانات الشامل</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              تشفير قواعد البيانات محلياً على أجهزة المستخدمين وسحابياً باستخدام خوارزمية AES-256 العسكرية، مع قنوات نقل مؤمنة بالكامل ببروتوكول TLS 1.3.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-sap-primary flex items-center justify-center font-bold">
              <Database className="w-5 h-5 text-sap-primary" />
            </div>
            <h3 className="text-base font-bold text-slate-900">عزل بيانات المستأجرين (Tenants)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              فصل منطقي ومعماري صارم لكل منشأة أو مجموعة تجارية، يمنع وصول أي مستخدم خارج صلاحيات الشركة الخاصة به.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-sap-primary flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-sap-primary" />
            </div>
            <h3 className="text-base font-bold text-slate-900">إدارة الصلاحيات وسجلات التدقيق</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              نظام تحكم دقيق في أذونات المستخدمين (RBAC)، مع تسجيل كامل وغير قابل للتعديل لكافة القيود والتعديلات وحركات الصرف والإيداع (Audit Trail).
            </p>
          </div>
        </div>
      </div>

      {/* 3. الامتثال والشهادات (Compliance & Certifications) - Pillar 2 */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-sap-secondary border border-amber-200 flex items-center justify-center">
              <Award className="w-6 h-6 text-sap-secondary" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">2. الامتثال والشهادات (Compliance &amp; Certifications)</h2>
              <p className="text-xs text-slate-500">التوافق مع المعايير المحاسبية والتنظيمية وهيئات الزكاة والضرائب</p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold">
            ZATCA &amp; IFRS Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
            <Award className="w-8 h-8 text-sap-secondary shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-slate-900">ISO/IEC 27001</div>
              <div className="text-xs text-slate-500 mt-1">نظام إدارة أمن المعلومات المؤسسي والخصوصية وحماية الخوادم.</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
            <Globe className="w-8 h-8 text-sap-primary shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-slate-900">ZATCA المرحلة 2</div>
              <div className="text-xs text-slate-500 mt-1">مطابقة تامة للفاتورة الإلكترونية وتوليد أكواد QR وتشفير XML UBL 2.1.</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
            <Database className="w-8 h-8 text-sap-primary shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-slate-900">معايير IFRS / GAAP</div>
              <div className="text-xs text-slate-500 mt-1">قوائم ختامية وتدفقات نقدية مطابقة للمعايير المحاسبية الدولية.</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
            <Cpu className="w-8 h-8 text-sap-secondary shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-slate-900">SAP Architecture</div>
              <div className="text-xs text-slate-500 mt-1">بنية سحابية وهجينة مستوحاة من أفضل ممارسات SAP Fiori و Business One.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. خصوصية البيانات (Data Privacy) - Pillar 3 */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-sap-primary border border-emerald-200 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-sap-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">3. سياسة وخصوصية البيانات (Data Privacy)</h2>
              <p className="text-xs text-slate-500">التزام صارم بحماية بيانات العميل وسيادته الكاملة عليها</p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-emerald-100 text-sap-primary rounded-full text-xs font-bold">
            Zero-Sharing Guarantee
          </span>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 space-y-3">
          <p className="text-sm text-slate-800 leading-relaxed font-bold">
            نحن نؤمن بأن بياناتك المالية والمحاسبية هي أصلك التجاري الأثمن. لذلك تلتزم مجموعة بن زياد وميدو تك بالآتي:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sap-primary shrink-0" />
              <span><strong>الملكية الحصرية:</strong> المنشأة هي المالك الحصري لجميع القيود، الفواتير، والأرصدة دون أي منازع.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sap-primary shrink-0" />
              <span><strong>عدم المشاركة أو البيع:</strong> لا يتم مشاركة أو بيع أي بيانات مع أي طرف ثالث أو استخدامها لأغراض إعلانية.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sap-primary shrink-0" />
              <span><strong>حرية التصدير والحذف:</strong> يحق للعميل تصدير بياناته بصيغ مفتوحة (JSON/Excel/PDF) أو طلب حذفها نهائياً في أي وقت.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 5. حالة الخدمات السحابية (Cloud Service Status) - Pillar 4 */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-sap-secondary border border-slate-800 flex items-center justify-center">
              <Server className="w-6 h-6 text-sap-secondary" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">4. حالة الخدمات السحابية (Cloud Service Status)</h2>
              <p className="text-xs text-slate-500">مراقبة حية للأداء، سرعة الاستجابة، وجهوزية المنظومة</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>جميع الأنظمة تعمل بكفاءة (Operational)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">بوابة الدخول وAPI المركزي</span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">99.99%</span>
            </div>
            <div className="text-xs text-slate-500">زمن الاستجابة: 22ms | تشفير TLS 1.3</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">محرك العمل المحلي (Offline)</span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">100%</span>
            </div>
            <div className="text-xs text-slate-500">جاهزية فورية في المتصفح والذاكرة المحلية</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">النسخ الاحتياطي السحابي المتعدد</span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">99.98%</span>
            </div>
            <div className="text-xs text-slate-500">Drive / Yandex / Telegram Vault</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">مولد الفاتورة الضريبية ZATCA</span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">100%</span>
            </div>
            <div className="text-xs text-slate-500">أختام QR وتشفير XML جاهز ولحظي</div>
          </div>
        </div>
      </div>

      {/* 6. الاتفاقيات القانونية (Agreements & Legal Docs) - Pillar 5 */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-sap-primary border border-emerald-200 flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-sap-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">5. الاتفاقيات والوثائق القانونية (Agreements)</h2>
              <p className="text-xs text-slate-500">استعرض نصوص التراخيص والشروط والسياسات الرسمية الخمس المعتمدة للنظام</p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold">
            5 وثائق معتمدة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Doc 1: Terms */}
          <div 
            onClick={() => handleOpenPolicy("TERMS")}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sap-primary hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📄</span>
                <span className="text-xs text-sap-primary font-bold group-hover:underline flex items-center gap-1">
                  قراءة الوثيقة <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">شروط الاستخدام (Terms of Use)</h3>
              <p className="text-xs text-slate-500">القواعد العامة المنظمة لاستخدام النظام والاشتراكات والمسؤوليات المشتركة.</p>
            </div>
          </div>

          {/* Doc 2: EULA */}
          <div 
            onClick={() => handleOpenPolicy("EULA")}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sap-primary hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📜</span>
                <span className="text-xs text-sap-primary font-bold group-hover:underline flex items-center gap-1">
                  قراءة الوثيقة <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">اتفاقية ترخيص المستخدم النهائي (EULA)</h3>
              <p className="text-xs text-slate-500">ترخيص الاستخدام المؤسسي المتوافق مع معايير SAP لحماية الملكية والبرمجيات.</p>
            </div>
          </div>

          {/* Doc 3: Privacy */}
          <div 
            onClick={() => handleOpenPolicy("PRIVACY")}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sap-primary hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🔒</span>
                <span className="text-xs text-sap-primary font-bold group-hover:underline flex items-center gap-1">
                  قراءة الوثيقة <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">سياسة الخصوصية (Privacy Policy)</h3>
              <p className="text-xs text-slate-500">شرح تفصيلي لكيفية جمع وحماية واستخدام البيانات والحسابات المسجلة.</p>
            </div>
          </div>

          {/* Doc 4: DPA */}
          <div 
            onClick={() => handleOpenPolicy("DPA")}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sap-primary hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🛡️</span>
                <span className="text-xs text-sap-primary font-bold group-hover:underline flex items-center gap-1">
                  قراءة الوثيقة <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">اتفاقية معالجة البيانات (DPA)</h3>
              <p className="text-xs text-slate-500">تحديد التزامات المعالج والمتحكم وتدابير الأمان وفق معايير ISO 27001.</p>
            </div>
          </div>

          {/* Doc 5: Disclaimer */}
          <div 
            onClick={() => handleOpenPolicy("DISCLAIMER")}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sap-primary hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">⚖️</span>
                <span className="text-xs text-sap-primary font-bold group-hover:underline flex items-center gap-1">
                  قراءة الوثيقة <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">إخلاء المسؤولية (Disclaimer)</h3>
              <p className="text-xs text-slate-500">مسؤولية التدفقات النقدية، أسعار الصرف (صنعاء/عدن)، ودقة الإدخالات المحاسبية.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Modal for Direct Reading */}
      <LegalPoliciesModal
        isOpen={localModalOpen}
        initialPolicy={selectedPolicy}
        onClose={() => setLocalModalOpen(false)}
      />

      <SapComplianceReportModal
        isOpen={complianceModalOpen}
        onClose={() => setComplianceModalOpen(false)}
      />
    </div>
  );
};
