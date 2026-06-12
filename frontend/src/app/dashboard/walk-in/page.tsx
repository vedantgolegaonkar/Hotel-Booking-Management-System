'use client';

import { bookingService } from '@/lib/services/booking.service';
import { paymentService } from '@/lib/services/payment.service';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoomCategory, Booking } from '@/lib/types';
import { Loader2, AlertCircle, Calendar, Users, CheckCircle, ArrowRight } from 'lucide-react';

export default function WalkInPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);

  // Search parameters
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [searched, setSearched] = useState(false);

  // Selected details
  const [selectedCat, setSelectedCat] = useState<RoomCategory | null>(null);
  const [guestDetails, setGuestDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    address: 'Resort Walk-In',
    city: 'Goa',
    stateCode: 'GA',
    gstin: '',
  });

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    setCheckIn(today.toISOString().split('T')[0]);
    setCheckOut(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSearched(true);
    setSelectedCat(null);
    setSuccessBooking(null);
    try {
      const data = await bookingService.checkAvailability(checkIn, checkOut, guests);
      setCategories(data.categories || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        categoryId: selectedCat.id,
        checkIn: checkIn,
        checkOut: checkOut,
        adults: guests,
        children: 0,
        firstName: guestDetails.firstName,
        lastName: guestDetails.lastName,
        email: guestDetails.email,
        mobile: guestDetails.mobile,
        address: guestDetails.address || undefined,
        city: guestDetails.city || undefined,
        stateCode: guestDetails.stateCode,
        gstin: guestDetails.gstin || undefined,
      };
      const booking = await bookingService.initiateBooking(payload);
      // Automatically confirm the walk-in booking since payment is done at the desk (cash/card)
      await paymentService.confirmPaymentDirectly({
        razorpayOrderId: booking.bookingReference,
        razorpayPaymentId: 'walkin_' + Math.random().toString(36).substring(2, 10),
      });
      const confirmed = await bookingService.getBooking(booking.id);
      setSuccessBooking(confirmed);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create reservation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold text-navy">Walk-In Booking Wizard</h1>
        <p className="text-sm text-stone-500">Create direct desk reservations and allocate room categories.</p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successBooking ? (
        <div className="rounded-3xl bg-white border border-stone-200 p-8 shadow-sm space-y-6 text-center">
          <CheckCircle className="h-16 w-16 text-success mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-navy">Walk-In Booking Locked!</h2>
          <p className="text-xs text-stone-500">
            Booking reference: <strong>{successBooking.bookingReference}</strong> has been created.
          </p>
          <div className="pt-4 border-t border-stone-100 flex justify-center gap-4">
            <button
              onClick={() => {
                setSuccessBooking(null);
                setSearched(false);
                setSelectedCat(null);
              }}
              className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-navy hover:bg-stone-50"
            >
              New Reservation
            </button>
            <button
              onClick={() => router.push('/dashboard/reception')}
              className="rounded-xl bg-navy text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-navy-light"
            >
              Go to Reception Daily Sheet
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Query widget */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Check-In</label>
                <input
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-navy focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Check-Out</label>
                <input
                  type="date"
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-navy focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-navy focus:outline-none"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4 Guests</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-gold hover:bg-gold-hover text-white py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search Category'}
              </button>
            </form>
          </div>

          {/* Catalog selection */}
          {searched && !selectedCat && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-navy">{cat.name}</h3>
                    <p className="text-[10px] text-stone-400 font-semibold uppercase">{cat.capacity} Guests Max</p>
                    <p className="text-xl font-extrabold text-navy mt-2">₹{cat.basePrice.toLocaleString('en-IN')}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCat(cat)}
                    disabled={cat.availableCount === 0}
                    className="w-full rounded-xl bg-navy hover:bg-navy-light text-white py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                  >
                    Select Room <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Guest Form */}
          {selectedCat && (
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 space-y-6">
              <h3 className="font-serif text-xl font-bold text-navy">Enter profile details for {selectedCat.name}</h3>
              <form onSubmit={handleBookSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">First Name</label>
                    <input
                      type="text"
                      required
                      value={guestDetails.firstName}
                      onChange={(e) => setGuestDetails({...guestDetails, firstName: e.target.value})}
                      className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Last Name</label>
                    <input
                      type="text"
                      required
                      value={guestDetails.lastName}
                      onChange={(e) => setGuestDetails({...guestDetails, lastName: e.target.value})}
                      className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Email</label>
                    <input
                      type="email"
                      required
                      value={guestDetails.email}
                      onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                      className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Mobile Phone</label>
                    <input
                      type="tel"
                      required
                      value={guestDetails.mobile}
                      onChange={(e) => setGuestDetails({...guestDetails, mobile: e.target.value})}
                      className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-stone-100 pt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedCat(null)}
                    className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-500"
                  >
                    Change Room
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gold hover:bg-gold-hover text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
                  >
                    Confirm desk booking
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
