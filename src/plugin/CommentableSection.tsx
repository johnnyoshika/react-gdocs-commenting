// CommentableSection.tsx
import { debounce } from 'lodash';
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import NewCommentTrigger from './NewCommentTrigger';
import { useSelectionContext } from './SelectionContext';
import { CommentPositions } from './types';
import { findNodeAndOffsetFromTotalOffset } from './utils';

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

  return (
    <div ref={sectionRef} style={{ position: 'relative' }}>
      {children}
      <NewCommentTrigger>{addIcon}</NewCommentTrigger>
    </div>
  );
};

export default CommentableSection;
