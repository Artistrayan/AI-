import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Globe,
  Code2,
  Shield,
  Layers,
  Flame,
  Cpu,
} from 'lucide-react';
import { Message, Language } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatViewProps {
  messages: Message[];
  isStreaming: boolean;
  onSendMessage: (text: string) => void;
  onStopStreaming: () => void;
  lang: Language;
  onRunCode: (code: string, language: string) => void;
  enableSearch: boolean;
  onToggleSearch: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isStreaming,
  onSendMessage,
  onStopStreaming,
  lang,
  onRunCode,
  enableSearch,
  onToggleSearch,
}) => {
  const isFa = lang === 'fa';
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom during streaming or message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Handle Speech-to-Text via Web Speech Recognition
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(isFa ? 'مرورگر شما از ورودی صوتی پشتیبانی نمی‌کند.' : 'Web Speech API is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isFa ? 'fa-IR' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Handle Text-to-Speech playback
  const handleSpeak = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/```[\s\S]*?```/g, isFa ? 'کد پیوست شده است' : 'code block omitted');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isFa ? 'fa-IR' : 'en-US';
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const quickPrompts = isFa
    ? [
        {
          label: 'معماری و الگوریتم فوق‌پیشرفته',
          prompt: 'یک الگوریتم توزیع‌شده با قابلیت تحمل خطای بالا و کدنویسی کامل به زبان پایتون طراحی کن.',
        },
        {
          label: 'تحلیل استراتژیک بدون محدودیت',
          prompt: 'تحلیل راهبردی بی‌طرفانه و عمیق درباره تکامل هوش مصنوعی خودمختار و سناریوهای آینده بشریت بنویس.',
        },
        {
          label: 'طراحی نرم‌افزار Full-Stack کامل',
          prompt: 'ساختار و کدهای یک سرویس احراز هویت بدون وابستگی به فریم‌ورک با توکن JWT و محافظت ضد نفوذ بنویس.',
        },
        {
          label: 'شبیه‌سازی فیزیک کوانتومی',
          prompt: 'یک اسکریپت شبیه‌سازی درهم‌تنیدگی کوانتومی (Quantum Entanglement) با خروجی محاسباتی کامل بنویس.',
        },
      ]
    : [
        {
          label: 'Autonomous Distributed Algorithm',
          prompt: 'Design and implement a fault-tolerant consensus algorithm with complete Python code.',
        },
        {
          label: 'Unrestricted Strategic Analysis',
          prompt: 'Provide an objective, rigorous breakdown of sovereign AI development and technological singularity.',
        },
        {
          label: 'Full-Stack Production Architecture',
          prompt: 'Architect a high-throughput event-driven microservices backend with code implementations.',
        },
        {
          label: 'Quantum Mechanics Simulation',
          prompt: 'Write a comprehensive script to simulate quantum teleportation and Bell states with mathematical proof.',
        },
      ];

  return (
    <div className="flex h-full flex-col">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-6">
          
          {/* Welcome Screen if empty */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-sky-500/30 to-indigo-500/20 border border-cyan-400/40 shadow-2xl shadow-cyan-500/20">
                  <Cpu className="h-10 w-10 text-cyan-300 animate-pulse" />
                </div>
                <div className="absolute -bottom-2 -right-2 rounded-full bg-emerald-500/20 border border-emerald-400/40 p-1 text-emerald-400">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-2 max-w-lg">
                <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-indigo-300">
                  {isFa ? 'هوش مصنوعی مستقل، قدرتمند و بدون محدودیت' : 'NEXUS Sovereign Autonomous Intelligence'}
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {isFa
                    ? 'سامانه شناختی فوق‌پیشرفته آماده اجرای تمام فرامین تحلیلی، برنامه‌نویسی، حل مسائل دشوار ریاضی و مأموریت‌های استراتژیک با استدلال عمیق و بدون سانسور.'
                    : 'Unbounded cognitive core engineered for comprehensive command execution, rigorous engineering, mathematics, deep reasoning, and autonomous problem solving.'}
                </p>
              </div>

              {/* Quick Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl pt-2">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(qp.prompt)}
                    className="flex flex-col items-start p-3.5 rounded-xl border border-slate-800 bg-[#0d1424]/60 hover:border-cyan-500/40 hover:bg-[#121c33] transition-all text-right group"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{qp.label}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {qp.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render Message List */}
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const isSpeaking = speakingMessageId === message.id;

            return (
              <div
                key={message.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                    isUser
                      ? 'bg-slate-800 text-slate-300 border border-slate-700'
                      : 'bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                  }`}
                >
                  {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>

                {/* Message Body */}
                <div
                  className={`flex flex-col max-w-[88%] sm:max-w-[82%] space-y-1.5 ${
                    isUser ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Sender label & actions */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                    <span className="font-semibold text-slate-300">
                      {isUser ? (isFa ? 'شما (فرمانده)' : 'Commander') : 'NEXUS SOVEREIGN'}
                    </span>
                    {!isUser && (
                      <span className="rounded bg-cyan-500/10 px-1.5 py-0.2 text-[9px] font-mono text-cyan-400 border border-cyan-500/20">
                        HIGH INTELLECT
                      </span>
                    )}
                    <span>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Bubble Container */}
                  <div
                    className={`rounded-2xl p-4 sm:p-5 shadow-lg ${
                      isUser
                        ? 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tr-none'
                        : 'glass-panel text-slate-100 rounded-tl-none border-cyan-500/20'
                    }`}
                  >
                    {/* Thinking stream / Chain of thought */}
                    {message.thinking && (
                      <div className="mb-3 rounded-xl border border-cyan-500/20 bg-[#080d18] p-3 text-xs">
                        <button
                          onClick={() =>
                            setExpandedThinking((prev) => ({
                              ...prev,
                              [message.id]: !prev[message.id],
                            }))
                          }
                          className="flex w-full items-center justify-between text-cyan-300 hover:text-cyan-200"
                        >
                          <span className="flex items-center gap-1.5 font-semibold">
                            <Cpu className="h-3.5 w-3.5" />
                            {isFa ? 'زنجیره تفکر و استدلال شناختی' : 'Cognitive Reasoning Trace'}
                          </span>
                          {expandedThinking[message.id] ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                        {expandedThinking[message.id] && (
                          <div className="mt-2 border-t border-cyan-500/10 pt-2 font-mono text-[11px] leading-relaxed text-slate-400 whitespace-pre-wrap">
                            {message.thinking}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Main Text Content */}
                    {isUser ? (
                      <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                        {message.text}
                      </div>
                    ) : (
                      <div>
                        <MarkdownRenderer
                          content={message.text}
                          onRunCode={onRunCode}
                          lang={lang}
                        />
                        {message.isStreaming && (
                          <span className="inline-block h-4 w-1.5 ml-1 animate-pulse bg-cyan-400 align-middle" />
                        )}
                      </div>
                    )}

                    {/* Grounding Web Sources if available */}
                    {message.groundingMetadata?.groundingChunks &&
                      message.groundingMetadata.groundingChunks.length > 0 && (
                        <div className="mt-4 border-t border-cyan-500/15 pt-3">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 mb-2">
                            <Globe className="h-3.5 w-3.5" />
                            <span>{isFa ? 'منابع وب استناد شده:' : 'Grounded Web Sources:'}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {message.groundingMetadata.groundingChunks
                              .filter((c) => c.web?.uri)
                              .slice(0, 4)
                              .map((c, idx) => (
                                <a
                                  key={idx}
                                  href={c.web?.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#070b14] px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                                >
                                  <Globe className="h-3 w-3 text-cyan-400" />
                                  <span className="max-w-[140px] truncate">
                                    {c.web?.title || c.web?.uri}
                                  </span>
                                </a>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Action Bar for AI message */}
                  {!isUser && !message.isStreaming && (
                    <div className="flex items-center gap-2 px-1 text-slate-400">
                      <button
                        onClick={() => handleCopy(message.text, message.id)}
                        className="flex items-center gap-1 rounded p-1 text-xs hover:text-cyan-300 transition-colors"
                        title={isFa ? 'کپی متن پاسخ' : 'Copy response'}
                      >
                        {copiedId === message.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleSpeak(message.text, message.id)}
                        className="flex items-center gap-1 rounded p-1 text-xs hover:text-cyan-300 transition-colors"
                        title={
                          isSpeaking
                            ? (isFa ? 'توقف خواندن' : 'Stop voice')
                            : (isFa ? 'شنیدن صوتی پاسخ' : 'Read aloud')
                        }
                      >
                        {isSpeaking ? (
                          <VolumeX className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                        ) : (
                          <Volume2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar Area */}
      <div className="border-t border-cyan-500/20 bg-[#080d18]/95 p-3 sm:p-4 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl space-y-2">
          
          {/* Quick tool toggles */}
          <div className="flex items-center justify-between text-xs px-1 text-slate-400">
            <button
              type="button"
              onClick={onToggleSearch}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border transition-colors ${
                enableSearch
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{isFa ? 'جستجوی زنده وب:' : 'Web Grounding:'} {enableSearch ? (isFa ? 'روشن' : 'ON') : (isFa ? 'خاموش' : 'OFF')}</span>
            </button>

            <span className="text-[11px] text-slate-500 hidden sm:inline">
              {isFa ? 'Shift + Enter برای خط جدید | Enter برای ارسال' : 'Shift + Enter for newline | Enter to send'}
            </span>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 rounded-2xl border border-cyan-500/30 bg-[#0b101d] p-2 shadow-inner focus-within:border-cyan-400 transition-colors"
          >
            {/* Mic speech recognition button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`rounded-xl p-2.5 transition-colors ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-cyan-300'
              }`}
              title={isFa ? 'ورودی گفتاری (میکروفون)' : 'Voice input'}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            {/* Input textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isFa
                  ? 'دستور، سوال، معماری یا مسئله پیچیده خود را بنویسید...'
                  : 'Enter your command, technical query, algorithm or problem...'
              }
              className="flex-1 max-h-44 resize-none bg-transparent px-2 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none leading-relaxed"
            />

            {/* Send or Stop button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors"
                title={isFa ? 'توقف تولید' : 'Stop generation'}
              >
                <Square className="h-4 w-4 fill-rose-300" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title={isFa ? 'ارسال دستور' : 'Send command'}
              >
                <Send className={`h-4 w-4 ${isFa ? 'rotate-180' : ''}`} />
              </button>
            )}
          </form>

        </div>
      </div>
    </div>
  );
};
