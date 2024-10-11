export type TextSelection = {
  startOffset: number;
  endOffset: number;
};

export type TextSelectionPosition = TextSelection & {
  positionTop: number;
};

export type Comment = {
  id: string;
  selection: TextSelection;
};

export type CommentPositions = Record<string, { top: number }>;
