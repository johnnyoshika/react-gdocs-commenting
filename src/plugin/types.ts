export interface TextSelection {
  startOffset: number;
  endOffset: number;
}

export interface TextSelectionPosition extends TextSelection {
  containerId: string | undefined;
  positionTop: number;
}

export interface Comment {
  id: string;
  selection: TextSelection;
}

export type CommentPositions = Record<string, { top: number }>;
