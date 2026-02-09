export type AdminRole = 'super_admin' | 'admin_manager' | 'admin_support';

export interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: AdminRole;
  password: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string | null;
}
