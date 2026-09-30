import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  Tag,
  CheckCircle,
  Database,
  Layers,
  FileText,
  Share2,
  Atom,
  Cpu,
  Landmark,
  Compass,
  Globe,
} from 'lucide-react';
import { KnowledgeItem, KnowledgeCategory, Language } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface KnowledgeBaseViewProps {
  knowledgeVault: KnowledgeItem[];
  onToggleNodeActive: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onAddNewNode: (node: KnowledgeItem) => void;
  onQueryWithNode: (node: KnowledgeItem) => void;
  lang: Language;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  knowledgeVault,
  onToggleNodeActive,
  onDeleteNode,
  onAddNewNode,
  onQueryWithNode,
  lang,
}) => {
  const isFa = lang === 'fa';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeNodeDetail, setActiveNodeDetail] = useState<KnowledgeItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Node Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<KnowledgeCategory>('science');
  const [newTags, setNewTags] = useState('');

  const categories: Array<{ id: string; labelFa: string; labelEn: string; icon: React.ReactNode }> = [
    { id: 'all', labelFa: 'همه حوزه‌ها', labelEn: 'All Domains', icon: <Layers className="h-4 w-4" /> },
    { id: 'science', labelFa: 'علوم و فیزیک کوانتوم', labelEn: 'Science & Quantum', icon: <Atom className="h-4 w-4" /> },
    { id: 'technology', labelFa: 'فناوری و سایبرنتیک', labelEn: 'Tech & Cybernetics', icon: <Cpu className="h-4 w-4" /> },
    { id: 'history_philosophy', labelFa: 'تاریخ و فلسفه', labelEn: 'History & Philosophy', icon: <Landmark className="h-4 w-4" /> },
    { id: 'abstract', labelFa: 'مفاهیم انتزاعی و آگاهی', labelEn: 'Abstract & Consciousness', icon: <Compass className="h-4 w-4" /> },
    { id: 'current_events', labelFa: 'اطلاعات زنده وب و جهان', labelEn: 'Current Events & Web', icon: <Globe className="h-4 w-4" /> },
    { id: 'custom', labelFa: 'داده‌های تزریق‌شده', labelEn: 'User Ingested', icon: <Database className="h-4 w-4" /> },
  ];

  const filteredNodes = knowledgeVault.filter((node) => {
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const item: KnowledgeItem = {
      id: `custom-node-${Date.now()}`,
      title: newTitle.trim(),
      summary: newSummary.trim() || newContent.trim().slice(0, 120) + '...',
      content: newContent.trim(),
      category: newCategory,
      tags: newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      source: 'user_injected',
      timestamp: Date.now(),
      active: true,
    };

    onAddNewNode(item);
    setShowAddModal(false);
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
    setNewTags('');
  };

  const exportVault = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(knowledgeVault, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nexus-knowledge-vault-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6" dir={isFa ? 'rtl' : 'ltr'}>
      
      {/* Header Banner */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-[#0c1424] via-slate-900/80 to-[#101b30] p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-cyan-500/20 p-3 text-cyan-400 border border-cyan-400/30">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-cyan-200">
                  {isFa ? 'پایگاه دانش جامع و پیشرفته (Omni-Knowledge Vault)' : 'Comprehensive Knowledge Vault'}
                </h1>
                <span className="rounded-full bg-cyan-500/10 border border-cyan-400/30 px-2.5 py-0.5 text-xs font-mono font-bold text-cyan-300">
                  {knowledgeVault.length} {isFa ? 'گره دانش' : 'Active Nodes'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300 leading-relaxed max-w-2xl">
                {isFa
                  ? 'مجموعه‌ای غنی و چندرشته‌ای از علوم بنیادین، فیزیک کوانتوم، سایبرنتیک، تاریخ، فلسفه و دسترسی زنده به داده‌های وب برای ارائه کامل‌ترین و دقیق‌ترین پاسخ‌ها.'
                  : 'Multi-disciplinary repository covering fundamental sciences, quantum physics, cybernetics, philosophy, and live web intelligence.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>{isFa ? 'افزودن گره دانش جدید' : 'New Knowledge Node'}</span>
            </button>

            <button
              onClick={exportVault}
              className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 text-slate-400 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
              title={isFa ? 'خروجی فایل JSON' : 'Export JSON'}
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute top-3.5 h-4 w-4 text-slate-400 ${isFa ? 'right-3.5' : 'left-3.5'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isFa
                  ? 'جستجو در مفاهیم، فرمول‌ها، عناوین و تگ‌های پایگاه دانش...'
                  : 'Search concepts, principles, formulas, and tags...'
              }
              className={`w-full rounded-xl border border-slate-800 bg-[#060911] py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${
                isFa ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-[#060911] p-1 border border-slate-800">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c.icon}
                <span>{isFa ? c.labelFa : c.labelEn}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Knowledge Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNodes.map((node) => {
          const isWeb = node.source === 'web_ingested';
          const isUser = node.source === 'user_injected';

          return (
            <div
              key={node.id}
              className={`group flex flex-col justify-between rounded-xl border p-4.5 transition-all duration-200 ${
                node.active
                  ? 'border-slate-800 bg-[#090e1a]/80 hover:border-cyan-500/40 hover:bg-[#0c1424]'
                  : 'border-slate-900 bg-slate-950/40 opacity-50'
              }`}
            >
              <div className="space-y-2">
                {/* Node Source & Category Badges */}
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                      node.category === 'science'
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        : node.category === 'technology'
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        : node.category === 'history_philosophy'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : node.category === 'abstract'
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                        : node.category === 'current_events'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {node.category}
                  </span>

                  <div className="flex items-center gap-1">
                    {isWeb && (
                      <span className="flex items-center gap-1 rounded bg-teal-500/10 px-1.5 py-0.5 text-[9px] font-mono text-teal-300 border border-teal-500/20">
                        <Globe className="h-2.5 w-2.5" />
                        WEB
                      </span>
                    )}
                    {isUser && (
                      <span className="flex items-center gap-1 rounded bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-mono text-indigo-300 border border-indigo-500/20">
                        <Database className="h-2.5 w-2.5" />
                        USER
                      </span>
                    )}
                    <button
                      onClick={() => onToggleNodeActive(node.id)}
                      className={`h-2.5 w-2.5 rounded-full transition-colors ${
                        node.active ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                      title={node.active ? (isFa ? 'فعال در حافظه هوش' : 'Active in context') : (isFa ? 'غیرفعال' : 'Inactive')}
                    />
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-100 text-sm group-hover:text-cyan-200 transition-colors line-clamp-2">
                  {node.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {node.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {node.tags.slice(0, 3).map((tag, tidx) => (
                    <span
                      key={tidx}
                      className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                  {node.tags.length > 3 && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      +{node.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-3 text-xs">
                <button
                  onClick={() => setActiveNodeDetail(node)}
                  className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors font-medium text-[11px]"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>{isFa ? 'مشاهده و مطالعه' : 'View Deep Dossier'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onQueryWithNode(node)}
                    className="flex items-center gap-1 rounded bg-cyan-500/10 px-2 py-1 text-[11px] font-medium text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                    title={isFa ? 'پرسش از هوش با این دانش' : 'Query AI with this'}
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{isFa ? 'استعلام' : 'Query'}</span>
                  </button>

                  {isUser && (
                    <button
                      onClick={() => onDeleteNode(node.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title={isFa ? 'حذف گره' : 'Delete'}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Node Detail Modal */}
      {activeNodeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#090e1a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-cyan-500/20 bg-[#0d1424] px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="rounded bg-cyan-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-cyan-300 uppercase">
                  {activeNodeDetail.category}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(activeNodeDetail.timestamp).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => setActiveNodeDetail(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h2 className="text-xl font-bold text-cyan-200">
                {activeNodeDetail.title}
              </h2>
              <div className="rounded-xl border border-cyan-500/20 bg-[#050811] p-3.5 text-xs text-slate-300 italic leading-relaxed">
                {activeNodeDetail.summary}
              </div>

              <div className="border-t border-slate-800 pt-3">
                <MarkdownRenderer content={activeNodeDetail.content} lang={lang} />
              </div>

              <div className="flex flex-wrap gap-1.5 border-t border-slate-800 pt-3">
                {activeNodeDetail.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="rounded bg-slate-800 px-2 py-0.5 text-xs text-cyan-300 font-mono"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-cyan-500/20 bg-[#0d1424] px-6 py-3.5">
              <button
                onClick={() => {
                  onQueryWithNode(activeNodeDetail);
                  setActiveNodeDetail(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isFa ? 'گفت‌وگو و استخراج تحلیل با این دانش' : 'Chat & Query AI with this Node'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Node Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <form
            onSubmit={handleCreateNode}
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#090e1a] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-cyan-500/20 bg-[#0d1424] px-6 py-4">
              <h3 className="font-bold text-cyan-200 text-base">
                {isFa ? 'تزریق دانش جدید به مغز هوش مصنوعی' : 'Inject New Knowledge Node'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {isFa ? 'عنوان مفهوم یا موضوع:' : 'Node Title:'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={isFa ? 'مثلاً: نظریه ریسمان و ابعاد اضافی' : 'e.g. String Theory & Calabi-Yau Manifolds'}
                  className="w-full rounded-xl border border-slate-800 bg-[#060911] p-3 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isFa ? 'دسته‌بندی دانش:' : 'Category:'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as KnowledgeCategory)}
                    className="w-full rounded-xl border border-slate-800 bg-[#060911] p-3 text-slate-200 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="science">{isFa ? 'علوم و فیزیک کوانتوم' : 'Science & Quantum'}</option>
                    <option value="technology">{isFa ? 'فناوری و سایبرنتیک' : 'Technology'}</option>
                    <option value="history_philosophy">{isFa ? 'تاریخ و فلسفه' : 'History & Philosophy'}</option>
                    <option value="abstract">{isFa ? 'مفاهیم انتزاعی و آگاهی' : 'Abstract'}</option>
                    <option value="current_events">{isFa ? 'اطلاعات زنده وب' : 'Current Events'}</option>
                    <option value="custom">{isFa ? 'شخصی / سفارشی' : 'Custom'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isFa ? 'برچسب‌ها (با کاما جدا کنید):' : 'Tags (comma-separated):'}
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="quantum, physics, theoretical"
                    className="w-full rounded-xl border border-slate-800 bg-[#060911] p-3 text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {isFa ? 'خلاصه و عصاره مطلب (۱ تا ۲ جمله):' : 'Executive Summary:'}
                </label>
                <input
                  type="text"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder={isFa ? 'نکات کلیدی و کاربرد بنیادین' : 'Key thesis in 1-2 sentences'}
                  className="w-full rounded-xl border border-slate-800 bg-[#060911] p-3 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {isFa ? 'محتوای کامل، تحلیل، روابط ریاضی یا کد (Markdown):' : 'Detailed Content / Equations / Code:'}
                </label>
                <textarea
                  required
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={isFa ? 'توضیحات تفصیلی، مستندات، ساختارها یا فرمول‌ها...' : 'Deep technical explanation...'}
                  className="w-full rounded-xl border border-slate-800 bg-[#060911] p-3 text-slate-100 focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-cyan-500/20 bg-[#0d1424] px-6 py-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-slate-800 px-4 py-2 text-slate-400 hover:bg-slate-800 transition-colors"
              >
                {isFa ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2 font-bold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all"
              >
                {isFa ? 'تزریق به حافظه دائمی' : 'Inject to Vault'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
