// NewComment.tsx
import { useEffect } from 'react';
import CommentPosition from './CommentPosition';
import { useCommentPositionContext } from './CommentPositionContext';
import { NEW_COMMENT_ID } from './constants';
import NewCommentForm from './NewCommentForm';
import { useSelectionContext } from './SelectionContext';
import { TextSelection } from './types';

const NewComment = ({
  handleAddComment,
}: {
  handleAddComment: (text: string, selection: TextSelection) => void;
}) => {
  const { selectedText, showNewCommentBox } = useSelectionContext();
  const { setNewCommentPosition } = useCommentPositionContext();

  useEffect(() => {
    if (selectedText && showNewCommentBox) {
      setNewCommentPosition(selectedText.positionTop);
    } else {
      setNewCommentPosition(null);
    }
  }, [selectedText, showNewCommentBox, setNewCommentPosition]);

  if (!selectedText || !showNewCommentBox) return null;

  return (
    <CommentPosition
      comment={{ id: NEW_COMMENT_ID, selection: selectedText }}
      transition={false}
    >
      <NewCommentForm
        selectedText={selectedText}
        handleAddComment={handleAddComment}
      />
    </CommentPosition>
  );
};

export default NewComment;
