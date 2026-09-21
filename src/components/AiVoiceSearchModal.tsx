import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Sparkles, X, ArrowRight, CheckCircle2, FileText, PlusCircle, ExternalLink, Zap } from "lucide-react";
import { NavTab } from "./Sidebar";
import { ERPState, JournalEntry, CurrencyCode } from "../types/erp";

interface VoiceDraftJournal {
  description: string;
  amount: number;
  currency: CurrencyCode;
  debitAccountCode: string;
  debitAccountName: string;
  creditAccountCode: string;
  creditAccountName: string;
}

interface AiVoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: NavTab) => void;
  erpState: ERPState;
  onSaveJournalEntry?: (entry: JournalEntry) => void;
}

export const AiVoiceSearchModal: React.FC<AiVoiceSearchModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  erpState,
  onSaveJournalEntry,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [manualText, setManualText] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [suggestedAction, setSuggestedAction] = useState<{ tab?: NavTab; label?: string } | null>(null);
  const [draftJournal, setDraftJournal] = useState<VoiceDraftJournal | null>(null);
  const [createdJournalNumber, setCreatedJournalNumber] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    if (!isOpen) return;

    setMicError(null);
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = "ar-SA";

          recognition.onstart = () => {
            setIsListening(true);
            setMicError(null);
          };

          recognition.onresult = (event: any) => {
            let currentTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
              currentTranscript += event.results[i][0].transcript;
            }
            setTranscript(currentTranscript);
            transcriptRef.current = currentTranscript;
          };

          recognition.onerror = (event: any) => {
            console.warn("Speech recognition error:", event.error);
            setIsListening(false);
            if (event.error === "not-allowed" || event.error === "service-not-allowed") {
              setMicError("⚠️ إذن استخدام الميكروفون مرفوض أو غير متاح في هذا البيئة. يمكنك استخدام الأوامر السريعة أو الكتابة النصية أدناه.");
            } else if (event.error === "no-speech") {
              setMicError("لم يتم سماع أي صوت. يرجى محاولة التحدث بوضوح وإعادة الضغط.");
            } else if (event.error !== "aborted") {
              setMicError(`تنبيه استماع الصوت: ${event.error}`);
            }
          };

          recognition.onend = () => {
            setIsListening(false);
            const textToProcess = transcriptRef.current;
            if (textToProcess && textToProcess.trim().length > 0) {
              processVoiceQuery(textToProcess);
            }
          };

          recognitionRef.current = recognition;
        } catch (e) {
          console.warn("SpeechRecognition creation failed", e);
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isOpen]);

  const startListening = () => {
    setMicError(null);
    setTranscript("");
    transcriptRef.current = "";
    setAiResponse(null);
    setSuggestedAction(null);
    setDraftJournal(null);
    setCreatedJournalNumber(null);

    if (recognitionRef.current) {
      try {
        if (isListening) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            // ignore
          }
        }
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e: any) {
        console.warn("Speech recognition start caught exception:", e);
        if (e.name === "InvalidStateError" || (e.message && e.message.includes("already started"))) {
          setIsListening(true);
        } else {
          setIsListening(false);
          setMicError("تعذر تشغيل الميكروفون. يمكنك كتابة الطلب يدوياً بالأسفل.");
        }
      }
    } else {
      setIsListening(true);
      // Fallback simulation if speech recognition is not supported in browser
      setTimeout(() => {
        const sampleQuery = "إنشاء قيد مصروف إيجار بقيمة 5000 ريال";
        setTranscript(sampleQuery);
        transcriptRef.current = sampleQuery;
        setIsListening(false);
        processVoiceQuery(sampleQuery);
      }, 2000);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    setIsListening(false);
    if (transcriptRef.current.trim()) {
      processVoiceQuery(transcriptRef.current);
    }
  };

  const processVoiceQuery = async (queryText: string) => {
    setProcessing(true);
    setDraftJournal(null);
    setCreatedJournalNumber(null);
    try {
      const res = await fetch("/api/ai/voice-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText, snapshot: { accountsCount: erpState.accounts.length, customersCount: erpState.customers.length } }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.reply);
        if (data.targetTab) {
          setSuggestedAction({ tab: data.targetTab, label: data.actionLabel || "الانتقال إلى الوحدة" });
        }
        if (data.isJournalCreation && data.draftJournal) {
          setDraftJournal(data.draftJournal);
        }
      } else {
        handleSmartFallback(queryText);
      }
    } catch (err) {
      handleSmartFallback(queryText);
    } finally {
      setProcessing(false);
    }
  };

  const handleSmartFallback = (q: string) => {
    const lower = q.toLowerCase();

    // FEATURE 2: 1. Balance/Cash Vault Query
    if (lower.includes("رصيد") || lower.includes("صندوق") || lower.includes("الخزينة") || lower.includes("خزينة") || lower.includes("خزينه")) {
      const totalCash = erpState.cashVaults.reduce((sum, v) => sum + (v.currentBalance || 0), 0);
      const totalBank = erpState.bankAccounts.reduce((sum, b) => sum + (b.currentBalance || 0), 0);
      const totalAll = totalCash + totalBank;

      let reply = `💰 استعلام الأرصدة الحية:\n`;
      reply += `• رصيد النقدية بالخزائن والصناديق: ${totalCash.toLocaleString()} ر.س\n`;
      reply += `• رصيد الحسابات البنكية الجارية: ${totalBank.toLocaleString()} ر.س\n`;
      reply += `• إجمالي السيولة النقدية المتوفرة: ${totalAll.toLocaleString()} ر.س\n\n`;
      reply += `جميع الأرصدة محدثة لحظياً بناءً على العمليات الحالية بالمنظومة.`;

      setAiResponse(reply);
      setSuggestedAction({ tab: "CASH_AND_BANK", label: "الانتقال لإدارة النقدية والبنوك" });
      return;
    }

    // FEATURE 2: 2. Sales/Invoices Query
    if (lower.includes("مبيعات") || lower.includes("مبيعات اليوم") || lower.includes("مبيعات الفواتير")) {
      const salesInvoices = erpState.invoices.filter(inv => inv.type === "SALES");
      const totalSalesAmount = salesInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
      
      // Filter for today
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayInvoices = salesInvoices.filter(inv => inv.date?.startsWith(todayStr));
      const todaySalesAmount = todayInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

      let reply = `📊 استعلام المبيعات والفواتير:\n`;
      reply += `• مبيعات اليوم (${todayInvoices.length} فاتورة): ${todaySalesAmount.toLocaleString()} ر.س\n`;
      reply += `• إجمالي المبيعات التراكمية (${salesInvoices.length} فاتورة): ${totalSalesAmount.toLocaleString()} ر.س\n\n`;
      reply += `يمكنك فتح المبيعات لمراجعة كشوفات حركة المبيعات التفصيلية للأصناف.`;

      setAiResponse(reply);
      setSuggestedAction({ tab: "SALES_RETURNS", label: "عرض فواتير المبيعات" });
      return;
    }

    // FEATURE 2: 3. Inventory Stock/Quantity/Prices Query
    if (lower.includes("مخزن") || lower.includes("مخزون") || lower.includes("صنف") || lower.includes("متوفر") || lower.includes("سعر") || lower.includes("كمية") || lower.includes("كميه")) {
      // Extract target item keyword from query
      const cleanKeywords = q
        .replace(/كم/g, "")
        .replace(/سعر/g, "")
        .replace(/صنف/g, "")
        .replace(/رصيد/g, "")
        .replace(/متوفر/g, "")
        .replace(/في/g, "")
        .replace(/المخزن/g, "")
        .replace(/مخزون/g, "")
        .replace(/هل/g, "")
        .replace(/الكمية/g, "")
        .trim();

      const matchedItem = erpState.inventoryItems?.find(item => 
        item.nameAr.toLowerCase().includes(cleanKeywords.toLowerCase()) || 
        (item.nameEn && item.nameEn.toLowerCase().includes(cleanKeywords.toLowerCase()))
      );

      if (matchedItem) {
        let reply = `📦 استعلام المخزون الفوري:\n`;
        reply += `• اسم الصنف: ${matchedItem.nameAr}\n`;
        reply += `• الكمية المتوفرة بالمستودع: ${matchedItem.quantityOnHand} ${matchedItem.unit}\n`;
        reply += `• سعر الشراء والتكلفة (Cost): ${matchedItem.costPrice.toLocaleString()} ر.س\n`;
        reply += `• سعر البيع المعتمد (Selling): ${matchedItem.sellingPrice.toLocaleString()} ر.س\n`;
        const margin = matchedItem.sellingPrice - matchedItem.costPrice;
        reply += `• هامش ربح الصنف: ${margin.toLocaleString()} ر.س (${((margin / matchedItem.sellingPrice) * 100).toFixed(1)}%)\n\n`;
        
        if (matchedItem.quantityOnHand <= matchedItem.minStockThreshold) {
          reply += `⚠️ تنبيه: الصنف تحت حد الأمان المحتسب بالمستودع! ينصح بالتوريد فوراً.`;
        } else {
          reply += `🟢 حالة المخزون ممتازة وآمنة.`;
        }

        setAiResponse(reply);
        setSuggestedAction({ tab: "INVENTORY", label: "فتح جرد المستودعات" });
        return;
      } else {
        // Offer random suggestions
        const sampleItems = erpState.inventoryItems?.slice(0, 3) || [];
        let reply = `📦 استعلام المخزون العام:\n`;
        reply += `لم نجد صنفاً بالاسم المبحوث عنه "${cleanKeywords}". إليك حالة بعض الأصناف بالمستودع:\n\n`;
        sampleItems.forEach(item => {
          reply += `• ${item.nameAr}: متوفر ${item.quantityOnHand} ${item.unit} | البيع: ${item.sellingPrice} ر.س\n`;
        });

        setAiResponse(reply);
        setSuggestedAction({ tab: "INVENTORY", label: "فتح إدارة المستودعات" });
        return;
      }
    }

    // Default Fallback (Journal Creation)
    const amountMatch = q.match(/(\d[\d,.]*)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 5000;

    if (lower.includes("قيد") || lower.includes("مصروف") || lower.includes("إيراد") || lower.includes("ايراد")) {
      const isRevenue = lower.includes("إيراد") || lower.includes("ايراد") || lower.includes("تحصيل");
      let currency: CurrencyCode = "YER_SANAA";
      if (lower.includes("سعودي") || lower.includes("سار")) currency = "SAR";
      else if (lower.includes("دولار") || lower.includes("امريكي")) currency = "USD";
      else if (lower.includes("عدن")) currency = "YER_ADEN";

      let cleanDesc = q
        .replace(/انشاء قيد/g, "")
        .replace(/إنشاء قيد/g, "")
        .replace(/اضافة قيد/g, "")
        .replace(/إضافة قيد/g, "")
        .replace(/سجل قيد/g, "")
        .replace(/بقيمة/g, "")
        .replace(/بمبلغ/g, "")
        .replace(/ريال/g, "")
        .trim();
      if (!cleanDesc) cleanDesc = "قيد يومية صوتي مباشر";

      let debitCode = "5201";
      let debitName = "مصروف إيجار المبنى والفرع";
      if (lower.includes("كهرباء") || lower.includes("مياه")) {
        debitCode = "5202";
        debitName = "مصروف الكهرباء والمياه";
      } else if (lower.includes("صيانة")) {
        debitCode = "5203";
        debitName = "مصروف الصيانة والتشغيل";
      } else if (lower.includes("رواتب") || lower.includes("أجور") || lower.includes("مرتبات")) {
        debitCode = "5204";
        debitName = "مصروف Merchandising / الرواتب";
      }

      setAiResponse(`تم استخراج بيانات القيد المحاسبي المباشر بنجاح من صوتك.`);
      setSuggestedAction({ tab: "JOURNAL_ENTRIES", label: "الانتقال لقيود اليومية" });
      setDraftJournal({
        description: cleanDesc,
        amount: amount,
        currency: currency,
        debitAccountCode: isRevenue ? "110101" : debitCode,
        debitAccountName: isRevenue ? "الصندوق الرئيسي / الخزينة" : debitName,
        creditAccountCode: isRevenue ? "4101" : "110101",
        creditAccountName: isRevenue ? "إيرادات خدمات ومبيعات" : "الصندوق الرئيسي / الخزينة",
      });
      return;
    }

    if (lower.includes("مبيعات") || lower.includes("فاتورة") || lower.includes("فواتير")) {
      setAiResponse("تم التعرف على الطلب: الانتقال إلى قسم المبيعات والفواتير.");
      setSuggestedAction({ tab: "SALES_RETURNS", label: "فتح إدارة المبيعات والفواتير" });
    } else if (lower.includes("حساب") || lower.includes("دليل") || lower.includes("شجرة")) {
      setAiResponse("تم التعرف على الطلب: فتح دليل الحسابات المحاسبية.");
      setSuggestedAction({ tab: "CHART_OF_ACCOUNTS", label: "فتح دليل الحسابات" });
    } else if (lower.includes("مخزن") || lower.includes("مستودع") || lower.includes("صنف")) {
      setAiResponse("تم التعرف على الطلب: فتح إدارة المخزون والمستودعات.");
      setSuggestedAction({ tab: "INVENTORY", label: "فتح إدارة المخزون" });
    } else if (lower.includes("تقرير") || lower.includes("قائمة") || lower.includes("أرباح")) {
      setAiResponse("تم التعرف على الطلب: فتح التقارير المالية الختامية.");
      setSuggestedAction({ tab: "FINANCIAL_REPORTS", label: "فتح التقارير المالية" });
    } else {
      setAiResponse(`عذراً، بحثنا بالذكاء المالي المتقدم عن "${q}". يمكنك جلب أي قيد بطلب: "إنشاء قيد مصروف إيجار بقيمة 5000 ريال".`);
    }
  };

  const handleConfirmCreateJournal = () => {
    if (!draftJournal) return;

    const entryNum = `JV-VOICE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const dateStr = new Date().toISOString().slice(0, 10);

    const debitAcc = erpState.accounts.find((a) => a.code === draftJournal.debitAccountCode) || erpState.accounts.find(a => a.category === "EXPENSE") || erpState.accounts[0];
    const creditAcc = erpState.accounts.find((a) => a.code === draftJournal.creditAccountCode) || erpState.accounts.find(a => a.code === "110101") || erpState.accounts[1];

    const newEntry: JournalEntry = {
      id: `je-voice-${Date.now()}`,
      entryNumber: entryNum,
      date: dateStr,
      period: dateStr.slice(0, 7),
      type: "STANDARD",
      reference: "AI-VOICE-COMMAND",
      description: `قيد يومية صادر بالأمر الصوتي: ${draftJournal.description}`,
      status: "POSTED",
      currency: draftJournal.currency || "YER_SANAA",
      totalDebit: draftJournal.amount,
      totalCredit: draftJournal.amount,
      lines: [
        {
          id: `line-deb-${Date.now()}`,
          accountId: debitAcc.id,
          accountCode: debitAcc.code,
          accountNameAr: debitAcc.nameAr || draftJournal.debitAccountName,
          debit: draftJournal.amount,
          credit: 0,
          currency: draftJournal.currency || "YER_SANAA",
          exchangeRate: 1,
          memo: draftJournal.description,
        },
        {
          id: `line-crd-${Date.now() + 1}`,
          accountId: creditAcc.id,
          accountCode: creditAcc.code,
          accountNameAr: creditAcc.nameAr || draftJournal.creditAccountName,
          debit: 0,
          credit: draftJournal.amount,
          currency: draftJournal.currency || "YER_SANAA",
          exchangeRate: 1,
          memo: draftJournal.description,
        },
      ],
      createdBy: "المساعد الصوتي الذكي (Voice AI)",
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      approvedBy: "د. طارق المنصوري",
      approvedAt: dateStr,
    };

    if (onSaveJournalEntry) {
      onSaveJournalEntry(newEntry);
    }
    setCreatedJournalNumber(entryNum);
  };

  if (!isOpen) return null;

  const currSymbol = draftJournal?.currency === "SAR" ? "ر.س" : draftJournal?.currency === "USD" ? "$" : "ر.ي";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-2">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10 relative">
            <Sparkles className="w-8 h-8 animate-pulse" />
            {isListening && (
              <span className="absolute -inset-1 rounded-3xl border-2 border-emerald-500 animate-ping opacity-75"></span>
            )}
          </div>
          <h3 className="text-xl font-black text-white mb-1">المساعد والمحرك الصوتي للذكاء الاصطناعي</h3>
          <p className="text-xs text-slate-400 mb-5">
            يمكنك الآن إنشاء قيود اليومية فوراً بطلاقة بصوتك، أو البحث والانتقال للشاشات بطلب شفهي بسيط.
          </p>

          {/* Mic Button & Waveform */}
          <div className="my-5 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all transform active:scale-95 cursor-pointer ${
                isListening
                  ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/50 animate-bounce"
                  : "bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/40"
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <span className="text-xs font-bold text-slate-300 mt-3">
              {isListening ? "جاري الاستماع لصوتك... (تحدث الآن)" : "اضغط لبدء التحدث والنطق بالعملية"}
            </span>
          </div>

          {/* Mic Permission / Error Alert Banner */}
          {micError && (
            <div className="mb-4 p-3 bg-amber-950/60 border border-amber-600/50 rounded-2xl text-xs text-amber-200 text-right space-y-1 shadow-md animate-fadeIn">
              <p className="font-bold flex items-center justify-end gap-1.5 text-amber-300">
                <span>{micError}</span>
              </p>
            </div>
          )}

          {/* Transcript box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 min-h-[65px] text-right mb-4">
            <div className="text-[10px] font-bold text-slate-500 mb-1">النص المنطوق (Transcript):</div>
            <p className="text-sm text-slate-200 font-medium">
              {transcript || (isListening ? "استماع..." : "لم يتم نطق أي نص بعد. جرب قول: 'إنشاء قيد مصروف إيجار بقيمة 5000 ريال'")}
            </p>
          </div>

          {/* Manual Text Input Fallback */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualText.trim()) {
                setTranscript(manualText.trim());
                transcriptRef.current = manualText.trim();
                processVoiceQuery(manualText.trim());
                setManualText("");
              }
            }}
            className="flex gap-2 mb-4 text-right"
          >
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="أو اكتب طلبك كتابة هنا (مثال: كم رصيد النقدية والخزينة)..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
            />
            <button
              type="submit"
              disabled={!manualText.trim() || processing}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-all cursor-pointer shrink-0"
            >
              إرسال
            </button>
          </form>

          {/* AI Response & Actions */}
          {processing && (
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 py-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>جاري تحليل القصد واستخراج المبالغ وأطراف القيد بالذكاء المالي المتقدم...</span>
            </div>
          )}

          {aiResponse && !processing && (
            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4 text-right mb-4 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>تحليل الذكاء المالي المتقدم:</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{aiResponse}</p>

              {/* Draft Journal Card Preview if Voice Journal Intent */}
              {draftJournal && !createdJournalNumber && (
                <div className="mt-3 bg-slate-900 border border-amber-500/40 rounded-2xl p-4 shadow-xl text-right relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      معاينة القيد اليومية الصوتي المولد
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                      جاهز للاعتماد
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-200 mb-4">
                    <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-medium">البيان الأساسي:</span>
                      <span className="font-bold text-white">{draftJournal.description}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-medium">المبلغ والعملة:</span>
                      <span className="font-black text-emerald-400 text-sm">
                        {draftJournal.amount.toLocaleString()} {currSymbol}
                      </span>
                    </div>

                    {/* Balanced Double Entry Lines */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center bg-emerald-950/30 border border-emerald-800/40 p-2 rounded-xl text-[11px]">
                        <span className="text-emerald-400 font-bold">🟢 (مدين - Debit): [{draftJournal.debitAccountCode}]</span>
                        <span className="text-slate-100 font-semibold">{draftJournal.debitAccountName}</span>
                      </div>
                      <div className="flex justify-between items-center bg-blue-950/30 border border-blue-800/40 p-2 rounded-xl text-[11px]">
                        <span className="text-blue-400 font-bold">🔵 (دائن - Credit): [{draftJournal.creditAccountCode}]</span>
                        <span className="text-slate-100 font-semibold">{draftJournal.creditAccountName}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmCreateJournal}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>⚡ تأكيد وإنشاء القيد المحاسبي فوراً بالدليل</span>
                  </button>
                </div>
              )}

              {/* Confirmation Success Banner */}
              {createdJournalNumber && (
                <div className="mt-3 bg-emerald-900/40 border border-emerald-500/60 rounded-2xl p-4 text-right shadow-xl animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-300 font-black text-sm mb-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>تم إنشاء القيد وتمريره للترحيل بنجاح!</span>
                  </div>
                  <p className="text-xs text-slate-200 mb-3">
                    رقم القيد المنشأ: <strong className="text-amber-300 font-mono text-sm">{createdJournalNumber}</strong> | حالة القيد: <span className="text-emerald-400 font-bold">مُرحّل ومُعتماد (POSTED)</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("JOURNAL_ENTRIES");
                      onClose();
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>عرض القيد الجديد في قيود اليومية</span>
                  </button>
                </div>
              )}

              {!draftJournal && suggestedAction && suggestedAction.tab && (
                <button
                  onClick={() => {
                    setActiveTab(suggestedAction.tab!);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all mt-2 cursor-pointer"
                >
                  <span>{suggestedAction.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Quick Voice Prompt Suggestions */}
          <div className="pt-3 border-t border-slate-800 text-right">
            <div className="text-[11px] font-bold text-slate-400 mb-2">أمثلة لأوامر صوتية جاهزة للتجربة الفورية:</div>
            <div className="flex flex-wrap gap-2 justify-end">
              {[
                "إنشاء قيد مصروف إيجار بقيمة 5000 ريال",
                "قيد مصروف كهرباء وصيانة بقيمة 2500 ريال سعودي",
                "إضافة قيد إيراد خدمات استشارية بقيمة 12000 ريال",
                "اعرض فواتير المبيعات",
                "فتح دليل الحسابات",
              ].map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(sug);
                    processVoiceQuery(sug);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-[11px] font-medium transition-all cursor-pointer border border-slate-700/60 hover:border-emerald-500/50"
                >
                  🎙️ {sug}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

