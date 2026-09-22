import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  showcaseCategories, 
  showcaseItemsData, 
  ShowcaseItem 
} from "../data/showcaseGalleryData";
import { ShowcaseSnapshotVisualizer } from "./ShowcaseSnapshotVisualizer";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  Share2,
  Copy,
  Check,
  Printer,
  Sparkles,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  Download,
  Info,
  ExternalLink,
  Layers,
  ArrowRight,
  Award,
  Globe
} from "lucide-react";
import { soundService } from "../services/notificationSoundService";

interface ShowcaseGalleryProps {
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
  initialCategory?: string;
  initialItemId?: number;
}

export const ShowcaseGallery: React.FC<ShowcaseGalleryProps> = ({
  isOpen = true,
  onClose,
  isModal = false,
  initialCategory = "ALL",
  initialItemId
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeItem, setActiveItem] = useState<ShowcaseItem | null>(() => {
    if (initialItemId) {
      return showcaseItemsData.find((i) => i.id === initialItemId) || showcaseItemsData[0];
    }
    return null;
  });

  // Lightbox Zoom & Slideshow State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);

  // Filter items based on category and search
  const filteredItems = useMemo(() => {
    return showcaseItemsData.filter((item) => {
      const matchesCategory =
        selectedCategory === "ALL" || item.categoryKey === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.badge.toLowerCase().includes(query) ||
        item.features.some((f) => f.toLowerCase().includes(query)) ||
        item.id.toString() === query
      );
    });
  }, [selectedCategory, searchQuery]);

  // Slideshow timer
  useEffect(() => {
    let interval: any;
    if (isPlayingSlideshow && activeItem) {
      interval = setInterval(() => {
        const currentIndex = filteredItems.findIndex((i) => i.id === activeItem.id);
        const nextIndex = (currentIndex + 1) % filteredItems.length;
        setActiveItem(filteredItems[nextIndex]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlayingSlideshow, activeItem, filteredItems]);

  // Keyboard navigation (Arrow keys & ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeItem) return;

      if (e.key === "Escape") {
        if (isModal && !activeItem && onClose) {
          onClose();
        } else {
          setActiveItem(null);
          setIsPlayingSlideshow(false);
          setZoomLevel(1);
        }
      } else if (e.key === "ArrowLeft") {
        // Next in Arabic RTL
        handleNextItem();
      } else if (e.key === "ArrowRight") {
        // Prev in Arabic RTL
        handlePrevItem();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeItem, filteredItems]);

  const handleNextItem = useCallback(() => {
    if (!activeItem || filteredItems.length === 0) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === activeItem.id);
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    setActiveItem(filteredItems[nextIndex]);
    setZoomLevel(1);
  }, [activeItem, filteredItems]);

  const handlePrevItem = useCallback(() => {
    if (!activeItem || filteredItems.length === 0) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === activeItem.id);
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setActiveItem(filteredItems[prevIndex]);
    setZoomLevel(1);
  }, [activeItem, filteredItems]);

  const handleShare = (platform: "WHATSAPP" | "TWITTER" | "FACEBOOK" | "LINKEDIN" | "COPY") => {
    const shareUrl = `${window.location.origin}/gallery?item=${activeItem?.id || 1}`;
    const shareText = `🖼️ شاهد قوة منظومة MeDo Cloud ERP - ${activeItem?.title} | الشاشة الرسمية المعتمدة`;

    if (platform === "COPY") {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopiedLink(true);
      soundService.playSound("SUCCESS_CHIME");
      setTimeout(() => setCopiedLink(false), 2500);
    } else if (platform === "WHATSAPP") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`, "_blank");
    } else if (platform === "TWITTER") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
    } else if (platform === "FACEBOOK") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    } else if (platform === "LINKEDIN") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
    }
  };

  if (isModal && !isOpen) return null;

  const content = (
    <div className="w-full flex flex-col space-y-6 text-slate-100" dir="rtl">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#091f36] via-[#0b2744] to-[#071727] p-5 sm:p-7 rounded-3xl border border-[#d4af37]/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>معرض الشاشات الحية (90 شاشة معتمدة)</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-xs">
              Live Interactive Showcase
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🖼️ معرض نظام MeDo ERP - شاهد قوته قبل التجربة</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-1 max-w-2xl">
            كتالوج بصري وتفاعلي حي يغطي جميع الحركات المحاسبية، الوحدات التشغيلية، التقارير الضريبية، والأجهزة المدعومة.
          </p>
        </div>

        {/* TOP ACTIONS / METRICS */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <div className="bg-[#05111e] px-4 py-2.5 rounded-2xl border border-slate-700 text-center">
            <div className="text-[11px] text-slate-400 font-bold">إجمالي الشاشات</div>
            <div className="text-xl font-black text-amber-400 font-mono">90 / 90</div>
          </div>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700 cursor-pointer"
              title="إغلاق المعرض"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* SEARCH AND CATEGORY FILTER TABS */}
      <div className="space-y-4">
        {/* SEARCH INPUT */}
        <div className="relative w-full max-w-2xl mx-auto">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 ابحث في المعرض (مثال: فاتورة مبيعات، قيد بالذكاء الاصطناعي، رواتب، ZATCA، كشف حساب)..."
            className="w-full bg-[#07182c] border border-slate-700/80 focus:border-amber-400 rounded-2xl pr-12 pl-4 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs bg-slate-800 px-2 py-1 rounded-md"
            >
              مسح
            </button>
          )}
        </div>

        {/* CATEGORY TABS CAROUSEL */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
          {showcaseCategories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  setSelectedCategory(cat.key);
                  soundService.playSound("ENTERPRISE_BELL");
                }}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 shrink-0 border cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-[#07182c] border-amber-400 shadow-lg shadow-amber-500/20 font-black scale-105"
                    : "bg-[#081b30] hover:bg-[#0e2c4d] text-slate-300 hover:text-white border-slate-700/80"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.nameAr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* GALLERY GRID */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-[#07182c] rounded-3xl border border-slate-800 p-8">
          <Info className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-white mb-1">لم يتم العثور على شاشات مطابقة لبحثك</h3>
          <p className="text-sm text-slate-400">جرب البحث بكلمة أخرى أو اختر تصنيفاً آخر من القائمة أعلاه.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
            }}
            className="mt-4 px-5 py-2 rounded-xl bg-amber-500 text-[#07182c] font-black text-xs hover:bg-amber-400 transition"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveItem(item);
                setZoomLevel(1);
                soundService.playSound("CASH_FLOW_PULSE");
              }}
              className="group bg-gradient-to-b from-[#0a233d] to-[#061626] border border-slate-700/70 hover:border-amber-400/80 rounded-2xl p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between"
            >
              {/* CARD TOP */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800/90 text-amber-300 font-mono text-[11px] font-bold border border-slate-700">
                    #{item.id.toString().padStart(2, "0")}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                    {item.category}
                  </span>
                </div>

                {/* THUMBNAIL SNAPSHOT PREVIEW */}
                <div className="relative rounded-xl overflow-hidden bg-[#030a13] border border-slate-800 p-2.5 mb-3 group-hover:border-amber-400/50 transition">
                  <div className="h-32 w-full overflow-hidden relative flex flex-col justify-between p-2 bg-[#061424] rounded-lg text-[10px] text-slate-400 select-none">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <div className="flex items-center gap-1 font-bold text-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <span className="truncate max-w-[130px]">{item.title}</span>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-mono">IFRS/GAAP</span>
                    </div>

                    <div className="space-y-1 py-1 font-mono text-[9px] opacity-70">
                      <div className="flex justify-between">
                        <span>قيد/فاتورة مرحلة</span>
                        <span className="text-amber-300 font-bold">150,000 YER</span>
                      </div>
                      <div className="flex justify-between">
                        <span>تسوية محاسبية</span>
                        <span className="text-emerald-400 font-bold">متوازن 100%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[9px]">
                      <span className="text-slate-500">AES-256 GCM</span>
                      <span className="text-amber-400 font-bold">{item.badge}</span>
                    </div>
                  </div>

                  {/* HOVER OVERLAY */}
                  <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-[#0a233d] font-black text-xs flex items-center gap-1.5 shadow-lg">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>تكبير الشاشة</span>
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition line-clamp-1 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                  {item.description}
                </p>
              </div>

              {/* CARD FOOTER */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] font-mono text-slate-400">{item.specs.engine}</span>
                <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px] group-hover:translate-x-[-2px] transition">
                  <span>تفاصيل الشاشة</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {activeItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md">
          <div 
            className="relative w-full max-w-5xl max-h-[95vh] bg-[#071a2e] border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* LIGHTBOX TOP TOOLBAR */}
            <div className="bg-[#051424] border-b border-slate-700/80 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 font-mono">
                  #{activeItem.id.toString().padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-black text-white text-sm sm:text-base">{activeItem.title}</h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>📂 {activeItem.category}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{activeItem.badge}</span>
                  </div>
                </div>
              </div>

              {/* CONTROLS: ZOOM / SLIDESHOW / SHARE / CLOSE */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* SLIDESHOW TOGGLE */}
                <button
                  type="button"
                  onClick={() => setIsPlayingSlideshow(!isPlayingSlideshow)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border cursor-pointer ${
                    isPlayingSlideshow
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700"
                  }`}
                  title="تشغيل العرض التلقائي للشرائح (3 ثوان)"
                >
                  {isPlayingSlideshow ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isPlayingSlideshow ? "إيقاف العرض" : "عرض تلقائي"}</span>
                </button>

                {/* ZOOM BUTTONS */}
                <div className="hidden sm:flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                    className="p-1.5 text-slate-300 hover:text-white rounded-lg transition"
                    title="تصغير"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-[10px] font-mono text-amber-300">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
                    className="p-1.5 text-slate-300 hover:text-white rounded-lg transition"
                    title="تكبير"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                    title="إعادة ضبط الحجم"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>

                {/* SHARE BUTTON */}
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                    title="مشاركة الصورة"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">مشاركة</span>
                  </button>

                  {/* SHARE DROPDOWN */}
                  {showShareMenu && (
                    <div className="absolute left-0 top-full mt-2 w-48 bg-[#091e33] border border-slate-700 rounded-2xl p-2 shadow-2xl z-30 space-y-1">
                      <button
                        onClick={() => {
                          handleShare("COPY");
                          setShowShareMenu(false);
                        }}
                        className="w-full text-right px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl flex items-center justify-between"
                      >
                        <span>نسخ الرابط والوصف</span>
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                      <button
                        onClick={() => {
                          handleShare("WHATSAPP");
                          setShowShareMenu(false);
                        }}
                        className="w-full text-right px-3 py-2 text-xs text-emerald-300 hover:bg-slate-800 rounded-xl flex items-center justify-between"
                      >
                        <span>مشاركة عبر واتساب</span>
                        <span>💬</span>
                      </button>
                      <button
                        onClick={() => {
                          handleShare("TWITTER");
                          setShowShareMenu(false);
                        }}
                        className="w-full text-right px-3 py-2 text-xs text-sky-300 hover:bg-slate-800 rounded-xl flex items-center justify-between"
                      >
                        <span>مشاركة على تويتر (X)</span>
                        <span>🐦</span>
                      </button>
                      <button
                        onClick={() => {
                          handleShare("LINKEDIN");
                          setShowShareMenu(false);
                        }}
                        className="w-full text-right px-3 py-2 text-xs text-blue-300 hover:bg-slate-800 rounded-xl flex items-center justify-between"
                      >
                        <span>مشاركة على لينكد إن</span>
                        <span>💼</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* CLOSE LIGHTBOX BUTTON */}
                <button
                  onClick={() => {
                    setActiveItem(null);
                    setIsPlayingSlideshow(false);
                    setZoomLevel(1);
                  }}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 flex items-center justify-center transition border border-slate-700 cursor-pointer"
                  title="إغلاق (ESC)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* LIGHTBOX MAIN BODY & VISUALIZER */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center relative bg-[#030c18]">
              
              {/* PREV / NEXT NAVIGATION BUTTONS */}
              <button
                onClick={handlePrevItem}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-[#071a2e] text-white border border-slate-700 flex items-center justify-center transition shadow-lg cursor-pointer"
                title="الشاشة السابقة (السهم الأيمن)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <button
                onClick={handleNextItem}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-[#071a2e] text-white border border-slate-700 flex items-center justify-center transition shadow-lg cursor-pointer"
                title="الشاشة التالية (السهم الأيسر)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* HIGH FIDELITY SNAPSHOT RENDERER */}
              <div className="w-full max-w-4xl py-2">
                <ShowcaseSnapshotVisualizer item={activeItem} zoomLevel={zoomLevel} />
              </div>

            </div>

            {/* LIGHTBOX BOTTOM METADATA BAR */}
            <div className="bg-[#051424] border-t border-slate-700/80 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <span className="font-bold text-amber-400">
                  شاشة {activeItem.id} من {filteredItems.length}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">تنقل بالأسهم (⬅️ ➡️) أو اضغط ESC للإغلاق</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleShare("COPY")}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#071a2e] font-black transition flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? "تم نسخ الرابط بنجاح!" : "نسخ رابط الشاشة"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center">
        <div className="relative w-full max-w-7xl max-h-[92vh] overflow-y-auto bg-[#051221] border border-amber-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
