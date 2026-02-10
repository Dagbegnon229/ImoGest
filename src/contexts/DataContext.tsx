'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import type { Building } from '@/types/building';
import type { Apartment } from '@/types/apartment';
import type { Tenant } from '@/types/tenant';
import type { Admin } from '@/types/admin';
import type { Lease } from '@/types/lease';
import type { Incident } from '@/types/incident';
import type { PendingApplication } from '@/types/application';
import type { Payment } from '@/types/payment';
import type { PointsTransaction, LoyaltyProfile } from '@/types/points';
import type { Message, Conversation } from '@/types/message';
import type { TenantDocument } from '@/types/document';
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
} from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DataContextType {
  // State
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
  loading: boolean;

  // Buildings
  getBuilding: (id: string) => Building | undefined;
  addBuilding: (data: Omit<Building, 'id' | 'createdAt'>) => Promise<Building>;
  updateBuilding: (id: string, data: Partial<Building>) => Promise<void>;
  deleteBuilding: (id: string) => Promise<void>;

  // Apartments
  getApartment: (id: string) => Apartment | undefined;
  getApartmentsByBuilding: (buildingId: string) => Apartment[];
  getAvailableApartments: (buildingId?: string) => Apartment[];
  addApartment: (data: Omit<Apartment, 'id'>) => Promise<Apartment>;
  updateApartment: (id: string, data: Partial<Apartment>) => Promise<void>;

  // Tenants
  getTenant: (id: string) => Tenant | undefined;
  addTenant: (data: Omit<Tenant, 'id' | 'createdAt'>) => Promise<Tenant>;
  updateTenant: (id: string, data: Partial<Tenant>) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;

  // Admins
  getAdmin: (id: string) => Admin | undefined;
  addAdmin: (data: Omit<Admin, 'id' | 'createdAt'>) => Promise<Admin>;
  updateAdmin: (id: string, data: Partial<Admin>) => Promise<void>;

  // Leases
  getLease: (id: string) => Lease | undefined;
  getLeaseByTenant: (tenantId: string) => Lease | undefined;
  addLease: (data: Omit<Lease, 'id' | 'createdAt'>) => Promise<Lease>;
  updateLease: (id: string, data: Partial<Lease>) => Promise<void>;

  // Incidents
  getIncident: (id: string) => Incident | undefined;
  getIncidentsByTenant: (tenantId: string) => Incident[];
  getIncidentsByBuilding: (buildingId: string) => Incident[];
  addIncident: (data: Omit<Incident, 'id' | 'createdAt'>) => Promise<Incident>;
  updateIncident: (id: string, data: Partial<Incident>) => Promise<void>;

  // Applications
  getApplication: (id: string) => PendingApplication | undefined;
  addApplication: (
    data: Omit<
      PendingApplication,
      'id' | 'submittedAt' | 'status' | 'reviewedBy' | 'reviewNote' | 'reviewedAt'
    >,
  ) => Promise<PendingApplication>;
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
  ) => Promise<Tenant>;
  rejectApplication: (appId: string, adminId: string, note: string) => Promise<void>;

  // Payments
  getPayment: (id: string) => Payment | undefined;
  getPaymentsByTenant: (tenantId: string) => Payment[];
  addPayment: (data: Omit<Payment, 'id' | 'createdAt'>) => Promise<Payment>;
  updatePayment: (id: string, data: Partial<Payment>) => Promise<void>;

  // Points
  getPointsByTenant: (tenantId: string) => PointsTransaction[];
  getLoyaltyProfile: (tenantId: string) => LoyaltyProfile | undefined;
  addPointsTransaction: (data: Omit<PointsTransaction, 'id' | 'createdAt'>) => Promise<PointsTransaction>;
  updateLoyaltyProfile: (tenantId: string, data: Partial<LoyaltyProfile>) => Promise<void>;

  // Conversations & Messages
  getConversation: (id: string) => Conversation | undefined;
  getConversationsByTenant: (tenantId: string) => Conversation[];
  getConversationsByAdmin: (adminId: string) => Conversation[];
  getMessagesByConversation: (conversationId: string) => Message[];
  addConversation: (
    data: Omit<Conversation, 'id' | 'createdAt' | 'lastMessageAt' | 'unreadAdmin' | 'unreadClient'>,
  ) => Promise<Conversation>;
  addMessage: (data: Omit<Message, 'id' | 'createdAt' | 'readAt'>) => Promise<Message>;
  markMessagesRead: (conversationId: string, readerType: 'admin' | 'client') => Promise<void>;

  // Documents
  getDocumentsByTenant: (tenantId: string) => TenantDocument[];
  addDocument: (data: Omit<TenantDocument, 'id' | 'createdAt'>) => Promise<TenantDocument>;

  // Refresh
  refreshData: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Supabase fetch helpers (inline snake_case -> camelCase mapping)
// ---------------------------------------------------------------------------

async function fetchAdmins(): Promise<Admin[]> {
  const { data, error } = await supabase.from('admins').select('*');
  if (error) { console.error('Error fetching admins:', error); return []; }
  return (data || []).map((row: any) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    password: row.password,
    isActive: row.is_active,
    createdAt: row.created_at,
    createdBy: row.created_by,
  } as Admin));
}

async function fetchBuildings(): Promise<Building[]> {
  const { data, error } = await supabase.from('buildings').select('*');
  if (error) { console.error('Error fetching buildings:', error); return []; }
  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    province: row.province,
    postalCode: row.postal_code,
    totalUnits: row.total_units,
    occupiedUnits: row.occupied_units,
    floors: row.floors,
    yearBuilt: row.year_built,
    managerId: row.manager_id,
    createdAt: row.created_at,
  } as Building));
}

