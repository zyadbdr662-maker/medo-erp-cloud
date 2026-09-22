export interface RegistrationRequest {
  id: string;
  requestNumber: string;
  companyNameAr: string;
  companyNameEn: string;
  crNumber: string;
  taxNumber: string;
  phone: string;
  email: string;
  address: string;
  activity: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  source: "self_registration" | "admin_created" | "referral";
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  ipAddress: string;
  device: string;
  location: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
  assignedTier?: string;
  trialDays?: number;
}

export interface ActiveSessionItem {
  id: string;
  tenantName: string;
  tenantId: string;
  role: string;
  userEmail: string;
  loginTime: string;
  lastActivity: string;
  ipAddress: string;
  device: string;
  location: string;
  status: "ACTIVE" | "COMPLETED" | "LOCKED";
  source: "admin_created" | "self_registration";
}

const STORAGE_KEY_REQUESTS = "medo_erp_registration_requests_v1";
const STORAGE_KEY_SESSIONS = "medo_erp_active_sessions_v1";

const defaultRequests: RegistrationRequest[] = [
  {
    id: "REQ-2026-001",
    requestNumber: "REQ-2026-001",
    companyNameAr: "شركة إبراهيم كراع للتجارة والاستيراد",
    companyNameEn: "Ibrahim Kara Trading",
    crNumber: "CR-2026-88912",
    taxNumber: "300987654300003",
    phone: "+967 777 123 456",
    email: "ibrahim@ibrahim-kurah.cloud",
    address: "صنعاء - شارع حدة التجاري",
    activity: "تجارة عامة واستيراد وتصدير",
    contactName: "إبراهيم كراع",
    contactEmail: "ibrahim@ibrahim-kurah.cloud",
    contactPhone: "+967 777 123 456",
    source: "self_registration",
    status: "PENDING",
    ipAddress: "192.168.1.104",
    device: "Chrome / Windows 11",
    location: "صنعاء، اليمن",
    createdAt: "22/09/2026 14:30",
  },
  {
    id: "REQ-2026-002",
    requestNumber: "REQ-2026-002",
    companyNameAr: "مؤسسة الأمل الحديثة للمقاولات",
    companyNameEn: "Al-Amal Modern Contracting",
    crNumber: "CR-2026-44210",
    taxNumber: "300112233400003",
    phone: "+967 733 987 654",
    email: "manager@alamal-modern.cloud",
    address: "عدن - المعلا",
    activity: "مقاولات وإنشاءات واستثمار عقاري",
    contactName: "أحمد العبسي",
    contactEmail: "manager@alamal-modern.cloud",
    contactPhone: "+967 733 987 654",
    source: "self_registration",
    status: "PENDING",
    ipAddress: "10.0.4.15",
    device: "Safari / macOS",
    location: "عدن، اليمن",
    createdAt: "22/09/2026 11:15",
  },
  {
    id: "REQ-2026-003",
    requestNumber: "REQ-2026-003",
    companyNameAr: "مجموعة النور الجديد للأدوية",
    companyNameEn: "Al-Noor Pharmaceuticals",
    crNumber: "CR-2026-11029",
    taxNumber: "300554433200003",
    phone: "+967 711 555 888",
    email: "info@alnoor-pharma.cloud",
    address: "تعز - جحملة",
    activity: "صيدليات ومستلزمات طبية وأدوية",
    contactName: "محمد الشميري",
    contactEmail: "info@alnoor-pharma.cloud",
    contactPhone: "+967 711 555 888",
    source: "self_registration",
    status: "APPROVED",
    ipAddress: "192.168.1.88",
    device: "Firefox / Android",
    location: "تعز، اليمن",
    createdAt: "21/09/2026 09:00",
    processedAt: "21/09/2026 10:30",
    processedBy: "بدر (مدير النظام)",
    assignedTier: "الأساسية (150,000 ريال)",
    trialDays: 30,
  },
  {
    id: "REQ-2026-004",
    requestNumber: "REQ-2026-004",
    companyNameAr: "شركة الوفاء السريع للتوصيل",
    companyNameEn: "Al-Wafaa Express Delivery",
    crNumber: "CR-2026-99011",
    taxNumber: "300998877600003",
    phone: "+967 700 111 222",
    email: "contact@alwafaa-express.cloud",
    address: "الحديدة - الشارع العام",
    activity: "خدمات لوجستية ونقل وتخليص",
    contactName: "خالد الريمي",
    contactEmail: "contact@alwafaa-express.cloud",
    contactPhone: "+967 700 111 222",
    source: "self_registration",
    status: "REJECTED",
    rejectionReason: "السجل التجاري غير مطابق للبيانات المدخلة أو منتهي الصلاحية.",
    ipAddress: "192.168.2.10",
    device: "Chrome / Windows",
    location: "الحديدة، اليمن",
    createdAt: "20/09/2026 16:45",
    processedAt: "20/09/2026 18:00",
    processedBy: "بدر (مدير النظام)",
  },
];

