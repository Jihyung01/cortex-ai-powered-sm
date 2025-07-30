import { useState, useCallback, useRef } from 'react';

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

export interface CameraOptions {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
  quality?: number;
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export function useNativeFeatures() {
  const [isSupported, setIsSupported] = useState({
    share: 'share' in navigator,
    notifications: 'Notification' in window,
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    geolocation: 'geolocation' in navigator,
    serviceWorker: 'serviceWorker' in navigator,
    backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
  });

  // Web Share API
  const shareContent = useCallback(async (data: ShareData): Promise<boolean> => {
    if (!isSupported.share) {
      // Fallback to copying to clipboard
      try {
        const shareText = `${data.title || ''}\n${data.text || ''}\n${data.url || ''}`.trim();
        await navigator.clipboard.writeText(shareText);
        return true;
      } catch {
        return false;
      }
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.warn('Share failed:', error);
      return false;
    }
  }, [isSupported.share]);

  // Push Notifications
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported.notifications) {
      return 'denied';
    }

    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }, [isSupported.notifications]);

  const showNotification = useCallback(async (options: NotificationOptions): Promise<boolean> => {
    if (!isSupported.notifications || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker?.ready;
      if (registration) {
        await registration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/icon-192x192.png',
          badge: options.badge || '/icon-192x192.png',
          tag: options.tag,
          requireInteraction: options.requireInteraction,
          actions: options.actions,
          data: { url: window.location.origin }
        });
      } else {
        new Notification(options.title, options);
      }
      return true;
    } catch (error) {
      console.warn('Notification failed:', error);
      return false;
    }
  }, [isSupported.notifications]);

  // Camera API
  const captureImage = useCallback(async (options: CameraOptions = {}): Promise<string | null> => {
    if (!isSupported.camera) {
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: options.facingMode || 'environment',
          width: options.width || 1920,
          height: options.height || 1080
        }
      });

      return new Promise((resolve) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        video.srcObject = stream;
        video.play();

        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Auto-capture after 3 seconds (or implement manual trigger)
          setTimeout(() => {
            ctx?.drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', options.quality || 0.8);
            
            // Stop the stream
            stream.getTracks().forEach(track => track.stop());
            
            resolve(dataUrl);
          }, 3000);
        };
      });
    } catch (error) {
      console.warn('Camera capture failed:', error);
      return null;
    }
  }, [isSupported.camera]);

  // File handling
  const openFilePicker = useCallback(async (accept: string = '*/*', multiple: boolean = false): Promise<File[]> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.multiple = multiple;

      input.onchange = (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        resolve(files);
      };

      input.click();
    });
  }, []);

  // Geolocation
  const getCurrentLocation = useCallback(async (options: LocationOptions = {}): Promise<GeolocationPosition | null> => {
    if (!isSupported.geolocation) {
      return null;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          console.warn('Geolocation failed:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: options.enableHighAccuracy || true,
          timeout: options.timeout || 10000,
          maximumAge: options.maximumAge || 60000
        }
      );
    });
  }, [isSupported.geolocation]);

  // Haptic feedback
  const vibrate = useCallback((pattern: number | number[] = 100) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Install prompt for PWA
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Listen for install prompt
  const setupInstallPrompt = useCallback(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) return false;

    try {
      const result = await installPrompt.prompt();
      const accepted = result.outcome === 'accepted';
      
      if (accepted) {
        setInstallPrompt(null);
        setIsInstallable(false);
      }
      
      return accepted;
    } catch (error) {
      console.warn('Install failed:', error);
      return false;
    }
  }, [installPrompt]);

  // Screen Wake Lock
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async (): Promise<boolean> => {
    if (!('wakeLock' in navigator)) return false;

    try {
      const lock = await (navigator as any).wakeLock.request('screen');
      setWakeLock(lock);
      return true;
    } catch (error) {
      console.warn('Wake lock failed:', error);
      return false;
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
    }
  }, [wakeLock]);

  return {
    isSupported,
    
    // Sharing
    shareContent,
    
    // Notifications
    requestNotificationPermission,
    showNotification,
    
    // Camera & Files
    captureImage,
    openFilePicker,
    
    // Location
    getCurrentLocation,
    
    // Haptics
    vibrate,
    
    // PWA Install
    setupInstallPrompt,
    isInstallable,
    installApp,
    
    // Wake Lock
    requestWakeLock,
    releaseWakeLock,
    hasWakeLock: !!wakeLock
  };
}