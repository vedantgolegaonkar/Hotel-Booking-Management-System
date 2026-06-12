import { UserCheck } from 'lucide-react';
import { Booking } from '@/lib/types';

export default function InvoiceViewModal({
  booking,
  onClose
}: {
  booking: Booking;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-stone-100 p-8 my-8 relative animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-stone-400 hover:text-navy font-bold text-lg"
        >
          ✕
        </button>

        <div className="text-center pb-6 border-b border-stone-100">
          <span className="font-serif text-2xl font-bold tracking-widest text-navy">SOMNIKA HERITAGE</span>
          <p className="text-xs text-stone-400 mt-1">SAC Code 996311 - Accommodation Services</p>
        </div>

        {/* Billing Metadata */}
        <div className="grid grid-cols-2 gap-4 py-6 text-xs text-stone-600 border-b border-stone-100">
          <div>
            <strong>GSTIN Resort:</strong> 30SOMNI1234F1Z1
          </div>
          <div className="text-right">
            <strong>Invoice ID:</strong> {booking.bookingReference}
          </div>
          <div>
            <strong>Guest Name:</strong> {booking.guest.firstName} {booking.guest.lastName}
          </div>
          <div className="text-right">
            <strong>Place of Supply:</strong> Goa (GA)
          </div>
          {booking.guest.gstin && (
            <div>
              <strong>Guest GSTIN:</strong> {booking.guest.gstin}
            </div>
          )}
        </div>

        {/* Calculations Breakdown */}
        <div className="py-6 space-y-4 text-sm">
          <div className="flex justify-between text-navy font-semibold">
            <span>Room Category Base Tariff</span>
            <span>₹{booking.baseAmount.toLocaleString('en-IN')}</span>
          </div>
          {booking.discountAmount > 0 && (
            <div className="flex justify-between text-success">
              <span>Coupon Discount Applied</span>
              <span>-₹{booking.discountAmount.toLocaleString('en-IN')}</span>
            </div>
          )}

          {/* GST Splits block */}
          <div className="pl-4 border-l-2 border-stone-200 text-xs text-stone-500 space-y-2">
            {booking.guest.stateCode === 'GA' ? (
              <>
                <div className="flex justify-between">
                  <span>Central GST (CGST)</span>
                  <span>₹{(booking.taxAmount / 2).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>State GST (SGST)</span>
                  <span>₹{(booking.taxAmount / 2).toLocaleString('en-IN')}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span>Integrated GST (IGST)</span>
                <span>₹{booking.taxAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="flex justify-between font-bold text-navy text-lg pt-4 border-t border-stone-100">
            <span>Grand Total Settled</span>
            <span>₹{booking.grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Room assignment check */}
        <div className="rounded-2xl bg-stone-50 p-4 text-[10px] text-stone-500 leading-relaxed border border-stone-100 flex gap-2">
          <UserCheck className="h-4 w-4 text-gold flex-shrink-0" />
          <div>
            <strong>Audit Details:</strong> Stay concluded from {booking.checkInDate} to {booking.checkOutDate}. Assigned physical room was <strong>Room {booking.assignedRooms?.[0]?.roomNumber}</strong>. Room status updated to <strong>CLEANING</strong> to trigger immediate housekeeper assignment.
          </div>
        </div>

        <div className="text-center pt-6">
          <button
            onClick={onClose}
            className="rounded-xl bg-navy hover:bg-navy-light text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Close Invoice View
          </button>
        </div>
      </div>
    </div>
  );
}
