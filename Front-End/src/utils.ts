import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import rehypeRewrite from 'rehype-rewrite';

export function parseMarkdown(markdown: string): string {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeHighlight)
    .use(rehypeRewrite, {
      rewrite: (node) => {
        if (node.type === 'element' && node.tagName === 'details') {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const firstLine = node.children[0].value.split('  ')[0];
          const firstLineLength = firstLine.length;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          node.children[0].value =
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            node.children[0].value.slice(firstLineLength);
        }
      },
    })
    .use(rehypeStringify)
    .processSync(markdown)
    .toString();
}
