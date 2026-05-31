import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { I18nProvider } from './components/lib/contexts/I18nContext';
import { FirebaseProvider } from './components/lib/contexts/FirebaseContext';
import { GeminiAiProvider } from './components/lib/contexts/GeminiContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { setupMockApi } from './components/lib/mockApi';

// استيراد بمسار نسبي مباشر وآمن لضمان أن Rollup يراه في بيئة Build
import './index.css';

setupMockApi();

// تنظيف الـ Service Workers لمنع التعارض في بيئة Netlify
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (let reg of regs) { await reg.unregister(); }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Critical Mount Failure: #root not found.");

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
