"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  Building2,
  Users,
  Wrench,
  CreditCard,
  Trophy,
  MessageSquare,
  ArrowRight,
  ChevronDown,
  Check,
  Star,
  Zap,
  Shield,
  BarChart3,
  Clock,
  Headphones,
  Monitor,
  Smartphone,
  AlertCircle,
  X,
  Send,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

/* ───────────────────── Scroll Animation Hook ───────────────────── */

function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}

/* ───────────────────── Counter Animation Hook ───────────────────── */

function useCounter(target: number, isVisible: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, target, duration]);
  return count;
}

/* ───────────────────── CSS Keyframe Styles ───────────────────── */

const keyframeStyles = `
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
}
@keyframes grid-fade {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes dot-pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.5; }
}
`;

/* ───────────────────── Features Data ───────────────────── */

const features = [
  {
    icon: Building2,
    title: "Gestion des immeubles",
    description:
      "Centralisez tous vos biens, appartements, et donn\u00e9es en un seul endroit. Vue d'ensemble compl\u00e8te de votre patrimoine.",
    details: [
      "Gestion multi-immeubles avec \u00e9tages et lots",
      "Suivi des surfaces, loyers et historique",
      "Documents et photos par bien",
      "Tableau de bord par immeuble",
      "Export des donn\u00e9es et rapports",
    ],
  },
  {
    icon: Users,
    title: "Portail locataire",
    description:
      "Espace d\u00e9di\u00e9 pour chaque locataire avec son bail, paiements et documents accessibles \u00e0 tout moment.",
    details: [
      "Dashboard personnel pour chaque locataire",
      "Bail en ligne avec signature \u00e9lectronique",
      "Historique complet des paiements",
      "Documents t\u00e9l\u00e9chargeables (quittances, bail)",
      "Notifications et rappels personnalis\u00e9s",
    ],
  },
  {
    icon: Wrench,
    title: "Gestion des incidents",
    description:
      "Signalement, suivi, assignation et r\u00e9solution en temps r\u00e9el. Ne perdez plus jamais un ticket.",
    details: [
      "Photos et description d\u00e9taill\u00e9e",
      "Niveaux de priorit\u00e9 (urgent, normal, faible)",
      "Assignation automatique aux techniciens",
      "Suivi du statut en temps r\u00e9el",
      "Notifications \u00e0 chaque \u00e9tape",
    ],
  },
  {
    icon: CreditCard,
    title: "Paiements & Facturation",
    description:
      "Suivi des loyers, quittances automatiques et rappels de retard. Tout est automatis\u00e9.",
    details: [
      "Virement, carte, esp\u00e8ces, ch\u00e8que",
      "G\u00e9n\u00e9ration automatique de quittances PDF",
      "Alertes de retard de paiement",
      "P\u00e9nalit\u00e9s automatiques configurable",
      "Rapports financiers d\u00e9taill\u00e9s",
    ],
  },
  {
    icon: Trophy,
    title: "Programme de fid\u00e9lit\u00e9",
    description:
      "Points, niveaux et r\u00e9compenses pour les bons locataires. Encouragez les paiements \u00e0 temps.",
    details: [
      "5 niveaux : Bronze, Silver, Gold, Platinum, Diamond",
      "Points gagn\u00e9s par paiement ponctuel",
      "R\u00e9ductions sur le loyer pour les fid\u00e8les",
      "Badges et r\u00e9compenses exclusives",
      "Classement et gamification",
    ],
  },
  {
    icon: MessageSquare,
    title: "Messagerie int\u00e9gr\u00e9e",
    description:
      "Communication directe admin-locataire sans quitter la plateforme. Historique complet.",
    details: [
      "Chat en temps r\u00e9el",
      "Historique des conversations",
      "Pi\u00e8ces jointes et documents",
      "Notifications push et email",
      "Fils de discussion par sujet",
    ],
  },
];

/* ───────────────────── Trust Logos Data ───────────────────── */

