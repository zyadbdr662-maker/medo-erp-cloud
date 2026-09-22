import React, { useState } from "react";
import {
  TenantConversation,
  MasterTasksService,
} from "../services/masterTasksService";
import {
  MessageSquare,
  Send,
  User,
  Building2,
  Phone,
  Mail,
  Search,
  Bell,
  Radio,
  CheckCheck,
  Paperclip,
  Sparkles,
  ShieldCheck,
  Clock,
  Megaphone,
  Share2,
} from "lucide-react";
import { soundService } from "../services/notificationSoundService";

export const MasterSupportCommunicationView: React.FC = () => {
  const [conversations, setConversations] = useState<TenantConversation[]>(
    MasterTasksService.getConversations()
  );
  const [selectedConv, setSelectedConv] = useState<TenantConversation>(conversations[0] || null);
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Broadcast modal state
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastType, setBroadcastType] = useState<"CIRCULAR" | "NOTIFICATION">("CIRCULAR");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || !replyText.trim()) return;

    const updated = MasterTasksService.sendMessage(selectedConv.id, replyText);
    setConversations(updated);
    const refreshed = updated.find((c) => c.id === selectedConv.id);
    if (refreshed) setSelectedConv(refreshed);
    setReplyText("");
    soundService.playSound("SUCCESS_CHIME");
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;

    setBroadcastSuccess(
      `✓ تم بث ${broadcastType === "CIRCULAR" ? "التعميم الإداري" : "الإشعار الجماعي"} لجميع الـ 200+ منشأة ومستخدم بنجاح!`
    );
    soundService.playSound("SUCCESS_CHIME");

    setTimeout(() => {
      setIsBroadcastModalOpen(false);
      setBroadcastSuccess(null);
      setBroadcastTitle("");
      setBroadcastBody("");
    }, 2000);
  };

  const filteredConvs = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.contactPerson.toLowerCase().includes(q) ||
      c.tenantName.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-right font-sans text-slate-100" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <span className="p-3 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-500/30 shadow">
              <MessageSquare className="w-8 h-8" />
            </span>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>مركز التواصل والدعم المباشر (Tenant & Client Communications Hub)</span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
                  قنوات حية ومشفرة
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                تواصل مباشر بين الإدارة العليا ومدراء المنشآت والعملاء، وإرسال التعاميم الرسمية والإشعارات الجماعية.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setBroadcastType("CIRCULAR");
                setIsBroadcastModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs border border-sky-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>📤 إرسال تعميم إداري</span>
            </button>

            <button
              onClick={() => {
                setBroadcastType("NOTIFICATION");
                setIsBroadcastModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-xs shadow flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>📢 إشعار جماعي</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Layout: List & Active Conversation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Conversations list */}
        <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في المحادثات والمنشآت..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-8 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="space-y-2">
            {filteredConvs.map((conv) => {
              const isSelected = selectedConv?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-800/90 border-sky-500 shadow-lg ring-1 ring-sky-500/40"
                      : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-xs text-white">{conv.contactPerson}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{conv.lastMessageTime}</span>
                  </div>

                  <div className="text-[11px] text-sky-400 font-bold mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>{conv.tenantName}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1">{conv.lastMessage}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 columns: Active Chat Thread */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[480px]">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-sm border border-sky-500/30">
                    {selectedConv.contactPerson.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <span>{selectedConv.contactPerson}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/40 font-bold">
                        متصل الآن
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>🏢 {selectedConv.tenantName}</span>
                      <span>📞 {selectedConv.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${selectedConv.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 hover:bg-emerald-900 transition-all text-xs flex items-center gap-1"
                  >
                    واتساب مباشر
                  </a>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[320px]">
                {selectedConv.messages.map((msg) => {
                  const isAdmin = msg.sender === "ADMIN";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[75%] p-3.5 rounded-2xl text-xs space-y-1 ${
                          isAdmin
                            ? "bg-indigo-600 text-white rounded-br-none shadow"
                            : "bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none shadow"
                        }`}
                      >
                        <div className="text-[10px] font-bold opacity-80">{msg.senderName}</div>
                        <p className="leading-relaxed">{msg.text}</p>
                        <div className="text-[9px] opacity-70 text-left font-mono mt-1 flex items-center justify-end gap-1">
                          <span>{msg.timestamp}</span>
                          {isAdmin && <CheckCheck className="w-3 h-3 text-sky-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Box */}
              <form onSubmit={handleSendMessage} className="border-t border-slate-800 pt-4 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`اكتب رداً مباشراً إلى ${selectedConv.contactPerson}...`}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال الرد</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <MessageSquare className="w-12 h-12 mb-2 opacity-40" />
              <span>اختر محادثة من القائمة للبدء</span>
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4">
            <h4 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Megaphone className="w-4 h-4 text-sky-400" />
              <span>
                {broadcastType === "CIRCULAR"
                  ? "إرسال تعميم إداري رسمي لكافة المنشآت"
                  : "بث إشعار فوري جماعي (Broadcast Notification)"}
              </span>
            </h4>

            {broadcastSuccess ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold text-center">
                {broadcastSuccess}
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">عنوان الرسالة / التعميم:</label>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="مثال: تحديث أمني سيادي، مواعيد عمل العيد، أو ترقية..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">نص التعميم / الإشعار:</label>
                  <textarea
                    rows={4}
                    required
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    placeholder="اكتب تفاصيل التوجيه أو الإشعار الموجه لمدراء ومحاسبي المنشآت..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>سيتم إرسال هذا الإشعار وتثبيته في شريط إشعارات جميع المنشآت فورياً.</span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsBroadcastModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white font-black rounded-xl shadow"
                  >
                    بث التعميم الآن
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
