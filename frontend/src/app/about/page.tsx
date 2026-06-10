'use client';

import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Compass, ShieldCheck, Heart, Award, MapPin, Coffee, Trees, Waves } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50/30 font-sans">
      <Navbar />

      {/* Header section with Parallax visual */}
      <section className="relative min-h-[50vh] flex items-center justify-center py-20 text-center overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 z-0 opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80" 
            alt="Somnika Courtyard" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-navy/60" />
        </div>
        
        <div className="mx-auto max-w-4xl px-4 relative z-10 space-y-4">
          <motion.span 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-xs font-bold uppercase tracking-widest text-gold mb-2 block"
          >
            Our Heritage
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-serif text-4xl sm:text-6xl font-bold tracking-tight"
          >
            The Somnika Philosophy
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed"
          >
            A sanctuary nestled in the pristine beaches of Goa, blending timeless Portuguese heritage with contemporary Indian hospitality.
          </motion.p>
        </div>
      </section>

      {/* Core History & Concept story layout */}
      <main className="flex-grow mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 space-y-24">
        
        {/* Story split grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            <span className="text-xs font-bold text-gold uppercase tracking-wider">Our Story</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-navy leading-tight">
              Decades of Pure Tranquility
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              Established in the late 1990s as a family-run heritage villa, Somnika has grown into a world-class luxury boutique resort. Our structures preserve traditional Goan architectural aesthetics with red-clay tiles, high-arched windows, and open-to-sky courtyards.
            </p>
            <p className="text-stone-600 text-sm leading-relaxed">
              Our mission is to create custom guest stays where time stands still. From organic spa ingredients grown in our private orchards to custom heritage walks, every detail is handled with personal care.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative h-96 rounded-3xl overflow-hidden shadow-xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80" 
              alt="Resort Courtyard" 
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Facilities Section */}
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-gold uppercase tracking-wider">World Class Facilities</span>
            <h2 className="font-serif text-3xl font-bold text-navy">Exclusive Guest Services</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Coffee, title: "Artisanal Cafe", desc: "Traditional morning brews, fresh fruits, and handpicked local blends." },
              { icon: ShieldCheck, title: "Ayurvedic Spa", desc: "Personalized massage therapy and steam chambers overseen by practitioners." },
              { icon: Trees, title: "Heritage Gardens", desc: "Manicured orchards containing indigenous flora and private seating nooks." },
              { icon: Waves, title: "Lagoon Pools", desc: "Temperature-controlled swimming chambers mirroring standard coastal vistas." }
            ].map((facility, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-4 text-left"
              >
                <div className="h-12 w-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
                  <facility.icon className="h-6 w-6" />
                </div>
                <h4 className="font-serif text-lg font-bold text-navy">{facility.title}</h4>
                <p className="text-xs text-stone-500 leading-relaxed">{facility.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Brand Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-stone-100">
          <div className="space-y-3 text-left">
            <Heart className="h-8 w-8 text-gold" />
            <h3 className="font-serif text-xl font-bold text-navy">Sincere Hospitality</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Every guest is welcomed with local shell garlands and custom refreshments, ensuring immediate comfort.
            </p>
          </div>
          <div className="space-y-3 text-left">
            <ShieldCheck className="h-8 w-8 text-gold" />
            <h3 className="font-serif text-xl font-bold text-navy">Sustainable Luxury</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              We employ solar water heating, low-waste composting, and source organic produce from local fishing cooperatives.
            </p>
          </div>
          <div className="space-y-3 text-left">
            <Award className="h-8 w-8 text-gold" />
            <h3 className="font-serif text-xl font-bold text-navy">Award Winning</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Recognized as one of India's best eco-luxury boutiques by Condé Nast Traveler for two consecutive years.
            </p>
          </div>
        </div>

        {/* 3D Walkthrough Feature */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="rounded-3xl bg-navy text-white p-8 sm:p-16 shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10 max-w-xl space-y-6 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Interactive Experience</span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold">Virtual 3D Walkthrough</h3>
            <p className="text-sm text-stone-300 leading-relaxed">
              Take a virtual high-fidelity tour of our beachfront villas, swimming pools, and spa suites before checking in.
            </p>
            <button className="rounded-full bg-gold hover:bg-gold-hover px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-all mt-4 text-white shadow-md hover:shadow-lg cursor-pointer">
              Launch Virtual Tour
            </button>
          </div>
          
          <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block opacity-40">
            <img 
              src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80" 
              alt="Pool side view"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-navy text-stone-400 py-8 text-center text-xs border-t border-navy-light mt-12">
        <p>© 2026 Somnika Heritage Resort & Spa. All rights reserved.</p>
      </footer>
    </div>
  );
}
