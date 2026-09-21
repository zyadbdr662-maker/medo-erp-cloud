import React, { useState } from "react";
import { 
  Building2, 
  ShieldCheck, 
  Globe, 
  Zap, 
  BarChart4, 
  Headphones, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Database,
  Lock,
  FileText,
  Scale,
  Sparkles,
  Mail,
  Phone,
  HelpCircle,
  ExternalLink,
  MapPin,
  Clock,
  BookOpen,
  FileSpreadsheet,
  ShoppingCart,
  Package,
  Users,
  Cpu,
  TrendingUp,
  Award,
  Target,
  HeartHandshake,
  MessageSquare,
  Share2,
  Calendar,
  Check,
  ChevronRight,
  ChevronDown,
  Rocket
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { LoginModal } from "./LoginModal";
import { LegalPoliciesModal, LegalPolicyType } from "./LegalPoliciesModal";
import { InstantDeployModal } from "./InstantDeployModal";
import { Branch } from "../types/erp";
import { blogData, BlogArticle } from "../data/blogData";
import { TrustCenterView } from "./TrustCenterView";
import { soundService } from "../services/notificationSoundService";
import { BzmtLogo } from "./BzmtLogo";
import { SystemFooter } from "./SystemFooter";

const ModuleModal = ({ module, onClose }: { module: any; onClose: () => void }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0a2540] border border-sap-secondary/50 p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <button onClick={onClose} className="absolute top-4 left-4 text-white hover:text-sap-secondary"><X /></button>
        <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-slate-800 border border-slate-700 rounded-2xl text-sap-secondary">{module.icon}</div>
            <h2 className="text-2xl font-black text-white">{module.title}</h2>
        </div>
        <p className="text-slate-300 mb-6">{module.desc}</p>
        <div className="space-y-2 mb-8">
            {module.features.map((f: string, i: number) => <div key={i} className="flex items-center gap-2 text-white"><Check className="text-sap-secondary w-5 h-5" /> {f}</div>)}
        </div>
        <div className="flex gap-4">
            <button className="flex-1 bg-sap-secondary text-[#0A2540] py-3 rounded-full font-black">اطلب عرضاً توضيحياً</button>
            <button className="flex-1 border border-sap-secondary text-sap-secondary py-3 rounded-full font-black">جرب مجاناً</button>
        </div>
      </div>
    </div>
  );

interface CorporateWebsiteProps {
  availableBranches?: { id: string; nameAr: string; city: string; code: string }[];
  onLoginSuccess: (user: any, branchId: string) => void;
}

