"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Building } from "@/types/building";
import type { Apartment } from "@/types/apartment";
import type { Tenant } from "@/types/tenant";
import type { Admin } from "@/types/admin";
import type { Lease } from "@/types/lease";
import type { Incident } from "@/types/incident";
import type { PendingApplication } from "@/types/application";
import type { Payment } from "@/types/payment";
import type { PointsTransaction, LoyaltyProfile } from "@/types/points";
import type { Message, Conversation } from "@/types/message";
import type { TenantDocument } from "@/types/document";
import { mockBuildings } from "@/data/mock-buildings";
import { mockApartments } from "@/data/mock-apartments";
import { mockTenants } from "@/data/mock-tenants";
import { mockAdmins } from "@/data/mock-admins";
import { mockLeases } from "@/data/mock-leases";
import { mockIncidents } from "@/data/mock-incidents";
import { mockApplications } from "@/data/mock-applications";
import { mockPayments } from "@/data/mock-payments";
import { mockPointsTransactions, mockLoyaltyProfiles } from "@/data/mock-points";
import { mockConversations, mockMessages } from "@/data/mock-messages";
import { mockDocuments } from "@/data/mock-documents";
import {
  generateBuildingId,
  generateApartmentId,
  generateTenantId,
  generateAdminId,
  generateLeaseId,
  generateIncidentId,
  generateApplicationId,
  generatePaymentId,
  generatePointsTransactionId,
  generateConversationId,
  generateMessageId,
  generateDocumentId,
} from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DataContextType {
  // Buildings
  buildings: Building[];
  getBuilding: (id: string) => Building | undefined;
  addBuilding: (data: Omit<Building, "id" | "createdAt">) => Building;
  updateBuilding: (id: string, data: Partial<Building>) => void;
  deleteBuilding: (id: string) => void;

  // Apartments
  apartments: Apartment[];
  getApartment: (id: string) => Apartment | undefined;
  getApartmentsByBuilding: (buildingId: string) => Apartment[];
  getAvailableApartments: (buildingId?: string) => Apartment[];
  addApartment: (data: Omit<Apartment, "id">) => Apartment;
  updateApartment: (id: string, data: Partial<Apartment>) => void;

  // Tenants
  tenants: Tenant[];
  getTenant: (id: string) => Tenant | undefined;
  addTenant: (data: Omit<Tenant, "id" | "createdAt">) => Tenant;
  updateTenant: (id: string, data: Partial<Tenant>) => void;

  // Admins
  admins: Admin[];
  getAdmin: (id: string) => Admin | undefined;
  addAdmin: (data: Omit<Admin, "id" | "createdAt">) => Admin;

  // Leases
  leases: Lease[];
  getLease: (id: string) => Lease | undefined;
  getLeaseByTenant: (tenantId: string) => Lease | undefined;
  addLease: (data: Omit<Lease, "id" | "createdAt">) => Lease;
  updateLease: (id: string, data: Partial<Lease>) => void;

  // Incidents
  incidents: Incident[];
  getIncident: (id: string) => Incident | undefined;
  getIncidentsByTenant: (tenantId: string) => Incident[];
  getIncidentsByBuilding: (buildingId: string) => Incident[];
  addIncident: (data: Omit<Incident, "id" | "createdAt">) => Incident;
  updateIncident: (id: string, data: Partial<Incident>) => void;

  // Applications
  applications: PendingApplication[];
  getApplication: (id: string) => PendingApplication | undefined;
  addApplication: (
    data: Omit<
      PendingApplication,
      "id" | "submittedAt" | "status" | "reviewedBy" | "reviewNote" | "reviewedAt"
    >,
  ) => PendingApplication;
  approveApplication: (
    appId: string,
    adminId: string,
    buildingId: string,
    apartmentId: string,
    leaseTerms: {
      startDate: string;
      endDate: string;
      monthlyRent: number;
      depositAmount: number;
    },
  ) => Tenant;
  rejectApplication: (appId: string, adminId: string, note: string) => void;

  // Payments
  payments: Payment[];
  getPayment: (id: string) => Payment | undefined;
  getPaymentsByTenant: (tenantId: string) => Payment[];
  addPayment: (data: Omit<Payment, "id" | "createdAt">) => Payment;
  updatePayment: (id: string, data: Partial<Payment>) => void;

  // Points
  pointsTransactions: PointsTransaction[];
  loyaltyProfiles: LoyaltyProfile[];
  getPointsByTenant: (tenantId: string) => PointsTransaction[];
  getLoyaltyProfile: (tenantId: string) => LoyaltyProfile | undefined;
  addPointsTransaction: (data: Omit<PointsTransaction, "id" | "createdAt">) => PointsTransaction;
  updateLoyaltyProfile: (tenantId: string, data: Partial<LoyaltyProfile>) => void;

  // Conversations & Messages
  conversations: Conversation[];
  messages: Message[];
  getConversation: (id: string) => Conversation | undefined;
  getConversationsByTenant: (tenantId: string) => Conversation[];
  getConversationsByAdmin: (adminId: string) => Conversation[];
  getMessagesByConversation: (conversationId: string) => Message[];
  addConversation: (data: Omit<Conversation, "id" | "createdAt" | "lastMessageAt" | "unreadAdmin" | "unreadClient">) => Conversation;
  addMessage: (data: Omit<Message, "id" | "createdAt" | "readAt">) => Message;
  markMessagesRead: (conversationId: string, readerType: "admin" | "client") => void;

  // Documents
  documents: TenantDocument[];
  getDocumentsByTenant: (tenantId: string) => TenantDocument[];
  addDocument: (data: Omit<TenantDocument, "id" | "createdAt">) => TenantDocument;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY = "immogest_data";

interface PersistedData {
  buildings: Building[];
  apartments: Apartment[];
  tenants: Tenant[];
  admins: Admin[];
  leases: Lease[];
  incidents: Incident[];
  applications: PendingApplication[];
  payments: Payment[];
  pointsTransactions: PointsTransaction[];
  loyaltyProfiles: LoyaltyProfile[];
  conversations: Conversation[];
  messages: Message[];
  documents: TenantDocument[];
}

function loadData(): PersistedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as PersistedData;
    }
  } catch {
    // Corrupt data -- fall through to defaults
  }

  // First load: seed from mock data
  return {
    buildings: mockBuildings,
    apartments: mockApartments,
    tenants: mockTenants,
    admins: mockAdmins,
    leases: mockLeases,
    incidents: mockIncidents,
    applications: mockApplications,
    payments: mockPayments,
    pointsTransactions: mockPointsTransactions,
    loyaltyProfiles: mockLoyaltyProfiles,
    conversations: mockConversations,
    messages: mockMessages,
    documents: mockDocuments,
  };
}

