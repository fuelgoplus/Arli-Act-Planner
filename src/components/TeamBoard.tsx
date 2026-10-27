import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskItem, CommitteeGroup, TaskStatus } from '../types';
import {
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Edit2,
  Sparkles,
} from 'lucide-react';

interface TeamBoardProps {
  onEditTask: (task: TaskItem) => void;
}

export const TeamBoard: React.FC<TeamBoardProps> = ({ onEditTask }) => {
  const { plan, updateTaskStatus, currentUser, searchQuery } = useApp();
  const [boardMode, setBoardMode] = useState<'by_group' | 'by_status'>('by_group');

  const groups: { name: CommitteeGroup; lead: string; desc: string }[] = [
    { name: '行政', lead: 'Bear (主委)', desc: '提報核可、預算核定、主題節目、任務分派、結案最終核定' },
    { name: '財務', lead: 'Amos (財委)', desc: '預算編列、會計出納、單據核銷、中獎稅務' },
    { name: '總務', lead: 'Ann, Lydia, Carol', desc: '外包廠商、場地方案(場勘)、物資採購、訂位飲食' },
    { name: '活動', lead: 'Philip, Sharon, Mason', desc: '主題企劃、流程 Rundown、表演主持、問卷統計' },
  ];

  const statuses: { key: TaskStatus; label: string; color: string }[] = [
    { key: 'not_started', label: '待啟動 (Not Started)', color: 'border-slate-300 text-slate-700' },
    { key: 'in_progress', label: '進行中 (In Progress)', color: 'border-sky-400 text-sky-800' },
    { key: 'under_review', label: '審核中 (Under Review)', color: 'border-amber-400 text-amber-800' },
    { key: 'completed', label: '已完成 (Completed)', color: 'border-emerald-400 text-emerald-800' },
  ];

  const filterTask = (task: TaskItem) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.code.toLowerCase().includes(q) ||
      task.title.toLowerCase().includes(q) ||
      task.assignee.toLowerCase().includes(q) ||
      task.deliverables.toLowerCase().includes(q)
    );
  };

  const getNextStatus = (current: TaskStatus): TaskStatus => {
    switch (current) {
      case 'not_started':
        return 'in_progress';
      case 'in_progress':
        return 'under_review';
      case 'under_review':
        return 'completed';
      case 'completed':
        return 'not_started';
      case 'blocked':
        return 'in_progress';
      default:
        return 'in_progress';
    }
  };

  return (
    <div className="space-y-4">
      {/* View Switcher */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">協作看板呈現視角：</span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setBoardMode('by_group')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                boardMode === 'by_group'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              依籌備小組 (四組分工)
            </button>
            <button
              onClick={() => setBoardMode('by_status')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                boardMode === 'by_status'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              依進度階段 (Kanban)
            </button>
          </div>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          共 {plan.tasks.length} 項活動工作檢核項目
        </span>
      </div>

      {/* Mode 1: By Committee Group */}
      {boardMode === 'by_group' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {groups.map((group) => {
            const groupTasks = plan.tasks.filter(t => t.group === group.name).filter(filterTask);
            const completedCount = groupTasks.filter(t => t.status === 'completed').length;
            const rate = groupTasks.length > 0 ? Math.round((completedCount / groupTasks.length) * 100) : 0;

            return (
              <div
                key={group.name}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="pb-3 border-b border-slate-200/80 mb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">
                      {group.name}組
                    </h3>
                    <span className="text-xs font-tabular font-semibold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                      {completedCount}/{groupTasks.length} ({rate}%)
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-indigo-700 mt-0.5">
                    召集委員：{group.lead}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                    {group.desc}
                  </p>
                </div>

                {/* Task Cards */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[700px] pr-0.5">
                  {groupTasks.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      尚無此組任務
                    </div>
                  ) : (
                    groupTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs hover:shadow-xs transition-shadow group"
                      >
                        <div className="flex items-center justify-between mb-1.5 text-[11px]">
                          <span className="font-mono font-bold text-indigo-700">
                            {task.code}
                          </span>
                          <span className="font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            {task.leadTime}
                          </span>
                        </div>

                        <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">
                          {task.title}
                        </h4>

                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-start gap-1 text-[11px] text-slate-600">
                          <FileText className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{task.deliverables}</span>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                              {task.assignee.charAt(0)}
                            </span>
                            <span className="text-[11px] text-slate-700 font-medium">
                              {task.assignee}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Advance Status Button */}
                            <button
                              disabled={!currentUser.canEdit}
                              onClick={() => updateTaskStatus(task.id, getNextStatus(task.status))}
                              title={`點擊切換狀態 (目前：${task.status})`}
                              className={`text-[10px] font-medium px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                                task.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : task.status === 'in_progress'
                                  ? 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                                  : task.status === 'under_review'
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              } ${!currentUser.canEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                              <span>
                                {task.status === 'completed' ? '已完成' :
                                 task.status === 'in_progress' ? '進行中' :
                                 task.status === 'under_review' ? '審核中' : '待啟動'}
                              </span>
                              {currentUser.canEdit && <ArrowRight className="w-2.5 h-2.5" />}
                            </button>

                            <button
                              disabled={!currentUser.canEdit}
                              onClick={() => onEditTask(task)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode 2: By Status Kanban */}
      {boardMode === 'by_status' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {statuses.map((col) => {
            const colTasks = plan.tasks.filter(t => t.status === col.key).filter(filterTask);

            return (
              <div
                key={col.key}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 flex flex-col min-h-[500px]"
              >
                <div className={`pb-2.5 border-b-2 mb-3 flex items-center justify-between ${col.color}`}>
                  <h3 className="font-bold text-xs uppercase tracking-wider">
                    {col.label}
                  </h3>
                  <span className="text-xs font-tabular font-bold bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[700px] pr-0.5">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      目前無此狀態項目
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs hover:shadow-xs transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-1.5 text-[11px]">
                          <span className="font-mono font-bold text-indigo-700">
                            {task.code}
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {task.group}組 · {task.leadTime}
                          </span>
                        </div>

                        <h4 className="text-xs font-semibold text-slate-900 line-clamp-2">
                          {task.title}
                        </h4>

                        <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                          <span className="font-medium text-slate-700">{task.assignee}</span>
                          <button
                            disabled={!currentUser.canEdit}
                            onClick={() => onEditTask(task)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
