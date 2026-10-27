import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskItem, TaskStatus, CommitteeGroup } from '../types';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Edit2,
  Trash2,
  Tag,
  Calendar,
  Check,
  Layers,
  BarChart3,
  History,
} from 'lucide-react';
import { GanttChart } from './GanttChart';
import { PhaseTrackerModal } from './PhaseTrackerModal';

interface PhaseChecklistProps {
  onEditTask: (task: TaskItem) => void;
}

export const PhaseChecklist: React.FC<PhaseChecklistProps> = ({ onEditTask }) => {
  const {
    plan,
    updateTaskStatus,
    updateTask,
    updatePhase,
    updateEventTargetDate,
    deleteTask,
    selectedGroupFilter,
    searchQuery,
    currentUser,
  } = useApp();

  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});
  const [expandedGanttPhases, setExpandedGanttPhases] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'table' | 'gantt'>('table');

  // Track inline editing values and real-time auto-save feedback
  const [editingPhaseTime, setEditingPhaseTime] = useState<Record<string, string>>({});
  const [savedPhaseNotice, setSavedPhaseNotice] = useState<Record<string, boolean>>({});
  const [editingTaskTime, setEditingTaskTime] = useState<Record<string, string>>({});
  const [savedTaskNotice, setSavedTaskNotice] = useState<Record<string, boolean>>({});

  // Phase 1 D-Day setting state
  const [editingDDay, setEditingDDay] = useState<string | undefined>(undefined);
  const [savedDDayNotice, setSavedDDayNotice] = useState<boolean>(false);

  // Tracker modal state
  const [selectedTrackerPhaseId, setSelectedTrackerPhaseId] = useState<string | null>(null);
  const activeTrackerPhase = plan.phases.find(p => p.id === selectedTrackerPhaseId);

  const handleDDayBlur = () => {
    if (editingDDay === undefined) return;
    if (editingDDay.trim() && editingDDay !== plan.eventTargetDate) {
      updateEventTargetDate(editingDDay.trim());
      setSavedDDayNotice(true);
      setTimeout(() => {
        setSavedDDayNotice(false);
      }, 2500);
    }
  };

  const handlePhaseTimeChange = (phaseId: string, val: string) => {
    setEditingPhaseTime(prev => ({ ...prev, [phaseId]: val }));
  };

  const handlePhaseTimeBlur = (phaseId: string) => {
    const newVal = editingPhaseTime[phaseId];
    if (newVal === undefined) return;
    updatePhase(phaseId, { timePeriod: newVal });
    setSavedPhaseNotice(prev => ({ ...prev, [phaseId]: true }));
    setTimeout(() => {
      setSavedPhaseNotice(prev => ({ ...prev, [phaseId]: false }));
    }, 2500);
  };

  const handleTaskTimeChange = (taskId: string, val: string) => {
    setEditingTaskTime(prev => ({ ...prev, [taskId]: val }));
  };

  const handleTaskTimeBlur = (task: TaskItem) => {
    const newVal = editingTaskTime[task.id];
    if (newVal === undefined) return;
    updateTask({ ...task, timePeriod: newVal });
    setSavedTaskNotice(prev => ({ ...prev, [task.id]: true }));
    setTimeout(() => {
      setSavedTaskNotice(prev => ({ ...prev, [task.id]: false }));
    }, 2500);
  };

  const togglePhase = (phaseId: string) => {
    setCollapsedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  const toggleGantt = (phaseId: string) => {
    setExpandedGanttPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return {
          label: '已完成',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'in_progress':
        return {
          label: '進行中',
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-500',
        };
      case 'under_review':
        return {
          label: '審核中',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'blocked':
        return {
          label: '遇阻礙',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'not_started':
      default:
        return {
          label: '待啟動',
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const getGroupBadge = (group: CommitteeGroup) => {
    switch (group) {
      case '行政':
        return 'text-sky-700 bg-sky-50';
      case '財務':
        return 'text-emerald-700 bg-emerald-50';
      case '總務':
        return 'text-amber-700 bg-amber-50';
      case '活動':
        return 'text-indigo-700 bg-indigo-50';
      case '全體委員':
      default:
        return 'text-purple-700 bg-purple-50';
    }
  };

  const filterTask = (task: TaskItem) => {
    if (selectedGroupFilter !== 'all' && task.group !== selectedGroupFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = task.code.toLowerCase().includes(q);
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchAssignee = task.assignee.toLowerCase().includes(q);
      const matchDeliverable = task.deliverables.toLowerCase().includes(q);
      const matchNotes = task.notes?.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchAssignee && !matchDeliverable && !matchNotes) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Top View Toggle: Table Checklist vs Outline Gantt Chart */}
      <div className="flex items-center justify-between bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">檢核呈現模式：</span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>檢核表表格 (Table)</span>
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'gantt'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>時程甘特圖 (Outline Gantt Chart)</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>表格已新增「執行期間 (Time Period)」欄位，連動甘特圖時程</span>
        </div>
      </div>

      {viewMode === 'gantt' ? (
        <GanttChart onEditTask={onEditTask} />
      ) : (
        plan.phases.map((phase) => {
          const phaseTasks = plan.tasks.filter(t => t.phaseId === phase.id);
          const filteredTasks = phaseTasks.filter(filterTask);
          const completedCount = phaseTasks.filter(t => t.status === 'completed').length;
          const isCollapsed = !!collapsedPhases[phase.id];

          // If filtering results in 0 items for this phase and there's a filter, show empty hint or hide
          if (filteredTasks.length === 0 && (selectedGroupFilter !== 'all' || searchQuery.trim())) {
            return null;
          }

          return (
            <div
              key={phase.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs transition-shadow"
            >
              {/* Phase Section Header */}
              <div
                onClick={() => togglePhase(phase.id)}
                className="px-5 py-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-700 tracking-wide font-mono">
                        {phase.code}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-900">
                        {phase.name}
                      </span>
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        · {phase.subtitle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-3xl line-clamp-1">
                      {phase.description}
                    </p>

                    {/* Phase Time Period & D-Day Settings with Automatic Online Save */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2.5 flex items-center gap-3 flex-wrap"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>階段執行時程：</span>
                        </span>
                        {currentUser.canEdit ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={
                                editingPhaseTime[phase.id] !== undefined
                                  ? editingPhaseTime[phase.id]
                                  : (phase.timePeriod || '')
                              }
                              onChange={(e) => handlePhaseTimeChange(phase.id, e.target.value)}
                              onBlur={() => handlePhaseTimeBlur(phase.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  (e.target as HTMLInputElement).blur();
                                }
                              }}
                              placeholder="設定時程區間 (如: 2026.10 - 2026.11)"
                              className="text-xs font-mono font-medium px-2.5 py-1 bg-white border border-slate-300 rounded hover:border-indigo-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 transition-colors w-56 sm:w-72 shadow-2xs"
                              title="在線直接修改此階段時程，內容將在線自動儲存"
                            />
                            {savedPhaseNotice[phase.id] ? (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1 animate-in fade-in">
                                <Check className="w-3 h-3 text-emerald-600" />
                                已在線自動儲存
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 hidden sm:inline">
                                (在線自動儲存)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-mono font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            {phase.timePeriod || '未設定'}
                          </span>
                        )}
                      </div>

                      {/* D-Day Setting in Phase 1 Section Header */}
                      {(phase.id === 'phase-1' || phase.order === 1) && (
                        <div className="flex items-center gap-2 pl-0 sm:pl-3 sm:border-l border-slate-200">
                          <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>晚會目標日 (D-Day 設定)：</span>
                          </span>
                          {currentUser.canEdit ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingDDay !== undefined ? editingDDay : (plan.eventTargetDate || '')}
                                onChange={(e) => setEditingDDay(e.target.value)}
                                onBlur={handleDDayBlur}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                placeholder="例如: 2027.01.22"
                                className="text-xs font-mono font-bold px-2.5 py-1 bg-white border border-amber-300 rounded hover:border-amber-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-amber-900 transition-colors w-32 sm:w-36 shadow-2xs"
                                title="在線直接設定尾牙晚會目標基準日 (D-Day)，將自動儲存"
                              />
                              {savedDDayNotice ? (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1 animate-in fade-in">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  已儲存
                                </span>
                              ) : (
                                <span className="text-[10px] text-amber-700/70 hidden sm:inline">
                                  (在線自動儲存)
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded">
                              {plan.eventTargetDate || '未設定'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Count, Tracker Button & On-Demand Gantt Chart Button */}
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                  {/* Tracker Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTrackerPhaseId(phase.id);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-700 hover:text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50/70 transition-colors shadow-2xs"
                    title="開啟此階段事件歷程與變更記錄 (Tracker)"
                  >
                    <History className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Tracker</span>
                    {(phase.historyLogs?.length || 0) > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-700 font-mono">
                        {phase.historyLogs?.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGantt(phase.id);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors shadow-2xs ${
                      expandedGanttPhases[phase.id]
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-indigo-700 hover:bg-indigo-50 border-indigo-200'
                    }`}
                    title="展開/收合此階段之時程甘特圖"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>{expandedGanttPhases[phase.id] ? '收合甘特圖' : `${phase.code} 甘特圖`}</span>
                  </button>

                  <div className="text-right text-xs font-tabular">
                    <span className="font-semibold text-slate-800">
                      {completedCount} / {phaseTasks.length} 完成
                    </span>
                    <span className="text-slate-400 ml-1.5 hidden sm:inline">
                      ({phaseTasks.length > 0 ? Math.round((completedCount / phaseTasks.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* On-Demand Gantt Chart for this Phase */}
              {expandedGanttPhases[phase.id] && (
                <div className="p-4 bg-slate-50/50 border-b border-slate-200 animate-in fade-in">
                  <GanttChart initialPhaseId={phase.id} onEditTask={onEditTask} />
                </div>
              )}

              {/* Tasks Table */}
              {!isCollapsed && (
                <>
                  {/* Phase 1 D-Day Highlight Callout */}
                  {(phase.id === 'phase-1' || phase.order === 1) && (
                    <div className="mx-4 sm:mx-5 my-3 p-3 bg-amber-50/70 border border-amber-200/90 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-amber-700" />
                        </div>
                        <div>
                          <div className="font-bold text-amber-950 flex items-center gap-2">
                            <span>Phase 1 籌備核心基準日：晚會 D-Day</span>
                            <span className="font-mono text-amber-900 bg-white border border-amber-300 px-2 py-0.5 rounded text-xs font-extrabold shadow-2xs">
                              {plan.eventTargetDate || '2027.01.22'}
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800/80 mt-0.5">
                            本階段確立之 D-Day 將作為所有籌備工作倒推時程與甘特圖之錨定基準點。
                          </p>
                        </div>
                      </div>

                      {currentUser.canEdit && (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-semibold text-amber-900">調整 D-Day：</span>
                          <input
                            type="text"
                            value={editingDDay !== undefined ? editingDDay : (plan.eventTargetDate || '')}
                            onChange={(e) => setEditingDDay(e.target.value)}
                            onBlur={handleDDayBlur}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            placeholder="YYYY.MM.DD"
                            className="text-xs font-mono font-bold px-2 py-1 bg-white border border-amber-300 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-amber-900 w-28 text-center"
                          />
                          {savedDDayNotice && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1 animate-in fade-in">
                              <Check className="w-3 h-3 text-emerald-600" />
                              已儲存
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-white text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="py-2.5 px-4 w-16">代號</th>
                          <th className="py-2.5 px-3 w-20">時限 (L-T)</th>
                          <th className="py-2.5 px-3 w-32">執行期間 (Time Period)</th>
                          <th className="py-2.5 px-3 w-20">分組</th>
                          <th className="py-2.5 px-4">檢核工作項目</th>
                          <th className="py-2.5 px-4">交付項目 (Deliverables)</th>
                          <th className="py-2.5 px-3 w-20">負責人</th>
                          <th className="py-2.5 px-3 w-28">執行狀態</th>
                          <th className="py-2.5 px-3 w-16 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredTasks.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                              此篩選條件下尚無相關工作項目
                            </td>
                          </tr>
                        ) : (
                          filteredTasks.map((task) => {
                            const statusInfo = getStatusBadge(task.status);
                            return (
                              <tr
                                key={task.id}
                                className="hover:bg-slate-50/80 transition-colors group"
                              >
                                {/* Task Code */}
                                <td className="py-3 px-4 font-mono font-bold text-slate-700">
                                  {task.code}
                                </td>

                                {/* Lead-Time */}
                                <td className="py-3 px-3">
                                  <span className="font-mono text-slate-700 font-medium">
                                    {task.leadTime}
                                  </span>
                                </td>

                                {/* Time Period Column (Inline Editable with Auto-Save) */}
                                <td className="py-2.5 px-3">
                                  {currentUser.canEdit ? (
                                    <div className="flex items-center gap-1.5">
                                      <div className="relative">
                                        <input
                                          type="text"
                                          value={
                                            editingTaskTime[task.id] !== undefined
                                              ? editingTaskTime[task.id]
                                              : (task.timePeriod || (task.startDate && task.targetDate ? `${task.startDate.substring(5)} - ${task.targetDate.substring(5)}` : task.leadTime))
                                          }
                                          onChange={(e) => handleTaskTimeChange(task.id, e.target.value)}
                                          onBlur={() => handleTaskTimeBlur(task)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              (e.target as HTMLInputElement).blur();
                                            }
                                          }}
                                          placeholder="執行時程"
                                          className="text-[11px] font-mono font-medium px-2 py-1 bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36 sm:w-44 text-slate-800 shadow-2xs transition-colors"
                                          title="點擊直接修改時程，內容將在線自動儲存"
                                        />
                                      </div>
                                      {savedTaskNotice[task.id] ? (
                                        <span className="text-emerald-600 text-[10px] flex items-center gap-0.5 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 shrink-0 font-semibold animate-in fade-in" title="已在線自動儲存">
                                          <Check className="w-3 h-3 text-emerald-600" />
                                          已存
                                        </span>
                                      ) : (
                                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      )}
                                    </div>
                                  ) : (
                                    <span className="font-mono text-slate-700 font-medium bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded text-[11px] whitespace-nowrap inline-flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                                      <span>{task.timePeriod || (task.startDate && task.targetDate ? `${task.startDate.substring(5)} - ${task.targetDate.substring(5)}` : task.leadTime)}</span>
                                    </span>
                                  )}
                                </td>

                                {/* Committee Group */}
                                <td className="py-3 px-3">
                                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${getGroupBadge(task.group)}`}>
                                    {task.group}
                                  </span>
                                </td>

                                {/* Title & Notes */}
                                <td className="py-3 px-4">
                                  <div className="font-medium text-slate-900">
                                    {task.title}
                                  </div>
                                  {task.notes && (
                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                      備註：{task.notes}
                                    </div>
                                  )}
                                </td>

                              {/* Deliverables */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{task.deliverables}</span>
                                </div>
                              </td>

                              {/* Assignee */}
                              <td className="py-3 px-3">
                                <span className="text-slate-800 font-medium">
                                  {task.assignee}
                                </span>
                              </td>

                              {/* Interactive Status Selector */}
                              <td className="py-3 px-3">
                                <div className="relative">
                                  <select
                                    disabled={!currentUser.canEdit}
                                    value={task.status}
                                    onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                                    className={`w-full text-xs font-semibold py-1 px-2 rounded border appearance-none transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 ${statusInfo.bg} ${
                                      !currentUser.canEdit ? 'opacity-80 cursor-not-allowed' : ''
                                    }`}
                                  >
                                    <option value="not_started">待啟動</option>
                                    <option value="in_progress">進行中</option>
                                    <option value="under_review">審核中</option>
                                    <option value="completed">已完成</option>
                                    <option value="blocked">遇阻礙</option>
                                  </select>
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => onEditTask(task)}
                                    disabled={!currentUser.canEdit}
                                    title={currentUser.canEdit ? '編輯任務' : '唯讀無編輯權'}
                                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors disabled:opacity-40"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteTask(task.id)}
                                    disabled={!currentUser.canEdit}
                                    title={currentUser.canEdit ? '刪除任務' : '唯讀無編輯權'}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors disabled:opacity-40"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Phase Wrap-Up / Sign-Off Guidelines */}
                {phase.wrapUpNotes && phase.wrapUpNotes.length > 0 && (
                  <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-200/80">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{phase.code} 結案檢核重點 (Wrap-up Requirements)</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {phase.wrapUpNotes.map((note, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-indigo-600 font-bold">·</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })
    )}

      {/* Phase Tracker Modal for Event History & Change Log */}
      {activeTrackerPhase && (
        <PhaseTrackerModal
          isOpen={!!activeTrackerPhase}
          onClose={() => setSelectedTrackerPhaseId(null)}
          phase={activeTrackerPhase}
          tasks={plan.tasks.filter(t => t.phaseId === activeTrackerPhase.id)}
        />
      )}
    </div>
  );
};