async function fetchApartments(): Promise<Apartment[]> {
  const { data, error } = await supabase.from('apartments').select('*');
  if (error) { console.error('Error fetching apartments:', error); return []; }
  return (data || []).map((row: any) => ({
    id: row.id,
    buildingId: row.building_id,
    unitNumber: row.unit_number,
    floor: row.floor,
    rooms: row.rooms,
    area: row.area,
    rent: row.rent,
    status: row.status,
    tenantId: row.tenant_id,
  } as Apartment));
}

async function fetchTenants(): Promise<Tenant[]> {
  const { data, error } = await supabase.from('tenants').select('*');
  if (error) { console.error('Error fetching tenants:', error); return []; }
  return (data || []).map((row: any) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    password: row.password,
    status: row.status,
    buildingId: row.building_id,
    apartmentId: row.apartment_id,
    leaseId: row.lease_id,
    mustChangePassword: row.must_change_password,
    createdAt: row.created_at,
    createdBy: row.created_by,
    statusChangedAt: row.status_changed_at,
  } as Tenant));
}

async function fetchLeases(): Promise<Lease[]> {
  const { data, error } = await supabase.from('leases').select('*');
  if (error) { console.error('Error fetching leases:', error); return []; }
  return (data || []).map((row: any) => ({
    id: row.id,
    tenantId: row.tenant_id,
    apartmentId: row.apartment_id,
    buildingId: row.building_id,
    startDate: row.start_date,
    endDate: row.end_date,
    monthlyRent: row.monthly_rent,
    depositAmount: row.deposit_amount,
    status: row.status,
    createdAt: row.created_at,
    createdBy: row.created_by,
  } as Lease));
}

async function fetchIncidents(): Promise<Incident[]> {
  const { data, error } = await supabase.from('incidents').select('*');
  if (error) { console.error('Error fetching incidents:', error); return []; }
  return (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    buildingId: row.building_id,
    apartmentId: row.apartment_id,
    reportedBy: row.reported_by,
    assignedTo: row.assigned_to,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  } as Incident));
}

async function fetchApplications(): Promise<PendingApplication[]> {
  const { data, error } = await supabase.from('pending_applications').select('*');
  if (error) { console.error('Error fetching applications:', error); return []; }
  return (data || []).map((row: any) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    password: row.password,
    housingPreference: row.housing_preference,
    documents: row.documents,
    status: row.status,
    reviewedBy: row.reviewed_by,
    reviewNote: row.review_note,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
  } as PendingApplication));
}

async function fetchPayments(): Promise<Payment[]> {
  const { data, error } = await supabase.from('payments').select('*');
  if (error) { console.error('Error fetching payments:', error); return []; }
  return (data || []).map((row: any) => ({
    id: row.id,
    tenantId: row.tenant_id,
    leaseId: row.lease_id,
    amount: row.amount,
    monthlyRent: row.monthly_rent,
    month: row.month,
    dueDate: row.due_date,
    paidAt: row.paid_at,
    status: row.status,
    method: row.method,
    reference: row.reference,
    lateFee: row.late_fee,
    createdAt: row.created_at,
  } as Payment));
}

async function fetchPointsTransactions(): Promise<PointsTransaction[]> {
  const { data, error } = await supabase.from('points_transactions').select('*');
  if (error) { console.error('Error fetching points_transactions:', error); return []; }
  return (data || []).map((row: any) => ({
    id: row.id,
    tenantId: row.tenant_id,
    type: row.type,
    points: row.points,
    description: row.description,
    relatedPaymentId: row.related_payment_id,
    createdAt: row.created_at,
  } as PointsTransaction));
}

async function fetchLoyaltyProfiles(): Promise<LoyaltyProfile[]> {
  const { data, error } = await supabase.from('loyalty_profiles').select('*');
  if (error) { console.error('Error fetching loyalty_profiles:', error); return []; }
  return (data || []).map((row: any) => ({
    tenantId: row.tenant_id,
    totalPoints: row.total_points,
    currentTier: row.current_tier,
    punctualityScore: row.punctuality_score,
    consecutiveOnTime: row.consecutive_on_time,
    totalPayments: row.total_payments,
    onTimePayments: row.on_time_payments,
  } as LoyaltyProfile));
}

async function fetchConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase.from('conversations').select('*');
  if (error) { console.error('Error fetching conversations:', error); return []; }
  return (data || []).map((row: any) => ({
    id: row.id,
    tenantId: row.tenant_id,
    adminId: row.admin_id,
    subject: row.subject,
    lastMessageAt: row.last_message_at,
    unreadAdmin: row.unread_admin,
    unreadClient: row.unread_client,
    createdAt: row.created_at,
  } as Conversation));
}

async function fetchMessages(): Promise<Message[]> {
  const { data, error } = await supabase.from('messages').select('*');
  if (error) { console.error('Error fetching messages:', error); return []; }
  return (data || []).map((row: any) => ({
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    senderType: row.sender_type,
    content: row.content,
    readAt: row.read_at,
    createdAt: row.created_at,
  } as Message));
}

