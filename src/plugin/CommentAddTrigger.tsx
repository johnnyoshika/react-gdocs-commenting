import { ReactNode } from 'react';
import { useSelectionContext } from './SelectionContext';

const CommentAddTrigger = ({ children }: { children: ReactNode }) => {
  const {
    selectedText,
    commentableSectionOffsetY,
    setShowNewCommentBox,
  } = useSelectionContext();

  const handleAddComment = () => {
    setShowNewCommentBox(true);
  };

  if (!selectedText) return null;

  return (
    <button
      onClick={handleAddComment}
      style={{
        position: 'absolute',
        top: `${
          (selectedText.positionTop ?? 0) - commentableSectionOffsetY
        }px`,
        right: '-3rem',
      }}
    >
      {children}
    </button>
  );
};

export default CommentAddTrigger;
