// renderAstToReact.ts
import React from 'react';
import { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';
import { unified } from 'unified';
import rehypeReact from 'rehype-react';

let keyCounter = 0;

export function renderAstToReactWithPositions(
  ast: Root,
): React.ReactNode {
  // Walk through the HAST and add position data and unique keys
  visit(ast, 'element', (node: Element) => {
    if (node.position && node.properties) {
      node.properties['data-position-start'] =
        node.position.start.offset;
      node.properties['data-position-end'] = node.position.end.offset;
      node.properties.key = `key-${keyCounter++}`; // Assign unique key
    }
  });

  const processor = unified().use(rehypeReact, {
    createElement: React.createElement,
    Fragment: React.Fragment,
    jsx: React.createElement,
    jsxs: React.createElement,
    development: false,
    components: {},
    passKeys: true,
  });

  // Process the AST to get the React elements
  const reactContent = processor.stringify(ast);

  return reactContent;
}
