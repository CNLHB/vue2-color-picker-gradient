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
      colors: []
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

  return { deg, colors };
}

/**
 * 解析颜色字符串为标准对象
 * @param {string} colorStr - 颜色字符串 '#409EFF' 或 'rgba(64, 158, 255, 1)' 或 'hsl(210, 100%, 62%)'
 * @returns {Object} - { color, hex, rgba }
 */
export function parseColor(colorStr) {
  if (!colorStr) {
    return {
      color: '',
      hex: '',
      rgba: { r: 0, g: 0, b: 0, a: 0 }
    };
  }

  let r = 0;
  let g = 0;
  let b = 0;
  let a = 1;

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
  } else if (colorStr.startsWith('hsl')) {
    // 解析 HSL/HSLA 格式
    const match = colorStr.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/);
    if (match) {
      const h = parseInt(match[1]) / 360;
      const s = parseInt(match[2]) / 100;
      const l = parseInt(match[3]) / 100;
      a = match[4] ? parseFloat(match[4]) : 1;

      // HSL 转 RGB
      let rNorm, gNorm, bNorm;
      if (s === 0) {
        rNorm = gNorm = bNorm = l;
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        rNorm = hue2rgb(p, q, h + 1 / 3);
        gNorm = hue2rgb(p, q, h);
        bNorm = hue2rgb(p, q, h - 1 / 3);
      }

      r = Math.round(rNorm * 255);
      g = Math.round(gNorm * 255);
      b = Math.round(bNorm * 255);
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

  // 处理无效值，确保 r, g, b 都是有效数字
  const validR = isNaN(r) ? 0 : r;
  const validG = isNaN(g) ? 0 : g;
  const validB = isNaN(b) ? 0 : b;
  const validA = isNaN(a) ? 1 : a;

  if (format === 'hex') {
    if (validA < 1) {
      const alpha = Math.round(validA * 255)
        .toString(16)
        .padStart(2, '0');
      return `#${((1 << 24) + (validR << 16) + (validG << 8) + validB).toString(16).slice(1)}${alpha}`;
    }
    return `#${((1 << 24) + (validR << 16) + (validG << 8) + validB).toString(16).slice(1)}`;
  }

  if (format === 'rgb') {
    return `rgb(${validR}, ${validG}, ${validB})`;
  }

  if (format === 'rgba') {
    return `rgba(${validR}, ${validG}, ${validB}, ${validA})`;
  }

  if (format === 'hsl' || format === 'hsla') {
    const rNorm = validR / 255;
    const gNorm = validG / 255;
    const bNorm = validB / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
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
      return `hsla(${hDeg}, ${sPercent}%, ${lPercent}%, ${validA})`;
    }
    return `hsl(${hDeg}, ${sPercent}%, ${lPercent}%)`;
  }

  return `rgba(${validR}, ${validG}, ${validB}, ${validA})`;
}
export function keepDecimal(numStr, num = 2) {
  const reg = new RegExp(`^\\d+(?:\\.\\d{0,${num}})?`, 'g');
  return !numStr.match(reg) ? '' : numStr.match(reg);
}

/**
 * 检测颜色值类型
 * @param {string} value - 颜色值
 * @returns {string} - 'gradient' | 'linear' | 'empty'
 */
export function detectColorType(value) {
  if (!value || typeof value !== 'string') {
    return 'empty';
  }
  // 检测是否为渐变色
  if (value.includes('linear-gradient') || value.includes('radial-gradient')) {
    return 'gradient';
  }
  return 'linear';
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
