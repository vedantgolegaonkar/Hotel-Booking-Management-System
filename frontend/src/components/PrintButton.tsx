'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-navy hover:bg-navy-light text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
    >
      <Printer className="h-4 w-4" /> Print Tax Invoice
    </button>
  );
}
