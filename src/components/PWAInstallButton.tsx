import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Check, Sparkles } from 'lucide-react';

interface PWAInstallButtonProps {
  onOpenAndroidHub?: () => void;
  variant?: 'compact' | 'full' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenAndroidHub,
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed in standalone mode
  if (isInstalled) {
    if (variant === 'compact') {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
          <Check className="h-3 w-3" />
          <span>Android App Active</span>
        </span>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
      }
    } else if (onOpenAndroidHub) {
      onOpenAndroidHub();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  if (variant === 'full') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Smartphone className="h-4 w-4" />
          <span>{isAndroid ? 'Install Android App (APK / PWA)' : 'Install NetPulse App'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-[#0d1424] p-6 shadow-2xl">
              <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                1. Tap the <strong className="text-cyan-400">Share</strong> button in Safari toolbar.<br />
                2. Scroll down and tap <strong className="text-emerald-400">Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Compact header button
  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center space-x-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition-all cursor-pointer shadow-sm"
        title="Install Android App"
      >
        <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Install Android App</span>
        <span className="sm:hidden">Install</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-[#0d1424] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white">Install on Mobile</h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              1. Tap the <strong className="text-cyan-400">Share</strong> button in your browser toolbar.<br />
              2. Scroll down and select <strong className="text-emerald-400">Add to Home Screen / Install App</strong>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
