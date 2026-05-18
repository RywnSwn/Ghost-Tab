// bypass.js
(function() {
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
    
    return originalAddEventListener.apply(this, arguments);
  };
})();