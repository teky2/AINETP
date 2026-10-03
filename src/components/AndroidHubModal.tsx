import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  X,
  Check,
  Copy,
  Terminal,
  Zap,
  Vibrate,
  Shield,
  Wifi,
  ExternalLink,
  Share2,
  FileCode,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import type { AndroidNetworkInfo } from '../hooks/useAndroidFeatures';
import type { SpeedMetrics, ClientInfo } from '../types';

interface AndroidHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  networkInfo: AndroidNetworkInfo;
  hapticsEnabled: boolean;
  onToggleHaptics: () => void;
  onTestHaptic: () => void;
  isWakeLockActive: boolean;
  isWakeLockSupported: boolean;
  onRequestWakeLock: () => void;
  onReleaseWakeLock: () => void;
  metrics: SpeedMetrics;
  clientInfo?: ClientInfo;
  onShareResult: () => void;
}

export const AndroidHubModal: React.FC<AndroidHubModalProps> = ({
  isOpen,
  onClose,
  networkInfo,
  hapticsEnabled,
  onToggleHaptics,
  onTestHaptic,
  isWakeLockActive,
  isWakeLockSupported,
  onRequestWakeLock,
  onReleaseWakeLock,
  metrics,
  clientInfo,
  onShareResult,
}) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'hardware' | 'twa' | 'share'>('install');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://netpulse.app';

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const bubblewrapCommand = `npm install -g @bubblewrap/cli
bubblewrap init --manifest="${currentOrigin}/manifest.webmanifest"
bubblewrap build`;

  const androidManifestSnippet = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.netpulse.ai">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:theme="@style/Theme.NetPulse">

        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:label="@string/app_name"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-[#0a1424] via-[#070b14] to-[#04070e] p-5 sm:p-6 shadow-2xl text-slate-100">
        
        {/* Glow corner */}
        <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[1.5px] shadow-lg shadow-emerald-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#09111c]">
                <Smartphone className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Android Native App Hub</h2>
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800">
                  WebAPK • TWA Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Package: <code className="text-cyan-300 font-mono">com.netpulse.ai</code> • Target Android 14+ (API 34)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1.5 border-b border-slate-800/80 py-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('install')}
            className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
              activeTab === 'install'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>1-Tap Install (WebAPK)</span>
          </button>

          <button
            onClick={() => setActiveTab('hardware')}
            className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
              activeTab === 'hardware'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Hardware & Haptics</span>
          </button>

          <button
            onClick={() => setActiveTab('twa')}
            className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
              activeTab === 'twa'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>Play Store / TWA Export</span>
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
              activeTab === 'share'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Android Share Sheet</span>
          </button>
        </div>

        {/* TAB 1: 1-Tap Install (WebAPK) */}
        {activeTab === 'install' && (
          <div className="py-4 space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-[#071924] to-[#091522] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span className="text-emerald-400">🤖</span>
                    <span>Android Direct WebAPK Installation</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-lg">
                    Chrome for Android automatically compiles this PWA into a native Android WebAPK with its own Linux process, home screen icon, and app switcher presence.
                  </p>
                </div>
                {isInstalled && (
                  <span className="flex items-center space-x-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/40">
                    <Check className="h-3.5 w-3.5" />
                    <span>Installed</span>
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {isInstallable ? (
                  <button
                    onClick={install}
                    className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Trigger Android Install Prompt Now</span>
                  </button>
                ) : isInstalled ? (
                  <div className="text-xs text-emerald-300 font-medium flex items-center space-x-1">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>App is already running natively in standalone mode!</span>
                  </div>
                ) : (
                  <button
                    onClick={install}
                    className="flex items-center space-x-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                  >
                    <Smartphone className="h-4 w-4 text-emerald-400" />
                    <span>Follow Android Browser Guide Below</span>
                  </button>
                )}
              </div>
            </div>

            {/* Android Browser Installation Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-[#090e1a] p-3.5">
                <div className="flex items-center space-x-2 font-bold text-cyan-300 mb-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 text-[10px] border border-cyan-800">1</span>
                  <span>Google Chrome on Android</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  1. Tap the three dots menu <strong className="text-white">(⋮)</strong> in the top-right corner.<br />
                  2. Select <strong className="text-emerald-400">"Install app"</strong> or <strong className="text-emerald-400">"Add to Home screen"</strong>.<br />
                  3. Tap <strong>Install</strong> in the Android system popup.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#090e1a] p-3.5">
                <div className="flex items-center space-x-2 font-bold text-purple-300 mb-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-950 text-[10px] border border-purple-800">2</span>
                  <span>Samsung Internet & Others</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  1. Tap the hamburger menu <strong className="text-white">(≡)</strong> at the bottom bar.<br />
                  2. Tap <strong className="text-purple-400">"Add page to"</strong> → select <strong className="text-purple-400">"App screen"</strong>.<br />
                  3. Launches full screen with native vibration & wake lock support.
                </p>
              </div>
            </div>

            {/* Features Checklist */}
            <div className="rounded-xl border border-slate-800/80 bg-[#080d18] p-3 text-xs">
              <span className="font-bold text-slate-300 block mb-2">Native Android Capabilities Included:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Sub-millisecond Edge Anycast Ping</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Screen Wake Lock (No Sleep Throttling)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Haptic Pulse Feedback Engine</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Cellular (5G/LTE) vs Wi-Fi Detection</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Hardware & Haptics Control */}
        {activeTab === 'hardware' && (
          <div className="py-4 space-y-4">
            {/* Screen Wake Lock Card */}
            <div className="rounded-2xl border border-slate-800 bg-[#090e1a] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                    isWakeLockActive
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Android Screen Wake Lock</h3>
                    <p className="text-xs text-slate-400">
                      Prevents the Android display from dimming or sleeping during 20-second download sweeps.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    isWakeLockActive ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isWakeLockActive ? 'ACTIVE' : 'IDLE'}
                  </span>
                  {isWakeLockActive ? (
                    <button
                      onClick={onReleaseWakeLock}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
                    >
                      Release
                    </button>
                  ) : (
                    <button
                      onClick={onRequestWakeLock}
                      className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 cursor-pointer"
                    >
                      Keep Awake
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Haptic Feedback Engine Card */}
            <div className="rounded-2xl border border-slate-800 bg-[#090e1a] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                    hapticsEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    <Vibrate className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Android Haptic Vibration</h3>
                    <p className="text-xs text-slate-400">
                      Tactile micro-vibrations on test start, phase transitions, and completion.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={onTestHaptic}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
                  >
                    Test Pulse
                  </button>
                  <button
                    onClick={onToggleHaptics}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      hapticsEnabled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {hapticsEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>

            {/* Network Information API Status */}
            <div className="rounded-2xl border border-slate-800 bg-[#090e1a] p-4">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-cyan-400" />
                <span>Android Network Information API</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                <div className="rounded-xl bg-[#0d1424] p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Carrier / Interface</span>
                  <span className="font-mono font-bold text-cyan-300 capitalize">{networkInfo.type || 'Cellular/Wi-Fi'}</span>
                </div>
                <div className="rounded-xl bg-[#0d1424] p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Effective Type</span>
                  <span className="font-mono font-bold text-emerald-400 uppercase">{networkInfo.effectiveType || '4G/5G'}</span>
                </div>
                <div className="rounded-xl bg-[#0d1424] p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Downlink Est.</span>
                  <span className="font-mono font-bold text-white">{networkInfo.downlink || 10} Mbps</span>
                </div>
                <div className="rounded-xl bg-[#0d1424] p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Round Trip (RTT)</span>
                  <span className="font-mono font-bold text-cyan-400">{networkInfo.rtt || 25} ms</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TWA & Play Store Build Export */}
        {activeTab === 'twa' && (
          <div className="py-4 space-y-4">
            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4">
              <div className="flex items-center space-x-2 font-bold text-sm text-purple-300">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Google Play Store Deployment via Bubblewrap / TWA</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Trusted Web Activity (TWA) wraps this app into a standard signed Google Play Store Android APK/AAB bundle with zero overhead and full Play Billing support.
              </p>
            </div>

            {/* Bubblewrap CLI command */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">1. Instant CLI Build Command:</span>
                <button
                  onClick={() => copyToClipboard(bubblewrapCommand, 'cmd')}
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 cursor-pointer font-mono"
                >
                  {copiedKey === 'cmd' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedKey === 'cmd' ? 'Copied' : 'Copy Command'}</span>
                </button>
              </div>
              <pre className="rounded-xl border border-slate-800 bg-[#060a12] p-3 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                {bubblewrapCommand}
              </pre>
            </div>

            {/* Android Manifest preview */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">2. AndroidManifest.xml:</span>
                <button
                  onClick={() => copyToClipboard(androidManifestSnippet, 'manifest')}
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 cursor-pointer font-mono"
                >
                  {copiedKey === 'manifest' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedKey === 'manifest' ? 'Copied' : 'Copy XML'}</span>
                </button>
              </div>
              <pre className="max-h-36 rounded-xl border border-slate-800 bg-[#060a12] p-3 text-[11px] font-mono text-slate-300 overflow-y-auto">
                {androidManifestSnippet}
              </pre>
            </div>

            {/* Digital Asset Links Link */}
            <div className="flex items-center justify-between rounded-xl bg-[#090e1a] p-3 border border-slate-800 text-xs">
              <div>
                <span className="font-bold text-white block">Digital Asset Links:</span>
                <span className="text-[11px] text-slate-400 font-mono">/.well-known/assetlinks.json</span>
              </div>
              <a
                href="/.well-known/assetlinks.json"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300"
              >
                <span>View File</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* TAB 4: Android Share Sheet */}
        {activeTab === 'share' && (
          <div className="py-4 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-[#090e1a] p-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3">
                <Share2 className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-white">Share Result with Android Share Sheet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Sends a formatted audit card directly to WhatsApp, Telegram, Slack, or Android Messages.
              </p>

              <div className="mt-4 rounded-xl bg-[#070b14] p-3 border border-slate-800 text-left font-mono text-xs text-slate-300 space-y-1">
                <div className="text-cyan-400 font-bold">⚡ NetPulse AI Speed Test Report:</div>
                <div>📥 Download: {metrics.downloadMbps.toFixed(1)} Mbps</div>
                <div>📤 Upload: {metrics.uploadMbps.toFixed(1)} Mbps</div>
                <div>⏱️ Ping: {metrics.pingMs.toFixed(1)} ms (Jitter: {metrics.jitterMs.toFixed(1)} ms)</div>
                <div>🛡️ Bufferbloat Grade: {metrics.bufferbloatGrade}</div>
                <div>🌐 ISP: {clientInfo?.isp || 'Broadband'}</div>
              </div>

              <button
                onClick={onShareResult}
                className="mt-4 inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>Open Android Share Sheet</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>NetPulse Android Engine v1.0.0</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
