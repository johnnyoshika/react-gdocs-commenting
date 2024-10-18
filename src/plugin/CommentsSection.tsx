import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { useSelectionContext } from './SelectionContext';
import { TextSelection } from './types';
import NewCommentForm from './NewCommentForm';

const CommentsSection = ({
  children,
  handleAddComment,
}: {
  children: ReactNode;
  handleAddComment: (text: string, selection: TextSelection) => void;
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { setCommentsOffsetY } = useSelectionContext();

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
    <div ref={sectionRef} style={{ position: 'relative' }}>
      <NewCommentForm handleAddComment={handleAddComment} />
      {children}
    </div>
  );
};

export default CommentsSection;
