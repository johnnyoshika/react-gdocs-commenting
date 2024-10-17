// parseMarkdown.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { Root } from 'mdast';

export function parseMarkdown(markdownContent: string): Root {
  const processor = unified().use(remarkParse, { position: true });
  const ast = processor.parse(markdownContent) as Root;
  return ast;
}
