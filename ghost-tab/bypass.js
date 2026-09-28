// bypass.js
// Runs in the MAIN world at document_start, in EVERY frame (all_frames: true).
// Capture whether this is the real top frame BEFORE we spoof anything.
(function() {
  var realIsTop;
  try { realIsTop = (window.top === window.self); } catch (e) { realIsTop = false; }

  // --- Inside embedded frames only ---
  // Make the embedded site believe it is a normal top-level page, so its
  // frame-detection / framebusting scripts pass instead of redirecting or hiding.
  if (!realIsTop) {
    try {
      Object.defineProperty(window, 'top',          { get: function () { return window; }, configurable: true });
      Object.defineProperty(window, 'parent',       { get: function () { return window; }, configurable: true });
      Object.defineProperty(window, 'frameElement', { get: function () { return null;   }, configurable: true });
    } catch (e) {}
    try {
      Object.defineProperty(document, 'referrer', { get: function () { return ''; }, configurable: true });
    } catch (e) {}

    // Strip only frame-ancestors from any <meta> CSP the page ships or injects later.
    function patchMeta(node) {
      if (!node || node.nodeName !== 'META') return;
      if ((node.getAttribute('http-equiv') || '').toLowerCase() !== 'content-security-policy') return;
      var original = node.getAttribute('content') || '';
      var patched = original
        .split(';')
        .filter(function (d) { return !/^\s*frame-ancestors\b/i.test(d); })
        .join(';');
      if (patched !== original) node.setAttribute('content', patched);
    }
    function patchAllMeta() {
      document.querySelectorAll('meta[http-equiv]').forEach(patchMeta);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', patchAllMeta, { once: true });
    } else {
      patchAllMeta();
    }
    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(patchMeta);
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  // --- Host (top) page only ---
  // Swallow blur events while the panel is open, so the underlying page's
  // focus-detection scripts don't fire when you click into the panel.
  if (realIsTop) {
    var originalAddEventListener = window.addEventListener;
    window.addEventListener = function (type, listener, options) {
      if (type === 'blur' && typeof listener === 'function') {
        var wrapped = function () {
          var host = document.getElementById('ghost-browser-shield-host');
          if (host && host.getAttribute('data-open') === 'true') return;
          return listener.apply(this, arguments);
        };
        return originalAddEventListener.call(this, type, wrapped, options);
      }
      try { return originalAddEventListener.apply(this, arguments); } catch (e) {}
    };
  }
})();
