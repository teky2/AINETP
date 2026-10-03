import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-amber-500/50 bg-[#0f172a]/95 px-4 py-2 text-xs font-medium text-amber-300 shadow-2xl backdrop-blur-md animate-bounce">
      <WifiOff className="h-4 w-4 text-amber-400" />
      <span>Offline Mode — Cached data and offline diagnostics active</span>
    </div>
  );
};