const trustLogos = [
  { name: "Atlas Immobilier", icon: Building2 },
  { name: "R\u00e9sidences Royales", icon: Shield },
  { name: "Groupe Al Omrane", icon: BarChart3 },
  { name: "Casablanca Properties", icon: Zap },
  { name: "Marrakech Estates", icon: Star },
  { name: "Tanger Habitat", icon: Building2 },
];

/* ───────────────────── Steps Data ───────────────────── */

const steps = [
  {
    num: "01",
    title: "Inscrivez votre immeuble",
    description:
      "Ajoutez vos biens et configurez les appartements, \u00e9tages et lots en quelques clics.",
    icon: Building2,
  },
  {
    num: "02",
    title: "Invitez vos locataires",
    description:
      "Chaque locataire re\u00e7oit son identifiant CLT unique et acc\u00e8de \u00e0 son espace personnel.",
    icon: Users,
  },
  {
    num: "03",
    title: "G\u00e9rez tout en un clic",
    description:
      "Incidents, paiements, communications\u2026 tout est centralis\u00e9 dans un tableau de bord intuitif.",
    icon: Monitor,
  },
];

/* ───────────────────── Testimonials Data ───────────────────── */

const testimonials = [
  {
    quote:
      "ImmoGest a compl\u00e8tement transform\u00e9 notre gestion quotidienne. Nous avons r\u00e9duit les retards de paiement de 60% en 3 mois.",
    name: "Karim Benali",
    title: "Directeur G\u00e9n\u00e9ral",
    company: "Atlas Immobilier",
  },
  {
    quote:
      "Le portail locataire est une r\u00e9volution. Nos clients sont plus satisfaits et nous gagnons un temps pr\u00e9cieux chaque jour.",
    name: "Fatima Zahra El Alaoui",
    title: "Responsable Patrimoine",
    company: "R\u00e9sidences Royales",
  },
  {
    quote:
      "La gestion des incidents en temps r\u00e9el nous a permis de r\u00e9duire notre temps de r\u00e9solution de 48h \u00e0 moins de 6h.",
    name: "Youssef Amrani",
    title: "Chef de Projet",
    company: "Groupe Al Omrane",
  },
];

/* ───────────────────── Pricing Data ───────────────────── */

