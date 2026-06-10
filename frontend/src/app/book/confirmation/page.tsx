'use client';

import { useState, useEffect, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { Booking } from '@/lib/types';
import { Loader2, AlertCircle, CheckCircle, Printer, Calendar, MapPin, Tag, ArrowLeft } from 'lucide-react';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id') || '';

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    } else {
      setLoading(false);
      setErrorMsg('No booking reference provided in parameters.');
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await api.getBooking(bookingId);
      setBooking(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load booking verification detail.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="h-10 w-10 text-gold animate-spin mx-auto mb-3" />
        <span className="text-sm font-semibold text-stone-500">Retrieving voucher details...</span>
      </div>
    );
  }

  if (errorMsg || !booking) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-sm text-red-600 max-w-lg mx-auto my-12">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <span>{errorMsg || 'Booking records not found.'}</span>
      </div>
    );
  }

  const taxableValue = booking.baseAmount - booking.discountAmount;
  const isLocal = booking.guest.stateCode === 'GA';
  const invoice = {
    invoiceNumber: `INV-${booking.bookingReference.substring(0, 8).toUpperCase()}`,
    baseAmount: booking.baseAmount,
    discountAmount: booking.discountAmount,
    taxableValue: taxableValue,
    cgst: isLocal ? booking.taxAmount / 2 : 0,
    sgst: isLocal ? booking.taxAmount / 2 : 0,
    igst: isLocal ? 0 : booking.taxAmount,
    grandTotal: booking.grandTotal,
    issueDate: booking.createdAt ? booking.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 print:my-0">
      
      {/* Visual Success card */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 text-center space-y-2 print:hidden">
        <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-emerald-950">Reservation Confirmed!</h2>
        <p className="text-xs text-emerald-700">
          Your room hold is verified. We look forward to welcoming you to Goa.
        </p>
      </div>

      {/* Control Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-400 text-stone-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Website
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-navy hover:bg-navy-light text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
        >
          <Printer className="h-4 w-4" /> Print Tax Invoice
        </button>
      </div>

      {/* Invoice Layout */}
      <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-6 border-b border-stone-100 pb-8">
          <div>
            <h1 className="font-serif text-3xl font-extrabold text-navy uppercase tracking-wider">Somnika</h1>
            <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">Heritage Resort & Spa Goa</p>
            <p className="text-xs text-stone-500 mt-2">
              Vagator Beach Road, Anjuna, Goa 403509<br />
              GSTIN: 30AAAAA9999A1Z2 | SAC 996311
            </p>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">Tax Invoice</span>
            <span className="text-sm font-black text-navy block">{invoice.invoiceNumber}</span>
            <span className="text-xs text-stone-500 block">Date: {invoice.issueDate}</span>
            <span className="text-xs text-stone-500 block">Ref: {booking.bookingReference}</span>
          </div>
        </div>

        {/* Invoice Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-stone-600">
          <div>
            <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block mb-2">Guest Billing Profile</span>
            <p className="font-bold text-navy text-sm mb-1">{booking.guest.firstName} {booking.guest.lastName}</p>
            <p>{booking.guest.address}</p>
            <p>{booking.guest.city}, State Code: {booking.guest.stateCode}</p>
            <p>Mobile: {booking.guest.mobile} | Email: {booking.guest.email}</p>
            {booking.guest.gstin && <p className="mt-1.5 font-semibold">Corporate GSTIN: {booking.guest.gstin}</p>}
          </div>
          <div>
            <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block mb-2">Stay Parameters</span>
            <p className="font-semibold text-navy">{booking.category.name}</p>
            <p className="flex items-center gap-1.5 mt-1.5"><Calendar className="h-3.5 w-3.5 text-stone-400" /> Check-In: <strong>{booking.checkInDate}</strong></p>
            <p className="flex items-center gap-1.5 mt-1"><Calendar className="h-3.5 w-3.5 text-stone-400" /> Check-Out: <strong>{booking.checkOutDate}</strong></p>
            <p className="mt-2">Occupancy: <strong>{booking.adultsCount} Adults</strong></p>
          </div>
        </div>

        {/* Items Table */}
        <div className="border-t border-b border-stone-100 py-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] text-stone-400 font-bold uppercase tracking-wider border-b border-stone-100 pb-3 text-left">
                <th className="font-bold py-2">Service Description</th>
                <th className="font-bold py-2 text-right">SAC Code</th>
                <th className="font-bold py-2 text-right">Base Price</th>
                <th className="font-bold py-2 text-right">Discount</th>
                <th className="font-bold py-2 text-right">Taxable Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-50 py-3 text-stone-700">
                <td className="py-3 font-semibold text-navy">
                  Accommodation Charges - {booking.category.name}
                  <span className="text-[10px] text-stone-400 block mt-0.5">Stay duration from {booking.checkInDate} to {booking.checkOutDate}</span>
                </td>
                <td className="py-3 text-right">996311</td>
                <td className="py-3 text-right">₹{invoice.baseAmount.toLocaleString('en-IN')}</td>
                <td className="py-3 text-right text-success">-₹{invoice.discountAmount.toLocaleString('en-IN')}</td>
                <td className="py-3 text-right font-semibold">₹{invoice.taxableValue.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Taxes and Ledger Totals */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-6 text-xs text-stone-600">
          <div>
            <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block mb-2">GST Slab Designation</span>
            <p className="leading-relaxed">
              Accommodation tariff is taxed under **SAC 996311**. Daily tariff splits:<br />
              - Tariffs &lt; ₹7,500/night trigger **12% GST** slab.<br />
              - Tariffs &ge; ₹7,500/night trigger **18% GST** slab.
            </p>
          </div>
          
          <div className="w-full sm:w-80 space-y-3 border-t sm:border-t-0 sm:pt-0 pt-4">
            <div className="flex justify-between text-stone-500">
              <span>Net Taxable Value</span>
              <span>₹{invoice.taxableValue.toLocaleString('en-IN')}</span>
            </div>
            
            {/* Tax splits */}
            {isLocal ? (
              <>
                <div className="flex justify-between text-stone-500">
                  <span>Central CGST ({invoice.taxableValue > 0 ? (invoice.cgst / invoice.taxableValue * 100).toFixed(1) : 9}%)</span>
                  <span>₹{invoice.cgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>State SGST ({invoice.taxableValue > 0 ? (invoice.sgst / invoice.taxableValue * 100).toFixed(1) : 9}%)</span>
                  <span>₹{invoice.sgst.toLocaleString('en-IN')}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-stone-500">
                <span>Integrated IGST ({invoice.taxableValue > 0 ? (invoice.igst / invoice.taxableValue * 100).toFixed(1) : 18}%)</span>
                <span>₹{invoice.igst.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between text-navy font-bold text-sm border-t border-stone-100 pt-3">
              <span>Grand Total Paid</span>
              <span>₹{invoice.grandTotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="rounded-xl bg-stone-50 p-3 text-[10px] text-stone-400 border border-stone-100 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-gold flex-shrink-0" />
              <span>Paid online via Razorpay (verified).</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50/30">
      <Navbar />

      <main className="flex-grow mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <Suspense fallback={
          <div className="text-center py-20">
            <Loader2 className="h-10 w-10 text-gold animate-spin mx-auto mb-3" />
            <span className="text-sm font-semibold text-stone-500">Loading invoice details...</span>
          </div>
        }>
          <ConfirmationContent />
        </Suspense>
      </main>

      <footer className="bg-navy text-stone-400 py-8 text-center text-xs border-t border-navy-light print:hidden">
        <p>© 2026 Somnika Heritage Resort & Spa. All rights reserved.</p>
      </footer>
    </div>
  );
}
