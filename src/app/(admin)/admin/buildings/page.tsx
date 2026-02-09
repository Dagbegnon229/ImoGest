"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { Card, Button, Input, Modal, EmptyState } from "@/components/ui";
import { BuildingForm } from "@/components/forms/BuildingForm";
import { Building2, Search, Plus, Pencil, Trash2 } from "lucide-react";
import type { Building } from "@/types/building";

export default function BuildingsPage() {
  const { buildings, apartments, addBuilding, updateBuilding, deleteBuilding } = useData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return buildings;
    return buildings.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q)
    );
  }, [buildings, search]);

  function getOccupancy(buildingId: string) {
    const apts = apartments.filter((a) => a.buildingId === buildingId);
    const occupied = apts.filter((a) => a.status === "occupied").length;
    return { occupied, total: apts.length };
  }

  async function handleAdd(data: Omit<Building, "id" | "createdAt">) {
    await addBuilding(data);
    setShowModal(false);
    showToast("Immeuble cr\u00e9\u00e9 avec succ\u00e8s", "success");
  }

  async function handleEdit(data: Omit<Building, "id" | "createdAt">) {
    if (!editingBuilding) return;
    await updateBuilding(editingBuilding.id, data);
    setEditingBuilding(null);
    showToast("Immeuble mis \u00e0 jour", "success");
  }

  async function handleDelete(id: string) {
    const apts = apartments.filter((a) => a.buildingId === id);
    if (apts.length > 0) {
      showToast("Impossible de supprimer un immeuble avec des appartements", "error");
      return;
    }
    await deleteBuilding(id);
    showToast("Immeuble supprim\u00e9", "success");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#171717]">Immeubles</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Ajouter un immeuble
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Rechercher par nom, adresse ou ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-10 w-10" />}
            title="Aucun immeuble trouv\u00e9"
            description={
              search
                ? "Aucun r\u00e9sultat pour votre recherche."
                : "Commencez par ajouter votre premier immeuble."
            }
            action={
              !search ? (
                <Button onClick={() => setShowModal(true)} size="sm">
                  <Plus className="h-4 w-4" />
                  Ajouter un immeuble
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Nom</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Adresse</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Ville</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Unit&eacute;s</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">&Eacute;tages</th>
                  <th className="px-4 py-3 text-right font-medium text-[#6b7280]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((building) => {
                  const occ = getOccupancy(building.id);
                  return (
                    <tr
                      key={building.id}
                      className="border-b border-[#e5e7eb] last:border-0 hover:bg-[#f8fafc] cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/buildings/${building.id}`}
                          className="font-medium text-[#171717] hover:text-[#10b981]"
                        >
                          {building.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[#6b7280]">{building.address}</td>
                      <td className="px-4 py-3 text-[#6b7280]">{building.city}</td>
                      <td className="px-4 py-3 text-[#6b7280]">
                        {occ.occupied}/{occ.total}
                      </td>
                      <td className="px-4 py-3 text-[#6b7280]">{building.floors}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingBuilding(building);
                            }}
                            className="rounded-lg p-1.5 text-[#6b7280] hover:bg-gray-100 hover:text-[#171717] transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(building.id);
                            }}
                            className="rounded-lg p-1.5 text-[#6b7280] hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Building Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Ajouter un immeuble"
        size="lg"
      >
        <BuildingForm onSubmit={handleAdd} onClose={() => setShowModal(false)} />
      </Modal>

      {/* Edit Building Modal */}
      <Modal
        isOpen={!!editingBuilding}
        onClose={() => setEditingBuilding(null)}
        title="Modifier l'immeuble"
        size="lg"
      >
        {editingBuilding && (
          <BuildingForm
            initialData={editingBuilding}
            onSubmit={handleEdit}
            onClose={() => setEditingBuilding(null)}
          />
        )}
      </Modal>
    </div>
  );
}
