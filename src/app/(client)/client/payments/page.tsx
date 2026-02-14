"use client";

import { useState, useMemo } from "react";
import {
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  Banknote,
  ImagePlus,
  Upload,
  Wallet,
  TrendingUp,
  Receipt,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Card, Button, Modal, EmptyState, Select, Input } from "@/components/ui";
import { formatDate, formatCurrency, getDaysUntilDue } from "@/lib/utils";
import { uploadFile } from "@/lib/supabase";
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
  { value: "credit_card", label: "Carte de crédit" },
  { value: "cash", label: "Espèces" },
  { value: "cheque", label: "Chèque" },
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
  const [paymentReference, setPaymentReference] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [referenceError, setReferenceError] = useState("");
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


  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  function openPayModal() {
    setSelectedMethod("bank_transfer");
    setPaymentReference("");
    setProofFile(null);
    setProofPreview(null);
    setReferenceError("");
    setPayModalOpen(true);
  }

  function handleProofFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleConfirmPayment() {
    if (!nextPending) return;

    // Validate reference
    if (!paymentReference.trim()) {
      setReferenceError("Le numéro de référence est obligatoire");
      return;
    }
    setReferenceError("");
    setIsProcessing(true);

    try {
      // Upload proof image if provided
      let proofImageUrl: string | null = null;
      if (proofFile) {
        const path = `${nextPending.id}/${Date.now()}-${proofFile.name}`;
        const { url } = await uploadFile("payment-proofs", path, proofFile);
        proofImageUrl = url;
      }

      // Payment stays pending — admin will validate
      await updatePayment(nextPending.id, {
        method: selectedMethod,
        reference: paymentReference.trim(),
        proofImageUrl,
      });

      setIsProcessing(false);
      setPayModalOpen(false);
      showToast("Paiement soumis — en attente de validation par l'administrateur", "success");
    } catch {
      setIsProcessing(false);
      showToast("Erreur lors de la soumission du paiement", "error");
    }
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
            Gérez vos paiements de loyer
          </p>
        </div>
        <Card>
          <EmptyState
            icon={<CreditCard className="h-10 w-10" />}
            title="Aucun paiement"
            description="Vous n'avez aucun paiement enregistré pour le moment. Vos paiements apparaîtront ici dès qu'ils seront générés."
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
          {payments.length} paiement{payments.length !== 1 ? "s" : ""} enregistré{payments.length !== 1 ? "s" : ""}
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
                  Échéance : {formatDate(nextPending.dueDate)}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total paid */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-[#6b7280]">Total payé</p>
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
                Paiements à temps
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
                  Méthode
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

                  {/* Amount */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#0f1b2d]">
                      {formatCurrency(payment.amount)}
                    </p>
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
              <p className="text-sm text-[#6b7280]">Montant à payer</p>
              <p className="text-3xl font-bold text-[#10b981] mt-1">
                {formatCurrency(nextPending.monthlyRent)}
              </p>
              <p className="text-sm text-[#6b7280] mt-1 capitalize">
                {formatMonth(nextPending.month)} &mdash; Échéance{" "}
                {formatDate(nextPending.dueDate)}
              </p>
            </div>

            {/* Method select */}
            <Select
              label="Méthode de paiement"
              options={paymentMethodOptions}
              value={selectedMethod}
              onChange={(e) =>
                setSelectedMethod(e.target.value as PaymentMethod)
              }
            />

            {/* Reference number (required) */}
            <Input
              label="Numéro de référence"
              placeholder="Ex: VIR-2026-01-001"
              value={paymentReference}
              onChange={(e) => {
                setPaymentReference(e.target.value);
                if (referenceError) setReferenceError("");
              }}
              error={referenceError}
              icon={<CreditCard className="h-4 w-4" />}
            />

            {/* Proof image upload */}
            <div>
              <p className="text-sm font-medium text-[#0f1b2d] mb-2">
                Preuve de paiement (image)
              </p>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[#e5e7eb] rounded-lg p-4 cursor-pointer hover:border-[#10b981] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProofFileChange}
                />
                {proofPreview ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={proofPreview}
                      alt="Preuve"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <span className="text-sm text-[#10b981] font-medium">
                      {proofFile?.name}
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-[#6b7280]" />
                    <span className="text-sm text-[#6b7280]">
                      Cliquez pour ajouter une image
                    </span>
                  </>
                )}
              </label>
            </div>

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
                Soumettre le paiement
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
