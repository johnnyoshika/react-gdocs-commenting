import ReactMarkdown from 'react-markdown';
import type { Message } from '../types';

const Message = ({ message }: { message: Message }) => {
  return (
    <div
      data-message-id={message.id}
      className={`mb-4 p-4 rounded-lg shadow ${
        message.role === 'assistant' ? 'bg-blue-100' : 'bg-gray-200'
      }`}
    >
      <ReactMarkdown>{message.content}</ReactMarkdown>
    </div>
  );
};

export default Message;
