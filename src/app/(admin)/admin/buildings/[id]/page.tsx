"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { Card, StatsCard, Button, Badge, Modal, EmptyState } from "@/components/ui";
import { BuildingForm } from "@/components/forms/BuildingForm";
import {
  ArrowLeft,
  Building2,
  DoorOpen,
  Users,
  Wrench,
  Pencil,
  AlertTriangle,
} from "lucide-react";
import {
  apartmentStatusLabels,
  apartmentStatusColors,
  incidentStatusLabels,
  incidentStatusColors,
  incidentPriorityLabels,
  incidentPriorityColors,
} from "@/lib/constants";
import type { Building } from "@/types/building";

export default function BuildingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const {
    getBuilding,
    getApartmentsByBuilding,
    getIncidentsByBuilding,
    updateBuilding,
    tenants,
  } = useData();

  const buildingId = params.id as string;
  const building = getBuilding(buildingId);
  const [showEditModal, setShowEditModal] = useState(false);

  const buildingApartments = useMemo(
    () => getApartmentsByBuilding(buildingId),
    [getApartmentsByBuilding, buildingId]
  );

  const buildingIncidents = useMemo(
    () =>
      [...getIncidentsByBuilding(buildingId)].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [getIncidentsByBuilding, buildingId]
  );

  const stats = useMemo(() => {
    const occupied = buildingApartments.filter((a) => a.status === "occupied").length;
    const available = buildingApartments.filter((a) => a.status === "available").length;
    const maintenance = buildingApartments.filter((a) => a.status === "maintenance").length;
    return { total: buildingApartments.length, occupied, available, maintenance };
  }, [buildingApartments]);

  if (!building) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/admin/buildings")}>
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <EmptyState
          icon={<Building2 className="h-10 w-10" />}
          title="Immeuble introuvable"
          description="L'immeuble demand&eacute; n'existe pas."
        />
      </div>
    );
  }

  async function handleUpdate(data: Omit<Building, "id" | "createdAt">) {
    try {
      await updateBuilding(buildingId, data);
      setShowEditModal(false);
      showToast("Immeuble modifi\u00e9 avec succ\u00e8s", "success");
    } catch {
      showToast("Erreur lors de l'op\u00e9ration", "error");
    }
  }

  function getTenantName(tenantId: string | null): string {
    if (!tenantId) return "--";
    const t = tenants.find((te) => te.id === tenantId);
    return t ? `${t.firstName} ${t.lastName}` : "--";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/admin/buildings")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#171717]">{building.name}</h1>
          <p className="text-sm text-[#6b7280]">
            {building.address}, {building.city}, {building.province} {building.postalCode}
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowEditModal(true)}>
          <Pencil className="h-4 w-4" />
          Modifier
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total unit&eacute;s"
          value={stats.total}
          icon={<DoorOpen className="h-6 w-6" />}
        />
        <StatsCard
          label="Occup&eacute;s"
          value={stats.occupied}
          icon={<Users className="h-6 w-6" />}
        />
        <StatsCard
          label="Disponibles"
          value={stats.available}
          icon={<DoorOpen className="h-6 w-6" />}
        />
        <StatsCard
          label="Maintenance"
          value={stats.maintenance}
          icon={<Wrench className="h-6 w-6" />}
        />
      </div>

      {/* Apartments Table */}
      <Card
        header={
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#171717]">Appartements</h2>
            <Link href="/admin/apartments">
              <Button size="sm" variant="outline">
                G&eacute;rer les appartements
              </Button>
            </Link>
          </div>
        }
        padding={false}
      >
        {buildingApartments.length === 0 ? (
          <p className="p-6 text-sm text-[#6b7280] text-center">
            Aucun appartement dans cet immeuble.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Unit&eacute;</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">&Eacute;tage</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Pi&egrave;ces</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Loyer</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Statut</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Locataire</th>
                </tr>
              </thead>
              <tbody>
                {buildingApartments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="border-b border-[#e5e7eb] last:border-0 hover:bg-[#f8fafc]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/apartments/${apt.id}`}
                        className="font-medium text-[#171717] hover:text-[#10b981]"
                      >
                        {apt.unitNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#6b7280]">{apt.floor}</td>
                    <td className="px-4 py-3 text-[#6b7280]">{apt.rooms}</td>
                    <td className="px-4 py-3 text-[#6b7280]">{apt.rent} $/mois</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          apartmentStatusColors[apt.status] ?? ""
                        }`}
                      >
                        {apartmentStatusLabels[apt.status] ?? apt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#6b7280]">
                      {getTenantName(apt.tenantId)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Incidents Table */}
      <Card
        header={<h2 className="font-semibold text-[#171717]">Incidents</h2>}
        padding={false}
      >
        {buildingIncidents.length === 0 ? (
          <p className="p-6 text-sm text-[#6b7280] text-center">
            Aucun incident signal&eacute; pour cet immeuble.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Titre</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Statut</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Priorit&eacute;</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Date</th>
                </tr>
              </thead>
              <tbody>
                {buildingIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    className="border-b border-[#e5e7eb] last:border-0 hover:bg-[#f8fafc]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/incidents/${inc.id}`}
                        className="font-medium text-[#171717] hover:text-[#10b981]"
                      >
                        {inc.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          incidentStatusColors[inc.status] ?? ""
                        }`}
                      >
                        {incidentStatusLabels[inc.status] ?? inc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          incidentPriorityColors[inc.priority] ?? ""
                        }`}
                      >
                        {incidentPriorityLabels[inc.priority] ?? inc.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#6b7280]">
                      {new Date(inc.createdAt).toLocaleDateString("fr-CA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modifier l'immeuble"
        size="lg"
      >
        <BuildingForm
          initialData={building}
          onSubmit={handleUpdate}
          onClose={() => setShowEditModal(false)}
        />
      </Modal>
    </div>
  );
}
