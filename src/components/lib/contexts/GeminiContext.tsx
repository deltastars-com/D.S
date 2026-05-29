import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface GeminiAiContextType {
  status: 'loading' | 'ready' | 'error';
  hasKey: boolean;
  openSelectKey: () => Promise<void>;
}

const GeminiAiContext = createContext<GeminiAiContextType>({
  status: 'loading',
  hasKey: false,
  openSelectKey: async () => {}
});

export const useGeminiAi = () => useContext(GeminiAiContext);

export const GeminiAiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasKey, setHasKey] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
          setStatus(selected ? 'ready' : 'error');
        } catch (e) {
             setStatus('error');
        }
      } else {
        // Fallback for local dev
        const envKey = !!process.env.GEMINI_API_KEY;
        setHasKey(envKey);
        setStatus(envKey ? 'ready' : 'error');
      }
    };
    checkKey();
  }, []);

  const openSelectKey = async () => {
    if (window.aistudio) {
      try {
          await window.aistudio.openSelectKey();
          setHasKey(true);
          setStatus('ready');
      } catch (e) {
          console.error("Failed to open key selector", e);
      }
    }
  };

  return (
    <GeminiAiContext.Provider value={{ status, hasKey, openSelectKey }}>
      {children}
    </GeminiAiContext.Provider>
  );
};
