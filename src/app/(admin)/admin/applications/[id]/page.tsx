"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Card, Button, Input, Select, Textarea, Badge, EmptyState, Modal } from "@/components/ui";
import { generateTenantId } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Download,
  Image as ImageIcon,
  ExternalLink,
  Mail,
  Copy,
  Send,
} from "lucide-react";
import { formatFileSize } from "@/lib/utils";
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
  const [endDateIsToday, setEndDateIsToday] = useState(false);
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [approveNote, setApproveNote] = useState("");
  const [approveErrors, setApproveErrors] = useState<Record<string, string>>({});

  // Reject form state
  const [rejectNote, setRejectNote] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [showRejectPreview, setShowRejectPreview] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

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
    label: `Unité ${a.unitNumber} - Étage ${a.floor} - ${a.rent} $/mois`,
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
          description="La demande demandée n'existe pas."
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
    if (startDate && endDate && new Date(endDate) < new Date(startDate))
      e.endDate = "Doit être après ou égale à la date de début";
    if (!rent || Number(rent) <= 0) e.rent = "Invalide";
    if (!deposit || Number(deposit) < 0) e.deposit = "Invalide";
    setApproveErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleApprove() {
    if (!validateApprove()) return;
    setIsSubmitting(true);
    try {
      await approveApplication(appId, user?.id ?? "", buildingId, apartmentId, {
        startDate,
        endDate,
        monthlyRent: Number(rent),
        depositAmount: Number(deposit),
      });
      showToast("Demande approuvée - Compte client créé", "success");
      router.push("/admin/applications");
    } catch {
      showToast("Erreur lors de l'approbation", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openRejectPreview() {
    if (!rejectNote.trim()) {
      setRejectError("Veuillez fournir une raison de rejet");
      return;
    }
    setShowRejectPreview(true);
  }

  async function doReject() {
    setIsSubmitting(true);
    try {
      await rejectApplication(appId, user?.id ?? "", rejectNote.trim());
      showToast("Demande rejetée", "success");
      router.push("/admin/applications");
    } catch {
      showToast("Erreur lors du rejet", "error");
    } finally {
      setIsSubmitting(false);
      setShowRejectPreview(false);
    }
  }

  async function handleRejectWithEmail() {
    setIsSendingEmail(true);
    try {
      const res = await fetch("/api/send-rejection-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: application?.email,
          applicantName: `${application?.firstName} ${application?.lastName}`,
          reason: rejectNote.trim(),
        }),
      });
      if (!res.ok) throw new Error("Email failed");
      showToast("Email de rejet envoyé", "success");
      await doReject();
    } catch {
      showToast("Erreur d'envoi de l'email. La demande n'a pas été rejetée.", "error");
      setIsSendingEmail(false);
    }
  }

  function handleCopyTemplate() {
    const template = `Bonjour ${application?.firstName} ${application?.lastName},\n\nNous vous remercions pour votre demande de logement soumise sur notre plateforme ImoGest.\n\nAprès examen attentif de votre dossier, nous avons le regret de vous informer que votre demande n'a pas pu être retenue.\n\nMotif : ${rejectNote.trim()}\n\nVous pouvez soumettre une nouvelle demande si votre situation change. N'hésitez pas à nous contacter pour toute question.\n\nCordialement,\nL'équipe ImoGest`;
    navigator.clipboard.writeText(template);
    showToast("Modèle copié dans le presse-papier", "success");
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
        {(application.documentFiles?.length ?? 0) === 0 && application.documents.length === 0 ? (
          <p className="text-sm text-[#6b7280]">Aucun document soumis.</p>
        ) : (application.documentFiles?.length ?? 0) > 0 ? (
          <ul className="space-y-2">
            {application.documentFiles.map((doc, idx) => {
              const isImage = doc.type?.startsWith("image/");
              return (
                <li key={idx} className="flex items-center justify-between bg-[#f8fafc] rounded-lg px-3 py-2.5 border border-[#e5e7eb]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex-shrink-0 rounded-lg p-2 ${isImage ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}>
                      {isImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#171717] truncate">{doc.name}</p>
                      <p className="text-xs text-[#6b7280]">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-blue-50 text-[#6b7280] hover:text-[#2563eb] transition-colors" title="Ouvrir">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <a href={doc.url} download={doc.name} className="p-1.5 rounded-lg hover:bg-green-50 text-[#6b7280] hover:text-[#10b981] transition-colors" title="Télécharger">
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="space-y-2">
            {application.documents.map((doc, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm bg-[#f8fafc] rounded-lg px-3 py-2">
                <FileText className="h-4 w-4 text-[#6b7280]" />
                <span className="text-[#171717]">{doc}</span>
                <span className="text-xs text-[#9ca3af]">(ancien format)</span>
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
                placeholder="Sélectionner un immeuble"
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
                      ? "Sélectionner"
                      : "Aucun disponible"
                    : "Choisir un immeuble"
                }
                disabled={!buildingId || availableApts.length === 0}
                error={approveErrors.apartmentId}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input
                label="Début du bail"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                error={approveErrors.startDate}
              />
              <div>
                <Input
                  label="Date d'abonnement"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setEndDateIsToday(false);
                  }}
                  error={approveErrors.endDate}
                  disabled={endDateIsToday}
                />
                <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={endDateIsToday}
                    onChange={(e) => {
                      setEndDateIsToday(e.target.checked);
                      if (e.target.checked) {
                        setEndDate(new Date().toISOString().split("T")[0]);
                      }
                    }}
                    className="rounded border-gray-300 text-[#10b981] focus:ring-[#10b981]"
                  />
                  <span className="text-xs text-[#6b7280]">À ce jour</span>
                </label>
              </div>
              <Input
                label="Loyer ($)"
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                error={approveErrors.rent}
                min={0}
              />
              <Input
                label="Dépôt ($)"
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
                onClick={openRejectPreview}
              >
                <XCircle className="h-4 w-4" />
                Rejeter la demande
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Reject Preview Modal */}
      <Modal
        isOpen={showRejectPreview}
        onClose={() => setShowRejectPreview(false)}
        title="Confirmer le rejet"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-[#f8fafc] rounded-lg p-4 border border-[#e5e7eb]">
            <h3 className="text-sm font-semibold text-[#171717] mb-2">Aperçu de l'email</h3>
            <div className="text-sm text-[#6b7280] space-y-2">
              <p><strong>Destinataire :</strong> {application?.email}</p>
              <p><strong>Objet :</strong> ImoGest - Résultat de votre demande de logement</p>
              <hr className="border-[#e5e7eb]" />
              <p>Bonjour {application?.firstName} {application?.lastName},</p>
              <p>
                Nous vous remercions pour votre demande de logement soumise sur notre plateforme ImoGest.
                Après examen attentif de votre dossier, nous avons le regret de vous informer que votre demande n'a pas pu être retenue.
              </p>
              <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                <p className="text-xs font-semibold text-red-800">Motif :</p>
                <p className="text-sm text-[#171717]">{rejectNote}</p>
              </div>
              <p>
                Vous pouvez soumettre une nouvelle demande si votre situation change.
              </p>
              <p className="text-[#171717]">Cordialement, L'équipe ImoGest</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleRejectWithEmail}
              isLoading={isSendingEmail}
              className="w-full justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Envoyer l'email et rejeter
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  handleCopyTemplate();
                  doReject();
                }}
                isLoading={isSubmitting}
                className="flex-1 justify-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copier le modèle et rejeter
              </Button>
              <Button
                variant="danger"
                onClick={doReject}
                isLoading={isSubmitting}
                className="flex-1 justify-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Rejeter sans email
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
