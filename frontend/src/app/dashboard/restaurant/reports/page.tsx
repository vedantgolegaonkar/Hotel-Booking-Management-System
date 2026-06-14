'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { Loader2, TrendingUp, Users, DollarSign, Utensils } from 'lucide-react';

export default function RestaurantReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReservations: 0,
    totalGuests: 0,
    revenue: 0,
    completedBills: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [reservations, bills] = await Promise.all([
        fetchWithAuth('/restaurant/reservations'),
        fetchWithAuth('/restaurant/billing')
      ]);

      const completedReservations = reservations.filter((r: any) => r.status === 'COMPLETED');
      const totalGuests = completedReservations.reduce((acc: number, r: any) => acc + r.guestCount, 0);
      const revenue = bills.reduce((acc: number, b: any) => acc + b.totalAmount, 0);

      setStats({
        totalReservations: reservations.length,
        totalGuests,
        revenue,
        completedBills: bills.length
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">Restaurant Reports</h1>
          <p className="text-stone-500 text-sm mt-1">Analytics and overview of dining operations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Utensils className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Reservations</p>
            <p className="text-2xl font-bold text-navy">{stats.totalReservations}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Guests Served</p>
            <p className="text-2xl font-bold text-navy">{stats.totalGuests}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-bold text-navy">${stats.revenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Completed Bills</p>
            <p className="text-2xl font-bold text-navy">{stats.completedBills}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex justify-center items-center h-64 text-stone-400 text-sm">
        More detailed charts and graphs will be populated as dining data increases.
      </div>
    </div>
  );
}
