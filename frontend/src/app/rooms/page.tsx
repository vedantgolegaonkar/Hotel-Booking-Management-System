import { roomsService } from '@/lib/services/rooms.service';
import { bookingService } from '@/lib/services/booking.service';
import Navbar from '@/components/Navbar';
import RoomsClientContent from '@/components/RoomsClientContent';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Rooms & Suites | Somnika Resort',
  description: 'Browse our catalog of modern deluxe rooms, family villas, and private suites.',
};

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const checkIn = typeof searchParams.checkIn === 'string' ? searchParams.checkIn : undefined;
  const checkOut = typeof searchParams.checkOut === 'string' ? searchParams.checkOut : undefined;
  const guests = typeof searchParams.guests === 'string' ? Number(searchParams.guests) : undefined;

  let initialCategories = [];
  try {
    if (checkIn && checkOut) {
      const data = await bookingService.checkAvailability(checkIn, checkOut, guests || 2);
      initialCategories = data.categories || [];
    } else {
      const data = await roomsService.getCategories();
      initialCategories = data || [];
    }
  } catch (err) {
    console.error('Failed to fetch initial categories on server:', err);
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50/30">
      <Navbar />

      {/* Hero Header */}
      <section className="relative luxury-gradient py-20 text-white text-center">
        <div className="mx-auto max-w-4xl px-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold mb-3 block">
            Luxurious Lodging
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Rooms & Suite Categories
          </h1>
          <p className="text-stone-300 text-sm max-w-xl mx-auto">
            Browse our catalog of modern deluxe rooms, family villas, and private suites.
          </p>
        </div>
      </section>

      <main className="flex-grow mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <Suspense fallback={
          <div className="text-center py-20">
            <Loader2 className="h-10 w-10 text-gold animate-spin mx-auto mb-3" />
            <span className="text-sm font-semibold text-stone-500">Loading rooms...</span>
          </div>
        }>
          <RoomsClientContent initialCategories={initialCategories} />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-navy text-stone-400 py-8 text-center text-xs border-t border-navy-light mt-12">
        <p>© 2026 Somnika Heritage Resort & Spa. All rights reserved.</p>
      </footer>
    </div>
  );
}
