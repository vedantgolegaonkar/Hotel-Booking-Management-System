'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { RoomCategory, Booking } from '@/lib/types';
import { Loader2, AlertCircle, Calendar, Users, Percent, ShieldCheck, CheckCircle2, CreditCard } from 'lucide-react';

function BookingWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryId = Number(searchParams.get('categoryId') || '1');
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = Number(searchParams.get('guests') || '2');

  const [category, setCategory] = useState<RoomCategory | null>(null);
  const [loadingCategory, setLoadingCategory] = useState(true);
  
  // Steps: 1 = Guest Info, 2 = Review & Coupons, 3 = Razorpay Payment
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Guest fields
  const [guestDetails, setGuestDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    address: '',
    city: '',
    stateCode: 'GA', // Default Goa home state
    gstin: '',
  });

  // Coupons
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [netTaxable, setNetTaxable] = useState(0);
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [igst, setIgst] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // Booking result & Razorpay simulation
  const [bookingResponse, setBookingResponse] = useState<Booking | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    setLoadingCategory(true);
    try {
      const data = await api.getCategory(categoryId);
      setCategory(data);
      if (data) {
        calculateFees(data.basePrice, 0);
      }
    } catch (e) {
      setErrorMsg('Failed to load room details.');
    } finally {
      setLoadingCategory(false);
    }
  };

  const calculateFees = (basePrice: number, discount: number) => {
    // Calculate nights
    const nights = Math.max(
      1,
      Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      ) || 1
    );

    const baseAmount = basePrice * nights;
    const finalTaxable = Math.max(0, baseAmount - discount);
    
    // Slabs: 12% if daily tariff < 7500, 18% otherwise
    const dailyPrice = finalTaxable / nights;
    const taxRate = dailyPrice < 7500 ? 0.12 : 0.18;
    const taxTotal = finalTaxable * taxRate;
    
    setNetTaxable(finalTaxable);
    if (guestDetails.stateCode === 'GA') {
      setCgst(taxTotal / 2);
      setSgst(taxTotal / 2);
      setIgst(0);
    } else {
      setCgst(0);
      setSgst(0);
      setIgst(taxTotal);
    }
    setGrandTotal(finalTaxable + taxTotal);
  };

  // Trigger recalculation on state/GST changes
  useEffect(() => {
    if (category) {
      calculateFees(category.basePrice, discountAmount);
    }
  }, [guestDetails.stateCode, discountAmount]);

  const applyCoupon = async () => {
    if (!couponCode.trim() || !category) return;
    setErrorMsg('');
    try {
      const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) || 1);
      const baseAmount = category.basePrice * nights;
      const response = await api.validateCoupon(couponCode, baseAmount);
      setDiscountAmount(Number(response.discountAmount));
      setCouponApplied(true);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to apply coupon.');
      setCouponApplied(false);
      setDiscountAmount(0);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      // Basic validations
      if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email || !guestDetails.mobile) {
        setErrorMsg('Please complete all required fields.');
        return;
      }
      setStep(2);
      setErrorMsg('');
    }
  };

  const handleInitiateBooking = async () => {
    if (!category) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        categoryId: Number(categoryId),
        checkIn: checkIn,
        checkOut: checkOut,
        adults: guests,
        children: 0,
        firstName: guestDetails.firstName,
        lastName: guestDetails.lastName,
        email: guestDetails.email,
        mobile: guestDetails.mobile,
        address: guestDetails.address || undefined,
        city: guestDetails.city || undefined,
        stateCode: guestDetails.stateCode,
        gstin: guestDetails.gstin || undefined,
        couponCode: couponApplied ? couponCode : undefined,
      };

      const booking = await api.initiateBooking(payload);
      setBookingResponse(booking);
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulatedPayment = async (status: 'SUCCESS' | 'FAILED') => {
    if (!bookingResponse) return;
    setProcessingPayment(true);
    setErrorMsg('');
    try {
      if (status === 'SUCCESS') {
        await api.confirmPaymentDirectly({
          razorpayOrderId: bookingResponse.bookingReference,
          razorpayPaymentId: 'pay_' + Math.random().toString(36).substring(2, 12),
        });
        router.push(`/book/confirmation?id=${bookingResponse.id}`);
      } else {
        setErrorMsg('Sandboxed payment rejected. Reservation slot cleared.');
        setStep(2);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment confirmation failed.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loadingCategory) {
    return (
      <div className="text-center py-20">
        <Loader2 className="h-10 w-10 text-gold animate-spin mx-auto mb-3" />
        <span className="text-sm font-semibold text-stone-500">Loading booking portal...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Wizard Progress Steps */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex justify-between items-center bg-white border border-stone-100 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-gold text-white' : 'bg-stone-100 text-stone-400'}`}>1</span>
            <span className="text-xs font-bold uppercase tracking-wider text-navy">Guest Profile</span>
          </div>
          <div className="h-px bg-stone-100 flex-grow mx-4" />
          <div className="flex items-center gap-3">
            <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-gold text-white' : 'bg-stone-100 text-stone-400'}`}>2</span>
            <span className="text-xs font-bold uppercase tracking-wider text-navy">Review Tariff</span>
          </div>
          <div className="h-px bg-stone-100 flex-grow mx-4" />
          <div className="flex items-center gap-3">
            <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-gold text-white' : 'bg-stone-100 text-stone-400'}`}>3</span>
            <span className="text-xs font-bold uppercase tracking-wider text-navy">Secure Pay</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2.5 text-sm text-red-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Guest Info Form */}
        {step === 1 && (
          <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
            <h2 className="font-serif text-2xl font-bold text-navy">Guest Identification Details</h2>
            <form onSubmit={handleNextStep} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">First Name *</label>
                  <input
                    type="text"
                    required
                    value={guestDetails.firstName}
                    onChange={(e) => setGuestDetails({...guestDetails, firstName: e.target.value})}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={guestDetails.lastName}
                    onChange={(e) => setGuestDetails({...guestDetails, lastName: e.target.value})}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={guestDetails.email}
                    onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={guestDetails.mobile}
                    onChange={(e) => setGuestDetails({...guestDetails, mobile: e.target.value})}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Billing Address *</label>
                  <input
                    type="text"
                    required
                    value={guestDetails.address}
                    onChange={(e) => setGuestDetails({...guestDetails, address: e.target.value})}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">City *</label>
                  <input
                    type="text"
                    required
                    value={guestDetails.city}
                    onChange={(e) => setGuestDetails({...guestDetails, city: e.target.value})}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">GST State Rule *</label>
                  <select
                    value={guestDetails.stateCode}
                    onChange={(e) => setGuestDetails({...guestDetails, stateCode: e.target.value})}
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                  >
                    <option value="GA">Goa (CGST + SGST Split)</option>
                    <option value="MH">Maharashtra (IGST Split)</option>
                    <option value="KA">Karnataka (IGST Split)</option>
                    <option value="DL">Delhi (IGST Split)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Corporate GSTIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 30AAAAA1111A1Z1"
                    value={guestDetails.gstin}
                    onChange={(e) => setGuestDetails({...guestDetails, gstin: e.target.value})}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-navy hover:bg-navy-light text-white py-3 text-xs font-bold uppercase tracking-widest transition-all"
              >
                Proceed to Review
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Review & Coupon */}
        {step === 2 && category && (
          <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
            <h2 className="font-serif text-2xl font-bold text-navy">Review stay tariff details</h2>
            
            <div className="space-y-4 text-sm text-stone-600 border-b border-stone-100 pb-6">
              <div className="flex justify-between">
                <span>Room Tariff ({category.name})</span>
                <span>₹{(category.basePrice * Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) || 1)).toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-success font-medium">
                  <span>Coupon Discount Applied</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-navy">
                <span>Net Taxable Value</span>
                <span>₹{netTaxable.toLocaleString('en-IN')}</span>
              </div>

              {/* Tax Splits */}
              <div className="pl-4 border-l-2 border-stone-200 text-xs text-stone-500 space-y-2">
                {guestDetails.stateCode === 'GA' ? (
                  <>
                    <div className="flex justify-between">
                      <span>Central GST (CGST @ 9%)</span>
                      <span>₹{cgst.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State GST (SGST @ 9%)</span>
                      <span>₹{sgst.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span>Integrated GST (IGST @ 18%)</span>
                    <span>₹{igst.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between font-bold text-navy text-base pt-3 border-t border-stone-100">
                <span>Grand Total Amount</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Apply coupon */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Apply Discount Voucher</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. ANNIVERSARY10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs focus:outline-none flex-grow"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="rounded-xl bg-gold hover:bg-gold-hover text-white px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Apply
                </button>
              </div>
              <span className="text-[10px] text-stone-400 block mt-1">Try coupon code: <strong>ANNIVERSARY10</strong> (10% off) or <strong>WELCOME1000</strong> (₹1000 flat discount)</span>
            </div>

            <div className="flex gap-4 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-stone-200 px-6 py-3 text-xs font-bold uppercase tracking-wider text-stone-500 hover:bg-stone-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleInitiateBooking}
                disabled={submitting}
                className="rounded-xl bg-navy hover:bg-navy-light text-white px-8 py-3 text-xs font-bold uppercase tracking-widest flex-grow flex items-center justify-center gap-1.5"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm Details & Pay
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Razorpay payment gateway simulation */}
        {step === 3 && bookingResponse && (
          <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6 max-w-md mx-auto text-center">
            <div className="h-14 w-14 rounded-full bg-stone-100 text-gold flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-navy">Confirm secure checkout</h2>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Simulate standard Razorpay callbacks for reservation booking: <strong>{bookingResponse.bookingReference}</strong>
            </p>
            <div className="text-3xl font-extrabold text-navy pt-2">
              ₹{grandTotal.toLocaleString('en-IN')}
            </div>

            {processingPayment ? (
              <div className="space-y-2 py-4">
                <Loader2 className="h-8 w-8 text-gold animate-spin mx-auto" />
                <span className="text-xs text-stone-500 font-semibold block">Processing transaction and saving ledger details...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => handleSimulatedPayment('FAILED')}
                  className="rounded-xl border border-stone-200 py-3 text-xs font-bold uppercase tracking-wider text-stone-500 hover:bg-stone-50"
                >
                  Fail Payment
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatedPayment('SUCCESS')}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-bold uppercase tracking-wider"
                >
                  Pay Successful
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary sidebar widget */}
      {category && (
        <div className="rounded-3xl bg-white border border-stone-100 p-8 shadow-sm h-fit space-y-6">
          <h3 className="font-serif text-lg font-bold text-navy pb-3 border-b border-stone-100">Reservation Info</h3>
          
          <div className="space-y-4 text-xs text-stone-600">
            <div>
              <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Selected Category</span>
              <span className="text-sm font-bold text-navy">{category.name}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Arrival</span>
                <span className="text-xs font-semibold text-stone-800">{checkIn}</span>
              </div>
              <div>
                <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Departure</span>
                <span className="text-xs font-semibold text-stone-800">{checkOut}</span>
              </div>
            </div>

            <div>
              <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Stay Occupancy</span>
              <span className="text-xs font-semibold text-stone-800">{guests} Adults</span>
            </div>
          </div>

          <div className="rounded-2xl bg-stone-50 p-4 border border-stone-100 text-[10px] text-stone-500 leading-relaxed flex gap-2">
            <ShieldCheck className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <strong>Instant Guarantee:</strong> Direct booking secures local GST inputs immediately. Ensure ID proofs matches names checked-in.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingWizardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50/30">
      <Navbar />

      <section className="relative luxury-gradient py-12 text-white text-center">
        <div className="mx-auto max-w-4xl px-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold mb-2 block">
            Direct Reservation
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Somnika Booking Gateway
          </h1>
        </div>
      </section>

      <main className="flex-grow mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <Suspense fallback={
          <div className="text-center py-20">
            <Loader2 className="h-10 w-10 text-gold animate-spin mx-auto mb-3" />
            <span className="text-sm font-semibold text-stone-500">Loading checkout portal...</span>
          </div>
        }>
          <BookingWizardContent />
        </Suspense>
      </main>

      <footer className="bg-navy text-stone-400 py-8 text-center text-xs border-t border-navy-light">
        <p>© 2026 Somnika Heritage Resort & Spa. All rights reserved.</p>
      </footer>
    </div>
  );
}
