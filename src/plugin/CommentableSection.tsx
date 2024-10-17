import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { useSelectionContext } from './SelectionContext';
import {
  getOffsetInTextContent,
  findNodeAndOffsetFromTotalOffset,
} from './utils';
import { CommentPositions } from './types';
import CommentAddTrigger from './CommentAddTrigger';
import Highlight from './Highlight';

import './styles.css';

const CommentableSection = ({
  children,
  addButton,
}: {
  children: ReactNode;
  addButton: ReactNode;
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const {
    comments,
    setContentOffsetY,
    setPositions,
    setSelectedText,
  } = useSelectionContext();

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

  const handleTextSelection = () => {
    if (!sectionRef.current) return;

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

    const startOffset = getOffsetInTextContent(
      sectionRef.current,
      range.startContainer,
      range.startOffset,
    );
    const endOffset = getOffsetInTextContent(
      sectionRef.current,
      range.endContainer,
      range.endOffset,
    );

    const rect = range.getBoundingClientRect();
    const scrollTop = document.documentElement.scrollTop;
    const positionTop = rect.top + scrollTop;

    setSelectedText({
      startOffset,
      endOffset,
      positionTop,
    });
  };

  return (
    <div
      ref={sectionRef}
      onMouseUp={handleTextSelection}
      style={{ position: 'relative' }}
    >
      <Highlight comments={comments}>{children}</Highlight>
      <CommentAddTrigger>{addButton}</CommentAddTrigger>
    </div>
  );
};

export default CommentableSection;
