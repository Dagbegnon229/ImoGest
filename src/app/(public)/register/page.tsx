"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Upload, CheckCircle } from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { useData } from "@/contexts/DataContext";

export default function RegisterPage() {
  const { addApplication } = useData();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [housingPreference, setHousingPreference] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation");
      return;
    }

    setIsSubmitting(true);

    try {
      const application = await addApplication({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        housingPreference: housingPreference.trim() || null,
        documents: documentName ? [documentName] : [],
      });

      setSuccessId(application.id);
    } catch {
      setError("Une erreur est survenue lors de l'envoi de votre demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (successId) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <PublicNavbar />

        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md text-center">
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#d1fae5] flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="h-8 w-8 text-[#10b981]" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#0f1b2d] mb-2">
                Demande envoy&eacute;e !
              </h1>
              <p className="text-sm text-[#6b7280] mb-4">
                Votre demande de pr&eacute;-inscription a &eacute;t&eacute;
                soumise avec succ&egrave;s.
              </p>
              <div className="bg-[#f8fafc] rounded-lg p-4 mb-6">
                <p className="text-xs text-[#6b7280] mb-1">
                  Num&eacute;ro de demande
                </p>
                <p className="text-lg font-bold text-[#0f1b2d] font-mono">
                  {successId}
                </p>
              </div>
              <p className="text-sm text-[#6b7280] mb-6">
                Un administrateur examinera votre demande. Vous recevrez vos
                identifiants de connexion une fois votre demande approuv&eacute;e.
              </p>
              <Link
                href="/"
                className="inline-block bg-[#0f1b2d] text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-[#1a2d4a] transition-colors"
              >
                Retour &agrave; l&apos;accueil
              </Link>
            </div>
          </div>
        </div>

        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <PublicNavbar />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 shadow-sm">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-xl bg-[#10b981] flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#0f1b2d]">
                Demande de pr&eacute;-inscription
              </h1>
              <p className="mt-2 text-sm text-[#6b7280]">
                Remplissez le formulaire ci-dessous pour soumettre votre demande
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info Section */}
              <div>
                <h3 className="text-sm font-semibold text-[#0f1b2d] mb-3 uppercase tracking-wide">
                  Informations personnelles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-[#0f1b2d] mb-1.5"
                    >
                      Pr&eacute;nom
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Votre prénom"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-[#0f1b2d] mb-1.5"
                    >
                      Nom
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Votre nom"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-[#0f1b2d] mb-1.5"
                    >
                      T&eacute;l&eacute;phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+212 6XX XXX XXX"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-[#0f1b2d] mb-1.5"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div>
                <h3 className="text-sm font-semibold text-[#0f1b2d] mb-3 uppercase tracking-wide">
                  S&eacute;curit&eacute;
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-[#0f1b2d] mb-1.5"
                    >
                      Mot de passe
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 caractères"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-[#0f1b2d] mb-1.5"
                    >
                      Confirmer
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmez le mot de passe"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Housing preference */}
              <div>
                <h3 className="text-sm font-semibold text-[#0f1b2d] mb-3 uppercase tracking-wide">
                  Pr&eacute;f&eacute;rence de logement
                </h3>
                <textarea
                  value={housingPreference}
                  onChange={(e) => setHousingPreference(e.target.value)}
                  placeholder="Décrivez vos préférences (type de logement, quartier, budget, etc.)"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent resize-none"
                />
              </div>

              {/* Document upload */}
              <div>
                <h3 className="text-sm font-semibold text-[#0f1b2d] mb-3 uppercase tracking-wide">
                  Document justificatif
                </h3>
                <label className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl border-2 border-dashed border-[#e5e7eb] text-sm text-[#6b7280] cursor-pointer hover:border-[#10b981] hover:text-[#10b981] transition-colors">
                  <Upload className="h-5 w-5" />
                  {documentName ? (
                    <span className="text-[#0f1b2d] font-medium">
                      {documentName}
                    </span>
                  ) : (
                    <span>Cliquez pour t&eacute;l&eacute;verser un document</span>
                  )}
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </label>
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-[#e5e7eb] text-[#10b981] focus:ring-[#10b981] mt-0.5"
                  />
                  <span className="text-sm text-[#6b7280]">
                    J&apos;accepte les{" "}
                    <span className="text-[#0f1b2d] font-medium">
                      conditions d&apos;utilisation
                    </span>{" "}
                    et la{" "}
                    <span className="text-[#0f1b2d] font-medium">
                      politique de confidentialit&eacute;
                    </span>
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#10b981] text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Envoi en cours..."
                  : "Soumettre ma demande"}
              </button>
            </form>

            {/* Login link */}
            <p className="mt-6 text-center text-sm text-[#6b7280]">
              D&eacute;j&agrave; un compte ?{" "}
              <Link
                href="/connexion/client"
                className="text-[#10b981] font-medium hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
