import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Receipt,
  Calendar,
  Clock,
  Briefcase,
  Award,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  Plus,
  Search,
  Building2,
  Printer,
  FileCheck,
  TrendingUp,
  ShieldAlert,
  CreditCard,
  UserCheck,
  CalendarDays,
  FileSpreadsheet,
  Coins,
  ChevronLeft,
  Trash2,
  Edit,
} from "lucide-react";
import {
  HREmployee,
  HRAdministrativeDecision,
  HRAttendanceRecord,
  HRWorkingShift,
  HRMonthlyPayroll,
  HRLoan,
  CurrencyCode,
  CurrencyInfo,
  JournalEntry,
} from "../types/erp";
import { convertCurrency } from "../services/erpStorage";

interface HumanResourcesViewProps {
  employees: HREmployee[];
  decisions: HRAdministrativeDecision[];
  attendanceRecords: HRAttendanceRecord[];
  shifts: HRWorkingShift[];
  payrolls: HRMonthlyPayroll[];
  loans: HRLoan[];
  currencies: CurrencyInfo[];
  displayCurrency: CurrencyCode;
  onUpdateEmployees: (emps: HREmployee[]) => void;
  onUpdateDecisions: (decs: HRAdministrativeDecision[]) => void;
  onUpdateAttendance: (atts: HRAttendanceRecord[]) => void;
  onUpdateShifts: (shifts: HRWorkingShift[]) => void;
  onUpdatePayrolls: (pays: HRMonthlyPayroll[]) => void;
  onUpdateLoans: (loans: HRLoan[]) => void;
  onAddJournalEntry?: (entry: JournalEntry) => void;
}

