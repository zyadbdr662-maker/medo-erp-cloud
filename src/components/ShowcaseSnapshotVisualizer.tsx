import React from "react";
import { ShowcaseItem } from "../data/showcaseGalleryData";
import { 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  ShoppingCart, 
  Package, 
  Users, 
  Database, 
  TrendingUp, 
  Cpu, 
  CheckCircle2, 
  Lock, 
  QrCode, 
  Printer, 
  Smartphone, 
  Tablet, 
  Monitor, 
  BarChart4, 
  Building2, 
  CreditCard, 
  DollarSign, 
  Scale, 
  Clock, 
  Receipt,
  Layers,
  ArrowRight,
  Share2,
  Workflow,
  Radio
} from "lucide-react";

interface ShowcaseSnapshotVisualizerProps {
  item: ShowcaseItem;
  className?: string;
  zoomLevel?: number;
}

export const ShowcaseSnapshotVisualizer: React.FC<ShowcaseSnapshotVisualizerProps> = ({
  item,
  className = "",
  zoomLevel = 1
}) => {
  return (
    <div 
      className={`relative w-full rounded-2xl overflow-hidden bg-[#040e1b] border border-slate-700/80 shadow-2xl flex flex-col select-none ${className}`}
      style={{ transform: zoomLevel !== 1 ? `scale(${zoomLevel})` : undefined, transformOrigin: "top center", transition: "transform 0.2s ease" }}
    >
      {/* WINDOW TITLE BAR */}
      <div className="bg-[#091b2e] border-b border-slate-700/80 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="font-mono text-slate-400 text-[11px] mr-2">
            medo-erp://secure-tenant/module/{item.moduleKey}/{item.id.toString().padStart(2, "0")}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>{item.specs.securityLevel}</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
            {item.specs.engine}
          </span>
        </div>
      </div>

      {/* SUB-HEADER / ERP BREADCRUMB */}
      <div className="bg-[#061424] px-4 py-2 flex items-center justify-between border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-200">
          <span className="text-amber-400">🏢 MeDo Cloud ERP</span>
          <span className="text-slate-600">/</span>
          <span className="text-blue-300">{item.category}</span>
          <span className="text-slate-600">/</span>
          <span className="text-white">{item.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-amber-400/10 text-amber-300 text-[10px] font-mono rounded border border-amber-400/30">
            {item.badge}
          </span>
        </div>
      </div>

      {/* INNER VIEW CANVAS */}
      <div className="p-4 sm:p-6 bg-gradient-to-b from-[#061527] via-[#040e1b] to-[#02070f] flex-1 min-h-[360px] sm:min-h-[420px] flex flex-col justify-between relative overflow-hidden">
        
        {/* WATERMARK BACKGROUND */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
          <span className="text-[90px] font-black text-white tracking-widest rotate-[-25deg]">
            MeDo CLOUD ERP
          </span>
        </div>

        {/* TOP STATUS CARDS / METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4 relative z-10">
          <div className="bg-[#0a233d]/70 border border-blue-500/30 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400">حالة السجل / المستند</div>
            <div className="text-xs sm:text-sm font-black text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>معتمد ومرحل آلياً</span>
            </div>
          </div>
          <div className="bg-[#0a233d]/70 border border-blue-500/30 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400">الفرع / المنشأة</div>
            <div className="text-xs sm:text-sm font-black text-white truncate mt-0.5">
              الفرع الرئيسي - صنعاء
            </div>
          </div>
          <div className="bg-[#0a233d]/70 border border-blue-500/30 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400">العملة والتقييم</div>
            <div className="text-xs sm:text-sm font-black text-amber-300 font-mono mt-0.5">
              YER / SAR / USD
            </div>
          </div>
          <div className="bg-[#0a233d]/70 border border-blue-500/30 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400">رمز التحقق الرقمي</div>
            <div className="text-xs sm:text-sm font-black text-blue-300 font-mono mt-0.5 truncate">
              #MD-{(item.id * 1047 + 29).toString(16).toUpperCase()}
            </div>
          </div>
        </div>

        {/* MAIN MOCK CONTENT BASED ON CATEGORY */}
        <div className="bg-[#081b30]/90 border border-slate-700/80 rounded-xl p-3 sm:p-4 mb-4 relative z-10 flex-1 flex flex-col justify-between">
          
          {/* CONTENT HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3 mb-3">
            <div>
              <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>{item.title}</span>
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>مطابق لمعايير IFRS</span>
              </span>
            </div>
          </div>

          {/* SIMULATED ACCOUNTING TABLE / DATA GRID */}
          <div className="overflow-x-auto rounded-lg border border-slate-800 bg-[#040d18] mb-3">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-[#0c2642] text-slate-200 font-bold border-b border-slate-700">
                <tr>
                  <th className="p-2"># البند / الحساب</th>
                  <th className="p-2">البيان / الوصف</th>
                  <th className="p-2">الكمية / النسبة</th>
                  <th className="p-2">مدين / سعر</th>
                  <th className="p-2">دائن / إجمالي</th>
                  <th className="p-2 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                <tr className="hover:bg-blue-950/30">
                  <td className="p-2 font-bold text-white">01. {item.categoryKey === "SALES" ? "فاتورة مبيعات - عميل آجل" : item.categoryKey === "PURCHASES" ? "توريد بضاعة - مورد معتمد" : item.categoryKey === "HR" ? "راتب وبدلات أساسية" : "قيد محاسبي مرحل"}</td>
                  <td className="p-2 text-slate-400">معالجة فورية متطابقة مع الشجرة</td>
                  <td className="p-2 text-amber-300">1.00</td>
                  <td className="p-2 text-emerald-400 font-bold">150,000 YER</td>
                  <td className="p-2 text-slate-400">0.00 YER</td>
                  <td className="p-2 text-center"><span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px]">مؤكد</span></td>
                </tr>
                <tr className="hover:bg-blue-950/30">
                  <td className="p-2 font-bold text-white">02. {item.categoryKey === "TREASURY" ? "محفظة جوالي / بنك اليمن" : item.categoryKey === "ASSETS" ? "مجمع الإهلاك السنوي (IAS 16)" : "ضريبة القيمة المضافة / أرباح"}</td>
                  <td className="p-2 text-slate-400">تسوية فوارق وحسابات ختامية</td>
                  <td className="p-2 text-amber-300">15.00%</td>
                  <td className="p-2 text-slate-400">0.00 YER</td>
                  <td className="p-2 text-blue-400 font-bold">150,000 YER</td>
                  <td className="p-2 text-center"><span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px]">متوازن</span></td>
                </tr>
                <tr className="hover:bg-blue-950/30 bg-[#0a1e33]/50">
                  <td colSpan={3} className="p-2 font-black text-amber-300 text-right">إجمالي القيمة المتوازنة:</td>
                  <td className="p-2 font-black text-emerald-400">150,000 YER</td>
                  <td className="p-2 font-black text-blue-400">150,000 YER</td>
                  <td className="p-2 text-center font-bold text-emerald-400">⚖️ متطابق</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* KEY FEATURES PILLS */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 font-bold">المزايا التقنية:</span>
            {item.features.map((feat, idx) => (
              <span 
                key={idx} 
                className="px-2.5 py-0.5 rounded-full bg-[#0a233d] border border-blue-500/30 text-blue-200 text-[10px] font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>{feat}</span>
              </span>
            ))}
          </div>
        </div>

        {/* BOTTOM SIGNATURE & STAMP BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>مصدّق رقمياً من ميدو تك للحلول البرمجية</span>
            </div>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-slate-400 text-[10px]">{item.specs.resolution}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
              FORMAT: {item.specs.format}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
              عينة حية من بيئة التشغيل
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
