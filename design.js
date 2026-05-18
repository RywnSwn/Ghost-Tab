// design.js
(function() {
  function createGhostBrowserUI() {
    const host = document.createElement('div');
    host.id = 'ghost-browser-shield-host';
    host.setAttribute('data-open', 'false');
    host.style.position = 'fixed';
    host.style.top = '0';
    host.style.right = '0';
    host.style.bottom = '0'; // Allow it to span the height without blocking clicks
    host.style.width = '0';  // Starts at 0 width so it doesn't block underlying page clicks
    host.style.zIndex = '2147483647';
    document.documentElement.appendChild(host);

    // Changed mode to 'open' so bypass.js can read the open state
    const shadow = host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      .toggle-btn {
        position: fixed;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 22px;
        height: 72px;
        background: rgba(18, 18, 18, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-right: none;
        border-radius: 8px 0 0 8px;
        cursor: pointer;
        opacity: 0.6;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 5px;
        backdrop-filter: blur(6px);
        box-shadow: -3px 0 16px rgba(0, 0, 0, 0.4);
        padding: 0;
      }
      .toggle-btn::before,
      .toggle-btn::after,
      .toggle-btn .dot-mid {
        content: '';
        display: block;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.35);
        transition: background 0.2s;
      }
      .toggle-btn:hover {
        opacity: 1;
        width: 26px;
        box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
        border-color: rgba(255, 255, 255, 0.2);
      }
      .toggle-btn:hover::before,
      .toggle-btn:hover::after,
      .toggle-btn:hover .dot-mid {
        background: rgba(255, 255, 255, 0.85);
      }

      /* Smoothly hide the button completely */
      .toggle-btn.hidden {
        opacity: 0;
        pointer-events: none;
        transform: translateY(-50%) translateX(100%);
      }
      
      .browser-container {
        position: fixed;
        right: -100%;
        top: 0;
        width: 420px;
        height: 100vh;
        background: #0a0a0f;
        border-left: 1px solid #1e1e2e;
        box-shadow: -10px 0 30px rgba(0,0,0,0.6);
        transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;
      }
      .browser-container.open { right: 0; }
      .browser-container.closing { transition: right 0.15s ease-in; }
      .browser-container.resizing { transition: none; user-select: none; }

      .resize-handle {
        position: absolute;
        left: -4px;
        top: 0;
        width: 8px;
        height: 100%;
        cursor: ew-resize;
        z-index: 10;
        background: transparent;
        transition: background 0.2s;
      }
      .resize-handle:hover,
      .resize-handle.dragging {
        background: rgba(255, 255, 255, 0.08);
      }
      
      .browser-header {
        padding: 12px;
        background: #12121a;
        border-bottom: 1px solid #1e1e2e;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .url-input {
        flex: 1;
        padding: 8px 12px;
        background: #1a1a24;
        color: #e0e0f0;
        border: 1px solid #2e2e3e;
        border-radius: 6px;
        font-family: monospace;
        font-size: 12px;
        outline: none;
      }
      .url-input:focus { border-color: rgba(255, 255, 255, 0.4); }
      
      .nav-btn {
        background: transparent;
        border: none;
        color: #888899;
        font-size: 16px;
        cursor: pointer;
        padding: 4px 6px;
        transition: color 0.2s;
        line-height: 1;
        flex-shrink: 0;
      }
      .nav-btn:hover { color: #e0e0f0; }
      .nav-btn:disabled { color: #333344; cursor: default; }

      .close-btn {
        background: transparent;
        border: none;
        color: #888899;
        font-size: 24px;
        cursor: pointer;
        padding: 4px 8px;
        transition: color 0.2s;
        line-height: 1;
      }
      .close-btn:hover { color: #ff5555; }
      
      .view-area {
        flex: 1;
        border: none;
        background: #ffffff;
      }
    `;
    shadow.appendChild(style);

    const btn = document.createElement('button');
    btn.className = 'toggle-btn';
    const dotMid = document.createElement('span');
    dotMid.className = 'dot-mid';
    btn.appendChild(dotMid);
    shadow.appendChild(btn);

    const container = document.createElement('div');
    container.className = 'browser-container';
    
    const header = document.createElement('div');
    header.className = 'browser-header';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'url-input';
    input.placeholder = 'Search Google or type a web address...';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    
    const backBtn = document.createElement('button');
    backBtn.className = 'nav-btn';
    backBtn.title = 'Go back';
    backBtn.innerHTML = '&#8592;';

    const forwardBtn = document.createElement('button');
    forwardBtn.className = 'nav-btn';
    forwardBtn.title = 'Go forward';
    forwardBtn.innerHTML = '&#8594;';

    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'nav-btn';
    refreshBtn.title = 'Refresh';
    refreshBtn.innerHTML = '&#8635;';

    header.appendChild(backBtn);
    header.appendChild(forwardBtn);
    header.appendChild(refreshBtn);
    header.appendChild(input);
    header.appendChild(closeBtn);
    container.appendChild(header);

    const viewArea = document.createElement('iframe');
    viewArea.className = 'view-area';
    viewArea.src = "https://www.google.com/search?igu=1"; 
    container.appendChild(viewArea);
    
    shadow.appendChild(container);

    // Resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    container.appendChild(resizeHandle);

    const MIN_W = 240;
    const MAX_W = Math.round(window.screen.width * 0.9);
    let panelWidth = parseInt(localStorage.getItem('ghostBrowserWidth') || '420', 10);

    function applyWidth(w) {
      panelWidth = Math.min(MAX_W, Math.max(MIN_W, w));
      container.style.width = panelWidth + 'px';
      if (host.getAttribute('data-open') === 'true') {
        host.style.width = panelWidth + 'px';
      }
    }

    applyWidth(panelWidth);

    resizeHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      resizeHandle.classList.add('dragging');
      container.classList.add('resizing');
      const startX = e.clientX;
      const startW = panelWidth;

      function onMove(e) {
        applyWidth(startW + (startX - e.clientX));
      }
      function onUp() {
        resizeHandle.classList.remove('dragging');
        container.classList.remove('resizing');
        localStorage.setItem('ghostBrowserWidth', panelWidth);
        document.removeEventListener('mousemove', onMove, true);
        document.removeEventListener('mouseup', onUp, true);
      }
      document.addEventListener('mousemove', onMove, true);
      document.addEventListener('mouseup', onUp, true);
    });

    function setBrowserVisibility(visible) {
      if (visible) {
        container.classList.add('open');
        btn.classList.add('hidden');
        host.setAttribute('data-open', 'true');
        host.style.width = panelWidth + 'px';
      } else {
        container.classList.add('closing');
        container.classList.remove('open');
        btn.classList.remove('hidden');
        host.setAttribute('data-open', 'false');
        setTimeout(() => {
          container.classList.remove('closing');
          host.style.width = '0';
        }, 150);
      }
    }

    return {
      btn,
      closeBtn,
      backBtn,
      forwardBtn,
      refreshBtn,
      container,
      input,
      viewArea,
      setBrowserVisibility
    };
  }

  window.__createGhostBrowserUI = createGhostBrowserUI;
})();
