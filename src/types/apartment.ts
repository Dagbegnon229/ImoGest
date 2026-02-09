export type ApartmentStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';

export interface Apartment {
  id: string;
  buildingId: string;
  unitNumber: string;
  floor: number;
  rooms: number;
  area: number;
  rent: number;
  status: ApartmentStatus;
  tenantId: string | null;
}
