"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus, Eye } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Button, EmptyState, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import {
  incidentStatusLabels,
  incidentStatusColors,
  incidentPriorityLabels,
  incidentPriorityColors,
} from "@/lib/constants";

export default function MyIncidentsPage() {
  const { user } = useAuth();
  const { tenants, getIncidentsByTenant, getBuilding, getApartment } =
    useData();
  const router = useRouter();

  const tenant = useMemo(
    () => tenants.find((t) => t.id === user?.id),
    [tenants, user?.id],
  );

  const incidents = useMemo(() => {
    if (!tenant) return [];
    return [...getIncidentsByTenant(tenant.id)].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [tenant, getIncidentsByTenant]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1b2d]">Mes incidents</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            {incidents.length} incident{incidents.length !== 1 ? "s" : ""}{" "}
            signalé{incidents.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/client/incidents/new">
          <Button variant="secondary" className="gap-2">
            <Plus className="h-4 w-4" />
            Signaler un incident
          </Button>
        </Link>
      </div>

      {/* Incidents Table */}
      <Card padding={false}>
        {incidents.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle className="h-10 w-10" />}
            title="Aucun incident signalé"
            description="Vous n'avez signalé aucun incident pour le moment. Utilisez le bouton ci-dessus pour en créer un."
            action={
              <Link href="/client/incidents/new">
                <Button variant="secondary" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Signaler un incident
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb]">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                    Titre
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                    Statut
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                    Priorité
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => {
                  const bld = getBuilding(incident.buildingId);
                  return (
                    <tr
                      key={incident.id}
                      className="border-b border-[#e5e7eb] last:border-0 hover:bg-[#f8fafc] cursor-pointer transition-colors"
                      onClick={() =>
                        router.push(`/client/incidents/${incident.id}`)
                      }
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#0f1b2d]">
                          {incident.title}
                        </p>
                        {bld && (
                          <p className="text-xs text-[#6b7280] mt-0.5">
                            {bld.name}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${incidentStatusColors[incident.status] || ""}`}
                        >
                          {incidentStatusLabels[incident.status] ||
                            incident.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${incidentPriorityColors[incident.priority] || ""}`}
                        >
                          {incidentPriorityLabels[incident.priority] ||
                            incident.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#6b7280]">
                        {formatDate(incident.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/client/incidents/${incident.id}`);
                          }}
                          className="inline-flex items-center gap-1 text-sm text-[#10b981] hover:text-[#059669] font-medium transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                        </button>
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
