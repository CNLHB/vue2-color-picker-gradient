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
export function keepDecimal (numStr, num = 2) {
  const reg = new RegExp(`^\\d+(?:\\.\\d{0,${num}})?`, 'g')
  return !numStr.match(reg) ? '' : numStr.match(reg)
}