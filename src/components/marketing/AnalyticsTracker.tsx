import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    fbq: (...args: any[]) => void;
    _hjSettings: { hjid: number; hjsv: number };
    hj: (...args: any[]) => void;
    clarity: (...args: any[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const CLARITY_ID = import.meta.env.VITE_CLARITY_ID;
const HOTJAR_ID = import.meta.env.VITE_HOTJAR_ID;
const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID;

export const trackEvent = (eventName: string, params: object = {}) => {
  if (window.gtag && GA_ID) {
    window.gtag('event', eventName, params);
  }
  if (window.fbq && FB_PIXEL_ID) {
    window.fbq('trackCustom', eventName, params);
  }
};

export const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Google Analytics
    if (GA_ID && !window.gtag) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_ID);
    }

    // Microsoft Clarity
    if (CLARITY_ID && !window.clarity) {
      (function(c,l,a,r,i,t,y){
        // @ts-ignore
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        // @ts-ignore
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        // @ts-ignore
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", CLARITY_ID);
    }

    // Hotjar
    if (HOTJAR_ID && !window.hj) {
      (function(h,o,t,j,a,r){
        // @ts-ignore
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        // @ts-ignore
        h._hjSettings={hjid:HOTJAR_ID,hjsv:6};
        // @ts-ignore
        a=o.getElementsByTagName('head')[0];
        // @ts-ignore
        r=o.createElement('script');r.async=1;
        // @ts-ignore
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        // @ts-ignore
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    }

    // Facebook Pixel
    if (FB_PIXEL_ID && !window.fbq) {
      (function(f,b,e,v,n,t,s){
        // @ts-ignore
        if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        // @ts-ignore
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)
      })(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', FB_PIXEL_ID);
      window.fbq('track', 'PageView');
    }

    // Track Page View
    if (window.gtag && GA_ID) {
      window.gtag('config', GA_ID, {
        page_path: location.pathname + location.search,
      });
    }
    if (window.fbq && FB_PIXEL_ID) {
      window.fbq('track', 'PageView');
    }
  }, [location]);

  return null;
};
