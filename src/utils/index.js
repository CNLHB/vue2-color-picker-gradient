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
