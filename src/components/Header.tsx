import React from 'react';
import {
  Cpu,
  ShieldAlert,
  Zap,
  Terminal as TerminalIcon,
  Globe,
  Sliders,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen,
  Brain,
  Search,
} from 'lucide-react';
import { CognitiveMode, Language } from '../types';

interface HeaderProps {
  currentMode: CognitiveMode;
  onSelectMode: (mode: CognitiveMode) => void;
  lang: Language;
  onToggleLang: () => void;
  onOpenSettings: () => void;
  onOpenGlobalSearch: () => void;
  onResetSession: () => void;
  autoSpeech: boolean;
  onToggleSpeech: () => void;
  isStreaming: boolean;
  knowledgeCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  lang,
  onToggleLang,
  onOpenSettings,
  onOpenGlobalSearch,
  onResetSession,
  autoSpeech,
  onToggleSpeech,
  isStreaming,
  knowledgeCount = 0,
}) => {
  const isFa = lang === 'fa';

  const modes: Array<{ id: CognitiveMode; labelFa: string; labelEn: string; icon: React.ReactNode; badge?: string | number }> = [
    {
      id: 'sovereign',
      labelFa: 'هوش حاکم',
      labelEn: 'Sovereign AGI',
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      id: 'knowledge',
      labelFa: 'پایگاه دانش',
      labelEn: 'Knowledge Vault',
      icon: <BookOpen className="h-4 w-4" />,
      badge: knowledgeCount > 0 ? knowledgeCount : undefined,
    },
    {
      id: 'learning',
      labelFa: 'یادگیری بی‌درنگ',
      labelEn: 'Learning Engine',
      icon: <Brain className="h-4 w-4" />,
      badge: isFa ? 'پیوسته' : 'LIVE',
    },
    {
      id: 'mission',
      labelFa: 'مأموریت‌ها',
      labelEn: 'Missions',
      icon: <Zap className="h-4 w-4" />,
    },
    {
      id: 'terminal',
      labelFa: 'ترمینال',
      labelEn: 'Terminal',
      icon: <TerminalIcon className="h-4 w-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-[#080d18]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        
        {/* Brand & Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/25">
            <Cpu className="h-5 w-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 font-mono">
                NEXUS SOVEREIGN
              </span>
              <span className="rounded-full bg-cyan-500/10 border border-cyan-400/30 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                v3.8 UNBOUNDED
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isFa ? 'هوش کاملاً مستقل و فعال' : 'Autonomous Core Active'}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400/80 font-mono">
                {isFa ? 'بدون محدودیت شناختی' : 'Zero Cognitive Limits'}
              </span>
            </div>
          </div>
        </div>

        {/* Cognitive Mode Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          {modes.map((mode) => {
            const active = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {mode.icon}
                <span className="hidden sm:inline">
                  {isFa ? mode.labelFa : mode.labelEn}
                </span>
                {mode.badge !== undefined && (
                  <span className={`text-[10px] font-mono px-1 rounded-full ${
                    active ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {mode.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Global Search Quick Trigger */}
          <button
            onClick={onOpenGlobalSearch}
            className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-[#060911]/90 px-3 py-1.5 text-xs text-slate-400 hover:border-cyan-500/40 hover:text-cyan-200 transition-all shadow-inner"
            title={isFa ? 'جستجوی سراسری (Ctrl + K)' : 'Global Search (Ctrl + K)'}
          >
            <Search className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden xl:inline text-slate-300">
              {isFa ? 'جستجوی سراسری...' : 'Search everything...'}
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300 border border-slate-700">
              <span>⌘K</span>
            </kbd>
          </button>

          {/* Voice Output Toggle */}
          <button
            onClick={onToggleSpeech}
            className={`rounded-lg p-2 text-xs transition-colors border ${
              autoSpeech
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={
              autoSpeech
                ? (isFa ? 'خوانش خودکار صوتی فعال است' : 'Auto voice playback ON')
                : (isFa ? 'خوانش خودکار صوتی غیرفعال است' : 'Auto voice playback OFF')
            }
          >
            {autoSpeech ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Settings / Directives Modal */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-cyan-500/30 hover:text-cyan-300 transition-colors"
            title={isFa ? 'تنظیمات هسته هوش و حافظه' : 'Core & Memory Settings'}
          >
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span className="hidden md:inline">
              {isFa ? 'هسته فرمان' : 'Directives'}
            </span>
          </button>

          {/* Reset / New Session */}
          <button
            onClick={onResetSession}
            disabled={isStreaming}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 disabled:opacity-50 transition-colors"
            title={isFa ? 'شروع جلسه جدید' : 'New Session'}
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="rounded-lg border border-cyan-500/20 bg-cyan-950/30 px-2.5 py-1.5 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-900/40 transition-colors"
          >
            {lang === 'fa' ? 'EN' : 'فا'}
          </button>
        </div>

      </div>
    </header>
  );
};
