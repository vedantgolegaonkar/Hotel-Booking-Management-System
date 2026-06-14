'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';

export default function RestaurantCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await fetchWithAuth('/restaurant/categories');
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/restaurant/categories', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      setFormData({ name: '', description: '', isActive: true });
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">Dining Categories</h1>
          <p className="text-stone-500 text-sm mt-1">Manage restaurant seating areas.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-serif text-xl font-bold text-navy">{cat.name}</h3>
              <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {cat.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-stone-500 text-sm flex-grow">{cat.description || 'No description provided.'}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-navy mb-4">Add Category</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Name</label>
                <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full rounded-xl border border-stone-200 px-4 py-2 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full rounded-xl border border-stone-200 px-4 py-2 text-sm focus:border-gold focus:outline-none" rows={3}></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-stone-500 hover:bg-stone-50 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gold hover:bg-yellow-600 text-white rounded-xl text-sm font-semibold transition-colors">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