export const HumanResourcesView: React.FC<HumanResourcesViewProps> = ({
  employees = [],
  decisions = [],
  attendanceRecords = [],
  shifts = [],
  payrolls = [],
  loans = [],
  currencies = [],
  displayCurrency = "YER_SANAA" as CurrencyCode,
  onUpdateEmployees,
  onUpdateDecisions,
  onUpdateAttendance,
  onUpdateShifts,
  onUpdatePayrolls,
  onUpdateLoans,
  onAddJournalEntry,
}) => {
  // Main Sub-Tab State
  const [activeSubTab, setActiveSubTab] = useState<
    "MONTHLY_PAYROLL" | "PERSONNEL_AFFAIRS" | "SALARIES_AND_BONUSES" | "ATTENDANCE_AND_SHIFTS" | "LOANS_AND_ADVANCES"
  >("MONTHLY_PAYROLL");

  // Filter States
  const [selectedPeriod, setSelectedPeriod] = useState<string>("2026-08");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ALL");

  // Modals & Slips State
  const [selectedPaySlip, setSelectedPaySlip] = useState<HRMonthlyPayroll | null>(null);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState<boolean>(false);
  const [showAddDecisionModal, setShowAddDecisionModal] = useState<boolean>(false);
  const [showAddShiftModal, setShowAddShiftModal] = useState<boolean>(false);
  const [showAddAttendanceModal, setShowAddAttendanceModal] = useState<boolean>(false);
  const [showAddLoanModal, setShowAddLoanModal] = useState<boolean>(false);
  const [selectedEmpForSalaryEdit, setSelectedEmpForSalaryEdit] = useState<HREmployee | null>(null);

  // Form States
  const [newEmp, setNewEmp] = useState<Partial<HREmployee>>({
    name: "",
    jobTitle: "",
    department: "الإدارة المالية والحسابات",
    branch: "المركز الرئيسي - صنعاء",
    nationalId: "",
    phone: "",
    email: "",
    status: "ACTIVE",
    contract: {
      type: "FULL_TIME",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "2028-12-31",
      probationMonths: 3,
      status: "ACTIVE",
      terms: "عقد عمل موحد محدد المدة ببنود قانون العمل الشامل.",
    },
    salaryStructure: {
      basicSalary: 350000,
      currency: "YER_SANAA" as CurrencyCode,
      allowances: [],
      bonuses: [],
      deductions: [],
    },
  });

  const [newDecision, setNewDecision] = useState<Partial<HRAdministrativeDecision>>({
    employeeId: "",
    type: "APPOINTMENT",
    title: "",
    date: new Date().toISOString().slice(0, 10),
    effectiveDate: new Date().toISOString().slice(0, 10),
    details: "",
    issuedBy: "إدارة الموارد البشرية",
  });

  const [newShift, setNewShift] = useState<Partial<HRWorkingShift>>({
    name: "دوام الشفت المسائي",
    startTime: "14:00",
    endTime: "22:00",
    graceMinutes: 15,
    workingDaysPerWeek: 6,
    overtimeRate: 1.5,
  });

  const [newAttendance, setNewAttendance] = useState<Partial<HRAttendanceRecord>>({
    employeeId: "",
    date: new Date().toISOString().slice(0, 10),
    shiftName: shifts[0]?.name || "الدوام الإداري الصباحي الرسمي",
    expectedCheckIn: "08:00",
    expectedCheckOut: "16:00",
    actualCheckIn: "08:00",
    actualCheckOut: "16:00",
    status: "PRESENT",
    latenessMinutes: 0,
    overtimeHours: 0,
    notes: "",
  });

  const [newLoan, setNewLoan] = useState<Partial<HRLoan>>({
    employeeId: "",
    amount: 0,
    installmentAmount: 0,
    date: new Date().toISOString().slice(0, 10),
    reason: "",
  });

  // Salary Edit sub-form state
  const [allowanceForm, setAllowanceForm] = useState({ name: "", amount: 0, type: "HOUSING" as const });
  const [bonusForm, setBonusForm] = useState({ name: "", amount: 0, reason: "" });
  const [deductionForm, setDeductionForm] = useState({ name: "", amount: 0, reason: "" });

  // Formatting currency helper
  const fmt = (val: number, curr: CurrencyCode = displayCurrency) => {
    const converted = convertCurrency(val, "YER_SANAA" as CurrencyCode, curr, currencies);
    return new Intl.NumberFormat("ar-YE", { maximumFractionDigits: 0 }).format(converted);
  };

  const getCurrencySymbol = (code: CurrencyCode) => {
    const found = currencies.find((c) => c.code === code);
    return found ? found.symbol : "ر.ي";
  };

  // KPI Metrics
  const totalEmployeesCount = employees.length;
  const activeEmployeesCount = employees.filter((e) => e.status === "ACTIVE").length;
  const totalMonthlyPayrollYER = payrolls
    .filter((p) => p.period === selectedPeriod)
    .reduce((acc, curr) => acc + curr.netSalary, 0);

  const pendingPayrollsCount = payrolls.filter(
    (p) => p.period === selectedPeriod && p.status === "DRAFT"
  ).length;

  // Handler for Generating Monthly Payroll for period
  const handleGeneratePayrollForPeriod = () => {
    const existingForPeriod = payrolls.filter((p) => p.period === selectedPeriod);
    const newPayrolls: HRMonthlyPayroll[] = [...payrolls];

    employees.forEach((emp) => {
      // Check if already generated for this period
      const exists = existingForPeriod.some((p) => p.employeeId === emp.id);
      if (!exists) {
        const basic = emp.salaryStructure.basicSalary;
        const totalAllow = emp.salaryStructure.allowances.reduce((a, b) => a + b.amount, 0);
        const totalBon = emp.salaryStructure.bonuses.reduce((a, b) => a + b.amount, 0);
        const totalDed = emp.salaryStructure.deductions.reduce((a, b) => a + b.amount, 0);

        // Calculate lateness from attendance
        const empAtt = attendanceRecords.filter(
          (a) => a.employeeId === emp.id && a.date.startsWith(selectedPeriod)
        );
        const totalLatenessMins = empAtt.reduce((acc, cur) => acc + cur.latenessMinutes, 0);
        // 1 hour lateness = approx (basic / 160)
        const latenessDeduction = Math.round((totalLatenessMins / 60) * (basic / 160));

        // Deduct active loans
        const empLoans = loans.filter((l) => l.employeeId === emp.id && l.status === "ACTIVE");
        const loansDeduction = empLoans.reduce((sum, l) => sum + Math.min(l.installmentAmount, l.remainingAmount), 0);

        const net = basic + totalAllow + totalBon - totalDed - latenessDeduction - loansDeduction;

        newPayrolls.push({
          id: `pay-${selectedPeriod}-${emp.id}`,
          period: selectedPeriod,
          employeeId: emp.id,
          employeeName: emp.name,
          jobTitle: emp.jobTitle,
          department: emp.department,
          basicSalary: basic,
          totalAllowances: totalAllow,
          totalBonuses: totalBon,
          latenessDeductions: latenessDeduction,
          otherDeductions: totalDed,
          loansDeduction: loansDeduction,
          netSalary: Math.max(0, net),
          currency: emp.salaryStructure.currency,
          status: "DRAFT",
        });
      }
    });

    onUpdatePayrolls(newPayrolls);
  };

  // Handler to approve and post payroll
  const handleApprovePayrollPeriod = () => {
    const updatedPayrolls = payrolls.map((p) =>
      p.period === selectedPeriod ? { ...p, status: "APPROVED" as const } : p
    );
    onUpdatePayrolls(updatedPayrolls);

    // Update loans remaining amounts
    const currentPeriodPayrolls = updatedPayrolls.filter(p => p.period === selectedPeriod);
    let updatedLoans = [...loans];
    
    currentPeriodPayrolls.forEach(payroll => {
      if (payroll.loansDeduction && payroll.loansDeduction > 0) {
        let remainingToDeduct = payroll.loansDeduction;
        updatedLoans = updatedLoans.map(loan => {
          if (loan.employeeId === payroll.employeeId && loan.status === "ACTIVE" && remainingToDeduct > 0) {
            const deduction = Math.min(loan.installmentAmount, loan.remainingAmount, remainingToDeduct);
            remainingToDeduct -= deduction;
            const newRemaining = loan.remainingAmount - deduction;
            return {
              ...loan,
              remainingAmount: newRemaining,
              status: newRemaining <= 0 ? "PAID" : "ACTIVE",
            };
          }
          return loan;
        });
      }
    });
    
    if (updatedLoans.length > 0) {
      onUpdateLoans(updatedLoans);
    }

    // Add automated journal entry
    if (onAddJournalEntry) {
      const totalPeriodNet = currentPeriodPayrolls.reduce((sum, item) => sum + item.netSalary, 0);
      const totalPeriodLoans = currentPeriodPayrolls.reduce((sum, item) => sum + (item.loansDeduction || 0), 0);

      const totalExpense = totalPeriodNet + totalPeriodLoans;

      const entry: JournalEntry = {
        id: `JE-PAY-${selectedPeriod}-${Date.now()}`,
        entryNumber: `JV-PAY-${selectedPeriod}`,
        date: new Date().toISOString().slice(0, 10),
        period: selectedPeriod,
        type: "STANDARD",
        status: "POSTED",
        description: `اثبات مسير رواتب وأجور الموظفين لشهر (${selectedPeriod}) - وحدة الموارد البشرية`,
        currency: "YER_SANAA" as CurrencyCode,
        totalDebit: totalExpense,
        totalCredit: totalExpense,
        createdBy: "وحدة الموارد البشرية والرواتب",
        createdAt: new Date().toISOString(),
        lines: [
          {
            id: `jl-1-${Date.now()}`,
            accountId: "510101",
            accountCode: "510101",
            accountNameAr: "مصاريف الرواتب والأجور الأساسية",
            debit: totalExpense,
            credit: 0,
            currency: "YER_SANAA" as CurrencyCode,
            exchangeRate: 1,
            memo: `مصروف رواتب شهر ${selectedPeriod}`,
          },
          {
            id: `jl-2-${Date.now()}`,
            accountId: "210301",
            accountCode: "210301",
            accountNameAr: "حساب الرواتب والأجور المستحقة",
            debit: 0,
            credit: totalPeriodNet,
            currency: "YER_SANAA" as CurrencyCode,
            exchangeRate: 1,
            memo: `مستحقات رواتب الموظفين لشهر ${selectedPeriod}`,
          },
        ],
      };
      
      if (totalPeriodLoans > 0) {
        entry.lines.push({
          id: `jl-3-${Date.now()}`,
          accountId: "1104", // Assume 1104 for employee loans/advances
          accountCode: "1104",
          accountNameAr: "سلف الموظفين (ذمم مدينة)",
          debit: 0,
          credit: totalPeriodLoans,
          currency: "YER_SANAA" as CurrencyCode,
          exchangeRate: 1,
          memo: `استقطاع سلف الموظفين لشهر ${selectedPeriod}`,
        });
      }

      onAddJournalEntry(entry);
    }
  };

  // Handler to Disburse Payroll
  const handleDisbursePayrollPeriod = () => {
    const updated = payrolls.map((p) =>
      p.period === selectedPeriod
        ? { ...p, status: "DISBURSED" as const, disbursementDate: new Date().toISOString().slice(0, 10) }
        : p
    );
    onUpdatePayrolls(updated);

    // Add automated journal entry for disbursement
    if (onAddJournalEntry) {
      const totalPeriodNet = payrolls
        .filter((p) => p.period === selectedPeriod)
        .reduce((sum, item) => sum + item.netSalary, 0);

      const entry: JournalEntry = {
        id: `JE-PAY-DISB-${selectedPeriod}-${Date.now()}`,
        entryNumber: `JV-PAY-DISB-${selectedPeriod}`,
        date: new Date().toISOString().slice(0, 10),
        period: selectedPeriod,
        type: "PAYMENT",
        status: "POSTED",
        description: `صرف مسير رواتب وأجور الموظفين لشهر (${selectedPeriod}) من البنك`,
        currency: "YER_SANAA" as CurrencyCode,
        totalDebit: totalPeriodNet,
        totalCredit: totalPeriodNet,
        createdBy: "وحدة الموارد البشرية والرواتب",
        createdAt: new Date().toISOString(),
        lines: [
          {
            id: `jl-1-disb-${Date.now()}`,
            accountId: "210301",
            accountCode: "210301",
            accountNameAr: "حساب الرواتب والأجور المستحقة",
            debit: totalPeriodNet,
            credit: 0,
            currency: "YER_SANAA" as CurrencyCode,
            exchangeRate: 1,
            memo: `إقفال مستحقات رواتب شهر ${selectedPeriod} بالصرف`,
          },
          {
            id: `jl-2-disb-${Date.now()}`,
            accountId: "110201",
            accountCode: "110201",
            accountNameAr: "بنك التضامن الإسلامي", // Generic default bank
            debit: 0,
            credit: totalPeriodNet,
            currency: "YER_SANAA" as CurrencyCode,
            exchangeRate: 1,
            memo: `صرف رواتب شهر ${selectedPeriod}`,
          },
        ],
      };
      onAddJournalEntry(entry);
    }
  };

  // Handler for Adding New Employee
  const handleAddEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.jobTitle) return;

    const createdEmp: HREmployee = {
      id: `emp-${Date.now()}`,
      code: `EMP-${String(employees.length + 1).padStart(3, "0")}`,
      name: newEmp.name,
      jobTitle: newEmp.jobTitle,
      department: newEmp.department || "عام",
      branch: newEmp.branch || "المركز الرئيسي - صنعاء",
      hireDate: newEmp.hireDate || new Date().toISOString().slice(0, 10),
      nationalId: newEmp.nationalId || "1000000000",
      phone: newEmp.phone || "",
      email: newEmp.email || "",
      status: (newEmp.status as any) || "ACTIVE",
      contract: {
        type: newEmp.contract?.type || "FULL_TIME",
        startDate: newEmp.contract?.startDate || new Date().toISOString().slice(0, 10),
        endDate: newEmp.contract?.endDate || "2028-12-31",
        probationMonths: newEmp.contract?.probationMonths || 3,
        status: "ACTIVE",
        terms: newEmp.contract?.terms || "عقد عمل موحد الموارد البشرية",
      },
      salaryStructure: {
        basicSalary: newEmp.salaryStructure?.basicSalary || 300000,
        currency: newEmp.salaryStructure?.currency || "YER_SANAA",
        allowances: [],
        bonuses: [],
        deductions: [],
      },
    };

    onUpdateEmployees([...employees, createdEmp]);
    setShowAddEmployeeModal(false);
    setNewEmp({
      name: "",
      jobTitle: "",
      department: "الإدارة المالية والحسابات",
      branch: "المركز الرئيسي - صنعاء",
      nationalId: "",
      phone: "",
      email: "",
      status: "ACTIVE",
    });
  };

  // Handler for Adding Decision
  const handleAddDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecision.employeeId || !newDecision.title) return;

    const targetEmp = employees.find((emp) => emp.id === newDecision.employeeId);

    const createdDec: HRAdministrativeDecision = {
      id: `dec-${Date.now()}`,
      employeeId: newDecision.employeeId,
      employeeName: targetEmp?.name || "غير محدد",
      type: (newDecision.type as any) || "APPOINTMENT",
      title: newDecision.title,
      date: newDecision.date || new Date().toISOString().slice(0, 10),
      effectiveDate: newDecision.effectiveDate || new Date().toISOString().slice(0, 10),
      details: newDecision.details || "",
      issuedBy: newDecision.issuedBy || "إدارة الموارد البشرية",
      documentRef: `DEC-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
    };

    onUpdateDecisions([createdDec, ...decisions]);
    setShowAddDecisionModal(false);
    setNewDecision({ employeeId: "", type: "APPOINTMENT", title: "", details: "" });
  };

  // Handler for Adding Shift
  const handleAddShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShift.name) return;

    const createdShift: HRWorkingShift = {
      id: `shift-${Date.now()}`,
      name: newShift.name,
      startTime: newShift.startTime || "08:00",
      endTime: newShift.endTime || "16:00",
      graceMinutes: newShift.graceMinutes || 15,
      workingDaysPerWeek: newShift.workingDaysPerWeek || 6,
      overtimeRate: newShift.overtimeRate || 1.5,
    };

    onUpdateShifts([...shifts, createdShift]);
    setShowAddShiftModal(false);
  };

  // Handler for Adding Attendance
  const handleAddAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttendance.employeeId) return;

    const targetEmp = employees.find((emp) => emp.id === newAttendance.employeeId);

    const createdAtt: HRAttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: newAttendance.employeeId,
      employeeName: targetEmp?.name || "موظف",
      date: newAttendance.date || new Date().toISOString().slice(0, 10),
      shiftName: newAttendance.shiftName || shifts[0]?.name || "الدوام الرسمي",
      expectedCheckIn: newAttendance.expectedCheckIn || "08:00",
      expectedCheckOut: newAttendance.expectedCheckOut || "16:00",
      actualCheckIn: newAttendance.actualCheckIn,
      actualCheckOut: newAttendance.actualCheckOut,
      status: (newAttendance.status as any) || "PRESENT",
      latenessMinutes: Number(newAttendance.latenessMinutes) || 0,
      overtimeHours: Number(newAttendance.overtimeHours) || 0,
      notes: newAttendance.notes || "",
    };

    onUpdateAttendance([createdAtt, ...attendanceRecords]);
    setShowAddAttendanceModal(false);
  };

  const handleAddLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoan.employeeId || !newLoan.amount || !newLoan.installmentAmount) return;

    const targetEmp = employees.find((emp) => emp.id === newLoan.employeeId);

    const createdLoan: HRLoan = {
      id: `loan-${Date.now()}`,
      employeeId: newLoan.employeeId,
      employeeName: targetEmp?.name || "موظف",
      amount: Number(newLoan.amount),
      installmentAmount: Number(newLoan.installmentAmount),
      remainingAmount: Number(newLoan.amount),
      date: newLoan.date || new Date().toISOString().slice(0, 10),
      reason: newLoan.reason || "",
      status: "ACTIVE",
    };

    onUpdateLoans([createdLoan, ...loans]);
    
    if (onAddJournalEntry) {
      const entry: JournalEntry = {
        id: `JE-LOAN-${Date.now()}`,
        entryNumber: `JV-LOAN-${Date.now().toString().slice(-6)}`,
        date: createdLoan.date,
        period: createdLoan.date.slice(0, 7),
        type: "STANDARD",
        status: "POSTED",
        description: `صرف سلفة للموظف ${createdLoan.employeeName} - ${createdLoan.reason}`,
        currency: "YER_SANAA",
        totalDebit: createdLoan.amount,
        totalCredit: createdLoan.amount,
        createdBy: "وحدة الموارد البشرية",
        createdAt: new Date().toISOString(),
        lines: [
          {
            id: `jl-1-${Date.now()}`,
            accountId: "1104", // Employee Loans / Advances
            accountCode: "1104",
            accountNameAr: "سلف الموظفين (ذمم مدينة)",
            debit: createdLoan.amount,
            credit: 0,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: `إثبات سلفة للموظف ${createdLoan.employeeName}`,
          },
          {
            id: `jl-2-${Date.now()}`,
            accountId: "110101", // Main Cash Vault
            accountCode: "110101",
            accountNameAr: "الصندوق الرئيسي",
            debit: 0,
            credit: createdLoan.amount,
            currency: "YER_SANAA",
            exchangeRate: 1,
            memo: `صرف سلفة للموظف ${createdLoan.employeeName}`,
          }
        ],
      };
      onAddJournalEntry(entry);
    }
    
    setShowAddLoanModal(false);
    setNewLoan({
      employeeId: "",
      amount: 0,
      installmentAmount: 0,
      date: new Date().toISOString().slice(0, 10),
      reason: "",
    });
  };

  // Salary Component Adders
  const handleAddAllowanceToEmp = () => {
    if (!selectedEmpForSalaryEdit || !allowanceForm.name || allowanceForm.amount <= 0) return;
    const updatedEmps = employees.map((emp) => {
      if (emp.id === selectedEmpForSalaryEdit.id) {
        return {
          ...emp,
          salaryStructure: {
            ...emp.salaryStructure,
            allowances: [
              ...emp.salaryStructure.allowances,
              { id: `alw-${Date.now()}`, ...allowanceForm },
            ],
          },
        };
      }
      return emp;
    });
    onUpdateEmployees(updatedEmps);
    const updatedSelf = updatedEmps.find((e) => e.id === selectedEmpForSalaryEdit.id);
    if (updatedSelf) setSelectedEmpForSalaryEdit(updatedSelf);
    setAllowanceForm({ name: "", amount: 0, type: "HOUSING" });
  };

  const handleAddBonusToEmp = () => {
    if (!selectedEmpForSalaryEdit || !bonusForm.name || bonusForm.amount <= 0) return;
    const updatedEmps = employees.map((emp) => {
      if (emp.id === selectedEmpForSalaryEdit.id) {
        return {
          ...emp,
          salaryStructure: {
            ...emp.salaryStructure,
            bonuses: [
              ...emp.salaryStructure.bonuses,
              { id: `bon-${Date.now()}`, date: new Date().toISOString().slice(0, 10), ...bonusForm },
            ],
          },
        };
      }
      return emp;
    });
    onUpdateEmployees(updatedEmps);
    const updatedSelf = updatedEmps.find((e) => e.id === selectedEmpForSalaryEdit.id);
    if (updatedSelf) setSelectedEmpForSalaryEdit(updatedSelf);
    setBonusForm({ name: "", amount: 0, reason: "" });
  };

  const handleAddDeductionToEmp = () => {
    if (!selectedEmpForSalaryEdit || !deductionForm.name || deductionForm.amount <= 0) return;
    const updatedEmps = employees.map((emp) => {
      if (emp.id === selectedEmpForSalaryEdit.id) {
        return {
          ...emp,
          salaryStructure: {
            ...emp.salaryStructure,
            deductions: [
              ...emp.salaryStructure.deductions,
              { id: `ded-${Date.now()}`, date: new Date().toISOString().slice(0, 10), ...deductionForm },
            ],
          },
        };
      }
      return emp;
    });
    onUpdateEmployees(updatedEmps);
    const updatedSelf = updatedEmps.find((e) => e.id === selectedEmpForSalaryEdit.id);
    if (updatedSelf) setSelectedEmpForSalaryEdit(updatedSelf);
    setDeductionForm({ name: "", amount: 0, reason: "" });
  };

  // Filtered lists
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === "ALL" || emp.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const periodPayrolls = payrolls.filter((p) => p.period === selectedPeriod);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-purple-900/40 via-slate-900 to-slate-900 border border-purple-800/40 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                منظومة إدارة الموارد البشرية والرواتب
                <span className="text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                  HCM & Payroll
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                إدارة شؤون الموظفين، التعاقد والقرارات، مسير الرواتب الشهري، المكافآت والبدلات، وسجلات الحضور
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddEmployeeModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            إضافة موظف جديد
          </button>
          <button
            onClick={() => setShowAddDecisionModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            <FileText className="w-4 h-4 text-purple-400" />
            إصدار قرار إداري
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block">إجمالي كادر الموظفين</span>
            <span className="text-2xl font-black text-white mt-1 block">{totalEmployeesCount} موظف</span>
            <span className="text-[11px] text-emerald-400 font-bold mt-1 inline-block">
              {activeEmployeesCount} نشط على رأس العمل
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block">فاتورة الرواتب ({selectedPeriod})</span>
            <span className="text-xl font-black text-purple-300 mt-1 block">
              {fmt(totalMonthlyPayrollYER)} {getCurrencySymbol(displayCurrency)}
            </span>
            <span className="text-[11px] text-purple-400 font-bold mt-1 inline-block">
              {periodPayrolls.length} مسير مستحق
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block">القرارات الإدارية الموثقة</span>
            <span className="text-2xl font-black text-amber-300 mt-1 block">{decisions.length} قرار</span>
            <span className="text-[11px] text-amber-400 font-bold mt-1 inline-block">تعيينات وترقيات وجزاءات</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block">سجلات الدوام والانضباط</span>
            <span className="text-2xl font-black text-teal-300 mt-1 block">{attendanceRecords.length} حركة</span>
            <span className="text-[11px] text-teal-400 font-bold mt-1 inline-block">شفتات حضور وانصراف</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Four Buttons Navigation Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-2xl flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab("MONTHLY_PAYROLL")}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "MONTHLY_PAYROLL"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "bg-slate-950/60 text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Receipt className="w-4 h-4" />
          الرواتب الشهرية
          {pendingPayrollsCount > 0 && (
            <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px]">
              {pendingPayrollsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("PERSONNEL_AFFAIRS")}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "PERSONNEL_AFFAIRS"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "bg-slate-950/60 text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          إدارة شؤون الموظفين والتعاقد
        </button>

        <button
          onClick={() => setActiveSubTab("SALARIES_AND_BONUSES")}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "SALARIES_AND_BONUSES"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "bg-slate-950/60 text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          إدارة الرواتب والمكافآت والبدلات
        </button>

        <button
          onClick={() => setActiveSubTab("ATTENDANCE_AND_SHIFTS")}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "ATTENDANCE_AND_SHIFTS"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "bg-slate-950/60 text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Clock className="w-4 h-4" />
          الإنضباط وآلية الدوام
        </button>

        <button
          onClick={() => setActiveSubTab("LOANS_AND_ADVANCES")}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "LOANS_AND_ADVANCES"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "bg-slate-950/60 text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          السلف والخصومات
        </button>
      </div>

      {/* ==================== SUB TAB 1: MONTHLY PAYROLL ==================== */}
      {activeSubTab === "MONTHLY_PAYROLL" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-400" />
              <label className="text-xs font-bold text-slate-300">شهر مسير الرواتب المستهدف:</label>
              <input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-purple-300 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleGeneratePayrollForPeriod}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-purple-400" />
                توليد مسير رواتب الشهر الآلي
              </button>

              <button
                onClick={handleApprovePayrollPeriod}
                className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                اعتماد القيد المحاسبي
              </button>

              <button
                onClick={handleDisbursePayrollPeriod}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                صرف المسير للبنك/الصندوق
              </button>
            </div>
          </div>

          {/* Payroll Table */}
          {periodPayrolls.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
              <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-300">لا يوجد مسير رواتب منشأ لشهر {selectedPeriod}</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                اضغط على زر "توليد مسير رواتب الشهر الآلي" للقيام باحتساب واستخراج الرواتب المستحقة لكافة الموظفين تلقائياً.
              </p>
              <button
                onClick={handleGeneratePayrollForPeriod}
                className="mt-4 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30"
              >
                توليد المسير الآن
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs bg-slate-950/50">
                    <th className="p-3 font-bold">الموظف والوظيفة</th>
                    <th className="p-3 font-bold">القسم</th>
                    <th className="p-3 font-bold">الراتب الأساسي</th>
                    <th className="p-3 font-bold text-emerald-400">إجمالي البدلات</th>
                    <th className="p-3 font-bold text-blue-400">المكافآت</th>
                    <th className="p-3 font-bold text-amber-400">خصم الانحراف</th>
                    <th className="p-3 font-bold text-purple-300">صافي المستحق</th>
                    <th className="p-3 font-bold text-center">الحالة</th>
                    <th className="p-3 font-bold text-center">قسيمة الراتب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {periodPayrolls.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-white">{p.employeeName}</div>
                        <div className="text-[11px] text-slate-400">{p.jobTitle}</div>
                      </td>
                      <td className="p-3 text-slate-300">{p.department}</td>
                      <td className="p-3 font-mono text-slate-200">
                        {fmt(p.basicSalary)} {getCurrencySymbol(displayCurrency)}
                      </td>
                      <td className="p-3 font-mono text-emerald-300">
                        +{fmt(p.totalAllowances)} {getCurrencySymbol(displayCurrency)}
                      </td>
                      <td className="p-3 font-mono text-blue-300">
                        +{fmt(p.totalBonuses)} {getCurrencySymbol(displayCurrency)}
                      </td>
                      <td className="p-3 font-mono text-amber-300">
                        -{fmt(p.latenessDeductions + p.otherDeductions + (p.loansDeduction || 0))} {getCurrencySymbol(displayCurrency)}
                      </td>
                      <td className="p-3 font-mono font-bold text-purple-200 text-sm">
                        {fmt(p.netSalary)} {getCurrencySymbol(displayCurrency)}
                      </td>
                      <td className="p-3 text-center">
                        {p.status === "DRAFT" && (
                          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-bold text-[10px]">
                            مسودة معلقة
                          </span>
                        )}
                        {p.status === "APPROVED" && (
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold text-[10px]">
                            معتمد محاسبياً
                          </span>
                        )}
                        {p.status === "DISBURSED" && (
                          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-bold text-[10px]">
                            تم الصرف
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedPaySlip(p)}
                          className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 mx-auto"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          قسيمة الراتب
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== SUB TAB 2: PERSONNEL AFFAIRS & CONTRACTS ==================== */}
      {activeSubTab === "PERSONNEL_AFFAIRS" && (
        <div className="space-y-6">
          {/* Employee Directory and Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث باسم الموظف، الكود الوظيفي، أو المسمى..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-400">تصفية حسب القسم:</label>
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="ALL">جميع الأقسام والإدارات</option>
                  <option value="الإدارة المالية والحسابات">الإدارة المالية والحسابات</option>
                  <option value="الرقابة والمراجعة الداخلية">الرقابة والمراجعة الداخلية</option>
                  <option value="المبيعات والصناديق">المبيعات والصناديق</option>
                  <option value="إدارة اللوجستيات والمستودعات (MM)">المستودعات واللوجستيات</option>
                </select>
              </div>
            </div>

            {/* Employees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-slate-950 border border-slate-800 hover:border-purple-500/40 p-4 rounded-xl space-y-3 transition-all relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 font-mono text-[10px] rounded font-bold border border-purple-500/20">
                        {emp.code}
                      </span>
                      <h4 className="font-bold text-white text-sm mt-1">{emp.name}</h4>
                      <p className="text-xs text-slate-400">{emp.jobTitle}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        emp.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {emp.status === "ACTIVE" ? "على رأس العمل" : "إجازة / موقف"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs border-t border-slate-800/80 pt-2 text-slate-300">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">الفرع والقسم:</span>
                      <span className="font-semibold text-slate-300">{emp.department}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">نوع العقد:</span>
                      <span className="font-bold text-purple-300">
                        {emp.contract.type === "FULL_TIME" && "عقد عمل دوام كامل"}
                        {emp.contract.type === "PART_TIME" && "عقد جزئي"}
                        {emp.contract.type === "PROBATION" && "فترة تجربة"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">تاريخ التعاقد:</span>
                      <span className="font-mono text-slate-400">{emp.contract.startDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                    <button
                      onClick={() => setSelectedEmpForSalaryEdit(emp)}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-lg text-[11px] font-bold transition-all text-center"
                    >
                      تعديل الرواتب والبدلات
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Administrative Decisions Sub-Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  سجل القرارات الإدارية والترقيات والجزاءات
                </h3>
                <p className="text-xs text-slate-400">توثيق القرارات الرسمية الصادرة بحق الموظفين وتاريخ نفاذها</p>
              </div>
              <button
                onClick={() => setShowAddDecisionModal(true)}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-amber-600/20"
              >
                <Plus className="w-4 h-4" />
                إصدار قرار جديد
              </button>
            </div>

            <div className="space-y-3">
              {decisions.map((dec) => (
                <div key={dec.id} className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold rounded">
                          {dec.documentRef}
                        </span>
                        <h4 className="font-bold text-white text-sm">{dec.title}</h4>
                      </div>
                      <p className="text-xs text-purple-300 mt-1 font-semibold">الموظف المعني: {dec.employeeName}</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
                      تاريخ القرار: {dec.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/50">
                    {dec.details}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>جهة الإصدار: {dec.issuedBy}</span>
                    <span>تاريخ النفاذ: {dec.effectiveDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUB TAB 3: SALARIES, BONUSES & ALLOWANCES ==================== */}
      {activeSubTab === "SALARIES_AND_BONUSES" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee Selection List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 lg:col-span-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Users className="w-4 h-4 text-purple-400" />
              اختيار الموظف لضبط الهيكل
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {employees.map((emp) => {
                const isSelected = selectedEmpForSalaryEdit?.id === emp.id;
                return (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmpForSalaryEdit(emp)}
                    className={`w-full text-right p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-purple-950/50 border-purple-500 text-white shadow-md shadow-purple-500/10"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{emp.name}</span>
                      <span className="text-[10px] font-mono text-purple-300">{emp.code}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{emp.jobTitle}</div>
                    <div className="text-[11px] font-mono text-emerald-400 mt-1">
                      الأساسي: {fmt(emp.salaryStructure.basicSalary)} {getCurrencySymbol(displayCurrency)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Salary Structure Builder for Selected Employee */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 lg:col-span-2">
            {!selectedEmpForSalaryEdit ? (
              <div className="text-center py-20 text-slate-500">
                <DollarSign className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                <p className="text-xs font-bold">يرجى اختيار موظف من القائمة لعرض وتعديل هكيل راتبه والبدلات والمكافآت</p>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedEmpForSalaryEdit.name}</h3>
                    <p className="text-xs text-slate-400">
                      {selectedEmpForSalaryEdit.jobTitle} - {selectedEmpForSalaryEdit.department}
                    </p>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 block">إجمالي المستحق الشهري التقديري</span>
                    <span className="text-base font-black text-emerald-400">
                      {fmt(
                        selectedEmpForSalaryEdit.salaryStructure.basicSalary +
                          selectedEmpForSalaryEdit.salaryStructure.allowances.reduce((a, b) => a + b.amount, 0)
                      )}{" "}
                      {getCurrencySymbol(displayCurrency)}
                    </span>
                  </div>
                </div>

                {/* Basic Salary */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-300 block">الراتب الأساسي الثابت</span>
                    <span className="text-xs text-slate-500">قيمة الأجر الشهري الثابت في العقد</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={selectedEmpForSalaryEdit.salaryStructure.basicSalary}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const updated = employees.map((emp) =>
                          emp.id === selectedEmpForSalaryEdit.id
                            ? { ...emp, salaryStructure: { ...emp.salaryStructure, basicSalary: val } }
                            : emp
                        );
                        onUpdateEmployees(updated);
                        setSelectedEmpForSalaryEdit({
                          ...selectedEmpForSalaryEdit,
                          salaryStructure: { ...selectedEmpForSalaryEdit.salaryStructure, basicSalary: val },
                        });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-emerald-300 w-36 text-center focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-xs font-bold text-slate-400">
                      {getCurrencySymbol(displayCurrency)}
                    </span>
                  </div>
                </div>

                {/* Allowances Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    البدلات والمزايا الثابتة (Allowances)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedEmpForSalaryEdit.salaryStructure.allowances.map((alw) => (
                      <div
                        key={alw.id}
                        className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-white block">{alw.name}</span>
                          <span className="text-[10px] text-slate-500">{alw.type}</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">
                          +{fmt(alw.amount)} {getCurrencySymbol(displayCurrency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add Allowance Form */}
                  <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <input
                      type="text"
                      placeholder="اسم البدل (مثلاً: بدل سكن، بدل نقل)"
                      value={allowanceForm.name}
                      onChange={(e) => setAllowanceForm({ ...allowanceForm, name: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white flex-1 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="المبلغ"
                      value={allowanceForm.amount || ""}
                      onChange={(e) => setAllowanceForm({ ...allowanceForm, amount: Number(e.target.value) })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white w-28 focus:outline-none font-mono"
                    />
                    <button
                      onClick={handleAddAllowanceToEmp}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      إضافة البدل
                    </button>
                  </div>
                </div>

                {/* Bonuses & Deductions Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bonuses */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      المكافآت والحوافز الاستثنائية
                    </h4>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {selectedEmpForSalaryEdit.salaryStructure.bonuses.map((bon) => (
                        <div
                          key={bon.id}
                          className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-white block">{bon.name}</span>
                            <span className="text-[10px] text-slate-400">{bon.reason}</span>
                          </div>
                          <span className="font-mono text-blue-300 font-bold">
                            +{fmt(bon.amount)} {getCurrencySymbol(displayCurrency)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <input
                        type="text"
                        placeholder="اسم المكافأة ورقم القرار..."
                        value={bonusForm.name}
                        onChange={(e) => setBonusForm({ ...bonusForm, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="مبلغ المكافأة"
                          value={bonusForm.amount || ""}
                          onChange={(e) => setBonusForm({ ...bonusForm, amount: Number(e.target.value) })}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white flex-1 focus:outline-none font-mono"
                        />
                        <button
                          onClick={handleAddBonusToEmp}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          إضافة مكافأة
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      الخصميات، السلف، والجزاءات
                    </h4>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {selectedEmpForSalaryEdit.salaryStructure.deductions.map((ded) => (
                        <div
                          key={ded.id}
                          className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-white block">{ded.name}</span>
                            <span className="text-[10px] text-slate-400">{ded.reason}</span>
                          </div>
                          <span className="font-mono text-amber-400 font-bold">
                            -{fmt(ded.amount)} {getCurrencySymbol(displayCurrency)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <input
                        type="text"
                        placeholder="سبب الخصم، السلفة، أو الجزاء..."
                        value={deductionForm.name}
                        onChange={(e) => setDeductionForm({ ...deductionForm, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="مبلغ الخصم"
                          value={deductionForm.amount || ""}
                          onChange={(e) => setDeductionForm({ ...deductionForm, amount: Number(e.target.value) })}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white flex-1 focus:outline-none font-mono"
                        />
                        <button
                          onClick={handleAddDeductionToEmp}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-all"
                        >
                          إضافة خصم
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ==================== SUB TAB 4: ATTENDANCE & SHIFTS ==================== */}
      {activeSubTab === "ATTENDANCE_AND_SHIFTS" && (
        <div className="space-y-6">
          {/* Shift Mechanism Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-400" />
                  آلية وشفتات الدوام المعتمدة
                </h3>
                <p className="text-xs text-slate-400">تحديد مواعيد الحضور والانصراف وفترات السماح وتكلفة الإضافي</p>
              </div>
              <button
                onClick={() => setShowAddShiftModal(true)}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-teal-600/20"
              >
                <Plus className="w-4 h-4" />
                إضافة شفت جديد
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shifts.map((s) => (
                <div key={s.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-xs">{s.name}</h4>
                    <span className="px-2 py-0.5 bg-teal-500/10 text-teal-300 font-mono text-[10px] rounded font-bold border border-teal-500/20">
                      مفعل
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                    <div>
                      <span className="text-slate-500 block">من:</span>
                      <span className="font-mono font-bold text-emerald-400">{s.startTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">إلى:</span>
                      <span className="font-mono font-bold text-emerald-400">{s.endTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">السماح:</span>
                      <span className="font-mono text-slate-300">{s.graceMinutes} دقيقة</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">معامل الإضافي:</span>
                      <span className="font-mono text-purple-300">{s.overtimeRate}x</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-purple-400" />
                  سجل الحضور والانصراف والانحراف اليومي
                </h3>
                <p className="text-xs text-slate-400">توثيق ساعات الدخول والتأخير التلقائي لربطها بالخصميات</p>
              </div>
              <button
                onClick={() => setShowAddAttendanceModal(true)}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
              >
                <Plus className="w-4 h-4" />
                تسجيل حركة حضور جديدة
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                    <th className="p-3 font-bold">الموظف</th>
                    <th className="p-3 font-bold">التاريخ والشفت</th>
                    <th className="p-3 font-bold">الوقت المتوقع</th>
                    <th className="p-3 font-bold">الوقت الفعلي</th>
                    <th className="p-3 font-bold text-amber-400">انحراف التأخير</th>
                    <th className="p-3 font-bold text-purple-300">العمل الإضافي</th>
                    <th className="p-3 font-bold text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {attendanceRecords.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-white">{att.employeeName}</td>
                      <td className="p-3">
                        <div className="font-mono text-slate-300">{att.date}</div>
                        <div className="text-[10px] text-slate-500">{att.shiftName}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-400">
                        {att.expectedCheckIn} - {att.expectedCheckOut}
                      </td>
                      <td className="p-3 font-mono text-emerald-300 font-bold">
                        {att.actualCheckIn || "--:--"} - {att.actualCheckOut || "--:--"}
                      </td>
                      <td className="p-3 font-mono text-amber-400 font-bold">
                        {att.latenessMinutes > 0 ? `${att.latenessMinutes} دقيقة` : "لا يوجد"}
                      </td>
                      <td className="p-3 font-mono text-purple-300 font-bold">
                        {att.overtimeHours > 0 ? `${att.overtimeHours} ساعة` : "لا يوجد"}
                      </td>
                      <td className="p-3 text-center">
                        {att.status === "PRESENT" && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold text-[10px]">
                            حاضر
                          </span>
                        )}
                        {att.status === "LATE" && (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-bold text-[10px]">
                            متأخر
                          </span>
                        )}
                        {att.status === "LEAVE" && (
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-bold text-[10px]">
                            إجازة
                          </span>
                        )}
                        {att.status === "ABSENT" && (
                          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-bold text-[10px]">
                            غائب
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUB TAB 5: LOANS AND ADVANCES ==================== */}
      {activeSubTab === "LOANS_AND_ADVANCES" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  سجل السلف والخصومات
                </h3>
                <p className="text-xs text-slate-400">إدارة سلف الموظفين وتتبع الأقساط المستردة والمتبقية</p>
              </div>
              <button
                onClick={() => setShowAddLoanModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" />
                تسجيل سلفة جديدة
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs bg-slate-950/50">
                    <th className="p-3 font-bold">رقم السلفة</th>
                    <th className="p-3 font-bold">تاريخ الطلب</th>
                    <th className="p-3 font-bold">الموظف</th>
                    <th className="p-3 font-bold">قيمة السلفة</th>
                    <th className="p-3 font-bold">القسط الشهري</th>
                    <th className="p-3 font-bold">المتبقي</th>
                    <th className="p-3 font-bold text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {loans.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        لا يوجد سلف مسجلة حالياً
                      </td>
                    </tr>
                  ) : (
                    loans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-mono text-slate-400">{loan.id.split('-').pop()?.slice(0, 6)}</td>
                        <td className="p-3 text-slate-300">{loan.date}</td>
                        <td className="p-3 font-bold text-white">{loan.employeeName}</td>
                        <td className="p-3 font-mono text-emerald-400">
                          {fmt(loan.amount)} {getCurrencySymbol(displayCurrency)}
                        </td>
                        <td className="p-3 font-mono text-amber-400">
                          {fmt(loan.installmentAmount)} {getCurrencySymbol(displayCurrency)}
                        </td>
                        <td className="p-3 font-mono text-rose-400">
                          {fmt(loan.remainingAmount)} {getCurrencySymbol(displayCurrency)}
                        </td>
                        <td className="p-3 text-center">
                          {loan.status === "ACTIVE" ? (
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-bold text-[10px]">قائمة</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold text-[10px]">مستردة بالكامل</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: PAY SLIP PRINT VIEW ==================== */}
      {selectedPaySlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <Receipt className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="font-black text-white text-base">قسيمة تفاصيل كشف الراتب النهائي (Pay Slip)</h3>
                  <p className="text-xs text-slate-400">مستند رسمي معتمد لشهر: {selectedPaySlip.period}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPaySlip(null)}
                className="text-slate-400 hover:text-white font-bold p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-xl space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-800 pb-4">
                <div>
                  <span className="text-slate-500 block">اسم الموظف:</span>
                  <span className="font-bold text-white text-sm">{selectedPaySlip.employeeName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">المسمى الوظيفي:</span>
                  <span className="font-bold text-slate-200">{selectedPaySlip.jobTitle}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">القسم والإدارة:</span>
                  <span className="font-bold text-slate-300">{selectedPaySlip.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">فترة المسير:</span>
                  <span className="font-mono font-bold text-purple-300">{selectedPaySlip.period}</span>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                  <span className="text-slate-400">الراتب الأساسي الثابت:</span>
                  <span className="font-mono text-white font-bold">
                    {fmt(selectedPaySlip.basicSalary)} {getCurrencySymbol(displayCurrency)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                  <span className="text-emerald-400 font-bold">+ إجمالي البدلات والمزايا:</span>
                  <span className="font-mono text-emerald-300 font-bold">
                    +{fmt(selectedPaySlip.totalAllowances)} {getCurrencySymbol(displayCurrency)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                  <span className="text-blue-400 font-bold">+ المكافآت والحوافز:</span>
                  <span className="font-mono text-blue-300 font-bold">
                    +{fmt(selectedPaySlip.totalBonuses)} {getCurrencySymbol(displayCurrency)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                  <span className="text-amber-400 font-bold">- خصميات الانحراف والتأخير:</span>
                  <span className="font-mono text-amber-300 font-bold">
                    -{fmt(selectedPaySlip.latenessDeductions + selectedPaySlip.otherDeductions)}{" "}
                    {getCurrencySymbol(displayCurrency)}
                  </span>
                </div>
                {selectedPaySlip.loansDeduction && selectedPaySlip.loansDeduction > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                    <span className="text-amber-400 font-bold">- إستقطاع السلف:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      -{fmt(selectedPaySlip.loansDeduction)}{" "}
                      {getCurrencySymbol(displayCurrency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-3 bg-purple-950/40 p-3 rounded-xl border border-purple-800/40 mt-2">
                  <span className="text-purple-200 font-black text-sm">صافي المبلغ المستحق للصرف:</span>
                  <span className="font-mono font-black text-purple-300 text-lg">
                    {fmt(selectedPaySlip.netSalary)} {getCurrencySymbol(displayCurrency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                طباعة قسيمة الراتب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD EMPLOYEE ==================== */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">إضافة موظف وعقد عمل جديد</h3>
              <button onClick={() => setShowAddEmployeeModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">الاسم الكامل</label>
                  <input
                    type="text"
                    value={newEmp.name}
                    onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="مثال: أ. ياسر المحطوري"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">المسمى الوظيفي</label>
                  <input
                    type="text"
                    value={newEmp.jobTitle}
                    onChange={(e) => setNewEmp({ ...newEmp, jobTitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="مثال: محاسب عام"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">القسم والإدارة</label>
                  <select
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="الإدارة المالية والحسابات">الإدارة المالية والحسابات</option>
                    <option value="الرقابة والمراجعة الداخلية">الرقابة والمراجعة الداخلية</option>
                    <option value="المبيعات والصناديق">المبيعات والصناديق</option>
                    <option value="إدارة اللوجستيات والمستودعات (MM)">إدارة المستودعات واللوجستيات</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">الراتب الأساسي</label>
                  <input
                    type="number"
                    value={newEmp.salaryStructure?.basicSalary || ""}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        salaryStructure: {
                          ...newEmp.salaryStructure!,
                          basicSalary: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none"
                    placeholder="350000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">الهاتف</label>
                  <input
                    type="text"
                    value={newEmp.phone}
                    onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    placeholder="+967 770 000 000"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    placeholder="emp@erp.ye"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30"
                >
                  حفظ وتأكيد الموظف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD DECISION ==================== */}
      {showAddDecisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">إصدار قرار إداري رسمـي</h3>
              <button onClick={() => setShowAddDecisionModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDecisionSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">الموظف المعني بالقرار</label>
                <select
                  value={newDecision.employeeId}
                  onChange={(e) => setNewDecision({ ...newDecision, employeeId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  required
                >
                  <option value="">اختر الموظف...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">نوع القرار الإداري</label>
                  <select
                    value={newDecision.type}
                    onChange={(e) => setNewDecision({ ...newDecision, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="APPOINTMENT">قرار تعيين رسمي</option>
                    <option value="PROMOTION">قرار ترقية ورفع أجر</option>
                    <option value="TRANSFER">قرار نقل فرعي</option>
                    <option value="BONUS_DECISION">قرار منح مكافأة</option>
                    <option value="PENALTY">قرار إنذار وجزاء</option>
                    <option value="CONTRACT_RENEWAL">قرار تجديد عقد العمل</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">عنوان القرار</label>
                  <input
                    type="text"
                    value={newDecision.title}
                    onChange={(e) => setNewDecision({ ...newDecision, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    placeholder="مثال: قرار منح مكافأة التميز المحاسبي"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">نص وتفاصيل القرار الإداري</label>
                <textarea
                  value={newDecision.details}
                  onChange={(e) => setNewDecision({ ...newDecision, details: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  placeholder="بناءً على محاضر التدقيق والمراجعة..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDecisionModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-amber-600/20"
                >
                  إصدار القرار الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD SHIFT ==================== */}
      {showAddShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">إضافة شفت وآلية دوام جديدة</h3>
              <button onClick={() => setShowAddShiftModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddShiftSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">اسم الشفت / آلية الدوام</label>
                <input
                  type="text"
                  value={newShift.name}
                  onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  placeholder="مثال: الشفت المسائي للصناديق"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">توقيت الحضور</label>
                  <input
                    type="time"
                    value={newShift.startTime}
                    onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">توقيت الانصراف</label>
                  <input
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">فترة السماح بالدقائق</label>
                  <input
                    type="number"
                    value={newShift.graceMinutes}
                    onChange={(e) => setNewShift({ ...newShift, graceMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">معامل ساعة الإضافي</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newShift.overtimeRate}
                    onChange={(e) => setNewShift({ ...newShift, overtimeRate: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-purple-300 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddShiftModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-teal-600/30"
                >
                  حفظ الشفت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD ATTENDANCE ==================== */}
      {showAddAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">تسجيل حركة حضور وانصراف جديدة</h3>
              <button onClick={() => setShowAddAttendanceModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAttendanceSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">الموظف</label>
                <select
                  value={newAttendance.employeeId}
                  onChange={(e) => setNewAttendance({ ...newAttendance, employeeId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  required
                >
                  <option value="">اختر الموظف...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">التاريخ</label>
                  <input
                    type="date"
                    value={newAttendance.date}
                    onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">حالة الحضور</label>
                  <select
                    value={newAttendance.status}
                    onChange={(e) => setNewAttendance({ ...newAttendance, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="PRESENT">حاضر (Present)</option>
                    <option value="LATE">متأخر (Late)</option>
                    <option value="LEAVE">إجازة (Leave)</option>
                    <option value="ABSENT">غائب (Absent)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">الدخول الفعلي</label>
                  <input
                    type="time"
                    value={newAttendance.actualCheckIn}
                    onChange={(e) => setNewAttendance({ ...newAttendance, actualCheckIn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">الانصراف الفعلي</label>
                  <input
                    type="time"
                    value={newAttendance.actualCheckOut}
                    onChange={(e) => setNewAttendance({ ...newAttendance, actualCheckOut: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">دقائق الانحراف / التأخير</label>
                  <input
                    type="number"
                    value={newAttendance.latenessMinutes}
                    onChange={(e) => setNewAttendance({ ...newAttendance, latenessMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">ساعات الدوام الإضافي</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newAttendance.overtimeHours}
                    onChange={(e) => setNewAttendance({ ...newAttendance, overtimeHours: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-purple-300 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAttendanceModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30"
                >
                  حفظ الحركة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD LOAN ==================== */}
      {showAddLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">تسجيل سلفة موظف جديدة</h3>
              <button onClick={() => setShowAddLoanModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLoanSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">الموظف</label>
                <select
                  value={newLoan.employeeId}
                  onChange={(e) => setNewLoan({ ...newLoan, employeeId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  required
                >
                  <option value="">اختر الموظف...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">قيمة السلفة</label>
                  <input
                    type="number"
                    value={newLoan.amount}
                    onChange={(e) => setNewLoan({ ...newLoan, amount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    min={1}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">قيمة القسط الشهري</label>
                  <input
                    type="number"
                    value={newLoan.installmentAmount}
                    onChange={(e) => setNewLoan({ ...newLoan, installmentAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">التاريخ</label>
                  <input
                    type="date"
                    value={newLoan.date}
                    onChange={(e) => setNewLoan({ ...newLoan, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">البيان ومبرر السلفة</label>
                <textarea
                  value={newLoan.reason}
                  onChange={(e) => setNewLoan({ ...newLoan, reason: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  rows={2}
                  placeholder="سبب طلب السلفة..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLoanModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30"
                >
                  صرف وإثبات السلفة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
