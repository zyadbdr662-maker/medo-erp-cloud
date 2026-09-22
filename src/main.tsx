import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';

// Manual Service Worker Registration for Offline-First Support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('✅ Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('❌ Service Worker registration failed:', error);
            });
    });
}

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
