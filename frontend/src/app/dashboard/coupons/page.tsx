'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, AlertCircle, CheckCircle, Plus, Trash2, Calendar, Tag } from 'lucide-react';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add Coupon form state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minBookingValue: 0,
    maxDiscountValue: 1000,
    startDate: '',
    expiryDate: '',
    usageLimit: 100,
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];
    
    setFormData(prev => ({
      ...prev,
      startDate: today,
      expiryDate: nextMonthStr
    }));
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await api.getCoupons();
      setCoupons(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch coupons.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.createCoupon(formData);
      setSuccessMsg(`Coupon code ${formData.code} created successfully!`);
      setShowForm(false);
      
      // Reset form
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minBookingValue: 0,
        maxDiscountValue: 1000,
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        usageLimit: 100,
        isActive: true,
      });

      fetchCoupons();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.deleteCoupon(id);
      setSuccessMsg('Coupon deleted successfully.');
      fetchCoupons();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete coupon.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">Coupon Manager</h1>
          <p className="text-sm text-stone-500">Manage campaign vouchers, discount rates, and minimum billing triggers.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1 bg-navy hover:bg-navy-light text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
        >
          <Plus className="h-4 w-4 text-gold" /> {showForm ? 'Close Form' : 'Add Voucher'}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm max-w-xl">
          <h3 className="font-serif text-lg font-bold text-navy mb-4">Add Discount Voucher</h3>
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Voucher Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER20"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Type</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (₹)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Value</label>
                <input
                  type="number"
                  required
                  value={formData.discountValue}
                  onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Min Bill Value</label>
                <input
                  type="number"
                  value={formData.minBookingValue}
                  onChange={(e) => setFormData({...formData, minBookingValue: Number(e.target.value)})}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Max Discount</label>
                <input
                  type="number"
                  value={formData.maxDiscountValue}
                  onChange={(e) => setFormData({...formData, maxDiscountValue: Number(e.target.value)})}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-navy text-white px-5 py-2 text-xs font-bold uppercase"
              >
                {submitting ? 'Creating...' : 'Save Voucher'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <Loader2 className="h-10 w-10 text-gold animate-spin mx-auto mb-3" />
          <span className="text-sm font-semibold text-stone-500">Retrieving active coupons...</span>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <Tag className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-semibold text-navy">No Vouchers Configured</h3>
          <p className="text-stone-500 text-sm max-w-sm mx-auto">Create a campaign code to offer promotional discounts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="inline-flex items-center gap-1 bg-gold/10 text-gold border border-gold/20 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                    <Tag className="h-3.5 w-3.5" /> {coupon.code}
                  </span>
                  <button
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className="text-stone-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs font-semibold text-navy">
                  {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% Off Tariff` : `₹${coupon.discountValue} Off Tariff`}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-stone-500 pt-1">
                  <Calendar className="h-3.5 w-3.5 text-stone-400" />
                  <span>Valid to: {coupon.expiryDate}</span>
                </div>
              </div>
              <div className="text-[10px] text-stone-400 border-t border-stone-50 pt-3">
                Min stay bill: ₹{coupon.minBookingValue.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
