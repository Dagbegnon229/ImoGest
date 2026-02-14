/**
 * Utility functions for ImmoGest platform.
 * ID generation helpers for all entity types.
 */

/**
 * Format an ISO date string to a French locale date (dd/mm/yyyy).
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Format a number as currency (CAD - Dollar canadien).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generate admin ID in format ADM-XXXX (zero-padded 4 digits).
 * Scans existing admins to find the next available number.
 */
export function generateAdminId(existingAdmins: { id: string }[]): string {
  let maxNum = 0;
  for (const admin of existingAdmins) {
    const match = admin.id.match(/^ADM-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  return `ADM-${String(next).padStart(4, "0")}`;
}

/**
 * Generate tenant ID in format CLT-YYYY-XXXX (current year, zero-padded 4 digits).
 * Scans existing tenants to find the next available number for the current year.
 */
export function generateTenantId(existingTenants: { id: string }[]): string {
  const year = new Date().getFullYear();
  let maxNum = 0;
  for (const tenant of existingTenants) {
    const match = tenant.id.match(/^CLT-(\d{4})-(\d+)$/);
    if (match && parseInt(match[1], 10) === year) {
      const num = parseInt(match[2], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  return `CLT-${year}-${String(next).padStart(4, "0")}`;
}

/**
 * Generate building ID in format BLD-XXX (zero-padded 3 digits).
 */
export function generateBuildingId(existingBuildings: { id: string }[]): string {
  let maxNum = 0;
  for (const building of existingBuildings) {
    const match = building.id.match(/^BLD-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  return `BLD-${String(next).padStart(3, "0")}`;
}

/**
 * Generate apartment ID in format APT-XXX (zero-padded 3 digits).
 */
export function generateApartmentId(existingApartments: { id: string }[]): string {
  let maxNum = 0;
  for (const apt of existingApartments) {
    const match = apt.id.match(/^APT-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  return `APT-${String(next).padStart(3, "0")}`;
}

/**
 * Generate lease ID in format LSE-XXX (zero-padded 3 digits).
 */
export function generateLeaseId(existingLeases: { id: string }[]): string {
  let maxNum = 0;
  for (const lease of existingLeases) {
    const match = lease.id.match(/^LSE-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  return `LSE-${String(next).padStart(3, "0")}`;
}

/**
 * Generate incident ID in format INC-XXX (zero-padded 3 digits).
 */
export function generateIncidentId(existingIncidents: { id: string }[]): string {
  let maxNum = 0;
  for (const inc of existingIncidents) {
    const match = inc.id.match(/^INC-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  return `INC-${String(next).padStart(3, "0")}`;
}

/**
 * Generate application ID in format APP-XXXX (zero-padded 4 digits).
 */
export function generateApplicationId(existingApplications: { id: string }[]): string {
  let maxNum = 0;
  for (const app of existingApplications) {
    const match = app.id.match(/^APP-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  return `APP-${String(next).padStart(4, "0")}`;
}

export function generatePaymentId(existingPayments: { id: string }[]): string {
  let maxNum = 0;
  for (const p of existingPayments) {
    const match = p.id.match(/^PAY-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  return `PAY-${String(next).padStart(3, "0")}`;
}

export function generatePointsTransactionId(existing: { id: string }[]): string {
  let maxNum = 0;
  for (const p of existing) {
    const match = p.id.match(/^PTS-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  return `PTS-${String(next).padStart(3, "0")}`;
}

export function generateConversationId(existing: { id: string }[]): string {
  let maxNum = 0;
  for (const c of existing) {
    const match = c.id.match(/^CONV-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  return `CONV-${String(next).padStart(3, "0")}`;
}

export function generateMessageId(existing: { id: string }[]): string {
  let maxNum = 0;
  for (const m of existing) {
    const match = m.id.match(/^MSG-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  return `MSG-${String(next).padStart(3, "0")}`;
}

export function generateDocumentId(existing: { id: string }[]): string {
  let maxNum = 0;
  for (const d of existing) {
    const match = d.id.match(/^DOC-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  return `DOC-${String(next).padStart(3, "0")}`;
}

export function getLoyaltyTier(points: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' {
  if (points >= 2000) return 'diamond';
  if (points >= 1500) return 'platinum';
  if (points >= 800) return 'gold';
  if (points >= 400) return 'silver';
  return 'bronze';
}

export function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Returns a human-readable relative time string in French.
 * Example: "il y a 3 jours", "il y a 2 mois", "il y a 1 an"
 */
/**
 * Format a date as "dd/mm/yyyy à HH:mm" in French locale.
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function getTimeAgo(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "à l'instant";

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (minutes < 1) return "à l'instant";
    if (minutes < 60) return `il y a ${minutes} min`;
    if (hours < 24) return `il y a ${hours}h`;
    if (days === 1) return "il y a 1 jour";
    if (days < 30) return `il y a ${days} jours`;
    if (months === 1) return "il y a 1 mois";
    if (months < 12) return `il y a ${months} mois`;
    if (years === 1) return "il y a 1 an";
    return `il y a ${years} ans`;
  } catch {
    return "";
  }
}