const defaultActiveSessions: ActiveSessionItem[] = [
  {
    id: "SESS-101",
    tenantName: "مجموعة بن زياد التجارية",
    tenantId: "binziyad",
    role: "MANAGER",
    userEmail: "manager@binziyad.cloud",
    loginTime: "06:00 ص",
    lastActivity: "منذ دقيقة",
    ipAddress: "192.168.1.55",
    device: "Chrome / Windows 11",
    location: "صنعاء، اليمن",
    status: "ACTIVE",
    source: "admin_created",
  },
  {
    id: "SESS-102",
    tenantName: "مجموعة النور الجديد للأدوية",
    tenantId: "alnoor",
    role: "MANAGER",
    userEmail: "info@alnoor-pharma.cloud",
    loginTime: "05:30 ص",
    lastActivity: "منذ 4 دقائق",
    ipAddress: "192.168.1.88",
    device: "Firefox / Android",
    location: "تعز، اليمن",
    status: "ACTIVE",
    source: "self_registration",
  },
  {
    id: "SESS-103",
    tenantName: "الزرقاء النبيلة (ش.م.ي)",
    tenantId: "alzarqa",
    role: "ACCOUNTANT",
    userEmail: "accountant@alzarqa.cloud",
    loginTime: "04:15 ص",
    lastActivity: "منذ 12 دقيقة",
    ipAddress: "10.0.4.12",
    device: "Safari / macOS",
    location: "عدن، اليمن",
    status: "ACTIVE",
    source: "admin_created",
  },
];

export const RegistrationRequestsService = {
  getRequests: (): RegistrationRequest[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return defaultRequests;
  },

  saveRequests: (reqs: RegistrationRequest[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(reqs));
    } catch (e) {}
  },

  addRequest: (newReq: Omit<RegistrationRequest, "id" | "requestNumber" | "createdAt" | "status">) => {
    const list = RegistrationRequestsService.getRequests();
    const idNum = list.length + 1;
    const item: RegistrationRequest = {
      ...newReq,
      id: `REQ-2026-00${idNum}`,
      requestNumber: `REQ-2026-00${idNum}`,
      createdAt: new Date().toLocaleString("ar-SA"),
      status: "PENDING",
    };
    list.unshift(item);
    RegistrationRequestsService.saveRequests(list);
    return item;
  },

  updateStatus: (id: string, status: "APPROVED" | "REJECTED", reason?: string, tier?: string, days?: number) => {
    const list = RegistrationRequestsService.getRequests();
    const updated = list.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status,
          rejectionReason: reason,
          assignedTier: tier,
          trialDays: days,
          processedAt: new Date().toLocaleString("ar-SA"),
          processedBy: "بدر (مدير النظام الأعلى)",
        };
      }
      return r;
    });
    RegistrationRequestsService.saveRequests(updated);
    return updated;
  },

  deleteRequest: (id: string) => {
    const list = RegistrationRequestsService.getRequests();
    const filtered = list.filter((r) => r.id !== id);
    RegistrationRequestsService.saveRequests(filtered);
    return filtered;
  },

  getActiveSessions: (): ActiveSessionItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return defaultActiveSessions;
  },

  saveActiveSessions: (sessions: ActiveSessionItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch (e) {}
  },

  terminateSession: (sessionId: string) => {
    const list = RegistrationRequestsService.getActiveSessions();
    const updated = list.filter((s) => s.id !== sessionId);
    RegistrationRequestsService.saveActiveSessions(updated);
    return updated;
  }
};
