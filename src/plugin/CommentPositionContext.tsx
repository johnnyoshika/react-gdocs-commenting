// CommentPositionContext.tsx
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSelectionContext } from './SelectionContext';
import { COMMENT_OVERLAP_GAP, NEW_COMMENT_ID } from './constants';
import { CommentPositions } from './types';

type CommentSize = {
  height: number;
};

type CommentPositionContextType = {
  registerComment: (id: string) => void;
  unregisterComment: (id: string) => void;
  getAdjustedTop: (id: string) => number;
  updateCommentSize: (id: string, size: CommentSize) => void;
  setNewCommentPosition: (position: number | null) => void;
};

const calculatePositionsWithoutNewComment = (
  positions: CommentPositions,
  activeComments: Set<string>,
  commentSizes: Record<string, CommentSize>,
): Record<string, number> => {
  const newPositions: Record<string, number> = {};

  // Get active comments (excluding the new comment)
  const activePositions = Object.entries(positions)
    .filter(([id]) => activeComments.has(id) && id !== NEW_COMMENT_ID)
    .sort(([, a], [, b]) => a.top - b.top);

  let currentTop = 0;
  activePositions.forEach(([id, position]) => {
    if (position.top > currentTop) {
      currentTop = position.top;
    }
    newPositions[id] = currentTop;
    currentTop +=
      (commentSizes[id]?.height || 0) + COMMENT_OVERLAP_GAP;
  });

  return newPositions;
};

const calculatePositionsWithNewComment = (
  positions: CommentPositions,
  activeComments: Set<string>,
  commentSizes: Record<string, CommentSize>,
  newCommentPosition: number,
): Record<string, number> => {
  const newPositions: Record<string, number> = {};

  // Set the new comment position
  newPositions[NEW_COMMENT_ID] = newCommentPosition;

  // Get active comments (excluding the new comment)
  const activePositions = Object.entries(positions).filter(
    ([id]) => activeComments.has(id) && id !== NEW_COMMENT_ID,
  );

  const commentsAbove: Array<[string, { top: number }]> = [];
  const commentsBelow: Array<[string, { top: number }]> = [];

  // Separate comments into above and below the new comment
  activePositions.forEach(([id, position]) => {
    if (position.top < newCommentPosition!) {
      commentsAbove.push([id, position]);
    } else {
      commentsBelow.push([id, position]);
    }
  });

  // Sort comments above and below
  commentsAbove.sort(([, a], [, b]) => b.top - a.top); // From bottom to top
  commentsBelow.sort(([, a], [, b]) => a.top - b.top); // From top to bottom

  // Position comments above the new comment
  let currentTop = newCommentPosition!;
  for (const [id] of commentsAbove) {
    const commentHeight = commentSizes[id]?.height || 0;
    currentTop -= commentHeight + 10; // 10px gap
    newPositions[id] = currentTop;
  }

  // Position comments below the new comment
  currentTop =
    newCommentPosition! +
    (commentSizes[NEW_COMMENT_ID]?.height || 0) +
    COMMENT_OVERLAP_GAP;
  for (const [id, position] of commentsBelow) {
    currentTop = Math.max(currentTop, position.top);
    newPositions[id] = currentTop;
    currentTop += (commentSizes[id]?.height || 0) + 10;
  }

  return newPositions;
};

const CommentPositionContext = createContext<
  CommentPositionContextType | undefined
>(undefined);

export const CommentPositionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [activeComments, setActiveComments] = useState<Set<string>>(
    new Set(),
  );
  const [commentSizes, setCommentSizes] = useState<
    Record<string, CommentSize>
  >({});
  const [adjustedPositions, setAdjustedPositions] = useState<
    Record<string, number>
  >({});
  const { positions } = useSelectionContext();
  const [newCommentPosition, setNewCommentPosition] = useState<
    number | null
  >(null);

  const updatePositions = useCallback(() => {
    let newPositions: Record<string, number> =
      newCommentPosition === null
        ? calculatePositionsWithoutNewComment(
            positions,
            activeComments,
            commentSizes,
          )
        : calculatePositionsWithNewComment(
            positions,
            activeComments,
            commentSizes,
            newCommentPosition,
          );

    setAdjustedPositions(newPositions);
  }, [
    positions,
    newCommentPosition,
    activeComments,
    commentSizes,
    calculatePositionsWithNewComment,
    calculatePositionsWithoutNewComment,
    setAdjustedPositions,
  ]);

  useEffect(() => {
    updatePositions();
  }, [updatePositions]);

  const registerComment = useCallback((id: string) => {
    setActiveComments(prev => new Set(prev).add(id));
  }, []);

  const unregisterComment = useCallback((id: string) => {
    setActiveComments(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setCommentSizes(prev => {
      const newSizes = { ...prev };
      delete newSizes[id];
      return newSizes;
    });
  }, []);

  const updateCommentSize = useCallback(
    (id: string, size: CommentSize) => {
      setCommentSizes(prev => {
        if (JSON.stringify(prev[id]) !== JSON.stringify(size)) {
          return { ...prev, [id]: size };
        }
        return prev;
      });
    },
    [],
  );

  const getAdjustedTop = useCallback(
    (id: string) => adjustedPositions[id] || positions[id]?.top || 0,
    [adjustedPositions, positions],
  );

  const contextValue = useMemo(
    () => ({
      registerComment,
      unregisterComment,
      getAdjustedTop,
      updateCommentSize,
      setNewCommentPosition,
    }),
    [
      registerComment,
      unregisterComment,
      getAdjustedTop,
      updateCommentSize,
      setNewCommentPosition,
    ],
  );

  return (
    <CommentPositionContext.Provider value={contextValue}>
      {children}
    </CommentPositionContext.Provider>
  );
};

export const useCommentPositionContext = () => {
  const context = useContext(CommentPositionContext);
  if (!context) {
    throw new Error(
      'useCommentPositionContext must be used within a CommentPositionProvider',
    );
  }
  return context;
};
