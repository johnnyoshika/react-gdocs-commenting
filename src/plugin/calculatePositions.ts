// CommentPositionContext.tsx
import { COMMENT_OVERLAP_GAP } from './constants';
import {
  CommentPositions,
  CommentPositionState,
  CommentSize,
} from './types';

/**
 Calculates the adjusted positions of comments to be displayed in the UI.
 
 **Strategy Overview:**
 
 - **Desired Positions:** Each comment has a desired top position based on the location of its associated text selection in the document (`positions[id].top`).
 - **Overlap Prevention:** Comments may overlap if their desired positions are close. The goal is to adjust their positions to prevent overlap while keeping them as close as possible to their desired positions.
 - **Active Comment Priority:** If there's an active (focused) comment, it should remain at its desired position. Other comments adjust around it to prevent overlap, but they should not stray far from their own desired positions.
 - **Minimal Adjustment:** Adjust comments only when necessary and by the minimal amount required to prevent overlap.
 
 **Function Inputs:**
 
 - `state: CommentPositionState`
   - `positions`: An object mapping comment IDs to their desired positions (`{ [id]: { top: number } }`).
   - `activeCommentId`: The ID of the currently active comment, or `null` if no comment is active.
 - `visibleComments: Set<string>`: A set of comment IDs that are currently visible in the UI.
 - `commentSizes: Record<string, CommentSize>`: An object mapping comment IDs to their sizes (`{ [id]: { height: number } }`).
 
 **Function Output:**
 
 - `newPositions: CommentPositions`: An object mapping comment IDs to their adjusted positions (`{ [id]: { top: number } }`).
 
 **Algorithm Steps:**
 
 1. **Filter and Sort Comments:**
    - Filter out comments that are not visible.
    - Sort the remaining comments by their desired top positions in ascending order.
 
 2. **Assign Desired Positions:**
    - Initialize `finalPositions` by assigning each comment its desired top position from `positions`.
 
 3. **Adjust Positions to Prevent Overlap (No Active Comment):**
    - Iterate through the sorted comments.
    - For each comment (except the first), check if it overlaps with the previous comment.
    - If an overlap is detected, adjust the current comment's position downward to sit just below the previous comment, respecting the `COMMENT_OVERLAP_GAP`.
 
 4. **Handle Active Comment:**
    - If there's an active comment:
      - **Keep the active comment at its desired position.**
      - **Adjust Comments Above the Active Comment:**
        - Iterate backward from the comment just above the active comment.
        - For each comment:
          - Calculate the maximum allowable top position (`requiredTop`) to prevent overlap with the comment below it.
          - Adjust the comment's position upward to the minimum of its desired position and `requiredTop`, ensuring it doesn't move above its desired position.
      - **Adjust Comments Below the Active Comment:**
        - Iterate forward from the comment just below the active comment.
        - For each comment:
          - Calculate the minimum allowable top position (`requiredTop`) to prevent overlap with the comment above it.
          - Adjust the comment's position downward to the maximum of its desired position and `requiredTop`, ensuring it doesn't move below its desired position.
 
 5. **Finalize Adjusted Positions:**
    - Compile the adjusted positions into `newPositions`.
 
 **Key Considerations:**
 
 - **Desired Position vs. Adjusted Position:**
   - The desired position is where the comment would naturally appear next to its associated text.
   - The adjusted position is where the comment is actually placed after adjustments to prevent overlap.
 - **Overlap Detection:**
   - Overlaps are detected by comparing the current comment's top position plus its height and the `COMMENT_OVERLAP_GAP` against the next comment's top position.
 - **Minimal Movement:**
   - Comments are only moved as much as necessary to prevent overlap.
   - Adjustments do not push comments beyond their desired positions unless required.
 
 **Why This Approach:**
 
 - **User Experience:**
   - Keeping comments near their associated text enhances the user's understanding of what part of the text each comment refers to.
   - Preventing overlap ensures that comments are readable and accessible.
 - **Active Comment Focus:**
   - Prioritizing the active comment's position maintains context for the user and avoids unexpected movements during interaction.
 
 **Example Scenario:**
 
 - **Initial State:**
   - Comment 1 at top position 100px (height 50px).
   - Comment 2 at top position 140px (height 50px).
   - Comment 3 at top position 180px (height 50px).
 - **Overlap Detection:**
   - Comment 2 would overlap with Comment 1 (since 100px + 50px + gap > 140px).
 - **Adjustment:**
   - Adjust Comment 2 to start at 100px + 50px + gap.
   - Repeat for Comment 3.
 - **Active Comment:**
   - If Comment 2 becomes active, it stays at 140px.
   - Comments above and below adjust accordingly to prevent overlap.
 
 **Dependencies:**
 
 - Relies on accurate `commentSizes` to calculate heights.
 - Assumes `positions` contains up-to-date desired positions based on text selections.
 */
export const calculatePositions = (
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
