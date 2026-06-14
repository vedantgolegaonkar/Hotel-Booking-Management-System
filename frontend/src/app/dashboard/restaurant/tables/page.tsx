'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { Loader2, Plus } from 'lucide-react';

export default function RestaurantTablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ tableNumber: '', capacity: 2, status: 'AVAILABLE', category: { id: '' } });

  useEffect(() => {
    Promise.all([
      fetchWithAuth('/restaurant/tables'),
      fetchWithAuth('/restaurant/categories')
    ]).then(([tablesData, catsData]) => {
      setTables(tablesData);
      setCategories(catsData);
      if (catsData.length > 0) setFormData(prev => ({ ...prev, category: { id: catsData[0].id } }));
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/restaurant/tables', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      const res = await fetchWithAuth('/restaurant/tables');
      setTables(res);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">Restaurant Tables</h1>
          <p className="text-stone-500 text-sm mt-1">Manage dining capacity and tables.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="h-4 w-4" /> Add Table
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 border-b border-stone-100 text-stone-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Table No.</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Capacity</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {tables.map((table) => (
              <tr key={table.id} className="hover:bg-stone-50/50">
                <td className="px-6 py-4 font-bold text-navy">{table.tableNumber}</td>
                <td className="px-6 py-4 text-stone-600">{table.category?.name}</td>
                <td className="px-6 py-4 text-stone-600">{table.capacity} Guests</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${table.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {table.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-navy mb-4">Add Table</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Table Number</label>
                <input required value={formData.tableNumber} onChange={(e) => setFormData({...formData, tableNumber: e.target.value})} className="w-full rounded-xl border border-stone-200 px-4 py-2 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Category</label>
                <select required value={formData.category.id} onChange={(e) => setFormData({...formData, category: { id: e.target.value }})} className="w-full rounded-xl border border-stone-200 px-4 py-2 text-sm focus:border-gold focus:outline-none">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Capacity</label>
                <input type="number" required min="1" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})} className="w-full rounded-xl border border-stone-200 px-4 py-2 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-stone-500 hover:bg-stone-50 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gold hover:bg-yellow-600 text-white rounded-xl text-sm font-semibold transition-colors">Save Table</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
