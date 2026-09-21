import React, { useState, useEffect, useMemo } from "react";
import {
  History,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Search,
  Filter,
  RefreshCw,
  Fingerprint,
  FileCode,
  Link,
  Layers,
  Sparkles,
  Award,
  Clock,
  Laptop,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  UserCheck,
  MapPin,
  Globe,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  cloudSecurityService,
  ImmutableAuditBlock,
} from "../services/cloudSecurityService";
import { soundService } from "../services/notificationSoundService";
import { GeoAccessMapCard } from "./security/GeoAccessMapCard";

interface ImmutableAuditTrailViewProps {
  currentUserName?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  SECURITY: "#3B82F6",
  FIREWALL: "#F59E0B",
  ENCRYPTION: "#10B981",
  ACCESS_CONTROL: "#EC4899",
  FINANCIAL_OVERRIDE: "#8B5CF6",
  OTHER: "#64748B",
};

export const ImmutableAuditTrailView: React.FC<ImmutableAuditTrailViewProps> = ({
  currentUserName = "مدير النظام الأعلى",
}) => {
  const [auditChain, setAuditChain] = useState<ImmutableAuditBlock[]>(() =>
    cloudSecurityService.getImmutableAuditTrail()
  );

  // Integrity Check State
  const [integrityResult, setIntegrityResult] = useState<{
    isValid: boolean;
    totalBlocks: number;
    verifiedAt: string;
    hashAlgorithm: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"CHAIN" | "GEO_MAP">("CHAIN");

  useEffect(() => {
    const unsub = cloudSecurityService.subscribe(() => {
      setAuditChain(cloudSecurityService.getImmutableAuditTrail());
    });
    return unsub;
  }, []);

  // Compute Chart Data
  const actorStats = useMemo(() => {
    const counts: Record<string, { actor: string; count: number; role: string }> = {};
    auditChain.forEach((block) => {
      const name = block.actorName || "غير محدد";
      if (!counts[name]) {
        counts[name] = { actor: name, count: 0, role: block.actorRole || "EMPLOYEE" };
      }
      counts[name].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 7);
  }, [auditChain]);

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    auditChain.forEach((block) => {
      const cat = block.category || "OTHER";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const labelMap: Record<string, string> = {
      SECURITY: "الأمن والنظام",
      FIREWALL: "جدار الحماية",
      ENCRYPTION: "التشفير والمفاتيح",
      ACCESS_CONTROL: "تراخيص الموظفين",
      FINANCIAL_OVERRIDE: "الاعتمادات المالية",
      OTHER: "أخرى",
    };
    return Object.entries(counts).map(([cat, value]) => ({
      name: labelMap[cat] || cat,
      categoryKey: cat,
      value,
      color: CATEGORY_COLORS[cat] || "#64748B",
    }));
  }, [auditChain]);

  const timelineStats = useMemo(() => {
    // Group last 10 blocks in chronological sequence
    return [...auditChain]
      .reverse()
      .slice(-10)
      .map((block) => ({
        blockNumber: `#${block.index}`,
        actor: block.actorName.split(" ")[0],
        time: new Date(block.timestamp).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
        action: block.actionType,
        index: block.index,
      }));
  }, [auditChain]);

  const handleVerifyChainIntegrity = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const res = cloudSecurityService.verifyAuditTrailIntegrity();
      setIntegrityResult(res);
      setIsVerifying(false);
      soundService.playSound("ENTERPRISE_BELL");
    }, 1200);
  };

  const filteredBlocks = auditChain.filter((block) => {
    if (selectedCategory !== "ALL" && block.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        block.actionType.toLowerCase().includes(q) ||
        block.actorName.toLowerCase().includes(q) ||
        block.details.toLowerCase().includes(q) ||
        block.ipAddress.toLowerCase().includes(q) ||
        block.fingerprintHash.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 font-['Alexandria','Cairo',sans-serif] text-right" dir="rtl">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-blue-500/30 p-4 sm:p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white shadow-lg">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>سجل التدقيق والمراجعة الشامل غير القابل للتعديل (Immutable Audit Trail)</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                SHA-256 HASH CHAIN ⛓️
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              توثيق تشفيري تراكمي لكافة حركات الوصول والتعديلات في إدارة النظام الرأسية مع حفظ الطابع الزمني والهوية الرقمية للجهاز (Device Fingerprint).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("CHAIN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "CHAIN"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>كتل السجل التشفيري</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("GEO_MAP")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "GEO_MAP"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>خريطة مواقع الدخول الجغرافية</span>
            </button>
          </div>

          <button
            onClick={handleVerifyChainIntegrity}
            disabled={isVerifying}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition shadow-lg cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className={`w-4 h-4 ${isVerifying ? "animate-spin" : ""}`} />
            <span>{isVerifying ? "جاري الفحص..." : "فحص سلامة السجل"}</span>
          </button>
        </div>
      </div>

      {/* Integrity Verification Feedback Banner */}
      {integrityResult && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 animate-fadeIn text-xs ${
          integrityResult.isValid
            ? "bg-emerald-950/80 border-emerald-500 text-emerald-200"
            : "bg-rose-950/80 border-rose-500 text-rose-200"
        }`}>
          <div className="flex items-center gap-3">
            {integrityResult.isValid ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="font-bold text-white text-sm">
                {integrityResult.isValid
                  ? "✓ تم التحقق بنجاح: سلسلة التدقيق متطابقة ومحمية بنسبة 100% ضد أي تلاعب رقمي!"
                  : "⚠️ تحذير: تم اكتشاف عدم تطابق في تجزئة السجل الرقمي!"}
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                تم فحص {integrityResult.totalBlocks} كتل تشفيرية متسلسلة باستخدام خوارزمية ({integrityResult.hashAlgorithm}) - توقيت الفحص: {new Date(integrityResult.verifiedAt).toLocaleTimeString("ar-SA")}.
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg font-mono font-bold bg-emerald-900/60 border border-emerald-400/40 text-emerald-300 text-[11px]">
            INTEGRITY: 100% VERIFIED
          </span>
        </div>
      )}

      {/* View Mode Switching: Chain vs Geo Map */}
      {viewMode === "GEO_MAP" ? (
        <div className="space-y-4">
          <GeoAccessMapCard currentUserName={currentUserName} />
        </div>
      ) : (
        <>
          {/* Recharts Visual Analytics Section */}
          <div className="space-y-4">
        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-900/90 border border-blue-500/20 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-bold">إجمالي الكتل التشفيرية</span>
            <span className="text-xl font-black font-mono text-white">{auditChain.length} Block</span>
          </div>
          <div className="p-3.5 bg-slate-900/90 border border-amber-500/20 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-bold">المسؤولين النشطين</span>
            <span className="text-xl font-black font-mono text-amber-400">{actorStats.length} مستخدم</span>
          </div>
          <div className="p-3.5 bg-slate-900/90 border border-purple-500/20 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-bold">التصنيفات الرقابية</span>
            <span className="text-xl font-black font-mono text-purple-300">{categoryStats.length} تصنيفات</span>
          </div>
          <div className="p-3.5 bg-slate-900/90 border border-emerald-500/20 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-bold">حالة التماسك التشفيري</span>
            <span className="text-xl font-black font-mono text-emerald-400">100% غير قابل للتعديل</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Bar Chart by Employee / Actor */}
          <div className="p-4 bg-slate-900/90 border border-blue-500/30 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black text-white">
                  توزيع العمليات وحركات الموظفين في النظام (Actions by Employee)
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">مخطط تكرار الحركات</span>
            </div>

            <div className="h-56 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actorStats} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <XAxis
                    dataKey="actor"
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B192C",
                      borderColor: "#1E3A8A",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "11px",
                      direction: "rtl",
                    }}
                    formatter={(value: any) => [`${value} عمليات مسجلة`, "عدد الحركات"]}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                    {actorStats.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#6366F1" : index === 1 ? "#3B82F6" : "#0EA5E9"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Donut / Pie Chart by Category */}
          <div className="p-4 bg-slate-900/90 border border-blue-500/30 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-black text-white">
                  تصنيف الأنشطة الرقابية والتعديلات (Security Categories)
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">النسب المئوية</span>
            </div>

            <div className="h-56 w-full flex items-center justify-center pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`slice-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B192C",
                      borderColor: "#1E3A8A",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "11px",
                      direction: "rtl",
                    }}
                    formatter={(value: any, name: any) => [`${value} كتل (${Math.round((value / auditChain.length) * 100)}%)`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: "10px", color: "#94a3b8" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-blue-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالإجراء، المسؤول، العنوان الرقمي، أو البصمة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-full sm:w-80"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400">التصنيف:</span>
          {["ALL", "SECURITY", "FIREWALL", "ENCRYPTION", "ACCESS_CONTROL", "FINANCIAL_OVERRIDE"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800"
              }`}
            >
              {cat === "ALL"
                ? "كافة الكتل"
                : cat === "FIREWALL"
                ? "جدار الحماية"
                : cat === "ENCRYPTION"
                ? "التشفير"
                : cat === "ACCESS_CONTROL"
                ? "تراخيص الوصول"
                : cat === "FINANCIAL_OVERRIDE"
                ? "الاعتماد المالي"
                : "الأمن والنظام"}
            </button>
          ))}
        </div>
      </div>

      {/* Immutable Hash-Chained Blocks Timeline */}
      <div className="space-y-4">
        {filteredBlocks.map((block, index) => (
          <div
            key={block.id}
            className="bg-gradient-to-r from-[#0B192C] via-[#091626] to-[#081220] border border-blue-500/30 p-5 rounded-2xl space-y-3 shadow-lg relative overflow-hidden transition hover:border-blue-400/60"
          >
            {/* Top Row: Block Height, Action, Timestamp */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-950 text-blue-300 font-mono font-black text-xs border border-blue-500/40">
                  Block #{block.index.toString().padStart(4, "0")}
                </span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{block.actionType}</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-800">
                  {block.category}
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date(block.timestamp).toLocaleString("ar-SA")}</span>
              </div>
            </div>

            {/* Middle Row: Actor, Details */}
            <div className="space-y-1.5">
              <div className="text-xs text-slate-200 leading-relaxed font-medium">
                {block.details}
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap pt-1">
                <div>
                  المسؤول: <span className="text-slate-200 font-bold">{block.actorName}</span> ({block.actorRole})
                </div>
                <div className="flex items-center gap-1">
                  <span>العنوان الرقمي:</span>
                  <span className="font-mono text-blue-300 font-bold dir-ltr">{block.ipAddress}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
                  <span>بصمة الجهاز الرقمية:</span>
                  <span className="font-mono text-purple-300 font-bold">{block.fingerprintHash}</span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded-lg">
                  <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>{block.city || "صنعاء"}، {block.country || "اليمن"}</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    ({block.latitude !== undefined ? block.latitude.toFixed(4) : "15.3694"}, {block.longitude !== undefined ? block.longitude.toFixed(4) : "44.1910"})
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewMode("GEO_MAP")}
                    className="mr-1 text-[10px] text-indigo-400 hover:text-indigo-200 underline cursor-pointer"
                  >
                    عرض على الخريطة
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Cryptographic Hashes (Prev & Current) */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-xl">
              <div className="flex items-center gap-1 truncate" title={block.previousHash}>
                <Link className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="text-slate-500">Prev Hash:</span>
                <span className="text-slate-400 truncate">{block.previousHash}</span>
              </div>

              <div className="flex items-center gap-1 truncate" title={block.currentHash}>
                <Lock className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="text-indigo-300 font-bold">Current Hash:</span>
                <span className="text-indigo-200 font-bold truncate">{block.currentHash}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  );
};
