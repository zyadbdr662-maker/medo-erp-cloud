import React from "react";
import {
  X,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  FileSpreadsheet,
  Users,
  ShieldAlert,
} from "lucide-react";
import { NavTab } from "./Sidebar";
import { ERPState } from "../types/erp";

interface MobileNotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  erpState: ERPState;
  unbalancedJournalsCount: number;
  onNavigateToTab: (tab: NavTab) => void;
}

export const MobileNotificationsSheet: React.FC<MobileNotificationsSheetProps> = ({
  isOpen,
  onClose,
  erpState,
  unbalancedJournalsCount,
  onNavigateToTab,
}) => {
  if (!isOpen) return null;

  const pendingApprovals = erpState.approvalRequests?.filter((a) => a.status === "PENDING") || [];
  const systemAlerts = erpState.systemAlerts || [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Sheet Content */}
      <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-slideUp">
        {/* Handle Bar */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-sm">مركز الإشعارات والتنبيهات الرقابية</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Unbalanced Entries Warning */}
          {unbalancedJournalsCount > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>تنبيه تدقيق محاسبي فوري</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-900 text-rose-200 font-mono">
                  {unbalancedJournalsCount} غير متزن
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                يوجد {unbalancedJournalsCount} قيود يومية محاسبية غير متزنة بين طرفي المدين والدائن
                وفق معايير IFRS.
              </p>
              <button
                onClick={() => {
                  onNavigateToTab("JOURNAL_ENTRIES");
                  onClose();
                }}
                className="w-full py-2 rounded-xl bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold transition-all"
              >
                مراجعة وتعديل القيود الآن ←
              </button>
            </div>
          )}

          {/* Pending Approval Requests */}
          {pendingApprovals.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 px-1">
                طلبات بانتظار اعتمادك ({pendingApprovals.length})
              </h4>
              {pendingApprovals.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{req.title}</span>
                    <span className="text-[10px] text-amber-400 font-mono">قيد المراجعة</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{req.description}</p>
                  <button
                    onClick={() => {
                      onNavigateToTab("COLLABORATION");
                      onClose();
                    }}
                    className="w-full py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <span>فتح طلب الموافقة</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* System Alerts */}
          {systemAlerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 px-1">تنبيهات النظام</h4>
              {systemAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{alert.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{alert.createdAt?.slice(0, 10)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{alert.message}</p>
                </div>
              ))}
            </div>
          )}

          {unbalancedJournalsCount === 0 && pendingApprovals.length === 0 && systemAlerts.length === 0 && (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto" />
              <p className="text-xs font-bold text-slate-400">لا توجد تنبيهات جديدة حالياً</p>
              <p className="text-[11px] text-slate-500">
                جميع القيود متزنة ومعتمدة والنظام يعمل بكفاءة تامة.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
