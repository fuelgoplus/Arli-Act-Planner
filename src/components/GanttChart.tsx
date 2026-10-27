import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskItem, CommitteeGroup } from '../types';
import {
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface GanttChartProps {
  initialPhaseId?: string;
  onClose?: () => void;
  onEditTask?: (task: TaskItem) => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  initialPhaseId,
  onClose,
  onEditTask,
}) => {
  const { plan, updateTaskStatus, currentUser } = useApp();
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>(initialPhaseId || 'all');

  // Timeline baseline: 2026-10-20 to 2027-02-01 (approx 105 days)
  const timelineStart = new Date('2026-10-20').getTime();
  const timelineEnd = new Date('2027-02-01').getTime();
  const totalDuration = timelineEnd - timelineStart;

  // Major timeline markers (weeks / months)
  const timelineMarkers = [
    { label: '10月下旬', date: '2026-10-21', pos: 2 },
    { label: '11月上旬 (D-4M)', date: '2026-11-01', pos: 12 },
    { label: '11月中旬', date: '2026-11-15', pos: 25 },
    { label: '12月上旬 (D-3M)', date: '2026-12-01', pos: 40 },
    { label: '12月中旬', date: '2026-12-15', pos: 53 },
    { label: '01月上旬 (D-2M)', date: '2027-01-01', pos: 69 },
    { label: '01月中旬 (D-2W)', date: '2027-01-15', pos: 82 },
    { label: '01/22 晚宴 D-Day', date: '2027-01-22', pos: 89, isDDay: true },
    { label: '會後核銷', date: '2027-01-30', pos: 96 },
  ];

  const filteredPhases = selectedPhaseId === 'all'
    ? plan.phases
    : plan.phases.filter(p => p.id === selectedPhaseId);

  const getGroupColor = (group: CommitteeGroup) => {
    switch (group) {
      case '行政':
        return { bg: 'bg-sky-500', bar: 'bg-sky-500/90 text-white', border: 'border-sky-300' };
      case '財務':
        return { bg: 'bg-emerald-500', bar: 'bg-emerald-500/90 text-white', border: 'border-emerald-300' };
      case '總務':
        return { bg: 'bg-amber-500', bar: 'bg-amber-500/90 text-white', border: 'border-amber-300' };
      case '活動':
        return { bg: 'bg-indigo-500', bar: 'bg-indigo-500/90 text-white', border: 'border-indigo-300' };
      case '全體委員':
      default:
        return { bg: 'bg-purple-500', bar: 'bg-purple-500/90 text-white', border: 'border-purple-300' };
    }
  };

  const calculateBarPosition = (task: TaskItem) => {
    const startStr = task.startDate || '2026-10-25';
    const endStr = task.targetDate || startStr;

    const startMs = new Date(startStr).getTime();
    const endMs = new Date(endStr).getTime();

    const leftPercent = Math.max(0, Math.min(100, ((startMs - timelineStart) / totalDuration) * 100));
    const rawWidth = Math.max(2, ((Math.max(endMs, startMs + 86400000 * 2) - startMs) / totalDuration) * 100);
    const widthPercent = Math.min(rawWidth, 100 - leftPercent);

    return {
      left: `${leftPercent}%`,
      width: `${Math.max(4, widthPercent)}%`,
    };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-0">
      {/* Gantt Header Toolbar */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              活動籌備時程甘特圖 (Outline Gantt Chart)
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full font-mono">
              Timeline View
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            各階段檢核工作起訖時間軸與相依進度，提供按需求檢視之甘特圖排程。
          </p>
        </div>

        {/* Phase Filter for Gantt Chart */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">階段檢視：</span>
          <select
            value={selectedPhaseId}
            onChange={(e) => setSelectedPhaseId(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 bg-white border border-slate-300 rounded-lg shadow-2xs focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value="all">全階段 (Phase 1 ~ 5)</option>
            {plan.phases.map(p => (
              <option key={p.id} value={p.id}>
                {p.code}: {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Gantt Body */}
      <div className="p-4 overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Timeline Header Axis */}
          <div className="relative border-b border-slate-200 pb-2 mb-4 h-9">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 absolute inset-0">
              {timelineMarkers.map((m, idx) => (
                <div
                  key={idx}
                  className="absolute text-center"
                  style={{ left: `${m.pos}%`, transform: 'translateX(-50%)' }}
                >
                  <span className={`block whitespace-nowrap ${m.isDDay ? 'text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200' : 'text-slate-600'}`}>
                    {m.label}
                  </span>
                  <div className={`w-0.5 h-2 mx-auto mt-0.5 ${m.isDDay ? 'bg-amber-500 h-3' : 'bg-slate-300'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Phases and Task Gantt Bars */}
          <div className="space-y-6">
            {filteredPhases.map((phase) => {
              const phaseTasks = plan.tasks.filter(t => t.phaseId === phase.id);

              return (
                <div key={phase.id} className="space-y-2">
                  {/* Phase Row Header */}
                  <div className="flex items-center gap-2 bg-slate-100/70 px-3 py-1.5 rounded-lg border border-slate-200/80">
                    <span className="text-xs font-bold text-indigo-700 font-mono">
                      {phase.code}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {phase.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ({phaseTasks.length} 項工作)
                    </span>
                  </div>

                  {/* Task Timeline Rows */}
                  <div className="space-y-1.5 pl-2">
                    {phaseTasks.map((task) => {
                      const pos = calculateBarPosition(task);
                      const colors = getGroupColor(task.group);
                      const isCompleted = task.status === 'completed';

                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 py-1 group hover:bg-slate-50/80 rounded px-1 transition-colors"
                        >
                          {/* Task Label on Left */}
                          <div className="w-64 shrink-0 flex items-center justify-between text-xs pr-2">
                            <div className="truncate pr-1">
                              <span className="font-mono font-bold text-indigo-700 mr-1.5">
                                {task.code}
                              </span>
                              <span
                                className="font-medium text-slate-800 hover:text-indigo-600 cursor-pointer"
                                onClick={() => onEditTask?.(task)}
                              >
                                {task.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1 py-0.2 rounded shrink-0">
                              {task.timePeriod || task.leadTime}
                            </span>
                          </div>

                          {/* Gantt Bar Lane */}
                          <div className="flex-1 relative h-6 bg-slate-100/50 rounded flex items-center">
                            {/* D-Day Marker Line */}
                            <div
                              className="absolute top-0 bottom-0 w-px bg-amber-400 z-10 pointer-events-none"
                              style={{ left: '89%' }}
                            />

                            {/* The Gantt Task Bar */}
                            <div
                              onClick={() => onEditTask?.(task)}
                              title={`${task.code} ${task.title}\n時程：${task.timePeriod || task.targetDate}\n負責人：${task.assignee} (${task.group}組)\n狀態：${task.status}`}
                              style={{ left: pos.left, width: pos.width }}
                              className={`absolute h-5 rounded-md px-2 flex items-center justify-between text-[10px] font-medium transition-all shadow-2xs hover:shadow-xs cursor-pointer select-none truncate ${
                                isCompleted
                                  ? 'bg-emerald-600 text-white'
                                  : colors.bar
                              }`}
                            >
                              <span className="truncate pr-1">{task.deliverables}</span>
                              <span className="shrink-0 text-[9px] opacity-90 font-mono">
                                {task.assignee}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* D-Day Anchor Reference */}
          <div className="mt-6 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-sky-500" /> 行政組
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" /> 財務組
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500" /> 總務組
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-500" /> 活動組
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600" /> 已完成項目
              </span>
            </div>

            <div className="font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              ★ 基準晚宴日：2027.01.22 (D-Day)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
