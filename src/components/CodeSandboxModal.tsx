import React, { useState, useEffect } from 'react';
import { X, Play, RefreshCw, Terminal, Monitor, Copy, Check } from 'lucide-react';
import { Language, SandboxResult } from '../types';
import { simulateSandbox } from '../services/api';

interface CodeSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode: string;
  language: string;
  lang: Language;
}

export const CodeSandboxModal: React.FC<CodeSandboxModalProps> = ({
  isOpen,
  onClose,
  initialCode,
  language,
  lang,
}) => {
  const isFa = lang === 'fa';
  const [code, setCode] = useState(initialCode);
  const [activeTab, setActiveTab] = useState<'preview' | 'terminal' | 'editor'>('preview');
  const [simResult, setSimResult] = useState<SandboxResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCode(initialCode);
    setSimResult(null);
    const isHtmlOrJs = ['html', 'javascript', 'js'].includes(language.toLowerCase());
    setActiveTab(isHtmlOrJs ? 'preview' : 'terminal');
  }, [initialCode, language]);

  if (!isOpen) return null;

  const isHtml = language.toLowerCase() === 'html';
  const isJs = ['javascript', 'js'].includes(language.toLowerCase());

  const handleSimulate = async () => {
    setIsRunning(true);
    try {
      const res = await simulateSandbox(code, language);
      setSimResult(res);
      setActiveTab('terminal');
    } catch (err: any) {
      setSimResult({
        stdout: '',
        stderr: err.message || 'Execution failed',
        exitCode: 1,
        executionDuration: '0ms',
        analysis: 'Error executing script.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build iframe srcdoc for HTML/JS
  const getIframeSrcDoc = () => {
    if (isHtml) return code;
    if (isJs) {
      return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { background: #07090e; color: #38bdf8; font-family: monospace; padding: 16px; margin: 0; }
      pre { white-space: pre-wrap; font-size: 13px; }
    </style>
  </head>
  <body>
    <h3>[Live JavaScript Sandbox Output]</h3>
    <pre id="output"></pre>
    <script>
      const out = document.getElementById('output');
      const originalLog = console.log;
      console.log = function(...args) {
        out.textContent += args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' ') + '\\n';
        originalLog.apply(console, args);
      };
      try {
        ${code}
      } catch (err) {
        out.textContent += '\\n[Error]: ' + err.message;
      }
    </script>
  </body>
</html>`;
    }
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md">
      <div
        className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#090d16] shadow-2xl"
        dir="ltr"
      >
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-cyan-500/20 bg-[#0d1424] px-4 py-3 text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span className="font-mono font-bold text-cyan-300">
              SOVEREIGN CODE RUNNER
            </span>
            <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-[11px] text-cyan-400 uppercase">
              {language}
            </span>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-900 p-0.5">
            <button
              onClick={() => setActiveTab('editor')}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                activeTab === 'editor'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Editor
            </button>
            {(isHtml || isJs) && (
              <button
                onClick={() => setActiveTab('preview')}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Monitor className="h-3 w-3" />
                  Live Preview
                </span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('terminal')}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                activeTab === 'terminal'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1">
                <Terminal className="h-3 w-3" />
                Terminal Output
              </span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulate}
              disabled={isRunning}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-3 py-1.5 font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 transition-all"
            >
              {isRunning ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-white" />
              )}
              <span>Execute</span>
            </button>

            <button
              onClick={handleCopy}
              className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Viewport */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {activeTab === 'editor' && (
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-full w-full resize-none bg-[#05070d] p-4 font-mono text-xs leading-relaxed text-slate-200 focus:outline-none"
              spellCheck={false}
            />
          )}

          {activeTab === 'preview' && (isHtml || isJs) && (
            <iframe
              title="Code Preview"
              srcDoc={getIframeSrcDoc()}
              className="h-full w-full border-none bg-white"
              sandbox="allow-scripts"
            />
          )}

          {activeTab === 'terminal' && (
            <div className="h-full overflow-y-auto bg-[#05070d] p-4 font-mono text-xs text-slate-200">
              {isRunning ? (
                <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Executing script in sovereign environment...</span>
                </div>
              ) : simResult ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-2 text-[11px] text-slate-400">
                    <span>Duration: {simResult.executionDuration}</span>
                    <span className={simResult.exitCode === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      Status: Exit {simResult.exitCode}
                    </span>
                  </div>
                  {simResult.stdout && (
                    <pre className="whitespace-pre-wrap text-emerald-300 leading-relaxed">
                      {simResult.stdout}
                    </pre>
                  )}
                  {simResult.stderr && (
                    <pre className="whitespace-pre-wrap text-rose-400 leading-relaxed">
                      {simResult.stderr}
                    </pre>
                  )}
                  {simResult.analysis && (
                    <div className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-3 text-cyan-200 text-xs">
                      {simResult.analysis}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <Terminal className="h-10 w-10 stroke-1 text-slate-600 mb-2" />
                  <p>Click "Execute" to run this {language} script in the sandbox.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
