import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  Globe,
  Radio,
  Server,
  Database,
  Cpu,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Sparkles,
  Layers,
  FileCode2,
  Zap,
  HardDrive,
  Table,
  Fingerprint,
  BarChart3,
  MapPin,
  Clock,
} from "lucide-react";
import {
  cloudSecurityService,
  FirewallConfig,
  EncryptionAtRestConfig,
  EnterpriseDatabaseEncryptionStatus,
  IpRule,
} from "../services/cloudSecurityService";
import { BiometricWebAuthnConfigCard } from "./security/BiometricWebAuthnConfigCard";
import { GeoAccessMapCard } from "./security/GeoAccessMapCard";
import { SecurityAnalyticsDashboard } from "./security/SecurityAnalyticsDashboard";
import { GranularSessionManager } from "./security/GranularSessionManager";
import { UnencryptedDatabasesAlertBanner } from "./security/UnencryptedDatabasesAlertBanner";

interface CloudSecurityCenterViewProps {
  currentUserName?: string;
}

export const CloudSecurityCenterView: React.FC<CloudSecurityCenterViewProps> = ({
  currentUserName = "مدير النظام الأعلى",
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    | "FIREWALL"
    | "ENCRYPTION_AT_REST"
    | "BIOMETRIC_WEBAUTHN"
    | "SECURITY_ANALYTICS"
    | "GEO_ACCESS_MAP"
    | "SESSION_MANAGEMENT"
  >("FIREWALL");
  const [firewallConfig, setFirewallConfig] = useState<FirewallConfig>(() =>
    cloudSecurityService.getFirewallConfig()
  );
  const [encryptionConfig, setEncryptionConfig] = useState<EncryptionAtRestConfig>(() =>
    cloudSecurityService.getEncryptionConfig()
  );
  const [databases, setDatabases] = useState<EnterpriseDatabaseEncryptionStatus[]>(() =>
    cloudSecurityService.getEnterpriseDatabases()
  );
  const [rotatingDbId, setRotatingDbId] = useState<string | null>(null);

  // New IP Rule Modal / Form State
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [newIpOrCidr, setNewIpOrCidr] = useState("");
  const [newRuleDesc, setNewRuleDesc] = useState("");
  const [newRuleType, setNewRuleType] = useState<"WHITELIST" | "BLACKLIST">("WHITELIST");
  const [newRuleThreat, setNewRuleThreat] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("HIGH");

  // KMS Rotation feedback
  const [rotationMsg, setRotationMsg] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = cloudSecurityService.subscribe(() => {
      setFirewallConfig(cloudSecurityService.getFirewallConfig());
      setEncryptionConfig(cloudSecurityService.getEncryptionConfig());
      setDatabases(cloudSecurityService.getEnterpriseDatabases());
    });
    return unsub;
  }, []);

  const handleToggleFirewall = (enabled: boolean) => {
    const updated = cloudSecurityService.updateFirewallConfig({ enabled }, currentUserName);
    setFirewallConfig(updated);
  };

  const handleToggleWaf = (wafEnabled: boolean) => {
    const updated = cloudSecurityService.updateFirewallConfig({ wafEnabled }, currentUserName);
    setFirewallConfig(updated);
  };

  const handleToggleSqlProtect = (sqlInjectionProtection: boolean) => {
    const updated = cloudSecurityService.updateFirewallConfig(
      { sqlInjectionProtection },
      currentUserName
    );
    setFirewallConfig(updated);
  };

  const handleToggleGeoFencing = (geoFencingEnabled: boolean) => {
    const updated = cloudSecurityService.updateFirewallConfig(
      { geoFencingEnabled },
      currentUserName
    );
    setFirewallConfig(updated);
  };

  const handleRateLimitChange = (rateLimitPerMinute: number) => {
    const updated = cloudSecurityService.updateFirewallConfig(
      { rateLimitPerMinute },
      currentUserName
    );
    setFirewallConfig(updated);
  };

  const handleAddIpRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpOrCidr.trim()) return;

    cloudSecurityService.addIpRule(
      {
        ipOrCidr: newIpOrCidr.trim(),
        description: newRuleDesc.trim() || "قاعدة جدار حماية مخصصة",
        type: newRuleType,
        enabled: true,
        createdBy: currentUserName,
        threatLevel: newRuleType === "BLACKLIST" ? newRuleThreat : "LOW",
      },
      currentUserName
    );

    setNewIpOrCidr("");
    setNewRuleDesc("");
    setIsAddRuleOpen(false);
    setSaveSuccessMsg("تم إضافة قاعدة جدار الحماية بنجاح وتطبيقها فوراً!");
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleRemoveRule = (ruleId: string) => {
    cloudSecurityService.removeIpRule(ruleId, currentUserName);
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    cloudSecurityService.toggleIpRule(ruleId, enabled, currentUserName);
  };

  // KMS Key Rotation Action
  const handleRotateKmsKeyNow = () => {
    setIsRotating(true);
    setTimeout(() => {
      const res = cloudSecurityService.rotateMasterKmsKey(currentUserName);
      setIsRotating(false);
      setRotationMsg(`تم تدوير مفتاح التشفير الرئيسي بنجاح! المعرف الجديد: ${res.newKeyId}`);
      setTimeout(() => setRotationMsg(null), 6000);
    }, 1200);
  };

  // Single Database Key Rotation Action
  const handleRotateSingleDatabaseKey = (dbId: string, nameAr: string) => {
    setRotatingDbId(dbId);
    setTimeout(() => {
      const res = cloudSecurityService.rotateDatabaseEncryptionKey(dbId, currentUserName);
      setRotatingDbId(null);
      if (res.success) {
        setRotationMsg(`🔄 تم تدوير وتوليد مفتاح جديد بنجاح لقاعدة: ${nameAr} (${res.newKeyId})`);
        setTimeout(() => setRotationMsg(null), 6000);
      }
    }, 1000);
  };

  const handleToggleDbEncryption = (dbId: string, currentStatus: boolean) => {
    cloudSecurityService.toggleDatabaseEncryption(dbId, !currentStatus, currentUserName);
  };

  const handleToggleColumnEncryption = (
    key: keyof EncryptionAtRestConfig["columnLevelEncryption"],
    val: boolean
  ) => {
    const updatedCol = {
      ...encryptionConfig.columnLevelEncryption,
      [key]: val,
    };
    const updated = cloudSecurityService.updateEncryptionConfig(
      { columnLevelEncryption: updatedCol },
      currentUserName
    );
    setEncryptionConfig(updated);
  };

  return (
    <div className="space-y-6 font-['Alexandria','Cairo',sans-serif] text-right" dir="rtl">
      {/* Sub Header & Sub Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-blue-500/30 p-4 sm:p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>مركز الأمن السحابي وحماية البيانات</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                ACTIVE SHIELD 🛡️
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              إدارة سياسات جدار الحماية (Firewall)، وتشفير قواعد البيانات في حالة الراحة (Encryption at Rest) بمستوى AES-256-GCM.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <button
            id="tab-firewall"
            type="button"
            onClick={() => setActiveSubTab("FIREWALL")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "FIREWALL"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>جدار الحماية (Firewall)</span>
          </button>

          <button
            id="tab-encryption"
            type="button"
            onClick={() => setActiveSubTab("ENCRYPTION_AT_REST")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "ENCRYPTION_AT_REST"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>تشفير البيانات (AES-256)</span>
          </button>

          <button
            id="tab-biometric"
            type="button"
            onClick={() => setActiveSubTab("BIOMETRIC_WEBAUTHN")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "BIOMETRIC_WEBAUTHN"
                ? "bg-purple-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>التحقق البيومتري (WebAuthn)</span>
          </button>

          <button
            id="tab-analytics"
            type="button"
            onClick={() => setActiveSubTab("SECURITY_ANALYTICS")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "SECURITY_ANALYTICS"
                ? "bg-teal-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>التحليلات الأمنية (Analytics)</span>
          </button>

          <button
            id="tab-geomap"
            type="button"
            onClick={() => setActiveSubTab("GEO_ACCESS_MAP")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "GEO_ACCESS_MAP"
                ? "bg-sky-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>الخريطة الجغرافية (Geo Map)</span>
          </button>

          <button
            id="tab-sessions"
            type="button"
            onClick={() => setActiveSubTab("SESSION_MANAGEMENT")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "SESSION_MANAGEMENT"
                ? "bg-amber-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>إدارة الجلسات (Sessions)</span>
          </button>
        </div>
      </div>

      {/* Real-time Encryption Monitor & Critical Notification Listener */}
      <UnencryptedDatabasesAlertBanner currentUserName={currentUserName} />

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-2xl text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-bold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* ========================================== */}
      {/* 1. FIREWALL POLICIES TAB */}
      {/* ========================================== */}
      {activeSubTab === "FIREWALL" && (
        <div className="space-y-6">
          {/* Top Quick Stats & Master Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Master Firewall Status */}
            <div className="bg-slate-900/90 border border-blue-500/20 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-bold text-slate-200">حالة جدار الحماية (Master Firewall)</span>
                </div>
                <button
                  onClick={() => handleToggleFirewall(!firewallConfig.enabled)}
                  className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                    firewallConfig.enabled
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-rose-900/80 text-rose-300 border border-rose-600"
                  }`}
                >
                  {firewallConfig.enabled ? "نشط ومفعّل ✓" : "معطل ✗"}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                مراقبة وتصفية كافة حزم البيانات الواردة لمنع الاختراقات وتأمين واجهات برمجة التطبيقات السحابية.
              </p>
            </div>

            {/* WAF & SQL Injection Shield */}
            <div className="bg-slate-900/90 border border-blue-500/20 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">حماية حقن الاستعلامات (WAF & SQL Shield)</span>
                </div>
                <button
                  onClick={() => handleToggleSqlProtect(!firewallConfig.sqlInjectionProtection)}
                  className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                    firewallConfig.sqlInjectionProtection
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {firewallConfig.sqlInjectionProtection ? "حماية مشددة ✓" : "معطل"}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                فحص ومعالجة مدخلات النماذج لمنع هجمات الحقن (SQLi) والبرمجة النصية عبر المواقع (XSS).
              </p>
            </div>

            {/* Geo-Fencing Status */}
            <div className="bg-slate-900/90 border border-blue-500/20 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">الفلترة الجغرافية (Geo-Fencing)</span>
                </div>
                <button
                  onClick={() => handleToggleGeoFencing(!firewallConfig.geoFencingEnabled)}
                  className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                    firewallConfig.geoFencingEnabled
                      ? "bg-amber-600 text-white shadow-md"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {firewallConfig.geoFencingEnabled ? "مقيّد بالمنطقة ✓" : "دولي مفتوح"}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                حظر الوصول التلقائي من خارج الدول المعتمدة ({firewallConfig.allowedCountryCodes.join("، ")}).
              </p>
            </div>
          </div>

          {/* Rate Limiting & Anti-DDoS Settings */}
          <div className="bg-slate-900/90 border border-blue-500/30 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-black text-white">
                  محدد معدل الطلبات ومكافحة هجمات حجب الخدمة (Rate Limiting & Anti-DDoS)
                </h3>
              </div>
              <span className="text-xs font-mono text-blue-300 bg-blue-950/60 px-3 py-1 rounded-lg border border-blue-500/40">
                الحالي: {firewallConfig.rateLimitPerMinute} طلب / دقيقة لكل جهاز
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {[60, 120, 180, 300].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleRateLimitChange(rate)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    firewallConfig.rateLimitPerMinute === rate
                      ? "bg-blue-600/30 border-blue-400 text-white font-black shadow-lg"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/80"
                  }`}
                >
                  <div className="text-sm font-mono font-black text-blue-300">{rate} req/min</div>
                  <div className="text-[11px] mt-0.5">
                    {rate === 60 ? "وضع أمني فائق الصرامة" : rate === 180 ? "الوضع القياسي الموصى به" : rate === 300 ? "وضع الشركات الكبرى" : "وضع متوسط"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* IP Rules Management (Whitelist / Blacklist) */}
          <div className="bg-slate-900/90 border border-blue-500/30 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-black text-white">قواعد العناوين الرقمية (IP Whitelist / Blacklist)</h3>
                  <p className="text-[11px] text-slate-400">إدارة العناوين المصرح لها بالدخول أو المحظورة تلقائياً</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddRuleOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة عنوان أو نطاق جديد (Add Rule)</span>
              </button>
            </div>

            {/* Rules Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                    <th className="p-3 font-bold">النوع</th>
                    <th className="p-3 font-bold font-mono">العنوان الرقمي / النطاق</th>
                    <th className="p-3 font-bold">البيان / الوصف</th>
                    <th className="p-3 font-bold">مستوى التهديد</th>
                    <th className="p-3 font-bold">عدد مرات المطابقة</th>
                    <th className="p-3 font-bold text-center">الحالة</th>
                    <th className="p-3 font-bold text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {firewallConfig.ipRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3">
                        {rule.type === "WHITELIST" ? (
                          <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                            قائمة بيضاء ✓
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-rose-950 text-rose-300 border border-rose-600/40">
                            قائمة سوداء ✗
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-200 dir-ltr text-right">
                        {rule.ipOrCidr}
                      </td>
                      <td className="p-3 text-slate-300">{rule.description}</td>
                      <td className="p-3">
                        {rule.type === "BLACKLIST" ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            rule.threatLevel === "CRITICAL"
                              ? "bg-rose-900/60 text-rose-300 border border-rose-500"
                              : "bg-amber-900/60 text-amber-300 border border-amber-500"
                          }`}>
                            {rule.threatLevel || "HIGH"}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">آمن (Trusted)</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-300">{rule.hitsCount.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleRule(rule.id, !rule.enabled)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                            rule.enabled
                              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-slate-800 text-slate-500 border border-slate-700"
                          }`}
                        >
                          {rule.enabled ? "نشط" : "معطل"}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleRemoveRule(rule.id)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition cursor-pointer"
                          title="حذف القاعدة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 2. ENCRYPTION AT REST TAB */}
      {/* ========================================== */}
      {activeSubTab === "ENCRYPTION_AT_REST" && (
        <div className="space-y-6">
          {/* Main Encryption Banner */}
          <div className="bg-gradient-to-r from-indigo-950/90 via-slate-900 to-blue-950/90 border border-indigo-500/40 p-6 rounded-3xl space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-400/50 flex items-center justify-center text-indigo-300 shadow-xl">
                  <Database className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-white">تشفير قواعد البيانات في حالة الراحة (Encryption at Rest)</h3>
                    <span className="px-3 py-0.5 rounded-full text-xs font-black bg-indigo-500 text-white shadow-md">
                      AES-256-GCM Hardware-Grade 🔒
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    يتم تشفير كافة جداول الأستاذ العام، أرصدة الحسابات البنكية، أرقام الهويات، وبيانات السجلات الحساسة تلقائياً في التخزين الدائم لضمان عدم إمكانية قراءتها ماديًا.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRotateKmsKeyNow}
                  disabled={isRotating}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition shadow-lg cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRotating ? "animate-spin" : ""}`} />
                  <span>تدوير وتجديد مفتاح التشفير KMS الآن</span>
                </button>
              </div>
            </div>

            {rotationMsg && (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-2xl text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-bold">{rotationMsg}</span>
              </div>
            )}

            {/* KMS Key Card Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">معرف مفتاح KMS الرئيسي:</div>
                <div className="text-xs font-mono font-bold text-indigo-300 truncate" title={encryptionConfig.kmsMasterKeyId}>
                  {encryptionConfig.kmsMasterKeyId}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">تاريخ آخر تدوير للمفتاح:</div>
                <div className="text-xs font-mono text-slate-200">
                  {new Date(encryptionConfig.lastRotatedAt).toLocaleDateString("ar-SA")}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">التدوير التلقائي القادم:</div>
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  {new Date(encryptionConfig.nextRotationScheduledAt).toLocaleDateString("ar-SA")} (كل {encryptionConfig.keyRotationIntervalDays} يوم)
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">بصمة سلامة التخزين (Checksum):</div>
                <div className="text-xs font-mono text-slate-400 truncate font-bold">
                  {encryptionConfig.storageIntegrityChecksum.slice(0, 16)}...
                </div>
              </div>
            </div>
          </div>

          {/* Column-Level Encryption & Zero-Knowledge Hashing */}
          <div className="bg-slate-900/90 border border-blue-500/30 p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-black text-white">تشفير الحقول الحساسة (Column-Level Field Encryption)</h3>
                <p className="text-[11px] text-slate-400">تطبيق التشفير المجهري المنفصل لكل حقل مالي أو أمني في قاعدة البيانات</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                {
                  key: "generalLedgerAmounts" as const,
                  title: "مبالغ قيود الأستاذ العام واليومية",
                  desc: "تشفير مبالغ المدين والدائن في التخزين لمنع التلاعب المباشر بالسجلات",
                },
                {
                  key: "passwordsAndPins" as const,
                  title: "كلمات المرور ورموز PIN المالية",
                  desc: "تطبيق التجزئة الصفرية المعرفة (Zero-Knowledge Salted Hash) بدون تخزين النص الأصلي",
                },
                {
                  key: "identityAndPassports" as const,
                  title: "أرقام الهويات وجوازات السفر والعملاء",
                  desc: "حماية بيانات التحقق من الهوية (KYC) بتشفير فائق مطابق لمعايير GDPR",
                },
                {
                  key: "clientBankDetails" as const,
                  title: "أرقام الحسابات البنكية والـ IBAN",
                  desc: "تشفير بيانات البطاقات والحسابات المصرفية وفق معيار PCI-DSS",
                },
                {
                  key: "auditLogsChaining" as const,
                  title: "سلاسل سجلات التدقيق والمراجعة",
                  desc: "ربط كل حركة بسلسلة التشفير التراكمي (Cryptographic Hash Chaining)",
                },
              ].map((item) => {
                const isEnabled = encryptionConfig.columnLevelEncryption[item.key];
                return (
                  <div
                    key={item.key}
                    className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-200">{item.title}</div>
                      <div className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => handleToggleColumnEncryption(item.key, !isEnabled)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        isEnabled
                          ? "bg-indigo-600 text-white shadow"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {isEnabled ? "مفعّل ✓" : "معطل"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enterprise Databases Encryption & Key Rotation Control */}
          <div className="bg-slate-900/90 border border-blue-500/30 p-5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>حالة تشفير قواعد البيانات المؤسسية وتدوير المفاتيح (Enterprise Databases Encryption)</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {databases.filter((d) => d.isEncrypted).length} من {databases.length} مشفرة 🔒
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    مراقبة حالة التشفير في حالة الراحة لكل قاعدة بيانات مالية أو أمنية، مع إمكانية إعادة تدوير مفتاح التشفير (Rotation) بضغطة زر واحدة.
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>إجمالي السجلات المشفرة:</span>
                <span className="font-mono font-black text-indigo-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {databases.reduce((acc, d) => acc + d.recordsCount, 0).toLocaleString()} سجل
                </span>
              </div>
            </div>

            {/* Databases Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              {databases.map((db) => {
                const isThisRotating = rotatingDbId === db.id;
                return (
                  <div
                    key={db.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 ${
                      db.isEncrypted
                        ? "bg-slate-950/80 border-indigo-500/30 hover:border-indigo-500/60 shadow-lg"
                        : "bg-red-950/20 border-red-500/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            db.isEncrypted
                              ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                              : "bg-red-600/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {db.isEncrypted ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs font-black text-white leading-snug">{db.nameAr}</div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                            <span>الجدول: {db.tableName}</span>
                            <span>•</span>
                            <span>{db.sizeMb} MB</span>
                            <span>•</span>
                            <span>{db.recordsCount.toLocaleString()} سجل</span>
                          </div>
                        </div>
                      </div>

                      {/* Encryption Status Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                          db.isEncrypted
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-red-500/20 text-red-300 border border-red-500/40"
                        }`}
                      >
                        {db.isEncrypted ? "مشفرة (AES-256)" : "غير مشفرة"}
                      </span>
                    </div>

                    {/* Key and Rotation info */}
                    <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block mb-0.5">مفتاح التشفير الحالي (KMS Key ID):</span>
                        <span className="font-mono text-indigo-300 font-bold truncate block" title={db.keyId}>
                          {db.keyId}
                        </span>
                      </div>
                      <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block mb-0.5">آخر تدوير للمفتاح:</span>
                        <span className="font-mono text-slate-300 block">
                          {new Date(db.lastRotatedAt).toLocaleString("ar-SA")}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleDbEncryption(db.id, db.isEncrypted)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            db.isEncrypted
                              ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                          }`}
                        >
                          {db.isEncrypted ? "إيقاف التشفير" : "تفعيل التشفير الآن 🔒"}
                        </button>
                      </div>

                      <button
                        onClick={() => handleRotateSingleDatabaseKey(db.id, db.nameAr)}
                        disabled={isThisRotating || !db.isEncrypted}
                        className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-lg text-[11px] font-black flex items-center gap-1.5 transition shadow cursor-pointer disabled:opacity-40"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isThisRotating ? "animate-spin" : ""}`} />
                        <span>{isThisRotating ? "جارٍ التدوير..." : "إعادة وتدوير المفتاح (Rotate Key)"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3. BIOMETRIC WEBAUTHN APPROVALS TAB */}
      {/* ========================================== */}
      {activeSubTab === "BIOMETRIC_WEBAUTHN" && (
        <div className="space-y-6">
          <BiometricWebAuthnConfigCard currentUserName={currentUserName} />
        </div>
      )}

      {/* ========================================== */}
      {/* 4. SECURITY ANALYTICS DASHBOARD TAB */}
      {/* ========================================== */}
      {activeSubTab === "SECURITY_ANALYTICS" && (
        <div className="space-y-6">
          <SecurityAnalyticsDashboard />
        </div>
      )}

      {/* ========================================== */}
      {/* 5. GEOGRAPHIC ACCESS & LOGIN MAP TAB */}
      {/* ========================================== */}
      {activeSubTab === "GEO_ACCESS_MAP" && (
        <div className="space-y-6">
          <GeoAccessMapCard currentUserName={currentUserName} />
        </div>
      )}

      {/* ========================================== */}
      {/* 6. GRANULAR SESSION MANAGEMENT TAB */}
      {/* ========================================== */}
      {activeSubTab === "SESSION_MANAGEMENT" && (
        <div className="space-y-6">
          <GranularSessionManager currentUserName={currentUserName} />
        </div>
      )}

      {/* Add IP Rule Modal */}
      {isAddRuleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-right" dir="rtl">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              <span>إضافة قاعدة IP جديدة لجدار الحماية</span>
            </h3>

            <form onSubmit={handleAddIpRuleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  العنوان الرقمي أو النطاق (IP or CIDR Block):
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 197.230.14.88 أو 109.200.0.0/16"
                  value={newIpOrCidr}
                  onChange={(e) => setNewIpOrCidr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-white text-left focus:outline-none focus:border-blue-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نوع القاعدة:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRuleType("WHITELIST")}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      newRuleType === "WHITELIST"
                        ? "bg-emerald-600 text-white border-emerald-500 shadow"
                        : "bg-slate-950 text-slate-400 border-slate-800"
                    }`}
                  >
                    قائمة بيضاء (Whitelist - سماح)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRuleType("BLACKLIST")}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      newRuleType === "BLACKLIST"
                        ? "bg-rose-600 text-white border-rose-500 shadow"
                        : "bg-slate-950 text-slate-400 border-slate-800"
                    }`}
                  >
                    قائمة سوداء (Blacklist - حظر)
                  </button>
                </div>
              </div>

              {newRuleType === "BLACKLIST" && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">مستوى التهديد:</label>
                  <select
                    value={newRuleThreat}
                    onChange={(e) => setNewRuleThreat(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="LOW">منخفض (Low)</option>
                    <option value="MEDIUM">متوسط (Medium)</option>
                    <option value="HIGH">مرتفع (High)</option>
                    <option value="CRITICAL">حرج وشديد الخطورة (Critical)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">البيان / الملاحظات:</label>
                <input
                  type="text"
                  placeholder="مثال: شبكة فرع المكلا للمبيعات"
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
                >
                  حفظ وتطبيق القاعدة
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddRuleOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
