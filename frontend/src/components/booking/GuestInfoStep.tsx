import { FormEvent } from 'react';

export default function GuestInfoStep({
  guestDetails,
  setGuestDetails,
  onNext,
}: {
  guestDetails: any;
  setGuestDetails: (details: any) => void;
  onNext: (e: FormEvent) => void;
}) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
      <h2 className="font-serif text-2xl font-bold text-navy">Guest Identification Details</h2>
      <form onSubmit={onNext} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">First Name *</label>
            <input
              type="text"
              required
              value={guestDetails.firstName}
              onChange={(e) => setGuestDetails({...guestDetails, firstName: e.target.value})}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Last Name *</label>
            <input
              type="text"
              required
              value={guestDetails.lastName}
              onChange={(e) => setGuestDetails({...guestDetails, lastName: e.target.value})}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Email Address *</label>
            <input
              type="email"
              required
              value={guestDetails.email}
              onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Mobile Phone *</label>
            <input
              type="tel"
              required
              value={guestDetails.mobile}
              onChange={(e) => setGuestDetails({...guestDetails, mobile: e.target.value})}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Billing Address *</label>
            <input
              type="text"
              required
              value={guestDetails.address}
              onChange={(e) => setGuestDetails({...guestDetails, address: e.target.value})}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">City *</label>
            <input
              type="text"
              required
              value={guestDetails.city}
              onChange={(e) => setGuestDetails({...guestDetails, city: e.target.value})}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">GST State Rule *</label>
            <select
              value={guestDetails.stateCode}
              onChange={(e) => setGuestDetails({...guestDetails, stateCode: e.target.value})}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
            >
              <option value="GA">Goa (CGST + SGST Split)</option>
              <option value="MH">Maharashtra (IGST Split)</option>
              <option value="KA">Karnataka (IGST Split)</option>
              <option value="DL">Delhi (IGST Split)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Corporate GSTIN (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 30AAAAA1111A1Z1"
              value={guestDetails.gstin}
              onChange={(e) => setGuestDetails({...guestDetails, gstin: e.target.value})}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-navy hover:bg-navy-light text-white py-3 text-xs font-bold uppercase tracking-widest transition-all"
        >
          Proceed to Review
        </button>
      </form>
    </div>
  );
}
