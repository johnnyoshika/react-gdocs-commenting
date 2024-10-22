// CommentableSection.tsx
import { debounce } from 'lodash';
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import NewCommentTrigger from './NewCommentTrigger';
import { useSelectionContext } from './SelectionContext';
import { CommentPositions } from './types';
import {
  findNodeAndOffsetFromTotalOffset,
  getOffsetInTextContent,
} from './utils';

import './styles.css';

const CommentableSection = ({
  children,
  addIcon,
}: {
  children: ReactNode;
  addIcon: ReactNode;
}) => {
  const timerRef = useRef<number>();
  const sectionRef = useRef<HTMLDivElement>(null);

  const {
    commentableContainers,
    comments,
    setCommentableSectionOffsetY,
    setCommentPositionState,
    setActiveCommentId,
    setPositionedSelection,
  } = useSelectionContext();

  const setOffset = useCallback(() => {
    if (!sectionRef.current) return;

    const offset =
      sectionRef.current.getBoundingClientRect().top + window.scrollY;
    setCommentableSectionOffsetY(offset);
  }, [setCommentableSectionOffsetY]);

  const reposition = useCallback(() => {
    setOffset();

    if (!commentableContainers.current) return;

    setCommentPositionState(prev => ({
      ...prev,
      positions: comments.reduce((acc, comment) => {
        const containerRef =
          commentableContainers.current[
            comment.selectionRange.containerId
          ];

        if (!containerRef?.current) return { ...acc };

        const startPosition = findNodeAndOffsetFromTotalOffset(
          containerRef.current,
          comment.selectionRange.startOffset,
        );
        const endPosition = findNodeAndOffsetFromTotalOffset(
          containerRef.current,
          comment.selectionRange.endOffset,
        );

        if (!startPosition || !endPosition) return { ...acc };

        const range = document.createRange();
        range.setStart(startPosition.node, startPosition.offset);
        range.setEnd(endPosition.node, endPosition.offset);

        // Calculate the updated position
        const rect = range.getBoundingClientRect();
        const scrollTop = document.documentElement.scrollTop;
        const positionTop = rect.top + scrollTop;

        return {
          ...acc,
          [comment.id]: {
            top: positionTop,
          },
        };
      }, {} as CommentPositions),
    }));
  }, [comments, setCommentPositionState, setOffset]);

  useEffect(() => {
    // Initial call to set correct positions.
    // Hack: markdown gets render asynchronously, so we need to wait 1 second.
    timerRef.current = window.setTimeout(() => {
      reposition();
    }, 100);

    const debouncedReposition = debounce(reposition, 250);
    window.addEventListener('resize', debouncedReposition);
    return () => {
      window.clearTimeout(timerRef.current);
      window.removeEventListener('resize', debouncedReposition);
      debouncedReposition.cancel(); // Cancel any pending debounced calls
    };
  }, [reposition]);

  const handleTextSelection = () => {
    if (!sectionRef.current) return;

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

    const container =
      range.commonAncestorContainer.parentElement?.closest(
        '[data-container-id]',
      );

    const containerId = container?.getAttribute('data-container-id');

    const isWithinCommentable =
      container && sectionRef.current.contains(container);

    // Check if both the start and end containers are within contentRef
    if (!containerId || !isWithinCommentable) {
      setPositionedSelection(undefined);
      return;
    }

    const startOffset = getOffsetInTextContent(
      container,
      range.startContainer,
      range.startOffset,
    );
    const endOffset = getOffsetInTextContent(
      container,
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

  const handleCommentSelection = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (!(e.target instanceof HTMLElement)) return;

    if (!e.target.hasAttribute('data-comment-id')) return;

    const commentId = e.target.getAttribute('data-comment-id');
    setActiveCommentId(commentId);
  };

  return (
    <div
      ref={sectionRef}
      style={{ position: 'relative' }}
      onMouseUp={handleTextSelection}
      onClick={handleCommentSelection}
    >
      {children}
      <NewCommentTrigger>{addIcon}</NewCommentTrigger>
    </div>
  );
};

export default CommentableSection;
