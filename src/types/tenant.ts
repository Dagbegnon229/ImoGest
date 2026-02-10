export type TenantStatus = 'active' | 'inactive' | 'pending_approval' | 'suspended';

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  status: TenantStatus;
  buildingId: string | null;
  apartmentId: string | null;
  leaseId: string | null;
  mustChangePassword: boolean;
  createdAt: string;
  createdBy: string | null;
  statusChangedAt: string | null;
}
