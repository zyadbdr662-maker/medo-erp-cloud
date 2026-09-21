import React, { useState, useEffect } from "react";
import {
  FileCheck2,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Printer,
  Sparkles,
  TrendingUp,
  Award,
  DollarSign,
  UserCheck,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Fingerprint,
  Lock,
  Shield,
} from "lucide-react";
import { ERPState } from "../types/erp";
import {
  cloudSecurityService,
  GovernanceReport,
  LargeTransactionSecurityAlert,
} from "../services/cloudSecurityService";
import { soundService } from "../services/notificationSoundService";

interface FinancialGovernanceReportsViewProps {
  fullState: ERPState;
  currentUserName?: string;
}

export const FinancialGovernanceReportsView: React.FC<FinancialGovernanceReportsViewProps> = ({
  fullState,
  currentUserName = "د. طارق المنصوري (كبير المدققين)",
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"REPORTS" | "LARGE_TX_ALERTS">("REPORTS");
  const [selectedPeriod, setSelectedPeriod] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUAL">("MONTHLY");
  const [reports, setReports] = useState<GovernanceReport[]>(() =>
    cloudSecurityService.getGovernanceReports()
  );
  const [activeReport, setActiveReport] = useState<GovernanceReport | null>(null);
  const [largeAlerts, setLargeAlerts] = useState<LargeTransactionSecurityAlert[]>(() =>
    cloudSecurityService.getLargeTxAlerts()
  );

  // Generating State
  const [isGenerating, setIsGenerating] = useState(false);
  const [alertFeedback, setAlertFeedback] = useState<string | null>(null);

  // Biometric WebAuthn Approval Modal State
  const [pendingBiometricAlert, setPendingBiometricAlert] = useState<LargeTransactionSecurityAlert | null>(null);
  const [isBiometricVerifying, setIsBiometricVerifying] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);

  // Filter for large transactions
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsub = cloudSecurityService.subscribe(() => {
      const r = cloudSecurityService.getGovernanceReports();
      setReports(r);
      if (!activeReport && r.length > 0) {
        setActiveReport(r[0]);
      }
      setLargeAlerts(cloudSecurityService.getLargeTxAlerts());
    });
    return unsub;
  }, [activeReport]);

  // Initial report load
  useEffect(() => {
    if (reports.length > 0 && !activeReport) {
      setActiveReport(reports[0]);
    }
  }, [reports, activeReport]);

  const handleGenerateNewReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newRep = cloudSecurityService.generateFinancialGovernanceReport(
        selectedPeriod,
        fullState,
        currentUserName
      );
      setIsGenerating(false);
      setActiveReport(newRep);
      setAlertFeedback(`تم توليد تقرير الحوكمة والرقابة الدورية (${newRep.reportNumber}) بنجاح!`);
      setTimeout(() => setAlertFeedback(null), 4000);
    }, 1000);
  };

  const handleReviewAlert = (
    alert: LargeTransactionSecurityAlert,
    status: "APPROVED" | "FLAGGED_SUSPICIOUS" | "REJECTED"
  ) => {
    if (status === "APPROVED" && cloudSecurityService.isBiometricRequiredForTransaction(alert.amount)) {
      setPendingBiometricAlert(alert);
      setBiometricError(null);
      return;
    }
    executeApproval(alert.id, status, currentUserName);
  };

  const executeApproval = (
    alertId: string,
    status: "APPROVED" | "FLAGGED_SUSPICIOUS" | "REJECTED",
    reviewer: string
  ) => {
    const updated = cloudSecurityService.reviewLargeTxAlert(alertId, status, reviewer);
    if (updated) {
      if (status === "APPROVED") {
        soundService.playSound("SUCCESS_CHIME");
        setAlertFeedback(`تم اعتماد الحركة المالية (${updated.txNumber}) وتوثيقها في سجل الحوكمة.`);
      } else if (status === "FLAGGED_SUSPICIOUS") {
        soundService.playSound("RADAR_SECURITY");
        setAlertFeedback(`⚠️ تم تصنيف الحركة (${updated.txNumber}) كحركة مشبوهة وتعليق صرفها.`);
      } else {
        setAlertFeedback(`تم رفض الحركة المالية (${updated.txNumber}).`);
      }
      setTimeout(() => setAlertFeedback(null), 4000);
    }
  };

  const handleConfirmBiometricAuth = async () => {
    if (!pendingBiometricAlert) return;
    setIsBiometricVerifying(true);
    setBiometricError(null);

    try {
      const result = await cloudSecurityService.simulateWebAuthnBiometricAuth(currentUserName);
      if (result.success) {
        executeApproval(
          pendingBiometricAlert.id,
          "APPROVED",
          `${currentUserName} [WebAuthn: ${result.credentialId?.slice(0, 10)}...]`
        );
        setPendingBiometricAlert(null);
      } else {
        setBiometricError(result.error || "فشل التحقق البيومتري");
      }
    } catch (err) {
      setBiometricError("تعذر إكمال المصادقة البيومترية");
    } finally {
      setIsBiometricVerifying(false);
    }
  };

  const filteredAlerts = largeAlerts.filter((a) => {
    if (filterStatus !== "ALL" && a.status !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        a.txNumber.toLowerCase().includes(q) ||
        a.makerName.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 font-['Alexandria','Cairo',sans-serif] text-right" dir="rtl">
      {/* Sub Header & Sub Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-blue-500/30 p-4 sm:p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-lg">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>تقارير الحوكمة المالية ولوحة التنبيهات الأمنية</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-blue-950 text-blue-300 border border-blue-500/40">
                IFRS & SOC-2 COMPLIANT
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              تحليل دوري لالتزام العمليات المالية بمعايير الرقابة الداخلية، والاعتماد المزدوج للحركات الكبيرة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab("REPORTS")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "REPORTS"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>تقارير الحوكمة والامتثال الدورية</span>
          </button>

          <button
            onClick={() => setActiveSubTab("LARGE_TX_ALERTS")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "LARGE_TX_ALERTS"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>تنبيهات الحركات المالية الكبيرة ({largeAlerts.filter(a => a.status === 'FLAGGED_SUSPICIOUS' || a.status === 'PENDING_REVIEW').length})</span>
          </button>
        </div>
      </div>

      {alertFeedback && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-2xl text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-bold">{alertFeedback}</span>
        </div>
      )}

      {/* ========================================== */}
      {/* 1. FINANCIAL GOVERNANCE REPORTS */}
      {/* ========================================== */}
      {activeSubTab === "REPORTS" && (
        <div className="space-y-6">
          {/* Generation Control Bar */}
          <div className="bg-slate-900/90 border border-blue-500/30 p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>توليد فحص وتقرير حوكمة رقابي دوري جديد</span>
              </h3>
              <p className="text-xs text-slate-400">
                يقوم المحرك بفحص كافة قيود اليومية، سندات الصرف والقبض، وتوافق الرقابة الثنائية وفصل المهام (SoD).
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="DAILY">فحص يومي فوري (Daily)</option>
                <option value="WEEKLY">فحص أسبوعي (Weekly)</option>
                <option value="MONTHLY">فحص إقفال شهري (Monthly)</option>
                <option value="QUARTERLY">فحص ربع سنوي (Quarterly)</option>
                <option value="ANNUAL">فحص مراجعة سنوية شاملة (Annual)</option>
              </select>

              <button
                onClick={handleGenerateNewReport}
                disabled={isGenerating}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition shadow-lg cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
                <span>{isGenerating ? "جاري الفحص والتحليل..." : "تشغيل فحص الامتثال وتوليد التقرير"}</span>
              </button>
            </div>
          </div>

          {/* Active Report Display Card */}
          {activeReport ? (
            <div className="bg-gradient-to-b from-[#0B192C] to-[#081220] border border-blue-500/40 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl relative">
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-500/40">
                      {activeReport.reportNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      تاريخ الفحص: {new Date(activeReport.generatedAt).toLocaleString("ar-SA")}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white">
                    تقرير الحوكمة والرقابة المالية الدورية ({activeReport.period})
                  </h3>
                  <div className="text-xs text-slate-300">
                    المدقق المعتمد: <span className="font-bold text-slate-100">{activeReport.auditorName}</span>
                  </div>
                </div>

                {/* Score Badge */}
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-center space-y-1 min-w-[120px]">
                    <div className="text-[11px] text-slate-400 font-bold">مؤشر الامتثال المحاسبي:</div>
                    <div className={`text-3xl font-black font-mono ${
                      activeReport.complianceScore >= 85
                        ? "text-emerald-400"
                        : activeReport.complianceScore >= 65
                        ? "text-amber-400"
                        : "text-rose-400"
                    }`}>
                      {activeReport.complianceScore}%
                    </div>
                    <div className={`text-[10px] font-black ${
                      activeReport.overallStatus === "COMPLIANT"
                        ? "text-emerald-400"
                        : activeReport.overallStatus === "WARNING"
                        ? "text-amber-400"
                        : "text-rose-400"
                    }`}>
                      {activeReport.overallStatus === "COMPLIANT"
                        ? "مطابق للمعايير الرقابية ✓"
                        : activeReport.overallStatus === "WARNING"
                        ? "يتطلب إجراءات تصحيحية ⚠️"
                        : "غير مطابق ✗"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-center space-y-1">
                  <div className="text-[11px] text-slate-400">إجمالي الحركات المفحوصة:</div>
                  <div className="text-base font-black font-mono text-white">
                    {activeReport.summary.totalEntriesChecked.toLocaleString()}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-center space-y-1">
                  <div className="text-[11px] text-slate-400">حركات كبرى خاضعة للرقابة:</div>
                  <div className="text-base font-black font-mono text-blue-400">
                    {activeReport.summary.largeTransactionsCount.toLocaleString()}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-center space-y-1">
                  <div className="text-[11px] text-slate-400">مخالفات فصل المهام (SoD):</div>
                  <div className={`text-base font-black font-mono ${
                    activeReport.summary.sodViolationsCount > 0 ? "text-rose-400" : "text-emerald-400"
                  }`}>
                    {activeReport.summary.sodViolationsCount}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-center space-y-1">
                  <div className="text-[11px] text-slate-400">نسبة الامتثال للاعتماد المزدوج:</div>
                  <div className="text-base font-black font-mono text-emerald-400">
                    {activeReport.summary.dualApprovalCompliantPercent}%
                  </div>
                </div>
              </div>

              {/* Findings Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>نتائج وملاحظات التدقيق الداخلي (Audit Findings & Recommendations):</span>
                </h4>

                {activeReport.findings.length === 0 ? (
                  <div className="p-5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-center text-xs text-emerald-300">
                    🎉 لم يتم رصد أي ملاحظات أو ثغرات رقابية. كافة العمليات مطابقة لمعايير الحوكمة وفصل المهام.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeReport.findings.map((f) => (
                      <div
                        key={f.id}
                        className={`p-4 rounded-2xl border space-y-2 text-xs ${
                          f.severity === "HIGH" || f.severity === "CRITICAL"
                            ? "bg-rose-950/30 border-rose-800/60"
                            : "bg-amber-950/30 border-amber-800/60"
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${f.severity === "HIGH" ? "bg-rose-500" : "bg-amber-500"}`}></span>
                            <span>{f.title}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${
                            f.severity === "HIGH" ? "bg-rose-900 text-rose-200" : "bg-amber-900 text-amber-200"
                          }`}>
                            خطورة: {f.severity}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{f.description}</p>
                        <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-[11px] text-emerald-300">
                          <span className="font-bold">التوصية الرقابية: </span>
                          {f.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Standards Complied & Digital Signature */}
              <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-400 text-[11px]">المعايير الدولية المغطاة في هذا التقرير:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeReport.standardsComplied.map((st, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 text-[10px] font-bold">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-left font-mono text-[11px] text-slate-400">
                  <div className="text-[10px] text-slate-500">التوقيع الرقمي للتقرير (SHA-256):</div>
                  <div className="text-emerald-400 font-bold">{activeReport.digitalSignature}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-900/80 border border-slate-800 rounded-3xl text-center space-y-3">
              <FileCheck2 className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">انقر على زر "تشغيل فحص الامتثال" أعلاه لتوليد أول تقرير حوكمة دوري.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* 2. LARGE TRANSACTIONS SECURITY DASHBOARD */}
      {/* ========================================== */}
      {activeSubTab === "LARGE_TX_ALERTS" && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="bg-slate-900/90 border border-blue-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="بحث برقم الحركة، المنشئ، أو البيان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-full sm:w-64"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400">تصفية حسب الحالة:</span>
              {["ALL", "PENDING_REVIEW", "FLAGGED_SUSPICIOUS", "APPROVED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterStatus === st
                      ? "bg-blue-600 text-white shadow"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  {st === "ALL"
                    ? "الكل"
                    : st === "PENDING_REVIEW"
                    ? "قيد المراجعة"
                    : st === "FLAGGED_SUSPICIOUS"
                    ? "مشبوهة وموقوفة"
                    : "معتمدة"}
                </button>
              ))}
            </div>
          </div>

          {/* Large Transactions Table */}
          <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="p-3 font-bold">رقم الحركة</th>
                    <th className="p-3 font-bold">النوع والبيان</th>
                    <th className="p-3 font-bold">المبلغ والعملة</th>
                    <th className="p-3 font-bold">المنشئ (Maker)</th>
                    <th className="p-3 font-bold">تقييم المخاطر</th>
                    <th className="p-3 font-bold">الحالة</th>
                    <th className="p-3 font-bold text-center">إجراء المراجعة والاعتماد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                        لا توجد حركات مالية مطابقة لشروط البحث الحالية.
                      </td>
                    </tr>
                  ) : (
                    filteredAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-bold text-blue-300">
                          {alert.txNumber}
                          <div className="text-[10px] text-slate-500 font-sans">
                            {new Date(alert.timestamp).toLocaleTimeString("ar-SA")}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-white">{alert.txType}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{alert.description}</div>
                        </td>
                        <td className="p-3 font-mono font-black text-emerald-400">
                          {alert.amount.toLocaleString()} {alert.currency}
                        </td>
                        <td className="p-3 text-slate-300">{alert.makerName}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              alert.riskScore > 60
                                ? "bg-rose-950 text-rose-300 border border-rose-600"
                                : alert.riskScore > 30
                                ? "bg-amber-950 text-amber-300 border border-amber-600"
                                : "bg-emerald-950 text-emerald-300 border border-emerald-600"
                            }`}>
                              درجة الخطورة: {alert.riskScore}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          {alert.status === "APPROVED" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                              معتمدة أمنياً ✓
                            </span>
                          )}
                          {alert.status === "FLAGGED_SUSPICIOUS" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-600/40">
                              موقوفة لشبهة ⚠️
                            </span>
                          )}
                          {alert.status === "PENDING_REVIEW" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600/40">
                              بانتظار المراجعة
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleReviewAlert(alert, "APPROVED")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                              title="اعتماد أمني فوري"
                            >
                              {cloudSecurityService.isBiometricRequiredForTransaction(alert.amount) && (
                                <Fingerprint className="w-3 h-3 text-purple-400" />
                              )}
                              <span>اعتماد ✓</span>
                            </button>
                            <button
                              onClick={() => handleReviewAlert(alert, "FLAGGED_SUSPICIOUS")}
                              className="px-2.5 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-200 text-[11px] font-bold transition cursor-pointer"
                              title="تعليق وإيقاف كحركة مشبوهة"
                            >
                              إيقاف ⚠️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Biometric WebAuthn Verification Modal */}
      {pendingBiometricAlert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/50 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scaleUp text-right" dir="rtl">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
                <Fingerprint className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  تحقق بيومتري إلزامي (WebAuthn)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  بموجب سياسات مركز الأمن السحابي لاعتماد الحركات الكبرى.
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>رقم الحركة المالية:</span>
                <span className="font-mono font-bold text-white">{pendingBiometricAlert.txNumber}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>مبلغ الحركة المراد اعتمادها:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  {pendingBiometricAlert.amount.toLocaleString()} {pendingBiometricAlert.currency}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>المسؤول المعتمد:</span>
                <span className="text-white font-bold">{currentUserName}</span>
              </div>
            </div>

            <div className="p-3 bg-purple-950/40 border border-purple-800/40 rounded-xl text-purple-200 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                سيتم توثيق المصادقة البيومترية بمفتاح FIDO2 مشفر وربطه بسجل التدقيق الرقمي.
              </span>
            </div>

            {biometricError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/60 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{biometricError}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmBiometricAuth}
                disabled={isBiometricVerifying}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isBiometricVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري قراءة البصمة...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    <span>تأكيد الاعتماد ببصمة الإصبع أو الوجه</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPendingBiometricAlert(null)}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
