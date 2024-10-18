export interface TextSelection {
  containerId: string;
  startOffset: number;
  endOffset: number;
}

export interface TextSelectionPosition extends TextSelection {
  positionTop: number;
}

export interface Comment {
  id: string;
  selection: TextSelection;
}

export type CommentPositions = Record<string, { top: number }>;
