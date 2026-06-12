'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoomCategory } from '@/lib/types';
import HeroSection from '@/components/home/HeroSection';
import HighlightsSection from '@/components/home/HighlightsSection';
import ParallaxFeature from '@/components/home/ParallaxFeature';
import RoomCatalogTeaser from '@/components/home/RoomCatalogTeaser';
import GalleryTeaser from '@/components/home/GalleryTeaser';
import TestimonialSlider from '@/components/home/TestimonialSlider';
import CallToAction from '@/components/home/CallToAction';

export default function HomeClientWrapper({ initialCategories }: { initialCategories: RoomCategory[] }) {
  const router = useRouter();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    setCheckIn(today.toISOString().split('T')[0]);
    setCheckOut(tomorrow.toISOString().split('T')[0]);
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

  return (
    <>
      <HeroSection 
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        setCheckIn={setCheckIn}
        setCheckOut={setCheckOut}
        setGuests={setGuests}
        handleSearch={handleSearch}
      />
      <HighlightsSection />
      <ParallaxFeature />
      <RoomCatalogTeaser initialCategories={initialCategories} />
      <GalleryTeaser />
      <TestimonialSlider />
      <CallToAction />
    </>
  );
}
