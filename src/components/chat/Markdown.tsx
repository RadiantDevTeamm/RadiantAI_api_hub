import { memo } from 'react';
import { CodeBlock } from './CodeBlock';

interface MarkdownProps {
  content: string;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderInline(text: string): string {
  let out = escapeHtml(text);
  // inline code
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  // bold
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  // links
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  return out;
}

interface Block {
  type: 'code' | 'text';
  content: string;
  lang?: string;
}

function parseBlocks(md: string): Block[] {
  const blocks: Block[] = [];
  const fence = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = fence.exec(md)) !== null) {
    if (m.index > last) blocks.push({ type: 'text', content: md.slice(last, m.index) });
    blocks.push({ type: 'code', lang: m[1] || '', content: m[2].replace(/\n$/, '') });
    last = fence.lastIndex;
  }
  if (last < md.length) blocks.push({ type: 'text', content: md.slice(last) });
  return blocks;
}

function renderTextBlock(text: string): string {
  const lines = text.split('\n');
  let html = '';
  let inList: 'ul' | 'ol' | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      html += `<p>${renderInline(para.join(' '))}</p>`;
      para = [];
    }
  };
  const closeList = () => {
    if (inList) {
      html += `</${inList}>`;
      inList = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushPara();
      closeList();
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.*)/);
    if (h) {
      flushPara();
      closeList();
      const level = h[1].length;
      html += `<h${level}>${renderInline(h[2])}</h${level}>`;
      continue;
    }
    const ul = line.match(/^[-*]\s+(.*)/);
    if (ul) {
      flushPara();
      if (inList !== 'ul') {
        closeList();
        html += '<ul>';
        inList = 'ul';
      }
      html += `<li>${renderInline(ul[1])}</li>`;
      continue;
    }
    const ol = line.match(/^\d+\.\s+(.*)/);
    if (ol) {
      flushPara();
      if (inList !== 'ol') {
        closeList();
        html += '<ol>';
        inList = 'ol';
      }
      html += `<li>${renderInline(ol[1])}</li>`;
      continue;
    }
    const bq = line.match(/^>\s+(.*)/);
    if (bq) {
      flushPara();
      closeList();
      html += `<blockquote>${renderInline(bq[1])}</blockquote>`;
      continue;
    }
    const hr = line.match(/^(-{3,}|\*{3,})$/);
    if (hr) {
      flushPara();
      closeList();
      html += '<hr />';
      continue;
    }
    closeList();
    para.push(line);
  }
  flushPara();
  closeList();
  return html;
}

function MarkdownInner({ content }: MarkdownProps) {
  const blocks = parseBlocks(content);
  return (
    <div className="prose-chat">
      {blocks.map((block, i) =>
        block.type === 'code' ? (
          <CodeBlock key={i} language={block.lang || ''} code={block.content} />
        ) : (
          <div key={i} dangerouslySetInnerHTML={{ __html: renderTextBlock(block.content) }} />
        ),
      )}
    </div>
  );
}

export const Markdown = memo(MarkdownInner);
