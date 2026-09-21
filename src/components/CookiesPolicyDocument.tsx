import React, { useState } from "react";
import { 
  Cookie, 
  ShieldCheck, 
  Settings, 
  BarChart3, 
  Megaphone, 
  ExternalLink, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Info, 
  Printer, 
  Copy, 
  Check, 
  FileText, 
  Phone, 
  Mail, 
  Globe, 
  MapPin,
  Sliders,
  Sparkles
} from "lucide-react";

export const CookiesPolicyDocument: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  
  // Interactive preview state for user cookie preferences
  const [functionalCookies, setFunctionalCookies] = useState(true);
  const [analyticsCookies, setAnalyticsCookies] = useState(true);
  const [marketingCookies, setMarketingCookies] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSavePrefs = () => {
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2500);
  };

  const fontSizeClass = 
    fontSize === "sm" ? "text-xs leading-relaxed" : 
    fontSize === "lg" ? "text-base leading-loose" : 
    "text-sm leading-relaxed";

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-text" dir="rtl">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md sticky top-16 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white">سياسة ملفات تعريف الارتباط</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                الإصدار 2.0 (13 مادة)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                GDPR & ePrivacy
              </span>
            </div>
            <p className="text-xs text-slate-400">منصة MeDo ERP • ميدو تك للحلول البرمجية • سارية من 17 سبتمبر 2026</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1 text-xs">
            <button
              onClick={() => setFontSize("sm")}
              className={`px-2 py-1 rounded-lg transition-colors ${fontSize === "sm" ? "bg-amber-500/20 text-amber-300 font-bold" : "text-slate-400 hover:text-white"}`}
              title="خط صغير"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize("base")}
              className={`px-2 py-1 rounded-lg transition-colors ${fontSize === "base" ? "bg-amber-500/20 text-amber-300 font-bold" : "text-slate-400 hover:text-white"}`}
              title="خط قياسي"
            >
              A
            </button>
            <button
              onClick={() => setFontSize("lg")}
              className={`px-2 py-1 rounded-lg transition-colors ${fontSize === "lg" ? "bg-amber-500/20 text-amber-300 font-bold" : "text-slate-400 hover:text-white"}`}
              title="خط كبير"
            >
              A+
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? "تم النسخ" : "مشاركة"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة الوثيقة</span>
          </button>
        </div>
      </div>

      {/* Official Header Badge */}
      <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden text-center space-y-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>المعايير الدولية لإدارة ملفات الارتباط والخصوصية الرقمية (GDPR / ePrivacy Directive)</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          سياسة ملفات تعريف الارتباط (Cookies Policy)
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          تنظيم متكامل وشفاف لأنواع ملفات الارتباط (Cookies) والتقنيات التتبعية المشابهة المعتمدة لدى منصة 
          <span className="font-bold text-amber-400 mx-1">MeDo ERP</span> وكيفية تمكين المستخدم من إدارة تفضيلاته.
        </p>

        {/* Meta details strip */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">الجهة المُصدرة:</span>
            <span className="font-bold text-slate-200">ميدو تك للحلول البرمجية</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">تاريخ السريان:</span>
            <span className="font-bold text-slate-200">17 سبتمبر 2026</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">عدد المواد:</span>
            <span className="font-bold text-amber-400">13 مادة نظامية</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">النطاق:</span>
            <span className="font-bold text-emerald-400">إقليمي ودولي</span>
          </div>
        </div>
      </div>

      {/* Interactive Cookie Preferences Center Box */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>مركز إدارة تفضيلات ملفات تعريف الارتباط التفاعلي</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono">Interactive Preference Center</span>
              </h3>
              <p className="text-xs text-slate-400">تحكم فوري في تفضيلات الخصوصية وتخزين البيانات لجهازك</p>
            </div>
          </div>

          <button
            onClick={handleSavePrefs}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            {prefsSaved ? <Check className="w-4 h-4 text-slate-950" /> : <Sparkles className="w-4 h-4" />}
            <span>{prefsSaved ? "تم حفظ تفضيلاتك بنجاح" : "حفظ التفضيلات"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Essential */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>ملفات ضرورية</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                إلزامية دائماً
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              تسجيل الدخول، مصادقة الجلسة، حماية CSRF، وحفظ الأمان العام للمنصة.
            </p>
          </div>

          {/* Functional */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-cyan-400" />
                <span>ملفات وظيفية</span>
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={functionalCookies}
                  onChange={(e) => setFunctionalCookies(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              تذكر لغة الواجهة، الثيم الفاتح/الداكن، وحجم الخط وحالة القائمة.
            </p>
          </div>

          {/* Analytics */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                <span>ملفات تحليلية</span>
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analyticsCookies}
                  onChange={(e) => setAnalyticsCookies(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              قياس معدلات الأداء والأخطاء ومعدل الاستخدام (بيانات مجهولة الهوية).
            </p>
          </div>

          {/* Marketing */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                <span>ملفات تسويقية</span>
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingCookies}
                  onChange={(e) => setMarketingCookies(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              قياس الحملات الترويجية الخارجية. لا نشارك أي بيانات مالية نهائياً.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Matrix Card */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400" />
          <span>ملخص سياسة ملفات تعريف الارتباط ومصفوفة التأثير</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                <th className="p-3 font-bold">النوع</th>
                <th className="p-3 font-bold">الحاجة للموافقة</th>
                <th className="p-3 font-bold">الهدف الأساسي</th>
                <th className="p-3 font-bold">أثر التعطيل</th>
                <th className="p-3 font-bold">الامتثال القانوني</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-bold text-emerald-400">الضرورية (Strictly Necessary)</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold">لا تحتاج موافقة</span></td>
                <td className="p-3">المصادقة، الجلسة، الحماية من الاختراق</td>
                <td className="p-3 text-red-400 font-bold">يعطل المنصة كلياً</td>
                <td className="p-3 font-mono text-[11px] text-slate-400">ePrivacy Exemption</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-bold text-cyan-400">الوظيفية (Functional)</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-bold">تحتاج موافقة</span></td>
                <td className="p-3">تذكر اللغة، الثيم، إعدادات العرض</td>
                <td className="p-3 text-amber-400">يؤثر على الراحة والتجربة</td>
                <td className="p-3 font-mono text-[11px] text-slate-400">GDPR Art. 6(1)(a)</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-bold text-purple-400">التحليلية (Analytical)</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-bold">تحتاج موافقة</span></td>
                <td className="p-3">قياس الأداء وسرعة الاستجابة</td>
                <td className="p-3 text-slate-400">لا يؤثر على الاستخدام الفعلي</td>
                <td className="p-3 font-mono text-[11px] text-slate-400">GDPR Art. 6(1)(a)</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-bold text-amber-400">التسويقية (Marketing)</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-bold">تحتاج موافقة صريحة</span></td>
                <td className="p-3">حملات إعادة الاستهداف الخارجية</td>
                <td className="p-3 text-slate-400">لا يؤثر على وظائف ERP إطلاقاً</td>
                <td className="p-3 font-mono text-[11px] text-slate-400">Strict Opt-in</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Articles Container */}
      <div className={`space-y-6 ${fontSizeClass}`}>
        
        {/* الديباجة */}
        <section className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base border-b border-slate-800 pb-2">
            <FileText className="w-4 h-4" />
            <span>ديباجة الوثيقة</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            تستخدم منصة <strong className="text-white">MeDo ERP</strong>، المقدمة من <strong className="text-amber-400">ميدو تك للحلول البرمجية</strong> (يُشار إليها فيما بعد بـ "المزود" أو "نحن")، ملفات تعريف الارتباط (Cookies) وتقنيات مشابهة لتحسين تجربتك، وتشغيل المنصة بكفاءة، وتحليل الأداء، وتقديم خدمات مخصصة.
          </p>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 space-y-1.5 text-xs">
            <p className="font-bold text-slate-200">تهدف هذه السياسة إلى تحقيق ما يلي:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pr-2">
              <li>توضيح ماهية ملفات تعريف الارتباط والتقنيات التتبعية المعتمدة.</li>
              <li>بيان كافة أنواع الملفات التي نستخدمها بدقة وشفافية مطلقة.</li>
              <li>شرح الأغراض التقنية والتشغيلية لكل ملف بالتفصيل.</li>
              <li>تمكين المستخدم من التحكم الكامل في تفضيلاته وتعديلها أو إلغائها في أي وقت.</li>
            </ul>
          </div>
          <p className="text-amber-300/90 font-bold text-xs bg-amber-950/30 p-2.5 rounded-lg border border-amber-900/50">
            ⚠️ إشعار هام: باستخدامك للمنصة، فإنك توافق على استخدام ملفات تعريف الارتباط وفقاً لأحكام وضوابط هذه السياسة.
          </p>
        </section>

        {/* المادة 1 */}
        <section id="cookie-art-1" className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">01</span>
              <span>المادة 1: التعريفات والمصطلحات</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Article 1: Definitions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                  <th className="p-2.5 font-bold w-1/4">المصطلح</th>
                  <th className="p-2.5 font-bold">التعريف القانوني والتقني</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-2.5 font-bold text-white">ملفات تعريف الارتباط (Cookies)</td>
                  <td className="p-2.5 text-slate-300">ملفات نصية صغيرة تُخزن في متصفحك أو قرص جهازك لحفظ معلومات الجلسة والتفضيلات.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-amber-400">المزود</td>
                  <td className="p-2.5 text-slate-300">ميدو تك للحلول البرمجية (مالكة ومطورة ومشغلة نظام MeDo ERP).</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">المستخدم</td>
                  <td className="p-2.5 text-slate-300">أي شخص طبيعي أو اعتباري يزور المنصة أو يسجل الدخول إليها أو يستخدم خدماتها.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-cyan-400">الطرف الأول (First-Party)</td>
                  <td className="p-2.5 text-slate-300">ملفات تعريف الارتباط التي تضعها وتديرها منصة MeDo ERP مباشرة عبر نطاقها الرسمي.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-purple-400">الطرف الثالث (Third-Party)</td>
                  <td className="p-2.5 text-slate-300">ملفات تعريف الارتباط التي يضعها شركاؤنا ومزودو الخدمات السحابية والتحليلية المعتمدون.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-emerald-400">الجلسة (Session Cookies)</td>
                  <td className="p-2.5 text-slate-300">ملفات مؤقتة تنتهي صلاحيتها وتُحذف تلقائياً فور إغلاق متصفح الإنترنت.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-amber-300">الدائمة (Persistent Cookies)</td>
                  <td className="p-2.5 text-slate-300">ملفات تظل محفوظة في جهازك لفترة زمنية محددة أو حتى يتم حذفها يدوياً.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-blue-400">GDPR</td>
                  <td className="p-2.5 text-slate-300">اللائحة العامة لحماية البيانات للاتحاد الأوروبي (General Data Protection Regulation).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* المادة 2 */}
        <section id="cookie-art-2" className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">02</span>
              <span>المادة 2: ما هي ملفات تعريف الارتباط وكيف تعمل؟</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Article 2: Nature & Mechanism</span>
          </div>

          <div className="space-y-3 text-slate-300">
            <div>
              <h4 className="font-bold text-white text-xs mb-1">2.1. التعريف:</h4>
              <p className="text-slate-300 text-xs">
                ملفات تعريف الارتباط (Cookies) هي ملفات نصية صغيرة يتم تخزينها على جهازك (كمبيوتر مكتبي، لابتوب، هاتف ذكي، أو جهاز لوحي) عند زيارتك للمنصة، وتتيح للمنصة التعرف على جهازك وتذكر إعداداتك ومصادقتك وتفضيلاتك.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs mb-1">2.2. دورة عمل ملفات الارتباط:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] pt-1">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <span className="font-bold text-amber-400 block">1. طلب الزيارة</span>
                  <span className="text-slate-400">المتصفح يرسل طلباً لخادم MeDo ERP</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <span className="font-bold text-amber-400 block">2. إنشاء الملف</span>
                  <span className="text-slate-400">الخادم ينشئ ملف تعريف ارتباط مشفر</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <span className="font-bold text-amber-400 block">3. التخزين</span>
                  <span className="text-slate-400">المتصفح يخزن الملف محلياً بجهازك</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <span className="font-bold text-amber-400 block">4. الزيارة المتكررة</span>
                  <span className="text-slate-400">المتصفح يرسل الملف للتحقق التلقائي</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <span className="font-bold text-emerald-400 block">5. التطبيق الفوري</span>
                  <span className="text-slate-400">التعرف وتطبيق تفضيلاتك وجلستك</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs mb-1">2.3. الفرق بين ملفات الجلسة والدائمة:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                      <th className="p-2 font-bold">النوع</th>
                      <th className="p-2 font-bold">فترة الصلاحية</th>
                      <th className="p-2 font-bold">نطاق الاستخدام</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="p-2 font-bold text-emerald-400">ملفات الجلسة (Session)</td>
                      <td className="p-2">تستمر فقط حتى إغلاق نافذة المتصفح</td>
                      <td className="p-2">حفظ حالة تسجيل الدخول، التنقل الآمن بين شاشات النظام والمحاسبة</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-cyan-400">الملفات الدائمة (Persistent)</td>
                      <td className="p-2">تمتد من أيام وأشهر إلى سنتين كحد أقصى</td>
                      <td className="p-2">تذكر التفضيلات، اللغة، حجم العرض، ومعرف الحساب المستأجر</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs mb-1">2.4. تقنيات التخزين المشابهة المعتمدة:</h4>
              <p className="text-xs text-slate-300 mb-2">بالإضافة إلى ملفات تعريف الارتباط التقليدية، نستخدم التقنيات الحديثة التالية:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="font-bold text-white block">Local Storage (التخزين المحلي):</span>
                  <span className="text-slate-400 text-[11px]">لتخزين إعدادات العرض والجداول المحاسبية محلياً دون إرسالها مع كل طلب شبكي.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="font-bold text-white block">Session Storage (تخزين الجلسة):</span>
                  <span className="text-slate-400 text-[11px]">لحفظ مسودات الفواتير والقيود المؤقتة أثناء فتح التبويب لتفادي فقدان البيانات.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="font-bold text-white block">Pixel Tags (علامات البكسل):</span>
                  <span className="text-slate-400 text-[11px]">صور مصغرة غير مرئية لقياس وصول وتفاعل صفحات التسجيل والهبوط.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="font-bold text-white block">Web Beacons (إشارات الويب):</span>
                  <span className="text-slate-400 text-[11px]">تُستخدم لمراقبة معدلات فتح رسائل البريد الإشعارية والإخطارات النظامية.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* المادة 3 */}
        <section id="cookie-art-3" className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">03</span>
              <span>المادة 3: أنواع ملفات تعريف الارتباط المعتمدة وقواعد الموافقة</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Article 3: Classification & Consent</span>
          </div>

          <div className="space-y-3">
            <p className="text-slate-300 text-xs">
              تنقسم ملفات تعريف الارتباط في MeDo ERP إلى 4 فئات محددة بدقة وفقاً لمتطلبات اللائحة العامة لحماية البيانات (GDPR):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-900/40 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center justify-between">
                  <span>1. الضرورية</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded">إلزامية</span>
                </div>
                <p className="text-[11px] text-slate-400">تشغيل النظام والأمان والمصادقة. <strong className="text-emerald-300">لا تحتاج موافقة</strong> مسبقة.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-900/40 space-y-1">
                <div className="font-bold text-cyan-400 flex items-center justify-between">
                  <span>2. الوظيفية</span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded">اختيارية</span>
                </div>
                <p className="text-[11px] text-slate-400">تذكر التفضيلات واللغات والمظهر. <strong className="text-cyan-300">تتطلب موافقة</strong> المستخدم.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-purple-900/40 space-y-1">
                <div className="font-bold text-purple-400 flex items-center justify-between">
                  <span>3. التحليلية</span>
                  <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded">اختيارية</span>
                </div>
                <p className="text-[11px] text-slate-400">قياس الأداء وسرعة التحميل والإحصاءات. <strong className="text-purple-300">تتطلب موافقة</strong> المستخدم.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-amber-900/40 space-y-1">
                <div className="font-bold text-amber-400 flex items-center justify-between">
                  <span>4. التسويقية</span>
                  <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded">اختيارية</span>
                </div>
                <p className="text-[11px] text-slate-400">إعلانات موجهة وقياس وصول الحملات. <strong className="text-amber-300">تتطلب موافقة صريحة</strong>.</p>
              </div>
            </div>
          </div>
        </section>

        {/* المادة 4 */}
        <section id="cookie-art-4" className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">04</span>
              <span>المادة 4: ملفات تعريف الارتباط الضرورية للتشغيل (Strictly Necessary)</span>
            </h3>
            <span className="text-[11px] text-emerald-400 font-mono">Strictly Necessary</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <p>
              <strong>الغرض التشغيلي:</strong> تُعد هذه الملفات جوهرية لتمكين المستخدم من التنقل داخل المنصة واستخدام ميزاتها المحاسبية الأساسية، والوصول إلى المناطق الآمنة والمصادقة والتحقق من الهوية ومنع هجمات تزوير الطلبات (CSRF).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                    <th className="p-2.5 font-bold">اسم الملف (Cookie Name)</th>
                    <th className="p-2.5 font-bold">الغرض الدقيق</th>
                    <th className="p-2.5 font-bold">فترة الاحتفاظ</th>
                    <th className="p-2.5 font-bold">الجهة المصدرة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-400">session_id</td>
                    <td className="p-2.5 font-sans">تحديد جلسة العمل الحالية للمستخدم وضمان استمرارية الاتصال</td>
                    <td className="p-2.5">جلسة (Session)</td>
                    <td className="p-2.5 font-sans">MeDo ERP (طرف أول)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-400">auth_token</td>
                    <td className="p-2.5 font-sans">رمز التوثيق والمصادقة المشفر (JWT) للتحقق من هوية الحساب</td>
                    <td className="p-2.5">30 يوماً</td>
                    <td className="p-2.5 font-sans">MeDo ERP / Firebase</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-400">csrf_token</td>
                    <td className="p-2.5 font-sans">الحماية من هجمات تزوير الطلبات عبر المواقع (Cross-Site Request Forgery)</td>
                    <td className="p-2.5">جلسة (Session)</td>
                    <td className="p-2.5 font-sans">MeDo ERP (طرف أول)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-400">tenant_id</td>
                    <td className="p-2.5 font-sans">تحديد معرف المنشأة المستأجرة لضمان عزل البيانات المحاسبية</td>
                    <td className="p-2.5">سنة كاملة</td>
                    <td className="p-2.5 font-sans">MeDo ERP (طرف أول)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-400">role_id</td>
                    <td className="p-2.5 font-sans">تحديد صلاحيات الدور الوظيفي للمستخدم (مدير، محاسب، أمين صندوق)</td>
                    <td className="p-2.5">جلسة (Session)</td>
                    <td className="p-2.5 font-sans">MeDo ERP (طرف أول)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/40 text-red-300 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span><strong>تنبيه قانوني وتقني:</strong> لا تتطلب هذه الملفات موافقة مسبقة بموجب القوانين الدولية لكونها لازمة تقنياً لتقديم الخدمة. تعطيل هذه الملفات من إعدادات المتصفح يؤدي لتعطيل المنصة ومنع تسجيل الدخول نهائياً.</span>
            </div>
          </div>
        </section>

        {/* المادة 5 */}
        <section id="cookie-art-5" className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">05</span>
              <span>المادة 5: ملفات تعريف الارتباط الوظيفية (Functional Cookies)</span>
            </h3>
            <span className="text-[11px] text-cyan-400 font-mono">Functional Preferences</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <p>
              <strong>الغرض:</strong> تمكين المنصة من تقديم تجربة استخدام محسنة ومخصصة، عبر تذكر الخيارات والإعدادات التفضيلية التي يحددها المستخدم.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                    <th className="p-2.5 font-bold">الاسم التقني</th>
                    <th className="p-2.5 font-bold">الوظيفة المحددة</th>
                    <th className="p-2.5 font-bold">فترة الاحتفاظ</th>
                    <th className="p-2.5 font-bold">أثر التعطيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-400">language</td>
                    <td className="p-2.5 font-sans">تذكر لغة الواجهة المفضلة (العربية / الإنجليزية)</td>
                    <td className="p-2.5">سنة كاملة</td>
                    <td className="p-2.5 font-sans text-amber-300">العودة للغة الافتراضية مع كل زيارة</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-400">theme</td>
                    <td className="p-2.5 font-sans">تذكر نمط المظهر المختار (فاتح Light / داكن Dark)</td>
                    <td className="p-2.5">سنة كاملة</td>
                    <td className="p-2.5 font-sans text-amber-300">إعادة ضبط المظهر للوضع الافتراضي</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-400">font_size</td>
                    <td className="p-2.5 font-sans">تذكر حجم الخط المخصص لقراءة التقارير والفواتير</td>
                    <td className="p-2.5">سنة كاملة</td>
                    <td className="p-2.5 font-sans text-amber-300">العودة للحجم القياسي</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-400">last_page</td>
                    <td className="p-2.5 font-sans">تذكر آخر شاشة تم فتحها لتسهيل استئناف العمل</td>
                    <td className="p-2.5">30 يوماً</td>
                    <td className="p-2.5 font-sans text-slate-400">فتح لوحة التحكم الرئيسية دائماً</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-400">sidebar_state</td>
                    <td className="p-2.5 font-sans">حفظ حالة القائمة الجانبية (مفتوحة / مطوية)</td>
                    <td className="p-2.5">30 يوماً</td>
                    <td className="p-2.5 font-sans text-slate-400">فتح القائمة بالحجم الافتراضي</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-slate-400 text-[11px]">
              * هذه الملفات <strong>اختيارية</strong> وتتطلب موافقتك. تعطيلها لن يمنعك من استخدام المنصة، ولكنه قد يتطلب منك إعادة ضبط تفضيلاتك في كل زيارة.
            </p>
          </div>
        </section>

        {/* المادة 6 */}
        <section id="cookie-art-6" className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">06</span>
              <span>المادة 6: ملفات تعريف الارتباط التحليلية وقياس الأداء (Analytics)</span>
            </h3>
            <span className="text-[11px] text-purple-400 font-mono">Performance & Analytics</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <p>
              <strong>الغرض:</strong> قياس أداء المنصة وتحليل تفاعل المستخدمين والتعرف على الصفحات الأكثر زيارة واستكشاف الأخطاء البرمجية لتحسين تجربة الخدمة باستمرار.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                    <th className="p-2.5 font-bold">اسم الملف</th>
                    <th className="p-2.5 font-bold">المزود الخارجي</th>
                    <th className="p-2.5 font-bold">الغرض التحليلي</th>
                    <th className="p-2.5 font-bold">مدة الاحتفاظ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
                  <tr>
                    <td className="p-2.5 font-bold text-purple-400">_ga</td>
                    <td className="p-2.5 font-sans">Google Analytics</td>
                    <td className="p-2.5 font-sans">تحديد معرف فريد ومجهول المصدر للزائر لاحتساب عدد الزيارات</td>
                    <td className="p-2.5">سنتان</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-purple-400">_gid</td>
                    <td className="p-2.5 font-sans">Google Analytics</td>
                    <td className="p-2.5 font-sans">تتبع الجلسة اليومية وسلوك التنقل بين الصفحات</td>
                    <td className="p-2.5">24 ساعة</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-purple-400">_clck</td>
                    <td className="p-2.5 font-sans">Microsoft Clarity</td>
                    <td className="p-2.5 font-sans">حفظ معرف فريد مجهول المصدر للزائر لتحليل تجربة المستخدم</td>
                    <td className="p-2.5">سنة واحدة</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-purple-400">_clsk</td>
                    <td className="p-2.5 font-sans">Microsoft Clarity</td>
                    <td className="p-2.5 font-sans">دمج نقرات وتفاعلات الزائر في جلسة عمل واحدة</td>
                    <td className="p-2.5">30 دقيقة</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-purple-400">_hjSession</td>
                    <td className="p-2.5 font-sans">Hotjar</td>
                    <td className="p-2.5 font-sans">الحفاظ على بيانات الجلسة وإنشاء خرائط حرارية مجهولة الهوية</td>
                    <td className="p-2.5">30 دقيقة</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-purple-900/40 text-purple-300 text-[11px] space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>ضمانات حماية السرية المحاسبية في التحليلات:</span>
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-0.5 pr-2">
                <li>لا نجمع أو نرسل أي بيانات مالية أو محاسبية أو أسماء عملاء في الأدوات التحليلية.</li>
                <li>لا يتم تخزين أو معالجة أي بيانات شخصية حساسة أو كلمات مرور.</li>
                <li>يتم حجب عناوين الـ IP وجعل كافة البيانات مجهولة المصدر تماماً (Anonymized Data).</li>
              </ul>
            </div>
          </div>
        </section>

        {/* المادة 7 */}
        <section id="cookie-art-7" className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">07</span>
              <span>المادة 7: ملفات تعريف الارتباط التسويقية والإعلانية (Marketing)</span>
            </h3>
            <span className="text-[11px] text-amber-400 font-mono">Marketing & Ads</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <p>
              <strong>الغرض:</strong> قياس فعالية الحملات الترويجية للمنصة، وإعادة استهداف المهتمين بخدمات MeDo ERP وعرض عروض واشتراكات مخصصة على منصات التواصل الاجتماعي.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                    <th className="p-2.5 font-bold">اسم الملف</th>
                    <th className="p-2.5 font-bold">المزود</th>
                    <th className="p-2.5 font-bold">الغرض الترويجي</th>
                    <th className="p-2.5 font-bold">المدة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
                  <tr>
                    <td className="p-2.5 font-bold text-amber-400">_fbp</td>
                    <td className="p-2.5 font-sans">Facebook Pixel (Meta)</td>
                    <td className="p-2.5 font-sans">تحديد معرف فريد لزيارات المتصفح لقياس فاعلية الإعلانات</td>
                    <td className="p-2.5">90 يوماً</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-amber-400">_fbc</td>
                    <td className="p-2.5 font-sans">Facebook Pixel (Meta)</td>
                    <td className="p-2.5 font-sans">تتبع النقرات الواردة من إعلانات فيسبوك وإنستغرام</td>
                    <td className="p-2.5">90 يوماً</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-amber-400">fr</td>
                    <td className="p-2.5 font-sans">Facebook</td>
                    <td className="p-2.5 font-sans">تقديم وتوجيه وقياس ملاءمة الإعلانات الرقمية</td>
                    <td className="p-2.5">90 يوماً</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-300 text-[11px] space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>حظر مشاركة البيانات المالية:</span>
              </p>
              <p className="text-slate-300 leading-relaxed">
                نؤكد التزامنا التام بعدم مشاركة أو بيع أي بيانات مالية أو أرقام حسابات أو فواتير أو قيود محاسبية لمنشأتك مع أي شركة إعلانية أو طرف ثالث إطلاقاً. تقتصر البيانات على التصفح العام لصفحات التسويق الخارجية فقط.
              </p>
            </div>
          </div>
        </section>

        {/* المادة 8 */}
        <section id="cookie-art-8" className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">08</span>
              <span>المادة 8: ملفات تعريف الارتباط للطرف الثالث وسياساتها</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Third-Party Cookies</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <p>
              تستعين المنصة بجهات خارجية موثوقة لتقديم خدمات التحليل والبنية التحتية والمصادقة الآمنة. الجدول التالي يوضح قائمة الشركاء المعتمدين ومواقع معالجة بياناتهم:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                    <th className="p-2.5 font-bold">المزود الخارجي</th>
                    <th className="p-2.5 font-bold">نوع الملف</th>
                    <th className="p-2.5 font-bold">الغرض</th>
                    <th className="p-2.5 font-bold">موقع الخوادم</th>
                    <th className="p-2.5 font-bold">رابط السياسة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-2.5 font-bold text-white">Google Analytics</td>
                    <td className="p-2.5 text-purple-400">تحليلية</td>
                    <td className="p-2.5">تحليل الزوار والأداء</td>
                    <td className="p-2.5 font-mono text-[11px]">الاتحاد الأوروبي</td>
                    <td className="p-2.5">
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">
                        <span>السياسة</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">Microsoft Clarity</td>
                    <td className="p-2.5 text-purple-400">تحليلية</td>
                    <td className="p-2.5">تحليل سلوك التصفح</td>
                    <td className="p-2.5 font-mono text-[11px]">الاتحاد الأوروبي</td>
                    <td className="p-2.5">
                      <a href="https://privacy.microsoft.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">
                        <span>السياسة</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">Hotjar</td>
                    <td className="p-2.5 text-purple-400">تحليلية</td>
                    <td className="p-2.5">خرائط حرارية لتحسين الواجهة</td>
                    <td className="p-2.5 font-mono text-[11px]">الاتحاد الأوروبي</td>
                    <td className="p-2.5">
                      <a href="https://www.hotjar.com/legal/policies/privacy/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">
                        <span>السياسة</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">Facebook Pixel</td>
                    <td className="p-2.5 text-amber-400">تسويقية</td>
                    <td className="p-2.5">حملات إعلانية وتتبع</td>
                    <td className="p-2.5 font-mono text-[11px]">الولايات المتحدة</td>
                    <td className="p-2.5">
                      <a href="https://www.facebook.com/privacy/explanation" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">
                        <span>السياسة</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">Firebase (Google)</td>
                    <td className="p-2.5 text-emerald-400 font-bold">ضرورية</td>
                    <td className="p-2.5">مصادقة آمنة وقواعد بيانات</td>
                    <td className="p-2.5 font-mono text-[11px]">الاتحاد الأوروبي</td>
                    <td className="p-2.5">
                      <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">
                        <span>السياسة</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">Vercel / Cloud Run</td>
                    <td className="p-2.5 text-emerald-400 font-bold">ضرورية</td>
                    <td className="p-2.5">الاستضافة وحماية الحافة (Edge)</td>
                    <td className="p-2.5 font-mono text-[11px]">أوروبا / أمريكا</td>
                    <td className="p-2.5">
                      <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">
                        <span>السياسة</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-slate-400 text-[11px]">
              * لا نتحكم في ملفات تعريف الارتباط الصادرة من خوادم الطرف الثالث، وتخضع لسياسات الخصوصية الخاصة بتلك الشركات. يمكنك حظر هذه الملفات عبر متصفحك أو عبر روابط إلغاء الاشتراك الرسمية الموضحة أدناه.
            </p>
          </div>
        </section>

        {/* المادة 9 */}
        <section id="cookie-art-9" className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">09</span>
              <span>المادة 9: مدة الاحتفاظ وقواعد الحذف التلقائي</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Retention & Deletion</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">ملفات الجلسة</span>
                <span className="text-sm font-bold text-emerald-400 mt-1 block">حتى إغلاق المتصفح</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">الملفات الوظيفية</span>
                <span className="text-sm font-bold text-cyan-400 mt-1 block">حتى سنة واحدة</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">الملفات التحليلية</span>
                <span className="text-sm font-bold text-purple-400 mt-1 block">حتى سنتين</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">الملفات التسويقية</span>
                <span className="text-sm font-bold text-amber-400 mt-1 block">حتى 90 يوماً</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <p><strong>الحذف التلقائي:</strong> تُحذف كافة الملفات من متصفحك تلقائياً وبشكل دوري بمجرد انتهاء فترة الصلاحية المحددة أعلاه.</p>
              <p><strong>الحذف اليدوي الفوري:</strong> يحق للمستخدم في أي وقت مسح كافة ملفات الارتباط وسجل التصفح من خلال إعدادات المتصفح لديه.</p>
              <p><strong>الحذف عند الطلب:</strong> يمكنك تقديم طلب لمسؤول حماية البيانات لدينا لحذف سجلات الارتباط المرتبطة بحسابك، ويتم تنفيذ الطلب خلال <strong>30 يوماً</strong> كحد أقصى.</p>
            </div>
          </div>
        </section>

        {/* المادة 10 */}
        <section id="cookie-art-10" className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">10</span>
              <span>المادة 10: كيف تتحكم في ملفات تعريف الارتباط؟</span>
            </h3>
            <span className="text-[11px] text-amber-400 font-mono">User Control & Preferences</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div>
              <h4 className="font-bold text-white text-xs mb-1">10.1. التحكم من خلال منصة MeDo ERP:</h4>
              <p className="text-slate-300 leading-relaxed">
                عند زيارتك الأولى للمنصة، يُعرض عليك شريط موافقة مخصص يتيح لك إما [قبول الكل] أو [رفض الكل] أو [تخصيص الخيارات]. يمكنك العودة إلى أداة التفضيلات التفاعلية أعلى هذه الصفحة في أي وقت لتعديل اختياراتك وحفظها.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs mb-1">10.2. التحكم من خلال إعدادات متصفح الإنترنت:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                      <th className="p-2 font-bold">المتصفح</th>
                      <th className="p-2 font-bold">المسار المباشر لتعطيل أو إدارة ملفات الارتباط</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="p-2 font-bold text-white">Google Chrome</td>
                      <td className="p-2">الإعدادات (Settings) ← الخصوصية والأمان (Privacy & Security) ← ملفات تعريف الارتباط وبيانات الموقع الأخرى.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white">Mozilla Firefox</td>
                      <td className="p-2">الخيارات (Options) ← الخصوصية والأمان (Privacy & Security) ← الكوكيز وبيانات المواقع.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white">Apple Safari</td>
                      <td className="p-2">التفضيلات (Preferences) ← الخصوصية (Privacy) ← منع التتبع عبر المواقع وحظر جميع ملفات الارتباط.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white">Microsoft Edge</td>
                      <td className="p-2">الإعدادات (Settings) ← ملفات تعريف الارتباط وأذونات الموقع ← إدارة وحذف ملفات تعريف الارتباط.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs mb-1">10.3. إلغاء الاشتراك عبر أدوات الأطراف الثالثة المباشرة:</h4>
              <div className="flex flex-wrap gap-3 pt-1">
                <a 
                  href="https://tools.google.com/dlpage/gaoptout" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>أداة إلغاء الاشتراك في Google Analytics</span>
                </a>
                <a 
                  href="https://www.facebook.com/ads/preferences" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>إدارة تفضيلات إعلانات Facebook</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs mb-1">10.4. التصفح في الوضع الخفي (Incognito / Private Browsing):</h4>
              <p className="text-slate-400">
                يمكنك استخدام وضع التصفح المتخفي في متصفحك؛ في هذا الوضع، يتم حذف جميع ملفات تعريف الارتباط وتاريخ التصفح تلقائياً بمجرد إغلاق كافة نوافذ التصفح المتخفي.
              </p>
            </div>
          </div>
        </section>

        {/* المادة 11 */}
        <section id="cookie-art-11" className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">11</span>
              <span>المادة 11: الأثر التقني والتشغيلي المترتب على تعطيل ملفات الارتباط</span>
            </h3>
            <span className="text-[11px] text-red-400 font-mono">Impact of Disabling</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40 space-y-1.5">
              <div className="font-bold text-red-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                <span>تعطيل الملفات الضرورية:</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <strong>يعطل المنصة بالكامل:</strong> لن تتمكن من تسجيل الدخول إلى حساب المنشأة، ولن تتمكن من الوصول للدفاتر المحاسبية أو إضافة قيود أو طباعة فواتير لتعذر المصادقة وحماية الجلسة.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-1.5">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>تعطيل الملفات الوظيفية:</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <strong>يؤثر على تجربة المستخدم:</strong> لن يتذكر النظام لغة الواجهة المفضلة أو المظهر المختار (فاتح/داكن) أو حجم الخط، وسيتعين عليك إعادة تحديدها يدوياً مع كل جلسة تصفح جديدة.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/40 space-y-1.5">
              <div className="font-bold text-purple-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>تعطيل الملفات التحليلية:</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <strong>لا يؤثر على وظائف ERP:</strong> يمكنك استخدام كامل الميزات المحاسبية بحرية، لكن لن يتمكن فريق التطوير لدينا من تتبع أخطاء الأداء وتحسين سرعة الاستجابة استناداً لسلوك استخدامك.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-1.5">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>تعطيل الملفات التسويقية:</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <strong>لا يؤثر على النظام إطلاقاً:</strong> لن يؤثر على أي تقرير أو فاتورة أو وظيفة داخل المنصة، ولكنك قد تشاهد إعلانات عامة غير مخصصة لاهتماماتك عند تصفح منصات التواصل الاجتماعي.
              </p>
            </div>
          </div>
        </section>

        {/* المادة 12 */}
        <section id="cookie-art-12" className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">12</span>
              <span>المادة 12: التحديثات الدورية للسياسة والإشعارات</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Updates & Notifications</span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <p>
              <strong>12.1. الحق في التحديث:</strong> يحتفظ المزود بحقه الكامل في تحديث أو تعديل بنود هذه السياسة من وقت لآخر لمواكبة التطورات التقنية والتحديثات التشريعية والقوانين الدولية المنظمة لملفات الارتباط والخصوصية الرقمية.
            </p>
            <p>
              <strong>12.2. آلية الإشعار:</strong> في حال إجراء أي تغييرات جوهرية تمس حقوق المستخدم أو آليات التتبع، سيتم إخطار المستخدم قبل <strong>30 يوماً</strong> من دخول التعديل حيز التنفيذ عبر البريد الإلكتروني المسجل أو عبر إشعار نظامي بارز في لوحة تحكم المنصة.
            </p>
            <p>
              <strong>12.3. استمرار الاستخدام:</strong> استمرارك في استخدام منصة MeDo ERP بعد تاريخ سريان التحديثات يُعد موافقة صريحة على السياسة المحدثة. في حال عدم موافقتك، يمكنك تعديل تفضيلاتك فوراً أو التوقف عن استخدام المنصة.
            </p>
          </div>
        </section>

        {/* المادة 13 */}
        <section id="cookie-art-13" className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">13</span>
              <span>المادة 13: قنوات التواصل ومسؤول حماية البيانات (DPO)</span>
            </h3>
            <span className="text-[11px] text-cyan-400 font-mono">Contact & DPO</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>مسؤول حماية البيانات (DPO):</span>
              </div>
              <a href="mailto:dpo@medo-erp.com" className="font-bold text-white font-mono hover:text-cyan-400">
                dpo@medo-erp.com
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>بريد الخصوصية العام:</span>
              </div>
              <a href="mailto:privacy@medo-erp.com" className="font-bold text-white font-mono hover:text-emerald-400">
                privacy@medo-erp.com
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>الدعم الفني وواتساب:</span>
              </div>
              <a href="https://wa.me/967773586047" target="_blank" rel="noopener noreferrer" className="font-bold text-white font-mono hover:text-amber-400" dir="ltr">
                +967 773 586 047
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 sm:col-span-2">
              <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>المقر الرئيسي:</span>
              </div>
              <p className="font-bold text-slate-200">
                خمر - الكدوي - عمارة القلمي، محافظة عمران، الجمهورية اليمنية
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>الموقع الإلكتروني:</span>
              </div>
              <a href="https://www.medo-erp.com" target="_blank" rel="noopener noreferrer" className="font-bold text-white font-mono hover:text-purple-400">
                www.medo-erp.com
              </a>
            </div>
          </div>
        </section>

        {/* خاتمة الوثيقة وتوقيع الاعتماد */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-black text-white">خاتمة وإقرار الامتثال</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto leading-relaxed">
              نلتزم في <strong className="text-white">MeDo ERP</strong> بأعلى معايير حماية الخصوصية الرقمية والشفافية التامة في استخدام ملفات تعريف الارتباط بما يضمن حماية منشأتك وحساباتك.
            </p>
          </div>

          <div className="pt-2 text-xs text-slate-400 border-t border-slate-800/80 space-y-1">
            <p className="font-bold text-amber-400">ميدو تك للحلول البرمجية • MeDo Tech for Software Solutions</p>
            <p className="font-mono text-[11px] text-slate-500">© 2026 — جميع الحقوق محفوظة لمنصة MeDo ERP</p>
          </div>
        </div>

      </div>
    </div>
  );
};
