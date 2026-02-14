"use client";

import { useState, useMemo } from "react";
import {
  CreditCard,
  Search,
  AlertTriangle,
  TrendingUp,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  ImageIcon,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Card, Badge, Button, EmptyState, StatsCard, Modal, Input, Select } from "@/components/ui";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  paymentStatusLabels,
  paymentMethodLabels,
} from "@/lib/constants";
import type { Payment } from "@/types/payment";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a YYYY-MM month string to a French readable label (e.g. "Janvier 2025") */
function formatMonth(month: string): string {
  try {
    const [year, m] = month.split("-");
    const date = new Date(Number(year), Number(m) - 1);
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  } catch {
    return month;
  }
}

/** Check whether a payment is overdue: pending + past the 7th of the payment month */
function isOverdue(payment: Payment): boolean {
  if (payment.status !== "pending") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Due date is always the 7th of the payment month
  const [year, month] = payment.month.split("-");
  const due = new Date(Number(year), Number(month) - 1, 7);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

// ---------------------------------------------------------------------------
// Badge variant mapping
// ---------------------------------------------------------------------------

const statusBadgeVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  completed: "success",
  failed: "danger",
  refunded: "info",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PaymentsPage() {
  const { payments, tenants, getTenant, buildings, getBuilding, updatePayment, addPointsTransaction } = useData();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isSuperAdmin = user?.role === "super_admin";

  // State
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showProofImage, setShowProofImage] = useState(false);

  // ---------- Payment validation handlers ------------------------------------

  async function handleValidatePayment() {
    if (!selectedPayment) return;
    setIsValidating(true);
    try {
      await updatePayment(selectedPayment.id, {
        status: "completed",
        paidAt: new Date().toISOString(),
      });

      // Award loyalty points
      const paidOverdue = isOverdue(selectedPayment);
      const pointsType = paidOverdue ? "earned_on_time" : "earned_early_payment";
      const pointsAmount = paidOverdue ? 5 : 10;
      try {
        await addPointsTransaction({
          tenantId: selectedPayment.tenantId,
          type: pointsType,
          points: pointsAmount,
          description: paidOverdue
            ? `Paiement ${formatMonth(selectedPayment.month)}`
            : `Paiement anticipé ${formatMonth(selectedPayment.month)}`,
          relatedPaymentId: selectedPayment.id,
        });
      } catch {
        // Points attribution failure is non-blocking
      }

      showToast("Paiement validé avec succès", "success");
      setSelectedPayment(null);
    } catch {
      showToast("Erreur lors de la validation", "error");
    } finally {
      setIsValidating(false);
    }
  }

  async function handleRefusePayment() {
    if (!selectedPayment) return;
    setIsValidating(true);
    try {
      await updatePayment(selectedPayment.id, {
        status: "failed",
        reference: null,
        proofImageUrl: null,
      });
      showToast("Paiement refusé", "success");
      setSelectedPayment(null);
    } catch {
      showToast("Erreur lors du refus", "error");
    } finally {
      setIsValidating(false);
    }
  }

  // ---------- Stats --------------------------------------------------------

  const stats = useMemo(() => {
    const completedPayments = payments.filter((p) => p.status === "completed");
    const pendingPayments = payments.filter((p) => p.status === "pending");
    const overduePayments = payments.filter((p) => isOverdue(p));

    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalRevenue,
      pendingCount: pendingPayments.length,
      overdueCount: overduePayments.length,
    };
  }, [payments]);

  // ---------- Tenant lookup helper -----------------------------------------

  function getTenantName(tenantId: string): string {
    const tenant = getTenant(tenantId);
    if (!tenant) return "--";
    return `${tenant.firstName} ${tenant.lastName}`;
  }

  function getBuildingName(tenantId: string): string {
    const tenant = getTenant(tenantId);
    if (!tenant || !tenant.buildingId) return "--";
    const building = getBuilding(tenant.buildingId);
    return building?.name ?? "--";
  }

  // ---------- Filtering & sorting ------------------------------------------

  const filtered = useMemo(() => {
    const list = payments.filter((p) => {
      // Status filter
      if (filterStatus && p.status !== filterStatus) return false;

      // Search by tenant name
      if (search) {
        const q = search.toLowerCase();
        const name = getTenantName(p.tenantId).toLowerCase();
        if (!name.includes(q)) return false;
      }

      return true;
    });

    // Sort by dueDate descending (most recent first)
    return [...list].sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );
  }, [payments, filterStatus, search, tenants]);

  // ---------- Filter options -----------------------------------------------

  const statusOptions = [
    { value: "", label: "Tous les statuts" },
    { value: "pending", label: "En attente" },
    { value: "completed", label: "Payé" },
    { value: "failed", label: "Échoué" },
  ];

  // ---------- Modal detail -------------------------------------------------

  const modalTenant = selectedPayment ? getTenant(selectedPayment.tenantId) : null;
  const modalBuilding =
    modalTenant && modalTenant.buildingId
      ? getBuilding(modalTenant.buildingId)
      : null;

  // ---------- Render -------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#171717]">Paiements</h1>
      </div>

      {/* Stats row */}
      <div className={`grid grid-cols-1 ${isSuperAdmin ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-4`}>
        {isSuperAdmin && (
          <StatsCard
            label="Total revenus"
            value={formatCurrency(stats.totalRevenue)}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        )}
        <StatsCard
          label="En attente"
          value={stats.pendingCount}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatsCard
          label="Paiements en retard"
          value={stats.overdueCount}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      {/* Filter bar + table */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par nom de locataire..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={statusOptions}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="h-10 w-10" />}
            title="Aucun paiement trouvé"
            description="Ajustez vos filtres ou attendez de nouveaux paiements."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">
                    Locataire
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">
                    Immeuble
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">
                    Mois
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-[#6b7280]">
                    Montant
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">
                    Échéance
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">
                    Payé le
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-[#6b7280]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((payment) => {
                  const overdue = isOverdue(payment);

                  return (
                    <tr
                      key={payment.id}
                      className="border-b border-[#e5e7eb] last:border-0 hover:bg-[#f8fafc] cursor-pointer"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <td className="px-4 py-3 font-medium text-[#171717]">
                        {getTenantName(payment.tenantId)}
                      </td>
                      <td className="px-4 py-3 text-[#6b7280]">
                        {getBuildingName(payment.tenantId)}
                      </td>
                      <td className="px-4 py-3 text-[#6b7280] capitalize">
                        {formatMonth(payment.month)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#171717]">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-3 text-[#6b7280]">
                        {formatDate(payment.dueDate)}
                      </td>
                      <td className="px-4 py-3 text-[#6b7280]">
                        {payment.paidAt ? formatDate(payment.paidAt) : "--"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Badge variant={statusBadgeVariant[payment.status] ?? "default"}>
                            {paymentStatusLabels[payment.status] ?? payment.status}
                          </Badge>
                          {overdue && (
                            <Badge variant="danger">En retard</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPayment(payment);
                          }}
                          className="rounded-lg p-1.5 text-[#6b7280] hover:bg-gray-100 hover:text-[#171717] transition-colors inline-flex"
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Payment detail modal */}
      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title="Détails du paiement"
        size="lg"
      >
        {selectedPayment && (
          <div className="space-y-5">
            {/* ID & status row */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-[#6b7280]">
                {selectedPayment.id}
              </span>
              <div className="flex items-center gap-1.5">
                <Badge variant={statusBadgeVariant[selectedPayment.status] ?? "default"}>
                  {paymentStatusLabels[selectedPayment.status] ?? selectedPayment.status}
                </Badge>
                {isOverdue(selectedPayment) && (
                  <Badge variant="danger">En retard</Badge>
                )}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                label="Locataire"
                value={
                  modalTenant
                    ? `${modalTenant.firstName} ${modalTenant.lastName}`
                    : "--"
                }
              />
              <DetailItem
                label="Immeuble"
                value={modalBuilding?.name ?? "--"}
              />
              <DetailItem
                label="Mois"
                value={formatMonth(selectedPayment.month)}
              />
              <DetailItem
                label="Loyer mensuel"
                value={formatCurrency(selectedPayment.monthlyRent)}
              />
              <DetailItem
                label="Montant payé"
                value={formatCurrency(selectedPayment.amount)}
              />
              <DetailItem
                label="Échéance"
                value={formatDate(selectedPayment.dueDate)}
              />
              <DetailItem
                label="Date de paiement"
                value={selectedPayment.paidAt ? formatDate(selectedPayment.paidAt) : "--"}
              />
              <DetailItem
                label="Méthode"
                value={
                  selectedPayment.method
                    ? paymentMethodLabels[selectedPayment.method] ?? selectedPayment.method
                    : "--"
                }
              />
              <DetailItem
                label="Référence"
                value={selectedPayment.reference ?? "--"}
              />
            </div>

            {/* Proof image */}
            {selectedPayment.proofImageUrl && (
              <div className="border-t border-[#e5e7eb] pt-4">
                <p className="text-xs font-medium text-[#6b7280] mb-2">Preuve de paiement</p>
                <img
                  src={selectedPayment.proofImageUrl}
                  alt="Preuve de paiement"
                  className="rounded-lg border border-[#e5e7eb] max-h-48 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setShowProofImage(true)}
                />
              </div>
            )}

            {/* Created at */}
            <p className="text-xs text-[#6b7280] pt-2 border-t border-[#e5e7eb]">
              Créé le {formatDate(selectedPayment.createdAt)}
            </p>

            {/* Validate / Refuse buttons for pending payments */}
            {selectedPayment.status === "pending" && selectedPayment.reference && (
              <div className="flex gap-3 pt-3 border-t border-[#e5e7eb]">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleRefusePayment}
                  disabled={isValidating}
                >
                  <XCircle className="h-4 w-4" />
                  Refuser
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 gap-2"
                  onClick={handleValidatePayment}
                  isLoading={isValidating}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Valider le paiement
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Proof image fullscreen modal */}
      {selectedPayment?.proofImageUrl && (
        <Modal
          isOpen={showProofImage}
          onClose={() => setShowProofImage(false)}
          title="Preuve de paiement"
          size="lg"
        >
          <img
            src={selectedPayment.proofImageUrl}
            alt="Preuve de paiement"
            className="w-full rounded-lg"
          />
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: detail item for modal
// ---------------------------------------------------------------------------

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-[#6b7280] mb-0.5">{label}</p>
      <p className="text-sm font-medium text-[#171717]">{value}</p>
    </div>
  );
}
