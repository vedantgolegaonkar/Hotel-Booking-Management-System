const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-change'));
      // Only redirect if we are inside dashboard routes
      if (window.location.pathname.startsWith('/dashboard')) {
        window.location.href = '/login';
      }
    }
    throw new Error('Unauthorized session. Please login again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'API request failed.');
  }

  return response.json();
}

export const api = {
  // Authentication
  login: async (credentials: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Login failed');
    }
    return res.json();
  },

  // Public Room Category details
  getCategories: async () => {
    const res = await fetch(`${API_BASE_URL}/rooms/categories`);
    if (!res.ok) throw new Error('Failed to load categories');
    return res.json();
  },

  getCategory: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/rooms/categories/${id}`);
    if (!res.ok) throw new Error('Failed to load category details');
    return res.json();
  },

  // Public Availability Search
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

  // Booking process
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

  // Check-in (Staff Only)
  getAvailableRoomsForCategory: async (categoryId: number) => {
    return fetchWithAuth(`/rooms/available-by-category?categoryId=${categoryId}`);
  },

  checkIn: async (bookingId: string, roomData: { assignedRoomId: number; idProofType: string; idProofUrl: string }) => {
    return fetchWithAuth(`/bookings/${bookingId}/check-in`, {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  },

  // Check-out (Staff Only)
  checkOut: async (bookingId: string, checkoutData: { extraIncidentals: number; paymentMethod: string; txRef?: string }) => {
    return fetchWithAuth(`/bookings/${bookingId}/check-out`, {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  },

  // Payments Gateway Simulator
  confirmPaymentDirectly: async (confirmData: { razorpayOrderId: string; razorpayPaymentId: string; signature?: string }) => {
    const res = await fetch(`${API_BASE_URL}/payments/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(confirmData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Payment confirmation failed');
    }
    return res.json();
  },

  // Housekeeping Tasks (Staff Only)
  getHousekeepingTasks: async () => {
    return fetchWithAuth('/housekeeping/tasks');
  },

  claimHousekeepingTask: async (taskId: number) => {
    return fetchWithAuth(`/housekeeping/tasks/${taskId}/claim`, {
      method: 'POST',
    });
  },

  completeHousekeepingTask: async (taskId: number, notes?: string) => {
    return fetchWithAuth(`/housekeeping/tasks/${taskId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  // Coupons CRUD (Managers/Admins Only)
  validateCoupon: async (code: string, amount: number) => {
    const query = new URLSearchParams({ code, amount: String(amount) });
    const res = await fetch(`${API_BASE_URL}/coupons/validate?${query}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Invalid coupon code');
    }
    return res.json();
  },

  getCoupons: async () => {
    return fetchWithAuth('/coupons');
  },

  createCoupon: async (coupon: any) => {
    return fetchWithAuth('/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon),
    });
  },

  updateCoupon: async (id: number, coupon: any) => {
    return fetchWithAuth(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(coupon),
    });
  },

  deleteCoupon: async (id: number) => {
    return fetchWithAuth(`/coupons/${id}`, {
      method: 'DELETE',
    });
  },

  // Pricing updates
  updateCategoryPrice: async (id: number, category: any) => {
    return fetchWithAuth(`/rooms/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  },
};
