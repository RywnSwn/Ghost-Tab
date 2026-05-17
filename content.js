(function () {
  // If running inside the iframe, forward keydown events to the top frame
  if (window !== window.top) {
    window.addEventListener('keydown', (e) => {
      window.top.postMessage({
        type: 'GHOST_KEYBOARD_EVENT',
        key: e.key,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey
      }, '*');
    }, true);
    return;
  }

  if (window.__ghostBrowserLoaded) return;
  window.__ghostBrowserLoaded = true;

  /* ─── keybind helpers ─── */
  let currentKeybind = null;
  const STORAGE_KEY = 'ghost_keybind';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) currentKeybind = JSON.parse(raw);
  } catch {}

  function saveKeybind(kb) {
    currentKeybind = kb;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(kb)); } catch {}
  }

  function keybindLabel(kb) {
    if (!kb) return 'Not set';
    const p = [];
    if (kb.ctrl)  p.push('Ctrl');
    if (kb.alt)   p.push('Alt');
    if (kb.shift) p.push('Shift');
    if (kb.meta)  p.push('⌘');
    if (kb.key)   p.push(kb.key.length === 1 ? kb.key.toUpperCase() : kb.key);
    return p.join(' + ');
  }

  /* ─── panel state ─── */
  let panelOpen = false;
  let panelWidth = 420;
  const MIN_WIDTH = 320;
  const MAX_WIDTH = 680;

  /* ─── host / shadow ─── */
  const host = document.createElement('div');
  host.id = 'ghost-browser-shield-host';
  host.setAttribute('data-open', 'false');
  host.style.cssText = 'position:fixed;top:0;right:0;z-index:2147483647;pointer-events:none;';
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: 'closed' });

  /* ─── styles (Pulled from design.js) ─── */
  const style = document.createElement('style');
  style.textContent = window.GhostStyles || '';
  shadow.appendChild(style);

  /* ─── tab (bookmark handle) ─── */
  const tab = document.createElement('div');
  tab.className = 'tab';
  tab.title = 'Ghost Browser';
  shadow.appendChild(tab);

  /* ─── panel ─── */
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.style.setProperty('--pw', panelWidth + 'px');

  /* resize handle */
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'resize-handle';
  panel.appendChild(resizeHandle);

  /* header */
  const header = document.createElement('div');
  header.className = 'header';

  const urlBar = document.createElement('input');
  urlBar.type = 'text';
  urlBar.className = 'url-bar';
  urlBar.placeholder = 'Search or enter URL…';

  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'icon-btn';
  settingsBtn.title = 'Settings';
  settingsBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="2.2" stroke="currentColor" stroke-width="1.4"/>
    <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.93 2.93l1.06 1.06M12.01 12.01l1.06 1.06M2.93 13.07l1.06-1.06M12.01 3.99l1.06-1.06" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`;

  header.appendChild(urlBar);
  header.appendChild(settingsBtn);
  panel.appendChild(header);

  /* iframe */
  const frame = document.createElement('iframe');
  frame.className = 'frame';
  frame.src = 'https://www.google.com/search?igu=1';
  panel.appendChild(frame);

  /* settings overlay */
  const overlay = document.createElement('div');
  overlay.className = 'settings-overlay';

  const card = document.createElement('div');
  card.className = 'settings-card';
  card.tabIndex = -1;
  card.innerHTML = window.createGhostCardHTML ? window.createGhostCardHTML() : '';

  overlay.appendChild(card);
  panel.appendChild(overlay);
  shadow.appendChild(panel);

  /* ─── update tab position to always sit on left edge of panel ─── */
  function updateTabPosition() {
    if (panelOpen) {
      tab.style.right = panelWidth + 'px';
    } else {
      tab.style.right = '0px';
    }
  }

  /* ─── settings logic ─── */
  const kbCapture = card.querySelector('#kb-capture');
  const kbHint    = card.querySelector('#kb-hint');
  const kbCancel  = card.querySelector('#kb-cancel');
  const kbSave    = card.querySelector('#kb-save');

  let pendingKeybind = null;
  let isCapturing = false;

  function openSettings() {
    pendingKeybind = null;
    isCapturing = false;
    kbCapture.classList.remove('capturing');
    kbCapture.textContent = currentKeybind ? keybindLabel(currentKeybind) : 'Click to set keybind';
    kbHint.textContent = 'Click the box above and press any key combo.';
    overlay.classList.add('visible');
  }

  function closeSettings() {
    overlay.classList.remove('visible');
    isCapturing = false;
    kbCapture.classList.remove('capturing');
  }

  kbCapture.addEventListener('click', () => {
    isCapturing = true;
    kbCapture.classList.add('capturing');
    kbCapture.textContent = 'Listening…';
    kbHint.textContent = 'Press your key combo now.';
    card.focus();
  });

  function handleCapture(e) {
    if (!isCapturing) return;
    if (['Control','Alt','Shift','Meta'].includes(e.key)) return;
    e.preventDefault();
    e.stopPropagation();
    pendingKeybind = { key: e.key, ctrl: e.ctrlKey, alt: e.altKey, shift: e.shiftKey, meta: e.metaKey };
    isCapturing = false;
    kbCapture.classList.remove('capturing');
    kbCapture.textContent = keybindLabel(pendingKeybind);
    kbHint.textContent = 'Looks good — hit Save to confirm.';
  }

  card.addEventListener('keydown', handleCapture, true);
  document.addEventListener('keydown', handleCapture, true);

  kbSave.addEventListener('click', () => { if (pendingKeybind) saveKeybind(pendingKeybind); closeSettings(); });
  kbCancel.addEventListener('click', closeSettings);
  settingsBtn.addEventListener('click', openSettings);

  /* ─── panel open/close ─── */
  function setPanel(open) {
    panelOpen = open;
    panel.classList.toggle('open', open);
    tab.classList.toggle('open', open);
    host.setAttribute('data-open', open ? 'true' : 'false');

    if (open) {
      frame.blur();
      frame.style.pointerEvents = 'all';
    }

    updateTabPosition();
  }

  tab.addEventListener('click', () => setPanel(!panelOpen));

  /* ─── keybind tracking ─── */
  function matchKeybind(eventData) {
    if (!currentKeybind || isCapturing) return;
    if (
      eventData.key      === currentKeybind.key   &&
      eventData.ctrlKey  === currentKeybind.ctrl  &&
      eventData.altKey   === currentKeybind.alt   &&
      eventData.shiftKey === currentKeybind.shift &&
      eventData.metaKey  === currentKeybind.meta
    ) {
      setPanel(!panelOpen);
    }
  }

  // Catch hotkeys fired from the main context
  document.addEventListener('keydown', (e) => {
    if (currentKeybind && !isCapturing && e.key === currentKeybind.key) {
      if (e.ctrlKey === currentKeybind.ctrl && e.altKey === currentKeybind.alt && e.shiftKey === currentKeybind.shift && e.metaKey === currentKeybind.meta) {
        e.preventDefault();
        setPanel(!panelOpen);
      }
    }
  }, true);

  // Catch hotkeys streamed via postMessage from the iframe context
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'GHOST_KEYBOARD_EVENT') {
      matchKeybind(e.data);
    }
  });

  /* ─── click outside page to close ─── */
  document.addEventListener('mousedown', (e) => {
    if (!panelOpen) return;
    if (!host.contains(e.target)) {
      setPanel(false);
    }
  }, true);

  /* ─── URL nav ─── */
  urlBar.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      let t = urlBar.value.trim();
      if (!t) return;
      if (!/^https?:\/\//i.test(t) && t.includes('.') && !t.includes(' ')) t = 'https://' + t;
      else if (!/^https?:\/\//i.test(t)) t = 'https://www.google.com/search?q=' + encodeURIComponent(t) + '&igu=1';
      frame.src = t;
    }
  });

  /* ─── resize ─── */
  let resizing = false, resizeStartX = 0, resizeStartW = 0;

  resizeHandle.addEventListener('mousedown', (e) => {
    resizing = true;
    resizeStartX = e.clientX;
    resizeStartW = panelWidth;
    resizeHandle.classList.add('dragging');
    frame.style.pointerEvents = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!resizing) return;
    const newW = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, resizeStartW + (resizeStartX - e.clientX)));
    panelWidth = newW;
    panel.style.setProperty('--pw', newW + 'px');
    if (panelOpen) tab.style.right = newW + 'px';
  }, true);

  document.addEventListener('mouseup', () => {
    if (!resizing) return;
    resizing = false;
    resizeHandle.classList.remove('dragging');
    frame.style.pointerEvents = 'all';
  }, true);

  panel.addEventListener('mouseleave',  (e) => e.stopPropagation());
  panel.addEventListener('mouseenter',  (e) => e.stopPropagation());
  panel.addEventListener('mousemove',   (e) => e.stopPropagation());
})();