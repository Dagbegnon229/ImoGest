"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleIdChange = (value: string) => {
    // Auto-uppercase for admin IDs
    setAdminId(value.toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate format
    if (!/^ADM-\d{4}$/.test(adminId.trim())) {
      setError("Format d'identifiant invalide. Exemple : ADM-0001");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(adminId.trim(), password, "admin");

      if (!result.success) {
        setError(result.error || "Erreur de connexion");
      } else if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    } catch {
      setError("Une erreur inattendue est survenue");
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

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 shadow-sm">
            {/* Branding */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-xl bg-[#0f1b2d] flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-7 w-7 text-[#10b981]" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#0f1b2d]">
                ImmoGest
              </h1>
              <p className="mt-1 text-xs font-semibold tracking-widest text-[#6b7280] uppercase">
                Espace Admin
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Admin ID */}
              <div>
                <label
                  htmlFor="adminId"
                  className="block text-sm font-medium text-[#0f1b2d] mb-1.5"
                >
                  Identifiant administrateur
                </label>
                <input
                  id="adminId"
                  type="text"
                  value={adminId}
                  onChange={(e) => handleIdChange(e.target.value)}
                  placeholder="ADM-0001"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1b2d] focus:border-transparent transition-shadow font-mono"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#0f1b2d] mb-1.5"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1b2d] focus:border-transparent transition-shadow pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#0f1b2d]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#e5e7eb] text-[#0f1b2d] focus:ring-[#0f1b2d]"
                  />
                  <span className="text-sm text-[#6b7280]">
                    Se souvenir de moi
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0f1b2d] text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-[#1a2d4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Connexion en cours..." : "Se connecter"}
              </button>
            </form>

            {/* Security notice */}
            <div className="mt-6 flex items-center gap-2 justify-center text-xs text-[#6b7280]">
              <ShieldCheck className="h-4 w-4" />
              <span>Acc&egrave;s r&eacute;serv&eacute; aux administrateurs</span>
            </div>

            {/* Back link */}
            <p className="mt-4 text-center text-sm text-[#6b7280]">
              <Link
                href="/connexion"
                className="text-[#0f1b2d] font-medium hover:underline"
              >
                &larr; Retour au choix du portail
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
