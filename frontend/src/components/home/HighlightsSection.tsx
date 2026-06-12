import { motion } from 'framer-motion';
import { Coffee, Waves, Award } from 'lucide-react';

export default function HighlightsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-bold text-gold uppercase tracking-wider block"
        >
          The Somnika Experience
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-serif text-3xl sm:text-5xl font-bold text-navy"
        >
          Curated Resort Highlights
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-stone-500 text-sm sm:text-base max-w-2xl mx-auto"
        >
          Immerse yourself in carefully designed spaces, blending historic architecture with bespoke services.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: Coffee,
            title: "Ayurvedic Spa Oasis",
            text: "Rebalance with organic wellness treatments, beachfront open-air therapy suites, and custom herbal steam baths.",
            bg: "bg-amber-50/50"
          },
          {
            icon: Waves,
            title: "Private Infinity Lagoons",
            text: "Soak in stunning sunsets from temperature-controlled private suites or walk directly onto private Vagator beachfront.",
            bg: "bg-blue-50/50"
          },
          {
            icon: Award,
            title: "Epicurean Dining Pavilion",
            text: "Indulge in freshly caught coastal seafood, woodfired local Goan delicacies, and vintage wine selections curated daily.",
            bg: "bg-stone-50"
          }
        ].map((highlight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2, duration: 0.8 }}
            whileHover={{ y: -8 }}
            className={`rounded-3xl border border-stone-100 p-8 shadow-sm space-y-6 ${highlight.bg} hover:shadow-lg transition-all`}
          >
            <div className="h-14 w-14 rounded-2xl bg-gold/15 text-gold flex items-center justify-center">
              <highlight.icon className="h-7 w-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-navy">{highlight.title}</h3>
            <p className="text-xs text-stone-500 leading-relaxed">{highlight.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
