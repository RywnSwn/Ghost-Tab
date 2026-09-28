// background.js
// Two declarativeNetRequest rules that make cross-origin sites loadable inside an iframe.

async function registerRules() {
  const rules = [
    // Rule 1: strip response headers that block or restrict framing.
    {
      id: 1,
      priority: 1,
      action: {
        type: "modifyHeaders",
        responseHeaders: [
          { header: "x-frame-options", operation: "remove" },
          { header: "content-security-policy", operation: "remove" },
          { header: "content-security-policy-report-only", operation: "remove" },
          { header: "cross-origin-opener-policy", operation: "remove" },
          { header: "cross-origin-embedder-policy", operation: "remove" },
          { header: "cross-origin-resource-policy", operation: "remove" },
          { header: "permissions-policy", operation: "remove" }
        ]
      },
      condition: {
        resourceTypes: ["sub_frame"]
      }
    },
    // Rule 2: rewrite the request so the server sees a normal top-level navigation
    // instead of an iframe load. Many servers block based on Sec-Fetch-Dest: iframe.
    {
      id: 2,
      priority: 1,
      action: {
        type: "modifyHeaders",
        requestHeaders: [
          { header: "sec-fetch-dest", operation: "set", value: "document" },
          { header: "sec-fetch-mode", operation: "set", value: "navigate" },
          { header: "sec-fetch-site", operation: "set", value: "none" },
          { header: "sec-fetch-user", operation: "set", value: "?1" }
        ]
      },
      condition: {
        resourceTypes: ["sub_frame"]
      }
    }
  ];

  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  const oldRuleIds = oldRules.map(rule => rule.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: oldRuleIds,
    addRules: rules
  });
}

chrome.runtime.onInstalled.addListener(registerRules);
chrome.runtime.onStartup.addListener(registerRules);
