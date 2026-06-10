'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { RoomCategory } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Search, Sparkles, MapPin, Coffee, ShieldCheck, Heart, Award, ArrowRight, Star, ChevronLeft, ChevronRight, Waves, Trees, Sun } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [categories, setCategories] = useState<RoomCategory[]>([]);

  // Set default dates and fetch categories
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    setCheckIn(today.toISOString().split('T')[0]);
    setCheckOut(tomorrow.toISOString().split('T')[0]);

    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data || []);
      } catch (e) {
        console.error('Failed to fetch categories:', e);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
    });
    router.push(`/rooms?${query.toString()}`);
  };

  const testimonials = [
    {
      text: "We booked the Premium Villa for our anniversary. The details were incredible – Ayurvedic tea upon check-in, sunset sailing organized by the concierge, and the most detailed billing system that accommodated our corporate input claims seamlessly.",
      name: "Aditi & Rohan Sen",
      location: "Mumbai",
      category: "Premium Villa",
      rating: 5
    },
    {
      text: "An exceptional sanctuary. The Royal Suite's private pool offers ultimate privacy. The staff is polite, and the local Goan cuisine is stellar. The print-ready GST tax invoices made our expense reimbursement super quick.",
      name: "Michael D'Souza",
      location: "London",
      category: "Royal Suite",
      rating: 5
    },
    {
      text: "We stayed for a week of wellness. The traditional spa packages combined with the beautiful, quiet surroundings made this our best holiday in years. Booking direct was seamless and included breakfast upgrades.",
      name: "Sophia Martinez",
      location: "Madrid",
      category: "Deluxe Suite",
      rating: 5
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-stone-50/30 font-sans">
      <Navbar />

      {/* Hero Section with Parallax and Framer Motion */}
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

        {/* Dynamic Wave bottom divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-stone-50 to-transparent" />
      </section>

      {/* Resort Highlights Section */}
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

      {/* 3D-feeling Parallax Feature Showcase */}
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

      {/* Room Categories catalog showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-bold text-gold uppercase tracking-wider">Stay With Us</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-navy">Accommodations of Distinction</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(categories.length > 0 
            ? categories 
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

      {/* Gallery Teaser */}
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

      {/* Interactive Testimonial Slider */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="space-y-8">
          <span className="text-xs font-bold text-gold uppercase tracking-wider block">Reviews</span>
          
          <div className="relative h-64 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 max-w-3xl"
              >
                <div className="flex gap-1 text-gold justify-center">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="font-serif text-lg sm:text-2xl text-navy italic leading-relaxed">
                  "{testimonials[activeTestimonial].text}"
                </p>
                <div>
                  <h4 className="text-sm font-bold text-navy">{testimonials[activeTestimonial].name}</h4>
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">{testimonials[activeTestimonial].location} — Stayed in {testimonials[activeTestimonial].category}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center items-center gap-4 pt-6">
            <button
              onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="h-10 w-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-stone-600" />
            </button>
            <div className="flex gap-1.5">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`h-2 w-2 rounded-full transition-all ${idx === activeTestimonial ? 'bg-gold w-4' : 'bg-stone-200'}`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="h-10 w-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-stone-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Direct Booking CTA */}
      <section className="bg-navy py-20 text-center text-white border-t border-navy-light relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full filter blur-3xl" />
        
        <div className="mx-auto max-w-4xl px-4 relative z-10 space-y-6">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">Embark on Your Goan Journey</h2>
          <p className="text-stone-300 text-sm max-w-xl mx-auto">
            Book directly on our official platform to unlock 10% instant discounts with custom coupon options and priority physical room allocations.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/rooms"
              className="rounded-full bg-gold hover:bg-gold-hover text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer"
            >
              Check Date Availability
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
            >
              Talk to Concierge
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-stone-400 py-8 text-center text-xs border-t border-navy-light mt-auto">
        <p>© 2026 Somnika Heritage Resort & Spa. All rights reserved.</p>
      </footer>
    </div>
  );
}
