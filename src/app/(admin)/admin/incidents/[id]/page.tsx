"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import type { IncidentStatus, IncidentPriority } from "@/types/incident";
import { Card, Button, Select, Textarea, EmptyState } from "@/components/ui";
import {
  ArrowLeft,
  AlertTriangle,
  Building2,
  DoorOpen,
  User,
  UserCheck,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  incidentStatusLabels,
  incidentStatusColors,
  incidentPriorityLabels,
  incidentPriorityColors,
} from "@/lib/constants";

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const {
    getIncident,
    getBuilding,
    getApartment,
    getTenant,
    getAdmin,
    admins,
    updateIncident,
  } = useData();

  const incidentId = params.id as string;
  const incident = getIncident(incidentId);

  const [status, setStatus] = useState(incident?.status ?? "new");
  const [priority, setPriority] = useState(incident?.priority ?? "medium");
  const [assignedTo, setAssignedTo] = useState(incident?.assignedTo ?? "");
  const [resolutionNote, setResolutionNote] = useState("");

  if (!incident) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/admin/incidents")}>
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <EmptyState
          icon={<AlertTriangle className="h-10 w-10" />}
          title="Incident introuvable"
          description="L'incident demandé n'existe pas."
        />
      </div>
    );
  }

  const building = getBuilding(incident.buildingId);
  const apartment = getApartment(incident.apartmentId);
  const reporter = (() => {
    const tenant = getTenant(incident.reportedBy);
    if (tenant) return { name: `${tenant.firstName} ${tenant.lastName}`, id: tenant.id, type: "client" as const };
    const admin = getAdmin(incident.reportedBy);
    if (admin) return { name: `${admin.firstName} ${admin.lastName}`, id: admin.id, type: "admin" as const };
    return { name: incident.reportedBy, id: incident.reportedBy, type: "unknown" as const };
  })();

  const assignedAdmin = incident.assignedTo ? getAdmin(incident.assignedTo) : null;

  const statusOptions = [
    { value: "new", label: "Nouveau" },
    { value: "in_progress", label: "En cours" },
    { value: "resolved", label: "Résolu" },
    { value: "closed", label: "Fermé" },
  ];

  const priorityOptions = [
    { value: "low", label: "Basse" },
    { value: "medium", label: "Moyenne" },
    { value: "high", label: "Haute" },
    { value: "urgent", label: "Urgente" },
  ];

  const adminOptions = [
    { value: "", label: "-- Non assigné --" },
    ...admins
      .filter((a) => a.isActive)
      .map((a) => ({ value: a.id, label: `${a.firstName} ${a.lastName}` })),
  ];

  async function handleSave() {
    const updates: Record<string, unknown> = {
      status,
      priority,
      assignedTo: assignedTo || null,
    };

    if (status === "resolved" && incident && incident.status !== "resolved") {
      updates.resolvedAt = new Date().toISOString();
    }

    try {
      await updateIncident(incidentId, updates);
      showToast("Incident modifié avec succès", "success");
    } catch {
      showToast("Erreur lors de l'opération", "error");
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/admin/incidents")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#171717]">
              {incident.title}
            </h1>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-xs text-[#6b7280]">{incident.id}</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                incidentStatusColors[incident.status] ?? ""
              }`}
            >
              {incidentStatusLabels[incident.status] ?? incident.status}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                incidentPriorityColors[incident.priority] ?? ""
              }`}
            >
              {incidentPriorityLabels[incident.priority] ?? incident.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card header={<h2 className="font-semibold text-[#171717]">Description</h2>}>
        <p className="text-sm text-[#171717] whitespace-pre-wrap">
          {incident.description}
        </p>
      </Card>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location */}
        <Card
          header={
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#6b7280]" />
              <h2 className="font-semibold text-[#171717]">Localisation</h2>
            </div>
          }
        >
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#6b7280]">Immeuble</dt>
              <dd className="font-medium text-[#171717]">
                {building ? (
                  <Link
                    href={`/admin/buildings/${building.id}`}
                    className="hover:text-[#10b981]"
                  >
                    {building.name}
                  </Link>
                ) : (
                  "--"
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6b7280]">Appartement</dt>
              <dd className="font-medium text-[#171717]">
                {apartment ? (
                  <Link
                    href={`/admin/apartments/${apartment.id}`}
                    className="hover:text-[#10b981]"
                  >
                    Unit&eacute; {apartment.unitNumber}
                  </Link>
                ) : (
                  "--"
                )}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Reporter & Assignment */}
        <Card
          header={
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#6b7280]" />
              <h2 className="font-semibold text-[#171717]">Personnes</h2>
            </div>
          }
        >
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#6b7280]">Signal&eacute; par</dt>
              <dd className="font-medium text-[#171717]">
                {reporter.type === "client" ? (
                  <Link
                    href={`/admin/clients/${reporter.id}`}
                    className="hover:text-[#10b981]"
                  >
                    {reporter.name}
                  </Link>
                ) : (
                  reporter.name
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6b7280]">Assign&eacute; &agrave;</dt>
              <dd className="font-medium text-[#171717]">
                {assignedAdmin
                  ? `${assignedAdmin.firstName} ${assignedAdmin.lastName}`
                  : "Non assigné"}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Dates */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#6b7280]" />
            <h2 className="font-semibold text-[#171717]">Dates</h2>
          </div>
        }
      >
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-[#6b7280]">Cr&eacute;&eacute; le</dt>
            <dd className="font-medium text-[#171717] mt-0.5">
              {new Date(incident.createdAt).toLocaleDateString("fr-CA")}{" "}
              {new Date(incident.createdAt).toLocaleTimeString("fr-CA", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </dd>
          </div>
          <div>
            <dt className="text-[#6b7280]">R&eacute;solu le</dt>
            <dd className="font-medium text-[#171717] mt-0.5">
              {incident.resolvedAt
                ? `${new Date(incident.resolvedAt).toLocaleDateString("fr-CA")} ${new Date(
                    incident.resolvedAt
                  ).toLocaleTimeString("fr-CA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Non résolu"}
            </dd>
          </div>
        </dl>
      </Card>

      {/* Management Actions */}
      <Card header={<h2 className="font-semibold text-[#171717]">Gestion de l&apos;incident</h2>}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Statut"
              value={status}
              onChange={(e) => setStatus(e.target.value as IncidentStatus)}
              options={statusOptions}
            />
            <Select
              label="Priorit&eacute;"
              value={priority}
              onChange={(e) => setPriority(e.target.value as IncidentPriority)}
              options={priorityOptions}
            />
            <Select
              label="Assign&eacute; &agrave;"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              options={adminOptions}
            />
          </div>

          <Textarea
            label="Notes de r&eacute;solution"
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder="D&eacute;crivez les actions prises pour r&eacute;soudre l'incident..."
          />

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              <CheckCircle2 className="h-4 w-4" />
              Enregistrer les modifications
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
