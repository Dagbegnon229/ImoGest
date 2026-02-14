export type LeaseStatus = 'active' | 'expired' | 'terminated' | 'pending';

export interface Lease {
  id: string;
  tenantId: string;
  apartmentId: string;
  buildingId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  status: LeaseStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
}
