chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
    // Execute script in the current tab
    await chrome.scripting.executeScript({
        target: { tabId: tab!.id!, allFrames: true },
        files: ["./scripts/editorLauncher.js"],
        world: "MAIN",
    });
});
