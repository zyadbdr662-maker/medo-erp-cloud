import React, { useState } from 'react';
import { Database, Server, RefreshCw, Activity, ServerCrash, Clock, CheckCircle2, AlertTriangle, PlayCircle } from 'lucide-react';

export const CloudSyncDashboard: React.FC = () => {
  const [syncTime, setSyncTime] = useState(new Date());
  const [failoverState, setFailoverState] = useState<"normal" | "simulating" | "failed_over">("normal");

  const handleFailoverTest = () => {
    if (failoverState !== "normal") return;
    setFailoverState("simulating");
    
    // Simulate failover delay
    setTimeout(() => {
      setFailoverState("failed_over");
      setSyncTime(new Date());
    }, 4000);
  };

  const handleReset = () => {
    setFailoverState("normal");
    setSyncTime(new Date());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white font-sans flex items-center gap-3">
            مراقبة التزامن السحابي متعدد العقد
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
              Multi-Cloud Enabled
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-sans">إدارة ومراقبة تزامن البيانات عبر خوادم Google, Huawei, و Alibaba</p>
        </div>
        <div className="flex gap-2">
          {failoverState === "failed_over" && (
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-sans transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              استعادة الوضع الطبيعي
            </button>
          )}
          <button 
            onClick={() => setSyncTime(new Date())}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-sans transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${failoverState === "simulating" ? "animate-spin" : ""}`} />
            تحديث الحالة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Node 1: GCP Postgres */}
        <div className={`bg-slate-900 border rounded-xl p-6 relative overflow-hidden transition-all duration-500 ${
          failoverState === "normal" 
            ? "border-emerald-500/50" 
            : failoverState === "simulating" 
              ? "border-amber-500/50 opacity-80" 
              : "border-red-500/50 opacity-60"
        }`}>
          {failoverState === "normal" && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>}
          {failoverState === "failed_over" && <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>}
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${failoverState === "failed_over" ? "bg-red-500/20" : "bg-emerald-500/20"}`}>
                <Database className={`h-6 w-6 ${failoverState === "failed_over" ? "text-red-400" : "text-emerald-400"}`} />
              </div>
              <div>
                <h3 className="font-bold text-white font-sans text-lg">Google Cloud (GCP)</h3>
                <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                  failoverState === "normal" 
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : failoverState === "simulating"
                      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      : "text-red-400 bg-red-500/10 border-red-500/20"
                }`}>
                  {failoverState === "normal" ? "Active Primary" : failoverState === "simulating" ? "Connection Lost..." : "Offline (Down)"}
                </span>
              </div>
            </div>
            {failoverState === "normal" ? (
              <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
            ) : failoverState === "simulating" ? (
              <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />
            ) : (
              <ServerCrash className="h-5 w-5 text-red-500" />
            )}
          </div>
          
          <div className="space-y-3 mt-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-sans">قاعدة البيانات:</span>
              <span className="text-slate-200 font-mono">PostgreSQL (Cloud SQL)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-sans">المنطقة (Region):</span>
              <span className="text-slate-200 font-mono">europe-west1</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-sans">زمن الاستجابة:</span>
              <span className={`${failoverState === "normal" ? "text-emerald-400" : "text-red-400"} font-mono`}>
                {failoverState === "normal" ? "~12ms" : "Timeout"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-sans">حالة المزامنة:</span>
              <span className={`flex items-center gap-1 font-sans ${failoverState === "normal" ? "text-emerald-400" : "text-red-400"}`}>
                {failoverState === "normal" ? <><CheckCircle2 className="h-3 w-3" /> متصل ومحدث</> : <><AlertTriangle className="h-3 w-3" /> مقطوع</>}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500 font-sans flex items-center justify-between">
            <span>آخر استجابة:</span>
            <span>{syncTime.toLocaleTimeString('ar-EG')}</span>
          </div>
        </div>

        {/* Node 2: Huawei Cloud */}
        <div className="bg-slate-900 border border-blue-500/50 rounded-xl p-6 relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Database className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-white font-sans text-lg">Huawei Cloud</h3>
                <span className="text-blue-400 text-xs font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Active Replica</span>
              </div>
            </div>
            <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
          </div>
          
          <div className="space-y-3 mt-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-sans">قاعدة البيانات:</span>
              <span className="text-slate-200 font-mono">GaussDB (PostgreSQL)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-sans">المنطقة (Region):</span>
              <span className="text-slate-200 font-mono">riyadh-1 (KSA)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-sans">دور العقدة:</span>
              <span className="text-blue-400 font-sans">Synchronized Replica</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500 font-sans flex items-center justify-between">
            <span className="flex items-center gap-1 text-blue-400 font-sans"><CheckCircle2 className="h-3 w-3" /> متصل ومحدث</span>
            <span>{syncTime.toLocaleTimeString('ar-EG')}</span>
          </div>
        </div>

        {/* Node 3: Alibaba Cloud */}
        <div className={`bg-slate-900 border rounded-xl p-6 relative overflow-hidden transition-all duration-500 ${
          failoverState === "normal" 
            ? "border-amber-500/30" 
            : failoverState === "simulating" 
              ? "border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
              : "border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        }`}>
          {failoverState === "failed_over" && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>}
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${failoverState === "failed_over" ? "bg-emerald-500/20" : "bg-amber-500/20"}`}>
                <Server className={`h-6 w-6 ${failoverState === "failed_over" ? "text-emerald-400" : "text-amber-400"}`} />
              </div>
              <div>
                <h3 className="font-bold text-white font-sans text-lg">Alibaba Cloud</h3>
                <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                  failoverState === "failed_over"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                }`}>
                  {failoverState === "normal" ? "Standby (Ready)" : failoverState === "simulating" ? "Taking Over..." : "New Primary (Active)"}
                </span>
              </div>
            </div>
            {failoverState === "failed_over" ? (
              <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
            ) : failoverState === "simulating" ? (
              <RefreshCw className="h-5 w-5 text-amber-500 animate-spin" />
            ) : (
              <Activity className="h-5 w-5 text-amber-500" />
            )}
          </div>
          
          <div className="space-y-3 mt-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-sans">قاعدة البيانات:</span>
              <span className="text-slate-200 font-mono">PolarDB (PostgreSQL)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-sans">المنطقة (Region):</span>
              <span className="text-slate-200 font-mono">me-central-1 (UAE)</span>
            </div>
             <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-sans">دور العقدة:</span>
              <span className={`${failoverState === "failed_over" ? "text-emerald-400 font-bold" : "text-amber-400"} font-sans`}>
                {failoverState === "normal" ? "Failover Ready" : failoverState === "simulating" ? "Promoting to Primary..." : "Primary Node"}
              </span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800">
            {failoverState === "normal" ? (
              <button 
                onClick={handleFailoverTest}
                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 flex items-center justify-center gap-2 text-sm py-2 rounded font-sans transition-colors"
              >
                <PlayCircle className="w-4 h-4" />
                محاكاة انقطاع العقدة (Failover Test)
              </button>
            ) : failoverState === "simulating" ? (
              <button disabled className="w-full bg-amber-900/50 text-amber-400 text-sm py-2 rounded font-sans cursor-not-allowed">
                جاري التحويل... (Failover in progress)
              </button>
            ) : (
              <button disabled className="w-full bg-emerald-900/50 text-emerald-400 text-sm py-2 rounded font-sans border border-emerald-500/20">
                تعمل العقدة الآن كخادم أساسي
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mt-8">
        <h3 className="text-lg font-bold text-white font-sans mb-4 border-b border-slate-800 pb-2">سجل العمليات (Transaction Log)</h3>
        
        <div className="bg-slate-950 rounded border border-slate-800 p-4 font-mono text-sm text-slate-300 h-64 overflow-y-auto flex flex-col gap-2">
          
          {failoverState === "failed_over" && (
            <>
              <div className="flex gap-4 items-center text-emerald-400 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <span>{syncTime.toISOString()}</span>
                <span className="bg-emerald-500/20 px-1 rounded">[ROUTING_OK]</span>
                <span>Traffic successfully rerouted to me-central-1. System is 100% operational.</span>
              </div>
              <div className="flex gap-4 items-center text-amber-400 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <span>{new Date(syncTime.getTime() - 1000).toISOString()}</span>
                <span className="bg-amber-500/20 px-1 rounded">[FAILOVER_SUCCESS]</span>
                <span>Alibaba PolarDB promoted to Primary Node. Zero Data Loss (RPO=0).</span>
              </div>
            </>
          )}

          {(failoverState === "simulating" || failoverState === "failed_over") && (
            <>
              <div className="flex gap-4 items-center text-amber-400 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <span>{new Date(syncTime.getTime() - (failoverState === "failed_over" ? 3000 : 0)).toISOString()}</span>
                <span className="bg-amber-500/20 px-1 rounded">[FAILOVER_INIT]</span>
                <span>Initiating automatic failover sequence to Alibaba Cloud (me-central-1)...</span>
              </div>
              <div className="flex gap-4 items-center text-red-400 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <span>{new Date(syncTime.getTime() - (failoverState === "failed_over" ? 4000 : 1000)).toISOString()}</span>
                <span className="bg-red-500/20 px-1 rounded">[CRITICAL]</span>
                <span>GCP Postgres (europe-west1) connection lost. Heartbeat failed.</span>
              </div>
            </>
          )}

          <div className="flex gap-4 items-center text-blue-400">
            <span>{new Date(Date.now() - 45000).toISOString()}</span>
            <span className="bg-blue-500/20 px-1 rounded">[REPLICATED]</span>
            <span>Journal entry replicated to Huawei Cloud (riyadh-1) in 45ms.</span>
          </div>
          <div className="flex gap-4 items-center text-emerald-400">
            <span>{new Date(Date.now() - 50000).toISOString()}</span>
            <span className="bg-emerald-500/20 px-1 rounded">[COMMITTED]</span>
            <span>New journal entry saved to GCP Postgres (Primary).</span>
          </div>
          <div className="flex gap-4 items-center text-emerald-400">
            <span>{new Date(Date.now() - 80000).toISOString()}</span>
            <span className="bg-emerald-500/20 px-1 rounded">[SYNC_OK]</span>
            <span>GCP Postgres Connection Active.</span>
          </div>
          <div className="flex gap-4 items-center text-blue-400">
            <span>{new Date(Date.now() - 85000).toISOString()}</span>
            <span className="bg-blue-500/20 px-1 rounded">[SYNC_OK]</span>
            <span>Huawei GaussDB Connection Active.</span>
          </div>
          <div className="flex gap-4 items-center text-amber-400">
            <span>{new Date(Date.now() - 90000).toISOString()}</span>
            <span className="bg-amber-500/20 px-1 rounded">[STANDBY_READY]</span>
            <span>Alibaba PolarDB heartbeat confirmed.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
