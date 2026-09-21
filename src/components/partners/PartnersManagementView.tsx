import React, { useState } from "react";
import {
  Users,
  Coins,
  Percent,
  FileText,
  PieChart,
  Plus,
  RefreshCw,
  Building,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import {
  Partner,
  PartnerContribution,
  ProfitDistribution,
  PartnerWithdrawal,
  CurrencyCode,
  Account,
  JournalEntry,
  ERPUser,
} from "../../types/erp";
import { formatMoney } from "../../services/erpStorage";
import { soundService } from "../../services/notificationSoundService";
import { PartnersDirectoryTab } from "./PartnersDirectoryTab";
import { ProfitDistributionTab } from "./ProfitDistributionTab";
import { PartnerStatementTab } from "./PartnerStatementTab";
import { PartnerFormModal } from "./PartnerFormModal";
import { PartnerDetailsModal } from "./PartnerDetailsModal";
import { PartnerContributionModal } from "./PartnerContributionModal";
import { PartnerWithdrawalModal } from "./PartnerWithdrawalModal";

interface PartnersManagementViewProps {
  partners: Partner[];
  partnerContributions: PartnerContribution[];
  profitDistributions: ProfitDistribution[];
  partnerWithdrawals: PartnerWithdrawal[];
  accounts: Account[];
  journalEntries: JournalEntry[];
  displayCurrency: CurrencyCode;
  currentUser?: ERPUser;
  onUpdatePartnersState: (data: {
    partners?: Partner[];
    partnerContributions?: PartnerContribution[];
    profitDistributions?: ProfitDistribution[];
    partnerWithdrawals?: PartnerWithdrawal[];
    journalEntries?: JournalEntry[];
  }) => void;
}

export const PartnersManagementView: React.FC<PartnersManagementViewProps> = ({
  partners,
  partnerContributions,
  profitDistributions,
  partnerWithdrawals,
  accounts,
  journalEntries,
  displayCurrency,
  currentUser,
  onUpdatePartnersState,
}) => {
  const [activeTab, setActiveTab] = useState<"DIRECTORY" | "PROFITS" | "STATEMENTS" | "ANALYTICS">("DIRECTORY");

  // Modals state
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [partnerToEdit, setPartnerToEdit] = useState<Partner | null>(null);

  const [selectedPartnerDetails, setSelectedPartnerDetails] = useState<Partner | null>(null);

  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [contributionPartnerId, setContributionPartnerId] = useState<string | undefined>(undefined);

  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [withdrawalPartnerId, setWithdrawalPartnerId] = useState<string | undefined>(undefined);

  const [statementPartnerId, setStatementPartnerId] = useState<string | undefined>(undefined);

  // Success toast
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 4500);
  };

  // 1. Save / Edit Partner
  const handleSavePartner = (data: Omit<Partner, "id" | "createdAt">, editId?: string) => {
    let updatedList: Partner[];
    if (editId) {
      updatedList = partners.map((p) =>
        p.id === editId
          ? {
              ...p,
              ...data,
            }
          : p
      );
      showToast(`تم تحديث بيانات الشريك (${data.name}) بنجاح`);
    } else {
      const newPartner: Partner = {
        ...data,
        id: `pt-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString(),
      };
      updatedList = [...partners, newPartner];
      showToast(`تمت إضافة الشريك الجديد (${newPartner.name}) بنجاح بنسبة ${newPartner.sharePercentage}%`);
    }

    onUpdatePartnersState({ partners: updatedList });
    setPartnerToEdit(null);
  };

  // 2. Delete Partner
  const handleDeletePartner = (id: string) => {
    const partner = partners.find((p) => p.id === id);
    if (!partner) return;
    if (window.confirm(`هل أنت متأكد من حذف الشريك (${partner.name})؟ سيتم حذف جميع السجلات المرتبطة به.`)) {
      const updatedList = partners.filter((p) => p.id !== id);
      onUpdatePartnersState({ partners: updatedList });
      showToast(`تم حذف الشريك (${partner.name})`);
      soundService.playSound("CASH_FLOW_PULSE");
    }
  };

  // 3. Save Contribution + Journal Entry
  const handleSaveContribution = (
    contribData: Omit<PartnerContribution, "id">,
    createJournalEntry: boolean
  ) => {
    const newContrib: PartnerContribution = {
      ...contribData,
      id: `contrib-${Date.now().toString().slice(-4)}`,
    };

    const updatedContribs = [...partnerContributions, newContrib];

    // Update partner paid capital
    const updatedPartners = partners.map((p) => {
      if (p.id === contribData.partnerId) {
        const newPaid = p.paidCapital + contribData.amount;
        const newRem = Math.max(0, p.capitalAmount - newPaid);
        return {
          ...p,
          paidCapital: newPaid,
          remainingCapital: newRem,
        };
      }
      return p;
    });

    let updatedJournals = journalEntries;
    if (createJournalEntry) {
      const jeNumber = `JE-CAPITAL-${Date.now().toString().slice(-5)}`;
      const newJE: JournalEntry = {
        id: `je-${Date.now()}`,
        entryNumber: jeNumber,
        date: contribData.date,
        period: contribData.date.slice(0, 7),
        type: "STANDARD",
        currency: "YER_SANAA",
        description: `إيداع حصة رأس المال - الشريك ${contribData.partnerName} (${contribData.description})`,
        lines: [
          {
            id: `line-1-${Date.now()}`,
            accountId: contribData.referenceAccount || "110101",
            accountCode: contribData.referenceAccount || "110101",
            accountNameAr: "الصندوق الرئيسي / البنك",
            accountName: "الصندوق الرئيسي / البنك",
            debit: contribData.amount,
            credit: 0,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: `إيداع نقدي لحصة رأس المال - ${contribData.partnerName}`,
          },
          {
            id: `line-2-${Date.now()}`,
            accountId: "310101",
            accountCode: "310101",
            accountNameAr: `رأس المال المدفوع - الشريك ${contribData.partnerName}`,
            accountName: `رأس المال المدفوع - الشريك ${contribData.partnerName}`,
            debit: 0,
            credit: contribData.amount,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: `حصة رأس مال الشريك ${contribData.partnerName}`,
          },
        ],
        totalDebit: contribData.amount,
        totalCredit: contribData.amount,
        isBalanced: true,
        status: "POSTED",
        createdBy: currentUser?.name || "الإدارة السيادية",
        createdAt: new Date().toISOString(),
        branchId: "b-sanaa",
      };
      updatedJournals = [newJE, ...journalEntries];
    }

    onUpdatePartnersState({
      partnerContributions: updatedContribs,
      partners: updatedPartners,
      journalEntries: updatedJournals,
    });

    showToast(`تم قيد المساهمة بمبلغ ${contribData.amount.toLocaleString()} ريال وترحيل القيد المحاسبي بنجاح`);
  };

  // 4. Save Withdrawal + Journal Entry
  const handleSaveWithdrawal = (
    withdrawalData: Omit<PartnerWithdrawal, "id">,
    createJournalEntry: boolean
  ) => {
    const newWithdrawal: PartnerWithdrawal = {
      ...withdrawalData,
      id: `pwd-${Date.now().toString().slice(-4)}`,
    };

    const updatedWithdrawals = [...partnerWithdrawals, newWithdrawal];

    let updatedJournals = journalEntries;
    if (createJournalEntry) {
      const jeNumber = `JE-DRAWING-${Date.now().toString().slice(-5)}`;
      const paymentAcc = withdrawalData.paymentMethod === "BANK" ? "110201" : "110101";
      const newJE: JournalEntry = {
        id: `je-${Date.now()}`,
        entryNumber: jeNumber,
        date: withdrawalData.date,
        period: withdrawalData.date.slice(0, 7),
        type: "STANDARD",
        currency: "YER_SANAA",
        description: `مسحوبات شخصية جارية - الشريك ${withdrawalData.partnerName} (${withdrawalData.description})`,
        lines: [
          {
            id: `line-1-${Date.now()}`,
            accountId: "310201",
            accountCode: "310201",
            accountNameAr: `جاري الشريك (مسحوبات) - ${withdrawalData.partnerName}`,
            accountName: `جاري الشريك (مسحوبات) - ${withdrawalData.partnerName}`,
            debit: withdrawalData.amount,
            credit: 0,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: `مسحوبات شخصية - الشريك ${withdrawalData.partnerName}`,
          },
          {
            id: `line-2-${Date.now()}`,
            accountId: paymentAcc,
            accountCode: paymentAcc,
            accountNameAr: withdrawalData.paymentMethod === "BANK" ? "بنك الكريمي الإسلامي" : "الصندوق الرئيسي / الخزينة",
            accountName: withdrawalData.paymentMethod === "BANK" ? "بنك الكريمي الإسلامي" : "الصندوق الرئيسي / الخزينة",
            debit: 0,
            credit: withdrawalData.amount,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: `صرف مسحوبات شخصية نقداً / بنك`,
          },
        ],
        totalDebit: withdrawalData.amount,
        totalCredit: withdrawalData.amount,
        isBalanced: true,
        status: "POSTED",
        createdBy: currentUser?.name || "الإدارة السيادية",
        createdAt: new Date().toISOString(),
        branchId: "b-sanaa",
      };
      updatedJournals = [newJE, ...journalEntries];
    }

    onUpdatePartnersState({
      partnerWithdrawals: updatedWithdrawals,
      journalEntries: updatedJournals,
    });

    showToast(`تم تسجيل مسحوبات الشريك بمبلغ ${withdrawalData.amount.toLocaleString()} ريال بنجاح`);
  };

  // 5. Save Profit Distribution + Auto Journal Entry
  const handleSaveDistribution = (
    newDist: ProfitDistribution,
    autoPostJournal: boolean
  ) => {
    const updatedDistributions = [newDist, ...profitDistributions];

    let updatedJournals = journalEntries;
    if (autoPostJournal) {
      const jeNumber = `JE-DIVIDEND-${newDist.fiscalYear}-${Date.now().toString().slice(-4)}`;
      const newJE: JournalEntry = {
        id: `je-${Date.now()}`,
        entryNumber: jeNumber,
        date: newDist.distributionDate,
        period: newDist.distributionDate.slice(0, 7),
        type: "STANDARD",
        currency: "YER_SANAA",
        description: `اعتماد توزيع الأرباح السنوية لسنة ${newDist.fiscalYear}م - مجموعة بن زياد`,
        lines: [
          {
            id: `line-1-${Date.now()}`,
            accountId: "320101",
            accountCode: "320101",
            accountNameAr: "أرباح مبقاة ومحتجزة / احتياطي أرباح",
            accountName: "أرباح مبقاة ومحتجزة / احتياطي أرباح",
            debit: newDist.distributableAmount,
            credit: 0,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: `تحميل الأرباح الموزعة على الأرباح المحتجزة لسنة ${newDist.fiscalYear}`,
          },
          {
            id: `line-2-${Date.now()}`,
            accountId: "210601",
            accountCode: "210601",
            accountNameAr: "أرباح معتمدة ومستحقة الصرف للشركاء",
            accountName: "أرباح معتمدة ومستحقة الصرف للشركاء",
            debit: 0,
            credit: newDist.distributableAmount,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: `توزيعات الأرباح المستحقة للشركاء لسنة ${newDist.fiscalYear}`,
          },
        ],
        totalDebit: newDist.distributableAmount,
        totalCredit: newDist.distributableAmount,
        isBalanced: true,
        status: "POSTED",
        createdBy: currentUser?.name || "الإدارة السيادية",
        createdAt: new Date().toISOString(),
        branchId: "b-sanaa",
      };
      updatedJournals = [newJE, ...journalEntries];
    }

    onUpdatePartnersState({
      profitDistributions: updatedDistributions,
      journalEntries: updatedJournals,
    });

    showToast(`تم اعتماد قرار توزيع أرباح سنة ${newDist.fiscalYear} بمبلغ ${newDist.distributableAmount.toLocaleString()} ريال وترحيل القيد بنجاح`);
  };

  // 6. Mark Partner Share as Paid
  const handleMarkSharePaid = (distId: string, partnerId: string) => {
    let paidAmount = 0;
    let partnerName = "";

    const updatedDistributions = profitDistributions.map((d) => {
      if (d.id === distId) {
        const updatedShares = d.shares.map((s) => {
          if (s.partnerId === partnerId) {
            paidAmount = s.profitAmount;
            partnerName = s.partnerName;
            return {
              ...s,
              status: "PAID" as const,
              paidDate: new Date().toISOString().split("T")[0],
            };
          }
          return s;
        });

        // Check if all shares are paid
        const allPaid = updatedShares.every((s) => s.status === "PAID");
        return {
          ...d,
          shares: updatedShares,
          status: allPaid ? ("PAID" as const) : d.status,
        };
      }
      return d;
    });

    // Create journal entry for cash payout
    const jeNumber = `JE-PAYOUT-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().split("T")[0];
    const newJE: JournalEntry = {
      id: `je-${Date.now()}`,
      entryNumber: jeNumber,
      date: today,
      period: today.slice(0, 7),
      type: "STANDARD",
      currency: "YER_SANAA",
      description: `صرف حصة أرباح الشريك ${partnerName} نقداً / بنك`,
      lines: [
        {
          id: `line-1-${Date.now()}`,
          accountId: "210601",
          accountCode: "210601",
          accountNameAr: "أرباح معتمدة ومستحقة الصرف للشركاء",
          accountName: "أرباح معتمدة ومستحقة الصرف للشركاء",
          debit: paidAmount,
          credit: 0,
          currency: "YER_SANAA",
          exchangeRate: 1,
          memo: `تسوية وسداد أرباح الشريك ${partnerName}`,
        },
        {
          id: `line-2-${Date.now()}`,
          accountId: "110201",
          accountCode: "110201",
          accountNameAr: "بنك الكريمي الإسلامي / الصندوق",
          accountName: "بنك الكريمي الإسلامي / الصندوق",
          debit: 0,
          credit: paidAmount,
          currency: "YER_SANAA",
          exchangeRate: 1,
          memo: `صرف الأرباح بتحويل مصرفي للشريك ${partnerName}`,
        },
      ],
      totalDebit: paidAmount,
      totalCredit: paidAmount,
      isBalanced: true,
      status: "POSTED",
      createdBy: currentUser?.name || "الإدارة السيادية",
      createdAt: new Date().toISOString(),
      branchId: "b-sanaa",
    };

    onUpdatePartnersState({
      profitDistributions: updatedDistributions,
      journalEntries: [newJE, ...journalEntries],
    });

    soundService.playSound("ROYAL_BANK_CHIME");
    showToast(`تم صرف وتسوية أرباح الشريك (${partnerName}) بمبلغ ${paidAmount.toLocaleString()} ريال بنجاح`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Toast Banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl text-xs font-bold text-emerald-300 flex items-center justify-between shadow-2xl animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-black">
            <Briefcase className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-slate-100">
                إدارة الشراكات والشركاء وتوزيع الأرباح
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                مجموعة بن زياد • ميدو تك
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              إدارة حصص رأس المال، توثيق المساهمات والمسحوبات، وتوزيع الأرباح المحاسبي الآلي
            </p>
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setContributionPartnerId(undefined);
              setIsContributionOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-teal-300 hover:text-teal-200 bg-teal-950/60 border border-teal-700/50 hover:bg-teal-950 transition-colors flex items-center gap-1.5"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>مساهمة رأس مال</span>
          </button>

          <button
            onClick={() => {
              setWithdrawalPartnerId(undefined);
              setIsWithdrawalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-950/60 border border-amber-700/50 hover:bg-amber-950 transition-colors flex items-center gap-1.5"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>مسحوبات جارية</span>
          </button>

          <button
            onClick={() => {
              setPartnerToEdit(null);
              setIsAddPartnerOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة شريك</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("DIRECTORY")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "DIRECTORY"
              ? "border-emerald-400 text-emerald-400 bg-emerald-950/20 rounded-t-xl"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 rounded-t-xl"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>دليل الشركاء ورؤوس الأموال ({partners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("PROFITS")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "PROFITS"
              ? "border-emerald-400 text-emerald-400 bg-emerald-950/20 rounded-t-xl"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 rounded-t-xl"
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>توزيع الأرباح السنوية ({profitDistributions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("STATEMENTS")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "STATEMENTS"
              ? "border-emerald-400 text-emerald-400 bg-emerald-950/20 rounded-t-xl"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 rounded-t-xl"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>كشوفات حساب الشركاء</span>
        </button>

        <button
          onClick={() => setActiveTab("ANALYTICS")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "ANALYTICS"
              ? "border-emerald-400 text-emerald-400 bg-emerald-950/20 rounded-t-xl"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 rounded-t-xl"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>التقارير الرسومية ومعدل العائد (ROI)</span>
        </button>
      </div>

      {/* Tab Body */}
      {activeTab === "DIRECTORY" && (
        <PartnersDirectoryTab
          partners={partners}
          contributions={partnerContributions}
          profitDistributions={profitDistributions}
          withdrawals={partnerWithdrawals}
          displayCurrency={displayCurrency}
          onOpenAddPartner={() => {
            setPartnerToEdit(null);
            setIsAddPartnerOpen(true);
          }}
          onSelectPartner={(p) => setSelectedPartnerDetails(p)}
          onOpenStatement={(id) => {
            setStatementPartnerId(id);
            setActiveTab("STATEMENTS");
          }}
          onOpenAddContribution={(id) => {
            setContributionPartnerId(id);
            setIsContributionOpen(true);
          }}
          onOpenAddWithdrawal={(id) => {
            setWithdrawalPartnerId(id);
            setIsWithdrawalOpen(true);
          }}
          onEditPartner={(p) => {
            setPartnerToEdit(p);
            setIsAddPartnerOpen(true);
          }}
          onDeletePartner={handleDeletePartner}
          onGoToProfits={() => setActiveTab("PROFITS")}
        />
      )}

      {activeTab === "PROFITS" && (
        <ProfitDistributionTab
          partners={partners}
          distributions={profitDistributions}
          displayCurrency={displayCurrency}
          onSaveDistribution={handleSaveDistribution}
          onMarkSharePaid={handleMarkSharePaid}
        />
      )}

      {activeTab === "STATEMENTS" && (
        <PartnerStatementTab
          partners={partners}
          contributions={partnerContributions}
          profitDistributions={profitDistributions}
          withdrawals={partnerWithdrawals}
          displayCurrency={displayCurrency}
          selectedPartnerId={statementPartnerId}
        />
      )}

      {activeTab === "ANALYTICS" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>تحليل العائد على استثمار الشركاء (Partners ROI & Equity Matrix)</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              يقيس هذا التقرير العائد التراكمي على رأس المال المدفوع لكل شريك ونسبة التوزيعات المسددة مقارنة بالأرباح المبقاة.
            </p>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">الشريك</th>
                    <th className="p-3.5">النوع</th>
                    <th className="p-3.5">نسبة الحصة</th>
                    <th className="p-3.5">رأس المال المدفوع</th>
                    <th className="p-3.5">إجمالي الأرباح المستلمة</th>
                    <th className="p-3.5">إجمالي المسحوبات</th>
                    <th className="p-3.5">صافي الرصيد الجاري</th>
                    <th className="p-3.5">معدل العائد التراكمي (ROI)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {partners.map((p) => {
                    const pDistProfits = profitDistributions.reduce((sum, dist) => {
                      const share = dist.shares.find((s) => s.partnerId === p.id);
                      return sum + (share ? share.profitAmount : 0);
                    }, 0);

                    const pWithdrawals = partnerWithdrawals
                      .filter((w) => w.partnerId === p.id)
                      .reduce((sum, w) => sum + w.amount, 0);

                    const currentBalance = p.paidCapital + pDistProfits - pWithdrawals;
                    const roi = p.paidCapital > 0 ? ((pDistProfits / p.paidCapital) * 100).toFixed(1) : "0.0";

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="p-3.5 font-bold text-slate-100">{p.name}</td>
                        <td className="p-3.5 text-slate-400">{p.partnerType}</td>
                        <td className="p-3.5 font-bold font-mono text-emerald-400">{p.sharePercentage}%</td>
                        <td className="p-3.5 font-mono">{formatMoney(p.paidCapital, displayCurrency)}</td>
                        <td className="p-3.5 font-mono text-emerald-400 font-bold">{formatMoney(pDistProfits, displayCurrency)}</td>
                        <td className="p-3.5 font-mono text-amber-400">{formatMoney(pWithdrawals, displayCurrency)}</td>
                        <td className="p-3.5 font-mono font-bold text-teal-400">{formatMoney(currentBalance, displayCurrency)}</td>
                        <td className="p-3.5 font-mono font-black text-emerald-400 text-sm">{roi}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <PartnerFormModal
        isOpen={isAddPartnerOpen}
        onClose={() => {
          setIsAddPartnerOpen(false);
          setPartnerToEdit(null);
        }}
        onSave={handleSavePartner}
        partnerToEdit={partnerToEdit}
        existingPartners={partners}
      />

      <PartnerDetailsModal
        isOpen={Boolean(selectedPartnerDetails)}
        onClose={() => setSelectedPartnerDetails(null)}
        partner={selectedPartnerDetails}
        contributions={partnerContributions}
        profitDistributions={profitDistributions}
        withdrawals={partnerWithdrawals}
        displayCurrency={displayCurrency}
        onOpenAddContribution={(id) => {
          setSelectedPartnerDetails(null);
          setContributionPartnerId(id);
          setIsContributionOpen(true);
        }}
        onOpenAddWithdrawal={(id) => {
          setSelectedPartnerDetails(null);
          setWithdrawalPartnerId(id);
          setIsWithdrawalOpen(true);
        }}
        onOpenStatement={(id) => {
          setSelectedPartnerDetails(null);
          setStatementPartnerId(id);
          setActiveTab("STATEMENTS");
        }}
        onEditPartner={(p) => {
          setSelectedPartnerDetails(null);
          setPartnerToEdit(p);
          setIsAddPartnerOpen(true);
        }}
      />

      <PartnerContributionModal
        isOpen={isContributionOpen}
        onClose={() => setIsContributionOpen(false)}
        partners={partners}
        accounts={accounts}
        preSelectedPartnerId={contributionPartnerId}
        onSaveContribution={handleSaveContribution}
      />

      <PartnerWithdrawalModal
        isOpen={isWithdrawalOpen}
        onClose={() => setIsWithdrawalOpen(false)}
        partners={partners}
        accounts={accounts}
        preSelectedPartnerId={withdrawalPartnerId}
        onSaveWithdrawal={handleSaveWithdrawal}
      />
    </div>
  );
};
