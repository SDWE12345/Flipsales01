// pages/_app.js - Initialize Facebook Pixel on app load

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { initFacebookPixel, fbEvent } from '../utils/tracking';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Get Pixel ID from localStorage or fetch from API
    const initPixel = async () => {
      try {
        // Try to get from localStorage first
        let pixelId = localStorage.getItem('pixelId');

        // If not in localStorage, fetch from API
        if (!pixelId) {
          const response = await fetch('/api/initPixel');
          const data = await response.json();
          
          if (data.pixelId && data.pixelId.FacebookPixel) {
            pixelId = data.pixelId.FacebookPixel;
            localStorage.setItem('pixelId', pixelId);
          }
        }

        // Initialize Facebook Pixel
        if (pixelId) {
          initFacebookPixel(pixelId);
          console.log('✅ Facebook Pixel initialized in _app.js');
        } else {
          console.warn('⚠️ No Facebook Pixel ID found');
        }
      } catch (error) {
        console.error('❌ Error initializing Facebook Pixel:', error);
      }
    };

    initPixel();

    // Track route changes
    const handleRouteChange = (url) => {
      fbEvent('PageView');
      console.log('📄 Page view tracked:', url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}

export default MyApp;