import React, { useState } from "react";
import {
  ActiveSessionItem,
  RegistrationRequestsService,
} from "../services/registrationRequestsService";
import {
  Activity,
  ShieldCheck,
  Trash2,
  Send,
  MessageSquare,
  CheckCircle2,
  Monitor,
  Globe,
  Clock,
  User,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { soundService } from "../services/notificationSoundService";

export const ActiveSessionsView: React.FC = () => {
  const [sessions, setSessions] = useState<ActiveSessionItem[]>(
    RegistrationRequestsService.getActiveSessions()
  );
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    soundService.playSound("SUCCESS_CHIME");
    setTimeout(() => setNotification(null), 3500);
  };

  const handleTerminate = (id: string) => {
    if (!window.confirm("هل أنت متأكد من إنهاء هذه الجلسة عن بُعد؟")) return;
    const updated = RegistrationRequestsService.terminateSession(id);
    setSessions(updated);
    showToast("🚪 تم إنهاء الجلسة بنجاح وعزل المستخدم.");
  };

  const handleSendAlert = (userEmail: string) => {
    showToast(`📩 تم إرسال تنبيه أمني عاجل إلى الجلسة النشطة: ${userEmail}`);
  };

  return (
    <div className="space-y-6 text-right font-sans text-slate-100" dir="rtl">
      {/* Toast */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-950 text-emerald-200 border border-emerald-500/50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <span className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shadow">
              <Activity className="w-8 h-8" />
            </span>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>الجلسات النشطة الآن (Active Sessions Monitor)</span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  {sessions.length} جلسة متصلة
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                مراقبة لحظية لكافة المستخدمين والمنشآت المتصلة بالمنصة، مع إمكانية إنهاء الجلسات أو إرسال تنبيهات أمنية.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-600/50 text-xs font-bold inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> التحديث مباشر (Live)
            </span>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Monitor className="w-4 h-4 text-emerald-400" />
            <span>قائمة الجلسات والمستخدمين المتصلين</span>
          </h3>
          <span className="text-xs text-slate-400">إجمالي الجلسات النشطة: {sessions.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 font-bold">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">المنشأة</th>
                <th className="p-3">المصدر</th>
                <th className="p-3">الدور والصلاحية</th>
                <th className="p-3">المستخدم / البريد</th>
                <th className="p-3">وقت الدخول</th>
                <th className="p-3">آخر نشاط</th>
                <th className="p-3">عنوان IP / الجهاز</th>
                <th className="p-3 text-center">الحالة</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sessions.map((sess, idx) => (
                <tr key={sess.id} className="hover:bg-slate-950/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-emerald-400">{idx + 1}</td>
                  <td className="p-3 font-bold text-white">{sess.tenantName}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sess.source === "admin_created"
                          ? "bg-amber-950 text-amber-300 border border-amber-600/40"
                          : "bg-blue-950 text-blue-300 border border-blue-600/40"
                      }`}
                    >
                      {sess.source === "admin_created" ? "🛡️ الإدارة" : "🌐 تسجيل ذاتي"}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-blue-400">{sess.role}</td>
                  <td className="p-3 font-mono text-slate-300">{sess.userEmail}</td>
                  <td className="p-3 text-slate-300">{sess.loginTime}</td>
                  <td className="p-3 text-slate-400">{sess.lastActivity}</td>
                  <td className="p-3 text-slate-400 font-mono text-[11px]">{sess.ipAddress} - {sess.device}</td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/50">
                      🟢 متصل الآن
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleSendAlert(sess.userEmail)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                        title="إرسال تنبيه للمستخدم"
                      >
                        <Send className="w-3.5 h-3.5 text-blue-400" />
                        تنبيه
                      </button>
                      <button
                        onClick={() => handleTerminate(sess.id)}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow"
                        title="إنهاء الجلسة عن بُعد"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        إنهاء
                      </button>
                    </div>
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
