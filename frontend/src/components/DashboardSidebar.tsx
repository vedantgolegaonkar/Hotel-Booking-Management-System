'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Compass, CalendarDays, ClipboardList, BarChart3, LogOut, User as UserIcon, Tag, Shield, PlusCircle, X } from 'lucide-react';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const hasRole = (role: string) => {
    return user?.roles.includes(role) || false;
  };

  const isManagerOrAdmin = hasRole('ROLE_MANAGER') || hasRole('ROLE_SUPER_ADMIN');
  const isSuperAdmin = hasRole('ROLE_SUPER_ADMIN');
  const isReceptionist = hasRole('ROLE_RECEPTIONIST');
  const isHousekeeper = hasRole('ROLE_HOUSEKEEPING');

  const menuItems = [
    {
      name: 'Reception Sheet',
      path: '/dashboard/reception',
      icon: CalendarDays,
      visible: isManagerOrAdmin || isReceptionist,
    },
    {
      name: 'Walk-In Booking',
      path: '/dashboard/walk-in',
      icon: PlusCircle,
      visible: isManagerOrAdmin || isReceptionist,
    },
    {
      name: 'Booking Ledger',
      path: '/dashboard/bookings',
      icon: ClipboardList,
      visible: isManagerOrAdmin || isReceptionist,
    },
    {
      name: 'Housekeeping Desk',
      path: '/dashboard/housekeeping',
      icon: ClipboardList,
      visible: isManagerOrAdmin || isHousekeeper || isReceptionist,
    },
    {
      name: 'Pricing Rates',
      path: '/dashboard/pricing',
      icon: BarChart3,
      visible: isManagerOrAdmin,
    },
    {
      name: 'Coupon Manager',
      path: '/dashboard/coupons',
      icon: Tag,
      visible: isManagerOrAdmin,
    },
    {
      name: 'Reports & Revenue',
      path: '/dashboard/reports',
      icon: BarChart3,
      visible: isManagerOrAdmin,
    },
    {
      name: 'System Settings',
      path: '/dashboard/settings',
      icon: Shield,
      visible: isSuperAdmin,
    },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-navy-light bg-navy text-white transition-transform duration-300 lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Sidebar Header */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-navy-light">
        <div className="flex items-center gap-2">
          <Compass className="h-7 w-7 text-gold animate-pulse" />
          <span className="font-serif text-xl font-bold tracking-widest text-white">
            SOMNIKA
          </span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 text-stone-400 hover:text-white rounded-lg hover:bg-navy-light transition-colors"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Staff Profile Summary */}
      <div className="flex items-center gap-3 px-6 py-5 bg-navy-light/40 border-b border-navy-light">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold border border-gold/25">
          <UserIcon className="h-5 w-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold truncate text-stone-100">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="text-[10px] font-bold text-gold uppercase tracking-wider truncate">
            {user?.roles[0]?.replace('ROLE_', '') || 'Staff'}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {menuItems
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gold text-white shadow-sm'
                    : 'text-stone-300 hover:bg-navy-light hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-stone-400 group-hover:text-white'}`} />
                {item.name}
              </Link>
            );
          })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-navy-light">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-stone-300 hover:bg-red-950/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5 text-stone-400 group-hover:text-red-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
