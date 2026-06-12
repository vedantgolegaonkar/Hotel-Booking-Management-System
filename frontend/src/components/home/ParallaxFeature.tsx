import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function ParallaxFeature() {
  return (
    <section className="bg-navy py-24 text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-15">
        <img 
          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
          alt="Portuguese Heritage arches"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-6 space-y-6 text-left"
        >
          <span className="text-xs font-bold text-gold uppercase tracking-wider">Coastal Sanctuary</span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold leading-tight">Timeless Portuguese Architecture Meet Goan Serenity</h2>
          <p className="text-stone-300 text-sm leading-relaxed">
            Every archway, tiled veranda, and open courtyard at Somnika tells a story. Preserved Goan heritage meets premium modern comforts to create an unforgettable retreat.
          </p>
          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10">
            <div>
              <span className="text-2xl font-bold text-gold block">18+</span>
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Heritage Villas</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-gold block">100%</span>
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Ayurvedic Spa</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-gold block">30m</span>
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">To Beachfront</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="lg:col-span-6 relative"
        >
          {/* Interactive Image overlapping layout */}
          <div className="relative h-96 sm:h-[450px] w-full rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80" 
              alt="Royal Suite interior" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
          </div>
          
          {/* Floating details badge */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            className="absolute -bottom-6 -left-6 bg-white text-navy p-6 rounded-2xl shadow-xl border border-stone-100 hidden sm:block max-w-xs text-left"
          >
            <div className="flex gap-1.5 text-gold mb-2">
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
            </div>
            <p className="text-xs font-serif font-bold italic text-navy">"The private pools and seaside suites offer an unmatched level of Goan hospitality."</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
