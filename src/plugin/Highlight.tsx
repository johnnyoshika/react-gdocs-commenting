import React from 'react';
import { Comment } from './types';

const Highlight = ({
  children,
  comments,
}: {
  children: React.ReactNode;
  comments: Comment[];
}) => {
  const result = processChildren(children, 0, comments);
  return <>{result.node}</>;
};

export default Highlight;

function processNode(
  node: React.ReactNode,
  offset: number,
  comments: Comment[],
): { node: React.ReactNode; offset: number } {
  if (typeof node === 'string') {
    return processTextNode(node, offset, comments);
  } else if (React.isValidElement(node)) {
    return processElementNode(node, offset, comments);
  } else if (Array.isArray(node)) {
    return processArrayNode(node, offset, comments);
  } else {
    // For other types like null, undefined, boolean, etc.
    return { node, offset };
  }
}

function processChildren(
  children: React.ReactNode,
  offset: number,
  comments: Comment[],
): { node: React.ReactNode; offset: number } {
  if (Array.isArray(children)) {
    return processArrayNode(children, offset, comments);
  } else {
    return processNode(children, offset, comments);
  }
}

function processTextNode(
  text: string,
  offset: number,
  comments: Comment[],
): { node: React.ReactNode; offset: number } {
  const length = text.length;
  const end = offset + length;

  const rangesToHighlight = getHighlightRangesForTextNode(
    offset,
    end,
    comments,
  );

  if (rangesToHighlight.length === 0) {
    return { node: text, offset: end };
  }

  const nodes: React.ReactNode[] = [];
  let currentIndex = 0;

  rangesToHighlight.forEach(([highlightStart, highlightEnd]) => {
    const relativeStart = highlightStart - offset;
    const relativeEnd = highlightEnd - offset;

    if (currentIndex < relativeStart) {
      nodes.push(text.slice(currentIndex, relativeStart));
    }

    nodes.push(
      <span key={offset + relativeStart} className="highlight">
        {text.slice(relativeStart, relativeEnd)}
      </span>,
    );

    currentIndex = relativeEnd;
  });

  if (currentIndex < length) {
    nodes.push(text.slice(currentIndex));
  }

  return {
    node: nodes.length === 1 ? nodes[0] : nodes,
    offset: end,
  };
}

function processElementNode(
  element: React.ReactElement,
  offset: number,
  comments: Comment[],
): { node: React.ReactNode; offset: number } {
  const { children } = element.props;
  const { node: processedChildren, offset: newOffset } =
    processChildren(children, offset, comments);

  return {
    node: React.cloneElement(element, {
      ...element.props,
      children: processedChildren,
    }),
    offset: newOffset,
  };
}

function processArrayNode(
  nodes: React.ReactNode[],
  offset: number,
  comments: Comment[],
): { node: React.ReactNode[]; offset: number } {
  const processedNodes: React.ReactNode[] = [];
  let currentOffset = offset;

  nodes.forEach(child => {
    const { node: processedNode, offset: newOffset } = processNode(
      child,
      currentOffset,
      comments,
    );
    processedNodes.push(processedNode);
    currentOffset = newOffset;
  });

  return { node: processedNodes, offset: currentOffset };
}

function getHighlightRangesForTextNode(
  start: number,
  end: number,
  comments: Comment[],
): [number, number][] {
  const ranges: [number, number][] = [];

  comments.forEach(comment => {
    const selStart = comment.selection.startOffset;
    const selEnd = comment.selection.endOffset;

    const overlapStart = Math.max(start, selStart);
    const overlapEnd = Math.min(end, selEnd);

    if (overlapStart < overlapEnd) {
      ranges.push([overlapStart, overlapEnd]);
    }
  });

  return mergeRanges(ranges);
}

function mergeRanges(ranges: [number, number][]): [number, number][] {
  if (ranges.length === 0) return [];

  ranges.sort((a, b) => a[0] - b[0]);

  const merged: [number, number][] = [ranges[0]];

  for (let i = 1; i < ranges.length; i++) {
    const lastRange = merged[merged.length - 1];
    const currentRange = ranges[i];

    if (currentRange[0] <= lastRange[1]) {
      lastRange[1] = Math.max(lastRange[1], currentRange[1]);
    } else {
      merged.push(currentRange);
    }
  }

  return merged;
}
