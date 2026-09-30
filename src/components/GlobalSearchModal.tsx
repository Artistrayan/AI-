import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  MessageSquare,
  BookOpen,
  History,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layers,
  Filter,
  Bot,
  User,
  CheckCircle,
} from 'lucide-react';
import { Message, KnowledgeItem, LearningEvolutionLog, Language } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  knowledgeVault: KnowledgeItem[];
  evolutionLogs: LearningEvolutionLog[];
  onSelectMessage: (messageId: string) => void;
  onSelectKnowledge: (node: KnowledgeItem) => void;
  onSelectEvolution: () => void;
  lang: Language;
}

type FilterTab = 'all' | 'messages' | 'knowledge' | 'evolution';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  messages,
  knowledgeVault,
  evolutionLogs,
  onSelectMessage,
  onSelectKnowledge,
  onSelectEvolution,
  lang,
}) => {
  const isFa = lang === 'fa';
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();

  // Search in Messages
  const matchedMessages = messages.filter((m) =>
    cleanQuery ? m.text.toLowerCase().includes(cleanQuery) : false
  );

  // Search in Knowledge Vault
  const matchedKnowledge = knowledgeVault.filter((k) =>
    cleanQuery
      ? k.title.toLowerCase().includes(cleanQuery) ||
        k.summary.toLowerCase().includes(cleanQuery) ||
        k.content.toLowerCase().includes(cleanQuery) ||
        k.tags.some((t) => t.toLowerCase().includes(cleanQuery))
      : false
  );

  // Search in Evolution Logs
  const matchedEvolution = evolutionLogs.filter((e) =>
    cleanQuery
      ? e.trigger.toLowerCase().includes(cleanQuery) ||
        e.adaptationSummary.toLowerCase().includes(cleanQuery) ||
        e.learnedConcepts.some((c) => c.toLowerCase().includes(cleanQuery))
      : false
  );

  const totalResults =
    (activeTab === 'all' || activeTab === 'messages' ? matchedMessages.length : 0) +
    (activeTab === 'all' || activeTab === 'knowledge' ? matchedKnowledge.length : 0) +
    (activeTab === 'all' || activeTab === 'evolution' ? matchedEvolution.length : 0);

  const highlightMatch = (text: string, maxLen = 140) => {
    if (!cleanQuery) {
      return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
    }
    const idx = text.toLowerCase().indexOf(cleanQuery);
    if (idx === -1) {
      return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
    }

    const start = Math.max(0, idx - 40);
    const end = Math.min(text.length, idx + cleanQuery.length + 60);
    const snippet = (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');

    return snippet;
  };

  const sampleQuickSearches = isFa
    ? ['کوانتوم', 'الگوریتم', 'معماری سیستم', 'رمزنگاری', 'آگاهی', 'CRISPR']
    : ['Quantum', 'Algorithm', 'Architecture', 'Cryptography', 'Consciousness', 'CRISPR'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 sm:p-6 pt-16 sm:pt-20 backdrop-blur-md">
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#090d16] shadow-2xl shadow-cyan-500/15"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {/* Top Search Input Box */}
        <div className="flex items-center gap-3 border-b border-cyan-500/20 bg-[#0c1424] px-4 py-3.5 sm:px-5">
          <Search className="h-5 w-5 flex-shrink-0 text-cyan-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isFa
                ? 'جستجوی سراسری در چت‌ها، پایگاه دانش و تاریخچه تکامل...'
                : 'Search across conversations, knowledge vault, and evolution logs...'
            }
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="rounded-md p-1 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="hidden sm:inline-block rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
            ESC
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white sm:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Tabs & Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-[#080d18] px-4 py-2 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isFa ? 'همه' : 'All'}
              {cleanQuery && ` (${totalResults})`}
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition-colors ${
                activeTab === 'messages'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="h-3 w-3" />
              <span>{isFa ? 'چت‌ها' : 'Chat'}</span>
              {cleanQuery && ` (${matchedMessages.length})`}
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition-colors ${
                activeTab === 'knowledge'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="h-3 w-3" />
              <span>{isFa ? 'دانش' : 'Knowledge'}</span>
              {cleanQuery && ` (${matchedKnowledge.length})`}
            </button>
            <button
              onClick={() => setActiveTab('evolution')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition-colors ${
                activeTab === 'evolution'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="h-3 w-3" />
              <span>{isFa ? 'تکامل' : 'Evolution'}</span>
              {cleanQuery && ` (${matchedEvolution.length})`}
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            {isFa ? 'فیلتر آنی سراسری' : 'Global Instant Index'}
          </span>
        </div>

        {/* Search Results Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Empty state when no query */}
          {!cleanQuery && (
            <div className="space-y-4 py-6 text-center">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  {isFa ? 'در تمامی ابعاد هوش مصنوعی جستجو کنید' : 'Search across all cognitive dimensions'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {isFa
                    ? 'پیام‌های مکالمه، کدهای تولیدشده، پرونده‌های پایگاه دانش و رخدادهای یادگیری بی‌درنگ را فوراً پیدا کنید.'
                    : 'Instantly surface past chats, synthesized code, comprehensive knowledge vault dossiers, and real-time evolution logs.'}
                </p>
              </div>

              {/* Sample quick terms */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-500 block mb-2">
                  {isFa ? 'جستجوهای پیشنهادی:' : 'Suggested topics:'}
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {sampleQuickSearches.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(term)}
                      className="rounded-lg border border-slate-800 bg-[#0d1424] px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results when query present */}
          {cleanQuery && totalResults === 0 && (
            <div className="py-12 text-center text-xs text-slate-500">
              {isFa
                ? `هیچ نتیجه‌ای برای "${query}" یافت نشد. عبارت دیگری را جستجو کنید.`
                : `No results found for "${query}". Try searching for another concept or keyword.`}
            </div>
          )}

          {cleanQuery && totalResults > 0 && (
            <div className="space-y-4">
              
              {/* SECTION: Knowledge Vault Matches */}
              {(activeTab === 'all' || activeTab === 'knowledge') && matchedKnowledge.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{isFa ? 'پایگاه دانش جامع' : 'Knowledge Vault Dossiers'}</span>
                    <span className="rounded-full bg-cyan-500/10 px-1.5 py-0.2 text-[10px] font-mono">
                      {matchedKnowledge.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {matchedKnowledge.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectKnowledge(item);
                          onClose();
                        }}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0c1322]/80 p-3.5 hover:border-cyan-500/40 hover:bg-[#10192e] cursor-pointer transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase text-cyan-400">
                              {item.category}
                            </span>
                            <span className="font-bold text-slate-100 text-xs group-hover:text-cyan-200 transition-colors">
                              {item.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {highlightMatch(item.summary || item.content)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-cyan-400 sm:self-center font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          <span>{isFa ? 'مشاهده و گفت‌وگو' : 'Open'}</span>
                          <ArrowRight className={`h-3 w-3 ${isFa ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: Conversation Messages Matches */}
              {(activeTab === 'all' || activeTab === 'messages') && matchedMessages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{isFa ? 'تاریخچه پیام‌ها و مکالمات' : 'Conversation History'}</span>
                    <span className="rounded-full bg-sky-500/10 px-1.5 py-0.2 text-[10px] font-mono">
                      {matchedMessages.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {matchedMessages.map((msg) => {
                      const isUser = msg.role === 'user';
                      return (
                        <div
                          key={msg.id}
                          onClick={() => {
                            onSelectMessage(msg.id);
                            onClose();
                          }}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0c1322]/80 p-3.5 hover:border-sky-500/40 hover:bg-[#10192e] cursor-pointer transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-mono flex items-center gap-1 ${
                                  isUser
                                    ? 'bg-slate-800 text-slate-300'
                                    : 'bg-cyan-500/20 text-cyan-300'
                                }`}
                              >
                                {isUser ? <User className="h-2.5 w-2.5" /> : <Bot className="h-2.5 w-2.5" />}
                                <span>{isUser ? (isFa ? 'شما' : 'User') : 'NEXUS'}</span>
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(msg.timestamp).toLocaleString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                              {highlightMatch(msg.text)}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-sky-400 sm:self-center font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            <span>{isFa ? 'رفتن به پیام' : 'Jump to Chat'}</span>
                            <ArrowRight className={`h-3 w-3 ${isFa ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION: Evolution Logs Matches */}
              {(activeTab === 'all' || activeTab === 'evolution') && matchedEvolution.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                    <History className="h-3.5 w-3.5" />
                    <span>{isFa ? 'رویدادهای تکامل و یادگیری' : 'Learning Evolution Logs'}</span>
                    <span className="rounded-full bg-purple-500/10 px-1.5 py-0.2 text-[10px] font-mono">
                      {matchedEvolution.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {matchedEvolution.map((log) => (
                      <div
                        key={log.id}
                        onClick={() => {
                          onSelectEvolution();
                          onClose();
                        }}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0c1322]/80 p-3.5 hover:border-purple-500/40 hover:bg-[#10192e] cursor-pointer transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-mono text-purple-300">
                              {log.trigger}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(log.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                            {highlightMatch(log.adaptationSummary)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-purple-400 sm:self-center font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          <span>{isFa ? 'داشبورد یادگیری' : 'Learning Dashboard'}</span>
                          <ArrowRight className={`h-3 w-3 ${isFa ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer Bar */}
        <div className="flex items-center justify-between border-t border-cyan-500/20 bg-[#0c1424] px-4 py-2.5 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
              {isFa ? 'میانبر: Ctrl + K' : 'Shortcut: Ctrl + K'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isFa ? 'بستن' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
