import { useState, useEffect, useRef, useCallback } from 'react';

export interface AndroidNetworkInfo {
  type?: string;           // 'wifi', 'cellular', 'ethernet', etc.
  effectiveType?: string;  // '4g', '3g', '2g', 'slow-2g'
  downlink?: number;       // Mb/s estimated
  rtt?: number;            // ms
  saveData?: boolean;
  carrierName?: string;
  isCellular?: boolean;
  isWifi?: boolean;
}

export function useAndroidFeatures() {
  // 1. Haptics / Vibration
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('netpulse_android_haptics');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const isVibrationSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const triggerVibrate = useCallback((pattern: number | number[]) => {
    if (!hapticsEnabled || !isVibrationSupported) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }, [hapticsEnabled, isVibrationSupported]);

  const toggleHaptics = () => {
    setHapticsEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('netpulse_android_haptics', String(next));
      } catch {
        // ignore
      }
      if (next) triggerVibrate(25);
      return next;
    });
  };

  const hapticClick = useCallback(() => triggerVibrate(15), [triggerVibrate]);
  const hapticStart = useCallback(() => triggerVibrate([20, 30, 20]), [triggerVibrate]);
  const hapticPhase = useCallback(() => triggerVibrate([25, 40, 25]), [triggerVibrate]);
  const hapticComplete = useCallback(() => triggerVibrate([35, 60, 40, 80, 50]), [triggerVibrate]);

  // 2. Screen Wake Lock (Keeps Android screen awake during testing)
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const wakeLockRef = useRef<any>(null);
  const isWakeLockSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  const requestWakeLock = useCallback(async () => {
    if (!isWakeLockSupported) return;
    try {
      if (!wakeLockRef.current) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        setIsWakeLockActive(true);

        wakeLockRef.current.addEventListener('release', () => {
          setIsWakeLockActive(false);
          wakeLockRef.current = null;
        });
      }
    } catch (err) {
      console.warn('Wake Lock request error:', err);
    }
  }, [isWakeLockSupported]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // ignore
      }
      wakeLockRef.current = null;
      setIsWakeLockActive(false);
    }
  }, []);

  // 3. Android Network Information API
  const [networkInfo, setNetworkInfo] = useState<AndroidNetworkInfo>({
    type: 'unknown',
    effectiveType: '4g',
    downlink: 10,
    rtt: 30,
    saveData: false,
    isWifi: false,
    isCellular: false,
  });

  useEffect(() => {
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    const updateNetwork = () => {
      if (!connection) {
        // Fallback guess
        setNetworkInfo({
          type: 'online',
          effectiveType: '4g',
          downlink: 15,
          rtt: 25,
          isWifi: true,
          isCellular: false,
        });
        return;
      }

      const type = connection.type || 'unknown';
      const effectiveType = connection.effectiveType || '4g';
      const isCellular = type === 'cellular' || effectiveType === '4g' || effectiveType === '3g';
      const isWifi = type === 'wifi';

      setNetworkInfo({
        type,
        effectiveType,
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: !!connection.saveData,
        isCellular,
        isWifi,
      });
    };

    updateNetwork();

    if (connection) {
      connection.addEventListener('change', updateNetwork);
      return () => connection.removeEventListener('change', updateNetwork);
    }
  }, []);

  // 4. Android Native Share Sheet
  const shareResult = useCallback(async (summary: {
    downloadMbps: number;
    uploadMbps: number;
    pingMs: number;
    jitterMs: number;
    bufferbloatGrade: string;
    isp?: string;
  }): Promise<boolean> => {
    const text = `⚡ NetPulse AI Speed Test Report:
📥 Download: ${summary.downloadMbps.toFixed(1)} Mbps
📤 Upload: ${summary.uploadMbps.toFixed(1)} Mbps
⏱️ Ping: ${summary.pingMs.toFixed(1)} ms (Jitter: ${summary.jitterMs.toFixed(1)} ms)
🛡️ Bufferbloat Grade: ${summary.bufferbloatGrade}
🌐 ISP: ${summary.isp || 'Broadband Network'}
Tested with NetPulse Android Engine`;

    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: 'NetPulse AI - Network Telemetry Report',
          text,
          url: window.location.href,
        });
        triggerVibrate(20);
        return true;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      triggerVibrate([20, 20]);
      return true;
    } catch {
      return false;
    }
  }, [triggerVibrate]);

  return {
    // Haptics
    hapticsEnabled,
    toggleHaptics,
    isVibrationSupported,
    hapticClick,
    hapticStart,
    hapticPhase,
    hapticComplete,

    // Wake Lock
    isWakeLockActive,
    isWakeLockSupported,
    requestWakeLock,
    releaseWakeLock,

    // Network
    networkInfo,

    // Native Share
    shareResult,
  };
}
