import { ReactNode } from 'react';
import { Comment } from './types';
import { useSelectionContext } from './SelectionContext';

const CommentPosition = ({
  children,
  comment,
}: {
  children: ReactNode;
  comment: Comment;
}) => {
  const { commentsSectionOffsetY, positions } = useSelectionContext();

  const position = positions[comment.id];
  if (!position) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: `${position.top - commentsSectionOffsetY}px`,
        left: 0,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};

export default CommentPosition;
