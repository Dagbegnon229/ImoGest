export type IncidentStatus = 'new' | 'in_progress' | 'resolved' | 'closed';
export type IncidentPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Incident {
  id: string;
  title: string;
  description: string;
  buildingId: string;
  apartmentId: string;
  reportedBy: string;
  assignedTo: string | null;
  status: IncidentStatus;
  priority: IncidentPriority;
  createdAt: string;
  resolvedAt: string | null;
  updatedAt: string | null;
}
