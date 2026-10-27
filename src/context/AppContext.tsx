import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ActivityPlan,
  PhaseSection,
  TaskItem,
  TeamMember,
  StakeholderNotification,
  CommitteeGroup,
  TaskStatus,
  UserRole,
  PhaseHistoryEntry,
} from '../types';
import { INITIAL_ACTIVITY_PLAN } from '../data/initialData';
import { loadStoredMembers, saveStoredMembers } from '../services/auth';
import {
  loadStoredNotifications,
  saveStoredNotifications,
  sendNotification,
  subscribeToNotifications,
  calculateProgressSummary,
  ProgressSummary,
} from '../services/notificationService';

const PLAN_STORAGE_KEY = 'eventflow_activity_plan_v1';

interface AppContextType {
  plan: ActivityPlan;
  members: TeamMember[];
  currentUser: TeamMember;
  notifications: StakeholderNotification[];
  unreadNotifsCount: number;
  activeTab: 'checklist' | 'teamboard' | 'deliverables' | 'budget' | 'admin';
  selectedGroupFilter: CommitteeGroup | 'all';
  searchQuery: string;
  progressSummary: ProgressSummary;
  activeToast: StakeholderNotification | null;
  googleToken: string | null;
  
  // Actions
  setActiveTab: (tab: 'checklist' | 'teamboard' | 'deliverables' | 'budget' | 'admin') => void;
  setSelectedGroupFilter: (group: CommitteeGroup | 'all') => void;
  setSearchQuery: (query: string) => void;
  setCurrentUser: (member: TeamMember) => void;
  setGoogleToken: (token: string | null) => void;
  
  // Plan Mutations
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTask: (task: TaskItem) => void;
  updatePhase: (phaseId: string, updates: Partial<PhaseSection>) => void;
  updateEventTargetDate: (newDDay: string) => void;
  addTask: (task: Omit<TaskItem, 'id'>) => void;
  deleteTask: (taskId: string) => void;
  addPhaseLogEntry: (phaseId: string, entry: Omit<PhaseHistoryEntry, 'id' | 'timestamp'> & { timestamp?: string }) => void;
  deletePhaseLogEntry: (phaseId: string, logId: string) => void;
  resetToInitialPlan: () => void;

  // Budget & Decision
  submitChangeRequest: (title: string, amount: number, reason: string, group: CommitteeGroup) => void;
  reviewChangeRequest: (requestId: string, approved: boolean) => void;

