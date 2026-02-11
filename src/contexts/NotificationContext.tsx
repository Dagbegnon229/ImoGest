"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotifCategory =
  | "message"
  | "incident"
  | "application"
  | "payment"
  | "document"
  | "system";

export interface AppNotification {
  id: string;
  category: NotifCategory;
  title: string;
  description: string;
  time: string; // ISO
  read: boolean;
  /** Where clicking should navigate */
  href?: string;
  /** Colour dot */
  color: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    incidents,
    applications,
    payments,
    tenants,
    getTenant,
    getAdmin,
  } = useData();

  // Set of notification IDs the user has already read (persisted per session)
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // -----------------------------------------------------------------------
  // Build notifications dynamically from real data
  // -----------------------------------------------------------------------

  const notifications = useMemo<AppNotification[]>(() => {
    if (!user) return [];

    const notifs: AppNotification[] = [];
    const isAdmin = user.role !== "tenant";

    if (isAdmin) {
      // ----- ADMIN notifications -----

      // 1. Unread messages from clients
      conversations.forEach((conv) => {
        if (conv.unreadAdmin > 0) {
          const tenant = getTenant(conv.tenantId);
          const tenantName = tenant
            ? `${tenant.firstName} ${tenant.lastName}`
            : "Un locataire";
          // Get last message in this conv from client
          const convMsgs = messages
            .filter(
              (m) =>
                m.conversationId === conv.id && m.senderType === "client",
            )
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );
          const lastMsg = convMsgs[0];
          const preview = lastMsg
            ? lastMsg.content.length > 80
              ? lastMsg.content.slice(0, 80) + "…"
              : lastMsg.content
            : "";

          notifs.push({
            id: `msg-${conv.id}`,
            category: "message",
            title: `Nouveau message de ${tenantName}`,
            description: preview || `${conv.unreadAdmin} message(s) non lu(s)`,
            time: conv.lastMessageAt,
            read: readIds.has(`msg-${conv.id}`),
            href: "/admin/messages",
            color: "bg-blue-400",
          });
        }
      });

      // 2. New or in-progress incidents
      const activeIncidents = incidents.filter(
        (i) => i.status === "new" || i.status === "in_progress",
      );
      activeIncidents.forEach((inc) => {
        notifs.push({
          id: `inc-${inc.id}`,
          category: "incident",
          title: `Incident: ${inc.title}`,
          description: `Priorité ${inc.priority === "high" || inc.priority === "urgent" ? "haute" : inc.priority === "medium" ? "moyenne" : "basse"} — ${inc.status === "new" ? "Nouveau" : "En cours"}`,
          time: inc.createdAt,
          read: readIds.has(`inc-${inc.id}`),
          href: `/admin/incidents/${inc.id}`,
          color:
            inc.priority === "high" || inc.priority === "urgent"
              ? "bg-red-400"
              : inc.priority === "medium"
                ? "bg-orange-400"
                : "bg-yellow-400",
        });
      });

      // 3. Pending applications
      const pendingApps = applications.filter(
        (a) => a.status === "pending_review",
      );
      pendingApps.forEach((app) => {
        notifs.push({
          id: `app-${app.id}`,
          category: "application",
          title: `Candidature de ${app.firstName} ${app.lastName}`,
          description: `Demande: ${app.housingPreference}`,
          time: app.submittedAt,
          read: readIds.has(`app-${app.id}`),
          href: `/admin/applications/${app.id}`,
          color: "bg-purple-400",
        });
      });

      // 4. Late payments (pending + past due date)
      const now = new Date();
      payments
        .filter(
          (p) =>
            p.status === "pending" &&
            new Date(p.dueDate).getTime() < now.getTime(),
        )
        .forEach((pmt) => {
          const tenant = getTenant(pmt.tenantId);
          const tenantName = tenant
            ? `${tenant.firstName} ${tenant.lastName}`
            : "Locataire";
          notifs.push({
            id: `pmt-${pmt.id}`,
            category: "payment",
            title: `Paiement en retard — ${tenantName}`,
            description: `Montant: ${pmt.amount}$ — Échéance: ${new Date(pmt.dueDate).toLocaleDateString("fr-CA")}`,
            time: pmt.dueDate,
            read: readIds.has(`pmt-${pmt.id}`),
            href: "/admin/payments",
            color: "bg-red-400",
          });
        });
    } else {
      // ----- CLIENT notifications -----
      const tenantId = user.id;

      // 1. Unread messages from admin
      conversations
        .filter((c) => c.tenantId === tenantId)
        .forEach((conv) => {
          if (conv.unreadClient > 0) {
            const admin = getAdmin(conv.adminId);
            const adminName = admin
              ? `${admin.firstName} ${admin.lastName}`
              : "L\u2019administration";
            const convMsgs = messages
              .filter(
                (m) =>
                  m.conversationId === conv.id && m.senderType === "admin",
              )
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              );
            const lastMsg = convMsgs[0];
            const preview = lastMsg
              ? lastMsg.content.length > 80
                ? lastMsg.content.slice(0, 80) + "…"
                : lastMsg.content
              : "";

            notifs.push({
              id: `msg-${conv.id}`,
              category: "message",
              title: `Message de ${adminName}`,
              description:
                preview || `${conv.unreadClient} message(s) non lu(s)`,
              time: conv.lastMessageAt,
              read: readIds.has(`msg-${conv.id}`),
              href: "/client/messages",
              color: "bg-blue-400",
            });
          }
        });

      // 2. Incidents resolved
      incidents
        .filter((i) => i.reportedBy === tenantId && i.status === "resolved")
        .forEach((inc) => {
          notifs.push({
            id: `inc-${inc.id}`,
            category: "incident",
            title: `Incident résolu: ${inc.title}`,
            description: "Votre incident a été traité",
            time: inc.resolvedAt || inc.createdAt,
            read: readIds.has(`inc-${inc.id}`),
            href: `/client/incidents/${inc.id}`,
            color: "bg-green-400",
          });
        });

      // 3. Open incidents in progress
      incidents
        .filter((i) => i.reportedBy === tenantId && i.status === "in_progress")
        .forEach((inc) => {
          notifs.push({
            id: `inc-prog-${inc.id}`,
            category: "incident",
            title: `Incident en cours: ${inc.title}`,
            description: "Un technicien a été assigné",
            time: inc.createdAt,
            read: readIds.has(`inc-prog-${inc.id}`),
            href: `/client/incidents/${inc.id}`,
            color: "bg-orange-400",
          });
        });
    }

    // Sort by time descending (most recent first)
    notifs.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    );

    return notifs;
  }, [
    user,
    conversations,
    messages,
    incidents,
    applications,
    payments,
    tenants,
    readIds,
    getTenant,
    getAdmin,
  ]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      return next;
    });
  }, [notifications]);

  // -----------------------------------------------------------------------
  // Value
  // -----------------------------------------------------------------------

  const value = useMemo<NotificationContextType>(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
    }),
    [notifications, unreadCount, markAsRead, markAllAsRead],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNotifications(): NotificationContextType {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  return ctx;
}
