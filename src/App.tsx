import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AccessBanner } from './components/AccessBanner';
import { ProgressStrip } from './components/ProgressStrip';
import { PhaseChecklist } from './components/PhaseChecklist';
import { TeamBoard } from './components/TeamBoard';
import { DeliverablesLedger } from './components/DeliverablesLedger';
import { BudgetAndRules } from './components/BudgetAndRules';
import { AdminPortal } from './components/AdminPortal';
import { TaskModal } from './components/TaskModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { GoogleDocsExportModal } from './components/GoogleDocsExportModal';
import { ToastAlert } from './components/ToastAlert';
import { TaskItem } from './types';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleEditTask = (task: TaskItem) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenAddTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* 3-Zone Top Navigation Header */}
      <Header
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Read-Only Notice Banner for Unauthorized Visitors */}
      <AccessBanner />

      {/* Executive Progress & Filter Toolbar */}
      <ProgressStrip onOpenAddTaskModal={handleOpenAddTask} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'checklist' && (
          <PhaseChecklist onEditTask={handleEditTask} />
        )}

        {activeTab === 'teamboard' && (
          <TeamBoard onEditTask={handleEditTask} />
        )}

        {activeTab === 'deliverables' && (
          <DeliverablesLedger />
        )}

        {activeTab === 'budget' && (
          <BudgetAndRules />
        )}

        {activeTab === 'admin' && (
          <AdminPortal />
        )}
      </main>

      {/* Footer with Attribution and Version */}
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">EventFlow</span>
            <span aria-hidden="true">·</span>
            <span>福委會活動會議程序檢核系統</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-400">V0.1 (2026.10.21)</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Super Admin: philiponchang@gmail.com · Google Docs & Drive Integration Active
          </div>
        </div>
      </footer>

      {/* Modals & Slide-over Drawers */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <GoogleDocsExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Real-time Toast Alerts */}
      <ToastAlert />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
