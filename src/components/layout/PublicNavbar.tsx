"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";

export function PublicNavbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#e5e7eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="h-7 w-7 text-[#0f1b2d]" />
          <span className="text-xl font-bold text-[#0f1b2d]">ImmoGest</span>
        </Link>
        <Link
          href="/connexion"
          className="bg-[#0f1b2d] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#1a2d4a] transition-colors"
        >
          Connexion
        </Link>
      </div>
    </nav>
  );
}
