"use client";

import { useState } from "react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { useData } from "@/contexts/DataContext";
import type { Incident, IncidentPriority } from "@/types/incident";

interface IncidentFormProps {
  initialData?: Incident;
  onSubmit: (data: Omit<Incident, "id" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
}

export function IncidentForm({ initialData, onSubmit, onClose }: IncidentFormProps) {
  const { buildings, getApartmentsByBuilding, admins } = useData();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [buildingId, setBuildingId] = useState(initialData?.buildingId ?? "");
  const [apartmentId, setApartmentId] = useState(initialData?.apartmentId ?? "");
  const [priority, setPriority] = useState(initialData?.priority ?? "medium");
  const [assignedTo, setAssignedTo] = useState(initialData?.assignedTo ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const buildingOptions = buildings.map((b) => ({
    value: b.id,
    label: `${b.name} - ${b.city}`,
  }));

  const apartmentOptions = buildingId
    ? getApartmentsByBuilding(buildingId).map((a) => ({
        value: a.id,
        label: `Unité ${a.unitNumber} - Étage ${a.floor}`,
      }))
    : [];

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

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Le titre est requis";
    if (!description.trim()) e.description = "La description est requise";
    if (!buildingId) e.buildingId = "L'immeuble est requis";
    if (!apartmentId) e.apartmentId = "L'appartement est requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      buildingId,
      apartmentId,
      reportedBy: initialData?.reportedBy ?? "",
      assignedTo: assignedTo || null,
      status: initialData?.status ?? "new",
      priority: priority as Incident["priority"],
      resolvedAt: initialData?.resolvedAt ?? null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Titre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="Fuite d'eau dans la salle de bain"
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        placeholder="Décrivez l'incident en détail..."
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Immeuble"
          value={buildingId}
          onChange={(e) => {
            setBuildingId(e.target.value);
            setApartmentId("");
          }}
          options={buildingOptions}
          placeholder="Sélectionner un immeuble"
          error={errors.buildingId}
        />
        <Select
          label="Appartement"
          value={apartmentId}
          onChange={(e) => setApartmentId(e.target.value)}
          options={apartmentOptions}
          placeholder={buildingId ? "Sélectionner" : "Choisir un immeuble d'abord"}
          disabled={!buildingId}
          error={errors.apartmentId}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Priorité"
          value={priority}
          onChange={(e) => setPriority(e.target.value as IncidentPriority)}
          options={priorityOptions}
        />
        <Select
          label="Assigné à"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          options={adminOptions}
        />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e7eb]">
        <Button variant="outline" type="button" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit">
          {initialData ? "Mettre à jour" : "Créer l'incident"}
        </Button>
      </div>
    </form>
  );
}
