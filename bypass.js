// bypass.js
(function() {
  // Spoof iframe detection so embedded sites behave as if top-level
  try {
    Object.defineProperty(window, 'top',         { get: function() { return window; }, configurable: true });
    Object.defineProperty(window, 'parent',      { get: function() { return window; }, configurable: true });
    Object.defineProperty(window, 'frameElement',{ get: function() { return null;   }, configurable: true });
    if (location.ancestorOrigins && location.ancestorOrigins.length > 0) {
      Object.defineProperty(document, 'referrer', { get: function() { return ''; }, configurable: true });
    }
  } catch(e) {}

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