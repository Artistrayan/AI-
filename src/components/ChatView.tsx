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
  MapPin,
  Code2,
  Shield,
  Layers,
  Flame,
  Cpu,
  RefreshCw,
  Radio,
  X,
} from 'lucide-react';
import { Message, Language } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { transcribeAudio } from '../services/api';

interface ChatViewProps {
  messages: Message[];
  isStreaming: boolean;
  onSendMessage: (text: string) => void;
  onStopStreaming: () => void;
  lang: Language;
  onRunCode: (code: string, language: string) => void;
  enableSearch: boolean;
  onToggleSearch: () => void;
  enableMaps: boolean;
  onToggleMaps: () => void;
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
  enableMaps,
  onToggleMaps,
}) => {
  const isFa = lang === 'fa';
  const [input, setInput] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});

  // Audio Recording & Transcription State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

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

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Real Microphone Audio Recording with gemini-3.5-transcribe
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 500) {
          setIsRecording(false);
          return;
        }

        setIsRecording(false);
        setIsTranscribing(true);

        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            if (base64Data) {
              const res = await transcribeAudio(base64Data, 'audio/webm');
              if (res.text) {
                setInput((prev) => (prev ? `${prev} ${res.text}` : res.text));
              }
            }
            setIsTranscribing(false);
          };
        } catch (err: any) {
          console.error('Transcription error:', err);
          alert(err.message || 'خطا در تبدیل صوت به متن');
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      alert(isFa ? 'دسترسی به میکروفون داده نشد یا میکروفون در دسترس نیست.' : 'Microphone access denied.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    audioChunksRef.current = [];
    setIsRecording(false);
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
    const cleanText = text.replace(/```[\s\S]*?```/g, '').replace(/[#*`_~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isFa ? 'fa-IR' : 'en-US';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickPrompts = isFa
    ? [
        { title: 'تحلیل مکان و مسیر با نقشه گوگل', prompt: 'نزدیک‌ترین و بهترین مراکز تحقیقاتی یا دانشگاهی در تهران کجاست و چه امکاناتی دارند؟' },
        { title: 'جستجوی زنده رویدادهای علمی', prompt: 'آخرین اخبار دستاوردهای هوش مصنوعی و رایانش کوانتومی در هفته جاری را با منابع معتبر گزارش کن.' },
        { title: 'معماری و کد سیستم توزیع‌شده', prompt: 'یک الگوریتم اجماع تحمل خطای بیزانس (BFT) بهینه‌شده به همراه کدهای کامل در TypeScript پیاده کن.' },
        { title: 'حل فرمول‌های فیزیک نظری', prompt: 'قضیه بل و نقض نامساوی CHSH را با معادلات مکانیک کوانتومی کامل اثبات کن.' },
      ]
    : [
        { title: 'Location Analysis with Google Maps', prompt: 'Where are the leading AI research laboratories in Silicon Valley and what are their coordinates?' },
        { title: 'Live Scientific Web Grounding', prompt: 'Provide a verified breakdown of this week\'s major breakthroughs in quantum computing and superconductivity with sources.' },
        { title: 'Distributed Systems & Code', prompt: 'Implement a zero-dependency Byzantine Fault Tolerant consensus engine in TypeScript.' },
        { title: 'Theoretical Physics Proofs', prompt: 'Provide a rigorous mathematical derivation of Bell\'s Inequality violation using quantum states.' },
      ];

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full flex-col bg-[#070a12] text-slate-100" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Scrollable Conversation Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-6">
          
          {/* Welcome Screen when Empty */}
          {messages.length === 0 && (
            <div className="py-8 text-center space-y-6">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute -inset-4 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-xl shadow-cyan-500/30">
                  <Cpu className="h-10 w-10 text-white" />
                </div>
              </div>

              <div className="space-y-2 max-w-xl mx-auto">
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300">
                  {isFa ? 'هوش حاکم و خودمختار نکسوس (NEXUS SOVEREIGN)' : 'NEXUS SOVEREIGN UNBOUNDED'}
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {isFa
                    ? 'متصل به داده‌های زنده وب (Google Search)، مکان‌یابی و نقشه‌های گوگل (Google Maps)، پیاده‌سازی صوت (gemini-3.5-transcribe) و پایگاه دانش چندرشته‌ای.'
                    : 'Grounded in live Google Search, Google Maps, voice transcription (gemini-3.5-transcribe), and omni-disciplinary knowledge.'}
                </p>
              </div>

              {/* Quick Launch Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto pt-4 text-left">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(q.prompt)}
                    className="flex flex-col p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 hover:border-cyan-500/50 hover:bg-[#0e1628] transition-all text-right group"
                    dir={isFa ? 'rtl' : 'ltr'}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-xs text-cyan-300 group-hover:text-cyan-200">
                        {q.title}
                      </span>
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {q.prompt}
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
                      <div className="mb-3 rounded-xl border border-cyan-500/20 bg-slate-950/60 p-3 text-xs">
                        <button
                          onClick={() =>
                            setExpandedThinking((prev) => ({
                              ...prev,
                              [message.id]: !prev[message.id],
                            }))
                          }
                          className="flex items-center justify-between w-full font-mono text-cyan-400 hover:text-cyan-300 text-[11px]"
                        >
                          <span className="flex items-center gap-1.5">
                            <Flame className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                            <span>{isFa ? 'زنجیره استدلال شناختی عمیق' : 'Cognitive Reasoning Chain'}</span>
                          </span>
                          {expandedThinking[message.id] ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                        {expandedThinking[message.id] && (
                          <div className="mt-2 text-slate-400 font-mono whitespace-pre-wrap border-t border-slate-800 pt-2 text-[11px] leading-relaxed">
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

                    {/* Grounding Web & Google Maps Sources if available */}
                    {message.groundingMetadata?.groundingChunks &&
                      message.groundingMetadata.groundingChunks.length > 0 && (
                        <div className="mt-4 border-t border-cyan-500/15 pt-3">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 mb-2">
                            <Layers className="h-3.5 w-3.5" />
                            <span>{isFa ? 'منابع اعتبارسنجی (وب و نقشه گوگل):' : 'Grounded Sources (Web & Google Maps):'}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {message.groundingMetadata.groundingChunks.map((c, idx) => {
                              if (c.maps?.uri || c.maps?.title) {
                                return (
                                  <a
                                    key={`map-${idx}`}
                                    href={
                                      c.maps?.uri ||
                                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                        c.maps?.title || ''
                                      )}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1 text-[11px] text-emerald-300 hover:border-emerald-400 hover:bg-emerald-900/40 transition-colors"
                                  >
                                    <MapPin className="h-3 w-3 text-emerald-400" />
                                    <span className="max-w-[160px] truncate">
                                      {c.maps.title || (isFa ? 'مکان نقشه گوگل' : 'Google Maps Location')}
                                    </span>
                                  </a>
                                );
                              }
                              if (c.web?.uri) {
                                return (
                                  <a
                                    key={`web-${idx}`}
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
                                );
                              }
                              return null;
                            })}
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
                        className={`flex items-center gap-1 rounded p-1 text-xs hover:text-cyan-300 transition-colors ${
                          isSpeaking ? 'text-cyan-300' : ''
                        }`}
                        title={
                          isSpeaking
                            ? (isFa ? 'توقف خوانش' : 'Stop reading')
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
          
          {/* Active Audio Recording Banner */}
          {isRecording && (
            <div className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-2.5 text-xs text-rose-200 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold">{isFa ? 'در حال ضبط صدا با میکروفون...' : 'Recording microphone audio...'}</span>
                <span className="font-mono bg-rose-950 px-2 py-0.5 rounded border border-rose-500/30">
                  {formatTimer(recordingSeconds)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={stopRecording}
                  className="rounded-lg bg-rose-500 px-3 py-1 font-bold text-white shadow-md hover:bg-rose-400 transition-colors"
                >
                  {isFa ? 'اتمام و تبدیل به متن (gemini-3.5-transcribe)' : 'Transcribe'}
                </button>
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="rounded-lg p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Transcribing in progress */}
          {isTranscribing && (
            <div className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-4 py-2 text-xs text-cyan-300">
              <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
              <span>{isFa ? 'در حال تبدیل صدا به متن با مدل gemini-3.5-transcribe...' : 'Transcribing audio using model gemini-3.5-transcribe...'}</span>
            </div>
          )}

          {/* Grounding toggles: Google Search & Google Maps */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1 text-slate-400">
            <div className="flex items-center gap-2">
              {/* Google Search Toggle */}
              <button
                type="button"
                onClick={onToggleSearch}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border transition-colors ${
                  enableSearch
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={isFa ? 'استفاده از جستجوی زنده وب با مدل gemini-3.5-flash' : 'Google Search Grounding (gemini-3.5-flash)'}
              >
                <Globe className="h-3.5 w-3.5 text-cyan-400" />
                <span>{isFa ? 'جستجوی زنده وب' : 'Google Search'}: {enableSearch ? (isFa ? 'روشن' : 'ON') : (isFa ? 'خاموش' : 'OFF')}</span>
              </button>

              {/* Google Maps Toggle */}
              <button
                type="button"
                onClick={onToggleMaps}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border transition-colors ${
                  enableMaps
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={isFa ? 'استفاده از داده‌های مکانی نقشه گوگل با مدل gemini-3.5-flash' : 'Google Maps Grounding (gemini-3.5-flash)'}
              >
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                <span>{isFa ? 'نقشه‌های گوگل' : 'Google Maps'}: {enableMaps ? (isFa ? 'روشن' : 'ON') : (isFa ? 'خاموش' : 'OFF')}</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 hidden sm:inline">
              {isFa ? 'Shift + Enter برای خط جدید | Enter برای ارسال' : 'Shift + Enter for newline | Enter to send'}
            </span>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 rounded-2xl border border-cyan-500/30 bg-[#0b101d] p-2 shadow-inner focus-within:border-cyan-400 transition-colors"
          >
            {/* Real Microphone Recording Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              className={`rounded-xl p-2.5 transition-colors ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-cyan-300'
              }`}
              title={isFa ? 'ورودی صوتی با میکروفون (مدل gemini-3.5-transcribe)' : 'Microphone audio input (gemini-3.5-transcribe)'}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
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
                  ? 'دستور، سوال، مکان جغرافیایی یا مسئله پیچیده خود را بنویسید یا با میکروفون بگویید...'
                  : 'Enter your prompt, query, location question or speak with mic...'
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
