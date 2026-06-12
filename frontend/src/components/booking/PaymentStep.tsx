import { Loader2, CreditCard } from 'lucide-react';
import { Booking } from '@/lib/types';

export default function PaymentStep({
  bookingResponse,
  grandTotal,
  processingPayment,
  handleSimulatedPayment,
}: {
  bookingResponse: Booking;
  grandTotal: number;
  processingPayment: boolean;
  handleSimulatedPayment: (status: 'SUCCESS' | 'FAILED') => void;
}) {
  return (
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
  );
}
