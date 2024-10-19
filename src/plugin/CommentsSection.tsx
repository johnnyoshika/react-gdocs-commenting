import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { useSelectionContext } from './SelectionContext';
import { TextSelection } from './types';
import NewComment from './NewComment';
import { CommentPositionProvider } from './CommentPositionContext';

const CommentsSection = ({
  children,
  handleAddComment,
}: {
  children: ReactNode;
  handleAddComment: (text: string, selection: TextSelection) => void;
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const {
    showNewCommentBox,
    selectedText,
    setCommentsSectionOffsetY: setCommentsOffsetY,
  } = useSelectionContext();

  const setOffset = useCallback(() => {
    if (!sectionRef.current) return;

    const offset =
      sectionRef.current.getBoundingClientRect().top + window.scrollY;
    setCommentsOffsetY(offset);
  }, [setCommentsOffsetY]);

  useEffect(() => {
    // Initial call to set offset
    setOffset();

    const debouncedHandleResize = debounce(setOffset, 250);
    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      debouncedHandleResize.cancel(); // Cancel any pending debounced calls
    };
  }, [setOffset]);

  return (
    <CommentPositionProvider>
      <div ref={sectionRef} style={{ position: 'relative' }}>
        <NewComment handleAddComment={handleAddComment} />
        {children}
      </div>
    </CommentPositionProvider>
  );
};

export default CommentsSection;
