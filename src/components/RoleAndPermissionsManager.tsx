import React, { useState } from "react";
import {
  ShieldCheck,
  Users,
  Lock,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Key,
  Shield,
  UserCheck,
  Building,
  Mail,
  Phone,
  Search,
  Check,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Eye,
  Sliders,
  ChevronRight,
  UserPlus,
  X,
} from "lucide-react";
import { ERPRole, ERPRolePermission, ERPUser } from "../types/erp";
import { ALL_SYSTEM_PERMISSIONS, INITIAL_ROLES } from "../data/initialERPData";

interface RoleAndPermissionsManagerProps {
  roles: ERPRole[];
  usersList: ERPUser[];
  currentUser: ERPUser;
  onUpdateRoles: (updatedRoles: ERPRole[]) => void;
  onUpdateUsersList: (updatedUsers: ERPUser[]) => void;
  onSwitchUser: (user: ERPUser) => void;
}

export const RoleAndPermissionsManager: React.FC<RoleAndPermissionsManagerProps> = ({
  roles,
  usersList,
  currentUser,
  onUpdateRoles,
  onUpdateUsersList,
  onSwitchUser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"MATRIX" | "USERS" | "SIMULATOR">("MATRIX");

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Role Form Modal (Add / Edit Custom Role)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<ERPRole | null>(null);
  const [roleFormData, setRoleFormData] = useState<Partial<ERPRole>>({
    code: "",
    nameAr: "",
    nameEn: "",
    descriptionAr: "",
    permissions: [],
    color: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  });

  // User Form Modal (Add / Edit User)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ERPUser | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<ERPUser>>({
    name: "",
    role: "CASHIER",
    roleId: "role-cashier",
    branch: "المركز الرئيسي - صنعاء",
    avatar: "US",
    status: "ACTIVE",
    email: "",
    phone: "",
    customPermissions: [],
  });

  // Simulator Selected User
  const [selectedSimulatorUser, setSelectedSimulatorUser] = useState<ERPUser>(currentUser);

  // Group permissions by category
  const categories = Array.from(new Set(ALL_SYSTEM_PERMISSIONS.map((p) => p.categoryAr)));

  // Helper to check if role has permission
  const hasPermission = (role: ERPRole, permId: string) => {
    if (role.code === "SYSTEM_ADMIN") return true;
    return role.permissions.includes(permId);
  };

  // Toggle permission for a role
  const handleToggleRolePermission = (roleId: string, permId: string) => {
    const updated = roles.map((r) => {
      if (r.id === roleId) {
        if (r.code === "SYSTEM_ADMIN") return r; // Cannot modify admin
        const exists = r.permissions.includes(permId);
        const newPerms = exists
          ? r.permissions.filter((p) => p !== permId)
          : [...r.permissions, permId];
        return { ...r, permissions: newPerms };
      }
      return r;
    });
    onUpdateRoles(updated);
  };

  // Open Create Role Modal
  const handleOpenAddRole = () => {
    setEditingRole(null);
    setRoleFormData({
      code: `ROLE_CUSTOM_${Date.now().toString().slice(-4)}`,
      nameAr: "",
      nameEn: "",
      descriptionAr: "",
      permissions: [],
      color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    });
    setIsRoleModalOpen(true);
  };

  // Open Edit Role Modal
  const handleOpenEditRole = (role: ERPRole) => {
    setEditingRole(role);
    setRoleFormData({ ...role });
    setIsRoleModalOpen(true);
  };

  // Save Role
  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormData.nameAr) {
      alert("يرجى إدخال مسمى الدور الوظيفي بالعربية");
      return;
    }

    if (editingRole) {
      const updated = roles.map((r) => (r.id === editingRole.id ? ({ ...r, ...roleFormData } as ERPRole) : r));
      onUpdateRoles(updated);
    } else {
      const newRole: ERPRole = {
        id: `role-${Date.now()}`,
        code: roleFormData.code || `ROLE_${Date.now()}`,
        nameAr: roleFormData.nameAr || "دور مخصص",
        nameEn: roleFormData.nameEn || "Custom Role",
        descriptionAr: roleFormData.descriptionAr || "دور مخصص جديد من إعداد مدير النظام",
        permissions: roleFormData.permissions || [],
        isSystemRole: false,
        color: roleFormData.color || "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
      };
      onUpdateRoles([...roles, newRole]);
    }

    setIsRoleModalOpen(false);
  };

  // Delete Custom Role
  const handleDeleteRole = (roleId: string) => {
    const target = roles.find((r) => r.id === roleId);
    if (target?.isSystemRole) {
      alert("لا يمكن حذف الأدوار القياسية الأساسية التابعة للنظام");
      return;
    }

    if (confirm("هل أنت تأكد من حذف هذا الدور المخصص؟ سيتم إعادة توجيه المستخدمين المرتبطين به")) {
      onUpdateRoles(roles.filter((r) => r.id !== roleId));
    }
  };

  // Save User (Add / Edit)
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name) {
      alert("يرجى إدخال اسم المستخدم");
      return;
    }

    const selectedRole = roles.find((r) => r.id === userFormData.roleId || r.code === userFormData.role);
    const roleCode = selectedRole ? selectedRole.code : userFormData.role || "CASHIER";

    if (editingUser) {
      const updated = usersList.map((u) =>
        u.id === editingUser.id
          ? ({ ...u, ...userFormData, role: roleCode, roleId: selectedRole?.id } as ERPUser)
          : u
      );
      onUpdateUsersList(updated);
    } else {
      const initials = userFormData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      const newUser: ERPUser = {
        id: `usr-${Date.now()}`,
        name: userFormData.name,
        role: roleCode,
        roleId: selectedRole?.id || "role-cashier",
        branch: userFormData.branch || "المركز الرئيسي - صنعاء",
        avatar: initials || "US",
        status: userFormData.status || "ACTIVE",
        email: userFormData.email || "",
        phone: userFormData.phone || "",
        customPermissions: userFormData.customPermissions || [],
      };
      onUpdateUsersList([...usersList, newUser]);
    }

    setIsUserModalOpen(false);
  };

  // Toggle user active status
  const handleToggleUserStatus = (user: ERPUser) => {
    const nextStatus: "ACTIVE" | "INACTIVE" = user.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";
    const updated = usersList.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u));
    onUpdateUsersList(updated);
  };

  // Calculate user effective permissions (Role Perms + Custom Perms)
  const getUserEffectivePermissions = (user: ERPUser) => {
    const userRole = roles.find((r) => r.code === user.role || r.id === user.roleId);
    if (!userRole) return [];
    if (userRole.code === "SYSTEM_ADMIN") return ALL_SYSTEM_PERMISSIONS.map((p) => p.id);

    const basePerms = userRole.permissions || [];
    const customPerms = user.customPermissions || [];
    return Array.from(new Set([...basePerms, ...customPerms]));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>إدارة الصلاحيات والأدوار المحاسبية الشاملة (RBAC)</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SAP Security Matrix Standard
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              مصفوفة التحكم في الوصول، ربط المستخدمين بالأدوار، والصلاحيات الاستثنائية المحاسبية.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddRole}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-900/40"
          >
            <Plus className="w-4 h-4" />
            <span>+ دور مخصص جديد</span>
          </button>
          <button
            onClick={() => {
              setEditingUser(null);
              setUserFormData({
                name: "",
                role: "CASHIER",
                roleId: "role-cashier",
                branch: "المركز الرئيسي - صنعاء",
                avatar: "US",
                status: "ACTIVE",
                email: "",
                phone: "",
                customPermissions: [],
              });
              setIsUserModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-900/40"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ مستخدم جديد</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab("MATRIX")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeSubTab === "MATRIX"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
              : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>1. مصفوفة التخويل والأدوار ({roles.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("USERS")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeSubTab === "USERS"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
              : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>2. كشف المستخدمين وربط الحسابات ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("SIMULATOR")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeSubTab === "SIMULATOR"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
              : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>3. محاكي وتدقيق التخويل المباشر</span>
        </button>
      </div>

      {/* ---------------- SUB-TAB 1: PERMISSIONS MATRIX (مصفوفة التخويل) ---------------- */}
      {activeSubTab === "MATRIX" && (
        <div className="space-y-6">
          {/* Roles Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((r) => {
              const assignedCount = usersList.filter((u) => u.role === r.code || u.roleId === r.id).length;
              return (
                <div
                  key={r.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 relative overflow-hidden hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded text-[11px] font-bold border ${r.color || "bg-slate-800 text-slate-300"}`}>
                      {r.nameAr}
                    </span>
                    <div className="flex items-center gap-1">
                      {!r.isSystemRole && (
                        <>
                          <button
                            onClick={() => handleOpenEditRole(r)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            title="تعديل الدور"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(r.id)}
                            className="p-1 rounded text-rose-400 hover:bg-rose-950"
                            title="حذف الدور"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">{r.descriptionAr}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                    <span className="text-slate-400">المستخدمين المرتبطين:</span>
                    <span className="font-bold text-white font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {assignedCount} مستخدم
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Permissions Matrix Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-400" />
                  مصفوفة الصلاحيات والتخويل التفصيلية
                </h3>
                <p className="text-xs text-slate-400">انقر على الخانة لتغيير وتحديث صلاحية الدور فوراً</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase text-[11px]">
                    <th className="px-4 py-4 min-w-[240px]">الصلاحية والوصف</th>
                    {roles.map((r) => (
                      <th key={r.id} className="px-3 py-4 text-center min-w-[120px]">
                        <div className="font-bold text-white text-[11px]">{r.nameAr.split("(")[0]}</div>
                        <div className="text-[9px] font-mono text-slate-400">{r.code}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {categories.map((cat) => {
                    const catPerms = ALL_SYSTEM_PERMISSIONS.filter((p) => p.categoryAr === cat);
                    return (
                      <React.Fragment key={cat}>
                        <tr className="bg-slate-950/80 text-purple-300 font-bold text-xs border-y border-purple-500/20">
                          <td colSpan={roles.length + 1} className="px-4 py-2.5">
                            ⚡ {cat}
                          </td>
                        </tr>

                        {catPerms.map((perm) => (
                          <tr key={perm.id} className="hover:bg-slate-800/40 transition">
                            <td className="px-4 py-3">
                              <div className="font-bold text-white">{perm.nameAr}</div>
                              <div className="text-[10px] text-slate-400">{perm.descriptionAr}</div>
                            </td>

                            {roles.map((r) => {
                              const allowed = hasPermission(r, perm.id);
                              const isAdmin = r.code === "SYSTEM_ADMIN";

                              return (
                                <td key={r.id} className="px-3 py-3 text-center">
                                  <button
                                    disabled={isAdmin}
                                    onClick={() => handleToggleRolePermission(r.id, perm.id)}
                                    className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition ${
                                      allowed
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                                        : "bg-slate-800/60 text-slate-600 border border-slate-800 hover:bg-slate-800 hover:text-slate-400"
                                    } ${isAdmin ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
                                  >
                                    {allowed ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 2: USERS & ACCESS LIST (كشف المستخدمين) ---------------- */}
      {activeSubTab === "USERS" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث عن مستخدم بالاسم أو الفرع..."
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pr-9 pl-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="text-xs text-slate-400 font-semibold">
              إجمالي المستخدمين المسجلين بالنظام: <span className="text-white font-bold">{usersList.length} مستخدم</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase text-[11px]">
                    <th className="px-4 py-3.5">المستخدم والفرع</th>
                    <th className="px-4 py-3.5">الدور المحاسبي المسند</th>
                    <th className="px-4 py-3.5">عدد الصلاحيات المتاحة</th>
                    <th className="px-4 py-3.5">حالة الحساب والجلسة</th>
                    <th className="px-4 py-3.5 text-center">التبديل والتعديل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {usersList
                    .filter(
                      (u) =>
                        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.branch.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((user) => {
                      const isCurrent = currentUser.id === user.id || currentUser.name === user.name;
                      const userRoleObj = roles.find((r) => r.code === user.role || r.id === user.roleId);
                      const effectivePermsCount = getUserEffectivePermissions(user).length;

                      return (
                        <tr key={user.id} className="hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                                {user.avatar}
                              </div>
                              <div>
                                <div className="font-bold text-white text-sm flex items-center gap-2">
                                  <span>{user.name}</span>
                                  {isCurrent && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                      جلسة نشطة ⚡
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400">{user.branch}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-block px-2.5 py-1 rounded border text-[11px] font-bold ${
                                userRoleObj?.color || "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {userRoleObj?.nameAr || user.role}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 font-mono font-bold text-indigo-400">
                            {effectivePermsCount} من أصل {ALL_SYSTEM_PERMISSIONS.length} صلاحية
                          </td>

                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => handleToggleUserStatus(user)}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
                                user.status === "INACTIVE"
                                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              }`}
                            >
                              {user.status === "INACTIVE" ? "موقّـف 🛑" : "نشط 🟢"}
                            </button>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {!isCurrent && (
                                <button
                                  onClick={() => onSwitchUser(user)}
                                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
                                >
                                  دخول بهذه الهوية
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingUser(user);
                                  setUserFormData({ ...user });
                                  setIsUserModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                title="تعديل بيانات الحساب والارتباط"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 3: PERMISSION SIMULATOR (محاكي وتدقيق التخويل) ---------------- */}
      {activeSubTab === "SIMULATOR" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">اختبار ومحاكاة التخويل الفعلي للمستخدمين</h3>
                <p className="text-xs text-slate-400">اختر أي مستخدم لمطابقة واختبار صلاحيات الوصول الخاصة به على كافة أقسام ERP</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-300 font-bold">المستخدم المستهدف بالتدقيق:</label>
              <select
                value={selectedSimulatorUser.id}
                onChange={(e) => {
                  const found = usersList.find((u) => u.id === e.target.value);
                  if (found) setSelectedSimulatorUser(found);
                }}
                className="bg-slate-950 border border-slate-800 text-white text-xs font-bold rounded-xl px-3 py-2 focus:border-emerald-500"
              >
                {usersList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Simulator Grid Result */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const catPerms = ALL_SYSTEM_PERMISSIONS.filter((p) => p.categoryAr === cat);
              const userPerms = getUserEffectivePermissions(selectedSimulatorUser);

              return (
                <div key={cat} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-purple-300 border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span>⚡ {cat}</span>
                  </h4>

                  <div className="space-y-2">
                    {catPerms.map((perm) => {
                      const isAllowed = userPerms.includes(perm.id);

                      return (
                        <div
                          key={perm.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                            isAllowed
                              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                              : "bg-slate-950/50 border-slate-800/80 text-slate-500"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isAllowed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Lock className="w-4 h-4 text-rose-500/70 shrink-0" />
                            )}
                            <div>
                              <div className="text-xs font-bold text-white">{perm.nameAr}</div>
                              <div className="text-[10px] text-slate-400">{perm.descriptionAr}</div>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isAllowed
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {isAllowed ? "مسموح ✅" : "محظور 🔒"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Role Add/Edit Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingRole ? "تعديل الدور المحاسبي المخصص" : "إضافة دور وظيفي مخصص جديد"}
              </h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">اسم الدور بالعربية:</label>
                <input
                  type="text"
                  value={roleFormData.nameAr}
                  onChange={(e) => setRoleFormData({ ...roleFormData, nameAr: e.target.value })}
                  placeholder="مثال: مشرف المبيعات والصناديق الفرعية"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">اسم الدور بالإنجليزية (اختياري):</label>
                <input
                  type="text"
                  value={roleFormData.nameEn}
                  onChange={(e) => setRoleFormData({ ...roleFormData, nameEn: e.target.value })}
                  placeholder="e.g. Sales Supervisor"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">وصف الدور والمسؤوليات:</label>
                <textarea
                  rows={3}
                  value={roleFormData.descriptionAr}
                  onChange={(e) => setRoleFormData({ ...roleFormData, descriptionAr: e.target.value })}
                  placeholder="اكتب وصفاً مختصراً لصلاحيات هذا الدور..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 shadow-lg"
                >
                  حفظ الدور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Add/Edit Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingUser ? "تعديل بيانات ورتبة المستخدم" : "إضافة مستخدم جديد للنظام"}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">اسم المستخدم الكامل:</label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="مثال: أ. سالم احمد المحضار"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-blue-500 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الدور الوظيفي:</label>
                  <select
                    value={userFormData.roleId || userFormData.role}
                    onChange={(e) => {
                      const selectedRole = roles.find((r) => r.id === e.target.value || r.code === e.target.value);
                      setUserFormData({
                        ...userFormData,
                        roleId: selectedRole?.id,
                        role: selectedRole?.code || e.target.value,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-blue-500 font-bold"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الفرع المسند إليه:</label>
                  <input
                    type="text"
                    value={userFormData.branch}
                    onChange={(e) => setUserFormData({ ...userFormData, branch: e.target.value })}
                    placeholder="مثال: فرع صنعاء - حدة"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">البريد الإلكتروني:</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="user@company.com"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">رقم الهاتف:</label>
                  <input
                    type="text"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    placeholder="+967 770 000 000"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">حالة الحساب:</label>
                <select
                  value={userFormData.status}
                  onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-blue-500 font-bold"
                >
                  <option value="ACTIVE">نشط ومفعل 🟢</option>
                  <option value="INACTIVE">موقّـف ومحظر 🔴</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg"
                >
                  حفظ الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
