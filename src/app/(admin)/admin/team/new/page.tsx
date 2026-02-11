"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Card, Button, Input, Select } from "@/components/ui";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { generateAdminId } from "@/lib/utils";
import { adminRoleLabels, roleColorOptions } from "@/lib/constants";
import {
  ArrowLeft,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldPlus,
  Plus,
  X,
  Tag,
  Trash2,
} from "lucide-react";

function generatePassword(length = 14): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function CreateAdminContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { admins, addAdmin, customRoles, addCustomRole, deleteCustomRole } = useData();
  const { showToast } = useToast();

  // ── Form state ──
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("admin_manager");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [generatedPassword] = useState(() => generatePassword());
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPwd, setCopiedPwd] = useState(false);

  // ── New Role modal state ──
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleLabel, setNewRoleLabel] = useState("");
  const [newRoleColor, setNewRoleColor] = useState(roleColorOptions[0].value);
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [roleErrors, setRoleErrors] = useState<Record<string, string>>({});

  // ── Delete role confirm state ──
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

  const [createdResult, setCreatedResult] = useState<{
    adminId: string;
    password: string;
    name: string;
    role: string;
  } | null>(null);

  const generatedId = useMemo(() => generateAdminId(admins), [admins]);

  // Build role options: built-in + custom
  const roleOptions = useMemo(() => {
    const builtIn = [
      { value: "admin_manager", label: "Gestionnaire" },
      { value: "admin_support", label: "Support" },
    ];
    const custom = customRoles.map((r) => ({
      value: r.name,
      label: r.label,
    }));
    return [...builtIn, ...custom];
  }, [customRoles]);

  // Get role label for display
  const getRoleLabel = useCallback(
    (roleValue: string) => {
      if (adminRoleLabels[roleValue]) return adminRoleLabels[roleValue];
      const found = customRoles.find((r) => r.name === roleValue);
      return found ? found.label : roleValue;
    },
    [customRoles],
  );

  const copyPassword = useCallback(() => {
    navigator.clipboard.writeText(generatedPassword);
    setCopiedPwd(true);
    setTimeout(() => setCopiedPwd(false), 2000);
  }, [generatedPassword]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "Le prénom est requis";
    if (!lastName.trim()) e.lastName = "Le nom est requis";
    if (!email.trim()) e.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email invalide";
    if (!phone.trim()) e.phone = "Le téléphone est requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const newAdmin = await addAdmin({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: role as string,
        password: generatedPassword,
        isActive: true,
        createdBy: user?.id ?? null,
      });

      setCreatedResult({
        adminId: newAdmin.id,
        password: generatedPassword,
        name: `${firstName.trim()} ${lastName.trim()}`,
        role: getRoleLabel(role),
      });

      showToast("Administrateur créé avec succès", "success");
    } catch {
      showToast("Erreur lors de la création", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Create new custom role ──
  async function handleCreateRole() {
    const e: Record<string, string> = {};
    if (!newRoleName.trim()) e.name = "Le nom technique est requis";
    else if (!/^[a-z_]+$/.test(newRoleName.trim()))
      e.name = "Seulement des lettres minuscules et underscores (ex: comptable)";
    else if (
      ["super_admin", "admin_manager", "admin_support"].includes(newRoleName.trim()) ||
      customRoles.some((r) => r.name === newRoleName.trim())
    )
      e.name = "Ce nom de rôle existe déjà";
    if (!newRoleLabel.trim()) e.label = "Le libellé est requis";
    setRoleErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsCreatingRole(true);
    try {
      const created = await addCustomRole({
        name: newRoleName.trim(),
        label: newRoleLabel.trim(),
        color: newRoleColor,
        description: newRoleDescription.trim(),
        createdBy: user?.id ?? null,
      });
      // Auto-select the newly created role
      setRole(created.name);
      setShowNewRoleModal(false);
      setNewRoleName("");
      setNewRoleLabel("");
      setNewRoleColor(roleColorOptions[0].value);
      setNewRoleDescription("");
      setRoleErrors({});
      showToast(`Rôle "${created.label}" créé avec succès`, "success");
    } catch {
      showToast("Erreur lors de la création du rôle", "error");
    } finally {
      setIsCreatingRole(false);
    }
  }

  // ── Delete a custom role ──
  async function handleDeleteRole(id: string) {
    try {
      const roleToDelete = customRoles.find((r) => r.id === id);
      await deleteCustomRole(id);
      // If the deleted role was selected, reset to default
      if (roleToDelete && role === roleToDelete.name) {
        setRole("admin_manager");
      }
      setDeletingRoleId(null);
      showToast("Rôle supprimé", "success");
    } catch {
      showToast("Impossible de supprimer ce rôle", "error");
    }
  }

  // ═══════════════ SUCCESS SCREEN ═══════════════
  if (createdResult) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <Card>
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-[#d1fae5] rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-[#10b981]" />
            </div>
            <h2 className="text-xl font-bold text-[#171717]">
              Administrateur créé
            </h2>
            <div className="bg-[#f8fafc] rounded-lg p-4 text-sm space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Nom</span>
                <span className="font-medium text-[#171717]">{createdResult.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Rôle</span>
                <span className="font-medium text-[#171717]">{createdResult.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7280]">ID</span>
                <span className="font-mono font-medium text-[#171717]">
                  {createdResult.adminId}
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
            </div>
            <p className="text-xs text-[#6b7280]">
              Conservez ces informations en lieu sûr. Le mot de passe ne pourra plus être récupéré.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" onClick={() => router.push("/admin/team")}>
                Retour à l&apos;équipe
              </Button>
              <Button
                onClick={() => {
                  setCreatedResult(null);
                  setFirstName("");
                  setLastName("");
                  setEmail("");
                  setPhone("");
                  setRole("admin_manager");
                }}
              >
                Créer un autre
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ═══════════════ MAIN FORM ═══════════════
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/admin/team")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Nouvel administrateur</h1>
          <p className="text-sm text-[#6b7280]">
            Créer un nouveau compte administrateur
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Informations Card ── */}
        <Card header={<h2 className="font-semibold text-[#171717]">Informations</h2>}>
          <div className="space-y-4">
            <div className="bg-[#f8fafc] rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-[#6b7280]">ID Admin (auto-généré)</span>
              <span className="font-mono font-medium text-[#171717]">{generatedId}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
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
              label="Téléphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              placeholder="514-555-0123"
            />
          </div>
        </Card>

        {/* ── Rôle Card ── */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#171717]">Rôle</h2>
              <button
                type="button"
                onClick={() => setShowNewRoleModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Nouveau rôle
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <Select
              label="Rôle attribué"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={roleOptions}
            />

            {/* ── Custom Roles List ── */}
            {customRoles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Rôles personnalisés
                </p>
                <div className="space-y-1.5">
                  {customRoles.map((cr) => (
                    <div
                      key={cr.id}
                      className="flex items-center justify-between bg-[#f8fafc] rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${cr.color}`}
                        >
                          {cr.label}
                        </span>
                        {cr.description && (
                          <span className="text-xs text-[#9ca3af]">{cr.description}</span>
                        )}
                      </div>
                      {deletingRoleId === cr.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteRole(cr.id)}
                            className="text-[10px] text-red-600 font-medium hover:text-red-700 px-1.5 py-0.5 rounded bg-red-50"
                          >
                            Confirmer
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingRoleId(null)}
                            className="text-[10px] text-[#6b7280] font-medium hover:text-[#374151] px-1.5 py-0.5"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingRoleId(cr.id)}
                          className="p-1 rounded hover:bg-red-50 text-[#9ca3af] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* ── Mot de passe Card ── */}
        <Card header={<h2 className="font-semibold text-[#171717]">Mot de passe</h2>}>
          <div className="space-y-3">
            <p className="text-sm text-[#6b7280]">
              Un mot de passe sécurisé a été généré automatiquement.
            </p>
            <div className="flex items-center gap-2 bg-[#f8fafc] rounded-lg p-3">
              <span className="flex-1 font-mono text-sm text-[#171717]">
                {showPassword ? generatedPassword : "\u2022".repeat(generatedPassword.length)}
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
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/admin/team")}
          >
            Annuler
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            <ShieldPlus className="h-4 w-4" />
            Créer l&apos;administrateur
          </Button>
        </div>
      </form>

      {/* ═══════════════ NEW ROLE MODAL ═══════════════ */}
      {showNewRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#2563eb]" />
                <h3 className="font-semibold text-[#171717]">Nouveau rôle</h3>
              </div>
              <button
                onClick={() => {
                  setShowNewRoleModal(false);
                  setRoleErrors({});
                }}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-[#6b7280]" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Nom technique
                </label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value.toLowerCase().replace(/[^a-z_]/g, ""))}
                  placeholder="ex: comptable"
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] ${
                    roleErrors.name ? "border-red-400" : "border-[#d1d5db]"
                  }`}
                />
                {roleErrors.name && (
                  <p className="text-xs text-red-500 mt-1">{roleErrors.name}</p>
                )}
                <p className="text-[10px] text-[#9ca3af] mt-1">
                  Lettres minuscules et underscores uniquement
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Libellé affiché
                </label>
                <input
                  type="text"
                  value={newRoleLabel}
                  onChange={(e) => setNewRoleLabel(e.target.value)}
                  placeholder="ex: Comptable"
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] ${
                    roleErrors.label ? "border-red-400" : "border-[#d1d5db]"
                  }`}
                />
                {roleErrors.label && (
                  <p className="text-xs text-red-500 mt-1">{roleErrors.label}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Couleur du badge
                </label>
                <div className="flex flex-wrap gap-2">
                  {roleColorOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setNewRoleColor(opt.value)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border-2 transition-all ${
                        opt.value
                      } ${
                        newRoleColor === opt.value
                          ? "border-[#2563eb] ring-2 ring-[#2563eb]/20"
                          : "border-transparent"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Description <span className="text-[#9ca3af]">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="ex: Gestion de la comptabilité"
                  className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
              </div>

              {/* Preview */}
              <div className="bg-[#f8fafc] rounded-lg p-3">
                <p className="text-[10px] font-medium text-[#9ca3af] uppercase tracking-wider mb-2">
                  Aperçu
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${newRoleColor}`}
                >
                  {newRoleLabel || "Nouveau rôle"}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e5e7eb] bg-[#f8fafc]">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setShowNewRoleModal(false);
                  setRoleErrors({});
                }}
              >
                Annuler
              </Button>
              <Button type="button" onClick={handleCreateRole} isLoading={isCreatingRole}>
                <Plus className="h-4 w-4" />
                Créer le rôle
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateAdminPage() {
  return (
    <RoleGuard allowedRoles={["super_admin"]}>
      <CreateAdminContent />
    </RoleGuard>
  );
}
