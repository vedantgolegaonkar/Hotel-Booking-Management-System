import { useState } from 'react';
import { Booking } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function CheckOutModal({
  selectedBooking,
  onClose,
  onSubmit,
  submitting
}: {
  selectedBooking: Booking;
  onClose: () => void;
  onSubmit: (extraIncidentals: number, paymentMethod: string, txRef: string) => void;
  submitting: boolean;
}) {
  const [extraIncidentals, setExtraIncidentals] = useState<number | string>(0);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [txRef, setTxRef] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(Number(extraIncidentals) || 0, paymentMethod, txRef.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white overflow-hidden shadow-2xl border border-stone-100 animate-in fade-in zoom-in duration-300">
        <div className="bg-navy p-6 text-white text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold block mb-1">Check-out Process</span>
          <h3 className="font-serif text-xl font-semibold">Incidentals & Invoice Settlement</h3>
          <p className="text-stone-400 text-xs mt-1">Ref: {selectedBooking.bookingReference}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Extra Incidentals (₹)</label>
              <input
                type="number"
                min="0"
                value={extraIncidentals}
                onChange={(e) => {
                  let val = e.target.value;
                  if (/^0[0-9]/.test(val)) {
                    val = val.replace(/^0+/, '');
                  }
                  setExtraIncidentals(val);
                }}
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Settlement Method *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
              >
                <option value="CARD">Credit/Debit Card</option>
                <option value="CASH">Cash Settlement</option>
                <option value="UPI">UPI Transfer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Transaction Ref (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Card Auth Code / UPI Txn ID"
              value={txRef}
              onChange={(e) => setTxRef(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-stone-100 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-500 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-navy hover:bg-navy-light text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Settlement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
