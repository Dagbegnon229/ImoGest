"use client";

import Link from "next/link";
import { Building2, Home } from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function ConnexionPortal() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <PublicNavbar />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl">
          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f1b2d]">
              Acc&eacute;dez &agrave; votre espace
            </h1>
            <p className="mt-3 text-[#6b7280]">
              S&eacute;lectionnez votre portail de connexion
            </p>
          </div>

          {/* Portal cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Admin card */}
            <Link
              href="/connexion/admin"
              className="group bg-white border border-[#e5e7eb] rounded-2xl p-8 hover:shadow-lg hover:border-[#0f1b2d] transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-[#0f1b2d] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#0f1b2d] mb-2">
                Espace Administrateur
              </h2>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                G&eacute;rez vos immeubles, locataires, baux et incidents depuis
                votre tableau de bord administrateur.
              </p>
            </Link>

            {/* Client card */}
            <Link
              href="/connexion/client"
              className="group bg-white border border-[#e5e7eb] rounded-2xl p-8 hover:shadow-lg hover:border-[#10b981] transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-[#10b981] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Home className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#0f1b2d] mb-2">
                Espace Client
              </h2>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Consultez votre bail, signalez des incidents et g&eacute;rez
                votre profil depuis votre espace personnel.
              </p>
            </Link>
          </div>

          {/* Register link */}
          <p className="mt-8 text-center text-sm text-[#6b7280]">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="text-[#10b981] font-medium hover:underline"
            >
              Faire une demande de pr&eacute;-inscription
            </Link>
          </p>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
