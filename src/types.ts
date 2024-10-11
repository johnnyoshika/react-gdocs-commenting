export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
};

export type TextSelection = {
  messageId: string;
  startOffset: number;
  endOffset: number;
  selectedText: string;
  positionTop: number;
};

export type Comment = {
  id: string;
  text: string;
  selection: TextSelection;
};
