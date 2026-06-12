import { API_BASE_URL, fetchWithAuth } from '../api-client';

export const bookingService = {
  checkAvailability: async (checkIn: string, checkOut: string, guests: number) => {
    const query = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
    const res = await fetch(`${API_BASE_URL}/availability?${query}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to search availability');
    }
    const data = await res.json();
    if (data && data.categories) {
      data.categories = data.categories.map((c: any) => ({
        ...c,
        id: c.id || c.categoryId,
      }));
    }
    return data;
  },

  initiateBooking: async (bookingData: any) => {
    const res = await fetch(`${API_BASE_URL}/bookings/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to initiate booking');
    }
    return res.json();
  },

  getBooking: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}`);
    if (!res.ok) throw new Error('Failed to load booking details');
    return res.json();
  },

  searchBookings: async (search?: string) => {
    const endpoint = search ? `/bookings?search=${encodeURIComponent(search)}` : '/bookings';
    return fetchWithAuth(endpoint);
  },

  checkIn: async (bookingId: string, roomData: { assignedRoomId: number; idProofType: string; idProofUrl: string }) => {
    return fetchWithAuth(`/bookings/${bookingId}/check-in`, {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  },

  checkOut: async (bookingId: string, checkoutData: { extraIncidentals: number; paymentMethod: string; txRef?: string }) => {
    return fetchWithAuth(`/bookings/${bookingId}/check-out`, {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  },
};
