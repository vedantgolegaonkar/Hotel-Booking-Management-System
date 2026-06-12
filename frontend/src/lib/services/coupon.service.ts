import { API_BASE_URL, fetchWithAuth } from '../api-client';

export const couponService = {
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
};
