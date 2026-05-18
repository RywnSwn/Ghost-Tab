# Ghost Sandbox Browser

A Chrome extension that opens a resizable browser panel inside any page you're visiting.

## How it works

A small toggle tab lives on the right edge of every page. Click it and a sidebar slides open with a full iframe browser. Type a URL or search term and hit Enter. Double-click anywhere on the main page to close it.

It strips `X-Frame-Options` and `Content-Security-Policy` headers off iframe responses, so most sites that normally block embedding will load inside the panel.

## Setup

1. Clone or download this repo
2. Go to `chrome://extensions`
3. Turn on Developer Mode
4. Click "Load unpacked" and select the folder

## Keybind

Open the popup, click Set, press a key combo. Saves to `chrome.storage.sync` and works immediately across tabs.

## Files

`manifest.json` configures the extension (Manifest V3).

`background.js` strips the X-Frame-Options and CSP headers on install using declarativeNetRequest.

`bypass.js` intercepts blur events at the window level so host-page focus-detection scripts don't trigger while the panel is open. Runs in the MAIN world at document_start.

`design.js` builds all the UI inside a Shadow DOM: the toggle tab, sidebar panel, URL bar, nav buttons, and the resize handle.

`content.js` connects all the event listeners, a manual navigation history stack (cross-origin iframes block `contentWindow.history`), and the keybind handler.

`popup.html` and `popup.js` handle the popup UI where you set the keybind.
