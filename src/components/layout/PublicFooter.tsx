"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  Send,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Brand column */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
                <Building2 className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ImmoGest</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              La plateforme de gestion immobilière la plus complète du Maroc.
              Simplifiez votre quotidien, digitalisez vos processus.
            </p>

            {/* Contact info */}
            <div className="space-y-3">
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
          </div>

          {/* Newsletter section */}
          <div className="flex flex-col justify-center">
            <h4 className="text-base font-semibold text-white mb-1">
              Restez informé
            </h4>
            <p className="text-sm text-gray-400 mb-4">
              Recevez les dernières actualités et mises à jour d&rsquo;ImmoGest.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex w-full gap-2"
            >
              <div className="relative flex-1">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} ImmoGest. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
