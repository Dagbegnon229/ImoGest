// ── Admin Sidebar Navigation ──────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export const adminNavItems: NavItem[] = [
  { label: 'Tableau de bord', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Immeubles', href: '/admin/buildings', icon: 'Building2' },
  { label: 'Appartements', href: '/admin/apartments', icon: 'DoorOpen' },
  { label: 'Clients', href: '/admin/clients', icon: 'Users' },
  { label: 'Demandes', href: '/admin/applications', icon: 'ClipboardList' },
  { label: 'Incidents', href: '/admin/incidents', icon: 'AlertTriangle' },
  { label: 'Paiements', href: '/admin/payments', icon: 'CreditCard' },
  { label: 'Messages', href: '/admin/messages', icon: 'MessageSquare' },
  { label: 'Équipe', href: '/admin/team', icon: 'ShieldCheck' },
];

// ── Client (Tenant) Sidebar Navigation ────────────────────────────────────────

export const clientNavItems: NavItem[] = [
  { label: 'Tableau de bord', href: '/client', icon: 'LayoutDashboard' },
  { label: 'Mon appartement', href: '/client/apartment', icon: 'DoorOpen' },
  { label: 'Paiements', href: '/client/payments', icon: 'CreditCard' },
  { label: 'Incidents', href: '/client/incidents', icon: 'AlertTriangle' },
  { label: 'Points fidélité', href: '/client/points', icon: 'Award' },
  { label: 'Documents', href: '/client/documents', icon: 'FolderOpen' },
  { label: 'Messages', href: '/client/messages', icon: 'MessageSquare' },
  { label: 'Mon profil', href: '/client/profile', icon: 'UserCircle' },
];

// ── French Labels: Admin Roles ────────────────────────────────────────────────

export const adminRoleLabels: Record<string, string> = {
  super_admin: 'Super Administrateur',
  admin_manager: 'Gestionnaire',
  admin_support: 'Support',
};

// ── French Labels: Tenant Statuses ────────────────────────────────────────────

export const tenantStatusLabels: Record<string, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  pending_approval: 'En attente',
  suspended: 'Suspendu',
};

// ── French Labels: Apartment Statuses ─────────────────────────────────────────

export const apartmentStatusLabels: Record<string, string> = {
  available: 'Disponible',
  occupied: 'Occupé',
  maintenance: 'En maintenance',
  reserved: 'Réservé',
};

// ── French Labels: Lease Statuses ─────────────────────────────────────────────

export const leaseStatusLabels: Record<string, string> = {
  active: 'Actif',
  expired: 'Expiré',
  terminated: 'Résilié',
  pending: 'En attente',
};

// ── French Labels: Incident Statuses ──────────────────────────────────────────

export const incidentStatusLabels: Record<string, string> = {
  new: 'Nouveau',
  in_progress: 'En cours',
  resolved: 'Résolu',
  closed: 'Fermé',
};

// ── French Labels: Incident Priorities ────────────────────────────────────────

export const incidentPriorityLabels: Record<string, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
  urgent: 'Urgente',
};

// ── French Labels: Application Statuses ───────────────────────────────────────

export const applicationStatusLabels: Record<string, string> = {
  pending_review: 'En attente de révision',
  approved: 'Approuvée',
  rejected: 'Rejetée',
};

// ── Status Color Mappings (Tailwind CSS classes) ──────────────────────────────

export const tenantStatusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800',
};

export const apartmentStatusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-orange-100 text-orange-800',
  reserved: 'bg-purple-100 text-purple-800',
};

export const leaseStatusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  expired: 'bg-gray-100 text-gray-800',
  terminated: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

export const incidentStatusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

export const incidentPriorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export const applicationStatusColors: Record<string, string> = {
  pending_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

// ── French Labels: Payment Statuses ─────────────────────────────────────────
export const paymentStatusLabels: Record<string, string> = {
  pending: 'En attente',
  completed: 'Payé',
  failed: 'Échoué',
  refunded: 'Remboursé',
};

export const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

// ── French Labels: Payment Methods ──────────────────────────────────────────
export const paymentMethodLabels: Record<string, string> = {
  bank_transfer: 'Virement bancaire',
  credit_card: 'Carte de crédit',
  cash: 'Espèces',
  cheque: 'Chèque',
};

// ── French Labels: Loyalty Tiers ────────────────────────────────────────────
export const loyaltyTierLabels: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Argent',
  gold: 'Or',
  platinum: 'Platine',
  diamond: 'Diamant',
};

export const loyaltyTierColors: Record<string, string> = {
  bronze: 'bg-orange-100 text-orange-800',
  silver: 'bg-gray-100 text-gray-700',
  gold: 'bg-yellow-100 text-yellow-800',
  platinum: 'bg-indigo-100 text-indigo-800',
  diamond: 'bg-cyan-100 text-cyan-800',
};

// ── French Labels: Points Transaction Types ──────────────────────────────────
export const pointsTypeLabels: Record<string, string> = {
  earned_early_payment: 'Paiement anticipé',
  earned_on_time: 'Paiement à temps',
  earned_loyalty: 'Bonus fidélité',
  earned_no_incident: 'Aucun incident',
  redeemed: 'Points échangés',
  bonus: 'Bonus',
};

// ── French Labels: Document Types ────────────────────────────────────────────
export const documentTypeLabels: Record<string, string> = {
  lease_contract: 'Contrat de bail',
  receipt: 'Reçu de paiement',
  notice: 'Avis',
  invoice: 'Facture',
  other: 'Autre',
};

export const documentTypeColors: Record<string, string> = {
  lease_contract: 'bg-blue-100 text-blue-800',
  receipt: 'bg-green-100 text-green-800',
  notice: 'bg-yellow-100 text-yellow-800',
  invoice: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
};
