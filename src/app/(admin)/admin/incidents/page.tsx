"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Card, Button, Input, Select, Modal, EmptyState } from "@/components/ui";
import { IncidentForm } from "@/components/forms/IncidentForm";
import { AlertTriangle, Search, Plus, Eye } from "lucide-react";
import {
  incidentStatusLabels,
  incidentStatusColors,
  incidentPriorityLabels,
  incidentPriorityColors,
} from "@/lib/constants";
import type { Incident } from "@/types/incident";

export default function IncidentsPage() {
  const { incidents, buildings, apartments, tenants, admins, addIncident } = useData();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const [showModal, setShowModal] = useState(false);

  const buildingOptions = [
    { value: "", label: "Tous les immeubles" },
    ...buildings.map((b) => ({ value: b.id, label: b.name })),
  ];

  const statusOptions = [
    { value: "", label: "Tous les statuts" },
    { value: "new", label: "Nouveau" },
    { value: "in_progress", label: "En cours" },
    { value: "resolved", label: "R\u00e9solu" },
    { value: "closed", label: "Ferm\u00e9" },
  ];

  const priorityOptions = [
    { value: "", label: "Toutes les priorit\u00e9s" },
    { value: "low", label: "Basse" },
    { value: "medium", label: "Moyenne" },
    { value: "high", label: "Haute" },
    { value: "urgent", label: "Urgente" },
  ];

  const filtered = useMemo(() => {
    const list = incidents.filter((inc) => {
      if (filterStatus && inc.status !== filterStatus) return false;
      if (filterPriority && inc.priority !== filterPriority) return false;
      if (filterBuilding && inc.buildingId !== filterBuilding) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !inc.title.toLowerCase().includes(q) &&
          !inc.id.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [incidents, filterStatus, filterPriority, filterBuilding, search]);

  function getBuildingName(id: string): string {
    return buildings.find((b) => b.id === id)?.name ?? "--";
  }

  function getAptUnit(id: string): string {
    return apartments.find((a) => a.id === id)?.unitNumber ?? "--";
  }

  function getReporterName(id: string): string {
    const tenant = tenants.find((t) => t.id === id);
    if (tenant) return `${tenant.firstName} ${tenant.lastName}`;
    const admin = admins.find((a) => a.id === id);
    if (admin) return `${admin.firstName} ${admin.lastName}`;
    return "--";
  }

  async function handleAdd(data: Omit<Incident, "id" | "createdAt">) {
    try {
      await addIncident({
        ...data,
        reportedBy: user?.id ?? "",
      });
      setShowModal(false);
      showToast("Incident cr\u00e9\u00e9 avec succ\u00e8s", "success");
    } catch {
      showToast("Erreur lors de l'op\u00e9ration", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#171717]">Incidents</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Nouveau incident
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par titre ou ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="w-full sm:w-40">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={statusOptions}
            />
          </div>
          <div className="w-full sm:w-40">
            <Select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              options={priorityOptions}
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
            icon={<AlertTriangle className="h-10 w-10" />}
            title="Aucun incident trouv\u00e9"
            description="Ajustez vos filtres ou cr\u00e9ez un nouvel incident."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Titre</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Immeuble</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Apt</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Signal&eacute; par</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Statut</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Priorit&eacute;</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-[#6b7280]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inc) => (
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
                    <td className="px-4 py-3 text-[#6b7280]">
                      {getBuildingName(inc.buildingId)}
                    </td>
                    <td className="px-4 py-3 text-[#6b7280]">
                      {getAptUnit(inc.apartmentId)}
                    </td>
                    <td className="px-4 py-3 text-[#6b7280]">
                      {getReporterName(inc.reportedBy)}
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
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/incidents/${inc.id}`}
                        className="rounded-lg p-1.5 text-[#6b7280] hover:bg-gray-100 hover:text-[#171717] transition-colors inline-flex"
                        title="Voir d\u00e9tails"
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

      {/* Add Incident Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nouveau incident"
        size="lg"
      >
        <IncidentForm
          onSubmit={handleAdd}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
