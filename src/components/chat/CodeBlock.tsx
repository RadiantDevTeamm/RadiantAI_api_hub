import { memo, useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

function highlightLine(line: string): string {
  let html = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // strings
  html = html.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="tok-str">$1</span>');
  // comments
  html = html.replace(/(\/\/[^\n]*|#[^\n]*)/g, '<span class="tok-com">$1</span>');
  // keywords
  html = html.replace(
    /\b(const|let|var|function|return|if|else|for|while|import|from|export|default|class|new|await|async|yield|typeof|instanceof|in|of|try|catch|finally|throw|break|continue|switch|case|do|void|delete|interface|type|enum|implements|extends|public|private|protected|static|readonly|namespace|as|is|def|elif|None|True|False|print|self|fn|let|pub|use|match|impl|trait|struct)\b/g,
    '<span class="tok-kw">$1</span>',
  );
  // numbers
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="tok-num">$1</span>');
  // booleans / null
  html = html.replace(/\b(true|false|null|undefined|nil)\b/g, '<span class="tok-bool">$1</span>');
  // function calls
  html = html.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g, '<span class="tok-fn">$1</span>');

  return html;
}

function CodeBlockInner({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const lines = code.replace(/\n$/, '').split('\n');

  return (
    <div className="group/code my-3 overflow-hidden rounded-lg border border-border bg-code-bg">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-muted transition-colors hover:text-text"
          aria-label="Copy code"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="scroll-thin overflow-x-auto p-3">
        <pre className="font-mono text-[13px] leading-relaxed">
          <code>
            {lines.map((line, i) => (
              <span key={i} className="block" dangerouslySetInnerHTML={{ __html: highlightLine(line) || '&nbsp;' }} />
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

export const CodeBlock = memo(CodeBlockInner);
