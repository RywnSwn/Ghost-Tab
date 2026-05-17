# Ghost Sandbox Browser

A Chrome extension that adds a hidden browser panel to any page. Click the tab on the right edge and a sidebar slides out. Browse, search, navigate URLs, then close it. You never leave the original page.

---

## Features

- **Slide-out panel** — sits on the right side, out of the way until you need it
- **In-page iframe browsing** — full browser inside the panel, starts on Google
- **Configurable keybind** — any key combo to toggle it open/closed
- **Resizable** — drag the left edge anywhere between 320px and 680px wide
- **Blur bypass** — the host page can't tell you switched focus when the panel is open
- **Header stripping** — removes `x-frame-options` and `content-security-policy` so most sites actually load in the iframe
- **Keyboard forwarding** — key combos pressed inside the iframe still trigger your hotkey
- **Shadow DOM UI** — styles are fully isolated, nothing leaks into the host page

---

## Installation

This is an unpacked extension, so you load it manually.

1. Download or clone this repo
2. Go to `chrome://extensions` in Chrome
3. Turn on **Developer mode** (top right toggle)
4. Click **Load unpacked**
5. Pick the folder with `manifest.json` in it

Icons go in `icons/` as `Hexagon-16.png`, `Hexagon-48.png`, and `Hexagon-128.png`.

---

## Usage

A small tab handle sits on the right edge of every page. Click it to open the panel.

### Navigation

- Type a URL and hit **Enter** to go there (it adds `https://` if you forget)
- Type anything else and it searches Google
- Defaults to Google on first load

### Keybind

1. Click the gear icon in the panel header
2. Click the keybind box, then press whatever combo you want
3. Hit **Save**

The keybind saves to `localStorage` so it sticks between sessions.

### Resizing

Drag the left edge of the panel left or right.

---

## File Structure

```
ghost-sandbox-browser/
├── manifest.json      # MV3 manifest
├── background.js      # Service worker, strips iframe-blocking headers
├── bypass.js          # Runs in MAIN world, suppresses blur events
├── content.js         # Runs in ISOLATED world, builds the panel
├── design.js          # CSS and HTML templates, exposed as globals
└── icons/
    ├── Hexagon-16.png
    ├── Hexagon-48.png
    └── Hexagon-128.png
```

---

## Permissions

| Permission | Why |
|---|---|
| `activeTab` | Inject scripts into the current tab |
| `scripting` | Run scripts programmatically |
| `declarativeNetRequest` | Strip headers that block iframes |
| `<all_urls>` | Make the rules apply everywhere |

---

## How It Works

**`background.js`** adds a `declarativeNetRequest` rule on install. It strips `x-frame-options` and `content-security-policy` from subframe responses, which is what lets most sites load inside the panel at all.

**`bypass.js`** injects into the page's MAIN world before anything else runs. It wraps `window.addEventListener` and drops `blur` events when the Ghost panel is open, so the page doesn't think you left.

**`content.js`** builds the whole panel inside a Shadow DOM. Handles open/close, URL navigation, keybind matching, and the resize drag. Reads styles and HTML from globals set by `design.js`.

**`design.js`** just sets `window.GhostStyles` and `window.createGhostCardHTML` so `content.js` can use them. Both files run in the ISOLATED world, so the globals are shared between them but not visible to the page.

---

## Notes

- Sites that enforce CSP at the server level (not just via headers) may still refuse to load in the iframe. Not much to do about that.
- Panel open/closed state resets on page navigation. The keybind does not.
- Built on Manifest V3.
