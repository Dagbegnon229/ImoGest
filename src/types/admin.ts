export type AdminRole = 'super_admin' | 'admin_manager' | 'admin_support' | string;

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

// ── Custom Roles ────────────────────────────────────────────────────────────

export interface CustomRole {
  id: string;
  name: string;
  label: string;
  color: string;
  description: string;
  createdAt: string;
  createdBy: string | null;
}
