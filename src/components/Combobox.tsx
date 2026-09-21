import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

export interface ComboboxOption {
  id: string;
  label: string;
  secondaryLabel?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = "اختر من القائمة...",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.id === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        (opt.secondaryLabel && opt.secondaryLabel.toLowerCase().includes(term))
    );
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        onClick={handleToggle}
        className={`flex items-center justify-between w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 cursor-pointer transition-all focus:border-emerald-500 ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-slate-600"
        } ${isOpen ? "border-emerald-500 ring-2 ring-emerald-500/10" : ""}`}
      >
        <div className="flex-1 truncate">
          {selectedOption ? (
            <div className="flex flex-col">
              <span className="font-medium text-slate-100">{selectedOption.label}</span>
              {selectedOption.secondaryLabel && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedOption.secondaryLabel}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {value && !disabled && (
            <X
              className="w-3.5 h-3.5 text-slate-500 hover:text-rose-400"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[60] w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-slate-800 flex items-center gap-2 bg-slate-950">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="ابحث هنا..."
              className="w-full bg-transparent border-none focus:ring-0 text-xs text-slate-200 placeholder-slate-500 py-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                لا توجد نتائج مطابقة لبحثك
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-xs transition-colors hover:bg-slate-800/80 ${
                    value === opt.id ? "bg-emerald-600/10 text-emerald-400 font-bold" : "text-slate-300"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="truncate">{opt.label}</span>
                    {opt.secondaryLabel && (
                      <span className="text-[10px] opacity-60 font-mono">
                        {opt.secondaryLabel}
                      </span>
                    )}
                  </div>
                  {value === opt.id && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
