"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, Menu, LogOut, User } from "lucide-react";
import type { AuthUser } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { adminRoleLabels } from "@/lib/constants";

interface AdminTopbarProps {
  onMenuClick: () => void;
  user: AuthUser | null;
}

export function AdminTopbar({ onMenuClick, user }: AdminTopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "?";

  const roleName =
    user && user.role !== "tenant"
      ? adminRoleLabels[user.role] || user.role
      : "";

  return (
    <header className="h-16 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-4 lg:px-8 shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-[#0f1b2d] hover:text-[#10b981] transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 w-64 rounded-lg border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1b2d] focus:border-transparent"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative text-[#6b7280] hover:text-[#0f1b2d] transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-[#0f1b2d] flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-[#0f1b2d] leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : "Utilisateur"}
              </p>
              {roleName && (
                <p className="text-xs text-[#6b7280] leading-tight">
                  {roleName}
                </p>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-[#6b7280]" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-[#e5e7eb] shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#0f1b2d] hover:bg-[#f8fafc] transition-colors"
              >
                <User className="h-4 w-4" />
                Mon profil
              </button>
              <div className="border-t border-[#e5e7eb] my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                D&eacute;connexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
