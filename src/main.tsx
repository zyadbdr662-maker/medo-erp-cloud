import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';

// Register PWA service worker with auto-update for 100% offline functionality
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[MeDo PWA] تفعيل التحديث الجديد تلقائياً...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('[MeDo PWA] محرك العمل بدون اتصال (Offline-First) جاهز ونشط محلياً 100%!');
  },
  onRegisteredSW(swUrl, r) {
    if (r) {
      // Periodically check for SW updates every 1 minute
      setInterval(async () => {
        if (!(!r.installing && navigator)) {
          if (('onLine' in navigator) && !navigator.onLine) return;
          try {
            await r.update();
          } catch (e) {
            // ignore network errors
          }
        }
      }, 60 * 1000);
    }
  }
});
import { MarketingLayout } from './components/marketing/MarketingLayout.tsx';
import { HomePage } from './pages/marketing/HomePage.tsx';
import { AboutPage } from './pages/marketing/AboutPage.tsx';
import { SystemPage } from './pages/marketing/SystemPage.tsx';
import { PricingPage } from './pages/marketing/PricingPage.tsx';
import { ContactPage } from './pages/marketing/ContactPage.tsx';
import { BlogPage } from './pages/marketing/BlogPage.tsx';
import { BlogPostDetail } from './pages/marketing/BlogPostDetail.tsx';
import { PrivacyPage, TermsPage, DisclaimerPage } from './pages/marketing/LegalPages.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/erp/*" element={<App />} />
          <Route path="/" element={<MarketingLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="system" element={<SystemPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:id" element={<BlogPostDetail />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="disclaimer" element={<DisclaimerPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  </StrictMode>,
);
