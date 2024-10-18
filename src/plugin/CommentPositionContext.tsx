// CommentPositionContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useSelectionContext } from './SelectionContext';

type CommentPositionContextType = {
  registerComment: (id: string) => void;
  unregisterComment: (id: string) => void;
  getAdjustedTop: (id: string) => number;
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
  const [adjustedPositions, setAdjustedPositions] = useState<
    Record<string, number>
  >({});
  const { positions } = useSelectionContext();

  useEffect(() => {
    const activePositions = Object.entries(positions)
      .filter(([id]) => activeComments.has(id))
      .sort(([, a], [, b]) => a.top - b.top);

    let currentTop = 0;
    const newPositions: Record<string, number> = {};

    activePositions.forEach(([id, position]) => {
      if (position.top > currentTop) {
        currentTop = position.top;
      }
      newPositions[id] = currentTop;
      currentTop += 70; // Adjust this value based on your comment height
    });

    setAdjustedPositions(newPositions);
  }, [positions, activeComments]);

  const registerComment = (id: string) => {
    setActiveComments(prev => new Set(prev).add(id));
  };

  const unregisterComment = (id: string) => {
    setActiveComments(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const getAdjustedTop = (id: string) =>
    adjustedPositions[id] || positions[id]?.top || 0;

  return (
    <CommentPositionContext.Provider
      value={{ registerComment, unregisterComment, getAdjustedTop }}
    >
      {children}
    </CommentPositionContext.Provider>
  );
};

export const useCommentPosition = () => {
  const context = useContext(CommentPositionContext);
  if (!context) {
    throw new Error(
      'useCommentPosition must be used within a CommentPositionProvider',
    );
  }
  return context;
};
