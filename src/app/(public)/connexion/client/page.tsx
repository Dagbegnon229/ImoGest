"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientLogin() {
  const [clientId, setClientId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleIdChange = (value: string) => {
    // Auto-uppercase for client IDs
    setClientId(value.toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate format
    if (!/^CLT-\d{4}-\d{4}$/.test(clientId.trim())) {
      setError("Format d'identifiant invalide. Exemple : CLT-2026-0001");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(clientId.trim(), password, "client");

      if (!result.success) {
        setError(result.error || "Erreur de connexion");
      } else if (result.mustChangePassword) {
        router.push("/change-password");
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
              <div className="w-14 h-14 rounded-xl bg-[#10b981] flex items-center justify-center mx-auto mb-4">
                <Home className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#0f1b2d]">
                ImmoGest
              </h1>
              <p className="mt-1 text-xs font-semibold tracking-widest text-[#6b7280] uppercase">
                Mon Espace
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Client ID */}
              <div>
                <label
                  htmlFor="clientId"
                  className="block text-sm font-medium text-[#0f1b2d] mb-1.5"
                >
                  Identifiant client
                </label>
                <input
                  id="clientId"
                  type="text"
                  value={clientId}
                  onChange={(e) => handleIdChange(e.target.value)}
                  placeholder="CLT-2026-0001"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-shadow font-mono"
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
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-shadow pr-12"
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

              {/* Remember me + forgot password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#e5e7eb] text-[#10b981] focus:ring-[#10b981]"
                  />
                  <span className="text-[#6b7280]">Rester connect&eacute;</span>
                </label>
                <Link
                  href="#"
                  className="text-[#0f1b2d] font-medium hover:underline"
                >
                  Mot de passe oubli&eacute; ?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#10b981] text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Connexion en cours..." : "Se connecter"}
              </button>
            </form>

            {/* Register link */}
            <p className="mt-6 text-center text-sm text-[#6b7280]">
              Pas encore de compte ?{" "}
              <Link
                href="/register"
                className="text-[#10b981] font-medium hover:underline"
              >
                Faire une demande
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
