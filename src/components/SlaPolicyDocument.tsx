import React from "react";
import {
  ShieldCheck,
  Zap,
  Server,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Layers,
  FileText,
  Lock,
  Award
} from "lucide-react";

export const SlaPolicyDocument: React.FC = () => {
  return (
    <div className="space-y-8 text-slate-200" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/30 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                اتفاقية مستوى الخدمة (SLA)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                الإصدار 2.0 المعتمد
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 text-xs font-mono font-bold">
                توفر حتى 99.99%
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              اتفاقية مستوى الخدمة (Service Level Agreement - SLA)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              تحدد هذه الاتفاقية التزامات شركة <strong>ميدو تك للحلول البرمجية</strong> بتقديم خدمات منصة <strong>MeDo ERP</strong> بأعلى مستويات الجودة والموثوقية ومعايير الدعم والتوفر.
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
              <span>المزود:</span>
              <span className="text-indigo-300 font-bold">ميدو تك للحلول</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article 1 & 2 */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black">
            1-2
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">المادة الأولى والثانية: التعريفات ونطاق الخدمة</h2>
        </div>
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            تلتزم <strong>ميدو تك للحلول البرمجية</strong> (المزود) بتقديم خدمات تشغيل منصة MeDo ERP السحابية وتخزين البيانات والنسخ الاحتياطي والتحديثات المستمرة للعملاء وفقاً لباقات الاشتراكات (التجريبية، الأساسية، المتقدمة، والمؤسسية).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-400" />
                الخدمات المشمولة
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
                <li>تشغيل المنصة السحابية 24/7</li>
                <li>تخزين السجلات والبيانات المحاسبية</li>
                <li>إجراء النسخ الاحتياطي التلقائي والمشفر</li>
                <li>الدعم الفني حسب الباقة</li>
              </ul>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                نسب التوفر الشهري (Uptime)
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
                <li><strong>الأساسية:</strong> 99.5%</li>
                <li><strong>المتقدمة:</strong> 99.9% (الانقطاع المسموح ~43 دقيقة/شهر)</li>
                <li><strong>المؤسسية:</strong> 99.99%</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Article 4 & 5: Response and Resolution Times */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black">
            4-5
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">المادة الرابعة والخامسة: أوقات الاستجابة والحل</h2>
        </div>
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            تلتزم فرق الدعم الفني بالاستجابة للتذاكر وحلها خلال الأطر الزمنية المحددة بناءً على درجة الأولوية والباقة المشترك بها:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="p-3">أولوية المشكلة</th>
                  <th className="p-3">وصف الحالة</th>
                  <th className="p-3">وقت الاستجابة (المؤسسية)</th>
                  <th className="p-3">وقت الحل المستهدف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="p-3 font-bold text-rose-400">حرجة (Critical)</td>
                  <td className="p-3 text-slate-300">توقف تام للمنصة أو عدم القدرة على البيع</td>
                  <td className="p-3 text-indigo-300 font-mono">ساعة واحدة (1h)</td>
                  <td className="p-3 font-mono">4 ساعات</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-amber-400">عالية (High)</td>
                  <td className="p-3 text-slate-300">تعطل ميزة رئيسية مع وجود بديل</td>
                  <td className="p-3 text-indigo-300 font-mono">ساعتان (2h)</td>
                  <td className="p-3 font-mono">12 - 24 ساعة</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-blue-400">متوسطة (Medium)</td>
                  <td className="p-3 text-slate-300">مشكلة جزئية لا تؤثر على العمليات الكبرى</td>
                  <td className="p-3 text-indigo-300 font-mono">6 ساعات</td>
                  <td className="p-3 font-mono">48 - 72 ساعة</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Article 6 & 9: Performance & Compensation */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black">
            6-9
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">المادة السادسة والتاسعة: الأداء ومعايير التعويض</h2>
        </div>
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            تستهدف المنصة سرعة تحميل لا تتجاوز 3 ثوانٍ للصفحات والفواتير، وسرعة بحث تقل عن ثانية واحدة. وفي حال هبوط نسب التوفر عن المتفق عليه بسبب تقصير من جهة المزود، يحق للعميل المطالبة بالتعويضات وفق الجدول الآتي:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
              <div className="text-[10px] text-slate-400">التوفر 99.1% - 99.5%</div>
              <div className="text-base font-bold text-indigo-400">10% تعويض</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
              <div className="text-[10px] text-slate-400">التوفر 95% - 99%</div>
              <div className="text-base font-bold text-amber-400">25% تعويض</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
              <div className="text-[10px] text-slate-400">التوفر أقل من 95%</div>
              <div className="text-base font-bold text-rose-400">50% تعويض</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
              <div className="text-[10px] text-slate-400">مهلة المطالبة</div>
              <div className="text-base font-bold text-emerald-400">30 يوماً</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Support */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-indigo-500/30 rounded-3xl p-6 text-center space-y-3">
        <h3 className="text-base font-bold text-white">قنوات الدعم الفني والطوارئ</h3>
        <p className="text-xs text-slate-300">لتقديم طلبات الدعم الفني أو متابعة حالة الخدمات:</p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 font-mono text-xs font-bold">
            <Mail className="w-4 h-4" />
            <span>support@medo-erp.com</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs font-bold">
            <Phone className="w-4 h-4" />
            <span dir="ltr">+0967773586047</span>
          </div>
        </div>
      </div>
    </div>
  );
};
