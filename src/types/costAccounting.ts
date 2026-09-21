export type CostCenterType = "PRODUCTION" | "SERVICE" | "ADMIN" | "SALES";

export interface CostCenter {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  type: CostCenterType;
  parentId?: string;
  managerName?: string;
  budget: number;
  actualCost: number;
  isActive: boolean;
}

export type JobOrderStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface JobOrderMaterial {
  id: string;
  materialName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface JobOrderLabor {
  id: string;
  workerName: string;
  hours: number;
  ratePerHour: number;
  totalCost: number;
}

export interface JobOrder {
  id: string;
  orderNumber: string; // e.g., JO-001
  customerName: string;
  productName: string;
  quantity: number;
  startDate: string;
  endDate?: string;
  status: JobOrderStatus;
  materials: JobOrderMaterial[];
  labors: JobOrderLabor[];
  overheadCost: number;
  totalCost: number;
  notes?: string;
}

export interface ProcessStage {
  id: string;
  stageName: string; // e.g., "التجهيز", "الخلط والتصنيع", "التعبئة والتغليف"
  department: string;
  inputUnits: number;
  completedUnits: number;
  inProgressUnits: number;
  completionPercentage: number;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  unitCost: number;
}

export interface ABCActivity {
  id: string;
  activityName: string;
  costDriver: string;
  totalCost: number;
  driverQuantity: number;
  ratePerDriver: number;
  allocatedProducts: {
    productName: string;
    driverConsumption: number;
    allocatedCost: number;
  }[];
}

export interface StandardCostItem {
  id: string;
  productName: string;
  element: "MATERIAL" | "LABOR" | "OVERHEAD";
  standardAmount: number;
  actualAmount: number;
  variance: number;
  isFavorable: boolean; // true = favorable (أقل من المعياري), false = unfavorable (أعلى من المعياري)
  period: string;
  reason?: string;
}

export interface TargetCostModel {
  id: string;
  productName: string;
  marketPrice: number;
  targetProfitMarginPct: number;
  targetCost: number;
  currentEstimatedCost: number;
  costGap: number;
  reductionPlan: {
    actionItem: string;
    targetSaving: number;
  }[];
}
