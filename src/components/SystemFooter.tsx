import React, { useState, useEffect } from "react";
import { BzmtLogo } from "./BzmtLogo";
import { Scale, ShieldCheck, Lock, RotateCcw, Cookie, FileText, CheckCircle2, Radio, Copy, Check, ExternalLink, Rocket, RefreshCw, GitBranch, Server, Globe } from "lucide-react";
import { OFFICIAL_APP_DOMAIN, OFFICIAL_APP_VERSION, OFFICIAL_BUILD_NUMBER, OFFICIAL_RELEASE_DATE, OFFICIAL_CUSTOM_DOMAIN } from "../config/appConfig";
import { liveDeploymentSyncService, LiveDeploymentStatus } from "../services/liveDeploymentSyncService";

export type LegalDocTab = "TERMS" | "PRIVACY" | "DISCLAIMER" | "REFUND" | "COOKIES";

interface SystemFooterProps {
  className?: string;
  isCompact?: boolean;
  onOpenLegalDocuments?: (tab?: LegalDocTab) => void;
  onOpenInstantDeploy?: () => void;
}

export const DeploymentMetadataCard: React.FC<{ isCompact?: boolean; onOpenInstantDeploy?: () => void }> = ({
  isCompact = false,
  onOpenInstantDeploy,
}) => {
  const [copied, setCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<LiveDeploymentStatus>(() => liveDeploymentSyncService.getStatus());
  const [relativeTime, setRelativeTime] = useState<string>(() => liveDeploymentSyncService.getRelativeTimeString());
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    const unsub = liveDeploymentSyncService.subscribe((status) => {
      setSyncStatus(status);
      setRelativeTime(liveDeploymentSyncService.getRelativeTimeString());
    });

    const interval = setInterval(() => {
      setRelativeTime(liveDeploymentSyncService.getRelativeTimeString());
    }, 10000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const handleCopyOfficialUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(OFFICIAL_APP_DOMAIN);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTriggerDeploy = async () => {
    if (onOpenInstantDeploy) {
      onOpenInstantDeploy();
      return;
    }
    setIsDeploying(true);
    await liveDeploymentSyncService.triggerInstantDeploy();
    setIsDeploying(false);
  };

  return (
    <div
      id="deployment-metadata-card"
      data-testid="deployment-metadata-card"
      className="w-full max-w-5xl mx-auto p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-[#071829] to-[#040e1a] border-2 border-[#d4af37]/60 text-right font-sans text-xs space-y-4 shadow-[0_0_25px_rgba(212,175,55,0.15)] backdrop-blur-md transition-all my-4"
      dir="rtl"
    >
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5 text-[#d4af37] font-black text-xs sm:text-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span>معلومات الإصدار والنشر الرسمي المعتمد (Live Auto-Deploy)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>حالة النشر: محدّث ومتزامن تلقائياً</span>
          </span>
        </div>
      </div>

      {/* Grid of Key Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-200 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-inner">
          <span className="text-slate-400 block text-[10px] mb-1 font-medium">رقم الإصدار المعتمد:</span>
          <span className="font-mono font-black text-[#d4af37] text-sm sm:text-base">{OFFICIAL_APP_VERSION}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-inner">
          <span className="text-slate-400 block text-[10px] mb-1 font-medium">تاريخ النشر:</span>
          <span className="font-mono font-bold text-white text-xs sm:text-sm">{OFFICIAL_RELEASE_DATE}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-inner">
          <span className="text-slate-400 block text-[10px] mb-1 font-medium">رقم البناء (Build):</span>
          <span className="font-mono font-bold text-blue-300 text-[11px] break-all">{OFFICIAL_BUILD_NUMBER}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-inner">
          <span className="text-slate-400 block text-[10px] mb-1 font-medium">دورة التحديث:</span>
          <span className="font-mono font-bold text-emerald-400 text-xs flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Vercel ⚡ Auto-Deploy</span>
          </span>
        </div>
      </div>

      {/* Structured Live Deployment Box (حالة النشر المباشر) */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Rocket className="w-4 h-4 text-amber-400" />
            <span>حالة النشر المباشر والمزامنة التلقائية (Live Deployment Status):</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Studio: <strong className="text-emerald-300">محدّث</strong></span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>GitHub: <strong className="text-emerald-300">محدّث</strong></span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vercel: <strong className="text-emerald-300">محدّث</strong></span>
            </span>
            <span className="text-[11px] text-slate-400">
              آخر نشر: <strong className="text-white font-mono">{relativeTime}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={handleTriggerDeploy}
          disabled={isDeploying}
          className={`w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 border border-amber-300 transition active:scale-95 cursor-pointer flex-shrink-0 ${
            isDeploying ? "opacity-75 cursor-wait" : ""
          }`}
          title="حفظ التعديلات وتشغيل المزامنة الفورية وتحديث رابط Vercel"
        >
          <Rocket className={`w-4 h-4 text-slate-950 ${isDeploying ? "animate-bounce" : ""}`} />
          <span>{isDeploying ? "جاري النشر والمزامنة..." : "🚀 نشر فوري"}</span>
        </button>
      </div>

      {/* Domain & Copy Actions */}
      <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 border-t border-slate-800/90">
        <div className="space-y-1.5">
          <div className="font-mono text-cyan-300 font-bold break-all select-all flex items-center gap-1.5 text-xs sm:text-sm">
            <span className="text-slate-400 font-normal">🌐 الرابط الرسمي المعتمد:</span>
            <span className="underline decoration-cyan-500/50 text-cyan-200">{OFFICIAL_APP_DOMAIN}</span>
          </div>
          <div className="font-mono text-amber-300 text-[11px] flex items-center gap-1.5">
            <span className="text-slate-400 font-normal">👑 النطاق السيادي المخصص:</span>
            <span className="font-bold">{OFFICIAL_CUSTOM_DOMAIN}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={OFFICIAL_APP_DOMAIN}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow cursor-pointer"
          >
            <span>زيارة الرابط</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={handleCopyOfficialUrl}
            className="px-4 py-1.5 bg-[#d4af37]/25 hover:bg-[#d4af37]/35 text-[#d4af37] border border-[#d4af37]/60 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "تم النسخ بنجاح!" : "📋 نسخ الرابط الرسمي"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const SystemFooter: React.FC<SystemFooterProps> = ({
  className = "",
  isCompact = false,
  onOpenLegalDocuments,
  onOpenInstantDeploy,
}) => {
  const currentYear = new Date().getFullYear();

  if (isCompact) {
    return (
      <footer
        id="system-main-footer"
        className={`w-full border-t border-slate-800/80 bg-[#0a2540] text-slate-400 select-none transition-colors py-4 px-4 text-[11px] space-y-4 ${className}`}
      >
        {/* Always display the deployment metadata card */}
        <DeploymentMetadataCard isCompact={true} onOpenInstantDeploy={onOpenInstantDeploy} />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-2.5 flex-wrap justify-center lg:justify-start font-medium">
            <BzmtLogo size="sm" variant="monogram" />
            <span className="text-slate-200 font-bold tracking-wide">جميع الحقوق محفوظة © {currentYear}</span>
            <span className="text-[#d4af37] font-semibold font-sans tracking-wide">Bin Ziyad Group & MeDo Tech (BZMT)</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400/90 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              IFRS / ZATCA
            </span>
            <span>|</span>
            <span>SAP/MeDO ERP Suite {currentYear}</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      id="system-main-footer"
      className={`w-full border-t border-[#d4af37]/30 bg-[#0a2540] text-white pt-12 pb-8 px-6 select-none transition-colors ${className}`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-center">
        {/* Section 1: Brand & Contact */}
        <div className="flex flex-col items-center space-y-6">
          <div className="flex flex-col items-center gap-3 justify-center">
            <BzmtLogo size="md" variant="monogram" />
            <div className="text-center">
              <span className="text-2xl font-black block text-white leading-tight">MeDo ERP</span>
              <span className="text-sm text-slate-300 font-medium">ميدو تك للحلول البرمجية</span>
            </div>
          </div>
          <div className="space-y-4 text-[15px] w-full">
            <p className="flex items-center justify-center gap-3 group">
              <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-lg group-hover:border-[#d4af37]/50 transition-colors">📞</span>
              <span className="hover:text-[#d4af37] transition-colors tracking-wide" dir="ltr">+967 773 586 047</span>
            </p>
            <p className="flex items-center justify-center gap-3 group">
              <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-lg group-hover:border-[#d4af37]/50 transition-colors">📧</span>
              <span className="hover:text-[#d4af37] transition-colors tracking-wide">bdr.zyad@yandex.com</span>
            </p>
            <p className="flex items-center justify-center gap-3 group">
              <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-lg group-hover:border-[#d4af37]/50 transition-colors">🏠</span>
              <span className="hover:text-[#d4af37] transition-colors tracking-wide">اليمن - صنعاء / عدن</span>
            </p>
            <p className="flex items-center justify-center gap-3 group">
              <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-lg group-hover:border-[#d4af37]/50 transition-colors">🌐</span>
              <span className="hover:text-[#d4af37] transition-colors tracking-wide">www.medo-erp.com</span>
            </p>
          </div>
        </div>

        {/* Section 2: Quick Links */}
        <div className="flex flex-col items-center space-y-5">
          <h4 className="text-xl font-bold text-[#d4af37] pb-2 border-b border-[#d4af37]/20 inline-block">روابط سريعة</h4>
          <div className="flex flex-col gap-4 text-[15px] items-center">
            <button className="hover:text-[#d4af37] transition-colors flex items-center gap-2 text-center">🏠 الرئيسية</button>
            <button className="hover:text-[#d4af37] transition-colors flex items-center gap-2 text-center">🏢 عن الشركة</button>
            <button className="hover:text-[#d4af37] transition-colors flex items-center gap-2 text-center">📦 وحدات النظام</button>
            <button className="hover:text-[#d4af37] transition-colors flex items-center gap-2 text-center">📰 المدونة</button>
            <button className="hover:text-[#d4af37] transition-colors flex items-center gap-2 text-center">💰 الأسعار</button>
            <button className="hover:text-[#d4af37] transition-colors flex items-center gap-2 text-center">📞 اتصل بنا</button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent("open_patent_certificate"))}
              className="hover:text-[#d4af37] transition-colors flex items-center gap-2 text-center font-bold"
            >
              🏅 شهادة الابتكار
            </button>
          </div>
        </div>

        {/* Section 3: Legal Documents */}
        <div className="flex flex-col items-center space-y-5">
          <h4 className="text-xl font-bold text-[#d4af37] pb-2 border-b border-[#d4af37]/20 inline-block">الوثائق القانونية</h4>
          <div className="flex flex-col gap-4 text-[15px] items-center">
            <button 
              onClick={() => onOpenLegalDocuments?.("TERMS")}
              className="hover:text-[#d4af37] transition-colors flex items-center gap-2 text-center"
            >
              <FileText className="w-4 h-4 text-[#d4af37]" />
              <span>الشروط والأحكام</span>
            </button>
            <button 
              onClick={() => onOpenLegalDocuments?.("PRIVACY")}
              className="hover:text-[#d4af37] transition-colors flex items-center gap-2 text-center"
            >
              <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
              <span>سياسة الخصوصية</span>
            </button>
            <button 
              onClick={() => onOpenLegalDocuments?.("DISCLAIMER")}
              className="hover:text-[#d4af37] transition-colors flex items-center gap-2 text-center"
            >
              <Scale className="w-4 h-4 text-[#d4af37]" />
              <span>إخلاء المسؤولية</span>
            </button>
            <button 
              onClick={() => onOpenLegalDocuments?.("REFUND")}
              className="hover:text-[#d4af37] transition-colors flex items-center gap-2 text-center"
            >
              <RotateCcw className="w-4 h-4 text-[#d4af37]" />
              <span>سياسة الاسترجاع</span>
            </button>
            <button 
              onClick={() => onOpenLegalDocuments?.("COOKIES")}
              className="hover:text-[#d4af37] transition-colors flex items-center gap-2 text-center"
            >
              <Cookie className="w-4 h-4 text-[#d4af37]" />
              <span>سياسة الكوكيز</span>
            </button>
          </div>
        </div>

        {/* Section 4: Security & Compliance */}
        <div className="flex flex-col items-center space-y-6">
          <h4 className="text-xl font-bold text-[#d4af37] pb-2 border-b border-[#d4af37]/20 inline-block">الأمان والامتثال</h4>
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
                <Lock className="w-4 h-4" />
                <span>تشفير عالي الأمان AES-256</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                جميع البيانات المالية والمحاسبية مشفرة ومحمية وفق أعلى معايير الأمان المصرفي.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>متوافق مع هيئة الزكاة والضريبة والجمارك (ZATCA)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment & Version Metadata Block - Placed with high prominence */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800/80 space-y-8">
        {/* Prominent Metadata Card with Live Deployment Status Box */}
        <DeploymentMetadataCard onOpenInstantDeploy={onOpenInstantDeploy} />

        {/* Social Icons - Centered */}
        <div className="flex items-center justify-center gap-[20px] text-2xl">
          <span className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-900/50 border border-slate-800 hover:border-[#d4af37] hover:scale-110 hover:bg-[#d4af37]/10 transition-all cursor-pointer text-[24px] shadow-lg">📘</span>
          <span className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-900/50 border border-slate-800 hover:border-[#d4af37] hover:scale-110 hover:bg-[#d4af37]/10 transition-all cursor-pointer text-[24px] shadow-lg">💼</span>
          <span className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-900/50 border border-slate-800 hover:border-[#d4af37] hover:scale-110 hover:bg-[#d4af37]/10 transition-all cursor-pointer text-[24px] shadow-lg">𝕏</span>
          <span className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-900/50 border border-slate-800 hover:border-[#d4af37] hover:scale-110 hover:bg-[#d4af37]/10 transition-all cursor-pointer text-[24px] shadow-lg">🎥</span>
          <span className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-900/50 border border-slate-800 hover:border-[#d4af37] hover:scale-110 hover:bg-[#d4af37]/10 transition-all cursor-pointer text-[24px] shadow-lg">💬</span>
        </div>

        {/* Copyright & Logo - Centered Stack */}
        <div className="flex flex-col items-center gap-4 text-center">
          <BzmtLogo size="lg" variant="monogram" />
          <div className="space-y-2">
            <p className="text-[16px] text-white font-bold tracking-wide">© {currentYear} ميدو تك للحلول البرمجية - MeDo Tech</p>
            <p className="text-[14px] text-slate-400 font-medium">
              جميع الحقوق محفوظة - <span className="text-[#d4af37] font-bold">Bin Ziyad Group (BZG)</span>
            </p>
            <p className="text-[12px] text-slate-500 font-sans tracking-widest mt-2 uppercase">Advanced Cloud ERP Systems Architecture</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
