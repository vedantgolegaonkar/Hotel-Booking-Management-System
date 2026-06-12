'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Booking, Room } from '@/lib/types';
import { Search, Loader2, AlertCircle, Calendar, User, Key, Receipt, FileText } from 'lucide-react';
import CheckInModal from '@/components/reception/CheckInModal';
import CheckOutModal from '@/components/reception/CheckOutModal';
import InvoiceViewModal from '@/components/reception/InvoiceViewModal';

export default function ReceptionPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT'>('ALL');

  // Check-in Modal
  const [checkInModal, setCheckInModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);

  // Check-out Modal
  const [checkOutModal, setCheckOutModal] = useState(false);
  const [submittingCheckOut, setSubmittingCheckOut] = useState(false);

  // Invoice view after checkout
  const [invoiceViewBooking, setInvoiceViewBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async (search?: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await api.searchBookings(search);
      setBookings(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings(searchQuery);
  };

  const openCheckIn = async (booking: Booking) => {
    setSelectedBooking(booking);
    setCheckInModal(true);
    setErrorMsg('');
    try {
      const rooms = await api.getAvailableRoomsForCategory(booking.category.id);
      setAvailableRooms(rooms || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch available rooms.');
    }
  };

  const handleCheckInSubmit = async (assignedRoomId: number, idProofType: string, idProofUrl: string) => {
    if (!selectedBooking) return;
    setSubmittingCheckIn(true);
    setErrorMsg('');

    try {
      await api.checkIn(selectedBooking.id, {
        assignedRoomId,
        idProofType,
        idProofUrl,
      });
      setCheckInModal(false);
      fetchBookings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Check-in transaction failed.');
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  const openCheckOut = (booking: Booking) => {
    setSelectedBooking(booking);
    setCheckOutModal(true);
    setErrorMsg('');
  };

  const handleCheckOutSubmit = async (extraIncidentals: number, paymentMethod: string, txRef: string) => {
    if (!selectedBooking) return;
    setSubmittingCheckOut(true);
    setErrorMsg('');

    try {
      await api.checkOut(selectedBooking.id, {
        extraIncidentals,
        paymentMethod,
        txRef: txRef || 'tx_' + Math.random().toString(36).substring(2, 12),
      });
      setCheckOutModal(false);
      
      // Load full booking with invoice details
      const updatedBooking = await api.getBooking(selectedBooking.id);
      setInvoiceViewBooking(updatedBooking);
      fetchBookings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Check-out settlement failed.');
    } finally {
      setSubmittingCheckOut(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'CONFIRMED') return b.bookingStatus === 'CONFIRMED';
    if (activeTab === 'CHECKED_IN') return b.bookingStatus === 'CHECKED_IN';
    if (activeTab === 'CHECKED_OUT') return b.bookingStatus === 'CHECKED_OUT';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">Reception Dashboard</h1>
          <p className="text-sm text-stone-500">
            Search guest reservations, manage room checks, and generate checkout invoices.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-sm text-red-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search and Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-grow max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by Guest Name, Booking Reference, Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-gold focus:outline-none"
            />
          </div>
        </form>

        {/* Tab Filters */}
        <div className="flex bg-stone-200/50 p-1 rounded-xl items-center text-xs font-semibold uppercase tracking-wider text-stone-500">
          {(['ALL', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-white text-navy shadow-sm'
                  : 'hover:text-navy'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List Table */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <Loader2 className="h-10 w-10 text-gold animate-spin mx-auto mb-3" />
          <span className="text-sm font-semibold text-stone-500">Loading guest sheet...</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <Calendar className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-semibold text-navy mb-1">No Bookings Found</h3>
          <p className="text-stone-500 text-sm max-w-md mx-auto">
            Try adjusting your search criteria or changing the filters to view other reservation statuses.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-stone-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-xs font-bold text-stone-400 uppercase tracking-widest">
                  <th className="py-4 px-6">Guest Info</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Dates</th>
                  <th className="py-4 px-6">Reference</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* Guest */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-navy">
                          {booking.guest.firstName} {booking.guest.lastName}
                        </span>
                        <span className="text-xs text-stone-400">
                          {booking.guest.email} | {booking.guest.mobile}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-navy">{booking.category.name}</span>
                        {booking.assignedRooms && booking.assignedRooms.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-gold font-bold uppercase mt-0.5">
                            <Key className="h-3 w-3" /> Room {booking.assignedRooms[0].roomNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-medium text-stone-600">
                          {booking.checkInDate} to {booking.checkOutDate}
                        </span>
                        <span className="text-xs text-stone-400">
                          {booking.adultsCount} Adults
                        </span>
                      </div>
                    </td>

                    {/* Reference */}
                    <td className="py-4 px-6 font-mono text-xs font-bold text-stone-500">
                      {booking.bookingReference}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
                          booking.bookingStatus === 'CHECKED_IN'
                            ? 'bg-blue-50 text-blue-700 ring-blue-700/10'
                            : booking.bookingStatus === 'CHECKED_OUT'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10'
                            : booking.bookingStatus === 'CONFIRMED'
                            ? 'bg-stone-50 text-gold ring-gold/20'
                            : 'bg-red-50 text-red-700 ring-red-600/10'
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      {booking.bookingStatus === 'CONFIRMED' && (
                        <button
                          onClick={() => openCheckIn(booking)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gold hover:bg-gold-hover text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                          <User className="h-3.5 w-3.5" /> Check-in
                        </button>
                      )}
                      {booking.bookingStatus === 'CHECKED_IN' && (
                        <button
                          onClick={() => openCheckOut(booking)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-navy hover:bg-navy-light text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                          <Receipt className="h-3.5 w-3.5" /> Check-out
                        </button>
                      )}
                      {booking.bookingStatus === 'CHECKED_OUT' && (
                        <button
                          onClick={async () => {
                            try {
                              const updated = await api.getBooking(booking.id);
                              setInvoiceViewBooking(updated);
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" /> View Invoice
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {checkInModal && selectedBooking && (
        <CheckInModal
          selectedBooking={selectedBooking}
          availableRooms={availableRooms}
          onClose={() => setCheckInModal(false)}
          onSubmit={handleCheckInSubmit}
          submitting={submittingCheckIn}
        />
      )}

      {checkOutModal && selectedBooking && (
        <CheckOutModal
          selectedBooking={selectedBooking}
          onClose={() => setCheckOutModal(false)}
          onSubmit={handleCheckOutSubmit}
          submitting={submittingCheckOut}
        />
      )}

      {invoiceViewBooking && (
        <InvoiceViewModal
          booking={invoiceViewBooking}
          onClose={() => setInvoiceViewBooking(null)}
        />
      )}
    </div>
  );
}
