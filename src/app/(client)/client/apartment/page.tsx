"use client";

import { useMemo } from "react";
import {
  Building2,
  MapPin,
  Home,
  Ruler,
  DoorOpen,
  Layers,
  FileText,
  Calendar,
  Banknote,
  Shield,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, EmptyState, Badge } from "@/components/ui";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  leaseStatusLabels,
  leaseStatusColors,
  apartmentStatusLabels,
  apartmentStatusColors,
} from "@/lib/constants";

export default function MyApartmentPage() {
  const { user } = useAuth();
  const { tenants, getBuilding, getApartment, getLeaseByTenant } = useData();

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

  const lease = useMemo(
    () => (tenant ? getLeaseByTenant(tenant.id) : undefined),
    [tenant, getLeaseByTenant],
  );

  if (!building || !apartment) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0f1b2d]">Mon logement</h1>
        <Card>
          <EmptyState
            icon={<Home className="h-10 w-10" />}
            title="Aucun logement assigné pour le moment"
            description="Veuillez contacter votre gestionnaire pour plus d'informations sur votre assignation."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f1b2d]">Mon logement</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Détails de votre appartement et immeuble
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Building Info */}
        <Card
          header={
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#10b981]" />
              <h2 className="text-lg font-semibold text-[#0f1b2d]">
                Immeuble
              </h2>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-4 w-4 text-[#6b7280] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#6b7280]">Nom</p>
                <p className="text-sm font-medium text-[#0f1b2d]">
                  {building.name}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-[#6b7280] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#6b7280]">Adresse</p>
                <p className="text-sm font-medium text-[#0f1b2d]">
                  {building.address}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-[#6b7280] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#6b7280]">Ville</p>
                <p className="text-sm font-medium text-[#0f1b2d]">
                  {building.city}, {building.province} {building.postalCode}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Layers className="h-4 w-4 text-[#6b7280] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#6b7280]">Étages</p>
                <p className="text-sm font-medium text-[#0f1b2d]">
                  {building.floors}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Apartment Details */}
        <Card
          header={
            <div className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-[#10b981]" />
              <h2 className="text-lg font-semibold text-[#0f1b2d]">
                Appartement
              </h2>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Home className="h-4 w-4 text-[#6b7280] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#6b7280]">Numéro</p>
                <p className="text-sm font-medium text-[#0f1b2d]">
                  {apartment.unitNumber}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Layers className="h-4 w-4 text-[#6b7280] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#6b7280]">Étage</p>
                <p className="text-sm font-medium text-[#0f1b2d]">
                  {apartment.floor}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DoorOpen className="h-4 w-4 text-[#6b7280] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#6b7280]">Pièces</p>
                <p className="text-sm font-medium text-[#0f1b2d]">
                  {apartment.rooms}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Ruler className="h-4 w-4 text-[#6b7280] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#6b7280]">Surface</p>
                <p className="text-sm font-medium text-[#0f1b2d]">
                  {apartment.area} m²
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Banknote className="h-4 w-4 text-[#6b7280] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#6b7280]">Loyer mensuel</p>
                <p className="text-sm font-semibold text-[#10b981]">
                  {formatCurrency(apartment.rent)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-[#6b7280] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#6b7280]">Statut</p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${apartmentStatusColors[apartment.status] || ""}`}
                >
                  {apartmentStatusLabels[apartment.status] || apartment.status}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Lease Details */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#10b981]" />
            <h2 className="text-lg font-semibold text-[#0f1b2d]">
              Détails du bail
            </h2>
          </div>
        }
      >
        {lease ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-[#6b7280] mb-1">Date de début</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#6b7280]" />
                <p className="text-sm font-medium text-[#0f1b2d]">
                  {formatDate(lease.startDate)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-[#6b7280] mb-1">Date de fin</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#6b7280]" />
                <p className="text-sm font-medium text-[#0f1b2d]">
                  {formatDate(lease.endDate)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-[#6b7280] mb-1">Loyer mensuel</p>
              <p className="text-sm font-semibold text-[#10b981]">
                {formatCurrency(lease.monthlyRent)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#6b7280] mb-1">Caution</p>
              <p className="text-sm font-medium text-[#0f1b2d]">
                {formatCurrency(lease.depositAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#6b7280] mb-1">Statut</p>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${leaseStatusColors[lease.status] || ""}`}
              >
                {leaseStatusLabels[lease.status] || lease.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-[#6b7280] mb-1">Référence du bail</p>
              <p className="text-sm font-medium text-[#0f1b2d]">{lease.id}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#6b7280]">
            Aucun bail actif pour le moment.
          </p>
        )}
      </Card>
    </div>
  );
}
