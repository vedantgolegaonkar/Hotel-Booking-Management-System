import { roomsService } from '@/lib/services/rooms.service';
import Navbar from '@/components/Navbar';
import { AlertCircle } from 'lucide-react';
import BookingWizardClient from '@/components/BookingWizardClient';

export const metadata = {
  title: 'Secure Checkout | Somnika Resort',
  description: 'Book your luxury stay at Somnika Resort, Goa.',
};

export default async function BookingWizardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const categoryId = Number(resolvedParams.categoryId || '1');
  const checkIn = (resolvedParams.checkIn as string) || new Date().toISOString().split('T')[0];
  const checkOut = (resolvedParams.checkOut as string) || new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
  const guests = Number(resolvedParams.guests || '2');

  let category = null;
  let errorMsg = '';

  try {
    category = await roomsService.getCategory(categoryId);
  } catch (err: any) {
    errorMsg = 'Failed to load booking portal details. Please return to the homepage and try again.';
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50/30">
      <Navbar />

      <section className="relative luxury-gradient py-12 text-white text-center">
        <div className="mx-auto max-w-4xl px-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold mb-2 block">
            Direct Reservation
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Somnika Booking Gateway
          </h1>
        </div>
      </section>

      <main className="flex-grow mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        {errorMsg ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-sm text-red-600 max-w-xl mx-auto">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : (
          <BookingWizardClient 
            category={category}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
          />
        )}
      </main>

      <footer className="bg-navy text-stone-400 py-8 text-center text-xs border-t border-navy-light">
        <p>© 2026 Somnika Heritage Resort & Spa. All rights reserved.</p>
      </footer>
    </div>
  );
}
