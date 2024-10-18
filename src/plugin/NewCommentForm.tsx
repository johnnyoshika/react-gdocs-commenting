import { useRef, KeyboardEvent } from 'react';
import { useSelectionContext } from './SelectionContext';
import { TextSelection } from './types';

const NewCommentForm = ({
  handleAddComment,
}: {
  handleAddComment: (text: string, selection: TextSelection) => void;
}) => {
  const commentFormRef = useRef<HTMLFormElement>(null);

  const {
    selectedText,
    setSelectedText,
    setShowCommentBox,
    showCommentBox,
  } = useSelectionContext();

  const submitComment = () => {
    if (!commentFormRef.current || !selectedText) return;

    const form = commentFormRef.current;
    const commentText = (
      form.elements.namedItem('comment') as HTMLTextAreaElement
    ).value;

    if (!commentText) return;

    handleAddComment(commentText, selectedText);
    setShowCommentBox(false);
    setSelectedText(undefined);
    form.reset();
  };

  const handleCommentSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    submitComment();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      submitComment();
    }
  };

  if (!showCommentBox) return null;

  return (
    <form
      ref={commentFormRef}
      onSubmit={handleCommentSubmit}
      className="mt-4"
    >
      <textarea
        name="comment"
        placeholder="Add a comment"
        className="w-full p-2 border rounded"
        rows={4}
        onKeyDown={handleKeyDown}
      ></textarea>
      <button
        type="submit"
        className="mt-2 bg-blue-500 text-white p-2 rounded"
      >
        Submit
      </button>
    </form>
  );
};

export default NewCommentForm;
