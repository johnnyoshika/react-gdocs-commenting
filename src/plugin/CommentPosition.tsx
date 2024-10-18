import { ReactNode, useEffect } from 'react';
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
  const { registerComment, unregisterComment, getAdjustedTop } =
    useCommentPosition();

  useEffect(() => {
    registerComment(comment.id);
    return () => unregisterComment(comment.id);
  }, [comment.id, registerComment, unregisterComment]);

  const adjustedTop = getAdjustedTop(comment.id);

  return (
    <div
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
