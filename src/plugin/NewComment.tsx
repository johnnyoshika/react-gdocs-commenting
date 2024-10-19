import { useEffect } from 'react';
import { TextSelection } from './types';
import CommentPosition from './CommentPosition';
import NewCommentForm from './NewCommentForm';
import { useCommentPositionContext } from './CommentPositionContext';
import { useSelectionContext } from './SelectionContext';

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
    <CommentPosition comment={{ id: 'new', selection: selectedText }}>
      <NewCommentForm
        selectedText={selectedText}
        handleAddComment={handleAddComment}
      />
    </CommentPosition>
  );
};

export default NewComment;
