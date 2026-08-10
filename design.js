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
        right: 0;
        width: 40px;
        height: 46px;
        background: linear-gradient(160deg, rgba(99,102,241,0.35), rgba(67,56,202,0.35));
        border: 1px solid rgba(129, 140, 248, 0.35);
        border-right: none;
        border-radius: 20px 0 0 20px;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        cursor: grab;
        opacity: 1;
        transition: box-shadow 0.22s, background 0.22s;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: -3px 2px 12px rgba(30, 27, 75, 0.45);
        padding: 0;
        z-index: 2147483647;
        user-select: none;
        -webkit-user-drag: none;
      }
      .toggle-btn img {
        width: 22px;
        height: 22px;
        pointer-events: none;
        user-select: none;
        -webkit-user-drag: none;
      }
      .toggle-btn:hover {
        background: linear-gradient(160deg, rgba(99,102,241,0.55), rgba(67,56,202,0.55));
        box-shadow: -5px 2px 16px rgba(30, 27, 75, 0.55);
      }
      .toggle-btn.dragging {
        cursor: grabbing;
        transition: none;
      }
      .toggle-btn.hidden {
        opacity: 0;
        pointer-events: none;
        transform: translateX(50px);
        transition: opacity 0.2s, transform 0.22s cubic-bezier(0.16,1,0.3,1);
      }

      .browser-container {
        position: fixed;
        right: -100%;
        top: 0;
        width: 420px;
        height: 100vh;
        background: #111017;
        border-left: 1px solid #262233;
        border-radius: 14px 0 0 14px;
        overflow: hidden;
        box-shadow: -12px 0 34px rgba(10, 8, 20, 0.65);
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
        background: rgba(129, 140, 248, 0.18);
      }

      .tab-bar {
        display: flex;
        align-items: flex-end;
        background: #15131d;
        border-bottom: 1px solid #262233;
        padding: 8px 8px 0;
        gap: 3px;
        overflow-x: auto;
        scrollbar-width: none;
        min-height: 36px;
        flex-shrink: 0;
      }
      .tab-bar::-webkit-scrollbar { display: none; }

      .tab-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 8px 6px 12px;
        border-radius: 8px 8px 0 0;
        cursor: pointer;
        font-size: 11px;
        color: #7a7690;
        white-space: nowrap;
        max-width: 130px;
        min-width: 60px;
        background: #1a1826;
        border: 1px solid #262233;
        border-bottom: 1px solid #15131d;
        transition: background 0.15s, color 0.15s;
        user-select: none;
        position: relative;
        flex-shrink: 0;
      }
      .tab-item.active {
        background: #111017;
        color: #ece9fb;
        border-bottom-color: #111017;
        box-shadow: inset 0 2px 0 #818cf8;
        z-index: 1;
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
        color: #55506b;
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
        padding: 4px 7px;
        border-radius: 6px;
        flex-shrink: 0;
        transition: color 0.15s, background 0.15s;
        align-self: center;
        margin-bottom: 1px;
      }
      .tab-add:hover { color: #ece9fb; background: #211f2f; }

      .browser-header {
        padding: 10px 12px;
        background: #1a1826;
        border-bottom: 1px solid #262233;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      .url-input {
        flex: 1;
        padding: 7px 12px;
        background: #211f2f;
        color: #ece9fb;
        border: 1px solid #35314a;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        outline: none;
        transition: border-color 0.15s;
      }
      .url-input:focus { border-color: #818cf8; }

      .nav-btn {
        background: transparent;
        border: none;
        color: #9a94b8;
        font-size: 16px;
        cursor: pointer;
        padding: 4px 6px;
        border-radius: 6px;
        transition: color 0.2s, background 0.2s;
        line-height: 1;
        flex-shrink: 0;
      }
      .nav-btn:hover { color: #ece9fb; background: #262233; }
      .nav-btn:disabled { color: #423d59; cursor: default; background: none; }

      .close-btn {
        background: transparent;
        border: none;
        color: #9a94b8;
        font-size: 22px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        transition: color 0.2s, background 0.2s;
        line-height: 1;
      }
      .close-btn:hover { color: #f87171; background: #262233; }

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

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'url-input';
    input.placeholder = 'Search or enter address…';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';

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
