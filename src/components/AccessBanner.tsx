import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Send, CheckCircle2 } from 'lucide-react';

export const AccessBanner: React.FC = () => {
  const { currentUser, requestEditAccess } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (currentUser.canEdit) {
    return null;
  }

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    requestEditAccess(currentUser.name, currentUser.email, requestNote);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setModalOpen(false);
      setRequestNote('');
    }, 2000);
  };

  return (
    <>
      <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-2 text-xs text-amber-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>唯讀瀏覽模式</strong>：此活動組織檢核表目前僅供受邀並經 Super Admin 授權之籌備委員編輯修改。
            </span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-2.5 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded transition-colors shrink-0"
          >
            申請編輯授權
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              申請籌備工作編輯授權
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              填寫申請資訊後，系統將發送即時通知給 Super Admin (Philip Chang)，審核通過後即開通任務修改權限。
            </p>

            {submitted ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">授權申請已送出！</p>
                <p className="text-xs text-slate-500 mt-1">
                  請靜待 Super Admin 於權限授權中心進行審核核可。
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    申請人姓名
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.name}
                    className="w-full px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    申請人 Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    申請理由或所屬活動任務 (選填)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="例如：協助總務組廠商比價及菜單調整作業..."
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>送出審核申請</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
