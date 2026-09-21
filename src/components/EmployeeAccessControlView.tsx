import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  UserX,
  UserCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Search,
  Filter,
  Eye,
  KeyRound,
  Sparkles,
  Smartphone,
  Fingerprint,
  Check,
  Sliders,
  Save,
} from "lucide-react";
import {
  cloudSecurityService,
  EmployeeAccessLicense,
} from "../services/cloudSecurityService";
import { soundService } from "../services/notificationSoundService";

interface RolePermissionDef {
  id: string;
  roleTitleAr: string;
  roleCode: string;
  department: string;
  permissions: {
    canViewFinancials: boolean;
    canCreateVouchers: boolean;
    canApproveLargeTransactions: boolean;
    canModifyJournalEntries: boolean;
    canManageSecurityAndFirewall: boolean;
    canExecuteKillSwitch: boolean;
    canExportAuditLogs: boolean;
  };
}

const DEFAULT_RBAC_ROLES: RolePermissionDef[] = [
  {
    id: "R-SUPER-ADMIN",
    roleTitleAr: "مدير النظام الأعلى (Super Admin)",
    roleCode: "SUPER_ADMIN",
    department: "الإدارة العليا والأمن السيبراني",
    permissions: {
      canViewFinancials: true,
      canCreateVouchers: true,
      canApproveLargeTransactions: true,
      canModifyJournalEntries: true,
      canManageSecurityAndFirewall: true,
      canExecuteKillSwitch: true,
      canExportAuditLogs: true,
    },
  },
  {
    id: "R-CFO",
    roleTitleAr: "المدير المالي التنفيذي (CFO)",
    roleCode: "CFO",
    department: "الإدارة المالية العليا",
    permissions: {
      canViewFinancials: true,
      canCreateVouchers: true,
      canApproveLargeTransactions: true,
      canModifyJournalEntries: false,
      canManageSecurityAndFirewall: false,
      canExecuteKillSwitch: true,
      canExportAuditLogs: true,
    },
  },
  {
    id: "R-AUDITOR",
    roleTitleAr: "كبير مدققي الحسابات (Senior Auditor)",
    roleCode: "AUDITOR",
    department: "الحوكمة والرقابة والتفتيش",
    permissions: {
      canViewFinancials: true,
      canCreateVouchers: false,
      canApproveLargeTransactions: true,
      canModifyJournalEntries: false,
      canManageSecurityAndFirewall: false,
      canExecuteKillSwitch: false,
      canExportAuditLogs: true,
    },
  },
  {
    id: "R-SENIOR-ACC",
    roleTitleAr: "محاسب عام رئيسي (Chief Accountant)",
    roleCode: "CHIEF_ACCOUNTANT",
    department: "الحسابات العامة والقيود",
    permissions: {
      canViewFinancials: true,
      canCreateVouchers: true,
      canApproveLargeTransactions: false,
      canModifyJournalEntries: true,
      canManageSecurityAndFirewall: false,
      canExecuteKillSwitch: false,
      canExportAuditLogs: false,
    },
  },
  {
    id: "R-CASHIER",
    roleTitleAr: "أمين الصندوق والخزينة (Cash Vault Custodian)",
    roleCode: "CASHIER",
    department: "الخزينة والمقبوضات",
    permissions: {
      canViewFinancials: true,
      canCreateVouchers: true,
      canApproveLargeTransactions: false,
      canModifyJournalEntries: false,
      canManageSecurityAndFirewall: false,
      canExecuteKillSwitch: false,
      canExportAuditLogs: false,
    },
  },
  {
    id: "R-WAREHOUSE",
    roleTitleAr: "مسؤول المخازن والمستودعات (Warehouse Controller)",
    roleCode: "WAREHOUSE_MGR",
    department: "إدارة المخزون والمواد",
    permissions: {
      canViewFinancials: false,
      canCreateVouchers: false,
      canApproveLargeTransactions: false,
      canModifyJournalEntries: false,
      canManageSecurityAndFirewall: false,
      canExecuteKillSwitch: false,
      canExportAuditLogs: false,
    },
  },
];

interface EmployeeAccessControlViewProps {
  currentUserName?: string;
}

