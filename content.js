(function() {
  if (window.hasOwnProperty('colorExtractorSidebarInjected')) {
    return;
  }
  window.colorExtractorSidebarInjected = true;

  let sidebarInjected = false;

  function injectSidebar() {
    if (sidebarInjected) return;
    const sidebar = document.createElement('iframe');
    sidebar.id = 'colorExtractorSidebar';
    sidebar.src = chrome.runtime.getURL('sidebar.html');
    sidebar.style.width = '360px';  // 更新宽度
    document.body.appendChild(sidebar);
    sidebarInjected = true;
    setTimeout(() => {
      sidebar.classList.add('open');
    }, 100);
  }

  function toggleSidebar() {
    const sidebar = document.getElementById('colorExtractorSidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
    } else {
      injectSidebar();
    }
  }

  function extractColorsAndGradients() {
    const elements = document.getElementsByTagName('*');
    const colorMap = new Map();
    const gradients = new Set();

    function addColor(map, color) {
      map.set(color, (map.get(color) || 0) + 1);
    }

    function rgbToHex(color) {
      // 匹配RGB或RGBA值
      const rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
      const rgbaRegex = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/;

      let rgb, a;

      if (rgbRegex.test(color)) {
        rgb = color.match(rgbRegex).slice(1);
      } else if (rgbaRegex.test(color)) {
        const match = color.match(rgbaRegex);
        rgb = match.slice(1, 4);
        a = parseFloat(match[4]);
      } else {
        return color; // 如果不是RGB或RGBA格式，直接返原始颜色值
      }

      // 将RGB值转换为16进制
      const hex = rgb.map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      });

      // 如果是RGBA，添加alpha通道
      if (a !== undefined) {
        const alpha = Math.round(a * 255).toString(16);
        hex.push(alpha.length === 1 ? '0' + alpha : alpha);
      }

      return '#' + hex.join('');
    }

    for (let element of elements) {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      const backgroundImage = style.backgroundImage;

      if (color !== 'rgba(0, 0, 0, 0)') {
        const hexColor = rgbToHex(color);
        addColor(colorMap, hexColor);
      }
      if (backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const hexBackgroundColor = rgbToHex(backgroundColor);
        addColor(colorMap, hexBackgroundColor);
      }

      if (backgroundImage !== 'none' && backgroundImage.includes('gradient')) {
        gradients.add(backgroundImage);
      }
    }

    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    return {
      colors: sortedColors,
      gradients: Array.from(gradients)
    };
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleSidebar") {
      toggleSidebar();
      sendResponse({status: "Sidebar toggled"});
    }
  });

  // 监听来自 sidebar 的消息
  window.addEventListener('message', function(event) {
    if (event.data.action === 'closeSidebar') {
      const sidebar = document.getElementById('colorExtractorSidebar');
      if (sidebar) {
        sidebar.classList.remove('open');
      }
    } else if (event.data.action === 'extractColors') {
      const results = extractColorsAndGradients();
      const sidebar = document.getElementById('colorExtractorSidebar');
      if (sidebar) {
        sidebar.contentWindow.postMessage({
          action: 'displayColors',
          colors: results.colors,
          gradients: results.gradients
        }, '*');
      }
    } else if (event.data.action === 'copyToClipboard') {
      // 执行复制操作
      const textArea = document.createElement("textarea");
      textArea.value = event.data.text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      // 通知 sidebar 复制成功
      const sidebar = document.getElementById('colorExtractorSidebar');
      if (sidebar) {
        sidebar.contentWindow.postMessage({
          action: 'copySuccess'
        }, '*');
      }
    }
  });

  console.log('Content script loaded and ready');
})();