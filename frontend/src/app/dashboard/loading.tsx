export default function DashboardLoading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-stone-100 border-t-gold animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 bg-gold/20 rounded-full animate-pulse" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="font-serif text-lg font-bold text-navy">
          Synchronizing Data
        </h3>
        <p className="text-xs text-stone-500 animate-pulse">
          Fetching latest records...
        </p>
      </div>
    </div>
  );
}
