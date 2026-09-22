import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Check, Award } from 'lucide-react';
import { soundService } from '../services/notificationSoundService';

export const InstallAppBanner: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSGuide, setShowIOSGuide] = useState(false);

    useEffect(() => {
        // Check if running in standalone mode (already installed)
        if (window.matchMedia('(display-mode: standalone)').matches || 
            (window.navigator as any).standalone === true) {
            setIsInstalled(true);
            return;
        }

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIOSDevice);

        if (isIOSDevice) {
            // Show custom install hint for iOS users on mobile browsers
            const dismissed = localStorage.getItem('medo_pwa_ios_dismissed') === 'true';
            if (!dismissed) {
                setShowBanner(true);
            }
            return;
        }

        // Beforeinstallprompt event handler for Chromium/Android
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            const dismissed = localStorage.getItem('medo_pwa_android_dismissed') === 'true';
            if (!dismissed) {
                setShowBanner(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Appinstalled listener
        const appInstalledHandler = () => {
            setIsInstalled(true);
            setShowBanner(false);
            soundService.playSound("SUCCESS_CHIME");
        };
        window.addEventListener('appinstalled', appInstalledHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', appInstalledHandler);
        };
    }, []);

    const handleInstall = async () => {
        if (isIOS) {
            setShowIOSGuide(true);
            return;
        }

        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('✅ تم تثبيت تطبيق MeDo ERP بنجاح!');
            setShowBanner(false);
            soundService.playSound("SUCCESS_CHIME");
        } else {
            console.log('❌ تم إلغاء التثبيت');
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        if (isIOS) {
            localStorage.setItem('medo_pwa_ios_dismissed', 'true');
        } else {
            localStorage.setItem('medo_pwa_android_dismissed', 'true');
        }
    };

    if (isInstalled || !showBanner) return null;

    return (
        <>
            <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[420px] z-[9999] bg-slate-900/95 backdrop-blur-md border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden p-4 animate-slideIn text-right font-sans" dir="rtl">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                        <Smartphone className="w-5 h-5 animate-pulse" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                                <span>📱 ثبّت تطبيق MeDo ERP على جوالك</span>
                                <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">جديد</span>
                            </h4>
                            <button 
                                onClick={handleDismiss} 
                                className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition cursor-pointer"
                                title="إغلاق"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            استخدم نظام إدارة موارد المؤسسات السحابي كتطبيق أصلي سريع وخفيف على جوالك مع دعم العمل دون اتصال بالإنترنت.
                        </p>

                        <div className="mt-3.5 flex items-center gap-2">
                            <button
                                onClick={handleInstall}
                                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5 text-slate-950" />
                                <span>تثبيت الآن</span>
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                            >
                                ليس الآن
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* iOS Installation Guide Modal */}
            {showIOSGuide && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn" dir="rtl">
                    <div className="w-full max-w-sm bg-[#0B1528] border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-right">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-base font-black text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-500" />
                                <span>التثبيت على أجهزة iPhone / iPad</span>
                            </h3>
                            <button
                                onClick={() => setShowIOSGuide(false)}
                                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="py-5 space-y-4 text-xs text-slate-300 leading-relaxed">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold shrink-0">1</div>
                                <p>اضغط على زر **المشاركة (Share)** 📤 في أسفل شريط متصفح Safari.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold shrink-0">2</div>
                                <p>قم بالتمرير للأسفل في الخيارات ثم اضغط على **"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)** ➕.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold shrink-0">3</div>
                                <p>اضغط على **"إضافة" (Add)** في الزاوية العلوية لتأكيد التثبيت بنجاح.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setShowIOSGuide(false);
                                setShowBanner(false);
                                localStorage.setItem('medo_pwa_ios_dismissed', 'true');
                            }}
                            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                        >
                            حسناً، فهمت ذلك
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
