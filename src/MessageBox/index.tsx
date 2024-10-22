import Highlight from '../plugin/Highlight';
import { Comment } from '../plugin/types';
import type { Message } from '../types';

const MessageBox = ({
  message,
  comments,
}: {
  message: Message;
  comments: Comment[];
}) => {
  return (
    <div
      className={`mb-4 p-4 rounded-lg shadow ${
        message.role === 'assistant' ? 'bg-blue-100' : 'bg-gray-200'
      }`}
    >
      <Highlight
        markdown={message.content}
        containerId={message.id}
        comments={comments}
        color="#fef2cd"
        activeColor="#fcbc03"
      />
    </div>
  );
};

export default MessageBox;
