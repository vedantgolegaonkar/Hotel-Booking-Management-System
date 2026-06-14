'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/api-client';
import { Loader2, Calendar, Clock, Users, Receipt } from 'lucide-react';

export default function CustomerHistoryPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchReservations();
  }, [user]);

  const fetchReservations = async () => {
    try {
      const data = await fetchWithAuth(`/restaurant/reservations/customer/${user?.id}`);
      setReservations(data.filter((r: any) => ['COMPLETED', 'CANCELLED'].includes(r.status)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold text-navy">Reservation History</h1>
        <p className="text-stone-500 text-sm mt-1">Your past dining experiences.</p>
      </div>

      {reservations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-stone-100">
          <History className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy">No past reservations</h3>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservations.map((res: any) => (
            <div key={res.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 opacity-75">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                    res.status === 'COMPLETED' ? 'bg-navy/10 text-navy' : 'bg-red-100 text-red-700'
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Inline fallback icon if History isn't imported from lucide-react in the same way
function History(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;
}
