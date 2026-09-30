import React, { useState } from 'react';
import { Copy, Check, Play, Terminal, ExternalLink } from 'lucide-react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  onRunCode?: (code: string, language: string) => void;
  lang?: 'fa' | 'en';
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onRunCode,
  lang = 'fa',
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split content by code blocks to give them rich interactive UI
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts: Array<{ type: 'markdown' | 'code'; text: string; language?: string }> = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'markdown',
        text: content.slice(lastIndex, match.index),
      });
    }

    parts.push({
      type: 'code',
      language: match[1] || 'text',
      text: match[2].trimEnd(),
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'markdown',
      text: content.slice(lastIndex),
    });
  }

  return (
    <div className="space-y-3 leading-relaxed text-[15px] select-text">
      {parts.map((part, idx) => {
        if (part.type === 'code') {
          const isRunnable = ['javascript', 'js', 'html', 'python', 'py', 'bash', 'sh'].includes(
            part.language?.toLowerCase() || ''
          );

          return (
            <div
              key={idx}
              className="my-3 overflow-hidden rounded-xl border border-cyan-500/20 bg-[#090d16] text-left shadow-lg"
              dir="ltr"
            >
              {/* Code Header Bar */}
              <div className="flex items-center justify-between border-b border-cyan-500/10 bg-[#0e1626] px-3.5 py-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="font-mono font-semibold uppercase tracking-wider text-cyan-300">
                    {part.language || 'code'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isRunnable && onRunCode && (
                    <button
                      onClick={() => onRunCode(part.text, part.language || 'text')}
                      className="flex items-center gap-1 rounded bg-cyan-500/20 px-2 py-0.5 text-[11px] font-medium text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                      title={lang === 'fa' ? 'اجرا در سندباکس' : 'Run in Sandbox'}
                    >
                      <Play className="h-3 w-3 fill-cyan-300" />
                      <span>{lang === 'fa' ? 'اجرا در سندباکس' : 'Run'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleCopy(part.text, idx)}
                    className="flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">
                          {lang === 'fa' ? 'کپی شد' : 'Copied'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>{lang === 'fa' ? 'کپی کد' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Body */}
              <pre className="overflow-x-auto p-4 text-[13px] font-mono leading-relaxed text-slate-200">
                <code>{part.text}</code>
              </pre>
            </div>
          );
        }

        // Render HTML parsed markdown
        const html = marked.parse(part.text, { async: false }) as string;
        return (
          <div
            key={idx}
            className="prose prose-invert max-w-none prose-p:my-2 prose-headings:text-cyan-200 prose-headings:font-bold prose-a:text-cyan-400 prose-strong:text-cyan-300 prose-ul:my-2 prose-li:my-0.5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
};
