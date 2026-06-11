'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Mail, Phone, MapPin, Send, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('https://formsubmit.co/ajax/vedantgolegaonkar@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          _subject: `New Website Inquiry from ${formData.name}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message. Please try again later.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-stone-50/30">
      <Navbar />

      {/* Hero Header */}
      <section className="relative luxury-gradient py-20 text-white text-center">
        <div className="mx-auto max-w-4xl px-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold mb-3 block">
            Reach Out
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Connect With Our Concierge
          </h1>
          <p className="text-stone-300 text-sm max-w-xl mx-auto">
            Have special requirements, corporate bookings, or events? We are here to plan your perfect stay.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <main className="flex-grow mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Contact Details Cards */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-bold text-navy mb-4">Contact Info</h3>
            
            <div className="rounded-3xl bg-white border border-stone-100 p-6 shadow-sm flex items-start gap-4">
              <Phone className="h-6 w-6 text-gold flex-shrink-0 mt-1" />
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Reservations desk</span>
                <span className="text-sm font-semibold text-navy">+91 832 999 8888</span>
                <span className="text-xs text-stone-500 block">Available 24/7 for guest assistance</span>
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-stone-100 p-6 shadow-sm flex items-start gap-4">
              <Mail className="h-6 w-6 text-gold flex-shrink-0 mt-1" />
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Email Inquiries</span>
                <span className="text-sm font-semibold text-navy">concierge@somnikaresort.com</span>
                <span className="text-xs text-stone-500 block">Typical response time within 2 hours</span>
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-stone-100 p-6 shadow-sm flex items-start gap-4">
              <MapPin className="h-6 w-6 text-gold flex-shrink-0 mt-1" />
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Resort Location</span>
                <span className="text-sm font-semibold text-navy">Vagator Beach Road, Anjuna, Goa 403509, India</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 rounded-3xl bg-white p-8 sm:p-10 shadow-sm border border-stone-100 space-y-6">
            <h3 className="font-serif text-2xl font-bold text-navy">Send an Inquiry</h3>
            
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <CheckCircle2 className="h-14 w-14 text-success mx-auto" />
                <h4 className="font-serif text-xl font-bold text-navy">Inquiry Dispatched!</h4>
                <p className="text-stone-500 text-sm max-w-sm mx-auto">
                  Thank you for writing to us. Our guest relation specialist will email you shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', message: '' });
                  }}
                  className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-navy hover:bg-stone-50 transition-colors"
                >
                  Write Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Mobile Phone (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Message Details *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-navy hover:bg-navy-light text-white px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className={`h-4 w-4 ${submitting ? 'animate-pulse' : ''}`} />
                  {submitting ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Google Map Mock Integration */}
        <div className="mt-12 rounded-3xl overflow-hidden shadow-sm border border-stone-100 h-96 relative bg-stone-200">
          <div className="absolute inset-0 bg-stone-300 flex items-center justify-center">
            <span className="text-stone-500 text-sm font-semibold">Google Maps Sandbox Placeholder</span>
          </div>
        </div>
      </main>

      {/* WhatsApp float widget button */}
      <a
        href="https://wa.me/918275312045"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-4 shadow-lg hover:scale-105 transition-all flex items-center gap-2 text-sm font-semibold"
      >
        <MessageCircle className="h-6 w-6" /> WhatsApp Concierge
      </a>

      {/* Footer */}
      <footer className="bg-navy text-stone-400 py-8 text-center text-xs border-t border-navy-light mt-12">
        <p>© 2026 Somnika Heritage Resort & Spa. All rights reserved.</p>
      </footer>
    </div>
  );
}
