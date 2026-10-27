import React, { useState, useEffect } from 'react';
import { setOnServerWakeup } from '../services/api.js';
import { Loader2, RefreshCw } from 'lucide-react';

export const ServerWarmupNotice = () => {
  const [isWakingUp, setIsWakingUp] = useState(false);

  useEffect(() => {
    setOnServerWakeup((waking) => {
      setIsWakingUp(waking);
    });
  }, []);

  if (!isWakingUp) return null;

  return (
    <div className="bg-amber-500 text-white px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-center space-x-2 shadow-sm transition-all animate-in fade-in">
      <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
      <span>
        Connecting to backend server... (Render free instances may take ~30–50s on initial cold start). Thank you for your patience!
      </span>
      <button
        onClick={() => window.location.reload()}
        className="ml-2 underline flex items-center space-x-1 hover:text-amber-100"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Retry</span>
      </button>
    </div>
  );
};

export default ServerWarmupNotice;
