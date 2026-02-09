import Link from "next/link";
import {
  Building2,
  MapPin,
  ShieldAlert,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

const features = [
  {
    icon: Building2,
    title: "Gestion de logements",
    description:
      "Gérez tous vos buildings et logements depuis une seule plateforme",
  },
  {
    icon: MapPin,
    title: "Localisation en temps réel",
    description:
      "Suivez vos techniciens et localisez vos biens immobiliers",
  },
  {
    icon: ShieldAlert,
    title: "Gestion des incidents",
    description:
      "Recevez et traitez les demandes de vos clients instantanément",
  },
  {
    icon: UserCheck,
    title: "Suivi client complet",
    description:
      "Accédez à toutes les informations de vos clients en un clic",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <PublicNavbar />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 bg-[#f8fafc]">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0f1b2d] max-w-4xl leading-tight">
          Simplifiez la gestion de vos biens immobiliers
        </h1>
        <p className="mt-6 text-lg text-[#6b7280] max-w-2xl">
          Une plateforme complète pour gérer vos buildings, logements, clients et
          incidents en temps réel.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/connexion"
            className="inline-flex items-center justify-center gap-2 bg-[#0f1b2d] text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-[#1a2d4a] transition-colors"
          >
            Commencer
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#fonctionnalites"
            className="inline-flex items-center justify-center gap-2 border-2 border-[#e5e7eb] text-[#0f1b2d] px-8 py-3.5 rounded-full text-base font-semibold hover:bg-gray-50 transition-colors"
          >
            En savoir plus
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f1b2d]">
              Fonctionnalités principales
            </h2>
            <p className="mt-4 text-lg text-[#6b7280] max-w-2xl mx-auto">
              Tous les outils dont vous avez besoin pour une gestion immobilière
              efficace
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white border border-[#e5e7eb] rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-[#d1fae5] flex items-center justify-center mb-5">
                  <feature.icon className="h-6 w-6 text-[#10b981]" />
                </div>
                <h3 className="text-lg font-bold text-[#0f1b2d] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#0f1b2d] py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Prêt à transformer votre gestion immobilière ?
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Rejoignez les professionnels qui font confiance à ImmoGest
          </p>
          <Link
            href="/register"
            className="mt-10 inline-block bg-white text-[#0f1b2d] px-10 py-4 rounded-full text-base font-semibold hover:bg-gray-100 transition-colors"
          >
            Commencer gratuitement
          </Link>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
