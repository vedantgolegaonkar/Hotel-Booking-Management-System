import Navbar from '@/components/Navbar';
import ContactClientContent from '@/components/ContactClientContent';

export const metadata = {
  title: 'Contact Us | Somnika Resort',
  description: 'Reach out to our concierge for special requirements, corporate bookings, or events.',
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50/30">
      <Navbar />

      <ContactClientContent />

      {/* Footer */}
      <footer className="bg-navy text-stone-400 py-8 text-center text-xs border-t border-navy-light mt-12">
        <p>© 2026 Somnika Heritage Resort & Spa. All rights reserved.</p>
      </footer>
    </div>
  );
}
