import React from 'react';
import { useApp } from '../context/AppContext';
import { CommitteeGroup } from '../types';
import {
  Calendar,
  Search,
  Plus,
  RotateCcw,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ProgressStripProps {
  onOpenAddTaskModal: () => void;
}

export const ProgressStrip: React.FC<ProgressStripProps> = ({ onOpenAddTaskModal }) => {
  const {
    plan,
    progressSummary,
    selectedGroupFilter,
    setSelectedGroupFilter,
    searchQuery,
    setSearchQuery,
    currentUser,
    resetToInitialPlan,
  } = useApp();

  const groups: (CommitteeGroup | 'all')[] = ['all', '行政', '財務', '總務', '活動'];

  // Calculate days until event
  const today = new Date('2026-10-25');
  const target = new Date(plan.eventTargetDate);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Row 1: Event Title, Countdown & Executive Progress */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                {plan.title}
              </h1>
              <span className="text-xs text-slate-500 font-mono">
                {plan.version}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
              <span>召集：{plan.organization}</span>
              <span aria-hidden="true">·</span>
              <span>主委：{plan.chairperson}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-indigo-700 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                預計舉辦日：{plan.eventTargetDate}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <Clock className="w-3.5 h-3.5" />
                倒數 <strong className="font-tabular">{diffDays}</strong> 天
              </span>
            </div>
          </div>

          {/* Overall Completion Progress */}
          <div className="flex items-center gap-6 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5">
            <div className="text-right">
              <div className="text-xs text-slate-500">整體籌辦進度</div>
              <div className="text-xl font-bold text-slate-900 font-tabular">
                {progressSummary.completionRate}%
              </div>
            </div>

            <div className="w-36">
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressSummary.completionRate}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-tabular">
                <span>已完成 {progressSummary.completedTasks}</span>
                <span>全 {progressSummary.totalTasks} 項</span>
              </div>
            </div>

            {/* Department Breakdown Mini-bars */}
            <div className="hidden sm:flex items-center gap-3 border-l border-slate-200 pl-4 text-[11px]">
              {progressSummary.groupStats.map(stat => (
                <div key={stat.group} className="text-center">
                  <div className="text-slate-500 font-medium">{stat.group}</div>
                  <div className="font-semibold text-slate-800 font-tabular">{stat.rate}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Segmented Group Filter Tabs & Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Group Filter Tabs (Segmented Control) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {groups.map(group => {
              const isActive = selectedGroupFilter === group;
              const count = group === 'all'
                ? plan.tasks.length
                : plan.tasks.filter(t => t.group === group).length;

              return (
                <button
                  key={group}
                  onClick={() => setSelectedGroupFilter(group)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{group === 'all' ? '全部小組' : `${group}組`}</span>
                  <span className={`text-[10px] font-tabular px-1 py-0.2 rounded ${
                    isActive ? 'bg-slate-100 text-slate-700' : 'text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="搜尋工作代號、工作項目、負責人..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              onClick={onOpenAddTaskModal}
              disabled={!currentUser.canEdit}
              title={!currentUser.canEdit ? '僅授權委員可新增任務' : '新增工作項目'}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentUser.canEdit
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增任務</span>
            </button>

            <button
              onClick={resetToInitialPlan}
              title="還原為原始尾牙晚宴標準檢核表"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
