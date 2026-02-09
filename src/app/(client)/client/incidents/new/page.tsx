"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Building2, Home } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Card, Button, Input, Textarea, Select, EmptyState } from "@/components/ui";
import type { IncidentPriority } from "@/types/incident";

const priorityOptions = [
  { value: "low", label: "Basse" },
  { value: "medium", label: "Moyenne" },
  { value: "high", label: "Haute" },
  { value: "urgent", label: "Urgente" },
];

export default function NewIncidentPage() {
  const { user } = useAuth();
  const { tenants, getBuilding, getApartment, addIncident } = useData();
  const { toast } = useToast();
  const router = useRouter();

  const tenant = useMemo(
    () => tenants.find((t) => t.id === user?.id),
    [tenants, user?.id],
  );

  const building = useMemo(
    () => (tenant?.buildingId ? getBuilding(tenant.buildingId) : undefined),
    [tenant?.buildingId, getBuilding],
  );

  const apartment = useMemo(
    () => (tenant?.apartmentId ? getApartment(tenant.apartmentId) : undefined),
    [tenant?.apartmentId, getApartment],
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<IncidentPriority>("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  if (!building || !apartment || !tenant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/client/incidents"
            className="inline-flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#0f1b2d] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </div>
        <Card>
          <EmptyState
            icon={<Home className="h-10 w-10" />}
            title="Impossible de signaler un incident"
            description="Aucun logement ne vous est assigné. Veuillez contacter votre gestionnaire."
          />
        </Card>
      </div>
    );
  }

  function validate(): boolean {
    const newErrors: { title?: string; description?: string } = {};
    if (!title.trim()) {
      newErrors.title = "Le titre est requis";
    }
    if (!description.trim()) {
      newErrors.description = "La description est requise";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await addIncident({
        title: title.trim(),
        description: description.trim(),
        buildingId: tenant!.buildingId!,
        apartmentId: tenant!.apartmentId!,
        reportedBy: user!.id,
        assignedTo: null,
        status: "new",
        priority,
        resolvedAt: null,
      });

      toast({
        type: "success",
        title: "Incident signalé avec succès",
        description: "Votre incident a été enregistré et sera traité prochainement.",
      });

      router.push("/client/incidents");
    } catch {
      toast({
        type: "error",
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'incident.",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div className="flex items-center gap-3">
        <Link
          href="/client/incidents"
          className="inline-flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#0f1b2d] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux incidents
        </Link>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f1b2d]">
          Signaler un incident
        </h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Décrivez le problème rencontré dans votre logement
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location info (read-only) */}
        <Card
          header={
            <h2 className="text-base font-semibold text-[#0f1b2d]">
              Localisation
            </h2>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg">
              <Building2 className="h-5 w-5 text-[#10b981] flex-shrink-0" />
              <div>
                <p className="text-xs text-[#6b7280]">Immeuble</p>
                <p className="text-sm font-medium text-[#0f1b2d]">
                  {building.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg">
              <Home className="h-5 w-5 text-[#10b981] flex-shrink-0" />
              <div>
                <p className="text-xs text-[#6b7280]">Appartement</p>
                <p className="text-sm font-medium text-[#0f1b2d]">
                  {apartment.unitNumber} - Étage {apartment.floor}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Incident details */}
        <Card
          header={
            <h2 className="text-base font-semibold text-[#0f1b2d]">
              Détails de l&apos;incident
            </h2>
          }
        >
          <div className="space-y-5">
            <Input
              label="Titre"
              placeholder="Ex: Fuite d'eau dans la salle de bain"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
              }}
              error={errors.title}
            />

            <Textarea
              label="Description"
              placeholder="Décrivez le problème en détail : quand est-il apparu, dans quelle pièce, etc."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((p) => ({ ...p, description: undefined }));
              }}
              error={errors.description}
              rows={5}
            />

            <Select
              label="Priorité"
              options={priorityOptions}
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as IncidentPriority)
              }
            />
          </div>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/client/incidents">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button
            type="submit"
            variant="secondary"
            isLoading={isSubmitting}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Signaler l&apos;incident
          </Button>
        </div>
      </form>
    </div>
  );
}
