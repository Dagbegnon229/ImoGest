"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Admin, AdminRole } from "@/types/admin";
import type { Tenant } from "@/types/tenant";
import { mockAdmins } from "@/data/mock-admins";
import { mockTenants } from "@/data/mock-tenants";

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
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SESSION_KEY = "immogest_session";

function setCookie(name: string, value: string, maxAge = 86400): void {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0`;
}

/**
 * Retrieve the full list of admins, combining static mock data with any
 * admins that were dynamically created and persisted via the DataContext.
 */
function getAllAdmins(): Admin[] {
  try {
    const raw = localStorage.getItem("immogest_data");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.admins)) {
        return parsed.admins as Admin[];
      }
    }
  } catch {
    // Fall through to mock data
  }
  return mockAdmins;
}

/**
 * Retrieve the full list of tenants, combining static mock data with any
 * tenants that were dynamically created and persisted via the DataContext.
 */
function getAllTenants(): Tenant[] {
  try {
    const raw = localStorage.getItem("immogest_data");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.tenants)) {
        return parsed.tenants as Tenant[];
      }
    }
  } catch {
    // Fall through to mock data
  }
  return mockTenants;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // -----------------------------------------------------------------------
  // Hydrate session from localStorage on mount
  // -----------------------------------------------------------------------
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed: AuthUser = JSON.parse(stored);
        setUser(parsed);

        // Re-apply cookies so the middleware always has them
        setCookie("immogest_portal", parsed.portalType);
        setCookie("immogest_user_id", parsed.id);
      }
    } catch {
      // Corrupt session -- clear it
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
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

      // --- Look up user ---
      if (portal === "admin") {
        const admins = getAllAdmins();
        const admin = admins.find((a) => a.id === trimmedId);

        if (!admin) {
          return { success: false, error: "Identifiant ou mot de passe incorrect" };
        }
        if (!admin.isActive) {
          return { success: false, error: "Ce compte administrateur est d\u00e9sactiv\u00e9" };
        }
        if (admin.password !== password) {
          return { success: false, error: "Identifiant ou mot de passe incorrect" };
        }

        const authUser: AuthUser = {
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: admin.role,
          portalType: "admin",
        };

        // Persist
        localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
        setCookie("immogest_portal", "admin");
        setCookie("immogest_user_id", admin.id);
        setUser(authUser);

        return { success: true, redirectTo: "/admin" };
      } else {
        // Client portal
        const tenants = getAllTenants();
        const tenant = tenants.find((t) => t.id === trimmedId);

        if (!tenant) {
          return { success: false, error: "Identifiant ou mot de passe incorrect" };
        }
        if (tenant.status === "suspended") {
          return { success: false, error: "Ce compte client est suspendu" };
        }
        if (tenant.status === "inactive") {
          return { success: false, error: "Ce compte client est inactif" };
        }
        if (tenant.password !== password) {
          return { success: false, error: "Identifiant ou mot de passe incorrect" };
        }

        const authUser: AuthUser = {
          id: tenant.id,
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          email: tenant.email,
          role: "tenant",
          portalType: "client",
        };

        // Check if the tenant must change their password on first login
        if (tenant.mustChangePassword) {
          // Still persist so the change-password page knows who they are
          localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
          setCookie("immogest_portal", "client");
          setCookie("immogest_user_id", tenant.id);
          setUser(authUser);

          return {
            success: true,
            mustChangePassword: true,
            redirectTo: "/change-password",
          };
        }

        // Normal login
        localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
        setCookie("immogest_portal", "client");
        setCookie("immogest_user_id", tenant.id);
        setUser(authUser);

        return { success: true, redirectTo: "/client" };
      }
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Logout
  // -----------------------------------------------------------------------
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    deleteCookie("immogest_portal");
    deleteCookie("immogest_user_id");
  }, []);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
