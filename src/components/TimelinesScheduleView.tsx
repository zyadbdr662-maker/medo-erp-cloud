import React, { useState } from "react";
import {
  MasterProject,
  MasterTasksService,
} from "../services/masterTasksService";
import {
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  Layers,
  Sparkles,
  Plus,
  ShieldCheck,
  Award,
  AlertTriangle,
  FileCheck,
  Zap,
  Target,
  ChevronLeft,
} from "lucide-react";
import { soundService } from "../services/notificationSoundService";

export const TimelinesScheduleView: React.FC = () => {
  const [projects, setProjects] = useState<MasterProject[]>(MasterTasksService.getProjects());
  const [selectedProject, setSelectedProject] = useState<MasterProject>(projects[0] || null);

  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectStartDate, setNewProjectStartDate] = useState("2026-09-22");
  const [newProjectEndDate, setNewProjectEndDate] = useState("2026-10-15");
  const [newProjectManager, setNewProjectManager] = useState("بدر عايض زياد");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const count = projects.length + 1;
    const newProj: MasterProject = {
      id: `PROJ-2026-0${count}`,
      projectNumber: `PROJ-2026-0${count}`,
      name: newProjectName,
      description: newProjectDesc,
      startDate: newProjectStartDate,
      endDate: newProjectEndDate,
      status: "ACTIVE",
      completionPercentage: 0,
      manager: newProjectManager,
      milestones: [
        { id: `m-${Date.now()}-1`, title: "المرحلة الأولى: التحليل والتخطيط", targetDate: newProjectStartDate, completed: false },
        { id: `m-${Date.now()}-2`, title: "المرحلة الثانية: التطوير والتنفيذ", targetDate: newProjectEndDate, completed: false },
      ],
    };

    const updated = [...projects, newProj];
    MasterTasksService.saveProjects(updated);
    setProjects(updated);
    setSelectedProject(newProj);
    setIsAddProjectModalOpen(false);
    setNewProjectName("");
    setNewProjectDesc("");
    soundService.playSound("SUCCESS_CHIME");
  };

  const handleToggleMilestone = (projectId: string, milestoneId: string) => {
    const updated = projects.map((p) => {
      if (p.id === projectId) {
        const updatedMilestones = p.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = updatedMilestones.filter((m) => m.completed).length;
        const total = updatedMilestones.length;
        const newPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        return {
          ...p,
          milestones: updatedMilestones,
          completionPercentage: newPercentage,
          status: (newPercentage === 100 ? "COMPLETED" : "ACTIVE") as any,
        };
      }
      return p;
    });

    MasterTasksService.saveProjects(updated);
    setProjects(updated);
    const refreshed = updated.find((p) => p.id === projectId);
    if (refreshed) setSelectedProject(refreshed);
    soundService.playSound("SUCCESS_CHIME");
  };

  return (
    <div className="space-y-6 text-right font-sans text-slate-100" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <span className="p-3 bg-teal-500/20 text-teal-400 rounded-2xl border border-teal-500/30 shadow">
              <Calendar className="w-8 h-8" />
            </span>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>إدارة الجداول الزمنية ومواعيد التسليم (Project Timelines & Delivery Hub)</span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold">
                  {projects.length} مشاريع نشطة
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                متابعة الخطة الزمنية لتطوير المنصة، تسليم المنشآت، التزام الصدق في المواعيد، وجداول العمل الرسمية.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddProjectModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة مشروع / مسار زمني</span>
          </button>
        </div>
      </div>

      {/* Grid of Projects & Project Detailed Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Column: Projects List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>المشاريع والمسارات الزمنية</span>
          </h3>

          <div className="space-y-2.5">
            {projects.map((proj) => {
              const isSelected = selectedProject?.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-800/90 border-teal-500 shadow-xl ring-1 ring-teal-500/50"
                      : "bg-slate-900/80 border-slate-800 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-xs text-teal-400">{proj.projectNumber}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        proj.status === "COMPLETED"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-600/50"
                          : "bg-blue-950 text-blue-300 border border-blue-600/50"
                      }`}
                    >
                      {proj.status === "COMPLETED" ? "✅ مكتمل" : "🔄 قيد التنفيذ"}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-xs mb-1">{proj.name}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">{proj.description}</p>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>التقدم الإجمالي:</span>
                      <span className="font-bold text-teal-300">{proj.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${proj.completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-800/80 font-mono">
                    <span>من: {proj.startDate}</span>
                    <span>إلى: {proj.endDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Selected Project Timeline Details & Milestones */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProject && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold">
                      {selectedProject.projectNumber}
                    </span>
                    <h3 className="text-base font-black text-white">{selectedProject.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedProject.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-left">
                    <div className="text-[10px] text-slate-500">المسؤول عن الإشراف:</div>
                    <div className="text-xs font-bold text-teal-300">{selectedProject.manager}</div>
                  </div>
                </div>
              </div>

              {/* Milestones Flow Steps */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-300 flex items-center gap-2">
                  <Target className="w-4 h-4 text-teal-400" />
                  <span>المراحل التنفيذية ومحطات التسليم (Milestones):</span>
                </h4>

                <div className="relative pr-6 border-r-2 border-slate-800 space-y-6">
                  {selectedProject.milestones.map((m, idx) => (
                    <div key={m.id} className="relative group">
                      {/* Milestone Bullet Dot */}
                      <button
                        onClick={() => handleToggleMilestone(selectedProject.id, m.id)}
                        className={`absolute -right-[31px] top-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                          m.completed
                            ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30"
                            : "bg-slate-950 border-slate-700 text-slate-500 hover:border-teal-400"
                        }`}
                      >
                        {m.completed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3 h-3" />}
                      </button>

                      <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 hover:border-slate-700 transition-all">
                        <div className="flex items-center justify-between">
                          <h5 className={`text-xs font-bold ${m.completed ? "text-slate-200 line-through opacity-70" : "text-white"}`}>
                            {m.title}
                          </h5>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 text-teal-300 border border-slate-800">
                            📅 {m.targetDate}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                          <span>الحالة: {m.completed ? "تم الإنجاز والاعتماد" : "قيد التنفيذ / جاري العمل"}</span>
                          <button
                            onClick={() => handleToggleMilestone(selectedProject.id, m.id)}
                            className="text-teal-400 hover:underline font-bold text-[10px]"
                          >
                            {m.completed ? "تراجع" : "تحديد كمكتمل"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section: Official Working Schedule & Honesty Policy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Work Hours Schedule */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-black text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>أوقات العمل الرسمية للمنصة (Official Hours)</span>
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/60">
                  <span className="font-bold text-slate-300">الأحد - الخميس:</span>
                  <span className="font-mono text-teal-300">08:00 ص - 05:00 م</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/60">
                  <span className="font-bold text-slate-300">الجمعة والسبت:</span>
                  <span className="text-amber-400 font-bold">إجازة رسمية (طوارئ فقط)</span>
                </div>
              </div>
            </div>

            {/* Rules of Honesty with Clients */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>مصفوفة الصدق والالتزام مع العملاء (SLA)</span>
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/60">
                  <span className="text-slate-300">سرعة الاستجابة الأولى:</span>
                  <span className="font-bold text-emerald-400">أقل من 24 ساعة</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/60">
                  <span className="text-slate-300">الالتزام بالتسليم:</span>
                  <span className="font-bold text-teal-300">في الموعد المحدد 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Project Modal */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4">
            <h4 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Plus className="w-4 h-4 text-teal-400" />
              إضافة مشروع / مسار زمني جديد
            </h4>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم المشروع:</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="مثال: ترقية الفاتورة الإلكترونية والموافقات..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الوصف والأهداف:</label>
                <textarea
                  rows={2}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="وصف مخرجات المشروع ومواعيد التسليم..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">تاريخ البداية:</label>
                  <input
                    type="date"
                    value={newProjectStartDate}
                    onChange={(e) => setNewProjectStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">تاريخ التسليم النهائي:</label>
                  <input
                    type="date"
                    value={newProjectEndDate}
                    onChange={(e) => setNewProjectEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">المسؤول عن المشروع:</label>
                <input
                  type="text"
                  value={newProjectManager}
                  onChange={(e) => setNewProjectManager(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAddProjectModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-black rounded-xl shadow"
                >
                  حفظ المشروع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
