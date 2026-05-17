// Expose UI templates and elements globally to the ISOLATED world
window.GhostStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── bookmark tab ── */
  .tab {
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 56px;
    background: #111118;
    border: 1px solid #222230;
    border-right: none;
    border-radius: 6px 0 0 6px;
    cursor: pointer;
    pointer-events: all;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                width 0.2s ease,
                box-shadow 0.25s ease,
                background 0.2s,
                border-color 0.2s;
    z-index: 2147483647;
    overflow: hidden;
  }
  .tab::before {
    content: '';
    width: 3px;
    height: 22px;
    background: linear-gradient(180deg, #3a3a52 0%, #5a5a7a 50%, #3a3a52 100%);
    border-radius: 2px;
    flex-shrink: 0;
    transition: background 0.2s;
  }
  .tab:hover {
    width: 22px;
    background: #17171f;
    border-color: #33334a;
    box-shadow: -3px 0 16px rgba(160,160,255,0.08), -1px 0 6px rgba(160,160,255,0.06);
  }
  .tab:hover::before {
    background: linear-gradient(180deg, #6060a0 0%, #9090c8 50%, #6060a0 100%);
  }
  .tab.open {
    border-right: 1px solid #222230;
    border-radius: 6px 0 0 6px;
  }

  /* ── panel ── */
  .panel {
    position: fixed;
    right: calc(-1 * var(--pw, 420px) - 2px);
    top: 0;
    width: var(--pw, 420px);
    height: 100vh;
    background: #09090e;
    border-left: 1px solid #1a1a26;
    box-shadow: -8px 0 32px rgba(0,0,0,0.75);
    transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
    z-index: 2147483646;
    pointer-events: all;
    font-family: 'DM Mono', monospace;
  }
  .panel.open { right: 0; }

  /* resize handle */
  .resize-handle {
    position: absolute;
    left: -4px;
    top: 0;
    width: 8px;
    height: 100%;
    cursor: ew-resize;
    z-index: 10;
    background: transparent;
    transition: background 0.15s;
  }
  .resize-handle:hover,
  .resize-handle.dragging {
    background: rgba(120,120,200,0.1);
  }

  /* ── header ── */
  .header {
    padding: 9px 10px;
    background: #0c0c13;
    border-bottom: 1px solid #181824;
    display: flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
  }

  .url-bar {
    flex: 1;
    padding: 7px 10px;
    background: #131320;
    color: #d8d8ee;
    border: 1px solid #22223a;
    border-radius: 5px;
    font-family: 'DM Mono', monospace;
    font-size: 11.5px;
    outline: none;
    transition: border-color 0.15s;
    min-width: 0;
  }
  .url-bar:focus { border-color: rgba(255,255,255,0.28); }
  .url-bar::placeholder { color: #35354a; }

  .icon-btn {
    width: 28px;
    height: 28px;
    background: #131320;
    border: 1px solid #22223a;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #44445e;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
    outline: none;
    flex-shrink: 0;
  }
  .icon-btn:hover { color: #b0b0d0; border-color: #333348; background: #1a1a2a; }

  /* ── iframe ── */
  .frame {
    flex: 1;
    border: none;
    background: #fff;
    min-height: 0;
  }

  /* ── settings overlay ── */
  .settings-overlay {
    position: absolute;
    inset: 0;
    background: rgba(4, 4, 8, 0.88);
    backdrop-filter: blur(4px);
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.18s;
  }
  .settings-overlay.visible {
    opacity: 1;
    pointer-events: all;
  }

  .settings-card {
    width: 272px;
    background: #0e0e18;
    border: 1px solid #1e1e30;
    border-radius: 10px;
    overflow: hidden;
    transform: translateY(8px) scale(0.97);
    transition: transform 0.22s cubic-bezier(0.16,1,0.3,1);
  }
  .settings-overlay.visible .settings-card {
    transform: translateY(0) scale(1);
  }

  .card-head {
    padding: 13px 15px 11px;
    border-bottom: 1px solid #1a1a28;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .card-title {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #8080a0;
  }
  .card-sub {
    font-size: 9.5px;
    color: #2a2a3e;
    letter-spacing: 0.05em;
  }

  .card-body {
    padding: 16px 15px 14px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .field-label {
    font-size: 9.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #40405a;
    margin-bottom: 7px;
  }

  .kb-box {
    width: 100%;
    padding: 9px 12px;
    background: #131320;
    border: 1px solid #22223a;
    border-radius: 5px;
    color: #c0c0e0;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    cursor: pointer;
    outline: none;
    text-align: center;
    transition: border-color 0.15s, background 0.15s;
    user-select: none;
  }
  .kb-box:hover { border-color: #303048; }
  .kb-box.capturing {
    border-color: rgba(140,140,210,0.5);
    background: #161625;
    color: #55556e;
    animation: pulse-border 1s ease infinite;
  }
  @keyframes pulse-border {
    0%, 100% { border-color: rgba(140,140,210,0.5); }
    50%       { border-color: rgba(140,140,210,0.18); }
  }
  .kb-hint {
    font-size: 9.5px;
    color: #2c2c42;
    margin-top: 5px;
    text-align: center;
  }

  .sep { height: 1px; background: #141420; }

  .btn-row { display: flex; gap: 7px; }
  .btn {
    flex: 1;
    padding: 8px 0;
    border-radius: 5px;
    font-family: 'DM Mono', monospace;
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.06em;
    cursor: pointer;
    outline: none;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .btn-cancel {
    background: transparent;
    border: 1px solid #1c1c2c;
    color: #40405a;
  }
  .btn-cancel:hover { background: #111120; color: #8080a0; border-color: #28283c; }
  .btn-save {
    background: #e2e2ee;
    border: 1px solid transparent;
    color: #09090e;
  }
  .btn-save:hover { background: #ffffff; }
`;

window.createGhostCardHTML = function() {
  return `
    <div class="card-head">
      <span class="card-title">Settings</span>
      <span class="card-sub">Ghost Browser v1.2</span>
    </div>
    <div class="card-body">
      <div>
        <div class="field-label">Toggle Keybind</div>
        <div class="kb-box" id="kb-capture">Click to set keybind</div>
        <div class="kb-hint" id="kb-hint">Click the box above and press any key combo.</div>
      </div>
      <div class="sep"></div>
      <div class="btn-row">
        <button class="btn btn-cancel" id="kb-cancel">Cancel</button>
        <button class="btn btn-save" id="kb-save">Save</button>
      </div>
    </div>
  `;
};