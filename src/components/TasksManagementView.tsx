import React, { useState } from "react";
import {
  MasterTask,
  MasterTasksService,
} from "../services/masterTasksService";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  Building2,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  MessageSquare,
  Paperclip,
  TrendingUp,
  X,
  Play,
  Pause,
  Layers,
  Sparkles,
  Send,
} from "lucide-react";
import { soundService } from "../services/notificationSoundService";

export const TasksManagementView: React.FC = () => {
  const [tasks, setTasks] = useState<MasterTask[]>(MasterTasksService.getTasks());
  const [viewMode, setViewMode] = useState<"LIST" | "CALENDAR">("LIST");
  const [filterPeriod, setFilterPeriod] = useState<"ALL" | "TODAY" | "WEEK" | "MONTH" | "OVERDUE">("ALL");
  const [filterPriority, setFilterPriority] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedTask, setSelectedTask] = useState<MasterTask | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [newTaskAssignee, setNewTaskAssignee] = useState("بدر (مدير المنصة)");
  const [newTaskDueDate, setNewTaskDueDate] = useState("2026-09-24");
  const [newTaskEstHours, setNewTaskEstHours] = useState(2);
  const [newTaskTenant, setNewTaskTenant] = useState("");

  const showToast = (msg: string) => {
    soundService.playSound("SUCCESS_CHIME");
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const created = MasterTasksService.addTask({
      title: newTaskTitle,
      description: newTaskDesc,
      priority: newTaskPriority,
      assignedTo: newTaskAssignee,
      assignedToRole: newTaskAssignee.includes("بدر") ? "Master Sovereign Admin" : "Full Stack Engineer",
      dueDate: newTaskDueDate,
      estimatedHours: Number(newTaskEstHours) || 1,
      actualHours: 0,
      status: "PENDING",
      completionPercentage: 0,
      tenantName: newTaskTenant || undefined,
    });

    setTasks(MasterTasksService.getTasks());
    setIsAddModalOpen(false);
    setNewTaskTitle("");
    setNewTaskDesc("");
    showToast("✅ تم إنشاء المهمة بنجاح!");
  };

  const handleUpdateStatus = (taskId: string, status: MasterTask["status"]) => {
    const updated = MasterTasksService.updateTaskStatus(taskId, status);
    setTasks(updated);
    if (selectedTask && selectedTask.id === taskId) {
      const refreshed = updated.find((t) => t.id === taskId);
      if (refreshed) setSelectedTask(refreshed);
    }
    showToast(`🔄 تم تحديث حالة المهمة إلى: ${status}`);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newCommentText.trim()) return;

    const updated = MasterTasksService.addComment(
      selectedTask.id,
      "بدر عايض زياد",
      newCommentText
    );
    setTasks(updated);
    const refreshed = updated.find((t) => t.id === selectedTask.id);
    if (refreshed) setSelectedTask(refreshed);
    setNewCommentText("");
  };

  const handleDeleteTask = (taskId: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المهمة نهائياً؟")) return;
    const updated = MasterTasksService.deleteTask(taskId);
    setTasks(updated);
    if (selectedTask?.id === taskId) setSelectedTask(null);
    showToast("🗑️ تم حذف المهمة بنجاح.");
  };

  // Filter calculations
  const filteredTasks = tasks.filter((task) => {
    if (filterPriority !== "ALL" && task.priority !== filterPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchNum = task.taskNumber.toLowerCase().includes(q);
      const matchAssignee = task.assignedTo.toLowerCase().includes(q);
      const matchTenant = (task.tenantName || "").toLowerCase().includes(q);
      if (!matchTitle && !matchNum && !matchAssignee && !matchTenant) return false;
    }
    return true;
  });

  const highPriorityCount = tasks.filter((t) => t.priority === "HIGH").length;
  const mediumPriorityCount = tasks.filter((t) => t.priority === "MEDIUM").length;
  const lowPriorityCount = tasks.filter((t) => t.priority === "LOW").length;
  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <div className="space-y-6 text-right font-sans text-slate-100" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <span className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30 shadow">
              <CheckSquare className="w-8 h-8" />
            </span>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>إدارة المهام والأولويات (Master Task & Priority System)</span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
                  {tasks.length} مهمة مسجلة
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                تنظيم مهام التطوير، متطلبات المنشآت والعملاء، تتبع نسب الإنجاز، وقواعد الصدق ومواعيد الاستحقاق.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setViewMode("LIST")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "LIST"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📋 قائمة المهام
              </button>
              <button
                onClick={() => setViewMode("CALENDAR")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "CALENDAR"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📅 التقويم الشهري
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة مهمة جديدة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/80 border border-red-500/30 rounded-2xl p-3.5 space-y-1">
          <div className="text-[11px] font-bold text-red-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            🔴 أولوية عالية (24 س)
          </div>
          <div className="text-2xl font-black text-white">{highPriorityCount}</div>
        </div>

        <div className="bg-slate-900/80 border border-yellow-500/30 rounded-2xl p-3.5 space-y-1">
          <div className="text-[11px] font-bold text-yellow-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            🟡 أولوية متوسطة (3 أيام)
          </div>
          <div className="text-2xl font-black text-white">{mediumPriorityCount}</div>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-3.5 space-y-1">
          <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            🟢 أولوية منخفضة (أسبوع)
          </div>
          <div className="text-2xl font-black text-white">{lowPriorityCount}</div>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3.5 space-y-1">
          <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            ⏳ معلقة بانتظار البدء
          </div>
          <div className="text-2xl font-black text-white">{pendingCount}</div>
        </div>

        <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-3.5 space-y-1">
          <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
            <Play className="w-3.5 h-3.5" />
            🔄 قيد التنفيذ النشط
          </div>
          <div className="text-2xl font-black text-white">{inProgressCount}</div>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-3.5 space-y-1">
          <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ✅ مهام مكتملة بنجاح
          </div>
          <div className="text-2xl font-black text-white">{completedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            الفلاتر:
          </span>
          {(["ALL", "TODAY", "WEEK", "MONTH", "OVERDUE"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setFilterPeriod(period)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterPeriod === period
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {period === "ALL" && "الكل"}
              {period === "TODAY" && "اليوم"}
              {period === "WEEK" && "هذا الأسبوع"}
              {period === "MONTH" && "هذا الشهر"}
              {period === "OVERDUE" && "المتأخرة"}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((prio) => (
            <button
              key={prio}
              onClick={() => setFilterPriority(prio)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filterPriority === prio
                  ? "bg-slate-700 text-white border border-slate-600"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {prio === "ALL" && "كافة الأولويات"}
              {prio === "HIGH" && "🔴 عالية"}
              {prio === "MEDIUM" && "🟡 متوسطة"}
              {prio === "LOW" && "🟢 منخفضة"}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن مهمة، مسؤول، أو منشأة..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Main Content: LIST or CALENDAR */}
      {viewMode === "LIST" ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">المهمة والتفاصيل</th>
                  <th className="p-3 text-center">الأولوية</th>
                  <th className="p-3">المسؤول</th>
                  <th className="p-3">المنشأة المستفيدة</th>
                  <th className="p-3">الاستحقاق</th>
                  <th className="p-3 text-center">الإنجاز</th>
                  <th className="p-3 text-center">الحالة</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-950/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-400">{task.taskNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-white max-w-sm">{task.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{task.description}</div>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          task.priority === "HIGH"
                            ? "bg-red-950 text-red-300 border border-red-600/50"
                            : task.priority === "MEDIUM"
                            ? "bg-yellow-950 text-yellow-300 border border-yellow-600/50"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-600/50"
                        }`}
                      >
                        {task.priority === "HIGH" ? "🔴 عالية" : task.priority === "MEDIUM" ? "🟡 متوسطة" : "🟢 منخفضة"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-200">{task.assignedTo}</div>
                      <div className="text-[10px] text-slate-500">{task.assignedToRole || "فريق النظام"}</div>
                    </td>
                    <td className="p-3 text-slate-300">
                      {task.tenantName ? (
                        <span className="font-bold text-emerald-300">{task.tenantName}</span>
                      ) : (
                        <span className="text-slate-500">منظومة المنصة الرئيسية</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-300">{task.dueDate}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center gap-1.5 justify-center">
                        <div className="w-16 bg-slate-950 rounded-full h-1.5 border border-slate-800 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${task.completionPercentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-300">{task.completionPercentage}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          task.status === "COMPLETED"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-600/50"
                            : task.status === "IN_PROGRESS"
                            ? "bg-blue-950 text-blue-300 border border-blue-600/50"
                            : "bg-amber-950 text-amber-300 border border-amber-600/50"
                        }`}
                      >
                        {task.status === "COMPLETED"
                          ? "✅ مكتملة"
                          : task.status === "IN_PROGRESS"
                          ? "🔄 قيد التنفيذ"
                          : "⏳ معلقة"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all"
                        >
                          التفاصيل
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>تقويم المهام والمواعيد - سبتمبر / أكتوبر 2026</span>
            </h3>
            <span className="text-xs text-slate-400">توزيع المهام حسب مواعيد التسليم والاستحقاق</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"].map((d) => (
              <div key={d} className="bg-slate-950 p-2.5 rounded-xl font-bold text-slate-400 border border-slate-800">
                {d}
              </div>
            ))}

            {Array.from({ length: 28 }).map((_, i) => {
              const dayNum = i + 1;
              const dayTasks = tasks.filter((t) => {
                const day = parseInt(t.dueDate.split("-")[2] || t.dueDate.split("/")[0] || "0", 10);
                return day === dayNum;
              });

              return (
                <div
                  key={i}
                  className="bg-slate-950/60 min-h-[90px] p-2 rounded-xl border border-slate-800/80 flex flex-col justify-between text-right"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-400">{dayNum}</span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTask(t)}
                        className={`text-[10px] p-1 rounded font-bold truncate cursor-pointer transition-all ${
                          t.priority === "HIGH"
                            ? "bg-red-950/80 text-red-300 border border-red-600/40"
                            : t.priority === "MEDIUM"
                            ? "bg-yellow-950/80 text-yellow-300 border border-yellow-600/40"
                            : "bg-emerald-950/80 text-emerald-300 border border-emerald-600/40"
                        }`}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                  📋
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">{selectedTask.title}</h4>
                  <p className="text-[11px] text-slate-400">رقم المهمة: {selectedTask.taskNumber} | الاستحقاق: {selectedTask.dueDate}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-slate-400 font-bold">الوصف والتفاصيل:</div>
                <div className="text-slate-200 leading-relaxed">{selectedTask.description}</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">الأولوية:</div>
                  <div className="font-bold text-red-400">{selectedTask.priority === "HIGH" ? "🔴 عالية (24 س)" : selectedTask.priority === "MEDIUM" ? "🟡 متوسطة" : "🟢 منخفضة"}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">المسؤول:</div>
                  <div className="font-bold text-white">{selectedTask.assignedTo}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">الوقت المقدر / الفعلي:</div>
                  <div className="font-bold text-emerald-400">{selectedTask.estimatedHours} س / {selectedTask.actualHours} س</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">نسبة الإنجاز:</div>
                  <div className="font-bold text-blue-400">{selectedTask.completionPercentage}%</div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-3">
                <div className="text-slate-300 font-bold flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>التعليقات والمناقشات ({selectedTask.comments.length}):</span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedTask.comments.map((c) => (
                    <div key={c.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-indigo-300">{c.author}</span>
                        <span>{c.timestamp}</span>
                      </div>
                      <p className="text-slate-200 text-xs">{c.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="اكتب ملاحظة أو تعليقاً على المهمة..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    إرسال
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedTask.id, "COMPLETED")}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ✅ إكمال المهمة
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedTask.id, "IN_PROGRESS")}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5" />
                  🔄 قيد التنفيذ
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedTask.id, "PAUSED")}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <Pause className="w-3.5 h-3.5" />
                  ⏸️ إيقاف مؤقت
                </button>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                إضافة مهمة جديدة إلى المنصة الرئيسية
              </h4>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان المهمة:</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="مثال: مراجعة طلب منشأة أو صيانة عزل الجلسات..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الوصف التفصيلي:</label>
                <textarea
                  rows={3}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="وصف الإجراء المطلوب والنتيجة المتوقعة..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الأولوية:</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="HIGH">🔴 عالية (خلال 24 ساعة)</option>
                    <option value="MEDIUM">🟡 متوسطة (خلال 3 أيام)</option>
                    <option value="LOW">🟢 منخفضة (خلال أسبوع)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">المسؤول:</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="بدر (مدير المنصة)">بدر (مدير المنصة)</option>
                    <option value="الوكيل الذكي (AI Agent)">الوكيل الذكي (AI Agent)</option>
                    <option value="مطور الواجهات السحابية">مطور الواجهات السحابية</option>
                    <option value="مهندس قواعد البيانات">مهندس قواعد البيانات</option>
                    <option value="فريق الدعم الفني">فريق الدعم الفني</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">تاريخ الاستحقاق:</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">الوقت المقدر (ساعات):</label>
                  <input
                    type="number"
                    value={newTaskEstHours}
                    onChange={(e) => setNewTaskEstHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">المنشأة المستفيدة (اختياري):</label>
                <input
                  type="text"
                  value={newTaskTenant}
                  onChange={(e) => setNewTaskTenant(e.target.value)}
                  placeholder="مثال: شركة إبراهيم كراع أو عام..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-xl shadow"
                >
                  حفظ المهمة الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
