import { ReactNode } from 'react';
import { useSelectionContext } from './SelectionContext';

const NewCommentTrigger = ({ children }: { children: ReactNode }) => {
  const {
    positionedSelection,
    commentableSectionOffsetY,
    setShowNewCommentBox,
  } = useSelectionContext();

  const handleClick = () => {
    setShowNewCommentBox(true);
  };

  if (!positionedSelection) return null;

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

export default NewCommentTrigger;
