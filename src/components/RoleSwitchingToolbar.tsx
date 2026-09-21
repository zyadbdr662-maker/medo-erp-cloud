import React, { useState } from "react";
import {
  ShieldCheck,
  RotateCcw,
  LogOut,
  Home,
  Settings,
  UserCheck,
  Sparkles,
  ChevronUp,
  X,
  CheckCircle2,
  Users,
  Briefcase,
  Lock,
} from "lucide-react";
import { ERPUser } from "../types/erp";
import { NavTab } from "./Sidebar";
import { soundService } from "../services/notificationSoundService";
import { TenantIsolationService } from "../services/tenantIsolationService";

interface RoleSwitchingToolbarProps {
  currentUser: ERPUser | null;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
  onSwitchBackToManager: () => void;
  onSwitchRole: (targetRole: "MANAGER" | "ACCOUNTANT" | "PURCHASER" | "CASHIER" | "AUDITOR") => void;
  hasOriginalManagerSession: boolean;
  companyName?: string;
}

export const RoleSwitchingToolbar: React.FC<RoleSwitchingToolbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  onSwitchBackToManager,
  onSwitchRole,
  hasOriginalManagerSession,
  companyName,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activeDetails = TenantIsolationService.getActiveTenantDetails();
  const effectiveCompanyName = companyName || activeDetails?.nameAr || "المنشأة المعتمدة";

  const currentRole = currentUser?.role || "CASHIER";
  const isManagerCurrently = currentRole === "SYSTEM_ADMIN" || currentRole === "ADMIN" || currentRole === "SUPER_ADMIN";

  const getRoleTitleAr = (role: string) => {
    switch (role) {
      case "SYSTEM_ADMIN":
      case "ADMIN":
      case "SUPER_ADMIN":
      case "MANAGER":
        return "المدير العام (MANAGER)";
      case "CASHIER":
      case "SALES":
        return "مسؤول المبيعات ونقاط البيع (CASHIER)";
      case "ACCOUNTANT":
        return "المحاسب المالي العام (ACCOUNTANT)";
      case "DATA_ENTRY":
      case "PURCHASER":
        return "مسؤول المشتريات والتوريد (PURCHASER)";
      case "AUDITOR":
        return "المراجع والمدقق المالي (AUDITOR)";
      default:
        return "موظف معتمد";
    }
  };

  return (
    <>
      {/* 1. TOP FLOATING ALERT BANNER (Shows when testing another role with active Manager session) */}
      {hasOriginalManagerSession && !isManagerCurrently && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-[#06182a] via-[#0a2540] to-[#06182a] border-b-2 border-[#d4af37] text-white px-4 py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-bold dir-rtl animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d4af37]"></span>
            </span>
            <div className="truncate">
              <span className="text-amber-300">وضع تجربة الدور:</span>{" "}
              <span className="text-white font-black underline decoration-[#d4af37] underline-offset-4">
                {getRoleTitleAr(currentRole)}
              </span>
              <span className="text-slate-400 text-xs hidden md:inline mr-2">
                ({effectiveCompanyName})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="top-switch-back-to-manager-btn"
              type="button"
              onClick={() => {
                soundService.playSound("SUCCESS_CHIME");
                onSwitchBackToManager();
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-[#d4af37] to-[#f1c40f] hover:brightness-110 text-[#0a2540] font-black rounded-xl shadow-lg border border-amber-300 transition-all flex items-center gap-1.5 cursor-pointer text-xs active:scale-95"
              title="العودة المباشرة إلى حساب المدير العام واستعادة كامل الصلاحيات"
            >
              <RotateCcw className="w-4 h-4 text-[#0a2540] animate-spin-slow" />
              <span>العودة إلى وضع المدير (Switch Back to Admin)</span>
            </button>

            <button
              onClick={() => {
                soundService.playSound("ROYAL_BANK_CHIME");
                onLogout();
              }}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white rounded-xl border border-rose-500/40 transition-all flex items-center gap-1 text-xs cursor-pointer font-bold"
              title="تسجيل الخروج والعودة لشاشة الدخول"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. FLOATING BOTTOM TOOLBAR (Fixed Toolbar for Navigation & Role Switching) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 dir-rtl max-w-full px-2">
        <div className="bg-[#06182a]/95 text-white border border-[#d4af37]/70 shadow-[0_10px_30px_rgba(0,0,0,0.8)] rounded-2xl px-4 py-2.5 backdrop-blur-xl flex items-center justify-center gap-2 sm:gap-4 text-xs font-bold ring-1 ring-white/10">
          {/* Home Button */}
          <button
            onClick={() => {
              soundService.playSound("SUCCESS_CHIME");
              setActiveTab(isManagerCurrently ? "DASHBOARD" : "SALES_RETURNS");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "DASHBOARD" || activeTab === "SALES_RETURNS"
                ? "bg-[#d4af37] text-[#0a2540] font-black shadow-md"
                : "hover:bg-slate-800/80 text-slate-200"
            }`}
            title="العودة للشاشة الرئيسية"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">الرئيسية</span>
          </button>

          {/* Switch Role / Switch Back Button */}
          {hasOriginalManagerSession && !isManagerCurrently ? (
            <button
              onClick={() => {
                soundService.playSound("SUCCESS_CHIME");
                onSwitchBackToManager();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#d4af37] to-[#f39c12] hover:brightness-110 text-[#0a2540] font-black rounded-xl shadow-lg border border-amber-300 transition-all cursor-pointer animate-pulse"
              title="العودة إلى وضع المدير العام"
            >
              <RotateCcw className="w-4 h-4 text-[#0a2540]" />
              <span>العودة لوضع المدير 👑</span>
            </button>
          ) : (
            <button
              onClick={() => {
                soundService.playSound("SUCCESS_CHIME");
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/60 hover:bg-blue-800/80 border border-blue-500/40 text-blue-200 font-bold rounded-xl transition-all cursor-pointer"
              title="نافذة تبديل الأدوار الوظيفية والاختبار"
            >
              <Users className="w-4 h-4 text-[#d4af37]" />
              <span>تبديل الدور 🔄</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={() => {
              soundService.playSound("SUCCESS_CHIME");
              setActiveTab("SYSTEM_SETTINGS");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "SYSTEM_SETTINGS"
                ? "bg-[#d4af37] text-[#0a2540] font-black shadow-md"
                : "hover:bg-slate-800/80 text-slate-200"
            }`}
            title="إعدادات النظام والشركة"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">الإعدادات</span>
          </button>

          <div className="w-px h-5 bg-slate-700/80 my-auto"></div>

          {/* Logout Button */}
          <button
            onClick={() => {
              soundService.playSound("ROYAL_BANK_CHIME");
              onLogout();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl transition-all cursor-pointer font-bold"
            title="تسجيل الخروج والعودة لبوابة الدخول"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* 3. QUICK ROLE SWITCHER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md dir-rtl animate-in fade-in">
          <div className="bg-[#081b2e] border-2 border-[#d4af37]/60 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-white space-y-5 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 left-4 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-right space-y-1 border-b border-blue-900/80 pb-4">
              <div className="flex items-center gap-2 text-[#d4af37]">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-lg font-black text-white">تبديل واستعراض الأدوار الوظيفية</h3>
              </div>
              <p className="text-xs text-slate-300">
                يمكنك تبديل الدور لاختبار صلاحيات الموظفين، ويتم حفظ الجلسة الأصلية للمدير العام للعودة في أي وقت.
              </p>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {/* MANAGER ROLE */}
              <button
                onClick={() => {
                  onSwitchRole("MANAGER");
                  setIsModalOpen(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  isManagerCurrently
                    ? "bg-[#d4af37]/20 border-[#d4af37] text-white"
                    : "bg-[#0a2540] hover:bg-blue-900/60 border-blue-900 text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#d4af37] text-[#0a2540] font-black flex items-center justify-center text-lg">
                    👑
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">المدير العام (MANAGER)</h4>
                    <p className="text-xs text-slate-300">صلاحيات سيادية كاملة على كافة الوحدات المالية والإدارية</p>
                  </div>
                </div>
                {isManagerCurrently && <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />}
              </button>

              {/* CASHIER / SALES ROLE */}
              <button
                onClick={() => {
                  onSwitchRole("CASHIER");
                  setIsModalOpen(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  currentRole === "CASHIER"
                    ? "bg-emerald-500/20 border-emerald-500 text-white"
                    : "bg-[#0a2540] hover:bg-blue-900/60 border-blue-900 text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center text-lg">
                    🏷️
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">مسؤول المبيعات والكاشير (CASHIER / POS)</h4>
                    <p className="text-xs text-slate-300">فواتير المبيعات ونقاط البيع وعروض الأسعار والعملاء فقط</p>
                  </div>
                </div>
                {currentRole === "CASHIER" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </button>

              {/* ACCOUNTANT ROLE */}
              <button
                onClick={() => {
                  onSwitchRole("ACCOUNTANT");
                  setIsModalOpen(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  currentRole === "ACCOUNTANT"
                    ? "bg-sky-500/20 border-sky-500 text-white"
                    : "bg-[#0a2540] hover:bg-blue-900/60 border-blue-900 text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white font-black flex items-center justify-center text-lg">
                    📊
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">المحاسب المالي العام (ACCOUNTANT)</h4>
                    <p className="text-xs text-slate-300">قيود اليومية، شجرة الحسابات، التسويات، وميزان المراجعة</p>
                  </div>
                </div>
                {currentRole === "ACCOUNTANT" && <CheckCircle2 className="w-5 h-5 text-sky-400" />}
              </button>

              {/* PURCHASER ROLE */}
              <button
                onClick={() => {
                  onSwitchRole("PURCHASER");
                  setIsModalOpen(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  currentRole === "DATA_ENTRY" || currentRole === "PURCHASER"
                    ? "bg-amber-500/20 border-amber-500 text-white"
                    : "bg-[#0a2540] hover:bg-blue-900/60 border-blue-900 text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black flex items-center justify-center text-lg">
                    📦
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">مسؤول المشتريات والمخازن (PURCHASER)</h4>
                    <p className="text-xs text-slate-300">أوامر الشراء، فواتير الموردين، وإدخال الشحنات المخزنية</p>
                  </div>
                </div>
                {(currentRole === "DATA_ENTRY" || currentRole === "PURCHASER") && (
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                )}
              </button>

              {/* AUDITOR ROLE */}
              <button
                onClick={() => {
                  onSwitchRole("AUDITOR");
                  setIsModalOpen(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  currentRole === "AUDITOR"
                    ? "bg-purple-500/20 border-purple-500 text-white"
                    : "bg-[#0a2540] hover:bg-blue-900/60 border-blue-900 text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500 text-white font-black flex items-center justify-center text-lg">
                    🔍
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">المراجع والمدقق المالي (AUDITOR)</h4>
                    <p className="text-xs text-slate-300">استعراض التقارير المالية والتحقق من القوائم والحركات الحسابية</p>
                  </div>
                </div>
                {currentRole === "AUDITOR" && <CheckCircle2 className="w-5 h-5 text-purple-400" />}
              </button>
            </div>

            <div className="pt-2 border-t border-blue-900/80 flex items-center justify-between">
              <button
                onClick={() => {
                  onSwitchBackToManager();
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#f1c40f] hover:brightness-110 text-[#0a2540] font-black rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow"
              >
                <RotateCcw className="w-4 h-4" />
                <span>استعادة حساب المدير العام فوراً</span>
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition font-bold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
