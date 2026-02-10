"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { Card, Button, Badge, Modal, EmptyState } from "@/components/ui";
import { ClientForm } from "@/components/forms/ClientForm";
import {
  ArrowLeft,
  User,
  Building2,
  FileText,
  AlertTriangle,
  Pencil,
  Ban,
  CheckCircle2,
  Trash2,
  Clock,
} from "lucide-react";
import { getTimeAgo } from "@/lib/utils";
import {
  tenantStatusLabels,
  tenantStatusColors,
  leaseStatusLabels,
  leaseStatusColors,
  incidentStatusLabels,
  incidentStatusColors,
  incidentPriorityLabels,
  incidentPriorityColors,
} from "@/lib/constants";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const {
    getTenant,
    getBuilding,
    getApartment,
    getLeaseByTenant,
    getIncidentsByTenant,
    updateTenant,
    deleteTenant,
  } = useData();

  const tenantId = params.id as string;
  const tenant = getTenant(tenantId);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const building = tenant?.buildingId ? getBuilding(tenant.buildingId) : undefined;
  const apartment = tenant?.apartmentId ? getApartment(tenant.apartmentId) : undefined;
  const lease = tenant ? getLeaseByTenant(tenantId) : undefined;

  const tenantIncidents = useMemo(
    () =>
      tenant
        ? [...getIncidentsByTenant(tenantId)].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        : [],
    [getIncidentsByTenant, tenantId, tenant]
  );

  if (!tenant) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/admin/clients")}>
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <EmptyState
          icon={<User className="h-10 w-10" />}
          title="Client introuvable"
          description="Le client demand\u00e9 n'existe pas."
        />
      </div>
    );
  }

  async function handleEditSubmit(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) {
    try {
      await updateTenant(tenantId, data);
      setShowEditModal(false);
      showToast("Client modifi\u00e9 avec succ\u00e8s", "success");
    } catch {
      showToast("Erreur lors de l'op\u00e9ration", "error");
    }
  }

  async function handleSuspend() {
    try {
      await updateTenant(tenantId, { status: "suspended" });
      showToast("Client suspendu avec succ\u00e8s", "success");
    } catch {
      showToast("Erreur lors de l'op\u00e9ration", "error");
    }
  }

  async function handleReactivate() {
    try {
      await updateTenant(tenantId, { status: "active" });
      showToast("Client r\u00e9activ\u00e9 avec succ\u00e8s", "success");
    } catch {
      showToast("Erreur lors de l'op\u00e9ration", "error");
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true);
      await deleteTenant(tenantId);
      showToast("Client supprim\u00e9 avec succ\u00e8s", "success");
      router.push("/admin/clients");
    } catch {
      showToast("Erreur lors de la suppression", "error");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/admin/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#171717]">
              {tenant.firstName} {tenant.lastName}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                tenantStatusColors[tenant.status] ?? ""
              }`}
            >
              {tenantStatusLabels[tenant.status] ?? tenant.status}
            </span>
            {(tenant.statusChangedAt || tenant.createdAt) && (
              <span className="inline-flex items-center gap-1 text-xs text-[#6b7280]">
                <Clock className="h-3 w-3" />
                {getTimeAgo(tenant.statusChangedAt || tenant.createdAt)}
              </span>
            )}
          </div>
          <p className="text-sm text-[#6b7280] font-mono">{tenant.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
            <Pencil className="h-4 w-4" />
            Modifier
          </Button>
          {tenant.status === "active" ? (
            <Button variant="danger" size="sm" onClick={handleSuspend}>
              <Ban className="h-4 w-4" />
              Suspendre
            </Button>
          ) : tenant.status === "suspended" ? (
            <Button variant="secondary" size="sm" onClick={handleReactivate}>
              <CheckCircle2 className="h-4 w-4" />
              R&eacute;activer
            </Button>
          ) : null}
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card
          header={
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#6b7280]" />
              <h2 className="font-semibold text-[#171717]">Informations personnelles</h2>
            </div>
          }
        >
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[#6b7280]">Pr&eacute;nom</dt>
              <dd className="font-medium text-[#171717] mt-0.5">{tenant.firstName}</dd>
            </div>
            <div>
              <dt className="text-[#6b7280]">Nom</dt>
              <dd className="font-medium text-[#171717] mt-0.5">{tenant.lastName}</dd>
            </div>
            <div>
              <dt className="text-[#6b7280]">Email</dt>
              <dd className="font-medium text-[#171717] mt-0.5">{tenant.email}</dd>
            </div>
            <div>
              <dt className="text-[#6b7280]">T&eacute;l&eacute;phone</dt>
              <dd className="font-medium text-[#171717] mt-0.5">{tenant.phone}</dd>
            </div>
            <div>
              <dt className="text-[#6b7280]">ID Client</dt>
              <dd className="font-mono text-xs text-[#6b7280] mt-0.5">{tenant.id}</dd>
            </div>
            <div>
              <dt className="text-[#6b7280]">Cr&eacute;&eacute; le</dt>
              <dd className="font-medium text-[#171717] mt-0.5">
                {new Date(tenant.createdAt).toLocaleDateString("fr-CA")}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Apartment Info */}
        <Card
          header={
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#6b7280]" />
              <h2 className="font-semibold text-[#171717]">Logement</h2>
            </div>
          }
        >
          {building && apartment ? (
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-[#6b7280]">Immeuble</dt>
                <dd className="font-medium text-[#171717] mt-0.5">
                  <Link
                    href={`/admin/buildings/${building.id}`}
                    className="hover:text-[#10b981]"
                  >
                    {building.name}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">Unit&eacute;</dt>
                <dd className="font-medium text-[#171717] mt-0.5">
                  <Link
                    href={`/admin/apartments/${apartment.id}`}
                    className="hover:text-[#10b981]"
                  >
                    {apartment.unitNumber}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">&Eacute;tage</dt>
                <dd className="font-medium text-[#171717] mt-0.5">{apartment.floor}</dd>
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
          ) : (
            <p className="text-sm text-[#6b7280]">Aucun logement assign&eacute;</p>
          )}
        </Card>
      </div>

      {/* Lease Info */}
      {lease && (
        <Card
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#6b7280]" />
                <h2 className="font-semibold text-[#171717]">Bail</h2>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  leaseStatusColors[lease.status] ?? ""
                }`}
              >
                {leaseStatusLabels[lease.status] ?? lease.status}
              </span>
            </div>
          }
        >
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-[#6b7280]">D&eacute;but</dt>
              <dd className="font-medium text-[#171717] mt-0.5">
                {new Date(lease.startDate).toLocaleDateString("fr-CA")}
              </dd>
            </div>
            <div>
              <dt className="text-[#6b7280]">Fin</dt>
              <dd className="font-medium text-[#171717] mt-0.5">
                {new Date(lease.endDate).toLocaleDateString("fr-CA")}
              </dd>
            </div>
            <div>
              <dt className="text-[#6b7280]">Loyer mensuel</dt>
              <dd className="font-medium text-[#171717] mt-0.5">{lease.monthlyRent} $</dd>
            </div>
            <div>
              <dt className="text-[#6b7280]">D&eacute;p&ocirc;t</dt>
              <dd className="font-medium text-[#171717] mt-0.5">{lease.depositAmount} $</dd>
            </div>
          </dl>
        </Card>
      )}

      {/* Incidents */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#6b7280]" />
            <h2 className="font-semibold text-[#171717]">Incidents signal&eacute;s</h2>
          </div>
        }
        padding={false}
      >
        {tenantIncidents.length === 0 ? (
          <p className="p-6 text-sm text-[#6b7280] text-center">
            Aucun incident signal&eacute; par ce client.
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
                {tenantIncidents.map((inc) => (
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
        title="Modifier les informations"
        size="lg"
      >
        <ClientForm
          initialData={{
            firstName: tenant.firstName,
            lastName: tenant.lastName,
            email: tenant.email,
            phone: tenant.phone,
          }}
          onSubmit={handleEditSubmit}
          onClose={() => setShowEditModal(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              Cette action est irr&eacute;versible. Toutes les donn&eacute;es li&eacute;es &agrave; ce client seront
              &eacute;galement supprim&eacute;es (bail, paiements, incidents, documents...).
            </p>
          </div>
          <p className="text-sm text-[#6b7280]">
            &Ecirc;tes-vous s&ucirc;r de vouloir supprimer le client{" "}
            <span className="font-semibold text-[#171717]">
              {tenant.firstName} {tenant.lastName}
            </span>{" "}
            ({tenant.id}) ?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Suppression..." : "Supprimer d\u00e9finitivement"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
