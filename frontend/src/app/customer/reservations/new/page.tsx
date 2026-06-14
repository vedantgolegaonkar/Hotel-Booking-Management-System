'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar, Clock, Users, Utensils } from 'lucide-react';

export default function NewReservationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchWithAuth('/restaurant/categories');
        setCategories(data.filter((c: any) => c.isActive));
        if (data.length > 0) setCategoryId(data[0].id.toString());
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Check Availability
      const availData = await fetchWithAuth(`/restaurant/availability?date=${date}&time=${time}&guestCount=${guestCount}&categoryId=${categoryId}`);
      
      if (!availData.available) {
        setErrorMsg(availData.message);
        setLoading(false);
        return;
      }

      // 2. Create Reservation
      await fetchWithAuth('/restaurant/reservations', {
        method: 'POST',
        body: JSON.stringify({
          date,
          time,
          guestCount,
          categoryId: parseInt(categoryId),
          customerId: user?.id
        }),
      });

      router.push('/customer/reservations');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-serif text-3xl font-bold text-navy mb-8">Reserve a Table</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-3">
            <div className="font-bold">Error:</div>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3 h-5 w-5 text-stone-400" />
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-3 py-3 text-sm text-navy focus:border-gold focus:bg-white focus:outline-none" />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-3 h-5 w-5 text-stone-400" />
                <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-3 py-3 text-sm text-navy focus:border-gold focus:bg-white focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Guests</label>
              <div className="relative">
                <Users className="absolute left-4 top-3 h-5 w-5 text-stone-400" />
                <input type="number" required min="1" max="8" value={guestCount} onChange={(e) => setGuestCount(parseInt(e.target.value))} className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-3 py-3 text-sm text-navy focus:border-gold focus:bg-white focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Dining Area</label>
              <div className="relative">
                <Utensils className="absolute left-4 top-3 h-5 w-5 text-stone-400" />
                <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-3 py-3 text-sm text-navy focus:border-gold focus:bg-white focus:outline-none appearance-none">
                  <option value="" disabled>Select an area</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-gold hover:bg-yellow-600 text-white py-4 text-sm font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 mt-8">
            {loading && <Loader2 className="h-4 w-4 animate-spin text-white" />}
            Confirm Reservation
          </button>
        </form>
      </div>
    </div>
  );
}
