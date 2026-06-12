import { bookingService } from '@/lib/services/booking.service';
import { paymentService } from '@/lib/services/payment.service';
import { couponService } from '@/lib/services/coupon.service';
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoomCategory, Booking } from '@/lib/types';
import { AlertCircle } from 'lucide-react';
import GuestInfoStep from '@/components/booking/GuestInfoStep';
import ReviewTariffStep from '@/components/booking/ReviewTariffStep';
import PaymentStep from '@/components/booking/PaymentStep';
import ReservationSummary from '@/components/booking/ReservationSummary';

import { calculateStayPricing } from '@/lib/billing';

export default function BookingWizardClient({
  category,
  checkIn,
  checkOut,
  guests,
}: {
  category: RoomCategory | null;
  checkIn: string;
  checkOut: string;
  guests: number;
}) {
  const router = useRouter();

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
  
  // Pricing state
  const [baseAmount, setBaseAmount] = useState(0);
  const [netTaxable, setNetTaxable] = useState(0);
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [igst, setIgst] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // Booking result & Razorpay simulation
  const [bookingResponse, setBookingResponse] = useState<Booking | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Trigger recalculation on state/GST changes
  useEffect(() => {
    if (category) {
      const pricing = calculateStayPricing(
        category.basePrice,
        checkIn,
        checkOut,
        discountAmount,
        guestDetails.stateCode
      );
      
      setBaseAmount(pricing.baseAmount);
      setNetTaxable(pricing.netTaxable);
      setCgst(pricing.cgst);
      setSgst(pricing.sgst);
      setIgst(pricing.igst);
      setGrandTotal(pricing.grandTotal);
    }
  }, [guestDetails.stateCode, discountAmount, category, checkIn, checkOut]);

  const applyCoupon = async () => {
    if (!couponCode.trim() || !category) return;
    setErrorMsg('');
    try {
      const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) || 1);
      const baseAmount = category.basePrice * nights;
      const response = await couponService.validateCoupon(couponCode, baseAmount);
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
        categoryId: Number(category.id),
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

      const booking = await bookingService.initiateBooking(payload);
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
        await paymentService.confirmPaymentDirectly({
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

  if (!category) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-sm text-red-600 max-w-xl mx-auto">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <span>Failed to load room details. Please try again.</span>
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
          <GuestInfoStep
            guestDetails={guestDetails}
            setGuestDetails={setGuestDetails}
            onNext={handleNextStep}
          />
        )}

        {/* Step 2: Review & Coupon */}
        {step === 2 && category && (
          <ReviewTariffStep
            category={category}
            checkIn={checkIn}
            checkOut={checkOut}
            guestDetails={guestDetails}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            applyCoupon={applyCoupon}
            baseAmount={baseAmount}
            discountAmount={discountAmount}
            netTaxable={netTaxable}
            cgst={cgst}
            sgst={sgst}
            igst={igst}
            grandTotal={grandTotal}
            submitting={submitting}
            onBack={() => setStep(1)}
            onInitiateBooking={handleInitiateBooking}
          />
        )}

        {/* Step 3: Razorpay payment gateway simulation */}
        {step === 3 && bookingResponse && (
          <PaymentStep
            bookingResponse={bookingResponse}
            grandTotal={grandTotal}
            processingPayment={processingPayment}
            handleSimulatedPayment={handleSimulatedPayment}
          />
        )}
      </div>

      <ReservationSummary
        category={category}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
      />
    </div>
  );
}
