'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Loader2, Menu, Compass } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 text-gold animate-spin mx-auto" />
          <span className="text-sm font-semibold text-stone-500 block">Loading staff dashboard session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // prevent flash of content before redirect completes
  }

  return (
    <div className="min-h-screen bg-stone-100/40 flex flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <header className="lg:hidden flex h-16 items-center justify-between border-b border-stone-200 bg-navy px-4 text-white sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Compass className="h-6 w-6 text-gold" />
          <span className="font-serif text-lg font-bold tracking-widest text-white">SOMNIKA</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-white hover:text-gold transition-colors rounded-xl border border-white/10"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Sidebar Navigation */}
      <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Backdrop for mobile drawer */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-navy/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-grow lg:pl-64">
        <main className="min-h-screen py-6 px-4 sm:py-10 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
