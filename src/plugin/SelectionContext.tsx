import {
  createContext,
  useState,
  ReactNode,
  useContext,
  useMemo,
  useRef,
} from 'react';
import type {
  CommentPositions,
  Comment,
  TextSelectionPosition,
} from './types';

const SelectionContext = createContext<
  | {
      commentableContainers: React.MutableRefObject<
        Partial<Record<string, React.RefObject<HTMLDivElement>>>
      >;
      selectedText: TextSelectionPosition | undefined;
      setSelectedText: (
        selection: TextSelectionPosition | undefined,
      ) => void;
      contentOffsetY: number;
      setContentOffsetY: (offsetY: number) => void;
      commentsOffsetY: number;
      setCommentsOffsetY: (offsetY: number) => void;
      showCommentBox: boolean;
      setShowCommentBox: (show: boolean) => void;
      positions: CommentPositions;
      setPositions: React.Dispatch<
        React.SetStateAction<CommentPositions>
      >;
      comments: Comment[];
    }
  | undefined
>(undefined);

export const SelectionProvider = ({
  children,
  comments,
}: {
  children: ReactNode;
  comments: Comment[];
}) => {
  const [contentOffsetY, setContentOffsetY] = useState(0);
  const [commentsOffsetY, setCommentsOffsetY] = useState(0);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [selectedText, setSelectedText] = useState<
    TextSelectionPosition | undefined
  >();
  const [positions, setPositions] = useState<CommentPositions>({});

  const commentableContainers = useRef<
    Record<string, React.RefObject<HTMLDivElement>>
  >({});

  const value = useMemo(
    () => ({
      commentableContainers,
      selectedText,
      setSelectedText,
      contentOffsetY,
      setContentOffsetY,
      commentsOffsetY,
      setCommentsOffsetY,
      showCommentBox,
      setShowCommentBox,
      positions,
      setPositions,
      comments,
    }),
    [
      commentableContainers,
      selectedText,
      setSelectedText,
      contentOffsetY,
      setContentOffsetY,
      commentsOffsetY,
      setCommentsOffsetY,
      showCommentBox,
      setShowCommentBox,
      positions,
      setPositions,
      comments,
    ],
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelectionContext = () => {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error(
      'useSelectionContext must be used within a SelectionProvider',
    );
  }
  return context;
};
