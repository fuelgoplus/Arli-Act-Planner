import React, { useState, useMemo } from 'react';
import {
  X,
  History,
  Plus,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  FileEdit,
  Users,
  Flag,
  Trash2,
  Copy,
  Check,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react';
import { PhaseSection, PhaseHistoryEntry, PhaseLogCategory, TaskItem } from '../types';
import { useApp } from '../context/AppContext';

interface PhaseTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: PhaseSection;
  tasks: TaskItem[];
}

const CATEGORY_CONFIG: Record<
  PhaseLogCategory,
  { label: string; bg: string; text: string; border: string; icon: React.FC<{ className?: string }> }
> = {
  change_log: {
    label: '變更記錄',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: FileEdit,
  },
  milestone: {
    label: '里程碑',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: Flag,
  },
  decision: {
    label: '重大決策',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: CheckCircle2,
  },
  issue: {
    label: '議題/風險',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: AlertTriangle,
  },
  meeting: {
    label: '會議/對齊',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    icon: Users,
  },
};

export const PhaseTrackerModal: React.FC<PhaseTrackerModalProps> = ({
  isOpen,
  onClose,
  phase,
  tasks,
}) => {
  const { currentUser, addPhaseLogEntry, deletePhaseLogEntry } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PhaseLogCategory>('change_log');
  const [newImpact, setNewImpact] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskId, setNewTaskId] = useState<string>('');
  const [newTimestamp, setNewTimestamp] = useState<string>(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [newDetails, setNewDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const logs: PhaseHistoryEntry[] = phase.historyLogs || [];

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (activeCategoryFilter !== 'all' && log.category !== activeCategoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = log.title.toLowerCase().includes(q);
        const matchDetails = log.details.toLowerCase().includes(q);
        const matchAuthor = log.authorName.toLowerCase().includes(q);
        const matchTask = log.taskCode ? log.taskCode.toLowerCase().includes(q) : false;
        return matchTitle || matchDetails || matchAuthor || matchTask;
      }
      return true;
    });
  }, [logs, activeCategoryFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: logs.length,
      changeLogs: logs.filter((l) => l.category === 'change_log').length,
      milestones: logs.filter((l) => l.category === 'milestone').length,
      decisions: logs.filter((l) => l.category === 'decision').length,
      issues: logs.filter((l) => l.category === 'issue').length,
      meetings: logs.filter((l) => l.category === 'meeting').length,
    };
  }, [logs]);

  if (!isOpen) return null;

  const handleSubmitNewLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDetails.trim()) {
      return;
    }

    setSubmitting(true);
    const relatedTask = tasks.find((t) => t.id === newTaskId);

    addPhaseLogEntry(phase.id, {
      phaseId: phase.id,
      timestamp: newTimestamp,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorEmail: currentUser.email,
      category: newCategory,
      title: newTitle.trim(),
      details: newDetails.trim(),
      impactLevel: newImpact,
      taskId: newTaskId || undefined,
      taskCode: relatedTask ? relatedTask.code : undefined,
    });

    setNewTitle('');
    setNewDetails('');
    setNewTaskId('');
    setShowAddForm(false);
    setSubmitting(false);
  };

  const handleCopySummary = () => {
    const summaryLines = [
      `【${phase.code} ${phase.name}】事件歷程與變更紀錄 (Tracker)`,
      `執行期間：${phase.timePeriod || '未設定'}`,
      `總記錄筆數：${logs.length} 筆 (里程碑: ${stats.milestones}, 決策: ${stats.decisions}, 變更: ${stats.changeLogs}, 議題: ${stats.issues})`,
      '--------------------------------------------------',
      ...logs.map(
        (l, i) =>
          `${i + 1}. [${CATEGORY_CONFIG[l.category]?.label || l.category}] ${l.title} (${l.timestamp} by ${l.authorName})\n   說明：${l.details}${l.taskCode ? ` [關聯工作：${l.taskCode}]` : ''}`
      ),
    ].join('\n\n');

    navigator.clipboard.writeText(summaryLines);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tracker-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
              <History className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {phase.code}
                </span>
                <h2 id="tracker-modal-title" className="text-base sm:text-lg font-bold text-white">
                  {phase.name} · Tracker
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {phase.subtitle} · 執行時程：<span className="font-mono text-indigo-200 font-medium">{phase.timePeriod || '未設定'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              title="複製此階段全部歷程文字摘要"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">已複製</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">複製摘要</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="關閉"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stat Ribbon */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap text-xs shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <span className="text-slate-500 font-medium">歷程統計：</span>
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              全部 {stats.total}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              變更記錄 {stats.changeLogs}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              里程碑 {stats.milestones}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-purple-700">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              決策 {stats.decisions}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              議題 {stats.issues}
            </span>
          </div>

          {currentUser.canEdit && (
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? '收合表記' : '登記新歷程 / 變更'}</span>
            </button>
          )}
        </div>

        {/* Scrollable Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* New Entry Form */}
          {showAddForm && currentUser.canEdit && (
            <form
              onSubmit={handleSubmitNewLog}
              className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4.5 space-y-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>記錄新事件歷程 / 變更說明</span>
                </div>
                <span className="text-xs text-indigo-600 font-medium">
                  登記人：{currentUser.name} ({currentUser.role})
                </span>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  紀錄類型 (Category)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(
                    ['change_log', 'milestone', 'decision', 'issue', 'meeting'] as PhaseLogCategory[]
                  ).map((cat) => {
                    const cfg = CATEGORY_CONFIG[cat];
                    const Icon = cfg.icon;
                    const isSelected = newCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewCategory(cat)}
                        className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          isSelected
                            ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-indigo-400/50 shadow-xs`
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Impact & Task Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    事件 / 變更主旨 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="例如：尾牙摸彩獎品級距由財委會拍板定案"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    影響層級 (Impact)
                  </label>
                  <select
                    value={newImpact}
                    onChange={(e) => setNewImpact(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full text-xs px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="low">一般 (Low)</option>
                    <option value="medium">中度 (Medium)</option>
                    <option value="high">重大 / 關鍵 (High)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    關聯工作項目 (可選)
                  </label>
                  <select
                    value={newTaskId}
                    onChange={(e) => setNewTaskId(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">全階段共通 / 無特定單一工作</option>
                    {tasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.code} · {task.title.slice(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    記錄時間 (Timestamp)
                  </label>
                  <input
                    type="text"
                    value={newTimestamp}
                    onChange={(e) => setNewTimestamp(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm"
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  詳細歷程說明與變更依據 <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="詳述討論結論、修訂前後差異、外部廠商回覆，或相關會議決議要點..."
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newTitle.trim() || !newDetails.trim()}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors shadow-2xs"
                >
                  確認記錄並發布通知
                </button>
              </div>
            </form>
          )}

          {/* Search & Category Filter Toolbar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" />
                篩選：
              </span>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  activeCategoryFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                全部 ({logs.length})
              </button>
              {(
                ['change_log', 'milestone', 'decision', 'issue', 'meeting'] as PhaseLogCategory[]
              ).map((cat) => {
                const count = logs.filter((l) => l.category === cat).length;
                const cfg = CATEGORY_CONFIG[cat];
                const isSelected = activeCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                      isSelected
                        ? `${cfg.bg} ${cfg.text} ${cfg.border} font-semibold`
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cfg.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Keyword search input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋歷程關鍵字..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Timeline List */}
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">查無符合條件的歷程或變更紀錄</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {logs.length === 0
                  ? '目前尚未記錄任何事件，點擊上方「登記新歷程 / 變更」以建立本階段的歷史軌跡。'
                  : '請嘗試清除篩選條件或搜尋關鍵字。'}
              </p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {filteredLogs.map((log) => {
                const cfg = CATEGORY_CONFIG[log.category] || CATEGORY_CONFIG.change_log;
                const Icon = cfg.icon;

                return (
                  <div key={log.id} className="relative group">
                    {/* Timeline Dot */}
                    <div
                      className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${cfg.bg} ${cfg.text} ring-1 ${cfg.border}`}
                    >
                      <Icon className="w-2.5 h-2.5" />
                    </div>

                    {/* Entry Card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all">
                      {/* Entry Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border} flex items-center gap-1`}
                            >
                              <Icon className="w-3 h-3" />
                              {cfg.label}
                            </span>

                            {log.impactLevel === 'high' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                重大
                              </span>
                            )}

                            {log.taskCode && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                任務：{log.taskCode}
                              </span>
                            )}

                            <h4 className="text-sm font-bold text-slate-900">{log.title}</h4>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-mono">{log.timestamp}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{log.authorName}</span>
                              {log.authorRole && (
                                <span className="text-[10px] text-slate-400">({log.authorRole})</span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Delete entry (if authorized) */}
                        {currentUser.canEdit && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`確定要刪除「${log.title}」這筆紀錄嗎？`)) {
                                deletePhaseLogEntry(phase.id, log.id);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-all"
                            title="刪除此紀錄"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Entry Details */}
                      <p className="text-xs text-slate-700 mt-2.5 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100 whitespace-pre-line">
                        {log.details}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            共 <strong className="text-slate-800">{filteredLogs.length}</strong> 筆顯示於本階段 Tracker 歷程
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
