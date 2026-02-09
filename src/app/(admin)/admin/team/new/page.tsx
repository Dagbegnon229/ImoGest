"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Card, Button, Input, Select } from "@/components/ui";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { generateAdminId } from "@/lib/utils";
import { ArrowLeft, Copy, Check, Eye, EyeOff, ShieldPlus } from "lucide-react";

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
  const { admins, addAdmin } = useData();
  const { showToast } = useToast();

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

  const [createdResult, setCreatedResult] = useState<{
    adminId: string;
    password: string;
    name: string;
    role: string;
  } | null>(null);

  const generatedId = useMemo(() => generateAdminId(admins), [admins]);

  const roleOptions = [
    { value: "admin_manager", label: "Gestionnaire" },
    { value: "admin_support", label: "Support" },
  ];

  const copyPassword = useCallback(() => {
    navigator.clipboard.writeText(generatedPassword);
    setCopiedPwd(true);
    setTimeout(() => setCopiedPwd(false), 2000);
  }, [generatedPassword]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "Le pr\u00e9nom est requis";
    if (!lastName.trim()) e.lastName = "Le nom est requis";
    if (!email.trim()) e.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email invalide";
    if (!phone.trim()) e.phone = "Le t\u00e9l\u00e9phone est requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const newAdmin = addAdmin({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: role as "admin_manager" | "admin_support",
        password: generatedPassword,
        isActive: true,
        createdBy: user?.id ?? null,
      });

      setCreatedResult({
        adminId: newAdmin.id,
        password: generatedPassword,
        name: `${firstName.trim()} ${lastName.trim()}`,
        role: role === "admin_manager" ? "Gestionnaire" : "Support",
      });

      showToast("Administrateur cr\u00e9\u00e9 avec succ\u00e8s", "success");
    } catch {
      showToast("Erreur lors de la cr\u00e9ation", "error");
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
            <h2 className="text-xl font-bold text-[#171717]">
              Administrateur cr&eacute;&eacute;
            </h2>
            <div className="bg-[#f8fafc] rounded-lg p-4 text-sm space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Nom</span>
                <span className="font-medium text-[#171717]">{createdResult.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7280]">R&ocirc;le</span>
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
                      showToast("Mot de passe copi\u00e9", "success");
                    }}
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    <Copy className="h-3.5 w-3.5 text-[#6b7280]" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#6b7280]">
              Conservez ces informations en lieu s&ucirc;r. Le mot de passe ne pourra plus &ecirc;tre r&eacute;cup&eacute;r&eacute;.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" onClick={() => router.push("/admin/team")}>
                Retour &agrave; l&apos;&eacute;quipe
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
                Cr&eacute;er un autre
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/admin/team")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Nouvel administrateur</h1>
          <p className="text-sm text-[#6b7280]">
            Cr&eacute;er un nouveau compte administrateur
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card header={<h2 className="font-semibold text-[#171717]">Informations</h2>}>
          <div className="space-y-4">
            <div className="bg-[#f8fafc] rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-[#6b7280]">ID Admin (auto-g&eacute;n&eacute;r&eacute;)</span>
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
            <Select
              label="R&ocirc;le"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={roleOptions}
            />
          </div>
        </Card>

        <Card header={<h2 className="font-semibold text-[#171717]">Mot de passe</h2>}>
          <div className="space-y-3">
            <p className="text-sm text-[#6b7280]">
              Un mot de passe s&eacute;curis&eacute; a &eacute;t&eacute; g&eacute;n&eacute;r&eacute; automatiquement.
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
            Cr&eacute;er l&apos;administrateur
          </Button>
        </div>
      </form>
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
