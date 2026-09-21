import React from "react";
import { Award, ShieldCheck, Cpu, Globe, Zap, Star, CheckCircle } from "lucide-react";
import { BzmtLogo } from "./BzmtLogo";
import { motion } from "motion/react";

export const PatentCertificateView: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const certID = "BZMT-ERP-2026-X99";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-10 font-sans" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl bg-white p-1 rounded-sm shadow-2xl overflow-hidden"
      >
        {/* Decorative Border Layer 1 */}
        <div className="border-[12px] border-[#0a2540] p-1 h-full">
          {/* Decorative Border Layer 2 (Gold) */}
          <div className="border-4 border-[#d4af37] p-8 sm:p-16 h-full relative bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-repeat">
            
            {/* Corner Embellishments */}
            <div className="absolute top-0 right-0 w-24 h-24 border-t-8 border-r-8 border-[#d4af37] -mr-2 -mt-2"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-t-8 border-l-8 border-[#d4af37] -ml-2 -mt-2"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-8 border-r-8 border-[#d4af37] -mr-2 -mb-2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-8 border-l-8 border-[#d4af37] -ml-2 -mb-2"></div>

            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-4 mb-10">
              <BzmtLogo size="lg" variant="monogram" />
              <div className="inline-block bg-[#d4af37]/20 border border-[#d4af37] px-4 py-1.5 rounded-full text-[#0a2540] font-black text-sm mb-2">
                وثيقة براءة الاختراع الرسمية رقم (6)
              </div>
              <h1 className="text-[#0a2540] text-3xl sm:text-5xl font-black tracking-tighter" style={{ fontFamily: "'Cairo', sans-serif" }}>
                شهادة براءة الاختراع والابتكار السيادي
              </h1>
              <div className="h-1 w-48 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
              <p className="text-slate-600 font-bold text-lg uppercase tracking-widest font-sans">Official Sovereign Patent Certificate No. 6</p>
            </div>

            {/* Main Content */}
            <div className="text-center space-y-8">
              <div className="space-y-2">
                <p className="text-slate-500 text-xl font-medium">تمنح هذه الشهادة تقديراً للرؤية الفذة والجهود الابتكارية لـ:</p>
                <h2 className="text-[#0a2540] text-4xl sm:text-6xl font-black py-4 underline decoration-[#d4af37] decoration-4 underline-offset-8" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  الأستاذ / بدر عايض محمد
                </h2>
              </div>

              <div className="max-w-2xl mx-auto space-y-4 text-slate-700 text-lg sm:text-xl leading-relaxed">
                <p>
                  عن تطوير وتصميم الهيكل المعماري والمنطقي لمنظومة <span className="text-[#d4af37] font-black">MeDo ERP</span> السحابية المتكاملة، والتي تعتبر قفزة نوعية في عالم الحلول البرمجية المؤسسية (SaaS) والمبنية على تقنيات:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                  {[
                    { icon: <Cpu className="w-5 h-5" />, title: "الذكاء المالي المتقدم", desc: "Advanced Financial Intelligence" },
                    { icon: <Zap className="w-5 h-5" />, title: "محرك المزامنة الفورية", desc: "SyncMerge Sovereign Engine" },
                    { icon: <ShieldCheck className="w-5 h-5" />, title: "التشفير السيادي للبيانات", desc: "Military Grade AES-256 GCM" },
                    { icon: <Globe className="w-5 h-5" />, title: "العمل بدون اتصال (Offline-First)", desc: "Sovereign Cloud Architecture" },
                  ].map((tech, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border-r-4 border-[#d4af37] rounded-l-lg">
                      <div className="text-[#0a2540]">{tech.icon}</div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#0a2540]">{tech.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{tech.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-slate-500 italic pt-6">
                "إن هذا الابتكار يمثل نموذجاً فريداً في دمج الذكاء البشري مع التقنيات السحابية المتقدمة لخدمة قطاع الأعمال والمال."
              </p>
            </div>

            {/* Footer / Signatures */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-10 border-t pt-10 border-slate-200">
              <div className="text-center space-y-2">
                <div className="font-mono text-xs text-slate-400 mb-2">Ref: {certID}</div>
                <div className="w-32 h-32 relative mx-auto">
                   <div className="absolute inset-0 border-4 border-double border-[#d4af37] rounded-full flex items-center justify-center overflow-hidden rotate-12 bg-white/50">
                      <div className="text-[10px] font-black text-[#d4af37] text-center leading-tight">
                        CERTIFIED<br/>INNOVATION<br/>2026
                      </div>
                   </div>
                   <Star className="absolute top-0 right-0 text-[#d4af37] fill-[#d4af37] w-6 h-6" />
                </div>
                <p className="text-[#0a2540] font-bold">ختم الاعتماد الرقمي</p>
              </div>

              <div className="text-center space-y-4">
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs uppercase tracking-widest">Authorized By</p>
                  <p className="text-[#0a2540] font-black text-xl italic" style={{ fontFamily: "'Cairo', sans-serif" }}>ميدو تك للحلول البرمجية</p>
                  <p className="text-[#d4af37] font-bold text-sm underline">MeDo Tech Cloud Architecture Team</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>تم التحقق من الامتثال التقني</span>
                </div>
              </div>

              <div className="text-center space-y-1">
                 <p className="text-slate-400 text-xs">تاريخ الإصدار</p>
                 <p className="text-[#0a2540] font-bold font-sans tracking-widest text-lg">19 SEPTEMBER 2026</p>
                 <div className="flex items-center justify-center gap-1">
                    <Star className="w-3 h-3 text-[#d4af37] fill-[#d4af37]" />
                    <Star className="w-3 h-3 text-[#d4af37] fill-[#d4af37]" />
                    <Star className="w-3 h-3 text-[#d4af37] fill-[#d4af37]" />
                    <Star className="w-3 h-3 text-[#d4af37] fill-[#d4af37]" />
                    <Star className="w-3 h-3 text-[#d4af37] fill-[#d4af37]" />
                 </div>
              </div>
            </div>

            {/* Background Seal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none w-full max-w-md">
              <BzmtLogo size="lg" variant="monogram" />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Print Instructions */}
      <div className="fixed bottom-6 right-6 no-print">
        <button 
          onClick={() => window.print()}
          className="bg-[#d4af37] hover:bg-[#b8860b] text-[#0a2540] font-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 transition-transform hover:scale-105"
        >
          <Award className="w-5 h-5" />
          <span>طباعة الشهادة الرسمية</span>
        </button>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          .relative.w-full.max-w-4xl, .relative.w-full.max-w-4xl * { visibility: visible; }
          .relative.w-full.max-w-4xl { position: absolute; left: 0; top: 0; width: 100%; max-width: none; margin: 0; padding: 0; }
        }
      `}</style>
    </div>
  );
};
