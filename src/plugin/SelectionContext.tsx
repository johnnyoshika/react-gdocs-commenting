// SelectionContext.tsx
import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  Comment,
  CommentPositionState,
  PositionedSelectionRange,
} from './types';

const SelectionContext = createContext<
  | {
      commentableContainers: React.MutableRefObject<
        Partial<Record<string, React.RefObject<HTMLDivElement>>>
      >;
      positionedSelection: PositionedSelectionRange | undefined;
      setPositionedSelection: (
        positionedSelection: PositionedSelectionRange | undefined,
      ) => void;
      commentableSectionOffsetY: number;
      setCommentableSectionOffsetY: (offsetY: number) => void;
      commentsSectionOffsetY: number;
      setCommentsSectionOffsetY: (offsetY: number) => void;
      showNewCommentBox: boolean;
      setShowNewCommentBox: (show: boolean) => void;
      commentPositionState: CommentPositionState;
      setCommentPositionState: React.Dispatch<
        React.SetStateAction<CommentPositionState>
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
  const [commentableSectionOffsetY, setCommentableSectionOffsetY] =
    useState(0);
  const [commentsSectionOffsetY, setCommentsSectionOffsetY] =
    useState(0);
  const [showNewCommentBox, setShowNewCommentBox] = useState(false);
  const [positionedSelection, setPositionedSelection] = useState<
    PositionedSelectionRange | undefined
  >();
  const [commentPositionState, setCommentPositionState] =
    useState<CommentPositionState>({
      positions: {},
      activeCommentId: null,
    });

  const commentableContainers = useRef<
    Record<string, React.RefObject<HTMLDivElement>>
  >({});

  const value = useMemo(
    () => ({
      commentableContainers,
      positionedSelection,
      setPositionedSelection,
      commentableSectionOffsetY,
      setCommentableSectionOffsetY,
      commentsSectionOffsetY,
      setCommentsSectionOffsetY,
      showNewCommentBox,
      setShowNewCommentBox,
      commentPositionState,
      setCommentPositionState,
      comments,
    }),
    [
      commentableContainers,
      positionedSelection,
      setPositionedSelection,
      commentableSectionOffsetY,
      setCommentableSectionOffsetY,
      commentsSectionOffsetY,
      setCommentsSectionOffsetY,
      showNewCommentBox,
      setShowNewCommentBox,
      commentPositionState,
      setCommentPositionState,
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
