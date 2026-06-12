import { motion } from 'framer-motion';
import { Calendar, Users, Search, Sparkles } from 'lucide-react';
import { FormEvent } from 'react';

export default function HeroSection({
  checkIn,
  checkOut,
  guests,
  setCheckIn,
  setCheckOut,
  setGuests,
  handleSearch,
}: {
  checkIn: string;
  checkOut: string;
  guests: number;
  setCheckIn: (val: string) => void;
  setCheckOut: (val: string) => void;
  setGuests: (val: number) => void;
  handleSearch: (e: FormEvent) => void;
}) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center py-24 text-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <motion.div 
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 0.45 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
          className="w-full h-full"
        >
          <img 
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=90"
            alt="Somnika Main Infinity Pool"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/40 to-stone-50/20" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        <motion.span 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="inline-flex items-center gap-2 rounded-full bg-gold/15 border border-gold/30 px-4 py-2 text-xs font-bold text-gold uppercase tracking-widest"
        >
          <Sparkles className="h-4 w-4 animate-spin-slow" /> A Sanctuary for the Discerning Traveler
        </motion.span>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="font-serif text-5xl sm:text-7xl font-bold tracking-tight text-navy max-w-5xl mx-auto leading-tight"
        >
          A Sanctuary for the Soul on the Goa Shore
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mx-auto max-w-2xl text-stone-700 text-sm sm:text-lg leading-relaxed font-medium"
        >
          Unwind in luxury villa suites, temperature-controlled oceanfront pools, and traditional Ayurvedic wellness retreats. Book direct for complimentary upgrades.
        </motion.p>

        {/* Availability Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mx-auto max-w-4xl rounded-3xl bg-white/90 backdrop-blur-md p-6 sm:p-8 shadow-2xl border border-stone-200/50 mt-12"
        >
          <form onSubmit={handleSearch} className="grid grid-cols-1 gap-6 sm:grid-cols-4 items-end">
            <div className="text-left">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">
                Arrival Check-In
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-3 py-3 text-xs font-bold text-navy focus:border-gold focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="text-left">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">
                Departure Check-Out
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                <input
                  type="date"
                  required
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-3 py-3 text-xs font-bold text-navy focus:border-gold focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="text-left">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">
                Stay Occupancy
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-3 py-3 text-xs font-bold text-navy focus:border-gold focus:bg-white focus:outline-none appearance-none cursor-pointer"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4 Guests</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full rounded-xl bg-navy hover:bg-navy-light text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search className="h-4 w-4 text-gold" /> Search Now
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-stone-50 to-transparent" />
    </section>
  );
}
