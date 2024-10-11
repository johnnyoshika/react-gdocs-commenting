import React from 'react';
import { MessageComment } from '../types';

const renderComment = (text: string) => {
  return text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
};

const CommentContainer = ({
  comment,
}: {
  comment: MessageComment;
}) => {
  return (
    <div key={comment.id} className="p-4 bg-gray-50 rounded shadow">
      {renderComment(comment.text)}
    </div>
  );
};

export default CommentContainer;
