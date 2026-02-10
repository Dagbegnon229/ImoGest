"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, StatsCard, Badge } from "@/components/ui";
import {
  Building2,
  DoorOpen,
  Users,
  AlertTriangle,
  ClipboardList,
  ArrowRight,
  Plus,
} from "lucide-react";
import {
  incidentStatusLabels,
  incidentStatusColors,
  incidentPriorityLabels,
  incidentPriorityColors,
  tenantStatusLabels,
  tenantStatusColors,
} from "@/lib/constants";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { buildings, apartments, tenants, incidents, applications } = useData();
  const [showNewMenu, setShowNewMenu] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        newMenuRef.current &&
        !newMenuRef.current.contains(event.target as Node)
      ) {
        setShowNewMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const stats = useMemo(() => {
    const activeTenants = tenants.filter((t) => t.status === "active").length;
    const openIncidents = incidents.filter(
      (i) => i.status === "new" || i.status === "in_progress"
    ).length;
    const pendingApps = applications.filter(
      (a) => a.status === "pending_review"
    ).length;

    return {
      buildings: buildings.length,
      apartments: apartments.length,
      activeTenants,
      openIncidents,
      pendingApps,
    };
  }, [buildings, apartments, tenants, incidents, applications]);

  const recentIncidents = useMemo(
    () =>
      [...incidents]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [incidents]
  );

  const recentTenants = useMemo(
    () =>
      [...tenants]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [tenants]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Tableau de bord</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Bienvenue, {user?.firstName}. Voici un aper&ccedil;u de votre plateforme.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats.pendingApps > 0 && (
            <Link href="/admin/applications">
              <Badge variant="warning" className="cursor-pointer px-3 py-1.5 text-sm">
                <ClipboardList className="h-4 w-4 mr-1.5" />
                {stats.pendingApps} demande{stats.pendingApps > 1 ? "s" : ""} en attente
              </Badge>
            </Link>
          )}
          <div className="relative" ref={newMenuRef}>
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#10b981] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#059669] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nouveau
            </button>
            {showNewMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white border border-[#e5e7eb] shadow-lg z-20">
                <Link
                  href="/admin/buildings"
                  onClick={() => setShowNewMenu(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#171717] hover:bg-[#f8fafc] rounded-t-lg"
                >
                  <Building2 className="h-4 w-4 text-[#6b7280]" />
                  Immeuble
                </Link>
                <Link
                  href="/admin/apartments"
                  onClick={() => setShowNewMenu(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#171717] hover:bg-[#f8fafc]"
                >
                  <DoorOpen className="h-4 w-4 text-[#6b7280]" />
                  Appartement
                </Link>
                <Link
                  href="/admin/clients/new"
                  onClick={() => setShowNewMenu(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#171717] hover:bg-[#f8fafc]"
                >
                  <Users className="h-4 w-4 text-[#6b7280]" />
                  Client
                </Link>
                <Link
                  href="/admin/incidents"
                  onClick={() => setShowNewMenu(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#171717] hover:bg-[#f8fafc] rounded-b-lg"
                >
                  <AlertTriangle className="h-4 w-4 text-[#6b7280]" />
                  Incident
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Immeubles"
          value={stats.buildings}
          icon={<Building2 className="h-6 w-6" />}
        />
        <StatsCard
          label="Appartements"
          value={stats.apartments}
          icon={<DoorOpen className="h-6 w-6" />}
        />
        <StatsCard
          label="Locataires actifs"
          value={stats.activeTenants}
          icon={<Users className="h-6 w-6" />}
        />
        <StatsCard
          label="Incidents ouverts"
          value={stats.openIncidents}
          icon={<AlertTriangle className="h-6 w-6" />}
        />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#171717]">Incidents r&eacute;cents</h2>
              <Link
                href="/admin/incidents"
                className="text-sm text-[#10b981] hover:underline flex items-center gap-1"
              >
                Voir tout <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          }
          padding={false}
        >
          {recentIncidents.length === 0 ? (
            <p className="p-6 text-sm text-[#6b7280] text-center">
              Aucun incident enregistr&eacute;.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                    <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Titre</th>
                    <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Statut</th>
                    <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Priorit&eacute;</th>
                  </tr>
                </thead>
                <tbody>
                  {recentIncidents.map((incident) => (
                    <tr
                      key={incident.id}
                      className="border-b border-[#e5e7eb] last:border-0 hover:bg-[#f8fafc]"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/incidents/${incident.id}`}
                          className="text-[#171717] hover:text-[#10b981] font-medium"
                        >
                          {incident.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            incidentStatusColors[incident.status] ?? ""
                          }`}
                        >
                          {incidentStatusLabels[incident.status] ?? incident.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            incidentPriorityColors[incident.priority] ?? ""
                          }`}
                        >
                          {incidentPriorityLabels[incident.priority] ?? incident.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Recent Clients */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#171717]">Clients r&eacute;cents</h2>
              <Link
                href="/admin/clients"
                className="text-sm text-[#10b981] hover:underline flex items-center gap-1"
              >
                Voir tout <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          }
          padding={false}
        >
          {recentTenants.length === 0 ? (
            <p className="p-6 text-sm text-[#6b7280] text-center">
              Aucun client enregistr&eacute;.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                    <th className="px-4 py-3 text-left font-medium text-[#6b7280]">ID</th>
                    <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Nom</th>
                    <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTenants.map((tenant) => (
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
                          className="text-[#171717] hover:text-[#10b981] font-medium"
                        >
                          {tenant.firstName} {tenant.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            tenantStatusColors[tenant.status] ?? ""
                          }`}
                        >
                          {tenantStatusLabels[tenant.status] ?? tenant.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
