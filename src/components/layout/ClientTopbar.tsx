"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  User,
  MessageSquare,
  AlertTriangle,
  FileText,
  CheckCheck,
  ArrowRight,
} from "lucide-react";
import type { AuthUser } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import type { AppNotification } from "@/contexts/NotificationContext";

// ---------------------------------------------------------------------------
// Category icon helper
// ---------------------------------------------------------------------------

function NotifIcon({ category }: { category: string }) {
  switch (category) {
    case "message":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "incident":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case "document":
      return <FileText className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
}

// ---------------------------------------------------------------------------
// Time ago helper
// ---------------------------------------------------------------------------

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "\u00e0 l\u2019instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  return `il y a ${Math.floor(days / 7)}sem`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ClientTopbarProps {
  onMenuClick: () => void;
  user: AuthUser | null;
}

export function ClientTopbar({ onMenuClick, user }: ClientTopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<AppNotification | null>(
    null,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
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
        setSelectedNotif(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleNotifClick = useCallback(
    (notif: AppNotification) => {
      if (selectedNotif?.id === notif.id) {
        // Already expanded — navigate
        markAsRead(notif.id);
        if (notif.href) {
          router.push(notif.href);
          setNotifOpen(false);
          setSelectedNotif(null);
        }
      } else {
        // Expand to read full content
        setSelectedNotif(notif);
        markAsRead(notif.id);
      }
    },
    [selectedNotif, markAsRead, router],
  );

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
            onClick={() => {
              setNotifOpen(!notifOpen);
              setSelectedNotif(null);
            }}
            className="relative text-[#6b7280] hover:text-[#0f1b2d] transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-[#10b981] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl border border-[#e5e7eb] shadow-xl z-50 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
                <p className="text-sm font-semibold text-[#0f1b2d]">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs font-normal text-[#6b7280]">
                      ({unreadCount} non lue{unreadCount > 1 ? "s" : ""})
                    </span>
                  )}
                </p>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#10b981] hover:text-[#059669] font-medium flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Tout lire
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="h-8 w-8 text-[#d1d5db] mx-auto mb-2" />
                    <p className="text-sm text-[#6b7280]">
                      Aucune notification
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isExpanded = selectedNotif?.id === notif.id;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={`px-4 py-3 cursor-pointer transition-colors border-b border-[#f3f4f6] last:border-b-0 ${
                          !notif.read
                            ? "bg-emerald-50/50 hover:bg-emerald-50"
                            : "hover:bg-[#f8fafc]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div
                            className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${
                              !notif.read ? "bg-white shadow-sm" : "bg-[#f3f4f6]"
                            }`}
                          >
                            <NotifIcon category={notif.category} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className={`text-sm leading-tight ${
                                  !notif.read
                                    ? "font-semibold text-[#0f1b2d]"
                                    : "font-medium text-[#374151]"
                                }`}
                              >
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-[#10b981] flex-shrink-0" />
                              )}
                            </div>

                            {/* Preview or full description */}
                            <p
                              className={`text-xs mt-0.5 leading-relaxed ${
                                isExpanded
                                  ? "text-[#374151]"
                                  : "text-[#6b7280] line-clamp-1"
                              }`}
                            >
                              {notif.description}
                            </p>

                            {/* Expanded: show action button */}
                            {isExpanded && notif.href && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(notif.href!);
                                  setNotifOpen(false);
                                  setSelectedNotif(null);
                                }}
                                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#10b981] hover:text-[#059669] transition-colors"
                              >
                                Voir les détails
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}

                            <p className="text-[10px] text-[#9ca3af] mt-1">
                              {timeAgo(notif.time)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-[#e5e7eb]">
                  <button
                    onClick={() => {
                      markAllAsRead();
                      setNotifOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-sm text-[#10b981] hover:bg-[#f8fafc] transition-colors text-center font-medium"
                  >
                    Tout marquer comme lu
                  </button>
                </div>
              )}
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
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
