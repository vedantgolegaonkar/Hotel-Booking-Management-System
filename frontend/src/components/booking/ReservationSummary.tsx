import { ShieldCheck } from 'lucide-react';
import { RoomCategory } from '@/lib/types';

export default function ReservationSummary({
  category,
  checkIn,
  checkOut,
  guests,
}: {
  category: RoomCategory;
  checkIn: string;
  checkOut: string;
  guests: number;
}) {
  return (
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
  );
}
