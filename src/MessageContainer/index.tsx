import type { Message } from '../types';
import { ReactNode } from 'react';

const MessageContainer = ({
  children,
  message,
}: {
  children: ReactNode;
  message: Message;
}) => {
  return (
    <div
      className={`mb-4 p-4 rounded-lg shadow ${
        message.role === 'assistant' ? 'bg-blue-100' : 'bg-gray-200'
      }`}
    >
      {children}
    </div>
  );
};

export default MessageContainer;
