// NewComment.tsx
import { ReactNode, useEffect } from 'react';
import CommentPosition from './CommentPosition';
import { useCommentPositionContext } from './CommentPositionContext';
import { NEW_COMMENT_ID } from './constants';
import { useSelectionContext } from './SelectionContext';
import { TextSelection } from './types';

const NewComment = ({
  children,
}: {
  children: ({
    selectedText,
    setShowNewCommentBox,
  }: {
    selectedText: TextSelection;
    setShowNewCommentBox: (show: boolean) => void;
  }) => ReactNode;
}) => {
  const { selectedText, showNewCommentBox, setShowNewCommentBox } =
    useSelectionContext();
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
      {children({ selectedText, setShowNewCommentBox })}
    </CommentPosition>
  );
};

export default NewComment;
