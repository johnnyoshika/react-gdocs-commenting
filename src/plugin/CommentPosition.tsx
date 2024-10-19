// CommentPosition.tsx
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { Comment } from './types';
import { useSelectionContext } from './SelectionContext';
import { useCommentPositionContext } from './CommentPositionContext';
import { debounce } from 'lodash';

const CommentPosition = ({
  children,
  comment,
}: {
  children: ReactNode;
  comment: Comment;
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
        transition: 'top 0.3s ease-out',
        left: 0,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};

export default CommentPosition;