export const CorporateWebsite: React.FC<CorporateWebsiteProps> = ({ availableBranches, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<"HOME" | "ABOUT" | "MODULES" | "BLOG" | "PRICING" | "CONTACT" | "TRUST_CENTER" | "FAQ">("HOME");
  const [showLogin, setShowLogin] = useState(false);
  const [showInstantDeploy, setShowInstantDeploy] = useState(false);
  const [defaultShowSaaSOnboarding, setDefaultShowSaaSOnboarding] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Plan Activation Modal State
  const [activePlanModal, setActivePlanModal] = useState<{ name: string; price: string; code: string } | null>(null);
  const [modalCompanyName, setModalCompanyName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [isActivatingPlan, setIsActivatingPlan] = useState(false);
  const [activationMsg, setActivationMsg] = useState<string | null>(null);

  // Module Modal State
  const [selectedModule, setSelectedModule] = useState<any | null>(null);

  // Legal Policies Modal State
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [selectedLegalPolicy, setSelectedLegalPolicy] = useState<LegalPolicyType>("PRIVACY");

  const openLegalPolicy = (policy: LegalPolicyType) => {
    setSelectedLegalPolicy(policy);
    setLegalModalOpen(true);
  };

  const handleCopyArticleLink = (articleId: number) => {
    try {
      const url = `${window.location.origin}/blog/${articleId}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      // fallback
    }
  };

  // 6 Core Modules
  const coreModules = [
    {
      num: "01",
      icon: <FileSpreadsheet className="w-7 h-7 text-sap-secondary" />,
      title: "المحاسبة والمالية (مستوى بنكي)",
      desc: "دليل حسابات شجري غير محدود المستويات، قيود يومية آلية، معالجة فورية لفوارق العملة اليمنية (صنعاء/عدن)، وقوائم مالية آلية متوافقة مع معايير IFRS/GAAP.",
      badge: "IFRS 15 / GAAP Certified",
      features: [
        "دليل حسابات شجري غير محدود مع فروع ومراكز تكلفة متعددة الأبعاد",
        "معالجة تسويات الفروقات بين العملة القديمة والجديدة بآلية مصرفية دقيقة",
        "توليد ميزان المراجعة، قائمة الدخل، والمركز المالي بلحظة واحدة مع تصدير Excel و PDF",
        "إغلاق الفترات المالية المحاسبية وترحيل الأرصدة الافتتاحية مع حماية التدقيق"
      ]
    },
    {
      num: "02",
      icon: <ShoppingCart className="w-7 h-7 text-sap-secondary" />,
      title: "إدارة المبيعات ونقاط البيع (POS)",
      desc: "فواتير سريعة ذكية، مردودات ومستخلصات، نقاط بيع تعمل دون إنترنت (Offline-First) مع مزامنة لحظية، ودعم ماسحات الباركود والفاتورة الإلكترونية.",
      badge: "Offline-First & ZATCA Stage 2",
      features: [
        "نظام كاشير فائق السرعة يعمل باستقلالية تامة حتى في حال انقطاع الإنترنت",
        "طباعة الإيصالات الحرارية والفواتير الضريبية وتوليد QR Code المشفر فورياً",
        "إدارة تسعير مرنة، خصومات ترويجية، كشوف حسابات العملاء ومتابعة سقف الائتمان",
        "سجل مبيعات متكامل بالمندوبين ونقاط التوزيع مع احتساب العمولات التلقائية"
      ]
    },
    {
      num: "03",
      icon: <Package className="w-7 h-7 text-sap-secondary" />,
      title: "إدارة المشتريات والمخزون",
      desc: "تتبع دقيق للمخزون لحظياً متعدد المستودعات والفروع، تنبيهات حد الطلب ونفاذ الأصناف، إدارة دورة المشتريات والموردين وتقييم المخزون (FIFO / متوسط التكلفة).",
      badge: "Multi-Warehouse & FIFO",
      features: [
        "تتبع الحركات المستودعية (تحويل بين الفروع، إذن صرف، إذن استلام، جرد آلي)",
        "تنبيهات استباقية بالحد الأدنى للأصناف وتواريخ انتهاء الصلاحية ورقم الوجبة (Batch)",
        "أتمتة دورة المشتريات من طلب الشراء إلى أمر التوريد ومطابقة فواتير الموردين",
        "احتساب تكلفة المخزون بدقة متناهية وفق سياسات FIFO والمتوسط المرجح"
      ]
    },
    {
      num: "04",
      icon: <Users className="w-7 h-7 text-sap-secondary" />,
      title: "إدارة الموارد البشرية والرواتب",
      desc: "سجلات شاملة للموظفين، احتساب الرواتب والبدلات والخصميات آلياً، إدارة الورديات وسجلات الحضور، وتوليد مسيرات الرواتب بضغطة زر واحدة.",
      badge: "Automated Payroll & HR",
      features: [
        "سجلات إلكترونية كاملة لملفات الموظفين، العقود، والتأمينات الاجتماعية",
        "احتساب مسيرات الرواتب الشهرية والبدلات، الخصومات، والسلف تلقائياً مع توليد القيود المحاسبية",
        "إدارة الإجازات، الورديات، ومطابقة سجلات البصمة الإلكترونية",
        "تقييم أداء الموظفين وإصدار قسائم الرواتب الفردية وطباعتها"
      ]
    },
    {
      num: "05",
      icon: <Cpu className="w-7 h-7 text-sap-secondary" />,
      title: "إدارة وتتبع الأصول الثابتة",
      desc: "تتبع الأصول الرأسمالية ومواقعها، حساب مجمعات الإهلاك الدوري تلقائياً وفق المعيار الدولي (IAS 16)، مع ربط مراكز التكلفة وجداول الصيانة الدورية.",
      badge: "IAS 16 Asset Life-Cycle",
      features: [
        "ترميز الأصول بالباركود وتعيين العهد للموظفين والمواقع والأقسام",
        "حساب الإهلاك التلقائي (القسط الثابت، المتناقص، ساعات التشغيل) وترحيله مالياً",
        "جدولة الصيانة الوقائية والتصحيحية للأصول مع تتبع تكاليف الإصلاح الرأسمالية",
        "معالجة استبعاد، بيع، أو تخريد الأصول مع احتساب أرباح وخسائر التخلص تلقائياً"
      ]
    },
    {
      num: "06",
      icon: <Sparkles className="w-7 h-7 text-sap-secondary" />,
      title: "التحليل المالي الذكي (Gemini AI)",
      desc: "تحليل استباقي لحظي للربحية والسيولة، كشف مبكر للشذوذ ومحاولات التلاعب المالي، وتوقعات تدفقات نقدية ذكية مستندة إلى أحدث نماذج الذكاء المالي المتقدم.",
      badge: "Powered by Gemini 2.5",
      features: [
        "فحص وتدقيق القيود اليومية لكشف المعاملات الشاذة أو المضاعفة آلياً",
        "توقعات التدفقات النقدية والسيولة المستقبلية بناءً على السلوك المالي السابق",
        "توليد تقارير الأداء المالي التنفيذي وتلخيص نتائج الأعمال للإدارة العليا",
        "مستشار مالي ذكي فوري يجيب على الاستفسارات المحاسبية المعقدة للمنشأة"
      ]
    }
  ];

  const featuredArticle = blogData.articles.find(a => a.id === 7) || blogData.articles[0];
  const otherArticles = blogData.articles.filter(a => a.id !== featuredArticle.id);

  const NavLinks = () => (
    <>
      <button 
        id="nav-home-btn"
        onClick={() => { setActiveTab("HOME"); setMobileMenuOpen(false); }} 
        className={`font-bold text-xs sm:text-sm lg:text-base transition-colors py-1 ${activeTab === "HOME" ? "text-sap-secondary border-b-2 border-sap-secondary" : "text-slate-300 hover:text-white"}`}
      >
        الرئيسية
      </button>
      <button 
        id="nav-about-btn"
        onClick={() => { setActiveTab("ABOUT"); setMobileMenuOpen(false); }} 
        className={`font-bold text-xs sm:text-sm lg:text-base transition-colors py-1 ${activeTab === "ABOUT" ? "text-sap-secondary border-b-2 border-sap-secondary" : "text-slate-300 hover:text-white"}`}
      >
        عن الشركة
      </button>
      <button 
        id="nav-modules-btn"
        onClick={() => { setActiveTab("MODULES"); setMobileMenuOpen(false); }} 
        className={`font-bold text-xs sm:text-sm lg:text-base transition-colors py-1 ${activeTab === "MODULES" ? "text-sap-secondary border-b-2 border-sap-secondary" : "text-slate-300 hover:text-white"}`}
      >
        وحدات النظام
      </button>
      <button 
        id="nav-trust-center-btn"
        onClick={() => { setActiveTab("TRUST_CENTER"); setMobileMenuOpen(false); }} 
        className={`font-bold text-xs sm:text-sm lg:text-base transition-colors py-1 flex items-center gap-1 ${activeTab === "TRUST_CENTER" ? "text-sap-secondary border-b-2 border-sap-secondary" : "text-slate-300 hover:text-white"}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-sap-secondary" />
        <span>مركز الثقة</span>
      </button>
      <button 
        id="nav-faq-btn"
        onClick={() => { setActiveTab("FAQ"); setMobileMenuOpen(false); }} 
        className={`font-bold text-xs sm:text-sm lg:text-base transition-colors py-1 flex items-center gap-1 ${activeTab === "FAQ" ? "text-sap-secondary border-b-2 border-sap-secondary" : "text-slate-300 hover:text-white"}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
        <span>الأسئلة الشائعة</span>
      </button>
      <button 
        id="nav-blog-btn"
        onClick={() => { setActiveTab("BLOG"); setMobileMenuOpen(false); }} 
        className={`font-bold text-xs sm:text-sm lg:text-base transition-colors py-1 flex items-center gap-1.5 ${activeTab === "BLOG" ? "text-sap-secondary border-b-2 border-sap-secondary" : "text-slate-300 hover:text-white"}`}
      >
        <BookOpen className="w-4 h-4" />
        <span>المدونة</span>
        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-sap-secondary font-bold">جديد</span>
      </button>
      <button 
        id="nav-pricing-btn"
        onClick={() => { setActiveTab("PRICING"); setMobileMenuOpen(false); }} 
        className={`font-bold text-xs sm:text-sm lg:text-base transition-colors py-1 ${activeTab === "PRICING" ? "text-sap-secondary border-b-2 border-sap-secondary" : "text-slate-300 hover:text-white"}`}
      >
        الباقات والأسعار
      </button>
      <button 
        id="nav-contact-btn"
        onClick={() => { setActiveTab("CONTACT"); setMobileMenuOpen(false); }} 
        className={`font-bold text-xs sm:text-sm lg:text-base transition-colors py-1 ${activeTab === "CONTACT" ? "text-sap-secondary border-b-2 border-sap-secondary" : "text-slate-300 hover:text-white"}`}
      >
        اتصل بنا
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-between" dir="rtl" style={{ fontFamily: "'Alexandria', 'Noto Naskh Arabic', 'Amiri', 'Droid Arabic Naskh', 'Traditional Arabic', sans-serif" }}>
      {/* Navigation */}
      <nav id="corporate-navbar" className="sticky top-0 z-40 bg-[#0a2540] backdrop-blur-xl border-b border-[#d4af37]/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => { setActiveTab("HOME"); setSelectedArticle(null); }}>
              <BzmtLogo size="md" variant="monogram" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-white tracking-tight">MeDo ERP</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#d4af37]/20 text-[#d4af37] font-bold border border-[#d4af37]/40">v4.5</span>
                </div>
                <span className="text-xs font-bold text-slate-300 block tracking-wide">
                  ميدو تك للحلول التقنية والبرمجية
                </span>
              </div>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              <NavLinks />
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Golden Instant Deploy Button (🚀 نشر فوري) */}
              <button
                type="button"
                onClick={() => setShowInstantDeploy(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-amber-400 to-[#d4af37] hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] border border-yellow-200 active:scale-95 cursor-pointer"
                title="نشر فوري: حفظ التعديلات والمزامنة مع GitHub وVercel"
                aria-label="نشر فوري"
              >
                <Rocket className="w-3.5 h-3.5 text-slate-950" />
                <span>🚀 نشر فوري</span>
              </button>

              <button 
                id="header-login-btn"
                onClick={() => { setDefaultShowSaaSOnboarding(false); setShowLogin(true); }}
                className="px-6 py-2.5 rounded-xl text-[#0a2540] font-black text-sm bg-gradient-to-r from-[#d4af37] via-[#f1c40f] to-[#d4af37] hover:brightness-110 border border-[#b8860b] transition-all cursor-pointer shadow-md shadow-[0_4px_14px_rgba(212,175,55,0.3)] transform hover:scale-[1.02]"
              >
                تسجيل الدخول للنظام
              </button>
              <button 
                id="header-trial-btn"
                onClick={() => { setDefaultShowSaaSOnboarding(true); setShowLogin(true); }}
                className="marketing-cta-btn px-6 py-2.5 rounded-xl font-bold text-sm shadow-md cursor-pointer transition-all hover:brightness-110 bg-[#0a2540]/60 text-white hover:bg-[#0a2540] border-2 border-[#d4af37]"
              >
                جرب الآن مجاناً
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button 
                id="mobile-menu-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-2 rounded-xl bg-[#06182a] border border-blue-900/60 text-slate-200 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#081220] border-b border-[#1E3A8A]/50 px-5 pt-4 pb-6 space-y-4 animate-fadeIn">
            <div className="flex flex-col space-y-3">
              <NavLinks />
              <div className="border-t border-[#1E3A8A]/40 pt-4 flex flex-col gap-3">
                <button 
                  onClick={() => { setShowInstantDeploy(true); setMobileMenuOpen(false); }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-amber-400 to-[#d4af37] text-slate-950 font-black text-sm border border-yellow-200 transition-all text-center shadow-lg flex items-center justify-center gap-2"
                >
                  <Rocket className="w-4 h-4 text-slate-950" />
                  <span>🚀 نشر فوري (Auto-Deploy)</span>
                </button>
                <button 
                  onClick={() => { setDefaultShowSaaSOnboarding(false); setShowLogin(true); setMobileMenuOpen(false); }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-black text-sm border border-blue-400/40 transition-colors text-center shadow-md"
                >
                  تسجيل الدخول للنظام
                </button>
                <button 
                  onClick={() => { setDefaultShowSaaSOnboarding(true); setShowLogin(true); setMobileMenuOpen(false); }}
                  className="marketing-cta-btn w-full py-3.5 rounded-xl font-black text-base text-center shadow-lg cursor-pointer bg-white text-[#0B192C]"
                >
                  جرب الآن مجاناً (30 يوماً)
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1">

        {/* ============================================================== */}
        {/* 1. HOME TAB                                                    */}
        {/* ============================================================== */}
        {activeTab === "HOME" && (
          <div className="animate-fadeIn">
            {/* Hero Section */}
            <div className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-800/80">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/25 via-slate-950 to-slate-950 -z-10" />
              <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-10 -z-10" />
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
                <div className="flex-1 text-center lg:text-right space-y-6">
                  
                  {/* Top Product Badge */}
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-sap-secondary/10 text-sap-secondary border border-sap-secondary/30 text-xs sm:text-sm font-bold shadow-sm">
                    <Building2 className="w-4 h-4 text-sap-secondary" />
                    <span>ميدو تك للحلول البرمجية — منظومة MeDo ERP السحابية المتكاملة</span>
                  </div>

                  {/* Main Hero Heading */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl text-white leading-tight font-black">
                    نظام MeDo ERP المحاسبي السحابي <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-l from-sap-secondary via-amber-200 to-emerald-400">
                      قوة الذكاء المالي المتقدم والدقة المالية بين يديك
                    </span>
                  </h1>

                  {/* Hero Subtitle / Body */}
                  <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                    منظومة تخطيط موارد المؤسسات الهجينة (Offline-First Hybrid ERP) المتطورة. حل جذري لفوارق العملة اليمنية (صنعاء/عدن)، قائمة تدفقات نقدية آلية (IAS 7)، ربط شامل لجميع الفروع، ونقاط بيع تعمل دون انقطاع حتى بدون إنترنت.
                  </p>

                  {/* Official Welcome & Feature Card */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B1E36] via-[#091526] to-[#040A14] border-2 border-sap-secondary/50 shadow-2xl space-y-4 max-w-xl mx-auto lg:mx-0 text-right">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-sap-secondary" />
                        <span className="text-lg font-black text-white">MeDo ERP</span>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40">
                        نسخة تجريبية معتمدة
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-black text-white">مرحباً بك في نظام MeDo ERP</h3>
                      <p className="text-xs sm:text-sm text-slate-300">النظام المحاسبي السحابي المتكامل لإدارة الأعمال والمؤسسات</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-200 font-semibold pt-1">
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-sap-secondary shrink-0" />
                        <span>تجربة مجانية 30 يوماً</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>200 عملية متاحة</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>دعم فني عبر واتساب</span>
                      </div>
                    </div>
                  </div>

                  {/* Call to Action Container */}
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row items-center gap-3.5 justify-center lg:justify-start">
                      {/* Primary Golden CTA Button */}
                      <button 
                        id="hero-cta-trial-btn"
                        onClick={() => { setShowLogin(true); }} 
                        className="marketing-cta-btn w-full sm:w-auto px-8 py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 cursor-pointer group bg-gradient-to-r from-[#d4af37] to-[#f39c12] hover:from-[#f39c12] hover:to-[#d4af37] text-[#0A2540] font-black"
                      >
                        <Sparkles className="w-5 h-5 text-[#0A2540]" />
                        <span className="text-base sm:text-lg font-black">ابدأ رحلة النجاح الآن</span>
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                      </button>

                      {/* Login to System Button */}
                      <button 
                        id="hero-demo-btn"
                        onClick={() => { setShowLogin(true); }} 
                        className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm sm:text-base border border-slate-700 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Building2 className="w-4 h-4 text-sap-secondary" />
                        <span>تسجيل الدخول للنظام</span>
                      </button>

                      {/* WhatsApp Quick CTA */}
                      <a 
                        id="hero-whatsapp-btn"
                        href="https://wa.me/967773586047"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 font-bold text-sm sm:text-base border border-emerald-500/40 transition-all text-center flex items-center justify-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        <span>واتساب مباشر</span>
                      </a>
                    </div>

                    {/* Subtitle Under CTA */}
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm text-slate-400 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-sap-secondary" />
                      <span>تجربة مجانية فورية لمدة 30 يوماً. دعم فني واستشارات متواصلة.</span>
                    </div>
                  </div>
                </div>
                
                {/* Visual Dashboard Preview */}
                <div className="flex-1 relative w-full max-w-xl">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-sap-secondary via-indigo-500 to-emerald-500 rounded-3xl blur-md opacity-20 animate-pulse" />
                  <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-2xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000" 
                      alt="MeDo ERP Executive Dashboard Preview" 
                      className="rounded-2xl w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className="absolute bottom-6 right-6 left-6 bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                        <span className="font-bold text-white">لوحة تحكم حية ومحدثة لحظياً</span>
                      </div>
                      <span className="text-sap-secondary font-bold">دعم العمل دون إنترنت 100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Article Banner on Home */}
            <div className="bg-gradient-to-r from-[#0A2540] via-slate-900 to-[#0A2540] border-y border-sap-secondary/30 py-6 px-4">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-right">
                  <div className="w-10 h-10 rounded-xl bg-sap-secondary/20 border border-sap-secondary/40 flex items-center justify-center text-sap-secondary shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-sap-secondary font-bold">جديد المدونة ومركز المعرفة:</span>
                    <h3 className="text-sm sm:text-base font-black text-white">{featuredArticle.title}</h3>
                  </div>
                </div>
                <button
                  onClick={() => { setActiveTab("BLOG"); setSelectedArticle(featuredArticle); }}
                  className="px-5 py-2 rounded-xl bg-sap-secondary hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>قراءة المقال بالكامل</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Core Modules Section (The 6 Modules) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
              <div className="text-center space-y-4 max-w-3xl mx-auto mb-14">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-sap-secondary/15 text-sap-secondary border border-sap-secondary/30">
                  البنية المؤسسية المتكاملة
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white">الوحدات الست الأساسية لنظام MeDo ERP</h2>
                <p className="text-sm sm:text-base text-slate-400">
                  حلول هندسية مصممة بأعلى المعايير المصرفية والمحاسبية الدولية لإدارة أعمالك بكفاءة ودقة متناهية.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {coreModules.map((mod, i) => (
                  <div 
                    key={i} 
                    className="neon-glow-card rounded-3xl p-6 sm:p-8 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-sap-secondary/5 rounded-bl-full pointer-events-none group-hover:bg-sap-secondary/10 transition-colors" />
                    <div className="flex items-center justify-between mb-5">
                      <div className="p-3 bg-slate-800 border border-slate-700 rounded-2xl text-sap-secondary">
                        {mod.icon}
                      </div>
                      <span className="text-2xl font-black text-slate-700 group-hover:text-sap-secondary/40 transition-colors font-mono">
                        {mod.num}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2.5 group-hover:text-sap-secondary transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-normal mb-6">
                      {mod.desc}
                    </p>
                    <button
                      onClick={() => {
                        console.log("Explore module clicked for:", mod.title);
                        setSelectedModule(mod);
                      }}
                      className="inline-flex items-center gap-2 text-xs font-bold text-sap-secondary hover:text-amber-300 transition-colors cursor-pointer group-hover:translate-x-1 duration-200"
                    >
                      <span>استكشف تفاصيل الوحدة</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {selectedModule && <ModuleModal module={selectedModule} onClose={() => setSelectedModule(null)} />}
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. ABOUT TAB (من نحن / عن الشركة)                              */}
        {/* ============================================================== */}
        {activeTab === "ABOUT" && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 animate-fadeIn space-y-16">
            
            {/* About Header */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-sap-secondary/15 text-sap-secondary border border-sap-secondary/30">
                من نحن
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white">ميدو تك للحلول البرمجية</h2>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                منظومة <strong className="text-sap-secondary">MeDo ERP</strong> السحابية المتكاملة. نقود التحول الرقمي المالي في اليمن والمنطقة عبر حلول ذكية تجمع بين قوة السحابة وحرية العمل المكتبي ودون اتصال بالإنترنت.
              </p>
            </div>

            {/* Vision & Mission Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-sap-secondary">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-white">رؤيتنا (Our Vision)</h3>
                <p className="text-slate-300 text-base leading-relaxed">
                  أن نكون المنظومة السحابية والهجينة الرائدة في اليمن والمنطقة في إدارة وتخطيط الموارد (ERP)، وتمكين المنشآت التجارية والصناعية من اتخاذ قرارات مالية حاسمة مدعومة بالذكاء المالي المتقدم بدقة وأمان.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-white">رسالتنا (Our Mission)</h3>
                <p className="text-slate-300 text-base leading-relaxed">
                  تطوير برمجيات مالية وإدارية قوية تواكب تعقيدات السوق اليمني، تحل نهائياً إشكالية فوارق العملات، وتوفر نظاماً مرناً يدمج بين تطبيقات الجوال، والكمبيوتر، والعمل دون اتصال ليكون شريكاً حقيقياً في بناء وتوسيع الأعمال.
                </p>
              </div>
            </div>

            {/* The 4 Core Values */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-white text-center">قيمنا الجوهرية</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "الدقة والموثوقية",
                    desc: "الالتزام التام بالمعايير المحاسبية الدولية IFRS/GAAP وضمان توازن القوائم المالية 100%."
                  },
                  {
                    title: "الابتكار المستمر",
                    desc: "دمج الذكاء المالي المتقدم التوليدي والتحليلي لاستباق الأخطاء واكتشاف فرص النمو المالي."
                  },
                  {
                    title: "المرونة التشغيلية",
                    desc: "بنية هجينة متطورة (Offline-First) تضمن استمرارية الأعمال في مختلف الظروف وانقطاع الإنترنت."
                  },
                  {
                    title: "خدمة العملاء والشراكة",
                    desc: "علاقة وثيقة ومستدامة مع عملائنا، ودعم فني واستشاري متواصل على مدار الساعة عبر واتساب والاتصال."
                  }
                ].map((val, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sap-secondary/15 text-sap-secondary font-black flex items-center justify-center text-sm">
                      {i + 1}
                    </div>
                    <h4 className="text-lg font-bold text-white">{val.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{val.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Management Signature */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-right">
              <div>
                <h4 className="text-xl font-black text-white">إدارة وتطوير منظومة MeDo ERP</h4>
                <p className="text-slate-400 text-sm mt-1">بدر عايض محمد — المدير العام ومسؤول الأنظمة</p>
              </div>
              <button 
                onClick={() => setActiveTab("CONTACT")} 
                className="px-6 py-3 rounded-xl bg-sap-secondary text-slate-950 font-black text-sm hover:bg-amber-400 transition-colors cursor-pointer shrink-0"
              >
                تواصل مع الإدارة
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. MODULES TAB (وحدات النظام)                                  */}
        {/* ============================================================== */}
        {activeTab === "MODULES" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 animate-fadeIn space-y-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-sap-secondary/15 text-sap-secondary border border-sap-secondary/30 shadow-sm">
                منظومة معمارية متكاملة
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white">الوحدات والأنظمة الفرعية</h2>
              <p className="text-base text-slate-300">
                استكشف بالتفصيل إمكانيات MeDo ERP لتغطية كافة العمليات المحاسبية، الإدارية، والتنفيذية وفق أعلى المعايير المصرفية الدولية.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {coreModules.map((mod, i) => (
                <div 
                  key={i} 
                  className="bg-slate-900/90 border border-slate-800 hover:border-sap-secondary/50 rounded-3xl p-8 space-y-6 shadow-xl transition-all hover:shadow-sap-secondary/5 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-sap-secondary/5 rounded-bl-full pointer-events-none group-hover:bg-sap-secondary/10 transition-colors" />
                  
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 bg-slate-800 border border-slate-700 rounded-2xl text-sap-secondary shadow-md group-hover:scale-105 transition-transform">
                        {mod.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-sap-secondary font-mono font-bold">وحدة رقم {mod.num}</span>
                          {mod.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {mod.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-white group-hover:text-sap-secondary transition-colors mt-0.5">{mod.title}</h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed font-normal">{mod.desc}</p>
                  
                  <div className="space-y-3 border-t border-slate-800/90 pt-5">
                    <h4 className="text-xs font-bold text-slate-200">أبرز الخصائص التشغيلية والتقنية:</h4>
                    <ul className="space-y-2.5 text-xs text-slate-300">
                      {mod.features ? (
                        mod.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{feat}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>تصدير فوري للتقارير (Excel، PDF، وتنسيقات الطباعة الحرارية)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>صلاحيات دقيقة للمستخدمين وفق الأدوار والمستويات الإدارية</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>سجل رقابي وتدقيقي كامل (Audit Trail) لكافة التعديلات</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                    <button
                      onClick={() => {
                        setDefaultShowSaaSOnboarding(true);
                        setShowLogin(true);
                      }}
                      className="inline-flex items-center gap-2 text-xs font-bold text-sap-secondary hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>تجربة هذه الوحدة مجاناً</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowLogin(true);
                      }}
                      className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium"
                    >
                      <span>دخول المستخدمين</span>
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Call to Action */}
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#0F1C2E] via-slate-900 to-[#0F1C2E] border border-slate-800 text-center space-y-6 shadow-2xl">
              <div className="max-w-2xl mx-auto space-y-3">
                <h3 className="text-2xl sm:text-3xl font-black text-white">هل تحتاج مواءمة مخصصة أو دمج وحدات إضافية؟</h3>
                <p className="text-sm text-slate-300">
                  فريقنا الهندسي جاهز لربط منظومة MeDo ERP مع أجهزتك، فروقات عملاتك، أو أنظمتك القائمة بكل سلاسة.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setDefaultShowSaaSOnboarding(true);
                    setShowLogin(true);
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm shadow-xl cursor-pointer transition active:scale-95"
                >
                  ابدأ التجربة المجانية 30 يوماً
                </button>
                <button
                  onClick={() => setActiveTab("CONTACT")}
                  className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm cursor-pointer transition"
                >
                  طلب استشارة وديمو حي
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. BLOG TAB (المدونة ومركز المعرفة)                             */}
        {/* ============================================================== */}
        {activeTab === "BLOG" && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 animate-fadeIn space-y-12">
            
            {/* Article Detail View if selected */}
            {selectedArticle ? (
              <div className="space-y-8 animate-fadeIn">
                <button 
                  onClick={() => setSelectedArticle(null)} 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-sm font-bold"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>العودة لجميع المقالات</span>
                </button>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-6 sm:p-12 space-y-8">
                  {/* Article Header */}
                  <div className="space-y-4 border-b border-slate-800 pb-8">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="px-3 py-1 rounded-full bg-sap-secondary/20 text-sap-secondary font-bold">
                        {selectedArticle.category}
                      </span>
                      <span className="text-slate-400">{selectedArticle.date}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{selectedArticle.readTime}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-sap-secondary font-bold">بقلم: {selectedArticle.author}</span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-black text-white leading-snug">
                      {selectedArticle.title}
                    </h1>

                    <p className="text-base text-slate-300 leading-relaxed font-normal">
                      {selectedArticle.excerpt}
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                      <button 
                        onClick={() => handleCopyArticleLink(selectedArticle.id)}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{copiedLink ? "تم نسخ الرابط!" : "مشاركة المقال"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Article Markdown Content */}
                  <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed space-y-4">
                    <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
                  </div>

                  {/* Tags */}
                  <div className="border-t border-slate-800 pt-6">
                    <span className="text-xs text-slate-400 block mb-2 font-bold">الكلمات المفتاحية:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Blog Header */}
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-sap-secondary/15 text-sap-secondary border border-sap-secondary/30">
                    مركز المعرفة والأبحاث المالية
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-black text-white">مدونة MeDo ERP</h2>
                  <p className="text-base text-slate-300">
                    مقالات متخصصة، دراسات حالة يمنية، وحلول هندسية لأعقد التحديات المالية والمحاسبية.
                  </p>
                </div>

                {/* Featured Article Card */}
                <div className="bg-gradient-to-br from-[#0A2540] via-slate-900 to-slate-900 border-2 border-sap-secondary/40 rounded-3xl overflow-hidden p-6 sm:p-10 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-sap-secondary text-slate-950 text-xs font-black">
                      ⭐ المقال الأبرز والمميز
                    </span>
                    <span className="text-xs text-slate-400">{featuredArticle.date} • {featuredArticle.readTime}</span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl sm:text-3xl font-black text-white hover:text-sap-secondary transition-colors cursor-pointer" onClick={() => setSelectedArticle(featuredArticle)}>
                      {featuredArticle.title}
                    </h3>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
                    <span className="text-xs text-sap-secondary font-bold">الكاتب: {featuredArticle.author}</span>
                    <button 
                      onClick={() => setSelectedArticle(featuredArticle)}
                      className="px-6 py-2.5 rounded-xl bg-sap-secondary hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span>قراءة المقال بالكامل</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grid of Other Articles */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">كافة المقالات والدراسات</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {otherArticles.map((art) => (
                      <div 
                        key={art.id}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all hover:-translate-y-1"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">{art.category}</span>
                            <span>{art.date}</span>
                          </div>
                          <h4 
                            onClick={() => setSelectedArticle(art)}
                            className="text-lg font-bold text-white hover:text-sap-secondary transition-colors cursor-pointer"
                          >
                            {art.title}
                          </h4>
                          <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                            {art.excerpt}
                          </p>
                        </div>
                        <button 
                          onClick={() => setSelectedArticle(art)}
                          className="pt-3 border-t border-slate-800/80 text-xs font-bold text-sap-secondary hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>قراءة المقال</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. PRICING TAB (الباقات والأسعار)                              */}
        {/* ============================================================== */}
        {activeTab === "PRICING" && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 animate-fadeIn space-y-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-sap-secondary/15 text-sap-secondary border border-sap-secondary/30">
                خطط استثمارية واضحة
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white">باقات اشتراك مرنة تلائم حجم منشأتك</h2>
              <p className="text-base text-slate-300">
                اختر الباقة المناسبة لطبيعة أعمالك، مع إمكانية الترقية أو التخصيص في أي وقت.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Basic Tier */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">باقة المنشآت الناشئة</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">35,000</span>
                    <span className="text-xs text-slate-400">ريال يمني / شهرياً</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    مثالية للمتاجر ونقاط البيع المفردة والشركات الناشئة.
                  </p>
                  <ul className="space-y-3 text-xs text-slate-300 border-t border-slate-800 pt-6">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> مستخدمان ونقطة بيع واحدة</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> إدارة الحسابات والمبيعات</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> دعم العمل دون إنترنت</li>
                  </ul>
                </div>
                <button 
                  onClick={() => setActivePlanModal({ name: "باقة المنشآت الناشئة", price: "35,000 ريال يمني / شهرياً", code: "TRIAL" })}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors border border-slate-700 cursor-pointer"
                >
                  ابدأ التجربة المجانية
                </button>
              </div>

              {/* Pro Tier (Featured) */}
              <div className="bg-slate-900 border-2 border-sap-secondary rounded-3xl p-8 space-y-6 flex flex-col justify-between relative shadow-2xl">
                <div className="absolute -top-3.5 right-1/2 translate-x-1/2 px-4 py-1 rounded-full bg-sap-secondary text-slate-950 font-black text-xs">
                  الأكثر طلباً للمؤسسات
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-white">الباقة المتقدمة (Pro)</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-sap-secondary">75,000</span>
                    <span className="text-xs text-slate-400">ريال يمني / شهرياً</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    للشركات المتوسطة والتجارية متعددة الفروع والمخازن.
                  </p>
                  <ul className="space-y-3 text-xs text-slate-300 border-t border-slate-800 pt-6">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sap-secondary" /> حتى 10 مستخدمين و 5 فروع</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sap-secondary" /> محرك فوارق العملة اليمنية وتدفقات نقدية</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sap-secondary" /> إدارة الأصول الثابتة والمخازن</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sap-secondary" /> الذكاء المالي المتقدم المالي (AI Advisor)</li>
                  </ul>
                </div>
                <button 
                  onClick={() => setActivePlanModal({ name: "الباقة المتقدمة (Pro)", price: "75,000 ريال يمني / شهرياً", code: "PRO" })}
                  className="w-full py-3.5 rounded-xl bg-sap-secondary hover:bg-amber-400 text-slate-950 font-black text-sm transition-colors cursor-pointer"
                >
                  اشترك الآن في Pro
                </button>
              </div>

              {/* Enterprise Tier */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">المؤسسية الكبرى (Enterprise)</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">مخصص للمجموعات</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    للمجموعات التجارية والشركات ذات العمليات المعقدة وخادم خاص.
                  </p>
                  <ul className="space-y-3 text-xs text-slate-300 border-t border-slate-800 pt-6">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> فروع ومستخدمون غير محدودين</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> خادم مستقل مخصص ومزامنة فورية</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> مدير حساب محاسبي وتقني مخصص</li>
                  </ul>
                </div>
                <button 
                  onClick={() => setActivePlanModal({ name: "المؤسسية الكبرى (Enterprise)", price: "تسعير مخصص للمجموعات", code: "ENTERPRISE" })}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors border border-slate-700 cursor-pointer"
                >
                  طلب اشتراك Enterprise
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. CONTACT TAB (اتصل بنا والدعم الفني)                          */}
        {/* ============================================================== */}
        {activeTab === "CONTACT" && (
          <div className="max-w-5xl mx-auto px-4 py-12 sm:py-20 animate-fadeIn space-y-12 text-center">
            <div className="space-y-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-sap-secondary/15 text-sap-secondary border border-sap-secondary/30">
                ميدو تك للحلول البرمجية وبن زياد المتحدة
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white">نحن هنا للإجابة على كافة استفساراتك</h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
                تواصل مباشرة مع إدارة النظام وفريق الاستشارات المحاسبية للحصول على الدعم الفني، طلب عرض تجريبي، أو ترقية باقتك المؤسسية.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-right">
              {/* Contact Information Cards */}
              <div className="space-y-4">
                
                {/* Direct Phone */}
                <a 
                  id="contact-phone-btn"
                  href="tel:+0967773586047" 
                  className="flex items-center gap-4 p-5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-sap-secondary/40 rounded-2xl transition-all group"
                >
                  <div className="w-13 h-13 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-sap-secondary shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">الاتصال الهاتفي المباشر</h3>
                    <p className="text-sap-secondary font-bold text-sm mt-0.5" dir="ltr">+0967773586047</p>
                    <span className="text-xs text-slate-400">متاح خلال ساعات الدوام الرسمي</span>
                  </div>
                </a>

                {/* WhatsApp */}
                <a 
                  id="contact-whatsapp-btn"
                  href="https://wa.me/967773586047" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-4 p-5 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 rounded-2xl transition-all group"
                >
                  <div className="w-13 h-13 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">تواصل عبر واتساب المباشر</h3>
                    <p className="text-emerald-400 font-bold text-sm mt-0.5" dir="ltr">+0967773586047</p>
                    <span className="text-xs text-slate-400">رد فوري واستشارات سريعة</span>
                  </div>
                </a>

                {/* Email Support */}
                <a 
                  id="contact-email-btn"
                  href="mailto:bdr.zyad@yandex.com" 
                  className="flex items-center gap-4 p-5 bg-indigo-950/30 hover:bg-indigo-900/40 border border-indigo-500/30 rounded-2xl transition-all group"
                >
                  <div className="w-13 h-13 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">البريد الإلكتروني للإدارة والدعم</h3>
                    <p className="text-indigo-300 font-semibold text-sm mt-0.5">bdr.zyad@yandex.com</p>
                    <span className="text-xs text-slate-400">للمراسلات الرسمية والاستشارات الفنية</span>
                  </div>
                </a>

                {/* Working Hours */}
                <div className="flex items-center gap-4 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <div className="w-13 h-13 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">ساعات العمل والخدمة</h3>
                    <p className="text-slate-300 text-sm mt-0.5">الأحد إلى الخميس: 8:00 ص - 5:00 م</p>
                    <span className="text-xs text-slate-500">الجمعة والسبت: عطلة أسبوعية (الدعم الطارئ مستمر)</span>
                  </div>
                </div>

                {/* Address Card */}
                <div className="flex items-center gap-4 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <div className="w-13 h-13 bg-slate-800 rounded-2xl flex items-center justify-center text-sap-secondary shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">المقر الرئيسي ومكتب الإدارة</h3>
                    <p className="text-slate-300 text-sm mt-0.5 font-semibold">خمر - الكدوي - عمارة القلمي دور أرضي</p>
                    <span className="text-xs text-slate-500">الجمهورية اليمنية</span>
                  </div>
                </div>
              </div>

              {/* Map & Actions */}
              <div className="flex flex-col gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 overflow-hidden shadow-xl">
                  <div className="mb-2 px-3 pt-2 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-slate-300">موقع المكتب على الخريطة</span>
                    <span>خمر، عمران، اليمن</span>
                  </div>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15383.743956461933!2d43.966667!3d15.966667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x160352ef25265555%3A0x6b744d2d488e0000!2sKhamir%2C%20Yemen!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                    width="100%"
                    height="280"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-2xl w-full border border-slate-800"
                    title="مقر ميدو تك وبن زياد - خمر"
                  />
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-right space-y-3">
                  <h4 className="text-base font-bold text-white">هل ترغب في بدء الترقية أو استشارة محاسبية؟</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    فريقنا جاهز لمساعدتك في استيراد دليلك المحاسبي، ربط فروعك، وتجهيز النظام المكتبي والجوال لمنشأتك.
                  </p>
                  <button 
                    onClick={() => { setDefaultShowSaaSOnboarding(true); setShowLogin(true); }}
                    className="w-full py-3 rounded-xl bg-sap-secondary hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors cursor-pointer"
                  >
                    فتح بوابة تسجيل الدخول والتجربة
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 7. TRUST CENTER TAB                                           */}
        {/* ============================================================== */}
        {activeTab === "TRUST_CENTER" && (
          <div className="animate-fadeIn">
            <TrustCenterView onOpenLegalPolicy={openLegalPolicy} />
          </div>
        )}

        {/* ============================================================== */}
        {/* 8. FAQ TAB & SAP PRESET SCENARIOS                             */}
        {/* ============================================================== */}
        {activeTab === "FAQ" && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn space-y-12 text-right" dir="rtl">
            {/* Header */}
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-sap-primary/30 text-sap-secondary border border-sap-secondary/40">
                مركز المعرفة والدعم والأسئلة الشائعة (FAQ)
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white">الأسئلة الشائعة وإرشادات النظام</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                اعثر على إجابات تفصيلية وموثوقة حول تشغيل MeDo ERP، نظام التراخيص السحابية، البنية التحتية، الأمان، والتكامل المتوافق مع معايير SAP.
              </p>
            </div>

            {/* Interactive Presets (Scenario Launcher) */}
            <div className="bg-gradient-to-l from-slate-900 via-slate-950 to-slate-900 border border-sap-secondary/40 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-sap-secondary text-xs font-bold bg-sap-primary/30 border border-sap-secondary/30 px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>سيناريوهات MeDo ERP المجهزة مسبقاً (SAP Standard Scenarios)</span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    ابدأ جولة تفاعلية فورية بتشغيل أحد السيناريوهات الجاهزة
                  </h3>
                  <p className="text-xs text-slate-400">
                    انقر على أي سيناريو أدناه للدخول التلقائي للنظام ومحاكاة دورة العمل المعينة مدعوماً بالجولة التعريفية والبيانات النموذجية (Sample Data).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Scenario 1 */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sap-primary/50 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm">
                      01
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-white">إصدار فاتورة مبيعات ذكية وQR</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      التحكم بدورة المبيعات، احتساب الضريبة، وإصدار فواتير ذكية متوافقة تماماً مع معايير المرحلة الثانية من الفاتورة الإلكترونية ZATCA.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.setItem("medo_preset_scenario", "sales_invoice");
                      const mockUser = {
                        id: "TRIAL-SCENARIO-USR",
                        name: "بدر عايض محمد (تجربة سيناريو SAP)",
                        role: "SYSTEM_ADMIN",
                        branch: "الفرع الرئيسي - صنعاء",
                        branchId: "BR-SANAA-MAIN",
                        avatar: "BM",
                        status: "ACTIVE",
                      };
                      onLoginSuccess(mockUser, "BR-SANAA-MAIN");
                    }}
                    className="w-full py-2 bg-sap-primary hover:bg-[#14532D] text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-sap-secondary/50 active:scale-95"
                  >
                    🚀 تشغيل سيناريو المبيعات
                  </button>
                </div>

                {/* Scenario 2 */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sap-primary/50 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-sm">
                      02
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-white">إضافة عميل جديد وتعيين الائتمان</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      محاكاة إضافة عميل تجاري في مجموعة بن زياد، تعيين حدود وسقوف الائتمان، تتبع الحسابات والذمم المدينة بدقة ومطابقة تامة.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.setItem("medo_preset_scenario", "add_customer");
                      const mockUser = {
                        id: "TRIAL-SCENARIO-USR",
                        name: "بدر عايض محمد (تجربة سيناريو SAP)",
                        role: "SYSTEM_ADMIN",
                        branch: "الفرع الرئيسي - صنعاء",
                        branchId: "BR-SANAA-MAIN",
                        avatar: "BM",
                        status: "ACTIVE",
                      };
                      onLoginSuccess(mockUser, "BR-SANAA-MAIN");
                    }}
                    className="w-full py-2 bg-sap-primary hover:bg-[#14532D] text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-sap-secondary/50 active:scale-95"
                  >
                    🚀 تشغيل سيناريو العملاء
                  </button>
                </div>

                {/* Scenario 3 */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sap-primary/50 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-sap-secondary/10 text-sap-secondary border border-sap-secondary/20 flex items-center justify-center font-bold text-sm">
                      03
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-white">التحليل المالي الذكي (Gemini AI)</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      توليد تقارير الأرباح والخسائر، كشف الشذوذ والتلاعب المحاسبي الاستباقي، والحصول على نصائح ذكية مدعومة بنماذج Gemini.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.setItem("medo_preset_scenario", "ai_report");
                      const mockUser = {
                        id: "TRIAL-SCENARIO-USR",
                        name: "بدر عايض محمد (تجربة سيناريو SAP)",
                        role: "SYSTEM_ADMIN",
                        branch: "الفرع الرئيسي - صنعاء",
                        branchId: "BR-SANAA-MAIN",
                        avatar: "BM",
                        status: "ACTIVE",
                      };
                      onLoginSuccess(mockUser, "BR-SANAA-MAIN");
                    }}
                    className="w-full py-2 bg-sap-secondary hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95"
                  >
                    🚀 تشغيل سيناريو الذكاء المالي
                  </button>
                </div>
              </div>
            </div>

            {/* Accordion FAQs */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-black text-white">الأسئلة المتداولة والأجوبة (FAQ List)</h3>
              <div className="space-y-3">
                {[
                  {
                    q: "ما هي شروط وسياسات النسخة التجريبية (SAP Cloud Trial) في MeDo ERP؟",
                    a: "تمنحك النسخة التجريبية وصولاً كاملاً ومجانياً لمدة 30 يوماً متواصلة لاستكشاف كافة الأنظمة والوحدات المحاسبية والإدارية. تلتزم النسخة التجريبية بعزل تام للبيانات، ودعم فني متاح، مع تزويدك ببيانات نموذجية (Sample Data) لمساعدتك في اختبار وفهم المزايا والسيناريوهات المجهزة مسبقاً قبل الترقية."
                  },
                  {
                    q: "هل عدد مستخدمي النسخة التجريبية محدود بمستخدم واحد مثل SAP؟",
                    a: "كجزء من الميزة التنافسية لـ MeDo ERP في السوق اليمني والإقليمي، نتيح لعملائنا في النسخة التجريبية تسجيل عدد غير محدود من المستخدمين والفروع والمخازن لاختبار قدرة المزامنة الفورية وكفاءة الأذونات دون أي قيود."
                  },
                  {
                    q: "ماذا يحدث بعد انتهاء الـ 30 يوماً؟ هل يتم حذف بياناتي؟",
                    a: "قبل انتهاء الفترة التجريبية بـ 5 أيام، و 3 أيام، و يوم واحد، ستتلقى تنبيهات مستمرة داخل النظام وعبر البريد الإلكتروني. في حال انتهاء الفترة دون تفعيل، سيتم غلق النظام مؤقتاً بشاشة قفل ذكية، لكننا نحافظ على بياناتك مشفرة تماماً لمدة 15 يوماً إضافية كفترة سماح لتتمكن من التفعيل دون فقدان أي عمل أو مجهود."
                  },
                  {
                    q: "كيف يضمن النظام حماية وسرية البيانات المالية والمحاسبية لشركتي؟",
                    a: "نطبق أعلى بروتوكولات الأمان المستوحاة من معايير SAP Trust Center. يتم نقل البيانات بقنوات مشفرة ببروتوكول TLS 1.3 وتشفيرها سحابياً بخوارزمية AES-256، مع عزل معماري منطقي صارم لكل مستأجر (Tenant Separation). ولا نملك أي حق في الاطلاع على فواتيرك أو قيودك المحاسبية."
                  },
                  {
                    q: "هل يدعم MeDo ERP العمل بدون إنترنت (Offline-First)؟",
                    a: "نعم تماماً، يتميز MeDo ERP بمحرك تشغيل محلي فريد يتيح لك تنفيذ المبيعات، سندات الصرف، والحركات المخزنية بدون إنترنت نهائياً في المتصفح أو تطبيق الجوال، وعند عودة الاتصال، يقوم النظام بمزامنة القيود تلقائياً وبأمان تام مع الخادم السحابي المركزي."
                  },
                  {
                    q: "كيف يتعامل النظام مع فوارق العملات وتذبذب أسعار الصرف في السوق اليمني؟",
                    a: "النظام مصمم خصيصاً لملائمة السوق اليمني، حيث يدعم الربط المزدوج لأسعار الصرف (صنعاء وعدن)، ويتيح عملات قيد متعددة (YER، SAR، USD) مع احتساب فوارق تقييم العملة وإعادة تقييم الحسابات آلياً بنهاية الفترة المالية متوافقاً مع معيار المحاسبة الدولي IAS 21."
                  }
                ].map((faq, idx) => {
                  const isExpanded = expandedFaq === idx;
                  return (
                    <div 
                      key={idx} 
                      className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300"
                    >
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                        className="w-full p-5 flex items-center justify-between text-right font-bold text-sm sm:text-base text-white hover:bg-slate-800/50 transition-colors gap-4"
                      >
                        <span className="flex items-center gap-3">
                          <HelpCircle className="w-5 h-5 text-sap-secondary shrink-0" />
                          <span>{faq.q}</span>
                        </span>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                      {isExpanded && (
                        <div className="p-5 pt-0 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/50 bg-slate-950/40">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* FOOTER SECTION (Unified System Footer)                         */}
      {/* ============================================================== */}
      <SystemFooter 
        onOpenLegalDocuments={(tab) => {
          if (tab) openLegalPolicy(tab as any);
        }}
        onOpenInstantDeploy={() => setShowInstantDeploy(true)}
      />

      {/* ============================================================== */}
      {/* INSTANT DEPLOY MODAL                                           */}
      {/* ============================================================== */}
      <InstantDeployModal
        isOpen={showInstantDeploy}
        onClose={() => setShowInstantDeploy(false)}
      />

      {/* ============================================================== */}
      {/* LEGAL POLICIES MODAL                                           */}
      {/* ============================================================== */}
      <LegalPoliciesModal 
        isOpen={legalModalOpen}
        initialPolicy={selectedLegalPolicy}
        onClose={() => setLegalModalOpen(false)}
      />

      {/* ============================================================== */}
      {/* PLAN ACTIVATION & SUBSCRIPTION MODAL                           */}
      {/* ============================================================== */}
      {activePlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-sap-secondary px-2.5 py-1 rounded-full bg-sap-secondary/15">
                  تفعيل الباقة الفورية
                </span>
                <h3 className="text-xl font-black text-white mt-1">{activePlanModal.name}</h3>
              </div>
              <button
                onClick={() => setActivePlanModal(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 block">تكلفة الاشتراك:</span>
              <span className="text-lg font-black text-sap-secondary font-mono">{activePlanModal.price}</span>
            </div>

            {activationMsg ? (
              <div className="bg-emerald-950/90 border border-emerald-500/60 p-6 rounded-2xl text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="text-base font-bold text-white">{activationMsg}</h4>
                <p className="text-xs text-slate-300">جاري الدخول إلى لوحة التحكم والوحدات المحاسبية...</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!modalCompanyName.trim()) {
                    alert("يرجى إدخال اسم المنشأة أو الشركة");
                    return;
                  }
                  setIsActivatingPlan(true);
                  try {
                    soundService.playSound("SUCCESS_CHIME");
                  } catch (err) {}

                  setActivationMsg("✨ تم تفعيل الباقة بنجاح وإعداد قواعد البيانات بنجاح!");
                  setTimeout(() => {
                    const newUser = {
                      id: `USER-${Date.now()}`,
                      name: modalCompanyName,
                      role: "SYSTEM_ADMIN" as const,
                      branch: "الفرع الرئيسي - صنعاء",
                      branchId: "BR-SANAA-MAIN",
                      avatar: modalCompanyName.slice(0, 2).toUpperCase() || "ME",
                      status: "ACTIVE" as const,
                      plan: activePlanModal.code,
                    };
                    setActivePlanModal(null);
                    setIsActivatingPlan(false);
                    setActivationMsg(null);
                    onLoginSuccess(newUser, "BR-SANAA-MAIN");
                  }, 1500);
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">اسم المنشأة أو الشركة التجارية *</label>
                  <input
                    type="text"
                    required
                    value={modalCompanyName}
                    onChange={(e) => setModalCompanyName(e.target.value)}
                    placeholder="مثال: شركة بن زياد للتجارة"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sap-secondary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">رقم الجوال / واتساب</label>
                    <input
                      type="text"
                      value={modalPhone}
                      onChange={(e) => setModalPhone(e.target.value)}
                      placeholder="+967 77..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sap-secondary"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={modalEmail}
                      onChange={(e) => setModalEmail(e.target.value)}
                      placeholder="admin@company.ye"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sap-secondary"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActivePlanModal(null)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isActivatingPlan}
                    className="flex-1 py-3 bg-sap-secondary hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-sap-secondary/30 cursor-pointer disabled:opacity-50"
                  >
                    {isActivatingPlan ? "جاري التفعيل..." : "تفعيل الباقة والدخول الآن 🚀"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* LOGIN PORTAL OVERLAY - FULLY RESPONSIVE                        */}
      {/* ============================================================== */}
      {showLogin && (
        <div className="fixed inset-0 z-50 bg-[#050B14] overflow-y-auto overflow-x-hidden flex flex-col">
          <div className="sticky top-2 right-2 z-50 self-end mr-3 mt-2 sm:mr-6 sm:mt-3">
            <button 
              id="close-login-modal-btn"
              onClick={() => setShowLogin(false)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0a2540]/90 hover:bg-[#1a3a6a] border border-[#d4af37]/40 text-amber-200 hover:text-white text-xs font-bold transition-all shadow-lg cursor-pointer backdrop-blur-md"
              title="العودة إلى الموقع الرئيسي"
            >
              <X className="w-4 h-4 text-[#d4af37]" />
              <span>العودة للموقع الرئيسي</span>
            </button>
          </div>
          <div className="flex-1 w-full flex flex-col">
            <LoginModal 
              availableBranches={availableBranches} 
              onLoginSuccess={(user, branchId) => {
                setShowLogin(false);
                onLoginSuccess(user, branchId);
              }} 
              onOpenCorporateSite={() => setShowLogin(false)}
              onOpenTrustCenter={() => {
                setShowLogin(false);
                setActiveTab("TRUST_CENTER");
              }}
              defaultShowSaaSOnboarding={defaultShowSaaSOnboarding}
            />
          </div>
        </div>
      )}
    </div>
  );
};
