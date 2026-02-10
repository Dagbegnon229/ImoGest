"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Building2, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Comment ça marche", href: "#comment-ca-marche" },
];

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setIsOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-[#e5e7eb] shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <Building2 className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#0f1b2d]">ImmoGest</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="text-sm font-medium text-[#6b7280] hover:text-[#0f1b2d] transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-[#10b981] after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/connexion/client"
            className="text-sm font-medium text-[#6b7280] hover:text-[#0f1b2d] transition-colors px-4 py-2"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold text-white px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            }}
          >
            Commencer
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-[#0f1b2d] hover:text-[#10b981] transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border-t border-[#e5e7eb] px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="block px-4 py-3 text-sm font-medium text-[#6b7280] hover:text-[#0f1b2d] hover:bg-[#f8fafc] rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-[#e5e7eb] space-y-2">
            <Link
              href="/connexion/client"
              className="block w-full text-center px-4 py-3 text-sm font-medium text-[#6b7280] hover:text-[#0f1b2d] border border-[#e5e7eb] rounded-full transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="block w-full text-center px-4 py-3 text-sm font-semibold text-white rounded-full transition-all duration-300"
              style={{
                background:
                  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              }}
            >
              Commencer
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
