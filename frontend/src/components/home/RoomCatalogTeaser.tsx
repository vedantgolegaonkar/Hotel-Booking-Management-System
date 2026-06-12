import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { RoomCategory } from '@/lib/types';

export default function RoomCatalogTeaser({ initialCategories }: { initialCategories: RoomCategory[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-bold text-gold uppercase tracking-wider">Stay With Us</span>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-navy">Accommodations of Distinction</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(initialCategories.length > 0 
          ? initialCategories 
          : [
              {
                id: 1,
                name: "Deluxe Room",
                basePrice: 6500,
                capacity: 2,
                images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427"]
              },
              {
                id: 2,
                name: "Premium Room",
                basePrice: 9500,
                capacity: 3,
                images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd"]
              },
              {
                id: 3,
                name: "Suite Room",
                basePrice: 14500,
                capacity: 4,
                images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a"]
              }
            ]
        ).map((cat, idx) => (
          <motion.div
            key={cat.id || idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15, duration: 0.8 }}
            className="group bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="h-64 overflow-hidden relative">
              <img 
                src={cat.images?.[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80'} 
                alt={cat.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-extrabold text-navy shadow-sm">
                ₹{cat.basePrice.toLocaleString('en-IN')}/night
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-navy">{cat.name}</h3>
                <p className="text-[11px] text-stone-500 font-bold uppercase tracking-wider mt-1">
                  Capacity: {cat.capacity} {cat.capacity === 1 ? 'Guest' : 'Guests'}
                </p>
              </div>
              <Link
                href={cat.id ? `/rooms/${cat.id}` : "/rooms"}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold hover:text-gold-hover transition-colors"
              >
                Explore Details <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
