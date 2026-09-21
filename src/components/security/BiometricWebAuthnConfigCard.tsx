import React, { useState, useEffect } from "react";
import {
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  DollarSign,
  Users,
  Smartphone,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import {
  cloudSecurityService,
  BiometricApprovalConfig,
} from "../../services/cloudSecurityService";

interface BiometricWebAuthnConfigCardProps {
  currentUserName?: string;
}

export const BiometricWebAuthnConfigCard: React.FC<BiometricWebAuthnConfigCardProps> = ({
  currentUserName = "مدير النظام الأعلى",
}) => {
  const [config, setConfig] = useState<BiometricApprovalConfig>(() =>
    cloudSecurityService.getBiometricConfig()
  );
  const [isTestingWebAuthn, setIsTestingWebAuthn] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    credentialId?: string;
  } | null>(null);
  const [minThresholdInput, setMinThresholdInput] = useState(
    config.minAmountThreshold.toString()
  );
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  useEffect(() => {
    const unsub = cloudSecurityService.subscribe(() => {
      const latest = cloudSecurityService.getBiometricConfig();
      setConfig(latest);
      setMinThresholdInput(latest.minAmountThreshold.toString());
    });
    return unsub;
  }, []);

  const handleToggleEnable = (enabled: boolean) => {
    const updated = cloudSecurityService.updateBiometricConfig(
      { enabled },
      currentUserName
    );
    setConfig(updated);
    showSaveFeedback();
  };

  const handleTogglePasskeyOnly = (requirePasskeyOrTouchId: boolean) => {
    const updated = cloudSecurityService.updateBiometricConfig(
      { requirePasskeyOrTouchId },
      currentUserName
    );
    setConfig(updated);
    showSaveFeedback();
  };

  const handleToggleFallbackPin = (fallbackToPinAllowed: boolean) => {
    const updated = cloudSecurityService.updateBiometricConfig(
      { fallbackToPinAllowed },
      currentUserName
    );
    setConfig(updated);
    showSaveFeedback();
  };

  const handleToggleRole = (roleKey: string) => {
    const currentRoles = config.enforceForRoles;
    const nextRoles = currentRoles.includes(roleKey)
      ? currentRoles.filter((r) => r !== roleKey)
      : [...currentRoles, roleKey];

    const updated = cloudSecurityService.updateBiometricConfig(
      { enforceForRoles: nextRoles },
      currentUserName
    );
    setConfig(updated);
    showSaveFeedback();
  };

  const handleThresholdBlur = () => {
    const val = parseFloat(minThresholdInput.replace(/[^0-9.]/g, "")) || 0;
    if (val !== config.minAmountThreshold) {
      const updated = cloudSecurityService.updateBiometricConfig(
        { minAmountThreshold: val },
        currentUserName
      );
      setConfig(updated);
      showSaveFeedback();
    }
  };

  const showSaveFeedback = () => {
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleRunWebAuthnTest = async () => {
    setIsTestingWebAuthn(true);
    setTestResult(null);

    try {
      const res = await cloudSecurityService.simulateWebAuthnBiometricAuth(currentUserName);
      setTestResult({
        success: res.success,
        message: res.message,
        credentialId: res.credentialId,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `فشل التحقق: ${err?.message || "تعذر قراءة البصمة"}`,
      });
    } finally {
      setIsTestingWebAuthn(false);
    }
  };

  const availableRoles = [
    { key: "SUPER_ADMIN", label: "مدير النظام الأعلى (Super Admin)" },
    { key: "CFO", label: "المدير المالي التنفيذي (CFO)" },
    { key: "AUDITOR", label: "كبير مدققي الحسابات (Auditor)" },
    { key: "CHIEF_ACCOUNTANT", label: "محاسب عام رئيسي (Chief Accountant)" },
    { key: "CASHIER", label: "أمين الخزينة والصندوق (Cash Vault)" },
  ];

  return (
    <div
      id="biometric-webauthn-config-card"
      className="bg-slate-900/95 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden transition-all duration-300"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Fingerprint className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                التحقق البيومتري الإجباري (WebAuthn / Passkey)
              </h3>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  config.enabled
                    ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {config.enabled ? "نشط ومفعّل ✓" : "معطّل مؤقتاً"}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              إلزام المسؤولين الماليين بمصادقة البصمة الحيوية (Touch ID / Face ID / FIDO2 Passkey) عند اعتماد وتمرير العمليات المالية ذات القيمة العالية.
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-2.5 px-4 rounded-xl border border-slate-800">
          <span className="text-xs font-bold text-slate-200">
            {config.enabled ? "فرض التحقق" : "إيقاف التحقق"}
          </span>
          <button
            id="toggle-biometric-enforce"
            type="button"
            onClick={() => handleToggleEnable(!config.enabled)}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${
              config.enabled ? "bg-indigo-600" : "bg-slate-700"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.enabled ? "translate-x-1" : "translate-x-7"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        {/* Column 1: Financial Threshold */}
        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <DollarSign className="w-4 h-4" />
            <span>السقف المالي لتفعيل البصمة</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            العمليات المالية (قيود، أذون صرف، تحويلات) التي تتجاوز هذا المبلغ ستطلب المصادقة الحيوية قبل الترحيل.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <input
              id="input-biometric-min-threshold"
              type="text"
              value={minThresholdInput}
              onChange={(e) => setMinThresholdInput(e.target.value)}
              onBlur={handleThresholdBlur}
              placeholder="500000"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm text-left focus:outline-none focus:border-indigo-500"
            />
            <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
              {config.currency}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>الحالي: {config.minAmountThreshold.toLocaleString()} {config.currency}</span>
            <span className="text-indigo-400">تقريباً ~$2,000</span>
          </div>
        </div>

        {/* Column 2: Biometric Hardware & Fallback */}
        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Smartphone className="w-4 h-4" />
            <span>معايير الأجهزة والعتاد (FIDO2)</span>
          </div>
          <div className="space-y-2.5 pt-1">
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-lg hover:bg-slate-900/60 transition-colors">
              <span className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <span>إلزام Touch ID / Face ID / Passkey</span>
              </span>
              <input
                id="checkbox-passkey-required"
                type="checkbox"
                checked={config.requirePasskeyOrTouchId}
                onChange={(e) => handleTogglePasskeyOnly(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-lg hover:bg-slate-900/60 transition-colors">
              <span className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>السماح برمز أمان احتياطي (Backup PIN)</span>
              </span>
              <input
                id="checkbox-pin-fallback"
                type="checkbox"
                checked={config.fallbackToPinAllowed}
                onChange={(e) => handleToggleFallbackPin(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 focus:ring-0"
              />
            </label>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            مفتاح الاعتماد المسجل:
            <span className="block font-mono text-[10px] text-indigo-300 truncate mt-0.5">
              {config.registeredCredentialId || "WEBAUTHN-DEFAULT-PLATFORM-HSM"}
            </span>
          </div>
        </div>

        {/* Column 3: Enforced Roles & Live Test */}
        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Users className="w-4 h-4" />
            <span>الأدوار الوظيفية المشمولة</span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {availableRoles.map((role) => {
              const isChecked = config.enforceForRoles.includes(role.key);
              return (
                <label
                  key={role.key}
                  className={`flex items-center justify-between text-xs p-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
                    isChecked
                      ? "bg-indigo-950/40 text-indigo-200 border border-indigo-800/30"
                      : "text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  <span className="truncate">{role.label}</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleRole(role.key)}
                    className="w-3.5 h-3.5 text-indigo-600 rounded bg-slate-800 border-slate-700"
                  />
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* WebAuthn Live Verification Test Bar */}
      <div className="mt-5 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 via-slate-950 to-purple-950/60 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>فحص واختبار مصادقة البصمة الحيوية (Live WebAuthn Biometric Probe)</span>
              {config.lastTestStatus === "VERIFIED_BIOMETRIC" && (
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                  تم التوثيق بنجاح
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              اختبر استجابة مستشعر Touch ID / Face ID أو مفتاح الأمان FIDO2 المرتبط بمتصفحك الآن.
            </div>
          </div>
        </div>

        <button
          id="btn-run-webauthn-test"
          type="button"
          onClick={handleRunWebAuthnTest}
          disabled={isTestingWebAuthn}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isTestingWebAuthn ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جاري مسح البصمة الحيوية...</span>
            </>
          ) : (
            <>
              <Fingerprint className="w-4 h-4 text-indigo-200" />
              <span>فحص البصمة الآن</span>
            </>
          )}
        </button>
      </div>

      {/* Test feedback */}
      {testResult && (
        <div
          id="biometric-test-result-alert"
          className={`mt-3 p-3 rounded-xl border text-xs flex items-center justify-between gap-3 animate-fade-in ${
            testResult.success
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/80 border-rose-500/40 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
          {testResult.credentialId && (
            <span className="font-mono text-[10px] text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded">
              {testResult.credentialId}
            </span>
          )}
        </div>
      )}

      {isSavedNotice && (
        <div className="absolute bottom-3 left-4 text-[11px] font-bold text-emerald-400 bg-emerald-950/90 border border-emerald-500/40 px-3 py-1 rounded-full shadow-lg animate-bounce">
          ✓ تم حفظ سياسات البصمة الحيوية وتوثيقها في سجل التدقيق المشفر
        </div>
      )}
    </div>
  );
};
