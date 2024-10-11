import { useRef, useState, KeyboardEvent, useEffect } from 'react';
import Message from './Message';
import { messages } from './data';
import type { Comment, TextSelection } from './types';
import React from 'react';

const App = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedText, setSelectedText] = useState<TextSelection>();
  const [showCommentBox, setShowCommentBox] = useState(false);
  const chatContentRef = useRef<HTMLDivElement>(null);
  const commentFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (!chatContentRef.current) return;

      const chatRect = chatContentRef.current.getBoundingClientRect();
      setComments(prevComments =>
        prevComments.map(comment => {
          const messageElement =
            chatContentRef.current?.querySelector(
              `[data-message-id="${comment.selection.messageId}"]`,
            );
          if (!messageElement) return comment;

          const messageRect = messageElement.getBoundingClientRect();
          const newPosition =
            messageRect.top +
            comment.selection.position -
            chatRect.top;

          return {
            ...comment,
            selection: {
              ...comment.selection,
              position: newPosition,
            },
          };
        }),
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getTextNodesInElement = (element: Node): Text[] => {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
    );

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    return textNodes;
  };

  const getOffsetInTextContent = (
    element: Element,
    targetNode: Node,
    offsetInNode: number,
  ): number => {
    const textNodes = getTextNodesInElement(element);
    let totalOffset = 0;

    for (const textNode of textNodes) {
      if (textNode === targetNode) {
        return totalOffset + offsetInNode;
      }
      totalOffset += textNode.length;
    }

    return -1; // Should never happen if targetNode is within element
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount == 0) return;

    const range = selection.getRangeAt(0);
    const messageElement =
      range.startContainer.parentElement?.closest(
        '[data-message-id]',
      );

    if (!messageElement) return;

    const messageId = messageElement.getAttribute('data-message-id');

    if (!messageId) return;

    const startOffset = getOffsetInTextContent(
      messageElement,
      range.startContainer,
      range.startOffset,
    );
    const endOffset = getOffsetInTextContent(
      messageElement,
      range.endContainer,
      range.endOffset,
    );
    const selectedText = range.toString();

    // Calculate the vertical position of the selection
    const rect = range.getBoundingClientRect();
    const scrollTop =
      window.pageYOffset || document.documentElement.scrollTop;
    const position = rect.top + scrollTop;

    setSelectedText({
      messageId,
      startOffset,
      endOffset,
      selectedText,
      position,
    });
  };

  const handleAddComment = () => {
    setShowCommentBox(true);
  };

  const handleCommentSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    submitComment();
  };

  const submitComment = () => {
    if (!commentFormRef.current || !selectedText) return;

    const form = commentFormRef.current;
    const commentText = (
      form.elements.namedItem('comment') as HTMLTextAreaElement
    ).value;

    if (!commentText) return;

    const newComment: Comment = {
      id: (comments.length + 1).toString(),
      text: commentText,
      selection: selectedText,
    };
    setComments([...comments, newComment]);
    setShowCommentBox(false);
    setSelectedText(undefined);
    form.reset();
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
                style={{ top: `${comment.selection.position}px` }}
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
