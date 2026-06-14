'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { Loader2, Search, Edit2, Calendar } from 'lucide-react';

export default function StaffReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const data = await fetchWithAuth('/restaurant/reservations');
      setReservations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetchWithAuth(`/restaurant/reservations/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchReservations();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">Restaurant Reservations</h1>
          <p className="text-stone-500 text-sm mt-1">Manage dining reservations.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 border-b border-stone-100 text-stone-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Table</th>
                <th className="px-6 py-4 font-semibold">Guests</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {reservations.map((res: any) => (
                <tr key={res.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-navy">{res.reservationDate}</div>
                    <div className="text-stone-500 text-xs">{res.reservationTime}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-navy">{res.customer?.firstName} {res.customer?.lastName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-navy">{res.category?.name}</div>
                    <div className="text-stone-500 text-xs">Table {res.table?.tableNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-stone-600">{res.guestCount}</td>
                  <td className="px-6 py-4">
                    <select
                      value={res.status}
                      onChange={(e) => updateStatus(res.id, e.target.value)}
                      className={`text-xs font-bold uppercase tracking-wider rounded-md px-2 py-1 border-0 ${
                        res.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        res.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                        res.status === 'SEATED' ? 'bg-purple-100 text-purple-700' :
                        res.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SEATED">SEATED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* Add edit or view details button here if needed */}
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                    No reservations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
