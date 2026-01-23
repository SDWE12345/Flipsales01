import Script from 'next/script';

import { useEffect, useState } from 'react';
const FACEBOOK_PIXEL_ID = '1782903419326904';

export default function Layout({ children }) {
  const [metaPixelId, setMetaPixelId] = useState("000000000000000");

  // Get pixel ID from sessionStorage only on client-side
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage) {
      const pixelId = localStorage.getItem('pixelId');
      if (pixelId) {
        setMetaPixelId(pixelId);
      }
    }
  }, []);
  return (
    <>
      {/* Facebook Pixel */}
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');

            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `
        }}
      />

      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
        />
      </noscript>

      {children}
    </>
  );
}

