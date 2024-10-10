export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
};

export type Comment = {
  id: number;
  text: string;
  selectionStart: number;
  selectionEnd: number;
  position: number;
};
