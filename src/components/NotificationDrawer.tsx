import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CommitteeGroup } from '../types';
import {
  X,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Mail,
  DollarSign,
  CheckCheck,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotifsCount,
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'unread' | CommitteeGroup>('all');

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter(n => {
    if (filterType === 'unread') return !n.read;
    if (filterType === '行政' || filterType === '財務' || filterType === '總務' || filterType === '活動') {
      return n.group === filterType || n.group === '全體委員';
    }
    return true;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'budget_change':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'access_request':
        return <Mail className="w-4 h-4 text-amber-600" />;
      case 'deadline_alert':
        return <Clock className="w-4 h-4 text-rose-600" />;
      case 'status_update':
      default:
        return <CheckCircle2 className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-md bg-white shadow-2xl h-full flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                專案利害關係人即時動態 (Notifications)
              </h2>
              <p className="text-[11px] text-slate-500">
                {unreadNotifsCount} 則未讀訊息 · 全體委員即時廣播連線
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadNotifsCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                title="全部標記為已讀"
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">全已讀</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-white font-semibold text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            全部 ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType('unread')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              filterType === 'unread'
                ? 'bg-white font-semibold text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            未讀 ({unreadNotifsCount})
          </button>
          <button
            onClick={() => setFilterType('行政')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              filterType === '行政'
                ? 'bg-white font-semibold text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            行政組
          </button>
          <button
            onClick={() => setFilterType('財務')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              filterType === '財務'
                ? 'bg-white font-semibold text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            財務組
          </button>
          <button
            onClick={() => setFilterType('總務')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              filterType === '總務'
                ? 'bg-white font-semibold text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            總務組
          </button>
          <button
            onClick={() => setFilterType('活動')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              filterType === '活動'
                ? 'bg-white font-semibold text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            活動組
          </button>
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {filteredNotifs.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              目前無此類別動態訊息
            </div>
          ) : (
            filteredNotifs.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-3 rounded-lg transition-colors cursor-pointer text-xs ${
                  n.read ? 'hover:bg-slate-50 opacity-80' : 'bg-indigo-50/50 hover:bg-indigo-50/80 font-medium'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-md bg-white border border-slate-200 shrink-0 mt-0.5">
                    {getNotifIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-semibold text-slate-900 truncate">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {n.message}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                        {n.group}
                      </span>
                      <span>觸發者：{n.actorName}</span>
                      {!n.read && (
                        <span className="text-indigo-600 font-bold ml-auto">新動態</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
