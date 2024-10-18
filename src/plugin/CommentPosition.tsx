// CommentPosition.tsx
import { ReactNode, useEffect, useRef } from 'react';
import { Comment } from './types';
import { useSelectionContext } from './SelectionContext';
import { useCommentPosition } from './CommentPositionContext';

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
  } = useCommentPosition();
  const commentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerComment(comment.id);
    return () => unregisterComment(comment.id);
  }, [comment.id, registerComment, unregisterComment]);

  useEffect(() => {
    if (!commentRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        updateCommentSize(comment.id, {
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(commentRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [comment.id, updateCommentSize]);

  const adjustedTop = getAdjustedTop(comment.id);

  return (
    <div
      ref={commentRef}
      style={{
        position: 'absolute',
        top: `${adjustedTop - commentsSectionOffsetY}px`,
        left: 0,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};

export default CommentPosition;
