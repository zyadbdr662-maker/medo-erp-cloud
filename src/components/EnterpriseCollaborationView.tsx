import React, { useState, useRef, useEffect } from "react";
import {
  Inbox,
  Send,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Paperclip,
  Download,
  Share2,
  Eye,
  Shield,
  ShieldCheck,
  Building,
  User,
  Users,
  MessageSquare,
  Megaphone,
  Activity,
  History,
  Lock,
  Stamp,
  PenTool,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Printer,
  Check,
  Trash2,
  Tag,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase,
  AlertOctagon,
  RefreshCw,
  FolderArchive,
  FileCheck,
  CornerDownLeft,
  Smile,
  Info,
  DollarSign,
  Package,
  Truck,
  TrendingUp,
  UserCheck,
  Scale,
  Building2,
  MapPin,
  Award,
  GitBranch,
  Sliders,
  Target,
  PieChart,
  FileSpreadsheet,
  Compass,
} from "lucide-react";
import {
  CorrespondenceDocument,
  ApprovalRequest,
  AuditLogEntry,
  SystemAlert,
  ChatChannel,
  ChatMessage,
  AdministrativeCircular,
  ERPUser,
  CurrencyCode,
  CurrencyInfo,
  DigitalSignature,
  Branch,
  WorkflowRouteRule,
  DocumentStudyAnalysis,
  WorkflowStepDefinition,
} from "../types/erp";
import { INITIAL_WORKFLOW_RULES } from "../data/initialERPData";
import { formatNumber } from "../utils/formatters";

interface EnterpriseCollaborationViewProps {
  currentUser: ERPUser;
  branches: Branch[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  correspondences: CorrespondenceDocument[];
  onUpdateCorrespondences: (docs: CorrespondenceDocument[]) => void;
  approvalRequests: ApprovalRequest[];
  onUpdateApprovalRequests: (aprs: ApprovalRequest[]) => void;
  workflowRules?: WorkflowRouteRule[];
  onUpdateWorkflowRules?: (rules: WorkflowRouteRule[]) => void;
  auditLogs: AuditLogEntry[];
  onAddAuditLog: (log: AuditLogEntry) => void;
  systemAlerts: SystemAlert[];
  onUpdateSystemAlerts: (alerts: SystemAlert[]) => void;
  chatChannels: ChatChannel[];
  onUpdateChatChannels: (channels: ChatChannel[]) => void;
  chatMessages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
  circulars: AdministrativeCircular[];
  onUpdateCirculars: (circulars: AdministrativeCircular[]) => void;
  onNavigateToModule?: (tab: any) => void;
}

type MainTab = "INBOX_OUTBOX" | "APPROVALS" | "WORKFLOW_RULES" | "STUDIES" | "CHAT" | "CIRCULARS" | "AUDIT_MONITOR";

export const EnterpriseCollaborationView: React.FC<EnterpriseCollaborationViewProps> = ({
  currentUser,
  branches,
  currencies,
  displayCurrency,
  correspondences,
  onUpdateCorrespondences,
  approvalRequests,
  onUpdateApprovalRequests,
  workflowRules,
  onUpdateWorkflowRules,
  auditLogs,
  onAddAuditLog,
  systemAlerts,
  onUpdateSystemAlerts,
  chatChannels,
  onUpdateChatChannels,
  chatMessages,
  onSendMessage,
  circulars,
  onUpdateCirculars,
  onNavigateToModule,
}) => {
  const safeUser: ERPUser = currentUser || {
    id: "u-1",
    name: "د. طارق المنصوري",
    role: "المدير العام والمدير المالي التنفيذي",
    avatar: "👑",
    branch: "المركز الرئيسي - صنعاء",
    email: "tariq@medo-erp.ye",
    isActive: true,
  };

  const DEFAULT_CHANNELS: ChatChannel[] = [
    {
      id: "ch-finance",
      name: "غرفة العمليات المالية والحسابات",
      type: "DEPARTMENT",
      description: "تنسيق القيود اليومية، سندات الصرف، ومصادقة الشيكات",
      participants: ["u-1", "u-2", "u-3"],
      unreadCount: 0,
    },
    {
      id: "ch-procurement",
      name: "لجنة المشتريات وإدارة الموردين",
      type: "DEPARTMENT",
      description: "متابعة أوامر الشراء، المناقصات، وتنسيق المخازن",
      participants: ["u-1", "u-2", "u-4"],
      unreadCount: 0,
    },
    {
      id: "ch-general",
      name: "القناة العامة - المركز الرئيسي",
      type: "BRANCH",
      description: "غرفة التواصل والتعاون المباشر وتنسيق العمليات",
      participants: ["u-1", "u-2", "u-3", "u-4"],
      unreadCount: 0,
    },
  ];

  const effectiveChannels: ChatChannel[] =
    chatChannels && chatChannels.length > 0 ? chatChannels : DEFAULT_CHANNELS;

  const [activeTab, setActiveTab] = useState<MainTab>("INBOX_OUTBOX");

  // --- Sub-Tab Filters ---
  const [docFilterType, setDocFilterType] = useState<"ALL" | "INCOMING" | "OUTGOING" | "INTERNAL_MEMO" | "ARCHIVE">("ALL");
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>("ALL");
  const [docSearchQuery, setDocSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<CorrespondenceDocument | null>(null);
  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false);

  // --- Department Filter & Simulation Hub ---
  const [selectedDepartment, setSelectedDepartment] = useState<"ALL" | "FINANCE" | "PROCUREMENT" | "SALES" | "HR" | "LEGAL" | "BRANCHES">("ALL");
  const [isDepartmentSimulatorOpen, setIsDepartmentSimulatorOpen] = useState(false);
  const [simulatorSelectedDept, setSimulatorSelectedDept] = useState<"FINANCE" | "PROCUREMENT" | "SALES" | "HR" | "LEGAL" | "BRANCHES">("FINANCE");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Create Doc Form State ---
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocType, setNewDocType] = useState<"INCOMING" | "OUTGOING" | "INTERNAL_MEMO">("INCOMING");
  const [newDocCategory, setNewDocCategory] = useState<"FINANCIAL" | "ADMINISTRATIVE" | "OPERATIONAL" | "LEGAL">("FINANCIAL");
  const [newDocPriority, setNewDocPriority] = useState<"URGENT" | "HIGH" | "NORMAL">("HIGH");
  const [newDocSender, setNewDocSender] = useState("");
  const [newDocRecipient, setNewDocRecipient] = useState("الإدارة المالية والمحاسبية");
  const [newDocSummary, setNewDocSummary] = useState("");
  const [newDocBranch, setNewDocBranch] = useState("المركز الرئيسي - صنعاء");
  const [newDocTags, setNewDocTags] = useState("معاملة_مؤسسية, مراجعة_مالية");

  // Show toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // --- Approval Modal & Signature State ---
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [approvalCommentText, setApprovalCommentText] = useState("");
  const [approvalActionType, setApprovalActionType] = useState<"APPROVE" | "REJECT" | "FORWARD" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [forwardRecipient, setForwardRecipient] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // --- Chat State ---
  const [activeChannelId, setActiveChannelId] = useState<string>(effectiveChannels[0]?.id || "ch-finance");
  const [chatInputText, setChatInputText] = useState("");
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // --- Circular Modal ---
  const [isCreateCircularOpen, setIsCreateCircularOpen] = useState(false);
  const [newCircularTitle, setNewCircularTitle] = useState("");
  const [newCircularContent, setNewCircularContent] = useState("");
  const [newCircularPriority, setNewCircularPriority] = useState<"URGENT" | "IMPORTANT" | "ROUTINE">("IMPORTANT");
  const [newCircularAudience, setNewCircularAudience] = useState<"ALL" | "BRANCH" | "DEPARTMENT">("ALL");

  // --- Audit Log Filters ---
  const [auditModuleFilter, setAuditModuleFilter] = useState<string>("ALL");
  const [auditSearchQuery, setAuditSearchQuery] = useState("");

  // --- Workflow Rules & Study Analysis State ---
  const effectiveWorkflowRules: WorkflowRouteRule[] =
    workflowRules && workflowRules.length > 0 ? workflowRules : INITIAL_WORKFLOW_RULES;

  const [workflowRuleFilter, setWorkflowRuleFilter] = useState<string>("ALL");
  const [isCreateWorkflowRuleOpen, setIsCreateWorkflowRuleOpen] = useState(false);
  const [selectedWorkflowRule, setSelectedWorkflowRule] = useState<WorkflowRouteRule | null>(null);

