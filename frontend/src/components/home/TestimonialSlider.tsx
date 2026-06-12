import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function TestimonialSlider() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
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
  );
}
