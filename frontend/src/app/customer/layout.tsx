'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Menu, Compass, LogOut, Utensils, History, PlusCircle, X, Globe, CalendarDays } from 'lucide-react';
import Link from 'next/link';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.roles.includes('ROLE_CUSTOMER'))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <Loader2 className="h-10 w-10 text-gold animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Room Bookings', path: '/customer/bookings', icon: CalendarDays },
    { name: 'Room History', path: '/customer/bookings/history', icon: History },
    { name: 'Dining Reservations', path: '/customer/reservations', icon: Utensils },
    { name: 'Dining History', path: '/customer/reservations/history', icon: History },
    { name: 'Book a Table', path: '/customer/reservations/new', icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row">
      <header className="lg:hidden flex h-16 items-center justify-between border-b border-stone-200 bg-white px-4 text-navy sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <Compass className="h-6 w-6 text-gold" />
          <span className="font-serif text-lg font-bold tracking-widest text-navy">SOMNIKA</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-navy hover:text-gold transition-colors rounded-xl border border-stone-200"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-stone-200 bg-white text-navy transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between px-6 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Compass className="h-7 w-7 text-gold" />
            <span className="font-serif text-xl font-bold tracking-widest text-navy">SOMNIKA</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-stone-400 hover:text-navy">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50">
          <span className="text-sm font-semibold truncate block">Welcome, {user.firstName}</span>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Guest Portal</span>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navLinks.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                onClick={() => setIsSidebarOpen(false)} 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-gold text-white shadow-sm' 
                    : 'text-stone-600 hover:bg-stone-100 hover:text-navy'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-100 space-y-1">
          <Link href="/" className="mb-2 flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-hover text-sm font-bold tracking-wide text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
           
            Explore Website
          </Link>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-stone-500 hover:bg-red-50 hover:text-red-500 transition-colors">
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-30 bg-navy/20 backdrop-blur-sm lg:hidden" />
      )}

      <div className="flex-grow lg:pl-64">
        <main className="min-h-screen p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
