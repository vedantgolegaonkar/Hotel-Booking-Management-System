'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { RoomCategory } from '@/lib/types';
import { Calendar, Loader2, ArrowRight } from 'lucide-react';

export default function RoomAvailabilityWidget({ categoryId, basePrice }: { categoryId: number, basePrice: number }) {
  const router = useRouter();
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [availabilityMsg, setAvailabilityMsg] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    // Set default dates
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    setCheckIn(today.toISOString().split('T')[0]);
    setCheckOut(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleCheckAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckingAvailability(true);
    setAvailabilityMsg('');
    try {
      const data = await api.checkAvailability(checkIn, checkOut, guests);
      const match = data.categories.find((c: RoomCategory) => c.id === categoryId);
      if (match && match.availableCount > 0) {
        setAvailabilityMsg(`Success! ${match.availableCount} rooms of this category are available for your select dates.`);
      } else {
        setAvailabilityMsg('Sorry, this category is fully occupied for the selected dates.');
      }
    } catch (err: any) {
      setAvailabilityMsg(err.message || 'Error checking availability.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBookRedirect = () => {
    const query = new URLSearchParams({
      categoryId: String(categoryId),
      checkIn,
      checkOut,
      guests: String(guests),
    });
    router.push(`/book?${query.toString()}`);
  };

  return (
    <div className="rounded-3xl bg-white border border-stone-100 p-8 shadow-sm space-y-6 h-fit">
      <div>
        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Rate per Night</span>
        <span className="text-3xl font-black text-navy">₹{basePrice.toLocaleString('en-IN')}</span>
        <span className="text-[10px] text-stone-400 block mt-1">+ Indian GST (12% / 18% based on tariff slabs)</span>
      </div>

      {/* Instant check form */}
      <form onSubmit={handleCheckAvailability} className="space-y-4 border-t border-stone-100 pt-6">
        <h4 className="font-serif text-base font-semibold text-navy">Check Availability</h4>
        
        <div>
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Check-In</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-3 py-2.5 text-xs font-semibold text-navy focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Check-Out</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <input
              type="date"
              required
              min={checkIn || new Date().toISOString().split('T')[0]}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-3 py-2.5 text-xs font-semibold text-navy focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Guests Count</label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-xs font-semibold text-navy focus:outline-none"
          >
            <option value={1}>1 Guest</option>
            <option value={2}>2 Guests</option>
            <option value={3}>3 Guests</option>
            <option value={4}>4 Guests</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={checkingAvailability}
          className="w-full rounded-xl bg-navy hover:bg-navy-light text-white py-3 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
        >
          {checkingAvailability ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Check Dates'
          )}
        </button>
      </form>

      {availabilityMsg && (
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-xs text-navy space-y-3">
          <p className="leading-relaxed font-semibold">{availabilityMsg}</p>
          {availabilityMsg.startsWith('Success') && (
            <button
              onClick={handleBookRedirect}
              className="w-full rounded-xl bg-gold hover:bg-gold-hover text-white py-2.5 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              Book This Stay <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
