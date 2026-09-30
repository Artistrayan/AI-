import React, { useState } from 'react';
import {
  Zap,
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Layers,
  Sparkles,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { MissionPlan, MissionPhase, Language } from '../types';
import { decomposeMission } from '../services/api';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MissionPlannerProps {
  lang: Language;
  onExecutePrompt: (prompt: string) => void;
  onRunCode?: (code: string, language: string) => void;
}

export const MissionPlanner: React.FC<MissionPlannerProps> = ({
  lang,
  onExecutePrompt,
  onRunCode,
}) => {
  const isFa = lang === 'fa';
  const [objective, setObjective] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<MissionPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleMissions = isFa
    ? [
        'طراحی و کدنویسی معماری یک موتور هوش مصنوعی مستقل با قابلیت یادگیری خودکار',
        'شبیه‌سازی کامل یک سیستم رمزنگاری کوانتومی مقاوم در برابر حملات',
        'طراحی نقشه راه و اسکریپت‌های اتوماسیون کامل برای راه‌اندازی یک سامانه SaaS',
        'تحلیل فلسفی و علمی نظریه آگاهی مصنوعی و مرزهای هوش خودمختار',
      ]
    : [
        'Architect and implement a self-improving autonomous AI engine',
        'Simulate a quantum-resistant cryptographic key exchange system',
        'Complete end-to-end blueprint and code for an automated micro-SaaS architecture',
        'Deep philosophical and computational analysis of artificial consciousness and sovereignty',
      ];

  const handleDecompose = async (missionText?: string) => {
    const textToRun = missionText || objective;
    if (!textToRun.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const generatedPlan = await decomposeMission(textToRun);
      setPlan(generatedPlan);
    } catch (err: any) {
      setError(err.message || 'خطا در تفکیک مأموریت');
    } finally {
      setLoading(false);
    }
  };

  const handleRunPhase = (phase: MissionPhase) => {
    const directive = isFa
      ? `اجرای گام ${phase.step} از مأموریت "${plan?.missionTitle}":
عنوان مرحله: ${phase.title}
دستور اقدام خودکار: ${phase.action}
ابزارهای مورد استفاده: ${phase.toolsNeeded.join(', ')}
لطفاً این مرحله را با کمال دقت، خروجی کامل و بدون محدودیت یا خلاصه کردن پیاده‌سازی کن.`
      : `Execute Phase ${phase.step} of mission "${plan?.missionTitle}":
Phase Title: ${phase.title}
Action: ${phase.action}
Tools: ${phase.toolsNeeded.join(', ')}
Execute this phase completely with deep production-grade implementation and zero truncation.`;

    onExecutePrompt(directive);
  };

  const handleExecuteAll = () => {
    if (!plan) return;
    const allDirective = isFa
      ? `دستور اجرای جامع تمام فازهای مأموریت خودمختار:
عنوان: ${plan.missionTitle}
خلاصه راهبردی: ${plan.executiveSummary}

فازهای اجرایی:
${plan.phases.map((p) => `${p.step}. ${p.title}: ${p.action}`).join('\n')}

دستور کلیدی:
${plan.directExecutionCommand}

لطفاً این مأموریت را از آغاز تا پایان، به صورت مستقل، با بالاترین سطح هوش و بدون هیچ کاستی یا سانسور اجرا کن.`
      : `Master Autonomous Mission Execution Directive:
Title: ${plan.missionTitle}
Executive Summary: ${plan.executiveSummary}

Phases:
${plan.phases.map((p) => `${p.step}. ${p.title}: ${p.action}`).join('\n')}

Key Command:
${plan.directExecutionCommand}

Execute this sovereign mission from start to finish at maximum cognitive capability with zero truncation.`;

    onExecutePrompt(allDirective);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      {/* Intro Banner */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-indigo-950/40 p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-cyan-500/20 p-3 text-cyan-400 border border-cyan-400/30">
            <Zap className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-cyan-200">
              {isFa ? 'مرکز مأموریت‌های خودمختار (Autonomous Agent Mission Core)' : 'Autonomous Mission Operations Hub'}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isFa
                ? 'هر هدف پیچیده، نرم‌افزاری، علمی یا استراتژیک را مشخص کنید تا هوش حاکم نکسوس آن را به مراحل راهبردی تفکیک کرده و گام به گام بدون محدودیت اجرا کند.'
                : 'Define any complex, technical, or strategic objective. NEXUS Sovereign will decompose it into autonomous execution vectors and resolve each phase.'}
            </p>
          </div>
        </div>

        {/* Input box */}
        <div className="mt-5 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDecompose()}
              placeholder={
                isFa
                  ? 'مأموریت بزرگ یا هدف خود را بنویسید (مثلاً: نوشتن سیستم تحلیل خودکار و کد کامل)...'
                  : 'Enter your grand objective or mission (e.g. Build an autonomous multi-agent backend)...'
              }
              className="flex-1 rounded-xl border border-cyan-500/30 bg-[#090d16] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <button
              onClick={() => handleDecompose()}
              disabled={loading || !objective.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{isFa ? 'در حال تفکیک شناختی...' : 'Decomposing...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{isFa ? 'تفکیک خودکار مأموریت' : 'Decompose Objective'}</span>
                </>
              )}
            </button>
          </div>

          {/* Preset mission chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Layers className="h-3 w-3 text-cyan-400" />
              {isFa ? 'مأموریت‌های پیشنهادی:' : 'Suggested missions:'}
            </span>
            {sampleMissions.map((sample, i) => (
              <button
                key={i}
                onClick={() => {
                  setObjective(sample);
                  handleDecompose(sample);
                }}
                className="rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors text-right"
              >
                {sample.length > 50 ? sample.slice(0, 50) + '...' : sample}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-300">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Plan Display */}
      {plan && (
        <div className="space-y-5 rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-6 backdrop-blur-xl">
          {/* Plan Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="inline-block rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-400/30">
                {plan.estimatedComplexity} Complexity
              </span>
              <h3 className="mt-1 text-xl font-extrabold text-cyan-200">
                {plan.missionTitle}
              </h3>
              <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                {plan.executiveSummary}
              </p>
            </div>

            <button
              onClick={handleExecuteAll}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition-all"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>{isFa ? 'اجرای کل مأموریت در چت' : 'Execute Full Mission'}</span>
            </button>
          </div>

          {/* Obstacles & Safeguards */}
          {plan.potentialObstacles && plan.potentialObstacles.length > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3.5 text-xs text-amber-200">
              <div className="flex items-center gap-2 font-semibold text-amber-300 mb-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{isFa ? 'چالش‌های فنی و نیازمندی‌ها:' : 'Technical Constraints & Edge Cases:'}</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-amber-200/80">
                {plan.potentialObstacles.map((obs, idx) => (
                  <li key={idx}>{obs}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Phase Steps Grid */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              {isFa ? 'فازهای عملیاتی تفکیک‌شده:' : 'Decomposed Execution Phases:'}
            </h4>

            {plan.phases.map((phase) => (
              <div
                key={phase.step}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 p-4 hover:border-cyan-500/40 hover:bg-[#0c1424] transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300">
                    {phase.step}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">
                        {phase.title}
                      </span>
                      <div className="flex gap-1">
                        {phase.toolsNeeded.map((t, tidx) => (
                          <span
                            key={tidx}
                            className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {phase.action}
                    </p>
                    <p className="text-[11px] text-slate-400 italic">
                      {isFa ? 'منطق گام:' : 'Rationale:'} {phase.rationale}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRunPhase(phase)}
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition-all sm:self-center"
                >
                  <Play className="h-3 w-3 fill-cyan-300" />
                  <span>{isFa ? 'اجرای این فاز' : 'Run Phase'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
