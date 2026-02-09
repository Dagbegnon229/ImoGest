export type DocumentType = 'lease_contract' | 'receipt' | 'notice' | 'invoice' | 'other';

export interface TenantDocument {
  id: string;
  tenantId: string;
  type: DocumentType;
  title: string;
  description: string;
  fileUrl: string;
  fileSize: number; // in bytes
  uploadedBy: string;
  createdAt: string;
}
