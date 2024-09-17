chrome.runtime.onInstalled.addListener(function() {
  console.log('插件已安装');
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, {action: "toggleSidebar"}, function(response) {
    if (chrome.runtime.lastError) {
      // 如果 content script 还没有加载，则注入并执行它
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      }, () => {
        // 脚本执行完毕后再次发送消息
        chrome.tabs.sendMessage(tab.id, {action: "toggleSidebar"});
      });
    }
  });
});