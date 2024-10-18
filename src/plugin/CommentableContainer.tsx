import { useEffect, useRef } from 'react';
import { useSelectionContext } from './SelectionContext';
import { getOffsetInTextContent } from './utils';
import { Comment } from './types';
import Highlight from './Highlight';

const CommentableContainer = ({
  containerId,
  markdown,
  comments,
}: {
  containerId: string;
  markdown: string;
  comments: Comment[];
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { setSelectedText, commentableContainers } =
    useSelectionContext();

  useEffect(() => {
    commentableContainers.current[containerId] = containerRef;
    return () => {
      delete commentableContainers.current[containerId];
    };
  }, []);

  const handleTextSelection = () => {
    if (!containerRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount == 0) {
      setSelectedText(undefined);
      return;
    }

    const range = selection.getRangeAt(0);

    // Check if the selection is collapsed (i.e., it's just a single click)
    if (range.collapsed) {
      setSelectedText(undefined);
      return;
    }

    // Check if both the start and end containers are within contentRef
    if (
      !containerRef.current.contains(range.startContainer) ||
      !containerRef.current.contains(range.endContainer)
    ) {
      setSelectedText(undefined);
      return;
    }

    const startOffset = getOffsetInTextContent(
      containerRef.current,
      range.startContainer,
      range.startOffset,
    );
    const endOffset = getOffsetInTextContent(
      containerRef.current,
      range.endContainer,
      range.endOffset,
    );

    const rect = range.getBoundingClientRect();
    const scrollTop = document.documentElement.scrollTop;
    const positionTop = rect.top + scrollTop;

    setSelectedText({
      startOffset,
      endOffset,
      containerId,
      positionTop,
    });
  };

  return (
    <div ref={containerRef} onMouseUp={handleTextSelection}>
      <Highlight comments={comments} markdown={markdown} />
    </div>
  );
};

export default CommentableContainer;
