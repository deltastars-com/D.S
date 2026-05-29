
const noop = function() { return noop; };
noop.register = noop;
noop.performReactRefresh = noop;
noop.injectIntoGlobalHook = noop;
noop.preamble = noop;
noop.RefreshReg = noop;
noop.RefreshSig = function() { return noop; };

const handler = {
  get: function(target, prop) {
    if (prop === 'default' || prop === '__esModule') return target;
    return noop;
  },
  apply: function() {
    return noop;
  }
};

const proxyMock = new Proxy(noop, handler);

if (typeof window !== 'undefined') {
  const define = (name, val) => {
    try {
      Object.defineProperty(window, name, { 
        get: () => val,
        set: () => {},
        configurable: false 
      });
    } catch (e) {
      window[name] = val;
    }
  };
  define('RefreshRuntime', proxyMock);
  define('$RefreshReg$', proxyMock);
  define('$RefreshSig$', () => proxyMock);
  define('__vite_plugin_react_preamble_installed__', true);
  
  // V13: Specific error suppression
  const originalOnerror = window.onerror;
  window.onerror = function(msg, url, line, col, error) {
    const message = String(msg);
    if (message.includes('RefreshRuntime') || message.includes('$RefreshReg$') || message.includes('$RefreshSig$')) {
      console.warn('🛡️ [Delta Stars] Suppressed RefreshRuntime error:', message);
      return true;
    }
    if (originalOnerror) return originalOnerror.apply(this, arguments);
    return false;
  };
}

export default proxyMock;
export { proxyMock as RefreshRuntime, proxyMock as register, proxyMock as performReactRefresh, proxyMock as injectIntoGlobalHook, proxyMock as preamble, proxyMock as RefreshReg };
export const RefreshSig = () => proxyMock;
