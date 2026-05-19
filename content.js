// content.js
(function() {
  if (window.__ghostBrowserLoaded) return;
  window.__ghostBrowserLoaded = true;

  if (!window.__createGhostBrowserUI) return;
  const ui = window.__createGhostBrowserUI();

  // --- Tab management ---
  const tabs = [];
  let activeId = null;
  let nextId = 0;

  function tabLabel(url) {
    try { return new URL(url).hostname || 'New Tab'; }
    catch { return url.slice(0, 24) || 'New Tab'; }
  }

  function getActive() {
    return tabs.find(t => t.id === activeId) || null;
  }

  function switchToTab(id) {
    activeId = id;
    tabs.forEach(t => {
      const on = t.id === id;
      t.iframe.classList.toggle('active', on);
      t.tabEl.classList.toggle('active', on);
      if (on) ui.input.value = t.history[t.histIdx] || '';
    });
  }

  function closeTab(id) {
    const idx = tabs.findIndex(t => t.id === id);
    if (idx === -1) return;
    const tab = tabs[idx];
    tab.iframe.remove();
    tab.tabEl.remove();
    tabs.splice(idx, 1);
    if (tabs.length === 0) {
      createTab();
    } else if (activeId === id) {
      switchToTab(tabs[Math.min(idx, tabs.length - 1)].id);
    }
  }

  function createTab(url = 'https://www.google.com/search?igu=1') {
    const id = nextId++;

    const iframe = document.createElement('iframe');
    iframe.className = 'view-area';
    iframe.src = url;
    ui.viewContainer.appendChild(iframe);

    const tabEl = document.createElement('div');
    tabEl.className = 'tab-item';

    const label = document.createElement('span');
    label.className = 'tab-label';
    label.textContent = tabLabel(url);

    const closeX = document.createElement('button');
    closeX.className = 'tab-close';
    closeX.textContent = '×';
    closeX.addEventListener('click', (e) => { e.stopPropagation(); closeTab(id); });

    tabEl.appendChild(label);
    tabEl.appendChild(closeX);
    tabEl.addEventListener('click', () => switchToTab(id));

    ui.tabBar.insertBefore(tabEl, ui.addTabBtn);

    const tab = { id, iframe, history: [url], histIdx: 0, tabEl, label };
    tabs.push(tab);
    switchToTab(id);
    return tab;
  }

  function navigateTo(url, pushToHistory = true) {
    const tab = getActive();
    if (!tab) return;
    if (pushToHistory) {
      tab.history.splice(tab.histIdx + 1);
      tab.history.push(url);
      tab.histIdx = tab.history.length - 1;
    }
    tab.iframe.src = url;
    ui.input.value = url;
    tab.label.textContent = tabLabel(url);
  }

  // Start with one tab
  createTab();

  // --- UI event listeners ---
  ui.btn.addEventListener('click', (e) => {
    e.stopPropagation();
    ui.setBrowserVisibility(true);
  });

  ui.closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    ui.setBrowserVisibility(false);
  });

  ui.addTabBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    createTab();
  });

  ui.backBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const tab = getActive();
    if (tab && tab.histIdx > 0) {
      tab.histIdx--;
      navigateTo(tab.history[tab.histIdx], false);
    }
  });

  ui.forwardBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const tab = getActive();
    if (tab && tab.histIdx < tab.history.length - 1) {
      tab.histIdx++;
      navigateTo(tab.history[tab.histIdx], false);
    }
  });

  ui.refreshBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const tab = getActive();
    if (tab) tab.iframe.src = tab.iframe.src;
  });

  ui.container.addEventListener('mouseleave', (e) => e.stopPropagation());
  ui.container.addEventListener('mouseenter', (e) => e.stopPropagation());
  ui.container.addEventListener('mousemove', (e) => e.stopPropagation());

  window.addEventListener('dblclick', (e) => {
    const host = document.getElementById('ghost-browser-shield-host');
    if (host && host.shadowRoot && host.shadowRoot.contains(e.target)) return;
    ui.setBrowserVisibility(false);
  });

  // Enabled toggle
  chrome.storage.sync.get('ghostEnabled', ({ ghostEnabled }) => {
    if (ghostEnabled === false) ui.btn.classList.add('hidden');
  });
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.ghostEnabled) {
      const on = changes.ghostEnabled.newValue !== false;
      if (on) {
        ui.btn.classList.remove('hidden');
      } else {
        ui.btn.classList.add('hidden');
        ui.setBrowserVisibility(false);
      }
    }
  });

  // Global keybind toggle
  let currentKeybind = null;
  chrome.storage.sync.get('ghostKeybind', ({ ghostKeybind }) => {
    currentKeybind = ghostKeybind || null;
  });
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.ghostKeybind) currentKeybind = changes.ghostKeybind.newValue;
  });
  window.addEventListener('keydown', (e) => {
    const kb = currentKeybind;
    if (!kb || !kb.key) return;
    const host = document.getElementById('ghost-browser-shield-host');
    if (host && host.shadowRoot && host.shadowRoot.contains(e.target)) return;
    if (
      e.key === kb.key &&
      e.ctrlKey  === !!kb.ctrl &&
      e.altKey   === !!kb.alt &&
      e.shiftKey === !!kb.shift &&
      e.metaKey  === !!kb.meta
    ) {
      e.preventDefault();
      const isOpen = host && host.getAttribute('data-open') === 'true';
      ui.setBrowserVisibility(!isOpen);
    }
  }, true);

  ui.input.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      let target = ui.input.value.trim();
      if (!target) return;
      if (!/^https?:\/\//i.test(target) && target.includes('.') && !target.includes(' ')) {
        target = 'https://' + target;
      } else if (!/^https?:\/\//i.test(target)) {
        target = 'https://www.google.com/search?q=' + encodeURIComponent(target) + '&igu=1';
      }
      navigateTo(target);
    }
  });
})();
