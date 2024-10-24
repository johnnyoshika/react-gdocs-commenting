import { ReactNode, useEffect } from 'react';
import { useSelectionContext } from './SelectionContext';
import { PositionedSelectionRange } from './types';

const NewCommentTriggerMount = ({
  positionedSelection,
  children,
}: {
  positionedSelection: PositionedSelectionRange;
  children: ReactNode;
}) => {
  const {
    commentableSectionOffsetY,
    setShowNewCommentBox,
    setNewCommentSelection,
    setPositionedSelection,
  } = useSelectionContext();

  // Reset showNewCommentBox state so new comment box doesn't show automatically on text select
  useEffect(() => setShowNewCommentBox(false), []);

  const handleClick = () => {
    setNewCommentSelection(positionedSelection);

    setShowNewCommentBox(true);
    setPositionedSelection(undefined);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'absolute',
        top: `${
          (positionedSelection.positionTop ?? 0) -
          commentableSectionOffsetY
        }px`,
        right: '-3rem',
      }}
    >
      {children}
    </button>
  );
};

const NewCommentTrigger = ({ children }: { children: ReactNode }) => {
  const { positionedSelection } = useSelectionContext();

  if (!positionedSelection) return null;

  return (
    <NewCommentTriggerMount positionedSelection={positionedSelection}>
      {children}
    </NewCommentTriggerMount>
  );
};

export default NewCommentTrigger;
