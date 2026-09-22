export interface MasterTask {
  id: string;
  taskNumber: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  assignedTo: string;
  assignedToRole?: string;
  tenantId?: string;
  tenantName?: string;
  createdAt: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  status: "PENDING" | "IN_PROGRESS" | "PAUSED" | "COMPLETED";
  completionPercentage: number;
  attachments?: string[];
  notes?: string;
  comments: {
    id: string;
    author: string;
    avatar?: string;
    text: string;
    timestamp: string;
  }[];
}

export interface MasterProject {
  id: string;
  projectNumber: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  completionPercentage: number;
  manager: string;
  milestones: {
    id: string;
    title: string;
    targetDate: string;
    completed: boolean;
  }[];
}

export interface TenantConversation {
  id: string;
  tenantId: string;
  tenantName: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: "ONLINE" | "AWAY" | "OFFLINE";
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  messages: {
    id: string;
    sender: "ADMIN" | "CLIENT";
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}

const STORAGE_KEY_TASKS = "medo_master_tasks_v1";
const STORAGE_KEY_PROJECTS = "medo_master_projects_v1";
const STORAGE_KEY_CONVERSATIONS = "medo_master_conversations_v1";

const initialTasks: MasterTask[] = [
  {
    id: "TASK-2026-0001",
    taskNumber: "TASK-2026-0001",
    title: "إصلاح عزل الجلسات الصارم وتطهير الكاشات",
    description: "تطبيق حظر تداخل الجلسات بين المنشآت وضمان فتح لوحة الإدارة العليا مباشرة للمدير وتطهير الـ Cache و LocalStorage.",
    priority: "HIGH",
    assignedTo: "الوكيل الذكي (AI Agent)",
    assignedToRole: "Lead System Architect",
    tenantId: "alzarqa",
    tenantName: "شركة الزرقاء النبيلة",
    createdAt: "22/09/2026",
    dueDate: "22/09/2026",
    estimatedHours: 2,
    actualHours: 1.5,
    status: "COMPLETED",
    completionPercentage: 100,
    comments: [
      {
        id: "c1",
        author: "بدر عايض زياد",
        avatar: "BZ",
        text: "المشكلة كانت تظهر في عزل جلسة شركة الزرقاء النبيلة عند التنقل.",
        timestamp: "22/09/2026 09:30 ص",
      },
      {
        id: "c2",
        author: "الوكيل الذكي",
        avatar: "AI",
        text: "تم حل المشكلة وتثبيت العزل الصارم للجلسات وبناء شاشة مراقبة الجلسات الحية.",
        timestamp: "22/09/2026 10:15 ص",
      },
    ],
  },
  {
    id: "TASK-2026-0002",
    taskNumber: "TASK-2026-0002",
    title: "مراجعة طلب اعتماد منشأة شركة إبراهيم كراع",
    description: "التحقق من بيانات السجل التجاري والنشاط وتعيين الباقة السحابية المناسبة وتوليد روابط الصلاحيات.",
    priority: "HIGH",
    assignedTo: "بدر (مدير المنصة)",
    assignedToRole: "Master Sovereign Admin",
    tenantId: "ibrahim-kurah",
    tenantName: "شركة إبراهيم كراع للتجارة",
    createdAt: "22/09/2026",
    dueDate: "22/09/2026",
    estimatedHours: 1,
    actualHours: 0.5,
    status: "IN_PROGRESS",
    completionPercentage: 70,
    comments: [
      {
        id: "c3",
        author: "بدر عايض زياد",
        avatar: "BZ",
        text: "تم استلام الطلب برقم REQ-2026-001 وجاري مراجعة السجل التجاري.",
        timestamp: "22/09/2026 11:00 ص",
      },
    ],
  },
  {
    id: "TASK-2026-0003",
    taskNumber: "TASK-2026-0003",
    title: "فصل المنصة الرئيسية وبناء بيئة الإدارة الشاملة",
    description: "بناء المنصة الرئيسية Master Platform ككيان سيادي مستقل وفصل مجموعة بن زياد كأول عميل بنظام تراخيص مؤسسية.",
    priority: "HIGH",
    assignedTo: "الوكيل الذكي (AI Agent)",
    assignedToRole: "Full Stack Engineer",
    createdAt: "22/09/2026",
    dueDate: "23/09/2026",
    estimatedHours: 4,
    actualHours: 3,
    status: "IN_PROGRESS",
    completionPercentage: 90,
    comments: [
      {
        id: "c4",
        author: "بدر عايض زياد",
        avatar: "BZ",
        text: "يجب أن تحتوي المنصة الرئيسية على إدارة المهام، الجداول الزمنية، والتواصل المباشر مع العملاء.",
        timestamp: "22/09/2026 01:20 م",
      },
    ],
  },
  {
    id: "TASK-2026-0004",
    taskNumber: "TASK-2026-0004",
    title: "إضافة وحدة محاسبة التكاليف ومراكز التكلفة ABC",
    description: "إضافة شاشات مراكز التكلفة، أوامر التكلفة Job Costing، التكاليف المعيارية ونظام الأنشطة ABC.",
    priority: "MEDIUM",
    assignedTo: "الوكيل الذكي (AI Agent)",
    assignedToRole: "Backend Engineer",
    createdAt: "21/09/2026",
    dueDate: "24/09/2026",
    estimatedHours: 6,
    actualHours: 6,
    status: "COMPLETED",
    completionPercentage: 100,
    comments: [],
  },
  {
    id: "TASK-2026-0005",
    taskNumber: "TASK-2026-0005",
    title: "تدريب سكرتارية الدعم على الرد السريع ومتابعة التذاكر",
    description: "تدريب فريق خدمة العملاء على مصفوفة الأولويات وقواعد الصدق مع العملاء بالرد خلال 24 ساعة.",
    priority: "LOW",
    assignedTo: "بدر (مدير المنصة)",
    assignedToRole: "Operations Lead",
    createdAt: "22/09/2026",
    dueDate: "29/09/2026",
    estimatedHours: 3,
    actualHours: 1,
    status: "PENDING",
    completionPercentage: 25,
    comments: [],
  },
];

const initialProjects: MasterProject[] = [
  {
    id: "PROJ-2026-01",
    projectNumber: "PROJ-2026-01",
    name: "عزل الجلسات الصارم وحماية المنشآت السحابية",
    description: "فصل التخزين المحلي والجلسات بين 200+ منشأة ومنع أي تداخل نهائياً.",
    startDate: "22/09/2026",
    endDate: "24/09/2026",
    status: "ACTIVE",
    completionPercentage: 100,
    manager: "بدر عايض زياد",
    milestones: [
      { id: "m1", title: "تحليل المشكلة وتحديد سبب بقاء الكاش", targetDate: "22/09/2026", completed: true },
      { id: "m2", title: "تطوير محرك العزل الصارم StrictSessionIsolation", targetDate: "23/09/2026", completed: true },
      { id: "m3", title: "الاختبار والتسليم واعتماد الحماية", targetDate: "24/09/2026", completed: true },
    ],
  },
  {
    id: "PROJ-2026-02",
    projectNumber: "PROJ-2026-02",
    name: "منظومة الشركاء وإدارة حصص الأرباح",
    description: "إدارة الشركاء والمساهمات الرأسمالية وتوزيع الأرباح السنوية والمسحوبات.",
    startDate: "25/09/2026",
    endDate: "30/09/2026",
    status: "COMPLETED",
    completionPercentage: 100,
    manager: "بدر عايض زياد",
    milestones: [
      { id: "m4", title: "تصميم شاشات الشركاء والقيود المحاسبية", targetDate: "25/09/2026", completed: true },
      { id: "m5", title: "الربط مع دليل الحسابات وقائمة المركز المالي", targetDate: "28/09/2026", completed: true },
      { id: "m6", title: "إصدار تقارير الأرباح الموزعة", targetDate: "30/09/2026", completed: true },
    ],
  },
  {
    id: "PROJ-2026-03",
    projectNumber: "PROJ-2026-03",
    name: "وحدة محاسبة التكاليف المتقدمة (Cost Accounting)",
    description: "تطبيق التكاليف المعيارية وتكاليف الأوامر والمراكز التشغيلية ونظام ABC.",
    startDate: "01/10/2026",
    endDate: "10/10/2026",
    status: "ACTIVE",
    completionPercentage: 90,
    manager: "بدر عايض زياد",
    milestones: [
      { id: "m7", title: "إنشاء شاشات مراكز التكلفة والأنشطة", targetDate: "03/10/2026", completed: true },
      { id: "m8", title: "تطوير معادلات Job Costing وتكلفة العمليات", targetDate: "06/10/2026", completed: true },
      { id: "m9", title: "الربط مع القيود اليومية والمخزون", targetDate: "10/10/2026", completed: true },
    ],
  },
];

const initialConversations: TenantConversation[] = [
  {
    id: "CONV-01",
    tenantId: "ibrahim-kurah",
    tenantName: "شركة إبراهيم كراع للتجارة",
    contactPerson: "إبراهيم كراع",
    phone: "+967 777 123 456",
    email: "ibrahim@ibrahim-kurah.cloud",
    status: "ONLINE",
    unreadCount: 1,
    lastMessage: "السلام عليكم أ. بدر، ننتظر اعتماد الحساب للبدء في إدخال المخزون.",
    lastMessageTime: "منذ 10 دقائق",
    messages: [
      {
        id: "m1",
        sender: "CLIENT",
        senderName: "إبراهيم كراع",
        text: "السلام عليكم أ. بدر، قمنا بالتسجيل الذاتي وأرسلنا السجل التجاري.",
        timestamp: "22/09/2026 11:20 ص",
      },
      {
        id: "m2",
        sender: "ADMIN",
        senderName: "بدر (مدير المنصة)",
        text: "أهلاً بك أخي إبراهيم، طلبك قيد المراجعة وسيتم تفعيل الباقة وروابط الصلاحيات قريباً.",
        timestamp: "22/09/2026 11:35 ص",
      },
      {
        id: "m3",
        sender: "CLIENT",
        senderName: "إبراهيم كراع",
        text: "السلام عليكم أ. بدر، ننتظر اعتماد الحساب للبدء في إدخال المخزون.",
        timestamp: "22/09/2026 01:10 م",
      },
    ],
  },
  {
    id: "CONV-02",
    tenantId: "alamal-modern",
    tenantName: "مؤسسة الأمل الحديثة للمقاولات",
    contactPerson: "أحمد العبسي",
    phone: "+967 733 987 654",
    email: "manager@alamal-modern.cloud",
    status: "ONLINE",
    unreadCount: 0,
    lastMessage: "شكراً جزيلاً لكم على سرعة التفعيل والدعم الفني المتميز.",
    lastMessageTime: "منذ ساعة",
    messages: [
      {
        id: "m4",
        sender: "CLIENT",
        senderName: "أحمد العبسي",
        text: "شكراً جزيلاً لكم على سرعة التفعيل والدعم الفني المتميز.",
        timestamp: "22/09/2026 12:00 م",
      },
    ],
  },
  {
    id: "CONV-03",
    tenantId: "binziyad",
    tenantName: "مجموعة بن زياد التجارية المحدودة",
    contactPerson: "فريق الإدارة المالية",
    phone: "+967 773 586 047",
    email: "manager@binziyad.cloud",
    status: "ONLINE",
    unreadCount: 0,
    lastMessage: "تم إقفال القيود اليومية بنجاح ومطابقة الأرصدة البنكية.",
    lastMessageTime: "منذ ساعتين",
    messages: [
      {
        id: "m5",
        sender: "CLIENT",
        senderName: "محاسب بن زياد",
        text: "تم إقفال القيود اليومية بنجاح ومطابقة الأرصدة البنكية.",
        timestamp: "22/09/2026 10:45 ص",
      },
    ],
  },
];

export const MasterTasksService = {
  getTasks: (): MasterTask[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TASKS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return initialTasks;
  },

  saveTasks: (tasks: MasterTask[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (e) {}
  },

  addTask: (taskData: Omit<MasterTask, "id" | "taskNumber" | "createdAt" | "comments">) => {
    const list = MasterTasksService.getTasks();
    const count = list.length + 1;
    const newTask: MasterTask = {
      ...taskData,
      id: `TASK-2026-00${count < 10 ? "0" + count : count}`,
      taskNumber: `TASK-2026-00${count < 10 ? "0" + count : count}`,
      createdAt: new Date().toLocaleDateString("ar-SA"),
      comments: [],
    };
    list.unshift(newTask);
    MasterTasksService.saveTasks(list);
    return newTask;
  },

  updateTaskStatus: (
    taskId: string,
    status: MasterTask["status"],
    completionPercentage?: number
  ) => {
    const list = MasterTasksService.getTasks();
    const updated = list.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status,
          completionPercentage:
            completionPercentage !== undefined
              ? completionPercentage
              : status === "COMPLETED"
              ? 100
              : t.completionPercentage,
        };
      }
      return t;
    });
    MasterTasksService.saveTasks(updated);
    return updated;
  },

  addComment: (taskId: string, author: string, text: string) => {
    const list = MasterTasksService.getTasks();
    const updated = list.map((t) => {
      if (t.id === taskId) {
        const newComment = {
          id: `c-${Date.now()}`,
          author,
          avatar: author.slice(0, 2),
          text,
          timestamp: new Date().toLocaleString("ar-SA"),
        };
        return {
          ...t,
          comments: [...t.comments, newComment],
        };
      }
      return t;
    });
    MasterTasksService.saveTasks(updated);
    return updated;
  },

  deleteTask: (taskId: string) => {
    const list = MasterTasksService.getTasks();
    const filtered = list.filter((t) => t.id !== taskId);
    MasterTasksService.saveTasks(filtered);
    return filtered;
  },

  getProjects: (): MasterProject[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return initialProjects;
  },

  saveProjects: (projects: MasterProject[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch (e) {}
  },

  getConversations: (): TenantConversation[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return initialConversations;
  },

  saveConversations: (convs: TenantConversation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(convs));
    } catch (e) {}
  },

  sendMessage: (convId: string, text: string) => {
    const list = MasterTasksService.getConversations();
    const updated = list.map((c) => {
      if (c.id === convId) {
        const msg = {
          id: `m-${Date.now()}`,
          sender: "ADMIN" as const,
          senderName: "بدر (مدير المنصة)",
          text,
          timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
        };
        return {
          ...c,
          lastMessage: text,
          lastMessageTime: "الآن",
          messages: [...c.messages, msg],
        };
      }
      return c;
    });
    MasterTasksService.saveConversations(updated);
    return updated;
  },
};
