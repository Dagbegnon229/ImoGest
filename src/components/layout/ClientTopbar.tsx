"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, Menu, LogOut, User } from "lucide-react";
import type { AuthUser } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const mockNotifications = [
  {
    id: 1,
    text: "Votre quittance de janvier est disponible",
    time: "il y a 1j",
    color: "bg-green-400",
  },
  {
    id: 2,
    text: "Votre incident INC-001 a été mis à jour",
    time: "il y a 3j",
    color: "bg-orange-400",
  },
];

interface ClientTopbarProps {
  onMenuClick: () => void;
  user: AuthUser | null;
}

export function ClientTopbar({ onMenuClick, user }: ClientTopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const router = useRouter();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
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
        <h2 className="text-lg font-semibold text-[#0f1b2d] hidden sm:block">
          Mon Espace
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-[#6b7280] hover:text-[#0f1b2d] transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#10b981] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              2
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg border border-[#e5e7eb] shadow-lg z-50">
              <div className="px-4 py-3 border-b border-[#e5e7eb]">
                <p className="text-sm font-semibold text-[#0f1b2d]">Notifications</p>
              </div>
              <div className="py-1">
                {mockNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-[#f8fafc] transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#0f1b2d]">{notif.text}</p>
                      <p className="text-xs text-[#6b7280] mt-0.5">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#e5e7eb]">
                <button
                  onClick={() => setNotifOpen(false)}
                  className="w-full px-4 py-2.5 text-sm text-[#10b981] hover:bg-[#f8fafc] transition-colors text-center font-medium"
                >
                  Voir toutes les notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-[#0f1b2d] leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : "Utilisateur"}
              </p>
              <p className="text-xs text-[#6b7280] leading-tight">Locataire</p>
            </div>
            <ChevronDown className="h-4 w-4 text-[#6b7280]" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-[#e5e7eb] shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/client/profile");
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
