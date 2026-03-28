'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-binance-bg flex items-center justify-center p-6">
      <div className="bg-binance-surface rounded-xl border border-binance-border p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <h2 className="text-xl font-bold text-binance-text mb-2">
          Something went wrong
        </h2>
        
        <p className="text-binance-secondary text-sm mb-6">
          {error.message || 'An unexpected error occurred while loading the dashboard.'}
        </p>
        
        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-binance-brand text-black font-medium rounded-lg hover:bg-binance-brand/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
        
        {error.digest && (
          <p className="text-xs text-binance-secondary mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}