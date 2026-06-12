import { Loader2 } from 'lucide-react';
import { RoomCategory } from '@/lib/types';

export default function ReviewTariffStep({
  category,
  checkIn,
  checkOut,
  guestDetails,
  couponCode,
  setCouponCode,
  applyCoupon,
  baseAmount,
  discountAmount,
  netTaxable,
  cgst,
  sgst,
  igst,
  grandTotal,
  submitting,
  onBack,
  onInitiateBooking,
}: {
  category: RoomCategory;
  checkIn: string;
  checkOut: string;
  guestDetails: any;
  couponCode: string;
  setCouponCode: (val: string) => void;
  applyCoupon: () => void;
  baseAmount: number;
  discountAmount: number;
  netTaxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  submitting: boolean;
  onBack: () => void;
  onInitiateBooking: () => void;
}) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
      <h2 className="font-serif text-2xl font-bold text-navy">Review stay tariff details</h2>
      
      <div className="space-y-4 text-sm text-stone-600 border-b border-stone-100 pb-6">
        <div className="flex justify-between">
          <span>Room Tariff ({category.name})</span>
          <span>₹{baseAmount.toLocaleString('en-IN')}</span>
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
          onClick={onBack}
          className="rounded-xl border border-stone-200 px-6 py-3 text-xs font-bold uppercase tracking-wider text-stone-500 hover:bg-stone-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onInitiateBooking}
          disabled={submitting}
          className="rounded-xl bg-navy hover:bg-navy-light text-white px-8 py-3 text-xs font-bold uppercase tracking-widest flex-grow flex items-center justify-center gap-1.5"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Confirm Details & Pay
        </button>
      </div>
    </div>
  );
}
