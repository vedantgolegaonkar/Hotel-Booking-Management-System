'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Booking, Room } from '@/lib/types';
import { Search, Loader2, AlertCircle, Calendar, User, Key, Receipt, CheckCircle, FileText, CheckCircle2, UserCheck, ShieldAlert } from 'lucide-react';

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
  const [assignedRoomId, setAssignedRoomId] = useState<number | ''>('');
  const [idProofType, setIdProofType] = useState('AADHAR');
  const [idProofUrl, setIdProofUrl] = useState('https://id-proofs.resort.com/docs/mock-id.pdf');
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);

  // Check-out Modal
  const [checkOutModal, setCheckOutModal] = useState(false);
  const [extraIncidentals, setExtraIncidentals] = useState<number | string>(0);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [txRef, setTxRef] = useState('');
  const [submittingCheckOut, setSubmittingCheckOut] = useState(false);

  // Invoice view after checkout
  const [invoiceViewBooking, setInvoiceViewBooking] = useState<any | null>(null);

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
    setAssignedRoomId('');
    setErrorMsg('');
    try {
      const rooms = await api.getAvailableRoomsForCategory(booking.category.id);
      setAvailableRooms(rooms || []);
      if (rooms && rooms.length > 0) {
        setAssignedRoomId(rooms[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch available rooms.');
    }
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !assignedRoomId) return;
    setSubmittingCheckIn(true);
    setErrorMsg('');

    try {
      await api.checkIn(selectedBooking.id, {
        assignedRoomId: Number(assignedRoomId),
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
    setExtraIncidentals('0');
    setTxRef('');
    setErrorMsg('');
  };

  const handleCheckOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setSubmittingCheckOut(true);
    setErrorMsg('');

    try {
      const checkoutRes = await api.checkOut(selectedBooking.id, {
        extraIncidentals: Number(extraIncidentals) || 0,
        paymentMethod,
        txRef: txRef.trim() !== '' ? txRef : 'tx_' + Math.random().toString(36).substring(2, 12),
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

      {/* Check-in Modal Overlay */}
      {checkInModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white overflow-hidden shadow-2xl border border-stone-100 animate-in fade-in zoom-in duration-300">
            <div className="bg-gold p-6 text-white text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-navy/70 block mb-1">Check-in Process</span>
              <h3 className="font-serif text-xl font-semibold">Assign Physical Room</h3>
              <p className="text-gold-hover text-xs mt-1">Guest: {selectedBooking.guest.firstName} {selectedBooking.guest.lastName}</p>
            </div>

            <form onSubmit={handleCheckInSubmit} className="p-6 space-y-6">
              {availableRooms.length === 0 ? (
                <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-800 leading-relaxed flex gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <strong>No Rooms Ready:</strong> There are no physical rooms of category <em>{selectedBooking.category.name}</em> with status <strong>AVAILABLE</strong>. Please check housekeeping status or claim cleaning completion.
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Available Physical Rooms *</label>
                  <select
                    required
                    value={assignedRoomId}
                    onChange={(e) => setAssignedRoomId(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                  >
                    {availableRooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        Room {room.roomNumber} (Floor {room.floor})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">ID Proof Type *</label>
                  <select
                    value={idProofType}
                    onChange={(e) => setIdProofType(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                  >
                    <option value="AADHAR">Aadhar Card</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="VOTER_ID">Voter ID</option>
                    <option value="DRIVING_LICENSE">Driving License</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">ID File Attachment Link *</label>
                  <input
                    type="text"
                    required
                    value={idProofUrl}
                    onChange={(e) => setIdProofUrl(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-stone-100 justify-end">
                <button
                  type="button"
                  onClick={() => setCheckInModal(false)}
                  className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-500 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCheckIn || availableRooms.length === 0}
                  className="rounded-xl bg-gold hover:bg-gold-hover text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  {submittingCheckIn && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check-out Modal Overlay */}
      {checkOutModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white overflow-hidden shadow-2xl border border-stone-100 animate-in fade-in zoom-in duration-300">
            <div className="bg-navy p-6 text-white text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold block mb-1">Check-out Process</span>
              <h3 className="font-serif text-xl font-semibold">Incidentals & Invoice Settlement</h3>
              <p className="text-stone-400 text-xs mt-1">Ref: {selectedBooking.bookingReference}</p>
            </div>

            <form onSubmit={handleCheckOutSubmit} className="p-6 space-y-6">
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
                  onClick={() => setCheckOutModal(false)}
                  className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-500 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCheckOut}
                  className="rounded-xl bg-navy hover:bg-navy-light text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  {submittingCheckOut && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice PDF-like View Overlay */}
      {invoiceViewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-stone-100 p-8 my-8 relative animate-in fade-in zoom-in duration-300">
            {/* Close button */}
            <button
              onClick={() => setInvoiceViewBooking(null)}
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
                <strong>Invoice ID:</strong> {invoiceViewBooking.bookingReference}
              </div>
              <div>
                <strong>Guest Name:</strong> {invoiceViewBooking.guest.firstName} {invoiceViewBooking.guest.lastName}
              </div>
              <div className="text-right">
                <strong>Place of Supply:</strong> Goa (GA)
              </div>
              {invoiceViewBooking.guest.gstin && (
                <div>
                  <strong>Guest GSTIN:</strong> {invoiceViewBooking.guest.gstin}
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="py-6 space-y-4 text-sm">
              <div className="flex justify-between text-navy font-semibold">
                <span>Room Category Base Tariff</span>
                <span>₹{invoiceViewBooking.baseAmount.toLocaleString('en-IN')}</span>
              </div>
              {invoiceViewBooking.discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Coupon Discount Applied</span>
                  <span>-₹{invoiceViewBooking.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* GST Splits block */}
              <div className="pl-4 border-l-2 border-stone-200 text-xs text-stone-500 space-y-2">
                {invoiceViewBooking.guest.stateCode === 'GA' ? (
                  <>
                    <div className="flex justify-between">
                      <span>Central GST (CGST)</span>
                      <span>₹{(invoiceViewBooking.taxAmount / 2).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State GST (SGST)</span>
                      <span>₹{(invoiceViewBooking.taxAmount / 2).toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span>Integrated GST (IGST)</span>
                    <span>₹{invoiceViewBooking.taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="flex justify-between font-bold text-navy text-lg pt-4 border-t border-stone-100">
                <span>Grand Total Settled</span>
                <span>₹{invoiceViewBooking.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Room assignment check */}
            <div className="rounded-2xl bg-stone-50 p-4 text-[10px] text-stone-500 leading-relaxed border border-stone-100 flex gap-2">
              <UserCheck className="h-4 w-4 text-gold flex-shrink-0" />
              <div>
                <strong>Audit Details:</strong> Stay concluded from {invoiceViewBooking.checkInDate} to {invoiceViewBooking.checkOutDate}. Assigned physical room was <strong>Room {invoiceViewBooking.assignedRooms?.[0]?.roomNumber}</strong>. Room status updated to <strong>CLEANING</strong> to trigger immediate housekeeper assignment.
              </div>
            </div>

            <div className="text-center pt-6">
              <button
                onClick={() => setInvoiceViewBooking(null)}
                className="rounded-xl bg-navy hover:bg-navy-light text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Close Invoice View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
