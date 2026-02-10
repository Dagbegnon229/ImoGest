"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { Admin, AdminRole } from "@/types/admin";
import type { Tenant } from "@/types/tenant";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PortalType = "admin" | "client";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AdminRole | "tenant";
  portalType: PortalType;
}

interface LoginResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (id: string, password: string, portal: PortalType) => Promise<LoginResult>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

function setCookie(name: string, value: string, maxAge = 86400): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0`;
}

// ---------------------------------------------------------------------------
// Row mappers  (Supabase snake_case -> app camelCase)
// ---------------------------------------------------------------------------

function mapAdminRow(row: Record<string, unknown>): Admin {
  return {
    id: row.id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    email: row.email as string,
    phone: row.phone as string,
    role: row.role as AdminRole,
    password: row.password as string,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    createdBy: (row.created_by as string) ?? null,
  };
}

function mapTenantRow(row: Record<string, unknown>): Tenant {
  return {
    id: row.id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    email: row.email as string,
    phone: row.phone as string,
    password: row.password as string,
    status: row.status as Tenant["status"],
    buildingId: (row.building_id as string) ?? null,
    apartmentId: (row.apartment_id as string) ?? null,
    leaseId: (row.lease_id as string) ?? null,
    mustChangePassword: row.must_change_password as boolean,
    createdAt: row.created_at as string,
    createdBy: (row.created_by as string) ?? null,
    statusChangedAt: (row.status_changed_at as string) ?? null,
  };
}

// ---------------------------------------------------------------------------
// Helper: build AuthUser from an Admin or Tenant record
// ---------------------------------------------------------------------------

function adminToAuthUser(admin: Admin): AuthUser {
  return {
    id: admin.id,
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    role: admin.role,
    portalType: "admin",
  };
}

function tenantToAuthUser(tenant: Tenant): AuthUser {
  return {
    id: tenant.id,
    firstName: tenant.firstName,
    lastName: tenant.lastName,
    email: tenant.email,
    role: "tenant",
    portalType: "client",
  };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // -----------------------------------------------------------------------
  // Restore session from cookies on mount (fetch user from Supabase)
  // -----------------------------------------------------------------------
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const portalCookie = getCookie("immogest_portal") as PortalType | null;
        const userIdCookie = getCookie("immogest_user_id");

        if (!portalCookie || !userIdCookie) {
          setIsLoading(false);
          return;
        }

        if (portalCookie === "admin") {
          const { data, error } = await supabase
            .from("admins")
            .select("*")
            .eq("id", userIdCookie)
            .single();

          if (!error && data) {
            const admin = mapAdminRow(data);
            if (admin.isActive) {
              setUser(adminToAuthUser(admin));
            } else {
              // Account deactivated since last visit -- clear cookies
              deleteCookie("immogest_portal");
              deleteCookie("immogest_user_id");
            }
          } else {
            deleteCookie("immogest_portal");
            deleteCookie("immogest_user_id");
          }
        } else if (portalCookie === "client") {
          const { data, error } = await supabase
            .from("tenants")
            .select("*")
            .eq("id", userIdCookie)
            .single();

          if (!error && data) {
            const tenant = mapTenantRow(data);
            if (tenant.status === "active" || tenant.status === "pending_approval") {
              setUser(tenantToAuthUser(tenant));
            } else {
              deleteCookie("immogest_portal");
              deleteCookie("immogest_user_id");
            }
          } else {
            deleteCookie("immogest_portal");
            deleteCookie("immogest_user_id");
          }
        } else {
          // Unknown portal value -- clean up
          deleteCookie("immogest_portal");
          deleteCookie("immogest_user_id");
        }
      } catch (err) {
        console.error("Session restore failed:", err);
        deleteCookie("immogest_portal");
        deleteCookie("immogest_user_id");
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // -----------------------------------------------------------------------
  // Login
  // -----------------------------------------------------------------------
  const login = useCallback(
    async (id: string, password: string, portal: PortalType): Promise<LoginResult> => {
      const trimmedId = id.trim();

      // --- Validate ID format matches the chosen portal ---
      if (portal === "admin") {
        if (!/^ADM-\d{4}$/.test(trimmedId)) {
          return {
            success: false,
            error: "Identifiant invalide pour ce portail",
          };
        }
      } else {
        // client portal expects CLT-YYYY-XXXX
        if (!/^CLT-\d{4}-\d{4}$/.test(trimmedId)) {
          return {
            success: false,
            error: "Identifiant invalide pour ce portail",
          };
        }
      }

      try {
        // --- Admin login ---
        if (portal === "admin") {
          const { data, error } = await supabase
            .from("admins")
            .select("*")
            .eq("id", trimmedId)
            .single();

          if (error || !data) {
            return { success: false, error: "Identifiant ou mot de passe incorrect" };
          }

          const admin = mapAdminRow(data);

          if (!admin.isActive) {
            return { success: false, error: "Ce compte administrateur est d\u00e9sactiv\u00e9" };
          }
          if (admin.password !== password) {
            return { success: false, error: "Identifiant ou mot de passe incorrect" };
          }

          const authUser = adminToAuthUser(admin);
          setUser(authUser);
          setCookie("immogest_portal", "admin");
          setCookie("immogest_user_id", admin.id);

          return { success: true, redirectTo: "/admin" };
        } else {
          // --- Client login ---
          const { data, error } = await supabase
            .from("tenants")
            .select("*")
            .eq("id", trimmedId)
            .single();

          if (error || !data) {
            return { success: false, error: "Identifiant ou mot de passe incorrect" };
          }

          const tenant = mapTenantRow(data);

          if (tenant.status === "suspended") {
            return { success: false, error: "Ce compte client est suspendu" };
          }
          if (tenant.status === "inactive") {
            return { success: false, error: "Ce compte client est inactif" };
          }
          if (tenant.password !== password) {
            return { success: false, error: "Identifiant ou mot de passe incorrect" };
          }

          const authUser = tenantToAuthUser(tenant);
          setUser(authUser);
          setCookie("immogest_portal", "client");
          setCookie("immogest_user_id", tenant.id);

          // Check if the tenant must change their password on first login
          if (tenant.mustChangePassword) {
            return {
              success: true,
              mustChangePassword: true,
              redirectTo: "/change-password",
            };
          }

          return { success: true, redirectTo: "/client" };
        }
      } catch (err) {
        console.error("Login error:", err);
        return { success: false, error: "Erreur de connexion au serveur" };
      }
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Logout
  // -----------------------------------------------------------------------
  const logout = useCallback(() => {
    setUser(null);
    deleteCookie("immogest_portal");
    deleteCookie("immogest_user_id");
  }, []);

  // -----------------------------------------------------------------------
  // Change password
  // -----------------------------------------------------------------------
  const changePassword = useCallback(
    async (
      oldPassword: string,
      newPassword: string,
    ): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: "Non connect\u00e9" };
      }

      try {
        const table = user.portalType === "admin" ? "admins" : "tenants";

        // Verify the current password
        const { data: current, error: fetchError } = await supabase
          .from(table)
          .select("password")
          .eq("id", user.id)
          .single();

        if (fetchError || !current) {
          return { success: false, error: "Impossible de v\u00e9rifier le mot de passe" };
        }

        if ((current as Record<string, unknown>).password !== oldPassword) {
          return { success: false, error: "Ancien mot de passe incorrect" };
        }

        // Build the update payload
        const updatePayload: Record<string, unknown> = { password: newPassword };
        if (user.portalType === "client") {
          updatePayload.must_change_password = false;
        }

        const { error: updateError } = await supabase
          .from(table)
          .update(updatePayload)
          .eq("id", user.id);

        if (updateError) {
          throw updateError;
        }

        return { success: true };
      } catch (err) {
        console.error("Change password error:", err);
        return { success: false, error: "Erreur lors du changement de mot de passe" };
      }
    },
    [user],
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to consume the AuthContext. Throws if used outside of AuthProvider.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
