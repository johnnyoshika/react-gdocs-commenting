// insertHighlightsIntoHast.ts
import { visit } from 'unist-util-visit';
import { Root, Element, Text } from 'hast';
import { Comment } from '../types';

export function insertHighlightsIntoHast(
  hast: Root,
  comments: Comment[],
): Root {
  const modifiedHast = JSON.parse(JSON.stringify(hast)); // Deep copy to avoid mutating the original HAST

  comments.forEach(comment => {
    const { startOffset, endOffset } = comment.selection;

    visit(
      modifiedHast,
      'text',
      (node: Text, index?: number, parent?: Element) => {
        if (index === undefined || !parent) {
          return;
        }

        // Check if node.position and its properties are defined
        if (
          !node.position ||
          !node.position.start ||
          !node.position.end ||
          node.position.start.offset === undefined ||
          node.position.end.offset === undefined
        ) {
          return;
        }

        const nodeStart = node.position.start.offset;
        const nodeEnd = node.position.end.offset;

        if (nodeEnd <= startOffset || nodeStart >= endOffset) {
          // No overlap
          return;
        }

        const text = node.value;
        const relativeStart = Math.max(startOffset - nodeStart, 0);
        const relativeEnd = Math.min(
          endOffset - nodeStart,
          text.length,
        );

        const beforeText = text.slice(0, relativeStart);
        const highlightedText = text.slice(
          relativeStart,
          relativeEnd,
        );
        const afterText = text.slice(relativeEnd);

        const newNodes: Array<Text | Element> = [];

        if (beforeText) {
          newNodes.push({
            type: 'text',
            value: beforeText,
            position: {
              start: node.position.start,
              end: {
                ...node.position.start,
                offset: nodeStart + relativeStart,
                column: node.position.start.column + relativeStart,
              },
            },
          });
        }

        if (highlightedText) {
          newNodes.push({
            type: 'element',
            tagName: 'span',
            properties: { className: ['highlight'] },
            children: [
              {
                type: 'text',
                value: highlightedText,
                position: {
                  start: {
                    ...node.position.start,
                    offset: nodeStart + relativeStart,
                    column:
                      node.position.start.column + relativeStart,
                  },
                  end: {
                    ...node.position.start,
                    offset: nodeStart + relativeEnd,
                    column: node.position.start.column + relativeEnd,
                  },
                },
              },
            ],
            position: {
              start: {
                ...node.position.start,
                offset: nodeStart + relativeStart,
                column: node.position.start.column + relativeStart,
              },
              end: {
                ...node.position.start,
                offset: nodeStart + relativeEnd,
                column: node.position.start.column + relativeEnd,
              },
            },
          });
        }

        if (afterText) {
          newNodes.push({
            type: 'text',
            value: afterText,
            position: {
              start: {
                ...node.position.start,
                offset: nodeStart + relativeEnd,
                column: node.position.start.column + relativeEnd,
              },
              end: node.position.end,
            },
          });
        }

        parent.children.splice(index, 1, ...newNodes);
      },
    );
  });

  return modifiedHast;
}
