async function registerRules() {
  const rules = [
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
          { header: "cross-origin-resource-policy", operation: "remove" }
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
