import { useState } from 'react';
import { Booking, Room } from '@/lib/types';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function CheckInModal({
  selectedBooking,
  availableRooms,
  onClose,
  onSubmit,
  submitting
}: {
  selectedBooking: Booking;
  availableRooms: Room[];
  onClose: () => void;
  onSubmit: (assignedRoomId: number, idProofType: string, idProofUrl: string) => void;
  submitting: boolean;
}) {
  const [assignedRoomId, setAssignedRoomId] = useState<number | ''>(availableRooms.length > 0 ? availableRooms[0].id : '');
  const [idProofType, setIdProofType] = useState('AADHAR');
  const [idProofUrl, setIdProofUrl] = useState('https://id-proofs.resort.com/docs/mock-id.pdf');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedRoomId) return;
    onSubmit(Number(assignedRoomId), idProofType, idProofUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white overflow-hidden shadow-2xl border border-stone-100 animate-in fade-in zoom-in duration-300">
        <div className="bg-gold p-6 text-white text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-navy/70 block mb-1">Check-in Process</span>
          <h3 className="font-serif text-xl font-semibold">Assign Physical Room</h3>
          <p className="text-gold-hover text-xs mt-1">Guest: {selectedBooking.guest.firstName} {selectedBooking.guest.lastName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              onClick={onClose}
              className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-500 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || availableRooms.length === 0}
              className="rounded-xl bg-gold hover:bg-gold-hover text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Check-in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
