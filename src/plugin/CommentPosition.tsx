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
  const { commentsSectionOffsetY } = useSelectionContext();
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

  const adjustedTop = getAdjustedTop(comment.id);

  return (
    <div
      ref={commentRef}
      style={{
        position: 'absolute',
        top: `${adjustedTop - commentsSectionOffsetY}px`,
        transition: transition ? 'top 0.3s ease-out' : 'none',
        left: 0,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};

export default CommentPosition;
