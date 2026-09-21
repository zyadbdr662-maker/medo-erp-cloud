import React, { useState, useEffect, useMemo } from "react";
import {
  Globe,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Navigation,
  Crosshair,
  Radio,
  Server,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Laptop,
} from "lucide-react";
import {
  cloudSecurityService,
  GeoAccessLog,
} from "../../services/cloudSecurityService";

interface GeoAccessMapCardProps {
  currentUserName?: string;
}

export const GeoAccessMapCard: React.FC<GeoAccessMapCardProps> = ({
  currentUserName = "مدير النظام الأعلى",
}) => {
  const [logs, setLogs] = useState<GeoAccessLog[]>(() =>
    cloudSecurityService.getGeoAccessLogs()
  );
  const [selectedLog, setSelectedLog] = useState<GeoAccessLog | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "AUTHORIZED" | "BLOCKED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    const unsub = cloudSecurityService.subscribe(() => {
      setLogs(cloudSecurityService.getGeoAccessLogs());
    });
    return unsub;
  }, []);

  // Set initial selected log if none
  useEffect(() => {
    if (!selectedLog && logs.length > 0) {
      setSelectedLog(logs[0]);
    }
  }, [logs, selectedLog]);

  // Coordinate projection from Lat/Lng to SVG [0, 800] x [0, 420]
  // Equirectangular projection focused on Middle East & Europe/Global
  // Min Longitude: -20, Max Longitude: 70
  // Min Latitude: 10, Max Latitude: 65
  const projectCoords = (lat: number, lng: number) => {
    // Clamping and normalized mapping
    const minLng = -20;
    const maxLng = 70;
    const minLat = 10;
    const maxLat = 65;

    const x = ((lng - minLng) / (maxLng - minLng)) * 740 + 30;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 360 + 30;

    return { x: Math.max(20, Math.min(780, x)), y: Math.max(20, Math.min(400, y)) };
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterType === "AUTHORIZED" && log.status !== "AUTHORIZED") return false;
      if (filterType === "BLOCKED" && log.status !== "BLOCKED") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.city.toLowerCase().includes(q) ||
          log.country.toLowerCase().includes(q) ||
          log.userName.toLowerCase().includes(q) ||
          log.ipAddress.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, filterType, searchQuery]);

  // Simulate or capture real GPS coordinates
  const handleSimulateLoginWithCoordinates = () => {
    setIsLocating(true);
    setActionNotice("جاري فحص الإحداثيات الجغرافية عبر السحابة السيادية...");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newLog = cloudSecurityService.logGeoAccessAttempt({
            userName: `${currentUserName} (Live Session)`,
            userRole: "SUPER_ADMIN",
            latitude: lat,
            longitude: lng,
            city: "الموقع الجغرافي المباشر",
            country: "اليمن / المحيط الجغرافي",
            countryCode: "YE",
            ipAddress: "197.230.14.99",
            isp: "Enterprise Secured Optical Ingress",
            device: navigator.userAgent.includes("Mac") ? "Apple Mac OS" : "Enterprise PC",
            browser: "Secure Browser Client",
            status: "AUTHORIZED",
            riskScore: 3,
          });
          setSelectedLog(newLog);
          setIsLocating(false);
          setActionNotice(`✓ تم تسجيل وتوثيق إحداثيات الدخول الجغرافي بنجاح (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          setTimeout(() => setActionNotice(null), 4000);
        },
        () => {
          // Fallback to Sana'a HQ Node coordinates
          const newLog = cloudSecurityService.logGeoAccessAttempt({
            userName: `${currentUserName} (HQ Core Gateway)`,
            userRole: "SUPER_ADMIN",
            latitude: 15.3694 + (Math.random() - 0.5) * 0.05,
            longitude: 44.191 + (Math.random() - 0.5) * 0.05,
            city: "صنعاء - المقر الرئيسي",
            country: "اليمن",
            countryCode: "YE",
            ipAddress: "197.230.14.88",
            isp: "YemenNet Sovereign Fiber Core",
            device: "MacBook Pro M3 Enterprise",
            browser: "Safari Enterprise v18.0",
            status: "AUTHORIZED",
            riskScore: 4,
          });
          setSelectedLog(newLog);
          setIsLocating(false);
          setActionNotice("✓ تم تسجيل إحداثيات الدخول الجغرافي للمقر الرئيسي وتوثيقها فوراً");
          setTimeout(() => setActionNotice(null), 4000);
        },
        { timeout: 4000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const authorizedCount = logs.filter((l) => l.status === "AUTHORIZED").length;
  const blockedCount = logs.filter((l) => l.status === "BLOCKED").length;

  return (
    <div id="geo-access-map-card" className="space-y-5">
      {/* Top Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">إجمالي محاولات الدخول المرصودة</div>
            <div className="text-2xl font-black text-white font-mono mt-1">{logs.length}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">وصول جغرافي مصرح به</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{authorizedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">محاولات محظورة (WAF & Geo-Fencing)</div>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1">{blockedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-center">
          <button
            id="btn-simulate-gps-login"
            type="button"
            onClick={handleSimulateLoginWithCoordinates}
            disabled={isLocating}
            className="w-full h-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
          >
            {isLocating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Crosshair className="w-4 h-4" />
            )}
            <span>تسجيل دخول بإحداثيات حية</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-200 text-xs flex items-center gap-2 animate-fade-in">
          <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Map & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visual Vector Radar Map */}
        <div className="lg:col-span-8 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-2xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-black text-white">
                خريطة التتبع الجغرافي للمصادقة وتحديد المواقع اللحظية
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>مصرح</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-ping" />
                <span>محظور / هجوم</span>
              </span>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full h-[380px] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
            {/* Grid background & Radar concentric rings */}
            <svg
              viewBox="0 0 800 420"
              className="w-full h-full object-cover select-none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                </radialGradient>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
              </defs>

              {/* Grid and Ambient Glow */}
              <rect width="800" height="420" fill="#020617" />
              <rect width="800" height="420" fill="url(#grid)" />
              <circle cx="480" cy="300" r="280" fill="url(#radarGlow)" />

              {/* Radar Rings centered on Middle East */}
              <circle cx="480" cy="300" r="60" fill="none" stroke="#334155" strokeWidth="0.75" strokeDasharray="3,3" />
              <circle cx="480" cy="300" r="140" fill="none" stroke="#334155" strokeWidth="0.75" strokeDasharray="3,3" />
              <circle cx="480" cy="300" r="220" fill="none" stroke="#334155" strokeWidth="0.75" strokeDasharray="3,3" />

              {/* Stylized Coastlines / Continent outlines representation */}
              {/* Arabian Peninsula & Red Sea */}
              <path
                d="M 420 230 Q 430 260 440 280 T 450 330 L 460 360 L 510 350 L 540 310 L 530 280 L 480 250 Z"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="1.2"
              />
              {/* North Africa & Egypt */}
              <path
                d="M 280 200 L 410 200 L 420 260 L 360 310 L 290 300 Z"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="1.2"
              />
              {/* Europe */}
              <path
                d="M 240 100 L 340 90 L 400 130 L 370 180 L 280 180 L 220 140 Z"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="1.2"
              />
              {/* Russia / Eurasia */}
              <path
                d="M 420 70 L 650 60 L 680 140 L 520 160 L 430 130 Z"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="1.2"
              />

              {/* Connection Lines from selected to Yemen Hub */}
              {selectedLog && (
                (() => {
                  const targetPt = projectCoords(selectedLog.latitude, selectedLog.longitude);
                  const hqPt = projectCoords(15.3694, 44.191);
                  return (
                    <g>
                      <line
                        x1={targetPt.x}
                        y1={targetPt.y}
                        x2={hqPt.x}
                        y2={hqPt.y}
                        stroke={selectedLog.status === "AUTHORIZED" ? "#10b981" : "#ef4444"}
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                        className="animate-pulse"
                      />
                    </g>
                  );
                })()
              )}

              {/* Access Location Markers */}
              {filteredLogs.map((log) => {
                const { x, y } = projectCoords(log.latitude, log.longitude);
                const isSelected = selectedLog?.id === log.id;
                const isAuth = log.status === "AUTHORIZED";

                return (
                  <g
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="cursor-pointer transition-transform duration-200 hover:scale-125"
                    style={{ transformOrigin: `${x}px ${y}px` }}
                  >
                    {/* Pulsing ring for blocked or selected */}
                    {(!isAuth || isSelected) && (
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 16 : 10}
                        fill="none"
                        stroke={isAuth ? "#10b981" : "#ef4444"}
                        strokeWidth="1.5"
                        className="animate-ping"
                        opacity="0.6"
                      />
                    )}

                    {/* Marker Outer Circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 9 : 6}
                      fill={isAuth ? "#10b981" : "#ef4444"}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />

                    {/* City Label */}
                    <text
                      x={x + 10}
                      y={y + 4}
                      fill="#e2e8f0"
                      fontSize="10"
                      fontFamily="'Alexandria', sans-serif"
                      fontWeight="bold"
                      className="select-none pointer-events-none drop-shadow"
                    >
                      {log.city}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* In-Map Floating Legend */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] text-slate-300 backdrop-blur-sm flex items-center gap-2">
              <MapPin className="w-3 h-3 text-blue-400" />
              <span>انقر على أي نقطة على الخريطة لعرض تفاصيل المصادقة وعنوان IP</span>
            </div>
          </div>
        </div>

        {/* Detail Panel of Selected Attempt */}
        <div className="lg:col-span-4 bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          {selectedLog ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400">تفاصيل نقطة الوصول المحددة</span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    selectedLog.status === "AUTHORIZED"
                      ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                      : "bg-rose-950 text-rose-300 border-rose-500/40"
                  }`}
                >
                  {selectedLog.status === "AUTHORIZED" ? "وصول مصرح ✓" : "محظور أمنياً ✕"}
                </span>
              </div>

              {/* City & Country Banner */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedLog.status === "AUTHORIZED"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                      : "bg-rose-950 text-rose-400 border border-rose-800/40"
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    {selectedLog.city}، {selectedLog.country}
                  </h4>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {selectedLog.latitude.toFixed(4)}° N, {selectedLog.longitude.toFixed(4)}° E
                  </div>
                </div>
              </div>

              {/* Key Attributes */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/70">
                  <span className="text-slate-400">المستخدم / الهوية:</span>
                  <span className="font-bold text-white truncate max-w-[180px]">{selectedLog.userName}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/70">
                  <span className="text-slate-400">عنوان IP العام:</span>
                  <span className="font-mono text-indigo-300 font-bold">{selectedLog.ipAddress}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/70">
                  <span className="text-slate-400">مزود خدمة الإنترنت (ISP):</span>
                  <span className="text-slate-300 truncate max-w-[170px]">{selectedLog.isp}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/70">
                  <span className="text-slate-400">الجهاز والمتصفح:</span>
                  <span className="text-slate-300 truncate max-w-[170px]">{selectedLog.device}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/70">
                  <span className="text-slate-400">درجة المخاطرة (Risk Score):</span>
                  <span
                    className={`font-bold font-mono px-2 py-0.5 rounded ${
                      selectedLog.riskScore > 50
                        ? "bg-rose-950 text-rose-300 border border-rose-800"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    }`}
                  >
                    {selectedLog.riskScore} / 100
                  </span>
                </div>

                {selectedLog.blockReason && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-200">
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>سبب الحظر الإجباري:</span>
                    </div>
                    <div className="text-[11px] leading-relaxed">{selectedLog.blockReason}</div>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span>تاريخ المحاولة:</span>
                <span>{new Date(selectedLog.timestamp).toLocaleTimeString("ar-SA")}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              حدد أي نقطة على الخريطة لعرض تفاصيل الاتصال الجغرافي
            </div>
          )}
        </div>
      </div>

      {/* Access Attempts Table & Filter */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-black text-white">
              سجل محاولات الوصول الجغرافي المسجلة في السحابة
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Buttons */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                  filterType === "ALL" ? "bg-slate-800 text-white" : "text-slate-400"
                }`}
              >
                الكل ({logs.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("AUTHORIZED")}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                  filterType === "AUTHORIZED" ? "bg-emerald-900/80 text-emerald-200" : "text-slate-400"
                }`}
              >
                المصرح ({authorizedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("BLOCKED")}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                  filterType === "BLOCKED" ? "bg-rose-900/80 text-rose-200" : "text-slate-400"
                }`}
              >
                المحظور ({blockedCount})
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالمدينة أو IP..."
                className="bg-slate-950 border border-slate-800 rounded-lg pr-8 pl-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold">
                <th className="py-2.5 px-3">المدينة / الدولة</th>
                <th className="py-2.5 px-3">المستخدم والدور</th>
                <th className="py-2.5 px-3">الإحداثيات الجغرافية</th>
                <th className="py-2.5 px-3">عنوان IP والشبكة</th>
                <th className="py-2.5 px-3">درجة المخاطرة</th>
                <th className="py-2.5 px-3 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-950/30" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                      <MapPin
                        className={`w-3.5 h-3.5 ${
                          log.status === "AUTHORIZED" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      />
                      <span>{log.city}، {log.country}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{log.userName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                      {log.latitude.toFixed(3)}, {log.longitude.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-indigo-300 text-[11px]">{log.ipAddress}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                          log.riskScore > 50
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        }`}
                      >
                        {log.riskScore}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.status === "AUTHORIZED"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-600/40"
                            : "bg-rose-950 text-rose-300 border border-rose-600/40"
                        }`}
                      >
                        {log.status === "AUTHORIZED" ? "مصرح ✓" : "حظر ✕"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
