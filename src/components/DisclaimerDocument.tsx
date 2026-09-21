import React from "react";
import {
  AlertTriangle,
  Scale,
  ShieldAlert,
  Coins,
  TrendingDown,
  Sparkles,
  Landmark,
  WifiOff,
  Briefcase,
  UserCheck,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  MapPin,
  FileText,
  Clock,
  Shield,
  HelpCircle,
  DollarSign,
  Cpu,
  Calculator,
  Gavel,
  BookOpen
} from "lucide-react";

export const DisclaimerDocument: React.FC = () => {
  return (
    <div className="space-y-8 text-slate-200" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/30 border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                وثيقة إخلاء المسؤولية القانونية والمحاسبية
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                الإصدار 2.0 المعتمد
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/40 text-xs font-mono font-bold">
                IFRS &amp; SaaS SLA
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              إخلاء المسؤولية لمنظومة MeDo ERP
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              تحدد هذه الوثيقة حدود مسؤولية شركة <strong>ميدو تك للحلول البرمجية</strong> ومسؤوليات المستخدم لضمان الشفافية وحماية الطرفين، خصوصاً في مجالات أسعار الصرف، التدفقات النقدية، الامتثال الضريبي، والذكاء المالي المتقدم.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs font-mono space-y-1.5 min-w-[220px] shadow-lg">
            <div className="flex justify-between text-slate-400">
              <span>تاريخ التحديث:</span>
              <span className="text-white font-bold">17 سبتمبر 2026</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>حالة الوثيقة:</span>
              <span className="text-amber-400 font-bold">نافذة وسارية المفعول</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>الجهة المُصدرة:</span>
              <span className="text-emerald-400 font-bold">ميدو تك للحلول البرمجية</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>الإدارة القانونية:</span>
              <span className="text-cyan-400 font-bold">legal@medo-erp.com</span>
            </div>
          </div>
        </div>

        {/* Core Pillars Highlight */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-center">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-amber-400 font-bold text-xs flex items-center justify-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              <span>فروق وأسعار الصرف</span>
            </div>
            <p className="text-[11px] text-slate-400">مسؤولية إدخال واعتماد الأسعار تقع على المنشأة</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-cyan-400 font-bold text-xs flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>الذكاء المالي المتقدم أداة مساعدة</span>
            </div>
            <p className="text-[11px] text-slate-400">مراجعة بشرية إلزامية للقيود المقترحة</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1">
              <Landmark className="w-3.5 h-3.5" />
              <span>الامتثال الضريبي والزكوي</span>
            </div>
            <p className="text-[11px] text-slate-400">تطبيق القوانين والإقرارات من مهام العميل</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-rose-400 font-bold text-xs flex items-center justify-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              <span>حدود التعويض القصوى</span>
            </div>
            <p className="text-[11px] text-slate-400">سقف مالي محدد باشتراك آخر 12 شهراً</p>
          </div>
        </div>
      </div>

      {/* Preamble Card */}
      <section id="disc-preamble" className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">ديباجة الوثيقة</h2>
            <p className="text-xs text-slate-400">الإطار العام والغايات الجوهرية لإخلاء المسؤولية</p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-300">
          تحرص <strong className="text-white">ميدو تك للحلول البرمجية</strong> (يُشار إليها فيما بعد بـ &quot;المزود&quot; أو &quot;نحن&quot;) على تقديم خدمات برمجية عالية الجودة لعملائها. ومع ذلك، ونظراً لطبيعة الأنظمة المحاسبية والمالية، وتعدد العوامل المؤثرة في دقة النتائج، فإننا نقدم منصة <strong className="text-amber-400">MeDo ERP</strong> بموجب إخلاء المسؤولية الموضح في هذه الوثيقة.
        </p>

        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
          <p className="text-xs font-bold text-amber-400">تهدف هذه الوثيقة إلى:</p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>تحديد حدود مسؤولية المزود التشغيلية والتقنية.</li>
            <li>توضيح مسؤوليات المستخدم والمحاسبين في إدخال ومراجعة البيانات.</li>
            <li>حماية الطرفين من أي نزاعات تجارية أو قانونية مستقبلية.</li>
            <li>ضمان الشفافية الكاملة والالتزام المهني المشترك.</li>
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs sm:text-sm text-amber-200/90 font-medium">
          ⚠️ <strong>تنبيه قانوني ملزم:</strong> باستخدامك لمنصة MeDo ERP، فإنك تقر بأنك قرأت هذه الوثيقة وفهمتها ووافقت على الالتزام الكامل بما ورد فيها دون أي تحفظ.
        </div>
      </section>

      {/* Article 1: Definitions */}
      <section id="disc-art-1" className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">المادة الأولى</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">التعريفات والمصطلحات المعتمدة</h2>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-950 text-amber-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5 w-36 sm:w-48">المصطلح</th>
                <th className="p-3.5">التعريف القانوني والتقني</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 font-bold text-white">المنصة</td>
                <td className="p-3.5 text-slate-300">نظام MeDo ERP بجميع وحداته المحاسبية، الإدارية، المخزنية، والتطبيقات المرتبطة به.</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 font-bold text-white">المزود</td>
                <td className="p-3.5 text-slate-300">شركة ميدو تك للحلول البرمجية (MeDo Tech for Software Solutions).</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 font-bold text-white">المستخدم</td>
                <td className="p-3.5 text-slate-300">أي شخص طبيعي أو اعتباري أو منشأة تجارية تستخدم المنصة بموجب حساب نشط ومصرح له.</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 font-bold text-white">البيانات</td>
                <td className="p-3.5 text-slate-300">المعلومات، القيود المحاسبية، الفواتير، أسعار الصرف، والمستندات التي يدخلها المستخدم أو مفوضوه.</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 font-bold text-white">التقارير</td>
                <td className="p-3.5 text-slate-300">المخرجات، القوائم المالية، موازين المراجعة، وتقارير التدفقات النقدية والضريبية المستخرجة من النظام.</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 font-bold text-white">AI</td>
                <td className="p-3.5 text-slate-300">نماذج الذكاء المالي المتقدم التوليدي والتحليلي (Gemini AI) المدمجة لتقديم اقتراحات ومساعدات ذكية.</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 font-bold text-white">SLA</td>
                <td className="p-3.5 text-slate-300">اتفاقية مستوى الخدمة وجودة التشغيل السحابي المعتمدة بين المزود والمستخدم.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Article 2: As Is */}
      <section id="disc-art-2" className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">المادة الثانية</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">تقديم الخدمة &quot;كما هي&quot; (As Is)</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h3 className="font-bold text-white text-xs sm:text-sm text-amber-400">2.1. الإقرار الأساسي</h3>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>المنصة مقدمة <strong>&quot;كما هي&quot; (As Is)</strong>.</li>
              <li>المنصة مقدمة <strong>&quot;كما هي متاحة&quot; (As Available)</strong>.</li>
              <li>لا نقدم أي ضمانات صريحة أو ضمنية بخلاف ما نصت عليه صراحة اتفاقية مستوى الخدمة (SLA).</li>
            </ul>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h3 className="font-bold text-white text-xs sm:text-sm text-amber-400">2.2. عدم الضمان المطلق</h3>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>لا نضمن أن المنصة ستلبي جميع المتطلبات الفردية دون تخصيص مدفوع.</li>
              <li>لا نضمن عملها دون انقطاع ناتج عن قوى قاهرة أو شبكات الاتصال العامة.</li>
              <li>لا نضمن خلوها التام من أي أخطاء برمجية غير جوهرية.</li>
              <li>لا نضمن إصلاح الأخطاء الطارئة دون جدول زمني تقني مناسب.</li>
            </ul>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h3 className="font-bold text-white text-xs sm:text-sm text-amber-400">2.3. الضمانات المستبعدة</h3>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>ضمان القابلية للتسويق التجاري العام (Merchantability).</li>
              <li>ضمان الملاءمة لغرض مخصص لم يُتفق عليه كتابياً.</li>
              <li>ضمان عدم الانتهاك الناتج عن بيانات ومدخلات العميل.</li>
              <li>ضمان الدقة لأي بيانات تم إدخالها من قبل المستخدم.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Article 3: Data Accuracy */}
      <section id="disc-art-3" className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">المادة الثالثة</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">إخلاء المسؤولية عن دقة البيانات والمدخلات المحاسبية</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h3 className="font-bold text-white text-sm text-amber-400 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              3.1. مسؤولية المستخدم الحصرية
            </h3>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li><strong>أنت المسؤول الوحيد</strong> عن دقة وصحة واكتمال كافة البيانات والقيود والحركات المدخلة في المنظومة.</li>
              <li><strong>أنت المسؤول</strong> عن صحة الفواتير، سندات القبض والصرف، وتوجيه الحسابات الدائنة والمدينة.</li>
              <li><strong>أنت المسؤول</strong> عن مطابقة الأرصدة البنكية، الصناديق النقدية، وجرد المستودعات الفعلي.</li>
              <li><strong>أنت المسؤول</strong> عن تدقيق ومراجعة كافة التقارير والقوائم قبل اعتمادها أو نشرها أو تقديمها لأي جهة رسمية أو خاصة.</li>
            </ul>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h3 className="font-bold text-white text-sm text-rose-400 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              3.2. إخلاء مسؤولية المزود
            </h3>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li>لا نتحمل مسؤولية أي أخطاء حسابية ناجمة عن مدخلات غير صحيحة أو ناقصة من قبل المستخدم.</li>
              <li>لا نتحمل مسؤولية أخطاء التصنيفات المحاسبية أو شجرة الحسابات التي يعدلها المستخدم ذاتياً.</li>
              <li>لا نتحمل مسؤولية ربط مراكز التكلفة أو الحسابات الوسيطة المنفذة من قبل العميل.</li>
              <li>لا نتحمل مسؤولية أخطاء الكميات، الأسعار، الخصومات، أو تواريخ الاستحقاق المسجلة بالفواتير.</li>
            </ul>
          </div>
        </div>

        <div className="bg-amber-950/15 border border-amber-500/30 p-4 rounded-2xl space-y-1 text-xs text-amber-200">
          <p className="font-bold">3.3. التوصيات الوقائية للمنشأة:</p>
          <p className="leading-relaxed text-slate-300">
            نوصي بشدة بفرض دورة مستندية محكمة للمراجعة والاعتماد قبل الترحيل النهائي للقيود، وتدريب مسؤولي الإدخال، وإجراء جرد دوري مستمر لمطابقة الأرصدة الفعلية مع الدفترية.
          </p>
        </div>
      </section>

      {/* Article 4: Exchange Rates */}
      <section id="disc-art-4" className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">المادة الرابعة</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">إخلاء المسؤولية عن سعر الصرف وفروق تقييم العملات</h2>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs sm:text-sm text-amber-200/90 leading-relaxed space-y-2">
          <h3 className="font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            4.1. خصوصية وطبيعة سوق الصرف في الجمهورية اليمنية
          </h3>
          <p className="text-slate-300">
            تعاني السوق النقدية في الجمهورية اليمنية من <strong>تعدد وتفاوت أسعار الصرف</strong> والسياسات المصرفية بين المناطق الجغرافية (نطاق صنعاء ونطاق عدن وبقية المحافظات)، مع تقلبات يومية ولحظية حادة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h4 className="font-bold text-white text-xs sm:text-sm text-amber-400">4.2. مسؤولية المستخدم</h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
              <li><strong>أنت المسؤول الكامل</strong> عن إدخال واختيار وتحديث سعر الصرف لكل عملية تجارية أو فرع.</li>
              <li><strong>أنت المسؤول</strong> عن توافق الأسعار المعتمدة مع تعليمات البنك المركزي والجهات الرقابية المختصة.</li>
              <li><strong>أنت المسؤول</strong> عن نتائج أرباح وخسائر فروق العملات الناتجة عن الأسعار المدخلة.</li>
            </ul>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h4 className="font-bold text-white text-xs sm:text-sm text-rose-400">4.3. إخلاء مسؤولية المزود</h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>لا نتحمل مسؤولية أي فروق أو خسائر دفترية ناتجة عن اختيار سعر صرف خاطئ أو قديم.</li>
              <li>لا نتحمل مسؤولية تآكل رأس المال أو الخسائر المالية الناجمة عن تقلبات السوق المصرفي.</li>
              <li>لا نتحمل أي مساءلة قانونية أو ضريبية ناتجة عن اعتماد أسعار صرف مخالفة للتعليمات المحلية.</li>
            </ul>
          </div>
        </div>

        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
          💡 <strong>توصية مهنية (4.4):</strong> نوصي بمراجعة دورية مع مدقق حسابات قانوني معتمد لتحديد آلية معالجة فروق الصرف وفق المعيار الدولي (IAS 21)، وتوثيق وتأريخ مصادر الأسعار المستخدمة في كل تسوية دورية.
        </div>
      </section>

      {/* Article 5: Cash Flows */}
      <section id="disc-art-5" className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">المادة الخامسة</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">إخلاء المسؤولية عن قائمة التدفقات النقدية (Cash Flows)</h2>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            تُعد قائمة التدفقات النقدية تلقائياً وفق المعيار المحاسبي الدولي (IAS 7) استناداً إلى القيود المسجلة والتصنيف المعتمد للحسابات والأنشطة (تشغيلية، استثمارية، تمويلية).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
              <h4 className="font-bold text-white text-xs sm:text-sm text-amber-400">مسؤوليات المستخدم (5.2)</h4>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>سلامة تصنيف العمليات المحاسبية ضمن الأنشطة التشغيلية والاستثمارية والتمويلية.</li>
                <li>الفحص والتدقيق الشهري والسنوي للقائمة ومطابقتها مع كشوف الحسابات البنكية.</li>
                <li>تحمل نتائج أي قرارات تمويلية أو استثمارية تتخذ بناءً على مخرجات القائمة.</li>
              </ul>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
              <h4 className="font-bold text-white text-xs sm:text-sm text-rose-400">إخلاء مسؤولية المزود (5.3)</h4>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>عدم تحمل أي مسؤولية عن قرارات ائتمانية أو تجارية اتخذت بناءً على القائمة.</li>
                <li>عدم تحمل مسؤولية أي عجز نقدي أو تعثر سيولة لدى المنشأة.</li>
                <li>عدم تحمل مسؤولية الأخطاء التصنيفية الصادرة من مستخدمي النظام.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Article 6: Gemini AI */}
      <section id="disc-art-6" className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-cyan-400 uppercase font-bold">المادة السادسة</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">إخلاء المسؤولية عن ميزات الذكاء المالي المتقدم (Gemini AI)</h2>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
          <h3 className="font-bold text-cyan-400 text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            6.1. طبيعة الذكاء المالي المتقدم التوليدي والتحليلي
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            تتضمن المنظومة أدوات ذكاء اصطناعي (Gemini AI) مصممة لمساعدة المحاسب في اقتراح القيود اليومية، تحليل الفواتير، وتلخيص البيانات. يُعد الذكاء المالي المتقدم <strong>أداة مساعدة احتمالية (Probabilistic Tool)</strong> وليست مصدراً للفتوى المحاسبية أو القانونية المعصومة، وهو معرض بطبيعته لاحتمال <strong>الخطأ أو الهلوسة الرقمية (AI Hallucination)</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h4 className="font-bold text-white text-xs sm:text-sm text-cyan-400">6.2. مسؤولية المستخدم</h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
              <li><strong>المراجعة البشرية المستقلة الإلزامية</strong> لكل قيد أو توصية أو تحليل مقترح من الذكاء المالي المتقدم قبل الترحيل.</li>
              <li>التحقق من صحة الحسابات ومطابقتها للمستندات المؤيدة للمعاملة.</li>
              <li>تحمل نتائج أي قرار مالي أو إداري يتخذ بالاستناد لمخرجات AI.</li>
            </ul>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h4 className="font-bold text-white text-xs sm:text-sm text-rose-400">6.3. إخلاء مسؤولية المزود</h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>لا نضمن خلو مخرجات الذكاء المالي المتقدم من الأخطاء الرياضية أو التوجيهية.</li>
              <li>لا نتحمل مسؤولية أي قيد مقترح رُحّل إلى الدفاتر دون تدقيق بشري.</li>
              <li>لا نتحمل مسؤولية أي تحيز في البيانات أو تأويل غير سليم للمستندات المرفوعة.</li>
            </ul>
          </div>
        </div>

        <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">قاعدة المراجعة الرباعية (Four-Eyes Principle - 6.4):</strong> نوصي بعدم ترحيل أي قيد مقترح عبر الذكاء المالي المتقدم إلا بعد اعتماده من محاسب مسؤول ومراجع ثانٍ لضمان النزاهة المحاسبية.
          </div>
        </div>
      </section>

      {/* Article 7: Tax Compliance */}
      <section id="disc-art-7" className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">المادة السابعة</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">إخلاء المسؤولية عن الامتثال الضريبي والزكوي</h2>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h3 className="font-bold text-white text-sm text-amber-400">7.1. مسؤولية المستخدم القانونية والشرعية</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              أنت المسؤول الحصري عن الامتثال لكافة القوانين الضريبية، الجمركية، وقوانين الزكاة الشرعية السارية بالجمهورية اليمنية، وتقديم الإقرارات في مواعيدها القانونية وسداد كافة الرسوم المستحقة، والتأكد من صحة نسب الضرائب المطبقة (مثل ضريبة المبيعات وضريبة الأرباح التجارية).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <h3 className="font-bold text-amber-400 text-sm">7.2. إخلاء مسؤولية المزود</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              نظام MeDo ERP هو <strong>أداة برمجية للمعالجة الحسابية والتقنية</strong>، وليس مكتب استشارات ضريبية أو قانونية مرخصاً. لا نتحمل أي غرامات تأخير أو جزاءات أو فروق فحص تفرضها مصلحة الضرائب أو الهيئة العامة للزكاة أو أي جهة حكومية أخرى نتيجة مدخلاتك أو تأخر إقراراتك.
            </p>
          </div>
        </div>
      </section>

      {/* Article 8: Service Outages */}
      <section id="disc-art-8" className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">المادة الثامنة</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">إخلاء المسؤولية عن الانقطاعات التقنية والأعطال الطارئة</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h4 className="font-bold text-white text-xs sm:text-sm text-amber-400">8.1. الانقطاعات الخارجة عن الإرادة</h4>
            <p className="text-slate-300 leading-relaxed text-xs">
              قد تتعرض الخدمة لانقطاعات ناتجة عن صيانة دورية مجدولة، أو أعطال في كابلات الإنترنت والاتصالات الدولية، أو انقطاع الطاقة لدى العميل، أو ظروف القوة القاهرة. لا نتحمل أي مسؤولية عن التوقفات الناتجة عن أسباب خارجة عن سيطرتنا المعقولة.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h4 className="font-bold text-white text-xs sm:text-sm text-emerald-400">8.3. حدود التزام المزود (SLA)</h4>
            <p className="text-slate-300 leading-relaxed text-xs">
              تنحصر كافة التزامات المزود التشغيلية فيما نصت عليه <strong>اتفاقية مستوى الخدمة (SLA)</strong> المعتمدة، وتقتصر التعويضات المتاحة في حال الإخلال بنسبة التوافر على إضافة أرصدة خدمة مجانية (Service Credits) دون أي تعويضات نقدية.
            </p>
          </div>
        </div>
      </section>

      {/* Article 9: Indirect Losses */}
      <section id="disc-art-9" className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-rose-400 uppercase font-bold">المادة التاسعة</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">إخلاء المسؤولية عن الخسائر غير المباشرة والتبعية</h2>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            إلى أقصى حد يجيزه القانون المعمول به، لا تتحمل شركة ميدو تك للحلول البرمجية أو موظفوها أو شركاؤها المسؤولية عن:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-300 text-xs">
              ❌ فقدان الأرباح التجارية (Loss of Profits)
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-300 text-xs">
              ❌ فقدان الإيرادات أو العقود (Loss of Revenue)
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-300 text-xs">
              ❌ الإضرار بالسمعة أو الشهرة (Loss of Goodwill)
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-300 text-xs">
              ❌ توقف أو تعطيل الأعمال (Business Interruption)
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-300 text-xs">
              ❌ مطالبات وأضرار الأطراف الثالثة
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-300 text-xs">
              ❌ الأضرار المعنوية أو الجزائية أو العارضة
            </div>
          </div>
          <p className="pt-2 text-slate-400 text-xs">
            (9.2) يسري هذا الاستبعاد حتى في حال إخطار المزود مسبقاً باحتمالية وقوع مثل هذه الأضرار، ويخضع للسقف المالي المحدد في المادة 11.
          </p>
        </div>
      </section>

      {/* Article 10: User Responsibilities */}
      <section id="disc-art-10" className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">المادة العاشرة</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">مسؤوليات المستخدم وضوابط الحماية الذاتية</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-xs sm:text-sm text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              10.1. الاستخدام المشروع والنظامي
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              استخدام المنظومة في الأغراض التجارية والمحاسبية المشروعة فقط. يُحظر استخدامها في أي عمليات غسيل أموال، احتيال، أو أنشطة مخالفة للقوانين السارية في الجمهورية اليمنية.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-xs sm:text-sm text-cyan-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              10.2. سرية الحسابات والصلاحيات (2FA)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              الحفاظ الصارم على سرية بيانات الاعتماد ورموز المصادقة الثنائية (2FA)، وتخصيص صلاحيات مستقلة ومقيدة لكل موظف، وإخطار المزود فور الاشتباه بأي دخول غير مصرح به.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-xs sm:text-sm text-amber-400 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              10.3. دقة وتحديث البيانات
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              إدخال بيانات حقيقية ومؤيدة بمستندات ثبوتية، والمراجعة المستمرة للعمليات وتصحيح أي خطأ إدخالي فور اكتشافه وفق الأصول المحاسبية المعتمدة.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-xs sm:text-sm text-indigo-400 flex items-center gap-2">
              <Gavel className="w-4 h-4 text-indigo-400" />
              10.4. الامتثال التجاري والرقابي
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              الامتثال لكافة القوانين التجارية واللوائح المالية السارية في الجمهورية اليمنية وتطبيق معايير المحاسبة المعتمدة وضوابط الرقابة الداخلية.
            </p>
          </div>
        </div>
      </section>

      {/* Article 11: Limitation of Liability */}
      <section id="disc-art-11" className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">المادة الحادية عشرة</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">حدود التعويض القصوى (Limitation of Liability)</h2>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 to-slate-950 border border-amber-500/40 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <span>11.1. السقف المالي المحدد للتعويض</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            الحد الأقصى المطلق لأي تعويض مالي قد يُحكم به ضد المزود لأي سبب كان، تعاقدياً أو تقصيرياً، هو <strong>قيمة رسوم الاشتراك الصافية المدفوعة فعلياً من العميل خلال فترة الاثني عشر (12) شهراً السابقة مباشرة لوقوع الحادث الموجب للمطالبة</strong>.
          </p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs text-slate-300">
          <p className="font-bold text-white text-xs sm:text-sm text-emerald-400">11.2. الاستثناءات من سقف التعويض:</p>
          <ul className="space-y-1.5 list-disc list-inside leading-relaxed">
            <li>الغش والتدليس المتعمد الثابت بحكم قضائي نهائي بات صادر ضد المزود.</li>
            <li>الإهمال الجسيم المتعمد المباشر من كوادر المزود المعتمدة.</li>
            <li>الإصابات الجسدية أو الوفاة الناتجة مباشرة عن فعل غير مشروع للمزود (في حال انطباقها نظاماً).</li>
          </ul>
        </div>
      </section>

      {/* Article 12: Exclusions */}
      <section id="disc-art-12" className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">المادة الثانية عشرة</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">الاستثناءات والحقوق النظامية غير القابلة للإسقاط</h2>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            لا تهدف هذه الوثيقة إلى التهرب من المسؤوليات القانونية التي لا يجوز التنازل عنها بموجب التشريعات النافذة في الجمهورية اليمنية، ولا تؤثر على أي حقوق صريحة كفلها القانون للمستهلكين أو المنشآت والتي لا يمكن استبعادها باتفاق تعاقدي خاص.
          </p>
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400">
            <strong>شرط الاستقلالية (12.2):</strong> في حال صدور حكم قضائي بات ببطلان أي بند من بنود هذه الوثيقة، تظل باقي البنود سارية ونافذة ومنتجة لكافة آثارها القانونية.
          </div>
        </div>
      </section>

      {/* Article 13: Governing Law */}
      <section id="disc-art-13" className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">المادة الثالثة عشرة</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">القانون المعمول به وتسوية النزاعات</h2>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="text-xs sm:text-sm font-bold text-amber-400">
              13.1. القانون الواجب التطبيق &amp; 13.2. الاختصاص القضائي
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              تخضع هذه الوثيقة وتُفسر في بنودها وفقاً لقوانين وأنظمة <strong>الجمهورية اليمنية</strong>، وتختص <strong>المحاكم التجارية والقضائية في أمانة العاصمة صنعاء</strong> بنظر وفصل أي نزاع ينشأ عنها.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/15 border border-amber-500/30 space-y-2">
            <div className="text-xs sm:text-sm font-bold text-amber-300">
              13.3. الآلية المتدرجة لحل النزاعات
            </div>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li><strong>المفاوضات الودية المباشرة:</strong> مهلة 30 يوماً للتفاوض بحسن نية بين الطرفين.</li>
              <li><strong>الوساطة المهنية:</strong> الاستعانة بخبير محاسبي أو قانوني مستقل متوافق عليه.</li>
              <li><strong>التحكيم التجاري:</strong> في حال الاتفاق المكتوب وفقاً لقانون التحكيم اليمني.</li>
              <li><strong>القضاء المختص:</strong> الإحالة للمحاكم التجارية المختصة بصنعاء عند تعذر التسوية الودية.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Article 14: Contact Channels */}
      <section id="disc-art-14" className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">المادة الرابعة عشرة</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">قنوات التواصل والإخطارات الرسمية</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-amber-400 text-xs font-bold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>الإدارة القانونية والامتثال</span>
            </div>
            <a href="mailto:legal@medo-erp.com" className="text-white font-mono text-xs hover:text-amber-300 transition-colors block">
              legal@medo-erp.com
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-cyan-400 text-xs font-bold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>مسؤول حماية البيانات (DPO)</span>
            </div>
            <a href="mailto:dpo@medo-erp.com" className="text-white font-mono text-xs hover:text-cyan-300 transition-colors block">
              dpo@medo-erp.com
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>الدعم والعمليات (واتساب)</span>
            </div>
            <span className="text-white font-mono text-xs dir-ltr block" dir="ltr">
              +0967773586047
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1 sm:col-span-2">
            <div className="text-slate-300 text-xs font-bold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>المقر الإداري الرئيسي</span>
            </div>
            <p className="text-slate-300 text-xs">
              خمر - الكدوي - عمارة القلمي، عمران، الجمهورية اليمنية
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-slate-300 text-xs font-bold flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>البوابة الرسمية</span>
            </div>
            <a href="https://www.medo-erp.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 font-mono text-xs hover:underline block">
              www.medo-erp.com
            </a>
          </div>
        </div>
      </section>

      {/* Conclusion & Signature Footer Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 text-center">
        <h3 className="text-base sm:text-lg font-bold text-white">
          خاتمة والتزام بالشراكة المهنية
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          نحن في <strong>ميدو تك للحلول البرمجية</strong> نؤمن بالشراكة المهنية والشفافية التامة مع عملائنا الكرام. تهدف هذه الوثيقة إلى توضيح الحدود التقنية والقانونية للخدمات السحابية بما يضمن حماية المنشأة والمزود معاً، وتوفير بيئة عمل محاسبية آمنة ومستقرة.
        </p>
        <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>ميدو تك للحلول البرمجية — MeDo Tech for Software Solutions</span>
          <span>© 2026 منصة MeDo ERP — جميع الحقوق محفوظة ومسجلة رسمياً</span>
        </div>
      </div>
    </div>
  );
};