function saveData(data: PersistedData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable -- silently fail
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // -----------------------------------------------------------------------
  // State
  // -----------------------------------------------------------------------
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [applications, setApplications] = useState<PendingApplication[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pointsTransactions, setPointsTransactions] = useState<PointsTransaction[]>([]);
  const [loyaltyProfiles, setLoyaltyProfiles] = useState<LoyaltyProfile[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<TenantDocument[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // -----------------------------------------------------------------------
  // Load persisted data on mount
  // -----------------------------------------------------------------------
  useEffect(() => {
    const data = loadData();
    setBuildings(data.buildings);
    setApartments(data.apartments);
    setTenants(data.tenants);
    setAdmins(data.admins);
    setLeases(data.leases);
    setIncidents(data.incidents);
    setApplications(data.applications);
    setPayments(data.payments);
    setPointsTransactions(data.pointsTransactions);
    setLoyaltyProfiles(data.loyaltyProfiles);
    setConversations(data.conversations);
    setMessages(data.messages);
    setDocuments(data.documents);
    setIsHydrated(true);
  }, []);

  // -----------------------------------------------------------------------
  // Persist whenever any collection changes (skip the initial empty render)
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!isHydrated) return;
    saveData({ buildings, apartments, tenants, admins, leases, incidents, applications, payments, pointsTransactions, loyaltyProfiles, conversations, messages, documents });
  }, [buildings, apartments, tenants, admins, leases, incidents, applications, payments, pointsTransactions, loyaltyProfiles, conversations, messages, documents, isHydrated]);

  // -----------------------------------------------------------------------
  // Timestamp helper
  // -----------------------------------------------------------------------
  const now = () => new Date().toISOString();

  // =======================================================================
  // BUILDINGS
  // =======================================================================

  const getBuilding = useCallback(
    (id: string) => buildings.find((b) => b.id === id),
    [buildings],
  );

  const addBuilding = useCallback(
    (data: Omit<Building, "id" | "createdAt">): Building => {
      const newBuilding: Building = {
        ...data,
        id: generateBuildingId(buildings),
        createdAt: now(),
      };
      setBuildings((prev) => [...prev, newBuilding]);
      return newBuilding;
    },
    [buildings],
  );

  const updateBuilding = useCallback((id: string, data: Partial<Building>) => {
    setBuildings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...data, id: b.id } : b)),
    );
  }, []);

  const deleteBuilding = useCallback((id: string) => {
    setBuildings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // =======================================================================
  // APARTMENTS
  // =======================================================================

  const getApartment = useCallback(
    (id: string) => apartments.find((a) => a.id === id),
    [apartments],
  );

  const getApartmentsByBuilding = useCallback(
    (buildingId: string) => apartments.filter((a) => a.buildingId === buildingId),
    [apartments],
  );

  const getAvailableApartments = useCallback(
    (buildingId?: string) => {
      return apartments.filter((a) => {
        const isAvailable = a.status === "available";
        if (buildingId) return isAvailable && a.buildingId === buildingId;
        return isAvailable;
      });
    },
    [apartments],
  );

  const addApartment = useCallback(
    (data: Omit<Apartment, "id">): Apartment => {
      const newApt: Apartment = {
        ...data,
        id: generateApartmentId(apartments),
      };
      setApartments((prev) => [...prev, newApt]);
      return newApt;
    },
    [apartments],
  );

  const updateApartment = useCallback((id: string, data: Partial<Apartment>) => {
    setApartments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data, id: a.id } : a)),
    );
  }, []);

  // =======================================================================
  // TENANTS
  // =======================================================================

  const getTenant = useCallback(
    (id: string) => tenants.find((t) => t.id === id),
    [tenants],
  );

  const addTenant = useCallback(
    (data: Omit<Tenant, "id" | "createdAt">): Tenant => {
      const newTenant: Tenant = {
        ...data,
        id: generateTenantId(tenants),
        createdAt: now(),
      };
      setTenants((prev) => [...prev, newTenant]);
      return newTenant;
    },
    [tenants],
  );

  const updateTenant = useCallback((id: string, data: Partial<Tenant>) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data, id: t.id } : t)),
    );
  }, []);

  // =======================================================================
  // ADMINS
  // =======================================================================

  const getAdmin = useCallback(
    (id: string) => admins.find((a) => a.id === id),
    [admins],
  );

  const addAdmin = useCallback(
    (data: Omit<Admin, "id" | "createdAt">): Admin => {
      const newAdmin: Admin = {
        ...data,
        id: generateAdminId(admins),
        createdAt: now(),
      };
      setAdmins((prev) => [...prev, newAdmin]);
      return newAdmin;
    },
    [admins],
  );

  // =======================================================================
  // LEASES
  // =======================================================================

  const getLease = useCallback(
    (id: string) => leases.find((l) => l.id === id),
    [leases],
  );

  const getLeaseByTenant = useCallback(
    (tenantId: string) =>
      leases.find((l) => l.tenantId === tenantId && l.status === "active"),
    [leases],
  );

  const addLease = useCallback(
    (data: Omit<Lease, "id" | "createdAt">): Lease => {
      const newLease: Lease = {
        ...data,
        id: generateLeaseId(leases),
        createdAt: now(),
      };
      setLeases((prev) => [...prev, newLease]);
      return newLease;
    },
    [leases],
  );

  const updateLease = useCallback((id: string, data: Partial<Lease>) => {
    setLeases((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...data, id: l.id } : l)),
    );
  }, []);

  // =======================================================================
  // INCIDENTS
  // =======================================================================

  const getIncident = useCallback(
    (id: string) => incidents.find((i) => i.id === id),
    [incidents],
  );

  const getIncidentsByTenant = useCallback(
    (tenantId: string) => incidents.filter((i) => i.reportedBy === tenantId),
    [incidents],
  );

  const getIncidentsByBuilding = useCallback(
    (buildingId: string) => incidents.filter((i) => i.buildingId === buildingId),
    [incidents],
  );

  const addIncident = useCallback(
    (data: Omit<Incident, "id" | "createdAt">): Incident => {
      const newIncident: Incident = {
        ...data,
        id: generateIncidentId(incidents),
        createdAt: now(),
      };
      setIncidents((prev) => [...prev, newIncident]);
      return newIncident;
    },
    [incidents],
  );

  const updateIncident = useCallback((id: string, data: Partial<Incident>) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...data, id: i.id } : i)),
    );
  }, []);

  // =======================================================================
  // APPLICATIONS
  // =======================================================================

  const getApplication = useCallback(
    (id: string) => applications.find((a) => a.id === id),
    [applications],
  );

  const addApplication = useCallback(
    (
      data: Omit<
        PendingApplication,
        "id" | "submittedAt" | "status" | "reviewedBy" | "reviewNote" | "reviewedAt"
      >,
    ): PendingApplication => {
      const newApp: PendingApplication = {
        ...data,
        id: generateApplicationId(applications),
        status: "pending_review",
        reviewedBy: null,
        reviewNote: null,
        submittedAt: now(),
        reviewedAt: null,
      };
      setApplications((prev) => [...prev, newApp]);
      return newApp;
    },
    [applications],
  );

  /**
   * Approve an application:
   *  1. Update application status to "approved"
   *  2. Create a new Tenant from the application data
   *  3. Create a new Lease linking tenant, apartment, building
   *  4. Update the apartment status to "occupied" and assign tenant
   *  5. Update the building's occupiedUnits count
   */
  const approveApplication = useCallback(
    (
      appId: string,
      adminId: string,
      buildingId: string,
      apartmentId: string,
      leaseTerms: {
        startDate: string;
        endDate: string;
        monthlyRent: number;
        depositAmount: number;
      },
    ): Tenant => {
      const app = applications.find((a) => a.id === appId);
      if (!app) throw new Error(`Application ${appId} not found`);

      // 1. Create tenant
      const tenantId = generateTenantId(tenants);
      const leaseId = generateLeaseId(leases);
      const timestamp = now();

      const newTenant: Tenant = {
        id: tenantId,
        firstName: app.firstName,
        lastName: app.lastName,
        email: app.email,
        phone: app.phone,
        password: app.password,
        status: "active",
        buildingId,
        apartmentId,
        leaseId,
        mustChangePassword: true,
        createdAt: timestamp,
        createdBy: adminId,
      };

      // 2. Create lease
      const newLease: Lease = {
        id: leaseId,
        tenantId,
        apartmentId,
        buildingId,
        startDate: leaseTerms.startDate,
        endDate: leaseTerms.endDate,
        monthlyRent: leaseTerms.monthlyRent,
        depositAmount: leaseTerms.depositAmount,
        status: "active",
        createdAt: timestamp,
        createdBy: adminId,
      };

      // 3. Batch state updates
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: "approved" as const,
                reviewedBy: adminId,
                reviewedAt: timestamp,
              }
            : a,
        ),
      );

      setTenants((prev) => [...prev, newTenant]);
      setLeases((prev) => [...prev, newLease]);

      setApartments((prev) =>
        prev.map((a) =>
          a.id === apartmentId
            ? { ...a, status: "occupied" as const, tenantId }
            : a,
        ),
      );

      setBuildings((prev) =>
        prev.map((b) =>
          b.id === buildingId
            ? { ...b, occupiedUnits: b.occupiedUnits + 1 }
            : b,
        ),
      );

      return newTenant;
    },
    [applications, tenants, leases],
  );

  /**
   * Reject an application: mark status as "rejected" with a note.
   */
  const rejectApplication = useCallback(
    (appId: string, adminId: string, note: string) => {
      const timestamp = now();
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: "rejected" as const,
                reviewedBy: adminId,
                reviewNote: note,
                reviewedAt: timestamp,
              }
            : a,
        ),
      );
    },
    [],
  );

  // =======================================================================
  // PAYMENTS
  // =======================================================================

  const getPayment = useCallback(
    (id: string) => payments.find((p) => p.id === id),
    [payments],
  );

  const getPaymentsByTenant = useCallback(
    (tenantId: string) => payments.filter((p) => p.tenantId === tenantId),
    [payments],
  );

  const addPayment = useCallback(
    (data: Omit<Payment, "id" | "createdAt">): Payment => {
      const newPayment: Payment = {
        ...data,
        id: generatePaymentId(payments),
        createdAt: now(),
      };
      setPayments((prev) => [...prev, newPayment]);
      return newPayment;
    },
    [payments],
  );

  const updatePayment = useCallback((id: string, data: Partial<Payment>) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data, id: p.id } : p)),
    );
  }, []);

  // =======================================================================
  // POINTS
  // =======================================================================

  const getPointsByTenant = useCallback(
    (tenantId: string) => pointsTransactions.filter((p) => p.tenantId === tenantId),
    [pointsTransactions],
  );

  const getLoyaltyProfile = useCallback(
    (tenantId: string) => loyaltyProfiles.find((p) => p.tenantId === tenantId),
    [loyaltyProfiles],
  );

  const addPointsTransaction = useCallback(
    (data: Omit<PointsTransaction, "id" | "createdAt">): PointsTransaction => {
      const newTx: PointsTransaction = {
        ...data,
        id: generatePointsTransactionId(pointsTransactions),
        createdAt: now(),
      };
      setPointsTransactions((prev) => [...prev, newTx]);
      // Update loyalty profile total
      setLoyaltyProfiles((prev) =>
        prev.map((p) =>
          p.tenantId === data.tenantId
            ? { ...p, totalPoints: p.totalPoints + data.points }
            : p,
        ),
      );
      return newTx;
    },
    [pointsTransactions],
  );

  const updateLoyaltyProfile = useCallback(
    (tenantId: string, data: Partial<LoyaltyProfile>) => {
      setLoyaltyProfiles((prev) => {
        const exists = prev.find((p) => p.tenantId === tenantId);
        if (exists) {
          return prev.map((p) =>
            p.tenantId === tenantId ? { ...p, ...data } : p,
          );
        }
        // Create new profile if it doesn't exist
        return [
          ...prev,
          {
            tenantId,
            totalPoints: 0,
            currentTier: "bronze" as const,
            punctualityScore: 0,
            consecutiveOnTime: 0,
            totalPayments: 0,
            onTimePayments: 0,
            ...data,
          },
        ];
      });
    },
    [],
  );

  // =======================================================================
  // CONVERSATIONS & MESSAGES
  // =======================================================================

  const getConversation = useCallback(
    (id: string) => conversations.find((c) => c.id === id),
    [conversations],
  );

  const getConversationsByTenant = useCallback(
    (tenantId: string) => conversations.filter((c) => c.tenantId === tenantId),
    [conversations],
  );

  const getConversationsByAdmin = useCallback(
    (adminId: string) => conversations.filter((c) => c.adminId === adminId),
    [conversations],
  );

  const getMessagesByConversation = useCallback(
    (conversationId: string) =>
      messages
        .filter((m) => m.conversationId === conversationId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages],
  );

  const addConversation = useCallback(
    (
      data: Omit<Conversation, "id" | "createdAt" | "lastMessageAt" | "unreadAdmin" | "unreadClient">,
    ): Conversation => {
      const timestamp = now();
      const newConv: Conversation = {
        ...data,
        id: generateConversationId(conversations),
        lastMessageAt: timestamp,
        unreadAdmin: 0,
        unreadClient: 0,
        createdAt: timestamp,
      };
      setConversations((prev) => [...prev, newConv]);
      return newConv;
    },
    [conversations],
  );

  const addMessage = useCallback(
    (data: Omit<Message, "id" | "createdAt" | "readAt">): Message => {
      const timestamp = now();
      const newMsg: Message = {
        ...data,
        id: generateMessageId(messages),
        readAt: null,
        createdAt: timestamp,
      };
      setMessages((prev) => [...prev, newMsg]);
      // Update conversation lastMessageAt and unread count
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== data.conversationId) return c;
          return {
            ...c,
            lastMessageAt: timestamp,
            unreadAdmin: data.senderType === "client" ? c.unreadAdmin + 1 : c.unreadAdmin,
            unreadClient: data.senderType === "admin" ? c.unreadClient + 1 : c.unreadClient,
          };
        }),
      );
      return newMsg;
    },
    [messages],
  );

  const markMessagesRead = useCallback(
    (conversationId: string, readerType: "admin" | "client") => {
      const timestamp = now();
      // Mark individual messages as read
      setMessages((prev) =>
        prev.map((m) => {
          if (m.conversationId !== conversationId) return m;
          if (m.readAt) return m;
          // Only mark messages from the OTHER type as read
          if (readerType === "admin" && m.senderType === "client") {
            return { ...m, readAt: timestamp };
          }
          if (readerType === "client" && m.senderType === "admin") {
            return { ...m, readAt: timestamp };
          }
          return m;
        }),
      );
      // Reset unread counter on conversation
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          if (readerType === "admin") return { ...c, unreadAdmin: 0 };
          return { ...c, unreadClient: 0 };
        }),
      );
    },
    [],
  );

  // =======================================================================
  // DOCUMENTS
  // =======================================================================

  const getDocumentsByTenant = useCallback(
    (tenantId: string) => documents.filter((d) => d.tenantId === tenantId),
    [documents],
  );

  const addDocument = useCallback(
    (data: Omit<TenantDocument, "id" | "createdAt">): TenantDocument => {
      const newDoc: TenantDocument = {
        ...data,
        id: generateDocumentId(documents),
        createdAt: now(),
      };
      setDocuments((prev) => [...prev, newDoc]);
      return newDoc;
    },
    [documents],
  );

  // -----------------------------------------------------------------------
  // Context value
  // -----------------------------------------------------------------------
  const value: DataContextType = {
    // Buildings
    buildings,
    getBuilding,
    addBuilding,
    updateBuilding,
    deleteBuilding,

    // Apartments
    apartments,
    getApartment,
    getApartmentsByBuilding,
    getAvailableApartments,
    addApartment,
    updateApartment,

    // Tenants
    tenants,
    getTenant,
    addTenant,
    updateTenant,

    // Admins
    admins,
    getAdmin,
    addAdmin,

    // Leases
    leases,
    getLease,
    getLeaseByTenant,
    addLease,
    updateLease,

    // Incidents
    incidents,
    getIncident,
    getIncidentsByTenant,
    getIncidentsByBuilding,
    addIncident,
    updateIncident,

    // Applications
    applications,
    getApplication,
    addApplication,
    approveApplication,
    rejectApplication,

    // Payments
    payments,
    getPayment,
    getPaymentsByTenant,
    addPayment,
    updatePayment,

    // Points
    pointsTransactions,
    loyaltyProfiles,
    getPointsByTenant,
    getLoyaltyProfile,
    addPointsTransaction,
    updateLoyaltyProfile,

    // Conversations & Messages
    conversations,
    messages,
    getConversation,
    getConversationsByTenant,
    getConversationsByAdmin,
    getMessagesByConversation,
    addConversation,
    addMessage,
    markMessagesRead,

    // Documents
    documents,
    getDocumentsByTenant,
    addDocument,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

/**
 * Hook to consume the DataContext. Throws if used outside of DataProvider.
 */
export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
