'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/api-client';
import { Loader2, History, CalendarDays, Users } from 'lucide-react';

export default function CustomerBookingsHistoryPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.email) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const data = await fetchWithAuth(`/bookings/customer/${user?.email}`);
      const historyBookings = data.filter((b: any) => 
        ['CHECKED_OUT', 'CANCELLED', 'EXPIRED', 'TIMEOUT_REFUNDED'].includes(b.bookingStatus)
      );
      setBookings(historyBookings);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">Room Bookings History</h1>
          <p className="text-stone-500 text-sm mt-1">Your past hotel stays at Somnika.</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-stone-100">
          <History className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy">No past bookings</h3>
          <p className="text-stone-500 mt-2 text-sm">You do not have any past hotel stays with us.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="bg-stone-50 rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 opacity-80 hover:opacity-100 transition-opacity">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                    booking.bookingStatus === 'CHECKED_OUT' ? 'bg-gray-200 text-gray-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {booking.bookingStatus.replace('_', ' ')}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-stone-600">Ref: {booking.bookingReference}</h3>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                  <div className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> In: {booking.checkInDate}</div>
                  <div className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> Out: {booking.checkOutDate}</div>
                  <div className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {booking.adultsCount} Adults, {booking.childrenCount} Children</div>
                </div>
                {booking.category && (
                   <div className="text-sm font-medium text-stone-500 mt-1">
                     Room Category: {booking.category.name}
                   </div>
                )}
              </div>
              <div className="text-right">
                 <div className="text-xs font-bold text-stone-400 uppercase">Grand Total</div>
                 <div className="text-lg font-bold text-navy">${booking.grandTotal?.toFixed(2) || '0.00'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
