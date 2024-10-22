import { KeyboardEvent, useEffect, useRef } from 'react';

const NewCommentForm = ({
  handleAddComment,
  setShowNewCommentBox,
}: {
  handleAddComment: (text: string) => void;
  setShowNewCommentBox: (show: boolean) => void;
}) => {
  const commentFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!commentFormRef.current) return;

    // Focus on the textarea when the form is shown
    const textarea = commentFormRef.current.elements.namedItem(
      'comment',
    ) as HTMLTextAreaElement;
    textarea.focus();
  }, []);

  const submitComment = () => {
    if (!commentFormRef.current) return;

    const form = commentFormRef.current;
    const commentText = (
      form.elements.namedItem('comment') as HTMLTextAreaElement
    ).value;

    if (!commentText) return;

    handleAddComment(commentText);
    setShowNewCommentBox(false);
    form.reset();
  };

  const handleCommentSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    submitComment();
  };

  const handleCancel = () => {
    setShowNewCommentBox(false);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      submitComment();
    }
  };

  return (
    <form
      ref={commentFormRef}
      onSubmit={handleCommentSubmit}
      className="bg-gray-100 rounded-lg p-3 mb-2"
    >
      <div className="flex items-center mb-2">
        <span className="font-bold">Johnny Oshika</span>
      </div>
      <textarea
        name="comment"
        placeholder="Add a comment"
        className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows={3}
        onKeyDown={handleKeyDown}
      ></textarea>
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          Comment
        </button>
      </div>
    </form>
  );
};

export default NewCommentForm;
