"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
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
  Monitor,
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
      "Centralisez tous vos biens, appartements, et données en un seul endroit. Vue d'ensemble complète de votre patrimoine.",
    details: [
      "Gestion multi-immeubles avec étages et lots",
      "Suivi des surfaces, loyers et historique",
      "Documents et photos par bien",
      "Tableau de bord par immeuble",
      "Export des données et rapports",
    ],
  },
  {
    icon: Users,
    title: "Portail locataire",
    description:
      "Espace dédié pour chaque locataire avec son bail, paiements et documents accessibles à tout moment.",
    details: [
      "Dashboard personnel pour chaque locataire",
      "Bail en ligne avec signature électronique",
      "Historique complet des paiements",
      "Documents téléchargeables (quittances, bail)",
      "Notifications et rappels personnalisés",
    ],
  },
  {
    icon: Wrench,
    title: "Gestion des incidents",
    description:
      "Signalement, suivi, assignation et résolution en temps réel. Ne perdez plus jamais un ticket.",
    details: [
      "Photos et description détaillée",
      "Niveaux de priorité (urgent, normal, faible)",
      "Assignation automatique aux techniciens",
      "Suivi du statut en temps réel",
      "Notifications à chaque étape",
    ],
  },
  {
    icon: CreditCard,
    title: "Paiements & Facturation",
    description:
      "Suivi des loyers, quittances automatiques et rappels de retard. Tout est automatisé.",
    details: [
      "Virement, carte, espèces, chèque",
      "Génération automatique de quittances PDF",
      "Alertes de retard de paiement",
      "Pénalités automatiques configurable",
      "Rapports financiers détaillés",
    ],
  },
  {
    icon: Trophy,
    title: "Programme de fidélité",
    description:
      "Points, niveaux et récompenses pour les bons locataires. Encouragez les paiements à temps.",
    details: [
      "5 niveaux : Bronze, Silver, Gold, Platinum, Diamond",
      "Points gagnés par paiement ponctuel",
      "Réductions sur le loyer pour les fidèles",
      "Badges et récompenses exclusives",
      "Classement et gamification",
    ],
  },
  {
    icon: MessageSquare,
    title: "Messagerie intégrée",
    description:
      "Communication directe admin-locataire sans quitter la plateforme. Historique complet.",
    details: [
      "Chat en temps réel",
      "Historique des conversations",
      "Pièces jointes et documents",
      "Notifications push et email",
      "Fils de discussion par sujet",
    ],
  },
];

/* ───────────────────── Trust Logos Data ───────────────────── */

const trustLogos = [
  { name: "Atlas Immobilier", icon: Building2 },
  { name: "Résidences Royales", icon: Shield },
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
      "Ajoutez vos biens et configurez les appartements, étages et lots en quelques clics.",
    icon: Building2,
  },
  {
    num: "02",
    title: "Invitez vos locataires",
    description:
      "Chaque locataire reçoit son identifiant CLT unique et accède à son espace personnel.",
    icon: Users,
  },
  {
    num: "03",
    title: "Gérez tout en un clic",
    description:
      "Incidents, paiements, communications… tout est centralisé dans un tableau de bord intuitif.",
    icon: Monitor,
  },
];

/* ───────────────────── Testimonials Data ───────────────────── */

const testimonials = [
  {
    quote:
      "ImmoGest a complètement transformé notre gestion quotidienne. Nous avons réduit les retards de paiement de 60% en 3 mois.",
    name: "Karim Benali",
    title: "Directeur Général",
    company: "Atlas Immobilier",
  },
  {
    quote:
      "Le portail locataire est une révolution. Nos clients sont plus satisfaits et nous gagnons un temps précieux chaque jour.",
    name: "Fatima Zahra El Alaoui",
    title: "Responsable Patrimoine",
    company: "Résidences Royales",
  },
  {
    quote:
      "La gestion des incidents en temps réel nous a permis de réduire notre temps de résolution de 48h à moins de 6h.",
    name: "Youssef Amrani",
    title: "Chef de Projet",
    company: "Groupe Al Omrane",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function Home() {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

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
          </div>
        </div>

        {/* Hero Stats */}
        <div
          ref={heroStats.ref}
          className="relative z-10 mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
          style={{ animation: "fade-in-up 0.8s ease-out 0.6s both" }}
        >
          {[
            { value: heroCount1, suffix: "+", label: "Immeubles gérés" },
            { value: heroCount2, suffix: "+", label: "Locataires actifs" },
            { value: "99.9", suffix: "%", label: "Disponibilité", isStatic: true },
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
            subtitle="Des outils puissants pour gérer chaque aspect de votre patrimoine immobilier, du premier jour."
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
            title="Comment ça marche"
            subtitle="Trois étapes simples pour transformer votre gestion immobilière."
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
          8. FINAL CTA
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
        {isExpanded ? "Moins de détails" : "En savoir plus"}
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
          Étape {step.num}
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
          href="/connexion/client"
          className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-white/10 transition-all duration-300"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}

