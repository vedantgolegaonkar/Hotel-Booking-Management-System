import { roomsService } from '@/lib/services/rooms.service';
import { use } from 'react';
import Navbar from '@/components/Navbar';
import { AlertCircle, Wifi, Coffee, Tv, Landmark, ShieldCheck, User } from 'lucide-react';
import RoomAvailabilityWidget from '@/components/RoomAvailabilityWidget';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ categoryId: string }> }) {
  const resolvedParams = await params;
  try {
    const category = await roomsService.getCategory(Number(resolvedParams.categoryId));
    return {
      title: `${category.name} | Somnika Resort`,
      description: category.description,
    };
  } catch (e) {
    return {
      title: 'Room Details | Somnika Resort',
      description: 'View our luxury room accommodations.',
    };
  }
}

export default async function RoomDetailPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const resolvedParams = await params;
  const categoryId = Number(resolvedParams.categoryId);

  let category = null;
  let errorMsg = '';

  try {
    category = await roomsService.getCategory(categoryId);
  } catch (err: any) {
    errorMsg = err.message || 'Failed to load room category details.';
  }

  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'AC': Tv,
    'Breakfast': Coffee,
    'Private Pool': Landmark,
  };

  if (errorMsg || !category) {
    return (
      <div className="flex min-h-screen flex-col bg-stone-50/30">
        <Navbar />
        <div className="flex-grow max-w-xl mx-auto py-20 px-4">
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMsg || 'Room category not found.'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50/30">
      <Navbar />

      {/* Main Container */}
      <main className="flex-grow mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main info, description, gallery */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative h-[450px] rounded-3xl overflow-hidden shadow-sm border border-stone-100 bg-stone-100">
              <img 
                src={category.images?.[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80'} 
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy">{category.name}</h1>
              <div className="flex items-center gap-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                <span className="flex items-center gap-1"><User className="h-4 w-4 text-gold" /> Up to {category.capacity} guests</span>
                <span>•</span>
                <span>SAC 996311</span>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">{category.description}</p>
            </div>

            {/* Features & Amenities */}
            <div className="pt-8 border-t border-stone-100 space-y-4">
              <h3 className="font-serif text-xl font-bold text-navy">Included Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {category.amenities.map((amenity: string) => {
                  const Icon = amenityIcons[amenity] || Coffee;
                  return (
                    <div key={amenity} className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-stone-100 shadow-sm text-xs font-semibold text-navy">
                      <Icon className="h-5 w-5 text-gold flex-shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pricing & Availability Sidebar widget */}
          <div className="space-y-6">
            <RoomAvailabilityWidget categoryId={categoryId} basePrice={category.basePrice} />

            <div className="rounded-3xl bg-stone-50 border border-stone-100 p-6 text-[10px] text-stone-500 leading-relaxed flex gap-2">
              <ShieldCheck className="h-4 w-4 text-gold flex-shrink-0" />
              <div>
                <strong>Cancellation Policy:</strong> Free cancellation up to 48 hours before check-in. Subject to dynamic seasonal adjustments during peak Indian festival holidays.
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-navy text-stone-400 py-8 text-center text-xs border-t border-navy-light mt-12">
        <p>© 2026 Somnika Heritage Resort & Spa. All rights reserved.</p>
      </footer>
    </div>
  );
}
