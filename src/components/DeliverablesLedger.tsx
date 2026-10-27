import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, FileText, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';

export const DeliverablesLedger: React.FC = () => {
  const { plan, updateTaskStatus, currentUser } = useApp();

  const deliverablesWithTasks = plan.tasks.map(task => {
    const phase = plan.phases.find(p => p.id === task.phaseId);
    return {
      task,
      phase,
    };
  });

  const completedCount = deliverablesWithTasks.filter(item => item.task.status === 'completed').length;
  const inProgressCount = deliverablesWithTasks.filter(item => item.task.status === 'in_progress').length;
  const rate = Math.round((completedCount / deliverablesWithTasks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 font-medium">總應收交付項目</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-tabular">
            {deliverablesWithTasks.length} <span className="text-xs font-normal text-slate-500">項交付文件/成果</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            包含企劃書、報價單、合約、流程表與核銷清冊
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 font-medium">已交付審核完成</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-tabular">
            {completedCount} <span className="text-xs font-normal text-slate-500">項 ({rate}%)</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            進行中：{inProgressCount} 項 · 待啟動：{deliverablesWithTasks.length - completedCount - inProgressCount} 項
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 font-medium">高階主管核可紀錄 (Executive Sign-Off)</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1 font-tabular">
            4 / 4 <span className="text-xs font-normal text-slate-500">項列管</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            預算計畫、委外、時程與執行方式全面列管
          </div>
        </div>
      </div>

      {/* Deliverables Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              活動籌備交付項目驗收清冊 (Deliverables Ledger)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              各組召集人與執行委員完成交付文件後，可在此快速檢視與標記驗收狀態。
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4 w-28">所屬階段</th>
                <th className="py-2.5 px-3 w-16">代號</th>
                <th className="py-2.5 px-4">交付項目名稱 (Deliverable)</th>
                <th className="py-2.5 px-4">關聯檢核任務</th>
                <th className="py-2.5 px-3 w-20">權責小組</th>
                <th className="py-2.5 px-3 w-20">負責人</th>
                <th className="py-2.5 px-3 w-24">時限 (L-T)</th>
                <th className="py-2.5 px-4 w-32">交付狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliverablesWithTasks.map(({ task, phase }) => (
                <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {phase?.code}
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                    {task.code}
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{task.deliverables}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {task.title}
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {task.group}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-medium text-slate-800">
                    {task.assignee}
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-600">
                    {task.leadTime}
                  </td>

                  <td className="py-3 px-4">
                    <select
                      disabled={!currentUser.canEdit}
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                      className={`text-[11px] font-semibold py-1 px-2 rounded border appearance-none transition-colors cursor-pointer ${
                        task.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : task.status === 'in_progress'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : task.status === 'under_review'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      } ${!currentUser.canEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <option value="not_started">待產出</option>
                      <option value="in_progress">編製中</option>
                      <option value="under_review">待簽核</option>
                      <option value="completed">已驗收完成</option>
                      <option value="blocked">待協調阻礙</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
