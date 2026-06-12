import Link from 'next/link';

export default function CallToAction() {
  return (
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
  );
}
