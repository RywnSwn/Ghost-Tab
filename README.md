# Ghost Sandbox Browser

A Chrome extension that opens a resizable browser panel inside any page you're visiting.

## How it works

A small toggle tab lives on the right edge of every page. Click it and a sidebar slides open with a full iframe browser. Type a URL or search term and hit Enter. Double-click anywhere on the main page to close it. Drag the tab up or down to move it, and drag the left edge of the panel to resize it.

To load sites that normally refuse embedding, the extension:

1. Strips framing-related response headers (`X-Frame-Options`, `Content-Security-Policy`, `Cross-Origin-*`, `Permissions-Policy`) off iframe responses.
2. Rewrites the iframe request's `Sec-Fetch-*` headers so the server sees a normal top-level navigation instead of an iframe load.
3. Spoofs `window.top` / `window.parent` / `frameElement` and strips `frame-ancestors` from meta CSP tags **inside the embedded frame**, so the site's own framebusting scripts think they are running top-level.

Some sites (Google accounts, YouTube, banking) enforce embedding rules the browser can't override from the page, so they may still refuse to load.

## Setup

1. Clone or download this repo
2. Go to `chrome://extensions`
3. Turn on Developer Mode
4. Click "Load unpacked" and select the folder

## Keybind

Open the popup, click Set, press a key combo. Saves to `chrome.storage.sync` and works immediately across tabs.

## Files

`manifest.json` configures the extension (Manifest V3). `bypass.js` is injected into **all frames** so the spoofing runs inside embedded sites; `design.js` and `content.js` run only in the top frame.

`background.js` registers the declarativeNetRequest rules that strip framing headers and rewrite the request headers.

`bypass.js` runs in the MAIN world at document_start. Inside embedded frames it spoofs iframe-detection APIs; on the host page it swallows blur events while the panel is open.

`design.js` builds the UI inside a Shadow DOM: the toggle tab, sidebar panel, URL bar, nav buttons, tab bar, and resize handle.

`content.js` wires up the event listeners, tab management, and a manual navigation history stack (cross-origin iframes block `contentWindow.history`).

`popup.html` and `popup.js` handle the popup UI where you set the keybind and toggle the side tab.
