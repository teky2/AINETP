import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, X, Zap, ShieldCheck } from 'lucide-react';

interface AndroidInstallBannerProps {
  onOpenAndroidHub: () => void;
}

export const AndroidInstallBanner: React.FC<AndroidInstallBannerProps> = ({
  onOpenAndroidHub,
}) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem('netpulse_android_banner_dismissed');
      if (isDismissed === 'true') {
        setDismissed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('netpulse_android_banner_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  if (isInstalled || dismissed) return null;

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-[#071924] via-[#091522] to-[#0d1e1c] p-4 shadow-xl shadow-emerald-950/20 backdrop-blur-md">
      {/* Background Android decorative glow */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex items-start space-x-3.5">
          <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[1.5px] shadow-lg shadow-emerald-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#09121d]">
              <Smartphone className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Android App Ready
              </span>
              <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800">
                WebAPK / PWA
              </span>
              <span className="hidden md:inline-flex rounded bg-cyan-950/80 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-800/60">
                v1.0.0
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Install NetPulse on your Android device for native full-screen diagnostics, haptic speed alerts, screen wake lock, and offline test history.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {isInstallable ? (
            <button
              onClick={install}
              className="flex flex-1 sm:flex-initial items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Install to Android</span>
            </button>
          ) : (
            <button
              onClick={onOpenAndroidHub}
              className="flex flex-1 sm:flex-initial items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 transition cursor-pointer shadow-md shadow-emerald-950/40"
            >
              <Smartphone className="h-4 w-4" />
              <span>Android APK Hub</span>
            </button>
          )}

          <button
            onClick={onOpenAndroidHub}
            className="hidden md:flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition cursor-pointer"
          >
            <span>TWA Config</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-2 text-slate-400 hover:text-slate-200 transition cursor-pointer rounded-lg hover:bg-slate-800"
            title="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
