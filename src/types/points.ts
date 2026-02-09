export type PointsTransactionType = 'earned_early_payment' | 'earned_on_time' | 'earned_loyalty' | 'earned_no_incident' | 'redeemed' | 'bonus';
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface PointsTransaction {
  id: string;
  tenantId: string;
  type: PointsTransactionType;
  points: number; // positive = earned, negative = redeemed
  description: string;
  relatedPaymentId: string | null;
  createdAt: string;
}

export interface LoyaltyProfile {
  tenantId: string;
  totalPoints: number;
  currentTier: LoyaltyTier;
  punctualityScore: number; // 0-100
  consecutiveOnTime: number;
  totalPayments: number;
  onTimePayments: number;
}
