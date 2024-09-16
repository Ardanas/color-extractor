document.addEventListener('DOMContentLoaded', function() {
  const extractButton = document.getElementById('extractColors');
  const colorList = document.getElementById('colorList');

  extractButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: extractColorsFromPage,
      }, displayColors);
    });
  });

  function displayColors(results) {
    if (!results || !results[0]) return;
    const colors = results[0].result;
    colorList.innerHTML = '';
    colors.forEach(color => {
      const li = document.createElement('li');
      li.className = 'color-item';
      li.innerHTML = `
        <div class="color-sample" style="background-color: ${color}"></div>
        <span>${color}</span>
      `;
      li.addEventListener('click', function() {
        navigator.clipboard.writeText(color).then(() => {
          alert('Color copied to clipboard!');
        });
      });
      colorList.appendChild(li);
    });
  }
});

function extractColorsFromPage() {
  const elements = document.getElementsByTagName('*');
  const colorMap = new Map();

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
    const color = window.getComputedStyle(element).color;
    const backgroundColor = window.getComputedStyle(element).backgroundColor;

    if (color !== 'rgba(0, 0, 0, 0)') addColor(colorMap, rgbToHex(color));
    if (backgroundColor !== 'rgba(0, 0, 0, 0)') addColor(colorMap, rgbToHex(backgroundColor));
  }

  return Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
}