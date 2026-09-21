import React, { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  Lock,
  Volume2,
  VolumeX,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Database,
  Radio,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  cloudSecurityService,
  EnterpriseDatabaseEncryptionStatus,
} from "../../services/cloudSecurityService";
import { soundService } from "../../services/notificationSoundService";

interface UnencryptedDatabaseListenerProps {
  currentUserName?: string;
}

export const UnencryptedDatabaseListener: React.FC<UnencryptedDatabaseListenerProps> = ({
  currentUserName = "مدير النظام",
}) => {
  const [unencryptedDbs, setUnencryptedDbs] = useState<
    EnterpriseDatabaseEncryptionStatus[]
  >(() => cloudSecurityService.getUnencryptedDatabases());

  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [resolutionSuccessMsg, setResolutionSuccessMsg] = useState<string | null>(null);

  const lastAlertTimestamp = useRef<number>(0);

  // Background Observer & Polling Loop
  useEffect(() => {
    const checkEncryptionStatus = () => {
      const list = cloudSecurityService.getUnencryptedDatabases();
      setUnencryptedDbs(list);

      // If unencrypted databases exist and not muted
      if (list.length > 0 && !isMuted) {
        const now = Date.now();
        // Cooldown: sound alarm once every 12 seconds if still unencrypted
        if (now - lastAlertTimestamp.current > 12000) {
          lastAlertTimestamp.current = now;
          setIsAlarmPlaying(true);
          try {
            soundService.playSound("ENCRYPTION_VIOLATION_ALARM");
          } catch (e) {
            console.warn("Could not play alarm sound:", e);
          }
          setTimeout(() => setIsAlarmPlaying(false), 2500);
        }
      }
    };

    // Initial check
    checkEncryptionStatus();

    // Subscribe to state changes in CloudSecurityService
    const unsubscribe = cloudSecurityService.subscribe(() => {
      checkEncryptionStatus();
    });

    // Background interval check every 6 seconds
    const interval = setInterval(() => {
      checkEncryptionStatus();
    }, 6000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isMuted]);

  const handleEncryptAllNow = () => {
    setIsEncrypting(true);
    setTimeout(() => {
      cloudSecurityService.encryptAllDatabases(currentUserName);
      setIsEncrypting(false);
      setIsAlarmPlaying(false);
      setResolutionSuccessMsg("تم تفعيل التشفير الإجباري AES-256-GCM بنجاح وإلغاء الإنذار الأمني.");
      setTimeout(() => setResolutionSuccessMsg(null), 5000);
    }, 600);
  };

  const handleSimulateViolation = () => {
    cloudSecurityService.simulateUnencryptedDatabase("db-payroll-prod", currentUserName);
  };

  // If all databases are encrypted and no success message, show a minimal subtle listener badge or return null
  if (unencryptedDbs.length === 0 && !resolutionSuccessMsg) {
    return null;
  }

  return (
    <div
      id="unencrypted-db-listener-alert"
      className="fixed bottom-5 left-5 right-5 sm:left-auto sm:right-5 sm:max-w-xl z-50 transition-all font-['Alexandria','Cairo',sans-serif] text-right"
      dir="rtl"
    >
      {/* If Resolution Success Toast */}
      {resolutionSuccessMsg && (
        <div className="bg-emerald-950/95 border border-emerald-500/60 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-emerald-200 text-xs animate-bounce">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{resolutionSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setResolutionSuccessMsg(null)}
            className="text-emerald-400 hover:text-white text-xs font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Active Unencrypted Alarm Banner */}
      {unencryptedDbs.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/95 via-red-900/95 to-slate-950/95 border-2 border-rose-500 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md text-white relative overflow-hidden animate-pulse">
          {/* Audio Visualizer Ring */}
          {isAlarmPlaying && (
            <div className="absolute top-2 left-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span className="text-[10px] font-bold text-rose-300">
                صفارة إنذار صوتية نشطة 🚨
              </span>
            </div>
          )}

          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-rose-600/30 border border-rose-400 rounded-xl text-rose-300 shrink-0 mt-0.5">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <span>تنبيه أمني سيادي: رصد قاعدة بيانات غير مشفرة!</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-900 text-rose-200 border border-rose-500/50">
                    CRITICAL
                  </span>
                </h4>

                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? "إلغاء كتم الصوت" : "كتم صوت الإنذار مؤقتاً"}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs transition-all cursor-pointer shrink-0"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
              </div>

              <p className="text-xs text-rose-200 leading-relaxed">
                اكتشف مراقب الأحداث السحابي (Background Listener) وجود عدد (
                <strong className="font-bold text-white">{unencryptedDbs.length}</strong>) جدول أو قاعدة بيانات تفتقر إلى ميزة{" "}
                <strong className="text-yellow-300 font-bold">التشفير في حالة الراحة (Encryption at Rest)</strong>.
              </p>

              {/* List of unencrypted tables */}
              <div className="bg-black/40 border border-rose-500/30 rounded-lg p-2.5 space-y-1 text-[11px]">
                {unencryptedDbs.map((db) => (
                  <div key={db.id} className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 font-bold text-rose-200">
                      <Database className="w-3.5 h-3.5 text-rose-400" />
                      <span>{db.nameAr}</span>
                    </span>
                    <span className="font-mono text-[10px] text-yellow-400 font-semibold">
                      {db.recordsCount.toLocaleString()} سجل مكشوف
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  id="btn-listener-encrypt-all"
                  type="button"
                  onClick={handleEncryptAllNow}
                  disabled={isEncrypting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {isEncrypting
                      ? "جارٍ تشفير الجداول AES-256..."
                      : "تشفير فوري AES-256 لكافة الجداول الآن"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMuted(true)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                >
                  إيقاف مؤقت
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
