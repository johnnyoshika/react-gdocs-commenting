import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { useSelectionContext } from './SelectionContext';
import { findNodeAndOffsetFromTotalOffset } from './utils';
import { CommentPositions } from './types';
import CommentAddTrigger from './CommentAddTrigger';

import './styles.css';

const CommentableSection = ({
  children,
  addButton,
}: {
  children: ReactNode;
  addButton: ReactNode;
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { comments, setContentOffsetY, setPositions } =
    useSelectionContext();

  const setOffset = useCallback(() => {
    if (!sectionRef.current) return;

    const offset =
      sectionRef.current.getBoundingClientRect().top + window.scrollY;
    setContentOffsetY(offset);
  }, [setContentOffsetY]);

  const reposition = useCallback(() => {
    if (!sectionRef.current) return;

    setOffset();
    setPositions(
      comments.reduce((acc, comment) => {
        const startPosition = findNodeAndOffsetFromTotalOffset(
          sectionRef.current!,
          comment.selection.startOffset,
        );
        const endPosition = findNodeAndOffsetFromTotalOffset(
          sectionRef.current!,
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
    // Initial call to set correct positions
    reposition();

    const debouncedReposition = debounce(reposition, 250);
    window.addEventListener('resize', debouncedReposition);
    return () => {
      window.removeEventListener('resize', debouncedReposition);
      debouncedReposition.cancel(); // Cancel any pending debounced calls
    };
  }, [reposition]);

  return (
    <div ref={sectionRef} style={{ position: 'relative' }}>
      {children}
      <CommentAddTrigger>{addButton}</CommentAddTrigger>
    </div>
  );
};

export default CommentableSection;
