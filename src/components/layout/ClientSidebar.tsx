"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, LogOut, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  FileText,
  DoorOpen,
  AlertTriangle,
  UserCircle,
  CreditCard,
  Award,
  FolderOpen,
  MessageSquare,
} from "lucide-react";
import { clientNavItems } from "@/lib/constants";

// Map icon name strings from constants to actual Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  FileText,
  DoorOpen,
  AlertTriangle,
  UserCircle,
  CreditCard,
  Award,
  FolderOpen,
  MessageSquare,
};

interface ClientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClientSidebar({ isOpen, onClose }: ClientSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#e5e7eb] flex flex-col transform transition-transform duration-200 lg:translate-x-0 lg:static ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#e5e7eb]">
          <Link href="/client" className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#10b981]" />
            <span className="text-lg font-bold text-[#0f1b2d]">ImmoGest</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-[#6b7280] hover:text-[#0f1b2d]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {clientNavItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive =
              pathname === item.href ||
              (item.href !== "/client" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#d1fae5] text-[#10b981]"
                    : "text-[#6b7280] hover:bg-[#f8fafc] hover:text-[#0f1b2d]"
                }`}
              >
                {Icon && <Icon className="h-5 w-5" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-[#e5e7eb]">
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#6b7280] hover:bg-[#f8fafc] hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
