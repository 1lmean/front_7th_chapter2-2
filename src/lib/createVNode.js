function flatten(arr) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else if (item != null && item !== false && item !== true) {
      result.push(item);
    }
  }
  return result;
}

export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: flatten(children),
  };
}
