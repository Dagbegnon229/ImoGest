"use client";

import { Building2 } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-white border-t border-[#e5e7eb] py-8 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[#0f1b2d]" />
          <span className="font-bold text-[#0f1b2d]">ImmoGest</span>
        </div>
        <p className="text-sm text-[#6b7280]">
          &copy; {new Date().getFullYear()} ImmoGest. Tous droits r&eacute;serv&eacute;s.
        </p>
      </div>
    </footer>
  );
}
