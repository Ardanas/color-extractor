document.addEventListener('DOMContentLoaded', function() {
  const colorGrid = document.getElementById('colorGrid');
  const gradientList = document.getElementById('gradientList');
  const colorTab = document.getElementById('colorTab');
  const gradientTab = document.getElementById('gradientTab');
  const loadingMessage = document.getElementById('loadingMessage');

  // Automatically extract colors when the popup is opened
  extractColors();

  // Set up MutationObserver to listen for DOM changes
  const observer = new MutationObserver(() => {
    extractColors();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  colorTab.addEventListener('click', function(event) {
    openTab(event, 'Colors');
  });

  gradientTab.addEventListener('click', function(event) {
    openTab(event, 'Gradients');
  });

  function extractColors() {
    loadingMessage.style.display = 'block'; // Show loading message
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: extractColorsAndGradients,
        },
        displayResults
      );
    });
  }

  function displayResults(results) {
    loadingMessage.style.display = 'none'; // Hide loading message
    if (!results || !results[0]) return;
    const { colors, gradients } = results[0].result;

    // Display colors
    colorGrid.innerHTML = '';
    colors.forEach(color => {
      const div = document.createElement('div');
      div.className = 'color-item';
      div.innerHTML = `
        <div class="color-sample" style="background-color: ${color}"></div>
        <span>${color}</span>
      `;
      div.addEventListener('click', function() {
        copyToClipboard(color);
      });
      colorGrid.appendChild(div);
    });

    // Display gradients
    gradientList.innerHTML = '';
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

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  }
});

function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

function extractColorsAndGradients() {
  const elements = document.getElementsByTagName('*');
  const colorMap = new Map();
  const gradients = new Set();

  function addColor(map, color) {
    map.set(color, (map.get(color) || 0) + 1);
  }

  function rgbToHex(rgb) {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb;
    const hex = x => ('0' + parseInt(x).toString(16)).slice(-2);
    return '#' + hex(match[1]) + hex(match[2]) + hex(match[3]);
  }

  for (let element of elements) {
    const style = window.getComputedStyle(element);
    const color = style.color;
    const backgroundColor = style.backgroundColor;
    const backgroundImage = style.backgroundImage;

    if (color !== 'rgba(0, 0, 0, 0)') addColor(colorMap, rgbToHex(color));
    if (backgroundColor !== 'rgba(0, 0, 0, 0)') addColor(colorMap, rgbToHex(backgroundColor));

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