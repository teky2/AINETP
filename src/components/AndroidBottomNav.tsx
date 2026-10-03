import React from 'react';
import { Gauge, Sliders, Cpu, History, Smartphone } from 'lucide-react';

interface AndroidBottomNavProps {
  activeTab: 'test' | 'telemetry' | 'diagnostics' | 'sla' | 'monetization';
  onTabChange: (tab: 'test' | 'telemetry' | 'diagnostics' | 'sla' | 'monetization') => void;
  onOpenAndroidHub: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  onHapticClick?: () => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAndroidHub,
  onOpenHistory,
  historyCount,
  onHapticClick,
}) => {
  const handleNav = (action: () => void) => {
    if (onHapticClick) onHapticClick();
    action();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/80 bg-[#070b14]/95 backdrop-blur-xl px-2 py-1.5 md:hidden shadow-[0_-8px_24px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Speed Test */}
        <button
          onClick={() => handleNav(() => onTabChange('test'))}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'test'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-full transition-colors ${
              activeTab === 'test' ? 'bg-cyan-500/20' : 'bg-transparent'
            }`}
          >
            <Gauge className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Speed Test</span>
        </button>

        {/* Live Graphs */}
        <button
          onClick={() => handleNav(() => onTabChange('telemetry'))}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'telemetry'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-full transition-colors ${
              activeTab === 'telemetry' ? 'bg-cyan-500/20' : 'bg-transparent'
            }`}
          >
            <Sliders className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Telemetry</span>
        </button>

        {/* AI Engine */}
        <button
          onClick={() => handleNav(() => onTabChange('diagnostics'))}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'diagnostics'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-full transition-colors ${
              activeTab === 'diagnostics' ? 'bg-emerald-500/20' : 'bg-transparent'
            }`}
          >
            <Cpu className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">AI Diagnostic</span>
        </button>

        {/* Test History */}
        <button
          onClick={() => handleNav(onOpenHistory)}
          className="relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-200"
        >
          <div className="p-1 rounded-full bg-transparent relative">
            <History className="h-5 w-5" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-600 px-1 text-[9px] font-bold text-white">
                {historyCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">History</span>
        </button>

        {/* Android Hub (APK & TWA) */}
        <button
          onClick={() => handleNav(onOpenAndroidHub)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer text-emerald-400 hover:text-emerald-300"
        >
          <div className="p-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <Smartphone className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold text-emerald-300">Android APK</span>
        </button>
      </div>
    </nav>
  );
};
