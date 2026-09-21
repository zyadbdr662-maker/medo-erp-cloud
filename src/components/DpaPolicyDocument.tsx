import React from "react";
import {
  ShieldCheck,
  Lock,
  Database,
  Server,
  Cloud,
  Globe2,
  Users,
  Building2,
  Scale,
  FileText,
  Clock,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  HelpCircle,
  Eye,
  Key,
  Layers,
  Sparkles,
  UserX,
  FileCheck,
  HardDrive
} from "lucide-react";

export const DpaPolicyDocument: React.FC = () => {
  return (
    <div className="space-y-8 text-slate-200" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/30 border border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                اتفاقية معالجة البيانات (DPA)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                الإصدار 2.0 المعتمد
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 text-xs font-mono font-bold">
                GDPR &amp; ISO 27001
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              اتفاقية معالجة البيانات (Data Processing Agreement - DPA)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              تحدد هذه الاتفاقية الشروط والالتزامات القانونية والتقنية لمعالجة وحماية بيانات العملاء والمؤسسات المشتركة في منصة <strong>MeDo ERP</strong> وفقاً للمعايير العالمية.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs font-mono space-y-1.5 min-w-[220px] shadow-lg">
            <div className="flex justify-between text-slate-400">
              <span>تاريخ التحديث:</span>
              <span className="text-slate-200 font-bold">17 سبتمبر 2026</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>الحالة القانونية:</span>
              <span className="text-emerald-400 font-bold">ساري وملزم</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>المادة التنظيمية:</span>
              <span className="text-blue-300 font-bold">المادة 28 من GDPR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article 1 */}
      <section id="dpa-art-1" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black">
            1
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">المادة الأولى: النطاق والتعريفات</h2>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            تُطبق اتفاقية معالجة البيانات (DPA) هذه بين <strong>العميل</strong> (المراقب للبيانات - Data Controller) وبين <strong>مجموعة بن زياد التجارية &amp; ميدو تك للحلول البرمجية</strong> (المعالج للبيانات - Data Processor) المشغلة لمنصة MeDo ERP السحابية.
          </p>
          <p>
            تغطي هذه الاتفاقية كافة العمليات المتعلقة بجمع، تخزين، معالجة، وحماية البيانات الشخصية والمالية والمحاسبية المدخلة عبر النظام السحابي أو قواعد البيانات الموزعة (محلياً، هواوي كلاود، علي بابا، وقواعد كيوكيو).
          </p>
        </div>
      </section>

      {/* Article 2 */}
      <section id="dpa-art-2" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black">
            2
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">المادة الثانية: التزامات معالج البيانات (المنصة)</h2>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>يُلزم المعالج (MeDo ERP) بالآتي:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 pr-2">
            <li>معالجة بيانات العميل وفقاً للتعليمات الموثقة والمكتوبة الصادرة عن العميل حصرياً.</li>
            <li>توفير الضمانات التقنية والتنظيمية لتنفيذ متطلبات الحماية والأمان السيبراني.</li>
            <li>عدم نقل أو معالجة البيانات خارج النطاقات المصرح بها إلا بطلب وموافقة صريحة من العميل.</li>
            <li>ضمان التزام كافة أعضاء الفريق الفني والدعم بالسرية التامة والتوقيع على اتفاقيات عدم إفشاء المعلومات.</li>
          </ul>
        </div>
      </section>

      {/* Article 3 */}
      <section id="dpa-art-3" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black">
            3
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">المادة الثالثة: أمن البيانات والتشفير</h2>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            تعتمد المنصة أعلى معايير التشفير (AES-256 للبيانات المخزنة و TLS 1.3 للبيانات أثناء النقل). يتم حماية الجلسات بمركبات المصادقة المشفرة ورموز منع التزوير (CSRF Tokens) وحواجز الحماية النارية المتقدمة (WAF).
          </p>
        </div>
      </section>

      {/* Article 4 */}
      <section id="dpa-art-4" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black">
            4
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">المادة الرابعة: التدقيق وحقوق الرقابة</h2>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            يحق للعميل الاطلاع على تقارير التدقيق الأمني والسجلات السيادية الخاصة بحسابه، ومراجعة حالة النسخ الاحتياطي ومزامنة البيانات في أي وقت عبر لوحة التحكم الخاصة به أو بطلب رسمي لقسم الدعم الفني.
          </p>
        </div>
      </section>

      {/* Contact DPO */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border border-blue-500/30 rounded-3xl p-6 text-center space-y-3">
        <h3 className="text-base font-bold text-white">مسؤول حماية البيانات والالتزام (DPO)</h3>
        <p className="text-xs text-slate-300">للاستفسارات القانونية المتعلقة باتفاقية معالجة البيانات، يرجى مراسلتنا عبر البريد المعتمد:</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 font-mono text-xs font-bold">
          <Mail className="w-4 h-4" />
          <span>dpo@medo-erp.com</span>
        </div>
      </div>
    </div>
  );
};
