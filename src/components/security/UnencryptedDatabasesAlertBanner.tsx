import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Radio,
  Server,
  Zap,
} from "lucide-react";
import {
  cloudSecurityService,
  EnterpriseDatabaseEncryptionStatus,
} from "../../services/cloudSecurityService";

interface UnencryptedDatabasesAlertBannerProps {
  currentUserName?: string;
}

export const UnencryptedDatabasesAlertBanner: React.FC<UnencryptedDatabasesAlertBannerProps> = ({
  currentUserName = "مدير النظام الأعلى",
}) => {
  const [unencryptedDbs, setUnencryptedDbs] = useState<EnterpriseDatabaseEncryptionStatus[]>(() =>
    cloudSecurityService.getUnencryptedDatabases()
  );
  const [isEncryptingAll, setIsEncryptingAll] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    // Real-time listener for unencrypted tables
    const unsub = cloudSecurityService.subscribeToEncryptionAlerts((unencrypted) => {
      setUnencryptedDbs(unencrypted);
    });

    const generalUnsub = cloudSecurityService.subscribe(() => {
      setUnencryptedDbs(cloudSecurityService.getUnencryptedDatabases());
    });

    return () => {
      unsub();
      generalUnsub();
    };
  }, []);

  const handleEncryptAll = () => {
    setIsEncryptingAll(true);
    setTimeout(() => {
      cloudSecurityService.encryptAllDatabases(currentUserName);
      setIsEncryptingAll(false);
      setSuccessNotice("✓ تم تشفير كافة قواعد البيانات المؤسسية بنجاح وتفعيل مفاتيح AES-256-GCM!");
      setTimeout(() => setSuccessNotice(null), 5000);
    }, 1000);
  };

  // Simulation test to demonstrate the real-time listener
  const handleSimulateUnencryptedDb = () => {
    const allDbs = cloudSecurityService.getEnterpriseDatabases();
    if (allDbs.length > 0) {
      // Toggle off encryption on first db to trigger real-time alert
      const target = allDbs[0];
      cloudSecurityService.toggleDatabaseEncryption(target.id, false, currentUserName);
    }
  };

  if (unencryptedDbs.length === 0 && !successNotice) {
    return (
      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 px-4 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-emerald-300 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>مستمع الرقابة اللحظي (Real-time Encryption Monitor): كافة قواعد البيانات المؤسسية مشفرة بنسبة 100% (AES-256-GCM).</span>
        </div>
        <button
          type="button"
          onClick={handleSimulateUnencryptedDb}
          className="text-[11px] font-bold text-slate-400 hover:text-amber-300 hover:bg-slate-900/60 px-2 py-1 rounded transition-colors cursor-pointer border border-transparent hover:border-slate-800"
          title="اختبار محاكاة ظهور إنذار جدول غير مشفر للتأكد من عمل مستمع الرقابة اللحظي"
        >
          محاكاة اختبار الإنذار اللحظي ⚡
        </button>
      </div>
    );
  }

  if (successNotice) {
    return (
      <div className="bg-emerald-950/90 border border-emerald-500/60 rounded-xl p-4 flex items-center justify-between text-xs text-emerald-200 animate-fade-in shadow-xl">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-bold">{successNotice}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="critical-unencrypted-alert-banner"
      className="bg-gradient-to-r from-rose-950 via-red-950 to-amber-950 border-2 border-rose-500 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden animate-pulse"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/40 animate-bounce">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                إنذار أمني حرج للغاية ⚠️
              </span>
              <span className="text-xs text-rose-300 font-mono">
                رصد عدد ({unencryptedDbs.length}) جداول غير مشفرة
              </span>
            </div>
            <h3 className="text-base font-black text-white mt-1">
              مخالفة معايير الأمان السيادي: تم رصد قواعد بيانات بدون تشفير في حالة الراحة (Encryption at Rest)!
            </h3>
            <p className="text-xs text-rose-200 mt-1 max-w-3xl leading-relaxed">
              وفقاً لسياسة الحوكمة المالية وأمن البيانات السيادية، يُحظر تخزين بيانات الأستاذ العام، أو الخزائن، أو الحسابات المصرفية بنص صريح بدون تشفير عتادي AES-256-GCM.
            </p>

            {/* Affected tables chips */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="text-[11px] font-bold text-rose-300">الجداول المتأثرة:</span>
              {unencryptedDbs.map((db) => (
                <span
                  key={db.id}
                  className="bg-rose-900/80 border border-rose-600/60 text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"
                >
                  <Unlock className="w-3 h-3 text-amber-300" />
                  <span>{db.nameAr}</span>
                  <span className="font-mono text-[10px] text-rose-300">
                    ({db.recordsCount.toLocaleString()} سجل)
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <button
            id="btn-mass-encrypt-all-databases"
            type="button"
            onClick={handleEncryptAll}
            disabled={isEncryptingAll}
            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-400/40"
          >
            {isEncryptingAll ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري تطبيق التشفير الإجباري...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>تشفير كافة الجداول فوراً (AES-256)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
