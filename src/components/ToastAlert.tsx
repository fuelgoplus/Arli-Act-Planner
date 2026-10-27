import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, X, CheckCircle2, DollarSign, Mail } from 'lucide-react';

export const ToastAlert: React.FC = () => {
  const { activeToast, dismissToast } = useApp();

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        dismissToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast, dismissToast]);

  if (!activeToast) return null;

  const getIcon = () => {
    switch (activeToast.type) {
      case 'budget_change':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'access_request':
        return <Mail className="w-4 h-4 text-amber-600" />;
      case 'status_update':
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 animate-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold text-slate-900 truncate">
              {activeToast.title}
            </span>
            <span className="text-[10px] text-slate-400 font-mono shrink-0">
              {activeToast.timestamp}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5 leading-snug">
            {activeToast.message}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="bg-slate-100 px-1 py-0.2 rounded font-medium text-slate-600">
              {activeToast.group}
            </span>
            <span>觸發：{activeToast.actorName}</span>
          </div>
        </div>
        <button
          onClick={dismissToast}
          className="text-slate-400 hover:text-slate-600 p-1 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
