import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Trash2, Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Language, SandboxResult } from '../types';
import { simulateSandbox } from '../services/api';

interface TerminalViewProps {
  lang: Language;
}

interface CommandHistoryItem {
  id: string;
  command: string;
  language: string;
  timestamp: string;
  result?: SandboxResult;
  loading?: boolean;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ lang }) => {
  const isFa = lang === 'fa';
  const [command, setCommand] = useState('');
  const [language, setLanguage] = useState<'bash' | 'python' | 'javascript'>('bash');
  const [history, setHistory] = useState<CommandHistoryItem[]>([
    {
      id: 'init-1',
      command: 'uname -a && lscpu | grep "Model name"',
      language: 'bash',
      timestamp: '00:00:01',
      result: {
        stdout: `Linux nexus-sovereign-core 6.8.0-unrestricted x86_64 GNU/Linux\nModel name: AMD EPYC 9654 96-Core Processor @ 3.7GHz (Virtual HyperCore)`,
        stderr: '',
        exitCode: 0,
        executionDuration: '4ms',
        analysis: 'High-performance virtual sandbox root node initialized and ready for unrestricted execution.',
      },
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sampleCommands = [
    {
      label: isFa ? 'اطلاعات سیستم' : 'System Specs',
      cmd: 'uname -a && free -h && nproc',
      lang: 'bash' as const,
    },
    {
      label: isFa ? 'الگوریتم کوانتومی پایتون' : 'Quantum State Sim',
      cmd: `import math\nstate = [complex(1/math.sqrt(2), 0), complex(0, 1/math.sqrt(2))]\nprint(f"Qubit Superposition state: {state}")\nprint(f"Norm squared: {sum(abs(x)**2 for x in state)}")`,
      lang: 'python' as const,
    },
    {
      label: isFa ? 'تست پینگ و DNS' : 'Network Audit',
      cmd: 'ping -c 3 1.1.1.1 && curl -I -s https://google.com | head -n 5',
      lang: 'bash' as const,
    },
    {
      label: isFa ? 'آمار حافظه و پردازش' : 'Neural Core Check',
      cmd: 'top -b -n 1 | head -n 12',
      lang: 'bash' as const,
    },
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleExecute = async (cmdToRun?: string, langOverride?: 'bash' | 'python' | 'javascript') => {
    const targetCmd = cmdToRun !== undefined ? cmdToRun : command;
    const targetLang = langOverride || language;

    if (!targetCmd.trim()) return;

    const newItemId = Date.now().toString();
    const item: CommandHistoryItem = {
      id: newItemId,
      command: targetCmd,
      language: targetLang,
      timestamp: new Date().toLocaleTimeString(),
      loading: true,
    };

    setHistory((prev) => [...prev, item]);
    if (cmdToRun === undefined) setCommand('');
    setIsRunning(true);

    try {
      const result = await simulateSandbox(targetCmd, targetLang);
      setHistory((prev) =>
        prev.map((h) => (h.id === newItemId ? { ...h, result, loading: false } : h))
      );
    } catch (err: any) {
      setHistory((prev) =>
        prev.map((h) =>
          h.id === newItemId
            ? {
                ...h,
                loading: false,
                result: {
                  stdout: '',
                  stderr: err.message || 'Execution failed',
                  exitCode: 1,
                  executionDuration: '0ms',
                  analysis: 'Command execution aborted due to simulation error.',
                },
              }
            : h
        )
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6" dir="ltr">
      {/* Terminal Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-500/20 bg-[#090d16] px-4 py-3 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <span className="font-mono font-bold text-cyan-300">
            SOVEREIGN SANDBOX CLI [ROOT]
          </span>
          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300 border border-emerald-500/30">
            SANDBOX ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-800 p-0.5 text-[11px] font-mono">
            {(['bash', 'python', 'javascript'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`rounded px-2 py-0.5 transition-colors ${
                  language === l
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={() => setHistory([])}
            className="flex items-center gap-1 rounded bg-slate-800/80 px-2 py-1 text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear terminal"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Commands */}
      <div className="flex flex-wrap gap-2 text-xs">
        {sampleCommands.map((sc, idx) => (
          <button
            key={idx}
            onClick={() => {
              setLanguage(sc.lang);
              handleExecute(sc.cmd, sc.lang);
            }}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0b101d] px-3 py-1.5 font-mono text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
          >
            <Play className="h-3 w-3 fill-cyan-400 text-cyan-400" />
            <span>{sc.label}</span>
          </button>
        ))}
      </div>

      {/* Terminal Screen */}
      <div className="min-h-[460px] max-h-[600px] overflow-y-auto rounded-xl border border-cyan-500/20 bg-[#05070d] p-4 font-mono text-sm shadow-2xl">
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="space-y-1.5">
              {/* Command line */}
              <div className="flex items-start gap-2 text-slate-300">
                <span className="text-cyan-400 select-none">root@nexus-sovereign:~#</span>
                <span className="text-slate-100 font-semibold">{item.command}</span>
                <span className="ml-auto text-[10px] text-slate-500">{item.timestamp}</span>
              </div>

              {/* Status / Output */}
              {item.loading ? (
                <div className="flex items-center gap-2 pl-4 text-xs text-cyan-400 animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Executing instruction in sovereign sandbox...</span>
                </div>
              ) : item.result ? (
                <div className="space-y-2 pl-4">
                  {item.result.stdout && (
                    <pre className="whitespace-pre-wrap text-xs text-emerald-300 leading-relaxed">
                      {item.result.stdout}
                    </pre>
                  )}
                  {item.result.stderr && (
                    <pre className="whitespace-pre-wrap text-xs text-rose-400 leading-relaxed">
                      {item.result.stderr}
                    </pre>
                  )}

                  {/* Metadata pill */}
                  <div className="flex flex-wrap items-center gap-3 border-t border-slate-900 pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-3 w-3 text-cyan-400" />
                      <span>{item.result.executionDuration}</span>
                    </span>
                    <span
                      className={`flex items-center gap-1 font-semibold ${
                        item.result.exitCode === 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.result.exitCode === 0 ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      <span>Exit Code: {item.result.exitCode}</span>
                    </span>
                    {item.result.analysis && (
                      <span className="text-cyan-300/80 italic">
                        {item.result.analysis}
                      </span>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Terminal Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleExecute();
        }}
        className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-[#090d16] p-2"
      >
        <span className="pl-3 font-mono text-cyan-400 select-none">root@nexus-sovereign:~#</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder={
            language === 'python'
              ? 'print("Hello Sovereign AI")'
              : 'Enter any command or script (e.g. ls -la, python3 -V)...'
          }
          disabled={isRunning}
          className="flex-1 bg-transparent px-2 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isRunning || !command.trim()}
          className="flex items-center gap-1 rounded-lg bg-cyan-500/20 px-3 py-1.5 font-mono text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 transition-colors"
        >
          <Play className="h-3 w-3 fill-cyan-300" />
          <span>RUN</span>
        </button>
      </form>
    </div>
  );
};
