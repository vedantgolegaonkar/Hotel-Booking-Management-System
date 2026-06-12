import Navbar from '@/components/Navbar';
import GalleryClientContent from '@/components/GalleryClientContent';

export const metadata = {
  title: 'Gallery | Somnika Resort',
  description: 'Explore photos of our luxury villas, wellness spas, dining setups, and ocean excursions.',
};

export default function GalleryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50/30">
      <Navbar />

      <GalleryClientContent />

      {/* Footer */}
      <footer className="bg-navy text-stone-400 py-8 text-center text-xs border-t border-navy-light mt-12">
        <p>© 2026 Somnika Heritage Resort & Spa. All rights reserved.</p>
      </footer>
    </div>
  );
}
