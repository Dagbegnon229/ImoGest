"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { Card, Button, Input, Select, Modal, Badge, EmptyState } from "@/components/ui";
import { ApartmentForm } from "@/components/forms/ApartmentForm";
import { DoorOpen, Search, Plus, Pencil } from "lucide-react";
import {
  apartmentStatusLabels,
  apartmentStatusColors,
} from "@/lib/constants";
import type { Apartment } from "@/types/apartment";

export default function ApartmentsPage() {
  const { apartments, buildings, tenants, addApartment, updateApartment } = useData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingApt, setEditingApt] = useState<Apartment | null>(null);

  const buildingOptions = [
    { value: "", label: "Tous les immeubles" },
    ...buildings.map((b) => ({ value: b.id, label: b.name })),
  ];

  const statusOptions = [
    { value: "", label: "Tous les statuts" },
    { value: "available", label: "Disponible" },
    { value: "occupied", label: "Occup\u00e9" },
    { value: "maintenance", label: "En maintenance" },
    { value: "reserved", label: "R\u00e9serv\u00e9" },
  ];

  const filtered = useMemo(() => {
    return apartments.filter((apt) => {
      if (filterBuilding && apt.buildingId !== filterBuilding) return false;
      if (filterStatus && apt.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        const building = buildings.find((b) => b.id === apt.buildingId);
        const bName = building?.name.toLowerCase() ?? "";
        if (
          !apt.unitNumber.toLowerCase().includes(q) &&
          !bName.includes(q)
        )
          return false;
      }
      return true;
    });
  }, [apartments, buildings, filterBuilding, filterStatus, search]);

  function getBuildingName(id: string): string {
    return buildings.find((b) => b.id === id)?.name ?? "--";
  }

  function getTenantName(tenantId: string | null): string {
    if (!tenantId) return "--";
    const t = tenants.find((te) => te.id === tenantId);
    return t ? `${t.firstName} ${t.lastName}` : "--";
  }

  async function handleAdd(data: Omit<Apartment, "id">) {
    try {
      await addApartment(data);
      setShowModal(false);
      showToast("Appartement cr\u00e9\u00e9 avec succ\u00e8s", "success");
    } catch {
      showToast("Erreur lors de l'op\u00e9ration", "error");
    }
  }

  async function handleEdit(data: Omit<Apartment, "id">) {
    if (!editingApt) return;
    try {
      await updateApartment(editingApt.id, data);
      setEditingApt(null);
      showToast("Appartement modifi\u00e9 avec succ\u00e8s", "success");
    } catch {
      showToast("Erreur lors de l'op\u00e9ration", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#171717]">Appartements</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Ajouter un appartement
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par unit\u00e9 ou immeuble..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={filterBuilding}
              onChange={(e) => setFilterBuilding(e.target.value)}
              options={buildingOptions}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={statusOptions}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<DoorOpen className="h-10 w-10" />}
            title="Aucun appartement trouv\u00e9"
            description="Ajustez vos filtres ou ajoutez un nouvel appartement."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Unit&eacute;</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Immeuble</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">&Eacute;tage</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Pi&egrave;ces</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Surface</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Loyer</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Statut</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Locataire</th>
                  <th className="px-4 py-3 text-right font-medium text-[#6b7280]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((apt) => (
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
                    <td className="px-4 py-3 text-[#6b7280]">
                      {getBuildingName(apt.buildingId)}
                    </td>
                    <td className="px-4 py-3 text-[#6b7280]">{apt.floor}</td>
                    <td className="px-4 py-3 text-[#6b7280]">{apt.rooms}</td>
                    <td className="px-4 py-3 text-[#6b7280]">{apt.area} m&sup2;</td>
                    <td className="px-4 py-3 text-[#6b7280]">{apt.rent} $</td>
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
                      {apt.tenantId ? (
                        <Link
                          href={`/admin/clients/${apt.tenantId}`}
                          className="hover:text-[#10b981]"
                        >
                          {getTenantName(apt.tenantId)}
                        </Link>
                      ) : (
                        "--"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditingApt(apt)}
                        className="rounded-lg p-1.5 text-[#6b7280] hover:bg-gray-100 hover:text-[#171717] transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Ajouter un appartement"
        size="lg"
      >
        <ApartmentForm onSubmit={handleAdd} onClose={() => setShowModal(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingApt}
        onClose={() => setEditingApt(null)}
        title="Modifier l'appartement"
        size="lg"
      >
        {editingApt && (
          <ApartmentForm
            initialData={editingApt}
            onSubmit={handleEdit}
            onClose={() => setEditingApt(null)}
          />
        )}
      </Modal>
    </div>
  );
}
