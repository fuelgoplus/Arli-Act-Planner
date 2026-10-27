import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TaskItem, CommitteeGroup, TaskStatus } from '../types';
import { X, Save, Plus } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: TaskItem | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
}) => {
  const { plan, addTask, updateTask, currentUser } = useApp();

  const [code, setCode] = useState('');
  const [phaseId, setPhaseId] = useState(plan.phases[0]?.id || 'phase-1');
  const [title, setTitle] = useState('');
  const [group, setGroup] = useState<CommitteeGroup>('活動');
  const [leadTime, setLeadTime] = useState('D-2M');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [assignee, setAssignee] = useState(currentUser.name);
  const [priority, setPriority] = useState<TaskItem['priority']>('medium');
  const [notes, setNotes] = useState('');
  const [recurringRule, setRecurringRule] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setCode(taskToEdit.code);
      setPhaseId(taskToEdit.phaseId);
      setTitle(taskToEdit.title);
      setGroup(taskToEdit.group);
      setLeadTime(taskToEdit.leadTime);
      setStartDate(taskToEdit.startDate || '');
      setTargetDate(taskToEdit.targetDate || '');
      setTimePeriod(taskToEdit.timePeriod || '');
      setDeliverables(taskToEdit.deliverables);
      setStatus(taskToEdit.status);
      setAssignee(taskToEdit.assignee);
      setPriority(taskToEdit.priority);
      setNotes(taskToEdit.notes || '');
      setRecurringRule(taskToEdit.recurringRule || '');
    } else {
      setCode('');
      setPhaseId(plan.phases[0]?.id || 'phase-1');
      setTitle('');
      setGroup('活動');
      setLeadTime('D-2M');
      setStartDate('2026-10-25');
      setTargetDate('2026-11-05');
      setTimePeriod('10/25 - 11/05');
      setDeliverables('');
      setStatus('not_started');
      setAssignee(currentUser.name);
      setPriority('medium');
      setNotes('');
      setRecurringRule('');
    }
  }, [taskToEdit, plan.phases, currentUser.name, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deliverables.trim()) return;

    if (taskToEdit) {
      const computedPeriod = timePeriod.trim() || (startDate && targetDate ? `${startDate.substring(5)} - ${targetDate.substring(5)}` : undefined);

      updateTask({
        ...taskToEdit,
        code: code.trim() || taskToEdit.code,
        phaseId,
        title: title.trim(),
        group,
        leadTime: leadTime.trim(),
        startDate: startDate || undefined,
        targetDate: targetDate || undefined,
        timePeriod: computedPeriod,
        deliverables: deliverables.trim(),
        status,
        assignee: assignee.trim(),
        priority,
        notes: notes.trim() || undefined,
        recurringRule: recurringRule.trim() || undefined,
      });
    } else {
      const computedPeriod = timePeriod.trim() || (startDate && targetDate ? `${startDate.substring(5)} - ${targetDate.substring(5)}` : undefined);

      addTask({
        code: code.trim() || `T.${plan.tasks.length + 1}`,
        phaseId,
        title: title.trim(),
        group,
        leadTime: leadTime.trim(),
        startDate: startDate || undefined,
        targetDate: targetDate || undefined,
        timePeriod: computedPeriod,
        deliverables: deliverables.trim(),
        status,
        assignee: assignee.trim(),
        priority,
        notes: notes.trim() || undefined,
        recurringRule: recurringRule.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <h3 className="text-base font-bold text-slate-900">
            {taskToEdit ? '編輯工作檢核項目' : '新增籌備工作項目'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                工作代號
              </label>
              <input
                type="text"
                placeholder="如 A.5, C.8"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                所屬籌備階段
              </label>
              <select
                value={phaseId}
                onChange={(e) => setPhaseId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {plan.phases.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code} ({p.name.substring(0, 10)}...)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                權責小組
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value as CommitteeGroup)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="行政">行政組</option>
                <option value="財務">財務組</option>
                <option value="總務">總務組</option>
                <option value="活動">活動組</option>
                <option value="全體委員">全體委員</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              檢核工作項目名稱
            </label>
            <input
              type="text"
              required
              placeholder="例如：編製晚宴主題贊助文案與邀請函樣版..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              交付項目 (Deliverable)
            </label>
            <input
              type="text"
              required
              placeholder="例如：贊助文案電子檔、貴賓邀請名冊"
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                時限 (L-T)
              </label>
              <input
                type="text"
                placeholder="如 D-4M, D-2Week"
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                執行期間 (Time Period)
              </label>
              <input
                type="text"
                placeholder="如 10/21 - 10/25"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                開始日期 (甘特圖)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                截止完成日
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                指派負責人
              </label>
              <input
                type="text"
                placeholder="如 Philip, Amos"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                執行狀態
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="not_started">待啟動</option>
                <option value="in_progress">進行中</option>
                <option value="under_review">審核中</option>
                <option value="completed">已完成</option>
                <option value="blocked">遇阻礙</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                優先級別
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="low">一般 (Low)</option>
                <option value="medium">重要 (Medium)</option>
                <option value="high">高度關注 (High)</option>
                <option value="urgent">緊急核定 (Urgent)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                週期檢核規則 (選填)
              </label>
              <input
                type="text"
                placeholder="如 每週會報、雙週核定"
                value={recurringRule}
                onChange={(e) => setRecurringRule(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              執行備註與細部規範
            </label>
            <textarea
              rows={2}
              placeholder="執行細節、需注意事項或高階主管指示..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{taskToEdit ? '儲存變更' : '建立工作項目'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
