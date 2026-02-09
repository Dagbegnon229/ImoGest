"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Card, Button, Input, Select, Textarea, Badge, EmptyState } from "@/components/ui";
import { generateTenantId } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  ClipboardList,
} from "lucide-react";
import {
  applicationStatusLabels,
  applicationStatusColors,
} from "@/lib/constants";

export default function ApplicationReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    getApplication,
    tenants,
    buildings,
    getAvailableApartments,
    approveApplication,
    rejectApplication,
  } = useData();

  const appId = params.id as string;
  const application = getApplication(appId);

  // Approve form state
  const [firstName, setFirstName] = useState(application?.firstName ?? "");
  const [lastName, setLastName] = useState(application?.lastName ?? "");
  const [email, setEmail] = useState(application?.email ?? "");
  const [phone, setPhone] = useState(application?.phone ?? "");
  const [buildingId, setBuildingId] = useState("");
  const [apartmentId, setApartmentId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [approveNote, setApproveNote] = useState("");
  const [approveErrors, setApproveErrors] = useState<Record<string, string>>({});

  // Reject form state
  const [rejectNote, setRejectNote] = useState("");
  const [rejectError, setRejectError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const generatedClientId = useMemo(() => generateTenantId(tenants), [tenants]);

  const buildingOptions = buildings.map((b) => ({
    value: b.id,
    label: `${b.name} - ${b.city}`,
  }));

  const availableApts = useMemo(
    () => (buildingId ? getAvailableApartments(buildingId) : []),
    [buildingId, getAvailableApartments]
  );

  const aptOptions = availableApts.map((a) => ({
    value: a.id,
    label: `Unit\u00e9 ${a.unitNumber} - \u00c9tage ${a.floor} - ${a.rent} $/mois`,
  }));

  if (!application) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/admin/applications")}>
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <EmptyState
          icon={<ClipboardList className="h-10 w-10" />}
          title="Demande introuvable"
          description="La demande demand\u00e9e n'existe pas."
        />
      </div>
    );
  }

  function validateApprove(): boolean {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "Requis";
    if (!lastName.trim()) e.lastName = "Requis";
    if (!email.trim()) e.email = "Requis";
    if (!phone.trim()) e.phone = "Requis";
    if (!buildingId) e.buildingId = "Requis";
    if (!apartmentId) e.apartmentId = "Requis";
    if (!startDate) e.startDate = "Requis";
    if (!endDate) e.endDate = "Requis";
    if (startDate && endDate && new Date(endDate) <= new Date(startDate))
      e.endDate = "Doit \u00eatre apr\u00e8s la date de d\u00e9but";
    if (!rent || Number(rent) <= 0) e.rent = "Invalide";
    if (!deposit || Number(deposit) < 0) e.deposit = "Invalide";
    setApproveErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleApprove() {
    if (!validateApprove()) return;
    setIsSubmitting(true);
    try {
      approveApplication(appId, user?.id ?? "", buildingId, apartmentId, {
        startDate,
        endDate,
        monthlyRent: Number(rent),
        depositAmount: Number(deposit),
      });
      showToast("Demande approuv\u00e9e - Compte client cr\u00e9\u00e9", "success");
      router.push("/admin/applications");
    } catch {
      showToast("Erreur lors de l'approbation", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReject() {
    if (!rejectNote.trim()) {
      setRejectError("Veuillez fournir une raison de rejet");
      return;
    }
    setIsSubmitting(true);
    try {
      rejectApplication(appId, user?.id ?? "", rejectNote.trim());
      showToast("Demande rejet\u00e9e", "success");
      router.push("/admin/applications");
    } catch {
      showToast("Erreur lors du rejet", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isPending = application.status === "pending_review";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/admin/applications")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#171717]">
              Demande {application.id}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                applicationStatusColors[application.status] ?? ""
              }`}
            >
              {applicationStatusLabels[application.status] ?? application.status}
            </span>
          </div>
          <p className="text-sm text-[#6b7280]">
            Soumise le {new Date(application.submittedAt).toLocaleDateString("fr-CA")}
          </p>
        </div>
      </div>

      {/* Section 1: Applicant Info */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[#6b7280]" />
            <h2 className="font-semibold text-[#171717]">Informations du demandeur</h2>
          </div>
        }
      >
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="text-[#6b7280]">Pr&eacute;nom</dt>
            <dd className="font-medium text-[#171717] mt-0.5">{application.firstName}</dd>
          </div>
          <div>
            <dt className="text-[#6b7280]">Nom</dt>
            <dd className="font-medium text-[#171717] mt-0.5">{application.lastName}</dd>
          </div>
          <div>
            <dt className="text-[#6b7280]">Email</dt>
            <dd className="font-medium text-[#171717] mt-0.5">{application.email}</dd>
          </div>
          <div>
            <dt className="text-[#6b7280]">T&eacute;l&eacute;phone</dt>
            <dd className="font-medium text-[#171717] mt-0.5">{application.phone}</dd>
          </div>
          {application.housingPreference && (
            <div className="col-span-2">
              <dt className="text-[#6b7280]">Pr&eacute;f&eacute;rence de logement</dt>
              <dd className="font-medium text-[#171717] mt-0.5">
                {application.housingPreference}
              </dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Section 2: Documents */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#6b7280]" />
            <h2 className="font-semibold text-[#171717]">Documents soumis</h2>
          </div>
        }
      >
        {application.documents.length === 0 ? (
          <p className="text-sm text-[#6b7280]">Aucun document soumis.</p>
        ) : (
          <ul className="space-y-2">
            {application.documents.map((doc, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-sm bg-[#f8fafc] rounded-lg px-3 py-2"
              >
                <FileText className="h-4 w-4 text-[#6b7280]" />
                <span className="text-[#171717]">{doc}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Review Note (if already reviewed) */}
      {application.reviewNote && (
        <Card
          header={<h2 className="font-semibold text-[#171717]">Note de r&eacute;vision</h2>}
        >
          <p className="text-sm text-[#171717]">{application.reviewNote}</p>
          {application.reviewedAt && (
            <p className="text-xs text-[#6b7280] mt-2">
              R&eacute;vis&eacute;e le {new Date(application.reviewedAt).toLocaleDateString("fr-CA")}{" "}
              par {application.reviewedBy}
            </p>
          )}
        </Card>
      )}

      {/* Section 3: Approve (only for pending) */}
      {isPending && (
        <Card
          header={
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
              <h2 className="font-semibold text-[#171717]">Approuver la demande</h2>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="bg-[#f8fafc] rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-[#6b7280]">ID Client (auto-g&eacute;n&eacute;r&eacute;)</span>
              <span className="font-mono font-medium text-[#171717]">{generatedClientId}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Pr&eacute;nom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={approveErrors.firstName}
              />
              <Input
                label="Nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={approveErrors.lastName}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={approveErrors.email}
              />
              <Input
                label="T&eacute;l&eacute;phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={approveErrors.phone}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Immeuble"
                value={buildingId}
                onChange={(e) => {
                  setBuildingId(e.target.value);
                  setApartmentId("");
                }}
                options={buildingOptions}
                placeholder="S\u00e9lectionner un immeuble"
                error={approveErrors.buildingId}
              />
              <Select
                label="Appartement"
                value={apartmentId}
                onChange={(e) => {
                  setApartmentId(e.target.value);
                  const apt = availableApts.find((a) => a.id === e.target.value);
                  if (apt && !rent) setRent(apt.rent.toString());
                }}
                options={aptOptions}
                placeholder={
                  buildingId
                    ? availableApts.length > 0
                      ? "S\u00e9lectionner"
                      : "Aucun disponible"
                    : "Choisir un immeuble"
                }
                disabled={!buildingId || availableApts.length === 0}
                error={approveErrors.apartmentId}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input
                label="D\u00e9but du bail"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                error={approveErrors.startDate}
              />
              <Input
                label="Fin du bail"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                error={approveErrors.endDate}
              />
              <Input
                label="Loyer ($)"
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                error={approveErrors.rent}
                min={0}
              />
              <Input
                label="D\u00e9p\u00f4t ($)"
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                error={approveErrors.deposit}
                min={0}
              />
            </div>

            <Textarea
              label="Notes (optionnel)"
              value={approveNote}
              onChange={(e) => setApproveNote(e.target.value)}
              placeholder="Notes internes sur l'approbation..."
            />

            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={handleApprove}
                isLoading={isSubmitting}
              >
                <CheckCircle2 className="h-4 w-4" />
                Approuver et cr&eacute;er le compte
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Section 4: Reject (only for pending) */}
      {isPending && (
        <Card
          header={
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <h2 className="font-semibold text-[#171717]">Rejeter la demande</h2>
            </div>
          }
        >
          <div className="space-y-4">
            <Textarea
              label="Raison du rejet"
              value={rejectNote}
              onChange={(e) => {
                setRejectNote(e.target.value);
                setRejectError("");
              }}
              error={rejectError}
              placeholder="Expliquez la raison du rejet..."
            />
            <div className="flex justify-end">
              <Button
                variant="danger"
                onClick={handleReject}
                isLoading={isSubmitting}
              >
                <XCircle className="h-4 w-4" />
                Rejeter la demande
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
