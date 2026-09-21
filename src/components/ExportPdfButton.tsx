import React, { useState } from "react";
import { FileDown, Sparkles, Check } from "lucide-react";
import { exportActiveTableToPdf } from "../services/pdfExporter";

interface ExportPdfButtonProps {
  targetId?: string;
  targetRef?: React.RefObject<HTMLElement | null>;
  reportTitle?: string;
  filename?: string;
  variant?: "button" | "badge" | "icon" | "full";
  className?: string;
  label?: string;
  onSuccess?: () => void;
}

export const ExportPdfButton: React.FC<ExportPdfButtonProps> = ({
  targetId,
  targetRef,
  reportTitle = "تقرير مالي وتوثيق مؤسسي",
  filename,
  variant = "button",
  className = "",
  label = "تصدير PDF (html2pdf.js)",
  onSuccess,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [justExported, setJustExported] = useState(false);

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExporting(true);
    
    try {
      let target: string | HTMLElement | undefined = targetId;
      if (!target && targetRef && targetRef.current) {
        target = targetRef.current;
      }
      
      if (!target && targetId) {
        target = targetId;
      }

      if (!target) {
        // Fallback: search for active table in document
        const activeTable = document.querySelector("table") || document.querySelector(".printable-table") || document.querySelector("main");
        if (activeTable) {
          target = activeTable as HTMLElement;
        }
      }

      if (target) {
        await exportActiveTableToPdf(target, reportTitle, filename);
        setJustExported(true);
        setTimeout(() => setJustExported(false), 3000);
        if (onSuccess) onSuccess();
      } else {
        window.print();
      }
    } catch (err) {
      console.error("PDF export error:", err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        title="تصدير الجدول الحالي لملف PDF رسمية عالية الدقة باستخدام html2pdf.js"
        className={`p-2 rounded-xl bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-700/50 transition-all shadow-sm active:scale-95 disabled:opacity-50 ${className}`}
      >
        <FileDown className={`w-4 h-4 ${isExporting ? "animate-bounce" : ""}`} />
      </button>
    );
  }

  if (variant === "badge") {
    return (
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-950/60 text-rose-200 border border-rose-600/40 hover:bg-rose-900/80 transition-all active:scale-95 disabled:opacity-50 ${className}`}
      >
        <FileDown className="w-3.5 h-3.5 text-rose-400" />
        <span>{isExporting ? "جاري التصدير..." : justExported ? "تم التصدير ✓" : "تصدير PDF"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      title="تصدير هذا الجدول/التقرير المالي لملف PDF رسمي مشفر باستخدام مكتبة html2pdf.js"
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-700 via-red-700 to-rose-800 hover:from-rose-600 hover:to-red-600 text-white text-xs font-bold transition-all shadow-md hover:shadow-rose-900/30 active:scale-95 border border-rose-500/30 disabled:opacity-50 ${className}`}
    >
      {justExported ? (
        <>
          <Check className="w-4 h-4 text-emerald-300 animate-bounce" />
          <span className="text-emerald-200">تم تصدير PDF بنجاح!</span>
        </>
      ) : (
        <>
          <FileDown className={`w-4 h-4 ${isExporting ? "animate-bounce" : ""}`} />
          <span>{isExporting ? "جاري إعداد ملف PDF..." : label}</span>
        </>
      )}
    </button>
  );
};
