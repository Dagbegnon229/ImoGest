"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useData } from "@/contexts/DataContext";
import { Card, Button, Input, Select, Badge, EmptyState } from "@/components/ui";
import { Users, Search, Plus, ClipboardList, Eye } from "lucide-react";
import {
  tenantStatusLabels,
  tenantStatusColors,
} from "@/lib/constants";
import { getTimeAgo } from "@/lib/utils";

export default function ClientsPage() {
  const { tenants, buildings, apartments, applications } = useData();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");

  const pendingAppsCount = applications.filter(
    (a) => a.status === "pending_review"
  ).length;

  const buildingOptions = [
    { value: "", label: "Tous les immeubles" },
    ...buildings.map((b) => ({ value: b.id, label: b.name })),
  ];

  const statusOptions = [
    { value: "", label: "Tous les statuts" },
    { value: "active", label: "Actif" },
    { value: "inactive", label: "Inactif" },
    { value: "pending_approval", label: "En attente" },
    { value: "suspended", label: "Suspendu" },
  ];

  const filtered = useMemo(() => {
    return tenants.filter((t) => {
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterBuilding && t.buildingId !== filterBuilding) return false;
      if (search) {
        const q = search.toLowerCase();
        const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
        if (
          !fullName.includes(q) &&
          !t.id.toLowerCase().includes(q) &&
          !t.email.toLowerCase().includes(q) &&
          !t.phone.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [tenants, filterStatus, filterBuilding, search]);

  function getBuildingName(id: string | null): string {
    if (!id) return "--";
    return buildings.find((b) => b.id === id)?.name ?? "--";
  }

  function getAptUnit(id: string | null): string {
    if (!id) return "--";
    return apartments.find((a) => a.id === id)?.unitNumber ?? "--";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#171717]">Clients</h1>
        <div className="flex items-center gap-3">
          {pendingAppsCount > 0 && (
            <Link href="/admin/applications">
              <Badge variant="warning" className="cursor-pointer px-3 py-1.5 text-sm">
                <ClipboardList className="h-4 w-4 mr-1.5" />
                {pendingAppsCount} demande{pendingAppsCount > 1 ? "s" : ""}
              </Badge>
            </Link>
          )}
          <Link href="/admin/clients/new">
            <Button>
              <Plus className="h-4 w-4" />
              Ajouter un client
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par nom, ID, email ou téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={statusOptions}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={filterBuilding}
              onChange={(e) => setFilterBuilding(e.target.value)}
              options={buildingOptions}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="Aucun client trouvé"
            description="Ajustez vos filtres ou ajoutez un nouveau client."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Nom</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">T&eacute;l&eacute;phone</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Immeuble</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Apt</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Statut</th>
                  <th className="px-4 py-3 text-right font-medium text-[#6b7280]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="border-b border-[#e5e7eb] last:border-0 hover:bg-[#f8fafc]"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[#6b7280]">
                      {tenant.id}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/clients/${tenant.id}`}
                        className="font-medium text-[#171717] hover:text-[#10b981]"
                      >
                        {tenant.firstName} {tenant.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#6b7280]">{tenant.email}</td>
                    <td className="px-4 py-3 text-[#6b7280]">{tenant.phone}</td>
                    <td className="px-4 py-3 text-[#6b7280]">
                      {getBuildingName(tenant.buildingId)}
                    </td>
                    <td className="px-4 py-3 text-[#6b7280]">
                      {getAptUnit(tenant.apartmentId)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium w-fit ${
                            tenantStatusColors[tenant.status] ?? ""
                          }`}
                        >
                          {tenantStatusLabels[tenant.status] ?? tenant.status}
                        </span>
                        {(tenant.statusChangedAt || tenant.createdAt) && (
                          <span className="text-[10px] text-[#9ca3af]">
                            {getTimeAgo(tenant.statusChangedAt || tenant.createdAt)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/clients/${tenant.id}`}
                        className="rounded-lg p-1.5 text-[#6b7280] hover:bg-gray-100 hover:text-[#171717] transition-colors inline-flex"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
