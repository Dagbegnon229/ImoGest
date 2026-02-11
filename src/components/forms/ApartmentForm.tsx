"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { useData } from "@/contexts/DataContext";
import type { Apartment, ApartmentStatus } from "@/types/apartment";

interface ApartmentFormProps {
  initialData?: Apartment;
  onSubmit: (data: Omit<Apartment, "id">) => void;
  onClose: () => void;
}

export function ApartmentForm({ initialData, onSubmit, onClose }: ApartmentFormProps) {
  const { buildings } = useData();

  const [buildingId, setBuildingId] = useState(initialData?.buildingId ?? "");
  const [unitNumber, setUnitNumber] = useState(initialData?.unitNumber ?? "");
  const [floor, setFloor] = useState(initialData?.floor?.toString() ?? "");
  const [rooms, setRooms] = useState(initialData?.rooms?.toString() ?? "");
  const [area, setArea] = useState(initialData?.area?.toString() ?? "");
  const [rent, setRent] = useState(initialData?.rent?.toString() ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "available");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const buildingOptions = buildings.map((b) => ({
    value: b.id,
    label: `${b.name} - ${b.city}`,
  }));

  const statusOptions = [
    { value: "available", label: "Disponible" },
    { value: "occupied", label: "Occup\u00e9" },
    { value: "maintenance", label: "En maintenance" },
    { value: "reserved", label: "R\u00e9serv\u00e9" },
  ];

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!buildingId) e.buildingId = "L'immeuble est requis";
    if (!unitNumber.trim()) e.unitNumber = "Le num\u00e9ro d'unit\u00e9 est requis";
    if (!floor || isNaN(Number(floor))) e.floor = "\u00c9tage invalide";
    if (!rooms || isNaN(Number(rooms)) || Number(rooms) < 1) e.rooms = "Nombre de pi\u00e8ces invalide";
    if (!area || isNaN(Number(area)) || Number(area) <= 0) e.area = "Surface invalide";
    if (!rent || isNaN(Number(rent)) || Number(rent) <= 0) e.rent = "Loyer invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      buildingId,
      unitNumber: unitNumber.trim(),
      floor: Number(floor),
      rooms: Number(rooms),
      area: Number(area),
      rent: Number(rent),
      status: status as Apartment["status"],
      tenantId: initialData?.tenantId ?? null,
      images: initialData?.images ?? [],
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Immeuble"
        value={buildingId}
        onChange={(e) => setBuildingId(e.target.value)}
        options={buildingOptions}
        placeholder="S\u00e9lectionner un immeuble"
        error={errors.buildingId}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Num\u00e9ro d'unit\u00e9"
          value={unitNumber}
          onChange={(e) => setUnitNumber(e.target.value)}
          error={errors.unitNumber}
          placeholder="101"
        />
        <Input
          label="\u00c9tage"
          type="number"
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
          error={errors.floor}
          min={0}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Pi\u00e8ces"
          type="number"
          value={rooms}
          onChange={(e) => setRooms(e.target.value)}
          error={errors.rooms}
          min={1}
        />
        <Input
          label="Surface (m\u00b2)"
          type="number"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          error={errors.area}
          min={1}
        />
        <Input
          label="Loyer ($)"
          type="number"
          value={rent}
          onChange={(e) => setRent(e.target.value)}
          error={errors.rent}
          min={0}
        />
      </div>
      <Select
        label="Statut"
        value={status}
        onChange={(e) => setStatus(e.target.value as ApartmentStatus)}
        options={statusOptions}
      />
      <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e7eb]">
        <Button variant="outline" type="button" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit">
          {initialData ? "Mettre \u00e0 jour" : "Cr\u00e9er l'appartement"}
        </Button>
      </div>
    </form>
  );
}
