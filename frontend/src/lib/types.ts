export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile: string;
  roles: string[];
}

export interface RoomCategory {
  id: number;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
  amenities: string[];
  images: string[];
  availableCount?: number; // populated dynamically in search
}

export interface Room {
  id: number;
  roomNumber: string;
  category: RoomCategory;
  floor: number;
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address?: string;
  city?: string;
  stateCode: string;
  gstin?: string;
  idProofType?: string;
  idProofUrl?: string;
  totalStays: number;
  totalSpend: number;
}

export interface Booking {
  id: string;
  bookingReference: string;
  guest: Guest;
  category: RoomCategory;
  checkInDate: string;
  checkOutDate: string;
  adultsCount: number;
  childrenCount: number;
  bookingStatus: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'EXPIRED' | 'TIMEOUT_REFUNDED';
  baseAmount: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  createdAt: string;
  assignedRooms?: Room[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  booking: Booking;
  invoiceDate: string;
  baseTariffTotal: number;
  discountApplied: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  gstPercentage: number;
  grandTotal: number;
  gstinResort: string;
  sacCode: string;
  placeOfSupply: string;
}

export interface HousekeepingTask {
  id: number;
  room: Room;
  assignedTo?: User;
  taskStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
  createdAt: string;
  completedAt?: string;
}
