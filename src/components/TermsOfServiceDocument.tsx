import React, { useState } from "react";
import {
  FileText,
  ShieldCheck,
  Scale,
  Building2,
  Lock,
  Zap,
  Clock,
  DatabaseBackup,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Printer,
  Download,
  Mail,
  Phone,
  MapPin,
  Bot,
  Layers,
  Sparkles,
  ChevronDown
} from "lucide-react";

export const TermsOfServiceDocument: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedAll, setExpandedAll] = useState(true);

  const handleCopyFullDocument = () => {
    const docText = `شروط استخدام منصة MeDo ERP
آخر تحديث: 17 سبتمبر 2026
الإصدار: 2.0
الجهة المُصدرة: ميدو تك للحلول البرمجية

ديباجة:
حيث إن ميدو تك للحلول البرمجية (المزود) هي شركة متخصصة في تطوير وتقديم الحلول البرمجية السحابية.
وحيث إن منصة MeDo ERP هي نظام محاسبي وإداري سحابي متكامل، مصمم لخدمة المؤسسات والشركات بمختلف أحجامها.
وحيث إن المستخدم يرغب في استخدام المنصة وفقاً للشروط والأحكام الواردة في هذه الاتفاقية.
فقد اتفق الطرفان على الالتزام ببنود هذه الاتفاقية المكونة من 20 مادة قانونية شاملة.

المواد:
1. التعريفات
2. قبول الشروط
3. التسجيل والحساب
4. الاشتراك والدفع
5. الاستخدام المسموح والمحظور
6. المحتوى والبيانات
7. الخصوصية وحماية البيانات
8. حقوق الملكية الفكرية
9. الدعم الفني والصيانة
10. مستويات الخدمة (SLA)
11. الذكاء المالي المتقدم
12. النسخ الاحتياطي والاستعادة
13. الأمان والحماية
14. حدود المسؤولية
15. التعويض
16. إنهاء الخدمة
17. القوة القاهرة
18. حل النزاعات
19. أحكام عامة
20. التواصل

ميدو تك للحلول البرمجية - MeDo Tech for Software Solutions
خمر - الكدوي - عمارة القلمي، عمران، اليمن
هاتف: +0967773586047
البريد: legal@medo-erp.com
جميع الحقوق محفوظة © 2026`;

    navigator.clipboard.writeText(docText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleDownloadMarkdown = () => {
    const element = document.createElement("a");
    const file = new Blob([
      `# شروط استخدام منصة MeDo ERP\n\n**آخر تحديث:** 17 سبتمبر 2026\n**الإصدار:** 2.0\n**الجهة المُصدرة:** ميدو تك للحلول البرمجية\n\n(يمكن مراجعة النص الكامل بالاتفاقية في نظام MeDo ERP)\n`
    ], { type: "text/markdown;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = "MeDo_ERP_Terms_Of_Service_v2.0.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const scrollToArticle = (articleId: string) => {
    const el = document.getElementById(articleId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const articleIndex = [
    { id: "art-1", num: 1, title: "التعريفات" },
    { id: "art-2", num: 2, title: "قبول الشروط" },
    { id: "art-3", num: 3, title: "التسجيل والحساب" },
    { id: "art-4", num: 4, title: "الاشتراك والدفع" },
    { id: "art-5", num: 5, title: "الاستخدام المسموح والمحظور" },
    { id: "art-6", num: 6, title: "المحتوى والبيانات" },
    { id: "art-7", num: 7, title: "الخصوصية وحماية البيانات" },
    { id: "art-8", num: 8, title: "حقوق الملكية الفكرية" },
    { id: "art-9", num: 9, title: "الدعم الفني والصيانة" },
    { id: "art-10", num: 10, title: "مستويات الخدمة (SLA)" },
    { id: "art-11", num: 11, title: "الذكاء المالي المتقدم" },
    { id: "art-12", num: 12, title: "النسخ الاحتياطي والاستعادة" },
    { id: "art-13", num: 13, title: "الأمان والحماية" },
    { id: "art-14", num: 14, title: "حدود المسؤولية" },
    { id: "art-15", num: 15, title: "التعويض" },
    { id: "art-16", num: 16, title: "إنهاء الخدمة" },
    { id: "art-17", num: 17, title: "القوة القاهرة" },
    { id: "art-18", num: 18, title: "حل النزاعات" },
    { id: "art-19", num: 19, title: "أحكام عامة" },
    { id: "art-20", num: 20, title: "التواصل" },
  ];

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      {/* Official Header Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-sap-primary/30 border border-sap-secondary/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-sap-secondary text-slate-950 font-black flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                وثيقة قانونية رسمية ملزمة
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                الإصدار: 2.0 (شامل وموسع)
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-mono">
                ساري المفعول: 17 سبتمبر 2026
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white flex items-center gap-3">
              <Scale className="w-8 h-8 text-sap-secondary shrink-0" />
              <span>شروط استخدام منصة MeDo ERP</span>
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              الجهة المُصدرة: <strong>ميدو تك للحلول البرمجية</strong> — وثيقة قانونية متكاملة تنظم العلاقة التعاقدية وحقوق وواجبات المستأجرين والمستخدمين.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopyFullDocument}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
              title="نسخ ملخص الوثيقة القانونية"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-sap-secondary" />}
              <span>{copied ? "تم النسخ بنجاح!" : "نسخ نص الوثيقة"}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-sap-secondary hover:bg-[#b89528] text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              title="طباعة الشروط كاملة"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة رسمية</span>
            </button>
          </div>
        </div>

        {/* Quick Search & Index Pills */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-sap-secondary">
              <Layers className="w-4 h-4" />
              <span>فهرس المواد القانونية (20 مادة مفصلة):</span>
            </div>
            <div className="relative w-48 sm:w-64">
              <input
                type="text"
                placeholder="بحث في بنود الاتفاقية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sap-secondary text-right pr-8"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 scrollbar-thin">
            {articleIndex.map((art) => (
              <button
                key={art.id}
                onClick={() => scrollToArticle(art.id)}
                className="px-2.5 py-1 rounded-lg bg-slate-950/60 hover:bg-sap-primary/30 border border-slate-800 hover:border-sap-secondary/50 text-[11px] font-medium text-slate-300 hover:text-sap-secondary transition-all cursor-pointer whitespace-nowrap"
              >
                <span className="text-sap-secondary font-bold ml-1">م.{art.num}:</span>
                <span>{art.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preamble Card */}
      <div className="bg-slate-950/80 border border-amber-900/40 rounded-2xl p-6 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />
        <h3 className="text-lg font-black text-amber-300 flex items-center gap-2">
          <span>📜 ديباجة الاتفاقية</span>
        </h3>
        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
          <p>
            حيث إن <strong>ميدو تك للحلول البرمجية</strong> (يُشار إليها فيما بعد بـ "المزود" أو "نحن" أو "لنا") هي شركة متخصصة في تطوير وتقديم الحلول البرمجية السحابية وأنظمة تخطيط الموارد المؤسسية.
          </p>
          <p>
            وحيث إن <strong>منصة MeDo ERP</strong> هي نظام محاسبي وإداري سحابي متكامل، مصمم لخدمة المؤسسات والشركات بمختلف أحجامها عبر أدوات مالية، تجارية، مخزنية، ومصرفية متقدمة.
          </p>
          <p>
            وحيث إن المستخدم يرغب في استخدام المنصة وفقاً للشروط والأحكام والضوابط الواردة في هذه الاتفاقية.
          </p>
          <p className="font-bold text-sap-secondary pt-1">
            فقد اتفق الطرفان وتراضيا بكامل الأهلية المعتبرة شرعاً وقانوناً على ما يلي:
          </p>
        </div>
      </div>

      {/* 20 Articles Comprehensive List */}
      <div className="space-y-6">
        {/* Article 1: Definitions */}
        <section id="art-1" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              المادة 1: التعريفات
            </h2>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400">
              14 مصطلحاً معتمداً
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            لأغراض هذه الاتفاقية، يكون للمصطلحات التالية المعاني المحددة قرين كل منها ما لم يقتضِ سياق النص خلاف ذلك:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-right border-collapse border border-slate-800 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-slate-900 text-sap-secondary border-b border-slate-800">
                  <th className="p-3 w-1/4 font-black">المصطلح</th>
                  <th className="p-3 font-black">التعريف القانوني والفني</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">المنصة</td>
                  <td className="p-3">نظام MeDo ERP بجميع وحداته وميزاته ومكوناته البرمجية السحابية وقواعد بياناته.</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">المزود</td>
                  <td className="p-3">ميدو تك للحلول البرمجية (الجهة المطورة والمشغلة للمنظومة).</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">المستخدم</td>
                  <td className="p-3">أي شخص طبيعي أو اعتباري (شركة، مؤسسة، منشأة) يستخدم المنصة أو ينشئ حساباً عليها.</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">الحساب</td>
                  <td className="p-3">الحساب الشخصي أو المؤسسي للمستخدم على المنصة الذي يتيح له الوصول للبيانات والخدمات.</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">الاشتراك</td>
                  <td className="p-3">اتفاقية دفع مالي مقابل الحصول على ترخيص استخدام المنصة لفترة محددة.</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">الباقة</td>
                  <td className="p-3">إحدى خطط الاشتراك المتاحة (التجريبية، الأساسية، المتقدمة، المؤسسية).</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">المحتوى</td>
                  <td className="p-3">البيانات، القيود، الفواتير، المستندات والملفات التي يدخلها المستخدم أو ينشئها في النظام.</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">المستأجر (Tenant)</td>
                  <td className="p-3">الشركة أو المؤسسة المستقلة المشتركة التي تمتلك بيئة محاسبية معزولة تماماً.</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">المستخدم النهائي</td>
                  <td className="p-3">الموظف أو الفرد المفوض من المستأجر لاستخدام المنصة في نطاق اختصاصه.</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">التوكن (Token)</td>
                  <td className="p-3">رمز التحقق الأمني الرقمي الفريد المشفر المرتبط برابط الوصول وصلاحيات الجلسة.</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">RBAC</td>
                  <td className="p-3">نظام التحكم الصارم في الصلاحيات القائم على الأدوار (Role-Based Access Control).</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">SLA</td>
                  <td className="p-3">اتفاقية مستوى الخدمة وجودة الأداء وتوفر الخوادم وسرعة الدعم الفني.</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">البيانات الشخصية</td>
                  <td className="p-3">أي معلومات تحدد هوية الشخص الطبيعي مباشرة أو بطريقة غير مباشرة.</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">الملكية الفكرية</td>
                  <td className="p-3">حقوق النشر، العلامات التجارية، براءات الاختراع، الأسرار التجارية والتصاميم البرمجية.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Article 2: Acceptance */}
        <section id="art-2" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              المادة 2: قبول الشروط
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">إلزامية تعاقدية</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-white">2.1. الموافقة الصريحة</h4>
              <p className="text-slate-300">باستخدامك للمنصة، أو بإنشاء حساب، أو بالنقر على "أوافق" أو أي زر مماثل، فإنك تقر بأنك قرأت هذه الشروط كاملة وتفهمها وتوافق على الالتزام بها قانونياً وتتحمل المسؤولية الكاملة.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-white">2.2. الأهلية القانونية</h4>
              <p className="text-slate-300">يجب أن تكون بعمر 18 عاماً على الأقل. إذا كنت تمثل شركة فيجب أن تكون مفوضاً قانونياً بإبرام الاتفاقيات، وإذا كنت قاصراً يلزم موافقة الولي القانوني.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-white">2.3. التحديثات والتعديلات</h4>
              <p className="text-slate-300">يحق للمزود تحديث الشروط دورياً. سيتم إعلامك بالتغييرات الجوهرية قبل 30 يوماً عبر البريد الإلكتروني، واستمرارك في الاستخدام يعد موافقة صريحة عليها.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-white">2.4. الاتفاقيات الإضافية</h4>
              <p className="text-slate-300">قد تخضع بعض الخدمات السحابية أو الربط الإلكتروني لاتفاقيات تكميلية خاصة، وفي حال التعارض تسود شروط الاتفاقية الإضافية المحددة للخدمة.</p>
            </div>
          </div>
        </section>

        {/* Article 3: Registration & Accounts */}
        <section id="art-3" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              المادة 3: التسجيل والحساب
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">التحقق وإدارة الوصول</span>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <p><strong>3.1. إنشاء الحساب:</strong> يجب تقديم بيانات صحيحة ومحدثة وكاملة، ولا يجوز إنشاء حسابات متعددة بقصد التلاعب أو التهرب المالي، ويحق للمزود رفض أي طلب تسجيل وفق ضوابط الأمان.</p>
            
            <div className="p-3.5 rounded-xl bg-sap-primary/10 border border-sap-secondary/30 text-slate-200">
              <span className="font-bold text-sap-secondary block mb-1">3.2. التحقق من البريد الإلكتروني (رمز 7 أرقام):</span>
              يجب التحقق من البريد الإلكتروني برمز تحقق مكوّن من <strong>7 أرقام</strong>. الرمز صالح لمدة 10 دقائق فقط. بعد 3 محاولات خاطئة يتم قفل الحساب مؤقتاً لحمايته من الهجمات التخمينية.
            </div>

            <p><strong>3.3. أمن الحساب:</strong> المستخدم مسؤول عن سرية كلمة المرور (يجب أن تتكون من 8 خانات على الأقل تشمل أحرفاً وأرقاماً ورموزاً). يجب إبلاغنا فوراً عن أي اختراق أو شبهة استخدام غير مصرح به، وللمزود تفعيل المصادقة الثنائية (2FA) إلزامياً لحماية الأرصدة.</p>
            <p><strong>3.4. إدارة الأدوار (RBAC):</strong> يمكن للمستخدم الرئيسي (Manager) إضافة موظفين وتحديد أدوارهم (محاسب، أمين صندوق، مبيعات، مشتريات، مراجع) مع إمكانية تعديل وتجريد الصلاحيات فورياً.</p>
            <p><strong>3.5. الروابط الفرعية:</strong> لكل موظف رابط فريد خاص به يحتوي على (المستأجر + الدور + التوكن المشفر). يحظر مشاركة الرابط مع أي طرف ثالث تحت طائلة إنهاء الحساب والمساءلة.</p>
            <p><strong>3.6. إلغاء الحساب:</strong> يحق للمشترك حذف حسابه بأي وقت وفق آلية إنهاء الخدمة، ويحق للمزود إلغاء الحساب في حال مخالفة الشروط دون أي حق بالمطالبة بتعويض.</p>
          </div>
        </section>

        {/* Article 4: Subscription & Payment */}
        <section id="art-4" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              المادة 4: الاشتراك والدفع
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">الباقات والأسعار</span>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs sm:text-sm">4.1. الباقات المتاحة وجدول الأسعار:</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-right border-collapse border border-slate-800 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-900 text-sap-secondary border-b border-slate-800">
                    <th className="p-3 font-bold">الباقة</th>
                    <th className="p-3 font-bold">السعر السنوي</th>
                    <th className="p-3 font-bold">السعر الشهري</th>
                    <th className="p-3 font-bold">الميزات والسعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-bold text-emerald-400">التجريبية (Trial)</td>
                    <td className="p-3">مجانية (30 يوماً)</td>
                    <td className="p-3">-</td>
                    <td className="p-3">كافة الميزات الأساسية، حد 50 عملية محاسبية لاختبار النظام.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-bold text-white">الأساسية (Basic)</td>
                    <td className="p-3 font-mono font-bold text-sap-secondary">150,000 ريال</td>
                    <td className="p-3 font-mono">15,000 ريال</td>
                    <td className="p-3">3 مستخدمين، 5 فروع، محاسبة ومخازن وسندات متكاملة.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-bold text-white">المتقدمة (Advanced)</td>
                    <td className="p-3 font-mono font-bold text-sap-secondary">250,000 ريال</td>
                    <td className="p-3 font-mono">25,000 ريال</td>
                    <td className="p-3">10 مستخدمين، 15 فرعاً، مراكز تكلفة، متعدد العملات، تقارير تحليلية.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-bold text-white">المؤسسية (Enterprise)</td>
                    <td className="p-3 font-mono font-bold text-sap-secondary">400,000 ريال</td>
                    <td className="p-3 font-mono">40,000 ريال</td>
                    <td className="p-3">فروع ومستخدمون غير محدودين، دعم مخصص 24/7، خادم مخصص، ربط API.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300 pt-2">
            <p><strong>4.2. طريقة الدفع:</strong> الدفع مقدماً قبل تفعيل الاشتراك عبر: تحويل بنكي، محافظ إلكترونية يمنية معتمدة (جوالي، جيب، فلوسك، ون كاش)، أو نقداً، مع إرسال إشعار السداد إلى billing@medo-erp.com.</p>
            <p><strong>4.3. الفواتير:</strong> تصدر فاتورة إلكترونية معتمدة لكل عملية دفع تحتوي على رقم الفاتورة، التاريخ، المبلغ، والباقة، وتتاح للتحميل من لوحة التحكم.</p>
            <p><strong>4.4. التجديد:</strong> يتم التجديد تلقائياً ما لم يتم طلب الإلغاء قبل 30 يوماً من تاريخ التجديد، ويتم إرسال إشعار تنبيه قبل موعد الاستحقاق بـ 15 يوماً.</p>
            <p><strong>4.5. التأخر في الدفع:</strong> يُمنح المشترك مهلة سماح لمدة 7 أيام قبل تعليق الخدمة، ولا يحق له المطالبة بأي تعويض عن فترة التعليق الناتجة عن تخلفه.</p>
            <p><strong>4.6. الاسترداد:</strong> لا يوجد استرداد للمبالغ المدفوعة إلا في حال ثبوت عطل جسيم بالنظام لم يُعالج خلال 30 يوماً من إشعار المزود، ويتم الإرجاع خلال 14 يوم عمل.</p>
            <p><strong>4.7. الخصومات:</strong> 15% للدفع السنوي، 20% لعقد 3 سنوات، 30% لأول 10 عملاء، و 10% لعملاء الإحالة المباشرة.</p>
            <p><strong>4.8. تغيير الباقة:</strong> يمكن الترقية بأي وقت واحتساب الفرق النسبي، ولا يمكن تخفيض الباقة إلا بعد انتهاء الدورة التعاقدية الحالية.</p>
          </div>
        </section>

        {/* Article 5: Permitted & Prohibited Use */}
        <section id="art-5" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              المادة 5: الاستخدام المسموح والمحظور
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800">حظر صارم</span>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-slate-300">
            <h4 className="font-bold text-emerald-400">5.1. الاستخدامات المسموحة:</h4>
            <p>إدارة العمليات المحاسبية والمالية، إصدار الفواتير وسندات القبض والصرف، إدارة المستودعات، المخزون، الموارد البشرية، حسابات العملاء والموردين، واستخراج القوائم الختامية وأي غرض تجاري قانوني مشروع.</p>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-slate-300 pt-2 border-t border-slate-800">
            <h4 className="font-bold text-rose-400">5.2. الاستخدامات المحظورة (يُمنع منعاً باتاً تحت طائلة المسؤولية الجنائية والمدنية):</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">❌ استخدام المنصة لأي غرض غير قانوني أو احتيالي.</div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">❌ محاولة اختراق النظام أو تجاوز الصلاحيات الممنوحة.</div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">❌ نسخ، توزيع، هندسة عكسية، أو بيع أي جزء من كود المنصة.</div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">❌ استخدام برامج الروبوتات أو برامج استخراج البيانات (Scrapers).</div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">❌ نشر أي محتوى ضار، خبيث، أو يحتوي على برمجيات تجسس.</div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">❌ انتحال شخصية أشخاص أو كيانات أخرى دون تفويض رسمي.</div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">❌ استخدام المنصة للإضرار بالبنية التحتية أو السيرفرات السحابية.</div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">❌ إدخال بيانات مالية مضللة أو مزيفة عمداً للتحايل الضريبي.</div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">❌ استخدام المنصة في أي نشاط يرتبط بتبييض الأموال (AML).</div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">❌ استخدام المنصة في تمويل الإرهاب أو الأنشطة المحظورة دولياً.</div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">❌ انتهاك حقوق الملكية الفكرية أو العلامات التجارية لميدو تك.</div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">❌ استخدام المنصة لإنشاء وتقليد أنظمة برمجية منافسة.</div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">❌ محاولة الوصول إلى بيانات مستأجرين آخرين (Cross-Tenant Breach).</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-200 text-xs leading-relaxed">
            <strong>5.3. العواقب:</strong> في حال ارتكاب أي من المحظورات، يحق للمزود فوراً وبدون إنذار مسبق: تعليق الحساب نهائياً، إنهاء الاشتراك دون أي استرداد مالي، اتخاذ كافة الإجراءات القضائية الجزائية والمدنية، والمطالبة بالتعويض الكامل عن كافة الأضرار المادية والمعنوية.
          </div>
        </section>

        {/* Article 6: Content & Data Ownership */}
        <section id="art-6" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <DatabaseBackup className="w-5 h-5 text-emerald-400" />
              المادة 6: المحتوى والبيانات
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">ملكية مطلقة للعميل</span>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-800/50 space-y-1">
                <span className="text-emerald-400 font-bold block">6.1. أنت تملك بياناتك</span>
                <p className="text-xs text-slate-300">جميع البيانات المالية، الفواتير، أسماء العملاء، وحركات المخزون التي تدخلها هي ملكك الحصري والمطلق.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-sap-secondary font-bold block">نحن نملك الكود</span>
                <p className="text-xs text-slate-300">كافة الشيفرات البرمجية، الهندسة المعمارية، خوارزميات الحساب، والتصاميم ملك حصري للمزود.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-sap-secondary font-bold block">نحن نملك البنية التحتية</span>
                <p className="text-xs text-slate-300">الخوادم السحابية، أجهزة الشبكة، والبرمجيات الوسيطة ملك للمزود ومورديه التقنيين المعتمدين.</p>
              </div>
            </div>

            <p><strong>6.2. ترخيص البيانات:</strong> بإنشاء حسابك، تمنح المزود ترخيصاً تقنياً محدوداً ومحصوراً فقط بغرض تشغيل المنصة وحفظ النسخ الاحتياطية وتقديم الدعم الفني، ولا نستخدم بياناتك لأي غرض آخر أو بيعها لأي طرف ثالث نهائياً.</p>
            <p><strong>6.3. سرية البيانات:</strong> نلتزم بتشفير بياناتك بتشفير بنكي عالي الأمان (256-bit AES) مع تطبيق بروتوكولات الأمان العالمية (ISO 27001, SOC 2).</p>
            <p><strong>6.4. النسخ الاحتياطي:</strong> نقوم بعمل نسخ احتياطي تلقائي يومي، والمستخدم مسؤول عن حفظ نسخ محلية إضافية عبر أدوات التصدير، ويمكن طلب استعادة البيانات متى دعت الحاجة.</p>
            <p><strong>6.5. تصدير البيانات:</strong> يمكنك تصدير كامل بياناتك وسجلاتك المحاسبية بأي وقت وبصيغ قياسية متعددة (Excel، CSV، JSON، PDF) دون أي عوائق.</p>
            <p><strong>6.6. حذف البيانات:</strong> عند إنهاء الاشتراك، يحق لك طلب الحذف النهائي لبياناتك، ويتم الحذف الجذري من السيرفرات خلال 30 يوماً من تاريخ الطلب.</p>
          </div>
        </section>

        {/* Article 7: Privacy & Data Protection */}
        <section id="art-7" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              المادة 7: الخصوصية وحماية البيانات
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">معايير التشفير البنكي</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
            <div>
              <h4 className="font-bold text-white mb-1">7.1. المعلومات التي نجمعها:</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
                <li>معلومات التسجيل: الاسم، البريد الإلكتروني، الهاتف، اسم الشركة والسجل.</li>
                <li>معلومات الاستخدام: سجل العمليات، التقارير الصادرة، وتاريخ الدخول.</li>
                <li>المعلومات التقنية: عنوان IP، نوع المتصفح، بصمة الجهاز ونظام التشغيل.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">7.3. حماية المعلومات:</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
                <li>تشفير كلمات المرور عبر دوال الهاشينغ المشفرة (Salted SHA-256).</li>
                <li>تشفير قواعد البيانات والاتصالات ببروتوكولات (AES-256 & TLS 1.3).</li>
                <li>استضافة سحابية على خوادم فائقة الأمان ومراقبة وحماية من الاختراق 24/7.</li>
              </ul>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-300 space-y-2">
            <h4 className="font-bold text-sap-secondary">7.5. حقوق المستخدم الخمسة:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-bold">الحق في الوصول</div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-bold">الحق في التعديل</div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-bold">الحق في الحذف</div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-bold">الحق في الاعتراض</div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-bold">الحق في النقل</div>
            </div>
          </div>
        </section>

        {/* Article 8: Intellectual Property */}
        <section id="art-8" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              المادة 8: حقوق الملكية الفكرية
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">حقوق النشر والعلامة التجارية</span>
          </div>
          <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p><strong>8.1. ملكية المنصة:</strong> جميع الحقوق البرمجية، الكود المصدري، قواعد البيانات، والتصاميم البصرية مملوكة حصرياً لـ <strong>ميدو تك للحلول البرمجية</strong> ومحمية بأنظمة الملكية الفكرية والمعاهدات الدولية.</p>
            <p><strong>8.2. حقوق المستخدم:</strong> يحصل المستخدم على ترخيص محدود، غير حصري، وغير قابل للتحويل لاستخدام المنصة وفق حدود باقته فقط، ولا يحق له نسخها أو تعديلها.</p>
            <p><strong>8.3. العلامات التجارية:</strong> "MeDo ERP" و "SAP/MeDO ERP" علامات تجارية مسجلة ومحمية، ويحظر استخدامها لأي غرض ترويجي دون إذن كتابي مسبق.</p>
            <p><strong>8.4. الإبلاغ عن الانتهاكات:</strong> يجب إبلاغ المزود فوراً عن أي انتهاك للملكية الفكرية عبر: legal@medo-erp.com.</p>
          </div>
        </section>

        {/* Article 9: Support & Maintenance */}
        <section id="art-9" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              المادة 9: الدعم الفني والصيانة
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">قنوات وتوقيت الاستجابة</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-white text-xs mb-2">9.1. قنوات الدعم الفني المعتمدة:</h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> واتساب فوري:</span>
                  <span className="font-mono text-white" dir="ltr">+0967773586047</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-sap-secondary flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> البريد الفني:</span>
                  <span className="font-mono text-white">support@medo-erp.com</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-cyan-400 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> بوابة التذاكر:</span>
                  <span className="font-mono text-white">support.medo-erp.com</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs mb-2">9.3. مستويات الاستجابة والحل (SLA):</h4>
              <table className="w-full text-xs text-right border border-slate-800 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-900 text-sap-secondary">
                    <th className="p-2">الباقة</th>
                    <th className="p-2">وقت الاستجابة</th>
                    <th className="p-2">وقت الحل المعتمد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-2 font-bold text-white">الأساسية</td>
                    <td className="p-2">خلال 48 ساعة</td>
                    <td className="p-2">خلال 5 أيام عمل</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-white">المتقدمة</td>
                    <td className="p-2">خلال 24 ساعة</td>
                    <td className="p-2">خلال 3 أيام عمل</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-emerald-400">المؤسسية</td>
                    <td className="p-2 font-bold text-emerald-400">خلال 4 ساعات</td>
                    <td className="p-2 font-bold text-emerald-400">خلال 24 ساعة (طوارئ 24/7)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-slate-400 pt-1">
            <strong>أوقات العمل الرسمية:</strong> من الأحد إلى الخميس (8:00 صباحاً - 5:00 مساءً بتوقيت صنعاء). الصيانة الدورية المخططة تتم مع إشعار مسبق قبل 48 ساعة خارج أوقات الذروة.
          </p>
        </section>

        {/* Article 10: SLA */}
        <section id="art-10" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              المادة 10: مستويات الخدمة (SLA)
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800">99.5% إلى 99.99%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="space-y-2">
              <h4 className="font-bold text-white">10.1. نسبة الجاهزية والتوفر السحابي:</h4>
              <p>• <strong>الباقة الأساسية:</strong> 99.5% توفر شهري.</p>
              <p>• <strong>الباقة المتقدمة:</strong> 99.9% توفر شهري.</p>
              <p>• <strong>الباقة المؤسسية:</strong> 99.99% توفر شهري فائق.</p>
              <p className="text-slate-400 text-xs pt-1">يستثنى من الاحتساب الصيانة الدورية المخططة وحالات القوة القاهرة وانقطاع شبكة الإنترنت المحلية لدى العميل.</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white">10.3. التعويض عند الإخلال بنسبة التوفر:</h4>
              <table className="w-full text-xs text-right border border-slate-800 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-900 text-sap-secondary">
                    <th className="p-2">نسبة التوفر الشهري</th>
                    <th className="p-2">التعويض المالي كرصيد اشتراك</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-2">أقل من 99.5%</td>
                    <td className="p-2 font-bold text-sap-secondary">خصم 5% من قيمة الشهر</td>
                  </tr>
                  <tr>
                    <td className="p-2">أقل من 99.0%</td>
                    <td className="p-2 font-bold text-sap-secondary">خصم 10% من قيمة الشهر</td>
                  </tr>
                  <tr>
                    <td className="p-2">أقل من 95.0%</td>
                    <td className="p-2 font-bold text-emerald-400">خصم 25% من قيمة الشهر</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-white">10.4. معايير أداء وسرعة النظام:</span>
            <span className="text-slate-300">سرعة التحميل: &lt; 3 ثوانٍ</span>
            <span className="text-slate-300">سرعة البحث المالي: &lt; 1 ثانية</span>
            <span className="text-slate-300">سرعة حفظ وتوليد الفاتورة: &lt; 5 ثوانٍ</span>
          </div>
        </section>

        {/* Article 11: Artificial Intelligence (AI) */}
        <section id="art-11" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              المادة 11: الذكاء المالي المتقدم (AI Policy)
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-sap-primary/20 text-sap-secondary border border-sap-secondary/40">Gemini AI</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                11.1. الميزات والتوليد الذكي
              </h4>
              <p className="text-slate-300 leading-relaxed text-xs">
                تتضمن المنصة ميزات ذكاء اصطناعي مدعومة بنماذج Gemini AI لتقديم مقترحات القيود المحاسبية، وتوليد التقارير المالية الاستشارية. النتائج إرشادية وتخضع للمراجعة البشرية الإلزامية من قِبل المحاسب القانوني للمنشأة.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-sap-secondary flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                11.3. عزل البيانات وعدم التدريب العام
              </h4>
              <p className="text-slate-300 leading-relaxed text-xs">
                نلتزم قطعياً بعدم استخدام بيانات المستخدم المالية أو الشخصية لتدريب النماذج العامة. طلبات الذكاء المالي المتقدم معزولة مشفرة ولا يتم مشاركة أي بيانات سرية خارج نطاق جلسة التحليل اللحظية.
              </p>
            </div>
          </div>
        </section>

        {/* Article 12: Backup & Restore */}
        <section id="art-12" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <DatabaseBackup className="w-5 h-5 text-emerald-400" />
              المادة 12: النسخ الاحتياطي والاستعادة
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">حماية الكوارث</span>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p><strong>12.1. النسخ الاحتياطي:</strong> يتم تنفيذ نسخ احتياطي آلي يومي لقواعد البيانات، ونسخ أسبوعي تراكمي كامل، بالإضافة إلى نسخة شهرية مؤرشفة ومحفوظة لمدة سنة كاملة في مراكز بيانات متباعدة جغرافياً.</p>
            <p><strong>12.2. الاستعادة:</strong> يحق للمستخدم طلب استعادة بياناته بأي وقت بناءً على طلب رسمي موثق، ويتم إتمام الاستعادة خلال <strong>24 ساعة</strong> من تاريخ استلام الطلب.</p>
            <p><strong>12.3. مسؤولية المستخدم:</strong> يُنصح المستخدم بتصدير نسخ محلية دورية لدفاتره وسجلاته عبر أداة التصدير السريع لضمان وجود نسخ أرشيفية محلية لديه.</p>
          </div>
        </section>

        {/* Article 13: Security & RBAC */}
        <section id="art-13" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              المادة 13: الأمان والحماية وسجل التدقيق
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">سجل تدقيق غير قابل للتعديل</span>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p><strong>13.1. إجراءات الأمان:</strong> تشفير شامل للبيانات أثناء النقل والتخزين (AES-256)، جدران حماية متقدمة، مصادقة ثنائية (2FA)، ومراقبة آلية لكشف أي محاولات اختراق.</p>
            <p><strong>13.2. الصلاحيات (RBAC):</strong> تطبق المنظومة هيكلية صلاحيات دقيقة ومقيدة تمنع أي موظف من الوصول لبيانات أو شاشات خارج نطاق مسؤوليته المحددة من الإدارة.</p>
            <p><strong>13.3. سجل التدقيق غير القابل للتعديل:</strong> يسجل النظام تلقائياً كل حركة (إضافة، تعديل، حذف، طباعة، استعراض) مرفقاً بهوية المستخدم، التوقيت بالثواني، عنوان IP، وبصمة الجهاز، ولا يمكن حذف أو التلاعب بهذا السجل نهائياً.</p>
            <p><strong>13.4. الإبلاغ عن الثغرات:</strong> تشجع ميدو تك باحثي الأمان على الإبلاغ المسؤول عن أي ثغرة أمنية عبر البريد: security@medo-erp.com مع تقديم مكافآت تقديرية للبلاغات المؤكدة.</p>
          </div>
        </section>

        {/* Article 14: Limitation of Liability */}
        <section id="art-14" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              المادة 14: حدود المسؤولية
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">إخلاء وسقف تعويض</span>
          </div>
          <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p><strong>14.1. تقديم الخدمة:</strong> المنصة مقدمة على أساس "كما هي" وبحسب توفرها دون ضمانات صريحة أو ضمنية تتجاوز نطاق هذه الاتفاقية ومستويات الخدمة (SLA).</p>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs">
              <strong>14.2. إخلاء المسؤولية:</strong> لا يتحمل المزود أي مسؤولية عن: أخطاء المستخدم في إدخال القيود أو الأرصدة الافتتاحية، التحديد الخاطئ لأسعار صرف العملات الأجنبية، الاعتماد على التقارير بدون مراجعة مدقق حسابات معتمد، فقدان الأرباح التجارية، أو الأضرار الناتجة عن سوء إدارة كلمات المرور أو الروابط من جانب العميل.
            </div>
            <p><strong>14.4. سقف التعويض المالي:</strong> في جميع الأحوال ومهما كان سبب المطالبة أو طبيعتها، ينحصر أقصى تعويض إجمالي يمكن أن يلتزم به المزود بما يعادل <strong>قيمة الاشتراك الفعلي المدفوع من قِبل العميل خلال الاثني عشر (12) شهراً السابقة مباشرة للواقعة</strong>، ولا يشمل أي تعويضات عن أضرار غير مباشرة أو تبعية.</p>
          </div>
        </section>

        {/* Article 15: Indemnification */}
        <section id="art-15" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              المادة 15: التعويض
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">حماية متبادلة</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <strong>15.1. تعويض المزود:</strong> يلتزم المستخدم بتعويض المزود ومدرائه وموظفيه عن أي خسائر، مطالبات، غرامات، أو أتعاب قانونية تنشأ عن مخالفته لشروط هذه الاتفاقية، أو استخدامه غير المشروع للمنصة، أو انتهاكه لحقوق الغير أو إدخاله بيانات غير مصرح له بها.
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <strong>15.2. تعويض المستخدم:</strong> في حال ثبوت إخلال جسيم من المزود بالتزاماته التعاقدية تسبب بضرر مباشر للمستخدم، يتم التعويض وفق الحدود والضوابط المنصوص عليها في المادة (14).
          </p>
        </section>

        {/* Article 16: Termination of Service */}
        <section id="art-16" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emerald-400" />
              المادة 16: إنهاء الخدمة
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">آلية التصفية وتصدير البيانات</span>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p><strong>16.1. الإنهاء من قِبل المستخدم:</strong> يحق للمستخدم إنهاء اشتراكه بأي وقت عبر إشعار كتابي مسبق قبل 30 يوماً من تاريخ التجديد، ولا يستحق استرداد المبالغ عن المدة المتبقية من الفترة المدفوعة.</p>
            <p><strong>16.2. الإنهاء من قِبل المزود:</strong> يحق للمزود إنهاء الخدمة فوراً في حالات: الإخلال بهذه الشروط، التخلف عن السداد، الاستخدام غير المشروع، أو صدور حكم قضائي ملزم.</p>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs">
              <strong>16.3. آثار الإنهاء ومهلة تصدير البيانات:</strong> عند انتهاء الاشتراك يتم تعليق صلاحيات الإدخال والتعديل، وتُمنح المنشأة مهلة <strong>30 يوماً</strong> كاملة لتصدير واستخراج كافة بياناتها وسجلاتها المحاسبية. بعد انقضاء الـ 30 يوماً يتم حذف البيانات بصورة نهائية وآمنة ولا يمكن استرجاعها.
            </div>
          </div>
        </section>

        {/* Article 17: Force Majeure */}
        <section id="art-17" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              المادة 17: القوة القاهرة
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">الظروف الاستثنائية</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <strong>17.1. التعريف:</strong> تشمل القوة القاهرة أي أحداث خارجة عن الإرادة المعقولة لأي من الطرفين، مثل: الحروب، النزاعات المسلحة، الكوارث الطبيعية، الأوبئة، الانقطاع العام لشبكات الكهرباء أو الإنترنت العالمية، والقرارات أو العقوبات السيادية.
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <strong>17.2. الآثار:</strong> يُعفى أي طرف من مسؤولية التأخر أو الإخفاق في تنفيذ التزاماته أثناء سريان القوة القاهرة، ويلزم إشعار الطرف الآخر فوراً، وفي حال استمرارها لأكثر من 60 يوماً متصلة يحق لأي من الطرفين إنهاء الاتفاقية دون التزام بتعويض.
          </p>
        </section>

        {/* Article 18: Dispute Resolution */}
        <section id="art-18" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              المادة 18: حل النزاعات والاختصاص القضائي
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">صنعاء، الجمهورية اليمنية</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            يتم التعامل مع أي نزاع أو خلاف ينشأ عن تفسير أو تطبيق هذه الاتفاقية وفق المراحل التالية بالترتيب:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-sap-secondary block">1. التفاوض الودي</span>
              <p className="text-slate-400">محاولة التسوية ودياً وبحسن نية خلال 30 يوماً من إشعار النزاع.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-sap-secondary block">2. الوساطة</span>
              <p className="text-slate-400">اللجوء لوسيط تجاري ومحاسبي محايد يتفق عليه الطرفان.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-sap-secondary block">3. التحكيم التجاري</span>
              <p className="text-slate-400">التحكيم وفقاً لقواعد مراكز التحكيم التجاري المعترف بها.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-emerald-800/60 space-y-1">
              <span className="font-bold text-emerald-400 block">4. القضاء الرسمي</span>
              <p className="text-slate-300">الاختصاص الحصري للمحاكم التجارية المختصة في <strong>صنعاء، الجمهورية اليمنية</strong>.</p>
            </div>
          </div>
        </section>

        {/* Article 19: General Provisions */}
        <section id="art-19" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              المادة 19: أحكام عامة
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">الأطر التفسيرية</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
            <p><strong>19.1. الاتفاقية الكاملة:</strong> تشكل هذه الشروط مجمل الاتفاق بين الطرفين وتلغي أي مفاهمات أو عروض سابقة شفهية أو كتابية.</p>
            <p><strong>19.2. قابلية الفصل:</strong> إذا تقرر بطلان أي بند أو عدم نفاذه، تظل باقي البنود سارية ومنتجة لكامل آثارها القانونية.</p>
            <p><strong>19.3. التنازل:</strong> عدم ممارسة المزود لأي حق لا يعني تنازلاً عنه في المستقبل ما لم يكن التنازل كتابياً وصريحاً.</p>
            <p><strong>19.4. الإشعارات الرسمية:</strong> ترسل المراسلات الرسمية عبر البريد المسجل legal@medo-erp.com أو لوحة إشعارات النظام.</p>
            <p><strong>19.5. اللغة الرسمية:</strong> اللغة العربية هي اللغة المعتمدة حصراً لصياغة وتفسير هذه الاتفاقية، وفي حال ترجمتها تسود النسخة العربية.</p>
          </div>
        </section>

        {/* Article 20: Official Contact */}
        <section id="art-20" className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-sap-secondary flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-400" />
              المادة 20: قنوات التواصل والعناوين الرسمية
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">العناوين المعتمدة</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">البريد القانوني الرسمي:</span>
              <a href="mailto:legal@medo-erp.com" className="font-mono text-sap-secondary hover:underline font-bold">legal@medo-erp.com</a>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">الدعم الفني والتقني:</span>
              <a href="mailto:support@medo-erp.com" className="font-mono text-cyan-400 hover:underline font-bold">support@medo-erp.com</a>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">الاشتراكات والفوترة:</span>
              <a href="mailto:billing@medo-erp.com" className="font-mono text-emerald-400 hover:underline font-bold">billing@medo-erp.com</a>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">واتساب والمكالمات:</span>
              <a href="https://wa.me/967773586047" target="_blank" rel="noreferrer" className="font-mono text-emerald-400 hover:underline font-bold" dir="ltr">+0967773586047</a>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">الموقع الإلكتروني:</span>
              <span className="font-mono text-white">www.medo-erp.com</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">المقر الإداري الرئيسي:</span>
              <span className="text-white font-bold">خمر - الكدوي - عمارة القلمي، عمران، اليمن</span>
            </div>
          </div>
        </section>
      </div>

      {/* Official Sign-off Footer Card */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-sap-secondary/20 border border-sap-secondary/50 flex items-center justify-center text-sap-secondary font-black">
          <Scale className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-xl mx-auto">
          <h3 className="text-lg sm:text-xl font-black text-white">
            ميدو تك للحلول البرمجية — MeDo Tech for Software Solutions
          </h3>
          <p className="text-xs text-slate-400">
            نشكرك على اختيارك منظومة MeDo ERP السحابية. نحن ملتزمون بتقديم أعلى مستويات الأمان والجودة وحماية أعمالكم المحاسبية والإدارية.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400 border-t border-slate-800/80">
          <span>📧 legal@medo-erp.com</span>
          <span>•</span>
          <span dir="ltr">📞 +0967773586047</span>
          <span>•</span>
          <span>📍 خمر - الكدوي - عمارة القلمي، عمران، اليمن</span>
        </div>

        <div className="text-[11px] text-slate-400 font-bold">
          © 2026 منصة MeDo ERP — جميع الحقوق محفوظة ومسجلة رسمياً
        </div>
      </div>
    </div>
  );
};
