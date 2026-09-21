import React from "react";
import {
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Coins,
  FileText,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Scale,
  Sparkles,
  ArrowRight,
  DollarSign,
  Briefcase,
  Layers,
  Banknote,
  Percent,
  Wallet,
  Building2,
  ChevronLeft
} from "lucide-react";

export const RefundPolicyDocument: React.FC = () => {
  return (
    <div className="space-y-8 text-slate-200" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/30 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                وثيقة سياسة الاسترداد الرسمية (Refund Policy)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                الإصدار 2.0 المعتمد
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 text-xs font-mono font-bold">
                SaaS Protection Suite
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              سياسة الاسترداد لمنصة MeDo ERP
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              تحدد هذه السياسة بوضوح وشفافية حقوق العميل والمزود في استرداد المبالغ المدفوعة، مدد المعالجة، النسب المقررة، والحالات المستثناة وفق معايير التجارة السحابية والقوانين التجارية اليمنية النافذة.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs font-mono space-y-1.5 min-w-[220px] shadow-lg">
            <div className="flex justify-between text-slate-400">
              <span>تاريخ التحديث:</span>
              <span className="text-white font-bold">17 سبتمبر 2026</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>حالة الوثيقة:</span>
              <span className="text-emerald-400 font-bold">سارية ونافذة</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>الجهة المُصدرة:</span>
              <span className="text-white font-bold">ميدو تك للحلول البرمجية</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>الإدارة المالية:</span>
              <span className="text-cyan-400 font-bold">billing@medo-erp.com</span>
            </div>
          </div>
        </div>

        {/* Quick Summary Highlights Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-center">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>تجربة مجانية 30 يوماً</span>
            </div>
            <p className="text-[11px] text-slate-400">50 عملية مجانية دون الحاجة لبطاقة ائتمان</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-cyan-400 font-bold text-xs flex items-center justify-center gap-1">
              <Percent className="w-3.5 h-3.5" />
              <span>استرداد كامل 100%</span>
            </div>
            <p className="text-[11px] text-slate-400">للأخطاء التقنية، الدفع المكرر، وعدم التسليم</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-amber-400 font-bold text-xs flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>29 يوم عمل للبت</span>
            </div>
            <p className="text-[11px] text-slate-400">جدول زمني دقيق ومراحل مراجعة موثقة</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-rose-400 font-bold text-xs flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>حماية بعد 90 يوماً</span>
            </div>
            <p className="text-[11px] text-slate-400">حماية من المطالبات بعد استهلاك 80% أو 90 يوماً</p>
          </div>
        </div>
      </div>

      {/* Quick Summary Matrix Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <span>مصفوفة الاسترداد السريع (Refund Matrix Overview)</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-950/80 text-emerald-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">حالة الإلغاء أو الاسترداد</th>
                <th className="p-3">المدة الزمنية</th>
                <th className="p-3">نسبة الاسترداد</th>
                <th className="p-3">الشروط والملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">إلغاء خلال الأسبوع الأول</td>
                <td className="p-3 text-slate-300 font-mono">0 - 7 أيام</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-xs">95%</span></td>
                <td className="p-3 text-slate-400 text-xs">دون استخدام المنصة (خصم 5% رسوم إدارية).</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">إلغاء مبكر (شهر أول)</td>
                <td className="p-3 text-slate-300 font-mono">7 - 30 يوماً</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-xs">70%</span></td>
                <td className="p-3 text-slate-400 text-xs">شرط عدم استهلاك أكثر من 20% من عمليات الباقة.</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">إلغاء مرحلي (ربع سنوي)</td>
                <td className="p-3 text-slate-300 font-mono">30 - 90 يوماً</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold text-xs">50%</span></td>
                <td className="p-3 text-slate-400 text-xs">شرط عدم استهلاك أكثر من 40% من العمليات.</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">تخفيض الباقة (Downgrade)</td>
                <td className="p-3 text-slate-300 font-mono">خلال الاشتراك</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-xs">60%</span></td>
                <td className="p-3 text-slate-400 text-xs">استرداد 60% من الفرق السعري بين الباقتين.</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">عدم استخدام المنصة</td>
                <td className="p-3 text-slate-300 font-mono">خلال 30 يوماً</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-xs">80%</span></td>
                <td className="p-3 text-slate-400 text-xs">في حال عدم تنفيذ أي قيد أو نشاط بالمنصة.</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">عدم تسليم / خطأ جسيم / دفع مكرر</td>
                <td className="p-3 text-slate-300 font-mono">في أي وقت</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs">100% كامل</span></td>
                <td className="p-3 text-slate-400 text-xs">استرداد كامل وفوري دون أي خصومات إدارية.</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-rose-400">بعد 90 يوماً أو استهلاك 80%</td>
                <td className="p-3 text-slate-300 font-mono">90+ يوماً</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-bold text-xs">0% غير مسترد</span></td>
                <td className="p-3 text-slate-400 text-xs">لا يجوز الاسترداد بعد انقضاء المدة أو استهلاك الباقة.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Preamble */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-400" />
          <span>الديباجة والأساس التعاقدي</span>
        </h2>
        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
          <p>
            تلتزم <strong>ميدو تك للحلول البرمجية</strong> (يُشار إليها فيما بعد بـ "المزود" أو "نحن") بتقديم خدمات برمجية وحلول محاسبية وإدارية سحابية متقدمة وفق أرفع المعايير الدولية. ونظراً للطبيعة التشغيلية والبنية التحتية المخصصة للأنظمة السحابية (SaaS) ونقاط الحوسبة الموزعة، فإننا نوضح في هذه الوثيقة سياسة الاسترداد الكاملة بما يحقق التوازن المنصف والشفاف بين حقوق العميل وحقوق المزود.
          </p>
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs font-medium">
            ⚠️ <strong>إقرار وتعهد:</strong> باستخدامك لمنصة MeDo ERP والاشتراك في إحدى باقاتها المعتمدة، فإنك تقر بأنك قرأت بنود هذه السياسة وفهمتها ووافقت على الالتزام بكافة أحكامها ونسبها ومواقيتها.
          </div>
        </div>
      </div>

      {/* Articles Container */}
      <div className="space-y-6">

        {/* Article 1: Definitions */}
        <section id="ref-art-1" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-sm">
                1
              </span>
              <span>المادة 1: التعريفات والمصطلحات</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-mono">Definitions</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            تُفسر الكلمات والعبارات الواردة في هذه السياسة وفق المعاني المحددة قرين كل منها أدناه:
          </p>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-950 text-emerald-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3 w-1/4">المصطلح</th>
                  <th className="p-3">التعريف القانوني والتشغيلي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                <tr>
                  <td className="p-3 font-bold text-white">المزود</td>
                  <td className="p-3 text-slate-300">ميدو تك للحلول البرمجية (MeDo Tech for Software Solutions).</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">العميل</td>
                  <td className="p-3 text-slate-300">أي شخص طبيعي أو اعتباري (شركة، مؤسسة، منشأة تجارية) يشترك في خدمات المنصة.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">الاشتراك</td>
                  <td className="p-3 text-slate-300">اتفاقية دفع مقابل استخدام منصة MeDo ERP وفق دورة فوترة محددة (شهرية أو سنوية).</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">الباقة</td>
                  <td className="p-3 text-slate-300">إحدى خطط الاشتراك المتاحة على المنصة محددة الميزات وعدد العمليات والمستخدمين.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">الفترة التجريبية</td>
                  <td className="p-3 text-slate-300">فترة 30 يوماً مجانية تتيح تجربة المنصة بحد أقصى 50 عملية لتقييم الملاءمة.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">الاسترداد</td>
                  <td className="p-3 text-slate-300">إعادة كل أو جزء من المبلغ المالي المدفوع من العميل إلى حسابه المالي.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">الاسترداد الكامل</td>
                  <td className="p-3 text-slate-300">إرجاع 100% من إجمالي المبلغ المسدد دون أي خصومات.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">الاسترداد الجزئي</td>
                  <td className="p-3 text-slate-300">إرجاع نسبة محددة (50% إلى 80%) من المبلغ وفق جدول الاستهلاك والمدد.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">الرسوم الإدارية</td>
                  <td className="p-3 text-slate-300">نسبة 5% من المبلغ تُخصم لتغطية تكاليف بوابات الدفع الإلكترونية والمعالجة البنكية.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Article 2: General Principles */}
        <section id="ref-art-2" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-sm">
                2
              </span>
              <span>المادة 2: المبادئ العامة لسياسة الاسترداد</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-mono">Core Principles</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>2.1. الشفافية التامة (Transparency)</span>
              </h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>نوضح جميع شروط ونسب الاسترداد مسبقاً قبل إتمام عملية الدفع.</li>
                <li>لا توجد شروط مبهمة أو رسوم خفية غير معلنة في هذه الوثيقة.</li>
                <li>يحق للعميل الاطلاع الدائم على هذه السياسة من خلال المنصة أو تحميل نسختها.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>2.2. العدالة والتوازن (Fairness)</span>
              </h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>تحقيق التوازن العادل بين حقوق المنشأة وحقوق المزود التشغيلية.</li>
                <li>عدم فرض رسوم مبالغ فيها خارج النفقات الإدارية الفعلية (5%).</li>
                <li>الالتزام الصارم بعدم التهرب أو المماطلة في تسليم الاستحقاقات المعتمدة.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>2.3. السرعة والالتزام بالمدد (Promptness)</span>
              </h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>معالجة طلبات الاسترداد خلال مدد زمنية محددة ومبرمجة سلفاً.</li>
                <li>إشعار العميل آلياً وكتابياً بحالة طلبه وتحديثات كل مرحلة.</li>
                <li>إنجاز عملية تحويل المبلغ فور صدور القرار المالي بالموافقة.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>2.4. التوثيق والأرشفة الرقمية (Documentation)</span>
              </h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>الاحتفاظ بسجل تدقيق غير قابل للتعديل لجميع الطلبات وتواريخها.</li>
                <li>إصدار إيصالات استرداد رسمية مسجلة برقم مرجعي بنكي.</li>
                <li>ضمان الرقابة والشفافية المحاسبية المتبادلة بين الطرفين.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Article 3: Free Trial */}
        <section id="ref-art-3" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-sm">
                3
              </span>
              <span>المادة 3: فترة التجربة المجانية والضمان الاستكشافي</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-mono">Free Trial</span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <h3 className="font-bold text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>3.1. مدة وحدود الفترة التجريبية (30 يوماً / 50 عملية)</span>
              </h3>
              <p>
                يمنح المزود كل منشأة جديدة فترة تجريبية مجانية تمتد لمدة <strong>30 يوماً تقويمياً</strong>، أو بحد أقصى <strong>50 عملية محاسبية</strong> (أيهما ينقضي أولاً)، مع إتاحة <strong>كافة ميزات النظام الشاملة</strong> لتمكين العميل من تجربة النظام وتدقيق ملائمته لاحتياجاته الواقعية قبل دفع أي مبالغ مالية.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <div className="text-white font-bold text-xs">3.2. شروط التجربة</div>
                <p className="text-[11px] text-slate-400">لا تتطلب التجربة إدخال بطاقة ائتمانية، ولا يترتب عليها أي التزام تلقائي بالتجديد، مع حرية الإلغاء في أي وقت.</p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <div className="text-white font-bold text-xs">3.3. انتهاء التجربة</div>
                <p className="text-[11px] text-slate-400">عند استنفاد العمليات أو الأيام، يُقفل النظام مؤقتاً مع عرض شاشة التقييم؛ حيث يمكن للعميل تفعيل الاشتراك للاستمرار دون فقد بياناته.</p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <div className="text-white font-bold text-xs">3.4. انعدام الاسترداد للتجربة</div>
                <p className="text-[11px] text-slate-400">نظراً لأن الفترة التجريبية مجانية بالكامل بنسبة 100%، فلا تنطبق عليها أي مطالبات استرداد مالي.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Article 4: Full Refund (100%) */}
        <section id="ref-art-4" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-sm">
                4
              </span>
              <span>المادة 4: حالات الاسترداد الكامل (100%)</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">100% Refund</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            يحق للعميل استرداد كامل المبلغ المسدد (100%) بصورة فورية ومباشرة في الحالات التالية:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-900/30 space-y-2">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>4.1. عدم تسليم الخدمة خلال 7 أيام</span>
              </h3>
              <p className="text-xs text-slate-300">
                إذا تعذر على المزود تفعيل بيئة المنشأة أو تسليم بيانات تسجيل الدخول خلال <strong>7 أيام تقويمية</strong> من تاريخ استلام الدفعة، ولم يتم معالجة الخلل.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-900/30 space-y-2">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>4.2. خطأ تقني جسيم متواصل 30 يوماً</span>
              </h3>
              <p className="text-xs text-slate-300">
                إذا كان النظام غير قابل للاستخدام كلياً نتيجة عطل فني في خوادم المزود لمدة <strong>30 يوماً متواصلة</strong> وثبت ذلك في تقارير الرقابة التشغيلية.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-900/30 space-y-2">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>4.3. عدم مطابقة الخدمة جوهرياً لمدة 30 يوماً</span>
              </h3>
              <p className="text-xs text-slate-300">
                إذا كانت مواصفات الخدمة تختلف اختلافاً جوهرياً عما هو موصوف في العقد، ولم يقم المزود بتوفير الإصلاح خلال 30 يوماً من التبليغ الكتابي.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-900/30 space-y-2">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>4.4. التكرار في خصم الدفع المالي</span>
              </h3>
              <p className="text-xs text-slate-300">
                إذا تم خصم قيمة الاشتراك مرتين لنفس الفترة عن طريق الخطأ التقني أو المصرفي، فيُسترد المبلغ المكرر فورياً بالكامل.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-900/30 space-y-2">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>4.5. الخطأ في احتساب المبلغ</span>
              </h3>
              <p className="text-xs text-slate-300">
                إذا تم خصم مبلغ أكبر من السعر المعلن والمعتمد للباقة، فيتم استرداد فرق الزيادة فورياً ودون أي تأخير.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-900/30 space-y-2">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>4.6. إلغاء الاشتراك خلال 7 أيام (95%)</span>
              </h3>
              <p className="text-xs text-slate-300">
                إذا طلب العميل الإلغاء خلال <strong>7 أيام</strong> من الدفع دون استخدام المنصة؛ يُسترد 100% من المبلغ مخصوماً منه 5% كرسوم إدارية وبنكية (صافي الاسترداد 95%).
              </p>
            </div>
          </div>
        </section>

        {/* Article 5: Partial Refund (50% - 80%) */}
        <section id="ref-art-5" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-sm">
                5
              </span>
              <span>المادة 5: حالات الاسترداد الجزئي (50% - 80%)</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-mono font-bold">50% - 80% Refund</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            تطبق نسب الاسترداد الجزئي التناسبية وفق معدل استهلاك الخدمة والمدد الزمنية التالية:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-emerald-400 text-sm">5.1. إلغاء بعد 7 أيام وقبل 30 يوماً</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-xs">70%</span>
              </div>
              <p className="text-xs text-slate-300">
                يحق للعميل استرداد <strong>70% من المبلغ المدفوع</strong> شريطة ألا يكون قد استخدم أكثر من <strong>20%</strong> من إجمالي العمليات المسموحة في باقته.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-amber-400 text-sm">5.2. إلغاء بعد 30 يوماً وقبل 90 يوماً</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold text-xs">50%</span>
              </div>
              <p className="text-xs text-slate-300">
                يحق للعميل استرداد <strong>50% من المبلغ المدفوع</strong> شريطة ألا يكون قد استخدم أكثر من <strong>40%</strong> من إجمالي العمليات المسموحة في الباقة.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-cyan-400 text-sm">5.3. تخفيض الباقة إلى خطة أدنى</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-xs">60% من الفرق</span>
              </div>
              <p className="text-xs text-slate-300">
                عند رغبة المنشأة في تخفيض باقتها (Downgrade)، يتم استرداد <strong>60% من فارق السعر</strong> بين الباقة العليا والباقة الأقل للفترة المتبقية من الاشتراك.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-emerald-400 text-sm">5.4. عدم استخدام المنصة خلال 30 يوماً</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-xs">80%</span>
              </div>
              <p className="text-xs text-slate-300">
                إذا قام العميل بالدفع ولكنه لم يقم بتسجيل الدخول أو إجراء أي عملية خلال <strong>30 يوماً</strong> من تاريخ التفعيل، يستحق استرداد <strong>80% من المبلغ</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Article 6: Non-Refundable Cases */}
        <section id="ref-art-6" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center font-mono text-sm">
                6
              </span>
              <span>المادة 6: حالات عدم الاسترداد (Non-Refundable)</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-mono font-bold">0% Non-Refundable</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            لا يحق للعميل المطالبة بأي مبالغ أو استرداد مالي في أي من الحالات الثماني التالية:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-950/70 border border-rose-950/40 rounded-2xl space-y-1">
              <div className="text-rose-400 font-bold text-xs flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>6.1. بعد مرور 90 يوماً</span>
              </div>
              <p className="text-[11px] text-slate-400">انقضاء 90 يوماً من تاريخ الدفع يسقط أي حق في المطالبة بالاسترداد.</p>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-rose-950/40 rounded-2xl space-y-1">
              <div className="text-rose-400 font-bold text-xs flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>6.2. الاستهلاك الكامل (80%+)</span>
              </div>
              <p className="text-[11px] text-slate-400">استخدام 80% أو أكثر من العمليات المسموحة في الباقة يسقط حق الاسترداد.</p>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-rose-950/40 rounded-2xl space-y-1">
              <div className="text-rose-400 font-bold text-xs flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>6.3. مخالفة الشروط</span>
              </div>
              <p className="text-[11px] text-slate-400">إذا تم تعليق أو إغلاق الحساب بسبب مخالفة شروط الاستخدام أو الإساءة للأنظمة.</p>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-rose-950/40 rounded-2xl space-y-1">
              <div className="text-rose-400 font-bold text-xs flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>6.4. القوة القاهرة</span>
              </div>
              <p className="text-[11px] text-slate-400">توقف الخدمة الناتج عن الكوارث الطبيعية أو قطع كابلات الإنترنت الدولية العامة.</p>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-rose-950/40 rounded-2xl space-y-1">
              <div className="text-rose-400 font-bold text-xs flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>6.5. الاختراق بإهمال العميل</span>
              </div>
              <p className="text-[11px] text-slate-400">تعرض الحساب للاختراق نتيجة إفشاء العميل لكلمات المرور أو إهماله في الحماية.</p>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-rose-950/40 rounded-2xl space-y-1">
              <div className="text-rose-400 font-bold text-xs flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>6.6. فقدان البيانات بالإهمال</span>
              </div>
              <p className="text-[11px] text-slate-400">فقدان المنشأة لبياناتها نتيجة إهمال أخذ النسخ الاحتياطية وتصدير الملفات الدورية.</p>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-rose-950/40 rounded-2xl space-y-1">
              <div className="text-rose-400 font-bold text-xs flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>6.7. عدم الرضا دون عيب تقني</span>
              </div>
              <p className="text-[11px] text-slate-400">إذا كان عدم الرضا مبنياً على أمور شخصية أو رغبة مزاجية دون وجود عطل تقني مثبت.</p>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-rose-950/40 rounded-2xl space-y-1">
              <div className="text-rose-400 font-bold text-xs flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>6.8. عدم الاستخدام لظروف شخصية</span>
              </div>
              <p className="text-[11px] text-slate-400">توقف المنشأة عن النشاط التجاري أو عدم استخدام النظام لأسباب خاصة بالعميل بعد 30 يوماً.</p>
            </div>
          </div>
        </section>

        {/* Article 7: How to Request Refund */}
        <section id="ref-art-7" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-sm">
                7
              </span>
              <span>المادة 7: آلية وخطوات تقديم طلب الاسترداد</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-mono">Submission Workflow</span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">الخطوة الأولى: التواصل مع الدعم الفني</h4>
                <p className="text-xs text-slate-400 mt-1">
                  يجب التواصل المسبق مع الدعم عبر البريد المالي المعتمد: <span className="font-mono text-emerald-400">billing@medo-erp.com</span> أو عبر واتساب خدمة العملاء: <span className="font-mono text-emerald-400" dir="ltr">+0967773586047</span>.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">الخطوة الثانية: تقديم الطلب الكتابي</h4>
                <p className="text-xs text-slate-400 mt-1">
                  يُرسل طلب رسمي يتضمن: (1) اسم المنشأة والعميل، (2) رقم الفاتورة وسند القبض، (3) تاريخ عملية الدفع، (4) سبب الاسترداد تفصيلياً، (5) صور وتقارير العطل الفني أو المستندات الداعمة.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">الخطوة الثالثة: المراجعة والتحقق الفني</h4>
                <p className="text-xs text-slate-400 mt-1">
                  تتم مراجعة الطلب خلال <strong>5 أيام عمل</strong> للتأكد من انطباق شروط الاستحقاق، مع إمكانية طلب مستندات توضيحية إضافية وإشعار العميل بنتيجة التدقيق.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                4
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">الخطوة الرابعة: الموافقة وتحديد المبلغ</h4>
                <p className="text-xs text-slate-400 mt-1">
                  في حال القبول، يُصدر إشعار مالي بالموافقة موضحاً فيه المبلغ الصافي المعتمد للاسترداد وطريقة التحويل البنكي أو المحفظة المختارة.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                5
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">الخطوة الخامسة: تحويل المبلغ وتسليم الإيصال</h4>
                <p className="text-xs text-slate-400 mt-1">
                  يتم إيداع المبلغ خلال <strong>14 يوم عمل</strong> عبر نفس القناة الأصلية المسدد بها، ويُرسل إشعار تحويل مصرفي وإيصال استرداد رسمي للعميل.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Article 8: Processing Timeline */}
        <section id="ref-art-8" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-sm">
                8
              </span>
              <span>المادة 8: مدة معالجة الطلب والمراحل الزمنية (29 يوم عمل)</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-mono">SLA Timeline</span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-950 text-emerald-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">مرحلة المعالجة</th>
                  <th className="p-3">المدة الزمنية المقررة</th>
                  <th className="p-3">المهام المنجزة في المرحلة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                <tr>
                  <td className="p-3 font-bold text-white">استلام الطلب وتسجيله</td>
                  <td className="p-3 text-emerald-400 font-bold">فوري آلياً</td>
                  <td className="p-3 text-slate-300">توليد رقم التذكرة وإرسال إشعار تأكيد الاستلام للعميل.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">المراجعة الفنية الأولية</td>
                  <td className="p-3 text-slate-200 font-mono">5 أيام عمل</td>
                  <td className="p-3 text-slate-300">تدقيق سجلات الحساب ونسب استهلاك العمليات وعدد الأيام المنقضية.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">التحقق المالي والمصرفي</td>
                  <td className="p-3 text-slate-200 font-mono">5 أيام عمل</td>
                  <td className="p-3 text-slate-300">مطابقة إيصالات السداد وكشوفات حساب البنك أو بوابة الدفع.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">إصدار القرار النهائي</td>
                  <td className="p-3 text-slate-200 font-mono">5 أيام عمل</td>
                  <td className="p-3 text-slate-300">اعتماد نسبة الاسترداد والمبلغ الصافي وإشعار العميل كتابياً.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">التنفيذ المصرفي والتحويل</td>
                  <td className="p-3 text-slate-200 font-mono">14 يوم عمل</td>
                  <td className="p-3 text-slate-300">إجراء التحويل البنكي أو المحفظة وإرسال إيصال السداد.</td>
                </tr>
                <tr className="bg-emerald-950/20 font-bold">
                  <td className="p-3 text-emerald-400">إجمالي المدة القصوى</td>
                  <td className="p-3 text-emerald-300 font-mono">29 يوم عمل كحد أقصى</td>
                  <td className="p-3 text-slate-200">الحد الأقصى للبت والتنفيذ الكامل لكافة الإجراءات.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
            ℹ️ <strong>ملاحظة التأخير الطارئ:</strong> في حال تأخر المعالجة نتيجة عطل مصرفي أو ظروف بنكية خارجة عن الإرادة، يتم إشعار العميل فوراً وتوضيح الأسباب وتحديد موعد جديد بدقة.
          </div>
        </section>

        {/* Article 9: Refund Payment Methods */}
        <section id="ref-art-9" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-sm">
                9
              </span>
              <span>المادة 9: طرق الاسترداد وقنوات السداد والرسوم</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-mono">Payment Channels</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>تحويل بنكي رسمي</span>
              </h3>
              <p className="text-xs text-slate-300">
                يتم التحويل لحساب العميل البنكي خلال <strong>14 يوم عمل</strong> من تاريخ الاعتماد.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4 text-cyan-400" />
                <span>محفظة إلكترونية (جوالي / ون كاش)</span>
              </h3>
              <p className="text-xs text-slate-300">
                يتم التحويل إلى المحفظة الإلكترونية المعتمدة خلال <strong>7 أيام عمل</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Banknote className="w-4 h-4 text-amber-400" />
                <span>سداد نقدي مباشر</span>
              </h3>
              <p className="text-xs text-slate-300">
                يتم الصرف نقداً فورياً عبر المركز الرئيسي للمزود في عمران أو فرع صنعاء بموجب سند صرف رسمي.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <strong className="text-white block">9.2. الرسوم والعمولات:</strong>
              الاسترداد الكامل يتم دون أي رسوم، الاسترداد الجزئي لا يخضع لأي رسوم إضافية، وتُطبق الرسوم الإدارية (5%) فقط في حالات الإلغاء المبكر دون استخدام المنصة.
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <strong className="text-white block">9.3. العملة وفروق الصرف:</strong>
              يتم الاسترداد بنفس عملة الدفع الأصلية (ريال يمني، ريال سعودي، أو دولار أمريكي). وإذا تغير سعر الصرف في السوق لاحقاً، يُعتمد سعر الصرف المسجل في فاتورة السداد الأصلية.
            </div>
          </div>
        </section>

        {/* Article 10: Exceptions */}
        <section id="ref-art-10" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-sm">
                10
              </span>
              <span>المادة 10: الاستثناءات والحالات الخاصة</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-mono">Exceptions</span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              <strong>10.1. الحالات الخاصة التقديرية:</strong> يحق لإدارة المزود، وفقاً لتقديرها الخاص والمطلق وبشكل استثنائي، الموافقة على طلب استرداد خارج الأطر الزمنية أو المعايير المحددة في هذه الوثيقة لمراعاة ظروف العميل الإنسانية أو الطارئة، دون أن يشكل ذلك عرفاً أو التزاماً مستقبلياً في حق حالات أخرى.
            </p>
            <p>
              <strong>10.2. القوة القاهرة:</strong> في حال وقوع ظروف قاهرة غير اعتيادية تحول دون تنفيذ التحويل المصرفي في موعده، يتم تأجيل مواعيد الاسترداد تلقائياً مع إشعار العميل والتواصل المستمر لحين زوال المانع.
            </p>
            <p>
              <strong>10.3. النزاعات المالية:</strong> في حال نشوء أي خلاف حول أحقية الاسترداد أو قيمته، يُلجأ إلى التحكيم المالي وفق الضوابط المنصوص عليها في المادة 11 من هذه السياسة، ويكون القرار التحكيمي ملزماً ونهائياً لكلا الطرفين.
            </p>
          </div>
        </section>

        {/* Article 11: Applicable Law & Jurisdiction */}
        <section id="ref-art-11" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-sm">
                11
              </span>
              <span>المادة 11: القانون المعمول به والاختصاص القضائي</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-mono">Governing Law</span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              <strong>11.1. القانون الحاكم:</strong> تخضع هذه السياسة وتفسر وتنفذ وفقاً للقوانين والأنظمة التجارية والمعاملات الإلكترونية السارية في <strong>الجمهورية اليمنية</strong>.
            </p>
            <p>
              <strong>11.2. الاختصاص القضائي الحصري:</strong> تختص <strong>المحاكم التجارية المختصة في صنعاء، الجمهورية اليمنية</strong> دون غيرها بالفصل في أي دعوى أو نزاع ينشأ عن تفسير أو تطبيق هذه السياسة.
            </p>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <strong className="text-white block">11.3. التدرج في تسوية النزاعات:</strong>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-emerald-400 font-bold block">أولاً</span>
                  <span>التفاوض الودي</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-cyan-400 font-bold block">ثانياً</span>
                  <span>الوساطة المهنية</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-amber-400 font-bold block">ثالثاً</span>
                  <span>التحكيم التجاري</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-rose-400 font-bold block">رابعاً</span>
                  <span>القضاء المختص</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article 12: Contact & Official Channels */}
        <section id="ref-art-12" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-sm">
                12
              </span>
              <span>المادة 12: قنوات التواصل والإشعارات المالية الرسمية</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-mono">Billing Inquiries</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Mail className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs text-slate-400">البريد المالي للاسترداد</div>
              <a href="mailto:billing@medo-erp.com" className="font-mono text-xs font-bold text-white hover:text-emerald-400 block truncate">
                billing@medo-erp.com
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Scale className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xs text-slate-400">الشؤون القانونية</div>
              <a href="mailto:legal@medo-erp.com" className="font-mono text-xs font-bold text-white hover:text-cyan-400 block truncate">
                legal@medo-erp.com
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Phone className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs text-slate-400">واتساب وخدمة العملاء</div>
              <span className="font-mono text-xs font-bold text-emerald-400 block" dir="ltr">
                +0967773586047
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <MapPin className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xs text-slate-400">المقر الرئيسي للشركة</div>
              <div className="text-xs text-slate-300 leading-snug">
                خمر - الكدوي - عمارة القلمي، عمران، اليمن
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Official Signoff Footer Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-800/80 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>خاتمة وثيقة سياسة الاسترداد والاعتماد المؤسسي</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            نلتزم في ميدو تك للحلول البرمجية بتقديم خدمة عادلة وشفافة تضع ثقة عملائنا واستمرارية أعمالهم في صميم أولوياتنا. إذا كان لديك أي استفسار مالي أو تعاقدي، لا تتردد في التواصل معنا.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1 font-mono text-slate-400">
            <div className="text-white font-bold">ميدو تك للحلول البرمجية — MeDo Tech for Software Solutions</div>
            <div>رقم التوثيق: <span className="text-emerald-400">MEDO-REFUND-V2-2026</span></div>
            <div>الموقع الرسمي: <span className="text-cyan-400">www.medo-erp.com</span></div>
          </div>

          <div className="text-left sm:text-right font-mono text-xs text-slate-500">
            <div>© 2026 ميدو تك للحلول البرمجية</div>
            <div>جميع الحقوق محفوظة ومسجلة رسمياً</div>
          </div>
        </div>
      </div>
    </div>
  );
};
