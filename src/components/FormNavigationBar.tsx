import React, { useState } from "react";
import {
  ArrowRight,
  Home,
  Save,
  Printer,
  Plus,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { soundService } from "../services/notificationSoundService";

interface FormNavigationBarProps {
  title: string;
  onBack: () => void;
  onSave: () => void;
  onSaveAndPrint?: () => void;
  onSaveAndNew?: () => void;
  hasUnsavedChanges?: boolean;
  onLogout?: () => void;
  onHome?: () => void;
  isSaving?: boolean;
  customActions?: React.ReactNode;
}

export const FormNavigationBar: React.FC<FormNavigationBarProps> = ({
  title,
  onBack,
  onSave,
  onSaveAndPrint,
  onSaveAndNew,
  hasUnsavedChanges = false,
  onLogout,
  onHome,
  isSaving = false,
  customActions,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void | null>(null);

  const handleBackAttempt = () => {
    try { soundService.playSound("CLICK_SOFT" as any); } catch(e) {}
    if (hasUnsavedChanges) {
      setPendingAction(() => onBack);
      setShowConfirmModal(true);
    } else {
      onBack();
    }
  };

  const handleHomeAttempt = () => {
    try { soundService.playSound("CLICK_SOFT" as any); } catch(e) {}
    if (hasUnsavedChanges && onHome) {
      setPendingAction(() => onHome);
      setShowConfirmModal(true);
    } else if (onHome) {
      onHome();
    }
  };

  const handleLogoutAttempt = () => {
    try { soundService.playSound("CLICK_SOFT" as any); } catch(e) {}
    if (hasUnsavedChanges && onLogout) {
      setPendingAction(() => onLogout);
      setShowConfirmModal(true);
    } else if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      {/* Sticky Top Bar for Form / Create / Edit / Report */}
      <div className="sticky top-0 z-40 bg-[#0a2540] text-white shadow-xl border-b border-amber-500/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md bg-opacity-95 transition-all">
        {/* Right side: Navigation (Home, Back, Title) */}
        <div className="flex items-center gap-3">
          {onHome && (
            <button
              onClick={handleHomeAttempt}
              title="الرئيسية (Home)"
              className="p-2.5 bg-blue-900/60 hover:bg-blue-800 text-blue-100 hover:text-white rounded-xl border border-blue-600/40 transition-all flex items-center justify-center cursor-pointer shadow-sm min-h-[44px] min-w-[44px]"
            >
              <Home className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={handleBackAttempt}
            title="رجوع (Back)"
            className="px-4 py-2 bg-blue-900/70 hover:bg-blue-800 text-blue-100 hover:text-white rounded-xl border border-blue-500/40 transition-all flex items-center gap-2 cursor-pointer font-bold text-sm shadow-sm min-h-[44px]"
          >
            <ArrowRight className="w-5 h-5" />
            <span>رجوع</span>
          </button>

          <div className="h-6 w-px bg-blue-700/60 mx-1 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <h1 className="text-base sm:text-lg font-black text-amber-300 tracking-wide">
              {title}
            </h1>
          </div>
        </div>

        {/* Left side: Save actions & Utilities */}
        <div className="flex flex-wrap items-center gap-2">
          {customActions}

          {onSaveAndNew && (
            <button
              onClick={() => {
                try { soundService.playSound("CLICK_SOFT" as any); } catch(e) {}
                onSaveAndNew();
              }}
              disabled={isSaving}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-600 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm min-h-[44px]"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>حفظ وإضافة جديد</span>
            </button>
          )}

          {onSaveAndPrint && (
            <button
              onClick={() => {
                try { soundService.playSound("CLICK_SOFT" as any); } catch(e) {}
                onSaveAndPrint();
              }}
              disabled={isSaving}
              className="px-3.5 py-2 bg-indigo-900 hover:bg-indigo-800 text-indigo-100 rounded-xl border border-indigo-600 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm min-h-[44px]"
            >
              <Printer className="w-4 h-4 text-cyan-300" />
              <span>حفظ وطباعة</span>
            </button>
          )}

          <button
            onClick={() => {
              try { soundService.playSound("SUCCESS_CHIME" as any); } catch(e) {}
              onSave();
            }}
            disabled={isSaving}
            className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#f1c40f] hover:brightness-110 text-[#0a2540] rounded-xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer shadow-md border border-amber-300 min-h-[44px]"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
          </button>

          {onLogout && (
            <button
              onClick={handleLogoutAttempt}
              title="تسجيل الخروج"
              className="p-2.5 bg-rose-950/60 hover:bg-rose-900 text-rose-200 rounded-xl border border-rose-700/40 transition-all flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
            >
              <LogOut className="w-5 h-5 text-rose-400" />
            </button>
          )}
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl max-w-md w-full p-6 text-white text-right space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black">⚠️ هل أنت متأكد من الخروج؟</h3>
                <p className="text-xs text-slate-400">تنبيه حماية البيانات غير المحفوظة</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              هناك بيانات غير محفوظة في هذه الشاشة. إذا خرجت الآن، فستفقد كافة التعديلات والمدخلات غير المُعتمدة.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  try { soundService.playSound("CLICK_SOFT" as any); } catch(e) {}
                  setShowConfirmModal(false);
                  setPendingAction(null);
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-600 transition-all cursor-pointer min-h-[44px]"
              >
                لا، ابقَ في الشاشة
              </button>
              <button
                onClick={() => {
                  try { soundService.playSound("ROYAL_BANK_CHIME" as any); } catch(e) {}
                  setShowConfirmModal(false);
                  if (pendingAction) {
                    pendingAction();
                  }
                  setPendingAction(null);
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl shadow-lg transition-all cursor-pointer min-h-[44px]"
              >
                نعم، اخرج وفقد التعديلات
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
