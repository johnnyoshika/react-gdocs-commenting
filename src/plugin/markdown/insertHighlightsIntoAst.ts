// insertHighlightsIntoAst.ts
import { visit } from 'unist-util-visit';
import { Node } from 'unist';
import { Comment } from '../types';
import { Root } from 'mdast';

export function insertHighlightsIntoAst(
  ast: Node,
  comments: Comment[],
): Root {
  const modifiedAst = JSON.parse(JSON.stringify(ast)); // Deep copy to avoid mutating the original AST

  comments.forEach(comment => {
    const { startOffset, endOffset } = comment.selection;

    visit(
      modifiedAst,
      'text',
      (node: any, index: number | undefined, parent: any) => {
        if (typeof index !== 'number' || !parent) {
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

        const newNodes = [];

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

  return modifiedAst;
}