  // Member & RBAC Management
  inviteMember: (email: string, name: string, group: CommitteeGroup, role: TeamMember['role']) => void;
  updateMember: (memberId: string, updates: Partial<TeamMember>) => void;
  deleteMember: (memberId: string) => void;
  approveMemberRegistration: (memberId: string) => void;
  rejectMemberRegistration: (memberId: string) => void;
  toggleMemberEditPermission: (memberId: string) => void;
  requestEditAccess: (name: string, email: string, note?: string) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  dismissToast: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Plan state
  const [plan, setPlan] = useState<ActivityPlan>(() => {
    try {
      const saved = localStorage.getItem(PLAN_STORAGE_KEY);
      if (saved) {
        const parsed: ActivityPlan = JSON.parse(saved);
        // Ensure phases contain timePeriod/startDate/endDate defaults if loaded from older cache
        if (parsed.phases && Array.isArray(parsed.phases)) {
          parsed.phases = parsed.phases.map(p => {
            const initialMatch = INITIAL_ACTIVITY_PLAN.phases.find(ip => ip.id === p.id);
            return {
              ...p,
              timePeriod: p.timePeriod || initialMatch?.timePeriod || '',
              startDate: p.startDate || initialMatch?.startDate,
              endDate: p.endDate || initialMatch?.endDate,
              historyLogs: p.historyLogs && p.historyLogs.length > 0 ? p.historyLogs : (initialMatch?.historyLogs || []),
            };
          });
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load plan from local storage:', e);
    }
    return INITIAL_ACTIVITY_PLAN;
  });

  // Members state
  const [members, setMembers] = useState<TeamMember[]>(() => loadStoredMembers());

  // Current User (defaults to Super Admin Philip Chang)
  const [currentUser, setCurrentUser] = useState<TeamMember>(() => {
    const list = loadStoredMembers();
    return list.find(m => m.role === 'super_admin') || list[0];
  });

  // Notifications state
  const [notifications, setNotifications] = useState<StakeholderNotification[]>(() => loadStoredNotifications());
  const [activeToast, setActiveToast] = useState<StakeholderNotification | null>(null);

  // Google OAuth Access Token
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  // Navigation & filters
  const [activeTab, setActiveTab] = useState<'checklist' | 'teamboard' | 'deliverables' | 'budget' | 'admin'>('checklist');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<CommitteeGroup | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persist plan
  useEffect(() => {
    try {
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
    } catch (e) {
      console.error('Failed to save plan to storage:', e);
    }
  }, [plan]);

  // Persist members
  useEffect(() => {
    saveStoredMembers(members);
  }, [members]);

  // Sync notifications via BroadcastChannel
  useEffect(() => {
    const unsubscribe = subscribeToNotifications((newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      setActiveToast(newNotif);
    });
    return unsubscribe;
  }, []);

  const triggerNotification = useCallback((
    title: string,
    message: string,
    group: CommitteeGroup,
    type: StakeholderNotification['type'],
    taskId?: string
  ) => {
    const notif = sendNotification(title, message, group, type, currentUser.name, taskId);
    setNotifications(prev => [notif, ...prev]);
    setActiveToast(notif);
  }, [currentUser.name]);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  // Task mutations
  const updateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    if (!currentUser.canEdit) {
      alert('您的帳號為「唯讀模式」，僅預先授權與核准之委員可變更任務狀態。');
      return;
    }

    setPlan(prev => {
      const target = prev.tasks.find(t => t.id === taskId);
      if (!target) return prev;

      const oldStatusLabel = target.status;
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
            lastUpdated: new Date().toISOString(),
          };
        }
        return t;
      });

      const statusNames: Record<TaskStatus, string> = {
        not_started: '待啟動',
        in_progress: '進行中',
        under_review: '審核中',
        completed: '已完成',
        blocked: '遇阻礙',
      };

      triggerNotification(
        `任務進度更新：${target.code}`,
        `${currentUser.name} 將「${target.title}」狀態由 ${statusNames[oldStatusLabel]} 變更為「${statusNames[newStatus]}」`,
        target.group,
        'status_update',
        target.id
      );

