import React from "react";
import { ShieldAlert, ArrowRight, LogOut } from "lucide-react";
import { ERPUser } from "../types/erp";
import { soundService } from "../services/notificationSoundService";

interface UnauthorizedAccessViewProps {
  currentUser?: ERPUser | null;
  attemptedTabTitle?: string;
  allowedRoles?: string[];
  onNavigateToAllowed?: () => void;
  onLogout?: () => void;
  onSwitchBackToManager?: () => void;
}

export const UnauthorizedAccessView: React.FC<UnauthorizedAccessViewProps> = ({
  currentUser,
  attemptedTabTitle = "هذه الوحدة المحاسبية",
  allowedRoles = ["مدير النظام", "المحاسب المالي العام"],
  onNavigateToAllowed,
  onLogout,
  onSwitchBackToManager,
}) => {
  const userRole = currentUser?.role || "GUEST";
  
  // Determine allowed landing tab based on current role
  let roleTitleAr = "موظف مبيعات ونقاط بيع";
  let defaultAllowedName = "شاشة فواتير المبيعات ونقاط البيع (POS)";

  if (userRole === "CASHIER") {
    roleTitleAr = "مسؤول المبيعات ونقاط البيع (CASHIER / SD)";
    defaultAllowedName = "فواتير المبيعات ونقاط البيع (POS)";
  } else if (userRole === "DATA_ENTRY") {
    roleTitleAr = "مسؤول المشتريات والتوريد (PURCHASER / MM)";
    defaultAllowedName = "فواتير المشتريات والموردين";
  } else if (userRole === "AUDITOR") {
    roleTitleAr = "المراجع والمدقق المالي (AUDITOR / FI)";
    defaultAllowedName = "التقارير المالية والرقابية";
  } else if (userRole === "ACCOUNTANT") {
    roleTitleAr = "المحاسب المالي العام (ACCOUNTANT)";
    defaultAllowedName = "دفتر الأستاذ العام والشجرة المحاسبية";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-fadeIn" dir="rtl">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 border-2 border-red-500/30 dark:border-red-500/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Security Shield Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-950/60 border-2 border-red-500/40 rounded-full flex items-center justify-center shadow-lg shadow-red-500/10">
          <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400 animate-pulse" />
        </div>

        {/* Heading */}
        <span className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold rounded-full mb-3 border border-red-300 dark:border-red-800">
          خطأ أمني 403 - وصول محظور (Access Denied)
        </span>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          عذراً، لا تملك صلاحية الوصول إلى {attemptedTabTitle}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
          تم تفعيل نظام عزل الصلاحيات الصارم (RBAC Matrix). هذا الحساب مقيد بصلاحيات تشغيلية محددة ولا يمكنه استعراض أو تعديل بيانات هذه الوحدة لحماية البيانات المالية.
        </p>

        {/* User Role Card */}
        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-right mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">المستخدم الحالي:</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser?.name || "مستخدم معتمد"}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">الدور الوظيفي الفعال:</span>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              {roleTitleAr}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">الصلاحيات المصرح لها:</span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {allowedRoles.join("، ")}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          {onSwitchBackToManager && (
            <button
              onClick={() => {
                soundService.playSound("SUCCESS_CHIME");
                onSwitchBackToManager();
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#f1c40f] hover:brightness-110 text-[#0a2540] text-sm font-black rounded-xl shadow-lg border border-amber-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>🔄 العودة إلى وضع المدير (Switch Back to Admin)</span>
            </button>
          )}

          {onNavigateToAllowed && (
            <button
              onClick={() => {
                soundService.playSound("ROYAL_BANK_CHIME");
                onNavigateToAllowed();
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>الانتقال إلى {defaultAllowedName}</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          )}

          {onLogout && (
            <button
              onClick={() => {
                soundService.playSound("ROYAL_BANK_CHIME");
                onLogout();
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج والتبديل</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
