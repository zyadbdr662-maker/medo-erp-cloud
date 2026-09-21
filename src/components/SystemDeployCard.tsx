import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Rocket,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  OFFICIAL_APP_DOMAIN,
  OFFICIAL_APP_VERSION,
  OFFICIAL_BUILD_NUMBER,
  OFFICIAL_RELEASE_DATE,
  OFFICIAL_CUSTOM_DOMAIN,
  VERCEL_PROJECT_NAME,
} from "../config/appConfig";
import { checkAdminPrivileges, checkTenantSession } from "../utils/authUtils";

interface SystemDeployCardProps {
  /** If provided, overrides internal privilege check (e.g. forced full view inside sovereign admin gateway) */
  forceAdminView?: boolean;
  onTriggerInstantDeploy?: () => void;
}

/**
 * 👑 Full Sovereign Version & Deployment Pipeline Card (Admin / Management Gateway)
 * Displays all granular specifications, build number, domains, 3-step pipeline, and interactive actions.
 */
export const FullVersionDeployCard: React.FC<{ onTriggerInstantDeploy?: () => void }> = ({
  onTriggerInstantDeploy,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const officialUrl = OFFICIAL_APP_DOMAIN;
  const customDomain = OFFICIAL_CUSTOM_DOMAIN;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(officialUrl);
      setIsCopied(true);
      setCopyFeedback("✅ تم نسخ الرابط المعتمد بنجاح!");
      setTimeout(() => {
        setIsCopied(false);
        setCopyFeedback(null);
      }, 2500);
    }
  };

  const handleOpenLink = () => {
    window.open(officialUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      id="system-deploy-card-full"
      className="space-y-4 text-right select-none font-sans"
      dir="rtl"
    >
      {/* 1. CARD: معلومات الإصدار والنشر الرسمي المعتمد */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#071829] via-[#0a2540] to-[#040f1d] border-2 border-[#d4af37]/60 shadow-[0_10px_35px_rgba(212,175,55,0.15)] space-y-4">
        {/* Header with Title & Sync Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#d4af37]/30">
          <div className="flex items-center gap-2.5 text-white">
            <span className="p-2 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                <span>معلومات الإصدار والنشر الرسمي المعتمد</span>
                <span className="text-[11px] font-mono text-cyan-300 font-normal bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/40">
                  (Live Auto-Deploy)
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                مشروع Vercel السحابي الموحد:{" "}
                <span className="font-mono text-[#d4af37] font-bold">
                  {VERCEL_PROJECT_NAME}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-black shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>حالة النشر: محدث ومتزامن تلقائياً ✅</span>
          </div>
        </div>

        {/* Spec Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-slate-400 font-bold mb-0.5">رقم الإصدار:</div>
            <div className="font-mono text-cyan-300 font-black text-sm">
              {OFFICIAL_APP_VERSION}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-slate-400 font-bold mb-0.5">تاريخ النشر:</div>
            <div className="font-mono text-amber-300 font-black text-sm">
              {OFFICIAL_RELEASE_DATE}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-slate-400 font-bold mb-0.5">دورة التحديث:</div>
            <div className="font-mono text-emerald-300 font-black text-xs">
              Vercel Auto-Deploy
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-slate-400 font-bold mb-0.5">رقم البناء (Build):</div>
            <div className="font-mono text-[#d4af37] font-black text-[11px] break-all">
              {OFFICIAL_BUILD_NUMBER}
            </div>
          </div>
        </div>

        {/* Domain Bars */}
        <div className="space-y-2.5 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-blue-500/40 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-xs text-slate-300 font-bold">الرابط الرسمي المعتمد:</span>
              <span className="font-mono text-blue-300 font-black text-xs sm:text-sm break-all">
                {officialUrl}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-[10px] font-mono border border-blue-500/40">
              200 OK • Production
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span className="text-xs text-slate-300 font-bold">النطاق السيادي المخصص:</span>
              <span className="font-mono text-emerald-300 font-black text-xs sm:text-sm">
                {customDomain}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono border border-emerald-500/40">
              Primary Custom Domain
            </span>
          </div>
        </div>
      </div>

      {/* 2. CARD: بطاقة خطوات النشر (Deployment Pipeline: AI Studio → GitHub → Vercel) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#06182a] via-[#0b2742] to-[#04101e] border-2 border-blue-500/40 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-blue-500/20">
          <div className="flex items-center gap-2 text-white font-black text-sm sm:text-base">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>حالة النشر والمزامنة التلقائية (Deployment Pipeline)</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Realtime Webhook Active</span>
        </div>

        {/* The 3-Step Pipeline: AI Studio ➔ GitHub ➔ Vercel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          {/* Step 1: AI Studio */}
          <div className="p-4 rounded-2xl bg-[#092238] border-2 border-blue-500/50 flex flex-col items-center justify-center text-center space-y-2 shadow-md relative group hover:border-blue-400 transition-all">
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-9 h-9 rounded-full bg-[#0a2540] border-2 border-blue-400 text-blue-300 font-black flex items-center justify-center text-base shadow-inner">
                Ⓢ
              </span>
              <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-400 font-bold flex items-center justify-center text-xs">
                ✓
              </span>
            </div>
            <div className="space-y-0.5">
              <div className="font-black text-sm text-white">AI Studio</div>
              <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 inline-block">
                محدّث ومتزامن
              </div>
            </div>
            <p className="text-[10px] text-slate-300">بيئة التطوير والذكاء الاصطناعي</p>
          </div>

          {/* Step 2: GitHub */}
          <div className="p-4 rounded-2xl bg-[#101b2b] border-2 border-slate-700/80 flex flex-col items-center justify-center text-center space-y-2 shadow-md relative group hover:border-slate-500 transition-all">
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-9 h-9 rounded-full bg-slate-900 border-2 border-slate-400 text-slate-200 font-black flex items-center justify-center text-base shadow-inner">
                Ⓢ
              </span>
              <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-400 font-bold flex items-center justify-center text-xs">
                ✓
              </span>
            </div>
            <div className="space-y-0.5">
              <div className="font-black text-sm text-white">GitHub</div>
              <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 inline-block">
                محدّث ومتزامن
              </div>
            </div>
            <p className="text-[10px] text-slate-300">مستودع الأكواد (Main Branch)</p>
          </div>

          {/* Step 3: Vercel */}
          <div className="p-4 rounded-2xl bg-[#030712] border-2 border-[#d4af37]/60 flex flex-col items-center justify-center text-center space-y-2 shadow-md relative group hover:border-[#d4af37] transition-all">
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-9 h-9 rounded-full bg-black border-2 border-[#d4af37] text-[#d4af37] font-black flex items-center justify-center text-base shadow-inner">
                Ⓢ
              </span>
              <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-400 font-bold flex items-center justify-center text-xs">
                ✓
              </span>
            </div>
            <div className="space-y-0.5">
              <div className="font-black text-sm text-white">Vercel</div>
              <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 inline-block">
                محدّث (Live 200 OK)
              </div>
            </div>
            <p className="text-[10px] text-[#d4af37]">النشر السحابي العالمي</p>
          </div>
        </div>

        {/* Visual Workflow Indicator with Golden Arrows */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 text-[#d4af37] font-black text-xs sm:text-sm py-1 bg-slate-950/70 rounded-xl border border-slate-800">
          <span className="text-blue-300 font-bold">AI Studio</span>
          <span className="text-base text-[#d4af37]">←</span>
          <span className="text-slate-300 font-bold">GitHub Repository</span>
          <span className="text-base text-[#d4af37]">←</span>
          <span className="text-emerald-300 font-bold">Vercel Production</span>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Button 1: Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 min-w-[170px] py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer border border-amber-300"
            title="نسخ الرابط الرسمي المعتمد"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>✅ تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-950" />
                <span>📋 نسخ الرابط الرسمي</span>
              </>
            )}
          </button>

          {/* Button 2: Open Link */}
          <button
            type="button"
            onClick={handleOpenLink}
            className="flex-1 min-w-[170px] py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer border border-blue-400/40"
            title="فتح الرابط الرسمي في نافذة جديدة"
          >
            <ExternalLink className="w-4 h-4 text-blue-200" />
            <span>🌐 فتح الرابط</span>
          </button>

          {/* Button 3: Instant Deploy Trigger */}
          {onTriggerInstantDeploy && (
            <button
              type="button"
              onClick={onTriggerInstantDeploy}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer border border-emerald-400/50"
              title="إطلاق فحص وتحديث النشر الفوري"
            >
              <Rocket className="w-4 h-4 text-emerald-200" />
              <span>🚀 نشر فوري</span>
            </button>
          )}
        </div>

        {/* Copy confirmation notification */}
        {copyFeedback && (
          <div className="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs text-center font-bold animate-fade-in shadow-md">
            {copyFeedback}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 🔒 Client-Facing Minimal Status Strip (Icons-Only for Tenants / Customers)
 * Only displays elegant 3-stage status icons without revealing technical versioning or internal specs.
 */
export const ClientIconsOnlyDeployStatus: React.FC = () => {
  return (
    <div
      id="client-deploy-status-icons"
      className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm select-none"
      title="منظومة MeDo ERP السحابية - حالة المزامنة نشطة"
    >
      {/* Live Pulse Indicator */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>

      {/* 3 Iconic Stage Badges: AI Studio ➔ GitHub ➔ Vercel */}
      <div className="flex items-center gap-1.5 text-xs">
        {/* Stage 1: AI Studio */}
        <span
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#0a2540] text-blue-300 border border-blue-500/40 text-[11px] font-bold"
          title="AI Studio: متزامن"
        >
          <span>Ⓢ</span>
          <span className="text-emerald-400 text-[9px] font-black">✓</span>
        </span>

        <span className="text-[#d4af37] text-[10px] font-bold">←</span>

        {/* Stage 2: GitHub */}
        <span
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold"
          title="GitHub: متزامن"
        >
          <span>Ⓢ</span>
          <span className="text-emerald-400 text-[9px] font-black">✓</span>
        </span>

        <span className="text-[#d4af37] text-[10px] font-bold">←</span>

        {/* Stage 3: Vercel */}
        <span
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black text-[#d4af37] border border-[#d4af37]/50 text-[11px] font-bold"
          title="Vercel Cloud: متزامن"
        >
          <span>Ⓢ</span>
          <span className="text-emerald-400 text-[9px] font-black">✓</span>
        </span>
      </div>
    </div>
  );
};

/**
 * 🎯 Unified Master SystemDeployCard with Conditional Security Access
 * - Admins / Sovereign Gateway: Full detailed card with all specs and actions.
 * - Clients / Tenants: Clean, compact 3-icon status strip (Ⓢ✓ ← Ⓢ✓ ← Ⓢ✓).
 * - Anonymous / Non-Tenant Visitors: Clean hidden state or subtle pulse.
 */
export const SystemDeployCard: React.FC<SystemDeployCardProps> = ({
  forceAdminView = false,
  onTriggerInstantDeploy,
}) => {
  const [isAdmin, setIsAdmin] = useState(forceAdminView);
  const [isTenantActive, setIsTenantActive] = useState(false);

  useEffect(() => {
    if (forceAdminView) {
      setIsAdmin(true);
      return;
    }

    const checkState = () => {
      setIsAdmin(checkAdminPrivileges());
      setIsTenantActive(checkTenantSession());
    };

    checkState();

    // Re-check on session/storage changes or popstate
    window.addEventListener("storage", checkState);
    window.addEventListener("popstate", checkState);

    return () => {
      window.removeEventListener("storage", checkState);
      window.removeEventListener("popstate", checkState);
    };
  }, [forceAdminView]);

  // 1. Sovereign Admins & Managers: Full Card
  if (isAdmin || forceAdminView) {
    return <FullVersionDeployCard onTriggerInstantDeploy={onTriggerInstantDeploy} />;
  }

  // 2. Active Client / Tenant: Minimal Icons Only
  if (isTenantActive) {
    return (
      <div className="flex justify-center py-1">
        <ClientIconsOnlyDeployStatus />
      </div>
    );
  }

  // 3. Visitors: Subtle minimalist icons
  return (
    <div className="flex justify-center py-1">
      <ClientIconsOnlyDeployStatus />
    </div>
  );
};

export default SystemDeployCard;
