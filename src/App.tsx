import { useRef, useState, KeyboardEvent, useEffect } from 'react';
import Message from './Message';
import { messages } from './data';
import type { Comment } from './types';
import React from 'react';

const App = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedText, setSelectedText] = useState<{
    start: number;
    end: number;
    position: number;
  } | null>(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const chatContentRef = useRef<HTMLDivElement>(null);
  const commentFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (chatContentRef.current) {
        const chatRect =
          chatContentRef.current.getBoundingClientRect();
        setComments(prevComments =>
          prevComments.map(comment => ({
            ...comment,
            position: comment.position - chatRect.top,
          })),
        );
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount == 0) return;

    const range = selection.getRangeAt(0);
    const start = range.startOffset;
    const end = range.endOffset;
    const rect = range.getBoundingClientRect();
    const scrollTop = document.documentElement.scrollTop;
    const position = rect.top + scrollTop;
    setSelectedText({ start, end, position });
  };

  const handleAddComment = () => {
    setShowCommentBox(true);
  };

  const submitComment = () => {
    if (commentFormRef.current) {
      const form = commentFormRef.current;
      const commentText = (
        form.elements.namedItem('comment') as HTMLTextAreaElement
      ).value;

      if (selectedText && commentText) {
        const newComment: Comment = {
          id: comments.length + 1,
          text: commentText,
          selectionStart: selectedText.start,
          selectionEnd: selectedText.end,
          position: selectedText.position,
        };
        setComments([...comments, newComment]);
        setShowCommentBox(false);
        setSelectedText(null);
        form.reset();
      }
    }
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

  const renderComment = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl w-full flex">
        <div className="w-2/3 bg-white p-6 rounded-lg shadow-md mr-4 relative">
          <h2 className="text-2xl font-bold mb-4">AI Chat</h2>
          <div ref={chatContentRef} onMouseUp={handleTextSelection}>
            {messages.map(message => (
              <Message key={message.id} message={message} />
            ))}
          </div>
          {selectedText && (
            <button
              onClick={handleAddComment}
              className="absolute top-1/2 right-2 bg-blue-500 text-white p-2 rounded-full"
            >
              +
            </button>
          )}
        </div>
        <div className="w-1/3 bg-white p-6 rounded-lg shadow-md relative">
          <div className="space-y-4">
            {comments.map(comment => (
              <div
                key={comment.id}
                className="p-4 bg-gray-50 rounded shadow absolute left-0 right-0 ml-4 mr-4"
                style={{ top: `${comment.position}px` }}
              >
                {renderComment(comment.text)}
              </div>
            ))}
          </div>
          {showCommentBox && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
