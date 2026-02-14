import type {
  Admin,
  Building,
  Apartment,
  Tenant,
  Lease,
  Incident,
  PendingApplication,
  Payment,
  PointsTransaction,
  LoyaltyProfile,
  Conversation,
  Message,
  TenantDocument,
} from '@/types';

// ============================================================
// Admin  (table: admins)
// ============================================================

export function toAdmin(row: any): Admin {
  return {
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
}

export function fromAdmin(admin: Admin): any {
  return {
    id: admin.id,
    first_name: admin.firstName,
    last_name: admin.lastName,
    email: admin.email,
    phone: admin.phone,
    role: admin.role,
    password: admin.password,
    is_active: admin.isActive,
    created_at: admin.createdAt,
    created_by: admin.createdBy,
  };
}

// ============================================================
// Building  (table: buildings)
// ============================================================

export function toBuilding(row: any): Building {
  return {
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
    updatedAt: row.updated_at ?? null,
  };
}

export function fromBuilding(building: Building): any {
  return {
    id: building.id,
    name: building.name,
    address: building.address,
    city: building.city,
    province: building.province,
    postal_code: building.postalCode,
    total_units: building.totalUnits,
    occupied_units: building.occupiedUnits,
    floors: building.floors,
    year_built: building.yearBuilt,
    manager_id: building.managerId,
    created_at: building.createdAt,
    updated_at: building.updatedAt,
  };
}

// ============================================================
// Apartment  (table: apartments)
// ============================================================

export function toApartment(row: any): Apartment {
  return {
    id: row.id,
    buildingId: row.building_id,
    unitNumber: row.unit_number,
    floor: row.floor,
    rooms: row.rooms,
    area: row.area,
    rent: row.rent,
    status: row.status,
    tenantId: row.tenant_id,
    images: row.images ?? [],
    updatedAt: row.updated_at ?? null,
  };
}

export function fromApartment(apartment: Apartment): any {
  return {
    id: apartment.id,
    building_id: apartment.buildingId,
    unit_number: apartment.unitNumber,
    floor: apartment.floor,
    rooms: apartment.rooms,
    area: apartment.area,
    rent: apartment.rent,
    status: apartment.status,
    tenant_id: apartment.tenantId,
    images: apartment.images ?? [],
    updated_at: apartment.updatedAt,
  };
}

// ============================================================
// Tenant  (table: tenants)
// ============================================================

export function toTenant(row: any): Tenant {
  return {
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
    updatedAt: row.updated_at ?? null,
    promoCredits: row.promo_credits ?? 0,
    notes: row.notes ?? null,
    emergencyContact: row.emergency_contact ?? null,
    emergencyPhone: row.emergency_phone ?? null,
  };
}

export function fromTenant(tenant: Tenant): any {
  return {
    id: tenant.id,
    first_name: tenant.firstName,
    last_name: tenant.lastName,
    email: tenant.email,
    phone: tenant.phone,
    password: tenant.password,
    status: tenant.status,
    building_id: tenant.buildingId,
    apartment_id: tenant.apartmentId,
    lease_id: tenant.leaseId,
    must_change_password: tenant.mustChangePassword,
    created_at: tenant.createdAt,
    created_by: tenant.createdBy,
    status_changed_at: tenant.statusChangedAt,
    updated_at: tenant.updatedAt,
    promo_credits: tenant.promoCredits,
    notes: tenant.notes,
    emergency_contact: tenant.emergencyContact,
    emergency_phone: tenant.emergencyPhone,
  };
}

// ============================================================
// Lease  (table: leases)
// ============================================================

export function toLease(row: any): Lease {
  return {
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
    updatedAt: row.updated_at ?? null,
  };
}

export function fromLease(lease: Lease): any {
  return {
    id: lease.id,
    tenant_id: lease.tenantId,
    apartment_id: lease.apartmentId,
    building_id: lease.buildingId,
    start_date: lease.startDate,
    end_date: lease.endDate,
    monthly_rent: lease.monthlyRent,
    deposit_amount: lease.depositAmount,
    status: lease.status,
    created_at: lease.createdAt,
    created_by: lease.createdBy,
    updated_at: lease.updatedAt,
  };
}

// ============================================================
// Incident  (table: incidents)
// ============================================================

export function toIncident(row: any): Incident {
  return {
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
    updatedAt: row.updated_at ?? null,
  };
}

export function fromIncident(incident: Incident): any {
  return {
    id: incident.id,
    title: incident.title,
    description: incident.description,
    building_id: incident.buildingId,
    apartment_id: incident.apartmentId,
    reported_by: incident.reportedBy,
    assigned_to: incident.assignedTo,
    status: incident.status,
    priority: incident.priority,
    created_at: incident.createdAt,
    resolved_at: incident.resolvedAt,
    updated_at: incident.updatedAt,
  };
}

// ============================================================
// PendingApplication  (table: pending_applications)
// ============================================================

export function toPendingApplication(row: any): PendingApplication {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    password: row.password,
    housingPreference: row.housing_preference,
    documents: row.documents ?? [],
    documentFiles: row.document_files ?? [],
    status: row.status,
    reviewedBy: row.reviewed_by,
    reviewNote: row.review_note,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
  };
}

