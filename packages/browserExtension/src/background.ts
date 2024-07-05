chrome.action.onClicked.addListener(async (tab) => {
    // Execute script in the current tab
    await chrome.scripting.executeScript({
        target: { tabId: tab!.id! },
        files: ["./scripts/main.js"],
        world: "MAIN",
    });
});