const pricingPlans = [
  {
    name: "Starter",
    price: "Gratuit",
    period: "",
    description: "Pour d\u00e9marrer avec un petit portefeuille",
    features: [
      "Jusqu'\u00e0 2 immeubles",
      "10 locataires maximum",
      "Gestion des incidents",
      "Messagerie basique",
      "Support par email",
    ],
    cta: "Commencer gratuitement",
    popular: false,
  },
  {
    name: "Pro",
    price: "499",
    period: "MAD/mois",
    description: "Pour les gestionnaires professionnels",
    features: [
      "Immeubles illimit\u00e9s",
      "Locataires illimit\u00e9s",
      "Paiements & facturation",
      "Programme de fid\u00e9lit\u00e9",
      "Messagerie avanc\u00e9e",
      "Quittances PDF automatiques",
      "Support prioritaire 24/7",
    ],
    cta: "Essai gratuit 14 jours",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Sur devis",
    period: "",
    description: "Pour les grands groupes immobiliers",
    features: [
      "Tout du plan Pro",
      "API d\u00e9di\u00e9e",
      "Int\u00e9grations personnalis\u00e9es",
      "Formation sur site",
      "Account manager d\u00e9di\u00e9",
      "SLA garanti 99.99%",
      "D\u00e9ploiement on-premise",
    ],
    cta: "Contactez-nous",
    popular: false,
  },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function Home() {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const heroStats = useScrollAnimation(0.2);
  const heroCount1 = useCounter(500, heroStats.isVisible);
  const heroCount2 = useCounter(10000, heroStats.isVisible);

  const statsSection = useScrollAnimation(0.2);
  const stat1 = useCounter(500, statsSection.isVisible);
  const stat2 = useCounter(12000, statsSection.isVisible);
  const stat3 = useCounter(98, statsSection.isVisible);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: keyframeStyles }} />
      <PublicNavbar />

      {/* ============================================================
          1. HERO SECTION
          ============================================================ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-32 pb-20 bg-[#f8fafc] overflow-hidden">
        {/* Animated dot grid background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, #0f1b2d 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              opacity: 0.05,
              animation: "grid-fade 4s ease-in-out infinite",
            }}
          />
          {/* Gradient overlay orbs */}
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
              animation: "float 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(15,27,45,0.06) 0%, transparent 70%)",
              animation: "float 8s ease-in-out infinite 1s",
            }}
          />
        </div>

        <div
          className="relative z-10 max-w-5xl mx-auto"
          style={{ animation: "fade-in-up 0.8s ease-out" }}
        >
          <div className="inline-flex items-center gap-2 bg-white border border-[#e5e7eb] rounded-full px-4 py-1.5 text-sm text-[#6b7280] mb-8 shadow-sm">
            <Zap className="h-4 w-4 text-[#10b981]" />
            <span>Nouveau : Programme de fid&eacute;lit&eacute; locataire disponible</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-[#0f1b2d] leading-[1.1] tracking-tight">
            La plateforme tout-en-un
            <br />
            pour la{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
              }}
            >
              gestion immobili&egrave;re
            </span>
          </h1>

          <p
            className="mt-6 text-lg sm:text-xl text-[#6b7280] max-w-2xl mx-auto leading-relaxed"
            style={{ animation: "fade-in-up 0.8s ease-out 0.2s both" }}
          >
            G&eacute;rez vos immeubles, locataires, paiements et incidents depuis une
            seule plateforme intelligente. Simplifiez votre quotidien.
          </p>

          <div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ animation: "fade-in-up 0.8s ease-out 0.4s both" }}
          >
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-full text-base font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                animation: "pulse-glow 3s ease-in-out infinite",
              }}
            >
              Commencer gratuitement
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-[#e5e7eb] text-[#0f1b2d] px-8 py-4 rounded-full text-base font-semibold hover:border-[#10b981] hover:text-[#10b981] transition-all duration-300"
            >
              <Monitor className="h-5 w-5" />
              Voir la d&eacute;mo
            </a>
          </div>
        </div>

        {/* Hero Stats */}
        <div
          ref={heroStats.ref}
          className="relative z-10 mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
          style={{ animation: "fade-in-up 0.8s ease-out 0.6s both" }}
        >
          {[
            { value: heroCount1, suffix: "+", label: "Immeubles g\u00e9r\u00e9s" },
            { value: heroCount2, suffix: "+", label: "Locataires actifs" },
            { value: "99.9", suffix: "%", label: "Disponibilit\u00e9", isStatic: true },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0f1b2d]">
                {"isStatic" in item ? item.value : item.value.toLocaleString("fr-FR")}
                {item.suffix}
              </div>
              <div className="mt-1 text-sm text-[#6b7280]">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          2. TRUST BAR / SOCIAL PROOF
          ============================================================ */}
      <section className="py-12 bg-white border-y border-[#e5e7eb] overflow-hidden">
        <p className="text-center text-sm font-semibold text-[#6b7280] uppercase tracking-widest mb-8">
          Ils nous font confiance
        </p>
        <div className="relative">
          <div
            className="flex gap-16 items-center whitespace-nowrap"
            style={{
              animation: "marquee 30s linear infinite",
              width: "max-content",
            }}
          >
            {[...trustLogos, ...trustLogos].map((logo, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[#9ca3af] hover:text-[#0f1b2d] transition-colors duration-300"
              >
                <logo.icon className="h-6 w-6" />
                <span className="text-lg font-bold">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          3. FEATURES SECTION
          ============================================================ */}
      <section id="fonctionnalites" className="py-24 px-4 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Tout ce dont vous avez besoin"
            subtitle="Des outils puissants pour g\u00e9rer chaque aspect de votre patrimoine immobilier, du premier jour."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                feature={feature}
                index={index}
                isExpanded={expandedFeature === index}
                onToggle={() =>
                  setExpandedFeature(
                    expandedFeature === index ? null : index
                  )
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          4. HOW IT WORKS
          ============================================================ */}
      <section id="comment-ca-marche" className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            title="Comment \u00e7a marche"
            subtitle="Trois \u00e9tapes simples pour transformer votre gestion immobili\u00e8re."
          />

          <div className="mt-16 relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#10b981] via-[#059669] to-[#047857] -translate-y-1/2" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {steps.map((step, index) => (
                <StepCard key={index} step={step} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. INTERACTIVE DEMO
          ============================================================ */}
      <section id="demo" className="py-24 px-4 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="D\u00e9couvrez l'interface"
            subtitle="Une interface intuitive con\u00e7ue pour simplifier votre quotidien."
          />

          <div className="mt-12">
            {/* Tab switcher */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-white rounded-full p-1.5 border border-[#e5e7eb] shadow-sm">
                {["Dashboard Admin", "Espace Client", "Gestion Incidents"].map(
                  (tab, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTab(i)}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeTab === i
                          ? "bg-[#0f1b2d] text-white shadow-md"
                          : "text-[#6b7280] hover:text-[#0f1b2d]"
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Tab content mockup */}
            <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#f8fafc] border-b border-[#e5e7eb]">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-4 text-xs text-[#6b7280]">
                  immogest.ma/dashboard
                </span>
              </div>
              <div className="p-8 min-h-[400px] transition-all duration-500">
                {activeTab === 0 && <AdminDashboardMock />}
                {activeTab === 1 && <ClientDashboardMock />}
                {activeTab === 2 && <IncidentDashboardMock />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          6. STATS SECTION
          ============================================================ */}
      <section
        ref={statsSection.ref}
        className="py-24 px-4"
        style={{ background: "linear-gradient(135deg, #0f1b2d 0%, #1a2d4a 100%)" }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { value: stat1, suffix: "+", label: "Immeubles" },
            { value: stat2, suffix: "+", label: "Locataires" },
            { value: stat3, suffix: "%", label: "Satisfaction" },
            { value: "24/7", label: "Support", isStatic: true },
          ].map((item, i) => (
            <div
              key={i}
              className="text-center"
              style={{
                opacity: statsSection.isVisible ? 1 : 0,
                transform: statsSection.isVisible
                  ? "translateY(0)"
                  : "translateY(20px)",
                transition: `all 0.6s ease-out ${i * 0.15}s`,
              }}
            >
              <div className="text-4xl sm:text-5xl font-extrabold text-white">
                {"isStatic" in item && item.isStatic
                  ? item.value
                  : typeof item.value === "number"
                  ? item.value.toLocaleString("fr-FR")
                  : item.value}
                {"suffix" in item ? item.suffix : ""}
              </div>
              <div className="mt-2 text-sm text-gray-400 font-medium">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          7. TESTIMONIALS
          ============================================================ */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Ce que disent nos clients"
            subtitle="Des professionnels de l'immobilier qui nous font confiance au quotidien."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          8. PRICING
          ============================================================ */}
      <section id="tarifs" className="py-24 px-4 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Tarification simple et transparente"
            subtitle="Pas de frais cach\u00e9s. Choisissez le plan qui correspond \u00e0 vos besoins."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {pricingPlans.map((plan, i) => (
              <PricingCard key={i} plan={plan} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          9. FINAL CTA
          ============================================================ */}
      <section className="py-24 px-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FinalCTA />
        </div>
      </section>

      {/* ============================================================
          10. FOOTER
          ============================================================ */}
      <PublicFooter />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className="text-center max-w-2xl mx-auto"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.7s ease-out",
      }}
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f1b2d]">
        {title}
      </h2>
      <p className="mt-4 text-lg text-[#6b7280] leading-relaxed">{subtitle}</p>
    </div>
  );
}

/* ──── Feature Card ──── */

function FeatureCard({
  feature,
  index,
  isExpanded,
  onToggle,
}: {
  feature: (typeof features)[0];
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { ref, isVisible } = useScrollAnimation();
  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className={`bg-white border rounded-2xl p-8 transition-all duration-500 cursor-pointer group ${
        isExpanded
          ? "border-[#10b981] shadow-lg shadow-[#10b981]/10"
          : "border-[#e5e7eb] hover:shadow-lg hover:border-[#10b981]/30"
      }`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "translateY(0) scale(1)"
          : "translateY(30px) scale(0.95)",
        transition: `all 0.6s ease-out ${index * 0.1}s`,
      }}
      onClick={onToggle}
    >
      <div className="w-12 h-12 rounded-xl bg-[#d1fae5] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-6 w-6 text-[#10b981]" />
      </div>
      <h3 className="text-lg font-bold text-[#0f1b2d] mb-2">{feature.title}</h3>
      <p className="text-[#6b7280] text-sm leading-relaxed">
        {feature.description}
      </p>

      {/* Expanded details */}
      <div
        className="overflow-hidden transition-all duration-500"
        style={{
          maxHeight: isExpanded ? "300px" : "0",
          opacity: isExpanded ? 1 : 0,
          marginTop: isExpanded ? "16px" : "0",
        }}
      >
        <div className="border-t border-[#e5e7eb] pt-4">
          <ul className="space-y-2">
            {feature.details.map((detail, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#6b7280]">
                <Check className="h-4 w-4 text-[#10b981] mt-0.5 shrink-0" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#10b981] hover:text-[#059669] transition-colors">
        {isExpanded ? "Moins de d\u00e9tails" : "En savoir plus"}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
}

/* ──── Step Card ──── */

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[0];
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation();
  const Icon = step.icon;

  return (
    <div
      ref={ref}
      className="relative text-center lg:text-left"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.6s ease-out ${index * 0.2}s`,
      }}
    >
      <div className="relative z-10 bg-white rounded-2xl p-8 border border-[#e5e7eb] hover:shadow-lg transition-shadow duration-300">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center mb-6 mx-auto lg:mx-0">
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div className="text-xs font-bold text-[#10b981] uppercase tracking-widest mb-2">
          \u00c9tape {step.num}
        </div>
        <h3 className="text-xl font-bold text-[#0f1b2d] mb-3">{step.title}</h3>
        <p className="text-[#6b7280] text-sm leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  );
}

/* ──── Testimonial Card ──── */

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[0];
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className="bg-[#f8fafc] rounded-2xl p-8 border border-[#e5e7eb] hover:shadow-lg hover:border-[#10b981]/30 transition-all duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.6s ease-out ${index * 0.15}s`,
      }}
    >
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-[#fbbf24] text-[#fbbf24]" />
        ))}
      </div>
      <p className="text-[#0f1b2d] leading-relaxed mb-6">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white font-bold text-sm">
          {testimonial.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <div className="text-sm font-bold text-[#0f1b2d]">
            {testimonial.name}
          </div>
          <div className="text-xs text-[#6b7280]">
            {testimonial.title}, {testimonial.company}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──── Pricing Card ──── */

function PricingCard({
  plan,
  index,
}: {
  plan: (typeof pricingPlans)[0];
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`rounded-2xl p-8 border transition-all duration-300 hover:shadow-xl ${
        plan.popular
          ? "bg-[#0f1b2d] border-[#10b981] text-white relative scale-105 shadow-xl"
          : "bg-white border-[#e5e7eb] hover:border-[#10b981]/30"
      }`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? plan.popular
            ? "translateY(0) scale(1.05)"
            : "translateY(0)"
          : "translateY(30px)",
        transition: `all 0.6s ease-out ${index * 0.15}s`,
      }}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#10b981] text-white text-xs font-bold px-4 py-1 rounded-full">
          Populaire
        </div>
      )}
      <h3
        className={`text-xl font-bold mb-2 ${
          plan.popular ? "text-white" : "text-[#0f1b2d]"
        }`}
      >
        {plan.name}
      </h3>
      <p
        className={`text-sm mb-6 ${
          plan.popular ? "text-gray-300" : "text-[#6b7280]"
        }`}
      >
        {plan.description}
      </p>
      <div className="mb-6">
        <span
          className={`text-4xl font-extrabold ${
            plan.popular ? "text-white" : "text-[#0f1b2d]"
          }`}
        >
          {plan.price}
        </span>
        {plan.period && (
          <span
            className={`text-sm ml-1 ${
              plan.popular ? "text-gray-400" : "text-[#6b7280]"
            }`}
          >
            {plan.period}
          </span>
        )}
      </div>
      <ul className="space-y-3 mb-8">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <Check
              className={`h-4 w-4 shrink-0 ${
                plan.popular ? "text-[#10b981]" : "text-[#10b981]"
              }`}
            />
            <span className={plan.popular ? "text-gray-200" : "text-[#6b7280]"}>
              {f}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={`block w-full text-center py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
          plan.popular
            ? "bg-[#10b981] text-white hover:bg-[#059669]"
            : "bg-[#0f1b2d] text-white hover:bg-[#1a2d4a]"
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}

/* ──── Final CTA ──── */

function FinalCTA() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.7s ease-out",
      }}
    >
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
        Pr&ecirc;t &agrave; transformer votre
        <br />
        gestion immobili&egrave;re ?
      </h2>
      <p className="mt-6 text-lg text-white/80 max-w-xl mx-auto">
        Rejoignez les centaines de professionnels qui font d&eacute;j&agrave; confiance &agrave;
        ImmoGest pour g&eacute;rer leur patrimoine.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/register"
          className="group inline-flex items-center justify-center gap-2 bg-white text-[#0f1b2d] px-10 py-4 rounded-full text-base font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105"
        >
          Commencer gratuitement
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/connexion"
          className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-white/10 transition-all duration-300"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}

/* ──── Dashboard Mockups ──── */

function AdminDashboardMock() {
  return (
    <div style={{ animation: "fade-in-up 0.5s ease-out" }}>
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Immeubles", value: "12", change: "+2", icon: Building2 },
          { label: "Locataires", value: "248", change: "+18", icon: Users },
          { label: "Incidents ouverts", value: "7", change: "-3", icon: AlertCircle },
          { label: "Revenu mensuel", value: "186K MAD", change: "+12%", icon: BarChart3 },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-[#f8fafc] rounded-xl p-4 border border-[#e5e7eb]"
          >
            <div className="flex items-center justify-between mb-2">
              <s.icon className="h-4 w-4 text-[#6b7280]" />
              <span className="text-xs font-medium text-[#10b981]">
                {s.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-[#0f1b2d]">{s.value}</div>
            <div className="text-xs text-[#6b7280]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table mock */}
      <div className="bg-[#f8fafc] rounded-xl border border-[#e5e7eb] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e5e7eb]">
          <span className="text-sm font-semibold text-[#0f1b2d]">
            Paiements r&eacute;cents
          </span>
        </div>
        <div className="divide-y divide-[#e5e7eb]">
          {[
            { tenant: "Ahmed M.", amount: "3,500 MAD", status: "Pay\u00e9", color: "text-[#10b981] bg-[#d1fae5]" },
            { tenant: "Sara K.", amount: "4,200 MAD", status: "En attente", color: "text-yellow-700 bg-yellow-50" },
            { tenant: "Omar B.", amount: "2,800 MAD", status: "Pay\u00e9", color: "text-[#10b981] bg-[#d1fae5]" },
          ].map((row, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0f1b2d] flex items-center justify-center text-white text-xs font-bold">
                  {row.tenant.split(" ").map((n) => n[0]).join("")}
                </div>
                <span className="text-sm text-[#0f1b2d] font-medium">
                  {row.tenant}
                </span>
              </div>
              <span className="text-sm font-semibold text-[#0f1b2d]">
                {row.amount}
              </span>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${row.color}`}
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClientDashboardMock() {
  return (
    <div style={{ animation: "fade-in-up 0.5s ease-out" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile card */}
        <div className="bg-[#f8fafc] rounded-xl p-6 border border-[#e5e7eb]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white font-bold text-lg">
              AH
            </div>
            <div>
              <div className="font-bold text-[#0f1b2d]">Ahmed Hassani</div>
              <div className="text-sm text-[#6b7280]">CLT-2024-0847</div>
              <div className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-[#10b981] bg-[#d1fae5] px-2 py-0.5 rounded-full">
                <Trophy className="h-3 w-3" /> Gold
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white rounded-lg p-3 border border-[#e5e7eb]">
              <div className="text-xs text-[#6b7280]">Loyer mensuel</div>
              <div className="text-lg font-bold text-[#0f1b2d]">3,500 MAD</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-[#e5e7eb]">
              <div className="text-xs text-[#6b7280]">Points fid&eacute;lit&eacute;</div>
              <div className="text-lg font-bold text-[#10b981]">2,450</div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-[#f8fafc] rounded-xl p-6 border border-[#e5e7eb]">
          <h4 className="font-semibold text-[#0f1b2d] mb-4">Actions rapides</h4>
          <div className="space-y-3">
            {[
              { icon: CreditCard, label: "Payer le loyer", color: "text-[#10b981]" },
              { icon: Wrench, label: "Signaler un incident", color: "text-orange-500" },
              { icon: MessageSquare, label: "Envoyer un message", color: "text-blue-500" },
              { icon: Clock, label: "T\u00e9l\u00e9charger quittance", color: "text-purple-500" },
            ].map((action, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#e5e7eb] hover:border-[#10b981]/30 transition-colors cursor-pointer"
              >
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <span className="text-sm font-medium text-[#0f1b2d]">
                  {action.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IncidentDashboardMock() {
  return (
    <div style={{ animation: "fade-in-up 0.5s ease-out" }}>
      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Ouverts", value: "7", color: "text-red-500 bg-red-50" },
          { label: "En cours", value: "12", color: "text-yellow-600 bg-yellow-50" },
          { label: "R\u00e9solus ce mois", value: "34", color: "text-[#10b981] bg-[#d1fae5]" },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl p-4 text-center ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Incident list */}
      <div className="bg-[#f8fafc] rounded-xl border border-[#e5e7eb] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
          <span className="text-sm font-semibold text-[#0f1b2d]">
            Incidents r&eacute;cents
          </span>
          <span className="text-xs text-[#6b7280]">Aujourd&rsquo;hui</span>
        </div>
        <div className="divide-y divide-[#e5e7eb]">
          {[
            {
              title: "Fuite d'eau - Apt 3B",
              priority: "Urgent",
              pColor: "text-red-600 bg-red-50",
              time: "Il y a 2h",
            },
            {
              title: "Porte d'entr\u00e9e bloqu\u00e9e",
              priority: "Normal",
              pColor: "text-yellow-600 bg-yellow-50",
              time: "Il y a 5h",
            },
            {
              title: "Ampoule couloir 2e \u00e9tage",
              priority: "Faible",
              pColor: "text-blue-600 bg-blue-50",
              time: "Hier",
            },
          ].map((inc, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-[#6b7280]" />
                <span className="text-sm text-[#0f1b2d] font-medium">
                  {inc.title}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${inc.pColor}`}
                >
                  {inc.priority}
                </span>
                <span className="text-xs text-[#6b7280]">{inc.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
