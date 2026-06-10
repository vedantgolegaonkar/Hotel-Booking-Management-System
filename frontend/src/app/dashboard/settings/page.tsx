'use client';

import { useState } from 'react';
import { Shield, Save, Percent, Key, Landmark, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Global settings state
  const [settings, setSettings] = useState({
    resortName: 'Somnika Heritage Resort & Spa',
    stateCode: 'GA', // Goa home supply state
    gstin: '30AAAAA9999A1Z2',
    sacCode: '996311',
    gstSlabLower: 12, // For tariff < 7500
    gstSlabUpper: 18, // For tariff >= 7500
    razorpayKeyId: 'rzp_test_somnikaKey123',
    razorpaySecret: '••••••••••••••••••••••••',
    sandboxMode: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setTimeout(() => {
      setSuccessMsg('Global configurations updated successfully!');
      setSubmitting(false);
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold text-navy flex items-center gap-2">
          <Shield className="h-8 w-8 text-gold" /> System Configurations
        </h1>
        <p className="text-sm text-stone-500">Configure Indian GST compliance parameters, SAC designations, and Razorpay endpoints.</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Tax slab parameters */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
          <h3 className="font-serif text-lg font-bold text-navy flex items-center gap-2 border-b border-stone-100 pb-3">
            <Percent className="h-5 w-5 text-gold" /> Tax slabs & Regulatory Rules
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Resort Home State (Place of Supply)</label>
              <select
                value={settings.stateCode}
                onChange={(e) => setSettings({...settings, stateCode: e.target.value})}
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs focus:outline-none"
              >
                <option value="GA">Goa (GA)</option>
                <option value="MH">Maharashtra (MH)</option>
                <option value="KA">Karnataka (KA)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Resort GSTIN</label>
              <input
                type="text"
                value={settings.gstin}
                onChange={(e) => setSettings({...settings, gstin: e.target.value})}
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">SAC Code (Accommodation)</label>
              <input
                type="text"
                value={settings.sacCode}
                onChange={(e) => setSettings({...settings, sacCode: e.target.value})}
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Lower GST Slab (&lt; ₹7500 Tariff)</label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.gstSlabLower}
                  onChange={(e) => setSettings({...settings, gstSlabLower: Number(e.target.value)})}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-xs focus:outline-none pr-10"
                />
                <span className="absolute right-4 top-3 text-xs text-stone-400 font-bold">%</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Upper GST Slab (&ge; ₹7500 Tariff)</label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.gstSlabUpper}
                  onChange={(e) => setSettings({...settings, gstSlabUpper: Number(e.target.value)})}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-xs focus:outline-none pr-10"
                />
                <span className="absolute right-4 top-3 text-xs text-stone-400 font-bold">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gateway settings */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
          <h3 className="font-serif text-lg font-bold text-navy flex items-center gap-2 border-b border-stone-100 pb-3">
            <Key className="h-5 w-5 text-gold" /> Razorpay Integrations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Razorpay API Key ID</label>
              <input
                type="text"
                value={settings.razorpayKeyId}
                onChange={(e) => setSettings({...settings, razorpayKeyId: e.target.value})}
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-xs focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Razorpay Secret Key</label>
              <input
                type="password"
                value={settings.razorpaySecret}
                onChange={(e) => setSettings({...settings, razorpaySecret: e.target.value})}
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-xs focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="sandbox"
              checked={settings.sandboxMode}
              onChange={(e) => setSettings({...settings, sandboxMode: e.target.checked})}
              className="h-4 w-4 text-gold rounded border-stone-300 focus:ring-gold"
            />
            <label htmlFor="sandbox" className="text-xs text-stone-600 font-semibold cursor-pointer">
              Enable sandbox testing callbacks (Simulate transaction panels instead of charging credit card rails)
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-navy hover:bg-navy-light text-white px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Save className="h-4 w-4 text-gold" />
            )}
            Save Configuration
          </button>
        </div>

      </form>
    </div>
  );
}

function Loader2(props: any) {
  return <div className={`animate-spin rounded-full border-2 border-t-transparent ${props.className}`} style={{ width: '1rem', height: '1rem' }} />;
}
