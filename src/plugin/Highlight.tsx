import parse from 'html-react-parser';
import { marked } from 'marked';
import React, { useEffect, useState } from 'react';
import { useSelectionContext } from './SelectionContext';
import { Comment } from './types';

const Highlight = ({
  markdown,
  comments,
}: {
  markdown: string;
  comments: Comment[];
}) => {
  const [result, setResult] = useState<{ node: React.ReactNode }>({
    node: null,
  });

  const { activeCommentId } = useSelectionContext();

  useEffect(() => {
    const processMarkdown = async () => {
      const htmlContent = await marked(markdown);
      const reactElements = parse(htmlContent);
      const result = processChildren(
        reactElements,
        0,
        comments,
        activeCommentId,
      );
      setResult(result);
    };

    processMarkdown();
  }, [setResult, markdown, comments, activeCommentId]);

  return <>{result.node}</>;
};

export default Highlight;

function processNode(
  node: React.ReactNode,
  offset: number,
  comments: Comment[],
  activeCommentId: string | null,
): { node: React.ReactNode; offset: number } {
  if (typeof node === 'string') {
    return processTextNode(node, offset, comments, activeCommentId);
  } else if (React.isValidElement(node)) {
    return processElementNode(
      node,
      offset,
      comments,
      activeCommentId,
    );
  } else if (Array.isArray(node)) {
    return processArrayNode(node, offset, comments, activeCommentId);
  } else {
    return { node, offset };
  }
}

function processChildren(
  children: React.ReactNode,
  offset: number,
  comments: Comment[],
  activeCommentId: string | null,
): { node: React.ReactNode; offset: number } {
  if (Array.isArray(children)) {
    return processArrayNode(
      children,
      offset,
      comments,
      activeCommentId,
    );
  } else {
    return processNode(children, offset, comments, activeCommentId);
  }
}

function processTextNode(
  text: string,
  offset: number,
  comments: Comment[],
  activeCommentId: string | null,
): { node: React.ReactNode; offset: number } {
  const length = text.length;
  const end = offset + length;

  const ranges = getHighlightRangesForTextNode(offset, end, comments);

  if (ranges.length === 0) {
    return { node: text, offset: end };
  }

  const nodes: React.ReactNode[] = [];

  // Collect all unique positions
  const positions = new Set<number>();
  positions.add(offset);
  positions.add(end);

  ranges.forEach(range => {
    positions.add(range.start);
    positions.add(range.end);
  });

  const sortedPositions = Array.from(positions).sort((a, b) => a - b);

  for (let i = 0; i < sortedPositions.length - 1; i++) {
    const segmentStart = sortedPositions[i];
    const segmentEnd = sortedPositions[i + 1];

    const relativeStart = segmentStart - offset;
    const relativeEnd = segmentEnd - offset;

    const segmentText = text.slice(relativeStart, relativeEnd);

    // Find all comments covering this segment
    const coveringComments = ranges.filter(
      range => range.start <= segmentStart && range.end >= segmentEnd,
    );

    if (coveringComments.length === 0) {
      // No highlights, plain text
      nodes.push(segmentText);
    } else {
      // Determine if any covering comment matches activeCommentId
      const isActive = activeCommentId
        ? coveringComments.some(
            range => range.commentId === activeCommentId,
          )
        : false;

      const className = isActive ? 'highlight active' : 'highlight';

      nodes.push(
        <span
          data-comment-id={coveringComments[0].commentId}
          key={segmentStart}
          className={className}
        >
          {segmentText}
        </span>,
      );
    }
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
  activeCommentId: string | null,
): { node: React.ReactNode; offset: number } {
  const { children } = element.props;
  const { node: processedChildren, offset: newOffset } =
    processChildren(children, offset, comments, activeCommentId);

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
  activeCommentId: string | null,
): { node: React.ReactNode[]; offset: number } {
  const processedNodes: React.ReactNode[] = [];
  let currentOffset = offset;

  nodes.forEach(child => {
    const { node: processedNode, offset: newOffset } = processNode(
      child,
      currentOffset,
      comments,
      activeCommentId,
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
): { start: number; end: number; commentId: string }[] {
  const ranges: { start: number; end: number; commentId: string }[] =
    [];

  comments.forEach(comment => {
    const selStart = comment.selectionRange.startOffset;
    const selEnd = comment.selectionRange.endOffset;

    const overlapStart = Math.max(start, selStart);
    const overlapEnd = Math.min(end, selEnd);

    if (overlapStart < overlapEnd) {
      ranges.push({
        start: overlapStart,
        end: overlapEnd,
        commentId: comment.id,
      });
    }
  });

  return ranges;
}
