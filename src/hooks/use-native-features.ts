import { useCallback } from 'react';

export function useNativeFeatures() {
  const setupInstallPrompt = useCallback(() => {
    // PWA install prompt logic
    return () => {}; // cleanup function
  }, []);

  const captureImage = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Capture image logic would go here
      stream.getTracks().forEach(track => track.stop());
      return null;
    } catch (error) {
      console.warn('Camera access denied');
      return null;
    }
  }, []);

  const openFilePicker = useCallback(async (accept: string, multiple: boolean = false) => {
    return new Promise<File[]>((resolve) => {
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

  const getCurrentLocation = useCallback(async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      return position;
    } catch (error) {
      console.warn('Location access denied');
      return null;
    }
  }, []);

  const shareContent = useCallback(async (data: ShareData) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.warn('Share failed');
        return false;
      }
    }
    return false;
  }, []);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  return {
    setupInstallPrompt,
    captureImage,
    openFilePicker,
    getCurrentLocation,
    shareContent,
    vibrate
  };
}