      return {
        ...prev,
        tasks: updatedTasks,
      };
    });
  }, [currentUser, triggerNotification]);

  const updateTask = useCallback((updated: TaskItem) => {
    if (!currentUser.canEdit) {
      alert('您的帳號為「唯讀模式」，僅預先授權與核准之委員可編輯此任務。');
      return;
    }

    setPlan(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updated.id ? { ...updated, lastUpdated: new Date().toISOString() } : t),
    }));

    triggerNotification(
      `任務內容修訂：${updated.code}`,
      `${currentUser.name} 修訂了「${updated.title}」之交付項目與時程。`,
      updated.group,
      'status_update',
      updated.id
    );
  }, [currentUser, triggerNotification]);

  const updatePhase = useCallback((phaseId: string, updates: Partial<PhaseSection>) => {
    if (!currentUser.canEdit) {
      return;
    }

    setPlan(prev => ({
      ...prev,
      phases: prev.phases.map(p => p.id === phaseId ? { ...p, ...updates } : p),
    }));

    const targetPhase = plan.phases.find(p => p.id === phaseId);
    triggerNotification(
      `階段時程設定已自動儲存`,
      `${currentUser.name} 已在線更新「${targetPhase?.code || ''}」執行時程設定。`,
      '全體委員',
      'status_update'
    );
  }, [currentUser, plan.phases, triggerNotification]);

  const updateEventTargetDate = useCallback((newDDay: string) => {
    if (!currentUser.canEdit) {
      alert('您的帳號為「唯讀模式」，僅授權委員可設定晚會目標日。');
      return;
    }

    setPlan(prev => ({
      ...prev,
      eventTargetDate: newDDay,
    }));

    triggerNotification(
      `晚會目標日 (D-Day) 設定已更新`,
      `${currentUser.name} 已將晚會目標基準日 (D-Day) 更新為「${newDDay}」。`,
      '全體委員',
      'status_update'
    );
  }, [currentUser, triggerNotification]);

  const addTask = useCallback((taskData: Omit<TaskItem, 'id'>) => {
    if (!currentUser.canEdit) {
      alert('您的帳號為「唯讀模式」，無新增任務權限。');
      return;
    }

    const newTask: TaskItem = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      lastUpdated: new Date().toISOString(),
    };

    setPlan(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));

    triggerNotification(
      `新增工作項目：${newTask.code}`,
      `${currentUser.name} 於 ${newTask.group}組 新增了「${newTask.title}」。`,
      newTask.group,
      'status_update',
      newTask.id
    );
  }, [currentUser, triggerNotification]);

  const deleteTask = useCallback((taskId: string) => {
    if (!currentUser.canEdit) {
      return;
    }

    const task = plan.tasks.find(t => t.id === taskId);
    if (!task) return;

    setPlan(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId),
    }));

    triggerNotification(
      `工作項目已刪除`,
      `${currentUser.name} 刪除了 ${task.group}組 的「${task.code} ${task.title}」。`,
      task.group,
      'status_update'
    );
  }, [currentUser, plan.tasks, triggerNotification]);

  const addPhaseLogEntry = useCallback((
    phaseId: string,
    entry: Omit<PhaseHistoryEntry, 'id' | 'timestamp'> & { timestamp?: string }
  ) => {
    if (!currentUser.canEdit) {
      alert('您的帳號為「唯讀模式」，僅授權委員可新增活動歷程與變更紀錄。');
      return;
    }

    const newLog: PhaseHistoryEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      phaseId,
      timestamp: entry.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 16),
      authorName: entry.authorName || currentUser.name,
      authorRole: entry.authorRole || currentUser.role,
      authorEmail: entry.authorEmail || currentUser.email,
    };

    setPlan(prev => {
      const updatedPhases = prev.phases.map(p => {
        if (p.id === phaseId) {
          const currentLogs = p.historyLogs || [];
          return {
            ...p,
            historyLogs: [newLog, ...currentLogs],
          };
        }
        return p;
      });
      return {
        ...prev,
        phases: updatedPhases,
      };
    });

    const targetPhase = plan.phases.find(p => p.id === phaseId);
    triggerNotification(
      `階段歷程紀錄 [${targetPhase?.code || ''}]：${newLog.title}`,
      `${currentUser.name} 於 ${targetPhase?.name || '此階段'} 登記了新事件/變更：「${newLog.title}」`,
      '全體委員',
      'status_update'
    );
  }, [currentUser, plan.phases, triggerNotification]);

  const deletePhaseLogEntry = useCallback((phaseId: string, logId: string) => {
    if (!currentUser.canEdit) {
      alert('您的帳號為「唯讀模式」，無刪除紀錄權限。');
      return;
    }

    setPlan(prev => {
      const updatedPhases = prev.phases.map(p => {
        if (p.id === phaseId) {
          return {
            ...p,
            historyLogs: (p.historyLogs || []).filter(l => l.id !== logId),
          };
        }
        return p;
      });
      return {
        ...prev,
        phases: updatedPhases,
      };
    });

    triggerNotification(
      `歷程紀錄已移除`,
      `${currentUser.name} 移除了階段中的一筆歷程變更記錄。`,
      '全體委員',
      'status_update'
    );
  }, [currentUser, triggerNotification]);

  const resetToInitialPlan = useCallback(() => {
    setPlan(INITIAL_ACTIVITY_PLAN);
    localStorage.removeItem(PLAN_STORAGE_KEY);
    triggerNotification(
      '系統資料已重設',
      '已恢復為福委會會議程序 V0.1 標準尾牙籌辦檢核表。',
      '全體委員',
      'status_update'
    );
  }, [triggerNotification]);

  // Budget changes
  const submitChangeRequest = useCallback((title: string, amount: number, reason: string, group: CommitteeGroup) => {
    const newRequest = {
      id: `cr-${Date.now()}`,
      title,
      applicant: currentUser.name,
      group,
      amount,
      reason,
      status: 'pending' as const,
      requestedAt: new Date().toISOString().split('T')[0],
    };

    setPlan(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        changeRequests: [newRequest, ...prev.budget.changeRequests],
      },
    }));

    triggerNotification(
      `提出預算變更申請`,
      `${currentUser.name} 提交了「${title}」(金額 NT$ ${amount.toLocaleString()})，等待主委與財務審核。`,
      '財務',
      'budget_change'
    );
  }, [currentUser.name, triggerNotification]);

  const reviewChangeRequest = useCallback((requestId: string, approved: boolean) => {
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'chairperson') {
      alert('非多數決特殊專案與超支案件，僅限主委 (行政) 與 Super Admin 核定。');
      return;
    }

    setPlan(prev => {
      const target = prev.budget.changeRequests.find(r => r.id === requestId);
      if (!target) return prev;

      const updatedRequests = prev.budget.changeRequests.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: approved ? ('approved' as const) : ('rejected' as const),
            decisionBy: currentUser.name,
          };
        }
        return r;
      });

      triggerNotification(
        `預算變更申請 ${approved ? '已核准' : '已駁回'}`,
        `${currentUser.name} 已${approved ? '核准' : '駁回'}「${target.title}」(NT$ ${target.amount.toLocaleString()})。`,
        '財務',
        'budget_change'
      );

      return {
        ...prev,
        budget: {
          ...prev.budget,
          changeRequests: updatedRequests,
        },
      };
    });
  }, [currentUser, triggerNotification]);

  // Member Management & Authorization
  const inviteMember = useCallback((email: string, name: string, group: CommitteeGroup, role: TeamMember['role']) => {
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'chairperson') {
      alert('僅有 Super Admin (或主委) 可授權預先註冊新成員名冊。');
      return;
    }

    const newMember: TeamMember = {
      id: `mem-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      group,
      status: 'active',
      canEdit: role !== 'viewer',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4f46e5`,
      invitedBy: currentUser.name,
      registeredAt: new Date().toISOString().split('T')[0],
    };

    setMembers(prev => [...prev, newMember]);

    triggerNotification(
      '已預先授權新成員',
      `Super Admin ${currentUser.name} 已將 ${name} (${email}) 加入 ${group}組，享有編輯權限。`,
      '行政',
      'access_request'
    );
  }, [currentUser, triggerNotification]);

  const updateMember = useCallback((memberId: string, updates: Partial<TeamMember>) => {
    if (currentUser.role !== 'super_admin') {
      alert('僅有 Super Admin 可調整成員之角色與資料。');
      return;
    }

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        // If role changed to viewer, default canEdit to false unless explicitly specified;
        // if role changed to other roles, default canEdit to true unless explicitly specified
        const updatedCanEdit = updates.canEdit !== undefined
          ? updates.canEdit
          : (updates.role !== undefined ? updates.role !== 'viewer' : m.canEdit);

        return {
          ...m,
          ...updates,
          canEdit: updatedCanEdit,
        };
      }
      return m;
    }));

    const target = members.find(m => m.id === memberId);
    if (target) {
      const roleNames: Record<UserRole, string> = {
        super_admin: 'Super Admin',
        chairperson: '大會主席/主委',
        committee_member: '執行委員',
        viewer: '觀察員(唯讀)',
      };
      const roleText = updates.role ? `，角色調整為「${roleNames[updates.role] || updates.role}」` : '';
      const groupText = updates.group ? `，組別調整為「${updates.group}組」` : '';

      triggerNotification(
        '成員權限角色調整',
        `Super Admin 已在線調整 ${target.name} 之權限資料${roleText}${groupText}。`,
        updates.group || target.group,
        'access_request'
      );
    }
  }, [currentUser.role, members, triggerNotification]);

  const deleteMember = useCallback((memberId: string) => {
    const target = members.find(m => m.id === memberId);
    if (!target) return;
    if (target.role === 'super_admin') {
      triggerNotification(
        '無法移除最高管理員',
        'Super Admin 為系統最高權限擁有者，不可自名冊中移除。',
        target.group,
        'access_request'
      );
      return;
    }

    setMembers(prev => prev.filter(m => m.id !== memberId));
    triggerNotification(
      '委員已從名冊移除',
      `已將 ${target.name} (${target.email}) 從已登錄委員名冊中移除。`,
      target.group,
      'access_request'
    );
  }, [members, triggerNotification]);

  const approveMemberRegistration = useCallback((memberId: string) => {
    if (currentUser.role !== 'super_admin') {
      alert('僅有 Super Admin 擁有審核授權成員註冊之最終職權。');
      return;
    }

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          status: 'active',
          canEdit: true,
          role: m.role === 'viewer' ? 'committee_member' : m.role,
        };
      }
      return m;
    }));

    const member = members.find(m => m.id === memberId);
    if (member) {
      triggerNotification(
        '成員註冊已核准',
        `Super Admin 已核准 ${member.name} (${member.email}) 之編輯權限。`,
        '行政',
        'access_request'
      );
    }
  }, [currentUser.role, members, triggerNotification]);

  const rejectMemberRegistration = useCallback((memberId: string) => {
    if (currentUser.role !== 'super_admin') {
      alert('僅有 Super Admin 可駁回註冊申請。');
      return;
    }

    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: 'rejected', canEdit: false } : m));
  }, [currentUser.role]);

  const toggleMemberEditPermission = useCallback((memberId: string) => {
    if (currentUser.role !== 'super_admin') {
      alert('僅有 Super Admin 可切換成員之編輯許可權。');
      return;
    }

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return { ...m, canEdit: !m.canEdit };
      }
      return m;
    }));
  }, [currentUser.role]);

  const requestEditAccess = useCallback((name: string, email: string, note?: string) => {
    // Check if member already exists
    const existing = members.find(m => m.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      if (existing.canEdit) {
        alert('此 Email 已經享有編輯權限！');
        return;
      }
      setMembers(prev => prev.map(m => m.id === existing.id ? { ...m, status: 'pending_approval' } : m));
    } else {
      const newPending: TeamMember = {
        id: `mem-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        role: 'viewer',
        group: '活動',
        status: 'pending_approval',
        canEdit: false,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=94a3b8`,
        registeredAt: new Date().toISOString().split('T')[0],
      };
      setMembers(prev => [...prev, newPending]);
    }

    triggerNotification(
      '收到新的編輯權限申請',
      `${name} (${email}) 已提出編輯授權申請${note ? `：${note}` : ''}。請 Super Admin 審核。`,
      '行政',
      'access_request'
    );
  }, [members, triggerNotification]);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveStoredNotifications(updated);
      return updated;
    });
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveStoredNotifications(updated);
      return updated;
    });
  }, []);

  const unreadNotifsCount = notifications.filter(n => !n.read).length;
  const progressSummary = calculateProgressSummary(plan);

  return (
    <AppContext.Provider
      value={{
        plan,
        members,
        currentUser,
        notifications,
        unreadNotifsCount,
        activeTab,
        selectedGroupFilter,
        searchQuery,
        progressSummary,
        activeToast,
        googleToken,
        setActiveTab,
        setSelectedGroupFilter,
        setSearchQuery,
        setCurrentUser,
        setGoogleToken,
        updateTaskStatus,
        updateTask,
        updatePhase,
        updateEventTargetDate,
        addTask,
        deleteTask,
        addPhaseLogEntry,
        deletePhaseLogEntry,
        resetToInitialPlan,
        submitChangeRequest,
        reviewChangeRequest,
        inviteMember,
        updateMember,
        deleteMember,
        approveMemberRegistration,
        rejectMemberRegistration,
        toggleMemberEditPermission,
        requestEditAccess,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
