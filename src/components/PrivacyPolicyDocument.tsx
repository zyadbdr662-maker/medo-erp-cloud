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
  Cookie,
  UserX,
  FileCheck,
  HardDrive
} from "lucide-react";

export const PrivacyPolicyDocument: React.FC = () => {
  return (
    <div className="space-y-8 text-slate-200" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/30 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                سياسة الخصوصية وسرية البيانات
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                الإصدار 2.0 المعتمد
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/40 text-xs font-mono font-bold">
                معايير GDPR &amp; SAP Cloud
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              سياسة الخصوصية وحماية البيانات لمنظومة MeDo ERP
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              تحدد هذه الوثيقة التزامات شركة <strong>ميدو تك للحلول البرمجية</strong> الصارمة بحماية بياناتك الشخصية والمالية والمحاسبية، وفقاً لأعلى معايير الأمن السيبراني والأنظمة القانونية السارية.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs font-mono space-y-1.5 min-w-[220px] shadow-lg">
            <div className="flex justify-between text-slate-400">
              <span>تاريخ التحديث:</span>
              <span className="text-white font-bold">17 سبتمبر 2026</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>حالة الوثيقة:</span>
              <span className="text-emerald-400 font-bold">نافذة وسارية المفعول</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>الجهة المُصدرة:</span>
              <span className="text-amber-400 font-bold">ميدو تك للحلول البرمجية</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>مسؤول الحماية (DPO):</span>
              <span className="text-cyan-400 font-bold">dpo@medo-erp.com</span>
            </div>
          </div>
        </div>

        {/* 4 Pillars Highlight */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-center">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>عدم بيع البيانات مطلقاً</span>
            </div>
            <p className="text-[11px] text-slate-400">لا مشاركة مع معلنين ولا تدريب AI عام</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-cyan-400 font-bold text-xs flex items-center justify-center gap-1">
              <Key className="w-3.5 h-3.5" />
              <span>تشفير بنكي AES-256</span>
            </div>
            <p className="text-[11px] text-slate-400">تشفير كامل أثناء الحفظ والنقل TLS 1.3</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-amber-400 font-bold text-xs flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>حفظ مالي 7 سنوات</span>
            </div>
            <p className="text-[11px] text-slate-400">امتثال ضريبي ومحاسبي يمني معتمد</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-purple-400 font-bold text-xs flex items-center justify-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>إشعار اختراق 72 ساعة</span>
            </div>
            <p className="text-[11px] text-slate-400">استجابة فورية ودعم فني مخصص</p>
          </div>
        </div>
      </div>

      {/* Preamble Card */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
        <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <span>ديباجة سياسة الخصوصية</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          نحن في <strong>ميدو تك للحلول البرمجية</strong> (يُشار إليها فيما بعد بـ "المزود" أو "نحن") ندرك أن حماية معلوماتك مسؤولية كبيرة، ونعمل بكل عزم وتفانٍ لحماية معلوماتك ووضعك في مركز السيطرة الكاملة عليها.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          تهدف سياسة الخصوصية هذه إلى مساعدتك في فهم:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>ما هي المعلومات التي نجمعها عنك وعن منشأتك؟</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>لماذا نجمع هذه البيانات وما هو سندنا القانوني؟</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>كيف نستخدم ونحمي البيانات في مراكز الحوسبة السحابية؟</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>كيف يمكنك تحديث بياناتك، إدارتها، تصديرها، أو حذفها؟</span>
          </div>
        </div>
      </div>

      {/* 15 Comprehensive Articles */}
      <div className="space-y-6">

        {/* Article 1 */}
        <section id="priv-art-1" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold">1</span>
              <span>المادة 1: التعريفات والمصطلحات المعتمدة</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              المصطلحات
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-300 border-b border-slate-800">
                  <th className="p-2.5 font-bold w-1/4">المصطلح</th>
                  <th className="p-2.5 font-bold">التعريف القانوني والتقني</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                <tr>
                  <td className="p-2.5 font-bold text-white">البيانات الشخصية</td>
                  <td className="p-2.5 text-slate-300">أي معلومات تخص شخصاً طبيعياً معرّفاً أو يمكن التعرف عليه بصورة مباشرة أو غير مباشرة (كالاسم والبريد ورقم الهاتف).</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">البيانات المالية</td>
                  <td className="p-2.5 text-slate-300">المعلومات المحاسبية، فواتير المبيعات والمشتريات، القيود اليومية، موازين المراجعة، أرصدة الخزائن والبنوك للمنشأة.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">المعالجة (Processing)</td>
                  <td className="p-2.5 text-slate-300">أي عملية أو سلسلة عمليات تُجرى على البيانات، مثل الجمع، التسجيل، التنظيم، الحفظ، الملاءمة، الاسترجاع، أو الحذف.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">المستخدم (User)</td>
                  <td className="p-2.5 text-slate-300">أي شخص طبيعي مُفوّض يستخدم المنظومة ويملك حساب دخول مصادق عليه.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">المستأجر (Tenant)</td>
                  <td className="p-2.5 text-slate-300">الشركة أو المؤسسة أو التاجر المشترك في منصة MeDo ERP ولديه بيئة بيانات سحابية معزولة منطقياً.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">المزود (Provider)</td>
                  <td className="p-2.5 text-slate-300">شركة ميدو تك للحلول البرمجية (MeDo Tech for Software Solutions).</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">مسؤول حماية البيانات (DPO)</td>
                  <td className="p-2.5 text-slate-300">المسؤول الإداري والتقني المعين من قبل المزود للإشراف على الامتثال لسياسات الخصوصية وحماية البيانات.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">GDPR / معايير الخصوصية</td>
                  <td className="p-2.5 text-slate-300">اللائحة العامة لحماية البيانات والأنظمة الدولية والوطنية المقارنة لضمان السيادة الرقمية وسرية البيانات.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">الكوكيز (Cookies)</td>
                  <td className="p-2.5 text-slate-300">ملفات نصية مشفرة وصغيرة تُخزن على متصفحك للحفاظ على أمان الجلسة وتفضيلات الواجهة.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Article 2 */}
        <section id="priv-art-2" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold">2</span>
              <span>المادة 2: المعلومات التي نجمعها</span>
            </h3>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              نطاق البيانات
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="text-white font-bold flex items-center gap-1.5 text-sm">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>2.1. المعلومات التي تزودنا بها مباشرة</span>
              </h4>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li><strong>بيانات التسجيل:</strong> الاسم الكامل، البريد الإلكتروني، رقم الهاتف، والدور الوظيفي.</li>
                <li><strong>بيانات المنشأة:</strong> الاسم التجاري، رقم السجل، الرقم الضريبي، والعنوان.</li>
                <li><strong>البيانات المالية:</strong> قيود اليومية، فواتير المبيعات والمشتريات، موازين المراجعة، والمخازن.</li>
                <li><strong>بيانات الدفع والفوترة:</strong> سجلات سداد الاشتراكات البنكية والإلكترونية (لا نخزن أرقام البطاقات الحساسة بل تُعالج عبر بوابات مشفرة).</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="text-white font-bold flex items-center gap-1.5 text-sm">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span>2.2. معلومات النشاط والتشغيل</span>
              </h4>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li><strong>المصطلحات وعمليات البحث:</strong> الكلمات المفتاحية المستخدمة في شجرة الحسابات والفواتير.</li>
                <li><strong>سجل التدقيق (Audit Trail):</strong> توثيق كل عملية إنشاء، تعديل، إلغاء، أو ترحيل مالي مع الختم الزمني.</li>
                <li><strong>تفاعلات الواجهة:</strong> الشاشات والوحدات الأكثر استخداماً لتخصيص الوصول السريع.</li>
                <li><strong>التفضيلات الشخصية:</strong> اللغة، الثيم اللوني، والخيارات المحاسبية المخصصة.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="text-white font-bold flex items-center gap-1.5 text-sm">
                <Server className="w-4 h-4 text-amber-400" />
                <span>2.3. معلومات الأجهزة والمتصفحات</span>
              </h4>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li><strong>عناوين IP:</strong> لتأمين الدخول ورصد محاولات الاختراق الجغرافي.</li>
                <li><strong>نوع المتصفح ونظام التشغيل:</strong> لضمان توافق العرض والأداء السحابي.</li>
                <li><strong>معرفات الجلسة:</strong> بصمة جلسة مشفرة لضمان عدم سرقة الجلسة (Session Hijacking).</li>
                <li><strong>دقة الشاشة وإعدادات العرض:</strong> لتكييف التصميم المتجاوب.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="text-white font-bold flex items-center gap-1.5 text-sm">
                <Globe2 className="w-4 h-4 text-purple-400" />
                <span>2.4. معلومات الموقع الجغرافي</span>
              </h4>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li><strong>الموقع التقريبي:</strong> استناداً لعنوان IP للتحقق الأمني ومنع الدخول المشبوه.</li>
                <li><strong>الفرع النشط:</strong> فرع المنشأة الذي تتم فيه العمليات المحاسبية.</li>
                <li><strong>العملة الإقليمية:</strong> تحديد فروق الصرف بين مراكز العمليات (صنعاء / عدن / دولي).</li>
              </ul>
            </div>
          </div>

          {/* Negative clause */}
          <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-200 flex items-start gap-2.5">
            <UserX className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-rose-300 font-bold mb-0.5">2.5. معلومات لا نجمعها مطلقاً:</strong>
              نحن نلتزم بشكل قاطع بعدم جمع أو معالجة أي بيانات صحية، دينية، سياسية، عرقية، أو بيومترية للمستخدمين.
            </div>
          </div>
        </section>

        {/* Article 3 */}
        <section id="priv-art-3" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold">3</span>
              <span>المادة 3: كيف نجمع المعلومات</span>
            </h3>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              طرق الجمع
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-emerald-400 block text-sm">3.1. مباشرة منك</span>
              <p className="text-slate-300 leading-relaxed">
                عند قيامك بإنشاء حسابك، أو إدخال قيود محاسبية، أو إنشاء فواتير وسندات، أو فتح تذاكر دعم فني.
              </p>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-cyan-400 block text-sm">3.2. تلقائياً أثناء الاستخدام</span>
              <p className="text-slate-300 leading-relaxed">
                عبر ملفات تعريف الارتباط التقنية (Cookies)، وسجلات خوادم النظام المشفرة، وأدوات قياس زمن استجابة واجهة المستخدم.
              </p>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-purple-400 block text-sm">3.3. من أطراف ثالثة معتمدة</span>
              <p className="text-slate-300 leading-relaxed">
                بوابات السداد المعتمدة لتأكيد استلام رسوم الاشتراك، وخدمات التحقق الأمني للمصادقة السحابية.
              </p>
            </div>
          </div>
        </section>

        {/* Article 4 */}
        <section id="priv-art-4" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold">4</span>
              <span>المادة 4: لماذا نجمع البيانات (أغراض المعالجة)</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              أهداف المعالجة
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-white block font-bold">4.1. تقديم الخدمات وتشغيل المنظومة</strong>
              <p className="text-slate-400">معالجة القيود المحاسبية، إصدار الفواتير، إدارة المخازن، وتوليد القوائم المالية المعتمدة.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-white block font-bold">4.2. تحسين الأداء وتطوير النظام</strong>
              <p className="text-slate-400">رصد الأخطاء البرمجية وحلها فوراً، وتحسين سرعة استجابة الاستعلامات المعقدة وموازين المراجعة.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-white block font-bold">4.3. الأمان والسلامة السيبرانية</strong>
              <p className="text-slate-400">كشف الاختراقات، منع الاحتيال المالي، ومراقبة محاولات الدخول المشبوهة أو المتكررة.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-white block font-bold">4.4. التواصل والإشعارات الهامة</strong>
              <p className="text-slate-400">إرسال تنبيهات الأمان، إشعارات النسخ الاحتياطي، وفواتير التجديد، والرد على استفساراتكم.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-white block font-bold">4.5. الامتثال القانوني والضريبي</strong>
              <p className="text-slate-400">الالتزام بقوانين الضرائب والمحاسبة في الجمهورية اليمنية وحفظ السجلات المحاسبية للمدد الإلزامية.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-white block font-bold">4.6. التحليلات التشغيلية الداخلية</strong>
              <p className="text-slate-400">تحليل مؤشرات توفر الخدمة (Uptime) واستقرار خوادم الحوسبة السحابية.</p>
            </div>
          </div>
        </section>

        {/* Article 5 */}
        <section id="priv-art-5" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold">5</span>
              <span>المادة 5: الأساس القانوني للمعالجة</span>
            </h3>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              المشروعية القانونية
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-300 border-b border-slate-800">
                  <th className="p-2.5 font-bold w-1/4">الأساس القانوني</th>
                  <th className="p-2.5 font-bold">نطاق وتطبيق المعالجة في المنظومة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                <tr>
                  <td className="p-2.5 font-bold text-emerald-400">تنفيذ العقد (Contract Execution)</td>
                  <td className="p-2.5 text-slate-300">معالجة البيانات ضرورية لتنفيذ عقد اشتراك المنشأة وتقديم الخدمات المحاسبية والسحابية المتفق عليها.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-emerald-400">الموافقة الصريحة (Explicit Consent)</td>
                  <td className="p-2.5 text-slate-300">لإرسال إشعارات التحديثات الاختيارية والتواصل بشأن المميزات البرمجية الجديدة.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-emerald-400">المصلحة المشروعة (Legitimate Interest)</td>
                  <td className="p-2.5 text-slate-300">لتأمين البنية التحتية، كشف الاحتيال، وتحسين سرعة واستقرار المنصة لصالح جميع المستأجرين.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-emerald-400">الالتزام القانوني (Legal Obligation)</td>
                  <td className="p-2.5 text-slate-300">للامتثال للأنظمة والتشريعات المحاسبية والضريبية السارية في الجمهورية اليمنية.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-emerald-400">حماية المصالح الحيوية (Vital Interests)</td>
                  <td className="p-2.5 text-slate-300">في حالات الطوارئ القصوى والكوارث لحماية سلامة البيانات من الفقدان أو التلف الشامل.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Article 6 */}
        <section id="priv-art-6" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold">6</span>
              <span>المادة 6: عناصر التحكم في الخصوصية وحقوقك (GDPR Rights)</span>
            </h3>
            <span className="text-[11px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
              8 حقوق أساسية
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-emerald-400 block font-bold">6.1. الحق في الوصول</strong>
              <p className="text-slate-300">طلب نسخة شاملة من كافة بياناتك المخزنة لدينا، ويتم تسليمها خلال <strong>30 يوماً</strong>.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-emerald-400 block font-bold">6.2. الحق في التصحيح</strong>
              <p className="text-slate-300">تعديل وتصحيح أي بيانات غير دقيقة مباشرة من شاشة إعدادات المنشأة أو عبر الدعم الفني.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-emerald-400 block font-bold">6.3. الحق في الحذف</strong>
              <p className="text-slate-300">طلب حذف حسابك وبياناتك الشخصية نهائياً، مع مراعاة فترات الحفظ المحاسبية القانونية.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-emerald-400 block font-bold">6.4. الحق في التقييد</strong>
              <p className="text-slate-300">طلب تجميد أو تقييد معالجة بياناتك عند وجود نزاع قائم حول صحتها أو قانونية المعالجة.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-emerald-400 block font-bold">6.5. الحق في نقل البيانات</strong>
              <p className="text-slate-300">تصدير بياناتك المالية بالكامل بصيغ قياسية مهيكلة (Excel، CSV، JSON) لنقلها لأي منصة أخرى.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-emerald-400 block font-bold">6.6. الحق في الاعتراض</strong>
              <p className="text-slate-300">الاعتراض في أي وقت على معالجة بياناتك لأغراض تسويقية أو غير تشغيلية.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-emerald-400 block font-bold">6.7. الحق في سحب الموافقة</strong>
              <p className="text-slate-300">سحب أي موافقة منحتها مسبقاً في أي وقت دون أن يؤثر ذلك على مشروعية المعالجة السابقة.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-emerald-400 block font-bold">6.8. الحق في تقديم شكوى</strong>
              <p className="text-slate-300">تقديم شكوى رسمية إلى مسؤول حماية البيانات (DPO) أو إلى الجهات القضائية والتنظيمية المختصة.</p>
            </div>
          </div>
        </section>

        {/* Article 7 */}
        <section id="priv-art-7" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold">7</span>
              <span>المادة 7: مشاركة المعلومات وحدودها الصارمة</span>
            </h3>
            <span className="text-[11px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
              تعهد الأمان
            </span>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 space-y-1.5">
              <strong className="text-emerald-300 font-bold text-sm block">7.1. التعهد الصارم بعدم المشاركة أو البيع:</strong>
              <p className="text-slate-200">
                <strong>لا نبيع بياناتك</strong> لأي جهة تجارية أو إعلانية، و<strong>لا نشارك بياناتك</strong> مع شركات الدعاية، و<strong>لا نستخدم بياناتك المالية أو قيودك المحاسبية لتدريب نماذج الذكاء المالي المتقدم العامة</strong>. بياناتك ملك لك وحدك وتبقى سرية ومغلقة.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <strong className="text-white font-bold block">7.2. الاستثناءات القانونية الحصرية:</strong>
              <p className="text-slate-400">
                لا يتم الإفصاح عن البيانات إلا: (أ) بموافقتك الصريحة والمكتوبة، أو (ب) للامتثال لأمر قضائي رسمي نافذ صادر من محكمة مختصة بالجمهورية اليمنية، أو (ج) لحماية حقوقنا والدفاع ضد النزاعات القانونية المفتعلة.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <strong className="text-white font-bold block">7.3. مزودو الخدمات السحابية والبنية التحتية المعتمدون:</strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-bold text-amber-400 block">Huawei Cloud</span>
                  <span className="text-slate-400">استضافة قواعد البيانات المركزية المعزولة</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-bold text-amber-400 block">Alibaba Cloud</span>
                  <span className="text-slate-400">النسخ الاحتياطي الجغرافي المشفر متعدد المراكز</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-bold text-amber-400 block">Google Cloud</span>
                  <span className="text-slate-400">المراقبة التشغيلية وتوافر الأنظمة العالمية</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-bold text-amber-400 block">Firebase</span>
                  <span className="text-slate-400">إدارة المصادقة والجلسات الآمنة المشفرة</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                جميع هؤلاء المزودين ملزمون باتفاقيات حماية بيانات ومعالجة صارمة (DPA) ومطابقون لمعايير ISO 27001 و SOC 2.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <strong>7.4. نقل الملكية والاندماج:</strong> في حال بيع الشركة أو اندماجها، يتم إشعار المستأجرين قبل 30 يوماً، مع الاحتفاظ بحق تصدير البيانات أو حذفها نهائياً قبل النقل.
            </div>
          </div>
        </section>

        {/* Article 8 */}
        <section id="priv-art-8" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold">8</span>
              <span>المادة 8: حماية المعلومات والأمن السيبراني</span>
            </h3>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              حماية متعددة الطبقات
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
              <strong className="text-cyan-400 font-bold block text-sm">8.1. إجراءات الأمان التقنية</strong>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                <li>تشفير بنكي عالي المستوى <strong>AES-256</strong>.</li>
                <li>تشفير بروتوكول النقل <strong>TLS 1.3</strong>.</li>
                <li>المصادقة الثنائية <strong>(2FA)</strong> للمديرين.</li>
                <li>مراقبة واكتشاف التهديدات 24/7.</li>
                <li>جدار حماية تطبيقي WAF لمنع الاختراق.</li>
              </ul>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
              <strong className="text-cyan-400 font-bold block text-sm">8.2. سياسة الوصول المقيد</strong>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                <li>حصر الوصول الهندسي على موظفين محددين ومصرح لهم.</li>
                <li>توقيع اتفاقيات سرية وعدم إفشاء مطلقة (NDA).</li>
                <li>تسجيل كل عملية وصول في سجل التدقيق الأمني.</li>
                <li>تطبيق مبدأ الحد الأدنى من الصلاحيات (Least Privilege).</li>
              </ul>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
              <strong className="text-cyan-400 font-bold block text-sm">8.3. المراجعات والاختبارات</strong>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                <li>مراجعة سنوية شاملة للسياسات الأمنية.</li>
                <li>اختبارات اختراق دورية (Penetration Tests).</li>
                <li>تحديثات وتصحيحات أمنية تلقائية فورية.</li>
                <li>تدريب مستمر للمطورين على الأمان البرمجي.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Article 9 */}
        <section id="priv-art-9" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold">9</span>
              <span>المادة 9: مدة الاحتفاظ بالبيانات (Data Retention)</span>
            </h3>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              مدد الحفظ
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <strong className="text-white block font-bold">9.1. البيانات التشغيلية النشطة</strong>
              <p className="text-slate-300">تُحفظ طالما كان اشتراك المنشأة نشطاً، وتُحذف خلال <strong>30 يوماً</strong> من تاريخ الإلغاء النهائي للحساب.</p>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <strong className="text-amber-400 block font-bold">9.2. البيانات والقيود المالية</strong>
              <p className="text-slate-300">تُحفظ لمدة <strong>7 سنوات</strong> امتثالاً للأنظمة المحاسبية والضريبية في الجمهورية اليمنية، ثم تُتلف رقمياً.</p>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <strong className="text-white block font-bold">9.3. سجلات الدخول (Logs)</strong>
              <p className="text-slate-300">تُحفظ لمدة <strong>سنة واحدة (12 شهراً)</strong> للتحقق الأمني الجنائي ثم تُحذف تلقائياً.</p>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <strong className="text-white block font-bold">9.4. البيانات المؤرشفة المجهولة</strong>
              <p className="text-slate-300">تُحفظ بصيغة مجهولة الهوية تماماً (Anonymized) لأغراض دراسات الأداء الإحصائي دون أي ارتباط بالأشخاص.</p>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1 sm:col-span-2">
              <strong className="text-white block font-bold">9.5. بيانات النزاعات القانونية</strong>
              <p className="text-slate-300">في حال وجود نزاع قضائي معلق، يتم تجميد البيانات والاحتفاظ بها لحين صدور حكم قضائي نهائي وبات.</p>
            </div>
          </div>
        </section>

        {/* Article 10 */}
        <section id="priv-art-10" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold">10</span>
              <span>المادة 10: نقل البيانات عبر الحدود ومواقع الخوادم</span>
            </h3>
            <span className="text-[11px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
              3 مراكز بيانات
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>الجمهورية اليمنية</span>
              </div>
              <p className="text-slate-300">نسخة محلية للعمليات المباشرة والامتثال للتشريعات الوطنية.</p>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Globe2 className="w-3.5 h-3.5" />
                <span>المملكة العربية السعودية</span>
              </div>
              <p className="text-slate-300">مركز سحابي إقليمي لسرعة الربط والاستجابة الفائقة.</p>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>جمهورية ألمانيا الاتحادية</span>
              </div>
              <p className="text-slate-300">نسخة احتياطية مشفرة لضمان التعافي من الكوارث والامتثال لمعايير GDPR.</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong>الضمانات والموافقة:</strong> نستخدم البنود التعاقدية المعيارية المعتمدة دولياً، وباستخدامك للمنظومة فإنك توافق على النقل والتخزين المشفر وفقاً للضمانات الصارمة الموضحة أعلاه، مع حقك في الاعتراض بأي وقت.
          </p>
        </section>

        {/* Article 11 */}
        <section id="priv-art-11" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold">11</span>
              <span>المادة 11: ملفات تعريف الارتباط (Cookies)</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              4 أنواع
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-300 border-b border-slate-800">
                  <th className="p-2.5 font-bold w-1/4">نوع ملف الكوكيز</th>
                  <th className="p-2.5 font-bold">الغرض التشغيلي</th>
                  <th className="p-2.5 font-bold w-1/4">إمكانية التعطيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                <tr>
                  <td className="p-2.5 font-bold text-white">ضرورية وأساسية (Essential)</td>
                  <td className="p-2.5 text-slate-300">تشغيل الجلسات الآمنة، التحقق من التوكنات، وحماية المنظومة من هجمات CSRF.</td>
                  <td className="p-2.5 text-rose-400 font-bold">لا يمكن إلغاؤها (ضرورية للنظام)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">وظيفية (Functional)</td>
                  <td className="p-2.5 text-slate-300">تذكر تفضيلاتك كاللغة، الثيم الداكن/الفاتح، والفرع الافتراضي المختار.</td>
                  <td className="p-2.5 text-slate-300">يمكن تعطيلها من إعدادات المتصفح</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">تحليلية (Analytics)</td>
                  <td className="p-2.5 text-slate-300">قياس سرعة استجابة الشاشات ورصد الأخطاء البرمجية لتحسين الأداء.</td>
                  <td className="p-2.5 text-emerald-400 font-bold">اختيارية</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">تسويقية (Marketing)</td>
                  <td className="p-2.5 text-slate-300">إعلانات مخصصة (غير مستخدمة بتاتاً داخل النظام المحاسبي التشغيلي الداخلي).</td>
                  <td className="p-2.5 text-emerald-400 font-bold">معطلة تلقائياً واختيارية</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400">
            * خدمات التحليل الخارجية المعتمدة للبوابة الخارجية: Google Analytics، Microsoft Clarity، و Hotjar، وتعمل وفق سياسات تشفير صارمة دون قراءة دفاتر الحسابات الداخلية.
          </p>
        </section>

        {/* Article 12 */}
        <section id="priv-art-12" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold">12</span>
              <span>المادة 12: خصوصية الأطفال والقُصَّر</span>
            </h3>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              18+ عاماً
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <strong className="text-white block font-bold">12.1. الحد الأدنى للسن القانوني</strong>
              <p className="text-slate-300">المنظومة مخصصة للمنشآت والمحاسبين والبالغين سن الرشد القانوني (18 عاماً فأكثر).</p>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <strong className="text-white block font-bold">12.2. الحظر الصارم للجمع</strong>
              <p className="text-slate-300">لا نجمع بيانات الأطفال عمداً، وفي حال اكتشاف أي حساب لطفل أو قاصر يتم حذفه فوراً.</p>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <strong className="text-white block font-bold">12.3. الإبلاغ الفوري</strong>
              <p className="text-slate-300">لإبلاغنا عن أي حساب مشتبه به لقاصر: يرجى مراسلتنا على: <code className="text-emerald-400">privacy@medo-erp.com</code>.</p>
            </div>
          </div>
        </section>

        {/* Article 13 */}
        <section id="priv-art-13" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold">13</span>
              <span>المادة 13: الإشعار والتعامل عند حدوث اختراق أمني</span>
            </h3>
            <span className="text-[11px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
              خلال 72 ساعة
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <strong className="text-purple-400 block font-bold">13.1. الاحتواء والتحقيق الفوري</strong>
              <p className="text-slate-300">عزل الأنظمة المتأثرة فوراً، وإيقاف مسار التسلل، وبدء تحقيق فني لمعرفة السبب والآثار.</p>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <strong className="text-purple-400 block font-bold">13.2. الإشعار خلال 72 ساعة</strong>
              <p className="text-slate-300">إشعارك رسمياً بالبريد الإلكتروني موضحاً: ما حدث، ما هي البيانات المحتمل تأثرها، والتدابير المتبعة.</p>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <strong className="text-purple-400 block font-bold">13.3. الدعم والتعاون القضائي</strong>
              <p className="text-slate-300">تقديم الدعم للمتأثرين والتعاون مع الجهات الأمنية والقضائية لتعقب وملاحقة الجناة.</p>
            </div>
          </div>
        </section>

        {/* Article 14 */}
        <section id="priv-art-14" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold">14</span>
              <span>المادة 14: الإشعارات والتحديثات الدورية</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              إشعار مسبق 30 يوماً
            </span>
          </div>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>
              <strong>14.1. حق التحديث:</strong> نحتفظ بحق مراجعة وتحديث هذه السياسة دورياً لمواكبة التطورات التكنولوجية والقانونية.
            </p>
            <p>
              <strong>14.2. الإشعار بالتغييرات الجوهرية:</strong> نلتزم بإخطار المنشآت بأي تعديل جوهري يمس حقوقهم قبل <strong>30 يوماً</strong> من تاريخ السريان عبر البريد الإلكتروني وشريط الإشعارات داخل المنظومة.
            </p>
            <p>
              <strong>14.3. الموافقة بالاستمرار:</strong> استمرار استخدامك للمنظومة بعد انقضاء مهلة الـ 30 يوماً يُعد إقراراً بالموافقة على البنود المعدلة، ويحق لك إلغاء الاشتراك وتصدير كامل بياناتك قبل ذلك.
            </p>
          </div>
        </section>

        {/* Article 15 */}
        <section id="priv-art-15" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold">15</span>
              <span>المادة 15: التواصل معنا ومسؤول حماية البيانات (DPO)</span>
            </h3>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              قنوات الاتصال المعتمدة
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">مسؤول حماية البيانات (DPO):</span>
              <a href="mailto:dpo@medo-erp.com" className="font-mono text-emerald-400 hover:underline font-bold">dpo@medo-erp.com</a>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">إدارة الخصوصية وسرية البيانات:</span>
              <a href="mailto:privacy@medo-erp.com" className="font-mono text-cyan-400 hover:underline font-bold">privacy@medo-erp.com</a>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">مركز الاستجابة الأمنية (Security):</span>
              <a href="mailto:security@medo-erp.com" className="font-mono text-purple-400 hover:underline font-bold">security@medo-erp.com</a>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">واتساب وهاتف الطوارئ:</span>
              <a href="https://wa.me/967773586047" target="_blank" rel="noreferrer" className="font-mono text-emerald-400 hover:underline font-bold" dir="ltr">+0967773586047</a>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1 sm:col-span-2">
              <span className="text-slate-400 block font-bold">المقر الإداري الرئيسي:</span>
              <span className="text-white font-bold">خمر - الكدوي - عمارة القلمي، محافظة عمران، الجمهورية اليمنية</span>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-300 mb-2">أوقات الاستجابة الملتزم بها (Response SLAs):</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-center font-mono">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">الاستفسارات العامة</span>
                <span className="text-emerald-400 font-bold">خلال 48 ساعة</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">طلبات الوصول للبيانات</span>
                <span className="text-cyan-400 font-bold">خلال 30 يوماً</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">طلبات الحذف النهائي</span>
                <span className="text-amber-400 font-bold">خلال 30 يوماً</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">بلاغات الاختراق العاجلة</span>
                <span className="text-purple-400 font-bold">خلال 24 ساعة (24/7)</span>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Official Sign-off Footer Card */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-900/40 rounded-3xl p-6 sm:p-8 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-black shadow-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-xl mx-auto">
          <h3 className="text-lg sm:text-xl font-black text-white">
            ميدو تك للحلول البرمجية — MeDo Tech for Software Solutions
          </h3>
          <p className="text-xs text-slate-400">
            خصوصيتكم وسرية دفاتركم المالية أمانة في أعناقنا. نلتزم بأعلى معايير الحماية الرقمية والسيادة الوطنية على البيانات.
          </p>
        </div>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400 border-t border-slate-800/80">
          <span>📧 privacy@medo-erp.com</span>
          <span>•</span>
          <span>📧 dpo@medo-erp.com</span>
          <span>•</span>
          <span dir="ltr">📞 +0967773586047</span>
          <span>•</span>
          <span>📍 خمر - الكدوي - عمارة القلمي، عمران، اليمن</span>
        </div>
        <div className="text-[11px] text-slate-500 font-bold">
          © 2026 منصة MeDo ERP — جميع الحقوق محفوظة ومسجلة رسمياً
        </div>
      </div>
    </div>
  );
};
