import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Download,
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Tablet,
  ChevronLeft,
  Tv,
  QrCode,
  Info
} from "lucide-react";
import { soundService } from "../services/notificationSoundService";

interface FirstLoginWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const FirstLoginWelcomeModal: React.FC<FirstLoginWelcomeModalProps> = ({
  isOpen,
  onClose,
  userName = "أ. بدر عايض محمد"
}) => {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Trigger Royal Bank Chime sound once when welcome modal opens
  useEffect(() => {
    if (isOpen) {
      soundService.playSound("ROYAL_BANK_CHIME");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadAPK = () => {
    setDownloadProgress(0);
    setDownloadSuccess(false);
    soundService.playSound("SUCCESS_CHIME");

    // Realistic download progress bar simulation
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadSuccess(true);
          // Trigger actual browser download of the served APK route
          window.location.href = "/api/download/android-apk";
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn font-sans" dir="rtl">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#0B1528] to-[#040811] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-right">
        
        {/* Decorative Glowing Header Pattern */}
        <div className="relative bg-gradient-to-l from-amber-600 via-slate-900 to-emerald-800 px-6 py-6 text-white border-b border-amber-500/20 shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_45%)]" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-white">مرحباً بك في سحابة MeDo ERP الموحدة</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 border border-amber-400">
                    النسخة الأصلية S/4HANA
                  </span>
                </div>
                <p className="text-xs text-amber-200 mt-1">
                  نظام التراخيص وإدارة موارد المؤسسات السحابية المتكاملة
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              title="إغلاق الترحيب"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Welcome User Greeting Banner */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 text-2xl">
              👑
            </div>
            <div className="text-center sm:text-right">
              <h4 className="text-base font-bold text-white">أهلاً ومرحباً بك، {userName}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                يسعدنا إعداد وتجهيز نظامك السحابي المتكامل. تم ربط فروعك ومستودعاتك بقاعدة البيانات السحابية المركزية الموحدة وتفعيل ترخيصك الأصلي بالكامل.
              </p>
            </div>
          </div>

          {/* Android Tablet Direct Installer Section */}
          <div className="bg-gradient-to-l from-emerald-950/30 via-slate-900/40 to-slate-950/80 border border-emerald-500/25 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Tablet className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-emerald-400 flex items-center gap-2">
                  <span>📱 التثبيت المباشر للأجهزة اللوحية وجوالات الكاشير</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    ملف APK معتمد
                  </span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  قم بتحميل ملف الـ APK المؤسسي مباشرة لتثبيته كبرنامج مستقل على جهاز الكاشير اللوحي (Tablet) أو الجوال ليعمل بأعلى كفاءة في العمل المكتبي ونقاط البيع.
                </p>
              </div>
            </div>

            {/* Simulated Tablet Interface Graphics / Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-200">سرعة استجابة فائقة</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-slate-200">الطباعة الحرارية المباشرة</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2 col-span-2 sm:col-span-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-slate-200">نظام حماية البيانات</span>
              </div>
            </div>

            {/* Direct APK Download Button and Progress */}
            <div className="pt-3 space-y-3">
              {downloadProgress === null ? (
                <button
                  onClick={handleDownloadAPK}
                  className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition-all duration-300 cursor-pointer border-t border-emerald-400"
                >
                  <Download className="w-5 h-5 text-slate-950 animate-bounce" />
                  <span>📥 تحميل التطبيق المؤسسي للأندرويد (ملف APK مباشر)</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-bold">جاري تجهيز وتحميل ملف الـ APK السحابي...</span>
                    <span className="font-bold text-emerald-400">{downloadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-700">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-200"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  {downloadSuccess && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>🎉 تم التحميل بنجاح! افتح الملف المُنزّل لتثبيته مباشرة على جهازك اللوحي.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Info Alerts */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed space-y-1">
              <strong className="text-slate-200">💡 تعليمات هامة لتثبيت الـ APK على جهازك اللوحي:</strong>
              <p>عند فتح ملف الـ APK لأول مرة، قد تظهر لك رسالة حماية تطلب السماح بالتثبيت من مصادر غير معروفة (Unknown Sources)، يرجى تفعيلها لإتمام التثبيت المؤسسي الخارجي المعتمد بنجاح.</p>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="bg-[#070E1A] px-6 py-4 border-t border-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>نظام معتمد ومحمي بالكامل 256-bit AES</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center gap-1"
          >
            <span>بدء العمل بالمنظومة السحابية &larr;</span>
          </button>
        </div>

      </div>
    </div>
  );
};
