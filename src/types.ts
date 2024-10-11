export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
};

export type MessageComment = {
  id: string;
  selection: {
    startOffset: number;
    endOffset: number;
  };
  text: string;
};
