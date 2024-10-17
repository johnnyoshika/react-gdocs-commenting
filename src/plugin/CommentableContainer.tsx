import { useRef } from 'react';
import { useSelectionContext } from './SelectionContext';
import { Comment } from './types';
import { parseMarkdown } from './markdown/parseMarkdown';
import { getSourceOffset } from './markdown/helpers';
import { renderAstToReactWithPositions } from './markdown/renderAstToReact';
import { insertHighlightsIntoAst } from './markdown/insertHighlightsIntoAst';
import { unified } from 'unified';
import remarkRehype from 'remark-rehype';

const CommentableContainer = ({
  containerId,
  markdown,
  comments,
}: {
  containerId: string;
  markdown: string;
  comments: Comment[];
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse the markdown content into an MDAST
  const mdast = parseMarkdown(markdown);

  // Insert highlights into the MDAST based on comments
  const mdastWithHighlights = insertHighlightsIntoAst(
    mdast,
    comments,
  );

  // Convert MDAST to HAST
  const hast = unified()
    .use(remarkRehype)
    .runSync(mdastWithHighlights);

  // Render the HAST to React components with position data
  const renderedContent = renderAstToReactWithPositions(hast);

  const { setSelectedText } = useSelectionContext();

  const handleTextSelection = () => {
    if (!containerRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount == 0) {
      setSelectedText(undefined);
      return;
    }

    const range = selection.getRangeAt(0);

    // Check if the selection is collapsed (i.e., it's just a single click)
    if (range.collapsed) {
      setSelectedText(undefined);
      return;
    }

    // Check if both the start and end containers are within contentRef
    if (
      !containerRef.current.contains(range.startContainer) ||
      !containerRef.current.contains(range.endContainer)
    ) {
      setSelectedText(undefined);
      return;
    }

    // Get the start and end positions in the markdown source
    const startOffset = getSourceOffset(
      range.startContainer,
      range.startOffset,
    );
    const endOffset = getSourceOffset(
      range.endContainer,
      range.endOffset,
    );

    if (startOffset === null || endOffset === null) {
      console.error('Unable to map selection to source positions.');
      return;
    }

    const rect = range.getBoundingClientRect();
    const scrollTop = document.documentElement.scrollTop;
    const positionTop = rect.top + scrollTop;

    setSelectedText({
      startOffset,
      endOffset,
      containerId,
      positionTop,
    });
  };

  return (
    <div ref={containerRef} onMouseUp={handleTextSelection}>
      {renderedContent}
    </div>
  );
};

export default CommentableContainer;
