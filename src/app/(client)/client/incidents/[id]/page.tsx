"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Building2,
  Home,
  Calendar,
  CheckCircle,
  ShieldAlert,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Badge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import {
  incidentStatusLabels,
  incidentStatusColors,
  incidentPriorityLabels,
  incidentPriorityColors,
} from "@/lib/constants";

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getIncident, getBuilding, getApartment, tenants } = useData();

  const tenant = useMemo(
    () => tenants.find((t) => t.id === user?.id),
    [tenants, user?.id],
  );

  const incident = useMemo(
    () => (id ? getIncident(id) : undefined),
    [id, getIncident],
  );

  const building = useMemo(
    () => (incident ? getBuilding(incident.buildingId) : undefined),
    [incident, getBuilding],
  );

  const apartment = useMemo(
    () => (incident ? getApartment(incident.apartmentId) : undefined),
    [incident, getApartment],
  );

  // Check access: incident must belong to this tenant
  const hasAccess = incident && tenant && incident.reportedBy === tenant.id;

  if (!incident) {
    return (
      <div className="space-y-6">
        <Link
          href="/client/incidents"
          className="inline-flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#0f1b2d] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux incidents
        </Link>
        <Card>
          <EmptyState
            icon={<AlertTriangle className="h-10 w-10" />}
            title="Incident introuvable"
            description="L'incident demandé n'existe pas ou a été supprimé."
          />
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <Link
          href="/client/incidents"
          className="inline-flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#0f1b2d] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux incidents
        </Link>
        <Card>
          <EmptyState
            icon={<ShieldAlert className="h-10 w-10" />}
            title="Accès refusé"
            description="Vous n'avez pas la permission de consulter cet incident."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/client/incidents"
        className="inline-flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#0f1b2d] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux incidents
      </Link>

      {/* Title + badges */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 className="text-2xl font-bold text-[#0f1b2d] flex-1">
          {incident.title}
        </h1>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${incidentStatusColors[incident.status] || ""}`}
          >
            {incidentStatusLabels[incident.status] || incident.status}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${incidentPriorityColors[incident.priority] || ""}`}
          >
            {incidentPriorityLabels[incident.priority] || incident.priority}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card
            header={
              <h2 className="text-base font-semibold text-[#0f1b2d]">
                Description
              </h2>
            }
          >
            <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">
              {incident.description}
            </p>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          {/* Dates */}
          <Card
            header={
              <h2 className="text-base font-semibold text-[#0f1b2d]">
                Informations
              </h2>
            }
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-[#6b7280] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#6b7280]">Date de signalement</p>
                  <p className="text-sm font-medium text-[#0f1b2d]">
                    {formatDate(incident.createdAt)}
                  </p>
                </div>
              </div>

              {incident.resolvedAt && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#6b7280]">Date de résolution</p>
                    <p className="text-sm font-medium text-[#0f1b2d]">
                      {formatDate(incident.resolvedAt)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-[#6b7280] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#6b7280]">Référence</p>
                  <p className="text-sm font-medium text-[#0f1b2d]">
                    {incident.id}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card
            header={
              <h2 className="text-base font-semibold text-[#0f1b2d]">
                Localisation
              </h2>
            }
          >
            <div className="space-y-4">
              {building && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-[#6b7280] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#6b7280]">Immeuble</p>
                    <p className="text-sm font-medium text-[#0f1b2d]">
                      {building.name}
                    </p>
                    <p className="text-xs text-[#6b7280]">
                      {building.address}, {building.city}
                    </p>
                  </div>
                </div>
              )}

              {apartment && (
                <div className="flex items-start gap-3">
                  <Home className="h-4 w-4 text-[#6b7280] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#6b7280]">Appartement</p>
                    <p className="text-sm font-medium text-[#0f1b2d]">
                      {apartment.unitNumber} - Étage {apartment.floor}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
