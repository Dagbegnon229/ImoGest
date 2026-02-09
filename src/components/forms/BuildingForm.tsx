"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { useData } from "@/contexts/DataContext";
import type { Building } from "@/types/building";

interface BuildingFormProps {
  initialData?: Building;
  onSubmit: (data: Omit<Building, "id" | "createdAt">) => void;
  onClose: () => void;
}

export function BuildingForm({ initialData, onSubmit, onClose }: BuildingFormProps) {
  const { admins } = useData();

  const [name, setName] = useState(initialData?.name ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [city, setCity] = useState(initialData?.city ?? "");
  const [province, setProvince] = useState(initialData?.province ?? "");
  const [postalCode, setPostalCode] = useState(initialData?.postalCode ?? "");
  const [floors, setFloors] = useState(initialData?.floors?.toString() ?? "");
  const [totalUnits, setTotalUnits] = useState(initialData?.totalUnits?.toString() ?? "");
  const [yearBuilt, setYearBuilt] = useState(initialData?.yearBuilt?.toString() ?? "");
  const [managerId, setManagerId] = useState(initialData?.managerId ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const managerOptions = [
    { value: "", label: "-- Aucun --" },
    ...admins
      .filter((a) => a.isActive)
      .map((a) => ({ value: a.id, label: `${a.firstName} ${a.lastName}` })),
  ];

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Le nom est requis";
    if (!address.trim()) e.address = "L'adresse est requise";
    if (!city.trim()) e.city = "La ville est requise";
    if (!province.trim()) e.province = "La province est requise";
    if (!postalCode.trim()) e.postalCode = "Le code postal est requis";
    if (!floors || isNaN(Number(floors)) || Number(floors) < 1)
      e.floors = "Nombre d'\u00e9tages invalide";
    if (!totalUnits || isNaN(Number(totalUnits)) || Number(totalUnits) < 1)
      e.totalUnits = "Nombre d'unit\u00e9s invalide";
    if (!yearBuilt || isNaN(Number(yearBuilt)) || Number(yearBuilt) < 1800)
      e.yearBuilt = "Ann\u00e9e de construction invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      province: province.trim(),
      postalCode: postalCode.trim(),
      floors: Number(floors),
      totalUnits: Number(totalUnits),
      occupiedUnits: initialData?.occupiedUnits ?? 0,
      yearBuilt: Number(yearBuilt),
      managerId: managerId || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nom de l'immeuble"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="R\u00e9sidence du Parc"
      />
      <Input
        label="Adresse"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        error={errors.address}
        placeholder="123 Rue Principale"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Ville"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          error={errors.city}
          placeholder="Montr\u00e9al"
        />
        <Input
          label="Province"
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          error={errors.province}
          placeholder="QC"
        />
      </div>
      <Input
        label="Code postal"
        value={postalCode}
        onChange={(e) => setPostalCode(e.target.value)}
        error={errors.postalCode}
        placeholder="H2X 1Y4"
      />
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="\u00c9tages"
          type="number"
          value={floors}
          onChange={(e) => setFloors(e.target.value)}
          error={errors.floors}
          min={1}
        />
        <Input
          label="Unit\u00e9s totales"
          type="number"
          value={totalUnits}
          onChange={(e) => setTotalUnits(e.target.value)}
          error={errors.totalUnits}
          min={1}
        />
        <Input
          label="Ann\u00e9e de construction"
          type="number"
          value={yearBuilt}
          onChange={(e) => setYearBuilt(e.target.value)}
          error={errors.yearBuilt}
          min={1800}
          max={new Date().getFullYear()}
        />
      </div>
      <Select
        label="Gestionnaire (optionnel)"
        value={managerId}
        onChange={(e) => setManagerId(e.target.value)}
        options={managerOptions}
      />
      <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e7eb]">
        <Button variant="outline" type="button" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit">
          {initialData ? "Mettre \u00e0 jour" : "Cr\u00e9er l'immeuble"}
        </Button>
      </div>
    </form>
  );
}
