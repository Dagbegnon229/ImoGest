export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'cash' | 'cheque';

export interface Payment {
  id: string;
  tenantId: string;
  leaseId: string;
  amount: number;
  monthlyRent: number;
  month: string; // YYYY-MM format
  dueDate: string;
  paidAt: string | null;
  status: PaymentStatus;
  method: PaymentMethod | null;
  reference: string | null;
  lateFee: number;
  proofImageUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}
