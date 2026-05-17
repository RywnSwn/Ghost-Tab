(function() {
  const originalAddEventListener = window.addEventListener;

  window.addEventListener = function(type, listener, options) {
    if (type === 'blur') {
      // Wrap the sandbox blur listener with a gatekeeper
      const secureListener = function(event) {
        const host = document.getElementById('ghost-browser-shield-host');
        
        // If our ghost browser panel is open, drop the blur event entirely
        if (host && host.getAttribute('data-open') === 'true') {
          return; 
        }
        
        return listener.apply(this, arguments);
      };
      return originalAddEventListener.call(this, type, secureListener, options);
    }
    
    return originalAddEventListener.apply(this, arguments);
  };
})();