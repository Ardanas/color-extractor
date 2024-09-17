document.addEventListener('DOMContentLoaded', function() {
  const colorGrid = document.getElementById('colorGrid');
  const gradientList = document.getElementById('gradientList');
  const colorTab = document.getElementById('colorTab');
  const gradientTab = document.getElementById('gradientTab');
  const refreshButton = document.getElementById('refreshButton');
  const closeButton = document.getElementById('closeButton');

  // 初始化时提取颜色
  extractColors();

  // 添加关闭按钮功能
  closeButton.addEventListener('click', function() {
    window.parent.postMessage({action: 'closeSidebar'}, '*');
  });

  // 添加刷新按钮功能
  refreshButton.addEventListener('click', function() {
    extractColors();
  });

  // 添加标签切换功能
  colorTab.addEventListener('click', function() {
    openTab('Colors');
  });

  gradientTab.addEventListener('click', function() {
    openTab('Gradients');
  });

  function extractColors() {
    // 向父窗口发送消息，请求提取颜色
    window.parent.postMessage({action: 'extractColors'}, '*');
  }

  function displayResults(colors, gradients) {
    // Display colors
    colorGrid.innerHTML = ''; // Clear previous colors
    colors.forEach(color => {
      const div = document.createElement('div');
      div.className = 'color-item';
      div.innerHTML = `
        <div class="color-sample" style="background-color: ${color}"></div>
        <span style="white-space: nowrap;">${color}</span>
      `;
      div.addEventListener('click', function() {
        copyToClipboard(color);
      });
      colorGrid.appendChild(div);
    });

    // Display gradients
    gradientList.innerHTML = ''; // Clear previous gradients
    gradients.forEach(gradient => {
      const li = document.createElement('li');
      li.className = 'gradient-item';
      li.innerHTML = `
        <div class="gradient-sample" style="background-image: ${gradient}"></div>
        <span>${gradient}</span>
      `;
      li.addEventListener('click', function() {
        copyToClipboard(gradient);
      });
      gradientList.appendChild(li);
    });
  }

  function openTab(tabName) {
    const tabContents = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabContents.length; i++) {
      tabContents[i].style.display = 'none';
    }
    document.getElementById(tabName).style.display = 'block';

    const tabLinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tabLinks.length; i++) {
      tabLinks[i].classList.remove('active');
    }
    event.currentTarget.classList.add('active');
  }

  function copyToClipboard(text) {
    // 向父窗口发送消息，请求复制文本
    window.parent.postMessage({action: 'copyToClipboard', text: text}, '*');
  }

  // 监听来自 content script 的消息
  window.addEventListener('message', function(event) {
    if (event.data.action === 'displayColors') {
      displayResults(event.data.colors, event.data.gradients);
    } else if (event.data.action === 'copySuccess') {
      alert('Copied to clipboard!');
    }
  });
});