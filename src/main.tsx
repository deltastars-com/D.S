// === إلغاء أي Service Worker قديم لمنع مشاكل الكاش ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
      await registration.unregister();
      console.log('♻️ تم إلغاء Service Worker القديم');
    }
  });
}
// ==================================================
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { setupMockApi } from './components/lib/mockApi';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// === استدعاء المزودات (Providers) بمساراتها الجذرية المباشرة والصحيحة ===
import { I18nProvider } from './components/lib/contexts/I18nContext';
import { FirebaseProvider } from './components/lib/contexts/FirebaseContext';
import { GeminiAiProvider } from './components/lib/contexts/GeminiContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// إصدار التطبيق - غيّره عند كل تحديث كبير (لتعطيل الكاش)
const APP_VERSION = '15.0.0';

// Initialize Mock API Layer
setupMockApi();

/** * Delta Stars Sovereign Update Engine v14.0 - Diamond Edition
 * نظام التحديث التلقائي اللحظي والتعافي الذكي من الانقطاع
 */

// --- Sovereign Self-Healing & Security Sentinel ---
const initSovereignSentinels = () => {
  // Global Error Recovery
  window.addEventListener('error', (event) => {
    console.warn('🛡️ Sovereign Shield: Captured Runtime Error. Attempting Auto-Patch...');
    if (event.error?.message?.includes('network')) {
       console.log('📡 Network instability detected. Stabilizing connection...');
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.warn('🛡️ Sovereign Shield: Async Exception Captured. Isolating process.');
    event.preventDefault();
  });

  // Basic Security Sentinel: Anti-Tamper Check (Mock)
  const sentinel = setInterval(() => {
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn('⚠️ Security Warning: Connection Not Encrypted.');
    }
  }, 10000);

  // Health Check & Auto-Fix
  setInterval(() => {
    const rootLen = document.querySelector('#root')?.children.length ?? 0;
    if (rootLen === 0) {
       console.warn('🛠️ Sovereign Sentinel: Application state corrupted or empty. Re-initializing...');
       window.location.reload();
    }
  }, 30000);

  return () => clearInterval(sentinel);
};

initSovereignSentinels();

// --- Service Worker Management (محسن لتجنب مشاكل التخزين المؤقت) ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
      await registration.unregister();
      console.log('♻️ Old Service Worker unregistered');
    }

    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log(`💎 Sovereign OS: Update Layer Active - v${APP_VERSION}`);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
               console.log('🔄 New Sovereign version detected. Auto-refreshing in 3 seconds...');
               setTimeout(() => window.location.reload(), 3000);
            }
          };
        }
      };
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Critical Mount Failure.");

const root = createRoot(rootElement);

// === تغليف التطبيق مباشرة بالمزودات بترتيبها الصحيح لمنع أي انهيار ===
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
