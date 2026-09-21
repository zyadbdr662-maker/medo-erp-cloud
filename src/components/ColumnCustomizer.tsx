import React, { useState, useEffect, useRef } from "react";
import { Columns, Check, Eye, EyeOff, RotateCcw, SlidersHorizontal, X } from "lucide-react";

export interface ColumnDef {
  id: string;
  label: string;
  defaultVisible?: boolean;
  locked?: boolean; // Locked columns cannot be hidden (e.g., ID or key action)
}

interface ColumnCustomizerProps {
  tableKey: string;
  columns: ColumnDef[];
  visibleColumns: Record<string, boolean>;
  onChange: (updatedVisibility: Record<string, boolean>) => void;
  className?: string;
}

/**
 * Custom hook to manage table column visibility with localStorage persistence
 */
export function useColumnVisibility(tableKey: string, initialColumns: ColumnDef[]) {
  const storageKey = `medo_erp_cols_${tableKey}`;

  const getInitialState = (): Record<string, boolean> => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure locked columns are always visible and any new initial columns are included
        const result: Record<string, boolean> = {};
        initialColumns.forEach((col) => {
          if (col.locked) {
            result[col.id] = true;
          } else if (parsed[col.id] !== undefined) {
            result[col.id] = parsed[col.id];
          } else {
            result[col.id] = col.defaultVisible !== false;
          }
        });
        return result;
      }
    } catch (e) {
      console.warn("Error reading column visibility from localStorage", e);
    }

    const defaultState: Record<string, boolean> = {};
    initialColumns.forEach((col) => {
      defaultState[col.id] = col.defaultVisible !== false;
    });
    return defaultState;
  };

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(getInitialState);

  const updateVisibility = (newVisibility: Record<string, boolean>) => {
    setVisibleColumns(newVisibility);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newVisibility));
    } catch (e) {
      console.warn("Error saving column visibility to localStorage", e);
    }
  };

  const isVisible = (colId: string): boolean => {
    return visibleColumns[colId] !== false;
  };

  const resetToDefault = () => {
    const defaultState: Record<string, boolean> = {};
    initialColumns.forEach((col) => {
      defaultState[col.id] = col.defaultVisible !== false;
    });
    updateVisibility(defaultState);
  };

  return {
    visibleColumns,
    updateVisibility,
    isVisible,
    resetToDefault,
  };
}

/**
 * Popover dropdown component for customizing visible columns
 */
export const ColumnCustomizer: React.FC<ColumnCustomizerProps> = ({
  tableKey,
  columns,
  visibleColumns,
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleColumn = (id: string) => {
    const col = columns.find((c) => c.id === id);
    if (col?.locked) return; // Cannot toggle locked columns

    const next = {
      ...visibleColumns,
      [id]: !visibleColumns[id],
    };
    onChange(next);
  };

  const showAll = () => {
    const next: Record<string, boolean> = {};
    columns.forEach((c) => {
      next[c.id] = true;
    });
    onChange(next);
  };

  const resetDefault = () => {
    const next: Record<string, boolean> = {};
    columns.forEach((c) => {
      next[c.id] = c.defaultVisible !== false;
    });
    onChange(next);
  };

  const hiddenCount = columns.filter((c) => !visibleColumns[c.id]).length;

  return (
    <div className={`relative inline-block text-right ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-sm active:scale-95"
        title="تخصيص الأعمدة الظاهرة في الجدول"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
        <span>تخصيص الأعمدة</span>
        {hiddenCount > 0 && (
          <span className="px-1.5 py-0.5 text-[10px] font-black bg-blue-500 text-white rounded-full">
            -{hiddenCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Columns className="w-4 h-4 text-blue-400" />
              <span>تخصيص أعمدة الجدول</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="p-2 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={showAll}
              className="text-blue-400 hover:text-blue-300 font-semibold px-2 py-1 rounded hover:bg-blue-950/40 transition-colors flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              <span>إظهار الكل</span>
            </button>
            <button
              type="button"
              onClick={resetDefault}
              className="text-slate-400 hover:text-slate-200 font-semibold px-2 py-1 rounded hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>الافتراضي</span>
            </button>
          </div>

          {/* Columns list */}
          <div className="max-h-60 overflow-y-auto p-2 space-y-1">
            {columns.map((col) => {
              const isVisible = visibleColumns[col.id] !== false;
              return (
                <label
                  key={col.id}
                  onClick={() => toggleColumn(col.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    col.locked
                      ? "opacity-60 cursor-not-allowed bg-slate-950/40"
                      : isVisible
                      ? "bg-slate-800/70 text-slate-100 hover:bg-slate-800"
                      : "bg-slate-950/30 text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      disabled={col.locked}
                      onChange={() => {}} // Handled by label click
                      className="rounded border-slate-600 bg-slate-950 text-blue-500 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span className="font-medium">{col.label}</span>
                  </div>
                  {col.locked ? (
                    <span className="text-[10px] text-amber-400/80 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-800/30">ثابت</span>
                  ) : isVisible ? (
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </label>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800 text-[10px] text-slate-400 text-center">
            يتم حفظ خيارات التخصيص تلقائياً للمستقبل 💾
          </div>
        </div>
      )}
    </div>
  );
};
