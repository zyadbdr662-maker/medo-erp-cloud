import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Activity,
  ShieldAlert,
  Key,
  Lock,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Database,
  Shield,
  Layers,
} from "lucide-react";
import {
  cloudSecurityService,
  FailedLoginEvent,
  FirewallBlockStat,
  KeyRotationEvent,
} from "../../services/cloudSecurityService";

export const SecurityAnalyticsDashboard: React.FC = () => {
  const [failedLogins, setFailedLogins] = useState<FailedLoginEvent[]>(() =>
    cloudSecurityService.getFailedLoginAnalytics()
  );
  const [firewallStats, setFirewallStats] = useState<FirewallBlockStat[]>(() =>
    cloudSecurityService.getFirewallBlockStats()
  );
  const [keyRotations, setKeyRotations] = useState<KeyRotationEvent[]>(() =>
    cloudSecurityService.getKeyRotationHistory()
  );

  useEffect(() => {
    const unsub = cloudSecurityService.subscribe(() => {
      setKeyRotations(cloudSecurityService.getKeyRotationHistory());
    });
    return unsub;
  }, []);

  const totalFailedAttempts = failedLogins.reduce((acc, curr) => acc + curr.failedCount, 0);
  const totalBruteForce = failedLogins.reduce((acc, curr) => acc + curr.bruteForceBlocked, 0);
  const totalFirewallBlocks = firewallStats.reduce((acc, curr) => acc + curr.blocksCount, 0);
  const totalRecordsSecured = keyRotations.reduce((acc, curr) => acc + curr.recordsSecured, 0);

  // Key rotation chart data
  const keyRotationChartData = keyRotations.slice(0, 6).map((k) => ({
    name: k.databaseNameAr.length > 20 ? k.databaseNameAr.slice(0, 18) + "..." : k.databaseNameAr,
    records: k.recordsSecured,
    keyId: k.keyId,
    date: k.dateLabel,
  })).reverse();

  return (
    <div id="security-analytics-dashboard" className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-slate-400">محاولات الدخول الفاشلة (24 ساعة)</div>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1">
              {totalFailedAttempts}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">منها {totalBruteForce} هجوم قاموس تم صده</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-slate-400">أحداث حظر جدار الحماية (WAF)</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              {totalFirewallBlocks.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">تم تحييد 100% من التهديدات</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-slate-400">عمليات تدوير مفاتيح KMS</div>
            <div className="text-2xl font-black text-indigo-400 font-mono mt-1">
              {keyRotations.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">تشفير عتادي بمستوى AES-256-GCM</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-slate-400">السجلات المؤمنة بالتشفير</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {totalRecordsSecured.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">خزائن ومصارف وحسابات</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Chart Row 1: Failed Login Attempts Over Time & Firewall Block Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Failed Login Attempts Area Chart */}
        <div className="lg:col-span-7 bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <h4 className="text-sm font-black text-white">
                اتجاهات محاولات الدخول الفاشلة وهجمات التخمين (Failed Logins & Brute Force)
              </h4>
            </div>
            <span className="text-[11px] font-mono text-slate-400">آخر 24 ساعة</span>
          </div>

          <div className="w-full h-72" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={failedLogins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="failedColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="successColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.75rem",
                    color: "#ffffff",
                    fontSize: "12px",
                    textAlign: "right",
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === "failedCount") return [`${value} محاولة`, "محاولات فاشلة"];
                    if (name === "bruteForceBlocked") return [`${value} هجوم`, "هجمات تخمين محظورة"];
                    if (name === "successCount") return [`${value} تسجيل`, "دخول ناجح"];
                    return [value, name];
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  formatter={(value: any) => {
                    if (value === "failedCount") return "محاولات فاشلة";
                    if (value === "bruteForceBlocked") return "هجوم تخمين محظور";
                    if (value === "successCount") return "دخول ناجح";
                    return value;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="failedCount"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#failedColor)"
                />
                <Area
                  type="monotone"
                  dataKey="bruteForceBlocked"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="#f97316"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="successCount"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  fillOpacity={1}
                  fill="url(#successColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Firewall Block Events Pie & Stats */}
        <div className="lg:col-span-5 bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-black text-white">
                أحداث حظر جدار الحماية حسب نوع الهجوم (Firewall Blocks)
              </h4>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">إجمالي {totalFirewallBlocks}</span>
          </div>

          <div className="w-full h-48" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={firewallStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="blocksCount"
                >
                  {firewallStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.75rem",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value} حدث (${item.payload.percentage}%)`,
                    item.payload.categoryNameAr,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown List */}
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {firewallStats.map((stat) => (
              <div
                key={stat.category}
                className="flex items-center justify-between text-xs p-1.5 px-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                  <span className="text-slate-300 truncate max-w-[190px]">{stat.categoryNameAr}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-white font-bold">{stat.blocksCount}</span>
                  <span className="text-slate-500 text-[10px]">({stat.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Row 2: Encryption Key Rotation History Over Time */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            <h4 className="text-sm font-black text-white">
              سجل تدوير مفاتيح التشفير عبر الزمن (Encryption Key Rotation History)
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            تحديث وتوليد المفاتيح التلقائي واليدوي بمستوى AES-256-GCM
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bar Chart of Records Secured per Key Rotation */}
          <div className="lg:col-span-6 w-full h-64" dir="ltr">
            <div className="text-xs text-slate-400 text-right mb-2 pr-2">
              عدد السجلات المؤمنة لكل عملية تدوير مفتاح:
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={keyRotationChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.75rem",
                    color: "#ffffff",
                    fontSize: "12px",
                    textAlign: "right",
                  }}
                  formatter={(value: any) => [`${Number(value).toLocaleString()} سجل`, "السجلات المشفرة"]}
                />
                <Bar dataKey="records" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Rotation Event Timeline Table */}
          <div className="lg:col-span-6 space-y-2 overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="py-2 px-2.5">قاعدة البيانات</th>
                  <th className="py-2 px-2.5">معرف المفتاح الجديد (Key ID)</th>
                  <th className="py-2 px-2.5">التاريخ</th>
                  <th className="py-2 px-2.5">الخوارزمية</th>
                  <th className="py-2 px-2.5 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {keyRotations.map((rot) => (
                  <tr key={rot.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-2.5 font-sans font-bold text-white text-xs">
                      {rot.databaseNameAr}
                    </td>
                    <td className="py-2.5 px-2.5 text-indigo-300 text-[11px] truncate max-w-[150px]">
                      {rot.keyId}
                    </td>
                    <td className="py-2.5 px-2.5 text-slate-400 text-[11px] font-sans">
                      {rot.dateLabel}
                    </td>
                    <td className="py-2.5 px-2.5 text-slate-300 text-[10px]">
                      {rot.algorithm}
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-sans">
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                        ناجح ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
