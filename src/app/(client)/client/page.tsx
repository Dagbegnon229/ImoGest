"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Home,
  FileText,
  AlertTriangle,
  Plus,
  Clock,
  ArrowRight,
  CreditCard,
  Award,
  MessageSquare,
  FolderOpen,
  TrendingUp,
  Calendar,
  Trophy,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { formatDate, formatCurrency, getDaysUntilDue } from "@/lib/utils";
import {
  incidentStatusLabels,
  incidentStatusColors,
  incidentPriorityLabels,
  incidentPriorityColors,
  leaseStatusLabels,
  leaseStatusColors,
  loyaltyTierLabels,
  loyaltyTierColors,
  paymentStatusLabels,
  paymentStatusColors,
} from "@/lib/constants";

export default function ClientDashboard() {
  const { user } = useAuth();
  const {
    tenants,
    getBuilding,
    getApartment,
    getLeaseByTenant,
    getIncidentsByTenant,
    getPaymentsByTenant,
    getLoyaltyProfile,
    getConversationsByTenant,
  } = useData();

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

  const myIncidents = useMemo(
    () => (tenant ? getIncidentsByTenant(tenant.id) : []),
    [tenant, getIncidentsByTenant],
  );

  const recentIncidents = useMemo(
    () =>
      [...myIncidents]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 3),
    [myIncidents],
  );

  const myPayments = useMemo(
    () => (tenant ? getPaymentsByTenant(tenant.id) : []),
    [tenant, getPaymentsByTenant],
  );

  const nextPayment = useMemo(
    () => myPayments.find((p) => p.status === "pending"),
    [myPayments],
  );

  const loyaltyProfile = useMemo(
    () => (tenant ? getLoyaltyProfile(tenant.id) : undefined),
    [tenant, getLoyaltyProfile],
  );

  const unreadMessages = useMemo(() => {
    if (!tenant) return 0;
    const convs = getConversationsByTenant(tenant.id);
    return convs.reduce((sum, c) => sum + c.unreadClient, 0);
  }, [tenant, getConversationsByTenant]);

  const remainingTime = useMemo(() => {
    if (!lease) return null;
    const end = new Date(lease.endDate);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    if (diffMs <= 0) return "Expiré";
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    if (months > 0) {
      const remainDays = days % 30;
      return `${months} mois${remainDays > 0 ? ` et ${remainDays} jours` : ""}`;
    }
    return `${days} jours`;
  }, [lease]);

  const hasAssignment = !!(building && apartment);

  const daysUntilDue = nextPayment ? getDaysUntilDue(nextPayment.dueDate) : null;

  const dueUrgency =
    daysUntilDue === null
      ? "green"
      : daysUntilDue < 0
        ? "red"
        : daysUntilDue <= 5
          ? "red"
          : daysUntilDue <= 10
            ? "yellow"
            : "green";

  const urgencyStyles = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-700",
    yellow: "bg-amber-50 border-amber-200 text-amber-700",
    red: "bg-red-50 border-red-200 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f1b2d]">
          Bonjour, {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Bienvenue sur votre espace locataire
        </p>
      </div>

      {!hasAssignment ? (
        <Card>
          <EmptyState
            icon={<Home className="h-10 w-10" />}
            title="Aucun logement assigné"
            description="Vous n'avez pas encore de logement assigné. Veuillez contacter votre gestionnaire pour plus d'informations."
          />
        </Card>
      ) : (
        <>
          {/* Payment Due + Loyalty Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Next Payment Card */}
            <div className="lg:col-span-2">
              {nextPayment ? (
                <div
                  className={`rounded-2xl border-2 p-6 ${urgencyStyles[dueUrgency]}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-5 w-5" />
                        <span className="text-sm font-semibold uppercase tracking-wide">
                          Prochain paiement
                        </span>
                      </div>
                      <div className="text-3xl font-extrabold">
                        {formatCurrency(nextPayment.monthlyRent)}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Échéance: {formatDate(nextPayment.dueDate)}
                        </span>
                        <span className="font-semibold">
                          {daysUntilDue !== null && daysUntilDue < 0
                            ? `(${Math.abs(daysUntilDue)} jours de retard)`
                            : daysUntilDue === 0
                              ? "(Aujourd'hui)"
                              : `(${daysUntilDue} jours)`}
                        </span>
                      </div>
                    </div>
                    <Link href="/client/payments">
                      <Button variant="primary" className="gap-2 whitespace-nowrap">
                        <CreditCard className="h-4 w-4" />
                        Payer maintenant
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-800">
                        Tous vos paiements sont à jour
                      </p>
                      <p className="text-sm text-emerald-600">
                        Aucun paiement en attente
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Loyalty Card */}
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-[#10b981]" />
                <span className="text-sm font-semibold text-[#0f1b2d]">
                  Fidélité
                </span>
              </div>
              {loyaltyProfile ? (
                <div className="text-center">
                  <div
                    className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold ${loyaltyTierColors[loyaltyProfile.currentTier] || ""}`}
                  >
                    <Award className="h-4 w-4 mr-1" />
                    {loyaltyTierLabels[loyaltyProfile.currentTier] ||
                      loyaltyProfile.currentTier}
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-[#0f1b2d]">
                    {loyaltyProfile.totalPoints}
                  </div>
                  <div className="text-xs text-[#6b7280]">points</div>
                  <div className="mt-3 text-sm text-[#6b7280]">
                    Ponctualité: {loyaltyProfile.punctualityScore}%
                  </div>
                  <Link href="/client/points">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 w-full text-[#10b981]"
                    >
                      Voir détails
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-[#6b7280] text-center">
                  Pas encore de points
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-[#0f1b2d] mb-3">
              Actions rapides
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link href="/client/incidents/new">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#e5e7eb] bg-white hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <span className="text-xs font-medium text-[#0f1b2d] text-center">
                    Signaler incident
                  </span>
                </div>
              </Link>
              <Link href="/client/payments">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#e5e7eb] bg-white hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-emerald-500" />
                  </div>
                  <span className="text-xs font-medium text-[#0f1b2d] text-center">
                    Mes paiements
                  </span>
                </div>
              </Link>
              <Link href="/client/messages">
                <div className="relative flex flex-col items-center gap-2 p-4 rounded-xl border border-[#e5e7eb] bg-white hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-xs font-medium text-[#0f1b2d] text-center">
                    Messages
                  </span>
                  {unreadMessages > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </div>
              </Link>
              <Link href="/client/documents">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#e5e7eb] bg-white hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <FolderOpen className="h-5 w-5 text-purple-500" />
                  </div>
                  <span className="text-xs font-medium text-[#0f1b2d] text-center">
                    Documents
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Bottom Row: Apartment + Lease */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* My Apartment Card */}
            <Card
              header={
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[#10b981]" />
                  <h2 className="text-lg font-semibold text-[#0f1b2d]">
                    Mon logement
                  </h2>
                </div>
              }
            >
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[#6b7280]">Immeuble</span>
                  <span className="text-sm font-medium text-[#0f1b2d]">
                    {building.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#6b7280]">Appartement</span>
                  <span className="text-sm font-medium text-[#0f1b2d]">
                    {apartment.unitNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#6b7280]">Surface</span>
                  <span className="text-sm font-medium text-[#0f1b2d]">
                    {apartment.area} m²
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#6b7280]">Loyer mensuel</span>
                  <span className="text-sm font-semibold text-[#10b981]">
                    {formatCurrency(apartment.rent)}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
                <Link href="/client/apartment">
                  <Button variant="ghost" size="sm" className="w-full">
                    Voir les détails
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Lease Summary Card */}
            <Card
              header={
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#10b981]" />
                  <h2 className="text-lg font-semibold text-[#0f1b2d]">
                    Mon bail
                  </h2>
                </div>
              }
            >
              {lease ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#6b7280]">Statut</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${leaseStatusColors[lease.status] || ""}`}
                    >
                      {leaseStatusLabels[lease.status] || lease.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b7280]">Début</span>
                    <span className="text-sm font-medium text-[#0f1b2d]">
                      {formatDate(lease.startDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b7280]">Fin</span>
                    <span className="text-sm font-medium text-[#0f1b2d]">
                      {formatDate(lease.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b7280]">
                      Temps restant
                    </span>
                    <span className="text-sm font-medium text-[#0f1b2d] flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#6b7280]" />
                      {remainingTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b7280]">Loyer</span>
                    <span className="text-sm font-semibold text-[#10b981]">
                      {formatCurrency(lease.monthlyRent)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#6b7280]">
                  Aucun bail actif pour le moment.
                </p>
              )}
            </Card>
          </div>

          {/* Recent Incidents */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-[#10b981]" />
                  <h2 className="text-lg font-semibold text-[#0f1b2d]">
                    Incidents récents
                  </h2>
                </div>
                {myIncidents.length > 0 && (
                  <Link
                    href="/client/incidents"
                    className="text-sm text-[#10b981] font-medium hover:underline"
                  >
                    Voir tout
                  </Link>
                )}
              </div>
            }
            padding={false}
          >
            {recentIncidents.length === 0 ? (
              <EmptyState
                icon={<AlertTriangle className="h-8 w-8" />}
                title="Aucun incident"
                description="Vous n'avez signalé aucun incident pour le moment."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e5e7eb]">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                        Titre
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                        Statut
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                        Priorité
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentIncidents.map((incident) => (
                      <tr
                        key={incident.id}
                        className="border-b border-[#e5e7eb] last:border-0 hover:bg-[#f8fafc] cursor-pointer"
                        onClick={() =>
                          (window.location.href = `/client/incidents/${incident.id}`)
                        }
                      >
                        <td className="px-6 py-3 font-medium text-[#0f1b2d]">
                          {incident.title}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${incidentStatusColors[incident.status] || ""}`}
                          >
                            {incidentStatusLabels[incident.status] ||
                              incident.status}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${incidentPriorityColors[incident.priority] || ""}`}
                          >
                            {incidentPriorityLabels[incident.priority] ||
                              incident.priority}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-[#6b7280]">
                          {formatDate(incident.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
