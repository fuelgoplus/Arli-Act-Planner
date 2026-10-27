import { StakeholderNotification, TaskItem, CommitteeGroup, ActivityPlan } from '../types';
import { INITIAL_NOTIFICATIONS } from '../data/initialData';

const NOTIFICATIONS_STORAGE_KEY = 'eventflow_notifications_v1';
const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('eventflow_channel') : null;

export const loadStoredNotifications = (): StakeholderNotification[] => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load notifications from storage:', err);
  }
  return INITIAL_NOTIFICATIONS;
};

export const saveStoredNotifications = (notifications: StakeholderNotification[]) => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.error('Failed to save notifications to storage:', err);
  }
};

export const sendNotification = (
  title: string,
  message: string,
  group: CommitteeGroup,
  type: StakeholderNotification['type'],
  actorName: string,
  taskId?: string
): StakeholderNotification => {
  const newNotif: StakeholderNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title,
    message,
    group,
    type,
    timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }),
    read: false,
    taskId,
    actorName,
  };

  const existing = loadStoredNotifications();
  const updated = [newNotif, ...existing];
  saveStoredNotifications(updated);

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'NEW_NOTIFICATION', notification: newNotif });
  }

  return newNotif;
};

export const subscribeToNotifications = (callback: (notif: StakeholderNotification) => void) => {
  if (!broadcastChannel) return () => {};

  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'NEW_NOTIFICATION' && event.data.notification) {
      callback(event.data.notification);
    }
  };

  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel.removeEventListener('message', handler);
  };
};

export interface ProgressSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  underReviewTasks: number;
  blockedTasks: number;
  notStartedTasks: number;
  completionRate: number;
  groupStats: {
    group: CommitteeGroup;
    total: number;
    completed: number;
    rate: number;
  }[];
  phaseStats: {
    phaseId: string;
    phaseName: string;
    total: number;
    completed: number;
    rate: number;
  }[];
}

export const calculateProgressSummary = (plan: ActivityPlan): ProgressSummary => {
  const tasks = plan.tasks;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const underReviewTasks = tasks.filter(t => t.status === 'under_review').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
  const notStartedTasks = tasks.filter(t => t.status === 'not_started').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const groups: CommitteeGroup[] = ['行政', '財務', '總務', '活動'];
  const groupStats = groups.map(group => {
    const groupTasks = tasks.filter(t => t.group === group);
    const completed = groupTasks.filter(t => t.status === 'completed').length;
    return {
      group,
      total: groupTasks.length,
      completed,
      rate: groupTasks.length > 0 ? Math.round((completed / groupTasks.length) * 100) : 0,
    };
  });

  const phaseStats = plan.phases.map(phase => {
    const phaseTasks = tasks.filter(t => t.phaseId === phase.id);
    const completed = phaseTasks.filter(t => t.status === 'completed').length;
    return {
      phaseId: phase.id,
      phaseName: phase.code,
      total: phaseTasks.length,
      completed,
      rate: phaseTasks.length > 0 ? Math.round((completed / phaseTasks.length) * 100) : 0,
    };
  });

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    underReviewTasks,
    blockedTasks,
    notStartedTasks,
    completionRate,
    groupStats,
    phaseStats,
  };
};
