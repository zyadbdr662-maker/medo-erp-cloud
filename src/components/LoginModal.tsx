import React from "react";
import { SapEnterpriseLoginPortal } from "./SapEnterpriseLoginPortal";
import { ERPUser } from "../types/erp";

interface LoginModalProps {
  availableBranches?: { id: string; nameAr: string; city: string; code: string }[];
  onLoginSuccess: (
    user?: ERPUser,
    branchId?: string,
    clientInfo?: { clientId: string; clientName: string; warehouseId: string }
  ) => void;
  onOpenCorporateSite?: () => void;
  onOpenTrustCenter?: () => void;
  defaultShowSaaSOnboarding?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  availableBranches,
  onLoginSuccess,
  onOpenCorporateSite,
  onOpenTrustCenter,
  defaultShowSaaSOnboarding,
}) => {
  return (
    <SapEnterpriseLoginPortal
      availableBranches={availableBranches}
      onLoginSuccess={onLoginSuccess}
      onOpenCorporateSite={onOpenCorporateSite}
      onOpenTrustCenter={onOpenTrustCenter}
      defaultShowSaaSOnboarding={defaultShowSaaSOnboarding}
    />
  );
};
