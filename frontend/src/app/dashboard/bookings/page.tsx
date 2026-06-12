import { bookingService } from '@/lib/services/booking.service';
'use client';

import { useState, useEffect } from 'react';
import { Booking } from '@/lib/types';
import { Loader2, AlertCircle, Search, RefreshCw, Eye, Calendar, User } from 'lucide-react';

export default function BookingsLedgerPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Details drawer/modal
  const [detailModal, setDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await bookingService.searchBookings(searchQuery);
      setBookings(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch reservations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const openDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailModal(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">Reservations Ledger</h1>
          <p className="text-sm text-stone-500">View audit logs, billing invoices, and stay credentials for all reservations.</p>
        </div>
        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-white shadow-sm transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh List
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-4 max-w-md">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search guest or reference code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-200 pl-10 pr-3 py-2 text-xs focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-navy hover:bg-navy-light text-white px-4 py-2 text-xs font-bold uppercase tracking-wider"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <Loader2 className="h-10 w-10 text-gold animate-spin mx-auto mb-3" />
          <span className="text-sm font-semibold text-stone-500">Loading ledger records...</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <Calendar className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-semibold text-navy">No Bookings Found</h3>
          <p className="text-stone-500 text-sm max-w-sm mx-auto mt-1">Try clearing filters or search terms.</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-100 shadow-sm rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-[10px] text-stone-400 font-bold uppercase tracking-wider border-b border-stone-100">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Guest</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Check-In / Out</th>
                  <th className="p-4 text-right">Grand Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs text-stone-700 divide-y divide-stone-50">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-stone-50/50">
                    <td className="p-4 font-bold text-navy">{booking.bookingReference}</td>
                    <td className="p-4 font-medium">{booking.guest.firstName} {booking.guest.lastName}</td>
                    <td className="p-4">{booking.category?.name}</td>
                    <td className="p-4">{booking.checkInDate} to {booking.checkOutDate}</td>
                    <td className="p-4 text-right font-bold text-navy">₹{booking.grandTotal.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        booking.bookingStatus === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10'
                          : booking.bookingStatus === 'CHECKED_IN'
                          ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10'
                          : booking.bookingStatus === 'CHECKED_OUT'
                          ? 'bg-stone-100 text-stone-600'
                          : 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/20'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => openDetails(booking)}
                        className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-[10px] font-bold uppercase hover:bg-stone-50 text-navy"
                      >
                        <Eye className="h-3 w-3" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white overflow-hidden shadow-2xl border border-stone-100 animate-in fade-in zoom-in duration-300">
            <div className="bg-navy p-6 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Reservation details</span>
                <h3 className="font-serif text-lg font-bold">{selectedBooking.bookingReference}</h3>
              </div>
              <button onClick={() => setDetailModal(false)} className="text-white hover:text-stone-300">✕</button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Guest Information</span>
                <p className="text-sm font-bold text-navy"><User className="h-4 w-4 inline mr-1 text-gold" /> {selectedBooking.guest.firstName} {selectedBooking.guest.lastName}</p>
                <p className="text-xs text-stone-600">Email: {selectedBooking.guest.email} | Mobile: {selectedBooking.guest.mobile}</p>
                <p className="text-xs text-stone-600">Billing Address: {selectedBooking.guest.address}, {selectedBooking.guest.city} (GST State: {selectedBooking.guest.stateCode})</p>
                {selectedBooking.guest.gstin && <p className="text-xs font-semibold text-navy">Corporate GSTIN: {selectedBooking.guest.gstin}</p>}
              </div>

              <div className="border-t border-stone-100 pt-4 space-y-2">
                <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Stay Details</span>
                <p className="text-xs">Room Type: <strong>{selectedBooking.category?.name}</strong></p>
                {selectedBooking.assignedRooms && selectedBooking.assignedRooms.length > 0 && <p className="text-xs text-emerald-700">Assigned Physical Room: <strong>Room {selectedBooking.assignedRooms[0].roomNumber}</strong></p>}
                <p className="text-xs flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-stone-400" /> Stay: {selectedBooking.checkInDate} to {selectedBooking.checkOutDate}</p>
                <p className="text-xs">Capacity: {selectedBooking.adultsCount} Adults</p>
              </div>

              <div className="border-t border-stone-100 pt-4 space-y-2 text-xs">
                <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Invoice Ledger (SAC 996311)</span>
                <div className="flex justify-between">
                  <span>Base Accommodation cost:</span>
                  <span>₹{selectedBooking.baseAmount.toLocaleString('en-IN')}</span>
                </div>
                {selectedBooking.discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount applied:</span>
                    <span>-₹{selectedBooking.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-500 pl-4 border-l border-stone-200">
                  <span>GST Tax amount:</span>
                  <span>₹{selectedBooking.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-navy border-t border-stone-100 pt-2 text-sm">
                  <span>Grand Total Tariff:</span>
                  <span>₹{selectedBooking.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 p-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setDetailModal(false)}
                className="rounded-xl bg-navy text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-navy-light"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
