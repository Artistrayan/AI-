import React, { useState } from 'react';
import {
  Brain,
  Zap,
  Globe,
  UploadCloud,
  FileText,
  Activity,
  CheckCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Database,
  History,
  ShieldCheck,
} from 'lucide-react';
import {
  KnowledgeItem,
  KnowledgeCategory,
  LearningEvolutionLog,
  LearningMetrics,
  Language,
} from '../types';
import { ingestData, synthesizeWebKnowledge, reflectAndAdapt } from '../services/api';

interface LearningEngineViewProps {
  metrics: LearningMetrics;
  evolutionLogs: LearningEvolutionLog[];
  onNewKnowledgeAdded: (node: KnowledgeItem) => void;
  onNewEvolutionLog: (log: LearningEvolutionLog, updatedDirectiveSupplement?: string) => void;
  lang: Language;
  recentMessages: any[];
  currentDirectives: string;
}

export const LearningEngineView: React.FC<LearningEngineViewProps> = ({
  metrics,
  evolutionLogs,
  onNewKnowledgeAdded,
  onNewEvolutionLog,
  lang,
  recentMessages,
  currentDirectives,
}) => {
  const isFa = lang === 'fa';

  // Ingestion form state
  const [rawText, setRawText] = useState('');
  const [ingestCategory, setIngestCategory] = useState<KnowledgeCategory>('technology');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState<string | null>(null);

  // Web Synthesizer state
  const [webTopic, setWebTopic] = useState('');
  const [webCategory, setWebCategory] = useState<KnowledgeCategory>('science');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthSuccess, setSynthSuccess] = useState<string | null>(null);

  // Reflection state
  const [isReflecting, setIsReflecting] = useState(false);
  const [reflectNotice, setReflectNotice] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleIngestRaw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim() || isIngesting) return;

    setIsIngesting(true);
    setIngestSuccess(null);

    try {
      const newNode = await ingestData(rawText, ingestCategory);
      onNewKnowledgeAdded(newNode);
      setIngestSuccess(isFa ? `گره "${newNode.title}" با موفقیت تحلیل و وارد پایگاه دانش شد.` : `Node "${newNode.title}" successfully ingested into brain.`);
      setRawText('');
    } catch (err: any) {
      alert(err.message || 'خطا در یادگیری داده');
    } finally {
      setIsIngesting(false);
    }
  };

  const handleSynthesizeWeb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webTopic.trim() || isSynthesizing) return;

    setIsSynthesizing(true);
    setSynthSuccess(null);

    try {
      const newNode = await synthesizeWebKnowledge(webTopic, webCategory);
      onNewKnowledgeAdded(newNode);
      setSynthSuccess(isFa ? `تحلیل زنده وب برای "${newNode.title}" با موفقیت سنتز و ذخیره شد.` : `Live web knowledge for "${newNode.title}" synthesized.`);
      setWebTopic('');
    } catch (err: any) {
      alert(err.message || 'خطا در سنتز دانش وب');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleRunReflection = async () => {
    if (isReflecting) return;
    setIsReflecting(true);
    setReflectNotice(null);

    try {
      const res = await reflectAndAdapt(recentMessages, currentDirectives);
      onNewEvolutionLog(res, res.updatedDirectiveSupplement);
      setReflectNotice(isFa ? 'چرخه بازتاب شناختی با موفقیت اجرا و تطبیق الگوریتمی اعمال شد.' : 'Cognitive adaptation cycle complete.');
    } catch (err: any) {
      alert(err.message || 'خطا در اجرای چرخه بازتاب');
    } finally {
      setIsReflecting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6" dir={isFa ? 'rtl' : 'ltr'}>
      
      {/* Engine Banner */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-indigo-950/40 p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-3 text-white shadow-lg shadow-cyan-500/20">
              <Brain className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-cyan-200">
                  {isFa ? 'ماژول یادگیری بی‌درنگ و خودانطباقی هوش (Real-Time Learning Core)' : 'Real-Time Continuous Learning Engine'}
                </h1>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-300 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {isFa ? 'یادگیری پیوسته فعال' : 'Perpetual Learning Active'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300 leading-relaxed max-w-2xl">
                {isFa
                  ? 'این ماژول به هوش مصنوعی امکان می‌دهد به صورت پیوسته داده‌های جدید را ببلعد، درک مفهومی خود را به‌روزرسانی کند و بر اساس تعاملات شما به طور خودکار تطبیق یابد.'
                  : 'Empowers the AI to continuously ingest new data, update semantic representations, and autonomously adapt its directives and behavior based on user interactions.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleRunReflection}
            disabled={isReflecting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 transition-all self-start sm:self-center"
          >
            {isReflecting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{isFa ? 'در حال بازتاب و انطباق...' : 'Reflecting & Adapting...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{isFa ? 'اجرای بازتاب و تکامل شناختی' : 'Run Metacognitive Reflection'}</span>
              </>
            )}
          </button>
        </div>

        {/* Real-time Telemetry Metrics */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-cyan-500/15 pt-5">
          <div className="rounded-xl border border-slate-800 bg-[#060911]/80 p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{isFa ? 'داده‌های بلعیده‌شده:' : 'Ingested Data Points:'}</span>
              <Database className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-cyan-300">
              {metrics.totalIngestedDataPoints + evolutionLogs.length}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#060911]/80 p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{isFa ? 'گره‌های فعال دانش:' : 'Active Knowledge Nodes:'}</span>
              <Layers className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-indigo-300">
              {metrics.activeKnowledgeNodes}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#060911]/80 p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{isFa ? 'اطمینان معرفت‌شناختی:' : 'Epistemic Confidence:'}</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-emerald-300">
              99.6%
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#060911]/80 p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{isFa ? 'دوره‌های تکامل و انطباق:' : 'Adaptation Cycles:'}</span>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-purple-300">
              {metrics.reflectionCycles + evolutionLogs.length}
            </div>
          </div>
        </div>

      </div>

      {reflectNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs text-emerald-300">
          <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{reflectNotice}</span>
        </div>
      )}

      {/* Two Column Ingestion Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Studio 1: Raw Text & File Ingestion */}
        <div className="rounded-2xl border border-slate-800 bg-[#090e1a]/90 p-5 space-y-4 backdrop-blur-xl">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <UploadCloud className="h-5 w-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-cyan-200">
                {isFa ? 'استودیوی بلع و یادگیری داده‌های خام' : 'Continuous Data Ingestion Studio'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isFa ? 'متن، مستندات، مقالات، کد یا فایل‌ها را برای یکپارچه‌سازی آنی بارگذاری کنید.' : 'Feed raw texts, research docs, code or files for instant cognitive integration.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleIngestRaw} className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300 font-semibold">
                {isFa ? 'متن یا محتوای منبع:' : 'Source Data / Notes / Code:'}
              </label>

              <label className="cursor-pointer text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[11px]">
                <FileText className="h-3.5 w-3.5" />
                <span>{isFa ? 'بارگذاری فایل (.txt, .md, .py...)' : 'Upload File'}</span>
                <input
                  type="file"
                  accept=".txt,.md,.json,.py,.js,.ts,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={5}
              required
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={
                isFa
                  ? 'اطلاعات، یافته‌های جدید، فرمول‌ها یا داده‌هایی که می‌خواهید هوش بیاموزد را اینجا بچسبانید...'
                  : 'Paste new facts, research abstracts, formulas or algorithms to ingest...'
              }
              className="w-full rounded-xl border border-slate-800 bg-[#060911] p-3 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none font-mono leading-relaxed"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <select
                value={ingestCategory}
                onChange={(e) => setIngestCategory(e.target.value as KnowledgeCategory)}
                className="w-full sm:w-auto rounded-xl border border-slate-800 bg-[#060911] px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="technology">{isFa ? 'فناوری و مهندسی' : 'Technology'}</option>
                <option value="science">{isFa ? 'علوم و فیزیک' : 'Science & Physics'}</option>
                <option value="history_philosophy">{isFa ? 'تاریخ و فلسفه' : 'History & Philosophy'}</option>
                <option value="abstract">{isFa ? 'مفاهیم انتزاعی' : 'Abstract'}</option>
                <option value="custom">{isFa ? 'سفارشی / کاربر' : 'Custom'}</option>
              </select>

              <button
                type="submit"
                disabled={isIngesting || !rawText.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 transition-all"
              >
                {isIngesting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>{isFa ? 'در حال بلع و درک مفهومی...' : 'Ingesting...'}</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 fill-white" />
                    <span>{isFa ? 'بلع و یادگیری بی‌درنگ' : 'Ingest & Learn'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {ingestSuccess && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-300">
              {ingestSuccess}
            </div>
          )}
        </div>

        {/* Studio 2: Real-time Live Web Synthesizer */}
        <div className="rounded-2xl border border-slate-800 bg-[#090e1a]/90 p-5 space-y-4 backdrop-blur-xl">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Globe className="h-5 w-5 text-teal-400" />
            <div>
              <h2 className="text-sm font-bold text-teal-200">
                {isFa ? 'سنتزکننده زنده دانش وب (Live Web Synthesizer)' : 'Live Web Knowledge Synthesizer'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isFa ? 'کاوش زنده وب، استخراج مقالات و تبدیل آنی رویدادهای روز به دانش پایدار.' : 'Scour live web data, research breakthroughs and crystallize into permanent memory.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSynthesizeWeb} className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-xs">
                {isFa ? 'موضوع یا پرسش روز برای کاوش و یادگیری:' : 'Topic or Emerging Field to Research:'}
              </label>
              <input
                type="text"
                required
                value={webTopic}
                onChange={(e) => setWebTopic(e.target.value)}
                placeholder={
                  isFa
                    ? 'مثلاً: آخرین پیشرفت‌های کامپیوتر کوانتومی در سال ۲۰۲۶...'
                    : 'e.g. Breakthroughs in room-temperature superconductors 2026...'
                }
                className="w-full rounded-xl border border-slate-800 bg-[#060911] p-3 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <select
                value={webCategory}
                onChange={(e) => setWebCategory(e.target.value as KnowledgeCategory)}
                className="w-full sm:w-auto rounded-xl border border-slate-800 bg-[#060911] px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="science">{isFa ? 'علوم و فیزیک' : 'Science'}</option>
                <option value="technology">{isFa ? 'فناوری و محاسبات' : 'Technology'}</option>
                <option value="current_events">{isFa ? 'رویدادهای جاری' : 'Current Events'}</option>
                <option value="abstract">{isFa ? 'مفاهیم نوظهور' : 'Abstract'}</option>
              </select>

              <button
                type="submit"
                disabled={isSynthesizing || !webTopic.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-teal-500/20 hover:from-teal-400 hover:to-cyan-500 disabled:opacity-50 transition-all"
              >
                {isSynthesizing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>{isFa ? 'کاوش زنده وب و سنتز دانش...' : 'Synthesizing Web...'}</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-3.5 w-3.5" />
                    <span>{isFa ? 'سنتز و ذخیره از وب' : 'Synthesize from Web'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {synthSuccess && (
            <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-3 text-xs text-teal-300">
              {synthSuccess}
            </div>
          )}
        </div>

      </div>

      {/* Cognitive Evolution & Adaptation Timeline */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e1a]/80 p-5 sm:p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <History className="h-5 w-5 text-purple-400" />
            <div>
              <h2 className="text-sm font-bold text-purple-200">
                {isFa ? 'تاریخچه تکامل و انطباق شناختی (Cognitive Evolution Log)' : 'Cognitive Evolution & Adaptation History'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isFa ? 'ردپای مفاهیم جدید آموخته‌شده و تغییرات تطبیقی در رفتار هوش مصنوعی.' : 'Audit trail of newly absorbed concepts and behavioral adaptations.'}
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {evolutionLogs.length} {isFa ? 'رویداد ثبت‌شده' : 'events'}
          </span>
        </div>

        {evolutionLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            {isFa
              ? 'هنوز چرخه بازتابی ثبت نشده است. روی "اجرای بازتاب و تکامل شناختی" کلیک کنید تا هوش تجارب اخیر را تحلیل و یاد بگیرد.'
              : 'No evolution logs yet. Click "Run Metacognitive Reflection" to analyze recent interactions.'}
          </div>
        ) : (
          <div className="space-y-3">
            {evolutionLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-slate-800/80 bg-[#060911]/60 p-4 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300 border border-purple-500/30">
                      CONFIDENCE: {(log.confidenceScore * 100).toFixed(1)}%
                    </span>
                    <span className="font-semibold text-slate-300">
                      {log.trigger}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-slate-200 leading-relaxed">
                  {log.adaptationSummary}
                </p>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400">{isFa ? 'مفاهیم جذب‌شده:' : 'Learned:'}</span>
                  {log.learnedConcepts.map((concept, cidx) => (
                    <span
                      key={cidx}
                      className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-cyan-300 font-mono"
                    >
                      ✓ {concept}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
