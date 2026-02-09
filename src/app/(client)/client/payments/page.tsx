"use client";

import { useState, useMemo } from "react";
import {
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Wallet,
  TrendingUp,
  Receipt,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Card, Button, Modal, EmptyState, Select } from "@/components/ui";
import { formatDate, formatCurrency, getDaysUntilDue } from "@/lib/utils";
import {
  paymentStatusLabels,
  paymentStatusColors,
  paymentMethodLabels,
} from "@/lib/constants";
import type { PaymentMethod } from "@/types/payment";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return a human-readable French month label from a "YYYY-MM" string. */
function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1);
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

/** Urgency color based on days until due. */
function getDueColorClasses(days: number) {
  if (days < 5) return { bg: "bg-red-50", border: "border-red-200", text: "text-red-600", badge: "bg-red-100 text-red-700" };
  if (days <= 10) return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", badge: "bg-amber-100 text-amber-700" };
  return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" };
}

// ---------------------------------------------------------------------------
// Payment method options for the modal select
// ---------------------------------------------------------------------------

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "bank_transfer", label: "Virement bancaire" },
  { value: "credit_card", label: "Carte de cr\u00e9dit" },
  { value: "cash", label: "Esp\u00e8ces" },
  { value: "cheque", label: "Ch\u00e8que" },
];

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ClientPaymentsPage() {
  const { user } = useAuth();
  const { getPaymentsByTenant, updatePayment } = useData();
  const { showToast } = useToast();

  // Modal state
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("bank_transfer");
  const [isProcessing, setIsProcessing] = useState(false);

  // -------------------------------------------------------------------------
  // Derived data
  // -------------------------------------------------------------------------

  const payments = useMemo(() => {
    if (!user) return [];
    return getPaymentsByTenant(user.id);
  }, [user, getPaymentsByTenant]);

  /** All payments sorted by month descending for the history table. */
  const sortedPayments = useMemo(
    () => [...payments].sort((a, b) => b.month.localeCompare(a.month)),
    [payments],
  );

  /** The next pending payment (earliest due date). */
  const nextPending = useMemo(
    () =>
      payments
        .filter((p) => p.status === "pending")
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] ?? null,
    [payments],
  );

  const daysUntilDue = nextPending ? getDaysUntilDue(nextPending.dueDate) : null;
  const dueColors = daysUntilDue !== null ? getDueColorClasses(daysUntilDue) : null;

  // Stats
  const completedPayments = useMemo(
    () => payments.filter((p) => p.status === "completed"),
    [payments],
  );

  const totalPaid = useMemo(
    () => completedPayments.reduce((sum, p) => sum + p.amount, 0),
    [completedPayments],
  );

  const onTimeCount = useMemo(
    () =>
      completedPayments.filter((p) => {
        if (!p.paidAt) return false;
        return new Date(p.paidAt) <= new Date(p.dueDate);
      }).length,
    [completedPayments],
  );

  const totalLateFees = useMemo(
    () => payments.reduce((sum, p) => sum + p.lateFee, 0),
    [payments],
  );

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  function openPayModal() {
    setSelectedMethod("bank_transfer");
    setPayModalOpen(true);
  }

  async function handleConfirmPayment() {
    if (!nextPending) return;
    setIsProcessing(true);

    // Simulate a short processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    await updatePayment(nextPending.id, {
      status: "completed",
      method: selectedMethod,
      paidAt: new Date().toISOString(),
      reference: `${selectedMethod === "bank_transfer" ? "VIR" : selectedMethod === "credit_card" ? "CB" : selectedMethod === "cash" ? "ESP" : "CHQ"}-${nextPending.month.replace("-", "")}-AUTO`,
    });

    setIsProcessing(false);
    setPayModalOpen(false);
    showToast("Paiement effectu\u00e9 avec succ\u00e8s !", "success");
  }

  // -------------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------------

  if (payments.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1b2d]">Mes paiements</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            G\u00e9rez vos paiements de loyer
          </p>
        </div>
        <Card>
          <EmptyState
            icon={<CreditCard className="h-10 w-10" />}
            title="Aucun paiement"
            description="Vous n'avez aucun paiement enregistr\u00e9 pour le moment. Vos paiements appara\u00eetront ici d\u00e8s qu'ils seront g\u00e9n\u00e9r\u00e9s."
          />
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f1b2d]">Mes paiements</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          {payments.length} paiement{payments.length !== 1 ? "s" : ""} enregistr\u00e9{payments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Next payment card                                                  */}
      {/* ------------------------------------------------------------------ */}
      {nextPending && daysUntilDue !== null && dueColors && (
        <div
          className={`rounded-xl border-2 ${dueColors.border} ${dueColors.bg} p-6 transition-colors`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            {/* Left side: info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className={`h-5 w-5 ${dueColors.text}`} />
                <h2 className="text-lg font-semibold text-[#0f1b2d]">
                  Prochain paiement
                </h2>
              </div>

              <p className="text-3xl font-bold text-[#10b981]">
                {formatCurrency(nextPending.monthlyRent)}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-[#6b7280]">
                  \u00c9ch\u00e9ance : {formatDate(nextPending.dueDate)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${dueColors.badge}`}
                >
                  <Clock className="h-3 w-3" />
                  {daysUntilDue > 0
                    ? `${daysUntilDue} jour${daysUntilDue !== 1 ? "s" : ""} restant${daysUntilDue !== 1 ? "s" : ""}`
                    : daysUntilDue === 0
                      ? "Aujourd\u2019hui"
                      : `${Math.abs(daysUntilDue)} jour${Math.abs(daysUntilDue) !== 1 ? "s" : ""} de retard`}
                </span>
              </div>

              <p className="text-sm text-[#6b7280] capitalize">
                {formatMonth(nextPending.month)}
              </p>
            </div>

            {/* Right side: pay button */}
            <div className="flex-shrink-0">
              <Button
                variant="secondary"
                size="lg"
                className="gap-2 w-full sm:w-auto"
                onClick={openPayModal}
              >
                <Wallet className="h-5 w-5" />
                Payer maintenant
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Stats row                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total paid */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-[#6b7280]">Total pay\u00e9</p>
              <p className="mt-2 text-2xl font-bold text-[#171717]">
                {formatCurrency(totalPaid)}
              </p>
            </div>
            <div className="flex-shrink-0 rounded-lg bg-[#d1fae5] p-3 text-[#10b981]">
              <Banknote className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* On-time payments */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-[#6b7280]">
                Paiements \u00e0 temps
              </p>
              <p className="mt-2 text-2xl font-bold text-[#171717]">
                {onTimeCount}
                <span className="text-sm font-normal text-[#6b7280] ml-1">
                  / {completedPayments.length}
                </span>
              </p>
            </div>
            <div className="flex-shrink-0 rounded-lg bg-[#d1fae5] p-3 text-[#10b981]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Late fees */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-[#6b7280]">
                Frais de retard
              </p>
              <p className={`mt-2 text-2xl font-bold ${totalLateFees > 0 ? "text-red-600" : "text-[#171717]"}`}>
                {formatCurrency(totalLateFees)}
              </p>
            </div>
            <div className={`flex-shrink-0 rounded-lg p-3 ${totalLateFees > 0 ? "bg-red-100 text-red-600" : "bg-[#d1fae5] text-[#10b981]"}`}>
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Payment history table                                               */}
      {/* ------------------------------------------------------------------ */}
      <Card
        padding={false}
        header={
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[#6b7280]" />
            <h2 className="text-lg font-semibold text-[#0f1b2d]">
              Historique des paiements
            </h2>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb]">
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                  Mois
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                  Montant
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                  Date de paiement
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                  M\u00e9thode
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-[#e5e7eb] last:border-0 hover:bg-[#f8fafc] transition-colors"
                >
                  {/* Month */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#0f1b2d] capitalize">
                      {formatMonth(payment.month)}
                    </p>
                  </td>

                  {/* Amount + late fee */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#0f1b2d]">
                      {formatCurrency(payment.amount)}
                    </p>
                    {payment.lateFee > 0 && (
                      <p className="text-xs text-red-600 mt-0.5">
                        dont {formatCurrency(payment.lateFee)} de frais de retard
                      </p>
                    )}
                  </td>

                  {/* Paid date */}
                  <td className="px-6 py-4 text-[#6b7280]">
                    {payment.paidAt ? formatDate(payment.paidAt) : "\u2014"}
                  </td>

                  {/* Method */}
                  <td className="px-6 py-4 text-[#6b7280]">
                    {payment.method
                      ? paymentMethodLabels[payment.method] || payment.method
                      : "\u2014"}
                  </td>

                  {/* Status badge */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentStatusColors[payment.status] || ""}`}
                    >
                      {paymentStatusLabels[payment.status] || payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Payment modal                                                      */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => !isProcessing && setPayModalOpen(false)}
        title="Effectuer un paiement"
        size="md"
      >
        {nextPending && (
          <div className="space-y-6">
            {/* Amount summary */}
            <div className="rounded-lg bg-[#f8fafc] border border-[#e5e7eb] p-4 text-center">
              <p className="text-sm text-[#6b7280]">Montant \u00e0 payer</p>
              <p className="text-3xl font-bold text-[#10b981] mt-1">
                {formatCurrency(nextPending.monthlyRent)}
              </p>
              <p className="text-sm text-[#6b7280] mt-1 capitalize">
                {formatMonth(nextPending.month)} &mdash; \u00c9ch\u00e9ance{" "}
                {formatDate(nextPending.dueDate)}
              </p>
            </div>

            {/* Method select */}
            <Select
              label="M\u00e9thode de paiement"
              options={paymentMethodOptions}
              value={selectedMethod}
              onChange={(e) =>
                setSelectedMethod(e.target.value as PaymentMethod)
              }
            />

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPayModalOpen(false)}
                disabled={isProcessing}
              >
                Annuler
              </Button>
              <Button
                variant="secondary"
                className="flex-1 gap-2"
                onClick={handleConfirmPayment}
                isLoading={isProcessing}
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirmer le paiement
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
