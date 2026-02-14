export interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  totalUnits: number;
  occupiedUnits: number;
  floors: number;
  yearBuilt: number;
  managerId: string | null;
  createdAt: string;
  updatedAt: string | null;
}
