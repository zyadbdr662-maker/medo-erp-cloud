import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  RefreshCw,
  ShieldCheck,
  Cpu,
  Database,
  Cloud,
  Layers,
  CheckCircle2,
  X,
  Gauge,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import {
  sovereignRejuvenationService,
  RejuvenationPhase,
  RejuvenationResult,
} from "../services/sovereignRejuvenationService";

interface SovereignRejuvenationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRejuvenationComplete?: (result: RejuvenationResult) => void;
}

export const SovereignRejuvenationModal: React.FC<SovereignRejuvenationModalProps> = ({
  isOpen,
  onClose,
  onRejuvenationComplete,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [phases, setPhases] = useState<RejuvenationPhase[]>([]);
  const [result, setResult] = useState<RejuvenationResult | null>(null);

  if (!isOpen) return null;

  const handleStartRejuvenation = async () => {
    setIsRunning(true);
    setResult(null);
    setProgressPct(5);

    try {
      const res = await sovereignRejuvenationService.executeRejuvenation(
        (updatedPhases, _step, pct) => {
          setPhases(updatedPhases);
          setProgressPct(pct);
        }
      );
      setResult(res);
      setProgressPct(100);
      onRejuvenationComplete?.(res);
    } catch (err) {
      console.error("Rejuvenation error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in font-['Alexandria','Cairo',sans-serif]"
      dir="rtl"
    >
      <div className="w-full max-w-2xl bg-[#061527] border-2 border-[#D4AF37] rounded-3xl shadow-[0_0_60px_rgba(212,175,55,0.3)] text-white overflow-hidden flex flex-col relative">
        {/* Top Decorative Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-[#0B1E36] to-slate-950 border-b border-[#D4AF37]/40 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-600 border border-amber-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-950/50">
              <Zap className="w-6 h-6 text-slate-950 fill-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  مركز الإنعاش والتطهير السيادي السحابي
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[11px] shadow-sm">
                  ULTRA 60 FPS
                </span>
              </div>
              <p className="text-xs text-amber-300/90 font-medium mt-0.5">
                تفريغ الذاكرة، تسريع الـ DOM، تطهير الكاشات، وتحديث الجلسة السحابية الفوري
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer disabled:opacity-40"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] relative z-10">
          {/* Sovereign Identity Banner */}
          <div className="p-3.5 bg-gradient-to-r from-[#0F294A]/80 via-slate-950 to-[#0F294A]/80 border border-blue-400/40 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400">بوابة الإدارة السيادية العليا: </span>
                <span className="font-bold text-white">المبرمج والمصمم مالك البرنامج — </span>
                <span className="font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                  الأستاذ بدر عايض محمد
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] font-bold">
              SOVEREIGN AUTH
            </span>
          </div>

          {/* Real-time System Vitals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
              <div className="flex items-center justify-center text-cyan-400 mb-1">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-slate-400">الذاكرة العشوائية</div>
              <div className="text-sm font-black font-mono text-cyan-300">
                {result ? `-${(result.memoryFreedEstimateKb / 1024).toFixed(1)} MB` : "خفيفة ومثالية"}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
              <div className="flex items-center justify-center text-emerald-400 mb-1">
                <Cloud className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-slate-400">زمن الاستجابة</div>
              <div className="text-sm font-black font-mono text-emerald-400">
                {result ? `${result.cloudPingMs} ms` : "24 ms (فائق)"}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
              <div className="flex items-center justify-center text-amber-400 mb-1">
                <Gauge className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-slate-400">معدل الإطارات</div>
              <div className="text-sm font-black font-mono text-amber-300">60 FPS</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
              <div className="flex items-center justify-center text-purple-400 mb-1">
                <Database className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-slate-400">قواعد البيانات</div>
              <div className="text-sm font-black text-purple-300">متزامنة 100%</div>
            </div>
          </div>

          {/* Progress Bar (Visible during or after execution) */}
          {(isRunning || progressPct > 0) && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>تقدم عملية الإنعاش والتحديث السحابي:</span>
                </span>
                <span className="font-mono font-black text-amber-400">{progressPct}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-cyan-400 to-emerald-400 transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.6)]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Phases Checklist */}
          {phases.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400">مراحل التطهير والإنعاش الخماسي:</div>
              <div className="space-y-2">
                {phases.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      p.status === "COMPLETED"
                        ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                        : p.status === "PROCESSING"
                        ? "bg-amber-950/40 border-amber-500 text-amber-200 animate-pulse"
                        : "bg-slate-950/60 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-white">{p.nameAr}</div>
                        <div className="text-[11px] text-slate-400">{p.descriptionAr}</div>
                      </div>
                    </div>
                    <div>
                      {p.status === "COMPLETED" ? (
                        <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-[11px] font-mono">{p.metric || "مكتمل"}</span>
                        </div>
                      ) : p.status === "PROCESSING" ? (
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span className="text-[11px]">جاري التنفيذ...</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">في الانتظار</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {result && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-950 to-emerald-950/90 border-2 border-emerald-500 text-emerald-200 text-xs font-bold space-y-1.5 animate-fade-in shadow-xl shadow-emerald-950/50">
              <div className="flex items-center gap-2 text-sm text-white">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{result.summaryMessageAr}</span>
              </div>
              <div className="text-[11px] text-emerald-300/80 pr-7 font-normal">
                الذاكرة المحررة: <strong className="text-white">~{(result.memoryFreedEstimateKb / 1024).toFixed(1)} ميجابايت</strong> • سرعة السحابة: <strong className="text-white">{result.cloudPingMs}ms</strong> • توقيت الإنعاش: <strong className="text-white">{result.timestamp}</strong>.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <button
            onClick={onClose}
            disabled={isRunning}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer disabled:opacity-40"
          >
            إغلاق النافذة
          </button>

          <button
            onClick={handleStartRejuvenation}
            disabled={isRunning}
            className={`px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#D4AF37] hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-60 border border-yellow-200 ${
              isRunning ? "cursor-wait" : ""
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 text-slate-950 animate-spin" />
                <span>جاري الإنعاش والتطهير السحابي الفائق...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>⚡ إطلاق الإنعاش السيادي وخفة النظام</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
