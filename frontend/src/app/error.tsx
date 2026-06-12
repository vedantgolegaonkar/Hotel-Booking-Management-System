'use client';

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-red-50/50 border border-red-100 rounded-2xl p-8 shadow-sm backdrop-blur-sm"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-8">
          We apologize for the inconvenience. An unexpected error has occurred while loading this section.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full sm:w-auto"
        >
          <RefreshCcw className="w-4 h-4" />
          Try again
        </button>
      </motion.div>
    </div>
  );
}
