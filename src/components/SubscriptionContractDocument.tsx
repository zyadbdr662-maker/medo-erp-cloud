import React, { useState } from "react";
import {
  FileText,
  Building2,
  UserCheck,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Zap,
  Scale,
  CreditCard,
  Printer,
  Edit3,
  Eye,
  Phone,
  Mail,
  MapPin,
  CheckSquare,
  Square,
  Sparkles,
  HelpCircle,
  AlertTriangle
} from "lucide-react";

export const SubscriptionContractDocument: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Form State for dynamic contract generation
  const [contractNo, setContractNo] = useState<string>("MEDO-CNT-2026-0894");
  const [contractDate, setContractDate] = useState<string>("2026-09-17");
  const [clientName, setClientName] = useState<string>("شركة النخبة للتجارة والاستيراد");
  const [clientRep, setClientRep] = useState<string>("أحمد محمد عبد الله");
  const [clientRole, setClientRole] = useState<string>("المدير العام والمفوض");
  const [clientCR, setClientCR] = useState<string>("CR-8472910");
  const [clientTax, setClientTax] = useState<string>("TX-992014");
  const [clientAddress, setClientAddress] = useState<string>("شارع الزبيري - صنعاء، الجمهورية اليمنية");
  const [clientEmail, setClientEmail] = useState<string>("info@al-nokhbah-ye.com");
  const [clientPhone, setClientPhone] = useState<string>("+967 771 234 567");

  const [selectedPlan, setSelectedPlan] = useState<string>("المؤسسية (Enterprise)");
  const [userCount, setUserCount] = useState<string>("25 مستخدم");
  const [branchCount, setBranchCount] = useState<string>("4 فروع");
  const [contractDuration, setContractDuration] = useState<string>("سنة كاملة (12 شهراً)");
  const [subscriptionFee, setSubscriptionFee] = useState<string>("1,200,000 ريال يمني");
  const [taxAmount, setTaxAmount] = useState<string>("شاملة الضريبة القانونية");
  const [totalFee, setTotalFee] = useState<string>("1,200,000 ريال يمني");

  const [features, setFeatures] = useState({
    salesPurchases: true,
    inventory: true,
    glReports: true,
    hr: true,
    wallets: true,
    ai: true,
    multiWallets: true,
  });

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 text-slate-200" dir="rtl">
      {/* Top Banner & Action Controls */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/30 border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                وثيقة تعاقدية رسمية
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                رقم العقد: {contractNo}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 text-xs font-mono font-bold">
                معتمد قانونياً 2026
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              نموذج عقد اشتراك في منصة MeDo ERP
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              عقد تقديم وترخيص الخدمات السحابية المحاسبية والإدارية المبرم بين شركة <strong>ميدو تك للحلول البرمجية</strong> والعميل المشترك.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              {isEditMode ? (
                <>
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>معاينة العقد النهائي</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>تعبئة بيانات العميل والباقة</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Editor Panel (If in edit mode) */}
      {isEditMode && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 space-y-6 shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">تخصيص وتعبئة بيانات العقد والاشتراك</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">رقم العقد</label>
              <input
                type="text"
                value={contractNo}
                onChange={e => setContractNo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">تاريخ التوقيع</label>
              <input
                type="date"
                value={contractDate}
                onChange={e => setContractDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">اسم منشأة العميل</label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">الممثل القانوني للعميل</label>
              <input
                type="text"
                value={clientRep}
                onChange={e => setClientRep(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">الصفة</label>
              <input
                type="text"
                value={clientRole}
                onChange={e => setClientRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">السجل التجاري للعميل</label>
              <input
                type="text"
                value={clientCR}
                onChange={e => setClientCR(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">الرقم الضريبي للعميل</label>
              <input
                type="text"
                value={clientTax}
                onChange={e => setClientTax(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">عنوان منشأة العميل</label>
              <input
                type="text"
                value={clientAddress}
                onChange={e => setClientAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">البريد الإلكتروني للعميل</label>
              <input
                type="email"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">هاتف العميل</label>
              <input
                type="text"
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">الباقة المختارة</label>
              <input
                type="text"
                value={selectedPlan}
                onChange={e => setSelectedPlan(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">قيمة الاشتراك الإجمالية</label>
              <input
                type="text"
                value={totalFee}
                onChange={e => setTotalFee(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* Contract Preamble (الديباجة) */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            📜
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">ديباجة العقد</h2>
            <p className="text-xs text-slate-400">مقدمة الاتفاقية والسند القانوني</p>
          </div>
        </div>
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            حيث إن <strong>ميدو تك للحلول البرمجية</strong> (يُشار إليها فيما بعد بـ "المزود" أو "الطرف الأول") هي منشأة تقنية متخصصة في تطوير وتشغيل وتوريد البرمجيات المحاسبية السحابية وحلول إدارة الموارد (ERP) المتقدمة.
          </p>
          <p>
            وحيث إن <strong>الطرف الثاني</strong> ({clientName}) يرغب في الاشتراك في منصة <strong>MeDo ERP</strong> والاستفادة من خدماتها المحاسبية والإدارية والسحابية وفقاً لأعلى معايير الحماية والأداء.
          </p>
          <p className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 font-medium text-amber-200">
            وحيث إن الطرفين بكامل أهليتهما المعتبرة شرعاً وقانوناً قد اتفقا وتراضيا على الشروط والبنود الواردة في هذا العقد وملحقاته الإلزامية:
          </p>
        </div>
      </section>

      {/* Article 1: Parties Information */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            1
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">المادة 1: بيانات الطرفين</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* First Party */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-slate-800 pb-2">
              <Building2 className="w-4 h-4" />
              <span>الطرف الأول (المزود)</span>
            </div>
            <table className="w-full text-xs text-right border-collapse">
              <tbody className="divide-y divide-slate-800/80">
                <tr>
                  <td className="py-2 text-slate-400 font-bold w-1/3">الاسم التجاري:</td>
                  <td className="py-2 text-slate-200 font-bold">ميدو تك للحلول البرمجية</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-bold">الممثل القانوني:</td>
                  <td className="py-2 text-slate-200 font-bold">بدر عايض محمد</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-bold">الصفة:</td>
                  <td className="py-2 text-slate-200">المدير العام والمؤسس</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-bold">العنوان:</td>
                  <td className="py-2 text-slate-300">خمر - الكدوي - عمارة القلمي، عمران، الجمهورية اليمنية</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-bold">البريد الإلكتروني:</td>
                  <td className="py-2 text-indigo-400 font-mono">legal@medo-erp.com</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-bold">الهاتف المعتمد:</td>
                  <td className="py-2 text-emerald-400 font-mono" dir="ltr">+0967773586047</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Second Party */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-bold border-b border-slate-800 pb-2">
              <UserCheck className="w-4 h-4" />
              <span>الطرف الثاني (العميل المشترك)</span>
            </div>
            <table className="w-full text-xs text-right border-collapse">
              <tbody className="divide-y divide-slate-800/80">
                <tr>
                  <td className="py-2 text-slate-400 font-bold w-1/3">اسم المنشأة:</td>
                  <td className="py-2 text-white font-bold">{clientName}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-bold">الممثل القانوني:</td>
                  <td className="py-2 text-slate-200 font-bold">{clientRep}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-bold">الصفة:</td>
                  <td className="py-2 text-slate-200">{clientRole}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-bold">السجل التجاري:</td>
                  <td className="py-2 text-slate-300 font-mono">{clientCR}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-bold">الرقم الضريبي:</td>
                  <td className="py-2 text-slate-300 font-mono">{clientTax}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-bold">العنوان:</td>
                  <td className="py-2 text-slate-300">{clientAddress}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-bold">البريد والهاتف:</td>
                  <td className="py-2 text-slate-300 font-mono">{clientEmail} / {clientPhone}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Article 2: Definitions */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            2
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">المادة 2: التعريفات المعتمدة</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="p-3 w-1/4">المصطلح</th>
                <th className="p-3">المعنى والمفهوم القانوني</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="p-3 font-bold text-white">المنصة (Platform)</td>
                <td className="p-3">نظام MeDo ERP بجميع وحداته المحاسبية، الإدارية، المخزنية، الذكية والسحابية.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">المزود (Provider)</td>
                <td className="p-3">ميدو تك للحلول البرمجية، مالكة حقوق الملكية الفكرية والتشغيلية للمنصة.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">العميل (Client)</td>
                <td className="p-3">الطرف الثاني المشترك في المنصة والمرخص له بالاستخدام بموجب هذا العقد.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">الباقة (Package)</td>
                <td className="p-3">خطة الاشتراك المختارة المحددة بعدد المستخدمين والفروع والقدرات الوظيفية.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">المستخدمون المصرح لهم</td>
                <td className="p-3">الموظفون التابعون للعميل الممنوحون حسابات دخول نشطة وفق صلاحيات محددة.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">بيانات العميل</td>
                <td className="p-3">كافة القيود المحاسبية، الفواتير، بيانات العملاء والموردين المدخلة من قبل العميل.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">الوثائق المرتبطة</td>
                <td className="p-3">شروط الاستخدام، سياسة الخصوصية، إخلاء المسؤولية، DPA، سياسة الاسترداد، Cookies، وSLA.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Article 3 & 4: Subject & Package Details */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            3-4
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">المادة 3 و 4: موضوع العقد وتفاصيل الباقة</h2>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            <strong>3.1. موضوع العقد:</strong> يمنح الطرف الأول للطرف الثاني ترخيصاً غير حصري وغير قابل للتحويل لاستخدام منصة <strong>MeDo ERP</strong> وفقاً للباقة المعتمدة طوال مدة سريان العقد.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-amber-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                الخدمات المشمولة في نطاق العقد
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-400">
                <li>تشغيل المنصة السحابية وتوفير خوادم عالية الأداء 24/7.</li>
                <li>تخزين البيانات والنسخ الاحتياطي اليومي المشفر.</li>
                <li>الدعم الفني والصيانة والتحديثات الدورية المستمرة.</li>
                <li>إصدار التقارير المالية المتوافقة مع معايير IFRS والأنظمة المحلية.</li>
              </ul>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                الخدمات غير المشمولة (تتطلب اتفاقاً منفصلاً)
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-400">
                <li>التدريب المتقدم في مقرات العميل خارج النطاق القياسي.</li>
                <li>التخصيص البرمجي الجذري والتطوير المخصص خارج المنظومة.</li>
                <li>الربط عبر واجهات API مع أنظمة وبرمجيات طرف ثالث غير معتمدة.</li>
                <li>الاستشارات المحاسبية والقانونية المتخصصة.</li>
              </ul>
            </div>
          </div>

          {/* Package Features Checkboxes */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs sm:text-sm">ميزات الباقة المعتمدة في هذا العقد ({selectedPlan}):</h3>
              <span className="text-[11px] text-slate-400 font-mono">المستخدمون: {userCount} | الفروع: {branchCount}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {[
                { key: "salesPurchases", label: "إدارة المبيعات والمشتريات" },
                { key: "inventory", label: "إدارة المخزون والتكلفة" },
                { key: "glReports", label: "الأستاذ العام والقوائم المالية" },
                { key: "hr", label: "شؤون الموظفين والرواتب" },
                { key: "wallets", label: "المحافظ والبنوك والصناديق" },
                { key: "ai", label: "الذكاء المالي المتقدم والمساعد المالي" },
                { key: "multiWallets", label: "دعم تعدد العملات والمحافظ" },
              ].map(item => {
                const isChecked = features[item.key as keyof typeof features];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleFeature(item.key as keyof typeof features)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                      isChecked
                        ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
                        : "bg-slate-950 border-slate-800 text-slate-500 line-through"
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    )}
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Article 5 & 6: Duration & Fees */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            5-6
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">المادة 5 و 6: مدة العقد وقيمة الاشتراك والدفع</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-300">
          <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-xs sm:text-sm">
              <Calendar className="w-4 h-4 text-indigo-400" />
              أحكام مدة العقد والتجديد
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><strong>تاريخ البدء:</strong> يسري هذا العقد اعتباراً من تاريخ توقيعه ({contractDate}).</li>
              <li><strong>مدة الاشتراك:</strong> {contractDuration}.</li>
              <li><strong>التجديد التلقائي:</strong> يتجدد العقد تلقائياً لمدد مماثلة ما لم يخطر أحد الطرفين الآخر كتابياً بعدم الرغبة بالتجديد قبل <strong>30 يوماً</strong> من تاريخ الانتهاء.</li>
              <li><strong>إشعار التجديد:</strong> يُرسل المزود إشعاراً إلكترونياً بالتجديد قبل <strong>15 يوماً</strong> من نهاية الفترة.</li>
            </ul>
          </div>

          <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-xs sm:text-sm">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              الرسوم وآلية السداد
            </h3>
            <table className="w-full text-xs text-right border-collapse">
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="py-2 text-slate-400 font-bold">قيمة الاشتراك:</td>
                  <td className="py-2 text-white font-mono font-bold">{subscriptionFee}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-bold">الضريبة القانونية:</td>
                  <td className="py-2 text-slate-300">{taxAmount}</td>
                </tr>
                <tr>
                  <td className="py-2 text-amber-400 font-bold">الإجمالي المستحق:</td>
                  <td className="py-2 text-amber-400 font-mono font-bold text-sm">{totalFee}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-bold">مهلة السداد عند التأخر:</td>
                  <td className="py-2 text-rose-400">7 أيام (يعلق الحساب بعدها)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Article 7 & 8: Obligations of Provider and Client */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            7-8
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">المادة 7 و 8: التزامات المزود والتزامات العميل</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-300">
          <div className="space-y-3">
            <h3 className="font-bold text-emerald-400 flex items-center gap-2 text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4" />
              التزامات المزود (ميدو تك)
            </h3>
            <ul className="list-disc list-inside space-y-2 text-xs text-slate-400 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <li>ضمان توفر المنصة بنسبة Uptime متوافقة مع اتفاقية SLA المعتمدة.</li>
              <li>تنفيذ النسخ الاحتياطي التلقائي للبيانات وحمايتها بتشفير AES-256.</li>
              <li>تقديم التحديثات الدورية وإصلاح الثغرات البرمجية فوراً.</li>
              <li>الرد على طلبات وتذاكر الدعم الفني خلال المدد الزمنية المحددة.</li>
              <li>إشعار العميل المسبق بأي صيانة مجدولة بمدة لا تقل عن 48 ساعة.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-indigo-400 flex items-center gap-2 text-xs sm:text-sm">
              <UserCheck className="w-4 h-4" />
              التزامات العميل المشترك
            </h3>
            <ul className="list-disc list-inside space-y-2 text-xs text-slate-400 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <li>سداد رسوم الاشتراك المعتمدة في مواعيد استحقاقها دون تأخير.</li>
              <li>استخدام المنصة للأغراض التجارية والمحاسبية المشروعة فقط.</li>
              <li>الحفاظ على سرية بيانات تسجيل الدخول وتعيين كلمات مرور قوية.</li>
              <li>مسؤولية العميل الكاملة عن صحة البيانات والمدخلات المحاسبية.</li>
              <li>إبلاغ المزود فوراً في حال الاشتباه بأي محاولة اختراق أو تسريب للحساب.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Article 9: Associated Documents */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            9
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">المادة 9: الوثائق والسياسات المرتبطة</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          يعد هذا العقد كلاً لا يتجزأ من المنظومة القانونية لمنصة MeDo ERP، ويعتبر توقيع العميل إقراراً ملزماً بالموافقة على الوثائق التالية:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: "شروط الاستخدام (Terms of Service)", code: "TERMS", status: "ملحق إلزامي" },
            { name: "سياسة الخصوصية وحماية البيانات (Privacy)", code: "PRIVACY", status: "ملحق إلزامي" },
            { name: "إخلاء المسؤولية والحدود القانونية", code: "DISCLAIMER", status: "ملحق إلزامي" },
            { name: "اتفاقية معالجة البيانات (DPA)", code: "DPA", status: "ملحق إلزامي" },
            { name: "سياسة الاسترداد وإلغاء الاشتراك (Refund)", code: "REFUND", status: "ملحق إلزامي" },
            { name: "سياسة ملفات تعريف الارتباط (Cookies)", code: "COOKIES", status: "ملحق إلزامي" },
            { name: "اتفاقية مستوى الخدمة (SLA)", code: "SLA", status: "ملحق إلزامي" },
          ].map((doc, idx) => (
            <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">{doc.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/40">{doc.status}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Articles 10 to 17: Rules & Protections */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            10-17
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">الأحكام القانونية، السرية، والمسؤولية</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              المادة 11 و 12: الملكية الفكرية والسرية
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              تعود ملكية المنصة وكودها المصدري بالكامل للمزود، بينما تعود ملكية البيانات والقيود المحاسبية للعميل. يلتزم الطرفان بالحفاظ على سرية المعلومات التجارية لمدة <strong>5 سنوات</strong> بعد انتهاء العقد.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              المادة 13 و 14: حماية البيانات وحدود المسؤولية
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              تُقدم المنصة "كما هي"، ولا يتحمل المزود أي مسؤولية عن أخطاء إدخال العميل للبيانات أو أسعار الصرف. ينحصر الحد الأقصى للتعويض بقيمة الاشتراك المدفوع خلال آخر 12 شهراً.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-400" />
              المادة 15: إنهاء العقد
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              يحق للعميل الإنهاء بإشعار خطي قبل 30 يوماً. وتتاح مهلة 30 يوماً لتصدير البيانات قبل إتلافها وحذفها نهائياً من الخوادم السحابية.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              المادة 16 و 17: القانون الحاكم وفض النزاعات
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              يخضع هذا العقد ويفسر وفقاً للقوانين النافذة في <strong>الجمهورية اليمنية</strong>، وتختص المحاكم التجارية في <strong>صنعاء، اليمن</strong> بالفصل في أي نزاع بعد تعذر التسوية الودية.
            </p>
          </div>
        </div>
      </section>

      {/* Article 18: Signatures Section */}
      <section className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            18
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">المادة 18: التوقيعات والاعتماد الرسمي</h2>
        </div>

        <p className="text-xs text-slate-400">
          حُرر هذا العقد من نسختين أصليتين متطابقتين باللغة العربية تسلم كل طرف نسخته للعمل بموجبها.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Provider Signature Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-amber-400 text-sm">الطرف الأول (المزود)</span>
              <span className="text-[10px] font-mono text-slate-500">ميدو تك للحلول</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">الاسم المعتمد:</span>
                <span className="text-white font-bold">بدر عايض محمد</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الصفة:</span>
                <span className="text-slate-300">المدير العام والمؤسس</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">التاريخ:</span>
                <span className="text-slate-300 font-mono">{contractDate}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-dashed border-slate-800 flex items-center justify-between">
              <div className="space-y-2">
                <div className="text-[10px] text-slate-500">التوقيع الرقمي / اليدوي:</div>
                <div className="font-serif italic text-amber-400 text-lg">Badr Ayedh M.</div>
              </div>
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-500/40 bg-amber-500/5 flex flex-col items-center justify-center text-center p-1 text-[9px] text-amber-400 font-bold">
                <span>ختم المزود</span>
                <span className="text-[7px] text-slate-400">MeDo Tech</span>
              </div>
            </div>
          </div>

          {/* Client Signature Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-indigo-400 text-sm">الطرف الثاني (العميل)</span>
              <span className="text-[10px] font-mono text-slate-500">{clientName}</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">الاسم المعتمد:</span>
                <span className="text-white font-bold">{clientRep}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الصفة:</span>
                <span className="text-slate-300">{clientRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">التاريخ:</span>
                <span className="text-slate-300 font-mono">{contractDate}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-dashed border-slate-800 flex items-center justify-between">
              <div className="space-y-2">
                <div className="text-[10px] text-slate-500">التوقيع الرقمي / اليدوي:</div>
                <div className="font-serif italic text-indigo-400 text-lg">__________________</div>
              </div>
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-indigo-500/40 bg-indigo-500/5 flex flex-col items-center justify-center text-center p-1 text-[9px] text-indigo-400 font-bold">
                <span>ختم المنشأة</span>
                <span className="text-[7px] text-slate-400">الطرف الثاني</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Appendix */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black">
            💳
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">ملحق: بيانات التحويل والحسابات المعتمدة</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-amber-400">التحويلات البنكية المعتمدة:</h3>
            <ul className="space-y-1.5 text-slate-300">
              <li><strong>اسم الحساب:</strong> ميدو تك للحلول البرمجية</li>
              <li><strong>بنك الكريمي:</strong> رقم الحساب المعتمد عند الطلب</li>
              <li><strong>كاك بنك / بنك التضامن:</strong> تزويد العميل به رسمياً</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-emerald-400">المحافظ الإلكترونية المعتمدة:</h3>
            <ul className="space-y-1.5 text-slate-300">
              <li><strong>محفظة جوالي:</strong> +0967773586047</li>
              <li><strong>محفظة جيب / كاش:</strong> +0967773586047</li>
              <li><strong>محفظة فلوسك:</strong> +0967773586047</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer Contact Info */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-center space-y-3">
        <div className="text-xs font-bold text-slate-300">ميدو تك للحلول البرمجية — MeDo Tech for Software Solutions</div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-400" /> legal@medo-erp.com</span>
          <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-400" /> +0967773586047</span>
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> خمر - الكدوي - عمارة القلمي، عمران، اليمن</span>
        </div>
        <div className="text-[11px] text-slate-500">© 2026 MeDo ERP — جميع الحقوق محفوظة</div>
      </div>
    </div>
  );
};
