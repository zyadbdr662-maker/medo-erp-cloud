import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  FileSpreadsheet, 
  ShoppingCart, 
  Package, 
  Users, 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Headphones,
  Laptop,
  Zap
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { trackEvent } from '../../components/marketing/AnalyticsTracker';

export const HomePage = () => {
  const { lang } = useLanguage();
  
  const handleTrialClick = (source: string) => {
    trackEvent('trial_started', { source });
  };

  const coreModules = [
    {
      num: "1",
      icon: <FileSpreadsheet className="w-8 h-8 text-blue-400" />,
      title: lang === 'ar' ? 'المحاسبة والمالية (مستوى بنكي)' : 'Accounting & Finance (Bank-Grade)',
      desc: lang === 'ar' 
        ? 'دليل حسابات شجري متكامل، قيود يومية آلية، وتقارير مالية فورية وفق معايير IFRS/GAAP.' 
        : 'Hierarchical chart of accounts, automated journal entries, and real-time financial statements (IFRS/GAAP).'
    },
    {
      num: "2",
      icon: <ShoppingCart className="w-8 h-8 text-blue-400" />,
      title: lang === 'ar' ? 'إدارة المبيعات ونقاط البيع' : 'Sales & Point of Sale (POS)',
      desc: lang === 'ar' 
        ? 'فواتير سريعة ذكية، متابعة حسابات العملاء، ودعم كامل لأجهزة الباركود والفوترة الإلكترونية.' 
        : 'Smart rapid invoicing, customer receivables tracking, and electronic billing compliance.'
    },
    {
      num: "3",
      icon: <Package className="w-8 h-8 text-blue-400" />,
      title: lang === 'ar' ? 'إدارة المشتريات والمخزون' : 'Purchasing & Inventory Control',
      desc: lang === 'ar' 
        ? 'تتبع دقيق للمخزون لحظياً متعدد المستودعات، تنبيهات حد الطلب ونفاذ الأصناف، وإدارة الموردين.' 
        : 'Real-time multi-warehouse tracking, low-stock notifications, and vendor accounts management.'
    },
    {
      num: "4",
      icon: <Users className="w-8 h-8 text-blue-400" />,
      title: lang === 'ar' ? 'إدارة الموارد البشرية' : 'Human Resources Management (HR)',
      desc: lang === 'ar' 
        ? 'سجلات شاملة للموظفين، احتساب الرواتب والبدلات، وإدارة الورديات وسجلات الحضور والانصراف.' 
        : 'Employee master files, payroll calculations, shift scheduling, and attendance management.'
    },
    {
      num: "5",
      icon: <Cpu className="w-8 h-8 text-blue-400" />,
      title: lang === 'ar' ? 'إدارة الأصول الثابتة' : 'Fixed Assets Management',
      desc: lang === 'ar' 
        ? 'تتبع الأصول الرأسمالية، قيود الإهلاك التلقائي، وجداول الصيانة الدورية ومواقع الأصول.' 
        : 'Capital asset tracking, automated depreciation entries, and periodic maintenance records.'
    },
    {
      num: "6",
      icon: <Sparkles className="w-8 h-8 text-blue-400" />,
      title: lang === 'ar' ? 'التحليل الذكي (Gemini AI)' : 'Intelligent Analytics (Gemini AI)',
      desc: lang === 'ar' 
        ? 'تحليل لحظي لمؤشرات الربحية والسيولة، كشف مبكر للشذوذ ومحاولات الاختلاس، وتوصيات استثمارية مدعومة بالذكاء المالي المتقدم.' 
        : 'Real-time profitability & cash flow analytics, anomaly & fraud detection, and AI investment guidance.'
    },
  ];

  return (
    <div className="bg-[#f4f7fc] font-['Cairo',sans-serif] selection:bg-[#0066CC] selection:text-white">
      {/* Institutional Corporate Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0a2540] via-[#0066CC] to-[#04101d] text-white pt-28 pb-36 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[#00D4FF]/30 shadow-2xl">
        {/* Dynamic Glowing Orbs Background & Tech Grid */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-[#00D4FF]/30 to-[#0066CC]/20 blur-[140px] rounded-full pointer-events-none mix-blend-screen animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-[#d4af37]/20 to-[#0a2540]/50 blur-[160px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-[#00D4FF]/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
        
        {/* Modern Tech Circuit Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 flex flex-col items-center">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-3 bg-[#0a2540]/90 border border-[#00D4FF]/50 backdrop-blur-2xl text-white px-6 py-2.5 rounded-full text-sm font-bold tracking-wider mb-8 shadow-[0_0_30px_rgba(0,212,255,0.3)] hover:bg-[#0a2540] transition-all cursor-default">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00D4FF]"></span>
            </span>
            <span className="text-[#00D4FF] font-mono font-bold">v4.5 2050 Vision</span>
            <span className="h-4 w-px bg-white/20 mx-1"></span>
            <span className="text-slate-200">{lang === 'ar' ? 'ميدو تك للحلول البرمجية السحابية' : 'MeDo Tech Cloud Enterprise Software'}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-7 leading-[1.2] drop-shadow-2xl text-white">
            {lang === 'ar' ? (
              <>
                مستقبل إدارة الأعمال <br className="hidden sm:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00D4FF] via-[#38BDF8] to-[#d4af37] filter drop-shadow-lg">
                  يبدأ من هنا.
                </span>
              </>
            ) : (
              <>
                The Future of Business Management <br className="hidden sm:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00D4FF] via-[#38BDF8] to-[#d4af37] filter drop-shadow-lg">
                  Begins Here.
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-200 font-medium mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            {lang === 'ar'
              ? 'منظومة SAP/MeDO ERP السحابية.. قوة الأداء التكنولوجي، أناقة التصميم برؤية 2050، وأمان بمستوى بنكي. نُعيد صياغة معايير الأنظمة الإدارية والمحاسبية لنجعل من تعقيدات العمل متعة بصرية وعملية.'
              : 'SAP/MeDO ERP Cloud Platform.. Technological performance, 2050 design elegance, and bank-grade security. Redefining enterprise management standards.'}
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link 
              to="/pricing" 
              onClick={() => handleTrialClick('hero_free_trial')}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#d4af37] via-[#f1c40f] to-[#d4af37] hover:brightness-110 text-[#0a2540] px-9 py-4 rounded-2xl text-base sm:text-lg font-black shadow-[0_10px_35px_rgba(212,175,55,0.4)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_15px_45px_rgba(212,175,55,0.6)] border border-[#b8860b]"
            >
              <Sparkles className="w-5 h-5 text-[#0a2540] group-hover:animate-pulse" />
              <span>{lang === 'ar' ? 'ابدأ رحلة النجاح الآن' : 'Start Your Journey Now'}</span>
            </Link>
            
            <Link 
              to="/erp" 
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#0a2540]/70 hover:bg-[#0a2540] border-2 border-[#00D4FF] hover:border-white text-white px-9 py-4 rounded-2xl text-base sm:text-lg font-bold transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-xl shadow-lg hover:shadow-[0_10px_30px_rgba(0,102,204,0.5)]"
            >
              <Building2 className="w-5 h-5 text-[#00D4FF]" />
              <span>{lang === 'ar' ? 'تسجيل الدخول للنظام' : 'Login to System'}</span>
            </Link>
          </div>

          {/* Features Strip (Trust Badges) */}
          <div className="mt-16 flex items-center justify-center gap-4 sm:gap-10 text-xs sm:text-sm text-slate-200 flex-wrap font-bold bg-[#0a2540]/85 border border-[#00D4FF]/40 px-6 sm:px-10 py-4 rounded-2xl backdrop-blur-xl shadow-2xl">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#00D4FF]" />
              {lang === 'ar' ? 'حماية بنكية متقدمة (256-bit)' : 'Bank-grade Security (256-bit)'}
            </span>
            <span className="hidden sm:block text-[#00D4FF]/40">|</span>
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              {lang === 'ar' ? 'سرعة فائقة وأداء سحابي' : 'Lightning Fast Performance'}
            </span>
            <span className="hidden sm:block text-[#00D4FF]/40">|</span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              {lang === 'ar' ? 'مطابق لمعايير IFRS/GAAP' : 'IFRS/GAAP Compliant'}
            </span>
          </div>
        </div>
      </section>

      {/* Trust Numbers Section */}
      <section className="bg-white py-16 border-y border-gray-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: 'v4.5', label: lang === 'ar' ? 'إصدار المنظومة 2050' : 'Certified Release 2050' },
            { num: '30 يوماً', label: lang === 'ar' ? 'فترة تجربة مجانية بالكامل' : 'Full Free Trial Period' },
            { num: 'IFRS', label: lang === 'ar' ? 'معايير محاسبية دولية' : 'Accounting Standards' },
            { num: '24/7', label: lang === 'ar' ? 'دعم فني واستشارات متواصلة' : 'Continuous Support' }
          ].map((stat, i) => (
            <div key={i} className="p-6 bg-[#f8fafc] rounded-2xl border border-slate-100 hover:border-[#0066CC]/30 transition shadow-sm">
              <div className="text-3xl sm:text-4xl font-black text-[#0A2540] mb-2">{stat.num}</div>
              <div className="text-sm font-bold text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Modules Section */}
      <section className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-[#0066CC] px-4 py-1.5 rounded-full text-xs font-black mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#0066CC]" />
            <span>{lang === 'ar' ? 'شامل ومترابط برؤية 2050' : 'Comprehensive & Integrated'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            {lang === 'ar' ? '✨ الوحدات الرئيسية في منظومة SAP/MeDO ERP' : '✨ Core Modules of SAP/MeDO ERP'}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
            {lang === 'ar'
              ? 'كل ما تحتاجه لإدارة مؤسستك بكفاءة متناهية في بيئة عمل سحابية موحدة تجمع كافة الأقسام والمستويات الإدارية.'
              : 'Everything required to run your enterprise efficiently in a unified cloud environment.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreModules.map((module) => (
            <div 
              key={module.num} 
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-[#0066CC]/50 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:scale-105 transition shadow-inner">
                    {module.icon}
                  </div>
                  <span className="text-2xl font-black text-slate-300 group-hover:text-[#0066CC] transition">
                    0{module.num}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-3 group-hover:text-[#0066CC] transition-colors">
                  {module.title}
                </h3>
                <p className="text-base text-slate-600 leading-relaxed mb-6 font-medium">
                  {module.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#0066CC] group-hover:text-[#004a99] transition">
                <span>{lang === 'ar' ? 'استكشف الوحدة' : 'Explore Module'}</span>
                <ArrowRight className="w-4 h-4 mr-1.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Box */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <div className="bg-gradient-to-br from-[#0a2540] via-[#0066CC] to-[#04101d] rounded-3xl p-8 sm:p-14 text-white text-center relative overflow-hidden border-2 border-[#d4af37] shadow-2xl">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#00D4FF]/20 blur-[100px] rounded-full pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-black mb-4 relative z-10">
            {lang === 'ar' ? '🚀 ابدأ الآن وحوّل إدارة أعمالك برؤية 2050' : '🚀 Start Now & Transform Your Business'}
          </h2>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto mb-8 font-medium relative z-10">
            {lang === 'ar'
              ? 'جرب النظام مجاناً لمدة 30 يوماً، أو اطلب عرضاً توضيحياً مخصصاً لفريقك للاطلاع على كافة الإمكانيات المؤسسية.'
              : 'Try the system free for 30 days, or request a customized demo for your team.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              to="/pricing"
              className="w-full sm:w-auto bg-gradient-to-r from-[#d4af37] via-[#f1c40f] to-[#d4af37] hover:brightness-110 text-[#0a2540] px-9 py-4 rounded-2xl font-black text-base shadow-lg transition"
            >
              {lang === 'ar' ? 'جرب النظام مجاناً لمدة 30 يوماً' : 'Try Free for 30 Days'}
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/30 text-white px-9 py-4 rounded-2xl font-bold text-base backdrop-blur-md transition"
            >
              {lang === 'ar' ? 'اطلب عرضاً توضيحياً لفريقك' : 'Request a Team Demo'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

