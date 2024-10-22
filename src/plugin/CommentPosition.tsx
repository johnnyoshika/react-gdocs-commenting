// CommentPosition.tsx
import { debounce } from 'lodash';
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { useCommentPositionContext } from './CommentPositionContext';
import { useSelectionContext } from './SelectionContext';
import { Comment } from './types';

const CommentPosition = ({
  children,
  comment,
  transition = true,
}: {
  children: ReactNode;
  comment: Comment;
  transition?: boolean;
}) => {
  const {
    commentsSectionOffsetY,
    activeCommentId,
    setActiveCommentId,
  } = useSelectionContext();
  const {
    registerComment,
    unregisterComment,
    getAdjustedTop,
    updateCommentSize,
  } = useCommentPositionContext();
  const commentRef = useRef<HTMLDivElement>(null);

  const debouncedUpdateSize = useCallback(
    debounce((id: string, height: number) => {
      updateCommentSize(id, { height });
    }, 50),
    [updateCommentSize],
  );

  useEffect(() => {
    registerComment(comment.id);
    return () => {
      unregisterComment(comment.id);
      debouncedUpdateSize.cancel();
    };
  }, [
    comment.id,
    registerComment,
    unregisterComment,
    debouncedUpdateSize,
  ]);

  useEffect(() => {
    if (!commentRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        debouncedUpdateSize(comment.id, entry.contentRect.height);
      }
    });

    resizeObserver.observe(commentRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [comment.id, debouncedUpdateSize]);

  useEffect(() => {
    if (!commentRef.current) return;

    const element = commentRef.current;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Don't focus the parent container if user clicked on:
      // - Buttons: Have their own focus and click behavior
      // - Links: Need to handle navigation
      // - Inputs/Textareas: Need to handle text entry
      // - Custom buttons: Elements with role="button" (like div styled as button)
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        // closest() checks if the clicked element or any of its parents have role="button"
        // This catches custom button implementations that don't use <button> tags
        target.closest('[role="button"]')
      )
        return;

      element.focus();
    };

    element.addEventListener('click', handleClick);

    return () => {
      element.removeEventListener('click', handleClick);
    };
  }, []);

  const onFocus = () => {
    setActiveCommentId(comment.id);
  };

  const adjustedTop = getAdjustedTop(comment.id);

  return (
    <div
      ref={commentRef}
      tabIndex={0} // Make the div focusable
      style={{
        position: 'absolute',
        top: `${adjustedTop - commentsSectionOffsetY}px`,
        transition: transition ? 'top 0.3s ease-out' : 'none',
        left: 0,
        width: '100%',
      }}
      onFocus={onFocus}
    >
      {children}
    </div>
  );
};

export default CommentPosition;
