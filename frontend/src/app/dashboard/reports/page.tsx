'use client';

import { bookingService } from '@/lib/services/booking.service';

import { useState, useEffect } from 'react';
import { Booking } from '@/lib/types';
import { Loader2, AlertCircle, TrendingUp, IndianRupee, Users, Percent, FileText, Landmark, ShieldCheck } from 'lucide-react';

export default function ReportsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await bookingService.searchBookings();
      setBookings(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  // Aggregated calculations
  const activeBookings = bookings.filter(
    (b) => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CHECKED_IN' || b.bookingStatus === 'CHECKED_OUT'
  );

  const totalRevenue = activeBookings.reduce((sum, b) => sum + b.grandTotal, 0);
  const totalBaseTariff = activeBookings.reduce((sum, b) => sum + b.baseAmount, 0);
  const totalDiscounts = activeBookings.reduce((sum, b) => sum + b.discountAmount, 0);
  const totalTaxes = activeBookings.reduce((sum, b) => sum + b.taxAmount, 0);

  // Split CGST, SGST, IGST based on guest state code
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  activeBookings.forEach((b) => {
    if (b.guest.stateCode === 'GA') {
      cgstTotal += b.taxAmount / 2;
      sgstTotal += b.taxAmount / 2;
    } else {
      igstTotal += b.taxAmount;
    }
  });

  const checkedInBookings = bookings.filter((b) => b.bookingStatus === 'CHECKED_IN');
  const currentInHouseGuests = checkedInBookings.reduce((sum, b) => sum + b.adultsCount, 0);

  // Distribution of stays by category
  const categoryStats: Record<string, { count: number; revenue: number }> = {};
  activeBookings.forEach((b) => {
    const name = b.category.name;
    if (!categoryStats[name]) {
      categoryStats[name] = { count: 0, revenue: 0 };
    }
    categoryStats[name].count += 1;
    categoryStats[name].revenue += b.grandTotal;
  });

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-navy">Manager Analytics Desk</h1>
        <p className="text-sm text-stone-500">
          Real-time analytics, sales revenues, active in-house headcounts, and GST filing report summaries.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-sm text-red-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <Loader2 className="h-10 w-10 text-gold animate-spin mx-auto mb-3" />
          <span className="text-sm font-semibold text-stone-500">Aggregating resort statistics...</span>
        </div>
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="rounded-3xl bg-white border border-stone-100 p-6 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                <IndianRupee className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Total Revenue</span>
                <span className="text-2xl font-black text-navy">₹{totalRevenue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* In-House Guests */}
            <div className="rounded-3xl bg-white border border-stone-100 p-6 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">In-House Guests</span>
                <span className="text-2xl font-black text-navy">{currentInHouseGuests} Adults</span>
              </div>
            </div>

            {/* Active Bookings */}
            <div className="rounded-3xl bg-white border border-stone-100 p-6 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Active Stays</span>
                <span className="text-2xl font-black text-navy">{activeBookings.length} Bookings</span>
              </div>
            </div>

            {/* Discounts applied */}
            <div className="rounded-3xl bg-white border border-stone-100 p-6 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Percent className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Discounts Given</span>
                <span className="text-2xl font-black text-navy">₹{totalDiscounts.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* GST Tax Filing Ledger */}
            <div className="lg:col-span-2 rounded-3xl bg-white border border-stone-100 p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
                <Landmark className="h-5 w-5 text-gold" />
                <h3 className="font-serif text-lg font-semibold text-navy">GST Tax ledger (SAC 996311)</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-stone-600">
                  <div>Taxable Base Tariff Value:</div>
                  <div className="text-right font-semibold text-navy">₹{totalBaseTariff.toLocaleString('en-IN')}</div>
                </div>

                <div className="pl-4 border-l-2 border-stone-200 text-xs text-stone-500 space-y-3">
                  <div className="flex justify-between">
                    <span>Central GST (CGST - Local stays)</span>
                    <span className="font-medium">₹{cgstTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>State GST (SGST - Local stays)</span>
                    <span className="font-medium">₹{sgstTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Integrated GST (IGST - Interstate)</span>
                    <span className="font-medium">₹{igstTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-navy text-sm pt-4 border-t border-stone-100">
                  <span>Total GST Tax Liability</span>
                  <span>₹{totalTaxes.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-stone-50 p-4 border border-stone-100 text-[10px] text-stone-500 leading-relaxed flex gap-2">
                <ShieldCheck className="h-4 w-4 text-gold flex-shrink-0" />
                <div>
                  <strong>Audit Compliance:</strong> GST calculations are split dynamically per Night Tariff slabs (12% for category rate &lt; ₹7,500; 18% for category rate &ge; ₹7,500) based on actual transaction values after discount coupon deductions.
                </div>
              </div>
            </div>

            {/* Room Categories Performance */}
            <div className="rounded-3xl bg-white border border-stone-100 p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
                <FileText className="h-5 w-5 text-gold" />
                <h3 className="font-serif text-lg font-semibold text-navy">Category Share</h3>
              </div>

              <div className="space-y-6">
                {Object.entries(categoryStats).map(([name, stats]) => (
                  <div key={name} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-stone-600">
                      <span>{name} ({stats.count} stays)</span>
                      <span>₹{stats.revenue.toLocaleString('en-IN')}</span>
                    </div>
                    {/* CSS Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full"
                        style={{
                          width: `${totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                
                {Object.keys(categoryStats).length === 0 && (
                  <div className="text-center py-8 text-xs text-stone-400 italic">
                    No stays registered yet to compute share.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
