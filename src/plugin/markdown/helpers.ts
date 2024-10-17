// helpers.ts
export function getSourceOffset(
  node: Node,
  offsetInNode: number,
): number | null {
  // Traverse up to find the element with data-position-start
  let currentNode = node as HTMLElement | null;
  while (currentNode && currentNode !== document.body) {
    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const element = currentNode as HTMLElement;
      const startOffsetAttr = element.getAttribute(
        'data-position-start',
      );
      if (startOffsetAttr) {
        const elementStartOffset = parseInt(startOffsetAttr, 10);
        // Calculate the source offset
        return (
          elementStartOffset +
          getTextOffsetInNode(currentNode, node, offsetInNode)
        );
      }
    }
    currentNode = currentNode.parentNode as HTMLElement | null;
  }
  return null;
}

export function getTextOffsetInNode(
  ancestorNode: Node,
  targetNode: Node,
  offsetInTargetNode: number,
): number {
  let offset = 0;
  const walker = document.createTreeWalker(
    ancestorNode,
    NodeFilter.SHOW_TEXT,
    null,
  );

  let currentNode: Node | null;
  while ((currentNode = walker.nextNode())) {
    if (currentNode === targetNode) {
      offset += offsetInTargetNode;
      break;
    } else {
      offset += currentNode.textContent?.length || 0;
    }
  }
  return offset;
}
