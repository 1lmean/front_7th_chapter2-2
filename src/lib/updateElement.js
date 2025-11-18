import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(target, newProps, oldProps) {
  const allKeys = new Set([
    ...Object.keys(newProps || {}),
    ...Object.keys(oldProps || {}),
  ]);

  allKeys.forEach((key) => {
    if (key === "children") return; // children는 별도 처리

    const newValue = newProps?.[key];
    const oldValue = oldProps?.[key];

    // 이벤트 핸들러 처리
    if (key.startsWith("on") && typeof newValue === "function") {
      const eventType = key.slice(2).toLowerCase(); // onClick -> click
      // 기존 핸들러 제거
      if (oldValue && typeof oldValue === "function") {
        removeEvent(target, eventType, oldValue);
      }
      // 새 핸들러 추가
      addEvent(target, eventType, newValue);
      return;
    }

    // 이벤트 핸들러 제거 (새 props에 없을 경우)
    if (key.startsWith("on") && oldValue && !newValue) {
      const eventType = key.slice(2).toLowerCase();
      if (typeof oldValue === "function") {
        removeEvent(target, eventType, oldValue);
      }
      return;
    }

    // className 처리
    if (key === "className") {
      if (newValue !== oldValue) {
        if (newValue) {
          target.setAttribute("class", newValue);
        } else {
          target.removeAttribute("class");
        }
      }
      return;
    }

    // 일반 속성 처리
    if (newValue !== oldValue) {
      if (newValue === undefined || newValue === null) {
        target.removeAttribute(key);
      } else if (typeof newValue === "boolean") {
        if (newValue) {
          target.setAttribute(key, "");
        } else {
          target.removeAttribute(key);
        }
      } else {
        target.setAttribute(key, newValue);
      }
    }
  });
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  // 둘 다 null/undefined인 경우
  if (!newNode && !oldNode) {
    return;
  }

  // 새 노드만 있는 경우: 추가
  if (newNode && !oldNode) {
    const newElement = createElement(newNode);
    if (newElement) {
      if (newElement.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        while (newElement.firstChild) {
          parentElement.appendChild(newElement.firstChild);
        }
      } else {
        const child = parentElement.childNodes[index];
        if (child) {
          parentElement.insertBefore(newElement, child);
        } else {
          parentElement.appendChild(newElement);
        }
      }
    }
    return;
  }

  // 기존 노드만 있는 경우: 제거
  if (!newNode && oldNode) {
    const oldElement = parentElement.childNodes[index];
    if (oldElement) {
      parentElement.removeChild(oldElement);
    }
    return;
  }

  // 둘 다 있는 경우: 업데이트 또는 교체
  const oldElement = parentElement.childNodes[index];

  // 타입이 다른 경우: 교체
  if (
    (typeof newNode === "string" || typeof newNode === "number") &&
    (typeof oldNode === "string" || typeof oldNode === "number")
  ) {
    if (String(newNode) !== String(oldNode)) {
      const newTextNode = document.createTextNode(String(newNode));
      parentElement.replaceChild(newTextNode, oldElement);
    }
    return;
  }

  if (
    typeof newNode === "object" &&
    typeof oldNode === "object" &&
    newNode !== null &&
    oldNode !== null
  ) {
    // 타입이 다른 경우: 교체
    if (newNode.type !== oldNode.type) {
      const newElement = createElement(newNode);
      if (newElement) {
        if (newElement.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          parentElement.replaceChild(newElement, oldElement);
          while (newElement.firstChild) {
            parentElement.insertBefore(newElement.firstChild, oldElement);
          }
          parentElement.removeChild(oldElement);
        } else {
          parentElement.replaceChild(newElement, oldElement);
        }
      }
      return;
    }

    // 같은 타입: 속성 및 children 업데이트
    updateAttributes(oldElement, newNode.props, oldNode.props);

    // children 업데이트
    const newChildren = newNode.children || [];
    const oldChildren = oldNode.children || [];
    const maxLength = Math.max(newChildren.length, oldChildren.length);

    for (let i = 0; i < maxLength; i++) {
      updateElement(oldElement, newChildren[i], oldChildren[i], i);
    }
  }
}
