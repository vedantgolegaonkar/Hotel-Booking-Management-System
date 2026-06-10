'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { RoomCategory } from '@/lib/types';
import { Loader2, AlertCircle, Wifi, Coffee, Tv, Landmark, Calendar, ShieldCheck, ArrowRight, User } from 'lucide-react';

export default function RoomDetailPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const categoryId = Number(resolvedParams.categoryId);

  const [category, setCategory] = useState<RoomCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Availability calendar widget
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [availabilityMsg, setAvailabilityMsg] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    fetchCategoryDetails();
    
    // Set default dates
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    setCheckIn(today.toISOString().split('T')[0]);
    setCheckOut(tomorrow.toISOString().split('T')[0]);
  }, [categoryId]);

  const fetchCategoryDetails = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await api.getCategory(categoryId);
      setCategory(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load room category details.');
    } finally {
      setLoading(false);
    }
  };

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

  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'AC': Tv,
    'Breakfast': Coffee,
    'Private Pool': Landmark,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-stone-50/30">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="h-10 w-10 text-gold animate-spin mx-auto" />
            <span className="text-sm font-semibold text-stone-500 block">Loading category specifications...</span>
          </div>
        </div>
      </div>
    );
  }

  if (errorMsg || !category) {
    return (
      <div className="flex min-h-screen flex-col bg-stone-50/30">
        <Navbar />
        <div className="flex-grow max-w-xl mx-auto py-20 px-4">
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMsg || 'Room category not found.'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50/30">
      <Navbar />

      {/* Main Container */}
      <main className="flex-grow mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main info, description, gallery */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative h-[450px] rounded-3xl overflow-hidden shadow-sm border border-stone-100 bg-stone-100">
              <img 
                src={category.images?.[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80'} 
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy">{category.name}</h1>
              <div className="flex items-center gap-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                <span className="flex items-center gap-1"><User className="h-4 w-4 text-gold" /> Up to {category.capacity} guests</span>
                <span>•</span>
                <span>SAC 996311</span>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">{category.description}</p>
            </div>

            {/* Features & Amenities */}
            <div className="pt-8 border-t border-stone-100 space-y-4">
              <h3 className="font-serif text-xl font-bold text-navy">Included Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {category.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity] || Coffee;
                  return (
                    <div key={amenity} className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-stone-100 shadow-sm text-xs font-semibold text-navy">
                      <Icon className="h-5 w-5 text-gold flex-shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pricing & Availability Sidebar widget */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white border border-stone-100 p-8 shadow-sm space-y-6 h-fit">
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Rate per Night</span>
                <span className="text-3xl font-black text-navy">₹{category.basePrice.toLocaleString('en-IN')}</span>
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

            <div className="rounded-3xl bg-stone-50 border border-stone-100 p-6 text-[10px] text-stone-500 leading-relaxed flex gap-2">
              <ShieldCheck className="h-4 w-4 text-gold flex-shrink-0" />
              <div>
                <strong>Cancellation Policy:</strong> Free cancellation up to 48 hours before check-in. Subject to dynamic seasonal adjustments during peak Indian festival holidays.
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-navy text-stone-400 py-8 text-center text-xs border-t border-navy-light mt-12">
        <p>© 2026 Somnika Heritage Resort & Spa. All rights reserved.</p>
      </footer>
    </div>
  );
}
