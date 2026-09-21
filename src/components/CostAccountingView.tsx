import React, { useState } from "react";
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Layers,
  FileText,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  DollarSign,
  Printer,
  Calculator,
  Sliders,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import {
  CostCenter,
  JobOrder,
  ProcessStage,
  ABCActivity,
  StandardCostItem,
  TargetCostModel,
} from "../types/costAccounting";
import { TenantIsolationService } from "../services/tenantIsolationService";

interface CostAccountingViewProps {
  onPostJournalEntry?: (entry: any) => void;
}

export const CostAccountingView: React.FC<CostAccountingViewProps> = ({ onPostJournalEntry }) => {
  const [activeTab, setActiveTab] = useState<
    "DASHBOARD" | "JOB_COSTING" | "PROCESS_COSTING" | "ABC_COSTING" | "STANDARD_COSTING" | "TARGET_COSTING" | "COST_CENTERS" | "REPORTS"
  >("DASHBOARD");

  const tenantDetails = TenantIsolationService.getActiveTenantDetails();
  const companyName = tenantDetails?.nameAr || "مجموعة بن زياد التجارية";

  // Mock State for Cost Centers
  const [costCenters, setCostCenters] = useState<CostCenter[]>([
    { id: "CC-01", code: "PROD-101", nameAr: "مركز خط إنتاج الأسمنت والخرسانة", nameEn: "Cement Production Line", type: "PRODUCTION", budget: 2500000, actualCost: 2350000, isActive: true },
    { id: "CC-02", code: "PROD-102", nameAr: "مركز خط التعبئة والتغليف", nameEn: "Packaging Line", type: "PRODUCTION", budget: 1200000, actualCost: 1280000, isActive: true },
    { id: "CC-03", code: "SERV-201", nameAr: "مركز الصيانة والمرافق", nameEn: "Maintenance & Utilities", type: "SERVICE", budget: 800000, actualCost: 750000, isActive: true },
    { id: "CC-04", code: "ADM-301", nameAr: "الإدارة العامة والشؤون المالية", nameEn: "General Administration", type: "ADMIN", budget: 1500000, actualCost: 1450000, isActive: true },
    { id: "CC-05", code: "SALES-401", nameAr: "مركز التوزيع والمبيعات المركزية", nameEn: "Sales & Distribution", type: "SALES", budget: 900000, actualCost: 920000, isActive: true },
  ]);

  // Mock State for Job Orders (Job Order Costing)
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([
    {
      id: "JO-001",
      orderNumber: "JO-2026-001",
      customerName: "شركة الأمل للمقاولات",
      productName: "توريد وتركيب هيكل خرساني مسلح مخصص",
      quantity: 120,
      startDate: "2026-03-01",
      endDate: "2026-03-15",
      status: "IN_PROGRESS",
      materials: [
        { id: "M1", materialName: "حديد تسليح عالي المقاومة (طن)", quantity: 30, unitCost: 800, totalCost: 24000 },
        { id: "M2", materialName: "أسمنت بورتلاندي ممتاز (كيس)", quantity: 200, unitCost: 10, totalCost: 2000 },
      ],
      labors: [
        { id: "L1", workerName: "طاقم الحدادة والتشكيل", hours: 120, ratePerHour: 25, totalCost: 3000 },
        { id: "L2", workerName: "فريق الصب والمراقبة", hours: 80, ratePerHour: 20, totalCost: 1600 },
      ],
      overheadCost: 3400,
      totalCost: 34000,
      notes: "أمر تكلفة مخصص للمشروع الإنشائي الأول",
    },
    {
      id: "JO-002",
      orderNumber: "JO-2026-002",
      customerName: "مؤسسة النور التجارية",
      productName: "أثاث مكتبي تنفيذي فاخر (مجموعة كاملة)",
      quantity: 15,
      startDate: "2026-02-10",
      endDate: "2026-02-28",
      status: "COMPLETED",
      materials: [
        { id: "M3", materialName: "أخشاب زان طبيعي معالجة", quantity: 10, unitCost: 2500, totalCost: 25000 },
        { id: "M4", materialName: "إكسسوارات معدنية ومقابض ذهبية", quantity: 50, unitCost: 100, totalCost: 5000 },
      ],
      labors: [
        { id: "L3", workerName: "نجارون محترفون", hours: 200, ratePerHour: 30, totalCost: 6000 },
      ],
      overheadCost: 4000,
      totalCost: 40000,
      notes: "تم التسليم بنجاح للعميل",
    },
  ]);

  // Mock State for Process Costing
  const [processStages, setProcessStages] = useState<ProcessStage[]>([
    {
      id: "PS-1",
      stageName: "مرحلة التجهيز والخلط الأولي",
      department: "قسم المعامل المركزية",
      inputUnits: 5000,
      completedUnits: 4800,
      inProgressUnits: 200,
      completionPercentage: 80,
      materialCost: 1200000,
      laborCost: 450000,
      overheadCost: 350000,
      totalCost: 2000000,
      unitCost: 416.67,
    },
    {
      id: "PS-2",
      stageName: "مرحلة المعالجة الحرارية والتصنيع",
      department: "قسم الأفران والإنتاج",
      inputUnits: 4800,
      completedUnits: 4600,
      inProgressUnits: 200,
      completionPercentage: 50,
      materialCost: 800000,
      laborCost: 600000,
      overheadCost: 600000,
      totalCost: 2000000,
      unitCost: 434.78,
    },
    {
      id: "PS-3",
      stageName: "مرحلة التعبئة النهائية وفحص الجودة",
      department: "قسم التغليف والشحن",
      inputUnits: 4600,
      completedUnits: 4600,
      inProgressUnits: 0,
      completionPercentage: 100,
      materialCost: 300000,
      laborCost: 200000,
      overheadCost: 150000,
      totalCost: 650000,
      unitCost: 141.30,
    },
  ]);

  // Mock State for ABC Costing
  const [abcActivities, setAbcActivities] = useState<ABCActivity[]>([
    {
      id: "ACT-01",
      activityName: "نشاط استقبال وفحص المواد الخام",
      costDriver: "عدد شحنات التوريد الواردة",
      totalCost: 150000,
      driverQuantity: 150,
      ratePerDriver: 1000,
      allocatedProducts: [
        { productName: "المنتج أ (أسمنت عادي)", driverConsumption: 90, allocatedCost: 90000 },
        { productName: "المنتج ب (أسمنت مقاوم)", driverConsumption: 60, allocatedCost: 60000 },
      ],
    },
    {
      id: "ACT-02",
      activityName: "نشاط إعداد وتشغيل الآلات للإنتاج",
      costDriver: "عدد ساعات تشغيل أو إعداد الآلات",
      totalCost: 400000,
      driverQuantity: 200,
      ratePerDriver: 2000,
      allocatedProducts: [
        { productName: "المنتج أ (أسمنت عادي)", driverConsumption: 120, allocatedCost: 240000 },
        { productName: "المنتج ب (أسمنت مقاوم)", driverConsumption: 80, allocatedCost: 160000 },
      ],
    },
  ]);

  // Mock State for Standard Costing & Variances
  const [standardCosts, setStandardCosts] = useState<StandardCostItem[]>([
    {
      id: "SC-1",
      productName: "أكياس الأسمنت (50 كجم)",
      element: "MATERIAL",
      standardAmount: 3000,
      actualAmount: 3250,
      variance: -250,
      isFavorable: false,
      period: "مارس 2026",
      reason: "ارتفاع أسعار المواد الخام في السوق المحلي",
    },
    {
      id: "SC-2",
      productName: "أكياس الأسمنت (50 كجم)",
      element: "LABOR",
      standardAmount: 1500,
      actualAmount: 1400,
      variance: 100,
      isFavorable: true,
      period: "مارس 2026",
      reason: "زيادة كفاءة العمالة وتقليل ساعات العمل الإضافي",
    },
    {
      id: "SC-3",
      productName: "أكياس الأسمنت (50 كجم)",
      element: "OVERHEAD",
      standardAmount: 500,
      actualAmount: 540,
      variance: -40,
      isFavorable: false,
      period: "مارس 2026",
      reason: "ارتفاع تعريفة استهلاك الكهرباء والوقود",
    },
  ]);

  // Mock State for Target Costing
  const [targetCosts, setTargetCosts] = useState<TargetCostModel[]>([
    {
      id: "TC-1",
      productName: "كتل الخرسانة مسبقة الصب الفاخرة",
      marketPrice: 6000,
      targetProfitMarginPct: 25,
      targetCost: 4500,
      currentEstimatedCost: 5100,
      costGap: 600,
      reductionPlan: [
        { actionItem: "إعادة التفاوض مع موردي المادة الخام لخفض التكلفة بنسبة 5%", targetSaving: 300 },
        { actionItem: "تحسين عمليات الهدر أثناء التصنيع وخفض الفاقد", targetSaving: 200 },
        { actionItem: "ترشيد الطاقة واستخدام بدائل تشغيل أقل استهلاكاً", targetSaving: 100 },
      ],
    },
  ]);

  // Modals state
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    orderNumber: `JO-2026-${Math.floor(Math.random() * 900 + 100)}`,
    customerName: "",
    productName: "",
    quantity: 10,
    startDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [selectedJobForPrint, setSelectedJobForPrint] = useState<JobOrder | null>(null);

  const handleCreateJobOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: JobOrder = {
      id: `JO-${Date.now()}`,
      orderNumber: newJobForm.orderNumber,
      customerName: newJobForm.customerName || "عميل عام",
      productName: newJobForm.productName || "منتج مخصص",
      quantity: Number(newJobForm.quantity) || 1,
      startDate: newJobForm.startDate,
      status: "IN_PROGRESS",
      materials: [
        { id: "M-INIT", materialName: "مادة خام أساسية", quantity: 50, unitCost: 100, totalCost: 5000 },
      ],
      labors: [
        { id: "L-INIT", workerName: "أجور عمالة الإنتاج المباشرة", hours: 40, ratePerHour: 25, totalCost: 1000 },
      ],
      overheadCost: 1000,
      totalCost: 7000,
      notes: newJobForm.notes,
    };
    setJobOrders([newJob, ...jobOrders]);
    setIsNewJobModalOpen(false);
    setNewJobForm({
      orderNumber: `JO-2026-${Math.floor(Math.random() * 900 + 100)}`,
      customerName: "",
      productName: "",
      quantity: 10,
      startDate: new Date().toISOString().split("T")[0],
      notes: "",
    });

    if (onPostJournalEntry) {
      onPostJournalEntry({
        id: `JE-COST-${Date.now()}`,
        referenceNumber: newJob.orderNumber,
        date: new Date().toISOString().split("T")[0],
        description: `إثبات بدء أمر التكلفة الإنتاجي رقم ${newJob.orderNumber} لصالح ${newJob.customerName}`,
        status: "POSTED",
        type: "STANDARD",
        lines: [
          { id: "l1", accountId: "COST-PROD", accountCode: "5101", accountNameAr: "تكاليف الإنتاج تحت التشغيل", debit: 7000, credit: 0 },
          { id: "l2", accountId: "INV-RAW", accountCode: "1201", accountNameAr: "المخزون - مواد خام", debit: 0, credit: 5000 },
          { id: "l3", accountId: "EXP-PAY", accountCode: "2102", accountNameAr: "أجور ورواتب مستحقة", debit: 0, credit: 2000 },
        ],
      });
    }
  };

  const totalBudget = costCenters.reduce((acc, c) => acc + c.budget, 0);
  const totalActualCost = costCenters.reduce((acc, c) => acc + c.actualCost, 0);
  const totalDirectMaterials = jobOrders.reduce((acc, j) => acc + j.materials.reduce((mAcc, m) => mAcc + m.totalCost, 0), 0);
  const totalDirectLabors = jobOrders.reduce((acc, j) => acc + j.labors.reduce((lAcc, l) => lAcc + l.totalCost, 0), 0);
  const totalOverhead = jobOrders.reduce((acc, j) => acc + j.overheadCost, 0);
  const totalJobCosts = jobOrders.reduce((acc, j) => acc + j.totalCost, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans text-slate-800">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-8 shadow-2xl border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/40">
                <PieChart className="w-8 h-8" />
              </span>
              <div>
                <h1 className="text-2xl font-black">وحدة محاسبة التكاليف المتقدمة (Cost Accounting)</h1>
                <p className="text-sm text-slate-300 mt-1">
                  {companyName} • نظام محاسبة التكاليف المعياري، أوامر الإنتاج (Job Costing)، تكاليف العمليات (Process)، والأنشطة (ABC)
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              SAP CO/FI 🟢 متصل بالمع الاستاذ العام
            </span>
            <button
              onClick={() => setIsNewJobModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg transition-all text-xs"
            >
              <Plus className="w-4 h-4" />
              إنشاء أمر تكلفة جديد
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2 scrollbar-none">
        {[
          { id: "DASHBOARD", label: "لوحة تحكم التكاليف", icon: BarChart3 },
          { id: "JOB_COSTING", label: "أوامر التكلفة (Job Costing)", icon: FileText },
          { id: "PROCESS_COSTING", label: "تكاليف العمليات (Process)", icon: Layers },
          { id: "ABC_COSTING", label: "التكاليف على أساس الأنشطة (ABC)", icon: Sliders },
          { id: "STANDARD_COSTING", label: "التكاليف المعيارية والانحرافات", icon: Calculator },
          { id: "TARGET_COSTING", label: "التكلفة المستهدفة ودورة الحياة", icon: TrendingUp },
          { id: "COST_CENTERS", label: "مراكز التكلفة", icon: Building2 },
          { id: "REPORTS", label: "تقارير التكاليف والقيود", icon: Printer },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-emerald-900 text-white shadow-md shadow-emerald-900/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === "DASHBOARD" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500">إجمالي الموازنة التقديرية</p>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{totalBudget.toLocaleString()} ر.ي</h3>
                </div>
                <span className="p-3 bg-blue-50 text-blue-600 rounded-xl"><DollarSign className="w-5 h-5" /></span>
              </div>
              <p className="text-[11px] text-emerald-600 font-bold mt-3">✓ ضمن النطاق المخطط للميزانية</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500">التكاليف الفعلية المسجلة</p>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{totalActualCost.toLocaleString()} ر.ي</h3>
                </div>
                <span className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><BarChart3 className="w-5 h-5" /></span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold mt-3">نسبة الإنجاز: {Math.round((totalActualCost / totalBudget) * 100)}%</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500">تكاليف الأوامر الإنتاجية</p>
                  <h3 className="text-xl font-black text-emerald-700 mt-1">{totalJobCosts.toLocaleString()} ر.ي</h3>
                </div>
                <span className="p-3 bg-purple-50 text-purple-600 rounded-xl"><FileText className="w-5 h-5" /></span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold mt-3">{jobOrders.length} أوامر عمل نشطة ومكتملة</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500">انحرافات التكاليف المعيارية</p>
                  <h3 className="text-xl font-black text-amber-600 mt-1">-190 ر.ي</h3>
                </div>
                <span className="p-3 bg-amber-50 text-amber-600 rounded-xl"><AlertTriangle className="w-5 h-5" /></span>
              </div>
              <p className="text-[11px] text-amber-600 font-bold mt-3">تطلب مراجعة كفاءة المواد الخام</p>
            </div>
          </div>

          {/* Variance & Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-600" />
                تحليل عناصر التكاليف المباشرة وغير المباشرة
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>المواد المباشرة (Direct Materials)</span>
                    <span className="text-emerald-700">{totalDirectMaterials.toLocaleString()} ر.ي</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: "55%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>الأجور والرواتب المباشرة (Direct Labor)</span>
                    <span className="text-blue-700">{totalDirectLabors.toLocaleString()} ر.ي</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: "30%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>التكاليف الصناعية غير المباشرة (Overhead)</span>
                    <span className="text-purple-700">{totalOverhead.toLocaleString()} ر.ي</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: "15%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                ملخص الانحرافات المعيارية وتحليل الأسباب
              </h3>
              <div className="space-y-3">
                {standardCosts.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800">{item.productName} ({item.element})</span>
                      <p className="text-[11px] text-slate-500">{item.reason}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${item.isFavorable ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                      {item.isFavorable ? "ملائم +" : "غير ملائم -"} {Math.abs(item.variance)} ر.ي
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JOB ORDER COSTING */}
      {activeTab === "JOB_COSTING" && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">أوامر التكلفة الإنتاجية (Job Order Costing)</h3>
              <p className="text-xs text-slate-500">تتبع دقيق لتكاليف المواد والأجور والمصروفات لكل أمر إنتاجي أو مقاولة على حدة</p>
            </div>
            <button
              onClick={() => setIsNewJobModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow"
            >
              <Plus className="w-4 h-4" /> أمر تكلفة جديد
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-3">رقم الأمر</th>
                  <th className="p-3">العميل</th>
                  <th className="p-3">المنتج / المشروع</th>
                  <th className="p-3">الكمية</th>
                  <th className="p-3">تاريخ البداية</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">إجمالي التكلفة</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobOrders.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-emerald-800">{j.orderNumber}</td>
                    <td className="p-3 font-bold">{j.customerName}</td>
                    <td className="p-3 text-slate-600">{j.productName}</td>
                    <td className="p-3">{j.quantity}</td>
                    <td className="p-3">{j.startDate}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${j.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {j.status === "COMPLETED" ? "مكتمل" : "قيد التنفيذ"}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{j.totalCost.toLocaleString()} ر.ي</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedJobForPrint(j)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" /> بطاقة التكلفة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PROCESS COSTING */}
      {activeTab === "PROCESS_COSTING" && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900">تكاليف العمليات والمراحل الإنتاجية المستمرة (Process Costing)</h3>
            <p className="text-xs text-slate-500">توزيع التكاليف على المراحل التتابعية (المواد، الأجور، والتكاليف غير المباشرة) وحساب تكلفة الوحدة المكافئة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {processStages.map((stage, idx) => (
              <div key={stage.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">مرحلة #{idx + 1}</span>
                  <span className="text-xs font-bold text-slate-500">{stage.department}</span>
                </div>
                <h4 className="font-black text-slate-900 text-sm">{stage.stageName}</h4>
                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-3">
                  <div className="flex justify-between"><span>الوحدات المدخلة:</span><span className="font-bold">{stage.inputUnits}</span></div>
                  <div className="flex justify-between"><span>الوحدات التامة:</span><span className="font-bold text-emerald-600">{stage.completedUnits}</span></div>
                  <div className="flex justify-between"><span>تحت التشغيل:</span><span className="font-bold text-amber-600">{stage.inProgressUnits} ({stage.completionPercentage}%)</span></div>
                  <div className="flex justify-between"><span>إجمالي التكلفة:</span><span className="font-bold">{stage.totalCost.toLocaleString()} ر.ي</span></div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-slate-900">
                    <span>تكلفة الوحدة:</span>
                    <span className="text-emerald-700">{stage.unitCost.toFixed(2)} ر.ي</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ABC COSTING */}
      {activeTab === "ABC_COSTING" && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900">التكاليف على أساس الأنشطة (Activity-Based Costing - ABC)</h3>
            <p className="text-xs text-slate-500">توزيع التكاليف الصناعية وغير المباشرة بناءً على محركات التكلفة الفعلية (Cost Drivers) لتحقيق تسعير دقيق وربحية موثوقة</p>
          </div>

          <div className="space-y-4">
            {abcActivities.map((act) => (
              <div key={act.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{act.activityName}</h4>
                    <p className="text-xs text-slate-500">محرك التكلفة: <span className="font-bold text-slate-700">{act.costDriver}</span></p>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black text-emerald-700">{act.totalCost.toLocaleString()} ر.ي</div>
                    <div className="text-[11px] text-slate-500">معدل المحرك: {act.ratePerDriver} ر.ي / وحدة</div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <p className="text-xs font-bold text-slate-700 mb-2">توزيع النشاط على المنتجات:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {act.allocatedProducts.map((p, pIdx) => (
                      <div key={pIdx} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">{p.productName}</span>
                        <div className="text-left">
                          <span className="font-bold text-emerald-600">{p.allocatedCost.toLocaleString()} ر.ي</span>
                          <span className="text-[10px] text-slate-400 block">استهلاك: {p.driverConsumption}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: STANDARD COSTING */}
      {activeTab === "STANDARD_COSTING" && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900">التكاليف المعيارية وتحليل الانحرافات (Standard Costing & Variances)</h3>
            <p className="text-xs text-slate-500">مقارنة التكاليف المعيارية المخططة بالتكاليف الفعلية لتحديد الانحرافات الملائمة وغير الملائمة</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-3">المنتج</th>
                  <th className="p-3">عنصر التكلفة</th>
                  <th className="p-3">التكلفة المعيارية</th>
                  <th className="p-3">التكلفة الفعلية</th>
                  <th className="p-3">الانحراف</th>
                  <th className="p-3">الحالة والنوع</th>
                  <th className="p-3">السبب التحليلي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {standardCosts.map((sc) => (
                  <tr key={sc.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold">{sc.productName}</td>
                    <td className="p-3 font-mono">{sc.element}</td>
                    <td className="p-3 font-bold">{sc.standardAmount} ر.ي</td>
                    <td className="p-3 font-bold">{sc.actualAmount} ر.ي</td>
                    <td className={`p-3 font-black ${sc.variance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {sc.variance >= 0 ? `+${sc.variance}` : sc.variance} ر.ي
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${sc.isFavorable ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                        {sc.isFavorable ? "ملائم F" : "غير ملائم U"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{sc.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: TARGET COSTING */}
      {activeTab === "TARGET_COSTING" && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900">التكلفة المستهدفة وتكلفة دورة الحياة (Target & Life Cycle Costing)</h3>
            <p className="text-xs text-slate-500">تحديد التكلفة بناءً على سعر السوق التنافسي وهامش الربح المطلوب، وإدارة فجوة التكلفة</p>
          </div>

          <div className="space-y-6">
            {targetCosts.map((tc) => (
              <div key={tc.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">تحليل استراتيجي للتكلفة</span>
                    <h4 className="text-base font-black text-slate-900 mt-1">{tc.productName}</h4>
                  </div>
                  <div className="text-left text-xs space-y-1">
                    <div>سعر البيع بالسوق: <span className="font-bold">{tc.marketPrice.toLocaleString()} ر.ي</span></div>
                    <div>هامش الربح المستهدف: <span className="font-bold text-emerald-600">{tc.targetProfitMarginPct}%</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-xs text-slate-500">التكلفة المستهدفة المسموحة:</span>
                    <div className="text-lg font-black text-emerald-700">{tc.targetCost.toLocaleString()} ر.ي</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">التكلفة التقديرية الحالية:</span>
                    <div className="text-lg font-black text-slate-900">{tc.currentEstimatedCost.toLocaleString()} ر.ي</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">فجوة التكلفة (Cost Gap):</span>
                    <div className="text-lg font-black text-rose-600">{tc.costGap.toLocaleString()} ر.ي</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-800">خطة تخفيض التكلفة وهندسة القيمة:</p>
                  <div className="space-y-2">
                    {tc.reductionPlan.map((plan, pIdx) => (
                      <div key={pIdx} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                        <span className="text-slate-700 font-medium">{plan.actionItem}</span>
                        <span className="font-bold text-emerald-600">وفورات مستهدفة: -{plan.targetSaving} ر.ي</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: COST CENTERS */}
      {activeTab === "COST_CENTERS" && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">إدارة مراكز التكلفة (Cost Centers - CO)</h3>
              <p className="text-xs text-slate-500">ربط الإيرادات والمصروفات بمراكز المسؤولية والإنتاج والخدمات</p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
              {costCenters.length} مراكز تكلفة نشطة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-3">رمز المركز</th>
                  <th className="p-3">اسم المركز بالعربية</th>
                  <th className="p-3">النوع</th>
                  <th className="p-3">الموازنة المعتمدة</th>
                  <th className="p-3">التكلفة الفعلية</th>
                  <th className="p-3">الموقف المالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {costCenters.map((cc) => {
                  const diff = cc.budget - cc.actualCost;
                  return (
                    <tr key={cc.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-emerald-800">{cc.code}</td>
                      <td className="p-3 font-bold">{cc.nameAr}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                          {cc.type}
                        </span>
                      </td>
                      <td className="p-3 font-bold">{cc.budget.toLocaleString()} ر.ي</td>
                      <td className="p-3 font-bold text-slate-900">{cc.actualCost.toLocaleString()} ر.ي</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${diff >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                          {diff >= 0 ? `وفر: +${diff.toLocaleString()}` : `تجاوز: ${diff.toLocaleString()}`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: REPORTS & JOURNAL ENTRIES */}
      {activeTab === "REPORTS" && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900">تقارير التكاليف الشاملة والقيود المحاسبية الآلية</h3>
            <p className="text-xs text-slate-500">تصدير التقارير الختامية ومراجعة القيود المحاسبية المرتبطة بمحاسبة التكاليف</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "تقرير تكاليف الإنتاج الشامل", desc: "استعراض تفصيلي للمواد والأجور والتشغيل", icon: FileText },
              { title: "تقرير تكلفة الوحدة والربحية", desc: "تحليل ربحية المنتجات والخدمات والمبيعات", icon: PieChart },
              { title: "تقرير الانحرافات المعيارية", desc: "تحليل انحرافات الأسعار والكميات والمعدلات", icon: AlertTriangle },
              { title: "تقرير مراكز التكلفة والموازنة", desc: "مقارنة الموازنات بالتكاليف الفعلية للمراكز", icon: Building2 },
            ].map((rep, idx) => {
              const Icon = rep.icon;
              return (
                <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 hover:border-emerald-500 transition-all">
                  <span className="p-3 bg-emerald-100 text-emerald-800 rounded-xl inline-block"><Icon className="w-5 h-5" /></span>
                  <h4 className="font-black text-slate-900 text-sm">{rep.title}</h4>
                  <p className="text-xs text-slate-500">{rep.desc}</p>
                  <button
                    onClick={() => alert(`جاري تصدير ${rep.title} بصيغة PDF / Excel للمعالجة الرسمية...`)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="w-3.5 h-3.5" /> طباعة وتصدير
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NEW JOB ORDER MODAL */}
      {isNewJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative font-sans space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" /> فتح أمر تكلفة إنتاجي جديد (Job Order)
              </h3>
              <button onClick={() => setIsNewJobModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJobOrder} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الأمر / المرجع</label>
                <input
                  type="text"
                  required
                  value={newJobForm.orderNumber}
                  onChange={(e) => setNewJobForm({ ...newJobForm, orderNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم العميل / الجهة الطالبة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة الأمل للمقاولات"
                  value={newJobForm.customerName}
                  onChange={(e) => setNewJobForm({ ...newJobForm, customerName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المنتج أو المشروع الإنتاجي</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: توريد هيكل خرساني مسلح"
                  value={newJobForm.productName}
                  onChange={(e) => setNewJobForm({ ...newJobForm, productName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الكمية المستهدفة</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newJobForm.quantity}
                    onChange={(e) => setNewJobForm({ ...newJobForm, quantity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ البدء</label>
                  <input
                    type="date"
                    required
                    value={newJobForm.startDate}
                    onChange={(e) => setNewJobForm({ ...newJobForm, startDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات وتعليمات الإنتاج</label>
                <textarea
                  rows={2}
                  value={newJobForm.notes}
                  onChange={(e) => setNewJobForm({ ...newJobForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  placeholder="ملاحظات فنية أو شروط خاصة بالأمر..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewJobModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow"
                >
                  حفظ وترحيل القيد المحاسبي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT JOB COST CARD MODAL */}
      {selectedJobForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative font-sans space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="text-center border-b-2 border-slate-900 pb-4">
              <h1 className="text-xl font-black">{companyName}</h1>
              <p className="text-xs text-slate-600 mt-1">{tenantDetails?.address || "الإدارة العامة والسيادية"} • قسم محاسبة التكاليف</p>
              <h2 className="text-base font-black text-emerald-800 mt-3">بطاقة تكلفة أمر إنتاجي (Job Cost Card)</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div><span>رقم الأمر: </span><strong>{selectedJobForPrint.orderNumber}</strong></div>
              <div><span>العميل: </span><strong>{selectedJobForPrint.customerName}</strong></div>
              <div><span>المنتج / المشروع: </span><strong>{selectedJobForPrint.productName}</strong></div>
              <div><span>الكمية: </span><strong>{selectedJobForPrint.quantity}</strong></div>
              <div><span>تاريخ البدء: </span><strong>{selectedJobForPrint.startDate}</strong></div>
              <div><span>الحالة: </span><strong>{selectedJobForPrint.status}</strong></div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-black text-slate-900 mb-2">1. المواد المباشرة المسحوبة:</h4>
                <table className="w-full text-right border border-slate-200">
                  <thead className="bg-slate-100 font-bold">
                    <tr>
                      <th className="p-2 border">الصنف / المادة</th>
                      <th className="p-2 border">الكمية</th>
                      <th className="p-2 border">سعر الوحدة</th>
                      <th className="p-2 border">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedJobForPrint.materials.map((m) => (
                      <tr key={m.id}>
                        <td className="p-2 border">{m.materialName}</td>
                        <td className="p-2 border">{m.quantity}</td>
                        <td className="p-2 border">{m.unitCost} ر.ي</td>
                        <td className="p-2 border font-bold">{m.totalCost} ر.ي</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-black text-slate-900 mb-2">2. الأجور والعمالة المباشرة:</h4>
                <table className="w-full text-right border border-slate-200">
                  <thead className="bg-slate-100 font-bold">
                    <tr>
                      <th className="p-2 border">فريق العمل / العامل</th>
                      <th className="p-2 border">الساعات</th>
                      <th className="p-2 border">المعدل / ساعة</th>
                      <th className="p-2 border">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedJobForPrint.labors.map((l) => (
                      <tr key={l.id}>
                        <td className="p-2 border">{l.workerName}</td>
                        <td className="p-2 border">{l.hours}</td>
                        <td className="p-2 border">{l.ratePerHour} ر.ي</td>
                        <td className="p-2 border font-bold">{l.totalCost} ر.ي</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex justify-between items-center text-sm font-black text-emerald-900">
                <span>إجمالي تكلفة الأمر الإنتاجي:</span>
                <span>{selectedJobForPrint.totalCost.toLocaleString()} ريال يمني</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-end gap-3 print:hidden">
              <button
                onClick={() => setSelectedJobForPrint(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                إغلاق
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> طباعة البطاقة الرسمية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
