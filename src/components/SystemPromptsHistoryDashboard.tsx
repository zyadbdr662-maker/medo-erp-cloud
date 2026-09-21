import React, { useState, useMemo } from "react";
import {
  History,
  Search,
  Filter,
  Download,
  PlusCircle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Terminal,
  FileText,
  Trash2,
  RefreshCw,
  Layers,
  ArrowUpRight,
  Code2,
  Share2,
  Tag,
  Calendar,
  UserCheck,
  Copy,
  Check,
  Printer,
  ChevronDown,
  ChevronUp,
  Cpu,
  Boxes,
  Zap,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  X
} from "lucide-react";
import {
  SystemPromptsHistoryService,
  SystemPromptRecord,
} from "../services/systemPromptsHistoryService";

export const SystemPromptsHistoryDashboard: React.FC = () => {
  const [history, setHistory] = useState<SystemPromptRecord[]>(() =>
    SystemPromptsHistoryService.getHistory()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedImpact, setSelectedImpact] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Record Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [newStageLabel, setNewStageLabel] = useState("");
  const [newActionSummary, setNewActionSummary] = useState("");
  const [newCategory, setNewCategory] = useState<SystemPromptRecord["category"]>("UI_UX");
  const [newAuthor, setNewAuthor] = useState("المسؤول التنفيذي (zyadbdr925@gmail.com)");
  const [newImpact, setNewImpact] = useState<SystemPromptRecord["impactLevel"]>("HIGH");
  const [newTechDetails, setNewTechDetails] = useState("");
  const [newTagsStr, setNewTagsStr] = useState("");
  const [newComponentsStr, setNewComponentsStr] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const refreshData = () => {
    setHistory(SystemPromptsHistoryService.getHistory());
    showToast("تم تحديث ومزامنة السجل الزمني بنجاح ⚡");
  };

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchSearch =
        item.userPrompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.systemActionSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.stageLabelAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.technicalDetails && item.technicalDetails.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.targetComponents.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;

      const matchImpact =
        selectedImpact === "ALL" || item.impactLevel === selectedImpact;

      return matchSearch && matchCategory && matchImpact;
    });
  }, [history, searchTerm, selectedCategory, selectedImpact]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = history.length;
    const criticalCount = history.filter((h) => h.impactLevel === "CRITICAL").length;
    const securityCount = history.filter((h) => h.category === "SECURITY").length;
    const uiCount = history.filter((h) => h.category === "UI_UX").length;
    const accountingCount = history.filter((h) => h.category === "ACCOUNTING").length;
    const architectureCount = history.filter((h) => h.category === "ARCHITECTURE").length;
    return { total, criticalCount, securityCount, uiCount, accountingCount, architectureCount };
  }, [history]);

  const handleCopyText = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`تم نسخ ${label} إلى الحافظة بنجاح 📋`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = SystemPromptsHistoryService.exportAsJSON();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `medo_erp_system_prompts_history_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("تم تنزيل ملف السجل التوثيقي JSON بنجاح 📥");
  };

  const handleExportCSV = () => {
    const headers = [
      "المعرف",
      "التاريخ والوقت",
      "المرحلة",
      "نص الطلب والمحادثة",
      "الإجراء البرمجي المنفذ",
      "التصنيف",
      "صاحب الطلب",
      "مستوى الأثر",
      "المكونات المتأثرة",
      "التفاصيل الفنية"
    ];

    const rows = history.map((item) => [
      item.id,
      new Date(item.timestamp).toLocaleString("ar-YE"),
      `"${item.stageLabelAr.replace(/"/g, '""')}"`,
      `"${item.userPrompt.replace(/"/g, '""')}"`,
      `"${item.systemActionSummary.replace(/"/g, '""')}"`,
      item.category,
      item.author,
      item.impactLevel,
      `"${item.targetComponents.join(", ")}"`,
      `"${(item.technicalDetails || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `medo_erp_system_prompts_history_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("تم تصدير ملف CSV الشامل بنجاح 📊");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddNewRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim() || !newActionSummary.trim() || !newStageLabel.trim()) {
      alert("يرجى تعبئة كافة الحقول الأساسية.");
      return;
    }

    const tags = newTagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const targetComponents = newComponentsStr
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    SystemPromptsHistoryService.addRecord({
      stage: "CUSTOM_REQUEST",
      stageLabelAr: newStageLabel.trim(),
      userPrompt: newPrompt.trim(),
      systemActionSummary: newActionSummary.trim(),
      targetComponents: targetComponents.length > 0 ? targetComponents : ["SystemPromptsHistoryDashboard"],
      status: "COMPLETED",
      category: newCategory,
      author: newAuthor.trim() || "المسؤول التنفيذي",
      impactLevel: newImpact,
      technicalDetails: newTechDetails.trim(),
      tags: tags.length > 0 ? tags : ["طلب جديد", "إجراء تنفيذي"],
    });

    setShowAddModal(false);
    setNewPrompt("");
    setNewStageLabel("");
    setNewActionSummary("");
    setNewTechDetails("");
    setNewTagsStr("");
    setNewComponentsStr("");
    refreshData();
    showToast("تم تسجيل وتوثيق المحطة الجديدة في السجل السيادي بنجاح ✨");
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا السجل من الخط الزمني للنظام؟")) {
      SystemPromptsHistoryService.deleteRecord(id);
      refreshData();
      showToast("تم حذف السجل من الخط الزمني.");
    }
  };

  const handleResetDefaults = () => {
    if (confirm("هل تريد استعادة وتحديث السجل المرجعي المبدئي لكافة الطلبات والمراحل؟")) {
      SystemPromptsHistoryService.resetToDefault();
      refreshData();
      showToast("تمت استعادة السجل التوثيقي المرجعي بكفاءة.");
    }
  };

  const getImpactBadge = (level: SystemPromptRecord["impactLevel"]) => {
    switch (level) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-rose-950/80 to-rose-900/40 text-rose-300 border border-rose-500/50 shadow-sm shadow-rose-950/50">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            تأثير جوهري (Critical)
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-950/80 to-amber-900/40 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-950/50">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            تأثير عالي (High)
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-blue-950/80 to-blue-900/40 text-blue-300 border border-blue-500/50">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            تأثير متوسط (Medium)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900 text-slate-300 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            قياسي (Standard)
          </span>
        );
    }
  };

  const getCategoryBadge = (category: SystemPromptRecord["category"]) => {
    switch (category) {
      case "ARCHITECTURE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-indigo-950/70 text-indigo-300 border border-indigo-500/40 shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            معمارية وهيكلة
          </span>
        );
      case "ACCOUNTING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shadow-sm">
            <Boxes className="w-3.5 h-3.5 text-emerald-400" />
            محاسبة ومعايير
          </span>
        );
      case "SECURITY":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-rose-950/70 text-rose-300 border border-rose-500/40 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            أمان وبوابات
          </span>
        );
      case "UI_UX":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-purple-950/70 text-purple-300 border border-purple-500/40 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            واجهات وأناقة
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            تدقيق ورقابة
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-right font-sans relative" dir="rtl">
      {/* Toast Floating Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-[200] bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-2xl border border-blue-400/50 animate-bounce flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#0B1528] via-[#080E1C] to-[#040810] border border-blue-500/40 p-6 sm:p-9 shadow-2xl shadow-blue-950/50">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-500/10 border border-blue-400/40 text-blue-300 text-xs font-black shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <History className="w-3.5 h-3.5 text-blue-300" />
              <span>السجل السيادي التاريخي • Central Prompts & Actions Audit Suite</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
              سجل المحادثات، التوجيهات البرمجية والإجراءات المنفذة
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              سجل تفاعلي فاخر وموثق لكافة الطلبات، التوجيهات المعمارية، القرارات المالية والأمنية، والإجراءات البرمجية التي شكلت معالم نظام <span className="text-amber-300 font-bold">MeDo ERP</span> منذ لحظة الانطلاق.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-black shadow-xl shadow-blue-600/30 border border-blue-400/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>إضافة طلب / توثيق محطة</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition shadow-lg cursor-pointer"
              title="طباعة تقرير السجل الزمني"
            >
              <Printer className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">طباعة التقرير</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition shadow-lg cursor-pointer"
              title="تصدير السجل الكامل بصيغة CSV"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition shadow-lg cursor-pointer"
              title="تصدير السجل الكامل بصيغة JSON"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>JSON</span>
            </button>

            <button
              onClick={refreshData}
              className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition shadow-lg cursor-pointer"
              title="تحديث البيانات فورياً"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Records */}
        <div className="bg-gradient-to-br from-[#0C1B33] to-[#070E1A] border border-blue-500/30 p-4 rounded-3xl shadow-xl space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">إجمالي المحطات والطلبات</span>
            <History className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.total}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>موثقة ومكتملة 100%</span>
          </div>
        </div>

        {/* Critical Milestones */}
        <div className="bg-gradient-to-br from-[#1C0E1B] to-[#070E1A] border border-rose-500/30 p-4 rounded-3xl shadow-xl space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-20 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-300 font-bold">المحطات الجوهرية (Critical)</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-300 font-mono">{stats.criticalCount}</p>
          <div className="text-[11px] text-slate-400">تأسيس المعمارية والتأمين</div>
        </div>

        {/* Security & Gateways */}
        <div className="bg-gradient-to-br from-[#1C160E] to-[#070E1A] border border-amber-500/30 p-4 rounded-3xl shadow-xl space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-300 font-bold">الأمان وبوابات السيادة</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">{stats.securityCount}</p>
          <div className="text-[11px] text-slate-400">بصمة العتاد والتشفير</div>
        </div>

        {/* UI / UX Polish */}
        <div className="bg-gradient-to-br from-[#180E24] to-[#070E1A] border border-purple-500/30 p-4 rounded-3xl shadow-xl space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-300 font-bold">الواجهات وجمال الشاشة</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">{stats.uiCount}</p>
          <div className="text-[11px] text-emerald-400 font-bold">ترقية بصرية وأناقة ملكية</div>
        </div>

        {/* Financial & Accounting */}
        <div className="bg-gradient-to-br from-[#0E1C16] to-[#070E1A] border border-emerald-500/30 p-4 rounded-3xl shadow-xl space-y-1 relative overflow-hidden group col-span-2 lg:col-span-1">
          <div className="absolute top-0 left-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-300 font-bold">المحاسبة والمعايير</span>
            <Boxes className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">{stats.accountingCount}</p>
          <div className="text-[11px] text-slate-400">شجرة الحسابات والمخزون</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-gradient-to-r from-[#0B1528] to-[#070E1A] border border-blue-500/30 p-4 sm:p-5 rounded-3xl shadow-2xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-blue-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث ذكي في نصوص الطلبات، الإجراءات، الوسوم، أو المكونات المتأثرة..."
              className="w-full bg-[#050B14] border border-blue-500/30 focus:border-blue-400 rounded-2xl pr-10 pl-10 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#050B14] border border-slate-700/80 rounded-2xl px-3 py-1.5 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={selectedImpact}
                onChange={(e) => setSelectedImpact(e.target.value)}
                className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">كافة مستويات الأثر</option>
                <option value="CRITICAL" className="bg-slate-900">جوهري (Critical)</option>
                <option value="HIGH" className="bg-slate-900">عالي (High)</option>
                <option value="MEDIUM" className="bg-slate-900">متوسط (Medium)</option>
                <option value="STANDARD" className="bg-slate-900">قياسي (Standard)</option>
              </select>
            </div>

            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold border border-slate-700 transition cursor-pointer"
              title="استعادة السجل الأساسي"
            >
              استعادة الافتراضي
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-bold ml-1">تصفية حسب المحور:</span>
          {[
            { id: "ALL", label: "كافة التصنيفات", count: history.length },
            { id: "ARCHITECTURE", label: "معمارية وهيكلة", count: stats.architectureCount },
            { id: "ACCOUNTING", label: "محاسبة ومعايير", count: stats.accountingCount },
            { id: "SECURITY", label: "أمان وبوابات", count: stats.securityCount },
            { id: "UI_UX", label: "واجهات وأناقة", count: stats.uiCount },
            { id: "SYSTEM_AUDIT", label: "تدقيق ورقابة", count: history.filter(h => h.category === "SYSTEM_AUDIT").length },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/50"
                  : "bg-slate-950/70 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800"
              }`}
            >
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Timeline Stream */}
      <div className="space-y-4 relative">
        {/* Continuous Line Decorator for Timeline */}
        <div className="absolute top-8 bottom-8 right-6 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-blue-500/20 hidden md:block" />

        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center bg-[#0B1528]/80 border border-slate-800 rounded-3xl space-y-3 shadow-2xl">
            <History className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
            <p className="text-base font-bold text-slate-200">لا توجد محطات مطابقة لمعايير البحث</p>
            <p className="text-xs text-slate-400">جرب تغيير كلمات البحث أو إعادة ضبط خيارات التصفية.</p>
            <button
              onClick={() => { setSearchTerm(""); setSelectedCategory("ALL"); setSelectedImpact("ALL"); }}
              className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 cursor-pointer"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          filteredHistory.map((item, index) => {
            const isExpanded = expandedId === item.id;
            const itemNumber = filteredHistory.length - index;
            const isLatest = index === 0;

            return (
              <div
                key={item.id}
                className={`relative rounded-3xl transition-all duration-200 shadow-2xl md:mr-10 ${
                  isLatest
                    ? "bg-gradient-to-br from-[#0F1E3A] via-[#0B1528] to-[#070D18] border-2 border-blue-400/60 shadow-blue-900/30"
                    : "bg-[#091122]/95 border border-blue-500/25 hover:border-blue-500/50"
                } p-5 sm:p-7 space-y-5`}
              >
                {/* Visual Timeline Node (Desktop) */}
                <div className="hidden md:flex absolute -right-10 top-7 w-6 h-6 rounded-full bg-slate-950 border-2 border-blue-400 items-center justify-center shadow-lg shadow-blue-500/50 z-10">
                  <div className={`w-2.5 h-2.5 rounded-full ${isLatest ? "bg-emerald-400 animate-ping" : "bg-blue-400"}`} />
                </div>

                {/* Top Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-black text-blue-300 bg-blue-950/80 border border-blue-500/40 px-3 py-1 rounded-xl shadow-inner">
                      المحطة #{itemNumber} • {item.id}
                    </span>

                    {isLatest && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 animate-pulse">
                        <Sparkles className="w-3 h-3 text-emerald-300" />
                        الأحدث (Latest)
                      </span>
                    )}

                    {getCategoryBadge(item.category)}
                    {getImpactBadge(item.impactLevel)}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{new Date(item.timestamp).toLocaleString("ar-YE")}</span>
                    </span>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-1.5 rounded-lg hover:bg-slate-900"
                      title="حذف هذا السجل من الخط الزمني"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stage Title */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>{item.stageLabelAr}</span>
                  </h3>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: User Prompt / Request */}
                  <div className="lg:col-span-6 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-amber-300">
                        <Terminal className="w-4 h-4 text-amber-400" />
                        <span>نص الطلب والمحادثة (User Request / Prompt):</span>
                      </div>
                      <button
                        onClick={() => handleCopyText(item.userPrompt, item.id, "نص الطلب")}
                        className="text-[11px] text-slate-400 hover:text-amber-300 font-bold flex items-center gap-1 transition cursor-pointer px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-amber-400/40"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>نسخ الطلب</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-[#040812] border border-amber-500/20 text-xs sm:text-sm text-slate-100 font-medium leading-relaxed shadow-inner">
                      {item.userPrompt}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>صاحب الطلب / الكاتب:</span>
                      <strong className="text-slate-200">{item.author}</strong>
                    </div>
                  </div>

                  {/* Right Column: Execution Action Summary */}
                  <div className="lg:col-span-6 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>الإجراء البرمجي والنتيجة المنفذة (System Action):</span>
                      </div>
                      <button
                        onClick={() => handleCopyText(item.systemActionSummary, `${item.id}-action`, "ملخص الإجراء")}
                        className="text-[11px] text-slate-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition cursor-pointer px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-emerald-400/40"
                      >
                        <Copy className="w-3 h-3" />
                        <span>نسخ الإجراء</span>
                      </button>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#061516] to-[#040E10] border border-emerald-500/30 text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed shadow-inner">
                      {item.systemActionSummary}
                    </div>

                    {/* Target Components */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                        <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                        المكونات المتأثرة:
                      </span>
                      {item.targetComponents.map((comp) => (
                        <span
                          key={comp}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-950 text-indigo-300 border border-indigo-500/30 font-mono text-[10px] font-bold"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Bar: Tags & Expandable Details */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-800/50 text-[10px] font-bold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-blue-500/20 hover:border-blue-400 transition cursor-pointer"
                  >
                    <span>{isExpanded ? "إخفاء التفاصيل الفنية" : "عرض التفاصيل المعمارية الدقيقة"}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-blue-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-blue-400" />
                    )}
                  </button>
                </div>

                {/* Expandable Architecture & Tech Details */}
                {isExpanded && item.technicalDetails && (
                  <div className="p-5 rounded-2xl bg-[#030712] border border-blue-500/40 text-xs text-slate-300 space-y-2.5 animate-fadeIn shadow-2xl">
                    <div className="flex items-center justify-between text-blue-300 font-black">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span>المواصفات التقنية والمعايير المطبقة:</span>
                      </div>
                      <button
                        onClick={() => handleCopyText(item.technicalDetails!, `${item.id}-tech`, "التفاصيل الفنية")}
                        className="text-[11px] text-slate-400 hover:text-blue-300 font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>نسخ التفاصيل الفنية</span>
                      </button>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-mono text-[11px] whitespace-pre-line bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                      {item.technicalDetails}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add New Milestone / Prompt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-gradient-to-b from-[#0B1528] to-[#060D18] border border-blue-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
                <PlusCircle className="w-5 h-5 text-blue-400" />
                <span>إضافة وتوثيق محطة / طلب جديد في السجل</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm p-1.5 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewRecord} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-black mb-1.5">عنوان المحطة / المرحلة:</label>
                <input
                  type="text"
                  value={newStageLabel}
                  onChange={(e) => setNewStageLabel(e.target.value)}
                  placeholder="مثال: ترقية معايير الأمان وتطوير واجهات الدخول الملكية"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-black mb-1.5">نص الطلب أو المحادثة (User Prompt):</label>
                <textarea
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="أدخل نص الطلب الصادر من المستخدم كما هو بدقة..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-black mb-1.5">الإجراء البرمجي المنفذ (System Action):</label>
                <textarea
                  value={newActionSummary}
                  onChange={(e) => setNewActionSummary(e.target.value)}
                  placeholder="أدخل ملخص ما تم تنفيذه برمجياً في الكود والتصميم..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-black mb-1.5">التصنيف:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="ARCHITECTURE">معمارية وهيكلة</option>
                    <option value="ACCOUNTING">محاسبة ومعايير</option>
                    <option value="SECURITY">أمان وبوابات</option>
                    <option value="UI_UX">واجهات وأناقة</option>
                    <option value="SYSTEM_AUDIT">تدقيق ورقابة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-black mb-1.5">مستوى الأثر:</label>
                  <select
                    value={newImpact}
                    onChange={(e) => setNewImpact(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="CRITICAL">جوهري (Critical)</option>
                    <option value="HIGH">عالي (High)</option>
                    <option value="MEDIUM">متوسط (Medium)</option>
                    <option value="STANDARD">قياسي (Standard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-black mb-1.5">المسؤول / الكاتب:</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-black mb-1.5">المكونات المتأثرة (مفصولة بفواصل):</label>
                <input
                  type="text"
                  value={newComponentsStr}
                  onChange={(e) => setNewComponentsStr(e.target.value)}
                  placeholder="مثال: AdminDeviceManagerView, SecretAdminGatewayModal"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-black mb-1.5">الوسوم / الكلمات المفتاحية (مفصولة بفواصل):</label>
                <input
                  type="text"
                  value={newTagsStr}
                  onChange={(e) => setNewTagsStr(e.target.value)}
                  placeholder="مثال: جمال الشاشة, أمان, تشفير, تدقيق"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-black mb-1.5">تفاصيل فنية معمارية إضافية (اختياري):</label>
                <textarea
                  value={newTechDetails}
                  onChange={(e) => setNewTechDetails(e.target.value)}
                  placeholder="خوارزميات التشفير، التبعيات، التدرجات اللونية، معايير الأداء..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-600/30 cursor-pointer text-xs sm:text-sm"
                >
                  توثيق وحفظ المحطة في السجل السيادي
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all cursor-pointer text-xs sm:text-sm"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
