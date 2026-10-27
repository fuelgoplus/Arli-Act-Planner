import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CommitteeGroup } from '../types';
import {
  DollarSign,
  ShieldAlert,
  CheckCircle,
  FileText,
  AlertTriangle,
  Plus,
  Send,
  Lock,
} from 'lucide-react';

export const BudgetAndRules: React.FC = () => {
  const {
    plan,
    submitChangeRequest,
    reviewChangeRequest,
    currentUser,
  } = useApp();

  const [crModalOpen, setCrModalOpen] = useState(false);
  const [crTitle, setCrTitle] = useState('');
  const [crAmount, setCrAmount] = useState<number | ''>('');
  const [crGroup, setCrGroup] = useState<CommitteeGroup>('活動');
  const [crReason, setCrReason] = useState('');

  const handleSubmitCR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crTitle.trim() || !crAmount || !crReason.trim()) return;

    submitChangeRequest(crTitle, Number(crAmount), crReason, crGroup);
    setCrModalOpen(false);
    setCrTitle('');
    setCrAmount('');
    setCrReason('');
  };

  const isExecutive = currentUser.role === 'super_admin' || currentUser.role === 'chairperson';

  return (
    <div className="space-y-6">
      {/* Top Banner: Meeting Procedure Definition */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          福委會程序會議規範與決策準則 (V0.1)
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          將程序會議應用在福委會年度規劃中，用意是規範『活動會議要怎麼開』；
          可以把它定位為「正式提案與表決前的預備」，用來定預算、時程表、執行規則，
          避免在正式籌備會議中陷入餐廳菜色或瑣碎細節的爭論。
        </p>
      </div>

      {/* Grid: 作業 1 & 作業 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 作業 1: 總預算與分配上限 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  作業 1：確立年度總預算與分配框架
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                主導：財務委員 (Amos)
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              依本年度福利金總額，為各活動設定預算上限。不在此階段討論具體餐廳或廠商。
            </p>

            <div className="space-y-3">
              {plan.budget.allocations.map((alloc) => (
                <div key={alloc.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">{alloc.category}</span>
                    <span className="font-tabular text-slate-900 font-semibold">
                      NT$ {alloc.allocatedAmount.toLocaleString()} 元
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${alloc.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-tabular">
                    <span>占比：{alloc.percentage}%</span>
                    <span>已核銷報支：NT$ {alloc.spentAmount.toLocaleString()} 元</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">年度福利金總預算：</span>
            <span className="font-bold text-sm text-slate-900 font-tabular">
              NT$ {plan.budget.totalBudget.toLocaleString()} 元
            </span>
          </div>
        </div>

        {/* 作業 2: 審查與表決規則 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">
                作業 2：訂定審查與表決規則
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              決策適用範圍
            </span>
          </div>

          {/* 一般議題 */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>確認一：一般議題 (適用多數決)</span>
            </h4>
            <p className="text-xs text-slate-600 pl-5">
              由福委會委員過半數出席、過半數表決通過，或交付全體同仁公開票選（例如員工旅遊目的地、晚會互動節目形式等）。
            </p>
          </div>

          {/* 不適用多數決 */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-rose-800 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>確認二：不適用多數決之 6 大議題 (嚴格核定權責)</span>
            </h4>
            <ul className="text-xs text-slate-600 space-y-1 pl-5">
              {plan.decisionRules.nonMajorityRules.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold shrink-0">{idx + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 向高層對齊 */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-slate-500" />
              <span>作業 5：需向高階主管正式對齊並取得核可之四項</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {plan.decisionRules.executiveSignOffItems.map((item, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-700 font-medium">
                  · {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 作業 6: 超支變更單 (Change Request / Overrun Tracker) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              作業 6：執行控制與超支變更單追蹤 (Budget Overrun / Change Requests)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              任何超出預算上限或合約重大變更，皆須專案填表呈報，由主委及財務委員獨立核定。
            </p>
          </div>

          <button
            onClick={() => setCrModalOpen(true)}
            disabled={!currentUser.canEdit}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentUser.canEdit
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>提出超支/變更申請</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4 w-28">申請日期</th>
                <th className="py-2.5 px-4">變更單項目名稱</th>
                <th className="py-2.5 px-3 w-20">申請組別</th>
                <th className="py-2.5 px-3 w-24">申請人</th>
                <th className="py-2.5 px-4 w-32">變更預算金額</th>
                <th className="py-2.5 px-4">事由與效益說明</th>
                <th className="py-2.5 px-3 w-24">審核狀態</th>
                <th className="py-2.5 px-4 w-36 text-right">核定操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plan.budget.changeRequests.map((cr) => (
                <tr key={cr.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {cr.requestedAt}
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {cr.title}
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {cr.group}組
                    </span>
                  </td>

                  <td className="py-3 px-3 font-medium text-slate-800">
                    {cr.applicant}
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-900 font-tabular">
                    + NT$ {cr.amount.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 text-slate-600 max-w-xs">
                    {cr.reason}
                  </td>

                  <td className="py-3 px-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      cr.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : cr.status === 'rejected'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {cr.status === 'approved' ? `已核准 (${cr.decisionBy || '主委'})` :
                       cr.status === 'rejected' ? '已駁回' : '待核定'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {cr.status === 'pending' ? (
                      isExecutive ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => reviewChangeRequest(cr.id, true)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                          >
                            核准
                          </button>
                          <button
                            onClick={() => reviewChangeRequest(cr.id, false)}
                            className="px-2 py-1 text-[11px] text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            駁回
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">限主委審核</span>
                      )
                    ) : (
                      <span className="text-[11px] text-slate-400">已結案</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Request Modal */}
      {crModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              提出預算超支 / 專案變更申請單 (CR)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              依程序規範第 6 條：預算超支不適用多數決，需由主委專案審核與高階主管對齊。
            </p>

            <form onSubmit={handleSubmitCR} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  變更項目名稱
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：主舞台 LED 背板解析度升級..."
                  value={crTitle}
                  onChange={(e) => setCrTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    申請追加金額 (NT$)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="例如：35000"
                    value={crAmount}
                    onChange={(e) => setCrAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none font-tabular"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    申請權責組別
                  </label>
                  <select
                    value={crGroup}
                    onChange={(e) => setCrGroup(e.target.value as CommitteeGroup)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="行政">行政組</option>
                    <option value="財務">財務組</option>
                    <option value="總務">總務組</option>
                    <option value="活動">活動組</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  超支事由與預期效益說明
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="說明為何原編列預算不足，以及追加後可達成的具體效益..."
                  value={crReason}
                  onChange={(e) => setCrReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCrModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>正式送審</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
