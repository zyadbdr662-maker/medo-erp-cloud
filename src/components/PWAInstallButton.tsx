import React, { useState } from "react";
import { Download, Monitor, Smartphone, X, CheckCircle2, Share2, PlusSquare } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

export const PWAInstallButton: React.FC<{ variant?: "header" | "banner" | "sidebar" }> = ({
  variant = "header",
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running inside standalone app, show small indicator or return null
  if (isInstalled) {
    if (variant === "banner") {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>يعمل كتطبيق سطح مكتب / هاتف مستقل (Standalone App)</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback for browsers that don't emit prompt or when already installed
      setShowIOSGuide(true);
    }
  };

  if (variant === "sidebar") {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-300 text-xs font-bold transition-all shadow-sm group cursor-pointer"
          title="تثبيت MeDo ERP كتطبيق مستقل يعمل بدون إنترنت"
        >
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>تثبيت التطبيق المستقل</span>
          </div>
          <Download className="w-3.5 h-3.5 text-emerald-400" />
        </button>

        {showIOSGuide && <InstallModal onClose={() => setShowIOSGuide(false)} isIOS={isIOS} />}
      </>
    );
  }

  if (variant === "banner") {
    return (
      <>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/30 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <Monitor className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>تطبيق MeDo ERP المستقل (Desktop & Mobile App)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  Offline-Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                يمكنك تثبيت البرنامج كبرنامج مستقل على Windows, Mac, Linux أو الهاتف للعمل فوراً دون الحاجة لفتح المتصفح أو الاتصال بالنت.
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex-shrink-0 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>تثبيت التطبيق الآن</span>
          </button>
        </div>

        {showIOSGuide && <InstallModal onClose={() => setShowIOSGuide(false)} isIOS={isIOS} />}
      </>
    );
  }

  // Header default variant
  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-600/50 text-emerald-300 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
        title="تثبيت التطبيق على جهاز الكمبيوتر أو الهاتف (يعمل دون إنترنت)"
      >
        <Download className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden xl:inline">تثبيت التطبيق</span>
      </button>

      {showIOSGuide && <InstallModal onClose={() => setShowIOSGuide(false)} isIOS={isIOS} />}
    </>
  );
};

interface InstallModalProps {
  onClose: () => void;
  isIOS: boolean;
}

const InstallModal: React.FC<InstallModalProps> = ({ onClose, isIOS }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-right space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Monitor className="w-5 h-5 text-emerald-400" />
            <span>تثبيت تطبيق MeDo ERP كبرنامج مستقل</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            تطبيق MeDo ERP مبني بمعمارية <strong>Local-First / PWA</strong>، بحيث يمكنك تشغيله كبرنامج مستقل بالكامل على سطح المكتب
            (Windows / macOS / Linux) أو هواتف Android و iPhone دون الحاجة لمتصفح أو إنترنت.
          </p>

          {isIOS ? (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>طريقة التثبيت على أجهزة iPhone / iPad (Safari):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>
                  اضغط على زر المشاركة <Share2 className="w-3.5 h-3.5 inline text-sky-400" /> أسفل شاشة Safari.
                </li>
                <li>
                  اختر <strong>إضافة إلى الصفحة الرئيسية (Add to Home Screen)</strong> <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400" />.
                </li>
                <li>اضغط على <strong>إضافة (Add)</strong>، وسيظهر رمز التطبيق على شاشتك فوراً.</li>
              </ol>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Monitor className="w-4 h-4" />
                <span>طريقة التثبيت على الكمبيوتر (Chrome / Edge):</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>
                  انقر على أيقونة التثبيت <Download className="w-3.5 h-3.5 inline text-emerald-400" /> في شريط العنوان أعلى المتصفح.
                </li>
                <li>أو افتح قائمة المتصفح (⋮) واختر <strong>تثبيت MeDo ERP (Install MeDo ERP)</strong>.</li>
                <li>سيتم فتح البرنامج في نافذة مستقلة مع أيقونة على سطح المكتب وشريط المهام.</li>
              </ul>
            </div>
          )}

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-[11px] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              جميع البيانات تُحفظ في قاعدة بيانات محلية مدمجة بجهازك، وتعمل حتى أثناء انقطاع شبكة الإنترنت كلياً!
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
        >
          حسناً، فهمت
        </button>
      </div>
    </div>
  );
};
