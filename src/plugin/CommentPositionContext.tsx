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

  const sortedComments = Object.entries(positions)
    .filter(([id]) => visibleComments.has(id))
    .sort(([, a], [, b]) => a.top - b.top);

  if (activeCommentId) {
    const activeCommentIndex = sortedComments.findIndex(
      ([id]) => id === activeCommentId,
    );
    const activeCommentTop = positions[activeCommentId].top;

    // Position comments above the active comment
    let currentTop = activeCommentTop;
    for (let i = activeCommentIndex - 1; i >= 0; i--) {
      const [id] = sortedComments[i];
      const commentHeight = commentSizes[id]?.height || 0;
      currentTop -= commentHeight + COMMENT_OVERLAP_GAP;
      newPositions[id] = { top: currentTop };
    }

    // Position the active comment
    newPositions[activeCommentId] = { top: activeCommentTop };

    // Position comments below the active comment
    currentTop =
      activeCommentTop +
      (commentSizes[activeCommentId]?.height || 0) +
      COMMENT_OVERLAP_GAP;
    for (
      let i = activeCommentIndex + 1;
      i < sortedComments.length;
      i++
    ) {
      const [id] = sortedComments[i];
      newPositions[id] = { top: currentTop };
      currentTop +=
        (commentSizes[id]?.height || 0) + COMMENT_OVERLAP_GAP;
    }
  } else {
    // If no active comment, use the original positioning logic
    let currentTop = 0;
    sortedComments.forEach(([id, position]) => {
      if (position.top > currentTop) {
        currentTop = position.top;
      }
      newPositions[id] = { top: currentTop };
      currentTop +=
        (commentSizes[id]?.height || 0) + COMMENT_OVERLAP_GAP;
    });
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