export const EmployeeAccessControlView: React.FC<EmployeeAccessControlViewProps> = ({
  currentUserName = "مدير النظام الأعلى",
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"LICENSES_AND_KILL_SWITCH" | "RBAC_ROLE_MATRIX">("LICENSES_AND_KILL_SWITCH");
  const [licenses, setLicenses] = useState<EmployeeAccessLicense[]>(() =>
    cloudSecurityService.getEmployeeLicenses()
  );

  // RBAC Matrix State
  const [roleMatrix, setRoleMatrix] = useState<RolePermissionDef[]>(() => {
    try {
      const saved = localStorage.getItem("medo_erp_rbac_role_matrix_v1");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_RBAC_ROLES;
  });

  // Kill Switch Modal State
  const [targetLicenseToSuspend, setTargetLicenseToSuspend] = useState<EmployeeAccessLicense | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    const unsub = cloudSecurityService.subscribe(() => {
      setLicenses(cloudSecurityService.getEmployeeLicenses());
    });
    return unsub;
  }, []);

  const handleToggleRolePermission = (
    roleId: string,
    permKey: keyof RolePermissionDef["permissions"]
  ) => {
    setRoleMatrix((prev) =>
      prev.map((role) => {
        if (role.id === roleId) {
          return {
            ...role,
            permissions: {
              ...role.permissions,
              [permKey]: !role.permissions[permKey],
            },
          };
        }
        return role;
      })
    );
  };

  const handleSaveRbacMatrix = () => {
    try {
      localStorage.setItem("medo_erp_rbac_role_matrix_v1", JSON.stringify(roleMatrix));
      soundService.playSound("ENTERPRISE_BELL");
      setActionFeedback("✓ تم حفظ واعتماد مصفوفة الصلاحيات والأدوار الوظيفية (RBAC) بنجاح وتطبيقها في إدارة النظام.");
      setTimeout(() => setActionFeedback(null), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerKillSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLicenseToSuspend) return;

    const reason = suspensionReason.trim() || "رصد نشاط أمني مشبوه أو محاولة وصول غير مصرح بها";
    const res = cloudSecurityService.triggerInstantAccountSuspension(
      targetLicenseToSuspend.id,
      reason,
      currentUserName
    );

    if (res.success) {
      setActionFeedback(
        `🚨 تم تجميد وإيقاف حساب الموظف (${targetLicenseToSuspend.employeeName}) فوراً، وتشغيل صافرة الإنذار وإرسال إشعار الواتساب لمدير النظام!`
      );
      setTargetLicenseToSuspend(null);
      setSuspensionReason("");
      setTimeout(() => setActionFeedback(null), 6000);
    }
  };

  const handleReactivateAccount = (licenseId: string, employeeName: string) => {
    const success = cloudSecurityService.reactivateEmployeeAccount(licenseId, currentUserName);
    if (success) {
      setActionFeedback(`تمت إعادة تفعيل حساب الموظف (${employeeName}) واستعادة صلاحياته بنجاح.`);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const filteredLicenses = licenses.filter((lic) => {
    if (statusFilter !== "ALL" && lic.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        lic.employeeName.toLowerCase().includes(q) ||
        lic.email.toLowerCase().includes(q) ||
        lic.role.toLowerCase().includes(q) ||
        lic.branch.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 font-['Alexandria','Cairo',sans-serif] text-right" dir="rtl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-blue-500/30 p-4 sm:p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center text-white shadow-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>التحكم في تراخيص وصول الموظفين والإيقاف الفوري (Kill-Switch)</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
                EMERGENCY GUARDIAN
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              إدارة صلاحيات وتراخيص الوصول حسب الأدوار الوظيفية، مع ميزة التجميد الفوري لأي حساب مشبوه وربطه بالإشعارات اللحظية.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
            الحسابات النشطة: <span className="text-emerald-400 font-bold">{licenses.filter(l => l.status === 'ACTIVE').length}</span> / {licenses.length}
          </div>
        </div>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-blue-500/20 max-w-fit">
        <button
          onClick={() => setActiveSubTab("LICENSES_AND_KILL_SWITCH")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "LICENSES_AND_KILL_SWITCH"
              ? "bg-rose-600 text-white shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UserX className="w-4 h-4" />
          <span>تراخيص الموظفين والإيقاف الفوري (Kill-Switch)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("RBAC_ROLE_MATRIX")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "RBAC_ROLE_MATRIX"
              ? "bg-blue-600 text-white shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>مصفوفة صلاحيات الأدوار الوظيفية (RBAC Matrix)</span>
        </button>
      </div>

      {actionFeedback && (
        <div className="p-4 bg-rose-950/80 border border-rose-500 rounded-2xl text-xs text-rose-200 flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="font-bold leading-relaxed">{actionFeedback}</span>
        </div>
      )}

      {/* SUBTAB 1: LICENSES & KILL SWITCH */}
      {activeSubTab === "LICENSES_AND_KILL_SWITCH" && (
        <>
          {/* Filter and Search */}
          <div className="bg-slate-900/90 border border-blue-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم، البريد، الفرع، أو الدور..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 w-full sm:w-64"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400">الحالة:</span>
          {["ALL", "ACTIVE", "SUSPENDED_SUSPICIOUS", "LOCKED_FAILED_LOGINS"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === st
                  ? "bg-rose-600 text-white shadow"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800"
              }`}
            >
              {st === "ALL"
                ? "الكل"
                : st === "ACTIVE"
                ? "نشط ومصرح ✓"
                : st === "SUSPENDED_SUSPICIOUS"
                ? "موقوف للشبهة ⚠️"
                : "مقفل بعدة محاولات"}
            </button>
          ))}
        </div>
      </div>

      {/* Licenses Table */}
      <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="p-3 font-bold">الموظف والفرع</th>
                <th className="p-3 font-bold">الدور ومستوى الترخيص</th>
                <th className="p-3 font-bold">آخر دخول والجهاز</th>
                <th className="p-3 font-bold">الأنشطة المشبوهة</th>
                <th className="p-3 font-bold">حالة الحساب</th>
                <th className="p-3 font-bold text-center">إجراء الأمان السريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLicenses.map((lic) => {
                const isSuspended = lic.status === "SUSPENDED_SUSPICIOUS" || lic.status === "LOCKED_FAILED_LOGINS";
                return (
                  <tr key={lic.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        <span>{lic.employeeName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{lic.branch} • {lic.email}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-slate-200">{lic.role}</div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800/50">
                        {lic.licenseTier}
                      </span>
                    </td>

                    <td className="p-3 text-slate-300">
                      <div className="font-mono text-[11px] dir-ltr text-right">{lic.lastLoginIp}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Fingerprint className="w-3 h-3 text-slate-400" />
                        <span className="font-mono">{lic.lastDeviceFingerprint}</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className={`font-mono font-bold ${
                        lic.suspiciousActivityCount > 0 ? "text-rose-400" : "text-slate-500"
                      }`}>
                        {lic.suspiciousActivityCount} تنبيهات
                      </span>
                    </td>

                    <td className="p-3">
                      {lic.status === "ACTIVE" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                          نشط ومصرّح ✓
                        </span>
                      )}
                      {lic.status === "SUSPENDED_SUSPICIOUS" && (
                        <div className="space-y-1">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-600/40">
                            موقوف قسراً (Kill-Switch) 🚫
                          </span>
                          {lic.suspendedReason && (
                            <div className="text-[10px] text-rose-300 max-w-xs leading-tight">
                              السبب: {lic.suspendedReason}
                            </div>
                          )}
                        </div>
                      )}
                      {lic.status === "LOCKED_FAILED_LOGINS" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600/40">
                          مقفل مؤقتاً
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      {isSuspended ? (
                        <button
                          onClick={() => handleReactivateAccount(lic.id, lic.employeeName)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 mx-auto cursor-pointer shadow"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>إعادة التفعيل والترخيص</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setTargetLicenseToSuspend(lic)}
                          className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-black transition flex items-center gap-1 mx-auto cursor-pointer shadow-md"
                          title="تفعيل الإيقاف الفوري لسحب الصلاحيات وتجميد الجلسة"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>إيقاف فوري (Kill Switch)</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* SUBTAB 2: RBAC ROLES & PERMISSIONS MATRIX */}
      {activeSubTab === "RBAC_ROLE_MATRIX" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-blue-500/30 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>مصفوفة التحكم الكامل في الصلاحيات بناءً على الأدوار (Role-Based Access Control)</span>
              </h3>
              <p className="text-xs text-slate-400">
                تخصيص حدود الوصول والعمليات المالية والأمنية لكل دور وظيفي في المنشأة لضمان الامتثال وفصل المهام (SoD).
              </p>
            </div>

            <button
              onClick={handleSaveRbacMatrix}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer self-start sm:self-auto"
            >
              <Save className="w-4 h-4" />
              <span>حفظ واعتماد مصفوفة الصلاحيات</span>
            </button>
          </div>

          <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                    <th className="p-3.5 font-bold min-w-[200px]">الدور الوظيفي والقسم</th>
                    <th className="p-3 font-bold text-center">عرض التقارير</th>
                    <th className="p-3 font-bold text-center">إنشاء السندات</th>
                    <th className="p-3 font-bold text-center">اعتماد الحركات الكبرى</th>
                    <th className="p-3 font-bold text-center">تعديل القيود</th>
                    <th className="p-3 font-bold text-center">الأمن وجدار الحماية</th>
                    <th className="p-3 font-bold text-center">الإيقاف الفوري (Kill)</th>
                    <th className="p-3 font-bold text-center">تصدير التدقيق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {roleMatrix.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white flex items-center gap-2">
                          <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                          <span>{role.roleTitleAr}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{role.department}</div>
                      </td>

                      {/* Permission 1: View Financials */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={role.permissions.canViewFinancials}
                          onChange={() => handleToggleRolePermission(role.id, "canViewFinancials")}
                          className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700 cursor-pointer accent-blue-600"
                        />
                      </td>

                      {/* Permission 2: Create Vouchers */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={role.permissions.canCreateVouchers}
                          onChange={() => handleToggleRolePermission(role.id, "canCreateVouchers")}
                          className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700 cursor-pointer accent-blue-600"
                        />
                      </td>

                      {/* Permission 3: Approve Large Transactions */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={role.permissions.canApproveLargeTransactions}
                          onChange={() => handleToggleRolePermission(role.id, "canApproveLargeTransactions")}
                          className="w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-700 cursor-pointer accent-emerald-600"
                        />
                      </td>

                      {/* Permission 4: Modify Journal Entries */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={role.permissions.canModifyJournalEntries}
                          onChange={() => handleToggleRolePermission(role.id, "canModifyJournalEntries")}
                          className="w-4 h-4 rounded text-amber-600 bg-slate-950 border-slate-700 cursor-pointer accent-amber-600"
                        />
                      </td>

                      {/* Permission 5: Security & Firewall */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={role.permissions.canManageSecurityAndFirewall}
                          onChange={() => handleToggleRolePermission(role.id, "canManageSecurityAndFirewall")}
                          className="w-4 h-4 rounded text-purple-600 bg-slate-950 border-slate-700 cursor-pointer accent-purple-600"
                        />
                      </td>

                      {/* Permission 6: Execute Kill Switch */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={role.permissions.canExecuteKillSwitch}
                          onChange={() => handleToggleRolePermission(role.id, "canExecuteKillSwitch")}
                          className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-700 cursor-pointer accent-rose-600"
                        />
                      </td>

                      {/* Permission 7: Export Audit Logs */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={role.permissions.canExportAuditLogs}
                          onChange={() => handleToggleRolePermission(role.id, "canExportAuditLogs")}
                          className="w-4 h-4 rounded text-teal-600 bg-slate-950 border-slate-700 cursor-pointer accent-teal-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Kill Switch Reason Dialog Modal */}
      {targetLicenseToSuspend && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-600/60 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-right" dir="rtl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/40 flex items-center justify-center">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">تأكيد الإيقاف الفوري للحساب (Kill-Switch)</h3>
                <p className="text-xs text-rose-300">سحب تراخيص الموظف وتجميد كافة الجلسات النشطة فوراً</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="text-slate-200 font-bold">الموظف: {targetLicenseToSuspend.employeeName}</div>
              <div className="text-slate-400">الدور: {targetLicenseToSuspend.role} • الفرع: {targetLicenseToSuspend.branch}</div>
            </div>

            <form onSubmit={handleTriggerKillSwitch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  سبب التجميد والإيقاف الأمني:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="مثال: رصد محاولة تنزيل تقارير مالية حساسة من جهاز غير مصرح به خارج الدوام..."
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 leading-relaxed"
                />
              </div>

              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-[11px] text-rose-300 flex items-center gap-2">
                <Smartphone className="w-4 h-4 shrink-0 text-rose-400" />
                <span>سيتم إطلاق صفير الإنذار الصوتي وإرسال إشعار فوري إلى هاتف مدير النظام على واتساب.</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition shadow-lg cursor-pointer"
                >
                  تنفيذ الإيقاف الأمني الفوري 🚨
                </button>
                <button
                  type="button"
                  onClick={() => setTargetLicenseToSuspend(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
