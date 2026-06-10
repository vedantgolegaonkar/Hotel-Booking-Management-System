'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { RoomCategory } from '@/lib/types';
import { Loader2, AlertCircle, Wifi, Coffee, Tv, Landmark, ArrowRight, User } from 'lucide-react';

function RoomsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Get date query parameters
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '2';

  useEffect(() => {
    fetchRoomCategories();
  }, [searchParams]);

  const fetchRoomCategories = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (checkIn && checkOut) {
        const data = await api.checkAvailability(checkIn, checkOut, Number(guests));
        setCategories(data.categories || []);
      } else {
        const data = await api.getCategories();
        setCategories(data || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch room categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (cat: RoomCategory) => {
    const query = new URLSearchParams({
      categoryId: String(cat.id),
      checkIn: checkIn || new Date().toISOString().split('T')[0],
      checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
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

  return (
    <div className="space-y-12">
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="h-10 w-10 text-gold animate-spin mx-auto mb-3" />
          <span className="text-sm font-semibold text-stone-500">Querying available categories...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm p-6">
          <AlertCircle className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-semibold text-navy">No Categories Available</h3>
          <p className="text-stone-500 text-sm max-w-sm mx-auto">
            Try adjusting your search date ranges to look for available suites.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-3xl bg-white border border-stone-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="relative h-60 bg-stone-100">
                <img 
                  src={cat.images?.[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80'} 
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
                {cat.availableCount !== undefined && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-navy uppercase tracking-wider">
                    {cat.availableCount} available
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6 flex-grow flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="font-serif text-xl font-bold text-navy">{cat.name}</h3>
                  <p className="text-xs text-stone-500 line-clamp-2">{cat.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {cat.amenities.slice(0, 4).map((amenity, idx) => {
                      const Icon = amenityIcons[amenity] || Coffee;
                      return (
                        <span key={`${cat.id}-${amenity}-${idx}`} className="inline-flex items-center gap-1 bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-lg text-[10px] text-stone-600 font-medium">
                          <Icon className="h-3.5 w-3.5 text-gold" />
                          {amenity}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-stone-400 font-bold uppercase block tracking-wider">Tariff / Night</span>
                    <span className="text-xl font-extrabold text-navy">₹{cat.basePrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/rooms/${cat.id}`)}
                      className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-navy hover:bg-stone-50 transition-colors"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleBook(cat)}
                      className="rounded-xl bg-gold hover:bg-gold-hover text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      Book <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoomsPage() {
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
          <RoomsContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-navy text-stone-400 py-8 text-center text-xs border-t border-navy-light mt-12">
        <p>© 2026 Somnika Heritage Resort & Spa. All rights reserved.</p>
      </footer>
    </div>
  );
}
