export type ApplicationStatus = 'pending_review' | 'approved' | 'rejected';

export interface ApplicationDocument {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface PendingApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  housingPreference: string | null;
  documents: string[];           // Legacy: filenames only (backward compat)
  documentFiles: ApplicationDocument[]; // New: full file info with URLs
  status: ApplicationStatus;
  reviewedBy: string | null;
  reviewNote: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}
