// NewComment.tsx
import { ReactNode, useEffect } from 'react';
import CommentPosition from './CommentPosition';
import { NEW_COMMENT_ID } from './constants';
import { useSelectionContext } from './SelectionContext';
import { PositionedSelectionRange, SelectionRange } from './types';

const NewCommentPosition = ({
  positionedSelection,
  children,
}: {
  positionedSelection: PositionedSelectionRange;
  children: ({
    selectionRange,
    setShowNewCommentBox,
  }: {
    selectionRange: SelectionRange;
    setShowNewCommentBox: (show: boolean) => void;
  }) => ReactNode;
}) => {
  const { setShowNewCommentBox, setCommentPositionState } =
    useSelectionContext();

  useEffect(() => {
    setCommentPositionState(prev => {
      const positions = { ...prev.positions };
      positions[NEW_COMMENT_ID] = {
        top: positionedSelection.positionTop,
      };
      return {
        positions,
        activeCommentId: NEW_COMMENT_ID,
      };
    });

    return () => {
      setCommentPositionState(prev => {
        const positions = { ...prev.positions };
        delete positions[NEW_COMMENT_ID];
        return {
          positions,
          activeCommentId:
            prev.activeCommentId === NEW_COMMENT_ID
              ? null
              : prev.activeCommentId,
        };
      });
    };
  }, []);

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
  const { positionedSelection, showNewCommentBox } =
    useSelectionContext();

  if (!positionedSelection || !showNewCommentBox) return null;

  return (
    <NewCommentPosition positionedSelection={positionedSelection}>
      {children}
    </NewCommentPosition>
  );
};

export default NewComment;
