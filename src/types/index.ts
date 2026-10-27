export type CommitteeGroup = '行政' | '財務' | '總務' | '活動' | '全體委員';

export type TaskStatus = 'not_started' | 'in_progress' | 'under_review' | 'completed' | 'blocked';

export type UserRole = 'super_admin' | 'chairperson' | 'committee_member' | 'viewer';

export type MemberStatus = 'active' | 'pending_approval' | 'rejected';

export interface TaskItem {
  id: string;
  code: string; // e.g. "O.O", "A.1", "B.4", "C.3", "D", "E"
  phaseId: string;
  title: string;
  group: CommitteeGroup;
  leadTime: string; // e.g. "D-4M", "D-3M", "D-2Week", "D-2Days", "晚宴當天", "會後 1 週"
  startDate?: string; // e.g. "2026-10-21"
  targetDate?: string; // e.g. "2026-10-28"
  timePeriod?: string; // e.g. "2026.10.21 - 2026.10.28" (執行期間)
  deliverables: string;
  status: TaskStatus;
  assignee: string; // e.g. "Bear", "Amos", "Philip", "Ann"
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  recurringRule?: string; // e.g. "Weekly check-in", "Bi-weekly review", "Milestone D-date"
  completedAt?: string;
  lastUpdated?: string;
  overrunRisk?: boolean;
}

export interface PhaseSection {
  id: string;
  order: number;
  code: string; // e.g. "Phase 1"
  name: string; // e.g. "Initiation & Planning Phase"
  subtitle: string;
  description: string;
  timePeriod?: string; // e.g. "2026.10 - 2026.11 (D-4M ~ D-3M)"
  startDate?: string; // e.g. "2026-10-20"
  endDate?: string; // e.g. "2026-11-15"
  wrapUpNotes: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  group: CommitteeGroup;
  status: MemberStatus;
  canEdit: boolean;
  avatarUrl?: string;
  invitedBy?: string;
  registeredAt: string;
}

export interface ActivityBudget {
  totalBudget: number;
  contingencyBudget: number; // 預備金
  allocations: {
    category: string; // e.g. "尾牙晚宴 (40%)", "員工旅遊 (30%)", "三節與慶生 (20%)", "預備金 (10%)"
    percentage: number;
    allocatedAmount: number;
    spentAmount: number;
  }[];
  changeRequests: {
    id: string;
    title: string;
    applicant: string;
    group: CommitteeGroup;
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
    decisionBy?: string;
  }[];
}

export interface DecisionRules {
  generalRules: string[];
  nonMajorityRules: string[]; // 預算超支、特別專案、高層指派任務、法遵議題、時效緊迫、利益衝突
  executiveSignOffItems: string[]; // 預算計畫、外部協力廠商委外、時程、執行方式
}

export interface ActivityPlan {
  id: string;
  title: string;
  version: string;
  date: string; // e.g. "2026.10.21"
  eventTargetDate: string; // Target D-Day e.g. "2027.01.15"
  organization: string; // "福委會"
  chairperson: string; // "Bear"
  phases: PhaseSection[];
  tasks: TaskItem[];
  budget: ActivityBudget;
  decisionRules: DecisionRules;
}

export interface StakeholderNotification {
  id: string;
  title: string;
  message: string;
  group: CommitteeGroup;
  type: 'status_update' | 'deadline_alert' | 'access_request' | 'export_event' | 'budget_change';
  timestamp: string;
  read: boolean;
  taskId?: string;
  actorName: string;
}
