import React, { useState, useEffect } from "react";
import { Cookie, ShieldCheck, Settings, Check, X, Sliders, ChevronDown, ChevronUp, ExternalLink, Lock } from "lucide-react";

const COOKIE_CONSENT_KEY = "medo_cookie_consent_v2";

export interface CookiePreferences {
  essential: boolean; // Always true
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

interface CookieConsentBannerProps {
  onOpenPolicy?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPolicy }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  // Preference switches
  const [preferences, setPreferences] = useState<{
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
  }>({
    functional: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!stored) {
        // Small delay for smooth entry
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const saveConsent = (prefs: { functional: boolean; analytics: boolean; marketing: boolean }) => {
    const fullConsent: CookiePreferences = {
      essential: true,
      functional: prefs.functional,
      analytics: prefs.analytics,
      marketing: prefs.marketing,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(fullConsent));
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      functional: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleRejectAll = () => {
    saveConsent({
      functional: false,
      analytics: false,
      marketing: false,
    });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <div
      id="cookie-consent-banner"
      role="dialog"
      aria-live="polite"
      aria-label="إشعار وتفضيلات ملفات تعريف الارتباط"
      className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-5 pointer-events-none select-none transition-all duration-300 animate-fadeIn"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto pointer-events-auto bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl shadow-2xl shadow-slate-950/80 p-5 sm:p-6 text-slate-100 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-white">إشعار ملفات تعريف الارتباط (Cookies)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  GDPR & ePrivacy Compliant
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">منصة MeDo ERP • ميدو تك للحلول البرمجية</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRejectAll}
            className="text-slate-500 hover:text-slate-300 p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="إغلاق ورفض الاختياري"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Concise Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          نستخدم ملفات تعريف الارتباط الضرورية لتشغيل منصة MeDo ERP وأمان تسجيل الدخول، بالإضافة إلى ملفات وظيفية وتحليلية اختيارية لتحسين تجربتك وتذكر تفضيلاتك وفقاً لـ{" "}
          <button
            type="button"
            onClick={onOpenPolicy}
            className="text-amber-400 font-bold underline underline-offset-2 hover:text-amber-300 inline-flex items-center gap-0.5 cursor-pointer"
          >
            <span>سياسة ملفات تعريف الارتباط المعتمدة</span>
            <ExternalLink className="w-3 h-3 inline" />
          </button>
          . نحن نضمن عدم تتبع أو مشاركة أي بيانات مالية أو محاسبية نهائياً.
        </p>

        {/* Expandable Customization Panel */}
        {isCustomizing && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 pt-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>تخصيص تفضيلات التخزين لجهازك:</span>
              </span>
              <span className="text-[10px] text-slate-400">يمكنك تعديل هذه الخيارات في أي وقت لاحقاً</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Essential */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-900/40 flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    <span>ملفات ضرورية للتشغيل</span>
                  </div>
                  <p className="text-[11px] text-slate-400">المصادقة، حماية الجلسة، ورمز CSRF (إلزامية تقنياً).</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex-shrink-0">
                  دائم
                </span>
              </div>

              {/* Functional */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-400 text-xs">
                    <Settings className="w-3.5 h-3.5" />
                    <span>ملفات وظيفية</span>
                  </div>
                  <p className="text-[11px] text-slate-400">تذكر اللغة المفضلة، الثيم، وحجم العرض المخصص.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* Analytics */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-purple-400 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ملفات تحليلية مجهولة</span>
                  </div>
                  <p className="text-[11px] text-slate-400">قياس سرعة الأداء واستكشاف الأخطاء البرمجية بدون هوية.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>

              {/* Marketing */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
                    <Cookie className="w-3.5 h-3.5" />
                    <span>ملفات تسويقية</span>
                  </div>
                  <p className="text-[11px] text-slate-400">حملات إعادة الاستهداف العامة (لا تشمل أي بيانات مالية).</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-bold transition-colors cursor-pointer py-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isCustomizing ? "إخفاء خيارات التخصيص" : "تخصيص الخيارات (Customize)"}</span>
            {isCustomizing ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-2 flex-wrap mr-auto">
            <button
              type="button"
              onClick={handleRejectAll}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              رفض الاختياري (Reject Non-Essential)
            </button>

            {isCustomizing ? (
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>حفظ اختياراتي</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>قبول الكل (Accept All)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
