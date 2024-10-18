// CommentableSection.tsx
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { useSelectionContext } from './SelectionContext';
import { findNodeAndOffsetFromTotalOffset } from './utils';
import { CommentPositions } from './types';
import NewCommentTrigger from './NewCommentTrigger';

import './styles.css';

const CommentableSection = ({
  children,
  addButton,
}: {
  children: ReactNode;
  addButton: ReactNode;
}) => {
  const timerRef = useRef<number>();
  const sectionRef = useRef<HTMLDivElement>(null);

  const {
    commentableContainers,
    comments,
    setCommentableSectionOffsetY,
    setPositions,
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

    setPositions(
      comments.reduce((acc, comment) => {
        const containerRef =
          commentableContainers.current[
            comment.selection.containerId
          ];

        if (!containerRef?.current) return { ...acc };

        const startPosition = findNodeAndOffsetFromTotalOffset(
          containerRef.current,
          comment.selection.startOffset,
        );
        const endPosition = findNodeAndOffsetFromTotalOffset(
          containerRef.current,
          comment.selection.endOffset,
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
    );
  }, [comments, setPositions, setOffset]);

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
      <NewCommentTrigger>{addButton}</NewCommentTrigger>
    </div>
  );
};

export default CommentableSection;
