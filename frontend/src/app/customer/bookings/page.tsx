'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/api-client';
import { Loader2, CalendarDays, Key, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CustomerBookingsPage() {
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
      const activeBookings = data.filter((b: any) => 
        ['PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN'].includes(b.bookingStatus)
      );
      setBookings(activeBookings);
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
          <h1 className="font-serif text-3xl font-bold text-navy">Active Room Bookings</h1>
          <p className="text-stone-500 text-sm mt-1">Your upcoming hotel stays at Somnika.</p>
        </div>
        <Link 
          href="/rooms" 
          className="bg-navy hover:bg-navy-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Book a Room
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-stone-100">
          <CalendarDays className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy">No active room bookings</h3>
          <p className="text-stone-500 mt-2 text-sm">You do not have any upcoming hotel stays.</p>
          <Link href="/rooms" className="inline-block mt-6 px-6 py-2 bg-gold hover:bg-yellow-600 text-white font-medium rounded-xl transition-colors">
            Explore Rooms
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                    booking.bookingStatus === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                    booking.bookingStatus === 'CHECKED_IN' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {booking.bookingStatus.replace('_', ' ')}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-navy">Ref: {booking.bookingReference}</h3>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                  <div className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> In: {booking.checkInDate}</div>
                  <div className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> Out: {booking.checkOutDate}</div>
                  <div className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {booking.adultsCount} Adults, {booking.childrenCount} Children</div>
                </div>
                {booking.category && (
                   <div className="text-sm font-medium text-navy mt-1">
                     Room Category: {booking.category.name}
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
