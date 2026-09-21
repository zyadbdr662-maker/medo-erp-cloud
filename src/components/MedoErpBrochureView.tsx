import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Award,
  ArrowLeft,
  ArrowRight,
  Boxes,
  Compass,
  Layout,
  Cpu,
  TrendingUp,
  UserCheck,
  ShoppingCart,
  Package,
  Layers,
  Sparkles,
  CloudLightning,
  ChevronLeft,
  ChevronRight,
  Database,
  Coins,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Scan,
  Smartphone,
  Play,
  Briefcase,
  HelpCircle,
  BarChart3,
  Users
} from "lucide-react";

interface MedoErpBrochureViewProps {
  onNavigateToModule?: (tab: any) => void;
  isDarkMode?: boolean;
}

export const MedoErpBrochureView: React.FC<MedoErpBrochureViewProps> = ({
  onNavigateToModule,
  isDarkMode = true
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<"SLIDES" | "SCROLL">("SLIDES");
  
  // Interactive page states for micro-demos inside the brochure
  const [activeWheelSection, setActiveWheelSection] = useState("FINANCIALS");
  const [simulatedOcrRunning, setSimulatedOcrRunning] = useState(false);
  const [simulatedOcrData, setSimulatedOcrData] = useState<any>(null);
  const [selectedCurrencyDemo, setSelectedCurrencyDemo] = useState("SAR");
  const [offlineStatus, setOfflineStatus] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [chartMetric, setChartMetric] = useState<"SALES" | "LIQUIDITY" | "PURCHASES">("SALES");

  // SAP Brochure-inspired pages
  const brochurePages = [
    // 1. Cover
    {
      id: "cover",
      title: "الحل التقني الموحد لإدارة شركتك بالكامل",
      subtitle: "A single ERP solution for managing your entire company",
      bannerText: "مجموعة حلول MeDo ERP للشركات الصغيرة والمتوسطة والمجموعات التجارية الكبرى",
      content: (
        <div className="flex flex-col lg:flex-row items-center gap-8 py-4">
          <div className="flex-1 space-y-6 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sap-secondary/20 text-sap-secondary border border-sap-secondary/40">
              <Award className="w-4 h-4" />
              <span className="text-xs font-black tracking-wider uppercase">MeDo ERP - SAP Premium Edition</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
              نظام <span className="text-transparent bg-clip-text bg-gradient-to-r from-sap-secondary to-amber-300">ميدو إرب</span> الذكي للمؤسسات
            </h1>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              تصميم وبنية هندسية متطورة مستوحاة بالكامل من معايير <span className="text-white font-bold">SAP Business One</span> و <span className="text-white font-bold">S/4HANA</span> العالمية، تم تخصيصها وتهيئتها بالكامل لتلبية احتياجات السوق المحلية والمجموعات التجارية الكبرى مثل مجموعة بن زياد، مع الالتزام التام بمتطلبات التدقيق المحاسبي الدولي ومكافحة التلاعب بالفواتير.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => setCurrentPage(1)}
                className="px-6 py-3 bg-sap-secondary hover:bg-[#c29f2e] text-slate-950 font-black text-xs rounded-xl shadow-lg hover:shadow-sap-secondary/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>تصفح الفهرس التفاعلي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("SCROLL")}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>قراءة كصفحة واحدة كاملة</span>
              </button>
            </div>

            {/* Bottom badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800/80">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                <div className="text-lg font-black text-white">83,000+</div>
                <div className="text-[10px] text-slate-400 mt-0.5">عميل حول العالم</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                <div className="text-lg font-black text-emerald-400">100%</div>
                <div className="text-[10px] text-slate-400 mt-0.5">مزامنة دون اتصال</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                <div className="text-lg font-black text-sap-secondary">IAS / IFRS</div>
                <div className="text-[10px] text-slate-400 mt-0.5">المعايير الدولية</div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full flex justify-center relative">
            <div className="w-full max-w-md aspect-video rounded-3xl bg-gradient-to-br from-indigo-900/30 via-sap-primary/20 to-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-2xl overflow-hidden group">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-sap-primary/20 text-sap-secondary border border-sap-secondary/30 flex items-center justify-center font-black">
                  M
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  ACTIVE LICENSE
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">مجموعة بن زياد التجارية</h3>
                <p className="text-xs text-slate-400 mt-1">نسخة الحوسبة السحابية والمزامنة المتعددة</p>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 pt-4 border-t border-slate-800">
                <span>رقم الترخيص: ME-2026-SAP-883K</span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-tr from-sap-secondary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
            </div>
          </div>
        </div>
      )
    },

    // 2. Table of Contents
    {
      id: "toc",
      title: "دليل محتويات الحلول المتكاملة",
      subtitle: "Table of Contents",
      bannerText: "مفهوم شامل لإدارة عملياتك المالية والتجارية والمستودعية واللوجستية في نظام واحد",
      content: (
        <div className="space-y-6">
          <p className="text-xs text-slate-400 text-right">
            انقر على أي قسم من الأقسام التالية للانتقال الفوري وقراءة تفاصيل الحلول والتقنيات المدعومة:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { id: 2, num: "01", t: "ميدو إرب: حل مرن ومتكامل", icon: Boxes },
              { id: 3, num: "02", t: "نظام متين وقابل للتوسيع", icon: Layers },
              { id: 4, num: "03", t: "واجهة مستخدم ذكية وسهلة الاستخدام", icon: Layout },
              { id: 5, num: "04", t: "تبسيط العمليات المالية والحسابية", icon: Coins },
              { id: 6, num: "05", t: "تعظيم العلاقات مع العملاء والبيع", icon: Users },
              { id: 7, num: "06", t: "إدارة وتيسير دورة المشتريات والموردين", icon: ShoppingCart },
              { id: 8, num: "07", t: "إدارة المخزون والتسعير الذكي للأصناف", icon: Package },
              { id: 9, num: "08", t: "لوحات البيانات والتقارير التنفيذية", icon: BarChart3 },
              { id: 10, num: "09", t: "الذكاء المالي المتقدم والأتمتة الذكية (OCR)", icon: Sparkles },
              { id: 11, num: "10", t: "خيارات النشر والمزامنة دون اتصال", icon: CloudLightning },
              { id: 12, num: "11", t: "الامتثال الكامل لـ ZATCA والمعايير", icon: ShieldCheck }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sap-secondary/40 text-right transition-all flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950 text-slate-400 group-hover:text-sap-secondary transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] text-sap-secondary font-mono block mb-0.5">{item.num}</span>
                      <h4 className="text-xs font-black text-white group-hover:text-sap-secondary transition-colors">{item.t}</h4>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-600 group-hover:text-sap-secondary transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      )
    },

    // 3. Flexible, Integrated Solution
    {
      id: "solution_overview",
      title: "ميدو إرب: حل مرن ومتكامل يناسب حجم أعمالك",
      subtitle: "MeDo ERP: Flexible, Integrated Solution",
      bannerText: "مستوى وضوح وتحكم كلي يضمن لشركتك اتخاذ قرارات مدروسة في اللحظة المناسبة",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
          <div className="space-y-4 text-right leading-relaxed text-xs text-slate-300">
            <h3 className="text-base font-black text-white">نظام واحد، رؤية شاملة، نمو بلا حدود</h3>
            <p>
              كل يوم، تعتمد مئات الشركات والمؤسسات على نظام <span className="text-white font-bold">MeDo ERP</span> لإدارة كل جانب من جوانب أعمالها ومزامنة عملياتها بين الفروع البعيدة ومستودعات التخزين الرئيسية. يوفر لك النظام تدفق بيانات مؤتمت بالكامل دون الحاجة لإعادة إدخال الفواتير أو السندات يدوياً.
            </p>
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">سرعة المعالجة والتشغيل الفوري (In-Memory Processing)</span>
                يتميز نظام ميدو إرب بمحرك معالجة لحظي يحسب ميزان المراجعة والأستاذ العام وأرصدة المستودعات فور حفظ أي فاتورة، مما يماثل أداء محرك SAP HANA الشهير.
              </div>
            </div>
            <p>
              سواء كنت تعمل في قطاع البيع بالتجزئة، البيع بالجملة، المقاولات، أو الصرافة والتحويلات المالية، فإن مرونة إعداد شجرة الحسابات ومراكز التكلفة في ميدو إرب تضمن تلاؤم النظام مع هيكل مجموعتك التجارية وسير العمل المعتمد فيها.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-right">
              <h4 className="text-xs font-black text-white flex items-center gap-2 justify-end">
                <span>مؤشرات أداء موحدة وسريعة للشركات</span>
                <TrendingUp className="w-4 h-4 text-sap-secondary animate-pulse" />
              </h4>
              
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-mono">850+ Partners</span>
                    <span>التكامل المباشر لشركاء النظام</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-sap-secondary rounded-full" style={{ width: "85%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-mono">100% Secure</span>
                    <span>التشفير الكلي للبيانات والنسخ التلقائي</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-mono">&lt; 1 sec</span>
                    <span>سرعة ترحيل الفواتير الضخمة والقيود</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "95%" }} />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 text-center font-bold">
                تعدد اللغات (عربي / إنجليزي) + تعدد العملات مع تصفية ذكية حسب العملة المفضلة.
              </div>
            </div>
          </div>
        </div>
      )
    },

    // 4. Robust ERP Solution
    {
      id: "robust_pillars",
      title: "نظام متين وقابل للتوسيع مع المديولات والحلول الإضافية",
      subtitle: "Robust ERP Solution. Easy to Extend with Add-ons",
      bannerText: "مجموعة متكاملة من الوحدات البرمجية التي تغطي الدورة المستندية لأقسام شركتك بالكامل",
      content: (
        <div className="flex flex-col lg:flex-row items-center gap-8 py-2">
          {/* Wheel Demo */}
          <div className="flex-1 w-full flex justify-center">
            <div className="relative w-80 h-80 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center">
              {/* Central Core */}
              <div className="w-32 h-32 rounded-full bg-slate-950 border-4 border-sap-secondary text-center flex flex-col items-center justify-center p-3 z-10 shadow-2xl">
                <Boxes className="w-8 h-8 text-sap-secondary animate-bounce" />
                <span className="text-[10px] font-black text-white mt-1">CORE ENGINE</span>
                <span className="text-[9px] text-slate-400">MeDo ERP</span>
              </div>

              {/* Surrounding Nodes */}
              {[
                { id: "FINANCIALS", label: "الحسابات والمالية", angle: 0, desc: "شجرة الحسابات، قيود اليومية، سندات القبض والصرف، التدفقات النقدية والتقارير الختامية." },
                { id: "INVENTORY", label: "المخازن والمواد", angle: 60, desc: "إدارة البضائع، التوريد، الصرف المخزني، الجرد المستمر ومتوسط التكلفة WAC." },
                { id: "SALES", label: "المبيعات وPOS", angle: 120, desc: "عروض الأسعار، مبيعات آجلة ونقدية، مردودات المبيعات، والامتثال لهيئة الزكاة ZATCA." },
                { id: "PURCHASES", label: "المشتريات والموردين", angle: 180, desc: "فواتير الشراء، سداد الموردين، وإدارة تكلفة الاستيراد وسلاسل التوريد." },
                { id: "HR_PAYROLL", label: "الموارد البشرية", angle: 240, desc: "ملفات الموظفين، الورديات، الحضور، ومسيرات الرواتب واحتساب البدلات تلقائياً." },
                { id: "COLLABORATION", label: "التعاون وسير العمل", angle: 300, desc: "الموافقات الثنائية، الأرشفة، التعاميم، والمراسلات والرقابة الداخلية الصارمة." }
              ].map((node) => {
                const rad = (node.angle * Math.PI) / 180;
                const radius = 110; // Distance from center
                const x = Math.sin(rad) * radius;
                const y = Math.cos(rad) * radius;
                const isSelected = activeWheelSection === node.id;

                return (
                  <button
                    key={node.id}
                    onClick={() => setActiveWheelSection(node.id)}
                    className={`absolute w-24 h-16 rounded-xl border flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer text-center text-[10px] font-bold ${
                      isSelected
                        ? "bg-sap-secondary text-slate-950 border-sap-secondary shadow-lg scale-105 z-20 font-black"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                    }`}
                    style={{
                      transform: `translate(${x}px, ${y}px)`
                    }}
                  >
                    <span>{node.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 space-y-4 text-right">
            <h3 className="text-base font-black text-white">وحدات مترابطة وقابلة للتوسيع آلياً</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              انقر على أي من الوحدات البرمجية المحيطة بالمركز البرمجي لاستعراض أثرها التشغيلي ودورها في إدارة دورتك المستندية:
            </p>

            <AnimatePresence mode="wait">
              {(() => {
                const selectedInfo = [
                  { id: "FINANCIALS", title: "وحدة المحاسبة والمالية (FI/CO)", desc: "تمثل عصب النظام الأساسي، حيث تقوم تلقائياً بتوليد قيد مزدوج متوازن محاسبياً ومرحل لدفتر الأستاذ العام عند حفظ أي معاملة مبيعات أو مشتريات أو صرف رواتب، مع تتبع دقيق لمراكز التكلفة." },
                  { id: "INVENTORY", title: "وحدة إدارة المخزون والمستودعات (MM)", desc: "تدعم تتبع كميات الأصناف وحركتها اللحظية، مع تحديث فوري لمتوسط التكلفة وصافي قيم الأصول المخزنية في الميزانية العمومية، وتنبيهات تلقائية بالوصول لحد إعادة الطلب." },
                  { id: "SALES", title: "وحدة المبيعات ونقاط البيع (SD)", desc: "تمكن موظفي المبيعات من إصدار فواتير نقدية وآجلة مطابقة لمتطلبات الفوترة الإلكترونية مع توليد الباركود وكود الاستجابة السريعة (QR) المشفر طبقاً للمرحلة الثانية." },
                  { id: "PURCHASES", title: "وحدة إدارة المشتريات والموردين (AP)", desc: "أتمتة كاملة لدورة التوريد ابتداءً من طلب عرض السعر، مروراً باستلام البضائع مخزنياً وتوليد فاتورة المشتريات، وانتهاءً بجدولة مستحقات الموردين وسندات الصرف." },
                  { id: "HR_PAYROLL", title: "وحدة الموارد البشرية والرواتب (HCM)", desc: "تربط بيانات الموظفين والحضور الفعلي ومسيرات الرواتب الشهرية مباشرة بالخزائن النقدية، مع التوليد والترحيل التلقائي لقيود الاستحقاق والخصومات وصرف الرواتب." },
                  { id: "COLLABORATION", title: "وحدة التعاون المؤسسي والموافقات (ECP)", desc: "تضمن انسيابية العمل والرقابة الداخلية من خلال نظام تدقيق ثنائي وصلاحيات صارمة لا تسمح بترحيل الفواتير أو القيود الحساسة إلا بعد موافقة المدير المالي المعتمد." }
                ].find(item => item.id === activeWheelSection);

                return (
                  <motion.div
                    key={selectedInfo?.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-right"
                  >
                    <h4 className="text-xs font-black text-sap-secondary">{selectedInfo?.title}</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{selectedInfo?.desc}</p>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            <div className="p-3 bg-emerald-950/20 border border-emerald-800/30 rounded-xl text-[11px] text-emerald-400">
              💡 <strong>تكامل مثالي:</strong> حفظ أي فاتورة مشتريات يقوم بزيادة كمية المخازن، إثبات مديونية المورد، وتسجيل قيد المحاسبة في نفس اللحظة دون أي ثانية انتظار!
            </div>
          </div>
        </div>
      )
    },

    // 5. User-friendly Interface
    {
      id: "user_interface",
      title: "واجهة مستخدم ذكية، سهلة الاستخدام ومريحة للعين",
      subtitle: "Intuitive, User-friendly Interface",
      bannerText: "تصميم واجهات مستوحى من نظام SAP Fiori العالمي لتوفير السرعة والمرونة المطلقة",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
          <div className="space-y-4 text-right text-xs leading-relaxed text-slate-300">
            <h3 className="text-base font-black text-white">الإنتاجية القصوى تبدأ من بساطة الواجهة</h3>
            <p>
              تم تطوير واجهة نظام <span className="text-white font-bold">MeDo ERP</span> بالاعتماد على دراسات تجربة المستخدم الخاصة بشركة SAP العالمية (SAP Fiori Layouts). نضمن لك وصولاً سريعاً لكافة الميزات والمهام اليومية من خلال نقرات معدودة أو اختصارات سريعة في لوحة المفاتيح.
            </p>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-right">
                <span className="text-sap-secondary font-bold block mb-1">🔍 شريط البحث الذكي</span>
                اضغط Ctrl+K في أي شاشة للانتقال الفوري لأي حساب أو مورد أو صنف أو حتى مبيعات معينة في ثانية واحدة.
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-right">
                <span className="text-emerald-400 font-bold block mb-1">🎨 محرر المظهر المرن</span>
                دعم كامل للثيم الفاتح المنعش والثيم الداكن المريح للعين ليلاً، بالإضافة لثيم عالي التباين (High Contrast).
              </div>
            </div>

            <p>
              يدعم النظام تصفحاً مرناً وسلساً في الهواتف الذكية والأجهزة اللوحية دون فقدان جودة الأرقام أو اختلال المحاذاة، مما يجعله نظاماً مثالياً للمدراء ومندوبي المبيعات في الميدان.
            </p>
          </div>

          <div className="flex items-center justify-center">
            {/* Simulated Desktop Preview Card */}
            <div className="w-full max-w-sm rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
              {/* Top Bar of Mockup */}
              <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex justify-between items-center text-[10px]">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <span className="text-slate-400 font-mono">MeDo ERP - Fiori Studio v4.5</span>
              </div>
              {/* Content of Mockup */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-mono">16:07:32</span>
                  <span className="text-[11px] font-black text-sap-secondary">مجموعة بن زياد التجارية</span>
                </div>
                
                {/* Simulated Chart */}
                <div className="h-24 bg-slate-900 rounded-xl border border-slate-800/80 p-2 flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 text-right">تحليل التدفق النقدي اللحظي</span>
                  <div className="flex items-end gap-1.5 justify-center h-12 pt-2">
                    <div className="w-3 bg-emerald-500/80 rounded-t" style={{ height: "40%" }} />
                    <div className="w-3 bg-emerald-500/80 rounded-t" style={{ height: "65%" }} />
                    <div className="w-3 bg-sap-secondary rounded-t" style={{ height: "90%" }} />
                    <div className="w-3 bg-emerald-500/80 rounded-t" style={{ height: "75%" }} />
                    <div className="w-3 bg-indigo-500/80 rounded-t" style={{ height: "50%" }} />
                  </div>
                </div>

                {/* Quick actions mockup */}
                <div className="grid grid-cols-2 gap-2 text-[9px] text-center font-bold">
                  <div className="p-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-lg">
                    فاتورة بيع سريعة
                  </div>
                  <div className="p-2 bg-sap-secondary/20 text-sap-secondary border border-sap-secondary/20 rounded-lg">
                    كشف حساب العميل
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // 6. Streamline Your Financial Operations
    {
      id: "financial_operations",
      title: "تبسيط العمليات المالية ومطابقتها للمعايير العالمية",
      subtitle: "Streamline your Financial Operations",
      bannerText: "مستويات أمان وتكامل غير مسبوقة تضمن حماية أصولك وسجلاتك المالية من التلاعب",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
          <div className="flex flex-col justify-between space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-right space-y-3">
              <h4 className="text-xs font-black text-white">محاكي فروق الصرف والعملات المتعددة (FX Demo)</h4>
              <p className="text-[11px] text-slate-400">
                يدعم النظام التعامل المرن مع فروق أسعار صرف صنعاء وعدن والعملات الخارجية (الدولار والريال السعودي) مع توليد قيود التسوية التلقائية. اختر العملة لمشاهدة السعر الافتراضي المطبق:
              </p>
              
              <div className="flex gap-2 justify-end pt-1">
                {["USD", "SAR", "YER_SANAA", "YER_ADEN"].map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setSelectedCurrencyDemo(curr)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      selectedCurrencyDemo === curr
                        ? "bg-sap-secondary text-slate-950 font-black shadow"
                        : "bg-slate-950 text-slate-400 border border-slate-800"
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono text-center">
                {selectedCurrencyDemo === "USD" && "1 دولار أمريكي = 530 ريال يمني (سعر صنعاء الافتراضي المعتمد)"}
                {selectedCurrencyDemo === "SAR" && "1 ريال سعودي = 140 ريال يمني (سعر صنعاء الافتراضي المعتمد)"}
                {selectedCurrencyDemo === "YER_SANAA" && "الريال اليمني - طبعة قديمة (صنعاء) - العملة المرجعية للنظام"}
                {selectedCurrencyDemo === "YER_ADEN" && "1 ريال يمني (عدن) = 0.27 ريال يمني (صنعاء) - سعر تصفية الفروع"}
              </div>
            </div>

            <div className="p-4 bg-blue-950/20 border border-blue-900/30 rounded-2xl text-[11px] text-blue-300 text-right">
              📢 <strong>إعادة التقييم التلقائي للأصول والالتزامات:</strong> يقوم النظام بإعادة حساب أرصدة الحسابات الأجنبية كالبنوك وعملاء النقد الأجنبي لإثبات أرباح وخسائر فروق الصرف الدورية وفق معيار IAS 21 الدولي.
            </div>
          </div>

          <div className="space-y-4 text-right text-xs leading-relaxed text-slate-300">
            <h3 className="text-base font-black text-white">تحكم مطلق بمركزك المالي وتدفقاتك النقدية</h3>
            <p>
              يدير نظام <span className="text-white font-bold">MeDo ERP</span> العمليات الحسابية والمالية بدقة متناهية متوافقة مع معايير التقارير المالية الدولية (IFRS):
            </p>
            <ul className="space-y-2 list-none pr-1">
              <li className="flex items-center gap-2 justify-end text-right">
                <span>مسودة الحسابات والدفاتر التحليلية المساعدة</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sap-secondary" />
              </li>
              <li className="flex items-center gap-2 justify-end text-right">
                <span>توليد تلقائي فوري لقائمة التدفقات النقدية وفق الطريقة المباشرة وبما يطابق المعيار الدولي IAS 7</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sap-secondary" />
              </li>
              <li className="flex items-center gap-2 justify-end text-right">
                <span>إثبات ومعالجة استهلاك الأصول الثابتة وتخريدها طبقاً للمعيار الدولي IAS 16 وعبر دورة مؤتمتة بنسبة 100%</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sap-secondary" />
              </li>
              <li className="flex items-center gap-2 justify-end text-right">
                <span>دعم كامل لإصدار السندات والتحويل بين الخزائن وتوزيع التكاليف على مراكز التكلفة المتعددة للشركات الشقيقة</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sap-secondary" />
              </li>
            </ul>
          </div>
        </div>
      )
    },

    // 7. Maximize Customer Relationships
    {
      id: "crm_sales",
      title: "تعظيم العلاقات مع العملاء وزيادة مبيعاتك وأرباحك",
      subtitle: "Maximize Customer Relationships",
      bannerText: "متابعة شاملة لحدود ائتمان العملاء وفترات السداد والتحصيل لتقليل الأصول الراكدة",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
          <div className="space-y-4 text-right text-xs leading-relaxed text-slate-300">
            <h3 className="text-base font-black text-white">العميل في قلب عملياتك التجارية</h3>
            <p>
              يجمع نظام ميدو إرب بيانات عملائك وسلوكهم الشرائي في شاشة موحدة، مما يساعد فرق المبيعات على تقديم خدمات أفضل وإبرام الصفقات بسرعة وكفاءة عالية:
            </p>
            
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/30 text-amber-300 text-right space-y-1">
              <span className="font-bold block text-xs">⚠️ حماية ائتمانية وتنبيه بحدود الديون</span>
              يتميز النظام بخاصية الفحص التلقائي لحد الائتمان (Credit Limit Checking) عند محاولة إصدار أي فاتورة مبيعات آجلة، مما يمنع المبيعات الخطرة ويحمي السيولة النقدية لشركتك.
            </div>

            <p>
              دعم شامل لحساب الخصومات التجارية والترويجية وتتبع تاريخ تفاعلات السداد وتحصيل الذمم المدينة (Accounts Receivable Aging Report) لضمان تدفق نقدي صحي ومستمر للمؤسسة.
            </p>
          </div>

          <div className="space-y-4">
            {/* Customer mock dashboard */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-right space-y-3">
              <span className="text-[10px] text-slate-500 font-mono block">سجلات تفاعلية لخدمة العملاء</span>
              <h4 className="text-xs font-black text-white">تحليل أعمار الديون وتصنيف العملاء</h4>
              
              <div className="space-y-2 pt-2 text-[11px]">
                <div className="p-2.5 bg-slate-950 rounded-xl flex justify-between items-center border border-slate-850">
                  <span className="text-emerald-400 font-bold">1,250,000 ر.ي</span>
                  <span className="text-slate-300">شركة النور للتجارة (يونيو - أغسطس)</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl flex justify-between items-center border border-slate-850">
                  <span className="text-amber-400 font-bold">640,000 ر.ي</span>
                  <span className="text-slate-300">مؤسسة الأمل للمقاولات (سداد مستحق)</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl flex justify-between items-center border border-slate-850">
                  <span className="text-red-400 font-bold">⚠️ متجاوز حد الائتمان</span>
                  <span className="text-slate-300">مجموعة بن زياد الفرعية (ديون متراكمة)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // 8. Simplify Procurement
    {
      id: "procurement",
      title: "تيسير وتخطيط عمليات الشراء والمشتريات والموردين",
      subtitle: "Simplify Procurement",
      bannerText: "مستوى شفافية ودقة يضمن لشركتك الحصول على أفضل الأسعار والتحكم بتكاليف المشتريات",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-right space-y-3">
              <span className="text-[10px] text-slate-500 font-mono block">Purchase Order Lifecycle (MM)</span>
              <h4 className="text-xs font-black text-white">مراحل دورة المشتريات والمخازن المتكاملة</h4>
              
              <div className="relative pl-4 space-y-3 text-[11px] text-slate-300">
                <div className="flex items-center gap-2 justify-end">
                  <span>طلب عرض سعر من الموردين (RFQ)</span>
                  <div className="w-5 h-5 rounded-full bg-slate-950 text-sap-secondary flex items-center justify-center font-bold text-[9px] border border-slate-800">1</div>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span>أمر الشراء المعتمد ومطابقة التكلفة</span>
                  <div className="w-5 h-5 rounded-full bg-slate-950 text-sap-secondary flex items-center justify-center font-bold text-[9px] border border-slate-800">2</div>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span>استلام البضائع مخزنياً وتوليد قسيمة التوريد GRN</span>
                  <div className="w-5 h-5 rounded-full bg-sap-secondary text-slate-950 flex items-center justify-center font-black text-[9px]">3</div>
                </div>
                <div className="flex items-center gap-2 justify-end text-emerald-400">
                  <span>تسجيل الفاتورة الضريبية وتحديث متوسط التكلفة WAC</span>
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[9px]">4</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-right text-xs leading-relaxed text-slate-300">
            <h3 className="text-base font-black text-white">التحكم الذكي بسلاسل الإمداد ومستحقات الموردين</h3>
            <p>
              يساعدك نظام <span className="text-white font-bold">MeDo ERP</span> على التحكم في كل مرحلة من مراحل الشراء، مما يحميك من زيادة الهدر في المواد وتراكم الديون والذمم الدائنة (Accounts Payable) غير المجدية:
            </p>
            <ul className="space-y-2 list-none pr-1">
              <li className="flex items-center gap-2 justify-end text-right">
                <span>تحديث تلقائي فوري لمتوسط تكلفة الصنف المرجح (WAC) فور استلام مشتريات جديدة</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </li>
              <li className="flex items-center gap-2 justify-end text-right">
                <span>مطابقة مستندية ثلاثية (3-Way Matching) لمنع تكرار أو تزوير فواتير المشتريات</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </li>
              <li className="flex items-center gap-2 justify-end text-right">
                <span>توليد تلقائي لإشعار الخصم أو مرتجع المشتريات مع ترحيل محاسبي متوازن</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </li>
            </ul>
          </div>
        </div>
      )
    },

    // 9. Inventory, Pricing, and Shipments
    {
      id: "inventory_pricing",
      title: "إدارة المخازن والشحنات والتسعير المتعدد بدقة مطلقة",
      subtitle: "Effortlessly Manage Shipments, Inventory, and Pricing",
      bannerText: "متابعة دقيقة لمستويات المخزون وحركة الأصناف عبر الفروع والمستودعات في شاشة واحدة",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
          <div className="space-y-4 text-right text-xs leading-relaxed text-slate-300">
            <h3 className="text-base font-black text-white">مخزون آمن وقدرة على التسعير التنافسي</h3>
            <p>
              يضمن نظام ميدو إرب تتبعاً دقيقاً لحركات استيراد وتوريد وبيع الأصناف والسلع الاستهلاكية والكهربائية (مثل مكيفات الهواء الشائعة في مشاريع مجموعة بن زياد)، مع التحديث الفوري للأرصدة:
            </p>
            <ul className="space-y-2 list-none pr-1">
              <li className="flex items-center gap-2 justify-end text-right">
                <span>دعم تتبع الأصناف برقم الباركود والرقم التسلسلي لمنع الفقدان والتلف</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sap-secondary" />
              </li>
              <li className="flex items-center gap-2 justify-end text-right">
                <span>إمكانية تقسيم المخزون على مستودعات رئيسية وفروع متعددة، مع إمكانية التحويل المباشر</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sap-secondary" />
              </li>
              <li className="flex items-center gap-2 justify-end text-right">
                <span>قوائم تسعير مرنة (سعر الجملة، سعر التجزئة، سعر النقد الأجنبي)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sap-secondary" />
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-right space-y-3">
              <h4 className="text-xs font-black text-white">محاكي حركة المخازن السلعية الفوري</h4>
              <p className="text-[11px] text-slate-400">
                شاهد كيف يتم خصم المخزون وتحديث الكمية المتاحة عند تسجيل مبيعات:
              </p>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-emerald-400 font-bold">140 وحدة متوفرة</span>
                  <span className="text-slate-300">مكيف سبلت 24 وحدة (صنعاء الرئيسي)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "70%" }} />
                </div>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-[10px] text-emerald-300 text-center font-bold">
                تنبيه ذكي: عند هبوط المخزون لأقل من 20 وحدة، يقوم النظام بإنشاء إشعار إعادة طلب الشراء تلقائياً.
              </div>
            </div>
          </div>
        </div>
      )
    },

    // 10. Informed Actions & Analytics
    {
      id: "analytics_actions",
      title: "شاهد أعمالك بوضوح واتخذ القرارات التنفيذية السريعة",
      subtitle: "See Your Entire Business Clearly. Take Swift, Informed Actions",
      bannerText: "تحليلات مرئية ولوحات بيانات لحظية تمنحك فهماً عميقاً لأرباح الفروع وتطور السيولة",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-right space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-mono">Live Business Intelligence</span>
                <h4 className="text-xs font-black text-white">لوحة تحليلات وإحصائيات ميدو إرب</h4>
              </div>

              <div className="flex gap-2 justify-end text-[10px]">
                <button
                  onClick={() => setChartMetric("SALES")}
                  className={`px-2.5 py-1 rounded ${chartMetric === "SALES" ? "bg-sap-secondary text-slate-950 font-bold" : "bg-slate-950 text-slate-400"}`}
                >
                  المبيعات الشهري
                </button>
                <button
                  onClick={() => setChartMetric("LIQUIDITY")}
                  className={`px-2.5 py-1 rounded ${chartMetric === "LIQUIDITY" ? "bg-sap-secondary text-slate-950 font-bold" : "bg-slate-950 text-slate-400"}`}
                >
                  السيولة والنقد
                </button>
              </div>

              <div className="h-28 flex items-end gap-3 justify-center pt-2">
                {chartMetric === "SALES" ? (
                  <>
                    <div className="w-6 bg-blue-500/80 rounded-t text-center text-[8px] text-white pt-1" style={{ height: "45%" }}>4.5M</div>
                    <div className="w-6 bg-blue-500/80 rounded-t text-center text-[8px] text-white pt-1" style={{ height: "65%" }}>6.2M</div>
                    <div className="w-6 bg-sap-secondary rounded-t text-center text-[8px] text-slate-950 font-bold pt-1" style={{ height: "95%" }}>9.4M</div>
                  </>
                ) : (
                  <>
                    <div className="w-6 bg-emerald-500/80 rounded-t text-center text-[8px] text-white pt-1" style={{ height: "75%" }}>12M</div>
                    <div className="w-6 bg-emerald-500/80 rounded-t text-center text-[8px] text-white pt-1" style={{ height: "85%" }}>15.3M</div>
                    <div className="w-6 bg-sap-secondary rounded-t text-center text-[8px] text-slate-950 font-bold pt-1" style={{ height: "95%" }}>18.2M</div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 text-right text-xs leading-relaxed text-slate-300">
            <h3 className="text-base font-black text-white">البيانات كنز شركتك الأثمن</h3>
            <p>
              لا مزيد من الانتظار لنهاية الشهر أو السنة لتعرف أرباحك الحقيقية. يمنحك نظام ميدو إرب لوحة تحليلات محدثة لحظياً عند كل حركة بيع أو شراء:
            </p>
            <ul className="space-y-2 list-none pr-1">
              <li className="flex items-center gap-2 justify-end text-right">
                <span>تصفية فورية للأرباح والخسائر والميزانية حسب الفرع أو مركز التكلفة لتقييم الأداء</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sap-secondary" />
              </li>
              <li className="flex items-center gap-2 justify-end text-right">
                <span>تقارير مقارنة شهرية وسنوية لتتبع منحنيات نمو المبيعات وصافي الإيرادات</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sap-secondary" />
              </li>
              <li className="flex items-center gap-2 justify-end text-right">
                <span>تصدير فوري لكامل الجداول بصيغة Excel أو ملفات PDF مطبوعة ومطابقة للمستندات القانونية</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sap-secondary" />
              </li>
            </ul>
          </div>
        </div>
      )
    },

    // 11. AI & Automation
    {
      id: "ai_automation",
      title: "الذكاء المالي المتقدم والأتمتة المبتكرة لتقليل الإدخال اليدوي",
      subtitle: "Artificial Intelligence and Automation",
      bannerText: "ميزات استخراج وقراءة ذكية تضمن تعبئة الفواتير الورقية في ثوانٍ معدودة عبر كاميرا جوالك",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
          <div className="space-y-4 text-right text-xs leading-relaxed text-slate-300">
            <h3 className="text-base font-black text-white">الذكاء المالي المتقدم في خدمة المحاسبة</h3>
            <p>
              يتكامل نظام ميدو إرب مع أحدث النماذج الذكية من جوجل (Gemini 2.5) لتوفير تجربة تشغيل مؤتمتة وسريعة:
            </p>
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 text-indigo-300 text-right space-y-2">
              <span className="font-bold block text-xs flex items-center gap-1.5 justify-end">
                <span>القارئ الآلي للفواتير (OCR AI-Scanner)</span>
                <Scan className="w-4 h-4 text-cyan-400 animate-pulse" />
              </span>
              ببساطة التقط صورة للفاتورة الورقية الخاصة بالمورد أو ارفعها، وسيقوم محرك الذكاء المالي المتقدم باستخراج رقم الفاتورة، اسم المورد، التاريخ، وقائمة البنود والكميات وتغذيتها تلقائياً بالكامل في شاشة المشتريات.
            </div>
            <p>
              يوفر لك النظام أيضاً المساعد المالي الذكي (MeDo Financial Copilot) لتحليل قائمة الدخل والتدفقات النقدية وتقديم توصيات تجارية لحماية شركتك من عجز السيولة.
            </p>
          </div>

          <div className="space-y-4">
            {/* Interactive OCR Demo */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-right space-y-3">
              <span className="text-[10px] text-slate-500 font-mono block">محاكاة تشغيل القارئ الذكي (OCR Scanner Demo)</span>
              <h4 className="text-xs font-black text-white">تجربة قراءة فاتورة مشتريات بالذكاء المالي المتقدم</h4>
              
              <button
                onClick={() => {
                  setSimulatedOcrRunning(true);
                  setSimulatedOcrData(null);
                  setTimeout(() => {
                    setSimulatedOcrRunning(false);
                    setSimulatedOcrData({
                      vendor: "مجموعة هائل سعيد التجارية",
                      invNo: "HSG-998231",
                      date: "2026-09-09",
                      item: "مكيف سبلت 24 وحدة",
                      qty: 5,
                      price: 450000,
                      total: 2250000
                    });
                  }, 2000);
                }}
                disabled={simulatedOcrRunning}
                className="w-full py-2 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-900 font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Scan className={`w-4 h-4 ${simulatedOcrRunning ? "animate-spin" : ""}`} />
                <span>{simulatedOcrRunning ? "جاري معالجة وقراءة الفاتورة..." : "محاكاة التقاط ومعالجة الفاتورة الورقية"}</span>
              </button>

              {simulatedOcrRunning && (
                <div className="h-20 flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                  <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {simulatedOcrData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-2 text-[10px] font-mono text-slate-300"
                >
                  <div className="flex justify-between">
                    <span className="text-emerald-400">{simulatedOcrData.vendor}</span>
                    <span className="text-slate-500">اسم المورد:</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">{simulatedOcrData.invNo}</span>
                    <span className="text-slate-500">رقم الفاتورة:</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">{simulatedOcrData.item} (الكمية: {simulatedOcrData.qty})</span>
                    <span className="text-slate-500">البند المستخرج:</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1.5 font-bold">
                    <span className="text-[#D4AF37]">{simulatedOcrData.total.toLocaleString()} ر.ي</span>
                    <span className="text-slate-400">الإجمالي المستحق:</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )
    },

    // 12. Flexible Deployment & Offline-First
    {
      id: "deployment_sync",
      title: "خيارات النشر المرنة وتقنية المزامنة الكلية دون إنترنت",
      subtitle: "Flexible Deployment Options & Offline-First",
      bannerText: "مستوى جاهزية واستمرارية يضمن استمرار شركتك في البيع وتسجيل الفواتير عند انقطاع الشبكة",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-right space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-mono block">Network Sync Status Demo</span>
                <h4 className="text-xs font-black text-white">محاكي وضع المزامنة عند انقطاع الإنترنت</h4>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setOfflineStatus("ONLINE")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    offlineStatus === "ONLINE"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                      : "bg-slate-950 text-slate-400 border border-slate-800"
                  }`}
                >
                  الوضع المتصل (Online)
                </button>
                <button
                  onClick={() => setOfflineStatus("OFFLINE")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    offlineStatus === "OFFLINE"
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                      : "bg-slate-950 text-slate-400 border border-slate-800"
                  }`}
                >
                  الوضع المنقطع (Offline)
                </button>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 text-[11px] text-center leading-relaxed">
                {offlineStatus === "ONLINE" ? (
                  <span className="text-emerald-400 font-bold">
                    🟢 النظام يعمل سحابياً وبشكل مباشر على خوادم PostgreSQL الموزعة، مع تزامن فوري لكافة الفروع والمستودعات.
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold">
                    🔴 تم انقطاع الاتصال! يقوم محرك ميدو إرب بحفظ العمليات والبيانات مشفرة محلياً في المتصفح، وسيتم مزامنتها للخوادم تلقائياً فور استعادة الإنترنت.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 text-right text-xs leading-relaxed text-slate-300">
            <h3 className="text-base font-black text-white">الاستمرارية المطلقة لعملياتك ومشاريعك</h3>
            <p>
              نهتم بألا تتوقف مبيعات فروعك أو مستودعاتك بسبب مشاكل الإنترنت الشائعة في المنطقة. لذلك، قمنا بهندسة وتطوير محرك المزامنة المتطور <span className="text-white font-bold">Offline-First Sync Engine</span>:
            </p>
            <ul className="space-y-2 list-none pr-1">
              <li className="flex items-center gap-2 justify-end text-right">
                <span>تشفير كلي لقاعدة البيانات المحلية لمنع تلاعب أو كشف البيانات الحساسة</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sap-secondary" />
              </li>
              <li className="flex items-center gap-2 justify-end text-right">
                <span>مزامنة خلفية تلقائية وذكية تعالج وتمنع التضارب في البيانات والأرصدة</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sap-secondary" />
              </li>
              <li className="flex items-center gap-2 justify-end text-right">
                <span>دعم النسخ الاحتياطي السحابي متعدد الوجهات (Google Drive / Telegram / Local Backup) لضمان عدم ضياع أي ملف</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sap-secondary" />
              </li>
            </ul>
          </div>
        </div>
      )
    },

    // 13. Empower Your Business
    {
      id: "cta",
      title: "تمكين نمو شركتك مع نظام ميدو إرب الذكي",
      subtitle: "Empower Your Business with Medo ERP",
      bannerText: "مستقبل إدارة الأعمال الذكية يبدأ اليوم - انضم لأكثر من 83,000 شركة ناجحة",
      content: (
        <div className="text-center space-y-6 max-w-xl mx-auto py-6">
          <div className="w-16 h-16 rounded-3xl bg-sap-secondary/20 border border-sap-secondary/40 text-sap-secondary flex items-center justify-center mx-auto text-2xl font-black shadow-lg shadow-sap-secondary/10">
            ✨
          </div>
          <h3 className="text-2xl font-black text-white">هل أنت مستعد لنقل شركتك للمستوى التالي؟</h3>
          
          <p className="text-xs text-slate-300 leading-relaxed">
            تمتع بقوة المعايير العالمية المطبقة في نظام <strong>SAP Business One</strong> مع سهولة تشغيل وتكاليف ذكية وملائمة بالكامل للسوق المحلية مدعومة بميزات المزامنة دون إنترنت والذكاء المالي المتقدم (MeDo ERP System).
          </p>

          <div className="flex flex-wrap gap-3 justify-center pt-2">
            {onNavigateToModule && (
              <button
                onClick={() => onNavigateToModule("DASHBOARD")}
                className="px-6 py-3.5 bg-sap-secondary hover:bg-[#c29f2e] text-slate-950 font-black text-xs rounded-xl shadow-lg hover:shadow-sap-secondary/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>الذهاب للوحة التحكم والبدء الفوري</span>
              </button>
            )}
            <button
              onClick={() => setCurrentPage(1)}
              className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              العودة للفهرس التفاعلي
            </button>
          </div>

          <p className="text-[10px] text-slate-500 pt-4">
            لمعرفة المزيد والتكامل مع فروع مجموعتك التجارية، تواصل معنا عبر البريد المعتمد zyadbdr925@gmail.com
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentPage < brochurePages.length - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn font-sans">
      {/* Upper Navigation bar of brochure */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sap-primary/20 border border-sap-secondary/40 text-sap-secondary flex items-center justify-center font-black">
            M
          </div>
          <div>
            <h2 className="text-sm font-black text-white">دليل الحلول والتعريف التفاعلي بنظام MeDo ERP</h2>
            <p className="text-[11px] text-slate-400">مستوحى بالكامل من كتيب مواصفات SAP Business One المرفق</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setViewMode(viewMode === "SLIDES" ? "SCROLL" : "SLIDES")}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            {viewMode === "SLIDES" ? (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>وضع التصفح الطولي</span>
              </>
            ) : (
              <>
                <Layout className="w-4 h-4" />
                <span>وضع عرض الشرائح</span>
              </>
            )}
          </button>
        </div>
      </div>

      {viewMode === "SLIDES" ? (
        <div className="space-y-4">
          {/* Main Slide Card Container */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2540] via-[#14345B] to-[#071829] border border-sap-secondary/30 p-6 sm:p-8 min-h-[460px] shadow-2xl text-slate-100 flex flex-col justify-between">
            
            {/* Top Indicator */}
            <div className="flex justify-between items-center text-[11px] text-slate-400 border-b border-slate-800 pb-3 mb-4">
              <span className="font-mono">MeDo ERP Solution Guide / Page {currentPage + 1} of {brochurePages.length}</span>
              <span className="text-sap-secondary font-black">{brochurePages[currentPage].subtitle}</span>
            </div>

            {/* Slide Body */}
            <div className="flex-1 py-2">
              <h3 className="text-xl sm:text-2xl font-black text-white text-right leading-snug">
                {brochurePages[currentPage].title}
              </h3>
              <p className="text-xs text-sap-secondary text-right mt-1.5 mb-5 font-bold">
                {brochurePages[currentPage].bannerText}
              </p>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  {brochurePages[currentPage].content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-6">
              <button
                onClick={handlePrev}
                disabled={currentPage === 0}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentPage === 0
                    ? "bg-slate-850 text-slate-600 cursor-not-allowed"
                    : "bg-slate-800 hover:bg-slate-700 text-white cursor-pointer active:scale-95"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              {/* Dot Indicators */}
              <div className="hidden sm:flex items-center gap-1.5">
                {brochurePages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentPage === idx ? "w-6 bg-sap-secondary" : "w-2 bg-slate-700 hover:bg-slate-500"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={currentPage === brochurePages.length - 1}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentPage === brochurePages.length - 1
                    ? "bg-slate-850 text-slate-600 cursor-not-allowed"
                    : "bg-sap-secondary text-slate-950 font-black cursor-pointer hover:bg-[#c29f2e] active:scale-95 shadow-md shadow-sap-secondary/15"
                }`}
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Glowing background circles */}
            <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-sap-secondary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-10 -left-10 w-96 h-96 bg-sap-primary/5 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Scroll Mode Layout */}
          {brochurePages.map((page, idx) => (
            <div
              key={page.id}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2540] via-[#14345B] to-[#071829] border border-slate-800 hover:border-sap-secondary/35 p-6 sm:p-8 shadow-xl text-slate-100 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-850 pb-3 mb-4">
                <span className="font-mono">PART {idx + 1} of {brochurePages.length}</span>
                <span className="text-sap-secondary font-black">{page.subtitle}</span>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-black text-white text-right">
                  {page.title}
                </h3>
                <p className="text-xs text-sap-secondary text-right font-bold">
                  {page.bannerText}
                </p>
                <div className="pt-2">{page.content}</div>
              </div>
            </div>
          ))}
          
          <div className="text-center py-6">
            <button
              onClick={() => {
                setViewMode("SLIDES");
                setCurrentPage(0);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-6 py-3 bg-sap-secondary hover:bg-[#c29f2e] text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              العودة لوضع عرض الشرائح التفاعلي
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
