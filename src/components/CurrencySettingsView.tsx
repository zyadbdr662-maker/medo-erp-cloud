import React, { useState } from "react";
import {
  DollarSign,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  ArrowRightLeft,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Calculator,
} from "lucide-react";
import { CurrencyCode, CurrencyInfo } from "../types/erp";
import { formatMoney, formatNumberOnly } from "../services/erpStorage";

interface CurrencySettingsViewProps {
  currencies: CurrencyInfo[];
  onUpdateExchangeRate: (currencyCode: CurrencyCode, newRateToUSD: number) => void;
  onExecuteForexRevaluation: () => void;
}

export const CurrencySettingsView: React.FC<CurrencySettingsViewProps> = ({
  currencies,
  onUpdateExchangeRate,
  onExecuteForexRevaluation,
}) => {
  const [editingCode, setEditingCode] = useState<CurrencyCode | null>(null);
  const [newRate, setNewRate] = useState<number>(0);

  const startEdit = (c: CurrencyInfo) => {
    setEditingCode(c.code);
    setNewRate(c.exchangeRateToUSD);
  };

  const handleSave = (code: CurrencyCode) => {
    if (newRate > 0) {
      onUpdateExchangeRate(code, newRate);
      setEditingCode(null);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">إدارة أسعار الصرف وإعادة تقييم العملات الأجنبية (Forex Valuation)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            دعم متكامل لازدواج أسعار الصرف في اليمن (صنعاء / عدن) مع معيار المحاسبة الدولي IAS 21
          </p>
        </div>

        <button
          onClick={onExecuteForexRevaluation}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
        >
          <Calculator className="w-4 h-4" />
          <span>تشغيل قيد إعادة تقييم العملة (FAGL_FC_VAL)</span>
        </button>
      </div>

      {/* Live Exchange Rates Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currencies.map((c) => (
          <div
            key={c.code}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  {c.symbol}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{c.name}</h3>
                  <div className="text-[10px] text-slate-400 font-mono">{c.code}</div>
                </div>
              </div>

              {c.isBase ? (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  العملة المرجعية للنظام
                </span>
              ) : (
                <button
                  onClick={() => startEdit(c)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  تعديل السعر
                </button>
              )}
            </div>

            {editingCode === c.code ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-[11px] text-slate-400 font-semibold block">سعر الصرف مقابل 1 دولار أمريكي:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    value={newRate}
                    onChange={(e) => setNewRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-left font-bold"
                  />
                  <button
                    onClick={() => handleSave(c.code)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    حفظ
                  </button>
                  <button
                    onClick={() => setEditingCode(null)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">سعر الصرف الحالي:</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  $1 USD = {c.exchangeRateToUSD} {c.symbol}
                </span>
              </div>
            )}

            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
              <span>آخر تحديث: {c.lastUpdated}</span>
              <span className="text-emerald-400">نظام التسعير المالي المباشر</span>
            </div>
          </div>
        ))}
      </div>

      {/* Regulatory IAS 21 Guideline Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 font-bold text-cyan-400">
          <ShieldCheck className="w-4 h-4" />
          <span>قواعد المعيار المحاسبي الدولي IAS 21 (آثار التغيرات في أسعار صرف العملات الأجنبية)</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          يتم تسجيل المعاملات بالعملة الأجنبية مبدئياً بسعر الصرف السائد في تاريخ المعاملة. وفي نهاية كل فترة مالية، تتم إعادة ترجمة البنود النقدية بالعملات الأجنبية باستخدام سعر الإقفال، وتُسجل فروق تقييم العملة (أرباح أو خسائر غير محققة) في قائمة الدخل لحساب "فروق صرف عملات أجنبية".
        </p>
      </div>
    </div>
  );
};
