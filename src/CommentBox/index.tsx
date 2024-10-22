import React, { useEffect, useRef, useState } from 'react';
import { MessageComment } from '../types';

const MAX_HEIGHT = 100;
const EXPANDED_MAX_HEIGHT = 1000; // This should be larger than any expected comment height

const renderComment = (text: string) => {
  return text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
};

const CommentContent: React.FC<{ comment: MessageComment }> = ({
  comment,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShowMore, setShowShowMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setShowShowMore(contentRef.current.scrollHeight > MAX_HEIGHT);
    }
  }, [comment.text]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div
        ref={contentRef}
        style={{
          maxHeight: isExpanded
            ? `${EXPANDED_MAX_HEIGHT}px` // We use EXPANDED_MAX_HEIGHT instead of none so that transition works
            : `${MAX_HEIGHT}px`,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-out',
        }}
      >
        {renderComment(comment.text)}
      </div>
      {showShowMore && (
        <button
          onClick={toggleExpand}
          className="mt-2 text-blue-600 bg-transparent border-none cursor-pointer"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};

const CommentBox: React.FC<{
  comment: MessageComment;
  isActive: boolean;
}> = ({ comment, isActive }) => {
  return (
    <div
      className={`rounded-lg p-3 mb-2 transition-colors duration-200 ${
        isActive ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-gray-100'
      }`}
    >
      <div className="flex items-center mb-2">
        <span className="font-bold">Johnny Oshika</span>
        <span className="ml-2 text-gray-600">12:32PM Oct 10</span>
      </div>
      <CommentContent comment={comment} />
      <div className="mt-2">
        <input
          type="text"
          placeholder="Reply or add others with @"
          className={`w-full p-2 border rounded-full transition-colors duration-200 ${
            isActive
              ? 'border-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400'
              : 'border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-gray-400'
          }`}
        />
      </div>
    </div>
  );
};

export default CommentBox;
