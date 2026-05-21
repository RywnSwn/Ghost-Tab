// bypass.js
(function() {
  // Spoof iframe detection so embedded sites behave as if top-level
  try {
    Object.defineProperty(window, 'top',         { get: function() { return window; }, configurable: true });
    Object.defineProperty(window, 'parent',      { get: function() { return window; }, configurable: true });
    Object.defineProperty(window, 'self',        { get: function() { return window; }, configurable: true });
    Object.defineProperty(window, 'frameElement',{ get: function() { return null;   }, configurable: true });
    if (location.ancestorOrigins && location.ancestorOrigins.length > 0) {
      Object.defineProperty(document, 'referrer', { get: function() { return ''; }, configurable: true });
    }
  } catch(e) {}

  // Strip only frame-ancestors from meta CSP tags — leave all other directives untouched
  function patchMetaCSP() {
    document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]').forEach(function(meta) {
      const original = meta.getAttribute('content') || '';
      const patched = original
        .split(';')
        .filter(function(d) { return !/^\s*frame-ancestors\b/i.test(d); })
        .join(';');
      if (patched !== original) meta.setAttribute('content', patched);
    });
  }

  // Run once early, then watch for any dynamically injected meta tags
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchMetaCSP, { once: true });
  } else {
    patchMetaCSP();
  }
  new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.nodeName === 'META' &&
            (node.getAttribute('http-equiv') || '').toLowerCase() === 'content-security-policy') {
          const original = node.getAttribute('content') || '';
          const patched = original
            .split(';')
            .filter(function(d) { return !/^\s*frame-ancestors\b/i.test(d); })
            .join(';');
          if (patched !== original) node.setAttribute('content', patched);
        }
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });

  const originalAddEventListener = window.addEventListener;

  window.addEventListener = function(type, listener, options) {
    if (type === 'blur') {
      const secureListener = function(event) {
        const host = document.getElementById('ghost-browser-shield-host');
        
        // If host exists, check its internal configuration state safely via shadowRoot
        if (host) {
          const isOpen = host.getAttribute('data-open') === 'true';
          if (isOpen) {
            return; // Kill the blur event!
          }
        }
        
        return listener.apply(this, arguments);
      };
      return originalAddEventListener.call(this, type, secureListener, options);
    }
    
    try { return originalAddEventListener.apply(this, arguments); } catch(e) {}
  };
})();