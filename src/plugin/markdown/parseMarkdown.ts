// parseMarkdown.ts

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { Node } from 'unist';

export function parseMarkdown(markdownContent: string): Node {
  const processor = unified().use(remarkParse, { position: true });
  const ast = processor.parse(markdownContent);
  return ast;
}
