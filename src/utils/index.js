export function cloneDeep(target) {
  let result;
  if (Array.isArray(target)) {
    result = [];
    target.forEach((item) => {
      result.push(cloneDeep(item));
    });
  } else if (typeof target === 'object' && target !== null) {
    result = {};
    for (const key in target) {
      if (Object.hasOwnProperty.call(target, key)) {
        result[key] = cloneDeep(target[key]);
      }
    }
  } else {
    result = target;
  }
  return result;
}

/**
 * 解析渐变色字符串
 * @param {string} gradient - CSS gradient 字符串，如 'linear-gradient(90deg, #fff 0%, #000 100%)'
 * @returns {Object} - { deg, colors }
 */
export function parseGradient(gradient) {
  if (!gradient || typeof gradient !== 'string') {
    return {
      deg: 90,
      colors: [
        {
          color: 'rgba(255, 255, 255, 1)',
          hex: '#ffffff',
          rgba: { r: 255, g: 255, b: 255, a: 1 },
          pst: 0
        },
        { color: 'rgba(0, 0, 0, 1)', hex: '#000000', rgba: { r: 0, g: 0, b: 0, a: 1 }, pst: 100 }
      ]
    };
  }

  const degMatch = gradient.match(/(\d+)deg/);
  const deg = degMatch ? parseInt(degMatch[1]) : 90;

  const colorStopsRegex = /(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8})\s+(\d+(?:\.\d+)?)%/g;
  const colors = [];
  let match;

  while ((match = colorStopsRegex.exec(gradient)) !== null) {
    const colorStr = match[1];
    const position = parseFloat(match[2]);
    const colorObj = parseColor(colorStr);
    colors.push({
      ...colorObj,
      pst: position
    });
  }

  if (colors.length < 2) {
    colors.push(
      {
        color: 'rgba(255, 255, 255, 1)',
        hex: '#ffffff',
        rgba: { r: 255, g: 255, b: 255, a: 1 },
        pst: 0
      },
      { color: 'rgba(0, 0, 0, 1)', hex: '#000000', rgba: { r: 0, g: 0, b: 0, a: 1 }, pst: 100 }
    );
  }

  return { deg, colors };
}

/**
 * 解析颜色字符串为标准对象
 * @param {string} colorStr - 颜色字符串 '#409EFF' 或 'rgba(64, 158, 255, 1)'
 * @returns {Object} - { color, hex, rgba }
 */
export function parseColor(colorStr) {
  if (!colorStr) {
    return {
      color: 'rgba(64, 158, 255, 1)',
      hex: '#409EFF',
      rgba: { r: 64, g: 158, b: 255, a: 1 }
    };
  }

  let r,
    g,
    b,
    a = 1;

  if (colorStr.startsWith('#')) {
    const hex = colorStr.replace('#', '');
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      a = parseInt(hex.substring(6, 8), 16) / 255;
    }
  } else if (colorStr.startsWith('rgb')) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
      a = match[4] ? parseFloat(match[4]) : 1;
    }
  }

  const hexValue = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  return {
    color: `rgba(${r}, ${g}, ${b}, ${a})`,
    hex: hexValue,
    rgba: { r, g, b, a }
  };
}

/**
 * 根据 colorFormat 格式化颜色值
 * @param {Object} rgba - { r, g, b, a }
 * @param {string} format - 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla'
 * @returns {string} - 格式化后的颜色字符串
 */
export function formatColor(rgba, format = 'hex') {
  const { r, g, b, a } = rgba;

  if (format === 'hex') {
    if (a < 1) {
      const alpha = Math.round(a * 255)
        .toString(16)
        .padStart(2, '0');
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}${alpha}`;
    }
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  if (format === 'rgb') {
    return `rgb(${r}, ${g}, ${b})`;
  }

  if (format === 'rgba') {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  if (format === 'hsl' || format === 'hsla') {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm:
          h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
          break;
        case gNorm:
          h = ((bNorm - rNorm) / d + 2) / 6;
          break;
        case bNorm:
          h = ((rNorm - gNorm) / d + 4) / 6;
          break;
      }
    }

    const hDeg = Math.round(h * 360);
    const sPercent = Math.round(s * 100);
    const lPercent = Math.round(l * 100);

    if (format === 'hsla') {
      return `hsla(${hDeg}, ${sPercent}%, ${lPercent}%, ${a})`;
    }
    return `hsl(${hDeg}, ${sPercent}%, ${lPercent}%)`;
  }

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
export function keepDecimal(numStr, num = 2) {
  const reg = new RegExp(`^\\d+(?:\\.\\d{0,${num}})?`, 'g');
  return !numStr.match(reg) ? '' : numStr.match(reg);
}
// 定义一个函数来向上遍历父元素并判断
export function findParentElement(element, selector) {
  // 循环向上遍历父元素
  while (element) {
    // 使用 matches 方法判断当前元素是否符合选择器
    if (element.matches(selector)) {
      return element;
    }
    // 继续向上遍历父元素
    element = element.parentElement;
  }
  // 如果没有找到符合条件的元素，返回 null
  return null;
}
