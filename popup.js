// Move extractColorsAndGradients to the top
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
      throw new Error('Invalid RGB or RGBA color format');
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

    if (color.startsWith('rgb')) {
      const hexColor = rgbToHex(color);
      addColor(colorMap, hexColor);
      console.log(`Found color: ${hexColor}`); // Debugging line
    }
    if (backgroundColor.startsWith('rgb')) {
      const hexBackgroundColor = rgbToHex(backgroundColor);
      addColor(colorMap, hexBackgroundColor);
      console.log(`Found background color: ${hexBackgroundColor}`); // Debugging line
    }

    if (backgroundImage !== 'none' && backgroundImage.includes('gradient')) {
      gradients.add(backgroundImage);
      console.log(`Found gradient: ${backgroundImage}`); // Debugging line
    }
  }

  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);

  console.log(`Extracted colors: ${sortedColors}`); // Debugging line
  console.log(`Extracted gradients: ${Array.from(gradients)}`); // Debugging line

  return {
    colors: sortedColors,
    gradients: Array.from(gradients)
  };
}

// Keep the rest of the code as is
document.addEventListener('DOMContentLoaded', function() {
  const colorGrid = document.getElementById('colorGrid');
  const gradientList = document.getElementById('gradientList');
  const colorTab = document.getElementById('colorTab');
  const gradientTab = document.getElementById('gradientTab');
  const refreshButton = document.getElementById('refreshButton'); // Get refresh button

  // Automatically extract colors when the popup is opened
  extractColors();

  // Add event listener for refresh button
  refreshButton.addEventListener('click', function() {
    extractColors(); // Call extractColors when button is clicked
  });

  colorTab.addEventListener('click', function(event) {
    openTab(event, 'Colors');
  });

  gradientTab.addEventListener('click', function(event) {
    openTab(event, 'Gradients');
  });

  function extractColors() {
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
    if (!results || !results[0] || !results[0].result) {
      console.error("No colors or gradients found.");
      return; // Exit if results are invalid
    }

    const { colors, gradients } = results[0].result;

    // Display colors
    colorGrid.innerHTML = ''; // Clear previous colors
    colors.forEach(color => {
      let hexColor;

      // Check if the color is already in hex format
      if (color.startsWith('#')) {
        hexColor = color; // Directly use the hex color
      } else {
        hexColor = rgbToHex(color); // Convert to hex if not
      }

      const div = document.createElement('div');
      div.className = 'color-item';
      div.innerHTML = `
        <div class="color-sample" style="background-color: ${hexColor}"></div>
        <span style="white-space: nowrap;">${hexColor}</span> <!-- Display hex color -->
      `;
      div.addEventListener('click', function() {
        copyToClipboard(hexColor);
      });
      colorGrid.appendChild(div); // Append to color grid
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
      gradientList.appendChild(li); // Append to gradient list
    });
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
      throw new Error('Invalid RGB or RGBA color format');
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