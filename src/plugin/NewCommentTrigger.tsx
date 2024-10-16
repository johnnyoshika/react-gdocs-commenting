import { ReactNode } from 'react';
import { useSelectionContext } from './SelectionContext';

const NewCommentTrigger = ({ children }: { children: ReactNode }) => {
  const {
    selectedText,
    commentableSectionOffsetY,
    setShowNewCommentBox,
  } = useSelectionContext();

  const handleClick = () => {
    setShowNewCommentBox(true);
  };

  if (!selectedText) return null;

  return (
    <button
      onClick={handleClick}
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

export default NewCommentTrigger;
