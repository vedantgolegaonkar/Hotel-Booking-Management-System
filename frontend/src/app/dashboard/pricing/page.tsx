'use client';

import { roomsService } from '@/lib/services/rooms.service';

import { useState, useEffect } from 'react';
import { RoomCategory } from '@/lib/types';
import { Loader2, AlertCircle, CheckCircle, Percent, DollarSign, Calendar } from 'lucide-react';

export default function PricingPage() {
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editing states
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Seasonal markup rules state (local state mock for full validation)
  const [seasonalRules, setSeasonalRules] = useState([
    { id: 1, name: 'Christmas & New Year Peak', start: '2026-12-20', end: '2027-01-05', markupPercent: 35 },
    { id: 2, name: 'Monsoon Discount Season', start: '2026-06-15', end: '2026-09-15', markupPercent: -20 },
  ]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await roomsService.getCategories();
      setCategories(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch room categories.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (cat: RoomCategory) => {
    setEditingCatId(cat.id);
    setEditPrice(String(cat.basePrice));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleUpdatePrice = async (e: React.FormEvent, cat: RoomCategory) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        ...cat,
        basePrice: Number(editPrice),
      };
      await roomsService.updateCategoryPrice(cat.id, payload);
      setSuccessMsg(`Base pricing updated successfully for ${cat.name}!`);
      setEditingCatId(null);
      fetchCategories();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update category price.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-navy">Pricing Configurator</h1>
        <p className="text-sm text-stone-500">Configure room category base tariffs and establish custom seasonal markup parameters.</p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Room Base price list */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-serif text-xl font-bold text-navy">Base Room Tariffs</h3>
          
          {loading ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
              <Loader2 className="h-10 w-10 text-gold animate-spin mx-auto mb-3" />
              <span className="text-sm font-semibold text-stone-500">Retrieving categories...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.id} className="rounded-3xl bg-white border border-stone-100 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-navy">{cat.name}</h4>
                    <p className="text-xs text-stone-500">Capacity: max {cat.capacity} guests | SAC 996311</p>
                  </div>
                  
                  {editingCatId === cat.id ? (
                    <form onSubmit={(e) => handleUpdatePrice(e, cat)} className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-stone-500">₹</span>
                        <input
                          type="number"
                          required
                          value={editPrice}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (/^0[0-9]/.test(val)) {
                              val = val.replace(/^0+/, '');
                            }
                            setEditPrice(val);
                          }}
                          className="rounded-xl border border-stone-200 pl-6 pr-3 py-2 text-xs focus:outline-none w-32 font-bold"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-xl bg-navy text-white px-4 py-2 text-xs font-bold uppercase transition-colors"
                      >
                        {submitting ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCatId(null)}
                        className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold uppercase hover:bg-stone-50"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Base Price</span>
                        <span className="text-xl font-extrabold text-navy">₹{cat.basePrice.toLocaleString('en-IN')}</span>
                      </div>
                      <button
                        onClick={() => startEdit(cat)}
                        className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-bold uppercase hover:bg-stone-50"
                      >
                        Edit Price
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seasonal Markup Rules Widget */}
        <div className="rounded-3xl bg-white border border-stone-100 p-8 shadow-sm space-y-6 h-fit">
          <h3 className="font-serif text-lg font-bold text-navy pb-3 border-b border-stone-100 flex items-center gap-1.5">
            <Percent className="h-5 w-5 text-gold" /> Seasonal Slabs
          </h3>
          
          <div className="space-y-4">
            {seasonalRules.map((rule) => (
              <div key={rule.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-100 text-xs space-y-2">
                <div className="flex justify-between font-bold text-navy">
                  <span>{rule.name}</span>
                  <span className={rule.markupPercent > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                    {rule.markupPercent > 0 ? `+${rule.markupPercent}%` : `${rule.markupPercent}%`}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-stone-500">
                  <Calendar className="h-4.5 w-4.5 text-stone-400" />
                  <span>{rule.start} to {rule.end}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-stone-100 text-[10px] text-stone-400 leading-relaxed">
            <strong>System Integration:</strong> Seasonal slabbing automatically calculates nighttime tariffs when guests search stay calendars, applying CGST/SGST/IGST tax rates on net values after markups are processed.
          </div>
        </div>

      </div>
    </div>
  );
}
