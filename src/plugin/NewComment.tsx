// NewComment.tsx
import { ReactNode, useEffect } from 'react';
import CommentPosition from './CommentPosition';
import { useCommentPositionContext } from './CommentPositionContext';
import { NEW_COMMENT_ID } from './constants';
import { useSelectionContext } from './SelectionContext';
import { SelectionRange } from './types';

const NewComment = ({
  children,
}: {
  children: ({
    selectionRange,
    setShowNewCommentBox,
  }: {
    selectionRange: SelectionRange;
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

  // Even though we have PositionedSelectionRange here, we don't want to leak positionTop outside of this plugin
  const selectionRange = {
    containerId: positionedSelection.containerId,
    startOffset: positionedSelection.startOffset,
    endOffset: positionedSelection.endOffset,
  };

  return (
    <CommentPosition
      comment={{
        id: NEW_COMMENT_ID,
        selectionRange,
      }}
      transition={false}
    >
      {children({
        selectionRange,
        setShowNewCommentBox,
      })}
    </CommentPosition>
  );
};

export default NewComment;