export function fromPendingApplication(application: PendingApplication): any {
  return {
    id: application.id,
    first_name: application.firstName,
    last_name: application.lastName,
    email: application.email,
    phone: application.phone,
    password: application.password,
    housing_preference: application.housingPreference,
    documents: application.documents,
    document_files: application.documentFiles ?? [],
    status: application.status,
    reviewed_by: application.reviewedBy,
    review_note: application.reviewNote,
    submitted_at: application.submittedAt,
    reviewed_at: application.reviewedAt,
  };
}

// ============================================================
// Payment  (table: payments)
// ============================================================

export function toPayment(row: any): Payment {
  return {
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
    proofImageUrl: row.proof_image_url ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? null,
  };
}

export function fromPayment(payment: Payment): any {
  return {
    id: payment.id,
    tenant_id: payment.tenantId,
    lease_id: payment.leaseId,
    amount: payment.amount,
    monthly_rent: payment.monthlyRent,
    month: payment.month,
    due_date: payment.dueDate,
    paid_at: payment.paidAt,
    status: payment.status,
    method: payment.method,
    reference: payment.reference,
    late_fee: payment.lateFee,
    proof_image_url: payment.proofImageUrl,
    created_at: payment.createdAt,
    updated_at: payment.updatedAt,
  };
}

// ============================================================
// PointsTransaction  (table: points_transactions)
// ============================================================

export function toPointsTransaction(row: any): PointsTransaction {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    type: row.type,
    points: row.points,
    description: row.description,
    relatedPaymentId: row.related_payment_id,
    createdAt: row.created_at,
  };
}

export function fromPointsTransaction(transaction: PointsTransaction): any {
  return {
    id: transaction.id,
    tenant_id: transaction.tenantId,
    type: transaction.type,
    points: transaction.points,
    description: transaction.description,
    related_payment_id: transaction.relatedPaymentId,
    created_at: transaction.createdAt,
  };
}

// ============================================================
// LoyaltyProfile  (table: loyalty_profiles)
// ============================================================

export function toLoyaltyProfile(row: any): LoyaltyProfile {
  return {
    tenantId: row.tenant_id,
    totalPoints: row.total_points,
    currentTier: row.current_tier,
    punctualityScore: row.punctuality_score,
    consecutiveOnTime: row.consecutive_on_time,
    totalPayments: row.total_payments,
    onTimePayments: row.on_time_payments,
  };
}

export function fromLoyaltyProfile(profile: LoyaltyProfile): any {
  return {
    tenant_id: profile.tenantId,
    total_points: profile.totalPoints,
    current_tier: profile.currentTier,
    punctuality_score: profile.punctualityScore,
    consecutive_on_time: profile.consecutiveOnTime,
    total_payments: profile.totalPayments,
    on_time_payments: profile.onTimePayments,
  };
}

// ============================================================
// Conversation  (table: conversations)
// ============================================================

export function toConversation(row: any): Conversation {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    adminId: row.admin_id,
    subject: row.subject,
    lastMessageAt: row.last_message_at,
    unreadAdmin: row.unread_admin,
    unreadClient: row.unread_client,
    createdAt: row.created_at,
  };
}

export function fromConversation(conversation: Conversation): any {
  return {
    id: conversation.id,
    tenant_id: conversation.tenantId,
    admin_id: conversation.adminId,
    subject: conversation.subject,
    last_message_at: conversation.lastMessageAt,
    unread_admin: conversation.unreadAdmin,
    unread_client: conversation.unreadClient,
    created_at: conversation.createdAt,
  };
}

// ============================================================
// Message  (table: messages)
// ============================================================

export function toMessage(row: any): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    senderType: row.sender_type,
    content: row.content,
    attachments: row.attachments ?? [],
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export function fromMessage(message: Message): any {
  return {
    id: message.id,
    conversation_id: message.conversationId,
    sender_id: message.senderId,
    sender_type: message.senderType,
    content: message.content,
    attachments: message.attachments ?? [],
    read_at: message.readAt,
    created_at: message.createdAt,
  };
}

// ============================================================
// TenantDocument  (table: documents)
// ============================================================

export function toTenantDocument(row: any): TenantDocument {
  return {
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
}

export function fromTenantDocument(doc: TenantDocument): any {
  return {
    id: doc.id,
    tenant_id: doc.tenantId,
    type: doc.type,
    title: doc.title,
    description: doc.description,
    file_url: doc.fileUrl,
    file_size: doc.fileSize,
    uploaded_by: doc.uploadedBy,
    created_at: doc.createdAt,
  };
}
