// NewComment.tsx
import { ReactNode, useEffect } from 'react';
import CommentPosition from './CommentPosition';
import { useCommentPositionContext } from './CommentPositionContext';
import { NEW_COMMENT_ID } from './constants';
import { useSelectionContext } from './SelectionContext';
import { PositionedSelectionRange } from './types';

const NewComment = ({
  children,
}: {
  children: ({
    positionedSelection,
    setShowNewCommentBox,
  }: {
    positionedSelection: PositionedSelectionRange;
    setShowNewCommentBox: (show: boolean) => void;
  }) => ReactNode;
}) => {
  const {
    positionedSelection,
    showNewCommentBox,
    setShowNewCommentBox,
  } = useSelectionContext();
  const { setNewCommentPosition } = useCommentPositionContext();

  useEffect(() => {
    if (positionedSelection && showNewCommentBox) {
      setNewCommentPosition(positionedSelection.positionTop);
    } else {
      setNewCommentPosition(null);
    }
  }, [positionedSelection, showNewCommentBox, setNewCommentPosition]);

  if (!positionedSelection || !showNewCommentBox) return null;

  return (
    <CommentPosition
      comment={{
        id: NEW_COMMENT_ID,
        selectionRange: positionedSelection,
      }}
      transition={false}
    >
      {children({
        positionedSelection,
        setShowNewCommentBox,
      })}
    </CommentPosition>
  );
};

export default NewComment;