async function fetchDocuments(): Promise<TenantDocument[]> {
  const { data, error } = await supabase.from('documents').select('*');
  if (error) { console.error('Error fetching documents:', error); return []; }
  return (data || []).map((row: any) => ({
    id: row.id,
    tenantId: row.tenant_id,
    type: row.type,
    title: row.title,
    description: row.description,
    fileUrl: row.file_url,
    fileSize: row.file_size,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
  } as TenantDocument));
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
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
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------------------------
  // Timestamp helper
  // -------------------------------------------------------------------------
  const now = () => new Date().toISOString();

  // -------------------------------------------------------------------------
  // Load all data from Supabase on mount
  // -------------------------------------------------------------------------
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        bldgs, apts, tnts, lses, incs, adms, apps, pmts, pts, lps, convs, msgs, docs,
      ] = await Promise.all([
        fetchBuildings(),
        fetchApartments(),
        fetchTenants(),
        fetchLeases(),
        fetchIncidents(),
        fetchAdmins(),
        fetchApplications(),
        fetchPayments(),
        fetchPointsTransactions(),
        fetchLoyaltyProfiles(),
        fetchConversations(),
        fetchMessages(),
        fetchDocuments(),
      ]);
      setBuildings(bldgs);
      setApartments(apts);
      setTenants(tnts);
      setLeases(lses);
      setIncidents(incs);
      setAdmins(adms);
      setApplications(apps);
      setPayments(pmts);
      setPointsTransactions(pts);
      setLoyaltyProfiles(lps);
      setConversations(convs);
      setMessages(msgs);
      setDocuments(docs);
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // =======================================================================
  // BUILDINGS
  // =======================================================================

  const getBuilding = useCallback(
    (id: string) => buildings.find((b) => b.id === id),
    [buildings],
  );

  const addBuilding = useCallback(
    async (data: Omit<Building, 'id' | 'createdAt'>): Promise<Building> => {
      const id = generateBuildingId(buildings);
      const { data: row, error } = await supabase
        .from('buildings')
        .insert({
          id,
          name: data.name,
          address: data.address,
          city: data.city,
          province: data.province,
          postal_code: data.postalCode,
          total_units: data.totalUnits,
          occupied_units: data.occupiedUnits || 0,
          floors: data.floors,
          year_built: data.yearBuilt,
          manager_id: data.managerId,
        })
        .select()
        .single();
      if (error) throw error;
      const newBuilding: Building = {
        id: row.id,
        name: row.name,
        address: row.address,
        city: row.city,
        province: row.province,
        postalCode: row.postal_code,
        totalUnits: row.total_units,
        occupiedUnits: row.occupied_units,
        floors: row.floors,
        yearBuilt: row.year_built,
        managerId: row.manager_id,
        createdAt: row.created_at,
      };
      setBuildings((prev) => [...prev, newBuilding]);
      return newBuilding;
    },
    [buildings],
  );

  const updateBuilding = useCallback(
    async (id: string, data: Partial<Building>): Promise<void> => {
      const updatePayload: Record<string, any> = {};
      if (data.name !== undefined) updatePayload.name = data.name;
      if (data.address !== undefined) updatePayload.address = data.address;
      if (data.city !== undefined) updatePayload.city = data.city;
      if (data.province !== undefined) updatePayload.province = data.province;
      if (data.postalCode !== undefined) updatePayload.postal_code = data.postalCode;
      if (data.totalUnits !== undefined) updatePayload.total_units = data.totalUnits;
      if (data.occupiedUnits !== undefined) updatePayload.occupied_units = data.occupiedUnits;
      if (data.floors !== undefined) updatePayload.floors = data.floors;
      if (data.yearBuilt !== undefined) updatePayload.year_built = data.yearBuilt;
      if (data.managerId !== undefined) updatePayload.manager_id = data.managerId;

      const { error } = await supabase.from('buildings').update(updatePayload).eq('id', id);
      if (error) throw error;
      setBuildings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...data, id: b.id } : b)),
      );
    },
    [],
  );

  const deleteBuilding = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from('buildings').delete().eq('id', id);
    if (error) throw error;
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
        const isAvailable = a.status === 'available';
        if (buildingId) return isAvailable && a.buildingId === buildingId;
        return isAvailable;
      });
    },
    [apartments],
  );

  const addApartment = useCallback(
    async (data: Omit<Apartment, 'id'>): Promise<Apartment> => {
      const id = generateApartmentId(apartments);
      const { data: row, error } = await supabase
        .from('apartments')
        .insert({
          id,
          building_id: data.buildingId,
          unit_number: data.unitNumber,
          floor: data.floor,
          rooms: data.rooms,
          area: data.area,
          rent: data.rent,
          status: data.status,
          tenant_id: data.tenantId,
        })
        .select()
        .single();
      if (error) throw error;
      const newApt: Apartment = {
        id: row.id,
        buildingId: row.building_id,
        unitNumber: row.unit_number,
        floor: row.floor,
        rooms: row.rooms,
        area: row.area,
        rent: row.rent,
        status: row.status,
        tenantId: row.tenant_id,
      };
      setApartments((prev) => [...prev, newApt]);
      return newApt;
    },
    [apartments],
  );

  const updateApartment = useCallback(
    async (id: string, data: Partial<Apartment>): Promise<void> => {
      const updatePayload: Record<string, any> = {};
      if (data.buildingId !== undefined) updatePayload.building_id = data.buildingId;
      if (data.unitNumber !== undefined) updatePayload.unit_number = data.unitNumber;
      if (data.floor !== undefined) updatePayload.floor = data.floor;
      if (data.rooms !== undefined) updatePayload.rooms = data.rooms;
      if (data.area !== undefined) updatePayload.area = data.area;
      if (data.rent !== undefined) updatePayload.rent = data.rent;
      if (data.status !== undefined) updatePayload.status = data.status;
      if (data.tenantId !== undefined) updatePayload.tenant_id = data.tenantId;

      const { error } = await supabase.from('apartments').update(updatePayload).eq('id', id);
      if (error) throw error;
      setApartments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...data, id: a.id } : a)),
      );
    },
    [],
  );

  // =======================================================================
  // TENANTS
  // =======================================================================

  const getTenant = useCallback(
    (id: string) => tenants.find((t) => t.id === id),
    [tenants],
  );

  const addTenant = useCallback(
    async (data: Omit<Tenant, 'id' | 'createdAt'>): Promise<Tenant> => {
      const id = generateTenantId(tenants);
      const { data: row, error } = await supabase
        .from('tenants')
        .insert({
          id,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          password: data.password,
          status: data.status,
          building_id: data.buildingId,
          apartment_id: data.apartmentId,
          lease_id: data.leaseId,
          must_change_password: data.mustChangePassword,
          created_by: data.createdBy,
          status_changed_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      const newTenant: Tenant = {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        password: row.password,
        status: row.status,
        buildingId: row.building_id,
        apartmentId: row.apartment_id,
        leaseId: row.lease_id,
        mustChangePassword: row.must_change_password,
        createdAt: row.created_at,
        createdBy: row.created_by,
        statusChangedAt: row.status_changed_at,
      };
      setTenants((prev) => [...prev, newTenant]);
      return newTenant;
    },
    [tenants],
  );

  const updateTenant = useCallback(
    async (id: string, data: Partial<Tenant>): Promise<void> => {
      const updatePayload: Record<string, any> = {};
      if (data.firstName !== undefined) updatePayload.first_name = data.firstName;
      if (data.lastName !== undefined) updatePayload.last_name = data.lastName;
      if (data.email !== undefined) updatePayload.email = data.email;
      if (data.phone !== undefined) updatePayload.phone = data.phone;
      if (data.password !== undefined) updatePayload.password = data.password;
      if (data.status !== undefined) {
        updatePayload.status = data.status;
        updatePayload.status_changed_at = new Date().toISOString();
      }
      if (data.buildingId !== undefined) updatePayload.building_id = data.buildingId;
      if (data.apartmentId !== undefined) updatePayload.apartment_id = data.apartmentId;
      if (data.leaseId !== undefined) updatePayload.lease_id = data.leaseId;
      if (data.mustChangePassword !== undefined) updatePayload.must_change_password = data.mustChangePassword;
      if (data.createdBy !== undefined) updatePayload.created_by = data.createdBy;

      const { error } = await supabase.from('tenants').update(updatePayload).eq('id', id);
      if (error) throw error;
      setTenants((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const updated = { ...t, ...data, id: t.id };
          if (data.status !== undefined) {
            updated.statusChangedAt = new Date().toISOString();
          }
          return updated;
        }),
      );
    },
    [],
  );

  const deleteTenant = useCallback(async (id: string): Promise<void> => {
    // Delete related records first (cascade)
    // 1. Find conversations for this tenant, then delete their messages
    const { data: convos } = await supabase.from('conversations').select('id').eq('tenant_id', id);
    if (convos && convos.length > 0) {
      for (const c of convos) {
        await supabase.from('messages').delete().eq('conversation_id', c.id);
      }
    }
    await supabase.from('conversations').delete().eq('tenant_id', id);
    await supabase.from('documents').delete().eq('tenant_id', id);
    await supabase.from('points_transactions').delete().eq('tenant_id', id);
    await supabase.from('loyalty_profiles').delete().eq('tenant_id', id);
    await supabase.from('payments').delete().eq('tenant_id', id);
    await supabase.from('incidents').delete().eq('reported_by', id);
    await supabase.from('leases').delete().eq('tenant_id', id);
    // Free up the apartment if assigned
    await supabase.from('apartments').update({ status: 'available', tenant_id: null }).eq('tenant_id', id);
    // Delete the tenant
    const { error } = await supabase.from('tenants').delete().eq('id', id);
    if (error) throw error;
    // Clean up local state
    setTenants((prev) => prev.filter((t) => t.id !== id));
    setLeases((prev) => prev.filter((l) => l.tenantId !== id));
    setIncidents((prev) => prev.filter((i) => i.reportedBy !== id));
    setPayments((prev) => prev.filter((p) => p.tenantId !== id));
    setDocuments((prev) => prev.filter((d) => d.tenantId !== id));
    setApartments((prev) =>
      prev.map((a) =>
        a.tenantId === id ? { ...a, status: 'available', tenantId: null } : a
      ),
    );
    setConversations((prev) => prev.filter((c) => c.tenantId !== id));
    setMessages((prev) => {
      const removedConvoIds = new Set(
        conversations.filter((c) => c.tenantId === id).map((c) => c.id)
      );
      return prev.filter((m) => !removedConvoIds.has(m.conversationId));
    });
  }, [conversations]);

  // =======================================================================
  // ADMINS
  // =======================================================================

  const getAdmin = useCallback(
    (id: string) => admins.find((a) => a.id === id),
    [admins],
  );

  const addAdmin = useCallback(
    async (data: Omit<Admin, 'id' | 'createdAt'>): Promise<Admin> => {
      const id = generateAdminId(admins);
      const { data: row, error } = await supabase
        .from('admins')
        .insert({
          id,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          role: data.role,
          password: data.password,
          is_active: data.isActive,
          created_by: data.createdBy,
        })
        .select()
        .single();
      if (error) throw error;
      const newAdmin: Admin = {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        role: row.role,
        password: row.password,
        isActive: row.is_active,
        createdAt: row.created_at,
        createdBy: row.created_by,
      };
      setAdmins((prev) => [...prev, newAdmin]);
      return newAdmin;
    },
    [admins],
  );

  const updateAdmin = useCallback(
    async (id: string, data: Partial<Admin>): Promise<void> => {
      const updatePayload: Record<string, any> = {};
      if (data.firstName !== undefined) updatePayload.first_name = data.firstName;
      if (data.lastName !== undefined) updatePayload.last_name = data.lastName;
      if (data.email !== undefined) updatePayload.email = data.email;
      if (data.phone !== undefined) updatePayload.phone = data.phone;
      if (data.role !== undefined) updatePayload.role = data.role;
      if (data.password !== undefined) updatePayload.password = data.password;
      if (data.isActive !== undefined) updatePayload.is_active = data.isActive;

      const { error } = await supabase.from('admins').update(updatePayload).eq('id', id);
      if (error) throw error;
      setAdmins((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...data, id: a.id } : a)),
      );
    },
    [],
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
      leases.find((l) => l.tenantId === tenantId && l.status === 'active'),
    [leases],
  );

  const addLease = useCallback(
    async (data: Omit<Lease, 'id' | 'createdAt'>): Promise<Lease> => {
      const id = generateLeaseId(leases);
      const { data: row, error } = await supabase
        .from('leases')
        .insert({
          id,
          tenant_id: data.tenantId,
          apartment_id: data.apartmentId,
          building_id: data.buildingId,
          start_date: data.startDate,
          end_date: data.endDate,
          monthly_rent: data.monthlyRent,
          deposit_amount: data.depositAmount,
          status: data.status,
          created_by: data.createdBy,
        })
        .select()
        .single();
      if (error) throw error;
      const newLease: Lease = {
        id: row.id,
        tenantId: row.tenant_id,
        apartmentId: row.apartment_id,
        buildingId: row.building_id,
        startDate: row.start_date,
        endDate: row.end_date,
        monthlyRent: row.monthly_rent,
        depositAmount: row.deposit_amount,
        status: row.status,
        createdAt: row.created_at,
        createdBy: row.created_by,
      };
      setLeases((prev) => [...prev, newLease]);
      return newLease;
    },
    [leases],
  );

  const updateLease = useCallback(
    async (id: string, data: Partial<Lease>): Promise<void> => {
      const updatePayload: Record<string, any> = {};
      if (data.tenantId !== undefined) updatePayload.tenant_id = data.tenantId;
      if (data.apartmentId !== undefined) updatePayload.apartment_id = data.apartmentId;
      if (data.buildingId !== undefined) updatePayload.building_id = data.buildingId;
      if (data.startDate !== undefined) updatePayload.start_date = data.startDate;
      if (data.endDate !== undefined) updatePayload.end_date = data.endDate;
      if (data.monthlyRent !== undefined) updatePayload.monthly_rent = data.monthlyRent;
      if (data.depositAmount !== undefined) updatePayload.deposit_amount = data.depositAmount;
      if (data.status !== undefined) updatePayload.status = data.status;
      if (data.createdBy !== undefined) updatePayload.created_by = data.createdBy;

      const { error } = await supabase.from('leases').update(updatePayload).eq('id', id);
      if (error) throw error;
      setLeases((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...data, id: l.id } : l)),
      );
    },
    [],
  );

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
    async (data: Omit<Incident, 'id' | 'createdAt'>): Promise<Incident> => {
      const id = generateIncidentId(incidents);
      const { data: row, error } = await supabase
        .from('incidents')
        .insert({
          id,
          title: data.title,
          description: data.description,
          building_id: data.buildingId,
          apartment_id: data.apartmentId,
          reported_by: data.reportedBy,
          assigned_to: data.assignedTo,
          status: data.status,
          priority: data.priority,
          resolved_at: data.resolvedAt,
        })
        .select()
        .single();
      if (error) throw error;
      const newIncident: Incident = {
        id: row.id,
        title: row.title,
        description: row.description,
        buildingId: row.building_id,
        apartmentId: row.apartment_id,
        reportedBy: row.reported_by,
        assignedTo: row.assigned_to,
        status: row.status,
        priority: row.priority,
        createdAt: row.created_at,
        resolvedAt: row.resolved_at,
      };
      setIncidents((prev) => [...prev, newIncident]);
      return newIncident;
    },
    [incidents],
  );

  const updateIncident = useCallback(
    async (id: string, data: Partial<Incident>): Promise<void> => {
      const updatePayload: Record<string, any> = {};
      if (data.title !== undefined) updatePayload.title = data.title;
      if (data.description !== undefined) updatePayload.description = data.description;
      if (data.buildingId !== undefined) updatePayload.building_id = data.buildingId;
      if (data.apartmentId !== undefined) updatePayload.apartment_id = data.apartmentId;
      if (data.reportedBy !== undefined) updatePayload.reported_by = data.reportedBy;
      if (data.assignedTo !== undefined) updatePayload.assigned_to = data.assignedTo;
      if (data.status !== undefined) updatePayload.status = data.status;
      if (data.priority !== undefined) updatePayload.priority = data.priority;
      if (data.resolvedAt !== undefined) updatePayload.resolved_at = data.resolvedAt;

      const { error } = await supabase.from('incidents').update(updatePayload).eq('id', id);
      if (error) throw error;
      setIncidents((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...data, id: i.id } : i)),
      );
    },
    [],
  );

  // =======================================================================
  // APPLICATIONS
  // =======================================================================

  const getApplication = useCallback(
    (id: string) => applications.find((a) => a.id === id),
    [applications],
  );

  const addApplication = useCallback(
    async (
      data: Omit<
        PendingApplication,
        'id' | 'submittedAt' | 'status' | 'reviewedBy' | 'reviewNote' | 'reviewedAt'
      >,
    ): Promise<PendingApplication> => {
      const id = generateApplicationId(applications);
      const { data: row, error } = await supabase
        .from('pending_applications')
        .insert({
          id,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          password: data.password,
          housing_preference: data.housingPreference,
          documents: data.documents,
          status: 'pending_review',
          reviewed_by: null,
          review_note: null,
          reviewed_at: null,
        })
        .select()
        .single();
      if (error) throw error;
      const newApp: PendingApplication = {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        password: row.password,
        housingPreference: row.housing_preference,
        documents: row.documents,
        status: row.status,
        reviewedBy: row.reviewed_by,
        reviewNote: row.review_note,
        submittedAt: row.submitted_at,
        reviewedAt: row.reviewed_at,
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
    async (
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
    ): Promise<Tenant> => {
      const app = applications.find((a) => a.id === appId);
      if (!app) throw new Error(`Application ${appId} not found`);

      const tenantId = generateTenantId(tenants);
      const leaseId = generateLeaseId(leases);
      const timestamp = now();

      // 1. Update application status
      const { error: appError } = await supabase
        .from('pending_applications')
        .update({
          status: 'approved',
          reviewed_by: adminId,
          reviewed_at: timestamp,
        })
        .eq('id', appId);
      if (appError) throw appError;

      // 2. Insert tenant
      const { data: tenantRow, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          id: tenantId,
          first_name: app.firstName,
          last_name: app.lastName,
          email: app.email,
          phone: app.phone,
          password: app.password,
          status: 'active',
          building_id: buildingId,
          apartment_id: apartmentId,
          lease_id: leaseId,
          must_change_password: true,
          created_by: adminId,
          status_changed_at: timestamp,
        })
        .select()
        .single();
      if (tenantError) throw tenantError;

      // 3. Insert lease
      const { error: leaseError } = await supabase
        .from('leases')
        .insert({
          id: leaseId,
          tenant_id: tenantId,
          apartment_id: apartmentId,
          building_id: buildingId,
          start_date: leaseTerms.startDate,
          end_date: leaseTerms.endDate,
          monthly_rent: leaseTerms.monthlyRent,
          deposit_amount: leaseTerms.depositAmount,
          status: 'active',
          created_by: adminId,
        });
      if (leaseError) throw leaseError;

      // 4. Update apartment
      const { error: aptError } = await supabase
        .from('apartments')
        .update({ status: 'occupied', tenant_id: tenantId })
        .eq('id', apartmentId);
      if (aptError) throw aptError;

      // 5. Update building occupied units
      const building = buildings.find((b) => b.id === buildingId);
      if (building) {
        const { error: bldgError } = await supabase
          .from('buildings')
          .update({ occupied_units: building.occupiedUnits + 1 })
          .eq('id', buildingId);
        if (bldgError) throw bldgError;
      }

      // Map tenant row back to camelCase
      const newTenant: Tenant = {
        id: tenantRow.id,
        firstName: tenantRow.first_name,
        lastName: tenantRow.last_name,
        email: tenantRow.email,
        phone: tenantRow.phone,
        password: tenantRow.password,
        status: tenantRow.status,
        buildingId: tenantRow.building_id,
        apartmentId: tenantRow.apartment_id,
        leaseId: tenantRow.lease_id,
        mustChangePassword: tenantRow.must_change_password,
        createdAt: tenantRow.created_at,
        createdBy: tenantRow.created_by,
        statusChangedAt: tenantRow.status_changed_at,
      };

      const newLease: Lease = {
        id: leaseId,
        tenantId,
        apartmentId,
        buildingId,
        startDate: leaseTerms.startDate,
        endDate: leaseTerms.endDate,
        monthlyRent: leaseTerms.monthlyRent,
        depositAmount: leaseTerms.depositAmount,
        status: 'active',
        createdAt: timestamp,
        createdBy: adminId,
      };

      // Batch state updates
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: 'approved' as const,
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
            ? { ...a, status: 'occupied' as const, tenantId }
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
    [applications, tenants, leases, buildings],
  );

  /**
   * Reject an application: mark status as "rejected" with a note.
   */
  const rejectApplication = useCallback(
    async (appId: string, adminId: string, note: string): Promise<void> => {
      const timestamp = now();
      const { error } = await supabase
        .from('pending_applications')
        .update({
          status: 'rejected',
          reviewed_by: adminId,
          review_note: note,
          reviewed_at: timestamp,
        })
        .eq('id', appId);
      if (error) throw error;
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: 'rejected' as const,
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
    async (data: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> => {
      const id = generatePaymentId(payments);
      const { data: row, error } = await supabase
        .from('payments')
        .insert({
          id,
          tenant_id: data.tenantId,
          lease_id: data.leaseId,
          amount: data.amount,
          monthly_rent: data.monthlyRent,
          month: data.month,
          due_date: data.dueDate,
          paid_at: data.paidAt,
          status: data.status,
          method: data.method,
          reference: data.reference,
          late_fee: data.lateFee,
        })
        .select()
        .single();
      if (error) throw error;
      const newPayment: Payment = {
        id: row.id,
        tenantId: row.tenant_id,
        leaseId: row.lease_id,
        amount: row.amount,
        monthlyRent: row.monthly_rent,
        month: row.month,
        dueDate: row.due_date,
        paidAt: row.paid_at,
        status: row.status,
        method: row.method,
        reference: row.reference,
        lateFee: row.late_fee,
        createdAt: row.created_at,
      };
      setPayments((prev) => [...prev, newPayment]);
      return newPayment;
    },
    [payments],
  );

  const updatePayment = useCallback(
    async (id: string, data: Partial<Payment>): Promise<void> => {
      const updatePayload: Record<string, any> = {};
      if (data.tenantId !== undefined) updatePayload.tenant_id = data.tenantId;
      if (data.leaseId !== undefined) updatePayload.lease_id = data.leaseId;
      if (data.amount !== undefined) updatePayload.amount = data.amount;
      if (data.monthlyRent !== undefined) updatePayload.monthly_rent = data.monthlyRent;
      if (data.month !== undefined) updatePayload.month = data.month;
      if (data.dueDate !== undefined) updatePayload.due_date = data.dueDate;
      if (data.paidAt !== undefined) updatePayload.paid_at = data.paidAt;
      if (data.status !== undefined) updatePayload.status = data.status;
      if (data.method !== undefined) updatePayload.method = data.method;
      if (data.reference !== undefined) updatePayload.reference = data.reference;
      if (data.lateFee !== undefined) updatePayload.late_fee = data.lateFee;

      const { error } = await supabase.from('payments').update(updatePayload).eq('id', id);
      if (error) throw error;
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data, id: p.id } : p)),
      );
    },
    [],
  );

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
    async (data: Omit<PointsTransaction, 'id' | 'createdAt'>): Promise<PointsTransaction> => {
      const id = generatePointsTransactionId(pointsTransactions);
      const { data: row, error } = await supabase
        .from('points_transactions')
        .insert({
          id,
          tenant_id: data.tenantId,
          type: data.type,
          points: data.points,
          description: data.description,
          related_payment_id: data.relatedPaymentId,
        })
        .select()
        .single();
      if (error) throw error;
      const newTx: PointsTransaction = {
        id: row.id,
        tenantId: row.tenant_id,
        type: row.type,
        points: row.points,
        description: row.description,
        relatedPaymentId: row.related_payment_id,
        createdAt: row.created_at,
      };
      setPointsTransactions((prev) => [...prev, newTx]);

      // Update loyalty profile total points
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
    async (tenantId: string, data: Partial<LoyaltyProfile>): Promise<void> => {
      const updatePayload: Record<string, any> = {};
      if (data.totalPoints !== undefined) updatePayload.total_points = data.totalPoints;
      if (data.currentTier !== undefined) updatePayload.current_tier = data.currentTier;
      if (data.punctualityScore !== undefined) updatePayload.punctuality_score = data.punctualityScore;
      if (data.consecutiveOnTime !== undefined) updatePayload.consecutive_on_time = data.consecutiveOnTime;
      if (data.totalPayments !== undefined) updatePayload.total_payments = data.totalPayments;
      if (data.onTimePayments !== undefined) updatePayload.on_time_payments = data.onTimePayments;

      // Check if profile exists
      const existing = loyaltyProfiles.find((p) => p.tenantId === tenantId);

      if (existing) {
        const { error } = await supabase
          .from('loyalty_profiles')
          .update(updatePayload)
          .eq('tenant_id', tenantId);
        if (error) throw error;
        setLoyaltyProfiles((prev) =>
          prev.map((p) =>
            p.tenantId === tenantId ? { ...p, ...data } : p,
          ),
        );
      } else {
        // Create new profile if it doesn't exist
        const newProfile: LoyaltyProfile = {
          tenantId,
          totalPoints: 0,
          currentTier: 'bronze' as const,
          punctualityScore: 0,
          consecutiveOnTime: 0,
          totalPayments: 0,
          onTimePayments: 0,
          ...data,
        };
        const { error } = await supabase.from('loyalty_profiles').insert({
          tenant_id: newProfile.tenantId,
          total_points: newProfile.totalPoints,
          current_tier: newProfile.currentTier,
          punctuality_score: newProfile.punctualityScore,
          consecutive_on_time: newProfile.consecutiveOnTime,
          total_payments: newProfile.totalPayments,
          on_time_payments: newProfile.onTimePayments,
        });
        if (error) throw error;
        setLoyaltyProfiles((prev) => [...prev, newProfile]);
      }
    },
    [loyaltyProfiles],
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
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [messages],
  );

  const addConversation = useCallback(
    async (
      data: Omit<
        Conversation,
        'id' | 'createdAt' | 'lastMessageAt' | 'unreadAdmin' | 'unreadClient'
      >,
    ): Promise<Conversation> => {
      const id = generateConversationId(conversations);
      const timestamp = now();
      const { data: row, error } = await supabase
        .from('conversations')
        .insert({
          id,
          tenant_id: data.tenantId,
          admin_id: data.adminId,
          subject: data.subject,
          last_message_at: timestamp,
          unread_admin: 0,
          unread_client: 0,
        })
        .select()
        .single();
      if (error) throw error;
      const newConv: Conversation = {
        id: row.id,
        tenantId: row.tenant_id,
        adminId: row.admin_id,
        subject: row.subject,
        lastMessageAt: row.last_message_at,
        unreadAdmin: row.unread_admin,
        unreadClient: row.unread_client,
        createdAt: row.created_at,
      };
      setConversations((prev) => [...prev, newConv]);
      return newConv;
    },
    [conversations],
  );

  const addMessage = useCallback(
    async (data: Omit<Message, 'id' | 'createdAt' | 'readAt'>): Promise<Message> => {
      const id = generateMessageId(messages);
      const timestamp = now();
      const { data: row, error } = await supabase
        .from('messages')
        .insert({
          id,
          conversation_id: data.conversationId,
          sender_id: data.senderId,
          sender_type: data.senderType,
          content: data.content,
          read_at: null,
        })
        .select()
        .single();
      if (error) throw error;
      const newMsg: Message = {
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        senderType: row.sender_type,
        content: row.content,
        readAt: row.read_at,
        createdAt: row.created_at,
      };
      setMessages((prev) => [...prev, newMsg]);

      // Update conversation lastMessageAt and unread count
      const unreadUpdate: Record<string, any> = { last_message_at: timestamp };
      if (data.senderType === 'client') {
        // Increment unread for admin
        const conv = conversations.find((c) => c.id === data.conversationId);
        if (conv) unreadUpdate.unread_admin = conv.unreadAdmin + 1;
      } else {
        // Increment unread for client
        const conv = conversations.find((c) => c.id === data.conversationId);
        if (conv) unreadUpdate.unread_client = conv.unreadClient + 1;
      }
      await supabase
        .from('conversations')
        .update(unreadUpdate)
        .eq('id', data.conversationId);

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== data.conversationId) return c;
          return {
            ...c,
            lastMessageAt: timestamp,
            unreadAdmin:
              data.senderType === 'client' ? c.unreadAdmin + 1 : c.unreadAdmin,
            unreadClient:
              data.senderType === 'admin' ? c.unreadClient + 1 : c.unreadClient,
          };
        }),
      );

      return newMsg;
    },
    [messages, conversations],
  );

  const markMessagesRead = useCallback(
    async (conversationId: string, readerType: 'admin' | 'client'): Promise<void> => {
      const timestamp = now();

      // Mark individual messages as read in Supabase
      // Only mark messages from the OTHER sender type as read
      const oppositeSenderType = readerType === 'admin' ? 'client' : 'admin';
      const { error: msgError } = await supabase
        .from('messages')
        .update({ read_at: timestamp })
        .eq('conversation_id', conversationId)
        .eq('sender_type', oppositeSenderType)
        .is('read_at', null);
      if (msgError) throw msgError;

      // Reset unread counter on conversation
      const unreadReset: Record<string, any> = {};
      if (readerType === 'admin') {
        unreadReset.unread_admin = 0;
      } else {
        unreadReset.unread_client = 0;
      }
      const { error: convError } = await supabase
        .from('conversations')
        .update(unreadReset)
        .eq('id', conversationId);
      if (convError) throw convError;

      // Update local state
      setMessages((prev) =>
        prev.map((m) => {
          if (m.conversationId !== conversationId) return m;
          if (m.readAt) return m;
          if (readerType === 'admin' && m.senderType === 'client') {
            return { ...m, readAt: timestamp };
          }
          if (readerType === 'client' && m.senderType === 'admin') {
            return { ...m, readAt: timestamp };
          }
          return m;
        }),
      );
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          if (readerType === 'admin') return { ...c, unreadAdmin: 0 };
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
    async (data: Omit<TenantDocument, 'id' | 'createdAt'>): Promise<TenantDocument> => {
      const id = generateDocumentId(documents);
      const { data: row, error } = await supabase
        .from('documents')
        .insert({
          id,
          tenant_id: data.tenantId,
          type: data.type,
          title: data.title,
          description: data.description,
          file_url: data.fileUrl,
          file_size: data.fileSize,
          uploaded_by: data.uploadedBy,
        })
        .select()
        .single();
      if (error) throw error;
      const newDoc: TenantDocument = {
        id: row.id,
        tenantId: row.tenant_id,
        type: row.type,
        title: row.title,
        description: row.description,
        fileUrl: row.file_url,
        fileSize: row.file_size,
        uploadedBy: row.uploaded_by,
        createdAt: row.created_at,
      };
      setDocuments((prev) => [...prev, newDoc]);
      return newDoc;
    },
    [documents],
  );

  // -------------------------------------------------------------------------
  // Context value
  // -------------------------------------------------------------------------
  const value: DataContextType = {
    // State
    buildings,
    apartments,
    tenants,
    admins,
    leases,
    incidents,
    applications,
    payments,
    pointsTransactions,
    loyaltyProfiles,
    conversations,
    messages,
    documents,
    loading,

    // Buildings
    getBuilding,
    addBuilding,
    updateBuilding,
    deleteBuilding,

    // Apartments
    getApartment,
    getApartmentsByBuilding,
    getAvailableApartments,
    addApartment,
    updateApartment,

    // Tenants
    getTenant,
    addTenant,
    updateTenant,
    deleteTenant,

    // Admins
    getAdmin,
    addAdmin,
    updateAdmin,

    // Leases
    getLease,
    getLeaseByTenant,
    addLease,
    updateLease,

    // Incidents
    getIncident,
    getIncidentsByTenant,
    getIncidentsByBuilding,
    addIncident,
    updateIncident,

    // Applications
    getApplication,
    addApplication,
    approveApplication,
    rejectApplication,

    // Payments
    getPayment,
    getPaymentsByTenant,
    addPayment,
    updatePayment,

    // Points
    getPointsByTenant,
    getLoyaltyProfile,
    addPointsTransaction,
    updateLoyaltyProfile,

    // Conversations & Messages
    getConversation,
    getConversationsByTenant,
    getConversationsByAdmin,
    getMessagesByConversation,
    addConversation,
    addMessage,
    markMessagesRead,

    // Documents
    getDocumentsByTenant,
    addDocument,

    // Refresh
    refreshData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

/**
 * Hook to consume the DataContext. Throws if used outside of DataProvider.
 */
export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
