'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/api-client';
import { Compass, Mail, Lock, AlertTriangle, Loader2, Eye, EyeOff, ShieldCheck, ArrowLeft, User, Phone, Type } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'staff' | 'guest'>('guest');
  const [isRegistering, setIsRegistering] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Already authenticated user redirection
  useEffect(() => {
    if (user) {
      redirectUser(user.roles);
    }
  }, [user]);

  const redirectUser = (roles: string[]) => {
    if (roles.includes('ROLE_CUSTOMER')) {
      router.push('/customer/reservations');
    } else if (roles.includes('ROLE_HOUSEKEEPING')) {
      router.push('/dashboard/housekeeping');
    } else {
      router.push('/dashboard/reception');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const authenticatedUser = await login({ email, password });
      redirectUser(authenticatedUser.roles);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email credentials or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register/customer`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ firstName, lastName, email, mobile, password }),
      });
      const data = await res.text();
      if (!res.ok) throw new Error(data || 'Registration failed');
      
      setSuccessMsg('Registration successful! Please login.');
      setIsRegistering(false);
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    setActiveTab('staff');
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

        <div className="mx-auto w-full max-w-md space-y-8 mt-8">
          
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Compass className="h-8 w-8 text-gold" />
              <span className="font-serif text-xl font-bold tracking-widest text-navy">
                SOMNIKA
              </span>
            </Link>
          </div>

          <div className="flex bg-stone-100 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => { setActiveTab('guest'); setIsRegistering(false); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === 'guest' ? 'bg-white text-navy shadow-sm' : 'text-stone-500 hover:text-navy'
              }`}
            >
              Guest Login
            </button>
            <button
              onClick={() => { setActiveTab('staff'); setIsRegistering(false); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === 'staff' ? 'bg-white text-navy shadow-sm' : 'text-stone-500 hover:text-navy'
              }`}
            >
              Staff Portal
            </button>
          </div>

          <div className="space-y-1.5">
            <h2 className="font-serif text-2xl font-bold text-navy">
              {activeTab === 'staff' ? 'Staff Login' : isRegistering ? 'Guest Registration' : 'Guest Login'}
            </h2>
            <p className="text-xs text-stone-500">
              {activeTab === 'staff' 
                ? 'Sign in with your credentials to access your operations dashboard.' 
                : isRegistering 
                  ? 'Create an account to book rooms and reserve tables.' 
                  : 'Sign in to view your bookings and restaurant reservations.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-xs text-red-600">
              <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3 text-xs text-green-600">
              <ShieldCheck className="h-4.5 w-4.5 flex-shrink-0 text-green-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isRegistering ? (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
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
                Sign In
              </button>

              {activeTab === 'guest' && (
                <div className="text-center pt-2">
                  <p className="text-xs text-stone-500">
                    Don't have an account?{' '}
                    <button 
                      type="button" 
                      onClick={() => setIsRegistering(true)}
                      className="font-bold text-gold hover:text-navy transition-colors"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-4 w-4 text-stone-400" />
                    <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-3 py-3 text-sm text-navy focus:border-gold focus:bg-white focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-4 w-4 text-stone-400" />
                    <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-3 py-3 text-sm text-navy focus:border-gold focus:bg-white focus:outline-none" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-stone-400" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-3 py-3 text-sm text-navy focus:border-gold focus:bg-white focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 h-4 w-4 text-stone-400" />
                  <input type="text" required value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-3 py-3 text-sm text-navy focus:border-gold focus:bg-white focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-stone-400" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-3 py-3 text-sm text-navy focus:border-gold focus:bg-white focus:outline-none" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full mt-2 rounded-xl bg-gold hover:bg-yellow-600 text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin text-white" />}
                Create Account
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-stone-500">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setIsRegistering(false)} className="font-bold text-navy hover:text-gold transition-colors">
                    Login here
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Quick-fill controls for Demo Testing */}
          {activeTab === 'staff' && (
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
          )}

        </div>
      </div>

    </div>
  );
}
