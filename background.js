chrome.runtime.onInstalled.addListener(function() {
  console.log('插件已安装');
});

chrome.action.onClicked.addListener((tab) => {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
    width: 300,
    height: 600,
    top: 0,
    left: screen.width - 300 // Position the popup on the right side of the screen
  });
});