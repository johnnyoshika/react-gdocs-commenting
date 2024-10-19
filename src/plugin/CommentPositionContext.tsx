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
    let activePositions = Object.entries(positions).filter(([id]) =>
      activeComments.has(id),
    );

    if (newCommentPosition !== null) {
      activePositions.push([
        NEW_COMMENT_ID,
        { top: newCommentPosition },
      ]);
    }

    activePositions = activePositions.sort(
      ([, a], [, b]) => a.top - b.top,
    );

    let currentTop = 0;
    const newPositions: Record<string, number> = {};

    activePositions.forEach(([id, position]) => {
      if (position.top > currentTop) {
        currentTop = position.top;
      }
      newPositions[id] = currentTop;
      currentTop +=
        (commentSizes[id]?.height || 0) + COMMENT_OVERLAP_GAP;
    });

    setAdjustedPositions(newPositions);
  }, [positions, activeComments, commentSizes, newCommentPosition]);

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
