import type { Message } from '../types';
import { Comment } from '../plugin/types';
import Highlight from '../plugin/Highlight';

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
      <Highlight markdown={message.content} comments={comments} />
    </div>
  );
};

export default MessageBox;
