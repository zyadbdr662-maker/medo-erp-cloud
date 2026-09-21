import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Target, 
  Compass, 
  Lightbulb, 
  ShieldCheck, 
  Award, 
  Handshake, 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AboutPage = () => {
  const { lang } = useLanguage();

  const values = [
    {
      icon: <Lightbulb className="w-8 h-8 text-[#B8860B]" />,
      title: lang === 'ar' ? 'الابتكار' : 'Innovation',
      desc: lang === 'ar' ? 'نتبنى أحدث التقنيات السحابية والذكاء المالي المتقدم لتقديم حلول أعمال متطورة واستباقية.' : 'Adopting cutting-edge cloud & AI technologies to deliver proactive solutions.'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#B8860B]" />,
      title: lang === 'ar' ? 'النزاهة والشفافية' : 'Integrity',
      desc: lang === 'ar' ? 'نلتزم بأعلى معايير الشفافية، الدقة المالية، والأمان المصرفي لحماية بيانات شركائنا.' : 'Committed to utmost transparency, financial precision, and bank-grade security.'
    },
    {
      icon: <Award className="w-8 h-8 text-[#B8860B]" />,
      title: lang === 'ar' ? 'الجودة والريادة' : 'Quality',
      desc: lang === 'ar' ? 'نقدم منتجات وخدمات هندسية فائقة الدقة تلبي وتفوق تطلعات عملائنا في شتى القطاعات.' : 'Delivering high-precision engineering products that exceed client expectations.'
    },
    {
      icon: <Handshake className="w-8 h-8 text-[#B8860B]" />,
      title: lang === 'ar' ? 'الشراكات المستدامة' : 'Partnerships',
      desc: lang === 'ar' ? 'نبني علاقات طويلة الأمد مع شركائنا وعملائنا قائمة على الثقة والنجاح المشترك.' : 'Building sustainable long-term relationships founded on trust and mutual success.'
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-['Cairo',sans-serif]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Banner */}
        <div className="bg-[#0A0A0A] rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden border-b-4 border-[#B8860B]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#B8860B]/20 border border-[#B8860B]/40 text-sap-secondary px-4 py-1.5 rounded-full text-xs font-black tracking-wide mb-6">
              <Building2 className="w-4 h-4 text-[#B8860B]" />
              <span>{lang === 'ar' ? '🏢 عن ميدو تك للحلول البرمجية' : 'About MeDo Tech Solutions'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
              {lang === 'ar' 
                ? 'ميدو تك للحلول البرمجية (MeDo Tech for Software Solutions)'
                : 'MeDo Tech for Software Solutions'}
            </h1>

            <p className="text-lg sm:text-xl text-gray-200 leading-relaxed font-semibold max-w-4xl">
              {lang === 'ar'
                ? 'ميدو تك للحلول البرمجية هي شركة تقنية رائدة في تطوير أنظمة ERP السحابية والمكتبية المتطورة، مصممة لتحويل العمليات التشغيلية والمالية إلى أصول ذكية موثوقة بمعايير عالمية.'
                : 'MeDo Tech for Software Solutions is a pioneering software enterprise delivering advanced cloud and desktop ERP systems, designed to transform operational and financial workflows into intelligent, reliable enterprise assets.'}
            </p>
          </div>
        </div>

        {/* Vision and Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 hover:border-[#B8860B]/40 transition duration-300">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#B8860B] mb-6">
              <Compass className="w-7 h-7" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🇾🇪</span>
              <h2 className="text-2xl font-extrabold text-[#0A0A0A]">
                {lang === 'ar' ? 'رؤيتنا (Our Vision)' : 'Our Vision'}
              </h2>
            </div>
            <p className="text-lg text-[#1A2B4C] leading-relaxed font-medium">
              {lang === 'ar'
                ? 'أن نكون المنصة التقنية الأولى في اليمن والمنطقة التي تمكن المؤسسات من تحقيق التحول الرقمي بكفاءة وأمان.'
                : 'To become the premier enterprise technology platform in Yemen and the region, enabling organizations to achieve comprehensive digital transformation with maximum efficiency and security.'}
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 hover:border-[#B8860B]/40 transition duration-300">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#B8860B] mb-6">
              <Target className="w-7 h-7" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎯</span>
              <h2 className="text-2xl font-extrabold text-[#0A0A0A]">
                {lang === 'ar' ? 'رسالتنا (Our Mission)' : 'Our Mission'}
              </h2>
            </div>
            <p className="text-lg text-[#1A2B4C] leading-relaxed font-medium">
              {lang === 'ar'
                ? 'تمكين الشركات من اتخاذ قرارات دقيقة عبر حلول محاسبية وتقنية تتوافق مع المعايير الدولية (IFRS/GAAP)، مع توفير أمان بمستوى بنكي، وبأسعار تنافسية تفهم واقع السوق المحلي.'
                : 'Empowering enterprises to make confident, data-driven decisions via accounting and tech solutions adhering to international standards (IFRS/GAAP), providing bank-grade security at competitive costs tailored to local markets.'}
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 text-2xl mb-2">
              <span>💡</span>
              <h2 className="text-3xl font-extrabold text-[#0A0A0A]">
                {lang === 'ar' ? 'قيمنا الجوهرية (Our Core Values)' : 'Our Core Values'}
              </h2>
            </div>
            <p className="text-base text-[#1A2B4C]">
              {lang === 'ar'
                ? 'المبادئ التي تقود كل قرار نتخذه وكل ميزة نطورها في منظومة SAP/MeDO ERP.'
                : 'The principles that guide every design decision and code deployment in SAP/MeDO ERP.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div 
                key={i} 
                className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100 hover:bg-amber-50/30 hover:border-[#B8860B]/40 transition group"
              >
                <div className="mb-4">{v.icon}</div>
                <h3 className="text-xl font-bold text-[#0A0A0A] mb-2 group-hover:text-[#B8860B] transition-colors">
                  {v.title}
                </h3>
                <p className="text-sm text-[#1A2B4C] leading-relaxed font-medium">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise Excellence Note */}
        <div className="bg-amber-50/60 border-2 border-[#B8860B]/40 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-right">
            <div className="inline-block bg-[#B8860B] text-white text-xs font-black px-3 py-1 rounded-full uppercase mb-2">
              {lang === 'ar' ? 'منظومة سحابية متطورة' : 'Advanced Cloud Platform'}
            </div>
            <h3 className="text-2xl font-black text-[#0A0A0A]">
              {lang === 'ar' ? 'منظومة SAP/MeDO ERP للحلول الإدارية والمحاسبية' : 'SAP/MeDO ERP Enterprise Solutions'}
            </h3>
            <p className="text-base text-[#1A2B4C] max-w-3xl font-medium leading-relaxed">
              {lang === 'ar'
                ? 'حلول برمجية متكاملة مصممة خصيصاً لتلبية متطلبات الشركات والمؤسسات التجارية والصناعية والخدمية وفق أحدث المعايير المحاسبية الدولية IFRS/GAAP مع دعم العمل دون اتصال بالإنترنت.'
                : 'Integrated software solutions tailored for commercial, industrial, and service enterprises following international accounting standards with full offline capability.'}
            </p>
          </div>
          <Link
            to="/system"
            className="shrink-0 inline-flex items-center gap-2 bg-[#0A0A0A] hover:bg-[#1A2B4C] text-white font-bold text-sm px-6 py-3 rounded-xl transition"
          >
            <span>{lang === 'ar' ? 'استكشف وحدات النظام' : 'Explore System Modules'}</span>
            <ArrowRight className="w-4 h-4 mr-1 transition-transform" />
          </Link>
        </div>

        {/* Official Direct Contact Strip */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xs font-bold text-gray-500 mb-1">
                {lang === 'ar' ? '📞 للتواصل والاستفسارات المباشرة:' : 'Official Direct Contact:'}
              </div>
              <div className="flex flex-wrap items-center gap-6 text-[#0A0A0A]">
                <a 
                  href="tel:+0967773586047" 
                  dir="ltr"
                  className="text-lg font-black hover:text-[#B8860B] transition flex items-center gap-2"
                >
                  <Phone className="w-5 h-5 text-[#B8860B]" />
                  <span>+0967773586047</span>
                </a>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <a 
                  href="mailto:bdr.zyad@yandex.com" 
                  className="text-lg font-bold hover:text-[#B8860B] transition flex items-center gap-2"
                >
                  <Mail className="w-5 h-5 text-[#B8860B]" />
                  <span>bdr.zyad@yandex.com</span>
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                <MapPin className="w-4 h-4 text-[#B8860B]" />
                <span>{lang === 'ar' ? 'خمر - الكدوي - عمارة القلمي دور أرضي' : 'Khamir - Al-Kudawi - Al-Qalmi Building, Ground Floor'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <a
                href="https://wa.me/967773586047"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-xs transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
              </a>
              <Link
                to="/contact"
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 bg-[#B8860B] hover:bg-[#996515] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-xs transition"
              >
                <span>{lang === 'ar' ? 'صفحة التواصل' : 'Contact Us'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
