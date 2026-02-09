export type ApplicationStatus = 'pending_review' | 'approved' | 'rejected';

export interface PendingApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  housingPreference: string | null;
  documents: string[];
  status: ApplicationStatus;
  reviewedBy: string | null;
  reviewNote: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}