  // Form state for creating workflow rule
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleDocType, setNewRuleDocType] = useState<"JOURNAL" | "VOUCHER" | "PURCHASE_BILL" | "SALES_INVOICE" | "HR_PAYROLL" | "EXPENSE">("VOUCHER");
  const [newRuleMinAmount, setNewRuleMinAmount] = useState<number>(1000000);
  const [newRuleMaxAmount, setNewRuleMaxAmount] = useState<number>(15000000);
  const [newRuleCurrency, setNewRuleCurrency] = useState<CurrencyCode>("YER_SANAA");
  const [newRulePriority, setNewRulePriority] = useState<"URGENT" | "HIGH" | "NORMAL" | "LOW">("HIGH");
  const [newRuleBranchScope, setNewRuleBranchScope] = useState<"ALL" | "SPECIFIC">("ALL");
  const [newRuleDescription, setNewRuleDescription] = useState("");
  const [newRuleSteps, setNewRuleSteps] = useState<WorkflowStepDefinition[]>([
    {
      stepOrder: 1,
      stepName: "المراجعة المستندية والتدقيق المحاسبي",
      approverRole: "رئيس قسم الحسابات",
      approverUserId: "u-2",
      approverUserName: "أ. عبدالسلام العولقي",
      slaHours: 24,
      isMandatory: true,
      requiresDigitalSignature: true,
      requiresStudyDocument: false,
    },
    {
      stepOrder: 2,
      stepName: "الاعتماد المالي النهائي والمصادقة",
      approverRole: "المدير المالي والمدير العام التنفيذي",
      approverUserId: "u-1",
      approverUserName: "د. طارق المنصوري",
      slaHours: 12,
      isMandatory: true,
      requiresDigitalSignature: true,
      requiresStudyDocument: true,
    },
  ]);

  // Studies State & Filter
  const [studyRiskFilter, setStudyRiskFilter] = useState<string>("ALL");
  const [studySearchQuery, setStudySearchQuery] = useState("");
  const [selectedStudyModal, setSelectedStudyModal] = useState<DocumentStudyAnalysis | null>(null);
  const [isCreateStudyModalOpen, setIsCreateStudyModalOpen] = useState(false);

  // New Study Form
  const [newStudyTitle, setNewStudyTitle] = useState("");
  const [newStudyRef, setNewStudyRef] = useState("");
  const [newStudyRiskLevel, setNewStudyRiskLevel] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("LOW");
  const [newStudyFeasibilityScore, setNewStudyFeasibilityScore] = useState<number>(92);
  const [newStudyFinancialNotes, setNewStudyFinancialNotes] = useState("");
  const [newStudyBudgetAllocated, setNewStudyBudgetAllocated] = useState<number>(5000000);
  const [newStudyCurrency, setNewStudyCurrency] = useState<CurrencyCode>("YER_SANAA");
  const [newStudyRoi, setNewStudyRoi] = useState<number>(18);
  const [newStudySummary, setNewStudySummary] = useState("");
  const [newStudyRecommendations, setNewStudyRecommendations] = useState("الموافقة على الصرف بموجب اكتمال الوثائق وتوفر السيولة في الحسابات المحددة");

  // Approval Modal Sub-Tab
  const [approvalModalTab, setApprovalModalTab] = useState<"SIGNATURE" | "LINKED_DOC" | "STUDY">("SIGNATURE");

  // Counts
  const pendingApprovalsCount = approvalRequests.filter((a) => a.status === "PENDING").length;
  const unreadAlertsCount = systemAlerts.filter((a) => !a.isRead).length;
  const newInboxCount = correspondences.filter((c) => c.type === "INCOMING" && c.status === "NEW").length;

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeChannelId]);

  // --- Digital Signature Canvas Controls ---
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#D4AF37"; // Golden signature line
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignatureCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // --- Approval Execution ---
  const handleExecuteApproval = (action: "APPROVE" | "REJECT" | "FORWARD") => {
    if (!selectedApproval) return;

    let signatureUrl = "";
    if (action === "APPROVE") {
      const canvas = canvasRef.current;
      signatureUrl = canvas ? canvas.toDataURL("image/png") : "";
    }

    const newComment = {
      id: `c-${Date.now()}`,
      userName: safeUser.name,
      userAvatar: safeUser.avatar,
      role: safeUser.role,
      timestamp: new Date().toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" }),
      text:
        action === "APPROVE"
          ? approvalCommentText || "تم الاعتماد والتوقيع الإلكتروني بموجب الصلاحيات."
          : action === "REJECT"
          ? `تم الرفض: ${rejectionReason || "غير مطابق للوائح"}`
          : `تم إعادة التوجيه إلى: ${forwardRecipient || "المسؤول المعني"}`,
      action,
    };

    const updatedSteps = selectedApproval.workflowSteps.map((step) => {
      if (step.stepOrder === selectedApproval.currentStep) {
        return {
          ...step,
          status: action === "APPROVE" ? ("APPROVED" as const) : action === "REJECT" ? ("REJECTED" as const) : ("PENDING" as const),
          actionDate: new Date().toISOString().slice(0, 10),
          notes: newComment.text,
          signatureImage: signatureUrl || undefined,
          approverUserName: safeUser.name,
        };
      }
      return step;
    });

    const isFullyApproved = action === "APPROVE" && selectedApproval.currentStep >= selectedApproval.totalSteps;
    const nextStep = action === "APPROVE" && !isFullyApproved ? selectedApproval.currentStep + 1 : selectedApproval.currentStep;

    const digitalSig: DigitalSignature | undefined =
      action === "APPROVE"
        ? {
            signerName: safeUser.name,
            signerRole: safeUser.role,
            signerUserId: safeUser.id,
            signedAt: new Date().toLocaleString("ar-YE"),
            signatureDataUrl: signatureUrl || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='60'><path d='M10 40 Q 50 10 90 35 T 170 20' fill='none' stroke='%23D4AF37' stroke-width='3'/></svg>",
            certificateId: `CERT-MEDO-${Date.now().toString().slice(-6)}`,
            verificationHash: `SHA256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
            ipAddress: "192.168.1.100 (شبكة مـيـدو الداخلية)",
          }
        : selectedApproval.digitalSignature;

    const updatedApproval: ApprovalRequest = {
      ...selectedApproval,
      status: action === "REJECT" ? "REJECTED" : isFullyApproved ? "APPROVED" : selectedApproval.status,
      currentStep: nextStep,
      workflowSteps: updatedSteps,
      comments: [...selectedApproval.comments, newComment],
      digitalSignature: digitalSig,
    };

    const newApprovalList = approvalRequests.map((a) => (a.id === updatedApproval.id ? updatedApproval : a));
    onUpdateApprovalRequests(newApprovalList);

    // Audit Log Creation
    onAddAuditLog({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString("ar-YE"),
      userId: safeUser.id,
      userName: safeUser.name,
      userRole: safeUser.role,
      userAvatar: safeUser.avatar,
      branchName: safeUser.branch,
      actionType: action === "APPROVE" ? "APPROVE" : action === "REJECT" ? "REJECT" : "UPDATE",
      module: selectedApproval.documentType === "JOURNAL" ? "FI_JOURNAL" : "TREASURY",
      entityId: selectedApproval.id,
      entityRef: selectedApproval.requestNumber,
      details: `${action === "APPROVE" ? "اعتماد وتوقيع رقمي" : action === "REJECT" ? "رفض معاملة" : "إعادة توجيه"} المستند: ${selectedApproval.title}`,
      ipAddress: "192.168.1.100",
      device: "MeDo Enterprise Station",
      status: "SUCCESS",
    });

    setSelectedApproval(null);
    setApprovalActionType(null);
    setApprovalCommentText("");
    setRejectionReason("");
    clearSignatureCanvas();
  };

  // --- Workflow Rules Handlers ---
  const handleSaveWorkflowRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const newRule: WorkflowRouteRule = {
      id: `wf-rule-${Date.now()}`,
      name: newRuleName.trim(),
      nameAr: newRuleName.trim(),
      documentType: newRuleDocType,
      minAmount: Number(newRuleMinAmount) || 0,
      maxAmount: newRuleMaxAmount ? Number(newRuleMaxAmount) : undefined,
      currency: newRuleCurrency,
      branchScope: newRuleBranchScope,
      priority: newRulePriority,
      isActive: true,
      description: newRuleDescription,
      steps: newRuleSteps,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const updatedRules = [newRule, ...effectiveWorkflowRules];
    if (onUpdateWorkflowRules) {
      onUpdateWorkflowRules(updatedRules);
    }

    onAddAuditLog({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString("ar-YE"),
      userId: safeUser.id,
      userName: safeUser.name,
      userRole: safeUser.role,
      userAvatar: safeUser.avatar,
      branchName: safeUser.branch,
      actionType: "CREATE",
      module: "SYSTEM_SETTINGS",
      entityId: newRule.id,
      entityRef: newRule.name,
      details: `إنشاء مسار سير عمل واعتماد مالي جديد: ${newRule.name} (${newRule.steps.length} مراحل)`,
      ipAddress: "192.168.1.100",
      device: "MeDo Enterprise Station",
      status: "SUCCESS",
    });

    setIsCreateWorkflowRuleOpen(false);
    setNewRuleName("");
    setNewRuleDescription("");
    showToast(`تم حفظ مسار الاعتماد الجديد بنجاح (${newRule.name})`);
  };

  const handleToggleRuleActive = (ruleId: string) => {
    const updated = effectiveWorkflowRules.map((r) =>
      r.id === ruleId ? { ...r, isActive: !r.isActive } : r
    );
    if (onUpdateWorkflowRules) {
      onUpdateWorkflowRules(updated);
    }
    showToast("تم تحديث حالة تفعيل مسار الاعتماد");
  };

  const handleDeleteRule = (ruleId: string) => {
    const updated = effectiveWorkflowRules.filter((r) => r.id !== ruleId);
    if (onUpdateWorkflowRules) {
      onUpdateWorkflowRules(updated);
    }
    showToast("تم حذف مسار الاعتماد");
  };

  // --- Document Feasibility & Study Analysis Handlers ---
  const handleSaveStudyAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudyTitle.trim()) return;

    const newStudy: DocumentStudyAnalysis = {
      id: `study-${Date.now()}`,
      title: newStudyTitle.trim(),
      documentTitle: newStudyTitle.trim(),
      documentRef: newStudyRef.trim() || `STD-2026-${Date.now().toString().slice(-4)}`,
      preparedBy: safeUser.name,
      preparedRole: safeUser.role,
      preparedDate: new Date().toISOString().slice(0, 10),
      date: new Date().toISOString().slice(0, 10),
      riskLevel: newStudyRiskLevel,
      feasibilityScore: newStudyFeasibilityScore,
      financialImpactNotes: newStudyFinancialNotes || "تمت مراجعة التدفقات النقدية ومطابقة أرصدة الحسابات والتأكد من توافق العملية مع الموازنة التقديرية.",
      budgetAllocated: Number(newStudyBudgetAllocated) || 0,
      currency: newStudyCurrency,
      expectedRoiPercentage: newStudyRoi ? Number(newStudyRoi) : undefined,
      roiEstimatePercent: newStudyRoi ? Number(newStudyRoi) : undefined,
      summary: newStudySummary || "دراسة جدوى ومخاطر متكاملة تشمل التدقيق المحاسبي ومصادر التمويل.",
      recommendations: [newStudyRecommendations],
      studyAttachments: [
        {
          id: `att-study-${Date.now()}`,
          name: `دراسة_جدوى_${newStudyRef || "معاملة"}.pdf`,
          size: "1.8 MB",
          type: "application/pdf",
        },
      ],
    };

    let matched = false;
    const updatedApprovals = approvalRequests.map((req) => {
      if (req.requestNumber === newStudy.documentRef || req.title.includes(newStudy.documentTitle)) {
        matched = true;
        return { ...req, studyAnalysis: newStudy };
      }
      return req;
    });

    if (matched) {
      onUpdateApprovalRequests(updatedApprovals);
    } else if (approvalRequests.length > 0) {
      const firstPending = approvalRequests.find((a) => a.status === "PENDING") || approvalRequests[0];
      const updated = approvalRequests.map((a) =>
        a.id === firstPending.id ? { ...a, studyAnalysis: newStudy } : a
      );
      onUpdateApprovalRequests(updated);
    }

    onAddAuditLog({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString("ar-YE"),
      userId: safeUser.id,
      userName: safeUser.name,
      userRole: safeUser.role,
      userAvatar: safeUser.avatar,
      branchName: safeUser.branch,
      actionType: "CREATE",
      module: "COLLABORATION",
      entityId: newStudy.id,
      entityRef: newStudy.documentRef,
      details: `إعداد وتوثيق دراسة جدوى وتحليل مالي: ${newStudy.documentTitle} (مؤشر الجدوى: ${newStudy.feasibilityScore}%)`,
      ipAddress: "192.168.1.100",
      device: "MeDo Enterprise Station",
      status: "SUCCESS",
    });

    setIsCreateStudyModalOpen(false);
    setNewStudyTitle("");
    setNewStudyRef("");
    setNewStudyFinancialNotes("");
    showToast(`تم توثيق دراسة الجدوى والتحليل المالي بنجاح (${newStudy.documentTitle})`);
  };

  // --- Send Chat Message ---
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: activeChannelId,
      senderId: safeUser.id,
      senderName: safeUser.name,
      senderRole: safeUser.role,
      senderAvatar: safeUser.avatar,
      branchName: safeUser.branch,
      text: chatInputText.trim(),
      timestamp: new Date().toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" }),
    };

    onSendMessage(newMsg);
    setChatInputText("");
  };

  // --- Acknowledge Circular ---
  const handleAcknowledgeCircular = (circularId: string) => {
    const updated = circulars.map((c) => {
      if (c.id === circularId) {
        const alreadyAck = c.acknowledgedBy.some((a) => a.userId === safeUser.id);
        if (!alreadyAck) {
          return {
            ...c,
            acknowledgedBy: [
              ...c.acknowledgedBy,
              {
                userId: safeUser.id,
                userName: safeUser.name,
                acknowledgedAt: new Date().toLocaleString("ar-YE"),
              },
            ],
          };
        }
      }
      return c;
    });
    onUpdateCirculars(updated);
  };

  // --- Create New Correspondence Document Handler ---
  const handleCreateNewDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    const newDoc: CorrespondenceDocument = {
      id: `doc-${Date.now()}`,
      refNumber: `MEDO-${newDocType === "INCOMING" ? "IN" : newDocType === "OUTGOING" ? "OUT" : "MEMO"}-${Date.now().toString().slice(-4)}`,
      type: newDocType,
      category: newDocCategory,
      priority: newDocPriority,
      title: newDocTitle.trim(),
      summary: newDocSummary.trim() || `مستند ومعاملة إلكترونية مسجلة في نظام مـيـدو المؤسسي.`,
      senderName: newDocSender.trim() || safeUser.name,
      senderOrganization: newDocType === "INCOMING" ? (newDocSender.trim() || "جهة خارجية") : "مجموعة مـيـدو التجارية العالمية",
      recipientName: newDocRecipient,
      recipientDepartment: newDocRecipient,
      date: new Date().toISOString().slice(0, 10),
      status: "NEW",
      branchName: newDocBranch,
      confidentiality: "INTERNAL",
      createdBy: safeUser.name,
      createdAt: new Date().toISOString(),
      tags: newDocTags.split(",").map((t) => t.trim()).filter(Boolean),
      attachments: [
        {
          id: `att-${Date.now()}`,
          name: `وثيقة_${newDocTitle.slice(0, 15).replace(/\s+/g, "_")}.pdf`,
          type: "application/pdf",
          size: "1.2 MB",
          uploadDate: new Date().toISOString().slice(0, 10),
        },
      ],
    };

    onUpdateCorrespondences([newDoc, ...correspondences]);

    onAddAuditLog({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString("ar-YE"),
      userId: safeUser.id,
      userName: safeUser.name,
      userRole: safeUser.role,
      userAvatar: safeUser.avatar,
      branchName: safeUser.branch,
      actionType: "CREATE",
      module: "COLLABORATION",
      entityId: newDoc.id,
      entityRef: newDoc.refNumber,
      details: `تسجيل معاملة / وثيقة جديدة: ${newDoc.title} (${newDoc.type})`,
      ipAddress: "192.168.1.100",
      device: "MeDo Enterprise Station",
      status: "SUCCESS",
    });

    setIsCreateDocOpen(false);
    setNewDocTitle("");
    setNewDocSummary("");
    setNewDocSender("");
    showToast(`تم تسجيل المعاملة بنجاح برقم مرجعي: ${newDoc.refNumber}`);
  };

  // --- Create New Circular Handler ---
  const handleCreateNewCircular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircularTitle.trim() || !newCircularContent.trim()) return;

    const newCirc: AdministrativeCircular = {
      id: `circ-${Date.now()}`,
      circularNumber: `CIRC-2026-${(circulars.length + 1).toString().padStart(3, "0")}`,
      title: newCircularTitle.trim(),
      content: newCircularContent.trim(),
      issuedBy: safeUser.name,
      issuerRole: safeUser.role,
      issueDate: new Date().toISOString().slice(0, 10),
      priority: newCircularPriority === "URGENT" ? "URGENT" : "IMPORTANT",
      targetAudience: newCircularAudience === "ALL" ? "ALL" : "DEPARTMENT",
      isPinned: false,
      acknowledgedBy: [
        {
          userId: safeUser.id,
          userName: safeUser.name,
          acknowledgedAt: new Date().toLocaleString("ar-YE"),
        },
      ],
    };

    onUpdateCirculars([newCirc, ...circulars]);

    onAddAuditLog({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString("ar-YE"),
      userId: safeUser.id,
      userName: safeUser.name,
      userRole: safeUser.role,
      userAvatar: safeUser.avatar,
      branchName: safeUser.branch,
      actionType: "CREATE",
      module: "COLLABORATION",
      entityId: newCirc.id,
      entityRef: newCirc.circularNumber,
      details: `إصدار تعميم إداري رسمي: ${newCirc.title}`,
      ipAddress: "192.168.1.100",
      device: "MeDo Enterprise Station",
      status: "SUCCESS",
    });

    setIsCreateCircularOpen(false);
    setNewCircularTitle("");
    setNewCircularContent("");
    showToast(`تم نشر التعميم الإداري بنجاح برقم: ${newCirc.circularNumber}`);
  };

  // --- Instant Department Model Generator ---
  const handleGenerateDepartmentSample = (deptKey: "FINANCE" | "PROCUREMENT" | "SALES" | "HR" | "LEGAL" | "BRANCHES") => {
    const timestamp = Date.now();
    const timeStr = new Date().toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" });

    if (deptKey === "FINANCE") {
      const sampleApr: ApprovalRequest = {
        id: `apr-fi-${timestamp}`,
        requestNumber: `PV-2026-${timestamp.toString().slice(-4)}`,
        title: "اعتماد سند صرف عاجل: مستحقات استيراد سلع تقنية وضريبية",
        documentType: "VOUCHER",
        documentId: `v-${timestamp}`,
        documentRef: `PV-${timestamp.toString().slice(-4)}`,
        status: "PENDING",
        requestedBy: "سامي الصلاحي (رئيس الحسابات)",
        requesterRole: "رئيس الحسابات",
        requestedAt: new Date().toISOString().slice(0, 10),
        amount: 2450000,
        currency: "YER_SANAA",
        currentStep: 2,
        totalSteps: 3,
        priority: "HIGH",
        workflowSteps: [
          {
            stepOrder: 1,
            stepName: "إعداد ومراجعة السند المحاسبي",
            approverRole: "رئيس الحسابات",
            approverUserName: "سامي الصلاحي",
            status: "APPROVED",
            actionDate: new Date().toISOString().slice(0, 10),
            notes: "تم تدقيق المرفقات والفواتير الضريبية وتطابق ميزان المراجعة.",
          },
          {
            stepOrder: 2,
            stepName: "اعتماد المدير المالي",
            approverRole: "المدير المالي",
            status: "PENDING",
          },
          {
            stepOrder: 3,
            stepName: "مصادقة الإدارة التنفيذية",
            approverRole: "الرئيس التنفيذي",
            status: "PENDING",
          },
        ],
        comments: [
          {
            id: `c-${timestamp}`,
            userName: "سامي الصلاحي",
            userAvatar: safeUser.avatar,
            role: "رئيس الحسابات",
            timestamp: timeStr,
            text: "يرجى التوقيع الإلكتروني للاعتماد وصرف الشيك البنكي مباشرة.",
            action: "APPROVE",
          },
        ],
        notes: "سند صرف بنكي مخصص للتوريد عبر البنك المركزي.",
      };

      onUpdateApprovalRequests([sampleApr, ...approvalRequests]);

      const chatMsg: ChatMessage = {
        id: `msg-${timestamp}`,
        channelId: "ch-finance",
        senderId: safeUser.id,
        senderName: safeUser.name,
        senderRole: safeUser.role,
        senderAvatar: safeUser.avatar,
        branchName: safeUser.branch,
        text: `تم إنشاء سند صرف ومعاملة مالية جديدة برقم ${sampleApr.requestNumber} بقيمة ${formatNumber(sampleApr.amount || 0)} ${sampleApr.currency}. يرجى المراجعة والتوقيع.`,
        timestamp: timeStr,
      };
      onSendMessage(chatMsg);

      onAddAuditLog({
        id: `aud-${timestamp}`,
        timestamp: new Date().toLocaleString("ar-YE"),
        userId: safeUser.id,
        userName: safeUser.name,
        userRole: safeUser.role,
        userAvatar: safeUser.avatar,
        branchName: safeUser.branch,
        actionType: "CREATE",
        module: "TREASURY",
        entityId: sampleApr.id,
        entityRef: sampleApr.requestNumber,
        details: `نموذج الإدارة المالية: إنشاء دورة اعتماد سند صرف ${sampleApr.requestNumber}`,
        ipAddress: "192.168.1.100",
        device: "MeDo Enterprise Station",
        status: "SUCCESS",
      });

      showToast("تم توليد وربط نموذج الإدارة المالية بنجاح (سير الموافقات + دردشة الحسابات + سجل الرقابة)!");
    } else if (deptKey === "PROCUREMENT") {
      const sampleDoc: CorrespondenceDocument = {
        id: `doc-pr-${timestamp}`,
        refNumber: `PO-MEDO-2026-${timestamp.toString().slice(-4)}`,
        type: "OUTGOING",
        category: "OPERATIONAL",
        priority: "URGENT",
        title: "أمر شراء ومناقصة توريد محولات طاقة شمسية ومولدات لمخازن الفروع",
        summary: "أمر شراء صادر رسمي موجه للموردين المعتمدين لتجهيز وتوريد 50 محول هجين لمخازن عدن والمكلا.",
        senderName: "م. هشام السقاف",
        senderOrganization: "مجموعة مـيـدو - إدارة المشتريات والمخازن",
        recipientName: "الشركات والموردون المعتمدون",
        recipientDepartment: "الموردين وسلسلة الإمداد",
        date: new Date().toISOString().slice(0, 10),
        status: "NEW",
        branchName: "المركز الرئيسي - صنعاء",
        confidentiality: "INTERNAL",
        createdBy: safeUser.name,
        createdAt: new Date().toISOString(),
        tags: ["مشتريات", "مناقصة", "موردين", "سلسلة_إمداد"],
        attachments: [
          {
            id: `att-${timestamp}`,
            name: "كراسة_المواصفات_الفنية_للمناقصة.pdf",
            type: "application/pdf",
            size: "3.4 MB",
            uploadDate: new Date().toISOString().slice(0, 10),
          },
        ],
      };

      onUpdateCorrespondences([sampleDoc, ...correspondences]);

      const chatMsg: ChatMessage = {
        id: `msg-${timestamp}`,
        channelId: "ch-procurement",
        senderId: safeUser.id,
        senderName: safeUser.name,
        senderRole: safeUser.role,
        senderAvatar: safeUser.avatar,
        branchName: safeUser.branch,
        text: `تم طرح أمر الشراء والمناقصة رقم ${sampleDoc.refNumber} في مركز الصادر. يرجى التنسيق مع المخازن لترتيب مساحات الاستلام.`,
        timestamp: timeStr,
      };
      onSendMessage(chatMsg);

      onAddAuditLog({
        id: `aud-${timestamp}`,
        timestamp: new Date().toLocaleString("ar-YE"),
        userId: safeUser.id,
        userName: safeUser.name,
        userRole: safeUser.role,
        userAvatar: safeUser.avatar,
        branchName: safeUser.branch,
        actionType: "CREATE",
        module: "MM_INVENTORY",
        entityId: sampleDoc.id,
        entityRef: sampleDoc.refNumber,
        details: `نموذج المشتريات: طرح مناقصة وأمر شراء صادر ${sampleDoc.refNumber}`,
        ipAddress: "192.168.1.100",
        device: "MeDo Enterprise Station",
        status: "SUCCESS",
      });

      showToast("تم توليد وربط نموذج المشتريات والمخازن بنجاح (مركز الصادر + قناة الإمداد + سجل التدقيق)!");
    } else if (deptKey === "SALES") {
      const sampleApr: ApprovalRequest = {
        id: `apr-sa-${timestamp}`,
        requestNumber: `CR-2026-${timestamp.toString().slice(-4)}`,
        title: "طلب اعتماد تسهيل ائتماني وخصم كميات لشركة الأفق للتوزيع",
        documentType: "SALES_INVOICE",
        documentId: `cr-${timestamp}`,
        documentRef: `CR-${timestamp.toString().slice(-4)}`,
        status: "PENDING",
        requestedBy: "فؤاد القباطي (مدير المبيعات)",
        requesterRole: "مدير المبيعات",
        requestedAt: new Date().toISOString().slice(0, 10),
        amount: 32000000,
        currency: "YER_SANAA",
        currentStep: 1,
        totalSteps: 2,
        priority: "HIGH",
        workflowSteps: [
          {
            stepOrder: 1,
            stepName: "دراسة الجدارة الائتمانية وضمانات العميل",
            approverRole: "مدير الائتمان والمخاطر",
            status: "PENDING",
          },
          {
            stepOrder: 2,
            stepName: "موافقة المدير العام التجاري",
            approverRole: "المدير التجاري",
            status: "PENDING",
          },
        ],
        comments: [],
        notes: "سجل السداد للعميل ممتاز بنسبة 100% خلال العام المنصرم.",
      };

      onUpdateApprovalRequests([sampleApr, ...approvalRequests]);

      const chatMsg: ChatMessage = {
        id: `msg-${timestamp}`,
        channelId: "ch-sales",
        senderId: safeUser.id,
        senderName: safeUser.name,
        senderRole: safeUser.role,
        senderAvatar: safeUser.avatar,
        branchName: safeUser.branch,
        text: `تم رفع طلب سقف ائتماني وعقد مبيعات آجل جديد رقم ${sampleApr.requestNumber} بقيمة ${formatNumber(sampleApr.amount || 0)} ${sampleApr.currency}.`,
        timestamp: timeStr,
      };
      onSendMessage(chatMsg);

      onAddAuditLog({
        id: `aud-${timestamp}`,
        timestamp: new Date().toLocaleString("ar-YE"),
        userId: safeUser.id,
        userName: safeUser.name,
        userRole: safeUser.role,
        userAvatar: safeUser.avatar,
        branchName: safeUser.branch,
        actionType: "CREATE",
        module: "SD_SALES",
        entityId: sampleApr.id,
        entityRef: sampleApr.requestNumber,
        details: `نموذج المبيعات: رفع طلب حد ائتماني ${sampleApr.requestNumber}`,
        ipAddress: "192.168.1.100",
        device: "MeDo Enterprise Station",
        status: "SUCCESS",
      });

      showToast("تم توليد وربط نموذج المبيعات والعملاء بنجاح!");
    } else if (deptKey === "HR") {
      const sampleApr: ApprovalRequest = {
        id: `apr-hr-${timestamp}`,
        requestNumber: `HR-REC-2026-${timestamp.toString().slice(-4)}`,
        title: "طلب ترقية وصرف مكافأة تميز الربع الأول لكوادر فرع عدن",
        documentType: "HR_PAYROLL",
        documentId: `hr-${timestamp}`,
        documentRef: `HR-${timestamp.toString().slice(-4)}`,
        status: "PENDING",
        requestedBy: "أروى اليافعي (مديرة الموارد البشرية)",
        requesterRole: "مديرة الموارد البشرية",
        requestedAt: new Date().toISOString().slice(0, 10),
        amount: 850000,
        currency: "YER_SANAA",
        currentStep: 1,
        totalSteps: 2,
        priority: "NORMAL",
        workflowSteps: [
          {
            stepOrder: 1,
            stepName: "مراجعة تقييم الأداء ونسبة الحضور",
            approverRole: "مسؤول الموارد البشرية",
            status: "PENDING",
          },
          {
            stepOrder: 2,
            stepName: "اعتماد الصرف وتعديل سلم الرواتب",
            approverRole: "المدير التنفيذي",
            status: "PENDING",
          },
        ],
        comments: [],
        notes: "بناءً على تحقيق مستهدفات المبيعات والتحصيل بنسبة 124%.",
      };

      onUpdateApprovalRequests([sampleApr, ...approvalRequests]);

      const chatMsg: ChatMessage = {
        id: `msg-${timestamp}`,
        channelId: "ch-hr",
        senderId: safeUser.id,
        senderName: safeUser.name,
        senderRole: safeUser.role,
        senderAvatar: safeUser.avatar,
        branchName: safeUser.branch,
        text: `تم تقديم طلب ترقيات وحوافز الربع السنوي رقم ${sampleApr.requestNumber} في مسار موافقات الموارد البشرية.`,
        timestamp: timeStr,
      };
      onSendMessage(chatMsg);

      onAddAuditLog({
        id: `aud-${timestamp}`,
        timestamp: new Date().toLocaleString("ar-YE"),
        userId: safeUser.id,
        userName: safeUser.name,
        userRole: safeUser.role,
        userAvatar: safeUser.avatar,
        branchName: safeUser.branch,
        actionType: "CREATE",
        module: "HR_PAYROLL",
        entityId: sampleApr.id,
        entityRef: sampleApr.requestNumber,
        details: `نموذج الموارد البشرية: مسار ترقيات ومكافآت ${sampleApr.requestNumber}`,
        ipAddress: "192.168.1.100",
        device: "MeDo Enterprise Station",
        status: "SUCCESS",
      });

      showToast("تم توليد وربط نموذج الموارد البشرية وشؤون الموظفين بنجاح!");
    } else if (deptKey === "LEGAL") {
      const sampleCirc: AdministrativeCircular = {
        id: `circ-leg-${timestamp}`,
        circularNumber: `CIRC-LEG-2026-${timestamp.toString().slice(-4)}`,
        title: "تعميم قانوني وإداري: تنظيم وتوثيق العقود التجارية والتوقيع الإلكتروني الإلزامي",
        content: "استناداً إلى لائحة الحوكمة المؤسسية، يُحظر إبرام أي اتفاقيات تجارية أو صرف دفعات للموردين تتجاوز 1,000,000 ريال دون الحصول على التوقيع الإلكتروني الموثق عبر نظام MeDo ERP وسريان التحقق المشفر SHA-256.",
        issuedBy: "المستشار د. ياسر الحميري",
        issuerRole: "مدير الإدارة القانونية والحوكمة",
        issueDate: new Date().toISOString().slice(0, 10),
        priority: "URGENT",
        targetAudience: "ALL",
        isPinned: true,
        acknowledgedBy: [
          {
            userId: safeUser.id,
            userName: safeUser.name,
            acknowledgedAt: new Date().toLocaleString("ar-YE"),
          },
        ],
      };

      onUpdateCirculars([sampleCirc, ...circulars]);

      onAddAuditLog({
        id: `aud-${timestamp}`,
        timestamp: new Date().toLocaleString("ar-YE"),
        userId: safeUser.id,
        userName: safeUser.name,
        userRole: safeUser.role,
        userAvatar: safeUser.avatar,
        branchName: safeUser.branch,
        actionType: "CREATE",
        module: "COLLABORATION",
        entityId: sampleCirc.id,
        entityRef: sampleCirc.circularNumber,
        details: `نموذج الإدارة القانونية: إصدار تعميم الحوكمة الملزم ${sampleCirc.circularNumber}`,
        ipAddress: "192.168.1.100",
        device: "MeDo Enterprise Station",
        status: "SUCCESS",
      });

      showToast("تم توليد وربط نموذج الشؤون القانونية والرقابة بنجاح!");
    } else if (deptKey === "BRANCHES") {
      const sampleDoc: CorrespondenceDocument = {
        id: `doc-br-${timestamp}`,
        refNumber: `BR-ADN-MEMO-${timestamp.toString().slice(-4)}`,
        type: "INTERNAL_MEMO",
        category: "OPERATIONAL",
        priority: "HIGH",
        title: "تقرير مطابقة الأرصدة النقدية وحركة المبيعات - فرع عدن (المعلا)",
        summary: "مذكرة تشغيلية تفصيلية بمطابقة الصناديق والمبيعات اليومية لفرع عدن وإيداع الإيراد في الحساب البنكي.",
        senderName: "نائف السعيدي (مدير فرع عدن)",
        senderOrganization: "فرع مـيـدو - عدن",
        recipientName: "الإدارة العامة والمالية",
        recipientDepartment: "الإدارة العامة والرقابة",
        date: new Date().toISOString().slice(0, 10),
        status: "NEW",
        branchName: "فرع عدن - المعلا",
        confidentiality: "INTERNAL",
        createdBy: safeUser.name,
        createdAt: new Date().toISOString(),
        tags: ["فروع", "عدن", "تسوية_نقدية", "تشغيل"],
        attachments: [
          {
            id: `att-${timestamp}`,
            name: "كشف_إيداعات_فرع_عدن.pdf",
            type: "application/pdf",
            size: "1.8 MB",
            uploadDate: new Date().toISOString().slice(0, 10),
          },
        ],
      };

      onUpdateCorrespondences([sampleDoc, ...correspondences]);

      const chatMsg: ChatMessage = {
        id: `msg-${timestamp}`,
        channelId: "ch-aden",
        senderId: safeUser.id,
        senderName: safeUser.name,
        senderRole: safeUser.role,
        senderAvatar: safeUser.avatar,
        branchName: "فرع عدن - المعلا",
        text: `تم إرسال مذكرة تقرير المطابقة النقدية برقم ${sampleDoc.refNumber} إلى الإدارة العامة.`,
        timestamp: timeStr,
      };
      onSendMessage(chatMsg);

      onAddAuditLog({
        id: `aud-${timestamp}`,
        timestamp: new Date().toLocaleString("ar-YE"),
        userId: safeUser.id,
        userName: safeUser.name,
        userRole: safeUser.role,
        userAvatar: safeUser.avatar,
        branchName: "فرع عدن - المعلا",
        actionType: "CREATE",
        module: "COLLABORATION",
        entityId: sampleDoc.id,
        entityRef: sampleDoc.refNumber,
        details: `نموذج الفروع الإقليمية: رفع مذكرة تسوية فرع عدن ${sampleDoc.refNumber}`,
        ipAddress: "192.168.1.100",
        device: "MeDo Enterprise Station",
        status: "SUCCESS",
      });

      showToast("تم توليد وربط نموذج الفروع الإقليمية بنجاح (مذكرة فرع عدن + دردشة فرع عدن + السجل)!");
    }

    setIsDepartmentSimulatorOpen(false);
  };

  // --- Filtered Data ---
  const filteredDocs = correspondences.filter((doc) => {
    // Type Filter
    if (docFilterType === "INCOMING" && doc.type !== "INCOMING") return false;
    if (docFilterType === "OUTGOING" && doc.type !== "OUTGOING") return false;
    if (docFilterType === "INTERNAL_MEMO" && doc.type !== "INTERNAL_MEMO") return false;
    if (docFilterType === "ARCHIVE" && doc.status !== "ARCHIVED") return false;
    if (docCategoryFilter !== "ALL" && doc.category !== docCategoryFilter) return false;

    // Department Filter
    if (selectedDepartment === "FINANCE") {
      const match = doc.category === "FINANCIAL" || doc.tags?.some((t) => /مالي|محاسب|بنك|صرف|خزينة|ميزان/.test(t)) || /مالي|حسابات|المالية/.test(doc.recipientDepartment || "") || /مالي|حسابات|المالية/.test(doc.senderOrganization || "");
      if (!match) return false;
    } else if (selectedDepartment === "PROCUREMENT") {
      const match = doc.tags?.some((t) => /مشتريات|مورد|مناقصة|مخازن|إمداد/.test(t)) || /مشتريات|مخازن|مورد/.test(doc.recipientDepartment || "") || /مشتريات|مخازن|مورد/.test(doc.senderOrganization || "");
      if (!match) return false;
    } else if (selectedDepartment === "SALES") {
      const match = doc.tags?.some((t) => /مبيعات|عملاء|ائتمان|توزيع/.test(t)) || /مبيعات|عملاء|تسويق/.test(doc.recipientDepartment || "") || /مبيعات|عملاء/.test(doc.senderOrganization || "");
      if (!match) return false;
    } else if (selectedDepartment === "HR") {
      const match = doc.category === "ADMINISTRATIVE" && (doc.tags?.some((t) => /موارد|موظف|رواتب|إجاز|ترقي/.test(t)) || /الموارد|بشرية|موظف/.test(doc.recipientDepartment || ""));
      if (!match) return false;
    } else if (selectedDepartment === "LEGAL") {
      const match = doc.category === "LEGAL" || doc.tags?.some((t) => /قانون|عقد|ضريب|حوكمة|امتثال/.test(t)) || /قانون|شؤون قانونية/.test(doc.recipientDepartment || "");
      if (!match) return false;
    } else if (selectedDepartment === "BRANCHES") {
      const match = doc.tags?.some((t) => /فرع|عدن|المكلا|تعز|صنعاء/.test(t)) || doc.branchName !== "المركز الرئيسي - صنعاء";
      if (!match) return false;
    }

    if (docSearchQuery) {
      const q = docSearchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.refNumber.toLowerCase().includes(q) ||
        doc.senderName.toLowerCase().includes(q) ||
        doc.recipientName.toLowerCase().includes(q) ||
        doc.summary.toLowerCase().includes(q) ||
        doc.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredApprovalRequests = approvalRequests.filter((apr) => {
    const docTypeStr = apr.documentType as string;
    if (selectedDepartment === "FINANCE") {
      return apr.documentType === "JOURNAL" || apr.documentType === "VOUCHER" || docTypeStr === "TREASURY" || apr.documentType === "EXPENSE";
    } else if (selectedDepartment === "PROCUREMENT") {
      return docTypeStr === "PURCHASE_ORDER" || apr.documentType === "PURCHASE_BILL";
    } else if (selectedDepartment === "SALES") {
      return docTypeStr === "SALES_CREDIT" || apr.documentType === "SALES_INVOICE";
    } else if (selectedDepartment === "HR") {
      return apr.documentType === "HR_PAYROLL" || docTypeStr === "HR_REQUEST";
    } else if (selectedDepartment === "LEGAL") {
      return docTypeStr === "CONTRACT" || apr.documentType === "GENERAL_MEMO";
    } else if (selectedDepartment === "BRANCHES") {
      return apr.title.includes("فرع") || apr.title.includes("عدن") || apr.title.includes("المكلا");
    }
    return true;
  });

  const activeChannel =
    effectiveChannels.find((c) => c.id === activeChannelId) ||
    effectiveChannels[0] ||
    DEFAULT_CHANNELS[0];
  const channelMessages = chatMessages.filter((m) => m.channelId === (activeChannel?.id || activeChannelId));

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (auditModuleFilter !== "ALL" && log.module !== auditModuleFilter) return false;
    if (selectedDepartment === "FINANCE" && log.module !== "FI_JOURNAL" && log.module !== "TREASURY") return false;
    if (selectedDepartment === "PROCUREMENT" && log.module !== "MM_INVENTORY" && log.module !== "MM_PURCHASE") return false;
    if (selectedDepartment === "SALES" && log.module !== "SD_SALES") return false;
    if (selectedDepartment === "HR" && log.module !== "HR_PAYROLL") return false;
    if (selectedDepartment === "LEGAL" && log.module !== "SYSTEM_SETTINGS") return false;
    if (selectedDepartment === "BRANCHES" && !log.branchName?.includes("فرع") && !log.details?.includes("فرع")) return false;

    if (auditSearchQuery) {
      const q = auditSearchQuery.toLowerCase();
      return (
        log.details.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.entityRef.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in select-none text-slate-100" style={{ fontFamily: "'Noto Naskh Arabic', 'Amiri', 'Droid Arabic Naskh', 'Traditional Arabic', sans-serif" }}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/60 text-emerald-200 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400/60 hover:text-emerald-200 p-1">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Enterprise Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0A2540] via-[#0B2A4A] to-[#071829] border border-slate-800/50 p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sap-secondary via-amber-500 to-amber-200 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 flex-shrink-0">
              <Briefcase className="w-7 h-7 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white tracking-tight">المنصة المؤسسية المتكاملة للتعاون وتدفق العمل</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-sap-secondary/20 border border-sap-secondary/40 text-sap-secondary text-xs font-bold font-mono">
                  Enterprise Collaboration & Governance (SAP SuccessFactors / Oracle Fusion)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                المركز الموحد لإدارة الوارد والصادر، دورة الموافقات والتوقيع الإلكتروني، المراسلات الفورية بين الفروع، وسجل التدقيق والرقابة اللحظية لمجموعة مـيـدو التجارية.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar & Instant Generator Button */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <button
              onClick={() => setIsDepartmentSimulatorOpen(true)}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-sap-secondary via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>⚡ تجربة وإنشاء نموذج لأي قسم</span>
            </button>

            <div className="px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold">موافقات معلقة</div>
                <div className="text-base font-black text-amber-300">{pendingApprovalsCount} معاملات</div>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Inbox className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold">وارد جديد</div>
                <div className="text-base font-black text-blue-300">{newInboxCount} مستندات</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>
      </div>

      {/* Enterprise Departments Showcase & Navigator */}
      <div className="bg-slate-900/90 border border-slate-800/60 rounded-3xl p-4 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sap-secondary" />
            <span className="font-bold text-xs text-white">تصفح نماذج وسجلات أقسام المؤسسة:</span>
            <span className="text-[11px] text-slate-400 font-normal">(انقر على أي قسم لفلترة كافة الوارد والصادر، الموافقات، والمراسلات)</span>
          </div>
          {selectedDepartment !== "ALL" && (
            <button
              onClick={() => setSelectedDepartment("ALL")}
              className="text-[11px] text-sap-secondary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إظهار جميع الأقسام</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {/* ALL */}
          <button
            onClick={() => setSelectedDepartment("ALL")}
            className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
              selectedDepartment === "ALL"
                ? "bg-slate-800 border-sap-secondary shadow-md text-white font-bold"
                : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Layers className="w-5 h-5 text-sap-secondary" />
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200">{correspondences.length}</span>
            </div>
            <div className="text-sm font-bold truncate">كافة الأقسام</div>
            <div className="text-xs text-slate-400 mt-1 truncate">نظرة عامة شاملة</div>
          </button>

          {/* FINANCE */}
          <button
            onClick={() => {
              setSelectedDepartment("FINANCE");
              setActiveChannelId("ch-finance");
            }}
            className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
              selectedDepartment === "FINANCE"
                ? "bg-amber-950/40 border-amber-500 shadow-md text-white font-bold"
                : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300">
                {approvalRequests.filter((a) => a.documentType === "JOURNAL" || a.documentType === "VOUCHER").length}
              </span>
            </div>
            <div className="text-sm font-bold truncate">المالية والحسابات</div>
            <div className="text-xs text-slate-400 mt-1 truncate">قيود وسندات وصرف</div>
          </button>

          {/* PROCUREMENT */}
          <button
            onClick={() => {
              setSelectedDepartment("PROCUREMENT");
              setActiveChannelId("ch-procurement");
            }}
            className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
              selectedDepartment === "PROCUREMENT"
                ? "bg-blue-950/40 border-blue-500 shadow-md text-white font-bold"
                : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300">
                {approvalRequests.filter((a) => (a.documentType as string) === "PURCHASE_ORDER" || a.documentType === "PURCHASE_BILL").length}
              </span>
            </div>
            <div className="text-sm font-bold truncate">المشتريات والمخازن</div>
            <div className="text-xs text-slate-400 mt-1 truncate">أوامر شراء ومناقصات</div>
          </button>

          {/* SALES */}
          <button
            onClick={() => {
              setSelectedDepartment("SALES");
              setActiveChannelId("ch-sales");
            }}
            className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
              selectedDepartment === "SALES"
                ? "bg-emerald-950/40 border-emerald-500 shadow-md text-white font-bold"
                : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">
                {approvalRequests.filter((a) => (a.documentType as string) === "SALES_CREDIT" || a.documentType === "SALES_INVOICE").length}
              </span>
            </div>
            <div className="text-sm font-bold truncate">المبيعات والعملاء</div>
            <div className="text-xs text-slate-400 mt-1 truncate">ائتمان وعقود توريد</div>
          </button>

          {/* HR */}
          <button
            onClick={() => {
              setSelectedDepartment("HR");
              setActiveChannelId("ch-hr");
            }}
            className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
              selectedDepartment === "HR"
                ? "bg-purple-950/40 border-purple-500 shadow-md text-white font-bold"
                : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="w-5 h-5 text-purple-400" />
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300">
                {approvalRequests.filter((a) => a.documentType === "HR_PAYROLL" || (a.documentType as string) === "HR_REQUEST").length}
              </span>
            </div>
            <div className="text-sm font-bold truncate">الموارد البشرية</div>
            <div className="text-xs text-slate-400 mt-1 truncate">رواتب وترقيات وإجازات</div>
          </button>

          {/* LEGAL */}
          <button
            onClick={() => {
              setSelectedDepartment("LEGAL");
              setActiveChannelId("ch-executive");
            }}
            className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
              selectedDepartment === "LEGAL"
                ? "bg-rose-950/40 border-rose-500 shadow-md text-white font-bold"
                : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Scale className="w-5 h-5 text-rose-400" />
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300">
                {circulars.length}
              </span>
            </div>
            <div className="text-sm font-bold truncate">الشؤون القانونية</div>
            <div className="text-xs text-slate-400 mt-1 truncate">حوكمة وعقود وتعاميم</div>
          </button>

          {/* BRANCHES */}
          <button
            onClick={() => {
              setSelectedDepartment("BRANCHES");
              setActiveChannelId("ch-aden");
            }}
            className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
              selectedDepartment === "BRANCHES"
                ? "bg-cyan-950/40 border-cyan-500 shadow-md text-white font-bold"
                : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300">5 فروع</span>
            </div>
            <div className="text-sm font-bold truncate">الفروع الإقليمية</div>
            <div className="text-xs text-slate-400 mt-1 truncate">صنعاء، عدن، المكلا...</div>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("INBOX_OUTBOX")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "INBOX_OUTBOX"
              ? "bg-sap-secondary text-slate-950 shadow-md shadow-amber-500/20 font-black"
              : "bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800/80"
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>مركز الوارد والصادر والأرشفة</span>
          {newInboxCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-blue-950 text-blue-300 text-[10px] font-bold border border-blue-700">
              {newInboxCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("APPROVALS")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "APPROVALS"
              ? "bg-sap-secondary text-slate-950 shadow-md shadow-amber-500/20 font-black"
              : "bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800/80"
          }`}
        >
          <Stamp className="w-4 h-4" />
          <span>سير الموافقات والتوقيع الإلكتروني</span>
          {pendingApprovalsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-700">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("WORKFLOW_RULES")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "WORKFLOW_RULES"
              ? "bg-sap-secondary text-slate-950 shadow-md shadow-amber-500/20 font-black"
              : "bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800/80"
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>مسارات الاعتماد وقواعد التفويض</span>
          <span className="px-1.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-bold border border-indigo-700">
            {effectiveWorkflowRules.filter((r) => r.isActive).length} نشط
          </span>
        </button>

        <button
          onClick={() => setActiveTab("STUDIES")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "STUDIES"
              ? "bg-sap-secondary text-slate-950 shadow-md shadow-amber-500/20 font-black"
              : "bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800/80"
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>دراسات الجدوى وتحليل الأثر المالي</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-700">
            {approvalRequests.filter((a) => a.studyAnalysis).length} دراسة
          </span>
        </button>

        <button
          onClick={() => setActiveTab("CHAT")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "CHAT"
              ? "bg-sap-secondary text-slate-950 shadow-md shadow-amber-500/20 font-black"
              : "bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800/80"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>الدردشة المؤسسية وقنوات الفروع</span>
        </button>

        <button
          onClick={() => setActiveTab("CIRCULARS")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "CIRCULARS"
              ? "bg-sap-secondary text-slate-950 shadow-md shadow-amber-500/20 font-black"
              : "bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800/80"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>التعاميم والتعليمات الإدارية</span>
        </button>

        <button
          onClick={() => setActiveTab("AUDIT_MONITOR")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "AUDIT_MONITOR"
              ? "bg-sap-secondary text-slate-950 shadow-md shadow-amber-500/20 font-black"
              : "bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800/80"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>لوحة الرقابة وسجل التدقيق الحي</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INBOX & OUTBOX HUB & ELECTRONIC ARCHIVING                          */}
      {/* ========================================================================= */}
      {activeTab === "INBOX_OUTBOX" && (
        <div className="space-y-6">
          {/* Action & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800/50 p-4 rounded-3xl shadow-sm">
            {/* Type Switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setDocFilterType("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  docFilterType === "ALL" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                الكل ({correspondences.length})
              </button>
              <button
                onClick={() => setDocFilterType("INCOMING")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  docFilterType === "INCOMING" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-blue-400"
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>مركز الوارد ({correspondences.filter((c) => c.type === "INCOMING").length})</span>
              </button>
              <button
                onClick={() => setDocFilterType("OUTGOING")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  docFilterType === "OUTGOING" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-emerald-400"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>مركز الصادر ({correspondences.filter((c) => c.type === "OUTGOING").length})</span>
              </button>
              <button
                onClick={() => setDocFilterType("INTERNAL_MEMO")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  docFilterType === "INTERNAL_MEMO" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-purple-400"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>مذكرات داخلية</span>
              </button>
              <button
                onClick={() => setDocFilterType("ARCHIVE")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  docFilterType === "ARCHIVE" ? "bg-amber-600 text-slate-950 shadow" : "text-slate-400 hover:text-amber-400"
                }`}
              >
                <FolderArchive className="w-3.5 h-3.5" />
                <span>الأرشيف الإلكتروني</span>
              </button>
            </div>

            {/* Search & Category Filter */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث في الوارد والصادر، الرقم المرجعي، المرسل..."
                  value={docSearchQuery}
                  onChange={(e) => setDocSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sap-secondary"
                />
              </div>

              <select
                value={docCategoryFilter}
                onChange={(e) => setDocCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-sap-secondary"
              >
                <option value="ALL">جميع التصنيفات</option>
                <option value="FINANCIAL">مالي ومحاسبي</option>
                <option value="ADMINISTRATIVE">إداري وتنظيمي</option>
                <option value="OPERATIONAL">تشغيلي ومستودعات</option>
                <option value="LEGAL">قانوني وضريبي</option>
              </select>

              <button
                onClick={() => setIsCreateDocOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sap-secondary to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل معاملة / وارد جديد</span>
              </button>
            </div>
          </div>

          {/* Document List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="group relative bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800/50 hover:border-sap-secondary/50 rounded-3xl p-5 shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black border flex items-center gap-1 ${
                        doc.type === "INCOMING"
                          ? "bg-blue-950/60 text-blue-300 border-blue-800/50"
                          : doc.type === "OUTGOING"
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
                          : "bg-purple-950/60 text-purple-300 border-purple-800/50"
                      }`}
                    >
                      {doc.type === "INCOMING" ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      <span>{doc.type === "INCOMING" ? "وارد رسمي" : doc.type === "OUTGOING" ? "صادر رسمي" : "مذكرة داخلية"}</span>
                    </span>

                    <span className="font-mono text-xs text-sap-secondary font-bold bg-sap-secondary/10 px-2 py-0.5 rounded-lg border border-sap-secondary/20">
                      {doc.refNumber}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        doc.priority === "URGENT"
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : doc.priority === "HIGH"
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {doc.priority === "URGENT" ? "عاجل جداً" : doc.priority === "HIGH" ? "هام" : "عادي"}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-sap-secondary transition-colors">{doc.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">{doc.summary}</p>

                  {/* Parties & Metadata */}
                  <div className="mt-4 pt-3 border-t border-slate-800/70 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">المرسل:</span>
                      <span className="font-semibold text-slate-200 truncate max-w-[180px]">{doc.senderOrganization || doc.senderName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">المستلم / القسم:</span>
                      <span className="font-semibold text-slate-200 truncate max-w-[180px]">{doc.recipientDepartment || doc.recipientName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">التاريخ:</span>
                      <span className="font-mono text-[11px] text-slate-300">{doc.date}</span>
                    </div>
                  </div>
                </div>

                {/* Attachments & Status Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                    <span>{doc.attachments.length} مرفقات</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      doc.status === "APPROVED"
                        ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/50"
                        : doc.status === "UNDER_REVIEW"
                        ? "bg-amber-950/60 text-amber-300 border border-amber-800/50"
                        : doc.status === "ARCHIVED"
                        ? "bg-slate-800 text-slate-300"
                        : "bg-blue-950/60 text-blue-300 border border-blue-800/50"
                    }`}
                  >
                    {doc.status === "APPROVED"
                      ? "معتمد"
                      : doc.status === "UNDER_REVIEW"
                      ? "قيد المراجعة"
                      : doc.status === "ARCHIVED"
                      ? "مؤرشف"
                      : "جديد"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredDocs.length === 0 && (
            <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800/50 text-slate-400">
              <FolderArchive className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <p className="text-sm font-semibold">لا توجد مستندات واردة أو صادرة تطابق خيارات البحث الحالية.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: APPROVAL WORKFLOW ENGINE & DIGITAL SIGNATURES                     */}
      {/* ========================================================================= */}
      {activeTab === "APPROVALS" && (
        <div className="space-y-6">
          {/* Approval Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/30 to-slate-900 border border-amber-800/30 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-300 font-bold">بانتظار الاعتماد والموافقة</span>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-200 mt-2">{pendingApprovalsCount} معاملة</div>
              <div className="text-[11px] text-amber-400/80 mt-1">تتطلب توقيعك الإلكتروني الفوري للترحيل المالي</div>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-800/30 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-300 font-bold">معتمدة وموقعة رقمياً</span>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-200 mt-2">
                {approvalRequests.filter((a) => a.status === "APPROVED").length} معاملة
              </div>
              <div className="text-[11px] text-emerald-400/80 mt-1">موثقة ومرحلة للحسابات العامة ودفتر الأستاذ</div>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-950/30 to-slate-900 border border-blue-800/30 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-300 font-bold">إجمالي دورات سير العمل</span>
                <Layers className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-blue-200 mt-2">{approvalRequests.length} مسارات</div>
              <div className="text-[11px] text-blue-400/80 mt-1">مسارات متعددة المستويات (منشئ - مراجع - معتمد - مدقق)</div>
            </div>
          </div>

          {/* Workflow Cards */}
          <div className="space-y-4">
            {filteredApprovalRequests.map((apr) => (
              <div
                key={apr.id}
                className="bg-slate-900/90 border border-slate-800/50 hover:border-slate-700/80 rounded-3xl p-6 shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/70">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sap-secondary to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md flex-shrink-0">
                      <Stamp className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-sap-secondary font-bold bg-sap-secondary/10 px-2 py-0.5 rounded-lg border border-sap-secondary/20">
                          {apr.requestNumber}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300">
                          {apr.documentType === "JOURNAL"
                            ? "قيد محاسبي"
                            : apr.documentType === "VOUCHER"
                            ? "سند صرف / قبض"
                            : apr.documentType === "HR_PAYROLL"
                            ? "مسير رواتب HR"
                            : "طلب شراء واعتماد"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            apr.status === "APPROVED"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : apr.status === "REJECTED"
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : "bg-amber-950 text-amber-300 border border-amber-800"
                          }`}
                        >
                          {apr.status === "APPROVED" ? "معتمد بالكامل" : apr.status === "REJECTED" ? "مرفوض" : "قيد المراجعة والاعتماد"}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1.5">{apr.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        طالب الاعتماد: <span className="text-slate-200 font-semibold">{apr.requestedBy}</span> ({apr.requesterRole}) - {apr.branchName} - {apr.requestedAt}
                      </p>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center gap-4 lg:text-left">
                    {apr.amount && (
                      <div className="text-right lg:text-left">
                        <div className="text-[10px] text-slate-400 font-semibold">المبلغ المالي</div>
                        <div className="text-lg font-black text-sap-secondary font-mono">
                          {formatNumber(apr.amount)} {apr.currency}
                        </div>
                      </div>
                    )}

                    {apr.status === "PENDING" && (
                      <button
                        onClick={() => setSelectedApproval(apr)}
                        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sap-secondary to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <PenTool className="w-4 h-4" />
                        <span>مراجعة وتوقيع</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Workflow Steps Pipeline Visualizer */}
                <div className="mt-5 pt-2">
                  <div className="text-[11px] font-bold text-slate-400 mb-3 flex items-center justify-between">
                    <span>مراحل مسار الاعتماد ({apr.workflowSteps.length} مستويات):</span>
                    <span className="text-sap-secondary font-mono">المرحلة الحالية: {apr.currentStep} من {apr.totalSteps}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {apr.workflowSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border text-xs relative ${
                          step.status === "APPROVED"
                            ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-200"
                            : step.status === "REJECTED"
                            ? "bg-rose-950/30 border-rose-800/40 text-rose-200"
                            : step.stepOrder === apr.currentStep
                            ? "bg-amber-950/40 border-amber-700/60 text-amber-200 ring-1 ring-amber-500/50"
                            : "bg-slate-950/50 border-slate-800 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-slate-900 border border-current flex items-center justify-center text-[10px] font-mono">
                              {step.stepOrder}
                            </span>
                            <span>{step.stepName}</span>
                          </span>
                          {step.status === "APPROVED" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : step.status === "REJECTED" ? (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-400" />
                          )}
                        </div>

                        <div className="text-[11px] text-slate-300 font-medium">
                          المسؤول: {step.approverUserName || step.approverRole}
                        </div>

                        {step.actionDate && (
                          <div className="text-[10px] text-slate-400 font-mono mt-1">تاريخ الإجراء: {step.actionDate}</div>
                        )}

                        {step.notes && (
                          <div className="text-[10px] text-slate-300/90 mt-1 italic bg-slate-900/50 p-1.5 rounded-lg border border-slate-800/60">
                            "{step.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Linked Accounting Document Details */}
                {apr.linkedDocumentDetails && (
                  <div className="mt-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-sap-secondary" />
                      <div>
                        <span className="font-bold text-white">المستند المحاسبي المرتبط: </span>
                        <span className="font-mono text-sap-secondary font-bold">{apr.linkedDocumentDetails.documentNumber}</span>
                        <span className="text-slate-400 mr-2">({apr.linkedDocumentDetails.partyName || "حساب وسيط"})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-300 font-mono">
                      <span>مدين: <span className="text-amber-300">{apr.linkedDocumentDetails.debitAccount}</span></span>
                      <span className="text-slate-600">|</span>
                      <span>دائن: <span className="text-emerald-300">{apr.linkedDocumentDetails.creditAccount}</span></span>
                      {apr.linkedDocumentDetails.branch && (
                        <>
                          <span className="text-slate-600">|</span>
                          <span className="text-cyan-300 font-sans">{apr.linkedDocumentDetails.branch}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Attached Feasibility Study Analysis Banner */}
                {apr.studyAnalysis && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-900/60 text-emerald-300 flex items-center justify-center font-bold">
                        <PieChart className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-300">دراسة الجدوى والأثر المالي مرفقة:</span>
                          <span className="text-white font-medium">{apr.studyAnalysis.title || apr.studyAnalysis.documentTitle}</span>
                        </div>
                        <div className="text-[11px] text-emerald-400/90 mt-0.5 flex items-center gap-3">
                          <span>المعد: {apr.studyAnalysis.preparedBy}</span>
                          <span>|</span>
                          <span>مؤشر الجدوى: <strong className="text-emerald-200 font-mono">{apr.studyAnalysis.feasibilityScore}%</strong></span>
                          <span>|</span>
                          <span>مستوى المخاطر: <strong className="text-emerald-200">{apr.studyAnalysis.riskLevel === "LOW" ? "منخفضة" : apr.studyAnalysis.riskLevel === "MEDIUM" ? "متوسطة" : "عالية"}</strong></span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedStudyModal(apr.studyAnalysis!)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-xs font-bold border border-emerald-600 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض تقرير الجدوى</span>
                    </button>
                  </div>
                )}

                {/* Digital Signature Badge if present */}
                {apr.digitalSignature && (
                  <div className="mt-4 p-3 rounded-2xl bg-slate-950/80 border border-sap-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sap-secondary/20 text-sap-secondary flex items-center justify-center font-bold">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sap-secondary flex items-center gap-1">
                          <span>مصادق وموقع إلكترونياً</span>
                          <span className="text-[10px] text-slate-400 font-mono">({apr.digitalSignature.certificateId})</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          الموقع: {apr.digitalSignature.signerName} ({apr.digitalSignature.signerRole}) - {apr.digitalSignature.signedAt}
                        </div>
                      </div>
                    </div>

                    <div className="font-mono text-[9px] text-slate-400 truncate max-w-xs bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      {apr.digitalSignature.verificationHash}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: WORKFLOW RULES & APPROVAL MATRIX MANAGER                             */}
      {/* ========================================================================= */}
      {activeTab === "WORKFLOW_RULES" && (
        <div className="space-y-6">
          {/* Rules Metric Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/50 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>إجمالي مسارات الاعتماد</span>
                <GitBranch className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-white mt-2">{effectiveWorkflowRules.length} مسارات</div>
              <div className="text-[10px] text-slate-400 mt-1">تشمل السندات، القيود، الرواتب، والمشتريات</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-emerald-900/40 shadow-md">
              <div className="flex items-center justify-between text-xs text-emerald-400">
                <span>المسارات المفعلة والنشطة</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-300 mt-2">
                {effectiveWorkflowRules.filter((r) => r.isActive).length} مسار نشط
              </div>
              <div className="text-[10px] text-slate-400 mt-1">تطبق آلياً فور توليد المعاملات</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-900/40 shadow-md">
              <div className="flex items-center justify-between text-xs text-amber-400">
                <span>مسارات مشروطة بدراسة جدوى</span>
                <PieChart className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300 mt-2">
                {effectiveWorkflowRules.filter((r) => r.steps.some((s) => s.requiresStudyDocument)).length} مسارات
              </div>
              <div className="text-[10px] text-slate-400 mt-1">تتطلب تقرير أثر مالي معتمد</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-sap-secondary/30 shadow-md">
              <div className="flex items-center justify-between text-xs text-sap-secondary">
                <span>تتطلب توقيع رقمي رسمي</span>
                <Stamp className="w-4 h-4 text-sap-secondary" />
              </div>
              <div className="text-2xl font-black text-sap-secondary mt-2">
                {effectiveWorkflowRules.filter((r) => r.steps.some((s) => s.requiresDigitalSignature)).length} مسارات
              </div>
              <div className="text-[10px] text-slate-400 mt-1">شهادة تشفير وتوقيع رقمي موثق</div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800/50 p-4 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-sap-secondary" />
              <div>
                <h2 className="text-sm font-bold text-white">محرك قواعد التوجيه ومصفوفة الصلاحيات (Workflow Route Matrix)</h2>
                <p className="text-[11px] text-slate-400">تحديد تسلسل الموافقات، السقوف المالية، وضوابط التوقيع والدراسات</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
                <button
                  onClick={() => setWorkflowRuleFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    workflowRuleFilter === "ALL" ? "bg-sap-secondary text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  الكل ({effectiveWorkflowRules.length})
                </button>
                <button
                  onClick={() => setWorkflowRuleFilter("VOUCHER")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    workflowRuleFilter === "VOUCHER" ? "bg-sap-secondary text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  سندات الصرف
                </button>
                <button
                  onClick={() => setWorkflowRuleFilter("PURCHASE_BILL")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    workflowRuleFilter === "PURCHASE_BILL" ? "bg-sap-secondary text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  أوامر الشراء
                </button>
                <button
                  onClick={() => setWorkflowRuleFilter("JOURNAL")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    workflowRuleFilter === "JOURNAL" ? "bg-sap-secondary text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  القيود
                </button>
                <button
                  onClick={() => setWorkflowRuleFilter("HR_PAYROLL")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    workflowRuleFilter === "HR_PAYROLL" ? "bg-sap-secondary text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  الرواتب HR
                </button>
              </div>

              <button
                onClick={() => setIsCreateWorkflowRuleOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sap-secondary to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مسار اعتماد جديد</span>
              </button>
            </div>
          </div>

          {/* Workflow Rules Cards List */}
          <div className="space-y-4">
            {effectiveWorkflowRules
              .filter((r) => workflowRuleFilter === "ALL" || r.documentType === workflowRuleFilter)
              .map((rule) => (
                <div
                  key={rule.id}
                  className={`bg-slate-900/90 border rounded-3xl p-6 shadow-md transition-all ${
                    rule.isActive ? "border-slate-800/80 hover:border-slate-700" : "border-slate-800/40 opacity-70"
                  }`}
                >
                  {/* Top Rule Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-black shadow-md flex-shrink-0">
                        <GitBranch className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-indigo-300 font-bold bg-indigo-950/80 px-2.5 py-0.5 rounded-lg border border-indigo-800">
                            {rule.id}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300">
                            {rule.documentType === "VOUCHER"
                              ? "سندات صرف وقبض"
                              : rule.documentType === "JOURNAL"
                              ? "قيود محاسبية وتسويات"
                              : rule.documentType === "PURCHASE_BILL"
                              ? "أوامر وفواتير شراء"
                              : rule.documentType === "SALES_INVOICE"
                              ? "فواتير بيع آجل"
                              : "مسيرات الرواتب والمكافآت"}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              rule.priority === "URGENT"
                                ? "bg-rose-950 text-rose-300 border border-rose-800"
                                : rule.priority === "HIGH"
                                ? "bg-amber-950 text-amber-300 border border-amber-800"
                                : "bg-blue-950 text-blue-300 border border-blue-800"
                            }`}
                          >
                            أولوية: {rule.priority === "URGENT" ? "عاجلة جداً" : rule.priority === "HIGH" ? "عالية" : "عادية"}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                              rule.isActive
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {rule.isActive ? "● مسار نشط وفعال" : "○ معطل مؤقتاً"}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1.5">{rule.name || rule.nameAr}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{rule.description}</p>
                      </div>
                    </div>

                    {/* Financial Thresholds & Toggles */}
                    <div className="flex items-center gap-4">
                      <div className="text-right bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-semibold">السقف المالي للتطبيق</div>
                        <div className="text-sm font-black text-sap-secondary font-mono mt-0.5">
                          من {formatNumber(rule.minAmount)} {rule.currency}
                          {rule.maxAmount ? ` إلى ${formatNumber(rule.maxAmount)}` : " فما فوق"}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          نطاق الفروع: {rule.branchScope === "ALL" ? "كافة الفروع والإدارات" : "فروع محددة"}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleToggleRuleActive(rule.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            rule.isActive
                              ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
                              : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                          }`}
                        >
                          {rule.isActive ? "تعطيل المسار" : "تفعيل المسار"}
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step Pipeline Visualization */}
                  <div className="mt-5">
                    <div className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-indigo-400" />
                        <span>تسلسل مراحل ومستويات الاعتماد في هذا المسار ({rule.steps.length} مستويات متسلسلة):</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {rule.steps.map((step) => (
                        <div
                          key={step.stepOrder}
                          className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2 relative group hover:border-slate-700 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="w-6 h-6 rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-mono text-xs flex items-center justify-center font-black">
                              {step.stepOrder}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>SLA: {step.slaHours} ساعة</span>
                            </span>
                          </div>

                          <div className="font-bold text-white text-sm">{step.stepName}</div>
                          <div className="text-[11px] text-slate-300 font-medium">
                            صاحب الصلاحية: <span className="text-indigo-300 font-bold">{step.approverUserName || step.approverRole}</span>
                          </div>

                          <div className="pt-2 border-t border-slate-900 flex flex-wrap gap-1.5 text-[10px]">
                            {step.requiresDigitalSignature && (
                              <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800 flex items-center gap-1">
                                <Stamp className="w-3 h-3" />
                                <span>توقيع رقمي إلزامي</span>
                              </span>
                            )}
                            {step.requiresStudyDocument && (
                              <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                                <PieChart className="w-3 h-3" />
                                <span>دراسة جدوى إلزامية</span>
                              </span>
                            )}
                            {step.isMandatory && (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">مرحلة إلزامية</span>
                            )}
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

      {/* ========================================================================= */}
      {/* TAB: DOCUMENT FEASIBILITY STUDIES & FINANCIAL ANALYSIS                    */}
      {/* ========================================================================= */}
      {activeTab === "STUDIES" && (
        <div className="space-y-6">
          {/* Studies Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/50 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>إجمالي دراسات الجدوى والتحليل</span>
                <PieChart className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-300 mt-2">
                {approvalRequests.filter((a) => a.studyAnalysis).length} دراسات موثقة
              </div>
              <div className="text-[10px] text-slate-400 mt-1">تشمل تقييم الأثر المالي والمخاطر</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/50 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>متوسط مؤشر الجدوى المالي</span>
                <Target className="w-4 h-4 text-sap-secondary" />
              </div>
              <div className="text-2xl font-black text-sap-secondary mt-2">93.5%</div>
              <div className="text-[10px] text-slate-400 mt-1">توافق كامل مع الموازنة والسيولة</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/50 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>مستوى المخاطر العام</span>
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-blue-300 mt-2">منخفض إلى آمن</div>
              <div className="text-[10px] text-slate-400 mt-1">تغطية ضمانات بنكية بنسبة 100%</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/50 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>العائد التقديري للاستثمار ROI</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-purple-300 mt-2">16.8% سنوياً</div>
              <div className="text-[10px] text-slate-400 mt-1">عائد المشاريع الاستثمارية والإنفاق الرأسمالي</div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800/50 p-4 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="text-sm font-bold text-white">مركز دراسات الجدوى وتقييم الأثر المالي والرقابي</h2>
                <p className="text-[11px] text-slate-400">فحص الوثائق الداعمة، مؤشرات الجدوى، وتوصيات لجان التدقيق المالي</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-56">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث في الدراسات..."
                  value={studySearchQuery}
                  onChange={(e) => setStudySearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sap-secondary"
                />
              </div>

              <select
                value={studyRiskFilter}
                onChange={(e) => setStudyRiskFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="ALL">كافة مستويات المخاطر</option>
                <option value="LOW">مخاطر منخفضة (آمنة)</option>
                <option value="MEDIUM">مخاطر متوسطة</option>
                <option value="HIGH">مخاطر عالية</option>
              </select>

              <button
                onClick={() => setIsCreateStudyModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>إعداد دراسة جدوى جديدة</span>
              </button>
            </div>
          </div>

          {/* Studies Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {approvalRequests
              .filter((a) => a.studyAnalysis)
              .map((apr) => {
                const std = apr.studyAnalysis!;
                return (
                  <div
                    key={std.id}
                    className="bg-slate-900/90 border border-slate-800/70 hover:border-emerald-700/60 rounded-3xl p-6 shadow-md transition-all space-y-4 text-right"
                  >
                    {/* Top Study Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-800">
                            {std.documentRef}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              std.riskLevel === "LOW"
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : std.riskLevel === "MEDIUM"
                                ? "bg-amber-950 text-amber-300 border border-amber-800"
                                : "bg-rose-950 text-rose-300 border border-rose-800"
                            }`}
                          >
                            مستوى المخاطر: {std.riskLevel === "LOW" ? "منخفضة" : std.riskLevel === "MEDIUM" ? "متوسطة" : "عالية"}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1.5">{std.title || std.documentTitle}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          إعداد: <strong className="text-slate-200">{std.preparedBy}</strong> ({std.preparedRole}) - {std.preparedDate || std.date}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedStudyModal(std)}
                        className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-sap-secondary transition-all cursor-pointer"
                        title="عرض الدراسة الكاملة"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Feasibility Gauge Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300">مؤشر الجدوى الفنية والمالية:</span>
                        <span className="font-mono font-black text-emerald-400 text-sm">{std.feasibilityScore}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${std.feasibilityScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">الموازنة التقديرية المرصودة:</div>
                        <div className="font-mono font-bold text-sap-secondary mt-0.5">
                          {formatNumber(std.budgetAllocated)} {std.currency}
                        </div>
                      </div>
                      {std.roiEstimatePercent && (
                        <div>
                          <div className="text-[10px] text-slate-400">العائد الاستثماري المتوقع:</div>
                          <div className="font-mono font-bold text-emerald-400 mt-0.5">
                            +{std.roiEstimatePercent}% سنوياً
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Financial Notes & Recommendations */}
                    <div className="text-xs space-y-2">
                      <div className="text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="font-bold text-emerald-300">تحليل الأثر المالي: </span>
                        {std.financialImpactNotes}
                      </div>

                      {std.recommendations && std.recommendations.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[11px] font-bold text-slate-400">أهم التوصيات الرقابية:</div>
                          <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                            {std.recommendations.map((rec, i) => (
                              <li key={i} className="leading-relaxed">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Attachments & Action Button */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                        <span>{std.studyAttachments?.length || 1} مرفقات موثقة (PDF / Excel)</span>
                      </div>

                      <button
                        onClick={() => setSelectedStudyModal(std)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 font-bold border border-emerald-600/60 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>فحص تفاصيل الدراسة</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INTERNAL ENTERPRISE CHAT & BRANCH CHANNELS                        */}
      {/* ========================================================================= */}
      {activeTab === "CHAT" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[680px]">
          {/* Channels Sidebar */}
          <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800/50 rounded-3xl p-4 flex flex-col shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="font-bold text-xs text-white">قنوات التواصل والدردشة</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                12 متصل
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {effectiveChannels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`w-full text-right p-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                    activeChannelId === ch.id
                      ? "bg-sap-secondary text-slate-950 shadow-md font-black"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="truncate">{ch.name}</span>
                  </div>
                  {ch.unreadCount > 0 && activeChannelId !== ch.id && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                      {ch.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Message Window */}
          <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800/50 rounded-3xl p-5 flex flex-col justify-between shadow-md">
            {/* Channel Top Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-white">{activeChannel?.name || "غرفة المحادثة"}</h3>
                <p className="text-[11px] text-slate-400">{activeChannel?.description || "قناة التواصل الداخلي"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  {activeChannel?.participants?.length || 0} أعضاء
                </span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2">
              {channelMessages.map((msg) => {
                const isMe = msg.senderId === safeUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-start" : "items-end"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-slate-300">{msg.senderName}</span>
                      <span className="text-[10px] text-slate-400">({msg.senderRole})</span>
                      <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed shadow-sm ${
                        isMe
                          ? "bg-gradient-to-r from-blue-900/80 to-[#0A2540] border border-blue-700/40 text-blue-100 rounded-tr-none"
                          : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none"
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* Linked Doc Preview in Chat */}
                      {msg.linkedDoc && (
                        <div className="mt-2.5 p-2 rounded-xl bg-slate-900/90 border border-sap-secondary/30 flex items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-2 text-sap-secondary font-semibold">
                            <FileCheck className="w-4 h-4" />
                            <span>{msg.linkedDoc.title}</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">{msg.linkedDoc.ref}</span>
                        </div>
                      )}

                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map((att, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[10px] text-amber-300 bg-amber-950/40 p-1 rounded border border-amber-800/40">
                              <Paperclip className="w-3 h-3" />
                              <span>{att.name}</span>
                              <span className="text-slate-400">({att.size})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendChatMessage} className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder={`اكتب رسالتك في ${activeChannel?.name || "المحادثة"}... (@ للإشارة، أو ارفق مستنداً)`}
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sap-secondary"
              />

              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sap-secondary to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 rtl:-rotate-90" />
                <span>إرسال</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ADMINISTRATIVE CIRCULARS & OFFICIAL INSTRUCTIONS                   */}
      {/* ========================================================================= */}
      {activeTab === "CIRCULARS" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800/50 p-4 rounded-3xl shadow-sm">
            <div>
              <h2 className="text-base font-bold text-white">التعاميم والتعليمات الإدارية الرسمية</h2>
              <p className="text-xs text-slate-400">توجيهات الإدارة العامة لجميع الفروع وتتبع توقيعات تأكيد الاستلام</p>
            </div>

            <button
              onClick={() => setIsCreateCircularOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sap-secondary to-amber-500 text-slate-950 font-black text-xs shadow-md hover:brightness-110 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إصدار تعميم إداري جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {circulars.map((circ) => {
              const isAcknowledged = circ.acknowledgedBy.some((a) => a.userId === currentUser.id);
              return (
                <div
                  key={circ.id}
                  className="bg-slate-900/90 border border-slate-800/50 hover:border-slate-700 rounded-3xl p-5 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs text-sap-secondary font-bold bg-sap-secondary/10 px-2 py-0.5 rounded-lg border border-sap-secondary/20">
                        {circ.circularNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          circ.priority === "URGENT"
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : "bg-amber-950 text-amber-300 border border-amber-800"
                        }`}
                      >
                        {circ.priority === "URGENT" ? "عاجل ومهم" : "هام"}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-white mb-2">{circ.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
                      {circ.content}
                    </p>

                    <div className="mt-4 space-y-1 text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>الجهة المصدرة:</span>
                        <span className="text-slate-200 font-semibold">{circ.issuedBy} ({circ.issuerRole})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>تاريخ الإصدار:</span>
                        <span className="font-mono">{circ.issueDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Acknowledgment Section */}
                  <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      تم الاستلام من: <span className="text-emerald-400 font-bold">{circ.acknowledgedBy.length} موظفين</span>
                    </div>

                    <button
                      onClick={() => handleAcknowledgeCircular(circ.id)}
                      disabled={isAcknowledged}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        isAcknowledged
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800 cursor-default"
                          : "bg-sap-secondary text-slate-950 hover:brightness-110 cursor-pointer"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAcknowledged ? "تم تأكيد الاستلام والقراءة" : "تأكيد الاستلام والقراءة"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MONITORING DASHBOARD & LIVE AUDIT TRAIL                             */}
      {/* ========================================================================= */}
      {activeTab === "AUDIT_MONITOR" && (
        <div className="space-y-6">
          {/* Real-time Monitoring Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/50 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>المستخدمون النشطون الآن</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-2">12 متصل</div>
              <div className="text-[10px] text-slate-400 mt-1">صنعاء (7)، عدن (3)، تعز (2)</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/50 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>حركات اليوم المسجلة</span>
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-blue-300 mt-2">148 عملية</div>
              <div className="text-[10px] text-slate-400 mt-1">قيود، فواتير، سندات، وتقارير</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/50 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>تنبيهات أمنية ورقابية</span>
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300 mt-2">{unreadAlertsCount} تنبيهات</div>
              <div className="text-[10px] text-slate-400 mt-1">حدود ائتمان وفروق صرف بنكية</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/50 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>درجة الامتثال والتدقيق</span>
                <CheckCircle2 className="w-4 h-4 text-sap-secondary" />
              </div>
              <div className="text-2xl font-black text-sap-secondary mt-2">100% IFRS</div>
              <div className="text-[10px] text-slate-400 mt-1">مطابقة كاملة لسجل القيود والأستاذ</div>
            </div>
          </div>

          {/* Audit Trail Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800/50 p-4 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-sap-secondary" />
              <h2 className="text-sm font-bold text-white">سجل التدقيق الحي (Live Audit Trail - SAP ST03N / CDHDR)</h2>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث في العمليات، المستخدم، الـ IP..."
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sap-secondary"
                />
              </div>

              <select
                value={auditModuleFilter}
                onChange={(e) => setAuditModuleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="ALL">جميع الأنظمة الفرعية</option>
                <option value="FI_JOURNAL">القيود المحاسبية (FI)</option>
                <option value="SD_SALES">المبيعات والفواتير (SD)</option>
                <option value="MM_PURCHASE">المشتريات والموردين (MM)</option>
                <option value="TREASURY">الخزائن والبنوك</option>
                <option value="SYSTEM_SETTINGS">إعدادات الأمان والدخول</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-slate-900/90 border border-slate-800/50 rounded-3xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">الوقت والتاريخ</th>
                    <th className="p-3.5">المستخدم والفرع</th>
                    <th className="p-3.5">نوع الإجراء</th>
                    <th className="p-3.5">النظام الفرعي</th>
                    <th className="p-3.5">تفاصيل الحركة</th>
                    <th className="p-3.5">الجهاز وعنوان IP</th>
                    <th className="p-3.5">الحالة الرقابية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-slate-300 whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{log.userName}</div>
                        <div className="text-[10px] text-slate-400">{log.branchName}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            log.actionType === "CREATE"
                              ? "bg-blue-950 text-blue-300 border border-blue-800"
                              : log.actionType === "APPROVE"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : log.actionType === "PRINT"
                              ? "bg-purple-950 text-purple-300 border border-purple-800"
                              : log.actionType === "LOGIN"
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {log.actionType}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-300">{log.module}</td>
                      <td className="p-3.5 text-slate-200">{log.details}</td>
                      <td className="p-3.5 font-mono text-[10px] text-slate-400 whitespace-nowrap">{log.ipAddress}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-950 text-emerald-300"
                              : "bg-rose-950 text-rose-300 border border-rose-800"
                          }`}
                        >
                          {log.status === "SUCCESS" ? "ناجح ومطابق" : "تنبيه أمني"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: APPROVAL EXECUTION & DIGITAL SIGNATURE CANVAS                      */}
      {/* ========================================================================= */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-sap-secondary/50 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Stamp className="w-5 h-5 text-sap-secondary" />
                <h3 className="font-bold text-base text-white">اعتماد وتوقيع إلكتروني: {selectedApproval.requestNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedApproval(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="text-sm font-bold text-white">{selectedApproval.title}</div>
              <div className="flex justify-between text-slate-300">
                <span>طالب الاعتماد: {selectedApproval.requestedBy}</span>
                {selectedApproval.amount && (
                  <span className="font-bold text-sap-secondary font-mono">
                    المبلغ: {formatNumber(selectedApproval.amount)} {selectedApproval.currency}
                  </span>
                )}
              </div>
              {selectedApproval.notes && (
                <div className="text-slate-400 italic">ملاحظات: {selectedApproval.notes}</div>
              )}
            </div>

            {/* Sub-Tabs: Decision & Signature vs Linked Doc vs Study Analysis */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setApprovalModalTab("SIGNATURE")}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  approvalModalTab === "SIGNATURE"
                    ? "bg-sap-secondary text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                القرار والتوقيع الرقمي
              </button>
              <button
                type="button"
                onClick={() => setApprovalModalTab("LINKED_DOC")}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  approvalModalTab === "LINKED_DOC"
                    ? "bg-sap-secondary text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                فحص المستند المحاسبي
              </button>
              <button
                type="button"
                onClick={() => setApprovalModalTab("STUDY")}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  approvalModalTab === "STUDY"
                    ? "bg-sap-secondary text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                دراسة الجدوى والأثر المالي
              </button>
            </div>

            {/* TAB 1: SIGNATURE & DECISION */}
            {approvalModalTab === "SIGNATURE" && (
              <>
                {/* Digital Signature Pad */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-sap-secondary flex items-center gap-1">
                      <PenTool className="w-3.5 h-3.5" />
                      <span>التوقيع الإلكتروني الرقمي (ارسم توقيعك أدناه):</span>
                    </span>
                    <button
                      type="button"
                      onClick={clearSignatureCanvas}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>مسح التوقيع</span>
                    </button>
                  </div>

                  <div className="border border-amber-500/40 rounded-2xl bg-slate-950 overflow-hidden relative">
                    <canvas
                      ref={canvasRef}
                      width={580}
                      height={130}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-32 cursor-crosshair touch-none"
                    />
                    {!hasSignature && (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs pointer-events-none">
                        انقر واسحب بالماوس أو القلم لرسم التوقيع القانوني
                      </div>
                    )}
                  </div>
                </div>

                {/* Comments Field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">ملاحظات وقرار الاعتماد:</label>
                  <textarea
                    rows={2}
                    placeholder="أدخل أي ملاحظات مرفقة بقرار الاعتماد..."
                    value={approvalCommentText}
                    onChange={(e) => setApprovalCommentText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sap-secondary"
                  />
                </div>
              </>
            )}

            {/* TAB 2: LINKED ACCOUNTING DOCUMENT */}
            {approvalModalTab === "LINKED_DOC" && (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-sap-secondary" />
                    <span>بيانات المستند المالي الأصلي</span>
                  </span>
                  <span className="font-mono text-sap-secondary font-bold">
                    {selectedApproval.linkedDocumentDetails?.documentNumber || selectedApproval.requestNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px]">نوع المستند:</span>
                    <span className="font-bold">{selectedApproval.linkedDocumentDetails?.documentType || selectedApproval.documentType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">الطرف المعني:</span>
                    <span className="font-bold">{selectedApproval.linkedDocumentDetails?.partyName || "حساب وسيط / إدارة المستودعات"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">الحساب المدين:</span>
                    <span className="font-mono text-amber-300">{selectedApproval.linkedDocumentDetails?.debitAccount || "غير محدد"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">الحساب الدائن:</span>
                    <span className="font-mono text-emerald-300">{selectedApproval.linkedDocumentDetails?.creditAccount || "غير محدد"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">الفرع:</span>
                    <span>{selectedApproval.linkedDocumentDetails?.branch || selectedApproval.branchName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">المبلغ والعملة:</span>
                    <span className="font-mono font-bold text-sap-secondary">
                      {selectedApproval.amount ? `${formatNumber(selectedApproval.amount)} ${selectedApproval.currency}` : "غير محدد"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">البيان والشرح المحاسبي:</span>
                  <p className="text-slate-200 mt-1 leading-relaxed">
                    {selectedApproval.linkedDocumentDetails?.description || selectedApproval.notes || "لا توجد تفاصيل إضافية مسجلة"}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: STUDY ANALYSIS PREVIEW */}
            {approvalModalTab === "STUDY" && (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                {selectedApproval.studyAnalysis ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{selectedApproval.studyAnalysis.documentTitle}</h4>
                        <span className="text-[10px] text-slate-400">
                          المرجع: {selectedApproval.studyAnalysis.documentRef} - إعداد: {selectedApproval.studyAnalysis.preparedBy}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        مؤشر الجدوى: {selectedApproval.studyAnalysis.feasibilityScore}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-400 text-[10px] block">الموازنة المرصودة:</span>
                        <span className="font-mono font-bold text-sap-secondary">
                          {formatNumber(selectedApproval.studyAnalysis.budgetAllocated)} {selectedApproval.studyAnalysis.currency}
                        </span>
                      </div>
                      {selectedApproval.studyAnalysis.roiEstimatePercent && (
                        <div>
                          <span className="text-slate-400 text-[10px] block">العائد الاستثماري المتوقع:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            +{selectedApproval.studyAnalysis.roiEstimatePercent}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">تحليل الأثر المالي:</span>
                      <p className="text-slate-300 mt-0.5 leading-relaxed bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
                        {selectedApproval.studyAnalysis.financialImpactNotes}
                      </p>
                    </div>

                    {selectedApproval.studyAnalysis.recommendations && (
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">توصيات اللجنة:</span>
                        <ul className="list-disc list-inside text-slate-300 space-y-0.5 mt-0.5">
                          {selectedApproval.studyAnalysis.recommendations.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400">
                    <PieChart className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p>لا توجد دراسة جدوى مرفقة بهذا الطلب حالياً.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setNewStudyTitle(`دراسة جدوى لـ: ${selectedApproval.title}`);
                        setNewStudyRef(selectedApproval.requestNumber);
                        if (selectedApproval.amount) setNewStudyBudgetAllocated(selectedApproval.amount);
                        if (selectedApproval.currency) setNewStudyCurrency(selectedApproval.currency);
                        setIsCreateStudyModalOpen(true);
                      }}
                      className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-600/40 cursor-pointer"
                    >
                      + إنشاء وتوثيق دراسة جدوى لهذا الطلب
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedApproval(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                إلغاء
              </button>

              <button
                onClick={() => handleExecuteApproval("REJECT")}
                className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 font-bold text-xs transition-all cursor-pointer"
              >
                رفض المعاملة
              </button>

              <button
                onClick={() => handleExecuteApproval("APPROVE")}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sap-secondary to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Stamp className="w-4 h-4" />
                <span>اعتماد وتوقيع رسمي</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: STANDALONE DOCUMENT STUDY ANALYSIS VIEW                            */}
      {/* ========================================================================= */}
      {selectedStudyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-700/60 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">تقرير دراسة الجدوى والأثر المالي: {selectedStudyModal.documentRef}</h3>
              </div>
              <button
                onClick={() => setSelectedStudyModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white">{selectedStudyModal.title || selectedStudyModal.documentTitle}</h4>
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                    selectedStudyModal.riskLevel === "LOW"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : selectedStudyModal.riskLevel === "MEDIUM"
                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                      : "bg-rose-950 text-rose-300 border border-rose-800"
                  }`}
                >
                  المخاطر: {selectedStudyModal.riskLevel === "LOW" ? "منخفضة" : selectedStudyModal.riskLevel === "MEDIUM" ? "متوسطة" : "عالية"}
                </span>
              </div>

              <div className="text-slate-400 flex items-center gap-4">
                <span>المُعد: <strong className="text-slate-200">{selectedStudyModal.preparedBy}</strong> ({selectedStudyModal.preparedRole})</span>
                <span>تاريخ التقرير: <span className="font-mono text-slate-300">{selectedStudyModal.preparedDate || selectedStudyModal.date}</span></span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">مؤشر الجدوى والقبول الفني:</span>
                  <span className="font-mono font-black text-emerald-400">{selectedStudyModal.feasibilityScore}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full"
                    style={{ width: `${selectedStudyModal.feasibilityScore}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">الموازنة التقديرية:</span>
                  <span className="font-mono font-bold text-sap-secondary">
                    {formatNumber(selectedStudyModal.budgetAllocated)} {selectedStudyModal.currency}
                  </span>
                </div>
                {selectedStudyModal.roiEstimatePercent && (
                  <div>
                    <span className="text-[10px] text-slate-400 block">العائد الاستثماري المتوقع:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      +{selectedStudyModal.roiEstimatePercent}% سنوياً
                    </span>
                  </div>
                )}
              </div>

              <div>
                <span className="font-bold text-emerald-300 block mb-1">تحليل الأثر المالي والسيولة:</span>
                <p className="text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                  {selectedStudyModal.financialImpactNotes}
                </p>
              </div>

              {selectedStudyModal.recommendations && (
                <div>
                  <span className="font-bold text-slate-300 block mb-1">التوصيات الرقابية وقرار اللجنة:</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {selectedStudyModal.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedStudyModal.studyAttachments && (
                <div className="pt-3 border-t border-slate-800">
                  <span className="font-bold text-slate-400 block mb-2">الملفات والمستندات المرفقة:</span>
                  <div className="space-y-1.5">
                    {selectedStudyModal.studyAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-sap-secondary" />
                          <span className="font-bold text-slate-200">{att.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({att.size})</span>
                        </div>
                        <button
                          onClick={() => showToast(`جاري تنزيل المرفق: ${att.name}`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer"
                        >
                          تحميل
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedStudyModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW WORKFLOW ROUTE RULE                                      */}
      {/* ========================================================================= */}
      {isCreateWorkflowRuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-sap-secondary/50 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-sap-secondary" />
                <h3 className="font-bold text-base text-white">إضافة قاعدة ومسار اعتماد مالي جديد (Workflow Rule)</h3>
              </div>
              <button
                onClick={() => setIsCreateWorkflowRuleOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkflowRule} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">اسم وتوصيف المسار:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مسار سندات الصرف الكبرى - فوق 5 مليون ريال"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">نوع المعاملة المستهدفة:</label>
                  <select
                    value={newRuleDocType}
                    onChange={(e) => setNewRuleDocType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                  >
                    <option value="VOUCHER">سندات الصرف والقبض (Vouchers)</option>
                    <option value="JOURNAL">القيود المحاسبية والتسويات (Journals)</option>
                    <option value="PURCHASE_BILL">أوامر وفواتير الشراء (Purchases)</option>
                    <option value="SALES_INVOICE">فواتير البيع الآجل (Sales)</option>
                    <option value="HR_PAYROLL">مسيرات الرواتب (HR Payroll)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">مستوى الأولوية:</label>
                  <select
                    value={newRulePriority}
                    onChange={(e) => setNewRulePriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                  >
                    <option value="NORMAL">عادي</option>
                    <option value="HIGH">عالي</option>
                    <option value="URGENT">عاجل وفوري</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">الحد الأدنى للمبلغ:</label>
                  <input
                    type="number"
                    min="0"
                    value={newRuleMinAmount}
                    onChange={(e) => setNewRuleMinAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">الحد الأقصى (اختياري):</label>
                  <input
                    type="number"
                    min="0"
                    value={newRuleMaxAmount}
                    onChange={(e) => setNewRuleMaxAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">العملة المطبقة:</label>
                  <select
                    value={newRuleCurrency}
                    onChange={(e) => setNewRuleCurrency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                  >
                    <option value="YER_SANAA">ريال يمني (صنعاء)</option>
                    <option value="YER_ADEN">ريال يمني (عدن)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">توصيف الحوكمة والغرض:</label>
                <textarea
                  rows={2}
                  placeholder="أدخل سبب وضع هذه القاعدة وسياستها في الدليل الإداري والمالي..."
                  value={newRuleDescription}
                  onChange={(e) => setNewRuleDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                />
              </div>

              {/* Steps builder preview */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-sap-secondary" />
                    <span>مراحل الاعتماد المتسلسلة (تلقائية بحسب السقف):</span>
                  </span>
                  <span className="text-slate-400 text-[11px]">{newRuleSteps.length} مستويات محددة</span>
                </div>

                <div className="space-y-2">
                  {newRuleSteps.map((st, i) => (
                    <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700 font-mono text-[10px] flex items-center justify-center font-bold">
                          {st.stepOrder}
                        </span>
                        <div>
                          <div className="font-bold text-white">{st.stepName}</div>
                          <div className="text-[10px] text-slate-400">
                            المسؤول: {st.approverUserName} ({st.approverRole}) - المهلة: {st.slaHours} ساعة
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        {st.requiresDigitalSignature && (
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">توقيع رقمي</span>
                        )}
                        {st.requiresStudyDocument && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">دراسة جدوى</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateWorkflowRuleOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sap-secondary to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ وتفعيل المسار</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW FEASIBILITY STUDY ANALYSIS                              */}
      {/* ========================================================================= */}
      {isCreateStudyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-700/60 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">توثيق دراسة جدوى وتقييم أثر مالي ورأي رقابي</h3>
              </div>
              <button
                onClick={() => setIsCreateStudyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudyAnalysis} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">عنوان وموضوع الدراسة:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: دراسة الجدوى لإنفاق تسوية الحسابات البنكية وحماية الأرصدة..."
                  value={newStudyTitle}
                  onChange={(e) => setNewStudyTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">الرقم المرجعي / رقم طلب الاعتماد:</label>
                  <input
                    type="text"
                    placeholder="مثال: APR-2026-001 أو STD-2026-004"
                    value={newStudyRef}
                    onChange={(e) => setNewStudyRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">مستوى تقييم المخاطر:</label>
                  <select
                    value={newStudyRiskLevel}
                    onChange={(e) => setNewStudyRiskLevel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                  >
                    <option value="LOW">مخاطر منخفضة (آمن ومطابق بالكامل)</option>
                    <option value="MEDIUM">مخاطر متوسطة (يتطلب مراقبة)</option>
                    <option value="HIGH">مخاطر عالية (مشروط بضمانات)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">مؤشر الجدوى الفنية (%):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newStudyFeasibilityScore}
                    onChange={(e) => setNewStudyFeasibilityScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">الموازنة المرصودة:</label>
                  <input
                    type="number"
                    min="0"
                    value={newStudyBudgetAllocated}
                    onChange={(e) => setNewStudyBudgetAllocated(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">العائد المتوقع ROI (%):</label>
                  <input
                    type="number"
                    value={newStudyRoi}
                    onChange={(e) => setNewStudyRoi(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">تحليل الأثر المالي وتدفقات السيولة:</label>
                <textarea
                  rows={3}
                  placeholder="شرح أثر هذه العملية على السيولة النقدية، رأس المال العامل، وحسابات النفقات..."
                  value={newStudyFinancialNotes}
                  onChange={(e) => setNewStudyFinancialNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">التوصيات الرقابية وقرار اللجنة:</label>
                <input
                  type="text"
                  placeholder="مثال: الموافقة على الصرف مشروطة بتقديم خطاب ضمان نهائي"
                  value={newStudyRecommendations}
                  onChange={(e) => setNewStudyRecommendations(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateStudyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ وتوثيق تقرير الجدوى</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW DOCUMENT DETAILS & ATTACHMENTS                                */}
      {/* ========================================================================= */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sap-secondary" />
                <h3 className="font-bold text-base text-white">{selectedDoc.title}</h3>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="p-1 text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-400">الرقم المرجعي:</span>{" "}
                <span className="font-bold text-sap-secondary font-mono">{selectedDoc.refNumber}</span>
              </div>
              <div>
                <span className="text-slate-400">نوع المعاملة:</span>{" "}
                <span className="font-bold text-white">{selectedDoc.type === "INCOMING" ? "وارد رسمي" : "صادر رسمي"}</span>
              </div>
              <div>
                <span className="text-slate-400">المرسل:</span>{" "}
                <span className="font-bold text-white">{selectedDoc.senderOrganization || selectedDoc.senderName}</span>
              </div>
              <div>
                <span className="text-slate-400">المستلم:</span>{" "}
                <span className="font-bold text-white">{selectedDoc.recipientDepartment || selectedDoc.recipientName}</span>
              </div>
              <div>
                <span className="text-slate-400">تاريخ التسجيل:</span>{" "}
                <span className="font-mono text-slate-300">{selectedDoc.date}</span>
              </div>
              <div>
                <span className="text-slate-400">الفرع:</span>{" "}
                <span className="text-slate-300">{selectedDoc.branchName}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-300">الملخص والبيان:</span>
              <p className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-slate-300 leading-relaxed">
                {selectedDoc.summary}
              </p>
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">المرفقات والوثائق الإلكترونية ({selectedDoc.attachments.length}):</span>
              <div className="space-y-2">
                {selectedDoc.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-sap-secondary" />
                      <span className="font-semibold text-white">{att.name}</span>
                      <span className="text-[10px] text-slate-400">({att.size})</span>
                    </div>
                    <button
                      onClick={() => alert(`جاري تنزيل المرفق: ${att.name}`)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW CORRESPONDENCE / DOCUMENT                               */}
      {/* ========================================================================= */}
      {isCreateDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-sap-secondary" />
                <h3 className="font-bold text-base text-white">تسجيل معاملة / وارد أو صادر جديد</h3>
              </div>
              <button onClick={() => setIsCreateDocOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewDoc} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">نوع المعاملة:</label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                  >
                    <option value="INCOMING">وارد رسمي (من جهة خارجية)</option>
                    <option value="OUTGOING">صادر رسمي (إلى جهة خارجية)</option>
                    <option value="INTERNAL_MEMO">مذكرة داخلية (بين الأقسام / الفروع)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">التصنيف الوظيفي:</label>
                  <select
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                  >
                    <option value="FINANCIAL">مالي ومحاسبي</option>
                    <option value="ADMINISTRATIVE">إداري وتنظيمي</option>
                    <option value="OPERATIONAL">تشغيلي ومستودعات</option>
                    <option value="LEGAL">قانوني وضريبي</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">عنوان وموضوع المعاملة:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: محضر تسوية فواتير الموردين للربع الأول..."
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">الجهة / الشخص المرسل:</label>
                  <input
                    type="text"
                    placeholder="مثال: وزارة المالية / بنك اليمن الدولي..."
                    value={newDocSender}
                    onChange={(e) => setNewDocSender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">القسم أو المستلم:</label>
                  <input
                    type="text"
                    value={newDocRecipient}
                    onChange={(e) => setNewDocRecipient(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">مستوى الأهمية:</label>
                  <select
                    value={newDocPriority}
                    onChange={(e) => setNewDocPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                  >
                    <option value="NORMAL">عادي</option>
                    <option value="HIGH">هام</option>
                    <option value="URGENT">سري وعاجل جداً</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">الفرع التابع:</label>
                  <select
                    value={newDocBranch}
                    onChange={(e) => setNewDocBranch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                  >
                    <option value="المركز الرئيسي - صنعاء">المركز الرئيسي - صنعاء</option>
                    <option value="فرع عدن - المعلا">فرع عدن - المعلا</option>
                    <option value="فرع المكلا - 40 شقة">فرع المكلا - 40 شقة</option>
                    <option value="فرع تعز - الحوبان">فرع تعز - الحوبان</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">الملخص والشرح التفصيلي:</label>
                <textarea
                  rows={3}
                  placeholder="أدخل ملخص المعاملة، التوجيهات، وملاحظات الأرشفة..."
                  value={newDocSummary}
                  onChange={(e) => setNewDocSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">الوسوم والكلمات المفتاحية (مفصولة بفواصل):</label>
                <input
                  type="text"
                  placeholder="مثال: ضرائب, تسوية, بنك, اعتماد"
                  value={newDocTags}
                  onChange={(e) => setNewDocTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateDocOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sap-secondary to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>تسجيل وأرشفة المعاملة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW ADMINISTRATIVE CIRCULAR                                  */}
      {/* ========================================================================= */}
      {isCreateCircularOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-sap-secondary" />
                <h3 className="font-bold text-base text-white">إصدار تعميم إداري رسمي ملزم</h3>
              </div>
              <button onClick={() => setIsCreateCircularOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCircular} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">عنوان وموضوع التعميم:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تعليمات الجرد الدوري السنوي ومواعيد إغلاق الخزائن..."
                  value={newCircularTitle}
                  onChange={(e) => setNewCircularTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">الجهة المستهدفة:</label>
                  <select
                    value={newCircularAudience}
                    onChange={(e) => setNewCircularAudience(e.target.value as "ALL" | "BRANCH" | "DEPARTMENT")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                  >
                    <option value="ALL">كافة الموظفين ومدراء الفروع</option>
                    <option value="BRANCH">مدراء الفروع الإقليمية فقط</option>
                    <option value="DEPARTMENT">الإدارة المالية والحسابات</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">مستوى الأهمية:</label>
                  <select
                    value={newCircularPriority}
                    onChange={(e) => setNewCircularPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                  >
                    <option value="NORMAL">عادي</option>
                    <option value="HIGH">هام</option>
                    <option value="URGENT">عاجل ومهم جداً</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">نص التعليمات والتعميم الرسمي:</label>
                <textarea
                  rows={5}
                  required
                  placeholder="اكتب التوجيهات والقرارات الإلزامية بالتفصيل..."
                  value={newCircularContent}
                  onChange={(e) => setNewCircularContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sap-secondary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateCircularOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sap-secondary to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Megaphone className="w-4 h-4" />
                  <span>نشر وتعميم فوري</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DEPARTMENT SIMULATOR & COMPREHENSIVE MODEL GENERATOR                */}
      {/* ========================================================================= */}
      {isDepartmentSimulatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sap-secondary" />
                <div>
                  <h3 className="font-bold text-base text-white">مولد النماذج المؤسسية المتكاملة عبر الأقسام</h3>
                  <p className="text-[11px] text-slate-400">انقر على أي قسم لإنشاء سيناريو تشغيلي كامل مربوط بالدردشة، الموافقات، وسجل الرقابة</p>
                </div>
              </div>
              <button onClick={() => setIsDepartmentSimulatorOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Finance */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 hover:border-amber-500 flex flex-col justify-between space-y-2 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">قسم الحسابات والإدارة المالية</h4>
                    <p className="text-[10px] text-slate-400">سندات صرف، قيود يومية، ومصادقة الشيكات</p>
                  </div>
                </div>
                <button
                  onClick={() => handleGenerateDepartmentSample("FINANCE")}
                  className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs transition-all cursor-pointer"
                >
                  ⚡ توليد نموذج سند صرف مالي
                </button>
              </div>

              {/* Procurement */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-blue-500/30 hover:border-blue-500 flex flex-col justify-between space-y-2 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">قسم المشتريات وسلسلة الإمداد</h4>
                    <p className="text-[10px] text-slate-400">مناقصات، أوامر شراء، وتنسيق الموردين</p>
                  </div>
                </div>
                <button
                  onClick={() => handleGenerateDepartmentSample("PROCUREMENT")}
                  className="w-full py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-slate-950 font-bold text-xs transition-all cursor-pointer"
                >
                  ⚡ توليد أمر شراء ومناقصة
                </button>
              </div>

              {/* Sales */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 hover:border-emerald-500 flex flex-col justify-between space-y-2 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">قسم المبيعات والائتمان التجاري</h4>
                    <p className="text-[10px] text-slate-400">حدود ائتمان العملاء، عقود توريد سنوية</p>
                  </div>
                </div>
                <button
                  onClick={() => handleGenerateDepartmentSample("SALES")}
                  className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs transition-all cursor-pointer"
                >
                  ⚡ توليد طلب اعتماد ائتماني
                </button>
              </div>

              {/* HR */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 hover:border-purple-500 flex flex-col justify-between space-y-2 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">الموارد البشرية وشؤون الموظفين</h4>
                    <p className="text-[10px] text-slate-400">ترقيات، حوافز، مسيرات رواتب، وإجازات</p>
                  </div>
                </div>
                <button
                  onClick={() => handleGenerateDepartmentSample("HR")}
                  className="w-full py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-slate-950 font-bold text-xs transition-all cursor-pointer"
                >
                  ⚡ توليد قرار ترقية ومكافأة
                </button>
              </div>

              {/* Legal */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/30 hover:border-rose-500 flex flex-col justify-between space-y-2 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">الشؤون القانونية والحوكمة</h4>
                    <p className="text-[10px] text-slate-400">تعاميم ملزمة، عقود، وتدقيق التوقيع الرقمي</p>
                  </div>
                </div>
                <button
                  onClick={() => handleGenerateDepartmentSample("LEGAL")}
                  className="w-full py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 font-bold text-xs transition-all cursor-pointer"
                >
                  ⚡ توليد تعميم حوكمة وقانوني
                </button>
              </div>

              {/* Branches */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 hover:border-cyan-500 flex flex-col justify-between space-y-2 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">الفروع الإقليمية (عدن، المكلا، تعز)</h4>
                    <p className="text-[10px] text-slate-400">مذكرات تسوية نقدية وتنسيق الفروع</p>
                  </div>
                </div>
                <button
                  onClick={() => handleGenerateDepartmentSample("BRANCHES")}
                  className="w-full py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-bold text-xs transition-all cursor-pointer"
                >
                  ⚡ توليد مذكرة فرع عدن
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsDepartmentSimulatorOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
