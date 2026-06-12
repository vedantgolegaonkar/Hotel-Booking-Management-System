export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-stone-50/80 backdrop-blur-sm z-50">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="h-20 w-20 rounded-full border-4 border-stone-200 border-t-gold animate-spin" />
        
        {/* Inner pulsing core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 bg-gold/20 rounded-full animate-pulse" />
        </div>
      </div>
      
      <div className="mt-8 text-center space-y-2">
        <h2 className="font-serif text-2xl font-bold text-navy tracking-wide">
          Somnika
        </h2>
        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest animate-pulse">
          Curating Your Experience
        </p>
      </div>
    </div>
  );
}
