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
import { COMMENT_OVERLAP_GAP } from './constants';
import { CommentPositions, CommentPositionState } from './types';

type CommentSize = {
  height: number;
};

type CommentPositionContextType = {
  registerComment: (id: string) => void;
  unregisterComment: (id: string) => void;
  getAdjustedTop: (id: string) => number;
  updateCommentSize: (id: string, size: CommentSize) => void;
};

const calculatePositions = (
  state: CommentPositionState,
  visibleComments: Set<string>,
  commentSizes: Record<string, CommentSize>,
): CommentPositions => {
  const { positions, activeCommentId } = state;
  const newPositions: CommentPositions = {};

  // Filter and sort comments by their desired positions
  const sortedComments = Object.entries(positions)
    .filter(([id]) => visibleComments.has(id))
    .sort(([, a], [, b]) => a.top - b.top);

  // Map to store final positions
  const finalPositions: Record<string, number> = {};

  // Helper function to get comment height
  const getCommentHeight = (id: string) =>
    commentSizes[id]?.height ?? 0;

  // Assign desired positions
  sortedComments.forEach(([id, position]) => {
    finalPositions[id] = position.top;
  });

  // Adjust positions to prevent overlap
  for (let i = 0; i < sortedComments.length; i++) {
    const [currentId] = sortedComments[i];
    const currentTop = finalPositions[currentId];

    if (i > 0) {
      const [prevId] = sortedComments[i - 1];
      const prevTop = finalPositions[prevId];
      const prevHeight = getCommentHeight(prevId);

      const requiredTop = prevTop + prevHeight + COMMENT_OVERLAP_GAP;

      if (currentTop < requiredTop) {
        // Adjust current comment's position to prevent overlap
        finalPositions[currentId] = requiredTop;
      }
    }
  }

  // If there's an active comment, ensure it stays at its desired position
  if (activeCommentId && positions[activeCommentId]) {
    const activeIndex = sortedComments.findIndex(
      ([id]) => id === activeCommentId,
    );
    const activeTop = positions[activeCommentId].top;

    // Set the active comment's position
    finalPositions[activeCommentId] = activeTop;

    // Adjust comments above the active comment
    for (let i = activeIndex - 1; i >= 0; i--) {
      const [currentId] = sortedComments[i];
      const desiredTop = positions[currentId].top;
      const currentHeight = getCommentHeight(currentId);

      const nextId = sortedComments[i + 1][0];
      const nextTop = finalPositions[nextId];

      const requiredTop =
        nextTop - currentHeight - COMMENT_OVERLAP_GAP;

      if (
        finalPositions[currentId] +
          currentHeight +
          COMMENT_OVERLAP_GAP >
        nextTop
      ) {
        // Adjust current comment's position upwards to prevent overlap
        finalPositions[currentId] = Math.min(desiredTop, requiredTop);
      }
    }

    // Adjust comments below the active comment
    for (let i = activeIndex + 1; i < sortedComments.length; i++) {
      const [currentId] = sortedComments[i];
      const desiredTop = positions[currentId].top;
      const prevId = sortedComments[i - 1][0];
      const prevTop = finalPositions[prevId];
      const prevHeight = getCommentHeight(prevId);

      const requiredTop = prevTop + prevHeight + COMMENT_OVERLAP_GAP;

      if (finalPositions[currentId] < requiredTop) {
        // Adjust current comment's position downwards to prevent overlap
        finalPositions[currentId] = Math.max(desiredTop, requiredTop);
      }
    }
  }

  // Set the new positions
  Object.entries(finalPositions).forEach(([id, top]) => {
    newPositions[id] = { top };
  });

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
  const [visibleComments, setVisibleComments] = useState<Set<string>>(
    new Set(),
  );
  const [commentSizes, setCommentSizes] = useState<
    Record<string, CommentSize>
  >({});
  const [adjustedPositions, setAdjustedPositions] =
    useState<CommentPositions>({});
  const { commentPositionState } = useSelectionContext();

  const updatePositions = useCallback(() => {
    const newPositions = calculatePositions(
      commentPositionState,
      visibleComments,
      commentSizes,
    );
    setAdjustedPositions(newPositions);
  }, [commentPositionState, visibleComments, commentSizes]);

  useEffect(() => {
    updatePositions();
  }, [updatePositions]);

  const registerComment = useCallback((id: string) => {
    setVisibleComments(prev => new Set(prev).add(id));
  }, []);

  const unregisterComment = useCallback((id: string) => {
    setVisibleComments(prev => {
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
    (id: string) =>
      adjustedPositions[id]?.top ??
      commentPositionState.positions[id]?.top ??
      0,
    [adjustedPositions, commentPositionState],
  );

  const contextValue = useMemo(
    () => ({
      registerComment,
      unregisterComment,
      getAdjustedTop,
      updateCommentSize,
    }),
    [
      registerComment,
      unregisterComment,
      getAdjustedTop,
      updateCommentSize,
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
