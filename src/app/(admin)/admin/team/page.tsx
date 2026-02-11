"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import { useData } from "@/contexts/DataContext";
import { Card, Button, EmptyState } from "@/components/ui";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { ShieldCheck, Plus, UserCheck, UserX } from "lucide-react";
import { adminRoleLabels, adminRoleColors } from "@/lib/constants";

function TeamContent() {
  const { admins, customRoles } = useData();

  // Build a lookup map: role name -> { label, color }
  const roleMeta = useMemo(() => {
    const map: Record<string, { label: string; color: string }> = {};
    // Built-in roles
    for (const key of Object.keys(adminRoleLabels)) {
      map[key] = {
        label: adminRoleLabels[key],
        color: adminRoleColors[key] || "bg-gray-100 text-gray-800",
      };
    }
    // Custom roles
    for (const cr of customRoles) {
      map[cr.name] = { label: cr.label, color: cr.color };
    }
    return map;
  }, [customRoles]);

  const getRoleDisplay = useCallback(
    (role: string) => {
      return roleMeta[role] || { label: role, color: "bg-gray-100 text-gray-800" };
    },
    [roleMeta],
  );

  const sortedAdmins = useMemo(
    () =>
      [...admins].sort((a, b) => {
        const roleOrder: Record<string, number> = {
          super_admin: 0,
          admin_manager: 1,
          admin_support: 2,
        };
        // Custom roles come after built-in roles (order 3)
        const orderA = roleOrder[a.role] ?? 3;
        const orderB = roleOrder[b.role] ?? 3;
        if (orderA !== orderB) return orderA - orderB;
        return a.lastName.localeCompare(b.lastName);
      }),
    [admins],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#171717]">
          Équipe d&apos;administration
        </h1>
        <Link href="/admin/team/new">
          <Button>
            <Plus className="h-4 w-4" />
            Ajouter un admin
          </Button>
        </Link>
      </div>

      <Card padding={false}>
        {sortedAdmins.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="h-10 w-10" />}
            title="Aucun administrateur"
            description="Ajoutez votre premier administrateur."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Nom</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Rôle</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Statut</th>
                </tr>
              </thead>
              <tbody>
                {sortedAdmins.map((admin) => {
                  const roleDisplay = getRoleDisplay(admin.role);
                  return (
                    <tr
                      key={admin.id}
                      className="border-b border-[#e5e7eb] last:border-0 hover:bg-[#f8fafc]"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[#6b7280]">
                        {admin.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#171717]">
                        {admin.firstName} {admin.lastName}
                      </td>
                      <td className="px-4 py-3 text-[#6b7280]">{admin.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleDisplay.color}`}
                        >
                          {roleDisplay.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {admin.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#059669]">
                            <UserCheck className="h-3.5 w-3.5" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                            <UserX className="h-3.5 w-3.5" />
                            Inactif
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function TeamPage() {
  return (
    <RoleGuard allowedRoles={["super_admin"]}>
      <TeamContent />
    </RoleGuard>
  );
}
