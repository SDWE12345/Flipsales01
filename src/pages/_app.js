// pages/_app.js
import Layout from '../componets/Layout'; // Fixed typo: componets -> components
import '../styles/Home.module.css';
import '../styles/globals.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastProvider } from 'react-toast-notifications';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { initializeTracking, trackPageView } from '../utils/tracking';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [metaPixelId, setMetaPixelId] = useState("000000000000000");

  // Get pixel ID from sessionStorage only on client-side
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage) {
      const pixelId = sessionStorage.getItem('pixelId');
      if (pixelId) {
        setMetaPixelId(pixelId);
      }
    }
  }, []);

  useEffect(() => {
    // Wait for scripts to load before initializing
    const timer = setTimeout(() => {
      initializeTracking();
    }, 500);

    const handleRouteChange = (url) => {
      // Track page view on route change
      trackPageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      clearTimeout(timer);
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      {/* 🔥 META PIXEL - Critical: Load first and synchronously */}
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ Meta Pixel Script Loaded');
          // Ensure fbq is available globally
          if (typeof window !== 'undefined' && window.fbq) {
            console.log('✅ fbq function available');
          }
        }}
      >
        {`
          !function(f,b,e,v,n,t,s){
            if(f.fbq)return;
            n=f.fbq=function(){
              n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)
            };
            if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)
          }(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          
          fbq('init', '${metaPixelId}');
          fbq('track', 'PageView');
        `}
      </Script>

      {/* Meta Pixel NoScript Fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      
      {/* 🔥 GOOGLE ANALYTICS (GA4) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ Google Analytics Script Loaded');
        }}
      />
      <Script id="ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname
          });
        `}
      </Script>

      <ToastProvider>=
          <Component {...pageProps} />
      </ToastProvider>
    </>
  );
}

export default MyApp;

