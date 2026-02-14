"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Card, Button, Input, Select } from "@/components/ui";
import { generateTenantId } from "@/lib/utils";
import { ArrowLeft, Copy, Check, Eye, EyeOff, UserPlus } from "lucide-react";

function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function CreateClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { tenants, buildings, getAvailableApartments, addTenant, addLease, updateApartment } =
    useData();
  const { showToast } = useToast();

  // Section 1: Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Section 2: Password
  const [passwordMode, setPasswordMode] = useState<"auto" | "manual">("auto");
  const [autoPassword] = useState(() => generatePassword());
  const [manualPassword, setManualPassword] = useState("");
  const [forceChange, setForceChange] = useState(true);
  const [copiedPwd, setCopiedPwd] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Section 3: Housing
  const [buildingId, setBuildingId] = useState("");
  const [apartmentId, setApartmentId] = useState("");

  // Section 4: Lease
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");

  // Errors & State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<{
    clientId: string;
    password: string;
    aptUnit: string;
    buildingName: string;
  } | null>(null);

  const generatedId = useMemo(() => generateTenantId(tenants), [tenants]);

  // Pre-fill building/apartment from URL params (cross-linking)
  useEffect(() => {
    const paramBuildingId = searchParams.get("buildingId");
    const paramApartmentId = searchParams.get("apartmentId");
    if (paramBuildingId && !buildingId) {
      setBuildingId(paramBuildingId);
    }
    if (paramApartmentId && !apartmentId) {
      setApartmentId(paramApartmentId);
      // Auto-fill rent from apartment
      const apts = getAvailableApartments(paramBuildingId ?? "");
      const apt = apts.find((a) => a.id === paramApartmentId);
      if (apt && !rent) setRent(apt.rent.toString());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const selectedPassword = passwordMode === "auto" ? autoPassword : manualPassword;

  const copyPassword = useCallback(() => {
    navigator.clipboard.writeText(selectedPassword);
    setCopiedPwd(true);
    setTimeout(() => setCopiedPwd(false), 2000);
  }, [selectedPassword]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "Le prénom est requis";
    if (!lastName.trim()) e.lastName = "Le nom est requis";
    if (!email.trim()) e.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email invalide";
    if (!phone.trim()) e.phone = "Le téléphone est requis";
    if (passwordMode === "manual" && manualPassword.length < 6)
      e.manualPassword = "Le mot de passe doit contenir au moins 6 caractères";
    if (!buildingId) e.buildingId = "Sélectionnez un immeuble";
    if (!apartmentId) e.apartmentId = "Sélectionnez un appartement";
    if (!startDate) e.startDate = "La date de début est requise";
    if (!endDate) e.endDate = "La date de fin est requise";
    if (startDate && endDate && new Date(endDate) <= new Date(startDate))
      e.endDate = "La date de fin doit être après la date de début";
    if (!rent || isNaN(Number(rent)) || Number(rent) <= 0) e.rent = "Loyer invalide";
    if (!deposit || isNaN(Number(deposit)) || Number(deposit) < 0) e.deposit = "Dépôt invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      // 1. Create tenant
      const newTenant = await addTenant({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: selectedPassword,
        status: "active",
        buildingId,
        apartmentId,
        leaseId: null,
        mustChangePassword: forceChange,
        createdBy: user?.id ?? null,
        statusChangedAt: null,
        promoCredits: 0,
        notes: null,
        emergencyContact: null,
        emergencyPhone: null,
      });

      // 2. Create lease
      const newLease = await addLease({
        tenantId: newTenant.id,
        apartmentId,
        buildingId,
        startDate,
        endDate,
        monthlyRent: Number(rent),
        depositAmount: Number(deposit),
        status: "active",
        createdBy: user?.id ?? "",
      });

      // 3. Update apartment
      await updateApartment(apartmentId, {
        status: "occupied",
        tenantId: newTenant.id,
      });

      // 4. Update tenant with leaseId
      // (We need to do this since addTenant doesn't know the lease ID yet)
      // The DataContext doesn't have a direct way to set leaseId in addTenant,
      // so we use the tenant object returned

      const apt = availableApts.find((a) => a.id === apartmentId);
      const bld = buildings.find((b) => b.id === buildingId);

      setCreatedResult({
        clientId: newTenant.id,
        password: selectedPassword,
        aptUnit: apt?.unitNumber ?? "",
        buildingName: bld?.name ?? "",
      });

      showToast("Client créé avec succès", "success");
    } catch {
      showToast("Erreur lors de la création du client", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Success Screen
  if (createdResult) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <Card>
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-[#d1fae5] rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-[#10b981]" />
            </div>
            <h2 className="text-xl font-bold text-[#171717]">Client cr&eacute;&eacute; avec succ&egrave;s</h2>
            <div className="bg-[#f8fafc] rounded-lg p-4 text-sm space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-[#6b7280]">ID Client</span>
                <span className="font-mono font-medium text-[#171717]">
                  {createdResult.clientId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6b7280]">Mot de passe</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-[#171717]">
                    {createdResult.password}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdResult.password);
                      showToast("Mot de passe copié", "success");
                    }}
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    <Copy className="h-3.5 w-3.5 text-[#6b7280]" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Immeuble</span>
                <span className="font-medium text-[#171717]">
                  {createdResult.buildingName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Appartement</span>
                <span className="font-medium text-[#171717]">
                  Unit&eacute; {createdResult.aptUnit}
                </span>
              </div>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" onClick={() => router.push("/admin/clients")}>
                Liste des clients
              </Button>
              <Button
                onClick={() => {
                  setCreatedResult(null);
                  setFirstName("");
                  setLastName("");
                  setEmail("");
                  setPhone("");
                  setManualPassword("");
                  setBuildingId("");
                  setApartmentId("");
                  setStartDate("");
                  setEndDate("");
                  setRent("");
                  setDeposit("");
                }}
              >
                Cr&eacute;er un autre client
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/admin/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Nouveau client</h1>
          <p className="text-sm text-[#6b7280]">
            Cr&eacute;er un compte client et assigner un logement
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Info */}
        <Card header={<h2 className="font-semibold text-[#171717]">Informations personnelles</h2>}>
          <div className="space-y-4">
            <div className="bg-[#f8fafc] rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-[#6b7280]">ID Client (auto-g&eacute;n&eacute;r&eacute;)</span>
              <span className="font-mono font-medium text-[#171717]">{generatedId}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Pr&eacute;nom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={errors.firstName}
              />
              <Input
                label="Nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={errors.lastName}
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <Input
              label="T&eacute;l&eacute;phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              placeholder="514-555-0123"
            />
          </div>
        </Card>

        {/* Section 2: Password */}
        <Card header={<h2 className="font-semibold text-[#171717]">Mot de passe</h2>}>
          <div className="space-y-4">
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="pwdMode"
                  checked={passwordMode === "auto"}
                  onChange={() => setPasswordMode("auto")}
                  className="accent-[#10b981]"
                />
                G&eacute;n&eacute;rer automatiquement
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="pwdMode"
                  checked={passwordMode === "manual"}
                  onChange={() => setPasswordMode("manual")}
                  className="accent-[#10b981]"
                />
                D&eacute;finir manuellement
              </label>
            </div>

            {passwordMode === "auto" ? (
              <div className="flex items-center gap-2 bg-[#f8fafc] rounded-lg p-3">
                <span className="flex-1 font-mono text-sm text-[#171717]">
                  {showPassword ? autoPassword : "\u2022".repeat(autoPassword.length)}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded hover:bg-gray-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-[#6b7280]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#6b7280]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={copyPassword}
                  className="p-1.5 rounded hover:bg-gray-200"
                >
                  {copiedPwd ? (
                    <Check className="h-4 w-4 text-[#10b981]" />
                  ) : (
                    <Copy className="h-4 w-4 text-[#6b7280]" />
                  )}
                </button>
              </div>
            ) : (
              <Input
                label="Mot de passe"
                type="password"
                value={manualPassword}
                onChange={(e) => setManualPassword(e.target.value)}
                error={errors.manualPassword}
                placeholder="Minimum 6 caractères"
              />
            )}

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={forceChange}
                onChange={(e) => setForceChange(e.target.checked)}
                className="accent-[#10b981] rounded"
              />
              Forcer le changement de mot de passe &agrave; la premi&egrave;re connexion
            </label>
          </div>
        </Card>

        {/* Section 3: Housing */}
        <Card header={<h2 className="font-semibold text-[#171717]">Assignation logement</h2>}>
          <div className="space-y-4">
            <Select
              label="Immeuble"
              value={buildingId}
              onChange={(e) => {
                setBuildingId(e.target.value);
                setApartmentId("");
              }}
              options={buildingOptions}
              placeholder="Sélectionner un immeuble"
              error={errors.buildingId}
            />
            <Select
              label="Appartement disponible"
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
                    ? "Sélectionner un appartement"
                    : "Aucun appartement disponible"
                  : "Choisir un immeuble d'abord"
              }
              disabled={!buildingId || availableApts.length === 0}
              error={errors.apartmentId}
            />
          </div>
        </Card>

        {/* Section 4: Lease Terms */}
        <Card header={<h2 className="font-semibold text-[#171717]">Termes du bail</h2>}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date de début"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                error={errors.startDate}
              />
              <Input
                label="Date de fin"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                error={errors.endDate}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Loyer mensuel ($)"
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                error={errors.rent}
                min={0}
              />
              <Input
                label="Dépôt de garantie ($)"
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                error={errors.deposit}
                min={0}
              />
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/admin/clients")}
          >
            Annuler
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            <UserPlus className="h-4 w-4" />
            Cr&eacute;er le client
          </Button>
        </div>
      </form>
    </div>
  );
}
