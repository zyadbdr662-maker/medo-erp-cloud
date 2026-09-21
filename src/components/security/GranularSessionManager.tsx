import React, { useState, useEffect } from "react";
import {
  Clock,
  Shield,
  Users,
  Smartphone,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Sliders,
  Sparkles,
  RefreshCw,
  Laptop,
} from "lucide-react";
import {
  cloudSecurityService,
  RoleSessionTimeoutConfig,
  ActiveUserSession,
} from "../../services/cloudSecurityService";

interface GranularSessionManagerProps {
  currentUserName?: string;
}

export const GranularSessionManager: React.FC<GranularSessionManagerProps> = ({
  currentUserName = "مدير النظام الأعلى",
}) => {
  const [roleConfigs, setRoleConfigs] = useState<RoleSessionTimeoutConfig[]>(() =>
    cloudSecurityService.getSessionTimeoutConfigs()
  );
  const [activeSessions, setActiveSessions] = useState<ActiveUserSession[]>(() =>
    cloudSecurityService.getActiveSessions()
  );
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = cloudSecurityService.subscribe(() => {
      setRoleConfigs(cloudSecurityService.getSessionTimeoutConfigs());
      setActiveSessions(cloudSecurityService.getActiveSessions());
    });
    return unsub;
  }, []);

  const handleTimeoutChange = (role: string, minutes: number) => {
    cloudSecurityService.updateRoleSessionTimeout(role, minutes, undefined, currentUserName);
    showNotice(`تم تعديل مهلة خمول جلسة الدور إلى ${minutes} دقيقة.`);
  };

  const handleConcurrentChange = (role: string, maxSessions: number) => {
    const current = roleConfigs.find((r) => r.role === role);
    const timeout = current ? current.inactivityTimeoutMinutes : 15;
    cloudSecurityService.updateRoleSessionTimeout(role, timeout, maxSessions, currentUserName);
    showNotice(`تم تعديل الحد الأقصى للجلسات المتزامنة إلى ${maxSessions}.`);
  };

  const handleTerminateSession = (sessionId: string, userName: string) => {
    cloudSecurityService.terminateUserSession(sessionId, currentUserName);
    showNotice(`تم إنهاء وإسقاط جلسة المستخدم (${userName}) فورياً.`);
  };

  const showNotice = (msg: string) => {
    setNoticeMsg(msg);
    setTimeout(() => setNoticeMsg(null), 4000);
  };

  return (
    <div id="granular-session-manager" className="space-y-6">
      {/* Notice Message */}
      {noticeMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{noticeMsg}</span>
        </div>
      )}

      {/* Role Inactivity Thresholds Settings */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                إعدادات مهلة خمول الجلسات حسب الدور الوظيفي (Inactivity Timeout Per Role)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديد وقت الخمول التلقائي قبل قفل الجلسة وإلزام الموظف بإعادة تسجيل الدخول لحماية الحسابات الحساسة.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-500/30 px-3 py-1 rounded-full">
            سياسات نشطة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {roleConfigs.map((item) => (
            <div
              key={item.role}
              className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate max-w-[180px]">
                  {item.roleNameAr}
                </span>
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900">
                  {item.inactivityTimeoutMinutes} دقيقة
                </span>
              </div>

              {/* Slider for Timeout */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>مهلة الخمول:</span>
                  <span>5 - 120 دقيقة</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={item.inactivityTimeoutMinutes}
                  onChange={(e) => handleTimeoutChange(item.role, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Concurrent Sessions Selector */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400">الجلسات المتزامنة المسموحة:</span>
                <select
                  value={item.maxConcurrentSessions}
                  onChange={(e) => handleConcurrentChange(item.role, parseInt(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={1}>جلسة واحدة (صارم)</option>
                  <option value={2}>جلستان</option>
                  <option value={3}>3 جلسات</option>
                  <option value={5}>5 جلسات</option>
                </select>
              </div>

              {item.forceMfaOnNewDevice && (
                <div className="text-[10px] text-emerald-400 bg-emerald-950/40 p-1.5 rounded flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>إلزام المصادقة الثنائية (2FA) للأجهزة الجديدة</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active User Sessions Table & Remote Terminate */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                الجلسات النشطة حالياً في النظام (Live Active User Sessions)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                مراقبة الجلسات المفتوحة وإمكانية الإسقاط الفوري (Kill Session) لأي مستخدم مشبوه.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-500/40">
            {activeSessions.length} جلسات نشطة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold">
                <th className="py-2.5 px-3">المستخدم والدور</th>
                <th className="py-2.5 px-3">الجهاز والمتصفح</th>
                <th className="py-2.5 px-3">الموقع وعنوان IP</th>
                <th className="py-2.5 px-3">وقت بدء الجلسة</th>
                <th className="py-2.5 px-3">مدة الخمول</th>
                <th className="py-2.5 px-3 text-center">إجراء الإسقاط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeSessions.map((session) => (
                <tr
                  key={session.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    session.isCurrentSession ? "bg-indigo-950/20" : ""
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{session.userName}</span>
                      {session.isCurrentSession && (
                        <span className="text-[10px] bg-indigo-900 text-indigo-200 px-1.5 py-0.2 rounded">
                          جلستك الحالية
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{session.roleTitleAr}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 text-slate-400" />
                      <span>{session.device}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-slate-300">{session.location}</div>
                    <div className="font-mono text-indigo-300 text-[11px]">{session.ipAddress}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {new Date(session.loginTime).toLocaleTimeString("ar-SA")}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                        session.idleMinutes > 15
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      }`}
                    >
                      {session.idleMinutes} دقيقة
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {session.isCurrentSession ? (
                      <span className="text-slate-500 text-[11px] italic">غير متاح لجلسة المشرف</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleTerminateSession(session.id, session.userName)}
                        className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 border border-rose-700/50 text-rose-200 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>إنهاء الجلسة</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
