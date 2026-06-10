'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Compass, User as UserIcon, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Compass className="h-8 w-8 text-gold transition-transform duration-500 group-hover:rotate-180" />
            <span className="font-serif text-2xl font-bold tracking-widest text-navy">
              SOMNIKA
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-navy hover:text-gold transition-colors">
              Home
            </Link>
            <Link href="/rooms" className="text-sm font-medium text-navy hover:text-gold transition-colors">
              Rooms & Suites
            </Link>
            <Link href="/about" className="text-sm font-medium text-navy hover:text-gold transition-colors">
              The Experience
            </Link>
            <Link href="/gallery" className="text-sm font-medium text-navy hover:text-gold transition-colors">
              Gallery
            </Link>
            <Link href="/contact" className="text-sm font-medium text-navy hover:text-gold transition-colors">
              Contact
            </Link>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden xl:inline text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Staff: {user.firstName}
                </span>
                <Link
                  href="/dashboard/reception"
                  className="p-2 text-navy hover:text-gold transition-colors rounded-full hover:bg-stone-50"
                  title="Dashboard"
                >
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-stone-400 hover:text-error transition-colors rounded-full hover:bg-stone-50"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-navy hover:border-gold hover:text-gold transition-all"
              >
                <UserIcon className="h-4.5 w-4.5" />
                Staff Login
              </Link>
            )}
            <Link
              href="/rooms"
              className="rounded-full bg-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white shadow-sm hover:bg-gold-hover hover:shadow transition-all"
            >
              Book Stay
            </Link>
          </div>

          {/* Mobile Right Controls: Book Button + Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-3">
            <Link
              href="/rooms"
              className="rounded-full bg-gold px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm hover:bg-gold-hover hover:shadow transition-all"
            >
              Book Stay
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-navy hover:text-gold transition-colors rounded-xl border border-stone-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-stone-100 bg-white px-4 py-6 space-y-6 shadow-lg animate-in fade-in slide-in-from-top-5 duration-200">
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-navy hover:text-gold transition-colors py-2 border-b border-stone-50"
            >
              Home
            </Link>
            <Link
              href="/rooms"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-navy hover:text-gold transition-colors py-2 border-b border-stone-50"
            >
              Rooms & Suites
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-navy hover:text-gold transition-colors py-2 border-b border-stone-50"
            >
              The Experience
            </Link>
            <Link
              href="/gallery"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-navy hover:text-gold transition-colors py-2 border-b border-stone-50"
            >
              Gallery
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-navy hover:text-gold transition-colors py-2 border-b border-stone-50"
            >
              Contact
            </Link>
          </nav>

          {/* Mobile Staff Controls */}
          <div className="pt-4 border-t border-stone-100 flex flex-col gap-3">
            {user ? (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Logged in as: <span className="text-navy">{user.firstName} {user.lastName}</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/dashboard/reception"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 py-3 text-xs font-bold uppercase tracking-wider text-navy hover:bg-stone-100 transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-50 text-error py-3 text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white py-3 text-xs font-bold uppercase tracking-wider text-navy hover:border-gold hover:text-gold transition-all"
              >
                <UserIcon className="h-4 w-4" />
                Staff Portal Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
