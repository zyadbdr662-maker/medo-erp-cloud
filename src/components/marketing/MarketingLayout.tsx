import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { AnalyticsTracker } from './AnalyticsTracker';
import { Building2, Rocket } from 'lucide-react';
import { SystemFooter } from '../SystemFooter';
import { InstantDeployModal } from '../InstantDeployModal';

export const MarketingLayout = () => {
  const { lang, toggleLang } = useLanguage();
  const [showInstantDeploy, setShowInstantDeploy] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7fc] flex flex-col font-['Alexandria','Cairo',sans-serif] selection:bg-[#0066CC] selection:text-white">
      <AnalyticsTracker />
      <header className="bg-gradient-to-r from-[#0a2540] via-[#0066CC] to-[#04101d] text-white p-4 sm:p-5 shadow-[0_10px_35px_rgba(0,102,204,0.35)] border-b border-[#00D4FF]/45 sticky top-0 z-50 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <Link to="/" className="text-2xl font-black text-white flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4FF]/30 to-[#0066CC]/50 border border-[#00D4FF]/60 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
              <Building2 className="w-5 h-5 text-[#00D4FF]" />
            </div>
            <div className="flex flex-col text-right">
              <div className="flex items-center gap-2">
                <span className="tracking-tight text-white font-black text-xl">MeDo ERP</span>
                <span className="text-[10px] bg-[#00D4FF]/20 text-[#00D4FF] font-bold px-2.5 py-0.5 rounded-full border border-[#00D4FF]/50 shadow-sm">v4.5 2050</span>
              </div>
              <span className="text-[10px] text-slate-200 font-medium -mt-0.5">ميدو تك للحلول البرمجية السحابية</span>
            </div>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-sm font-bold">
            <Link to="/" className="text-slate-100 hover:text-[#00D4FF] transition py-1">{lang === 'ar' ? 'الرئيسية' : 'Home'}</Link>
            <Link to="/about" className="text-slate-100 hover:text-[#00D4FF] transition py-1">{lang === 'ar' ? 'عن الشركة' : 'About'}</Link>
            <Link to="/system" className="text-slate-100 hover:text-[#00D4FF] transition py-1">{lang === 'ar' ? 'النظام' : 'System'}</Link>
            <Link to="/pricing" className="text-slate-100 hover:text-[#00D4FF] transition py-1">{lang === 'ar' ? 'الأسعار' : 'Pricing'}</Link>
            <Link to="/blog" className="text-slate-100 hover:text-[#00D4FF] transition py-1">{lang === 'ar' ? 'المدونة' : 'Blog'}</Link>
            <Link to="/contact" className="text-slate-100 hover:text-[#00D4FF] transition py-1">{lang === 'ar' ? 'اتصل بنا' : 'Contact'}</Link>

            <button onClick={toggleLang} className="text-[#00D4FF] font-bold border border-[#00D4FF]/40 px-3 py-1 rounded-lg text-xs hover:bg-[#00D4FF] hover:text-[#0a2540] transition">
              {lang === 'ar' ? 'EN' : 'عربي'}
            </button>
            <Link to="/erp" className="bg-gradient-to-r from-[#d4af37] via-[#f1c40f] to-[#d4af37] hover:brightness-110 text-[#0a2540] px-5 py-2 rounded-xl font-black transition text-sm shadow-[0_5px_20px_rgba(212,175,55,0.4)] border border-[#b8860b] transform hover:scale-[1.03]">
              {lang === 'ar' ? 'الدخول للنظام' : 'Login'}
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <SystemFooter onOpenInstantDeploy={() => setShowInstantDeploy(true)} />

      <InstantDeployModal
        isOpen={showInstantDeploy}
        onClose={() => setShowInstantDeploy(false)}
      />
    </div>
  );
};

