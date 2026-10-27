import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CommitteeGroup, UserRole, TeamMember } from '../types';
import {
  ShieldCheck,
  UserPlus,
  CheckCircle2,
  XCircle,
  Mail,
  Users,
  Lock,
  Unlock,
  AlertCircle,
  Edit2,
  Trash2,
  Save,
  X,
  Check,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    members,
    currentUser,
    inviteMember,
    updateMember,
    deleteMember,
    approveMemberRegistration,
    rejectMemberRegistration,
    toggleMemberEditPermission,
  } = useApp();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteGroup, setInviteGroup] = useState<CommitteeGroup>('活動');
  const [inviteRole, setInviteRole] = useState<UserRole>('committee_member');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Online inline edit state for member details
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const isSuperAdmin = currentUser.role === 'super_admin';

  const pendingMembers = members.filter(m => m.status === 'pending_approval');
  const activeMembers = members.filter(m => m.status !== 'pending_approval');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    inviteMember(inviteEmail, inviteName, inviteGroup, inviteRole);
    setInviteEmail('');
    setInviteName('');
    setInviteSuccess(true);
    setTimeout(() => setInviteSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Status Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-lg ${isSuperAdmin ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  成員權限與登記審核中心 (RBAC Governance)
                </h2>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  isSuperAdmin ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isSuperAdmin ? 'Super Admin 治理控制台' : '受限檢視中'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl">
                規範要求：僅有受邀且預先登記之 Email 方可編輯此活動組織檢核表。
                Super Admin 帳號 (<strong>philiponchang@gmail.com</strong>) 擁有審核、預先登記與授權新成員之最高權限。
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-500">目前操作身分：</span>
            <span className="font-bold text-slate-900 block">{currentUser.name} ({currentUser.role})</span>
          </div>
        </div>

        {!isSuperAdmin && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
            <span>
              您目前非 Super Admin。若要體驗審核申請或新增授權成員，可透過右上角選單切換至 <strong>Philip Chang (Super Admin)</strong>。
            </span>
          </div>
        )}
      </div>

      {/* Pending Approvals Section */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              待審核成員註冊申請 (Pending Registrations)
            </h3>
          </div>
          <span className="text-xs font-bold font-tabular px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded">
            {pendingMembers.length} 筆待審核
          </span>
        </div>

        <div className="overflow-x-auto">
          {pendingMembers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              目前無等待審核之成員申請。新訪客點擊「申請編輯授權」時將顯示於此。
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">申請人姓名</th>
                  <th className="py-2.5 px-4">註冊 Email</th>
                  <th className="py-2.5 px-3">申請組別</th>
                  <th className="py-2.5 px-3">申請日期</th>
                  <th className="py-2.5 px-4 text-right">Super Admin 審核操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <img src={m.avatarUrl} alt="" className="w-6 h-6 rounded-full bg-slate-100" />
                      <span>{m.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {m.email}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {m.group}組
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {m.registeredAt}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={!isSuperAdmin}
                          onClick={() => approveMemberRegistration(m.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors disabled:opacity-40"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>核准編輯權限</span>
                        </button>
                        <button
                          disabled={!isSuperAdmin}
                          onClick={() => rejectMemberRegistration(m.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded transition-colors disabled:opacity-40"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>駁回</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Grid: Invite Member Form + Pre-Registered Members List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invite & Pre-Register Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-4">
            <UserPlus className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">
              預先登記 / 邀請新成員 Email
            </h3>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            在此輸入欲邀請之委員會成員信箱。預先登記成功後，該信箱登入即可直接取得相應之活動編輯權限。
          </p>

          {inviteSuccess && (
            <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>成員已成功預先登記並授權！</span>
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                姓名 / 職稱
              </label>
              <input
                type="text"
                required
                disabled={!isSuperAdmin}
                placeholder="例如：Alex (活動組副召)"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                預先授權之電子信箱 (Email)
              </label>
              <input
                type="email"
                required
                disabled={!isSuperAdmin}
                placeholder="alex.events@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-slate-100 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  分派小組
                </label>
                <select
                  disabled={!isSuperAdmin}
                  value={inviteGroup}
                  onChange={(e) => setInviteGroup(e.target.value as CommitteeGroup)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-slate-100"
                >
                  <option value="行政">行政組</option>
                  <option value="財務">財務組</option>
                  <option value="總務">總務組</option>
                  <option value="活動">活動組</option>
                  <option value="全體委員">全體委員</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  角色權限
                </label>
                <select
                  disabled={!isSuperAdmin}
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-slate-100"
                >
                  <option value="committee_member">執行委員 (可編輯)</option>
                  <option value="chairperson">召集人/主委</option>
                  <option value="viewer">觀察員 (唯讀)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isSuperAdmin}
              className="w-full mt-2 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-40"
            >
              確認授權並加入名冊
            </button>
          </form>
        </div>

        {/* Active Authorized Members Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" />
              <h3 className="font-bold text-slate-900 text-sm">已登錄委員名冊</h3>
              <span className="text-xs font-semibold font-tabular text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {activeMembers.length} 人
              </span>
            </div>

            {isSuperAdmin && (
              <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Super Admin 在線即時調整模式</span>
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4 w-56">成員資料</th>
                  <th className="py-2.5 px-3 w-28">所屬小組</th>
                  <th className="py-2.5 px-3 w-40">權限角色 (在線調整)</th>
                  <th className="py-2.5 px-3 w-28 text-center">編輯權限狀態</th>
                  <th className="py-2.5 px-3 w-20 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeMembers.map((m) => {
                  const isEditingThis = editingMemberId === m.id;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Member Info / Inline Editing */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-start gap-2">
                          <img src={m.avatarUrl} alt="" className="w-6 h-6 rounded-full bg-slate-100 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            {isEditingThis ? (
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full px-2 py-0.5 text-xs border border-indigo-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                  placeholder="姓名"
                                />
                                <input
                                  type="email"
                                  value={editEmail}
                                  onChange={(e) => setEditEmail(e.target.value)}
                                  className="w-full px-2 py-0.5 text-[11px] font-mono border border-indigo-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                  placeholder="Email"
                                />
                                <div className="flex items-center gap-1 mt-1">
                                  <button
                                    onClick={() => {
                                      if (editName.trim() && editEmail.trim()) {
                                        updateMember(m.id, { name: editName.trim(), email: editEmail.trim() });
                                      }
                                      setEditingMemberId(null);
                                    }}
                                    className="px-2 py-0.5 text-[10px] bg-indigo-600 text-white rounded font-medium flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" /> 儲存
                                  </button>
                                  <button
                                    onClick={() => setEditingMemberId(null)}
                                    className="px-2 py-0.5 text-[10px] text-slate-500 hover:bg-slate-100 rounded"
                                  >
                                    取消
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                  <span className="truncate">{m.name}</span>
                                  {m.role === 'super_admin' && (
                                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-mono font-bold shrink-0">
                                      SUPER ADMIN
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono truncate">
                                  {m.email}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Online Group Selector */}
                      <td className="py-2.5 px-3">
                        <select
                          disabled={!isSuperAdmin}
                          value={m.group}
                          onChange={(e) => updateMember(m.id, { group: e.target.value as CommitteeGroup })}
                          className={`text-xs font-medium py-1 px-2 rounded border appearance-none transition-colors ${
                            !isSuperAdmin
                              ? 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed'
                              : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs'
                          }`}
                        >
                          <option value="行政">行政組</option>
                          <option value="財務">財務組</option>
                          <option value="總務">總務組</option>
                          <option value="活動">活動組</option>
                          <option value="全體委員">全體委員</option>
                        </select>
                      </td>

                      {/* Online Role Selector */}
                      <td className="py-2.5 px-3">
                        {m.role === 'super_admin' ? (
                          <span className="text-xs font-semibold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded block truncate">
                            最高管理員 (Super Admin)
                          </span>
                        ) : (
                          <select
                            disabled={!isSuperAdmin}
                            value={m.role}
                            onChange={(e) => updateMember(m.id, { role: e.target.value as UserRole })}
                            className={`w-full text-xs font-semibold py-1 px-2 rounded border appearance-none transition-colors ${
                              !isSuperAdmin
                                ? 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed'
                                : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs'
                            }`}
                          >
                            <option value="chairperson">大會主席/主委 (可編輯)</option>
                            <option value="committee_member">活動執行委員 (可編輯)</option>
                            <option value="viewer">唯讀觀察員 (無編輯權)</option>
                          </select>
                        )}
                      </td>

                      {/* Edit Permission Status & Quick Toggle */}
                      <td className="py-2.5 px-3 text-center">
                        {m.role !== 'super_admin' ? (
                          <button
                            disabled={!isSuperAdmin}
                            onClick={() => toggleMemberEditPermission(m.id)}
                            title={isSuperAdmin ? '點擊切換編輯權限狀態' : '僅 Super Admin 可切換'}
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                              m.canEdit
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            } ${!isSuperAdmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                          >
                            {m.canEdit ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            <span>{m.canEdit ? '允許編輯' : '僅能檢視'}</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                            <Unlock className="w-3 h-3" />
                            <span>固定可編輯</span>
                          </span>
                        )}
                      </td>

                      {/* Actions: Edit Name/Email & Delete */}
                      <td className="py-2.5 px-3 text-right">
                        {m.role !== 'super_admin' && (
                          <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                            {!isEditingThis && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMemberId(m.id);
                                  setEditName(m.name);
                                  setEditEmail(m.email);
                                }}
                                title="修改姓名與電子郵件"
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMember(m.id);
                              }}
                              title="從名冊中移除此成員"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
