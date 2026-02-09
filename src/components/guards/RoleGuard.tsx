"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ShieldX } from "lucide-react";
import type { ReactNode } from "react";

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="rounded-full bg-red-50 p-4 mb-4">
          <ShieldX className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-[#171717] mb-2">
          Acc&egrave;s refus&eacute;
        </h2>
        <p className="text-sm text-[#6b7280] max-w-md">
          Vous n&apos;avez pas les permissions n&eacute;cessaires pour acc&eacute;der &agrave; cette page.
          Contactez un super administrateur si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
