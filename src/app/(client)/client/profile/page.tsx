"use client";

import { useState, useMemo } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Lock,
  Save,
  IdCard,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Card, Button, Input, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { tenantStatusLabels, tenantStatusColors } from "@/lib/constants";

export default function ProfilePage() {
  const { user } = useAuth();
  const { tenants, updateTenant } = useData();
  const { toast } = useToast();

  const tenant = useMemo(
    () => tenants.find((t) => t.id === user?.id),
    [tenants, user?.id],
  );

  // Personal info form state
  const [firstName, setFirstName] = useState(tenant?.firstName ?? "");
  const [lastName, setLastName] = useState(tenant?.lastName ?? "");
  const [email, setEmail] = useState(tenant?.email ?? "");
  const [phone, setPhone] = useState(tenant?.phone ?? "");
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [infoErrors, setInfoErrors] = useState<Record<string, string>>({});

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );

  function validateInfo(): boolean {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = "Le prénom est requis";
    if (!lastName.trim()) errors.lastName = "Le nom est requis";
    if (!email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Format d'email invalide";
    }
    if (!phone.trim()) errors.phone = "Le téléphone est requis";
    setInfoErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    if (!validateInfo() || !tenant) return;

    setIsSavingInfo(true);
    try {
      await updateTenant(tenant.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      toast({
        type: "success",
        title: "Profil mis à jour",
        description: "Vos informations personnelles ont été enregistrées.",
      });
    } catch {
      toast({
        type: "error",
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la mise à jour du profil.",
      });
    } finally {
      setIsSavingInfo(false);
    }
  }

  function validatePassword(): boolean {
    const errors: Record<string, string> = {};
    if (!currentPassword) {
      errors.currentPassword = "Le mot de passe actuel est requis";
    } else if (tenant && currentPassword !== tenant.password) {
      errors.currentPassword = "Le mot de passe actuel est incorrect";
    }
    if (!newPassword) {
      errors.newPassword = "Le nouveau mot de passe est requis";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Le mot de passe doit contenir au moins 8 caractères";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "La confirmation est requise";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!validatePassword() || !tenant) return;

    setIsSavingPassword(true);
    try {
      await updateTenant(tenant.id, {
        password: newPassword,
        mustChangePassword: false,
      });
      toast({
        type: "success",
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
    } catch {
      toast({
        type: "error",
        title: "Erreur",
        description:
          "Une erreur est survenue lors du changement de mot de passe.",
      });
    } finally {
      setIsSavingPassword(false);
    }
  }

  if (!tenant) return null;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f1b2d]">Mon profil</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Gérez vos informations personnelles et votre mot de passe
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: editable forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Personal Information */}
          <form onSubmit={handleSaveInfo}>
            <Card
              header={
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#10b981]" />
                  <h2 className="text-lg font-semibold text-[#0f1b2d]">
                    Informations personnelles
                  </h2>
                </div>
              }
            >
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Prénom"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (infoErrors.firstName)
                        setInfoErrors((p) => ({ ...p, firstName: "" }));
                    }}
                    error={infoErrors.firstName}
                    icon={<User className="h-4 w-4" />}
                  />
                  <Input
                    label="Nom"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (infoErrors.lastName)
                        setInfoErrors((p) => ({ ...p, lastName: "" }));
                    }}
                    error={infoErrors.lastName}
                    icon={<User className="h-4 w-4" />}
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (infoErrors.email)
                      setInfoErrors((p) => ({ ...p, email: "" }));
                  }}
                  error={infoErrors.email}
                  icon={<Mail className="h-4 w-4" />}
                />
                <Input
                  label="Téléphone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (infoErrors.phone)
                      setInfoErrors((p) => ({ ...p, phone: "" }));
                  }}
                  error={infoErrors.phone}
                  icon={<Phone className="h-4 w-4" />}
                />
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="secondary"
                    isLoading={isSavingInfo}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              </div>
            </Card>
          </form>

          {/* Section 3: Change Password */}
          <form onSubmit={handleChangePassword}>
            <Card
              header={
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#10b981]" />
                  <h2 className="text-lg font-semibold text-[#0f1b2d]">
                    Changer le mot de passe
                  </h2>
                </div>
              }
            >
              <div className="space-y-5">
                <Input
                  label="Mot de passe actuel"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordErrors.currentPassword)
                      setPasswordErrors((p) => ({
                        ...p,
                        currentPassword: "",
                      }));
                  }}
                  error={passwordErrors.currentPassword}
                  icon={<Lock className="h-4 w-4" />}
                  placeholder="Saisissez votre mot de passe actuel"
                />
                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordErrors.newPassword)
                      setPasswordErrors((p) => ({ ...p, newPassword: "" }));
                  }}
                  error={passwordErrors.newPassword}
                  icon={<Lock className="h-4 w-4" />}
                  placeholder="Minimum 8 caractères"
                  hint="Le mot de passe doit contenir au moins 8 caractères"
                />
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordErrors.confirmPassword)
                      setPasswordErrors((p) => ({
                        ...p,
                        confirmPassword: "",
                      }));
                  }}
                  error={passwordErrors.confirmPassword}
                  icon={<Lock className="h-4 w-4" />}
                  placeholder="Répétez le nouveau mot de passe"
                />
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSavingPassword}
                    className="gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Modifier le mot de passe
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        </div>

        {/* Right: Account Details (read-only) */}
        <div className="space-y-6">
          <Card
            header={
              <div className="flex items-center gap-2">
                <IdCard className="h-5 w-5 text-[#10b981]" />
                <h2 className="text-lg font-semibold text-[#0f1b2d]">
                  Détails du compte
                </h2>
              </div>
            }
          >
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <IdCard className="h-4 w-4 text-[#6b7280] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#6b7280]">Identifiant client</p>
                  <p className="text-sm font-mono font-medium text-[#0f1b2d]">
                    {tenant.id}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-[#6b7280] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#6b7280]">Statut</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tenantStatusColors[tenant.status] || ""}`}
                  >
                    {tenantStatusLabels[tenant.status] || tenant.status}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-[#6b7280] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#6b7280]">Date d&apos;inscription</p>
                  <p className="text-sm font-medium text-[#0f1b2d]">
                    {formatDate(tenant.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Avatar/Initials Card */}
          <Card>
            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 rounded-full bg-[#0f1b2d] flex items-center justify-center text-white text-2xl font-bold mb-3">
                {tenant.firstName.charAt(0)}
                {tenant.lastName.charAt(0)}
              </div>
              <p className="text-base font-semibold text-[#0f1b2d]">
                {tenant.firstName} {tenant.lastName}
              </p>
              <p className="text-sm text-[#6b7280]">{tenant.email}</p>
              <p className="text-xs text-[#6b7280] mt-1">{tenant.phone}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
