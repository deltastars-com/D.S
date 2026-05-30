import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// 1. استدعاءات المزودات (Providers) - تم التأكد من المسارات
import { ErrorBoundary } from './components/ErrorBoundary';
import { I18nProvider } from './components/lib/contexts/I18nContext';
import { FirebaseProvider } from './components/lib/contexts/FirebaseContext';
import { GeminiAiProvider } from './components/lib/contexts/GeminiContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { setupMockApi } from './components/lib/mockApi';

// Initialize
setupMockApi();

// 2. إدارة الـ Service Worker (بشكل نظيف تماماً لتجنب مشاكل الكاش)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
      await registration.unregister();
    }
  });
}

// 3. المحرك الأساسي للتشغيل
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Critical Mount Failure: #root element not found.");

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <FirebaseProvider>
          <GeminiAiProvider>
            <ToastProvider>
              <AuthProvider>
                <NotificationProvider>
                  <App />
                </NotificationProvider>
              </AuthProvider>
            </ToastProvider>
          </GeminiAiProvider>
        </FirebaseProvider>
      </I18nProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
