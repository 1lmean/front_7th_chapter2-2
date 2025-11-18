export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }
  if (Array.isArray(vNode)) {
    return vNode.map(normalizeVNode).join("");
  }
  if (typeof vNode === "object" && vNode !== null) {
    // 함수 컴포넌트인 경우 실행
    if (typeof vNode.type === "function") {
      // 함수 컴포넌트 실행 (props에 children 포함하여 전달)
      const props = { ...(vNode.props || {}), children: vNode.children || [] };
      const componentResult = vNode.type(props);

      // 실행 결과를 재귀적으로 정규화
      const normalized = normalizeVNode(componentResult);

      // 정규화된 결과가 객체이고 children 배열이 있다면, children의 각 요소도 재귀적으로 정규화
      if (
        normalized &&
        typeof normalized === "object" &&
        Array.isArray(normalized.children)
      ) {
        normalized.children = normalized.children.map(normalizeVNode);
      }

      return normalized;
    }

    // 일반 엘리먼트인 경우 children 정규화
    if (vNode.children) {
      const normalizedChildren = vNode.children.map(normalizeVNode);
      return {
        ...vNode,
        children: normalizedChildren,
      };
    }

    return vNode;
  }
  return vNode;
}
