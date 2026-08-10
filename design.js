// design.js
(function() {
  function createSidekickBrowserUI() {
    const host = document.createElement('div');
    host.id = 'sidekick-browser-host';
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
      .tab-track { display: none; }

      .toggle-btn {
        position: fixed;
        right: 6px;
        width: 48px;
        height: 48px;
        background: linear-gradient(155deg, #818cf8, #4f46e5);
        border: none;
        border-radius: 16px;
        cursor: grab;
        opacity: 1;
        transition: box-shadow 0.22s, transform 0.22s;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 18px rgba(30, 27, 75, 0.55), 0 0 0 1px rgba(255,255,255,0.08) inset;
        padding: 0;
        z-index: 2147483647;
        user-select: none;
        -webkit-user-drag: none;
      }
      .toggle-btn img {
        width: 26px;
        height: 26px;
        pointer-events: none;
        user-select: none;
        -webkit-user-drag: none;
      }
      .toggle-btn:hover {
        transform: scale(1.07) translateX(-2px);
        box-shadow: 0 8px 22px rgba(30, 27, 75, 0.65), 0 0 0 1px rgba(255,255,255,0.12) inset;
      }
      .toggle-btn.dragging {
        cursor: grabbing;
        transition: none;
        transform: none;
      }
      .toggle-btn.hidden {
        opacity: 0;
        pointer-events: none;
        transform: translateX(60px);
        transition: opacity 0.2s, transform 0.22s cubic-bezier(0.16,1,0.3,1);
      }

      .browser-container {
        position: fixed;
        right: -100%;
        top: 10px;
        bottom: 10px;
        width: 420px;
        height: auto;
        background: #131019;
        border: 1px solid #2a2440;
        border-radius: 18px;
        overflow: hidden;
        box-shadow: -18px 0 40px rgba(8, 6, 18, 0.6);
        transition: right 0.32s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;
      }
      .browser-container.open { right: 10px; }
      .browser-container.closing { transition: right 0.18s ease-in; }
      .browser-container.resizing { transition: none; user-select: none; }

      .resize-handle {
        position: absolute;
        left: -6px;
        top: 0;
        width: 12px;
        height: 100%;
        cursor: ew-resize;
        z-index: 10;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .resize-handle::after {
        content: '';
        width: 3px;
        height: 34px;
        border-radius: 3px;
        background: #35304a;
        transition: background 0.2s, height 0.2s;
      }
      .resize-handle:hover::after,
      .resize-handle.dragging::after {
        background: #818cf8;
        height: 54px;
      }

      .brand-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 8px 10px 14px;
        background: linear-gradient(135deg, #4f46e5, #6d28d9);
        flex-shrink: 0;
      }
      .brand-icon {
        width: 18px;
        height: 18px;
        border-radius: 5px;
        flex-shrink: 0;
      }
      .brand-name {
        flex: 1;
        font: 600 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        letter-spacing: 0.02em;
        color: #f2f0ff;
      }

      .tab-bar {
        display: flex;
        align-items: center;
        background: #16131f;
        border-bottom: 1px solid #241f36;
        padding: 6px 6px;
        gap: 4px;
        overflow-x: auto;
        scrollbar-width: none;
        min-height: 32px;
        flex-shrink: 0;
      }
      .tab-bar::-webkit-scrollbar { display: none; }

      .tab-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 5px 8px 5px 12px;
        border-radius: 999px;
        cursor: pointer;
        font-size: 11px;
        color: #7a7690;
        white-space: nowrap;
        max-width: 130px;
        min-width: 60px;
        background: transparent;
        border: 1px solid transparent;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
        user-select: none;
        position: relative;
        flex-shrink: 0;
      }
      .tab-item.active {
        background: rgba(129, 140, 248, 0.16);
        color: #ece9fb;
        border-color: rgba(129, 140, 248, 0.4);
      }
      .tab-item:not(.active):hover {
        background: #211f2f;
        color: #b4affd;
      }
      .tab-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
      }
      .tab-close {
        background: none;
        border: none;
        color: #55506b;
        font-size: 14px;
        line-height: 1;
        cursor: pointer;
        padding: 0;
        flex-shrink: 0;
        transition: color 0.15s;
      }
      .tab-close:hover { color: #f87171; }
      .tab-add {
        background: none;
        border: none;
        color: #7a7690;
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
        padding: 4px 9px;
        border-radius: 999px;
        flex-shrink: 0;
        transition: color 0.15s, background 0.15s;
      }
      .tab-add:hover { color: #ece9fb; background: #211f2f; }

      .browser-header {
        padding: 8px 10px;
        background: #16131f;
        border-bottom: 1px solid #241f36;
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      .nav-group {
        display: flex;
        align-items: center;
        gap: 1px;
        background: #1e1a2c;
        border-radius: 10px;
        padding: 2px;
        flex-shrink: 0;
      }
      .url-input {
        flex: 1;
        padding: 8px 14px;
        background: #1e1a2c;
        color: #ece9fb;
        border: 1px solid transparent;
        border-radius: 999px;
        font-family: monospace;
        font-size: 12px;
        outline: none;
        transition: border-color 0.15s, background 0.15s;
      }
      .url-input:focus { border-color: #818cf8; background: #211f2f; }

      .nav-btn {
        background: transparent;
        border: none;
        color: #9a94b8;
        font-size: 15px;
        cursor: pointer;
        padding: 6px 8px;
        border-radius: 8px;
        transition: color 0.2s, background 0.2s;
        line-height: 1;
        flex-shrink: 0;
      }
      .nav-btn:hover { color: #ece9fb; background: #2c2740; }
      .nav-btn:disabled { color: #423d59; cursor: default; background: none; }

      .close-btn {
        background: rgba(0,0,0,0.15);
        border: none;
        color: #f2f0ff;
        font-size: 18px;
        cursor: pointer;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        transition: background 0.2s;
        line-height: 1;
        flex-shrink: 0;
      }
      .close-btn:hover { background: rgba(0,0,0,0.32); }

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

    const track = document.createElement('div');
    track.className = 'tab-track';
    shadow.appendChild(track);

    const btn = document.createElement('button');
    btn.className = 'toggle-btn';
    const btnIcon = document.createElement('img');
    btnIcon.src = chrome.runtime.getURL('icons/Sidekick-48.png');
    btnIcon.alt = '';
    btn.appendChild(btnIcon);
    shadow.appendChild(btn);

    // Draggable vertical position
    const SAVED_TOP_KEY = 'sidekickBtnTop';
    function clampTop(y) {
      return Math.max(8, Math.min(window.innerHeight - 52, y));
    }
    function applyBtnTop(y) {
      const t = clampTop(y) + 'px';
      btn.style.top = t;
      track.style.top = t;
    }
    const savedTop = parseFloat(localStorage.getItem(SAVED_TOP_KEY));
    applyBtnTop(isNaN(savedTop) ? Math.round(window.innerHeight / 2 - 22) : savedTop);

    let dragState = null;
    btn.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      dragState = { startY: e.clientY, startTop: parseFloat(btn.style.top) };
      btn.classList.add('dragging');

      function onMove(e) {
        if (!dragState) return;
        const newTop = clampTop(dragState.startTop + (e.clientY - dragState.startY));
        btn.style.top = newTop + 'px';
      }
      function onUp(e) {
        if (!dragState) return;
        const delta = Math.abs(e.clientY - dragState.startY);
        btn.classList.remove('dragging');
        localStorage.setItem(SAVED_TOP_KEY, parseFloat(btn.style.top));
        dragState = null;
        document.removeEventListener('mousemove', onMove, true);
        document.removeEventListener('mouseup', onUp, true);
        // Only open browser if it was a click (not a drag)
        if (delta < 5) btn.dispatchEvent(new CustomEvent('sidekick-click'));
      }
      document.addEventListener('mousemove', onMove, true);
      document.addEventListener('mouseup', onUp, true);
    });

    const container = document.createElement('div');
    container.className = 'browser-container';

    // Brand bar
    const brandBar = document.createElement('div');
    brandBar.className = 'brand-bar';
    const brandIcon = document.createElement('img');
    brandIcon.className = 'brand-icon';
    brandIcon.src = chrome.runtime.getURL('icons/Sidekick-48.png');
    brandIcon.alt = '';
    const brandName = document.createElement('span');
    brandName.className = 'brand-name';
    brandName.textContent = 'Sidekick';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';

    brandBar.appendChild(brandIcon);
    brandBar.appendChild(brandName);
    brandBar.appendChild(closeBtn);
    container.appendChild(brandBar);

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

    const navGroup = document.createElement('div');
    navGroup.className = 'nav-group';

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

    navGroup.appendChild(backBtn);
    navGroup.appendChild(forwardBtn);
    navGroup.appendChild(refreshBtn);

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'url-input';
    input.placeholder = 'Search or enter address…';

    header.appendChild(navGroup);
    header.appendChild(input);
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
    const MAX_W = Math.round(window.innerWidth * 0.9);
    let panelWidth = parseInt(localStorage.getItem('sidekickWidth') || '420', 10);

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

      function onMove(e) { applyWidth(startW + (startX - e.clientX)); }
      function onUp() {
        resizeHandle.classList.remove('dragging');
        container.classList.remove('resizing');
        localStorage.setItem('sidekickWidth', panelWidth);
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
      btn, closeBtn, backBtn, forwardBtn, refreshBtn,
      container, input, tabBar, addTabBtn, viewContainer,
      setBrowserVisibility
    };
  }

  window.__createSidekickBrowserUI = createSidekickBrowserUI;
})();
