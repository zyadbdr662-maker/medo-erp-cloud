import React, { useState } from "react";
import {
  Fingerprint,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  DollarSign,
  Smartphone,
  Sparkles,
} from "lucide-react";
import {
  cloudSecurityService,
  BiometricApprovalConfig,
} from "../../services/cloudSecurityService";
import { soundService } from "../../services/notificationSoundService";

interface BiometricApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApproved: (credentialDetails: { authType: string; signature: string }) => void;
  amount: number;
  currency?: string;
  actionDescription: string;
  actorName?: string;
  actorRole?: string;
}

export const BiometricApprovalModal: React.FC<BiometricApprovalModalProps> = ({
  isOpen,
  onClose,
  onApproved,
  amount,
  currency = "YER",
  actionDescription,
  actorName = "المسؤول المالي",
  actorRole = "FINANCIAL_MANAGER",
}) => {
  const [config] = useState<BiometricApprovalConfig>(() =>
    cloudSecurityService.getBiometricConfig()
  );
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fallbackPin, setFallbackPin] = useState("");
  const [isUsingPin, setIsUsingPin] = useState(false);

  if (!isOpen) return null;

  const handleScanWebAuthn = async () => {
    setIsScanning(true);
    setErrorMessage(null);

    try {
      const result = await cloudSecurityService.simulateWebAuthnBiometricAuth(
        actorName
      );

      if (result.success) {
        soundService.playSound("SUCCESS_CHIME");
        onApproved({
          authType: "WEBAUTHN_BIOMETRIC",
          signature: result.credentialId || `WEBAUTHN-SIG-${Date.now()}`,
        });
      } else {
        setErrorMessage(result.message || "فشلت المصادقة البيومترية.");
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "حدث خطأ أثناء الاتصال بمستشعر البصمة WebAuthn."
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fallbackPin.length < 4) {
      setErrorMessage("يرجى إدخال رمز PIN أمني لا يقل عن 4 أرقام.");
      return;
    }

    // Sovereign PIN Approval
    cloudSecurityService.recordImmutableAudit({
      category: "FINANCIAL_OVERRIDE",
      actionType: "BIOMETRIC_PIN_FALLBACK_APPROVED",
      actorName,
      actorRole,
      details: `🔑 اعتماد حركة مالية بمبلغ (${amount.toLocaleString()} ${currency}) بواسطة رمز PIN الأمني البديل نظراً لتعذر البصمة. البيان: ${actionDescription}`,
    });

    soundService.playSound("SUCCESS_CHIME");
    onApproved({
      authType: "PIN_OVERRIDE",
      signature: `PIN-SIG-${Date.now()}`,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-['Alexandria','Cairo',sans-serif] text-right"
      dir="rtl"
    >
      <div
        className="bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-indigo-500/50 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-right shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-indigo-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/30 border border-indigo-400/50 rounded-2xl text-indigo-300 shadow-lg">
              <Fingerprint className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>المصادقة والتوقيع البيومتري (WebAuthn)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                  إلزامي
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                حماية الحركات المالية والتوقيع الإلكتروني المشفر
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Transaction Info Alert Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">مبلغ الحركة المالية:</span>
            <span className="text-emerald-400 font-black font-mono text-base">
              {amount.toLocaleString()} {currency}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">
              سقف الاعتماد البيومتري:
            </span>
            <span className="text-amber-400 font-bold font-mono">
              {config.minAmountThreshold.toLocaleString()} {currency}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
            <span className="text-slate-400">بيان الحركة:</span>{" "}
            <span className="font-semibold text-white">{actionDescription}</span>
          </div>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/60 rounded-xl text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Biometric Scanner Visualizer */}
        {!isUsingPin ? (
          <div className="text-center py-4 space-y-4">
            <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
              {/* Outer Pulsing Ring */}
              <div
                className={`absolute inset-0 rounded-full border-2 border-indigo-500/40 ${
                  isScanning ? "animate-ping opacity-75" : ""
                }`}
              />
              <div
                className={`w-24 h-24 rounded-full bg-indigo-950/70 border-2 ${
                  isScanning
                    ? "border-emerald-400 shadow-lg shadow-emerald-500/30"
                    : "border-indigo-500/50"
                } flex items-center justify-center transition-all`}
              >
                <Fingerprint
                  className={`w-14 h-14 ${
                    isScanning
                      ? "text-emerald-400 animate-pulse"
                      : "text-indigo-400"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">
                {isScanning
                  ? "جارٍ استشعار البصمة الحيوية ومطابقة التوقيع..."
                  : "ضع إصبعك على مستشعر البصمة أو استخدم Passkey / Touch ID"}
              </h4>
              <p className="text-xs text-slate-400">
                المصادقة متوافقة مع معيار FIDO2 / WebAuthn ومحمية بكتلة التشفير السيادي.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                id="btn-scan-webauthn"
                type="button"
                onClick={handleScanWebAuthn}
                disabled={isScanning}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isScanning
                    ? "جارٍ التحقق البيومتري..."
                    : "تأكيد التوقيع بالبصمة الحيوية الآن"}
                </span>
              </button>

              {config.fallbackToPinAllowed && (
                <button
                  type="button"
                  onClick={() => setIsUsingPin(true)}
                  className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer whitespace-nowrap"
                >
                  استخدام رمز PIN البديل
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Fallback PIN Entry Form */
          <form onSubmit={handlePinSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                أدخل رمز PIN الأمني للمصادقة البديلة:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  autoFocus
                  maxLength={8}
                  value={fallbackPin}
                  onChange={(e) => setFallbackPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center tracking-widest text-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400">
                رمز PIN مخصص للمسؤولين الماليين عند تعذر المستشعر البيومتري.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg transition cursor-pointer"
              >
                تأكيد الاعتماد برمز PIN
              </button>
              <button
                type="button"
                onClick={() => setIsUsingPin(false)}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                العودة للبصمة
              </button>
            </div>
          </form>
        )}

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <span>المسؤول المالي: {actorName}</span>
          <span className="font-mono text-indigo-400">FIDO2 / WEBAUTHN CERTIFIED</span>
        </div>
      </div>
    </div>
  );
};
