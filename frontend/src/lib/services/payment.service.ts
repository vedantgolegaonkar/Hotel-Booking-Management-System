import { API_BASE_URL } from '../api-client';

export const paymentService = {
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
};
