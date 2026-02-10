"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  Send,
  Twitter,
  Linkedin,
  Github,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const footerLinks = {
  produit: {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "#fonctionnalites" },
      { label: "Intégrations", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  entreprise: {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "#" },
      { label: "Carrières", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Presse", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { label: "Centre d'aide", href: "#" },
      { label: "Documentation", href: "#" },
      { label: "Statut du service", href: "#" },
      { label: "Communauté", href: "#" },
      { label: "Webinaires", href: "#" },
    ],
  },
  legal: {
    title: "Légal",
    links: [
      { label: "Conditions d'utilisation", href: "#" },
      { label: "Politique de confidentialité", href: "#" },
      { label: "Mentions légales", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "RGPD", href: "#" },
    ],
  },
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Mail, href: "#", label: "Email" },
];

export function PublicFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-[#0f1b2d] text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
                <Building2 className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ImmoGest</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              La plateforme de gestion immobili&egrave;re la plus compl&egrave;te du Maroc.
              Simplifiez votre quotidien, digitalisez vos processus.
            </p>

            {/* Contact info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-[#10b981]" />
                <span>Casablanca, Maroc</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4 text-[#10b981]" />
                <span>+212 5 22 00 00 00</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4 text-[#10b981]" />
                <span>contact@immogest.ma</span>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#10b981] transition-all duration-300 hover:scale-110"
                >
                  <social.icon className="h-4 w-4 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-[#10b981] transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter section */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h4 className="text-base font-semibold text-white mb-1">
                Restez inform&eacute;
              </h4>
              <p className="text-sm text-gray-400">
                Recevez les derni&egrave;res actualit&eacute;s et mises &agrave; jour d&rsquo;ImmoGest.
              </p>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="flex w-full md:w-auto gap-2"
            >
              <div className="relative flex-1 md:w-72">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-full text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all duration-200"
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-105 shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                }}
              >
                {subscribed ? (
                  "Merci !"
                ) : (
                  <>
                    S&rsquo;inscrire
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} ImmoGest. Tous droits r&eacute;serv&eacute;s.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Conditions
            </a>
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Confidentialit&eacute;
            </a>
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
