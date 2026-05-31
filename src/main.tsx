import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// المزودات المجمعة
import { ErrorBoundary } from './components/ErrorBoundary';
import { I18nProvider } from './components/lib/contexts/I18nContext';
import { FirebaseProvider } from './components/lib/contexts/FirebaseContext';
import { GeminiAiProvider } from './components/lib/contexts/GeminiContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { setupMockApi } from './components/lib/mockApi';

setupMockApi();

// تنظيف أساسي لمنع التضارب
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister()));
}

const container = document.getElementById('root');
if (!container) throw new Error("Critical: #root not found");

createRoot(container).render(
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
