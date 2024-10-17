// renderAstToReact.ts
import React from 'react';
import { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';
import { unified } from 'unified';
import rehypeReact from 'rehype-react';

export function renderAstToReactWithPositions(
  ast: Root,
): React.ReactNode {
  // Walk through the HAST and add position data to properties
  visit(ast, 'element', (node: Element) => {
    if (node.position && node.properties) {
      node.properties['data-position-start'] =
        node.position.start.offset;
      node.properties['data-position-end'] = node.position.end.offset;
    }
  });

  const isDevelopment = import.meta.env.DEV;

  const processor = unified().use(rehypeReact, {
    createElement: React.createElement,
    Fragment: React.Fragment,
    jsx: React.createElement,
    jsxs: React.createElement,
    ...(isDevelopment ? { jsxDEV: React.createElement } : {}),
    development: false,
    components: {},
    passKeys: true,
  } as any);

  // Process the AST to get the React elements
  const reactContent = processor.stringify(ast) as React.ReactElement;

  return reactContent;
}
