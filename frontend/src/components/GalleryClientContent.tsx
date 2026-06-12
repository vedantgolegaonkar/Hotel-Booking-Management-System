'use client';

import { useState } from 'react';
import { Camera, Eye } from 'lucide-react';

const galleryImages = [
  { id: 1, category: 'rooms', url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80', title: 'Deluxe Room Bedding' },
  { id: 2, category: 'dining', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', title: 'Beachside Seafood Grill' },
  { id: 3, category: 'wellness', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', title: 'Ayurvedic Treatment Room' },
  { id: 4, category: 'rooms', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80', title: 'Premium Suite Balcony' },
  { id: 5, category: 'dining', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80', title: 'Fine Dining Restaurant' },
  { id: 6, category: 'activities', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', title: 'Sunset Beach Yoga' },
  { id: 7, category: 'wellness', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80', title: 'Infinity Pool At Night' },
  { id: 8, category: 'activities', url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80', title: 'Private Yacht Tour' },
];

export default function GalleryClientContent() {
  const [filter, setFilter] = useState<'all' | 'rooms' | 'dining' | 'wellness' | 'activities'>('all');
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const filteredImages = filter === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === filter);

  return (
    <>
      {/* Hero section */}
      <section className="relative luxury-gradient py-20 text-white text-center">
        <div className="mx-auto max-w-4xl px-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold mb-3 block">
            Visual Journey
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Resort Lookbook
          </h1>
          <p className="text-stone-300 text-sm max-w-xl mx-auto">
            Explore photos of our luxury villas, wellness spas, dining setups, and ocean excursions.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <main className="flex-grow mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-wrap gap-2 justify-center items-center text-xs font-semibold uppercase tracking-wider text-stone-500">
          {(['all', 'rooms', 'dining', 'wellness', 'activities'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-full border transition-all ${
                filter === cat
                  ? 'bg-gold border-gold text-white shadow-sm'
                  : 'bg-white border-stone-200 hover:border-gold hover:text-gold'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredImages.map((img) => (
            <div 
              key={img.id}
              onClick={() => setActiveImage(img.url)}
              className="group relative h-72 rounded-3xl overflow-hidden shadow-sm border border-stone-100 cursor-pointer"
            >
              <img 
                src={img.url} 
                alt={img.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">{img.category}</span>
                <h4 className="font-serif text-sm font-semibold flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-gold" /> {img.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Lightbox Modal */}
      {activeImage && (
        <div 
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="relative max-w-3xl w-full max-h-[85vh] rounded-3xl overflow-hidden border border-white/10">
            <img 
              src={activeImage} 
              alt="Fullscreen View" 
              className="w-full h-full object-contain mx-auto"
            />
            <button 
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 bg-white/20 text-white rounded-full p-2 hover:bg-white/40 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
