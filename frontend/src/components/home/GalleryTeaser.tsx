import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function GalleryTeaser() {
  return (
    <section className="bg-stone-100/60 py-24 border-t border-stone-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 space-y-6 text-left">
          <span className="text-xs font-bold text-gold uppercase tracking-wider">Visual Sanctuary</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-navy">Capturing Pristine Moments</h2>
          <p className="text-stone-600 text-sm leading-relaxed">
            Explore static and dynamic clips of our luxury wellness pools, historic architecture, and local Goan cuisine.
          </p>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 rounded-xl bg-gold hover:bg-gold-hover text-white px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
          >
            Browse Gallery <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="lg:col-span-7 grid grid-cols-12 gap-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="col-span-6 h-56 rounded-3xl overflow-hidden shadow-sm"
          >
            <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80" alt="Resort courtyard" className="w-full h-full object-cover" />
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="col-span-6 h-56 rounded-3xl overflow-hidden shadow-sm mt-8"
          >
            <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80" alt="Spa and Wellness pool" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
