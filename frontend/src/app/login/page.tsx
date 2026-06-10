'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Compass, Mail, Lock, AlertTriangle, Loader2, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Already authenticated user redirection
  useEffect(() => {
    if (user) {
      redirectUser(user.roles);
    }
  }, [user]);

  const redirectUser = (roles: string[]) => {
    if (roles.includes('ROLE_HOUSEKEEPING')) {
      router.push('/dashboard/housekeeping');
    } else {
      router.push('/dashboard/reception');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const authenticatedUser = await login({ email, password });
      redirectUser(authenticatedUser.roles);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email credentials or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-stone-50 font-sans">
      
      {/* Left panel: Immersive Visual (Hidden on mobile) */}
      <div className="hidden lg:flex lg:col-span-7 relative bg-navy overflow-hidden justify-center items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=90"
            alt="Somnika Courtyard"
            className="w-full h-full object-cover opacity-35 scale-105 transition-transform duration-10000 ease-out hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-lg px-8 space-y-6 text-white text-left">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <Compass className="h-10 w-10 text-gold transition-transform duration-700 group-hover:rotate-180" />
            <span className="font-serif text-3xl font-bold tracking-widest text-white">
              SOMNIKA
            </span>
          </Link>
          <div className="h-0.5 w-16 bg-gold" />
          <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight">
            Resort Management & Operation System
          </h1>
          <p className="text-stone-300 text-sm leading-relaxed">
            Directly coordinate guest check-ins, oversee physical room lifecycle states, configure seasonal rate markups, and manage regulation-compliant invoicing.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-gold tracking-widest uppercase">
            <ShieldCheck className="h-5 w-5 text-gold animate-pulse" /> Certified Operation Environment
          </div>
        </div>
      </div>

      {/* Right panel: Login Control Box */}
      <div className="lg:col-span-5 flex flex-col justify-center py-12 px-6 sm:px-12 bg-white relative shadow-2xl">
        
        {/* Back to Website link */}
        <Link 
          href="/" 
          className="absolute top-6 right-6 flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-stone-200 hover:border-navy hover:bg-navy hover:text-white text-stone-500 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Website</span>
        </Link>

        <div className="mx-auto w-full max-w-md space-y-8">
          
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Compass className="h-8 w-8 text-gold" />
              <span className="font-serif text-xl font-bold tracking-widest text-navy">
                SOMNIKA
              </span>
            </Link>
            <h2 className="text-lg font-bold text-navy uppercase tracking-wider">
              Staff Portal Login
            </h2>
          </div>

          <div className="hidden lg:block space-y-1.5">
            <h2 className="font-serif text-2xl font-bold text-navy">Welcome Back</h2>
            <p className="text-xs text-stone-500">Sign in with your credentials to access your operations dashboard.</p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-xs text-red-600">
              <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@resort.com"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-11 pr-3 py-3 text-sm text-navy focus:border-gold focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-11 pr-11 py-3 text-sm text-navy focus:border-gold focus:bg-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-navy hover:bg-navy-light text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin text-white" />}
              Access Operations Dashboard
            </button>
          </form>

          {/* Quick-fill controls for Demo Testing */}
          <div className="pt-6 border-t border-stone-100 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2.5">
                Quick-Fill Demo Roles
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('receptionist@resort.com')}
                  className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 hover:bg-gold/10 hover:border-gold hover:text-gold text-xs font-semibold transition-all cursor-pointer"
                >
                  Receptionist
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('cleaner@resort.com')}
                  className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 hover:bg-gold/10 hover:border-gold hover:text-gold text-xs font-semibold transition-all cursor-pointer"
                >
                  Housekeeping
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('manager@resort.com')}
                  className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 hover:bg-gold/10 hover:border-gold hover:text-gold text-xs font-semibold transition-all cursor-pointer"
                >
                  Manager & Admin
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
