// design.js
// Builds the panel UI inside a Shadow DOM. Styling is intentionally plain.
(function() {
  function createGhostBrowserUI() {
    const host = document.createElement('div');
    host.id = 'ghost-browser-shield-host';
    host.setAttribute('data-open', 'false');
    host.style.position = 'fixed';
    host.style.top = '0';
    host.style.right = '0';
    host.style.bottom = '0';
    host.style.width = '0';
    host.style.zIndex = '2147483647';
    document.documentElement.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; }

      .toggle-btn {
        position: fixed;
        right: 0;
        width: 32px;
        height: 56px;
        background: #dddddd;
        border: 1px solid #999999;
        border-right: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        z-index: 2147483647;
        user-select: none;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s;
      }
      .toggle-btn.near {
        opacity: 1;
        pointer-events: auto;
      }
      .toggle-btn img {
        width: 20px;
        height: 20px;
        pointer-events: none;
      }
      .toggle-btn.dragging { cursor: grabbing; }
      .toggle-btn.hidden { display: none; }

      .browser-container {
        position: fixed;
        right: -100%;
        top: 0;
        width: 420px;
        height: 100vh;
        background: #ffffff;
        border-left: 1px solid #999999;
        display: flex;
        flex-direction: column;
        font-family: sans-serif;
        font-size: 13px;
        color: #000000;
      }
      .browser-container.open { right: 0; }
      .browser-container.resizing { user-select: none; }

      .resize-handle {
        position: absolute;
        left: 0;
        top: 0;
        width: 6px;
        height: 100%;
        cursor: ew-resize;
        z-index: 10;
      }

      .tab-bar {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px;
        background: #eeeeee;
        border-bottom: 1px solid #cccccc;
        overflow-x: auto;
      }
      .tab-item {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 3px 6px;
        background: #ffffff;
        border: 1px solid #cccccc;
        cursor: pointer;
        white-space: nowrap;
        max-width: 140px;
        min-width: 50px;
      }
      .tab-item.active { background: #cfe0f0; }
      .tab-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tab-close {
        border: none;
        background: none;
        cursor: pointer;
        padding: 0 2px;
      }
      .tab-add {
        border: 1px solid #cccccc;
        background: #ffffff;
        cursor: pointer;
        padding: 2px 8px;
      }

      .browser-header {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px;
        border-bottom: 1px solid #cccccc;
      }
      .nav-btn {
        cursor: pointer;
        padding: 2px 6px;
      }
      .url-input {
        flex: 1;
        padding: 4px 6px;
      }
      .close-btn {
        cursor: pointer;
        padding: 2px 8px;
      }

      .view-container {
        flex: 1;
        position: relative;
        overflow: hidden;
      }
      .view-area {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        border: none;
        background: #ffffff;
        display: none;
      }
      .view-area.active { display: block; }

      .resize-overlay {
        display: none;
        position: absolute;
        inset: 0;
        z-index: 5;
        cursor: ew-resize;
      }
      .browser-container.resizing .resize-overlay { display: block; }
    `;
    shadow.appendChild(style);

    const btn = document.createElement('button');
    btn.className = 'toggle-btn';
    const btnIcon = document.createElement('img');
    btnIcon.src = chrome.runtime.getURL('icons/Hexagon-48.png');
    btnIcon.alt = '';
    btn.appendChild(btnIcon);
    shadow.appendChild(btn);

    // Draggable vertical position for the toggle tab.
    const SAVED_TOP_KEY = 'ghostBrowserBtnTop';
    function clampTop(y) {
      return Math.max(8, Math.min(window.innerHeight - 64, y));
    }
    function applyBtnTop(y) {
      btn.style.top = clampTop(y) + 'px';
    }
    const savedTop = parseFloat(localStorage.getItem(SAVED_TOP_KEY));
    applyBtnTop(isNaN(savedTop) ? Math.round(window.innerHeight / 2 - 28) : savedTop);

    let dragState = null;
    btn.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      dragState = { startY: e.clientY, startTop: parseFloat(btn.style.top) };
      btn.classList.add('dragging');

      function onMove(e) {
        if (!dragState) return;
        btn.style.top = clampTop(dragState.startTop + (e.clientY - dragState.startY)) + 'px';
      }
      function onUp(e) {
        if (!dragState) return;
        const delta = Math.abs(e.clientY - dragState.startY);
        btn.classList.remove('dragging');
        localStorage.setItem(SAVED_TOP_KEY, parseFloat(btn.style.top));
        dragState = null;
        document.removeEventListener('mousemove', onMove, true);
        document.removeEventListener('mouseup', onUp, true);
        if (delta < 5) btn.dispatchEvent(new CustomEvent('ghost-click'));
      }
      document.addEventListener('mousemove', onMove, true);
      document.addEventListener('mouseup', onUp, true);
    });

    // Reveal the toggle tab only when the cursor comes near the right edge.
    const REVEAL_ZONE = 60;
    document.addEventListener('mousemove', (e) => {
      if (btn.classList.contains('dragging')) return;
      const near = (window.innerWidth - e.clientX) <= REVEAL_ZONE;
      btn.classList.toggle('near', near);
    }, true);

    const container = document.createElement('div');
    container.className = 'browser-container';

    // Tab bar
    const tabBar = document.createElement('div');
    tabBar.className = 'tab-bar';
    const addTabBtn = document.createElement('button');
    addTabBtn.className = 'tab-add';
    addTabBtn.title = 'New tab';
    addTabBtn.textContent = '+';
    tabBar.appendChild(addTabBtn);
    container.appendChild(tabBar);

    // URL / nav header
    const header = document.createElement('div');
    header.className = 'browser-header';

    const backBtn = document.createElement('button');
    backBtn.className = 'nav-btn';
    backBtn.title = 'Back';
    backBtn.textContent = '<';

    const forwardBtn = document.createElement('button');
    forwardBtn.className = 'nav-btn';
    forwardBtn.title = 'Forward';
    forwardBtn.textContent = '>';

    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'nav-btn';
    refreshBtn.title = 'Refresh';
    refreshBtn.textContent = 'R';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'url-input';
    input.placeholder = 'Search or enter address';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = 'X';

    header.appendChild(backBtn);
    header.appendChild(forwardBtn);
    header.appendChild(refreshBtn);
    header.appendChild(input);
    header.appendChild(closeBtn);
    container.appendChild(header);

    // View container (holds per-tab iframes)
    const viewContainer = document.createElement('div');
    viewContainer.className = 'view-container';
    const resizeOverlay = document.createElement('div');
    resizeOverlay.className = 'resize-overlay';
    viewContainer.appendChild(resizeOverlay);
    container.appendChild(viewContainer);

    // Resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    container.appendChild(resizeHandle);

    shadow.appendChild(container);

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
      container.classList.add('resizing');
      const startX = e.clientX;
      const startW = panelWidth;

      function onMove(e) { applyWidth(startW + (startX - e.clientX)); }
      function onUp() {
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
        container.classList.remove('open');
        btn.classList.remove('hidden');
        host.setAttribute('data-open', 'false');
        host.style.width = '0';
      }
    }

    return {
      btn, closeBtn, backBtn, forwardBtn, refreshBtn,
      container, input, tabBar, addTabBtn, viewContainer,
      setBrowserVisibility
    };
  }

  window.__createGhostBrowserUI = createGhostBrowserUI;
})();
