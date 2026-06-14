'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';

export default function MenuManagerPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: { id: '' }, isVegetarian: false, isAvailable: true });

  useEffect(() => {
    Promise.all([
      fetchWithAuth('/menu/items'),
      fetchWithAuth('/menu/categories')
    ]).then(([itemsData, catsData]) => {
      setMenuItems(itemsData);
      setCategories(catsData);
      if (catsData.length > 0) setFormData(prev => ({ ...prev, category: { id: catsData[0].id } }));
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/menu/items', {
        method: 'POST',
        body: JSON.stringify({...formData, price: parseFloat(formData.price)}),
      });
      setShowModal(false);
      const res = await fetchWithAuth('/menu/items');
      setMenuItems(res);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await fetchWithAuth(`/menu/items/${id}`, { method: 'DELETE' });
      const res = await fetchWithAuth('/menu/items');
      setMenuItems(res);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">Menu Manager</h1>
          <p className="text-stone-500 text-sm mt-1">Manage restaurant menu items and pricing.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 border-b border-stone-100 text-stone-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Item Name</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Tags</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {menuItems.map((item) => (
              <tr key={item.id} className="hover:bg-stone-50/50">
                <td className="px-6 py-4">
                  <div className="font-bold text-navy">{item.name}</div>
                  <div className="text-xs text-stone-500 truncate max-w-xs">{item.description}</div>
                </td>
                <td className="px-6 py-4 text-stone-600">{item.category?.name}</td>
                <td className="px-6 py-4 font-semibold text-navy">${item.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  {item.isVegetarian && <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-green-100 text-green-700">VEG</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${item.isAvailable ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isAvailable ? 'Available' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => deleteItem(item.id)} className="text-stone-400 hover:text-red-500 p-1"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-navy mb-4">Add Menu Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Name</label>
                <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full rounded-xl border border-stone-200 px-4 py-2 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Description</label>
                <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full rounded-xl border border-stone-200 px-4 py-2 text-sm focus:border-gold focus:outline-none" rows={2}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Price</label>
                  <input type="number" step="0.01" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full rounded-xl border border-stone-200 px-4 py-2 text-sm focus:border-gold focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Category</label>
                  <select required value={formData.category.id} onChange={(e) => setFormData({...formData, category: { id: e.target.value }})} className="w-full rounded-xl border border-stone-200 px-4 py-2 text-sm focus:border-gold focus:outline-none">
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="veg" checked={formData.isVegetarian} onChange={(e) => setFormData({...formData, isVegetarian: e.target.checked})} className="rounded text-gold focus:ring-gold" />
                <label htmlFor="veg" className="text-sm text-stone-600">Is Vegetarian</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-stone-500 hover:bg-stone-50 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gold hover:bg-yellow-600 text-white rounded-xl text-sm font-semibold transition-colors">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
