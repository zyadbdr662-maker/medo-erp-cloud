import React, { useState } from "react";
import {
  FileSpreadsheet,
  Printer,
  Shield,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  RefreshCw,
} from "lucide-react";
import { TenantSecurityService, TenantAccessAuditLog } from "../services/tenantSecurityService";

interface TenantAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug?: string;
  tenantName?: string;
}

export const TenantAuditLogModal: React.FC<TenantAuditLogModalProps> = ({
  isOpen,
  onClose,
  tenantSlug,
  tenantName,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [logs, setLogs] = useState<TenantAccessAuditLog[]>(() =>
    TenantSecurityService.getAuditLogs(tenantSlug)
  );

  if (!isOpen) return null;

  const refreshLogs = () => {
    setLogs(TenantSecurityService.getAuditLogs(tenantSlug));
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userName && log.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "ALL") return matchesSearch;
    return matchesSearch && log.status === filterStatus;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    TenantSecurityService.exportAuditLogsToCSV(tenantSlug);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      dir="rtl"
    >
      <div className="w-full max-w-4xl bg-[#06182a] border border-blue-500/50 rounded-3xl p-6 shadow-2xl text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>📜 سجل التدقيق الأمني - بوابة المنشآت والعملاء</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  AES-256 ENCRYPTED
                </span>
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span>توثيق كافة عمليات الدخول، وفشل التحقق، والحظر التلقائي</span>
                {tenantName && (
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    • <Building2 className="w-3.5 h-3.5" /> {tenantName}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition"
          >
            ✕
          </button>
        </div>

        {/* Filter Controls */}
        <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث بالبريد، المستخدم، المنشأة، أو الحدث..."
              className="w-full bg-[#030d17] border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 bg-[#030d17] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">جميع الحالات ({logs.length})</option>
              <option value="SUCCESS">✅ تسجيلات ناجحة</option>
              <option value="FAILED">❌ محاولات فاشلة</option>
              <option value="BLOCKED">🚨 محظور تلقائياً</option>
            </select>

            <button
              type="button"
              onClick={refreshLogs}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="تحديث السجل"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-800 rounded-2xl bg-[#030d17]/80">
          <table className="w-full text-right text-xs border-collapse">
            <thead className="sticky top-0 bg-[#06182a] border-b border-slate-700 text-slate-400 z-10">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">الوقت</th>
                <th className="p-3">المنشأة</th>
                <th className="p-3">الحدث</th>
                <th className="p-3">المستخدم / البريد</th>
                <th className="p-3">عنوان IP</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">التفاصيل والتشفير</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    لا توجد سجلات أمنية مطابقة لخيارات البحث
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id} className="hover:bg-slate-900/60 transition">
                    <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-3 text-slate-400 font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString("ar-EG", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      {log.tenantName || log.tenantSlug}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-300">
                      <div>{log.userEmail}</div>
                      {log.userName && <div className="text-[10px] text-slate-400 font-sans">{log.userName}</div>}
                    </td>
                    <td className="p-3 font-mono text-slate-400">{log.ipAddress}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === "SUCCESS"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : log.status === "BLOCKED"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {log.status === "SUCCESS" && <CheckCircle2 className="w-3 h-3" />}
                        {log.status === "BLOCKED" && <XCircle className="w-3 h-3" />}
                        {log.status === "FAILED" && <AlertTriangle className="w-3 h-3" />}
                        <span>
                          {log.status === "SUCCESS" ? "ناجح" : log.status === "BLOCKED" ? "محظور" : "فاشل"}
                        </span>
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 text-[11px] max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-2 border-t border-slate-700/80 flex items-center justify-between text-xs flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>📄 تصدير Excel (CSV)</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>🖨️ طباعة السجل</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
