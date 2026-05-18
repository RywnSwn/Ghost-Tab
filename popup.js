const display = document.getElementById('keybindDisplay');
const setBtn = document.getElementById('setBtn');

let capturing = false;

function keybindToString(kb) {
  if (!kb || !kb.key) return '—';
  const parts = [];
  if (kb.ctrl)  parts.push('Ctrl');
  if (kb.alt)   parts.push('Alt');
  if (kb.shift) parts.push('Shift');
  if (kb.meta)  parts.push('Cmd');
  parts.push(kb.key.length === 1 ? kb.key.toUpperCase() : kb.key);
  return parts.join('+');
}

function loadKeybind() {
  chrome.storage.sync.get('ghostKeybind', ({ ghostKeybind }) => {
    display.textContent = keybindToString(ghostKeybind);
  });
}

function startCapture() {
  capturing = true;
  display.textContent = 'Press a key…';
  display.classList.add('capturing');
  setBtn.textContent = 'Cancel';
  setBtn.classList.add('cancel');
  window.addEventListener('keydown', onKeyDown, true);
}

function stopCapture() {
  capturing = false;
  display.classList.remove('capturing');
  setBtn.textContent = 'Set';
  setBtn.classList.remove('cancel');
  window.removeEventListener('keydown', onKeyDown, true);
}

function onKeyDown(e) {
  e.preventDefault();
  e.stopPropagation();

  // Ignore bare modifiers
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

  const kb = {
    key:   e.key,
    ctrl:  e.ctrlKey,
    alt:   e.altKey,
    shift: e.shiftKey,
    meta:  e.metaKey,
  };

  chrome.storage.sync.set({ ghostKeybind: kb }, () => {
    display.textContent = keybindToString(kb);
    stopCapture();
  });
}

setBtn.addEventListener('click', () => {
  if (capturing) {
    stopCapture();
    loadKeybind();
  } else {
    startCapture();
  }
});

loadKeybind();
