import { roomsService } from '@/lib/services/rooms.service';
import Navbar from '@/components/Navbar';
import HomeClientWrapper from '@/components/HomeClientWrapper';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Somnika Heritage Resort & Spa | Goa',
  description: 'A sanctuary nestled in the pristine beaches of Goa, blending timeless Portuguese heritage with contemporary Indian hospitality.',
};

export default async function Home() {
  let categories = [];
  try {
    const data = await roomsService.getCategories();
    categories = data?.content || (Array.isArray(data) ? data : []);
  } catch (e) {
    console.error('Failed to fetch categories on server:', e);
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50/30 font-sans">
      <Navbar />

      <HomeClientWrapper initialCategories={categories} />

      {/* Footer */}
      <footer className="bg-navy text-stone-400 py-8 text-center text-xs border-t border-navy-light mt-auto">
        <p>© 2026 Somnika Heritage Resort & Spa. All rights reserved.</p>
      </footer>
    </div>
  );
}
