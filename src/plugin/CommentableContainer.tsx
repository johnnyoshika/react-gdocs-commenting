// CommentableContainer.tsx
import { ReactNode, useEffect, useRef } from 'react';
import { useSelectionContext } from './SelectionContext';
import { getOffsetInTextContent } from './utils';

const CommentableContainer = ({
  containerId,
  children,
}: {
  containerId: string;
  children: ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { setPositionedSelection, commentableContainers } =
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
      setPositionedSelection(undefined);
      return;
    }

    const range = selection.getRangeAt(0);

    // Check if the selection is collapsed (i.e., it's just a single click)
    if (range.collapsed) {
      setPositionedSelection(undefined);
      return;
    }

    // Check if both the start and end containers are within contentRef
    if (
      !containerRef.current.contains(range.startContainer) ||
      !containerRef.current.contains(range.endContainer)
    ) {
      setPositionedSelection(undefined);
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

    setPositionedSelection({
      startOffset,
      endOffset,
      containerId,
      positionTop,
    });
  };

  return (
    <div ref={containerRef} onMouseUp={handleTextSelection}>
      {children}
    </div>
  );
};

export default CommentableContainer;
