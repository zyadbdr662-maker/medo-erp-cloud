import React, { useState } from "react";
import {
  RegistrationRequest,
  RegistrationRequestsService,
} from "../services/registrationRequestsService";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Send,
  MessageSquare,
  Shield,
  Building2,
  User,
  Globe2,
  Check,
  Copy,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  X,
  Sparkles,
} from "lucide-react";
import { soundService } from "../services/notificationSoundService";
import { MASTER_ADMIN_PRIMARY_EMAIL, MASTER_ADMIN_WHATSAPP } from "../services/notificationService";

export const RegistrationRequestsView: React.FC = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>(
    RegistrationRequestsService.getRequests()
  );
  const [selectedReq, setSelectedReq] = useState<RegistrationRequest | null>(null);
  const [modalMode, setModalMode] = useState<"DETAILS" | "APPROVE" | "REJECT" | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [selectedTier, setSelectedTier] = useState("الأساسية (150,000 ريال سنوياً)");
  const [trialDaysInput, setTrialDaysInput] = useState(30);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    soundService.playSound("SUCCESS_CHIME");
    setTimeout(() => setNotification(null), 3500);
  };

  const handleApproveConfirm = () => {
    if (!selectedReq) return;
    const updated = RegistrationRequestsService.updateStatus(
      selectedReq.id,
      "APPROVED",
      undefined,
      selectedTier,
      trialDaysInput
    );
    setRequests(updated);
    showToast(`✅ تمت الموافقة بنجاح على منشأة: ${selectedReq.companyNameAr}`);
    setModalMode(null);
    setSelectedReq(null);
  };

  const handleRejectConfirm = () => {
    if (!selectedReq) return;
    if (!rejectionReasonInput.trim()) {
      alert("يرجى إدخال سبب الرفض");
      return;
    }
    const updated = RegistrationRequestsService.updateStatus(
      selectedReq.id,
      "REJECTED",
      rejectionReasonInput
    );
    setRequests(updated);
    showToast(`❌ تم رفض الطلب رقم ${selectedReq.requestNumber}`);
    setModalMode(null);
    setSelectedReq(null);
    setRejectionReasonInput("");
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الطلب نهائياً؟")) return;
    const updated = RegistrationRequestsService.deleteRequest(id);
    setRequests(updated);
    showToast("🗑️ تم حذف الطلب بنجاح.");
  };

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="space-y-6 text-right font-sans text-slate-100" dir="rtl">
      {/* Toast */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-950 text-emerald-200 border border-emerald-500/50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <span className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30 shadow">
              <Clock className="w-8 h-8" />
            </span>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>طلبات التسجيل المعلقة والموافقات الإدارية (Registration Requests)</span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
                  {pendingCount} طلب بانتظار الموافقة
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                إدارة طلبات التسجيل الذاتي للعملاء والتحقق من السجلات والبيانات قبل اعتماد إنشاء المنشآت وتوليد الروابط.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-amber-950 text-amber-300 border border-amber-600/50 text-xs font-bold">
              ⏳ معلق: {pendingCount}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-600/50 text-xs font-bold">
              ✅ مقبول: {approvedCount}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-rose-950 text-rose-300 border border-rose-600/50 text-xs font-bold">
              ❌ مرفوض: {rejectedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>قائمة طلبات التسجيل الواردة</span>
          </h3>
          <span className="text-xs text-slate-400">إجمالي الطلبات: {requests.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 font-bold">
              <tr>
                <th className="p-3">رقم الطلب</th>
                <th className="p-3">اسم المنشأة</th>
                <th className="p-3">المسؤول</th>
                <th className="p-3">الهاتف والبريد</th>
                <th className="p-3">المصدر والتاريخ</th>
                <th className="p-3 text-center">الحالة</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-950/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-indigo-400">{req.requestNumber}</td>
                  <td className="p-3">
                    <div className="font-black text-white">{req.companyNameAr}</div>
                    <div className="text-[11px] text-slate-400">{req.activity}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-200">{req.contactName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{req.crNumber}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-slate-300">{req.phone}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{req.email}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-slate-300">
                      {req.source === "self_registration" ? "🌐 تسجيل ذاتي" : "🛡️ الإدارة"}
                    </div>
                    <div className="text-[10px] text-slate-500">{req.createdAt}</div>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        req.status === "PENDING"
                          ? "bg-amber-950 text-amber-300 border border-amber-600/50"
                          : req.status === "APPROVED"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-600/50"
                          : "bg-rose-950 text-rose-300 border border-rose-600/50"
                      }`}
                    >
                      {req.status === "PENDING"
                        ? "⏳ معلق"
                        : req.status === "APPROVED"
                        ? "✅ مقبول"
                        : "❌ مرفوض"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedReq(req);
                          setModalMode("DETAILS");
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        التفاصيل
                      </button>

                      {req.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedReq(req);
                              setModalMode("APPROVE");
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow"
                            title="موافقة واعتماد"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            موافقة
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReq(req);
                              setModalMode("REJECT");
                            }}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow"
                            title="رفض الطلب"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            رفض
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDelete(req.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="حذف الطلب"
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

      {/* Details / Approve / Reject Modal */}
      {selectedReq && modalMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    {modalMode === "DETAILS" && `تفاصيل الطلب: ${selectedReq.companyNameAr}`}
                    {modalMode === "APPROVE" && `موافقة واعتماد الطلب: ${selectedReq.companyNameAr}`}
                    {modalMode === "REJECT" && `رفض الطلب رقم: ${selectedReq.requestNumber}`}
                  </h4>
                  <p className="text-[11px] text-slate-400">رقم الطلب: {selectedReq.requestNumber} | التاريخ: {selectedReq.createdAt}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedReq(null);
                  setModalMode(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {modalMode === "DETAILS" && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="text-indigo-400 font-bold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" /> بيانات المنشأة
                      </div>
                      <div className="space-y-1 text-slate-300">
                        <div><span className="text-slate-500">الاسم العربي:</span> <strong className="text-white">{selectedReq.companyNameAr}</strong></div>
                        <div><span className="text-slate-500">الاسم الإنجليزي:</span> <span className="font-mono">{selectedReq.companyNameEn}</span></div>
                        <div><span className="text-slate-500">السجل التجاري:</span> <span className="font-mono text-emerald-400">{selectedReq.crNumber}</span></div>
                        <div><span className="text-slate-500">الرقم الضريبي:</span> <span className="font-mono text-emerald-400">{selectedReq.taxNumber}</span></div>
                        <div><span className="text-slate-500">النشاط:</span> {selectedReq.activity}</div>
                        <div><span className="text-slate-500">العنوان:</span> {selectedReq.address}</div>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="text-blue-400 font-bold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                        <User className="w-4 h-4" /> بيانات المسؤول
                      </div>
                      <div className="space-y-1 text-slate-300">
                        <div><span className="text-slate-500">اسم المسؤول:</span> <strong className="text-white">{selectedReq.contactName}</strong></div>
                        <div><span className="text-slate-500">البريد الإلكتروني:</span> <span className="font-mono text-indigo-300">{selectedReq.email}</span></div>
                        <div><span className="text-slate-500">رقم الهاتف:</span> <span className="font-mono">{selectedReq.phone}</span></div>
                        <div><span className="text-slate-500">مصدر التسجيل:</span> <span className="font-bold text-amber-300">{selectedReq.source === "self_registration" ? "تسجيل ذاتي (Self-Reg)" : "إدارة"}</span></div>
                        <div><span className="text-slate-500">عنوان IP / الجهاز:</span> <span className="font-mono text-[11px] text-slate-400">{selectedReq.ipAddress} - {selectedReq.device}</span></div>
                      </div>
                    </div>
                  </div>

                  {selectedReq.status === "REJECTED" && selectedReq.rejectionReason && (
                    <div className="bg-rose-950/40 border border-rose-500/40 p-4 rounded-2xl space-y-1">
                      <div className="text-rose-300 font-bold">سبب الرفض المسجل:</div>
                      <div className="text-rose-200">{selectedReq.rejectionReason}</div>
                    </div>
                  )}

                  {selectedReq.status === "APPROVED" && (
                    <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl space-y-1">
                      <div className="text-emerald-300 font-bold">حالة الاعتماد:</div>
                      <div className="text-emerald-200">تمت الموافقة وتخصيص الباقة ({selectedReq.assignedTier || "الأساسية"}) بواسطة {selectedReq.processedBy || "مدير النظام"} في {selectedReq.processedAt}</div>
                    </div>
                  )}
                </div>
              )}

              {modalMode === "APPROVE" && (
                <div className="space-y-4 text-xs">
                  <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-2xl space-y-2">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      الموافقة على إنشاء منشأة سحابية معزولة لـ: {selectedReq.companyNameAr}
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      عند النقر على اعتماد، سيتم إنشاء حساب المنشأة وتوليد روابط الصلاحيات الخمسة وإرسال إشعار فوري للعميل عبر البريد وواتساب.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">اختر الباقة السحابية:</label>
                      <select
                        value={selectedTier}
                        onChange={(e) => setSelectedTier(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
                      >
                        <option value="الباقة التجريبية (30 يوماً، 50 عملية)">الباقة التجريبية (30 يوماً، 50 عملية)</option>
                        <option value="الأساسية (150,000 ريال سنوياً)">الأساسية (150,000 ريال سنوياً)</option>
                        <option value="المتقدمة (250,000 ريال سنوياً)">المتقدمة (250,000 ريال سنوياً)</option>
                        <option value="المؤسسية (400,000 ريال سنوياً)">المؤسسية (400,000 ريال سنوياً)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">مدة التجربة (أيام):</label>
                        <input
                          type="number"
                          value={trialDaysInput}
                          onChange={(e) => setTrialDaysInput(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">حالة الإشعارات التلقائية:</label>
                        <div className="px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-emerald-400 font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4" /> إرسال البريد وواتساب للعميل
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalMode === "REJECT" && (
                <div className="space-y-4 text-xs">
                  <div className="bg-rose-950/30 border border-rose-500/40 p-4 rounded-2xl space-y-2">
                    <div className="font-bold text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      رفض طلب التسجيل الخاص بـ: {selectedReq.companyNameAr}
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      يرجى كتابة سبب الرفض أدناه ليتم إرساله للعميل عبر البريد الإلكتروني.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">سبب الرفض المبرر:</label>
                    <textarea
                      rows={4}
                      value={rejectionReasonInput}
                      onChange={(e) => setRejectionReasonInput(e.target.value)}
                      placeholder="مثال: السجل التجاري غير مطابق أو الرقم الضريبي غير صحيح..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedReq(null);
                  setModalMode(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                إغلاق
              </button>

              {modalMode === "APPROVE" && (
                <button
                  onClick={handleApproveConfirm}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-black text-xs shadow-lg flex items-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  تأكيد الاعتماد وتوليد الروابط الآن
                </button>
              )}

              {modalMode === "REJECT" && (
                <button
                  onClick={handleRejectConfirm}
                  className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg flex items-center gap-2 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  تأكيد رفض الطلب وإبلاغ العميل
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
