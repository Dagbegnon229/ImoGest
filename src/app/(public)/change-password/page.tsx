"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { updateTenant } = useData();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsSubmitting(true);

    try {
      if (user) {
        await updateTenant(user.id, {
          password: newPassword,
          mustChangePassword: false,
        });
        router.push("/client");
      } else {
        setError("Session expirée. Veuillez vous reconnecter.");
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-7 w-7 text-[#0f1b2d]" />
            <span className="text-xl font-bold text-[#0f1b2d]">ImmoGest</span>
          </Link>
        </div>
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 shadow-sm">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-xl bg-[#0f1b2d] flex items-center justify-center mx-auto mb-4">
                <Lock className="h-7 w-7 text-[#10b981]" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#0f1b2d]">
                Changement de mot de passe
              </h1>
              <p className="mt-2 text-sm text-[#6b7280]">
                Pour votre s&eacute;curit&eacute;, veuillez choisir un nouveau
                mot de passe
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-[#0f1b2d] mb-1.5"
                >
                  Nouveau mot de passe
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 caractères"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1b2d] focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[#0f1b2d] mb-1.5"
                >
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre mot de passe"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1b2d] focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0f1b2d] text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-[#1a2d4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Mise à jour..."
                  : "Mettre à jour le mot de passe"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
