"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { Card, Button, Badge, Modal, Select, EmptyState } from "@/components/ui";
import { ApartmentForm } from "@/components/forms/ApartmentForm";
import {
  ArrowLeft,
  DoorOpen,
  Pencil,
  User,
  FileText,
  AlertTriangle,
} from "lucide-react";
import {
  apartmentStatusLabels,
  apartmentStatusColors,
  incidentStatusLabels,
  incidentStatusColors,
  incidentPriorityLabels,
  incidentPriorityColors,
  leaseStatusLabels,
  leaseStatusColors,
} from "@/lib/constants";
import type { Apartment } from "@/types/apartment";

export default function ApartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const {
    getApartment,
    getBuilding,
    getTenant,
    leases,
    incidents,
    updateApartment,
  } = useData();

  const aptId = params.id as string;
  const apartment = getApartment(aptId);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const building = apartment ? getBuilding(apartment.buildingId) : undefined;
  const tenant = apartment?.tenantId ? getTenant(apartment.tenantId) : undefined;

  const activeLease = useMemo(() => {
    if (!apartment?.tenantId) return undefined;
    return leases.find(
      (l) =>
        l.apartmentId === aptId && l.status === "active"
    );
  }, [leases, aptId, apartment?.tenantId]);

  const aptIncidents = useMemo(
    () =>
      incidents
        .filter((i) => i.apartmentId === aptId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [incidents, aptId]
  );

  if (!apartment) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/admin/apartments")}>
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <EmptyState
          icon={<DoorOpen className="h-10 w-10" />}
          title="Appartement introuvable"
          description="L'appartement demand\u00e9 n'existe pas."
        />
      </div>
    );
  }

  const statusOptions = [
    { value: "available", label: "Disponible" },
    { value: "occupied", label: "Occup\u00e9" },
    { value: "maintenance", label: "En maintenance" },
    { value: "reserved", label: "R\u00e9serv\u00e9" },
  ];

  function handleEditSubmit(data: Omit<Apartment, "id">) {
    updateApartment(aptId, data);
    setShowEditModal(false);
    showToast("Appartement mis \u00e0 jour", "success");
  }

  function handleStatusChange() {
    if (!newStatus) return;
    updateApartment(aptId, { status: newStatus as Apartment["status"] });
    setShowStatusModal(false);
    setNewStatus("");
    showToast("Statut mis \u00e0 jour", "success");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/admin/apartments")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#171717]">
              Unit&eacute; {apartment.unitNumber}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                apartmentStatusColors[apartment.status] ?? ""
              }`}
            >
              {apartmentStatusLabels[apartment.status] ?? apartment.status}
            </span>
          </div>
          <p className="text-sm text-[#6b7280]">
            {building ? `${building.name} - ${building.address}, ${building.city}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNewStatus(apartment.status);
              setShowStatusModal(true);
            }}
          >
            Changer statut
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
            <Pencil className="h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit Info */}
        <Card header={<h2 className="font-semibold text-[#171717]">Informations</h2>}>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[#6b7280]">&Eacute;tage</dt>
              <dd className="font-medium text-[#171717] mt-0.5">{apartment.floor}</dd>
            </div>
            <div>
              <dt className="text-[#6b7280]">Pi&egrave;ces</dt>
              <dd className="font-medium text-[#171717] mt-0.5">{apartment.rooms}</dd>
            </div>
            <div>
              <dt className="text-[#6b7280]">Surface</dt>
              <dd className="font-medium text-[#171717] mt-0.5">{apartment.area} m&sup2;</dd>
            </div>
            <div>
              <dt className="text-[#6b7280]">Loyer</dt>
              <dd className="font-medium text-[#171717] mt-0.5">{apartment.rent} $/mois</dd>
            </div>
          </dl>
        </Card>

        {/* Tenant Info */}
        <Card
          header={
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#6b7280]" />
              <h2 className="font-semibold text-[#171717]">Locataire actuel</h2>
            </div>
          }
        >
          {tenant ? (
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-[#6b7280]">Nom</dt>
                <dd className="font-medium text-[#171717] mt-0.5">
                  <Link
                    href={`/admin/clients/${tenant.id}`}
                    className="hover:text-[#10b981]"
                  >
                    {tenant.firstName} {tenant.lastName}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">ID</dt>
                <dd className="font-mono text-xs text-[#6b7280] mt-0.5">{tenant.id}</dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">Email</dt>
                <dd className="font-medium text-[#171717] mt-0.5">{tenant.email}</dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">T&eacute;l&eacute;phone</dt>
                <dd className="font-medium text-[#171717] mt-0.5">{tenant.phone}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-[#6b7280]">Aucun locataire assign&eacute;</p>
          )}
        </Card>
      </div>

      {/* Active Lease */}
      {activeLease && (
        <Card
          header={
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#6b7280]" />
              <h2 className="font-semibold text-[#171717]">Bail actif</h2>
            </div>
          }
        >
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-[#6b7280]">D&eacute;but</dt>
              <dd className="font-medium text-[#171717] mt-0.5">
                {new Date(activeLease.startDate).toLocaleDateString("fr-CA")}
              </dd>
            </div>
            <div>
              <dt className="text-[#6b7280]">Fin</dt>
              <dd className="font-medium text-[#171717] mt-0.5">
                {new Date(activeLease.endDate).toLocaleDateString("fr-CA")}
              </dd>
            </div>
            <div>
              <dt className="text-[#6b7280]">Loyer mensuel</dt>
              <dd className="font-medium text-[#171717] mt-0.5">
                {activeLease.monthlyRent} $
              </dd>
            </div>
            <div>
              <dt className="text-[#6b7280]">D&eacute;p&ocirc;t</dt>
              <dd className="font-medium text-[#171717] mt-0.5">
                {activeLease.depositAmount} $
              </dd>
            </div>
          </dl>
        </Card>
      )}

      {/* Incidents */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#6b7280]" />
            <h2 className="font-semibold text-[#171717]">Incidents</h2>
          </div>
        }
        padding={false}
      >
        {aptIncidents.length === 0 ? (
          <p className="p-6 text-sm text-[#6b7280] text-center">
            Aucun incident signal&eacute;.
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
                {aptIncidents.map((inc) => (
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
        title="Modifier l'appartement"
        size="lg"
      >
        <ApartmentForm
          initialData={apartment}
          onSubmit={handleEditSubmit}
          onClose={() => setShowEditModal(false)}
        />
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Changer le statut"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Nouveau statut"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={statusOptions}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleStatusChange}>Confirmer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
