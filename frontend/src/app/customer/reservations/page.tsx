'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/api-client';
import { Loader2, Calendar, Clock, Users, XCircle, CheckCircle } from 'lucide-react';

export default function CustomerReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const fetchReservations = async () => {
    try {
      const data = await fetchWithAuth(`/restaurant/reservations/customer/${user?.id}`);
      setReservations(data.filter((r: any) => !['COMPLETED', 'CANCELLED'].includes(r.status)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await fetchWithAuth(`/restaurant/reservations/${id}`, {
        method: 'DELETE',
      });
      fetchReservations();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">Active Reservations</h1>
          <p className="text-stone-500 text-sm mt-1">Your upcoming dining experiences at Somnika.</p>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-stone-100">
          <Calendar className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy">No active reservations</h3>
          <p className="text-stone-500 mt-2 text-sm">You do not have any upcoming restaurant reservations.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservations.map((res: any) => (
            <div key={res.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                    res.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {res.status}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-navy">{res.category?.name}</h3>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                  <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {res.reservationDate}</div>
                  <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {res.reservationTime}</div>
                  <div className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {res.guestCount} Guests</div>
                </div>
              </div>
              <button
                onClick={() => handleCancel(res.id)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-semibold transition-colors"
              >
                <XCircle className="h-4 w-4" /> Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
